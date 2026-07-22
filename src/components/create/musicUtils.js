export const FALLBACK_MUSIC_TRACKS = [
  {
    trackId: 'spicey-neon-nights',
    trackName: 'Neon Nights',
    artistName: 'Spicey Sounds',
    collectionName: 'City Glow',
    artworkUrl60: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=120&h=120&fit=crop',
    artworkUrl100: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=200&h=200&fit=crop',
    previewUrl: '',
  },
  {
    trackId: 'spicey-fashion-pulse',
    trackName: 'Fashion Pulse',
    artistName: 'Spicey Club',
    collectionName: 'Runway Heat',
    artworkUrl60: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=120&h=120&fit=crop',
    artworkUrl100: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200&h=200&fit=crop',
    previewUrl: '',
  },
  {
    trackId: 'spicey-sunset-dream',
    trackName: 'Sunset Dream',
    artistName: 'Spicey Radio',
    collectionName: 'Golden Hour',
    artworkUrl60: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=120&h=120&fit=crop',
    artworkUrl100: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&h=200&fit=crop',
    previewUrl: '',
  },
  {
    trackId: 'spicey-glow-up',
    trackName: 'Glow Up',
    artistName: 'Spicey Mix',
    collectionName: 'Trending Now',
    artworkUrl60: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=120&h=120&fit=crop',
    artworkUrl100: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&h=200&fit=crop',
    previewUrl: '',
  },
];

export function fallbackMusicResults(query = '') {
  const q = query.trim().toLowerCase();
  if (!q) return FALLBACK_MUSIC_TRACKS;
  const matches = FALLBACK_MUSIC_TRACKS.filter((track) => (
    [track.trackName, track.artistName, track.collectionName]
      .some((value) => String(value || '').toLowerCase().includes(q))
  ));
  return matches.length ? matches : FALLBACK_MUSIC_TRACKS;
}

export function normalizeMusicTrack(track = {}) {
  const id = track.id || track.trackId || track.track_id || `${track.title || track.trackName || 'track'}-${track.artist || track.artistName || 'artist'}`;
  const title = track.title || track.trackName || track.name || 'Untitled';
  const artist = track.artist || track.artistName || track.artist_name || '';
  const previewUrl = track.previewUrl || track.preview_url || '';
  const artworkUrl = track.artworkUrl || track.artwork_url || track.artwork || track.artworkUrl100 || track.artworkUrl60 || '';

  return {
    id,
    trackId: id,
    title,
    trackName: title,
    artist,
    artistName: artist,
    collectionName: track.collectionName || track.album || '',
    previewUrl,
    preview_url: previewUrl,
    artworkUrl,
    artwork_url: artworkUrl,
    artwork: artworkUrl,
    artworkUrl60: track.artworkUrl60 || artworkUrl,
    artworkUrl100: track.artworkUrl100 || artworkUrl,
    duration: track.duration || '',
    emoji: track.emoji || 'Music',
    color: track.color || '#e91e8c',
  };
}

export function postMusicPayload(track) {
  const music = track ? normalizeMusicTrack(track) : null;
  return {
    music_title: music?.title || '',
    music_artist: music?.artist || '',
    music_preview_url: music?.previewUrl || '',
    music_artwork_url: music?.artworkUrl || '',
  };
}
