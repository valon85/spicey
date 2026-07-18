import { handleOptions, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser, supabaseTable } from '../_lib/supabaseRest.js';

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    const { token, user } = await getSupabaseUser(req);
    const subscriptions = await supabaseTable('subscriptions', {
      token,
      query: `?user_id=eq.${encodeURIComponent(user.id)}&status=eq.active&order=created_at.desc&limit=1`,
    });
    return sendJson(res, 200, { is_vip: subscriptions.length > 0, subscription: subscriptions[0] || null });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Subscription status failed' });
  }
}
