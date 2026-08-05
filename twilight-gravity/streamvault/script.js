let currentVideoData = null;

const API_BASE_URL = (window.location.protocol === 'file:' || !window.location.origin.includes('5000'))
  ? 'http://127.0.0.1:5000'
  : '';

document.addEventListener('DOMContentLoaded', () => {
  const videoUrlInput = document.getElementById('video-url');
  const pasteBtn = document.getElementById('paste-btn');
  const fetchBtn = document.getElementById('fetch-btn');

  // Paste from clipboard button
  pasteBtn.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        videoUrlInput.value = text;
        showStatus('Pasted from clipboard!', 'info');
      }
    } catch (err) {
      showStatus('Unable to access clipboard. Please paste manually.', 'error');
    }
  });

  // Fetch button trigger
  fetchBtn.addEventListener('click', () => {
    processUrl();
  });

  // Enter key trigger
  videoUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      processUrl();
    }
  });
});

async function processUrl() {
  const input = document.getElementById('video-url');
  const url = input.value.trim();

  if (!url) {
    showStatus('Please enter a YouTube video URL.', 'error');
    return;
  }

  if (!isValidYoutubeUrl(url)) {
    showStatus('Invalid YouTube URL! Please enter a valid youtube.com or youtu.be link.', 'error');
    return;
  }

  showStatus('Connecting to server & extracting video info...', 'info', true);
  hideResultCard();

  try {
    const response = await fetch(`${API_BASE_URL}/api/info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      showStatus(data.error || 'Failed to fetch video details.', 'error');
      return;
    }

    currentVideoData = data;
    currentVideoData.original_url = url;
    displayResults(data);
    hideStatus();

  } catch (err) {
    showStatus(`Connection error: ${err.message}. Is the backend server running on http://127.0.0.1:5000?`, 'error');
  }
}

function displayResults(data) {
  document.getElementById('meta-thumb').src = data.thumbnail;
  document.getElementById('meta-title').textContent = data.title;
  document.getElementById('meta-channel').textContent = data.channel;
  document.getElementById('meta-views').textContent = data.views;
  document.getElementById('meta-duration').textContent = data.duration;

  // Reset Trimmer Controls
  document.getElementById('enable-trimmer').checked = false;
  document.getElementById('trimmer-controls').classList.add('hidden');
  document.getElementById('trim-duration-badge').classList.add('hidden');
  document.getElementById('trim-start').value = "00:00:00";
  
  if (data.duration_sec) {
    document.getElementById('trim-end').value = formatSecondsToTime(data.duration_sec);
  } else {
    document.getElementById('trim-end').value = "00:01:00";
  }

  renderVideoFormats(data.video_options);
  renderAudioFormats(data.audio_options);

  // Default to Video tab
  switchTab('video');

  const resultContainer = document.getElementById('result-container');
  resultContainer.classList.remove('hidden');
}

function toggleTrimmer() {
  const isChecked = document.getElementById('enable-trimmer').checked;
  const controls = document.getElementById('trimmer-controls');
  const badge = document.getElementById('trim-duration-badge');

  if (isChecked) {
    controls.classList.remove('hidden');
    badge.classList.remove('hidden');
    updateTrimDuration();
  } else {
    controls.classList.add('hidden');
    badge.classList.add('hidden');
  }
}

function applyPreset(preset) {
  if (!currentVideoData) return;

  const startInput = document.getElementById('trim-start');
  const endInput = document.getElementById('trim-end');

  startInput.value = "00:00:00";

  if (preset === 'reset') {
    endInput.value = formatSecondsToTime(currentVideoData.duration_sec || 60);
  } else if (typeof preset === 'number') {
    const endSec = Math.min(preset, currentVideoData.duration_sec || preset);
    endInput.value = formatSecondsToTime(endSec);
  }

  updateTrimDuration();
}

function updateTrimDuration() {
  const startVal = document.getElementById('trim-start').value;
  const endVal = document.getElementById('trim-end').value;
  const badge = document.getElementById('trim-duration-badge');

  const startSec = timeToSeconds(startVal);
  const endSec = timeToSeconds(endVal);

  if (startSec !== null && endSec !== null && endSec > startSec) {
    const diff = endSec - startSec;
    badge.textContent = `Selected Clip: ${formatSecondsToTime(diff)}`;
    badge.style.borderColor = 'rgba(6, 182, 212, 0.4)';
  } else {
    badge.textContent = 'Invalid Time Range';
    badge.style.borderColor = 'rgba(239, 68, 68, 0.4)';
  }
}

function renderVideoFormats(options) {
  const container = document.getElementById('video-formats');
  container.innerHTML = '';

  if (!options || options.length === 0) {
    container.innerHTML = '<p class="opt-details">No specific video resolutions extracted. Default best video will be downloaded.</p>';
    return;
  }

  options.forEach((opt) => {
    const card = document.createElement('div');
    card.className = 'option-card';

    const qualityLabel = opt.quality || '720p';
    const heightVal = parseInt(qualityLabel.replace('p', '')) || 720;
    
    let badgeText = '';
    let badgeClass = 'opt-badge';

    if (heightVal >= 2160) {
      badgeText = '4K Ultra HD';
      badgeClass += ' badge-4k';
    } else if (heightVal >= 1440) {
      badgeText = '2K QHD';
      badgeClass += ' badge-2k';
    } else if (heightVal >= 720) {
      badgeText = 'HD';
    }

    if (opt.fps && parseInt(opt.fps) > 30) {
      badgeText += ` ${parseInt(opt.fps)}fps`;
    }

    const badgeHtml = badgeText ? `<span class="${badgeClass}">${badgeText}</span>` : '';

    card.innerHTML = `
      <div>
        <div class="opt-quality">${qualityLabel} ${badgeHtml}</div>
        <div class="opt-details">
          <span>Format: MP4 / WebM</span>
          <span>•</span>
          <span>Size: ${opt.filesize_str || 'Auto'}</span>
        </div>
      </div>
      <button class="download-btn" onclick="startDownload('${opt.format_id}', 'video', '${qualityLabel}')">
        <i class="fa-solid fa-download"></i> Download
      </button>
    `;
    container.appendChild(card);
  });
}

function renderAudioFormats(options) {
  const container = document.getElementById('audio-formats');
  container.innerHTML = '';

  if (!options || options.length === 0) {
    container.innerHTML = '<p class="opt-details">Default 320kbps MP3 audio stream available.</p>';
    return;
  }

  options.forEach((opt) => {
    const card = document.createElement('div');
    card.className = 'option-card';

    const qualityLabel = opt.quality || '320 kbps';
    const isHigh = parseInt(qualityLabel) >= 256;
    const badgeHtml = isHigh ? '<span class="opt-badge">HQ Audio</span>' : '';

    card.innerHTML = `
      <div>
        <div class="opt-quality">${qualityLabel} ${badgeHtml}</div>
        <div class="opt-details">
          <span>Format: MP3</span>
          <span>•</span>
          <span>Size: ${opt.filesize_str || 'Auto'}</span>
        </div>
      </div>
      <button class="download-btn" onclick="startDownload('${opt.format_id}', 'audio', '${qualityLabel}')">
        <i class="fa-solid fa-download"></i> Download
      </button>
    `;
    container.appendChild(card);
  });
}

function switchTab(type) {
  const tabVideo = document.getElementById('tab-video');
  const tabAudio = document.getElementById('tab-audio');
  const videoGrid = document.getElementById('video-formats');
  const audioGrid = document.getElementById('audio-formats');

  if (type === 'video') {
    tabVideo.classList.add('active');
    tabAudio.classList.remove('active');
    videoGrid.classList.remove('hidden');
    audioGrid.classList.add('hidden');
  } else {
    tabAudio.classList.add('active');
    tabVideo.classList.remove('active');
    audioGrid.classList.remove('hidden');
    videoGrid.classList.add('hidden');
  }
}

async function startDownload(formatId, mediaType, quality) {
  if (!currentVideoData || !currentVideoData.original_url) {
    showStatus('Invalid download request context.', 'error');
    return;
  }

  const progressBox = document.getElementById('download-progress-box');
  const statusText = document.getElementById('progress-status-text');
  const percentText = document.getElementById('progress-percent');
  const fillBar = document.getElementById('progress-bar-fill');

  progressBox.classList.remove('hidden');
  statusText.textContent = `Processing & downloading ${mediaType.toUpperCase()} (${quality})... Please wait.`;
  fillBar.style.width = '15%';
  percentText.textContent = '15%';

  // Check if Trimmer is enabled
  let startParam = '';
  let endParam = '';
  const isTrimmerEnabled = document.getElementById('enable-trimmer').checked;

  if (isTrimmerEnabled) {
    const sVal = document.getElementById('trim-start').value.trim();
    const eVal = document.getElementById('trim-end').value.trim();
    if (sVal) startParam = `&start_time=${encodeURIComponent(sVal)}`;
    if (eVal) endParam = `&end_time=${encodeURIComponent(eVal)}`;
    statusText.textContent = `Trimming & rendering ${mediaType.toUpperCase()} clip... Please wait.`;
  }

  // Construct download API URL
  const downloadUrl = `${API_BASE_URL}/api/download?url=${encodeURIComponent(currentVideoData.original_url)}&format_id=${encodeURIComponent(formatId)}&type=${encodeURIComponent(mediaType)}&quality=${encodeURIComponent(quality)}&title=${encodeURIComponent(currentVideoData.title)}${startParam}${endParam}`;

  // Simulate smooth progress transition
  let progress = 15;
  const interval = setInterval(() => {
    if (progress < 85) {
      progress += Math.floor(Math.random() * 8) + 3;
      fillBar.style.width = `${progress}%`;
      percentText.textContent = `${progress}%`;
    }
  }, 500);

  try {
    const res = await fetch(downloadUrl);

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Server returned error status ${res.status}`);
    }

    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    clearInterval(interval);
    fillBar.style.width = '100%';
    percentText.textContent = '100%';
    statusText.textContent = 'Download complete! File saved to your downloads folder.';

    const disposition = res.headers.get('Content-Disposition');
    let filename = `${currentVideoData.title}.${mediaType === 'audio' ? 'mp3' : 'mp4'}`;
    if (disposition && disposition.includes('filename=')) {
      filename = disposition.split('filename=')[1].replace(/["']/g, '');
    }

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
      progressBox.classList.add('hidden');
      fillBar.style.width = '0%';
    }, 4000);

  } catch (err) {
    clearInterval(interval);
    progressBox.classList.add('hidden');
    fillBar.style.width = '0%';
    showStatus(`Download error: ${err.message}`, 'error');
  }
}

function isValidYoutubeUrl(url) {
  const p = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
  return p.test(url);
}

function timeToSeconds(str) {
  if (!str) return null;
  const parts = str.trim().split(':');
  try {
    if (parts.length === 3) return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
    if (parts.length === 2) return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    return parseInt(parts[0]);
  } catch (e) {
    return null;
  }
}

function formatSecondsToTime(sec) {
  if (!sec || isNaN(sec)) return "00:00:00";
  const s = Math.floor(sec);
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  if (hrs > 0) {
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function showStatus(msg, type = 'info', spinner = false) {
  const banner = document.getElementById('status-banner');
  const msgEl = document.getElementById('status-message');
  const spinnerIcon = banner.querySelector('.status-spinner');

  banner.className = `status-banner ${type}`;
  msgEl.textContent = msg;

  if (spinner) {
    spinnerIcon.classList.remove('hidden');
  } else {
    spinnerIcon.classList.add('hidden');
  }

  banner.classList.remove('hidden');
}

function hideStatus() {
  document.getElementById('status-banner').classList.add('hidden');
}

function hideResultCard() {
  document.getElementById('result-container').classList.add('hidden');
  document.getElementById('download-progress-box').classList.add('hidden');
}
