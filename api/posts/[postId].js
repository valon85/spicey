import { handleOptions, readJson, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser, supabaseTable } from '../_lib/supabaseRest.js';

function readPostId(req) {
  const url = new URL(req.url, 'http://spicey.local');
  const parts = url.pathname.split('/').filter(Boolean);
  return decodeURIComponent(parts[parts.length - 1] || '');
}

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  try {
    const { token } = await getSupabaseUser(req);
    const postId = readPostId(req);
    if (!postId) return sendJson(res, 400, { error: 'Missing post id' });

    if (req.method === 'PATCH') {
      const body = await readJson(req);
      const allowed = ['caption', 'visibility', 'location', 'tags', 'hashtags', 'shares_count', 'map_visible', 'map_city'];
      const updates = {};
      allowed.forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(body, key)) updates[key] = body[key];
      });
      updates.updated_at = new Date().toISOString();
      const rows = await supabaseTable('posts', {
        method: 'PATCH',
        token,
        query: `?id=eq.${encodeURIComponent(postId)}`,
        body: updates,
      });
      return sendJson(res, 200, { post: rows[0] });
    }

    if (req.method === 'DELETE') {
      await supabaseTable('posts', {
        method: 'DELETE',
        token,
        query: `?id=eq.${encodeURIComponent(postId)}`,
      });
      return sendJson(res, 200, { ok: true });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Post request failed' });
  }
}
