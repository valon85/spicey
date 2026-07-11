import React, { useState } from 'react';
import { Phone } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

export default function TestCallButton() {
  const [loading, setLoading] = useState(false);
  const { setIncomingCall } = useAuth();

  const triggerTestCall = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      
      console.log('[TEST] Triggering test incoming call for user:', user.id);
      
      // Directly set incoming call in AuthContext
      setIncomingCall({
        id: 'test_call_' + Date.now(),
        caller_id: 'test_user_123',
        receiver_id: user.id,
        type: 'video',
        status: 'ringing',
        callerName: 'Test Caller',
        callerAvatar: 'https://ui-avatars.com/api/?name=Test&background=ff6400&color=fff&size=100',
      });

      console.log('[TEST] Incoming call set! Check if modal appears.');
    } catch (error) {
      console.error('[TEST] Error:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={triggerTestCall}
      disabled={loading}
      style={{
        position: 'fixed',
        top: '100px',
        right: '20px',
        zIndex: 40,
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        boxShadow: '0 4px 20px rgba(59,130,246,0.6)',
        border: '3px solid white',
        cursor: 'pointer',
      }}
      title="Test incoming call">
      <Phone className="w-8 h-8 text-white" />
    </button>
  );
}