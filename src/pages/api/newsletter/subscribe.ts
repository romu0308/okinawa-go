import type { APIRoute } from 'astro';
export const prerender = false;
export const POST: APIRoute = async ({ request }) => {
  const { email } = await request.json();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: 'invalid_email' }), { status: 400 });
  }
  const { addSubscriber } = await import('../../../lib/supabase');
  const result = await addSubscriber(email);
  return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
};
