import type { APIRoute } from 'astro';
import articlesData from '../data/articles.json';

export const prerender = false;

interface Article {
  slug: string;
  title: string;
  description?: string;
  excerpt?: string;
  date?: string;
  category?: string;
}

const SITE_URL = 'https://okinawa-go.jp';
const SITE_TITLE = 'キャリア孔明 - 戦略的キャリアメディア';
const SITE_DESCRIPTION = '戦略的にキャリアを攻略するためのメディアサイト。転職、副業、スキルアップの情報を発信。';

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = async () => {
  const articles = articlesData as Article[];

  const items = articles
    .sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 50)
    .map(
      (article) => `
    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${SITE_URL}/articles/${article.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/articles/${article.slug}</guid>
      <description>${escapeXml(article.description || article.excerpt || article.title)}</description>
      ${article.date ? `<pubDate>${new Date(article.date).toUTCString()}</pubDate>` : ''}
      ${article.category ? `<category>${escapeXml(article.category)}</category>` : ''}
    </item>`
    )
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>ja</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`.trim();

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
