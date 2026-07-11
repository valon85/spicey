import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Phone, MessageCircle, User, Bell, Compass, FileText } from 'lucide-react';

const INTENT_CONFIG = {
  post_feed:          { icon: '📸', label: 'Post to Feed',        color: '#ff5500', glow: 'rgba(255,85,0,0.4)' },
  post_story:         { icon: '📖', label: 'Post to Story',       color: '#0ea5e9', glow: 'rgba(14,165,233,0.4)' },
  create_reel:        { icon: '🎬', label: 'Create Reel',         color: '#7c3aed', glow: 'rgba(124,58,237,0.4)' },
  call_user:          { icon: '📞', label: 'Start Call',          color: '#22c55e', glow: 'rgba(34,197,94,0.4)' },
  message_user:       { icon: '💬', label: 'Open Chat',           color: '#8b5cf6', glow: 'rgba(139,92,246,0.4)' },
  send_caption:       { icon: '✉️', label: 'Send Caption',        color: '#e91e8c', glow: 'rgba(233,30,140,0.4)' },
  open_profile:       { icon: '👤', label: 'Open Profile',        color: '#f59e0b', glow: 'rgba(245,158,11,0.4)' },
  open_notifications: { icon: '🔔', label: 'Open Notifications',  color: '#ff5500', glow: 'rgba(255,85,0,0.4)' },
  open_messages:      { icon: '💬', label: 'Open Messages',       color: '#8b5cf6', glow: 'rgba(139,92,246,0.4)' },
  open_explore:       { icon: '🔍', label: 'Open Explore',        color: '#06b6d4', glow: 'rgba(6,182,212,0.4)' },
};

export default function AIActionConfirmModal({ intent, params, previewData, isLight, onConfirm, onCancel }) {
  const cfg = INTENT_CONFIG[intent] || { icon: '⚡', label: 'Action', color: '#8b5cf6', glow: 'rgba(139,92,246,0.4)' };

  const bg = isLight ? 'rgba(255,255,255,0.98)' : 'rgba(12,6,22,0.98)';
  const fg = isLight ? 'hsl(270,20%,12%)' : 'white';
  const fgSub = isLight ? 'rgba(40,20,70,0.5)' : 'rgba(255,255,255,0.45)';
  const surfaceBg = isLight ? 'rgba(200,170,240,0.12)' : 'rgba(255,255,255,0.06)';
  const surfaceBorder = isLight ? 'rgba(160,100,220,0.2)' : 'rgba(255,255,255,0.1)';

  const buildDescription = () => {
    switch (intent) {
      case 'post_feed':    return 'Post this content to your Feed?';
      case 'post_story':   return 'Post this content to your Story?';
      case 'create_reel':  return 'Open the Reel creator with this content?';
      case 'call_user':    return `Start a Spicey call with ${previewData?.displayName || params?.name}?`;
      case 'message_user': return `Open a chat with ${previewData?.displayName || params?.name}?`;
      case 'send_caption': return `Send this caption to ${previewData?.displayName || params?.name}?`;
      case 'open_profile': return 'Go to your profile?';
      case 'open_notifications': return 'Open your notifications?';
      case 'open_messages': return 'Go to your messages?';
      case 'open_explore': return 'Open Explore?';
      default: return 'Perform this action?';
    }
  };

  return (
    <AnimatePresence>
      <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onCancel} className="fixed inset-0 z-50"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }} />

        <motion.div
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 320 }}
          className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl px-5 pt-4 pb-10"
          style={{ background: bg, border: `1px solid ${surfaceBorder}` }}>

          {/* Handle */}
          <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: 'rgba(128,128,128,0.3)' }} />

          {/* Icon + title */}
          <div className="flex flex-col items-center gap-3 mb-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{ background: `${cfg.color}22`, border: `1.5px solid ${cfg.color}55`, boxShadow: `0 0 20px ${cfg.glow}` }}>
              {cfg.icon}
            </div>
            <p className="font-bold text-base text-center" style={{ color: fg }}>{buildDescription()}</p>
          </div>

          {/* Preview card — user / contact info */}
          {previewData && (
            <div className="flex items-center gap-3 p-3 rounded-2xl mb-5"
              style={{ background: surfaceBg, border: `1px solid ${surfaceBorder}` }}>
              {previewData.avatar && (
                <img src={previewData.avatar} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
              )}
              <div>
                <p className="font-bold text-sm" style={{ color: fg }}>{previewData.displayName}</p>
                {previewData.username && (
                  <p className="text-xs" style={{ color: fgSub }}>@{previewData.username}</p>
                )}
              </div>
            </div>
          )}

          {/* Caption preview */}
          {previewData?.caption && (
            <div className="p-3 rounded-2xl mb-5 text-sm leading-relaxed line-clamp-3"
              style={{ background: surfaceBg, border: `1px solid ${surfaceBorder}`, color: fg }}>
              {previewData.caption}
            </div>
          )}

          {/* Confirm / Cancel */}
          <div className="flex gap-3">
            <motion.button whileTap={{ scale: 0.96 }} onClick={onCancel}
              className="flex-1 py-3.5 rounded-2xl font-bold text-sm"
              style={{ background: surfaceBg, border: `1px solid ${surfaceBorder}`, color: fgSub }}>
              Cancel
            </motion.button>
            <motion.button whileTap={{ scale: 0.96 }} onClick={onConfirm}
              className="flex-1 py-3.5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2"
              style={{
                background: `linear-gradient(135deg, ${cfg.color}, #e91e8c)`,
                boxShadow: `0 0 20px ${cfg.glow}`,
              }}>
              <Check className="w-4 h-4" />
              {cfg.label}
            </motion.button>
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  );
}