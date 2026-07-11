# 🔥 Firebase VoIP Push Configuration

## Pse duhet VoIP Certificate?

Për të dërguar call notifications kur app-i është **i mbyllur**, duhet **VoIP Services Certificate** - është ndryshe nga APNs certificate e zakonshme.

## Hapi 1: Krijo VoIP Certificate

### 1.1 Apple Developer Portal

1. Shko te [Apple Developer Portal](https://developer.apple.com/account/resources/certificates/list)
2. Kliko **+** (Create Certificate)
3. Zgjidh **VoIP Services Certificate**
4. Kliko **Continue**
5. Zgjidh **Development** ose **Production** (të dyja nëse duhet)
6. Kliko **Continue**

### 1.2 Krijo CSR (Certificate Signing Request)

Në Mac:
1. Hap **Keychain Access** app
2. Menu: **Keychain Access** → **Certificate Assistant** → **Request a Certificate From a Certificate Authority**
3. Plotëso:
   - **User Email Address**: email-i i Apple ID tënd
   - **Common Name**: emri yt
   - **CA Email Address**: lëre bosh
4. Zgjidh **Saved to disk**
5. Kliko **Continue** → ruaje `CertificateSigningRequest.certSigningRequest`

### 1.3 Upload CSR

1. Kthehu te Apple Developer Portal
2. Upload `CertificateSigningRequest.certSigningRequest`
3. Kliko **Generate**
4. Download `voip_services_certificate.cer`

### 1.4 Export si .p12

1. Double-click `voip_services_certificate.cer` për ta importuar në Keychain
2. Në **Keychain Access**, gjej certifikatën "VoIP Services"
3. Right-click → **Export "VoIP Services..."**
4. Ruaje si `VoIP.p12`
5. Vendos password (mbaje mend!)

## Hapi 2: Upload në Firebase

### 2.1 Firebase Console

1. Shko te [Firebase Console](https://console.firebase.google.com/)
2. Zgjidh project-in e Spicey
3. **Project Settings** (gear icon)
4. **Cloud Messaging** tab

### 2.2 Upload VoIP Certificate

1. Te **iOS App Configuration**, gjej **VoIP Services Certificate**
2. Kliko **Upload Certificate**
3. Zgjidh file `VoIP.p12`
4. Vendos password-in që krijove
5. Kliko **Save**

### 2.3 Merr Project ID dhe API Key

Nga e njëjta faqe:
- **Project ID**: `spicey-xxxxx` (ruaje)
- **Web API Key**: `AIzaSy...` (ruaje)

Këto duhet të jenë tashmë te secrets:
- ✅ `FIREBASE_PROJECT_ID`
- ✅ `FIREBASE_API_KEY`

## Hapi 3: Test Push Notifications

### 3.1 Dërgo Test Push

Përdor këtë payload për të testuar:

```json
POST https://fcm.googleapis.com/fcm/send

Headers:
  Authorization: key=FIREBASE_API_KEY
  Content-Type: application/json

Body:
{
  "to": "VOIP_PUSH_TOKEN",
  "content_available": true,
  "priority": "high",
  "data": {
    "type": "call",
    "callerName": "Test User",
    "callerHandle": "test_user",
    "callType": "video",
    "callSessionId": "test_123"
  }
}
```

### 3.2 Merr VoIP Token nga App

Në iOS app, VoIP token mund ta marrësh nga:

```javascript
// Nga web app përmes Capacitor
const voipToken = await window.Capacitor.Plugins.Storage.get({ 
  key: 'voipPushToken' 
});
console.log('VoIP Token:', voipToken.value);
```

Ose nga Xcode logs kur app starton.

### 3.3 Test Flow

1. **Build & Run** app në iPhone
2. **Mbyll app-in** plotësisht (swipe up)
3. **Dërgo push notification** me payload-in e mësipërm
4. **Duhet të shohësh**:
   - ✅ Zili si thirrje normale
   - ✅ Lock screen me Accept/Decline buttons
   - ✅ CallKit UI (jo notification e zakonshme)

## Hapi 4: Production Setup

Për App Store release:

### 4.1 Krijo Production VoIP Certificate

- Njek të njëjtat hapa si më sipër
- Zgjidh **Production** instead of Development
- Upload në Firebase si **Production Certificate**

### 4.2 Konfiguro FCM Payload

Për production, përdor:

```json
{
  "to": "VOIP_TOKEN",
  "content_available": true,
  "priority": "high",
  "data": {
    "type": "call",
    "callerName": "...",
    // ...
  },
  "mutable_content": true
}
```

## Troubleshooting

### Push notification vjen por nuk zë
- ❌ Mungon **VoIP** te Background Modes
- ❌ Payload ka `"notification"` instead of `"data"`
- ❌ App-i nuk është mbyllur plotësisht (vetëm në background)

### Error: "Invalid certificate"
- ❌ Password i gabuar te .p12
- ❌ Certificate e expired (1 vit validity)
- ❌ Upload Development cert për Production build

### VoIP token nuk gjendet
- Sigurohu që **Background Modes → Voice over IP** është aktiv
- Rindërto app (Clean Build Folder)
- Kontrollo Xcode logs për "VoIP push token"

## Next Steps

1. ✅ Krijo VoIP Certificate
2. ✅ Upload në Firebase
3. ✅ Test push notification
4. ✅ Build production app me CallKit

Pas kësaj, app-i yt do të ketë **native call experience** si TikTok/Instagram/WhatsApp! 🔥