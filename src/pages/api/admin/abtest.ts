import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

export const prerender = false;

const DATA_PATH = path.join(process.cwd(), 'src/data/abtest.json');

function getABTests() {
  if (!fs.existsSync(DATA_PATH)) return { tests: [] };
  try {
    return JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  } catch {
    return { tests: [] };
  }
}

function saveABTests(data: any) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

export const GET: APIRoute = async () => {
  try {
    const data = getABTests();
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('GET /api/admin/abtest error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch A/B tests' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    saveABTests(body);
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('POST /api/admin/abtest error:', error);
    return new Response(JSON.stringify({ error: 'Failed to save A/B tests' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
