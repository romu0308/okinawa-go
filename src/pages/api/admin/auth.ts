import type { APIRoute } from 'astro';
import { ADMIN_PASSWORD, AUTH_COOKIE } from '../../../lib/auth';

export const prerender = false;

// Simple in-memory rate limiting for login attempts
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 60 * 1000; // 60 seconds

function getClientIP(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

function isRateLimited(ip: string): boolean {
  const record = loginAttempts.get(ip);
  if (!record) return false;
  if (record.count >= MAX_ATTEMPTS) {
    const elapsed = Date.now() - record.lastAttempt;
    if (elapsed < LOCKOUT_DURATION) {
      return true;
    }
    // Lockout expired, reset
    loginAttempts.delete(ip);
    return false;
  }
  return false;
}

function recordFailedAttempt(ip: string): void {
  const record = loginAttempts.get(ip);
  if (record) {
    record.count += 1;
    record.lastAttempt = Date.now();
  } else {
    loginAttempts.set(ip, { count: 1, lastAttempt: Date.now() });
  }
}

function clearAttempts(ip: string): void {
  loginAttempts.delete(ip);
}

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const ip = getClientIP(request);

  if (isRateLimited(ip)) {
    return new Response(
      JSON.stringify({ error: 'ログイン試行回数が上限を超えました。60秒後に再試行してください。' }),
      {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

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
    clearAttempts(ip);
    cookies.set(AUTH_COOKIE, 'authenticated', {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return redirect('/admin', 302);
  }

  recordFailedAttempt(ip);
  return redirect('/admin/login?error=1', 302);
};

export const DELETE: APIRoute = async ({ cookies }) => {
  cookies.delete(AUTH_COOKIE, { path: '/' });
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
