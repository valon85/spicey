// ═══════════════════════════════════════════════════════════════════
// APP PARAMS
// APP_ID is triple-sourced in priority order:
//   1. Hardcoded string literal (never null, always wins)
//   2. import.meta.env.VITE_BASE44_APP_ID (baked by vite.config.js define)
//   3. Nothing — no localStorage, no URL param, no dynamic resolution
// ═══════════════════════════════════════════════════════════════════

// 1. Literal constant — this string is baked directly into the bundle by Vite.
//    It cannot be null, undefined, or dynamic.
const HARDCODED_APP_ID = "69fe90d3bbe7ad47925e4a0a";

// 2. Env var baked at build time by vite.config.js define block (also "69fe90d3bbe7ad47925e4a0a")
const ENV_APP_ID = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_BASE44_APP_ID : undefined;

// Final value — hardcoded wins, env is a belt-and-suspenders check
export const APP_ID = HARDCODED_APP_ID || ENV_APP_ID || "69fe90d3bbe7ad47925e4a0a";

// Sanity log — you will see this in Xcode console on every cold start
console.log('[APP_PARAMS] APP_ID:', APP_ID);
if (APP_ID === 'null' || APP_ID === 'undefined' || !APP_ID) {
  console.error('🚨 APP_ID IS NULL/UNDEFINED — THIS MUST NEVER HAPPEN');
}

const isNode = typeof window === 'undefined';
const isNativeCapacitor = !isNode && window.location.protocol === 'capacitor:';

// Wipe any stale/null app_id the SDK might have cached in localStorage from old builds
if (!isNode) {
  try {
    localStorage.setItem('base44_app_id', APP_ID);
    if (isNativeCapacitor) {
      localStorage.removeItem('base44_app_base_url');
      localStorage.removeItem('base44_from_url');
      localStorage.removeItem('base44_server_url');
    }
  } catch (_) {}
}

const getParam = (key, removeFromUrl = false) => {
  if (isNode) return null;
  const storageKey = `base44_${key}`;
  const urlParams = new URLSearchParams(window.location.search);
  const fromUrl = urlParams.get(key);
  if (removeFromUrl && fromUrl) {
    urlParams.delete(key);
    const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ''}${window.location.hash}`;
    window.history.replaceState({}, document.title, newUrl);
  }
  if (fromUrl) {
    try { localStorage.setItem(storageKey, fromUrl); } catch (_) {}
    return fromUrl;
  }
  try { return localStorage.getItem(storageKey) || null; } catch (_) { return null; }
};

export const appParams = {
  appId: APP_ID,
  token: getParam('access_token', true),
  functionsVersion: getParam('functions_version') || (isNode ? null : import.meta.env?.VITE_BASE44_FUNCTIONS_VERSION) || null,
  appBaseUrl: isNativeCapacitor ? undefined : (getParam('app_base_url') || (isNode ? null : import.meta.env?.VITE_BASE44_APP_BASE_URL) || null),
};