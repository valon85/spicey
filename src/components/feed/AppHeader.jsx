import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Settings, Bell } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import SpiceLogo from '@/components/shared/SpiceLogo';
import SettingsSheet from '@/components/panels/SettingsSheet';

export default function AppHeader() {
  const navigate = useNavigate();
  const { missedCallsUnseen } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  return (
    <>
      <div className="sticky top-0 z-40 w-full" style={{
          background: 'linear-gradient(180deg, rgba(10,4,20,0.98) 0%, rgba(13,5,32,0.95) 100%)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          paddingTop: 'max(0.75rem, env(safe-area-inset-top))',
          paddingLeft: 'max(1rem, env(safe-area-inset-left))',
          paddingRight: 'max(1rem, env(safe-area-inset-right))',
        }}>
        
        <div className="flex items-center justify-center px-4 py-3 max-w-7xl mx-auto gap-3">
          <div className="absolute left-1/2 -translate-x-1/2">
            <SpiceLogo centerMode={true} />
          </div>
          
          <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-full max-w-xs"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Search className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.4)' }} />
            <input 
              type="text" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..." 
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: 'white', placeholderColor: 'rgba(255,255,255,0.3)' }}
            />
          </form>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate('/notifications')}
              className="w-9 h-9 rounded-full flex items-center justify-center relative"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Bell className="w-4 h-4 text-white/60" />
              {missedCallsUnseen > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">
                  {missedCallsUnseen}
                </span>
              )}
            </button>
            <button 
              onClick={() => setSettingsOpen(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Settings className="w-4 h-4 text-white/60" />
            </button>
          </div>
        </div>
      </div>

      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
