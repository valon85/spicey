import { handleOptions, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser, supabaseTable } from '../_lib/supabaseRest.js';

const ADMIN_EMAILS = new Set(['info@spicey.live', 'valondervishi13@gmail.com', 'vlora.dervisi@gmail.com']);

function secretStatus(name) {
  return process.env[name] ? '✅ Configured' : '❌ Missing';
}

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    const { user } = await getSupabaseUser(req);
    if (!ADMIN_EMAILS.has(user.email)) {
      return sendJson(res, 403, { error: 'Admin access required' });
    }

    const [pushRows, voipRows, profileRows] = await Promise.all([
      supabaseTable('push_devices', {
        serviceRole: true,
        query: '?select=user_id&token_type=eq.apns&enabled=eq.true&limit=10000',
      }).catch(() => []),
      supabaseTable('push_devices', {
        serviceRole: true,
        query: '?select=user_id&token_type=eq.voip&enabled=eq.true&limit=10000',
      }).catch(() => []),
      supabaseTable('profiles', {
        serviceRole: true,
        query: '?select=user_id&limit=10000',
      }).catch(() => []),
    ]);

    const secrets = {
      APN_KEY_ID: secretStatus('APN_KEY_ID'),
      APN_TEAM_ID: secretStatus('APN_TEAM_ID'),
      APN_BUNDLE_ID: secretStatus('APN_BUNDLE_ID'),
      APN_AUTH_KEY: secretStatus('APN_AUTH_KEY'),
      APN_ENV: process.env.APN_ENV ? `✅ ${process.env.APN_ENV}` : '❌ Missing',
    };
    const missing = Object.values(secrets).some((value) => String(value).startsWith('❌'));

    return sendJson(res, 200, {
      status: missing ? 'INCOMPLETE' : 'OK',
      report: {
        secrets,
        key_validation: process.env.APN_AUTH_KEY ? '✅ APNs auth key env is present' : '❌ APNs auth key is missing',
        jwt_generation: missing ? '⚠️ Skipped until all APNs secrets are configured' : '✅ Ready for APNs JWT generation',
        registered_tokens: {
          voip_tokens: voipRows.length,
          push_tokens: pushRows.length,
          total_profiles: profileRows.length,
        },
        instructions: missing
          ? ['Add the missing APNs environment variables before testing real iPhone push delivery.']
          : ['APNs environment variables are present. Next step: enable the production APNs sender endpoint.'],
      },
    });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Push diagnostics failed' });
  }
}
