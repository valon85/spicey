import { handleOptions, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser } from '../_lib/supabaseRest.js';

function mapVideo(item) {
  const videoId = item.id?.videoId || item.id;
  const snippet = item.snippet || {};
  return {
    id: `youtube-${videoId}`,
    youtube_id: videoId,
    video_url: `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1&controls=0&loop=1&playlist=${videoId}`,
    external_url: `https://www.youtube.com/shorts/${videoId}`,
    author_name: snippet.channelTitle || 'YouTube',
    author_username: snippet.channelTitle || 'youtube',
    author_avatar: snippet.thumbnails?.default?.url || '',
    caption: snippet.title || 'Funny short video',
    image_url: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || '',
    likes_count: 0,
    comments_count: 0,
    post_type: 'reel',
    source: 'youtube',
  };
}

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    await getSupabaseUser(req);
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) return sendJson(res, 200, { videos: [] });

    const url = new URL(req.url, 'http://spicey.local');
    const query = url.searchParams.get('query') || 'funny short videos';
    const maxResults = Math.min(Number(url.searchParams.get('limit') || 12), 25);
    const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
    searchUrl.searchParams.set('key', apiKey);
    searchUrl.searchParams.set('part', 'snippet');
    searchUrl.searchParams.set('type', 'video');
    searchUrl.searchParams.set('videoDuration', 'short');
    searchUrl.searchParams.set('safeSearch', 'moderate');
    searchUrl.searchParams.set('maxResults', String(maxResults));
    searchUrl.searchParams.set('q', query);

    const response = await fetch(searchUrl);
    const data = await response.json();
    if (!response.ok) {
      return sendJson(res, response.status, { error: data.error?.message || 'YouTube request failed' });
    }

    return sendJson(res, 200, { videos: (data.items || []).map(mapVideo).filter((v) => v.youtube_id) });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'YouTube reels request failed' });
  }
}
