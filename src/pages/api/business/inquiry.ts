import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const fs = await import('node:fs');
    const path = await import('node:path');
    const filePath = path.join(process.cwd(), 'src/data/business-inquiries.json');

    let inquiries: any[] = [];
    try {
      inquiries = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch {}

    if (body._action === 'update-status') {
      const idx = inquiries.findIndex((r: any) => r.id === body.id);
      if (idx !== -1) {
        inquiries[idx].status = body.status;
      }
    } else {
      inquiries.push({
        id: inquiries.length + 1,
        ...body,
        status: 'new',
        created_at: new Date().toISOString(),
      });
    }

    fs.writeFileSync(filePath, JSON.stringify(inquiries, null, 2));

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
