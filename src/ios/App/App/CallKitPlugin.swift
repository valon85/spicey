import Capacitor

@objc(CallKitPlugin)
public class CallKitPlugin: CAPPlugin {
    
    @objc func reportIncomingCall(_ call: CAPPluginCall) {
        let callerName = call.getString("callerName") ?? "Unknown"
        let callerHandle = call.getString("callerHandle") ?? ""
        let hasVideo = call.getBool("hasVideo") ?? true
        
        print("[CallKitPlugin] Report incoming call: \(callerName)")
        
        CallKitManager.shared.reportIncomingCall(
            callerName: callerName,
            callerHandle: callerHandle,
            hasVideo: hasVideo
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
        let calls = CallKitManager.shared.callController.callManager.calls.map { call in
            return [
                "uuid": call.uuid.uuidString,
                "isOutgoing": call.isOutgoing,
                "hasConnected": call.hasConnected,
                "isOnHold": call.isOnHold
            ]
        }
        call.resolve(["calls": calls])
    }
}