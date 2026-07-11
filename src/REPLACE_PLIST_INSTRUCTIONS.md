# 📥 Replace GoogleService-Info.plist

## You have the REAL GoogleService-Info.plist file

**DO NOT use the placeholder file in `ios/App/App/`**

---

## ✅ Steps to Replace

### 1. Copy Your Real File

```bash
# Assuming your downloaded file is in ~/Downloads
cp ~/Downloads/GoogleService-Info.plist ./ios/App/App/GoogleService-Info.plist
```

Or manually:
- Navigate to `ios/App/App/` in Finder
- Delete the existing `GoogleService-Info.plist`
- Drag your **real** `GoogleService-Info.plist` from Downloads into this folder

### 2. Verify It's There

```bash
ls -la ios/App/App/GoogleService-Info.plist
```

You should see the file with today's timestamp.

### 3. Sync Capacitor

```bash
npx cap sync ios
```

This will copy the plist into the Xcode project.

### 4. Build iOS

```bash
# Clean previous builds
rm -rf dist/

# Install dependencies
npm ci

# Build web assets
npm run build

# Sync to iOS
npx cap sync ios

# Open in Xcode
npx cap open ios
```

---

## 🔨 In Xcode

1. **Select Project** → **Signing & Capabilities**
2. Verify:
   - ✅ Team: Your Apple Developer Team
   - ✅ Bundle ID: `com.spicey.app`
   - ✅ Push Notifications capability
   - ✅ Background Modes: Remote notifications + Voice over IP

3. **Product** → **Clean Build Folder** (Shift+Cmd+K)

4. **Product** → **Build** (Cmd+B)

5. **Product** → **Archive**

6. **Distribute App** → **TestFlight & App Store** → **Upload**

---

## ✅ Verification

After building, push notifications will work because:

- ✅ APNs Key ID: `FWS388M7G3` (uploaded to Firebase)
- ✅ Team ID: `NXLT2KD2JK` (your Apple team)
- ✅ Real `GoogleService-Info.plist` (from your Firebase iOS app)
- ✅ Bundle ID matches: `com.spicey.app`

---

## 🧪 Test on Device

1. Install via TestFlight
2. Login to Spicey
3. Grant notification permissions
4. Send message/like from another account
5. ✅ Notification should appear with sound

---

**Your Firebase project is already configured correctly - just replace the plist file!**