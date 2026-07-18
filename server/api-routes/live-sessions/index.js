import { handleOptions, readJson, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser, supabaseTable } from '../_lib/supabaseRest.js';

async function currentProfile(token, user) {
  const rows = await supabaseTable('profiles', {
    token,
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
      const status = url.searchParams.get('status') || 'active';
      const limit = url.searchParams.get('limit') || '20';
      const sessions = await supabaseTable('live_sessions', {
        token,
        query: `?status=eq.${encodeURIComponent(status)}&order=started_at.desc&limit=${encodeURIComponent(limit)}`,
      });
      return sendJson(res, 200, { sessions });
    }

    if (req.method === 'POST') {
      const body = await readJson(req);
      const profile = await currentProfile(token, user);
      const rows = await supabaseTable('live_sessions', {
        method: 'POST',
        token,
        body: {
          broadcaster_id: user.id,
          broadcaster_name: profile.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          broadcaster_username: profile.username || user.email?.split('@')[0] || 'user',
          broadcaster_avatar: profile.avatar_url || '',
          title: body.title || null,
          stream_url: body.stream_url || null,
          replay_url: body.replay_url || null,
          status: body.status || 'active',
          viewer_count: Number(body.viewer_count || 0),
        },
      });
      return sendJson(res, 201, { session: rows[0] });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Live session request failed' });
  }
}
