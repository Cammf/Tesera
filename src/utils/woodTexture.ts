import * as THREE from 'three';

/**
 * Generate a procedural beech wood grain texture.
 * Creates a CanvasTexture with realistic wood grain lines,
 * subtle colour variation, and fine pore detail.
 */
export function createBeechWoodTexture(size = 512): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Base beech colour — warm pale cream-tan
  const baseR = 220, baseG = 195, baseB = 160;
  ctx.fillStyle = `rgb(${baseR},${baseG},${baseB})`;
  ctx.fillRect(0, 0, size, size);

  // Subtle background noise for pore texture
  const imgData = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < imgData.data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 12;
    imgData.data[i] = Math.min(255, Math.max(0, imgData.data[i] + noise));
    imgData.data[i + 1] = Math.min(255, Math.max(0, imgData.data[i + 1] + noise));
    imgData.data[i + 2] = Math.min(255, Math.max(0, imgData.data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // Draw grain lines — beech has fine, tight, straight grain
  for (let i = 0; i < 80; i++) {
    const y = Math.random() * size;
    const width = 0.3 + Math.random() * 1.5;
    const alpha = 0.04 + Math.random() * 0.08;
    const dark = Math.random() > 0.3;

    ctx.strokeStyle = dark
      ? `rgba(140, 110, 70, ${alpha})`
      : `rgba(200, 175, 140, ${alpha})`;
    ctx.lineWidth = width;
    ctx.beginPath();

    // Slightly wavy grain lines
    const waveAmp = 0.5 + Math.random() * 2;
    const waveFreq = 0.005 + Math.random() * 0.015;
    ctx.moveTo(0, y);
    for (let x = 0; x <= size; x += 4) {
      const yOffset = Math.sin(x * waveFreq + i) * waveAmp;
      ctx.lineTo(x, y + yOffset);
    }
    ctx.stroke();
  }

  // Occasional darker medullary rays (characteristic of beech)
  for (let i = 0; i < 15; i++) {
    const y = Math.random() * size;
    const width = 1 + Math.random() * 2;
    const length = 30 + Math.random() * 80;
    const startX = Math.random() * size;
    ctx.strokeStyle = `rgba(170, 140, 100, 0.12)`;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(startX, y);
    ctx.lineTo(startX + length, y + (Math.random() - 0.5) * 3);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 1);
  return tex;
}

/** Create a beech wood normal map (bump approximation) */
export function createBeechNormalMap(size = 512): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Neutral normal (128, 128, 255) — flat surface
  ctx.fillStyle = 'rgb(128, 128, 255)';
  ctx.fillRect(0, 0, size, size);

  // Subtle grain bumps
  const imgData = ctx.getImageData(0, 0, size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const grainNoise = Math.sin(y * 0.3) * 3 + (Math.random() - 0.5) * 4;
      imgData.data[i] = 128 + grainNoise; // R = X normal
      imgData.data[i + 1] = 128 + (Math.random() - 0.5) * 2; // G = Y normal
      // B stays at ~255 (Z)
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}
