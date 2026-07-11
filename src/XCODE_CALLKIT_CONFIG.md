# 📱 Xcode Configuration për CallKit

## Hapat për të konfiguruar Xcode Project

### 1. Hap Project-in

```bash
# Nga rrënja e projektit
npx cap open ios
```

### 2. Shto Capabilities

1. Në Xcode, zgjidh **target** "App" në të majtë
2. Shko te **Signing & Capabilities** tab
3. Kliko **+ Capability** dhe shto:

#### A. Push Notifications
- ✅ **Push Notifications**

#### B. Background Modes
- ✅ **Background Modes**
- ✅勾选 **Voice over IP**
- ✅勾选 **Background fetch**
- ✅勾选 **Remote notifications**

### 3. Konfiguro Info.plist

Hap `ios/App/App/Info.plist` si Source Code dhe shto:

```xml
<key>UIBackgroundModes</key>
<array>
    <string>voip</string>
    <string>remote-notification</string>
    <string>fetch</string>
</array>

<key>NSMicrophoneUsageDescription</key>
<string>Spicey needs microphone access for voice and video calls</string>

<key>NSCameraUsageDescription</key>
<string>Spicey needs camera access for video calls and content creation</string>
```

### 4. Shto Ringtone File

1. Gjej file `ringtone.caf` (ose krijoje vetë)
2. Drag & drop në Xcode te folderi "App"
3. Sigurohu që është i zgjedhur te **Target Membership** → "App"
4. Shko te **Build Phases** → **Copy Bundle Resources** → shto `ringtone.caf`

### 5. Konfiguro Signing

1. Në **Signing & Capabilities**:
   - ✅ **Automatically manage signing**: ON
   - ✅ **Team**: Zgjidh Apple Developer Account tënd ($99)
   - ✅ **Bundle Identifier**: duhet të jetë unik (psh: `com.spicey.app`)
   - ✅ **Signing Certificate**: iOS Distribution
   - ✅ **Provisioning Profile**: Automatic

### 6. Shto Files në Project

Sigurohu që këto files janë në project:

- ✅ `ios/App/App/CallKitManager.swift`
- ✅ `ios/App/App/CallKitPlugin.swift`
- ✅ `ios/App/App/AppDelegate.swift`
- ✅ `ios/App/App/SceneDelegate.swift`

Nëse mungojnë:
1. Drag & drop files në Xcode te folderi "App"
2. Zgjidh **Target Membership** → "App"

### 7. Build Project

```bash
# Në Xcode
Product → Clean Build Folder (⇧⌘K)
Product → Build (⌘B)
```

### 8. Test në Device Fizik

1. Lidh iPhone-in tënd me Mac
2. Në Xcode, zgjidh device-in nga dropdown (nuk punon në simulator!)
3. **Product → Run (⌘R)**
4. Trust app-in në iPhone kur të shfaqet

## Troubleshooting

### Error: "No signing certificate found"
- Shko te Xcode → Preferences → Accounts
- Shto Apple ID tënd
- Download signing certificates

### Error: "Provisioning profile not found"
- Xcode → Signing & Capabilities
- Kliko "Try Again" te provisioning profile

### CallKit nuk shfaqet
- Sigurohu që Background Modes → Voice over IP është aktiv
- Test në device fizik, jo simulator
- Rindërto app (Clean Build Folder)

### Push notifications nuk vijnë
- Duhet të upload APNs certificate në Firebase Console
- Për VoIP calls, duhet **VoIP Services Certificate** (ndryshe nga APNs)

## Next Step: Firebase Configuration

Pasi të kesh konfiguruar Xcode, duhet të:
1. Krijosh VoIP Services Certificate në Apple Developer Portal
2. Upload certificate në Firebase Console
3. Test push notifications për calls

Shiko `FIREBASE_VOIP_SETUP.md` për hapat e ardhshëm.