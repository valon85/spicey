import { handleOptions, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser, supabaseTable } from '../_lib/supabaseRest.js';

const ADMIN_EMAILS = new Set([
  'info@spicey.live',
  'valondervishi13@gmail.com',
  'vlora.dervisi@gmail.com',
]);

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    const { token, user } = await getSupabaseUser(req);
    if (ADMIN_EMAILS.has(String(user.email || '').trim().toLowerCase())) {
      const subscription = {
        user_id: user.id,
        status: 'active',
        plan: 'business',
        plan_type: 'business',
        current_period_end: '2099-12-31T23:59:59.000Z',
        isAdmin: true,
      };
      return sendJson(res, 200, {
        is_vip: true,
        hasSubscription: true,
        planType: 'business',
        subscription,
      });
    }
    const subscriptions = await supabaseTable('subscriptions', {
      token,
      query: `?user_id=eq.${encodeURIComponent(user.id)}&status=in.(active,trialing)&order=created_at.desc&limit=1`,
    });
    const subscription = subscriptions[0] || null;
    const planType = subscription?.plan_type || subscription?.plan || null;
    return sendJson(res, 200, {
      is_vip: !!subscription,
      hasSubscription: !!subscription,
      planType,
      subscription: subscription ? { ...subscription, plan_type: planType } : null,
    });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Subscription status failed' });
  }
}
