import React from 'react';
import { Video } from 'lucide-react';

export default function VideoLinkInput({ videoLink, setVideoLink }) {
  return (
    <div className="rounded-3xl overflow-hidden"
      style={{ 
        background: 'rgba(255,255,255,0.02)', 
        border: '1px solid rgba(255,85,0,0.2)',
        boxShadow: '0 0 30px rgba(255,85,0,0.08)'
      }}>
      <div className="flex items-center gap-2.5 px-5 py-3.5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Video className="w-5 h-5" style={{ color: '#ff5500' }} />
        <span className="text-sm font-bold" style={{ color: 'white' }}>Video Link</span>
      </div>
      <div className="p-5">
        <input
          type="text"
          value={videoLink}
          onChange={e => setVideoLink(e.target.value)}
          placeholder="Paste a video link..."
          className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none font-semibold"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'white',
            fontSize: 16
          }}
        />
      </div>
    </div>
  );
}