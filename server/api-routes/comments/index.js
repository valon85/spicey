import { handleOptions, readJson, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser, supabaseTable } from '../_lib/supabaseRest.js';

async function currentProfile(token, user) {
  const rows = await supabaseTable('profiles', {
    token,
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
      const postId = url.searchParams.get('postId') || url.searchParams.get('post_id');
      if (!postId) return sendJson(res, 400, { error: 'postId is required' });
      const comments = await supabaseTable('comments', {
        token,
        query: `?post_id=eq.${encodeURIComponent(postId)}&order=created_at.desc&limit=100`,
      });
      return sendJson(res, 200, { comments });
    }

    if (req.method === 'POST') {
      const body = await readJson(req);
      if (!body.post_id || !body.text) return sendJson(res, 400, { error: 'post_id and text are required' });
      const profile = await currentProfile(token, user);
      const created = await supabaseTable('comments', {
        method: 'POST',
        token,
        body: {
          post_id: body.post_id,
          author_id: user.id,
          text: body.text,
          author_name: profile.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          author_username: profile.username || user.email?.split('@')[0] || 'user',
          author_avatar: profile.avatar_url || '',
          likes_count: 0,
        },
      });

      const posts = await supabaseTable('posts', {
        token,
        query: `?id=eq.${encodeURIComponent(body.post_id)}&limit=1`,
      }).catch(() => []);
      const post = posts[0];
      if (post) {
        await supabaseTable('posts', {
          method: 'PATCH',
          token,
          query: `?id=eq.${encodeURIComponent(body.post_id)}`,
          body: { comments_count: (post.comments_count || 0) + 1 },
        }).catch(() => {});
      }

      return sendJson(res, 200, { comment: created[0] });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Comments request failed' });
  }
}
