import React, { useState, useEffect, useRef } from 'react';
import VideoWithHLS from './VideoWithHLS';
import { Heart, MessageCircle, Share2, MoreHorizontal, EyeOff, Flame, BarChart2, UserPlus, Trash2, Flag, Ban, Volume2, VolumeX, Zap, Shield, AlertTriangle, Lock, Edit3, Globe, Users, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import SideAction from './SideAction.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import ReactionsSheet from '../panels/ReactionsSheet.jsx';
import ShareSheet from '../panels/ShareSheet.jsx';
import PostStatsSheet from '../panels/PostStatsSheet.jsx';
import FollowSheet from '../panels/FollowSheet.jsx';
import ReportSheet from '../panels/ReportSheet.jsx';
import BoostPostModal from '../panels/BoostPostModal.jsx';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { toast } from 'sonner';
import VideoPostCard from './VideoPostCard';
import TextPostCard from './TextPostCard';
import VerifiedBadge from '../shared/VerifiedBadge';
import PostCarousel from './PostCarousel';
import PhotoReelViewer from './PhotoReelViewer';
import ImageWithFallback from './ImageWithFallback';
import EditPostModal from './EditPostModal';

// Utility to ensure array safety
const asArray = (v) => Array.isArray(v) ? v : [];
const REACTION_STORE_KEY = 'spicey_feed_reactions_v1';
const SAVED_POST_STORE_KEY = 'spicey_saved_posts_v1';

function getReactionPostKey(post) {
  const raw = post?.id || post?.image_url || post?.video_url || post?.caption || post?.author_username || 'post';
  return String(raw).replace(/\s+/g, '-').slice(0, 180);
}

function readReactionStore() {
  try {
    return JSON.parse(localStorage.getItem(REACTION_STORE_KEY) || '{}') || {};
  } catch {
    return {};
  }
}

function writeReactionState(postKey, state) {
  try {
    const store = readReactionStore();
    store[postKey] = { ...(store[postKey] || {}), ...state, updatedAt: Date.now() };
    localStorage.setItem(REACTION_STORE_KEY, JSON.stringify(store));
  } catch {
    // Ignore private-mode storage failures; the UI still updates for this session.
  }
}

function readSavedPostStore() {
  try {
    return JSON.parse(localStorage.getItem(SAVED_POST_STORE_KEY) || '{}') || {};
  } catch {
    return {};
  }
}

function writeSavedPostState(postKey, saved) {
  try {
    const store = readSavedPostStore();
    store[postKey] = { saved, updatedAt: Date.now() };
    localStorage.setItem(SAVED_POST_STORE_KEY, JSON.stringify(store));
  } catch {
    // Local save fallback can fail in private mode; the visible UI still updates.
  }
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatCount(num) {
  if (!num) return '0';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return num.toString();
}

function HashtagLine({ tags }) {
  const colorForTag = (tag, index) => {
    const clean = String(tag || '').replace(/^#/, '').toLowerCase();
    if (clean === 'beachvibes') return '#FF8A00';
    if (clean === 'summer2026') return '#A855F7';
    if (clean === 'summergirls') return '#FF2D8F';
    return ['#FF8A00', '#FF2D8F', '#A855F7'][index % 3];
  };

  return (
    <p className="text-[12px] mt-0.5 font-extrabold tracking-[0.01em]" style={{ textShadow: 'none' }}>
      {asArray(tags).map((tag, index) => {
        const clean = String(tag || '').replace(/^#/, '');
        return (
          <span key={clean} style={{ color: colorForTag(clean, index), marginRight: 8 }}>
            #{clean}
          </span>
        );
      })}
    </p>
  );
}

function CaptionOverlayText({ caption }) {
  const text = String(caption || '').trim();
  if (!text) return null;

  const cleanText = text.replace(/\s+/g, ' ').trim();
  const words = cleanText.split(' ').filter(Boolean);
  const titleWords = words.slice(0, Math.min(2, words.length));
  const titleLines = titleWords.map(word => word.replace(/[^\p{L}\p{N}]+/gu, '').toUpperCase()).filter(Boolean);
  const rest = words.slice(titleWords.length).join(' ');

  return (
    <div className="spicey-photo-title-overlay">
      <p className="spicey-photo-title-main">
        {titleLines.map((line) => <span key={line}>{line}</span>)}
      </p>
      {rest && <p className="spicey-photo-title-sub">{rest}</p>}
    </div>
  );
}

function TextAction({ icon: Icon, label, onClick, active, activeColor, activeBg, glowColor, isLight }) {
  const [wave, setWave] = useState(false);
  const handle = () => { setWave(true); setTimeout(() => setWave(false), 500); onClick?.(); };

  const idleColor = isLight ? '#6b5a8a' : 'rgba(255,255,255,0.4)';
  const idleBg = isLight ? '#f5f3f8' : 'rgba(255,255,255,0.04)';
  const idleBorder = isLight ? '#d0c8e0' : 'rgba(255,255,255,0.07)';

  return (
    <motion.button
      onClick={handle}
      whileTap={{ scale: 0.88 }}
      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
      className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full overflow-visible"
      style={{
        background: active ? activeBg : idleBg,
        border: `1px solid ${active ? activeColor + '55' : idleBorder}`,
        backdropFilter: 'blur(8px)',
        boxShadow: active ? `0 0 10px ${glowColor}` : 'none',
      }}
    >
      <AnimatePresence>
        {wave && (
          <motion.div key="wave"
            initial={{ opacity: 0.6, scale: 0.5 }} animate={{ opacity: 0, scale: 2.2 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ border: `1px solid ${glowColor}` }}
          />
        )}
      </AnimatePresence>
      <Icon className="w-4 h-4" style={{ color: active ? activeColor : idleColor, fill: active && Icon.displayName === 'Heart' ? activeColor : 'none' }} />
      <span className="text-xs font-semibold" style={{ color: active ? activeColor : idleColor }}>{label}</span>
    </motion.button>
  );
}

function SpiceyStatPill({ fireCount, likesCount, wowCount, onLike, onFire, onWow, overlay = false }) {
  const stats = [
    { emoji: '❤️', count: likesCount, className: 'spicey-stat-pill-emoji-heart', onClick: onLike },
    { icon: Flame, count: fireCount, className: 'spicey-stat-pill-emoji-fire', onClick: onFire },
    { emoji: '😮', count: wowCount, className: 'spicey-stat-pill-emoji-wow', onClick: onWow },
  ];

  return (
    <motion.div
      className={`spicey-stat-pill ${overlay ? 'spicey-stat-pill-inside' : ''} active:scale-95 transition-all`}
      whileHover={overlay ? undefined : { scale: 1.02 }}
    >
      <div className="spicey-stat-pill-content">
        {stats.map((item) => {
          const StatIcon = item.icon;
          return (
          <button
            key={item.className}
            type="button"
            className="spicey-stat-pill-item"
            onPointerDown={(event) => {
              event.stopPropagation();
            }}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              item.onClick?.();
            }}
          >
            <span className={`spicey-stat-pill-emoji ${item.className}`}>
              {StatIcon ? <StatIcon size={19} strokeWidth={2.35} /> : item.emoji}
            </span>
            <span className="spicey-stat-pill-count">{formatCount(item.count || 0)}</span>
          </button>
        );})}
      </div>
    </motion.div>
  );
}

function PremiumPhotoLikeEffect({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="spicey-photo-like-premium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
        >
          <motion.div
            className="spicey-photo-like-premium__shine"
            initial={{ x: '-120%', opacity: 0 }}
            animate={{ x: '120%', opacity: [0, 1, 0] }}
            transition={{ duration: 0.78, ease: 'easeOut' }}
          />
          <motion.div
            className="spicey-photo-like-premium__heart"
            initial={{ scale: 0.5, opacity: 0, y: 8 }}
            animate={{ scale: [0.5, 1.08, 0.96], opacity: [0, 1, 0], y: [8, -8, -18] }}
            transition={{ duration: 0.82, ease: 'easeOut' }}
          >
            <Heart className="w-16 h-16" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PremiumPhotoFireEffect({ burst, active }) {
  return (
    <>
      <AnimatePresence>
        {burst && (
          <motion.div
            className="spicey-photo-fire-burst"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
          >
            <motion.div
              className="spicey-photo-fire-burst__wave"
              initial={{ y: '18%', scale: 0.92, opacity: 0 }}
              animate={{ y: ['18%', '-8%'], scale: [0.92, 1.02, 1.04], opacity: [0, 0.72, 0] }}
              transition={{ duration: 0.82, ease: 'easeOut' }}
            />
            <motion.div
              className="spicey-photo-fire-burst__icon"
              initial={{ scale: 0.48, opacity: 0, y: 10 }}
              animate={{ scale: [0.48, 1, 0.92], opacity: [0, 0.82, 0], y: [10, -8, -18] }}
              transition={{ duration: 0.74, ease: 'easeOut' }}
            >
              <Flame className="w-12 h-12" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {active && <div className="spicey-photo-fire-active" />}
    </>
  );
}

function PremiumPhotoWowEffect({ burst, active }) {
  return (
    <>
      <AnimatePresence>
        {burst && (
          <motion.div
            className="spicey-photo-wow-burst"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.14 }}
          >
            <motion.div
              className="spicey-photo-wow-burst__ring"
              initial={{ scale: 0.42, rotate: -18, opacity: 0 }}
              animate={{ scale: [0.42, 1.04, 1.18], rotate: [ -18, 8, 18 ], opacity: [0, 0.82, 0] }}
              transition={{ duration: 0.86, ease: 'easeOut' }}
            />
            <motion.div
              className="spicey-photo-wow-burst__spark"
              initial={{ scale: 0.5, opacity: 0, y: 8 }}
              animate={{ scale: [0.5, 1.12, 0.96], opacity: [0, 1, 0], y: [8, -6, -16] }}
              transition={{ duration: 0.82, ease: 'easeOut' }}
            >
              <span className="spicey-wow-face spicey-wow-face-large" aria-hidden="true">
                <i className="spicey-wow-eye spicey-wow-eye-left" />
                <i className="spicey-wow-eye spicey-wow-eye-right" />
                <i className="spicey-wow-mouth" />
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {active && <div className="spicey-photo-wow-active" />}
    </>
  );
}

const FALLBACK_LIKERS = [
  { name: 'Vlora', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&q=80' },
  { name: 'Gazi', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&q=80' },
  { name: 'Sophia', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&q=80' },
  { name: 'Mia', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&q=80' },
  { name: 'Arta', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=96&q=80' },
];

function getLikePreviewUsers(post) {
  const raw = asArray(post.liked_by_users || post.liked_by || post.recent_likes);
  const normalized = raw
    .map((user) => ({
      name: user.name || user.first_name || user.username || user.author_name || user.email?.split('@')[0],
      avatar: user.avatar || user.avatar_url || user.photo_url || user.author_avatar,
    }))
    .filter((user) => user.name);

  if (normalized.length >= 3) return normalized.slice(0, 3);

  const seed = String(post.id || post.author_username || post.caption || 'spicey')
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const rotated = FALLBACK_LIKERS.map((_, index) => FALLBACK_LIKERS[(seed + index) % FALLBACK_LIKERS.length]);
  return [...normalized, ...rotated].slice(0, 3);
}

function LikedByRow({ post, likesCount, commentsCount, isLight, onLikesClick, onCommentsClick }) {
  const users = getLikePreviewUsers(post);
  const names = users.map((user) => user.name).join(', ');
  const textColor = isLight ? '#5f5a68' : 'rgba(214,210,224,0.78)';
  const subColor = isLight ? 'rgba(95,90,104,0.66)' : 'rgba(214,210,224,0.48)';

  return (
    <div className={`spicey-liked-row ${isLight ? 'spicey-liked-row--light' : 'spicey-liked-row--dark'}`}>
      <button type="button" onClick={onLikesClick} className="spicey-liked-stack" aria-label="View likes">
        {users.map((user, index) => (
          <img
            key={`${user.name}-${index}`}
            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=ff2d55&color=fff&size=96`}
            alt={user.name}
            className="spicey-liked-avatar"
            style={{ zIndex: 4 - index }}
          />
        ))}
      </button>
      <button type="button" onClick={onLikesClick} className="spicey-liked-copy">
        <span style={{ color: textColor }}>
          Liked by <b>{names}</b>{likesCount > 3 ? ` and ${formatCount(Math.max(0, likesCount - 3))} others` : ''}
        </span>
      </button>
      <button type="button" onClick={onCommentsClick} className="spicey-liked-comments" style={{ color: subColor }}>
        {formatCount(commentsCount || 0)} comments
      </button>
    </div>
  );
}

function LightPostAuthorHeader({ post, avatarSrc, authorIsVerified, onMenuClick }) {
  return (
    <div className="spicey-light-post-author-header">
      <Link to={`/profile/${post.author_id}`} className="spicey-light-post-author-link">
        <span className="spicey-light-post-avatar-ring">
          <img src={avatarSrc} alt={post.author_name} className="spicey-light-post-avatar" />
        </span>
        <span className="spicey-light-post-author-copy">
          <span className="spicey-light-post-name">
            {post.author_name || 'User'}
            {authorIsVerified && <VerifiedBadge type="verified" size="sm" />}
          </span>
          <span className="spicey-light-post-location">{post.location || post.author_location || `@${post.author_username}`}</span>
        </span>
      </Link>
      <button type="button" onClick={onMenuClick} className="spicey-light-post-menu" aria-label="Post options">
        <MoreHorizontal className="w-5 h-5" />
      </button>
    </div>
  );
}

export default function PostCard({ post, onCommentClick, currentUser: parentCurrentUser }) {
  const reactionPostKey = getReactionPostKey(post);
  const [currentUser, setCurrentUser] = useState(parentCurrentUser || null);
  const [liked, setLiked] = useState(false);
  const [fireReacted, setFireReacted] = useState(false);
  const [wowReacted, setWowReacted] = useState(false);
  const [savedPost, setSavedPost] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [fireCount, setFireCount] = useState(post.fire_count || 0);
  const [wowCount, setWowCount] = useState(post.wow_count || 0);
  const [likePending, setLikePending] = useState(false);
  const [firePending, setFirePending] = useState(false);
  const [wowPending, setWowPending] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [doubleTapHeart, setDoubleTapHeart] = useState(false);
  const [photoLikeBurst, setPhotoLikeBurst] = useState(false);
  const [photoFireBurst, setPhotoFireBurst] = useState(false);
  const [photoWowBurst, setPhotoWowBurst] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showFollow, setShowFollow] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showBoost, setShowBoost] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLightMode, setIsLightMode] = useState(document.documentElement.classList.contains('light-mode'));
  const [isMuted, setIsMuted] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [authorIsVip, setAuthorIsVip] = useState(false);
  const [authorIsVerified, setAuthorIsVerified] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [showPhotoReel, setShowPhotoReel] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [showEditPost, setShowEditPost] = useState(false);
  const carouselRef = useRef(null);
  const videoRef = useRef(null);
  const zoomTimeoutRef = useRef(null);
  const musicRef = useRef(null);
  const likeBurstTimeoutRef = useRef(null);
  const fireBurstTimeoutRef = useRef(null);
  const wowBurstTimeoutRef = useRef(null);

  useEffect(() => {
    const handleModeChange = () => {
      setIsLightMode(document.documentElement.classList.contains('light-mode'));
    };
    const observer = new MutationObserver(handleModeChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => () => {
    if (likeBurstTimeoutRef.current) {
      clearTimeout(likeBurstTimeoutRef.current);
    }
    if (fireBurstTimeoutRef.current) {
      clearTimeout(fireBurstTimeoutRef.current);
    }
    if (wowBurstTimeoutRef.current) {
      clearTimeout(wowBurstTimeoutRef.current);
    }
  }, []);



  // Music playback disabled for iOS performance

  // Update music volume when mute toggles
  useEffect(() => {
    if (musicRef.current) {
      musicRef.current.muted = isMuted;
      musicRef.current.volume = isMuted ? 0 : 0.5;
    }
  }, [isMuted]);

  // Video pause disabled for iOS performance

  // Reaction checks disabled for iOS performance
  useEffect(() => {
    if (parentCurrentUser) {
      setCurrentUser(parentCurrentUser);
      setIsAdmin(parentCurrentUser.role === 'admin');
      PostCard._cachedUser = parentCurrentUser;
    } else if (PostCard._cachedUser) {
      setCurrentUser(PostCard._cachedUser);
      setIsAdmin(PostCard._cachedUser.role === 'admin');
    } else {
      // Fallback: fetch user directly if parent didn't provide one
      base44.auth.me().then(u => {
        if (u) {
          PostCard._cachedUser = u;
          setCurrentUser(u);
          setIsAdmin(u.role === 'admin');
        }
      }).catch(() => {});
    }
  }, [parentCurrentUser]);

  useEffect(() => {
    const saved = readReactionStore()[reactionPostKey];
    setLiked(!!saved?.liked);
    setFireReacted(!!saved?.fireReacted);
    setWowReacted(!!saved?.wowReacted);
    setLikesCount(Number.isFinite(saved?.likesCount) ? saved.likesCount : (post.likes_count || 0));
    setFireCount(Number.isFinite(saved?.fireCount) ? saved.fireCount : (post.fire_count || 0));
    setWowCount(Number.isFinite(saved?.wowCount) ? saved.wowCount : (post.wow_count || 0));
  }, [reactionPostKey, post.likes_count, post.fire_count, post.wow_count]);

  useEffect(() => {
    setSavedPost(!!readSavedPostStore()[reactionPostKey]?.saved);
  }, [reactionPostKey]);

  // VIP check disabled to prevent rate limiting
  // All users show as non-VIP by default

  // Use refs so DB updates always use the latest count, not stale closure values
  const likesCountRef = useRef(likesCount);
  const fireCountRef = useRef(fireCount);
  const wowCountRef = useRef(wowCount);
  useEffect(() => { likesCountRef.current = likesCount; }, [likesCount]);
  useEffect(() => { fireCountRef.current = fireCount; }, [fireCount]);
  useEffect(() => { wowCountRef.current = wowCount; }, [wowCount]);

  const toggleReaction = async (type, pending, setPending, setReacted, setCount, countRef) => {
    if (pending) return;
    const wasActive = type === 'like' ? liked : type === 'fire' ? fireReacted : wowReacted;
    const nextActive = !wasActive;
    const currentCount = Number(countRef.current || 0);
    const nextCount = nextActive ? currentCount + 1 : Math.max(0, currentCount - 1);
    const nextSavedState = {
      liked: type === 'like' ? nextActive : liked,
      fireReacted: type === 'fire' ? nextActive : fireReacted,
      wowReacted: type === 'wow' ? nextActive : wowReacted,
      likesCount: type === 'like' ? nextCount : likesCountRef.current,
      fireCount: type === 'fire' ? nextCount : fireCountRef.current,
      wowCount: type === 'wow' ? nextCount : wowCountRef.current,
    };

    setReacted(nextActive);
    setCount(nextCount);
    writeReactionState(reactionPostKey, nextSavedState);

    const isLocalPost = !post.id || post.id?.startsWith('demo') || post.id?.startsWith('DEMO');
    if (isLocalPost) {
      return;
    }
    let activeUser = currentUser;
    if (!activeUser) {
      try { activeUser = await base44.auth.me(); if (activeUser) { PostCard._cachedUser = activeUser; setCurrentUser(activeUser); } } catch (e) {}
    }
    if (!activeUser) return;
    setPending(true);
    try {
      const res = await base44.functions.invoke('toggleReaction', { post_id: post.id, user_id: activeUser.id, type });
      const data = res?.data;
      if (data?.newCount !== undefined) {
        setCount(data.newCount);
        setReacted(data.action === 'added');
        writeReactionState(reactionPostKey, {
          ...nextSavedState,
          [type === 'like' ? 'liked' : type === 'fire' ? 'fireReacted' : 'wowReacted']: data.action === 'added',
          [type === 'like' ? 'likesCount' : type === 'fire' ? 'fireCount' : 'wowCount']: data.newCount,
        });
      }
    } catch (error) {
      console.error('Reaction error:', error);
    } finally {
      setPending(false);
    }
  };

  const triggerPhotoLikeEffect = () => {
    if (likeBurstTimeoutRef.current) {
      clearTimeout(likeBurstTimeoutRef.current);
    }
    setPhotoLikeBurst(false);
    requestAnimationFrame(() => setPhotoLikeBurst(true));
    likeBurstTimeoutRef.current = setTimeout(() => setPhotoLikeBurst(false), 920);
  };

  const handleLike = () => {
    if (!liked && !likePending) {
      triggerPhotoLikeEffect();
    }
    return toggleReaction('like', likePending, setLikePending, setLiked, setLikesCount, likesCountRef);
  };

  const triggerPhotoFireEffect = () => {
    if (fireBurstTimeoutRef.current) {
      clearTimeout(fireBurstTimeoutRef.current);
    }
    setPhotoFireBurst(false);
    requestAnimationFrame(() => setPhotoFireBurst(true));
    fireBurstTimeoutRef.current = setTimeout(() => setPhotoFireBurst(false), 1050);
  };

  const handleFireReact = () => {
    if (!fireReacted && !firePending) {
      triggerPhotoFireEffect();
    }
    return toggleReaction('fire', firePending, setFirePending, setFireReacted, setFireCount, fireCountRef);
  };
  const triggerPhotoWowEffect = () => {
    if (wowBurstTimeoutRef.current) {
      clearTimeout(wowBurstTimeoutRef.current);
    }
    setPhotoWowBurst(false);
    requestAnimationFrame(() => setPhotoWowBurst(true));
    wowBurstTimeoutRef.current = setTimeout(() => setPhotoWowBurst(false), 940);
  };

  const handleWow = () => {
    if (!wowReacted && !wowPending) {
      triggerPhotoWowEffect();
    }
    return toggleReaction('wow', wowPending, setWowPending, setWowReacted, setWowCount, wowCountRef);
  };

  const handleSavePost = () => {
    const next = !savedPost;
    setSavedPost(next);
    writeSavedPostState(reactionPostKey, next);
    toast.success(next ? 'Saved' : 'Removed from saved');
  };



  const handleDoubleTap = async () => {
    setDoubleTapHeart(true);
    setTimeout(() => setDoubleTapHeart(false), 800);
    if (!liked && currentUser && !likePending) {
      await handleLike();
    }
  };

  const handleImageClick = () => {
    if (post.image_url && !post.image_url.match(/\.(mp4|webm|mov|avi)$/i)) {
      setZoomed(true);
      if (zoomTimeoutRef.current) clearTimeout(zoomTimeoutRef.current);
      zoomTimeoutRef.current = setTimeout(() => setZoomed(false), 2000);
    }
  };

  // Safe avatar: replace Albanian chars for ui-avatars compatibility
  const safeAuthorName = (post.author_name || 'U')
    .replace(/ë/g, 'e').replace(/Ë/g, 'E')
    .replace(/ç/g, 'c').replace(/Ç/g, 'C');
  const avatarSrc = (post.author_avatar && post.author_avatar.trim())
    ? post.author_avatar
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(safeAuthorName)}&background=random&color=fff&size=128`;



  if (hidden) return null;

  const spiceyCardRadius = '30px 24px 34px 24px';
  const spiceyCardShell = {
    borderRadius: spiceyCardRadius,
  };
  const spiceyInner = {
    borderRadius: spiceyCardRadius,
    background: '#07020d',
  };
  const spiceyTalkButtonStyle = {
    width: 38,
    height: 38,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: 10,
    fontWeight: 800,
    background: 'linear-gradient(145deg, #FF6A00 0%, #FF2D55 50%, #C100FF 100%)',
    border: '1px solid rgba(255,255,255,0.18)',
    boxShadow: '0 0 14px rgba(255,45,85,0.72), 0 0 22px rgba(193,0,255,0.32)',
    WebkitTapHighlightColor: 'transparent',
  };

  // Check if this is a YouTube post
  const hasVideoLink = post.video_link && post.video_link.trim() !== '';
  const isVideoPost = hasVideoLink;

  return (
    <div id={`post-${post.id}`} className="mb-0">
      {/* ── YOUTUBE POST ── */}
      {isVideoPost && (
        <>
          {/* Author header */}
          <div className="flex items-center justify-between px-4 mb-3">
            <Link to={`/profile/${post.author_id}`} className="flex items-center gap-2.5">
              <div className="p-0.5 rounded-full flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #ff5500, #ee1e8c)' }}>
                <ImageWithFallback 
                  src={avatarSrc} 
                  alt={post.author_name}
                  className="w-9 h-9 rounded-full object-cover"
                  isAvatar={true}
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="font-bold text-[13px]" style={{ color: isLightMode ? '#111111' : '#ffffff', textShadow: isLightMode ? 'none' : '0 1px 6px rgba(0,0,0,0.4)', fontWeight: 700 }}>{post.author_name || 'User'}</p>
                  {authorIsVerified && <VerifiedBadge type="verified" size="sm" />}
                </div>
                <p className="text-[11px]" style={{ color: isLightMode ? '#8E8E93' : 'rgba(255,255,255,0.9)', textShadow: isLightMode ? 'none' : '0 1px 4px rgba(0,0,0,0.35)', fontWeight: 500 }}>@{post.author_username} · {timeAgo(post.created_date)}</p>
              </div>
            </Link>
            {/* Admin button for YouTube posts */}
            {isAdmin ? (
              <button onClick={() => setShowAdminMenu(true)}
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ 
                  background: 'linear-gradient(135deg, #ef4444, #f59e0b)', 
                  boxShadow: '0 0 15px rgba(239,68,68,0.5)',
                  border: '2px solid rgba(255,255,255,0.2)',
                }}>
                <span className="text-white font-bold text-lg">+</span>
              </button>
            ) : (
              <button onClick={() => setShowMenu(true)}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ 
                  background: isLightMode ? '#F3F4F7' : 'rgba(0,0,0,0.4)', 
                  backdropFilter: 'blur(8px)',
                  border: isLightMode ? '1px solid #ECECF2' : 'none',
                }}>
                <MoreHorizontal className="w-4 h-4" style={{ color: isLightMode ? '#8E8E93' : 'white' }} />
              </button>
            )}
          </div>

          <div className="mx-0">
            <VideoPostCard post={post} />
          </div>

          {/* Caption & hashtags */}
          {(post.caption && !post.youtube_title) || (post.caption && post.caption !== post.youtube_title) ? (
            <div className="px-4 pt-3">
              <p className="text-[13px] leading-snug" style={{ color: isLightMode ? '#111111' : 'rgba(255,255,255,0.8)' }}>{post.caption}</p>
              {asArray(post.hashtags).length > 0 && (
                <HashtagLine tags={post.hashtags} />
              )}
            </div>
          ) : asArray(post.hashtags).length > 0 ? (
            <div className="px-4 pt-3">
              <HashtagLine tags={post.hashtags} />
            </div>
          ) : null}

          {/* Side actions below */}
          <div className="flex items-center gap-2 px-4 pt-3">
            <TextAction icon={Heart} label={formatCount(likesCount)} onClick={handleLike} active={liked}
              activeColor="#FF2D55" activeBg="rgba(255,45,85,0.1)" glowColor="rgba(255,45,85,0.3)" isLight={isLightMode} />
            <TextAction icon={MessageCircle} label={formatCount(post.comments_count || 0)} onClick={() => onCommentClick?.(post)}
              activeColor="#8E8E93" activeBg="rgba(142,142,147,0.1)" glowColor="rgba(142,142,147,0.2)" isLight={isLightMode} />
            {(post.shares_count || 0) > 0 && (
              <TextAction icon={Share2} label={formatCount(post.shares_count)} onClick={() => setShowShare(true)}
                activeColor="#8E8E93" activeBg="rgba(142,142,147,0.1)" glowColor="rgba(142,142,147,0.2)" isLight={isLightMode} />
            )}
          </div>
        </>
        )}

      {/* ── CAROUSEL POST (multi-photo) ── */}
      {asArray(post.image_urls).length > 1 && !isVideoPost && (
        <>
          {isLightMode && (
            <LightPostAuthorHeader
              post={post}
              avatarSrc={avatarSrc}
              authorIsVerified={authorIsVerified}
              onMenuClick={() => setShowMenu(true)}
            />
          )}
          <motion.div
            className="relative mx-4 mt-4 overflow-visible group spicey-post-card"
            style={spiceyCardShell}>
            <div className="relative overflow-hidden spicey-post-media" style={{ ...spiceyInner, cursor: 'pointer' }}>
              {/* Carousel — slide container only */}
              <PostCarousel 
                ref={carouselRef}
                images={post.image_urls} 
                onDoubleTap={() => setShowPhotoReel(true)}
                onIndexChange={setCarouselIndex}
                autoAdvanceMs={asArray(post.image_urls).length > 3 ? 40000 : 0}
              />
              <PremiumPhotoLikeEffect show={photoLikeBurst} />
              <PremiumPhotoFireEffect burst={photoFireBurst} active={fireReacted} />
              <PremiumPhotoWowEffect burst={photoWowBurst} active={wowReacted} />
              {/* Author header */}
              <div className="absolute top-0 left-0 right-0 h-20 pointer-events-none z-10 spicey-post-top-gradient"
                style={{ background: isLightMode ? 'linear-gradient(to bottom, rgba(255,255,255,0.85), transparent)' : 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)' }} />
              <div className="absolute top-3.5 left-3.5 flex items-center gap-2.5 z-20 spicey-post-overlay-author">
                <Link to={`/profile/${post.author_id}`} className="flex items-center gap-2.5">
                  <div className="p-0.5 rounded-full flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #ff5500, #ee1e8c)' }}>
                    <ImageWithFallback 
                      src={avatarSrc} 
                      alt={post.author_name}
                      className="w-9 h-9 rounded-full object-cover"
                      isAvatar={true}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-[13px] leading-tight text-white" style={{ textShadow: 'none' }}>{post.author_name || 'User'}</p>
                      {authorIsVerified && <VerifiedBadge type="verified" size="sm" />}
                    </div>
                    <p className="text-[11px] leading-tight text-white/75">@{post.author_username} · {timeAgo(post.created_date)}</p>
                  </div>
                </Link>
              </div>
              <button onClick={() => setShowMenu(true)}
                className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full flex items-center justify-center z-20 spicey-post-overlay-menu"
                style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <MoreHorizontal className="w-4 h-4 text-white" />
              </button>

              {/* Double tap heart */}
              <AnimatePresence>
                {doubleTapHeart && (
                  <motion.div initial={{ scale: 0.3, opacity: 1 }} animate={{ scale: 1.8, opacity: 0 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                    <Heart className="w-24 h-24 fill-white text-white drop-shadow-2xl" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bottom gradient + caption */}
              <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none spicey-post-bottom-gradient" />
              <div className="absolute left-5 right-20 z-10 spicey-photo-title-stack">
                {post.music_title && (
                  <div className="flex items-center gap-1.5 mb-1.5 max-w-[180px]"
                    style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', borderRadius: 20, padding: '3px 10px 3px 7px', border: '1px solid rgba(255,255,255,0.15)' }}>
                    <span style={{ fontSize: 11 }}>🎵</span>
                    <span className="text-white text-[11px] font-semibold truncate">{post.music_title}</span>
                    {post.music_artist && <span className="text-white/60 text-[10px] truncate">· {post.music_artist}</span>}
                  </div>
                )}
                <CaptionOverlayText caption={post.caption} />
                {asArray(post.hashtags).length > 0 && (
                  <HashtagLine tags={post.hashtags} />
                )}
              </div>
              <SpiceyStatPill
                overlay
                fireCount={fireCount}
                likesCount={likesCount}
                wowCount={wowCount}
                onLike={handleLike}
                onFire={handleFireReact}
                onWow={handleWow}
              />
            </div>

            <div className="spicey-reaction-rail">
              <SideAction icon={Heart} count={likesCount} onClick={handleLike} active={liked} type="heart" />
              <SideAction icon={Flame} count={fireCount} onClick={handleFireReact} active={fireReacted} type="fire" />
              <SideAction icon={MessageCircle} count={post.comments_count || 0} onClick={() => onCommentClick?.(post)} type="comment" />
              <SideAction icon={Zap} count={wowCount} onClick={handleWow} active={wowReacted} type="wow" />
              <SideAction icon={Share2} count={post.shares_count || 0} onClick={() => setShowShare(true)} type="share" />
              <SideAction icon={Bookmark} count={0} onClick={handleSavePost} active={savedPost} type="save" />
            </div>

          </motion.div>

          <LikedByRow
            post={post}
            likesCount={likesCount}
            commentsCount={post.comments_count}
            isLight={isLightMode}
            onLikesClick={() => setShowReactions(true)}
            onCommentsClick={() => onCommentClick?.(post)}
          />

          {/* Photo Reel Viewer */}
          <AnimatePresence>
            {showPhotoReel && (
              <PhotoReelViewer
                post={post}
                onClose={() => setShowPhotoReel(false)}
                liked={liked} fireReacted={fireReacted}
                likesCount={likesCount} fireCount={fireCount}
                onLike={handleLike} onFireReact={handleFireReact}
                onComment={() => { setShowPhotoReel(false); onCommentClick?.(post); }}
                onShare={() => { setShowPhotoReel(false); setShowShare(true); }}
                authorIsVerified={authorIsVerified}
              />
            )}
          </AnimatePresence>
        </>
      )}

      {/* ── DIRECT VIDEO POST (video_url on feed post or reel) ── */}
      {post.video_url && !post.image_url && !asArray(post.image_urls).length > 1 && !isVideoPost && (
        <>
          <motion.div
            className="relative mx-0 rounded-3xl overflow-hidden"
            style={{
              boxShadow: isLightMode ? '0 4px 20px rgba(0,0,0,0.06)' : '0 20px 50px rgba(255,100,0,0.15), 0 0 40px rgba(238,30,140,0.1)',
              background: 'black',
              border: isLightMode ? '1px solid #F0F0F4' : '1px solid rgba(255,255,255,0.07)',
            }}>
            <div className="relative overflow-hidden rounded-3xl">
              {post.video_url.includes('.m3u8') ? (
                <VideoWithHLS src={post.video_url} className="w-full object-cover" style={{ aspectRatio: '4/5', display: 'block' }} autoPlay loop muted={isMuted} onDoubleClick={handleDoubleTap} />
              ) : (
                <video
                  ref={videoRef}
                  src={post.video_url}
                  className="w-full object-cover"
                  style={{ aspectRatio: '4/5', display: 'block' }}
                  autoPlay loop playsInline muted={isMuted}
                  onDoubleClick={handleDoubleTap}
                />
              )}
              <button
                onClick={e => { e.stopPropagation(); setIsMuted(!isMuted); }}
                className="absolute bottom-16 left-3.5 w-9 h-9 rounded-full flex items-center justify-center z-20"
                style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.12)' }}>
                {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
              </button>
            </div>
            <div className="absolute top-0 left-0 right-0 h-20 pointer-events-none"
              style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)' }} />
            <div className="absolute top-3.5 left-3.5 flex items-center gap-2.5 z-20">
              <Link to={`/profile/${post.author_id}`} className="flex items-center gap-2.5">
                <div className="p-0.5 rounded-full flex-shrink-0" style={{ background: 'linear-gradient(135deg, #ff5500, #ee1e8c)' }}>
                  <img src={avatarSrc} alt={post.author_name} className="w-9 h-9 rounded-full object-cover" />
                </div>
                <div>
                  <p className="font-bold text-[13px] leading-tight text-white" style={{ textShadow: 'none' }}>{post.author_name || 'User'}</p>
                  <p className="text-[11px] leading-tight text-white/75">@{post.author_username} · {timeAgo(post.created_date)}</p>
                </div>
              </Link>
            </div>
            <button onClick={() => setShowMenu(true)} className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full flex items-center justify-center z-20"
              style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <MoreHorizontal className="w-4 h-4 text-white" />
            </button>
            <div className="spicey-reaction-rail">
              <SideAction icon={Heart} count={likesCount} onClick={handleLike} active={liked} type="heart" />
              <SideAction icon={Flame} count={fireCount} onClick={handleFireReact} active={fireReacted} type="fire" />
              <SideAction icon={MessageCircle} count={post.comments_count} onClick={() => onCommentClick?.(post)} active={false} type="comment" />
              <SideAction icon={Zap} count={wowCount} onClick={handleWow} active={wowReacted} type="wow" />
              <SideAction icon={Share2} count={post.shares_count || 0} onClick={() => setShowShare(true)} type="share" />
              <SideAction icon={Bookmark} count={0} onClick={handleSavePost} active={savedPost} type="save" />
            </div>
            <div className="absolute bottom-0 left-0 right-20 h-32 pointer-events-none spicey-post-bottom-gradient"
              style={{ background: 'transparent' }} />
            <div className="absolute bottom-3 left-3 right-20">
              {post.caption && <p className="text-[13px] font-semibold leading-snug line-clamp-2 text-white" style={{ textShadow: 'none' }}>{post.caption}</p>}
            </div>
            <AnimatePresence>
              {doubleTapHeart && (
                <motion.div initial={{ scale: 0.3, opacity: 1 }} animate={{ scale: 1.8, opacity: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <Heart className="w-24 h-24 fill-white text-white drop-shadow-2xl" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          <div className="flex flex-col items-center gap-2 mt-2 mb-0 px-4">
            <div className="spicey-post-meta-row">
              <button onClick={() => setShowReactions(true)} className="text-[11px] font-semibold active:scale-95" style={{ color: isLightMode ? '#111111' : 'rgba(255,255,255,0.7)' }}>❤️ {formatCount(likesCount)}</button>
              <span className="text-xs" style={{ color: isLightMode ? '#8E8E93' : 'rgba(255,255,255,0.25)' }}>•</span>
              <button onClick={() => onCommentClick?.(post)} className="text-[11px] font-semibold active:scale-95" style={{ color: isLightMode ? '#111111' : 'rgba(255,255,255,0.55)' }}>{formatCount(post.comments_count || 0)} Com</button>
              {(post.shares_count || 0) > 0 && (
                <>
                  <span className="text-xs" style={{ color: isLightMode ? '#8E8E93' : 'rgba(255,255,255,0.25)' }}>•</span>
                  <button onClick={() => setShowShare(true)} className="text-[11px] font-semibold active:scale-95" style={{ color: isLightMode ? '#111111' : 'rgba(255,255,255,0.55)' }}>{formatCount(post.shares_count)} Share</button>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── IMAGE/VIDEO POST ── */}
      {post.image_url && !isVideoPost && !asArray(post.image_urls).length > 1 && (
        <>
          {isLightMode && (
            <LightPostAuthorHeader
              post={post}
              avatarSrc={avatarSrc}
              authorIsVerified={authorIsVerified}
              onMenuClick={() => setShowMenu(true)}
            />
          )}
          <motion.div
            className="relative mx-4 mt-4 overflow-visible group spicey-post-card"
            style={spiceyCardShell}>
            <div className="relative overflow-hidden spicey-post-media" style={{ pointerEvents: 'auto', ...spiceyInner }}>
              {post.image_url.match(/\.(mp4|webm|mov|avi)$/i) || post.image_url.includes('.m3u8') ? (
                <>
                  {post.image_url.includes('.m3u8') ? (
                    <VideoWithHLS src={post.image_url} className="w-full object-cover spicey-wow-photo" style={{ aspectRatio: '4/5', display: 'block' }} autoPlay loop muted={isMuted} onDoubleClick={handleDoubleTap} />
                  ) : (
                    <video
                      ref={videoRef}
                      src={post.image_url}
                      className="w-full object-cover spicey-wow-photo"
                      style={{ aspectRatio: '4/5', display: 'block' }}
                      autoPlay
                      loop
                      playsInline
                      muted={isMuted}
                      onDoubleClick={handleDoubleTap}
                    />
                  )}
                  {/* Mute toggle button — bottom-left corner */}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      const newMuted = !isMuted;
                      setIsMuted(newMuted);
                      if (videoRef.current) {
                        videoRef.current.muted = newMuted;
                        videoRef.current.volume = newMuted ? 0 : 1.0;
                      }
                    }}
                    className="absolute bottom-16 left-3.5 w-9 h-9 rounded-full flex items-center justify-center z-20"
                    style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.12)' }}>
                    {isMuted ? (
                      <VolumeX className="w-4 h-4 text-white" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-white" />
                    )}
                  </button>
                </>
              ) : (
                <div className="relative">
                  <motion.img
                    src={post.image_url}
                    alt="Post"
                    className="w-full object-cover cursor-pointer spicey-wow-photo"
                    style={{ 
                      aspectRatio: '4/5', 
                      display: 'block',
                      transformOrigin: 'center center',
                    }}
                    animate={{ scale: zoomed ? 2.5 : 1 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    onDoubleClick={handleDoubleTap}
                    decoding="async"
                  />
                  {/* Mute toggle for photo posts with music — show if music_title exists — z-60 to be above side actions */}
                  {post.music_title && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        const newMuted = !isMuted;
                        setIsMuted(newMuted);
                        if (musicRef.current) {
                          musicRef.current.muted = newMuted;
                          musicRef.current.volume = newMuted ? 0 : 0.5;
                        }
                      }}
                      className="absolute bottom-16 left-3.5 w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.12)', zIndex: 60 }}>
                      {isMuted ? (
                        <VolumeX className="w-4 h-4 text-white" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-white" />
                      )}
                    </button>
                  )}
                </div>
              )}
              <PremiumPhotoLikeEffect show={photoLikeBurst} />
              <PremiumPhotoFireEffect burst={photoFireBurst} active={fireReacted} />
              <PremiumPhotoWowEffect burst={photoWowBurst} active={wowReacted} />
              {/* Soft edge fade — white glow vignette */}
              <div className="absolute inset-0 pointer-events-none"
                style={{
                  borderRadius: spiceyCardRadius,
                  background: 'transparent'
                }} />
            </div>

            {/* Double tap heart */}
            <AnimatePresence>
              {doubleTapHeart && (
                <motion.div
                  initial={{ scale: 0.3, opacity: 1 }}
                  animate={{ scale: 1.8, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{ zIndex: 5 }}
                >
                  <Heart className="w-24 h-24 fill-white text-white drop-shadow-2xl" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Top gradient — always visible for readability */}
            <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none spicey-post-top-gradient"
              style={{ zIndex: 6, background: isLightMode
                ? 'linear-gradient(to bottom, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.4) 50%, transparent 100%)'
                : 'linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 50%, transparent 100%)' }} />

            {/* Author header */}
            <div className="absolute top-3.5 left-3.5 flex items-center gap-2.5 spicey-post-overlay-author" style={{ zIndex: 10 }}>
              <Link to={`/profile/${post.author_id}`} className="flex items-center gap-2.5">
                <div className="p-0.5 rounded-full flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #ff5500, #ee1e8c)' }}>
                  <img src={avatarSrc} alt={post.author_name}
                    className="w-9 h-9 rounded-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-[13px] leading-tight" style={{ color: '#ffffff', textShadow: '0 1px 8px rgba(0,0,0,0.8), 0 2px 12px rgba(0,0,0,0.6)' }}>{post.author_name || 'User'}</p>
                    {authorIsVerified && <VerifiedBadge type="verified" size="sm" />}
                  </div>
                  <p className="text-[11px] leading-tight" style={{ color: 'rgba(255,255,255,0.9)', textShadow: '0 1px 6px rgba(0,0,0,0.8)' }}>@{post.author_username} · {timeAgo(post.created_date)}</p>
                </div>
              </Link>
            </div>

            {/* 3-dot menu — top right, separate from side actions */}
            <button onClick={() => setShowMenu(true)}
              className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full flex items-center justify-center spicey-post-overlay-menu"
              style={{ zIndex: 10, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
              <MoreHorizontal className="w-4 h-4 text-white" />
            </button>

            {/* Bottom gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-36 pointer-events-none spicey-post-bottom-gradient" />
            <div className="absolute left-5 right-20 spicey-photo-caption-stack spicey-photo-title-stack">
              {post.music_title && (
                <div className="flex items-center gap-1.5 mb-1.5 max-w-[180px]"
                  style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', borderRadius: 20, padding: '3px 10px 3px 7px', border: '1px solid rgba(255,255,255,0.15)' }}>
                  <span style={{ fontSize: 11 }}>🎵</span>
                  <span className="text-[11px] font-semibold truncate" style={{ color: '#ffffff', textShadow: '0 1px 4px rgba(0,0,0,1)' }}>{post.music_title}</span>
                  {post.music_artist && <span className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.85)', textShadow: '0 1px 4px rgba(0,0,0,1)' }}>· {post.music_artist}</span>}
                </div>
              )}
              <CaptionOverlayText caption={post.caption} />
              {asArray(post.hashtags).length > 0 && (
                <HashtagLine tags={post.hashtags} />
              )}
            </div>
            <SpiceyStatPill
              overlay
              fireCount={fireCount}
              likesCount={likesCount}
              wowCount={wowCount}
              onLike={handleLike}
              onFire={handleFireReact}
              onWow={handleWow}
            />

            {/* Side action buttons — inside overflow-visible motion.div, outside the overflow-hidden inner div */}
            <div className="spicey-reaction-rail">
              <SideAction icon={Heart} count={likesCount} onClick={handleLike} active={liked} type="heart" />
              <SideAction icon={Flame} count={fireCount} onClick={handleFireReact} active={fireReacted} type="fire" />
              <SideAction icon={MessageCircle} count={post.comments_count || 0} onClick={() => onCommentClick?.(post)} type="comment" />
              <SideAction icon={Zap} count={wowCount} onClick={handleWow} active={wowReacted} type="wow" />
              <SideAction icon={Share2} count={post.shares_count || 0} onClick={() => setShowShare(true)} type="share" />
              <SideAction icon={Bookmark} count={0} onClick={handleSavePost} active={savedPost} type="save" />
            </div>
          </motion.div>
          <LikedByRow
            post={post}
            likesCount={likesCount}
            commentsCount={post.comments_count}
            isLight={isLightMode}
            onLikesClick={() => setShowReactions(true)}
            onCommentsClick={() => onCommentClick?.(post)}
          />
        </>
      )}

      {/* ── TEXT-ONLY POST ── */}
      {!post.image_url && !post.video_url && !asArray(post.image_urls).length > 1 && !isVideoPost && post.caption && (
        <TextPostCard
          post={post}
          isLightMode={isLightMode}
          liked={liked}
          fireReacted={fireReacted}
          likesCount={likesCount}
          fireCount={fireCount}
          onLike={handleLike}
          onComment={() => onCommentClick?.(post)}
          onShare={() => setShowShare(true)}
          currentUser={currentUser}
        />
      )}

      {/* Separator */}
      <div className="h-px mx-5 mt-2 spicey-post-separator"
        style={{ background: isLightMode 
          ? 'linear-gradient(to right, transparent, #ECECF2, transparent)' 
          : 'linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)' }} />

      {/* Menu Sheet */}
      <Sheet open={showMenu} onOpenChange={setShowMenu}>
        <SheetContent side="bottom" className="rounded-t-3xl" style={{ background: isLightMode ? '#FFFFFF' : 'hsl(var(--card))', borderColor: isLightMode ? '#E5E5EA' : 'hsl(var(--border))' }}>
          <div className="space-y-1 py-4">
            {/* Admin Actions - ONLY FOR ADMINS */}
            {isAdmin && (
              <>
                <button onClick={() => { setShowMenu(false); setShowEditPost(true); }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-sm rounded-xl transition active:scale-98"
                  style={{ color: '#2563eb', background: 'transparent' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,99,235,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <Edit3 className="w-4 h-4" /> <span className="font-semibold">Edit Post</span>
                </button>
                <button onClick={async () => {
                  setShowMenu(false);
                  if (confirm('Delete this post?')) {
                    setHidden(true);
                    base44.entities.Post.delete(post.id).catch(() => setHidden(false));
                  }
                }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-sm rounded-xl transition"
                  style={{ color: '#dc2626' }}>
                  <Trash2 className="w-4 h-4" /> <span className="font-semibold">Delete Post</span>
                </button>
                <button onClick={async () => {
                  setShowMenu(false);
                  await base44.functions.invoke('adminModerateUser', { target_user_id: post.author_id, action: 'warn', reason: 'Content violation' });
                  toast.success('User warned');
                }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-sm rounded-xl transition"
                  style={{ color: '#d97706' }}>
                  <AlertTriangle className="w-4 h-4" /> <span className="font-semibold">Warn User</span>
                </button>
                <button onClick={async () => {
                  setShowMenu(false);
                  await base44.functions.invoke('adminModerateUser', { target_user_id: post.author_id, action: 'lock', reason: 'Content violation - account locked' });
                  toast.success('Account locked');
                }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-sm rounded-xl transition"
                  style={{ color: '#ea580c' }}>
                  <Lock className="w-4 h-4" /> <span className="font-semibold">Lock Account</span>
                </button>
                <button onClick={async () => {
                  setShowMenu(false);
                  await base44.functions.invoke('adminModerateUser', { target_user_id: post.author_id, action: 'suspend', reason: 'Content violation - account suspended' });
                  toast.success('Account suspended');
                }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-sm rounded-xl transition"
                  style={{ color: '#dc2626' }}>
                  <Ban className="w-4 h-4" /> <span className="font-semibold">Suspend Account</span>
                </button>
              </>
            )}

            {/* Owner-only options */}
            {currentUser?.id === post.author_id && (
              <>
                <button onClick={async () => {
                  setShowMenu(false);
                  if (confirm('Delete this post permanently?')) {
                    setHidden(true);
                    base44.entities.Post.delete(post.id).catch(() => setHidden(false));
                    toast.success('Post deleted');
                  }
                }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-sm rounded-xl transition"
                  style={{ color: '#dc2626', border: '1px solid rgba(220,38,38,0.2)' }}>
                  <Trash2 className="w-4 h-4" /> <span className="font-semibold">Delete My Post</span>
                </button>
                <button onClick={async () => {
                  setShowMenu(false);
                  const next = post.visibility === 'public' ? 'friends' : post.visibility === 'friends' ? 'private' : 'public';
                  await base44.entities.Post.update(post.id, { visibility: next });
                  toast.success(`Post is now ${next}`);
                }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-sm rounded-xl transition"
                  style={{ color: '#2563eb', border: '1px solid rgba(37,99,235,0.2)' }}>
                  {post.visibility === 'private' ? <Lock className="w-4 h-4" /> : post.visibility === 'friends' ? <Users className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                  <span className="font-semibold">Visibility: {post.visibility === 'public' ? 'Public → Friends' : post.visibility === 'friends' ? 'Friends → Private' : 'Private → Public'}</span>
                </button>
                <button onClick={() => { setShowBoost(true); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-sm rounded-xl transition"
                  style={{ color: '#ea580c' }}>
                  <Zap className="w-4 h-4" /> <span className="font-semibold">Boost Post</span>
                </button>
              </>
            )}

            {/* Regular user options */}
            {currentUser?.id !== post.author_id && (
              <button onClick={() => { setShowFollow(true); setShowMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-sm rounded-xl transition"
                style={{ color: isLightMode ? '#111111' : 'rgba(255,255,255,0.85)' }}>
                <UserPlus className="w-4 h-4" /> <span className="font-semibold">Follow @{post.author_username}</span>
              </button>
            )}
            <button onClick={() => { setShowStats(true); setShowMenu(false); }}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-sm rounded-xl transition"
              style={{ color: isLightMode ? '#111111' : 'rgba(255,255,255,0.85)' }}>
              <BarChart2 className="w-4 h-4" /> <span className="font-semibold">View Insights</span>
            </button>
            <button onClick={() => { setHidden(true); setShowMenu(false); }}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-sm rounded-xl transition"
              style={{ color: isLightMode ? '#111111' : 'rgba(255,255,255,0.85)' }}>
              <EyeOff className="w-4 h-4" /> <span className="font-semibold">Hide post</span>
            </button>
            {currentUser?.id !== post.author_id && (
              <>
                <button onClick={() => { setShowReport(true); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-sm rounded-xl transition"
                  style={{ color: '#dc2626' }}>
                  <Flag className="w-4 h-4" /> <span className="font-semibold">Report post</span>
                </button>
                <button onClick={async () => {
                  setShowMenu(false);
                  setHidden(true);
                  if (currentUser) {
                    base44.entities.Block.create({ blocker_id: currentUser.id, blocked_id: post.author_id, blocked_username: post.author_username }).catch(() => {});
                  }
                }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-sm rounded-xl transition"
                  style={{ color: '#dc2626' }}>
                  <Ban className="w-4 h-4" /> <span className="font-semibold">Block @{post.author_username}</span>
                </button>
              </>
            )}
            {isAdmin && (
              <button onClick={async () => {
                  setShowMenu(false);
                  if (confirm('Delete this post?')) {
                    setHidden(true);
                    base44.entities.Post.delete(post.id).catch(() => setHidden(false));
                  }
                }}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-sm rounded-xl transition"
                style={{ color: '#dc2626' }}>
                <Trash2 className="w-4 h-4" /> <span className="font-semibold">Delete post</span>
              </button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Admin Quick Action Sheet - ONLY FOR ADMINS */}
      <Sheet open={showAdminMenu} onOpenChange={setShowAdminMenu}>
        <SheetContent side="bottom" className="bg-card border-border rounded-t-3xl">
          <div className="space-y-3 py-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ef4444, #f59e0b)' }}>
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-white">Admin Quick Actions</p>
                <p className="text-xs text-white/50">Moderate @{post.author_username}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => {
                setShowAdminMenu(false);
                setShowEditPost(true);
              }}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 active:scale-95 transition-transform">
                <Edit3 className="w-6 h-6 text-blue-400" />
                <span className="text-xs font-bold text-blue-400">Edit Post</span>
              </button>

              <button onClick={async () => {
                await base44.entities.Post.delete(post.id);
                setHidden(true);
                setShowAdminMenu(false);
                toast.success('Post deleted');
              }}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 active:scale-95 transition-transform">
                <Trash2 className="w-6 h-6 text-red-400" />
                <span className="text-xs font-bold text-red-400">Delete Post</span>
              </button>

              <button onClick={async () => {
                await base44.functions.invoke('adminModerateUser', {
                  target_user_id: post.author_id,
                  action: 'warn',
                  reason: 'Content violation'
                });
                setShowAdminMenu(false);
                toast.success('User warned');
              }}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 active:scale-95 transition-transform">
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
                <span className="text-xs font-bold text-yellow-400">Warn User</span>
              </button>

              <button onClick={async () => {
                await base44.functions.invoke('adminModerateUser', {
                  target_user_id: post.author_id,
                  action: 'lock',
                  reason: 'Content violation - account locked'
                });
                setShowAdminMenu(false);
                toast.success('Account locked');
              }}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 active:scale-95 transition-transform">
                <Lock className="w-6 h-6 text-orange-400" />
                <span className="text-xs font-bold text-orange-400">Lock Account</span>
              </button>

              <button onClick={async () => {
                await base44.functions.invoke('adminModerateUser', {
                  target_user_id: post.author_id,
                  action: 'suspend',
                  reason: 'Content violation - account suspended'
                });
                setShowAdminMenu(false);
                toast.success('Account suspended');
              }}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 active:scale-95 transition-transform">
                <Ban className="w-6 h-6 text-red-400" />
                <span className="text-xs font-bold text-red-400">Suspend</span>
              </button>
            </div>

            <button onClick={() => setShowAdminMenu(false)}
              className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-semibold active:scale-95 transition-transform">
              Cancel
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Panels */}
      <ReactionsSheet open={showReactions} onClose={() => setShowReactions(false)} post={{ ...post, likes_count: likesCount, fire_count: fireCount }} currentUser={currentUser} liked={liked} fireReacted={fireReacted} />
      <ShareSheet open={showShare} onClose={() => setShowShare(false)} post={post} />
      <PostStatsSheet open={showStats} onClose={() => setShowStats(false)} post={{ ...post, likes_count: likesCount, fire_count: fireCount }} />
      <FollowSheet open={showFollow} onClose={() => setShowFollow(false)} username={post.author_username} />
      <ReportSheet open={showReport} onClose={() => setShowReport(false)} postId={post.id} reportedUserId={post.author_id} />
      <BoostPostModal open={showBoost} onClose={() => setShowBoost(false)} post={post} />


      <EditPostModal
        open={showEditPost}
        onClose={() => setShowEditPost(false)}
        post={post}
        onSuccess={() => {
          // Refresh post data if needed
        }}
      />
    </div>
  );
}
