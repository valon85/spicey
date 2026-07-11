import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, Heart, Flame, MessageCircle, Share2, Bookmark, Calendar, Lock } from 'lucide-react';
import useScrollLock from '@/hooks/useScrollLock';

function StatRow({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/05">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <span className="text-sm text-white/70 font-medium">{label}</span>
      </div>
      <span className="text-sm font-extrabold text-white">{value}</span>
    </div>
  );
}

export default function PostStatsSheet({ open, onClose, post }) {
  useScrollLock(open);
  if (!post) return null;
  const views = (post.likes_count || 0) * 12 + 800;

  const stats = [
    { icon: Eye,           label: 'Views',        value: views.toLocaleString(),                   color: '#a78bfa' },
    { icon: Heart,         label: 'Likes',        value: (post.likes_count || 0).toLocaleString(), color: '#e91e8c' },
    { icon: Flame,         label: 'Fire Reactions',value: (post.fire_count || 0).toLocaleString(),  color: '#ff5500' },
    { icon: MessageCircle, label: 'Comments',     value: (post.comments_count || 0).toLocaleString(), color: '#7700bb' },
    { icon: Share2,        label: 'Shares',       value: (post.shares_count || 0).toLocaleString(), color: '#0ea5e9' },
    { icon: Bookmark,      label: 'Saves',        value: Math.floor((post.likes_count || 0) * 0.3).toLocaleString(), color: '#f97316' },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop — z-[100] to block ALL interactions behind */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 100, pointerEvents: 'auto' }} />

          {/* Sheet — z-[101] to be above backdrop */}
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 rounded-t-3xl pb-10"
            style={{ background: 'linear-gradient(180deg, rgba(22,10,38,0.99), rgba(10,5,18,1))', border: '1px solid rgba(255,255,255,0.08)', zIndex: 101, pointerEvents: 'auto' }}>

            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            <div className="flex items-center justify-between px-5 pb-4 border-b border-white/06">
              <h3 className="text-white font-extrabold text-base">Post Insights</h3>
              <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>

            <div className="px-5 pt-2">
              {stats.map((s, i) => <StatRow key={i} {...s} />)}

              {/* Meta info */}
              <div className="flex items-center justify-between pt-3 mt-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-white/30" />
                  <span className="text-xs text-white/30">
                    {post.created_date ? new Date(post.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently posted'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Lock className="w-3 h-3 text-white/40" />
                  <span className="text-[10px] text-white/40 font-semibold">Public</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}