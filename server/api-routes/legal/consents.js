import { handleOptions, readJson, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser, supabaseTable } from '../_lib/supabaseRest.js';

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  try {
    const { token, user } = await getSupabaseUser(req);

    if (req.method === 'GET') {
      const consents = await supabaseTable('legal_consents', {
        token,
        query: `?user_id=eq.${encodeURIComponent(user.id)}&order=accepted_at.desc&limit=1`,
      });
      return sendJson(res, 200, { consent: consents[0] || null });
    }

    if (req.method === 'POST') {
      const body = await readJson(req);
      const created = await supabaseTable('legal_consents', {
        method: 'POST',
        token,
        body: {
          user_id: user.id,
          accepted_at: body.accepted_at || new Date().toISOString(),
          ip_address: body.ip_address || req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown',
          user_agent: body.user_agent || req.headers['user-agent'] || '',
          platform: body.platform || 'web',
          terms_version: body.terms_version || '',
          privacy_version: body.privacy_version || '',
          guidelines_version: body.guidelines_version || '',
          app_version: body.app_version || '1.0.0',
          consent_method: body.consent_method || 'onboarding',
          re_consent_reason: body.re_consent_reason || '',
        },
      });
      return sendJson(res, 200, { consent: created[0] });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Legal consent request failed' });
  }
}
