import { handleOptions, readJson, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser, supabaseTable } from '../_lib/supabaseRest.js';

const ADMIN_EMAILS = new Set([
  'info@spicey.live',
  'valondervishi13@gmail.com',
  'vlora.dervisi@gmail.com',
]);

const PLANS = {
  vip: { name: 'Spicey VIP', amount: 1199 },
  creator: { name: 'Spicey Creator', amount: 2499 },
  business: { name: 'Spicey Business', amount: 4999 },
};

function safeReturnBase(value) {
  const configured = process.env.SPICEY_PUBLIC_URL || 'https://spicey.live';
  try {
    const url = new URL(value || configured);
    if (url.protocol === 'https:' || url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      return `${url.origin}/vip`;
    }
  } catch (_) {}
  return `${configured.replace(/\/$/, '')}/vip`;
}

async function createStripeCheckout(params) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw new Error('STRIPE_SECRET_KEY is not configured on the Spicey server');

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(params),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || `Stripe checkout failed (${response.status})`);
  return data;
}

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    const { token, user } = await getSupabaseUser(req);
    const email = String(user.email || '').trim().toLowerCase();
    if (ADMIN_EMAILS.has(email)) {
      return sendJson(res, 200, {
        isAdmin: true,
        hasSubscription: true,
        planType: 'business',
      });
    }

    const body = await readJson(req);
    const planType = String(body.planType || body.plan_type || '').trim().toLowerCase();
    const plan = PLANS[planType];
    if (!plan) return sendJson(res, 400, { error: 'Invalid Spicey VIP plan' });

    const subscriptions = await supabaseTable('subscriptions', {
      token,
      query: `?user_id=eq.${encodeURIComponent(user.id)}&order=created_at.desc`,
    }).catch(() => []);
    const active = subscriptions.find((row) => ['active', 'trialing'].includes(row.status));
    if (active) {
      return sendJson(res, 409, {
        error: 'You already have an active Spicey subscription.',
        hasSubscription: true,
        subscription: active,
      });
    }

    const hasUsedTrial = subscriptions.some((row) => row.trial_used === true || row.status === 'trialing');
    const returnBase = safeReturnBase(body.returnUrl);
    const params = {
      mode: 'subscription',
      success_url: `${returnBase}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnBase}?checkout=cancelled`,
      client_reference_id: user.id,
      customer_email: email,
      'metadata[user_id]': user.id,
      'metadata[plan_type]': planType,
      'subscription_data[metadata][user_id]': user.id,
      'subscription_data[metadata][plan_type]': planType,
      'line_items[0][price_data][currency]': 'usd',
      'line_items[0][price_data][unit_amount]': String(plan.amount),
      'line_items[0][price_data][product_data][name]': plan.name,
      'line_items[0][price_data][recurring][interval]': 'month',
      'line_items[0][quantity]': '1',
      allow_promotion_codes: 'true',
    };
    if (!hasUsedTrial) params['subscription_data[trial_period_days]'] = '30';

    const session = await createStripeCheckout(params);
    return sendJson(res, 200, {
      url: session.url,
      sessionId: session.id,
      planType,
      trialDays: hasUsedTrial ? 0 : 30,
    });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Stripe checkout failed' });
  }
}
