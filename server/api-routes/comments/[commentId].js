import { handleOptions, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser, supabaseTable } from '../_lib/supabaseRest.js';

function readCommentId(req) {
  const url = new URL(req.url, 'http://spicey.local');
  const parts = url.pathname.split('/').filter(Boolean);
  return decodeURIComponent(parts[parts.length - 1] || '');
}

async function decrementPostCounter(postId) {
  const posts = await supabaseTable('posts', {
    serviceRole: true,
    query: `?id=eq.${encodeURIComponent(postId)}&limit=1`,
  }).catch(() => []);
  const post = posts[0];
  if (!post) return;
  await supabaseTable('posts', {
    method: 'PATCH',
    serviceRole: true,
    query: `?id=eq.${encodeURIComponent(postId)}`,
    body: {
      comments_count: Math.max(0, (post.comments_count || 1) - 1),
      updated_at: new Date().toISOString(),
    },
  }).catch(() => {});
}

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  try {
    const { user } = await getSupabaseUser(req);
    const commentId = readCommentId(req);
    if (!commentId) return sendJson(res, 400, { error: 'Missing comment id' });

    if (req.method === 'DELETE') {
      const comments = await supabaseTable('comments', {
        serviceRole: true,
        query: `?id=eq.${encodeURIComponent(commentId)}&limit=1`,
      });
      const comment = comments[0];
      if (!comment) return sendJson(res, 404, { error: 'Comment not found' });

      const isOwner = comment.author_id === user.id;
      const isAdmin = user.app_metadata?.role === 'admin' || user.role === 'admin';
      if (!isOwner && !isAdmin) return sendJson(res, 403, { error: 'Not allowed' });

      await supabaseTable('comments', {
        method: 'DELETE',
        serviceRole: true,
        query: `?id=eq.${encodeURIComponent(commentId)}`,
      });
      await decrementPostCounter(comment.post_id);
      return sendJson(res, 200, { ok: true });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Comment request failed' });
  }
}
