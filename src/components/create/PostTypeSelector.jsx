import React from 'react';
import { motion } from 'framer-motion';
import { Type, ImagePlus, Video, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PostTypeSelector({ onClose }) {
  const navigate = useNavigate();

  const handleSelect = (type) => {
    navigate(`/create?type=${type}`);
  };

  const options = [
    {
      id: 'text',
      label: 'Text Post',
      description: 'Share your thoughts',
      icon: Type,
      gradient: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
    },
    {
      id: 'photo',
      label: 'Photo Post',
      description: 'Share a moment',
      icon: ImagePlus,
      gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    },
    {
      id: 'video',
      label: 'Video Post',
      description: 'Record & share',
      icon: Video,
      gradient: 'linear-gradient(135deg, #3b82f6, #10b981)',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'linear-gradient(160deg, #0a0014, #0d0520, #050010)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-6">
        <div />
        <span className="text-white font-bold text-lg">Create Post</span>
        <button onClick={onClose || (() => navigate('/'))} className="w-9 h-9 flex items-center justify-center rounded-full"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Main options grid */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          {options.map((opt, i) => (
            <motion.button
              key={opt.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => handleSelect(opt.id)}
              className="flex flex-col items-center gap-3 p-6 rounded-3xl"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  background: opt.gradient,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}>
                <opt.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-sm">{opt.label}</p>
                <p className="text-white/40 text-xs mt-0.5">{opt.description}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-6 pb-12">
        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => handleSelect('reel')}
            className="flex-1 py-4 rounded-2xl font-bold text-white"
            style={{
              background: 'linear-gradient(135deg, #e91e8c, #a733ff)',
              boxShadow: '0 0 24px rgba(233,30,140,0.4)',
            }}>
            🎬 Create Reel
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => handleSelect('story')}
            className="flex-1 py-4 rounded-2xl font-bold text-white"
            style={{
              background: 'linear-gradient(135deg, #ff5500, #e91e8c)',
              boxShadow: '0 0 24px rgba(255,80,0,0.4)',
            }}>
            📱 Create Story
          </motion.button>
        </div>
      </div>
    </div>
  );
}