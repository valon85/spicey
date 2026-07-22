import React, { useState, useEffect, useRef } from 'react';

import { Plus, ImagePlus, Video, Type, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import ImageWithFallback from './ImageWithFallback';

// Utility to ensure array safety
const asArray = (v) => Array.isArray(v) ? v : [];

const FAKE_REELS = [
  { id: 'fr-1', username: 'zaravibe',    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&h=120&fit=crop&crop=face', thumb: 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=200&h=320&fit=crop' },
  { id: 'fr-2', username: 'marcuslens',  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face', thumb: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=320&fit=crop' },
  { id: 'fr-3', username: 'lunatravels', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=120&h=120&fit=crop&crop=face', thumb: 'https://images.unsplash.com/photo-1519999482648-25049ddd37b1?w=200&h=320&fit=crop' },
  { id: 'fr-4', username: 'chefkai',     avatar: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=120&h=120&fit=crop&crop=face', thumb: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=200&h=320&fit=crop' },
  { id: 'fr-5', username: 'alexruns',    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=face', thumb: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=200&h=320&fit=crop' },
  { id: 'fr-6', username: 'sofianature', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face', thumb: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=200&h=320&fit=crop' },
];

const LIGHT_STORY_LABELS = ['@sarah.luv', '@jordan.fx', '@valeria', '@marko', '@luna'];

// Global reels cache to prevent rate limiting
const REELS_CACHE = { reels: [], lastFetched: 0 };

// Simple story viewer overlay
function StoryViewer({ stories, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex);
  const safeStories = asArray(stories);
  const story = safeStories[idx];
  if (!story) return null;
  return (
    <div className="fixed inset-0 z-[500] bg-black flex items-center justify-center" onClick={onClose}>
      <div className="relative w-full h-full max-w-md mx-auto" onClick={e => e.stopPropagation()}>
        <img src={story.image_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.5) 100%)' }} />
        {/* Progress bars */}
        <div className="absolute top-3 left-3 right-3 flex gap-1">
          {safeStories.map((_, i) => (
            <div key={i} className="flex-1 h-0.5 rounded-full" style={{ background: i < idx ? 'white' : i === idx ? 'white' : 'rgba(255,255,255,0.4)' }} />
          ))}
        </div>
        {/* Header */}
        <div className="absolute top-8 left-4 right-4 flex items-center gap-2">
          <img src={story.user_avatar || `https://ui-avatars.com/api/?name=${story.username}&background=ff5500&color=fff&size=80`} alt="" className="w-8 h-8 rounded-full object-cover border border-white/40" />
          <span className="text-white text-sm font-bold">@{story.username}</span>
          <button onClick={onClose} className="ml-auto w-8 h-8 flex items-center justify-center"><X className="w-5 h-5 text-white" /></button>
        </div>
        {/* Caption */}
        {story.caption && <div className="absolute bottom-20 left-4 right-4 text-white text-base font-bold text-center" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}>{story.caption}</div>}
        {/* Location */}
        {story.location && <div className="absolute bottom-12 left-0 right-0 text-center text-white/70 text-xs">📍 {story.location}</div>}
        {/* Nav */}
        {idx > 0 && <button className="absolute left-2 top-1/2 -translate-y-1/2" onClick={() => setIdx(idx-1)}><ChevronLeft className="w-8 h-8 text-white/80" /></button>}
        {idx < safeStories.length - 1 && <button className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setIdx(idx+1)}><ChevronRight className="w-8 h-8 text-white/80" /></button>}
      </div>
    </div>
  );
}

export default function StoryBar() {
  const navigate = useNavigate();
  const [isLight, setIsLight] = useState(false);
  const [storyMenuOpen, setStoryMenuOpen] = useState(false);
  const [viewingStories, setViewingStories] = useState(null); // { stories, startIndex }


  useEffect(() => {
    const check = () => setIsLight(document.documentElement.classList.contains('light-mode'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const { data: meForStory = null } = useQuery({
    queryKey: ['storybar-current-user-avatar'],
    queryFn: async () => {
      const user = await base44.auth.me().catch(() => null);
      if (!user?.id) return null;
      const profiles = await base44.entities.UserProfile
        .filter({ user_id: user.id }, '-created_date', 1)
        .catch(() => []);
      const profile = Array.isArray(profiles) ? profiles[0] : null;
      return {
        ...user,
        avatar_url: profile?.avatar_url || user.avatar_url || user.photo_url || '',
        full_name: profile?.full_name || user.full_name || user.username || user.email?.split('@')[0] || 'You',
      };
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const myStoryAvatar = meForStory?.avatar_url
    || `https://ui-avatars.com/api/?name=${encodeURIComponent(meForStory?.full_name || 'You')}&background=ff5500&color=fff&size=160`;
  const myStoryAvatarIsVideo = /\.(mp4|mov|webm|m4v)(\?|#|$)/i.test(myStoryAvatar);

  // Fetch active stories (not expired)
  const { data: allStories = [] } = useQuery({
    queryKey: ['active-stories'],
    queryFn: async () => {
      const now = new Date().toISOString();
      const stories = await base44.entities.Story.list('-created_date', 30);
      return asArray(stories).filter(s => s.image_url && (!s.expires_at || s.expires_at > now));
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Group stories by user - ensure allStories is array first
  const safeStories = Array.isArray(allStories) ? allStories : [];
  const storiesByUser = Object.values(
    safeStories.reduce((acc, s) => {
      if (!acc[s.user_id]) acc[s.user_id] = { user_id: s.user_id, username: s.username, avatar: s.user_avatar, stories: [] };
      acc[s.user_id].stories.push(s);
      return acc;
    }, {})
  );

  // Fetch active live sessions
  const { data: liveSessions = [] } = useQuery({
    queryKey: ['active-live-sessions-storybar'],
    queryFn: async () => {
      const sessions = await base44.entities.LiveSession.filter({ status: 'active' }, '-started_at', 6);
      const staleThreshold = Date.now() - 4 * 60 * 60 * 1000;
      return asArray(sessions).filter(s => !s.started_at || new Date(s.started_at).getTime() >= staleThreshold);
    },
    staleTime: 15000,
    refetchInterval: 20000,
  });

  const { data: allReels = [], refetch: refetchReels } = useQuery({
    queryKey: ['all-reels'],
    queryFn: async () => {
      // Cache for 2 minutes to prevent rate limiting
      const now = Date.now();
      if (REELS_CACHE.reels.length > 0 && now - REELS_CACHE.lastFetched < 120000) {
        return REELS_CACHE.reels;
      }
      const currentUser = await base44.auth.me().catch(() => null);
      // Fetch posts with video OR music (photo clips)
      const posts = await base44.entities.Post.list('-created_date', 50);
      let filtered = asArray(posts).filter(p => {
        const hasVideo = !!p.video_url && p.video_url.trim() !== '';
        const hasMusic = !!p.music_preview_url || !!p.music_title;
        const isReelType = p.post_type === 'reel' || p.post_type === 'story';
        return (hasVideo || isReelType || hasMusic) && p.author_id && p.author_username;
      });
      // Sort: current user's reels first
      if (currentUser?.id) {
        filtered = filtered.sort((a, b) => {
          const aIsMine = a.author_id === currentUser.id;
          const bIsMine = b.author_id === currentUser.id;
          if (aIsMine && !bIsMine) return -1;
          if (!aIsMine && bIsMine) return 1;
          return 0;
        });
      }
      REELS_CACHE.reels = filtered;
      REELS_CACHE.lastFetched = now;
      return filtered;
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Deduplicate: one reel per author (most recent) - ensure allReels is array first
  const safeReels = Array.isArray(allReels) ? allReels : [];
  const realReelsMapped = Object.values(
    safeReels.reduce((acc, r) => {
      if (!acc[r.author_id] || new Date(r.created_date) > new Date(acc[r.author_id].created_date)) {
        acc[r.author_id] = r;
      }
      return acc;
    }, {})
  ).map(r => ({
    id: r.id,
    username: r.author_username,
    avatar: r.author_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.author_name || 'U')}&background=ff5500&color=fff&size=120`,
    thumb: r.image_url || null,
    isUserReel: false,
  }));

  // Story users mapped to reel-style circles (active stories within 24h)
  const storyCircles = asArray(storiesByUser).map(group => ({
    id: `story-${group.user_id}`,
    username: group.username,
    avatar: group.avatar || `https://ui-avatars.com/api/?name=${group.username}&background=a855f7&color=fff&size=120`,
    thumb: null,
    isStory: true,
    storiesData: group.stories,
  }));

  // Merge: story circles first, then real reels, then fake fill
  const safeStoriesByUser = Array.isArray(storiesByUser) ? storiesByUser : [];
  const safeStoryCircles = Array.isArray(storyCircles) ? storyCircles : [];
  const safeRealReelsMapped = Array.isArray(realReelsMapped) ? realReelsMapped : [];
  const storyUserIds = new Set(asArray(safeStoriesByUser).map(g => g.user_id));
  const reelsDisplay = [
    ...asArray(safeStoryCircles),
    ...asArray(safeRealReelsMapped).filter(r => !storyUserIds.has(r.id)),
    ...FAKE_REELS.filter(f => !asArray(safeRealReelsMapped).some(r => r.username === f.username) && !asArray(safeStoryCircles).some(s => s.username === f.username)),
  ].slice(0, 8);

  return (
    <div className="px-3 pt-1 pb-1">
      {/* Story Viewer */}
      {viewingStories && (
        <StoryViewer
          stories={viewingStories.stories}
          startIndex={viewingStories.startIndex}
          onClose={() => setViewingStories(null)}
        />
      )}

      {/* Stories are now shown inside the Reels row below */}

      {/* Story Type Picker Sheet */}
      <AnimatePresence>
        {storyMenuOpen && (
          <>
            {/* Backdrop — separate from sheet so it doesn't block touches on sheet */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200]"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
              onClick={() => setStoryMenuOpen(false)}
            />
            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[201] rounded-t-3xl px-5 pt-4"
              style={{
                background: 'rgba(12,6,20,0.99)',
                border: '1px solid rgba(255,255,255,0.1)',
                paddingBottom: 'max(120px, calc(env(safe-area-inset-bottom, 0px) + 100px))',
              }}
            >
              <div className="w-full flex justify-center pb-3 -mt-1">
                <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
              </div>
              <div className="flex items-center justify-between mb-5">
                <span className="text-white font-bold text-base">Create Moment</span>
                <button
                  onPointerUp={() => setStoryMenuOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full"
                  style={{ background: 'rgba(255,255,255,0.08)', touchAction: 'manipulation' }}>
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
              <div className="flex flex-col gap-3 pb-2">
                {asArray([
                  { icon: ImagePlus, label: 'Photo', sub: 'Share a photo from your gallery', color: '#ff5500', action: () => { setStoryMenuOpen(false); setTimeout(() => navigate('/create-story-photo'), 200); } },
                  { icon: Video,     label: 'Video',  sub: 'Record or upload a short video', color: '#e91e8c', action: () => { setStoryMenuOpen(false); setTimeout(() => navigate('/create-story-video'), 200); } },
                  { icon: Type,      label: 'Text',   sub: 'Express yourself with words',    color: '#a733ff', action: () => { setStoryMenuOpen(false); setTimeout(() => navigate('/create-text-story'), 200); } },
                ]).map(({ icon: Icon, label, sub, color, action }) => (
                  <button key={label}
                    onClick={action}
                    className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-left w-full active:opacity-70 transition-opacity"
                    style={{ background: `${color}12`, border: `1px solid ${color}35`, touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent', cursor: 'pointer' }}>
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${color}25`, border: `1.5px solid ${color}60` }}>
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">{label}</p>
                      <p className="text-white/45 text-xs mt-0.5">{sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {isLight && (
        <div className="spicey-light-story-row">
          <button type="button" onClick={() => setStoryMenuOpen(true)} className="spicey-light-story-item">
            <span className="spicey-light-story-ring">
              {myStoryAvatarIsVideo ? (
                <video
                  src={myStoryAvatar}
                  className="spicey-light-story-avatar"
                  muted
                  playsInline
                  autoPlay
                  loop
                />
              ) : (
                <img
                  src={myStoryAvatar}
                  alt="Your Story"
                  className="spicey-light-story-avatar"
                  onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(meForStory?.full_name || 'You')}&background=ff5500&color=fff&size=160`; }}
                />
              )}
              <span className="spicey-light-story-plus"><Plus className="w-3 h-3" /></span>
            </span>
            <span className="spicey-light-story-label">Your Moment</span>
          </button>

          {asArray(reelsDisplay).slice(0, 5).map((reel, index) => (
            <button
              type="button"
              key={reel.id}
              onClick={() => reel.isStory ? setViewingStories({ stories: reel.storiesData, startIndex: 0 }) : navigate('/reels')}
              className="spicey-light-story-item"
            >
              <span className="spicey-light-story-ring">
                <img
                  src={reel.avatar}
                  alt={reel.username}
                  className="spicey-light-story-avatar"
                  onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${reel.username}&background=ff5500&color=fff&size=120`; }}
                />
                <span className="spicey-light-story-live-dot" />
              </span>
              <span className="spicey-light-story-label">{LIGHT_STORY_LABELS[index] || `@${reel.username}`}</span>
            </button>
          ))}
        </div>
      )}

      {/* STORIES ROW — Live sessions only */}
      {!isLight && Array.isArray(liveSessions) && liveSessions.length > 0 && (
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-2 px-0.5">
            <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(to bottom, #e11d48, #ff5500)' }} />
            <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: isLight ? '#111111' : 'rgba(255,255,255,0.75)' }}>Live</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {asArray(liveSessions).map((session, i) => {
              const avatarSrc = session.broadcaster_avatar
                || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.broadcaster_name || 'L')}&background=e11d48&color=fff&size=120`;
              return (
                <motion.button
                  key={session.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/live/watch?session=${session.id}`)}
                  className="flex-shrink-0 relative rounded-2xl overflow-hidden flex flex-col items-center justify-end"
                  style={{ width: 82, height: 130 }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <img src={avatarSrc} alt={session.broadcaster_username}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${session.broadcaster_username}&background=e11d48&color=fff&size=120`; }} />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 35%, rgba(0,0,0,0.1) 100%)' }} />
                  <motion.div
                    animate={{ opacity: [0.7, 0.3, 0.7] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{ border: '2px solid #e11d48', boxShadow: '0 0 14px rgba(225,29,72,0.7)' }}
                  />
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[8px] font-black text-white"
                    style={{ background: '#e11d48', boxShadow: '0 0 8px rgba(225,29,72,0.8)' }}>
                    LIVE
                  </div>
                  <div className="absolute top-7 left-1/2 -translate-x-1/2 text-[7px] text-white/70">
                    👁 {session.viewer_count || 0}
                  </div>
                  <div className="relative z-10 pb-2 flex flex-col items-center gap-0.5">
                    <span className="text-[9px] font-bold text-center leading-tight text-white truncate max-w-[70px]"
                      style={{ textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}>
                      @{session.broadcaster_username}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* REELS SECTION — Map + Reel circles */}
      {!isLight && (
      <>
      <div className="flex items-center justify-between mb-1.5 px-0.5">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full" style={{ background: isLight ? 'linear-gradient(to bottom, #FF6A00, #FF2D55)' : 'linear-gradient(to bottom, #ff5500, #e91e8c)' }} />
          <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: isLight ? '#111111' : 'rgba(255,255,255,0.75)' }}>Spicey Clips</span>
        </div>
        <button onClick={() => navigate('/reels')}
          className="text-[10px] font-semibold px-2.5 py-1 rounded-full active:scale-95 transition-transform"
          style={{ 
            background: 'transparent', 
            color: isLight ? '#111111' : 'rgba(255,255,255,0.88)', 
            border: '1px solid transparent' 
          }}>
          See all
        </button>
      </div>

      <div className="flex gap-2.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {/* Your Story */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => setStoryMenuOpen(true)}
          className="flex-shrink-0 relative rounded-full overflow-hidden flex flex-col items-center"
          style={{ width: 56, height: 56 }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="absolute inset-0 rounded-full"
            style={{ background: 'linear-gradient(135deg, #FF6A00 0%, #FF2D55 48%, #C100FF 100%)', padding: '2px' }}>
            <div className="w-full h-full rounded-full" style={{ background: '#0a0014' }} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center p-[3px]">
            {myStoryAvatarIsVideo ? (
              <video src={myStoryAvatar} className="w-full h-full rounded-full object-cover" muted playsInline autoPlay loop />
            ) : (
              <img
                src={myStoryAvatar}
                alt="Your Story"
                className="w-full h-full rounded-full object-cover"
                onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(meForStory?.full_name || 'You')}&background=ff5500&color=fff&size=120`; }}
              />
            )}
          </div>
          <span className="absolute right-0 bottom-0 w-4 h-4 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #ff6a18, #ff2e93)', border: '1.5px solid #050407' }}>
            <Plus className="w-2.5 h-2.5 text-white" />
          </span>
        </motion.button>

        {/* Spicey Map */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate('/map')}
          className="flex-shrink-0 relative rounded-full overflow-hidden flex flex-col items-center"
          style={{ width: 56, height: 56 }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="absolute inset-0 rounded-full"
            style={{ background: 'linear-gradient(135deg, #FF2D55 0%, #C100FF 50%, #FF6A00 100%)', padding: '2px' }}>
            <div className="w-full h-full rounded-full" style={{ background: isLight ? '#FFFFFF' : '#0a0014' }} />
          </div>
          <div className="absolute rounded-full" style={{
            inset: 3,
            background: 'radial-gradient(circle at 35% 28%, #d8b4fe 0%, #a855f7 30%, #7c3aed 62%, #4c1d95 85%, #1a0533 100%)',
            boxShadow: 'inset -4px -4px 12px rgba(0,0,0,0.7), inset 3px 3px 8px rgba(216,180,254,0.45)',
          }} />
          <div className="absolute pointer-events-none" style={{
            top: 7, left: 8, width: 14, height: 10,
            background: 'radial-gradient(ellipse, rgba(255,255,255,0.7) 0%, transparent 75%)',
            filter: 'blur(2px)', borderRadius: '50%',
          }} />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
            <svg width="19" height="23" viewBox="0 0 30 34" fill="none"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }}>
              <path d="M15 0C6.716 0 0 6.716 0 15C0 23.375 15 34 15 34C15 34 30 23.375 30 15C30 6.716 23.284 0 15 0Z" fill="url(#mpin3d2)" />
              <defs>
                <linearGradient id="mpin3d2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff4d4d" />
                  <stop offset="50%" stopColor="#dc2626" />
                  <stop offset="100%" stopColor="#7f1d1d" />
                </linearGradient>
              </defs>
              <circle cx="15" cy="15" r="5" fill="white" fillOpacity="0.95" />
            </svg>
            <span style={{ fontSize: 6.5, fontWeight: 800, color: 'white', textShadow: '0 1px 4px rgba(0,0,0,0.9)', lineHeight: 1 }}>Spicey Map</span>
          </div>
        </motion.button>

        {/* Reel circles — includes story users first */}
        {asArray(reelsDisplay).map((reel, i) => (
          <motion.button
            key={reel.id}
            whileTap={{ scale: 0.96 }}
            onClick={() => reel.isStory ? setViewingStories({ stories: reel.storiesData, startIndex: 0 }) : navigate('/reels')}
            className="flex-shrink-0 relative rounded-full overflow-hidden flex flex-col items-center"
            style={{ width: 56, height: 56 }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <div className="absolute inset-0 rounded-full"
              style={{
                background: reel.isStory
                  ? 'linear-gradient(135deg, #a855f7 0%, #e91e8c 50%, #ff5500 100%)'
                  : 'linear-gradient(135deg, #FF2D55 0%, #C100FF 50%, #FF6A00 100%)',
                padding: '2px'
              }}>
              <div className="w-full h-full rounded-full" style={{ background: isLight ? '#FFFFFF' : '#0a0014' }} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center p-[2px]">
              <img src={reel.avatar} alt={reel.username}
                className="w-full h-full rounded-full object-cover"
                style={{ filter: 'brightness(1.1) saturate(1.15)' }}
                onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${reel.username}&background=ff5500&color=fff&size=80`; }} />
            </div>
            <div className="absolute bottom-0.5 left-0 right-0 flex flex-col items-center gap-0 px-0.5 z-10">
              <span className="text-[7px] font-bold text-center leading-tight truncate max-w-[50px]"
                style={{ color: '#ffffff', textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}>
                {reel.isUserReel ? 'Your Reel' : `@${reel.username}`}
              </span>
            </div>
            {reel.isUserReel && (
              <div className="absolute top-0.5 left-1/2 -translate-x-1/2 px-1 py-0.5 rounded-full text-[5px] font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #FF6A00, #FF2D55)', boxShadow: '0 1px 4px rgba(255,106,0,0.5)', zIndex: 20 }}>
                You
              </div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Divider */}
      <div className="mt-2 h-px rounded-full" style={{ background: isLight ? '#ECECF2' : 'rgba(255,255,255,0.06)' }} />
      </>
      )}
    </div>
  );
}
