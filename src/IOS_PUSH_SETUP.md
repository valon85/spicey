# 🔥 Spicey iOS Push Notifications Setup Guide

## Step 1: Create APNs Key in Apple Developer Portal

1. Go to [Apple Developer Portal](https://developer.apple.com/account/resources/authkeys/list)
2. Click "+" to create a new key
3. Select **"Apple Push Notifications service (APNs)"**
4. Click **Continue** → **Register**
5. **Download the .p8 file** (save it securely - you can only download once!)
6. Note the **Key ID** (shown after download)

## Step 2: Find Your Team ID

1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. Click **Membership** in the sidebar
3. Your **Team ID** is displayed at the top

## Step 3: Configure Secrets in Base44 Dashboard

Go to **Dashboard → Settings → Environment Variables** and add:

```
APNS_KEY = [paste contents of .p8 file]
APNS_KEY_ID = [your Key ID from Step 1]
APNS_TEAM_ID = [your Team ID from Step 2]
```

## Step 4: Configure iOS App in Xcode

1. Run `./scripts/build-ios-capacitor.sh`
2. In Xcode, select your project
3. Go to **Signing & Capabilities**
4. Click **+ Capability** → Add **Push Notifications**
5. Click **+ Capability** → Add **Background Modes** → Check **Remote notifications**

## Step 5: Test Push Notifications

Once configured, the app will automatically:
- ✅ Register with APNs on login
- ✅ Save push token to UserProfile
- ✅ Receive notifications for messages, posts, and calls

## Testing

To test, create a new post or send a message — notifications should appear with **sound and vibration** even when app is in background!

---

**Important:** APNs only works on **real iOS devices**, not simulator.