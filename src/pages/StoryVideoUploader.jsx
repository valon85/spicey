import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { X, ChevronLeft, Music2, MapPin, Check, Loader2, Video } from 'lucide-react';
import MusicPickerSheet from '@/components/create/MusicPickerSheet';
import CityReelsPrompt from '@/components/create/CityReelsPrompt';
import { toast } from 'sonner';

export default function StoryVideoUploader() {
  const navigate = useNavigate();

  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [track, setTrack] = useState(null);
  const [location, setLocation] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [musicOpen, setMusicOpen] = useState(false);
  const [posting, setPosting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [cityPrompt, setCityPrompt] = useState(null); // { postId, cityName }
  const [detectedCity, setDetectedCity] = useState('');

  // Pick up file set by StoryCreator
  useEffect(() => {
    if (window._storyVideoFile) {
      const file = window._storyVideoFile;
      window._storyVideoFile = null;
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
    } else {
      // No file — go back
      navigate(-1);
    }
  }, []);

  // Auto-detect location
  useEffect(() => {
    if (navigator.geolocation) {
      setLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude, longitude } = pos.coords;
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
              { headers: { 'Accept-Language': 'en', 'User-Agent': 'SpiceyApp/1.0' } }
            );
            const data = await res.json();
            const city = data.address?.city || data.address?.town || data.address?.suburb || data.address?.village || '';
            const state = data.address?.state || '';
            const cityState = `${city}${state ? ', ' + state : ''}`;
            if (city) {
              setLocation(`${cityState} · Spicey`);
              setDetectedCity(city);
            }
          } catch (e) {}
          setLoadingLocation(false);
        },
        () => setLoadingLocation(false),
        { timeout: 8000, enableHighAccuracy: false }
      );
    }
  }, []);

  const publish = async () => {
    if (!videoFile || posting) return;
    setPosting(true);
    setError('');
    try {
      const user = await base44.auth.me();
      if (!user?.id) throw new Error('Not logged in');

      const { file_url } = await base44.integrations.Core.UploadFile({ file: videoFile });

      const profiles = await base44.entities.UserProfile.filter({ user_id: user.id }, '-created_date', 1);
      const profile = profiles[0] || {};
      const name = profile.full_name || user.full_name || 'User';
      const username = profile.username || user.email?.split('@')[0] || 'user';
      const avatar = profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const storyResult = await base44.entities.Story.create({
        user_id: user.id,
        username,
        user_avatar: avatar,
        video_url: file_url,
        image_url: '', // no image for video story
        caption: '',
        location: location || '',
        music_title: track?.title || '',
        music_artist: track?.artist || '',
        music_preview_url: track?.preview_url || '',
        expires_at: expiresAt.toISOString(),
        views: [],
      });

      setDone(true);
      
      // Show city reels prompt if city detected
      if (detectedCity && storyResult?.id) {
        setCityPrompt({ postId: storyResult.id, cityName: detectedCity });
      } else {
        setTimeout(() => navigate('/'), 1200);
      }
    } catch (err) {
      setError(err?.message || 'Failed to post story.');
      setPosting(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {done && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.85)' }}>
            <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#ff5500,#e91e8c)' }}>
                <Check className="w-10 h-10 text-white" />
              </div>
              <p className="text-white text-xl font-bold">Story Posted!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#000' }}>

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 pt-12 pb-3"
          style={{ background: 'linear-gradient(to bottom,rgba(0,0,0,0.8),transparent)' }}>
          <button onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full"
            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <span className="text-white font-bold text-base tracking-wide">Video Story</span>
          <motion.button whileTap={{ scale: 0.93 }} onClick={publish} disabled={posting}
            className="px-5 py-2.5 rounded-full text-white font-bold text-sm disabled:opacity-50 flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg,#ff5500,#e91e8c)', boxShadow: '0 0 18px rgba(255,85,0,0.5)' }}>
            {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post Story'}
          </motion.button>
        </div>

        {/* Video preview */}
        <div className="flex-1 relative overflow-hidden">
          {videoUrl && (
            <video src={videoUrl} className="absolute inset-0 w-full h-full object-cover"
              autoPlay loop muted playsInline />
          )}

          {/* Location badge */}
          {location.trim() && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full z-10"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <MapPin className="w-3 h-3 text-white/70" />
              <span className="text-white text-xs font-semibold">{location}</span>
            </div>
          )}

          {/* Music badge */}
          {track && (
            <div className="absolute top-24 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 rounded-full z-10"
              style={{ background: 'rgba(233,30,140,0.35)', border: '1px solid rgba(233,30,140,0.5)', backdropFilter: 'blur(12px)' }}>
              <Music2 className="w-3 h-3 text-pink-300" />
              <span className="text-white text-xs font-bold">{track.title}</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="absolute top-24 left-4 right-4 px-4 py-3 rounded-2xl text-sm text-red-200 font-semibold text-center z-30"
              style={{ background: 'rgba(200,20,20,0.85)' }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Bottom controls */}
        <div className="flex-shrink-0 z-20 px-5 py-4"
          style={{ background: 'rgba(8,4,14,0.97)', borderTop: '1px solid rgba(255,255,255,0.07)', paddingBottom: 'max(24px, env(safe-area-inset-bottom,16px))' }}>

          {/* Music */}
          <div className="mb-3">
            {track ? (
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{ background: 'rgba(233,30,140,0.1)', border: '1px solid rgba(233,30,140,0.25)' }}>
                <Music2 className="w-5 h-5 text-pink-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-bold truncate">{track.title}</p>
                  <p className="text-white/40 text-xs">{track.artist}</p>
                </div>
                <button onClick={() => setTrack(null)}
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,30,30,0.6)' }}>
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            ) : (
              <button onClick={() => setMusicOpen(true)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Music2 className="w-5 h-5 text-white/40" />
                <span className="text-white/40 text-sm font-semibold">Add music…</span>
              </button>
            )}
          </div>

          {/* Location */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input type="text" value={location} onChange={e => setLocation(e.target.value)}
              placeholder={loadingLocation ? 'Detecting location…' : 'Add a location…'}
              className="w-full pl-9 pr-4 py-3 rounded-2xl text-white text-sm placeholder:text-white/25 outline-none"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }} />
            {loadingLocation && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 animate-spin" />}
          </div>
        </div>
      </div>

      <MusicPickerSheet
        open={musicOpen}
        onClose={() => setMusicOpen(false)}
        onSelect={(t) => { setTrack(t); setMusicOpen(false); }}
        selectedTrack={track}
      />

      <CityReelsPrompt
        open={!!cityPrompt}
        postId={cityPrompt?.postId}
        cityName={cityPrompt?.cityName}
        postType="story"
        hasVideo={true}
        onClose={(posted) => {
          setCityPrompt(null);
          if (posted) {
            toast.success('Posted to City Reels!');
          }
          setTimeout(() => navigate('/'), 500);
        }}
      />
    </>
  );
}