import React, { useState, useRef, useEffect } from 'react';
import { Send, ImagePlus, X, Volume2, MicOff, Headphones, Mic, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import AIPostPreviewModal from './AIPostPreviewModal';
import AIActionConfirmModal from './AIActionConfirmModal';
import { parseVoiceCommand } from './voiceCommandParser';

const CHAT_STARTERS = [
  { icon: '✍️', text: 'Write a post caption' },
  { icon: '🔥', text: 'Best hashtags now' },
  { icon: '🎬', text: 'Give me a Spicey Clip idea' },
  { icon: '📖', text: 'Moment caption' },
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
    if (isStory) actions.push({ label: 'Post to Moment', icon: '📖', type: 'story' });
    else if (isReel) actions.push({ label: 'Create Spicey Clip', icon: '🎬', type: 'reel' });
    else {
      actions.push({ label: 'Post to Feed', icon: '📸', type: 'feed' });
      actions.push({ label: 'Post to Moment', icon: '📖', type: 'story' });
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

function formatChatTime(timestamp) {
  const date = timestamp ? new Date(timestamp) : new Date();
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export default function AITextChat({ isLight, initialPrompt, onClose }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hey! I'm Spicey AI 🔥 Ask me to write captions, generate hashtags, or help with posts. Type below!", createdAt: Date.now() }
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
  const [inputFocused, setInputFocused] = useState(false);
  const [currentUserAvatar, setCurrentUserAvatar] = useState('');

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
    const nav = document.getElementById('bottom-nav');
    const previousDisplay = nav?.style.display || '';
    if (nav) nav.style.display = 'none';
    document.body.classList.add('spicey-ai-chat-open');
    return () => {
      if (nav) nav.style.display = previousDisplay;
      document.body.classList.remove('spicey-ai-chat-open');
    };
  }, []);

  useEffect(() => {
    let alive = true;

    const loadUserAvatar = async () => {
      try {
        const user = await base44.auth.me();
        const profiles = await base44.entities.UserProfile
          .filter({ user_id: user.id }, '-created_date', 1)
          .catch(() => []);
        const profile = profiles?.[0] || {};
        const avatar = profile.avatar_url || profile.avatar || user.avatar_url || user.photo_url || '';
        const fallbackName = user.full_name || user.username || user.email || 'You';
        const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=ff2d8f&color=fff&size=160`;
        if (alive) setCurrentUserAvatar(avatar || fallbackAvatar);
      } catch (_) {
        if (alive) setCurrentUserAvatar('https://ui-avatars.com/api/?name=You&background=ff2d8f&color=fff&size=160');
      }
    };

    loadUserAvatar();
    return () => {
      alive = false;
    };
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
      setMessages(prev => [...prev, { role: 'ai', text: `Taking you to ${intent.replace('open_', '').replace('_', ' ')} 👉`, createdAt: Date.now() }]);
      setConfirmAction({ intent, params, previewData: null, onConfirm: () => { setConfirmAction(null); navigate(routeMap[intent]); } });
      return;
    }
    if (['post_feed', 'post_story', 'create_reel'].includes(intent)) {
      const caption = lastAIContentRef.current || '';
      const typeLabel = intent === 'post_story' ? 'story' : intent === 'create_reel' ? 'reel' : 'feed';
      setMessages(prev => [...prev, { role: 'ai', text: caption ? `Here's a preview of your ${typeLabel} post. Confirm to publish 🚀` : `I'll take you to the ${typeLabel} creator. Let's go! 🚀`, createdAt: Date.now() }]);
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

    const userMsg = { role: 'user', text, createdAt: Date.now(), media: attachedMedia ? { url: attachedMedia.url, type: attachedMedia.type } : null };
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
      setMessages(prev => [...prev, { role: 'ai', text: response, actions, mediaPreviewUrl, mediaType, createdAt: Date.now() }]);
      setChatLoading(false);
    } catch (llmErr) {
      setChatLoading(false);
      const fallback = `Spicey AI preview is ready. For "${text}", try this:\n\n${text.length < 45 ? 'Make it short, visual, and add one strong hook in the first line.' : 'Cut the message shorter, keep the strongest idea first, and add 3 focused hashtags.'}`;
      lastAIContentRef.current = fallback;
      setMessages(prev => [...prev, { role: 'ai', text: fallback, actions: detectContentActions(fallback), createdAt: Date.now() }]);
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
    <div className={`spicey-ai-chat-reference ${isLight ? 'is-light' : 'is-dark'} ${inputFocused ? 'is-keyboard' : ''}`}>
      <div className="chat-ref-wave chat-ref-wave-left" />
      <div className="chat-ref-wave chat-ref-wave-right" />

      <div className="chat-ref-status" aria-hidden="true">
        <span>9:41</span>
        <span>▮▮▮ ◖◗ ▰</span>
      </div>

      <header className="chat-ref-top">
        <button
          type="button"
          className="chat-ref-round chat-ref-back"
          onClick={() => {
            if (typeof onClose === 'function') onClose();
            else navigate('/ai');
          }}
          aria-label="Back"
        >
          ‹
        </button>
      </header>

      <section className="chat-ref-identity">
        <div className="chat-ref-main-orb">
          <img src="/spicey-assets/spicey-s-symbol.svg" alt="" />
        </div>
        <h1>Spicey AI <b>✓</b></h1>
        <p><i /> Online</p>
        <span>Today</span>
      </section>

      <main className="chat-ref-stream">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`chat-ref-row ${msg.role === 'user' ? 'is-user' : 'is-ai'}`}
          >
            {msg.role === 'ai' && (
              <div className="chat-ref-avatar">
                <img src="/spicey-assets/spicey-s-symbol.svg" alt="" />
              </div>
            )}
            <div className="chat-ref-bubble">
              {msg.role === 'user' && msg.media && (
                <div className="chat-ref-media">
                  {msg.media.type === 'video'
                    ? <video src={msg.media.url} />
                    : <img src={msg.media.url} alt="" />}
                </div>
              )}
              <p>{msg.text}</p>
              <small>{formatChatTime(msg.createdAt)}{msg.role === 'user' ? ' ✓✓' : ''}</small>
              {msg.role === 'ai' && msg.actions?.length > 0 && (
                <div className="chat-ref-actions">
                  {msg.actions.map((action, ai) => (
                    <button key={ai} type="button" onClick={() => handleAction(action, msg)}>
                      {action.icon} {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="chat-ref-user-avatar">
                {currentUserAvatar ? <img src={currentUserAvatar} alt="" /> : <span>You</span>}
              </div>
            )}
          </motion.div>
        ))}
        {chatLoading && (
          <div className="chat-ref-row is-ai">
            <div className="chat-ref-avatar"><img src="/spicey-assets/spicey-s-symbol.svg" alt="" /></div>
            <div className="chat-ref-bubble chat-ref-typing"><TypingDots /></div>
          </div>
        )}
        <div ref={chatEndRef} />
      </main>

      <form
        className="chat-ref-input"
        onSubmit={(event) => {
          event.preventDefault();
          sendMessage();
        }}
      >
        <input ref={fileInputRef} type="file" accept="image/*,video/*" hidden onChange={handleAttach} />
        <button type="button" className="chat-ref-plus" onClick={() => fileInputRef.current?.click()} aria-label="Attach">+</button>
        <div className="chat-ref-field">
          {attachedMedia && (
            <button type="button" className="chat-ref-attachment" onClick={removeAttachment}>
              {attachedMedia.type === 'video' ? 'Video ready' : 'Photo ready'} <X size={12} />
            </button>
          )}
          <textarea
            ref={inputRef}
            value={chatInput}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            onChange={(event) => {
              setChatInput(event.target.value);
              event.target.style.height = 'auto';
              event.target.style.height = `${Math.min(event.target.scrollHeight, 82)}px`;
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type a message..."
            rows={1}
          />
          <button type="button" className="chat-ref-mic" onClick={() => inputRef.current?.focus()} aria-label="Mic"><Mic size={22} /></button>
        </div>
        <button type="submit" className="chat-ref-send" disabled={!chatInput.trim() || chatLoading} aria-label="Send">
          <Sparkles size={24} />
        </button>
      </form>

      {previewModal && (
        <AIPostPreviewModal {...previewModal} isLight={isLight} onClose={() => setPreviewModal(null)} onPublish={handlePublish} />
      )}
      {confirmAction && (
        <AIActionConfirmModal intent={confirmAction.intent} params={confirmAction.params} previewData={confirmAction.previewData} isLight={isLight} onConfirm={confirmAction.onConfirm} onCancel={() => setConfirmAction(null)} />
      )}

      <style>{`
        body.spicey-ai-chat-open #bottom-nav,
        body.spicey-ai-chat-open .ai-ref-bottom-nav,
        body.spicey-ai-chat-open .ai-bottom-input {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }
        .ai-chat-shell {
          position: fixed !important;
          inset: 0 !important;
          z-index: 9000 !important;
          padding: 0 !important;
          border-radius: 0 !important;
          background: #02030b !important;
          overflow: hidden !important;
        }
        .ai-chat-shell > .ai-close-chat {
          display: none !important;
        }
        .spicey-ai-chat-reference {
          position: fixed;
          inset: 0;
          left: 50%;
          width: min(100vw, 430px);
          height: 100dvh;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          color: #fff;
          background:
            radial-gradient(circle at 50% 4%, rgba(255,45,143,.18), transparent 24%),
            radial-gradient(circle at 96% 28%, rgba(139,53,255,.12), transparent 32%),
            linear-gradient(180deg, #02030b 0%, #03040e 50%, #010208 100%);
          font-family: Inter, Avenir Next, system-ui, sans-serif;
          box-shadow: 0 0 90px rgba(0,0,0,.72);
        }
        .spicey-ai-chat-reference.is-light {
          color: #15101d;
          background:
            radial-gradient(circle at 50% 4%, rgba(255,45,143,.12), transparent 24%),
            radial-gradient(circle at 86% 24%, rgba(139,53,255,.10), transparent 32%),
            linear-gradient(180deg, #fff 0%, #fff8fc 55%, #fff 100%);
        }
        .chat-ref-wave {
          position: absolute;
          top: 88px;
          width: 76vw;
          height: 150px;
          pointer-events: none;
          filter: blur(1.2px) saturate(1.16);
          opacity: .9;
          clip-path: polygon(0 45%, 19% 36%, 38% 55%, 62% 30%, 82% 48%, 100% 42%, 100% 58%, 82% 66%, 62% 50%, 38% 72%, 19% 54%, 0 65%);
        }
        .chat-ref-wave-left {
          left: -18vw;
          background: linear-gradient(90deg, transparent, rgba(255,80,42,.76), rgba(255,45,143,.58), transparent);
          transform: rotate(-10deg);
        }
        .chat-ref-wave-right {
          right: -18vw;
          background: linear-gradient(90deg, transparent, rgba(139,53,255,.78), rgba(255,45,143,.52), transparent);
          transform: rotate(8deg) scaleX(-1);
        }
        .spicey-ai-chat-reference.is-light .chat-ref-wave {
          opacity: .22;
        }
        .chat-ref-status {
          position: relative;
          z-index: 3;
          height: 42px;
          padding: max(10px, env(safe-area-inset-top)) 38px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 22px;
          line-height: 1;
          font-weight: 850;
          color: inherit;
        }
        .chat-ref-status span:last-child {
          font-size: 17px;
          letter-spacing: 2px;
        }
        .chat-ref-top {
          position: relative;
          z-index: 3;
          height: 62px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 20px 0;
        }
        .chat-ref-round {
          width: 52px;
          height: 52px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,.08);
          background: rgba(255,255,255,.055);
          color: #fff;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 16px 34px rgba(0,0,0,.28);
          cursor: pointer;
        }
        .chat-ref-back {
          color: #ff2d8f;
          font-size: 46px;
          font-weight: 250;
          padding-bottom: 5px;
        }
        .chat-ref-menu {
          font-size: 21px;
          letter-spacing: 2px;
        }
        .spicey-ai-chat-reference.is-light .chat-ref-round {
          background: rgba(255,255,255,.82);
          color: #15101d;
          border-color: rgba(255,45,143,.10);
          box-shadow: 0 12px 28px rgba(60,28,70,.12);
        }
        .spicey-ai-chat-reference.is-light .chat-ref-back {
          color: #ff1471;
        }
        .chat-ref-identity {
          position: relative;
          z-index: 2;
          margin-top: -29px;
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 0 0 auto;
        }
        .chat-ref-main-orb {
          position: relative;
          width: 148px;
          height: 148px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background:
            radial-gradient(circle at 50% 48%, rgba(255,45,143,.18), transparent 42%),
            radial-gradient(circle at 38% 27%, rgba(255,255,255,.08), transparent 24%),
            linear-gradient(145deg, rgba(6,4,13,.98), rgba(0,1,7,.99));
          border: 1px solid rgba(255,255,255,.10);
          box-shadow: 0 0 42px rgba(255,45,143,.36), 0 0 72px rgba(139,53,255,.24), inset 0 1px 0 rgba(255,255,255,.11);
        }
        .chat-ref-main-orb::before {
          content: "";
          position: absolute;
          inset: -9px;
          z-index: -1;
          border-radius: 50%;
          opacity: .52;
          filter: blur(10px);
          background: conic-gradient(from 220deg, rgba(255,122,24,.96), rgba(255,45,143,.82), rgba(139,53,255,.95), rgba(255,122,24,.96));
        }
        .chat-ref-main-orb img {
          width: 104px;
          height: 104px;
          object-fit: contain;
          filter: drop-shadow(0 0 18px rgba(255,45,143,.62)) drop-shadow(0 0 12px rgba(255,122,24,.28));
        }
        .chat-ref-identity h1 {
          margin: 12px 0 0;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 26px;
          line-height: 1;
          font-weight: 850;
          color: inherit;
        }
        .chat-ref-identity h1 b {
          width: 23px;
          height: 23px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          color: #fff;
          background: linear-gradient(135deg, #8b35ff, #a855f7);
          font-size: 13px;
          box-shadow: 0 0 12px rgba(139,53,255,.38);
        }
        .chat-ref-identity p {
          margin: 8px 0 0;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 16px;
          line-height: 1;
          color: rgba(255,255,255,.90);
        }
        .chat-ref-identity p i {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #10e26b;
          box-shadow: 0 0 10px rgba(16,226,107,.60);
        }
        .chat-ref-identity span {
          margin-top: 28px;
          padding: 8px 18px;
          border-radius: 14px;
          background: rgba(255,255,255,.075);
          color: rgba(255,255,255,.90);
          font-size: 15px;
          font-weight: 700;
        }
        .spicey-ai-chat-reference.is-light .chat-ref-identity p,
        .spicey-ai-chat-reference.is-light .chat-ref-identity span {
          color: rgba(21,16,29,.76);
        }
        .spicey-ai-chat-reference.is-light .chat-ref-identity span {
          background: rgba(255,255,255,.84);
          box-shadow: 0 8px 24px rgba(60,28,70,.10);
        }
        .chat-ref-stream {
          position: relative;
          z-index: 2;
          flex: 1 1 auto;
          min-height: 0;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          padding: 14px 19px 108px;
          scrollbar-width: none;
        }
        .chat-ref-stream::-webkit-scrollbar { display: none; }
        .chat-ref-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 18px;
        }
        .chat-ref-row.is-user {
          justify-content: flex-end;
        }
        .chat-ref-avatar {
          width: 48px;
          height: 48px;
          flex: 0 0 48px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          border: 2px solid transparent;
          background-image: linear-gradient(#070713, #070713), linear-gradient(135deg, #7d2dff, #ff1471 50%, #ff8a18);
          background-origin: border-box;
          background-clip: padding-box, border-box;
          box-shadow: 0 0 18px rgba(255,45,143,.20);
        }
        .chat-ref-avatar img {
          width: 34px;
          height: 34px;
          object-fit: contain;
        }
        .chat-ref-bubble {
          max-width: 292px;
          padding: 14px 16px 11px;
          border-radius: 18px;
          color: #fff;
          background: linear-gradient(145deg, rgba(19,22,34,.96), rgba(9,11,21,.97));
          border: 1px solid rgba(255,255,255,.08);
          border-left-color: rgba(255,122,24,.74);
          border-bottom-left-radius: 4px;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.05), 0 16px 30px rgba(0,0,0,.20);
        }
        .chat-ref-row.is-user .chat-ref-bubble {
          max-width: 258px;
          border: 0;
          border-bottom-left-radius: 18px;
          border-bottom-right-radius: 4px;
          background: linear-gradient(135deg, #c510c9 0%, #ff2d72 54%, #ff8a18 100%);
          box-shadow: 0 18px 34px rgba(255,45,143,.20);
        }
        .chat-ref-bubble p {
          margin: 0;
          white-space: pre-line;
          font-size: 16px;
          line-height: 1.42;
          font-weight: 500;
        }
        .chat-ref-bubble small {
          display: block;
          margin-top: 8px;
          color: rgba(255,255,255,.52);
          font-size: 11px;
          line-height: 1;
        }
        .chat-ref-row.is-user .chat-ref-bubble small {
          color: rgba(255,255,255,.86);
          text-align: right;
        }
        .spicey-ai-chat-reference.is-light .chat-ref-bubble {
          color: #111018;
          background: #fff;
          border-color: rgba(20,16,28,.05);
          box-shadow: 0 18px 36px rgba(45,26,70,.10);
        }
        .spicey-ai-chat-reference.is-light .chat-ref-row.is-user .chat-ref-bubble {
          color: #fff;
          background: linear-gradient(135deg, #c510c9 0%, #ff2d72 54%, #ff8a18 100%);
        }
        .chat-ref-media {
          overflow: hidden;
          margin-bottom: 8px;
          border-radius: 14px;
        }
        .chat-ref-media img,
        .chat-ref-media video {
          display: block;
          width: 100%;
          max-height: 140px;
          object-fit: cover;
        }
        .chat-ref-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-top: 10px;
        }
        .chat-ref-actions button {
          border: 0;
          border-radius: 999px;
          padding: 7px 10px;
          color: #fff;
          background: linear-gradient(135deg, #ff5500, #e91e8c);
          font-size: 11px;
          font-weight: 800;
        }
        .chat-ref-input {
          position: absolute;
          left: 14px;
          right: 14px;
          bottom: max(14px, env(safe-area-inset-bottom));
          z-index: 5;
          display: grid;
          grid-template-columns: 48px minmax(0, 1fr) 48px;
          align-items: center;
          gap: 9px;
          padding: 9px;
          border-radius: 30px;
          background: rgba(4,5,14,.94);
          border: 1px solid rgba(255,255,255,.10);
          box-shadow: 0 18px 42px rgba(0,0,0,.36), inset 0 1px 0 rgba(255,255,255,.06);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }
        .spicey-ai-chat-reference.is-light .chat-ref-input {
          background: rgba(255,255,255,.92);
          border-color: rgba(255,45,143,.10);
          box-shadow: 0 18px 42px rgba(60,28,70,.12);
        }
        .chat-ref-plus,
        .chat-ref-send {
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,.12);
          color: #fff;
          background: rgba(255,255,255,.05);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.07), 0 0 18px rgba(255,45,143,.12);
          cursor: pointer;
        }
        .chat-ref-plus {
          font-size: 34px;
          font-weight: 300;
        }
        .chat-ref-send {
          background: radial-gradient(circle at 34% 22%, rgba(255,255,255,.24), transparent 28%), linear-gradient(135deg, #7d2dff 0%, #d719d8 50%, #ff8a18 100%);
          box-shadow: 0 0 24px rgba(255,45,143,.34), inset 0 1px 0 rgba(255,255,255,.22);
        }
        .chat-ref-send:disabled {
          opacity: .55;
        }
        .chat-ref-field {
          position: relative;
          min-height: 46px;
          display: flex;
          align-items: center;
          min-width: 0;
          padding: 0 42px 0 16px;
          border-radius: 24px;
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.07);
        }
        .spicey-ai-chat-reference.is-light .chat-ref-field {
          background: rgba(245,242,248,.92);
          border-color: rgba(23,18,30,.05);
        }
        .chat-ref-field textarea {
          width: 100%;
          min-width: 0;
          max-height: 82px;
          border: 0;
          outline: 0;
          resize: none;
          background: transparent;
          color: inherit;
          font-family: inherit;
          font-size: 15px;
          line-height: 1.25;
          font-weight: 500;
          padding: 13px 0;
          scrollbar-width: none;
        }
        .chat-ref-field textarea::placeholder {
          color: rgba(255,255,255,.48);
        }
        .spicey-ai-chat-reference.is-light .chat-ref-field textarea::placeholder {
          color: rgba(18,15,24,.42);
        }
        .chat-ref-mic {
          position: absolute;
          right: 8px;
          bottom: 6px;
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border: 0;
          color: #ff1471;
          background: transparent;
          cursor: pointer;
        }
        .chat-ref-attachment {
          position: absolute;
          left: 8px;
          top: -30px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 0;
          border-radius: 999px;
          padding: 6px 9px;
          color: #fff;
          background: linear-gradient(135deg, #ff5500, #e91e8c);
          font-size: 11px;
          font-weight: 800;
        }
        .spicey-ai-chat-reference.is-keyboard .chat-ref-status {
          display: none;
        }
        .spicey-ai-chat-reference.is-keyboard .chat-ref-top {
          height: 42px;
          padding-top: 6px;
        }
        .spicey-ai-chat-reference.is-keyboard .chat-ref-identity {
          transform: scale(.70) translateY(-52px);
          margin-bottom: -88px;
        }
        .spicey-ai-chat-reference.is-keyboard .chat-ref-stream {
          padding-bottom: 92px;
        }
        .spicey-ai-chat-reference.is-keyboard .chat-ref-input {
          bottom: max(10px, env(safe-area-inset-bottom));
        }
        @media (max-width: 430px) {
          .spicey-ai-chat-reference {
            width: 100vw;
            box-shadow: none;
          }
          .chat-ref-status {
            padding-left: 38px;
            padding-right: 32px;
          }
          .chat-ref-top {
            padding-left: 20px;
            padding-right: 20px;
          }
        }
        @media (max-height: 760px) {
          .chat-ref-identity {
            margin-top: -34px;
          }
          .chat-ref-main-orb {
            width: 126px;
            height: 126px;
          }
          .chat-ref-main-orb img {
            width: 88px;
            height: 88px;
          }
          .chat-ref-identity h1 {
            font-size: 23px;
          }
          .chat-ref-identity span {
            margin-top: 18px;
          }
          .chat-ref-stream {
            padding-top: 10px;
          }
          .chat-ref-row {
            margin-bottom: 14px;
          }
          .chat-ref-bubble p {
            font-size: 15px;
          }
        }
        .spicey-ai-chat-reference,
        .spicey-ai-chat-reference.is-light {
          background: #02030b url('/spicey-assets/ai-talk-chat-reference.png') center top / cover no-repeat !important;
        }
        .chat-ref-wave,
        .chat-ref-status,
        .chat-ref-identity,
        .chat-ref-stream {
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }
        .chat-ref-top {
          position: absolute !important;
          top: 74px !important;
          left: 0 !important;
          right: 0 !important;
          z-index: 10 !important;
          height: 62px !important;
          padding: 0 20px !important;
          pointer-events: none !important;
        }
        .chat-ref-round {
          opacity: 0 !important;
          pointer-events: auto !important;
          width: 58px !important;
          height: 58px !important;
        }
        .chat-ref-input {
          left: 14px !important;
          right: 14px !important;
          bottom: max(34px, calc(env(safe-area-inset-bottom) + 22px)) !important;
          z-index: 12 !important;
          height: 72px !important;
          display: grid !important;
          grid-template-columns: 60px minmax(0, 1fr) 60px !important;
          align-items: center !important;
          gap: 8px !important;
          padding: 0 !important;
          border: 0 !important;
          border-radius: 0 !important;
          background: transparent !important;
          box-shadow: none !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
        }
        .chat-ref-plus,
        .chat-ref-send {
          width: 60px !important;
          height: 60px !important;
          opacity: 0 !important;
          border: 0 !important;
          background: transparent !important;
          box-shadow: none !important;
        }
        .chat-ref-field {
          height: 58px !important;
          min-height: 58px !important;
          padding: 0 44px 0 22px !important;
          border: 0 !important;
          border-radius: 0 !important;
          background: transparent !important;
          box-shadow: none !important;
        }
        .chat-ref-field textarea {
          height: 58px !important;
          max-height: 58px !important;
          overflow: hidden !important;
          color: #fff !important;
          caret-color: #ff2d8f !important;
          font-size: 18px !important;
          line-height: 1.2 !important;
          padding: 18px 0 0 !important;
        }
        .chat-ref-field textarea::placeholder {
          color: transparent !important;
        }
        .chat-ref-mic {
          right: 4px !important;
          bottom: 10px !important;
          width: 42px !important;
          height: 42px !important;
          opacity: 0 !important;
        }
        .spicey-ai-chat-reference.is-keyboard .chat-ref-top,
        .spicey-ai-chat-reference.is-keyboard .chat-ref-identity {
          display: none !important;
        }
        .spicey-ai-chat-reference.is-keyboard .chat-ref-input {
          bottom: max(12px, env(safe-area-inset-bottom)) !important;
        }
        .spicey-ai-chat-reference,
        .spicey-ai-chat-reference.is-light {
          background:
            radial-gradient(circle at 50% 3%, rgba(255,45,143,.20), transparent 24%),
            radial-gradient(circle at 100% 24%, rgba(139,53,255,.14), transparent 34%),
            radial-gradient(circle at 0% 30%, rgba(255,122,24,.10), transparent 32%),
            linear-gradient(180deg, #02030b 0%, #03040e 50%, #010208 100%) !important;
        }
        .chat-ref-wave,
        .chat-ref-status,
        .chat-ref-identity,
        .chat-ref-stream {
          opacity: 1 !important;
          visibility: visible !important;
        }
        .chat-ref-wave {
          pointer-events: none !important;
          animation: spicey-chat-wave 5.8s ease-in-out infinite alternate !important;
        }
        .chat-ref-wave-left {
          background:
            linear-gradient(90deg, transparent 0%, rgba(255,122,24,.08) 12%, rgba(255,92,36,.82) 36%, rgba(255,45,143,.62) 58%, transparent 100%) !important;
        }
        .chat-ref-wave-right {
          background:
            linear-gradient(90deg, transparent 0%, rgba(255,45,143,.18) 12%, rgba(139,53,255,.82) 42%, rgba(255,45,143,.58) 70%, transparent 100%) !important;
          animation-delay: -1.6s !important;
        }
        .chat-ref-top {
          position: relative !important;
          top: auto !important;
          left: auto !important;
          right: auto !important;
          height: 58px !important;
          padding: 8px 20px 0 !important;
          pointer-events: auto !important;
        }
        .chat-ref-round {
          opacity: 1 !important;
          width: 50px !important;
          height: 50px !important;
          background: rgba(255,255,255,.055) !important;
          border: 1px solid rgba(255,255,255,.09) !important;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 16px 34px rgba(0,0,0,.28) !important;
        }
        .chat-ref-identity {
          margin-top: -30px !important;
          pointer-events: none !important;
        }
        .chat-ref-main-orb {
          width: 148px !important;
          height: 148px !important;
          border-radius: 50% !important;
          background:
            radial-gradient(circle at 35% 25%, rgba(255,255,255,.18), transparent 25%),
            radial-gradient(circle at 54% 54%, rgba(255,45,143,.26), transparent 42%),
            linear-gradient(145deg, rgba(7,4,15,.92), rgba(0,1,8,.98)) !important;
          border: 1px solid rgba(255,255,255,.13) !important;
          box-shadow:
            0 0 0 1px rgba(255,255,255,.04),
            0 0 34px rgba(255,45,143,.38),
            0 0 76px rgba(139,53,255,.26),
            inset 0 1px 0 rgba(255,255,255,.13) !important;
          backdrop-filter: blur(14px) saturate(1.25) !important;
          -webkit-backdrop-filter: blur(14px) saturate(1.25) !important;
          animation: spicey-chat-orb 4.8s ease-in-out infinite !important;
        }
        .chat-ref-main-orb::before {
          inset: -10px !important;
          opacity: .62 !important;
          filter: blur(11px) saturate(1.15) !important;
          background: conic-gradient(from 210deg, #ff8a18, #ff2d72, #8b35ff, #ff2d72, #ff8a18) !important;
          animation: spicey-chat-ring 7s linear infinite !important;
        }
        .chat-ref-main-orb::after {
          content: "" !important;
          position: absolute !important;
          inset: 12px !important;
          border-radius: 50% !important;
          background:
            radial-gradient(circle at 34% 22%, rgba(255,255,255,.16), transparent 26%),
            linear-gradient(145deg, rgba(255,255,255,.08), rgba(255,255,255,.02)) !important;
          border: 1px solid rgba(255,255,255,.08) !important;
          pointer-events: none !important;
        }
        .chat-ref-main-orb img {
          position: relative !important;
          z-index: 2 !important;
          width: 104px !important;
          height: 104px !important;
          filter: drop-shadow(0 0 18px rgba(255,45,143,.66)) drop-shadow(0 0 13px rgba(255,122,24,.30)) !important;
        }
        .chat-ref-stream {
          pointer-events: auto !important;
          padding: 14px 19px 108px !important;
        }
        .chat-ref-input {
          left: 14px !important;
          right: 14px !important;
          bottom: max(14px, env(safe-area-inset-bottom)) !important;
          height: auto !important;
          grid-template-columns: 48px minmax(0, 1fr) 48px !important;
          gap: 9px !important;
          padding: 9px !important;
          border-radius: 30px !important;
          background: rgba(4,5,14,.94) !important;
          border: 1px solid rgba(255,255,255,.10) !important;
          box-shadow: 0 18px 42px rgba(0,0,0,.36), inset 0 1px 0 rgba(255,255,255,.06) !important;
          backdrop-filter: blur(18px) !important;
          -webkit-backdrop-filter: blur(18px) !important;
        }
        .chat-ref-plus,
        .chat-ref-send {
          opacity: 1 !important;
          width: 44px !important;
          height: 44px !important;
          border: 1px solid rgba(255,255,255,.12) !important;
        }
        .chat-ref-plus {
          background: rgba(255,255,255,.05) !important;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.07), 0 0 18px rgba(255,45,143,.12) !important;
        }
        .chat-ref-send {
          background: radial-gradient(circle at 34% 22%, rgba(255,255,255,.24), transparent 28%), linear-gradient(135deg, #7d2dff 0%, #d719d8 50%, #ff8a18 100%) !important;
          box-shadow: 0 0 24px rgba(255,45,143,.34), inset 0 1px 0 rgba(255,255,255,.22) !important;
        }
        .chat-ref-field {
          height: auto !important;
          min-height: 46px !important;
          padding: 0 42px 0 16px !important;
          border-radius: 24px !important;
          background: rgba(255,255,255,.06) !important;
          border: 1px solid rgba(255,255,255,.07) !important;
        }
        .chat-ref-field textarea {
          height: auto !important;
          max-height: 82px !important;
          overflow: auto !important;
          color: inherit !important;
          font-size: 15px !important;
          line-height: 1.25 !important;
          padding: 13px 0 !important;
        }
        .chat-ref-field textarea::placeholder {
          color: rgba(255,255,255,.48) !important;
        }
        .chat-ref-mic {
          right: 8px !important;
          bottom: 6px !important;
          width: 34px !important;
          height: 34px !important;
          opacity: 1 !important;
        }
        @keyframes spicey-chat-wave {
          0% { transform: translate3d(-2px, 0, 0) rotate(-10deg) scaleX(1); opacity: .72; }
          100% { transform: translate3d(5px, -5px, 0) rotate(-7deg) scaleX(1.03); opacity: .98; }
        }
        @keyframes spicey-chat-ring {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spicey-chat-orb {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-4px) scale(1.025); }
        }
        body.spicey-ai-chat-open #bottom-nav,
        body.spicey-ai-chat-open [data-bottom-nav],
        body.spicey-ai-chat-open .bottom-nav,
        body.spicey-ai-chat-open .mobile-bottom-nav,
        body.spicey-ai-chat-open .app-bottom-nav {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }
        .ai-chat-shell,
        .spicey-ai-chat-reference {
          z-index: 2147483000 !important;
        }
        .spicey-ai-chat-reference,
        .spicey-ai-chat-reference.is-light {
          background:
            radial-gradient(circle at var(--chat-glow-x, 34%) var(--chat-glow-y, 38%), rgba(255,45,143,.16), transparent 28%),
            radial-gradient(circle at calc(100% - var(--chat-glow-x, 34%)) 60%, rgba(139,53,255,.14), transparent 30%),
            radial-gradient(circle at 18% 76%, rgba(255,122,24,.10), transparent 26%),
            linear-gradient(180deg, #02030b 0%, #03040e 52%, #010208 100%) !important;
          animation: spicey-chat-bg-glow 8s ease-in-out infinite alternate !important;
        }
        .spicey-ai-chat-reference::before {
          content: "";
          position: absolute;
          z-index: 0;
          top: 0;
          left: 0;
          right: 0;
          height: 222px;
          pointer-events: none;
          background: url('/spicey-assets/ai-talk-chat-reference.png') center top / cover no-repeat;
          opacity: .96;
          -webkit-mask-image: linear-gradient(180deg, #000 0%, #000 76%, transparent 100%);
          mask-image: linear-gradient(180deg, #000 0%, #000 76%, transparent 100%);
        }
        .spicey-ai-chat-reference::after {
          content: "";
          position: absolute;
          z-index: 2;
          top: 24px;
          left: 50%;
          width: 122px;
          height: 122px;
          transform: translateX(-50%);
          border-radius: 50%;
          pointer-events: none;
          opacity: .64;
          filter: blur(8px) saturate(1.22);
          background:
            conic-gradient(from 210deg,
              transparent 0deg,
              rgba(255,205,84,.95) 24deg,
              rgba(255,122,24,.78) 54deg,
              transparent 86deg,
              rgba(255,45,143,.86) 164deg,
              rgba(139,53,255,.88) 232deg,
              rgba(255,122,24,.78) 316deg,
              transparent 360deg);
          -webkit-mask-image: radial-gradient(circle, transparent 56%, #000 60%, #000 69%, transparent 73%);
          mask-image: radial-gradient(circle, transparent 56%, #000 60%, #000 69%, transparent 73%);
          animation: spicey-chat-header-ring 6.2s linear infinite;
        }
        .spicey-ai-chat-reference .chat-ref-stream::before {
          content: "";
          position: fixed;
          z-index: 0;
          top: 166px;
          left: 50%;
          width: min(100vw, 430px);
          height: 176px;
          transform: translateX(-50%);
          pointer-events: none;
          background:
            radial-gradient(circle at var(--mask-glow-x, 46%) 84%, rgba(255,45,143,.22), transparent 34%),
            radial-gradient(circle at calc(100% - var(--mask-glow-x, 46%)) 42%, rgba(139,53,255,.16), transparent 28%),
            radial-gradient(circle at 24% 74%, rgba(255,122,24,.12), transparent 25%),
            linear-gradient(180deg, rgba(2,3,11,0) 0%, rgba(2,3,11,.97) 22%, #02030b 52%, #02030b 100%);
          animation: spicey-chat-mask-glow 6.8s ease-in-out infinite alternate;
        }
        .chat-ref-wave,
        .chat-ref-status,
        .chat-ref-identity {
          display: none !important;
        }
        .chat-ref-top {
          position: absolute !important;
          z-index: 6 !important;
          top: 72px !important;
          left: 0 !important;
          right: 0 !important;
          height: 58px !important;
          padding: 0 20px !important;
          pointer-events: none !important;
        }
        .chat-ref-top::before {
          content: "";
          position: absolute;
          z-index: 7;
          top: -72px;
          left: 0;
          width: 122px;
          height: 58px;
          pointer-events: none;
          border-bottom-right-radius: 34px;
          background:
            radial-gradient(circle at 22% 8%, rgba(255,45,143,.10), transparent 42%),
            linear-gradient(180deg, #02030b 0%, rgba(2,3,11,.98) 72%, rgba(2,3,11,0) 100%);
        }
        .chat-ref-top::after {
          content: "";
          position: absolute;
          z-index: 7;
          top: -72px;
          right: 0;
          width: 108px;
          height: 58px;
          pointer-events: none;
          border-bottom-left-radius: 26px;
          background:
            radial-gradient(circle at 76% 18%, rgba(139,53,255,.08), transparent 42%),
            linear-gradient(180deg, rgba(2,3,11,.98) 0%, rgba(2,3,11,.88) 76%, rgba(2,3,11,0) 100%);
        }
        .chat-ref-round {
          opacity: 0 !important;
          pointer-events: auto !important;
          width: 58px !important;
          height: 58px !important;
        }
        .chat-ref-stream {
          position: absolute !important;
          top: 286px !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          z-index: 3 !important;
          padding: 16px 18px 106px !important;
          opacity: 1 !important;
          visibility: visible !important;
          pointer-events: auto !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          clip-path: inset(0 0 0 0 round 0);
        }
        .chat-ref-row.is-user {
          position: relative !important;
          z-index: 3 !important;
          align-items: flex-end !important;
          gap: 8px !important;
        }
        .chat-ref-row.is-ai {
          position: relative !important;
          z-index: 3 !important;
        }
        .chat-ref-bubble,
        .chat-ref-avatar,
        .chat-ref-user-avatar {
          position: relative !important;
          z-index: 4 !important;
        }
        .chat-ref-user-avatar {
          width: 42px;
          height: 42px;
          flex: 0 0 42px;
          display: grid;
          place-items: center;
          overflow: hidden;
          border-radius: 50%;
          border: 2px solid transparent;
          background-image: linear-gradient(#080914, #080914), linear-gradient(135deg, #ff8a18, #ff2d8f 54%, #8b35ff);
          background-origin: border-box;
          background-clip: padding-box, border-box;
          box-shadow: 0 0 14px rgba(255,45,143,.24);
        }
        .chat-ref-user-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }
        .chat-ref-user-avatar span {
          color: #fff;
          font-size: 11px;
          font-weight: 800;
        }
        .chat-ref-row.is-user .chat-ref-bubble {
          max-width: 236px !important;
        }
        .chat-ref-input {
          z-index: 8 !important;
        }
        .spicey-ai-chat-reference.is-keyboard::before {
          opacity: .16;
        }
        .spicey-ai-chat-reference.is-keyboard::after,
        .spicey-ai-chat-reference.is-keyboard .chat-ref-top {
          display: none !important;
        }
        .spicey-ai-chat-reference.is-keyboard .chat-ref-stream {
          top: 228px !important;
          padding-top: 14px !important;
          padding-bottom: 96px !important;
        }
        .spicey-ai-chat-reference::before {
          height: 238px !important;
          opacity: 1 !important;
          background:
            radial-gradient(circle at 50% 42%, rgba(255,45,143,.22), transparent 31%),
            radial-gradient(circle at 36% 56%, rgba(255,122,24,.14), transparent 26%),
            radial-gradient(circle at 68% 56%, rgba(139,53,255,.18), transparent 28%),
            linear-gradient(180deg, #02030b 0%, #03040e 72%, rgba(3,4,14,0) 100%) !important;
          -webkit-mask-image: none !important;
          mask-image: none !important;
        }
        .chat-ref-identity {
          display: flex !important;
          position: absolute !important;
          z-index: 5 !important;
          top: 28px !important;
          left: 0 !important;
          right: 0 !important;
          margin: 0 !important;
          transform: none !important;
          pointer-events: none !important;
        }
        .chat-ref-main-orb {
          width: 142px !important;
          height: 142px !important;
          background:
            url('/spicey-assets/ai-chat-orb-reference.png') center / cover no-repeat !important;
          border: 1px solid rgba(255,255,255,.12) !important;
          box-shadow:
            0 0 0 1px rgba(255,255,255,.06),
            0 0 34px rgba(255,45,143,.40),
            0 0 74px rgba(139,53,255,.28),
            inset 0 1px 0 rgba(255,255,255,.15) !important;
        }
        .chat-ref-main-orb img {
          opacity: 0 !important;
          width: 100px !important;
          height: 100px !important;
        }
        .chat-ref-identity h1,
        .chat-ref-identity p,
        .chat-ref-identity span {
          display: none !important;
        }
        .chat-ref-stream {
          top: 218px !important;
          left: 14px !important;
          right: 14px !important;
          bottom: 100px !important;
          padding: 16px 12px 18px !important;
          border-radius: 28px !important;
          border: 1px solid rgba(255,255,255,.08) !important;
          background:
            radial-gradient(circle at var(--mask-glow-x, 30%) 4%, rgba(255,45,143,.16), transparent 34%),
            radial-gradient(circle at calc(100% - var(--mask-glow-x, 30%)) 28%, rgba(139,53,255,.13), transparent 32%),
            radial-gradient(circle at 24% 100%, rgba(255,122,24,.10), transparent 30%),
            rgba(2,3,11,.82) !important;
          box-shadow:
            0 0 0 1px rgba(255,45,143,.06),
            0 -18px 44px rgba(255,45,143,.08),
            inset 0 1px 0 rgba(255,255,255,.06) !important;
          backdrop-filter: blur(18px) saturate(1.12) !important;
          -webkit-backdrop-filter: blur(18px) saturate(1.12) !important;
          animation: spicey-chat-mask-glow 6.8s ease-in-out infinite alternate !important;
        }
        .spicey-ai-chat-reference .chat-ref-stream::before {
          display: none !important;
        }
        .spicey-ai-chat-reference.is-keyboard::before {
          opacity: 1 !important;
        }
        .spicey-ai-chat-reference.is-keyboard::after {
          display: block !important;
        }
        .spicey-ai-chat-reference.is-keyboard .chat-ref-identity {
          display: flex !important;
          top: 18px !important;
          transform: scale(.82) !important;
          transform-origin: top center !important;
        }
        .spicey-ai-chat-reference.is-keyboard .chat-ref-stream {
          top: 176px !important;
          bottom: 88px !important;
          padding-top: 14px !important;
          padding-bottom: 18px !important;
        }
        .spicey-ai-chat-reference::before {
          height: 188px !important;
          opacity: 1 !important;
          background:
            #02030b
            url('/spicey-assets/ai-chat-header-reference.png')
            center 38px / 94% auto
            no-repeat !important;
          -webkit-mask-image: none !important;
          mask-image: none !important;
        }
        .spicey-ai-chat-reference::after {
          content: "" !important;
          display: block !important;
          position: absolute !important;
          z-index: 2 !important;
          top: 42px !important;
          left: calc(50% + 4px) !important;
          width: 88px !important;
          height: 88px !important;
          transform: translateX(-50%) !important;
          border-radius: 50% !important;
          pointer-events: none !important;
          opacity: .78 !important;
          filter: blur(4px) saturate(1.58) brightness(1.16) !important;
          mix-blend-mode: screen !important;
          background:
            conic-gradient(from 210deg,
              transparent 0deg,
              rgba(255,210,96,.92) 14deg,
              rgba(255,122,24,.82) 34deg,
              rgba(255,45,143,.62) 54deg,
              transparent 76deg,
              rgba(255,45,143,.84) 138deg,
              rgba(139,53,255,.82) 202deg,
              rgba(255,122,24,.76) 286deg,
              transparent 360deg) !important;
          -webkit-mask-image: radial-gradient(circle, transparent 63%, #000 67%, #000 71%, transparent 76%) !important;
          mask-image: radial-gradient(circle, transparent 63%, #000 67%, #000 71%, transparent 76%) !important;
          animation: spicey-chat-header-orbit 4.2s linear infinite, spicey-chat-sun-pulse 2.6s ease-in-out infinite alternate !important;
        }
        .chat-ref-identity {
          display: none !important;
        }
        .chat-ref-stream {
          top: 204px !important;
          bottom: 100px !important;
        }
        .spicey-ai-chat-reference.is-keyboard .chat-ref-stream {
          top: 184px !important;
          bottom: 88px !important;
        }
        .chat-ref-input {
          background:
            linear-gradient(135deg, rgba(72,24,118,.88), rgba(138,32,177,.78) 45%, rgba(255,122,24,.62)) !important;
          border: 1px solid rgba(255,173,76,.22) !important;
          box-shadow:
            0 18px 42px rgba(0,0,0,.36),
            0 0 26px rgba(255,45,143,.22),
            inset 0 1px 0 rgba(255,255,255,.14) !important;
        }
        .chat-ref-field {
          background: rgba(8,7,18,.62) !important;
          border: 1px solid rgba(255,255,255,.10) !important;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.06) !important;
        }
        .chat-ref-plus {
          background: rgba(8,7,18,.48) !important;
          border-color: rgba(255,255,255,.14) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          line-height: 1 !important;
          padding: 0 0 2px !important;
          transform: translateY(-1px) !important;
        }
        .spicey-ai-chat-reference.is-light .chat-ref-input {
          background:
            linear-gradient(135deg, rgba(126,45,255,.86), rgba(255,45,143,.74) 48%, rgba(255,138,24,.70)) !important;
        }
        .spicey-ai-chat-reference.is-keyboard::before {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          height: 188px !important;
          background:
            #02030b
            url('/spicey-assets/ai-chat-header-reference.png')
            center 38px / 94% auto
            no-repeat !important;
        }
        .chat-ref-top {
          top: 62px !important;
          z-index: 24 !important;
          height: 86px !important;
          padding: 0 12px !important;
        }
        .chat-ref-back {
          position: absolute !important;
          left: 14px !important;
          top: 0 !important;
          width: 86px !important;
          height: 86px !important;
          opacity: 0 !important;
          pointer-events: auto !important;
          z-index: 26 !important;
        }
        .chat-ref-top::after {
          content: "" !important;
          display: block !important;
          position: absolute !important;
          z-index: 25 !important;
          top: 4px !important;
          right: 18px !important;
          width: 82px !important;
          height: 62px !important;
          border-radius: 28px !important;
          pointer-events: none !important;
          background:
            radial-gradient(circle at 50% 45%, rgba(5,6,18,.94), rgba(5,6,18,.84) 58%, rgba(5,6,18,0) 74%) !important;
          box-shadow: 0 0 16px rgba(5,6,18,.72) !important;
        }
        .spicey-ai-chat-reference.is-keyboard::after {
          display: block !important;
          visibility: visible !important;
          opacity: .78 !important;
          animation: spicey-chat-header-orbit 4.2s linear infinite, spicey-chat-sun-pulse 2.6s ease-in-out infinite alternate !important;
        }
        .chat-ref-stream {
          -webkit-overflow-scrolling: touch !important;
          overscroll-behavior-y: contain !important;
          touch-action: pan-y !important;
          scroll-behavior: smooth !important;
        }
        .spicey-ai-chat-reference.is-keyboard .chat-ref-stream {
          top: 158px !important;
          bottom: 84px !important;
          border-radius: 22px !important;
        }
        .spicey-ai-chat-reference.is-keyboard .chat-ref-input {
          bottom: max(8px, env(safe-area-inset-bottom)) !important;
        }
        .spicey-ai-chat-reference.is-keyboard .chat-ref-identity,
        .spicey-ai-chat-reference.is-keyboard .chat-ref-top {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
          animation: none !important;
          background: none !important;
        }
        .spicey-ai-chat-reference.is-keyboard .chat-ref-stream {
          top: 204px !important;
          left: 12px !important;
          right: 12px !important;
          bottom: 84px !important;
        }
        @keyframes spicey-chat-header-ring {
          from { transform: translateX(-50%) rotate(0deg); }
          to { transform: translateX(-50%) rotate(360deg); }
        }
        @keyframes spicey-chat-header-orbit {
          0% { transform: translateX(-50%) rotate(0deg) translate3d(1px, -1px, 0); }
          25% { transform: translateX(-50%) rotate(90deg) translate3d(2px, 1px, 0); }
          50% { transform: translateX(-50%) rotate(180deg) translate3d(0, 2px, 0); }
          75% { transform: translateX(-50%) rotate(270deg) translate3d(-2px, 0, 0); }
          100% { transform: translateX(-50%) rotate(360deg) translate3d(1px, -1px, 0); }
        }
        @keyframes spicey-chat-sun-pulse {
          0% { opacity: .46; filter: blur(4px) saturate(1.18) brightness(1.02); }
          100% { opacity: .76; filter: blur(5px) saturate(1.48) brightness(1.12); }
        }
        @keyframes spicey-chat-bg-glow {
          0% { --chat-glow-x: 20%; --chat-glow-y: 42%; filter: saturate(1); }
          45% { --chat-glow-x: 72%; --chat-glow-y: 36%; filter: saturate(1.08); }
          100% { --chat-glow-x: 38%; --chat-glow-y: 70%; filter: saturate(1.03); }
        }
        @keyframes spicey-chat-mask-glow {
          0% { --mask-glow-x: 22%; opacity: .94; }
          50% { --mask-glow-x: 76%; opacity: .98; }
          100% { --mask-glow-x: 42%; opacity: .96; }
        }
      `}</style>
    </div>
  );

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

          <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', padding: '0 14px', borderRadius: 16, background: isLight ? '#FFFFFF' : 'linear-gradient(135deg, rgba(18,8,28,0.94), rgba(45,13,52,0.9))', border: isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,85,190,0.18)', minHeight: 46, boxShadow: isLight ? '0 1px 4px rgba(0,0,0,0.05)' : '0 0 18px rgba(233,30,140,0.12)' }}>
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
