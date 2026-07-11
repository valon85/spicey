# VoIP Services Certificate Setup on Windows

## Step 1: Generate CSR using OpenSSL (Windows)

### Option A: Using OpenSSL for Windows
1. **Download OpenSSL**: https://slproweb.com/products/Win32OpenSSL.html
   - Download "Win64 OpenSSL v3.x" (Light version is fine)
   - Install to default location

2. **Generate Private Key and CSR**:
   Open Command Prompt as Administrator and run:

```cmd
cd "C:\Program Files\OpenSSL-Win64\bin"

openssl genrsa -out voip_private.key 2048

openssl req -new -key voip_private.key -out voip_csr.csr -subj "/emailType=YOUR_APPLE_ID_EMAIL/CN=VoIP Services"
```

Replace `YOUR_APPLE_ID_EMAIL` with your Apple Developer account email.

3. **Upload CSR to Apple**:
   - Go to https://developer.apple.com/account/resources/certificates/list
   - Click "+" → Select "VoIP Services Certificate"
   - Upload `voip_csr.csr`
   - Download `voip_services.cer`

4. **Convert to P12 (for Firebase)**:
```cmd
openssl x509 -in voip_services.cer -inform DER -out voip_services.pem -outform PEM

openssl pkcs12 -export -inkey voip_private.key -in voip_services.pem -out voip_services.p12
```

5. **Upload to Firebase**:
   - Firebase Console → Project Settings → Cloud Messaging → iOS
   - Upload `voip_services.p12` under "VoIP Services Certificate"

### Option B: Using Git Bash (if you have Git installed)
1. Open Git Bash
2. Run the same OpenSSL commands as above

---

## Step 2: Verify Certificate in Firebase

After uploading to Firebase:
- ✅ APNs Key (already uploaded) - for regular push notifications
- ✅ VoIP Services Certificate (new) - for CallKit when app is closed

Both are required for full call functionality.

---

## Step 3: Build for TestFlight

Once certificate is uploaded to Firebase, run:

```bash
# Build web assets
npm run build

# Sync Capacitor
npx cap sync ios

# Open in Xcode (requires Mac or cloud Mac service)
npx cap open ios
```

**Note**: TestFlight build requires Xcode on macOS. If you're on Windows, you'll need:
- A Mac computer (physical or cloud Mac service like MacinCloud)
- Or use a CI/CD service like Codemagic, Bitrise, or GitHub Actions with macOS runners

---

## Alternative: Use Codemagic (Cloud Build for iOS)

If you don't have access to a Mac:

1. **Sign up**: https://codemagic.io
2. **Connect your repo** (if using Git sync)
3. **Configure `codemagic.yaml`**:

```yaml
workflows:
  ios-workflow:
    name: iOS TestFlight
    max_build_duration: 120
    environment:
      ios_signing:
        distribution_type: app_store
        bundle_identifier: com.spicey.app
    scripts:
      - name: Install dependencies
        script: |
          npm install
          npm run build
          npx cap sync ios
      - name: Build iOS
        script: |
          cd ios/App
          xcodebuild -workspace App.xcworkspace \
            -scheme App \
            -configuration Release \
            -archivePath build/App.xcarchive \
            archive
    artifacts:
      - build/App.xcarchive
    publishing:
      app_store_connect:
        auth: integration
        submit_to_testflight: true
```

4. **Add certificates in Codemagic**:
   - Upload your Apple Developer certificate (including VoIP)
   - Upload provisioning profiles
   - Add App Store Connect API key

5. **Trigger build** → Automatically uploads to TestFlight

---

## Current Status

✅ Firebase APNs Key: Active (Development + Production)
⏳ VoIP Services Certificate: Pending (requires CSR)
✅ CallKit Code: Integrated
✅ VoIP Code: Integrated
⏳ TestFlight Build: Waiting for certificate

---

## Next Steps

1. **Generate CSR** using OpenSSL (above)
2. **Upload to Apple** → Download certificate
3. **Upload to Firebase** (VoIP Services section)
4. **Build TestFlight** (requires Mac or cloud build service)

Let me know once the CSR is generated and uploaded! 🚀