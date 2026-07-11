import React, { useState, useEffect } from 'react';
import { X, MapPin, Image as ImageIcon, Loader2, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import CityReelsViewer from './CityReelsViewer';

export default function LocationContentModal({ profile, city, open, onClose }) {
  const [isLight, setIsLight] = useState(false);
  const [locationName, setLocationName] = useState('');
  const [reelsOpen, setReelsOpen] = useState(false);
  const [reelsStartIndex, setReelsStartIndex] = useState(0);

  useEffect(() => {
    const check = () => setIsLight(document.documentElement.classList.contains('light-mode'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  // Extract city from location or use default
  useEffect(() => {
    if (city?.name) {
      setLocationName(city.name);
    } else if (profile?.location) {
      setLocationName(profile.location);
    } else if (profile?.latitude && profile?.longitude) {
      // Simple reverse geocoding approximation - major cities
      const lat = profile.latitude;
      const lng = profile.longitude;
      if (lat > 40.5 && lat < 40.9 && lng > -74.1 && lng < -73.9) setLocationName('New York City');
      else if (lat > 33.9 && lat < 34.3 && lng > -118.7 && lng < -118.1) setLocationName('Los Angeles');
      else if (lat > 51.4 && lat < 51.6 && lng > -0.2 && lng < 0.1) setLocationName('London');
      else if (lat > 48.8 && lat < 48.9 && lng > 2.2 && lng < 2.4) setLocationName('Paris');
      else setLocationName('Local Area');
    } else {
      setLocationName('Nearby');
    }
  }, [profile, city]);

  const { data: content, isLoading } = useQuery({
    queryKey: ['location-content', locationName, open],
    queryFn: async () => {
      if (!locationName) return { posts: [], reels: [] };
      try {
        const res = await base44.functions.invoke('getPostsByLocation', {
          location_name: locationName,
          latitude: city?.lat || profile?.latitude,
          longitude: city?.lng || profile?.longitude,
          radius_km: 50
        });
        const data = res.data || { posts: [], reels: [] };
        if ((data.posts?.length || data.reels?.length) || !city?.previewItems?.length) return data;
      } catch {}
      return { posts: [], reels: city?.previewItems || [] };
    },
    enabled: !!locationName && open,
    staleTime: 0,
  });

  const posts = content?.posts || [];
  const reels = content?.reels || [];
  const allContent = [...posts, ...reels];

  // Flat list of all items for the reels viewer (posts first, then reels interleaved)
  const reelItems = [...posts, ...reels];

  const openReels = (index) => {
    setReelsStartIndex(index);
    setReelsOpen(true);
  };

  const bg = isLight ? '#ffffff' : 'rgba(14,7,24,0.98)';
  const border = isLight ? '1px solid rgba(160,80,220,0.15)' : '1px solid rgba(255,255,255,0.08)';
  const textMain = isLight ? '#1a0a2e' : 'white';
  const textSub = isLight ? 'rgba(80,40,120,0.45)' : 'rgba(255,255,255,0.4)';

  // Get the best thumbnail for any item (post or curated reel)
  const getThumb = (item) => {
    if (item.image_url && item.image_url !== 'null') return { type: 'image', src: item.image_url };
    if (item.youtube_video_id) return { type: 'image', src: `https://img.youtube.com/vi/${item.youtube_video_id}/hqdefault.jpg` };
    if (item.youtube_thumbnail) return { type: 'image', src: item.youtube_thumbnail };
    if (item.thumbnail_url) return { type: 'image', src: item.thumbnail_url };
    if (item.video_url) return { type: 'video', src: item.video_url };
    // Fallback: use author avatar as placeholder
    if (item.author_avatar) return { type: 'image', src: item.author_avatar };
    return null;
  };

  if (!open || (!profile && !city)) return null;

  return (
    <>
      <AnimatePresence>
        {reelsOpen && reelItems.length > 0 && (
          <CityReelsViewer
            items={reelItems}
            startIndex={reelsStartIndex}
            locationName={locationName}
            onClose={() => setReelsOpen(false)}
          />
        )}
      </AnimatePresence>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0"
        style={{ zIndex: 10000, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="fixed left-0 right-0 rounded-t-3xl flex flex-col"
        style={{
          zIndex: 10001,
          bottom: 0,
          maxHeight: '85dvh',
          height: '75dvh',
          background: bg,
          border,
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ background: isLight ? 'rgba(120,80,180,0.2)' : 'rgba(255,255,255,0.2)' }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 flex-shrink-0"
          style={{ borderBottom: isLight ? '1px solid rgba(160,80,220,0.1)' : '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #A020F0, #d946ef)', boxShadow: '0 0 12px rgba(160,32,240,0.4)' }}>
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base" style={{ color: textMain }}>
                {locationName}
              </h3>
              <p className="text-xs" style={{ color: textSub }}>
                {isLoading ? 'Loading...' : `${allContent.length} ${allContent.length === 1 ? 'post' : 'posts'}`}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: isLight ? 'rgba(160,80,220,0.1)' : 'rgba(255,255,255,0.08)' }}>
            <X className="w-4 h-4" style={{ color: textSub }} />
          </button>
        </div>

        {/* Content Grid */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 text-[#A020F0] animate-spin" />
            </div>
          ) : allContent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #A020F0, #d946ef)' }}>
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <p className="font-bold text-base" style={{ color: textMain }}>No posts yet</p>
              <p className="text-xs text-center px-8" style={{ color: textSub }}>
                Be the first to post from {locationName}!
              </p>
            </div>
          ) : (
            <>
              {/* Reels row if any */}
              {reels.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-bold mb-2" style={{ color: 'rgba(160,32,240,0.8)' }}>🎬 Reels</p>
                  <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                    {reels.map((item, idx) => {
                      const thumb = getThumb(item);
                      const reelIndex = posts.length + idx;
                      return (
                        <div key={item.id || idx}
                          onClick={() => openReels(reelIndex)}
                          className="flex-shrink-0 rounded-xl overflow-hidden relative"
                          style={{ width: 100, height: 160, background: 'rgba(160,32,240,0.15)', cursor: 'pointer' }}>
                          {thumb?.type === 'image' ? (
                            <img src={thumb.src} alt="" className="w-full h-full object-cover" />
                          ) : thumb?.type === 'video' ? (
                            <video src={thumb.src} className="w-full h-full object-cover" muted loop playsInline />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"
                              style={{ background: 'linear-gradient(135deg, #A020F0, #d946ef)' }}>
                              <ImageIcon className="w-6 h-6 text-white/50" />
                            </div>
                          )}
                          {/* Play icon overlay */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center"
                              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
                              <svg width="12" height="14" viewBox="0 0 12 14" fill="white"><path d="M1 1l10 6-10 6V1z"/></svg>
                            </div>
                          </div>
                          {item.author_name && (
                            <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/70 to-transparent">
                              <p className="text-white text-[9px] font-semibold truncate">{item.author_name}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Posts grid */}
              {posts.length > 0 && (
                <div>
                  {reels.length > 0 && <p className="text-xs font-bold mb-2" style={{ color: 'rgba(160,32,240,0.8)' }}>📸 Posts</p>}
                  <div className="grid grid-cols-3 gap-2">
                    {posts.map((item, idx) => {
                      const thumb = getThumb(item);
                      return (
                        <div key={item.id || idx}
                          onClick={() => openReels(idx)}
                          className="aspect-square rounded-xl overflow-hidden relative"
                          style={{ background: isLight ? 'rgba(200,170,240,0.1)' : 'rgba(255,255,255,0.05)', cursor: 'pointer' }}>
                          {thumb?.type === 'image' ? (
                            <img src={thumb.src} alt="" className="w-full h-full object-cover" />
                          ) : thumb?.type === 'video' ? (
                            <video src={thumb.src} className="w-full h-full object-cover" muted loop playsInline />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"
                              style={{ background: 'linear-gradient(135deg, #A020F0, #d946ef)' }}>
                              <ImageIcon className="w-6 h-6 text-white/50" />
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/60 to-transparent">
                            <div className="flex items-center gap-1.5 text-white text-[10px]">
                              <Heart className="w-2.5 h-2.5" fill="white" />
                              {item.likes_count || 0}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </>
  );
}
