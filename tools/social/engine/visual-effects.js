/**
 * Visual Effects — Effets visuels avancés pour les frames vidéo
 * Particules, transitions, overlays, grain film, scanlines
 */

export function applyFilmGrain(ctx, w, h, intensity = 0.04) {
  const imgData = ctx.getImageData(0, 0, w, h);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 255 * intensity;
    d[i] += n; d[i+1] += n; d[i+2] += n;
  }
  ctx.putImageData(imgData, 0, 0);
}

export function applyVignette(ctx, w, h, strength = 0.5) {
  const grd = ctx.createRadialGradient(w/2, h/2, w*0.25, w/2, h/2, w*0.7);
  grd.addColorStop(0, 'rgba(0,0,0,0)');
  grd.addColorStop(1, `rgba(0,0,0,${strength})`);
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, w, h);
}

export function applyScanlines(ctx, w, h, opacity = 0.08) {
  ctx.fillStyle = `rgba(0,0,0,${opacity})`;
  for (let y = 0; y < h; y += 3) {
    ctx.fillRect(0, y, w, 1);
  }
}

export function applyColorGrade(ctx, w, h, grade = 'cinematic') {
  const grades = {
    cinematic: { r: 1.0, g: 0.95, b: 1.05, brightness: -5 },
    warm: { r: 1.08, g: 1.02, b: 0.92, brightness: 5 },
    cold: { r: 0.92, g: 0.98, b: 1.1, brightness: -3 },
    noir: { r: 0.9, g: 0.9, b: 0.9, brightness: -15 },
    vintage: { r: 1.1, g: 1.0, b: 0.85, brightness: 10 },
    horror: { r: 0.85, g: 0.95, b: 1.0, brightness: -20 },
    neon: { r: 1.0, g: 0.9, b: 1.15, brightness: 10 },
  };
  const g = grades[grade] || grades.cinematic;
  const imgData = ctx.getImageData(0, 0, w, h);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    d[i] = Math.min(255, Math.max(0, d[i] * g.r + g.brightness));
    d[i+1] = Math.min(255, Math.max(0, d[i+1] * g.g + g.brightness));
    d[i+2] = Math.min(255, Math.max(0, d[i+2] * g.b + g.brightness));
  }
  ctx.putImageData(imgData, 0, 0);
}

export function drawParticles(ctx, w, h, count = 30, frameNum = 0, color = 'rgba(212,175,55,0.3)') {
  for (let i = 0; i < count; i++) {
    const seed = i * 137.508;
    const x = ((seed + frameNum * 0.3) % w);
    const y = ((seed * 2.1 + frameNum * 0.5) % h);
    const r = 1 + (i % 3);
    const alpha = 0.1 + 0.2 * Math.sin(frameNum * 0.05 + i);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color.replace(/[\d.]+\)$/, alpha + ')');
    ctx.fill();
  }
}

export function drawLightLeak(ctx, w, h, frameNum = 0, intensity = 0.08) {
  const x = w * (0.3 + 0.4 * Math.sin(frameNum * 0.02));
  const y = h * (0.2 + 0.3 * Math.cos(frameNum * 0.015));
  const r = w * 0.4;
  const grd = ctx.createRadialGradient(x, y, 0, x, y, r);
  const hue = (frameNum * 2) % 360;
  grd.addColorStop(0, `hsla(${hue}, 60%, 60%, ${intensity})`);
  grd.addColorStop(0.5, `hsla(${hue + 30}, 50%, 50%, ${intensity * 0.3})`);
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, w, h);
}

export function drawLetterbox(ctx, w, h, ratio = 0.12) {
  const barH = h * ratio;
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, w, barH);
  ctx.fillRect(0, h - barH, w, barH);
}

export function drawProgressBar(ctx, w, h, progress, color = '#d4af37') {
  const barH = 4;
  const barY = h - barH - 2;
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.fillRect(0, barY, w, barH);
  ctx.fillStyle = color;
  ctx.fillRect(0, barY, w * progress, barH);
}

export function applyEffectChain(ctx, w, h, effects = [], frameNum = 0) {
  for (const effect of effects) {
    switch (effect) {
      case 'grain': applyFilmGrain(ctx, w, h); break;
      case 'vignette': applyVignette(ctx, w, h); break;
      case 'scanlines': applyScanlines(ctx, w, h); break;
      case 'cinematic': applyColorGrade(ctx, w, h, 'cinematic'); break;
      case 'warm': applyColorGrade(ctx, w, h, 'warm'); break;
      case 'cold': applyColorGrade(ctx, w, h, 'cold'); break;
      case 'noir': applyColorGrade(ctx, w, h, 'noir'); break;
      case 'horror': applyColorGrade(ctx, w, h, 'horror'); break;
      case 'particles': drawParticles(ctx, w, h, 30, frameNum); break;
      case 'lightleak': drawLightLeak(ctx, w, h, frameNum); break;
      case 'letterbox': drawLetterbox(ctx, w, h); break;
    }
  }
}

export const EFFECT_PRESETS = {
  storytelling: ['vignette', 'grain', 'particles'],
  documentary: ['letterbox', 'vignette', 'cinematic'],
  horror: ['vignette', 'grain', 'scanlines', 'horror'],
  noir: ['letterbox', 'vignette', 'noir', 'grain'],
  modern: ['vignette', 'lightleak', 'warm'],
  vintage: ['grain', 'scanlines', 'warm', 'vignette'],
  neon: ['vignette', 'lightleak', 'particles'],
  clean: ['vignette'],
};
