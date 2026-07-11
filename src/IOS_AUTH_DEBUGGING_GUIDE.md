# iOS Auth Debugging Guide

## Console Logs to Watch For

### 1. Signup Flow
```
[AUTH] handleSignup() - Starting signup process
[AUTH] Email: user@example.com
[AUTH] Full Name: John Doe
[AUTH] Calling /register API...
[AUTH_API] POST /register { email: 'user@example.com', password: '***', full_name: 'John Doe' }
[AUTH_API] Response /register 200 {...}
[AUTH] ✓ Signup successful, switching to verify mode
```

### 2. OTP Verification Flow
```
[AUTH] handleVerify() - Starting OTP verification
[AUTH] Email: user@example.com
[AUTH] OTP Code: 123456
[AUTH] Calling /verify-otp API...
[AUTH_API] POST /verify-otp { email: 'user@example.com', otp_code: '123456' }
[AUTH_API] Response /verify-otp 200 { access_token: '...' }
[AUTH] ✓ OTP verified successfully
[AUTH] Token received: Yes (XXX chars)
```

### 3. Token Storage Flow
```
[AUTH] finishLogin() - Token received: eyJ...
[AUTH] STEP 1 - Saving token to storage...
[AUTH] ✓ Token saved to Capacitor Preferences
[AUTH] ✓ Token saved to localStorage
[AUTH] STEP 2 - Injecting token into SDK...
[AUTH] ✓ Token set via base44.auth.setToken()
[AUTH] ✓ Token set via base44.auth._token
[AUTH] ✓ Token set via base44.auth.token
[AUTH] ✓ Token set in HTTP headers
[AUTH] STEP 3 - Settling delay...
[AUTH] STEP 4 - Fetching user data...
[AUTH] Attempt 1/3 to fetch user...
[AUTH] base44.auth.me() result: { id: '...', email: '...' }
[AUTH] ✓ User fetched successfully via SDK
[AUTH] ✓ SUCCESS: User authenticated
[AUTH] User ID: xxx
[AUTH] Email: user@example.com
[AUTH] Onboarding completed: false
```

### 4. Login Flow
```
[AUTH] handleSignin() - Starting login
[AUTH] Email: user@example.com
[AUTH] Calling /login API...
[AUTH_API] POST /login { email: 'user@example.com', password: '***' }
[AUTH_API] Response /login 200 { access_token: '...' }
[AUTH] ✓ Login successful
[AUTH] Token received: eyJ...
```

## Common Issues & Solutions

### Issue 1: "Verification failed" after entering OTP
**Symptoms:** User enters 6-digit code but gets error message

**Check:**
1. Email is normalized: `email.trim().toLowerCase()`
2. OTP is exactly 6 digits
3. API response contains `access_token` or `token`

**Solution:**
- Check console logs for `[AUTH_API] Response /verify-otp`
- If 401/403, the OTP code is wrong or expired
- If 500, server error - check backend logs

### Issue 2: Token not stored on iOS
**Symptoms:** User logs in successfully but logged out after app restart

**Check:**
1. `[AUTH] ✓ Token saved to Capacitor Preferences` appears in logs
2. Token value is not null or empty

**Solution:**
- Ensure Capacitor Preferences plugin is installed
- Check iOS native code has proper entitlements
- Verify `capacitor.config.json` has correct app ID

### Issue 3: "Could not load account" after successful verification
**Symptoms:** OTP verified, token received, but user fetch fails

**Check:**
1. Token is properly injected into SDK
2. `base44.auth.me()` returns user object
3. Direct `/me` API call works as fallback

**Solution:**
- Check token is valid (not expired)
- Verify app ID matches between frontend and backend
- Check Base44 platform status

### Issue 4: Login button does nothing
**Symptoms:** User clicks login but no response

**Check:**
1. `inFlight.current` flag is not stuck
2. Console shows `[AUTH] handleSignin() - Starting login`
3. No JavaScript errors in console

**Solution:**
- Reload app to reset in-flight flag
- Check network connectivity
- Verify API_BASE URL is correct

## Testing Checklist

### Fresh Signup Test
1. [ ] Open app in incognito or reset app data
2. [ ] Click "Sign Up" tab
3. [ ] Enter name, email, password
3. [ ] Watch console for signup logs
4. [ ] Verify email receives OTP
5. [ ] Enter OTP code
6. [ ] Verify token storage logs appear
7. [ ] Confirm redirect to home screen

### Login Test
1. [ ] Use existing account credentials
2. [ ] Click "Sign In" tab
3. [ ] Enter email and password
4. [ ] Watch console for login logs
5. [ ] Verify token storage logs
6. [ ] Confirm redirect to home screen

### iOS Native Test
1. [ ] Build iOS app: `npx cap sync ios`
2. [ ] Open in Xcode
3. [ ] Run on device (not simulator)
4. [ ] Check Xcode console for auth logs
5. [ ] Verify token persists after app kill/restart

## Critical Files

- `components/SpiceyAuthModal.jsx` - Main auth UI and logic
- `lib/AuthContext.jsx` - Auth state management
- `lib/app-params.js` - App configuration (appId)

## iOS-Specific Notes

1. **Capacitor Preferences**: Used for native iOS token storage
2. **Console Access**: Use Xcode console (not browser dev tools)
3. **Bundle ID**: Must match in `capacitor.config.json` and iOS project
4. **Clean Build**: Always run `npx cap sync ios` after code changes

## Debug Commands

### Clear iOS App Data
```bash
# Delete app from device, reinstall
```

### View Xcode Console
1. Open Xcode
2. Product → Run (or Cmd+R)
3. View → Debug Area → Activate Console

### Check Token Storage
```javascript
// In browser console (web only)
localStorage.getItem('base44_access_token')

// iOS native requires Xcode debugging
```

## Support

If issues persist after following this guide:
1. Capture full console logs from signup/login attempt
2. Note iOS version and device model
3. Check Base44 platform status
4. Contact Base44 support with logs