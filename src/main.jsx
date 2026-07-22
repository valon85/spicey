// === CRITICAL: FIRST LINE OF JS - if this doesn't appear in Xcode, React isn't loading ===
console.log('████████████████████████████████████████████████████');
console.log('█ [BUILD_TEST_20260624_POSTCAROUSEL_FIX] main.jsx loaded             █');
console.log('█ If you do NOT see this in Xcode = STALE BUNDLE   █');
console.log('████████████████████████████████████████████████████');
console.log('=== MAIN.JSX LOADED === protocol:', typeof window !== 'undefined' ? window.location.protocol : 'no-window', 'timestamp:', new Date().toISOString());

import React from 'react'
import ReactDOM from 'react-dom/client'
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

function showNativeBootFallback(reason) {
  if (!isCapacitorNative) return;
  const root = document.getElementById('root');
  if (!root) return;
  const visibleText = (root.textContent || '').trim();
  const looksLikeOnlyLoader = root.querySelector('img[alt="S"]') && visibleText.length < 3;
  if (root.children.length > 0 && visibleText.length >= 3 && !looksLikeOnlyLoader) return;

  root.innerHTML = `
    <div style="min-height:100vh;background:linear-gradient(160deg,#08010d 0%,#16081f 48%,#26071d 100%);color:white;padding:28px 18px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;">
      <div style="width:100%;max-width:420px;border:1px solid rgba(255,80,0,.34);border-radius:26px;padding:22px;background:rgba(255,255,255,.08);box-shadow:0 0 34px rgba(255,45,143,.18);">
        <div style="font-size:28px;font-weight:950;margin-bottom:8px;background:linear-gradient(100deg,#ff7a00,#ff2d8f,#b22cff);-webkit-background-clip:text;background-clip:text;color:transparent;">Spicey</div>
        <div style="font-size:18px;font-weight:850;margin-bottom:8px;">App did not finish loading</div>
        <div style="font-size:14px;line-height:1.45;margin-bottom:16px;color:rgba(255,255,255,.76);">The iOS screen stayed empty/loading. This is now visible so we can fix the exact cause instead of seeing a black screen.</div>
        <pre style="white-space:pre-wrap;word-break:break-word;font-size:12px;line-height:1.4;color:#ffd1ec;background:rgba(0,0,0,.38);border-radius:14px;padding:12px;max-height:34vh;overflow:auto;">${reason}</pre>
      </div>
    </div>
  `;
}

function showWebBootFallback(reason) {
  if (isCapacitorNative) return;
  const root = document.getElementById('root');
  if (!root || root.dataset.reactBootStarted === '1' || root.children.length > 0 || root.textContent.trim()) return;
  root.innerHTML = `
    <div style="min-height:100vh;background:#050208;color:#fff;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;">
      <div style="max-width:440px;width:100%;border:1px solid rgba(255,85,0,.34);border-radius:20px;padding:18px;background:rgba(255,255,255,.06);">
        <div style="font-size:18px;font-weight:900;margin-bottom:8px;color:#ff6b35;">Spicey did not mount</div>
        <div style="font-size:13px;line-height:1.45;color:rgba(255,255,255,.75);">The page loaded, but React left the root empty.</div>
        <pre style="white-space:pre-wrap;word-break:break-word;margin-top:12px;font-size:12px;line-height:1.4;color:#ffd1ec;background:rgba(0,0,0,.35);border-radius:12px;padding:10px;">${reason}</pre>
      </div>
    </div>
  `;
}

window.addEventListener('error', event => {
  console.error('[MAIN] window error:', event.error || event.message);
  showNativeBootError(event.error || event.message);
  showWebBootFallback(`${event.error?.message || event.message || 'Window error'}\n\n${event.error?.stack || ''}`);
});

window.addEventListener('unhandledrejection', event => {
  console.error('[MAIN] unhandled rejection:', event.reason);
  const root = document.getElementById('root');
  const appAlreadyVisible = !!(root?.children.length && (root.textContent || '').trim().length > 2);
  if (!appAlreadyVisible) showNativeBootError(event.reason);
  showWebBootFallback(`${event.reason?.message || String(event.reason || 'Unhandled rejection')}\n\n${event.reason?.stack || ''}`);
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

async function bootReactApp() {
  const rootElement = document.getElementById('root');
  console.log('[MAIN] Root element found:', !!rootElement);
  if (rootElement) {
    rootElement.dataset.reactBootStarted = '1';
  }
  const { default: RootComponent } = await import('@/App.jsx');

  ReactDOM.createRoot(rootElement).render(
    <RootComponent />
  );
  rootElement.dataset.reactMounted = '1';
  console.log('[MAIN] React app rendered successfully');
  setTimeout(() => {
    showWebBootFallback(`url=${window.location.href}\nprotocol=${window.location.protocol}\nrootChildren=${rootElement?.children?.length || 0}\ntime=${new Date().toISOString()}`);
  }, 2500);
  setTimeout(() => {
    showNativeBootFallback(`url=${window.location.href}\nprotocol=${window.location.protocol}\nrootChildren=${rootElement?.children?.length || 0}\nrootText=${(rootElement?.textContent || '').trim().slice(0, 120) || 'empty'}\ntime=${new Date().toISOString()}`);
  }, 4500);
}

console.log('[MAIN] Rendering React app...');
bootReactApp().catch(err => {
  console.error('[MAIN] Failed to render React app:', err);
  showNativeBootError(err);
  showWebBootFallback(`${err?.message || String(err)}\n\n${err?.stack || ''}`);
});
