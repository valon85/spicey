import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BEAUTY_PRESETS } from './beautyPresets';

const CATEGORIES = [
  { id: 'face', label: '😊 Face', ids: ['smooth','blemish','sharpen','eyes','glow','beauty'] },
  { id: 'hair', label: '💇 Hair', ids: ['hair_dark','hair_brown','hair_blonde','hair_red','hair_platinum','hair_colorful'] },
  { id: 'color', label: '🎨 Effects', ids: ['fx_warm','fx_cool','fx_bw','fx_vintage','fx_neon','fx_hdr'] },
];

export default function BeautyPanel({ selectedBeauty, setSelectedBeauty, surfaceBg, surfaceBorder, isLight }) {
  const [activeCategory, setActiveCategory] = useState('face');

  const cat = CATEGORIES.find(c => c.id === activeCategory);
  const presets = BEAUTY_PRESETS.filter(b => cat.ids.includes(b.id));

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: isLight ? 'rgba(40,20,70,0.48)' : 'rgba(255,255,255,0.4)' }}>
          ✨ AI Enhancements
        </p>
        {selectedBeauty && (
          <button onClick={() => setSelectedBeauty(null)}
            className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.1)' }}>
            ✕ Clear
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 mb-3">
        {CATEGORIES.map(c => (
          <motion.button key={c.id} whileTap={{ scale: 0.94 }}
            onClick={() => setActiveCategory(c.id)}
            className="flex-1 py-2 rounded-xl text-[11px] font-bold transition-all"
            style={activeCategory === c.id ? {
              background: 'linear-gradient(135deg, rgba(255,85,0,0.25), rgba(139,92,246,0.25))',
              border: '1.5px solid rgba(255,85,0,0.5)',
              color: 'white',
            } : {
              background: surfaceBg,
              border: `1px solid ${surfaceBorder}`,
              color: isLight ? 'rgba(40,20,70,0.55)' : 'rgba(255,255,255,0.45)',
            }}>
            {c.label}
          </motion.button>
        ))}
      </div>

      {/* Presets grid */}
      <div className="grid grid-cols-3 gap-2">
        {presets.map(b => {
          const active = selectedBeauty === b.id;
          return (
            <motion.button key={b.id} whileTap={{ scale: 0.93 }}
              onClick={() => setSelectedBeauty(active ? null : b.id)}
              className="flex flex-col items-center gap-1 px-2 py-3 rounded-2xl text-center transition-all"
              style={active ? {
                background: `${b.color}28`,
                border: `1.5px solid ${b.color}99`,
                boxShadow: `0 0 16px ${b.color}55`,
              } : {
                background: surfaceBg,
                border: `1px solid ${surfaceBorder}`,
              }}>
              <span className="text-2xl leading-none">{b.emoji}</span>
              <span className="text-[10px] font-bold leading-tight mt-0.5"
                style={{ color: active ? b.color : (isLight ? 'rgba(40,20,70,0.7)' : 'rgba(255,255,255,0.7)') }}>
                {b.label}
              </span>
              <span className="text-[9px] leading-tight text-center"
                style={{ color: isLight ? 'rgba(40,20,70,0.38)' : 'rgba(255,255,255,0.3)' }}>
                {b.desc}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}