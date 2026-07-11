import React from 'react';
import { useNavigate } from 'react-router-dom';
import StoryCreator from '@/components/create/StoryCreator';

export default function CreateStoryVideo() {
  const navigate = useNavigate();
  return (
    <StoryCreator
      initialTab="video"
      onClose={() => navigate(-1)}
      onCapture={() => navigate('/')}
    />
  );
}