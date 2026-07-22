import CallKit
import UIKit
import AVFoundation

@objc(CallKitManager)
public class CallKitManager: NSObject {
    
    static let shared = CallKitManager()
    
    private let callController = CXCallController()
    private var provider: CXProvider?
    private var activeCallUUID: UUID?
    private var sessionIdsByUUID: [UUID: String] = [:]
    private var completionHandlers: [UUID: ((Bool) -> Void)] = [:]

    static let pendingAnswerKey = "spicey.pendingCallKitAnswer"
    static let pendingEndKey = "spicey.pendingCallKitEnd"

    private func persistCallKitAction(_ payload: [String: Any], key: String) {
        var storedPayload = payload
        storedPayload["createdAt"] = Date().timeIntervalSince1970
        UserDefaults.standard.set(storedPayload, forKey: key)
        UserDefaults.standard.synchronize()
    }
    
    override init() {
        super.init()
        
        let configuration = CXProviderConfiguration(localizedName: "Spicey")
        configuration.supportsVideo = true
        configuration.maximumCallGroups = 1
        configuration.maximumCallsPerCallGroup = 1
        configuration.supportedHandleTypes = [.generic]
        configuration.includesCallsInRecents = true
        // Use default system ringtone (works without custom sound file)
        configuration.ringtoneSound = nil
        configuration.iconTemplateImageData = nil
        
        
        provider = CXProvider(configuration: configuration)
        provider?.setDelegate(self, queue: nil)
    }
    
    // Report new incoming call
    public func reportIncomingCall(
        callerName: String,
        callerHandle: String,
        hasVideo: Bool = true,
        callSessionId: String? = nil,
        completion: ((UUID?, Error?) -> Void)?
    ) {
        let uuid = UUID()
        activeCallUUID = uuid
        if let callSessionId, !callSessionId.isEmpty {
            sessionIdsByUUID[uuid] = callSessionId
        }
        
        let update = CXCallUpdate()
        update.remoteHandle = CXHandle(type: .generic, value: callerHandle)
        update.hasVideo = hasVideo
        update.localizedCallerName = callerName
        update.supportsHolding = false
        update.supportsDTMF = false
        update.supportsGrouping = false
        update.supportsUngrouping = false
        
        print("[CallKit] Reporting incoming call from \(callerName), UUID: \(uuid)")
        
        provider?.reportNewIncomingCall(
            with: uuid,
            update: update,
            completion: { error in
                if let error = error {
                    self.sessionIdsByUUID.removeValue(forKey: uuid)
                    print("[CallKit] Error reporting incoming call: \(error)")
                    completion?(nil, error)
                } else {
                    print("[CallKit] Incoming call reported successfully")
                    completion?(uuid, nil)
                }
            }
        )
    }
    
    // Report call connected
    public func reportCallConnected(uuid: UUID) {
        print("[CallKit] Reporting call connected: \(uuid)")
        let update = CXCallUpdate()
        
        provider?.reportCall(with: uuid, updated: update)
    }
    
    // Report call ended
    public func reportCallEnded(uuid: UUID) {
        print("[CallKit] Reporting call ended: \(uuid)")
        provider?.reportCall(with:uuid, endedAt:Date(), reason:.remoteEnded)
        activeCallUUID = nil
        sessionIdsByUUID.removeValue(forKey: uuid)
    }
    
    // Start outgoing call
    public func startOutgoingCall(
        handle: String,
        callerName: String,
        hasVideo: Bool = true,
        completion: ((UUID?, Error?) -> Void)?
    ) {
        let uuid = UUID()
        activeCallUUID = uuid
        
        let call = CXStartCallAction(call: uuid, handle: CXHandle(type: .generic, value: handle))
        call.isVideo = hasVideo
        
        let transaction = CXTransaction(action: call)
        callController.request(transaction) { error in
            if let error = error {
                print("[CallKit] Error starting outgoing call: \(error)")
                completion?(nil, error)
            } else {
                print("[CallKit] Outgoing call started successfully")
                completion?(uuid, nil)
            }
        }
    }
    
    // End call
    public func endCall(uuid: UUID, completion: ((Bool) -> Void)?) {
        print("[CallKit] Ending call: \(uuid)")
        let endCallAction = CXEndCallAction(call: uuid)
        let transaction = CXTransaction(action: endCallAction)
        
        callController.request(transaction) { error in
            if error == nil {
                self.reportCallEnded(uuid: uuid)
                completion?(true)
            } else {
                print("[CallKit] Error ending call: \(error)")
                completion?(false)
            }
        }
    }
    
    // Answer call
    public func answerCall(uuid: UUID, completion: ((Bool) -> Void)?) {
        print("[CallKit] Answering call: \(uuid)")
        let answerCallAction = CXAnswerCallAction(call: uuid)
        let transaction = CXTransaction(action: answerCallAction)
        
        callController.request(transaction) { error in
            if error == nil {
                completion?(true)
            } else {
                print("[CallKit] Error answering call: \(error)")
                completion?(false)
            }
        }
    }

    public func getActiveCalls() -> [[String: Any]] {
        guard let uuid = activeCallUUID else {
            return []
        }

        return [[
            "uuid": uuid.uuidString,
            "isOutgoing": false,
            "hasConnected": false,
            "isOnHold": false
        ]]
    }

    public func setAudioRoute(useSpeaker: Bool, isVideo: Bool) throws {
        let session = AVAudioSession.sharedInstance()
        let mode: AVAudioSession.Mode = isVideo ? .videoChat : .voiceChat
        try session.setCategory(.playAndRecord, mode: mode, options: [.allowBluetooth, .allowBluetoothA2DP])
        try session.overrideOutputAudioPort(useSpeaker ? .speaker : .none)
        try session.setActive(true)
        print("[CallKit] Audio route: \(useSpeaker ? "speaker" : "earpiece")")
    }
}

// MARK: - CXProviderDelegate
extension CallKitManager: CXProviderDelegate {

    public func providerDidReset(_ provider: CXProvider) {
        print("[CallKit] Provider reset")
        activeCallUUID = nil
        sessionIdsByUUID.removeAll()
    }

    public func provider(_ provider: CXProvider, didActivate audioSession: AVAudioSession) {
        print("[CallKit] Audio session activated")
        do {
            try audioSession.setCategory(.playAndRecord, mode: .voiceChat, options: [.allowBluetooth, .allowBluetoothA2DP])
            try audioSession.overrideOutputAudioPort(.none)
        } catch {
            print("[CallKit] Audio session configuration failed: \(error.localizedDescription)")
        }
    }

    public func provider(_ provider: CXProvider, didDeactivate audioSession: AVAudioSession) {
        print("[CallKit] Audio session deactivated")
    }

    public func provider(_ provider: CXProvider, perform action: CXAnswerCallAction) {
        print("[CallKit] User answered call: \(action.callUUID)")

        let payload: [String: Any] = [
            "uuid": action.callUUID.uuidString,
            "callSessionId": sessionIdsByUUID[action.callUUID] ?? ""
        ]
        persistCallKitAction(payload, key: Self.pendingAnswerKey)
        NotificationCenter.default.post(
            name: NSNotification.Name("CallKitAnswerCall"),
            object: payload
        )

        action.fulfill()
     }

     public func provider(_ provider: CXProvider, perform action: CXEndCallAction) {
        print("[CallKit] User ended call: \(action.callUUID)")

        let payload: [String: Any] = [
            "uuid": action.callUUID.uuidString,
            "callSessionId": sessionIdsByUUID[action.callUUID] ?? ""
        ]
        persistCallKitAction(payload, key: Self.pendingEndKey)
        NotificationCenter.default.post(
            name: NSNotification.Name("CallKitEndCall"),
            object: payload
        )

        reportCallEnded(uuid: action.callUUID)
        action.fulfill()
     }

     public func provider(_ provider: CXProvider, perform action: CXStartCallAction) {
         print("[CallKit] Starting outgoing call: \(action.callUUID)")
         action.fulfill()
     }

    public func provider(_ provider: CXProvider, timedOutPerforming action: CXAction) {
        print("[CallKit] Call timed out: \(action)")
        action.fail()
    }
}
