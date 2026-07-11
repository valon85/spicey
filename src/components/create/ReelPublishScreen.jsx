import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader2, Music2, MapPin, Globe, Building2, Check, Volume2, VolumeX, X } from 'lucide-react';
import MusicPickerSheet from './MusicPickerSheet';
import MapSharePrompt from './MapSharePrompt';

export default function ReelPublishScreen({ file, previewUrl, initialMusic = null, onBack }) {
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [location, setLocation] = useState('');
  const [selectedTrack, setSelectedTrack] = useState(initialMusic);
  const [muteOriginalAudio, setMuteOriginalAudio] = useState(false);
  const [musicOpen, setMusicOpen] = useState(false);
  const [destination, setDestination] = useState('global');
  const [publishError, setPublishError] = useState('');
  const [mapPrompt, setMapPrompt] = useState(null);
  const [detectedCity, setDetectedCity] = useState('');
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Detect city in background (no prompt)
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
          const data = await res.json();
          const city = data?.address?.city || data?.address?.town || data?.address?.suburb || data?.address?.village || data?.address?.county || '';
          if (city) { setDetectedCity(city); setLocation(city); }
        } catch {}
      },
      () => {},
      { enableHighAccuracy: false, timeout: 5000 }
    );
  }, []);

  // Sync mute to video preview
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muteOriginalAudio;
  }, [muteOriginalAudio]);

  const publishReel = useMutation({
    mutationFn: async () => {
      setPublishError('');
      const user = await base44.auth.me();
      if (!user) throw new Error('Not logged in');

      const profiles = await base44.entities.UserProfile.filter({ user_id: user.id }).catch(() => []);
      const p = profiles[0] || {};
      const authorName = p.full_name || user.full_name || 'User';
      const authorUsername = p.username || user.email?.split('@')[0] || 'user';
      const authorAvatar = p.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=random`;

      // Upload video
      let videoUrl = previewUrl;
      if (file) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        videoUrl = file_url;
        // Try Cloudflare Stream for HLS
        try {
          const cfRes = await base44.functions.invoke('uploadToCloudflare', { video_url: file_url });
          if (cfRes?.data?.hls_url) videoUrl = cfRes.data.hls_url;
        } catch {}
      }

      const tagList = hashtags.split(/[,#\s]+/).map(t => t.trim()).filter(Boolean);
      const finalCity = location.trim() || detectedCity;
      const mapVisible = destination === 'city' || destination === 'both';

      const postData = {
        author_id: user.id,
        author_name: authorName,
        author_username: authorUsername,
        author_avatar: authorAvatar,
        caption: caption.trim(),
        post_type: 'reel',
        video_url: videoUrl,
        image_url: '',
        hashtags: tagList,
        location: finalCity,
        map_visible: mapVisible,
        map_city: mapVisible ? finalCity : '',
        music_title: selectedTrack?.title || '',
        music_artist: selectedTrack?.artist || '',
        music_preview_url: selectedTrack?.previewUrl || selectedTrack?.preview_url || '',
        music_artwork_url: selectedTrack?.artworkUrl || selectedTrack?.artwork_url || '',
        tags: '',
        likes_count: 0, fire_count: 0, wow_count: 0, comments_count: 0, shares_count: 0,
      };

      const result = await base44.entities.Post.create(postData);
      return { postId: result.id, cityName: finalCity };
    },
    onSuccess: ({ postId, cityName }) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['spicey-reels-feed-v8'] });
      if (destination !== 'city' && destination !== 'both') {
        setMapPrompt({ postId, cityName: cityName || '' });
      } else {
        navigate('/reels');
      }
    },
    onError: (err) => setPublishError(err?.message || 'Failed to publish reel.'),
  });

  return (
    <motion.div
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-0 z-[65] flex flex-col"
      style={{ background: '#08040e' }}
      data-prevent-light-mode="true">

      {/* Header */}
      <div className="flex items-center justify-between px-4 z-10"
        style={{ paddingTop: 'max(52px, calc(env(safe-area-inset-top, 44px) + 10px))', paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <button onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full"
          style={{ background: 'rgba(255,255,255,0.08)' }}>
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <span className="text-white font-bold text-base">New Reel</span>
        <button
          onClick={() => publishReel.mutate()}
          disabled={publishReel.isPending}
          className="px-5 py-2 rounded-full text-white font-bold text-sm disabled:opacity-60 active:scale-95 transition-transform"
          style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)', boxShadow: '0 0 18px rgba(255,80,0,0.4)' }}>
          {publishReel.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post 🚀'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Split layout: video left, form right on wide screens; stacked on mobile */}
        <div className="flex flex-col md:flex-row">
          {/* Video preview */}
          {previewUrl && (
            <div className="relative w-full md:w-2/5 flex-shrink-0" style={{ maxHeight: 300 }}>
              <video ref={videoRef} src={previewUrl} autoPlay loop playsInline
                className="w-full h-full object-cover"
                style={{ maxHeight: 300 }}
                muted={muteOriginalAudio}
              />
              {/* Mute original audio toggle */}
              <button
                onClick={() => setMuteOriginalAudio(m => !m)}
                className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-xs font-semibold active:scale-95 transition-transform"
                style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                {muteOriginalAudio
                  ? <><VolumeX className="w-3.5 h-3.5" /> Original muted</>
                  : <><Volume2 className="w-3.5 h-3.5" /> Original audio</>}
              </button>
            </div>
          )}

          {/* Form */}
          <div className="flex flex-col gap-4 px-4 pt-4 pb-8 flex-1">
            {/* Error */}
            {publishError && (
              <div className="px-4 py-2.5 rounded-2xl text-sm text-red-300"
                style={{ background: 'rgba(220,30,30,0.15)', border: '1px solid rgba(220,30,30,0.4)' }}>
                ⚠️ {publishError}
              </div>
            )}

            {/* Caption */}
            <textarea
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="Write a caption..."
              rows={3}
              className="w-full rounded-2xl px-4 py-3 text-white text-sm outline-none resize-none placeholder:text-white/30"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 15 }}
            />

            {/* Hashtags */}
            <input
              value={hashtags}
              onChange={e => setHashtags(e.target.value)}
              placeholder="#trending #viral #reels"
              className="w-full rounded-2xl px-4 py-3 text-white text-sm outline-none placeholder:text-white/30"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 15 }}
            />

            {/* Location */}
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <MapPin className="w-4 h-4 text-white/40 flex-shrink-0" />
              <input
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Add location"
                className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/30"
                style={{ fontSize: 15 }}
              />
            </div>

            {/* Music — mute original + add music */}
            <div className="flex flex-col gap-2">
              <button onClick={() => setMusicOpen(true)}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl w-full active:scale-98 transition-transform"
                style={{
                  background: selectedTrack ? 'rgba(233,30,140,0.12)' : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${selectedTrack ? 'rgba(233,30,140,0.4)' : 'rgba(255,255,255,0.1)'}`,
                }}>
                <Music2 className="w-4 h-4 text-pink-400 flex-shrink-0" />
                <span className="text-sm font-semibold flex-1 text-left truncate"
                  style={{ color: selectedTrack ? 'white' : 'rgba(255,255,255,0.4)' }}>
                  {selectedTrack ? `${selectedTrack.emoji || '🎵'} ${selectedTrack.title}` : 'Replace audio with music'}
                </span>
                {selectedTrack && (
                  <button onClick={e => { e.stopPropagation(); setSelectedTrack(null); }}
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(220,30,30,0.7)' }}>
                    <X className="w-3 h-3 text-white" />
                  </button>
                )}
              </button>
              {selectedTrack && (
                <p className="text-white/35 text-xs px-1">Tip: Also mute original audio above to use music only</p>
              )}
            </div>

            {/* Destination */}
            <div>
              <p className="text-white/50 text-xs font-semibold mb-2 ml-1">Post to</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'global', label: 'Ask after',  emoji: '📍', color: '#ff5500' },
                  { id: 'city',   label: 'City Reels', emoji: '🏙️', color: '#06b6d4' },
                  { id: 'both',   label: 'Both',       emoji: '✨', color: '#8b5cf6' },
                ].map(opt => (
                  <button key={opt.id} onClick={() => setDestination(opt.id)}
                    className="py-2.5 rounded-xl text-xs font-bold flex flex-col items-center gap-0.5 active:scale-95 transition-transform"
                    style={{
                      background: destination === opt.id ? `${opt.color}22` : 'rgba(255,255,255,0.05)',
                      border: `1.5px solid ${destination === opt.id ? opt.color : 'rgba(255,255,255,0.1)'}`,
                      color: destination === opt.id ? opt.color : 'rgba(255,255,255,0.45)',
                    }}>
                    <span>{opt.emoji}</span>
                    <span className="text-[10px]">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Post button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => publishReel.mutate()}
              disabled={publishReel.isPending}
              className="w-full py-4 rounded-2xl text-white font-bold text-base mt-1 disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)', boxShadow: '0 0 24px rgba(255,80,0,0.35)' }}>
              {publishReel.isPending
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Uploading...</>
                : '🚀 Post Reel'}
            </motion.button>
          </div>
        </div>
      </div>

      <MusicPickerSheet
        open={musicOpen}
        onClose={() => setMusicOpen(false)}
        onSelect={track => { setSelectedTrack(track); if (track) setMuteOriginalAudio(true); }}
        selectedTrack={selectedTrack}
      />

      {mapPrompt && (
        <MapSharePrompt
          postId={mapPrompt.postId}
          cityName={mapPrompt.cityName}
          postType="reel"
          hasVideo
          onDone={() => { setMapPrompt(null); navigate('/reels'); }}
        />
      )}
    </motion.div>
  );
}
