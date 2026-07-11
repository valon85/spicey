# 🔥 Spicey Push Notifications Setup Guide

## Step 1: Get Firebase Service Account Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your Spicey project
3. Click **⚙️ Settings** (gear icon) → **Project settings**
4. Go to **Service accounts** tab
5. Click **Generate new private key**
6. Save the downloaded JSON file as `firebase-service-account.json`

## Step 2: Configure Firebase Project

Make sure you have:
- ✅ **Firebase Cloud Messaging API** enabled
- ✅ **Apple app** registered in Firebase Console (iOS bundle ID: `com.spicey.app`)
- ✅ **APNs Certificate** uploaded to Firebase (from Apple Developer Portal)

## Step 3: Set the Secret

Copy the entire content of `firebase-service-account.json` and set it as the secret:

```bash
# In Base44 Dashboard → Settings → Secrets
Secret Name: FIREBASE_SERVICE_ACCOUNT
Value: {
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",
  ...
}
```

**IMPORTANT:** Paste the entire JSON as a single string (no line breaks).

## Step 4: Build iOS App

```bash
# Run the build script
chmod +x scripts/build-ios-capacitor.sh
./scripts/build-ios-capacitor.sh
```

## Step 5: Configure Xcode

1. Open the iOS project in Xcode (`npx cap open ios`)
2. Select your **Team** (Apple Developer Account)
3. Go to **Signing & Capabilities**:
   - Enable **Push Notifications**
   - Enable **Background Modes** → Check **Remote notifications**
4. Update **Bundle Identifier** to `com.spicey.app`

## Step 6: Upload APNs Certificate to Firebase

1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Create **APNs Certificate** (Production)
3. Download and convert to `.p8` format
4. Upload to Firebase Console → Project Settings → Cloud Messaging → Apple App Configuration

## Step 7: Test Push Notifications

Once the app is running on iOS device:

```javascript
// In browser console or app
import { initializePushNotifications } from '@/lib/pushNotifications';
initializePushNotifications();
```

You should see the APNs token in console.

## Notification Triggers

The following events will trigger push notifications:

- ✅ New message received
- ✅ Someone likes your post
- ✅ Someone comments on your post
- ✅ Someone follows you
- ✅ User goes live (for followers)
- ✅ Incoming call

## Troubleshooting

**No notification sound:**
- Check iOS notification settings for the app
- Ensure APNs certificate is uploaded to Firebase
- Verify `sound: 'default'` in notification payload

**Notifications not received:**
- Check if user granted notification permission
- Verify push token is saved in UserProfile
- Check Firebase Console logs

**Build fails:**
- Ensure Xcode is updated
- Check Apple Developer Account is active
- Verify bundle identifier matches

## Apple App Store Submission

For Apple approval:
1. App must have working push notifications
2. Notifications must have sound when screen is locked
3. Incoming calls must ring even in background
4. Test on real device (not simulator)

Good luck! 🚀