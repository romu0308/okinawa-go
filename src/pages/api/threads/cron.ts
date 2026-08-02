import type { APIRoute } from 'astro';
import { ensureAutopilotSchedule, maybeRefreshToken, publishDuePosts } from '../../../lib/threadsService';

export const prerender = false;

// Called by Vercel Cron (see vercel.json). Vercel sends `Authorization: Bearer ${CRON_SECRET}`
// automatically when the CRON_SECRET env var is set. `?key=` is supported for manual runs.
function isAuthorized(request: Request, url: URL): boolean {
  const secret = import.meta.env.CRON_SECRET || process.env.CRON_SECRET || '';
  if (!secret) return false;
  const auth = request.headers.get('authorization') || '';
  return auth === `Bearer ${secret}` || url.searchParams.get('key') === secret;
}

export const GET: APIRoute = async ({ request, url }) => {
  if (!isAuthorized(request, url)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const token = await maybeRefreshToken();
    const autopilot = await ensureAutopilotSchedule();
    const publish = await publishDuePosts();

    return new Response(
      JSON.stringify({
        ok: true,
        published: publish.published,
        failed: publish.failed,
        generated: autopilot.generated,
        tokenRefreshed: token.refreshed,
        errors: publish.errors,
      }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error: any) {
    console.error('GET /api/threads/cron error:', error);
    return new Response(
      JSON.stringify({ ok: false, error: error?.message || 'Cron run failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
