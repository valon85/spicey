import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, User, Flame, Sparkles, Navigation } from 'lucide-react';

const FILTERS = [
  { id: 'all', label: 'All', icon: MapPin },
  { id: 'friends', label: 'Friends', icon: User },
  { id: 'live', label: 'Live', icon: Flame },
  { id: 'stories', label: 'Stories', icon: Sparkles },
  { id: 'nearby', label: 'Nearby', icon: Navigation },
];

export default function FilterChips({ activeFilter, onFilterChange }) {
  return (
    <div style={{
      display: 'flex',
      gap: 10,
      overflowX: 'auto',
      paddingBottom: 4,
      scrollbarWidth: 'none',
    }}>
      {FILTERS.map((filter) => {
        const Icon = filter.icon;
        const isActive = activeFilter === filter.id;
        return (
          <motion.button
            key={filter.id}
            whileTap={{ scale: 0.92 }}
            onClick={() => onFilterChange(filter.id)}
            style={{
              flexShrink: 0,
              height: 38,
              padding: '0 16px',
              borderRadius: 20,
              border: isActive ? '1px solid rgba(167,51,255,0.6)' : '1px solid rgba(255,255,255,0.12)',
              background: isActive
                ? 'linear-gradient(135deg, rgba(167,51,255,0.25), rgba(233,30,140,0.25))'
                : 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <Icon
              style={{
                width: 16,
                height: 16,
                color: isActive ? '#e91e8c' : 'rgba(255,255,255,0.5)',
              }}
            />
            <span
              style={{
                color: isActive ? 'white' : 'rgba(255,255,255,0.5)',
                fontSize: 13,
                fontWeight: isActive ? 700 : 600,
                whiteSpace: 'nowrap',
              }}
            >
              {filter.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}