import { handleOptions, readJson, sendJson, setCors } from '../_lib/http.js';
import { supabaseAuth } from '../_lib/supabaseRest.js';

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    const { email, password } = await readJson(req);
    if (!email || !password) return sendJson(res, 400, { error: 'Email and password are required' });

    const data = await supabaseAuth('/token?grant_type=password', {
      method: 'POST',
      body: { email: email.trim().toLowerCase(), password },
    });

    return sendJson(res, 200, {
      session: {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: data.expires_at || (data.expires_in ? Math.floor(Date.now() / 1000) + Number(data.expires_in) : undefined),
        token_type: data.token_type,
      },
      user: data.user,
    });
  } catch (error) {
    return sendJson(res, 401, { error: error.message || 'Login failed' });
  }
}
