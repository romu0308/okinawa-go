export const ADMIN_PASSWORD = 'koumei2026';
export const AUTH_COOKIE = 'admin_auth';

export function isAuthenticated(cookies: any): boolean {
  return cookies.get(AUTH_COOKIE)?.value === 'authenticated';
}
