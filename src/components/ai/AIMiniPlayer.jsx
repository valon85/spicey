import React from 'react';
import { motion } from 'framer-motion';
import { Mic, X, Maximize2 } from 'lucide-react';
import { useAI } from '@/lib/AIContext';

export default function AIMiniPlayer() {
  const { isMinimized, maximize, close, phase } = useAI();

  if (!isMinimized) return null;

  const getStatusColor = () => {
    switch (phase) {
      case 'speaking': return '#10b981';
      case 'listening': return '#e91e8c';
      case 'processing': return '#f59e0b';
      default: return '#8b5cf6';
    }
  };

  const getStatusText = () => {
    switch (phase) {
      case 'speaking': return 'Speaking...';
      case 'listening': return 'Listening';
      case 'processing': return 'Thinking';
      default: return 'AI Ready';
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.8, opacity: 0, y: 20 }}
      className="fixed bottom-28 right-4 z-40"
      style={{
        background: 'linear-gradient(135deg, rgba(139,92,246,0.95), rgba(233,30,140,0.95))',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(139,92,246,0.4), 0 0 40px rgba(233,30,140,0.3)',
      }}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Pulsing orb */}
        <div className="relative w-10 h-10">
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 rounded-full"
            style={{ background: getStatusColor() }}
          />
          <div className="relative w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.3)' }}>
            <Mic className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Status */}
        <div className="flex-1">
          <p className="text-white font-bold text-sm">{getStatusText()}</p>
          <p className="text-white/60 text-[10px]">Tap to continue conversation</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={maximize}
            className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition"
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <Maximize2 className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={close}
            className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition"
            style={{ background: 'rgba(239,68,68,0.3)', border: '1px solid rgba(239,68,68,0.5)' }}>
            <X className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}