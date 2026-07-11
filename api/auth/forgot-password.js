import { handleOptions, readJson, sendJson, setCors } from '../_lib/http.js';
import { supabaseAuth } from '../_lib/supabaseRest.js';

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    const { email, redirectTo } = await readJson(req);
    if (!email) return sendJson(res, 400, { error: 'Email is required' });
    const path = redirectTo
      ? `/recover?redirect_to=${encodeURIComponent(redirectTo)}`
      : '/recover';
    await supabaseAuth(path, {
      method: 'POST',
      body: { email: email.trim().toLowerCase() },
    });
    return sendJson(res, 200, { ok: true });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Could not send reset link' });
  }
}
