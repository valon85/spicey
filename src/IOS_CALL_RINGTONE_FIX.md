# 📱 iOS Call Ringtone & Vibration Fix

## Problemet e Identifikuara

1. ❌ Zilja nuk bie kur app-i është mbyllur
2. ❌ Nuk ka vibrim
3. ❌ Nuk ka notification sound
4. ❌ Punon vetëm kur app-i është hapur

## Zgjidhjet e Implementuara

### 1. **Ringtone i Përmirësuar** ✅
- Përdor Web Audio API me dual-tone (440Hz + 523.25Hz)
- Pattern: 2 sekonda on, 2 sekonda off
- Volum: 50% për të mos qenë shumë i lartë
- Loading automatik në `App.jsx`

### 2. **Vibrim Agresiv** ✅
- Pattern: [500ms, 200ms, 500ms, 200ms, 800ms]
- Përsëritet çdo 2.5 sekonda
- Ndalon automatikisht kur pranon/refuzon thirrjen

### 3. **VoIP Push Notifications** ✅
- Token ruhet në UserProfile (`voip_push_token`)
- Firebase FCM me `priority: high` dhe `content-available: 1`
- Përdor `default` sound për system ringtone

### 4. **CallKit Integration** ✅
- Native iOS call UI
- System ringtone kur app-i është mbyllur
- Wake-up nga background

## 🔧 Çfarë Duhet të Bësh në Xcode

### Hapi 1: Shto Background Modes
1. Hap `ios/App/App.xcworkspace`
2. Shko te **Signing & Capabilities**
3. Shto **Background Modes**
4. Check:
   - ✅ **Voice over IP**
   - ✅ **Remote notifications**
   - ✅ **Audio, AirPlay, and Picture in Picture**

### Hapi 2: Konfiguro VoIP Certificate
1. Shko te **Apple Developer Portal**
2. Krijo **VoIP Push Notification Certificate**
3. Shkarko `.cer` dhe instalo në Keychain
4. Export si `.p12`
5. Konverto në `.pem`:
   ```bash
   openssl pkcs12 -in voip_cert.p12 -out voip_cert.pem -nodes -clcerts
   ```

### Hapi 3: Upload në Firebase
1. Firebase Console → **Project Settings** → **Cloud Messaging**
2. Upload **VoIP Certificate** (jo APNs normal)
3. Sigurohu që është marked si **VoIP**

### Hapi 4: Info.plist Configuration
Sigurohu që këto ekzistojnë:
```xml
<key>UIBackgroundModes</key>
<array>
    <string>fetch</string>
    <string>remote-notification</string>
    <string>voip</string>
    <string>audio</string>
</array>
```

### Hapi 5: Build & Test
```bash
npm run build
npx cap sync ios
npx cap open ios
```

**Në Xcode:**
- Select your team
- Build → Run në **real device** (simulator nuk supporton VoIP)

## 🧪 Si të Testosh

### Test 1: App i Hapur
1. Login në app
2. Kontrollo console: `[VoIP] Token retrieved`
3. Bëj thirrje nga një device tjetër
4. **Duhet të dëgjosh:** Ringtone + vibrim

### Test 2: App në Background
1. Minimize app
2. Bëj thirrje
3. **Duhet të shohësh:** CallKit UI + system ringtone

### Test 3: App i Mbyllur
1. Mbyll app plotësisht
2. Bëj thirrje
3. **Duhet të shohësh:** Native call screen + system ringtone

## 🐛 Debugging

### Nëse nuk ka ziles:
```javascript
// Në browser console (për web):
window.startRingtone();
// Duhet të dëgjosh tone

// Në iOS:
// Check nëse ringtone.js po ngarkohet
// Check nëse audio context është i lejuar
```

### Nëse nuk ka vibrim:
```javascript
// Test vibration:
navigator.vibrate([500, 200, 500]);
// Duhet të vibrojë

// Nëse nuk funksionon:
// iOS e bllokon vibrimin në disa raste
// Test në real device, jo simulator
```

### Nëse nuk vjen notification:
1. Kontrollo në `UserProfile` që ekziston `voip_push_token`
2. Kontrollo Firebase logs për delivery status
3. Kontrollo që `FIREBASE_API_KEY` është e saktë

## 📋 Checklist

- [ ] VoIP background mode enabled
- [ ] VoIP certificate generated
- [ ] Certificate uploaded to Firebase
- [ ] `voip_push_token` saved in UserProfile
- [ ] Ringtone tested (app open)
- [ ] CallKit works (app background)
- [ ] System ringtone works (app closed)
- [ ] Vibration works

## 🔑 Përmbledhje

**Tani funksionon kështu:**

1. **App hapur:** Web Audio ringtone + vibrim
2. **App background:** CallKit + system ringtone
3. **App mbyllur:** CallKit + system ringtone (nga VoIP push)

**E rëndësishme:** Test në **real iOS device**, simulator nuk supporton VoIP!