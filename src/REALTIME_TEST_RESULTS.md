# 📱 OpenAI Realtime API - iPhone Test Results

## Test Checklist

### Prerequisites
- [ ] iPhone connected via USB
- [ ] Xcode open with project loaded
- [ ] TestFlight build deployed OR device selected in Xcode
- [ ] Network connection (WiFi or cellular)
- [ ] Microphone permission granted

---

## Test 1: Realtime API Connection ✅/❌

**What to verify:**
- WebSocket connects to OpenAI
- Session ID is generated
- Connection persists (no immediate disconnect)

**Steps:**
1. Open app on iPhone
2. Tap AI egg button
3. Tap DEBUG button (top-left)
4. Check debug panel

**Expected:**
- ✅ Green "CONNECTED" indicator
- ✅ Session ID visible (e.g., `sess_abc123...`)
- ✅ Connection time shown
- ✅ Reconnect count = 0

**Actual Result:**
- Connection: PASS / FAIL
- Session ID: [write or screenshot]
- Connection time: [write timestamp]
- Xcode console shows: `[Realtime] WebSocket connected`

**Screenshot:** [attach]

---

## Test 2: Audio Amplitude Tracking ✅/❌

**What to verify:**
- Audio amplitude meter responds to AI voice
- Amplitude correlates with avatar movement
- No fake/constant animation

**Steps:**
1. Ask AI a question (e.g., "Tell me a joke")
2. Watch amplitude meter in debug panel
3. Observe avatar movement
4. Note amplitude values during speech

**Expected:**
- ✅ Amplitude rises when AI speaks (20-80%)
- ✅ Amplitude drops to 0% when AI stops
- ✅ Avatar moves more when amplitude is high
- ✅ Avatar still when amplitude is 0%

**Actual Result:**
- Max amplitude reached: [e.g., 65%]
- Min amplitude (silence): [e.g., 0-5%]
- Avatar sync: PASS / FAIL
- Console shows: `[AITalk DEBUG] 🔊 AI SPEAKING (amplitude: X.X)`

**Screenshot/Recording:** [attach]

---

## Test 3: Barge-in (Interruption) ✅/❌

**What to verify:**
- AI stops when user speaks
- Debug log shows barge-in event
- Amplitude responds to user's voice

**Steps:**
1. Ask AI to tell a long story
2. While AI is speaking, YOU speak
3. Check if AI stops immediately
4. Watch debug panel for barge-in log

**Expected:**
- ✅ AI stops mid-sentence
- ✅ Debug log: `🎤 USER SPEECH DETECTED (barge-in)`
- ✅ Debug log: `🎯 AI INTERRUPTED`
- ✅ Amplitude responds to YOUR voice
- ✅ AI waits for you to finish

**Actual Result:**
- Barge-in worked: YES / NO
- AI stopped: IMMEDIATELY / AFTER DELAY / NOT AT ALL
- Debug logs captured: [screenshot]
- Console shows: `[Realtime] AI interrupted - user speaking`

**Recording:** [attach - must show interruption moment]

---

## Test 4: Audio Continuity ✅/❌

**What to verify:**
- AI audio doesn't cut off prematurely
- Full sentences are spoken
- No choppy/broken audio

**Steps:**
1. Ask AI a complex question
2. Let AI speak for 30+ seconds
3. Listen for audio dropouts
4. Check amplitude meter stays active

**Expected:**
- ✅ AI completes full sentences
- ✅ Audio quality consistent
- ✅ Amplitude meter active throughout
- ✅ No gaps/silences mid-sentence

**Actual Result:**
- Audio quality: EXCELLENT / GOOD / POOR
- Dropouts: YES / NO (if yes, describe)
- Longest continuous speech: [X] seconds
- Amplitude stayed active: YES / NO

**Recording:** [attach]

---

## Test 5: Latency Measurement ✅/❌

**What to verify:**
- Response time < 1 second
- Feels like ChatGPT Voice
- No awkward pauses

**Steps:**
1. Enable debug panel
2. Ask AI a short question
3. Note timestamp when you finish speaking
4. Note timestamp when AI starts responding
5. Calculate difference

**Expected:**
- ✅ Latency < 1000ms (1 second)
- ✅ Feels natural/conversational
- ✅ Debug logs show quick turnaround

**Actual Result:**
- Measured latency: [X]ms
- Debug log timestamps:
  - User speech ended: [HH:MM:SS]
  - AI speaking started: [HH:MM:SS]
- Feels like ChatGPT Voice: YES / NO

**Calculation:**
```
AI start time - User end time = Latency
[time] - [time] = [X]ms
```

---

## Test 6: No Fake Animation Loops ✅/❌

**What to verify:**
- Avatar movement driven by real audio
- No `setInterval` or `Math.sin()` loops
- Code uses `analyser.getByteFrequencyData()`

**Steps:**
1. Open Xcode
2. Search in `AIEggAvatar.jsx`:
   - Search: `setInterval` → Should find 0 results
   - Search: `Math.sin` → Should find 0 results (or only in idle breathing)
3. Search in `AITalkMode.jsx`:
   - Search: `getByteFrequencyData` → Should find 1+ results
4. Check animation only runs when audio plays

**Expected:**
- ✅ No fake loops in AIEggAvatar
- ✅ Real audio analysis in AITalkMode
- ✅ Avatar still when no audio

**Actual Result:**
- `setInterval` in AIEggAvatar: [count] (should be 0)
- `Math.sin` in AIEggAvatar: [count] (should be 0-1 for breathing)
- `getByteFrequencyData` found: YES / NO
- Avatar moves without audio: YES / NO (should be NO)

**Code Search Screenshots:** [attach]

---

## Test 7: iPhone/TestFlight Deployment ✅/❌

**What to verify:**
- Works on physical iPhone (not just web preview)
- TestFlight build installs correctly
- All features work on device

**Steps:**
1. Build app in Xcode
2. Archive for TestFlight OR run on connected device
3. Install on iPhone
4. Test all features

**Expected:**
- ✅ App installs without errors
- ✅ AI talk works on iPhone
- ✅ Microphone permission granted
- ✅ Audio plays through iPhone speaker
- ✅ Debug panel visible and functional

**Actual Result:**
- Device: iPhone [model] - iOS [version]
- Build method: Xcode direct / TestFlight
- Installation: SUCCESS / FAILED
- Features work on device: YES / NO
- Issues: [describe any]

**Photo of iPhone running app:** [attach]

---

## Overall Test Summary

### Pass/Fail Count
- [ ] Test 1: Connection (PASS/FAIL)
- [ ] Test 2: Audio Amplitude (PASS/FAIL)
- [ ] Test 3: Barge-in (PASS/FAIL)
- [ ] Test 4: Audio Continuity (PASS/FAIL)
- [ ] Test 5: Latency (PASS/FAIL)
- [ ] Test 6: No Fake Loops (PASS/FAIL)
- [ ] Test 7: iPhone Deployment (PASS/FAIL)

### Total: X/7 Tests Passed

### Mark as COMPLETE when:
- [ ] All 7 tests PASS
- [ ] All screenshots/recordings attached
- [ ] Xcode console logs captured
- [ ] Latency < 1000ms confirmed
- [ ] Barge-in verified on device

---

## Test Session Details

**Date:** [YYYY-MM-DD]
**Tester:** [Name]
**Device:** iPhone [model] - iOS [version]
**Build:** TestFlight [build number] / Xcode direct
**Network:** WiFi / Cellular [carrier]

### Issues Found
1. [Describe issue #1]
2. [Describe issue #2]

### Next Actions
- [ ] Fix [issue]
- [ ] Re-test [feature]
- [ ] Deploy to TestFlight
- [ ] Mark as COMPLETE

---

## Attachments Checklist

- [ ] Screenshot: Debug panel connected
- [ ] Screenshot: Amplitude during speech
- [ ] Screenshot: Barge-in event log
- [ ] Recording: Avatar movement correlation
- [ ] Recording: Barge-in moment
- [ ] Photo: iPhone running app
- [ ] Xcode console logs
- [ ] Code search results (no fake loops)

**Upload attachments to:** [Google Drive / Dropbox / etc. link]

---

**Test Status:** IN PROGRESS / COMPLETE

**Completion Date:** [YYYY-MM-DD]