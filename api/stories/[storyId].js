import { handleOptions, readJson, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser, supabaseTable } from '../_lib/supabaseRest.js';

function readStoryId(req) {
  const url = new URL(req.url, 'http://spicey.local');
  const parts = url.pathname.split('/').filter(Boolean);
  return decodeURIComponent(parts[parts.length - 1] || '');
}

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  try {
    const { token, user } = await getSupabaseUser(req);
    const storyId = readStoryId(req);
    if (!storyId) return sendJson(res, 400, { error: 'Missing story id' });

    if (req.method === 'PATCH') {
      const body = await readJson(req);
      const allowed = ['caption', 'location', 'map_visible', 'map_city'];
      const updates = {};
      allowed.forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(body, key)) updates[key] = body[key];
      });
      updates.updated_at = new Date().toISOString();
      const rows = await supabaseTable('stories', {
        method: 'PATCH',
        token,
        query: `?id=eq.${encodeURIComponent(storyId)}&user_id=eq.${encodeURIComponent(user.id)}`,
        body: updates,
      });
      return sendJson(res, 200, { story: rows[0] });
    }

    if (req.method === 'DELETE') {
      await supabaseTable('stories', {
        method: 'DELETE',
        token,
        query: `?id=eq.${encodeURIComponent(storyId)}&user_id=eq.${encodeURIComponent(user.id)}`,
      });
      return sendJson(res, 200, { ok: true });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Story request failed' });
  }
}
