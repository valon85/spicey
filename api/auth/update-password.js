import { handleOptions, readJson, sendJson, setCors } from '../_lib/http.js';
import { supabaseAuth } from '../_lib/supabaseRest.js';

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    const { accessToken, refreshToken, password } = await readJson(req);
    if (!accessToken || !refreshToken) return sendJson(res, 400, { error: 'Reset link is expired. Request a new password email.' });
    if (!password || password.length < 6) return sendJson(res, 400, { error: 'Password must be at least 6 characters' });

    const user = await supabaseAuth('/user', {
      method: 'PUT',
      token: accessToken,
      body: { password },
    });

    return sendJson(res, 200, {
      user,
      session: {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: 'bearer',
      },
    });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Password could not be updated' });
  }
}
