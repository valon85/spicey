import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  X, Music2, Type, Smile, Sparkles, RotateCcw, Zap, Download,
  ChevronLeft, ChevronRight, CheckCircle2, MicOff, Mic,
  Camera, SwitchCamera, ImagePlus, Video, Radio, FlipHorizontal,
  Timer, Flashlight
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';

/* ─── MODES ─────────────────────────────────────────── */
const MODES = ['POST', 'STORY', 'REEL', 'LIVE'];
const DEFAULT_MODE_INDEX = 1; // STORY

/* ─── FILTERS ────────────────────────────────────────── */
const FILTERS = [
  { id: 'none',    label: 'Normal',  css: 'none' },
  { id: 'vivid',   label: 'Vivid',   css: 'saturate(1.8) contrast(1.15)' },
  { id: 'noir',    label: 'Noir',    css: 'grayscale(1) contrast(1.2)' },
  { id: 'golden',  label: 'Golden',  css: 'sepia(0.6) saturate(1.4)' },
  { id: 'cool',    label: 'Cool',    css: 'hue-rotate(30deg) saturate(1.3)' },
  { id: 'warm',    label: 'Warm',    css: 'sepia(0.35) saturate(1.6) brightness(1.05)' },
  { id: 'fade',    label: 'Fade',    css: 'brightness(1.1) contrast(0.85) saturate(0.8)' },
  { id: 'chrome',  label: 'Chrome',  css: 'saturate(2) contrast(1.4) brightness(1.1)' },
];

/* ─── STICKERS ───────────────────────────────────────── */
const STICKERS = ['🔥','✨','💫','❤️','🎵','💜','🌙','⚡','🦋','🎉','💎','👑','🌸','🤩','💥'];

/* ─── TEXT STYLES ────────────────────────────────────── */
const TEXT_STYLES = [
  { id: 'classic',  font: 'Inter, sans-serif',          weight: '800', color: '#ffffff', stroke: true },
  { id: 'neon',     font: 'Inter, sans-serif',          weight: '900', color: '#ff5500', stroke: false, glow: '#ff5500' },
  { id: 'elegant',  font: 'Georgia, serif',             weight: '400', color: '#ffe4b5', stroke: false },
  { id: 'grunge',   font: 'Impact, Arial Narrow, sans-serif', weight: '900', color: '#ffffff', stroke: true },
  { id: 'script',   font: 'Palatino Linotype, serif',   weight: '700', color: '#ffb3de', stroke: false },
];

export default function CreatorScreen({ isOpen, onClose }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  /* ── Core state ── */
  const [modeIndex, setModeIndex] = useState(DEFAULT_MODE_INDEX);
  const [media, setMedia] = useState(null);        // { url, type, file }
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  /* ── Camera ── */
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');
  const [flash, setFlash] = useState(false);

  /* ── Filter ── */
  const [filterIndex, setFilterIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  /* ── Text overlay ── */
  const [showTextTool, setShowTextTool] = useState(false);
  const [textValue, setTextValue] = useState('');
  const [textStyleIndex, setTextStyleIndex] = useState(0);
  const [textOverlays, setTextOverlays] = useState([]);

  /* ── Stickers ── */
  const [showStickers, setShowStickers] = useState(false);
  const [stickerOverlays, setStickerOverlays] = useState([]);

  /* ── Music ── */
  const [showMusic, setShowMusic] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState(null);

  /* ── Caption ── */
  const [caption, setCaption] = useState('');
  const [showCaptionInput, setShowCaptionInput] = useState(false);

  /* ── Swipe state for mode tabs ── */
  const startX = useRef(null);

  const activeMode = MODES[modeIndex];

  /* ── Lock body scroll ── */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      startCamera();
    } else {
      document.body.style.overflow = '';
      stopCamera();
      resetAll();
    }
    return () => { document.body.style.overflow = ''; stopCamera(); };
  }, [isOpen]);

  /* ── Reset when mode changes ── */
  useEffect(() => {
    if (activeMode === 'LIVE') { onClose(); navigate('/live'); }
  }, [activeMode]);

  function resetAll() {
    setMedia(null); setUploaded(false); setUploading(false);
    setTextOverlays([]); setStickerOverlays([]); setCaption('');
    setShowFilters(false); setShowTextTool(false); setShowStickers(false);
    setShowMusic(false); setShowCaptionInput(false);
    setFilterIndex(0); setModeIndex(DEFAULT_MODE_INDEX);
  }

  /* ── Camera ── */
  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 }, aspectRatio: { ideal: 9/16 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch {
      setCameraActive(false);
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraActive(false);
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  async function flipCamera() {
    stopCamera();
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: next, width: { ideal: 1920 }, height: { ideal: 1080 }, aspectRatio: { ideal: 9/16 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; setCameraActive(true); }
    } catch { setCameraActive(false); }
  }

  /* ── File pick + video recording ── */
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => setMedia({ url: evt.target.result, type: file.type.startsWith('video') ? 'video' : 'image', file });
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Press + hold to record video
  const startVideoRecording = async () => {
    if (!streamRef.current) return;
    recordedChunksRef.current = [];
    const mimeType = 'video/mp4';
    const mediaRecorder = new MediaRecorder(streamRef.current, { mimeType });
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.ondataavailable = (e) => recordedChunksRef.current.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: mimeType });
      const url = URL.createObjectURL(blob);
      const file = new File([blob], 'video.mp4', { type: mimeType });
      setMedia({ url, type: 'video', file });
      recordedChunksRef.current = [];
      setIsRecording(false);
    };
    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopVideoRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  /* ── Upload / Post ── */
  const handlePost = async () => {
    if (!media?.file) return;
    setUploading(true);
    try {
      const user = await base44.auth.me();
      const userProfile = await base44.entities.UserProfile.filter({ user_id: user.id }, '-created_date', 1).then(r => r[0]);
      const { file_url } = await base44.integrations.Core.UploadFile({ file: media.file });

      if (activeMode === 'STORY') {
        // Create story entity so it shows to all users
        const isVideo = media.type === 'video';
        await base44.entities.Story.create({
          user_id: user.id,
          username: userProfile?.username || user.email?.split('@')[0],
          user_avatar: userProfile?.avatar_url,
          [isVideo ? 'video_url' : 'image_url']: file_url,
          caption: caption,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });
        // Also update user profile for backward compatibility
        await base44.auth.updateMe({ story_url: file_url, story_caption: caption, story_created_at: new Date().toISOString() });
      } else if (activeMode === 'REEL') {
        // Create reel post
        const isVideo = media.type === 'video';
        await base44.entities.Post.create({
          author_id: user.id,
          author_name: userProfile?.full_name || user.email?.split('@')[0],
          author_username: userProfile?.username || user.email?.split('@')[0],
          author_avatar: userProfile?.avatar_url,
          [isVideo ? 'video_url' : 'image_url']: file_url,
          caption: caption,
        });
      } else if (activeMode === 'POST') {
        // Create regular post
        await base44.entities.Post.create({
          author_id: user.id,
          author_name: userProfile?.full_name || user.email?.split('@')[0],
          author_username: userProfile?.username || user.email?.split('@')[0],
          author_avatar: userProfile?.avatar_url,
          image_url: media.type === 'video' ? undefined : file_url,
          caption: caption,
        });
      }
    } catch (err) {
      console.error('Post failed:', err);
    }
    setUploading(false); setUploaded(true);
    setTimeout(() => { resetAll(); onClose(); }, 1200);
  };

  /* ── Text overlay ── */
  const addText = () => {
    if (!textValue.trim()) return;
    setTextOverlays(prev => [...prev, { id: Date.now(), text: textValue, styleIndex: textStyleIndex, x: 50, y: 40 }]);
    setTextValue(''); setShowTextTool(false);
  };

  /* ── Sticker overlay ── */
  const addSticker = (emoji) => {
    setStickerOverlays(prev => [...prev, { id: Date.now(), emoji, x: Math.random() * 60 + 20, y: Math.random() * 50 + 20 }]);
    setShowStickers(false);
  };

  /* ── Swipe to change mode ── */
  const handleTouchStart = (e) => { startX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (startX.current === null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(dx) > 50) {
      if (dx < 0) setModeIndex(i => Math.min(i + 1, MODES.length - 1));
      else         setModeIndex(i => Math.max(i - 1, 0));
    }
    startX.current = null;
  };

  const filterCss = FILTERS[filterIndex].css;
  const activeTextStyle = TEXT_STYLES[textStyleIndex];

  const MUSIC_TRACKS = [
    { id: 1, title: 'Midnight Drive', artist: 'SpiceyBeats', emoji: '🌙' },
    { id: 2, title: 'Golden Hour',    artist: 'Velvet', emoji: '☀️' },
    { id: 3, title: 'Neon Pulse',     artist: 'VOLTA', emoji: '⚡' },
    { id: 4, title: 'Blush',          artist: 'Rosé Dream', emoji: '🌸' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="creator"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 280, mass: 0.95 }}
          className="fixed inset-0 z-[200] bg-black overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* ══════════════════════════════════════════════
              FULLSCREEN CAMERA / MEDIA VIEWPORT
          ══════════════════════════════════════════════ */}
          <div className="absolute inset-0" style={{ filter: filterCss, transition: 'filter 0.3s' }}>
            {/* Live camera */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-contain"
              style={{
                display: media ? 'none' : 'block',
                transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
                opacity: cameraActive ? 1 : 0,
                transition: 'opacity 0.4s',
                background: '#000',
              }}
            />

            {/* No camera fallback — cinematic dark canvas */}
            {!cameraActive && !media && (
              <div className="w-full h-full flex items-center justify-center"
                style={{ background: 'radial-gradient(ellipse at 50% 40%, #1e0535 0%, #0a0014 50%, #050008 100%)' }}>
                {/* Ambient light blobs */}
                <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(255,60,0,0.06) 0%, transparent 70%)' }} />
                <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)' }} />
                <div className="text-center space-y-4 relative z-10">
                  <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center relative"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      boxShadow: '0 0 40px rgba(255,60,0,0.08)',
                    }}>
                    <Camera className="w-10 h-10" style={{ color: 'rgba(255,255,255,0.2)' }} />
                  </div>
                  <div>
                    <p className="text-white font-bold text-base" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>Ready to create</p>
                    <p className="text-[12px] mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>Allow camera or tap Gallery</p>
                  </div>
                </div>
              </div>
            )}

            {/* Selected media */}
            {media && (
              media.type === 'video'
                ? <video src={media.url} autoPlay muted loop playsInline className="w-full h-full object-cover" controls />
                : <img src={media.url} alt="" className="w-full h-full object-cover" />
            )}
          </div>

          {/* ── Cinematic top & bottom gradients ── */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 right-0 h-48"
              style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, transparent 100%)' }} />
            <div className="absolute bottom-0 left-0 right-0 h-72"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 100%)' }} />
          </div>

          {/* ── Text overlays ── */}
          {textOverlays.map(overlay => {
            const s = TEXT_STYLES[overlay.styleIndex] || TEXT_STYLES[0];
            return (
              <motion.div
                key={overlay.id}
                drag dragStoryum={false}
                className="absolute cursor-move select-none pointer-events-auto"
                style={{ left: `${overlay.x}%`, top: `${overlay.y}%`, transform: 'translate(-50%,-50%)', zIndex: 10,
                  fontFamily: s.font, fontWeight: s.weight, color: s.color, fontSize: 26,
                  textShadow: s.stroke ? '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000' : s.glow ? `0 0 20px ${s.glow}, 0 0 40px ${s.glow}80` : 'none',
                  WebkitTextStroke: s.stroke ? '1.5px rgba(0,0,0,0.7)' : 'none',
                }}>
                {overlay.text}
              </motion.div>
            );
          })}

          {/* ── Sticker overlays ── */}
          {stickerOverlays.map(s => (
            <motion.div
              key={s.id}
              drag dragStoryum={false}
              className="absolute text-4xl cursor-move select-none pointer-events-auto"
              style={{ left: `${s.x}%`, top: `${s.y}%`, transform: 'translate(-50%,-50%)', zIndex: 10 }}>
              {s.emoji}
            </motion.div>
          ))}

          {/* ══════════════════════════════════════════════
              TOP BAR — close / flash / flip
          ══════════════════════════════════════════════ */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4"
            style={{ paddingTop: 'max(3rem, env(safe-area-inset-top) + 0.75rem)', paddingBottom: '0.5rem' }}>
            <motion.button whileTap={{ scale: 0.85 }} onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <X className="w-5 h-5 text-white" />
            </motion.button>

            <div className="flex items-center gap-2.5">
              <motion.button whileTap={{ scale: 0.85 }} onClick={() => setFlash(f => !f)}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: flash ? 'rgba(255,200,0,0.35)' : 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)', border: `1px solid ${flash ? 'rgba(255,200,0,0.5)' : 'rgba(255,255,255,0.12)'}` }}>
                <Zap className="w-5 h-5" style={{ color: flash ? '#ffe040' : 'white' }} />
              </motion.button>
              <motion.button whileTap={{ scale: 0.85 }} onClick={flipCamera}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)' }}>
                <SwitchCamera className="w-5 h-5 text-white" />
              </motion.button>
            </div>
          </div>

          {/* ══════════════════════════════════════════════
              RIGHT SIDE TOOLS
          ══════════════════════════════════════════════ */}
          <div className="absolute right-3.5 z-20 flex flex-col gap-5 items-center"
            style={{ top: '50%', transform: 'translateY(-50%)' }}>
            {([
              { icon: Type,     label: 'Text',    active: showTextTool,  action: () => { setShowTextTool(t => !t); setShowStickers(false); setShowFilters(false); setShowMusic(false); } },
              { icon: Smile,    label: 'Sticker', active: showStickers,  action: () => { setShowStickers(s => !s); setShowTextTool(false); setShowFilters(false); setShowMusic(false); } },
              { icon: Sparkles, label: 'Filter',  active: showFilters,   action: () => { setShowFilters(f => !f); setShowTextTool(false); setShowStickers(false); setShowMusic(false); } },
              { icon: Music2,   label: 'Music',   active: showMusic,     action: () => { setShowMusic(m => !m); setShowFilters(false); setShowTextTool(false); setShowStickers(false); } },
            ]).map(({ icon: SideIcon, label, active, action }) => (
              <motion.button key={label} whileTap={{ scale: 0.78 }} onClick={action}
                className="flex flex-col items-center gap-1.5">
                <div className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
                  style={{
                    background: active ? 'rgba(255,80,0,0.25)' : 'rgba(0,0,0,0.45)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: active ? '1.5px solid rgba(255,100,0,0.6)' : '1px solid rgba(255,255,255,0.18)',
                    boxShadow: active ? '0 0 16px rgba(255,80,0,0.5)' : '0 2px 12px rgba(0,0,0,0.4)',
                  }}>
                  <SideIcon className="w-5 h-5" style={{ color: active ? '#ff7730' : 'rgba(255,255,255,0.9)' }} />
                </div>
                <span className="text-[10px] font-bold tracking-wider"
                  style={{ color: active ? '#ff7730' : 'rgba(255,255,255,0.7)', textShadow: '0 1px 6px rgba(0,0,0,1)' }}>
                  {label}
                </span>
              </motion.button>
            ))}
          </div>

          {/* ══════════════════════════════════════════════
              TEXT TOOL OVERLAY
          ══════════════════════════════════════════════ */}
          <AnimatePresence>
            {showTextTool && (
              <motion.div
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}
                transition={{ type: 'spring', damping: 28, stiffness: 340 }}
                className="absolute inset-x-3 z-30 rounded-3xl p-4 space-y-3"
                style={{ bottom: 230, background: 'rgba(6,2,14,0.82)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 -4px 40px rgba(0,0,0,0.6)' }}>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Text Style</p>
                {/* Font style pills */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {TEXT_STYLES.map((s, i) => (
                    <motion.button key={s.id} whileTap={{ scale: 0.9 }} onClick={() => setTextStyleIndex(i)}
                      className="flex-shrink-0 px-4 py-2 rounded-2xl text-[15px] transition-all"
                      style={{
                        fontFamily: s.font, fontWeight: s.weight, color: textStyleIndex === i ? s.color : 'rgba(255,255,255,0.5)',
                        background: textStyleIndex === i ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)',
                        border: textStyleIndex === i ? `1.5px solid ${s.color}60` : '1px solid rgba(255,255,255,0.07)',
                        boxShadow: textStyleIndex === i && s.glow ? `0 0 14px ${s.glow}50` : 'none',
                        textShadow: textStyleIndex === i && s.glow ? `0 0 12px ${s.glow}` : 'none',
                      }}>
                      Aa
                    </motion.button>
                  ))}
                </div>
                {/* Input row */}
                <div className="flex gap-2 items-center">
                  <input
                    autoFocus
                    type="text"
                    value={textValue}
                    onChange={e => setTextValue(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addText()}
                    placeholder="Add text to your story…"
                    className="flex-1 bg-transparent outline-none font-semibold px-3.5 py-2.5 rounded-2xl"
                    style={{
                      border: '1px solid rgba(255,255,255,0.14)',
                      color: TEXT_STYLES[textStyleIndex].color,
                      fontFamily: TEXT_STYLES[textStyleIndex].font,
                      fontSize: 16,
                      textShadow: TEXT_STYLES[textStyleIndex].glow ? `0 0 8px ${TEXT_STYLES[textStyleIndex].glow}` : 'none',
                    }}
                  />
                  <motion.button whileTap={{ scale: 0.88 }} onClick={addText}
                    className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c, #8b5cf6)', boxShadow: '0 0 20px rgba(255,60,0,0.5)' }}>
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ══════════════════════════════════════════════
              STICKER TRAY
          ══════════════════════════════════════════════ */}
          <AnimatePresence>
            {showStickers && (
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                className="absolute inset-x-4 z-30 rounded-3xl p-4"
                style={{ bottom: 220, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)' }}>
                <p className="text-white/40 text-[11px] font-bold uppercase tracking-widest mb-3">Stickers</p>
                <div className="grid grid-cols-8 gap-2">
                  {STICKERS.map(emoji => (
                    <motion.button key={emoji} whileTap={{ scale: 0.7 }} onClick={() => addSticker(emoji)}
                      className="text-3xl flex items-center justify-center p-1 rounded-xl hover:bg-white/10">
                      {emoji}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ══════════════════════════════════════════════
              FILTER STRIP
          ══════════════════════════════════════════════ */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                transition={{ type: 'spring', damping: 28, stiffness: 340 }}
                className="absolute inset-x-0 z-30 pb-3"
                style={{ bottom: 230, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)', paddingTop: 16 }}>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3 px-5">Filters</p>
                <div className="flex gap-3 overflow-x-auto px-5 pb-1 scrollbar-hide">
                  {FILTERS.map((f, i) => (
                    <motion.button key={f.id} whileTap={{ scale: 0.88 }} onClick={() => setFilterIndex(i)}
                      className="flex-shrink-0 flex flex-col items-center gap-2">
                      <div className="relative overflow-hidden"
                        style={{
                          width: 60, height: 72, borderRadius: 16,
                          border: filterIndex === i ? '2.5px solid #ff5500' : '2px solid rgba(255,255,255,0.12)',
                          boxShadow: filterIndex === i ? '0 0 20px rgba(255,80,0,0.7), 0 0 40px rgba(233,30,140,0.3)' : '0 2px 8px rgba(0,0,0,0.5)',
                          transition: 'all 0.2s',
                        }}>
                        <div className="w-full h-full"
                          style={{ background: 'linear-gradient(160deg, #9b3a6a 0%, #3a1475 50%, #0d0828 100%)', filter: f.css }} />
                        {filterIndex === i && (
                          <div className="absolute inset-0 flex items-center justify-center"
                            style={{ background: 'rgba(0,0,0,0.25)' }}>
                            <div className="w-5 h-5 rounded-full flex items-center justify-center"
                              style={{ background: 'linear-gradient(135deg,#ff5500,#e91e8c)' }}>
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] font-bold"
                        style={{ color: filterIndex === i ? '#ff7730' : 'rgba(255,255,255,0.5)' }}>
                        {f.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ══════════════════════════════════════════════
              MUSIC PICKER
          ══════════════════════════════════════════════ */}
          <AnimatePresence>
            {showMusic && (
              <motion.div
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}
                transition={{ type: 'spring', damping: 28, stiffness: 340 }}
                className="absolute inset-x-3 z-30 rounded-3xl overflow-hidden"
                style={{ bottom: 230, background: 'rgba(6,2,14,0.88)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 -4px 40px rgba(0,0,0,0.7)' }}>
                {/* Header */}
                <div className="flex items-center gap-2 px-4 pt-4 pb-3"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <Music2 className="w-4 h-4 text-orange-400" />
                  <p className="text-[11px] font-black uppercase tracking-widest text-white/50">Hot Sounds</p>
                </div>
                <div className="p-3 space-y-1.5">
                  {MUSIC_TRACKS.map((track, ti) => (
                    <motion.button key={track.id} whileTap={{ scale: 0.97 }}
                      onClick={() => { setSelectedMusic(track); setShowMusic(false); }}
                      className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-left transition-all"
                      style={{
                        background: selectedMusic?.id === track.id
                          ? 'linear-gradient(135deg, rgba(255,80,0,0.18), rgba(233,30,140,0.12))'
                          : 'rgba(255,255,255,0.04)',
                        border: selectedMusic?.id === track.id
                          ? '1px solid rgba(255,80,0,0.3)'
                          : '1px solid rgba(255,255,255,0.06)',
                      }}>
                      {/* Animated waveform icon */}
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: selectedMusic?.id === track.id
                            ? 'linear-gradient(135deg, rgba(255,80,0,0.25), rgba(139,92,246,0.2))'
                            : 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          fontSize: 20,
                        }}>
                        {track.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm leading-tight truncate">{track.title}</p>
                        <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{track.artist} · 0:{20 + ti * 7}s</p>
                      </div>
                      {selectedMusic?.id === track.id
                        ? <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg,#ff5500,#e91e8c)' }}>
                            <CheckCircle2 className="w-3 h-3 text-white" />
                          </div>
                        : <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div className="w-0 h-0" style={{ borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: '8px solid rgba(255,255,255,0.7)', marginLeft: 2 }} />
                          </div>
                      }
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ══════════════════════════════════════════════
              MUSIC BADGE (when selected)
          ══════════════════════════════════════════════ */}
          <AnimatePresence>
            {selectedMusic && !showMusic && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                className="absolute top-24 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <Music2 className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-white text-[11px] font-bold">{selectedMusic.title}</span>
                <button onClick={() => setSelectedMusic(null)} className="ml-1 text-white/40 hover:text-white text-xs">✕</button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ══════════════════════════════════════════════
              CAPTION INPUT (slide-up)
          ══════════════════════════════════════════════ */}
          <AnimatePresence>
            {showCaptionInput && (
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                className="absolute inset-x-4 z-30 rounded-3xl p-4"
                style={{ bottom: 220, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)' }}>
                <textarea
                  autoFocus
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  placeholder="Write a caption..."
                  rows={3}
                  className="w-full bg-transparent text-white placeholder:text-white/25 outline-none resize-none text-base"
                  style={{ fontSize: 16 }}
                />
                <div className="flex justify-end mt-2">
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowCaptionInput(false)}
                    className="px-4 py-1.5 rounded-full text-white text-sm font-bold"
                    style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)' }}>
                    Done
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ══════════════════════════════════════════════
              BOTTOM CREATOR BAR
          ══════════════════════════════════════════════ */}
          <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col items-center"
            style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>

            {/* ── Gallery / Capture / Post row ── */}
            <div className="flex items-center justify-between w-full px-8 mb-5">
              {/* Gallery picker */}
              <motion.button whileTap={{ scale: 0.85 }} onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-1.5">
                <div className="w-14 h-14 rounded-2xl overflow-hidden relative flex items-center justify-center"
                  style={{
                    background: media ? 'transparent' : 'rgba(255,255,255,0.08)',
                    border: '1.5px solid rgba(255,255,255,0.18)',
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 2px 16px rgba(0,0,0,0.5)',
                  }}>
                  {media
                    ? <img src={media.url} alt="" className="w-full h-full object-cover" />
                    : <ImagePlus className="w-6 h-6" style={{ color: 'rgba(255,255,255,0.65)' }} />
                  }
                </div>
                <span className="text-[10px] font-bold tracking-wide" style={{ color: 'rgba(255,255,255,0.55)', textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>Gallery</span>
              </motion.button>

              {/* Main shutter / post button */}
              <motion.button
                whileTap={{ scale: 0.88 }}
                onMouseDown={() => !media && activeMode === 'STORY' && startVideoRecording()}
                onMouseUp={() => !media && activeMode === 'STORY' && stopVideoRecording()}
                onTouchStart={() => !media && activeMode === 'STORY' && startVideoRecording()}
                onTouchEnd={() => !media && activeMode === 'STORY' && stopVideoRecording()}
                onClick={media ? handlePost : () => fileInputRef.current?.click()}
                disabled={uploading}
                className="relative flex items-center justify-center"
                style={{ width: 88, height: 88 }}>
                {/* Recording ring — red/pink animated border */}
                {isRecording && (
                  <motion.div
                    className="absolute rounded-full pointer-events-none"
                    animate={{ boxShadow: [
                      '0 0 0 4px rgba(220,30,120,0.6), 0 0 20px rgba(220,30,120,0.8)',
                      '0 0 0 8px rgba(220,30,120,0.4), 0 0 40px rgba(220,30,120,1)',
                      '0 0 0 4px rgba(220,30,120,0.6), 0 0 20px rgba(220,30,120,0.8)',
                    ]}}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    style={{ inset: '-12px' }}
                  />
                )}
                {/* Bloom glow — static, no animation (iOS fixed safe) */}
                <div className="absolute rounded-full pointer-events-none"
                  style={{
                    inset: '-12px',
                    background: media
                      ? 'conic-gradient(from 180deg, #ff5500, #e91e8c, #8b5cf6, #ff5500)'
                      : 'none',
                    filter: 'blur(20px)',
                    opacity: 0.6,
                  }} />
                {/* Outer glass ring */}
                <div className="absolute inset-0 rounded-full"
                  style={{
                    border: '2.5px solid rgba(255,255,255,0.85)',
                    boxShadow: media
                      ? '0 0 0 1px rgba(255,80,0,0.2) inset, 0 0 24px rgba(255,60,0,0.4)'
                      : '0 0 0 1px rgba(255,255,255,0.08) inset',
                  }} />
                {/* Inner fill */}
                <div className="rounded-full flex items-center justify-center"
                  style={{
                    width: 70, height: 70,
                    background: media
                      ? 'linear-gradient(135deg, #ff5500 0%, #e91e8c 50%, #8b5cf6 100%)'
                      : 'rgba(255,255,255,0.92)',
                    boxShadow: media
                      ? '0 0 32px rgba(255,60,0,0.8), 0 0 64px rgba(233,30,140,0.5), 0 0 100px rgba(139,92,246,0.3), inset 0 1px 0 rgba(255,255,255,0.25)'
                      : 'inset 0 1px 0 rgba(255,255,255,0.9)',
                  }}>
                  {uploading
                    ? <div className="w-7 h-7 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : uploaded
                      ? <span className="text-2xl">✅</span>
                      : media
                        ? <ChevronRight className="w-8 h-8 text-white drop-shadow-lg" />
                        : <Camera className="w-7 h-7" style={{ color: '#1a0030' }} />
                  }
                </div>
              </motion.button>

              {/* Caption / add-ons toggle */}
              <motion.button whileTap={{ scale: 0.85 }} onClick={() => setShowCaptionInput(c => !c)}
                className="flex flex-col items-center gap-1.5">
                <div className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.15)' }}>
                  <Type className="w-5 h-5 text-white/70" />
                </div>
                <span className="text-[10px] text-white/60 font-semibold">Caption</span>
              </motion.button>
            </div>

            {/* ── Mode tabs ── */}
            <div className="flex items-center gap-1 px-2">
              {MODES.map((mode, i) => {
                const isActive = i === modeIndex;
                return (
                  <motion.button
                    key={mode}
                    layout
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setModeIndex(i)}
                    className="relative px-4 py-2 rounded-full"
                    style={{ minWidth: 56 }}>
                    <span className="relative z-10 text-[13px] font-black tracking-widest transition-colors"
                      style={{ color: isActive ? '#ffffff' : 'rgba(255,255,255,0.35)' }}>
                      {mode}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="mode-pill"
                        className="absolute inset-0 rounded-full"
                        style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 380 }}
                      />
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="mode-dot"
                        className="absolute bottom-0.5 left-1/2 w-1 h-1 rounded-full -translate-x-1/2"
                        style={{ background: '#ff5500' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 380 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Hidden file input */}
          <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileSelect} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}