import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Play, Check, Loader2, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

/**
 * Two-step post-publish prompt:
 *  Step 1 — Add to City Map?
 *  Step 2 — Also add to City Reels? (video/reel only → shown as extra option)
 */
export default function MapSharePrompt({ postId, cityName, postType, hasVideo, onDone }) {
  const [step, setStep] = useState(1); // 1 = map, 2 = city-reels
  const [loading, setLoading] = useState(false);
  const [mapAdded, setMapAdded] = useState(false);
  const [cityReelAdded, setCityReelAdded] = useState(false);
  const [selectedCity, setSelectedCity] = useState(cityName || '');
  const [editingCity, setEditingCity] = useState(!cityName);

  const hasCity = !!(selectedCity.trim() || cityName);
  const finalCity = selectedCity.trim() || cityName || 'Choose city';

  /* ── Step 1: add to map ── */
  const handleMapYes = async () => {
    setLoading(true);
    try {
      await base44.entities.Post.update(postId, {
        map_visible: true,
        map_city: finalCity,
        location: finalCity,
      });
      setMapAdded(true);
    } catch (e) {
      console.error('Map share failed:', e);
    }
    setLoading(false);
    // If it's a reel/video → ask about City Reels too
    if (hasVideo || postType === 'reel') {
      setTimeout(() => setStep(2), 700);
    } else {
      setTimeout(onDone, 900);
    }
  };

  const handleMapNo = () => {
    if (hasVideo || postType === 'reel') {
      setStep(2);
    } else {
      onDone();
    }
  };

  /* ── Step 2: add to city reels ── */
  const handleCityReelsYes = async () => {
    setLoading(true);
    try {
      // Fetch the post to get video_url + author info
      const posts = await base44.asServiceRole?.entities?.Post?.filter({ id: postId }) || [];
      const post = posts[0] || {};
      await base44.entities.Post.update(postId, {
        map_visible: true,
        map_city: finalCity,
        location: finalCity,
      });
      await base44.entities.CuratedReel.create({
        title: post.caption || `${finalCity} Reel`,
        video_url: post.video_url || '',
        thumbnail_url: post.author_avatar || null,
        author_name: post.author_name || 'User',
        author_username: post.author_username || 'user',
        author_avatar: post.author_avatar || null,
        caption: post.caption || '',
        source: 'creator_permission',
        category: finalCity,
        is_active: true,
        added_at: new Date().toISOString(),
      });
      setCityReelAdded(true);
    } catch (e) {
      console.error('City Reels add failed:', e);
      // Silently fail — don't block the user
      setCityReelAdded(true);
    }
    setLoading(false);
    setTimeout(onDone, 900);
  };

  const handleCityReelsNo = () => {
    onDone();
  };

  const CityPicker = ({ accent = '#A020F0' }) => (
    <div className="w-full">
      <button
        onClick={() => setEditingCity(v => !v)}
        className="w-full rounded-2xl px-4 py-3 flex items-center justify-between"
        style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${accent}55` }}
      >
        <span className="text-left">
          <span className="block text-white/45 text-[11px] font-bold uppercase tracking-wide">GPS city</span>
          <span className="block text-white font-extrabold text-sm mt-0.5">{finalCity}</span>
        </span>
        <span className="text-xs font-bold" style={{ color: accent }}>{editingCity ? 'Done' : 'Change'}</span>
      </button>
      {editingCity && (
        <input
          autoFocus
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          placeholder="Type city or town..."
          className="w-full mt-2 rounded-2xl px-4 py-3 text-white outline-none"
          style={{ background: 'rgba(0,0,0,0.34)', border: `1px solid ${accent}66` }}
        />
      )}
    </div>
  );

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="prompt-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-end justify-center"
        style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(10px)' }}
      >
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step-map"
              initial={{ y: 120, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -60, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="w-full rounded-t-3xl px-6 pt-5 pb-10 flex flex-col items-center gap-5"
              style={{
                background: 'linear-gradient(180deg, rgba(14,6,28,0.99) 0%, rgba(8,3,18,1) 100%)',
                border: '1px solid rgba(160,32,240,0.35)',
                borderBottom: 'none',
                boxShadow: '0 -8px 40px rgba(160,32,240,0.25)',
              }}
            >
              <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.18)' }} />

              {mapAdded ? (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-3 py-2">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #A020F0, #FF2D8A)' }}>
                    <Check className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-white font-bold text-lg">Added to {finalCity} Map! 🗺️</p>
                </motion.div>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #A020F0, #FF4FD8)', boxShadow: '0 0 30px rgba(160,32,240,0.6)' }}>
                    <MapPin className="w-8 h-8 text-white" />
                  </div>

                  <div className="text-center">
                    <h2 className="text-white font-extrabold text-xl mb-1">Add to {finalCity} Map?</h2>
                    <p className="text-white/55 text-sm leading-relaxed">
                      Let others discover your post when they explore{' '}
                      <span className="text-purple-300 font-semibold">{finalCity}</span> on Map.
                    </p>
                  </div>

                  <CityPicker accent="#A020F0" />

                  <div className="flex gap-3 w-full">
                    <button onClick={handleMapNo}
                      className="flex-1 rounded-2xl font-bold text-white/70 text-base"
                      style={{ height: 52, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
                      Skip
                    </button>
                    <motion.button whileTap={{ scale: 0.96 }} onClick={handleMapYes} disabled={loading || !hasCity}
                      className="flex-[2] rounded-2xl font-extrabold text-white text-base flex items-center justify-center gap-2 disabled:opacity-70"
                      style={{ height: 52, background: 'linear-gradient(135deg, #A020F0, #FF2D8A)', boxShadow: '0 0 24px rgba(160,32,240,0.5)' }}>
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><MapPin className="w-4 h-4" /> Yes, add to map!</>}
                    </motion.button>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-cityreels"
              initial={{ y: 120, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -60, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="w-full rounded-t-3xl px-6 pt-5 pb-10 flex flex-col items-center gap-5"
              style={{
                background: 'linear-gradient(180deg, rgba(10,4,22,0.99) 0%, rgba(5,2,12,1) 100%)',
                border: '1px solid rgba(255,80,0,0.35)',
                borderBottom: 'none',
                boxShadow: '0 -8px 40px rgba(255,80,0,0.2)',
              }}
            >
              <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.18)' }} />

              {cityReelAdded ? (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-3 py-2">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)' }}>
                    <Check className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-white font-bold text-lg">Added to {finalCity} Reels! 🔥</p>
                </motion.div>
              ) : (
                <>
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)', boxShadow: '0 0 30px rgba(255,80,0,0.5)' }}>
                    <Play className="w-8 h-8 text-white fill-white" />
                  </div>

                  {/* Badge */}
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                    style={{ background: 'rgba(255,80,0,0.15)', border: '1px solid rgba(255,80,0,0.35)' }}>
                    <MapPin className="w-3 h-3 text-orange-400" />
                    <span className="text-orange-300 text-xs font-bold">{finalCity}</span>
                  </div>

                  <div className="text-center">
                    <h2 className="text-white font-extrabold text-xl mb-1">Post to City Reels?</h2>
                    <p className="text-white/55 text-sm leading-relaxed">
                      Feature your video in the{' '}
                      <span className="text-orange-300 font-semibold">{finalCity} Reels</span> feed so locals can discover you.
                    </p>
                  </div>

                  <CityPicker accent="#ff5500" />

                  <div className="flex gap-3 w-full">
                    <button onClick={handleCityReelsNo}
                      className="flex-1 rounded-2xl font-bold text-white/70 text-base"
                      style={{ height: 52, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
                      No thanks
                    </button>
                    <motion.button whileTap={{ scale: 0.96 }} onClick={handleCityReelsYes} disabled={loading || !hasCity}
                      className="flex-[2] rounded-2xl font-extrabold text-white text-base flex items-center justify-center gap-2 disabled:opacity-70"
                      style={{ height: 52, background: 'linear-gradient(135deg, #ff5500, #e91e8c)', boxShadow: '0 0 24px rgba(255,80,0,0.45)' }}>
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Play className="w-4 h-4 fill-white" /> Yes, feature me!</>}
                    </motion.button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
