import { handleOptions, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser } from '../_lib/supabaseRest.js';

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'POST' && req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    await getSupabaseUser(req);
    const token = process.env.BANUBA_CLIENT_TOKEN || '';
    if (!token) {
      return sendJson(res, 200, {
        token: null,
        configured: false,
        message: 'BANUBA_CLIENT_TOKEN is not configured on the Spicey API server.',
      });
    }
    return sendJson(res, 200, { token, configured: true });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Banuba token request failed' });
  }
}
