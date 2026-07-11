# 🔥 Spicey Custom Ringtone

## Çfarë është krijuar

Një zili unike për Spicey me këto karakteristika:

### 🎵 Melodia
- **4 nota ascendente**: C5 → E5 → G5 → C6 (C major chord)
- **Stili**: Modern, energjik, i ngjashëm me iPhone por më unik
- **Kohëzgjatja**: 3 sekonda pattern që përsëritet
- **Vëllimi**: 70% për të mos qenë shumë i lartë

### 📳 Vibrimi
- **Pattern**: 400ms → 150ms push → 400ms → 150ms push → 600ms
- **Përsëritet**: Çdo 3 sekonda
- **I fortë**: Për të siguruar që ndihet edhe në xhep

### 🔊 Pse funksionon në iOS

1. **Web Audio API** me user gesture (login)
2. **AudioContext** krijohet vetëm kur vjen thirrje
3. **State check** për suspended context
4. **Cleanup i plotë** kur mbaron thirrja

## Testimi

1. **Hap app-in në iOS**
2. **Bëj logout → login** (për të aktivizuar AudioContext)
3. **Thirr nga device tjetër**
4. **Duhet të dëgjosh**: 4 nota ascendente unike 🔥

## Shënim

Kjo zili është **ekskluzive për Spicey** - nuk do ta dëgjosh në asnjë app tjetër!