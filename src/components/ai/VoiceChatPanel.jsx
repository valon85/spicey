import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Volume2, VolumeX, ImagePlus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import AIPostPreviewModal from './AIPostPreviewModal';
import AIActionConfirmModal from './AIActionConfirmModal';
import { parseVoiceCommand } from './voiceCommandParser';

const CHAT_STARTERS = [
  { icon: '✍️', text: 'Write a post caption for me' },
  { icon: '🔥', text: 'Best hashtags right now' },
  { icon: '🎬', text: 'Give me a Spicey Clip idea' },
  { icon: '📖', text: 'Write a Moment caption' },
  { icon: '📞', text: 'Call a friend on Spicey' },
  { icon: '💬', text: 'Message a friend' },
];

// Detect publish action buttons from AI-generated content text
function detectContentActions(text) {
  const lower = text.toLowerCase();
  const actions = [];
  const hasCaption = lower.includes('caption') || lower.includes('post this') || lower.includes("here's your") || lower.includes('try this');
  const hasHashtags = lower.includes('#') || lower.includes('hashtag');
  const isReel = lower.includes('reel') || lower.includes('video idea') || lower.includes('short video');
  const isStory = lower.includes('story') || lower.includes('stories');
  const looksLikeContent = hasCaption || hasHashtags || text.split('\n').some(l => l.startsWith('#'));

  if (looksLikeContent) {
    if (isStory) {
      actions.push({ label: 'Post to Moment', icon: '📖', type: 'story' });
    } else if (isReel) {
      actions.push({ label: 'Create Spicey Clip', icon: '🎬', type: 'reel' });
    } else {
      actions.push({ label: 'Post to Feed', icon: '📸', type: 'feed' });
      actions.push({ label: 'Post to Moment', icon: '📖', type: 'story' });
    }
  }
  if (isReel && !actions.find(a => a.type === 'reel')) {
    actions.push({ label: 'Create Spicey Clip', icon: '🎬', type: 'reel' });
  }
  return actions;
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map(i => (
        <motion.div key={i}
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
          transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
          className="w-2 h-2 rounded-full"
          style={{ background: '#8b5cf6' }} />
      ))}
    </div>
  );
}

function ListeningOrb() {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
      className="flex flex-col items-center gap-4 py-6">
      <div
        animate={{ boxShadow: ['0 0 0 0px rgba(139,92,246,0.5)', '0 0 0 18px rgba(139,92,246,0)', '0 0 0 0px rgba(139,92,246,0)'] }}
        transition={{ duration: 1.4, repeat: Infinity }}
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #8b5cf6, #e91e8c)', boxShadow: '0 0 32px rgba(139,92,246,0.7)' }}>
        <Mic className="w-9 h-9 text-white" />
      </div>
      <p className="text-sm font-semibold text-purple-300">✨ Always listening - just speak naturally</p>
      <div className="flex gap-1.5 items-end h-8">
        {[3, 5, 8, 5, 10, 7, 4, 9, 6, 4].map((h, i) => (
          <motion.div key={i}
            animate={{ scaleY: [0.3, 1, 0.3] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.07, ease: 'easeInOut' }}
            className="w-1.5 rounded-full"
            style={{ height: h * 2.5, background: 'linear-gradient(to top, #8b5cf6, #e91e8c)', transformOrigin: 'bottom' }} />
        ))}
      </div>
    </motion.div>
  );
}

// ── UI sound effects via Web Audio API ────────────────────────
function playUISound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'send') {
      // Short rising "bip"
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(740, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.12);
    } else if (type === 'receive') {
      // Two-note soft "ding dong"
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(660, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.28);
    }

    osc.onended = () => ctx.close();
  } catch (_) {}
}

export default function VoiceChatPanel({ isLight }) {
  const navigate = useNavigate();

  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hey! I'm Spicey AI 🔥 Your smart assistant. Ask me to write captions, generate hashtags, post to your feed, call or message a friend, or navigate the app. Type or tap the mic!" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Attached media
  const [attachedMedia, setAttachedMedia] = useState(null);
  const fileInputRef = useRef(null);

  // Voice input - Always-on continuous conversation
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const silenceTimerRef = useRef(null);

  // TTS
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeakingState, setIsSpeakingState] = useState(false);

  // Post preview modal
  const [previewModal, setPreviewModal] = useState(null);

  // Action confirmation modal (voice commands)
  const [confirmAction, setConfirmAction] = useState(null);
  // { intent, params, previewData, onConfirm }

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Context for "last AI content" to attach to post commands
  const lastAIContentRef = useRef('');

  useEffect(() => {
    const supported = typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
    setVoiceSupported(supported);
    
    if (supported) {
      console.log('[VoiceChat] ✅ Speech recognition supported');
      
      // Request microphone permission
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(() => {
            console.log('[VoiceChat] ✅ Microphone permission granted');
          })
          .catch((err) => {
            console.error('[VoiceChat] ❌ Microphone permission denied:', err);
          });
      }
    } else {
      console.error('[VoiceChat] ❌ Speech recognition not supported');
    }
    
    // Auto-start voice after short delay
    if (supported) {
      setTimeout(() => { activeRef.current = true; _spawnRec(); }, 600);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, [messages, chatLoading, keyboardHeight]);

  // Track keyboard height via visualViewport
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () => {
      const kbH = window.innerHeight - vv.height - vv.offsetTop;
      setKeyboardHeight(Math.max(0, kbH));
    };
    vv.addEventListener('resize', onResize);
    vv.addEventListener('scroll', onResize);
    return () => { vv.removeEventListener('resize', onResize); vv.removeEventListener('scroll', onResize); };
  }, []);

  const speakText = (text, callback) => {
    if (!voiceEnabled || !text?.trim()) {
      if (callback) callback();
      return;
    }
    
    // Clean the text for better speech
    const clean = text
      .replace(/[*_~`#]/g, '')
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/`(.+?)`/g, '$1')
      .trim();
    
    if (!clean) {
      if (callback) callback();
      return;
    }
    
    console.log('[TTS] 🎤 Speaking:', clean.substring(0, 60));
    
    // Always use OpenAI TTS for premium ChatGPT-quality voices
    speakWithOpenAI(clean, callback);
  };
  
  // OpenAI premium voice — uses plain <audio> element, works on iOS without AudioContext
  const _ttsAudio = useRef(null);
  const speakWithOpenAI = async (text, callback) => {
    try {
      const result = await base44.functions.invoke('generateVoice', { text, voice: 'nova' });
      const b64 = result?.data?.audio_base64;
      if (!b64) throw new Error('No audio');

      // Reuse or create a single audio element (avoids iOS autoplay block)
      if (!_ttsAudio.current) _ttsAudio.current = new Audio();
      const el = _ttsAudio.current;
      el.pause();
      el.onended = null;
      el.onerror = null;

      const clean = b64.includes(',') ? b64.split(',')[1] : b64;
      el.src = `data:audio/mpeg;base64,${clean}`;

      isSpeakingRef.current = true;
      setIsSpeakingState(true);

      el.onended = () => {
        isSpeakingRef.current = false;
        setIsSpeakingState(false);
        el.onended = null; el.onerror = null;
        if (callback) callback();
        setTimeout(() => { if (voiceSupported) { activeRef.current = true; _spawnRec(); } }, 200);
      };
      el.onerror = () => {
        isSpeakingRef.current = false;
        setIsSpeakingState(false);
        el.onended = null; el.onerror = null;
        if (callback) callback();
        setTimeout(() => { if (voiceSupported) { activeRef.current = true; _spawnRec(); } }, 200);
      };

      el.play().catch(err => {
        console.warn('[TTS] play() rejected:', err.message);
        isSpeakingRef.current = false;
        setIsSpeakingState(false);
        if (callback) callback();
        setTimeout(() => { if (voiceSupported) { activeRef.current = true; _spawnRec(); } }, 200);
      });
    } catch (err) {
      console.error('[TTS] ❌ failed:', err.message);
      isSpeakingRef.current = false;
      setIsSpeakingState(false);
      if (callback) callback();
      setTimeout(() => { if (voiceSupported) { activeRef.current = true; _spawnRec(); } }, 200);
    }
  };
  


  const stopSpeaking = () => { 
    // Stop any playing audio
    isSpeakingRef.current = false;
    setIsSpeakingState(false);
  };

  const handleAttach = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const type = file.type.startsWith('video') ? 'video' : 'image';
    setAttachedMedia({ file, url: URL.createObjectURL(file), type });
    e.target.value = '';
  };

  const removeAttachment = () => {
    if (attachedMedia?.url) URL.revokeObjectURL(attachedMedia.url);
    setAttachedMedia(null);
  };

  // ── Handle voice command with confirmation ────────────────────
  const handleVoiceCommand = async (command, userText) => {
    const { intent, params } = command;

    // Navigation commands — just confirm then navigate
    const navIntents = ['open_profile', 'open_notifications', 'open_messages', 'open_explore'];
    if (navIntents.includes(intent)) {
      const routeMap = {
        open_profile: '/profile',
        open_notifications: '/notifications',
        open_messages: '/messages',
        open_explore: '/explore',
      };
      const aiReply = `Sure! Taking you to ${intent.replace('open_', '').replace('_', ' ')} 👉`;
      setMessages(prev => [...prev, { role: 'ai', text: aiReply }]);
      speakText(aiReply, null);
      setConfirmAction({
        intent, params, previewData: null,
        onConfirm: () => { setConfirmAction(null); navigate(routeMap[intent]); },
      });
      return;
    }

    // Post commands — use last AI content or ask
    if (['post_feed', 'post_story', 'create_reel'].includes(intent)) {
      const caption = lastAIContentRef.current || '';
      const typeLabel = intent === 'post_story' ? 'story' : intent === 'create_reel' ? 'reel' : 'feed';
      const aiReply = caption
        ? `Got it! Here's a preview of your ${typeLabel} post. Confirm to publish 🚀`
        : `I'll take you to the ${typeLabel} creator. Let's go! 🚀`;
      setMessages(prev => [...prev, { role: 'ai', text: aiReply }]);
      speakText(aiReply);
      setConfirmAction({
        intent, params,
        previewData: caption ? { caption } : null,
        onConfirm: () => {
          setConfirmAction(null);
          if (intent === 'create_reel') navigate('/create', { state: { aiCaption: caption, aiMode: 'reel' } });
          else if (intent === 'post_story') navigate('/create', { state: { aiCaption: caption, aiMode: 'story' } });
          else navigate('/create', { state: { aiCaption: caption, aiMode: 'feed' } });
        },
      });
      return;
    }

    // Call / message / send caption — search for the user first
    if (['call_user', 'message_user', 'send_caption'].includes(intent)) {
      setChatLoading(true);
      let foundUser = null;
      try {
        const res = await base44.functions.invoke('searchUsers', { query: params.name, limit: 5 });
        const users = res?.data?.users || res?.users || [];
        foundUser = users[0] || null;
      } catch (_) {}
      setChatLoading(false);

      if (!foundUser) {
        const notFound = `I couldn't find anyone named "${params.name}" in your contacts. Try a different name 🤔`;
        setMessages(prev => [...prev, { role: 'ai', text: notFound }]);
        speakText(notFound);
        return;
      }

      const displayName = foundUser.full_name || foundUser.username || params.name;
      const avatar = foundUser.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=ff5500&color=fff&size=80`;
      const caption = intent === 'send_caption' ? lastAIContentRef.current : '';

      const actionLabels = { call_user: `call ${displayName}`, message_user: `message ${displayName}`, send_caption: `send the caption to ${displayName}` };
      const aiReply = `Found ${displayName}! Ready to ${actionLabels[intent]} 👇`;
      setMessages(prev => [...prev, { role: 'ai', text: aiReply }]);
      speakText(aiReply);

      setConfirmAction({
        intent, params,
        previewData: { displayName, username: foundUser.username, avatar, caption },
        onConfirm: () => {
          setConfirmAction(null);
          if (intent === 'call_user') {
            navigate('/messages', { state: { directUserId: foundUser.id, directUserName: displayName, directUserUsername: foundUser.username, directUserAvatar: avatar, startCall: 'voice' } });
          } else if (intent === 'message_user') {
            navigate('/messages', { state: { directUserId: foundUser.id, directUserName: displayName, directUserUsername: foundUser.username, directUserAvatar: avatar } });
          } else if (intent === 'send_caption') {
            navigate('/messages', { state: { directUserId: foundUser.id, directUserName: displayName, directUserUsername: foundUser.username, directUserAvatar: avatar, prefillMessage: caption } });
          }
        },
      });
      return;
    }
  };

  // ── Main send ─────────────────────────────────────────────────
  const sendMessage = async (overrideText) => {
    const text = (overrideText || chatInput).trim();
    if (!text || chatLoading) return;
    setChatInput('');
    stopSpeaking();

    playUISound('send');
    const userMsg = { role: 'user', text, media: attachedMedia ? { url: attachedMedia.url, type: attachedMedia.type } : null };
    setMessages(prev => [...prev, userMsg]);

    const mediaForAI = attachedMedia ? { file: attachedMedia.file, type: attachedMedia.type } : null;
    const mediaPreviewUrl = attachedMedia?.url || null;
    const mediaType = attachedMedia?.type || null;
    setAttachedMedia(null);

    // Check for voice command first
    const command = parseVoiceCommand(text);
    if (command) {
      await handleVoiceCommand(command, text);
      return;
    }

    // Regular AI chat
    setChatLoading(true);

    let uploadedUrl = null;
    if (mediaForAI) {
      try {
        const res = await base44.integrations.Core.UploadFile({ file: mediaForAI.file });
        uploadedUrl = res.file_url;
      } catch (_) {}
    }

    const contextNote = uploadedUrl ? `The user has attached a ${mediaType}. Analyze it and respond directly. ` : '';
    
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are Spicey AI, the smart social media assistant for Spicey — a premium dark neon social platform. ${contextNote}Be helpful, fun, and on-brand. Use emojis naturally. Keep responses concise (max 3 short paragraphs). When writing captions or post content, write it in a ready-to-post format. User says: "${text}"`,
        file_urls: uploadedUrl ? [uploadedUrl] : undefined,
      });
      lastAIContentRef.current = response;
      const actions = detectContentActions(response);
      playUISound('receive');
      setMessages(prev => [...prev, { role: 'ai', text: response, actions, mediaPreviewUrl, mediaType }]);
      setChatLoading(false);
      
      speakText(response);
    } catch (llmErr) {
      console.error('[VoiceChat] ❌ LLM error:', llmErr);
      setChatLoading(false);
      const errorMsg = "Sorry, I had trouble connecting to AI. Please check your internet and try again! 🙏";
      setMessages(prev => [...prev, { role: 'ai', text: errorMsg }]);
      speakText(errorMsg);
    }


  };

  const handleAction = (action, message) => {
    setPreviewModal({ type: action.type, content: message.text, mediaUrl: message.mediaPreviewUrl, mediaType: message.mediaType });
  };

  const handlePublish = ({ type, caption, mediaUrl, mediaType }) => {
    setPreviewModal(null);
    if (type === 'reel') navigate('/create', { state: { aiCaption: caption, aiMode: 'reel' } });
    else if (type === 'story') navigate('/create', { state: { aiCaption: caption, aiMode: 'story' } });
    else navigate('/create', { state: { aiCaption: caption, aiMode: 'feed', aiMediaUrl: mediaUrl, aiMediaType: mediaType } });
  };

  const activeRef = useRef(false); // tracks if voice loop is running
  const accTextRef = useRef('');   // accumulates finals between restarts

  const startListening = () => {
    if (!voiceSupported || activeRef.current || isSpeakingRef.current) return;
    activeRef.current = true;
    _spawnRec();
  };

  const _spawnRec = () => {
    if (!activeRef.current || isSpeakingRef.current) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    try {
      const rec = new SR();
      rec.lang = 'en-US';
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      recognitionRef.current = rec;

      rec.onstart = () => setIsListening(true);

      rec.onresult = (e) => {
        if (!activeRef.current) return;
        // Reset silence timer on any result
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

        let finals = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) finals += e.results[i][0].transcript;
        }
        if (finals) {
          accTextRef.current += ' ' + finals;
          // 1.2s silence → submit
          silenceTimerRef.current = setTimeout(() => {
            const text = accTextRef.current.trim();
            accTextRef.current = '';
            if (text && activeRef.current) {
              rec.abort();
              activeRef.current = false;
              setIsListening(false);
              sendMessage(text);
            }
          }, 1200);
        }
      };

      rec.onerror = (e) => {
        if (e.error === 'not-allowed') { activeRef.current = false; setIsListening(false); return; }
        // restart silently on any other error
        setTimeout(() => { if (activeRef.current && !isSpeakingRef.current) _spawnRec(); }, 200);
      };

      rec.onend = () => {
        setIsListening(false);
        // auto-restart unless we submitted or speaking
        if (activeRef.current && !isSpeakingRef.current) {
          setTimeout(() => _spawnRec(), 150);
        }
      };

      rec.start();
    } catch (err) {
      activeRef.current = false;
      setIsListening(false);
    }
  };

  const stopListening = () => {
    activeRef.current = false;
    accTextRef.current = '';
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    try { recognitionRef.current?.abort(); } catch (_) {}
    setIsListening(false);
  };



  const fg = isLight ? 'hsl(270,20%,12%)' : 'white';
  const fgSub = isLight ? 'rgba(40,20,70,0.48)' : 'rgba(255,255,255,0.4)';
  const surfaceBg = isLight ? 'rgba(200,170,240,0.1)' : 'rgba(255,255,255,0.05)';
  const surfaceBorder = isLight ? 'rgba(160,100,220,0.16)' : 'rgba(255,255,255,0.09)';

  // Bottom offset = bottom nav (~64px) + keyboard height
  const bottomOffset = 64 + keyboardHeight;

  // Input bar height approx 68px + safe area
  const inputBarHeight = 72;
  const chatBottomPad = keyboardHeight > 0 ? keyboardHeight + inputBarHeight : inputBarHeight + 64;

  return (
    <>
    <div className="flex flex-col" style={{ minHeight: 'calc(100dvh - 320px)', paddingBottom: chatBottomPad }}>

      {/* Messages */}
      <div className="flex-1 space-y-3 mb-4 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {messages.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'ai' && (
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 overflow-hidden"
                style={{ background: '#000', boxShadow: '0 0 12px rgba(236,72,153,0.8), 0 0 24px rgba(139,92,246,0.5)' }}>
                <img src="https://media.base44.com/images/public/69fe90d3bbe7ad47925e4a0a/d35a8e8b1_D6FF6134-447D-4756-B3EA-A5C866B07C1B.png" alt="Spicey" className="w-7 h-7 object-contain" />
              </div>
            )}

            <div className="max-w-[78%] flex flex-col gap-2">
              {msg.role === 'user' && msg.media && (
                <div className="rounded-2xl overflow-hidden" style={{ maxWidth: 160 }}>
                  {msg.media.type === 'video'
                    ? <video src={msg.media.url} className="w-full rounded-2xl" style={{ maxHeight: 120, objectFit: 'cover' }} />
                    : <img src={msg.media.url} alt="" className="w-full rounded-2xl" style={{ maxHeight: 120, objectFit: 'cover' }} />}
                </div>
              )}
              {msg.role === 'user' ? (
                <div className="px-4 py-3 text-sm leading-relaxed"
                  style={{
                    background: 'linear-gradient(135deg, #ff5500, #e91e8c)', color: 'white',
                    borderRadius: '20px 20px 4px 20px', boxShadow: '0 0 16px rgba(255,85,0,0.3)',
                  }}>
                  {msg.text}
                </div>
              ) : i === 0 ? (
                <motion.div 
                  className="px-4 py-3 text-sm leading-relaxed"
                  animate={{
                    background: [
                      'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(168,85,240,0.15))',
                      'linear-gradient(135deg, rgba(168,85,240,0.15), rgba(236,72,153,0.15))',
                      'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(168,85,240,0.15))',
                    ],
                    boxShadow: [
                      '0 0 20px rgba(236,72,153,0.3), 0 0 40px rgba(168,85,240,0.2)',
                      '0 0 30px rgba(168,85,240,0.4), 0 0 50px rgba(236,72,153,0.3)',
                      '0 0 20px rgba(236,72,153,0.3), 0 0 40px rgba(168,85,240,0.2)',
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    border: '1px solid rgba(236,72,153,0.3)',
                    borderRadius: '20px 20px 20px 4px',
                    color: isLight ? 'hsl(270,20%,14%)' : 'rgba(255,255,255,0.95)',
                  }}>
                  <motion.span
                    animate={{
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    style={{
                      background: 'linear-gradient(90deg, #ec4899, #a855f0, #ec4899)',
                      backgroundSize: '200% 200%',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      fontWeight: '600',
                    }}>
                    {msg.text}
                  </motion.span>
                </motion.div>
              ) : (
                <div className="px-4 py-3 text-sm leading-relaxed"
                  style={{
                    background: isLight ? 'rgba(200,170,240,0.14)' : 'rgba(255,255,255,0.07)',
                    border: isLight ? '1px solid rgba(160,100,220,0.2)' : '1px solid rgba(255,255,255,0.1)',
                    color: isLight ? 'hsl(270,20%,14%)' : 'rgba(255,255,255,0.9)',
                    borderRadius: '20px 20px 20px 4px',
                  }}>
                  {msg.text}
                </div>
              )}
              {msg.role === 'ai' && msg.actions?.length > 0 && (
                <div className="flex flex-wrap gap-2 ml-1">
                  {msg.actions.map((action, ai) => (
                    <motion.button key={ai} whileTap={{ scale: 0.93 }}
                      onClick={() => handleAction(action, msg)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold text-white"
                      style={{
                        background: action.type === 'reel' ? 'linear-gradient(135deg, #7c3aed, #e91e8c)'
                          : action.type === 'story' ? 'linear-gradient(135deg, #0ea5e9, #8b5cf6)'
                          : 'linear-gradient(135deg, #ff5500, #e91e8c)',
                        boxShadow: '0 0 14px rgba(255,85,0,0.3)',
                      }}>
                      <span>{action.icon}</span>{action.label}
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {chatLoading && (
          <div className="flex gap-2.5 justify-start">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
              style={{ background: '#000', boxShadow: '0 0 12px rgba(236,72,153,0.8), 0 0 24px rgba(139,92,246,0.5)' }}>
              <img src="https://media.base44.com/images/public/69fe90d3bbe7ad47925e4a0a/d35a8e8b1_D6FF6134-447D-4756-B3EA-A5C866B07C1B.png" alt="Spicey" className="w-7 h-7 object-contain" />
            </div>
            <div className="px-1 py-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Starter chips — hide when keyboard is open */}
      {messages.filter(m => m.role === 'user').length === 0 && keyboardHeight === 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold mb-2.5 uppercase tracking-wider" style={{ color: fgSub }}>Try saying</p>
          <div className="grid grid-cols-2 gap-2">
            {CHAT_STARTERS.map((s, i) => (
              <motion.button key={i} whileTap={{ scale: 0.95 }}
                onClick={() => sendMessage(s.text)}
                className="px-3 py-2.5 rounded-xl text-left text-sm font-bold transition-all"
                style={{
                  background: 'linear-gradient(135deg, #ff5500, #e91e8c)',
                  color: '#FFFFFF',
                  borderRadius: '20px 20px 4px 20px',
                  boxShadow: '0 0 16px rgba(255,85,0,0.3)',
                }}>
                <span>{s.text}</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {isListening && <ListeningOrb onStop={() => {}} />}
      </AnimatePresence>
    </div>

    {/* Input bar — fixed above keyboard */}
    {!isListening && (
      <div
        className="fixed left-0 right-0 z-50 px-4 pb-2 pt-2"
        style={{
          bottom: keyboardHeight > 0 ? keyboardHeight : 64,
          background: 'rgba(10,10,10,0.96)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          transition: 'bottom 0.2s ease',
        }}
      >
        <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleAttach} />

        {/* Attached media preview */}
        <AnimatePresence>
          {attachedMedia && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
              className="mb-2 relative inline-flex" style={{ maxWidth: 100 }}>
              {attachedMedia.type === 'video'
                ? <video src={attachedMedia.url} className="w-20 h-20 rounded-xl object-cover" />
                : <img src={attachedMedia.url} alt="" className="w-20 h-20 rounded-xl object-cover" />}
              <button onClick={removeAttachment}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(220,30,30,0.9)' }}>
                <X className="w-3 h-3 text-white" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Speaking indicator */}
        <AnimatePresence>
          {isSpeakingState && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
              className="flex items-center justify-between px-4 py-2 mb-2 rounded-2xl"
              style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}>
              <div className="flex items-center gap-2 text-xs" style={{ color: '#a78bfa' }}>
                <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.5, repeat: Infinity }}>
                  <Volume2 className="w-3.5 h-3.5" />
                </motion.div>
                AI Speaking…
              </div>
              <button onClick={stopSpeaking} className="opacity-60 active:opacity-100">
                <MicOff className="w-3.5 h-3.5" style={{ color: '#a78bfa' }} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2 items-end">
          <motion.button whileTap={{ scale: 0.88 }} onClick={() => fileInputRef.current?.click()}
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <ImagePlus className="w-5 h-5" style={{ color: isLight ? 'rgba(40,20,70,0.5)' : 'rgba(255,255,255,0.45)' }} />
          </motion.button>

          <div className="flex-1 flex items-center gap-2 px-4 rounded-2xl"
            style={{
              background: isLight ? 'rgba(200,170,240,0.12)' : 'rgba(255,255,255,0.07)',
              border: isLight ? '1px solid rgba(160,100,220,0.2)' : '1px solid rgba(255,255,255,0.12)',
              minHeight: 48,
            }}>
            <textarea ref={inputRef} value={chatInput}
              onChange={e => { setChatInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px'; }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Ask AI or give a command…"
              rows={1}
              className="flex-1 bg-transparent text-sm outline-none resize-none py-3"
              style={{ fontSize: 16, maxHeight: 96, color: fg }} />
          </div>

          <motion.button whileTap={{ scale: 0.9 }} onClick={() => sendMessage()}
            disabled={!chatInput.trim() || chatLoading}
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 disabled:opacity-35"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #e91e8c)', boxShadow: '0 0 18px rgba(139,92,246,0.5)' }}>
            <Send className="w-4 h-4 text-white" style={{ marginLeft: 2 }} />
          </motion.button>
        </div>
      </div>
    )}

    {previewModal && (
      <AIPostPreviewModal {...previewModal} isLight={isLight}
        onClose={() => setPreviewModal(null)} onPublish={handlePublish} />
    )}

    {confirmAction && (
      <AIActionConfirmModal
        intent={confirmAction.intent}
        params={confirmAction.params}
        previewData={confirmAction.previewData}
        isLight={isLight}
        onConfirm={confirmAction.onConfirm}
        onCancel={() => setConfirmAction(null)}
      />
    )}
    </>
  );
}