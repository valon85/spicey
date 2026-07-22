import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Aperture,
  Bell,
  Flame,
  Heart,
  Home,
  MapPin,
  MessageCircle,
  Plus,
  Search,
  Share2,
  SlidersHorizontal,
  Smile,
  Sparkles,
  User,
  Zap,
} from 'lucide-react';

const labPeople = [
  {
    name: 'Sophia Laurent',
    handle: 'sophia.laurent',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&h=240&fit=crop&q=95',
  },
  {
    name: 'Valon',
    handle: 'valon',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&h=240&fit=crop&q=95',
  },
  {
    name: 'Vlora',
    handle: 'vlora',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&h=240&fit=crop&q=95',
  },
  {
    name: 'Ardian',
    handle: 'ardian',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&h=240&fit=crop&q=95',
  },
  {
    name: 'John',
    handle: 'john',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&h=240&fit=crop&q=95',
  },
];

const trending = [
  {
    tag: 'SpiceyNight',
    count: '24.8K',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=520&h=420&fit=crop&q=95',
    tone: 'orange',
  },
  {
    tag: 'UrbanVibes',
    count: '18.2K',
    image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=520&h=420&fit=crop&q=95',
    tone: 'pink',
  },
  {
    tag: 'GlowUp',
    count: '15.7K',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=520&h=420&fit=crop&q=95',
    tone: 'purple',
  },
  {
    tag: 'SummerVibes',
    count: '13.4K',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=520&h=420&fit=crop&q=95',
    tone: 'orange',
  },
];

const posterFallback = {
  name: 'Sophia Laurent',
  handle: 'sophia.laurent',
  avatar: labPeople[0].avatar,
  image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1100&h=1500&fit=crop&q=95',
  caption: 'Neon rooftop energy',
  tags: ['NightVibes', 'SpiceyLife', 'GlowUp'],
  likes: '7.8K',
  fire: '1.2K',
  comments: '321',
  shares: '89',
};

function getPostImage(post) {
  const imageUrls = Array.isArray(post?.image_urls) ? post.image_urls : [];
  return post?.image_url || imageUrls[0] || post?.thumbnail_url || posterFallback.image;
}

function getAuthor(post) {
  return post?.author_name || post?.full_name || post?.username || posterFallback.name;
}

function getHandle(post) {
  return post?.username || post?.handle || posterFallback.handle;
}

function getAvatar(post) {
  return post?.avatar_url || post?.author_avatar || post?.profile?.avatar_url || posterFallback.avatar;
}

function getCaption(post) {
  const text = String(post?.caption || post?.text || posterFallback.caption).trim();
  return text.length > 42 ? `${text.slice(0, 42).trim()}...` : text;
}

function compact(value, fallback) {
  const number = Number(value || 0);
  if (!number) return fallback;
  if (number >= 1000) return `${(number / 1000).toFixed(number >= 10000 ? 0 : 1)}K`;
  return String(number);
}

export default function HomeFeedV3Experimental() {
  const { data: realPosts = [] } = useQuery({
    queryKey: ['home-feed-v3-reference-posts'],
    queryFn: async () => {
      const rows = await base44.entities.Post.list('-created_date', 8);
      return Array.isArray(rows) ? rows : [];
    },
    staleTime: 60_000,
  });

  const post = realPosts.find((item) => getPostImage(item)) || posterFallback;
  const author = getAuthor(post);
  const handle = getHandle(post);
  const avatar = getAvatar(post);
  const image = getPostImage(post);
  const caption = getCaption(post);

  return (
    <main className="spicey-ref-page">
      <style>{`
        .spicey-ref-page {
          min-height: 100dvh;
          background: #020203;
          color: #f7f7fb;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
          overflow-x: hidden;
        }
        .spicey-ref-shell {
          width: min(430px, 100vw);
          min-height: 100dvh;
          margin: 0 auto;
          padding: max(22px, env(safe-area-inset-top)) 14px calc(96px + env(safe-area-inset-bottom));
          position: relative;
          background:
            radial-gradient(circle at 2% 6%, rgba(255,122,0,0.16), transparent 20%),
            radial-gradient(circle at 94% 9%, rgba(255,47,175,0.13), transparent 22%),
            linear-gradient(180deg, #050506 0%, #030304 58%, #050506 100%);
        }
        .spicey-ref-top {
          display: grid;
          grid-template-columns: 52px minmax(0, 1fr) 92px;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
        }
        .spicey-ref-logo {
          width: 48px;
          height: 48px;
          border-radius: 16px;
          background: url('/spicey-assets/spicey-logo-xcode.jpg') center 43% / 116px 116px no-repeat;
          filter: drop-shadow(0 0 16px rgba(255,122,0,0.55)) drop-shadow(0 0 12px rgba(255,47,175,0.38));
        }
        .spicey-ref-brand {
          text-align: center;
          position: relative;
          min-width: 0;
        }
        .spicey-ref-brand::before {
          content: '';
          position: absolute;
          left: 5%;
          right: 5%;
          top: 50%;
          height: 2px;
          transform: translateY(-50%);
          background: linear-gradient(90deg, transparent, rgba(255,122,0,0.7), rgba(255,47,175,0.55), rgba(122,43,255,0.5), transparent);
          filter: blur(2px);
        }
        .spicey-ref-word {
          position: relative;
          font-size: 38px;
          line-height: 1;
          font-weight: 950;
          font-style: italic;
          letter-spacing: 0.12em;
          background: linear-gradient(90deg, #ff8a00 0%, #ff3b48 42%, #ff2faf 66%, #7a2bff 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow: 0 0 18px rgba(255,47,175,0.30), 0 0 12px rgba(255,122,0,0.22);
        }
        .spicey-ref-icons {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }
        .spicey-ref-icon {
          width: 40px;
          height: 40px;
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 999px;
          background: rgba(255,255,255,0.045);
          color: white;
          display: grid;
          place-items: center;
          position: relative;
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }
        .spicey-ref-badge {
          position: absolute;
          top: -6px;
          right: -5px;
          min-width: 18px;
          height: 18px;
          padding: 0 4px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: #ff3b44;
          color: white;
          font-size: 10px;
          font-weight: 950;
        }
        .spicey-ref-search {
          height: 54px;
          border-radius: 27px;
          display: grid;
          grid-template-columns: 28px 1fr 44px;
          gap: 10px;
          align-items: center;
          padding: 0 9px 0 17px;
          margin-bottom: 22px;
          color: rgba(255,255,255,0.62);
          background: rgba(255,255,255,0.052);
          border: 1px solid rgba(255,255,255,0.12);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.10), 0 0 0 1px rgba(255,47,175,0.09), 0 18px 34px rgba(0,0,0,0.42);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .spicey-ref-filter {
          width: 42px;
          height: 42px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          color: white;
          background: radial-gradient(circle at 75% 20%, rgba(255,122,0,0.34), transparent 38%), linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,47,175,0.18), rgba(122,43,255,0.22));
          border: 1px solid rgba(255,255,255,0.12);
        }
        .spicey-ref-section-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 0 4px 12px;
        }
        .spicey-ref-section-head strong {
          font-size: 18px;
          letter-spacing: -0.03em;
        }
        .spicey-ref-section-head span {
          color: rgba(255,255,255,0.76);
          font-size: 13px;
          font-weight: 800;
        }
        .spicey-ref-stories {
          display: flex;
          gap: 13px;
          overflow-x: auto;
          padding: 0 2px 24px;
          scrollbar-width: none;
        }
        .spicey-ref-stories::-webkit-scrollbar,
        .spicey-ref-trending-row::-webkit-scrollbar {
          display: none;
        }
        .spicey-ref-story {
          flex: 0 0 66px;
          text-align: center;
        }
        .spicey-ref-story-orb {
          width: 66px;
          height: 66px;
          border-radius: 999px;
          padding: 2px;
          background: linear-gradient(145deg, #ff7a00, #ff2faf 52%, #7a2bff);
          position: relative;
          box-shadow: 0 0 18px rgba(255,47,175,0.20), 0 14px 26px rgba(0,0,0,0.42);
        }
        .spicey-ref-story-orb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 999px;
        }
        .spicey-ref-story-orb::after {
          content: '';
          position: absolute;
          right: 3px;
          bottom: 5px;
          width: 13px;
          height: 13px;
          border-radius: 999px;
          background: #00d84f;
          border: 2px solid #020203;
        }
        .spicey-ref-plus {
          position: absolute;
          right: -4px;
          bottom: -3px;
          width: 29px;
          height: 29px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          color: white;
          background: linear-gradient(145deg, #ff7a00, #ff2faf, #7a2bff);
          border: 2px solid #020203;
          box-shadow: 0 0 16px rgba(255,47,175,0.48);
        }
        .spicey-ref-story.more .spicey-ref-story-orb {
          display: grid;
          place-items: center;
          background: rgba(255,255,255,0.055);
          border: 1px solid rgba(255,255,255,0.10);
        }
        .spicey-ref-story.more .spicey-ref-story-orb::after {
          display: none;
        }
        .spicey-ref-story span {
          display: block;
          margin-top: 8px;
          font-size: 12px;
          color: rgba(255,255,255,0.88);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .spicey-ref-trending {
          margin-bottom: 24px;
        }
        .spicey-ref-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 19px;
          font-weight: 900;
          letter-spacing: -0.04em;
        }
        .spicey-ref-trending-row {
          display: flex;
          gap: 11px;
          overflow-x: auto;
          padding: 0 2px 2px;
          scrollbar-width: none;
        }
        .spicey-ref-trend-card {
          flex: 0 0 118px;
          height: 116px;
          position: relative;
          overflow: hidden;
          border-radius: 24px 26px 22px 24px;
          background: #0d0d10;
          border: 1px solid rgba(255,255,255,0.10);
          box-shadow: 0 16px 34px rgba(0,0,0,0.48);
        }
        .spicey-ref-trend-card:nth-child(2) {
          border-radius: 22px 28px 24px 22px;
          border-color: rgba(255,122,0,0.38);
          box-shadow: 0 0 20px rgba(255,122,0,0.10), 0 16px 34px rgba(0,0,0,0.48);
        }
        .spicey-ref-trend-card:nth-child(3) {
          border-color: rgba(122,43,255,0.38);
        }
        .spicey-ref-trend-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: saturate(1.28) contrast(1.08) brightness(0.9);
        }
        .spicey-ref-trend-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.12), transparent 34%, rgba(0,0,0,0.72));
        }
        .spicey-ref-trend-card strong,
        .spicey-ref-trend-card small {
          position: absolute;
          left: 13px;
          right: 10px;
          z-index: 1;
        }
        .spicey-ref-trend-card strong {
          bottom: 42px;
          font-size: 14px;
          line-height: 1.05;
        }
        .spicey-ref-trend-card small {
          bottom: 20px;
          color: rgba(255,255,255,0.74);
          font-size: 12px;
        }
        .spicey-ref-post {
          position: relative;
          min-height: 612px;
          border-radius: 34px;
          overflow: visible;
          margin-bottom: 36px;
          background: #070709;
          border: 1px solid rgba(255,47,175,0.30);
          box-shadow: 0 32px 78px rgba(0,0,0,0.72), 0 0 24px rgba(255,47,175,0.13), 0 0 20px rgba(255,122,0,0.10);
          isolation: isolate;
        }
        .spicey-ref-post::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 2;
          background: linear-gradient(180deg, rgba(0,0,0,0.12), transparent 26%, rgba(0,0,0,0.08) 56%, rgba(0,0,0,0.80));
        }
        .spicey-ref-post::after {
          content: '';
          position: absolute;
          inset: -1px;
          z-index: 6;
          pointer-events: none;
          border-radius: inherit;
          border: 1px solid rgba(255,122,0,0.32);
          box-shadow: inset 0 0 0 1px rgba(255,47,175,0.17), inset -30px 0 70px rgba(122,43,255,0.18);
        }
        .spicey-ref-photo {
          position: absolute;
          inset: 0;
          z-index: 1;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 36%;
          filter: saturate(1.22) contrast(1.08) brightness(1.02);
          transform: scale(1.02);
          border-radius: inherit;
        }
        .spicey-ref-wave {
          position: absolute;
          inset: 0 0 0 auto;
          width: 104px;
          z-index: 3;
          clip-path: polygon(42% 0, 100% 0, 100% 100%, 0 100%, 34% 87%, 18% 72%, 48% 56%, 22% 41%, 42% 23%);
          background:
            radial-gradient(circle at 65% 8%, rgba(255,122,0,0.24), transparent 25%),
            linear-gradient(180deg, rgba(5,5,7,0.10), rgba(5,5,7,0.74));
          border-left: 1px solid rgba(255,47,175,0.36);
          filter: drop-shadow(-8px 0 18px rgba(255,47,175,0.18));
        }
        .spicey-ref-post-head {
          position: absolute;
          top: 14px;
          left: 15px;
          right: 15px;
          z-index: 7;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .spicey-ref-author {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }
        .spicey-ref-author img {
          width: 50px;
          height: 50px;
          border-radius: 999px;
          padding: 2px;
          background: linear-gradient(145deg, #ff7a00, #ff2faf, #7a2bff);
          object-fit: cover;
        }
        .spicey-ref-author strong {
          display: block;
          font-size: 15px;
          font-weight: 900;
        }
        .spicey-ref-author small {
          display: block;
          margin-top: 2px;
          color: rgba(255,255,255,0.68);
          font-size: 12px;
        }
        .spicey-ref-menu {
          width: 34px;
          height: 34px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: rgba(0,0,0,0.28);
          color: white;
          font-size: 24px;
          font-weight: 900;
        }
        .spicey-ref-actions {
          position: absolute;
          right: 17px;
          top: 96px;
          z-index: 7;
          display: grid;
          gap: 12px;
          justify-items: center;
        }
        .spicey-ref-action {
          display: grid;
          gap: 5px;
          justify-items: center;
          color: white;
          font-size: 11px;
          font-weight: 900;
          text-shadow: 0 2px 10px rgba(0,0,0,0.9);
        }
        .spicey-ref-action button {
          width: 51px;
          height: 51px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.14);
          display: grid;
          place-items: center;
          color: white;
          background: rgba(5,5,7,0.48);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.12), 0 15px 26px rgba(0,0,0,0.46);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }
        .spicey-ref-action.love button {
          color: #ff345f;
          background: radial-gradient(circle at 35% 20%, rgba(255,255,255,0.28), transparent 30%), linear-gradient(145deg, rgba(255,122,0,0.26), rgba(255,47,175,0.38), rgba(5,5,7,0.52));
        }
        .spicey-ref-action.fire button {
          color: #ff7a00;
          background: radial-gradient(circle at 35% 20%, rgba(255,255,255,0.22), transparent 30%), linear-gradient(145deg, rgba(255,122,0,0.32), rgba(5,5,7,0.54));
        }
        .spicey-ref-action.talk button {
          width: 55px;
          height: 55px;
          color: white;
          font-size: 13px;
          font-weight: 950;
          background: linear-gradient(145deg, #ff7a00, #ff2faf 58%, #7a2bff);
          box-shadow: 0 0 18px rgba(255,47,175,0.36), 0 15px 26px rgba(0,0,0,0.46);
        }
        .spicey-ref-copy {
          position: absolute;
          left: 20px;
          right: 96px;
          bottom: 116px;
          z-index: 7;
        }
        .spicey-ref-copy h1 {
          margin: 0 0 8px;
          font-size: 26px;
          line-height: 1.05;
          font-weight: 950;
          letter-spacing: -0.05em;
        }
        .spicey-ref-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          color: #ff9b22;
          font-size: 14px;
          font-weight: 850;
        }
        .spicey-ref-reactions {
          position: absolute;
          left: 22px;
          right: 78px;
          bottom: 58px;
          z-index: 7;
          height: 54px;
          border-radius: 999px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          align-items: center;
          overflow: hidden;
          background: linear-gradient(90deg, rgba(255,122,0,0.42), rgba(255,47,175,0.30), rgba(122,43,255,0.28));
          border: 1px solid rgba(255,255,255,0.16);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.14), 0 18px 32px rgba(0,0,0,0.45), 0 0 20px rgba(255,47,175,0.18);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }
        .spicey-ref-reactions span {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          font-size: 14px;
          font-weight: 900;
          color: white;
          border-right: 1px solid rgba(255,255,255,0.12);
        }
        .spicey-ref-reactions span:last-child {
          border-right: 0;
        }
        .spicey-ref-liked {
          position: absolute;
          left: 12px;
          right: 12px;
          bottom: -31px;
          z-index: 12;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 7px;
          color: rgba(255,255,255,0.86);
          font-size: 9.5px;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          pointer-events: auto;
        }
        .spicey-ref-mini-avatars {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        .spicey-ref-mini-avatars img {
          width: 18px;
          height: 18px;
          border-radius: 999px;
          border: 1.5px solid #ff2d8f;
          box-shadow: 0 0 0 1px rgba(255,122,0,0.34), 0 3px 8px rgba(0,0,0,0.24);
          margin-left: -6px;
          object-fit: cover;
        }
        .spicey-ref-mini-avatars img:first-child {
          margin-left: 0;
        }
        .spicey-ref-mini-avatars img:nth-child(1) {
          border-color: #ff7a00;
        }
        .spicey-ref-mini-avatars img:nth-child(2) {
          border-color: #ff2faf;
        }
        .spicey-ref-mini-avatars img:nth-child(3),
        .spicey-ref-mini-avatars img:nth-child(4) {
          border-color: #7a2bff;
        }
        .spicey-ref-liked span {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .spicey-ref-bottom {
          position: fixed;
          left: 50%;
          bottom: max(12px, env(safe-area-inset-bottom));
          transform: translateX(-50%);
          width: min(402px, calc(100vw - 28px));
          height: 74px;
          border-radius: 36px;
          z-index: 20;
          display: grid;
          grid-template-columns: 1fr 1fr 96px 1fr 1fr;
          align-items: center;
          padding: 0 13px;
          background: rgba(13,13,17,0.86);
          border: 1px solid rgba(255,255,255,0.10);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.10), 0 18px 42px rgba(0,0,0,0.62);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }
        .spicey-ref-bottom button {
          border: 0;
          background: transparent;
          color: rgba(255,255,255,0.62);
          display: grid;
          place-items: center;
          gap: 4px;
          font-size: 11px;
        }
        .spicey-ref-bottom button.active {
          color: #ff7a00;
        }
        .spicey-ref-capture {
          width: 80px;
          height: 80px;
          margin: -26px auto 0;
          border-radius: 999px;
          display: grid;
          place-items: center;
          color: white;
          background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.84) 0 17%, transparent 18%), linear-gradient(145deg, #ff7a00, #ff2faf 58%, #7a2bff);
          border: 4px solid rgba(255,255,255,0.14);
          box-shadow: 0 20px 36px rgba(0,0,0,0.62), 0 0 28px rgba(255,47,175,0.34), inset 0 1px 0 rgba(255,255,255,0.38);
        }
      `}</style>

      <div className="spicey-ref-shell">
        <header className="spicey-ref-top">
          <div className="spicey-ref-logo" />
          <div className="spicey-ref-brand">
            <div className="spicey-ref-word">SPICEY</div>
          </div>
          <div className="spicey-ref-icons">
            <button className="spicey-ref-icon" type="button" aria-label="Messages">
              <MessageCircle size={20} />
              <span className="spicey-ref-badge">12</span>
            </button>
            <button className="spicey-ref-icon" type="button" aria-label="Notifications">
              <Bell size={20} />
              <span className="spicey-ref-badge">8</span>
            </button>
          </div>
        </header>

        <div className="spicey-ref-search">
          <Search size={24} />
          <span>Search creators, hashtags...</span>
          <span className="spicey-ref-filter"><SlidersHorizontal size={21} /></span>
        </div>

        <div className="spicey-ref-section-head">
          <strong>Stories</strong>
          <span>See all ›</span>
        </div>
        <section className="spicey-ref-stories" aria-label="Stories">
          <div className="spicey-ref-story">
            <div className="spicey-ref-story-orb">
              <img src={labPeople[0].avatar} alt="" />
              <span className="spicey-ref-plus"><Plus size={22} /></span>
            </div>
            <span>Your Story</span>
          </div>
          {labPeople.slice(1).map((person) => (
            <div className="spicey-ref-story" key={person.handle}>
              <div className="spicey-ref-story-orb">
                <img src={person.avatar} alt="" />
              </div>
              <span>{person.name}</span>
            </div>
          ))}
          <div className="spicey-ref-story more">
            <div className="spicey-ref-story-orb">
              <Sparkles size={25} />
            </div>
            <span>More</span>
          </div>
        </section>

        <section className="spicey-ref-trending">
          <div className="spicey-ref-section-head">
            <div className="spicey-ref-title"><Flame size={20} color="#ff7a00" />Spicey Trending</div>
            <span>See all ›</span>
          </div>
          <div className="spicey-ref-trending-row">
            {trending.map((item) => (
              <article className={`spicey-ref-trend-card ${item.tone}`} key={item.tag}>
                <img src={item.image} alt="" />
                <strong>#{item.tag}</strong>
                <small>{item.count}</small>
              </article>
            ))}
          </div>
        </section>

        <article className="spicey-ref-post" aria-label="Spicey feed post">
          <img className="spicey-ref-photo" src={image} alt="" />
          <div className="spicey-ref-wave" />
          <div className="spicey-ref-post-head">
            <div className="spicey-ref-author">
              <img src={avatar} alt="" />
              <div>
                <strong>{author}</strong>
                <small>@{handle} · 5m ago</small>
              </div>
            </div>
            <div className="spicey-ref-menu">...</div>
          </div>

          <div className="spicey-ref-actions">
            <div className="spicey-ref-action love"><button type="button" aria-label="Like"><Heart size={25} /></button><span>{compact(post.likes_count, posterFallback.likes)}</span></div>
            <div className="spicey-ref-action fire"><button type="button" aria-label="Fire"><Flame size={25} /></button><span>{compact(post.fire_count, posterFallback.fire)}</span></div>
            <div className="spicey-ref-action"><button type="button" aria-label="Comment"><MessageCircle size={24} /></button><span>{compact(post.comments_count, posterFallback.comments)}</span></div>
            <div className="spicey-ref-action talk"><button type="button" aria-label="Talk">Talk</button></div>
            <div className="spicey-ref-action"><button type="button" aria-label="Share"><Share2 size={23} /></button></div>
            <div className="spicey-ref-action"><button type="button" aria-label="Wow"><Smile size={25} /></button><span>96</span></div>
          </div>

          <div className="spicey-ref-copy">
            <h1>{caption}</h1>
            <div className="spicey-ref-tags">
              {posterFallback.tags.map((tag) => <span key={tag}>#{tag}</span>)}
            </div>
          </div>

          <div className="spicey-ref-reactions">
            <span><Flame size={20} color="#ffb13b" />{compact(post.fire_count, posterFallback.fire)}</span>
            <span><Heart size={20} color="#ff3c5f" />{compact(post.likes_count, posterFallback.likes)}</span>
            <span><Smile size={20} />{compact(post.comments_count, posterFallback.comments)}</span>
            <span><Share2 size={20} />{posterFallback.shares}</span>
          </div>

          <div className="spicey-ref-liked">
            <div className="spicey-ref-mini-avatars">
              {labPeople.slice(0, 4).map((person) => <img key={person.handle} src={person.avatar} alt="" />)}
            </div>
            <span>Liked by <b>Valon</b>, Ardian and {compact(post.likes_count, posterFallback.likes)} others</span>
          </div>
        </article>
      </div>

      <nav className="spicey-ref-bottom" aria-label="Spicey navigation">
        <button className="active" type="button" aria-label="Home"><Home size={27} />Home</button>
        <button type="button" aria-label="Messages"><MessageCircle size={27} />Messages</button>
        <div className="spicey-ref-capture"><Aperture size={34} /></div>
        <button type="button" aria-label="AI"><Zap size={27} />AI</button>
        <button type="button" aria-label="Profile"><User size={27} />Profile</button>
      </nav>
    </main>
  );
}
