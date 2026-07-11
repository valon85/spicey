import React, { useState, useEffect, useCallback, memo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, Plus, Bell, Crown, Sparkles, Flame,
  Heart, MessageCircle, Share2, Bookmark, MoreHorizontal,
  CheckCircle, Image as ImageIcon, Video, Type, Star, Home, User
} from 'lucide-react';
import CommentsSheet from '../components/feed/CommentsSheet';
import AIAssistantSheet from '../components/panels/AIAssistantSheet.jsx';

// ════════════════════════════════════════════════════════════════
// HomeLight2026 — Premium Glassmorphism Light Theme
// Based on reference design blueprint
// ════════════════════════════════════════════════════════════════

const TRENDING_TAGS = [
  { tag: '#SpiceyLife', posts: '12.4K', gradient: 'linear-gradient(135deg, #FF6B35, #FF1493)' },
  { tag: '#NightVibes', posts: '8.2K', gradient: 'linear-gradient(135deg, #FF1493, #9333EA)' },
  { tag: '#UrbanGlow', posts: '5.7K', gradient: 'linear-gradient(135deg, #9333EA, #3B82F6)' },
];

const TABS = ['For You', 'Following', 'Trending'];

// ── Stable Post Card Component ──
const LightPostCard = memo(({ post, onCommentClick, currentUser }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 mb-4 rounded-[28px] overflow-hidden"
      style={{
        background: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-10 h-10 rounded-full overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #FF6B35, #FF1493)',
            padding: '2px',
          }}>
          <img
            src={post.author_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author_name || 'U')}&background=random`}
            alt={post.author_name}
            className="w-full h-full rounded-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm text-gray-900 truncate">{post.author_name}</span>
            <CheckCircle className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          </div>
          <span className="text-xs text-gray-500">2h ago</span>
        </div>
        <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5">
          <MoreHorizontal className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Image */}
      <div className="relative aspect-square mx-4"
        style={{
          borderRadius: '20px',
          border: '3px solid rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
        }}>
        <img
          src={post.image_url || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600'}
          alt={post.caption}
          className="w-full h-full object-cover"
        />
        {post.image_urls?.length > 1 && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold text-white"
            style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)' }}>
            1/{post.image_urls.length}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <button onClick={handleLike} className="active:scale-90 transition-transform">
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
          </button>
          <button onClick={() => onCommentClick(post)} className="active:scale-90 transition-transform">
            <MessageCircle className="w-6 h-6 text-gray-700" />
          </button>
          <button className="active:scale-90 transition-transform">
            <Share2 className="w-6 h-6 text-gray-700" />
          </button>
        </div>
        <button className="active:scale-90 transition-transform">
          <Bookmark className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      {/* Footer */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex -space-x-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-400 to-pink-400" />
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 to-blue-400" />
          </div>
          <span className="text-xs text-gray-600">
            Liked by John, Ardian and {likesCount.toLocaleString()} others
          </span>
        </div>
        <p className="text-sm text-gray-800">
          <span className="font-semibold">{post.author_name}</span>{' '}
          {post.caption || 'Living my best life ✨'}
          <span className="text-purple-600 ml-1">#vibes #spiceylife</span>
        </p>
        <button className="text-sm text-gray-500 mt-2">
          View all {post.comments_count || 32} comments
        </button>
      </div>
    </motion.div>
  );
});

export default function HomeLight2026() {
  const navigate = useNavigate();
  const [commentPost, setCommentPost] = useState(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('For You');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const { data: posts = [] } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const posts = await base44.entities.Post.list('-created_date', 40);
      return posts.filter(p => p.post_type === 'feed' || !p.post_type);
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const handleCommentClick = useCallback((p) => setCommentPost(p), []);

  return (
    <div className="min-h-screen pb-24"
      style={{
        background: 'radial-gradient(ellipse at top left, #FFF5F5 0%, #F5F0FF 100%)',
      }}>
      
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40 px-4 py-3"
        style={{
          paddingTop: 'max(16px, env(safe-area-inset-top))',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        }}>
        <div className="flex items-center justify-between">
          {/* Avatar */}
          <div className="relative">
            <div className="w-14 h-14 rounded-full overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #FF6B35, #FF1493)',
                padding: '2px',
              }}>
              <img
                src={currentUser?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.full_name || 'U')}&background=random`}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white" />
          </div>

          {/* Logo */}
          <h1 className="text-2xl font-black tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #FF6B35, #FF1493)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              transform: 'skewX(-8deg)',
            }}>
            SPICEY
          </h1>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.9)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              }}>
              <Crown className="w-5 h-5" style={{ color: '#FFD700' }} />
            </button>
            <button className="relative w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.9)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              }}>
              <Bell className="w-5 h-5 text-gray-700" />
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #FF1493, #9333EA)' }}>
                8
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ── SEARCH BAR ── */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-3 h-[65px] rounded-[32px] px-5"
          style={{
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.9)',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
          }}>
          <Search className="w-5 h-5" style={{ color: '#FF6B35' }} />
          <input
            type="text"
            placeholder="Search people, posts, hashtags..."
            className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none"
          />
          <button className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #FF1493, #9333EA)',
              boxShadow: '0 2px 8px rgba(255, 20, 147, 0.3)',
            }}>
            <Filter className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* ── STORIES ── */}
      <div className="px-4 py-3">
        <div className="flex gap-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {/* Your Story */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className="relative w-[74px] h-[74px]">
              <div className="w-full h-full rounded-full overflow-hidden"
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255, 255, 255, 0.9)',
                }}>
                <img
                  src={currentUser?.avatar_url || `https://ui-avatars.com/api/?name=You&background=random`}
                  alt="Your Story"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #FF1493, #FF6B35)',
                  border: '2px solid white',
                }}>
                <Plus className="w-3 h-3 text-white" />
              </div>
            </div>
            <span className="text-xs text-gray-600 font-medium">Your Story</span>
          </div>

          {/* Other Stories */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className="w-[74px] h-[74px] rounded-full overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #FF6B35, #FF1493)',
                  padding: '2px',
                }}>
                <img
                  src={`https://i.pravatar.cc/150?img=${i + 10}`}
                  alt="Story"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <span className="text-xs text-gray-600">User {i}</span>
            </div>
          ))}

          {/* More */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className="w-[74px] h-[74px] rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.9)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              }}>
              <span className="text-xl font-bold text-gray-400">•••</span>
            </div>
            <span className="text-xs text-gray-600 font-medium">More</span>
          </div>
        </div>
      </div>

      {/* ── SPICEY AI CARD ── */}
      <div className="px-4 py-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[28px] p-5"
          style={{
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
          }}>
          <div className="flex items-center gap-4">
            {/* AI Icon */}
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #FF6B35, #FF1493)',
                boxShadow: '0 4px 16px rgba(255, 107, 53, 0.3)',
              }}>
              <Sparkles className="w-7 h-7 text-white" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-base text-gray-900">Spicey AI</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #9333EA, #FF1493)' }}>
                  NEW
                </span>
              </div>
              <p className="text-xs text-gray-600">
                Your creative partner for captions, hashtags, ideas and more.
              </p>
            </div>

            {/* CTA */}
            <button
              onClick={() => setAiOpen(true)}
              className="px-4 py-2.5 rounded-full text-sm font-bold text-white flex-shrink-0 active:scale-95 transition-transform"
              style={{
                background: 'linear-gradient(135deg, #FF6B35, #FF1493)',
                boxShadow: '0 4px 16px rgba(255, 107, 53, 0.35)',
              }}>
              Try AI
            </button>
          </div>
        </motion.div>
      </div>

      {/* ── TABS ── */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="relative pb-2 text-sm font-semibold active:opacity-70 transition-opacity"
              style={{ color: activeTab === tab ? '#FF6B35' : '#9CA3AF' }}>
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ background: 'linear-gradient(135deg, #FF6B35, #FF1493)' }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── POSTS FEED ── */}
      <div className="py-2">
        {posts.map((post) => (
          <LightPostCard
            key={post.id}
            post={post}
            onCommentClick={handleCommentClick}
            currentUser={currentUser}
          />
        ))}
      </div>

      {/* ── TRENDING NOW ── */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5" style={{ color: '#FF6B35' }} />
            <span className="font-bold text-base text-gray-900">Trending Now</span>
          </div>
          <button className="text-sm font-semibold" style={{ color: '#9333EA' }}>
            See all
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {TRENDING_TAGS.map((item, i) => (
            <motion.div
              key={item.tag}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative h-24 rounded-[18px] overflow-hidden p-3"
              style={{ background: item.gradient }}>
              <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/40" />
              <div className="relative z-10">
                <span className="text-white font-bold text-sm">{item.tag}</span>
                <p className="text-white/80 text-xs mt-1">{item.posts}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── BOTTOM NAVIGATION ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(0, 0, 0, 0.08)',
          paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
          paddingTop: '12px',
        }}>
        <div className="flex items-center justify-center gap-4 px-4">
          {/* Home */}
          <button className="flex flex-col items-center gap-1 p-3 rounded-2xl active:scale-95 transition-transform"
            style={{
              background: 'linear-gradient(135deg, #FFFFFF, #F0F0F0)',
              boxShadow: '0 3px 12px rgba(0,0,0,0.12), inset 0 2px 3px rgba(255,255,255,1)',
              border: '1px solid rgba(0,0,0,0.1)',
              minWidth: '60px',
            }}>
            <Home className="w-6 h-6" style={{ color: '#FF6B35' }} />
            <span className="text-[10px] font-semibold" style={{ color: '#FF6B35' }}>Home</span>
          </button>

          {/* Messages */}
          <button className="relative flex flex-col items-center gap-1 p-3 rounded-2xl active:scale-95 transition-transform"
            style={{
              background: 'linear-gradient(135deg, #FFFFFF, #F0F0F0)',
              boxShadow: '0 3px 12px rgba(0,0,0,0.12), inset 0 2px 3px rgba(255,255,255,1)',
              border: '1px solid rgba(0,0,0,0.1)',
              minWidth: '60px',
            }}>
            <MessageCircle className="w-6 h-6 text-gray-400" />
            <span className="text-[10px] font-semibold text-gray-400">Messages</span>
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #FF1493, #9333EA)' }}>
              12
            </span>
          </button>

          {/* Create (Center) */}
          <button
            onClick={() => navigate('/create')}
            className="relative -top-2 w-16 h-16 rounded-2xl flex items-center justify-center active:scale-95 transition-transform"
            style={{
              background: 'linear-gradient(135deg, #FF1493, #9333EA)',
              boxShadow: '0 6px 20px rgba(255, 20, 147, 0.5), inset 0 2px 4px rgba(255,255,255,0.3)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}>
            <Plus className="w-7 h-7 text-white" />
          </button>

          {/* Discover */}
          <button className="flex flex-col items-center gap-1 p-3 rounded-2xl active:scale-95 transition-transform"
            style={{
              background: 'linear-gradient(135deg, #FFFFFF, #F0F0F0)',
              boxShadow: '0 3px 12px rgba(0,0,0,0.12), inset 0 2px 3px rgba(255,255,255,1)',
              border: '1px solid rgba(0,0,0,0.1)',
              minWidth: '60px',
            }}>
            <Star className="w-6 h-6 text-gray-400" />
            <span className="text-[10px] font-semibold text-gray-400">Discover</span>
          </button>

          {/* Profile */}
          <button className="flex flex-col items-center gap-1 p-3 rounded-2xl active:scale-95 transition-transform"
            style={{
              background: 'linear-gradient(135deg, #FFFFFF, #F0F0F0)',
              boxShadow: '0 3px 12px rgba(0,0,0,0.12), inset 0 2px 3px rgba(255,255,255,1)',
              border: '1px solid rgba(0,0,0,0.1)',
              minWidth: '60px',
            }}>
            <User className="w-6 h-6 text-gray-400" />
            <span className="text-[10px] font-semibold text-gray-400">Profile</span>
          </button>
        </div>
      </nav>

      {/* ── MODALS ── */}
      <AnimatePresence>
        {commentPost && (
          <CommentsSheet
            post={commentPost}
            open={!!commentPost}
            onClose={() => setCommentPost(null)}
          />
        )}
      </AnimatePresence>
      <AIAssistantSheet open={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}