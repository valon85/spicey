# Login Flow Debug Logs - What to Expect

## Expected Log Sequence (After Login Click)

You should see these logs IN ORDER:

### 1. SpiceyAuthModal - Login Started
```
═══════════════════════════════════════════════════════
[LOGIN_STEP_1] About to call loginViaEmailPassword
[LOGIN_STEP_2] Email: user@example.com
[LOGIN_STEP_3] Is native: true
```

### 2. SDK Override - loginViaEmailPassword Called
```
═══════════════════════════════════════════════════════
[AUTH_OVERRIDE] loginViaEmailPassword called
[AUTH_OVERRIDE] Email: user@example.com
[AUTH_OVERRIDE] About to call original login...
```

### 3. SDK Internal - Actual Login Request
(No logs here - happens inside SDK)

### 4. SDK Override - Login Returned
```
[AUTH_OVERRIDE] Original login returned: true
[AUTH_OVERRIDE] Login response: success
═══════════════════════════════════════════════════════
```

### 5. SpiceyAuthModal - Login Complete
```
[LOGIN_STEP_4] loginViaEmailPassword returned
[LOGIN_STEP_5] About to get token via SDK
```

### 6. SDK Override - getToken Called
```
[TOKEN_STORAGE] GET called: { isNative: true }
[TOKEN_STORAGE] Native iOS - Preferences.get() result: { 
  found: true/false, 
  truncated: "eyJhbGci..." 
}
[AUTH_OVERRIDE] getToken: returning from storage
```

### 7. SpiceyAuthModal - Token Received
```
[LOGIN_STEP_6] Token received: true
[LOGIN_STEP_7] Token preview: eyJhbGciOiJIUzI1NiIs...
[LOGIN_STEP_8] About to wait for Capacitor persistence
```

### 8. SpiceyAuthModal - After Wait
```
[LOGIN_STEP_9] Wait completed, verifying token
[LOGIN_STEP_10] Final token verification: { 
  hasToken: true, 
  truncated: "eyJhbGci..." 
}
═══════════════════════════════════════════════════════
```

## Critical Decision Points

### If you DON'T see [LOGIN_STEP_1]:
- Login form handleSubmit is not being called
- Check if form submission is blocked

### If you DON'T see [AUTH_OVERRIDE] loginViaEmailPassword:
- SDK override not initialized
- base44Client.js not loaded
- Check if isNative detection failed

### If you DON'T see [LOGIN_STEP_4]:
- loginViaEmailPassword is hanging or throwing error
- Check for network errors or SDK errors

### If [LOGIN_STEP_6] shows `Token received: false`:
- Token was never saved
- SDK's internal setToken not called
- Check if login response contains token

### If [TOKEN_STORAGE] GET shows `found: false`:
- Capacitor Preferences not working
- Wrong key name
- Plugin not synced

## Most Likely Scenarios

### Scenario A: iOS Bundle Not Rebuilt
**Symptoms:** Only see `[LOGIN] auth success` and `[AUTH] Native: no stored token`
**Missing:** ALL the new debug logs
**Fix:** Rebuild iOS app with `npx cap sync ios` and clean rebuild in Xcode

### Scenario B: SDK Override Not Working
**Symptoms:** See [LOGIN_STEP] logs but NOT [AUTH_OVERRIDE] logs
**Missing:** TokenStorage logs
**Fix:** Check if base44.auth object exists before override

### Scenario C: Token Never Saved
**Symptoms:** See all logs but [LOGIN_STEP_6] shows `Token received: false`
**Diagnosis:** loginViaEmailPassword doesn't internally call setToken
**Fix:** Manually call setToken after login

### Scenario D: Capacitor Preferences Issue
**Symptoms:** See [TOKEN_STORAGE] SET logs but GET shows `found: false`
**Diagnosis:** Preferences plugin not working or wrong key
**Fix:** Check plugin installation and key names

## What Your Current Logs Mean

You reported seeing:
```
[LOGIN] auth success
[AUTH] Native: no stored token, skipping me() call
```

This means:
- You're running OLD code (before our debug logs were added)
- The iOS bundle was NOT rebuilt with the new code
- OR you're testing on web, not iOS device

**Expected:** You should see [LOGIN_STEP_1] through [LOGIN_STEP_10]

## Next Steps

1. **Rebuild iOS app:**
   ```bash
   npx cap sync ios
   npx cap open ios
   ```
   
2. **In Xcode:**
   - Product → Clean Build Folder
   - Rebuild and run

3. **Watch for these logs in Xcode console:**
   - [LOGIN_STEP_1] through [LOGIN_STEP_10]
   - [AUTH_OVERRIDE] logs
   - [TOKEN_STORAGE] logs

4. **If logs still don't appear:**
   - Delete app from device
   - Clear Derived Data in Xcode
   - Rebuild from scratch