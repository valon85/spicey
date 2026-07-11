import React, { useState } from 'react';
import { X, Loader2, Video, Link } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';

export default function CreateVideoPost() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [videoLink, setVideoLink] = useState(() => {
    const pending = window._pendingVideoLink || sessionStorage.getItem('ai_video_url') || '';
    window._pendingVideoLink = null;
    sessionStorage.removeItem('ai_video_url');
    return pending;
  });
  const [caption, setCaption] = useState(() => {
    const pending = sessionStorage.getItem('ai_video_caption') || '';
    sessionStorage.removeItem('ai_video_caption');
    return pending;
  });
  const [isPosting, setIsPosting] = useState(false);

  const handlePost = async () => {
    if (!videoLink.trim()) return;
    setIsPosting(true);
    try {
      const user = await base44.auth.me();
      const userProfiles = await base44.entities.UserProfile.filter({ user_id: user.id });
      const userProfile = userProfiles[0] || {};
      const authorName = userProfile.full_name || user.full_name || 'User';
      const authorUsername = userProfile.username || user.email?.split('@')[0] || 'user';
      const authorAvatar = userProfile.avatar_url || user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=ff5500&color=fff&size=128`;

      await base44.entities.Post.create({
        author_id: user.id,
        author_name: authorName,
        author_username: authorUsername,
        author_avatar: authorAvatar,
        caption: caption.trim() || 'Video Post',
        post_type: 'feed',
        video_link: videoLink.trim(),
      });

      queryClient.invalidateQueries({ queryKey: ['posts'] });
      navigate('/');
    } catch (error) {
      alert('Failed to share video: ' + error.message);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'linear-gradient(160deg, #0a0014, #0d0520, #050010)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 flex-shrink-0"
        style={{ paddingTop: 'max(48px, env(safe-area-inset-top, 44px))', paddingBottom: 16 }}>
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <X className="w-5 h-5 text-white" />
        </button>
        <span className="text-white font-bold text-base">Share Video</span>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handlePost}
          disabled={!videoLink.trim() || isPosting}
          className="px-4 py-2 rounded-full text-white font-bold text-sm disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)' }}>
          {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post'}
        </motion.button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pt-6 flex flex-col gap-4">

        {/* Video URL input */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.05)', border: videoLink.trim() ? '1.5px solid rgba(255,85,0,0.6)' : '1.5px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-3 px-4 py-3"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)' }}>
              <Link className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-sm">Video URL</span>
          </div>
          <div className="p-4">
            <input
              type="url"
              value={videoLink}
              onChange={e => setVideoLink(e.target.value)}
              placeholder="Paste video link here..."
              autoFocus={!videoLink}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
                fontSize: 15,
              }}
            />
            {videoLink.trim() && (
              <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
                ✓ Link ready to share
              </p>
            )}
          </div>
        </div>

        {/* Caption input */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-3 px-4 py-3"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.08)' }}>
              <Video className="w-4 h-4 text-white/60" />
            </div>
            <span className="text-white font-bold text-sm">Caption</span>
          </div>
          <div className="p-4">
            <textarea
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="Write a caption..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
                fontSize: 15,
              }}
            />
          </div>
        </div>

        {/* Share button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handlePost}
          disabled={!videoLink.trim() || isPosting}
          className="w-full py-4 rounded-2xl text-white font-bold text-base disabled:opacity-40 flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg, #ff5500, #e91e8c)',
            boxShadow: videoLink.trim() ? '0 0 24px rgba(255,80,0,0.5)' : 'none',
          }}>
          {isPosting ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Sharing...</>
          ) : '🎬 Share Video'}
        </motion.button>

      </div>
    </div>
  );
}
