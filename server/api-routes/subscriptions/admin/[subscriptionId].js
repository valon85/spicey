import { handleOptions, readJson, sendJson, setCors } from '../../_lib/http.js';
import { getSupabaseUser, supabaseTable } from '../../_lib/supabaseRest.js';

const ADMIN_EMAILS = new Set(['info@spicey.live', 'valondervishi13@gmail.com', 'vlora.dervisi@gmail.com']);

function readSubscriptionId(req) {
  const url = new URL(req.url, 'http://spicey.local');
  const parts = url.pathname.split('/').filter(Boolean);
  return parts[parts.length - 1];
}

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  try {
    const { user } = await getSupabaseUser(req);
    if (!ADMIN_EMAILS.has(user.email)) {
      return sendJson(res, 403, { error: 'Admin access required' });
    }

    const subscriptionId = readSubscriptionId(req);
    if (!subscriptionId) return sendJson(res, 400, { error: 'Missing subscription id' });

    if (req.method === 'PATCH') {
      const body = await readJson(req);
      const status = body.status === 'active' ? 'active' : 'cancelled';
      const rows = await supabaseTable('subscriptions', {
        method: 'PATCH',
        serviceRole: true,
        query: `?id=eq.${encodeURIComponent(subscriptionId)}`,
        body: {
          status,
          cancellation_reason: body.reason || null,
          cancelled_at: status === 'cancelled' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        },
      });
      return sendJson(res, 200, { subscription: rows[0] || null });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Admin subscription update failed' });
  }
}
