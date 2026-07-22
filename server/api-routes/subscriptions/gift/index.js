import { handleOptions, readJson, sendJson, setCors } from '../../_lib/http.js';
import { getSupabaseUser, supabaseTable } from '../../_lib/supabaseRest.js';

const ALLOWED_PLANS = new Set(['vip', 'creator', 'business']);
const ADMIN_EMAILS = new Set(['info@spicey.live', 'valondervishi13@gmail.com', 'vlora.dervisi@gmail.com']);

function subscriptionEnd({ days, months }) {
  if (Number(days) >= 9999 || Number(months) === 999) return new Date('2099-12-31T23:59:59.000Z').toISOString();
  const date = new Date();
  if (Number.isFinite(Number(days)) && Number(days) > 0) date.setDate(date.getDate() + Number(days));
  else date.setMonth(date.getMonth() + Number(months || 1));
  return date.toISOString();
}

async function findRecipient(token, { userId, email, username }) {
  if (userId) {
    const rows = await supabaseTable('profiles', {
      token,
      query: `?user_id=eq.${encodeURIComponent(userId)}&limit=1`,
    });
    if (rows[0]) return rows[0];
  }

  if (email) {
    const rows = await supabaseTable('profiles', {
      token,
      query: `?email=ilike.${encodeURIComponent(email)}&limit=1`,
    });
    if (rows[0]) return rows[0];
  }

  if (username) {
    const clean = String(username).replace(/^@/, '');
    const rows = await supabaseTable('profiles', {
      token,
      query: `?username=ilike.${encodeURIComponent(clean)}&limit=1`,
    });
    if (rows[0]) return rows[0];
  }

  return null;
}

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    const { token, user } = await getSupabaseUser(req);
    if (!ADMIN_EMAILS.has(String(user.email || '').toLowerCase())) {
      return sendJson(res, 403, { error: 'Admin access required' });
    }

    const body = await readJson(req);
    const plan = String(body.planType || body.plan_type || '').trim();
    const months = Number(body.durationMonths || body.duration_months || 1);
    const days = Number(body.durationDays || body.duration_days || 0);
    if (!ALLOWED_PLANS.has(plan)) return sendJson(res, 400, { error: 'Invalid plan type' });

    const recipient = await findRecipient(token, {
      userId: body.recipientUserId || body.recipient_user_id,
      email: body.recipientEmail || body.recipient_email,
      username: body.recipientUsername || body.recipient_username,
    });
    if (!recipient?.user_id) return sendJson(res, 404, { error: 'Recipient profile not found' });

    const subscriptionRows = await supabaseTable('subscriptions', {
      method: 'POST',
      serviceRole: true,
      body: {
        user_id: recipient.user_id,
        status: 'active',
        plan,
        provider: 'admin_gift',
        granted_by_admin_email: user.email,
        grant_reason: body.reason || body.grant_reason || null,
        current_period_start: new Date().toISOString(),
        current_period_end: subscriptionEnd({ days, months }),
      },
    });

    await supabaseTable('notifications', {
      method: 'POST',
      serviceRole: true,
      body: {
        user_id: recipient.user_id,
        actor_id: user.id,
        actor_username: 'Spicey',
        actor_avatar: null,
        type: 'system',
        message: `gifted you ${plan} access`,
        read: false,
      },
    }).catch(() => {});

    return sendJson(res, 201, {
      success: true,
      message: `${plan} access gifted to ${recipient.username || recipient.email || 'user'}.`,
      subscription: subscriptionRows[0],
    });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Gift subscription failed' });
  }
}
