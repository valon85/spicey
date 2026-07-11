import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';

export default function PostSuccessOverlay({ show, message = 'Posted successfully!' }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        // Auto-hide after 1.5s
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed inset-0 flex items-center justify-center pointer-events-none z-[100]"
        >
          {/* Success card */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="px-8 py-5 rounded-3xl flex items-center gap-4"
            style={{
              background: 'linear-gradient(135deg, rgba(255,85,0,0.95), rgba(233,30,140,0.95))',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 60px rgba(255,85,0,0.5), 0 0 100px rgba(233,30,140,0.4)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            {/* Animated checkmark */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '2px solid rgba(255,255,255,0.4)',
              }}
            >
              <Check className="w-7 h-7 text-white" strokeWidth={3} />
            </motion.div>

            {/* Success message */}
            <div className="flex-1">
              <motion.p
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="text-white font-bold text-[17px]"
              >
                {message}
              </motion.p>
              <motion.p
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-white/70 text-[12px] mt-0.5"
              >
                Your post is now live
              </motion.p>
            </div>

            {/* Sparkles animation */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.2, 0.8],
                  x: (i % 2 === 0 ? 1 : -1) * (30 + i * 10),
                  y: (i % 3 === 0 ? -1 : 1) * (20 + i * 5),
                }}
                transition={{
                  delay: 0.2 + i * 0.05,
                  duration: 0.6,
                  ease: 'easeOut',
                }}
                className="absolute"
                style={{
                  left: '50%',
                  top: '50%',
                  marginLeft: -4,
                  marginTop: -4,
                }}
              >
                <Sparkles
                  className="w-3 h-3"
                  style={{
                    color: i % 2 === 0 ? '#FFD700' : '#FFFFFF',
                    filter: 'drop-shadow(0 0 8px rgba(255,215,0,0.8))',
                  }}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Background glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.3, scale: 1.5 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.5 }}
            className="absolute w-64 h-64 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255,100,0,0.6), transparent 70%)',
              filter: 'blur(40px)',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}