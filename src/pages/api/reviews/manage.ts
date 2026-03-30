import type { APIRoute } from 'astro';
export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  // Admin auth check
  const authCookie = cookies.get('admin-auth')?.value;
  if (!authCookie) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 });
  }

  const { action, id } = await request.json();
  if (!action || !id) {
    return new Response(JSON.stringify({ error: 'missing_fields' }), { status: 400 });
  }

  if (action === 'approve') {
    const { approveReview } = await import('../../../lib/supabase');
    await approveReview(id);
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (action === 'delete') {
    const { deleteReview } = await import('../../../lib/supabase');
    await deleteReview(id);
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ error: 'invalid_action' }), { status: 400 });
};
