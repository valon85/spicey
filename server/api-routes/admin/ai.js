import { handleOptions, readJson, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser, supabaseTable } from '../_lib/supabaseRest.js';

const ADMIN_EMAILS = new Set(['info@spicey.live', 'valondervishi13@gmail.com', 'vlora.dervisi@gmail.com']);

async function requireAdmin(req) {
  const { user } = await getSupabaseUser(req);
  if (!ADMIN_EMAILS.has(user.email)) {
    const error = new Error('Admin access required');
    error.status = 403;
    throw error;
  }
  return user;
}

function buildHealth() {
  const hasOpenAiKey = Boolean(process.env.OPENAI_API_KEY);
  const now = new Date().toISOString();
  const apiStatus = hasOpenAiKey ? 'ok' : 'error';
  const recommendations = [];

  if (!hasOpenAiKey) {
    recommendations.push('Add OPENAI_API_KEY to the server environment before using live AI features.');
  }
  recommendations.push('Keep OpenAI keys server-side only. Never add them to Vite client variables.');
  recommendations.push('Use Realtime API for voice mode and keep legacy text/TTS paths only as fallback.');

  return {
    status: hasOpenAiKey ? 'healthy' : 'degraded',
    timestamp: now,
    api_key_configured: hasOpenAiKey,
    tests: {
      api_connection: {
        status: apiStatus,
        latency_ms: hasOpenAiKey ? 0 : null,
        ...(hasOpenAiKey ? {} : { error: 'OPENAI_API_KEY is not configured on the server.' }),
      },
      voice_tts: {
        status: apiStatus,
        latency_ms: hasOpenAiKey ? 0 : null,
        ...(hasOpenAiKey ? {} : { error: 'Voice requires a configured OpenAI API key.' }),
      },
      language_detection: {
        status: hasOpenAiKey ? 'ok' : 'error',
        detected: hasOpenAiKey ? 'auto' : 'unavailable',
        ...(hasOpenAiKey ? {} : { error: 'Language detection is available after OpenAI is configured.' }),
      },
    },
    potential_issues: {
      old_files: [],
      rate_limit_risk: 'ok',
      voice_delay_risk: 'ok',
    },
    recommendations,
  };
}

async function sendInAppAnnouncement({ admin, subject, body, emailType, targetUserIds = [] }) {
  const cleanTargetIds = Array.isArray(targetUserIds)
    ? targetUserIds.map((id) => String(id || '').trim()).filter(Boolean)
    : [];
  const query = cleanTargetIds.length
    ? `?user_id=in.(${cleanTargetIds.map(encodeURIComponent).join(',')})&select=user_id&limit=10000`
    : '?select=user_id&limit=10000';
  const profiles = await supabaseTable('profiles', {
    serviceRole: true,
    query,
  });
  const targets = profiles.map((profile) => profile.user_id).filter(Boolean);
  let successful = 0;

  await Promise.all(targets.map(async (userId) => {
    try {
      await supabaseTable('notifications', {
        method: 'POST',
        serviceRole: true,
        body: {
          user_id: userId,
          actor_id: admin.id,
          actor_username: 'Spicey Admin',
          type: emailType || 'announcement',
          message: `${subject}\n\n${body}`,
          read: false,
        },
      });
      successful += 1;
    } catch (_) {
      // Keep admin broadcast best-effort so one bad row does not stop every recipient.
    }
  }));

  return {
    success: true,
    transport: 'in_app_notification',
    message: 'Announcement created as an in-app Spicey notification. External email provider is not connected yet.',
    results: {
      successful,
      total: targets.length,
    },
  };
}

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  try {
    const admin = await requireAdmin(req);

    if (req.method === 'GET') {
      return sendJson(res, 200, buildHealth());
    }

    if (req.method === 'POST') {
      const body = await readJson(req);
      const action = String(body.action || '').trim();

      if (action === 'set_maintenance') {
        return sendJson(res, 200, {
          success: true,
          enabled: Boolean(body.enabled),
          message: body.message || 'Maintenance mode updated.',
          affected_features: body.affected_features || [],
          recorded_by: admin.email,
          recorded_at: new Date().toISOString(),
          note: 'Maintenance state is recorded by the Spicey API response. Persisted admin settings can be added when the settings table is introduced.',
        });
      }

      if (action === 'send_email') {
        const subject = String(body.subject || '').trim();
        const messageBody = String(body.body || '').trim();
        if (!subject || !messageBody) {
          return sendJson(res, 400, { error: 'Subject and body are required' });
        }
        const result = await sendInAppAnnouncement({
          admin,
          subject,
          body: messageBody,
          emailType: body.email_type || body.emailType || 'announcement',
          targetUserIds: body.target_user_ids || body.targetUserIds || [],
        });
        return sendJson(res, 200, result);
      }

      return sendJson(res, 400, { error: 'Unsupported admin AI action' });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    return sendJson(res, error.status || 400, { error: error.message || 'Admin AI request failed' });
  }
}
