import crypto from 'node:crypto';
import { sendJson } from '../_lib/http.js';
import { supabaseTable } from '../_lib/supabaseRest.js';

async function readRawBody(req) {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') return Buffer.from(req.body);
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

function verifyStripeSignature(rawBody, header) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET is not configured on the Spicey server');
  const parts = String(header || '').split(',').map((part) => part.split('='));
  const timestamp = parts.find(([key]) => key === 't')?.[1];
  const signatures = parts.filter(([key]) => key === 'v1').map(([, value]) => value);
  if (!timestamp || signatures.length === 0) throw new Error('Missing Stripe webhook signature');
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) throw new Error('Expired Stripe webhook signature');
  const expected = crypto.createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex');
  const expectedBuffer = Buffer.from(expected);
  const valid = signatures.some((signature) => {
    const actual = Buffer.from(signature || '');
    return actual.length === expectedBuffer.length && crypto.timingSafeEqual(actual, expectedBuffer);
  });
  if (!valid) throw new Error('Invalid Stripe webhook signature');
}

async function getStripeSubscription(subscriptionId) {
  const response = await fetch(`https://api.stripe.com/v1/subscriptions/${encodeURIComponent(subscriptionId)}`, {
    headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY || ''}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || 'Unable to read Stripe subscription');
  return data;
}

async function saveSubscription(subscription, fallback = {}) {
  const userId = subscription.metadata?.user_id || fallback.userId;
  const plan = subscription.metadata?.plan_type || fallback.planType || 'vip';
  if (!userId) throw new Error('Stripe subscription is missing Spicey user metadata');

  const now = new Date().toISOString();
  const status = ['active', 'trialing'].includes(subscription.status) ? subscription.status : 'cancelled';
  const periodStart = subscription.current_period_start
    ? new Date(subscription.current_period_start * 1000).toISOString()
    : now;
  const periodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : null;
  const existing = await supabaseTable('subscriptions', {
    serviceRole: true,
    query: `?user_id=eq.${encodeURIComponent(userId)}&order=created_at.desc&limit=1`,
  });

  const richBody = {
    user_id: userId,
    status,
    plan,
    provider: 'stripe',
    stripe_customer_id: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id,
    stripe_subscription_id: subscription.id,
    current_period_start: periodStart,
    current_period_end: periodEnd,
    trial_used: Boolean(subscription.trial_start || subscription.trial_end),
    updated_at: now,
  };
  const commonBody = {
    user_id: userId,
    status,
    plan,
    current_period_end: periodEnd,
  };
  const method = existing[0] ? 'PATCH' : 'POST';
  const query = existing[0] ? `?id=eq.${encodeURIComponent(existing[0].id)}` : '';
  try {
    return await supabaseTable('subscriptions', { method, serviceRole: true, query, body: richBody });
  } catch (_) {
    return supabaseTable('subscriptions', { method, serviceRole: true, query, body: commonBody });
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });
  try {
    const rawBody = await readRawBody(req);
    verifyStripeSignature(rawBody, req.headers['stripe-signature']);
    const event = JSON.parse(rawBody.toString('utf8'));

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      if (session.mode === 'subscription' && session.subscription) {
        const subscription = await getStripeSubscription(session.subscription);
        await saveSubscription(subscription, {
          userId: session.client_reference_id || session.metadata?.user_id,
          planType: session.metadata?.plan_type,
        });
      }
    } else if (event.type.startsWith('customer.subscription.')) {
      await saveSubscription(event.data.object);
    }

    return sendJson(res, 200, { received: true });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Stripe webhook failed' });
  }
}
