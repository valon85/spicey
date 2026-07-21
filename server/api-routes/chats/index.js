import { handleOptions, readJson, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser, supabaseTable } from '../_lib/supabaseRest.js';

async function loadProfilesByUserIds(userIds) {
  if (!userIds.length) return {};
  const ids = userIds.map((id) => `"${id}"`).join(',');
  const rows = await supabaseTable('profiles', {
    serviceRole: true,
    query: `?user_id=in.(${ids})`,
  });
  return rows.reduce((map, profile) => {
    map[profile.user_id] = profile;
    return map;
  }, {});
}

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  try {
    const { user } = await getSupabaseUser(req);

    if (req.method === 'GET') {
      const chats = await supabaseTable('chats', {
        serviceRole: true,
        query: `?participant_ids=cs.{${encodeURIComponent(user.id)}}&order=last_message_time.desc.nullslast&limit=100`,
      });
      const otherIds = chats
        .map((chat) => (chat.participant_ids || []).find((id) => id !== user.id))
        .filter(Boolean);
      const profilesByUserId = await loadProfilesByUserIds(otherIds);
      const chatIds = chats.map((chat) => chat.id).filter(Boolean);
      const chatMessages = chatIds.length
        ? await supabaseTable('messages', {
            serviceRole: true,
            query: `?select=chat_id,sender_id,read_by&chat_id=in.(${chatIds.map((id) => `"${id}"`).join(',')})&limit=5000`,
          }).catch(() => [])
        : [];
      const unreadByChat = chatMessages.reduce((counts, message) => {
        if (message.sender_id !== user.id && !(message.read_by || []).includes(user.id)) {
          counts[message.chat_id] = (counts[message.chat_id] || 0) + 1;
        }
        return counts;
      }, {});
      return sendJson(res, 200, {
        chats: chats.map((chat) => ({
          ...chat,
          unread_count: unreadByChat[chat.id] || 0,
          other_profile: profilesByUserId[(chat.participant_ids || []).find((id) => id !== user.id)] || null,
        })),
      });
    }

    if (req.method === 'POST') {
      const body = await readJson(req);
      const otherUserId = body.other_user_id || body.otherUserId;
      const participantIds = body.participant_ids || (otherUserId ? [user.id, otherUserId] : null);
      if (!Array.isArray(participantIds) || !participantIds.includes(user.id)) {
        return sendJson(res, 400, { error: 'Chat must include the current user' });
      }

      const existing = await supabaseTable('chats', {
        serviceRole: true,
        query: `?participant_ids=cs.{${participantIds.map(encodeURIComponent).join(',')}}&limit=1`,
      });
      if (existing[0]) return sendJson(res, 200, { chat: existing[0] });

      const profilesByUserId = await loadProfilesByUserIds(participantIds);
      const created = await supabaseTable('chats', {
        method: 'POST',
        serviceRole: true,
        body: {
          participant_ids: participantIds,
          participant_usernames: participantIds.map((id) => profilesByUserId[id]?.username || ''),
          last_message_time: new Date().toISOString(),
          is_group: body.is_group === true,
          group_name: body.group_name || null,
          group_avatar: body.group_avatar || null,
        },
      });
      return sendJson(res, 200, { chat: created[0] });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Chats request failed' });
  }
}
