import React, { useState, useRef } from 'react';
import { base44, persistLogin, TokenStorage } from '@/api/base44Client';
import { spiceyApi } from '@/api/spiceyApi';
import { Preferences } from '@capacitor/preferences';
import { ArrowRight, Check, Eye, EyeOff, Lock, Mail, ShieldCheck, Smartphone, User } from 'lucide-react';

console.log('[BUILD_TEST_20260625_NO_PENDING_USER_FIX]');

const SPICEY_LOGO = "https://media.base44.com/images/public/69fe90d3bbe7ad47925e4a0a/a7812bd9b_841b8be5-b1e6-4719-9a32-36fafbb51084.png";
const SPICEY_BOLT = "https://media.base44.com/images/public/69fe90d3bbe7ad47925e4a0a/a645abc1a_6ab1672f-73ff-4c98-a1ef-817016549a2f.png";
const LEGAL_VERSION = '3.0';

function isPasswordResetPath() {
  if (typeof window === 'undefined') return false;
  const hashParams = new URLSearchParams((window.location.hash || '').replace(/^#/, ''));
  const searchParams = new URLSearchParams(window.location.search || '');
  const type = hashParams.get('type') || searchParams.get('type');
  return window.location.pathname.includes('/auth/reset-password')
    || type === 'recovery'
    || !!searchParams.get('token_hash')
    || !!hashParams.get('token_hash')
    || !!(hashParams.get('access_token') && hashParams.get('refresh_token'));
}

function isJwtLike(token) {
  return typeof token === 'string'
    && token.split('.').length === 3
    && token.split('.').every(Boolean);
}

const inputStyle = {
  width: '100%', padding: '15px 18px', borderRadius: '14px',
  background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,149,0,0.35)',
  color: '#ffffff', fontSize: '16px', outline: 'none',
  boxSizing: 'border-box', marginBottom: '12px',
};

const btnStyle = {
  marginTop: 16, width: '100%', padding: '15px 24px', borderRadius: 14,
  background: 'linear-gradient(135deg, #ff5500, #e91e8c)',
  border: 'none', color: '#ffffff', fontSize: 17, fontWeight: 700,
  cursor: 'pointer', boxShadow: '0 4px 24px rgba(255,85,0,0.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
};

async function apiPost(path, body) {
  console.log('[SPICEY_AUTH_API] POST', path, { ...body, password: body?.password ? '***' : undefined });
  if (path === '/login') {
    const result = await spiceyApi.auth.login({ email: body.email, password: body.password });
    return {
      access_token: result.session?.access_token,
      token: result.session?.access_token,
      user: result.user,
      session: result.session,
    };
  }
  if (path === '/register') {
    const result = await spiceyApi.auth.signup({
      email: body.email,
      password: body.password,
      fullName: body.full_name,
      username: body.email?.split('@')[0],
      legalAccepted: body.legal_accepted,
      legalVersion: body.legal_version,
    });
    return {
      access_token: result.session?.access_token,
      token: result.session?.access_token,
      user: result.user,
      session: result.session,
    };
  }
  if (path === '/verify-otp') {
    throw new Error('Email verification is handled by Supabase email links.');
  }
  throw new Error(`Unsupported auth path: ${path}`);
}

export default function SpiceyAuthModal() {
  const resetPath = isPasswordResetPath();
  const [mode, setMode] = useState(resetPath ? 'reset' : 'signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [recoverySession, setRecoverySession] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [legalAccepted, setLegalAccepted] = useState(false);

  const emailRef = useRef('');
  const inFlight = useRef(false);

  const [hasExistingToken, setHasExistingToken] = useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    let cancelled = false;
    const hashParams = new URLSearchParams((window.location.hash || '').replace(/^#/, ''));
    const searchParams = new URLSearchParams(window.location.search || '');
    const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token') || searchParams.get('refresh_token');
    const code = searchParams.get('code') || hashParams.get('code');
    const tokenHash = searchParams.get('token_hash') || hashParams.get('token_hash');
    const type = hashParams.get('type') || searchParams.get('type');
    const isResetPath = isPasswordResetPath();

    if (isResetPath) {
      setMode('reset');
      setHasExistingToken(false);
    }

    if (accessToken && refreshToken && (type === 'recovery' || isResetPath)) {
      if (!isJwtLike(accessToken)) {
        setError('Reset link is expired. Please request a new password email.');
        try {
          window.history.replaceState({}, document.title, '/auth/reset-password');
        } catch (_) {}
        return () => { cancelled = true; };
      }
      const session = {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: hashParams.get('token_type') || 'bearer',
        expires_at: hashParams.get('expires_in')
          ? Math.floor(Date.now() / 1000) + Number(hashParams.get('expires_in'))
          : undefined,
      };
      setRecoverySession(session);
      setMode('reset');
      setHasExistingToken(false);
      try {
        window.history.replaceState({}, document.title, '/auth/reset-password');
      } catch (_) {}
      return () => { cancelled = true; };
    }

    if ((tokenHash || code) && isResetPath) {
      setError('');
      setLoading(true);
      const recoveryPromise = tokenHash
        ? spiceyApi.auth.verifyRecoveryToken(tokenHash)
        : spiceyApi.auth.exchangeRecoveryCode(code);
      recoveryPromise
        .then((result) => {
          if (cancelled) return;
          if (isJwtLike(result?.session?.access_token) && result?.session?.refresh_token) {
            setRecoverySession(result.session);
            try {
              window.history.replaceState({}, document.title, '/auth/reset-password');
            } catch (_) {}
          } else {
            setError('Reset link is expired. Please request a new password email.');
          }
        })
        .catch(() => {
          if (!cancelled) setError('Reset link is expired. Please request a new password email.');
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    } else if (isResetPath) {
      setError('Reset link is expired. Please request a new password email.');
    }

    return () => { cancelled = true; };
  }, []);

  React.useEffect(() => {
    if (isPasswordResetPath()) {
      setHasExistingToken(false);
      return;
    }
    TokenStorage.get().then(token => {
      let hasRecoverableSession = false;
      try {
        const session = JSON.parse(localStorage.getItem('spicey_session') || 'null');
        hasRecoverableSession = !!(session?.access_token && session?.refresh_token);
      } catch (_) {}
      const lsToken = typeof window !== 'undefined' && (localStorage.getItem('spicey_session') || localStorage.getItem('token'));
      const hasToken = false;
      console.log('SPICEY_AUTH_MODAL token check:', { capacitorToken: !!token, lsToken: !!lsToken, hasToken });
      setHasExistingToken(hasToken);
    });
  }, []);

  const isResetMode = mode === 'reset';

  if (hasExistingToken) {
    console.log('SPICEY_AUTH_MODAL: token exists → returning null');
    return null;
  }
  console.log('SPICEY_AUTH_MODAL: no token → rendering login UI');

  const finishLogin = async (token, userFromResponse, emailUsed, sessionFromResponse = null) => {
    if (!token) throw new Error('No token received from server.');
    const cleanEmail = (emailUsed || emailRef.current || email).trim().toLowerCase();

    console.log('[FINISH_LOGIN] Called with:', { tokenLength: token?.length, userId: userFromResponse?.id || 'MISSING', email: cleanEmail });

    // STRICT: use data.user directly — no fallbacks, no synthesizing, no placeholder ids
    const user = userFromResponse;
    if (!user?.id) {
      console.error('[FINISH_LOGIN] Login returned no user id — data.user:', userFromResponse);
      throw new Error('Login returned no user id. Please try again.');
    }

    console.log('[FINISH_LOGIN] Using user from login response:', user.id, user.email);

    const sessionToStore = sessionFromResponse?.access_token
      ? sessionFromResponse
      : { access_token: token, token_type: 'bearer' };

    try { await Preferences.set({ key: 'spicey_session', value: JSON.stringify(sessionToStore) }); } catch (_) {}
    try { localStorage.setItem('spicey_session', JSON.stringify(sessionToStore)); localStorage.setItem('token', token); } catch (_) {}
    try { base44.auth.setToken(token); } catch (_) {}
    try {
      const http = base44.http || base44._http || base44.axios;
      if (http?.defaults?.headers) http.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (_) {}

    try { await persistLogin(sessionToStore, user); } catch (err) { console.error('[FINISH_LOGIN] persistLogin error:', err.message); }

    try {
      const userCache = { ...user, _cached_at: new Date().toISOString() };
      localStorage.setItem('spicey_cached_user', JSON.stringify(userCache));
      await Preferences.set({ key: 'spicey_cached_user', value: JSON.stringify(userCache) });
      console.log('[FINISH_LOGIN] User cached to localStorage + Capacitor');
    } catch (err) {
      console.error('[FINISH_LOGIN] Cache save error:', err.message);
    }

    const event = new CustomEvent('auth-success', { detail: user });
    window.dispatchEvent(event);
    console.log('[FINISH_LOGIN] auth-success dispatched for user:', user.id);
  };

  const handleVerify = async () => {
    const cleanOtp = otp.replace(/\D/g, '');
    if (cleanOtp.length !== 6) { setError('Enter the full 6-digit code.'); return; }
    if (inFlight.current) return;
    inFlight.current = true;
    setError('');
    setLoading(true);

    const emailToUse = email.trim() || emailRef.current;
    const cleanEmail = emailToUse.trim().toLowerCase();

    if (!cleanEmail) {
      setError('Email is missing. Please go back and try again.');
      setLoading(false);
      inFlight.current = false;
      return;
    }

    try {
      const data = await apiPost('/verify-otp', { email: cleanEmail, otp_code: cleanOtp });
      const token = data?.access_token || data?.token;
      const userFromResponse = data?.user;
      if (!token) throw new Error('Server did not return a token');
      await finishLogin(token, userFromResponse, cleanEmail, data?.session);
      console.log('SPICEY_AUTH_MODAL: Login successful');
    } catch (err) {
      setError(err.message || 'Verification failed. Try resending the code.');
    } finally {
      setLoading(false);
      inFlight.current = false;
    }
  };

  const handleSignup = async () => {
    if (!fullName.trim()) { setError('Please enter your full name.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (!legalAccepted) { setError('Please read and accept the Terms, Privacy Policy, and Community Guidelines.'); return; }
    if (inFlight.current) return;
    inFlight.current = true;
    setError('');
    setLoading(true);
    try {
      const data = await apiPost('/register', {
        email: email.trim().toLowerCase(),
        password,
        full_name: fullName.trim(),
        legal_accepted: true,
        legal_version: LEGAL_VERSION,
      });
      const token = data?.access_token || data?.token;
      if (token && data?.user?.id) {
        await finishLogin(token, data.user, email.trim().toLowerCase(), data?.session);
      } else {
        setPassword('');
        setMode('signin');
        setError('Account created. Check your email, confirm it, then sign in.');
      }
    } catch (err) {
      const lower = err.message.toLowerCase();
      if (lower.includes('already exists') || lower.includes('already registered') || lower.includes('duplicate')) {
        setError('This email is already registered. Please sign in.');
      } else {
        setError(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
      inFlight.current = false;
    }
  };

  const handleSignin = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setError('');
    setLoading(true);
    try {
      const data = await apiPost('/login', {
        email: email.trim().toLowerCase(),
        password,
      });
      const token = data?.access_token || data?.token;
      const userFromResponse = data?.user;
      console.log('[LOGIN_RESPONSE] token:', !!token, '| user:', userFromResponse?.id || 'MISSING');
      await finishLogin(token, userFromResponse, email.trim().toLowerCase(), data?.session);
    } catch (err) {
      const lower = err.message.toLowerCase();
      if (lower.includes('no user id')) {
        setError('Login error: server did not return user data. Please try again.');
      } else if (lower.includes('invalid credentials') || lower.includes('incorrect') || lower.includes('wrong') || lower.includes('password')) {
        setError('Incorrect email or password. Please try again.');
      } else if (lower.includes('not found') || lower.includes('no user') || lower.includes('no account')) {
        setError('No account found with this email. Tap "Sign Up" below to create one.');
      } else if (lower.includes('verify') || lower.includes('otp') || lower.includes('verif') || lower.includes('not verified') || lower.includes('email not confirmed')) {
        emailRef.current = email.trim().toLowerCase();
        setMode('verify');
        setOtp('');
        setError('Please verify your email first. Check your inbox for the 6-digit code.');
      } else {
        setError(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
      inFlight.current = false;
    }
  };

  const handleForgot = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setError('');
    setLoading(true);
    try {
      await base44.auth.resetPasswordRequest(email.trim().toLowerCase());
      setResetSent(true);
    } catch (err) {
      setError('Could not send reset link. Please try again.');
    } finally {
      setLoading(false);
      inFlight.current = false;
    }
  };

  const handleResetPassword = async () => {
    if (!isJwtLike(recoverySession?.access_token) || !recoverySession?.refresh_token) {
      setError('Reset link is expired. Please request a new password email.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (inFlight.current) return;
    inFlight.current = true;
    setError('');
    setLoading(true);
    try {
      const result = await spiceyApi.auth.updatePassword({
        accessToken: recoverySession.access_token,
        refreshToken: recoverySession.refresh_token,
        password: newPassword,
      });
      await finishLogin(recoverySession.access_token, result.user, result.user?.email || email, result.session);
      setNewPassword('');
      setConfirmPassword('');
      try {
        window.history.replaceState({}, document.title, '/');
        window.dispatchEvent(new PopStateEvent('popstate'));
      } catch (_) {
        window.location.href = '/';
      }
    } catch (err) {
      const message = err.message || '';
      if (/different from the old password|same as/i.test(message)) {
        setError('This password may already be saved. Try signing in with it, or choose a completely different password.');
      } else {
        setError(message || 'Password could not be updated. Please request a new reset link.');
      }
    } finally {
      setLoading(false);
      inFlight.current = false;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'reset') handleResetPassword();
    else if (mode === 'signup') handleSignup();
    else if (mode === 'forgot') handleForgot();
    else handleSignin();
  };

  const containerStyle = {
    position: 'fixed', inset: 0, backgroundColor: '#020007',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'flex-start', padding: '0', zIndex: 99999,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
  };

  if (mode === 'verify') {
    return (
      <div style={containerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32, animation: 'spicey-pulse 3s ease-in-out infinite' }}>
          <img src={SPICEY_LOGO} alt="Spicey" style={{ width: 200, height: 70, objectFit: 'contain' }} />
        </div>
        <div style={{ width: '100%', maxWidth: 320, textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, marginBottom: 4 }}>We sent a 6-digit code to</p>
          <p style={{ color: '#ff9500', fontSize: 15, fontWeight: 700, marginBottom: 24 }}>{email}</p>
          <input
            type="text" inputMode="numeric" placeholder="Enter 6-digit code"
            value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            style={{ ...inputStyle, textAlign: 'center', fontSize: 32, letterSpacing: 12, marginBottom: 0 }}
            autoFocus
          />
          {error && <ErrorBox msg={error} />}
          <button
            onClick={handleVerify}
            disabled={loading || otp.replace(/\D/g, '').length < 6}
            style={{ ...btnStyle, opacity: (loading || otp.replace(/\D/g, '').length < 6) ? 0.45 : 1, cursor: (loading || otp.replace(/\D/g, '').length < 6) ? 'not-allowed' : 'pointer' }}
          >
            {loading ? <><Spinner /> Verifying…</> : 'Verify & Enter App →'}
          </button>
          <ResendCode email={email} onResent={() => { setError(''); setOtp(''); }} />
          <button onClick={() => { setMode('signup'); setOtp(''); setError(''); }}
            style={{ marginTop: 6, background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 13, cursor: 'pointer' }}>
            ← Back
          </button>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, marginTop: 20, textAlign: 'center', maxWidth: 280 }}>
          By continuing you agree to our Terms &amp; Privacy Policy
        </p>
        <Styles />
      </div>
    );
  }

  if (mode === 'forgot' && resetSent) {
    return (
      <div style={containerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, animation: 'spicey-pulse 3s ease-in-out infinite' }}>
          <img src={SPICEY_LOGO} alt="Spicey" style={{ width: 200, height: 70, objectFit: 'contain' }} />
        </div>
        <div style={{ width: '100%', maxWidth: 320, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
          <p style={{ color: '#fff', fontSize: 16, fontWeight: 600, margin: '0 0 8px' }}>Reset link sent!</p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: '0 0 28px' }}>
            Check your inbox at <strong style={{ color: 'rgba(255,149,0,0.9)' }}>{email}</strong>
          </p>
          <button onClick={() => { setMode('signin'); setResetSent(false); setError(''); }} style={btnStyle}>
            Back to Sign In
          </button>
        </div>
        <Styles />
      </div>
    );
  }

  return (
    <div style={containerStyle} className="spicey-auth-screen">
      <div className="spicey-auth-orb spicey-auth-orb-left" />
      <div className="spicey-auth-orb spicey-auth-orb-right" />
      <div className="spicey-auth-panel">
        <div className="spicey-auth-brand">
          <div className="spicey-auth-logo-ring" />
          <img src={SPICEY_LOGO} alt="Spicey" className="spicey-auth-main-logo" />
        </div>

      <h1 className="spicey-auth-title">
        {mode === 'reset' ? 'New password' : mode === 'forgot' ? 'Reset password' : mode === 'signup' ? 'Create account' : 'Welcome back!'}
      </h1>
      <p className="spicey-auth-subtitle">
        {mode === 'reset' ? 'Choose a new password for your Spicey account' : mode === 'forgot' ? 'Enter your email and we will send a reset link' : mode === 'signup' ? 'Join Spicey and start your journey' : 'Sign in to continue your journey'}
      </p>

      {(mode === 'signin' || mode === 'signup') && (
        <div className="spicey-auth-tabs">
          {['signin', 'signup'].map(tab => (
            <button key={tab} onClick={() => { setMode(tab); setError(''); }}
              className={mode === tab ? 'active' : ''}>
              {tab === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="spicey-auth-form">
        {mode === 'reset' && (
          <>
            <AuthField icon={<Lock />} label="New Password">
              <input type={showPassword ? 'text' : 'password'} placeholder="New password" value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                autoComplete="new-password" />
            </AuthField>
            <AuthField icon={<ShieldCheck />} label="Confirm Password" trailing={(
              <button type="button" className="spicey-auth-eye" onClick={() => setShowPassword(v => !v)}>
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            )}>
              <input type={showPassword ? 'text' : 'password'} placeholder="Confirm password" value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                autoComplete="new-password" />
            </AuthField>
          </>
        )}
        {mode === 'signup' && (
          <AuthField icon={<User />} label="Full Name" valid={fullName.trim().length > 1}>
            <input type="text" placeholder="Valon Dervishi" value={fullName}
              onChange={e => setFullName(e.target.value)}
              autoComplete="name" />
          </AuthField>
        )}
        {!isResetMode && (
          <AuthField icon={<Mail />} label="Email Address" valid={email.includes('@')}>
            <input type="email" placeholder="you@spicey.live" value={email}
              onChange={e => { const val = e.target.value; setEmail(val); emailRef.current = val; }}
              autoComplete="email" inputMode="email" />
          </AuthField>
        )}
        {mode !== 'forgot' && !isResetMode && (
          <AuthField icon={<Lock />} label="Password" trailing={(
            <button type="button" className="spicey-auth-eye" onClick={() => setShowPassword(v => !v)}>
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          )}>
            <input type={showPassword ? 'text' : 'password'} placeholder="••••••••••••" value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />
          </AuthField>
        )}
        {mode === 'signup' && (
          <label className="spicey-auth-consent">
            <input
              type="checkbox"
              checked={legalAccepted}
              onChange={event => setLegalAccepted(event.target.checked)}
            />
            <span>
              I confirm I am at least 13 and have read and accept the{' '}
              <a href="/terms">Terms of Service</a>,{' '}
              <a href="/privacy">Privacy Policy</a>, and{' '}
              <a href="/guidelines">Community Guidelines</a>.
            </span>
          </label>
        )}
        {mode === 'signin' && (
          <div className="spicey-auth-forgot-row">
            <button type="button"
              onClick={() => { setMode('forgot'); setError(''); setResetSent(false); }}
              className="spicey-auth-link">
              Forgot Password? <ArrowRight />
            </button>
          </div>
        )}
        {error ? <ErrorBox msg={error} /> : <div style={{ height: 12 }} />}
        <button type="submit" disabled={loading || (mode === 'signup' && !legalAccepted)} className="spicey-auth-submit">
          {loading
            ? <><Spinner /> {mode === 'signin' ? 'Signing In…' : mode === 'forgot' ? 'Sending…' : mode === 'reset' ? 'Updating…' : 'Creating Account…'}</>
            : <>{mode === 'signin' ? 'Sign In' : mode === 'forgot' ? 'Send Reset Link' : mode === 'reset' ? 'Save New Password' : 'Create Account'} <ArrowRight /></>}
        </button>
        {mode === 'forgot' && (
          <button type="button" onClick={() => { setMode('signin'); setError(''); }}
            className="spicey-auth-back">
            ← Back to Sign In
          </button>
        )}
        {mode !== 'forgot' && (
          <>
            <div className="spicey-auth-divider"><span />OR<span /></div>
            <div className="spicey-auth-socials">
              <button type="button" onClick={() => setError('Google login will be connected after OAuth is enabled.')}>
                <strong className="google-g">G</strong><span>Google</span>
              </button>
              <button type="button" onClick={() => setError('Apple login will be connected after OAuth is enabled.')}>
                <strong className="apple-logo"></strong><span>Apple</span>
              </button>
              <button type="button" onClick={() => setError('Phone login will be connected after SMS auth is enabled.')}>
                <Smartphone /><span>Phone</span>
              </button>
            </div>
          </>
        )}
        {mode === 'signin' && (
          <p className="spicey-auth-switch">
            Don't have an account?{' '}
            <button type="button" onClick={() => { setMode('signup'); setError(''); }}
              className="spicey-auth-inline">
              Sign Up
            </button>
          </p>
        )}
        {mode === 'signup' && (
          <p className="spicey-auth-switch">
            Already have an account?{' '}
            <button type="button" onClick={() => { setMode('signin'); setError(''); }}
              className="spicey-auth-inline">
              Sign In
            </button>
          </p>
        )}
      </form>
      <div className="spicey-auth-legal">
        <ShieldCheck />
        <p>Your privacy and safety matter.</p>
        <strong><a href="/terms">Terms</a> · <a href="/privacy">Privacy</a> · <a href="/guidelines">Guidelines</a></strong>
      </div>
      </div>
      <Styles />
    </div>
  );
}

function AuthField({ icon, label, valid, trailing, children }) {
  return (
    <label className="spicey-auth-field">
      <span className="spicey-auth-field-icon">{icon}</span>
      <span className="spicey-auth-field-body">
        <span className="spicey-auth-field-label">{label}</span>
        {children}
      </span>
      {trailing || (valid ? <span className="spicey-auth-valid"><Check /></span> : null)}
    </label>
  );
}

function ResendCode({ email, onResent }) {
  const [status, setStatus] = React.useState('idle');
  const [countdown, setCountdown] = React.useState(0);
  const resendInFlight = useRef(false);

  const handleResend = async () => {
    if (resendInFlight.current || status === 'sending' || countdown > 0) return;
    resendInFlight.current = true;
    setStatus('sending');
    try {
      await apiPost('/resend-otp', { email: email.trim().toLowerCase() });
    } catch (err) {
      console.error('[AUTH] Resend error:', err.message);
    } finally {
      resendInFlight.current = false;
    }
    setStatus('sent');
    onResent?.();
    let c = 60;
    setCountdown(c);
    const timer = setInterval(() => {
      c--;
      setCountdown(c);
      if (c <= 0) { clearInterval(timer); setStatus('idle'); setCountdown(0); }
    }, 1000);
  };

  return (
    <div style={{ marginTop: 18, marginBottom: 4 }}>
      {status === 'sent' ? (
        <p style={{ color: '#34d399', fontSize: 13, margin: 0 }}>✓ New code sent! Check your email.</p>
      ) : (
        <button onClick={handleResend} disabled={countdown > 0 || status === 'sending'}
          style={{
            background: 'none', border: 'none',
            cursor: (countdown > 0 || status === 'sending') ? 'default' : 'pointer',
            fontSize: 14, fontWeight: 600,
            color: (countdown > 0 || status === 'sending') ? 'rgba(255,255,255,0.3)' : 'rgba(255,149,0,0.85)',
            padding: 0,
          }}>
          {status === 'sending' ? 'Sending…' : countdown > 0 ? `Resend code in ${countdown}s` : "Didn't get a code? Resend"}
        </button>
      )}
    </div>
  );
}

function ErrorBox({ msg }) {
  return (
    <p style={{
      color: '#ff6b6b', fontSize: 13, margin: '10px 0 0', textAlign: 'center',
      padding: '10px 14px', background: 'rgba(255,0,0,0.08)',
      border: '1px solid rgba(255,0,0,0.25)', borderRadius: 10,
    }}>
      {msg}
    </p>
  );
}

function Spinner() {
  return (
    <div style={{
      width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)',
      borderTopColor: '#fff', borderRadius: '50%',
      animation: 'spicey-spin 0.7s linear infinite',
    }} />
  );
}

function Styles() {
  return (
    <style>{`
      @keyframes spicey-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes spicey-pulse {
        0%, 100% { filter: drop-shadow(0 0 24px rgba(255,120,0,0.65)) drop-shadow(0 0 55px rgba(233,30,140,0.35)); }
        50% { filter: drop-shadow(0 0 38px rgba(255,149,0,0.9)) drop-shadow(0 0 80px rgba(191,90,242,0.5)); }
      }
      .spicey-auth-screen {
        background:
          radial-gradient(circle at 50% 4%, rgba(255,45,150,0.18), transparent 31%),
          radial-gradient(circle at 0% 100%, rgba(111,0,255,0.40), transparent 28%),
          radial-gradient(circle at 100% 92%, rgba(255,45,85,0.34), transparent 30%),
          linear-gradient(180deg, #020006 0%, #070213 46%, #020007 100%) !important;
      }
      .spicey-auth-screen::before {
        content: "";
        position: fixed;
        inset: 0;
        pointer-events: none;
        background:
          radial-gradient(circle at 50% 16%, rgba(255,255,255,0.045), transparent 25%),
          radial-gradient(circle at 52% 16%, transparent 0 132px, rgba(255,45,150,0.13) 133px, transparent 136px),
          linear-gradient(130deg, transparent 0 65%, rgba(255,106,0,0.08), transparent 82%);
      }
      .spicey-auth-screen::after {
        content: "";
        position: fixed;
        inset: auto -10% -18% -10%;
        height: 34%;
        pointer-events: none;
        background:
          radial-gradient(circle at 5% 85%, rgba(86,0,255,0.62), transparent 30%),
          radial-gradient(circle at 96% 72%, rgba(255,45,150,0.55), transparent 34%);
        filter: blur(5px);
        opacity: 0.8;
      }
      .spicey-auth-panel {
        width: min(100%, 410px);
        min-height: 100%;
        position: relative;
        z-index: 2;
        padding: max(24px, env(safe-area-inset-top)) 30px calc(24px + env(safe-area-inset-bottom));
        box-sizing: border-box;
      }
      .spicey-auth-orb {
        position: fixed;
        pointer-events: none;
        width: 210px;
        height: 210px;
        border-radius: 999px;
        border: 1px solid rgba(255,45,180,0.16);
        opacity: 0.65;
      }
      .spicey-auth-orb-left { left: -126px; bottom: -92px; box-shadow: inset 0 0 34px rgba(111,0,255,0.62), 0 0 54px rgba(111,0,255,0.36); }
      .spicey-auth-orb-right { right: -130px; bottom: -60px; box-shadow: inset 0 0 38px rgba(255,45,150,0.62), 0 0 58px rgba(255,45,150,0.30); }
      .spicey-auth-brand {
        height: 142px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;
        margin-bottom: 10px;
      }
      .spicey-auth-logo-ring {
        position: absolute;
        top: 2px;
        width: 210px;
        height: 124px;
        border-radius: 999px;
        border: 1px solid rgba(255,45,150,0.10);
        background: radial-gradient(ellipse at center, rgba(255,45,150,0.14), rgba(255,106,0,0.08) 42%, transparent 72%);
        box-shadow: inset 0 0 42px rgba(255,45,150,0.08), 0 0 36px rgba(255,45,150,0.16);
      }
      .spicey-auth-main-logo {
        width: min(280px, 80vw);
        height: 118px;
        object-fit: contain;
        position: relative;
        z-index: 3;
        filter:
          drop-shadow(0 0 12px rgba(255,106,0,0.70))
          drop-shadow(0 0 18px rgba(255,45,150,0.68))
          drop-shadow(0 0 38px rgba(161,0,255,0.26));
      }
      .spicey-auth-title {
        margin: 0;
        color: #fff;
        text-align: center;
        font-size: 24px;
        line-height: 1.08;
        font-weight: 850;
        letter-spacing: -0.03em;
      }
      .spicey-auth-subtitle {
        margin: 7px 0 18px;
        color: rgba(255,255,255,0.55);
        text-align: center;
        font-size: 14px;
        line-height: 1.25;
        font-weight: 500;
      }
      .spicey-auth-tabs {
        width: 100%;
        height: 48px;
        display: flex;
        padding: 0;
        border-radius: 999px;
        margin-bottom: 16px;
        border: 1px solid rgba(193,0,255,0.50);
        background: rgba(12,7,24,0.72);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.04), 0 0 20px rgba(255,45,180,0.13);
        overflow: hidden;
      }
      .spicey-auth-tabs button {
        flex: 1;
        border: 0;
        background: transparent;
        color: rgba(255,255,255,0.52);
        font-size: 14px;
        font-weight: 800;
        cursor: pointer;
      }
      .spicey-auth-tabs button.active {
        color: #fff;
        border-radius: 999px;
        background: linear-gradient(100deg, #ff8a00 0%, #ff334a 44%, #c100ff 100%);
        box-shadow: 0 0 28px rgba(255,45,150,0.38), 0 0 34px rgba(255,106,0,0.20);
      }
      .spicey-auth-form {
        width: 100%;
      }
      .spicey-auth-field {
        min-height: 60px;
        display: grid;
        grid-template-columns: 48px 1fr 32px;
        gap: 8px;
        align-items: center;
        padding: 8px 12px 8px 10px;
        margin-bottom: 11px;
        border-radius: 15px;
        border: 1px solid rgba(255,45,180,0.72);
        background:
          radial-gradient(circle at 14% 22%, rgba(255,45,150,0.10), transparent 44%),
          rgba(7,3,17,0.72);
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.04),
          0 0 18px rgba(193,0,255,0.14);
      }
      .spicey-auth-field-icon {
        width: 38px;
        height: 38px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255,45,150,0.10);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
      }
      .spicey-auth-field-icon svg {
        width: 21px;
        height: 21px;
        color: #ff3d8f;
        filter: drop-shadow(0 0 8px rgba(255,45,150,0.48));
      }
      .spicey-auth-field-body {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .spicey-auth-field-label {
        color: rgba(255,255,255,0.56);
        font-size: 12px;
        line-height: 1;
        margin-bottom: 5px;
      }
      .spicey-auth-field input {
        width: 100%;
        border: 0;
        outline: 0;
        padding: 0;
        margin: 0;
        color: #fff;
        background: transparent;
        font-size: 14px;
        font-weight: 700;
        line-height: 1.2;
      }
      .spicey-auth-field input::placeholder {
        color: rgba(255,255,255,0.28) !important;
        font-weight: 600;
      }
      .spicey-auth-valid,
      .spicey-auth-eye {
        width: 28px;
        height: 28px;
        border-radius: 999px;
        border: 0;
        background: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #d844ff;
      }
      .spicey-auth-valid {
        border: 2px solid #c02cff;
        box-shadow: 0 0 12px rgba(193,0,255,0.32);
      }
      .spicey-auth-valid svg,
      .spicey-auth-eye svg {
        width: 17px;
        height: 17px;
      }
      .spicey-auth-eye {
        cursor: pointer;
        color: rgba(255,255,255,0.72);
      }
      .spicey-auth-forgot-row {
        display: flex;
        justify-content: flex-end;
        margin: 1px 4px 14px;
      }
      .spicey-auth-link {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        border: 0;
        background: transparent;
        cursor: pointer;
        font-size: 14px;
        font-weight: 750;
        color: #ff6a00;
        padding: 0;
      }
      .spicey-auth-link svg {
        width: 15px;
        height: 15px;
        color: #ff2d8f;
      }
      .spicey-auth-submit {
        width: 100%;
        height: 56px;
        border: 0;
        border-radius: 16px;
        margin-top: 2px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 28px;
        color: #fff;
        font-size: 16px;
        font-weight: 850;
        cursor: pointer;
        background: linear-gradient(100deg, #ff8a00 0%, #ff334a 42%, #e600a8 68%, #b000ff 100%);
        box-shadow:
          0 0 22px rgba(255,45,150,0.42),
          0 12px 30px rgba(255,106,0,0.22);
      }
      .spicey-auth-consent {
        display: flex; gap: 10px; align-items: flex-start; margin: 12px 2px 2px;
        color: rgba(255,255,255,0.68); font-size: 12px; line-height: 1.45;
      }
      .spicey-auth-consent input { width: 18px; height: 18px; margin-top: 1px; accent-color: #ff5500; flex: 0 0 auto; }
      .spicey-auth-consent a, .spicey-auth-legal a { color: #ff9b54; font-weight: 700; text-decoration: underline; }
      .spicey-auth-submit:disabled {
        opacity: 0.58;
        cursor: not-allowed;
      }
      .spicey-auth-submit svg {
        width: 25px;
        height: 25px;
      }
      .spicey-auth-back {
        width: 100%;
        margin-top: 14px;
        border: 0;
        background: transparent;
        color: rgba(255,255,255,0.52);
        font-size: 14px;
        cursor: pointer;
      }
      .spicey-auth-divider {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        gap: 14px;
        margin: 18px 0 14px;
        color: rgba(255,255,255,0.50);
        font-size: 13px;
        font-weight: 800;
      }
      .spicey-auth-divider span {
        height: 1px;
        background: rgba(255,255,255,0.13);
      }
      .spicey-auth-socials {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
      }
      .spicey-auth-socials button {
        height: 78px;
        border-radius: 15px;
        border: 1px solid rgba(255,45,180,0.74);
        background: rgba(8,4,18,0.64);
        color: #fff;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 7px;
        font-size: 12px;
        cursor: pointer;
        box-shadow: 0 0 16px rgba(193,0,255,0.12);
      }
      .spicey-auth-socials svg {
        width: 24px;
        height: 24px;
        color: #d33cff;
      }
      .google-g {
        font-size: 28px;
        line-height: 1;
        font-family: Arial, sans-serif;
        background: conic-gradient(from -45deg, #4285f4, #34a853, #fbbc05, #ea4335, #4285f4);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }
      .apple-logo {
        font-size: 29px;
        line-height: 1;
      }
      .spicey-auth-switch {
        margin: 18px 0 0;
        text-align: center;
        color: rgba(255,255,255,0.58);
        font-size: 15px;
      }
      .spicey-auth-inline {
        border: 0;
        background: transparent;
        color: #ff4b4b;
        font-size: 15px;
        font-weight: 850;
        cursor: pointer;
        padding: 0;
      }
      .spicey-auth-legal {
        margin-top: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        color: rgba(255,255,255,0.42);
        text-align: center;
      }
      .spicey-auth-legal svg {
        width: 28px;
        height: 28px;
        color: #cf2cff;
        filter: drop-shadow(0 0 10px rgba(193,0,255,0.40));
      }
      .spicey-auth-legal p {
        margin: 0;
        font-size: 13px;
      }
      .spicey-auth-legal strong {
        font-size: 14px;
        background: linear-gradient(90deg, #ff2d8f, #ff7a00);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }
      @media (max-height: 780px) {
        .spicey-auth-panel { padding-top: max(18px, env(safe-area-inset-top)); }
        .spicey-auth-brand { height: 118px; margin-bottom: 8px; }
        .spicey-auth-logo-ring { width: 190px; height: 104px; }
        .spicey-auth-main-logo { width: min(246px, 76vw); height: 98px; }
        .spicey-auth-title { font-size: 23px; }
        .spicey-auth-subtitle { margin-bottom: 16px; font-size: 14px; }
        .spicey-auth-field { min-height: 64px; margin-bottom: 11px; }
        .spicey-auth-submit { height: 58px; }
        .spicey-auth-socials button { height: 82px; }
      }
    `}</style>
  );
}
