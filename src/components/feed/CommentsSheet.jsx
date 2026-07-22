import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Send, Heart, X, AtSign, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import VerifiedBadge from '../shared/VerifiedBadge';
import { toast } from 'sonner';
import useScrollLock from '@/hooks/useScrollLock';

// Utility to ensure array safety
const asArray = (v) => Array.isArray(v) ? v : [];

export default function CommentsSheet({ post, open, onClose }) {
  const [text, setText] = useState('');
  const [commentLikes, setCommentLikes] = useState({});
  const [isLight, setIsLight] = useState(false);
  const [verifiedCommenters, setVerifiedCommenters] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionResults, setMentionResults] = useState([]);
  const [showMentions, setShowMentions] = useState(false);
  const [localComments, setLocalComments] = useState([]);
  const [sending, setSending] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const sheetRef = useRef(null);
  const queryClient = useQueryClient();
  useScrollLock(open);

  useEffect(() => {
    const check = () => setIsLight(document.documentElement.classList.contains('light-mode'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  useEffect(() => {
    if (!open) {
      setKeyboardOpen(false);
      return;
    }
    setLocalComments([]);
    setText('');
    setShowMentions(false);
    setMentionResults([]);
  }, [open, post?.id]);

  // Detect keyboard open/close via visualViewport
  useEffect(() => {
    if (!open) return;
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () => {
      const keyboardHeight = window.innerHeight - vv.height;
      setKeyboardOpen(keyboardHeight > 100);
      if (keyboardHeight > 100) {
        setTimeout(() => inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
      }
    };
    vv.addEventListener('resize', onResize);
    return () => vv.removeEventListener('resize', onResize);
  }, [open]);

  // Hide BottomNav whenever the sheet is open (not just when keyboard is open)
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

  const { data: fetchedComments = [], isLoading } = useQuery({
    queryKey: ['comments', post?.id],
    queryFn: () => base44.entities.Comment.filter({ post_id: post?.id }, '-created_date', 50),
    enabled: !!post?.id && open,
  });

  // Merge server + local (local first so new ones appear at top)
  const comments = [
    ...asArray(localComments),
    ...asArray(fetchedComments).filter(fc => !asArray(localComments).find(lc => lc.id === fc.id))
  ];

  // Verified badges
  useEffect(() => {
    const safeFetchedComments = asArray(fetchedComments);
    if (!safeFetchedComments.length) return;
    const uniqueIds = [...new Set(safeFetchedComments.map(c => c.author_id))];
    asArray(uniqueIds).forEach(authorId => {
      Promise.all([
        base44.entities.Subscription.filter({ user_id: authorId, status: 'active' }),
        base44.entities.UserProfile.filter({ user_id: authorId }, '-created_date', 1)
      ]).then(([subs, profiles]) => {
        const hasVip = asArray(subs).some(s => ['vip','creator','business'].includes(s.plan_type));
        const profile = asArray(profiles)[0];
        setVerifiedCommenters(prev => ({ ...prev, [authorId]: hasVip || !!profile?.verified || !!profile?.verification_badge }));
      }).catch(() => {});
    });
  }, [fetchedComments]);

  // @ mention search
  const handleTextChange = (e) => {
    const val = e.target.value;
    setText(val);
    const atIdx = val.lastIndexOf('@');
    if (atIdx !== -1) {
      const q = val.slice(atIdx + 1);
      if (q.length >= 1 && !q.includes(' ')) {
        setMentionQuery(q);
        setShowMentions(true);
        base44.functions.invoke('searchUsers', { query: q, limit: 5 })
          .then(res => setMentionResults(asArray(res?.data?.users || res?.data).slice(0, 5)))
          .catch(() => setMentionResults([]));
      } else if (q.length === 0) {
        // Just typed @, show popular or keep empty open
        setShowMentions(true);
        setMentionResults([]);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (username) => {
    const atIdx = text.lastIndexOf('@');
    const newText = text.slice(0, atIdx) + `@${username} `;
    setText(newText);
    setShowMentions(false);
    setMentionResults([]);
    // Re-focus and move cursor to end
    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(newText.length, newText.length);
      }
    });
  };

  const handleAtButton = () => {
    const newText = text + '@';
    setText(newText);
    setShowMentions(true);
    setMentionResults([]);
    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(newText.length, newText.length);
      }
    });
  };

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setText('');
    setShowMentions(false);

    const user = currentUser || await base44.auth.me();
    const profiles = await base44.entities.UserProfile.filter({ user_id: user.id }).catch(() => []);
    const profile = asArray(profiles)[0];
    const displayName = profile?.full_name || user.full_name || user.email?.split('@')[0] || 'User';
    const username = profile?.username || user.email?.split('@')[0] || 'user';
    const avatarUrl = profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=ff5500&color=fff&size=128`;

    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      post_id: post.id,
      author_id: user.id,
      text: trimmed,
      author_name: displayName,
      author_username: username,
      author_avatar: avatarUrl,
      likes_count: 0,
      created_date: new Date().toISOString(),
    };
    setLocalComments(prev => [optimistic, ...asArray(prev)]);
    listRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const saved = await base44.entities.Comment.create({
        post_id: post.id,
        author_id: user.id,
        text: trimmed,
        author_name: displayName,
        author_username: username,
        author_avatar: avatarUrl,
      });
      setLocalComments(prev => asArray(prev).map(c => c.id === tempId ? { ...saved, author_name: displayName, author_username: username, author_avatar: avatarUrl } : c));
      base44.entities.Post.update(post.id, { comments_count: (post.comments_count || 0) + 1 }).catch(() => {});
      queryClient.invalidateQueries({ queryKey: ['comments', post?.id] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    } catch {
      setLocalComments(prev => asArray(prev).filter(c => c.id !== tempId));
      setText(trimmed);
    } finally {
      setSending(false);
    }
  };

  const likeComment = (comment) => {
    const isLiked = commentLikes[comment.id];
    setCommentLikes(prev => ({ ...prev, [comment.id]: !isLiked }));
    base44.entities.Comment.update(comment.id, {
      likes_count: isLiked ? Math.max(0, (comment.likes_count || 1) - 1) : (comment.likes_count || 0) + 1
    }).catch(() => {});
  };

  const deleteComment = async (comment) => {
    // Only allow owner or admin to delete
    if (!currentUser) return;
    const isOwner = currentUser.id === comment.author_id;
    const isAdmin = currentUser.role === 'admin';
    if (!isOwner && !isAdmin) return;

    setLocalComments(prev => asArray(prev).filter(c => c.id !== comment.id));
    queryClient.setQueryData(['comments', post?.id], (old = []) => asArray(old).filter(c => c.id !== comment.id));
    base44.entities.Comment.delete(comment.id).catch(() => {});
    base44.entities.Post.update(post.id, { comments_count: Math.max(0, (post.comments_count || 1) - 1) }).catch(() => {});
    toast.success('Comment deleted');
  };

  if (!post) return null;

  const bg = isLight ? '#f8f4ff' : 'rgba(14,7,24,0.99)';
  const border = isLight ? '1px solid rgba(160,80,220,0.15)' : '1px solid rgba(255,255,255,0.08)';
  const textMain = isLight ? '#1a0a2e' : 'white';
  const textSub = isLight ? 'rgba(80,40,120,0.45)' : 'rgba(255,255,255,0.4)';

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0"
        style={{ zIndex: 10000, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      />

      {/* Sheet */}
      <motion.div
        ref={sheetRef}
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="fixed left-0 right-0 rounded-t-3xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{
          zIndex: 10001,
          bottom: 0,
          maxHeight: '88dvh',
          height: 'min(78dvh, 660px)',
          background: isLight ? '#ffffff' : '#000000',
          border,
          boxShadow: isLight ? '0 -22px 55px rgba(160,80,220,0.22)' : '0 -24px 60px rgba(0,0,0,0.72)',
          overflow: 'hidden',
          touchAction: 'pan-y',
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ background: isLight ? 'rgba(120,80,180,0.2)' : 'rgba(255,255,255,0.2)' }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3 flex-shrink-0"
          style={{ borderBottom: isLight ? '1px solid rgba(160,80,220,0.1)' : '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="font-extrabold text-[15px]" style={{ color: textMain }}>
            Comments{' '}
            <span className="font-normal text-xs" style={{ color: textSub }}>({comments.length})</span>
          </h3>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: isLight ? 'rgba(160,80,220,0.1)' : 'rgba(255,255,255,0.08)' }}>
            <X className="w-4 h-4" style={{ color: textSub }} />
          </button>
        </div>

        {/* Comment list — scrollable */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
          style={{
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            touchAction: 'pan-y',
            minHeight: 0,
          }}
          onTouchMove={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
        >
          {isLoading && localComments.length === 0 ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 rounded-full animate-spin"
                style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: '#ff5500' }} />
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <span className="text-3xl">💬</span>
              <p className="text-sm" style={{ color: textSub }}>No comments yet. Be the first!</p>
            </div>
          ) : (
            asArray(comments).map((comment) => (
              <div key={comment.id} className="flex gap-2.5 rounded-2xl px-2.5 py-2"
                style={{
                  background: isLight ? 'rgba(255,255,255,0.72)' : '#000000',
                  border: isLight ? '1px solid rgba(160,80,220,0.10)' : '1px solid rgba(255,255,255,0.06)',
                }}>
                <span className="p-[1.5px] rounded-full flex-shrink-0 mt-0.5"
                  style={{ background: 'conic-gradient(from 0deg, #ff6a00, #ff2d8f, #7c3aed, #ff6a00)' }}>
                  <img
                    src={comment.author_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author_name || 'U')}&background=6d28d9&color=fff&size=40`}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover border-2"
                    style={{ borderColor: isLight ? '#fff' : '#09030f' }}
                  />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Link to={`/profile/${comment.author_id}`} onClick={onClose}>
                      <span className="text-sm font-bold" style={{ color: textMain }}>
                        {comment.author_name || 'User'}
                      </span>
                    </Link>
                    {verifiedCommenters[comment.author_id] && <VerifiedBadge type="verified" size="sm" />}
                    <span className="text-xs" style={{ color: textSub }}>@{comment.author_username}</span>
                  </div>
                  <p className="text-[13px] leading-snug" style={{ color: isLight ? 'rgba(40,20,70,0.85)' : 'rgba(255,255,255,0.82)' }}>
                    {asArray((comment.text || '').split(/(@\w+)/g)).map((part, idx) =>
                      part.startsWith('@')
                        ? <span key={idx} style={{ color: '#ff7040', fontWeight: 600 }}>{part}</span>
                        : part
                    )}
                  </p>
                </div>
                {/* Actions: like + delete (owner only) */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <button onClick={() => likeComment(comment)}
                    className="w-8 h-8 flex items-center justify-center rounded-full active:scale-90 transition-transform">
                    <Heart className="w-4 h-4" style={{
                      color: commentLikes[comment.id] ? '#ec4899' : (isLight ? 'rgba(120,80,180,0.35)' : 'rgba(255,255,255,0.3)'),
                      fill: commentLikes[comment.id] ? '#ec4899' : 'none'
                    }} />
                  </button>
                  <span className="text-[10px]" style={{ color: textSub }}>
                    {(comment.likes_count || 0) + (commentLikes[comment.id] ? 1 : 0)}
                  </span>
                  {currentUser && (currentUser.id === comment.author_id || currentUser.role === 'admin') && (
                    <button onClick={() => deleteComment(comment)}
                      className="w-8 h-8 flex items-center justify-center rounded-full active:scale-90 transition-transform mt-0.5">
                      <Trash2 className="w-3.5 h-3.5 text-red-400/60" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* @ mention suggestions — floats above the input */}
        {showMentions && mentionResults.length > 0 && (
          <div className="flex-shrink-0 px-4 pb-1">
            <div className="rounded-2xl overflow-hidden"
              style={{ background: isLight ? 'white' : 'rgba(30,15,50,0.98)', border: isLight ? '1px solid rgba(160,80,220,0.2)' : '1px solid rgba(255,255,255,0.1)' }}>
              {asArray(mentionResults).map((u) => (
                <button
                  key={u.user_id || u.id}
                  // Use onPointerDown so it fires before the input loses focus
                  onPointerDown={(e) => { e.preventDefault(); insertMention(u.username); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 active:opacity-70 text-left"
                  style={{ borderBottom: isLight ? '1px solid rgba(160,80,220,0.07)' : '1px solid rgba(255,255,255,0.05)' }}>
                  <img
                    src={u.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name || u.username || 'U')}&background=ff5500&color=fff&size=40`}
                    alt="" className="w-7 h-7 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: textMain }}>{u.full_name || u.username}</p>
                    <p className="text-xs" style={{ color: textSub }}>@{u.username}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input bar */}
        <div
          className="flex-shrink-0 flex items-center gap-2 px-3 pt-2"
          style={{
            paddingBottom: keyboardOpen ? '8px' : 'max(10px, env(safe-area-inset-bottom, 8px))',
            borderTop: isLight ? '1px solid rgba(160,80,220,0.12)' : '1px solid rgba(255,255,255,0.07)',
            background: isLight ? 'rgba(248,244,255,0.98)' : 'rgba(14,7,24,0.98)',
            position: 'sticky',
            bottom: 0,
            zIndex: 10002,
            minHeight: 54,
            pointerEvents: 'auto',
          }}
        >
          {/* @ shortcut */}
          <button
            onPointerDown={(e) => { e.preventDefault(); handleAtButton(); }}
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: isLight ? 'rgba(160,80,220,0.1)' : 'rgba(255,255,255,0.07)',
              border: isLight ? '1px solid rgba(160,80,220,0.2)' : '1px solid rgba(255,255,255,0.1)'
            }}>
            <AtSign className="w-4 h-4" style={{ color: isLight ? '#7c3aed' : 'rgba(255,255,255,0.5)' }} />
          </button>

          <input
            ref={inputRef}
            value={text}
            onChange={handleTextChange}
            placeholder="Comment..."
            className="spicey-comment-input flex-1 outline-none rounded-full px-3"
            autoComplete="off"
            autoCorrect="on"
            spellCheck="true"
            inputMode="text"
            enterKeyHint="send"
            style={{
              fontSize: '16px',
              lineHeight: '34px',
              background: isLight ? '#ffffff' : 'rgba(32,18,48,0.98)',
              border: isLight ? '1px solid rgba(160,80,220,0.22)' : '1px solid rgba(255,255,255,0.14)',
              color: isLight ? '#1a0a2e' : 'white',
              caretColor: '#ff5500',
              minWidth: 0,
              minHeight: 34,
              height: 34,
              pointerEvents: 'auto',
              colorScheme: isLight ? 'light' : 'dark',
              boxShadow: isLight ? '0 3px 10px rgba(120,80,180,0.08)' : 'inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !showMentions) {
                e.preventDefault();
                handleSend();
              }
              if (e.key === 'Escape') {
                setShowMentions(false);
              }
            }}
          />

          <button
            onPointerDown={(e) => { e.preventDefault(); handleSend(); }}
            disabled={!text.trim() || sending}
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40"
            style={{
              background: text.trim() ? 'linear-gradient(135deg, #ff5500, #e91e8c)' : (isLight ? 'rgba(160,80,220,0.12)' : 'rgba(255,255,255,0.07)'),
              boxShadow: text.trim() ? '0 4px 16px rgba(255,80,0,0.4)' : 'none',
            }}
          >
            {sending
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Send className="w-4 h-4" style={{ color: text.trim() ? 'white' : (isLight ? 'rgba(120,80,180,0.5)' : 'rgba(255,255,255,0.4)') }} />
            }
          </button>
        </div>
      </motion.div>
    </>
  );
}
