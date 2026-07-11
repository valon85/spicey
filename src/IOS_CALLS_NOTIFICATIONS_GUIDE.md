# 🔥 Push Notifications & Calls - Kur App-i është Mbyllur

## Problemi
Kur app-i është **plotësisht i mbyllur** në iOS:
- ❌ Web Audio API **nuk funksionon** (ringtone nuk bie)
- ❌ Butonat e accept/decline **nuk shfaqen**
- ❌ Notifications **mund të mos vijnë** pa konfigurim të saktë

## Zgjidhjet

### 1. Push Notifications (PUNON) ✅

**Çfarë duhet bërë:**

1. **Firebase Console** → Project Settings → Cloud Messaging
   - Upload **APNs Certificate** (.p8 file from Apple Developer)
   - Pa këtë, notifications nuk vijnë kur app-i është mbyllur

2. **Xcode** → Signing & Capabilities
   - ✅ Push Notifications
   - ✅ Background Modes → Remote notifications

3. **Test**:
   ```bash
   # Thirr funksionin sendPushNotification
   # Duhet të vijë notification edhe kur app-i është mbyllur
   ```

### 2. Ringtone (LIMITUAR) ⚠️

**Statusi aktual:**
- HTML5 Audio (`/ringtone.mp3`) është shtuar
- **PUNON** kur app-i është në **background** (në home screen)
- **NUK PUNON** kur app-i është **plotësisht i mbyllur**

**Pse?**
- iOS bllokon të gjitha audio pa user interaction
- Web Audio API dhe HTML5 Audio **ndalohen** kur app-i është closed
- Kjo është **restrictions e Apple**, nuk ka workaround në web app

**Zgjidhja e vetme:**
- **CallKit native iOS** (kërkon build të veçantë iOS me Capacitor/Cordova)
- Kjo lejon zili dhe butona si thirrjet normale të telefonit

### 3. Accept/Decline Butonat (LIMITUAR) ⚠️

**Statusi aktual:**
- Butonat shfaqen **vetëm kur app-i është hapur** ose në **background**
- Kur app-i është **closed**, iOS nuk lejon UI custom

**Zgjidhja e vetme:**
- **CallKit native iOS** (kërkon Capacitor build me CallKit plugin)

## Çfarë Mund të Bësh Tani

### Për Notifications ✅
1. Shko në **Firebase Console**
2. Project Settings → Cloud Messaging
3. Upload **APNs Authentication Key** (.p8 file)
4. Testo me `sendPushNotification` function

### Për Calls ⚠️
1. **Tani**: Ringtone punon kur app-i është në background (nuk është closed)
2. **Për production**: Duhet të bësh **iOS build me Capacitor + CallKit plugin**

## Testimi

### Notifications
```
1. Mbyll app-in plotësisht (swipe up)
2. Thirr nga device tjetër
3. Duhet të vijë notification (nëse ke upload APNs cert në Firebase)
```

### Calls
```
1. Lëv app-in në background (home button, mos e mbyll)
2. Thirr nga device tjetër
3. Duhet të bjerë zili dhe të shfaqen butonat
```

## Shënim i Rëndësishëm

**Web app ka kufizime në iOS:**
- Apple **nuk lejon** ringtone/butona kur app-i është closed
- Kjo vlen për **të gjitha web apps** (jo vetëm Spicey)
- Për funksionalitet të plotë, duhet **native iOS build** me CallKit