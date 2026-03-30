import type { APIRoute } from 'astro';
import { getCompanies, saveCompanies } from '../../../lib/companies';
import type { Company } from '../../../lib/companies';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const companies = getCompanies();
    return new Response(JSON.stringify(companies), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('GET /api/admin/companies error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch companies' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body: Company = await request.json();

    if (!body.id || !body.name) {
      return new Response(
        JSON.stringify({ error: 'id and name are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const companies = getCompanies();
    const existingIndex = companies.findIndex((c) => c.id === body.id);

    if (existingIndex >= 0) {
      companies[existingIndex] = { ...companies[existingIndex], ...body };
    } else {
      const newCompany: Company = {
        id: body.id,
        name: body.name,
        industry: body.industry || '',
        tags: body.tags || [],
        comment: body.comment || '',
        agentLink: body.agentLink || '',
        salaryRange: body.salaryRange || '',
        overtime: body.overtime || '',
        remote: body.remote || '',
      };
      companies.push(newCompany);
    }

    saveCompanies(companies);
    return new Response(
      JSON.stringify({ success: true, id: body.id }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('POST /api/admin/companies error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to save company' }),
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

    const companies = getCompanies();
    const filtered = companies.filter((c) => c.id !== id);

    if (filtered.length === companies.length) {
      return new Response(
        JSON.stringify({ error: 'Company not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } },
      );
    }

    saveCompanies(filtered);
    return new Response(
      JSON.stringify({ success: true, deleted: id }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('DELETE /api/admin/companies error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete company' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
