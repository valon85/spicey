import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { X, ChevronLeft, Music2, Loader2, Wand2 } from 'lucide-react';
import MusicPickerSheet from './MusicPickerSheet';
import MapSharePrompt from './MapSharePrompt';
import VisibilityPicker from '@/components/shared/VisibilityPicker';

// ── Color / filter effects (same style as photo) ──
const EFFECTS = [
  { name: 'None',      style: 'none' },
  { name: 'Vivid',     style: 'saturate(2) contrast(1.15)' },
  { name: 'Warm',      style: 'sepia(0.4) saturate(1.6) brightness(1.08)' },
  { name: 'Cool',      style: 'hue-rotate(25deg) saturate(1.3) brightness(1.05)' },
  { name: 'Noir',      style: 'grayscale(1) contrast(1.25)' },
  { name: 'Fade',      style: 'saturate(0.65) brightness(1.15) contrast(0.9)' },
  { name: 'Golden',    style: 'sepia(0.7) saturate(2.2) brightness(1.12)' },
  { name: 'Moody',     style: 'contrast(1.4) brightness(0.8) saturate(0.75)' },
  { name: 'Cinematic', style: 'contrast(1.2) saturate(0.85) brightness(0.9) sepia(0.2)' },
];

const AI_CAPTION_PROMPTS = [
  'Bold & catchy',
  'Mysterious vibe',
  'Funny & trendy',
  'Romantic mood',
  'Motivational',
];

const AI_BEAUTY_PRESETS = [
  { id: 'face',   label: 'Face',   color: '#ff9900', bg: '#1a0e00', prompt: 'Smooth face, natural skin retouching, professional portrait' },
  { id: 'makeup', label: 'Makeup', color: '#e91e8c', bg: '#1a0010', prompt: 'Full glam makeup, bold lips, contour, highlight, beauty editorial' },
  { id: 'eyes',   label: 'Eyes',   color: '#00ccff', bg: '#001a20', prompt: 'Dramatic eye makeup, long lashes, smoky eyeshadow, glamour portrait' },
  { id: 'hair',   label: 'Hair',   color: '#a733ff', bg: '#0d0020', prompt: 'Voluminous styled hair, salon-quality, glossy, professional portrait' },
  { id: 'color',  label: 'Color',  color: '#00c853', bg: '#001a08', prompt: 'Vibrant color grading, cinematic color, editorial photo' },
];

export default function PostEditorScreen({
  mediaFile, mediaPreview, initialCaption = '', onBack,
  selectedTrack, onTrackChange, forceVideo = false, postType = 'feed',
}) {
  const [caption, setCaption] = useState(initialCaption);
  const [visibility, setVisibility] = useState('public');
  const [selectedEffect, setSelectedEffect] = useState(EFFECTS[0]);
  const [musicOpen, setMusicOpen] = useState(false);
  const [showCaption, setShowCaption] = useState(false);
  const [showBeauty, setShowBeauty] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [beautyLoading, setBeautyLoading] = useState(false);
  const [publishError, setPublishError] = useState('');
  const [enhancedImage, setEnhancedImage] = useState(null);
  const [mapPrompt, setMapPrompt] = useState(null); // { postId, cityName }
  const [detectedCity, setDetectedCity] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const handler = () => {
      if (!window.visualViewport) return;
      const kbH = window.innerHeight - window.visualViewport.height;
      setKeyboardHeight(Math.max(0, kbH));
    };
    window.visualViewport?.addEventListener('resize', handler);
    window.visualViewport?.addEventListener('scroll', handler);
    return () => {
      window.visualViewport?.removeEventListener('resize', handler);
      window.visualViewport?.removeEventListener('scroll', handler);
    };
  }, []);

  // Detect city from GPS on mount
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const city =
            data?.address?.city ||
            data?.address?.town ||
            data?.address?.village ||
            data?.address?.county ||
            '';
          if (city) setDetectedCity(city);
        } catch {}
      },
      () => {},
      { enableHighAccuracy: false, timeout: 5000 }
    );
  }, []);

  const isVideo = forceVideo || mediaFile?.type?.startsWith('video') || mediaPreview?.includes('video');
  const displayImage = enhancedImage || mediaPreview;

  const handleAICaption = async (prompt) => {
    setAiLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Write a short social media caption with the vibe: "${prompt}". Max 2 lines. No quotes. Add relevant emojis.`,
    });
    setCaption(typeof result === 'string' ? result : result?.text || result?.content || '');
    setAiLoading(false);
  };

  const handleAIBeauty = async (preset) => {
    if (!mediaFile && !enhancedImage) return;
    setBeautyLoading(true);
    setShowBeauty(false);
    try {
      let publicUrl = enhancedImage;
      if (!publicUrl && mediaFile) {
        const uploaded = await base44.integrations.Core.UploadFile({ file: mediaFile });
        publicUrl = uploaded.file_url;
      }
      if (!publicUrl && mediaPreview && !mediaPreview.startsWith('blob:')) {
        publicUrl = mediaPreview;
      }
      if (!publicUrl && mediaPreview && mediaPreview.startsWith('blob:')) {
        const blob = await fetch(mediaPreview).then(r => r.blob());
        const uploaded = await base44.integrations.Core.UploadFile({ file: new File([blob], 'photo.jpg', { type: blob.type }) });
        publicUrl = uploaded.file_url;
      }
      const result = await base44.integrations.Core.GenerateImage({
        prompt: preset.prompt + ', high quality, professional photography',
        existing_image_urls: [publicUrl],
      });
      setEnhancedImage(result.url);
    } catch (err) {
      console.error('Beauty enhancement failed:', err);
    }
    setBeautyLoading(false);
  };

  const handleResetBeauty = () => {
    setEnhancedImage(null);
  };

  const createPost = useMutation({
    mutationFn: async () => {
      setPublishError('');
      const user = await base44.auth.me();
      if (!user) throw new Error('Not logged in');

      let imageUrl = '';
      if (mediaFile) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: mediaFile });
        imageUrl = file_url;
      } else if (mediaPreview && mediaPreview.startsWith('blob:')) {
        // blob URL from camera/hub — fetch and upload
        const blob = await fetch(mediaPreview).then(r => r.blob());
        const ext = blob.type.includes('video') ? 'webm' : 'jpg';
        const file = new File([blob], `capture.${ext}`, { type: blob.type });
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        imageUrl = file_url;
      } else if (mediaPreview && !mediaPreview.startsWith('blob:')) {
        imageUrl = mediaPreview;
      }

      const userProfiles = await base44.entities.UserProfile.filter({ user_id: user.id });
      const userProfile = userProfiles[0] || {};
      const authorName = userProfile.full_name || user.full_name || 'User';
      const authorUsername = userProfile.username || user.email?.split('@')[0] || 'user';
      const authorAvatar = userProfile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=random`;

      const postData = {
        author_id: user.id,
        author_name: authorName,
        author_username: authorUsername,
        author_avatar: authorAvatar,
        caption: caption.trim(),
        image_url: imageUrl || '',
        video_url: (postType === 'reels' || isVideo) ? imageUrl : '',
        youtube_url: '',
        youtube_video_id: '',
        youtube_title: '',
        youtube_thumbnail: '',
        hashtags: [],
        location: detectedCity || '',
        map_visible: false,
        map_city: detectedCity || '',
        tags: '',
        visibility: visibility,
        likes_count: 0, fire_count: 0, wow_count: 0, comments_count: 0, shares_count: 0,
      };

      const result = await base44.entities.Post.create(postData);
      
      // If story, also create Story entity
      if (postType === 'story') {
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        await base44.entities.Story.create({
          user_id: user.id,
          username: authorUsername,
          user_avatar: authorAvatar,
          image_url: imageUrl,
          video_url: isVideo ? imageUrl : imageUrl,
          caption: caption.trim(),
          expires_at: expiresAt.toISOString(),
          views: [],
        });
      }
      
      return { postType, postId: result.id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      // Show map prompt for feed and reels (not stories — those expire in 24h anyway)
      if (detectedCity && data?.postType !== 'story' && data?.postId) {
        setMapPrompt({ postId: data.postId, cityName: detectedCity });
      } else {
        navigateAfterPost(data?.postType);
      }
    },
    onError: (err) => setPublishError(err?.message || 'Failed to publish.'),
  });

  const navigateAfterPost = (type) => {
    if (type === 'reels') navigate('/reels');
    else if (type === 'story') navigate('/stories');
    else navigate('/');
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col">

      {/* ── Full screen media ── */}
      <div className="absolute inset-0">
        {isVideo
          ? <video src={mediaPreview} autoPlay loop playsInline className="w-full h-full object-cover" style={{ filter: selectedEffect.style }} />
          : <img src={displayImage} alt="Preview" className="w-full h-full object-cover" style={{ filter: selectedEffect.style }} />
        }
        {beautyLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3"
            style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}>
            <Loader2 className="w-10 h-10 text-white animate-spin" />
            <p className="text-white font-bold text-sm">AI enhancing...</p>
          </div>
        )}
        {enhancedImage && (
          <button onClick={handleResetBeauty}
            className="absolute top-20 right-4 z-20 flex items-center gap-1 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(220,30,30,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <X className="w-3.5 h-3.5 text-white" />
            <span className="text-white text-[11px] font-bold">Reset</span>
          </button>
        )}
        {/* Top gradient */}
        <div className="absolute top-0 left-0 right-0 h-40 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.75), transparent)' }} />
        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{ height: '55%', background: 'linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.5) 50%, transparent)' }} />
      </div>

      {/* ── Top bar ── */}
      <div className="relative z-10 flex items-center justify-between px-4"
        style={{ paddingTop: 'max(52px, calc(env(safe-area-inset-top, 44px) + 10px))' }}>
        <button onClick={() => {
            if (window.__clearEnhancedImage) window.__clearEnhancedImage();
            onBack();
          }}
          className="w-10 h-10 flex items-center justify-center rounded-full"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)' }}>
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <span className="text-sm font-extrabold tracking-[0.28em] uppercase"
          style={{ background: 'linear-gradient(135deg, #ff5500, #ee1166, #a733ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          SPICEY
        </span>
        {/* Share button */}
        <button onClick={() => createPost.mutate()}
          disabled={createPost.isPending}
          className="px-5 py-2 rounded-full font-bold text-white text-sm disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)', boxShadow: '0 0 18px rgba(255,80,0,0.5)' }}>
          {createPost.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Share 🔥'}
        </button>
      </div>

      {/* ── Caption overlay on media (if set) ── */}
      {caption.trim() !== '' && !showCaption && (
        <div className="absolute left-4 right-4 z-10" style={{ bottom: 'calc(55% + 8px)' }}>
          <p className="text-white font-semibold text-base leading-snug"
            style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>
            {caption}
          </p>
        </div>
      )}

      {/* ── Bottom panel ── */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex flex-col gap-3 px-4"
        style={{
          paddingBottom: keyboardHeight > 0 ? `${keyboardHeight + 12}px` : 'max(32px, calc(env(safe-area-inset-bottom, 0px) + 24px))',
          background: 'linear-gradient(to top, rgba(0,0,0,0.96), rgba(0,0,0,0.8) 30%, transparent 100%)',
          transition: 'padding-bottom 0.2s ease',
        }}>

        {/* Effects / Filters row - larger and more visible */}
        <div className="flex gap-3 overflow-x-auto pb-2 px-1" style={{ scrollbarWidth: 'none' }}>
          {EFFECTS.map(fx => (
            <motion.button 
              key={fx.name} 
              whileTap={{ scale: 0.92 }} 
              onClick={() => setSelectedEffect(fx)}
              onTouchStart={e => e.preventDefault()}
              className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl overflow-hidden relative"
                style={{
                  border: selectedEffect.name === fx.name ? '2.5px solid #ff5500' : '1.5px solid rgba(255,255,255,0.2)',
                  boxShadow: selectedEffect.name === fx.name ? '0 0 16px rgba(255,80,0,0.9)' : '0 0 8px rgba(255,255,255,0.1)',
                }}>
                {isVideo
                  ? <div className="w-full h-full"
                      style={{ background: 'linear-gradient(135deg, rgba(255,100,0,0.5), rgba(220,30,120,0.4))', filter: fx.style }} />
                  : <img src={displayImage} alt={fx.name} className="w-full h-full object-cover" style={{ filter: fx.style }} />
                }
              </div>
              <span className="text-[10px] font-bold"
                style={{ color: selectedEffect.name === fx.name ? '#ffaa00' : 'rgba(255,255,255,0.6)' }}>
                {fx.name}
              </span>
            </motion.button>
          ))}
        </div>



        {/* Publish error */}
        {publishError && (
          <div className="px-4 py-2 rounded-2xl text-sm text-red-300 font-semibold text-center"
            style={{ background: 'rgba(220,30,30,0.25)', border: '1px solid rgba(220,30,30,0.4)' }}>
            ⚠️ {publishError}
          </div>
        )}



        {/* Visibility picker */}
        <div className="rounded-2xl overflow-hidden px-3 py-2.5"
          style={{ background: 'rgba(10,4,22,0.85)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="text-[10px] font-bold text-white/40 mb-2 uppercase tracking-wider">Who can see this?</p>
          <VisibilityPicker value={visibility} onChange={setVisibility} />
        </div>

        {/* Music button */}
        <button onClick={() => setMusicOpen(true)}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl w-full"
          style={{
            background: selectedTrack ? 'rgba(233,30,140,0.18)' : 'rgba(255,255,255,0.08)',
            border: `1px solid ${selectedTrack ? 'rgba(233,30,140,0.5)' : 'rgba(255,255,255,0.12)'}`,
            backdropFilter: 'blur(14px)',
          }}>
          <Music2 className="w-4 h-4 text-pink-400 flex-shrink-0" />
          <span className="text-sm font-semibold flex-1 text-left truncate"
            style={{ color: selectedTrack ? 'white' : 'rgba(255,255,255,0.5)' }}>
            {selectedTrack ? `${selectedTrack.emoji} ${selectedTrack.title}` : 'Add Music'}
          </span>
          {selectedTrack && (
            <button onClick={e => { e.stopPropagation(); onTrackChange(null); }}
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(220,30,30,0.7)' }}>
              <X className="w-3 h-3 text-white" />
            </button>
          )}
        </button>

        {/* Caption area — orange/purple gradient table style */}
        <div className="rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(10,4,22,0.85)',
            border: '2px solid rgba(167,51,255,0.6)',
            boxShadow: '0 0 20px rgba(167,51,255,0.5), inset 0 0 20px rgba(167,51,255,0.15)',
            backdropFilter: 'blur(20px)',
          }}>
          {/* Tab header */}
          <div className="flex items-center px-3 pt-2 pb-1 gap-2"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #ff5500, #a733ff)' }}>
              <span className="text-[10px]">✏️</span>
            </div>
            <span className="text-xs font-bold flex-1"
              style={{ background: 'linear-gradient(135deg, #ff8800, #a733ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Caption
            </span>
            {/* AI help button */}
            <button 
              onClick={() => setShowCaption(s => !s)}
              onTouchStart={e => e.preventDefault()}
              className="px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1"
              style={{ background: 'linear-gradient(135deg, #ff5500, #a733ff)', color: 'white' }}>
              <Wand2 className="w-3 h-3" />
              AI Help
            </button>
          </div>

          {/* Text input */}
          <textarea
            value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder="Write a caption... or use AI ✨"
            rows={2}
            className="w-full px-3 py-2.5 bg-transparent text-white text-sm outline-none resize-none placeholder:text-white/30"
            style={{ fontSize: 16 }}
          />

          {/* AI suggestions row */}
          <AnimatePresence>
            {showCaption && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden">
                <div className="px-3 pb-3 pt-1 space-y-2">
                  <p className="text-[10px] text-white/40 font-semibold">Choose a vibe:</p>
                  <div className="flex flex-wrap gap-2">
                    {AI_CAPTION_PROMPTS.map(p => (
                      <button 
                        key={p} 
                        onClick={() => { handleAICaption(p); setShowCaption(false); }}
                        onTouchStart={e => e.preventDefault()}
                        disabled={aiLoading}
                        className="px-3 py-1.5 rounded-xl text-[11px] font-bold disabled:opacity-50"
                        style={{ background: 'rgba(255,80,0,0.15)', border: '1px solid rgba(255,80,0,0.35)', color: '#ff9944' }}>
                        {p}
                      </button>
                    ))}
                  </div>
                  {aiLoading && (
                    <div className="flex items-center gap-2 text-white/50 text-xs">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Writing your caption...
                    </div>
                  )}
                  {/* Clear caption */}
                  {caption.trim() && (
                    <button onClick={() => setCaption('')}
                      className="text-[10px] text-red-400/70 font-semibold">
                      × Remove caption
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      <MusicPickerSheet
        open={musicOpen}
        onClose={() => setMusicOpen(false)}
        onSelect={onTrackChange}
        selectedTrack={selectedTrack}
      />

      {mapPrompt && (
        <MapSharePrompt
          postId={mapPrompt.postId}
          cityName={mapPrompt.cityName}
          postType={postType}
          hasVideo={isVideo}
          onDone={() => {
            setMapPrompt(null);
            navigateAfterPost(createPost.data?.postType);
          }}
        />
      )}
    </div>
  );
}