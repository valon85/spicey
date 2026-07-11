import { handleOptions, readJson, sendJson, setCors } from '../../_lib/http.js';
import { getSupabaseUser, supabaseTable } from '../../_lib/supabaseRest.js';

const ALLOWED_BADGES = new Set(['vip', 'creator', 'business']);

async function ensureProfile(token, user) {
  const rows = await supabaseTable('profiles', {
    token,
    query: `?user_id=eq.${encodeURIComponent(user.id)}&limit=1`,
  });
  if (rows[0]) return rows[0];

  const created = await supabaseTable('profiles', {
    method: 'POST',
    token,
    body: {
      user_id: user.id,
      email: user.email || '',
      username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      avatar_url: user.user_metadata?.avatar_url || '',
    },
  });
  return created[0];
}

async function hasActiveSubscription(token, user) {
  if (user.email === 'info@spicey.live') return true;
  const rows = await supabaseTable('subscriptions', {
    token,
    query: `?user_id=eq.${encodeURIComponent(user.id)}&status=eq.active&limit=1`,
  });
  return rows.length > 0;
}

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    const { token, user } = await getSupabaseUser(req);
    const body = await readJson(req);
    const badgeType = String(body.badgeType || body.badge_type || '').trim();
    if (!ALLOWED_BADGES.has(badgeType)) {
      return sendJson(res, 400, { error: 'Invalid badge type' });
    }

    if (!(await hasActiveSubscription(token, user))) {
      return sendJson(res, 402, {
        error: 'Active subscription required',
        requiresSubscription: true,
      });
    }

    await ensureProfile(token, user);
    const rows = await supabaseTable('profiles', {
      method: 'PATCH',
      token,
      query: `?user_id=eq.${encodeURIComponent(user.id)}`,
      body: {
        is_verified: true,
        verification_badge: badgeType,
        updated_at: new Date().toISOString(),
      },
    });

    return sendJson(res, 200, {
      success: true,
      message: `${badgeType} badge applied.`,
      profile: rows[0],
    });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Badge update failed' });
  }
}
