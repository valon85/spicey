import { handleOptions, readJson, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser, supabaseTable } from '../_lib/supabaseRest.js';

const BUNDLE_ID = process.env.APN_BUNDLE_ID || 'com.base69fe90d3bbe7ad47925e4a0a.app';
const TOKEN_TYPES = new Set(['apns', 'voip']);

function safeTokenPreview(token = '') {
  return token.length > 12 ? `${token.slice(0, 6)}...${token.slice(-6)}` : token;
}

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    const { user } = await getSupabaseUser(req);
    const body = await readJson(req);
    const token = String(body.token || '').trim();
    const tokenType = TOKEN_TYPES.has(body.token_type) ? body.token_type : 'apns';

    if (!token) return sendJson(res, 400, { error: 'Missing device token' });

    const payload = {
      user_id: user.id,
      token,
      token_type: tokenType,
      platform: body.platform || 'ios',
      device_id: body.device_id || null,
      bundle_id: body.bundle_id || BUNDLE_ID,
      app_version: body.app_version || null,
      environment: body.environment || process.env.APN_ENV || 'production',
      enabled: true,
      updated_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
    };

    const rows = await supabaseTable('push_devices', {
      method: 'POST',
      serviceRole: true,
      query: '?on_conflict=token',
      headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
      body: payload,
    });

    const profileField = tokenType === 'voip' ? 'voip_push_token' : 'push_token';
    await supabaseTable('profiles', {
      method: 'PATCH',
      serviceRole: true,
      query: `?user_id=eq.${encodeURIComponent(user.id)}`,
      body: {
        [profileField]: token,
        platform: 'ios',
        updated_at: new Date().toISOString(),
      },
    }).catch((error) => {
      console.warn(`[Push] Legacy profile token update failed: ${error.message}`);
    });

    console.log(`[Push] Registered ${tokenType} token for user=${user.id} token=${safeTokenPreview(token)}`);
    return sendJson(res, 200, { device: rows[0] || null, token_type: tokenType });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Device registration failed' });
  }
}
