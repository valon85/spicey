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
      const params = new URLSearchParams();
      const userId = url.searchParams.get('userId') || url.searchParams.get('user_id');
      if (userId) params.set('user_id', `eq.${userId}`);
      if (url.searchParams.get('active') !== 'false') {
        params.set('expires_at', `gt.${new Date().toISOString()}`);
      }
      params.set('order', 'created_at.desc');
      params.set('limit', url.searchParams.get('limit') || '50');
      const stories = await supabaseTable('stories', {
        token,
        query: `?${params.toString()}`,
      });
      return sendJson(res, 200, { stories });
    }

    if (req.method === 'POST') {
      const body = await readJson(req);
      const profile = await currentProfile(token, user);
      const expiresAt = body.expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const created = await supabaseTable('stories', {
        method: 'POST',
        token,
        body: {
          user_id: user.id,
          username: profile.username || user.email?.split('@')[0] || 'user',
          user_avatar: profile.avatar_url || '',
          image_url: body.image_url || '',
          video_url: body.video_url || '',
          caption: body.caption || '',
          story_type: body.story_type || (body.video_url ? 'video' : body.image_url ? 'photo' : 'text'),
          bg_preset: body.bg_preset || null,
          bg_value: body.bg_value || null,
          font_family: body.font_family || null,
          font_id: body.font_id || null,
          text_alignment: body.text_alignment || null,
          font_size: body.font_size || null,
          location: body.location || null,
          views: [],
          expires_at: expiresAt,
        },
      });
      return sendJson(res, 200, { story: created[0] });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Stories request failed' });
  }
}
