import { getBearerToken, supabaseAuth } from '../_lib/supabaseRest.js';
import { handleOptions, sendJson, setCors } from '../_lib/http.js';

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    const token = getBearerToken(req);
    if (!token) return sendJson(res, 401, { error: 'Missing session token' });
    const user = await supabaseAuth('/user', { token });
    return sendJson(res, 200, { user });
  } catch (error) {
    return sendJson(res, 401, { error: error.message || 'Session expired' });
  }
}
