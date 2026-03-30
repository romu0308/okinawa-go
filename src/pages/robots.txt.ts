import type { APIRoute } from 'astro';

export const prerender = false;

const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: https://okinawa-go.jp/sitemap-index.xml
Sitemap: https://okinawa-go.jp/career-sitemap.xml
`;

export const GET: APIRoute = async () => {
  return new Response(robotsTxt.trim(), {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
