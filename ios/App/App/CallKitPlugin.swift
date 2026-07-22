import Capacitor

@objc(CallKitPlugin)
public class CallKitPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "CallKitPlugin"
    public let jsName = "CallKit"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "reportIncomingCall", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "reportCallConnected", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "reportCallEnded", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "endCall", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "answerCall", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "startOutgoingCall", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getActiveCalls", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setAudioRoute", returnType: CAPPluginReturnPromise)
    ]

    public override func load() {
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleAnswerNotification(_:)),
            name: NSNotification.Name("CallKitAnswerCall"),
            object: nil
        )
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleEndNotification(_:)),
            name: NSNotification.Name("CallKitEndCall"),
            object: nil
        )
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleVoipTokenNotification(_:)),
            name: NSNotification.Name("VoIPTokenUpdated"),
            object: nil
        )

        replayPendingAction(key: CallKitManager.pendingAnswerKey, eventName: "answerCall")
        replayPendingAction(key: CallKitManager.pendingEndKey, eventName: "endCall")
    }

    deinit {
        NotificationCenter.default.removeObserver(self)
    }

    @objc private func handleAnswerNotification(_ notification: Notification) {
        UserDefaults.standard.removeObject(forKey: CallKitManager.pendingAnswerKey)
        notifyListeners("answerCall", data: notification.object as? [String: Any] ?? [:], retainUntilConsumed: true)
    }

    @objc private func handleEndNotification(_ notification: Notification) {
        UserDefaults.standard.removeObject(forKey: CallKitManager.pendingEndKey)
        notifyListeners("endCall", data: notification.object as? [String: Any] ?? [:], retainUntilConsumed: true)
    }

    @objc private func handleVoipTokenNotification(_ notification: Notification) {
        notifyListeners("voipTokenUpdated", data: notification.object as? [String: Any] ?? [:], retainUntilConsumed: true)
    }

    private func replayPendingAction(key: String, eventName: String) {
        guard let payload = UserDefaults.standard.dictionary(forKey: key) else { return }
        let createdAt = payload["createdAt"] as? TimeInterval ?? 0
        UserDefaults.standard.removeObject(forKey: key)
        UserDefaults.standard.synchronize()

        guard createdAt == 0 || Date().timeIntervalSince1970 - createdAt < 120 else {
            print("[CallKitPlugin] Discarded stale pending \(eventName) action")
            return
        }

        print("[CallKitPlugin] Replaying pending \(eventName) action")
        notifyListeners(eventName, data: payload, retainUntilConsumed: true)
    }
    
    @objc func reportIncomingCall(_ call: CAPPluginCall) {
        let callerName = call.getString("callerName") ?? "Unknown"
        let callerHandle = call.getString("callerHandle") ?? ""
        let hasVideo = call.getBool("hasVideo") ?? true
        let callSessionId = call.getString("callSessionId")
        
        print("[CallKitPlugin] Report incoming call: \(callerName)")
        
        CallKitManager.shared.reportIncomingCall(
            callerName: callerName,
            callerHandle: callerHandle,
            hasVideo: hasVideo,
            callSessionId: callSessionId
        ) { uuid, error in
            if let error = error {
                call.reject("Failed to report incoming call: \(error.localizedDescription)")
            } else if let uuid = uuid {
                call.resolve(["uuid": uuid.uuidString])
            } else {
                call.reject("Failed to get call UUID")
            }
        }
    }
    
    @objc func reportCallConnected(_ call: CAPPluginCall) {
        guard let uuidString = call.getString("uuid"),
              let uuid = UUID(uuidString: uuidString) else {
            call.reject("Invalid UUID")
            return
        }
        
        print("[CallKitPlugin] Report call connected: \(uuid)")
        CallKitManager.shared.reportCallConnected(uuid: uuid)
        call.resolve()
    }
    
    @objc func reportCallEnded(_ call: CAPPluginCall) {
        guard let uuidString = call.getString("uuid"),
              let uuid = UUID(uuidString: uuidString) else {
            call.reject("Invalid UUID")
            return
        }
        
        print("[CallKitPlugin] Report call ended: \(uuid)")
        CallKitManager.shared.reportCallEnded(uuid: uuid)
        call.resolve()
    }
    
    @objc func endCall(_ call: CAPPluginCall) {
        guard let uuidString = call.getString("uuid"),
              let uuid = UUID(uuidString: uuidString) else {
            call.reject("Invalid UUID")
            return
        }
        
        print("[CallKitPlugin] End call: \(uuid)")
        CallKitManager.shared.endCall(uuid: uuid) { success in
            if success {
                call.resolve()
            } else {
                call.reject("Failed to end call")
            }
        }
    }
    
    @objc func answerCall(_ call: CAPPluginCall) {
        guard let uuidString = call.getString("uuid"),
              let uuid = UUID(uuidString: uuidString) else {
            call.reject("Invalid UUID")
            return
        }
        
        print("[CallKitPlugin] Answer call: \(uuid)")
        CallKitManager.shared.answerCall(uuid: uuid) { success in
            if success {
                call.resolve()
            } else {
                call.reject("Failed to answer call")
            }
        }
    }
    
    @objc func startOutgoingCall(_ call: CAPPluginCall) {
        let handle = call.getString("handle") ?? ""
        let callerName = call.getString("callerName") ?? ""
        let hasVideo = call.getBool("hasVideo") ?? true
        
        print("[CallKitPlugin] Start outgoing call to: \(handle)")
        
        CallKitManager.shared.startOutgoingCall(
            handle: handle,
            callerName: callerName,
            hasVideo: hasVideo
        ) { uuid, error in
            if let error = error {
                call.reject("Failed to start outgoing call: \(error.localizedDescription)")
            } else if let uuid = uuid {
                call.resolve(["uuid": uuid.uuidString])
            } else {
                call.reject("Failed to get call UUID")
            }
        }
    }
    
    @objc func getActiveCalls(_ call: CAPPluginCall) {
        let calls = CallKitManager.shared.getActiveCalls()
        call.resolve(["calls": calls])
    }

    @objc func setAudioRoute(_ call: CAPPluginCall) {
        let route = call.getString("route") ?? "earpiece"
        let isVideo = call.getBool("isVideo") ?? false
        do {
            try CallKitManager.shared.setAudioRoute(useSpeaker: route == "speaker", isVideo: isVideo)
            call.resolve()
        } catch {
            call.reject("Failed to set audio route: \(error.localizedDescription)")
        }
    }
}
