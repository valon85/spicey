# Banuba SDK iOS Debugging Guide

## What Was Fixed

### 1. **Comprehensive Logging** (`BanubaCamera.jsx`)
- Added detailed console logs for EVERY initialization step
- Shows exact error messages instead of generic "SDK not available"
- Logs token decoding, validation, and expiration status
- Tracks script loading, player creation, and effect application
- Debug info panel visible during loading

### 2. **Diagnostic Page** (`/banuba-diagnostic`)
- Run complete system diagnostics
- Check Banuba token validity and expiration
- Verify all SDK assets are present
- Test WASM file accessibility
- Detect iOS Capacitor environment
- Copy logs to clipboard for debugging

### 3. **Asset Management** (`scripts/copy-banuba-assets.js`)
- Automatically copies Banuba files to dist and iOS www folders
- Creates MIME type configuration
- Ensures WASM files are properly served

### 4. **WASM Support** (`vite.config.js`)
- Added proper headers for WASM loading
- Configured Cross-Origin policies
- Ensured assets are copied correctly

## How to Use

### Option 1: Test Banuba Camera
```
Navigate to: /banuba-test
```
This will show detailed loading logs and the exact error if it fails.

### Option 2: Run Full Diagnostics
```
Navigate to: /banuba-diagnostic
```
This runs a complete system check and shows:
- Token status (valid/expired)
- Asset availability
- WASM file detection
- Platform detection (iOS/Web)
- Actionable next steps

### Option 3: Check Console Logs
Open Safari Web Inspector on iOS device:
1. Enable Web Inspector in iPhone Settings → Safari → Advanced
2. On Mac: Safari → Develop → [Your Device] → [Your App]
3. Check console for logs starting with `🎭`

## Common Issues & Solutions

### Issue: "Banuba token not available"
**Solution:** Check `BANUBA_CLIENT_TOKEN` secret is set in Base44 dashboard

### Issue: "Token is EXPIRED"
**Solution:** 
1. Go to https://account.banuba.com
2. Generate new client token
3. Update `BANUBA_CLIENT_TOKEN` secret

### Issue: "Failed to load Banuba SDK script"
**Solution:**
1. Run: `node scripts/copy-banuba-assets.js`
2. Run: `npx cap copy ios`
3. Rebuild iOS app

### Issue: "BanubaPlayer not found"
**Solution:**
- Verify `/banuba/BanubaSDK.browser.js` exists in dist folder
- Check file permissions on iOS
- Ensure WASM MIME type is `application/wasm`

### Issue: Works on web but not iOS
**Solution:**
1. Check iOS console logs (Safari Web Inspector)
2. Verify WASM files are copied to `ios/App/www/banuba/`
3. Ensure `Info.plist` has proper permissions
4. Check Capacitor is not blocking WASM

## File Locations

```
public/banuba/           # Source Banuba SDK files
dist/banuba/             # Built web assets
ios/App/www/banuba/      # iOS app assets (after cap copy)
```

## Required Files

All these must exist:
- `BanubaSDK.browser.js`
- `BanubaSDK.browser.esm.js`
- `BanubaSDK.wasm`
- `BanubaSDK.simd.wasm`
- `BanubaSDK.data`

## Testing Checklist

- [ ] Token is valid and not expired
- [ ] All 7 Banuba files exist in public/banuba/
- [ ] Files copied to dist/banuba/
- [ ] Files copied to ios/App/www/banuba/
- [ ] Run diagnostics page - all checks pass
- [ ] Test on actual iOS device (not just simulator)
- [ ] Check Safari Web Inspector logs

## Support

If still failing:
1. Run `/banuba-diagnostic` and screenshot results
2. Copy console logs from Safari Web Inspector
3. Check token at https://account.banuba.com
4. Verify BANUBA_CLIENT_TOKEN secret is set correctly