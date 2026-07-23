import React, { useState, useEffect, useCallback, memo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import Header from '../components/feed/Header.jsx';
import StoryBar from '../components/feed/StoryBar';
import PostCard from '../components/feed/PostCard.jsx';
import TrendingNow from '../components/feed/TrendingNow';
const MemoPostCard = memo(PostCard);
import CommentsSheet from '../components/feed/CommentsSheet';
import TagPostsModal from '../components/feed/TagPostsModal';
import ShareSheet from '../components/panels/ShareSheet.jsx';
import ReactionsSheet from '../components/panels/ReactionsSheet.jsx';
import VerifiedBadge from '../components/shared/VerifiedBadge.jsx';
import {
  Bell,
  ChevronRight,
  Flame,
  Heart,
  Hash,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Navigation,
  Search,
  Send,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  UserRoundPlus,
} from 'lucide-react';
import AIAssistantSheet from '../components/panels/AIAssistantSheet.jsx';
import AIOrb from '../components/ai/AIOrb';
import AITalkMode from '../components/ai/AITalkMode';
import { AIProvider, useAI } from '@/lib/AIContext';
import ActiveLiveBar from '../components/feed/ActiveLiveBar.jsx';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Utility to ensure array safety
const asArray = (v) => Array.isArray(v) ? v : [];

const TRENDING_TAGS = ['#SpiceyNight', '#UrbanVibes', '#GlowUp', '#NoFilter', '#AfterDark'];

const PREMIUM_MOOD_REACTIONS = [
  { key: 'smile', emoji: '😊', label: 'Smile' },
  { key: 'cry', emoji: '😭', label: 'Cry' },
  { key: 'sad', emoji: '😔', label: 'Sad' },
  { key: 'happy', emoji: '😄', label: 'Happy' },
  { key: 'wow', emoji: '😮', label: 'Wow' },
];

const FASHION_FEED_IMAGES = [
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&h=1250&fit=crop&q=92',
  'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=900&h=1250&fit=crop&q=92',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&h=1250&fit=crop&q=92',
  'https://images.unsplash.com/photo-1485178575877-1a13bf489dfe?w=900&h=1250&fit=crop&q=92',
  'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=900&h=1250&fit=crop&q=92',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=900&h=1250&fit=crop&q=92',
  'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=900&h=1250&fit=crop&q=92',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&h=1250&fit=crop&q=92',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=900&h=1250&fit=crop&q=92',
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=900&h=1250&fit=crop&q=92',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=900&h=1250&fit=crop&q=92',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&h=1250&fit=crop&q=92',
  'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=900&h=1250&fit=crop&q=92',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900&h=1250&fit=crop&q=92',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=900&h=1250&fit=crop&q=92',
  'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=900&h=1250&fit=crop&q=92',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=900&h=1250&fit=crop&q=92',
  'https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=900&h=1250&fit=crop&q=92',
  'https://images.unsplash.com/photo-1512316609839-ce289d3eba0a?w=900&h=1250&fit=crop&q=92',
  'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=900&h=1250&fit=crop&q=92',
];

function getFashionImageSet(postIndex = 0, count = 1) {
  const start = (Number(postIndex) * 7) % FASHION_FEED_IMAGES.length;
  return Array.from({ length: count }, (_, index) => (
    `${FASHION_FEED_IMAGES[(start + index) % FASHION_FEED_IMAGES.length]}&spiceyFresh=20260717stable_${postIndex}_${index}`
  ));
}

function withFashionFeedImages(post, index) {
  const hasPhoto = Boolean(post?.image_url) || asArray(post?.image_urls).length > 0;
  if (!hasPhoto) return post;

  const imageCount = Math.max(1, asArray(post.image_urls).length || 1);
  const imageSet = getFashionImageSet(index, imageCount);

  return {
    ...post,
    image_url: imageSet[0],
    image_urls: asArray(post.image_urls).length > 0 ? imageSet : post.image_urls,
  };
}

function TrendingBar() {
  const [isLight, setIsLight] = useState(false);
  useEffect(() => {
    const check = () => setIsLight(document.documentElement.classList.contains('light-mode'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  if (!isLight) {
    // Dark mode — unchanged
    return (
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 mb-2.5">
          <TrendingUp className="w-4 h-4 text-orange-500" />
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.6)' }}>Trending</span>
        </div>
        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {asArray(TRENDING_TAGS).map((tag, i) => (
            <button key={tag}
              className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold active:scale-95 transition-transform"
              style={{
                background: i === 0 ? 'linear-gradient(135deg, rgba(255,80,0,0.22), rgba(220,30,120,0.22))' : 'rgba(255,255,255,0.05)',
                border: i === 0 ? '1px solid rgba(255,80,0,0.4)' : '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.8)',
              }}>
              {i === 0 && <Flame className="w-3 h-3 inline mr-1 text-orange-400" />}
              {tag}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Light mode — Instagram/Snapchat style
  return (
    <div className="px-4 pt-3 pb-2">
      <div className="flex items-center gap-1.5 mb-3">
        <Flame className="w-4 h-4" style={{ color: '#FF6B35' }} />
        <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#000000' }}>Trending Now</span>
      </div>
      <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {asArray(TRENDING_TAGS).map((tag, i) => (
          <button key={tag}
            className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold active:scale-95 transition-transform"
            style={{
              background: i === 0 ? 'linear-gradient(135deg, #FF6B35, #e91e8c)' : '#F0F0F0',
              color: i === 0 ? '#FFFFFF' : '#000000',
              boxShadow: i === 0 ? '0 2px 8px rgba(255,107,53,0.35)' : 'none',
            }}>
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}

// Global user cache to prevent rate limiting
const USER_CACHE = { user: null, fetched: false };

function cleanText(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : '';
}

function pickAvatar(...values) {
  return values.map(cleanText).find(Boolean) || '';
}

function userIdCandidates(user = {}) {
  return [user.id, user.user_id, user.auth_user_id, user.created_by].map(cleanText).filter(Boolean);
}

function postAuthorIdCandidates(post = {}) {
  return [post.author_id, post.user_id, post.created_by, post.owner_id, post.profile_user_id].map(cleanText).filter(Boolean);
}

function isOwnPost(post, user) {
  const mine = new Set(userIdCandidates(user));
  return postAuthorIdCandidates(post).some(id => mine.has(id));
}

const isVideoAvatarUrl = (url = '') => /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(String(url));

function FeedAvatarMedia({ src, alt, className = '', fallbackName = 'User' }) {
  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName || 'User')}&background=ff5500&color=fff&size=180`;
  const mediaSrc = pickAvatar(src) || fallback;

  if (isVideoAvatarUrl(mediaSrc)) {
    return (
      <video
        src={`${mediaSrc}#t=0.1`}
        aria-label={alt}
        className={className}
        muted
        playsInline
        loop
        autoPlay
      />
    );
  }

  return (
    <img
      src={mediaSrc}
      alt={alt}
      className={className}
      onError={(event) => {
        if (event.currentTarget.src !== fallback) event.currentTarget.src = fallback;
      }}
    />
  );
}

function AIFloatingSection() {
  const { phase } = useAI();
  const [talkOpen, setTalkOpen] = React.useState(false);
  return (
    <>
      {!talkOpen && (
        <div style={{ position: 'fixed', right: 18, bottom: 'calc(90px + env(safe-area-inset-bottom, 0px))', zIndex: 200, pointerEvents: 'auto' }}>
          <AIOrb onClick={() => setTalkOpen(true)} status={phase === 'stopped' ? 'idle' : phase} />
        </div>
      )}
      {talkOpen && (
        <AITalkMode onClose={() => setTalkOpen(false)} />
      )}
    </>
  );
}

function FeedAIPromoCard({ onOpen }) {
  return (
    <section className="spicey-feed-ai-card">
      <div className="spicey-feed-ai-orb">
        <img
          src="https://media.base44.com/images/public/69fe90d3bbe7ad47925e4a0a/a645abc1a_6ab1672f-73ff-4c98-a1ef-817016549a2f.png"
          alt=""
        />
      </div>
      <div className="spicey-feed-ai-copy">
        <div className="spicey-feed-ai-title">
          <strong>Spicey AI</strong>
          <span>New</span>
        </div>
        <p>Your creative partner for captions, hashtags, ideas and more.</p>
      </div>
      <button type="button" onClick={onOpen} className="spicey-feed-ai-try">
        Try AI <span>✦</span>
      </button>
    </section>
  );
}

function FeedTabs() {
  return (
    <nav className="spicey-feed-tabs" aria-label="Feed tabs">
      <button type="button" className="active">For You</button>
      <button type="button">Following</button>
      <button type="button">Trending</button>
    </nav>
  );
}

const PREMIUM_STORIES = [
  {
    name: 'Your Story',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=180&h=180&fit=crop&crop=face&q=90',
    self: true,
  },
  {
    name: 'Valon',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=180&h=180&fit=crop&crop=face&q=90',
  },
  {
    name: 'Vlora',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=180&h=180&fit=crop&crop=face&q=90',
  },
  {
    name: 'Ardian',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=180&h=180&fit=crop&crop=face&q=90',
  },
  {
    name: 'John',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=180&h=180&fit=crop&crop=face&q=90',
  },
];

const PREMIUM_TRENDING = [
  { tag: '#SpiceyLife', posts: '12.4K posts', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=360&h=180&fit=crop&q=90' },
  { tag: '#SummerVibes', posts: '8.7K posts', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=360&h=180&fit=crop&q=90' },
  { tag: '#Reelt', posts: '5.3K posts', image: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=360&h=180&fit=crop&q=90' },
];

function PremiumPosterText({ caption }) {
  const text = String(caption || '').replace(/\s+/g, ' ').trim();
  if (!text) return null;
  const words = text.split(' ').filter(Boolean);
  const titleWords = words.slice(0, Math.min(2, words.length));
  const titleLines = titleWords
    .map(word => word.replace(/[^\p{L}\p{N}]+/gu, '').toUpperCase())
    .filter(Boolean);
  const rest = words.slice(titleWords.length).join(' ');

  return (
    <div className="premium-poster-copy">
      <div className="premium-poster-title">
        {titleLines.map(line => <span key={line}>{line}</span>)}
      </div>
      {rest && <div className="premium-poster-subtitle">{rest}</div>}
    </div>
  );
}

function PremiumFeedLikeEffect({ burst }) {
  return (
    <AnimatePresence>
      {burst > 0 && (
        <motion.div
          key={burst}
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

function PremiumFeedFireEffect({ burst, active }) {
  return (
    <>
      <AnimatePresence>
        {burst > 0 && (
          <motion.div
            key={burst}
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

function PremiumPostCard({ post, index = 0, onCommentClick, currentUser }) {
  const rawImages = asArray(post?.image_urls);
  const images = rawImages.length ? rawImages : [post?.image_url || FASHION_FEED_IMAGES[index % FASHION_FEED_IMAGES.length]];
  const postKey = post?.id || post?.image_url || `premium-${index}`;
  const swipeStartRef = React.useRef(null);
  const [photoIndex, setPhotoIndex] = React.useState(0);
  const [reactions, setReactions] = React.useState(() => {
    try {
      const store = JSON.parse(localStorage.getItem('spicey_premium_reactions_v2') || '{}') || {};
      return { like: false, fire: false, wow: false, share: false, ...(store[postKey] || {}) };
    } catch {
      return { like: false, fire: false, wow: false, share: false };
    }
  });
  const [shareOpen, setShareOpen] = React.useState(false);
  const [reactionsOpen, setReactionsOpen] = React.useState(false);
  const [activityTab, setActivityTab] = React.useState('all');
  const [likeBurst, setLikeBurst] = React.useState(0);
  const [fireBurst, setFireBurst] = React.useState(0);
  const [moodPickerOpen, setMoodPickerOpen] = React.useState(false);
  const likeBurstTimerRef = React.useRef(null);
  const fireBurstTimerRef = React.useRef(null);
  const moodPressTimerRef = React.useRef(null);
  const moodLongPressRef = React.useRef(false);
  const moodControlRef = React.useRef(null);
  const reactionRequestRef = React.useRef({});
  const heroImage = images[photoIndex] || images[0];
  const authorAvatar = post?.author_avatar || PREMIUM_STORIES[(index % (PREMIUM_STORIES.length - 1)) + 1]?.image || PREMIUM_STORIES[0].image;
  const authorName = post?.author_name || ['Vlora Dervishi', 'Valon Dervishi', 'Ardian Dervishi'][index % 3];
  const caption = post?.caption || 'Sunset mode 🌅 ✨';
  const count = Math.max(1, images.length);
  const likeCount = (post?.likes_count || 1200) + (reactions.like ? 1 : 0);
  const fireCount = (post?.fire_count || 87) + (reactions.fire ? 1 : 0);
  const wowCount = (post?.wow_count || 34) + (reactions.wow ? 1 : 0);
  const commentsCount = post?.comments_count || 32;
  const shareCount = (post?.shares_count || 12) + (reactions.share ? 1 : 0);
  const selectedMood = PREMIUM_MOOD_REACTIONS.find(item => item.key === reactions.mood) || PREMIUM_MOOD_REACTIONS[0];
  React.useEffect(() => () => {
    window.clearTimeout(likeBurstTimerRef.current);
    window.clearTimeout(fireBurstTimerRef.current);
    window.clearTimeout(moodPressTimerRef.current);
  }, []);
  React.useEffect(() => {
    if (!post?.id || !currentUser?.id) return;
    let cancelled = false;
    base44.entities.Reaction.filter({ post_id: post.id, user_id: currentUser.id })
      .then((rows = []) => {
        if (cancelled) return;
        const serverState = rows.reduce((state, row) => ({ ...state, [row.type]: true }), {});
        setReactions((previous) => ({ ...previous, ...serverState }));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [post?.id, currentUser?.id]);
  React.useEffect(() => {
    if (!moodPickerOpen) return undefined;
    const closePicker = (event) => {
      if (!moodControlRef.current?.contains(event.target)) setMoodPickerOpen(false);
    };
    document.addEventListener('pointerdown', closePicker);
    return () => document.removeEventListener('pointerdown', closePicker);
  }, [moodPickerOpen]);
  const toggleReaction = async (key) => {
    if (reactionRequestRef.current[key]) return;
    const nextActive = !reactions[key];
    const next = { ...reactions, [key]: nextActive };
    setReactions(next);
    try {
      const store = JSON.parse(localStorage.getItem('spicey_premium_reactions_v2') || '{}') || {};
      store[postKey] = next;
      localStorage.setItem('spicey_premium_reactions_v2', JSON.stringify(store));
    } catch {}
    if (nextActive && key === 'like') {
      window.clearTimeout(likeBurstTimerRef.current);
      setLikeBurst(prev => prev + 1);
      likeBurstTimerRef.current = window.setTimeout(() => setLikeBurst(0), 900);
    }
    if (nextActive && key === 'fire') {
      window.clearTimeout(fireBurstTimerRef.current);
      setFireBurst(prev => prev + 1);
      fireBurstTimerRef.current = window.setTimeout(() => setFireBurst(0), 900);
    }
    if (!post?.id || !currentUser?.id) return;
    reactionRequestRef.current[key] = true;
    try {
      const response = await base44.functions.invoke('toggleReaction', { post_id: post.id, type: key });
      const action = response?.data?.action || response?.action;
      if (action && (action === 'added') !== nextActive) {
        setReactions((previous) => ({ ...previous, [key]: action === 'added' }));
      }
    } catch (error) {
      console.warn('[Feed] Reaction kept locally; server save failed:', error?.message || error);
    } finally {
      reactionRequestRef.current[key] = false;
    }
  };
  const handleShare = async () => {
    toggleReaction('share');
    setShareOpen(true);
  };
  const startMoodLongPress = () => {
    moodLongPressRef.current = false;
    window.clearTimeout(moodPressTimerRef.current);
    moodPressTimerRef.current = window.setTimeout(() => {
      moodLongPressRef.current = true;
      setMoodPickerOpen(true);
    }, 360);
  };
  const cancelMoodLongPress = () => {
    window.clearTimeout(moodPressTimerRef.current);
  };
  const handleMoodClick = (event) => {
    if (moodLongPressRef.current) {
      moodLongPressRef.current = false;
      event.preventDefault();
      return;
    }
    toggleReaction('wow');
  };
  const selectMoodReaction = (mood) => {
    const next = { ...reactions, wow: true, mood: mood.key };
    setReactions(next);
    try {
      const store = JSON.parse(localStorage.getItem('spicey_premium_reactions_v2') || '{}') || {};
      store[postKey] = next;
      localStorage.setItem('spicey_premium_reactions_v2', JSON.stringify(store));
    } catch {}
    setMoodPickerOpen(false);
  };
  const openActivity = (tab) => {
    setActivityTab(tab);
    setReactionsOpen(true);
  };
  const nextPhoto = () => setPhotoIndex(prev => (prev + 1) % count);
  const prevPhoto = () => setPhotoIndex(prev => (prev - 1 + count) % count);
  const handleSwipeStart = (event) => {
    if (count <= 1) return;
    const point = event.touches?.[0] || event;
    swipeStartRef.current = { x: point.clientX, y: point.clientY };
  };
  const handleSwipeEnd = (event) => {
    if (count <= 1 || !swipeStartRef.current) return;
    const point = event.changedTouches?.[0] || event;
    const dx = point.clientX - swipeStartRef.current.x;
    const dy = point.clientY - swipeStartRef.current.y;
    swipeStartRef.current = null;
    if (Math.abs(dx) < 36 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) nextPhoto();
    else prevPhoto();
  };

  return (
    <>
    <article className="spicey-premium-post-card">
      <div className="post-head">
        <FeedAvatarMedia src={authorAvatar} alt={authorName} fallbackName={authorName} />
        <div>
          <strong>{authorName}<VerifiedBadge type="vip" size="sm" /></strong>
          <span>{index === 0 ? '2h ago' : `${index + 2}h ago`}</span>
        </div>
        <button type="button" aria-label="More" onClick={() => setShareOpen(true)}><MoreHorizontal size={22} /></button>
      </div>
      <div
        className="post-media"
        onTouchStart={handleSwipeStart}
        onTouchEnd={handleSwipeEnd}
        onMouseDown={handleSwipeStart}
        onMouseUp={handleSwipeEnd}
      >
        <img src={heroImage} alt="" />
        <PremiumFeedLikeEffect burst={likeBurst} />
        <PremiumFeedFireEffect burst={fireBurst} active={reactions.fire} />
        <PremiumPosterText caption={caption} />
        {count > 1 && (
          <>
            <div className="photo-dots">
              {images.map((_, dotIndex) => (
                <i key={dotIndex} className={dotIndex === photoIndex ? 'active' : ''} />
              ))}
            </div>
          </>
        )}
      </div>
      <div className="post-under-photo-activity" aria-label="Post activity">
        <button type="button" className="post-under-photo-summary" onClick={() => openActivity('all')} aria-label="View everyone who interacted">
          <span className="post-under-photo-users" aria-hidden="true">
            <img src={PREMIUM_STORIES[1].image} alt="" />
            <img src={PREMIUM_STORIES[2].image} alt="" />
            <img src={PREMIUM_STORIES[4].image} alt="" />
          </span>
          <span className="post-under-photo-copy">Liked by <b>jessica.l</b></span>
          <span className="post-under-photo-counts" aria-label={`${likeCount} likes and ${fireCount} fire reactions`}>
            <span className="likes"><Heart size={12} />{likeCount > 999 ? `${(likeCount / 1000).toFixed(1)}K` : likeCount}</span>
            <span className="fires"><Flame size={12} />{fireCount}</span>
          </span>
        </button>
      </div>
      <div className="post-actions">
        <button type="button" className={reactions.like ? 'active like' : 'like'} aria-label="Like" onClick={() => toggleReaction('like')}>
          <Heart size={28} />
          <small>{likeCount > 999 ? `${(likeCount / 1000).toFixed(1)}K` : likeCount}</small>
        </button>
        <button type="button" className={reactions.fire ? 'active fire' : 'fire'} aria-label="Fire" onClick={() => toggleReaction('fire')}>
          <Flame size={27} />
          <small>{fireCount}</small>
        </button>
        <div className="spicey-mood-control" ref={moodControlRef}>
          <button
            type="button"
            className={reactions.wow ? 'active wow' : 'wow'}
            aria-label={`Mood reaction: ${selectedMood.label}. Long press for more`}
            aria-expanded={moodPickerOpen}
            onPointerDown={startMoodLongPress}
            onPointerUp={cancelMoodLongPress}
            onPointerCancel={cancelMoodLongPress}
            onContextMenu={(event) => { event.preventDefault(); setMoodPickerOpen(true); }}
            onClick={handleMoodClick}
          >
            <span className="spicey-mood-button-emoji" aria-hidden="true">{selectedMood.emoji}</span>
            <small>{wowCount}</small>
          </button>
          <AnimatePresence>
            {moodPickerOpen && (
              <motion.div
                className="spicey-mood-picker"
                role="menu"
                aria-label="Choose mood reaction"
                initial={{ opacity: 0, scale: 0.82, x: 8 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: 6 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
              >
                {PREMIUM_MOOD_REACTIONS.map(mood => (
                  <button
                    type="button"
                    role="menuitem"
                    key={mood.key}
                    className={selectedMood.key === mood.key && reactions.wow ? 'selected' : ''}
                    aria-label={mood.label}
                    onClick={() => selectMoodReaction(mood)}
                  >
                    <span aria-hidden="true">{mood.emoji}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button type="button" aria-label="Comment" onClick={() => onCommentClick(post)}><MessageCircle size={29} /></button>
        <button type="button" className={reactions.share ? 'active share' : 'share'} aria-label="Share" onClick={handleShare}>
          <Send size={28} />
          <small>{shareCount}</small>
        </button>
      </div>
    </article>
    <ReactionsSheet
      open={reactionsOpen}
      onClose={() => setReactionsOpen(false)}
      post={{ ...post, likes_count: likeCount, fire_count: fireCount, comments_count: commentsCount, shares_count: shareCount }}
      currentUser={currentUser}
      liked={reactions.like}
      fireReacted={reactions.fire}
      initialTab={activityTab}
    />
    <ShareSheet
      open={shareOpen}
      onClose={() => setShareOpen(false)}
      post={{ ...post, image_url: heroImage, caption }}
    />
    </>
  );
}

function PremiumMapPreview({ onOpen }) {
  return (
    <section className="spicey-premium-map-card">
      <div className="map-copy">
        <span><MapPin size={16} /> Spicey Map</span>
        <h3>Find creators near you</h3>
        <p>Live spots, stories and people around your city.</p>
      </div>
      <div className="map-visual">
        {PREMIUM_STORIES.slice(1, 5).map((story, index) => (
          <span key={story.name} className={`pin pin-${index}`}>
            <img src={story.image} alt="" />
          </span>
        ))}
        <i className="route" />
      </div>
      <button type="button" onClick={onOpen}>
        Open <Navigation size={16} />
      </button>
    </section>
  );
}

function PremiumLightFeed({ posts, isDark = false, currentUser, onVoiceOpen, onCommentClick, onTagClick, onMapOpen, onRenderOpen, onSearchOpen, onSettingsOpen, onNotificationsOpen, onStoryOpen, onCreateOpen }) {
  const feedPosts = asArray(posts).length ? asArray(posts) : [{ id: 'premium-demo' }];
  const [activeTab, setActiveTab] = React.useState('For You');
  const { data: activeStoryCreators = [] } = useQuery({
    queryKey: ['premium-feed-story-creators'],
    queryFn: async () => {
      const now = new Date().toISOString();
      const stories = asArray(await base44.entities.Story.list('-created_date', 40))
        .filter((story) => story?.user_id && (!story.expires_at || story.expires_at > now));
      const latestByUser = new Map();
      stories.forEach((story) => {
        if (!latestByUser.has(story.user_id)) latestByUser.set(story.user_id, story);
      });

      return Promise.all(Array.from(latestByUser.values()).slice(0, 8).map(async (story) => {
        const profiles = await base44.entities.UserProfile
          .filter({ user_id: story.user_id }, '-created_date', 1)
          .catch(() => []);
        const profile = asArray(profiles)[0];
        const name = profile?.full_name || profile?.username || story.username || 'Spicey User';
        return {
          name,
          image: profile?.avatar_url || story.user_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6d28d9&color=fff&size=180`,
          creatorId: story.user_id,
        };
      }));
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });
  const clipCreators = React.useMemo(() => {
    const seen = new Set();
    return asArray(posts)
      .filter((post) => post?.post_type === 'reel' || post?.type === 'reel' || post?.media_type === 'reel')
      .filter((post) => {
        const creatorId = post.author_id || post.user_id || post.author_username;
        if (!creatorId || seen.has(creatorId)) return false;
        seen.add(creatorId);
        return true;
      })
      .map((post) => ({
        name: post.author_name || post.author_username || 'Creator',
        image: post.author_avatar || PREMIUM_STORIES[1].image,
        creatorId: post.author_id || post.user_id || '',
      }));
  }, [posts]);
  const storyAvatars = React.useMemo(() => {
    const currentUserId = currentUser?.user_id || currentUser?.id;
    const seen = new Set();
    return [...asArray(activeStoryCreators), ...clipCreators]
      .filter((story) => story.creatorId && story.creatorId !== currentUserId)
      .filter((story) => {
        if (seen.has(story.creatorId)) return false;
        seen.add(story.creatorId);
        return true;
      })
      .slice(0, 6);
  }, [activeStoryCreators, clipCreators, currentUser]);

  const currentUserName = currentUser?.full_name || currentUser?.username || currentUser?.email?.split('@')[0] || 'You';
  const currentUserAvatar = pickAvatar(currentUser?.avatar_url, currentUser?.photo_url, currentUser?.picture)
    || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUserName)}&background=ff5500&color=fff&size=180`;

  return (
    <div className="spicey-premium-feed-shell">
      <header className="spicey-premium-header">
        <div className="spicey-premium-corner-logo" aria-label="Spicey">
          <img src="/spicey-assets/spicey-real-s-logo-20260723.png" alt="" />
        </div>
        <div className="spicey-premium-wordmark" aria-label="Spicey">
          <img
            className="spicey-new-wordmark"
            src="/spicey-assets/spicey-wordmark-20260722.png"
            alt="Spicey"
          />
        </div>
        <div className="spicey-premium-actions">
          <button type="button" aria-label="Search" onClick={onSearchOpen}>
            <Search size={22} />
          </button>
          <button type="button" aria-label="Settings" onClick={onSettingsOpen}>
            <SlidersHorizontal size={22} />
          </button>
          <button type="button" aria-label="Notifications" onClick={onNotificationsOpen}>
            <Bell size={22} />
            <b>8</b>
          </button>
        </div>
      </header>

      <section className="spicey-premium-stories" aria-label="Stories">
        <button type="button" className="spicey-premium-story spicey-premium-story-own" onClick={onCreateOpen}>
          <span className="ring">
            <FeedAvatarMedia src={currentUserAvatar} alt="Your Story" fallbackName={currentUserName} />
            <i>+</i>
          </span>
          <small>Your Story</small>
        </button>
        {storyAvatars.map((story) => (
          <button type="button" key={story.creatorId || story.name} className="spicey-premium-story" onClick={() => onStoryOpen(story.creatorId)}>
            <span className="ring">
              <FeedAvatarMedia src={story.image} alt={story.name} fallbackName={story.name} />
              <b />
            </span>
            <small>{story.name}</small>
          </button>
        ))}
        <button type="button" className="spicey-premium-story spicey-premium-story-more more" onClick={() => onStoryOpen()}>
          <span className="ring">
            <UserRoundPlus size={27} />
            <b />
          </span>
          <small>More</small>
        </button>
      </section>

      <section className="spicey-premium-ai-card">
        <div className="ai-orb">
          <img src="https://media.base44.com/images/public/69fe90d3bbe7ad47925e4a0a/a645abc1a_6ab1672f-73ff-4c98-a1ef-817016549a2f.png" alt="" />
        </div>
        <div>
          <h2>AI Talk Mode <span>Live</span></h2>
          <p>Talk with Spicey AI for captions, ideas and anything social.</p>
        </div>
        <button type="button" onClick={onVoiceOpen}>Talk <Sparkles size={17} /></button>
      </section>

      {!isDark && (
        <>
          <nav className="spicey-premium-tabs" aria-label="Feed tabs">
            {['For You', 'Following', 'Trending'].map((tab) => (
              <button type="button" key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>{tab}</button>
            ))}
          </nav>
        </>
      )}

      {feedPosts.map((post, index) => (
        <React.Fragment key={post?.id || `premium-post-${index}`}>
          {index === 0 && (
            <section className="spicey-premium-trending">
              <div className="trend-head">
                <h3>Trending Now <Flame size={17} /></h3>
                <button type="button" onClick={onSearchOpen}>See all <ChevronRight size={15} /></button>
              </div>
              <div className="trend-row">
                <button type="button" className="spicey-trend-nav-card spicey-trend-map-card" onClick={onMapOpen}>
                  <img src="/spicey-assets/map-europe-earth-night-v1.png" alt="Spicey Map over Europe at night" />
                  <span><MapPin size={23} /> Spicey Map</span>
                  <small>Live places</small>
                  <i />
                </button>
                <button type="button" className="spicey-trend-nav-card spicey-trend-render-card" onClick={onSearchOpen}>
                  <img src="https://images.unsplash.com/photo-1485178575877-1a13bf489dfe?w=360&h=520&fit=crop&q=90" alt="" />
                  <span><Sparkles size={23} /> Spicey Discovery</span>
                  <small>Explore now</small>
                  <i />
                </button>
                {PREMIUM_TRENDING.map((topic, trendIndex) => (
                  <button type="button" key={topic.tag} onClick={() => onTagClick(topic.tag)}>
                    <img src={topic.image} alt="" />
                    <span><Hash size={24} /> {topic.tag}</span>
                    <small>{topic.posts}</small>
                    <i className={`wash-${trendIndex}`} />
                  </button>
                ))}
              </div>
            </section>
          )}
          <PremiumPostCard post={post} index={index} onCommentClick={onCommentClick} currentUser={currentUser} />
        </React.Fragment>
      ))}
    </div>
  );
}

export default function Feed() {
  const [commentPost, setCommentPost] = useState(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [talkOpen, setTalkOpen] = useState(false);
  const [isLight, setIsLight] = useState(false);
  const [spiceyColorOn, setSpiceyColorOn] = useState(() => {
    try {
      return localStorage.getItem('spicey_photo_color_mode') !== 'off';
    } catch {
      return true;
    }
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTag, setActiveTag] = useState(null);
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const check = () => {
      const root = document.documentElement;
      const body = document.body;
      const previewTheme = new URLSearchParams(window.location.search).get('previewTheme');
      if (previewTheme === 'light' && !root.classList.contains('light-mode')) {
        root.classList.add('light-mode');
      }
      if (previewTheme === 'dark' && root.classList.contains('light-mode')) {
        root.classList.remove('light-mode');
      }
      const storedTheme = localStorage.getItem('theme') || localStorage.getItem('spicey-theme') || localStorage.getItem('spicey_theme');
      const runtimeIsLight =
        root.classList.contains('light-mode') ||
        body.classList.contains('light-mode') ||
        root.dataset.theme === 'light' ||
        body.dataset.theme === 'light' ||
        storedTheme === 'light';
      setIsLight(previewTheme === 'light' || (previewTheme !== 'dark' && runtimeIsLight));
    };
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    obs.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const syncSpiceyColor = () => {
      try {
        setSpiceyColorOn(localStorage.getItem('spicey_photo_color_mode') !== 'off');
      } catch {
        setSpiceyColorOn(true);
      }
    };
    window.addEventListener('storage', syncSpiceyColor);
    window.addEventListener('spicey-photo-color-change', syncSpiceyColor);
    return () => {
      window.removeEventListener('storage', syncSpiceyColor);
      window.removeEventListener('spicey-photo-color-change', syncSpiceyColor);
    };
  }, []);

  const loadCurrentUser = useCallback(async ({ force = false } = {}) => {
    if (!force && USER_CACHE.user) {
      setCurrentUser(USER_CACHE.user);
      return USER_CACHE.user;
    }
    if (!force && USER_CACHE.fetched) return USER_CACHE.user;

    USER_CACHE.fetched = true;
    try {
      const user = await base44.auth.me();
      if (!user?.id) return null;
      let profile = null;
      try {
        const profiles = await base44.entities.UserProfile.filter({ user_id: user.id }, '-updated_date', 1)
          .catch(() => base44.entities.UserProfile.filter({ user_id: user.id }, '-created_date', 1))
          .catch(() => base44.entities.UserProfile.filter({ user_id: user.id }));
        profile = profiles?.[0] || null;
      } catch (_) {}
      const mergedUser = {
        ...user,
        ...(profile || {}),
        id: user.id,
        user_id: user.id,
        profile_id: profile?.id,
        email: user.email || profile?.email,
        avatar_url: pickAvatar(profile?.avatar_url, user.avatar_url, user.photo_url, user.picture),
        full_name: cleanText(profile?.full_name) || cleanText(user.full_name) || user.email?.split('@')[0] || 'User',
        username: cleanText(profile?.username) || cleanText(user.username) || user.email?.split('@')[0] || 'user',
      };
      USER_CACHE.user = mergedUser;
      setCurrentUser(mergedUser);
      return mergedUser;
    } catch (_) {
      USER_CACHE.fetched = false;
      return null;
    }
  }, []);

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  useEffect(() => {
    const refreshCurrentUser = () => {
      USER_CACHE.fetched = false;
      USER_CACHE.user = null;
      loadCurrentUser({ force: true });
    };
    window.addEventListener('focus', refreshCurrentUser);
    window.addEventListener('spicey-avatar-updated', refreshCurrentUser);
    return () => {
      window.removeEventListener('focus', refreshCurrentUser);
      window.removeEventListener('spicey-avatar-updated', refreshCurrentUser);
    };
  }, [loadCurrentUser]);



  const DEFAULT_POSTS = [
    {
      id: 'demoA',
      author_name: 'Sophia Laurent',
      author_username: 'sophia.laurent',
      author_avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=120&q=80',
      caption: 'Golden hour magic ✨☀️ When the light hits just right and everything feels perfect 💛',
      image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&h=1250&fit=crop&q=92',
      image_urls: [
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&h=1250&fit=crop&q=92',
        'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=900&h=1250&fit=crop&q=92',
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&h=1250&fit=crop&q=92',
      ],
      likes_count: 7842,
      comments_count: 321,
      fire_count: 1203,
      hashtags: ['#GoldenHour', '#SummerGlow', '#GlowUp'],
      created_date: new Date(Date.now() - 300000).toISOString(),
      post_type: 'feed',
    },
    {
      id: 'demoB',
      author_name: 'Isabella Rose',
      author_username: 'isabella.rose',
      author_avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&q=80',
      caption: 'Laughing until my stomach hurts 😂💜 Best day ever with these amazing people!',
      image_url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=900&h=1250&fit=crop&q=92',
      likes_count: 5931,
      comments_count: 274,
      fire_count: 988,
      hashtags: ['#HappyVibes', '#BestFriends', '#NoFilter'],
      created_date: new Date(Date.now() - 600000).toISOString(),
      post_type: 'feed',
    },
    {
      id: 'demoC',
      author_name: 'Mia Castellano',
      author_username: 'mia.cstl',
      author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80',
      caption: 'Beach days forever 🌊👙 Sun, sea, and the best company — nothing else needed! 🐚',
      image_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=900&h=1250&fit=crop&q=92',
      image_urls: [
        'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=900&h=1250&fit=crop&q=92',
        'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=900&h=1250&fit=crop&q=92',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&h=1250&fit=crop&q=92',
      ],
      likes_count: 9214,
      comments_count: 408,
      fire_count: 1540,
      hashtags: ['#BeachVibes', '#Summer2026', '#SummerGirls'],
      created_date: new Date(Date.now() - 450000).toISOString(),
      post_type: 'feed',
    },
    {
      id: 'demoD',
      author_name: 'Leona Blake',
      author_username: 'leona.blake',
      author_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&q=80',
      caption: 'OOTD 🖤 Simplicity is the ultimate sophistication. Thoughts? 👇',
      image_url: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=900&h=1250&fit=crop&q=92',
      likes_count: 6477,
      comments_count: 193,
      fire_count: 872,
      hashtags: ['#OOTD', '#Fashion', '#StyleInspo'],
      created_date: new Date(Date.now() - 750000).toISOString(),
      post_type: 'feed',
    },
    {
      id: 'demoE',
      author_name: 'Sara Mitchell',
      author_username: 'sara.mitchell',
      author_avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&q=80',
      caption: 'Confidence is the best makeup 💄✨ Feeling like a queen today and every day!',
      image_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&h=1250&fit=crop&q=92',
      likes_count: 8340,
      comments_count: 356,
      fire_count: 1420,
      hashtags: ['#Confidence', '#SelfLove', '#BeautyTips'],
      created_date: new Date(Date.now() - 200000).toISOString(),
      post_type: 'feed',
    },
    {
      id: 'demoF',
      author_name: 'Becca Monroe',
      author_username: 'becca.monroe',
      author_avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&q=80',
      caption: 'Weekend with my girls 🥂💕 Life is too short to not celebrate every moment!',
      image_url: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=900&h=1250&fit=crop&q=92',
      image_urls: [
        'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=900&h=1250&fit=crop&q=92',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=900&h=1250&fit=crop&q=92',
      ],
      likes_count: 4812,
      comments_count: 201,
      fire_count: 763,
      hashtags: ['#WeekendVibes', '#GirlsNight', '#HappyMoments'],
      created_date: new Date(Date.now() - 350000).toISOString(),
      post_type: 'feed',
    },
    {
      id: 'demoG',
      author_name: 'Maya Fontaine',
      author_username: 'maya.fontaine',
      author_avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=120&q=80',
      caption: 'Sunsets and good vibes only 🌅🧡 When the sky turns into a painting...',
      image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&h=1250&fit=crop&q=92',
      likes_count: 11203,
      comments_count: 487,
      fire_count: 1890,
      hashtags: ['#SunsetVibes', '#GoldenHour', '#Blessed'],
      created_date: new Date(Date.now() - 550000).toISOString(),
      post_type: 'feed',
    },
    {
      id: 'demoH',
      author_name: 'Zoe Hartley',
      author_username: 'zoe.hartley',
      author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80',
      caption: 'City girl energy 🏙️💋 When the city becomes your playground and every street tells a story!',
      image_url: 'https://images.unsplash.com/photo-1485178575877-1a13bf489dfe?w=900&h=1250&fit=crop&q=92',
      image_urls: [
        'https://images.unsplash.com/photo-1485178575877-1a13bf489dfe?w=900&h=1250&fit=crop&q=92',
        'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=900&h=1250&fit=crop&q=92',
        'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=900&h=1250&fit=crop&q=92',
      ],
      likes_count: 7629,
      comments_count: 298,
      fire_count: 1102,
      hashtags: ['#CityGirl', '#UrbanVibes', '#PowerGirl'],
      created_date: new Date(Date.now() - 680000).toISOString(),
      post_type: 'feed',
    },
    {
      id: 'demo0',
      author_name: 'Diana Ramos',
      author_username: 'diana.ramos',
      author_avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=120&q=80',
      caption: 'Wonderful weekend with the girls 🌸✨ Happiness looks like this!',
      image_urls: [
        'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=900&h=1250&fit=crop&q=92',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&h=1250&fit=crop&q=92',
        'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=900&h=1250&fit=crop&q=92',
      ],
      likes_count: 5420,
      comments_count: 218,
      fire_count: 870,
      hashtags: ['#BestieGoals', '#WeekendVibes', '#HappyGirls'],
      created_date: new Date(Date.now() - 900000).toISOString(),
      post_type: 'feed',
    },
    {
      id: 'demo00',
      author_name: 'Flavia Morgan',
      author_username: 'flavia.morgan',
      author_avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=120&q=80',
      caption: 'Last moments with the crew 💕🎉 These faces, this love!',
      image_urls: [
        'https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=900&h=1250&fit=crop&q=92',
        'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=900&h=1250&fit=crop&q=92',
      ],
      likes_count: 3891,
      comments_count: 142,
      fire_count: 601,
      hashtags: ['#FriendshipGoals', '#PartyNight', '#SpiceyNight'],
      created_date: new Date(Date.now() - 1800000).toISOString(),
      post_type: 'feed',
    },
    {
      id: 'demo000',
      author_name: 'Valeria James',
      author_username: 'valeria.j',
      author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80',
      caption: 'Summer look 2026 ☀️💛 Choose what makes you happy — always!',
      image_urls: [
        'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=900&h=1250&fit=crop&q=92',
        'https://images.unsplash.com/photo-1485178575877-1a13bf489dfe?w=900&h=1250&fit=crop&q=92',
        'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=900&h=1250&fit=crop&q=92',
      ],
      likes_count: 6103,
      comments_count: 289,
      fire_count: 942,
      hashtags: ['#SummerLook', '#GlowUp', '#Fashion'],
      created_date: new Date(Date.now() - 2700000).toISOString(),
      post_type: 'feed',
    },
    {
      id: 'demo1',
      author_name: 'Diana Ramos',
      author_username: 'diana.ramos2',
      author_avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=120&q=80',
      caption: 'Life is beautiful when you surround yourself with good people ✨💕 Every day is a gift!',
      image_url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=900&h=1250&fit=crop&q=92',
      likes_count: 4821,
      comments_count: 193,
      fire_count: 672,
      hashtags: ['#HappyVibes', '#GoodLife', '#Blessed'],
      created_date: new Date(Date.now() - 1800000).toISOString(),
      post_type: 'feed',
    },
    {
      id: 'demo2',
      author_name: 'Flavia Morgan',
      author_username: 'flavia.morgan2',
      author_avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=120&q=80',
      caption: 'Last night with the girls 🎉🥂 So long without seeing each other — our love never expires! Party mode ON 🔥',
      image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&h=1250&fit=crop&q=92',
      likes_count: 6103,
      comments_count: 248,
      fire_count: 891,
      hashtags: ['#PartyNight', '#BestieGoals', '#SpiceyNight'],
      created_date: new Date(Date.now() - 3600000).toISOString(),
      post_type: 'feed',
    },
    {
      id: 'demo3',
      author_name: 'Valeria James',
      author_username: 'valeria.j2',
      author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80',
      caption: 'A smile is the best accessory 😊✨ Feeling happy today and ready to conquer the world!',
      image_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=900&h=1250&fit=crop&q=92',
      likes_count: 3940,
      comments_count: 157,
      fire_count: 543,
      hashtags: ['#GlowUp', '#HappyGirl', '#GoodVibes'],
      created_date: new Date(Date.now() - 5400000).toISOString(),
      post_type: 'feed',
    },
    {
      id: 'demo4',
      author_name: 'Miranda Avery',
      author_username: 'miranda.avery',
      author_avatar: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=120&q=80',
      caption: 'When your bestie texts "how are you?" and you both know you\'re ready for an adventure 😂💜 Our friendship is unmatched!',
      image_url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=900&h=1250&fit=crop&q=92',
      likes_count: 2781,
      comments_count: 312,
      fire_count: 421,
      hashtags: ['#BestFriends', '#FriendshipGoals', '#GoodVibes'],
      created_date: new Date(Date.now() - 7200000).toISOString(),
      post_type: 'feed',
    },
    {
      id: 'demo5',
      author_name: 'Rina Kelley',
      author_username: 'rina.kelley',
      author_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&q=80',
      caption: 'Dancing the night away 💃🎵 This is the energy that keeps us alive! Weekend vibes ❤️‍🔥',
      image_url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=900&h=1250&fit=crop&q=92',
      likes_count: 5230,
      comments_count: 201,
      fire_count: 780,
      hashtags: ['#Dance', '#WeekendParty', '#AfterDark'],
      created_date: new Date(Date.now() - 9000000).toISOString(),
      post_type: 'feed',
    },
    {
      id: 'demo6',
      author_name: 'Aria Stone',
      author_username: 'aria.stone',
      author_avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&q=80',
      caption: 'A good morning starts with coffee and positive energy ☕🌸 May your day be full of smiles and success!',
      image_url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=900&h=1250&fit=crop&q=92',
      likes_count: 1893,
      comments_count: 94,
      fire_count: 287,
      hashtags: ['#MorningVibes', '#Positivity', '#HappyLife'],
      created_date: new Date(Date.now() - 10800000).toISOString(),
      post_type: 'feed',
    },
    {
      id: 'demo7',
      author_name: 'Taylor Hall',
      author_username: 'taylor.hall',
      author_avatar: 'https://images.unsplash.com/photo-1502767089025-6572583495f4?w=120&q=80',
      caption: 'Nothing better than laughing with friends until it hurts 😂❤️ These moments are life\'s greatest treasure!',
      image_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=900&h=1250&fit=crop&q=92',
      likes_count: 3417,
      comments_count: 178,
      fire_count: 502,
      hashtags: ['#FriendshipGoals', '#Laughing', '#BestieVibes'],
      created_date: new Date(Date.now() - 12600000).toISOString(),
      post_type: 'feed',
    },
    {
      id: 'demo8',
      author_name: 'Bella Ray',
      author_username: 'bella.ray',
      author_avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&q=80',
      caption: 'Summer is calling and I must go 🌊☀️ Life is too short not to enjoy every single moment! Live. Laugh. Love. 💛',
      image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&h=1250&fit=crop&q=92',
      likes_count: 4650,
      comments_count: 163,
      fire_count: 610,
      hashtags: ['#SummerVibes', '#BeachLife', '#HappyDays'],
      created_date: new Date(Date.now() - 14400000).toISOString(),
      post_type: 'feed',
    },
  ];

  const { data: fetchedPosts = [] } = useQuery({
    queryKey: ['posts', currentUser?.id, currentUser?.avatar_url],
    queryFn: async () => {
      const posts = await base44.entities.Post.list('-created_date', 20);
      const safePostsList = asArray(posts);
      const feedPosts = safePostsList.filter(p => p.post_type === 'feed' || !p.post_type);
      
      const uniqueAuthorIds = [...new Set(asArray(feedPosts).flatMap(postAuthorIdCandidates).filter(Boolean))];
      let profilesByUserId = {};
      if (uniqueAuthorIds.length > 0) {
        try {
          const profiles = await base44.entities.UserProfile.list('-created_date', 500);
          asArray(profiles).forEach(p => {
            if (p.user_id) profilesByUserId[p.user_id] = p;
            if (p.auth_user_id) profilesByUserId[p.auth_user_id] = p;
          });
        } catch (e) {}
      }
      
      const enrichedPosts = asArray(feedPosts).map(post => {
        const authorIds = postAuthorIdCandidates(post);
        const profile = authorIds.map(id => profilesByUserId[id]).find(Boolean);
        const own = isOwnPost(post, currentUser);
        if (!profile && !own) return post;
        const realName = (profile?.full_name && profile.full_name.trim()) ? profile.full_name : (post.author_name && post.author_name !== 'User' ? post.author_name : null);
        const realAvatar = own
          ? pickAvatar(currentUser?.avatar_url, profile?.avatar_url, post.author_avatar)
          : pickAvatar(profile?.avatar_url, post.author_avatar);
        return {
          ...post,
          author_name: own
            ? (cleanText(currentUser?.full_name) || cleanText(currentUser?.username) || realName || 'You')
            : (realName || profile?.username || post.author_username || 'User'),
          author_avatar: realAvatar,
          author_verification_badge: profile?.verification_badge || null,
          author_is_vip: Boolean(profile?.is_vip || profile?.verification_badge === 'vip'),
          author_verified: Boolean(profile?.verified || profile?.verification_badge),
        };
      });
      
      return enrichedPosts;
    },
    staleTime: 120000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    retry: 0,
  });

  const safePosts = Array.isArray(fetchedPosts) ? fetchedPosts : [];
  // Always show demo posts + any real posts from DB merged together
  console.log('[MAP_CHECK] fetchedPosts', Array.isArray(fetchedPosts), typeof fetchedPosts, Array.isArray(fetchedPosts) ? fetchedPosts.length : fetchedPosts);
  const realPostIds = new Set(safePosts.map(p => p.id));
  const demoPosts = DEFAULT_POSTS.filter(p => !realPostIds.has(p.id));
  const posts = [...safePosts, ...demoPosts].map(withFashionFeedImages);
  console.log('[MAP_CHECK] posts final', Array.isArray(posts), typeof posts, posts.length);

  // Stable callback so PostCard doesn't re-render on parent state changes
  const handleCommentClick = useCallback((p) => setCommentPost(p), []);
  const handleAiOpen = useCallback(() => setAiOpen(true), []);
  const handleTrendingTagClick = useCallback((tag) => {
    setActiveTag(tag);
    setTagModalOpen(true);
  }, []);

  const themeQuery = isLight ? '?previewTheme=light' : '?previewTheme=dark';
  return (
    <>
      <div className={`spicey-feed-page spicey-premium-feed-page spicey-premium-dark-feed ${isLight ? 'spicey-premium-light-feed spicey-photo-color-on' : `${spiceyColorOn ? 'spicey-photo-color-on' : 'spicey-photo-color-off'}`}`}>
        <PremiumLightFeed
          posts={posts}
          isDark={!isLight}
          currentUser={currentUser}
          onVoiceOpen={() => setTalkOpen(true)}
          onCommentClick={handleCommentClick}
          onTagClick={handleTrendingTagClick}
          onMapOpen={() => navigate(`/map${themeQuery}`)}
          onRenderOpen={() => navigate(`/ai?mode=media&previewTheme=${isLight ? 'light' : 'dark'}`)}
          onSearchOpen={() => navigate(`/explore?search=1&previewTheme=${isLight ? 'light' : 'dark'}`)}
          onSettingsOpen={() => navigate(`/settings${themeQuery}`)}
          onNotificationsOpen={() => navigate(`/notifications${themeQuery}`)}
          onStoryOpen={(creatorId) => {
            const params = new URLSearchParams({ previewTheme: isLight ? 'light' : 'dark' });
            if (creatorId) params.set('creator', creatorId);
            navigate(`/reels?${params.toString()}`);
          }}
          onCreateOpen={() => navigate(`/create${themeQuery}`)}
        />
        <AnimatePresence>
          {!!commentPost && (
            <CommentsSheet key={commentPost?.id} post={commentPost} open={!!commentPost} onClose={() => setCommentPost(null)} />
          )}
        </AnimatePresence>
        <AIAssistantSheet open={aiOpen} onClose={() => setAiOpen(false)} />
        {talkOpen && (
          <AIProvider>
            <AITalkMode onClose={() => setTalkOpen(false)} />
          </AIProvider>
        )}
      </div>
      <AnimatePresence>
        {tagModalOpen && activeTag && (
          <TagPostsModal
            tag={activeTag}
            currentUser={currentUser}
            onClose={() => { setTagModalOpen(false); setActiveTag(null); }}
          />
        )}
      </AnimatePresence>
    </>
  );

  return (
    <>
      <div
        className={`spicey-feed-page spicey-fluid-feed-page ${isLight ? 'spicey-light-reference-feed' : ''}`}
        style={{
          minHeight: '100vh',
          paddingBottom: 'calc(164px + env(safe-area-inset-bottom, 0px))',
          background: isLight
            ? '#ffffff'
            : '#030006',
          color: isLight ? '#210d2f' : '#FFFFFF',
          position: 'relative',
          ...(isLight
            ? {
              height: '100dvh',
              overflowX: 'hidden',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-y',
            }
            : {
              overflow: 'hidden',
            }),
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 0,
            background: isLight
              ? '#ffffff'
              : [
                'radial-gradient(circle at 8% 5%, rgba(255,106,0,0.13), transparent 22%)',
                'radial-gradient(circle at 94% 22%, rgba(193,0,255,0.16), transparent 28%)',
                'radial-gradient(circle at 58% 94%, rgba(255,45,85,0.16), transparent 28%)',
                'linear-gradient(180deg, #010102 0%, #050007 46%, #010102 100%)',
              ].join(', '),
          }}
        />
        <div className="spicey-feed-shell spicey-fluid-feed-shell" style={{ position: 'relative', zIndex: 1 }}>
          <Header isLight={isLight} />
          <ActiveLiveBar />
          <StoryBar />
          {isLight && <FeedAIPromoCard onOpen={handleAiOpen} />}
          {isLight && <FeedTabs />}
          {!isLight && <TrendingNow onTagClick={handleTrendingTagClick} activeTag={activeTag} />}

        <div className="spicey-fluid-posts" style={{ paddingTop: 8, paddingBottom: 42 }}>
          {(console.log('[MAP_CHECK] render posts', Array.isArray(posts), posts?.length), asArray(posts)).map((post, index) => (
            <React.Fragment key={post.id}>
              <MemoPostCard post={post} onCommentClick={handleCommentClick} currentUser={currentUser} />
              {isLight && index === 0 && <TrendingNow onTagClick={handleTrendingTagClick} activeTag={activeTag} />}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence>
          {!!commentPost && (
            <CommentsSheet key={commentPost?.id} post={commentPost} open={!!commentPost} onClose={() => setCommentPost(null)} />
          )}
        </AnimatePresence>
        <AIAssistantSheet open={aiOpen} onClose={() => setAiOpen(false)} />
        </div>
      </div>

      {/* Tag Posts Modal */}
      <AnimatePresence>
        {tagModalOpen && activeTag && (
          <TagPostsModal
            tag={activeTag}
            currentUser={currentUser}
            onClose={() => { setTagModalOpen(false); setActiveTag(null); }}
          />
        )}
      </AnimatePresence>

      {/* Floating AI Orb + Talk Mode — wrapped in shared AIProvider */}
      <AIProvider>
        <AIFloatingSection />
      </AIProvider>


    </>
  );
};
