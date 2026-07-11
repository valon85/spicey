import React from 'react';

const FILTERS = [
  { name: 'Normal',   style: 'none' },
  { name: 'Vivid',    style: 'saturate(1.8) contrast(1.1)' },
  { name: 'Warm',     style: 'sepia(0.4) saturate(1.4) brightness(1.05)' },
  { name: 'Cool',     style: 'hue-rotate(20deg) saturate(1.2) brightness(1.05)' },
  { name: 'Fade',     style: 'opacity(0.85) brightness(1.1) saturate(0.8)' },
  { name: 'Noir',     style: 'grayscale(1) contrast(1.2)' },
  { name: 'Moody',    style: 'brightness(0.85) contrast(1.15) saturate(1.2)' },
  { name: 'Golden',   style: 'sepia(0.6) saturate(1.6) brightness(1.1) contrast(0.95)' },
  { name: 'Dreamy',   style: 'brightness(1.1) saturate(0.7) blur(0.3px)' },
];

export default function PhotoFilters({ previewUrl, selectedFilter, onSelect }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {FILTERS.map((f) => (
        <button
          key={f.name}
          onClick={() => onSelect(f)}
          className="flex flex-col items-center gap-1.5 flex-shrink-0"
        >
          <div
            className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${selectedFilter.name === f.name ? 'border-orange-500 scale-105' : 'border-transparent'}`}
            style={{ boxShadow: selectedFilter.name === f.name ? '0 0 10px rgba(249,115,22,0.6)' : 'none' }}
          >
            <img
              src={previewUrl}
              alt={f.name}
              className="w-full h-full object-cover"
              style={{ filter: f.style }}
            />
          </div>
          <span className={`text-[10px] font-semibold ${selectedFilter.name === f.name ? 'text-orange-400' : 'text-muted-foreground'}`}>
            {f.name}
          </span>
        </button>
      ))}
    </div>
  );
}