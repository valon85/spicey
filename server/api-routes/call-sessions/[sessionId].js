import { handleOptions, readJson, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser, supabaseTable } from '../_lib/supabaseRest.js';
import { sendVoipPush, summarizeApnsResult } from '../_lib/apns.js';

const TERMINAL_STATUSES = new Set(['ended', 'declined', 'missed', 'cancelled']);

function readSessionId(req) {
  const url = new URL(req.url, 'http://spicey.local');
  const parts = url.pathname.split('/').filter(Boolean);
  return decodeURIComponent(parts[parts.length - 1] || '');
}

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  try {
    const { user } = await getSupabaseUser(req);
    const sessionId = readSessionId(req);
    if (!sessionId) return sendJson(res, 400, { error: 'Missing call session id' });

    if (req.method === 'GET') {
      const rows = await supabaseTable('call_sessions', {
        serviceRole: true,
        query: `?id=eq.${encodeURIComponent(sessionId)}&limit=1`,
      });
      if (!rows[0]) return sendJson(res, 404, { error: 'Call session not found' });
      return sendJson(res, 200, { call_session: rows[0], session: rows[0] });
    }

    if (req.method === 'PATCH') {
      const existingRows = await supabaseTable('call_sessions', {
        serviceRole: true,
        query: `?id=eq.${encodeURIComponent(sessionId)}&limit=1`,
      });
      const existingSession = existingRows[0];
      if (!existingSession) return sendJson(res, 404, { error: 'Call session not found' });
      if (![existingSession.caller_id, existingSession.receiver_id].includes(user.id)) {
        return sendJson(res, 403, { error: 'Not a participant in this call' });
      }

      const body = await readJson(req);
      const updates = {};
      [
        'status',
        'offer_sdp',
        'answer_sdp',
        'caller_ice',
        'receiver_ice',
        'accepted_at',
        'ended_at',
      ].forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(body, key)) updates[key] = body[key];
      });
      if (updates.status === 'accepted' && !updates.accepted_at) updates.accepted_at = new Date().toISOString();
      if (TERMINAL_STATUSES.has(updates.status) && !updates.ended_at) {
        updates.ended_at = new Date().toISOString();
      }
      updates.updated_at = new Date().toISOString();
      const rows = await supabaseTable('call_sessions', {
        method: 'PATCH',
        serviceRole: true,
        query: `?id=eq.${encodeURIComponent(sessionId)}`,
        body: updates,
      });
      let voip = [];
      if (TERMINAL_STATUSES.has(updates.status)) {
        const recipientId = user.id === existingSession.caller_id
          ? existingSession.receiver_id
          : existingSession.caller_id;
        const devices = await supabaseTable('push_devices', {
          serviceRole: true,
          query: `?user_id=eq.${encodeURIComponent(recipientId)}&token_type=eq.voip&enabled=eq.true&select=token,environment`,
        });
        voip = await Promise.all(devices.map((device) => sendVoipPush({
          token: device.token,
          callerName: existingSession.caller_name || 'Spicey call',
          callerId: existingSession.caller_id,
          callSessionId: sessionId,
          callType: existingSession.call_type || 'voice',
          event: updates.status,
          environment: device.environment,
        })));
        const summaries = voip.map(summarizeApnsResult);
        console.info('[APNs] VoIP terminal delivery results', {
          callSessionId: sessionId,
          event: updates.status,
          recipientId,
          results: summaries,
        });
      }
      return sendJson(res, 200, {
        call_session: rows[0],
        session: rows[0],
        voip: voip.map(summarizeApnsResult),
      });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Call session request failed' });
  }
}
