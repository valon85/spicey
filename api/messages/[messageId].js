import { handleOptions, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser, supabaseTable } from '../_lib/supabaseRest.js';

function readMessageId(req) {
  const url = new URL(req.url, 'http://spicey.local');
  const parts = url.pathname.split('/').filter(Boolean);
  return decodeURIComponent(parts[parts.length - 1] || '');
}

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  try {
    const { user } = await getSupabaseUser(req);
    const messageId = readMessageId(req);
    if (!messageId) return sendJson(res, 400, { error: 'Missing message id' });

    if (req.method === 'DELETE') {
      await supabaseTable('messages', {
        method: 'DELETE',
        serviceRole: true,
        query: `?id=eq.${encodeURIComponent(messageId)}&sender_id=eq.${encodeURIComponent(user.id)}`,
      });
      return sendJson(res, 200, { ok: true });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Message request failed' });
  }
}
