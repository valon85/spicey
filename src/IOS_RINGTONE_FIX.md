# 🔔 iOS Call Ringtone Fix

## Problemi
Web Audio API është e bllokuar në iOS Safari pa user interaction. Prandaj nuk bie zili kur vjen thirrje.

## Zgjidhja
Përdorim HTML5 Audio me file audio real (.mp3 ose .wav) në vend të Web Audio API.

## Hapat:

### 1. Shto file audio në public folder
Krijo `public/ringtone.mp3` me një zili klasike telefoni.

### 2. Ose përdor URL externe
Mund të përdorësh një URL nga një CDN:
```js
const ringtoneUrl = 'https://www.soundjay.com/telephone/sounds/ringtone-01.mp3';
```

### 3. Test në iOS
1. Hap app-in në iPhone
2. Bëj logout → login (për të rifreskuar service worker)
3. Nga një device tjetër, thirr user-in
4. Duhet të dëgjosh zilinë!

## Shënim për Production
Për Apple App Store, duhet të kesh:
- ✅ File audio lokal (jo URL externe)
- ✅ Volume maksimal
- ✅ Vibration pattern të fortë
- ✅ Modal që shfaqet menjëherë