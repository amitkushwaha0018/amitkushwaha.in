/**
 * Cloudflare Worker — YouTube Downloader API Backend
 * Handles /api/info and /api/download via YouTube InnerTube API
 * No Python needed — runs 100% on Cloudflare edge servers worldwide
 */

const INNERTUBE_API_KEY = 'AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8';
const INNERTUBE_CLIENT = {
  clientName: 'WEB',
  clientVersion: '2.20231121.09.00',
  hl: 'en',
  gl: 'US',
};

// CORS headers for all responses
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

function formatSize(bytes) {
  if (!bytes) return 'N/A';
  if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + ' GB';
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return bytes + ' B';
}

function formatDuration(seconds) {
  if (!seconds) return 'Unknown';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h > 0
    ? `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
    : `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

async function getVideoInfo(videoId) {
  const res = await fetch(
    `https://www.youtube.com/youtubei/v1/player?key=${INNERTUBE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' },
      body: JSON.stringify({
        videoId,
        context: { client: INNERTUBE_CLIENT },
        playbackContext: { contentPlaybackContext: { signatureTimestamp: 19950 } },
      }),
    }
  );
  return res.json();
}

async function handleInfo(request) {
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid JSON body' }, 400); }

  const url = body.url?.trim();
  if (!url) return json({ error: 'Please provide a YouTube URL' }, 400);

  const videoId = extractVideoId(url);
  if (!videoId) return json({ error: 'Invalid YouTube URL' }, 400);

  let data;
  try { data = await getVideoInfo(videoId); } catch (e) {
    return json({ error: 'Failed to reach YouTube. Try again.' }, 500);
  }

  const details = data?.videoDetails;
  if (!details) return json({ error: 'Could not fetch video details. Video may be private or unavailable.' }, 404);

  const streamingData = data?.streamingData;
  const formats = [...(streamingData?.formats || []), ...(streamingData?.adaptiveFormats || [])];

  const seenVideo = new Set();
  const seenAudio = new Set();
  const videoOptions = [];
  const audioOptions = [];

  for (const f of formats) {
    const mime = f.mimeType || '';
    const height = f.height;
    const hasVideo = mime.includes('video');
    const hasAudio = mime.includes('audio') || f.audioQuality;
    const isVideoOnly = hasVideo && !f.audioSampleRate;
    const isAudioOnly = !hasVideo && hasAudio;
    const isCombined = hasVideo && f.audioSampleRate;

    if ((hasVideo && height) && !isAudioOnly) {
      const key = `${height}p`;
      if (!seenVideo.has(key)) {
        seenVideo.add(key);
        const label =
          height >= 2160 ? `${height}p 4K Ultra HD (Original)` :
          height >= 1440 ? `${height}p 2K QHD (Original)` :
          height >= 720  ? `${height}p HD (Original)` :
                           `${height}p (Original)`;
        videoOptions.push({
          format_id: f.itag.toString(),
          quality: `${height}p`,
          resolution: label,
          ext: 'mp4',
          filesize_str: formatSize(f.contentLength ? parseInt(f.contentLength) : null),
          fps: f.fps || 30,
          has_audio: !!f.audioSampleRate,
          url: f.url,
        });
      }
    }

    if (isAudioOnly || (hasAudio && !hasVideo)) {
      const abr = f.averageBitrate ? Math.round(f.averageBitrate / 1000) : 128;
      const key = `${abr}kbps`;
      if (!seenAudio.has(key)) {
        seenAudio.add(key);
        audioOptions.push({
          format_id: f.itag.toString(),
          quality: `${abr} kbps Original`,
          ext: 'mp3',
          filesize_str: formatSize(f.contentLength ? parseInt(f.contentLength) : null),
          bitrate: abr,
          url: f.url,
        });
      }
    }
  }

  videoOptions.sort((a, b) => parseInt(b.quality) - parseInt(a.quality));
  audioOptions.sort((a, b) => b.bitrate - a.bitrate);

  if (audioOptions.length === 0) {
    audioOptions.push({ format_id: 'bestaudio', quality: '128 kbps Original', ext: 'mp3', filesize_str: 'Auto', bitrate: 128, url: null });
  }

  return json({
    id: videoId,
    title: details.title || 'Unknown Title',
    thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    duration: formatDuration(parseInt(details.lengthSeconds || 0)),
    duration_sec: parseInt(details.lengthSeconds || 0),
    channel: details.author || 'Unknown Channel',
    views: parseInt(details.viewCount || 0).toLocaleString(),
    video_options: videoOptions,
    audio_options: audioOptions,
  });
}

async function handleDownload(request) {
  const { searchParams } = new URL(request.url);
  const formatUrl = searchParams.get('stream_url');
  const filename = searchParams.get('filename') || 'download.mp4';
  const type = searchParams.get('type') || 'video';

  if (!formatUrl) return json({ error: 'Missing stream URL' }, 400);

  // Proxy the YouTube stream directly to user
  try {
    const upstream = await fetch(decodeURIComponent(formatUrl), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.youtube.com/',
        'Origin': 'https://www.youtube.com',
      },
    });

    const contentType = type === 'audio' ? 'audio/mpeg' : 'video/mp4';
    const headers = new Headers({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Access-Control-Allow-Origin': '*',
    });

    if (upstream.headers.get('content-length')) {
      headers.set('Content-Length', upstream.headers.get('content-length'));
    }

    return new Response(upstream.body, { status: 200, headers });
  } catch (e) {
    return json({ error: 'Failed to proxy stream: ' + e.message }, 500);
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, '') || '/';

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    // API Routes
    if (path === '/api/info' && request.method === 'POST') {
      return handleInfo(request);
    }

    if (path === '/api/download' && request.method === 'GET') {
      return handleDownload(request);
    }

    if (path === '/api/progress') {
      return json({ status: 'downloading', percent: 50, downloaded_str: 'Streaming...', total_str: 'Live Stream', speed_str: 'Direct Stream', eta_str: '...' });
    }

    // Serve static assets (handled by Cloudflare Assets binding)
    return env.ASSETS.fetch(request);
  },
};
