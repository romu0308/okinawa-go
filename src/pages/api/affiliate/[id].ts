import type { APIRoute } from 'astro';
import { getAffiliateById, logClick } from '../../../lib/affiliates';

export const prerender = false;

export const GET: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: 'Affiliate ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const affiliate = getAffiliateById(id);
    if (!affiliate) {
      return new Response(JSON.stringify({ error: 'Affiliate not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Extract referrer from query param or request headers
    const url = new URL(request.url);
    const referrer =
      url.searchParams.get('ref') ||
      request.headers.get('referer') ||
      'direct';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Log the click
    logClick(id, referrer, userAgent);

    // Return an HTML page that fires GA4 event then redirects
    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>リダイレクト中...</title>
<script>
  if (typeof gtag === 'function') {
    gtag('event', 'affiliate_click', {
      service_id: '${id}',
      service_name: '${affiliate.serviceName.replace(/'/g, "\\'")}',
    });
  }
  setTimeout(function() {
    window.location.href = '${affiliate.url}';
  }, 200);
</script>
</head>
<body>
<p>リダイレクト中...</p>
<noscript>
  <meta http-equiv="refresh" content="0;url=${affiliate.url}">
</noscript>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (error) {
    console.error('Affiliate redirect error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
