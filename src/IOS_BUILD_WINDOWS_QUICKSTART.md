# 🚀 Spicey iOS Build - Windows Quick Start

## Status: Ready to Build ✅

Your app is already configured with:
- ✅ VoIP background mode in `Info.plist`
- ✅ Firebase APNs keys (Development + Production) uploaded
- ✅ CallKit + VoIP code integrated
- ✅ `GoogleService-Info.plist` in place
- ✅ Production push notifications enabled

## What You Need to Do (Windows)

### Step 1: Install OpenSSL for Windows (2 minutes)

1. **Download**: https://slproweb.com/products/Win32OpenSSL.html
   - Click "Win64 OpenSSL v3.1.3 Light" (or latest)
   - Install to: `C:\Program Files\OpenSSL-Win64`

2. **Verify Installation**:
   ```cmd
   "C:\Program Files\OpenSSL-Win64\bin\openssl.exe" version
   ```
   Should show: `OpenSSL 3.1.3`

### Step 2: Generate VoIP Certificate CSR (3 minutes)

Open **Command Prompt as Administrator** and run:

```cmd
cd "C:\Program Files\OpenSSL-Win64\bin"

:: Generate private key
openssl.exe genrsa -out voip_private.key 2048

:: Generate CSR (replace YOUR_EMAIL with your Apple ID)
openssl.exe req -new -key voip_private.key -out voip_csr.csr -subj "/emailType=YOUR_EMAIL@EMAIL.COM/CN=VoIP Services"
```

**Example** (replace with your email):
```cmd
openssl.exe req -new -key voip_private.key -out voip_csr.csr -subj "/emailType=john@example.com/CN=VoIP Services"
```

You now have:
- `voip_private.key` - Keep this secure!
- `voip_csr.csr` - Upload this to Apple

### Step 3: Upload CSR to Apple Developer (2 minutes)

1. **Go to**: https://developer.apple.com/account/resources/certificates/list
2. **Click**: Blue "+" button
3. **Select**: "VoIP Services Certificate"
4. **Choose**: Development (for testing) + Production (for App Store)
   - Create both certificates separately
5. **Upload**: `voip_csr.csr`
6. **Download**: `voip_services_development.cer` and `voip_services_production.cer`

### Step 4: Install Certificates (Windows) (1 minute)

Double-click each `.cer` file to install in Windows Certificate Manager.

**Optional - Export as .p12 for Firebase**:
```cmd
:: Convert CER to PEM
openssl.exe x509 -in voip_services_development.cer -inform DER -out voip_dev.pem -outform PEM

:: Export as P12 (you'll be prompted for a password)
openssl.exe pkcs12 -export -inkey voip_private.key -in voip_dev.pem -out voip_dev.p12

:: Repeat for production
openssl.exe x509 -in voip_services_production.cer -inform DER -out voip_prod.pem -outform PEM
openssl.exe pkcs12 -export -inkey voip_private.key -in voip_prod.pem -out voip_prod.p12
```

### Step 5: Upload to Firebase (1 minute)

1. **Go to**: https://console.firebase.google.com/
2. **Select**: Spicey project
3. **Settings** (gear) → **Cloud Messaging** tab
4. **iOS App Configuration** → **VoIP Services Certificate**
5. **Upload**: 
   - `voip_dev.p12` for Development
   - `voip_prod.p12` for Production
6. **Enter password** you created during export

### Step 6: Build for TestFlight (Choose One Option)

#### Option A: Use Cloud Build Service (Recommended for Windows)

**Codemagic** (easiest):

1. **Push code to GitHub** (if not already)
   ```cmd
   git init
   git add .
   git commit -m "Ready for TestFlight"
   git remote add origin YOUR_REPO_URL
   git push -u origin main
   ```

2. **Sign up**: https://codemagic.io/login/
   - Login with GitHub

3. **Add your app**:
   - Click "Add application"
   - Select Spicey repository
   - Choose "iOS" platform

4. **Configure build** (use `codemagic.yaml` already in your repo):
   - Workflow type: YAML
   - File path: `codemagic.yaml`

5. **Add iOS Signing** (in Codemagic dashboard):
   - Go to "App Settings" → "iOS Signing"
   - Upload your **Apple Distribution Certificate** (includes VoIP)
   - Upload **Provisioning Profile** (App Store)
   - Add **App Store Connect API Key** (from App Store Connect)

6. **Start Build**:
   - Click "Start new build"
   - Wait ~20-30 minutes
   - Automatically uploads to TestFlight

#### Option B: Use a Mac (If Available)

If you have access to a Mac (physical or remote):

```bash
# On Mac, navigate to your project
cd /path/to/spicey

# Install dependencies
npm install

# Build web assets
npm run build

# Sync Capacitor
npx cap sync ios

# Open in Xcode
npx cap open ios
```

**In Xcode**:
1. Select your Team (Signing & Capabilities)
2. Product → Scheme → Edit Scheme → Build → Configuration: Release
3. Product → Archive (wait 5-10 minutes)
4. Organizer window opens → Click "Distribute App"
5. Select "App Store Connect" → Upload
6. Wait for processing → Appears in TestFlight

### Step 7: Verify in TestFlight (1 minute)

1. **Go to**: https://appstoreconnect.apple.com
2. **TestFlight** tab
3. **Your Build** should appear (processing takes 5-15 minutes)
4. **Add Internal Testers**:
   - Click "Internal Testing"
   - "+" to add testers
   - They get email invitation

### Step 8: Test VoIP Calls

On iPhone with TestFlight build:

1. **Install app** from TestFlight
2. **Grant notification permissions**
3. **Fully close app** (swipe up from app switcher)
4. **Send test call** from another user
5. **Should see**: Native CallKit incoming call screen (like regular phone call)

## Quick Command Reference

### OpenSSL Commands (Windows):
```cmd
cd "C:\Program Files\OpenSSL-Win64\bin"
openssl.exe genrsa -out voip_private.key 2048
openssl.exe req -new -key voip_private.key -out voip_csr.csr -subj "/emailType=YOUR_EMAIL/CN=VoIP Services"
```

### Git Commands (if needed):
```cmd
git init
git add .
git commit -m "iOS VoIP ready"
git push -u origin main
```

## Troubleshooting

### "openssl not recognized"
- OpenSSL not installed or not in PATH
- Use full path: `"C:\Program Files\OpenSSL-Win64\bin\openssl.exe"`

### "Invalid CSR"
- Ensure email in CSR matches your Apple ID
- Re-generate CSR with correct email

### "Certificate upload failed"
- Ensure .p12 password is correct
- Try re-exporting with simpler password (no special chars)

### "Build failed in Codemagic"
- Check iOS signing certificates are valid
- Verify bundle ID matches: `com.spicey.app`
- Check logs for specific error

## Timeline

- **Step 1-5** (Certificate setup): ~10 minutes
- **Step 6** (Build): 20-30 minutes (automated)
- **Step 7-8** (Test): 5 minutes
- **Total**: ~45 minutes to TestFlight ready

## What Happens After Upload

1. **Apple processes build** (5-15 min)
2. **Beta review** (for external testers, ~24 hours)
3. **Internal testers** can install immediately
4. **Test VoIP calls** when app is fully closed

---

## Need Help?

- **CSR generation**: Check `WINDOWS_CSR_GENERATION.md`
- **Full checklist**: `IOS_VOIP_CALLKIT_FINAL_CHECKLIST.md`
- **TestFlight guide**: `TESTFLIGHT_BUILD_GUIDE.md`

**Your app is 100% ready** - just need the VoIP certificate! 🔥