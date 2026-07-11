# 🔍 OpenAI Realtime API - Debug & Testing Guide

## What's Been Added

### 1. Debug Panel (Toggle with BUG button)
- **Location**: Top-left corner of AITalkMode
- **Shows**:
  - ✅ Connection status (green = connected, red = disconnected)
  - 📊 Real-time audio amplitude (0-100%)
  - 📝 Event log with timestamps
  - 🔄 Reconnection count
  - ⏰ Connection timestamp
  - 🔑 Session ID

### 2. Enhanced Logging
Every critical event is now logged:
```
✅ REALTIME CONNECTED          - WebSocket established
🔊 Audio analyzer started       - Audio analysis active
🎤 USER SPEECH DETECTED        - Barge-in triggered
🎯 AI INTERRUPTED               - Barge-in successful
📊 Amplitude: 45.2%             - Audio level (logged every 0.5s)
⚠️ Reconnecting...              - Auto-reconnect attempt
❌ WebSocket error              - Connection issue
```

### 3. Real Audio-Driven Animation
- **OLD**: Fake `Math.sin()` loops running constantly
- **NEW**: `analyser.getByteFrequencyData()` from actual audio stream
- Avatar moves ONLY when audio amplitude > threshold
- Movement intensity scales with voice level

---

## How to Test on iPhone

### Step 1: Build & Deploy
```bash
# Clean rebuild (critical!)
npm run build
./scripts/clean-rebuild-ios.sh

# Open in Xcode
open ios/App/App.xcworkspace

# Archive for TestFlight
xcodebuild -workspace ios/App/App.xcworkspace \
  -scheme App \
  -configuration Release \
  -archivePath App/App.xcarchive \
  archive
```

### Step 2: Run on Device
1. Connect iPhone via USB
2. Select device in Xcode
3. Click Run (▶️)
4. Wait for build to install

### Step 3: Enable Debug Panel
1. Open app on iPhone
2. Tap AI egg button
3. Tap **DEBUG** button (top-left, bug icon)
4. Debug panel appears

### Step 4: Verify Connection
**Check debug panel shows:**
- ✅ Green "CONNECTED" indicator
- Session ID (e.g., `sess_abc123...`)
- Connection time
- Reconnect count = 0

**If DISCONNECTED:**
- Check Xcode console for errors
- Verify `OPENAI_API_KEY` in Base44 secrets
- Check network connection (WiFi/cellular)

### Step 5: Test Audio Amplitude
1. Ask AI a question
2. Watch amplitude meter in debug panel
3. Should show 20-80% during speech
4. Should drop to 0% when AI stops

**Expected correlation:**
- High amplitude (40-80%) → Intense avatar movement
- Low amplitude (0-5%) → Minimal/no movement

### Step 6: Test Barge-in
1. Let AI start speaking
2. While AI talks, YOU speak
3. Debug panel should show:
   - `🎤 USER SPEECH DETECTED (barge-in)`
   - `🎯 AI INTERRUPTED`
   - Amplitude responds to YOUR voice
   - AI stops talking immediately

### Step 7: Measure Latency
1. Note time when you finish speaking
2. Note time when AI starts responding
3. Should be < 1 second (ChatGPT Voice quality)

**Debug logs show:**
```
[14:32:10] INFO: User speech ended
[14:32:11] SUCCESS: AI SPEAKING (amplitude: 32.4%)
Latency: ~1 second ✅
```

---

## What to Capture as Proof

### Required Screenshots/Recordings:

1. **Connection Proof**
   - Debug panel showing "✅ CONNECTED"
   - Session ID visible
   - Xcode console: `[Realtime] WebSocket connected`

2. **Audio Amplitude Proof**
   - Screen recording of amplitude meter moving
   - Show correlation with avatar movement
   - Capture during full AI response (15+ seconds)

3. **Barge-in Proof**
   - Recording of you interrupting AI
   - Debug log: `🎤 USER SPEECH DETECTED`
   - AI stops mid-sentence

4. **Latency Proof**
   - Recording with visible clock/timer
   - Show quick AI response (<1s)
   - Debug timestamps

5. **No Fake Loops Proof**
   - Xcode search: "setInterval" → 0 results in AIEggAvatar
   - Xcode search: "requestAnimationFrame" → only in audio tick function
   - Code snippet showing `analyser.getByteFrequencyData()`

---

## Debug Panel Quick Reference

### Amplitude Levels
- **0-5%**: Silence/no audio
- **5-20%**: Quiet background
- **20-50%**: Normal speech
- **50-80%**: Loud speech
- **80-100%**: Peak audio (shouting)

### Status Messages
| Status | Meaning |
|--------|---------|
| `idle` | Ready, waiting for input |
| `listening` | Microphone active |
| `thinking` | Processing response |
| `speaking` | AI audio playing |

### Log Types
- **Green (success)**: Connection, barge-in, key events
- **Yellow (warn)**: Reconnection attempts
- **Red (error)**: Failures, network issues
- **White (info)**: Regular operation

---

## Common Issues & Solutions

### Issue 1: "DISCONNECTED" forever
**Symptoms:**
- Debug panel shows red "DISCONNECTED"
- No session ID
- Reconnect count increasing

**Causes:**
- `OPENAI_API_KEY` missing/invalid
- Backend function error
- Network firewall blocking WebSocket

**Fix:**
1. Check Base44 Dashboard → Secrets
2. Verify `OPENAI_API_KEY` exists
3. Check Xcode console for backend errors
4. Try different network (WiFi → cellular)

### Issue 2: Amplitude stuck at 0%
**Symptoms:**
- AI audio plays
- Amplitude meter flat at 0%
- Avatar not moving

**Causes:**
- Audio analyser not connected
- Browser compatibility issue
- Audio context not initialized

**Fix:**
1. Check Xcode console for audio errors
2. Ensure audio actually plays (can you hear it?)
3. Try tapping screen to unlock audio context
4. Rebuild app (audio context may be stale)

### Issue 3: Barge-in not working
**Symptoms:**
- AI doesn't stop when you speak
- No `USER SPEECH DETECTED` log
- Amplitude shows your voice but no interruption

**Causes:**
- `turn_detection` not configured
- Server VAD disabled
- Microphone permissions denied

**Fix:**
1. Check backend function sends:
   ```javascript
   turn_detection: { type: 'server_vad' }
   ```
2. Verify microphone permission granted on iPhone
3. Check debug logs for `speech_started` event

### Issue 4: High latency (>2 seconds)
**Symptoms:**
- Long pause after you finish speaking
- AI takes 2-5 seconds to respond
- Feels slower than ChatGPT Voice

**Causes:**
- Slow network (cellular signal weak)
- Backend function delay
- OpenAI API latency

**Fix:**
1. Check network signal strength
2. Try WiFi instead of cellular
3. Check backend function logs for delays
4. Measure time between `speech_stopped` and `response.done`

### Issue 5: Avatar moves but amplitude is 0%
**Symptoms:**
- Avatar animating
- Debug panel shows 0% amplitude
- Inconsistent behavior

**Causes:**
- Old animation loop still in code
- Amplitude not being logged correctly
- Avatar using stale voiceLevel value

**Fix:**
1. Search code for `Math.sin` in AIEggAvatar
2. Ensure `voiceLevel` prop is connected
3. Check if `setVoiceLevel()` is being called
4. Verify amplitude logging every 0.5s

---

## Code Locations

### Debug Panel Component
```
components/ai/AITalkDebugPanel.jsx
```

### Main AI Talk Mode
```
components/ai/AITalkMode.jsx
- Line ~73: addLog() function
- Line ~120: WebSocket connection
- Line ~200: handleRealtimeEvent()
- Line ~250: playAudioChunk() with analyser
- Line ~320: interruptAI() with logging
```

### Avatar Component
```
components/ai/AIEggAvatar.jsx
- Line ~40: Animation loop (audio-driven)
- Line ~60: Movement calculations
- Line ~100: Eye tracking
```

### Backend Function
```
functions/aiVoiceRealtime.js
- Session initialization
- WebSocket proxy
```

---

## Test Results Template

Copy this for each test session:

```markdown
## Test Session: [Date]

**Device:** iPhone [Model] - iOS [Version]
**Build:** TestFlight [Build Number]
**Network:** [WiFi/Cellular]

### Results:
- [ ] Connection: PASS/FAIL
- [ ] Audio amplitude: PASS/FAIL
- [ ] Barge-in: PASS/FAIL
- [ ] Avatar sync: PASS/FAIL
- [ ] Latency: [X]ms (target: <1000ms)
- [ ] No fake loops: PASS/FAIL

### Screenshots Captured:
1. [ ] Debug panel connected
2. [ ] Amplitude during speech
3. [ ] Barge-in event log
4. [ ] Avatar movement correlation

### Issues Found:
- [Describe any issues]

### Xcode Console Logs:
```
[Paste relevant logs]
```

### Next Actions:
- [ ] Fix [issue]
- [ ] Re-test [feature]
- [ ] Deploy to TestFlight
```

---

## Success Criteria

Mark as COMPLETE only when:

✅ **All 7 tests pass on physical iPhone**
- Not simulator
- Not web preview
- Actual TestFlight build

✅ **Proof captured**
- Screen recordings
- Debug panel screenshots
- Xcode console logs

✅ **Code verified**
- No fake animation loops
- Real audio analysis confirmed
- Barge-in working

✅ **Performance acceptable**
- Latency < 1 second
- Audio doesn't cut off
- Smooth avatar movement

---

**Good luck with testing! 🚀**

For issues, check Xcode console and capture full error logs.