# ✅ iOS Setup Checklist - Spicey App

## Hapi 1: Firebase Console (5 minuta)

### 1.1 Download GoogleService-Info.plist
- [ ] Shko te [Firebase Console](https://console.firebase.google.com/)
- [ ] Zgjidh project-in **Spicey**
- [ ] **Project Settings** → **Your apps** → iOS app
- [ ] Download **GoogleService-Info.plist**

### 1.2 Upload APNs Key
- [ ] Krijo APNs Key te [Apple Developer](https://developer.apple.com/account/resources/authkeys/list)
- [ ] Download .p8 file
- [ ] Firebase Console → **Cloud Messaging** → **iOS App Configuration**
- [ ] Upload .p8 file
- [ ] Shëno **Key ID** dhe **Team ID**

### 1.3 Upload VoIP Certificate
- [ ] Krijo CSR me **Keychain Access** (Certificate Signing Request)
- [ ] Krijo **VoIP Services Certificate** te [Apple Developer](https://developer.apple.com/account/resources/certificates/list)
- [ ] Export si .p12 me password
- [ ] Firebase Console → **Cloud Messaging** → **VoIP Services Certificate**
- [ ] Upload .p12 dhe vendos password

---

## Hapi 2: Base44 Secrets (2 minuta)

Shko te **Base44 Dashboard → Settings → Environment Variables**

- [ ] Shto: `APNS_KEY_ID` = [Key ID nga Firebase]
- [ ] Shto: `APNS_TEAM_ID` = [Team ID nga Apple Developer]

---

## Hapi 3: Xcode Configuration (10 minuta)

### 3.1 Build App-in
```bash
./scripts/build-ios-capacitor.sh
```

### 3.2 Hap në Xcode
- [ ] Shko te `ios/App/`
- [ ] Hap `App.xcworkspace`

### 3.3 Shto GoogleService-Info.plist
- [ ] **File** → **Add Files to "App"**
- [ ] Zgjidh `GoogleService-Info.plist`
- [ ] Check **Copy items if needed**
- [ ] **Add**

### 3.4 Aktivizo Capabilities
- [ ] Zgjidh project-in → **Target: App**
- [ ] **Signing & Capabilities** → **+ Capability**
- [ ] Shto **Push Notifications**
- [ ] **+ Capability** → Shto **Background Modes**
- [ ] Check:
  - ✅ **Remote notifications**
  - ✅ **Voice over IP**
  - ✅ **Background fetch**

### 3.5 Konfiguro Signing
- [ ] Zgjidh **Team**-in tënd
- [ ] **Bundle Identifier**: `com.spicey.app`
- [ ] **Provisioning Profile**: Automatic

---

## Hapi 4: Test në iPhone Real (5 minuta)

### 4.1 Build & Run
- [ ] Connect iPhone me USB
- [ ] Në Xcode, zgjidh iPhone nga dropdown
- [ ] **Product** → **Clean Build Folder** (Shift+Cmd+K)
- [ ] **Product** → **Build** (Cmd+B)

### 4.2 Test Notifications
- [ ] Hap app në iPhone
- [ ] Login
- [ ] Mbyll app (swipe up)
- [ ] Dërgo message nga device tjetër
- [ ] ✅ Duhet të vijë notification me zili

### 4.3 Test Thirrjet
- [ ] Mbyll app plotësisht
- [ ] Nisu thirrje nga device tjetër
- [ ] ✅ Duhet të shohësh CallKit UI (si thirrje normale)
- [ ] ✅ Zili dhe vibration

---

## Troubleshooting

### Notification nuk vjen
- ❌ App-i nuk është mbyllur plotësisht
- ❌ Nuk ke dhënë permission
- ❌ Firebase nuk ka token-in

### Thirrja nuk bie zile
- ❌ Mungon **VoIP Certificate** në Firebase
- ❌ Mungon **Voice over IP** te Background Modes
- ❌ Payload nuk ka `content_available: true`

### GoogleService-Info.plist error
- ❌ File nuk është shtuar në Xcode
- ❌ File është në vend të gabuar (duhet në `ios/App/App/`)

---

## Pas Testimit

Kur gjithçka punon:

### Production Build
```bash
./scripts/build-ios-capacitor.sh --release
```

### App Store Submission
- [ ] Xcode → **Product** → **Archive**
- [ ] **Distribute App** → **App Store Connect**
- [ ] Upload për **TestFlight**

---

## Files që janë përditësuar

✅ `lib/pushNotifications.js` - Shtuar VoIP token support
✅ `components/VoIPProvider.jsx` - VoIP initialization
✅ `App.jsx` - Përfshirë VoIPProvider
✅ `COMPLETE_IOS_SETUP.md` - Guidë e plotë
✅ `IOS_SETUP_CHECKLIST.md` - Kjo checklist

---

**Koha totale e nevojshme: ~20-25 minuta**

Pas kësaj, app-i yt do të ketë:
- ✅ Push notifications për messages, posts, likes
- ✅ Thirrjet bien zile edhe kur app-i është mbyllur
- ✅ CallKit UI (native iPhone experience)
- ✅ Vibration dhe sound për të gjitha

🔥 **Gati për App Store!**