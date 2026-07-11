import React, { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PageHeader({ rightContent }) {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl pb-2">
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />

      <div className="flex items-center justify-between px-4 pt-4 pb-3 relative">
        {/* Logo left */}
        <div className="w-10">
          <img
            src="https://media.base44.com/images/public/69fe90d3bbe7ad47925e4a0a/f7e33989f_SpiceyLogo.png"
            alt="SPICEY"
            className="h-8 object-contain"
            style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.6)) drop-shadow(0 0 16px rgba(160,80,255,0.5))' }}
          />
        </div>

        {/* Center logo */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <img
            src="https://media.base44.com/images/public/69fe90d3bbe7ad47925e4a0a/f7e33989f_SpiceyLogo.png"
            alt="SPICEY"
            className="h-16 object-contain"
            style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.7)) drop-shadow(0 0 24px rgba(160,80,255,0.6))' }}
          />
        </div>

        {/* Right slot */}
        <div className="relative">
          {rightContent ? rightContent : (
            <>
              <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 hover:opacity-80 transition">
                <Bell className="w-6 h-6 text-foreground/80" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 text-[10px] font-bold flex items-center justify-center text-white shadow-lg">
                  3
                </span>
              </button>

              {/* Notifications dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowNotifications(false)} className="fixed inset-0 z-40" />
                    <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} className="absolute top-16 -right-20 w-96 rounded-2xl shadow-2xl z-50"
                      style={{ background: 'rgba(13,0,16,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <div className="flex items-center justify-between p-4 border-b border-white/10">
                        <h3 className="font-bold text-white text-sm">Notifications</h3>
                        <button onClick={() => setShowNotifications(false)} className="p-1 hover:bg-white/10 rounded transition">
                          <X className="w-4 h-4 text-white/60" />
                        </button>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        <div className="p-4 hover:bg-white/5 border-b border-white/5 cursor-pointer transition flex items-center gap-3">
                          <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=48&q=80" alt="Diana" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                          <div>
                            <p className="text-sm text-white font-medium">Diana started following you</p>
                            <p className="text-xs text-white/50 mt-1">2 minutes ago</p>
                          </div>
                        </div>
                        <div className="p-4 hover:bg-white/5 border-b border-white/5 cursor-pointer transition flex items-center gap-3">
                          <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=48&q=80" alt="Arben" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                          <div>
                            <p className="text-sm text-white font-medium">Arben liked your post</p>
                            <p className="text-xs text-white/50 mt-1">5 minutes ago</p>
                          </div>
                        </div>
                        <div className="p-4 hover:bg-white/5 cursor-pointer transition flex items-center gap-3">
                          <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=48&q=80" alt="Elena" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                          <div>
                            <p className="text-sm text-white font-medium">Elena commented on your story</p>
                            <p className="text-xs text-white/50 mt-1">10 minutes ago</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    </div>
  );
}