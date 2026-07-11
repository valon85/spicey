import React, { useRef, useState, useEffect } from 'react';
import { X, Camera, Video, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import useScrollLock from '@/hooks/useScrollLock';

export default function StoryUploadModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [isLight, setIsLight] = useState(false);

  useScrollLock(isOpen);

  useEffect(() => {
    const check = () => setIsLight(document.documentElement.classList.contains('light-mode'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (evt) => {
      setPreview({ url: evt.target.result, type: file.type.startsWith('video') ? 'video' : 'image', file });
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!preview?.file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: preview.file });

      // Store in user profile
      await base44.auth.updateMe({
        story_url: file_url,
        story_caption: caption,
        story_created_at: new Date().toISOString(),
      });

      // Close and reset
      setPreview(null);
      setCaption('');
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
    }
    setUploading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — tap to close. No backdrop-filter: iOS Safari leaves blur behind after unmount */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onTouchEnd={onClose}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            onClick={e => e.stopPropagation()}
            onTouchEnd={e => e.stopPropagation()}
            className="fixed z-50 w-full px-4"
            style={{ top: '50%', left: 0, right: 0, transform: 'translateY(-50%)' }}
          >
            <div
              className="w-full max-w-md mx-auto rounded-3xl p-6"
              style={{
                background: isLight
                  ? 'rgba(255,255,255,0.98)'
                  : 'linear-gradient(135deg, rgba(60,20,90,0.95), rgba(40,10,60,0.95))',
                border: isLight ? '1px solid rgba(160,80,255,0.2)' : '1px solid rgba(255,255,255,0.1)',
                boxShadow: isLight ? '0 20px 60px rgba(120,60,200,0.15)' : 'none',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold" style={{ color: isLight ? 'hsl(270,20%,12%)' : 'white' }}>Add to Story</h2>
                <button onClick={onClose} className="p-1 rounded-full transition"
                  style={{ background: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.1)' }}>
                  <X className="w-5 h-5" style={{ color: isLight ? 'hsl(270,20%,30%)' : 'white' }} />
                </button>
              </div>

              {preview ? (
                <>
                  {/* Preview */}
                  <div className="mb-4 rounded-2xl overflow-hidden aspect-video bg-black">
                    {preview.type === 'video' ? (
                      <video src={preview.url} className="w-full h-full object-cover" controls />
                    ) : (
                      <img src={preview.url} alt="preview" className="w-full h-full object-cover" />
                    )}
                  </div>

                  {/* Caption input */}
                  <input
                    type="text"
                    placeholder="Add a caption..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl mb-4 outline-none"
                    style={{
                      background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)',
                      border: isLight ? '1px solid rgba(160,80,255,0.25)' : '1px solid rgba(255,255,255,0.2)',
                      color: isLight ? 'hsl(270,20%,12%)' : 'white',
                    }}
                  />

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setPreview(null); setCaption(''); }}
                      className="flex-1 py-3 rounded-xl font-semibold transition"
                      style={{
                        background: isLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.1)',
                        color: isLight ? 'hsl(270,20%,20%)' : 'white',
                      }}
                    >
                      Back
                    </button>
                    <button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="flex-1 py-3 rounded-xl text-white font-semibold transition disabled:opacity-50"
                      style={{ background: uploading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #ff5500, #e91e8c)' }}
                    >
                      {uploading ? 'Uploading...' : 'Done'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Upload options */}
                  <div className="space-y-2 mb-6">
                    {[
                      { icon: Camera, label: 'Upload Photo', sub: 'From your device', color: '#ff5500', action: () => fileInputRef.current?.click() },
                      { icon: Video, label: 'Upload Video', sub: 'Max 60 seconds', color: '#ff5500', action: () => fileInputRef.current?.click() },
                      { icon: Radio, label: 'Go Live', sub: 'Start a live stream', color: '#e91e8c', action: () => { onClose(); navigate('/live'); } },
                    ].map(({ icon: Icon, label, sub, color, action }) => (
                      <button key={label} onClick={action}
                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all"
                        style={{
                          background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.07)',
                          border: isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.08)',
                        }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: `${color}18` }}>
                          <Icon className="w-5 h-5" style={{ color }} />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-sm" style={{ color: isLight ? 'hsl(270,20%,12%)' : 'white' }}>{label}</p>
                          <p className="text-xs mt-0.5" style={{ color: isLight ? 'rgba(80,50,120,0.55)' : 'rgba(255,255,255,0.5)' }}>{sub}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <p className="text-xs text-center" style={{ color: isLight ? 'rgba(80,50,120,0.45)' : 'rgba(255,255,255,0.4)' }}>Stories disappear after 24 hours</p>
                </>
              )}

              <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileSelect} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

}