import { handleOptions, readJson, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser, supabaseTable } from '../_lib/supabaseRest.js';

function readNotificationId(req) {
  const url = new URL(req.url, 'http://spicey.local');
  const parts = url.pathname.split('/').filter(Boolean);
  return decodeURIComponent(parts[parts.length - 1] || '');
}

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  try {
    await getSupabaseUser(req);
    const notificationId = readNotificationId(req);
    if (!notificationId) return sendJson(res, 400, { error: 'Missing notification id' });

    if (req.method === 'PATCH') {
      const body = await readJson(req);
      const updates = {};
      if (Object.prototype.hasOwnProperty.call(body, 'read')) updates.read = Boolean(body.read);
      updates.updated_at = new Date().toISOString();
      const rows = await supabaseTable('notifications', {
        method: 'PATCH',
        serviceRole: true,
        query: `?id=eq.${encodeURIComponent(notificationId)}`,
        body: updates,
      });
      return sendJson(res, 200, { notification: rows[0] });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Notification request failed' });
  }
}
