import { handleOptions, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser } from '../_lib/supabaseRest.js';

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    await getSupabaseUser(req);
    const url = new URL(req.url, 'http://spicey.local');
    const query = (url.searchParams.get('query') || 'top hits pop').trim();
    const limit = url.searchParams.get('limit') || '20';

    const response = await fetch(
      `https://itunes.apple.com/search?media=music&entity=song&limit=${encodeURIComponent(limit)}&term=${encodeURIComponent(query)}`,
      { headers: { Accept: 'application/json' } },
    );
    const data = await response.json();
    if (!response.ok) return sendJson(res, response.status, { error: 'Music search failed' });

    const results = (data.results || []).map((track) => ({
      trackId: track.trackId,
      trackName: track.trackName,
      artistName: track.artistName,
      collectionName: track.collectionName,
      artworkUrl60: track.artworkUrl60,
      artworkUrl100: track.artworkUrl100,
      previewUrl: track.previewUrl,
      trackTimeMillis: track.trackTimeMillis,
    }));

    return sendJson(res, 200, { results });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Music search failed' });
  }
}
