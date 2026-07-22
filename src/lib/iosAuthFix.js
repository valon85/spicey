// ═══════════════════════════════════════════════════════════════════
// iOS AUTH PERSISTENCE FIX
// This module ensures auth token is loaded BEFORE any React rendering
// ═══════════════════════════════════════════════════════════════════

import { Preferences } from '@capacitor/preferences';

const TOKEN_KEY = 'spicey_session';
const USER_KEY = 'spicey_user_data';

console.log('[IOS_AUTH_FIX] Module loaded');

/**
 * Pre-auth check — called BEFORE React renders
 * Reads token from Capacitor Preferences + localStorage
 * Returns { token, user } if valid session exists
 */
export async function preAuthCheck() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║  PRE-AUTH: Starting pre-auth check           ║');
  console.log('╚══════════════════════════════════════════════╝');
  
  const isNative = typeof window !== 'undefined' && (
    window.location.protocol === 'capacitor:' ||
    window.location.protocol === 'ionic:' ||
    !!(window.Capacitor?.isNativePlatform?.())
  );
  
  console.log('[PRE-AUTH] isNative:', isNative, '| protocol:', typeof window !== 'undefined' ? window.location.protocol : 'ssr');
  console.log('[PRE-AUTH] Capacitor available:', !!(window.Capacitor));
  console.log('[PRE-AUTH] Capacitor.isNativePlatform:', window.Capacitor?.isNativePlatform?.());
  
  let token = null;
  let session = null;
  let user = null;
  
  // STEP 1: Try Capacitor Preferences first (native iOS persistent storage)
  if (isNative) {
    try {
      console.log('[PRE-AUTH] Reading from Capacitor Preferences...');
      const tokenResult = await Preferences.get({ key: TOKEN_KEY });
      if (tokenResult?.value) {
        try {
          session = JSON.parse(tokenResult.value);
          token = session?.access_token || tokenResult.value;
        } catch (_) {
          token = tokenResult.value;
        }
        console.log('[PRE-AUTH] ✅ Token found in Capacitor Preferences:', token.substring(0, 20) + '...');
      } else {
        console.log('[PRE-AUTH] ⚠️ NO TOKEN in Capacitor Preferences (key:', TOKEN_KEY, ')');
      }
      
      const userResult = await Preferences.get({ key: USER_KEY });
      if (userResult?.value) {
        try {
          user = JSON.parse(userResult.value);
          console.log('[PRE-AUTH] ✅ User found in Capacitor Preferences:', user.id);
        } catch (e) {
          console.error('[PRE-AUTH] ❌ Failed to parse user JSON:', e);
        }
      } else {
        console.log('[PRE-AUTH] ⚠️ NO USER in Capacitor Preferences');
      }
    } catch (err) {
      console.error('[PRE-AUTH] ❌ Capacitor Preferences error:', err.message);
    }
  } else {
    console.log('[PRE-AUTH] ⚠️ Not native — skipping Capacitor Preferences');
  }
  
  // STEP 2: Fallback to localStorage (works for both web and native)
  if (!token && typeof window !== 'undefined') {
    try {
      const rawSession = localStorage.getItem(TOKEN_KEY);
      try {
        session = rawSession ? JSON.parse(rawSession) : null;
        token = session?.access_token || null;
      } catch (_) {
        token = rawSession;
      }
      if (token) {
        console.log('[PRE-AUTH] ✅ Token found in localStorage:', token.substring(0, 20) + '...');
      } else {
        console.log('[PRE-AUTH] ⚠️ NO TOKEN in localStorage (key:', TOKEN_KEY, ')');
      }
      
      const userStr = localStorage.getItem(USER_KEY);
      if (userStr) {
        try {
          user = JSON.parse(userStr);
          console.log('[PRE-AUTH] ✅ User found in localStorage:', user.id);
        } catch (e) {
          console.error('[PRE-AUTH] ❌ Failed to parse localStorage user:', e);
        }
      } else {
        console.log('[PRE-AUTH] ⚠️ NO USER in localStorage');
      }
    } catch (err) {
      console.error('[PRE-AUTH] ❌ localStorage error:', err.message);
    }
  }
  
  // STEP 3: Also check legacy keys
  if (!token && typeof window !== 'undefined') {
    try {
      const legacyToken = localStorage.getItem('token') || localStorage.getItem('base44_auth_token') || localStorage.getItem('auth_token');
      if (legacyToken) {
        token = legacyToken;
        console.log('[PRE-AUTH] ✅ Token found in LEGACY key:', token.substring(0, 20) + '...');
      } else {
        console.log('[PRE-AUTH] ⚠️ NO TOKEN in legacy keys');
      }
    } catch (_) {}
  }
  
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║  PRE-AUTH: FINAL RESULT                      ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log('[PRE-AUTH] token found =', !!token);
  console.log('[PRE-AUTH] user found =', user?.id || null);
  console.log('[PRE-AUTH] isNative =', isNative);
  
  if (!token) {
    console.log('[PRE-AUTH] ❌ REASON FOR LOGIN SCREEN: NO TOKEN FOUND IN ANY STORAGE');
  }

  if (session?.access_token && typeof window !== 'undefined') {
    try { localStorage.setItem(TOKEN_KEY, JSON.stringify(session)); } catch (_) {}
  }
  
  return { token, session, user, isNative };
}

/**
 * Inject token into SDK using official SDK token setter only
 */
export function injectTokenIntoSDK(token, base44) {
  if (!token || !base44) return false;
  try {
    if (typeof base44.auth.setToken === 'function') {
      base44.auth.setToken(token);
      return true;
    }
  } catch (_) {}
  return false;
}

/**
 * Validate token by calling auth.me() with retry for iOS latency
 */
export async function validateToken(base44, token) {
  if (!token || !base44) return null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const user = await base44.auth.me();
      if (user?.id) return user;
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) return null;
      if (attempt < 3) await new Promise(r => setTimeout(r, 1000));
    }
  }
  return null;
}

/**
 * Complete iOS auth initialization
 * Call this BEFORE React renders in App.jsx
 */
export async function initializeIOSAuth(base44) {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║  IOS-AUTH-INIT: Starting iOS auth init       ║');
  console.log('╚══════════════════════════════════════════════╝');
  
  const { token, session, user: cachedUser, isNative } = await preAuthCheck();
  
  if (!token) {
    console.log('[IOS-AUTH-INIT] ❌ No token found — show auth screen');
    return { authenticated: false, user: null };
  }
  
  // Inject token into SDK before any API calls
  if (session?.access_token && typeof window !== 'undefined') {
    try { localStorage.setItem(TOKEN_KEY, JSON.stringify(session)); } catch (_) {}
  }
  injectTokenIntoSDK(token, base44);
  
  // Validate token with server (2-3 retries for iOS network delay)
  let user = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    user = await validateToken(base44, token);
    if (user?.id) break;
    if (attempt < 3) await new Promise(r => setTimeout(r, 800));
  }
  
  if (user?.id) {
    console.log('[IOS-AUTH-INIT] ✅ Authenticated! User:', user.id);
    // Cache user for offline mode
    try {
      if (isNative) {
        await Preferences.set({ key: USER_KEY, value: JSON.stringify(user) });
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      }
    } catch (_) {}
    
    return { authenticated: true, user };
  }
  
  // Token invalid — try cached user for offline mode
  if (cachedUser?.id) {
    console.log('[IOS-AUTH-INIT] ⚠️ Token invalid but using cached user:', cachedUser.id);
    injectTokenIntoSDK(token, base44);
    return { authenticated: true, user: cachedUser };
  }
  
  console.log('[IOS-AUTH-INIT] ❌ No valid session — show auth screen');
  return { authenticated: false, user: null };
}
