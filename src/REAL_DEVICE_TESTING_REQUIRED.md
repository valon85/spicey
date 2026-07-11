# Real Device Testing Required - CallSession Architecture

## System Architecture
This rebuilt calling system uses:
- **CallSession entity**: Single source of truth for all call state
- **Global listener**: Runs once in AuthContext, subscribes to incoming calls (status = 'ringing' where receiver_id = current user)
- **Caller flow**: Creates CallSession with status='ringing', shows outgoing ringing screen, listens for status updates
- **Receiver flow**: Incoming modal appears instantly, accept/decline updates CallSession status

## Critical Test Requirements

### Setup
- **Device 1**: Login with Account A
- **Device 2**: Login with Account B (different account, same or different device)
- Both must be on Feed page or Message page

### Test 1: Incoming Call Modal Appears
1. Account A: Open Messages > Find Account B
2. Account A: Click Phone icon (voice call)
3. **CRITICAL**: Account B should see IncomingCallModal **appear instantly** (< 500ms)
4. Ringtone should play on Account B
5. Modal should show Account A's name/avatar

**Success**: Modal appears before you finish clicking on A's side

### Test 2: Accept Call Flow
1. Account B: Click green Accept button
2. CallSession should update with status='accepted' and accepted_at timestamp
3. **CRITICAL**: CallSheet should open on BOTH devices simultaneously
4. Duration timer should start on both
5. Both see mute/speaker/video controls

**Success**: No delays, both devices in sync

### Test 3: Decline Call Flow
1. Account A: Initiate another voice call
2. Account B: Click red Decline button
3. CallSession should update with status='declined'
4. **CRITICAL**: IncomingCallModal should close on B
5. CallSheet should stay closed on A

**Success**: Clean state, no lingering UI

### Test 4: End Call
1. During active call, Account A clicks red End Call button
2. CallSession should update with status='ended' and ended_at timestamp
3. **CRITICAL**: CallSheet should close on BOTH devices simultaneously
4. No ringtone should play

**Success**: Both devices close at the same time

### Test 5: Video Call
1. Account A: Click Video icon in Messages
2. Repeat Test 2 (Accept) with video
3. Camera preview should appear on both devices
4. Toggle Video/Mute/Speaker controls work

**Success**: Video preview works on both devices

### Test 6: Cross-Device Sync (Most Important)
1. Open Account B on TWO separate browsers/devices
2. Account A calls Account B (voice)
3. **CRITICAL**: IncomingCallModal must appear on BOTH of B's devices **at the same time**
4. If B accepts on Device 1, CallSheet must open on BOTH of B's devices
5. Duration timer must be in sync on all 3 devices (A + B's two devices)

**Success**: All 3 devices perfectly synchronized

### Test 7: Network Resilience
1. Start a call
2. Toggle airplane mode on receiver for 5 seconds
3. Call state should survive
4. No infinite reconnect loops
5. Ringtone should resume if receiver goes offline during ringing

**Success**: Graceful handling of network interruptions

## Expected Data Flow

### When Account A calls Account B:
```
1. A clicks Phone → initiateCall('voice') invoked
2. CallSession created: { caller_id: A, receiver_id: B, status: 'ringing', type: 'voice' }
3. B's AuthContext subscription fires → setIncomingCall(...)
4. IncomingCallModal appears on B's screen within 100ms
```

### When B accepts:
```
1. B clicks Accept → acceptCall() invoked
2. CallSession updated: { status: 'accepted', accepted_at: now() }
3. B's AuthContext: setActiveCall(...), subscription triggers on all B's devices
4. CallSheet opens on both A and B's devices
5. Timer starts
```

### When A or B ends:
```
1. Click End Call → endCall() invoked
2. CallSession updated: { status: 'ended', ended_at: now() }
3. Subscription fires on all devices
4. CallSheet closes everywhere
5. Ringtone stops
```

## What to Check in Browser Console
- NO console.error logs during normal operation
- If CallSession.subscribe fails, you'll see errors → Base44 realtime not working
- No debug logs or verbose output (keep it clean)

## Red Flags (System Not Working)
- ❌ Modal doesn't appear within 500ms
- ❌ Modal appears only after page refresh
- ❌ CallSheet takes >2 seconds to open after acceptance
- ❌ Device 2 doesn't see state changes from Device 1
- ❌ Ringtone plays continuously instead of on intervals
- ❌ Multiple CallSession records created for one call
- ❌ Console shows reconnect errors and retries

## If It Doesn't Work
If after testing with real devices the calling system still doesn't work:
1. Check browser console for specific error messages
2. Check if Base44 realtime subscriptions are actually receiving events
3. Consider if CallSession entity was created properly
4. Verify AuthContext subscription is running (it should log nothing in normal operation)

## Timeline
- **Instant modal (<100ms)**: Subscription working correctly
- **Delayed modal (>1s)**: Polling fallback (bad), or subscription lag
- **Modal after refresh**: System not using subscriptions, using old polling pattern