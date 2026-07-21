import { handleOptions, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser, supabaseTable } from '../_lib/supabaseRest.js';

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    const { token } = await getSupabaseUser(req);
    const url = new URL(req.url, 'http://spicey.local');
    const query = (url.searchParams.get('query') || url.searchParams.get('q') || '').trim();
    const limit = url.searchParams.get('limit') || '8';
    const safeQuery = query.replace(/[*,()]/g, '');
    const profileQuery = safeQuery
      ? `?or=(username.ilike.*${encodeURIComponent(safeQuery)}*,full_name.ilike.*${encodeURIComponent(safeQuery)}*)&order=updated_at.desc&limit=${encodeURIComponent(limit)}`
      : `?order=updated_at.desc&limit=${encodeURIComponent(limit)}`;
    const users = await supabaseTable('profiles', {
      token,
      query: profileQuery,
    });

    return sendJson(res, 200, {
      users: users.map((profile) => ({
        id: profile.user_id,
        user_id: profile.user_id,
        username: profile.username,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        verified: profile.is_verified,
      })),
    });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'User search failed' });
  }
}
