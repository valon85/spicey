import { handleOptions, readJson, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser, supabaseTable } from '../_lib/supabaseRest.js';

async function profileFor(token, userId, { serviceRole = false } = {}) {
  const rows = await supabaseTable('profiles', {
    token,
    serviceRole,
    query: `?user_id=eq.${encodeURIComponent(userId)}&limit=1`,
  }).catch(() => []);
  return rows[0] || {};
}

async function setProfileCounts(userId, counts) {
  await supabaseTable('profiles', {
    method: 'PATCH',
    serviceRole: true,
    query: `?user_id=eq.${encodeURIComponent(userId)}`,
    body: { ...counts, updated_at: new Date().toISOString() },
  }).catch(() => {});
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
  await setProfileCounts(userId, {
    followers_count: followers.length,
    following_count: following.length,
  });
  return { followers_count: followers.length, following_count: following.length };
}

async function getStatus(token, currentUserId, targetUserId) {
  const [follows, requests, profile] = await Promise.all([
    supabaseTable('follows', {
      token,
      query: `?follower_id=eq.${encodeURIComponent(currentUserId)}&following_id=eq.${encodeURIComponent(targetUserId)}&limit=1`,
    }).catch(() => []),
    supabaseTable('follow_requests', {
      token,
      query: `?requester_id=eq.${encodeURIComponent(currentUserId)}&target_id=eq.${encodeURIComponent(targetUserId)}&status=eq.pending&limit=1`,
    }).catch(() => []),
    profileFor(token, targetUserId, { serviceRole: true }),
  ]);
  return {
    following: !!follows[0],
    requested: !!requests[0],
    followers_count: profile.followers_count || 0,
    following_count: profile.following_count || 0,
  };
}

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  try {
    const { token, user } = await getSupabaseUser(req);
    const url = new URL(req.url, 'http://spicey.local');

    if (req.method === 'GET') {
      const targetUserId = url.searchParams.get('targetUserId') || url.searchParams.get('target_user_id');
      if (targetUserId) {
        return sendJson(res, 200, await getStatus(token, user.id, targetUserId));
      }

      const userId = url.searchParams.get('userId') || user.id;
      const kind = url.searchParams.get('kind') || 'following';
      const field = kind === 'followers' ? 'following_id' : 'follower_id';
      const rows = await supabaseTable('follows', {
        token,
        query: `?${field}=eq.${encodeURIComponent(userId)}&order=created_at.desc&limit=100`,
      });
      return sendJson(res, 200, { follows: rows });
    }

    if (req.method === 'POST') {
      const body = await readJson(req);
      const targetUserId = body.target_user_id || body.targetUserId;
      if (!targetUserId) return sendJson(res, 400, { error: 'target_user_id is required' });
      if (targetUserId === user.id) return sendJson(res, 400, { error: 'You cannot follow yourself' });

      const existing = await supabaseTable('follows', {
        token,
        query: `?follower_id=eq.${encodeURIComponent(user.id)}&following_id=eq.${encodeURIComponent(targetUserId)}&limit=1`,
      }).catch(() => []);

      if (existing[0]) {
        await supabaseTable('follows', {
          method: 'DELETE',
          token,
          query: `?id=eq.${encodeURIComponent(existing[0].id)}`,
        });
        await Promise.all([recalcCounts(user.id), recalcCounts(targetUserId)]);
        return sendJson(res, 200, await getStatus(token, user.id, targetUserId));
      }

      const [myProfile, targetProfile] = await Promise.all([
        profileFor(token, user.id),
        profileFor(token, targetUserId, { serviceRole: true }),
      ]);

      if (targetProfile.is_private) {
        await supabaseTable('follow_requests', {
          method: 'POST',
          token,
          headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
          body: {
            requester_id: user.id,
            target_id: targetUserId,
            requester_username: myProfile.username || user.email?.split('@')[0] || 'user',
            requester_avatar: myProfile.avatar_url || '',
            status: 'pending',
            updated_at: new Date().toISOString(),
          },
        });
        return sendJson(res, 200, await getStatus(token, user.id, targetUserId));
      }

      await supabaseTable('follows', {
        method: 'POST',
        token,
        headers: { Prefer: 'resolution=ignore-duplicates,return=representation' },
        body: {
          follower_id: user.id,
          following_id: targetUserId,
          follower_username: myProfile.username || user.email?.split('@')[0] || 'user',
          following_username: targetProfile.username || '',
          follower_avatar: myProfile.avatar_url || '',
          following_avatar: targetProfile.avatar_url || '',
        },
      });
      await Promise.all([recalcCounts(user.id), recalcCounts(targetUserId)]);
      return sendJson(res, 200, await getStatus(token, user.id, targetUserId));
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Follow request failed' });
  }
}
