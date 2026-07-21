// === CRITICAL: FIRST LINE OF JS - if this doesn't appear in Xcode, React isn't loading ===
console.log('████████████████████████████████████████████████████');
console.log('█ [BUILD_TEST_20260624_POSTCAROUSEL_FIX] main.jsx loaded             █');
console.log('█ If you do NOT see this in Xcode = STALE BUNDLE   █');
console.log('████████████████████████████████████████████████████');
console.log('=== MAIN.JSX LOADED === protocol:', typeof window !== 'undefined' ? window.location.protocol : 'no-window', 'timestamp:', new Date().toISOString());

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

function routePasswordRecoveryBeforeAuth() {
  const hashParams = new URLSearchParams((window.location.hash || '').replace(/^#/, ''));
  const searchParams = new URLSearchParams(window.location.search || '');
  const type = hashParams.get('type') || searchParams.get('type');
  const hasRecoveryToken = type === 'recovery'
    || !!searchParams.get('token_hash')
    || !!hashParams.get('token_hash')
    || !!(hashParams.get('access_token') && hashParams.get('refresh_token'));

  if (!hasRecoveryToken) return;

  const fixedKeys = [
    'spicey_session',
    'spicey_cached_user',
    'token',
    'base44_access_token',
    'base44_auth_token',
  ];

  const storageKeys = new Set(fixedKeys);
  for (const storage of [window.localStorage, window.sessionStorage]) {
    try {
      for (let i = 0; i < storage.length; i += 1) {
        const key = storage.key(i) || '';
        if (/code.*verifier|verifier.*code/i.test(key)) continue;
        if (/^sb-.*auth-token$|auth-token|auth\.token/i.test(key)) storageKeys.add(key);
      }
    } catch (_) {}
  }

  storageKeys.forEach(key => {
    try { window.localStorage.removeItem(key); } catch (_) {}
    try { window.sessionStorage.removeItem(key); } catch (_) {}
  });

  if (window.location.pathname.startsWith('/auth/reset-password')) return;

  const nextUrl = `/auth/reset-password${window.location.search || ''}${window.location.hash || ''}`;
  window.history.replaceState({}, document.title, nextUrl);
}

routePasswordRecoveryBeforeAuth();

// Use protocol only — window.Capacitor bridge is NOT ready at JS parse time
const isCapacitorNative = ['capacitor:', 'spicey:'].includes(window.location.protocol);

console.log('[MAIN] Starting app, isCapacitorNative:', isCapacitorNative, 'protocol:', window.location.protocol);

function showNativeBootError(error) {
  if (!isCapacitorNative) return;
  const message = error?.message || String(error || 'Unknown error');
  const stack = error?.stack || '';
  const root = document.getElementById('root') || document.body;
  root.innerHTML = `
    <div style="min-height:100vh;background:#050006;color:white;padding:28px 18px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;">
      <div style="width:100%;max-width:420px;border:1px solid rgba(255,46,157,.35);border-radius:22px;padding:20px;background:rgba(255,255,255,.06);box-shadow:0 0 28px rgba(255,46,157,.16);">
        <div style="font-size:18px;font-weight:900;margin-bottom:8px;color:#ff6b35;">Spicey iOS error</div>
        <div style="font-size:14px;line-height:1.45;margin-bottom:14px;color:rgba(255,255,255,.82);">React failed before the app screen loaded.</div>
        <pre style="white-space:pre-wrap;word-break:break-word;font-size:12px;line-height:1.4;color:#ffd1ec;background:rgba(0,0,0,.38);border-radius:14px;padding:12px;max-height:45vh;overflow:auto;">${message}\n\n${stack}</pre>
      </div>
    </div>
  `;
}

window.addEventListener('error', event => {
  console.error('[MAIN] window error:', event.error || event.message);
});

window.addEventListener('unhandledrejection', event => {
  console.error('[MAIN] unhandled rejection:', event.reason);
});



// Service workers and notification prompts only on production domain (spicey.live), never on preview/Base44 URLs
const ALLOWED_HOSTNAMES = new Set(['spicey.live', 'www.spicey.live']);
const isProductionDomain = ALLOWED_HOSTNAMES.has(window.location.hostname);

if (!isCapacitorNative && isProductionDomain && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js', { scope: '/' })
    .then(reg => {
      console.log('[SW] Service worker registered');
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    })
    .catch(err => console.warn('[SW] Registration failed:', err));
}

console.log('[MAIN] Rendering React app...');
try {
  const rootElement = document.getElementById('root');
  console.log('[MAIN] Root element found:', !!rootElement);
  ReactDOM.createRoot(rootElement).render(
    <App />
  );
  console.log('[MAIN] React app rendered successfully');
} catch (err) {
  console.error('[MAIN] Failed to render React app:', err);
  showNativeBootError(err);
}
