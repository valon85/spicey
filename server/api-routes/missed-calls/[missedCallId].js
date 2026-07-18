import { handleOptions, readJson, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser, supabaseTable } from '../_lib/supabaseRest.js';

function readMissedCallId(req) {
  const url = new URL(req.url, 'http://spicey.local');
  const parts = url.pathname.split('/').filter(Boolean);
  return decodeURIComponent(parts[parts.length - 1] || '');
}

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  try {
    await getSupabaseUser(req);
    const missedCallId = readMissedCallId(req);
    if (!missedCallId) return sendJson(res, 400, { error: 'Missing missed call id' });

    if (req.method === 'PATCH') {
      const body = await readJson(req);
      const updates = {};
      if (Object.prototype.hasOwnProperty.call(body, 'seen')) updates.seen = Boolean(body.seen);
      updates.updated_at = new Date().toISOString();
      const rows = await supabaseTable('missed_calls', {
        method: 'PATCH',
        serviceRole: true,
        query: `?id=eq.${encodeURIComponent(missedCallId)}`,
        body: updates,
      });
      return sendJson(res, 200, { missed_call: rows[0] });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Missed call request failed' });
  }
}
