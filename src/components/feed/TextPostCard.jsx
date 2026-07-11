import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark, Trash2, Edit3 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import VerifiedBadge from '../shared/VerifiedBadge';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { toast } from 'sonner';
import EditPostModal from './EditPostModal';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatCount(num) {
  if (!num) return '0';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return num.toString();
}

export default function TextPostCard({ post, onLike, onComment, onShare, liked, fireReacted, likesCount = 0, fireCount = 0, isLightMode, currentUser }) {
  const [authorIsVip, setAuthorIsVip] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showEditPost, setShowEditPost] = useState(false);
  const [hidden, setHidden] = useState(false);
  
  useEffect(() => {
    if (currentUser) {
      setIsAdmin(currentUser.role === 'admin');
    }
  }, [currentUser]);
  
  // VIP check disabled to prevent rate limiting
  
  if (hidden) return null;

  const avatarSrc = (post.author_avatar && post.author_avatar.trim())
    ? post.author_avatar
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author_name)}&background=ff5500&color=fff&size=128`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full"
    >
      {/* Neon space theme text post card */}
      <div className="mx-4 mt-3">
        <div
          className="relative rounded-3xl overflow-hidden p-5"
          style={{
            background: isLightMode
              ? '#FFFFFF'
              : '#000000',
            border: isLightMode
              ? '1px solid #F0F0F4'
              : '1px solid rgba(255,0,127,0.15)',
            boxShadow: isLightMode
              ? '0 4px 24px rgba(0,0,0,0.08)'
              : '0 0 20px rgba(255,0,127,0.1), 0 0 40px rgba(255,69,0,0.08), inset 0 0 10px rgba(255,0,127,0.03)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Curved neon lines */}
          {!isLightMode && (
            <>
              <div
                className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden rounded-3xl"
                style={{
                  background: `
                    radial-gradient(ellipse 80% 20% at 20% 10%, rgba(255,0,127,0.08) 0%, transparent 50%),
                    radial-gradient(ellipse 60% 15% at 80% 30%, rgba(255,69,0,0.06) 0%, transparent 50%),
                    radial-gradient(ellipse 70% 25% at 50% 80%, rgba(255,20,147,0.07) 0%, transparent 50%)
                  `,
                  filter: 'blur(20px)',
                }}
              />
            </>
          )}

          {/* Author header */}
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div
              className="p-0.5 rounded-full flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #ff5500, #ee1e8c)',
                boxShadow: isLightMode
                  ? '0 2px 8px rgba(255,85,0,0.3)'
                  : '0 0 12px rgba(255,85,0,0.5)',
              }}
            >
              <img
                src={avatarSrc}
                alt={post.author_name}
                className="w-10 h-10 rounded-full object-cover"
                style={{ border: '2px solid white' }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p
                  className="font-bold text-[14px] leading-tight truncate"
                  style={{ color: isLightMode ? '#111111' : 'white' }}
                >
                  {post.author_name}
                </p>
                {authorIsVip && <VerifiedBadge type="vip" size="sm" />}
              </div>
              <p
                className="text-[11px] truncate"
                style={{ color: isLightMode ? '#8E8E93' : 'rgba(255,255,255,0.5)' }}
              >
                @{post.author_username} · {timeAgo(post.created_date)}
              </p>
            </div>
            <button
              onClick={() => setShowMenu(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: isLightMode ? '#F3F4F7' : 'rgba(255,255,255,0.06)',
                border: isLightMode ? '1px solid #ECECF2' : 'none',
              }}
            >
              <MoreHorizontal
                className="w-4 h-4"
                style={{ color: isLightMode ? '#8E8E93' : 'rgba(255,255,255,0.6)' }}
              />
            </button>
          </div>

          {/* Text content with premium typography */}
          <div className="mb-4 relative z-10">
            <p
              className="text-[16px] leading-relaxed"
              style={{
                color: isLightMode ? '#111111' : 'white',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                fontWeight: '400',
                lineHeight: '1.6',
              }}
            >
              {post.caption}
            </p>
            {post.hashtags?.length > 0 && (
              <p
                className="text-[13px] mt-3 font-medium"
                style={{
                  color: isLightMode ? '#FF6A00' : '#ff7040',
                  textShadow: isLightMode ? 'none' : '0 0 20px rgba(255,106,0,0.3)',
                }}
              >
                {post.hashtags.map((tag) => `#${tag}`).join('  ')}
              </p>
            )}
          </div>

          {/* Divider */}
          <div
            className="h-px w-full mb-4"
            style={{
              background: isLightMode
                ? 'linear-gradient(to right, transparent, #ECECF2, transparent)'
                : 'linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent)',
            }}
          />

          {/* Action buttons */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              {/* Like button with glow */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onLike}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{
                  background: liked
                    ? 'rgba(255,45,85,0.12)'
                    : isLightMode
                    ? '#F8F8FA'
                    : 'rgba(255,255,255,0.04)',
                  border: liked
                    ? '1px solid rgba(255,45,85,0.3)'
                    : isLightMode
                    ? '1px solid #E8E8ED'
                    : '1px solid rgba(255,255,255,0.06)',
                  boxShadow: liked ? '0 0 12px rgba(255,45,85,0.25)' : 'none',
                }}
              >
                <Heart
                  className="w-4 h-4"
                  style={{
                    color: liked ? '#FF2D55' : isLightMode ? '#8E8E93' : 'rgba(255,255,255,0.5)',
                    fill: liked ? '#FF2D55' : 'none',
                  }}
                />
                <span
                  className="text-[12px] font-semibold"
                  style={{
                    color: liked ? '#FF2D55' : isLightMode ? '#6B6B75' : 'rgba(255,255,255,0.5)',
                  }}
                >
                  {formatCount(likesCount)}
                </span>
              </motion.button>

              {/* Comment button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onComment}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{
                  background: isLightMode ? '#F8F8FA' : 'rgba(255,255,255,0.04)',
                  border: isLightMode ? '1px solid #E8E8ED' : '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <MessageCircle
                  className="w-4 h-4"
                  style={{ color: isLightMode ? '#8E8E93' : 'rgba(255,255,255,0.5)' }}
                />
                <span
                  className="text-[12px] font-semibold"
                  style={{ color: isLightMode ? '#6B6B75' : 'rgba(255,255,255,0.5)' }}
                >
                  {formatCount(post.comments_count || 0)}
                </span>
              </motion.button>

              {/* Share button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onShare}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{
                  background: isLightMode ? '#F8F8FA' : 'rgba(255,255,255,0.04)',
                  border: isLightMode ? '1px solid #E8E8ED' : '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <Share2
                  className="w-4 h-4"
                  style={{ color: isLightMode ? '#8E8E93' : 'rgba(255,255,255,0.5)' }}
                />
                <span
                  className="text-[12px] font-semibold"
                  style={{ color: isLightMode ? '#6B6B75' : 'rgba(255,255,255,0.5)' }}
                >
                  {formatCount(post.shares_count || 0)}
                </span>
              </motion.button>
            </div>

            {/* Save button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{
                background: isLightMode ? '#F8F8FA' : 'rgba(255,255,255,0.04)',
                border: isLightMode ? '1px solid #E8E8ED' : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <Bookmark
                className="w-4 h-4"
                style={{ color: isLightMode ? '#8E8E93' : 'rgba(255,255,255,0.5)' }}
              />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Menu Sheet - Admin Only */}
      <Sheet open={showMenu} onOpenChange={setShowMenu}>
        <SheetContent side="bottom" className="bg-card border-border rounded-t-3xl">
          <div className="space-y-2 py-4">
            {isAdmin && (
              <>
                <button onClick={() => { setShowMenu(false); setShowEditPost(true); }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-blue-400 hover:bg-blue-500/10 transition rounded-xl border border-blue-500/30">
                  <Edit3 className="w-4 h-4" /> Edit Post
                </button>
                <button onClick={async () => {
                  setShowMenu(false);
                  if (confirm('Delete this post?')) {
                    setHidden(true);
                    base44.entities.Post.delete(post.id).catch(() => setHidden(false));
                  }
                }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-red-400 hover:bg-red-500/10 transition rounded-xl">
                  <Trash2 className="w-4 h-4" /> Delete Post
                </button>
              </>
            )}
            {!isAdmin && (
              <p className="text-sm text-white/50 px-4 py-2">No admin actions available</p>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <EditPostModal
        open={showEditPost}
        onClose={() => setShowEditPost(false)}
        post={post}
        onSuccess={() => {}}
      />
    </motion.div>
  );
}