import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PhoneOff, Mic, MicOff, Video, VideoOff, Volume2, RefreshCw, Sparkles, ChevronDown, MessageCircle, MoreHorizontal } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { CallKitAPI } from '@/lib/callkit';

const TURN_URLS = (import.meta.env.VITE_TURN_URLS || import.meta.env.VITE_TURN_URL || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    ...(TURN_URLS.length ? [{
      urls: TURN_URLS,
      username: import.meta.env.VITE_TURN_USERNAME || '',
      credential: import.meta.env.VITE_TURN_CREDENTIAL || '',
    }] : []),
  ],
  iceCandidatePoolSize: 8,
};

async function fetchSession(id) {
  try {
    const session = await base44.entities.CallSession.filter({ id }, '-created_date', 1);
    return session[0] || null;
  } catch (e) {
    console.warn('[RTC] fetchSession error:', e);
    return null;
  }
}

// Batch ICE candidates to reduce DB writes — flush every 800ms
const iceBatchRef = { current: [] };
const iceFlushTimerRef = { current: null };

async function flushIceBatch(id, field, batch) {
  if (!batch.length) return;
  try {
    const session = await fetchSession(id);
    if (!session) return;
    const existing = session[field] || [];
    await base44.entities.CallSession.update(id, {
      [field]: [...existing, ...batch.map(c => JSON.stringify(c))]
    });
  } catch(e) { console.warn('[RTC] flushIce error:', e); }
}

function queueIce(id, field, candidate, flushFn) {
  iceBatchRef.current.push(candidate);
  clearTimeout(iceFlushTimerRef.current);
  iceFlushTimerRef.current = setTimeout(() => {
    const batch = iceBatchRef.current.splice(0);
    if (batch.length) flushFn(id, field, batch);
  }, 800);
}

// Ring tone using a shared AudioContext (avoids creating new ctx per ring)
let ringCtx = null;
function ringOnce() {
  try {
    if (!ringCtx || ringCtx.state === 'closed') {
      ringCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = ringCtx;
    if (ctx.state === 'suspended') ctx.resume();
    [480, 620].forEach((freq, i) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = freq; osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.1);
      osc.start(ctx.currentTime + i * 0.04); osc.stop(ctx.currentTime + 1.1);
    });
  } catch(e) {}
}

export default function CallSheet({ open, onClose, convo, isVideo, isIncoming = false, callSession = null }) {
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [speakerEnabled, setSpeakerEnabled] = useState(false);
  const [connected, setConnected] = useState(false);
  const [phase, setPhase] = useState('init');
  const [facingMode, setFacingMode] = useState('user');
  const [fireParticles, setFireParticles] = useState([]);
  const [showEnhance, setShowEnhance] = useState(false);
  const [activeEnhance, setActiveEnhance] = useState(null);
  const [showReaction, setShowReaction] = useState(false);
  const [floatingReaction, setFloatingReaction] = useState(null);

  const ringRef = useRef(null);
  const timerRef = useRef(null);
  const pollRef = useRef(null);
  const callTimeoutRef = useRef(null);
  const localStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const sidRef = useRef(callSession?.id);
  const appliedIceRef = useRef(0);
  const setupDoneRef = useRef(false);
  const connectedSavedRef = useRef(false);

  const formatTime = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const stopAll = () => {
    clearInterval(ringRef.current);
    clearInterval(timerRef.current);
    clearInterval(pollRef.current);
    clearTimeout(callTimeoutRef.current);
    clearTimeout(iceFlushTimerRef.current);
    iceBatchRef.current = [];
    if (pcRef.current) { try { pcRef.current.close(); } catch(e) {} pcRef.current = null; }
    if (localStreamRef.current) { localStreamRef.current.getTracks().forEach(t => t.stop()); localStreamRef.current = null; }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    appliedIceRef.current = 0;
    setupDoneRef.current = false;
    connectedSavedRef.current = false;
    setDuration(0); setConnected(false); setPhase('init');
  };

  const markConnected = async () => {
    if (connectedSavedRef.current) {
      setConnected(true);
      setPhase('connected');
      return;
    }
    connectedSavedRef.current = true;
    clearInterval(ringRef.current);
    setConnected(true); setPhase('connected');
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    if (sidRef.current) {
      base44.entities.CallSession.update(sidRef.current, {
        status: 'connected',
        connected_at: new Date().toISOString()
      }).catch(() => {});
    }
  };

  const handleClose = async () => {
    const sid = sidRef.current;
    try {
      if (sid) {
        await base44.entities.CallSession.update(sid, {
          status: 'ended',
          ended_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('[RTC] Failed to publish terminal call state:', error);
    } finally {
      stopAll();
      onClose();
    }
  };

  useEffect(() => {
    if (!open || !callSession?.id) return;
    sidRef.current = callSession.id;
    setupDoneRef.current = false;

    const run = async () => {
       // 1. Get media with iOS audio constraints (earpiece by default)
       let stream;
       try {
         const audioConstraints = {
           echoCancellation: true,
           noiseSuppression: true,
           autoGainControl: true,
         };

         stream = await navigator.mediaDevices.getUserMedia(
           isVideo
             ? { video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } }, audio: audioConstraints }
             : { audio: audioConstraints }
         ).catch(err => {
           // Fallback: try without speakerphone constraint
           console.log('[RTC] iOS speakerphone constraint not supported, using basic audio');
           return navigator.mediaDevices.getUserMedia(
             isVideo 
               ? { video: { facingMode: 'user' }, audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } } 
               : { audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } }
           );
         });
       } catch(err) {
         console.error('[RTC] getUserMedia failed:', err);
         setPhase('error');
         return;
       }

       localStreamRef.current = stream;
       if (localVideoRef.current && isVideo) localVideoRef.current.srcObject = stream;

       // Voice calls use the receiver by default; video calls use speaker.
       const initialSpeaker = Boolean(isVideo);
       setSpeakerEnabled(initialSpeaker);
       CallKitAPI.setAudioRoute(initialSpeaker ? 'speaker' : 'earpiece', isVideo)
         .then(result => {
           if (!result.success) console.warn('[RTC] Native audio route unavailable:', result.error);
         });

       console.log(`[RTC] Audio stream setup complete (${initialSpeaker ? 'speaker' : 'earpiece'} mode)`);

      // 2. Create peer connection with audio output constraints (earpiece by default)
      const pc = new RTCPeerConnection(ICE_SERVERS);
      pcRef.current = pc;
      stream.getTracks().forEach(t => pc.addTrack(t, stream));

      pc.ontrack = (e) => {
        console.log('[RTC] ontrack', e.track.kind);
        if (e.streams[0]) {
          remoteVideoRef.current.srcObject = e.streams[0];
          // Ensure audio is NOT muted and volume is full (earpiece by default)
          remoteVideoRef.current.muted = false;
          remoteVideoRef.current.volume = 1.0;
          // Start playback with user gesture override
          remoteVideoRef.current.play().catch(() => console.log('[RTC] Remote audio autoplay blocked'));
          console.log('[RTC] Remote audio stream connected (earpiece mode, volume 100%)');
        }
      };

      pc.oniceconnectionstatechange = () => {
        console.log('[RTC] ICE:', pc.iceConnectionState);
        if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
          markConnected();
        }
      };
      pc.onconnectionstatechange = () => {
        console.log('[RTC] PC:', pc.connectionState);
        if (pc.connectionState === 'connected') markConnected();
        if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
          setPhase('connecting');
        }
      };

      // Trickle ICE — save each candidate as it arrives
      pc.onicecandidate = (e) => {
        if (e.candidate) {
          const field = isIncoming ? 'receiver_ice' : 'caller_ice';
          queueIce(sidRef.current, field, e.candidate, flushIceBatch);
        }
      };

      if (!isIncoming) {
        // ── CALLER: create offer, save it, poll for answer ──
        setPhase('calling');
        ringOnce();
        ringRef.current = setInterval(ringOnce, 3400);
        callTimeoutRef.current = setTimeout(async () => {
          if (connectedSavedRef.current || !sidRef.current) return;
          try {
            await base44.entities.CallSession.update(sidRef.current, {
              status: 'missed',
              ended_at: new Date().toISOString()
            });
          } catch (error) {
            console.error('[RTC] Failed to mark unanswered call as missed:', error);
          } finally {
            stopAll();
            onClose();
          }
        }, 55000);

        const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: isVideo });
        await pc.setLocalDescription(offer);
        console.log('[RTC] Caller: saving offer');
        await base44.entities.CallSession.update(callSession.id, {
          offer_sdp: JSON.stringify(pc.localDescription)
        });

        // Poll for answer + receiver ICE (increased interval to reduce DB load)
        let lastAnswerSdp = '';
        let lastIceCount = 0;
        
        pollRef.current = setInterval(async () => {
          if (pc.connectionState === 'closed') return;
          const s = await fetchSession(sidRef.current);
          if (!s) return;

          if (['ended', 'declined', 'missed', 'cancelled'].includes(s.status)) { stopAll(); onClose(); return; }

          // Apply answer once (check if changed to avoid re-applying)
          if (s.answer_sdp && s.answer_sdp !== lastAnswerSdp && pc.signalingState === 'have-local-offer') {
            lastAnswerSdp = s.answer_sdp;
            try {
              console.log('[RTC] Caller: applying answer');
              await pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(s.answer_sdp)));
              setPhase('connecting');
            } catch(e) { console.error('[RTC] Set answer error:', e); }
          }

          // Apply new receiver ICE candidates (only if count changed)
          if (pc.remoteDescription && s.receiver_ice?.length > lastIceCount) {
            const newOnes = s.receiver_ice.slice(lastIceCount);
            for (const c of newOnes) {
              try { await pc.addIceCandidate(new RTCIceCandidate(JSON.parse(c))); } catch(e) {}
            }
            console.log('[RTC] Caller: applied', newOnes.length, 'receiver ICE');
            lastIceCount = s.receiver_ice.length;
          }
        }, 1000);

      } else {
        // ── RECEIVER: poll for offer, send answer ──
        setPhase('connecting');

        let lastOfferSdp = '';
        let lastCallerIceCount = 0;
        
        pollRef.current = setInterval(async () => {
          if (pc.connectionState === 'closed') return;
          const s = await fetchSession(sidRef.current);
          if (!s) return;

          if (['ended', 'declined', 'missed', 'cancelled'].includes(s.status)) { stopAll(); onClose(); return; }

          // Apply offer + create answer (once, when in stable state)
          if (!setupDoneRef.current && s.offer_sdp && s.offer_sdp !== lastOfferSdp && pc.signalingState === 'stable') {
            lastOfferSdp = s.offer_sdp;
            setupDoneRef.current = true;
            try {
              console.log('[RTC] Receiver: applying offer');
              await pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(s.offer_sdp)));

              // Apply any already-arrived caller ICE before creating answer
              if (s.caller_ice?.length > 0) {
                for (const c of s.caller_ice) {
                  try { await pc.addIceCandidate(new RTCIceCandidate(JSON.parse(c))); } catch(e) {}
                }
                lastCallerIceCount = s.caller_ice.length;
                console.log('[RTC] Receiver: applied', s.caller_ice.length, 'early caller ICE');
              }

              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              console.log('[RTC] Receiver: saving answer');
              await base44.entities.CallSession.update(sidRef.current, {
                answer_sdp: JSON.stringify(pc.localDescription)
              });
            } catch(e) {
              console.error('[RTC] Receiver offer/answer error:', e);
              setupDoneRef.current = false; // retry
            }
          }

          // Apply new caller ICE candidates (only if count changed)
          if (pc.remoteDescription && s.caller_ice?.length > lastCallerIceCount) {
            const newOnes = s.caller_ice.slice(lastCallerIceCount);
            for (const c of newOnes) {
              try { await pc.addIceCandidate(new RTCIceCandidate(JSON.parse(c))); } catch(e) {}
            }
            console.log('[RTC] Receiver: applied', newOnes.length, 'new caller ICE');
            lastCallerIceCount = s.caller_ice.length;
          }
        }, 1000);
      }
    };

    run();
    return stopAll;
  }, [open, callSession?.id]);

  const toggleMute = () => {
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = muted; });
    setMuted(m => !m);
  };
  const toggleVideo = () => {
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = videoOff; });
    setVideoOff(v => !v);
  };
  const toggleSpeaker = async () => {
    const newSpeakerState = !speakerEnabled;
    setSpeakerEnabled(newSpeakerState);
    
    try {
      const result = await CallKitAPI.setAudioRoute(newSpeakerState ? 'speaker' : 'earpiece', isVideo);
      if (!result.success) throw new Error(result.error || 'Audio route failed');
    } catch (e) {
      console.error('[RTC] Speaker toggle error:', e);
      // On error, revert state
      setSpeakerEnabled(!speakerEnabled);
    }
  };
  const flipCamera = async () => {
    const newFacing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacing);
    const pc = pcRef.current;
    if (!pc) return;
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: newFacing }, audio: true });
      const newVideoTrack = newStream.getVideoTracks()[0];
      const sender = pc.getSenders().find(s => s.track?.kind === 'video');
      if (sender) await sender.replaceTrack(newVideoTrack);
      if (localStreamRef.current) localStreamRef.current.getVideoTracks().forEach(t => t.stop());
      localStreamRef.current = newStream;
      if (localVideoRef.current) localVideoRef.current.srcObject = newStream;
    } catch(e) { console.error('[RTC] Flip camera error:', e); }
  };

  const handleFireEffect = () => {
    const newParticles = [];
    for (let i = 0; i < 12; i++) {
      newParticles.push({
        id: Math.random(),
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: i * 0.05,
      });
    }
    setFireParticles(newParticles);
    setTimeout(() => setFireParticles([]), 1500);
  };

  const phaseLabel = phase === 'calling' ? 'Calling...' : phase === 'connecting' ? 'Connecting...' : phase === 'error' ? 'Camera/mic denied' : '';

  const REACTIONS = ['❤️', '🔥', '😍', '👏', '💯', '😂'];
  const ENHANCE_OPTS = ['Smooth Skin', 'Bright Eyes', 'Face Slim', 'Makeup', 'Hair Color'];

  const sendReaction = (emoji) => {
    setFloatingReaction({ emoji, id: Date.now() });
    setTimeout(() => setFloatingReaction(null), 1800);
    setShowReaction(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[10000] flex flex-col overflow-hidden"
          style={{ width: '100vw', height: '100dvh', top: 0, left: 0, background: 'linear-gradient(160deg, #ff6eb4 0%, #ff9a5c 50%, #ffb347 100%)' }}>

          {/* Remote video — fullscreen */}
          <video ref={remoteVideoRef} autoPlay playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: connected && isVideo ? 1 : 0, transition: 'opacity 0.5s' }} />

          {/* Warm gradient bg when no remote video */}
          {(!connected || !isVideo) && (
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(160deg, #ff6eb4 0%, #ff9a5c 50%, #ffb347 100%)' }} />
          )}

          {/* Soft overlay */}
          <div className="absolute inset-0 pointer-events-none z-10"
            style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, transparent 25%, transparent 55%, rgba(0,0,0,0.5) 100%)' }} />

          {/* ── TOP BAR ── */}
          <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4"
            style={{ paddingTop: 'max(48px, env(safe-area-inset-top, 48px))', paddingBottom: 12 }}>
            <motion.button whileTap={{ scale: 0.9 }} onClick={handleClose}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.28)', backdropFilter: 'blur(12px)' }}>
              <X className="w-5 h-5 text-white" strokeWidth={2.5} />
            </motion.button>

            {/* Center info */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1.5">
                <img src={convo?.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(convo?.name||'U')}&background=ff5500&color=fff&size=40`}
                  className="w-7 h-7 rounded-full object-cover border-2 border-white/50" />
                <span className="text-white font-bold text-[15px]">{convo?.name || 'Unknown'}</span>
                <span style={{ fontSize: 14 }}>✔️</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-green-400" style={{ boxShadow: '0 0 6px #4ade80' }} />
                <span className="text-white/80 text-[12px] font-medium">
                  {connected ? `${formatTime(duration)} · HD` : phaseLabel || 'Connecting...'}
                </span>
              </div>
            </div>

            <motion.button whileTap={{ scale: 0.9 }} onClick={handleClose}
              className="h-10 rounded-full flex items-center justify-center gap-1.5 px-3"
              style={{ background: 'linear-gradient(135deg, #ff3b30, #d7193f)', border: '1px solid rgba(255,255,255,0.26)', boxShadow: '0 8px 22px rgba(215,25,63,0.38)', backdropFilter: 'blur(12px)' }}>
              <PhoneOff className="w-4 h-4 text-white" />
              <span className="text-white text-[12px] font-black">End</span>
            </motion.button>
          </div>

          {/* ── LOCAL PIP (top right) ── */}
          {isVideo && (
            <div className="absolute z-30 rounded-2xl overflow-hidden"
              style={{ top: 'max(110px, env(safe-area-inset-top, 48px) + 68px)', right: 16, width: 100, height: 140, border: '2px solid rgba(255,255,255,0.5)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
              {!videoOff
                ? <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover"
                    style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }} />
                : <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
                    <VideoOff className="w-5 h-5 text-white/40" />
                  </div>
              }
              <button onClick={flipCamera}
                className="absolute bottom-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.5)' }}>
                <RefreshCw className="w-3 h-3 text-white" />
              </button>
            </div>
          )}
          {!isVideo && <video ref={localVideoRef} autoPlay muted playsInline className="hidden" />}

          {/* ── CENTER — waiting state ── */}
          {(!connected || !isVideo) && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4">
              <motion.div
                animate={{ boxShadow: ['0 0 0 0 rgba(255,255,255,0.4)', '0 0 0 28px rgba(255,255,255,0)', '0 0 0 0 rgba(255,255,255,0)'] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/60">
                <img src={convo?.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(convo?.name||'U')}&background=ff5500&color=fff&size=130`}
                  className="w-full h-full object-cover" />
              </motion.div>
              <h2 className="text-white text-2xl font-bold" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>{convo?.name || 'Unknown'}</h2>
              <p className="text-white/70 text-sm">{isVideo ? '📹 Video Call' : '📞 Voice Call'}</p>
              {!connected && phase !== 'error' && (
                <div className="flex gap-2 mt-1">
                  {[0, 0.2, 0.4].map((delay, i) => (
                    <motion.div key={i}
                      animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay }}
                      className="w-2.5 h-2.5 rounded-full bg-white" />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── LEFT REACTIONS SIDEBAR ── */}
          {isVideo && connected && (
            <div className="absolute left-3 z-30 flex flex-col gap-3"
              style={{ top: '35%' }}>
              {REACTIONS.map((emoji, i) => (
                <motion.button key={i} whileTap={{ scale: 1.3 }} onClick={() => sendReaction(emoji)}
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
                  style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)' }}>
                  {emoji}
                </motion.button>
              ))}
            </div>
          )}

          {/* ── AI ENHANCE PANEL (right side) ── */}
          <AnimatePresence>
            {showEnhance && (
              <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
                className="absolute right-3 z-30 rounded-2xl overflow-hidden"
                style={{ top: '28%', width: 140, background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.3)' }}>
                <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/20">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                    <span className="text-white text-[12px] font-bold">AI Enhance</span>
                  </div>
                  <button onClick={() => setShowEnhance(false)}>
                    <ChevronDown className="w-3.5 h-3.5 text-white/70" />
                  </button>
                </div>
                {ENHANCE_OPTS.map((opt, i) => (
                  <button key={i} onClick={() => setActiveEnhance(activeEnhance === opt ? null : opt)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-left transition-colors"
                    style={{ background: activeEnhance === opt ? 'rgba(255,255,255,0.2)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <span style={{ fontSize: 14 }}>{['🪞','👁️','🫖','💄','🎨'][i]}</span>
                    <span className="text-white text-[12px] font-medium">{opt}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── FLOATING REACTION ── */}
          <AnimatePresence>
            {floatingReaction && (
              <motion.div key={floatingReaction.id}
                initial={{ opacity: 1, scale: 0.5, y: 0 }}
                animate={{ opacity: 0, scale: 2, y: -200 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.8, ease: 'easeOut' }}
                className="fixed pointer-events-none text-5xl"
                style={{ left: '50%', bottom: '30%', transform: 'translateX(-50%)', zIndex: 50 }}>
                {floatingReaction.emoji}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── FIRE PARTICLES ── */}
          <AnimatePresence>
            {fireParticles.map(particle => (
              <motion.div key={particle.id}
                initial={{ opacity: 1, scale: 0 }}
                animate={{ opacity: 0, scale: Math.random() * 1.5 + 0.5, x: (Math.random() - 0.5) * 200, y: -Math.random() * 300 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: particle.delay }}
                className="fixed pointer-events-none text-4xl"
                style={{ left: `${particle.x}%`, top: `${particle.y}%`, filter: 'drop-shadow(0 0 20px rgba(255,100,0,1))', zIndex: 50 }}>
                🔥
              </motion.div>
            ))}
          </AnimatePresence>

          {/* ── ADD REACTION BAR ── */}
          {isVideo && connected && (
            <div className="absolute z-30 flex justify-center" style={{ bottom: 190, left: 0, right: 0 }}>
              <AnimatePresence>
                {showReaction && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="flex gap-3 px-5 py-3 rounded-2xl mb-2"
                    style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.3)' }}>
                    {REACTIONS.map((emoji, i) => (
                      <motion.button key={i} whileTap={{ scale: 1.3 }} onClick={() => sendReaction(emoji)} className="text-2xl">
                        {emoji}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowReaction(r => !r)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.35)' }}>
                <span>🤍</span>
                <span className="text-white text-sm font-semibold">Add Reaction</span>
              </motion.button>
            </div>
          )}

          {/* ── MAIN CONTROLS ROW ── */}
          <div className="absolute left-0 right-0 z-30 px-4"
            style={{ bottom: 'max(92px, env(safe-area-inset-bottom, 16px) + 76px)' }}>
            <div className="flex items-center justify-center gap-4 px-3 py-4 rounded-3xl"
              style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.3)' }}>

              {/* Mute */}
              <div className="flex flex-col items-center gap-1">
                <motion.button whileTap={{ scale: 0.88 }} onClick={toggleMute}
                  className="w-13 h-13 rounded-full flex items-center justify-center"
                  style={{ width: 52, height: 52, background: muted ? 'rgba(239,68,68,0.8)' : 'linear-gradient(135deg, #FF6B35, #e91e8c)', boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }}>
                  {muted ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
                </motion.button>
                <span className="text-white text-[11px] font-medium">{muted ? 'Unmute' : 'Mute'}</span>
              </div>

              {/* Camera */}
              {isVideo && (
                <div className="flex flex-col items-center gap-1">
                  <motion.button whileTap={{ scale: 0.88 }} onClick={toggleVideo}
                  className="rounded-full flex items-center justify-center"
                  style={{ width: 46, height: 46, background: videoOff ? 'rgba(239,68,68,0.8)' : 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }}>
                    {videoOff ? <VideoOff className="w-5 h-5 text-white" /> : <Video className="w-5 h-5 text-white" />}
                  </motion.button>
                  <span className="text-white text-[11px] font-medium">Camera</span>
                </div>
              )}

              {/* Effects */}
              {isVideo && (
                <div className="flex flex-col items-center gap-1">
                  <motion.button whileTap={{ scale: 0.88 }} onClick={handleFireEffect}
                    className="rounded-full flex items-center justify-center"
                    style={{ width: 46, height: 46, background: 'linear-gradient(135deg, #e91e8c, #f43f5e)', boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }}>
                    <Sparkles className="w-5 h-5 text-white" />
                  </motion.button>
                  <span className="text-white text-[11px] font-medium">Effects</span>
                </div>
              )}

              {/* Speaker */}
              <div className="flex flex-col items-center gap-1">
                <motion.button whileTap={{ scale: 0.88 }} onClick={toggleSpeaker}
                  className="rounded-full flex items-center justify-center"
                  style={{ width: 46, height: 46, background: speakerEnabled ? 'rgba(249,115,22,0.9)' : 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
                  <Volume2 className="w-5 h-5 text-white" />
                </motion.button>
                <span className="text-white text-[11px] font-medium">Speaker</span>
              </div>

            </div>
          </div>

          {/* ── ALWAYS VISIBLE END CALL ── */}
          <div className="absolute left-0 right-0 z-40 flex justify-center px-6 pointer-events-none"
            style={{ bottom: 'max(10px, env(safe-area-inset-bottom, 0px) + 6px)' }}>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={handleClose}
              className="pointer-events-auto h-14 rounded-full flex items-center justify-center gap-2 px-7"
              style={{
                minWidth: 168,
                background: 'linear-gradient(135deg, #ff453a 0%, #e11d48 58%, #b91c1c 100%)',
                border: '1.5px solid rgba(255,255,255,0.34)',
                boxShadow: '0 18px 34px rgba(185,28,28,0.48), 0 0 26px rgba(255,69,58,0.34), inset 0 1px 0 rgba(255,255,255,0.25)',
                backdropFilter: 'blur(18px)',
              }}>
              <PhoneOff className="w-7 h-7 text-white" />
              <span className="text-white text-[16px] font-black tracking-wide">End Call</span>
            </motion.button>
          </div>

          {/* ── BOTTOM SECONDARY ROW ── */}
          <div className="absolute left-0 right-0 z-30 flex items-center justify-around px-8"
            style={{ display: 'none' }}>
            <div className="flex flex-col items-center gap-1">
              <motion.button whileTap={{ scale: 0.9 }} onClick={toggleSpeaker}
                className="w-10 h-10 rounded-full flex items-center justify-center">
                <Volume2 className="w-5 h-5 text-white/70" />
              </motion.button>
              <span className="text-white/60 text-[10px]">Speaker</span>
            </div>
            {isVideo && (
              <div className="flex flex-col items-center gap-1">
                <motion.button whileTap={{ scale: 0.9 }} onClick={flipCamera}
                  className="w-10 h-10 rounded-full flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-white/70" />
                </motion.button>
                <span className="text-white/60 text-[10px]">Flip</span>
              </div>
            )}
            {isVideo && (
              <div className="flex flex-col items-center gap-1">
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowEnhance(e => !e)}
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: showEnhance ? 'rgba(255,255,255,0.3)' : 'transparent' }}>
                  <Sparkles className="w-5 h-5" style={{ color: showEnhance ? '#fde68a' : 'rgba(255,255,255,0.7)' }} />
                </motion.button>
                <span className="text-white/60 text-[10px]">Enhance</span>
              </div>
            )}
            <div className="flex flex-col items-center gap-1">
              <motion.button whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white/70" />
              </motion.button>
              <span className="text-white/60 text-[10px]">Chat</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <motion.button whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-full flex items-center justify-center">
                <MoreHorizontal className="w-5 h-5 text-white/70" />
              </motion.button>
              <span className="text-white/60 text-[10px]">More</span>
            </div>
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
