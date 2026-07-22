import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

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
        className="text-[10px] font-bold text-white leading-none block"
        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.65)' }}
      >
        {formatCount(display)}
      </motion.span>
    </div>
  );
}

const TYPE_CONFIGS = {
  heart: {
    burstType: 'heart',
    activeGlow: 'rgba(233, 30, 140, 0.42)',
    activeGlow2: 'rgba(180, 0, 200, 0.18)',
    activeBorder: 'rgba(255, 80, 180, 0.8)',
    activeBg: 'rgba(233, 30, 140, 0.18)',
    idleGlow: 'rgba(233, 30, 140, 0.07)',
    waveColor: '#e91e8c',
    ringColor: 'rgba(233, 30, 140, 0.4)',
  },
  fire: {
    burstType: 'fire',
    activeGlow: 'rgba(255, 85, 0, 0.46)',
    activeGlow2: 'rgba(255, 180, 0, 0.16)',
    activeBorder: 'rgba(255, 130, 30, 0.85)',
    activeBg: 'rgba(255, 85, 0, 0.18)',
    idleGlow: 'rgba(255, 85, 0, 0.07)',
    waveColor: '#ff5500',
    ringColor: 'rgba(255, 85, 0, 0.4)',
  },
  comment: {
    burstType: 'comment',
    activeGlow: 'rgba(120, 40, 255, 0.34)',
    activeGlow2: 'rgba(80, 0, 200, 0.14)',
    activeBorder: 'rgba(160, 80, 255, 0.75)',
    activeBg: 'rgba(120, 40, 255, 0.15)',
    idleGlow: 'rgba(120, 40, 255, 0.05)',
    waveColor: '#7b2fff',
    ringColor: 'rgba(120, 40, 255, 0.35)',
  },
  wow: {
    burstType: 'comment',
    activeGlow: 'rgba(255, 209, 102, 0.52)',
    activeGlow2: 'rgba(255, 180, 0, 0.18)',
    activeBorder: 'rgba(255, 209, 102, 0.88)',
    activeBg: 'rgba(255, 209, 102, 0.18)',
    idleGlow: 'rgba(255, 209, 102, 0.07)',
    waveColor: '#FFD166',
    ringColor: 'rgba(255, 209, 102, 0.42)',
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
  const pointerTapRef = useRef(false);
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
    if (!onLongPress) {
      e.preventDefault();
      e.stopPropagation();
      pointerTapRef.current = true;
      handleTap();
      window.setTimeout(() => { pointerTapRef.current = false; }, 0);
    }
  }, [handleTap, onLongPress]);

  const handlePointerCancel = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    if (pointerTapRef.current) return;
    handleTap();
  }, [handleTap]);

  const activeIconColor = {
    heart: 'var(--spicey-page-accent-2, #FF2D55)',
    fire: 'var(--spicey-page-accent, #FF6A00)',
    wow: 'color-mix(in srgb, var(--spicey-page-accent, #FFD166) 62%, #ffd166)',
    save: 'var(--spicey-page-accent, #FFB000)',
    share: 'var(--spicey-page-accent-2, #00c8ff)',
    comment: 'var(--spicey-page-accent, #ffffff)',
  }[type] || cfg.waveColor || '#ffffff';
  const railIconColor = active ? activeIconColor : 'color-mix(in srgb, var(--spicey-page-accent, #ffffff) 28%, #e9e9ee)';
  const wowFaceStyle = {
    fontSize: active ? 32 : 29,
    lineHeight: 1,
    transition: 'all 0.2s ease',
    color: active ? activeIconColor : 'color-mix(in srgb, var(--spicey-page-accent, #ffffff) 28%, #e9e9ee)',
    filter: active ? 'drop-shadow(0 0 6px rgba(255,209,102,0.42))' : 'none',
  };
  // On images (PostCard), icons sit over potentially bright content — always use a dark pill backdrop
  // so they remain readable in both light mode and over bright photos/videos.
  return (
    <button
      onClick={handleClick}
      onPointerDown={onLongPress ? handlePointerDown : undefined}
      onPointerUp={handlePointerUp}
      onPointerLeave={onLongPress ? handlePointerCancel : undefined}
      data-active={active ? 'true' : 'false'}
      data-reaction-type={type}
      type="button"
      className="flex flex-col items-center justify-center gap-1 relative spicey-fluid-side-action"
      style={{ WebkitTapHighlightColor: 'transparent', background: 'none', border: 'none', padding: 0, cursor: 'pointer', gap: 0 }}
    >
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
          filter: active ? `drop-shadow(0 0 10px ${cfg.activeGlow})` : 'none',
          transition: 'transform 0.2s ease',
        }}>
          {type === 'wow' ? (
            <span style={wowFaceStyle}>😮</span>
          ) : (
            <Icon
              style={{
                width: active ? 31 : 28,
                height: active ? 31 : 28,
                color: railIconColor,
                fill: active && (type === 'heart' || type === 'fire' || type === 'save') ? activeIconColor : 'none',
                strokeWidth: active ? 1.7 : 2.15,
                filter: 'none',
                transition: 'width 0.2s ease, height 0.2s ease, color 0.2s ease',
              }}
            />
          )}
        </div>
      </div>

      {/* Count — hidden at zero so the action rail stays clean on new posts */}
      {Number(count) > 0 && <AnimatedCountColored value={count} color={active ? activeIconColor : '#d6d6dc'} />}
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
    <div className="overflow-hidden h-3 flex items-center justify-center -mt-0.5">
      <motion.span
        key={value}
        initial={{ y: animUp ? 10 : -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="text-[10px] font-black leading-none block"
        style={{ color, textShadow: 'none' }}
      >
        {formatCount(display)}
      </motion.span>
    </div>
  );
}
