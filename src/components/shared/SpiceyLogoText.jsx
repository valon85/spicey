import React from 'react';

/**
 * SpiceyLogoText — replaces plain "⚡ SPICEY +" text with the actual logo image.
 * Use wherever the header shows the SPICEY brand name.
 */
export default function SpiceyLogoText({ height = 120 }) {
  return (
    <img
      src="/spicey-assets/spicey-wordmark-20260722.png"
      alt="Spicey"
      style={{ height, width: 'auto', objectFit: 'contain', display: 'block' }}
    />
  );
}
