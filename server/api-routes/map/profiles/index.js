import { handleOptions, sendJson, setCors } from '../../_lib/http.js';
import { getSupabaseUser, supabaseTable } from '../../_lib/supabaseRest.js';

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    const { token } = await getSupabaseUser(req);

    const profiles = await supabaseTable('profiles', {
      token,
      query: '?share_location=eq.true&latitude=not.is.null&longitude=not.is.null&order=updated_at.desc&limit=500',
    });

    const stories = await supabaseTable('stories', {
      token,
      query: `?expires_at=gt.${encodeURIComponent(new Date().toISOString())}&select=user_id&limit=500`,
    }).catch(() => []);

    const subscriptions = await supabaseTable('subscriptions', {
      serviceRole: true,
      query: '?status=eq.active&select=user_id,plan&limit=1000',
    }).catch(() => []);

    const storyUserIds = [...new Set(stories.map((story) => story.user_id).filter(Boolean))];
    const vipUsers = subscriptions.reduce((map, subscription) => {
      if (subscription.user_id && ['vip', 'creator', 'business'].includes(subscription.plan)) {
        map[subscription.user_id] = subscription.plan;
      }
      return map;
    }, {});

    return sendJson(res, 200, {
      profiles: profiles.map((profile) => ({
        id: profile.id,
        user_id: profile.user_id,
        username: profile.username,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        latitude: profile.latitude,
        longitude: profile.longitude,
        location_name: profile.location_name,
        updated_at: profile.updated_at,
      })),
      storyUserIds,
      vipUsers,
    });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Map profiles request failed' });
  }
}
