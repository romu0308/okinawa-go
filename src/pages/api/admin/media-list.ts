import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const uploadDir = path.join(process.cwd(), 'public/images/articles');
    if (!fs.existsSync(uploadDir)) {
      return new Response(JSON.stringify([]), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const entries = fs.readdirSync(uploadDir, { withFileTypes: true });
    const files = entries
      .filter((e) => e.isFile() && allowedExts.includes(path.extname(e.name).toLowerCase()))
      .map((e) => {
        const stat = fs.statSync(path.join(uploadDir, e.name));
        return {
          name: e.name,
          path: `/images/articles/${e.name}`,
          url: `/images/articles/${e.name}`,
          size: stat.size,
          modified: stat.mtime.toISOString(),
        };
      })
      .sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime());

    return new Response(JSON.stringify(files), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('GET /api/admin/media-list error:', error);
    return new Response(JSON.stringify({ error: 'Failed to list media' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
