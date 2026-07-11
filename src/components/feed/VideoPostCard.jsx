import React, { useState } from 'react';
import { ExternalLink, Play } from 'lucide-react';

function getYouTubeId(url) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|v\/))([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function YouTubeThumbnailPlayer({ videoId, url }) {
  const [playing, setPlaying] = useState(false);
  const thumb = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1&autoplay=1`;

  if (playing) {
    return (
      <div className="relative w-full" style={{ paddingBottom: '56.25%', background: '#000' }}>
        <iframe
          src={embedUrl}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 w-full h-full"
          style={{ border: 'none' }}
        />
      </div>
    );
  }

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ paddingBottom: '56.25%', background: '#000', cursor: 'pointer' }}
      onClick={() => setPlaying(true)}
    >
      <img
        src={thumb}
        alt="Video thumbnail"
        className="absolute inset-0 w-full h-full object-cover"
        onError={e => { e.target.style.display = 'none'; }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.3)' }} />
      {/* Play button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'rgba(255,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}>
          <Play size={28} color="white" style={{ marginLeft: 4 }} />
        </div>
      </div>
      {/* YouTube badge */}
      <div className="absolute bottom-2 right-2"
        style={{ background: 'rgba(0,0,0,0.7)', borderRadius: 6, padding: '3px 8px' }}>
        <span style={{ color: 'white', fontSize: 10, fontWeight: 700 }}>YouTube</span>
      </div>
    </div>
  );
}

export default function VideoPostCard({ post }) {
  const url = post.video_link || '';
  if (!url) return null;

  const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
  const isVimeo = url.includes('vimeo.com');

  if (isYoutube) {
    const videoId = getYouTubeId(url);
    if (videoId) {
      return (
        <div className="w-full overflow-hidden" style={{ borderRadius: 20, background: '#000' }}>
          <YouTubeThumbnailPlayer videoId={videoId} url={url} />
        </div>
      );
    }
  }

  if (isVimeo) {
    const match = url.match(/vimeo\.com\/(\d+)/);
    if (match) {
      const embedUrl = `https://player.vimeo.com/video/${match[1]}`;
      return (
        <div className="w-full overflow-hidden" style={{ borderRadius: 20, background: '#000' }}>
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={embedUrl}
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
              style={{ border: 'none' }}
            />
          </div>
        </div>
      );
    }
  }

  // Fallback: external link
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-5 py-5 w-full"
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16 }}
    >
      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)' }}>
        <ExternalLink className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm">Watch Video</p>
        <p className="text-white/40 text-xs truncate">{url}</p>
      </div>
    </a>
  );
}