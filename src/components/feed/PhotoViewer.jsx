import React, { useState, useEffect, useRef } from 'react';
import { X, Heart, MessageCircle, Share2, Flame, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import useScrollLock from '@/hooks/useScrollLock';

export default function PhotoViewer({ post, open, onClose }) {
  const [liked, setLiked] = useState(false);
  const [fireReacted, setFireReacted] = useState(false);
  const [likePending, setLikePending] = useState(false);
  const [firePending, setFirePending] = useState(false);
  const [likesCount, setLikesCount] = useState(post?.likes_count || 0);
  const [fireCount, setFireCount] = useState(post?.fire_count || 0);
  const [commentText, setCommentText] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [showComments, setShowComments] = useState(false);
  
  const queryClient = useQueryClient();

  useScrollLock(open);

  // Hide bottom nav in fullscreen photo view
  useEffect(() => {
    const nav = document.getElementById('bottom-nav');
    if (!nav) return;
    if (open) {
      nav.style.display = 'none';
    } else {
      nav.style.display = '';
    }
    return () => { nav.style.display = ''; };
  }, [open]);

  useEffect(() => {
    let mounted = true;
    base44.auth.me().then(user => {
      if (!mounted) return;
      setCurrentUser(user);
      if (post?.id) {
        base44.entities.Reaction.filter({ post_id: post.id, created_by: user.email }).then(reactions => {
          if (!mounted) return;
          reactions.forEach(r => {
            if (r.type === 'like') setLiked(true);
            if (r.type === 'fire') setFireReacted(true);
          });
        });
      }
    });
    return () => { mounted = false; };
  }, [post?.id]);

  useEffect(() => {
    setLikesCount(post?.likes_count || 0);
    setFireCount(post?.fire_count || 0);
    // Reset reaction state when post changes
    setLiked(false);
    setFireReacted(false);
  }, [post?.id]);

  const { data: comments = [] } = useQuery({
    queryKey: ['photo-comments', post?.id],
    queryFn: () => base44.entities.Comment.filter({ post_id: post?.id }, '-created_date', 20),
    enabled: !!post?.id && open,
  });

  const likesCountRef = useRef(likesCount);
  const fireCountRef = useRef(fireCount);
  useEffect(() => { likesCountRef.current = likesCount; }, [likesCount]);
  useEffect(() => { fireCountRef.current = fireCount; }, [fireCount]);

  const handleLike = async () => {
    if (!currentUser || !post || likePending) return;
    setLikePending(true);
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikesCount(prev => wasLiked ? Math.max(0, prev - 1) : prev + 1);
    try {
      const existing = await base44.entities.Reaction.filter({ post_id: post.id, created_by: currentUser.email, type: 'like' });
      if (existing.length > 0) {
        await Promise.all(existing.map(r => base44.entities.Reaction.delete(r.id)));
        await base44.entities.Post.update(post.id, { likes_count: Math.max(0, likesCountRef.current - 1) });
      } else {
        await base44.entities.Reaction.create({ post_id: post.id, user_id: currentUser.id, type: 'like' });
        await base44.entities.Post.update(post.id, { likes_count: likesCountRef.current + 1 });
      }
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    } catch {
      setLiked(wasLiked);
      setLikesCount(prev => wasLiked ? prev + 1 : Math.max(0, prev - 1));
    } finally {
      setLikePending(false);
    }
  };

  const handleFire = async () => {
    if (!currentUser || !post || firePending) return;
    setFirePending(true);
    const wasFired = fireReacted;
    setFireReacted(!wasFired);
    setFireCount(prev => wasFired ? Math.max(0, prev - 1) : prev + 1);
    try {
      const existing = await base44.entities.Reaction.filter({ post_id: post.id, created_by: currentUser.email, type: 'fire' });
      if (existing.length > 0) {
        await Promise.all(existing.map(r => base44.entities.Reaction.delete(r.id)));
        await base44.entities.Post.update(post.id, { fire_count: Math.max(0, fireCountRef.current - 1) });
      } else {
        await base44.entities.Reaction.create({ post_id: post.id, user_id: currentUser.id, type: 'fire' });
        await base44.entities.Post.update(post.id, { fire_count: fireCountRef.current + 1 });
      }
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    } catch {
      setFireReacted(wasFired);
      setFireCount(prev => wasFired ? prev + 1 : Math.max(0, prev - 1));
    } finally {
      setFirePending(false);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim() || !currentUser) return;
    
    const userProfiles = await base44.entities.UserProfile.filter({ user_id: currentUser.id });
    const userProfile = userProfiles[0] || { username: currentUser.email?.split('@')[0] || 'user' };
    
    await base44.entities.Comment.create({
      post_id: post.id,
      author_id: currentUser.id,
      text: commentText,
      author_name: userProfile.full_name || currentUser.full_name || 'User',
      author_username: userProfile.username || currentUser.email?.split('@')[0] || 'user',
      author_avatar: userProfile.avatar_url || currentUser.avatar_url,
    });
    
    await base44.entities.Post.update(post.id, {
      comments_count: (post.comments_count || 0) + 1
    });
    
    setCommentText('');
    queryClient.invalidateQueries({ queryKey: ['photo-comments', post.id] });
    queryClient.invalidateQueries({ queryKey: ['posts'] });
  };

  if (!open || !post) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/95"
          />
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 flex flex-col"
            onClick={e => e.stopPropagation()}
            style={{ willChange: 'opacity' }}
          >
            {/* Image Container - Fullscreen */}
            <div className="flex-1 flex items-center justify-center relative overflow-hidden"
              style={{ WebkitOverflowScrolling: 'touch' }}>
              <img
                src={post.image_url}
                alt="Post"
                className="w-full h-full object-contain"
                loading="eager"
                decoding="async"
                style={{ willChange: 'auto' }}
              />
              
              {/* Overlay Controls - Right side */}
              <div className="absolute right-4 bottom-28 flex flex-col gap-4 z-20">
                {/* Like button */}
                <motion.button
                  whileTap={{ scale: 1.2 }}
                  onClick={handleLike}
                  className="flex flex-col items-center gap-1"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md"
                    style={{
                      background: liked ? 'rgba(233, 30, 140, 0.2)' : 'rgba(0,0,0,0.5)',
                      border: liked ? '1.5px solid #e91e8c' : '1.5px solid rgba(255,255,255,0.3)',
                      boxShadow: liked ? '0 0 12px rgba(233,30,140,0.6)' : 'none',
                    }}
                  >
                    <Heart
                      className="w-5 h-5"
                      style={{
                        color: liked ? '#e91e8c' : 'white',
                        fill: liked ? '#e91e8c' : 'none',
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold text-white drop-shadow">{likesCount}</span>
                </motion.button>

                {/* Fire button */}
                <motion.button
                  whileTap={{ scale: 1.2 }}
                  onClick={handleFire}
                  className="flex flex-col items-center gap-1"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md"
                    style={{
                      background: fireReacted ? 'rgba(255, 85, 0, 0.2)' : 'rgba(0,0,0,0.5)',
                      border: fireReacted ? '1.5px solid #ff5500' : '1.5px solid rgba(255,255,255,0.3)',
                      boxShadow: fireReacted ? '0 0 12px rgba(255,85,0,0.6)' : 'none',
                    }}
                  >
                    <Flame
                      className="w-5 h-5"
                      style={{
                        color: fireReacted ? '#ff5500' : 'white',
                        fill: fireReacted ? '#ff5500' : 'none',
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold text-white drop-shadow">{fireCount}</span>
                </motion.button>

                {/* Comment button */}
                <motion.button
                  whileTap={{ scale: 1.2 }}
                  onClick={() => setShowComments(!showComments)}
                  className="flex flex-col items-center gap-1"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md"
                    style={{
                      background: showComments ? 'rgba(120, 0, 200, 0.2)' : 'rgba(0,0,0,0.5)',
                      border: showComments ? '1.5px solid #7700cc' : '1.5px solid rgba(255,255,255,0.3)',
                      boxShadow: showComments ? '0 0 12px rgba(120,0,200,0.6)' : 'none',
                    }}
                  >
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-bold text-white drop-shadow">{comments.length}</span>
                </motion.button>

                {/* Share button */}
                <motion.button
                  whileTap={{ scale: 1.2 }}
                  className="flex flex-col items-center gap-1"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md"
                    style={{
                      background: 'rgba(0,0,0,0.5)',
                      border: '1.5px solid rgba(255,255,255,0.3)',
                    }}
                  >
                    <Share2 className="w-5 h-5 text-white" />
                  </div>
                </motion.button>
              </div>
            </div>

            {/* Comments Panel - Bottom slide-up */}
            <AnimatePresence>
              {showComments && (
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  className="fixed bottom-0 left-0 right-0 rounded-t-3xl flex flex-col"
                  style={{ zIndex: 10002, maxHeight: '70dvh', height: '60dvh', background: 'rgba(10,5,20,0.98)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  {/* Header */}
                  <div className="px-4 py-4 border-b border-white/10 flex items-center justify-between">
                    <h3 className="text-white font-bold">Comments</h3>
                    <button onClick={() => setShowComments(false)} className="text-white/50 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Comments list */}
                  <div className="flex-1 overflow-y-auto py-3 px-4 space-y-3" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y', overscrollBehavior: 'contain' }}>
                    {comments.length === 0 ? (
                      <p className="text-white/40 text-xs text-center py-4">No comments yet. Be first!</p>
                    ) : (
                      comments.map(comment => (
                        <div key={comment.id} className="flex gap-2">
                          <img
                            src={comment.author_avatar || `https://ui-avatars.com/api/?name=${comment.author_name}&size=32`}
                            alt=""
                            className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                          />
                          <div className="flex-1">
                            <Link to={`/profile/${comment.author_id}`} onClick={onClose} className="text-xs font-bold text-white hover:opacity-80">
                              {comment.author_name}
                            </Link>
                            <p className="text-xs text-white/70 mt-0.5">{comment.text}</p>
                            <p className="text-[10px] text-white/40 mt-1">
                              {new Date(comment.created_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Comment input — always visible */}
                  <div className="px-4 py-3 border-t border-white/10 flex gap-2 items-center bg-black/80"
                    style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom, 12px))' }}>
                    <input
                      type="text"
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      onKeyDown={e => e.key === 'Enter' && handleComment()}
                      style={{ fontSize: '16px' }}
                      className="flex-1 bg-white/10 border border-white/15 rounded-full px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-orange-500/60"
                    />
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={handleComment}
                      disabled={!commentText.trim()}
                      className="w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-30 flex-shrink-0"
                      style={{
                        background: commentText.trim()
                          ? 'linear-gradient(135deg, #ff5500, #e91e8c)'
                          : 'rgba(255,255,255,0.1)',
                      }}
                    >
                      <Send className="w-4 h-4 text-white" />
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Close button — safe-area aware, large tap target */}
            <button
              onClick={onClose}
              className="absolute left-4 flex items-center gap-2 px-4 py-3 rounded-full z-50"
              style={{
                top: 'max(3.5rem, calc(env(safe-area-inset-top) + 1rem))',
                background: 'rgba(0,0,0,0.72)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.2)',
                minWidth: 80,
                minHeight: 44,
              }}
            >
              <X className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-semibold">Close</span>
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}