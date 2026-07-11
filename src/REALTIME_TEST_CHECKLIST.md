# 🧪 OpenAI Realtime API - iPhone Test Checklist

## Pre-Test Setup

### 1. Build & Deploy
```bash
# Clean rebuild
npm run build
./scripts/clean-rebuild-ios.sh

# TestFlight upload
xcodebuild -workspace ios/App/App.xcworkspace -scheme App -configuration Release -archivePath App/App.xcarchive archive
xcodebuild -exportArchive -archivePath App/App.xcarchive -exportPath ./dist/ios -exportOptionsPlist exportOptions.plist
```

### 2. Environment Variables (Verify in Base44 Dashboard)
- ✅ `OPENAI_API_KEY` - Set and valid
- ✅ `BASE44_APP_ID` - Correct app ID

---

## Test Scenarios

### ✅ Test 1: Realtime Connection Verification

**Steps:**
1. Open app on iPhone (TestFlight build)
2. Tap AI egg button
3. Tap DEBUG button (top-left)
4. Check debug panel

**Expected Results:**
- [ ] `✅ CONNECTED` green indicator visible
- [ ] Session ID displayed (e.g., `sess_abc123...`)
- [ ] Connection timestamp shown
- [ ] Console log: `[Realtime] WebSocket connected`
- [ ] No reconnection attempts (reconnectCount = 0)

**Proof Required:**
- Screenshot of debug panel showing "CONNECTED"
- Screenshot of Xcode console with WebSocket connected log

---

### ✅ Test 2: Audio Does Not Cut Off

**Steps:**
1. Start conversation with AI
2. Let AI speak for 15+ seconds
3. Monitor amplitude meter in debug panel
4. Check if audio completes full sentences

**Expected Results:**
- [ ] Audio plays continuously without gaps
- [ ] Amplitude meter shows consistent activity during speech
- [ ] No sudden drops to 0% mid-sentence
- [ ] AI completes full responses

**Proof Required:**
- Screen recording showing full AI response
- Debug panel amplitude graph during speech

---

### ✅ Test 3: Barge-in Interruption

**Steps:**
1. Start AI speaking
2. While AI is talking, speak yourself
3. Watch debug panel for interruption

**Expected Results:**
- [ ] Debug log: `🎤 USER SPEECH DETECTED (barge-in)`
- [ ] AI audio stops immediately
- [ ] Status changes to "Listening"
- [ ] Amplitude meter responds to YOUR voice
- [ ] AI waits for you to finish

**Proof Required:**
- Screen recording of interruption
- Screenshot of debug logs showing barge-in event

---

### ✅ Test 4: Avatar Driven by Real Audio

**Steps:**
1. Enable debug panel
2. Start AI speaking
3. Compare amplitude % with avatar movement

**Expected Results:**
- [ ] Avatar sways MORE when amplitude is HIGH (>40%)
- [ ] Avatar is STILL when amplitude is LOW (<5%)
- [ ] Eye movement correlates with voice level
- [ ] No animation when AI is silent
- [ ] Smooth, natural movement (not robotic loops)

**Proof Required:**
- Side-by-side video: avatar + debug amplitude meter
- Show correlation between high amplitude and intense movement

---

### ✅ Test 5: Latency Measurement

**Steps:**
1. Start conversation
2. Use stopwatch to measure response time
3. Ask quick questions

**Expected Results:**
- [ ] AI starts responding within 500-800ms
- [ ] No 2-3 second delays
- [ ] Feels like ChatGPT Voice (near-instant)
- [ ] Debug logs show minimal gap between "speech_stopped" and "response"

**Measurement:**
```
Your question ends at: 14:32:10
AI starts speaking at: 14:32:11
Latency: ~1 second ✅
```

**Proof Required:**
- Screen recording with visible timer/clock
- Debug logs showing timestamps

---

### ✅ Test 6: No Fake Animation Loops

**Steps:**
1. Open Xcode Console
2. Search for "animation" or "loop" in code
3. Check AIEggAvatar.jsx

**Expected Results:**
- [ ] NO `setInterval` or `requestAnimationFrame` running constantly
- [ ] Animation ONLY runs when `isPlayingRef.current === true`
- [ ] Animation stops when audio stops
- [ ] Code uses `analyser.getByteFrequencyData()` (real audio data)
- [ ] No hardcoded `Math.sin()` movements without audio input

**Proof Required:**
- Screenshot of Xcode search showing no loop patterns
- Code snippet from AIEggAvatar.jsx showing audio-driven logic

---

### ✅ Test 7: iPhone Native Functionality

**Steps:**
1. Test on physical iPhone (not simulator)
2. Use cellular data (not WiFi)
3. Test with microphone permissions enabled

**Expected Results:**
- [ ] WebSocket connects on cellular
- [ ] Microphone permission granted
- [ ] Audio plays through speaker/earpiece
- [ ] No CORS or domain errors
- [ ] Works in TestFlight build (not just preview)

**Proof Required:**
- Photo of iPhone running the app
- Screenshot of TestFlight app info
- Xcode console showing no errors

---

## Debug Panel Quick Reference

### Status Indicators
- **Green "CONNECTED"**: WebSocket active
- **Amplitude %**: Real-time audio level (0-100%)
- **Event Log**: Shows all realtime events

### Key Log Messages
```
✅ REALTIME CONNECTED          - WebSocket established
🎤 USER SPEECH DETECTED        - Barge-in triggered
🔊 AI SPEAKING (amplitude: X)  - Audio playing
⚠️ Reconnecting...             - Connection lost
❌ WebSocket error             - Connection failed
```

---

## Common Issues & Fixes

### Issue: "DISCONNECTED" in debug panel
**Cause:** OPENAI_API_KEY missing or invalid
**Fix:** Check Base44 secrets, rebuild app

### Issue: Amplitude always 0%
**Cause:** Audio analyser not connected
**Fix:** Check browser console for errors, ensure audio plays

### Issue: Barge-in not working
**Cause:** Server VAD not configured
**Fix:** Verify session.update sends `turn_detection: { type: 'server_vad' }`

### Issue: High latency (>2s)
**Cause:** Network or backend delay
**Fix:** Check cellular signal, verify backend function response time

---

## Sign-off Checklist

Before marking as complete, verify:

- [ ] All 7 tests passed on physical iPhone
- [ ] Screen recordings captured for tests 2, 3, 4
- [ ] Debug panel screenshots for tests 1, 5
- [ ] Code review confirms no fake loops (test 6)
- [ ] TestFlight build number documented
- [ ] Xcode console shows no critical errors

**TestFlight Build:** `1.0.X (XX)`
**Test Date:** `2026-06-23`
**Tester:** `[Your Name]`
**Device:** `iPhone [Model] - iOS [Version]`

---

## Next Steps After Testing

1. If all tests pass:
   - Remove debug panel or hide behind long-press
   - Optimize amplitude logging (reduce frequency)
   - Add error handling for reconnection

2. If tests fail:
   - Document specific failures
   - Capture Xcode console logs
   - Note network conditions (WiFi vs cellular)
   - Provide exact error messages

---

**Good luck with testing! 🚀**