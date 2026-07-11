import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function formatCount(num) {
  if (!num) return '0';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return num.toString();
}

export default function ReactionBar({ fireCount, likesCount, wowCount, isFireReacted }) {
  const [isLight, setIsLight] = React.useState(false);

  React.useEffect(() => {
    const check = () => setIsLight(document.documentElement.classList.contains('light-mode'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const countColor = isLight ? 'rgba(40,20,60,0.85)' : 'white';
  const dividerColor = isLight ? 'rgba(120,80,180,0.2)' : 'rgba(255,255,255,0.1)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative flex items-center justify-center gap-5 px-4 py-2 rounded-full overflow-hidden transition-all"
      style={{
        background: isLight
          ? 'rgba(255,255,255,0.7)'
          : 'linear-gradient(90deg, rgba(120,30,5,0.95) 0%, rgba(140,15,70,0.95) 30%, rgba(100,25,140,0.9) 100%)',
        border: isLight ? '1px solid rgba(160,80,220,0.18)' : '1px solid rgba(255,180,200,0.05)',
        boxShadow: isLight
          ? '0 2px 12px rgba(160,80,220,0.1)'
          : '0 0 8px rgba(255,80,0,0.2), 0 0 16px rgba(200,30,100,0.15)',
        backdropFilter: 'blur(20px)',
        padding: '8px 16px',
      }}
    >
      {[
        { emoji: '🔥', count: fireCount },
        { divider: true },
        { emoji: '❤️', count: likesCount },
        { divider: true },
        { emoji: '😮', count: wowCount },
      ].map((item, i) =>
        item.divider ? (
          <div key={i} className="w-px h-3" style={{ background: dividerColor }} />
        ) : (
          <motion.div key={item.emoji} className="flex items-center gap-1 z-10" whileHover={{ scale: 1.08 }}>
            <span className="text-base">{item.emoji}</span>
            <span className="text-xs font-bold" style={{ color: countColor }}>
              {formatCount(item.count)}
            </span>
          </motion.div>
        )
      )}
    </motion.div>
  );
}