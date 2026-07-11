/**
 * Banuba SDK Checker - Simple diagnostic to verify SDK availability
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function BanubaCheck() {
  const navigate = useNavigate();
  const [status, setStatus] = useState({
    scriptLoaded: false,
    playerAvailable: false,
    tokenReceived: false,
    cameraStarted: false,
    errors: [],
  });

  useEffect(() => {
    const checkBanuba = async () => {
      console.log('[CHECK] Starting Banuba SDK check...');
      
      // Step 1: Load SDK script
      try {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = '/banuba/BanubaSDK.js';
          script.async = true;
          script.onload = () => {
            console.log('[CHECK] ✓ SDK script loaded');
            resolve();
          };
          script.onerror = () => {
            console.error('[CHECK] ❌ SDK script failed to load');
            reject(new Error('Script load failed'));
          };
          document.head.appendChild(script);
        });
        setStatus(prev => ({ ...prev, scriptLoaded: true }));
      } catch (e) {
        setStatus(prev => ({ ...prev, errors: [...prev.errors, `Script: ${e.message}`] }));
        return;
      }

      // Step 2: Check if BanubaPlayer is available
      if (typeof window.BanubaPlayer !== 'undefined') {
        console.log('[CHECK] ✓ BanubaPlayer available:', window.BanubaPlayer);
        setStatus(prev => ({ ...prev, playerAvailable: true }));
      } else {
        setStatus(prev => ({ ...prev, errors: ['BanubaPlayer not found in window'] }));
        return;
      }

      // Step 3: Get token
      try {
        const { base44 } = await import('@/api/base44Client');
        const res = await base44.functions.invoke('getBanubaToken', {});
        const token = res.data?.token;
        console.log('[CHECK] Token:', token ? token.substring(0, 20) + '...' : 'NULL');
        
        if (token) {
          setStatus(prev => ({ ...prev, tokenReceived: true }));
        } else {
          setStatus(prev => ({ ...prev, errors: ['Token is null'] }));
        }
      } catch (e) {
        setStatus(prev => ({ ...prev, errors: [`Token: ${e.message}`] }));
      }
    };

    checkBanuba();
  }, []);

  const allGood = status.scriptLoaded && status.playerAvailable && status.tokenReceived && status.errors.length === 0;

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[99] p-6">
      <h1 className="text-white font-bold text-xl mb-6">Banuba SDK Check</h1>
      
      <div className="w-full max-w-md space-y-3">
        <div className="flex items-center gap-3">
          {status.scriptLoaded ? (
            <CheckCircle className="w-5 h-5 text-green-400" />
          ) : status.errors.some(e => e.includes('Script')) ? (
            <XCircle className="w-5 h-5 text-red-400" />
          ) : (
            <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
          )}
          <span className="text-white text-sm">SDK Script Loaded</span>
        </div>

        <div className="flex items-center gap-3">
          {status.playerAvailable ? (
            <CheckCircle className="w-5 h-5 text-green-400" />
          ) : status.errors.some(e => e.includes('BanubaPlayer')) ? (
            <XCircle className="w-5 h-5 text-red-400" />
          ) : (
            <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
          )}
          <span className="text-white text-sm">BanubaPlayer Available</span>
        </div>

        <div className="flex items-center gap-3">
          {status.tokenReceived ? (
            <CheckCircle className="w-5 h-5 text-green-400" />
          ) : status.errors.some(e => e.includes('Token')) ? (
            <XCircle className="w-5 h-5 text-red-400" />
          ) : (
            <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
          )}
          <span className="text-white text-sm">Token Received</span>
        </div>

        {status.errors.length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <p className="text-red-400 text-xs font-bold mb-2">Errors:</p>
            {status.errors.map((err, i) => (
              <p key={i} className="text-red-300 text-xs">{err}</p>
            ))}
          </div>
        )}

        {allGood && (
          <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
            <p className="text-green-400 text-sm font-bold">✓ All checks passed!</p>
          </div>
        )}

        <button
          onClick={() => navigate('/create')}
          className="w-full mt-4 py-3 rounded-full font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)' }}>
          Go to Create Camera
        </button>
      </div>
    </div>
  );
}