import { handleOptions, readJson, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser, supabaseTable } from '../_lib/supabaseRest.js';

function readRequestId(req) {
  const url = new URL(req.url, 'http://spicey.local');
  const parts = url.pathname.split('/').filter(Boolean);
  return decodeURIComponent(parts[parts.length - 1] || '');
}

async function profileFor(userId) {
  const rows = await supabaseTable('profiles', {
    serviceRole: true,
    query: `?user_id=eq.${encodeURIComponent(userId)}&limit=1`,
  }).catch(() => []);
  return rows[0] || {};
}

async function recalcCounts(userId) {
  const [followers, following] = await Promise.all([
    supabaseTable('follows', {
      serviceRole: true,
      query: `?following_id=eq.${encodeURIComponent(userId)}&select=id`,
    }).catch(() => []),
    supabaseTable('follows', {
      serviceRole: true,
      query: `?follower_id=eq.${encodeURIComponent(userId)}&select=id`,
    }).catch(() => []),
  ]);
  await supabaseTable('profiles', {
    method: 'PATCH',
    serviceRole: true,
    query: `?user_id=eq.${encodeURIComponent(userId)}`,
    body: {
      followers_count: followers.length,
      following_count: following.length,
      updated_at: new Date().toISOString(),
    },
  }).catch(() => {});
}

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  try {
    const { token, user } = await getSupabaseUser(req);
    const requestId = readRequestId(req);
    if (!requestId) return sendJson(res, 400, { error: 'Missing request id' });

    if (req.method === 'PATCH') {
      const body = await readJson(req);
      const action = body.action || body.status;
      if (!['approved', 'rejected'].includes(action)) {
        return sendJson(res, 400, { error: 'action must be approved or rejected' });
      }

      const rows = await supabaseTable('follow_requests', {
        token,
        query: `?id=eq.${encodeURIComponent(requestId)}&target_id=eq.${encodeURIComponent(user.id)}&limit=1`,
      });
      const request = rows[0];
      if (!request) return sendJson(res, 404, { error: 'Request not found' });

      if (action === 'approved') {
        const [requesterProfile, targetProfile] = await Promise.all([
          profileFor(request.requester_id),
          profileFor(request.target_id),
        ]);
        await supabaseTable('follows', {
          method: 'POST',
          serviceRole: true,
          headers: { Prefer: 'resolution=ignore-duplicates,return=representation' },
          body: {
            follower_id: request.requester_id,
            following_id: request.target_id,
            follower_username: requesterProfile.username || request.requester_username || '',
            following_username: targetProfile.username || '',
            follower_avatar: requesterProfile.avatar_url || request.requester_avatar || '',
            following_avatar: targetProfile.avatar_url || '',
          },
        });
        await Promise.all([recalcCounts(request.requester_id), recalcCounts(request.target_id)]);
      }

      const updated = await supabaseTable('follow_requests', {
        method: 'PATCH',
        token,
        query: `?id=eq.${encodeURIComponent(requestId)}&target_id=eq.${encodeURIComponent(user.id)}`,
        body: { status: action, updated_at: new Date().toISOString() },
      });
      return sendJson(res, 200, { request: updated[0] });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Follow request update failed' });
  }
}
