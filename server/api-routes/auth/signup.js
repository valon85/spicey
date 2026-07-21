import { handleOptions, readJson, sendJson, setCors } from '../_lib/http.js';
import { supabaseAuth } from '../_lib/supabaseRest.js';

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    const { email, password, fullName, username, legalAccepted, legalVersion } = await readJson(req);
    if (!email || !password) return sendJson(res, 400, { error: 'Email and password are required' });
    if (password.length < 6) return sendJson(res, 400, { error: 'Password must be at least 6 characters' });
    if (legalAccepted !== true || legalVersion !== '3.0') {
      return sendJson(res, 422, { error: 'You must accept the current Terms, Privacy Policy, and Community Guidelines' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const data = await supabaseAuth('/signup', {
      method: 'POST',
      body: {
        email: cleanEmail,
        password,
        data: {
          full_name: fullName || '',
          username: username || cleanEmail.split('@')[0],
          legal_accepted_at: new Date().toISOString(),
          terms_version: legalVersion,
          privacy_version: legalVersion,
          guidelines_version: legalVersion,
        },
      },
    });

    return sendJson(res, 200, {
      session: data.access_token ? {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: data.expires_at,
        token_type: data.token_type,
      } : null,
      user: data.user,
      needs_email_confirmation: !data.access_token,
    });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Signup failed' });
  }
}
