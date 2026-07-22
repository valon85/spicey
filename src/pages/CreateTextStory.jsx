import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  X, Check, Sparkles, Type, AlignLeft, AlignCenter, AlignRight,
  Palette, Loader2
} from 'lucide-react';
import SpiceLogo from '@/components/shared/SpiceLogo';

// Background presets
const BG_PRESETS = {
  solids: [
    { id: 'midnight', name: 'Midnight', value: 'linear-gradient(180deg, #0a0214 0%, #1a0a2e 100%)' },
    { id: 'crimson', name: 'Crimson', value: 'linear-gradient(180deg, #2d0a1a 0%, #4a0a2e 100%)' },
    { id: 'ocean', name: 'Ocean', value: 'linear-gradient(180deg, #0a1a2e 0%, #0a2e4a 100%)' },
    { id: 'forest', name: 'Forest', value: 'linear-gradient(180deg, #0a2e1a 0%, #0a4a2e 100%)' },
    { id: 'charcoal', name: 'Charcoal', value: 'linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 100%)' },
  ],
  gradients: [
    { id: 'spicey', name: 'Spicey', value: 'linear-gradient(135deg, #667eea 0%, #f093fb 50%, #ff6b6b 100%)' },
    { id: 'sunset', name: 'Sunset', value: 'linear-gradient(135deg, #ff6a00 0%, #ee0979 100%)' },
    { id: 'purple-love', name: 'Purple Love', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 'neon', name: 'Neon', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { id: 'cosmic', name: 'Cosmic', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  ],
  animated: [
    { id: 'aurora', name: 'Aurora', value: 'aurora' },
    { id: 'nebula', name: 'Nebula', value: 'nebula' },
    { id: 'fire', name: 'Fire', value: 'fire' },
  ]
};

// Font options
const FONTS = [
  { id: 'inter', name: 'Modern', css: 'Inter, sans-serif', preview: 'Aa' },
  { id: 'serif', name: 'Classic', css: 'Georgia, serif', preview: 'Aa' },
  { id: 'mono', name: 'Tech', css: 'Courier New, monospace', preview: 'Aa' },
  { id: 'display', name: 'Bold', css: 'Arial Black, sans-serif', preview: 'Aa' },
];

export default function CreateTextStory() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [text, setText] = useState('');
  const [selectedBg, setSelectedBg] = useState(BG_PRESETS.gradients[0]);
  const [selectedFont, setSelectedFont] = useState(FONTS[0]);
  const [alignment, setAlignment] = useState('center');
  const [fontSize, setFontSize] = useState(28);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activePanel, setActivePanel] = useState(null);
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [text]);

  const createStory = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      if (!user) throw new Error('Not authenticated');

      const userProfiles = await base44.entities.UserProfile.filter({ user_id: user.id });
      const userProfile = userProfiles[0] || {};
      const authorName = userProfile.full_name || user.full_name || 'User';
      const authorUsername = userProfile.username || user.email?.split('@')[0] || 'user';
      const authorAvatar = userProfile.avatar_url || user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=random`;

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      return await base44.entities.Story.create({
        user_id: user.id,
        username: authorUsername,
        user_avatar: authorAvatar,
        image_url: '',
        video_url: '',
        caption: text,
        story_type: 'text',
        bg_preset: selectedBg.id,
        bg_value: selectedBg.value,
        font_family: selectedFont.css,
        font_id: selectedFont.id,
        text_alignment: alignment,
        font_size: fontSize,
        expires_at: expiresAt.toISOString(),
        views: [],
      });
    },
    onSuccess: () => {
      setShowSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      setTimeout(() => {
        navigate('/');
      }, 1500);
    },
  });

  const handlePublish = () => {
    if (!text.trim()) return;
    setIsPublishing(true);
    createStory.mutate();
  };

  const getBackgroundStyle = () => {
    if (['aurora', 'nebula', 'fire'].includes(selectedBg.id)) {
      return {
        background: selectedBg.id === 'aurora'
          ? 'linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #ff6b6b)'
          : selectedBg.id === 'nebula'
          ? 'linear-gradient(-45deg, #0a0214, #1a0a2e, #2d0a1a, #4a0a2e)'
          : 'linear-gradient(-45deg, #ff6a00, #ee0979, #ff6b6b, #f5576c)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite',
      };
    }
    return { background: selectedBg.value };
  };

  const canPublish = text.trim().length > 0 && !isPublishing;

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden">
      {/* Add gradient animation to document */}
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; filter: blur(8px); }
          50% { opacity: 0.7; filter: blur(12px); }
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between px-4 pb-4 flex-shrink-0"
        style={{ paddingTop: 'max(48px, calc(env(safe-area-inset-top, 44px) + 8px))' }}
        style={{
          background: 'rgba(10,2,20,0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
        <button onClick={() => navigate('/?hub=1')}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <X className="w-5 h-5 text-white" />
        </button>

        <SpiceLogo size="sm" />

        <button onClick={handlePublish} disabled={!canPublish}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${canPublish ? '' : 'opacity-40'}`}
          style={{
            background: canPublish ? 'linear-gradient(135deg, #ff5500, #e91e8c)' : 'rgba(255,255,255,0.08)',
            boxShadow: canPublish ? '0 0 20px rgba(255,85,0,0.5)' : 'none',
            border: '1px solid rgba(255,255,255,0.15)'
          }}>
          {isPublishing ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Check className="w-5 h-5 text-white" />}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ background: '#0a0214' }}>
        {/* Preview Area */}
        <div className="flex-1 relative overflow-hidden">
          {/* Animated Background */}
          <motion.div
            animate={{
              background: selectedBg.value,
            }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
            style={getBackgroundStyle()}
          />

          {/* Glow orbs for animated backgrounds */}
          {['aurora', 'nebula', 'fire'].includes(selectedBg.id) && (
            <>
              <motion.div
                animate={{
                  x: [0, 100, 0],
                  y: [0, 50, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute w-96 h-96 rounded-full opacity-30 blur-3xl"
                style={{
                  background: selectedBg.id === 'aurora' ? '#667eea' : selectedBg.id === 'nebula' ? '#764ba2' : '#ff6a00',
                  top: '10%',
                  left: '10%',
                }}
              />
              <motion.div
                animate={{
                  x: [0, -80, 0],
                  y: [0, 80, 0],
                  scale: [1, 1.3, 1],
                }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                className="absolute w-80 h-80 rounded-full opacity-30 blur-3xl"
                style={{
                  background: selectedBg.id === 'aurora' ? '#f093fb' : selectedBg.id === 'nebula' ? '#4a0a2e' : '#ee0979',
                  bottom: '20%',
                  right: '10%',
                }}
              />
            </>
          )}

          {/* Text Display */}
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <motion.p
              key={text || selectedBg.id + selectedFont.id + alignment}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-white whitespace-pre-wrap break-words max-w-full"
              style={{
                fontFamily: selectedFont.css,
                fontSize: `${fontSize}px`,
                textAlign: alignment,
                textShadow: '0 0 30px rgba(255,255,255,0.3), 0 0 60px rgba(255,100,0,0.2)',
                lineHeight: 1.5,
              }}
            >
              {text || 'Your text here...'}
            </motion.p>
          </div>
        </div>

        {/* Editor Panel */}
        <div className="flex-shrink-0"
          style={{
            background: 'rgba(10,2,20,0.98)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}>
          {/* Text Input */}
          <div className="p-4 border-b border-white/10">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write your moment..."
              className="w-full bg-transparent text-white text-lg resize-none outline-none placeholder:text-white/30"
              style={{
                minHeight: '80px',
                maxHeight: '200px',
                fontFamily: selectedFont.css,
              }}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-white/40">{text.length} characters</span>
              {text.length > 500 && (
                <span className="text-xs text-orange-400 font-semibold">Consider shortening for better readability</span>
              )}
            </div>
          </div>

          {/* Tool Buttons */}
          <div className="flex items-center justify-around px-4 py-3">
            {[
              { id: 'bg', icon: Palette, label: 'Background' },
              { id: 'font', icon: Type, label: 'Font' },
              { id: 'align', icon: AlignCenter, label: 'Align' },
            ].map(({ id, icon: Icon, label }) => (
              <motion.button
                key={id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActivePanel(activePanel === id ? null : id)}
                className="flex flex-col items-center gap-1.5 px-4 py-2 rounded-xl transition-all"
                style={{
                  background: activePanel === id ? 'rgba(255,85,0,0.15)' : 'transparent',
                  border: activePanel === id ? '1px solid rgba(255,85,0,0.4)' : '1px solid transparent',
                }}
              >
                <Icon className={`w-5 h-5 ${activePanel === id ? 'text-orange-400' : 'text-white/60'}`} />
                <span className={`text-xs font-semibold ${activePanel === id ? 'text-orange-400' : 'text-white/50'}`}>{label}</span>
              </motion.button>
            ))}
          </div>

          {/* Active Panel */}
          <AnimatePresence>
            {activePanel && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden border-t border-white/10"
              >
                <div className="p-4">
                  {/* Background Panel */}
                  {activePanel === 'bg' && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-white font-bold text-sm mb-3">Solid Colors</h4>
                        <div className="flex gap-2 overflow-x-auto">
                          {BG_PRESETS.solids.map((bg) => (
                            <motion.button
                              key={bg.id}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setSelectedBg(bg)}
                              className="flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all"
                              style={{
                                border: selectedBg.id === bg.id ? '2px solid #ff5500' : '2px solid rgba(255,255,255,0.2)',
                                boxShadow: selectedBg.id === bg.id ? '0 0 20px rgba(255,85,0,0.5)' : 'none',
                              }}
                            >
                              <div className="w-full h-full" style={{ background: bg.value }} />
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-white font-bold text-sm mb-3">Gradients</h4>
                        <div className="flex gap-2 overflow-x-auto">
                          {BG_PRESETS.gradients.map((bg) => (
                            <motion.button
                              key={bg.id}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setSelectedBg(bg)}
                              className="flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all"
                              style={{
                                border: selectedBg.id === bg.id ? '2px solid #ff5500' : '2px solid rgba(255,255,255,0.2)',
                                boxShadow: selectedBg.id === bg.id ? '0 0 20px rgba(255,85,0,0.5)' : 'none',
                              }}
                            >
                              <div className="w-full h-full" style={{ background: bg.value }} />
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-white font-bold text-sm mb-3">Animated</h4>
                        <div className="flex gap-2 overflow-x-auto">
                          {BG_PRESETS.animated.map((bg) => (
                            <motion.button
                              key={bg.id}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setSelectedBg(bg)}
                              className="flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all"
                              style={{
                                border: selectedBg.id === bg.id ? '2px solid #ff5500' : '2px solid rgba(255,255,255,0.2)',
                                boxShadow: selectedBg.id === bg.id ? '0 0 20px rgba(255,85,0,0.5)' : 'none',
                                background: bg.id === 'aurora'
                                  ? 'linear-gradient(135deg, #667eea, #764ba2)'
                                  : bg.id === 'nebula'
                                  ? 'linear-gradient(135deg, #0a0214, #2d0a1a)'
                                  : 'linear-gradient(135deg, #ff6a00, #ee0979)',
                              }}
                            >
                              <div className="w-full h-full flex items-center justify-center">
                                <motion.div
                                  animate={{ scale: [1, 1.1, 1] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                  className="w-8 h-8 rounded-full"
                                  style={{
                                    background: bg.id === 'aurora'
                                      ? 'linear-gradient(135deg, #667eea, #f093fb)'
                                      : bg.id === 'nebula'
                                      ? 'linear-gradient(135deg, #1a0a2e, #4a0a2e)'
                                      : 'linear-gradient(135deg, #ff6a00, #ff6b6b)',
                                  }}
                                />
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Font Panel */}
                  {activePanel === 'font' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        {FONTS.map((font) => (
                          <motion.button
                            key={font.id}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedFont(font)}
                            className="p-4 rounded-2xl border-2 transition-all"
                            style={{
                              background: selectedFont.id === font.id ? 'rgba(255,85,0,0.15)' : 'rgba(255,255,255,0.05)',
                              border: selectedFont.id === font.id ? '2px solid #ff5500' : '2px solid rgba(255,255,255,0.1)',
                              fontFamily: font.css,
                            }}
                          >
                            <div className="text-white text-2xl mb-1">{font.preview}</div>
                            <div className={`text-xs font-semibold ${selectedFont.id === font.id ? 'text-orange-400' : 'text-white/50'}`}>
                              {font.name}
                            </div>
                          </motion.button>
                        ))}
                      </div>

                      <div>
                        <h4 className="text-white font-bold text-sm mb-3">Font Size: {fontSize}px</h4>
                        <input
                          type="range"
                          min="18"
                          max="48"
                          value={fontSize}
                          onChange={(e) => setFontSize(Number(e.target.value))}
                          className="w-full h-2 rounded-full appearance-none cursor-pointer"
                          style={{
                            background: 'linear-gradient(to right, #ff5500 0%, #e91e8c 100%)',
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Alignment Panel */}
                  {activePanel === 'align' && (
                    <div className="flex gap-3">
                      {[
                        { id: 'left', icon: AlignLeft },
                        { id: 'center', icon: AlignCenter },
                        { id: 'right', icon: AlignRight },
                      ].map(({ id, icon: Icon }) => (
                        <motion.button
                          key={id}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setAlignment(id)}
                          className="flex-1 py-4 rounded-2xl flex items-center justify-center border-2 transition-all"
                          style={{
                            background: alignment === id ? 'rgba(255,85,0,0.15)' : 'rgba(255,255,255,0.05)',
                            border: alignment === id ? '2px solid #ff5500' : '2px solid rgba(255,255,255,0.1)',
                          }}
                        >
                          <Icon className={`w-6 h-6 ${alignment === id ? 'text-orange-400' : 'text-white/60'}`} />
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Success Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none"
            style={{ background: 'rgba(10,2,20,0.95)' }}
          >
            <motion.div
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: -50 }}
              className="px-8 py-6 rounded-3xl flex flex-col items-center gap-4"
              style={{
                background: 'linear-gradient(135deg, rgba(255,85,0,0.2), rgba(233,30,140,0.2))',
                border: '2px solid rgba(255,85,0,0.5)',
                boxShadow: '0 0 60px rgba(255,85,0,0.5), 0 0 120px rgba(233,30,140,0.3)',
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #ff5500, #e91e8c)',
                  boxShadow: '0 0 40px rgba(255,85,0,0.8)',
                }}
              >
                <Check className="w-10 h-10 text-white" />
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-white font-bold text-xl"
              >
                Story Posted!
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}