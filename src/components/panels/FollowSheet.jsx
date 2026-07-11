import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import useScrollLock from '@/hooks/useScrollLock';

export default function FollowSheet({ open, onClose, username }) {
  const [followed, setFollowed] = useState(false);
  useScrollLock(open);

  const handleFollow = () => {
    setFollowed(!followed);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 z-[9998] bg-black/50" />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            onTouchMove={e => e.stopPropagation()}
            onWheel={e => e.stopPropagation()}
            className="fixed bottom-0 left-0 right-0 z-[9999] rounded-t-3xl flex flex-col"
            style={{ background: 'rgba(15,8,20,0.98)', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '80vh' }}>

            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between px-6 pt-5 pb-4"
              style={{ background: 'rgba(15,8,20,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="text-white font-extrabold text-lg">Follow</h3>
              <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.08)' }}>
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)' }} />
                <div className="flex-1">
                  <p className="text-white font-bold text-lg">@{username}</p>
                  <p className="text-white/50 text-sm">Creator</p>
                </div>
              </div>

              <button onClick={handleFollow}
                className="w-full py-3 rounded-2xl font-bold text-white transition-all"
                style={{
                  background: followed ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #ff5500, #e91e8c)',
                  boxShadow: followed ? 'none' : '0 0 16px rgba(255,80,0,0.4)'
                }}>
                {followed ? 'Following' : 'Follow'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}