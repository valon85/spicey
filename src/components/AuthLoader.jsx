import React from 'react';
import { motion } from 'framer-motion';

export default function AuthLoader() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <motion.div
        animate={{
          filter: [
            'drop-shadow(0 0 18px rgba(255,80,0,0.45)) drop-shadow(0 0 40px rgba(180,30,220,0.2))',
            'drop-shadow(0 0 28px rgba(255,80,0,0.7)) drop-shadow(0 0 60px rgba(233,30,140,0.35))',
            'drop-shadow(0 0 18px rgba(255,80,0,0.45)) drop-shadow(0 0 40px rgba(180,30,220,0.2))',
          ]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <img
          src="https://media.base44.com/images/public/69fe90d3bbe7ad47925e4a0a/4a4e2edb4_SpiceyLogo.png"
          alt="S"
          style={{ height: 80, width: 80, objectFit: 'contain', display: 'block' }}
        />
      </motion.div>

      <div style={{ marginTop: 40, width: 100, height: 2, borderRadius: 2, overflow: 'hidden', background: 'rgba(255,255,255,0.07)' }}>
        <motion.div
          style={{ height: '100%', borderRadius: 2, background: 'linear-gradient(to right, #ff5500, #e91e8c, #a733ff)' }}
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </div>
  );
}