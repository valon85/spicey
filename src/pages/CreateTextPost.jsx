import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { X, Loader2, Check, Sparkles, Hash, Send } from 'lucide-react';
import SpiceLogo from '@/components/shared/SpiceLogo';
import { motion, AnimatePresence } from 'framer-motion';

export default function CreateTextPost() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [textContent, setTextContent] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [postType, setPostType] = useState('feed');
  const [publishError, setPublishError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Check if coming from StoryCreator - if so, auto-post and redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromStory = params.get('from_story');
    const storedText = sessionStorage.getItem('story_text_content');
    
    if (fromStory === '1' && storedText && !createPost.isPending) {
      setTextContent(storedText);
      setPostType('story');
      // Clear storage first to prevent duplicate posts
      sessionStorage.removeItem('story_text_content');
      // Auto-post after a brief delay
      setTimeout(() => {
        createPost.mutate();
      }, 300);
    }
  }, []);

  const createPost = useMutation({
    mutationFn: async () => {
      setPublishError('');
      const user = await base44.auth.me();
      if (!user) throw new Error('Not logged in');

      const userProfiles = await base44.entities.UserProfile.filter({ user_id: user.id });
      const userProfile = userProfiles[0] || {};
      const authorName = userProfile.full_name || user.full_name || 'User';
      const authorUsername = userProfile.username || user.email?.split('@')[0] || 'user';
      const authorAvatar = userProfile.avatar_url || user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=random`;

      const tagList = hashtags.split(/[,#\s]+/).map(t => t.trim()).filter(Boolean);

      const postData = {
        author_id: user.id,
        author_name: authorName,
        author_username: authorUsername,
        author_avatar: authorAvatar,
        caption: textContent.trim(),
        post_type: 'feed',
        hashtags: tagList,
        likes_count: 0,
        fire_count: 0,
        wow_count: 0,
        comments_count: 0,
        shares_count: 0,
      };

      const result = await base44.entities.Post.create(postData);

      if (postType === 'story') {
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        await base44.entities.Story.create({
          user_id: user.id,
          username: authorUsername,
          user_avatar: authorAvatar,
          image_url: '',
          video_url: '',
          youtube_url: '',
          youtube_video_id: '',
          youtube_title: '',
          youtube_thumbnail: '',
          caption: textContent.trim(),
          expires_at: expiresAt.toISOString(),
          views: [],
        });
      }

      return result;
    },
    onSuccess: () => {
      setShowSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      
      setTimeout(() => {
        setShowSuccess(false);
        navigate('/');
      }, 1500);
    },
    onError: (err) => {
      setPublishError(err?.message || 'Failed to publish.');
      setShowSuccess(false);
    },
  });

  const handleAIGenerate = async () => {
    if (!textContent.trim()) return;
    setIsGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Enhance and improve this social media post text, make it more engaging and viral-worthy: "${textContent}"`,
      });
      setTextContent(response);
    } catch (e) {
      console.error('AI generate failed:', e);
    }
    setIsGenerating(false);
  };

  const charCount = textContent.length;
  const maxChars = 500;

  return (
    <>
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="relative px-8 py-6 rounded-3xl flex flex-col items-center gap-3"
              style={{
                background: 'linear-gradient(135deg, rgba(255,85,0,0.95), rgba(233,30,140,0.95))',
                boxShadow: '0 0 60px rgba(255,85,0,0.6), 0 0 120px rgba(233,30,140,0.4)',
              }}
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-sm">
                <Check className="w-8 h-8 text-white" />
              </div>
              <p className="text-white font-bold text-lg">
                {postType === 'story' ? 'Story posted!' : 'Post published!'}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto"
        style={{ background: 'linear-gradient(160deg, #0a0014 0%, #1a0a2e 50%, #0f0520 100%)' }}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3 flex-shrink-0"
          style={{ paddingTop: 'max(48px, calc(env(safe-area-inset-top, 44px) + 8px))', background: 'rgba(10,0,20,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <X className="w-5 h-5 text-white" />
          </button>
          <SpiceLogo size="sm" />
          <div className="w-9" />
        </div>

        {/* Content — all scrolls together */}
        <div className="flex flex-col px-4 pt-4 gap-3 pb-10">

          {/* Error */}
          {publishError && (
            <div className="px-4 py-2 rounded-2xl text-sm text-red-300 font-semibold"
              style={{ background: 'rgba(220,30,30,0.15)', border: '1px solid rgba(220,30,30,0.4)' }}>
              ⚠️ {publishError}
            </div>
          )}

          {/* Type Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setPostType('story')}
              className="flex-1 py-3 rounded-2xl text-sm font-bold transition-all"
              style={postType === 'story' ? {
                background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)',
                color: 'white',
                boxShadow: '0 0 16px rgba(14,165,233,0.4)',
              } : {
                background: 'rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.5)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}>
              📖 Story (24h)
            </button>
            <button
              onClick={() => setPostType('feed')}
              className="flex-1 py-3 rounded-2xl text-sm font-bold transition-all"
              style={postType === 'feed' ? {
                background: 'linear-gradient(135deg, #ff5500, #e91e8c)',
                color: 'white',
                boxShadow: '0 0 16px rgba(255,85,0,0.4)',
              } : {
                background: 'rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.5)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}>
              📤 Feed
            </button>
          </div>

          {/* Text Area */}
          <div className="relative">
            <textarea
              value={textContent}
              onChange={e => setTextContent(e.target.value)}
              placeholder="What's on your mind... ✨"
              className="w-full rounded-2xl px-4 py-4 text-white placeholder:text-white/30 outline-none resize-none leading-relaxed"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                fontSize: 16,
                minHeight: 160,
              }}
              rows={6}
            />
            <div className="absolute bottom-3 right-3 text-xs font-medium"
              style={{ color: charCount > maxChars ? '#ef4444' : 'rgba(255,255,255,0.3)' }}>
              {charCount}/{maxChars}
            </div>
          </div>

          {/* AI Enhance */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleAIGenerate}
            disabled={!textContent.trim() || isGenerating}
            className="w-full py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40"
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(233,30,140,0.2))',
              border: '1px solid rgba(139,92,246,0.3)',
              color: '#a78bfa',
            }}>
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            ✨ AI Enhance
          </motion.button>

          {/* Hashtags */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Hash className="w-4 h-4 text-white/40 flex-shrink-0" />
            <input
              value={hashtags}
              onChange={e => setHashtags(e.target.value)}
              placeholder="Add hashtags... #viral #trending"
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
              style={{ fontSize: 15 }}
            />
          </div>

          {/* Post Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => createPost.mutate()}
            disabled={!textContent.trim() || createPost.isPending}
            className="w-full py-4 rounded-2xl text-white font-bold text-base disabled:opacity-40"
            style={{
              background: 'linear-gradient(135deg, #ff5500, #e91e8c)',
              boxShadow: '0 0 24px rgba(255,80,0,0.5)',
            }}>
            {createPost.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Posting...
              </span>
            ) : (postType === 'story' ? '📱 Post to Story' : '📤 Post to Feed')}
          </motion.button>
        </div>
      </div>
    </>
  );
}