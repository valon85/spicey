import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, Film, BookImage, Users, Tag, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SHARE_OPTIONS = [
  {
    id: 'reels',
    icon: Film,
    label: 'Share to Reels',
    desc: 'Post as a short video reel',
    color: '#e91e8c',
    path: '/create?type=video',
  },
  {
    id: 'home',
    icon: Home,
    label: 'Share to Home',
    desc: 'Post to your home feed',
    color: '#ff5500',
    path: '/create',
  },
  {
    id: 'story',
    icon: Sparkles,
    label: 'Add to Story',
    desc: 'Share as a 24h story',
    color: '#ff8800',
    path: '/create?mode=story',
  },
  {
    id: 'album',
    icon: BookImage,
    label: 'Save to Album',
    desc: 'Save to your photo album',
    color: '#8b5cf6',
    path: '/create',
  },
  {
    id: 'friends',
    icon: Users,
    label: 'Share with Friends',
    desc: 'Send directly to friends',
    color: '#06b6d4',
    path: '/messages',
  },
  {
    id: 'tag',
    icon: Tag,
    label: 'Tag People',
    desc: 'Tag friends in a post',
    color: '#22c55e',
    path: '/create',
  },
];

export default function ShareSheet({ open, onClose }) {
  const navigate = useNavigate();

  const handleOption = (path) => {
    onClose();
    setTimeout(() => navigate(path), 80);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[70]"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[75] rounded-t-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, rgba(18,8,30,0.98) 0%, rgba(8,4,14,0.99) 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
              paddingBottom: 'max(28px, env(safe-area-inset-bottom, 20px))',
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.18)' }} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-4">
              <h2 className="text-white font-bold text-lg">Share</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.08)' }}>
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>

            {/* Options grid */}
            <div className="grid grid-cols-3 gap-3 px-5 pb-2">
              {SHARE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <motion.button
                    key={opt.id}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => handleOption(opt.path)}
                    className="flex flex-col items-center gap-2 py-4 rounded-2xl"
                    style={{
                      background: `${opt.color}12`,
                      border: `1px solid ${opt.color}30`,
                    }}
                  >
                    {/* Icon circle */}
                    <div className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{
                        background: `${opt.color}20`,
                        border: `1.5px solid ${opt.color}60`,
                        boxShadow: `0 0 14px ${opt.color}40`,
                      }}>
                      <Icon className="w-5 h-5" style={{ color: opt.color }} />
                    </div>
                    <span className="text-[11px] font-bold text-white/80 text-center leading-tight px-1">
                      {opt.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}