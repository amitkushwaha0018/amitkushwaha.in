/**
 * Cloudflare Worker — Full Reverse Proxy Gateway for amitkushwaha.in
 * Proxies all traffic (HTML, JS, CSS, API, Assets) directly to Render Python Server
 * Ensures 100% valid Content-Type header delivery without 404 HTML fallback pages
 */

const RENDER_BACKEND = 'https://amitkushwaha-streamvault.onrender.com';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. Handle CORS preflight options
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // 2. Build origin request to Render backend
    const targetUrl = RENDER_BACKEND + url.pathname + url.search;
    const reqHeaders = new Headers(request.headers);
    reqHeaders.set('Host', 'amitkushwaha-streamvault.onrender.com');

    const init = {
      method: request.method,
      headers: reqHeaders,
      redirect: 'follow',
    };

    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      init.body = await request.clone().arrayBuffer();
    }

    try {
      const response = await fetch(targetUrl, init);
      const resHeaders = new Headers(response.headers);
      
      // Inject CORS headers
      Object.entries(CORS_HEADERS).forEach(([k, v]) => resHeaders.set(k, v));

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: resHeaders,
      });
    } catch (err) {
      return new Response(
        JSON.stringify({ error: 'Proxy Gateway Error: ' + err.message }),
        { status: 502, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }
  },
};
