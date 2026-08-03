import { createHash, timingSafeEqual } from 'node:crypto';

// Set ADMIN_PASSWORD in the environment (e.g. Vercel project settings).
// The fallback keeps local dev working but must not be relied on in production.
export const ADMIN_PASSWORD = import.meta.env.ADMIN_PASSWORD || 'koumei2026';
export const AUTH_COOKIE = 'admin_auth';

// Stateless session token derived from the password so it stays valid across
// serverless instances but changes whenever the password changes.
const authToken = createHash('sha256')
  .update(`okinawa-go-admin:${ADMIN_PASSWORD}`)
  .digest('hex');

export function getAuthToken(): string {
  return authToken;
}

export function isAuthenticated(cookies: any): boolean {
  const value: string = cookies.get(AUTH_COOKIE)?.value || '';
  if (value.length !== authToken.length) return false;
  return timingSafeEqual(Buffer.from(value), Buffer.from(authToken));
}

export function requireAdmin(cookies: any): Response | null {
  if (isAuthenticated(cookies)) return null;
  return new Response(JSON.stringify({ error: 'unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}
