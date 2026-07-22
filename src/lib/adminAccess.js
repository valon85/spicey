export const ADMIN_EMAILS = [
  'info@spicey.live',
  'valondervishi13@gmail.com',
  'vlora.dervisi@gmail.com',
];

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

export function isAdminEmail(userOrEmail) {
  const email = typeof userOrEmail === 'string' ? userOrEmail : userOrEmail?.email;
  return ADMIN_EMAILS.includes(normalizeEmail(email));
}

function parseStoredJSON(key) {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem(key) || 'null');
  } catch (_) {
    return null;
  }
}

function decodeJwtPayload(token) {
  if (typeof window === 'undefined' || !token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    return JSON.parse(window.atob(padded));
  } catch (_) {
    return null;
  }
}

export function getAdminIdentityFromStorage() {
  if (typeof window === 'undefined') return null;

  const cachedUser = parseStoredJSON('spicey_cached_user');
  if (isAdminEmail(cachedUser)) return cachedUser;

  const session = parseStoredJSON('spicey_session');
  if (isAdminEmail(session?.user)) return session.user;

  const tokenPayload = decodeJwtPayload(session?.access_token || window.localStorage.getItem('token'));
  if (isAdminEmail(tokenPayload)) return tokenPayload;

  return null;
}

export function hasAdminAccess(userOrEmail) {
  return isAdminEmail(userOrEmail) || !!getAdminIdentityFromStorage();
}
