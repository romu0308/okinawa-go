import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const filePath = body.path;

    if (!filePath || typeof filePath !== 'string') {
      return new Response(JSON.stringify({ error: 'path is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Sanitize: only allow deleting from public/images/articles
    const safeName = path.basename(filePath);
    const fullPath = path.join(process.cwd(), 'public/images/articles', safeName);

    if (!fs.existsSync(fullPath)) {
      return new Response(JSON.stringify({ error: 'File not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    fs.unlinkSync(fullPath);
    return new Response(JSON.stringify({ success: true, deleted: filePath }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('POST /api/admin/media-delete error:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete file' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
