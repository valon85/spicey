import { handleOptions, readJson, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser, supabaseTable } from '../_lib/supabaseRest.js';

async function currentProfile(token, user) {
  const rows = await supabaseTable('profiles', {
    serviceRole: true,
    query: `?user_id=eq.${encodeURIComponent(user.id)}&limit=1`,
  }).catch(() => []);
  return rows[0] || {};
}

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  try {
    const { token, user } = await getSupabaseUser(req);

    if (req.method === 'GET') {
      const url = new URL(req.url, 'http://spicey.local');
      const read = url.searchParams.get('read');
      const limit = url.searchParams.get('limit') || '50';
      const params = new URLSearchParams({
        user_id: `eq.${user.id}`,
        order: 'created_at.desc',
        limit,
      });
      if (read !== null) params.set('read', `eq.${read}`);
      const notifications = await supabaseTable('notifications', {
        serviceRole: true,
        query: `?${params.toString()}`,
      });
      return sendJson(res, 200, { notifications });
    }

    if (req.method === 'POST') {
      const body = await readJson(req);
      if (!body.user_id) return sendJson(res, 400, { error: 'Missing user_id' });
      const profile = await currentProfile(token, user);
      const rows = await supabaseTable('notifications', {
        method: 'POST',
        serviceRole: true,
        body: {
          user_id: body.user_id,
          actor_id: user.id,
          actor_username: profile.username || user.email?.split('@')[0] || 'user',
          actor_avatar: profile.avatar_url || null,
          type: body.type || 'system',
          message: body.message || '',
          post_id: body.post_id || null,
          chat_id: body.chat_id || null,
          read: false,
        },
      });
      return sendJson(res, 201, { notification: rows[0] });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Notifications request failed' });
  }
}
