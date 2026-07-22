import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Check, ImagePlus, Sparkles, Smile, Eye, Glasses, Shirt, Gem, Wand2, Play } from 'lucide-react';

const isCapacitor = typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.();

async function getCapCamera() {
  try {
    const mod = await import('@capacitor/camera');
    return { Camera: mod.Camera, CameraSource: mod.CameraSource, CameraResultType: mod.CameraResultType };
  } catch (e) {
    return null;
  }
}

async function dataURLtoFile(dataUrl, filename) {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type });
}

// All video avatars
const VIDEO_AVATARS = [
  { id: 'v1', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/b1cce0bbf_3D_avatar_smiling_and_waving_202607011948.mp4', label: '3D Avatar', gender: 'unisex' },
  { id: 'v2', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/76f876a32_3D_avatar_waving_hi_1080p_202607011950.mp4', label: '3D Waving', gender: 'unisex' },
  { id: 'v3', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/3b81dabde_Animated_man_waving_hi_1080p_202607011926-2.mp4', label: 'Animated Guy', gender: 'male' },
  { id: 'v4', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/becf7ca3d_Animated_man_waving_hi_1080p_202607011926-3.mp4', label: 'Animated Guy 2', gender: 'male' },
  { id: 'v5', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/bc8ab105b_Animated_man_waving_hi_1080p_202607011926.mp4', label: 'Animated Guy 3', gender: 'male' },
  { id: 'v6', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/15d76e3a7_Animated_man_waving_hi_1080p_202607011948-2.mp4', label: 'Animated Guy 4', gender: 'male' },
  { id: 'v7', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/bd6da240e_Animated_man_waving_hi_1080p_202607011948-3.mp4', label: 'Animated Guy 5', gender: 'male' },
  { id: 'v8', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/c125f242b_Animated_man_waving_hi_1080p_202607011948-4.mp4', label: 'Animated Guy 6', gender: 'male' },
  { id: 'v9', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/a37014538_Animated_man_waving_hi_1080p_202607011948.mp4', label: 'Animated Guy 7', gender: 'male' },
  { id: 'v10', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/89b269df2_Animated_man_waving_hi_1080p_202607011949.mp4', label: 'Animated Guy 8', gender: 'male' },
  { id: 'v11', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/06bcc276d_Animated_man_waving_hi_1080p_202607011950-2.mp4', label: 'Animated Guy 9', gender: 'male' },
  { id: 'v12', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/beabcf401_Animated_man_waving_hi_1080p_202607011950.mp4', label: 'Animated Guy 10', gender: 'male' },
  { id: 'v13', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/3a18dd16a_Animated_man_waving_hi_1080p_202607011951-2.mp4', label: 'Animated Guy 11', gender: 'male' },
  { id: 'v14', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/aef538bdd_Animated_man_waving_hi_1080p_202607011951.mp4', label: 'Animated Guy 12', gender: 'male' },
  { id: 'v15', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/96b68dd51_Animated_woman_waving_hi_1080p_202607011952.mp4', label: 'Animated Girl', gender: 'female' },
  { id: 'v16', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/1dc8e120c_Avatar_waving_hi_cherry_blossoms_202607011926.mp4', label: 'Cherry Blossom', gender: 'unisex' },
  { id: 'v17', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/41c5ed92f_Avatar_waving_hi_cherry_blossoms_202607011949.mp4', label: 'Cherry Blossom 2', gender: 'unisex' },
  { id: 'v18', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/2608d2a25_Avatar_waving_hi_peaceful_lake_202607011927.mp4', label: 'Lake Avatar', gender: 'unisex' },
  { id: 'v19', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/3b932d20f_Avatar_waving_hi_peaceful_lake_202607011948.mp4', label: 'Lake Avatar 2', gender: 'unisex' },
  { id: 'v20', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/a5d01f88d_Avatar_waving_hi_zen_garden_202607011953.mp4', label: 'Zen Garden', gender: 'unisex' },
  { id: 'v21', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/ed0915f29_Black_woman_waving_hi_1080p_202607011951-2.mp4', label: 'Black Woman 2', gender: 'female' },
  { id: 'v22', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/14d912a09_Black_woman_waving_hi_1080p_202607011951.mp4', label: 'Black Woman', gender: 'female' },
  { id: 'v23', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/394a08783_Man_waving_hi_highlights_1080p_202607011948.mp4', label: 'Highlights Guy', gender: 'male' },
  { id: 'v24', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/6e6b8688f_Woman_waving_hi_animated_avatar_202607011947.mp4', label: 'Animated Woman', gender: 'female' },
  { id: 'v25', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/ea42d545d_Animated_man_waving_hi_1080p_202607011927.mp4', label: 'Animated Man', gender: 'male' },
  { id: 'v26', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/1c6f2ff71_Animated_man_waving_hi_1080p_202607011947.mp4', label: 'Animated Man 2', gender: 'male' },
  { id: 'v27', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/0d3173ba4_Animated_man_waving_hi_202607011925.mp4', label: 'Animated Man 3', gender: 'male' },
  { id: 'v28', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/c1c8f4b45_Animated_man_waving_hi_202607011944.mp4', label: 'Animated Man 4', gender: 'male' },
  { id: 'v29', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/a8232e076_Animated_man_waving_hi_202607011945.mp4', label: 'Animated Man 5', gender: 'male' },
  { id: 'v30', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/4e8d8b4e1_Animated_woman_waving_hi_1080p_202607011926.mp4', label: 'Animated Woman 2', gender: 'female' },
  { id: 'v31', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/3336a941c_Animated_woman_waving_hi_1080p_202607011948.mp4', label: 'Animated Woman 3', gender: 'female' },
  { id: 'v32', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/256bb85f9_Animated_woman_waving_hi_1080p_202607011949.mp4', label: 'Animated Woman 4', gender: 'female' },
  { id: 'v33', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/8e631ae8b_Avatar_waving_hi_1080p_202607011951.mp4', label: 'Avatar Hi', gender: 'unisex' },
  { id: 'v34', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/9e045ae0e_gemini_generated_video_E04374BF.MP4', label: 'Gemini Avatar', gender: 'unisex' },
  { id: 'v35', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/25162523e_Hispanic_woman_waving_hi_202607011943.mp4', label: 'Hispanic Woman', gender: 'female' },
  { id: 'v36', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/93217f0d7_Man_smiling_and_waving_1080p_202607011817.mp4', label: 'Smiling Man', gender: 'male' },
  { id: 'v37', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/2d857dd81_Man_smiling_and_waving_hi_202607011942-2.mp4', label: 'Smiling Man 2', gender: 'male' },
  { id: 'v38', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/470bbdf05_Man_smiling_and_waving_hi_202607011942.mp4', label: 'Smiling Man 3', gender: 'male' },
  { id: 'v39', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/977ab9700_Man_smiling_and_waving_hi_202607011944.mp4', label: 'Smiling Man 4', gender: 'male' },
  { id: 'v40', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/dc3fd4948_Man_waving_hi_animated_202607011941.mp4', label: 'Animated Wave', gender: 'male' },
  { id: 'v41', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/a648af776_Man_waving_hi_dark_background_202607011944.mp4', label: 'Dark BG Man', gender: 'male' },
  { id: 'v42', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/93cd7c738_Smiling_girl_waving_hi_1080p_202607011808.mp4', label: 'Smiling Girl', gender: 'female' },
  { id: 'v43', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/a1f042411_South_Asian_man_waving_hi_202607011943.mp4', label: 'South Asian Man', gender: 'male' },
  { id: 'v44', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/8106d18d4_South_Asian_woman_waving_hi_202607011942.mp4', label: 'South Asian Woman', gender: 'female' },
  { id: 'v45', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/c23449dc4_Woman_waving_hi_vibrant_dress_202607011942.mp4', label: 'Vibrant Dress', gender: 'female' },
  { id: 'v46', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/c06556eee_Woman_waving_hi_animated_202607011944.mp4', label: 'Animated Woman 5', gender: 'female' },
  { id: 'v47', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/91a0aa678_Woman_waving_hi_animated_202607011945.mp4', label: 'Animated Woman 6', gender: 'female' },
  { id: 'v48', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/5801dc3fe_Woman_waving_hi_highlights_202607011943.mp4', label: 'Highlights Woman', gender: 'female' },
  { id: 'v49', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/b607652a1_Woman_waving_hi_stylized_202607011941.mp4', label: 'Stylized Woman', gender: 'female' },
  { id: 'v50', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/406dd5ef1_Woman_waving_hi_stylized_202607011942.mp4', label: 'Stylized Woman 2', gender: 'female' },
  { id: 'v51', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/9d524c425_Woman_waving_hi_stylized_202607011946.mp4', label: 'Stylized Woman 3', gender: 'female' },
  { id: 'v52', url: 'https://media.base44.com/videos/public/69fe90d3bbe7ad47925e4a0a/573acd333_Young_man_waving_hi_202607011945.mp4', label: 'Young Man', gender: 'male' },
];

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'female', label: 'Girls 👩' },
  { key: 'male', label: 'Guys 👨' },
  { key: 'unisex', label: 'Unisex ✨' },
];

const CUSTOMIZE_ROWS = [
  { key: 'hair', label: 'Hair', icon: Smile, offset: 0 },
  { key: 'beard', label: 'Beard', icon: Smile, offset: 3 },
  { key: 'eyes', label: 'Eyes', icon: Eye, offset: 6 },
  { key: 'glasses', label: 'Glasses', icon: Glasses, offset: 9 },
  { key: 'outfit', label: 'Outfit', icon: Shirt, offset: 12 },
  { key: 'accessories', label: 'Accessories', icon: Gem, offset: 15 },
];

function VideoCard({ video, isSelected, onSelect, priority = false, compact = false }) {
  const cardRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(priority);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (priority || shouldLoad) return;
    const node = cardRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setShouldLoad(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '260px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [priority, shouldLoad]);

  const handleClick = () => {
    onSelect(video);
  };

  return (
    <motion.button
      ref={cardRef}
      whileTap={{ scale: 0.93 }}
      onClick={handleClick}
      style={{
        position: 'relative', aspectRatio: '1/1', borderRadius: 12, overflow: 'hidden',
        border: isSelected ? '2.5px solid #FF6A00' : '1.5px solid rgba(255,255,255,0.08)',
        background: 'linear-gradient(135deg, rgba(255,106,0,0.24), rgba(193,0,255,0.18), rgba(10,0,8,0.95))',
        padding: 0, cursor: 'pointer',
        boxShadow: isSelected ? '0 0 0 2px rgba(255,45,143,0.45), 0 0 18px rgba(255,106,0,0.35)' : 'none',
        minHeight: compact ? 54 : undefined,
      }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        display: loaded ? 'none' : 'block',
        background: 'linear-gradient(135deg, rgba(255,106,0,0.38), rgba(193,0,255,0.28) 45%, rgba(10,0,8,0.92))',
      }} />
      {shouldLoad && (
        <video
          src={`${video.url}#t=0.1`}
          preload="auto"
          muted
          playsInline
          className="spicey-video-avatar-crop"
          onLoadedData={() => setLoaded(true)}
          onCanPlay={() => setLoaded(true)}
          style={{
            opacity: 1,
            transition: 'opacity 0.18s ease',
          }}
        />
      )}
      {isSelected && (
        <div style={{ position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: '50%', background: 'linear-gradient(135deg, #FF6A00, #FF2D55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}>
          <Check style={{ width: 10, height: 10, color: '#fff' }} />
        </div>
      )}
      {!compact && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 4px 3px', background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)' }}>
          <div style={{ color: '#fff', fontSize: 8, fontWeight: 700, textAlign: 'center', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{video.label}</div>
        </div>
      )}
    </motion.button>
  );
}

function AvatarMedia({ src, label, large = false }) {
  if (!src) return null;
  const isVideo = /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(String(src));
  const style = large
    ? { width: '100%', height: '100%', objectFit: 'cover', display: 'block' }
    : { width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: 14 };
  return isVideo ? (
    <video src={`${src}#t=0.1`} muted playsInline loop autoPlay preload="auto" aria-label={label} style={style} />
  ) : (
    <img src={src} alt={label || 'avatar'} style={style} />
  );
}

export default function AvatarPickerSheet({ open, onClose, onFileSelect, hasAvatar, currentAvatar, onRemove }) {
  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    VIDEO_AVATARS.slice(0, 24).forEach((avatar) => {
      const video = document.createElement('video');
      video.preload = 'auto';
      video.muted = true;
      video.playsInline = true;
      video.src = `${avatar.url}#t=0.1`;
      video.load();
    });
  }, []);

  const handleClose = () => {
    setSelectedVideo(null);
    onClose();
  };

  const openNativeCamera = async () => {
    try {
      setLoading(true);
      const cap = await getCapCamera();
      if (!cap) { cameraInputRef.current?.click(); return; }
      const photo = await cap.Camera.getPhoto({
        quality: 90, allowEditing: false,
        resultType: cap.CameraResultType.DataUrl,
        source: cap.CameraSource.Camera,
      });
      const file = await dataURLtoFile(photo.dataUrl, `avatar.${photo.format}`);
      onFileSelect(file);
      handleClose();
    } catch (e) {
    } finally { setLoading(false); }
  };

  const openNativeGallery = async () => {
    try {
      setLoading(true);
      const cap = await getCapCamera();
      if (!cap) { galleryInputRef.current?.click(); return; }
      const photo = await cap.Camera.getPhoto({
        quality: 90, allowEditing: false,
        resultType: cap.CameraResultType.DataUrl,
        source: cap.CameraSource.Photos,
      });
      const file = await dataURLtoFile(photo.dataUrl, `avatar.${photo.format}`);
      onFileSelect(file);
      handleClose();
    } catch (e) {
    } finally { setLoading(false); }
  };

  const handleWebGallery = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onFileSelect(file);
    handleClose();
    e.target.value = '';
  };

  const handleWebCamera = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onFileSelect(file);
    handleClose();
    e.target.value = '';
  };

  const handleConfirmVideo = () => {
    if (!selectedVideo) return;
    onFileSelect(selectedVideo.url);
    handleClose();
  };

  const handleVideoSelect = (video) => {
    setSelectedVideo(video);
  };

  const filteredVideos = filter === 'all' ? VIDEO_AVATARS : VIDEO_AVATARS.filter(v => v.gender === filter);
  const heroVideo = selectedVideo || filteredVideos[0] || VIDEO_AVATARS[0];
  const heroUrl = selectedVideo?.url || currentAvatar || heroVideo?.url;
  const vibeVideos = filteredVideos.slice(0, 6);
  const liveAnimations = [heroVideo, ...filteredVideos.filter((v) => v.id !== heroVideo?.id)].slice(0, 6);

  useEffect(() => {
    if (!open) return;
    setSelectedVideo(filteredVideos[0] || VIDEO_AVATARS[0] || null);
  }, [open, filter]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
            style={{ position: 'fixed', inset: 0, zIndex: 299, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)' }}
          />

          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 300,
              background: 'radial-gradient(circle at 50% 20%, rgba(160,26,255,0.22), transparent 32%), radial-gradient(circle at 72% 28%, rgba(255,87,34,0.18), transparent 28%), #050208',
              borderTopLeftRadius: 18, borderTopRightRadius: 18,
              height: '96dvh',
              maxHeight: '96dvh',
              display: 'flex', flexDirection: 'column',
              paddingBottom: 0,
              border: '1px solid rgba(255,45,143,0.20)',
              boxShadow: '0 -20px 70px rgba(193,0,255,0.28)',
              overflow: 'hidden',
            }}>

            {/* Handle */}
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10 }}>
              <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)' }} />
            </div>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px 4px', flexShrink: 0 }}>
              <div>
                <div style={{
                  fontFamily: '"Brush Script MT", "Snell Roundhand", cursive',
                  fontSize: 29,
                  lineHeight: 0.9,
                  background: 'linear-gradient(110deg, #ff2bd6, #ff6a00 72%)',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  filter: 'drop-shadow(0 0 10px rgba(255,45,180,0.72))',
                }}>Spicey</div>
                <div style={{ color: 'rgba(255,255,255,0.62)', fontSize: 10, marginTop: 7, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                  Be you. Be <span style={{ color: '#ff6335', fontWeight: 900 }}>Spicey.</span>
                </div>
              </div>
              <motion.button whileTap={{ scale: 0.88 }} onClick={handleClose}
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.7)' }} />
              </motion.button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 178px', WebkitOverflowScrolling: 'touch' }}>
              {/* Hero preview */}
              <div style={{ position: 'relative', minHeight: 178, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                <div style={{
                  position: 'absolute',
                  width: 160,
                  height: 160,
                  borderRadius: '50%',
                  border: '3px solid rgba(255,45,143,0.55)',
                  boxShadow: '0 0 34px rgba(255,45,143,0.55), inset 0 0 26px rgba(168,85,247,0.38)',
                  background: 'conic-gradient(from 190deg, rgba(168,85,247,0.15), rgba(255,106,0,0.24), rgba(255,45,143,0.28), rgba(168,85,247,0.15))',
                }} />
                <div style={{
                  position: 'relative',
                  width: 136,
                  height: 168,
                  borderRadius: 22,
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.10)',
                  boxShadow: '0 20px 56px rgba(0,0,0,0.55)',
                  background: 'linear-gradient(160deg, rgba(255,45,143,0.20), rgba(0,0,0,0.8))',
                }}>
                  <AvatarMedia src={heroUrl} label={heroVideo?.label} large />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(4,1,8,0.72), transparent 48%)' }} />
                  <div style={{ position: 'absolute', left: 8, right: 8, bottom: 8, textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999, background: 'rgba(0,0,0,0.44)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 11, fontWeight: 800 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 99, background: '#72e06a', boxShadow: '0 0 10px #72e06a' }} />
                      Live Avatar
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.76)', fontSize: 10, marginTop: 5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {heroVideo?.label || 'Realistic. Unique. Animated.'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload from gallery + Camera buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: hasAvatar && onRemove ? '1fr 1fr 0.8fr' : '1fr 1fr', gap: 8, marginBottom: 12 }}>
                <motion.button whileTap={{ scale: 0.96 }} onClick={() => isCapacitor ? openNativeCamera() : cameraInputRef.current?.click()}
                  style={{ padding: '10px 8px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.055)', color: '#fff', fontWeight: 800, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Camera style={{ width: 15, height: 15 }} /> Camera
                </motion.button>
                <motion.button whileTap={{ scale: 0.96 }} onClick={() => isCapacitor ? openNativeGallery() : galleryInputRef.current?.click()}
                  style={{ padding: '10px 8px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.055)', color: '#fff', fontWeight: 800, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <ImagePlus style={{ width: 15, height: 15 }} /> Upload
                </motion.button>
                {hasAvatar && onRemove && (
                  <motion.button whileTap={{ scale: 0.96 }} onClick={() => { onRemove(); handleClose(); }}
                    style={{ padding: '10px 8px', borderRadius: 14, border: '1px solid rgba(255,60,80,0.32)', background: 'rgba(255,60,80,0.10)', color: '#ff6b7a', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>
                    Remove
                  </motion.button>
                )}
              </div>

              <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 8, marginBottom: 8 }}>
                {TABS.map(t => (
                  <button key={t.key} onClick={() => { setFilter(t.key); setSelectedVideo(null); }}
                    style={{
                      flex: '0 0 auto',
                      padding: '8px 12px',
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 900,
                      cursor: 'pointer',
                      border: filter === t.key ? '1px solid rgba(255,106,0,0.72)' : '1px solid rgba(255,255,255,0.10)',
                      background: filter === t.key ? 'linear-gradient(135deg, rgba(255,106,0,0.32), rgba(255,45,143,0.26))' : 'rgba(255,255,255,0.055)',
                      color: filter === t.key ? '#fff' : 'rgba(255,255,255,0.52)',
                    }}>
                    {t.label}
                  </button>
                ))}
              </div>

              <div style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(12,5,20,0.62)', borderRadius: 22, padding: 12, marginBottom: 12 }}>
                <div style={{ color: '#fff', fontWeight: 900, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Choose your vibe</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {vibeVideos.map((video) => (
                    <VideoCard key={video.id} video={video} isSelected={selectedVideo?.id === video.id} onSelect={handleVideoSelect} priority compact />
                  ))}
                </div>
              </div>

              <div style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(12,5,20,0.62)', borderRadius: 22, padding: '10px 12px', marginBottom: 12 }}>
                <div style={{ color: '#fff', fontWeight: 900, fontSize: 13, letterSpacing: '0.11em', textTransform: 'uppercase', textAlign: 'center', margin: '3px 0 8px' }}>Customize</div>
                {CUSTOMIZE_ROWS.map(({ key, label, icon: Icon, offset }) => {
                  const options = filteredVideos.slice(offset, offset + 3);
                  return (
                    <div key={key} style={{ display: 'grid', gridTemplateColumns: '86px 1fr', alignItems: 'center', gap: 8, padding: '9px 0', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9, color: 'rgba(255,255,255,0.84)', fontSize: 11, fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        <Icon style={{ width: 17, height: 17, color: 'rgba(255,255,255,0.78)' }} />
                        {label}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(42px, 1fr))', gap: 7 }}>
                        {(options.length ? options : VIDEO_AVATARS.slice(0, 3)).map((video) => (
                          <button key={`${key}-${video.id}`} type="button" onClick={() => handleVideoSelect(video)}
                            style={{ height: 44, borderRadius: 12, overflow: 'hidden', padding: 0, border: selectedVideo?.id === video.id ? '1.5px solid #ff4bb8' : '1px solid rgba(255,255,255,0.10)', background: 'rgba(255,255,255,0.04)' }}>
                            <AvatarMedia src={video.url} label={video.label} />
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(12,5,20,0.62)', borderRadius: 22, padding: 12, marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontWeight: 900, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
                  <Sparkles style={{ width: 15, height: 15, color: '#ff4bb8' }} /> Live animations
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {liveAnimations.map((video, index) => (
                    <button key={`anim-${video.id}-${index}`} type="button" onClick={() => handleVideoSelect(video)}
                      style={{ position: 'relative', height: 74, borderRadius: 16, overflow: 'hidden', padding: 0, border: selectedVideo?.id === video.id ? '1.5px solid #ff6a00' : '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}>
                      <AvatarMedia src={video.url} label={video.label} />
                      <span style={{ position: 'absolute', left: 6, bottom: 5, display: 'inline-flex', alignItems: 'center', gap: 4, color: '#fff', fontSize: 8, fontWeight: 900, textTransform: 'uppercase', textShadow: '0 2px 8px #000' }}>
                        <Play style={{ width: 9, height: 9 }} />
                        {['Idle', 'Look Left', 'Look Right', 'Smile', 'Blink', 'Tilt'][index] || 'Move'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Confirm button */}
            <div style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 'max(76px, calc(env(safe-area-inset-bottom, 0px) + 64px))',
              padding: '10px 14px 12px',
              display: 'flex',
              gap: 9,
              background: 'linear-gradient(to top, rgba(5,2,8,0.98) 0%, rgba(5,2,8,0.92) 72%, transparent 100%)',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              zIndex: 4,
            }}>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleConfirmVideo}
                disabled={!selectedVideo}
                style={{
                  flex: 1, padding: '13px', borderRadius: 16, border: 'none',
                  cursor: selectedVideo ? 'pointer' : 'not-allowed',
                  background: selectedVideo ? 'linear-gradient(135deg, #b721ff, #ff2d8f 48%, #ff6a00)' : 'rgba(255,255,255,0.08)',
                  color: '#fff', fontWeight: 800, fontSize: 15,
                  boxShadow: selectedVideo ? '0 6px 24px rgba(193,0,255,0.5)' : 'none',
                  opacity: selectedVideo ? 1 : 0.4,
                  transition: 'all 0.2s',
                }}>
                Save Avatar
              </motion.button>
              <motion.button whileTap={{ scale: 0.96 }} onClick={() => setSelectedVideo(heroVideo)}
                style={{ width: 48, borderRadius: 16, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.07)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wand2 style={{ width: 18, height: 18 }} />
              </motion.button>
            </div>

            {/* Loading overlay */}
            {loading && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: 'rgba(0,0,0,0.75)', borderRadius: 28 }}>
                <div style={{ width: 36, height: 36, border: '3px solid rgba(193,0,255,0.2)', borderTopColor: '#C100FF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 600 }}>Loading...</div>
              </div>
            )}

            <input ref={galleryInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleWebGallery} />
            <input ref={cameraInputRef} type="file" accept="image/*" capture="user" style={{ display: 'none' }} onChange={handleWebCamera} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
