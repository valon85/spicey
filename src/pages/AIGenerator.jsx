import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen,
  Bell,
  Camera,
  ChevronRight,
  Clapperboard,
  Hash,
  Home,
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
  UserRound,
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

function UserAvatarMedia({ src, alt = 'You' }) {
  const isVideo = typeof src === 'string' && /\.(mp4|mov|webm|m4v)(\?|#|$)/i.test(src);
  if (!src) return null;
  if (isVideo) {
    return <video src={src} muted autoPlay loop playsInline aria-label={alt} />;
  }
  return <img src={src} alt={alt} />;
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

function LightAIHome({ onStartChat, onMode, isLight }) {
  const featureCards = [
    {
      title: 'AI Chat',
      text: 'Talk with AI that understands you. Get answers, ideas and support anytime.',
      badge: 'New',
      icon: <MessageSquare size={22} />,
      action: 'Start Chat',
      className: 'chat',
      onClick: () => onStartChat('Ask Spicey AI anything'),
      image: '/spicey-assets/ai-ref-card-chat-dark.png',
    },
    {
      title: 'AI Photo',
      text: 'Create stunning images with AI. From imagination to masterpiece.',
      badge: 'Hot',
      icon: <ImagePlus size={22} />,
      action: 'Create Photo',
      className: 'photo',
      onClick: () => onMode('media'),
      image: '/spicey-assets/ai-ref-card-photo-dark.png',
    },
    {
      title: 'AI Video',
      text: 'Turn ideas into cinematic videos. AI makes it simple and powerful.',
      badge: 'Beta',
      icon: <Video size={22} />,
      action: 'Create Video',
      className: 'video',
      onClick: () => onMode('media'),
      image: '/spicey-assets/ai-ref-card-video-dark.png',
    },
  ];

  const creations = [
    { type: 'video', image: '/spicey-assets/ai-ref-creation-1-dark.png' },
    { type: 'photo', image: '/spicey-assets/ai-ref-creation-2-dark.png' },
    { type: 'video', image: '/spicey-assets/ai-ref-creation-3-dark.png' },
    { type: 'photo', image: '/spicey-assets/ai-ref-creation-4-dark.png' },
  ];

  return (
    <div className="ai-ref-studio">
      <section className="ai-ref-hero" onClick={() => onMode('media')}>
        <div className="ai-ref-hero-copy">
          <span>Welcome to</span>
          <h1>Spicey<br />Studio</h1>
          <p>Your creative AI space. Chat. Create. Inspire.</p>
          <button type="button" onClick={() => onMode('media')}>
            <Sparkles size={16} />
            <b>Explore Studio</b>
            <ChevronRight size={18} />
          </button>
        </div>
        <img
          className="ai-ref-hero-person"
          src={isLight ? 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=720&q=90' : 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=720&q=90'}
          alt=""
        />
        <div className="ai-ref-hero-ring" />
      </section>

      <section className="ai-ref-feature-grid">
        {featureCards.map((card) => (
          <button key={card.title} type="button" className={`ai-ref-feature ${card.className}`} onClick={card.onClick}>
            <img src={card.image} alt="" />
            <span className="ai-ref-feature-icon">{card.icon}</span>
            <span className="ai-ref-badge">{card.badge}</span>
            <b>{card.title}</b>
            <p>{card.text}</p>
            <i>{card.action}<ChevronRight size={16} /></i>
          </button>
        ))}
      </section>

      <section className="ai-ref-section-head">
        <h2>Recent Creations</h2>
        <button type="button" onClick={() => onMode('media')}>View All <ChevronRight size={16} /></button>
      </section>

      <section className="ai-ref-creations">
        {creations.map((item, index) => (
          <button key={item.image} type="button" onClick={() => onMode('media')}>
            <img src={item.image} alt="" />
            <span>{item.type === 'video' ? <Video size={16} /> : <ImagePlus size={16} />}</span>
            {item.type === 'video' && <i>▶</i>}
          </button>
        ))}
      </section>

      <button
        type="button"
        className="spicey-talk-panel"
        onClick={() => onMode('talk')}
        aria-label="Open Spicey Talk"
      >
        <span className="spicey-talk-mic"><Mic size={18} /></span>
        <span className="spicey-talk-copy">
          <strong>SPICEY TALK</strong>
          <small>Premium Voice</small>
        </span>
        <span className="spicey-talk-start">Start <ChevronRight size={14} /></span>
      </button>

      <nav className="ai-ref-bottom-nav" aria-label="Studio navigation">
        <button type="button" className="active" onClick={() => window.location.href = '/'}>
          <Home size={23} />
          <span>Home</span>
        </button>
        <button type="button" onClick={() => window.location.href = '/messages'}>
          <MessageSquare size={23} />
          <span>Messages</span>
        </button>
        <button type="button" className="ai-ref-plus" onClick={() => window.location.href = '/create'}>
          <span>+</span>
        </button>
        <button type="button" onClick={() => onStartChat('Open Spicey Studio')}>
          <Sparkles size={23} />
          <span>Studio</span>
        </button>
        <button type="button" onClick={() => window.location.href = '/profile'}>
          <UserRound size={23} />
          <span>Profile</span>
        </button>
      </nav>
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
          maxLength={600}
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

function MediaStudio({ initialKind = 'photo', shortFilm = false }) {
  const [kind, setKind] = useState(initialKind);
  const [format, setFormat] = useState(shortFilm ? 'landscape' : 'portrait');
  const [seconds, setSeconds] = useState(shortFilm ? 12 : 8);
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
        const result = await base44.integrations.Core.GenerateVideo({
          prompt: prompt.trim(),
          size: format === 'landscape' ? '1280x720' : '720x1280',
          seconds,
        });
        setResultUrl(result.url || '');
        setResultType('video');
        if (!result.url) setError(result.message || 'AI video did not return a preview yet.');
      } else {
        const result = await base44.integrations.Core.GenerateImage({
          prompt: prompt.trim(),
          existing_image_urls: uploadedUrl ? [uploadedUrl] : undefined,
          size: format === 'landscape' ? '1536x1024' : format === 'square' ? '1024x1024' : '1024x1536',
          quality: 'medium',
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
    <div className={`ai-panel-scroll ai-creator-v2 is-${kind}`}>
      <section className="ai-creator-v2-hero">
        <span className="ai-creator-v2-icon">{kind === 'photo' ? <Camera size={22} /> : <Clapperboard size={22} />}</span>
        <div>
          <small>SPICEY CREATIVE STUDIO</small>
          <h2>{shortFilm ? 'Create a Short Film' : kind === 'photo' ? 'Create an AI Photo' : 'Create an AI Video'}</h2>
          <p>{shortFilm ? 'Turn a story idea into a cinematic landscape clip.' : kind === 'photo' ? 'Turn an idea into a polished image.' : 'Describe a scene and generate a vertical reel.'}</p>
        </div>
      </section>

      {!shortFilm && <div className="ai-creator-v2-toggle">
        <button type="button" className={kind === 'photo' ? 'active' : ''} onClick={() => setKind('photo')}>
          <Camera size={16} /> Photo
        </button>
        <button type="button" className={kind === 'video' ? 'active' : ''} onClick={() => setKind('video')}>
          <Video size={16} /> Video
        </button>
      </div>}

      <div className="ai-creator-v2-preview">
      <input ref={fileRef} type="file" accept={kind === 'photo' ? 'image/*' : 'video/*'} hidden onChange={chooseFile} />
      <button type="button" className="ai-creator-v2-upload" onClick={() => fileRef.current?.click()}>
        {filePreview ? (
          kind === 'video' ? <video src={filePreview} muted playsInline /> : <img src={filePreview} alt="" />
        ) : (
          <span className="ai-creator-v2-empty">
            {kind === 'photo' ? <ImagePlus size={29} /> : <Video size={29} />}
            <b>{kind === 'photo' ? 'Add a reference photo' : 'Add a reference video'}</b>
            <small>Optional · tap to choose from your library</small>
          </span>
        )}
      </button>
      {resultUrl && (
        <div className="ai-creator-v2-result">
          {resultType === 'video' ? <video src={resultUrl} controls playsInline /> : <img src={resultUrl} alt="AI generated result" />}
          <span>AI RESULT</span>
        </div>
      )}
      </div>

      <label className="ai-creator-v2-prompt">
        <span>Describe what you want</span>
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder={shortFilm ? 'Scene, character, action, mood and camera direction for your short film...' : kind === 'video' ? 'A cinematic New York night, neon reflections, smooth camera movement...' : 'A realistic fashion portrait, orange and pink neon light, editorial quality...'}
          rows={4}
          maxLength={600}
        />
        <small>{prompt.length}/600</small>
      </label>

      <div className="ai-creator-v2-chips">
        {(shortFilm ? ['Cinematic story', 'Opening shot', 'Character scene', 'Dramatic ending'] : kind === 'photo' ? ['Editorial', 'Neon night', 'Luxury', 'Ultra realistic'] : ['Cinematic', 'Fast motion', 'Night city', 'Viral reel']).map((style) => (
          <button key={style} type="button" onClick={() => setPrompt((current) => current ? `${current}, ${style.toLowerCase()}` : style)}>
            {style}
          </button>
        ))}
      </div>

      <div className="ai-creator-v2-options">
        <div>
          <span>Format</span>
          <div className="ai-creator-v2-segmented">
            {['portrait', 'square', 'landscape'].filter((item) => kind === 'photo' || item !== 'square').map((item) => (
              <button type="button" key={item} className={format === item ? 'active' : ''} onClick={() => setFormat(item)}>{item}</button>
            ))}
          </div>
        </div>
        {kind === 'video' && !shortFilm && (
          <div>
            <span>Length</span>
            <div className="ai-creator-v2-segmented">
              {[4, 8, 12].map((value) => <button type="button" key={value} className={seconds === value ? 'active' : ''} onClick={() => setSeconds(value)}>{value}s</button>)}
            </div>
          </div>
        )}
      </div>

      {error && <p className="ai-error">{error}</p>}

      <button type="button" className="ai-creator-v2-generate" disabled={!prompt.trim() || loading} onClick={generate}>
        {loading ? <Loader2 size={17} className="ai-spin" /> : <Wand2 size={17} />}
        {loading ? (kind === 'video' ? 'Generating video...' : 'Creating photo...') : shortFilm ? 'Generate Short Film Scene' : kind === 'video' ? 'Generate AI Video' : 'Generate AI Photo'}
      </button>
    </div>
  );
}

function ChatMode({ isLight, initialPrompt, onClose }) {
  return (
    <div className="ai-chat-shell">
      <button type="button" className="ai-close-chat" onClick={onClose} aria-label="Close chat">
        <X size={16} />
      </button>
      <AITextChat isLight={isLight} initialPrompt={initialPrompt} onClose={onClose} />
    </div>
  );
}

export default function AIGenerator() {
  const navigate = useNavigate();
  const isLight = useLightMode();
  const [currentUserAvatar, setCurrentUserAvatar] = useState('');
  const [mode, setMode] = useState(() => {
    const requestedMode = new URLSearchParams(window.location.search).get('mode');
    return ['home', 'chat', 'photo', 'video', 'short-film'].includes(requestedMode) ? requestedMode : 'home';
  });
  const [chatPrompt, setChatPrompt] = useState('');
  const [talkOpen, setTalkOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    const loadAvatar = async () => {
      try {
        const user = await base44.auth.me();
        const profiles = await base44.entities.UserProfile
          .filter({ user_id: user.id }, '-created_date', 1)
          .catch(() => []);
        const profile = profiles?.[0] || {};
        const avatar = profile.avatar_url || user.avatar_url || user.photo_url || '';
        if (alive) {
          setCurrentUserAvatar(
            avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || user.username || user.email || 'Spicey')}&background=ff2d8f&color=fff&size=160`
          );
        }
      } catch (error) {
        if (alive) {
          setCurrentUserAvatar('https://ui-avatars.com/api/?name=S&background=ff2d8f&color=fff&size=160');
        }
      }
    };
    loadAvatar();
    return () => { alive = false; };
  }, []);

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
    <div className={`ai-page ${isLight ? 'is-light' : 'is-dark'}`}>
      <div className="ai-backdrop" />

      <header className="ai-header ai-ref-header">
        <button type="button" className="ai-ref-header-logo" onClick={() => setMode('home')} aria-label="Spicey Studio home">
          <img src="/spicey-assets/spicey-s-symbol.svg" alt="" />
        </button>
        <button type="button" className="ai-ref-header-word" onClick={() => setMode('home')}>
          Spicey
        </button>
        <div className="ai-ref-header-actions">
          <button type="button" className="ai-ref-bell" onClick={() => openMode('talk')} aria-label="AI notifications">
            <Bell size={23} />
            <span />
          </button>
          <button type="button" className="ai-ref-avatar" onClick={() => window.location.href = '/profile'} aria-label="Open profile">
            <UserAvatarMedia src={currentUserAvatar} alt="Your profile" />
            <span />
          </button>
        </div>
      </header>

      <nav className="ai-ref-tabs" aria-label="AI modes">
          <button
            type="button"
            className={mode === 'home' || mode === 'chat' ? 'active' : ''}
            onClick={() => setMode('home')}
          >
            <MessageSquare size={20} />
            <span>AI Chat</span>
          </button>
          <button type="button" className={mode === 'photo' ? 'active' : ''} onClick={() => openMode('photo')}>
            <ImagePlus size={20} />
            <span>AI Photo</span>
          </button>
          <button type="button" className={mode === 'video' ? 'active' : ''} onClick={() => openMode('video')}>
            <Video size={20} />
            <span>AI Video</span>
          </button>
          <button type="button" className={mode === 'short-film' ? 'active' : ''} onClick={() => openMode('short-film')}>
            <Clapperboard size={20} />
            <span>Short Film</span>
          </button>
      </nav>

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
            {mode === 'home' && <LightAIHome onStartChat={startChat} onMode={openMode} isLight={isLight} />}
            {mode === 'chat' && <ChatMode isLight={isLight} initialPrompt={chatPrompt} onClose={() => setMode('home')} />}
            {mode === 'photo' && <MediaStudio initialKind="photo" />}
            {mode === 'video' && <MediaStudio initialKind="video" />}
            {mode === 'short-film' && <MediaStudio initialKind="video" shortFilm />}
          </motion.div>
        </AnimatePresence>
      </main>

      {false && mode === 'home' && (
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
        @media (min-width: 1024px) {
          .ai-page {
            width: 100% !important;
            max-width: none !important;
            min-height: 100dvh;
            margin: 0 !important;
            padding-bottom: 112px !important;
            box-shadow: none !important;
            background: #ffffff !important;
            overflow-y: auto !important;
          }
          .ai-backdrop {
            left: auto !important;
            width: 100% !important;
            transform: none !important;
            background: #ffffff !important;
          }
          .ai-header {
            max-width: 900px !important;
            margin: 0 auto !important;
            padding: 24px 32px 14px !important;
          }
          .ai-content {
            width: 100% !important;
            max-width: 900px !important;
            height: auto !important;
            min-height: calc(100dvh - 170px) !important;
            margin: 0 auto !important;
            padding: 0 32px 130px !important;
          }
          .ai-motion-panel,
          .ai-panel-scroll {
            width: 100% !important;
          }
          .ai-hero-compact {
            min-height: 180px !important;
            grid-template-columns: 132px 1fr !important;
            padding: 28px 30px !important;
            border-radius: 22px !important;
          }
          .ai-orb-3d {
            width: 108px !important;
            height: 108px !important;
          }
          .ai-orb-3d img {
            width: 58px !important;
          }
          .ai-single-create,
          .ai-magic-banner,
          .ai-chat-shell,
          .ai-studio-panel {
            border-radius: 18px !important;
          }
          .ai-reference-actions {
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
            gap: 14px !important;
          }
          .ai-bottom-input {
            left: 50% !important;
            right: auto !important;
            bottom: 28px !important;
            width: min(720px, calc(100vw - 38rem)) !important;
            max-width: 720px !important;
            transform: translateX(-50%) !important;
          }
        }
        .ai-brand-bolt {
          display: inline-grid;
          place-items: center;
          color: #ff4b12;
          filter: drop-shadow(0 8px 16px rgba(255, 45, 117, .26));
        }
        .ai-brand .ai-brand-word {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 1px;
          margin: 0;
          color: inherit;
          letter-spacing: 0;
          line-height: 1;
          text-transform: none;
        }
        .ai-brand-word strong {
          font-size: 28px;
          font-style: italic;
          font-weight: 950;
          letter-spacing: 0;
          line-height: .9;
          background: linear-gradient(100deg, #ff571f 0%, #ff2d75 56%, #8b2dff 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .ai-brand-word small {
          margin-left: 12px;
          color: rgba(20, 18, 34, .66);
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .46em;
          line-height: 1.1;
        }
        .ai-menu-button {
          width: 52px;
          height: 52px;
          border: 0;
          border-radius: 50%;
          color: #14101d;
          background: rgba(255, 255, 255, .78);
          box-shadow: 0 14px 30px rgba(117, 31, 93, .12), inset 0 1px rgba(255,255,255,.9);
          display: grid;
          place-items: center;
        }
        .ai-ref-tabs {
          position: relative;
          z-index: 3;
          width: calc(100% - 34px);
          max-width: 430px;
          margin: 10px auto 16px;
          padding: 7px;
          border-radius: 28px;
          background: rgba(255, 255, 255, .7);
          box-shadow: 0 18px 40px rgba(255, 88, 159, .12), inset 0 1px rgba(255,255,255,.86);
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 5px;
        }
        .ai-ref-tabs button {
          min-width: 0;
          height: 52px;
          border: 0;
          border-radius: 22px;
          color: #2a2333;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 950;
          white-space: nowrap;
        }
        .ai-ref-tabs button svg {
          flex: 0 0 auto;
          color: #d33596;
        }
        .ai-ref-tabs button.active {
          color: #ff4b12;
          background: #ffffff;
          box-shadow: 0 12px 24px rgba(232, 71, 132, .13), inset 0 1px rgba(255,255,255,.9);
        }
        .ai-ref-tabs button.active svg {
          color: #ff4b12;
        }
        .ai-page.is-light {
          color: #17101d;
          background:
            radial-gradient(circle at 5% 2%, rgba(255, 101, 32, .12), transparent 26%),
            radial-gradient(circle at 96% 11%, rgba(255, 45, 155, .13), transparent 28%),
            linear-gradient(180deg, #fffaf7 0%, #fff3f8 56%, #f172d4 100%) !important;
        }
        .ai-page.is-light .ai-backdrop {
          background:
            radial-gradient(circle at 8% 10%, rgba(255, 106, 0, .16), transparent 24%),
            radial-gradient(circle at 94% 12%, rgba(255, 45, 155, .16), transparent 26%),
            radial-gradient(circle at 62% 86%, rgba(143, 53, 255, .22), transparent 30%),
            linear-gradient(180deg, #fffaf7 0%, #fff1f8 58%, #f071d3 100%) !important;
        }
        .ai-page.is-light .ai-header {
          position: relative !important;
          left: auto !important;
          top: auto !important;
          width: 100%;
          height: auto;
          min-height: 84px;
          max-width: 430px;
          margin: 0 auto;
          padding: calc(env(safe-area-inset-top, 0px) + 18px) 22px 8px !important;
          display: flex !important;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          overflow: visible;
        }
        .ai-page.is-light .ai-brand {
          position: relative !important;
          left: auto !important;
          top: auto !important;
          transform: none !important;
          pointer-events: auto;
          min-height: 0;
          flex: 1 1 auto;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 8px;
        }
        .ai-page.is-light .ai-brand > *:first-child {
          transform: none !important;
        }
        .ai-page.is-light .ai-brand-bolt svg {
          width: 44px;
          height: 44px;
        }
        .ai-page.is-light .ai-brand-word strong {
          font-size: clamp(28px, 8vw, 42px);
        }
        .ai-page.is-light .ai-brand-word small {
          font-size: clamp(8px, 2.25vw, 12px);
        }
        .ai-page.is-light .ai-header-actions {
          position: relative;
          z-index: 4;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-left: auto;
          grid-column: auto;
        }
        .ai-page.is-light .ai-pro-pill {
          height: 50px;
          min-width: 84px;
          border: 0;
          border-radius: 999px;
          color: #ff4b12;
          background: rgba(255, 255, 255, .82);
          box-shadow: 0 14px 30px rgba(255, 90, 115, .15), inset 0 1px rgba(255,255,255,.92);
        }
        .ai-page.is-light .ai-content {
          height: auto;
          min-height: calc(100dvh - 245px);
          padding: 0 17px 178px;
        }
        .ai-page.is-light .ai-panel-scroll {
          padding: 0 0 24px;
        }
        .ai-page.is-light .ai-hero-compact {
          min-height: 184px;
          grid-template-columns: 118px 1fr;
          gap: 18px;
          padding: 25px 24px;
          border: 0;
          border-radius: 24px;
          color: #ffffff;
          background:
            radial-gradient(circle at 10% 70%, rgba(255, 106, 0, .34), transparent 34%),
            radial-gradient(circle at 90% 18%, rgba(255, 45, 155, .28), transparent 30%),
            linear-gradient(135deg, #411733 0%, #1f0f2d 56%, #79264e 100%);
          box-shadow: 0 22px 46px rgba(104, 32, 75, .22), inset 0 1px rgba(255,255,255,.1);
        }
        .ai-page.is-light .ai-orb-3d {
          width: 112px;
          height: 112px;
          box-shadow: 0 18px 34px rgba(255, 45, 117, .36), 0 0 0 10px rgba(255,255,255,.04);
        }
        .ai-page.is-light .ai-orb-3d img {
          width: 58px;
        }
        .ai-page.is-light .ai-hero-copy h1 {
          margin: 0 0 12px;
          color: #ffffff;
          font-size: 28px;
          line-height: 1.05;
          text-shadow: none;
        }
        .ai-page.is-light .ai-hero-copy p {
          max-width: 410px;
          color: rgba(255,255,255,.74);
          font-size: 17px;
          line-height: 1.5;
        }
        .ai-page.is-light .ai-hero-copy button {
          margin-top: 16px;
          border: 0;
          color: #ff4b5f;
          background: transparent;
          font-size: 16px;
          font-weight: 950;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .ai-page.is-light .ai-single-create,
        .ai-page.is-light .ai-soft-list,
        .ai-page.is-light .ai-light-note {
          display: none !important;
        }
        .ai-page.is-light .ai-ref-title-row {
          margin: 28px 4px 14px;
          color: #0f1019;
          font-size: 19px;
        }
        .ai-page.is-light .ai-ref-title-row button {
          color: #ff4b12;
          font-size: 14px;
        }
        .ai-page.is-light .ai-ref-title-row button::after {
          content: '>';
          margin-left: 6px;
        }
        .ai-page.is-light .ai-reference-actions {
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }
        .ai-page.is-light .ai-reference-actions button {
          min-height: 124px;
          border: 0;
          border-radius: 20px;
          background: rgba(255, 255, 255, .75);
          box-shadow: 0 18px 36px rgba(135, 41, 100, .1), inset 0 1px rgba(255,255,255,.9);
        }
        .ai-page.is-light .ai-reference-actions button span {
          width: 54px;
          height: 54px;
          background: linear-gradient(145deg, rgba(255, 237, 222, .95), rgba(255, 229, 244, .95));
          color: #ff4b12;
        }
        .ai-page.is-light .ai-reference-actions button:nth-child(2) span {
          color: #e63386;
          background: linear-gradient(145deg, #ffe7f1, #fff0f8);
        }
        .ai-page.is-light .ai-reference-actions button:nth-child(3) span {
          color: #8b42e8;
          background: linear-gradient(145deg, #eee6ff, #fff3fb);
        }
        .ai-page.is-light .ai-reference-actions button:nth-child(4) span {
          color: #d33596;
          background: linear-gradient(145deg, #ffe8f4, #fff1f7);
        }
        .ai-page.is-light .ai-reference-actions b {
          max-width: 98px;
          color: #17101d;
          font-size: 13px;
          line-height: 1.25;
        }
        .ai-page.is-light .ai-reference-actions i {
          width: auto;
          height: auto;
          color: #ff4b12;
          background: transparent;
          box-shadow: none;
          font-size: 22px;
        }
        .ai-page.is-light .ai-magic-banner {
          min-height: 178px;
          margin-top: 28px;
          grid-template-columns: minmax(0, 1fr) 220px;
          border: 0;
          border-radius: 24px;
          padding: 28px;
          color: #ffffff;
          background: linear-gradient(135deg, #ff6940 0%, #e72e8e 48%, #8a42f5 100%);
          box-shadow: 0 28px 54px rgba(198, 54, 174, .24);
        }
        .ai-page.is-light .ai-magic-banner h2 {
          color: #ffffff;
          font-size: 24px;
          line-height: 1.2;
        }
        .ai-page.is-light .ai-magic-banner h2 strong {
          color: #ffd34b;
        }
        .ai-page.is-light .ai-magic-banner p {
          color: rgba(255,255,255,.86);
          font-size: 15px;
        }
        .ai-page.is-light .ai-magic-banner button {
          color: #ff4b12;
          background: rgba(255,255,255,.88);
        }
        .ai-page.is-light .ai-magic-previews {
          justify-content: flex-end;
        }
        .ai-page.is-light .ai-magic-previews button {
          width: 96px;
          height: 132px;
          border-radius: 16px;
          border: 2px solid rgba(255,255,255,.42);
          background: rgba(0,0,0,.2);
          transform: rotate(-5deg);
          box-shadow: 0 16px 28px rgba(64, 13, 70, .24);
        }
        .ai-page.is-light .ai-magic-previews button + button {
          transform: rotate(5deg);
          margin-left: -18px;
        }
        .ai-page.is-light .ai-bottom-input {
          left: max(24px, calc((100vw - 430px) / 2 + 24px));
          right: max(24px, calc((100vw - 430px) / 2 + 24px));
          bottom: calc(94px + env(safe-area-inset-bottom, 0px));
          max-width: 382px;
          height: 70px;
          padding: 8px;
          border-radius: 999px;
          background: rgba(53, 22, 58, .92);
          box-shadow: 0 22px 52px rgba(174, 52, 192, .26), inset 0 1px rgba(255,255,255,.12);
        }
        .ai-page.is-light .ai-bottom-input input {
          color: #ffffff;
          background: transparent;
          font-size: 16px;
          padding-left: 18px;
        }
        .ai-page.is-light .ai-bottom-input input::placeholder {
          color: rgba(255,255,255,.56);
        }
        .ai-page.is-light .ai-bottom-input button {
          width: 54px;
          height: 54px;
          background: linear-gradient(145deg, #ff7a35, #ff2d75 58%, #8f35ff);
          box-shadow: 0 12px 24px rgba(255,45,155,.3), inset 0 2px rgba(255,255,255,.24);
        }
        @media (max-width: 520px) {
          .ai-page.is-light .ai-header {
            padding-left: 18px !important;
            padding-right: 18px !important;
          }
          .ai-page.is-light .ai-brand-bolt svg {
            width: 37px;
            height: 37px;
          }
          .ai-page.is-light .ai-pro-pill {
            min-width: 72px;
            height: 44px;
          }
          .ai-page.is-light .ai-menu-button {
            width: 44px;
            height: 44px;
          }
          .ai-ref-tabs {
            width: calc(100% - 34px);
          }
          .ai-ref-tabs button {
            gap: 6px;
            font-size: 12px;
          }
          .ai-page.is-light .ai-hero-compact {
            grid-template-columns: 100px 1fr;
            gap: 15px;
            padding: 22px 20px;
          }
          .ai-page.is-light .ai-orb-3d {
            width: 94px;
            height: 94px;
          }
          .ai-page.is-light .ai-orb-3d img {
            width: 50px;
          }
          .ai-page.is-light .ai-hero-copy h1 {
            font-size: 23px;
          }
          .ai-page.is-light .ai-hero-copy p {
            font-size: 15px;
          }
          .ai-page.is-light .ai-reference-actions {
            gap: 10px;
          }
          .ai-page.is-light .ai-reference-actions button {
            min-height: 122px;
            border-radius: 18px;
          }
          .ai-page.is-light .ai-reference-actions button span {
            width: 50px;
            height: 50px;
          }
          .ai-page.is-light .ai-reference-actions b {
            font-size: 12px;
          }
          .ai-page.is-light .ai-magic-banner {
            grid-template-columns: minmax(0, 1fr) 166px;
            padding: 22px 20px;
          }
          .ai-page.is-light .ai-magic-previews button {
            width: 78px;
            height: 112px;
          }
        }
        @media (max-width: 380px) {
          .ai-ref-tabs button span {
            display: none;
          }
          .ai-page.is-light .ai-hero-compact {
            grid-template-columns: 78px 1fr;
            padding: 18px 15px;
          }
          .ai-page.is-light .ai-orb-3d {
            width: 74px;
            height: 74px;
          }
          .ai-page.is-light .ai-orb-3d img {
            width: 40px;
          }
          .ai-page.is-light .ai-hero-copy h1 {
            font-size: 19px;
          }
          .ai-page.is-light .ai-hero-copy p {
            font-size: 12px;
          }
          .ai-page.is-light .ai-reference-actions b {
            font-size: 10.5px;
          }
          .ai-page.is-light .ai-magic-banner {
            grid-template-columns: 1fr;
          }
          .ai-page.is-light .ai-magic-previews {
            justify-content: flex-start;
            margin-top: 14px;
          }
        }
        @media (min-width: 1024px) {
          .ai-page.is-light {
            background: #ffffff !important;
          }
          .ai-page.is-light .ai-backdrop {
            background:
              radial-gradient(circle at 17% 4%, rgba(255, 106, 0, .09), transparent 22%),
              radial-gradient(circle at 84% 10%, rgba(255, 45, 155, .09), transparent 24%),
              linear-gradient(180deg, #ffffff 0%, #fff7fb 70%, #fff0fb 100%) !important;
          }
          .ai-page.is-light .ai-header,
          .ai-ref-tabs,
          .ai-page.is-light .ai-content {
            max-width: 980px !important;
          }
          .ai-page.is-light .ai-header {
            padding: 28px 32px 12px !important;
          }
          .ai-page.is-light .ai-content {
            padding: 0 32px 132px !important;
          }
          .ai-page.is-light .ai-hero-compact {
            min-height: 210px !important;
            grid-template-columns: 150px 1fr !important;
            padding: 36px 44px !important;
          }
          .ai-page.is-light .ai-orb-3d {
            width: 132px !important;
            height: 132px !important;
          }
          .ai-page.is-light .ai-orb-3d img {
            width: 68px !important;
          }
          .ai-page.is-light .ai-hero-copy h1 {
            font-size: 34px !important;
          }
          .ai-page.is-light .ai-hero-copy p {
            font-size: 20px !important;
          }
          .ai-page.is-light .ai-reference-actions button {
            min-height: 148px !important;
          }
          .ai-page.is-light .ai-bottom-input {
            width: min(760px, calc(100vw - 38rem)) !important;
            max-width: 760px !important;
            left: 50% !important;
            right: auto !important;
            bottom: 28px !important;
            transform: translateX(-50%) !important;
          }
        }
        .ai-page.is-light {
          width: min(100vw, 430px) !important;
          max-width: 430px !important;
          margin: 0 auto !important;
          background:
            radial-gradient(circle at 92% 5%, rgba(255, 45, 155, .12), transparent 25%),
            radial-gradient(circle at 4% 90%, rgba(255, 103, 46, .22), transparent 24%),
            linear-gradient(180deg, #fffaf6 0%, #fff4f8 49%, #ffd1bf 76%, #e941b8 100%) !important;
          box-shadow: 0 0 0 1px rgba(255, 130, 190, .12), 0 28px 70px rgba(132, 31, 105, .24) !important;
        }
        .ai-page.is-light .ai-backdrop {
          left: 50% !important;
          width: min(100vw, 430px) !important;
          transform: translateX(-50%) !important;
          background:
            radial-gradient(circle at 85% 4%, rgba(255, 43, 145, .13), transparent 24%),
            radial-gradient(circle at 3% 83%, rgba(255, 106, 0, .24), transparent 26%),
            radial-gradient(circle at 78% 84%, rgba(137, 53, 255, .25), transparent 30%),
            linear-gradient(180deg, #fffaf6 0%, #fff5f8 51%, #ffcdb9 76%, #e846bd 100%) !important;
        }
        .ai-page.is-light .ai-header {
          max-width: 430px !important;
          min-height: 98px !important;
          padding: calc(env(safe-area-inset-top, 0px) + 23px) 18px 11px !important;
          gap: 8px !important;
        }
        .ai-page.is-light .ai-brand {
          gap: 7px !important;
          flex: 1 1 auto !important;
          min-width: 0 !important;
        }
        .ai-page.is-light .ai-brand-bolt {
          color: #ff5522 !important;
          filter: drop-shadow(0 7px 12px rgba(255, 49, 106, .22));
        }
        .ai-page.is-light .ai-brand-bolt svg {
          width: 42px !important;
          height: 42px !important;
        }
        .ai-page.is-light .ai-brand-word strong {
          font-size: 36px !important;
          line-height: .82 !important;
          letter-spacing: -.01em !important;
          background: linear-gradient(96deg, #ff5a23 0%, #ff3c63 43%, #d929a5 72%, #8c34ff 100%) !important;
          -webkit-background-clip: text !important;
          background-clip: text !important;
          color: transparent !important;
        }
        .ai-page.is-light .ai-brand-word small {
          margin-left: 8px !important;
          margin-top: 5px !important;
          color: rgba(24, 22, 38, .72) !important;
          font-size: 10px !important;
          letter-spacing: .55em !important;
        }
        .ai-page.is-light .ai-header-actions {
          gap: 10px !important;
          flex: 0 0 auto !important;
        }
        .ai-page.is-light .ai-pro-pill {
          height: 44px !important;
          min-width: 76px !important;
          padding: 0 14px !important;
          color: #ff4b12 !important;
          background: rgba(255, 255, 255, .82) !important;
          box-shadow: 0 16px 28px rgba(230, 55, 126, .14), inset 0 1px rgba(255,255,255,.95) !important;
          font-size: 15px !important;
        }
        .ai-page.is-light .ai-menu-button {
          width: 44px !important;
          height: 44px !important;
          background: rgba(255, 255, 255, .74) !important;
          box-shadow: 0 16px 28px rgba(117, 31, 93, .12), inset 0 1px rgba(255,255,255,.92) !important;
        }
        .ai-page.is-light .ai-ref-tabs {
          width: calc(100% - 34px) !important;
          max-width: 396px !important;
          margin: 10px auto 13px !important;
          padding: 6px !important;
          border-radius: 28px !important;
          background: rgba(255, 255, 255, .72) !important;
          box-shadow: 0 18px 38px rgba(223, 80, 154, .11), inset 0 1px rgba(255,255,255,.94) !important;
        }
        .ai-page.is-light .ai-ref-tabs button {
          height: 48px !important;
          border-radius: 22px !important;
          color: #242032 !important;
          font-size: 13px !important;
          font-weight: 950 !important;
          gap: 7px !important;
        }
        .ai-page.is-light .ai-ref-tabs button svg {
          color: #d43a9a !important;
        }
        .ai-page.is-light .ai-ref-tabs button.active {
          color: #ff4b12 !important;
          background: rgba(255,255,255,.95) !important;
          box-shadow: 0 12px 25px rgba(232, 71, 132, .13), inset 0 1px rgba(255,255,255,.96) !important;
        }
        .ai-page.is-light .ai-ref-tabs button.active svg {
          color: #ff4b12 !important;
        }
        .ai-page.is-light .ai-content {
          padding: 0 17px 184px !important;
          min-height: auto !important;
        }
        .ai-page.is-light .ai-hero-compact {
          min-height: 184px !important;
          grid-template-columns: 122px minmax(0, 1fr) !important;
          gap: 16px !important;
          padding: 23px 21px !important;
          border-radius: 23px !important;
          background:
            radial-gradient(circle at 13% 63%, rgba(255, 106, 37, .36), transparent 32%),
            radial-gradient(circle at 92% 24%, rgba(229, 42, 151, .22), transparent 31%),
            radial-gradient(circle at 83% 82%, rgba(122, 45, 116, .26), transparent 36%),
            linear-gradient(133deg, #41172c 0%, #210f2c 43%, #35153c 68%, #7b254d 100%) !important;
          box-shadow: 0 22px 46px rgba(100, 32, 76, .23), inset 0 1px rgba(255,255,255,.09) !important;
        }
        .ai-page.is-light .ai-orb-3d {
          width: 110px !important;
          height: 110px !important;
          background: radial-gradient(circle at 37% 27%, #ffb069 0%, #ff6b38 28%, #ff2e79 62%, #8f2dff 100%) !important;
          box-shadow: 0 16px 30px rgba(255, 46, 117, .4), 0 0 0 9px rgba(255,255,255,.04) !important;
        }
        .ai-page.is-light .ai-orb-3d img {
          width: 59px !important;
        }
        .ai-page.is-light .ai-hero-copy h1 {
          font-size: 24px !important;
          line-height: 1.08 !important;
          margin: 0 0 13px !important;
          color: #ffffff !important;
        }
        .ai-page.is-light .ai-hero-copy p {
          color: rgba(255,255,255,.74) !important;
          font-size: 16px !important;
          line-height: 1.52 !important;
        }
        .ai-page.is-light .ai-hero-copy button {
          margin-top: 15px !important;
          color: #ff4d58 !important;
          font-size: 16px !important;
        }
        .ai-page.is-light .ai-ref-title-row {
          margin: 23px 20px 14px !important;
          color: #090b14 !important;
          font-size: 19px !important;
          font-weight: 950 !important;
        }
        .ai-page.is-light .ai-reference-actions {
          padding: 0 14px !important;
          gap: 9px !important;
        }
        .ai-page.is-light .ai-reference-actions button {
          min-height: 124px !important;
          border-radius: 17px !important;
          background: rgba(255, 255, 255, .73) !important;
          box-shadow: 0 16px 32px rgba(136, 44, 99, .09), inset 0 1px rgba(255,255,255,.92) !important;
        }
        .ai-page.is-light .ai-reference-actions button span {
          width: 52px !important;
          height: 52px !important;
        }
        .ai-page.is-light .ai-reference-actions b {
          color: #11131d !important;
          font-size: 12px !important;
          line-height: 1.25 !important;
          max-width: 78px !important;
        }
        .ai-page.is-light .ai-reference-actions i {
          color: #ff4b12 !important;
          font-size: 24px !important;
        }
        .ai-page.is-light .ai-magic-banner {
          min-height: 181px !important;
          margin: 27px 0 0 !important;
          grid-template-columns: minmax(0, 1fr) 174px !important;
          gap: 8px !important;
          padding: 25px 20px !important;
          border-radius: 23px !important;
          background:
            radial-gradient(circle at 58% 56%, rgba(255,255,255,.08), transparent 22%),
            linear-gradient(132deg, #ff7048 0%, #f02f78 43%, #c733c9 68%, #8c45ff 100%) !important;
          box-shadow: 0 28px 52px rgba(202, 58, 173, .25) !important;
        }
        .ai-page.is-light .ai-magic-banner h2 {
          font-size: 22px !important;
          line-height: 1.22 !important;
        }
        .ai-page.is-light .ai-magic-banner p {
          margin-top: 15px !important;
          font-size: 15px !important;
          line-height: 1.45 !important;
        }
        .ai-page.is-light .ai-magic-banner > div:first-child > button {
          height: 48px !important;
          padding: 0 18px !important;
          border-radius: 999px !important;
          color: #ff4b12 !important;
          font-size: 14px !important;
          font-weight: 950 !important;
        }
        .ai-page.is-light .ai-magic-previews button {
          width: 78px !important;
          height: 116px !important;
          border-radius: 15px !important;
          border: 2px solid rgba(255,255,255,.45) !important;
        }
        .ai-page.is-light .ai-bottom-input {
          left: max(23px, calc((100vw - 430px) / 2 + 23px)) !important;
          right: max(23px, calc((100vw - 430px) / 2 + 23px)) !important;
          bottom: calc(103px + env(safe-area-inset-bottom, 0px)) !important;
          height: 68px !important;
          max-width: 384px !important;
          background:
            radial-gradient(circle at 83% 50%, rgba(142, 64, 255, .22), transparent 34%),
            linear-gradient(135deg, rgba(77, 31, 52, .94), rgba(51, 24, 67, .96)) !important;
          box-shadow: 0 24px 54px rgba(191, 55, 190, .28), inset 0 1px rgba(255,255,255,.1) !important;
        }
        .ai-page.is-light .ai-bottom-input button {
          width: 52px !important;
          height: 52px !important;
          background: linear-gradient(145deg, #ff8640, #ff2d75 57%, #8f35ff) !important;
        }
        @media (max-width: 390px) {
          .ai-page.is-light .ai-brand-word strong {
            font-size: 30px !important;
          }
          .ai-page.is-light .ai-pro-pill {
            min-width: 66px !important;
            padding: 0 11px !important;
          }
          .ai-page.is-light .ai-ref-tabs button {
            font-size: 11px !important;
          }
          .ai-page.is-light .ai-hero-compact {
            grid-template-columns: 94px minmax(0, 1fr) !important;
            padding: 20px 17px !important;
          }
          .ai-page.is-light .ai-orb-3d {
            width: 86px !important;
            height: 86px !important;
          }
          .ai-page.is-light .ai-hero-copy h1 {
            font-size: 20px !important;
          }
          .ai-page.is-light .ai-hero-copy p,
          .ai-page.is-light .ai-hero-copy button {
            font-size: 13px !important;
          }
          .ai-page.is-light .ai-magic-banner {
            grid-template-columns: 1fr !important;
          }
        }
        .ai-creator-v2 {
          width: min(100%, 620px);
          margin: 0 auto;
          padding: 10px 14px calc(28px + env(safe-area-inset-bottom, 0px));
          display: grid;
          gap: 15px;
        }
        .ai-creator-v2-hero {
          display: flex;
          gap: 13px;
          align-items: flex-start;
          padding: 18px;
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,.09);
          background: linear-gradient(145deg, rgba(255,95,23,.14), rgba(239,20,132,.1) 48%, rgba(111,35,235,.12));
          box-shadow: 0 18px 48px rgba(0,0,0,.26);
        }
        .ai-creator-v2-icon {
          width: 46px;
          height: 46px;
          flex: 0 0 46px;
          border-radius: 15px;
          display: grid;
          place-items: center;
          color: #fff;
          background: linear-gradient(135deg, #ff5a10, #ef1686 54%, #7c2cff);
          box-shadow: 0 10px 26px rgba(239,22,134,.3);
        }
        .ai-creator-v2-hero small { color: #ff8c52; font-size: 9px; font-weight: 900; letter-spacing: .16em; }
        .ai-creator-v2-hero h2 { margin: 4px 0 3px; font-size: 22px; line-height: 1.08; letter-spacing: -.04em; }
        .ai-creator-v2-hero p { margin: 0; color: rgba(255,255,255,.55); font-size: 12px; line-height: 1.4; }
        .ai-creator-v2-toggle {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 5px;
          padding: 5px;
          border-radius: 17px;
          background: rgba(255,255,255,.055);
          border: 1px solid rgba(255,255,255,.07);
        }
        .ai-creator-v2-toggle button {
          min-height: 43px;
          border: 0;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: rgba(255,255,255,.55);
          background: transparent;
          font-weight: 800;
        }
        .ai-creator-v2-toggle button.active { color: #fff; background: linear-gradient(135deg, #ff5b13, #ed198b 58%, #8b2cf5); box-shadow: 0 8px 20px rgba(237,25,139,.24); }
        .ai-creator-v2-preview { position: relative; min-height: 215px; border-radius: 23px; overflow: hidden; background: #09070d; border: 1px solid rgba(255,255,255,.09); }
        .ai-creator-v2-upload { width: 100%; min-height: 215px; padding: 0; border: 0; color: rgba(255,255,255,.7); background: radial-gradient(circle at 50% 25%, rgba(239,22,134,.12), transparent 42%), #09070d; overflow: hidden; }
        .ai-creator-v2-upload > img, .ai-creator-v2-upload > video { width: 100%; height: 260px; display: block; object-fit: cover; }
        .ai-creator-v2-empty { min-height: 215px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; }
        .ai-creator-v2-empty svg { color: #ff4f42; }
        .ai-creator-v2-empty b { font-size: 14px; }
        .ai-creator-v2-empty small { color: rgba(255,255,255,.35); font-size: 10px; }
        .ai-creator-v2-result { position: absolute; inset: 0; background: #050408; }
        .ai-creator-v2-result img, .ai-creator-v2-result video { width: 100%; height: 100%; object-fit: contain; display: block; }
        .ai-creator-v2-result > span { position: absolute; left: 10px; top: 10px; padding: 6px 9px; border-radius: 999px; background: rgba(0,0,0,.68); color: #fff; font-size: 8px; font-weight: 900; letter-spacing: .12em; }
        .ai-creator-v2-prompt { position: relative; display: grid; gap: 7px; }
        .ai-creator-v2-prompt > span, .ai-creator-v2-options > div > span { color: rgba(255,255,255,.72); font-size: 11px; font-weight: 800; }
        .ai-creator-v2-prompt textarea { width: 100%; min-height: 108px; resize: none; border: 1px solid rgba(255,255,255,.09); border-radius: 18px; padding: 14px 14px 25px; outline: none; color: #fff; background: rgba(255,255,255,.045); font: 500 13px/1.45 inherit; }
        .ai-creator-v2-prompt textarea:focus { border-color: rgba(239,22,134,.55); box-shadow: 0 0 0 3px rgba(239,22,134,.08); }
        .ai-creator-v2-prompt > small { position: absolute; right: 12px; bottom: 9px; color: rgba(255,255,255,.28); font-size: 9px; }
        .ai-creator-v2-chips { display: flex; gap: 7px; overflow-x: auto; scrollbar-width: none; }
        .ai-creator-v2-chips::-webkit-scrollbar { display: none; }
        .ai-creator-v2-chips button { flex: 0 0 auto; padding: 8px 11px; border: 1px solid rgba(255,255,255,.09); border-radius: 999px; color: rgba(255,255,255,.65); background: rgba(255,255,255,.04); font-size: 10px; font-weight: 750; }
        .ai-creator-v2-options { display: grid; grid-template-columns: 1fr; gap: 12px; }
        .ai-creator-v2-options > div { display: grid; gap: 7px; }
        .ai-creator-v2-segmented { display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; gap: 5px; padding: 4px; border-radius: 14px; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07); }
        .ai-creator-v2-segmented button { min-height: 34px; border: 0; border-radius: 10px; color: rgba(255,255,255,.45); background: transparent; text-transform: capitalize; font-size: 10px; font-weight: 800; }
        .ai-creator-v2-segmented button.active { color: #fff; background: rgba(255,255,255,.11); box-shadow: inset 0 0 0 1px rgba(255,255,255,.07); }
        .ai-creator-v2-generate { min-height: 51px; border: 0; border-radius: 17px; display: flex; align-items: center; justify-content: center; gap: 9px; color: #fff; background: linear-gradient(110deg, #ff5c0a, #f11684 55%, #8a28f1); box-shadow: 0 14px 32px rgba(241,22,132,.27); font-weight: 900; font-size: 13px; }
        .ai-creator-v2-generate:disabled { opacity: .42; box-shadow: none; }
        .ai-page.is-light .ai-creator-v2-hero, .ai-page.is-light .ai-creator-v2-preview, .ai-page.is-light .ai-creator-v2-prompt textarea, .ai-page.is-light .ai-creator-v2-toggle, .ai-page.is-light .ai-creator-v2-segmented { border-color: rgba(70,25,80,.1); background-color: #fff; box-shadow: 0 12px 35px rgba(85,30,90,.07); }
        .ai-page.is-light .ai-creator-v2-hero p, .ai-page.is-light .ai-creator-v2-empty small, .ai-page.is-light .ai-creator-v2-prompt > small { color: rgba(50,20,60,.43); }
        .ai-page.is-light .ai-creator-v2-hero h2, .ai-page.is-light .ai-creator-v2-prompt textarea, .ai-page.is-light .ai-creator-v2-prompt > span, .ai-page.is-light .ai-creator-v2-options > div > span { color: #211027; }
        .ai-page.is-light .ai-creator-v2-toggle button, .ai-page.is-light .ai-creator-v2-segmented button, .ai-page.is-light .ai-creator-v2-chips button { color: rgba(40,15,50,.58); }
        .ai-page.is-light .ai-creator-v2-toggle button.active { color: #fff; }
        .ai-page.is-light .ai-creator-v2-segmented button.active { color: #35113b; background: #f8eaf3; }
        .ai-page.is-light .ai-creator-v2-chips button { background: #fff; border-color: rgba(70,25,80,.1); }
        @media (min-width: 600px) {
          .ai-creator-v2-options { grid-template-columns: 1fr 1fr; }
          .ai-creator-v2-preview { min-height: 300px; }
          .ai-creator-v2-upload { min-height: 300px; }
        }
        @media (min-width: 1024px) {
          .ai-page.is-light {
            width: 100% !important;
            max-width: none !important;
            background: #ffffff !important;
            box-shadow: none !important;
          }
          .ai-page.is-light .ai-backdrop {
            left: auto !important;
            width: 100% !important;
            transform: none !important;
            background:
              radial-gradient(circle at 14% 8%, rgba(255, 106, 0, .1), transparent 22%),
              radial-gradient(circle at 82% 12%, rgba(255, 45, 155, .1), transparent 25%),
              linear-gradient(180deg, #ffffff 0%, #fff6fa 72%, #fff0fb 100%) !important;
          }
          .ai-page.is-light .ai-header,
          .ai-page.is-light .ai-ref-tabs,
          .ai-page.is-light .ai-content {
            max-width: 980px !important;
          }
          .ai-page.is-light .ai-hero-compact {
            grid-template-columns: 160px minmax(0, 1fr) !important;
            min-height: 226px !important;
            padding: 39px 48px !important;
          }
          .ai-page.is-light .ai-orb-3d {
            width: 138px !important;
            height: 138px !important;
          }
          .ai-page.is-light .ai-hero-copy h1 {
            font-size: 36px !important;
          }
          .ai-page.is-light .ai-hero-copy p {
            font-size: 21px !important;
          }
        }
        .ai-page.is-light .ai-content {
          padding-bottom: 0 !important;
        }
        .ai-page.is-light .ai-motion-panel {
          height: auto !important;
          min-height: 0 !important;
        }
        .ai-page.is-light .ai-panel-scroll {
          overflow: visible !important;
          padding-bottom: 0 !important;
        }
        .ai-page.is-light .ai-bottom-input {
          position: relative !important;
          z-index: 3 !important;
          left: auto !important;
          right: auto !important;
          bottom: auto !important;
          transform: none !important;
          width: calc(100% - 46px) !important;
          max-width: 384px !important;
          height: 68px !important;
          margin: 24px auto calc(92px + env(safe-area-inset-bottom, 0px)) !important;
          padding: 8px !important;
          border: 0 !important;
          border-radius: 999px !important;
          background:
            radial-gradient(circle at 84% 50%, rgba(143, 64, 255, .23), transparent 34%),
            linear-gradient(135deg, rgba(78, 32, 53, .95), rgba(50, 24, 68, .97)) !important;
          box-shadow: 0 24px 54px rgba(192, 55, 190, .28), inset 0 1px rgba(255,255,255,.1) !important;
          display: flex !important;
        }
        .ai-page.is-light .ai-bottom-input::before {
          content: '';
          width: 34px;
          height: 52px;
          margin-left: 2px;
          border-radius: 999px;
          flex: 0 0 auto;
          background: transparent;
        }
        .ai-page.is-light .ai-bottom-input::after {
          content: '⌕';
          position: absolute;
          left: 24px;
          top: 50%;
          transform: translateY(-51%) rotate(-25deg);
          color: rgba(255,255,255,.42);
          font-size: 30px;
          line-height: 1;
          pointer-events: none;
        }
        .ai-page.is-light .ai-bottom-input input {
          min-width: 0 !important;
          height: 52px !important;
          padding: 0 10px !important;
          color: #ffffff !important;
          background: transparent !important;
          font-size: 16px !important;
          font-weight: 800 !important;
        }
        .ai-page.is-light .ai-bottom-input input::placeholder {
          color: rgba(255,255,255,.52) !important;
        }
        .ai-page.is-light .ai-bottom-input button {
          width: 52px !important;
          height: 52px !important;
          flex: 0 0 52px !important;
          color: #ffffff !important;
          background: linear-gradient(145deg, #ff8740, #ff2d75 57%, #8f35ff) !important;
          box-shadow: 0 12px 24px rgba(255,45,155,.3), inset 0 2px rgba(255,255,255,.24) !important;
        }
        @media (min-width: 1024px) {
          .ai-page.is-light .ai-bottom-input {
            width: min(760px, calc(100vw - 38rem)) !important;
            max-width: 760px !important;
            margin-bottom: 28px !important;
          }
        }
        .ai-page.is-light .ai-light-home {
          display: flex !important;
          flex-direction: column !important;
          gap: 0 !important;
        }
        .ai-page.is-light .ai-light-home .ai-voice-card {
          order: 1 !important;
        }
        .ai-page.is-light .ai-light-home .ai-ref-title-row {
          order: 2 !important;
        }
        .ai-page.is-light .ai-light-home .ai-reference-actions {
          order: 3 !important;
        }
        .ai-page.is-light .ai-light-home .ai-photo-video-card {
          order: 4 !important;
        }
        .ai-page.is-light .ai-voice-card {
          margin-top: 0 !important;
          min-height: 190px !important;
          overflow: hidden !important;
        }
        .ai-page.is-light .ai-voice-card .ai-hero-copy h1 span {
          display: inline-block;
          color: inherit;
          font-size: .82em;
          transform: translateY(-1px);
        }
        .ai-page.is-light .ai-light-home .ai-ref-title-row {
          width: auto !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          margin: 25px 20px 15px !important;
          padding: 0 !important;
        }
        .ai-page.is-light .ai-light-home .ai-ref-title-row span {
          color: #080a13 !important;
          font-size: 19px !important;
          font-weight: 950 !important;
          letter-spacing: 0 !important;
        }
        .ai-page.is-light .ai-light-home .ai-ref-title-row button {
          height: 28px !important;
          padding: 0 !important;
          border: 0 !important;
          color: #ff4b12 !important;
          background: transparent !important;
          box-shadow: none !important;
          font-size: 14px !important;
          font-weight: 900 !important;
        }
        .ai-page.is-light .ai-light-home .ai-reference-actions {
          display: grid !important;
          grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
          padding: 0 14px !important;
          margin: 0 !important;
          gap: 10px !important;
        }
        .ai-page.is-light .ai-light-home .ai-reference-actions button {
          min-height: 126px !important;
          padding: 14px 7px 12px !important;
          border-radius: 18px !important;
          background:
            radial-gradient(circle at 50% 10%, rgba(255,255,255,.96), rgba(255,255,255,.72) 62%, rgba(255,244,250,.64) 100%) !important;
          box-shadow: 0 17px 34px rgba(132, 42, 96, .09), inset 0 1px rgba(255,255,255,.96) !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: space-between !important;
        }
        .ai-page.is-light .ai-light-home .ai-reference-actions button span {
          width: 54px !important;
          height: 54px !important;
          border-radius: 50% !important;
        }
        .ai-page.is-light .ai-light-home .ai-reference-actions b {
          min-height: 34px !important;
          max-width: 82px !important;
          color: #0d1018 !important;
          font-size: 12px !important;
          line-height: 1.18 !important;
          font-weight: 950 !important;
          text-align: center !important;
        }
        .ai-page.is-light .ai-light-home .ai-reference-actions i {
          color: #ff4b12 !important;
          font-size: 25px !important;
          line-height: 1 !important;
        }
        .ai-page.is-light .ai-photo-video-card {
          margin-top: 28px !important;
          margin-bottom: 0 !important;
          min-height: 182px !important;
        }
        .ai-page.is-light .ai-photo-video-card h2 {
          max-width: 190px !important;
          font-size: 22px !important;
        }
        .ai-page.is-light .ai-photo-video-card p {
          max-width: 150px !important;
        }
        .ai-page.is-light .ai-photo-video-card .ai-magic-previews {
          min-width: 162px !important;
        }
        .ai-page.is-light .ai-photo-video-card .ai-magic-previews button {
          overflow: hidden !important;
        }
        .ai-page.is-light .ai-light-home .ai-photo-video-strip {
          order: 4 !important;
          position: relative !important;
          min-height: 186px !important;
          margin: 30px 0 0 !important;
          padding: 25px 20px !important;
          border-radius: 24px !important;
          overflow: hidden !important;
          color: #ffffff !important;
          background:
            radial-gradient(circle at 78% 20%, rgba(255,255,255,.16), transparent 22%),
            radial-gradient(circle at 18% 82%, rgba(255, 126, 48, .24), transparent 28%),
            linear-gradient(132deg, #ff7046 0%, #f33578 40%, #cf34c7 67%, #8b45ff 100%) !important;
          box-shadow: 0 28px 54px rgba(196, 55, 174, .26) !important;
          display: grid !important;
          grid-template-columns: minmax(0, 1fr) 180px !important;
          align-items: center !important;
          gap: 10px !important;
        }
        .ai-page.is-light .ai-light-home .ai-photo-video-strip::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 39% 76%, rgba(255,255,255,.14), transparent 14%),
            linear-gradient(90deg, rgba(255,255,255,.08), transparent 48%);
          pointer-events: none;
        }
        .ai-page.is-light .ai-photo-video-copy {
          position: relative !important;
          z-index: 1 !important;
          min-width: 0 !important;
        }
        .ai-page.is-light .ai-photo-video-copy h2 {
          max-width: 198px !important;
          margin: 0 !important;
          color: #ffffff !important;
          font-size: 23px !important;
          line-height: 1.22 !important;
          font-weight: 950 !important;
          letter-spacing: 0 !important;
        }
        .ai-page.is-light .ai-photo-video-copy h2 strong {
          color: #ffd343 !important;
        }
        .ai-page.is-light .ai-photo-video-copy p {
          max-width: 142px !important;
          margin: 15px 0 21px !important;
          color: rgba(255,255,255,.88) !important;
          font-size: 15px !important;
          line-height: 1.45 !important;
          font-weight: 750 !important;
        }
        .ai-page.is-light .ai-photo-video-copy button {
          height: 47px !important;
          min-width: 104px !important;
          border: 0 !important;
          border-radius: 999px !important;
          color: #ff4b12 !important;
          background: rgba(255,255,255,.92) !important;
          box-shadow: 0 12px 24px rgba(100, 20, 72, .14), inset 0 1px rgba(255,255,255,.98) !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 7px !important;
          font-size: 14px !important;
          font-weight: 950 !important;
        }
        .ai-page.is-light .ai-photo-video-gallery {
          position: relative !important;
          z-index: 1 !important;
          height: 134px !important;
          min-width: 0 !important;
        }
        .ai-page.is-light .ai-photo-video-gallery button {
          position: absolute !important;
          top: 7px !important;
          width: 88px !important;
          height: 122px !important;
          padding: 0 !important;
          border: 2px solid rgba(255,255,255,.48) !important;
          border-radius: 16px !important;
          overflow: hidden !important;
          background: #210824 !important;
          box-shadow: 0 18px 30px rgba(65, 12, 79, .28) !important;
        }
        .ai-page.is-light .ai-photo-video-gallery .ai-photo-tile {
          left: 6px !important;
          transform: rotate(-5deg) !important;
          z-index: 2 !important;
        }
        .ai-page.is-light .ai-photo-video-gallery .ai-video-tile {
          right: 0 !important;
          transform: rotate(5deg) !important;
          z-index: 1 !important;
        }
        .ai-page.is-light .ai-photo-video-gallery img {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          display: block !important;
          filter: saturate(1.16) contrast(1.05) !important;
        }
        .ai-page.is-light .ai-photo-video-gallery button::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 35%, rgba(18, 5, 24, .78) 100%) !important;
          pointer-events: none;
        }
        .ai-page.is-light .ai-photo-video-gallery b {
          position: absolute !important;
          left: 10px !important;
          bottom: 13px !important;
          z-index: 2 !important;
          color: #ffffff !important;
          font-size: 13px !important;
          font-weight: 950 !important;
          line-height: 1 !important;
          text-shadow: 0 2px 8px rgba(0,0,0,.45) !important;
        }
        .ai-page.is-light .ai-photo-video-gallery svg {
          position: absolute !important;
          right: 8px !important;
          bottom: 10px !important;
          z-index: 2 !important;
          color: #ffffff !important;
          filter: drop-shadow(0 2px 6px rgba(0,0,0,.45)) !important;
        }
        .ai-page.is-light .ai-play-dot {
          position: absolute !important;
          right: 8px !important;
          top: 9px !important;
          z-index: 3 !important;
          width: 28px !important;
          height: 28px !important;
          border-radius: 50% !important;
          display: grid !important;
          place-items: center !important;
          color: #ffffff !important;
          background: rgba(20, 10, 40, .76) !important;
          font-size: 12px !important;
          line-height: 1 !important;
        }
        @media (max-width: 390px) {
          .ai-page.is-light .ai-light-home .ai-photo-video-strip {
            grid-template-columns: minmax(0, 1fr) 146px !important;
            padding: 22px 17px !important;
          }
          .ai-page.is-light .ai-photo-video-gallery button {
            width: 74px !important;
            height: 110px !important;
          }
          .ai-page.is-light .ai-photo-video-copy h2 {
            font-size: 20px !important;
          }
        }
        @media (max-width: 390px) {
          .ai-page.is-light .ai-light-home .ai-ref-title-row {
            margin-left: 10px !important;
            margin-right: 10px !important;
          }
          .ai-page.is-light .ai-light-home .ai-reference-actions {
            padding: 0 4px !important;
            gap: 7px !important;
          }
          .ai-page.is-light .ai-light-home .ai-reference-actions b {
            font-size: 10px !important;
          }
        }
        /* The current AI Studio layout is shared by both themes. Dark mode keeps
           the exact light-mode structure and only changes its surface palette. */
        .ai-page.is-dark .ai-ref-tabs {
          background: rgba(20, 8, 29, .88) !important;
          border: 1px solid rgba(255,255,255,.08) !important;
          box-shadow: 0 18px 40px rgba(0,0,0,.32), inset 0 1px rgba(255,255,255,.06) !important;
        }
        .ai-page.is-dark .ai-ref-tabs button {
          color: rgba(255,255,255,.72) !important;
        }
        .ai-page.is-dark .ai-ref-tabs button.active {
          color: #ffffff !important;
          background: linear-gradient(145deg, rgba(255,94,35,.28), rgba(255,45,117,.24) 58%, rgba(143,53,255,.26)) !important;
          box-shadow: 0 10px 24px rgba(0,0,0,.28), inset 0 1px rgba(255,255,255,.1) !important;
        }
        .ai-page.is-dark .ai-menu-button {
          color: #ffffff !important;
          background: rgba(255,255,255,.08) !important;
          border: 1px solid rgba(255,255,255,.1) !important;
          box-shadow: 0 14px 30px rgba(0,0,0,.3), inset 0 1px rgba(255,255,255,.08) !important;
        }
        .ai-page.is-dark .ai-brand-word small {
          color: rgba(255,255,255,.62) !important;
        }
        .ai-page.is-dark .ai-light-home {
          display: flex !important;
          flex-direction: column !important;
          gap: 0 !important;
        }
        .ai-page.is-dark .ai-light-home .ai-voice-card { order: 1 !important; }
        .ai-page.is-dark .ai-light-home .ai-ref-title-row { order: 2 !important; }
        .ai-page.is-dark .ai-light-home .ai-reference-actions { order: 3 !important; }
        .ai-page.is-dark .ai-light-home .ai-photo-video-strip { order: 4 !important; }
        .ai-page.is-dark .ai-voice-card {
          min-height: 190px !important;
          margin-top: 0 !important;
          overflow: hidden !important;
        }
        .ai-page.is-dark .ai-voice-card .ai-hero-copy h1 span {
          display: inline-block;
          color: inherit;
          font-size: .82em;
          transform: translateY(-1px);
        }
        .ai-page.is-dark .ai-light-home .ai-ref-title-row {
          width: auto !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          margin: 25px 20px 15px !important;
          padding: 0 !important;
        }
        .ai-page.is-dark .ai-light-home .ai-ref-title-row span {
          color: #ffffff !important;
          font-size: 19px !important;
          font-weight: 950 !important;
          letter-spacing: 0 !important;
        }
        .ai-page.is-dark .ai-light-home .ai-ref-title-row button {
          height: 28px !important;
          padding: 0 !important;
          border: 0 !important;
          color: #ff6332 !important;
          background: transparent !important;
          box-shadow: none !important;
          font-size: 14px !important;
          font-weight: 900 !important;
        }
        .ai-page.is-dark .ai-light-home .ai-reference-actions {
          display: grid !important;
          grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
          padding: 0 14px !important;
          margin: 0 !important;
          gap: 10px !important;
        }
        .ai-page.is-dark .ai-light-home .ai-reference-actions button {
          min-height: 126px !important;
          padding: 14px 7px 12px !important;
          border: 1px solid rgba(255,255,255,.1) !important;
          border-radius: 18px !important;
          color: #ffffff !important;
          background:
            radial-gradient(circle at 50% 0%, rgba(255,71,130,.12), transparent 56%),
            linear-gradient(145deg, rgba(31,12,40,.96), rgba(13,5,22,.94)) !important;
          box-shadow: 0 17px 34px rgba(0,0,0,.3), inset 0 1px rgba(255,255,255,.08) !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: space-between !important;
        }
        .ai-page.is-dark .ai-light-home .ai-reference-actions button span {
          width: 54px !important;
          height: 54px !important;
          border-radius: 50% !important;
        }
        .ai-page.is-dark .ai-light-home .ai-reference-actions b {
          min-height: 34px !important;
          max-width: 82px !important;
          color: #ffffff !important;
          font-size: 12px !important;
          line-height: 1.18 !important;
          font-weight: 950 !important;
          text-align: center !important;
        }
        .ai-page.is-dark .ai-light-home .ai-reference-actions i {
          color: #ff6332 !important;
          font-size: 25px !important;
          line-height: 1 !important;
          background: transparent !important;
          box-shadow: none !important;
        }
        .ai-page.is-dark .ai-light-home .ai-photo-video-strip {
          position: relative !important;
          min-height: 186px !important;
          margin: 30px 0 0 !important;
          padding: 25px 20px !important;
          border-radius: 24px !important;
          overflow: hidden !important;
          color: #ffffff !important;
          background:
            radial-gradient(circle at 78% 20%, rgba(255,255,255,.16), transparent 22%),
            radial-gradient(circle at 18% 82%, rgba(255,126,48,.24), transparent 28%),
            linear-gradient(132deg, #ff7046 0%, #f33578 40%, #cf34c7 67%, #8b45ff 100%) !important;
          box-shadow: 0 28px 54px rgba(100,18,107,.34) !important;
          display: grid !important;
          grid-template-columns: minmax(0, 1fr) 180px !important;
          align-items: center !important;
          gap: 10px !important;
        }
        .ai-page.is-dark .ai-light-home .ai-photo-video-strip::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 39% 76%, rgba(255,255,255,.14), transparent 14%), linear-gradient(90deg, rgba(255,255,255,.08), transparent 48%);
          pointer-events: none;
        }
        .ai-page.is-dark .ai-photo-video-copy {
          position: relative !important;
          z-index: 1 !important;
          min-width: 0 !important;
        }
        .ai-page.is-dark .ai-photo-video-copy h2 {
          max-width: 198px !important;
          margin: 0 !important;
          color: #ffffff !important;
          font-size: 23px !important;
          line-height: 1.22 !important;
          font-weight: 950 !important;
        }
        .ai-page.is-dark .ai-photo-video-copy h2 strong { color: #ffd343 !important; }
        .ai-page.is-dark .ai-photo-video-copy p {
          max-width: 142px !important;
          margin: 15px 0 21px !important;
          color: rgba(255,255,255,.88) !important;
          font-size: 15px !important;
          line-height: 1.45 !important;
          font-weight: 750 !important;
        }
        .ai-page.is-dark .ai-photo-video-copy button {
          height: 47px !important;
          min-width: 104px !important;
          border: 0 !important;
          border-radius: 999px !important;
          color: #ff4b12 !important;
          background: rgba(255,255,255,.94) !important;
          box-shadow: 0 12px 24px rgba(100,20,72,.2) !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 7px !important;
          font-size: 14px !important;
          font-weight: 950 !important;
        }
        .ai-page.is-dark .ai-photo-video-gallery {
          position: relative !important;
          z-index: 1 !important;
          height: 134px !important;
          min-width: 0 !important;
        }
        .ai-page.is-dark .ai-photo-video-gallery button {
          position: absolute !important;
          top: 7px !important;
          width: 88px !important;
          height: 122px !important;
          padding: 0 !important;
          border: 2px solid rgba(255,255,255,.48) !important;
          border-radius: 16px !important;
          overflow: hidden !important;
          background: #210824 !important;
          box-shadow: 0 18px 30px rgba(30,4,40,.42) !important;
        }
        .ai-page.is-dark .ai-photo-video-gallery .ai-photo-tile { left: 6px !important; transform: rotate(-5deg) !important; z-index: 2 !important; }
        .ai-page.is-dark .ai-photo-video-gallery .ai-video-tile { right: 0 !important; transform: rotate(5deg) !important; z-index: 1 !important; }
        .ai-page.is-dark .ai-photo-video-gallery img {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          display: block !important;
          filter: saturate(1.16) contrast(1.05) !important;
        }
        .ai-page.is-dark .ai-photo-video-gallery button::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 35%, rgba(18,5,24,.78) 100%) !important;
          pointer-events: none;
        }
        .ai-page.is-dark .ai-photo-video-gallery b {
          position: absolute !important;
          left: 10px !important;
          bottom: 13px !important;
          z-index: 2 !important;
          color: #ffffff !important;
          font-size: 13px !important;
          font-weight: 950 !important;
        }
        .ai-page.is-dark .ai-photo-video-gallery svg {
          position: absolute !important;
          right: 8px !important;
          bottom: 10px !important;
          z-index: 2 !important;
          color: #ffffff !important;
        }
        .ai-page.is-dark .ai-play-dot {
          position: absolute !important;
          right: 8px !important;
          top: 9px !important;
          z-index: 3 !important;
          width: 28px !important;
          height: 28px !important;
          border-radius: 50% !important;
          display: grid !important;
          place-items: center !important;
          color: #ffffff !important;
          background: rgba(20,10,40,.76) !important;
          font-size: 12px !important;
        }
        @media (max-width: 390px) {
          .ai-page.is-dark .ai-light-home .ai-photo-video-strip {
            grid-template-columns: minmax(0, 1fr) 146px !important;
            padding: 22px 17px !important;
          }
          .ai-page.is-dark .ai-photo-video-gallery button { width: 74px !important; height: 110px !important; }
          .ai-page.is-dark .ai-photo-video-copy h2 { font-size: 20px !important; }
          .ai-page.is-dark .ai-light-home .ai-ref-title-row { margin-left: 10px !important; margin-right: 10px !important; }
          .ai-page.is-dark .ai-light-home .ai-reference-actions { padding: 0 4px !important; gap: 7px !important; }
          .ai-page.is-dark .ai-light-home .ai-reference-actions b { font-size: 10px !important; }
        }
        .ai-page.is-light .ai-light-home .ai-reference-actions button,
        .ai-page.is-dark .ai-light-home .ai-reference-actions button {
          min-height: 94px !important;
          padding: 10px 6px 8px !important;
          border-radius: 16px !important;
        }
        .ai-page.is-light .ai-light-home .ai-reference-actions button span,
        .ai-page.is-dark .ai-light-home .ai-reference-actions button span {
          width: 42px !important;
          height: 42px !important;
        }
        .ai-page.is-light .ai-light-home .ai-reference-actions b,
        .ai-page.is-dark .ai-light-home .ai-reference-actions b {
          min-height: 25px !important;
          font-size: 10.5px !important;
          line-height: 1.15 !important;
        }
        .ai-page.is-light .ai-light-home .ai-reference-actions i,
        .ai-page.is-dark .ai-light-home .ai-reference-actions i {
          font-size: 18px !important;
        }
        .ai-page {
          --ai-theme-accent: var(--spicey-page-accent, #ff6a00);
          --ai-theme-accent-2: var(--spicey-page-accent-2, #ff2d8f);
          --ai-theme-gradient: var(--spicey-theme-gradient, linear-gradient(135deg, #ff6a00, #ff2d8f 55%, #8b2cff));
          --ai-theme-soft: var(--spicey-theme-soft, linear-gradient(145deg, rgba(255,106,0,.16), rgba(255,45,143,.12), rgba(139,44,255,.14)));
          --ai-theme-shadow: var(--spicey-theme-shadow, rgba(255,45,143,.24));
        }
        .ai-page .ai-backdrop {
          background:
            radial-gradient(circle at 10% 4%, color-mix(in srgb, var(--ai-theme-accent) 24%, transparent), transparent 22%),
            radial-gradient(circle at 88% 10%, color-mix(in srgb, var(--ai-theme-accent-2) 22%, transparent), transparent 26%),
            radial-gradient(circle at 78% 88%, color-mix(in srgb, var(--ai-theme-accent) 20%, var(--ai-theme-accent-2)), transparent 30%),
            linear-gradient(180deg, #020103 0%, #07010b 54%, #020103 100%) !important;
        }
        .ai-page.is-light .ai-backdrop {
          background:
            radial-gradient(circle at 8% 4%, color-mix(in srgb, var(--ai-theme-accent) 18%, transparent), transparent 22%),
            radial-gradient(circle at 88% 8%, color-mix(in srgb, var(--ai-theme-accent-2) 16%, transparent), transparent 25%),
            radial-gradient(circle at 75% 92%, color-mix(in srgb, var(--ai-theme-accent) 12%, var(--ai-theme-accent-2)), transparent 30%),
            var(--spicey-page-bg, linear-gradient(180deg, #fff9fd 0%, #fff2f7 48%, #f9efff 100%)) !important;
        }
        .ai-page .ai-brand-bolt,
        .ai-page .ai-pro-pill,
        .ai-page .ai-ref-tabs button.active,
        .ai-page .ai-hero-copy button,
        .ai-page .ai-reference-actions i,
        .ai-page .ai-bottom-input button,
        .ai-page .ai-photo-video-copy button,
        .ai-page .ai-single-prompt button,
        .ai-page .ai-primary-action {
          background: var(--ai-theme-gradient) !important;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.30), 0 12px 28px var(--ai-theme-shadow) !important;
        }
        .ai-page .ai-ref-tabs,
        .ai-page .ai-hero-compact,
        .ai-page .ai-single-create,
        .ai-page .ai-reference-actions button,
        .ai-page .ai-photo-video-strip,
        .ai-page .ai-bottom-input,
        .ai-page .ai-media-studio {
          border-color: color-mix(in srgb, var(--ai-theme-accent) 28%, rgba(255,255,255,.12)) !important;
        }
        .ai-page .ai-reference-actions button span,
        .ai-page .ai-orb-3d {
          background: var(--ai-theme-gradient) !important;
          box-shadow: inset 0 2px 0 rgba(255,255,255,.24), 0 12px 24px var(--ai-theme-shadow) !important;
        }
        .ai-page .ai-hero-compact,
        .ai-page .ai-single-create,
        .ai-page .ai-reference-actions button,
        .ai-page .ai-bottom-input {
          background: var(--ai-theme-soft) !important;
        }
        .ai-page.is-light .ai-hero-compact,
        .ai-page.is-light .ai-single-create,
        .ai-page.is-light .ai-reference-actions button,
        .ai-page.is-light .ai-bottom-input {
          background: var(--ai-theme-soft) !important;
          box-shadow: 0 14px 32px color-mix(in srgb, var(--ai-theme-accent) 14%, transparent) !important;
        }
        .ai-page .ai-brand-word strong,
        .ai-page .ai-ref-title-row button,
        .ai-page .ai-magic-banner h2 strong,
        .ai-page .ai-photo-video-copy h2 strong {
          color: var(--ai-theme-accent) !important;
        }
        .ai-page {
          width: min(100vw, 390px) !important;
          max-width: 390px !important;
          margin: 0 auto !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          padding: 0 0 calc(18px + env(safe-area-inset-bottom, 0px)) !important;
          background: #030105 !important;
        }
        .ai-page.is-light {
          background: #ffffff !important;
        }
        .ai-ref-tabs,
        .ai-bottom-input {
          display: none !important;
        }
        .ai-content {
          position: relative !important;
          z-index: 2 !important;
          padding: 0 14px 14px !important;
          width: 100% !important;
          max-width: 390px !important;
          margin: 0 auto !important;
        }
        .ai-motion-panel {
          width: 100% !important;
        }
        .ai-ref-header {
          position: sticky !important;
          top: 0 !important;
          z-index: 20 !important;
          width: 100% !important;
          display: grid !important;
          grid-template-columns: 54px 1fr 86px !important;
          align-items: center !important;
          gap: 8px !important;
          padding: max(14px, calc(env(safe-area-inset-top, 0px) + 8px)) 16px 12px !important;
          background: linear-gradient(180deg, rgba(3,1,5,.96), rgba(3,1,5,.82) 72%, rgba(3,1,5,0)) !important;
          border: 0 !important;
          box-shadow: none !important;
          backdrop-filter: blur(18px) !important;
          -webkit-backdrop-filter: blur(18px) !important;
        }
        .ai-page.is-light .ai-ref-header {
          background: linear-gradient(180deg, rgba(255,255,255,.96), rgba(255,255,255,.84) 72%, rgba(255,255,255,0)) !important;
        }
        .ai-ref-header-logo,
        .ai-ref-header-word,
        .ai-ref-bell,
        .ai-ref-avatar {
          border: 0 !important;
          background: transparent !important;
          padding: 0 !important;
        }
        .ai-ref-header-logo {
          width: 46px !important;
          height: 46px !important;
          display: grid !important;
          place-items: center !important;
        }
        .ai-ref-header-logo img {
          width: 42px !important;
          height: 42px !important;
          object-fit: contain !important;
          filter: drop-shadow(0 0 12px rgba(255,45,143,.42)) !important;
        }
        .ai-ref-header-word {
          justify-self: center !important;
          font-family: "Snell Roundhand", "Brush Script MT", "Segoe Script", cursive !important;
          font-size: 39px !important;
          line-height: .9 !important;
          font-weight: 700 !important;
          letter-spacing: 0 !important;
          background: linear-gradient(105deg, #ff6a18 0%, #ff2e93 54%, #9a35ff 100%) !important;
          -webkit-background-clip: text !important;
          background-clip: text !important;
          color: transparent !important;
          -webkit-text-fill-color: transparent !important;
          filter: drop-shadow(0 0 12px rgba(255,45,143,.24)) !important;
        }
        .ai-ref-header-actions {
          justify-self: end !important;
          display: flex !important;
          align-items: center !important;
          gap: 9px !important;
        }
        .ai-ref-bell {
          position: relative !important;
          width: 32px !important;
          height: 38px !important;
          color: var(--ai-ref-muted, rgba(255,255,255,.72)) !important;
          display: grid !important;
          place-items: center !important;
        }
        .ai-page.is-light .ai-ref-bell {
          color: #73717a !important;
        }
        .ai-ref-bell span {
          position: absolute !important;
          top: 5px !important;
          right: 4px !important;
          width: 8px !important;
          height: 8px !important;
          border-radius: 50% !important;
          background: #ff1574 !important;
        }
        .ai-ref-avatar {
          position: relative !important;
          width: 42px !important;
          height: 42px !important;
          border-radius: 50% !important;
          padding: 2px !important;
          background: conic-gradient(from 30deg, #ff7a18, #ff2e93, #8b35ff, #ff7a18) !important;
          box-shadow: 0 0 14px rgba(255,45,143,.28) !important;
        }
        .ai-ref-avatar img {
          width: 100% !important;
          height: 100% !important;
          border-radius: 50% !important;
          object-fit: cover !important;
          display: block !important;
        }
        .ai-ref-avatar video {
          width: 100% !important;
          height: 100% !important;
          border-radius: 50% !important;
          object-fit: cover !important;
          display: block !important;
        }
        .ai-ref-avatar span {
          position: absolute !important;
          right: 0 !important;
          bottom: 1px !important;
          width: 10px !important;
          height: 10px !important;
          border-radius: 50% !important;
          background: #15d86b !important;
          border: 2px solid currentColor !important;
          color: #030105 !important;
        }
        .ai-page.is-light .ai-ref-avatar span {
          color: #ffffff !important;
        }
        .ai-ref-studio {
          display: flex !important;
          flex-direction: column !important;
          gap: 14px !important;
          padding-bottom: 10px !important;
        }
        .ai-ref-hero {
          position: relative !important;
          min-height: 214px !important;
          border-radius: 28px !important;
          overflow: hidden !important;
          padding: 24px 20px !important;
          border: 1px solid rgba(255,255,255,.10) !important;
          background:
            radial-gradient(circle at 80% 45%, rgba(255,45,143,.32), transparent 33%),
            radial-gradient(circle at 92% 18%, rgba(255,106,24,.22), transparent 28%),
            linear-gradient(145deg, rgba(14,8,25,.96), rgba(7,4,14,.98)) !important;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 18px 44px rgba(0,0,0,.36) !important;
        }
        .ai-page.is-light .ai-ref-hero {
          border-color: rgba(25,16,36,.06) !important;
          background:
            radial-gradient(circle at 80% 43%, rgba(255,45,143,.10), transparent 35%),
            radial-gradient(circle at 96% 78%, rgba(255,106,24,.12), transparent 30%),
            linear-gradient(145deg, #ffffff, #fffafe) !important;
          box-shadow: 0 18px 40px rgba(50,32,70,.08), inset 0 1px 0 #fff !important;
        }
        .ai-ref-hero-copy {
          position: relative !important;
          z-index: 3 !important;
          width: 48% !important;
          min-width: 158px !important;
        }
        .ai-ref-hero-copy > span {
          display: block !important;
          margin-bottom: 8px !important;
          color: rgba(255,255,255,.70) !important;
          font-size: 14px !important;
          font-weight: 600 !important;
        }
        .ai-page.is-light .ai-ref-hero-copy > span {
          color: rgba(18,14,24,.52) !important;
        }
        .ai-ref-hero h1 {
          margin: 0 !important;
          font-size: 42px !important;
          line-height: .95 !important;
          font-weight: 920 !important;
          letter-spacing: 0 !important;
          color: #fff !important;
        }
        .ai-ref-hero h1 br + * {
          background: linear-gradient(120deg, #ff1471, #ff8330) !important;
        }
        .ai-ref-hero h1 {
          background: linear-gradient(120deg, #ffffff 0%, #ffffff 46%, #ff1471 48%, #ff8330 100%) !important;
          -webkit-background-clip: text !important;
          background-clip: text !important;
          color: transparent !important;
          -webkit-text-fill-color: transparent !important;
        }
        .ai-page.is-light .ai-ref-hero h1 {
          background: linear-gradient(120deg, #ff0870 0%, #ff2e93 48%, #ff8a24 100%) !important;
          -webkit-background-clip: text !important;
          background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
        }
        .ai-ref-hero p {
          margin: 14px 0 18px !important;
          color: rgba(255,255,255,.70) !important;
          font-size: 14px !important;
          line-height: 1.55 !important;
          font-weight: 500 !important;
        }
        .ai-page.is-light .ai-ref-hero p {
          color: rgba(18,14,24,.62) !important;
        }
        .ai-ref-hero button {
          height: 38px !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 8px !important;
          padding: 0 15px !important;
          border-radius: 999px !important;
          border: 1px solid rgba(255,255,255,.20) !important;
          color: #fff !important;
          background: linear-gradient(135deg, #8d24ff, #ff1471 55%, #ff7a18) !important;
          box-shadow: 0 12px 24px rgba(255,45,143,.25), inset 0 1px rgba(255,255,255,.22) !important;
          font-size: 13px !important;
        }
        .ai-ref-hero-person {
          position: absolute !important;
          right: -16px !important;
          bottom: -8px !important;
          z-index: 2 !important;
          width: 58% !important;
          height: 104% !important;
          object-fit: cover !important;
          object-position: center !important;
          border-radius: 0 !important;
          mask-image: linear-gradient(90deg, transparent 0%, black 18%, black 100%) !important;
          -webkit-mask-image: linear-gradient(90deg, transparent 0%, black 18%, black 100%) !important;
        }
        .ai-page.is-light .ai-ref-hero-person {
          opacity: .70 !important;
          mix-blend-mode: multiply !important;
        }
        .ai-ref-hero-ring {
          position: absolute !important;
          right: 14px !important;
          top: 18px !important;
          z-index: 1 !important;
          width: 178px !important;
          height: 178px !important;
          border-radius: 50% !important;
          border: 2px solid rgba(255,45,190,.58) !important;
          box-shadow: 0 0 28px rgba(255,45,190,.30), inset 0 0 28px rgba(255,106,24,.18) !important;
        }
        .ai-ref-feature-grid {
          display: grid !important;
          grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          gap: 8px !important;
        }
        .ai-ref-feature {
          position: relative !important;
          min-height: 196px !important;
          overflow: hidden !important;
          text-align: left !important;
          padding: 16px 11px 12px !important;
          border-radius: 18px !important;
          border: 1px solid rgba(255,255,255,.10) !important;
          color: #fff !important;
          background: rgba(11,5,19,.92) !important;
          box-shadow: inset 0 1px rgba(255,255,255,.08) !important;
        }
        .ai-page.is-light .ai-ref-feature {
          color: #15111d !important;
          border-color: rgba(35,18,46,.07) !important;
          background: #ffffff !important;
          box-shadow: 0 12px 28px rgba(45,26,70,.08), inset 0 1px #fff !important;
        }
        .ai-ref-feature > img {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          opacity: .38 !important;
        }
        .ai-page.is-light .ai-ref-feature > img {
          opacity: .22 !important;
        }
        .ai-ref-feature::after {
          content: "" !important;
          position: absolute !important;
          inset: 0 !important;
          background: linear-gradient(180deg, rgba(4,2,9,.22), rgba(4,2,9,.88)) !important;
          pointer-events: none !important;
        }
        .ai-page.is-light .ai-ref-feature::after {
          background: linear-gradient(180deg, rgba(255,255,255,.30), rgba(255,255,255,.86)) !important;
        }
        .ai-ref-feature > *:not(img) {
          position: relative !important;
          z-index: 2 !important;
        }
        .ai-ref-feature-icon {
          width: 42px !important;
          height: 42px !important;
          display: grid !important;
          place-items: center !important;
          border-radius: 13px !important;
          color: #fff !important;
          background: linear-gradient(135deg, #7d2dff, #9e2fff) !important;
          box-shadow: inset 0 1px rgba(255,255,255,.22) !important;
        }
        .ai-ref-feature.photo .ai-ref-feature-icon { background: linear-gradient(135deg, #ff7a18, #ff4a00) !important; }
        .ai-ref-feature.video .ai-ref-feature-icon { background: linear-gradient(135deg, #ff1471, #d81273) !important; }
        .ai-ref-badge {
          position: absolute !important;
          top: 12px !important;
          right: 10px !important;
          z-index: 3 !important;
          padding: 4px 9px !important;
          border-radius: 999px !important;
          color: #fff !important;
          background: rgba(139,45,255,.72) !important;
          font-size: 11px !important;
          font-weight: 800 !important;
        }
        .ai-ref-feature.photo .ai-ref-badge { background: rgba(255,106,24,.76) !important; }
        .ai-ref-feature.video .ai-ref-badge { background: rgba(255,20,113,.76) !important; }
        .ai-ref-feature b {
          display: block !important;
          margin-top: 36px !important;
          color: inherit !important;
          font-size: 16px !important;
          line-height: 1 !important;
          font-weight: 900 !important;
        }
        .ai-ref-feature p {
          margin: 14px 0 18px !important;
          color: rgba(255,255,255,.68) !important;
          font-size: 12px !important;
          line-height: 1.55 !important;
          font-weight: 500 !important;
        }
        .ai-page.is-light .ai-ref-feature p {
          color: rgba(18,14,24,.62) !important;
        }
        .ai-ref-feature i {
          height: 34px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          padding: 0 11px !important;
          border-radius: 10px !important;
          color: #fff !important;
          background: linear-gradient(135deg, #7d2dff, #c02eff) !important;
          font-style: normal !important;
          font-size: 12px !important;
          font-weight: 800 !important;
        }
        .ai-ref-feature.photo i { background: linear-gradient(135deg, #ff6a00, #ff9b45) !important; }
        .ai-ref-feature.video i { background: linear-gradient(135deg, #ff1471, #ff4e93) !important; }
        .ai-ref-section-head {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          margin: 4px 5px -2px !important;
        }
        .ai-ref-section-head h2 {
          margin: 0 !important;
          color: inherit !important;
          font-size: 18px !important;
          font-weight: 900 !important;
        }
        .ai-ref-section-head button {
          display: inline-flex !important;
          align-items: center !important;
          gap: 3px !important;
          border: 0 !important;
          background: transparent !important;
          color: #ff1471 !important;
          font-size: 13px !important;
          font-weight: 800 !important;
        }
        .ai-ref-creations {
          display: grid !important;
          grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
          gap: 8px !important;
        }
        .ai-ref-creations button {
          position: relative !important;
          overflow: hidden !important;
          aspect-ratio: 1 / 1 !important;
          border-radius: 13px !important;
          border: 1px solid rgba(255,255,255,.12) !important;
          background: #08040e !important;
          box-shadow: 0 10px 20px rgba(0,0,0,.18) !important;
        }
        .ai-ref-creations img {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          display: block !important;
        }
        .ai-ref-creations span,
        .ai-ref-creations i {
          position: absolute !important;
          width: 30px !important;
          height: 30px !important;
          display: grid !important;
          place-items: center !important;
          border-radius: 50% !important;
          color: #fff !important;
          background: rgba(0,0,0,.44) !important;
          border: 1px solid rgba(255,255,255,.50) !important;
          font-style: normal !important;
        }
        .ai-ref-creations span { right: 7px !important; bottom: 7px !important; }
        .ai-ref-creations i { left: 50% !important; top: 50% !important; transform: translate(-50%, -50%) !important; }
        .ai-ref-premium {
          display: grid !important;
          grid-template-columns: 56px minmax(0, 1fr) auto !important;
          align-items: center !important;
          gap: 12px !important;
          min-height: 78px !important;
          padding: 13px 15px !important;
          border-radius: 20px !important;
          border: 1px solid rgba(255,255,255,.10) !important;
          background: rgba(12,6,20,.86) !important;
          box-shadow: inset 0 1px rgba(255,255,255,.08), 0 16px 32px rgba(0,0,0,.24) !important;
        }
        .ai-page.is-light .ai-ref-premium {
          border-color: rgba(30,18,44,.06) !important;
          background: #ffffff !important;
          box-shadow: 0 16px 34px rgba(45,26,70,.08), inset 0 1px #fff !important;
        }
        .ai-ref-premium > span {
          width: 50px !important;
          height: 50px !important;
          display: grid !important;
          place-items: center !important;
          border-radius: 50% !important;
          color: #ff9b19 !important;
          border: 1px solid rgba(255,45,143,.45) !important;
          background: radial-gradient(circle, rgba(255,106,24,.22), transparent 66%) !important;
          box-shadow: 0 0 18px rgba(255,45,143,.18) !important;
        }
        .ai-ref-premium h3 {
          margin: 0 0 3px !important;
          color: inherit !important;
          font-size: 16px !important;
          font-weight: 900 !important;
        }
        .ai-ref-premium p {
          margin: 0 !important;
          color: rgba(255,255,255,.62) !important;
          font-size: 12px !important;
          line-height: 1.32 !important;
        }
        .ai-page.is-light .ai-ref-premium p {
          color: rgba(18,14,24,.58) !important;
        }
        .ai-ref-premium button {
          height: 42px !important;
          min-width: 118px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 4px !important;
          border: 0 !important;
          border-radius: 12px !important;
          color: #fff !important;
          background: linear-gradient(135deg, #ff1471, #ff7a18) !important;
          box-shadow: 0 12px 22px rgba(255,45,143,.22) !important;
          font-size: 13px !important;
          font-weight: 900 !important;
          white-space: nowrap !important;
        }
        .ai-ref-bottom-nav {
          position: sticky !important;
          bottom: max(8px, env(safe-area-inset-bottom, 0px)) !important;
          z-index: 10 !important;
          height: 76px !important;
          display: grid !important;
          grid-template-columns: 1fr 1fr 72px 1fr 1fr !important;
          align-items: center !important;
          gap: 2px !important;
          margin-top: 6px !important;
          padding: 8px 10px !important;
          border-radius: 27px !important;
          border: 1px solid rgba(255,255,255,.10) !important;
          background: rgba(10,6,18,.88) !important;
          box-shadow: 0 -10px 30px rgba(0,0,0,.25), inset 0 1px rgba(255,255,255,.08) !important;
          backdrop-filter: blur(22px) !important;
          -webkit-backdrop-filter: blur(22px) !important;
        }
        .ai-page.is-light .ai-ref-bottom-nav {
          border-color: rgba(28,18,43,.06) !important;
          background: rgba(255,255,255,.92) !important;
          box-shadow: 0 -12px 32px rgba(44,26,70,.10), inset 0 1px #fff !important;
        }
        .ai-ref-bottom-nav button {
          border: 0 !important;
          background: transparent !important;
          color: rgba(255,255,255,.58) !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 4px !important;
          font-size: 11px !important;
          font-weight: 600 !important;
        }
        .ai-page.is-light .ai-ref-bottom-nav button {
          color: #797783 !important;
        }
        .ai-ref-bottom-nav button.active,
        .ai-page.is-light .ai-ref-bottom-nav button.active {
          color: #ff1471 !important;
        }
        .ai-ref-plus {
          align-self: center !important;
        }
        .ai-ref-plus span {
          width: 62px !important;
          height: 62px !important;
          display: grid !important;
          place-items: center !important;
          border-radius: 50% !important;
          color: #fff !important;
          background: linear-gradient(135deg, #ff7a18, #ff1471 58%, #8b35ff) !important;
          box-shadow: 0 0 24px rgba(255,45,143,.38), inset 0 1px rgba(255,255,255,.26) !important;
          font-size: 42px !important;
          line-height: .8 !important;
          font-weight: 300 !important;
        }
        .ai-ref-plus svg {
          display: none !important;
        }
        @media (max-width: 370px) {
          .ai-content { padding-left: 10px !important; padding-right: 10px !important; }
          .ai-ref-header { padding-left: 12px !important; padding-right: 12px !important; grid-template-columns: 48px 1fr 80px !important; }
          .ai-ref-header-word { font-size: 34px !important; }
          .ai-ref-hero { min-height: 204px !important; padding: 20px 16px !important; }
          .ai-ref-hero h1 { font-size: 37px !important; }
          .ai-ref-feature { min-height: 184px !important; padding-left: 9px !important; padding-right: 9px !important; }
          .ai-ref-feature b { font-size: 14px !important; }
          .ai-ref-feature p { font-size: 11px !important; }
          .ai-ref-feature i { font-size: 11px !important; padding: 0 8px !important; }
          .ai-ref-premium { grid-template-columns: 48px minmax(0, 1fr) auto !important; padding: 12px !important; }
          .ai-ref-premium button { min-width: 104px !important; font-size: 12px !important; }
        }
        .ai-ref-bottom-nav {
          display: none !important;
        }
        .ai-page {
          border-radius: 0 !important;
          box-shadow: none !important;
        }
        .ai-page.is-dark {
          background:
            radial-gradient(circle at 72% 0%, rgba(255,45,143,.13), transparent 30%),
            linear-gradient(180deg, #020105 0%, #05020b 58%, #020105 100%) !important;
        }
        .ai-page.is-light {
          background:
            radial-gradient(circle at 82% 18%, rgba(255,45,143,.08), transparent 28%),
            radial-gradient(circle at 10% 4%, rgba(255,106,24,.07), transparent 26%),
            #ffffff !important;
        }
        .ai-content {
          padding: 0 11px 12px !important;
        }
        .ai-ref-header {
          grid-template-columns: 44px 1fr 74px !important;
          gap: 7px !important;
          padding: max(8px, calc(env(safe-area-inset-top, 0px) + 5px)) 15px 10px !important;
        }
        .ai-ref-header-logo {
          width: 38px !important;
          height: 38px !important;
        }
        .ai-ref-header-logo img {
          width: 34px !important;
          height: 34px !important;
        }
        .ai-ref-header-word {
          font-size: 34px !important;
        }
        .ai-ref-bell {
          width: 28px !important;
          height: 32px !important;
        }
        .ai-ref-bell svg {
          width: 21px !important;
          height: 21px !important;
        }
        .ai-ref-avatar {
          width: 36px !important;
          height: 36px !important;
        }
        .ai-ref-studio {
          gap: 12px !important;
        }
        .ai-ref-hero {
          min-height: 214px !important;
          border-radius: 25px !important;
          padding: 23px 20px !important;
        }
        .ai-ref-hero-copy > span {
          margin-bottom: 8px !important;
          font-size: 13px !important;
        }
        .ai-ref-hero h1 {
          font-size: 44px !important;
          line-height: .92 !important;
        }
        .ai-ref-hero p {
          max-width: 150px !important;
          margin: 13px 0 17px !important;
          font-size: 13px !important;
        }
        .ai-ref-hero button {
          height: 38px !important;
          padding: 0 14px !important;
          font-size: 12.5px !important;
        }
        .ai-ref-hero-person {
          right: -24px !important;
          bottom: -2px !important;
          width: 64% !important;
          height: 108% !important;
          object-position: 45% center !important;
        }
        .ai-ref-hero-ring {
          right: 1px !important;
          top: 12px !important;
          width: 190px !important;
          height: 190px !important;
          border-width: 2px !important;
        }
        .ai-ref-feature-grid {
          gap: 8px !important;
        }
        .ai-ref-feature {
          min-height: 196px !important;
          padding: 15px 10px 11px !important;
          border-radius: 18px !important;
        }
        .ai-ref-feature-icon {
          width: 43px !important;
          height: 43px !important;
          border-radius: 13px !important;
        }
        .ai-ref-feature-icon svg {
          width: 21px !important;
          height: 21px !important;
        }
        .ai-ref-badge {
          top: 10px !important;
          right: 8px !important;
          padding: 3px 7px !important;
          font-size: 10px !important;
        }
        .ai-ref-feature b {
          margin-top: 34px !important;
          font-size: 16px !important;
        }
        .ai-ref-feature p {
          margin: 13px 0 17px !important;
          font-size: 11.5px !important;
          line-height: 1.55 !important;
        }
        .ai-ref-feature i {
          height: 34px !important;
          padding: 0 10px !important;
          font-size: 11.5px !important;
        }
        .ai-ref-section-head h2 {
          font-size: 16px !important;
        }
        .ai-ref-section-head button {
          font-size: 12px !important;
        }
        .ai-ref-creations {
          gap: 7px !important;
        }
        .ai-ref-creations span,
        .ai-ref-creations i {
          width: 26px !important;
          height: 26px !important;
        }
        .ai-ref-premium {
          grid-template-columns: 52px minmax(0, 1fr) auto !important;
          gap: 12px !important;
          min-height: 78px !important;
          padding: 13px 14px !important;
          border-radius: 20px !important;
        }
        .ai-ref-premium > span {
          width: 50px !important;
          height: 50px !important;
        }
        .ai-ref-premium h3 {
          font-size: 16px !important;
        }
        .ai-ref-premium p {
          font-size: 12px !important;
        }
        .ai-ref-premium button {
          height: 42px !important;
          min-width: 118px !important;
          border-radius: 12px !important;
          font-size: 13px !important;
        }
        @media (max-width: 370px) {
          .ai-ref-header-word { font-size: 30px !important; }
          .ai-ref-hero { min-height: 198px !important; padding: 19px 16px !important; }
          .ai-ref-hero h1 { font-size: 38px !important; }
          .ai-ref-hero-ring { width: 164px !important; height: 164px !important; }
          .ai-ref-feature { min-height: 178px !important; padding: 12px 8px 10px !important; }
          .ai-ref-feature-icon { width: 36px !important; height: 36px !important; }
          .ai-ref-feature b { margin-top: 28px !important; font-size: 14px !important; }
          .ai-ref-feature p { margin: 10px 0 12px !important; font-size: 10.5px !important; }
          .ai-ref-feature i { height: 30px !important; font-size: 10.5px !important; }
          .ai-ref-premium { grid-template-columns: 44px minmax(0, 1fr) auto !important; gap: 9px !important; min-height: 68px !important; padding: 10px 11px !important; }
          .ai-ref-premium > span { width: 42px !important; height: 42px !important; }
          .ai-ref-premium h3 { font-size: 14px !important; }
          .ai-ref-premium p { font-size: 10.5px !important; }
          .ai-ref-premium button { min-width: 100px !important; height: 36px !important; font-size: 11px !important; }
        }
        .ai-ref-hero {
          aspect-ratio: 798 / 469 !important;
          min-height: 0 !important;
          height: auto !important;
          padding: 0 !important;
          cursor: pointer !important;
          background: url('/spicey-assets/ai-ref-hero-dark.png') center / cover no-repeat !important;
          border-color: rgba(255,45,180,.22) !important;
          box-shadow: 0 18px 44px rgba(0,0,0,.34), inset 0 1px rgba(255,255,255,.08) !important;
        }
        .ai-page.is-light .ai-ref-hero {
          background: url('/spicey-assets/ai-ref-hero-dark.png') center / cover no-repeat !important;
          box-shadow: 0 18px 44px rgba(37,18,54,.12) !important;
        }
        .ai-ref-hero-copy,
        .ai-ref-hero-person,
        .ai-ref-hero-ring {
          display: none !important;
        }
        .ai-ref-feature {
          aspect-ratio: 253 / 448 !important;
          min-height: 0 !important;
          padding: 0 !important;
          border-radius: 18px !important;
          overflow: hidden !important;
          background: #05020a !important;
          border-color: rgba(255,45,180,.22) !important;
          box-shadow: none !important;
        }
        .ai-ref-feature > img {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          opacity: 1 !important;
          display: block !important;
        }
        .ai-ref-feature::after,
        .ai-page.is-light .ai-ref-feature::after,
        .ai-ref-feature-icon,
        .ai-ref-badge,
        .ai-ref-feature b,
        .ai-ref-feature p,
        .ai-ref-feature i {
          display: none !important;
        }
        .ai-ref-section-head {
          margin: 1px 5px 2px !important;
        }
        .ai-ref-section-head h2 {
          font-size: 15px !important;
          font-weight: 850 !important;
        }
        .ai-ref-section-head button {
          color: #ff1471 !important;
          font-size: 12px !important;
        }
        .ai-ref-creations {
          gap: 8px !important;
        }
        .ai-ref-creations button {
          aspect-ratio: 190 / 196 !important;
          border-radius: 13px !important;
          border-color: rgba(255,255,255,.10) !important;
          box-shadow: none !important;
        }
        .ai-ref-creations img {
          opacity: 1 !important;
        }
        .ai-ref-creations span,
        .ai-ref-creations i {
          display: none !important;
        }
        .ai-ref-premium {
          min-height: 86px !important;
          height: auto !important;
          padding: 14px 14px !important;
          cursor: pointer !important;
          display: grid !important;
          grid-template-columns: 54px minmax(0, 1fr) 88px !important;
          align-items: center !important;
          gap: 11px !important;
          position: relative !important;
          border-radius: 20px !important;
          overflow: hidden !important;
          text-align: left !important;
          background:
            radial-gradient(circle at 13% 45%, rgba(255, 122, 24, .36), transparent 29%),
            radial-gradient(circle at 88% 48%, rgba(255, 20, 113, .32), transparent 34%),
            linear-gradient(145deg, rgba(21, 10, 31, .98), rgba(7, 3, 14, .97)) !important;
          border: 1px solid rgba(255,255,255,.12) !important;
          box-shadow: 0 16px 34px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.08) !important;
        }
        .ai-ref-premium::before {
          content: "" !important;
          position: absolute !important;
          inset: 0 !important;
          z-index: 0 !important;
          background:
            linear-gradient(105deg, transparent 0%, rgba(255,45,180,.14) 44%, rgba(255,122,24,.22) 100%),
            radial-gradient(circle at 18% 18%, rgba(255,255,255,.13), transparent 22%) !important;
          pointer-events: none !important;
        }
        .ai-ref-premium::after {
          content: "" !important;
          position: absolute !important;
          right: -18px !important;
          top: -28px !important;
          width: 116px !important;
          height: 116px !important;
          border-radius: 50% !important;
          border: 1px solid rgba(255,45,180,.28) !important;
          box-shadow: 0 0 34px rgba(255,45,180,.16), inset 0 0 28px rgba(255,122,24,.12) !important;
          pointer-events: none !important;
        }
        .ai-page.is-light .ai-ref-premium {
          background:
            radial-gradient(circle at 13% 45%, rgba(255, 122, 24, .18), transparent 30%),
            radial-gradient(circle at 88% 48%, rgba(255, 20, 113, .16), transparent 34%),
            linear-gradient(145deg, #ffffff, #fff7fb) !important;
          border-color: rgba(255,45,143,.12) !important;
          box-shadow: 0 16px 34px rgba(36,18,54,.10), inset 0 1px 0 #fff !important;
        }
        .ai-ref-premium > * {
          position: relative !important;
          z-index: 1 !important;
        }
        .ai-ref-talk-orb {
          width: 52px !important;
          height: 52px !important;
          display: grid !important;
          place-items: center !important;
          border-radius: 50% !important;
          color: #ffffff !important;
          background:
            radial-gradient(circle at 34% 24%, rgba(255,255,255,.34), transparent 28%),
            linear-gradient(135deg, #ff8a18, #ff1471 58%, #8b35ff) !important;
          box-shadow: 0 0 26px rgba(255,45,143,.32), 0 0 18px rgba(255,122,24,.14), inset 0 1px rgba(255,255,255,.24) !important;
        }
        .ai-ref-talk-copy {
          min-width: 0 !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 5px !important;
        }
        .ai-ref-talk-copy strong {
          color: #ffffff !important;
          font-size: 18px !important;
          line-height: 1.02 !important;
          font-weight: 900 !important;
          text-shadow: 0 1px 12px rgba(255,45,143,.18) !important;
        }
        .ai-ref-talk-copy small {
          max-width: 156px !important;
          color: rgba(255,255,255,.68) !important;
          font-size: 11px !important;
          line-height: 1.25 !important;
          font-weight: 600 !important;
        }
        .ai-page.is-light .ai-ref-talk-copy strong {
          color: #17111d !important;
        }
        .ai-page.is-light .ai-ref-talk-copy small {
          color: rgba(23,17,29,.58) !important;
        }
        .ai-ref-talk-cta {
          height: 38px !important;
          min-width: 86px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 2px !important;
          border-radius: 13px !important;
          color: #ffffff !important;
          background:
            radial-gradient(circle at 34% 20%, rgba(255,255,255,.28), transparent 30%),
            linear-gradient(135deg, #ff1471 0%, #ff4f63 48%, #ff8a18 100%) !important;
          box-shadow: 0 12px 24px rgba(255,45,143,.26), inset 0 1px 0 rgba(255,255,255,.24) !important;
          font-size: 12.5px !important;
          font-weight: 900 !important;
          white-space: nowrap !important;
        }
        .ai-ref-talk-cta svg {
          width: 14px !important;
          height: 14px !important;
        }
        @media (max-width: 370px) {
          .ai-ref-premium {
            grid-template-columns: 44px minmax(0, 1fr) 88px !important;
            gap: 9px !important;
            min-height: 74px !important;
            padding: 11px !important;
          }
          .ai-ref-talk-orb {
            width: 42px !important;
            height: 42px !important;
          }
          .ai-ref-talk-copy strong {
            font-size: 15px !important;
          }
          .ai-ref-talk-copy small {
            font-size: 10px !important;
          }
          .ai-ref-talk-cta {
            min-width: 88px !important;
            height: 34px !important;
            font-size: 10.5px !important;
          }
        }
        .ai-ref-premium {
          aspect-ratio: 798 / 146 !important;
          min-height: 0 !important;
          height: auto !important;
          padding: 0 !important;
          display: block !important;
          border-radius: 20px !important;
          background: url('/spicey-assets/ai-ref-premium-dark.png') center / cover no-repeat !important;
          border: 1px solid rgba(255,255,255,.10) !important;
          box-shadow: 0 14px 32px rgba(0,0,0,.22) !important;
          overflow: hidden !important;
        }
        .ai-page.is-light .ai-ref-premium {
          background: url('/spicey-assets/ai-ref-premium-dark.png') center / cover no-repeat !important;
          box-shadow: 0 14px 32px rgba(36,18,54,.10) !important;
        }
        .ai-ref-premium > * {
          display: none !important;
        }
        .ai-ref-premium::before {
          content: "Spicey AI Talk" !important;
          position: absolute !important;
          left: 76px !important;
          top: 21px !important;
          z-index: 2 !important;
          width: 205px !important;
          height: 29px !important;
          display: flex !important;
          align-items: center !important;
          color: #ffffff !important;
          background: linear-gradient(90deg, #0d0713 0%, #0d0713 76%, rgba(13,7,19,0)) !important;
          font-size: 17px !important;
          line-height: 1 !important;
          font-weight: 900 !important;
          letter-spacing: 0 !important;
          text-shadow: 0 1px 8px rgba(0,0,0,.70) !important;
          pointer-events: none !important;
        }
        .ai-ref-premium::after {
          content: "Start" !important;
          position: absolute !important;
          right: 35px !important;
          top: 33px !important;
          z-index: 2 !important;
          width: 143px !important;
          height: 48px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          border-radius: 13px !important;
          color: #ffffff !important;
          background:
            radial-gradient(circle at 32% 18%, rgba(255,255,255,.28), transparent 30%),
            linear-gradient(135deg, #ff1471 0%, #ff4b70 50%, #ff8a18 100%) !important;
          box-shadow: 0 12px 24px rgba(255,45,143,.24), inset 0 1px 0 rgba(255,255,255,.22) !important;
          font-size: 17px !important;
          font-weight: 900 !important;
          pointer-events: none !important;
        }
        @media (max-width: 370px) {
          .ai-ref-premium::before {
            left: 66px !important;
            top: 18px !important;
            width: 175px !important;
            height: 25px !important;
            font-size: 14px !important;
          }
          .ai-ref-premium::after {
            right: 24px !important;
            top: 28px !important;
            width: 116px !important;
            height: 40px !important;
            font-size: 14px !important;
          }
        }
        .ai-ref-premium {
          aspect-ratio: auto !important;
          min-height: 82px !important;
          padding: 13px 14px !important;
          display: grid !important;
          grid-template-columns: 52px minmax(0, 1fr) 96px !important;
          align-items: center !important;
          gap: 12px !important;
          border-radius: 20px !important;
          border: 1px solid rgba(255,255,255,.12) !important;
          background:
            radial-gradient(circle at 13% 48%, rgba(255, 122, 24, .34), transparent 29%),
            radial-gradient(circle at 92% 48%, rgba(255, 20, 113, .30), transparent 34%),
            linear-gradient(145deg, rgba(18, 9, 28, .98), rgba(7, 3, 14, .97)) !important;
          box-shadow: 0 16px 34px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.08) !important;
        }
        .ai-page.is-light .ai-ref-premium {
          background:
            radial-gradient(circle at 13% 48%, rgba(255, 122, 24, .16), transparent 30%),
            radial-gradient(circle at 92% 48%, rgba(255, 20, 113, .14), transparent 34%),
            linear-gradient(145deg, #ffffff, #fff7fb) !important;
          border-color: rgba(255,45,143,.12) !important;
          box-shadow: 0 16px 34px rgba(36,18,54,.10), inset 0 1px 0 #fff !important;
        }
        .ai-ref-premium::before {
          content: "" !important;
          position: absolute !important;
          inset: 0 !important;
          z-index: 0 !important;
          width: auto !important;
          height: auto !important;
          background:
            linear-gradient(105deg, transparent 0%, rgba(255,45,180,.12) 44%, rgba(255,122,24,.20) 100%),
            radial-gradient(circle at 18% 18%, rgba(255,255,255,.12), transparent 22%) !important;
          pointer-events: none !important;
        }
        .ai-ref-premium::after {
          content: "" !important;
          position: absolute !important;
          right: -18px !important;
          top: -28px !important;
          z-index: 0 !important;
          width: 116px !important;
          height: 116px !important;
          border-radius: 50% !important;
          border: 1px solid rgba(255,45,180,.28) !important;
          background: transparent !important;
          box-shadow: 0 0 34px rgba(255,45,180,.16), inset 0 0 28px rgba(255,122,24,.12) !important;
          pointer-events: none !important;
        }
        .ai-ref-premium > * {
          display: flex !important;
          position: relative !important;
          z-index: 1 !important;
        }
        .ai-ref-talk-orb {
          width: 50px !important;
          height: 50px !important;
          align-items: center !important;
          justify-content: center !important;
          border-radius: 50% !important;
          color: #ffae22 !important;
          border: 1px solid rgba(255,45,180,.48) !important;
          background:
            radial-gradient(circle at 42% 35%, rgba(255,168,32,.22), transparent 36%),
            rgba(10,4,16,.55) !important;
          box-shadow: 0 0 20px rgba(255,45,180,.18), inset 0 1px 0 rgba(255,255,255,.10) !important;
        }
        .ai-ref-talk-copy {
          min-width: 0 !important;
          flex-direction: column !important;
          gap: 4px !important;
        }
        .ai-ref-talk-copy strong {
          color: #ffffff !important;
          font-size: 16.5px !important;
          line-height: 1.05 !important;
          font-weight: 900 !important;
          letter-spacing: 0 !important;
        }
        .ai-ref-talk-copy small {
          max-width: 150px !important;
          color: rgba(255,255,255,.62) !important;
          font-size: 10.8px !important;
          line-height: 1.25 !important;
          font-weight: 600 !important;
        }
        .ai-page.is-light .ai-ref-talk-copy strong {
          color: #17111d !important;
        }
        .ai-page.is-light .ai-ref-talk-copy small {
          color: rgba(23,17,29,.58) !important;
        }
        .ai-ref-talk-cta {
          height: 38px !important;
          min-width: 96px !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 3px !important;
          border-radius: 12px !important;
          color: #ffffff !important;
          background:
            radial-gradient(circle at 34% 20%, rgba(255,255,255,.28), transparent 30%),
            linear-gradient(135deg, #ff1471 0%, #ff4b70 50%, #ff8a18 100%) !important;
          box-shadow: 0 12px 24px rgba(255,45,143,.24), inset 0 1px 0 rgba(255,255,255,.22) !important;
          font-size: 12.5px !important;
          font-weight: 900 !important;
          white-space: nowrap !important;
        }
        @media (max-width: 370px) {
          .ai-ref-premium {
            grid-template-columns: 44px minmax(0, 1fr) 84px !important;
            gap: 9px !important;
            min-height: 74px !important;
            padding: 11px !important;
          }
          .ai-ref-talk-orb {
            width: 42px !important;
            height: 42px !important;
          }
          .ai-ref-talk-copy strong {
            font-size: 14.5px !important;
          }
          .ai-ref-talk-copy small {
            font-size: 9.8px !important;
          }
          .ai-ref-talk-cta {
            min-width: 84px !important;
            height: 34px !important;
            font-size: 10.5px !important;
          }
        }
        .ai-ref-premium::after {
          display: none !important;
          content: "" !important;
        }
        .ai-ref-premium {
          grid-template-columns: 46px minmax(0, 1fr) 92px !important;
          min-height: 76px !important;
          padding: 12px 13px !important;
          gap: 12px !important;
          border-radius: 18px !important;
          background:
            radial-gradient(circle at 12% 42%, rgba(255,122,24,.28), transparent 28%),
            radial-gradient(circle at 92% 50%, rgba(255,20,113,.28), transparent 32%),
            linear-gradient(145deg, rgba(15,7,24,.98), rgba(5,3,11,.98)) !important;
        }
        .ai-ref-talk-orb {
          width: 44px !important;
          height: 44px !important;
          border-radius: 14px !important;
          color: #ffb11f !important;
          border-color: rgba(255,122,24,.38) !important;
          background:
            radial-gradient(circle at 30% 20%, rgba(255,255,255,.16), transparent 28%),
            linear-gradient(145deg, rgba(255,122,24,.14), rgba(255,20,113,.12) 56%, rgba(139,53,255,.14)) !important;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.10), 0 0 18px rgba(255,45,143,.14) !important;
        }
        .ai-ref-talk-copy {
          gap: 5px !important;
        }
        .ai-ref-talk-copy strong {
          font-family: "Inter", "Avenir Next", system-ui, sans-serif !important;
          color: #ffffff !important;
          font-size: 20px !important;
          line-height: 1 !important;
          font-weight: 300 !important;
          letter-spacing: .12em !important;
          text-transform: uppercase !important;
          text-shadow: none !important;
        }
        .ai-ref-talk-copy small {
          max-width: none !important;
          color: rgba(255,255,255,.66) !important;
          font-size: 11px !important;
          line-height: 1 !important;
          font-weight: 700 !important;
          letter-spacing: .03em !important;
        }
        .ai-ref-talk-cta {
          min-width: 92px !important;
          height: 40px !important;
          border-radius: 10px !important;
          border: 1px solid rgba(255,255,255,.20) !important;
          background:
            linear-gradient(135deg, #ff7a18 0%, #ff285f 46%, #d719d8 100%) !important;
          box-shadow: 0 10px 22px rgba(255,45,143,.22), inset 0 1px 0 rgba(255,255,255,.24) !important;
          font-size: 13px !important;
          letter-spacing: .02em !important;
        }
        .ai-page.is-light .ai-ref-talk-copy strong {
          color: #17111d !important;
        }
        .ai-page.is-light .ai-ref-talk-copy small {
          color: rgba(23,17,29,.56) !important;
        }
        @media (max-width: 370px) {
          .ai-ref-premium {
            grid-template-columns: 40px minmax(0, 1fr) 78px !important;
            min-height: 70px !important;
            padding: 10px 11px !important;
          }
          .ai-ref-talk-orb {
            width: 38px !important;
            height: 38px !important;
          }
          .ai-ref-talk-copy strong {
            font-size: 16px !important;
            letter-spacing: .1em !important;
          }
          .ai-ref-talk-copy small {
            font-size: 10px !important;
          }
          .ai-ref-talk-cta {
            min-width: 78px !important;
            height: 34px !important;
            font-size: 11px !important;
          }
        }
        .ai-ref-premium {
          grid-template-columns: 38px minmax(0, 1fr) 74px !important;
          min-height: 68px !important;
          padding: 10px 12px !important;
          gap: 10px !important;
          border-radius: 17px !important;
        }
        .ai-ref-talk-orb {
          width: 36px !important;
          height: 36px !important;
          border-radius: 11px !important;
          color: #ffb326 !important;
          border: 1px solid rgba(255,122,24,.32) !important;
          background:
            radial-gradient(circle at 34% 22%, rgba(255,255,255,.14), transparent 30%),
            linear-gradient(145deg, rgba(255,122,24,.12), rgba(255,20,113,.10) 54%, rgba(139,53,255,.12)) !important;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 0 12px rgba(255,45,143,.10) !important;
        }
        .ai-ref-talk-orb svg {
          width: 17px !important;
          height: 17px !important;
        }
        .ai-ref-talk-copy {
          gap: 3px !important;
          overflow: hidden !important;
        }
        .ai-ref-talk-copy strong {
          display: block !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: clip !important;
          font-size: 16px !important;
          line-height: 1 !important;
          font-weight: 300 !important;
          letter-spacing: .08em !important;
        }
        .ai-ref-talk-copy small {
          display: block !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: clip !important;
          font-size: 10px !important;
          line-height: 1 !important;
          font-weight: 650 !important;
          letter-spacing: .02em !important;
        }
        .ai-ref-talk-cta {
          min-width: 74px !important;
          width: 74px !important;
          height: 34px !important;
          border-radius: 9px !important;
          border: 1px solid rgba(255,255,255,.18) !important;
          gap: 0 !important;
          background:
            linear-gradient(135deg, #ff7a18 0%, #ff2d72 52%, #b923e6 100%) !important;
          box-shadow: 0 8px 18px rgba(255,45,143,.18), inset 0 1px 0 rgba(255,255,255,.22) !important;
          font-size: 12px !important;
          font-weight: 850 !important;
          letter-spacing: 0 !important;
        }
        .ai-ref-talk-cta svg {
          width: 13px !important;
          height: 13px !important;
          margin-left: 1px !important;
        }
        @media (max-width: 370px) {
          .ai-ref-premium {
            grid-template-columns: 34px minmax(0, 1fr) 66px !important;
            min-height: 62px !important;
            padding: 9px 10px !important;
            gap: 8px !important;
          }
          .ai-ref-talk-orb {
            width: 32px !important;
            height: 32px !important;
            border-radius: 10px !important;
          }
          .ai-ref-talk-orb svg {
            width: 15px !important;
            height: 15px !important;
          }
          .ai-ref-talk-copy strong {
            font-size: 14px !important;
            letter-spacing: .07em !important;
          }
          .ai-ref-talk-copy small {
            font-size: 9px !important;
          }
          .ai-ref-talk-cta {
            min-width: 66px !important;
            width: 66px !important;
            height: 30px !important;
            font-size: 10.5px !important;
          }
        }
        .ai-ref-premium::before,
        .ai-ref-premium::after {
          content: none !important;
          display: none !important;
          background: none !important;
          border: 0 !important;
          box-shadow: none !important;
        }
        .ai-ref-premium {
          grid-template-columns: 38px minmax(0, 1fr) 72px !important;
          min-height: 66px !important;
          padding: 10px 12px !important;
          gap: 10px !important;
          border-radius: 17px !important;
          overflow: hidden !important;
          background:
            linear-gradient(145deg, rgba(14,7,23,.97), rgba(5,3,11,.99)) padding-box,
            linear-gradient(120deg, rgba(255,122,24,.56), rgba(255,20,113,.42), rgba(139,53,255,.42)) border-box !important;
          border: 1px solid transparent !important;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 12px 26px rgba(0,0,0,.22) !important;
        }
        .ai-page.is-light .ai-ref-premium {
          background:
            linear-gradient(145deg, rgba(255,255,255,.98), rgba(255,247,252,.98)) padding-box,
            linear-gradient(120deg, rgba(255,122,24,.46), rgba(255,20,113,.34), rgba(139,53,255,.34)) border-box !important;
          box-shadow: 0 12px 28px rgba(255,45,143,.12), inset 0 1px 0 rgba(255,255,255,.92) !important;
        }
        .ai-ref-talk-orb {
          width: 36px !important;
          height: 36px !important;
          border-radius: 50% !important;
          color: #fff !important;
          border: 1px solid rgba(255,255,255,.20) !important;
          background:
            radial-gradient(circle at 32% 20%, rgba(255,255,255,.28), transparent 28%),
            linear-gradient(135deg, #ff8a18 0%, #ff285f 55%, #8b35ff 100%) !important;
          box-shadow: 0 0 14px rgba(255,45,143,.18), inset 0 1px 0 rgba(255,255,255,.22) !important;
        }
        .ai-ref-talk-orb svg {
          width: 17px !important;
          height: 17px !important;
        }
        .ai-ref-talk-copy {
          min-width: 0 !important;
          gap: 3px !important;
        }
        .ai-ref-talk-copy strong {
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: clip !important;
          font-size: 14.5px !important;
          line-height: 1 !important;
          font-weight: 300 !important;
          letter-spacing: .075em !important;
          text-shadow: none !important;
        }
        .ai-ref-talk-copy small {
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: clip !important;
          font-size: 9.5px !important;
          line-height: 1 !important;
          font-weight: 650 !important;
          letter-spacing: .02em !important;
        }
        .ai-ref-talk-cta {
          min-width: 72px !important;
          width: 72px !important;
          height: 32px !important;
          border-radius: 10px !important;
          color: #fff !important;
          border: 1px solid rgba(255,255,255,.22) !important;
          background: linear-gradient(135deg, #ff8a18 0%, #ff2d72 55%, #b923e6 100%) !important;
          box-shadow: 0 8px 18px rgba(255,45,143,.18), inset 0 1px 0 rgba(255,255,255,.24) !important;
          font-size: 11.5px !important;
          font-weight: 850 !important;
        }
        @media (max-width: 370px) {
          .ai-ref-premium {
            grid-template-columns: 34px minmax(0, 1fr) 64px !important;
            min-height: 62px !important;
            padding: 9px 10px !important;
            gap: 8px !important;
          }
          .ai-ref-talk-orb {
            width: 32px !important;
            height: 32px !important;
          }
          .ai-ref-talk-copy strong {
            font-size: 13px !important;
            letter-spacing: .065em !important;
          }
          .ai-ref-talk-copy small {
            font-size: 8.5px !important;
          }
          .ai-ref-talk-cta {
            min-width: 64px !important;
            width: 64px !important;
            height: 30px !important;
            font-size: 10.5px !important;
          }
        }
        .spicey-talk-panel {
          width: 100% !important;
          min-height: 64px !important;
          display: grid !important;
          grid-template-columns: 38px minmax(0, 1fr) 72px !important;
          align-items: center !important;
          gap: 10px !important;
          padding: 10px 12px !important;
          border: 1px solid rgba(255,255,255,.12) !important;
          border-radius: 17px !important;
          color: #fff !important;
          background: linear-gradient(145deg, rgba(13,7,22,.98), rgba(4,3,10,.99)) !important;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 12px 26px rgba(0,0,0,.22) !important;
          cursor: pointer !important;
          text-align: left !important;
          overflow: hidden !important;
          appearance: none !important;
        }
        .ai-page.is-light .spicey-talk-panel {
          color: #17111d !important;
          border-color: rgba(255,45,143,.14) !important;
          background: linear-gradient(145deg, #ffffff, #fff8fc) !important;
          box-shadow: 0 12px 28px rgba(255,45,143,.10), inset 0 1px 0 rgba(255,255,255,.92) !important;
        }
        .spicey-talk-mic {
          width: 36px !important;
          height: 36px !important;
          display: grid !important;
          place-items: center !important;
          border-radius: 50% !important;
          color: #fff !important;
          background: linear-gradient(135deg, #ff8a18 0%, #ff2d72 55%, #8b35ff 100%) !important;
          border: 1px solid rgba(255,255,255,.20) !important;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.24), 0 0 14px rgba(255,45,143,.18) !important;
        }
        .spicey-talk-copy {
          min-width: 0 !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 4px !important;
        }
        .spicey-talk-copy strong {
          display: block !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: clip !important;
          color: inherit !important;
          font-family: "Inter", "Avenir Next", system-ui, sans-serif !important;
          font-size: 14px !important;
          line-height: 1 !important;
          font-weight: 300 !important;
          letter-spacing: .07em !important;
          text-transform: uppercase !important;
          text-shadow: none !important;
        }
        .spicey-talk-copy small {
          display: block !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: clip !important;
          color: rgba(255,255,255,.62) !important;
          font-size: 9.5px !important;
          line-height: 1 !important;
          font-weight: 650 !important;
          letter-spacing: .02em !important;
        }
        .ai-page.is-light .spicey-talk-copy small {
          color: rgba(23,17,29,.56) !important;
        }
        .spicey-talk-start {
          width: 72px !important;
          height: 32px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 1px !important;
          border-radius: 10px !important;
          color: #fff !important;
          background: linear-gradient(135deg, #ff8a18 0%, #ff2d72 55%, #b923e6 100%) !important;
          border: 1px solid rgba(255,255,255,.22) !important;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.24), 0 8px 18px rgba(255,45,143,.18) !important;
          font-size: 11.5px !important;
          line-height: 1 !important;
          font-weight: 850 !important;
          white-space: nowrap !important;
        }
        .spicey-talk-start svg {
          width: 13px !important;
          height: 13px !important;
        }
        @media (max-width: 370px) {
          .spicey-talk-panel {
            grid-template-columns: 34px minmax(0, 1fr) 64px !important;
            min-height: 60px !important;
            padding: 9px 10px !important;
            gap: 8px !important;
          }
          .spicey-talk-mic {
            width: 32px !important;
            height: 32px !important;
          }
          .spicey-talk-copy strong {
            font-size: 12.5px !important;
            letter-spacing: .06em !important;
          }
          .spicey-talk-copy small {
            font-size: 8.5px !important;
          }
          .spicey-talk-start {
            width: 64px !important;
            height: 29px !important;
            font-size: 10.5px !important;
          }
        }
      `}</style>
    </div>
  );
}
