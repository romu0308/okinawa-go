import type { APIRoute } from 'astro';
export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const { key } = params;
  if (!key) {
    return new Response(JSON.stringify({ error: 'key_required' }), { status: 400 });
  }
  const { getPlan } = await import('../../../lib/supabase');
  const plan = await getPlan(key);
  if (!plan) {
    return new Response(JSON.stringify({ error: 'not_found' }), { status: 404 });
  }
  return new Response(JSON.stringify(plan), {
    headers: { 'Content-Type': 'application/json' },
  });
};
