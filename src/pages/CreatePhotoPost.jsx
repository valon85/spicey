import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { X, Image as ImageIcon, Trash2, MapPin, Music, Users, Wand2, Download, Type } from 'lucide-react';
import MusicPicker from '@/components/create/MusicPicker';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { fallbackMusicResults, normalizeMusicTrack, postMusicPayload } from '@/components/create/musicUtils';

const FILTERS = [
  { id: 'none', name: 'Normal' },
  { id: 'clarendon', name: 'Clarendon' },
  { id: 'gingham', name: 'Gingham' },
  { id: 'moon', name: 'Moon' },
  { id: 'lark', name: 'Lark' },
  { id: 'reyes', name: 'Reyes' },
  { id: 'junio', name: 'Junio' },
  { id: 'valencia', name: 'Valencia' },
  { id: 'xpro2', name: 'X-Pro II' },
  { id: 'sierra', name: 'Sierra' },
  { id: 'willow', name: 'Willow' },
  { id: 'lofi', name: 'Lo-Fi' },
  { id: 'inkwell', name: 'Inkwell' },
  { id: 'hudson', name: 'Hudson' },
  { id: 'nashville', name: 'Nashville' },
  { id: 'stinson', name: 'Stinson' },
  { id: 'amaro', name: 'Amaro' },
  { id: 'rise', name: 'Rise' },
];

const EFFECTS = [
  { id: 'none', name: 'None' },
  { id: 'sparkle', name: 'Sparkle' },
  { id: 'glow', name: 'Glow' },
  { id: 'vintage', name: 'Vintage' },
  { id: 'dramatic', name: 'Dramatic' },
  { id: 'portrait', name: 'Portrait' },
];

const MOVIE_MOODS = [
  {
    id: 'city',
    name: 'City Nights',
    title: 'CITY NIGHTS',
    caption: 'A moment. A story. A movie.',
    gradient: 'linear-gradient(180deg, #ff25b8 0%, #ff356c 46%, #ff8b2a 100%)',
    glow: 'rgba(255,45,143,0.34)',
  },
  {
    id: 'glow',
    name: 'Glow Up',
    title: 'GLOW UP',
    caption: 'Main character energy, made for Spicey.',
    gradient: 'linear-gradient(180deg, #ff9a1f 0%, #ff2e9d 52%, #9b35ff 100%)',
    glow: 'rgba(155,53,255,0.34)',
  },
  {
    id: 'afterdark',
    name: 'After Dark',
    title: 'AFTER DARK',
    caption: 'Night colors, soft lights, unforgettable mood.',
    gradient: 'linear-gradient(180deg, #d956ff 0%, #ff2d55 44%, #ff6b35 100%)',
    glow: 'rgba(217,86,255,0.34)',
  },
];

export default function CreatePhotoPost() {
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const [images, setImages] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [selectedEffect, setSelectedEffect] = useState('none');
  const [posterTitle, setPosterTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [movieMode, setMovieMode] = useState(true);
  const [movieMood, setMovieMood] = useState(MOVIE_MOODS[0]);
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState('');
  const [music, setMusic] = useState(null);
  const [postType, setPostType] = useState('feed');
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('movie');
  const [musicSearch, setMusicSearch] = useState('');
  const [musicResults, setMusicResults] = useState([]);
  const [searchingMusic, setSearchingMusic] = useState(false);
  const [publishError, setPublishError] = useState('');

  useEffect(() => {
    let active = true;
    base44.auth.me()
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch((error) => {
        console.warn('[CreatePhotoPost] Session check failed:', error?.message || error);
        if (active) setPublishError(error?.message || 'Could not verify your session.');
      });
    return () => { active = false; };
  }, []);

  // Load preset avatar URL passed from PresetAvatarPicker
  useEffect(() => {
    const presetUrl = routeLocation.state?.presetAvatarUrl;
    if (presetUrl) {
      setImages([{ url: presetUrl, isPreset: true }]);
    }
    const aiPhotoUrl = routeLocation.state?.aiPhotoUrl || sessionStorage.getItem('ai_photo_url');
    if (aiPhotoUrl) {
      setImages([{ url: aiPhotoUrl, isPreset: true }]);
      const aiCaption = routeLocation.state?.aiCaption || sessionStorage.getItem('ai_photo_caption') || '';
      setCaption(aiCaption);
      sessionStorage.removeItem('ai_photo_url');
      sessionStorage.removeItem('ai_photo_caption');
    }
  }, []);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const newImages = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      type: file.type,
    }));
    setImages(prev => [...prev, ...newImages].slice(0, 10));
  };

  const applyMovieMood = (mood, forceText = false) => {
    setMovieMode(true);
    setMovieMood(mood);
    if (forceText || !posterTitle.trim()) setPosterTitle(mood.title);
    if (forceText || !caption.trim()) setCaption(mood.caption);
    setSelectedEffect('glow');
    setSelectedFilter('xpro2');
  };

  const movieCaption = () => {
    const title = posterTitle.trim();
    const body = caption.trim();
    if (!movieMode) return [title, body].filter(Boolean).join(' ');
    return [title, body].filter(Boolean).join('\n');
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const searchMusicHandler = async (query) => {
    if (!query.trim()) return;
    setSearchingMusic(true);
    try {
      const res = await base44.functions.invoke('searchMusic', { query });
      const results = res.data?.results || [];
      setMusicResults((results.length ? results : fallbackMusicResults(query)).map(normalizeMusicTrack));
    } catch (err) {
      console.error('Music search error:', err);
      setMusicResults(fallbackMusicResults(query).map(normalizeMusicTrack));
    } finally {
      setSearchingMusic(false);
    }
  };

  const handlePost = async () => {
    if (images.length === 0 || !user) return;
    
    setPublishError('');
    setUploading(true);
    try {
      const uploadResults = await Promise.all(images.map(img => {
        if (img.isPreset) return Promise.resolve({ file_url: img.url });
        return base44.integrations.Core.UploadFile({ file: img.file });
      }));
      const imageUrls = uploadResults.map(r => r.file_url);

      // If posting a preset avatar, also save it as profile photo
      const isPresetAvatar = images[0]?.isPreset;
      const isPresetVideo = isPresetAvatar && /\.(mp4|webm|mov)(\?|$)/i.test(imageUrls[0] || '');
      if (isPresetAvatar) {
        try {
          await base44.auth.updateMe({ avatar_url: imageUrls[0] });
          try {
            const profiles = await base44.entities.UserProfile.filter({ user_id: user.id }, '-created_date', 1);
            if (profiles.length > 0) {
              await base44.entities.UserProfile.update(profiles[0].id, { avatar_url: imageUrls[0] });
            }
          } catch (profileError) {
            console.warn('Profile row could not be updated for avatar post:', profileError.message);
          }
        } catch (e) {
          console.error('Failed to update profile avatar:', e);
        }
      }

      await base44.entities.Post.create({
        author_id: user.id,
        author_name: user.full_name || user.email?.split('@')[0] || 'User',
        author_username: user.email?.split('@')[0] || 'user',
        author_avatar: isPresetAvatar ? imageUrls[0] : (user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'U')}&background=ff5500&color=fff&size=100`),
        caption: movieCaption() || (isPresetAvatar ? '✨ New avatar! 🔥' : ''),
        post_type: isPresetVideo ? 'reel' : postType,
        image_urls: isPresetVideo ? [] : imageUrls,
        image_url: isPresetVideo ? '' : imageUrls[0],
        video_url: isPresetVideo ? imageUrls[0] : '',
        visibility: 'public',
        location: location || '',
        tags: tags || '',
        hashtags: movieMode ? ['SpiceyMovie', movieMood.name.replace(/\s+/g, '')] : [],
        ...postMusicPayload(music),
        map_visible: !!location,
        map_city: location ? location.split(',')[0].trim() : '',
      });

      navigate((isPresetVideo || postType === 'reel') ? '/reels' : '/');
    } catch (err) {
      console.error('Failed to create post:', err);
      setPublishError(err?.message || 'Failed to publish photo.');
    } finally {
      setUploading(false);
    }
  };

  const saveToPhone = async () => {
    if (images.length === 0) return;
    
    try {
      // Read the image file
      const reader = new FileReader();
      reader.readAsDataURL(images[0].file);
      
      reader.onload = async () => {
        const base64Data = reader.result;
        
        // Create filename with timestamp
        const filename = `spicey_${Date.now()}.jpg`;
        
        // Save to device
        try {
          const savedFile = await Filesystem.writeFile({
            path: filename,
            data: base64Data,
            directory: Directory.Pictures,
          });
          
          // Show success message
          alert('Photo saved to gallery! 📸');
        } catch (err) {
          // Fallback: use Share API
          await Share.share({
            url: images[0].url,
            title: 'AI Photo',
          });
        }
      };
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save photo');
    }
  };

  const isLight = typeof document !== 'undefined' && document.documentElement.classList.contains('light-mode');

  const getFilterStyle = (filterId) => {
    const filters = {
      clarendon: 'contrast(1.1) saturate(1.35) brightness(1.05)',
      gingham: 'contrast(0.95) saturate(0.85) sepia(0.08) brightness(1.05)',
      moon: 'contrast(1.1) saturate(0) brightness(1.1)',
      lark: 'contrast(0.9) saturate(1.1) brightness(1.05)',
      reyes: 'sepia(0.22) contrast(0.89) saturate(0.75) brightness(1.13)',
      junio: 'sepia(0.1) contrast(0.95) saturate(0.85) brightness(1.05)',
      valencia: 'sepia(0.08) contrast(0.95) saturate(1.1) brightness(1.05)',
      xpro2: 'contrast(1.2) saturate(1.3) sepia(0.15)',
      sierra: 'contrast(0.9) saturate(0.85) sepia(0.05)',
      willow: 'contrast(0.9) saturate(0.9) brightness(1.05)',
      lofi: 'contrast(1.1) saturate(1.1) sepia(0.1)',
      inkwell: 'grayscale(1) contrast(1.2)',
      hudson: 'contrast(1.1) saturate(1.2) brightness(1.1)',
      nashville: 'sepia(0.15) contrast(0.95) saturate(0.85)',
      stinson: 'sepia(0.1) contrast(0.95) saturate(0.9) brightness(1.05)',
      amaro: 'contrast(1.05) saturate(1.2) brightness(1.1)',
      rise: 'sepia(0.08) contrast(0.95) saturate(1.1) brightness(1.1)',
    };
    return filters[filterId] || 'none';
  };

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden" style={{ 
      background: isLight 
        ? 'linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%)' 
        : 'linear-gradient(135deg, #0a0214 0%, #1a0520 40%, #2d0f3a 100%)',
      paddingTop: 'max(0.45rem, env(safe-area-inset-top))',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {/* Decorative Background Elements - only in dark mode */}
      {!isLight && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20" style={{
            background: 'radial-gradient(circle, #FF6A00 0%, transparent 70%)',
            filter: 'blur(60px)',
          }} />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-20" style={{
            background: 'radial-gradient(circle, #FF2D55 0%, transparent 70%)',
            filter: 'blur(60px)',
          }} />
        </div>
      )}

      {/* Header */}
      <div className="relative flex items-center justify-between px-3 pb-2 z-10">
        <button onClick={() => navigate('/')} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
          <X className="w-5 h-5" style={{ color: isLight ? '#000' : '#fff' }} />
        </button>
        <div className="flex items-center gap-2">
          {images.length > 0 && (
            <button 
              onClick={saveToPhone}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all transform active:scale-95"
              style={{
                background: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.1)',
                border: `1px solid ${isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)'}`,
              }}
              title="Save to phone"
            >
              <Download className="w-4 h-4" style={{ color: isLight ? '#000' : '#fff' }} />
            </button>
          )}
          <h1 className="text-sm font-black" style={{ color: isLight ? '#000' : '#fff' }}>
            {images[0]?.isPreset && /\.(mp4|webm|mov)(\?|$)/i.test(images[0]?.url || '')
              ? 'Avatar Video'
              : images.length > 0 ? `${images.length} Photo${images.length > 1 ? 's' : ''}` : 'Create Post'}
          </h1>
        </div>
        <button 
          onClick={handlePost}
          disabled={images.length === 0 || uploading}
          className="px-3.5 py-2 rounded-full font-black text-xs transition-all transform active:scale-95"
          style={{
            background: (images.length === 0 || uploading) 
              ? 'rgba(255,255,255,0.1)' 
              : 'linear-gradient(135deg, #FF6A00 0%, #FF2D55 100%)',
            color: '#fff',
            opacity: (images.length === 0 || uploading) ? 0.5 : 1,
            boxShadow: (images.length > 0 && !uploading) ? '0 4px 20px rgba(255,106,0,0.4)' : 'none',
          }}
        >
          {uploading ? 'Posting...' : 'Share'}
        </button>
      </div>

      {/* Content */}
      <div className="relative flex-1 overflow-y-auto z-10">
        {publishError && (
          <div role="alert" className="mx-4 mt-3 rounded-2xl px-4 py-3 text-sm font-semibold" style={{
            color: isLight ? '#8a1237' : '#ffd7e7',
            background: isLight ? 'rgba(255,45,85,0.10)' : 'rgba(255,45,85,0.16)',
            border: '1px solid rgba(255,45,85,0.34)',
          }}>
            {publishError}
          </div>
        )}
        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh] px-6">
            {/* Beautiful Upload Card */}
            <div className="w-full max-w-md" style={{
              background: isLight ? '#FFFFFF' : 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              borderRadius: '32px',
              border: isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.1)',
              padding: '48px 32px',
              boxShadow: isLight ? '0 8px 32px rgba(0,0,0,0.08)' : '0 8px 32px rgba(0,0,0,0.3)',
            }}>
              {/* Icon with gradient ring */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full" style={{
                    background: 'linear-gradient(135deg, #FF6A00 0%, #FF2D55 100%)',
                    filter: 'blur(12px)',
                    opacity: 0.5,
                  }} />
                  <div className="relative w-24 h-24 rounded-full flex items-center justify-center" style={{
                    background: isLight ? 'rgba(255,255,255,0.9)' : 'rgba(20,10,30,0.9)',
                    border: '3px solid rgba(255,106,0,0.3)',
                  }}>
                    <ImageIcon className="w-10 h-10" style={{
                      background: 'linear-gradient(135deg, #FF6A00 0%, #FF2D55 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }} />
                  </div>
                </div>
              </div>

              {/* Text */}
              <h2 className="text-2xl font-bold text-center mb-2" style={{ color: isLight ? '#000' : '#fff' }}>
                Create Beautiful Post
              </h2>
              <p className="text-center mb-8" style={{ color: isLight ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)' }}>
                Select up to 10 photos to share
              </p>

              {/* Upload Button */}
              <label className="block w-full">
                <div className="w-full py-4 rounded-2xl cursor-pointer text-center font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98]" style={{
                  background: 'linear-gradient(135deg, #FF6A00 0%, #FF2D55 100%)',
                  color: '#fff',
                  boxShadow: '0 4px 20px rgba(255,106,0,0.4)',
                }}>
                  Select Photos
                </div>
                <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
              </label>
            </div>
          </div>
        ) : (
          <div className="px-3 pb-3 space-y-3">
            {/* Main Preview */}
            <div className="relative overflow-hidden shadow-2xl" style={{
              height: 'min(53dvh, 420px)',
              minHeight: 300,
              borderRadius: 24,
            }}>
              <img 
                src={images[0].url} 
                alt="Preview" 
                className="w-full h-full object-cover"
                style={{ filter: getFilterStyle(selectedFilter) }}
              />
              {movieMode && (
                <div className="absolute inset-0 pointer-events-none" style={{
                  background: `linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 52%), radial-gradient(circle at 22% 80%, ${movieMood.glow}, transparent 36%)`,
                  zIndex: 1,
                }} />
              )}
              {selectedEffect !== 'none' && (
                <div className="absolute inset-0 pointer-events-none" style={{
                  background: selectedEffect === 'glow' ? 'radial-gradient(circle at 28% 78%, rgba(255,45,143,0.18) 0%, transparent 48%)' :
                           selectedEffect === 'vintage' ? 'radial-gradient(circle, rgba(139,69,19,0.2) 0%, transparent 70%)' :
                           selectedEffect === 'dramatic' ? 'radial-gradient(circle, rgba(0,0,0,0.3) 50%, transparent 100%)' :
                           'none',
                  zIndex: 1,
                }} />
              )}
              {(posterTitle.trim() || caption.trim()) && (
                <div className="absolute left-4 right-4 bottom-4 pointer-events-none" style={{ zIndex: 2 }}>
                  {posterTitle.trim() && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      fontFamily: '"Inter", "Arial Black", sans-serif',
                      fontSize: 'clamp(28px, 8vw, 40px)',
                      lineHeight: 0.78,
                      fontWeight: 740,
                      textTransform: 'uppercase',
                      transform: 'scaleX(0.74)',
                      transformOrigin: 'left center',
                      background: movieMood.gradient,
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      color: 'transparent',
                      WebkitTextFillColor: 'transparent',
                      filter: movieMode ? 'none' : 'drop-shadow(0 3px 7px rgba(0,0,0,0.55))',
                    }}>
                      {posterTitle.trim().split(/\s+/).slice(0, 3).map((word) => (
                        <span key={`${word}-${posterTitle}`}>{word.replace(/[^\p{L}\p{N}]+/gu, '').toUpperCase()}</span>
                      ))}
                    </div>
                  )}
                  {caption.trim() && (
                    <p style={{
                      maxWidth: '76%',
                      margin: posterTitle.trim() ? '7px 0 0' : 0,
                      color: 'rgba(255,255,255,0.86)',
                      fontSize: 'clamp(7.5px, 1.8vw, 9.5px)',
                      lineHeight: 1.32,
                      fontWeight: 260,
                      letterSpacing: '0.075em',
                      textTransform: 'uppercase',
                      textShadow: '0 2px 10px rgba(0,0,0,0.72)',
                    }}>{caption}</p>
                  )}
                </div>
              )}
            </div>

            {/* Action Tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-3 px-3">
              {[
                { id: 'movie', icon: Wand2, label: 'Movie' },
                { id: 'effects', icon: Wand2, label: 'Effects' },
                { id: 'poster', icon: Type, label: 'Text' },
                { id: 'music', icon: Music, label: 'Music' },
                { id: 'location', icon: MapPin, label: 'Location' },
                { id: 'tags', icon: Users, label: 'Tags' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(activeTab === tab.id ? null : tab.id)}
                  className="flex-shrink-0 w-[58px] h-[46px] rounded-2xl whitespace-nowrap transition-all flex flex-col items-center justify-center gap-1"
                  style={{
                    background: activeTab === tab.id 
                      ? 'linear-gradient(135deg, #FF6A00 0%, #FF2D55 100%)' 
                      : (isLight ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.08)'),
                    color: activeTab === tab.id ? '#fff' : (isLight ? '#000' : '#fff'),
                    border: activeTab === tab.id ? 'none' : (isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.1)'),
                  }}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="text-[10px] font-bold">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-4">
              {/* Movie Mode Tab */}
              {activeTab === 'movie' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-black" style={{ color: isLight ? '#000' : '#fff' }}>Spicey Movie Mode</h3>
                      <p className="text-[11px] mt-0.5" style={{ color: isLight ? 'rgba(0,0,0,0.50)' : 'rgba(255,255,255,0.50)' }}>Cinematic poster look for your photo.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMovieMode(v => !v)}
                      className="px-3 py-2 rounded-full text-xs font-black"
                      style={{
                        background: movieMode ? 'linear-gradient(135deg,#ff6b35,#ff2e9d,#9b35ff)' : (isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)'),
                        color: movieMode ? '#fff' : (isLight ? '#111' : '#fff'),
                        border: movieMode ? 'none' : '1px solid rgba(255,255,255,0.14)',
                      }}
                    >
                      {movieMode ? 'ON' : 'OFF'}
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {MOVIE_MOODS.map((mood) => (
                      <button
                        key={mood.id}
                        type="button"
                      onClick={() => applyMovieMood(mood, true)}
                      className="rounded-2xl p-2 text-left overflow-hidden"
                        style={{
                          background: mood.gradient,
                          border: movieMood.id === mood.id ? '2px solid rgba(255,255,255,0.88)' : '1px solid rgba(255,255,255,0.22)',
                          boxShadow: movieMood.id === mood.id ? `0 0 18px ${mood.glow}` : 'none',
                          minHeight: 58,
                        }}
                      >
                        <div className="text-white/75 text-[8px] tracking-[0.14em] uppercase">Mood</div>
                        <div className="text-white text-[11px] font-black mt-1 leading-tight">{mood.name}</div>
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={posterTitle}
                    onChange={(e) => setPosterTitle(e.target.value)}
                    placeholder="CITY NIGHTS"
                    className="w-full px-3 py-2 rounded-xl uppercase font-black"
                    style={{
                      background: isLight ? 'rgba(255,255,255,0.78)' : 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,45,143,0.28)',
                      color: isLight ? '#000' : '#fff',
                      fontSize: 13,
                    }}
                  />
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Small movie description..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl resize-none"
                    style={{
                      background: isLight ? 'rgba(255,255,255,0.78)' : 'rgba(255,255,255,0.08)',
                      border: isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.10)',
                      color: isLight ? '#000' : '#fff',
                      fontSize: 12,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => applyMovieMood(movieMood, true)}
                    className="w-full py-2.5 rounded-2xl text-white text-xs font-black"
                    style={{ background: 'linear-gradient(135deg,#ff6b35,#ff2e9d,#9b35ff)', boxShadow: `0 0 22px ${movieMood.glow}` }}
                  >
                    Make it a Movie
                  </button>
                </div>
              )}

              {/* Filters Tab */}
              {activeTab === 'filters' && (
                <div>
                  <h3 className="text-sm font-semibold mb-3" style={{ color: isLight ? '#000' : '#fff' }}>Filters</h3>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {FILTERS.map(f => (
                      <button
                        key={f.id}
                        onClick={() => setSelectedFilter(f.id)}
                        className="flex-shrink-0"
                      >
                        <div className="w-14 h-14 rounded-xl overflow-hidden mb-1.5 transition-transform" style={{
                          transform: selectedFilter === f.id ? 'scale(1.04)' : 'scale(1)',
                          border: selectedFilter === f.id ? '2px solid #FF6A00' : '2px solid transparent',
                          boxShadow: selectedFilter === f.id ? '0 4px 12px rgba(255,106,0,0.4)' : 'none',
                        }}>
                          <img src={images[0].url} alt={f.name} className="w-full h-full object-cover" style={{ filter: getFilterStyle(f.id) }} />
                        </div>
                        <span className="text-[10px] font-medium" style={{ color: isLight ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)' }}>{f.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Effects Tab */}
              {activeTab === 'effects' && (
                <div>
                  <h3 className="text-sm font-semibold mb-3" style={{ color: isLight ? '#000' : '#fff' }}>Effects</h3>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {EFFECTS.map(e => (
                      <button
                        key={e.id}
                        onClick={() => setSelectedEffect(e.id)}
                        className="flex-shrink-0 px-3 py-2 rounded-full text-xs font-semibold transition-all"
                        style={{
                          background: selectedEffect === e.id 
                            ? 'linear-gradient(135deg, #FF6A00 0%, #FF2D55 100%)' 
                            : (isLight ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.08)'),
                          color: selectedEffect === e.id ? '#fff' : (isLight ? '#000' : '#fff'),
                          border: selectedEffect === e.id ? 'none' : (isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.1)'),
                        }}
                      >
                        {e.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Music Tab */}
              {activeTab === 'poster' && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold" style={{ color: isLight ? '#000' : '#fff' }}>Poster Text</h3>
                  <input
                    type="text"
                    value={posterTitle}
                    onChange={(e) => setPosterTitle(e.target.value)}
                    placeholder="CITY NIGHTS"
                    className="w-full px-3 py-2.5 rounded-xl uppercase font-black"
                    style={{
                      background: isLight ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,45,143,0.30)',
                      color: isLight ? '#000' : '#fff',
                      fontSize: 13,
                    }}
                  />
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Description - thin white poster text..."
                    rows={2}
                    className="w-full px-3 py-2.5 rounded-xl resize-none"
                    style={{
                      background: isLight ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.08)',
                      border: isLight ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.1)',
                      color: isLight ? '#000' : '#fff',
                      fontSize: 12,
                    }}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    {['CITY NIGHTS', 'GLOW UP'].map((title) => (
                      <button
                        key={title}
                        type="button"
                        onClick={() => setPosterTitle(title)}
                        className="py-2.5 rounded-xl text-white text-xs font-black"
                        style={{ background: 'linear-gradient(135deg,#ff2d8f,#8b2cff)' }}
                      >
                        {title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Music Tab */}
              {activeTab === 'music' && (
                <MusicPicker
                  music={music}
                  setMusic={setMusic}
                  musicSearch={musicSearch}
                  setMusicSearch={setMusicSearch}
                  musicResults={musicResults}
                  searchingMusic={searchingMusic}
                  onSearch={searchMusicHandler}
                  isLight={isLight}
                />
              )}

              {/* Location Tab */}
              {activeTab === 'location' && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold" style={{ color: isLight ? '#000' : '#fff' }}>Add Location</h3>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, place, or venue..."
                    className="w-full px-4 py-3 rounded-xl"
                    style={{
                      background: isLight ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.08)',
                      border: `1px solid ${isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}`,
                      color: isLight ? '#000' : '#fff',
                      fontSize: 15,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => navigator.geolocation?.getCurrentPosition(async (pos) => {
                      try {
                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
                        const data = await res.json();
                        setLocation([
                          data?.address?.city || data?.address?.town || data?.address?.village || data?.address?.county || '',
                          data?.address?.country || '',
                        ].filter(Boolean).join(', '));
                      } catch {}
                    }, () => {})}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold"
                    style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.32)', color: '#22d3ee' }}
                  >
                    <MapPin className="w-4 h-4" />
                    Use current GPS location
                  </button>
                  {location && (
                    <div className="flex items-center gap-2 p-3 rounded-xl" style={{
                      background: 'rgba(255,106,0,0.15)',
                      border: '1px solid rgba(255,106,0,0.3)',
                    }}>
                      <MapPin className="w-5 h-5" style={{ color: '#FF6A00' }} />
                      <span className="font-medium" style={{ color: isLight ? '#000' : '#fff' }}>{location}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Tags Tab */}
              {activeTab === 'tags' && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold" style={{ color: isLight ? '#000' : '#fff' }}>Tag People</h3>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="@username1, @username2..."
                    className="w-full px-4 py-3 rounded-xl"
                    style={{
                      background: isLight ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.08)',
                      border: `1px solid ${isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}`,
                      color: isLight ? '#000' : '#fff',
                      fontSize: 15,
                    }}
                  />
                  <p className="text-xs" style={{ color: isLight ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)' }}>
                    Separate usernames with commas
                  </p>
                </div>
              )}
            </div>

            {/* Post Type & Caption */}
            <div className="space-y-3 pt-1">
              {/* Post Type */}
              <div className="flex gap-2">
                <button
                  onClick={() => setPostType('feed')}
                  className="flex-1 py-2.5 rounded-xl text-xs font-black transition-all"
                  style={{
                    background: postType === 'feed' 
                      ? 'linear-gradient(135deg, #FF6A00 0%, #FF2D55 100%)' 
                      : (isLight ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.08)'),
                    color: postType === 'feed' ? '#fff' : (isLight ? '#000' : '#fff'),
                    boxShadow: postType === 'feed' ? '0 4px 12px rgba(255,106,0,0.3)' : 'none',
                  }}
                >
                  Feed
                </button>
                <button
                  onClick={() => setPostType('reel')}
                  className="flex-1 py-2.5 rounded-xl text-xs font-black transition-all"
                  style={{
                    background: postType === 'reel' 
                      ? 'linear-gradient(135deg, #FF6A00 0%, #FF2D55 100%)' 
                      : (isLight ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.08)'),
                    color: postType === 'reel' ? '#fff' : (isLight ? '#000' : '#fff'),
                    boxShadow: postType === 'reel' ? '0 4px 12px rgba(255,106,0,0.3)' : 'none',
                  }}
                >
                  Reel
                </button>
              </div>

              {/* Photo Grid */}
              {images.length > 1 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3" style={{ color: isLight ? '#000' : '#fff' }}>
                    All Photos ({images.length})
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {images.map((img, index) => (
                      <div key={index} className="relative aspect-square rounded-xl overflow-hidden">
                        <img src={img.url} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
