import { handleOptions, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser, supabaseTable } from '../_lib/supabaseRest.js';

function readChatId(req) {
  const url = new URL(req.url, 'http://spicey.local');
  const parts = url.pathname.split('/').filter(Boolean);
  return decodeURIComponent(parts[parts.length - 1] || '');
}

async function requireChatMembership(userId, chatId) {
  const rows = await supabaseTable('chats', {
    serviceRole: true,
    query: `?id=eq.${encodeURIComponent(chatId)}&participant_ids=cs.{${encodeURIComponent(userId)}}&limit=1`,
  });
  if (!rows[0]) throw new Error('Chat not found');
  return rows[0];
}

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  try {
    const { user } = await getSupabaseUser(req);
    const chatId = readChatId(req);
    if (!chatId) return sendJson(res, 400, { error: 'Missing chat id' });
    await requireChatMembership(user.id, chatId);

    if (req.method === 'DELETE') {
      await supabaseTable('chats', {
        method: 'DELETE',
        serviceRole: true,
        query: `?id=eq.${encodeURIComponent(chatId)}`,
      });
      return sendJson(res, 200, { ok: true });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Chat request failed' });
  }
}
