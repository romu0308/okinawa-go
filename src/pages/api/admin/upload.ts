import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

export const prerender = false;

const UPLOAD_DIR = path.join(process.cwd(), 'public/images/articles');
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

export const GET: APIRoute = async () => {
  try {
    if (!fs.existsSync(UPLOAD_DIR)) {
      return new Response(JSON.stringify({ files: [] }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const allFiles = collectImageFiles(UPLOAD_DIR, 'public/images/articles');

    return new Response(JSON.stringify({ files: allFiles }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('GET /api/admin/upload error:', error);
    return new Response(JSON.stringify({ error: 'Failed to list files' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
    ];
    if (!allowedTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({
          error: `Invalid file type: ${file.type}. Allowed: ${allowedTypes.join(', ')}`,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const originalName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const timestamp = Date.now();
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext);
    const fileName = `${baseName}-${timestamp}${ext}`;

    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(UPLOAD_DIR, fileName);
    fs.writeFileSync(filePath, buffer);

    const publicPath = `/images/articles/${fileName}`;

    return new Response(
      JSON.stringify({ success: true, path: publicPath, fileName }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('POST /api/admin/upload error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to upload file' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const filePath = body.path as string;

    if (!filePath) {
      return new Response(
        JSON.stringify({ error: 'path is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Resolve to absolute path within public/
    const absolutePath = path.join(process.cwd(), 'public', filePath);

    // Security check: ensure the path is within public/images/
    const imagesDir = path.join(process.cwd(), 'public/images');
    if (!absolutePath.startsWith(imagesDir)) {
      return new Response(
        JSON.stringify({ error: 'Invalid path' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('DELETE /api/admin/upload error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete file' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};

function collectImageFiles(dir: string, relativePath: string): any[] {
  const files: any[] = [];

  if (!fs.existsSync(dir)) return files;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = `${relativePath}/${entry.name}`;

    if (entry.isDirectory()) {
      files.push(...collectImageFiles(fullPath, relPath));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (IMAGE_EXTENSIONS.includes(ext)) {
        files.push({
          name: entry.name,
          path: `/${relPath}`,
          url: `/${relPath}`,
        });
      }
    }
  }

  return files;
}
