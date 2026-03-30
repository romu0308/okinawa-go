import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const articles = await getCollection('articles', ({ data }) => !data.draft);
  const searchData = articles.map(a => ({
    slug: a.id,
    title: a.data.title,
    description: a.data.description,
    tags: a.data.tags || [],
    category: a.data.category,
  }));

  return new Response(JSON.stringify(searchData), {
    headers: { 'Content-Type': 'application/json' }
  });
};
