import { handleOptions, readJson, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser, supabaseTable } from '../_lib/supabaseRest.js';

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  try {
    const { user } = await getSupabaseUser(req);

    if (req.method === 'GET') {
      const url = new URL(req.url, 'http://spicey.local');
      const seen = url.searchParams.get('seen');
      const limit = url.searchParams.get('limit') || '20';
      const params = new URLSearchParams({
        receiver_id: `eq.${user.id}`,
        order: 'created_at.desc',
        limit,
      });
      if (seen !== null) params.set('seen', `eq.${seen}`);
      const missed_calls = await supabaseTable('missed_calls', {
        serviceRole: true,
        query: `?${params.toString()}`,
      });
      return sendJson(res, 200, { missed_calls });
    }

    if (req.method === 'POST') {
      const body = await readJson(req);
      const rows = await supabaseTable('missed_calls', {
        method: 'POST',
        serviceRole: true,
        body: {
          receiver_id: user.id,
          caller_id: body.caller_id,
          caller_name: body.caller_name || 'Unknown',
          caller_avatar: body.caller_avatar || null,
          call_type: body.call_type === 'video' ? 'video' : 'voice',
          call_session_id: body.call_session_id || null,
          seen: Boolean(body.seen),
        },
      });
      return sendJson(res, 201, { missed_call: rows[0] });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Missed calls request failed' });
  }
}
