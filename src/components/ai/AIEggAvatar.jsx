/**
 * AIEggAvatar — Neon egg avatar, realtime voice-sync via refs.
 */
import React, { useEffect, useRef } from 'react';

export default function AIEggAvatar({
  size = '200px',
  isSpeaking = false,
  isListening = false,
  voiceLevel = 0,
  disableGlow = false,
}) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const tRef = useRef(0);

  // Live refs — readable inside the animation loop without re-triggering useEffect
  const isSpeakingRef = useRef(isSpeaking);
  const isListeningRef = useRef(isListening);
  const voiceLevelRef = useRef(voiceLevel);
  const disableGlowRef = useRef(disableGlow);

  // Sync refs every render (no useEffect needed)
  isSpeakingRef.current = isSpeaking;
  isListeningRef.current = isListening;
  voiceLevelRef.current = voiceLevel;
  disableGlowRef.current = disableGlow;

  const sz = Math.round(parseInt(size) * 0.72);
  const W = sz;
  const H = Math.round(sz * 1.25);

  // Start animation loop once on mount (W/H only change if size prop changes)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    const drawEggPath = (cx, cy, rw, rh) => {
      ctx.beginPath();
      ctx.ellipse(cx, cy, rw, rh, 0, 0, Math.PI * 2);
      ctx.closePath();
    };

    const draw = () => {
      // Read live values from refs
      const speaking = isSpeakingRef.current;
      const listening = isListeningRef.current;
      const vl = voiceLevelRef.current;
      const noGlow = disableGlowRef.current;

      tRef.current += 0.033;
      const t = tRef.current;

      // Blink logic: every ~3s blink once
      const blinkCycle = t % 90; // ~3s at 33ms/frame
      const blinkProgress = blinkCycle < 4 ? Math.sin((blinkCycle / 4) * Math.PI) : 0; // 0=open, 1=closed

      ctx.clearRect(0, 0, W, H);

      // --- Sway / scale based on live state ---
      let swayX = 0, swayY = 0, swayRot = 0, scaleVal = 1;

      if (speaking && vl > 0.01) {
        const intensity = Math.min(vl * 2, 1);
        swayX = Math.sin(t * 3.1 + vl * 10) * 6 * intensity;
        swayY = Math.sin(t * 2.4 + vl * 8) * 4 * intensity;
        swayRot = Math.sin(t * 3.8 + vl * 12) * 4 * intensity;
        scaleVal = 1 + vl * 0.08 + Math.sin(t * 6) * vl * 0.03;
      } else if (listening) {
        scaleVal = 1.04 + Math.sin(t * 4) * 0.01;
        swayX = Math.sin(t * 1.8) * 3;
        swayY = Math.sin(t * 1.4) * 2;
      } else {
        // Idle breathing with zoom in/out effect
        swayX = Math.sin(t * 0.9) * 2;
        swayY = Math.sin(t * 0.7) * 1.5;
        swayRot = Math.sin(t * 0.5) * 1;
        // Zoom: slowly scale from 1.0 to 1.08 and back
        scaleVal = 1 + Math.sin(t * 0.5) * 0.04;
      }

      const cx = W / 2 + swayX;
      const cy = H * 0.46 + swayY;
      const rw = W * 0.4;
      const rh = H * 0.42;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((swayRot * Math.PI) / 180);
      ctx.scale(scaleVal, scaleVal);
      ctx.translate(-cx, -cy);

      // --- Outer glow aura — pink, dark purple, orange (50% reduced) ---
      if (!noGlow) {
        const glowSize = rw * (1.2 + vl * 0.3);
        const glowIntensity = speaking
          ? 0.20 + vl * 0.10
          : listening
          ? 0.15 + Math.sin(t * 3) * 0.03
          : 0.10 + Math.sin(t * 1.2) * 0.03;

        const auraGrad = ctx.createRadialGradient(cx, cy, rw * 0.15, cx, cy, glowSize);
        auraGrad.addColorStop(0, `rgba(180,10,100,${glowIntensity})`);
        auraGrad.addColorStop(0.4, `rgba(140,20,120,${glowIntensity * 0.8})`);
        auraGrad.addColorStop(0.7, `rgba(200,80,0,${glowIntensity * 0.6})`);
        auraGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.ellipse(cx, cy, glowSize, glowSize * 1.03, 0, 0, Math.PI * 2);
        ctx.fillStyle = auraGrad;
        ctx.fill();
      }

      // --- Egg body — dark center fading to transparent edges ---
      drawEggPath(cx, cy, rw, rh);
      const bodyGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rw * 1.1);
      bodyGrad.addColorStop(0,   'rgba(4,0,12,0.92)');
      bodyGrad.addColorStop(0.5, 'rgba(4,0,12,0.6)');
      bodyGrad.addColorStop(0.82,'rgba(4,0,12,0.25)');
      bodyGrad.addColorStop(1,   'rgba(4,0,12,0)');
      ctx.fillStyle = bodyGrad;
      ctx.fill();

      // --- Neon border — pink, dark purple, orange (NO blue) ---
      const borderGrad = ctx.createLinearGradient(cx - rw, cy, cx + rw, cy);
      borderGrad.addColorStop(0, '#b40a64');
      borderGrad.addColorStop(0.4, '#7a148a');
      borderGrad.addColorStop(0.7, '#9614a8');
      borderGrad.addColorStop(1, '#c85000');

      drawEggPath(cx, cy, rw, rh);
      ctx.strokeStyle = borderGrad;
      ctx.lineWidth = Math.max(sz * 0.025, 2.5) + vl * sz * 0.015;
      ctx.shadowColor = '#b40a64';
      ctx.shadowBlur = sz * 0.08 + vl * sz * 0.08;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // --- Eyes — with convergence/divergence when idle (raised higher, closer together) ---
      const eyeOffX = rw * 0.28;
      const eyeOffY = cy - rh * 0.22;
      const eyeR = Math.max(rw * 0.1, 4);

      // Eye movement: synchronized with avatar sway (natural, NOT independent)
      // Eyes move WITH the head, not separately - looks more natural
      const eyeDX = swayX * 0.3; // Follow head sway subtly
      const eyeDY = swayY * 0.3;

      // Both eyes move together with the avatar's head motion
      const leftEyeX = (cx - eyeOffX) + eyeDX;
      const rightEyeX = (cx + eyeOffX) + eyeDX;
      const eyeY = eyeOffY + eyeDY;

      [leftEyeX, rightEyeX].forEach(eyeX => {
        if (blinkProgress > 0) {
          // Blink: draw eye as horizontal line (fully closed)
          ctx.beginPath();
          ctx.moveTo(eyeX - eyeR, eyeY);
          ctx.lineTo(eyeX + eyeR, eyeY);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
        } else {
          // Perfect round eyes - no squishing, NO pupils
          ctx.beginPath();
          ctx.arc(eyeX, eyeY, eyeR, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        }
      });

      ctx.restore();

      // --- Floor reflection — pink, purple, orange (NO blue, very subtle) ---
      const reflY = H * 0.46 + rh * scaleVal + sz * 0.03;
      const reflGrad = ctx.createRadialGradient(W / 2, reflY, 0, W / 2, reflY, rw * 0.5);
      reflGrad.addColorStop(0, `rgba(180,10,100,${0.08 + vl * 0.08})`);
      reflGrad.addColorStop(0.4, `rgba(140,20,120,${0.05 + vl * 0.05})`);
      reflGrad.addColorStop(0.7, `rgba(200,80,0,${0.04 + vl * 0.04})`);
      reflGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.ellipse(W / 2, reflY, rw * 0.5, sz * 0.012, 0, 0, Math.PI * 2);
      ctx.fillStyle = reflGrad;
      ctx.fill();

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [W, H, sz]); // Only restart if size changes

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      style={{ width: W, height: H, display: 'block', background: 'transparent' }}
    />
  );
}