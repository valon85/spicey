import React, { useState, useEffect } from 'react';
import { Flame, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

// Utility to ensure array safety
const asArray = (v) => Array.isArray(v) ? v : [];

const TRENDING_TOPICS = [
  {
    tag: '#SpiceyNight',
    posts: '24.8K',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=700&h=900&fit=crop&q=92',
    accent: '#FF7A00',
    accent2: '#FF7A00',
    glow: 'rgba(255, 122, 0, 0.16)',
    wash: 'rgba(255, 122, 0, 0.26)',
  },
  {
    tag: '#UrbanVibes',
    posts: '18.2K',
    image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=700&h=900&fit=crop&q=92',
    accent: '#FF2FAF',
    accent2: '#FF2FAF',
    glow: 'rgba(255, 47, 175, 0.16)',
    wash: 'rgba(255, 47, 175, 0.26)',
  },
  {
    tag: '#GlowUp',
    posts: '15.7K',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=700&h=900&fit=crop&q=92',
    accent: '#7A2BFF',
    accent2: '#7A2BFF',
    glow: 'rgba(122, 43, 255, 0.16)',
    wash: 'rgba(122, 43, 255, 0.26)',
  },
  {
    tag: '#SummerVibes',
    posts: '13.4K',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=700&h=900&fit=crop&q=92',
    accent: '#FF4D00',
    accent2: '#FF4D00',
    glow: 'rgba(255, 77, 0, 0.15)',
    wash: 'rgba(255, 77, 0, 0.24)',
  },
  {
    tag: '#AfterDark',
    posts: '12.3K',
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=700&h=900&fit=crop&q=92',
    accent: '#A855F7',
    accent2: '#A855F7',
    glow: 'rgba(168, 85, 247, 0.15)',
    wash: 'rgba(168, 85, 247, 0.24)',
  },
];

const topCuts = [
  'polygon(0 10%, 16% 3%, 38% 5%, 58% 1%, 82% 4%, 100% 11%, 100% 100%, 0 100%)',
  'polygon(0 8%, 14% 5%, 34% 7%, 54% 2%, 78% 0, 100% 8%, 100% 100%, 0 100%)',
  'polygon(0 12%, 20% 4%, 42% 2%, 64% 7%, 86% 3%, 100% 9%, 100% 100%, 0 100%)',
];

export default function TrendingNow({ onTagClick, activeTag }) {
  const [isLight, setIsLight] = React.useState(false);

  React.useEffect(() => {
    const check = () => setIsLight(document.documentElement.classList.contains('light-mode'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const handleCardClick = (tag) => {
    if (onTagClick) {
      onTagClick(tag);
    }
  };

  return (
    <div className="px-4 pt-4 pb-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5" style={{ color: '#FF7A00', filter: 'drop-shadow(0 0 10px rgba(255, 122, 0, 0.42))' }} />
          <span className="text-[19px] font-extrabold tracking-[-0.03em]" style={{ color: isLight ? '#111111' : '#FFFFFF' }}>
            Spicey Trending
          </span>
        </div>
        <button className="flex items-center gap-1 text-[13px] font-semibold"
          style={{ color: isLight ? '#7C3AED' : 'rgba(255,255,255,0.82)' }}>
          See all
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Cards */}
      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-4 pt-1" style={{ scrollbarWidth: 'none' }}>
        {asArray(TRENDING_TOPICS).map((topic, i) => (
          <motion.button
            key={topic.tag}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => handleCardClick(topic.tag)}
            className="flex-shrink-0 relative overflow-hidden cursor-pointer transition-transform"
            style={{
              width: 94,
              height: 116,
              borderRadius: 20,
              clipPath: topCuts[i % topCuts.length],
              border: activeTag === topic.tag ? `1.5px solid ${topic.accent}` : '1px solid rgba(255,255,255,0.10)',
              boxShadow: isLight
                ? `0 12px 28px rgba(38, 10, 30, 0.12), 0 0 0 1px rgba(255,255,255,0.88)`
                : `0 16px 30px rgba(0,0,0,0.52), 0 0 10px ${topic.glow}, 0 0 18px ${topic.glow}, inset 0 1px 0 rgba(255,255,255,0.12)`,
              background: isLight
                ? `linear-gradient(145deg, rgba(255,255,255,0.72), ${topic.glow})`
                : `linear-gradient(145deg, rgba(255,255,255,0.045), ${topic.glow})`,
            }}>
            <span
              aria-hidden="true"
              className="absolute -inset-px pointer-events-none"
              style={{
                borderRadius: 'inherit',
                background: `linear-gradient(145deg, ${topic.accent} 0%, rgba(255,255,255,0.10) 28%, transparent 62%, ${topic.accent} 100%)`,
                opacity: 0.28,
                mixBlendMode: 'screen',
              }}
            />
            <span
              aria-hidden="true"
              className="absolute pointer-events-none"
              style={{
                inset: 1,
                borderRadius: 18,
                border: `1px solid ${topic.accent}`,
                opacity: 0.58,
                boxShadow: `inset 0 0 12px ${topic.glow}, inset 0 0 0 1px rgba(255,255,255,0.08), 0 0 8px ${topic.glow}`,
                clipPath: topCuts[i % topCuts.length],
                zIndex: 7,
              }}
            />
            {/* Background Image - visible on right side */}
            <img
              src={topic.image}
              alt={topic.tag}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ filter: isLight ? 'saturate(1.1) contrast(1.04)' : 'brightness(0.78) saturate(1.28) contrast(1.1)' }}
            />
            {/* Gradient Overlay - fades from left to right, more transparent */}
            <div
              className="absolute inset-0"
              style={{
                background: [
                  `linear-gradient(135deg, ${topic.wash} 0%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0.60) 100%)`,
                  `radial-gradient(ellipse at 50% 18%, ${topic.accent} 0%, transparent 68%)`,
                  `radial-gradient(circle at 18% 68%, ${topic.accent} 0%, transparent 58%)`,
                  `linear-gradient(180deg, rgba(0,0,0,0.02) 0%, transparent 42%, rgba(0,0,0,0.84) 100%)`,
                ].join(', '),
                opacity: isLight ? 0.34 : 0.42,
              }}
            />
            <div
              aria-hidden="true"
              className="absolute left-[-12px] right-[-12px] top-[-2px] h-10"
              style={{
                background: `linear-gradient(90deg, transparent, ${topic.accent}, ${topic.accent}, transparent)`,
                opacity: 0.22,
                filter: 'blur(8px)',
                transform: 'translateY(-12px) rotate(-3deg)',
              }}
            />
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-16"
              style={{
                background: `radial-gradient(ellipse at 45% 0%, ${topic.accent2} 0%, transparent 58%)`,
                opacity: 0.14,
              }}
            />
            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end px-2.5 pb-2.5 text-left" style={{ zIndex: 8 }}>
              <span className="text-[10.5px] font-semibold text-white leading-tight tracking-[-0.02em]" style={{ textShadow: '0 3px 14px rgba(0,0,0,0.72)' }}>
                {topic.tag}
              </span>
              <p className="text-[8.5px] font-normal text-white/80 mt-0.5">
                {topic.posts}
              </p>
            </div>
            <span
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                borderRadius: 'inherit',
                boxShadow: `inset 0 0 26px ${topic.glow}, inset 0 0 0 1px rgba(255,255,255,0.08), inset 0 -34px 40px rgba(0,0,0,0.42)`,
              }}
            />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
