import React from 'react';
import { Toaster } from "sonner";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { ThemeProvider } from '@/lib/ThemeContext';
import AuthLoader from '@/components/AuthLoader';
import SpiceyAuthModal from '@/components/SpiceyAuthModal';
import Feed from './pages/Feed.jsx';
import Explore from './pages/Explore';
import Profile from './pages/Profile.jsx';
import Messages from './pages/Messages';
import ContactsMap from './pages/ContactsMap';
import SpiceyReels from './pages/SpiceyReels.jsx';
import Notifications from './pages/Notifications';
import AccountSettings from './pages/AccountSettings';
import LiveStream from './pages/LiveStream.jsx';
import LiveWatcher from './pages/LiveWatcher.jsx';
import CreatePost from './pages/CreatePost.jsx';
import AIGenerator from './pages/AIGenerator.jsx';
import CreateTextPost from './pages/CreateTextPost';
import CreateVideoPost from './pages/CreateVideoPost';
import CreatePhotoPost from './pages/CreatePhotoPost';
import CallDiagnostics from './pages/CallDiagnostics';
import AdminPresetAvatars from './pages/AdminPresetAvatars';
import AvatarCreator from './pages/AvatarCreator';
import GlobalIncomingCallHandler from '@/components/panels/GlobalIncomingCallHandler';
import CallSheet from '@/components/panels/CallSheet';
import MissedCallBanner from '@/components/panels/MissedCallBanner';
import IOSInstallPrompt from '@/components/panels/IOSInstallPrompt';
import NotificationPermissionBanner from '@/components/panels/NotificationPermissionBanner';
import PushNotificationProvider from '@/components/PushNotificationProvider';
import VoIPProvider from '@/components/VoIPProvider';
import BottomNav from '@/components/feed/BottomNav';
import WebLayout from '@/components/shared/WebLayout';
import IOSDebug from './pages/IOSDebug';
import SupabaseTest from './pages/SupabaseTest';
import SpiceyVIP from './pages/SpiceyVIP';
import VIPDashboard from './pages/VIPDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminModerationPanel from './pages/AdminModerationPanel';
import AdminCommunicationCenter from './pages/AdminCommunicationCenter';
import AdminVIPManagement from './pages/AdminVIPManagement';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import AdminContentManagement from './pages/AdminContentManagement';
import AdminEmailAutomation from './pages/AdminEmailAutomation';
import AdminBackup from './pages/AdminBackup';
import AdminAIPanel from './pages/AdminAIPanel';
import AdminVideoLibrary from './pages/AdminVideoLibrary';
import AdminBulkImportVideos from './pages/AdminBulkImportVideos';
import AdminPushDiagnostics from './pages/AdminPushDiagnostics';
import AdminCuratedReels from './pages/AdminCuratedReels';
import AdminReleaseCenter from './pages/AdminReleaseCenter';
import AdminVisualEditor from './pages/AdminVisualEditor';
import HomeFeedV2Test from './pages/HomeFeedV2Test';
import HomeFeedV3Experimental from './pages/HomeFeedV3Experimental';
import GiftVIPAccess from './pages/GiftVIPAccess';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import CommunityGuidelines from './pages/CommunityGuidelines';
import { hasAdminAccess } from '@/lib/adminAccess';

function RequireAdmin({ user, children }) {
  if (!hasAdminAccess(user)) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5" style={{ background: 'rgb(6,3,10)', color: 'white' }}>
        <div className="w-full max-w-sm rounded-3xl p-6 text-center" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
          <h1 className="text-xl font-extrabold mb-2">Admin access needed</h1>
          <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Log in with the admin account to use Visual Editor.
          </p>
          <a
            href="/"
            className="block w-full py-3 rounded-2xl font-extrabold text-white"
            style={{ background: 'linear-gradient(135deg, #ff5500, #e91e8c)' }}
          >
            Home Feed
          </a>
        </div>
      </div>
    );
  }
  return children;
}

function isPasswordResetUrl(location) {
  if (location.pathname.startsWith('/auth/reset-password')) return true;
  if (typeof window === 'undefined') return false;
  const hashParams = new URLSearchParams((window.location.hash || '').replace(/^#/, ''));
  const searchParams = new URLSearchParams(location.search || window.location.search || '');
  const type = hashParams.get('type') || searchParams.get('type');
  return type === 'recovery'
    || !!searchParams.get('token_hash')
    || !!hashParams.get('token_hash')
    || !!(hashParams.get('access_token') && hashParams.get('refresh_token'));
}

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const isPasswordResetRoute = isPasswordResetUrl(location);
  const { isLoadingAuth, user, authChecked, activeCall, endCall } = useAuth();
  const [callSheetOpen, setCallSheetOpen] = React.useState(false);
  const renderCountRef = React.useRef(0);
  renderCountRef.current += 1;
  const hasConfirmedUser = !!(user?.id && !String(user.id).startsWith('pending_'));

  // ── DIAGNOSTIC LOGS ──────────────────────────────────────────────────────
  const isNativeIOS = typeof window !== 'undefined' && ['capacitor:', 'spicey:'].includes(window.location.protocol);
  const isDesktopWeb = typeof window !== 'undefined'
    && !isNativeIOS
    && window.matchMedia('(min-width: 1024px)').matches;
  const lsToken = typeof window !== 'undefined' && (localStorage.getItem('spicey_session') || localStorage.getItem('token'));
  const localSearchParams = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams();
  const isLocalFeedPreview = typeof window !== 'undefined'
    && ['localhost', '127.0.0.1'].includes(window.location.hostname)
    && (
      localSearchParams.get('preview') === 'feed'
      || localSearchParams.get('previewTheme') === 'light'
      || window.location.pathname === '/'
    );
  const isLocalChatPreview = typeof window !== 'undefined'
    && ['localhost', '127.0.0.1'].includes(window.location.hostname)
    && localSearchParams.get('chatPreview') === '1'
    && window.location.pathname === '/messages';
  const isLocalProfilePreview = typeof window !== 'undefined'
    && ['localhost', '127.0.0.1'].includes(window.location.hostname)
    && window.location.pathname.startsWith('/profile');

  console.log(`APP_RENDER #${renderCountRef.current}`, {
    userExists: !!user,
    userId: user?.id || 'none',
    authChecked,
    isLoadingAuth,
    isNativeIOS,
    lsTokenExists: !!lsToken,
    showAuth: !user && authChecked && !isLoadingAuth,
  });
  // ─────────────────────────────────────────────────────────────────────────

  // Hide BottomNav on chat and creation pages
  const HIDE_NAV_PATHS = ['/admin', '/live', '/avatar-creator', '/create-story-photo', '/create-story-video', '/create-story-video-upload', '/create-text-story', '/create-photo', '/create-video', '/create-text', '/reels', '/create', '/messages'];
  const hideNav = HIDE_NAV_PATHS.some(p => location.pathname.startsWith(p));

  React.useEffect(() => {
    if (activeCall) setCallSheetOpen(true);
    else setCallSheetOpen(false);
  }, [activeCall]);

  React.useEffect(() => {
    if (!isNativeIOS) return undefined;
    let listener;
    CapacitorApp.addListener('appUrlOpen', ({ url }) => {
      try {
        const parsed = new URL(url);
        const path = `${parsed.pathname || '/'}${parsed.search || ''}${parsed.hash || ''}`;
        navigate(path, { replace: true });
      } catch (error) {
        console.warn('[DEEPLINK] Could not parse app URL:', url, error?.message);
      }
    }).then(handle => {
      listener = handle;
    }).catch(error => {
      console.warn('[DEEPLINK] Listener failed:', error?.message);
    });

    return () => {
      if (listener?.remove) listener.remove();
    };
  }, [isNativeIOS, navigate]);

  const handleCallSheetClose = () => {
    setCallSheetOpen(false);
    endCall();
  };
  const adminPage = (element) => <RequireAdmin user={user}>{element}</RequireAdmin>;

  // ════════════════════════════════════════════════════════════
  // iOS QUICK RENDER - Show Feed immediately with full routing
  // ════════════════════════════════════════════════════════════
  const hasToken = !!lsToken;

  if (isPasswordResetRoute) {
    return <SpiceyAuthModal />;
  }

  // Legal documents must remain readable before login and during review.
  const publicLegalPages = {
    '/privacy': <PrivacyPolicy />,
    '/privacy-policy': <PrivacyPolicy />,
    '/terms': <TermsOfService />,
    '/terms-of-service': <TermsOfService />,
    '/guidelines': <CommunityGuidelines />,
    '/community-guidelines': <CommunityGuidelines />,
  };
  if (publicLegalPages[location.pathname]) return publicLegalPages[location.pathname];

  if (isNativeIOS && !hasConfirmedUser && (isLoadingAuth || !authChecked)) {
    console.log('RETURN_LOADING - iOS checking stored session before login');
    return <AuthLoader />;
  }

  if (isNativeIOS && hasConfirmedUser) {
    console.log('RETURN_FEED - iOS confirmed session with routing');
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', width: '100vw', overscrollBehavior: 'none', position: 'relative', zIndex: 0 }}>
        <div id="main-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain', paddingBottom: hideNav ? 0 : 'calc(72px + env(safe-area-inset-bottom, 0px))', position: 'relative', zIndex: 1 }}>
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/map" element={<ContactsMap />} />
            <Route path="/contacts-map" element={<ContactsMap />} />
            <Route path="/reels" element={<SpiceyReels />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<AccountSettings />} />
            <Route path="/live" element={<LiveStream />} />
            <Route path="/live/watch" element={<LiveWatcher />} />
            <Route path="/create" element={<CreatePost />} />
            <Route path="/create-text" element={<CreateTextPost />} />
            <Route path="/create-video" element={<CreateVideoPost />} />
            <Route path="/create-photo" element={<CreatePhotoPost />} />
            <Route path="/ai" element={<AIGenerator />} />
            <Route path="/call-diag" element={<CallDiagnostics />} />
            <Route path="/admin/preset-avatars" element={adminPage(<AdminPresetAvatars />)} />
            <Route path="/avatar-creator" element={<AvatarCreator />} />
            <Route path="/ios-debug" element={<IOSDebug />} />
            <Route path="/supabase-test" element={<SupabaseTest />} />
            <Route path="/vip" element={<SpiceyVIP />} />
            <Route path="/vip-dashboard" element={<VIPDashboard />} />
            <Route path="/admin" element={adminPage(<AdminDashboard />)} />
            <Route path="/admin/dashboard" element={adminPage(<AdminDashboard />)} />
            <Route path="/admin/super" element={adminPage(<SuperAdminDashboard />)} />
            <Route path="/admin/users" element={adminPage(<AdminUsers />)} />
            <Route path="/admin/moderation" element={adminPage(<AdminModerationPanel />)} />
            <Route path="/admin/comms" element={adminPage(<AdminCommunicationCenter />)} />
            <Route path="/admin/vip-management" element={adminPage(<AdminVIPManagement />)} />
            <Route path="/admin/gift-vip" element={adminPage(<GiftVIPAccess />)} />
            <Route path="/admin/email-automation" element={adminPage(<AdminEmailAutomation />)} />
            <Route path="/admin/backup" element={adminPage(<AdminBackup />)} />
            <Route path="/admin/ai" element={adminPage(<AdminAIPanel />)} />
            <Route path="/admin/video-library" element={adminPage(<AdminVideoLibrary />)} />
            <Route path="/admin/bulk-import" element={adminPage(<AdminBulkImportVideos />)} />
            <Route path="/admin/content" element={adminPage(<AdminContentManagement />)} />
            <Route path="/admin/push-diagnostics" element={adminPage(<AdminPushDiagnostics />)} />
            <Route path="/admin/curated-reels" element={adminPage(<AdminCuratedReels />)} />
            <Route path="/admin/release" element={adminPage(<AdminReleaseCenter />)} />
            <Route path="/admin/visual-editor" element={adminPage(<AdminVisualEditor />)} />
            <Route path="/admin/home-feed-v2" element={adminPage(<HomeFeedV2Test />)} />
            <Route path="/admin/home-feed-v3" element={adminPage(<HomeFeedV3Experimental />)} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/guidelines" element={<CommunityGuidelines />} />
            <Route path="/community-guidelines" element={<CommunityGuidelines />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </div>
        <NotificationPermissionBanner />
        <MissedCallBanner />
        <IOSInstallPrompt />
        <GlobalIncomingCallHandler />
        <PushNotificationProvider />
        <VoIPProvider />
        {callSheetOpen && activeCall && (
          <CallSheet open={callSheetOpen} onClose={handleCallSheetClose} convo={{
            userId: activeCall.isIncoming ? activeCall.caller_id : activeCall.receiver_id,
            name: activeCall.isIncoming ? (activeCall.callerName || 'Unknown') : (activeCall.receiverName || 'Unknown'),
            img: activeCall.isIncoming ? (activeCall.callerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeCall.callerName || 'U')}&background=1a0a2e&color=fff&size=120`) : (activeCall.receiverAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeCall.receiverName || 'U')}&background=1a0a2e&color=fff&size=120`),
          }} isVideo={activeCall.type === 'video'} isIncoming={activeCall.isIncoming} callSession={{ id: activeCall.id, status: activeCall.status }} />
        )}
        {!hideNav && <BottomNav />}
      </div>
    );
  }

  if (isNativeIOS && !hasConfirmedUser) {
    console.log('RETURN_AUTH - iOS has no confirmed user, showing login');
    return <SpiceyAuthModal />;
  }
  // ════════════════════════════════════════════════════════════

  if (isLocalChatPreview) {
    console.log('RETURN_CHAT_PREVIEW - local chat preview bypass');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', width: '100vw', overflow: 'hidden', background: '#050407', position: 'relative', zIndex: 0 }}>
        <Routes>
          <Route path="/messages" element={<Messages />} />
          <Route path="*" element={<Messages />} />
        </Routes>
      </div>
    );
  }

  // Normal auth check: a stored token alone is not enough to render the app.
  // Feed opens only with a confirmed user, except explicit local preview URLs.
  const isAuth = !!(hasConfirmedUser || isLocalFeedPreview || isLocalChatPreview || isLocalProfilePreview);

  if ((isLocalFeedPreview || isLocalChatPreview || isLocalProfilePreview) && (isLoadingAuth || !authChecked)) {
    console.log('RETURN_PREVIEW - local preview bypass while auth initializes');
    const previewShell = (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', width: isDesktopWeb ? '100%' : '100vw', overscrollBehavior: 'none', position: 'relative', zIndex: 0 }}>
        <div id="main-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain', paddingBottom: hideNav ? 0 : 'calc(72px + env(safe-area-inset-bottom, 0px))', position: 'relative', zIndex: 1 }}>
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="*" element={isLocalChatPreview ? <Messages /> : isLocalProfilePreview ? <Profile /> : <Feed />} />
          </Routes>
        </div>
        {!hideNav && <BottomNav />}
      </div>
    );
    return isDesktopWeb ? <WebLayout>{previewShell}</WebLayout> : previewShell;
  }

  if (isLoadingAuth || !authChecked) {
    console.log('RETURN_LOADING - Auth still loading', { isLoadingAuth, authChecked });
    return <AuthLoader />;
  }

  // Block rendering if user is a pending placeholder (no real id yet)
  if (user?.id?.startsWith('pending_')) {
    console.log('RETURN_LOADING - pending user, waiting for real id');
    return <AuthLoader />;
  }

  // FORCE FEED - no profile completion, no onboarding, no intermediate screens
  if (isAuth) {
    console.log('RETURN_FEED - Normal authenticated path with Routes');
    const authenticatedShell = (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', width: isDesktopWeb ? '100%' : '100vw', overscrollBehavior: 'none', position: 'relative', zIndex: 0 }}>
        <div id="main-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain', paddingBottom: hideNav ? 0 : 'calc(72px + env(safe-area-inset-bottom, 0px))', position: 'relative', zIndex: 1 }}>
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/map" element={<ContactsMap />} />
            <Route path="/contacts-map" element={<ContactsMap />} />
            <Route path="/reels" element={<SpiceyReels />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<AccountSettings />} />
            <Route path="/live" element={<LiveStream />} />
            <Route path="/live/watch" element={<LiveWatcher />} />
            <Route path="/create" element={<CreatePost />} />
            <Route path="/create-text" element={<CreateTextPost />} />
            <Route path="/create-video" element={<CreateVideoPost />} />
            <Route path="/create-photo" element={<CreatePhotoPost />} />
            <Route path="/ai" element={<AIGenerator />} />
            <Route path="/call-diag" element={<CallDiagnostics />} />
            <Route path="/admin/preset-avatars" element={adminPage(<AdminPresetAvatars />)} />
            <Route path="/avatar-creator" element={<AvatarCreator />} />
            <Route path="/ios-debug" element={<IOSDebug />} />
            <Route path="/supabase-test" element={<SupabaseTest />} />
            <Route path="/vip" element={<SpiceyVIP />} />
            <Route path="/vip-dashboard" element={<VIPDashboard />} />
            <Route path="/admin" element={adminPage(<AdminDashboard />)} />
            <Route path="/admin/dashboard" element={adminPage(<AdminDashboard />)} />
            <Route path="/admin/super" element={adminPage(<SuperAdminDashboard />)} />
            <Route path="/admin/users" element={adminPage(<AdminUsers />)} />
            <Route path="/admin/moderation" element={adminPage(<AdminModerationPanel />)} />
            <Route path="/admin/comms" element={adminPage(<AdminCommunicationCenter />)} />
            <Route path="/admin/vip-management" element={adminPage(<AdminVIPManagement />)} />
            <Route path="/admin/gift-vip" element={adminPage(<GiftVIPAccess />)} />
            <Route path="/admin/email-automation" element={adminPage(<AdminEmailAutomation />)} />
            <Route path="/admin/backup" element={adminPage(<AdminBackup />)} />
            <Route path="/admin/ai" element={adminPage(<AdminAIPanel />)} />
            <Route path="/admin/video-library" element={adminPage(<AdminVideoLibrary />)} />
            <Route path="/admin/bulk-import" element={adminPage(<AdminBulkImportVideos />)} />
            <Route path="/admin/content" element={adminPage(<AdminContentManagement />)} />
            <Route path="/admin/push-diagnostics" element={adminPage(<AdminPushDiagnostics />)} />
            <Route path="/admin/curated-reels" element={adminPage(<AdminCuratedReels />)} />
            <Route path="/admin/release" element={adminPage(<AdminReleaseCenter />)} />
            <Route path="/admin/visual-editor" element={adminPage(<AdminVisualEditor />)} />
            <Route path="/admin/home-feed-v2" element={adminPage(<HomeFeedV2Test />)} />
            <Route path="/admin/home-feed-v3" element={adminPage(<HomeFeedV3Experimental />)} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/guidelines" element={<CommunityGuidelines />} />
            <Route path="/community-guidelines" element={<CommunityGuidelines />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </div>
        <NotificationPermissionBanner />
        <MissedCallBanner />
        <IOSInstallPrompt />
        <GlobalIncomingCallHandler />
        <PushNotificationProvider />
        <VoIPProvider />
        {callSheetOpen && activeCall && (
          <CallSheet open={callSheetOpen} onClose={handleCallSheetClose} convo={{
            userId: activeCall.isIncoming ? activeCall.caller_id : activeCall.receiver_id,
            name: activeCall.isIncoming ? (activeCall.callerName || 'Unknown') : (activeCall.receiverName || 'Unknown'),
            img: activeCall.isIncoming ? (activeCall.callerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeCall.callerName || 'U')}&background=1a0a2e&color=fff&size=120`) : (activeCall.receiverAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeCall.receiverName || 'U')}&background=1a0a2e&color=fff&size=120`),
          }} isVideo={activeCall.type === 'video'} isIncoming={activeCall.isIncoming} callSession={{ id: activeCall.id, status: activeCall.status }} />
        )}
        {!hideNav && <BottomNav />}
      </div>
    );
    return isDesktopWeb ? <WebLayout>{authenticatedShell}</WebLayout> : authenticatedShell;
  } else {
    console.log('RETURN_AUTH - Showing SpiceyAuthModal', { userId: user?.id, lsToken: !!lsToken, authChecked, isLoadingAuth });
    return <SpiceyAuthModal />;
  }
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AppContent />
            <Toaster duration={5000} position="top-center" richColors closeButton />
          </Router>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
