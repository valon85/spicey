import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link2, Share2, Check, MessageCircle, Home } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import useScrollLock from '@/hooks/useScrollLock';

export default function ShareSheet({ open, onClose, post, shareUrl }) {
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [isLight, setIsLight] = useState(false);
  useScrollLock(open);

  useEffect(() => {
    const check = () => setIsLight(document.documentElement.classList.contains('light-mode'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  // Use shareUrl prop if provided (for profile sharing), otherwise use post URL
  const urlToShare = shareUrl || (post?.id
    ? `${window.location.origin}/?post=${post.id}`
    : window.location.origin);

  useEffect(() => {
    if (!open) return;
    base44.auth.me().then(async user => {
      if (!user) return;
      const follows = await base44.entities.Follow.filter({ follower_id: user.id }, '-created_date', 12);
      if (!follows.length) return;
      const profiles = await Promise.all(
        follows.map(f => base44.entities.UserProfile.filter({ user_id: f.following_id }, '-created_date', 1).then(r => r[0]).catch(() => null))
      );
      setFollowers(profiles.filter(Boolean));
    }).catch(() => {});
  }, [open]);

  const handleCopy = () => {
    navigator.clipboard?.writeText(urlToShare).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    const shareData = {
      title: post?.caption ? post.caption.slice(0, 60) : (shareUrl ? 'Check out my Spicey profile!' : 'Check this out on Spicey!'),
      text: post?.caption || (shareUrl ? 'Check out my Spicey profile! 🔥' : 'Check this out on Spicey! 🔥'),
      url: urlToShare,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch { handleCopy(); }
    } else {
      handleCopy();
    }
  };

  const handleSendToFriend = async (profile) => {
    if (sent.includes(profile.user_id)) return;
    setSent(prev => [...prev, profile.user_id]);
    try {
      const chatResult = await base44.functions.invoke('getOrCreateChat', { other_user_id: profile.user_id });
      const chatId = chatResult?.data?.chat_id || chatResult?.data?.id;
      if (chatId) {
        await base44.functions.invoke('sendMessage', {
          chat_id: chatId,
          text: shareUrl ? `Check out my Spicey profile! 🔥 ${urlToShare}` : `Check out this post 🔥 ${urlToShare}`,
        });
      }
    } catch { /* silent */ }
  };

  const surface = isLight ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.05)';
  const border  = isLight ? '1px solid rgba(160,80,220,0.15)' : '1px solid rgba(255,255,255,0.08)';
  const textMain = isLight ? '#2d1b4e' : 'white';
  const textSub  = isLight ? 'rgba(80,40,120,0.5)' : 'rgba(255,255,255,0.38)';

  const ACTIONS = [
    {
      emoji: '🏠',
      label: 'Post to Wall',
      sublabel: 'Share to your feed',
      color: '#ff5500',
      action: async () => {
      // Re-post to own wall (share as own post referencing this post)
      if (!post) { onClose(); return; }
      const user = await base44.auth.me();
      if (!user) return;
      const profiles = await base44.entities.UserProfile.filter({ user_id: user.id });
      const p = profiles[0] || {};
      await base44.entities.Post.create({
        author_id: user.id,
        author_name: p.full_name || user.full_name || 'User',
        author_username: p.username || user.email?.split('@')[0] || 'user',
        author_avatar: p.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.full_name || 'User')}&background=random`,
        caption: post?.caption ? `🔁 ${post.caption}` : '🔁 Shared a post',
        image_url: post?.image_url || '',
        youtube_url: post?.youtube_url || '',
        youtube_video_id: post?.youtube_video_id || '',
        youtube_thumbnail: post?.youtube_thumbnail || '',
        likes_count: 0, fire_count: 0, wow_count: 0, comments_count: 0, shares_count: 0,
      });
      // Update share count on original
      if (post?.id) {
        await base44.entities.Post.update(post.id, { shares_count: (post.shares_count || 0) + 1 });
      }
      onClose();
      },
    },
    {
      emoji: '💬',
      label: 'Send in Spicey DM',
      sublabel: 'Pick a friend below',
      color: '#e91e8c',
      action: () => { onClose(); window.location.href = '/messages'; },
    },
    {
      emoji: copied ? '✅' : '🔗',
      label: copied ? 'Link Copied!' : 'Copy Link',
      sublabel: 'Paste anywhere',
      color: '#8b5cf6',
      action: handleCopy,
      done: copied,
    },
    {
      emoji: '📤',
      label: 'Share Outside',
      sublabel: 'SMS, Email, WhatsApp…',
      color: '#06b6d4',
      action: handleNativeShare,
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 z-[10000]"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }} />

          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[10001] rounded-t-3xl"
            style={{
              background: isLight ? 'rgba(248,244,255,0.99)' : 'rgba(12,6,22,0.99)',
              border: isLight ? '1px solid rgba(160,80,220,0.12)' : '1px solid rgba(255,255,255,0.08)',
              paddingBottom: 'max(28px, env(safe-area-inset-bottom, 16px))',
              maxHeight: '86dvh',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-y',
            }}>

            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-9 h-1 rounded-full" style={{ background: isLight ? 'rgba(120,80,180,0.2)' : 'rgba(255,255,255,0.18)' }} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3"
              style={{ borderBottom: isLight ? '1px solid rgba(160,80,220,0.1)' : '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="font-extrabold text-base" style={{ color: textMain }}>Share</h3>
              <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: isLight ? 'rgba(160,80,220,0.08)' : 'rgba(255,255,255,0.07)' }}>
                <X className="w-4 h-4" style={{ color: textSub }} />
              </button>
            </div>

            {/* Friends row */}
            {followers.length > 0 && (
              <div className="px-5 pt-4 pb-1">
                <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: textSub }}>
                  Send to Friends
                </p>
                <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                  {followers.map((profile) => {
                    const isSent = sent.includes(profile.user_id);
                    const name = profile.full_name || profile.username || 'User';
                    const avatar = profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6d28d9&color=fff&size=80`;
                    return (
                      <motion.button key={profile.user_id}
                        onClick={() => handleSendToFriend(profile)}
                        whileTap={{ scale: 0.88 }}
                        className="flex flex-col items-center gap-1.5 flex-shrink-0">
                        <div className="relative w-14 h-14 rounded-full overflow-hidden"
                          style={{ border: isSent ? '2.5px solid #ff5500' : isLight ? '2px solid rgba(160,80,220,0.2)' : '2px solid rgba(255,255,255,0.1)', boxShadow: isSent ? '0 0 14px rgba(255,80,0,0.5)' : 'none' }}>
                          <img src={avatar} alt={name} className="w-full h-full object-cover" />
                          {isSent && (
                            <div className="absolute inset-0 flex items-center justify-center"
                              style={{ background: 'rgba(255,80,0,0.55)' }}>
                              <Check className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] font-medium w-14 text-center truncate" style={{ color: textSub }}>
                          {name.split(' ')[0]}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="h-px mx-5 my-2" style={{ background: isLight ? 'rgba(160,80,220,0.1)' : 'rgba(255,255,255,0.05)' }} />

            {/* Action rows — clean, no table style */}
            <div className="px-4 space-y-1">
              {ACTIONS.map(({ emoji, label, sublabel, color, action, done }) => (
                <motion.button key={label} whileTap={{ scale: 0.97 }} onClick={action}
                  className="w-full flex items-center gap-3.5 px-3 py-3 rounded-2xl text-left active:opacity-80"
                  style={{ background: done ? `${color}15` : surface, border: done ? `1px solid ${color}40` : border }}>
                  <span className="text-2xl leading-none w-8 text-center flex-shrink-0">{emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold leading-snug" style={{ color: done ? color : textMain }}>{label}</p>
                    <p className="text-xs" style={{ color: textSub }}>{sublabel}</p>
                  </div>
                  {done && <Check className="w-4 h-4 flex-shrink-0" style={{ color }} />}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
