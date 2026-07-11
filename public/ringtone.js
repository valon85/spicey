/**
 * iOS-style ringtone using Web Audio API
 * Generates a pulsing dual-tone pattern similar to iPhone ringtone
 */

let audioContext = null;
let isPlaying = false;
let intervalId = null;

// Create a pleasant dual-tone ringtone pattern
function playRingtonePattern() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  const now = audioContext.currentTime;
  
  // Create two oscillators for a richer tone
  const osc1 = audioContext.createOscillator();
  const osc2 = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  // Frequency: A4 (440Hz) and C5 (523.25Hz) - pleasant major third interval
  osc1.frequency.value = 440;
  osc2.frequency.value = 523.25;
  
  // Wave type: sine for smooth tone
  osc1.type = 'sine';
  osc2.type = 'sine';
  
  // Connect nodes
  osc1.connect(gainNode);
  osc2.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  // Volume envelope: attack, sustain, release
  const volume = 0.5;
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(volume, now + 0.1); // Attack
  gainNode.gain.setValueAtTime(volume, now + 1.9); // Sustain
  gainNode.gain.linearRampToValueAtTime(0, now + 2); // Release
  
  // Start and stop
  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 2);
  osc2.stop(now + 2);
  
  // Pattern repeats every 2 seconds
}

function startRingtone() {
  if (isPlaying) return;
  
  console.log('[Ringtone] Starting...');
  isPlaying = true;
  
  // Play immediately
  playRingtonePattern();
  
  // Repeat every 2 seconds
  intervalId = setInterval(() => {
    if (isPlaying) {
      playRingtonePattern();
    }
  }, 2000);
  
  // Also try to resume audio context if suspended (iOS requirement)
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume();
  }
}

function stopRingtone() {
  console.log('[Ringtone] Stopping...');
  isPlaying = false;
  
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
}

// Expose to window for global access
if (typeof window !== 'undefined') {
  window.startRingtone = startRingtone;
  window.stopRingtone = stopRingtone;
}
