import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';

export async function GET(context: APIContext) {
  const articles = await getCollection('articles', ({ data }) => !data.draft);
  const sorted = articles.sort((a, b) => new Date(b.data.publishedAt).getTime() - new Date(a.data.publishedAt).getTime());

  return rss({
    title: 'OKINAWA!GO!!',
    description: '住んでるからこそわかる沖縄がある。沖縄在住者による旅行ガイド。',
    site: context.site!,
    items: sorted.map(article => ({
      title: article.data.title,
      pubDate: new Date(article.data.publishedAt),
      description: article.data.description,
      link: `/articles/${article.id}/`,
    })),
    customData: '<language>ja</language>',
  });
}
