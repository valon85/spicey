import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SpiceBurstManual, EnergyWave } from './SpiceBurst';

function formatCount(num) {
  if (!num) return '0';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return num.toString();
}

// Animated number that flips upward when count changes
function AnimatedCount({ value }) {
  const [display, setDisplay] = useState(value);
  const [animUp, setAnimUp] = useState(false);
  const prev = useRef(value);

  React.useEffect(() => {
    if (value !== prev.current) {
      setAnimUp(value > prev.current);
      prev.current = value;
      setDisplay(value);
    }
  }, [value]);

  return (
    <div className="overflow-hidden h-4 flex items-center justify-center">
      <motion.span
        key={value}
        initial={{ y: animUp ? 10 : -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="text-[11px] font-bold text-white drop-shadow-lg leading-none block"
        style={{ textShadow: '0 0 8px rgba(255,255,255,0.4)' }}
      >
        {formatCount(display)}
      </motion.span>
    </div>
  );
}

const TYPE_CONFIGS = {
  heart: {
    burstType: 'heart',
    activeGlow: 'rgba(233, 30, 140, 0.9)',
    activeGlow2: 'rgba(180, 0, 200, 0.6)',
    activeBorder: 'rgba(255, 80, 180, 0.8)',
    activeBg: 'rgba(233, 30, 140, 0.18)',
    idleGlow: 'rgba(233, 30, 140, 0.18)',
    waveColor: '#e91e8c',
    ringColor: 'rgba(233, 30, 140, 0.4)',
  },
  fire: {
    burstType: 'fire',
    activeGlow: 'rgba(255, 85, 0, 0.9)',
    activeGlow2: 'rgba(255, 180, 0, 0.5)',
    activeBorder: 'rgba(255, 130, 30, 0.85)',
    activeBg: 'rgba(255, 85, 0, 0.18)',
    idleGlow: 'rgba(255, 85, 0, 0.15)',
    waveColor: '#ff5500',
    ringColor: 'rgba(255, 85, 0, 0.4)',
  },
  comment: {
    burstType: 'comment',
    activeGlow: 'rgba(120, 40, 255, 0.8)',
    activeGlow2: 'rgba(80, 0, 200, 0.5)',
    activeBorder: 'rgba(160, 80, 255, 0.75)',
    activeBg: 'rgba(120, 40, 255, 0.15)',
    idleGlow: 'rgba(120, 40, 255, 0.12)',
    waveColor: '#7b2fff',
    ringColor: 'rgba(120, 40, 255, 0.35)',
  },
  wow: {
    burstType: 'share',
    activeGlow: 'rgba(210, 80, 255, 0.9)',
    activeGlow2: 'rgba(0, 220, 255, 0.52)',
    activeBorder: 'rgba(255, 70, 210, 0.82)',
    activeBg: 'rgba(175, 55, 255, 0.18)',
    idleGlow: 'rgba(255, 70, 210, 0.16)',
    waveColor: '#ff45d4',
    ringColor: 'rgba(0, 220, 255, 0.38)',
  },
  share: {
    burstType: 'share',
    activeGlow: 'rgba(0, 200, 255, 0.7)',
    activeGlow2: 'rgba(120, 40, 255, 0.5)',
    activeBorder: 'rgba(0, 220, 255, 0.7)',
    activeBg: 'rgba(0, 200, 255, 0.12)',
    idleGlow: 'rgba(0, 200, 255, 0.1)',
    waveColor: '#00c8ff',
    ringColor: 'rgba(0, 200, 255, 0.3)',
  },
  save: {
    burstType: 'comment',
    activeGlow: 'rgba(255, 160, 0, 0.75)',
    activeGlow2: 'rgba(255, 80, 0, 0.45)',
    activeBorder: 'rgba(255, 180, 30, 0.8)',
    activeBg: 'rgba(255, 140, 0, 0.15)',
    idleGlow: 'rgba(255, 140, 0, 0.1)',
    waveColor: '#f97316',
    ringColor: 'rgba(255, 140, 0, 0.35)',
  },
};

/**
 * SideAction — Premium Spicey reaction button with:
 * - Glassmorphism pill
 * - SpiceBurst particles on activation
 * - Energy wave ring on tap
 * - Breathing idle glow
 * - Animated count rollup
 * - Long press support for special menus
 */
export default function SideAction({ icon: Icon, count, onClick, onLongPress, active, type = 'comment', customIcon, isWowActive }) {
  const cfg = TYPE_CONFIGS[type] || TYPE_CONFIGS.comment;
  const [tapped, setTapped] = useState(0);
  const [wave, setWave] = useState(false);
  const longPressTimer = useRef(null);
  // Read once — parent PostCard already tracks this and re-renders when theme changes
  const [isLight, setIsLight] = useState(() => document.documentElement.classList.contains('light-mode'));
  React.useEffect(() => {
    const obs = new MutationObserver(() => setIsLight(document.documentElement.classList.contains('light-mode')));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const handleTap = useCallback(() => {
    setTapped(t => t + 1);
    setWave(true);
    setTimeout(() => setWave(false), 600);
    onClick?.();
  }, [onClick]);

  const handlePointerDown = useCallback((e) => {
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        onLongPress(e);
        setTapped(t => t + 1);
      }, 400); // 400ms hold
    }
  }, [onLongPress]);

  const handlePointerUp = useCallback((e) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleClick = useCallback((e) => {
    // Always trigger onClick for normal clicks
    handleTap();
  }, [handleTap]);

  const activeIconColor = type === 'heart' ? '#ff1493'
    : type === 'fire' ? '#ff5500'
    : type === 'comment' ? '#9d4edd'
    : type === 'share' ? '#00bfff'
    : type === 'wow' ? '#ff45d4'
    : '#ffa500';

  // In light mode, idle icons use vibrant accent colors instead of white
  const idleIconColor = isLight
    ? (type === 'heart' ? '#e91e8c'
      : type === 'fire' ? '#ff5500'
      : type === 'comment' ? '#9d4edd'
      : type === 'share' ? '#00bfff'
      : type === 'wow' ? '#ff45d4'
      : '#ffa500')
    : 'rgba(255,255,255,0.85)';

  // Count text color: white on media (always on dark photo), soft dark in light mode
  const countColor = isLight ? 'rgba(40,20,60,0.75)' : 'white';

  // On images (PostCard), icons sit over potentially bright content — always use a dark pill backdrop
  // so they remain readable in both light mode and over bright photos/videos.
  return (
    <button
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className="flex flex-col items-center gap-2 relative"
      style={{ WebkitTapHighlightColor: 'transparent', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
    >
      {/* Particle burst layer */}
      <div className="absolute inset-0 pointer-events-none overflow-visible z-30 flex items-center justify-center">
        <SpiceBurstManual type={cfg.burstType} burst={tapped % 2 === 1} />
      </div>

      {/* Icon — pure CSS tap scale, no framer-motion on scroll path */}
      <div
        className="relative z-10 cursor-pointer flex items-center justify-center active:scale-90"
        style={{
          background: 'transparent',
          WebkitTapHighlightColor: 'transparent',
          transition: 'transform 0.15s ease',
          willChange: 'transform',
        }}
      >
        <div style={{ 
          filter: 'none',
          transition: 'transform 0.2s ease',
        }}>
          {type === 'wow' ? (
            <span
              className="spicey-wow-mark spicey-wow-face"
              style={{
                width: active ? 36 : 32,
                height: active ? 36 : 32,
                color: '#ffffff',
              }}
            >
              <i className="spicey-wow-eye spicey-wow-eye-left" />
              <i className="spicey-wow-eye spicey-wow-eye-right" />
              <i className="spicey-wow-mouth" />
            </span>
          ) : (
            <Icon
              style={{
                width: active ? 36 : 32,
                height: active ? 36 : 32,
                color: active ? activeIconColor : '#ffffff',
                fill: active && (type === 'heart' || type === 'fire' || type === 'save') ? activeIconColor : 'none',
                strokeWidth: active ? 1.5 : 2,
                transition: 'width 0.2s ease, height 0.2s ease, color 0.2s ease',
              }}
            />
          )}
        </div>
      </div>

      {/* Count — white with text-shadow so visible over any image */}
      {count !== undefined && <AnimatedCountColored value={count} color="white" />}
    </button>
  );
}

function AnimatedCountColored({ value, color }) {
  const [display, setDisplay] = useState(value);
  const [animUp, setAnimUp] = useState(false);
  const prev = useRef(value);

  React.useEffect(() => {
    if (value !== prev.current) {
      setAnimUp(value > prev.current);
      prev.current = value;
      setDisplay(value);
    }
  }, [value]);

  return (
    <div className="overflow-hidden h-4 flex items-center justify-center">
      <motion.span
        key={value}
        initial={{ y: animUp ? 10 : -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="text-[11px] font-bold leading-none block"
        style={{ color, textShadow: color === 'white' ? '0 0 8px rgba(255,255,255,0.4)' : 'none' }}
      >
        {formatCount(display)}
      </motion.span>
    </div>
  );
}
