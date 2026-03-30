import type { APIRoute } from 'astro';
import articlesData from '../data/articles.json';

export const prerender = false;

interface Article {
  slug: string;
  title: string;
  date?: string;
  updatedAt?: string;
}

const SITE_URL = 'https://okinawa-go.jp';

const staticPages = [
  { url: '/', priority: '1.0', changefreq: 'daily' },
  { url: '/articles', priority: '0.9', changefreq: 'daily' },
  { url: '/about', priority: '0.7', changefreq: 'monthly' },
  { url: '/contact', priority: '0.5', changefreq: 'monthly' },
  { url: '/shindan', priority: '0.8', changefreq: 'weekly' },
  { url: '/plan', priority: '0.7', changefreq: 'weekly' },
  { url: '/search', priority: '0.6', changefreq: 'weekly' },
  { url: '/community', priority: '0.6', changefreq: 'weekly' },
  { url: '/privacy', priority: '0.3', changefreq: 'yearly' },
  { url: '/legal', priority: '0.3', changefreq: 'yearly' },
];

export const GET: APIRoute = async () => {
  const articles = articlesData as Article[];

  const staticEntries = staticPages
    .map(
      (page) => `
  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    )
    .join('');

  const articleEntries = articles
    .map(
      (article) => `
  <url>
    <loc>${SITE_URL}/articles/${article.slug}</loc>
    <lastmod>${article.updatedAt || article.date || new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries}
${articleEntries}
</urlset>`.trim();

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
