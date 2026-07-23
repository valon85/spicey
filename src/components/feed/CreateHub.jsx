import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const BTN_SIZE = 44;
const ORIGIN_BOTTOM = 118;

// Fan spread upward: 150° (upper-left) → 30° (upper-right)
const ANGLES_DEG = [158, 132, 106, 80, 54, 28];
const RADIUS = 155;

function degToRad(d) { return (d * Math.PI) / 180; }

const ITEM_DEFS = [
  { label: 'Text',   path: '/create-text',   bg: 'linear-gradient(135deg, #FF6B35 0%, #FF2D55 100%)', shadow: 'rgba(255,80,60,0.6)',    icon: 'text' },
  { label: 'Video',  path: '/create-video',  bg: 'linear-gradient(135deg, #B44FFF 0%, #7C3AED 100%)', shadow: 'rgba(180,79,255,0.6)',  icon: 'video' },
  { label: 'Camera', path: '/create',        bg: 'linear-gradient(135deg, #FF4D8D 0%, #C2006B 100%)', shadow: 'rgba(255,45,141,0.65)', icon: 'camera' },
  { label: 'Short Film', path: '/short-film', bg: 'linear-gradient(135deg, #FF9500 0%, #FF2D8D 50%, #8F3CFF 100%)', shadow: 'rgba(255,45,141,0.72)', icon: 'film' },
  { label: 'Photo',  path: '/create-photo',  bg: 'linear-gradient(135deg, #FF7043 0%, #FF2D8D 100%)', shadow: 'rgba(255,107,67,0.6)',  icon: 'photo' },
  { label: 'Live',   path: '/live',          bg: 'linear-gradient(135deg, #9B59F5 0%, #6D28D9 100%)', shadow: 'rgba(139,92,246,0.6)',  icon: 'live' },
];

// Precompute x/y offsets for each item
const ITEMS = ITEM_DEFS.map((item, i) => {
  const angle = ANGLES_DEG[i];
  const rad = degToRad(angle);
  return {
    ...item,
    x: Math.cos(rad) * RADIUS,
    y: -Math.sin(rad) * RADIUS, // negative because CSS y goes down
  };
});

function IconSVG({ type }) {
  const s = { width: 24, height: 24 };
  const glow = { filter: 'drop-shadow(0 0 5px rgba(255,255,255,1)) drop-shadow(0 0 10px rgba(255,255,255,0.7))' };
  if (type === 'text') return (
    <svg viewBox="0 0 24 24" {...s} fill="white" style={glow}>
      <path d="M5 4v3h5.5v12h3V7H19V4z"/>
    </svg>
  );
  if (type === 'video') return (
    <svg viewBox="0 0 24 24" {...s} fill="white" style={glow}>
      <path d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z"/>
    </svg>
  );
  if (type === 'camera') return (
    <svg viewBox="0 0 24 24" {...s} fill="white" style={glow}>
      <path d="M20 5h-3.17L15 3H9L7.17 5H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm-8 13a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/>
      <circle cx="12" cy="13" r="2.2" fill="rgba(255,255,255,0.5)"/>
    </svg>
  );
  if (type === 'film') return (
    <svg viewBox="0 0 24 24" {...s} fill="none" stroke="white" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={glow}>
      <rect x="3" y="5" width="18" height="14" rx="2.2" />
      <path d="M7 5v14M17 5v14" />
      <path d="M5 8h2M5 12h2M5 16h2M17 8h2M17 12h2M17 16h2" />
      <path d="M11 9.5l4 2.5-4 2.5z" fill="white" stroke="none" />
    </svg>
  );
  if (type === 'photo') return (
    <svg viewBox="0 0 24 24" {...s} fill="white" style={glow}>
      <path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM8.5 7a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM5 17l4.5-5.5 3 3.5 4-5 5 7H5z"/>
    </svg>
  );
  if (type === 'live') return (
    <svg viewBox="0 0 24 24" {...s} fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" style={glow}>
      <circle cx="12" cy="12" r="2.2" fill="white" stroke="none"/>
      <path d="M8.5 8.5a5 5 0 0 0 0 7"/>
      <path d="M15.5 8.5a5 5 0 0 1 0 7"/>
      <path d="M5.5 5.5a9 9 0 0 0 0 13"/>
      <path d="M18.5 5.5a9 9 0 0 1 0 13"/>
    </svg>
  );
  return null;
}

export default function CreateHub({ open, onClose }) {
  const navigate = useNavigate();
  const winW = typeof window !== 'undefined' ? window.innerWidth : 390;
  const winH = typeof window !== 'undefined' ? window.innerHeight : 844;

  // Origin sits just above the floating navbar so the create fan is tappable.
  const ox = winW / 2;
  const oy = winH - ORIGIN_BOTTOM;

  const handleSelect = (item) => {
    onClose();
    setTimeout(() => navigate(item.path), 80);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Transparent backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10000,
              background: 'rgba(0,0,0,0.35)',
            }}
          />

          {/* Large fan glow — covers the whole arc area */}
          <div style={{
            position: 'fixed',
            left: ox,
            top: oy,
            width: 0,
            height: 0,
            zIndex: 10001,
            pointerEvents: 'none',
          }}>
            {/* Wide sun-like glow spreading upward with pink/purple mix */}
            <div style={{
              position: 'absolute',
              width: 750,
              height: 600,
              borderRadius: '50%',
              transform: 'translate(-50%, -75%)',
              background: 'radial-gradient(ellipse at 50% 85%, rgba(255,220,80,0.85) 0%, rgba(255,140,100,0.6) 18%, rgba(255,80,160,0.4) 38%, rgba(180,60,220,0.2) 58%, transparent 75%)',
              filter: 'blur(32px)',
            }} />
            {/* Bright solar core */}
            <div style={{
              position: 'absolute',
              width: 180,
              height: 180,
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(circle, rgba(255,240,140,1) 0%, rgba(255,180,80,0.85) 40%, transparent 70%)',
              filter: 'blur(10px)',
            }} />
          </div>



          {/* Buttons */}
          {ITEMS.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
              animate={{ opacity: 1, scale: 1, x: item.x, y: item.y }}
              exit={{ opacity: 0, scale: 0, x: 0, y: 0 }}
              transition={{
                type: 'spring',
                stiffness: 360,
                damping: 24,
                delay: i * 0.06,
              }}
              style={{
                position: 'fixed',
                bottom: ORIGIN_BOTTOM - BTN_SIZE / 2,
                left: `calc(50% - ${BTN_SIZE / 2}px)`,
                zIndex: 10002,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <button
                onClick={() => handleSelect(item)}
                style={{
                  width: BTN_SIZE,
                  height: BTN_SIZE,
                  borderRadius: '50%',
                  background: item.bg,
                  border: 'none',
                  boxShadow: `0 0 8px 3px rgba(255,255,255,0.12), 0 4px 14px ${item.shadow}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  outline: 'none',
                  padding: 0,
                  WebkitTapHighlightColor: 'transparent',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >

                <IconSVG type={item.icon} />
              </button>
              <span style={{
                color: 'white',
                fontSize: 11,
                fontWeight: 700,
                whiteSpace: 'nowrap',
                textShadow: '0 1px 6px rgba(150,0,80,0.4), 0 0 12px rgba(255,255,255,0.5)',
              }}>
                {item.label}
              </span>
            </motion.div>
          ))}
        </>
      )}
    </AnimatePresence>
  );
}
