import React from 'react';
import { Music, Search, Play, Trash2 } from 'lucide-react';

export default function MusicPicker({
  music,
  setMusic,
  musicSearch,
  setMusicSearch,
  musicResults,
  searchingMusic,
  onSearch,
  isLight,
}) {
  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#FF6A00' }}>
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={musicSearch}
          onChange={(e) => setMusicSearch(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onSearch(musicSearch)}
          placeholder="Search for songs..."
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl font-medium"
          style={{
            background: isLight ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.08)',
            border: `2px solid ${isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.12)'}`,
            color: isLight ? '#000' : '#fff',
            fontSize: 15,
            outline: 'none',
          }}
          onFocus={(e) => e.target.style.borderColor = '#FF6A00'}
          onBlur={(e) => e.target.style.borderColor = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.12)'}
        />
      </div>
      
      {/* Searching State */}
      {searchingMusic && (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 rounded-full border-2 border-transparent border-t-orange-500 border-r-orange-500 animate-spin" />
          <span className="ml-3 text-sm font-medium" style={{ color: isLight ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)' }}>Searching...</span>
        </div>
      )}

      {/* Results */}
      {musicResults.length > 0 && (
        <div className="space-y-2 max-h-72 overflow-y-auto -mx-2 px-2">
          {musicResults.map((track, i) => (
            <button
              key={i}
              onClick={() => {
                setMusic({
                  title: track.title,
                  artist: track.artist,
                  preview_url: track.preview_url,
                  artwork_url: track.artwork_url,
                });
              }}
              className="w-full flex items-center gap-3 p-3 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: music?.title === track.title 
                  ? 'linear-gradient(135deg, rgba(255,106,0,0.2) 0%, rgba(255,45,85,0.15) 100%)' 
                  : (isLight ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.06)'),
                border: music?.title === track.title 
                  ? '2px solid rgba(255,106,0,0.5)' 
                  : `1px solid ${isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              {track.artwork_url ? (
                <img 
                  src={track.artwork_url} 
                  alt={track.title} 
                  className="w-14 h-14 rounded-xl object-cover shadow-md"
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
                />
              ) : (
                <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{
                  background: 'linear-gradient(135deg, #FF6A00 0%, #FF2D55 100%)',
                  boxShadow: '0 2px 8px rgba(255,106,0,0.4)',
                }}>
                  <Music className="w-7 h-7 text-white" />
                </div>
              )}
              <div className="flex-1 text-left min-w-0">
                <div className="font-bold text-sm truncate" style={{ color: isLight ? '#000' : '#fff' }}>{track.title}</div>
                <div className="text-xs mt-0.5 truncate" style={{ color: isLight ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)' }}>{track.artist}</div>
              </div>
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{
                background: 'linear-gradient(135deg, #FF6A00 0%, #FF2D55 100%)',
                boxShadow: '0 2px 8px rgba(255,106,0,0.3)',
              }}>
                <Play className="w-4 h-4 text-white ml-0.5" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {musicResults.length === 0 && !searchingMusic && musicSearch && (
        <div className="text-center py-8">
          <Music className="w-12 h-12 mx-auto mb-3" style={{ color: isLight ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)' }} />
          <p className="text-sm font-medium" style={{ color: isLight ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)' }}>No songs found</p>
          <p className="text-xs mt-1" style={{ color: isLight ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)' }}>Try a different search term</p>
        </div>
      )}

      {/* Selected Music */}
      {music && (
        <div className="p-4 rounded-2xl" style={{
          background: 'linear-gradient(135deg, rgba(255,106,0,0.15) 0%, rgba(255,45,85,0.1) 100%)',
          border: '2px solid rgba(255,106,0,0.3)',
          boxShadow: '0 4px 12px rgba(255,106,0,0.15)',
        }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, #FF6A00 0%, #FF2D55 100%)',
                boxShadow: '0 2px 8px rgba(255,106,0,0.4)',
              }}>
                <Music className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-sm" style={{ color: isLight ? '#000' : '#fff' }}>{music.title}</div>
                <div className="text-xs mt-0.5" style={{ color: isLight ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)' }}>{music.artist}</div>
              </div>
            </div>
            <button 
              onClick={() => setMusic(null)} 
              className="p-2.5 rounded-xl hover:bg-red-500/20 transition-colors"
            >
              <Trash2 className="w-5 h-5 text-red-500" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}