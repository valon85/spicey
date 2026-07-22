import { registerPlugin } from '@capacitor/core';

const CallKit = registerPlugin('CallKit');

/**
 * CallKit API for Spicey iOS app
 * Provides native call handling like WhatsApp/Instagram/TikTok
 */
export class CallKitAPI {
  
  /**
   * Report an incoming call to CallKit
   * Shows native iOS call UI even when app is closed
   */
  static async reportIncomingCall({
    callerName,
    callerHandle,
    hasVideo = true,
    callSessionId
  }) {
    try {
      const result = await CallKit.reportIncomingCall({
        callerName,
        callerHandle,
        hasVideo,
        callSessionId
      });
      console.log('[CallKit] Incoming call reported:', result);
      return { success: true, uuid: result.uuid };
    } catch (error) {
      console.error('[CallKit] Error reporting incoming call:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Report that a call has been connected
   */
  static async reportCallConnected(uuid) {
    try {
      await CallKit.reportCallConnected({ uuid });
      console.log('[CallKit] Call connected:', uuid);
      return { success: true };
    } catch (error) {
      console.error('[CallKit] Error reporting call connected:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Report that a call has ended
   */
  static async reportCallEnded(uuid) {
    try {
      await CallKit.reportCallEnded({ uuid });
      console.log('[CallKit] Call ended:', uuid);
      return { success: true };
    } catch (error) {
      console.error('[CallKit] Error reporting call ended:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * End an active call
   */
  static async endCall(uuid) {
    try {
      await CallKit.endCall({ uuid });
      console.log('[CallKit] Call ended:', uuid);
      return { success: true };
    } catch (error) {
      console.error('[CallKit] Error ending call:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Answer an incoming call
   */
  static async answerCall(uuid) {
    try {
      await CallKit.answerCall({ uuid });
      console.log('[CallKit] Call answered:', uuid);
      return { success: true };
    } catch (error) {
      console.error('[CallKit] Error answering call:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Start an outgoing call
   */
  static async startOutgoingCall({
    handle,
    callerName,
    hasVideo = true
  }) {
    try {
      const result = await CallKit.startOutgoingCall({
        handle,
        callerName,
        hasVideo
      });
      console.log('[CallKit] Outgoing call started:', result);
      return { success: true, uuid: result.uuid };
    } catch (error) {
      console.error('[CallKit] Error starting outgoing call:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all active calls
   */
  static async getActiveCalls() {
    try {
      const result = await CallKit.getActiveCalls();
      console.log('[CallKit] Active calls:', result);
      return { success: true, calls: result.calls || [] };
    } catch (error) {
      console.error('[CallKit] Error getting active calls:', error);
      return { success: false, calls: [], error: error.message };
    }
  }

  /**
   * Get VoIP push token (for backend to send call notifications)
   */
  static async getVoIPToken() {
    try {
      const { value } = await window.Capacitor.Plugins.Storage.get({
        key: 'voipPushToken'
      });
      return value;
    } catch (error) {
      console.error('[CallKit] Error getting VoIP token:', error);
      return null;
    }
  }

  /**
   * Listen for CallKit events from native layer
   */
  static addListener(eventName, callback) {
    return CallKit.addListener(eventName, callback);
  }
}

// Export for use in React components
export const useCallKit = () => {
  const reportIncomingCall = CallKitAPI.reportIncomingCall;
  const reportCallConnected = CallKitAPI.reportCallConnected;
  const reportCallEnded = CallKitAPI.reportCallEnded;
  const endCall = CallKitAPI.endCall;
  const answerCall = CallKitAPI.answerCall;
  const startOutgoingCall = CallKitAPI.startOutgoingCall;

  return {
    reportIncomingCall,
    reportCallConnected,
    reportCallEnded,
    endCall,
    answerCall,
    startOutgoingCall,
  };
};
