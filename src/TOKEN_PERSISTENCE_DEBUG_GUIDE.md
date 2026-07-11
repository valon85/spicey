# 🔍 Token Persistence Debugging Guide

## What to Look For in Xcode Console

### ✅ SUCCESSFUL TOKEN PERSISTENCE

You should see this sequence after login:

```
[LOGIN] auth success

═══════════════════════════════════════════════════════
[AUTH_OVERRIDE] setToken called
[AUTH_OVERRIDE] Token value present: true
[AUTH_OVERRIDE] Token length: 245
[AUTH_OVERRIDE] Persist flag: true
[AUTH_OVERRIDE] Is native: true
[AUTH_OVERRIDE] About to call TokenStorage.set()

═══════════════════════════════════════════════════════
[TOKEN_STORAGE] SET called
[TOKEN_STORAGE] Storage key: base44_access_token
[TOKEN_STORAGE] Is native: true
[TOKEN_STORAGE] Has value: true
[TOKEN_STORAGE] Value length: 245
[TOKEN_STORAGE] Using Capacitor Preferences
[TOKEN_STORAGE] Calling Preferences.set()...
[TOKEN_STORAGE] Preferences.set() completed in 12 ms
[TOKEN_STORAGE] Verifying with Preferences.get()...
[TOKEN_STORAGE] Preferences.get() completed in 8 ms
[TOKEN_STORAGE] VERIFICATION RESULT: {
  saved: true,
  verified: true,
  match: ✅ PERFECT MATCH,
  truncated: eyJhbGciOiJIUzI1NiIsIn...
}
═══════════════════════════════════════════════════════

[AUTH_OVERRIDE] TokenStorage.set() completed: true
[AUTH_OVERRIDE] Calling original setToken
[AUTH_OVERRIDE] setToken complete
═══════════════════════════════════════════════════════

═══════════════════════════════════════════════════════
[TOKEN] STEP 1: About to verify token persistence
[TOKEN] Is Native: true
[TOKEN] STEP 2: Capacitor Preferences loaded
[TOKEN] STEP 3: Storage key: base44_access_token
[TOKEN] STEP 4: Direct Preferences.get() result: {
  key: base44_access_token,
  hasValue: true,
  valueLength: 245,
  truncated: eyJhbGciOiJIUzI1NiIsInR5cCI6...
}
[TOKEN] STEP 5: SDK getToken() result: { 
  hasToken: true, 
  truncated: eyJhbGciOiJIUzI1NiIsIn...
}
[TOKEN] STEP 6: Comparison: {
  directRead: true,
  sdkRead: true,
  match: true
}
═══════════════════════════════════════════════════════
```

### ❌ FAILURE SCENARIOS

#### Scenario A: setToken Never Called

```
[LOGIN] auth success
[No TOKEN_STORAGE logs appear]
[AUTH] Native: no stored token, skipping me() call
```

**Diagnosis:** Login succeeded but `setToken()` was never invoked.
**Fix:** Check if `base44.auth.loginViaEmailPassword()` internally calls `setToken()`.

#### Scenario B: Preferences.set() Fails

```
[TOKEN_STORAGE] Calling Preferences.set()...
[TOKEN_STORAGE] Native iOS SET failed: [Error message]
[TOKEN_STORAGE] Error details: { name: "...", message: "..." }
```

**Diagnosis:** Capacitor Preferences plugin not installed or not synced.
**Fix:** Run `npx cap sync ios` and rebuild.

#### Scenario C: Token Not Found After Save

```
[TOKEN_STORAGE] Preferences.set() completed in 12 ms
[TOKEN_STORAGE] Verifying with Preferences.get()...
[TOKEN_STORAGE] VERIFICATION RESULT: {
  saved: false,
  verified: false,
  match: ❌ MISMATCH
}
[TOKEN_STORAGE] CRITICAL: Preferences.set() succeeded but value not found!
```

**Diagnosis:** Preferences plugin issue or wrong key name.
**Fix:** Check if key names match between set and get operations.

#### Scenario D: Wrong Key Name

```
[TOKEN_STORAGE] Storage key: base44_access_token
...
[TOKEN] STEP 4: Direct Preferences.get() result: {
  key: auth_token,  // ← Different key!
  hasValue: false
}
```

**Diagnosis:** Different parts of code using different key names.
**Fix:** Ensure all code uses `base44_access_token`.

## Key Questions to Answer

After seeing the logs, check:

1. **Is `setToken()` being called?**
   - Look for `[AUTH_OVERRIDE] setToken called`
   - If missing → login flow doesn't call setToken

2. **Is `persist` flag true?**
   - Look for `[AUTH_OVERRIDE] Persist flag: true`
   - If false → token won't be saved

3. **Is Capacitor Preferences available?**
   - Look for `[TOKEN_STORAGE] Using Capacitor Preferences`
   - If using localStorage on iOS → isNative detection failed

4. **Does Preferences.set() succeed?**
   - Look for `Preferences.set() completed in X ms`
   - If error → plugin not installed/synced

5. **Does verification find the token?**
   - Look for `VERIFICATION RESULT: { saved: true }`
   - If false → token not persisted

6. **Do both methods find the token?**
   - Look for `STEP 6: Comparison: { directRead: true, sdkRead: true }`
   - If mismatch → storage wrapper issue

## Storage Key Names

Current implementation uses:
- **TokenStorage.key:** `base44_access_token`
- **AuthContext check:** `base44_access_token`
- **SDK internal:** May use `token` or `base44_access_token`

All must match!

## Next Steps Based on Logs

Share the Xcode console output after login. The logs will tell us exactly where the token persistence fails.