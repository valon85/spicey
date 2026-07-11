import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * SpiceBurst — Cinematic particle burst system for Spicey reactions.
 * Renders a set of particles upward from the button origin, then fades out.
 */

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

// Particle configs per reaction type
const CONFIGS = {
  heart: {
    count: 8,
    colors: ['#ff3dac', '#e91e8c', '#c91eff', '#ff69c8', '#ff2d7a'],
    shapes: ['❤️', '💜', '✦', '♥', '·'],
    size: [10, 16],
    spread: 48,
    duration: [0.6, 0.95],
  },
  fire: {
    count: 9,
    colors: ['#ff5500', '#ff8c00', '#ffd000', '#ff3300', '#ff6a00'],
    shapes: ['🔥', '✦', '·', '◆', '✸'],
    size: [10, 17],
    spread: 52,
    duration: [0.55, 0.9],
  },
  comment: {
    count: 6,
    colors: ['#7b2fff', '#aa44ff', '#ccaaff', '#6600cc'],
    shapes: ['●', '◦', '○', '·', '◌'],
    size: [6, 12],
    spread: 36,
    duration: [0.5, 0.8],
  },
  share: {
    count: 7,
    colors: ['#00e5ff', '#7b2fff', '#ff00cc', '#00bcd4'],
    shapes: ['·', '—', '◆', '✦', '◦'],
    size: [5, 11],
    spread: 44,
    duration: [0.45, 0.75],
  },
};

function Particle({ config, index }) {
  const angle = randomBetween(-70, 70); // degrees from vertical
  const dist = randomBetween(config.spread * 0.55, config.spread * 1.1);
  const rad = (angle * Math.PI) / 180;
  const tx = Math.sin(rad) * dist;
  const ty = -Math.cos(rad) * dist - randomBetween(10, 24);
  const color = config.colors[index % config.colors.length];
  const shape = config.shapes[index % config.shapes.length];
  const size = randomBetween(...config.size);
  const duration = randomBetween(...config.duration);
  const delay = randomBetween(0, 0.08);

  const isEmoji = shape.length > 1 || shape.codePointAt(0) > 127;

  return (
    <motion.span
      initial={{ opacity: 1, x: 0, y: 0, scale: randomBetween(0.6, 1) }}
      animate={{ opacity: 0, x: tx, y: ty, scale: randomBetween(0.2, 0.7) }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className="absolute pointer-events-none select-none"
      style={{
        fontSize: isEmoji ? size * 0.95 : size,
        color: isEmoji ? undefined : color,
        textShadow: isEmoji ? undefined : `0 0 6px ${color}`,
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 50,
        lineHeight: 1,
      }}
    >
      {shape}
    </motion.span>
  );
}

// Expanding energy wave ring
function EnergyWave({ color }) {
  return (
    <AnimatePresence>
      <motion.span
        key={Math.random()}
        initial={{ opacity: 0.7, scale: 0.4 }}
        animate={{ opacity: 0, scale: 2.6 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          border: `1.5px solid ${color}`,
          boxShadow: `0 0 10px ${color}88`,
          zIndex: 5,
        }}
      />
    </AnimatePresence>
  );
}

export { EnergyWave };

export default function SpiceBurst({ type = 'heart', active = false }) {
  const config = CONFIGS[type] || CONFIGS.heart;
  const [particles, setParticles] = useState([]);
  const prevActive = useRef(false);

  useEffect(() => {
    // Only burst when going from inactive → active
    if (active && !prevActive.current) {
      setParticles(Array.from({ length: config.count }, (_, i) => i));
      const t = setTimeout(() => setParticles([]), 1100);
      return () => clearTimeout(t);
    }
    prevActive.current = active;
  }, [active]);

  // Also allow external trigger via ref by watching active changes
  useEffect(() => {
    prevActive.current = active;
  });

  return (
    <AnimatePresence>
      {particles.length > 0 && (
        <>
          {particles.map((_, i) => (
            <Particle key={`${i}-${Date.now()}`} config={config} index={i} />
          ))}
        </>
      )}
    </AnimatePresence>
  );
}

// Manual trigger version — pass a `burst` boolean prop that changes each time
export function SpiceBurstManual({ type = 'heart', burst }) {
  const config = CONFIGS[type] || CONFIGS.heart;
  const [particles, setParticles] = useState([]);
  const prevBurst = useRef(burst);

  useEffect(() => {
    if (burst !== prevBurst.current) {
      prevBurst.current = burst;
      if (burst) {
        setParticles(Array.from({ length: config.count }, (_, i) => i));
        const t = setTimeout(() => setParticles([]), 1100);
        return () => clearTimeout(t);
      }
    }
  }, [burst]);

  return (
    <AnimatePresence>
      {particles.map((_, i) => (
        <Particle key={`${i}-${burst}`} config={config} index={i} />
      ))}
    </AnimatePresence>
  );
}