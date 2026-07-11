# 🔥 iOS Thirrje & Notifications - Konfigurimi i Plotë

## Pjesa 1: Firebase Configuration (Duhet bërë në Firebase Console)

### 1.1 Merrni GoogleService-Info.plist

1. Shko te [Firebase Console](https://console.firebase.google.com/)
2. Zgjidh project-in **Spicey**
3. **Project Settings** (gear icon ⚙️)
4. Te **Your apps**, zgjidh app-in iOS (com.spicey.app)
5. Download **GoogleService-Info.plist**

### 1.2 Aktivizo Cloud Messaging

1. Në **Project Settings** → **Cloud Messaging** tab
2. Sigurohu që **Cloud Messaging API** është **Enabled**
3. Ruaj **Project ID** dhe **Web API Key** (këto tashmë janë te secrets)

---

## Pjesa 2: Apple Developer Configuration

### 2.1 Krijo APNs Key (Për notifications të zakonshme)

1. Shko te [Apple Developer Portal](https://developer.apple.com/account/resources/authkeys/list)
2. Kliko **+** → **Apple Push Notifications service (APNs)**
3. **Continue** → **Register** → **Continue** → **Register**
4. **Download .p8 file** (RUAJE - mund ta download-oni vetëm 1 herë!)
5. Shëno **Key ID** (shfaqet pas download-it)

### 2.2 Merr Team ID

1. Shko te [Apple Developer Portal](https://developer.apple.com/account/)
2. Kliko **Membership** në sidebar
3. **Team ID** shfaqet lart (10 characters, p.sh. `ABC123XYZ9`)

### 2.3 Krijo VoIP Certificate (Për thirrjet kur app-i është mbyllur)

#### Hapi A: Krijo CSR (Certificate Signing Request)

Në Mac:
1. Hap **Keychain Access** app
2. Menu: **Keychain Access** → **Certificate Assistant** → **Request a Certificate From a Certificate Authority**
3. Plotëso:
   - **User Email Address**: email-i i Apple ID tënd
   - **Common Name**: emri yt
   - **CA Email Address**: lëre bosh
4. Zgjidh **Saved to disk**
5. **Continue** → ruaje si `CertificateSigningRequest.certSigningRequest`

#### Hapi B: Krijo VoIP Certificate

1. Shko te [Apple Developer Portal](https://developer.apple.com/account/resources/certificates/list)
2. Kliko **+** → **VoIP Services Certificate**
3. **Continue** → zgjidh **Development** (për testim)
4. **Continue** → upload `CertificateSigningRequest.certSigningRequest`
5. **Generate** → download `voip_services_certificate.cer`

#### Hapi C: Export si .p12

1. Double-click `voip_services_certificate.cer` për ta importuar në Keychain
2. Në **Keychain Access**, gjej certifikatën "VoIP Services"
3. **Right-click** → **Export "VoIP Services..."**
4. Ruaje si `VoIP.p12`
5. **Vendos password** (MBAJE MEND!)

---

## Pjesa 3: Upload Credentials në Firebase

### 3.1 Upload APNs Key

1. Firebase Console → **Project Settings** → **Cloud Messaging**
2. Te **iOS App Configuration** → **Apple Push Notifications service (APNs)**
3. Kliko **Upload Key**
4. Upload file `.p8` që download-ove nga Apple
5. Ruaj **Key ID** dhe **Team ID**

### 3.2 Upload VoIP Certificate

1. Në të njëjtën faqe **Cloud Messaging**
2. Te **VoIP Services Certificate**
3. Kliko **Upload Certificate**
4. Zgjidh `VoIP.p12`
5. Vendos password-in që krijove
6. **Save**

---

## Pjesa 4: Shto Secrets në Base44

Shko te **Base44 Dashboard → Settings → Environment Variables** dhe shto:

```
APNS_KEY_ID = [Key ID nga Hapi 2.1]
APNS_TEAM_ID = [Team ID nga Hapi 2.2]
```

APNS Key content do të merret automatikisht nga Firebase.

---

## Pjesa 5: Konfiguro iOS App në Xcode

### 5.1 Build App-in

```bash
./scripts/build-ios-capacitor.sh
```

### 5.2 Hap në Xcode

1. Shko te `ios/App/`
2. Hap `App.xcworkspace` në Xcode

### 5.3 Shto GoogleService-Info.plist

1. Në Xcode, **File** → **Add Files to "App"**
2. Zgjidh `GoogleService-Info.plist` që download-ove
3. Sigurohu që **Copy items if needed** është checked
4. **Add**

### 5.4 Aktivizo Background Modes

1. Në Xcode, zgjidh project-in (në të majtë)
2. Zgjidh **Target: App**
3. Shko te **Signing & Capabilities**
4. Kliko **+ Capability** → shto **Push Notifications**
5. Kliko **+ Capability** → shto **Background Modes**
6. Te **Background Modes**, check:
   - ✅ **Remote notifications**
   - ✅ **Voice over IP**
   - ✅ **Background fetch**

### 5.5 Konfiguro Signing

1. Te **Signing & Capabilities**
2. Zgjidh **Team**-in tënd
3. **Bundle Identifier** duhet të jetë: `com.spicey.app`
4. Zgjidh **Provisioning Profile** (automatic)

---

## Pjesa 6: Testimi në iPhone Real

### 6.1 Connect iPhone

1. Connect iPhone me USB
2. Në Xcode, zgjidh device-in tënd nga dropdown (në vend të simulatorit)

### 6.2 Build & Run

1. **Product** → **Clean Build Folder** (Shift+Cmd+K)
2. **Product** → **Build** (Cmd+B)
3. App do të instalohet në iPhone

### 6.3 Testo Notifications

1. **Hap app-in** në iPhone
2. **Login** me account
3. **Mbyll app-in** plotësisht (swipe up nga home)
4. Nga një device tjetër, **dërgo një message** ose **krijo post**
5. Duhet të marrësh **notification me zili dhe vibration**

### 6.4 Testo Thirrjet

1. **Mbyll app-in** plotësisht
2. Nga device tjetër, **nisu një thirrje**
3. Duhet të shohësh **CallKit UI** (si thirrje normale iPhone)
4. **Accept** → thirrja fillon
5. **Decline** → thirrja refuzohet

---

## Pjesa 7: Troubleshooting

### Notification nuk vjen

- ❌ App-i nuk është mbyllur plotësisht (vetëm në background)
- ❌ Nuk ke dhënë permission për notifications
- ❌ Firebase nuk ka token-in e user-it

### Thirrja nuk bie zile

- ❌ Mungon **VoIP Services Certificate** në Firebase
- ❌ Mungon **Voice over IP** te Background Modes
- ❌ Payload nuk ka `"content_available": true`

### Error: "Invalid certificate"

- ❌ Password i gabuar te .p12
- ❌ Certificate e expired (1 vit validity)
- ❌ Upload Development cert për Production build

### GoogleService-Info.plist nuk gjendet

- ❌ File nuk është shtuar në Xcode project
- ❌ File është në vend të gabuar (duhet në `ios/App/App/`)

---

## Pjesa 8: Production Build (App Store)

Për App Store release, duhet:

### 8.1 Krijo Production Certificates

1. Përsërit hapat e mësipërm
2. Zgjidh **Production** instead of **Development**
3. Upload në Firebase si **Production Certificate**

### 8.2 Build Production App

```bash
# Build për App Store
./scripts/build-ios-capacitor.sh --release
```

### 8.3 TestFlight

1. Xcode → **Product** → **Archive**
2. **Distribute App** → **App Store Connect**
3. Upload për **TestFlight** testing

---

## Checklist Final

Para se të publish-oni:

- [ ] ✅ GoogleService-Info.plist shtuar në Xcode
- [ ] ✅ APNs Key upload në Firebase
- [ ] ✅ VoIP Certificate upload në Firebase
- [ ] ✅ Background Modes aktivizuar (Remote, VoIP, Background Fetch)
- [ ] ✅ Push Notifications capability shtuar
- [ ] ✅ Secrets të shtuara në Base44 (APNS_KEY_ID, APNS_TEAM_ID)
- [ ] ✅ Testuar në iPhone real
- [ ] ✅ Notifications punojnë kur app-i është mbyllur
- [ ] ✅ Thirrjet punojnë me CallKit UI

---

**Kur të kesh përfunduar këto hapa, app-i yt do të ketë:**

✅ Push notifications për messages, posts, likes, comments
✅ Thirrjet bien zile edhe kur app-i është mbyllur plotësisht
✅ CallKit UI (native iPhone call experience)
✅ Vibration dhe sound për të gjitha notifications

🔥 **Spicey është gati për App Store!**