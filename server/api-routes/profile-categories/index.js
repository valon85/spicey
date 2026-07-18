import { handleOptions, readJson, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser, supabaseTable } from '../_lib/supabaseRest.js';

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  try {
    const { token, user } = await getSupabaseUser(req);

    if (req.method === 'GET') {
      const url = new URL(req.url, 'http://spicey.local');
      const userId = url.searchParams.get('userId') || user.id;
      const categories = await supabaseTable('profile_categories', {
        token,
        query: `?user_id=eq.${encodeURIComponent(userId)}&order=created_at.desc&limit=50`,
      });
      return sendJson(res, 200, { categories });
    }

    if (req.method === 'POST') {
      const body = await readJson(req);
      const payload = {
        user_id: user.id,
        name: String(body.name || '').trim(),
        description: String(body.description || '').trim(),
        post_ids: Array.isArray(body.post_ids) ? body.post_ids : [],
        is_public: body.is_public !== false,
      };
      if (!payload.name) return sendJson(res, 400, { error: 'Category name is required' });

      const rows = await supabaseTable('profile_categories', {
        method: 'POST',
        token,
        body: payload,
      });
      return sendJson(res, 201, { category: rows[0] });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Profile category request failed' });
  }
}
