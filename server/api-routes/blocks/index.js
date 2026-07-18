import { handleOptions, readJson, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser, supabaseTable } from '../_lib/supabaseRest.js';

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  try {
    const { token, user } = await getSupabaseUser(req);

    if (req.method === 'GET') {
      const blocks = await supabaseTable('blocks', {
        token,
        query: `?blocker_id=eq.${encodeURIComponent(user.id)}&order=created_at.desc`,
      });

      return sendJson(res, 200, { blocks });
    }

    if (req.method === 'POST') {
      const body = await readJson(req);
      if (!body.blocked_id) return sendJson(res, 400, { error: 'Missing blocked_id' });
      const rows = await supabaseTable('blocks', {
        method: 'POST',
        token,
        body: {
          blocker_id: user.id,
          blocked_id: body.blocked_id,
          blocked_username: body.blocked_username || null,
        },
      });
      return sendJson(res, 201, { block: rows[0] });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Blocks request failed' });
  }
}
