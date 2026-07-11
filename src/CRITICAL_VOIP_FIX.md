# 🔴 KRITIKE: Rregullimi i VoIP Push Notifications për iOS

## Problemet e Identifikuara

1. **Bundle ID Mismatch** - GoogleService-Info.plist ka bundle ID të gabuar
2. **VoIP Entitlement mungon** - App nuk ka background mode për VoIP
3. **Firebase configuration** - FCM sender ID nuk përputhet

## Hapat për Rregullim

### 1. Rregullo Bundle ID në Xcode

1. Hap **Xcode** → hap projektin `ios/App/App.xcworkspace`
2. Shko te **Targets** → **App** → **General** → **Identity**
3. Kontrollo **Bundle Identifier**:
   - Duhet të jetë: `com.base44.69fe90d3bbe7ad47925e4a0a.app` (si në GoogleService-Info.plist)
   - Nëse është `com.spicey.app`, ndryshoje në atë të GoogleService-Info.plist

### 2. Shto VoIP Background Mode

1. Në Xcode, shko te **Signing & Capabilities**
2. Kliko **+ Capability**
3. Shto **Background Modes**
4. Aktivizo **Voice over IP**
5. Sigurohu që **Push Notifications** është gjithashtu i aktivizuar

### 3. Rregullo GoogleService-Info.plist

Nëse ke ndryshuar Bundle ID në Xcode, sigurohu që `GoogleService-Info.plist` të ketë të njëjtin Bundle ID.

### 4. Rikriko Build për TestFlight

```bash
# Në rrënjë të projektit
npm run build

# Pastaj në ios/App/
npx cap sync ios

# Hap Xcode
open ios/App/App.xcworkspace
```

### 5. Në Xcode - Archive dhe Upload

1. **Product** → **Archive**
2. Prit të mbarojë archive
3. **Distribute App** → **App Store Connect** → **Upload**
4. Prit të uploadohet

### 6. Testo në Dispozitiv

1. Instalo app nga TestFlight në **2 telefona të ndryshëm**
2. Login me 2 usera të ndryshëm
3. Njëri telefon mbyll app (swipe up)
4. Tjetri telefono
5. **Duhet të bjerë zili** edhe kur app është mbyllur

## Çfarë duhet të ndodhë

✅ Kur app është **mbyllur**: Zili bie, shfaqet CallKit screen me emrin e caller
✅ Kur app është **background**: Zili bie, CallKit shfaqet
✅ Kur app është **hapur**: CallKit shfaqet brenda app

## Debugging

Nëse ende nuk punon:

1. **Kontrollo Console logs** në Xcode:
   - Connect iPhone në Mac
   - Xcode → Window → Devices and Simulators
   - Shiko logs për VoIP push

2. **Kontrollo Firebase Console**:
   - Shko te https://console.firebase.google.com/
   - Project: spicey-ed7f7
   - Shiko nëse po vijnë push notifications

3. **Kontrollo VoIP Token**:
   - Në app, shko te Messages page
   - Hap console (Safari Web Inspector)
   - Shiko nëse `[VoIP] Token retrieved:` shfaqet me token

## E rëndësishme

- **VoIP push notifications** janë të veçanta nga regular push
- Ato kanë **përparësi të lartë** dhe bien zili edhe kur app është mbyllur
- Duhet **entitlement specifik** për VoIP në Xcode
- Firebase duhet të ketë **APNs certificate** për VoIP