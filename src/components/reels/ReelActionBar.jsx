import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function formatCount(n) {
  if (!n) return '0';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toString();
}

function ActionBtn({ icon: Icon, count, onClick, active, activeColor, glowColor, burstEmoji, fillWhenActive }) {
   const [burst, setBurst] = useState(false);
   const handle = () => {
     if (!active) { setBurst(true); setTimeout(() => setBurst(false), 650); }
     onClick?.();
   };
   return (
     <button onClick={handle} className="flex flex-col items-center gap-2 relative">
       <AnimatePresence>
         {burst && (
           <motion.span initial={{ opacity: 1, scale: 0.5, y: 0 }} animate={{ opacity: 0, scale: 2.5, y: -36 }}
             exit={{ opacity: 0 }} transition={{ duration: 0.6 }}
             className="absolute text-3xl pointer-events-none" style={{ top: -10 }}>
             {burstEmoji}
           </motion.span>
         )}
       </AnimatePresence>
       <motion.div
         whileTap={{ scale: 1.4 }}
         transition={{ type: 'spring', stiffness: 450, damping: 12 }}
         className="w-13 h-13 rounded-full flex items-center justify-center transition-all"
         style={{
           background: active ? `linear-gradient(135deg, ${activeColor}44, ${activeColor}22)` : 'rgba(60,40,80,0.6)',
           border: `1.5px solid ${active ? activeColor : 'rgba(255,255,255,0.2)'}`,
           backdropFilter: 'blur(16px)',
           boxShadow: active ? `0 0 24px ${glowColor || activeColor}aa, 0 0 48px ${glowColor || activeColor}55, inset 0 1px 0 rgba(255,255,255,0.2)` : '0 4px 16px rgba(0,0,0,0.4)',
         }}>
         <Icon
           className="w-6 h-6 drop-shadow-lg transition-colors"
           style={{
             color: active ? activeColor : 'white',
             fill: active && fillWhenActive ? activeColor : undefined,
           }}
         />
       </motion.div>
       {count !== undefined && (
         <span className="text-xs font-bold text-white drop-shadow-lg leading-none">{formatCount(count)}</span>
       )}
     </button>
   );
 }

export default function ReelActionBar({ reel, onCommentClick, onShareClick, onFollow }) {
  const [liked, setLiked] = useState(false);
  const [fired, setFired] = useState(false);
  const [saved, setSaved] = useState(false);
  const [followed, setFollowed] = useState(false);
  const [likesCount, setLikesCount] = useState(reel.likes_count || 0);

  const handleShare = () => {
    if (onShareClick) { onShareClick(); return; }
  };

  return (
     <div className="flex flex-col items-center gap-6">
       {/* Author avatar with follow button */}
       <div className="relative mb-2">
         <div className="p-[3px] rounded-full"
           style={{ background: 'conic-gradient(from 0deg, #ff5500, #ee1166, #7700bb, #ff5500)', boxShadow: '0 0 24px rgba(255,80,0,0.7), 0 0 48px rgba(233,30,140,0.4)' }}>
           <img
             src={reel.author_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(reel.author_name)}&background=6d28d9&color=fff`}
             alt={reel.author_name}
             className="w-12 h-12 rounded-full object-cover border-[3px] border-black"
           />
         </div>
         <motion.div
           whileTap={{ scale: 0.9 }}
           onClick={() => { setFollowed(f => !f); onFollow?.(reel.author_username); }}
           className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer"
           style={{ background: followed ? 'rgba(255,255,255,0.2)' : 'linear-gradient(135deg, #ff5500, #e91e8c)', boxShadow: '0 0 12px rgba(255,80,0,0.7)' }}>
           {followed ? '✓' : '+'}
         </motion.div>
       </div>

       <ActionBtn icon={Heart} count={likesCount} active={liked} activeColor="#e91e8c" glowColor="#ff1a6e" burstEmoji="❤️" fillWhenActive
         onClick={() => { const n = liked ? likesCount - 1 : likesCount + 1; setLiked(!liked); setLikesCount(n); }} />

       <ActionBtn icon={Flame} active={fired} activeColor="#ff5500" glowColor="#ff7700" burstEmoji="🔥" fillWhenActive
         onClick={() => setFired(!fired)} />

       <ActionBtn icon={MessageCircle} count={reel.comments_count} active={false} activeColor="#8b5cf6" glowColor="#a78bfa" burstEmoji="💬"
         onClick={onCommentClick} />

       <ActionBtn icon={Share2} count={reel.shares_count} active={false} activeColor="#06b6d4" glowColor="#22d3ee" burstEmoji="📤"
         onClick={handleShare} />

       <ActionBtn icon={Bookmark} active={saved} activeColor="#f97316" glowColor="#ff9900" burstEmoji="🔖" fillWhenActive
         onClick={() => setSaved(!saved)} />
     </div>
   );
}