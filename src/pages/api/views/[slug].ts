import type { APIRoute } from 'astro';
export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const { slug } = params;
  if (!slug) {
    return new Response(JSON.stringify({ error: 'slug_required' }), { status: 400 });
  }
  const { getViews } = await import('../../../lib/supabase');
  const data = await getViews(slug);
  return new Response(JSON.stringify(data || { slug, count: 0 }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ params }) => {
  const { slug } = params;
  if (!slug) {
    return new Response(JSON.stringify({ error: 'slug_required' }), { status: 400 });
  }
  const { incrementView } = await import('../../../lib/supabase');
  const count = await incrementView(slug);
  return new Response(JSON.stringify({ slug, count }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
