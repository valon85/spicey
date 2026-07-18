import { handleOptions, readJson, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser, supabaseTable } from '../_lib/supabaseRest.js';

async function updateCommentCounter(commentId, delta) {
  const rows = await supabaseTable('comments', {
    serviceRole: true,
    query: `?id=eq.${encodeURIComponent(commentId)}&limit=1`,
  });
  const comment = rows[0];
  if (!comment) return 0;
  const next = Math.max(0, (comment.likes_count || 0) + delta);
  await supabaseTable('comments', {
    method: 'PATCH',
    serviceRole: true,
    query: `?id=eq.${encodeURIComponent(commentId)}`,
    body: { likes_count: next },
  });
  return next;
}

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    const { token, user } = await getSupabaseUser(req);
    const { comment_id, type = 'like' } = await readJson(req);
    if (!comment_id) return sendJson(res, 400, { error: 'comment_id is required' });

    const existing = await supabaseTable('comment_reactions', {
      token,
      query: `?comment_id=eq.${encodeURIComponent(comment_id)}&user_id=eq.${encodeURIComponent(user.id)}&type=eq.${encodeURIComponent(type)}&limit=1`,
    }).catch(() => []);

    if (existing[0]) {
      await supabaseTable('comment_reactions', {
        method: 'DELETE',
        token,
        query: `?id=eq.${encodeURIComponent(existing[0].id)}`,
      });
      const newCount = await updateCommentCounter(comment_id, -1);
      return sendJson(res, 200, { action: 'removed', newCount });
    }

    const created = await supabaseTable('comment_reactions', {
      method: 'POST',
      token,
      body: { comment_id, user_id: user.id, type },
    });
    const newCount = await updateCommentCounter(comment_id, 1);
    return sendJson(res, 200, { action: 'added', reaction: created[0], newCount });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Comment reaction failed' });
  }
}
