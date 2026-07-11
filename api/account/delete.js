import { handleOptions, readJson, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser, supabaseAdminAuth } from '../_lib/supabaseRest.js';

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    const { user } = await getSupabaseUser(req);
    const body = await readJson(req);
    if (body.confirm !== 'DELETE') {
      return sendJson(res, 400, { error: 'Delete confirmation is required' });
    }

    await supabaseAdminAuth(`/users/${encodeURIComponent(user.id)}`, { method: 'DELETE' });
    return sendJson(res, 200, { ok: true });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Delete account failed' });
  }
}
