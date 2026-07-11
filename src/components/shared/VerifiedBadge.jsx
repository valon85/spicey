import React from 'react';

export default function VerifiedBadge({ type = 'verified', size = 'md', className = '' }) {
  const sizes = { sm: 14, md: 18, lg: 22, xl: 28 };
  const px = sizes[size] || 18;

  const colors = {
    business: ['#B8860B', '#FFD700'],
    creator:  ['#5E5CE6', '#C100FF'],
    verified: ['#1D9BF0', '#0070C9'],
    vip:      ['#9B30FF', '#6A0DAD'],
  };
  const [c1, c2] = colors[type] || colors.verified;
  const gradId = `vbg_${type}`;

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      className={className}
      title={type}
      style={{ display: 'inline-block', flexShrink: 0 }}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
      </defs>
      {/* Instagram exact badge shape — 16-pointed star */}
      <path
        d="M12 1L14.163 4.284L18.118 3.055L18.764 7.196L22.807 8.118L21.267 12L22.807 15.882L18.764 16.804L18.118 20.945L14.163 19.716L12 23L9.837 19.716L5.882 20.945L5.236 16.804L1.193 15.882L2.733 12L1.193 8.118L5.236 7.196L5.882 3.055L9.837 4.284Z"
        fill={`url(#${gradId})`}
      />
      {/* White checkmark */}
      <path
        d="M8 12.5L10.5 15L16 9.5"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}