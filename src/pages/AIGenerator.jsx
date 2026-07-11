import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  BookOpen,
  Camera,
  Clapperboard,
  Hash,
  ImagePlus,
  Lightbulb,
  Loader2,
  MessageSquare,
  Mic,
  Paperclip,
  PenLine,
  RefreshCw,
  Send,
  Sparkles,
  Video,
  Wand2,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { AIProvider } from '@/lib/AIContext';
import AITalkMode from '@/components/ai/AITalkMode';
import AITextChat from '@/components/ai/AITextChat';

const MODES = [
  { id: 'media', label: 'Photo & Video', icon: Sparkles },
  { id: 'talk', label: 'AI Talk', icon: Mic },
];

const PROMPTS = [
  'Write a spicy caption for my new post',
  'Give me 10 hashtags for a city night reel',
  'Make this text shorter and more viral',
  'Give me a reel idea for Spicey today',
];

function useLightMode() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const update = () => setIsLight(document.documentElement.classList.contains('light-mode'));
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return isLight;
}

function ShellButton({ children, active, onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`ai-3d-button ${active ? 'is-active' : ''} ${className}`}
    >
      {children}
    </button>
  );
}

function CompactHome({ onStartChat, onMode, isLight }) {
  const [mediaKind, setMediaKind] = useState('photo');
  const [mediaPrompt, setMediaPrompt] = useState('');
  const [mediaPreview, setMediaPreview] = useState('');
  const [uploadAccept, setUploadAccept] = useState('image/*');
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [resultType, setResultType] = useState('');
  const [postCaption, setPostCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const uploadRef = useRef(null);
  const actions = [
    { icon: <PenLine size={21} />, title: 'Write a post', prompt: 'Write a post caption for me' },
    { icon: <Hash size={22} />, title: 'Best hashtags', prompt: 'Give me the best hashtags now' },
    { icon: <Lightbulb size={22} />, title: 'Reel idea', prompt: 'Give me a Reel idea' },
    { icon: <BookOpen size={21} />, title: 'Story caption', prompt: 'Write a story caption' },
  ];

  const chooseMedia = (kind) => {
    setMediaKind(kind);
    const accept = kind === 'video' ? 'video/*' : 'image/*';
    setUploadAccept(accept);
    if (uploadRef.current) uploadRef.current.accept = accept;
    requestAnimationFrame(() => uploadRef.current?.click());
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const nextKind = file.type.startsWith('video') ? 'video' : 'photo';
    setMediaKind(nextKind);
    setMediaPreview(URL.createObjectURL(file));
    setError('');
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setUploadedUrl(result.file_url || result.url || '');
    } catch (err) {
      setError(err.message || 'Upload failed.');
    } finally {
      event.target.value = '';
    }
  };

  const createMedia = async () => {
    if (!mediaPrompt.trim() || loading) return;
    setLoading(true);
    setError('');
    setResultUrl('');
    setResultType('');
    try {
      if (mediaKind === 'video') {
        const result = await base44.integrations.Core.GenerateVideo({ prompt: mediaPrompt.trim(), source_url: uploadedUrl || undefined });
        setResultUrl(result.url || '');
        setResultType('video');
        if (!result.url) setError(result.message || 'AI video did not return a preview yet.');
      } else {
        const result = await base44.integrations.Core.GenerateImage({
          prompt: mediaPrompt.trim(),
          existing_image_urls: uploadedUrl ? [uploadedUrl] : undefined,
        });
        const nextUrl = result.url || result.image_url || '';
        setResultUrl(nextUrl);
        setResultType('photo');
        if (!nextUrl) setError('AI photo did not return an image yet. Try a shorter style prompt.');
      }
    } catch (err) {
      setError(err.message || 'AI create failed.');
    } finally {
      setLoading(false);
    }
  };

  const postMedia = () => {
    if (!resultUrl) return;
    if (resultType === 'video') {
      sessionStorage.setItem('ai_video_url', resultUrl);
      sessionStorage.setItem('ai_video_caption', postCaption || mediaPrompt);
      window.location.href = '/create-video?from=ai-video';
      return;
    }
    sessionStorage.setItem('ai_photo_url', resultUrl);
    sessionStorage.setItem('ai_photo_caption', postCaption || mediaPrompt);
    window.location.href = `/create-photo?from=ai-photo&ai=1`;
  };

  return (
    <div className="ai-panel-scroll">
      <section className="ai-hero-compact">
        <button className="ai-orb-3d" type="button" onClick={() => onMode('talk')} aria-label="Open AI Talk">
          <img src="https://media.base44.com/images/public/69fe90d3bbe7ad47925e4a0a/a645abc1a_6ab1672f-73ff-4c98-a1ef-817016549a2f.png" alt="" />
        </button>
        <div className="ai-hero-copy">
          <h1>Hey! I'm Spicey AI</h1>
          <p>Your creative partner for captions, hashtags, ideas and everything social.</p>
          <button type="button" onClick={() => onStartChat('Ask Spicey AI anything')}>
            <Sparkles size={17} /> Ask me anything...
          </button>
        </div>
      </section>

      <section className="ai-single-create">
        <div className="ai-single-head">
          <div>
            <h2>Create with AI</h2>
            <p>Chat, photo and video are all here.</p>
          </div>
          <button type="button" onClick={() => onMode('talk')}><Mic size={15} /> Talk</button>
        </div>

        <div className="ai-single-row">
          <button type="button" className={`ai-photo-choice ${mediaKind === 'photo' ? 'active' : ''}`} onClick={() => chooseMedia('photo')}>
            {mediaPreview && mediaKind === 'photo' ? (
              <img src={mediaPreview} alt="" />
            ) : (
              <img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=360&q=85" alt="" />
            )}
            <span><Camera size={16} /> Photo</span>
          </button>
          <button type="button" className={`ai-video-choice ${mediaKind === 'video' ? 'active' : ''}`} onClick={() => chooseMedia('video')}>
            {mediaPreview && mediaKind === 'video' ? (
              <video src={mediaPreview} muted autoPlay loop playsInline />
            ) : (
              <video src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4" muted autoPlay loop playsInline />
            )}
            <span><Video size={16} /> Video</span>
          </button>
        </div>

        <input ref={uploadRef} type="file" accept={uploadAccept} hidden onChange={handleUpload} />

        <div className="ai-single-prompt">
          <div className="ai-prompt-label">
            <Sparkles size={12} />
            <span>{mediaKind === 'video' ? 'Video style prompt' : 'Photo style prompt'}</span>
          </div>
          <textarea
            rows={2}
            value={mediaPrompt}
            onChange={(event) => setMediaPrompt(event.target.value)}
            placeholder={mediaKind === 'video' ? 'Example: cinematic city reel, pink neon, smooth camera...' : 'Example: make it luxury, pink orange glow, soft skin, sharp detail...'}
          />
          <button type="button" disabled={!mediaPrompt.trim() || loading} onClick={createMedia}>
            {loading ? <Loader2 size={15} className="ai-spin" /> : <Wand2 size={14} />}
            <span>{loading ? '...' : 'Create'}</span>
          </button>
        </div>

        <div className="ai-single-chips">
          {['Orange glow', 'Pink neon', 'Purple luxury'].map((style) => (
            <button key={style} type="button" onClick={() => setMediaPrompt((current) => current ? `${current}, ${style.toLowerCase()}` : style)}>
              {style}
            </button>
          ))}
        </div>

        {error && <p className="ai-error">{error}</p>}
        {resultUrl && (
          <div className="ai-single-result">
            {resultType === 'video' ? <video src={resultUrl} controls playsInline /> : <img src={resultUrl} alt="" />}
            <textarea
              className="ai-result-caption"
              value={postCaption}
              onChange={(event) => setPostCaption(event.target.value)}
              placeholder="Write caption/text for this post..."
              rows={2}
            />
            <div className="ai-result-actions-inline">
              <button type="button" onClick={postMedia}><Send size={14} /> Post</button>
              <button type="button" onClick={() => { setResultUrl(''); setPostCaption(''); }}><RefreshCw size={14} /> Redo</button>
            </div>
          </div>
        )}
      </section>

      <div className="ai-section-title ai-ref-title-row">
        <span>What can I help you with?</span>
        <button type="button" onClick={() => onStartChat('Show all AI actions')}>See all</button>
      </div>

      <section className="ai-reference-actions">
        {actions.map((action) => (
          <button key={action.title} type="button" onClick={() => onStartChat(action.prompt)}>
            <span>{action.icon}</span>
            <b>{action.title}</b>
            <i>→</i>
          </button>
        ))}
      </section>

      <section className="ai-magic-banner">
        <div>
          <h2>Create magic with <strong>AI Photos &amp; Videos</strong></h2>
          <p>Bring your ideas to life in seconds.</p>
          <button type="button" onClick={() => onMode('media')}>Explore</button>
        </div>
        <div className="ai-magic-previews">
          <button type="button" onClick={() => onMode('media')}>
            <img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=360&q=85" alt="" />
            <b>AI Photo</b>
          </button>
          <button type="button" onClick={() => onMode('media')}>
            <img src="https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=360&q=85" alt="" />
            <b>AI Video</b>
          </button>
        </div>
      </section>

      <section className="ai-prompt-list ai-soft-list">
        {PROMPTS.slice(0, 2).map((prompt) => (
          <button key={prompt} type="button" onClick={() => onStartChat(prompt)}>
            <Sparkles size={14} />
            <span>{prompt}</span>
          </button>
        ))}
      </section>

      {isLight && <div className="ai-light-note">Light design like your reference is active.</div>}
    </div>
  );
}

function PhotoStudio({ isLight }) {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const uploadReference = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const local = URL.createObjectURL(file);
    setPreviewUrl(local);
    setError('');
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setReferenceUrl(result.file_url || result.url || '');
    } catch (err) {
      setError(err.message || 'Photo upload failed.');
    } finally {
      event.target.value = '';
    }
  };

  const generate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError('');
    setImageUrl('');
    try {
      const result = await base44.integrations.Core.GenerateImage({
        prompt: prompt.trim(),
        existing_image_urls: referenceUrl ? [referenceUrl] : undefined,
      });
      setImageUrl(result.url || result.image_url || '');
      if (!(result.url || result.image_url)) setError('AI did not return an image.');
    } catch (err) {
      setError(err.message || 'AI photo failed.');
    } finally {
      setLoading(false);
    }
  };

  const postToFeed = () => {
    if (!imageUrl) return;
    sessionStorage.setItem('capturedUrl', imageUrl);
    window.location.href = '/create?from=ai-photo';
  };

  return (
    <div className="ai-panel-scroll ai-studio-panel">
      <div className="ai-small-heading">
        <Camera size={18} />
        <div>
          <h2>AI Photo</h2>
          <p>Small form, fast prompt, clean result.</p>
        </div>
      </div>

      {imageUrl && (
        <div className="ai-result-card">
          <img src={imageUrl} alt="AI generated" />
          <div className="ai-result-actions">
            <button type="button" onClick={postToFeed}><Send size={16} /> Post</button>
            <button type="button" onClick={() => setImageUrl('')}><RefreshCw size={16} /> Redo</button>
          </div>
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" hidden onChange={uploadReference} />
      {previewUrl ? (
        <div className="ai-upload-preview">
          <img src={previewUrl} alt="Reference" />
          <button type="button" onClick={() => { setPreviewUrl(''); setReferenceUrl(''); }}><X size={14} /></button>
        </div>
      ) : (
        <button type="button" className="ai-upload-button" onClick={() => fileRef.current?.click()}>
          <Paperclip size={16} /> Add reference photo
        </button>
      )}

      <div className="ai-compact-input">
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Example: neon portrait, orange pink purple glow, realistic..."
          rows={3}
        />
      </div>

      <div className="ai-chip-row">
        {['Neon', 'Portrait', 'Luxury', 'Street', 'Glow'].map((style) => (
          <button key={style} type="button" onClick={() => setPrompt((current) => current ? `${current}, ${style.toLowerCase()}` : `${style} style`)}>
            {style}
          </button>
        ))}
      </div>

      {error && <p className="ai-error">{error}</p>}

      <button type="button" className="ai-primary-action" disabled={!prompt.trim() || loading} onClick={generate}>
        {loading ? <Loader2 size={18} className="ai-spin" /> : <Wand2 size={18} />}
        {loading ? 'Creating...' : 'Generate Photo'}
      </button>

      {isLight && <div className="ai-light-note">Photo studio is using light mode colors.</div>}
    </div>
  );
}

function VideoStudio() {
  const [prompt, setPrompt] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');

  const generate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError('');
    setNote('');
    setVideoUrl('');
    try {
      const result = await base44.integrations.Core.GenerateVideo({ prompt: prompt.trim() });
      setVideoUrl(result.url || '');
      setNote(result.message || 'Video preview ready.');
    } catch (err) {
      setError(err.message || 'AI video failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-panel-scroll ai-studio-panel">
      <div className="ai-small-heading">
        <Clapperboard size={18} />
        <div>
          <h2>AI Video</h2>
          <p>Compact video idea studio with preview.</p>
        </div>
      </div>

      {videoUrl && (
        <div className="ai-result-card ai-video-result">
          <video src={videoUrl} controls playsInline />
          {note && <p>{note}</p>}
        </div>
      )}

      <div className="ai-compact-input">
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Example: 8 second city night reel, pink orange purple lights..."
          rows={3}
        />
      </div>

      <div className="ai-chip-row">
        {['Reel', 'Story', 'Cinematic', 'Slow motion', 'Viral hook'].map((style) => (
          <button key={style} type="button" onClick={() => setPrompt((current) => current ? `${current}, ${style.toLowerCase()}` : style)}>
            {style}
          </button>
        ))}
      </div>

      {error && <p className="ai-error">{error}</p>}

      <button type="button" className="ai-primary-action" disabled={!prompt.trim() || loading} onClick={generate}>
        {loading ? <Loader2 size={18} className="ai-spin" /> : <Clapperboard size={18} />}
        {loading ? 'Preparing...' : 'Generate Video Preview'}
      </button>

      <button type="button" className="ai-secondary-action" onClick={() => window.location.href = '/create?from=ai-video'}>
        Open Video Creator
      </button>
    </div>
  );
}

function MediaStudio() {
  const [kind, setKind] = useState('photo');
  const [prompt, setPrompt] = useState('');
  const [filePreview, setFilePreview] = useState('');
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [resultType, setResultType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const chooseFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const nextKind = file.type.startsWith('video') ? 'video' : 'photo';
    setKind(nextKind);
    setFilePreview(URL.createObjectURL(file));
    setError('');
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setUploadedUrl(result.file_url || result.url || '');
    } catch (err) {
      setError(err.message || 'Upload failed.');
    } finally {
      event.target.value = '';
    }
  };

  const generate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError('');
    setResultUrl('');
    setResultType('');
    try {
      if (kind === 'video') {
        const result = await base44.integrations.Core.GenerateVideo({ prompt: prompt.trim(), source_url: uploadedUrl || undefined });
        setResultUrl(result.url || '');
        setResultType('video');
        if (!result.url) setError(result.message || 'AI video did not return a preview yet.');
      } else {
        const result = await base44.integrations.Core.GenerateImage({
          prompt: prompt.trim(),
          existing_image_urls: uploadedUrl ? [uploadedUrl] : undefined,
        });
        setResultUrl(result.url || result.image_url || '');
        setResultType('photo');
      }
    } catch (err) {
      setError(err.message || 'AI create failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-panel-scroll ai-media-studio">
      <div className="ai-media-title">
        <h2>AI Photo &amp; Video</h2>
        <p>Upload photo or video, then create with Spicey AI.</p>
      </div>

      <div className="ai-media-toggle">
        <button type="button" className={kind === 'photo' ? 'active' : ''} onClick={() => setKind('photo')}>
          <Camera size={16} /> Photo
        </button>
        <button type="button" className={kind === 'video' ? 'active' : ''} onClick={() => setKind('video')}>
          <Video size={16} /> Video
        </button>
      </div>

      <input ref={fileRef} type="file" accept="image/*,video/*" hidden onChange={chooseFile} />
      <button type="button" className="ai-media-upload" onClick={() => fileRef.current?.click()}>
        {filePreview ? (
          kind === 'video' ? <video src={filePreview} muted playsInline /> : <img src={filePreview} alt="" />
        ) : (
          <span><Paperclip size={18} /> Upload photo or video</span>
        )}
      </button>

      <div className="ai-compact-input ai-media-prompt">
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder={kind === 'video' ? 'Describe the video style...' : 'Describe the photo style...'}
          rows={3}
        />
      </div>

      <div className="ai-chip-row ai-media-chips">
        {['Orange glow', 'Pink neon', 'Purple luxury', 'Clean viral'].map((style) => (
          <button key={style} type="button" onClick={() => setPrompt((current) => current ? `${current}, ${style.toLowerCase()}` : style)}>
            {style}
          </button>
        ))}
      </div>

      {error && <p className="ai-error">{error}</p>}

      <button type="button" className="ai-primary-action ai-media-generate" disabled={!prompt.trim() || loading} onClick={generate}>
        {loading ? <Loader2 size={17} className="ai-spin" /> : <Wand2 size={17} />}
        {loading ? 'Creating...' : kind === 'video' ? 'Create Video' : 'Create Photo'}
      </button>

      {resultUrl && (
        <div className="ai-media-result">
          {resultType === 'video' ? <video src={resultUrl} controls playsInline /> : <img src={resultUrl} alt="" />}
        </div>
      )}
    </div>
  );
}

function ChatMode({ isLight, initialPrompt, onClose }) {
  return (
    <div className="ai-chat-shell">
      <button type="button" className="ai-close-chat" onClick={onClose} aria-label="Close chat">
        <X size={16} />
      </button>
      <AITextChat isLight={isLight} initialPrompt={initialPrompt} />
    </div>
  );
}

export default function AIGenerator() {
  const navigate = useNavigate();
  const isLight = useLightMode();
  const [mode, setMode] = useState('home');
  const [chatPrompt, setChatPrompt] = useState('');
  const [talkOpen, setTalkOpen] = useState(false);

  const openMode = (nextMode) => {
    if (nextMode === 'talk') {
      setTalkOpen(true);
      return;
    }
    setMode(nextMode);
  };

  const startChat = (prompt = '') => {
    setChatPrompt(prompt);
    setMode('chat');
  };

  return (
    <div className={`ai-page ${isLight ? 'is-light' : ''}`}>
      <div className="ai-backdrop" />

      <header className="ai-header">
        <div className="ai-brand">
          <span>SPICEY AI STUDIO</span>
        </div>
      </header>

      <main className="ai-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.16 }}
            className="ai-motion-panel"
          >
            {mode === 'home' && <CompactHome isLight={isLight} onStartChat={startChat} onMode={openMode} />}
            {mode === 'chat' && <ChatMode isLight={isLight} initialPrompt={chatPrompt} onClose={() => setMode('home')} />}
            {mode === 'media' && <MediaStudio />}
          </motion.div>
        </AnimatePresence>
      </main>

      {mode === 'home' && (
        <form
          className="ai-bottom-input"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const text = String(form.get('aiInput') || '').trim();
            if (text) startChat(text);
            event.currentTarget.reset();
          }}
        >
          <input name="aiInput" placeholder="Ask Spicey AI..." />
          <button type="submit"><Send size={17} /></button>
        </form>
      )}

      {talkOpen && (
        <AIProvider>
          <AITalkMode onClose={() => setTalkOpen(false)} />
        </AIProvider>
      )}

      <style>{`
        .ai-page, .ai-page * { box-sizing: border-box; }
        .ai-page {
          min-height: 100dvh;
          color: #fff;
          background: #030105;
          overflow: hidden;
          position: relative;
          padding-bottom: calc(82px + env(safe-area-inset-bottom, 0px));
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .ai-page.is-light {
          color: #1b1023;
          background: #fff7fb;
        }
        .ai-backdrop {
          position: fixed;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(circle at 10% 4%, rgba(255, 111, 0, .22), transparent 22%),
            radial-gradient(circle at 88% 10%, rgba(255, 28, 149, .2), transparent 26%),
            radial-gradient(circle at 78% 88%, rgba(147, 51, 234, .22), transparent 30%),
            linear-gradient(180deg, #020103 0%, #07010b 54%, #020103 100%);
        }
        .is-light .ai-backdrop {
          background:
            radial-gradient(circle at 8% 4%, rgba(255, 121, 20, .22), transparent 22%),
            radial-gradient(circle at 88% 8%, rgba(255, 42, 160, .2), transparent 25%),
            radial-gradient(circle at 75% 92%, rgba(151, 71, 255, .18), transparent 30%),
            linear-gradient(180deg, #fff9fd 0%, #fff2f7 48%, #f9efff 100%);
        }
        .ai-header {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: 46px 1fr 46px;
          align-items: center;
          gap: 10px;
          padding: calc(env(safe-area-inset-top, 0px) + 10px) 16px 8px;
        }
        .ai-icon-button {
          width: 44px;
          height: 44px;
          border: 1px solid rgba(255, 90, 130, .45);
          border-radius: 16px;
          color: currentColor;
          background: linear-gradient(145deg, rgba(255, 106, 0, .14), rgba(255, 45, 155, .1));
          box-shadow: 0 10px 18px rgba(0, 0, 0, .28), inset 0 1px rgba(255,255,255,.18);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ai-mic-button {
          background: linear-gradient(145deg, #ff7a00, #ff2d75 55%, #9f28ff);
          color: white;
          border: 0;
          box-shadow: 0 13px 24px rgba(255, 45, 155, .38), inset 0 2px rgba(255,255,255,.26);
        }
        .ai-brand {
          min-width: 0;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
        }
        .ai-brand span {
          margin-top: -9px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .18em;
          text-transform: uppercase;
          color: rgba(255,255,255,.58);
        }
        .is-light .ai-brand span { color: rgba(82, 32, 90, .62); }
        .ai-tabs {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          padding: 0 14px 10px;
        }
        .ai-tabs button {
          height: 42px;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 16px;
          color: rgba(255,255,255,.72);
          background: rgba(255,255,255,.055);
          box-shadow: inset 0 1px rgba(255,255,255,.08), 0 7px 14px rgba(0,0,0,.2);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 800;
        }
        .ai-tabs button.active {
          color: white;
          border-color: rgba(255, 133, 38, .72);
          background: linear-gradient(145deg, #ff7a00, #ff2d75 55%, #992aff);
          box-shadow: 0 10px 22px rgba(255, 45, 155, .32), inset 0 2px rgba(255,255,255,.25);
        }
        .is-light .ai-tabs button {
          color: rgba(38, 19, 48, .72);
          background: rgba(255,255,255,.82);
          border-color: rgba(255, 107, 0, .18);
        }
        .is-light .ai-tabs button.active { color: white; }
        .ai-content {
          position: relative;
          z-index: 2;
          height: calc(100dvh - 150px - env(safe-area-inset-top, 0px));
          min-height: 0;
          padding: 0 14px;
        }
        .ai-motion-panel {
          height: 100%;
          min-height: 0;
          display: flex;
          flex-direction: column;
        }
        .ai-panel-scroll {
          min-height: 0;
          overflow-y: auto;
          scrollbar-width: none;
          padding: 6px 0 96px;
        }
        .ai-panel-scroll::-webkit-scrollbar { display: none; }
        .ai-hero-compact {
          min-height: 150px;
          border-radius: 22px;
          border: 1px solid rgba(255, 45, 155, .44);
          background:
            radial-gradient(circle at 86% 18%, rgba(255, 106, 0, .24), transparent 28%),
            linear-gradient(145deg, rgba(17, 5, 24, .94), rgba(5, 1, 9, .86));
          box-shadow: 0 16px 32px rgba(0,0,0,.28), inset 0 0 34px rgba(255,45,155,.08);
          display: grid;
          grid-template-columns: 1fr 108px;
          gap: 12px;
          align-items: center;
          padding: 18px;
        }
        .is-light .ai-hero-compact {
          background: linear-gradient(145deg, rgba(255,255,255,.92), rgba(255,237,248,.92));
          box-shadow: 0 12px 28px rgba(120, 24, 90, .12);
        }
        .ai-status-pill {
          width: max-content;
          height: 27px;
          padding: 0 10px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,.08);
          color: #34d399;
          font-size: 12px;
          font-weight: 900;
        }
        .ai-status-pill span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #34d399;
          box-shadow: 0 0 12px #34d399;
        }
        .ai-hero-copy h1 {
          margin: 11px 0 4px;
          font-size: 28px;
          line-height: 1;
          font-weight: 950;
          letter-spacing: 0;
          text-shadow: 0 0 20px rgba(255,45,155,.28);
        }
        .ai-hero-copy p {
          margin: 0;
          max-width: 250px;
          color: rgba(255,255,255,.62);
          font-size: 13px;
          line-height: 1.38;
        }
        .is-light .ai-hero-copy p { color: rgba(40, 20, 55, .58); }
        .ai-orb-3d {
          width: 96px;
          height: 96px;
          border: 0;
          border-radius: 50%;
          background: radial-gradient(circle, #ff2d75 0%, #ff7a00 42%, #8c20ff 100%);
          box-shadow: 0 18px 34px rgba(255, 45, 155, .38), inset 0 4px rgba(255,255,255,.28);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ai-orb-3d img { width: 48px; filter: drop-shadow(0 0 16px rgba(255,255,255,.75)); }
        .ai-mode-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 9px;
          margin-top: 12px;
        }
        .ai-3d-button {
          border: 1px solid rgba(255,255,255,.08);
          color: white;
          background: linear-gradient(145deg, rgba(255, 106, 0, .13), rgba(255, 45, 155, .11), rgba(130, 40, 255, .12));
          box-shadow: 0 10px 18px rgba(0,0,0,.24), inset 0 1px rgba(255,255,255,.13);
          cursor: pointer;
        }
        .ai-mode-card {
          min-height: 74px;
          border-radius: 18px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 7px;
          font-size: 12px;
          font-weight: 900;
        }
        .is-light .ai-3d-button {
          color: #231229;
          background: linear-gradient(145deg, rgba(255,255,255,.92), rgba(255,235,248,.92));
          border-color: rgba(255, 45, 155, .18);
          box-shadow: 0 8px 18px rgba(140, 26, 90, .12), inset 0 1px rgba(255,255,255,.9);
        }
        .ai-quick-box, .ai-studio-panel {
          margin-top: 12px;
          border-radius: 20px;
          padding: 14px;
          border: 1px solid rgba(255,255,255,.08);
          background: rgba(255,255,255,.055);
          box-shadow: inset 0 1px rgba(255,255,255,.08), 0 14px 28px rgba(0,0,0,.2);
        }
        .is-light .ai-quick-box, .is-light .ai-studio-panel {
          background: rgba(255,255,255,.78);
          border-color: rgba(255, 45, 155, .16);
          box-shadow: 0 10px 26px rgba(130, 36, 100, .1);
        }
        .ai-section-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: 15px;
          font-weight: 950;
        }
        .ai-section-title button {
          border: 0;
          background: transparent;
          color: #ff7a00;
          font-size: 12px;
          font-weight: 950;
        }
        .ai-prompt-list {
          display: grid;
          grid-template-columns: 1fr;
          gap: 8px;
        }
        .ai-prompt-list button, .ai-mini-tools button, .ai-upload-button, .ai-secondary-action {
          min-height: 44px;
          border: 1px solid rgba(255, 45, 155, .18);
          border-radius: 15px;
          color: currentColor;
          background: rgba(255,255,255,.055);
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0 12px;
          text-align: left;
          font-weight: 800;
          font-size: 13px;
          box-shadow: inset 0 1px rgba(255,255,255,.08);
        }
        .ai-prompt-list button span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ai-mini-tools {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-top: 12px;
        }
        .ai-mini-tools button {
          min-height: 58px;
          justify-content: center;
          flex-direction: column;
          gap: 5px;
          padding: 8px;
          background: linear-gradient(145deg, rgba(255, 122, 0, .12), rgba(255, 45, 155, .11));
        }
        .ai-mini-tools span { font-size: 11px; }
        .ai-light-note {
          margin-top: 10px;
          color: rgba(84, 30, 92, .62);
          font-size: 12px;
          font-weight: 800;
          text-align: center;
        }
        .ai-small-heading {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }
        .ai-small-heading > svg {
          width: 38px;
          height: 38px;
          padding: 9px;
          border-radius: 14px;
          color: white;
          background: linear-gradient(145deg, #ff7a00, #ff2d75 55%, #9128ff);
          box-shadow: 0 12px 22px rgba(255, 45, 155, .25);
        }
        .ai-small-heading h2 { margin: 0; font-size: 18px; line-height: 1.1; }
        .ai-small-heading p { margin: 2px 0 0; color: rgba(255,255,255,.52); font-size: 12px; }
        .is-light .ai-small-heading p { color: rgba(40, 20, 55, .52); }
        .ai-result-card {
          overflow: hidden;
          border-radius: 18px;
          border: 1px solid rgba(255, 45, 155, .24);
          background: rgba(0,0,0,.22);
          margin-bottom: 12px;
        }
        .ai-result-card img, .ai-result-card video {
          width: 100%;
          max-height: 310px;
          object-fit: cover;
          display: block;
        }
        .ai-video-result video { background: #000; object-fit: contain; }
        .ai-video-result p {
          margin: 0;
          padding: 10px 12px;
          color: rgba(255,255,255,.62);
          font-size: 12px;
          font-weight: 700;
        }
        .ai-result-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          padding: 10px;
        }
        .ai-result-actions button {
          height: 42px;
          border: 0;
          border-radius: 14px;
          color: white;
          background: linear-gradient(145deg, #ff7a00, #ff2d75 55%, #8f22ff);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          font-weight: 950;
        }
        .ai-upload-preview {
          position: relative;
          width: 108px;
          height: 108px;
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid rgba(255,45,155,.4);
          margin-bottom: 10px;
        }
        .ai-upload-preview img { width: 100%; height: 100%; object-fit: cover; }
        .ai-upload-preview button {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 26px;
          height: 26px;
          border: 0;
          border-radius: 50%;
          background: rgba(0,0,0,.72);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ai-compact-input {
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,.08);
          background: rgba(0,0,0,.2);
          overflow: hidden;
          margin-top: 10px;
        }
        .is-light .ai-compact-input { background: rgba(255,255,255,.75); border-color: rgba(255,45,155,.16); }
        .ai-compact-input textarea {
          width: 100%;
          border: 0;
          outline: 0;
          resize: none;
          background: transparent;
          color: currentColor;
          font-family: inherit;
          font-size: 14px;
          line-height: 1.4;
          padding: 12px;
          display: block;
        }
        .ai-chip-row {
          display: flex;
          gap: 7px;
          flex-wrap: wrap;
          margin: 10px 0;
        }
        .ai-chip-row button {
          height: 30px;
          border: 1px solid rgba(255,45,155,.28);
          border-radius: 999px;
          color: currentColor;
          background: rgba(255,255,255,.06);
          padding: 0 11px;
          font-size: 12px;
          font-weight: 850;
        }
        .ai-primary-action, .ai-secondary-action {
          width: 100%;
          height: 48px;
          border: 0;
          border-radius: 16px;
          color: white;
          background: linear-gradient(145deg, #ff7a00, #ff2d75 55%, #9028ff);
          box-shadow: 0 14px 28px rgba(255,45,155,.26), inset 0 2px rgba(255,255,255,.24);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 950;
        }
        .ai-primary-action:disabled { opacity: .48; }
        .ai-secondary-action {
          margin-top: 9px;
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(255,45,155,.18);
          box-shadow: inset 0 1px rgba(255,255,255,.08);
        }
        .ai-error {
          color: #ff5b6e;
          font-size: 13px;
          font-weight: 800;
          margin: 8px 0;
        }
        .ai-spin { animation: ai-spin 1s linear infinite; }
        @keyframes ai-spin { to { transform: rotate(360deg); } }
        .ai-chat-shell {
          height: 100%;
          min-height: 0;
          position: relative;
          overflow: hidden;
          border-radius: 20px;
          border: 1px solid rgba(255,45,155,.16);
          background: rgba(3,1,6,.45);
        }
        .is-light .ai-chat-shell { background: rgba(255,255,255,.72); }
        .ai-close-chat {
          position: absolute;
          z-index: 10;
          top: 10px;
          right: 10px;
          width: 34px;
          height: 34px;
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 50%;
          color: white;
          background: rgba(0,0,0,.38);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ai-bottom-input {
          position: fixed;
          z-index: 20;
          left: 14px;
          right: 14px;
          bottom: calc(84px + env(safe-area-inset-bottom, 0px));
          height: 54px;
          border-radius: 999px;
          padding: 5px;
          background: linear-gradient(145deg, #ff7a00, #ff2d75 55%, #9028ff);
          box-shadow: 0 16px 34px rgba(255,45,155,.3), inset 0 2px rgba(255,255,255,.28);
          display: flex;
          gap: 6px;
        }
        .ai-bottom-input input {
          flex: 1;
          min-width: 0;
          border: 0;
          outline: 0;
          border-radius: 999px;
          background: rgba(0,0,0,.22);
          color: white;
          padding: 0 14px;
          font-size: 14px;
          font-weight: 700;
        }
        .ai-bottom-input input::placeholder { color: rgba(255,255,255,.7); }
        .ai-bottom-input button {
          width: 44px;
          height: 44px;
          border: 0;
          border-radius: 50%;
          color: white;
          background: rgba(255,255,255,.18);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ai-page {
          color: #17101d;
          background: #fff5f8;
          padding-bottom: calc(150px + env(safe-area-inset-bottom, 0px));
          max-width: 430px;
          width: min(100vw, 430px);
          margin: 0 auto;
          box-shadow: 0 0 0 1px rgba(255, 120, 190, .18), 0 24px 70px rgba(105, 30, 90, .22);
        }
        .ai-backdrop {
          left: 50%;
          width: min(100vw, 430px);
          transform: translateX(-50%);
          background:
            radial-gradient(circle at 8% 8%, rgba(255, 106, 0, .18), transparent 24%),
            radial-gradient(circle at 92% 18%, rgba(255, 45, 155, .2), transparent 24%),
            radial-gradient(circle at 80% 92%, rgba(157, 67, 255, .26), transparent 30%),
            linear-gradient(180deg, #fffaf7 0%, #fff2f8 42%, #f7dfff 100%);
        }
        .ai-header {
          grid-template-columns: 1fr auto;
          gap: 14px;
          padding: calc(env(safe-area-inset-top, 0px) + 14px) 16px 10px;
        }
        .ai-brand {
          align-items: flex-start;
          text-align: left;
        }
        .ai-brand > *:first-child {
          transform-origin: left center;
          transform: scale(.92);
        }
        .ai-brand span {
          margin-top: -17px;
          margin-left: 68px;
          color: rgba(20, 18, 34, .68);
          font-size: 8px;
          letter-spacing: .34em;
        }
        .ai-header-actions {
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .ai-brand {
          flex-direction: row;
          align-items: center;
          justify-content: flex-start;
          gap: 8px;
          text-align: left;
        }
        .ai-brand > *:first-child {
          flex: 0 0 auto;
          transform-origin: left center;
          transform: scale(.76);
        }
        .ai-brand span {
          margin: 0 0 0 -14px;
          white-space: nowrap;
          color: rgba(20, 18, 34, .68);
          font-size: 10px;
          line-height: 1;
          letter-spacing: .24em;
        }
        .ai-header {
          z-index: 10000;
        }
        .ai-pro-pill {
          height: 40px;
          min-width: 76px;
          border: 0;
          border-radius: 999px;
          color: #ff4d12;
          background: rgba(255, 255, 255, .78);
          box-shadow: 0 14px 28px rgba(255, 90, 115, .16), inset 0 1px rgba(255,255,255,.9);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          font-size: 16px;
          font-weight: 950;
        }
        .ai-pro-pill span { font-size: 16px; }
        .ai-icon-button {
          width: 40px;
          height: 40px;
          border: 0;
          border-radius: 50%;
          color: #15121f;
          background: rgba(255, 255, 255, .72);
          box-shadow: 0 14px 28px rgba(255, 90, 115, .13), inset 0 1px rgba(255,255,255,.95);
        }
        .ai-tools-popover {
          position: fixed;
          top: calc(env(safe-area-inset-top, 0px) + 50px);
          right: max(16px, calc((100vw - 430px) / 2 + 16px));
          z-index: 2147483000;
          width: 174px;
          padding: 8px;
          border-radius: 18px;
          border: 1px solid rgba(255, 122, 0, .22);
          background:
            linear-gradient(145deg, rgba(255,255,255,.94), rgba(255,240,248,.9)),
            radial-gradient(circle at 12% 10%, rgba(255, 122, 0, .2), transparent 42%),
            radial-gradient(circle at 92% 86%, rgba(143, 53, 255, .16), transparent 45%);
          backdrop-filter: blur(18px);
          box-shadow: 0 24px 52px rgba(32, 6, 34, .28), 0 0 0 1px rgba(255,255,255,.45), inset 0 1px rgba(255,255,255,.9);
        }
        .ai-tools-popover button {
          width: 100%;
          min-height: 38px;
          border: 0;
          border-radius: 13px;
          color: #211424;
          background: transparent;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 10px;
          font-size: 12px;
          font-weight: 900;
          text-align: left;
        }
        .ai-tools-popover button:hover {
          color: #fff;
          background: linear-gradient(145deg, #ff7a00, #ff2d75 55%, #8f35ff);
        }
        .ai-pro-toast {
          position: fixed;
          top: calc(env(safe-area-inset-top, 0px) + 78px);
          left: 50%;
          z-index: 30;
          transform: translateX(-50%);
          border-radius: 999px;
          padding: 9px 14px;
          color: #fff;
          background: linear-gradient(145deg, rgba(23,7,28,.95), rgba(45,10,34,.92));
          border: 1px solid rgba(255, 122, 0, .34);
          box-shadow: 0 16px 32px rgba(255, 45, 155, .16);
          font-size: 12px;
          font-weight: 900;
        }
        .ai-tabs {
          grid-template-columns: repeat(3, 1fr);
          gap: 0;
          margin: 0 16px 12px;
          padding: 7px;
          min-height: 62px;
          border-radius: 24px;
          background: rgba(255,255,255,.78);
          box-shadow: 0 18px 38px rgba(255, 116, 120, .15), inset 0 1px rgba(255,255,255,.9);
        }
        .ai-tabs button {
          height: 48px;
          border: 0;
          border-radius: 22px;
          color: #2a2331;
          background: transparent;
          box-shadow: none;
          font-size: 13px;
          font-weight: 950;
        }
        .ai-tabs button svg { color: #8e4ae9; }
        .ai-tabs button.active {
          color: #ff4b13;
          background: rgba(255,255,255,.92);
          box-shadow: 0 13px 28px rgba(255, 94, 65, .13);
        }
        .ai-tabs button.active svg { color: #ff4b13; }
        .ai-content {
          height: calc(100dvh - 164px - env(safe-area-inset-top, 0px));
          padding: 0 16px;
        }
        .ai-panel-scroll {
          padding: 0 0 120px;
        }
        .ai-hero-compact {
          min-height: 142px;
          grid-template-columns: 90px 1fr;
          padding: 15px 16px;
          border: 0;
          border-radius: 22px;
          background:
            radial-gradient(circle at 8% 92%, rgba(255, 95, 24, .45), transparent 32%),
            radial-gradient(circle at 96% 8%, rgba(255, 42, 150, .25), transparent 32%),
            linear-gradient(135deg, #2b1138 0%, #371942 50%, #782451 100%);
          box-shadow: 0 24px 44px rgba(105, 30, 90, .22);
        }
        .ai-orb-3d {
          width: 78px;
          height: 78px;
          justify-self: center;
          background:
            radial-gradient(circle at 28% 18%, #fff0bd 0%, #ff8b36 24%, #ff2d78 56%, #9e34ff 100%);
          box-shadow: 0 18px 34px rgba(255, 60, 115, .42), inset 0 7px 12px rgba(255,255,255,.32);
        }
        .ai-orb-3d img { width: 39px; }
        .ai-hero-copy h1 {
          margin: 0 0 8px;
          color: white;
          font-size: 20px;
          line-height: 1.1;
          letter-spacing: 0;
        }
        .ai-hero-copy p {
          max-width: 260px;
          color: rgba(255,255,255,.72);
          font-size: 13px;
          line-height: 1.38;
        }
        .ai-hero-copy button {
          margin-top: 10px;
          border: 0;
          background: transparent;
          color: #ff5535;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 0;
          font-size: 13px;
          font-weight: 950;
        }
        .ai-ref-title-row {
          margin: 17px 0 10px;
          font-size: 16px;
          color: #15121f;
        }
        .ai-ref-title-row button {
          color: #ff4b13;
          font-size: 14px;
        }
        .ai-reference-actions {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }
        .ai-reference-actions button {
          min-height: 104px;
          border: 0;
          border-radius: 17px;
          color: #14121d;
          background: rgba(255,255,255,.8);
          box-shadow: 0 16px 32px rgba(255, 133, 98, .13), inset 0 1px rgba(255,255,255,.95);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 10px 7px;
          text-align: center;
        }
        .ai-reference-actions button span {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          color: #ff4b13;
          background: linear-gradient(145deg, rgba(255, 106, 0, .12), rgba(255, 45, 155, .13));
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ai-reference-actions button:nth-child(2) span { color: #e42c8d; }
        .ai-reference-actions button:nth-child(3) span { color: #8e4ae9; }
        .ai-reference-actions button:nth-child(4) span { color: #d93691; }
        .ai-reference-actions b {
          min-height: 31px;
          font-size: 11px;
          line-height: 1.25;
        }
        .ai-reference-actions i {
          color: #ff4b13;
          font-style: normal;
          font-size: 19px;
          line-height: 1;
        }
        .ai-magic-banner {
          min-height: 138px;
          margin-top: 14px;
          border-radius: 24px;
          padding: 16px;
          overflow: hidden;
          background: linear-gradient(135deg, #ff6937 0%, #ef2c81 48%, #9148ff 100%);
          box-shadow: 0 24px 44px rgba(218, 54, 150, .28);
          display: grid;
          grid-template-columns: 1fr 138px;
          align-items: center;
          gap: 12px;
        }
        .ai-magic-banner h2 {
          margin: 0;
          color: white;
          font-size: 17px;
          line-height: 1.2;
        }
        .ai-magic-banner h2 strong {
          display: block;
          color: #ffe15b;
        }
        .ai-magic-banner p {
          margin: 8px 0 12px;
          max-width: 160px;
          color: rgba(255,255,255,.88);
          font-size: 12px;
          line-height: 1.35;
        }
        .ai-magic-banner > div > button {
          height: 36px;
          border: 0;
          border-radius: 999px;
          color: #ff4b13;
          background: rgba(255,255,255,.94);
          padding: 0 15px;
          font-weight: 950;
        }
        .ai-magic-previews {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
        }
        .ai-magic-previews button {
          position: relative;
          width: 64px;
          height: 88px;
          padding: 0;
          border: 2px solid rgba(255,255,255,.52);
          border-radius: 15px;
          overflow: hidden;
          background: #11051a;
          box-shadow: 0 10px 24px rgba(0,0,0,.25);
          transform: rotate(-3deg);
        }
        .ai-magic-previews button + button { transform: rotate(5deg); margin-left: -4px; }
        .ai-magic-previews img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .ai-magic-previews b {
          position: absolute;
          left: 8px;
          right: 8px;
          bottom: 8px;
          color: white;
          font-size: 10px;
          text-align: left;
        }
        .ai-soft-list { margin-top: 14px; }
        .ai-soft-list button {
          background: rgba(255,255,255,.72);
          color: #312537;
          box-shadow: 0 12px 26px rgba(214, 65, 145, .1);
        }
        .ai-bottom-input {
          left: max(16px, calc((100vw - 430px) / 2 + 16px));
          right: max(16px, calc((100vw - 430px) / 2 + 16px));
          bottom: calc(84px + env(safe-area-inset-bottom, 0px));
          max-width: 398px;
          margin: 0 auto;
          height: 58px;
          padding: 6px;
          border-radius: 30px;
          background: linear-gradient(135deg, rgba(62, 19, 47, .95), rgba(99, 39, 119, .92));
          box-shadow: 0 22px 40px rgba(165, 55, 171, .28);
        }
        .ai-bottom-input input {
          background: transparent;
          font-size: 14px;
          color: white;
        }
        .ai-bottom-input button {
          width: 46px;
          height: 46px;
          background: linear-gradient(145deg, #ff8631, #ff2d75 55%, #9238ff);
          box-shadow: 0 10px 24px rgba(255,45,155,.32);
        }
        .is-light .ai-studio-panel {
          background: rgba(255,255,255,.82);
          color: #17101d;
          border: 0;
          box-shadow: 0 18px 38px rgba(255, 116, 120, .14);
        }
        .is-light .ai-small-heading p { color: rgba(20, 18, 34, .55); }
        .is-light .ai-chat-shell {
          background: rgba(255,255,255,.82);
          border: 0;
          box-shadow: 0 18px 38px rgba(255, 116, 120, .14);
        }
        .ai-page {
          max-width: 390px;
          width: min(100vw, 390px);
          padding-bottom: calc(126px + env(safe-area-inset-bottom, 0px));
        }
        .ai-backdrop {
          width: min(100vw, 390px);
        }
        .ai-header {
          padding: calc(env(safe-area-inset-top, 0px) + 10px) 14px 8px;
        }
        .ai-brand > *:first-child {
          transform: scale(.78);
        }
        .ai-brand span {
          margin-top: -22px;
          margin-left: 58px;
          font-size: 9px;
          letter-spacing: .3em;
        }
        .ai-pro-pill {
          height: 34px;
          min-width: 66px;
          font-size: 13px;
          background: linear-gradient(145deg, rgba(255,255,255,.94), rgba(255,236,245,.9));
          color: #ff4b13;
        }
        .ai-pro-pill span { font-size: 13px; }
        .ai-tools-button {
          width: 36px;
          height: 36px;
          color: white;
          background: linear-gradient(145deg, #ff7a00, #ff2d75 55%, #8f35ff);
          box-shadow: 0 10px 22px rgba(255,45,155,.28), inset 0 1px rgba(255,255,255,.28);
        }
        .ai-tabs {
          grid-template-columns: repeat(2, 1fr);
          min-height: 50px;
          margin: 0 14px 10px;
          padding: 5px;
          border-radius: 19px;
        }
        .ai-tabs button {
          height: 40px;
          border-radius: 15px;
          font-size: 12px;
          color: #36243f;
        }
        .ai-tabs button svg { color: #d93691; }
        .ai-tabs button.active {
          color: white;
          background: linear-gradient(145deg, #ff7a00, #ff2d75 55%, #8f35ff);
          box-shadow: 0 9px 18px rgba(255,45,155,.22);
        }
        .ai-tabs button.active svg { color: white; }
        .ai-content {
          height: calc(100dvh - 137px - env(safe-area-inset-top, 0px));
          padding: 0 14px;
        }
        .ai-panel-scroll {
          padding-bottom: 104px;
        }
        .ai-hero-compact {
          min-height: 112px;
          grid-template-columns: 68px 1fr;
          padding: 12px 13px;
          border-radius: 18px;
        }
        .ai-orb-3d {
          width: 58px;
          height: 58px;
        }
        .ai-orb-3d img { width: 30px; }
        .ai-hero-copy h1 {
          font-size: 17px;
          margin-bottom: 6px;
        }
        .ai-hero-copy p {
          font-size: 11px;
          line-height: 1.32;
        }
        .ai-hero-copy button {
          margin-top: 8px;
          font-size: 12px;
          color: #ff6a24;
        }
        .ai-ref-title-row {
          margin: 13px 0 8px;
          font-size: 14px;
        }
        .ai-ref-title-row button { font-size: 12px; }
        .ai-reference-actions {
          gap: 7px;
        }
        .ai-reference-actions button {
          min-height: 84px;
          border-radius: 14px;
          gap: 5px;
          padding: 8px 5px;
        }
        .ai-reference-actions button span {
          width: 34px;
          height: 34px;
          color: white;
          background: linear-gradient(145deg, #ff7a00, #ff2d75 55%, #8f35ff);
        }
        .ai-reference-actions button:nth-child(2) span { color: white; background: linear-gradient(145deg, #ff5f93, #e42c8d); }
        .ai-reference-actions button:nth-child(3) span { color: white; background: linear-gradient(145deg, #9b5cff, #d93691); }
        .ai-reference-actions button:nth-child(4) span { color: white; background: linear-gradient(145deg, #ff7a00, #ff375f); }
        .ai-reference-actions b {
          min-height: 27px;
          font-size: 9.8px;
          line-height: 1.2;
        }
        .ai-reference-actions i {
          font-size: 16px;
        }
        .ai-magic-banner {
          min-height: 106px;
          margin-top: 11px;
          border-radius: 18px;
          padding: 12px;
          grid-template-columns: 1fr 104px;
          gap: 8px;
        }
        .ai-magic-banner h2 {
          font-size: 14px;
        }
        .ai-magic-banner p {
          max-width: 128px;
          margin: 6px 0 9px;
          font-size: 10.5px;
        }
        .ai-magic-banner > div > button {
          height: 30px;
          padding: 0 12px;
          font-size: 12px;
        }
        .ai-magic-previews button {
          width: 48px;
          height: 68px;
          border-radius: 11px;
        }
        .ai-magic-previews b {
          left: 5px;
          right: 5px;
          bottom: 5px;
          font-size: 8px;
        }
        .ai-soft-list { display: none; }
        .ai-bottom-input {
          left: max(14px, calc((100vw - 390px) / 2 + 14px));
          right: max(14px, calc((100vw - 390px) / 2 + 14px));
          bottom: calc(78px + env(safe-area-inset-bottom, 0px));
          max-width: 362px;
          height: 50px;
          padding: 5px;
        }
        .ai-bottom-input input {
          font-size: 13px;
        }
        .ai-bottom-input button {
          width: 40px;
          height: 40px;
        }
        .ai-media-studio {
          border-radius: 18px;
          padding: 12px;
          background: rgba(255,255,255,.82);
          box-shadow: 0 16px 32px rgba(218, 54, 150, .13);
        }
        .ai-media-title h2 {
          margin: 0;
          font-size: 18px;
          color: #1d1425;
        }
        .ai-media-title p {
          margin: 4px 0 10px;
          color: rgba(40,20,55,.56);
          font-size: 11.5px;
        }
        .ai-media-toggle {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 10px;
        }
        .ai-media-toggle button {
          height: 38px;
          border: 0;
          border-radius: 14px;
          color: #34233e;
          background: rgba(255,255,255,.7);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 950;
          box-shadow: inset 0 1px rgba(255,255,255,.85);
        }
        .ai-media-toggle button.active {
          color: white;
          background: linear-gradient(145deg, #ff7a00, #ff2d75 55%, #8f35ff);
          box-shadow: 0 10px 18px rgba(255,45,155,.2);
        }
        .ai-media-upload {
          width: 100%;
          height: 118px;
          border: 1.5px dashed rgba(255,45,155,.36);
          border-radius: 18px;
          overflow: hidden;
          color: #ff4b13;
          background: linear-gradient(145deg, rgba(255,255,255,.78), rgba(255,235,247,.78));
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 950;
        }
        .ai-media-upload span {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
        }
        .ai-media-upload img,
        .ai-media-upload video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .ai-media-prompt {
          margin-top: 10px;
          border-color: rgba(255,45,155,.14);
          background: rgba(255,255,255,.78);
        }
        .ai-media-prompt textarea {
          font-size: 13px;
          padding: 10px;
        }
        .ai-media-chips {
          gap: 6px;
          margin: 8px 0;
        }
        .ai-media-chips button {
          height: 27px;
          font-size: 10.5px;
          background: rgba(255,255,255,.72);
        }
        .ai-media-generate {
          height: 42px;
          border-radius: 14px;
          font-size: 13px;
        }
        .ai-page:not(.is-light) .ai-media-studio {
          color: #ffffff;
          background:
            linear-gradient(145deg, rgba(16, 5, 22, .94), rgba(5, 1, 9, .92)),
            radial-gradient(circle at 8% 0%, rgba(255, 122, 0, .16), transparent 38%),
            radial-gradient(circle at 96% 100%, rgba(143, 53, 255, .18), transparent 40%);
          border: 1px solid rgba(255, 45, 155, .16);
          box-shadow: 0 16px 32px rgba(0,0,0,.3), inset 0 1px rgba(255,255,255,.08);
        }
        .ai-page:not(.is-light) .ai-media-title h2 {
          color: #ffffff;
        }
        .ai-page:not(.is-light) .ai-media-title p {
          color: rgba(255,255,255,.58);
        }
        .ai-page:not(.is-light) .ai-media-toggle button:not(.active),
        .ai-page:not(.is-light) .ai-media-upload,
        .ai-page:not(.is-light) .ai-media-prompt,
        .ai-page:not(.is-light) .ai-media-chips button {
          color: #ffffff;
          background: rgba(255,255,255,.07);
          border-color: rgba(255,255,255,.12);
          box-shadow: inset 0 1px rgba(255,255,255,.08);
        }
        .ai-page:not(.is-light) .ai-media-upload span {
          color: #ffffff;
        }
        .ai-page:not(.is-light) .ai-media-prompt textarea::placeholder {
          color: rgba(255,255,255,.45);
        }
        .ai-media-result {
          margin-top: 10px;
          border-radius: 16px;
          overflow: hidden;
          background: #120719;
        }
        .ai-media-result img,
        .ai-media-result video {
          width: 100%;
          max-height: 210px;
          object-fit: cover;
          display: block;
        }
        .ai-content {
          height: calc(100dvh - 78px - env(safe-area-inset-top, 0px));
        }
        .ai-panel-scroll {
          padding-bottom: 88px;
        }
        .ai-hero-compact {
          min-height: 94px;
          grid-template-columns: 54px 1fr;
          padding: 10px 11px;
          border-radius: 16px;
        }
        .ai-orb-3d {
          width: 48px;
          height: 48px;
        }
        .ai-orb-3d img { width: 25px; }
        .ai-hero-copy h1 { font-size: 15px; }
        .ai-hero-copy p { font-size: 10.5px; }
        .ai-hero-copy button { font-size: 11px; margin-top: 6px; }
        .ai-single-create {
          margin-top: 9px;
          padding: 10px;
          border-radius: 16px;
          background: rgba(255,255,255,.84);
          box-shadow: 0 14px 28px rgba(218, 54, 150, .13), inset 0 1px rgba(255,255,255,.9);
        }
        .ai-single-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 8px;
        }
        .ai-single-head h2 {
          margin: 0;
          font-size: 15px;
          color: #1d1425;
        }
        .ai-single-head p {
          margin: 2px 0 0;
          color: rgba(40,20,55,.52);
          font-size: 10.5px;
        }
        .ai-single-head button {
          height: 32px;
          border: 0;
          border-radius: 999px;
          color: white;
          background: linear-gradient(145deg, #ff7a00, #ff2d75 55%, #8f35ff);
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 0 10px;
          font-size: 11px;
          font-weight: 950;
        }
        .ai-single-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 7px;
          margin-bottom: 8px;
        }
        .ai-single-row button {
          position: relative;
          height: 70px;
          overflow: hidden;
          border: 1.4px solid rgba(255,45,155,.2);
          border-radius: 15px;
          color: #ffffff;
          background: #170616;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 950;
          text-shadow: 0 2px 8px rgba(0,0,0,.55);
          box-shadow: 0 10px 20px rgba(255,45,155,.1), inset 0 1px rgba(255,255,255,.12);
        }
        .ai-single-row button img,
        .ai-single-row button video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: .72;
          transform: scale(1.04);
          z-index: 0;
        }
        .ai-single-row button.ai-photo-choice img {
          object-position: center 64%;
          opacity: .86;
          transform: scale(1.1) translateY(5px);
        }
        .ai-single-row button.ai-video-choice video {
          object-position: center;
          opacity: .78;
          filter: saturate(1.18) contrast(1.05);
        }
        .ai-single-row button::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255, 106, 0, .36), rgba(255, 45, 155, .24) 48%, rgba(105, 54, 255, .34));
          z-index: 0;
        }
        .ai-single-row button span,
        .ai-single-row button svg {
          position: relative;
          z-index: 1;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .ai-single-row button svg {
          filter: drop-shadow(0 2px 6px rgba(0,0,0,.45));
        }
        .ai-single-row button.active {
          color: white;
          border-color: rgba(255, 133, 37, .62);
          box-shadow: 0 12px 24px rgba(255,45,155,.22), 0 0 0 1px rgba(255,255,255,.18), inset 0 1px rgba(255,255,255,.18);
        }
        .ai-single-upload {
          position: relative;
          width: 100%;
          height: 74px;
          border: 1.5px dashed rgba(255, 122, 0, .48);
          border-radius: 15px;
          overflow: hidden;
          color: #ffffff;
          background:
            linear-gradient(145deg, rgba(31, 8, 24, .94), rgba(20, 7, 31, .9)),
            radial-gradient(circle at 16% 12%, rgba(255, 122, 0, .34), transparent 44%),
            radial-gradient(circle at 88% 88%, rgba(255, 45, 155, .28), transparent 46%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 950;
          box-shadow:
            0 12px 24px rgba(255, 45, 155, .12),
            0 0 0 1px rgba(143, 53, 255, .13),
            inset 0 1px rgba(255,255,255,.12);
          text-shadow: 0 2px 8px rgba(0,0,0,.45);
        }
        .ai-single-upload::before {
          content: '';
          position: absolute;
          inset: 1px;
          border-radius: 13px;
          background: linear-gradient(135deg, rgba(255,255,255,.14), transparent 45%, rgba(255,45,155,.12));
          pointer-events: none;
        }
        .ai-single-upload span {
          position: relative;
          z-index: 1;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12.5px;
          color: #ffffff;
        }
        .ai-single-upload span svg {
          color: #ffffff;
          filter: drop-shadow(0 0 8px rgba(255, 122, 0, .55));
        }
        .ai-single-upload img,
        .ai-single-upload video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .ai-single-prompt {
          margin-top: 8px;
          min-height: 74px;
          border-radius: 16px;
          background:
            linear-gradient(145deg, rgba(255,255,255,.92), rgba(255,239,248,.82)),
            radial-gradient(circle at 10% 0%, rgba(255,122,0,.16), transparent 40%),
            radial-gradient(circle at 92% 100%, rgba(143,53,255,.14), transparent 42%);
          border: 1.2px solid rgba(255,45,155,.2);
          display: grid;
          grid-template-columns: 1fr 82px;
          grid-template-rows: 24px 1fr;
          align-items: stretch;
          overflow: hidden;
          box-shadow: 0 12px 24px rgba(255,45,155,.1), inset 0 1px rgba(255,255,255,.86);
        }
        .ai-prompt-label {
          grid-column: 1 / -1;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 10px 0;
          color: #ff4b13;
          font-size: 9px;
          font-weight: 950;
          letter-spacing: .04em;
          text-transform: uppercase;
        }
        .ai-single-prompt textarea {
          border: 0;
          outline: 0;
          resize: none;
          background: transparent;
          color: #201326;
          padding: 5px 10px 10px;
          font-family: inherit;
          font-size: 12px;
          line-height: 1.25;
        }
        .ai-single-prompt button {
          border: 0;
          color: white;
          background: linear-gradient(145deg, #ff7a00, #ff2d75 55%, #8f35ff);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 950;
          box-shadow: inset 0 1px rgba(255,255,255,.22);
        }
        .ai-single-prompt button:disabled { opacity: .45; }
        .ai-single-chips {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-top: 7px;
        }
        .ai-single-chips button {
          height: 25px;
          border: 1px solid rgba(255,45,155,.18);
          border-radius: 999px;
          color: #3a2841;
          background: rgba(255,255,255,.72);
          padding: 0 9px;
          font-size: 10px;
          font-weight: 850;
        }
        .ai-single-result {
          margin-top: 8px;
          border-radius: 14px;
          overflow: hidden;
          background: #140719;
        }
        .ai-single-result img,
        .ai-single-result video {
          width: 100%;
          max-height: 170px;
          object-fit: cover;
          display: block;
        }
        .ai-result-caption {
          width: calc(100% - 16px);
          margin: 8px;
          border: 1px solid rgba(255,45,155,.18);
          border-radius: 12px;
          outline: 0;
          resize: none;
          color: #ffffff;
          background: rgba(255,255,255,.07);
          padding: 9px 10px;
          font-family: inherit;
          font-size: 12px;
          line-height: 1.3;
        }
        .ai-result-caption::placeholder {
          color: rgba(255,255,255,.45);
        }
        .ai-result-actions-inline {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 7px;
          padding: 0 8px 8px;
        }
        .ai-result-actions-inline button {
          height: 35px;
          border: 0;
          border-radius: 12px;
          color: #ffffff;
          background: linear-gradient(145deg, #ff7a00, #ff2d75 55%, #8f35ff);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 950;
        }
        .ai-result-actions-inline button:last-child {
          background: rgba(255,255,255,.1);
          border: 1px solid rgba(255,255,255,.1);
        }
        .ai-magic-banner,
        .ai-soft-list {
          display: none;
        }
        .ai-reference-actions button {
          min-height: 72px;
        }
        .ai-reference-actions button span {
          width: 30px;
          height: 30px;
        }
        .ai-reference-actions b {
          font-size: 9px;
          min-height: 22px;
        }
        .ai-reference-actions button {
          position: relative;
          min-height: 73px;
          overflow: hidden;
          border: 1.4px solid rgba(255, 101, 35, .34);
          background:
            linear-gradient(145deg, rgba(255, 255, 255, .98), rgba(255, 242, 236, .74)),
            radial-gradient(circle at 18% 8%, rgba(255, 106, 0, .2), transparent 42%),
            radial-gradient(circle at 90% 94%, rgba(255, 45, 155, .18), transparent 44%);
          box-shadow:
            0 10px 20px rgba(255, 92, 45, .12),
            0 0 0 1px rgba(255, 45, 155, .08),
            inset 0 1px rgba(255,255,255,.98);
          transform: translateZ(0);
        }
        .ai-reference-actions button::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,.72), transparent 40%, rgba(255, 45, 155, .08));
          pointer-events: none;
        }
        .ai-reference-actions button:nth-child(2) {
          border-color: rgba(226, 44, 141, .34);
          background:
            linear-gradient(145deg, rgba(255, 255, 255, .98), rgba(255, 235, 246, .78)),
            radial-gradient(circle at 20% 10%, rgba(255, 45, 155, .22), transparent 42%),
            radial-gradient(circle at 90% 92%, rgba(151, 58, 255, .18), transparent 45%);
          box-shadow: 0 10px 20px rgba(226, 44, 141, .12), 0 0 0 1px rgba(151, 58, 255, .08), inset 0 1px rgba(255,255,255,.98);
        }
        .ai-reference-actions button:nth-child(3) {
          border-color: rgba(143, 53, 255, .34);
          background:
            linear-gradient(145deg, rgba(255, 255, 255, .98), rgba(242, 235, 255, .8)),
            radial-gradient(circle at 20% 10%, rgba(151, 72, 255, .24), transparent 42%),
            radial-gradient(circle at 92% 92%, rgba(255, 94, 54, .16), transparent 45%);
          box-shadow: 0 10px 20px rgba(143, 53, 255, .12), 0 0 0 1px rgba(255, 94, 54, .08), inset 0 1px rgba(255,255,255,.98);
        }
        .ai-reference-actions button:nth-child(4) {
          border-color: rgba(255, 122, 0, .34);
          background:
            linear-gradient(145deg, rgba(255, 255, 255, .98), rgba(255, 241, 232, .78)),
            radial-gradient(circle at 18% 10%, rgba(255, 122, 0, .2), transparent 42%),
            radial-gradient(circle at 90% 92%, rgba(255, 45, 155, .22), transparent 45%);
          box-shadow: 0 10px 20px rgba(255, 86, 30, .11), 0 0 0 1px rgba(238, 42, 194, .08), inset 0 1px rgba(255,255,255,.98);
        }
        .ai-reference-actions button span {
          position: relative;
          z-index: 1;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          color: #ff542f;
          background: transparent;
          box-shadow: none;
        }
        .ai-reference-actions button:nth-child(2) span {
          color: #e42c8d;
          background: transparent;
          box-shadow: none;
        }
        .ai-reference-actions button:nth-child(3) span {
          color: #8f35ff;
          background: transparent;
          box-shadow: none;
        }
        .ai-reference-actions button:nth-child(4) span {
          color: #ff7a00;
          background: transparent;
          box-shadow: none;
        }
        .ai-reference-actions button span svg {
          stroke-width: 2.55;
          filter: drop-shadow(0 3px 7px rgba(255, 45, 155, .24));
        }
        .ai-reference-actions b {
          position: relative;
          z-index: 1;
          min-height: 21px;
          max-width: 74px;
          color: #211424;
          font-size: 9.2px;
          line-height: 1.18;
          letter-spacing: 0;
        }
        .ai-reference-actions i {
          position: relative;
          z-index: 1;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          color: white;
          background: linear-gradient(145deg, #ff7a00, #ff2d75 55%, #8f35ff);
          display: grid;
          place-items: center;
          font-size: 11px;
          box-shadow: 0 5px 10px rgba(255, 45, 117, .18), 0 0 0 1px rgba(255,255,255,.28);
        }
        .ai-ref-title-row {
          margin-top: 10px;
        }
        .ai-bottom-input {
          bottom: calc(72px + env(safe-area-inset-bottom, 0px));
          height: 46px;
          left: max(28px, calc((100vw - 390px) / 2 + 28px));
          right: max(28px, calc((100vw - 390px) / 2 + 28px));
          max-width: 334px;
        }
        .ai-bottom-input button {
          width: 36px;
          height: 36px;
        }
        .ai-page:not(.is-light) {
          color: #ffffff;
          background: #050109;
          box-shadow: 0 0 0 1px rgba(255, 45, 155, .18), 0 24px 70px rgba(0, 0, 0, .52);
        }
        .ai-page:not(.is-light) .ai-backdrop {
          background:
            radial-gradient(circle at 10% 7%, rgba(255, 106, 0, .16), transparent 24%),
            radial-gradient(circle at 88% 10%, rgba(255, 45, 155, .18), transparent 26%),
            radial-gradient(circle at 80% 92%, rgba(126, 40, 255, .2), transparent 30%),
            linear-gradient(180deg, #030105 0%, #090111 50%, #030105 100%);
        }
        .ai-page:not(.is-light) .ai-brand span,
        .ai-page:not(.is-light) .ai-ref-title-row,
        .ai-page:not(.is-light) .ai-single-head h2,
        .ai-page:not(.is-light) .ai-single-row button,
        .ai-page:not(.is-light) .ai-single-chips button,
        .ai-page:not(.is-light) .ai-reference-actions button {
          color: #ffffff;
        }
        .ai-page:not(.is-light) .ai-icon-button,
        .ai-page:not(.is-light) .ai-pro-pill,
        .ai-page:not(.is-light) .ai-single-create,
        .ai-page:not(.is-light) .ai-reference-actions button,
        .ai-page:not(.is-light) .ai-single-row button:not(.active),
        .ai-page:not(.is-light) .ai-single-upload,
        .ai-page:not(.is-light) .ai-single-prompt,
        .ai-page:not(.is-light) .ai-single-chips button {
          background: rgba(255, 255, 255, .07);
          border-color: rgba(255, 255, 255, .1);
          box-shadow: 0 12px 28px rgba(0, 0, 0, .28), inset 0 1px rgba(255,255,255,.08);
        }
        .ai-page:not(.is-light) .ai-single-head p,
        .ai-page:not(.is-light) .ai-media-title p {
          color: rgba(255, 255, 255, .58);
        }
        .ai-page:not(.is-light) .ai-single-prompt textarea {
          color: #ffffff;
        }
        .ai-page:not(.is-light) .ai-single-prompt {
          background:
            linear-gradient(145deg, rgba(31, 8, 24, .92), rgba(16, 6, 25, .9)),
            radial-gradient(circle at 10% 0%, rgba(255,122,0,.18), transparent 40%),
            radial-gradient(circle at 92% 100%, rgba(143,53,255,.2), transparent 42%);
          border-color: rgba(255,45,155,.22);
        }
        .ai-page:not(.is-light) .ai-prompt-label {
          color: #ff8a1f;
        }
        .ai-page:not(.is-light) .ai-tools-popover {
          border-color: rgba(255, 122, 0, .28);
          background:
            linear-gradient(145deg, rgba(24, 8, 27, .96), rgba(13, 5, 20, .94)),
            radial-gradient(circle at 12% 10%, rgba(255, 122, 0, .18), transparent 42%),
            radial-gradient(circle at 92% 86%, rgba(143, 53, 255, .18), transparent 45%);
          box-shadow: 0 18px 38px rgba(0, 0, 0, .38), inset 0 1px rgba(255,255,255,.08);
        }
        .ai-page:not(.is-light) .ai-tools-popover button {
          color: #ffffff;
        }
        .ai-header {
          min-height: 52px;
          height: 52px;
          padding-left: 14px;
          padding-top: calc(env(safe-area-inset-top, 0px) + 10px);
          overflow: visible;
        }
        .ai-brand {
          min-height: 34px;
          flex-direction: row;
          align-items: center;
          justify-content: flex-start;
          text-align: left;
          position: absolute;
          left: 50%;
          right: auto;
          top: calc(env(safe-area-inset-top, 0px) + 14px);
          transform: translateX(-50%);
          z-index: 10001;
          pointer-events: none;
        }
        .ai-brand > *:first-child {
          flex: 0 0 auto;
          transform: none !important;
        }
        .ai-brand span {
          position: relative;
          top: 0;
          margin: 0;
          white-space: nowrap;
          font-size: 10px;
          line-height: 1;
          letter-spacing: .18em;
          font-weight: 300;
          color: rgba(23, 16, 30, .86);
          text-transform: uppercase;
          text-shadow: 0 0 14px rgba(255, 45, 155, .18);
        }
        .ai-header-actions {
          grid-column: 2;
          margin-left: auto;
          z-index: 10002;
        }
        .ai-page:not(.is-light) .ai-brand span {
          color: rgba(255, 255, 255, .86);
          text-shadow: 0 0 16px rgba(255, 45, 155, .28), 0 0 20px rgba(255, 122, 0, .12);
        }
        .ai-page:not(.is-light) .ai-single-upload {
          color: #ffffff;
          border-color: rgba(255, 122, 0, .52);
          background:
            linear-gradient(145deg, rgba(31, 8, 24, .94), rgba(20, 7, 31, .9)),
            radial-gradient(circle at 16% 12%, rgba(255, 122, 0, .34), transparent 44%),
            radial-gradient(circle at 88% 88%, rgba(255, 45, 155, .28), transparent 46%);
          box-shadow:
            0 12px 24px rgba(255, 45, 155, .12),
            0 0 0 1px rgba(143, 53, 255, .13),
            inset 0 1px rgba(255,255,255,.12);
        }
        .ai-page:not(.is-light) .ai-reference-actions button {
          border-color: rgba(255, 99, 39, .38);
          background:
            linear-gradient(145deg, rgba(29, 11, 20, .96), rgba(20, 7, 26, .92)),
            radial-gradient(circle at 18% 8%, rgba(255, 106, 0, .2), transparent 42%),
            radial-gradient(circle at 90% 94%, rgba(255, 45, 155, .2), transparent 44%);
          box-shadow: 0 10px 22px rgba(0, 0, 0, .3), 0 0 0 1px rgba(255, 45, 155, .12), 0 0 18px rgba(255, 45, 155, .07), inset 0 1px rgba(255,255,255,.08);
        }
        .ai-page:not(.is-light) .ai-reference-actions button:nth-child(2) {
          border-color: rgba(255, 45, 155, .4);
          background:
            linear-gradient(145deg, rgba(31, 9, 28, .96), rgba(17, 7, 28, .92)),
            radial-gradient(circle at 18% 8%, rgba(255, 45, 155, .22), transparent 42%),
            radial-gradient(circle at 90% 94%, rgba(151, 58, 255, .22), transparent 44%);
        }
        .ai-page:not(.is-light) .ai-reference-actions button:nth-child(3) {
          border-color: rgba(143, 53, 255, .42);
          background:
            linear-gradient(145deg, rgba(21, 9, 33, .96), rgba(23, 7, 27, .92)),
            radial-gradient(circle at 18% 8%, rgba(143, 53, 255, .24), transparent 42%),
            radial-gradient(circle at 90% 94%, rgba(255, 76, 147, .18), transparent 44%);
        }
        .ai-page:not(.is-light) .ai-reference-actions button:nth-child(4) {
          border-color: rgba(255, 122, 0, .4);
          background:
            linear-gradient(145deg, rgba(31, 11, 19, .96), rgba(19, 6, 24, .92)),
            radial-gradient(circle at 18% 8%, rgba(255, 122, 0, .2), transparent 42%),
            radial-gradient(circle at 90% 94%, rgba(238, 42, 194, .2), transparent 44%);
        }
        .ai-page:not(.is-light) .ai-reference-actions b {
          color: #ffffff;
        }
        @media (max-width: 380px) {
          .ai-content { padding: 0 10px; }
          .ai-tabs { gap: 6px; padding-left: 10px; padding-right: 10px; }
          .ai-tabs button span { display: none; }
          .ai-hero-compact { grid-template-columns: 84px 1fr; padding: 15px; }
          .ai-orb-3d { width: 74px; height: 74px; }
          .ai-orb-3d img { width: 38px; }
          .ai-hero-copy h1 { font-size: 20px; }
          .ai-reference-actions { gap: 7px; }
          .ai-reference-actions button { min-height: 108px; border-radius: 17px; }
          .ai-reference-actions button span { width: 46px; height: 46px; }
          .ai-magic-banner { grid-template-columns: 1fr 140px; padding: 16px; }
          .ai-magic-previews button { width: 66px; height: 92px; }
          .ai-mode-card { min-height: 64px; }
        }
      `}</style>
    </div>
  );
}
