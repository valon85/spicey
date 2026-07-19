import React, { useState, useEffect, useRef, useMemo } from 'react';
// domainGuard removed for map — GPS must work on all domains
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, MessageCircle, X, User, Flame, Sparkles, Users, Navigation, Search, SlidersHorizontal, Crosshair, Layers, Globe2, Radio, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import LocationContentModal from '@/components/map/LocationContentModal';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';
mapboxgl.accessToken = MAPBOX_TOKEN;

const SPICEY_DARK_MAP_STYLE = 'mapbox://styles/mapbox/navigation-night-v1';
const SPICEY_LIGHT_MAP_STYLE = 'mapbox://styles/mapbox/light-v11';

const MAP_PREVIEW_PINS = [
  { name: '@sarah.vibes', place: 'Riverside Park', live: true, left: '16%', top: '40%', lat: 40.8007, lng: -73.9702, image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=180&h=180&fit=crop&crop=faces' },
  { name: '@luna.travel', place: 'Central Park', count: 3, left: '46%', top: '33%', lat: 40.7829, lng: -73.9654, image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=180&h=180&fit=crop&crop=faces' },
  { name: '@alex.king', place: 'Upper East Side', live: true, left: '73%', top: '37%', lat: 40.7736, lng: -73.9566, image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=180&h=180&fit=crop&crop=faces' },
  { name: '@chef.kai', place: 'SoHo', count: 4, left: '19%', top: '68%', lat: 40.7233, lng: -74.003, image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=180&h=180&fit=crop&crop=faces' },
  { name: '@marcustlex', place: 'Times Square', live: true, left: '44%', top: '73%', lat: 40.758, lng: -73.9855, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=180&h=180&fit=crop&crop=faces' },
  { name: '@dancevibes', place: 'Williamsburg', count: 2, left: '77%', top: '64%', lat: 40.7081, lng: -73.9571, image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=180&h=180&fit=crop&crop=faces' },
];

const TRENDING_CITIES = [
  { name: 'New York', live: '1.2K live', lat: 40.7128, lng: -74.006, image: 'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?w=360&h=480&fit=crop' },
  { name: 'Miami', live: '856 live', lat: 25.7617, lng: -80.1918, image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=360&h=480&fit=crop' },
  { name: 'Los Angeles', live: '742 live', lat: 34.0522, lng: -118.2437, image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=360&h=480&fit=crop' },
  { name: 'London', live: '512 live', lat: 51.5074, lng: -0.1278, image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=360&h=480&fit=crop' },
];

const CITY_MEDIA = {
  'New York': [
    'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?w=900&h=1400&fit=crop',
    'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=900&h=1400&fit=crop',
    'https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?w=900&h=1400&fit=crop',
  ],
  Miami: [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&h=1400&fit=crop',
    'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=900&h=1400&fit=crop',
    'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=900&h=1400&fit=crop',
  ],
  'Los Angeles': [
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&h=1400&fit=crop',
    'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=900&h=1400&fit=crop',
    'https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=900&h=1400&fit=crop',
  ],
  London: [
    'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=900&h=1400&fit=crop',
    'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=900&h=1400&fit=crop',
    'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=900&h=1400&fit=crop',
  ],
};

const makeCityPreviewItems = (city) => {
  const images = CITY_MEDIA[city.name] || [city.image || getCityCoverPhoto(city.name)];
  return images.map((image, index) => ({
    id: `city-preview-${city.name}-${index}`,
    image_url: image,
    caption: `${city.name} vibes on Spicey`,
    author_name: index === 0 ? 'Spicey City' : `Creator ${index + 1}`,
    author_username: city.name.toLowerCase().replace(/\s+/g, ''),
    author_avatar: image,
    likes_count: index === 0 ? 7800 : 1200 + index * 900,
    comments_count: 24 + index * 19,
    map_visible: true,
  }));
};

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
  .mapboxgl-ctrl-attrib, .mapboxgl-ctrl-logo, .mapboxgl-ctrl-group { display: none !important; }

  /* pulse dot in header */
  @keyframes pulse-dot { 0%,100%{transform:scale(1);opacity:1;} 50%{transform:scale(1.4);opacity:0.7;} }
  .pulse-dot { animation: pulse-dot 1.4s ease-in-out infinite; }

  /* ── Modern Map Marker ── */
  .spicey-marker { cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:4px; }
  .mapboxgl-marker .spicey-marker { transform: translateZ(0); }

  .mp-pin-wrap { 
    position:relative; 
    width:54px; 
    height:54px; 
    flex-shrink:0;
    background: conic-gradient(from 160deg, #ff6b00, #ff2e9d, #a020f0, #ff6b00);
    border-radius: 50%;
    transform: none;
    box-shadow: 0 0 18px var(--pin-glow, rgba(167,139,250,0.55)), 0 8px 18px rgba(0,0,0,0.36), inset 0 -2px 8px rgba(0,0,0,0.22);
    border: 2px solid rgba(255,255,255,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  /* Avatar inside pin */
  .mp-avatar {
    position: absolute !important;
    width: 32px !important;
    height: 32px !important;
    border-radius: 50% !important;
    transform-origin: center !important;
    object-fit: cover !important;
    z-index: 2;
  }

  /* Inner ring */
  .mp-pin-inner {
    position:absolute;
    width:36px;
    height:36px;
    border: 2px solid rgba(255,255,255,0.6);
    border-radius: 50%;
    box-shadow: inset 0 0 8px rgba(255,255,255,0.2);
    transform: none;
    z-index: 3;
  }

  /* Pulse for live/story */
  .mp-pulse {
    position:absolute; 
    inset:-8px; 
    border-radius:50%;
    border:3px solid var(--pin-color, #a78bfa);
    animation: mp-pulse-anim 2s ease-out infinite;
    pointer-events:none;
  }
  @keyframes mp-pulse-anim {
    0%   { transform:scale(0.8); opacity:0.8; }
    100% { transform:scale(1.6); opacity:0; }
  }

  /* Username label — modern pill */
  .mp-label {
    background:rgba(0,0,0,0.85);
    backdrop-filter: blur(8px);
    border-radius:12px; 
    padding:4px 10px;
    white-space:nowrap;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }
  .mp-label span { 
    color:rgba(255,255,255,0.95); 
    font-size:11px; 
    font-weight:700; 
    font-family:-apple-system,sans-serif; 
    letter-spacing: 0.3px;
  }

  /* Activity wave */
  @keyframes activity-wave {
    0%   { transform:scale(1);   opacity:0.5; }
    100% { transform:scale(4);   opacity:0; }
  }
  .spicey-activity-wave {
    position:absolute; border-radius:50%; pointer-events:none; z-index:5;
    width:44px; height:44px; margin-left:-22px; margin-top:-22px;
    border:1.5px solid var(--wc,#FF4FD8);
    animation: activity-wave 2.4s ease-out forwards;
  }

`;

if (typeof document !== 'undefined') {
  const ex = document.getElementById('spicey-mapbox-css');
  if (ex) ex.remove();
  const s = document.createElement('style');
  s.id = 'spicey-mapbox-css';
  s.textContent = CSS;
  document.head.appendChild(s);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function safeRemoveMarker(marker) {
  try {
    if (marker && typeof marker.remove === 'function') marker.remove();
  } catch (error) {
    console.warn('[MAP] Marker remove skipped:', error?.message || error);
  }
}

function timeAgo(d) {
  if (!d) return 'now';
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return d < 1 ? `${Math.round(d * 1000)}m` : `${d.toFixed(1)} km`;
}

function formatNum(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

function getCityName(lat, lng) {
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

const FILTERS = [
  { id: 'all', label: 'All', icon: Users },
  { id: 'live', label: 'LIVE', icon: Flame },
  { id: 'stories', label: 'Stories', icon: Sparkles },
  { id: 'nearby', label: 'Nearby', icon: Navigation },
];

// City tiers: 1 = major world city (show from zoom 3+), 2 = regional city (zoom 5+), 3 = local city (zoom 6+)
// Balkan cities are tier 2/3 so they appear when zoomed into the region.
const SEED_CITY_LOCATIONS = [
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
  // ── Kosovo ──
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
  // ── Albania ──
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
  // ── North Macedonia ──
  { name: 'Skopje', lat: 41.9981, lng: 21.4254, tier: 2 },
  { name: 'Tetovo', lat: 41.9994, lng: 20.9714, tier: 2 },
  { name: 'Gostivar', lat: 41.7958, lng: 20.9081, tier: 2 },
  { name: 'Ohrid', lat: 41.1231, lng: 20.8016, tier: 2 },
  { name: 'Bitola', lat: 41.0297, lng: 21.3294, tier: 2 },
  { name: 'Kumanovo', lat: 42.1322, lng: 21.7144, tier: 2 },
  { name: 'Strumica', lat: 41.4378, lng: 22.6431, tier: 3 },
  { name: 'Veles', lat: 41.7153, lng: 21.7753, tier: 3 },
  { name: 'Struga', lat: 41.1781, lng: 20.6781, tier: 2 },
  // ── Montenegro ──
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
  // ── Serbia ──
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
  // ── Bosnia and Herzegovina ──
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
  // ── Croatia ──
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
  // ── Slovenia ──
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

// Cover photos for Balkan cities — used on map pin thumbnails (real city-matched photos)
const BALKAN_COVERS = {
  // Kosovo — real Pristina/Prizren Unsplash photos
  'Pristina':   'https://images.unsplash.com/photo-1687869545075-d8a613c04647?w=300',
  'Prizren':    'https://images.unsplash.com/photo-1698715874248-72303255fb3d?w=300',
  'Peja':       'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300',
  'Gjakova':    'https://images.unsplash.com/photo-1622400456695-951f80571268?w=300',
  'Mitrovica':  'https://images.unsplash.com/photo-1633536028458-7e59d6d605fa?w=300',
  'Gjilan':     'https://images.unsplash.com/photo-1638874202640-8f5ff48d5acc?w=300',
  'Ferizaj':    'https://images.unsplash.com/photo-1700591625914-87ad6b371ce2?w=300',
  // Albania — real Tirana Unsplash photos
  'Tirana':     'https://images.unsplash.com/photo-1632353913765-9b56b7b4bd55?w=300',
  'Durres':     'https://images.unsplash.com/photo-1629444734485-577f37d5a671?w=300',
  'Vlora':      'https://images.unsplash.com/photo-1668301157539-ede800d169d4?w=300',
  'Shkoder':    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300',
  'Saranda':    'https://images.unsplash.com/photo-1695552714485-2a6b946aea38?w=300',
  'Gjirokaster':'https://images.unsplash.com/photo-1698715874248-72303255fb3d?w=300',
  'Berat':      'https://images.unsplash.com/photo-1622151680932-c855a0a0b011?w=300',
  'Elbasan':    'https://images.unsplash.com/photo-1705174315361-a1ee617a3d5b?w=300',
  'Korce':      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300',
  // North Macedonia — real Skopje/Ohrid/Tetovo Unsplash photos
  'Skopje':     'https://images.unsplash.com/photo-1642291373671-29794831ebce?w=300',
  'Ohrid':      'https://images.unsplash.com/photo-1653389167152-7dbd6d165631?w=300',
  'Struga':     'https://images.unsplash.com/photo-1611845528017-75215e6d662c?w=300',
  'Tetovo':     'https://images.unsplash.com/photo-1567877862833-9010bc8799ff?w=300',
  'Gostivar':   'https://images.unsplash.com/photo-1737922370925-565849e505e5?w=300',
  'Bitola':     'https://images.unsplash.com/photo-1619165822586-6b4f6583098e?w=300',
  'Kumanovo':   'https://images.unsplash.com/photo-1600779899814-40d237afe7db?w=300',
  // Montenegro — real Ulcinj/Budva Unsplash photos
  'Podgorica':  'https://images.unsplash.com/photo-1624895060572-a5fc35b5db2f?w=300',
  'Budva':      'https://images.unsplash.com/photo-1729455155986-4b11d6298923?w=300',
  'Kotor':      'https://images.unsplash.com/photo-1673355099666-abb576730735?w=300',
  'Bar':        'https://images.unsplash.com/photo-1580046866088-820f9b059f90?w=300',
  'Ulcinj':     'https://images.unsplash.com/photo-1729455155986-4b11d6298923?w=300',
  'Herceg Novi':'https://images.unsplash.com/photo-1668301157539-ede800d169d4?w=300',
  'Cetinje':    'https://images.unsplash.com/photo-1619165822586-6b4f6583098e?w=300',
  // Serbia
  'Belgrade':   'https://images.unsplash.com/photo-1656500959120-e2c368582aeb?w=300',
  'Novi Sad':   'https://images.unsplash.com/photo-1600779899814-40d237afe7db?w=300',
  'Nis':        'https://images.unsplash.com/photo-1619165822586-6b4f6583098e?w=300',
  'Novi Pazar': 'https://images.unsplash.com/photo-1698715874248-72303255fb3d?w=300',
  // Bosnia
  'Sarajevo':   'https://images.unsplash.com/photo-1698715874248-72303255fb3d?w=300',
  'Mostar':     'https://images.unsplash.com/photo-1650240430719-261b362f9308?w=300',
  'Banja Luka': 'https://images.unsplash.com/photo-1624895060572-a5fc35b5db2f?w=300',
  'Tuzla':      'https://images.unsplash.com/photo-1619165822586-6b4f6583098e?w=300',
  'Trebinje':   'https://images.unsplash.com/photo-1629444734485-577f37d5a671?w=300',
  // Croatia
  'Zagreb':     'https://images.unsplash.com/photo-1624895060572-a5fc35b5db2f?w=300',
  'Split':      'https://images.unsplash.com/photo-1668301157539-ede800d169d4?w=300',
  'Dubrovnik':  'https://images.unsplash.com/photo-1555992336-03a23c7b20ee?w=300',
  'Zadar':      'https://images.unsplash.com/photo-1729455155986-4b11d6298923?w=300',
  'Hvar':       'https://images.unsplash.com/photo-1695552714485-2a6b946aea38?w=300',
  'Rovinj':     'https://images.unsplash.com/photo-1673355099666-abb576730735?w=300',
  // Slovenia
  'Ljubljana':  'https://images.unsplash.com/photo-1619165822586-6b4f6583098e?w=300',
  'Bled':       'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300',
};


const getProfileAvatarUrl = (profile = {}, fallback = {}) => (
  profile.avatar_url
  || profile.profile_photo_url
  || profile.photo_url
  || profile.image_url
  || profile.author_avatar
  || fallback.avatar_url
  || fallback.profile_photo_url
  || fallback.photo_url
  || ''
);

const isVideoAvatar = (url = '') => /\.(mp4|webm|mov)(\?|$)/i.test(url);

function buildAvatarEl(profile, { isMe = false, state = 'online', fallbackUser = null } = {}) {
  // Neon pin colors
  let pinColor, pinGlow;
  if (isMe)                 { pinColor='#22c55e'; pinGlow='rgba(34,197,94,0.8)'; }
  else if (state==='live')  { pinColor='#ff6b35'; pinGlow='rgba(255,107,53,0.8)'; }
  else if (state==='story') { pinColor='#ffd60a'; pinGlow='rgba(255,214,10,0.8)'; }
  else if (state==='vip')   { pinColor='#fbbf24'; pinGlow='rgba(251,191,36,0.8)'; }
  else                      { pinColor='#a78bfa'; pinGlow='rgba(167,139,250,0.8)'; }

  const name = isMe ? 'You' : (profile.username || profile.full_name || 'User');
  const label = name.length > 11 ? name.slice(0, 11) + '…' : name;
  const hasPulse = false;
  const avatarSrc = getProfileAvatarUrl(profile, fallbackUser || {});
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.username || profile.full_name || fallbackUser?.full_name || fallbackUser?.email || 'U')}&background=1a0a2e&color=fff&size=100`;

  const wrap = document.createElement('div');
  wrap.className = 'spicey-marker';
  wrap.dataset.avatarSrc = avatarSrc || fallbackAvatar;
  wrap.style.cssText = `--pin-color:${pinColor};--pin-glow:${pinGlow};`;
  const avatarMarkup = isVideoAvatar(avatarSrc)
    ? `<span class="mp-avatar spicey-video-avatar-frame" style="width:32px;height:32px;border-radius:50%;"><video src="${avatarSrc}" class="spicey-video-avatar-crop" muted autoplay loop playsinline></video></span>`
    : `<img src="${avatarSrc || fallbackAvatar}" alt="${name}" class="mp-avatar" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" onerror="this.src='${fallbackAvatar}'" />`;

  wrap.innerHTML = `
    <div class="mp-pin-wrap">
      ${hasPulse ? `<div class="mp-pulse"></div>` : ''}
      ${avatarMarkup}
      <div class="mp-pin-inner"></div>
    </div>
    <div class="mp-label"><span>${label}</span></div>
  `;
  return wrap;
}

// City cover photos for map pins
const CITY_COVER_PHOTOS = {
  'New York City': 'https://images.unsplash.com/photo-1522083165195-3424ed129620?w=300',
  'Los Angeles':   'https://images.unsplash.com/photo-1580655653885-65763b2597d4?w=300',
  'London':        'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=300',
  'Paris':         'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=300',
  'Tokyo':         'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=300',
  'Madrid':        'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=300',
  'Berlin':        'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=300',
  'Rome':          'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=300',
  'Dubai':         'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=300',
  'Barcelona':     'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=300',
  'Amsterdam':     'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=300',
  'Sydney':        'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=300',
  'Singapore':     'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=300',
  'Bangkok':       'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=300',
  'Istanbul':      'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=300',
  'Mumbai':        'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=300',
  'Seoul':         'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=300',
  'Toronto':       'https://images.unsplash.com/photo-1517090186835-e348b621c9ca?w=300',
  'Chicago':       'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=300',
  'Miami':         'https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=300',
  'São Paulo':     'https://images.unsplash.com/photo-1543059080-f9b1272213d5?w=300',
  'Mexico City':   'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=300',
  'Cairo':         'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=300',
  'Cape Town':     'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=300',
  'Vienna':        'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=300',
  'Prague':        'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=300',
  'Budapest':      'https://images.unsplash.com/photo-1549144511-f099e773c147?w=300',
  'Moscow':        'https://images.unsplash.com/photo-1513326738677-b964603b136d?w=300',
  'Shanghai':      'https://images.unsplash.com/photo-1548919973-5cef591cdbc9?w=300',
  'Hong Kong':     'https://images.unsplash.com/photo-1506870984702-655c8c83b7ac?w=300',
  'Rio de Janeiro':'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=300',
  'Lisbon':        'https://images.unsplash.com/photo-1513623935135-c896b59073c1?w=300',
  'Athens':        'https://images.unsplash.com/photo-1603565816030-6b389eeb23cb?w=300',
  'Milan':         'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300',
  'Osaka':         'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300',
  'Bali':          'https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?w=300',
  'Marrakech':     'https://images.unsplash.com/photo-1518655048521-f130df041f66?w=300',
  'Las Vegas':     'https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?w=300',
  'San Francisco': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=300',
};

// Deterministic pseudo-random for cover photo fallback
function cityStrToNum(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

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
  'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=300',
  'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=300',
];

function getCityCoverPhoto(cityName) {
  if (CITY_COVER_PHOTOS[cityName]) return CITY_COVER_PHOTOS[cityName];
  if (BALKAN_COVERS[cityName]) return BALKAN_COVERS[cityName];
  const idx = cityStrToNum(cityName) % FALLBACK_COVERS.length;
  return FALLBACK_COVERS[idx];
}

function buildCityEl(cityName, postCount, options = {}) {
  const { hasRealContent = false, sampleImage = null } = options;
  // Prefer real user photo, then curated cover, then fallback
  const photo = sampleImage || getCityCoverPhoto(cityName);
  const el = document.createElement('div');
  el.style.cssText = 'cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;';

  // Cities with real user content get a brighter, more vivid border
  const borderColor = hasRealContent ? 'rgba(255,80,0,0.95)' : 'rgba(160,32,240,0.9)';
  const glowColor = hasRealContent
    ? '0 0 18px rgba(255,80,0,0.9), 0 0 36px rgba(255,40,160,0.5)'
    : '0 0 18px rgba(160,32,240,0.8), 0 0 36px rgba(255,79,216,0.4)';

  el.innerHTML = `
    <div style="
      position:relative;
      width:72px; height:90px;
      border-radius:14px;
      overflow:hidden;
      border:2px solid ${borderColor};
      box-shadow:${glowColor};
    ">
      ${photo
        ? `<img src="${photo}" style="width:100%;height:100%;object-fit:cover;display:block;" />`
        : `<div style="width:100%;height:100%;background:linear-gradient(135deg,#A020F0,#FF4FD8);"></div>`
      }
      <div style="position:absolute;inset:0;background:linear-gradient(to bottom,transparent 40%,rgba(0,0,0,0.75) 100%);"></div>
      <div style="position:absolute;bottom:5px;left:0;right:0;text-align:center;">
        <span style="color:white;font-size:8px;font-weight:800;font-family:-apple-system,sans-serif;text-shadow:0 1px 4px rgba(0,0,0,0.8);">${cityName.split(' ')[0]}</span>
      </div>
      ${hasRealContent ? `
      <div style="position:absolute;top:4px;left:4px;background:linear-gradient(135deg,#FF5500,#e91e8c);border-radius:5px;padding:1px 5px;display:flex;align-items:center;gap:2px;">
        <span style="color:white;font-size:7px;font-weight:900;font-family:-apple-system,sans-serif;">🔥 LIVE</span>
      </div>` : ''}
      ${postCount > 0 ? `
      <div style="position:absolute;top:4px;right:4px;background:linear-gradient(135deg,#A020F0,#FF4FD8);border-radius:8px;padding:1px 5px;">
        <span style="color:white;font-size:7px;font-weight:800;font-family:-apple-system,sans-serif;">${formatNum(postCount)}</span>
      </div>` : ''}
    </div>
  `;
  return el;
}

// ── Helper: Add custom layers (roads, water, buildings) ───────────────────────
function addCustomLayers(map) {
  if (!map || !map.getSource('composite')) return;
  const mapIsLight = false;
  const waterFill = '#38aee8';
  const waterLine = '#75d7ff';
  const landFill = '#120719';
  const bgFill = '#050917';
  const forceWaterPaint = () => {
    try {
      const layers = map.getStyle()?.layers || [];
      layers.forEach(layer => {
        const id = layer.id || '';
        const sourceLayer = layer['source-layer'] || '';
        const key = `${id} ${sourceLayer}`;
        const isWater = /water|waterway|ocean|sea|marine|river|stream|canal|lake/i.test(key);
        if (!isWater) return;
        if (layer.type === 'fill') {
          try { map.setPaintProperty(id, 'fill-color', waterFill); } catch {}
          try { map.setPaintProperty(id, 'fill-opacity', 0.68); } catch {}
          try { map.setPaintProperty(id, 'fill-outline-color', waterLine); } catch {}
        }
        if (layer.type === 'line') {
          try { map.setPaintProperty(id, 'line-color', waterLine); } catch {}
          try { map.setPaintProperty(id, 'line-opacity', mapIsLight ? 0.95 : 0.58); } catch {}
          try { map.setPaintProperty(id, 'line-width', ['interpolate', ['linear'], ['zoom'], 0, 0.65, 8, 1.2, 14, 2.2]); } catch {}
        }
      });
    } catch {}
  };

  try {
    if (!map.getSource('mapbox-dem')) {
      map.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14,
      });
    }
    map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.55 });
    map.setFog(null);
  } catch {}

  // Remove existing custom layers first to avoid duplicates
  [
    'spicey-admin-country-glow', 'spicey-admin-country-line', 'spicey-admin-region-line',
    'spicey-road-motorway-glow', 'spicey-road-primary-glow', 'spicey-road-secondary-glow', 'spicey-road-street-glow',
    'spicey-road-motorway', 'spicey-road-primary', 'spicey-road-secondary', 'spicey-road-street',
    'spicey-water-fill', 'spicey-building-edge-glow', 'spicey-building-edge', '3d-buildings',
  ].forEach(id => {
    try { if (map.getLayer(id)) map.removeLayer(id); } catch {}
  });

  const forceSpiceyBase = () => {
    try {
      const layers = map.getStyle()?.layers || [];
      layers.forEach(layer => {
        const id = layer.id || '';
        const sourceLayer = layer['source-layer'] || '';
        const key = `${id} ${sourceLayer}`;

        if (layer.type === 'background') {
          try { map.setPaintProperty(id, 'background-color', bgFill); } catch {}
          try { map.setPaintProperty(id, 'background-opacity', mapIsLight ? 1 : 0.92); } catch {}
        }
        if (layer.type === 'fill' && /water/i.test(key)) {
          try { map.setPaintProperty(id, 'fill-color', waterFill); } catch {}
          try { map.setPaintProperty(id, 'fill-opacity', 0.68); } catch {}
          try { map.setPaintProperty(id, 'fill-outline-color', waterLine); } catch {}
        }
        if (layer.type === 'line' && /water|river|stream|canal/i.test(key)) {
          try { map.setPaintProperty(id, 'line-color', waterLine); } catch {}
          try { map.setPaintProperty(id, 'line-opacity', mapIsLight ? 0.86 : 0.58); } catch {}
        }
        if (layer.type === 'fill' && /land|park|green|wood|grass|national|pitch|cemetery|golf/i.test(key)) {
          try { map.setPaintProperty(id, 'fill-color', landFill); } catch {}
          try { map.setPaintProperty(id, 'fill-opacity', mapIsLight ? 0.98 : 0.98); } catch {}
        }
        if (mapIsLight && layer.type === 'fill' && !/water|building/i.test(key)) {
          try { map.setPaintProperty(id, 'fill-color', '#ffffff'); } catch {}
          try { map.setPaintProperty(id, 'fill-opacity', 0.96); } catch {}
        }
        if (layer.type === 'line' && /admin|boundary|border|country|state/i.test(key)) {
          try { map.setPaintProperty(id, 'line-color', mapIsLight ? '#ff8adf' : '#ff8a3d'); } catch {}
          try { map.setPaintProperty(id, 'line-opacity', mapIsLight ? 0.28 : 0.52); } catch {}
          try { map.setPaintProperty(id, 'line-width', ['interpolate', ['linear'], ['zoom'], 0, 0.45, 3, 0.68, 6, 0.92]); } catch {}
        }
      });
    } catch {}
  };

  // ── Water ──────────────────────────────────────────────
  forceWaterPaint();
  try {
    map.addLayer({
      id: 'spicey-water-fill',
      source: 'composite',
      'source-layer': 'water',
      type: 'fill',
      paint: {
        'fill-color': waterFill,
        'fill-opacity': 0.68,
        'fill-outline-color': waterLine,
      },
    });
  } catch {}
  forceWaterPaint();

  try {
    map.addLayer({
      id: 'spicey-admin-country-line',
      source: 'composite',
      'source-layer': 'admin',
      filter: ['all', ['match', ['to-string', ['get', 'admin_level']], ['0', '1', '2'], true, false], ['!=', ['get', 'maritime'], true]],
      type: 'line',
      minzoom: 0,
      paint: {
        'line-color': mapIsLight ? '#ff8adf' : '#ff8a3d',
        'line-width': ['interpolate', ['linear'], ['zoom'], 0, 0.48, 3, 0.72, 6, 0.95],
        'line-opacity': mapIsLight ? 0.34 : 0.58,
      },
    });
  } catch {}

  try {
    map.addLayer({
      id: 'spicey-admin-region-line',
      source: 'composite',
      'source-layer': 'admin',
      filter: ['all', ['match', ['to-string', ['get', 'admin_level']], ['3', '4'], true, false], ['!=', ['get', 'maritime'], true]],
      type: 'line',
      minzoom: 4,
      paint: {
        'line-color': mapIsLight ? '#ffb15c' : '#9b7cff',
        'line-width': ['interpolate', ['linear'], ['zoom'], 4, 0.38, 7, 0.68, 9, 0.95],
        'line-opacity': mapIsLight ? 0.20 : 0.42,
      },
    });
  } catch {}

  // ── 3D buildings ────────────────────────────────────────
  try {
    map.addLayer({
      id: '3d-buildings',
      source: 'composite',
      'source-layer': 'building',
      filter: ['==', 'extrude', 'true'],
      type: 'fill-extrusion',
      minzoom: 11,
      paint: {
        'fill-extrusion-color': [
          'interpolate', ['linear'], ['zoom'],
          11, mapIsLight ? '#ffe4f5' : '#2b0a36',
          13, mapIsLight ? '#ffb25f' : '#6d1a7f',
          15, mapIsLight ? '#ff3fa6' : '#c026d3',
          17, mapIsLight ? '#a020f0' : '#ff6b00',
        ],
        'fill-extrusion-height': ['*', ['coalesce', ['get', 'height'], 22], 1.95],
        'fill-extrusion-base': ['coalesce', ['get', 'min_height'], 0],
        'fill-extrusion-opacity': mapIsLight ? 0.96 : 0.96,
        'fill-extrusion-vertical-gradient': true,
      },
    });
    try { map.setPaintProperty('3d-buildings', 'fill-extrusion-emissive-strength', mapIsLight ? 0.28 : 0.62); } catch {}
    try { map.setPaintProperty('3d-buildings', 'fill-extrusion-flood-light-color', mapIsLight ? '#ff6b00' : '#ff2e9d'); } catch {}
    try { map.setPaintProperty('3d-buildings', 'fill-extrusion-flood-light-intensity', mapIsLight ? 0.58 : 0.72); } catch {}
    try { map.setPaintProperty('3d-buildings', 'fill-extrusion-ambient-occlusion-intensity', 0.55); } catch {}
  } catch {}

  try {
    map.addLayer({
      id: 'spicey-building-edge-glow',
      source: 'composite',
      'source-layer': 'building',
      filter: ['==', 'extrude', 'true'],
      type: 'line',
      minzoom: 11,
      paint: {
        'line-color': [
          'interpolate', ['linear'], ['zoom'],
          11, '#a020f0',
          14, '#ff2e9d',
          16, '#ff6b00',
        ],
        'line-width': ['interpolate', ['linear'], ['zoom'], 11, 1.2, 14, 2.6, 16, 4.2],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 11, 0.42, 14, 0.68, 16, 0.86],
        'line-blur': ['interpolate', ['linear'], ['zoom'], 11, 0.35, 16, 0.85],
      },
    });
  } catch {}

  try {
    map.addLayer({
      id: 'spicey-building-edge',
      source: 'composite',
      'source-layer': 'building',
      filter: ['==', 'extrude', 'true'],
      type: 'line',
      minzoom: 12,
      paint: {
        'line-color': [
          'interpolate', ['linear'], ['zoom'],
          12, '#d8b4fe',
          14, '#ff9de8',
          16, '#ffd0a3',
        ],
        'line-width': ['interpolate', ['linear'], ['zoom'], 12, 0.85, 15, 1.65, 17, 2.3],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 12, 0.58, 15, 0.82, 17, 0.94],
        'line-blur': 0.05,
      },
    });
  } catch {}

  const addRoad = (id, filter, color, glow, widths, opacity = 0.95) => {
    const minZoom = id.includes('street') ? 12 : id.includes('secondary') ? 11 : id.includes('primary') ? 10 : 8;
    try {
      map.addLayer({
        id: `${id}-glow`,
        source: 'composite',
        'source-layer': 'road',
        filter,
        type: 'line',
        minzoom: minZoom,
        paint: {
          'line-color': glow,
          'line-width': widths.map((v, index) => (index > 1 && index % 2 === 1 ? v + 2.6 : v)),
          'line-opacity': ['interpolate', ['linear'], ['zoom'], minZoom, 0, minZoom + 1.2, opacity * 0.14, 16, opacity * 0.2],
          'line-blur': ['interpolate', ['linear'], ['zoom'], minZoom, 0.4, 16, 2.2],
        },
      });
    } catch {}

    try {
      map.addLayer({
        id,
        source: 'composite',
        'source-layer': 'road',
        filter,
        type: 'line',
        minzoom: minZoom,
        paint: {
          'line-color': color,
          'line-width': widths,
          'line-opacity': opacity,
          'line-blur': 0.05,
        },
      });
    } catch {}
  };

  const recolorBaseRoadLayers = () => {
    const spiceyRoadColor = [
      'match',
      ['get', 'class'],
      ['motorway', 'trunk'], '#ff6b00',
      ['primary'], '#ff1493',
      ['secondary', 'tertiary'], '#a020f0',
      ['street', 'street_limited', 'service', 'path', 'track'], '#d946ef',
      '#ff1493',
    ];

    try {
      const layers = map.getStyle()?.layers || [];
      layers.forEach(layer => {
        const isRoadLine = layer.type === 'line'
          && ((layer['source-layer'] || '').includes('road') || /road|street|bridge|tunnel/i.test(layer.id));
        if (!isRoadLine || /^spicey-road/.test(layer.id)) return;
        try { map.setPaintProperty(layer.id, 'line-color', spiceyRoadColor); } catch {}
        try {
          map.setPaintProperty(layer.id, 'line-opacity', [
            'interpolate', ['linear'], ['zoom'],
            0, 0,
            6.8, 0,
            8, 0.12,
            13, 0.18,
          ]);
        } catch {}
        try {
          map.setPaintProperty(layer.id, 'line-width', [
            'interpolate', ['linear'], ['zoom'],
            7, 0.35,
            12, 0.7,
            16, 1.6,
            18, 2.4,
          ]);
        } catch {}
      });
    } catch {}
  };

  // ── Spicey road network — purple, pink, orange only ─────────────────────────
  forceSpiceyBase();
  recolorBaseRoadLayers();
  addRoad(
    'spicey-road-motorway',
    ['in', 'class', 'motorway', 'trunk'],
    '#ff6b00',
    '#ff8a00',
    ['interpolate', ['linear'], ['zoom'], 8, 2.2, 14, 4.8, 18, 8.2],
    0.9,
  );
  addRoad(
    'spicey-road-primary',
    ['in', 'class', 'primary'],
    '#ff1493',
    '#ff2bd6',
    ['interpolate', ['linear'], ['zoom'], 10, 1.8, 14, 3.8, 18, 6.4],
    0.92,
  );
  addRoad(
    'spicey-road-secondary',
    ['in', 'class', 'secondary', 'tertiary'],
    '#a020f0',
    '#c02cff',
    ['interpolate', ['linear'], ['zoom'], 11, 1.35, 14, 2.9, 18, 5.1],
    0.9,
  );
  addRoad(
    'spicey-road-street',
    ['in', 'class', 'street', 'street_limited'],
    '#d946ef',
    '#ff1493',
    ['interpolate', ['linear'], ['zoom'], 12, 0.7, 15, 1.45, 17, 2.7],
    0.78,
  );

  if (map.__spiceyRoadMotion) {
    clearInterval(map.__spiceyRoadMotion);
    map.__spiceyRoadMotion = null;
  }

  return;

  // Motorways — orange
  try {
    map.addLayer({
      id: 'spicey-road-motorway',
      source: 'composite',
      'source-layer': 'road',
      filter: ['in', 'class', 'motorway', 'trunk'],
      type: 'line',
      paint: {
        'line-color': '#FF8C00',
        'line-width': ['interpolate', ['linear'], ['zoom'], 8, 2, 14, 5, 18, 9],
        'line-opacity': 0.95,
      },
    });
  } catch {}

  // Primary roads — pink
  try {
    map.addLayer({
      id: 'spicey-road-primary',
      source: 'composite',
      'source-layer': 'road',
      filter: ['in', 'class', 'primary'],
      type: 'line',
      paint: {
        'line-color': '#FF1493',
        'line-width': ['interpolate', ['linear'], ['zoom'], 10, 1.5, 14, 4, 18, 7],
        'line-opacity': 0.9,
      },
    });
  } catch {}

  // Secondary roads — purple
  try {
    map.addLayer({
      id: 'spicey-road-secondary',
      source: 'composite',
      'source-layer': 'road',
      filter: ['in', 'class', 'secondary', 'tertiary'],
      type: 'line',
      paint: {
        'line-color': '#BA55D3',
        'line-width': ['interpolate', ['linear'], ['zoom'], 11, 1.2, 14, 3, 18, 6],
        'line-opacity': 0.85,
      },
    });
  } catch {}

  // Streets — violet
  try {
    map.addLayer({
      id: 'spicey-road-street',
      source: 'composite',
      'source-layer': 'road',
      filter: ['in', 'class', 'street', 'street_limited'],
      type: 'line',
      paint: {
        'line-color': '#DA70D6',
        'line-width': ['interpolate', ['linear'], ['zoom'], 12, 0.8, 15, 2, 17, 4],
        'line-opacity': 0.8,
      },
    });
  } catch {}
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ContactsMap() {
  const navigate = useNavigate();
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const mapStyleModeRef = useRef(null);
  const markersRef = useRef({});
  const previewMarkersRef = useRef([]);
  const cityMarkersRef = useRef([]);

  const [me, setMe] = useState(null);
  const [selected, setSelected] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [userStates, setUserStates] = useState({});
  const [vipUsers, setVipUsers] = useState({});
  const [showPostsModal, setShowPostsModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState('');
  const [visibleCities, setVisibleCities] = useState([]);
  const [mapViewMode, setMapViewMode] = useState('neon');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationPanelOpen, setLocationPanelOpen] = useState(false);
  const [trendingCollapsed, setTrendingCollapsed] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [gpsStatus, setGpsStatus] = useState('idle');
  const [gpsError, setGpsError] = useState('');
  // Dynamic cities from real user posts (map_visible=true)
  const [dynamicCities, setDynamicCities] = useState([]);

  useEffect(() => { base44.auth.me().then(setMe).catch(() => {}); }, []);

  useEffect(() => {
    setTrendingCollapsed(false);
  }, []);

  // Debug: log GPS status on mount
  useEffect(() => {
    if (!navigator.geolocation) { console.warn('[MAP] GPS not available in this browser'); return; }
    setGpsStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      pos => {
        setGpsStatus('online');
        setGpsError('');
        setCurrentLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, location_updated_at: new Date().toISOString() });
        console.log('[MAP] GPS OK:', pos.coords.latitude, pos.coords.longitude, '±', pos.coords.accuracy, 'm');
      },
      err => {
        setGpsStatus(err.code === 1 ? 'denied' : 'error');
        setGpsError(err.code === 1 ? 'Location permission is blocked' : err.message);
        console.warn('[MAP] GPS error:', err.code, err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const { data: profiles = [], refetch } = useQuery({
    queryKey: ['map-profiles-v3'],
    queryFn: async () => {
      const all = await base44.entities.UserProfile.list('-updated_date', 120);
      return all.filter(p => p.latitude && p.longitude && p.share_location !== false).slice(0, 80);
    },
    staleTime: 5000,
    refetchInterval: 20000,
  });

  // Real-time subscription for instant updates
  useEffect(() => {
    const unsubscribe = base44.entities.UserProfile.subscribe((event) => {
      if (event.type === 'update' && event.data?.latitude && event.data?.longitude) {
        refetch();
      }
    });
    return unsubscribe;
  }, [me]);

  const { data: myProfile } = useQuery({
    queryKey: ['map-my-profile-v2', me?.id],
    queryFn: async () => {
      const r = await base44.entities.UserProfile.filter({ user_id: me.id }, '-created_date', 1);
      return r[0] || null;
    },
    enabled: !!me?.id,
    staleTime: 30000,
  });

  // ── Load dynamic cities from real user posts ─────────────────────────────────
  useEffect(() => {
    if (!me) return;
    const loadDynamicCities = async () => {
      try {
        const mapPosts = await base44.entities.Post.filter({ map_visible: true }, '-created_date', 120);

        // Group by map_city
        const cityMap = {};
        mapPosts.forEach(post => {
          const city = post.map_city;
          if (!city) return;
          if (!cityMap[city]) {
            cityMap[city] = { name: city, postCount: 0, sampleImage: null, lat: null, lng: null };
          }
          cityMap[city].postCount++;
          if (!cityMap[city].sampleImage && post.image_url) {
            cityMap[city].sampleImage = post.image_url;
          }
        });

        const seedNames = new Set(SEED_CITY_LOCATIONS.map(c => c.name.toLowerCase()));

        // For cities NOT in the seed list, geocode them via Nominatim
        const unknownCities = Object.values(cityMap).filter(
          c => !seedNames.has(c.name.toLowerCase())
        ).slice(0, 8);

        // Geocode in parallel (max 5 at once to avoid rate limits)
        const geocodeCity = async (cityName) => {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`,
              { headers: { 'Accept-Language': 'en' } }
            );
            const data = await res.json();
            if (data[0]) {
              return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
            }
          } catch {}
          return null;
        };

        // Batch geocode unknown cities
        for (let i = 0; i < unknownCities.length; i += 5) {
          const batch = unknownCities.slice(i, i + 5);
          const coords = await Promise.all(batch.map(c => geocodeCity(c.name)));
          coords.forEach((coord, idx) => {
            if (coord) {
              cityMap[batch[idx].name].lat = coord.lat;
              cityMap[batch[idx].name].lng = coord.lng;
            }
          });
          if (i + 5 < unknownCities.length) {
            await new Promise(r => setTimeout(r, 1100)); // Nominatim rate limit: 1 req/sec
          }
        }

        setDynamicCities(Object.values(cityMap));
      } catch (e) {
        console.warn('Dynamic cities load failed:', e);
      }
    };
    loadDynamicCities();
  }, [me]);

  useEffect(() => {
    if (!profiles.length) return;
    const load = async () => {
      const states = {}, vips = {};
      try {
        const stories = await base44.entities.Story.list('-created_date', 100);
        stories.forEach(s => { if (s.user_id) states[s.user_id] = 'story'; });
        const subs = await base44.entities.Subscription.filter({ status: 'active' });
        subs.forEach(sub => {
          if (sub.user_id && ['vip', 'creator', 'business'].includes(sub.plan_type)) vips[sub.user_id] = sub.plan_type;
        });
      } catch {}
      setUserStates(states);
      setVipUsers(vips);
    };
    load();
  }, [profiles.length]);

  const [locationSharing, setLocationSharing] = useState(true);
  const watchIdRef = useRef(null);
  const locationIntervalRef = useRef(null);
  const [isLight, setIsLight] = useState(false);

  // Load saved preference
  useEffect(() => {
    const saved = localStorage.getItem('spicey_share_location');
    if (saved === 'false') setLocationSharing(false);
  }, []);

  useEffect(() => {
    if (!myProfile) return;
    if (myProfile.share_location === false) {
      setLocationSharing(false);
      localStorage.setItem('spicey_share_location', 'false');
    }
  }, [myProfile?.share_location]);

  const getIsLightMapTheme = () => {
    return false;
  };

  // Match app theme: light mode keeps Spicey neon UI, but map base becomes white/blue.
  useEffect(() => {
    const check = () => {
      const nextIsLight = getIsLightMapTheme();
      setIsLight(nextIsLight);
      if (mapRef.current && mapReady) {
        if (mapViewMode !== 'satellite') {
          const desiredStyle = nextIsLight ? SPICEY_LIGHT_MAP_STYLE : SPICEY_DARK_MAP_STYLE;
          const desiredMode = nextIsLight ? 'light' : 'dark';
          if (mapStyleModeRef.current !== desiredMode) {
            mapStyleModeRef.current = desiredMode;
            mapRef.current.setStyle(desiredStyle);
            mapRef.current.once('style.load', () => restoreSpiceyMapVisuals(250));
            return;
          }
        }
        restoreSpiceyMapVisuals(250);
      }
    };
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme', 'data-vip-theme'] });
    if (document.body) obs.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-theme', 'data-vip-theme'] });
    const interval = window.setInterval(check, 1200);
    return () => {
      obs.disconnect();
      window.clearInterval(interval);
    };
  }, [mapReady, mapViewMode]);

  const toggleLocationSharing = async () => {
    const newVal = !locationSharing;
    setLocationSharing(newVal);
    localStorage.setItem('spicey_share_location', String(newVal));

    if (!newVal) {
      // Turn off — clear watch + stop sending location
      if (watchIdRef.current !== null) { navigator.geolocation?.clearWatch(watchIdRef.current); watchIdRef.current = null; }
      if (locationIntervalRef.current) { clearInterval(locationIntervalRef.current); locationIntervalRef.current = null; }
      // Hide from map by setting share_location=false on profile
      if (myProfile?.id) {
        base44.entities.UserProfile.update(myProfile.id, { share_location: false }).catch(() => {});
      }
    } else {
      if (myProfile?.id) {
        base44.entities.UserProfile.update(myProfile.id, { share_location: true }).catch(() => {});
      }
      navigator.geolocation?.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setGpsStatus('online');
          setGpsError('');
          setCurrentLocation({ latitude, longitude, location_updated_at: new Date().toISOString() });
          base44.functions.invoke('updateUserLocation', { latitude, longitude, location_name: getCityName(latitude, longitude) }).catch(() => {});
          flyToPoint(longitude, latitude, 14.8);
        },
        (err) => {
          setGpsStatus(err.code === 1 ? 'denied' : 'error');
          setGpsError(err.code === 1 ? 'Location permission is blocked' : err.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
    setLocationPanelOpen(true);
  };

  useEffect(() => {
    if (!me || !locationSharing) return;

    let lastSentLat = null, lastSentLng = null;

    const sendLocation = async (pos) => {
      const { latitude, longitude, accuracy } = pos.coords;
      const city = getCityName(latitude, longitude);
      console.log('[MAP] 📍 GPS UPDATE:', latitude, longitude, '±' + accuracy + 'm', '| City:', city, '| Time:', new Date().toLocaleTimeString());

      // Only skip if accuracy is extremely bad (>2km) — allows travel/moving scenarios
      if (accuracy > 2000) {
        console.warn('[MAP] ⚠️ Skipping — accuracy too low:', accuracy, 'm');
        return;
      }

      setGpsStatus('online');
      setGpsError('');
      setCurrentLocation({ latitude, longitude, location_updated_at: new Date().toISOString() });

      // Skip if hasn't moved more than ~50m (0.0005 deg ≈ 55m)
      if (lastSentLat !== null) {
        const dlat = Math.abs(latitude - lastSentLat);
        const dlng = Math.abs(longitude - lastSentLng);
        if (dlat < 0.0005 && dlng < 0.0005) {
          console.log('[MAP] ⏭️ Not moved enough, skipping send');
          return;
        }
      }
      lastSentLat = latitude;
      lastSentLng = longitude;

      // Reverse geocode for city name (cached per location)
      let location_name = '';
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        location_name = data?.address?.city || data?.address?.town || data?.address?.village || data?.address?.county || '';
      } catch {}

      if (myProfile?.id) base44.entities.UserProfile.update(myProfile.id, { share_location: true }).catch(() => {});
      base44.functions.invoke('updateUserLocation', { latitude, longitude, location_name })
        .then(() => console.log('[MAP] ✅ Location saved:', latitude, longitude, '|', location_name || city))
        .catch(e => console.error('[MAP] ❌ Failed to send location:', e));
    };

    const onError = (err) => {
      setGpsStatus(err.code === 1 ? 'denied' : 'error');
      setGpsError(err.code === 1 ? 'Location permission is blocked' : err.message);
      console.warn('[MAP] watchPosition error:', err.code, err.message);
    };

    // Watch position — fires immediately + on each GPS update
    watchIdRef.current = navigator.geolocation?.watchPosition(
      sendLocation,
      onError,
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );

    // Also force-send every 20s to keep marker fresh even if user is stationary
    locationIntervalRef.current = setInterval(() => {
      navigator.geolocation?.getCurrentPosition(
        (pos) => { lastSentLat = null; lastSentLng = null; sendLocation(pos); }, // force send even if not moved
        onError,
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }, 20000);

    return () => {
      if (watchIdRef.current !== null) { navigator.geolocation?.clearWatch(watchIdRef.current); watchIdRef.current = null; }
      if (locationIntervalRef.current) { clearInterval(locationIntervalRef.current); locationIntervalRef.current = null; }
    };
  }, [me?.id, locationSharing]);

  const defaultCenter = [-73.9855, 40.758];

  const makeTowerBox = ([lng, lat], width, depth, props = {}) => {
    const lngStep = width / 2;
    const latStep = depth / 2;
    return {
      type: 'Feature',
      properties: props,
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [lng - lngStep, lat - latStep],
          [lng + lngStep, lat - latStep],
          [lng + lngStep, lat + latStep],
          [lng - lngStep, lat + latStep],
          [lng - lngStep, lat - latStep],
        ]],
      },
    };
  };

  const makeTowerPoint = ([lng, lat], props = {}) => ({
    type: 'Feature',
    properties: props,
    geometry: { type: 'Point', coordinates: [lng, lat] },
  });

  const addSpiceyLandmarkTower = (m, lightTheme) => {
    if (!m.getSource('spicey-landmark-tower')) {
      const towerCenter = [-73.9855, 40.75815];
      m.addSource('spicey-landmark-tower', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            makeTowerBox(towerCenter, 0.00108, 0.00082, {
              base: 0,
              height: 170,
              color: lightTheme ? '#ff7a1a' : '#161018',
              glow: lightTheme ? '#ff8a00' : '#ff6b00',
            }),
            makeTowerBox(towerCenter, 0.00078, 0.0006, {
              base: 160,
              height: 270,
              color: lightTheme ? '#ff2d8e' : '#26101f',
              glow: '#ff2d8e',
            }),
            makeTowerBox(towerCenter, 0.00052, 0.00042, {
              base: 255,
              height: 350,
              color: lightTheme ? '#a020f0' : '#371052',
              glow: '#ff4fd8',
            }),
            makeTowerBox(towerCenter, 0.0002, 0.00018, {
              base: 345,
              height: 470,
              color: lightTheme ? '#ffffff' : '#ff6adf',
              glow: '#ff4fd8',
            }),
          ],
        },
      });
    }

    if (!m.getSource('spicey-landmark-glow')) {
      m.addSource('spicey-landmark-glow', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            makeTowerPoint([-73.9855, 40.75815], { size: 46 }),
            makeTowerPoint([-73.9855, 40.75815], { size: 18 }),
          ],
        },
      });
    }

    if (!m.getLayer('spicey-landmark-ground-glow')) {
      m.addLayer({
        id: 'spicey-landmark-ground-glow',
        source: 'spicey-landmark-glow',
        type: 'circle',
        minzoom: 11,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 11, 22, 15, 54, 18, 96],
          'circle-color': lightTheme ? '#ff7a1a' : '#ff2d8e',
          'circle-opacity': ['interpolate', ['linear'], ['zoom'], 11, 0.1, 15, 0.32, 18, 0.46],
          'circle-blur': 0.78,
        },
      });
    }

    if (!m.getLayer('spicey-landmark-tower-fill')) {
      m.addLayer({
        id: 'spicey-landmark-tower-fill',
        source: 'spicey-landmark-tower',
        type: 'fill-extrusion',
        minzoom: 11,
        paint: {
          'fill-extrusion-color': ['get', 'color'],
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': ['get', 'base'],
          'fill-extrusion-opacity': lightTheme ? 0.94 : 0.98,
          'fill-extrusion-vertical-gradient': true,
        },
      });
      try { m.setPaintProperty('spicey-landmark-tower-fill', 'fill-extrusion-emissive-strength', lightTheme ? 0.55 : 1); } catch {}
      try { m.setPaintProperty('spicey-landmark-tower-fill', 'fill-extrusion-flood-light-color', '#ff2d8e'); } catch {}
      try { m.setPaintProperty('spicey-landmark-tower-fill', 'fill-extrusion-flood-light-intensity', 0.92); } catch {}
    }

    if (!m.getLayer('spicey-landmark-edge-glow')) {
      m.addLayer({
        id: 'spicey-landmark-edge-glow',
        source: 'spicey-landmark-tower',
        type: 'line',
        minzoom: 11,
        paint: {
          'line-color': ['get', 'glow'],
          'line-width': ['interpolate', ['linear'], ['zoom'], 11, 2.2, 15, 5.2, 18, 8],
          'line-opacity': lightTheme ? 0.65 : 0.9,
          'line-blur': 1.35,
        },
      });
    }
  };

  const restoreSpiceyMapVisuals = (delay = 250) => {
    setTimeout(() => {
      const m = mapRef.current;
      if (!m) return;
      try { addCustomLayers(m); } catch {}
      try { addSpiceyLandmarkTower(m, getIsLightMapTheme()); } catch {}
      try {
        m.resize();
        if (m.getPitch() < 50 && m.getZoom() > 10) m.easeTo({ pitch: 68, duration: 250 });
      } catch {}
    }, delay);
  };

  // ── Init Mapbox ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;
    if (!MAPBOX_TOKEN) return;

    const startLight = getIsLightMapTheme();
    setIsLight(startLight);

    let m;
    try {
      m = new mapboxgl.Map({
        container: mapContainer.current,
        style: startLight ? SPICEY_LIGHT_MAP_STYLE : SPICEY_DARK_MAP_STYLE,
        center: defaultCenter,
        zoom: 15.15,
        pitch: 68,
        bearing: -31,
        antialias: true,
        interactive: true,
        dragPan: true,
        dragRotate: true,
        touchZoomRotate: true,
        scrollZoom: true,
      });
    } catch (error) {
      console.warn('[MAP] Mapbox init failed:', error);
      setMapError(error?.message || 'Map could not load');
      return;
    }

    mapRef.current = m;
    mapStyleModeRef.current = startLight ? 'light' : 'dark';
    if (typeof window !== 'undefined') window.__spiceyMap = m;
    try {
      m.dragPan.enable();
      m.dragRotate.enable();
      m.touchZoomRotate.enable();
      m.scrollZoom.enable();
      m.doubleClickZoom.enable();
    } catch {}

    const readyTimer = window.setTimeout(() => {
      setMapError('Map is taking too long to load');
    }, 5000);

    m.on('load', () => {
      window.clearTimeout(readyTimer);
      setMapError('');
      const initialWaterFill = '#38aee8';
      const initialWaterOpacity = 0.68;

      // ── Light mode water / oceans / seas / lakes / rivers ─────────────────────
      try {
        m.addLayer({
          id: 'spicey-water-fill',
          source: 'composite',
          'source-layer': 'water',
          type: 'fill',
          paint: {
            'fill-color': initialWaterFill,
            'fill-opacity': initialWaterOpacity,
            'fill-outline-color': '#75d7ff',
          },
        });
      } catch {
        try {
          m.addLayer({
            id: 'spicey-water-fill',
            source: 'composite',
            'source-layer': 'water',
            type: 'fill',
            paint: { 'fill-color': initialWaterFill, 'fill-opacity': initialWaterOpacity, 'fill-outline-color': '#75d7ff' },
          });
        } catch {}
      }

      // ── 3D buildings — neon-dark, visible from map open ───────────────────────
      try {
        m.addLayer({
          id: '3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 11,
          paint: {
            'fill-extrusion-color': [
              'interpolate', ['linear'], ['zoom'],
              11, startLight ? '#ffe4f5' : '#2b0a36',
              13, startLight ? '#ffb25f' : '#6d1a7f',
              15, startLight ? '#ff3fa6' : '#c026d3',
              17, startLight ? '#a020f0' : '#ff6b00',
            ],
            'fill-extrusion-height': ['*', ['coalesce', ['get', 'height'], 22], 1.95],
            'fill-extrusion-base': ['coalesce', ['get', 'min_height'], 0],
            'fill-extrusion-opacity': startLight ? 0.96 : 0.96,
            'fill-extrusion-vertical-gradient': true,
          },
        });
        try { m.setPaintProperty('3d-buildings', 'fill-extrusion-emissive-strength', startLight ? 0.28 : 0.62); } catch {}
        try { m.setPaintProperty('3d-buildings', 'fill-extrusion-flood-light-color', startLight ? '#ff6b00' : '#ff2e9d'); } catch {}
        try { m.setPaintProperty('3d-buildings', 'fill-extrusion-flood-light-intensity', startLight ? 0.58 : 0.72); } catch {}
        try { m.setPaintProperty('3d-buildings', 'fill-extrusion-ambient-occlusion-intensity', 0.55); } catch {}
      } catch {}

      addSpiceyLandmarkTower(m, startLight);

      try {
        m.addLayer({
          id: 'spicey-building-edge-glow',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'line',
          minzoom: 11,
          paint: {
            'line-color': [
              'interpolate', ['linear'], ['zoom'],
              11, '#7c2cff',
              14, '#ff4fd8',
              16, '#ff8a00',
            ],
            'line-width': ['interpolate', ['linear'], ['zoom'], 11, 1.2, 14, 2.6, 16, 4.2],
            'line-opacity': ['interpolate', ['linear'], ['zoom'], 11, 0.42, 14, 0.68, 16, 0.86],
            'line-blur': ['interpolate', ['linear'], ['zoom'], 11, 0.35, 16, 0.85],
          },
        });
      } catch {}

      try {
        m.addLayer({
          id: 'spicey-building-edge',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'line',
          minzoom: 12,
          paint: {
            'line-color': [
              'interpolate', ['linear'], ['zoom'],
              12, '#d8b4fe',
              14, '#ff9de8',
              16, '#ffd0a3',
            ],
            'line-width': ['interpolate', ['linear'], ['zoom'], 12, 0.85, 15, 1.65, 17, 2.3],
            'line-opacity': ['interpolate', ['linear'], ['zoom'], 12, 0.58, 15, 0.82, 17, 0.94],
            'line-blur': 0.05,
          },
        });
      } catch {}

      // ── Spicey road network — light mode with vibrant colors ──────────────────
      // Orange on highways, pink on primary, purple on secondary/streets
      try {
        if (m.getSource('composite')) {
          // Motorways — smooth flowing orange
          m.addLayer({
            id: 'spicey-road-motorway',
            source: 'composite',
            'source-layer': 'road',
            filter: ['in', 'class', 'motorway', 'trunk'],
            type: 'line',
            minzoom: 8,
            paint: {
              'line-color': '#FF8C00',
              'line-width': ['interpolate', ['linear'], ['zoom'], 8, 2, 14, 5, 18, 9],
              'line-opacity': 0.95,
            },
          });

          // Primary roads — smooth flowing pink
          m.addLayer({
            id: 'spicey-road-primary',
            source: 'composite',
            'source-layer': 'road',
            filter: ['in', 'class', 'primary'],
            type: 'line',
            minzoom: 10,
            paint: {
              'line-color': '#FF1493',
              'line-width': ['interpolate', ['linear'], ['zoom'], 10, 1.5, 14, 4, 18, 7],
              'line-opacity': 0.9,
            },
          });

          // Secondary roads — smooth flowing purple
          m.addLayer({
            id: 'spicey-road-secondary',
            source: 'composite',
            'source-layer': 'road',
            filter: ['in', 'class', 'secondary', 'tertiary'],
            type: 'line',
            minzoom: 11,
            paint: {
              'line-color': '#BA55D3',
              'line-width': ['interpolate', ['linear'], ['zoom'], 11, 1.2, 14, 3, 18, 6],
              'line-opacity': 0.85,
            },
          });

          // Streets — smooth flowing violet
          m.addLayer({
            id: 'spicey-road-street',
            source: 'composite',
            'source-layer': 'road',
            filter: ['in', 'class', 'street', 'street_limited'],
            type: 'line',
            minzoom: 12,
            paint: {
              'line-color': '#DA70D6',
              'line-width': ['interpolate', ['linear'], ['zoom'], 12, 0.8, 15, 2, 17, 4],
              'line-opacity': 0.8,
            },
          });


        }
      } catch (e) { console.warn('Spicey roads:', e); }

      addCustomLayers(m);
      setTimeout(() => {
        try {
          m.resize();
          m.easeTo({ center: defaultCenter, zoom: 15.4, pitch: 68, bearing: -31, duration: 0 });
        } catch {}
      }, 250);
      setMapReady(true);
    });

    m.on('error', (event) => {
      console.warn('[MAP] Mapbox error:', event?.error || event);
      setMapError(event?.error?.message || 'Mapbox could not load the map');
    });

    // Keep the map in a strong 3D angle while users zoom around.
    m.on('zoomend', () => {
      const z = m.getZoom();
      const pitch = z < 5 ? 0 : Math.max(56, Math.min(70, 80 - z * 0.75));
      m.easeTo({ pitch, duration: 400 });
    });

    // Store addCustomLayers on mapRef for reuse
    mapRef.current.addCustomLayers = addCustomLayers;
    addCustomLayers(m);

    return () => {
      window.clearTimeout(readyTimer);
      Object.values(markersRef.current).forEach(safeRemoveMarker);
      markersRef.current = {};
      previewMarkersRef.current.forEach(safeRemoveMarker);
      previewMarkersRef.current = [];
      cityMarkersRef.current.forEach(safeRemoveMarker);
      cityMarkersRef.current = [];
      try { m.remove(); } catch {}
      mapRef.current = null;
    };
  }, []);

  // Fly to my location once loaded
  useEffect(() => {
    if (!mapRef.current || !myProfile?.latitude || !mapReady) return;
    mapRef.current.flyTo({ center: [myProfile.longitude, myProfile.latitude], zoom: 14, pitch: 50, speed: 1.2, curve: 1.4 });
  }, [myProfile?.latitude, mapReady]);

  const others = profiles.filter(p => p.user_id !== me?.id);
  const getUserState = (p) => {
    if (userStates[p.user_id] === 'live') return 'live';
    if (userStates[p.user_id] === 'story') return 'story';
    if (vipUsers[p.user_id]) return 'vip';
    return 'online';
  };

  const visible = useMemo(() => {
    if (activeFilter === 'live') return others.filter(p => userStates[p.user_id] === 'live');
    if (activeFilter === 'stories') return others.filter(p => userStates[p.user_id] === 'story');
    if (activeFilter === 'nearby' && myProfile?.latitude) {
      return others.filter(p => parseFloat(getDistance(myProfile.latitude, myProfile.longitude, p.latitude, p.longitude)) < 5);
    }
    return others;
  }, [others, activeFilter, userStates, myProfile]);

  const stats = useMemo(() => ({
    active: others.length,
    live: others.filter(p => userStates[p.user_id] === 'live').length,
    stories: others.filter(p => userStates[p.user_id] === 'story').length,
  }), [others, userStates]);

  // ── Sync user markers ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    const currentIds = new Set();
    const myAvatarUrl = getProfileAvatarUrl(myProfile || {}, me || {});
    const myMapProfile = currentLocation
      ? { ...(myProfile || {}), avatar_url: myAvatarUrl, latitude: currentLocation.latitude, longitude: currentLocation.longitude, location_updated_at: currentLocation.location_updated_at }
      : (myProfile ? { ...myProfile, avatar_url: myAvatarUrl } : null);

    if (myMapProfile?.latitude && myMapProfile?.longitude && locationSharing) {
      const id = '__me__';
      currentIds.add(id);
      if (markersRef.current[id]?.getElement?.()?.dataset?.avatarSrc !== (myAvatarUrl || markersRef.current[id]?.getElement?.()?.dataset?.avatarSrc)) {
        safeRemoveMarker(markersRef.current[id]);
        delete markersRef.current[id];
      }
      if (!markersRef.current[id]) {
        const el = buildAvatarEl(myMapProfile, { isMe: true, fallbackUser: me });
        const mk = new mapboxgl.Marker({ element: el, anchor: 'bottom', rotationAlignment: 'viewport', pitchAlignment: 'viewport' })
          .setLngLat([myMapProfile.longitude, myMapProfile.latitude])
          .addTo(mapRef.current);
        el.addEventListener('click', () => setSelected({ ...myMapProfile, _isMe: true }));
        markersRef.current[id] = mk;
      } else {
        markersRef.current[id].setLngLat([myMapProfile.longitude, myMapProfile.latitude]);
      }
    }

    visible.slice(0, 80).forEach(p => {
      const id = p.user_id || p.id;
      currentIds.add(id);
      const avatarUrl = getProfileAvatarUrl(p);
      if (markersRef.current[id]?.getElement?.()?.dataset?.avatarSrc !== (avatarUrl || markersRef.current[id]?.getElement?.()?.dataset?.avatarSrc)) {
        safeRemoveMarker(markersRef.current[id]);
        delete markersRef.current[id];
      }
      if (!markersRef.current[id]) {
        const state = getUserState(p);
        const el = buildAvatarEl(p, { isMe: false, state });
        const mk = new mapboxgl.Marker({ element: el, anchor: 'bottom', rotationAlignment: 'viewport', pitchAlignment: 'viewport' })
          .setLngLat([p.longitude, p.latitude])
          .addTo(mapRef.current);
        el.addEventListener('click', (e) => { e.stopPropagation(); setSelected(p); });
        markersRef.current[id] = mk;
      } else {
        markersRef.current[id].setLngLat([p.longitude, p.latitude]);
      }
    });

    Object.keys(markersRef.current).forEach(id => {
      if (!currentIds.has(id)) { safeRemoveMarker(markersRef.current[id]); delete markersRef.current[id]; }
    });
  }, [visible, myProfile, currentLocation, locationSharing, mapReady]);

  // Activity waves are disabled so user avatars stay stable on the map.

  // ── Update visible cities when map moves ──────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    const updateVisible = () => {
      const map = mapRef.current;
      if (!map) return;
      const zoom = map.getZoom();
      const bounds = map.getBounds();

      // Tier-based zoom thresholds:
      // tier 1 (major world cities): show from zoom 3+
      // tier 2 (regional/Balkan cities): show from zoom 5+
      // tier 3 (small local cities): show from zoom 6+
      const seedInView = SEED_CITY_LOCATIONS.filter(city => {
        const cityTier = city.tier || 1;
        const minZoom = cityTier === 1 ? 3 : cityTier === 2 ? 5 : 6;
        if (zoom < minZoom) return false;
        return bounds.contains([city.lng, city.lat]);
      }).slice(0, 36);

      const seedNames = new Set(SEED_CITY_LOCATIONS.map(c => c.name.toLowerCase()));

      // Enrich seed cities with real post data
      const dynamicByName = {};
      dynamicCities.forEach(d => { dynamicByName[d.name.toLowerCase()] = d; });

      const enrichedSeed = seedInView.map(city => {
        const dyn = dynamicByName[city.name.toLowerCase()];
        return {
          ...city,
          hasRealContent: !!dyn && dyn.postCount > 0,
          realPostCount: dyn?.postCount || 0,
          sampleImage: dyn?.sampleImage || null,
        };
      });

      // Add dynamic cities that are NOT in the seed list but have geocoded coords
      const extraDynamic = dynamicCities
        .filter(dc => {
          if (zoom < 5) return false;
          if (seedNames.has(dc.name.toLowerCase())) return false; // already in seed
          if (!dc.lat || !dc.lng) return false; // not yet geocoded
          return bounds.contains([dc.lng, dc.lat]);
        })
        .map(dc => ({
          name: dc.name,
          lat: dc.lat,
          lng: dc.lng,
          tier: 2,
          hasRealContent: true,
          realPostCount: dc.postCount,
          sampleImage: dc.sampleImage,
        }));

      setVisibleCities([...enrichedSeed, ...extraDynamic]);
    };

    updateVisible();
    mapRef.current.on('moveend', updateVisible);
    mapRef.current.on('zoomend', updateVisible);
    return () => {
      if (mapRef.current) {
        mapRef.current.off('moveend', updateVisible);
        mapRef.current.off('zoomend', updateVisible);
      }
    };
  }, [mapReady, dynamicCities]);

  // ── City post counts — real counts when available, deterministic fallback otherwise ──
  const cityPostCounts = useMemo(() => {
    const counts = {};
    visibleCities.forEach(city => {
      if (city.realPostCount > 0) {
        counts[city.name] = city.realPostCount;
      } else {
        // Deterministic non-zero fallback so badge always shows sample content
        let h = 0;
        for (let i = 0; i < city.name.length; i++) h = (Math.imul(31, h) + city.name.charCodeAt(i)) | 0;
        counts[city.name] = (Math.abs(h) % 980) + 20;
      }
    });
    return counts;
  }, [visibleCities]);

  // ── City markers ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    cityMarkersRef.current.forEach(safeRemoveMarker);
    cityMarkersRef.current = [];
    visibleCities.forEach(city => {
      const el = buildCityEl(city.name, cityPostCounts[city.name] || 0, {
        hasRealContent: city.hasRealContent || false,
        sampleImage: city.sampleImage || null,
      });
      const mk = new mapboxgl.Marker({ element: el, anchor: 'bottom', rotationAlignment: 'viewport', pitchAlignment: 'viewport' })
        .setLngLat([city.lng, city.lat])
        .addTo(mapRef.current);
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const cityWithPreview = {
          ...city,
          image: city.sampleImage || getCityCoverPhoto(city.name),
          previewItems: makeCityPreviewItems({ ...city, image: city.sampleImage || getCityCoverPhoto(city.name) }),
        };
        setSelectedCity(cityWithPreview);
        setSelected(null);
        setShowPostsModal(true);
        flyToPoint(city.lng, city.lat, 12.8);
      });
      cityMarkersRef.current.push(mk);
    });
  }, [visibleCities, cityPostCounts, mapReady]);

  const handleChat = async (profile) => {
    if (profile?._preview) {
      setShowPostsModal(true);
      return;
    }
    try { await base44.functions.invoke('getOrCreateChat', { otherUserId: profile.user_id }); } catch {}
    navigate('/messages', { state: { directUserId: profile.user_id, directUserName: profile.full_name || profile.username, directUserUsername: profile.username, directUserAvatar: profile.avatar_url } });
  };

  const flyToPoint = (lng, lat, zoom = 13.7) => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({ center: [lng, lat], zoom: Math.max(zoom, 15), pitch: 68, bearing: -31, speed: 1.05, curve: 1.35 });
  };

  const openPreviewPin = (pin) => {
    const username = pin.name.replace('@', '');
    setSelectedCity(null);
    setSelected({
      user_id: `preview-${username}`,
      username,
      full_name: username.split('.').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' '),
      avatar_url: pin.image,
      latitude: pin.lat,
      longitude: pin.lng,
      location_updated_at: new Date().toISOString(),
      _preview: true,
    });
    flyToPoint(pin.lng, pin.lat, 14.4);
  };

  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    previewMarkersRef.current.forEach(safeRemoveMarker);
    previewMarkersRef.current = MAP_PREVIEW_PINS.map(pin => {
      const username = pin.name.replace('@', '');
      const profile = {
        user_id: `preview-${username}`,
        username,
        full_name: username,
        avatar_url: pin.image,
        latitude: pin.lat,
        longitude: pin.lng,
      };
      const el = buildAvatarEl(profile, { state: pin.live ? 'live' : 'story' });
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        openPreviewPin(pin);
      });
      const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom', rotationAlignment: 'viewport', pitchAlignment: 'viewport' })
        .setLngLat([pin.lng, pin.lat])
        .addTo(mapRef.current);
      return marker;
    });

    return () => {
      previewMarkersRef.current.forEach(safeRemoveMarker);
      previewMarkersRef.current = [];
    };
  }, [mapReady]);

  const openTrendingCity = (city) => {
    setSelected(null);
    setSelectedCity({
      name: city.name,
      lat: city.lat,
      lng: city.lng,
      postCount: parseInt(city.live, 10) || 0,
      sampleImage: city.image,
      previewItems: makeCityPreviewItems(city),
      hasRealContent: false,
    });
    setShowPostsModal(true);
    flyToPoint(city.lng, city.lat, city.name === 'London' ? 11.8 : 12.6);
  };

  const centerMap = () => {
    if (currentLocation?.latitude && currentLocation?.longitude) {
      flyToPoint(currentLocation.longitude, currentLocation.latitude, 14.8);
      setLocationPanelOpen(true);
      return;
    }
    if (myProfile?.latitude && myProfile?.longitude) {
      flyToPoint(myProfile.longitude, myProfile.latitude, 14.5);
      setLocationPanelOpen(true);
      return;
    }
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCurrentLocation({ latitude, longitude, location_updated_at: new Date().toISOString() });
        flyToPoint(longitude, latitude, 14.8);
        setLocationPanelOpen(true);
      },
      () => {
        flyToPoint(defaultCenter[0], defaultCenter[1], 13.5);
        setLocationPanelOpen(true);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const toggleMapLayers = () => {
    if (!mapRef.current) return;
    const next = mapViewMode === 'neon' ? 'satellite' : 'neon';
    setMapViewMode(next);
    const neonIsLight = getIsLightMapTheme();
    const neonStyle = neonIsLight ? SPICEY_LIGHT_MAP_STYLE : SPICEY_DARK_MAP_STYLE;
    mapStyleModeRef.current = next === 'satellite' ? 'satellite' : (neonIsLight ? 'light' : 'dark');
    mapRef.current.setStyle(next === 'satellite' ? 'mapbox://styles/mapbox/satellite-streets-v12' : neonStyle);
    mapRef.current.once('style.load', () => restoreSpiceyMapVisuals(250));
  };

  const zoomWorld = () => {
    if (!mapRef.current) return;
    setSelected(null);
    setSelectedCity(null);
    const map = mapRef.current;
    setMapViewMode('neon');
    mapStyleModeRef.current = 'dark';
    map.setStyle(SPICEY_DARK_MAP_STYLE);
    map.once('style.load', () => {
      try { map.setFog(null); } catch {}
      try { addCustomLayers(map); } catch {}
      map.flyTo({
        center: [-74.08, 40.73],
        zoom: 7.35,
        pitch: 34,
        bearing: -18,
        speed: 0.72,
        curve: 1.2,
      });
    });
  };

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const users = [...MAP_PREVIEW_PINS, ...visible]
      .filter(item => (item.name || item.username || item.full_name || '').toLowerCase().includes(q))
      .slice(0, 4)
      .map(item => ({ type: 'user', label: item.name || `@${item.username}`, sub: item.place || item.location || 'Creator', data: item }));
    const cityNames = new Set();
    const cities = [...TRENDING_CITIES, ...visibleCities, ...SEED_CITY_LOCATIONS]
      .filter(city => city?.name && city.name.toLowerCase().includes(q))
      .filter(city => {
        const key = city.name.toLowerCase();
        if (cityNames.has(key)) return false;
        cityNames.add(key);
        return true;
      })
      .slice(0, 6)
      .map(city => ({ type: 'city', label: city.name, sub: city.live || `${city.postCount || city.realPostCount || 243} live`, data: city }));
    return [...users, ...cities].slice(0, 8);
  }, [searchQuery, visible, visibleCities]);

  const runSearchResult = (result) => {
    if (!result) return;
    setSearchOpen(false);
    setSearchQuery('');
    if (result.type === 'user') {
      if (result.data.name) openPreviewPin(result.data);
      else {
        setSelected(result.data);
        if (result.data.longitude && result.data.latitude) flyToPoint(result.data.longitude, result.data.latitude, 14.4);
      }
      return;
    }
    const city = result.data;
    const cityData = {
      ...city,
      image: city.image || city.sampleImage || getCityCoverPhoto(city.name),
      live: city.live || `${city.postCount || city.realPostCount || 243} live`,
    };
    openTrendingCity(cityData);
  };

  const searchMap = async () => {
    if (!searchOpen) {
      setSearchOpen(true);
      return;
    }
    const first = searchResults[0];
    if (first) {
      runSearchResult(first);
      return;
    }
    const query = searchQuery.trim();
    if (!query) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`, { headers: { 'Accept-Language': 'en' } });
      const data = await res.json();
      if (data?.[0]) flyToPoint(parseFloat(data[0].lon), parseFloat(data[0].lat), 12.7);
    } catch {}
  };

  const ui = {
    pageBg: isLight ? '#ffffff' : '#030105',
    canvasFilter: 'none',
    topShade: isLight
      ? 'linear-gradient(180deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.08) 22%, rgba(255,255,255,0.02) 66%, rgba(255,255,255,0.70) 100%)'
      : 'radial-gradient(circle at 50% 26%, transparent 0%, rgba(0,0,0,0.04) 44%, rgba(0,0,0,0.12) 74%, rgba(0,0,0,0.30) 100%), linear-gradient(180deg, rgba(0,0,0,0.16) 0%, transparent 22%, transparent 72%, rgba(0,0,0,0.42) 100%)',
    panelBg: isLight ? 'radial-gradient(circle at 18% 0%, rgba(255,255,255,0.62), transparent 34%), linear-gradient(135deg,#ff8a00 0%, #ff3b7a 42%, #b62cff 100%)' : 'rgba(16,17,26,0.82)',
    deepPanelBg: isLight ? 'radial-gradient(circle at 20% 0%, rgba(255,255,255,0.48), transparent 36%), linear-gradient(145deg,#ff7a00 0%, #ff2e9d 48%, #7c3cff 100%)' : 'rgba(8,5,14,0.94)',
    cardBg: isLight ? 'radial-gradient(circle at 14% 0%, rgba(255,255,255,0.40), transparent 30%), linear-gradient(145deg, rgba(32,8,52,0.92) 0%, rgba(118,35,230,0.90) 34%, rgba(255,46,157,0.90) 70%, rgba(255,122,0,0.88) 100%)' : 'linear-gradient(180deg, rgba(20,8,18,0.90), rgba(7,3,11,0.92))',
    liveBg: isLight ? 'radial-gradient(circle at 20% 5%, rgba(255,255,255,0.50), transparent 32%), linear-gradient(135deg, rgba(255,138,0,0.98) 0%, rgba(255,68,105,0.94) 58%, rgba(255,46,157,0.88) 100%)' : 'rgba(13,9,20,0.80)',
    controlBg: isLight ? 'radial-gradient(circle at 28% 18%, rgba(255,255,255,0.58), transparent 28%), linear-gradient(145deg,#ff9b18 0%, #ff3f73 50%, #ff1493 100%)' : 'rgba(45,10,15,0.74)',
    controlBgPurple: isLight ? 'radial-gradient(circle at 28% 18%, rgba(255,255,255,0.50), transparent 30%), linear-gradient(145deg,#5b21b6 0%, #b026d3 48%, #ff2e9d 100%)' : 'rgba(45,8,48,0.74)',
    rackBg: isLight ? 'radial-gradient(circle at 30% 0%, rgba(255,255,255,0.36), transparent 30%), linear-gradient(180deg, rgba(42,10,64,0.92) 0%, rgba(118,35,230,0.88) 42%, rgba(255,46,157,0.86) 100%)' : 'rgba(12,10,18,0.72)',
    text: isLight ? '#ffffff' : '#fff',
    muted: isLight ? 'rgba(255,255,255,0.86)' : 'rgba(255,255,255,0.55)',
    label: isLight ? 'rgba(18,8,27,0.74)' : 'rgba(255,255,255,0.82)',
    border: isLight ? '1.4px solid rgba(255,255,255,0.62)' : '1px solid rgba(255,46,157,0.24)',
    shadow: isLight ? '0 16px 34px rgba(88,28,135,0.20), 0 9px 22px rgba(255,46,157,0.22), inset 0 1.4px 0 rgba(255,255,255,0.42), inset 0 -6px 16px rgba(55,0,80,0.18)' : '0 18px 36px rgba(0,0,0,0.62), 0 0 24px rgba(255,46,157,0.16)',
    button3d: isLight ? '0 14px 24px rgba(80,20,120,0.22), 0 5px 12px rgba(255,46,157,0.22), inset 0 1.5px 0 rgba(255,255,255,0.58), inset 0 -7px 14px rgba(70,0,90,0.22)' : '0 14px 24px rgba(0,0,0,0.48), inset 0 1px 0 rgba(255,255,255,0.08)',
    card3d: isLight ? '0 22px 46px rgba(80,20,120,0.24), 0 10px 24px rgba(255,46,157,0.22), inset 0 1.5px 0 rgba(255,255,255,0.44), inset 0 -12px 22px rgba(43,0,63,0.20)' : '0 18px 36px rgba(0,0,0,0.62), 0 0 24px rgba(255,46,157,0.16)',
  };

  return (
    <div className="spicey-map-page" style={{ position: 'fixed', inset: 0, width: '100vw', height: '100dvh', background: ui.pageBg, zIndex: 0, overflow: 'hidden', isolation: 'isolate' }}>
      <style>{`
        .spicey-map-page, .spicey-map-shell { border: 0 !important; outline: 0 !important; }
        .spicey-map-shell, .spicey-map-shell .mapboxgl-map,
        .spicey-map-shell .mapboxgl-canvas-container,
        .spicey-map-shell .mapboxgl-canvas { width: 100% !important; height: 100% !important; }
        .spicey-map-shell .mapboxgl-canvas { filter: ${ui.canvasFilter}; }
        .spicey-map-shell .mapboxgl-map { background: #030108; border: 0 !important; }
        .spicey-map-shell .mapboxgl-canvas-container { background: #030108; }
        .spicey-map-scroll::-webkit-scrollbar { display: none; }
        @media (max-width: 600px) {
          .spicey-map-logo-row { height: 44px !important; }
          .spicey-map-logo-word { font-size: 16px !important; }
          .spicey-map-search-row { grid-template-columns: minmax(0, 1fr) 34px 34px !important; gap: 5px !important; }
          .spicey-map-search-pill { height: 34px !important; border-radius: 17px !important; padding: 0 10px !important; gap: 6px !important; font-size: 10px !important; }
          .spicey-map-search-pill svg { width: 14px !important; height: 14px !important; }
          .spicey-map-action { width: 34px !important; height: 34px !important; border-radius: 11px !important; }
          .spicey-map-action svg { width: 15px !important; height: 15px !important; }
          .spicey-map-live-card { width: 126px !important; min-height: 44px !important; margin-top: 7px !important; border-radius: 12px !important; padding: 0 8px !important; grid-template-columns: 20px 1fr 11px !important; gap: 4px !important; }
          .spicey-map-live-card svg { width: 14px !important; height: 14px !important; }
          .spicey-map-live-card span { font-size: 9px !important; }
          .spicey-map-control-rack { right: 8px !important; top: 116px !important; width: 36px !important; padding: 3px !important; border-radius: 18px !important; }
          .spicey-map-control-rack button { width: 28px !important; height: 28px !important; margin-bottom: 3px !important; }
          .spicey-map-control-rack svg { width: 14px !important; height: 14px !important; }
          .spicey-map-trending { left: 10px !important; right: 10px !important; bottom: calc(72px + env(safe-area-inset-bottom)) !important; border-radius: 18px !important; padding: 10px !important; }
          .spicey-map-trending-head { margin-bottom: 8px !important; }
          .spicey-map-trending-title { font-size: 14px !important; gap: 6px !important; }
          .spicey-map-trending-title svg { width: 17px !important; height: 17px !important; }
          .spicey-map-trending-seeall { padding: 5px 7px !important; border-radius: 10px !important; font-size: 12px !important; }
          .spicey-map-trending-seeall svg { width: 14px !important; height: 14px !important; }
          .spicey-map-scroll { grid-auto-columns: 82px !important; gap: 6px !important; }
          .spicey-map-city-card { min-width: 82px !important; height: 94px !important; border-radius: 10px !important; }
          .spicey-map-city-copy { left: 8px !important; right: 6px !important; bottom: 8px !important; }
          .spicey-map-city-name { font-size: 13px !important; }
          .spicey-map-city-live { font-size: 10px !important; margin-top: 2px !important; }
        }
      `}</style>

      <div className="spicey-map-shell" style={{ position: 'absolute', inset: '-2px', overflow: 'hidden', background: '#030108' }}>
        <div ref={mapContainer} style={{ position: 'absolute', inset: 0, overflow: 'hidden' }} />
        {!MAPBOX_TOKEN && false && (
          <div style={{
            position: 'absolute',
            inset: 0,
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            background: 'radial-gradient(circle at 50% 35%, rgba(233,30,140,0.18), transparent 34%), #050208',
            color: 'white',
            textAlign: 'center',
          }}>
            <div style={{
              width: 'min(360px, 100%)',
              borderRadius: 28,
              padding: 24,
              border: '1px solid rgba(255,255,255,0.14)',
              background: 'rgba(255,255,255,0.06)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
            }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>📍</div>
              <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>Map key missing</h2>
              <p style={{ margin: '10px 0 0', color: 'rgba(255,255,255,0.62)', lineHeight: 1.5 }}>
                Add VITE_MAPBOX_TOKEN in Vercel Environment Variables, then redeploy.
              </p>
            </div>
          </div>
        )}
        {(!MAPBOX_TOKEN || !mapReady || mapError) && (
          <div style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            overflow: 'hidden',
            background: '#02030a url("/spicey-assets/neon-manhattan-map-v2.png") center center / cover no-repeat',
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg,rgba(0,0,0,.22) 0%,rgba(0,0,0,.03) 27%,rgba(0,0,0,.05) 72%,rgba(0,0,0,.32) 100%)',
            }} />
            {MAP_PREVIEW_PINS.map((pin) => (
              <button
                key={pin.name}
                type="button"
                onClick={() => setSelected(pin)}
                style={{
                  position: 'absolute',
                  left: pin.left,
                  top: pin.top,
                  width: 126,
                  border: 0,
                  padding: 0,
                  background: 'transparent',
                  transform: 'translate(-50%, -50%)',
                  cursor: 'pointer',
                  zIndex: 4,
                }}
              >
                <span style={{ position: 'relative', display: 'block', width: 62, height: 62, margin: '0 auto' }}>
                  <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', padding: 3, background: 'conic-gradient(from 20deg,#ff6a00,#ff2e9d,#7c3cff,#ff6a00)', boxShadow: '0 0 20px rgba(255,46,157,0.72), 0 10px 24px rgba(0,0,0,0.52)' }}>
                    <img src={pin.image} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0a0611' }} />
                  </span>
                  <span style={{ position: 'absolute', right: -4, bottom: -2, minWidth: pin.live ? 39 : 24, height: 22, padding: pin.live ? '0 7px' : 0, borderRadius: pin.live ? 6 : 11, display: 'grid', placeItems: 'center', color: '#fff', background: pin.live ? 'linear-gradient(135deg,#ff176f,#ff2e9d)' : 'linear-gradient(135deg,#7c3cff,#b22cff)', boxShadow: '0 0 12px rgba(255,46,157,.7)', fontSize: 11, fontWeight: 900 }}>
                    {pin.live ? 'LIVE' : pin.count}
                  </span>
                </span>
                <span style={{ display: 'block', marginTop: 7, padding: '7px 10px 8px', borderRadius: 12, color: '#fff', background: 'rgba(10,5,15,.91)', border: '1px solid rgba(255,46,157,.24)', boxShadow: '0 8px 22px rgba(0,0,0,.48)', backdropFilter: 'blur(10px)' }}>
                  <span style={{ display: 'block', fontSize: 11, lineHeight: 1.15, fontWeight: 900 }}>{pin.name}</span>
                  <span style={{ display: 'block', marginTop: 4, color: 'rgba(255,255,255,.58)', fontSize: 10, lineHeight: 1.15 }}>{pin.place}</span>
                </span>
              </button>
            ))}
            <div style={{ position: 'absolute', left: '50%', top: '58%', width: 62, height: 76, transform: 'translate(-50%,-50%)', zIndex: 3, filter: 'drop-shadow(0 0 18px rgba(255,74,0,.8))' }}>
              <div style={{ width: 58, height: 58, borderRadius: '50% 50% 50% 12px', transform: 'rotate(-45deg)', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg,#ff7a00 8%,#ff295f 58%,#c522ff)', border: '2px solid rgba(255,181,74,.9)' }}>
                <span style={{ color: '#fff', fontSize: 30, lineHeight: 1, fontWeight: 1000, fontStyle: 'italic', transform: 'rotate(45deg)', textShadow: '0 0 8px rgba(255,255,255,.8)' }}>S</span>
              </div>
              <div style={{ position: 'absolute', left: 22, bottom: 0, width: 14, height: 8, borderRadius: '50%', background: '#ff7a00', boxShadow: '0 0 15px 5px rgba(255,106,0,.7)' }} />
            </div>
          </div>
        )}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3,
          background: ui.topShade,
        }} />
        {['UPPER WEST SIDE', 'CENTRAL PARK', 'UPPER EAST SIDE', 'MIDTOWN MANHATTAN', 'SOHO', 'WILLIAMSBURG', 'BROOKLYN'].map((label, index) => {
          const positions = [
            { left: '45%', top: '25%' }, { left: '56%', top: '31%' }, { left: '74%', top: '29%' },
            { left: '47%', top: '49%' }, { left: '25%', top: '61%' }, { left: '79%', top: '75%' }, { left: '84%', top: '84%' },
          ];
          return (
            <div key={label} style={{
              position: 'absolute', ...positions[index], transform: 'translate(-50%, -50%)',
              color: ui.label, fontSize: 13, fontWeight: 900, letterSpacing: 0.4,
              textAlign: 'center', textShadow: isLight ? '0 2px 10px rgba(255,255,255,0.9)' : '0 2px 10px rgba(0,0,0,0.95)', pointerEvents: 'none',
            }}>{label}</div>
          );
        })}
      </div>

      <div style={{ position: 'relative', zIndex: 20, padding: 'max(8px, env(safe-area-inset-top)) 14px 0' }}>
        <div className="spicey-map-logo-row" style={{ height: 86, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'visible' }}>
          <div className="spicey-map-logo-word" aria-label="Spicey" style={{ position: 'relative', color: '#fff', fontSize: 'clamp(22px, 7vw, 31px)', fontWeight: 500, letterSpacing: '0.34em', lineHeight: 1, textIndent: '0.34em', textShadow: '-18px 0 15px rgba(255,106,0,0.78), 18px 0 15px rgba(255,46,157,0.82), 0 0 9px rgba(255,255,255,0.68)' }}>
            SPICEY
            <span style={{ position: 'absolute', left: '-18%', right: '-18%', top: '50%', height: 2, transform: 'translateY(-50%)', zIndex: -1, background: 'linear-gradient(90deg, transparent, #ff6a00 20%, #fff 50%, #ff2e9d 80%, transparent)', filter: 'blur(2px)', boxShadow: '0 0 15px rgba(255,45,157,0.76)' }} />
          </div>
        </div>

        <div className="spicey-map-search-row" style={{ display: 'grid', gridTemplateColumns: '1fr 54px 54px', gap: 10, alignItems: 'center', marginTop: 0 }}>
          <motion.div className="spicey-map-search-pill" whileTap={{ scale: 0.98 }} onClick={() => setSearchOpen(true)} style={{ height: 54, borderRadius: 27, background: 'rgba(15,16,24,0.92)', border: searchOpen ? '1.6px solid rgba(255,46,157,0.72)' : '1px solid rgba(255,255,255,0.16)', boxShadow: searchOpen ? '0 16px 30px rgba(255,46,157,0.28)' : 'inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 26px rgba(0,0,0,0.34)', display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', color: 'rgba(255,255,255,0.54)', fontSize: 14, fontWeight: 500, cursor: 'text', textAlign: 'left' }}>
            <Search onClick={(e) => { e.stopPropagation(); searchMap(); }} style={{ width: 20, height: 20, color: searchOpen ? '#ff2e9d' : ui.muted, cursor: 'pointer' }} />
            {searchOpen ? (
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') searchMap();
                  if (e.key === 'Escape') { setSearchOpen(false); setSearchQuery(''); }
                }}
                placeholder="Search user or city..."
                style={{ flex: 1, minWidth: 0, background: 'transparent', border: 0, outline: 'none', color: ui.text, fontSize: 13, fontWeight: 700 }}
              />
            ) : (
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Search city, creators, places...</span>
            )}
            {searchOpen && (
              <button onClick={(e) => { e.stopPropagation(); setSearchOpen(false); setSearchQuery(''); }} style={{ width: 26, height: 26, borderRadius: '50%', border: 0, background: 'rgba(255,255,255,0.08)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
                <X style={{ width: 15, height: 15, color: 'rgba(255,255,255,0.82)' }} />
              </button>
            )}
          </motion.div>
          <motion.button className="spicey-map-action" whileTap={{ scale: 0.94 }} onClick={() => setLocationPanelOpen(v => !v)} style={{ height: 54, width: 54, borderRadius: 20, display: 'grid', placeItems: 'center', background: 'rgba(33,9,14,0.88)', border: '1px solid rgba(255,82,24,0.66)', boxShadow: '0 12px 28px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.06)', color: '#ff5b2e' }}>
            <SlidersHorizontal style={{ width: 24, height: 24 }} />
          </motion.button>
          <motion.button className="spicey-map-action" whileTap={{ scale: 0.94 }} onClick={centerMap} style={{ height: 54, width: 54, borderRadius: 20, display: 'grid', placeItems: 'center', background: 'rgba(33,5,38,0.90)', border: '1px solid rgba(255,46,210,0.52)', boxShadow: '0 12px 28px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.06)', color: '#ff3be0' }}>
            <Crosshair style={{ width: 25, height: 25 }} />
          </motion.button>
        </div>

        <AnimatePresence>
          {locationPanelOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              style={{ position: 'absolute', right: 12, top: 80, zIndex: 60, width: 228, borderRadius: 20, padding: 12, background: ui.deepPanelBg, border: ui.border, boxShadow: ui.card3d, backdropFilter: 'blur(18px)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <div>
                  <div style={{ color: ui.text, fontSize: 14, fontWeight: 900 }}>Location status</div>
                  <div style={{ color: locationSharing ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.58)', fontSize: 12, fontWeight: 800, marginTop: 3 }}>
                    {!locationSharing ? 'Offline hidden' : gpsStatus === 'denied' ? 'GPS blocked' : gpsStatus === 'requesting' ? 'Finding GPS...' : gpsStatus === 'online' ? 'Live GPS on' : 'Online public'}
                  </div>
                </div>
                <button
                  onClick={toggleLocationSharing}
                  style={{ width: 54, height: 30, borderRadius: 15, border: 0, padding: 3, background: locationSharing ? 'linear-gradient(135deg,#ff6b00,#ff2e9d)' : 'rgba(255,255,255,0.14)', cursor: 'pointer' }}
                >
                  <span style={{ display: 'block', width: 24, height: 24, borderRadius: '50%', background: '#fff', transform: locationSharing ? 'translateX(24px)' : 'translateX(0)', transition: 'transform 160ms ease' }} />
                </button>
              </div>
              <button
                onClick={centerMap}
                  style={{ marginTop: 12, width: '100%', height: 38, borderRadius: 14, border: '1px solid rgba(255,106,0,0.38)', background: 'rgba(255,106,0,0.10)', color: ui.text, fontSize: 13, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, cursor: 'pointer' }}
              >
                <Crosshair style={{ width: 15, height: 15, color: '#fff' }} />
                Go to my location
              </button>
              <p style={{ margin: '10px 2px 0', color: 'rgba(255,255,255,0.45)', fontSize: 11, lineHeight: 1.35 }}>
                {gpsStatus === 'denied' ? 'Location is blocked in the browser. Allow location permission so your avatar can move in real time.' : (gpsError || 'Online shows your real position on the public map. Offline hides you from other users.')}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              style={{ position: 'absolute', left: 12, right: 12, top: 78, zIndex: 50, borderRadius: 18, padding: 7, background: ui.deepPanelBg, border: ui.border, boxShadow: ui.card3d, backdropFilter: 'blur(18px)' }}
            >
              {(searchResults.length ? searchResults : [{ type: 'hint', label: 'Type New York, Miami, London, @luna...', sub: 'Search users or cities' }]).map((result, index) => (
                <button
                  key={`${result.type}-${result.label}-${index}`}
                  onClick={() => result.type !== 'hint' && runSearchResult(result)}
                  style={{ width: '100%', height: 48, border: 0, borderRadius: 15, background: index === 0 && result.type !== 'hint' ? 'rgba(255,46,157,0.13)' : 'transparent', display: 'flex', alignItems: 'center', gap: 11, padding: '0 10px', textAlign: 'left', cursor: result.type === 'hint' ? 'default' : 'pointer' }}
                >
                  <div style={{ width: 34, height: 34, borderRadius: '50%', display: 'grid', placeItems: 'center', background: result.type === 'city' ? 'linear-gradient(135deg,#ff6b00,#ff2e9d)' : 'linear-gradient(135deg,#16b7ff,#9b5cff)', boxShadow: '0 0 13px rgba(255,46,157,0.35)' }}>
                    {result.type === 'city' ? <MapPin style={{ width: 17, height: 17, color: '#fff' }} /> : <User style={{ width: 16, height: 16, color: '#fff' }} />}
                  </div>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', color: ui.text, fontSize: 14, fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{result.label}</span>
                    <span style={{ display: 'block', color: ui.muted, fontSize: 12, fontWeight: 700, marginTop: 2 }}>{result.sub}</span>
                  </span>
                  {result.type !== 'hint' && <ChevronRight style={{ width: 17, height: 17, color: '#ff2e9d' }} />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button className="spicey-map-live-card" whileTap={{ scale: 0.98 }} onClick={() => setActiveFilter('live')} style={{ marginTop: 16, width: 174, minHeight: 68, borderRadius: 18, background: 'rgba(14,9,20,0.88)', border: '1px solid rgba(255,82,48,0.28)', boxShadow: '0 14px 32px rgba(0,0,0,0.42)', display: 'grid', gridTemplateColumns: '32px 1fr 15px', alignItems: 'center', gap: 7, padding: '0 13px', textAlign: 'left' }}>
          <Radio style={{ color: '#fff', width: 20, height: 20, filter: 'drop-shadow(0 0 9px rgba(255,255,255,0.55))' }} />
          <span>
            <span style={{ display: 'block', color: ui.text, fontSize: 12, fontWeight: 800 }}>Live Around You</span>
            <span style={{ display: 'block', color: 'rgba(255,255,255,0.82)', fontSize: 11, fontWeight: 900, marginTop: 2 }}>{formatNum(Math.max(stats.live, 243))} live now</span>
          </span>
          <ChevronRight style={{ color: 'rgba(255,255,255,0.56)', width: 15, height: 15 }} />
        </motion.button>

        <div className="spicey-map-control-rack" style={{ position: 'absolute', right: 14, top: 180, zIndex: 24, width: 52, padding: 5, borderRadius: 26, background: 'rgba(10,8,16,0.82)', border: '1px solid rgba(255,255,255,0.10)', boxShadow: '0 18px 38px rgba(0,0,0,0.52)', backdropFilter: 'blur(14px)' }}>
          {[
            { Icon: Layers, action: toggleMapLayers, active: mapViewMode === 'satellite' },
            { Icon: Navigation, action: centerMap, active: true },
            { Icon: Globe2, action: zoomWorld, active: false },
          ].map(({ Icon, action, active }, i) => (
            <motion.button key={i} whileTap={{ scale: 0.92 }} onClick={action} style={{ width: 42, height: 42, borderRadius: '50%', display: 'grid', placeItems: 'center', marginBottom: i === 2 ? 0 : 6, background: active ? 'linear-gradient(135deg,#5b22e8,#a42cff)' : 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.09)', color: i === 1 ? '#7f38ff' : '#fff', cursor: 'pointer', boxShadow: active ? '0 0 18px rgba(139,44,255,0.42)' : 'inset 0 1px 0 rgba(255,255,255,0.10)' }}>
              <Icon style={{ width: 20, height: 20 }} />
            </motion.button>
          ))}
        </div>
      </div>

      <motion.div
        className="spicey-map-trending"
        animate={{ y: trendingCollapsed ? 238 : 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 260 }}
        style={{ position: 'absolute', left: 14, right: 14, bottom: 'calc(80px + env(safe-area-inset-bottom))', zIndex: 22, borderRadius: 24, padding: '16px 14px 14px', background: 'linear-gradient(180deg,rgba(15,5,18,.92),rgba(5,2,9,.96))', border: '1px solid rgba(255,46,157,.32)', boxShadow: '0 18px 48px rgba(0,0,0,.55)', backdropFilter: 'blur(18px)' }}
      >
        <div className="spicey-map-trending-head" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div className="spicey-map-trending-title" style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <Flame style={{ width: 21, height: 21, color: '#fff', fill: '#fff', filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.55))' }} />
            <span style={{ color: ui.text, fontSize: 18, fontWeight: 900 }}>Trending Cities</span>
          </div>
          <button className="spicey-map-trending-seeall" onClick={zoomWorld} style={{ border: 0, background: 'rgba(255,255,255,0.16)', color: '#fff', borderRadius: 13, padding: '6px 8px', fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>See all <ChevronRight style={{ width: 18, height: 18 }} /></button>
        </div>
        <div className="spicey-map-scroll" style={{ display: 'grid', gridAutoFlow: 'column', gridAutoColumns: 'minmax(126px, 1fr)', gap: 10, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 2 }}>
          {TRENDING_CITIES.map(city => (
            <motion.button className="spicey-map-city-card" key={city.name} whileTap={{ scale: 0.97 }} onClick={() => openTrendingCity(city)} style={{ minWidth: 126, height: 170, borderRadius: 15, overflow: 'hidden', position: 'relative', border: '1.5px solid rgba(255,46,157,0.78)', background: '#08020d', padding: 0, textAlign: 'left', boxShadow: '0 0 18px rgba(255,46,157,0.16)', cursor: 'pointer' }}>
              <img src={city.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.3) contrast(1.06)' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 24%, rgba(0,0,0,0.24) 58%, rgba(0,0,0,0.84) 100%)' }} />
              <div className="spicey-map-city-copy" style={{ position: 'absolute', left: 12, right: 10, bottom: 12 }}>
                <div className="spicey-map-city-name" style={{ color: '#fff', fontSize: 17, fontWeight: 900 }}>{city.name}</div>
                <div className="spicey-map-city-live" style={{ color: 'rgba(255,255,255,0.62)', fontSize: 13, fontWeight: 700, marginTop: 4 }}>{city.live}</div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 29 }}>

        {/* Profile card */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ y: 80, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 60, opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              style={{ position: 'absolute', left: 16, right: 16, bottom: 24, zIndex: 30, pointerEvents: 'auto' }}
            >
              <div style={{ background: 'rgba(10,3,22,0.97)', border: '1px solid rgba(160,32,240,0.45)', borderRadius: 30, padding: '24px 20px 20px', boxShadow: '0 0 40px rgba(160,32,240,0.4), 0 12px 50px rgba(0,0,0,0.8)', position: 'relative', overflow: 'hidden' }}>
                {/* Top neon bar */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, borderRadius: '30px 30px 0 0', background: 'linear-gradient(90deg,#FF6B00,#FF4FD8,#A020F0)' }} />
                {/* Subtle bg glow */}
                <div style={{ position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle,rgba(160,32,240,0.15) 0%,transparent 70%)', pointerEvents: 'none' }} />

                <button onClick={() => setSelected(null)}
                  style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: '50%', background: 'rgba(160,32,240,0.2)', border: '1px solid rgba(160,32,240,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <X style={{ width: 17, height: 17, color: '#d946ef' }} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
                    <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'conic-gradient(from 0deg,#A020F0,#FF4FD8,#FF6B00,#A020F0)', animation: 'spin 3s linear infinite' }} />
                    <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
                    <div style={{ position: 'absolute', inset: 3, borderRadius: '50%', overflow: 'hidden' }}>
                      {isVideoAvatar(selected.avatar_url) ? (
                        <video src={`${selected.avatar_url}#t=0.1`} muted playsInline loop autoPlay className="spicey-video-avatar-crop" />
                      ) : (
                        <img src={selected.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selected.full_name || selected.username || 'U')}&background=a733ff&color=fff&size=80`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => { e.target.src = 'https://ui-avatars.com/api/?name=U&background=a733ff&color=fff&size=80'; }} />
                      )}
                    </div>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: '#ffffff', fontWeight: 800, fontSize: 18, margin: 0 }}>
                      {selected._isMe ? 'You' : (selected.full_name || selected.username || 'User')}
                    </p>
                    {selected.username && <p style={{ color: '#d946ef', fontSize: 13, margin: '3px 0 0', fontWeight: 600 }}>@{selected.username}</p>}

                    {userStates[selected.user_id] === 'live' && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 6, background: 'rgba(225,29,72,0.15)', border: '1px solid rgba(225,29,72,0.5)', borderRadius: 8, padding: '2px 8px' }}>
                        <div className="pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#e11d48' }} />
                        <span style={{ color: '#f87171', fontSize: 10, fontWeight: 800 }}>LIVE</span>
                      </div>
                    )}
                    {userStates[selected.user_id] === 'story' && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 6, background: 'rgba(160,32,240,0.15)', border: '1px solid rgba(160,32,240,0.5)', borderRadius: 8, padding: '2px 8px' }}>
                        <Sparkles style={{ width: 9, height: 9, color: '#d946ef' }} />
                        <span style={{ color: '#d946ef', fontSize: 10, fontWeight: 800 }}>STORY</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                      {myProfile?.latitude && selected.latitude && !selected._isMe && (
                        <span style={{ color: 'rgba(200,150,255,0.6)', fontSize: 12 }}>📍 {getDistance(myProfile.latitude, myProfile.longitude, selected.latitude, selected.longitude)} away</span>
                      )}
                      {selected.location_updated_at && (
                        <span style={{ color: 'rgba(200,150,255,0.4)', fontSize: 12 }}>· {selected._isMe ? 'your location' : timeAgo(selected.location_updated_at)}</span>
                      )}
                    </div>

                    {selected?.latitude && selected?.longitude && (
                      <motion.button whileTap={{ scale: 0.98 }} onClick={(e) => { e.stopPropagation(); setShowPostsModal(true); }}
                        style={{ marginTop: 10, padding: '8px 16px', borderRadius: 12, background: 'linear-gradient(135deg,#FF6B00,#FF4FD8,#A020F0)', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: '0 0 16px rgba(255,107,0,0.6)' }}>
                        <MapPin style={{ width: 14, height: 14, color: 'white' }} />
                        <span style={{ color: 'white', fontWeight: 700, fontSize: 12 }}>{getCityName(selected.latitude, selected.longitude)}</span>
                      </motion.button>
                    )}
                  </div>
                </div>

                {!selected._isMe && (
                  <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleChat(selected)}
                      style={{ flex: 1, height: 46, borderRadius: 16, background: 'linear-gradient(135deg,#A020F0,#d946ef)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'white', fontWeight: 700, fontSize: 15, boxShadow: '0 4px 16px rgba(160,32,240,0.5)' }}>
                      <MessageCircle style={{ width: 18, height: 18 }} />
                      Message
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => { navigate(`/profile/${selected.user_id}`); setSelected(null); }}
                      style={{ flex: 1, height: 46, borderRadius: 16, background: 'rgba(160,32,240,0.15)', border: '1px solid rgba(160,32,240,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'white', fontWeight: 700, fontSize: 15 }}>
                      <User style={{ width: 18, height: 18 }} />
                      Profile
                    </motion.button>
                  </div>
                )}

                <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowPostsModal(true)}
                  style={{ width: '100%', height: 44, borderRadius: 16, marginTop: 12, background: 'rgba(160,32,240,0.12)', border: '1px solid rgba(160,32,240,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#d946ef', fontWeight: 700, fontSize: 14 }}>
                  <MapPin style={{ width: 16, height: 16 }} />
                  Explore Area
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {(selected || selectedCity) && (
          <div style={{ pointerEvents: 'auto' }}>
            <LocationContentModal
              profile={selected}
              city={selectedCity}
              open={showPostsModal}
              onClose={() => { setShowPostsModal(false); setSelectedCity(null); }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
