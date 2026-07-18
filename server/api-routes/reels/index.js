import { handleOptions, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser, supabaseTable } from '../_lib/supabaseRest.js';

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    const { token } = await getSupabaseUser(req);
    const reels = await supabaseTable('posts', {
      token,
      query: '?post_type=eq.reel&order=created_at.desc&limit=50',
    });
    return sendJson(res, 200, { reels });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Reels request failed' });
  }
}
