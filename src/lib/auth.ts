// Admin authentication: HMAC-signed session cookies.
// Requires the ADMIN_PASSWORD and ADMIN_SESSION_SECRET environment variables;
// when either is missing, login and session verification fail closed.
import { createHmac, timingSafeEqual } from 'node:crypto';

export const AUTH_COOKIE = 'admin_auth';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days (seconds)

function env(name: string): string {
  return (import.meta.env[name] as string) || process.env[name] || '';
}

export function getAdminPassword(): string {
  return env('ADMIN_PASSWORD');
}

function getSessionSecret(): string {
  return env('ADMIN_SESSION_SECRET');
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function verifyPassword(input: string): boolean {
  const expected = getAdminPassword();
  if (!expected || !input) return false;
  return safeEqual(input, expected);
}

// Token format: "<expiresAtMs>.<hmac(expiresAtMs)>"
export function createSessionToken(): string | null {
  const secret = getSessionSecret();
  if (!secret) return null;
  const payload = String(Date.now() + SESSION_MAX_AGE * 1000);
  return `${payload}.${sign(payload, secret)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  const secret = getSessionSecret();
  if (!secret || !token) return false;
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return false;
  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  if (!/^\d+$/.test(payload)) return false;
  if (!safeEqual(signature, sign(payload, secret))) return false;
  return Number(payload) > Date.now();
}

export function isAuthenticated(cookies: any): boolean {
  return verifySessionToken(cookies.get(AUTH_COOKIE)?.value);
}

export const SESSION_COOKIE_OPTIONS = {
  path: '/',
  httpOnly: true,
  secure: import.meta.env.PROD,
  sameSite: 'strict' as const,
  maxAge: SESSION_MAX_AGE,
};
