import React from 'react';

export default function VerifiedBadge({ type = 'verified', size = 'md', className = '' }) {
  const sizes = { sm: 14, md: 18, lg: 22, xl: 28 };
  const px = sizes[size] || 18;

  const colors = {
    business: ['#B8860B', '#FFD700'],
    creator:  ['#5E5CE6', '#C100FF'],
    verified: ['#1D9BF0', '#0070C9'],
    vip:      ['#1D9BF0', '#0A84FF'],
  };
  const [c1, c2] = colors[type] || colors.verified;
  const gradId = `vbg_${type}`;

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      className={`spicey-verified-badge ${className}`.trim()}
      title={type}
      style={{ display: 'block', flexShrink: 0, verticalAlign: 'middle' }}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
      </defs>
      {/* Instagram/X-style verified rosette, without any outer circular container. */}
      <path
        d="M22.25 12c0-1.43-.88-2.67-2.13-3.2.5-1.35.12-2.9-.9-3.91-1.01-1.02-2.56-1.4-3.91-.9C14.67 2.63 13.43 1.75 12 1.75s-2.67.88-3.2 2.13c-1.35-.5-2.9-.12-3.91.9-1.02 1.01-1.4 2.56-.9 3.91C2.63 9.33 1.75 10.57 1.75 12s.88 2.67 2.13 3.2c-.5 1.35-.12 2.9.9 3.91 1.01 1.02 2.56 1.4 3.91.9.64 1.36 1.88 2.24 3.31 2.24s2.67-.88 3.2-2.13c1.35.5 2.9.12 3.91-.9 1.02-1.01 1.4-2.56.9-3.91 1.36-.64 2.24-1.88 2.24-3.31Z"
        fill={`url(#${gradId})`}
      />
      {/* White checkmark */}
      <path
        d="M7.5 12.25l2.85 2.85 6.15-6.2"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
