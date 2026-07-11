import React, { useEffect, useState } from 'react';

export default function SpiceLogo({ size = 'md', centerMode = false }) {
  const [isLightMode, setIsLightMode] = React.useState(false);

  React.useEffect(() => {
    const checkMode = () => setIsLightMode(document.documentElement.classList.contains('light-mode'));
    checkMode();
    const observer = new MutationObserver(checkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  
  if (centerMode) {
    return (
      <div className="flex items-center justify-center p-2 rounded-2xl" style={{ background: '#000000' }}>
        <img
          src={isLightMode 
            ? 'https://media.base44.com/images/public/69fe90d3bbe7ad47925e4a0a/1aa240028_50A9D3F7-0D67-4D21-B414-5D15EA69C74A.png'
            : 'https://media.base44.com/images/public/69fe90d3bbe7ad47925e4a0a/4a4e2edb4_SpiceyLogo.png'
          }
          alt="SPICEY"
          className="h-10 object-contain"
        />
      </div>
    );
  }

  const logoH = size === 'sm' ? 130 : 150;

  return (
    <img
      src="https://media.base44.com/images/public/69fe90d3bbe7ad47925e4a0a/a7812bd9b_841b8be5-b1e6-4719-9a32-36fafbb51084.png"
      alt="SPICEY"
      style={{ height: logoH, width: 'auto', objectFit: 'contain' }}
    />
  );
}