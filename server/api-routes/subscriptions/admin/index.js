import { handleOptions, sendJson, setCors } from '../../_lib/http.js';
import { getSupabaseUser, supabaseTable } from '../../_lib/supabaseRest.js';

const ADMIN_EMAILS = new Set(['info@spicey.live', 'valondervishi13@gmail.com', 'vlora.dervisi@gmail.com']);

function daysRemaining(endDate) {
  if (!endDate) return 0;
  const end = new Date(endDate).getTime();
  if (!Number.isFinite(end)) return 0;
  return Math.max(0, Math.ceil((end - Date.now()) / 86400000));
}

function normalizeSubscription(subscription, profile) {
  const plan = subscription.plan_type || subscription.plan || 'vip';
  const isLifetime = subscription.current_period_end
    ? new Date(subscription.current_period_end).getFullYear() >= 2099
    : false;

  return {
    ...subscription,
    plan,
    plan_type: plan,
    user_profile: profile || null,
    is_lifetime: isLifetime,
    days_remaining: isLifetime ? 'Lifetime' : daysRemaining(subscription.current_period_end),
    granted_by_admin_email: subscription.granted_by_admin_email || null,
    grant_reason: subscription.grant_reason || null,
  };
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

    const subscriptions = await supabaseTable('subscriptions', {
      serviceRole: true,
      query: '?status=eq.active&order=created_at.desc&limit=1000',
    });

    const userIds = [...new Set(subscriptions.map((sub) => sub.user_id).filter(Boolean))];
    const profiles = userIds.length
      ? await supabaseTable('profiles', {
          serviceRole: true,
          query: `?user_id=in.(${userIds.map(encodeURIComponent).join(',')})`,
        })
      : [];
    const profileByUserId = Object.fromEntries(profiles.map((profile) => [profile.user_id, profile]));

    return sendJson(res, 200, {
      subscriptions: subscriptions.map((subscription) =>
        normalizeSubscription(subscription, profileByUserId[subscription.user_id])
      ),
    });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Admin subscriptions request failed' });
  }
}
