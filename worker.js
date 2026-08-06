/**
 * Cloudflare Worker — StreamVault API Gateway & Static Proxy
 * Routes /api/* directly to Render Python backend (https://amitkushwaha-streamvault.onrender.com)
 * Serves static frontend assets for all other routes
 */

const RENDER_BACKEND = 'https://amitkushwaha-streamvault.onrender.com';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. Handle CORS preflight options
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // 2. Proxy all /api/ endpoints to Render Python Backend
    if (url.pathname.startswith('/api/')) {
      const backendUrl = RENDER_BACKEND + url.pathname + url.search;
      
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
        const response = await fetch(backendUrl, init);
        const resHeaders = new Headers(response.headers);
        Object.entries(CORS_HEADERS).forEach(([k, v]) => resHeaders.set(k, v));

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: resHeaders,
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: 'Backend Connection Error: ' + err.message }), {
          status: 502,
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        });
      }
    }

    // 3. Serve static site assets via Cloudflare ASSETS binding (or fallback)
    if (env.ASSETS) {
      try {
        return await env.ASSETS.fetch(request);
      } catch (e) {
        // Fallback
      }
    }

    // Static fallback
    return fetch(request);
  },
};
