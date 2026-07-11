import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import {
  X, ImagePlus, Sparkles, Loader2, Download, Video, Type, Plus, GripHorizontal
} from 'lucide-react';
import SpiceLogo from '@/components/shared/SpiceLogo';


// ─── Constants ───────────────────────────────────────────────────────────────

const PHOTO_FILTERS = [
  { name: 'Original', style: 'none' },
  { name: 'Vivid', style: 'saturate(1.4) contrast(1.05) brightness(1.02)' },
  { name: 'Warm', style: 'sepia(0.25) saturate(1.3) brightness(1.05)' },
  { name: 'Cool', style: 'hue-rotate(15deg) saturate(1.1) contrast(1.05)' },
  { name: 'Noir', style: 'grayscale(1) contrast(1.15) brightness(1.05)' },
  { name: 'Fade', style: 'saturate(0.7) brightness(1.1) contrast(0.92)' },
  { name: 'Golden', style: 'sepia(0.4) saturate(1.5) brightness(1.08)' },
  { name: 'Cinema', style: 'contrast(1.1) saturate(0.9) brightness(1.05)' },
  { name: 'Portrait', style: 'saturate(1.2) brightness(1.08) contrast(1.02)' },
  { name: 'Sunset', style: 'sepia(0.3) saturate(1.4) hue-rotate(-10deg)' },
  { name: 'Moonlight', style: 'hue-rotate(180deg) saturate(0.8) brightness(1.1)' },
  { name: 'Vintage', style: 'sepia(0.5) contrast(0.95) brightness(1.1) saturate(0.8)' },
];

const AI_PRESETS = [
  { id: 'natural', label: 'Natural', color: '#00c853', prompt: 'Natural beauty enhancement, subtle improvements, keep original features, realistic skin texture, both men and women', gender: 'unisex' },
  { id: 'smooth', label: 'Smooth', color: '#ff9900', prompt: 'Smooth skin texture, remove blemishes, even skin tone, natural look', gender: 'unisex' },
  { id: 'sharpen', label: 'Sharpen', color: '#00ccff', prompt: 'Sharpen facial features, enhance definition, clearer details', gender: 'unisex' },
  { id: 'younger', label: 'Younger', color: '#e91e8c', prompt: 'Look younger, reduce wrinkles, fresh appearance, natural anti-aging', gender: 'unisex' },
  { id: 'makeup', label: 'Makeup', color: '#ec4899', prompt: 'Natural makeup enhancement, subtle lip color, light foundation, suitable for women', gender: 'female' },
  { id: 'masculine', label: 'Strong', color: '#7c3aed', prompt: 'Masculine features enhancement, stronger jawline, defined features, suitable for men', gender: 'male' },
  { id: 'hair', label: 'Hair', color: '#a733ff', prompt: 'Enhance hair appearance, add volume and shine, improve hair color', gender: 'unisex' },
  { id: 'lighting', label: 'Light', color: '#f59e0b', prompt: 'Better lighting, improve brightness, reduce shadows, professional lighting', gender: 'unisex' },
  { id: 'slim', label: 'Slim', color: '#ef4444', prompt: 'Slim face appearance, subtle contouring, natural proportions', gender: 'unisex' },
  { id: 'glam', label: 'Glam', color: '#f472b6', prompt: 'Glamorous look, full makeup, editorial beauty, professional photoshoot', gender: 'female' },
];

const TABS = [
  { id: 'photo',   label: 'Photo',   icon: ImagePlus },
  { id: 'video',   label: 'Video',   icon: Video },
  { id: 'text',    label: 'Text',    icon: Type },
];

// NOTE: Video dhe Text tabs janë aktive dhe funksionale

// ─── Component ───────────────────────────────────────────────────────────────

export default function StoryCreator({ onCapture, onClose, initialTab }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const addMoreRef = useRef(null);
  const forcedTab = initialTab || null;
  const [activeTab, setActiveTab] = useState(initialTab || 'photo');
  const [isLightMode, setIsLightMode] = useState(false);

  React.useEffect(() => {
    const check = () => setIsLightMode(document.documentElement.classList.contains('light-mode'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  // Multi-photo state: array of { file, url }
  const [photos, setPhotos] = useState([]); // [{ file, url }]
  const [activeIndex, setActiveIndex] = useState(0); // which photo is being previewed/edited
  const [selectedFilter, setSelectedFilter] = useState(PHOTO_FILTERS[0]);
  const [aiEnhancedUrls, setAiEnhancedUrls] = useState({}); // { index: enhancedUrl }
  const [aiEnhancing, setAiEnhancing] = useState(false);
  const [activePreset, setActivePreset] = useState(null);
  const [selectedGender, setSelectedGender] = useState('all');

  // Video state
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeMeta, setYoutubeMeta] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [videoFileUrl, setVideoFileUrl] = useState(null);
  const videoInputRef = useRef(null);

  const activePhoto = photos[activeIndex] || null;
  const activeEnhanced = aiEnhancedUrls[activeIndex] || null;
  const displayUrl = activeEnhanced || activePhoto?.url || null;

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newPhotos = files.map(file => ({ file, url: URL.createObjectURL(file) }));
    setPhotos(prev => {
      const updated = [...prev, ...newPhotos];
      setActiveIndex(prev.length); // jump to first new photo
      return updated;
    });
    setAiEnhancedUrls({});
    setSelectedFilter(PHOTO_FILTERS[0]);
    setActiveTab('photo');
    e.target.value = '';
  };

  const handleAddMore = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newPhotos = files.map(file => ({ file, url: URL.createObjectURL(file) }));
    setPhotos(prev => [...prev, ...newPhotos]);
    e.target.value = '';
  };

  const handleRemovePhoto = (idx) => {
    setPhotos(prev => {
      const updated = prev.filter((_, i) => i !== idx);
      return updated;
    });
    setAiEnhancedUrls(prev => {
      const next = {};
      Object.entries(prev).forEach(([k, v]) => {
        const ki = parseInt(k);
        if (ki < idx) next[ki] = v;
        else if (ki > idx) next[ki - 1] = v;
      });
      return next;
    });
    setActiveIndex(prev => Math.max(0, prev >= idx ? prev - 1 : prev));
  };

  const handleMovePhoto = (idx, dir) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= photos.length) return;
    setPhotos(prev => {
      const arr = [...prev];
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr;
    });
    setActiveIndex(newIdx);
  };

  const handleAIEnhance = async (preset) => {
    if (!activePhoto) return;
    setAiEnhancing(true);
    setActivePreset(preset.id);
    let url = activeEnhanced;
    if (!url) {
      const up = await base44.integrations.Core.UploadFile({ file: activePhoto.file });
      url = up.file_url;
    }
    const res = await base44.integrations.Core.GenerateImage({
      prompt: preset.prompt + ', high quality, professional photography, 4k',
      existing_image_urls: [url],
    });
    setAiEnhancedUrls(prev => ({ ...prev, [activeIndex]: res.url }));
    setAiEnhancing(false);
    setActivePreset(null);
  };

  const handleUndo = () => {
    setAiEnhancedUrls(prev => { const n = { ...prev }; delete n[activeIndex]; return n; });
    setSelectedFilter(PHOTO_FILTERS[0]);
    setActivePreset(null);
  };

  const handleShare = () => {
    try {
      if (activeTab === 'photo' && photos.length > 0) {
        window._storyPhotoFile = photos[0].file;
        navigate('/create-story-photo');
      } else if (activeTab === 'video') {
        if (videoFile) {
          window._storyVideoFile = videoFile;
          navigate('/create-story-video-upload');
        } else if (youtubeUrl.trim()) {
          window._pendingVideoLink = youtubeUrl.trim();
          navigate('/create-video');
        }
      }
    } catch (error) {
      console.error('[StoryCreator] Share error:', error);
      alert('Failed to share story. Please try again.');
    }
  };

  const handleVideoFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoFile(file);
    setVideoFileUrl(URL.createObjectURL(file));
    setYoutubeUrl('');
    setYoutubeMeta(null);
    e.target.value = '';
  };

  const canShare =
    (activeTab === 'photo' && photos.length > 0) ||
    (activeTab === 'video' && (youtubeUrl.trim().length > 0 || videoFile != null));

  // Light mode colors
  const lm = {
    bg: isLightMode ? 'hsl(270,25%,98%)' : '#0c0c0f',
    cardBg: isLightMode ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.025)',
    text: isLightMode ? 'hsl(270,25%,12%)' : 'white',
    textMuted: isLightMode ? 'rgba(80,50,120,0.6)' : 'rgba(255,255,255,0.4)',
    textLight: isLightMode ? 'rgba(80,50,120,0.45)' : 'rgba(255,255,255,0.28)',
    border: isLightMode ? 'rgba(160,80,255,0.15)' : 'rgba(255,255,255,0.07)',
    borderStrong: isLightMode ? 'rgba(160,80,255,0.25)' : 'rgba(255,80,0,0.3)',
    inputBg: isLightMode ? 'rgba(240,235,250,0.8)' : 'rgba(255,255,255,0.06)',
    buttonBg: isLightMode ? 'rgba(250,245,255,0.9)' : 'rgba(255,255,255,0.06)',
    placeholder: isLightMode ? 'rgba(100,80,140,0.4)' : 'rgba(255,255,255,0.35)',
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'linear-gradient(160deg, #130825 0%, #1a0a2e 40%, #0f0820 100%)' }}>

      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 flex-shrink-0 z-10"
        style={{ 
          paddingTop: 'max(52px, calc(env(safe-area-inset-top, 44px) + 8px))', 
          paddingBottom: 14,
        }}>

        <button onClick={onClose}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <X className="w-5 h-5" style={{ color: 'white' }} />
        </button>

        {/* Logo */}
        <SpiceLogo size="sm" />

        {/* Share button */}
        <button 
          onClick={handleShare}
          disabled={!canShare}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${canShare ? '' : 'opacity-40'}`}
          style={{ 
            background: canShare ? 'linear-gradient(135deg, #ff5500, #e91e8c)' : 'rgba(255,255,255,0.06)',
            boxShadow: canShare ? '0 0 20px rgba(255,85,0,0.5)' : 'none',
            border: '1px solid rgba(255,255,255,0.15)'
          }}>
          <Download className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Tab pills — shown only when not forced to a single tab */}
      {!forcedTab && (
        <div className="flex items-center justify-center gap-2 px-5 my-4 flex-shrink-0 z-10">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <motion.button 
                key={id} 
                whileTap={{ scale: 0.93 }}
                onClick={() => setActiveTab(id)}
                className={`relative px-5 py-2.5 rounded-2xl text-sm font-bold transition-all ${active ? 'text-white' : 'text-white/40'}`}
                style={{
                  background: active 
                    ? 'linear-gradient(135deg, rgba(255,85,0,0.2), rgba(233,30,140,0.15))' 
                    : 'rgba(255,255,255,0.04)',
                  border: active 
                    ? '1.5px solid rgba(255,85,0,0.5)' 
                    : '1px solid rgba(255,255,255,0.1)',
                  boxShadow: active 
                    ? '0 0 20px rgba(255,85,0,0.3), inset 0 0 20px rgba(255,85,0,0.1)' 
                    : 'none',
                }}>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-lg flex items-center justify-center"
                    style={{ 
                      background: active 
                        ? 'linear-gradient(135deg, #ff5500, #e91e8c)' 
                        : 'rgba(255,255,255,0.1)'
                    }}>
                    <Icon className="w-3 h-3 text-white" />
                  </div>
                  {label}
                </div>
                {active && (
                  <motion.div 
                    layoutId="active-tab"
                    className="absolute inset-0 rounded-2xl"
                    style={{ 
                      background: 'linear-gradient(135deg, rgba(255,85,0,0.15), rgba(233,30,140,0.1))',
                      filter: 'blur(8px)',
                      zIndex: -1
                    }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* ─── Main scrollable area ────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5" style={{ minHeight: 0, paddingBottom: 8 }}>
        <AnimatePresence mode="wait">

          {/* ══════ PHOTO TAB ══════ */}
          {activeTab === 'photo' && (
            <motion.div key="photo"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-5">

              {/* Hidden file inputs */}
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoSelect} />
              <input ref={addMoreRef} type="file" accept="image/*" multiple className="hidden" onChange={handleAddMore} />

              {photos.length === 0 ? (
                /* ── Empty state ── */
                <label className="cursor-pointer w-full rounded-[32px] flex flex-col items-center justify-center gap-5"
                  style={{ height: 360, background: 'rgba(255,255,255,0.02)', border: '2px dashed rgba(255,85,0,0.4)', boxShadow: '0 0 40px rgba(255,85,0,0.1), inset 0 0 60px rgba(255,85,0,0.05)' }}
                  onClick={() => fileInputRef.current?.click()}>
                  <motion.div animate={{ scale: [1, 1.08, 1], rotate: [0, 2, -2, 0] }} transition={{ duration: 4, repeat: Infinity }}
                    className="w-20 h-20 rounded-3xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, rgba(255,85,0,0.15), rgba(233,30,140,0.1))', border: '2px solid rgba(255,85,0,0.4)', boxShadow: '0 0 40px rgba(255,85,0,0.3), 0 0 80px rgba(233,30,140,0.2)' }}>
                    <ImagePlus className="w-10 h-10" style={{ color: '#ff7040' }} />
                  </motion.div>
                  <div className="text-center">
                    <p className="font-black text-xl" style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Add Photos</p>
                    <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>Select one or multiple photos</p>
                  </div>
                </label>
              ) : (
                <>
                  {/* ── Photo strip / thumbnail selector ── */}
                  <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                    {photos.map((p, i) => (
                      <div key={i} className="relative flex-shrink-0" style={{ width: 64, height: 64 }}>
                        <motion.button whileTap={{ scale: 0.93 }} onClick={() => setActiveIndex(i)}
                          className="w-full h-full rounded-2xl overflow-hidden"
                          style={{ border: activeIndex === i ? '2.5px solid #ff5500' : '2px solid rgba(255,255,255,0.15)', boxShadow: activeIndex === i ? '0 0 14px rgba(255,85,0,0.6)' : 'none' }}>
                          <img src={aiEnhancedUrls[i] || p.url} alt="" className="w-full h-full object-cover" />
                        </motion.button>
                        {/* Remove button */}
                        <button onClick={() => handleRemovePhoto(i)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center z-10"
                          style={{ background: 'rgba(220,30,30,0.9)', border: '1.5px solid rgba(0,0,0,0.5)' }}>
                          <X className="w-3 h-3 text-white" />
                        </button>
                        {/* Order badge */}
                        <div className="absolute bottom-1 left-1 w-4 h-4 rounded-full flex items-center justify-center"
                          style={{ background: 'rgba(0,0,0,0.7)', fontSize: 9, color: 'white', fontWeight: 700 }}>
                          {i + 1}
                        </div>
                      </div>
                    ))}
                    {/* Add more button */}
                    <button onClick={() => addMoreRef.current?.click()}
                      className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{ border: '2px dashed rgba(255,85,0,0.35)', background: 'rgba(255,85,0,0.05)' }}>
                      <Plus className="w-6 h-6" style={{ color: 'rgba(255,85,0,0.7)' }} />
                    </button>
                  </div>

                  {/* Reorder arrows (for active photo) */}
                  {photos.length > 1 && (
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => handleMovePhoto(activeIndex, -1)} disabled={activeIndex === 0}
                        className="px-3 py-1 rounded-xl text-xs font-bold disabled:opacity-30"
                        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}>
                        ← Move Earlier
                      </button>
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{activeIndex + 1} / {photos.length}</span>
                      <button onClick={() => handleMovePhoto(activeIndex, 1)} disabled={activeIndex === photos.length - 1}
                        className="px-3 py-1 rounded-xl text-xs font-bold disabled:opacity-30"
                        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}>
                        Move Later →
                      </button>
                    </div>
                  )}

                  {/* Undo AI enhance */}
                  {(activeEnhanced || selectedFilter.name !== 'Original') && (
                    <motion.button initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                      onClick={handleUndo}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl mx-auto"
                      style={{ background: 'rgba(220,30,30,0.2)', border: '1px solid rgba(220,30,30,0.4)' }}>
                      <X className="w-4 h-4 text-red-400" />
                      <span className="text-xs font-bold text-red-300">Undo Changes</span>
                    </motion.button>
                  )}

                  {/* Active photo preview */}
                  <div className="relative w-full rounded-[32px] overflow-hidden"
                    style={{ maxHeight: '45vh', boxShadow: '0 0 50px rgba(255,85,0,0.25), 0 0 100px rgba(233,30,140,0.15)', border: '1px solid rgba(255,85,0,0.3)' }}>
                    {aiEnhancing && (
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3"
                        style={{ background: 'rgba(10,2,20,0.9)', backdropFilter: 'blur(16px)' }}>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                          className="w-12 h-12 rounded-full"
                          style={{ border: '3px solid rgba(255,85,0,0.2)', borderTopColor: '#ff5500', boxShadow: '0 0 30px rgba(255,85,0,0.5)' }} />
                        <p className="text-white font-bold text-xs tracking-[0.2em]">ENHANCING...</p>
                      </div>
                    )}
                    <div className="w-full h-full flex items-center justify-center bg-black/20">
                      <img src={displayUrl} alt=""
                        className="w-full h-full"
                        style={{ objectFit: 'contain', filter: selectedFilter.style, maxHeight: '45vh' }} />
                    </div>

                    {/* Filter strip */}
                    <div className="absolute bottom-0 left-0 right-0 z-10 pt-6 pb-3 px-3"
                      style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.95), transparent)' }}>
                      <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                        {PHOTO_FILTERS.map(f => (
                          <motion.button key={f.name} onClick={() => setSelectedFilter(f)} whileTap={{ scale: 1.05 }}
                            className="flex flex-col items-center gap-1 flex-shrink-0">
                            <div className="rounded-xl overflow-hidden border-2"
                              style={{ width: 44, height: 44, borderColor: selectedFilter.name === f.name ? '#ff5500' : 'rgba(255,255,255,0.2)', boxShadow: selectedFilter.name === f.name ? '0 0 12px rgba(255,85,0,0.5)' : 'none' }}>
                              <img src={activePhoto?.url} alt="" className="w-full h-full object-cover" style={{ filter: f.style }} />
                            </div>
                            <span style={{ fontSize: 9, fontWeight: 600, color: selectedFilter.name === f.name ? '#ff7040' : 'rgba(255,255,255,0.5)' }}>{f.name}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* AI Enhance */}
                  <div className="rounded-3xl overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,85,0,0.2)', boxShadow: '0 0 30px rgba(255,85,0,0.1)' }}>
                    <div className="flex items-center justify-between px-4 py-4"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" style={{ color: '#ff9900' }} />
                        <span className="text-sm font-black tracking-wider" style={{ background: 'linear-gradient(135deg, #ff9900, #ff5500)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI ENHANCE</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white/50">For:</span>
                        <div className="flex gap-1">
                          {['all', 'male', 'female'].map(g => (
                            <button key={g} onClick={() => setSelectedGender(g)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${selectedGender === g ? 'text-white' : 'text-white/40'}`}
                              style={{ background: selectedGender === g ? 'rgba(255,85,0,0.3)' : 'rgba(255,255,255,0.05)', border: selectedGender === g ? '1px solid rgba(255,85,0,0.5)' : '1px solid transparent' }}>
                              {g === 'all' ? 'All' : g === 'male' ? 'M' : 'F'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 px-4 py-5">
                      {AI_PRESETS.filter(p => selectedGender === 'all' || p.gender === 'unisex' || p.gender === selectedGender).map(p => (
                        <motion.button key={p.id} whileTap={{ scale: 0.95 }} onClick={() => handleAIEnhance(p)}
                          disabled={aiEnhancing}
                          className="flex flex-col items-center gap-2 p-3 rounded-2xl disabled:opacity-40 transition-all"
                          style={{ background: activePreset === p.id ? `${p.color}20` : 'rgba(255,255,255,0.03)', border: activePreset === p.id ? `2px solid ${p.color}` : '2px solid rgba(255,255,255,0.08)', boxShadow: activePreset === p.id ? `0 0 20px ${p.color}40` : 'none' }}>
                          <div className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{ background: `${p.color}20`, border: `2px solid ${p.color}60` }}>
                            {aiEnhancing && activePreset === p.id
                              ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: p.color }} />
                              : <Sparkles className="w-5 h-5" style={{ color: p.color }} />}
                          </div>
                          <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>{p.label}</span>
                          {p.gender !== 'unisex' && (
                            <span style={{ fontSize: 8, color: p.color, fontWeight: 600 }}>{p.gender === 'male' ? '♂' : '♀'}</span>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* ══════ TEXT TAB ══════ */}
          {activeTab === 'text' && (
            <motion.div key="text"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-5">

              <div className="flex flex-col items-center justify-center gap-6 py-12">
                <motion.div
                  animate={{
                    scale: [1, 1.08, 1],
                    rotate: [0, 2, -2, 0],
                    boxShadow: ['0 0 30px rgba(255,85,0,0.3)', '0 0 60px rgba(233,30,140,0.5)', '0 0 30px rgba(255,85,0,0.3)']
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-24 h-24 rounded-3xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,85,0,0.2), rgba(233,30,140,0.2))',
                    border: '2.5px solid rgba(255,85,0,0.5)',
                  }}>
                  <Type className="w-12 h-12" style={{ color: '#ff7040' }} />
                </motion.div>

                <div className="text-center">
                  <p className="font-black text-2xl" style={{
                    background: 'linear-gradient(135deg, #ff5500, #e91e8c, #a733ff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>Text Story</p>
                  <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    Express yourself with beautiful text
                  </p>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    console.log('[StoryCreator] Navigating to text story');
                    window.location.href = '/create-text-story';
                  }}
                  className="px-8 py-4 rounded-2xl font-bold text-white text-base"
                  style={{
                    background: 'linear-gradient(135deg, #ff5500, #e91e8c)',
                    boxShadow: '0 0 30px rgba(255,85,0,0.5)',
                  }}>
                  ✍️ Create Text Story
                </motion.button>

                <div className="grid grid-cols-3 gap-3 mt-4">
                  {[
                    { color: 'linear-gradient(135deg, #667eea, #764ba2)', label: 'Gradients' },
                    { color: 'linear-gradient(-45deg, #ff6a00, #ee0979)', label: 'Animated' },
                    { color: 'linear-gradient(180deg, #0a0214, #1a0a2e)', label: 'Solid' },
                  ].map((style, i) => (
                    <motion.div
                      key={style.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="h-16 rounded-xl"
                      style={{
                        background: style.color,
                        border: '1px solid rgba(255,255,255,0.2)',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ══════ VIDEO TAB ══════ */}
          {activeTab === 'video' && (
            <motion.div key="video"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4">

              <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoFileSelect} />

              {/* Upload from Gallery button */}
              <motion.button whileTap={{ scale: 0.97 }}
                onClick={() => videoInputRef.current?.click()}
                className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl"
                style={{
                  background: videoFile
                    ? 'linear-gradient(135deg, rgba(233,30,140,0.25), rgba(255,85,0,0.2))'
                    : 'rgba(255,255,255,0.1)',
                  border: videoFile
                    ? '2px solid rgba(233,30,140,0.6)'
                    : '2px dashed rgba(255,85,0,0.5)',
                  boxShadow: videoFile ? '0 0 24px rgba(233,30,140,0.3)' : '0 0 20px rgba(255,85,0,0.08)',
                }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #e91e8c, #ff5500)',
                    boxShadow: '0 4px 16px rgba(233,30,140,0.4)',
                  }}>
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-white font-bold text-sm">
                    {videoFile ? videoFile.name.slice(0, 28) + (videoFile.name.length > 28 ? '…' : '') : 'Choose Video from Gallery'}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    {videoFile ? `${(videoFile.size / 1024 / 1024).toFixed(1)} MB selected` : 'MP4, MOV, WebM supported'}
                  </p>
                </div>
                {videoFile && (
                  <button className="ml-auto w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(220,30,30,0.7)' }}
                    onClick={e => { e.stopPropagation(); setVideoFile(null); setVideoFileUrl(null); }}>
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                )}
              </motion.button>

              {/* Video preview */}
              {videoFileUrl && (
                <div className="relative w-full rounded-[28px] overflow-hidden"
                  style={{ maxHeight: '42vh', background: '#000', border: '2px solid rgba(233,30,140,0.5)', boxShadow: '0 0 40px rgba(233,30,140,0.3)' }}>
                  <video src={videoFileUrl} className="w-full h-full object-contain" style={{ maxHeight: '42vh' }}
                    controls playsInline />
                </div>
              )}

              {/* Divider */}
              {!videoFile && (
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
                  <span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>OR PASTE LINK</span>
                  <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
                </div>
              )}

              {/* YouTube/Video URL Input */}
              {!videoFile && (
                <div className="rounded-2xl overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
                  <div className="p-4">
                    <input
                      type="text"
                      value={youtubeUrl}
                      onChange={e => {
                        const url = e.target.value;
                        setYoutubeUrl(url);
                        setYoutubeMeta(url ? { videoId: 'generic', thumbnail: '', title: 'Video', author: '' } : null);
                      }}
                      placeholder="Paste video URL here..."
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none font-medium"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 15 }}
                    />
                  </div>
                </div>
              )}

            </motion.div>
          )}

        </AnimatePresence>
      </div>


    </div>
  );
}