import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import useScrollLock from '@/hooks/useScrollLock';

const TABS = [
  { key: 'all',  label: 'All',    emoji: '🔥❤️' },
  { key: 'fire', label: 'Fire',   emoji: '🔥' },
  { key: 'like', label: 'Likes',  emoji: '❤️' },
  { key: 'comment', label: 'Comments', emoji: '💬' },
  { key: 'share', label: 'Share', emoji: '↗' },
];

export default function ReactionsSheet({ open, onClose, post, currentUser, liked, fireReacted, initialTab = 'all' }) {
  const [tab, setTab] = useState('all');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [isLightMode, setIsLightMode] = useState(false);
  useEffect(() => {
    const check = () => setIsLightMode(document.documentElement.classList.contains('light-mode'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  const likesCount = post?.likes_count || 0;
  const fireCount = post?.fire_count || 0;
  const commentsCount = post?.comments_count || 0;
  const shareCount = post?.shares_count || 0;

  useScrollLock(open);

  useEffect(() => {
    if (open) setTab(initialTab);
  }, [open, initialTab]);

  useEffect(() => {
    if (!open || !post?.id) return;
    setLoading(true);
    setUsers([]);

    Promise.all([
      base44.entities.Reaction.filter({ post_id: post.id }),
      base44.entities.UserProfile.list('-created_date', 500)
    ]).then(([reactions, profiles]) => {
      if (reactions.length === 0) {
        const previewUsers = (post?.liked_by_users || post?.liked_by || post?.recent_likes || []).map((user, index) => ({
          name: user.name || user.full_name || user.username || user.author_name || `User ${index + 1}`,
          avatar: user.avatar || user.avatar_url || user.author_avatar,
          type: user.type || 'like',
          userId: user.user_id || user.id || `preview-${index}`,
        }));
        setUsers(previewUsers);
        setLoading(false);
        return;
      }

      // Build lookup maps
      const byUserId = Object.fromEntries(profiles.map(p => [p.user_id, p]));
      const byCreatedBy = Object.fromEntries(profiles.map(p => [p.created_by, p]));

      const userList = reactions.map(r => {
        const profile = byUserId[r.user_id] || byCreatedBy[r.user_id] || byUserId[r.created_by] || byCreatedBy[r.created_by];
        const name = profile?.full_name || profile?.username || r.created_by?.split('@')[0] || 'User';
        const avatar = profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a0a2e&color=fff&size=60`;
        return { name, avatar, type: r.type, userId: r.user_id || r.created_by };
      });

      // Deduplicate by userId — keep only first occurrence of each user
      const seenUserIds = new Set();
      const dedupedList = userList.filter(u => {
        if (seenUserIds.has(u.userId)) return false;
        seenUserIds.add(u.userId);
        return true;
      });

      setUsers(dedupedList);
      setLoading(false);
    }).catch(() => {
      setUsers([]);
      setLoading(false);
    });
  }, [open, post?.id]);

  const filtered = tab === 'all' ? users : users.filter(u => u.type === tab);

  const handleUserClick = (userId) => {
    onClose();
    navigate(`/profile/${userId}`);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[9998]" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />

          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[9999] rounded-t-3xl pb-10 flex flex-col"
            style={{
              background: isLightMode ? 'rgba(255,255,255,0.96)' : '#000000',
              border: isLightMode ? '1px solid rgba(160,80,255,0.15)' : '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(24px)',
              boxShadow: isLightMode ? '0 -4px 30px rgba(120,80,200,0.12)' : 'none',
              height: 'min(78dvh, 660px)', maxHeight: '85dvh', display: 'flex', flexDirection: 'column',
              overflow: 'hidden', overscrollBehavior: 'contain'
            }}>

            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ background: isLightMode ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.2)' }} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3" style={{ borderBottom: isLightMode ? '1px solid rgba(160,80,255,0.12)' : '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="font-extrabold text-base" style={{ color: isLightMode ? 'hsl(270,20%,12%)' : 'white' }}>Activity</h3>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold" style={{ color: isLightMode ? 'rgba(40,20,70,0.55)' : 'rgba(255,255,255,0.5)' }}>
                  ❤️ {likesCount.toLocaleString()}  🔥 {fireCount.toLocaleString()}  💬 {commentsCount.toLocaleString()}  ↗ {shareCount.toLocaleString()}
                </span>
                <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: isLightMode ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.08)' }}>
                  <X className="w-4 h-4" style={{ color: isLightMode ? 'rgba(40,20,70,0.5)' : 'rgba(255,255,255,0.6)' }} />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 px-5 pt-3 pb-2">
              {TABS.map(t => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className="px-4 py-1.5 rounded-full text-xs font-bold transition-all"
                  style={tab === t.key ? {
                    background: isLightMode ? 'linear-gradient(135deg, rgba(255,80,0,0.12), rgba(220,30,120,0.12))' : 'linear-gradient(135deg, rgba(255,80,0,0.25), rgba(220,30,120,0.25))',
                    border: isLightMode ? '1px solid rgba(255,80,0,0.3)' : '1px solid rgba(255,80,0,0.5)',
                    color: isLightMode ? 'hsl(270,20%,12%)' : 'white',
                  } : {
                    background: isLightMode ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)',
                    border: isLightMode ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.08)',
                    color: isLightMode ? 'rgba(40,20,70,0.45)' : 'rgba(255,255,255,0.45)',
                  }}>
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>

            {/* User list */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 space-y-1"
              onTouchMove={(event) => event.stopPropagation()}
              onWheel={(event) => event.stopPropagation()}
              style={{ WebkitOverflowScrolling: 'touch', minHeight: '0', paddingBottom: '20px', touchAction: 'pan-y', overscrollBehavior: 'contain' }}>
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="w-4 h-4 border-2 rounded-full animate-spin"
                    style={{ borderColor: isLightMode ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.3)', borderTopColor: isLightMode ? 'hsl(270,20%,20%)' : 'white' }} />
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 gap-2">
                  <span className="text-2xl">{tab === 'fire' ? '🔥' : tab === 'like' ? '❤️' : tab === 'comment' ? '💬' : tab === 'share' ? '↗' : '🔥❤️'}</span>
                  <p className="text-sm" style={{ color: isLightMode ? 'rgba(40,20,70,0.45)' : 'rgba(255,255,255,0.4)' }}>No {tab === 'all' ? 'activity' : tab === 'like' ? 'likes' : tab === 'comment' ? 'comments' : tab === 'share' ? 'shares' : 'fire'} yet</p>
                </div>
              ) : (
                filtered.map((u, i) => {
                  const isCurrentUser = currentUser && u.userId === currentUser.id;
                  return (
                    <motion.button key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                      onClick={() => handleUserClick(u.userId)}
                      className="w-full flex items-center gap-3 px-2 py-2.5 rounded-2xl transition text-left"
                      style={isCurrentUser ? {
                        background: isLightMode ? 'rgba(255,80,0,0.06)' : 'rgba(255,80,0,0.1)',
                        border: isLightMode ? '1px solid rgba(255,80,0,0.15)' : '1px solid rgba(255,80,0,0.2)',
                      } : {}}>
                      <div className="p-[1.5px] rounded-full flex-shrink-0"
                        style={{ background: 'conic-gradient(from 0deg, #ff5500, #ee1166, #7700bb, #ff5500)' }}>
                        <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover border-2"
                          style={{ borderColor: isLightMode ? 'white' : 'black' }} />
                      </div>
                      <p className="text-sm font-semibold flex-1" style={{ color: isLightMode ? 'hsl(270,20%,12%)' : 'white' }}>{u.name}{isCurrentUser && ' (You)'}</p>
                  <span className="text-base">{u.type === 'fire' ? '🔥' : u.type === 'comment' ? '💬' : u.type === 'share' ? '↗' : '❤️'}</span>
                    </motion.button>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
