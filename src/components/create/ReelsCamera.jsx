import React, { useState, useRef, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Camera, Video, Music2, MapPin, User, Type, Square, 
  Check, Loader2, FlipHorizontal, Zap, ZapOff, ImagePlus, Play
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MusicPickerSheet from './MusicPickerSheet';

export default function ReelsCamera({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const progressIntervalRef = useRef(null);

  const [facingMode, setFacingMode] = useState('environment');
  const [flash, setFlash] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [musicSheetOpen, setMusicSheetOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [showTools, setShowTools] = useState(false);
  const [overlayText, setOverlayText] = useState('');
  const [showText, setShowText] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [textPosition, setTextPosition] = useState({ x: 50, y: 50 });
  const [textColor, setTextColor] = useState('#ffffff');
  const [textSize, setTextSize] = useState(24);
  const navigate = useNavigate();

  const startCamera = useCallback(async () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 60, min: 30 },
        }, 
        audio: { echoCancellation: true, noiseSuppression: true }
      });
      // Try to enable image stabilization if supported
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const caps = videoTrack.getCapabilities?.();
        const constraints = {};
        if (caps?.focusMode?.includes?.('continuous')) constraints.focusMode = 'continuous';
        if (caps?.exposureMode?.includes?.('continuous')) constraints.exposureMode = 'continuous';
        if (caps?.whiteBalanceMode?.includes?.('continuous')) constraints.whiteBalanceMode = 'continuous';
        if (Object.keys(constraints).length > 0) {
          videoTrack.applyConstraints({ advanced: [constraints] }).catch(() => {});
        }
      }
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setCameraError(false);
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError(true);
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      clearInterval(progressIntervalRef.current);
    };
  }, [facingMode, startCamera]);

  const startRecording = () => {
    const stream = streamRef.current;
    if (!stream) return;

    // Verify audio track is present — critical for audio in recorded video
    const audioTracks = stream.getAudioTracks();
    console.log('[ReelsCamera] Audio tracks:', audioTracks.length, audioTracks[0]?.label);

    recordedChunksRef.current = [];

    // Priority: mp4 with aac audio (best iOS compat) → webm vp9/opus → webm vp8/opus
    const preferredMime =
      MediaRecorder.isTypeSupported('video/mp4;codecs=avc1,mp4a.40.2') ? 'video/mp4;codecs=avc1,mp4a.40.2' :
      MediaRecorder.isTypeSupported('video/mp4') ? 'video/mp4' :
      MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus' :
      MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus') ? 'video/webm;codecs=vp8,opus' :
      MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : '';

    console.log('[ReelsCamera] Using mimeType:', preferredMime || 'browser default');
    const recorderOptions = preferredMime ? { mimeType: preferredMime } : {};
    const recorder = new MediaRecorder(stream, recorderOptions);
    recorder.ondataavailable = e => { if (e.data.size > 0) recordedChunksRef.current.push(e.data); };
    recorder.onstop = () => {
      const actualMime = recorder.mimeType || preferredMime || 'video/webm';
      const ext = actualMime.includes('mp4') ? 'mp4' : 'webm';
      const blob = new Blob(recordedChunksRef.current, { type: actualMime });
      console.log('[ReelsCamera] Recorded blob size:', blob.size, 'type:', blob.type);
      const file = new File([blob], `reel.${ext}`, { type: actualMime });
      const previewUrl = URL.createObjectURL(blob);
      onCapture({
        file,
        previewUrl,
        music: selectedTrack,
        overlayText,
        location: selectedLocation,
        tags: selectedTags,
        textColor,
        textSize,
        textPosition
      });
    };
    mediaRecorderRef.current = recorder;
    recorder.start();
    setIsRecording(true);
    setRecordingProgress(0);
    setRecordingSeconds(0);
    let elapsed = 0;
    progressIntervalRef.current = setInterval(() => {
      elapsed += 100;
      setRecordingProgress(Math.min((elapsed / 60000) * 100, 100));
      setRecordingSeconds(Math.floor(elapsed / 1000));
      if (elapsed >= 60000) stopRecording();
    }, 100);
  };

  const stopRecording = () => {
    clearInterval(progressIntervalRef.current);
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setRecordingProgress(0);
  };

  const handleShutterClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleAddText = () => {
    setShowText(true);
    setOverlayText('Your text here');
  };

  const [locationSheetOpen, setLocationSheetOpen] = useState(false);
  const [locationInput, setLocationInput] = useState('');

  const handleAddLocation = () => {
    setLocationInput(selectedLocation || '');
    setLocationSheetOpen(true);
  };

  const handleTagPeople = () => {
    const tag = prompt('Enter username to tag (@username):');
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Recording progress */}
      {isRecording && (
        <div className="absolute top-0 left-0 right-0 h-1.5 z-30"
          style={{ background: 'rgba(255,255,255,0.08)' }}>
          <motion.div 
            className="h-full"
            style={{ 
              width: `${recordingProgress}%`, 
              background: 'linear-gradient(to right, #ff2200, #ff6600, #ffaa00)',
              boxShadow: '0 0 10px rgba(255,80,0,1)'
            }} 
          />
        </div>
      )}

      {/* Camera feed */}
      <div className="flex-1 relative overflow-hidden">
        {cameraError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Video className="w-8 h-8 text-white/50" />
            </div>
            <p className="text-white/50 text-sm">Camera not available</p>
            <button onClick={onClose}
              className="px-6 py-3 rounded-full text-white font-semibold text-sm"
              style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)' }}>
              Go Back
            </button>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{ 
                transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
                willChange: 'transform',
                backfaceVisibility: 'hidden',
              }} 
            />
            
            {/* Text overlay */}
            {showText && overlayText && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute pointer-events-none"
                style={{
                  left: `${textPosition.x}%`,
                  top: `${textPosition.y}%`,
                  transform: 'translate(-50%, -50%)',
                  color: textColor,
                  fontSize: `${textSize}px`,
                  fontWeight: 'bold',
                  textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                  zIndex: 20
                }}
              >
                {overlayText}
              </motion.div>
            )}

            {/* Location tag */}
            {selectedLocation && (
              <div className="absolute top-20 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full z-20"
                style={{ 
                  background: 'rgba(0,0,0,0.5)', 
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                <MapPin className="w-3 h-3 text-white" />
                <span className="text-white text-xs font-semibold">{selectedLocation}</span>
              </div>
            )}

            {/* Music tag */}
            {selectedTrack && (
              <div className="absolute bottom-32 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full z-20"
                style={{ 
                  background: 'rgba(0,0,0,0.5)', 
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                <Music2 className="w-3 h-3 text-pink-400" />
                <span className="text-white text-xs font-semibold">{selectedTrack.title}</span>
              </div>
            )}
          </>
        )}

        {/* Top gradient */}
        <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)' }} />
        
        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-52 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }} />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-12 pb-3 z-10">
          <motion.button 
            onClick={onClose}
            whileTap={{ scale: 0.88 }}
            className="w-10 h-10 flex items-center justify-center rounded-full"
            style={{ 
              background: 'rgba(0,0,0,0.4)', 
              backdropFilter: 'blur(8px)', 
              border: '1px solid rgba(255,255,255,0.1)' 
            }}>
            <X className="w-5 h-5 text-white" />
          </motion.button>

          {isRecording ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(220,30,30,0.85)', backdropFilter: 'blur(8px)' }}>
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-white text-xs font-bold tracking-widest">
                {String(Math.floor(recordingSeconds / 60)).padStart(2,'0')}:{String(recordingSeconds % 60).padStart(2,'0')}
              </span>
            </div>
          ) : (
            <div className="w-24" />
          )}

          <motion.button 
            onClick={() => setFlash(f => !f)}
            whileTap={{ scale: 0.88 }}
            className="w-10 h-10 flex items-center justify-center rounded-full"
            style={{ 
              background: flash ? 'rgba(255,220,0,0.25)' : 'rgba(0,0,0,0.4)', 
              backdropFilter: 'blur(8px)' 
            }}>
            {flash ? <Zap className="w-5 h-5 text-yellow-300" /> : <ZapOff className="w-5 h-5 text-white/70" />}
          </motion.button>
        </div>

        {/* Right side tools - Music, Text, Location, Tag */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-10">
          {[
            { icon: Music2, label: selectedTrack ? selectedTrack.title.slice(0,10) : 'Music', action: () => setMusicSheetOpen(true), active: !!selectedTrack },
            { icon: Type, label: 'Text', action: handleAddText, active: showText },
            { icon: MapPin, label: 'Location', action: handleAddLocation, active: !!selectedLocation },
            { icon: User, label: 'Tag', action: handleTagPeople, active: selectedTags.length > 0 },
          ].map(({ icon: Icon, label, action, active }, i) => (
            <motion.button 
              key={i} 
              onClick={action}
              whileTap={{ scale: 0.9 }}
              className="w-12 h-12 flex flex-col items-center justify-center rounded-full gap-0.5"
              style={{
                background: active ? 'rgba(233,30,140,0.3)' : 'rgba(0,0,0,0.45)',
                backdropFilter: 'blur(10px)',
                border: active ? '2px solid rgba(233,30,140,0.6)' : '2px solid rgba(255,255,255,0.1)',
                boxShadow: active ? '0 0 15px rgba(233,30,140,0.5)' : 'none',
              }}>
              <Icon className="w-6 h-6 text-white" />
              {label && <span className="text-[7px] font-bold text-white/80 max-w-[40px] truncate leading-none">{label}</span>}
            </motion.button>
          ))}
        </div>

        {/* Music now playing bar */}
        {selectedTrack && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-24 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full z-20"
            style={{ 
              background: 'rgba(233,30,140,0.25)', 
              border: '1px solid rgba(233,30,140,0.4)', 
              backdropFilter: 'blur(10px)' 
            }}>
            <Music2 className="w-3 h-3 text-pink-400" />
            <span className="text-white text-xs font-semibold">{selectedTrack.emoji} {selectedTrack.title}</span>
          </motion.div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 pt-8 pb-16"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.98), transparent)' }}>

        {/* Left: Flip */}
        <motion.button 
          onClick={() => setFacingMode(m => m === 'environment' ? 'user' : 'environment')}
          whileTap={{ scale: 0.88 }}
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.06)' }}>
          <FlipHorizontal className="w-5 h-5 text-white/60" />
        </motion.button>

        {/* Center: Shutter */}
        <div className="relative flex items-center justify-center" style={{ width: 96, height: 96 }}>
          {/* Circular timer ring — OUTSIDE the button so it's not clipped */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 96 96"
            style={{ transform: 'rotate(-90deg)', zIndex: 10 }}>
            <circle cx="48" cy="48" r="44" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="4" />
            {isRecording && (
              <circle cx="48" cy="48" r="44" fill="none" stroke="#ffffff" strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="276.46"
                strokeDashoffset={276.46 * (1 - recordingProgress / 100)}
                style={{ transition: 'stroke-dashoffset 0.1s linear', filter: 'drop-shadow(0 0 6px rgba(255,220,0,1))' }}
              />
            )}
          </svg>
          <motion.button
            onClick={handleShutterClick}
            whileTap={{ scale: 0.9 }}
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: isRecording 
                ? 'linear-gradient(135deg, #ff2200, #ff6600)' 
                : 'linear-gradient(135deg, #ff5500, #e91e8c)',
              border: '3px solid rgba(255,255,255,0.4)',
              boxShadow: isRecording 
                ? '0 0 30px rgba(255,50,0,0.8), 0 0 60px rgba(255,80,0,0.4)' 
                : '0 0 25px rgba(255,80,0,0.6), 0 0 50px rgba(233,30,140,0.3)',
            }}>
            {isRecording ? (
              <div className="w-8 h-8 rounded-full bg-white" style={{ boxShadow: '0 0 20px rgba(255,50,0,0.8)' }} />
            ) : (
              <Video className="w-8 h-8 text-white" style={{ filter: 'drop-shadow(0 0 8px rgba(255,80,0,0.8))' }} />
            )}
          </motion.button>
        </div>

        {/* Right: Gallery - ROUND */}
        <label className="relative flex-shrink-0 cursor-pointer">
          <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden"
            style={{ 
              background: 'rgba(255,255,255,0.08)', 
              border: '2px solid rgba(255,255,255,0.2)',
              boxShadow: '0 0 15px rgba(255,255,255,0.1)'
            }}>
            <ImagePlus className="w-6 h-6 text-white/70" style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.3))' }} />
          </div>
          <input 
            type="file" 
            accept="video/*,image/*" 
            className="hidden" 
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) {
                const previewUrl = URL.createObjectURL(file);
                onCapture({
                  file,
                  previewUrl,
                  music: selectedTrack,
                  overlayText: '',
                  location: '',
                  tags: [],
                  fromGallery: true
                });
              }
            }} 
          />
        </label>
      </div>

      <MusicPickerSheet
        open={musicSheetOpen}
        onClose={() => setMusicSheetOpen(false)}
        onSelect={(track) => { setSelectedTrack(track); setMusicSheetOpen(false); }}
        selectedTrack={selectedTrack}
      />

      {/* Location sheet — manual input, NO GPS popup */}
      <AnimatePresence>
        {locationSheetOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setLocationSheetOpen(false)}
              className="absolute inset-0 z-[70]"
              style={{ background: 'rgba(0,0,0,0.5)' }} />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
              className="absolute bottom-0 left-0 right-0 z-[71] rounded-t-3xl px-5 pt-4 pb-10 flex flex-col gap-4"
              style={{ background: 'rgba(16,6,24,0.99)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="w-10 h-1 rounded-full bg-white/20 self-center mb-1" />
              <div className="flex items-center justify-between">
                <span className="text-white font-bold text-sm">📍 Add Location</span>
                <button onClick={() => setLocationSheetOpen(false)}
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <X className="w-4 h-4 text-white/60" />
                </button>
              </div>
              <input
                value={locationInput}
                onChange={e => setLocationInput(e.target.value)}
                placeholder="City, country or place..."
                autoFocus
                className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 15 }}
              />
              <button
                onClick={() => { setSelectedLocation(locationInput.trim()); setLocationSheetOpen(false); }}
                className="w-full py-3 rounded-2xl text-white font-bold text-sm"
                style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)' }}>
                Done
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}