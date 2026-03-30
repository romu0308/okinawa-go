import type { APIRoute } from 'astro';
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const { title, days, spotsJson } = await request.json();
  if (!title || !days || !spotsJson) {
    return new Response(JSON.stringify({ error: 'missing_fields' }), { status: 400 });
  }
  const { savePlan } = await import('../../../lib/supabase');
  const result = await savePlan(title, days, spotsJson);
  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' },
  });
};
