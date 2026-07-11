/**
 * AIFaceAvatar — Digital AI female face, exactly like reference photo
 * Blue metallic skin, circuit blocks covering forehead/cheeks, glowing cyan eyes
 * Background: deep blue with vertical light columns (like the reference image)
 */
import React, { useEffect, useRef } from 'react';

export default function AIFaceAvatar({ size = 280, isSpeaking = false, isListening = false, voiceLevel = 0 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const tRef = useRef(0);

  const speakingRef = useRef(isSpeaking);
  const listeningRef = useRef(isListening);
  const voiceLevelRef = useRef(voiceLevel);
  speakingRef.current = isSpeaking;
  listeningRef.current = isListening;
  voiceLevelRef.current = voiceLevel;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = size;
    const H = Math.round(size * 1.3);
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    const draw = () => {
      tRef.current += 0.018;
      const t = tRef.current;
      const vl = Math.min(voiceLevelRef.current, 1);
      const speaking = speakingRef.current;
      const listening = listeningRef.current;

      ctx.clearRect(0, 0, W, H);

      const cx = W * 0.5;
      const cy = H * 0.47;
      const fW = W * 0.36;
      const fH = H * 0.45;

      drawBackground(ctx, W, H, t, vl);
      drawNeckShoulder(ctx, cx, cy, fW, fH);
      drawFaceSkin(ctx, cx, cy, fW, fH, t, vl);
      drawHair(ctx, cx, cy, fW, fH, t);
      drawFaceCircuitBlocks(ctx, cx, cy, fW, fH, t, vl);
      drawEyebrows(ctx, cx, cy, fW, fH);
      drawEyes(ctx, cx, cy, fW, fH, t, vl, speaking, listening);
      drawNose(ctx, cx, cy, fW, fH);
      drawMouth(ctx, cx, cy, fW, fH, t, vl, speaking);
      drawFaceRimLight(ctx, cx, cy, fW, fH, t, vl);

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={Math.round(size * 1.3)}
      style={{ width: size, height: Math.round(size * 1.3), display: 'block', background: 'transparent' }}
    />
  );
}

// ─── BACKGROUND: deep dark blue + vertical light streaks ───
function drawBackground(ctx, W, H, t, vl) {
  // Base deep dark
  ctx.fillStyle = '#020810';
  ctx.fillRect(0, 0, W, H);

  // Deep space radial
  const bg = ctx.createRadialGradient(W * 0.5, H * 0.45, 0, W * 0.5, H * 0.5, W * 1.1);
  bg.addColorStop(0, 'rgba(0,30,70,0.85)');
  bg.addColorStop(0.5, 'rgba(0,10,30,0.6)');
  bg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Vertical light columns (like reference image)
  const numCols = 14;
  for (let i = 0; i < numCols; i++) {
    const x = (i / (numCols - 1)) * W;
    const phase = t * 0.6 + i * 0.45;
    const alpha = 0.06 + 0.05 * Math.abs(Math.sin(phase));
    const colG = ctx.createLinearGradient(x, 0, x, H);
    colG.addColorStop(0, 'rgba(0,150,255,0)');
    colG.addColorStop(0.2, `rgba(0,160,255,${alpha})`);
    colG.addColorStop(0.5, `rgba(0,180,255,${alpha * 1.3})`);
    colG.addColorStop(0.8, `rgba(0,160,255,${alpha})`);
    colG.addColorStop(1, 'rgba(0,150,255,0)');
    ctx.fillStyle = colG;
    ctx.fillRect(x - 1.2, 0, 2.4, H);
  }

  // Floating bright blue dots (like reference)
  const dotPositions = [
    [0.08, 0.12], [0.15, 0.35], [0.06, 0.58], [0.12, 0.75], [0.2, 0.9],
    [0.88, 0.15], [0.92, 0.38], [0.85, 0.6], [0.9, 0.78], [0.82, 0.92],
    [0.25, 0.08], [0.5, 0.04], [0.75, 0.07], [0.3, 0.95], [0.68, 0.96],
  ];
  dotPositions.forEach(([dx, dy], i) => {
    const pulse = 0.5 + 0.5 * Math.abs(Math.sin(t * 0.9 + i * 0.7));
    const r = 2.5 + pulse * 1.5;
    ctx.beginPath();
    ctx.arc(dx * W, dy * H, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0,200,255,${0.5 + pulse * 0.45 + vl * 0.2})`;
    ctx.shadowColor = '#00ccff';
    ctx.shadowBlur = 8 + pulse * 6;
    ctx.fill();
    ctx.shadowBlur = 0;
  });
}

// ─── NECK + SHOULDER HINT ───
function drawNeckShoulder(ctx, cx, cy, fW, fH) {
  // Shoulders
  ctx.beginPath();
  ctx.moveTo(cx - fW * 1.5, cy + fH * 1.4);
  ctx.bezierCurveTo(cx - fW * 1.2, cy + fH * 1.1, cx - fW * 0.6, cy + fH * 0.95, cx - fW * 0.28, cy + fH * 0.88);
  ctx.lineTo(cx + fW * 0.28, cy + fH * 0.88);
  ctx.bezierCurveTo(cx + fW * 0.6, cy + fH * 0.95, cx + fW * 1.2, cy + fH * 1.1, cx + fW * 1.5, cy + fH * 1.4);
  ctx.closePath();
  const shG = ctx.createLinearGradient(cx, cy + fH * 0.88, cx, cy + fH * 1.4);
  shG.addColorStop(0, '#1a3a5a');
  shG.addColorStop(1, '#0a1828');
  ctx.fillStyle = shG;
  ctx.fill();

  // Neck
  ctx.beginPath();
  ctx.moveTo(cx - fW * 0.22, cy + fH * 0.88);
  ctx.bezierCurveTo(cx - fW * 0.2, cy + fH * 1.08, cx - fW * 0.24, cy + fH * 1.2, cx - fW * 0.26, cy + fH * 1.3);
  ctx.lineTo(cx + fW * 0.26, cy + fH * 1.3);
  ctx.bezierCurveTo(cx + fW * 0.24, cy + fH * 1.2, cx + fW * 0.2, cy + fH * 1.08, cx + fW * 0.22, cy + fH * 0.88);
  ctx.closePath();
  const nkG = ctx.createLinearGradient(cx - fW * 0.26, 0, cx + fW * 0.26, 0);
  nkG.addColorStop(0, '#1a3a5a');
  nkG.addColorStop(0.4, '#2a5a80');
  nkG.addColorStop(0.6, '#305878');
  nkG.addColorStop(1, '#1a3050');
  ctx.fillStyle = nkG;
  ctx.fill();
}

// ─── FACE SKIN: blue metallic like the reference ───
function fp(ctx, cx, cy, fW, fH) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - fH);
  ctx.bezierCurveTo(cx + fW * 0.9, cy - fH, cx + fW * 1.02, cy - fH * 0.3, cx + fW * 0.94, cy + fH * 0.1);
  ctx.bezierCurveTo(cx + fW * 0.88, cy + fH * 0.48, cx + fW * 0.65, cy + fH * 0.76, cx + fW * 0.28, cy + fH * 0.9);
  ctx.bezierCurveTo(cx + fW * 0.13, cy + fH * 0.96, cx - fW * 0.13, cy + fH * 0.96, cx - fW * 0.28, cy + fH * 0.9);
  ctx.bezierCurveTo(cx - fW * 0.65, cy + fH * 0.76, cx - fW * 0.88, cy + fH * 0.48, cx - fW * 0.94, cy + fH * 0.1);
  ctx.bezierCurveTo(cx - fW * 1.02, cy - fH * 0.3, cx - fW * 0.9, cy - fH, cx, cy - fH);
  ctx.closePath();
}

function drawFaceSkin(ctx, cx, cy, fW, fH, t, vl) {
  fp(ctx, cx, cy, fW, fH);
  // Blue metallic skin — exactly like reference
  const skinG = ctx.createRadialGradient(cx - fW * 0.15, cy - fH * 0.3, fW * 0.05, cx + fW * 0.1, cy + fH * 0.15, fW * 1.4);
  skinG.addColorStop(0,   '#90cce8');  // bright highlight
  skinG.addColorStop(0.15,'#55a8cc');  // lit face
  skinG.addColorStop(0.38,'#2878a8');  // mid
  skinG.addColorStop(0.62,'#145888');  // shadow
  skinG.addColorStop(0.82,'#0a2e50');  // deep shadow
  skinG.addColorStop(1,   '#040f1e');  // edge
  ctx.fillStyle = skinG;
  ctx.fill();

  // Specular — top-left strong highlight
  fp(ctx, cx, cy, fW, fH);
  const spec = ctx.createRadialGradient(cx - fW * 0.25, cy - fH * 0.58, 0, cx - fW * 0.25, cy - fH * 0.5, fW * 0.5);
  spec.addColorStop(0, 'rgba(200,240,255,0.3)');
  spec.addColorStop(0.5, 'rgba(100,200,255,0.08)');
  spec.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = spec;
  ctx.fill();
}

// ─── HAIR: dark blue-black ───
function drawHair(ctx, cx, cy, fW, fH, t) {
  ctx.save();
  const hG = ctx.createLinearGradient(cx, cy - fH * 1.12, cx + fW * 0.4, cy + fH * 0.5);
  hG.addColorStop(0, '#06080f');
  hG.addColorStop(0.4, '#0c1020');
  hG.addColorStop(1, '#060810');

  // Right hair
  ctx.beginPath();
  ctx.moveTo(cx, cy - fH * 1.0);
  ctx.bezierCurveTo(cx + fW * 0.7, cy - fH * 1.12, cx + fW * 1.12, cy - fH * 0.62, cx + fW * 1.1, cy - fH * 0.05);
  ctx.bezierCurveTo(cx + fW * 1.06, cy + fH * 0.22, cx + fW * 0.96, cy + fH * 0.52, cx + fW * 0.7, cy + fH * 0.82);
  ctx.lineTo(cx + fW * 0.3, cy + fH * 0.88);
  ctx.bezierCurveTo(cx + fW * 0.66, cy + fH * 0.5, cx + fW * 0.88, cy + fH * 0.14, cx + fW * 0.92, cy - fH * 0.08);
  ctx.bezierCurveTo(cx + fW * 0.98, cy - fH * 0.32, cx + fW * 0.88, cy - fH * 0.9, cx, cy - fH * 1.0);
  ctx.closePath();
  ctx.fillStyle = hG;
  ctx.fill();

  // Left hair
  ctx.beginPath();
  ctx.moveTo(cx, cy - fH * 1.0);
  ctx.bezierCurveTo(cx - fW * 0.7, cy - fH * 1.12, cx - fW * 1.12, cy - fH * 0.62, cx - fW * 1.1, cy - fH * 0.05);
  ctx.bezierCurveTo(cx - fW * 1.06, cy + fH * 0.22, cx - fW * 0.96, cy + fH * 0.52, cx - fW * 0.7, cy + fH * 0.82);
  ctx.lineTo(cx - fW * 0.3, cy + fH * 0.88);
  ctx.bezierCurveTo(cx - fW * 0.66, cy + fH * 0.5, cx - fW * 0.88, cy + fH * 0.14, cx - fW * 0.92, cy - fH * 0.08);
  ctx.bezierCurveTo(cx - fW * 0.98, cy - fH * 0.32, cx - fW * 0.88, cy - fH * 0.9, cx, cy - fH * 1.0);
  ctx.closePath();
  ctx.fillStyle = hG;
  ctx.fill();

  // Blue hair sheen
  const sheen = ctx.createRadialGradient(cx - fW * 0.1, cy - fH * 0.9, 0, cx - fW * 0.1, cy - fH * 0.78, fW * 0.42);
  sheen.addColorStop(0, 'rgba(0,100,180,0.22)');
  sheen.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sheen;
  ctx.beginPath();
  ctx.ellipse(cx - fW * 0.1, cy - fH * 0.86, fW * 0.42, fH * 0.14, -0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ─── CIRCUIT BLOCKS on face (like reference — forehead + cheeks) ───
function drawFaceCircuitBlocks(ctx, cx, cy, fW, fH, t, vl) {
  ctx.save();
  fp(ctx, cx, cy, fW, fH);
  ctx.clip();

  // Forehead circuit blocks — dense, like the reference image
  const blocks = [
    // Top forehead row
    { x: cx - fW * 0.28, y: cy - fH * 0.9,  w: fW * 0.08, h: fH * 0.04 },
    { x: cx - fW * 0.16, y: cy - fH * 0.94, w: fW * 0.12, h: fH * 0.04 },
    { x: cx - fW * 0.01, y: cy - fH * 0.96, w: fW * 0.14, h: fH * 0.035 },
    { x: cx + fW * 0.16, y: cy - fH * 0.92, w: fW * 0.1,  h: fH * 0.042 },
    { x: cx + fW * 0.28, y: cy - fH * 0.86, w: fW * 0.09, h: fH * 0.04 },
    // Second forehead row
    { x: cx - fW * 0.35, y: cy - fH * 0.8,  w: fW * 0.1,  h: fH * 0.038 },
    { x: cx - fW * 0.2,  y: cy - fH * 0.82, w: fW * 0.16, h: fH * 0.042 },
    { x: cx - fW * 0.01, y: cy - fH * 0.84, w: fW * 0.18, h: fH * 0.036 },
    { x: cx + fW * 0.2,  y: cy - fH * 0.8,  w: fW * 0.14, h: fH * 0.04 },
    { x: cx + fW * 0.36, y: cy - fH * 0.76, w: fW * 0.09, h: fH * 0.038 },
    // Third row
    { x: cx - fW * 0.38, y: cy - fH * 0.68, w: fW * 0.12, h: fH * 0.035 },
    { x: cx - fW * 0.22, y: cy - fH * 0.71, w: fW * 0.14, h: fH * 0.038 },
    { x: cx - fW * 0.04, y: cy - fH * 0.72, w: fW * 0.2,  h: fH * 0.035 },
    { x: cx + fW * 0.18, y: cy - fH * 0.69, w: fW * 0.15, h: fH * 0.036 },
    { x: cx + fW * 0.35, y: cy - fH * 0.65, w: fW * 0.1,  h: fH * 0.036 },
    // Cheek left
    { x: cx - fW * 0.82, y: cy - fH * 0.25, w: fW * 0.12, h: fH * 0.03 },
    { x: cx - fW * 0.78, y: cy - fH * 0.13, w: fW * 0.1,  h: fH * 0.028 },
    { x: cx - fW * 0.76, y: cy - fH * 0.02, w: fW * 0.11, h: fH * 0.028 },
    { x: cx - fW * 0.74, y: cy + fH * 0.1,  w: fW * 0.1,  h: fH * 0.026 },
    // Cheek right
    { x: cx + fW * 0.58, y: cy - fH * 0.22, w: fW * 0.12, h: fH * 0.03 },
    { x: cx + fW * 0.6,  y: cy - fH * 0.1,  w: fW * 0.1,  h: fH * 0.028 },
    { x: cx + fW * 0.58, y: cy + fH * 0.02, w: fW * 0.11, h: fH * 0.028 },
    { x: cx + fW * 0.56, y: cy + fH * 0.13, w: fW * 0.1,  h: fH * 0.026 },
    // Center face (between eyes)
    { x: cx - fW * 0.12, y: cy - fH * 0.48, w: fW * 0.08, h: fH * 0.025 },
    { x: cx + fW * 0.06, y: cy - fH * 0.42, w: fW * 0.1,  h: fH * 0.022 },
  ];

  blocks.forEach((b, i) => {
    const pulse = 0.4 + 0.5 * Math.abs(Math.sin(t * 1.0 + i * 0.45));
    // Block outline — bright cyan
    ctx.strokeStyle = `rgba(0,220,255,${pulse * 0.85 + vl * 0.15})`;
    ctx.lineWidth = 0.9;
    ctx.strokeRect(b.x, b.y, b.w, b.h);
    // Block fill — very subtle
    ctx.fillStyle = `rgba(0,180,255,${pulse * 0.07 + vl * 0.04})`;
    ctx.fillRect(b.x, b.y, b.w, b.h);

    // Internal mini lines
    ctx.beginPath();
    ctx.moveTo(b.x + b.w * 0.3, b.y);
    ctx.lineTo(b.x + b.w * 0.3, b.y + b.h);
    ctx.strokeStyle = `rgba(0,200,255,${pulse * 0.3})`;
    ctx.lineWidth = 0.4;
    ctx.stroke();
  });

  // Connecting trace lines between blocks
  const connections = [
    [0, 5], [1, 6], [2, 7], [3, 8], [6, 11], [7, 12], [8, 13],
    [11, 15], [12, 23], [13, 14],
  ];
  connections.forEach(([a, b]) => {
    if (a >= blocks.length || b >= blocks.length) return;
    const ba = blocks[a], bb = blocks[b];
    const alpha = 0.2 + 0.2 * Math.abs(Math.sin(t * 0.8 + a * 0.3));
    ctx.beginPath();
    ctx.moveTo(ba.x + ba.w * 0.5, ba.y + ba.h);
    ctx.lineTo(bb.x + bb.w * 0.5, bb.y);
    ctx.strokeStyle = `rgba(0,200,255,${alpha})`;
    ctx.lineWidth = 0.5;
    ctx.stroke();
  });

  // Horizontal scan lines
  for (let row = 0; row < 18; row++) {
    const fy = cy - fH * 0.98 + row * (fH * 1.96 / 18);
    const a = 0.025 + 0.02 * Math.abs(Math.sin(t * 0.4 + row * 0.3));
    ctx.beginPath();
    ctx.moveTo(cx - fW * 1.05, fy);
    ctx.lineTo(cx + fW * 1.05, fy);
    ctx.strokeStyle = `rgba(0,180,255,${a})`;
    ctx.lineWidth = 0.4;
    ctx.stroke();
  }

  // Moving scan line
  const scanY = cy - fH + ((t * 50) % (fH * 2));
  const scanG = ctx.createLinearGradient(cx - fW, scanY, cx + fW, scanY);
  scanG.addColorStop(0, 'rgba(0,220,255,0)');
  scanG.addColorStop(0.5, `rgba(0,220,255,${0.22 + vl * 0.2})`);
  scanG.addColorStop(1, 'rgba(0,220,255,0)');
  ctx.beginPath();
  ctx.moveTo(cx - fW, scanY);
  ctx.lineTo(cx + fW, scanY);
  ctx.strokeStyle = scanG;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.restore();
}

// ─── EYEBROWS ───
function drawEyebrows(ctx, cx, cy, fW, fH) {
  [-1, 1].forEach(side => {
    const bx = cx + side * fW * 0.4;
    const by = cy - fH * 0.33;
    ctx.beginPath();
    ctx.moveTo(bx - side * fW * 0.19, by + fH * 0.018);
    ctx.quadraticCurveTo(bx - side * fW * 0.02, by - fH * 0.024, bx + side * fW * 0.17, by + fH * 0.01);
    ctx.strokeStyle = '#020810';
    ctx.lineWidth = fH * 0.04;
    ctx.lineCap = 'round';
    ctx.stroke();
    // Blue tint
    ctx.strokeStyle = 'rgba(0,120,200,0.35)';
    ctx.lineWidth = fH * 0.02;
    ctx.stroke();
  });
}

// ─── EYES: large, intensely glowing cyan ───
function drawEyes(ctx, cx, cy, fW, fH, t, vl, speaking, listening) {
  const eyeY = cy - fH * 0.13;
  const eyeSpX = fW * 0.4;
  const blinkCycle = t % 90;
  const blink = blinkCycle < 3.5 ? Math.sin((blinkCycle / 3.5) * Math.PI) : 0;
  const openV = 1 - blink * 0.97;

  let eyeDX = 0;
  if (speaking && vl > 0.02) eyeDX = Math.sin(t * 1.6) * fW * 0.035 * Math.min(vl * 2, 1);
  else if (listening) eyeDX = Math.sin(t * 0.9) * fW * 0.028;

  [-1, 1].forEach(side => {
    const ex = cx + side * eyeSpX + eyeDX * 0.5;
    const ey = eyeY;

    // Deep socket
    ctx.beginPath();
    ctx.ellipse(ex, ey + fH * 0.01, fW * 0.2, fH * 0.115 * openV, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,5,18,0.75)';
    ctx.fill();

    // Sclera — blue-tinted white
    ctx.beginPath();
    ctx.ellipse(ex, ey, fW * 0.165, fH * 0.092 * openV, 0, 0, Math.PI * 2);
    const scG = ctx.createRadialGradient(ex - fW * 0.04, ey - fH * 0.02, 1, ex, ey, fW * 0.165);
    scG.addColorStop(0, '#d8eeff');
    scG.addColorStop(0.6, '#aaccee');
    scG.addColorStop(1, '#6688bb');
    ctx.fillStyle = scG;
    ctx.fill();

    // Iris — bright cyan/teal like reference
    const iR = fW * 0.1;
    ctx.beginPath();
    ctx.ellipse(ex + eyeDX * 0.25, ey, iR, iR * 0.9 * openV, 0, 0, Math.PI * 2);
    const iG = ctx.createRadialGradient(ex + eyeDX * 0.25 - iR * 0.22, ey - iR * 0.2, iR * 0.05, ex + eyeDX * 0.25, ey, iR);
    iG.addColorStop(0,   '#ddfaff');
    iG.addColorStop(0.18,'#55e0ff');
    iG.addColorStop(0.45,'#0099cc');
    iG.addColorStop(0.75,'#005590');
    iG.addColorStop(1,   '#001830');
    ctx.fillStyle = iG;
    ctx.fill();

    // Iris radial texture
    for (let r = 0; r < 12; r++) {
      const ang = (r / 12) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(ex + eyeDX * 0.25 + Math.cos(ang) * iR * 0.38, ey + Math.sin(ang) * iR * 0.34 * openV);
      ctx.lineTo(ex + eyeDX * 0.25 + Math.cos(ang) * iR * 0.9, ey + Math.sin(ang) * iR * 0.81 * openV);
      ctx.strokeStyle = 'rgba(0,180,230,0.22)';
      ctx.lineWidth = 0.4;
      ctx.stroke();
    }

    // Pupil
    ctx.beginPath();
    ctx.ellipse(ex + eyeDX * 0.25, ey, iR * 0.36, iR * 0.36 * openV, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#000a18';
    ctx.fill();

    // Main bright highlight
    ctx.beginPath();
    ctx.ellipse(ex + eyeDX * 0.25 - iR * 0.3, ey - iR * 0.28, iR * 0.24, iR * 0.17 * openV, -0.4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.fill();

    // Secondary highlight
    ctx.beginPath();
    ctx.arc(ex + eyeDX * 0.25 + iR * 0.2, ey + iR * 0.1, iR * 0.1, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(220,245,255,0.5)';
    ctx.fill();

    // Eyelid top shadow
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(ex, ey, fW * 0.165, fH * 0.092 * openV, 0, 0, Math.PI * 2);
    ctx.clip();
    const lidG = ctx.createLinearGradient(ex, ey - fH * 0.092 * openV, ex, ey - fH * 0.025 * openV);
    lidG.addColorStop(0, 'rgba(0,8,25,0.8)');
    lidG.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = lidG;
    ctx.fillRect(ex - fW * 0.18, ey - fH * 0.1 * openV, fW * 0.36, fH * 0.092 * openV);
    ctx.restore();

    // Upper lid line (dark, thick)
    ctx.beginPath();
    ctx.moveTo(ex - fW * 0.165, ey);
    ctx.quadraticCurveTo(ex, ey - fH * 0.1 * openV, ex + fW * 0.165, ey);
    ctx.strokeStyle = 'rgba(0,15,40,0.85)';
    ctx.lineWidth = fH * 0.025 * openV;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Lower lash line
    ctx.beginPath();
    ctx.moveTo(ex - fW * 0.145, ey + fH * 0.065 * openV);
    ctx.quadraticCurveTo(ex, ey + fH * 0.088 * openV, ex + fW * 0.145, ey + fH * 0.065 * openV);
    ctx.strokeStyle = 'rgba(0,15,40,0.6)';
    ctx.lineWidth = fH * 0.014;
    ctx.stroke();

    // Strong cyan glow ring
    ctx.beginPath();
    ctx.ellipse(ex + eyeDX * 0.25, ey, iR, iR * 0.9 * openV, 0, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0,230,255,${0.65 + vl * 0.35})`;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = '#00eeff';
    ctx.shadowBlur = 14 + vl * 20;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Outer glow halo
    const eyeAura = ctx.createRadialGradient(ex, ey, iR * 0.85, ex, ey, iR * 1.9);
    eyeAura.addColorStop(0, `rgba(0,200,255,${0.18 + vl * 0.22})`);
    eyeAura.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.ellipse(ex, ey, iR * 1.9, iR * 1.7 * openV, 0, 0, Math.PI * 2);
    ctx.fillStyle = eyeAura;
    ctx.fill();
  });
}

// ─── NOSE ───
function drawNose(ctx, cx, cy, fW, fH) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - fH * 0.05);
  ctx.bezierCurveTo(cx - fW * 0.04, cy + fH * 0.1, cx - fW * 0.048, cy + fH * 0.21, cx - fW * 0.044, cy + fH * 0.25);
  ctx.strokeStyle = 'rgba(0,60,120,0.5)';
  ctx.lineWidth = 1.1;
  ctx.stroke();
  [-1, 1].forEach(side => {
    ctx.beginPath();
    ctx.ellipse(cx + side * fW * 0.088, cy + fH * 0.265, fW * 0.048, fH * 0.019, side * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,20,55,0.6)';
    ctx.fill();
  });
}

// ─── MOUTH ───
function drawMouth(ctx, cx, cy, fW, fH, t, vl, speaking) {
  const mY = cy + fH * 0.48;
  const openAmt = speaking ? vl * fH * 0.055 : 0;

  // Upper lip
  ctx.beginPath();
  ctx.moveTo(cx - fW * 0.23, mY);
  ctx.bezierCurveTo(cx - fW * 0.13, mY - fH * 0.028, cx - fW * 0.05, mY - fH * 0.04, cx, mY - fH * 0.015);
  ctx.bezierCurveTo(cx + fW * 0.05, mY - fH * 0.04, cx + fW * 0.13, mY - fH * 0.028, cx + fW * 0.23, mY);
  ctx.bezierCurveTo(cx + fW * 0.14, mY + fH * 0.014 + openAmt, cx - fW * 0.14, mY + fH * 0.014 + openAmt, cx - fW * 0.23, mY);
  ctx.closePath();
  const ulG = ctx.createLinearGradient(cx, mY - fH * 0.04, cx, mY + openAmt);
  ulG.addColorStop(0, '#1a5878');
  ulG.addColorStop(1, '#0c3255');
  ctx.fillStyle = ulG;
  ctx.fill();

  // Lower lip
  ctx.beginPath();
  ctx.moveTo(cx - fW * 0.23, mY);
  ctx.bezierCurveTo(cx - fW * 0.13, mY + fH * 0.014 + openAmt, cx - fW * 0.06, mY + fH * 0.05 + openAmt * 1.2, cx, mY + fH * 0.053 + openAmt * 1.2);
  ctx.bezierCurveTo(cx + fW * 0.06, mY + fH * 0.05 + openAmt * 1.2, cx + fW * 0.13, mY + fH * 0.014 + openAmt, cx + fW * 0.23, mY);
  ctx.closePath();
  const llG = ctx.createLinearGradient(cx, mY, cx, mY + fH * 0.055 + openAmt);
  llG.addColorStop(0, '#2268a0');
  llG.addColorStop(1, '#0c3255');
  ctx.fillStyle = llG;
  ctx.fill();

  // Lip highlight
  const lHL = ctx.createRadialGradient(cx, mY + fH * 0.028, 0, cx, mY + fH * 0.038, fW * 0.14);
  lHL.addColorStop(0, 'rgba(100,200,255,0.22)');
  lHL.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = lHL;
  ctx.beginPath();
  ctx.ellipse(cx, mY + fH * 0.03, fW * 0.14, fH * 0.022, 0, 0, Math.PI * 2);
  ctx.fill();

  // Lip line
  ctx.beginPath();
  ctx.moveTo(cx - fW * 0.23, mY);
  ctx.bezierCurveTo(cx - fW * 0.13, mY - fH * 0.007, cx - fW * 0.05, mY - fH * 0.026, cx, mY - fH * 0.009);
  ctx.bezierCurveTo(cx + fW * 0.05, mY - fH * 0.026, cx + fW * 0.13, mY - fH * 0.007, cx + fW * 0.23, mY);
  ctx.strokeStyle = 'rgba(0,140,210,0.6)';
  ctx.lineWidth = 0.9;
  ctx.stroke();

  if (openAmt > 0.004) {
    ctx.beginPath();
    ctx.ellipse(cx, mY + fH * 0.016 + openAmt * 0.55, fW * 0.16, openAmt * 0.6, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,5,18,0.92)';
    ctx.fill();
  }
}

// ─── FACE RIM GLOW ───
function drawFaceRimLight(ctx, cx, cy, fW, fH, t, vl) {
  fp(ctx, cx, cy, fW, fH);
  ctx.strokeStyle = `rgba(0,200,255,${0.38 + vl * 0.45})`;
  ctx.lineWidth = 1.8;
  ctx.shadowColor = '#00ccff';
  ctx.shadowBlur = 14 + vl * 22;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Side rim blue light (left & right, like reference lighting)
  fp(ctx, cx, cy, fW, fH);
  const rimL = ctx.createLinearGradient(cx - fW * 1.05, cy, cx - fW * 0.4, cy);
  rimL.addColorStop(0, `rgba(0,180,255,${0.22 + vl * 0.12})`);
  rimL.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = rimL;
  ctx.fill();

  fp(ctx, cx, cy, fW, fH);
  const rimR = ctx.createLinearGradient(cx + fW * 1.05, cy, cx + fW * 0.4, cy);
  rimR.addColorStop(0, `rgba(0,160,255,${0.18 + vl * 0.1})`);
  rimR.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = rimR;
  ctx.fill();
}