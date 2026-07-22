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
      const params = new URLSearchParams();
      const authorId = url.searchParams.get('authorId') || url.searchParams.get('author_id');
      const postType = url.searchParams.get('postType') || url.searchParams.get('post_type');
      const location = url.searchParams.get('location');
      const mapCity = url.searchParams.get('mapCity') || url.searchParams.get('map_city');
      const mapVisible = url.searchParams.get('mapVisible') || url.searchParams.get('map_visible');
      if (authorId) params.set('author_id', `eq.${authorId}`);
      if (postType) params.set('post_type', `eq.${postType}`);
      if (mapVisible !== null) params.set('map_visible', `eq.${mapVisible}`);
      if (mapCity) params.set('map_city', `ilike.*${mapCity}*`);
      else if (location) params.set('location', `ilike.*${location}*`);
      params.set('order', 'created_at.desc');
      params.set('limit', url.searchParams.get('limit') || '50');
      const posts = await supabaseTable('posts', {
        token,
        query: `?${params.toString()}`,
      });
      return sendJson(res, 200, { posts });
    }

    if (req.method === 'POST') {
      const body = await readJson(req);
      const profile = await currentProfile(token, user);
      const created = await supabaseTable('posts', {
        method: 'POST',
        token,
        body: {
          author_id: user.id,
          author_name: profile.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          author_username: profile.username || user.email?.split('@')[0] || 'user',
          author_avatar: profile.avatar_url || '',
          caption: body.caption || '',
          post_type: body.post_type || 'feed',
          visibility: body.visibility || 'public',
          image_url: body.image_url || null,
          image_urls: body.image_urls || [],
          video_url: body.video_url || null,
          video_link: body.video_link || null,
          location: body.location || null,
          hashtags: body.hashtags || [],
          tags: body.tags || null,
          music_title: body.music_title || null,
          music_artist: body.music_artist || null,
          music_preview_url: body.music_preview_url || null,
          music_artwork_url: body.music_artwork_url || null,
          map_visible: Boolean(body.map_visible),
          map_city: body.map_city || null,
        },
      });
      return sendJson(res, 200, { post: created[0] });
    }

    return sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Posts request failed' });
  }
}
