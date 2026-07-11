import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Aperture,
  Bell,
  ChevronLeft,
  Clapperboard,
  Compass,
  Flame,
  Heart,
  Image as ImageIcon,
  MapPin,
  MessageCircle,
  Plus,
  Radio,
  Search,
  Share2,
  Smile,
  Sparkles,
  Wand2,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const spiceyV3FallbackMoments = [
  {
    id: 'v3-lab-1',
    author_name: 'Sophia Laurent',
    username: 'sophia.laurent',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=220&h=220&fit=crop&q=90',
    image_url: 'https://images.unsplash.com/photo-1512316609839-ce289d3eba0a?w=1200&h=1700&fit=crop&q=95',
    caption: 'A clean cinematic portrait with the subject clearly inside the Spicey poster.',
    location: 'Neon Rooftop',
    likes_count: 7800,
    fire_count: 1200,
    comments_count: 321,
  },
  {
    id: 'v3-lab-2',
    author_name: 'Luna Travel',
    username: 'lunatravel',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=220&h=220&fit=crop&q=90',
    image_url: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=1100&h=1500&fit=crop&q=92',
    caption: 'A night that starts as a photo and ends like a scene.',
    location: 'Miami Nights',
    likes_count: 5400,
    fire_count: 980,
    comments_count: 184,
  },
  {
    id: 'v3-lab-3',
    author_name: 'Marcus Lex',
    username: 'marcuslex',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=220&h=220&fit=crop&q=90',
    image_url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1100&h=1500&fit=crop&q=92',
    caption: 'The city turns electric when the camera finds the right second.',
    location: 'Urban Pulse',
    likes_count: 4100,
    fire_count: 1100,
    comments_count: 213,
  },
  {
    id: 'v3-lab-4',
    author_name: 'Mia Castellano',
    username: 'miacastellano',
    avatar_url: 'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=220&h=220&fit=crop&q=90',
    image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1100&h=1500&fit=crop&q=92',
    caption: 'Soft mountain light, quiet air, and one frame that slows everything down.',
    location: 'Aurora Valley',
    likes_count: 6800,
    fire_count: 740,
    comments_count: 118,
  },
  {
    id: 'v3-lab-5',
    author_name: 'Aria Noir',
    username: 'arianoir',
    avatar_url: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=220&h=220&fit=crop&q=90',
    image_url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1100&h=1500&fit=crop&q=92',
    caption: 'Golden hour turns a simple walk into a poster.',
    location: 'Sakura Coast',
    likes_count: 9200,
    fire_count: 1600,
    comments_count: 274,
  },
  {
    id: 'v3-lab-6',
    author_name: 'Noah Vibes',
    username: 'noahvibes',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=220&h=220&fit=crop&q=90',
    image_url: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1100&h=1500&fit=crop&q=92',
    caption: 'Rain on neon glass, city sound, cinematic mood.',
    location: 'Velvet Street',
    likes_count: 3700,
    fire_count: 870,
    comments_count: 96,
  },
  {
    id: 'v3-lab-7',
    author_name: 'Elena Glow',
    username: 'elenaglow',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=220&h=220&fit=crop&q=90',
    image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1100&h=1500&fit=crop&q=92',
    caption: 'A beach frame with enough silence to feel expensive.',
    location: 'Lava Beach',
    likes_count: 8100,
    fire_count: 1320,
    comments_count: 205,
  },
  {
    id: 'v3-lab-8',
    author_name: 'Leo Prism',
    username: 'leoprism',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=220&h=220&fit=crop&q=90',
    image_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1100&h=1500&fit=crop&q=92',
    caption: 'A crowd, a flash, and the whole night becomes a memory.',
    location: 'Galaxy Room',
    likes_count: 12400,
    fire_count: 2100,
    comments_count: 388,
  },
];

const themeSeeds = ['Sunset Glow', 'Miami Nights', 'Velvet Purple', 'Galaxy', 'Aurora', 'Sakura'];

function compactNumber(value = 0) {
  const n = Number(value || 0);
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
  return String(n);
}

function imageForMoment(moment, index) {
  const images = Array.isArray(moment?.image_urls) ? moment.image_urls : [];
  return moment?.image_url || images[0] || moment?.thumbnail_url || spiceyV3FallbackMoments[index % spiceyV3FallbackMoments.length].image_url;
}

function hasMomentImage(moment) {
  const images = Array.isArray(moment?.image_urls) ? moment.image_urls : [];
  return Boolean(moment?.image_url || images[0] || moment?.thumbnail_url);
}

function avatarForMoment(moment, index) {
  return moment?.avatar_url || moment?.author_avatar || moment?.profile?.avatar_url || spiceyV3FallbackMoments[index % spiceyV3FallbackMoments.length].avatar_url;
}

function titleForMoment(moment, index) {
  const caption = moment?.caption || moment?.text || spiceyV3FallbackMoments[index % spiceyV3FallbackMoments.length].caption;
  const clean = String(caption).replace(/\s+/g, ' ').trim();
  if (!clean) return 'Cinematic moment';
  return clean.length > 54 ? `${clean.slice(0, 54).trim()}...` : clean;
}

function authorForMoment(moment, index) {
  return moment?.author_name || moment?.full_name || moment?.username || spiceyV3FallbackMoments[index % spiceyV3FallbackMoments.length].author_name;
}

export default function HomeFeedV3Experimental() {
  const navigate = useNavigate();
  const { data: realPosts = [] } = useQuery({
    queryKey: ['home-feed-v3-experimental-posts'],
    queryFn: async () => {
      const rows = await base44.entities.Post.list('-created_date', 12);
      return Array.isArray(rows) ? rows : [];
    },
    staleTime: 60_000,
  });

  const imagePosts = realPosts.filter(hasMomentImage);
  const cleanLabMoments = spiceyV3FallbackMoments;
  const moments = cleanLabMoments.length > 0 ? cleanLabMoments : imagePosts;
  const hero = moments[0] || spiceyV3FallbackMoments[0];
  const portals = moments.slice(0, 6);
  const collection = [...moments.slice(1), ...spiceyV3FallbackMoments].slice(0, 4);

  return (
    <main className="home-v3-page">
      <style>{`
        .home-v3-page {
          min-height: 100dvh;
          width: 100%;
          color: #f5f5f7;
          background:
            radial-gradient(circle at 8% 5%, rgba(255,122,0,0.14), transparent 24%),
            radial-gradient(circle at 96% 18%, rgba(255,47,175,0.11), transparent 26%),
            linear-gradient(180deg, #050505 0%, #08070a 48%, #050505 100%);
          overflow-x: hidden;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
        }
        .home-v3-shell {
          max-width: 430px;
          min-height: 100dvh;
          margin: 0 auto;
          padding: max(18px, env(safe-area-inset-top)) 16px calc(96px + env(safe-area-inset-bottom));
          position: relative;
        }
        .home-v3-shell::before,
        .home-v3-shell::after {
          content: '';
          position: fixed;
          left: 50%;
          width: min(430px, 100vw);
          pointer-events: none;
          transform: translateX(-50%);
          z-index: 0;
        }
        .home-v3-shell::before {
          top: 0;
          height: 280px;
          background: linear-gradient(135deg, rgba(255,122,0,0.10), transparent 36%), linear-gradient(220deg, rgba(122,43,255,0.10), transparent 42%);
          opacity: 0.9;
        }
        .home-v3-shell::after {
          bottom: 0;
          height: 190px;
          background: radial-gradient(ellipse at 50% 100%, rgba(255,47,175,0.20), transparent 66%);
        }
        .home-v3-content {
          position: relative;
          z-index: 1;
        }
        .home-v3-top {
          display: grid;
          grid-template-columns: 42px minmax(0, 1fr) 42px;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        .home-v3-back,
        .home-v3-alert {
          width: 42px;
          height: 42px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.055);
          color: white;
          display: grid;
          place-items: center;
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }
        .home-v3-brand {
          min-width: 0;
          text-align: center;
          position: relative;
        }
        .home-v3-brand::before {
          content: '';
          position: absolute;
          left: 10%;
          right: 10%;
          top: 50%;
          height: 1px;
          transform: translateY(-50%);
          background: linear-gradient(90deg, transparent, rgba(255,122,0,0.62), rgba(255,47,175,0.50), rgba(122,43,255,0.42), transparent);
          filter: blur(0.4px);
        }
        .home-v3-wordmark {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: clamp(26px, 8vw, 34px);
          font-weight: 950;
          letter-spacing: 0.17em;
          font-style: italic;
          background: linear-gradient(90deg, #ff7a00, #ff3d62 48%, #d747ff 78%, #7a2bff);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow: 0 0 18px rgba(255,47,175,0.18);
        }
        .home-v3-mark {
          width: 30px;
          height: 30px;
          border-radius: 10px;
          background: url('/spicey-assets/spicey-logo-xcode.jpg') center 43% / 76px 76px no-repeat;
          box-shadow: 0 0 16px rgba(255,122,0,0.28), 0 0 18px rgba(255,47,175,0.18);
        }
        .home-v3-search {
          height: 48px;
          border-radius: 24px;
          padding: 0 10px 0 16px;
          display: grid;
          grid-template-columns: 24px 1fr 40px;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
          background: rgba(255,255,255,0.055);
          border: 1px solid rgba(255,255,255,0.11);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.10), 0 18px 34px rgba(0,0,0,0.36);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          color: rgba(255,255,255,0.54);
          font-size: 14px;
        }
        .home-v3-filter {
          width: 40px;
          height: 40px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.12);
          background: linear-gradient(145deg, rgba(255,122,0,0.24), rgba(255,47,175,0.20), rgba(122,43,255,0.18));
          color: white;
          display: grid;
          place-items: center;
        }
        .home-v3-lab-note {
          display: flex;
          align-items: center;
          gap: 8px;
          width: fit-content;
          max-width: 100%;
          padding: 8px 12px;
          margin: 0 0 16px;
          border-radius: 999px;
          background: rgba(255,255,255,0.055);
          border: 1px solid rgba(255,255,255,0.09);
          color: rgba(255,255,255,0.72);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.02em;
        }
        .home-v3-portals {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding: 1px 2px 14px;
          scrollbar-width: none;
        }
        .home-v3-portals::-webkit-scrollbar,
        .home-v3-cinema-row::-webkit-scrollbar {
          display: none;
        }
        .home-v3-portal {
          flex: 0 0 62px;
          text-align: center;
        }
        .home-v3-portal-orb {
          width: 60px;
          height: 62px;
          border-radius: 999px;
          padding: 2px;
          background: linear-gradient(145deg, #ff7a00, #ff2faf 52%, #7a2bff);
          box-shadow: 0 14px 26px rgba(0,0,0,0.38), 0 0 18px rgba(255,47,175,0.12);
          position: relative;
        }
        .home-v3-portal-orb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 999px;
          display: block;
        }
        .home-v3-portal-orb::after {
          content: '';
          position: absolute;
          right: 6px;
          bottom: 5px;
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: #2ee766;
          border: 2px solid #050505;
        }
        .home-v3-portal span {
          display: block;
          margin-top: 8px;
          font-size: 11px;
          color: rgba(255,255,255,0.68);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .home-v3-hero {
          position: relative;
          min-height: 560px;
          border-radius: 30px;
          overflow: hidden;
          margin: 2px 0 18px;
          background: #09090b;
          border: 1px solid rgba(255,47,175,0.18);
          box-shadow: 0 26px 64px rgba(0,0,0,0.64), 0 0 24px rgba(255,47,175,0.12), 0 0 22px rgba(255,122,0,0.08);
          isolation: isolate;
        }
        .home-v3-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.10), transparent 32%, rgba(0,0,0,0.08) 62%, rgba(0,0,0,0.62));
          z-index: 2;
        }
        .home-v3-hero::after {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          border: 1px solid rgba(255,122,0,0.26);
          box-shadow: inset 0 0 0 1px rgba(255,47,175,0.15), inset -24px 0 56px rgba(122,43,255,0.12);
          z-index: 4;
          pointer-events: none;
        }
        .home-v3-hero-media {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 36%;
          transform: scale(1.015);
          filter: saturate(1.16) contrast(1.07) brightness(1.05);
          z-index: 1;
        }
        .home-v3-ribbon {
          position: absolute;
          inset: 0 0 0 auto;
          width: 76px;
          z-index: 3;
          background:
            radial-gradient(circle at 60% 16%, rgba(255,122,0,0.28), transparent 30%),
            linear-gradient(180deg, rgba(5,5,7,0.06), rgba(5,5,7,0.62));
          clip-path: polygon(46% 0, 100% 0, 100% 100%, 18% 100%, 42% 82%, 22% 64%, 46% 48%, 24% 30%);
          border-left: 1px solid rgba(255,47,175,0.30);
        }
        .home-v3-hero-top {
          position: absolute;
          top: 18px;
          left: 18px;
          right: 18px;
          z-index: 5;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .home-v3-author {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }
        .home-v3-author img {
          width: 48px;
          height: 48px;
          border-radius: 18px;
          object-fit: cover;
          border: 1px solid rgba(255,255,255,0.22);
        }
        .home-v3-author strong {
          display: block;
          font-size: 15px;
          line-height: 1.05;
        }
        .home-v3-author small {
          display: block;
          margin-top: 4px;
          color: rgba(255,255,255,0.58);
          font-size: 12px;
        }
        .home-v3-spice-badge {
          width: 42px;
          height: 42px;
          border-radius: 999px;
          background: url('/spicey-assets/spicey-logo-xcode.jpg') center 43% / 92px 92px no-repeat;
          border: 1px solid rgba(255,255,255,0.14);
          box-shadow: 0 0 18px rgba(255,122,0,0.22), 0 0 22px rgba(255,47,175,0.16);
        }
        .home-v3-hero-copy {
          position: absolute;
          left: 20px;
          right: 96px;
          bottom: 90px;
          z-index: 5;
        }
        .home-v3-hero-copy h1 {
          margin: 0 0 10px;
          font-size: 34px;
          line-height: 0.96;
          letter-spacing: -0.055em;
          font-weight: 950;
        }
        .home-v3-hero-copy p {
          margin: 0;
          color: rgba(255,255,255,0.78);
          font-size: 13px;
          line-height: 1.45;
        }
        .home-v3-spice-actions {
          position: absolute;
          right: 14px;
          top: 126px;
          z-index: 5;
          display: grid;
          gap: 10px;
          justify-items: center;
        }
        .home-v3-spice-action {
          display: grid;
          justify-items: center;
          gap: 5px;
          color: white;
          text-shadow: 0 1px 10px rgba(0,0,0,0.85);
        }
        .home-v3-spice-action button {
          width: 44px;
          height: 44px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(5,5,7,0.36);
          color: white;
          display: grid;
          place-items: center;
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.10), 0 14px 22px rgba(0,0,0,0.38);
        }
        .home-v3-spice-action span {
          font-size: 10px;
          font-weight: 900;
          color: rgba(255,255,255,0.86);
        }
        .home-v3-spice-action:nth-child(1) button { color: #ff7a00; }
        .home-v3-spice-action:nth-child(2) button { color: #ff2faf; }
        .home-v3-spice-action:nth-child(3) button { color: #d747ff; }
        .home-v3-spice-action:nth-child(4) button { color: #f5f5f7; }
        .home-v3-moment-bar {
          position: absolute;
          left: 18px;
          right: 82px;
          bottom: 20px;
          height: 46px;
          z-index: 5;
          border-radius: 999px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          align-items: center;
          background: rgba(5,5,7,0.62);
          border: 1px solid rgba(255,255,255,0.12);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.10), 0 18px 32px rgba(0,0,0,0.42);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          overflow: hidden;
        }
        .home-v3-moment-bar::after {
          content: '';
          position: absolute;
          left: 12px;
          right: 12px;
          bottom: 0;
          height: 1px;
          background: linear-gradient(90deg, #ff7a00, #ff2faf, #7a2bff);
          opacity: 0.75;
        }
        .home-v3-moment-bar span {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 850;
          color: rgba(255,255,255,0.86);
        }
        .home-v3-section-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 0 2px 10px;
        }
        .home-v3-section-title h2 {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 18px;
          margin: 0;
          letter-spacing: -0.03em;
        }
        .home-v3-section-title span {
          font-size: 12px;
          color: rgba(255,255,255,0.54);
          font-weight: 800;
        }
        .home-v3-cinema-row {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding: 2px 2px 16px;
          scrollbar-width: none;
        }
        .home-v3-cinema-card {
          flex: 0 0 132px;
          height: 112px;
          border-radius: 22px 24px 20px 22px;
          overflow: hidden;
          position: relative;
          background: #111;
          border: 1px solid rgba(255,255,255,0.10);
          box-shadow: 0 16px 36px rgba(0,0,0,0.44);
        }
        .home-v3-cinema-card:nth-child(2n) {
          border-radius: 20px 28px 22px 20px;
        }
        .home-v3-cinema-card:nth-child(3n) {
          border-radius: 28px 20px 20px 26px;
        }
        .home-v3-cinema-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: saturate(1.12) contrast(1.03);
        }
        .home-v3-cinema-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.06), transparent 40%, rgba(0,0,0,0.72));
        }
        .home-v3-cinema-card strong,
        .home-v3-cinema-card small {
          position: absolute;
          left: 13px;
          right: 13px;
          z-index: 1;
        }
        .home-v3-cinema-card strong {
          bottom: 32px;
          font-size: 13px;
          line-height: 1.1;
        }
        .home-v3-cinema-card small {
          bottom: 14px;
          color: rgba(255,255,255,0.66);
          font-size: 11px;
        }
        .home-v3-bottom {
          position: fixed;
          left: 50%;
          bottom: max(12px, env(safe-area-inset-bottom));
          transform: translateX(-50%);
          width: min(398px, calc(100vw - 28px));
          height: 66px;
          border-radius: 30px;
          z-index: 20;
          display: grid;
          grid-template-columns: 1fr 1fr 86px 1fr 1fr;
          align-items: center;
          padding: 0 12px;
          background: rgba(12,12,15,0.82);
          border: 1px solid rgba(255,255,255,0.10);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.10), 0 18px 42px rgba(0,0,0,0.58);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }
        .home-v3-bottom button {
          border: 0;
          background: transparent;
          color: rgba(255,255,255,0.62);
          display: grid;
          place-items: center;
        }
        .home-v3-capture {
          width: 72px;
          height: 72px;
          margin: -22px auto 0;
          border-radius: 999px;
          display: grid;
          place-items: center;
          color: white;
          background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.84) 0 18%, transparent 19%), linear-gradient(145deg, #ff7a00, #ff2faf 58%, #7a2bff);
          border: 4px solid rgba(255,255,255,0.16);
          box-shadow: 0 18px 34px rgba(0,0,0,0.58), 0 0 26px rgba(255,47,175,0.28), inset 0 1px 0 rgba(255,255,255,0.38);
        }
      `}</style>

      <div className="home-v3-shell">
        <div className="home-v3-content">
          <header className="home-v3-top">
            <button className="home-v3-back" type="button" aria-label="Back to settings" onClick={() => navigate('/settings')}>
              <ChevronLeft size={22} />
            </button>
            <div className="home-v3-brand" aria-label="Spicey Home Feed V3 Experimental">
              <div className="home-v3-wordmark"><span className="home-v3-mark" />SPICEY</div>
            </div>
            <button className="home-v3-alert" type="button" aria-label="Lab notifications">
              <Bell size={20} />
            </button>
          </header>

          <div className="home-v3-search">
            <Search size={20} />
            <span>Search moments, moods, places...</span>
            <span className="home-v3-filter"><Compass size={19} /></span>
          </div>

          <section className="home-v3-portals" aria-label="Story portals">
            {portals.map((moment, index) => (
              <div className="home-v3-portal" key={moment.id || `${moment.username}-${index}`}>
                <div className="home-v3-portal-orb">
                  <img src={avatarForMoment(moment, index)} alt="" />
                </div>
                <span>{authorForMoment(moment, index).split(' ')[0]}</span>
              </div>
            ))}
          </section>

          <section>
            <div className="home-v3-section-title">
              <h2><Flame size={18} color="#ff7a00" />Spicey Trending</h2>
              <span>See all</span>
            </div>
            <div className="home-v3-cinema-row">
              {collection.map((moment, index) => (
                <article className="home-v3-cinema-card" key={`cinema-${moment.id || index}`}>
                  <img src={imageForMoment(moment, index + 1)} alt="" />
                  <strong>#{themeSeeds[index % themeSeeds.length].replace(/\s+/g, '')}</strong>
                  <small>{compactNumber(moment.likes_count || 24000)}</small>
                </article>
              ))}
            </div>
          </section>

          <article className="home-v3-hero" aria-label="Cinematic hero poster">
            <img className="home-v3-hero-media" src={imageForMoment(hero, 0)} alt="" />
            <div className="home-v3-ribbon" />
            <div className="home-v3-hero-top">
              <div className="home-v3-author">
                <img src={avatarForMoment(hero, 0)} alt="" />
                <div>
                  <strong>{authorForMoment(hero, 0)}</strong>
                  <small>@{hero.username || hero.handle || 'spicey'} · cinematic now</small>
                </div>
              </div>
              <div className="home-v3-spice-badge" aria-label="Spicey Look" />
            </div>

            <div className="home-v3-spice-actions" aria-label="Spicey interactions">
              <div className="home-v3-spice-action"><button type="button" aria-label="Love"><Heart size={22} /></button><span>{compactNumber(hero.likes_count || 7800)}</span></div>
              <div className="home-v3-spice-action"><button type="button" aria-label="Fire"><Flame size={22} /></button><span>{compactNumber(hero.fire_count || 1200)}</span></div>
              <div className="home-v3-spice-action"><button type="button" aria-label="Discuss"><MessageCircle size={21} /></button><span>{compactNumber(hero.comments_count || 321)}</span></div>
              <div className="home-v3-spice-action"><button type="button" aria-label="Share"><Share2 size={20} /></button><span>89</span></div>
            </div>

            <div className="home-v3-hero-copy">
              <h1>{titleForMoment(hero, 0)}</h1>
              <p><MapPin size={13} style={{ display: 'inline', marginRight: 4 }} />{hero.location || 'Spicey cinematic moment'}</p>
            </div>

            <div className="home-v3-moment-bar">
              <span><Flame size={15} color="#ff7a00" />{compactNumber(hero.fire_count || hero.fire || 1200)}</span>
              <span><Heart size={15} color="#ff2faf" />{compactNumber(hero.likes_count || hero.likes || 7800)}</span>
              <span><MessageCircle size={15} />{compactNumber(hero.comments_count || hero.comments || 321)}</span>
              <span><Smile size={15} />96</span>
            </div>
          </article>
        </div>
      </div>

      <nav className="home-v3-bottom" aria-label="Home Feed V3 experimental navigation">
        <button type="button" aria-label="Moments"><ImageIcon size={23} /></button>
        <button type="button" aria-label="Messages"><MessageCircle size={23} /></button>
        <div className="home-v3-capture"><Aperture size={31} /></div>
        <button type="button" aria-label="AI"><Sparkles size={23} /></button>
        <button type="button" aria-label="Map"><MapPin size={23} /></button>
      </nav>
    </main>
  );
}
