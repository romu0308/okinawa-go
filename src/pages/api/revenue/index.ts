import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

const revenuePath = path.join(process.cwd(), 'src/data/revenue.json');

function readRevenue(): any[] {
  try {
    return JSON.parse(fs.readFileSync(revenuePath, 'utf-8'));
  } catch {
    return [];
  }
}

function writeRevenue(data: any[]): void {
  fs.writeFileSync(revenuePath, JSON.stringify(data, null, 2), 'utf-8');
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { month, source, amount } = body;

    if (!month || !source || typeof amount !== 'number') {
      return new Response(JSON.stringify({ error: 'month, source, amount are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const revenue = readRevenue();
    revenue.push({
      id: Date.now().toString(),
      month,
      source,
      amount,
      createdAt: new Date().toISOString(),
    });
    writeRevenue(revenue);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
