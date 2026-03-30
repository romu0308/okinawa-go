import type { APIRoute } from 'astro';
import { ADMIN_PASSWORD, AUTH_COOKIE } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const contentType = request.headers.get('content-type') || '';

  let password = '';

  if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    password = formData.get('password')?.toString() || '';
  } else {
    const body = await request.json();
    password = body.password || '';
  }

  if (password === ADMIN_PASSWORD) {
    cookies.set(AUTH_COOKIE, 'authenticated', {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return redirect('/admin', 302);
  }

  return redirect('/admin/login?error=1', 302);
};

export const DELETE: APIRoute = async ({ cookies }) => {
  cookies.delete(AUTH_COOKIE, { path: '/' });
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
