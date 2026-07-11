import CallKit
import UIKit
import AVFoundation

@objc(CallKitManager)
public class CallKitManager: NSObject {
    
    static let shared = CallKitManager()
    
    private let callController = CXCallController()
    private var provider: CXProvider?
    private var activeCallUUID: UUID?
    private var completionHandlers: [UUID: ((Bool) -> Void)] = [:]
    
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
        configuration.alertSound = nil
        
        provider = CXProvider(configuration: configuration)
        provider?.setDelegate(self, queue: nil)
    }
    
    // Report new incoming call
    public func reportIncomingCall(
        callerName: String,
        callerHandle: String,
        hasVideo: Bool = true,
        completion: ((UUID?, Error?) -> Void)?
    ) {
        let uuid = UUID()
        activeCallUUID = uuid
        
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
        update.hasConnected = true
        provider?.reportCall(with: uuid, updated: update)
    }
    
    // Report call ended
    public func reportCallEnded(uuid: UUID) {
        print("[CallKit] Reporting call ended: \(uuid)")
        provider?.reportCall(with: uuid, endedAt: Date())
        activeCallUUID = nil
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
}

// MARK: - CXProviderDelegate
extension CallKitManager: CXProviderDelegate {
    
    public func provider(_ provider: CXProvider, didActivate audioSession: AVAudioSession) {
        print("[CallKit] Audio session activated")
    }
    
    public func provider(_ provider: CXProvider, didDeactivate audioSession: AVAudioSession) {
        print("[CallKit] Audio session deactivated")
    }
    
    public func provider(_ provider: CXProvider, perform action: CXAnswerCallAction) {
        print("[CallKit] User answered call: \(action.callUUID)")
        
        // Post notification for web app
        NotificationCenter.default.post(
            name: NSNotification.Name("CallKitAnswerCall"),
            object: ["uuid": action.callUUID.uuidString]
        )
        
        action.fulfill()
    }
    
    public func provider(_ provider: CXProvider, perform action: CXEndCallAction) {
        print("[CallKit] User ended call: \(action.callUUID)")
        
        // Post notification for web app
        NotificationCenter.default.post(
            name: NSNotification.Name("CallKitEndCall"),
            object: ["uuid": action.callUUID.uuidString]
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
    
    public func provider(_ provider: CXProvider, didReceive providerConfigurationUpdate configuration: CXProviderConfiguration) {
        print("[CallKit] Provider configuration updated")
    }
}