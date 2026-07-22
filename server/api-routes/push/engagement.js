import { handleOptions, sendJson, setCors } from '../_lib/http.js';
import { sendRegularPush } from '../_lib/apns.js';
import { supabaseTable } from '../_lib/supabaseRest.js';

const CAMPAIGNS = [
  {
    title: '🍿 Spicey po të pret',
    body: 'Hape Spicey dhe shiko postimet, videot dhe momentet më të reja.',
  },
  {
    title: '✨ Çfarë ka të re në Spicey?',
    body: 'Një dozë argëtimi po të pret. Hyr dhe zbulo trendet e sotme.',
  },
  {
    title: '🎬 Koha për pak Spicey',
    body: 'Shijo reels, muzikë dhe postime të reja nga komuniteti.',
  },
  {
    title: '🔥 Mos i humb momentet e reja',
    body: 'Hape Spicey dhe shiko çfarë po ndodh tani.',
  },
];

function isAuthorizedCron(req) {
  const secret = process.env.CRON_SECRET;
  const authorization = req.headers.authorization || req.headers.Authorization || '';
  return Boolean(secret) && authorization === `Bearer ${secret}`;
}

function campaignForToday() {
  const day = Math.floor(Date.now() / 86_400_000);
  return CAMPAIGNS[day % CAMPAIGNS.length];
}

async function newestDestination() {
  const rows = await supabaseTable('posts', {
    serviceRole: true,
    query: '?select=id,post_type,caption&visibility=eq.public&order=created_at.desc&limit=1',
  }).catch(() => []);
  const post = rows[0];
  if (!post) return { path: '/', type: 'engagement', postId: null, reelId: null };
  if (post.post_type === 'reel') {
    return {
      path: `/reels?reelId=${encodeURIComponent(post.id)}`,
      type: 'new_reel',
      postId: post.id,
      reelId: post.id,
    };
  }
  return {
    path: `/?postId=${encodeURIComponent(post.id)}`,
    type: 'engagement',
    postId: post.id,
    reelId: null,
  };
}

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'GET' && req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }
  if (!isAuthorizedCron(req)) {
    return sendJson(res, 401, { error: 'Unauthorized' });
  }

  try {
    const activeSince = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
    const recentSince = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();
    const [devices, recent, destination] = await Promise.all([
      supabaseTable('push_devices', {
        serviceRole: true,
        query: `?select=user_id,token,environment&token_type=eq.apns&enabled=eq.true&last_seen_at=gte.${encodeURIComponent(activeSince)}&limit=5000`,
      }),
      supabaseTable('notifications', {
        serviceRole: true,
        query: `?select=user_id&type=eq.engagement&created_at=gte.${encodeURIComponent(recentSince)}&limit=10000`,
      }).catch(() => []),
      newestDestination(),
    ]);

    const recentlyNotified = new Set(recent.map((row) => row.user_id));
    const eligible = devices.filter((device) => device.user_id && !recentlyNotified.has(device.user_id));
    const campaign = campaignForToday();
    const results = await Promise.allSettled(eligible.map(async (device) => {
      const result = await sendRegularPush({
        token: device.token,
        environment: device.environment,
        title: campaign.title,
        body: campaign.body,
        data: destination,
        badge: 1,
      });
      if (!result.sent) {
        console.warn('[APNs] Engagement push failed', {
          user_id: device.user_id,
          status: result.status || 0,
          reason: result.data?.reason || result.reason || result.error || 'Unknown APNs error',
        });
        if (['BadDeviceToken', 'Unregistered'].includes(result.data?.reason)) {
          await supabaseTable('push_devices', {
            method: 'PATCH',
            serviceRole: true,
            query: `?token=eq.${encodeURIComponent(device.token)}`,
            body: { enabled: false, updated_at: new Date().toISOString() },
          }).catch(() => {});
        }
        return { sent: false, user_id: device.user_id };
      }
      return { sent: true, user_id: device.user_id };
    }));

    const successfulUserIds = [...new Set(results
      .filter((entry) => entry.status === 'fulfilled' && entry.value.sent)
      .map((entry) => entry.value.user_id))];

    await Promise.all(successfulUserIds.map((userId) => supabaseTable('notifications', {
      method: 'POST',
      serviceRole: true,
      body: {
        user_id: userId,
        actor_id: null,
        actor_username: 'Spicey',
        actor_avatar: null,
        type: 'engagement',
        message: `${campaign.title} — ${campaign.body}`,
        post_id: destination.postId,
        read: false,
      },
    }).catch(() => null)));

    const sent = results.filter((entry) => entry.status === 'fulfilled' && entry.value.sent).length;
    const failed = results.length - sent;
    console.log('[APNs] Engagement campaign complete', {
      eligible_devices: eligible.length,
      unique_users: successfulUserIds.length,
      sent,
      failed,
      destination: destination.path,
    });
    return sendJson(res, 200, {
      success: true,
      eligible_devices: eligible.length,
      unique_users: successfulUserIds.length,
      sent,
      failed,
      destination: destination.path,
    });
  } catch (error) {
    console.error('[APNs] Engagement campaign failed', { message: error.message });
    return sendJson(res, 500, { error: 'Engagement campaign failed' });
  }
}
