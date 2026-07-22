import UIKit
import Capacitor
import PushKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, PKPushRegistryDelegate {

    var window: UIWindow?
    private var voipRegistry: PKPushRegistry?
    private var voipCallUUIDs: [String: UUID] = [:]

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        window?.backgroundColor = UIColor.black
        if let bridgeViewController = window?.rootViewController as? CAPBridgeViewController {
            bridgeViewController.view.backgroundColor = UIColor.black
            if let webView = bridgeViewController.webView {
                webView.backgroundColor = UIColor.black
                webView.isOpaque = false
                if #available(iOS 11.0, *) {
                    webView.scrollView.contentInsetAdjustmentBehavior = .never
                }
            }
        }
        let pushEnvironment = currentApsEnvironment()
        storeNativePreference(pushEnvironment, forKey: "apnsEnvironment")
        configureVoipPushRegistry()
        return true
    }

    private func currentApsEnvironment() -> String {
        let value = Bundle.main.object(forInfoDictionaryKey: "SpiceyAPNSEnvironment") as? String
        return value == "development" ? "development" : "production"
    }

    private func storeNativePreference(_ value: String, forKey key: String) {
        UserDefaults.standard.set(value, forKey: key)
        UserDefaults.standard.set(value, forKey: "CapacitorStorage.\(key)")
    }

    private func configureVoipPushRegistry() {
        let registry = PKPushRegistry(queue: DispatchQueue.main)
        registry.delegate = self
        registry.desiredPushTypes = [.voIP]
        voipRegistry = registry
        print("[VoIP] PKPushRegistry configured")
    }

    private func hexToken(_ data: Data) -> String {
        data.map { String(format: "%02x", $0) }.joined()
    }

    private func shortToken(_ token: String) -> String {
        guard token.count > 12 else { return token }
        return "\(token.prefix(6))...\(token.suffix(6))"
    }

    private func callUUID(for sessionId: String) -> UUID? {
        if let uuid = voipCallUUIDs[sessionId] { return uuid }
        guard let value = UserDefaults.standard.string(forKey: "spicey.voip.uuid.\(sessionId)") else { return nil }
        return UUID(uuidString: value)
    }

    private func rememberCallUUID(_ uuid: UUID, sessionId: String) {
        voipCallUUIDs[sessionId] = uuid
        UserDefaults.standard.set(uuid.uuidString, forKey: "spicey.voip.uuid.\(sessionId)")
        UserDefaults.standard.synchronize()
    }

    private func forgetCallUUID(sessionId: String) {
        voipCallUUIDs.removeValue(forKey: sessionId)
        UserDefaults.standard.removeObject(forKey: "spicey.voip.uuid.\(sessionId)")
        UserDefaults.standard.removeObject(forKey: "lastIncomingVoipPush")
        UserDefaults.standard.synchronize()
    }

    func application(
        _ application: UIApplication,
        didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
    ) {
        print("[Push] APNs token registered")
        NotificationCenter.default.post(
            name: Notification.Name("capacitorDidRegisterForRemoteNotifications"),
            object: deviceToken
        )
    }

    func application(
        _ application: UIApplication,
        didFailToRegisterForRemoteNotificationsWithError error: Error
    ) {
        print("[Push] APNs registration failed: \(error.localizedDescription)")
        NotificationCenter.default.post(
            name: Notification.Name("capacitorDidFailToRegisterForRemoteNotifications"),
            object: error
        )
    }

    func pushRegistry(_ registry: PKPushRegistry, didUpdate pushCredentials: PKPushCredentials, for type: PKPushType) {
        guard type == .voIP else { return }
        let token = hexToken(pushCredentials.token)
        let pushEnvironment = currentApsEnvironment()
        storeNativePreference(token, forKey: "voipPushToken")
        storeNativePreference(pushEnvironment, forKey: "voipPushEnvironment")
        UserDefaults.standard.set(Date().timeIntervalSince1970, forKey: "voipPushTokenUpdatedAt")
        UserDefaults.standard.set(Date().timeIntervalSince1970, forKey: "CapacitorStorage.voipPushTokenUpdatedAt")
        UserDefaults.standard.synchronize()
        print("[VoIP] Token updated: \(shortToken(token)), environment=\(pushEnvironment)")
    }

    func pushRegistry(_ registry: PKPushRegistry, didInvalidatePushTokenFor type: PKPushType) {
        guard type == .voIP else { return }
        UserDefaults.standard.removeObject(forKey: "voipPushToken")
        UserDefaults.standard.removeObject(forKey: "CapacitorStorage.voipPushToken")
        UserDefaults.standard.removeObject(forKey: "voipPushEnvironment")
        UserDefaults.standard.removeObject(forKey: "CapacitorStorage.voipPushEnvironment")
        UserDefaults.standard.removeObject(forKey: "voipPushTokenUpdatedAt")
        UserDefaults.standard.removeObject(forKey: "CapacitorStorage.voipPushTokenUpdatedAt")
        UserDefaults.standard.synchronize()
        print("[VoIP] Token invalidated")
    }

    func pushRegistry(
        _ registry: PKPushRegistry,
        didReceiveIncomingPushWith payload: PKPushPayload,
        for type: PKPushType,
        completion: @escaping () -> Void
    ) {
        guard type == .voIP else {
            completion()
            return
        }

        let data = payload.dictionaryPayload
        let event = (data["event"] as? String ?? "incoming").lowercased()
        let callerName = data["callerName"] as? String
            ?? data["caller_name"] as? String
            ?? "Spicey Call"
        let callerId = data["callerId"] as? String
            ?? data["caller_id"] as? String
            ?? "unknown"
        let callType = data["callType"] as? String
            ?? data["call_type"] as? String
            ?? "voice"
        let callSessionId = data["callSessionId"] as? String
            ?? data["call_session_id"] as? String
            ?? ""
        let hasVideo = (data["hasVideo"] as? Bool) ?? (callType == "video")

        if ["ended", "declined", "missed", "cancelled"].contains(event) {
            if let uuid = callUUID(for: callSessionId) {
                print("[VoIP] Ending CallKit call: session=\(callSessionId), event=\(event)")
                CallKitManager.shared.reportCallEnded(uuid: uuid)
            }
            forgetCallUUID(sessionId: callSessionId)
            completion()
            return
        }

        if let uuid = callUUID(for: callSessionId) {
            print("[VoIP] Duplicate incoming push ignored: session=\(callSessionId), uuid=\(uuid.uuidString)")
            completion()
            return
        }

        let storedPayload: [String: Any] = [
            "callerName": callerName,
            "callerId": callerId,
            "callType": callType,
            "callSessionId": callSessionId,
            "hasVideo": hasVideo,
            "receivedAt": Date().timeIntervalSince1970
        ]
        UserDefaults.standard.set(storedPayload, forKey: "lastIncomingVoipPush")
        UserDefaults.standard.synchronize()

        print("[VoIP] Incoming push received: session=\(callSessionId.isEmpty ? "missing" : callSessionId), video=\(hasVideo)")
        CallKitManager.shared.reportIncomingCall(
            callerName: callerName,
            callerHandle: callerId,
            hasVideo: hasVideo
        ) { uuid, error in
            if let error = error {
                print("[VoIP] CallKit report failed: \(error.localizedDescription)")
            } else if let uuid = uuid {
                self.rememberCallUUID(uuid, sessionId: callSessionId)
                print("[VoIP] CallKit report succeeded: \(uuid.uuidString)")
            }
            completion()
        }
    }
}
