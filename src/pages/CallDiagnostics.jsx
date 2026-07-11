import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Phone, Video, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function CallDiagnostics() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [logs, setLogs] = useState([]);
  const [testReceiverId, setTestReceiverId] = useState('');

  const addLog = (msg) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  useEffect(() => {
    base44.auth.me().then(async u => {
      setUser(u);
      if (u) {
        const profiles = await base44.entities.UserProfile.filter({ user_id: u.id }, '-created_date', 1);
        setProfile(profiles[0]);
        addLog(`User: ${u.email}, ID: ${u.id}`);
        if (profiles[0]) {
          addLog(`VoIP token exists: ${!!profiles[0].voip_push_token}`);
          addLog(`VoIP token length: ${profiles[0].voip_push_token?.length || 0}`);
          addLog(`VoIP token prefix: ${profiles[0].voip_push_token?.substring(0, 16) || 'N/A'}`);
          addLog(`Push token exists: ${!!profiles[0].push_token}`);
        }
      }
    });
  }, []);

  const testCall = async (type) => {
    if (!testReceiverId) {
      addLog('❌ Please enter receiver user ID');
      return;
    }
    
    addLog(`📞 Starting ${type} call to ${testReceiverId}...`);
    
    try {
      const res = await base44.functions.invoke('initiateCall', {
        receiver_id: testReceiverId,
        type: type,
      });
      
      if (res.data?.call_session) {
        addLog(`✅ Call session created: ${res.data.call_session.id}`);
        addLog(`Status: ${res.data.call_session.status}`);
      } else {
        addLog('❌ No call session returned');
      }
    } catch (err) {
      addLog(`❌ Error: ${err.message}`);
      if (err.response?.data) {
        addLog(`Details: ${JSON.stringify(err.response.data)}`);
      }
    }
  };

  const checkActiveCalls = async () => {
    try {
      const calls = await base44.entities.CallSession.filter(
        { $or: [{ caller_id: user?.id }, { receiver_id: user?.id }] },
        '-created_date',
        10
      );
      addLog(`📋 Found ${calls.length} active/recent calls`);
      calls.forEach(c => {
        addLog(`  - ${c.type} call: ${c.status} (ID: ${c.id.substring(0,8)}...)`);
      });
    } catch (err) {
      addLog(`❌ Error fetching calls: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-pink-600 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">🔍 Call Diagnostics</h1>
        
        {/* User Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <h2 className="font-semibold text-gray-700 mb-2">User Info</h2>
          {user ? (
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Email: {user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>ID: {user.id}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="w-4 h-4" />
              <span>Not logged in</span>
            </div>
          )}
        </div>

        {/* Profile & Tokens */}
        {profile && (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <h2 className="font-semibold text-gray-700 mb-2">Push Tokens</h2>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                {profile.voip_push_token ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span>VoIP Token: {profile.voip_push_token?.length || 0} chars</span>
              </div>
              {profile.voip_push_token && (
                <div className="ml-6 text-gray-500">
                  {profile.voip_push_token.substring(0, 32)}...
                </div>
              )}
              
              <div className="flex items-center gap-2">
                {profile.push_token ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span>Push Token: {profile.push_token?.length || 0} chars</span>
              </div>
            </div>
          </div>
        )}

        {/* Test Call */}
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <h2 className="font-semibold text-gray-700 mb-3">Test Call</h2>
          <input
            type="text"
            placeholder="Enter receiver user ID"
            value={testReceiverId}
            onChange={e => setTestReceiverId(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg mb-3 text-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={() => testCall('video')}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              <Video className="w-4 h-4" />
              Video Call
            </button>
            <button
              onClick={() => testCall('voice')}
              className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Voice Call
            </button>
          </div>
          <button
            onClick={checkActiveCalls}
            className="w-full mt-2 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold text-sm"
          >
            📋 Check Active Calls
          </button>
        </div>

        {/* Logs */}
        <div className="p-4 bg-black rounded-xl">
          <h2 className="font-semibold text-white mb-2">📜 Logs</h2>
          <div className="text-xs text-green-400 font-mono space-y-1 max-h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500">No logs yet</div>
            ) : (
              logs.map((log, i) => (
                <div key={i}>{log}</div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}