import { handleOptions, readJson, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser, supabaseTable } from '../_lib/supabaseRest.js';

function readCategoryId(req) {
  const url = new URL(req.url, 'http://spicey.local');
  const parts = url.pathname.split('/').filter(Boolean);
  return decodeURIComponent(parts[parts.length - 1] || '');
}

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  try {
    const { token } = await getSupabaseUser(req);
    const categoryId = readCategoryId(req);
    if (!categoryId) return sendJson(res, 400, { error: 'Missing category id' });

    if (req.method === 'PATCH') {
      const body = await readJson(req);
      const updates = {};
      ['name', 'description', 'post_ids', 'is_public'].forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(body, key)) updates[key] = body[key];
      });
      updates.updated_at = new Date().toISOString();

      const rows = await supabaseTable('profile_categories', {
        method: 'PATCH',
        token,
        query: `?id=eq.${encodeURIComponent(categoryId)}`,
        body: updates,
      });
      return sendJson(res, 200, { category: rows[0] });
    }

    if (req.method === 'DELETE') {
      await supabaseTable('profile_categories', {
        method: 'DELETE',
        token,
        query: `?id=eq.${encodeURIComponent(categoryId)}`,
      });
      return sendJson(res, 200, { ok: true });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Profile category request failed' });
  }
}
