/**
 * AITalkDebugPanel — Real-time debug overlay for testing
 * Shows: connection status, audio amplitude, events, latency
 * Toggle with debug button in AITalkMode
 */
import React from 'react';

export default function AITalkDebugPanel({
  isOpen,
  onClose,
  debugLogs,
  voiceLevel,
  wsConnected,
  status,
  isSpeaking,
  isListening,
  reconnectCount,
  connectionTime,
  sessionId,
  isLightMode,
}) {
  if (!isOpen) return null;

  const cardBg = isLightMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.07)';
  const cardBorder = isLightMode ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.1)';
  const textColor = isLightMode ? '#111' : '#fff';
  const subColor = isLightMode ? '#888' : 'rgba(255,255,255,0.45)';

  return (
    <div style={{
      position: 'fixed',
      top: 'max(60px, calc(env(safe-area-inset-top) + 60px))',
      left: 10, right: 10,
      zIndex: 10000,
      borderRadius: 16,
      padding: 12,
      background: isLightMode ? 'rgba(255,255,255,0.98)' : 'rgba(6,0,15,0.98)',
      border: cardBorder,
      backdropFilter: 'blur(16px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      color: textColor,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 10, paddingBottom: 8, borderBottom: cardBorder,
      }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#FF7A8F' }}>
          🐛 DEBUG PANEL
        </span>
        <button onClick={onClose} style={{
          width: 24, height: 24, borderRadius: '50%',
          background: cardBg, border: cardBorder,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}>
          <span style={{ fontSize: 14, color: subColor }}>✕</span>
        </button>
      </div>

      {/* Connection Status */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: subColor, marginBottom: 4 }}>CONNECTION</div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px',
          borderRadius: 8, background: wsConnected ? 'rgba(0,200,100,0.15)' : 'rgba(255,100,100,0.15)',
          border: wsConnected ? '1px solid rgba(0,200,100,0.3)' : '1px solid rgba(255,100,100,0.3)',
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: wsConnected ? '#00c864' : '#ff6464',
            boxShadow: wsConnected ? '0 0 12px #00c864' : '0 0 12px #ff6464',
          }} />
          <span style={{ fontSize: 11, fontWeight: 700 }}>
            {wsConnected ? '✅ CONNECTED' : '❌ DISCONNECTED'}
          </span>
        </div>
        {sessionId && (
          <div style={{ fontSize: 9, color: subColor, marginTop: 3 }}>
            Session: {sessionId.substring(0, 16)}...
          </div>
        )}
        {connectionTime && (
          <div style={{ fontSize: 9, color: subColor }}>
            Connected at: {connectionTime}
          </div>
        )}
        {reconnectCount > 0 && (
          <div style={{ fontSize: 9, color: '#ffa500', marginTop: 2 }}>
            ⚠️ Reconnections: {reconnectCount}
          </div>
        )}
      </div>

      {/* Audio Level */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: subColor, marginBottom: 4 }}>AUDIO AMPLITUDE</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            flex: 1, height: 24, borderRadius: 6, overflow: 'hidden',
            background: isLightMode ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.4)',
          }}>
            <div style={{
              width: `${Math.min(voiceLevel * 100, 100)}%`,
              height: '100%',
              background: `linear-gradient(90deg, #FF00FF, #FF8C00)`,
              transition: 'width 0.05s',
              borderRadius: 6,
            }} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, minWidth: 45, textAlign: 'right' }}>
            {(voiceLevel * 100).toFixed(0)}%
          </span>
        </div>
        <div style={{ fontSize: 9, color: subColor, marginTop: 2 }}>
          Status: {isSpeaking ? '🔊 AI Speaking' : isListening ? '🎤 Listening' : status}
        </div>
      </div>

      {/* Event Log */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: subColor, marginBottom: 4 }}>EVENT LOG</div>
        <div style={{
          maxHeight: 140, overflowY: 'auto',
          borderRadius: 8, padding: 6,
          background: isLightMode ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.3)',
          border: cardBorder,
        }}>
          {debugLogs.length === 0 ? (
            <div style={{ fontSize: 9, color: subColor, fontStyle: 'italic', padding: 4 }}>
              No events yet...
            </div>
          ) : (
            debugLogs.slice().reverse().map((log, i) => (
              <div key={i} style={{
                fontSize: 9,
                padding: '3px 6px',
                marginBottom: 2,
                borderRadius: 4,
                background: log.type === 'error' ? 'rgba(255,100,100,0.15)' :
                           log.type === 'success' ? 'rgba(0,200,100,0.15)' :
                           'transparent',
                color: log.type === 'error' ? '#ff6464' :
                       log.type === 'success' ? '#00c864' :
                       (isLightMode ? '#333' : 'rgba(255,255,255,0.75)'),
                borderLeft: log.type === 'error' ? '2px solid #ff6464' :
                           log.type === 'success' ? '2px solid #00c864' :
                           '2px solid transparent',
              }}>
                <span style={{ color: subColor }}>[{log.time}]</span> {log.msg}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Test Status */}
      <div style={{
        marginTop: 10, paddingTop: 8, borderTop: cardBorder,
        fontSize: 9, color: subColor, textAlign: 'center',
      }}>
        📱 Test on iPhone for accurate results
      </div>
    </div>
  );
}