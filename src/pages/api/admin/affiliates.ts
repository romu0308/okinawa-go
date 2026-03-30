import type { APIRoute } from 'astro';
import { getAffiliates, saveAffiliates } from '../../../lib/affiliates';
import type { Affiliate } from '../../../lib/affiliates';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const affiliates = getAffiliates();
    return new Response(JSON.stringify(affiliates), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('GET /api/admin/affiliates error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch affiliates' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body: Affiliate = await request.json();

    if (!body.id || !body.serviceName) {
      return new Response(
        JSON.stringify({ error: 'id and serviceName are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const affiliates = getAffiliates();
    const existingIndex = affiliates.findIndex((a) => a.id === body.id);

    if (existingIndex >= 0) {
      affiliates[existingIndex] = { ...affiliates[existingIndex], ...body };
    } else {
      const newAffiliate: Affiliate = {
        id: body.id,
        serviceName: body.serviceName,
        url: body.url || '',
        reward: body.reward || 0,
        clicks: body.clicks || 0,
        conversions: body.conversions || 0,
        clickLog: body.clickLog || [],
      };
      affiliates.push(newAffiliate);
    }

    saveAffiliates(affiliates);
    return new Response(
      JSON.stringify({ success: true, id: body.id }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('POST /api/admin/affiliates error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to save affiliate' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    let id: string | null = null;

    const url = new URL(request.url);
    id = url.searchParams.get('id');

    if (!id) {
      try {
        const body = await request.json();
        id = body.id;
      } catch {}
    }

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'id is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const affiliates = getAffiliates();
    const filtered = affiliates.filter((a) => a.id !== id);

    if (filtered.length === affiliates.length) {
      return new Response(
        JSON.stringify({ error: 'Affiliate not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } },
      );
    }

    saveAffiliates(filtered);
    return new Response(
      JSON.stringify({ success: true, deleted: id }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('DELETE /api/admin/affiliates error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete affiliate' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
