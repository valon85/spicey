import { handleOptions, sendJson, setCors } from '../_lib/http.js';
import { getSupabaseUser } from '../_lib/supabaseRest.js';

const GLOBAL_HIT_QUERIES = [
  { term: 'top hits 2026', country: 'US', lang: 'en_us' },
  { term: 'albanian hits', country: 'AL', lang: 'en_us' },
  { term: 'kosovo hits', country: 'XK', lang: 'en_us' },
  { term: 'latin hits', country: 'US', lang: 'es_us' },
  { term: 'turkish hits', country: 'TR', lang: 'en_us' },
  { term: 'german hits', country: 'DE', lang: 'de_de' },
  { term: 'french hits', country: 'FR', lang: 'fr_fr' },
  { term: 'italian hits', country: 'IT', lang: 'it_it' },
  { term: 'arabic hits', country: 'SA', lang: 'en_us' },
];

function normalizeTrack(track) {
  return {
    trackId: track.trackId,
    trackName: track.trackName,
    artistName: track.artistName,
    collectionName: track.collectionName,
    artworkUrl60: track.artworkUrl60,
    artworkUrl100: track.artworkUrl100,
    previewUrl: track.previewUrl,
    trackTimeMillis: track.trackTimeMillis,
  };
}

async function searchITunes({ term, country = 'US', lang = 'en_us', limit = 20 }) {
  const params = new URLSearchParams({
    media: 'music',
    entity: 'song',
    limit: String(limit),
    term,
    country,
    lang,
  });
  const response = await fetch(`https://itunes.apple.com/search?${params}`, {
    headers: { Accept: 'application/json' },
  });
  const data = await response.json();
  if (!response.ok) throw new Error('Music search failed');
  return data.results || [];
}

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    await getSupabaseUser(req).catch(() => null);
    const url = new URL(req.url, 'http://spicey.local');
    const query = (url.searchParams.get('query') || 'top hits pop').trim();
    const limit = Number(url.searchParams.get('limit') || '24');
    const country = url.searchParams.get('country') || 'US';
    const lang = url.searchParams.get('lang') || 'en_us';

    const genericQuery = /^(top hits|hits|trending|viral|pop hits|top hits pop|top hits pop 2024|top hits 2025|top hits 2026)$/i.test(query);
    const searches = genericQuery
      ? GLOBAL_HIT_QUERIES.map((item) => ({ ...item, limit: 8 }))
      : [{ term: query, country, lang, limit }];

    const settled = await Promise.allSettled(searches.map(searchITunes));
    const seen = new Set();
    const results = settled
      .flatMap((item) => item.status === 'fulfilled' ? item.value : [])
      .filter((track) => {
        const key = track.trackId || `${track.trackName}-${track.artistName}`;
        if (!key || seen.has(key) || !track.trackName || !track.artistName) return false;
        seen.add(key);
        return true;
      })
      .slice(0, limit)
      .map(normalizeTrack);

    return sendJson(res, 200, { results });
  } catch (error) {
    return sendJson(res, 400, { error: error.message || 'Music search failed' });
  }
}
