import type { APIRoute } from 'astro';
import { requireAdmin } from '../../../lib/auth';
export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const denied = requireAdmin(cookies);
  if (denied) return denied;

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
