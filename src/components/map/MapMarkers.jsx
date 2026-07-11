import mapboxgl from 'mapbox-gl';

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
  .mapboxgl-ctrl-attrib, .mapboxgl-ctrl-logo, .mapboxgl-ctrl-group { display: none !important; }
  @keyframes pulse-dot { 0%,100%{transform:scale(1);opacity:1;} 50%{transform:scale(1.4);opacity:0.7;} }
  .pulse-dot { animation: pulse-dot 1.4s ease-in-out infinite; }
  .spicey-marker { cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:4px; }
  .mp-pin-wrap { position:relative; width:48px; height:60px; flex-shrink:0; background: linear-gradient(180deg, var(--pin-color, #a78bfa) 0%, color-mix(in srgb, var(--pin-color, #a78bfa) 60%, #000) 100%); border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 0 24px var(--pin-glow, rgba(167,139,250,0.8)), 0 8px 20px rgba(0,0,0,0.5), inset 0 -2px 8px rgba(0,0,0,0.3); border: 2px solid rgba(255,255,255,0.4); display: flex; align-items: center; justify-content: center; overflow: hidden; }
  .mp-avatar { position: absolute !important; width: 32px !important; height: 32px !important; border-radius: 50% !important; }
  .mp-pin-inner { position:absolute; width:36px; height:36px; border: 2px solid rgba(255,255,255,0.6); border-radius: 50%; box-shadow: inset 0 0 8px rgba(255,255,255,0.2); }
  .mp-pulse { position:absolute; inset:-8px; border-radius:50%; border:3px solid var(--pin-color, #a78bfa); animation: mp-pulse-anim 2s ease-out infinite; pointer-events:none; }
  @keyframes mp-pulse-anim { 0%{ transform:scale(0.8); opacity:0.8; } 100%{ transform:scale(1.6); opacity:0; } }
  .mp-label { background:rgba(0,0,0,0.85); backdrop-filter: blur(8px); border-radius:12px; padding:4px 10px; white-space:nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
  .mp-label span { color:rgba(255,255,255,0.95); font-size:11px; font-weight:700; font-family:-apple-system,sans-serif; letter-spacing: 0.3px; }
  @keyframes activity-wave { 0%{ transform:scale(1); opacity:0.5; } 100%{ transform:scale(4); opacity:0; } }
  .spicey-activity-wave { position:absolute; border-radius:50%; pointer-events:none; z-index:5; width:44px; height:44px; margin-left:-22px; margin-top:-22px; border:1.5px solid var(--wc,#FF4FD8); animation: activity-wave 2.4s ease-out forwards; }
`;

if (typeof document !== 'undefined') {
  const ex = document.getElementById('spicey-mapbox-css');
  if (ex) ex.remove();
  const s = document.createElement('style');
  s.id = 'spicey-mapbox-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function timeAgo(d) {
  if (!d) return 'now';
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return d < 1 ? `${Math.round(d * 1000)}m` : `${d.toFixed(1)} km`;
}

export function formatNum(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

export function getCityName(lat, lng) {
  if (lat > 40.5 && lat < 40.9 && lng > -74.1 && lng < -73.9) return 'New York City';
  if (lat > 33.9 && lat < 34.3 && lng > -118.7 && lng < -118.1) return 'Los Angeles';
  if (lat > 51.4 && lat < 51.6 && lng > -0.2 && lng < 0.1) return 'London';
  if (lat > 48.8 && lat < 48.9 && lng > 2.2 && lng < 2.4) return 'Paris';
  if (lat > 35.6 && lat < 35.8 && lng > 139.6 && lng < 139.8) return 'Tokyo';
  if (lat > 40.4 && lat < 40.5 && lng > -3.7 && lng < -3.6) return 'Madrid';
  if (lat > 52.5 && lat < 52.6 && lng > 13.3 && lng < 13.5) return 'Berlin';
  if (lat > 41.8 && lat < 41.9 && lng > 12.4 && lng < 12.6) return 'Rome';
  return 'Local Area';
}

export function buildAvatarEl(profile, { isMe = false, state = 'online' } = {}) {
  let pinColor, pinGlow;
  if (isMe)                 { pinColor='#22c55e'; pinGlow='rgba(34,197,94,0.8)'; }
  else if (state==='live')  { pinColor='#ff6b35'; pinGlow='rgba(255,107,53,0.8)'; }
  else if (state==='story') { pinColor='#ffd60a'; pinGlow='rgba(255,214,10,0.8)'; }
  else if (state==='vip')   { pinColor='#fbbf24'; pinGlow='rgba(251,191,36,0.8)'; }
  else                      { pinColor='#a78bfa'; pinGlow='rgba(167,139,250,0.8)'; }

  const name = isMe ? 'You' : (profile.username || profile.full_name || 'User');
  const label = name.length > 11 ? name.slice(0, 11) + '…' : name;
  const hasPulse = state === 'live' || state === 'story';
  const avatarSrc = profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.username || profile.full_name || 'U')}&background=1a0a2e&color=fff&size=100`;
  const isVideo = /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(String(avatarSrc));

  const wrap = document.createElement('div');
  wrap.className = 'spicey-marker';
  wrap.style.cssText = `--pin-color:${pinColor};--pin-glow:${pinGlow};`;
  wrap.innerHTML = `
    <div class="mp-pin-wrap">
      ${hasPulse ? `<div class="mp-pulse"></div>` : ''}
      ${isVideo
        ? `<span class="mp-avatar spicey-video-avatar-frame" style="width:32px;height:32px;border-radius:50%;"><video src="${avatarSrc}" class="spicey-video-avatar-crop" muted autoplay loop playsinline></video></span>`
        : `<img src="${avatarSrc}" alt="${name}" class="mp-avatar" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`}
      <div class="mp-pin-inner"></div>
    </div>
    <div class="mp-label"><span>${label}</span></div>
  `;
  return wrap;
}

export function buildCityEl(cityName, postCount, options = {}) {
  const { hasRealContent = false, sampleImage = null } = options;
  const photo = sampleImage || getCityCoverPhoto(cityName);
  const el = document.createElement('div');
  el.style.cssText = 'cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;';
  const borderColor = hasRealContent ? 'rgba(255,80,0,0.95)' : 'rgba(160,32,240,0.9)';
  const glowColor = hasRealContent
    ? '0 0 18px rgba(255,80,0,0.9), 0 0 36px rgba(255,40,160,0.5)'
    : '0 0 18px rgba(160,32,240,0.8), 0 0 36px rgba(255,79,216,0.4)';

  el.innerHTML = `
    <div style="position:relative;width:72px;height:90px;border-radius:14px;overflow:hidden;border:2px solid ${borderColor};box-shadow:${glowColor};">
      ${photo ? `<img src="${photo}" style="width:100%;height:100%;object-fit:cover;display:block;" />` : `<div style="width:100%;height:100%;background:linear-gradient(135deg,#A020F0,#FF4FD8);"></div>`}
      <div style="position:absolute;inset:0;background:linear-gradient(to bottom,transparent 40%,rgba(0,0,0,0.75) 100%);"></div>
      <div style="position:absolute;bottom:5px;left:0;right:0;text-align:center;"><span style="color:white;font-size:8px;font-weight:800;font-family:-apple-system,sans-serif;text-shadow:0 1px 4px rgba(0,0,0,0.8);">${cityName.split(' ')[0]}</span></div>
      ${hasRealContent ? `<div style="position:absolute;top:4px;left:4px;background:linear-gradient(135deg,#FF5500,#e91e8c);border-radius:5px;padding:1px 5px;display:flex;align-items:center;gap:2px;"><span style="color:white;font-size:7px;font-weight:900;font-family:-apple-system,sans-serif;">🔥 LIVE</span></div>` : ''}
      ${postCount > 0 ? `<div style="position:absolute;top:4px;right:4px;background:linear-gradient(135deg,#A020F0,#FF4FD8);border-radius:8px;padding:1px 5px;"><span style="color:white;font-size:7px;font-weight:800;font-family:-apple-system,sans-serif;">${formatNum(postCount)}</span></div>` : ''}
    </div>
  `;
  return el;
}

const BALKAN_COVERS = {
  'Pristina': 'https://images.unsplash.com/photo-1687869545075-d8a613c04647?w=300',
  'Prizren': 'https://images.unsplash.com/photo-1698715874248-72303255fb3d?w=300',
  'Peja': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300',
  'Tirana': 'https://images.unsplash.com/photo-1632353913765-9b56b7b4bd55?w=300',
  'Durres': 'https://images.unsplash.com/photo-1629444734485-577f37d5a671?w=300',
  'Skopje': 'https://images.unsplash.com/photo-1642291373671-29794831ebce?w=300',
  'Ohrid': 'https://images.unsplash.com/photo-1653389167152-7dbd6d165631?w=300',
  'Podgorica': 'https://images.unsplash.com/photo-1624895060572-a5fc35b5db2f?w=300',
  'Budva': 'https://images.unsplash.com/photo-1729455155986-4b11d6298923?w=300',
  'Belgrade': 'https://images.unsplash.com/photo-1656500959120-e2c368582aeb?w=300',
  'Sarajevo': 'https://images.unsplash.com/photo-1698715874248-72303255fb3d?w=300',
  'Zagreb': 'https://images.unsplash.com/photo-1624895060572-a5fc35b5db2f?w=300',
  'Ljubljana': 'https://images.unsplash.com/photo-1619165822586-6b4f6583098e?w=300',
};

const CITY_COVER_PHOTOS = {
  'New York City': 'https://images.unsplash.com/photo-1522083165195-3424ed129620?w=300',
  'Los Angeles': 'https://images.unsplash.com/photo-1580655653885-65763b2597d4?w=300',
  'London': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=300',
  'Paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=300',
  'Tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=300',
  'Dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=300',
  'Barcelona': 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=300',
  'Sydney': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=300',
  'Singapore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=300',
  'Bangkok': 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=300',
  'Istanbul': 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=300',
  'Toronto': 'https://images.unsplash.com/photo-1517090186835-e348b621c9ca?w=300',
  'Chicago': 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=300',
  'Miami': 'https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=300',
  'Berlin': 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=300',
  'Rome': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=300',
  'Madrid': 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=300',
  'Amsterdam': 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=300',
  'Vienna': 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=300',
  'Prague': 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=300',
  'Budapest': 'https://images.unsplash.com/photo-1549144511-f099e773c147?w=300',
  'Moscow': 'https://images.unsplash.com/photo-1513326738677-b964603b136d?w=300',
  'Shanghai': 'https://images.unsplash.com/photo-1548919973-5bc92d8dc888?w=300',
  'Hong Kong': 'https://images.unsplash.com/photo-1506870984702-655c8c83b7ac?w=300',
  'Rio de Janeiro': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=300',
  'Lisbon': 'https://images.unsplash.com/photo-1513623935135-c896b59073c1?w=300',
  'Athens': 'https://images.unsplash.com/photo-1603565816030-6b389eeb23cb?w=300',
  'Milan': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300',
  'Osaka': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300',
  'Bali': 'https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?w=300',
  'Marrakech': 'https://images.unsplash.com/photo-1518655048521-f130df041f66?w=300',
  'Las Vegas': 'https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?w=300',
  'San Francisco': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=300',
};

const FALLBACK_COVERS = [
  'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=300',
  'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=300',
  'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=300',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300',
  'https://images.unsplash.com/photo-1549144511-f099e773c147?w=300',
  'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?w=300',
  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=300',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300',
  'https://images.unsplash.com/photo-1534531173927-aeb928d54385?w=300',
  'https://images.unsplash.com/photo-1580655653885-65763b2597d4?w=300',
];

function cityStrToNum(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function getCityCoverPhoto(cityName) {
  if (CITY_COVER_PHOTOS[cityName]) return CITY_COVER_PHOTOS[cityName];
  if (BALKAN_COVERS[cityName]) return BALKAN_COVERS[cityName];
  const idx = cityStrToNum(cityName) % FALLBACK_COVERS.length;
  return FALLBACK_COVERS[idx];
}

export const SEED_CITY_LOCATIONS = [
  { name: 'New York City', lat: 40.7128, lng: -74.006 },
  { name: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
  { name: 'London', lat: 51.5074, lng: -0.1278 },
  { name: 'Paris', lat: 48.8566, lng: 2.3522 },
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
  { name: 'Madrid', lat: 40.4168, lng: -3.7038 },
  { name: 'Berlin', lat: 52.52, lng: 13.405 },
  { name: 'Rome', lat: 41.9028, lng: 12.4964 },
  { name: 'Dubai', lat: 25.2048, lng: 55.2708 },
  { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
  { name: 'Singapore', lat: 1.3521, lng: 103.8198 },
  { name: 'Bangkok', lat: 13.7563, lng: 100.5018 },
  { name: 'Istanbul', lat: 41.0082, lng: 28.9784 },
  { name: 'Mumbai', lat: 19.076, lng: 72.8777 },
  { name: 'Toronto', lat: 43.6532, lng: -79.3832 },
  { name: 'Chicago', lat: 41.8781, lng: -87.6298 },
  { name: 'Miami', lat: 25.7617, lng: -80.1918 },
  { name: 'Barcelona', lat: 41.3851, lng: 2.1734 },
  { name: 'Amsterdam', lat: 52.3676, lng: 4.9041 },
  { name: 'Seoul', lat: 37.5665, lng: 126.978 },
  { name: 'São Paulo', lat: -23.5505, lng: -46.6333 },
  { name: 'Mexico City', lat: 19.4326, lng: -99.1332 },
  { name: 'Cairo', lat: 30.0444, lng: 31.2357 },
  { name: 'Cape Town', lat: -33.9249, lng: 18.4241 },
  { name: 'Vienna', lat: 48.2082, lng: 16.3738 },
  { name: 'Prague', lat: 50.0755, lng: 14.4378 },
  { name: 'Budapest', lat: 47.4979, lng: 19.0402 },
  { name: 'Lisbon', lat: 38.7169, lng: -9.1399 },
  { name: 'Athens', lat: 37.9838, lng: 23.7275 },
  { name: 'Shanghai', lat: 31.2304, lng: 121.4737 },
  { name: 'Hong Kong', lat: 22.3193, lng: 114.1694 },
  { name: 'Moscow', lat: 55.7558, lng: 37.6173 },
  { name: 'Las Vegas', lat: 36.1699, lng: -115.1398 },
  { name: 'San Francisco', lat: 37.7749, lng: -122.4194 },
  { name: 'Marrakech', lat: 31.6295, lng: -7.9811 },
  { name: 'Bali', lat: -8.3405, lng: 115.092 },
  { name: 'Nairobi', lat: -1.2921, lng: 36.8219 },
  { name: 'Johannesburg', lat: -26.2041, lng: 28.0473 },
  { name: 'Lagos', lat: 6.5244, lng: 3.3792 },
  { name: 'Casablanca', lat: 33.5731, lng: -7.5898 },
  { name: 'Beirut', lat: 33.8938, lng: 35.5018 },
  { name: 'Riyadh', lat: 24.6877, lng: 46.7219 },
  { name: 'Tehran', lat: 35.6892, lng: 51.389 },
  { name: 'Karachi', lat: 24.8607, lng: 67.0011 },
  { name: 'Dhaka', lat: 23.8103, lng: 90.4125 },
  { name: 'Ho Chi Minh City', lat: 10.8231, lng: 106.6297 },
  { name: 'Kuala Lumpur', lat: 3.139, lng: 101.6869 },
  { name: 'Manila', lat: 14.5995, lng: 120.9842 },
  { name: 'Jakarta', lat: -6.2088, lng: 106.8456 },
  { name: 'Lima', lat: -12.0464, lng: -77.0428 },
  { name: 'Bogotá', lat: 4.711, lng: -74.0721 },
  { name: 'Buenos Aires', lat: -34.6037, lng: -58.3816 },
  { name: 'Santiago', lat: -33.4489, lng: -70.6693 },
  { name: 'Montreal', lat: 45.5017, lng: -73.5673 },
  { name: 'Vancouver', lat: 49.2827, lng: -123.1207 },
  { name: 'Seattle', lat: 47.6062, lng: -122.3321 },
  { name: 'Boston', lat: 42.3601, lng: -71.0589 },
  { name: 'Dallas', lat: 32.7767, lng: -96.797 },
  { name: 'Houston', lat: 29.7604, lng: -95.3698 },
  { name: 'Atlanta', lat: 33.749, lng: -84.388 },
  { name: 'Denver', lat: 39.7392, lng: -104.9903 },
  { name: 'Phoenix', lat: 33.4484, lng: -112.074 },
  { name: 'Warsaw', lat: 52.2297, lng: 21.0122 },
  { name: 'Bucharest', lat: 44.4268, lng: 26.1025 },
  { name: 'Helsinki', lat: 60.1699, lng: 24.9384 },
  { name: 'Stockholm', lat: 59.3293, lng: 18.0686 },
  { name: 'Oslo', lat: 59.9139, lng: 10.7522 },
  { name: 'Copenhagen', lat: 55.6761, lng: 12.5683 },
  { name: 'Zurich', lat: 47.3769, lng: 8.5417 },
  { name: 'Brussels', lat: 50.8503, lng: 4.3517 },
  { name: 'Milan', lat: 45.4642, lng: 9.19 },
  { name: 'Naples', lat: 40.8518, lng: 14.2681 },
  { name: 'Florence', lat: 43.7696, lng: 11.2558 },
  { name: 'Seville', lat: 37.3886, lng: -5.9823 },
  { name: 'Valencia', lat: 39.4699, lng: -0.3763 },
  { name: 'Porto', lat: 41.1579, lng: -8.6291 },
  { name: 'Edinburgh', lat: 55.9533, lng: -3.1883 },
  { name: 'Manchester', lat: 53.4808, lng: -2.2426 },
  { name: 'Dublin', lat: 53.3498, lng: -6.2603 },
  { name: 'Lyon', lat: 45.764, lng: 4.8357 },
  { name: 'Marseille', lat: 43.2965, lng: 5.3698 },
  { name: 'Hamburg', lat: 53.5753, lng: 10.0153 },
  { name: 'Munich', lat: 48.1351, lng: 11.582 },
  { name: 'Frankfurt', lat: 50.1109, lng: 8.6821 },
  { name: 'Cologne', lat: 50.938, lng: 6.9603 },
  { name: 'Kyiv', lat: 50.4501, lng: 30.5234 },
  { name: 'Minsk', lat: 53.9006, lng: 27.559 },
  { name: 'Sofia', lat: 42.6977, lng: 23.3219 },
  { name: 'Riga', lat: 56.9496, lng: 24.1052 },
  { name: 'Vilnius', lat: 54.6872, lng: 25.2797 },
  { name: 'Tallinn', lat: 59.437, lng: 24.7536 },
  { name: 'Tbilisi', lat: 41.7151, lng: 44.8271 },
  { name: 'Baku', lat: 40.4093, lng: 49.8671 },
  { name: 'Yerevan', lat: 40.1872, lng: 44.5152 },
  { name: 'Doha', lat: 25.2854, lng: 51.531 },
  { name: 'Abu Dhabi', lat: 24.4539, lng: 54.3773 },
  { name: 'Muscat', lat: 23.5859, lng: 58.4059 },
  { name: 'Amman', lat: 31.9539, lng: 35.9106 },
  { name: 'Baghdad', lat: 33.3128, lng: 44.3615 },
  { name: 'Tunis', lat: 36.8065, lng: 10.1815 },
  { name: 'Algiers', lat: 36.7372, lng: 3.0863 },
  { name: 'Accra', lat: 5.6037, lng: -0.187 },
  { name: 'Dakar', lat: 14.7167, lng: -17.4677 },
  { name: 'Addis Ababa', lat: 9.0249, lng: 38.7468 },
  { name: 'Dar es Salaam', lat: -6.7924, lng: 39.2083 },
  { name: 'Kigali', lat: -1.9441, lng: 30.0619 },
  { name: 'Melbourne', lat: -37.8136, lng: 144.9631 },
  { name: 'Brisbane', lat: -27.4698, lng: 153.0251 },
  { name: 'Auckland', lat: -36.8485, lng: 174.7633 },
  { name: 'Osaka', lat: 34.6937, lng: 135.5023 },
  { name: 'Kyoto', lat: 35.0116, lng: 135.7681 },
  { name: 'Taipei', lat: 25.033, lng: 121.5654 },
  { name: 'Hanoi', lat: 21.0285, lng: 105.8542 },
  { name: 'Phnom Penh', lat: 11.5564, lng: 104.9282 },
  { name: 'Yangon', lat: 16.8661, lng: 96.1951 },
  { name: 'Colombo', lat: 6.9271, lng: 79.8612 },
  { name: 'Kathmandu', lat: 27.7172, lng: 85.324 },
  { name: 'Lahore', lat: 31.5497, lng: 74.3436 },
  { name: 'Islamabad', lat: 33.7294, lng: 73.0931 },
  { name: 'Kabul', lat: 34.5553, lng: 69.2075 },
  { name: 'Tashkent', lat: 41.2995, lng: 69.2401 },
  { name: 'Almaty', lat: 43.2551, lng: 76.9126 },
  { name: 'Ulaanbaatar', lat: 47.8864, lng: 106.9057 },
  { name: 'Havana', lat: 23.1136, lng: -82.3666 },
  { name: 'San Juan', lat: 18.4655, lng: -66.1057 },
  { name: 'Panama City', lat: 8.9936, lng: -79.5197 },
  { name: 'Guadalajara', lat: 20.6597, lng: -103.3496 },
  { name: 'Monterrey', lat: 25.6866, lng: -100.3161 },
  { name: 'Caracas', lat: 10.4806, lng: -66.9036 },
  { name: 'Quito', lat: -0.1807, lng: -78.4678 },
  { name: 'La Paz', lat: -16.4897, lng: -68.1193 },
  { name: 'Montevideo', lat: -34.9011, lng: -56.1645 },
  { name: 'Asuncion', lat: -25.2867, lng: -57.647 },
  { name: 'Medellín', lat: 6.2442, lng: -75.5812 },
  { name: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729 },
  { name: 'Recife', lat: -8.0476, lng: -34.877 },
  { name: 'New Orleans', lat: 29.9511, lng: -90.0715 },
  { name: 'Portland', lat: 45.5051, lng: -122.675 },
  { name: 'Minneapolis', lat: 44.9778, lng: -93.265 },
  { name: 'Detroit', lat: 42.3314, lng: -83.0458 },
  { name: 'Nashville', lat: 36.1627, lng: -86.7816 },
  { name: 'Austin', lat: 30.2672, lng: -97.7431 },
  { name: 'San Diego', lat: 32.7157, lng: -117.1611 },
  { name: 'Orlando', lat: 28.5383, lng: -81.3792 },
  { name: 'Tampa', lat: 27.9506, lng: -82.4572 },
  { name: 'Baltimore', lat: 39.2904, lng: -76.6122 },
  { name: 'Charlotte', lat: 35.2271, lng: -80.8431 },
  { name: 'Indianapolis', lat: 39.7684, lng: -86.1581 },
  { name: 'Columbus', lat: 39.9612, lng: -82.9988 },
  { name: 'Kansas City', lat: 39.0997, lng: -94.5786 },
  { name: 'Salt Lake City', lat: 40.7608, lng: -111.891 },
  { name: 'San Antonio', lat: 29.4241, lng: -98.4936 },
  { name: 'Sacramento', lat: 38.5816, lng: -121.4944 },
  { name: 'Raleigh', lat: 35.7796, lng: -78.6382 },
  { name: 'Memphis', lat: 35.1495, lng: -90.049 },
  { name: 'Pittsburgh', lat: 40.4406, lng: -79.9959 },
  { name: 'Cincinnati', lat: 39.1031, lng: -84.512 },
  { name: 'Cleveland', lat: 41.4993, lng: -81.6944 },
  { name: 'St. Louis', lat: 38.627, lng: -90.1994 },
  { name: 'Oklahoma City', lat: 35.4676, lng: -97.5164 },
  { name: 'Buffalo', lat: 42.8864, lng: -78.8784 },
  { name: 'Richmond', lat: 37.5407, lng: -77.4361 },
  { name: 'Milwaukee', lat: 43.0389, lng: -87.9065 },
  { name: 'Tucson', lat: 32.2226, lng: -110.9747 },
  { name: 'Albuquerque', lat: 35.0844, lng: -106.6504 },
  { name: 'Omaha', lat: 41.2565, lng: -95.9345 },
  { name: 'Honolulu', lat: 21.3069, lng: -157.8583 },
  { name: 'Anchorage', lat: 61.2181, lng: -149.9003 },
  { name: 'Pristina', lat: 42.6629, lng: 21.1655, tier: 2 },
  { name: 'Prizren', lat: 42.2139, lng: 20.7397, tier: 2 },
  { name: 'Peja', lat: 42.6597, lng: 20.2883, tier: 2 },
  { name: 'Gjakova', lat: 42.3803, lng: 20.4311, tier: 2 },
  { name: 'Mitrovica', lat: 42.8914, lng: 20.8659, tier: 2 },
  { name: 'Gjilan', lat: 42.4636, lng: 21.4694, tier: 2 },
  { name: 'Ferizaj', lat: 42.3703, lng: 21.1486, tier: 2 },
  { name: 'Vushtrri', lat: 42.8233, lng: 20.9681, tier: 3 },
  { name: 'Podujeva', lat: 42.9097, lng: 21.1936, tier: 3 },
  { name: 'Suhareka', lat: 42.3597, lng: 20.8297, tier: 3 },
  { name: 'Tirana', lat: 41.3275, lng: 19.8187, tier: 2 },
  { name: 'Durres', lat: 41.3246, lng: 19.4565, tier: 2 },
  { name: 'Vlora', lat: 40.4667, lng: 19.4833, tier: 2 },
  { name: 'Shkoder', lat: 42.0683, lng: 19.5126, tier: 2 },
  { name: 'Saranda', lat: 39.8756, lng: 20.0053, tier: 2 },
  { name: 'Fier', lat: 40.7239, lng: 19.5567, tier: 3 },
  { name: 'Korce', lat: 40.6186, lng: 20.7808, tier: 3 },
  { name: 'Elbasan', lat: 41.1125, lng: 20.0822, tier: 2 },
  { name: 'Berat', lat: 40.7058, lng: 19.9522, tier: 3 },
  { name: 'Gjirokaster', lat: 40.0758, lng: 20.1394, tier: 3 },
  { name: 'Skopje', lat: 41.9981, lng: 21.4254, tier: 2 },
  { name: 'Tetovo', lat: 41.9994, lng: 20.9714, tier: 2 },
  { name: 'Gostivar', lat: 41.7958, lng: 20.9081, tier: 2 },
  { name: 'Ohrid', lat: 41.1231, lng: 20.8016, tier: 2 },
  { name: 'Bitola', lat: 41.0297, lng: 21.3294, tier: 2 },
  { name: 'Kumanovo', lat: 42.1322, lng: 21.7144, tier: 2 },
  { name: 'Strumica', lat: 41.4378, lng: 22.6431, tier: 3 },
  { name: 'Veles', lat: 41.7153, lng: 21.7753, tier: 3 },
  { name: 'Struga', lat: 41.1781, lng: 20.6781, tier: 2 },
  { name: 'Podgorica', lat: 42.4304, lng: 19.2594, tier: 2 },
  { name: 'Ulcinj', lat: 41.9228, lng: 19.2214, tier: 2 },
  { name: 'Budva', lat: 42.2864, lng: 18.8403, tier: 2 },
  { name: 'Bar', lat: 42.0975, lng: 19.1003, tier: 2 },
  { name: 'Kotor', lat: 42.4247, lng: 18.7711, tier: 2 },
  { name: 'Herceg Novi', lat: 42.4531, lng: 18.5375, tier: 3 },
  { name: 'Niksic', lat: 42.7731, lng: 18.9442, tier: 3 },
  { name: 'Pljevlja', lat: 43.3558, lng: 19.3578, tier: 3 },
  { name: 'Berane', lat: 42.8408, lng: 19.8708, tier: 3 },
  { name: 'Cetinje', lat: 42.3933, lng: 18.9225, tier: 3 },
  { name: 'Belgrade', lat: 44.7866, lng: 20.4489, tier: 2 },
  { name: 'Novi Sad', lat: 45.2671, lng: 19.8335, tier: 2 },
  { name: 'Nis', lat: 43.3209, lng: 21.8954, tier: 2 },
  { name: 'Kragujevac', lat: 44.0167, lng: 20.9114, tier: 2 },
  { name: 'Subotica', lat: 46.1003, lng: 19.6675, tier: 3 },
  { name: 'Novi Pazar', lat: 43.1367, lng: 20.5122, tier: 2 },
  { name: 'Uzice', lat: 43.8558, lng: 19.8483, tier: 3 },
  { name: 'Pancevo', lat: 44.8703, lng: 20.6406, tier: 3 },
  { name: 'Cacak', lat: 43.8914, lng: 20.3497, tier: 3 },
  { name: 'Leskovac', lat: 42.9981, lng: 21.9458, tier: 3 },
  { name: 'Vranje', lat: 42.5503, lng: 21.9003, tier: 3 },
  { name: 'Krusevac', lat: 43.5808, lng: 21.3278, tier: 3 },
  { name: 'Smederevo', lat: 44.6639, lng: 20.9278, tier: 3 },
  { name: 'Zrenjanin', lat: 45.3833, lng: 20.3833, tier: 3 },
  { name: 'Pirot', lat: 43.1539, lng: 22.5858, tier: 3 },
  { name: 'Sarajevo', lat: 43.8486, lng: 18.3564, tier: 2 },
  { name: 'Mostar', lat: 43.3436, lng: 17.8081, tier: 2 },
  { name: 'Banja Luka', lat: 44.7722, lng: 17.1911, tier: 2 },
  { name: 'Tuzla', lat: 44.5383, lng: 18.6761, tier: 2 },
  { name: 'Zenica', lat: 44.2036, lng: 17.9078, tier: 3 },
  { name: 'Bihac', lat: 44.8167, lng: 15.8708, tier: 3 },
  { name: 'Trebinje', lat: 42.7114, lng: 18.3439, tier: 3 },
  { name: 'Travnik', lat: 44.2258, lng: 17.6647, tier: 3 },
  { name: 'Visoko', lat: 43.9897, lng: 18.1783, tier: 3 },
  { name: 'Konjic', lat: 43.6539, lng: 17.9608, tier: 3 },
  { name: 'Zagreb', lat: 45.8150, lng: 15.9819, tier: 2 },
  { name: 'Split', lat: 43.5081, lng: 16.4402, tier: 2 },
  { name: 'Rijeka', lat: 45.3271, lng: 14.4422, tier: 2 },
  { name: 'Osijek', lat: 45.5511, lng: 18.6939, tier: 3 },
  { name: 'Zadar', lat: 44.1197, lng: 15.2422, tier: 2 },
  { name: 'Dubrovnik', lat: 42.6507, lng: 18.0944, tier: 2 },
  { name: 'Pula', lat: 44.8683, lng: 13.8481, tier: 3 },
  { name: 'Slavonski Brod', lat: 45.1603, lng: 18.0156, tier: 3 },
  { name: 'Karlovac', lat: 45.4872, lng: 15.5478, tier: 3 },
  { name: 'Sisak', lat: 45.4667, lng: 16.3792, tier: 3 },
  { name: 'Varazdin', lat: 46.3044, lng: 16.3378, tier: 3 },
  { name: 'Sibenik', lat: 43.7350, lng: 15.8952, tier: 3 },
  { name: 'Vukovar', lat: 45.3514, lng: 18.9961, tier: 3 },
  { name: 'Makarska', lat: 43.2978, lng: 17.0178, tier: 3 },
  { name: 'Hvar', lat: 43.1728, lng: 16.4414, tier: 3 },
  { name: 'Rovinj', lat: 45.0811, lng: 13.6397, tier: 3 },
  { name: 'Ljubljana', lat: 46.0569, lng: 14.5058, tier: 2 },
  { name: 'Maribor', lat: 46.5547, lng: 15.6459, tier: 3 },
  { name: 'Celje', lat: 46.2297, lng: 15.2681, tier: 3 },
  { name: 'Kranj', lat: 46.2392, lng: 14.3556, tier: 3 },
  { name: 'Koper', lat: 45.5481, lng: 13.7300, tier: 3 },
  { name: 'Novo Mesto', lat: 45.8011, lng: 15.1689, tier: 3 },
  { name: 'Velenje', lat: 46.3592, lng: 15.1114, tier: 3 },
  { name: 'Bled', lat: 46.3683, lng: 14.1139, tier: 3 },
  { name: 'Portoroz', lat: 45.5139, lng: 13.5922, tier: 3 },
];
