/**
 * RPMAvatarCreator — embeds the Ready Player Me iframe avatar creator.
 * On completion, returns a real GLB URL via postMessage.
 *
 * Ready Player Me iframe docs:
 *   https://docs.readyplayer.me/ready-player-me/integration-guides/web-and-native-integration
 *
 * The iframe posts: { source: 'readyplayerme', eventName: 'v1.avatar.exported', data: { url: 'https://models.readyplayer.me/<id>.glb' } }
 */
import React, { useEffect, useRef, useState } from 'react';
import { X, Loader } from 'lucide-react';

// Use the public "demo" subdomain — works without an API key.
// Replace "demo" with your own RPM subdomain from studio.readyplayer.me for branding.
const RPM_SUBDOMAIN = 'demo';

const RPM_URL = `https://${RPM_SUBDOMAIN}.readyplayer.me/avatar?frameApi&clearCache`;

export default function RPMAvatarCreator({ onAvatarExported, onClose }) {
  const iframeRef = useRef(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [status, setStatus] = useState('loading'); // loading | ready | exporting | done

  useEffect(() => {
    const handleMessage = (event) => {
      // Only accept from readyplayer.me
      if (!event.origin.includes('readyplayer.me')) return;

      let json;
      try {
        json = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      } catch {
        return;
      }

      console.log('[RPM] message:', json?.eventName, json?.data?.url?.substring(0, 80));

      if (json?.eventName === 'v1.frame.ready') {
        setStatus('ready');
        // Subscribe to avatar export events
        iframeRef.current?.contentWindow?.postMessage(
          JSON.stringify({ target: 'readyplayerme', type: 'subscribe', eventName: 'v1.avatar.exported' }),
          '*'
        );
      }

      if (json?.eventName === 'v1.avatar.exported') {
        const glbUrl = json?.data?.url;
        if (glbUrl) {
          setStatus('done');
          // Append quality params to get a production-ready GLB
          const optimizedUrl = glbUrl.includes('?')
            ? `${glbUrl}&quality=high&morphTargets=ARKit,Oculus+Visemes&lod=0`
            : `${glbUrl}?quality=high&morphTargets=ARKit,Oculus+Visemes&lod=0`;
          onAvatarExported(optimizedUrl);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onAvatarExported]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#050008',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 16px', paddingTop: 'max(20px, env(safe-area-inset-top))',
        background: 'rgba(5,0,8,0.9)', borderBottom: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Create 3D Avatar</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
            {status === 'loading' ? 'Loading avatar creator…' :
             status === 'ready' ? 'Customize your avatar, then tap Done' :
             status === 'exporting' ? 'Saving your avatar…' :
             '✓ Avatar saved!'}
          </div>
        </div>
        <button onClick={onClose} style={{
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '50%', width: 36, height: 36,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', cursor: 'pointer',
        }}>
          <X size={18} />
        </button>
      </div>

      {/* Loading overlay */}
      {!iframeLoaded && (
        <div style={{
          position: 'absolute', top: '60px', left: 0, right: 0, bottom: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: '#050008', zIndex: 1,
        }}>
          <div style={{ width: 40, height: 40, border: '3px solid rgba(255,106,0,0.2)', borderTopColor: '#FF6A00', borderRadius: '50%', animation: 'rpmSpin 0.8s linear infinite' }} />
          <div style={{ marginTop: 14, fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>Loading Ready Player Me…</div>
          <div style={{ marginTop: 6, fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>This may take a few seconds</div>
        </div>
      )}

      {/* RPM iframe */}
      <iframe
        ref={iframeRef}
        src={RPM_URL}
        title="Ready Player Me Avatar Creator"
        allow="camera *; microphone *; clipboard-write"
        onLoad={() => setIframeLoaded(true)}
        style={{
          flex: 1, border: 'none', width: '100%',
          opacity: iframeLoaded ? 1 : 0,
          transition: 'opacity 0.3s',
        }}
      />

      <style>{`@keyframes rpmSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}