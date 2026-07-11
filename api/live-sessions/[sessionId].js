import { handleOptions, readJson, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser, supabaseTable } from '../_lib/supabaseRest.js';

function readSessionId(req) {
  const url = new URL(req.url, 'http://spicey.local');
  const parts = url.pathname.split('/').filter(Boolean);
  return decodeURIComponent(parts[parts.length - 1] || '');
}

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  try {
    const { token } = await getSupabaseUser(req);
    const sessionId = readSessionId(req);
    if (!sessionId) return sendJson(res, 400, { error: 'Missing live session id' });

    if (req.method === 'GET') {
      const rows = await supabaseTable('live_sessions', {
        token,
        query: `?id=eq.${encodeURIComponent(sessionId)}&limit=1`,
      });
      if (!rows[0]) return sendJson(res, 404, { error: 'Live session not found' });
      return sendJson(res, 200, { session: rows[0] });
    }

    if (req.method === 'PATCH') {
      const body = await readJson(req);
      const updates = {};
      ['status', 'viewer_count', 'title', 'stream_url', 'replay_url', 'ended_at'].forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(body, key)) updates[key] = body[key];
      });
      if (updates.status === 'ended' && !updates.ended_at) updates.ended_at = new Date().toISOString();
      updates.updated_at = new Date().toISOString();
      const rows = await supabaseTable('live_sessions', {
        method: 'PATCH',
        token,
        query: `?id=eq.${encodeURIComponent(sessionId)}`,
        body: updates,
      });
      return sendJson(res, 200, { session: rows[0] });
    }

    if (req.method === 'DELETE') {
      await supabaseTable('live_sessions', {
        method: 'DELETE',
        token,
        query: `?id=eq.${encodeURIComponent(sessionId)}`,
      });
      return sendJson(res, 200, { ok: true });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Live session request failed' });
  }
}
