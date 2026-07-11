import L from 'leaflet';

/*
  City location marker - clickable pin for showing local content
*/
function makeCityIcon(cityName, postCount = 0) {
  const html = `
    <div style="position:relative;display:inline-flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;">
      <div style="
        width:48px;height:48px;
        border-radius:50%;
        background:linear-gradient(135deg, #A020F0, #d946ef);
        border:3px solid rgba(255,255,255,0.9);
        box-shadow:0 0 20px rgba(160,32,240,0.8),0 0 40px rgba(217,70,239,0.5);
        display:flex;align-items:center;justify-content:center;
        animation: city-pulse 2s ease-in-out infinite;
      ">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      </div>
      <div style="
        background:rgba(160,32,240,0.95);
        border:1px solid rgba(255,255,255,0.3);
        border-radius:8px;
        padding:3px 8px;
        white-space:nowrap;
        backdrop-filter:blur(8px);
      ">
        <span style="color:white;font-size:11px;font-weight:800;font-family:-apple-system,sans-serif;">${cityName}</span>
      </div>
      ${postCount > 0 ? `
        <div style="
          position:absolute;top:-6px;right:-6px;
          width:20px;height:20px;
          border-radius:50%;
          background:linear-gradient(135deg, #ff6b00, #ff4fd8);
          border:2px solid white;
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 0 12px rgba(255,107,0,0.6);
        ">
          <span style="color:white;font-size:9px;font-weight:900;">${postCount > 99 ? '99+' : postCount}</span>
        </div>
      ` : ''}
    </div>
  `;

  return L.divIcon({
    html,
    className: 'city-marker-wrap',
    iconSize: [60, 70],
    iconAnchor: [30, 35],
  });
}

const CSS = `
  @keyframes city-pulse {
    0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(160,32,240,0.8), 0 0 40px rgba(217,70,239,0.5); }
    50% { transform: scale(1.08); box-shadow: 0 0 30px rgba(160,32,240,1), 0 0 60px rgba(217,70,239,0.7); }
  }
  .city-marker-wrap { background: transparent !important; border: none !important; }
  .city-marker-wrap * { box-sizing: border-box !important; }
`;

if (typeof document !== 'undefined') {
  const existing = document.getElementById('city-marker-css');
  if (existing) existing.remove();
  const s = document.createElement('style');
  s.id = 'city-marker-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

export function createCityMarkerIcon(cityName, postCount = 0) {
  return makeCityIcon(cityName, postCount);
}