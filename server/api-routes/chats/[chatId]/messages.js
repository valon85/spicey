import { handleOptions, readJson, sendJson, setCors } from '../../_lib/http.js';
import { getSupabaseUser, supabaseTable } from '../../_lib/supabaseRest.js';
import { sendRegularPush, summarizeApnsResult } from '../../_lib/apns.js';

function readChatId(req) {
  const url = new URL(req.url, 'http://spicey.local');
  const fromQuery = url.searchParams.get('chatId');
  if (fromQuery) return fromQuery;
  const parts = url.pathname.split('/').filter(Boolean);
  const chatsIndex = parts.indexOf('chats');
  return chatsIndex >= 0 ? decodeURIComponent(parts[chatsIndex + 1] || '') : '';
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
    const chat = await requireChatMembership(user.id, chatId);

    if (req.method === 'GET') {
      const messages = await supabaseTable('messages', {
        serviceRole: true,
        query: `?chat_id=eq.${encodeURIComponent(chatId)}&order=created_at.asc&limit=200`,
      });
      const unread = messages.filter((message) => (
        message.sender_id !== user.id && !(message.read_by || []).includes(user.id)
      ));
      if (unread.length) {
        await Promise.all(unread.map((message) => supabaseTable('messages', {
          method: 'PATCH',
          serviceRole: true,
          query: `?id=eq.${encodeURIComponent(message.id)}`,
          body: { read_by: [...new Set([...(message.read_by || []), user.id])] },
        }))).catch((error) => console.warn('[Messages] Failed to mark read:', error.message));
      }
      return sendJson(res, 200, {
        messages: messages.map((message) => unread.some((item) => item.id === message.id)
          ? { ...message, read_by: [...new Set([...(message.read_by || []), user.id])] }
          : message),
      });
    }

    if (req.method === 'POST') {
      const body = await readJson(req);
      if (!body.text && !body.image_url && !body.video_url) {
        return sendJson(res, 400, { error: 'Message text or media is required' });
      }

      const profileRows = await supabaseTable('profiles', {
        serviceRole: true,
        query: `?user_id=eq.${encodeURIComponent(user.id)}&limit=1`,
      }).catch(() => []);
      const profile = profileRows[0] || {};

      const created = await supabaseTable('messages', {
        method: 'POST',
        serviceRole: true,
        body: {
          chat_id: chatId,
          sender_id: user.id,
          sender_username: profile.username || user.email?.split('@')[0] || 'user',
          sender_avatar: profile.avatar_url || '',
          text: body.text || '',
          image_url: body.image_url || body.imageUrl || null,
          read_by: [user.id],
        },
      });

      await supabaseTable('chats', {
        method: 'PATCH',
        serviceRole: true,
        query: `?id=eq.${encodeURIComponent(chatId)}`,
        body: {
          last_message: body.text || (body.image_url || body.imageUrl ? 'Image' : 'Video'),
          last_message_time: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      }).catch(() => {});

      const receiverIds = (chat.participant_ids || []).filter((id) => id !== user.id);
      if (receiverIds.length) {
        const ids = receiverIds.map((id) => `"${id}"`).join(',');
        const devices = await supabaseTable('push_devices', {
          serviceRole: true,
          query: `?select=user_id,token,environment&user_id=in.(${ids})&token_type=eq.apns&enabled=eq.true`,
        }).catch(() => []);
        const receivers = await supabaseTable('profiles', {
          serviceRole: true,
          query: `?select=user_id,push_token&user_id=in.(${ids})`,
        }).catch(() => []);
        const tokenTargets = [
          ...devices
            .filter((device) => device.token)
            .map((device) => ({ token: device.token, environment: device.environment || process.env.APN_ENV })),
          ...receivers
            .filter((receiverProfile) => receiverProfile.push_token)
            .map((receiverProfile) => ({ token: receiverProfile.push_token, environment: process.env.APN_ENV })),
        ].filter((target, index, all) => all.findIndex((item) => item.token === target.token) === index);
        const pushResults = await Promise.all(tokenTargets
          .map((target) => sendRegularPush({
            token: target.token,
            environment: target.environment,
            title: profile.full_name || profile.username || user.email?.split('@')[0] || 'Spicey',
            body: body.text || 'sent you a message',
            data: {
              type: 'message',
              chatId,
              senderId: user.id,
              messageId: created[0]?.id,
            },
          }).catch((error) => ({ sent: false, environment: target.environment, error: error.message }))));
        if (pushResults.length) {
          console.log('[APNs] Message delivery results', pushResults.map(summarizeApnsResult));
        } else {
          console.warn('[APNs] Message delivery skipped: receiver has no regular APNs token');
        }
      }

      return sendJson(res, 200, { message: created[0] });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Messages request failed' });
  }
}
