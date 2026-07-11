import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, X, Star, Search, ChevronRight } from 'lucide-react';

// ── Effect definitions ─────────────────────────────────────────────────────
// Each effect has a CSS filter string (for live preview on the video element)
// and a canvas pipeline descriptor for recording.
export const REEL_EFFECTS = [
  // ── No effect ──
  { id: 'none', label: 'Normal', emoji: '✨', category: 'basic',
    css: 'none', description: 'No filter' },

  // ── Beauty / Skin ──
  { id: 'beauty', label: 'Beauty', emoji: '💄', category: 'beauty',
    css: 'brightness(1.08) contrast(0.92) saturate(1.1)',
    description: 'Smooth skin & bright' },
  { id: 'glow', label: 'Glow', emoji: '✨', category: 'beauty',
    css: 'brightness(1.18) contrast(0.88) saturate(1.15) blur(0px)',
    description: 'Soft radiant glow' },
  { id: 'porcelain', label: 'Porcelain', emoji: '🪞', category: 'beauty',
    css: 'brightness(1.15) contrast(0.85) saturate(0.95)',
    description: 'Porcelain skin tone' },

  // ── Color Grading ──
  { id: 'cinematic', label: 'Cinematic', emoji: '🎬', category: 'cinematic',
    css: 'contrast(1.2) saturate(0.85) brightness(0.92)',
    description: 'Hollywood look' },
  { id: 'golden_hour', label: 'Golden Hour', emoji: '🌅', category: 'cinematic',
    css: 'sepia(0.35) saturate(1.6) brightness(1.08) hue-rotate(-8deg)',
    description: 'Warm golden tones' },
  { id: 'cool_blue', label: 'Cool Blue', emoji: '🧊', category: 'cinematic',
    css: 'hue-rotate(20deg) saturate(1.25) brightness(1.05) contrast(1.1)',
    description: 'Cool toned mood' },
  { id: 'moody', label: 'Moody', emoji: '🌑', category: 'cinematic',
    css: 'contrast(1.35) brightness(0.82) saturate(0.75)',
    description: 'Dark & moody' },
  { id: 'teal_orange', label: 'Teal & Orange', emoji: '🎞', category: 'cinematic',
    css: 'contrast(1.15) saturate(1.4) brightness(0.95) hue-rotate(5deg)',
    description: 'Blockbuster grade' },

  // ── Vintage ──
  { id: 'vintage', label: 'Vintage', emoji: '📷', category: 'vintage',
    css: 'sepia(0.55) saturate(1.2) contrast(0.95) brightness(0.95)',
    description: 'Classic film look' },
  { id: 'kodak', label: 'Kodak', emoji: '🎞', category: 'vintage',
    css: 'sepia(0.2) saturate(1.5) contrast(1.05) brightness(1.02) hue-rotate(-5deg)',
    description: 'Warm film grain' },
  { id: 'polaroid', label: 'Polaroid', emoji: '🖼️', category: 'vintage',
    css: 'sepia(0.3) saturate(1.3) contrast(0.9) brightness(1.1)',
    description: 'Instant camera vibe' },
  { id: 'noir', label: 'Noir', emoji: '🎭', category: 'vintage',
    css: 'grayscale(1) contrast(1.3) brightness(0.88)',
    description: 'Black & white drama' },

  // ── Neon / Vivid ──
  { id: 'neon', label: 'Neon', emoji: '🌈', category: 'vivid',
    css: 'saturate(2.2) contrast(1.25) brightness(1.05) hue-rotate(10deg)',
    description: 'Electric neon pop' },
  { id: 'vivid', label: 'Vivid', emoji: '🔥', category: 'vivid',
    css: 'saturate(1.9) contrast(1.15) brightness(1.05)',
    description: 'Ultra vivid colors' },
  { id: 'candy', label: 'Candy', emoji: '🍬', category: 'vivid',
    css: 'saturate(2.0) brightness(1.12) contrast(0.95) hue-rotate(330deg)',
    description: 'Sweet candy colors' },
  { id: 'cyberpunk', label: 'Cyberpunk', emoji: '🤖', category: 'vivid',
    css: 'hue-rotate(200deg) saturate(2.5) contrast(1.3) brightness(0.9)',
    description: 'Futuristic neon city' },

  // ── Soft / Pastel ──
  { id: 'dream', label: 'Dream', emoji: '☁️', category: 'soft',
    css: 'brightness(1.15) saturate(0.85) contrast(0.88)',
    description: 'Dreamy soft haze' },
  { id: 'rose', label: 'Rose', emoji: '🌸', category: 'soft',
    css: 'sepia(0.15) hue-rotate(330deg) saturate(1.4) brightness(1.08)',
    description: 'Rosy pink tones' },
  { id: 'lavender', label: 'Lavender', emoji: '💜', category: 'soft',
    css: 'hue-rotate(260deg) saturate(1.3) brightness(1.05) contrast(0.95)',
    description: 'Soft purple hues' },
  { id: 'fade', label: 'Fade', emoji: '🌫', category: 'soft',
    css: 'saturate(0.6) brightness(1.18) contrast(0.85)',
    description: 'Washed out fade' },

  // ── Fun ──
  { id: 'retro_tv', label: 'Retro TV', emoji: '📺', category: 'fun',
    css: 'contrast(1.5) brightness(0.85) saturate(0.4)',
    description: 'Old CRT television' },
  { id: 'infrared', label: 'Infrared', emoji: '🔴', category: 'fun',
    css: 'hue-rotate(120deg) saturate(2) contrast(1.2)',
    description: 'Infrared camera' },
  { id: 'matrix', label: 'Matrix', emoji: '💻', category: 'fun',
    css: 'hue-rotate(90deg) saturate(3) contrast(1.4) brightness(0.85)',
    description: 'Green matrix code' },
  { id: 'xray', label: 'X-Ray', emoji: '🦴', category: 'fun',
    css: 'invert(0.85) grayscale(0.6) contrast(1.4)',
    description: 'X-ray vision' },
];

export const EFFECT_CATEGORIES = [
  { id: 'all',      label: 'All',      emoji: '⚡' },
  { id: 'beauty',   label: 'Beauty',   emoji: '💄' },
  { id: 'cinematic',label: 'Cinematic',emoji: '🎬' },
  { id: 'vintage',  label: 'Vintage',  emoji: '📷' },
  { id: 'vivid',    label: 'Vivid',    emoji: '🌈' },
  { id: 'soft',     label: 'Soft',     emoji: '☁️' },
  { id: 'fun',      label: 'Fun',      emoji: '🎭' },
];

// Mini camera thumbnail showing the filter applied via CSS
function EffectThumbnail({ effect, isActive, videoRef, onClick }) {
  return (
    <button onClick={() => onClick(effect)}
      className="flex flex-col items-center gap-1.5 flex-shrink-0"
      style={{ width: 68 }}>
      <div className="relative rounded-xl overflow-hidden"
        style={{
          width: 60, height: 80,
          border: isActive ? '2.5px solid #e91e8c' : '1.5px solid rgba(255,255,255,0.12)',
          boxShadow: isActive ? '0 0 14px rgba(233,30,140,0.7)' : 'none',
        }}>
        {/* Show a colored swatch as effect preview */}
        <div className="w-full h-full flex items-center justify-center text-2xl"
          style={{
            background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 100%)',
            filter: effect.css === 'none' ? 'none' : effect.css,
          }}>
          {effect.emoji}
        </div>
        {isActive && (
          <div className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center"
            style={{ background: '#e91e8c' }}>
            <span style={{ fontSize: 9, color: 'white', fontWeight: 'bold' }}>✓</span>
          </div>
        )}
      </div>
      <span className="text-[10px] font-semibold text-center leading-tight"
        style={{ color: isActive ? '#e91e8c' : 'rgba(255,255,255,0.6)', maxWidth: 64 }}>
        {effect.label}
      </span>
    </button>
  );
}

export default function ReelEffectsPicker({ open, onClose, activeEffect, onSelect }) {
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = REEL_EFFECTS.filter(e => {
    if (e.id === 'none') return true;
    const matchCat = category === 'all' || e.category === category;
    const matchSearch = !search || e.label.toLowerCase().includes(search.toLowerCase()) || e.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Tap outside to close */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-[70]" onClick={onClose}
            style={{ background: 'transparent' }} />

          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            onClick={e => e.stopPropagation()}
            className="absolute bottom-0 left-0 right-0 z-[71] rounded-t-3xl"
            style={{
              background: 'rgba(10,4,20,0.97)',
              border: '1px solid rgba(255,255,255,0.1)',
              paddingBottom: 'max(28px, env(safe-area-inset-bottom, 16px))',
            }}>

            {/* Handle */}
            <div className="w-10 h-1 rounded-full mx-auto mt-3 mb-2" style={{ background: 'rgba(255,255,255,0.2)' }} />

            {/* Header */}
            <div className="flex items-center justify-between px-4 mb-3">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-pink-400" />
                <span className="text-white font-bold text-sm">Effects</span>
                {activeEffect && activeEffect.id !== 'none' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ background: 'rgba(233,30,140,0.25)', color: '#e91e8c', border: '1px solid rgba(233,30,140,0.4)' }}>
                    {activeEffect.label}
                  </span>
                )}
              </div>
              <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.08)' }}>
                <X className="w-3.5 h-3.5 text-white/60" />
              </button>
            </div>

            {/* Search */}
            <div className="px-4 mb-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Search className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search effects..."
                  className="flex-1 bg-transparent text-white text-xs outline-none placeholder:text-white/30"
                  style={{ fontSize: 13 }} />
              </div>
            </div>

            {/* Category pills */}
            <div className="flex gap-2 px-4 mb-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {EFFECT_CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => setCategory(cat.id)}
                  className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                  style={{
                    background: category === cat.id ? 'rgba(233,30,140,0.25)' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${category === cat.id ? 'rgba(233,30,140,0.6)' : 'rgba(255,255,255,0.1)'}`,
                    color: category === cat.id ? '#e91e8c' : 'rgba(255,255,255,0.5)',
                  }}>
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>

            {/* Effects grid — horizontal scroll */}
            <div className="flex gap-3 px-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              {filtered.map(effect => (
                <EffectThumbnail
                  key={effect.id}
                  effect={effect}
                  isActive={activeEffect?.id === effect.id}
                  onSelect={onSelect}
                  onClick={onSelect}
                />
              ))}
            </div>

            {/* Active effect description */}
            {activeEffect && activeEffect.id !== 'none' && (
              <div className="mx-4 mt-3 px-3 py-2 rounded-xl flex items-center gap-2"
                style={{ background: 'rgba(233,30,140,0.1)', border: '1px solid rgba(233,30,140,0.2)' }}>
                <span className="text-lg">{activeEffect.emoji}</span>
                <div>
                  <p className="text-white text-xs font-bold">{activeEffect.label}</p>
                  <p className="text-white/50 text-[10px]">{activeEffect.description}</p>
                </div>
                <button onClick={() => onSelect(REEL_EFFECTS[0])} className="ml-auto text-white/40 hover:text-white/70">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}