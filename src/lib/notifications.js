/**
 * Spicey Notification Utility
 * Handles: permission request, SW registration, missed call tracking, in-app alerts
 */

const SW_PATH = '/sw.js';

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  const result = await Notification.requestPermission();
  return result;
}

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register(SW_PATH, { scope: '/' });
    await navigator.serviceWorker.ready;
    return reg;
  } catch (e) {
    console.warn('[SW] Registration failed:', e);
    return null;
  }
}

export function sendSwMessage(msg) {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.ready.then(reg => {
    if (reg.active) reg.active.postMessage(msg);
  }).catch(() => {});
}

export function showInAppNotification(title, body, onClick) {
  // Fires a browser Notification if permission granted (works when tab is open but not focused)
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    const n = new Notification(title, {
      body,
      icon: 'https://media.base44.com/images/public/69fe90d3bbe7ad47925e4a0a/6f5664ee3_25AF8963-CFE6-4D6E-8C5D-A71D6328A9EA.png',
      tag: title,
    });
    if (onClick) n.onclick = onClick;
  }
}

export function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

export function isPWA() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;
}

export function canReceiveBackgroundNotifications() {
  if (!('serviceWorker' in navigator)) return false;
  if (!('Notification' in window)) return false;
  // iOS requires PWA (added to home screen)
  if (isIOS() && !isPWA()) return false;
  return true;
}

// Auth token finder for SW (base44 stores JWT in localStorage)
export function getAuthToken() {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const val = localStorage.getItem(key);
    if (val && val.startsWith('eyJ') && val.includes('.')) return val;
  }
  return null;
}