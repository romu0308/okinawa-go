import type { APIRoute } from 'astro';
import { requireAdmin } from '../../../lib/auth';
import { getSettings, saveSettings } from '../../../lib/settings';

export const prerender = false;

export const GET: APIRoute = async ({ cookies }) => {
  const denied = requireAdmin(cookies);
  if (denied) return denied;
  try {
    const settings = getSettings();
    return new Response(JSON.stringify(settings), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('GET /api/admin/settings error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch settings' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const denied = requireAdmin(cookies);
  if (denied) return denied;
  try {
    const body = await request.json();
    const current = getSettings();
    const updated = { ...current, ...body };
    saveSettings(updated);
    return new Response(
      JSON.stringify({ success: true, settings: updated }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('POST /api/admin/settings error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update settings' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
