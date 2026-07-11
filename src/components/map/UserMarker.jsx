import L from 'leaflet';

// Inject pulse CSS once globally
if (typeof document !== 'undefined' && !document.getElementById('marker-pulse-css')) {
  const s = document.createElement('style');
  s.id = 'marker-pulse-css';
  s.textContent = `
    @keyframes marker-pulse {
      0%   { transform: scale(1);   opacity: 0.7; }
      100% { transform: scale(1.7); opacity: 0; }
    }
    .mp-pulse { animation: marker-pulse 1.8s ease-out infinite; }
  `;
  document.head.appendChild(s);
}

function makeIcon(profile, { isMe = false, state = 'online' } = {}) {
  const avatarUrl = (profile.avatar_url || '').trim();
  const name = isMe ? 'You' : (profile.username || profile.full_name || 'User');
  const label = name.length > 10 ? name.slice(0, 10) + '…' : name;

  // Ring + glow colors
  let borderColor = '#a855f7';
  let glowColor = 'rgba(168,85,247,0.8)';
  let bgGrad = 'linear-gradient(135deg,#7c3aed,#a855f7)';
  if (isMe)             { borderColor = '#22c55e'; glowColor = 'rgba(34,197,94,0.9)';  bgGrad = 'linear-gradient(135deg,#16a34a,#22c55e)'; }
  else if (state === 'live')  { borderColor = '#e11d48'; glowColor = 'rgba(225,29,72,0.9)';  bgGrad = 'linear-gradient(135deg,#be123c,#e11d48)'; }
  else if (state === 'story') { borderColor = '#ec4899'; glowColor = 'rgba(236,72,153,0.9)'; bgGrad = 'linear-gradient(135deg,#db2777,#ec4899)'; }
  else if (state === 'vip')   { borderColor = '#f59e0b'; glowColor = 'rgba(245,158,11,0.9)'; bgGrad = 'linear-gradient(135deg,#d97706,#f59e0b)'; }

  const liveBadge = state === 'live'
    ? `<div style="position:absolute;top:-10px;left:50%;transform:translateX(-50%);background:#e11d48;border-radius:4px;padding:1px 6px;font-size:8px;font-weight:900;color:#fff;letter-spacing:0.5px;white-space:nowrap;font-family:sans-serif;z-index:10;box-shadow:0 0 8px rgba(225,29,72,0.8);">LIVE</div>`
    : '';

  // Pulse ring animation for live/story
  const pulseAnim = (state === 'live' || state === 'story')
    ? `<div class="mp-pulse" style="position:absolute;inset:-4px;border-radius:50%;border:2px solid ${borderColor};opacity:0;"></div>`
    : '';

  // Avatar content: photo or person SVG
  const isVideoAvatar = /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(String(avatarUrl));
  const avatarInner = avatarUrl
    ? (isVideoAvatar
      ? `<span class="spicey-video-avatar-frame" style="width:100%;height:100%;border-radius:50%;"><video src="${avatarUrl.replace(/"/g, '&quot;')}" class="spicey-video-avatar-crop" muted autoplay loop playsinline></video></span><div style="display:none;width:100%;height:100%;align-items:center;justify-content:center;background:${bgGrad};border-radius:50%;">${personSVG(borderColor)}</div>`
      : `<img src="${avatarUrl.replace(/"/g, '&quot;')}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;" onerror="this.style.display='none';this.nextSibling.style.display='flex';" /><div style="display:none;width:100%;height:100%;align-items:center;justify-content:center;background:${bgGrad};border-radius:50%;">${personSVG(borderColor)}</div>`)
    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:${bgGrad};border-radius:50%;">${personSVG('white')}</div>`;

  const html = `
    <div style="position:relative;display:inline-flex;flex-direction:column;align-items:center;gap:3px;">
      ${liveBadge}
      <div style="position:relative;width:50px;height:50px;flex-shrink:0;">
        ${pulseAnim}
        <div style="
          width:50px;height:50px;border-radius:50%;overflow:hidden;
          border:3px solid ${borderColor};
          box-shadow:0 0 14px 3px ${glowColor}, 0 2px 10px rgba(0,0,0,0.95);
        ">${avatarInner}</div>
        ${isMe ? `<div style="position:absolute;bottom:-2px;right:-2px;width:14px;height:14px;background:#22c55e;border:2px solid #000;border-radius:50%;"></div>` : ''}
      </div>
      <div style="background:rgba(6,0,18,0.9);border:1px solid ${borderColor};border-radius:6px;padding:2px 7px;white-space:nowrap;box-shadow:0 0 8px ${glowColor};">
        <span style="color:#fff;font-size:9px;font-weight:700;font-family:-apple-system,sans-serif;">${label}</span>
      </div>
    </div>`;

  return L.divIcon({
    html,
    className: 'spicey-marker-wrap',
    iconSize: [60, 78],
    iconAnchor: [30, 39],
  });
}

function personSVG(color) {
  return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="4" fill="${color}" opacity="0.95"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="${color}" opacity="0.95"/>
  </svg>`;
}

export function createUserMarkerIcon(profile, isMe, userState) {
  return makeIcon(profile, { isMe, state: userState });
}

export function createStoryMarkerIcon(profile) {
  return makeIcon(profile, { isMe: false, state: 'story' });
}

export function createLiveMarkerIcon(profile) {
  return makeIcon(profile, { isMe: false, state: 'live' });
}
