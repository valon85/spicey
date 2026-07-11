import React, { createContext, useContext, useState } from 'react';

const AIContext = createContext(null);

export function AIProvider({ children }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  // Shared phase so MiniPlayer can reflect speaking/listening/processing
  const [phase, setPhase] = useState('stopped');

  const minimize = () => setIsMinimized(true);
  const maximize = () => setIsMinimized(false);
  const close = () => {
    setIsOpen(false);
    setIsMinimized(false);
    setPhase('stopped');
  };
  const open = () => {
    setIsOpen(true);
    setIsMinimized(false);
  };

  return (
    <AIContext.Provider value={{
      isMinimized,
      isOpen,
      phase,
      setPhase,
      minimize,
      maximize,
      close,
      open,
    }}>
      {children}
    </AIContext.Provider>
  );
}

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) throw new Error('useAI must be used within AIProvider');
  return context;
};