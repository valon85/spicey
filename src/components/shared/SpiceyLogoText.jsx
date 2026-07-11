import React from 'react';

/**
 * SpiceyLogoText — replaces plain "⚡ SPICEY +" text with the actual logo image.
 * Use wherever the header shows the SPICEY brand name.
 */
export default function SpiceyLogoText({ height = 120 }) {
  return (
    <img
      src="https://media.base44.com/images/public/69fe90d3bbe7ad47925e4a0a/55bf52a6a_841b8be5-b1e6-4719-9a32-36fafbb51084.png"
      alt="SPICEY"
      style={{ height, width: 'auto', objectFit: 'contain', display: 'block' }}
    />
  );
}