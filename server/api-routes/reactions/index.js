import { handleOptions, readJson, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser, supabaseTable } from '../_lib/supabaseRest.js';

const COUNTER_BY_TYPE = {
  like: 'likes_count',
  fire: 'fire_count',
  wow: 'wow_count',
};

async function updatePostCounter(token, postId, type, delta) {
  const counter = COUNTER_BY_TYPE[type];
  if (!counter) return null;
  const posts = await supabaseTable('posts', {
    token,
    query: `?id=eq.${encodeURIComponent(postId)}&limit=1`,
  });
  const post = posts[0];
  if (!post) return null;
  const next = Math.max(0, (post[counter] || 0) + delta);
  await supabaseTable('posts', {
    method: 'PATCH',
    token,
    query: `?id=eq.${encodeURIComponent(postId)}`,
    body: { [counter]: next, updated_at: new Date().toISOString() },
  });
  return next;
}

async function profilesByUserIds(token, userIds) {
  const uniqueIds = [...new Set(userIds.filter(Boolean))];
  if (!uniqueIds.length) return {};
  const ids = uniqueIds.map((id) => `"${id}"`).join(',');
  const rows = await supabaseTable('profiles', {
    token,
    query: `?user_id=in.(${ids})`,
  }).catch(() => []);
  return rows.reduce((map, profile) => {
    map[profile.user_id] = profile;
    return map;
  }, {});
}

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  try {
    const { token, user } = await getSupabaseUser(req);

    if (req.method === 'GET') {
      const url = new URL(req.url, 'http://spicey.local');
      const postId = url.searchParams.get('postId') || url.searchParams.get('post_id');
      if (!postId) return sendJson(res, 400, { error: 'postId is required' });
      const reactions = await supabaseTable('reactions', {
        token,
        query: `?post_id=eq.${encodeURIComponent(postId)}&order=created_at.desc&limit=200`,
      });
      const profiles = await profilesByUserIds(token, reactions.map((reaction) => reaction.user_id));
      return sendJson(res, 200, {
        reactions: reactions.map((reaction) => ({
          ...reaction,
          profile: profiles[reaction.user_id] || null,
        })),
      });
    }

    if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

    const { post_id, type = 'like' } = await readJson(req);
    if (!post_id) return sendJson(res, 400, { error: 'post_id is required' });

    const existing = await supabaseTable('reactions', {
      token,
      query: `?post_id=eq.${encodeURIComponent(post_id)}&user_id=eq.${encodeURIComponent(user.id)}&type=eq.${encodeURIComponent(type)}&limit=1`,
    });

    if (existing[0]) {
      await supabaseTable('reactions', {
        method: 'DELETE',
        token,
        query: `?id=eq.${encodeURIComponent(existing[0].id)}`,
      });
      const newCount = await updatePostCounter(token, post_id, type, -1);
      return sendJson(res, 200, { action: 'removed', newCount });
    }

    const created = await supabaseTable('reactions', {
      method: 'POST',
      token,
      body: { post_id, user_id: user.id, type },
    });
    const newCount = await updatePostCounter(token, post_id, type, 1);
    return sendJson(res, 200, { action: 'added', reaction: created[0], newCount });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Reaction failed' });
  }
}
