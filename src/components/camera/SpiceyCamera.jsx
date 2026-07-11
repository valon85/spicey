/**
 * SpiceyCamera — Instagram/Snapchat/TikTok architecture
 *
 * PHASE 1 "capture":  Full-screen live camera. No chrome. Instagram-exact layout.
 *   - Top: X (close) | flash | settings
 *   - Left side: Aa (text) | ∞ (boomerang-style) | layout | effects | chevron
 *   - Bottom: gallery thumb | shutter ring | flip
 *   - Below shutter: POST  STORY  REEL  LIVE  (swipeable tabs)
 *
 * PHASE 2 "editor":  Captured media fills 100% of screen.
 *   Tools float ON TOP as translucent overlays — exactly like Instagram Stories.
 *   NO new page. NO scrollable form. NO header. Media is full-screen background.
 *   - Top right: X (discard) | "Your story" button
 *   - Left side floating: Aa | sticker | draw | music | location | tag
 *   - Bottom: caption pill | "Send to" button
 *   - Panels (music/location/tag/caption) slide up from bottom as sheets overlaying media
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  X, Zap, ZapOff, Music2, Search, Play, Pause,
  MapPin, Check, Loader2, Type, Volume2, VolumeX,
  RotateCcw, Hash, AtSign, Send, Camera
} from 'lucide-react';
import EffectOverlay from './EffectOverlay';

const EFFECTS = [

  /* ══════════════════════════════════════
     BEAUTY — skin enhancement & glow
     Strong blur+brightness combinations
  ══════════════════════════════════════ */
  { id: 'b_none',      name: 'Natural',      cat: 'beauty', overlay: null,
    accent: 'linear-gradient(135deg,#fff5ee,#ffd6c0)',
    css: '' },

  { id: 'b_smooth',    name: 'Smooth',        cat: 'beauty', overlay: null,
    accent: 'linear-gradient(135deg,#fce4ec,#f8bbd0)',
    // Noticeable skin blur + brightness lift
    css: 'blur(1.8px) brightness(1.18) saturate(1.1) contrast(0.88)' },

  { id: 'b_glow',      name: 'Glow',          cat: 'beauty', overlay: 'softlight',
    accent: 'linear-gradient(135deg,#fffde7,#fff9c4)',
    // Radiant over-exposed glow look
    css: 'brightness(1.35) saturate(1.25) contrast(0.85) blur(0.6px)' },

  { id: 'b_porcelain', name: 'Porcelain',      cat: 'beauty', overlay: null,
    accent: 'linear-gradient(135deg,#f5f5f5,#e8eaf6)',
    // Very heavy skin softening — clearly visible pale/matte look
    css: 'blur(2.5px) brightness(1.22) saturate(0.75) contrast(0.82)' },

  { id: 'b_selfie',    name: 'Selfie',         cat: 'beauty', overlay: null,
    accent: 'linear-gradient(135deg,#fce4ec,#f48fb1)',
    // Pink-warm selfie preset — very common look on socials
    css: 'blur(1.2px) brightness(1.15) saturate(1.6) contrast(0.9) hue-rotate(-12deg)' },

  { id: 'b_dewy',      name: 'Dewy Skin',      cat: 'beauty', overlay: 'studio',
    accent: 'linear-gradient(135deg,#e3f2fd,#b3e5fc)',
    // Wet/dewy look — very bright + cool + blown out
    css: 'brightness(1.4) saturate(0.9) contrast(0.8) blur(1px)' },

  { id: 'b_bronze',    name: 'Bronze',         cat: 'beauty', overlay: null,
    accent: 'linear-gradient(135deg,#e65100,#ff8f00)',
    // Warm tan/bronzed skin look
    css: 'sepia(0.5) saturate(2.2) brightness(1.05) contrast(1.05) hue-rotate(-15deg)' },

  { id: 'b_blush',     name: 'Blush',          cat: 'beauty', overlay: null,
    accent: 'linear-gradient(135deg,#ff80ab,#ff4081)',
    // Strong rosy/blush — pink cheeks simulation
    css: 'saturate(2.0) hue-rotate(-20deg) brightness(1.12) contrast(0.92) blur(0.5px)' },


  /* ══════════════════════════════════════
     MAKEUP — visible tone looks
     These visibly change face warmth/color
  ══════════════════════════════════════ */
  { id: 'm_none',      name: 'No Makeup',     cat: 'makeup', overlay: null,
    accent: 'linear-gradient(135deg,#fafafa,#e0e0e0)',
    css: '' },

  { id: 'm_redlip',    name: 'Red Lips',       cat: 'makeup', overlay: null,
    accent: 'linear-gradient(135deg,#c62828,#e53935)',
    // Strong red/warm boost — simulates red lip look on full frame
    css: 'saturate(2.8) hue-rotate(-30deg) contrast(1.2) brightness(0.95)' },

  { id: 'm_rosegold',  name: 'Rose Gold',      cat: 'makeup', overlay: 'lightleak',
    accent: 'linear-gradient(135deg,#ff8a80,#ff6d9f)',
    // Rose gold makeup look — warm pink with shimmer overlay
    css: 'saturate(1.9) hue-rotate(-15deg) brightness(1.1) contrast(1.05)' },

  { id: 'm_smokey',    name: 'Smokey Eye',     cat: 'makeup', overlay: 'portrait',
    accent: 'linear-gradient(135deg,#37474f,#78909c)',
    // Dark, dramatic, moody — smokey eye vibes
    css: 'contrast(1.55) brightness(0.85) saturate(0.8)' },

  { id: 'm_natural',   name: 'Natural Glam',   cat: 'makeup', overlay: null,
    accent: 'linear-gradient(135deg,#ffccbc,#ffab91)',
    // Natural but polished — warm peach tones
    css: 'saturate(1.5) brightness(1.12) hue-rotate(-8deg) contrast(1.0) blur(0.4px)' },

  { id: 'm_purple',    name: 'Purple Glam',    cat: 'makeup', overlay: null,
    accent: 'linear-gradient(135deg,#9c27b0,#673ab7)',
    // Purple/lavender dramatic makeup
    css: 'hue-rotate(40deg) saturate(2.2) contrast(1.15) brightness(0.95)' },

  { id: 'm_glitter',   name: 'Glitter',        cat: 'makeup', overlay: 'bokehlight',
    accent: 'linear-gradient(135deg,#ffd700,#ff69b4,#00bfff)',
    // Glitter/sparkle effect — high saturation + bokeh light overlay
    css: 'saturate(2.5) brightness(1.2) contrast(1.1)' },

  { id: 'm_coral',     name: 'Coral',          cat: 'makeup', overlay: null,
    accent: 'linear-gradient(135deg,#ff7043,#ff5722)',
    // Warm coral/sunset makeup
    css: 'saturate(2.0) hue-rotate(-25deg) brightness(1.08) contrast(1.05)' },


  /* ══════════════════════════════════════
     FUNNY — wild distortions & color madness
     THESE ARE MEANT TO LOOK BROKEN/WEIRD
  ══════════════════════════════════════ */
  { id: 'f_none',      name: 'Normal',        cat: 'funny', overlay: null,
    accent: 'linear-gradient(135deg,#bdbdbd,#757575)',
    css: '' },

  { id: 'f_bighead',   name: 'Big Head',       cat: 'funny', overlay: null,
    accent: 'linear-gradient(135deg,#ff6f00,#ffd600)',
    // Zoom in hard — makes face look enlarged/closer
    css: 'brightness(1.0)',
    transform: 'scale(1.45) translateY(8%)' },

  { id: 'f_alien',     name: 'Alien',          cat: 'funny', overlay: 'neonedge',
    accent: 'linear-gradient(135deg,#00e676,#1de9b6)',
    // Green alien tint
    css: 'hue-rotate(90deg) saturate(3.5) contrast(1.4) brightness(1.1)' },

  { id: 'f_horror',    name: 'Horror',         cat: 'funny', overlay: null,
    accent: 'linear-gradient(135deg,#b71c1c,#880e4f)',
    // Red horror look — dramatic shadows
    css: 'grayscale(0.7) contrast(2.2) brightness(0.6) sepia(0.4) hue-rotate(320deg) saturate(3)' },

  { id: 'f_rainbow',   name: 'Rainbow',        cat: 'funny', overlay: null,
    accent: 'linear-gradient(135deg,#ff0000,#ff7700,#ffff00,#00ff00,#0000ff,#8b00ff)',
    // Wild rainbow hue cycling via strong hue-rotate + saturation
    css: 'hue-rotate(90deg) saturate(4.0) contrast(1.3) brightness(1.1)' },

  { id: 'f_tiny',      name: 'Tiny Face',      cat: 'funny', overlay: null,
    accent: 'linear-gradient(135deg,#ff4081,#f50057)',
    // Zoom out — makes everything look tiny/wide
    css: 'brightness(1.0)',
    transform: 'scale(0.55)' },

  { id: 'f_xray',      name: 'X-Ray',          cat: 'funny', overlay: null,
    accent: 'linear-gradient(135deg,#00bcd4,#006064)',
    // High contrast inverted-ish look
    css: 'invert(0.85) contrast(2.0) brightness(1.2) hue-rotate(180deg)' },

  { id: 'f_wobble',    name: 'Wobble',         cat: 'funny', overlay: null,
    accent: 'linear-gradient(135deg,#ff9800,#ff5722)',
    // Skew distortion — face looks warped/melted
    css: 'brightness(1.0)',
    transform: 'skewX(12deg) scaleY(0.88)' },


  /* ══════════════════════════════════════
     ANIME — cartoon & illustrated styles
     Strong posterize-like transformations
  ══════════════════════════════════════ */
  { id: 'a_none',      name: 'Real',          cat: 'anime', overlay: null,
    accent: 'linear-gradient(135deg,#9e9e9e,#616161)',
    css: '' },

  { id: 'a_anime',     name: 'Anime',          cat: 'anime', overlay: null,
    accent: 'linear-gradient(135deg,#e91e8c,#3f51b5)',
    // Classic anime look: ultra-saturated, high contrast, slight warm shift
    css: 'saturate(3.5) contrast(1.8) brightness(1.1) hue-rotate(-5deg)' },

  { id: 'a_cartoon',   name: 'Cartoon',        cat: 'anime', overlay: null,
    accent: 'linear-gradient(135deg,#ffeb3b,#ff9800)',
    // Bold cartoon look: extreme contrast makes edges pop
    css: 'saturate(4.0) contrast(2.5) brightness(1.05)' },

  { id: 'a_comic',     name: 'Comic',          cat: 'anime', overlay: null,
    accent: 'linear-gradient(135deg,#212121,#f44336)',
    // Black and white + red comic feel
    css: 'grayscale(0.6) contrast(2.8) brightness(1.0) saturate(2.0)' },

  { id: 'a_sketch',    name: 'Sketch',         cat: 'anime', overlay: null,
    accent: 'linear-gradient(135deg,#f5f5f5,#9e9e9e)',
    // Pencil sketch: nearly grayscale + very high contrast
    css: 'grayscale(0.95) contrast(3.5) brightness(1.15)' },

  { id: 'a_manga',     name: 'Manga',          cat: 'anime', overlay: null,
    accent: 'linear-gradient(135deg,#1a237e,#7986cb)',
    // Black & blue manga tones
    css: 'grayscale(0.8) contrast(2.2) brightness(0.95) hue-rotate(200deg) saturate(1.8)' },

  { id: 'a_oil',       name: 'Oil Paint',      cat: 'anime', overlay: null,
    accent: 'linear-gradient(135deg,#6a1b9a,#ad1457)',
    // Painterly look: blur + high sat + warm contrast
    css: 'blur(1.2px) saturate(3.0) contrast(1.6) brightness(1.05)' },

  { id: 'a_neon',      name: 'Neon Anime',     cat: 'anime', overlay: 'neonedge',
    accent: 'linear-gradient(135deg,#00e5ff,#e040fb)',
    // Neon cyberpunk anime look
    css: 'saturate(4.0) contrast(1.8) brightness(0.9) hue-rotate(170deg)' },


  /* ══════════════════════════════════════
     HAIR — strong hue shifts for hair color
     The whole image shifts but hair most visible
  ══════════════════════════════════════ */
  { id: 'h_none',      name: 'Natural',       cat: 'hair', overlay: null,
    accent: 'linear-gradient(135deg,#795548,#4e342e)',
    css: '' },

  { id: 'h_red',       name: 'Red Hair',       cat: 'hair', overlay: null,
    accent: 'linear-gradient(135deg,#b71c1c,#e53935)',
    // Strong red shift — hair turns auburn/red
    css: 'hue-rotate(-40deg) saturate(2.8) contrast(1.1) brightness(1.0)' },

  { id: 'h_blonde',    name: 'Blonde',         cat: 'hair', overlay: null,
    accent: 'linear-gradient(135deg,#f9a825,#ffee58)',
    // Warm golden/blonde shift
    css: 'sepia(0.7) saturate(2.5) brightness(1.2) hue-rotate(-5deg)' },

  { id: 'h_blue',      name: 'Blue Hair',      cat: 'hair', overlay: null,
    accent: 'linear-gradient(135deg,#0d47a1,#1976d2)',
    // Strong blue tint to dark areas (hair)
    css: 'hue-rotate(200deg) saturate(2.5) contrast(1.15) brightness(0.95)' },

  { id: 'h_purple',    name: 'Purple Hair',    cat: 'hair', overlay: null,
    accent: 'linear-gradient(135deg,#4a148c,#9c27b0)',
    // Purple/violet shift
    css: 'hue-rotate(250deg) saturate(2.8) contrast(1.1) brightness(0.95)' },

  { id: 'h_pink',      name: 'Pink Hair',      cat: 'hair', overlay: null,
    accent: 'linear-gradient(135deg,#e91e8c,#f48fb1)',
    // Vibrant pink
    css: 'hue-rotate(-70deg) saturate(3.2) contrast(1.05) brightness(1.05)' },

  { id: 'h_green',     name: 'Green Hair',     cat: 'hair', overlay: null,
    accent: 'linear-gradient(135deg,#1b5e20,#4caf50)',
    // Green shift — punk/rave look
    css: 'hue-rotate(120deg) saturate(2.5) contrast(1.2) brightness(0.95)' },

  { id: 'h_silver',    name: 'Silver',         cat: 'hair', overlay: null,
    accent: 'linear-gradient(135deg,#b0bec5,#eceff1)',
    // Silver/grey — cool desaturated with blue tint
    css: 'saturate(0.2) brightness(1.3) contrast(1.1) hue-rotate(180deg)' },


  /* ══════════════════════════════════════
     EFFECTS — cinematic lighting & mood
  ══════════════════════════════════════ */
  { id: 'e_none',      name: 'Original',      cat: 'effects', overlay: null,
    accent: 'linear-gradient(135deg,#455a64,#90a4ae)',
    css: '' },

  { id: 'e_cinema',    name: 'Cinematic',      cat: 'effects', overlay: 'cinematic',
    accent: 'linear-gradient(135deg,#1a1a2e,#16213e)',
    css: 'contrast(1.35) brightness(0.85) saturate(0.7)' },

  { id: 'e_golden',    name: 'Golden Hour',    cat: 'effects', overlay: 'goldenhour',
    accent: 'linear-gradient(135deg,#f57f17,#ffd600)',
    css: 'sepia(0.35) saturate(2.0) brightness(1.15) hue-rotate(-10deg)' },

  { id: 'e_sunset',    name: 'Sunset',         cat: 'effects', overlay: 'sunsetglow',
    accent: 'linear-gradient(135deg,#bf360c,#ff6f00)',
    css: 'saturate(2.2) hue-rotate(-15deg) brightness(1.05) contrast(1.1)' },

  { id: 'e_neon',      name: 'Neon',           cat: 'effects', overlay: 'neonedge',
    accent: 'linear-gradient(135deg,#e91e8c,#651fff)',
    css: 'saturate(2.8) contrast(1.4) brightness(0.95)' },

  { id: 'e_lightleak', name: 'Light Leak',     cat: 'effects', overlay: 'lightleak',
    accent: 'linear-gradient(135deg,#ff6f00,#e91e63,#6a1b9a)',
    css: 'saturate(1.6) brightness(1.08) contrast(1.05)' },

  { id: 'e_noir',      name: 'Noir',           cat: 'effects', overlay: null,
    accent: 'linear-gradient(135deg,#111,#444)',
    css: 'grayscale(1) contrast(1.8) brightness(0.85)' },

  { id: 'e_bokeh',     name: 'Bokeh',          cat: 'effects', overlay: 'bokehlight',
    accent: 'linear-gradient(135deg,#81d4fa,#f8bbd0)',
    css: 'brightness(1.08) saturate(1.2) contrast(1.05)' },

  { id: 'e_night',     name: 'Night Mode',     cat: 'effects', overlay: 'nightbright',
    accent: 'linear-gradient(135deg,#0d1b2a,#1b4332)',
    css: 'brightness(1.5) contrast(0.85) saturate(1.2)' },

  { id: 'e_studio',    name: 'Studio',         cat: 'effects', overlay: 'studio',
    accent: 'linear-gradient(135deg,#fff8e1,#fffde7)',
    css: 'brightness(1.25) contrast(1.1) saturate(1.1)' },
];

const FILTERS = EFFECTS; // backwards-compat alias

const EFFECT_CATS = [
  { id: 'beauty',  label: '✨ Beauty' },
  { id: 'makeup',  label: '💄 Makeup' },
  { id: 'funny',   label: '😂 Funny' },
  { id: 'anime',   label: '🎭 Anime' },
  { id: 'hair',    label: '💜 Hair' },
  { id: 'effects', label: '🎬 Effects' },
];



const MODE_CONFIG = {
  post:  { label: 'POST',  maxSec: 0  },
  story: { label: 'STORY', maxSec: 15 },
  reel:  { label: 'REEL',  maxSec: 60 },
  live:  { label: 'LIVE',  maxSec: 0  },
};
const MODES = ['post', 'story', 'reel', 'live'];

const R = 36, C = 2 * Math.PI * R;

export default function SpiceyCamera({ onClose }) {
  const navigate  = useNavigate();
  const qc        = useQueryClient();

  const videoRef   = useRef(null);
  const canvasRef  = useRef(null);
  const streamRef  = useRef(null);
  const recRef     = useRef(null);
  const chunksRef  = useRef([]);
  const rafRef     = useRef(null);
  const tickRef    = useRef(null);
  const pinchRef   = useRef(null);
  const swipeRef   = useRef(null);
  const audioRef   = useRef(null);

  /* ── capture phase ── */
  const [phase,      setPhase]     = useState('capture');
  const [mode,       setMode]      = useState('post');
  const [facing,     setFacing]    = useState('user'); // Default to selfie
  const [zoom,       setZoom]      = useState(1);
  const [filterId,   setFilterId]  = useState('b_none');
  const [effectCat,  setEffectCat]  = useState('beauty');
  const [effectsOpen, setEffectsOpen] = useState(false);
  const [recording,  setRecording] = useState(false);
  const [recSec,     setRecSec]    = useState(0);
  const [recPct,     setRecPct]    = useState(0);
  const [camErr,     setCamErr]    = useState(false);
  const [lastPhoto,  setLastPhoto] = useState(null);
  const [flashEffect, setFlashEffect] = useState(false);

  /* ── editor phase — media ── */
  const [videoUrl,   setVideoUrl]  = useState(null);
  const [videoFile,  setVideoFile] = useState(null);
  const [photoUrl,   setPhotoUrl]  = useState(null);
  const [muteOrig,   setMuteOrig]  = useState(false);

  /* ── editor phase — metadata ── */
  const [caption,    setCaption]   = useState('');
  const [hashtags,   setHashtags]  = useState('');
  const [location,   setLocation]  = useState('');
  const [music,      setMusic]     = useState(null);
  const [tags,       setTags]      = useState([]);
  const [textStickers, setTextStickers] = useState([]); // [{id,text,x,y}]

  /* ── editor overlay panels (slide up from bottom ON the media) ── */
  const [panel, setPanel] = useState(null); // null|'music'|'caption'|'location'|'tags'|'text'

  /* ── publish ── */
  const [publishing, setPublishing] = useState(false);
  const [pubError,   setPubError]   = useState('');

  /* ── music search ── */
  const [musicQ,       setMusicQ]      = useState('');
  const [musicRes,     setMusicRes]    = useState([]);
  const [musicLoading, setMusicLoading]= useState(false);
  const [playingUrl,   setPlayingUrl]  = useState(null);

  /* ── tag search ── */
  const [tagQ,       setTagQ]      = useState('');
  const [tagRes,     setTagRes]    = useState([]);
  const [tagLoading, setTagLoading]= useState(false);

  /* ── text sticker input ── */
  const [newText, setNewText] = useState('');

  /* ── emoji stickers ── */
  const EMOJIS = ['😊','🫣','😍','😘','🍺','😁','🔥','💯','✨','💜','🧡','💛','💚','💙','❤️','😂','😭','😎','🤔','👀','👍','👎','💪','🎉','🎵','💃','🕺','🌟','🌈','🍕'];

  const activeFilter = FILTERS.find(f => f.id === filterId) || FILTERS[0];

  /* ═══════════════════════════════════════════════════════════════════
     CAMERA
  ═══════════════════════════════════════════════════════════════════ */
  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async (f) => {
    stopStream();
    try {
      // Request highest quality camera: 1080p @ 60fps
      const s = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { ideal: f }, 
          width: { ideal: 1920 }, 
          height: { ideal: 1080 }, 
          frameRate: { ideal: 60 } 
        },
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      const vt = s.getVideoTracks()[0];
      if (vt?.getCapabilities) {
        const caps = vt.getCapabilities();
        const adv = {};
        if (caps.focusMode?.includes?.('continuous')) adv.focusMode = 'continuous';
        if (caps.exposureMode?.includes?.('continuous')) adv.exposureMode = 'continuous';
        if (Object.keys(adv).length) vt.applyConstraints({ advanced: [adv] }).catch(() => {});
      }
      streamRef.current = s;
      if (videoRef.current) { videoRef.current.srcObject = s; videoRef.current.play().catch(() => {}); }
      setCamErr(false);
    } catch { setCamErr(true); }
  }, [stopStream]);

  useEffect(() => {
    startCamera(facing);
    return () => { stopStream(); clearInterval(tickRef.current); cancelAnimationFrame(rafRef.current); };
  }, []); // eslint-disable-line

  // Beauty effects use CSS filters on video element (no canvas/face tracking)

  useEffect(() => {
    const t = streamRef.current?.getVideoTracks()[0];
    if (!t) return;
    const caps = t.getCapabilities?.();
    if (caps?.zoom) t.applyConstraints({ advanced: [{ zoom: Math.max(caps.zoom.min ?? 1, Math.min(zoom, caps.zoom.max ?? 4)) }] }).catch(() => {});
  }, [zoom]);

  /* Cycle to the next/prev effect within the active category (swipe l/r) */
  const cycleEffect = useCallback((dir) => {
    const list = EFFECTS.filter(f => f.cat === effectCat);
    const idx = list.findIndex(f => f.id === filterId);
    const base = idx === -1 ? 0 : idx;
    const next = (base + dir + list.length) % list.length;
    setFilterId(list[next].id);
  }, [effectCat, filterId]);

  const onPinchStart = (e) => {
    if (e.touches.length === 2) {
      pinchRef.current = Math.hypot(e.touches[1].clientX - e.touches[0].clientX, e.touches[1].clientY - e.touches[0].clientY);
      swipeRef.current = null;
    } else if (e.touches.length === 1) {
      swipeRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };
  const onPinchMove = (e) => {
    if (e.touches.length !== 2 || pinchRef.current === null) return;
    const d = Math.hypot(e.touches[1].clientX - e.touches[0].clientX, e.touches[1].clientY - e.touches[0].clientY);
    const delta = d - pinchRef.current;
    if (Math.abs(delta) > 4) { setZoom(z => Math.max(1, Math.min(z + delta * 0.01, 4))); pinchRef.current = d; }
  };
  const onTouchEndCapture = (e) => {
    // horizontal swipe → change effect (ignore while recording / multi-touch)
    if (!recording && swipeRef.current && e.changedTouches?.length) {
      const dx = e.changedTouches[0].clientX - swipeRef.current.x;
      const dy = e.changedTouches[0].clientY - swipeRef.current.y;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        cycleEffect(dx < 0 ? 1 : -1); // swipe left → next
      }
    }
    swipeRef.current = null;
    pinchRef.current = null;
  };
  const flip = () => {
    const nxt = facing === 'environment' ? 'user' : 'environment';
    setFacing(nxt); startCamera(nxt);
  };

  /* ═══════════════════════════════════════════════════════════════════
     RECORD / CAPTURE
  ═══════════════════════════════════════════════════════════════════ */
  const startRec = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    let recStream = streamRef.current;
    const cv = canvasRef.current; const vid = videoRef.current;
    if (cv && vid && activeFilter.css) {
      cv.width = vid.videoWidth || 1080; cv.height = vid.videoHeight || 1920;
      const ctx = cv.getContext('2d');
      const draw = () => {
        if (vid.readyState >= 2) {
          ctx.filter = activeFilter.css;
          if (facing === 'user') { ctx.save(); ctx.translate(cv.width,0); ctx.scale(-1,1); ctx.drawImage(vid,0,0,cv.width,cv.height); ctx.restore(); }
          else ctx.drawImage(vid,0,0,cv.width,cv.height);
        }
        rafRef.current = requestAnimationFrame(draw);
      };
      draw();
      const cs = cv.captureStream(60);
      streamRef.current.getAudioTracks().forEach(t => cs.addTrack(t));
      recStream = cs;
    }
    const types = ['video/mp4;codecs=avc1,mp4a.40.2','video/mp4','video/webm;codecs=vp9,opus','video/webm'];
    const mime = types.find(t => MediaRecorder.isTypeSupported(t)) || '';
    const rec = new MediaRecorder(recStream, { ...(mime ? { mimeType: mime } : {}), videoBitsPerSecond: 8_000_000, audioBitsPerSecond: 192_000 });
    rec.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    rec.onstop = () => {
      cancelAnimationFrame(rafRef.current);
      const am = rec.mimeType || mime || 'video/webm';
      const ext = am.includes('mp4') ? 'mp4' : 'webm';
      const blob = new Blob(chunksRef.current, { type: am });
      const file = new File([blob], `spicey.${ext}`, { type: am });
      const url = URL.createObjectURL(blob);
      stopStream();
      setVideoFile(file); setVideoUrl(url);
      setPhase('editor');
    };
    recRef.current = rec; rec.start(500);
    setRecording(true); setRecSec(0); setRecPct(0);
    const maxMs = (MODE_CONFIG[mode]?.maxSec || 60) * 1000;
    let elapsed = 0;
    tickRef.current = setInterval(() => {
      elapsed += 100;
      setRecSec(Math.floor(elapsed / 1000));
      setRecPct(Math.min((elapsed / maxMs) * 100, 100));
      if (elapsed >= maxMs) stopRec();
    }, 100);
  };

  const stopRec = () => {
    clearInterval(tickRef.current);
    if (recRef.current?.state === 'recording') recRef.current.stop();
    setRecording(false); setRecPct(0);
  };

  const capturePhoto = () => {
    const vid = videoRef.current;
    if (!vid || vid.readyState < 2) return;
    
    const cv = document.createElement('canvas');
    cv.width = vid.videoWidth || 1080; 
    cv.height = vid.videoHeight || 1920;
    const ctx = cv.getContext('2d');
    
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.filter = activeFilter.css || '';
    
    if (facing === 'user') { 
      ctx.save(); 
      ctx.translate(cv.width,0); 
      ctx.scale(-1,1); 
      ctx.drawImage(vid,0,0,cv.width,cv.height); 
      ctx.restore(); 
    } else {
      ctx.drawImage(vid,0,0,cv.width,cv.height);
    }
    
    const url = cv.toDataURL('image/jpeg', 0.92);
    
    setFlashEffect(true);
    setTimeout(() => setFlashEffect(false), 100);
    
    stopStream();
    setPhotoUrl(url); 
    setPhase('editor');
  };

  const onShutterDown = () => {
    if (mode === 'live') { stopStream(); onClose(); navigate('/live'); return; }
    if (mode === 'post') { capturePhoto(); return; }
    // STORY and REEL modes: start recording immediately on press
    if (mode === 'story' || mode === 'reel') {
      console.log('🎥 Starting video recording in', mode, 'mode');
      startRec();
    }
  };
  
  const onShutterUp = () => {
    console.log('🛑 Stopping recording, recording state:', recording);
    // Stop recording if we're recording
    if (recording) {
      stopRec();
    }
  };

  const onGallery = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    stopStream();
    if (file.type.startsWith('video')) {
      const url = URL.createObjectURL(file);
      setVideoFile(file); setVideoUrl(url); setPhase('editor');
    } else {
      const reader = new FileReader();
      reader.onload = ev => { setPhotoUrl(ev.target.result); setPhase('editor'); };
      reader.readAsDataURL(file);
    }
  };

  const retake = () => {
    setPhase('capture'); setVideoUrl(null); setVideoFile(null); setPhotoUrl(null);
    setCaption(''); setHashtags(''); setLocation(''); setMusic(null); setMuteOrig(false);
    setTags([]); setTextStickers([]); setPanel(null); setPubError('');
    startCamera(facing);
  };

  /* ═══════════════════════════════════════════════════════════════════
     MUSIC
  ═══════════════════════════════════════════════════════════════════ */
  const searchMusic = async (q) => {
    if (!q.trim()) return;
    setMusicLoading(true);
    try { const r = await base44.functions.invoke('searchMusic', { query: q }); setMusicRes(r.data?.results || []); } catch { setMusicRes([]); }
    setMusicLoading(false);
  };
  const togglePreview = (url) => {
    if (!url) return;
    if (playingUrl === url) { audioRef.current?.pause(); setPlayingUrl(null); return; }
    if (!audioRef.current) audioRef.current = new Audio();
    audioRef.current.pause(); audioRef.current.src = url;
    audioRef.current.play().catch(() => {}); audioRef.current.onended = () => setPlayingUrl(null);
    setPlayingUrl(url);
  };
  const pickMusic = (t) => {
    audioRef.current?.pause(); setPlayingUrl(null);
    setMusic({ title: t.trackName, artist: t.artistName, previewUrl: t.previewUrl, artworkUrl: t.artworkUrl60 });
    setMuteOrig(true); setPanel(null);
  };

  /* ═══════════════════════════════════════════════════════════════════
     TAG SEARCH
  ═══════════════════════════════════════════════════════════════════ */
  const searchTags = async (q) => {
    if (!q.trim()) return;
    setTagLoading(true);
    try { const r = await base44.functions.invoke('searchUsers', { query: q }); setTagRes(Array.isArray(r.data) ? r.data : (r.data?.users || [])); } catch { setTagRes([]); }
    setTagLoading(false);
  };
  const toggleTag = (u) => setTags(prev => prev.find(t => t.username === u.username) ? prev.filter(t => t.username !== u.username) : [...prev, u]);

  /* ═══════════════════════════════════════════════════════════════════
     PUBLISH
  ═══════════════════════════════════════════════════════════════════ */
  const publish = async () => {
    setPublishing(true); setPubError('');
    try {
      const user = await base44.auth.me();
      if (!user) throw new Error('Please log in first');
      const profs = await base44.entities.UserProfile.filter({ user_id: user.id }).catch(() => []);
      const p = profs[0] || {};
      const name = p.full_name || user.full_name || 'User';
      const username = p.username || user.email?.split('@')[0] || 'user';
      const avatar = p.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

      let finalVideoUrl = null, finalImageUrl = null;
      if (videoFile) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: videoFile });
        finalVideoUrl = file_url;
        try { const cf = await base44.functions.invoke('uploadToCloudflare', { video_url: file_url }); if (cf?.data?.hls_url) finalVideoUrl = cf.data.hls_url; } catch {}
      } else if (photoUrl) {
        const blob = await fetch(photoUrl).then(r => r.blob());
        const f = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
        const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
        finalImageUrl = file_url;
      }
      const tagStr = tags.map(u => `@${u.username}`).join(' ');
      const tagList = hashtags.split(/[,#\s]+/).map(t => t.trim()).filter(Boolean);
      await base44.entities.Post.create({
        author_id: user.id, author_name: name, author_username: username, author_avatar: avatar,
        caption: [caption.trim(), tagStr].filter(Boolean).join(' '),
        post_type: finalVideoUrl ? (mode === 'story' ? 'story' : 'reel') : 'feed',
        video_url: finalVideoUrl || '', image_url: finalImageUrl || '',
        hashtags: tagList, location: location.trim(),
        map_visible: false, map_city: '',
        music_title: music?.title || '', music_artist: music?.artist || '',
        music_preview_url: music?.previewUrl || '', music_artwork_url: music?.artworkUrl || '',
        tags: tagStr,
        likes_count: 0, fire_count: 0, wow_count: 0, comments_count: 0, shares_count: 0,
      });
      qc.invalidateQueries({ queryKey: ['posts'] });
      qc.invalidateQueries({ queryKey: ['spicey-reels-feed-v8'] });
      stopStream(); onClose();
      navigate(finalVideoUrl ? '/reels' : '/');
    } catch (err) { setPubError(err?.message || 'Failed to post. Try again.'); }
    setPublishing(false);
  };

  /* ═══════════════════════════════════════════════════════════════════
     RENDER — PHASE 1: CAPTURE  (Instagram camera layout from screenshots)
  ═══════════════════════════════════════════════════════════════════ */
  if (phase === 'capture') {
    const ringDash = C * (recPct / 100);
    return (
      <div className="fixed inset-0 z-[70] bg-black overflow-hidden select-none"
        data-prevent-light-mode="true"
        onTouchStart={onPinchStart} onTouchMove={onPinchMove} onTouchEnd={onTouchEndCapture}>

        <canvas ref={canvasRef} className="hidden" />

        {/* ── Camera feed — hidden when beauty canvas is active ── */}
        {camErr ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black">
            <p className="text-white/40 text-sm">Camera not available</p>
            <label className="px-6 py-3 rounded-full text-white text-sm font-bold cursor-pointer" style={{ background: 'linear-gradient(135deg,#ff4400,#e91e8c)' }}>
              Choose from Gallery
              <input type="file" accept="image/*,video/*" className="hidden" onChange={onGallery} />
            </label>
          </div>
        ) : null}

        {/* Camera preview - NO blur/filters by default for sharp image */}
        <video ref={videoRef} autoPlay playsInline muted
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            filter: activeFilter.css || 'none',
            transform: facing === 'user' ? 'scaleX(-1)' : 'none',
            opacity: 1,
          }}
        />

        {/* Soft vignette gradients */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 18%, transparent 75%, rgba(0,0,0,0.65) 100%)' }} />

        {/* Flash effect — white screen flash when taking photo */}
        {flashEffect && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="absolute inset-0 z-[71] pointer-events-none"
            style={{ background: 'white' }}
          />
        )}




        {/* ── TOP BAR ── Only close button */}
        <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-end px-4"
          style={{ paddingTop: 'max(14px, env(safe-area-inset-top))' }}>
          <button onClick={() => { stopStream(); onClose(); }}
            style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Recording timer badge */}
        {recording && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-4 py-1.5 rounded-full"
            style={{ top: 'max(50px, env(safe-area-inset-top, 44px))', background: 'rgba(210,20,20,0.9)' }}>
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-white text-xs font-bold tracking-widest">
              {String(Math.floor(recSec / 60)).padStart(2,'0')}:{String(recSec % 60).padStart(2,'0')}
            </span>
          </div>
        )}

        {/* right-side tools consolidated into top bar */}





        {/* ── BOTTOM CONTROLS ── */}
        <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col items-center"
          style={{ paddingBottom: 'max(20px, calc(env(safe-area-inset-bottom) + 8px))' }}>

          {/* Mode tabs */}
          {!recording && (
            <div className="flex items-center justify-center gap-7 mb-6">
              {MODES.map(m => (
                <button key={m} onClick={() => setMode(m)} className="relative pb-0.5 active:scale-95 transition-transform">
                  <span className="text-sm font-bold tracking-widest"
                    style={{ color: mode === m ? '#fff' : 'rgba(255,255,255,0.38)', textShadow: '0 1px 8px rgba(0,0,0,0.9)' }}>
                    {MODE_CONFIG[m].label}
                  </span>
                  {mode === m && (
                    <motion.div layoutId="mode-bar"
                      className="absolute -bottom-0.5 left-0 right-0 h-[2.5px] rounded-full bg-white"
                      transition={{ type: 'spring', damping: 24, stiffness: 340 }} />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Gallery | Shutter | Effects — clean 3-button row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingLeft: 32, paddingRight: 32 }}>

            {/* Gallery - Circular button, transparent pink color */}
            <label style={{ cursor: 'pointer' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', border: 'none', background: 'linear-gradient(135deg, rgba(233,30,140,0.5), rgba(194,24,91,0.5))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, backdropFilter: 'blur(8px)', boxShadow: '0 2px 8px rgba(233,30,140,0.3)' }}>
                {lastPhoto
                  ? <img src={lastPhoto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                  : <svg viewBox="0 0 24 24" width="18" height="18" fill="rgba(255,255,255,0.9)"><path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM8.5 7a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM5 17l4.5-5.5 3 3.5 4-5 5 7H5z"/></svg>}
              </div>
              <input type="file" accept="image/*,video/*" className="hidden" onChange={onGallery} />
            </label>

            {/* SHUTTER - Centered */}
            <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', width: 84, height: 84, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {recording && (
                <motion.div style={{ position: 'absolute', width: 84, height: 84, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,20,147,0.45) 0%, transparent 70%)' }}
                  animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.1, repeat: Infinity }} />
              )}
              <svg style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)', pointerEvents: 'none', zIndex: 1 }} width="84" height="84" viewBox="0 0 84 84">
                <defs>
                  <linearGradient id="recRingGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff5500" /><stop offset="50%" stopColor="#ff1493" /><stop offset="100%" stopColor="#a733ff" />
                  </linearGradient>
                </defs>
                <circle cx="42" cy="42" r={R} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
                {recording && (
                  <circle cx="42" cy="42" r={R} fill="none" stroke="url(#recRingGrad2)" strokeWidth="7"
                    strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C - ringDash}
                    style={{ transition: 'stroke-dashoffset 0.1s linear', filter: 'drop-shadow(0 0 12px rgba(255,20,147,1))' }} />
                )}
              </svg>
              <button
                onMouseDown={onShutterDown} onMouseUp={onShutterUp}
                onTouchStart={e => { e.preventDefault(); onShutterDown(); }}
                onTouchEnd={e => { e.preventDefault(); onShutterUp(); }}
                style={{
                  width: 66, height: 66, borderRadius: '50%', zIndex: 2, border: 'none', cursor: 'pointer',
                  background: recording ? 'linear-gradient(135deg,#ff1493,#e91e8c)' : 'white',
                  boxShadow: recording ? '0 0 18px rgba(255,20,147,0.7)' : '0 2px 10px rgba(0,0,0,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.3s, box-shadow 0.3s',
                }}>
                <div style={{
                  width: recording ? 24 : 54, height: recording ? 24 : 54,
                  borderRadius: recording ? '6px' : '50%', background: 'white',
                  transition: 'all 0.25s ease',
                }} />
              </button>
            </div>

            {/* Flip camera button - bottom right with camera icon */}
            <button onClick={flip}
              style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer' }}>
              <Camera className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.85)' }} />
            </button>
          </div>
        </div>

        {/* ── EFFECTS BOTTOM SHEET ── */}
        <AnimatePresence>
          {effectsOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50 }}
                onClick={() => setEffectsOpen(false)} />
              <motion.div
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 32, stiffness: 350 }}
                style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 51, borderRadius: '24px 24px 0 0', background: 'rgba(12,6,20,0.97)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.08)', borderBottom: 'none', paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}
                onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4 }}>
                  <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.18)' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 12px' }}>
                  <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>✨ Beauty Effects</span>
                  <button onClick={() => setEffectsOpen(false)} style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
                {/* Effects bottom sheet content removed — using CSS filter effects from EFFECTS array instead */}
                <div style={{ padding: '24px 20px', textAlign: 'center' }}>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Beauty effects use CSS filters — swipe left/right on camera to change</p>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════════
     RENDER — PHASE 2: EDITOR
     Media fills 100% of screen. ALL tools float on top.
     No new page. No scrollable form. No header nav bar.
     Exactly Instagram Stories after capture.
  ═══════════════════════════════════════════════════════════════════ */
  return (
    <div className="fixed inset-0 z-[70] bg-black overflow-hidden select-none" data-prevent-light-mode="true">

      {/* ── FULL-SCREEN MEDIA ── */}
      {videoUrl ? (
        <video src={videoUrl} autoPlay loop playsInline muted={muteOrig}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: activeFilter.css || undefined }} />
      ) : photoUrl ? (
        <img src={photoUrl} alt="" className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: activeFilter.css || undefined }} />
      ) : null}

      {/* Live effect overlay persists on the captured media */}
      <EffectOverlay type={activeFilter.overlay} />

      {/* Gradient for readability */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 25%, transparent 72%, rgba(0,0,0,0.5) 100%)' }} />

      {/* ── Text stickers on media ── */}
      {textStickers.map(s => (
        <div key={s.id} className="absolute z-20 pointer-events-none"
          style={{ left: `${s.x}%`, top: `${s.y}%`, transform: 'translate(-50%,-50%)' }}>
          <p className="text-white font-bold text-xl px-3 py-1 rounded-lg text-center"
            style={{ textShadow: '0 2px 12px rgba(0,0,0,0.9)', background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}>
            {s.text}
          </p>
        </div>
      ))}

      {/* Music sticker */}
      {music && (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="absolute z-20 top-[35%] left-1/2 -translate-x-1/2"
          style={{ pointerEvents: 'none' }}>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <Music2 className="w-3.5 h-3.5 text-white" />
            <span className="text-white text-xs font-bold">{music.title}</span>
          </div>
        </motion.div>
      )}

      {/* Location sticker */}
      {location && (
        <div className="absolute z-20 top-[28%] left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full pointer-events-none"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
          <MapPin className="w-3 h-3 text-red-400" />
          <span className="text-white text-xs font-bold">{location}</span>
        </div>
      )}

      {/* Error */}
      {pubError && (
        <div className="absolute top-20 left-4 right-4 z-30 px-4 py-2.5 rounded-2xl text-sm text-red-200 text-center"
          style={{ background: 'rgba(200,20,20,0.8)', backdropFilter: 'blur(10px)' }}>
          ⚠️ {pubError}
        </div>
      )}

      {/* ── TOP BAR: X | "Your story" button — exactly Instagram Stories ── */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4"
        style={{ paddingTop: 'max(50px, env(safe-area-inset-top, 44px))' }}>
        <button onClick={retake}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.42)', backdropFilter: 'blur(10px)' }}>
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Mute audio pill */}
        {videoUrl && (
          <button onClick={() => setMuteOrig(m => !m)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(0,0,0,0.42)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)' }}>
            {muteOrig ? <VolumeX className="w-3.5 h-3.5 text-white" /> : <Volume2 className="w-3.5 h-3.5 text-white" />}
            <span className="text-white text-xs font-semibold">{muteOrig ? 'Muted' : 'Sound'}</span>
          </button>
        )}

        {/* Post button — top right, like Instagram "Your story" */}
        <button onClick={publish} disabled={publishing}
          className="flex items-center gap-1.5 px-5 py-2 rounded-full text-white text-sm font-bold active:scale-95 transition-transform disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg,#ff4400,#e91e8c)', boxShadow: '0 0 18px rgba(255,60,0,0.5)' }}>
          {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-3.5 h-3.5" /> Post</>}
        </button>
      </div>

      {/* ── LEFT SIDE FLOATING TOOLS — exactly Instagram Stories editor ── */}
      <div className="absolute right-4 z-30 flex flex-col items-center gap-6"
        style={{ top: '50%', transform: 'translateY(-50%)' }}>

        {/* Text */}
        <button onClick={() => setPanel('text')} className="flex flex-col items-center gap-1 active:scale-90 transition-transform">
          <div className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.42)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.18)' }}>
            <Type className="w-5 h-5 text-white" />
          </div>
          <span className="text-white text-[9px] font-semibold" style={{ textShadow: '0 1px 4px #000' }}>Text</span>
        </button>

        {/* Music */}
        <button onClick={() => { setPanel('music'); if (musicRes.length === 0) searchMusic('top hits 2025'); }}
          className="flex flex-col items-center gap-1 active:scale-90 transition-transform">
          <div className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: music ? 'rgba(233,30,140,0.6)' : 'rgba(0,0,0,0.42)', backdropFilter: 'blur(10px)', border: `1px solid ${music ? 'rgba(233,30,140,0.8)' : 'rgba(255,255,255,0.18)'}` }}>
            <Music2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-white text-[9px] font-semibold" style={{ textShadow: '0 1px 4px #000' }}>Music</span>
        </button>

        {/* Location */}
        <button onClick={() => setPanel('location')} className="flex flex-col items-center gap-1 active:scale-90 transition-transform">
          <div className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: location ? 'rgba(6,182,212,0.5)' : 'rgba(0,0,0,0.42)', backdropFilter: 'blur(10px)', border: `1px solid ${location ? 'rgba(6,182,212,0.7)' : 'rgba(255,255,255,0.18)'}` }}>
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <span className="text-white text-[9px] font-semibold" style={{ textShadow: '0 1px 4px #000' }}>Location</span>
        </button>

        {/* Tag */}
        <button onClick={() => setPanel('tags')} className="flex flex-col items-center gap-1 active:scale-90 transition-transform">
          <div className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: tags.length ? 'rgba(168,85,247,0.5)' : 'rgba(0,0,0,0.42)', backdropFilter: 'blur(10px)', border: `1px solid ${tags.length ? 'rgba(168,85,247,0.7)' : 'rgba(255,255,255,0.18)'}` }}>
            <AtSign className="w-5 h-5 text-white" />
          </div>
          <span className="text-white text-[9px] font-semibold" style={{ textShadow: '0 1px 4px #000' }}>Tag</span>
        </button>
      </div>

      {/* ── BOTTOM: caption pill + post button — Instagram-style ── */}
      <div className="absolute bottom-0 left-0 right-0 z-30 px-4"
        style={{ paddingBottom: 'max(24px, calc(env(safe-area-inset-bottom, 16px) + 8px))' }}>
        {/* Caption tap-to-edit */}
        <button onClick={() => setPanel('caption')} className="w-full flex items-center gap-2 px-4 py-3 rounded-full mb-3"
          style={{ background: 'rgba(0,0,0,0.42)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <span className="text-white/60 text-sm flex-1 text-left truncate">
            {caption || 'Add a caption, hashtags…'}
          </span>
          <Hash className="w-4 h-4 text-white/40 flex-shrink-0" />
        </button>

        {/* Full-width post button */}
        <motion.button whileTap={{ scale: 0.97 }} onClick={publish} disabled={publishing}
          className="w-full py-3.5 rounded-full text-white font-bold text-base flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg,#ff4400,#e91e8c)', boxShadow: '0 0 24px rgba(255,60,0,0.4)' }}>
          {publishing ? <><Loader2 className="w-5 h-5 animate-spin" /> Uploading…</> : <><Send className="w-5 h-5" /> Post Now</>}
        </motion.button>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          OVERLAY PANELS — slide up FROM BOTTOM, on top of media.
          No new page. Background media is always visible.
      ════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {panel && (
          <>
            {/* Dim overlay behind panel */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-40" style={{ background: 'rgba(0,0,0,0.55)' }}
              onClick={() => setPanel(null)} />

            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 350 }}
              className="absolute bottom-0 left-0 right-0 z-50 rounded-t-3xl"
              style={{
                background: 'rgba(10,5,18,0.97)',
                backdropFilter: 'blur(30px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderBottom: 'none',
                maxHeight: '75vh',
                display: 'flex',
                flexDirection: 'column',
                paddingBottom: 'max(20px, env(safe-area-inset-bottom, 16px))',
              }}
              onClick={e => e.stopPropagation()}>

              {/* Handle */}
              <div className="flex justify-center pt-3 pb-0 flex-shrink-0">
                <div className="w-9 h-1 rounded-full bg-white/20" />
              </div>

              {/* Panel header */}
              <div className="flex items-center justify-between px-5 py-3 flex-shrink-0">
                <span className="text-white font-bold text-sm">
                  {panel === 'music' && '🎵 Add Music'}
                  {panel === 'caption' && '✏️ Caption & Tags'}
                  {panel === 'location' && '📍 Location'}
                  {panel === 'tags' && '👥 Tag People'}
                  {panel === 'text' && '✏️ Add Text'}
                </span>
                <button onClick={() => setPanel(null)}
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
              <div className="h-px mx-5 mb-3" style={{ background: 'rgba(255,255,255,0.07)' }} />

              {/* ── CAPTION PANEL ── */}
              {panel === 'caption' && (
                <div className="flex-1 overflow-y-auto px-5 pb-2 flex flex-col gap-3">
                  <textarea value={caption} onChange={e => setCaption(e.target.value)}
                    placeholder="Write a caption…" rows={3} autoFocus
                    className="w-full rounded-2xl px-4 py-3 text-white text-sm outline-none resize-none placeholder:text-white/30"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 15 }} />
                  <div className="flex items-center gap-2 px-4 py-3 rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Hash className="w-4 h-4 text-white/30 flex-shrink-0" />
                    <input value={hashtags} onChange={e => setHashtags(e.target.value)}
                      placeholder="#trending #viral" className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/25"
                      style={{ fontSize: 15 }} />
                  </div>
                  <button onClick={() => setPanel(null)}
                    className="w-full py-3 rounded-2xl text-white font-bold text-sm mt-1"
                    style={{ background: 'linear-gradient(135deg,#ff4400,#e91e8c)' }}>
                    Done ✓
                  </button>
                </div>
              )}

              {/* ── MUSIC PANEL ── */}
              {panel === 'music' && (
                <div className="flex-1 overflow-y-auto px-5 pb-2 flex flex-col gap-3">
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-2xl"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <Search className="w-4 h-4 text-white/30 flex-shrink-0" />
                      <input value={musicQ}
                        onChange={e => { setMusicQ(e.target.value); if (e.target.value.length > 1) searchMusic(e.target.value); }}
                        placeholder="Search artist or song…"
                        className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/30"
                        style={{ fontSize: 15 }} />
                    </div>
                    <button onClick={() => searchMusic(musicQ || 'top hits 2025')}
                      className="px-4 py-2.5 rounded-2xl text-white text-sm font-semibold flex-shrink-0"
                      style={{ background: 'rgba(233,30,140,0.4)', border: '1px solid rgba(233,30,140,0.5)' }}>
                      {musicLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Go'}
                    </button>
                  </div>
                  {music && (
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl"
                      style={{ background: 'rgba(233,30,140,0.12)', border: '1px solid rgba(233,30,140,0.4)' }}>
                      <Music2 className="w-4 h-4 text-pink-400 flex-shrink-0" />
                      <span className="text-white text-sm font-semibold flex-1 truncate">{music.title}</span>
                      <button onClick={() => setMusic(null)} className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(220,20,20,0.7)' }}>
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  )}
                  <div className="flex flex-col gap-1.5">
                    {musicRes.map((t, i) => {
                      const playing = playingUrl === t.previewUrl;
                      return (
                        <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-2xl"
                          style={{ background: 'rgba(255,255,255,0.04)' }}>
                          {t.artworkUrl60
                            ? <img src={t.artworkUrl60} className="w-10 h-10 rounded-xl flex-shrink-0 object-cover" alt="" />
                            : <div className="w-10 h-10 rounded-xl bg-pink-900/40 flex items-center justify-center flex-shrink-0"><Music2 className="w-4 h-4 text-pink-400" /></div>}
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold text-sm truncate">{t.trackName}</p>
                            <p className="text-white/40 text-xs truncate">{t.artistName}</p>
                          </div>
                          {t.previewUrl && (
                            <button onClick={() => togglePreview(t.previewUrl)}
                              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ background: playing ? 'rgba(233,30,140,0.8)' : 'rgba(255,255,255,0.1)' }}>
                              {playing ? <Pause className="w-3.5 h-3.5 text-white" /> : <Play className="w-3.5 h-3.5 text-white ml-0.5" />}
                            </button>
                          )}
                          <button onClick={() => pickMusic(t)}
                            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: music?.title === t.trackName ? '#e91e8c' : 'rgba(255,255,255,0.1)' }}>
                            <Check className="w-3.5 h-3.5 text-white" />
                          </button>
                        </div>
                      );
                    })}
                    {musicLoading && <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 text-pink-400 animate-spin" /></div>}
                  </div>
                </div>
              )}

              {/* ── LOCATION PANEL ── */}
              {panel === 'location' && (
                <div className="flex-1 px-5 pb-2 flex flex-col gap-3">
                  <div className="flex items-center gap-2 px-3 py-3 rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <MapPin className="w-4 h-4 text-white/30 flex-shrink-0" />
                    <input value={location} onChange={e => setLocation(e.target.value)}
                      placeholder="City, country or venue…" autoFocus
                      className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/30"
                      style={{ fontSize: 15 }} />
                    {location && <button onClick={() => setPanel(null)}><Check className="w-4 h-4 text-green-400" /></button>}
                  </div>
                  <button onClick={() => navigator.geolocation?.getCurrentPosition(async pos => {
                    try {
                      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
                      const d = await r.json();
                      setLocation([d.address?.city || d.address?.town || '', d.address?.country || ''].filter(Boolean).join(', '));
                      setPanel(null);
                    } catch {}
                  }, () => {})}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                    style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)' }}>
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    <span className="text-cyan-300 text-sm font-semibold">Use current location</span>
                  </button>
                </div>
              )}

              {/* ── TAGS PANEL ── */}
              {panel === 'tags' && (
                <div className="flex-1 overflow-y-auto px-5 pb-2 flex flex-col gap-3">
                  {tags.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {tags.map(u => (
                        <div key={u.username} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                          style={{ background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.4)' }}>
                          <span className="text-purple-200 text-xs font-semibold">@{u.username}</span>
                          <button onClick={() => toggleTag(u)}><X className="w-3 h-3 text-purple-400" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Search className="w-4 h-4 text-white/30 flex-shrink-0" />
                    <input value={tagQ}
                      onChange={e => { setTagQ(e.target.value); if (e.target.value.length > 1) searchTags(e.target.value); }}
                      placeholder="Search users…" autoFocus
                      className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/30"
                      style={{ fontSize: 15 }} />
                  </div>
                  <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto">
                    {tagRes.map((u, i) => {
                      const sel = !!tags.find(t => t.username === u.username);
                      return (
                        <button key={i} onClick={() => toggleTag(u)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-2xl"
                          style={{ background: sel ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.04)', border: sel ? '1px solid rgba(168,85,247,0.5)' : '1px solid transparent' }}>
                          <img src={u.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.username)}&background=7c3aed&color=fff&size=40`}
                            className="w-9 h-9 rounded-full flex-shrink-0 object-cover" alt="" />
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-white text-sm font-semibold truncate">{u.full_name || u.username}</p>
                            <p className="text-white/40 text-xs">@{u.username}</p>
                          </div>
                          {sel && <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />}
                        </button>
                      );
                    })}
                    {tagLoading && <div className="flex justify-center py-3"><Loader2 className="w-4 h-4 text-purple-400 animate-spin" /></div>}
                  </div>
                </div>
              )}

              {/* ── TEXT STICKER PANEL ── */}
              {panel === 'text' && (
                <div className="flex-1 px-5 pb-2 flex flex-col gap-3">
                  <input value={newText} onChange={e => setNewText(e.target.value)}
                    placeholder="Type text to place on media…" autoFocus
                    className="w-full rounded-2xl px-4 py-3 text-white text-sm outline-none placeholder:text-white/30"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 16 }} />
                  <button
                    onClick={() => {
                      if (!newText.trim()) return;
                      setTextStickers(s => [...s, { id: Date.now(), text: newText.trim(), x: 50, y: 40 }]);
                      setNewText(''); setPanel(null);
                    }}
                    className="w-full py-3 rounded-2xl text-white font-bold text-sm"
                    style={{ background: 'linear-gradient(135deg,#ff4400,#e91e8c)' }}>
                    Add to Photo ✓
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}