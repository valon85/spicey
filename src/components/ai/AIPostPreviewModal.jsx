import React, { useState } from 'react';
import { X, Send, Edit3, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TYPE_CONFIG = {
  feed:  { label: 'Post to Feed',   icon: '📸', gradient: 'linear-gradient(135deg, #ff5500, #e91e8c)', glow: 'rgba(255,85,0,0.4)' },
  story: { label: 'Post to Moment',  icon: '📖', gradient: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)', glow: 'rgba(139,92,246,0.4)' },
  reel:  { label: 'Create Spicey Clip',    icon: '🎬', gradient: 'linear-gradient(135deg, #7c3aed, #e91e8c)', glow: 'rgba(124,58,237,0.4)' },
};

export default function AIPostPreviewModal({ type, content, mediaUrl, mediaType, isLight, onClose, onPublish }) {
  const [caption, setCaption] = useState(content);
  const [editing, setEditing] = useState(false);

  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.feed;

  const bg = isLight ? 'rgba(255,255,255,0.98)' : 'rgba(12,6,22,0.98)';
  const fg = isLight ? 'hsl(270,20%,12%)' : 'white';
  const fgSub = isLight ? 'rgba(40,20,70,0.5)' : 'rgba(255,255,255,0.45)';
  const surfaceBg = isLight ? 'rgba(200,170,240,0.12)' : 'rgba(255,255,255,0.06)';
  const surfaceBorder = isLight ? 'rgba(160,100,220,0.2)' : 'rgba(255,255,255,0.1)';

  return (
    <AnimatePresence>
      <>
        {/* Backdrop */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }} />

        {/* Sheet */}
        <motion.div
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl"
          style={{ background: bg, border: `1px solid ${surfaceBorder}`, maxHeight: '88dvh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

          {/* Handle */}
          <div className="w-10 h-1 rounded-full mx-auto mt-3 mb-1" style={{ background: 'rgba(128,128,128,0.3)' }} />

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">{cfg.icon}</span>
              <div>
                <p className="font-bold text-sm" style={{ color: fg }}>Preview & Publish</p>
                <p className="text-xs" style={{ color: fgSub }}>{cfg.label}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: surfaceBg }}>
              <X className="w-4 h-4" style={{ color: fgSub }} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-4" style={{ WebkitOverflowScrolling: 'touch' }}>

            {/* Media preview */}
            {mediaUrl && (
              <div className="rounded-2xl overflow-hidden" style={{ maxHeight: 240 }}>
                {mediaType === 'video'
                  ? <video src={mediaUrl} controls className="w-full" style={{ maxHeight: 240, objectFit: 'cover' }} />
                  : <img src={mediaUrl} alt="" className="w-full" style={{ maxHeight: 240, objectFit: 'cover' }} />}
              </div>
            )}

            {/* Caption editor */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: fgSub }}>Caption</p>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setEditing(e => !e)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold"
                  style={{ background: surfaceBg, border: `1px solid ${surfaceBorder}`, color: editing ? '#8b5cf6' : fgSub }}>
                  {editing ? <><Check className="w-3 h-3" /> Done</> : <><Edit3 className="w-3 h-3" /> Edit</>}
                </motion.button>
              </div>

              {editing ? (
                <textarea
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  autoFocus
                  className="w-full rounded-2xl px-4 py-3 text-sm outline-none resize-none"
                  rows={6}
                  style={{
                    background: surfaceBg,
                    border: `1px solid rgba(139,92,246,0.4)`,
                    color: fg,
                    fontSize: 15,
                    lineHeight: 1.6,
                  }}
                />
              ) : (
                <div className="rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap"
                  style={{ background: surfaceBg, border: `1px solid ${surfaceBorder}`, color: fg }}>
                  {caption}
                </div>
              )}
            </div>

            {/* Type selector */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: fgSub }}>Publish as</p>
              <div className="flex gap-2">
                {Object.entries(TYPE_CONFIG).map(([key, c]) => (
                  <motion.button key={key} whileTap={{ scale: 0.93 }}
                    onClick={() => onPublish({ type: key, caption, mediaUrl, mediaType })}
                    className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl text-xs font-bold text-white"
                    style={{
                      background: key === type ? c.gradient : 'rgba(255,255,255,0.06)',
                      border: key === type ? 'none' : `1px solid rgba(255,255,255,0.1)`,
                      color: key === type ? 'white' : fgSub,
                      boxShadow: key === type ? `0 0 16px ${c.glow}` : 'none',
                    }}>
                    <span className="text-base">{c.icon}</span>
                    {c.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Publish CTA */}
          <div className="px-5 pb-8 pt-3" style={{ borderTop: `1px solid ${surfaceBorder}` }}>
            <motion.button whileTap={{ scale: 0.97 }}
              onClick={() => onPublish({ type, caption, mediaUrl, mediaType })}
              className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2"
              style={{ background: cfg.gradient, boxShadow: `0 0 24px ${cfg.glow}` }}>
              <Send className="w-4 h-4" />
              {cfg.label}
            </motion.button>
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  );
}