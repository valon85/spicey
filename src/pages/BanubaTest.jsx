/**
 * Banuba Test Page — Real Banuba Face AR SDK
 * Professional face tracking, beauty effects, AR masks/lenses
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import BanubaFaceARCamera from '@/components/camera/BanubaFaceARCamera';

export default function BanubaTest() {
  const navigate = useNavigate();

  return (
    <BanubaFaceARCamera 
      onClose={() => navigate('/')}
      onCapture={(photoUrl) => {
        console.log('[BanubaTest] Photo captured:', photoUrl);
      }}
    />
  );
}