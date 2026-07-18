import handler0 from './api-routes/account/delete.js';
import handler1 from './api-routes/ad-campaigns/index.js';
import handler2 from './api-routes/admin/ai.js';
import handler3 from './api-routes/admin/analytics.js';
import handler4 from './api-routes/admin/content.js';
import handler5 from './api-routes/admin/deploy.js';
import handler6 from './api-routes/admin/migration-status.js';
import handler7 from './api-routes/admin/mobile-artifacts.js';
import handler8 from './api-routes/admin/mobile-artifacts/download.js';
import handler9 from './api-routes/admin/moderation.js';
import handler10 from './api-routes/admin/preset-avatars.js';
import handler11 from './api-routes/admin/reels.js';
import handler12 from './api-routes/admin/reports.js';
import handler13 from './api-routes/admin/users/index.js';
import handler14 from './api-routes/auth/forgot-password.js';
import handler15 from './api-routes/auth/login.js';
import handler16 from './api-routes/auth/me.js';
import handler17 from './api-routes/auth/signup.js';
import handler18 from './api-routes/auth/update-password.js';
import handler19 from './api-routes/banuba/token.js';
import handler20 from './api-routes/blocks/[blockId].js';
import handler21 from './api-routes/blocks/index.js';
import handler22 from './api-routes/call-sessions/[sessionId].js';
import handler23 from './api-routes/call-sessions/index.js';
import handler24 from './api-routes/chats/[chatId].js';
import handler25 from './api-routes/chats/[chatId]/messages.js';
import handler26 from './api-routes/chats/index.js';
import handler27 from './api-routes/comment-reactions/index.js';
import handler28 from './api-routes/comments/[commentId].js';
import handler29 from './api-routes/comments/index.js';
import handler30 from './api-routes/follow-requests/[requestId].js';
import handler31 from './api-routes/follow-requests/index.js';
import handler32 from './api-routes/follows/index.js';
import handler33 from './api-routes/legal/consents.js';
import handler34 from './api-routes/live-sessions/[sessionId].js';
import handler35 from './api-routes/live-sessions/index.js';
import handler36 from './api-routes/map/location/index.js';
import handler37 from './api-routes/map/profiles/index.js';
import handler38 from './api-routes/media/upload.js';
import handler39 from './api-routes/messages/[messageId].js';
import handler40 from './api-routes/missed-calls/[missedCallId].js';
import handler41 from './api-routes/missed-calls/index.js';
import handler42 from './api-routes/music/search.js';
import handler43 from './api-routes/notifications/[notificationId].js';
import handler44 from './api-routes/notifications/index.js';
import handler45 from './api-routes/openai/image-edit.js';
import handler46 from './api-routes/openai/image.js';
import handler47 from './api-routes/openai/realtime-session.js';
import handler48 from './api-routes/openai/text.js';
import handler49 from './api-routes/openai/voice-chat.js';
import handler50 from './api-routes/posts/[postId].js';
import handler51 from './api-routes/posts/index.js';
import handler52 from './api-routes/preset-avatars/index.js';
import handler53 from './api-routes/profile-categories/[categoryId].js';
import handler54 from './api-routes/profile-categories/index.js';
import handler55 from './api-routes/profile/[userId].js';
import handler56 from './api-routes/profile/badge/index.js';
import handler57 from './api-routes/profile/me.js';
import handler58 from './api-routes/push/diagnostics.js';
import handler59 from './api-routes/push/register-device.js';
import handler60 from './api-routes/reactions/index.js';
import handler61 from './api-routes/reels/index.js';
import handler62 from './api-routes/reports/index.js';
import handler63 from './api-routes/stories/[storyId].js';
import handler64 from './api-routes/stories/index.js';
import handler65 from './api-routes/subscriptions/admin/[subscriptionId].js';
import handler66 from './api-routes/subscriptions/admin/index.js';
import handler67 from './api-routes/subscriptions/gift/index.js';
import handler68 from './api-routes/subscriptions/status.js';
import handler69 from './api-routes/users/search.js';
import handler70 from './api-routes/youtube/reels.js';

const ROUTES = [
  { group: 'account-legal', pattern: '/api/account/delete', handler: handler0 },
  { group: 'content-social', pattern: '/api/ad-campaigns', handler: handler1 },
  { group: 'admin-push', pattern: '/api/admin/ai', handler: handler2 },
  { group: 'admin-push', pattern: '/api/admin/analytics', handler: handler3 },
  { group: 'admin-push', pattern: '/api/admin/content', handler: handler4 },
  { group: 'admin-push', pattern: '/api/admin/deploy', handler: handler5 },
  { group: 'admin-push', pattern: '/api/admin/migration-status', handler: handler6 },
  { group: 'admin-push', pattern: '/api/admin/mobile-artifacts', handler: handler7 },
  { group: 'admin-push', pattern: '/api/admin/mobile-artifacts/download', handler: handler8 },
  { group: 'admin-push', pattern: '/api/admin/moderation', handler: handler9 },
  { group: 'admin-push', pattern: '/api/admin/preset-avatars', handler: handler10 },
  { group: 'admin-push', pattern: '/api/admin/reels', handler: handler11 },
  { group: 'admin-push', pattern: '/api/admin/reports', handler: handler12 },
  { group: 'admin-push', pattern: '/api/admin/users', handler: handler13 },
  { group: 'account-legal', pattern: '/api/auth/forgot-password', handler: handler14 },
  { group: 'account-legal', pattern: '/api/auth/login', handler: handler15 },
  { group: 'account-legal', pattern: '/api/auth/me', handler: handler16 },
  { group: 'account-legal', pattern: '/api/auth/signup', handler: handler17 },
  { group: 'account-legal', pattern: '/api/auth/update-password', handler: handler18 },
  { group: 'media', pattern: '/api/banuba/token', handler: handler19 },
  { group: 'profiles-users', pattern: '/api/blocks/:blockId', handler: handler20 },
  { group: 'profiles-users', pattern: '/api/blocks', handler: handler21 },
  { group: 'calls-live', pattern: '/api/call-sessions/:sessionId', handler: handler22 },
  { group: 'calls-live', pattern: '/api/call-sessions', handler: handler23 },
  { group: 'chats-messages', pattern: '/api/chats/:chatId', handler: handler24 },
  { group: 'chats-messages', pattern: '/api/chats/:chatId/messages', handler: handler25 },
  { group: 'chats-messages', pattern: '/api/chats', handler: handler26 },
  { group: 'content-social', pattern: '/api/comment-reactions', handler: handler27 },
  { group: 'content-social', pattern: '/api/comments/:commentId', handler: handler28 },
  { group: 'content-social', pattern: '/api/comments', handler: handler29 },
  { group: 'follows-requests', pattern: '/api/follow-requests/:requestId', handler: handler30 },
  { group: 'follows-requests', pattern: '/api/follow-requests', handler: handler31 },
  { group: 'follows-requests', pattern: '/api/follows', handler: handler32 },
  { group: 'account-legal', pattern: '/api/legal/consents', handler: handler33 },
  { group: 'calls-live', pattern: '/api/live-sessions/:sessionId', handler: handler34 },
  { group: 'calls-live', pattern: '/api/live-sessions', handler: handler35 },
  { group: 'map', pattern: '/api/map/location', handler: handler36 },
  { group: 'map', pattern: '/api/map/profiles', handler: handler37 },
  { group: 'media', pattern: '/api/media/upload', handler: handler38 },
  { group: 'chats-messages', pattern: '/api/messages/:messageId', handler: handler39 },
  { group: 'calls-live', pattern: '/api/missed-calls/:missedCallId', handler: handler40 },
  { group: 'calls-live', pattern: '/api/missed-calls', handler: handler41 },
  { group: 'media', pattern: '/api/music/search', handler: handler42 },
  { group: 'notifications-reports', pattern: '/api/notifications/:notificationId', handler: handler43 },
  { group: 'notifications-reports', pattern: '/api/notifications', handler: handler44 },
  { group: 'openai', pattern: '/api/openai/image-edit', handler: handler45 },
  { group: 'openai', pattern: '/api/openai/image', handler: handler46 },
  { group: 'openai', pattern: '/api/openai/realtime-session', handler: handler47 },
  { group: 'openai', pattern: '/api/openai/text', handler: handler48 },
  { group: 'openai', pattern: '/api/openai/voice-chat', handler: handler49 },
  { group: 'content-social', pattern: '/api/posts/:postId', handler: handler50 },
  { group: 'content-social', pattern: '/api/posts', handler: handler51 },
  { group: 'profiles-users', pattern: '/api/preset-avatars', handler: handler52 },
  { group: 'profiles-users', pattern: '/api/profile-categories/:categoryId', handler: handler53 },
  { group: 'profiles-users', pattern: '/api/profile-categories', handler: handler54 },
  { group: 'profiles-users', pattern: '/api/profile/:userId', handler: handler55 },
  { group: 'profiles-users', pattern: '/api/profile/badge', handler: handler56 },
  { group: 'profiles-users', pattern: '/api/profile/me', handler: handler57 },
  { group: 'admin-push', pattern: '/api/push/diagnostics', handler: handler58 },
  { group: 'admin-push', pattern: '/api/push/register-device', handler: handler59 },
  { group: 'content-social', pattern: '/api/reactions', handler: handler60 },
  { group: 'content-social', pattern: '/api/reels', handler: handler61 },
  { group: 'notifications-reports', pattern: '/api/reports', handler: handler62 },
  { group: 'content-social', pattern: '/api/stories/:storyId', handler: handler63 },
  { group: 'content-social', pattern: '/api/stories', handler: handler64 },
  { group: 'subscriptions', pattern: '/api/subscriptions/admin/:subscriptionId', handler: handler65 },
  { group: 'subscriptions', pattern: '/api/subscriptions/admin', handler: handler66 },
  { group: 'subscriptions', pattern: '/api/subscriptions/gift', handler: handler67 },
  { group: 'subscriptions', pattern: '/api/subscriptions/status', handler: handler68 },
  { group: 'profiles-users', pattern: '/api/users/search', handler: handler69 },
  { group: 'media', pattern: '/api/youtube/reels', handler: handler70 },
];

function splitPath(value) {
  return value.split('/').filter(Boolean);
}

function patternMatches(pattern, pathname) {
  const patternParts = splitPath(pattern);
  const pathParts = splitPath(pathname);
  if (patternParts.length !== pathParts.length) return false;
  return patternParts.every((part, index) => part.startsWith(':') || part === pathParts[index]);
}

const SORTED_ROUTES = [...ROUTES].sort((a, b) => splitPath(b.pattern).length - splitPath(a.pattern).length);

function normalizeRoute(req) {
  const url = new URL(req.url || '/', 'https://spicey.local');
  const explicitRoute = url.searchParams.get('__spicey_route');
  if (explicitRoute) {
    url.searchParams.delete('__spicey_route');
    const query = url.searchParams.toString();
    return explicitRoute + (query ? '?' + query : '');
  }
  return url.pathname + url.search;
}

function matchRoute(group, pathname) {
  return SORTED_ROUTES.find((route) => route.group === group && patternMatches(route.pattern, pathname));
}

export function createGroupedHandler(group) {
  return async function groupedApiHandler(req, res) {
    const originalUrl = req.url || '/';
    const routedUrl = normalizeRoute(req);
    const url = new URL(routedUrl, 'https://spicey.local');
    const route = matchRoute(group, url.pathname);

    if (!route) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'API route not found', route: url.pathname }));
      return;
    }

    req.url = url.pathname + url.search;
    try {
      return await route.handler(req, res);
    } finally {
      req.url = originalUrl;
    }
  };
}
