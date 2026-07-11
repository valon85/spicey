/**
 * AITalkModeRealtime — True realtime voice with OpenAI Realtime API
 * - WebSocket streaming for <500ms latency
 * - Avatar driven by actual audio amplitude
 * - Barge-in interruption
 * - Natural micro-movements
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, X, Send, Volume2 } from 'lucide-react';
import { useAI } from '@/lib/AIContext';
import AIEggAvatar from './AIEggAvatar';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';

const VOICES = [
  { id: 'coral', name: 'Coral', emoji: '✨' },
  { id: 'verse', name: 'Verse', emoji: '🎙️' },
  { id: 'ballad', name: 'Ballad', emoji: '🎧' },
  { id: 'sage', name: 'Sage', emoji: '💬' },
  { id: 'ash', name: 'Ash', emoji: '🔥' },
  { id: 'shimmer', name: 'Shimmer', emoji: '✨' },
];

export default function AITalkModeRealtime({ onClose }) {
  const { close, setPhase } = useAI();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceLevel, setVoiceLevel] = useState(0);
  const [selectedVoice, setSelectedVoice] = useState('coral');
  const [isLightMode, setIsLightMode] = useState(false);
  const [status, setStatus] = useState('connecting'); // connecting | idle | listening | speaking
  const [lastAIMsg, setLastAIMsg] = useState('');
  const [lastUserMsg, setLastUserMsg] = useState('');
  const [wsConnected, setWsConnected] = useState(false);
  const [showVoicePicker, setShowVoicePicker] = useState(false);

  const pcRef = useRef(null);
  const dataChannelRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioQueueRef = useRef([]);
  const isPlayingRef = useRef(false);
  const reconnectTimerRef = useRef(null);
  const isClosingRef = useRef(false);

  // Initialize Realtime WebSocket
  useEffect(() => {
    initRealtimeSession();
    return () => cleanup();
  }, [selectedVoice]);

  useEffect(() => {
    const check = () => setIsLightMode(document.documentElement.classList.contains('light-mode'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const initRealtimeSession = async () => {
    try {
      setStatus('connecting');
      cleanup();

      const res = await base44.functions.invoke('aiVoiceRealtime', { action: 'init', voice: selectedVoice });
      const { client_secret, model } = res.data || {};

      if (!client_secret) throw new Error('No realtime client secret');

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      mediaStreamRef.current = stream;

      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      const remoteAudio = new Audio();
      remoteAudio.autoplay = true;
      remoteAudio.playsInline = true;
      remoteAudioRef.current = remoteAudio;

      pc.ontrack = (event) => {
        remoteAudio.srcObject = event.streams[0];
        remoteAudio.play().catch(() => {});
      };

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const dc = pc.createDataChannel('oai-events');
      dataChannelRef.current = dc;

      dc.onopen = () => {
        console.log('[Realtime] Data channel connected');
        setWsConnected(true);
        setStatus('listening');
        setIsListening(true);
        setPhase('listening');
        configureRealtimeSession();
        sendSystemMessage();
      };

      dc.onmessage = async (event) => {
        const msg = JSON.parse(event.data);
        await handleServerMessage(msg);
      };

      dc.onerror = (err) => {
        console.error('[Realtime] Data channel error:', err);
        setStatus('idle');
      };

      dc.onclose = () => {
        setWsConnected(false);
        setStatus('idle');
        if (!isClosingRef.current) {
          reconnectTimerRef.current = setTimeout(() => initRealtimeSession(), 1200);
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const answerResponse = await fetch('https://api.openai.com/v1/realtime/calls', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${client_secret}`,
          'Content-Type': 'application/sdp',
        },
        body: offer.sdp,
      });

      const answerSdp = await answerResponse.text();
      if (!answerResponse.ok) throw new Error(answerSdp || 'Realtime WebRTC connection failed');

      await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });
    } catch (err) {
      console.error('[Realtime] Init failed:', err);
      setLastAIMsg(err?.name === 'NotAllowedError'
        ? 'Microphone permission is blocked. Please allow microphone access, then open AI Talk again.'
        : 'AI Talk could not connect. Please try again.');
      setStatus('idle');
    }
  };

  const sendRealtimeEvent = (event) => {
    const channel = dataChannelRef.current;
    if (!channel || channel.readyState !== 'open') return false;
    channel.send(JSON.stringify(event));
    return true;
  };

  const configureRealtimeSession = () => {
        sendRealtimeEvent({
          type: 'session.update',
          session: {
            type: 'realtime',
            instructions: "You are Spicey AI. Speak naturally like a warm live assistant, not like a translator. Detect the user's spoken language automatically and reply in the same language. Keep voice replies short, smooth, and conversational. If the user interrupts you, stop immediately and listen.",
            audio: {
              input: {
                transcription: { model: 'whisper-1' },
                turn_detection: {
                  type: 'server_vad',
                  threshold: 0.5,
                  prefix_padding_ms: 300,
                  silence_duration_ms: 450,
                  create_response: true,
                  interrupt_response: true,
                },
              },
            },
          },
        });
  };

  const sendSystemMessage = () => {
    sendRealtimeEvent({
      type: 'response.create',
      response: {
        instructions: "Greet the user warmly: Hi! Welcome to Spicey AI. I'm your AI assistant. You can talk to me naturally in any language. How can I help you today? After that, keep listening continuously, detect the user's spoken language automatically, and reply in that same language.",
      },
    });
  };

  const handleServerMessage = async (msg) => {
    switch (msg.type) {
      case 'response.audio.delta':
        if (msg.delta) {
          setIsSpeaking(true);
          setStatus('speaking');
          setIsListening(false);
          setPhase('speaking');
          setVoiceLevel(0.65);
        }
        break;

      case 'response.audio.done':
        setIsSpeaking(false);
        setPhase('stopped');
        setVoiceLevel(0);
        setStatus('listening');
        setIsListening(true);
        setTimeout(() => startListening(), 150);
        break;

      case 'response.audio_transcript.delta':
      case 'response.text.delta':
        if (msg.delta) setLastAIMsg(prev => `${prev || ''}${msg.delta}`);
        setIsSpeaking(true);
        setPhase('speaking');
        break;

      case 'response.audio_transcript.done':
      case 'response.text.done':
        if (msg.transcript || msg.text) setLastAIMsg(msg.transcript || msg.text);
        break;

      case 'conversation.item.input_audio_transcription.completed':
        const transcript = msg.transcript;
        if (transcript) {
          setLastUserMsg(transcript);
          console.log('[Realtime] User said:', transcript);
        }
        break;

      case 'input_audio_buffer.speech_started':
        interruptAssistant();
        setStatus('listening');
        setIsListening(true);
        setIsSpeaking(false);
        setVoiceLevel(0.25);
        setPhase('listening');
        break;

      case 'input_audio_buffer.speech_stopped':
        setVoiceLevel(0);
        break;

      case 'response.done':
        if (msg.response?.output?.[0]?.content?.[0]?.text) {
          setLastAIMsg(msg.response.output[0].content[0].text);
        }
        break;

      case 'error':
        console.error('[Realtime] Server error:', msg.error);
        break;
    }
  };

  const interruptAssistant = () => {
    try {
      sendRealtimeEvent({ type: 'response.cancel' });
    } catch (_) {}
    setIsSpeaking(false);
    setStatus('listening');
    setIsListening(true);
    setPhase('listening');
  };

  const playAudioChunk = async (base64Delta) => {
    try {
      const audioData = atob(base64Delta);
      const bytes = new Uint8Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        bytes[i] = audioData.charCodeAt(i);
      }

      // Decode PCM16 to AudioBuffer
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
      }
      const ctx = audioCtxRef.current;
      
      const audioBuffer = ctx.createBuffer(1, bytes.length / 2, 24000);
      const channelData = audioBuffer.getChannelData(0);
      
      for (let i = 0; i < bytes.length / 2; i++) {
        const sample = new Int16Array(bytes.buffer)[i];
        channelData[i] = sample / 32768;
      }

      // Create source and analyser for avatar sync
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      
      if (!analyserRef.current) {
        analyserRef.current = ctx.createAnalyser();
        analyserRef.current.fftSize = 256;
      }
      
      source.connect(analyserRef.current);
      analyserRef.current.connect(ctx.destination);
      
      // Real-time amplitude tracking
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      const tick = () => {
        analyserRef.current.getByteFrequencyData(dataArray);
        const avg = dataArray.slice(0, 60).reduce((a, b) => a + b, 0) / 60 / 255;
        setVoiceLevel(avg);
        if (isPlayingRef.current) {
          requestAnimationFrame(tick);
        }
      };
      
      isPlayingRef.current = true;
      tick();
      
      source.start();
      source.onended = () => {
        isPlayingRef.current = false;
      };
    } catch (err) {
      console.error('[Realtime] Audio play error:', err);
    }
  };

  const startListening = useCallback(async () => {
    try {
      setStatus('listening');
      setIsListening(true);
      setPhase('listening');

      if (!mediaStreamRef.current) {
        mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      mediaStreamRef.current.getAudioTracks().forEach(track => { track.enabled = true; });

    } catch (err) {
      console.error('[Realtime] Listen error:', err);
      setStatus('idle');
      setIsListening(false);
    }
  }, [status]);

  const stopListening = useCallback(() => {
    setIsListening(false);
    setStatus('idle');
    setPhase('stopped');
    mediaStreamRef.current?.getAudioTracks().forEach(track => { track.enabled = false; });
  }, []);

  const cleanup = () => {
    isClosingRef.current = true;
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.pause();
      remoteAudioRef.current.srcObject = null;
      remoteAudioRef.current = null;
    }
    setIsSpeaking(false);
    setIsListening(false);
    setWsConnected(false);
    setTimeout(() => { isClosingRef.current = false; }, 0);
  };

  const handleClose = () => {
    cleanup();
    setPhase('stopped');
    close();
    onClose?.();
  };

  const handleMicPress = () => {
    if (status === 'listening') {
      stopListening();
    } else if (status === 'speaking') {
      interruptAssistant();
      startListening();
    } else if (status === 'idle' || status === 'connecting') {
      startListening();
    }
  };

  const bg = isLightMode ? '#FFFFFF' : '#06000F';
  const textColor = isLightMode ? '#111' : '#fff';
  const subColor = isLightMode ? '#888' : 'rgba(255,255,255,0.45)';

  return (
    <div style={{ position: 'fixed', inset: 0, background: bg, zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Header */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10001,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: `max(12px, env(safe-area-inset-top)) 16px 10px`,
        background: isLightMode ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: isLightMode ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.07)',
      }}>
        <span style={{ fontSize: 16, fontWeight: 700 }}>
          <span style={{ color: textColor }}>Spicey </span>
          <span style={{ background: 'linear-gradient(135deg,#FF7A8F,#FF8C00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI Realtime</span>
        </span>

        <button onClick={handleClose} style={{
          width: 40, height: 40, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: isLightMode ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.1)',
          border: isLightMode ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.15)',
          cursor: 'pointer',
        }}>
          <X style={{ width: 18, height: 18, color: textColor }} />
        </button>
      </div>

      {/* Center: Avatar + messages */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', paddingTop: 70, paddingBottom: 200, gap: 16,
      }}>
        <AIEggAvatar size="240px" isSpeaking={isSpeaking} isListening={isListening} voiceLevel={voiceLevel} />

        {/* Status */}
        <div style={{
          padding: '6px 16px', borderRadius: 20,
          background: isListening ? 'rgba(255,0,255,0.15)' : isSpeaking ? 'rgba(0,200,100,0.15)' : 'rgba(120,120,120,0.15)',
        }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: textColor }}>
            {status === 'connecting' ? '🔗 Connecting...' :
             status === 'listening' ? '🎤 Listening...' :
             status === 'speaking' ? '🔊 Speaking...' : '✨ Ready'}
          </p>
        </div>

        {/* Messages */}
        <AnimatePresence>
          {lastUserMsg && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ padding: '10px 16px', borderRadius: 18, maxWidth: 300, alignSelf: 'flex-end', background: 'rgba(255,107,53,0.15)', border: '1px solid rgba(255,107,53,0.25)' }}>
              <p style={{ margin: 0, fontSize: 14, color: textColor }}>{lastUserMsg}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {lastAIMsg && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ padding: '14px 18px', borderRadius: 20, maxWidth: 320, textAlign: 'center', background: 'rgba(255,0,255,0.1)', border: '1px solid rgba(255,0,255,0.2)' }}>
              <p style={{ margin: 0, fontSize: 14, color: textColor, lineHeight: 1.55 }}>{lastAIMsg}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Voice picker */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowVoicePicker(p => !p)} style={{
            padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
            cursor: 'pointer', color: textColor,
          }}>
            <Volume2 style={{ width: 12, height: 12 }} />
            <span>{VOICES.find(v => v.id === selectedVoice)?.emoji} {VOICES.find(v => v.id === selectedVoice)?.name}</span>
          </button>
          {showVoicePicker && (
            <div style={{
              position: 'absolute', bottom: '100%', marginBottom: 8, zIndex: 300,
              borderRadius: 16, padding: 8, minWidth: 140,
              background: isLightMode ? '#fff' : 'rgba(10,3,22,0.99)',
              border: `1px solid ${isLightMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)'}`,
            }}>
              {VOICES.map(v => (
                <button key={v.id} onClick={() => { setSelectedVoice(v.id); setShowVoicePicker(false); }}
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: 10, fontSize: 13,
                    background: selectedVoice === v.id ? 'rgba(255,122,143,0.15)' : 'transparent',
                    border: 'none', color: selectedVoice === v.id ? '#FF7A8F' : textColor,
                    fontWeight: selectedVoice === v.id ? 700 : 400, cursor: 'pointer',
                  }}>
                  {v.emoji} {v.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mic button */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10002,
        paddingBottom: 'max(20px, env(safe-area-inset-bottom, 12px))', paddingTop: 12,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        background: isLightMode ? 'rgba(255,255,255,0.97)' : 'rgba(6,0,15,0.97)',
        borderTop: isLightMode ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.07)',
      }}>
        <button onClick={handleMicPress} disabled={status === 'connecting'}
          style={{
            width: 66, height: 66, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: isListening ? 'linear-gradient(135deg,#FF00FF,#E91E63)' : isSpeaking ? 'linear-gradient(135deg,#00c864,#00a050)' : 'linear-gradient(135deg,#FF00FF,#9D17F7)',
            border: isListening ? '2px solid rgba(255,255,255,0.9)' : '2px solid rgba(255,255,255,0.25)',
            boxShadow: isListening ? '0 0 30px rgba(255,0,255,0.9)' : '0 0 18px rgba(255,0,255,0.4)',
            cursor: status === 'connecting' ? 'not-allowed' : 'pointer',
            opacity: status === 'connecting' ? 0.5 : 1,
          }}>
          <Mic style={{ width: 24, height: 24, color: '#fff' }} />
        </button>
        <p style={{ fontSize: 10, color: subColor, margin: 0 }}>
          ✨ Powered by OpenAI Realtime API
        </p>
      </div>
    </div>
  );
}
