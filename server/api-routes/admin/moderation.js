import { handleOptions, readJson, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser, supabaseAdminAuth, supabaseTable } from '../_lib/supabaseRest.js';

const ADMIN_EMAILS = new Set(['info@spicey.live', 'valondervishi13@gmail.com', 'vlora.dervisi@gmail.com']);
const STATUS_BY_ACTION = {
  lock: 'locked',
  suspend: 'suspended',
  ban: 'banned',
  restore: 'active',
};

async function requireAdmin(req) {
  const { user } = await getSupabaseUser(req);
  if (!ADMIN_EMAILS.has(user.email)) {
    const error = new Error('Admin access required');
    error.status = 403;
    throw error;
  }
  return user;
}

function normalizeUser(profile) {
  return {
    id: profile.user_id,
    profile_id: profile.id,
    email: profile.email,
    username: profile.username,
    full_name: profile.full_name,
    avatar_url: profile.avatar_url,
    role: ADMIN_EMAILS.has(profile.email) ? 'admin' : 'user',
    verified: Boolean(profile.is_verified),
    account_status: profile.account_status || 'active',
    posting_disabled: Boolean(profile.posting_disabled),
    messaging_disabled: Boolean(profile.messaging_disabled),
    moderation_reason: profile.moderation_reason || '',
    created_date: profile.created_at,
    created_at: profile.created_at,
  };
}

async function listUsers({ status = 'all', query = '' } = {}) {
  const params = new URLSearchParams({
    order: 'created_at.desc',
    limit: '1000',
  });
  if (status && status !== 'all') params.set('account_status', `eq.${status}`);
  const profiles = await supabaseTable('profiles', {
    serviceRole: true,
    query: `?${params.toString()}`,
  });
  const normalized = profiles.map(normalizeUser);
  const clean = String(query || '').trim().toLowerCase();
  return clean
    ? normalized.filter((user) =>
        user.email?.toLowerCase().includes(clean) ||
        user.username?.toLowerCase().includes(clean) ||
        user.full_name?.toLowerCase().includes(clean)
      )
    : normalized;
}

async function userActivity(userId) {
  const [posts, comments, reports] = await Promise.all([
    supabaseTable('posts', {
      serviceRole: true,
      query: `?author_id=eq.${encodeURIComponent(userId)}&select=id&limit=10000`,
    }).catch(() => []),
    supabaseTable('comments', {
      serviceRole: true,
      query: `?author_id=eq.${encodeURIComponent(userId)}&select=id&limit=10000`,
    }).catch(() => []),
    supabaseTable('reports', {
      serviceRole: true,
      query: `?reported_user_id=eq.${encodeURIComponent(userId)}&order=created_at.desc&limit=50`,
    }).catch(() => []),
  ]);
  return {
    posts_count: posts.length,
    comments_count: comments.length,
    reports_count: reports.length,
    reports_against: reports,
  };
}

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  try {
    const admin = await requireAdmin(req);

    if (req.method === 'GET') {
      const url = new URL(req.url, 'http://spicey.local');
      const action = url.searchParams.get('action') || 'list';
      if (action === 'activity') {
        const userId = url.searchParams.get('userId') || url.searchParams.get('user_id');
        if (!userId) return sendJson(res, 400, { error: 'Missing user id' });
        return sendJson(res, 200, { activity: await userActivity(userId) });
      }
      const users = await listUsers({
        status: url.searchParams.get('status') || 'all',
        query: url.searchParams.get('query') || '',
      });
      return sendJson(res, 200, { users });
    }

    if (req.method === 'POST') {
      const body = await readJson(req);
      const targetUserId = body.target_user_id || body.targetUserId;
      const action = String(body.action || '').trim();
      const reason = body.reason || `${action} by admin`;
      if (!targetUserId || !action) return sendJson(res, 400, { error: 'Missing moderation target/action' });

      if (action === 'delete') {
        await supabaseAdminAuth(`/users/${encodeURIComponent(targetUserId)}`, { method: 'DELETE' });
        return sendJson(res, 200, { success: true, action });
      }

      const updates = {
        moderation_reason: reason,
        moderated_by: admin.email,
        moderated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      if (STATUS_BY_ACTION[action]) updates.account_status = STATUS_BY_ACTION[action];
      if (action === 'disable_posting') updates.posting_disabled = true;
      if (action === 'disable_messaging') updates.messaging_disabled = true;
      if (action === 'restore') {
        updates.posting_disabled = false;
        updates.messaging_disabled = false;
      }

      const rows = await supabaseTable('profiles', {
        method: 'PATCH',
        serviceRole: true,
        query: `?user_id=eq.${encodeURIComponent(targetUserId)}`,
        body: updates,
      });

      await supabaseTable('notifications', {
        method: 'POST',
        serviceRole: true,
        body: {
          user_id: targetUserId,
          actor_id: admin.id,
          actor_username: 'Spicey Admin',
          type: 'moderation',
          message: action === 'warn' ? `Warning: ${reason}` : `Account action: ${action}. ${reason}`,
          read: false,
        },
      }).catch(() => {});

      return sendJson(res, 200, { success: true, action, profile: rows[0] || null });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    return sendJson(res, error.status || 400, { error: error.message || 'Admin moderation request failed' });
  }
}
