import React, { useState, useRef, useEffect } from 'react';
import { Send, ImagePlus, X, Volume2, MicOff, Headphones } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import AIPostPreviewModal from './AIPostPreviewModal';
import AIActionConfirmModal from './AIActionConfirmModal';
import { parseVoiceCommand } from './voiceCommandParser';

const CHAT_STARTERS = [
  { icon: '✍️', text: 'Write a post caption' },
  { icon: '🔥', text: 'Best hashtags now' },
  { icon: '🎬', text: 'Give me a Reel idea' },
  { icon: '📖', text: 'Story caption' },
];

function detectContentActions(text) {
  const lower = text.toLowerCase();
  const actions = [];
  const hasCaption = lower.includes('caption') || lower.includes('post this') || lower.includes("here's your");
  const hasHashtags = lower.includes('#') || lower.includes('hashtag');
  const isReel = lower.includes('reel') || lower.includes('video idea');
  const isStory = lower.includes('story') || lower.includes('stories');
  const looksLikeContent = hasCaption || hasHashtags || text.split('\n').some(l => l.startsWith('#'));
  if (looksLikeContent) {
    if (isStory) actions.push({ label: 'Post to Story', icon: '📖', type: 'story' });
    else if (isReel) actions.push({ label: 'Create Reel', icon: '🎬', type: 'reel' });
    else {
      actions.push({ label: 'Post to Feed', icon: '📸', type: 'feed' });
      actions.push({ label: 'Post to Story', icon: '📖', type: 'story' });
    }
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

function playUISound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    if (type === 'send') {
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(740, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.12);
    } else if (type === 'receive') {
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(660, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.28);
    }
    osc.onended = () => ctx.close();
  } catch (_) {}
}

export default function AITextChat({ isLight, initialPrompt }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hey! I'm Spicey AI 🔥 Ask me to write captions, generate hashtags, or help with posts. Type below!" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [attachedMedia, setAttachedMedia] = useState(null);
  const fileInputRef = useRef(null);
  const [voiceEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [previewModal, setPreviewModal] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const lastAIContentRef = useRef('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Auto-send initialPrompt when coming from home screen quick actions
  useEffect(() => {
    if (initialPrompt) {
      setTimeout(() => sendMessage(initialPrompt), 300);
    }
  }, []);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () => {
      const kbH = window.innerHeight - vv.height - vv.offsetTop;
      setKeyboardHeight(Math.max(0, kbH));
    };
    vv.addEventListener('resize', onResize);
    return () => vv.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, [messages, chatLoading]);

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
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

  const handleVoiceCommand = async (command) => {
    const { intent, params } = command;
    const navIntents = ['open_profile', 'open_notifications', 'open_messages', 'open_explore'];
    if (navIntents.includes(intent)) {
      const routeMap = { open_profile: '/profile', open_notifications: '/notifications', open_messages: '/messages', open_explore: '/explore' };
      setMessages(prev => [...prev, { role: 'ai', text: `Taking you to ${intent.replace('open_', '').replace('_', ' ')} 👉` }]);
      setConfirmAction({ intent, params, previewData: null, onConfirm: () => { setConfirmAction(null); navigate(routeMap[intent]); } });
      return;
    }
    if (['post_feed', 'post_story', 'create_reel'].includes(intent)) {
      const caption = lastAIContentRef.current || '';
      const typeLabel = intent === 'post_story' ? 'story' : intent === 'create_reel' ? 'reel' : 'feed';
      setMessages(prev => [...prev, { role: 'ai', text: caption ? `Here's a preview of your ${typeLabel} post. Confirm to publish 🚀` : `I'll take you to the ${typeLabel} creator. Let's go! 🚀` }]);
      setConfirmAction({
        intent, params, previewData: caption ? { caption } : null,
        onConfirm: () => {
          setConfirmAction(null);
          if (intent === 'create_reel') navigate('/create', { state: { aiCaption: caption, aiMode: 'reel' } });
          else if (intent === 'post_story') navigate('/create', { state: { aiCaption: caption, aiMode: 'story' } });
          else navigate('/create', { state: { aiCaption: caption, aiMode: 'feed' } });
        },
      });
    }
  };

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

    const command = parseVoiceCommand(text);
    if (command) { await handleVoiceCommand(command); return; }

    setChatLoading(true);
    let uploadedUrl = null;
    if (mediaForAI) {
      try {
        const res = await base44.integrations.Core.UploadFile({ file: mediaForAI.file });
        uploadedUrl = res.file_url;
      } catch (_) {}
    }

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are Spicey AI, a smart social media assistant. ${uploadedUrl ? 'The user attached media - analyze it. ' : ''}Be helpful and concise. User says: "${text}"`,
        file_urls: uploadedUrl ? [uploadedUrl] : undefined,
      });
      lastAIContentRef.current = response;
      const actions = detectContentActions(response);
      playUISound('receive');
      setMessages(prev => [...prev, { role: 'ai', text: response, actions, mediaPreviewUrl, mediaType }]);
      setChatLoading(false);
    } catch (llmErr) {
      setChatLoading(false);
      const fallback = `Spicey AI preview is ready. For "${text}", try this:\n\n${text.length < 45 ? 'Make it short, visual, and add one strong hook in the first line.' : 'Cut the message shorter, keep the strongest idea first, and add 3 focused hashtags.'}`;
      lastAIContentRef.current = fallback;
      setMessages(prev => [...prev, { role: 'ai', text: fallback, actions: detectContentActions(fallback) }]);
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

  const fg = isLight ? 'hsl(270,20%,12%)' : 'white';
  const fgSub = isLight ? 'rgba(40,20,70,0.48)' : 'rgba(255,255,255,0.4)';
  const hasUserMessages = messages.some(m => m.role === 'user');

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
    }}>
      {/* Scrollable messages area */}
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', padding: '16px 16px 8px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', gap: 10, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {msg.role === 'ai' && (
                <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #ff5500, #e91e8c)', boxShadow: '0 0 12px rgba(236,72,153,0.8)', marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 16, lineHeight: 1 }}>🔥</span>
                </div>
                  )}
                  <div style={{ maxWidth: '80%', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {msg.role === 'user' && msg.media && (
                  <div style={{ borderRadius: 16, overflow: 'hidden', maxWidth: 160 }}>
                    {msg.media.type === 'video'
                      ? <video src={msg.media.url} style={{ width: '100%', maxHeight: 120, objectFit: 'cover' }} />
                      : <img src={msg.media.url} alt="" style={{ width: '100%', maxHeight: 120, objectFit: 'cover' }} />}
                  </div>
                )}
                {msg.role === 'user' ? (
                  <div style={{ padding: '12px 16px', fontSize: 14, lineHeight: 1.5, background: 'linear-gradient(135deg, #ff5500, #e91e8c)', color: 'white', borderRadius: '20px 20px 4px 20px', boxShadow: '0 0 16px rgba(255,85,0,0.3)' }}>
                    {msg.text}
                  </div>
                ) : (
                  <div style={{ padding: '12px 16px', fontSize: 14, lineHeight: 1.5, background: isLight ? (i === 0 ? 'rgba(88,86,214,0.07)' : '#FFFFFF') : 'linear-gradient(135deg, rgba(18,8,28,0.96), rgba(45,13,52,0.94))', border: isLight ? (i === 0 ? '1px solid rgba(88,86,214,0.15)' : '1px solid rgba(0,0,0,0.07)') : '1px solid rgba(255,85,190,0.2)', color: isLight ? '#1C1C1E' : 'rgba(255,255,255,0.95)', borderRadius: '20px 20px 20px 4px', boxShadow: isLight ? '0 1px 4px rgba(0,0,0,0.05)' : '0 0 18px rgba(233,30,140,0.12)' }}>
                    {msg.text}
                  </div>
                )}
                {msg.role === 'ai' && msg.actions?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginLeft: 4 }}>
                    {msg.actions.map((action, ai) => (
                      <motion.button key={ai} whileTap={{ scale: 0.93 }} onClick={() => handleAction(action, msg)}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, color: 'white', border: 'none', cursor: 'pointer', background: action.type === 'reel' ? 'linear-gradient(135deg, #7c3aed, #e91e8c)' : action.type === 'story' ? 'linear-gradient(135deg, #0ea5e9, #8b5cf6)' : 'linear-gradient(135deg, #ff5500, #e91e8c)' }}>
                        {action.icon} {action.label}
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {chatLoading && (
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', background: '#000', boxShadow: '0 0 12px rgba(236,72,153,0.8)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 18, lineHeight: 1 }}>🔥</span>
              </div>
              <div style={{ padding: '4px', borderRadius: 20, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <TypingDots />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Starter chips — shown only before first user message, above input */}
      {!hasUserMessages && (
        <div style={{ flexShrink: 0, padding: '8px 16px 0' }}>
          <p style={{ fontSize: 11, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em', color: fgSub }}>Try asking</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {CHAT_STARTERS.map((s, i) => (
              <motion.button key={i} whileTap={{ scale: 0.95 }} onClick={() => sendMessage(s.text)}
                style={{ padding: '10px 12px', borderRadius: '20px 20px 4px 20px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#fff', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #ff5500, #e91e8c)', boxShadow: '0 0 16px rgba(255,85,0,0.3)' }}>
                {s.icon} {s.text}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Input bar — always at bottom, never overlaps */}
      <div style={{
        flexShrink: 0,
        padding: `8px 22px`,
        paddingBottom: keyboardHeight > 0 ? `${keyboardHeight + 8}px` : 'max(12px, env(safe-area-inset-bottom))',
        background: isLight ? 'rgba(242,242,247,0.97)' : 'rgba(10,10,10,0.96)',
        backdropFilter: 'blur(16px)',
        borderTop: isLight ? '1px solid rgba(0,0,0,0.07)' : '1px solid rgba(255,255,255,0.06)',
      }}>
        <input ref={fileInputRef} type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={handleAttach} />

        {attachedMedia && (
          <div style={{ marginBottom: 8, position: 'relative', display: 'inline-flex' }}>
            {attachedMedia.type === 'video'
              ? <video src={attachedMedia.url} style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'cover' }} />
              : <img src={attachedMedia.url} alt="" style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'cover' }} />}
            <button onClick={removeAttachment} style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: 'rgba(220,30,30,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={12} color="white" />
            </button>
          </div>
        )}

        {isSpeaking && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', marginBottom: 8, borderRadius: 20, background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#a78bfa' }}>
              <Volume2 size={14} /> AI Reading Aloud…
            </div>
            <button onClick={stopSpeaking} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <MicOff size={14} color="#a78bfa" />
            </button>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <motion.button whileTap={{ scale: 0.88 }} onClick={() => fileInputRef.current?.click()}
            style={{ width: 48, height: 48, borderRadius: 16, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isLight ? '#FFFFFF' : 'rgba(255,255,255,0.06)', border: isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', boxShadow: isLight ? '0 1px 4px rgba(0,0,0,0.05)' : 'none' }}>
            <ImagePlus size={20} color={isLight ? 'rgba(40,20,70,0.5)' : 'rgba(255,255,255,0.45)'} />
          </motion.button>

          <div style={{ flex: 1, maxWidth: 250, display: 'flex', alignItems: 'center', padding: '0 14px', borderRadius: 16, background: isLight ? '#FFFFFF' : 'linear-gradient(135deg, rgba(18,8,28,0.94), rgba(45,13,52,0.9))', border: isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,85,190,0.18)', minHeight: 46, boxShadow: isLight ? '0 1px 4px rgba(0,0,0,0.05)' : '0 0 18px rgba(233,30,140,0.12)' }}>
            <textarea ref={inputRef} value={chatInput}
              onChange={e => { setChatInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px'; }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Type your message…" rows={1}
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', resize: 'none', fontSize: 16, maxHeight: 96, color: fg, fontFamily: 'inherit', padding: '12px 0' }} />
          </div>

          <motion.button whileTap={{ scale: 0.9 }} onClick={() => sendMessage()}
            disabled={!chatInput.trim() || chatLoading}
            style={{ width: 48, height: 48, borderRadius: 16, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #8b5cf6, #e91e8c)', boxShadow: '0 0 18px rgba(139,92,246,0.5)', border: 'none', cursor: 'pointer', opacity: (!chatInput.trim() || chatLoading) ? 0.35 : 1 }}>
            <Send size={18} color="white" />
          </motion.button>
        </div>
      </div>

      {previewModal && (
        <AIPostPreviewModal {...previewModal} isLight={isLight} onClose={() => setPreviewModal(null)} onPublish={handlePublish} />
      )}
      {confirmAction && (
        <AIActionConfirmModal intent={confirmAction.intent} params={confirmAction.params} previewData={confirmAction.previewData} isLight={isLight} onConfirm={confirmAction.onConfirm} onCancel={() => setConfirmAction(null)} />
      )}
    </div>
  );
}
