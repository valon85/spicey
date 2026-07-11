import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { X, Image as ImageIcon, Plus, Trash2, MapPin, Music, Users, Wand2, Search, Play, Download } from 'lucide-react';
import MusicPicker from '@/components/create/MusicPicker';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

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

export default function CreatePhotoPost() {
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const [images, setImages] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [selectedEffect, setSelectedEffect] = useState('none');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState('');
  const [music, setMusic] = useState(null);
  const [postType, setPostType] = useState('feed');
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('filters');
  const [musicSearch, setMusicSearch] = useState('');
  const [musicResults, setMusicResults] = useState([]);
  const [searchingMusic, setSearchingMusic] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser);
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

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const searchMusicHandler = async (query) => {
    if (!query.trim()) return;
    setSearchingMusic(true);
    try {
      const res = await base44.functions.invoke('searchMusic', { query });
      if (res.data?.results) {
        // Map Deezer format to our format
        const mapped = res.data.results.map(track => ({
          title: track.trackName,
          artist: track.artistName,
          preview_url: track.previewUrl,
          artwork_url: track.artworkUrl100 || track.artworkUrl60,
        }));
        setMusicResults(mapped);
      }
    } catch (err) {
      console.error('Music search error:', err);
    } finally {
      setSearchingMusic(false);
    }
  };

  const handlePost = async () => {
    if (images.length === 0 || !user) return;
    
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
        caption: caption || (isPresetAvatar ? '✨ New avatar! 🔥' : ''),
        post_type: isPresetVideo ? 'reel' : postType,
        image_urls: isPresetVideo ? [] : imageUrls,
        image_url: isPresetVideo ? '' : imageUrls[0],
        video_url: isPresetVideo ? imageUrls[0] : '',
        visibility: 'public',
        location: location || '',
        tags: tags || '',
        music_title: music?.title || '',
        music_artist: music?.artist || '',
        music_preview_url: music?.preview_url || '',
        music_artwork_url: music?.artwork_url || '',
        map_visible: !!location,
        map_city: location ? location.split(',')[0].trim() : '',
      });

      navigate((isPresetVideo || postType === 'reel') ? '/reels' : '/');
    } catch (err) {
      console.error('Failed to create post:', err);
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
            title: 'Spicey Photo',
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
      paddingTop: 'max(1rem, env(safe-area-inset-top))',
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
      <div className="relative flex items-center justify-between px-4 pb-3 z-10">
        <button onClick={() => navigate('/')} className="p-2 rounded-full hover:bg-white/10 transition-colors">
          <X className="w-6 h-6" style={{ color: isLight ? '#000' : '#fff' }} />
        </button>
        <div className="flex items-center gap-2">
          {images.length > 0 && (
            <button 
              onClick={saveToPhone}
              className="p-2.5 rounded-full transition-all transform active:scale-95"
              style={{
                background: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.1)',
                border: `1px solid ${isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)'}`,
              }}
              title="Save to phone"
            >
              <Download className="w-5 h-5" style={{ color: isLight ? '#000' : '#fff' }} />
            </button>
          )}
          <h1 className="text-lg font-bold" style={{ color: isLight ? '#000' : '#fff' }}>
            {images[0]?.isPreset && /\.(mp4|webm|mov)(\?|$)/i.test(images[0]?.url || '')
              ? 'Avatar Video'
              : images.length > 0 ? `${images.length} Photo${images.length > 1 ? 's' : ''}` : 'Create Post'}
          </h1>
        </div>
        <button 
          onClick={handlePost}
          disabled={images.length === 0 || uploading}
          className="px-5 py-2.5 rounded-full font-bold text-sm transition-all transform active:scale-95"
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
          <div className="px-4 pb-6 space-y-4">
            {/* Main Preview */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl" style={{ aspectRatio: '1' }}>
              <img 
                src={images[0].url} 
                alt="Preview" 
                className="w-full h-full object-cover"
                style={{ filter: getFilterStyle(selectedFilter) }}
              />
              {selectedEffect !== 'none' && (
                <div className="absolute inset-0 pointer-events-none" style={{
                  background: selectedEffect === 'glow' ? 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)' :
                           selectedEffect === 'vintage' ? 'radial-gradient(circle, rgba(139,69,19,0.2) 0%, transparent 70%)' :
                           selectedEffect === 'dramatic' ? 'radial-gradient(circle, rgba(0,0,0,0.3) 50%, transparent 100%)' :
                           'none',
                }} />
              )}
            </div>

            {/* Action Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
              {[
                { id: 'effects', icon: Wand2, label: 'Effects' },
                { id: 'music', icon: Music, label: 'Music' },
                { id: 'location', icon: MapPin, label: 'Location' },
                { id: 'tags', icon: Users, label: 'Tags' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(activeTab === tab.id ? null : tab.id)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-all"
                  style={{
                    background: activeTab === tab.id 
                      ? 'linear-gradient(135deg, #FF6A00 0%, #FF2D55 100%)' 
                      : (isLight ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.08)'),
                    color: activeTab === tab.id ? '#fff' : (isLight ? '#000' : '#fff'),
                    border: activeTab === tab.id ? 'none' : (isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.1)'),
                  }}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-4">
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
                        <div className="w-20 h-20 rounded-xl overflow-hidden mb-2 transition-transform" style={{
                          transform: selectedFilter === f.id ? 'scale(1.1)' : 'scale(1)',
                          border: selectedFilter === f.id ? '3px solid #FF6A00' : '3px solid transparent',
                          boxShadow: selectedFilter === f.id ? '0 4px 12px rgba(255,106,0,0.4)' : 'none',
                        }}>
                          <img src={images[0].url} alt={f.name} className="w-full h-full object-cover" style={{ filter: getFilterStyle(f.id) }} />
                        </div>
                        <span className="text-xs font-medium" style={{ color: isLight ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)' }}>{f.name}</span>
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
                        className="flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all"
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
            <div className="space-y-4 pt-4">
              {/* Post Type */}
              <div className="flex gap-2">
                <button
                  onClick={() => setPostType('feed')}
                  className="flex-1 py-3.5 rounded-xl font-semibold transition-all"
                  style={{
                    background: postType === 'feed' 
                      ? 'linear-gradient(135deg, #FF6A00 0%, #FF2D55 100%)' 
                      : (isLight ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.08)'),
                    color: postType === 'feed' ? '#fff' : (isLight ? '#000' : '#fff'),
                    boxShadow: postType === 'feed' ? '0 4px 12px rgba(255,106,0,0.3)' : 'none',
                  }}
                >
                  📱 Feed Post
                </button>
                <button
                  onClick={() => setPostType('reel')}
                  className="flex-1 py-3.5 rounded-xl font-semibold transition-all"
                  style={{
                    background: postType === 'reel' 
                      ? 'linear-gradient(135deg, #FF6A00 0%, #FF2D55 100%)' 
                      : (isLight ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.08)'),
                    color: postType === 'reel' ? '#fff' : (isLight ? '#000' : '#fff'),
                    boxShadow: postType === 'reel' ? '0 4px 12px rgba(255,106,0,0.3)' : 'none',
                  }}
                >
                  🎬 Reel
                </button>
              </div>

              {/* Caption */}
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a caption..."
                rows={3}
                className="w-full p-4 rounded-xl resize-none"
                style={{
                  background: isLight ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.08)',
                  border: isLight ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.1)',
                  color: isLight ? '#000' : '#fff',
                  fontSize: 15,
                }}
              />

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
