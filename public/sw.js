/**
 * Spicey Service Worker
 * Handles background polling for calls, messages, and notifications.
 * Works when the app is closed or backgrounded (PWA mode).
 */

const ICON = 'https://media.base44.com/images/public/69fe90d3bbe7ad47925e4a0a/6f5664ee3_25AF8963-CFE6-4D6E-8C5D-A71D6328A9EA.png';
const POLL_INTERVAL_CALL = 4000;    // 4s — fast poll for calls
const POLL_INTERVAL_NOTIF = 15000;  // 15s — poll for messages/likes

let userId = null;
let token = null;
let baseUrl = null;
let callPollTimer = null;
let notifPollTimer = null;
let seenCallIds = new Set();
let seenNotifIds = new Set();
let watching = false;

// ── Helpers ──────────────────────────────────────────────────────────────────

async function apiFetch(path, method = 'GET', body = null) {
  if (!token || !baseUrl) return null;
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  };
  if (body) opts.body = JSON.stringify(body);
  try {
    const res = await fetch(`${baseUrl}/api/entities${path}`, opts);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

function showNotification(title, body, tag, data = {}, requireInteraction = false) {
  return self.registration.showNotification(title, {
    body,
    icon: ICON,
    badge: ICON,
    tag,
    requireInteraction,
    data,
    vibrate: requireInteraction ? [200, 100, 200, 100, 400] : [100, 50, 100],
  });
}

// ── Call Polling ──────────────────────────────────────────────────────────────

async function pollCalls() {
  if (!userId || !token) return;

  const data = await apiFetch(`/CallSession?filter=${encodeURIComponent(JSON.stringify({ receiver_id: userId, status: 'ringing' }))}&sort=-created_date&limit=3`);
  const sessions = data?.data || data?.results || [];

  for (const session of sessions) {
    if (seenCallIds.has(session.id)) continue;
    const age = Date.now() - new Date(session.created_date || session.created_at || 0).getTime();
    if (age > 60000) continue; // Ignore calls older than 60s

    seenCallIds.add(session.id);

    const callerName = session.caller_name || 'Someone';
    const isVideo = session.type === 'video';

    await showNotification(
      `📞 Incoming ${isVideo ? 'Video' : 'Voice'} Call`,
      `${callerName} is calling you...`,
      `call_${session.id}`,
      { type: 'call', call_session_id: session.id, caller_name: callerName, call_type: session.type },
      true // requireInteraction — stays until user acts
    );
  }
}

// ── Notification Polling ──────────────────────────────────────────────────────

async function pollNotifications() {
  if (!userId || !token) return;

  const data = await apiFetch(`/Notification?filter=${encodeURIComponent(JSON.stringify({ user_id: userId, read: false }))}&sort=-created_date&limit=10`);
  const notifs = data?.data || data?.results || [];

  for (const notif of notifs) {
    if (seenNotifIds.has(notif.id)) continue;
    seenNotifIds.add(notif.id);

    let title = 'Spicey';
    let body = notif.message || 'You have a new notification';

    if (notif.type === 'message') {
      title = '💬 New Message';
    } else if (notif.type === 'like') {
      title = '❤️ New Like';
    } else if (notif.type === 'follow') {
      title = '👤 New Follower';
    } else if (notif.type === 'comment') {
      title = '💬 New Comment';
    } else if (notif.type === 'follow_request') {
      title = '👤 Follow Request';
    }

    await showNotification(title, body, `notif_${notif.id}`, { type: 'notification', notif_id: notif.id });
  }
}

// ── Start / Stop ──────────────────────────────────────────────────────────────

function startWatching() {
  if (watching) return;
  watching = true;

  const runCallPoll = async () => {
    await pollCalls();
    if (watching) callPollTimer = setTimeout(runCallPoll, POLL_INTERVAL_CALL);
  };

  const runNotifPoll = async () => {
    await pollNotifications();
    if (watching) notifPollTimer = setTimeout(runNotifPoll, POLL_INTERVAL_NOTIF);
  };

  runCallPoll();
  runNotifPoll();
}

function stopWatching() {
  watching = false;
  clearTimeout(callPollTimer);
  clearTimeout(notifPollTimer);
}

// ── Message Handler ───────────────────────────────────────────────────────────

self.addEventListener('message', (event) => {
  const msg = event.data;
  if (!msg) return;

  if (msg.type === 'INIT_WATCH') {
    userId = msg.userId;
    token = msg.token;
    baseUrl = msg.baseUrl;
    seenCallIds = new Set();
    seenNotifIds = new Set();
    startWatching();
  }

  if (msg.type === 'STOP_WATCH') {
    stopWatching();
    userId = null;
    token = null;
  }

  if (msg.type === 'READY') {
    // App just opened — stop background polling (app handles it in-process)
    stopWatching();
  }
});

// ── Notification Click Handler ────────────────────────────────────────────────

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification.data || {};

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing tab if open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.postMessage({ type: 'NOTIFICATION_CLICKED', data });
          return;
        }
      }
      // Otherwise open the app
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// ── Install / Activate ────────────────────────────────────────────────────────

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(clients.claim()));
