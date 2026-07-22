import React from 'react';
import { Bell, Flame, Heart, Home, MapPin, MessageCircle, Plus, Search, Share2, SlidersHorizontal, User, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const stories = [
  { name: 'Sophia', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=220&h=220&fit=crop&q=90' },
  { name: 'Marcus', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=220&h=220&fit=crop&q=90' },
  { name: 'Luna', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=220&h=220&fit=crop&q=90' },
  { name: 'Noah', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=220&h=220&fit=crop&q=90' },
];

const trends = [
  { tag: '#NeonNight', count: '24.8K', color: '#ff7a00', image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=520&h=680&fit=crop&q=92' },
  { tag: '#CityPulse', count: '18.2K', color: '#ff2faf', image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=520&h=680&fit=crop&q=92' },
  { tag: '#GlowUp', count: '15.7K', color: '#7a2bff', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=520&h=680&fit=crop&q=92' },
];

const posters = [
  {
    author: 'Sophia Laurent',
    handle: '@sophia.laurent',
    avatar: stories[0].avatar,
    image: '/spicey-assets/home-feed-v2-poster-tall.png',
    title: 'Neon rooftop energy ✨',
    caption: 'City lights, midnight colors, and a moment that feels alive.',
    likes: '7.8K',
    fire: '1.2K',
    comments: '321',
    shares: '89',
  },
  {
    author: 'Luna Travel',
    handle: '@lunatravel',
    avatar: stories[2].avatar,
    image: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=900&h=1150&fit=crop&q=92',
    title: 'After dark celebration',
    caption: 'Warm lights, music in the air, and a night that does not feel ordinary.',
    likes: '5.4K',
    fire: '980',
    comments: '184',
    shares: '42',
  },
  {
    author: 'Marcus Lex',
    handle: '@marcuslex',
    avatar: stories[1].avatar,
    image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=900&h=1150&fit=crop&q=92',
    title: 'City pulse',
    caption: 'Concrete, glow, speed, and a skyline that feels cinematic.',
    likes: '4.1K',
    fire: '1.1K',
    comments: '213',
    shares: '58',
  },
  {
    author: 'Noah Vibes',
    handle: '@noahvibes',
    avatar: stories[3].avatar,
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&h=1150&fit=crop&q=92',
    title: 'Golden escape',
    caption: 'Soft sunset, deep air, and a place that feels made for memories.',
    likes: '6.2K',
    fire: '744',
    comments: '156',
    shares: '31',
  },
];

function V2IconButton({ children, label, onClick }) {
  return (
    <button
      aria-label={label}
      className="home-v2-glass-button"
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

export default function HomeFeedV2Test() {
  const navigate = useNavigate();

  return (
    <main className="home-v2-page">
      <style>{`
        .home-v2-page {
          position: relative;
          min-height: 100dvh;
          width: 100%;
          color: #f5f5f7;
          background:
            radial-gradient(circle at 92% 8%, rgba(255,47,175,0.14), transparent 28%),
            radial-gradient(circle at 4% 22%, rgba(255,122,0,0.10), transparent 24%),
            #050505;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
          overflow-x: hidden;
        }
        .home-v2-page::before {
          content: "";
          position: fixed;
          inset: 0;
          left: 50%;
          width: min(430px, 100vw);
          transform: translateX(-50%);
          background: url('/spicey-assets/home-feed-v2-reference.png') top center / 100% auto no-repeat;
          opacity: 0.025;
          pointer-events: none;
          z-index: 0;
        }
        .home-v2-shell {
          position: relative;
          z-index: 1;
          max-width: 430px;
          min-height: 100dvh;
          margin: 0 auto;
          padding: max(18px, env(safe-area-inset-top)) 16px calc(104px + env(safe-area-inset-bottom));
        }
        .home-v2-top {
          display: grid;
          grid-template-columns: 46px minmax(0, 1fr) 46px;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }
        .home-v2-s-logo {
          position: relative;
          width: 46px;
          height: 46px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          color: #fff;
          background:
            radial-gradient(circle at 50% 48%, rgba(255,47,175,0.10), transparent 56%),
            url('/spicey-assets/spicey-logo-xcode.jpg') center 43% / 96px 96px no-repeat;
          border: 1px solid rgba(255,255,255,0.10);
          box-shadow: 0 0 16px rgba(255,122,0,0.28), 0 0 18px rgba(255,47,175,0.18), inset 0 1px 0 rgba(255,255,255,0.12);
          overflow: hidden;
        }
        .home-v2-s-logo svg {
          display: none;
        }
        .home-v2-wordmark {
          position: relative;
          text-align: center;
          font-size: clamp(22px, 6.7vw, 29px);
          font-weight: 900;
          letter-spacing: 0.10em;
          color: transparent;
          background: linear-gradient(90deg, #ff7a00 0%, #ff4b2f 28%, #ff2faf 60%, #7a2bff 100%);
          -webkit-background-clip: text;
          background-clip: text;
          overflow: hidden;
          white-space: nowrap;
          transform: skewX(-8deg);
          filter: drop-shadow(0 0 8px rgba(255,122,0,0.26)) drop-shadow(0 0 10px rgba(255,47,175,0.20));
        }
        .home-v2-wordmark::before {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          top: 50%;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(255,122,0,0.70), rgba(255,47,175,0.48), rgba(122,43,255,0.32), transparent);
          transform: translateY(-50%);
          filter: blur(1px);
          z-index: -1;
        }
        .home-v2-wordmark::after {
          content: "";
          position: absolute;
          left: 18%;
          right: 18%;
          bottom: 4px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,122,0,0.55), rgba(255,47,175,0.42), transparent);
          filter: blur(0.5px);
        }
        .home-v2-glass-button {
          width: 42px;
          height: 42px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.11);
          background: rgba(255,255,255,0.055);
          color: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.12), 0 14px 30px rgba(0,0,0,0.35);
        }
        .home-v2-top-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0;
        }
        .home-v2-badge-wrap {
          position: relative;
        }
        .home-v2-badge {
          position: absolute;
          top: -4px;
          right: -2px;
          min-width: 18px;
          height: 18px;
          border-radius: 999px;
          padding: 0 5px;
          background: #ff2f57;
          color: white;
          font-size: 10px;
          font-weight: 900;
          display: grid;
          place-items: center;
          border: 1px solid rgba(255,255,255,0.45);
        }
        .home-v2-search {
          display: flex;
          align-items: center;
          gap: 10px;
          height: 48px;
          padding: 0 10px 0 16px;
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.06);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.10), 0 0 0 1px rgba(255,122,0,0.08), 0 0 18px rgba(255,47,175,0.08);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .home-v2-search span {
          flex: 1;
          color: rgba(245,245,247,0.54);
          font-size: 14px;
        }
        .home-v2-mini-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 20px 2px 0;
        }
        .home-v2-mini-title h2 {
          margin: 0;
          font-size: 20px;
          line-height: 1;
          font-weight: 900;
          letter-spacing: -0.04em;
        }
        .home-v2-mini-title span {
          color: rgba(245,245,247,0.66);
          font-size: 13px;
          font-weight: 750;
        }
        .home-v2-stories {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          padding: 14px 0 18px;
          scrollbar-width: none;
        }
        .home-v2-story {
          flex: 0 0 auto;
          width: 70px;
          text-align: center;
        }
        .home-v2-story-ring {
          width: 68px;
          height: 68px;
          margin: 0 auto 8px;
          padding: 2.5px;
          border-radius: 999px;
          background: linear-gradient(135deg, #ff7a00, #ff2faf, #7a2bff);
          box-shadow: 0 0 18px rgba(255,47,175,0.18);
        }
        .home-v2-map-portal {
          display: grid;
          place-items: center;
          background:
            radial-gradient(circle at 50% 38%, rgba(255,47,175,0.78), transparent 32%),
            linear-gradient(135deg, rgba(255,122,0,0.95), rgba(255,47,175,0.85), rgba(122,43,255,0.95));
          border-radius: 999px;
          box-shadow: 0 0 18px rgba(255,47,175,0.25), inset 0 1px 0 rgba(255,255,255,0.24);
        }
        .home-v2-story-ring img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 999px;
          border: 2px solid #050505;
        }
        .home-v2-section-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 4px 0 12px;
        }
        .home-v2-section-title h2 {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 18px;
          font-weight: 900;
          letter-spacing: -0.03em;
        }
        .home-v2-trends {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding: 2px 0 22px;
          scrollbar-width: none;
        }
        .home-v2-trend {
          position: relative;
          flex: 0 0 122px;
          height: 148px;
          overflow: hidden;
          border-radius: 30px 24px 30px 18px;
          clip-path: polygon(0 10%, 18% 3%, 42% 7%, 66% 1%, 100% 9%, 100% 100%, 0 100%);
          border: 1px solid color-mix(in srgb, var(--accent), transparent 42%);
          background: #111;
          box-shadow: 0 16px 34px rgba(0,0,0,0.48), 0 0 16px color-mix(in srgb, var(--accent), transparent 78%);
        }
        .home-v2-trend::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 20% 18%, color-mix(in srgb, var(--accent), transparent 66%), transparent 42%),
            linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.78));
          z-index: 1;
        }
        .home-v2-trend img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: brightness(0.78) saturate(1.22);
        }
        .home-v2-trend-label {
          position: absolute;
          left: 12px;
          right: 10px;
          bottom: 12px;
          z-index: 2;
          text-align: left;
        }
        .home-v2-poster {
          position: relative;
          min-height: 515px;
          margin-top: 0;
          margin-bottom: 14px;
          border-radius: 34px 34px 38px 22px;
          overflow: hidden;
          border: 1px solid rgba(255,47,175,0.36);
          background: rgba(255,255,255,0.05);
          box-shadow:
            0 28px 62px rgba(0,0,0,0.68),
            0 0 0 1px rgba(255,122,0,0.08),
            0 0 32px rgba(255,47,175,0.12);
        }
        .home-v2-poster::before {
          content: "";
          position: absolute;
          top: 54px;
          right: -10px;
          width: 104px;
          height: calc(100% - 84px);
          z-index: 3;
          background:
            radial-gradient(circle at 28% 18%, rgba(255,47,175,0.16), transparent 34%),
            linear-gradient(180deg, rgba(4,4,6,0.78), rgba(4,4,6,0.58) 52%, rgba(4,4,6,0.86));
          border-left: 1px solid rgba(255,47,175,0.52);
          border-radius: 58px 0 0 72px;
          clip-path: path("M 86 0 C 50 15 48 68 66 98 C 91 142 72 175 50 204 C 23 239 34 291 72 321 C 101 345 80 404 62 452 C 45 497 53 523 89 560 L 104 560 L 104 0 Z");
          box-shadow: -10px 0 22px rgba(0,0,0,0.26), -2px 0 13px rgba(255,47,175,0.20);
          pointer-events: none;
        }
        .home-v2-poster img.home-v2-hero {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center center;
          filter: brightness(0.72) saturate(1.08) contrast(1.02);
        }
        .home-v2-poster::after {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 86% 50%, rgba(5,5,5,0.28) 0 12%, transparent 31%),
            linear-gradient(180deg, rgba(0,0,0,0.68) 0%, rgba(0,0,0,0.08) 25%, transparent 52%, rgba(0,0,0,0.88) 100%);
          pointer-events: none;
        }
        .home-v2-electric {
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
        }
        .home-v2-electric path {
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-width: 1;
          filter: drop-shadow(0 0 6px rgba(255,47,175,0.38));
        }
        .home-v2-poster-head,
        .home-v2-poster-copy,
        .home-v2-actions,
        .home-v2-reactions {
          position: absolute;
          z-index: 4;
        }
        .home-v2-poster-head {
          top: 15px;
          left: 15px;
          right: 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 10px 8px 8px;
          border-radius: 24px;
          background: linear-gradient(90deg, rgba(5,5,7,0.70), rgba(5,5,7,0.34), transparent);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .home-v2-author {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .home-v2-author img {
          width: 48px;
          height: 48px;
          border-radius: 18px;
          object-fit: cover;
          border: 1px solid rgba(255,255,255,0.24);
        }
        .home-v2-actions {
          right: 15px;
          top: 138px;
          width: 58px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          align-items: center;
          z-index: 6;
        }
        .home-v2-action {
          width: 58px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          color: white;
          text-shadow: 0 1px 8px rgba(0,0,0,0.85);
        }
        .home-v2-action button {
          width: 40px;
          height: 40px;
          border-radius: 999px;
          border: 0;
          background: transparent;
          color: white;
          display: grid;
          place-items: center;
          padding: 0;
          filter: drop-shadow(0 9px 14px rgba(0,0,0,0.70));
        }
        .home-v2-action svg {
          width: 27px;
          height: 27px;
          stroke-width: 2.45;
        }
        .home-v2-action span {
          min-width: 34px;
          padding: 3px 7px 4px;
          border-radius: 999px;
          font-size: 10px;
          line-height: 1;
          font-weight: 900;
          letter-spacing: 0;
          text-align: center;
          color: rgba(255,255,255,0.94);
          background: rgba(4,4,6,0.32);
          border: 1px solid rgba(255,255,255,0.075);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          box-shadow: 0 8px 18px rgba(0,0,0,0.34);
        }
        .home-v2-action .heart {
          color: #ff3d62;
          filter: drop-shadow(0 0 10px rgba(255,61,98,0.50)) drop-shadow(0 8px 14px rgba(0,0,0,0.72));
        }
        .home-v2-action .flame {
          color: #ff8b1f;
          filter: drop-shadow(0 0 10px rgba(255,122,0,0.48)) drop-shadow(0 8px 14px rgba(0,0,0,0.72));
        }
        .home-v2-action .comment {
          color: #f5f5f7;
          filter: drop-shadow(0 0 8px rgba(255,255,255,0.28)) drop-shadow(0 8px 14px rgba(0,0,0,0.72));
        }
        .home-v2-action .wow {
          font-size: 25px;
          line-height: 1;
          filter: drop-shadow(0 0 8px rgba(255,186,34,0.36)) drop-shadow(0 8px 14px rgba(0,0,0,0.72));
        }
        .home-v2-poster-copy {
          left: 18px;
          right: 92px;
          bottom: 88px;
          padding: 10px 12px;
          border-radius: 22px;
          background: linear-gradient(90deg, rgba(5,5,7,0.62), rgba(5,5,7,0.20), transparent);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
        .home-v2-poster-copy h1 {
          font-size: 25px;
          line-height: 1.03;
          font-weight: 950;
          letter-spacing: -0.04em;
          margin: 0 0 8px;
        }
        .home-v2-poster-copy p {
          margin: 0;
          font-size: 13px;
          line-height: 1.45;
          color: rgba(255,255,255,0.78);
        }
        .home-v2-reactions {
          left: 22px;
          right: 70px;
          bottom: 19px;
          height: 42px;
          border-radius: 22px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          align-items: center;
          overflow: hidden;
          background:
            linear-gradient(180deg, rgba(255,255,255,0.105), rgba(255,255,255,0.035)),
            rgba(6,6,8,0.64);
          border: 1px solid rgba(255,255,255,0.115);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.12),
            inset 0 -1px 0 rgba(255,47,175,0.16),
            0 14px 32px rgba(0,0,0,0.48),
            0 0 18px rgba(255,47,175,0.12);
          backdrop-filter: blur(18px) saturate(1.15);
          -webkit-backdrop-filter: blur(18px) saturate(1.15);
        }
        .home-v2-reactions::before {
          content: '';
          position: absolute;
          inset: auto 10px 0;
          height: 1px;
          border-radius: 999px;
          background: linear-gradient(90deg, rgba(255,122,0,0.78), rgba(255,47,175,0.74), rgba(122,43,255,0.68));
          opacity: 0.78;
        }
        .home-v2-reactions::after {
          content: '';
          position: absolute;
          inset: 7px auto 7px 50%;
          width: 1px;
          background: rgba(255,255,255,0.07);
          box-shadow: -78px 0 rgba(255,255,255,0.06), 78px 0 rgba(255,255,255,0.06);
        }
        .home-v2-reactions span {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          min-width: 0;
          font-size: 12px;
          font-weight: 880;
          color: rgba(255,255,255,0.92);
          text-shadow: 0 1px 10px rgba(0,0,0,0.72);
        }
        .home-v2-reactions .reaction-icon {
          display: grid;
          place-items: center;
          width: 22px;
          height: 22px;
          border-radius: 999px;
          font-size: 14px;
          line-height: 1;
          background: rgba(255,255,255,0.055);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.10);
        }
        .home-v2-reactions .fire .reaction-icon {
          color: #ff8b1f;
          background: rgba(255,122,0,0.105);
          filter: drop-shadow(0 0 7px rgba(255,122,0,0.38));
        }
        .home-v2-reactions .heart .reaction-icon {
          color: #ff3d62;
          background: rgba(255,47,105,0.105);
          filter: drop-shadow(0 0 7px rgba(255,47,105,0.34));
        }
        .home-v2-reactions .wow .reaction-icon {
          background: rgba(255,186,34,0.105);
          filter: drop-shadow(0 0 7px rgba(255,186,34,0.26));
        }
        .home-v2-reactions .share svg {
          width: 15px;
          height: 15px;
          color: rgba(255,255,255,0.90);
          filter: drop-shadow(0 0 6px rgba(122,43,255,0.32));
        }
        .home-v2-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: -2px 4px 22px;
          color: rgba(255,255,255,0.58);
          font-size: 12px;
          font-weight: 750;
        }
        .home-v2-liked-faces {
          display: flex;
          margin-right: 2px;
        }
        .home-v2-liked-faces img {
          width: 22px;
          height: 22px;
          border-radius: 999px;
          object-fit: cover;
          margin-left: -7px;
          border: 1.5px solid #050505;
        }
        .home-v2-liked-faces img:first-child {
          margin-left: 0;
        }
        .home-v2-nav {
          position: fixed;
          left: 50%;
          bottom: max(12px, env(safe-area-inset-bottom));
          transform: translateX(-50%);
          width: min(398px, calc(100vw - 28px));
          height: 70px;
          border-radius: 28px;
          display: grid;
          grid-template-columns: 1fr 1fr 82px 1fr 1fr;
          align-items: center;
          padding: 0 12px;
          z-index: 20;
          background: rgba(14,13,18,0.82);
          border: 1px solid rgba(255,255,255,0.10);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.10), 0 18px 42px rgba(0,0,0,0.58), 0 0 26px rgba(255,47,175,0.12);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }
        .home-v2-nav button {
          border: 0;
          background: transparent;
          color: rgba(255,255,255,0.60);
          display: grid;
          place-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 800;
        }
        .home-v2-nav button.icon-only {
          gap: 0;
        }
        .home-v2-nav button.active {
          color: #ff7a00;
          filter: drop-shadow(0 0 10px rgba(255,122,0,0.42));
        }
        .home-v2-nav-plus {
          width: 70px;
          height: 70px;
          border-radius: 999px;
          margin: -22px auto 0;
          display: grid;
          place-items: center;
          color: #fff;
          background: radial-gradient(circle at 36% 24%, rgba(255,255,255,0.42), transparent 24%),
            linear-gradient(145deg, #ff7a00, #ff2faf 56%, #7a2bff);
          border: 3px solid rgba(255,255,255,0.10);
          box-shadow: 0 16px 34px rgba(0,0,0,0.55), 0 0 28px rgba(255,47,175,0.36), inset 0 1px 0 rgba(255,255,255,0.38);
        }
      `}</style>

      <div className="home-v2-shell">
        <header className="home-v2-top">
          <button aria-label="Settings" type="button" onClick={() => navigate('/settings')} style={{ background: 'transparent', border: 0, padding: 0 }}>
            <span className="home-v2-s-logo"><Zap fill="currentColor" /></span>
          </button>
          <div className="home-v2-wordmark">SPICEY</div>
          <div className="home-v2-top-actions">
            <div className="home-v2-badge-wrap">
              <V2IconButton label="Alerts"><Bell size={20} /></V2IconButton>
              <span className="home-v2-badge">8</span>
            </div>
          </div>
        </header>

        <div className="home-v2-search">
          <Search size={19} color="rgba(255,255,255,0.62)" />
          <span>Search creators, moods, places...</span>
          <V2IconButton label="Filter"><SlidersHorizontal size={18} /></V2IconButton>
        </div>

        <div className="home-v2-mini-title">
          <h2>Moments</h2>
          <span>See all ›</span>
        </div>
        <section className="home-v2-stories" aria-label="Story portals">
          <div className="home-v2-story">
            <div className="home-v2-story-ring home-v2-map-portal"><MapPin size={25} /></div>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.76)' }}>Spicey Map</span>
          </div>
          <div className="home-v2-story">
            <div className="home-v2-story-ring" style={{ display: 'grid', placeItems: 'center' }}><Plus size={28} /></div>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.76)' }}>Your Moment</span>
          </div>
          {stories.map(story => (
            <div className="home-v2-story" key={story.name}>
              <div className="home-v2-story-ring"><img src={story.avatar} alt="" /></div>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.76)' }}>{story.name}</span>
            </div>
          ))}
        </section>

        <section>
          <div className="home-v2-section-title">
            <h2><Flame size={19} color="#ff7a00" />Spicey Hot</h2>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.62)' }}>See all ›</span>
          </div>
          <div className="home-v2-trends">
            {trends.map(item => (
              <article className="home-v2-trend" key={item.tag} style={{ '--accent': item.color }}>
                <img src={item.image} alt="" />
                <div className="home-v2-trend-label">
                  <strong style={{ fontSize: 15 }}>{item.tag}</strong>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.70)', marginTop: 4 }}>{item.count}</div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {posters.map((poster, index) => (
          <React.Fragment key={poster.handle}>
            <article className="home-v2-poster">
              <img className="home-v2-hero" src={poster.image} alt="" />
              <svg className="home-v2-electric" viewBox="0 0 100 140" preserveAspectRatio="none" aria-hidden="true">
                <path d="M 2 13 C 21 2, 41 12, 55 6 C 73 -2, 88 8, 98 3" stroke="rgba(255,122,0,0.78)" />
                <path d="M 95 12 C 84 29, 99 43, 90 58 C 77 80, 96 99, 87 119 C 84 127, 90 134, 96 138" stroke="rgba(255,47,175,0.76)" />
                <path d="M 6 131 C 26 121, 47 139, 65 127 C 76 119, 87 123, 95 113" stroke="rgba(122,43,255,0.62)" />
              </svg>
              <div className="home-v2-poster-head">
                <div className="home-v2-author">
                  <img src={poster.avatar} alt="" />
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 15 }}>{poster.author}</div>
                    <div style={{ color: 'rgba(255,255,255,0.62)', fontSize: 12 }}>{poster.handle} · {index === 0 ? 'now' : `${index + 3}m ago`}</div>
                  </div>
                </div>
              </div>

              <div className="home-v2-actions">
                <div className="home-v2-action"><button className="heart" aria-label="Like"><Heart fill="currentColor" /></button><span>{poster.likes}</span></div>
                <div className="home-v2-action"><button className="flame" aria-label="Fire"><Flame /></button><span>{poster.fire}</span></div>
                <div className="home-v2-action"><button className="comment" aria-label="Comment"><MessageCircle /></button><span>{poster.comments}</span></div>
                <div className="home-v2-action"><button className="wow" aria-label="Wow">😮</button><span>{index === 0 ? '96' : '44'}</span></div>
              </div>

              <div className="home-v2-poster-copy">
                <h1>{poster.title}</h1>
                <p>{poster.caption}</p>
              </div>

              <div className="home-v2-reactions">
                <span className="fire"><span className="reaction-icon">🔥</span>{poster.fire}</span>
                <span className="heart"><span className="reaction-icon">❤️</span>{poster.likes}</span>
                <span className="wow"><span className="reaction-icon">😮</span>{poster.comments}</span>
                <span className="share"><span className="reaction-icon"><Share2 /></span>{poster.shares}</span>
              </div>
            </article>
            <div className="home-v2-meta">
              <div className="home-v2-liked-faces">
                {stories.slice(0, 4).map(story => <img key={story.name} src={story.avatar} alt="" />)}
              </div>
              <span>Liked by {stories[index % stories.length].name} and {poster.likes} others</span>
            </div>
          </React.Fragment>
        ))}
      </div>
      <nav className="home-v2-nav" aria-label="Home Feed V2 navigation">
        <button className="active icon-only" type="button" aria-label="Home"><Home size={24} fill="currentColor" /></button>
        <button className="icon-only" type="button" aria-label="Messages"><MessageCircle size={24} /></button>
        <div className="home-v2-nav-plus"><Plus size={34} /></div>
        <button type="button"><Zap size={24} />AI</button>
        <button className="icon-only" type="button" aria-label="Profile"><User size={24} /></button>
      </nav>
    </main>
  );
}
