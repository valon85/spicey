# TestFlight Build Guide - Windows to iOS

## Prerequisites ✅

- [x] Firebase APNs Key uploaded (Development + Production)
- [x] CallKit + VoIP code integrated
- [x] Apple Developer Account ($99/year)
- [x] App Store Connect account setup

## Step 1: Generate VoIP Certificate (Windows)

Follow instructions in `WINDOWS_CSR_GENERATION.md` to:
1. Generate CSR using OpenSSL
2. Upload to Apple Developer Portal
3. Download and upload to Firebase

## Step 2: Choose Build Method

### Option A: Mac Computer (Recommended)
If you have access to a Mac:

```bash
# 1. Build and sync
npm run build
npx cap sync ios

# 2. Open in Xcode
npx cap open ios

# 3. In Xcode:
#    - Product → Archive
#    - Distribute App → App Store Connect
#    - Upload to TestFlight
```

### Option B: Cloud Mac Service
Services like:
- **MacinCloud** ($20/month): https://macincloud.com
- **MacStadium**: https://www.macstadium.com
- **AWS EC2 Mac**: https://aws.amazon.com/ec2/instance-types/mac1/

Remote desktop into a Mac and follow Option A.

### Option C: CI/CD Service (Automated)
Use **Codemagic** (recommended for Windows users):

1. **Push code to GitHub/GitLab**
2. **Connect repo to Codemagic**: https://codemagic.io
3. **Add `codemagic.yaml`** to your repo root
4. **Configure iOS signing** in Codemagic dashboard:
   - Upload Apple Distribution Certificate (includes VoIP)
   - Upload Provisioning Profile (App Store)
   - Add App Store Connect API Key
5. **Start build** → Auto-uploads to TestFlight

## Step 3: App Store Connect Setup

1. **Create App Record**:
   - Go to https://appstoreconnect.apple.com
   - Apps → + → New App
   - Bundle ID: `com.spicey.app`
   - SKU: `spicey-001`

2. **Add TestFlight Build**:
   - Once uploaded, appears in TestFlight tab
   - Add internal testers (up to 100)
   - Wait for beta review (~24 hours)

3. **Prepare for Public Release**:
   - App Store tab → Create iOS version
   - Add screenshots, description, keywords
   - Submit for review

## Step 4: Required Secrets for CI/CD

If using Codemagic or similar, add these secrets:

```yaml
secrets:
  - APP_STORE_CONNECT_ISSUER_ID: "Your Issuer ID from App Store Connect"
  - APP_STORE_CONNECT_KEY_ID: "Your API Key ID"
  - APP_STORE_CONNECT_API_KEY: "Your .p8 API key content"
  - APPLE_APP_ID: "Your App Store Connect App ID"
  - CERTIFICATE_PRIVATE_KEY: "Your distribution certificate private key"
```

## Step 5: Verify Build

After TestFlight upload:

1. **Check Build Status**:
   - App Store Connect → TestFlight
   - Should show "Ready to Submit" or "Missing Compliance"

2. **Add Testers**:
   - Internal Testing → Add testers
   - External Testing → Submit for beta review

3. **Test VoIP Calls**:
   - Install via TestFlight on real device
   - Test incoming calls when app is:
     - ✅ Open
     - ✅ Backgrounded
     - ✅ Fully closed

## Troubleshooting

### Build Fails with "No signing certificate"
- Ensure VoIP certificate is in your Apple Developer account
- Regenerate provisioning profile to include VoIP entitlement
- Download and install profile in Xcode

### VoIP Calls Don't Work in TestFlight
- Verify VoIP certificate uploaded to Firebase
- Check `Info.plist` has `voip` in background modes
- Test on real device (not simulator)

### App Rejected by Review
- Ensure privacy policy URL is valid
- Add proper app description and screenshots
- Verify age rating is appropriate

## Quick Start (Fastest Path)

**For Windows users without Mac:**

1. Generate VoIP certificate (OpenSSL on Windows)
2. Upload to Firebase
3. Push code to GitHub
4. Use Codemagic with provided `codemagic.yaml`
5. TestFlight build ready in ~30 minutes

**Total time: ~1-2 hours** (including certificate setup)

---

**Need help?** Check:
- `WINDOWS_CSR_GENERATION.md` - CSR generation on Windows
- `IOS_VOIP_CALLKIT_FINAL_CHECKLIST.md` - Complete checklist
- `BUILD_DEPLOYMENT_GUIDE.md` - General deployment guide