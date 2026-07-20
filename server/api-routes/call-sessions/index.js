import { handleOptions, readJson, sendJson, setCors } from '../_lib/http.js';
import { apiErrorStatus, getSupabaseUser, supabaseTable } from '../_lib/supabaseRest.js';
import { sendVoipPush } from '../_lib/apns.js';

async function currentProfile(token, user) {
  const rows = await supabaseTable('profiles', {
    serviceRole: true,
    query: `?user_id=eq.${encodeURIComponent(user.id)}&limit=1`,
  }).catch(() => []);
  return rows[0] || {};
}

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  try {
    const { token, user } = await getSupabaseUser(req);

    if (req.method === 'GET') {
      const url = new URL(req.url, 'http://spicey.local');
      const status = url.searchParams.get('status');
      const receiverId = url.searchParams.get('receiverId') || url.searchParams.get('receiver_id');
      const limit = url.searchParams.get('limit') || '20';
      const params = new URLSearchParams();
      if (status) params.set('status', `eq.${status}`);
      if (receiverId) params.set('receiver_id', `eq.${receiverId}`);
      else params.set('or', `(caller_id.eq.${user.id},receiver_id.eq.${user.id})`);
      params.set('order', 'created_at.desc');
      params.set('limit', limit);
      const sessions = await supabaseTable('call_sessions', {
        serviceRole: true,
        query: `?${params.toString()}`,
      });
      return sendJson(res, 200, { sessions });
    }

    if (req.method === 'POST') {
      const body = await readJson(req);
      if (!body.receiver_id) return sendJson(res, 400, { error: 'Missing receiver_id', code: 'VALIDATION_ERROR' });
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.receiver_id)) {
        return sendJson(res, 422, { error: 'receiver_id must be a valid user UUID', code: 'INVALID_RECEIVER_ID' });
      }
      const profile = await currentProfile(token, user);
      const rows = await supabaseTable('call_sessions', {
        method: 'POST',
        serviceRole: true,
        body: {
          caller_id: user.id,
          receiver_id: body.receiver_id,
          type: body.type === 'video' ? 'video' : 'voice',
          status: 'ringing',
          caller_name: profile.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          caller_avatar: profile.avatar_url || null,
          receiver_name: body.receiver_name || null,
          receiver_avatar: body.receiver_avatar || null,
        },
      });
      const callSession = rows[0];
      const receiverDevices = await supabaseTable('push_devices', {
        serviceRole: true,
        query: `?select=token&user_id=eq.${encodeURIComponent(body.receiver_id)}&token_type=eq.voip&enabled=eq.true`,
      }).catch(() => []);
      const receiverProfiles = await supabaseTable('profiles', {
        serviceRole: true,
        query: `?select=user_id,voip_push_token&user_id=eq.${encodeURIComponent(body.receiver_id)}&limit=1`,
      }).catch(() => []);
      const tokens = Array.from(new Set([
        ...receiverDevices.map((device) => device.token).filter(Boolean),
        receiverProfiles[0]?.voip_push_token,
      ].filter(Boolean)));
      const voipResults = tokens.length
        ? await Promise.all(tokens.map((deviceToken) => sendVoipPush({
          token: deviceToken,
          callerName: callSession.caller_name,
          callerId: user.id,
          callerAvatar: callSession.caller_avatar,
          callSessionId: callSession.id,
          callType: callSession.type,
        }).catch((error) => ({ sent: false, error: error.message }))))
        : { sent: false, skipped: true, reason: 'Receiver has no VoIP token' };

      return sendJson(res, 201, {
        call_session: callSession,
        session: callSession,
        voip: Array.isArray(voipResults)
          ? {
            sent: voipResults.some((result) => result.sent),
            devices: voipResults.length,
            results: voipResults.map((result) => ({ sent: result.sent, status: result.status, skipped: result.skipped, reason: result.reason || result.data?.reason || result.error })),
          }
          : voipResults,
      });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    const status = apiErrorStatus(error);
    console.error('[Calls API] request failed', { status, code: error.code || 'CALL_SESSION_ERROR', message: error.message });
    return sendJson(res, status, { error: error.message || 'Call session request failed', code: error.code || 'CALL_SESSION_ERROR' });
  }
}
