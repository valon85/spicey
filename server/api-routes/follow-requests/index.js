import { handleOptions, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser, supabaseTable } from '../_lib/supabaseRest.js';

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    const { token, user } = await getSupabaseUser(req);
    const requests = await supabaseTable('follow_requests', {
      token,
      query: `?target_id=eq.${encodeURIComponent(user.id)}&status=eq.pending&order=created_at.desc&limit=50`,
    });
    return sendJson(res, 200, { requests });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Follow requests failed' });
  }
}
