import type { APIRoute } from 'astro';
import { getArticles, saveArticles } from '../../../lib/articles';
import type { Article } from '../../../lib/articles';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const articles = getArticles();
    return new Response(JSON.stringify(articles), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('GET /api/admin/articles error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch articles' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    const slug = body.slug || generateSlug(body.title || 'untitled');

    const articles = getArticles();
    const existingIndex = articles.findIndex((a) => a.slug === slug);

    // Handle both editor format (publishDate) and direct format (publishedAt)
    const publishedAt = body.publishedAt || body.publishDate || new Date().toISOString();

    // Handle tags: could be string (comma-separated) or array
    const tags = typeof body.tags === 'string'
      ? body.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
      : (body.tags || []);

    const articleData: Article = {
      slug,
      title: body.title || '',
      description: body.description || body.metaDescription || '',
      content: body.content || '',
      category: body.category || '',
      tags,
      thumbnail: body.thumbnail || '',
      publishedAt,
      status: body.status || 'draft',
      pv: body.pv || (existingIndex >= 0 ? articles[existingIndex].pv : 0) || 0,
      affiliateLinks: body.affiliateLinks || [],
      series: body.series || null,
      seo: body.seo || {
        metaDescription: body.metaDescription || '',
        ogpTitle: body.ogpTitle || body.title || '',
        ogpImage: body.ogpImage || null,
      },
    };

    if (existingIndex >= 0) {
      articles[existingIndex] = { ...articles[existingIndex], ...articleData };
    } else {
      articles.unshift(articleData);
    }

    saveArticles(articles);
    return new Response(
      JSON.stringify({ success: true, slug }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('POST /api/admin/articles error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to save article' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    let slug: string | null = null;

    // Support both query parameter and JSON body
    const url = new URL(request.url);
    slug = url.searchParams.get('slug');

    if (!slug) {
      try {
        const body = await request.json();
        slug = body.slug;
      } catch {}
    }

    if (!slug) {
      return new Response(
        JSON.stringify({ error: 'slug is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const articles = getArticles();
    const filtered = articles.filter((a) => a.slug !== slug);

    if (filtered.length === articles.length) {
      return new Response(
        JSON.stringify({ error: 'Article not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } },
      );
    }

    saveArticles(filtered);
    return new Response(
      JSON.stringify({ success: true, deleted: slug }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('DELETE /api/admin/articles error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete article' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || `article-${Date.now()}`;
}
