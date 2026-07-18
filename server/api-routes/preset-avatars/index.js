import { handleOptions, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser, supabaseTable } from '../_lib/supabaseRest.js';

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    const { token } = await getSupabaseUser(req);
    const avatars = await supabaseTable('preset_avatars', {
      token,
      query: '?is_active=eq.true&order=sort_order.asc&limit=200',
    });
    return sendJson(res, 200, { avatars });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Preset avatars request failed' });
  }
}
