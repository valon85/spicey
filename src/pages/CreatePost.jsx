/**
 * CreatePost — Full Spicey-style Camera
 * All features: effects, gallery, music, location, text, tags
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import SpiceyCamera from '@/components/camera/SpiceyCamera.jsx';

export default function CreatePost() {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/');
  };

  const openBanubaTest = () => {
    navigate('/banuba-simple');
  };

  return (
    <div className="relative">
      <SpiceyCamera onClose={handleClose} />
      
      {/* Banuba Test Button - Visible in TestFlight */}
      <button
        onClick={openBanubaTest}
        className="absolute bottom-24 right-4 z-[100] px-4 py-2 rounded-full text-xs font-bold"
        style={{
          background: 'rgba(255,85,0,0.9)',
          color: 'white',
          border: '2px solid rgba(255,255,255,0.3)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 20px rgba(255,85,0,0.4)'
        }}
      >
        🔍 Banuba Test
      </button>
    </div>
  );
}
