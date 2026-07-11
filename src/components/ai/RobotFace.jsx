import React from 'react';
import { motion } from 'framer-motion';

export default function RobotFace({ phase, flagColors }) {
  const [fc1 = '#8b5cf6', fc2 = '#e91e8c'] = flagColors || [];
  // Use flag colors for the orb gradient; phase only affects glow + animation
  const glowMap = {
    idle:       fc1,
    listening:  fc1,
    processing: '#f59e0b',
    speaking:   fc2,
  };
  const t = {
    c1:   fc1,
    c2:   fc2,
    c3:   fc2,
    glow: glowMap[phase] || fc1,
  };

  return (
    <div className="relative flex items-center justify-center" style={{ width: 240, height: 240 }}>

      {/* Deep background glow */}
      <motion.div className="absolute rounded-full"
        style={{ width: 240, height: 240, background: `radial-gradient(circle, ${t.glow}30 0%, transparent 70%)`, filter: 'blur(20px)' }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Outer pulse rings - listening/speaking */}
      {(phase === 'listening' || phase === 'speaking') && [0, 1, 2].map(i => (
        <motion.div key={i} className="absolute rounded-full"
          style={{ width: 200, height: 200, border: `1px solid ${t.c1}` }}
          animate={{ scale: [1, 1.8 + i * 0.2], opacity: [0.7, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.45, ease: 'easeOut' }}
        />
      ))}

      {/* Spin ring - processing */}
      {phase === 'processing' && (
        <motion.div className="absolute rounded-full"
          style={{ width: 195, height: 195, border: '2px solid transparent', borderTopColor: t.c1, borderRightColor: t.c3 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* Glow halo */}
      <motion.div className="absolute rounded-full"
        style={{ width: 175, height: 175, boxShadow: `0 0 60px 20px ${t.glow}55, 0 0 100px 40px ${t.glow}22` }}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: phase === 'speaking' ? 0.5 : 2, repeat: Infinity }}
      />

      {/* Main orb */}
      <motion.div className="absolute rounded-full"
        style={{
          width: 150, height: 150,
          background: `radial-gradient(circle at 35% 32%, white 0%, ${t.c1} 35%, ${t.c2} 65%, ${t.c3} 100%)`,
          boxShadow: `0 0 50px ${t.glow}cc, 0 0 90px ${t.glow}66, inset 0 0 30px rgba(255,255,255,0.15)`,
        }}
        animate={{ scale: phase === 'speaking' ? [1, 1.07, 0.96, 1.04, 1] : [1, 1.03, 1] }}
        transition={{ duration: phase === 'speaking' ? 0.45 : 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Shine top-left */}
        <div className="absolute rounded-full" style={{ width: 55, height: 55, top: 16, left: 20, background: 'radial-gradient(circle, rgba(255,255,255,0.65) 0%, transparent 70%)' }} />

        {/* Logo center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.img
            src="https://media.base44.com/images/public/69fe90d3bbe7ad47925e4a0a/0b92a4e9a_64F85237-3CE7-41B2-8DBC-EEEDD4F1CAF3.png"
            alt="S"
            style={{ width: 88, height: 88, objectFit: 'contain', filter: 'drop-shadow(0 0 20px rgba(255,255,255,1)) drop-shadow(0 0 40px rgba(255,255,255,0.8)) drop-shadow(0 0 60px rgba(200,150,255,0.6)) drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}
            animate={{ scale: phase === 'processing' ? [1, 1.08, 1] : 1 }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        </div>
      </motion.div>

      {/* Floating particles - speaking */}
      {phase === 'speaking' && [0, 1, 2, 3, 4].map(i => (
        <motion.div key={i} className="absolute rounded-full"
          style={{ width: 5 + i, height: 5 + i, background: i % 2 === 0 ? t.c1 : t.c3, boxShadow: `0 0 8px ${t.glow}` }}
          animate={{ x: (i % 2 === 0 ? 1 : -1) * (30 + i * 14), y: -(35 + i * 10), opacity: [0.9, 0], scale: [1, 0.2] }}
          transition={{ duration: 1.1 + i * 0.18, repeat: Infinity, delay: i * 0.22, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}