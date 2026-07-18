import { handleOptions, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser, supabaseTable } from '../_lib/supabaseRest.js';

function readUserId(req) {
  const url = new URL(req.url, 'http://spicey.local');
  const fromQuery = url.searchParams.get('userId');
  if (fromQuery) return fromQuery;
  const parts = url.pathname.split('/').filter(Boolean);
  return decodeURIComponent(parts[parts.length - 1] || '');
}

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    const { token } = await getSupabaseUser(req);
    const userId = readUserId(req);
    if (!userId) return sendJson(res, 400, { error: 'Missing user id' });

    const rows = await supabaseTable('profiles', {
      token,
      query: `?user_id=eq.${encodeURIComponent(userId)}&limit=1`,
    });

    if (!rows[0]) return sendJson(res, 404, { error: 'Profile not found' });
    return sendJson(res, 200, { profile: rows[0] });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Profile request failed' });
  }
}
