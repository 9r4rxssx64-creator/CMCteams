/**
 * Photo-to-Video Engine — Transforme une photo en vidéo avec effets IA
 * Utilise Pollinations.ai (gratuit, illimité) pour les transformations
 *
 * Modes :
 * - avatar : transforme en avatar stylisé
 * - cartoon : version dessin animé
 * - scene : met en scène (ex: "escalade la tour Eiffel")
 * - anime : style anime japonais
 * - painting : peinture artistique
 * - cinematic : effet film cinéma
 */
import fs from 'fs';
import path from 'path';

const STYLES = {
  avatar: {
    name: 'Avatar',
    prompt: 'professional avatar portrait, clean background, high quality, digital art style',
    icon: '👤',
  },
  cartoon: {
    name: 'Dessin animé',
    prompt: 'cartoon style, vibrant colors, animated look, Disney Pixar quality',
    icon: '🎨',
  },
  anime: {
    name: 'Anime',
    prompt: 'anime style, Japanese animation, detailed, Studio Ghibli quality',
    icon: '🇯🇵',
  },
  painting: {
    name: 'Peinture',
    prompt: 'oil painting style, artistic, museum quality, dramatic lighting',
    icon: '🖼️',
  },
  cinematic: {
    name: 'Cinéma',
    prompt: 'cinematic shot, dramatic lighting, movie scene, 4K quality',
    icon: '🎬',
  },
  scene: {
    name: 'Mise en scène',
    prompt: '', // Dynamic — user provides the scene description
    icon: '🌍',
  },
  superhero: {
    name: 'Super-héros',
    prompt: 'superhero style, epic pose, cape flowing, dramatic sky, Marvel quality',
    icon: '🦸',
  },
  vintage: {
    name: 'Vintage',
    prompt: 'vintage photo style, sepia tones, 1950s aesthetic, film grain',
    icon: '📷',
  },
};

const POLLINATIONS_URL = 'https://image.pollinations.ai/prompt/';

export function listStyles() {
  return Object.entries(STYLES).map(([id, s]) => ({
    id,
    name: s.name,
    icon: s.icon,
    description: s.prompt || 'Description personnalisée',
  }));
}

export async function transformPhoto(imageDescription, opts = {}) {
  const style = opts.style || 'cinematic';
  const sceneDesc = opts.scene || '';
  const width = opts.width || 1920;
  const height = opts.height || 1080;
  const seed = opts.seed || Math.floor(Math.random() * 999999);

  const styleConfig = STYLES[style] || STYLES.cinematic;
  let prompt;

  if (style === 'scene' && sceneDesc) {
    prompt = `${imageDescription}, ${sceneDesc}, photorealistic, high quality, 8K`;
  } else {
    prompt = `${imageDescription}, ${styleConfig.prompt}`;
  }

  const encoded = encodeURIComponent(prompt);
  const url = `${POLLINATIONS_URL}${encoded}?width=${width}&height=${height}&seed=${seed}&nologo=true`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Pollinations ${resp.status}`);
    const buffer = Buffer.from(await resp.arrayBuffer());
    const outPath = opts.outPath || path.join(process.cwd(), 'output', `photo_${style}_${seed}.jpg`);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, buffer);
    return { path: outPath, url, style, width, height, prompt };
  } catch (err) {
    return { error: err.message };
  }
}

export async function generateVariations(description, opts = {}) {
  const styles = opts.styles || ['avatar', 'cartoon', 'anime', 'cinematic', 'painting'];
  const results = [];

  for (const style of styles) {
    const result = await transformPhoto(description, { ...opts, style });
    results.push({ style, ...result });
    if (styles.length > 1) await new Promise(r => setTimeout(r, 1500));
  }

  return results;
}

export async function photoToVideoFrames(description, opts = {}) {
  const style = opts.style || 'cinematic';
  const scene = opts.scene || '';
  const fps = opts.fps || 10;
  const durationSec = opts.duration || 5;
  const width = opts.width || 1920;
  const height = opts.height || 1080;
  const totalFrames = fps * durationSec;

  const outDir = opts.outDir || path.join(process.cwd(), 'output', `photo_video_${Date.now()}`);
  const framesDir = path.join(outDir, 'frames');
  fs.mkdirSync(framesDir, { recursive: true });

  console.log(`Generating ${totalFrames} frames (${style})...`);

  const image = await transformPhoto(description, {
    style,
    scene,
    width,
    height,
    outPath: path.join(outDir, 'base.jpg'),
  });

  if (image.error) return { error: image.error };

  try {
    const { createCanvas, loadImage } = await import('canvas');
    const img = await loadImage(image.path);

    for (let f = 0; f < totalFrames; f++) {
      const progress = f / totalFrames;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      // Ken Burns effect: slow zoom + pan
      const zoom = 1 + progress * 0.15;
      const panX = Math.sin(progress * Math.PI) * width * 0.03;
      const panY = Math.cos(progress * Math.PI * 0.5) * height * 0.02;

      const sw = width / zoom;
      const sh = height / zoom;
      const sx = (width - sw) / 2 + panX;
      const sy = (height - sh) / 2 + panY;

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);

      // Vignette
      const grd = ctx.createRadialGradient(width / 2, height / 2, width * 0.3, width / 2, height / 2, width * 0.7);
      grd.addColorStop(0, 'rgba(0,0,0,0)');
      grd.addColorStop(1, 'rgba(0,0,0,0.4)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, width, height);

      const fname = `frame_${String(f).padStart(6, '0')}.png`;
      fs.writeFileSync(path.join(framesDir, fname), canvas.toBuffer('image/png'));

      if (f % fps === 0) process.stdout.write('.');
    }
    console.log(' OK');

    return { framesDir, totalFrames, fps, basePath: image.path, outDir };
  } catch (err) {
    return { error: `Canvas: ${err.message}. Frames non générées mais image disponible: ${image.path}` };
  }
}

export { STYLES, POLLINATIONS_URL };
