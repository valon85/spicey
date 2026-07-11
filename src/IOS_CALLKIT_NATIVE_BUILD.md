# 🔥 iOS Native Build me CallKit - Si TikTok/Instagram/WhatsApp

## Çfarë është CallKit

**CallKit** është framework i Apple që lejon:
- ✅ **Zili edhe kur app-i është i mbyllur** (si thirrje normale telefoni)
- ✅ **Butonat Accept/Decline në lock screen**
- ✅ **Integration me Phone app** të iOS
- ✅ **Background calls** pa kufizime

## Hapat për të krijuar iOS Native Build

### 1. Shto Plugin-in CallKit

**Opsioni 1: Capacitor CallKit VoIP Plugin**
```bash
npm install @bytecap/capacitor-callkit-voip
# ose
npm install git+https://gitlab.com/bfinecz/capacitor-plugins/capacitor-callkit-voip.git
```

**Opsioni 2: Custom Native Code** (rekomanduar për kontroll të plotë)

### 2. Konfiguro Xcode Project

#### A. Shto Capabilities
1. Hap `ios/App/App.xcworkspace` në Xcode
2. Signing & Capabilities → **+ Capability**
   - ✅ **Push Notifications**
   - ✅ **Voice over IP**
   - ✅ **Background Modes** →勾选:
     - ✅ Voice over IP
     - ✅ Remote notifications
     - ✅ Background fetch

#### B. Shto CallKit në Info.plist
```xml
<key>UIBackgroundModes</key>
<array>
    <string>voip</string>
    <string>remote-notification</string>
    <string>fetch</string>
</array>
```

#### C. Shto Permissions
```xml
<key>NSMicrophoneUsageDescription</key>
<string>Spicey needs microphone access for voice and video calls</string>
<key>NSCameraUsageDescription</key>
<string>Spicey needs camera access for video calls and content creation</string>
```

### 3. Krijo CallKit Manager (Native Swift)

Krijo file `ios/App/App/CallKitManager.swift`:

```swift
import CallKit
import UIKit
import Capacitor

@objc(CallKitManager)
public class CallKitManager: NSObject {
    static let shared = CallKitManager()
    
    private let callController = CXCallController()
    private var provider: CXProvider?
    private var activeCallUUID: UUID?
    
    override init() {
        super.init()
        
        let configuration = CXProviderConfiguration(localizedName: "Spicey")
        configuration.supportsVideo = true
        configuration.maximumCallGroups = 1
        configuration.maximumCallsPerCallGroup = 1
        configuration.supportedHandleTypes = [.generic]
        configuration.includesCallsInRecents = true
        
        // Custom ringtone (optional)
        configuration.ringtoneSound = "ringtone.caf"
        
        provider = CXProvider(configuration: configuration)
        
        provider?.setDelegate(self, queue: nil)
    }
    
    // Report new incoming call
    public func reportIncomingCall(
        callerName: String,
        callerHandle: String,
        completion: ((UUID) -> Void)?
    ) {
        let uuid = UUID()
        activeCallUUID = uuid
        
        let update = CXCallUpdate()
        update.remoteHandle = CXHandle(type: .generic, value: callerHandle)
        update.hasVideo = true
        update.localizedCallerName = callerName
        update.supportsHolding = false
        update.supportsDTMF = false
        update.supportsGrouping = false
        update.supportsUngrouping = false
        
        provider?.reportNewIncomingCall(
            with: uuid,
            update: update,
            completion: { error in
                if error == nil {
                    completion?(uuid)
                }
            }
        )
    }
    
    // Report call connected
    public func reportCallConnected(uuid: UUID) {
        let update = CXCallUpdate()
        update.hasConnected = true
        provider?.reportCall(with: uuid, updated: update)
    }
    
    // Report call ended
    public func reportCallEnded(uuid: UUID) {
        provider?.reportCall(with: uuid, endedAt: Date())
        activeCallUUID = nil
    }
    
    // Start outgoing call
    public func startOutgoingCall(
        handle: String,
        callerName: String,
        completion: ((UUID) -> Void)?
    ) {
        let uuid = UUID()
        activeCallUUID = uuid
        
        let call = CXStartCallAction(call: uuid, handle: CXHandle(type: .generic, value: handle))
        call.isVideo = true
        
        let transaction = CXTransaction(action: call)
        callController.request(transaction) { error in
            if error == nil {
                completion?(uuid)
            }
        }
    }
    
    // End call
    public func endCall(uuid: UUID) {
        let endCallAction = CXEndCallAction(call: uuid)
        let transaction = CXTransaction(action: endCallAction)
        
        callController.request(transaction) { error in
            if error == nil {
                self.reportCallEnded(uuid: uuid)
            }
        }
    }
}

// MARK: - CXProviderDelegate
extension CallKitManager: CXProviderDelegate {
    public func provider(_ provider: CXProvider, didActivate audioSession: AVAudioSession) {
        // Activate audio session
    }
    
    public func provider(_ provider: CXProvider, didDeactivate audioSession: AVAudioSession) {
        // Deactivate audio session
    }
    
    public func provider(_ provider: CXProvider, perform action: CXAnswerCallAction) {
        // User answered call - notify web app
        NotificationCenter.default.post(
            name: NSNotification.Name("CallKitAnswerCall"),
            object: action.callUUID
        )
        action.fulfill()
    }
    
    public func provider(_ provider: CXProvider, perform action: CXEndCallAction) {
        // User ended call - notify web app
        NotificationCenter.default.post(
            name: NSNotification.Name("CallKitEndCall"),
            object: action.callUUID
        )
        action.fulfill()
    }
    
    public func provider(_ provider: CXProvider, perform action: CXStartCallAction) {
        action.fulfill()
    }
}
```

### 4. Integro me Capacitor

Krijo `ios/App/App/AppDelegate.swift` (ose modifiko ekzistuesin):

```swift
import UIKit
import Capacitor
import CallKit
import AVFoundation

@UIApplicationMain
class AppDelegate: CAPAppDelegate {
    
    override func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        
        // Register for VoIP notifications
        registerForVoIPPushNotifications()
        
        return super.application(application, didFinishLaunchingWithOptions: launchOptions)
    }
    
    // Handle VoIP push notifications
    func application(
        _ application: UIApplication,
        didReceiveRemoteNotification userInfo: [AnyHashable: Any],
        fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void
    ) {
        // Check if this is a VoIP call notification
        if userInfo["type"] as? String == "call" {
            let callerName = userInfo["callerName"] as? String ?? "Unknown"
            let callerHandle = userInfo["callerHandle"] as? String ?? ""
            
            // Report incoming call to CallKit
            CallKitManager.shared.reportIncomingCall(
                callerName: callerName,
                callerHandle: callerHandle
            ) { uuid in
                // Store UUID for later use
                UserDefaults.standard.set(uuid.uuidString, forKey: "activeCallUUID")
            }
        }
        
        completionHandler(.newData)
    }
    
    // Register for VoIP push notifications
    private func registerForVoIPPushNotifications() {
        // VoIP push registration happens automatically with proper entitlements
        // No additional code needed if capabilities are set correctly
    }
}
```

### 5. Shto Bridge për Web App

Krijo `ios/App/App/CallKitPlugin.swift`:

```swift
import Capacitor

@objc(CallKitPlugin)
public class CallKitPlugin: CAPPlugin {
    
    @objc func reportIncomingCall(_ call: CAPPluginCall) {
        let callerName = call.getString("callerName") ?? "Unknown"
        let callerHandle = call.getString("callerHandle") ?? ""
        
        CallKitManager.shared.reportIncomingCall(
            callerName: callerName,
            callerHandle: callerHandle
        ) { uuid in
            call.resolve(["uuid": uuid.uuidString])
        }
    }
    
    @objc func reportCallConnected(_ call: CAPPluginCall) {
        guard let uuidString = call.getString("uuid"),
              let uuid = UUID(uuidString: uuidString) else {
            call.reject("Invalid UUID")
            return
        }
        
        CallKitManager.shared.reportCallConnected(uuid: uuid)
        call.resolve()
    }
    
    @objc func endCall(_ call: CAPPluginCall) {
        guard let uuidString = call.getString("uuid"),
              let uuid = UUID(uuidString: uuidString) else {
            call.reject("Invalid UUID")
            return
        }
        
        CallKitManager.shared.endCall(uuid: uuid)
        call.resolve()
    }
}
```

### 6. Registro Plugin-in

Në `ios/App/App/AppDelegate.swift`:

```swift
import Capacitor

@UIApplicationMain
class AppDelegate: CAPAppDelegate {
    override func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        
        // Register CallKit plugin
        CAPBridge.registerPlugin("CallKit", pluginClass: CallKitPlugin.self)
        
        return super.application(application, didFinishLaunchingWithOptions: launchOptions)
    }
}
```

### 7. Përdorimi nga Web App

Në React component:

```javascript
import { Plugins } from '@capacitor/core';
const { CallKit } = Plugins;

// Report incoming call
const showCallKit = async (callerName, callerHandle) => {
  try {
    const result = await CallKit.reportIncomingCall({
      callerName,
      callerHandle
    });
    console.log('CallKit UUID:', result.uuid);
  } catch (e) {
    console.error('CallKit error:', e);
  }
};

// End call
const endCallKitCall = async (uuid) => {
  await CallKit.endCall({ uuid });
};
```

### 8. Shto Ringtone File

1. Krijo file `ringtone.caf` (format audio për iOS)
2. Shto në Xcode: `ios/App/App/public/ringtone.caf`
3. Sigurohu që është në **Build Phases** → **Copy Bundle Resources**

### 9. Build dhe Test

```bash
# 1. Build web app
npm run build

# 2. Sync me iOS
npx cap sync ios

# 3. Hap në Xcode
npx cap open ios

# 4. Në Xcode:
# - Zgjidh device fizik (jo simulator)
# - Product → Build (⌘B)
# - Product → Run (⌘R)
```

### 10. Konfiguro Firebase për VoIP Push

Në Firebase Console:
1. Project Settings → Cloud Messaging
2. Upload **VoIP Services Certificate** (.p12 file nga Apple Developer)
3. Ky është ndryshe nga APNs certificate - specifik për VoIP

## Testimi

1. **Mbyll app-in plotësisht** (swipe up)
2. **Thirr nga device tjetër**
3. **Duhet të shohësh**:
   - ✅ Zili si thirrje normale telefoni
   - ✅ Lock screen me butonat Accept/Decline
   - ✅ CallKit UI (nuk hapet app-i plotësisht)
   - ✅ Notification në Notification Center

## Shënim i Rëndësishëm

**Ky proces kërkon:**
- ✅ Mac me Xcode
- ✅ Apple Developer Account ($99/vit)
- ✅ Device fizik iOS (nuk punon në simulator)
- ✅ Certifikata për VoIP Push nga Apple Developer Portal

**Koha e nevojshme:**
- Konfigurimi fillestar: ~2-3 orë
- Testing dhe debugging: ~1 ditë
- App Store review: 24-48 orë

## Next Steps

Nëse dëshiron të vazhdojmë me këtë implementim, më trego dhe do:
1. Krijoj të gjitha file-at e nevojshme
2. Shtoj plugin-in e duhur
3. Konfiguroj Xcode project
4. Testojmë në device fizik