import { handleOptions, readJson, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser, supabaseTable } from '../_lib/supabaseRest.js';

const VALID_REASONS = new Set([
  'spam',
  'harassment',
  'hate_speech',
  'nudity',
  'violence',
  'false_information',
  'other',
]);

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  try {
    const { token, user } = await getSupabaseUser(req);

    if (req.method === 'GET') {
      const reports = await supabaseTable('reports', {
        token,
        query: `?reporter_id=eq.${encodeURIComponent(user.id)}&order=created_at.desc&limit=100`,
      });
      return sendJson(res, 200, { reports });
    }

    if (req.method === 'POST') {
      const body = await readJson(req);
      const reason = String(body.reason || '').trim();
      if (!VALID_REASONS.has(reason)) return sendJson(res, 400, { error: 'Invalid report reason' });

      const payload = {
        reporter_id: user.id,
        reported_user_id: body.reported_user_id || body.reportedUserId || null,
        post_id: body.post_id || body.postId || null,
        reason,
        status: 'pending',
        notes: body.notes ? String(body.notes).slice(0, 2000) : null,
      };

      const rows = await supabaseTable('reports', {
        method: 'POST',
        token,
        body: payload,
      });

      return sendJson(res, 201, { report: rows[0] });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Report request failed' });
  }
}
