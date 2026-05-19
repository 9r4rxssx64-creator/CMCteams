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
  // --- ARTISTIQUE ---
  avatar: {
    name: 'Avatar',
    prompt: 'professional avatar portrait, clean background, high quality, digital art style',
    icon: '👤', category: 'artistique',
  },
  cartoon: {
    name: 'Dessin animé',
    prompt: 'cartoon style, vibrant colors, animated look, Disney Pixar quality, 3D render',
    icon: '🎨', category: 'artistique',
  },
  anime: {
    name: 'Anime',
    prompt: 'anime style, Japanese animation, detailed, Studio Ghibli quality, cel shading',
    icon: '🇯🇵', category: 'artistique',
  },
  painting: {
    name: 'Peinture à l\'huile',
    prompt: 'oil painting style, artistic, museum quality, dramatic lighting, thick brushstrokes',
    icon: '🖼️', category: 'artistique',
  },
  watercolor: {
    name: 'Aquarelle',
    prompt: 'watercolor painting, soft colors, flowing paint, artistic, delicate, paper texture',
    icon: '💧', category: 'artistique',
  },
  pencil: {
    name: 'Dessin crayon',
    prompt: 'detailed pencil sketch, graphite drawing, realistic shading, paper texture, hand drawn',
    icon: '✏️', category: 'artistique',
  },
  popart: {
    name: 'Pop Art',
    prompt: 'pop art style, Andy Warhol inspired, bold colors, halftone dots, comic book aesthetic',
    icon: '🟡', category: 'artistique',
  },
  graffiti: {
    name: 'Graffiti',
    prompt: 'street art graffiti style, spray paint, urban wall, bold colors, hip hop aesthetic',
    icon: '🎤', category: 'artistique',
  },
  stainedglass: {
    name: 'Vitrail',
    prompt: 'stained glass window style, colorful glass panels, cathedral light, medieval art',
    icon: '⛪', category: 'artistique',
  },
  mosaic: {
    name: 'Mosaïque',
    prompt: 'mosaic tile art, small colorful tiles, Roman style, geometric pattern art',
    icon: '🧩', category: 'artistique',
  },

  // --- CINÉMA ---
  cinematic: {
    name: 'Cinéma',
    prompt: 'cinematic shot, dramatic lighting, movie scene, 4K quality, anamorphic lens',
    icon: '🎬', category: 'cinema',
  },
  noir: {
    name: 'Film noir',
    prompt: 'film noir style, black and white, dramatic shadows, 1940s detective movie, rain',
    icon: '🕵️', category: 'cinema',
  },
  horror: {
    name: 'Horreur',
    prompt: 'horror movie scene, dark atmosphere, fog, creepy lighting, thriller, suspense',
    icon: '👻', category: 'cinema',
  },
  scifi: {
    name: 'Science-fiction',
    prompt: 'science fiction scene, futuristic, neon lights, space, cyberpunk, blade runner style',
    icon: '🚀', category: 'cinema',
  },
  western: {
    name: 'Western',
    prompt: 'wild west scene, dusty desert, sunset, cowboy aesthetic, Sergio Leone style',
    icon: '🤠', category: 'cinema',
  },
  fantasy: {
    name: 'Fantasy',
    prompt: 'high fantasy scene, magical, enchanted forest, dragons, Lord of the Rings style',
    icon: '🧙', category: 'cinema',
  },
  bollywood: {
    name: 'Bollywood',
    prompt: 'Bollywood movie style, vibrant colors, dramatic dance pose, Indian cinema, ornate',
    icon: '💃', category: 'cinema',
  },

  // --- TENDANCES 2026 ---
  cyberpunk: {
    name: 'Cyberpunk',
    prompt: 'cyberpunk style, neon city, rain, holographic ads, futuristic Tokyo, synthwave',
    icon: '🌆', category: 'tendance',
  },
  vaporwave: {
    name: 'Vaporwave',
    prompt: 'vaporwave aesthetic, pink and blue gradients, retro 80s, Greek statues, glitch art',
    icon: '🌸', category: 'tendance',
  },
  lofi: {
    name: 'Lo-fi',
    prompt: 'lo-fi aesthetic, cozy room, warm lighting, study girl style, relaxing, soft colors',
    icon: '☕', category: 'tendance',
  },
  glitchcore: {
    name: 'Glitchcore',
    prompt: 'glitch art, digital distortion, corrupted image, RGB split, matrix code, experimental',
    icon: '📺', category: 'tendance',
  },
  dreamcore: {
    name: 'Dreamcore',
    prompt: 'dreamcore aesthetic, surreal landscape, floating objects, pastel sky, liminal space',
    icon: '💭', category: 'tendance',
  },
  darkacademia: {
    name: 'Dark Academia',
    prompt: 'dark academia aesthetic, old library, leather books, candlelight, Oxford university',
    icon: '📚', category: 'tendance',
  },
  cottagecore: {
    name: 'Cottagecore',
    prompt: 'cottagecore aesthetic, countryside cottage, wildflowers, golden hour, pastoral',
    icon: '🌻', category: 'tendance',
  },
  minimalist: {
    name: 'Minimaliste',
    prompt: 'minimalist design, clean lines, white space, simple geometric shapes, modern',
    icon: '⬜', category: 'tendance',
  },

  // --- EFFETS SPÉCIAUX ---
  superhero: {
    name: 'Super-héros',
    prompt: 'superhero style, epic pose, cape flowing, dramatic sky, Marvel quality, lightning',
    icon: '🦸', category: 'special',
  },
  zombie: {
    name: 'Zombie',
    prompt: 'zombie apocalypse, undead, dark abandoned city, horror, The Walking Dead style',
    icon: '🧟', category: 'special',
  },
  underwater: {
    name: 'Sous-marin',
    prompt: 'underwater scene, deep ocean, blue light, coral reef, bubbles, aquatic, serene',
    icon: '🌊', category: 'special',
  },
  space: {
    name: 'Espace',
    prompt: 'outer space scene, astronaut, stars, nebula, planet Earth, NASA cinematic',
    icon: '🌌', category: 'special',
  },
  miniature: {
    name: 'Miniature',
    prompt: 'tilt shift miniature effect, tiny world, diorama look, toy-like, selective focus',
    icon: '🔬', category: 'special',
  },
  xray: {
    name: 'Rayon X',
    prompt: 'x-ray style, skeletal view, medical scan aesthetic, blue tones, transparent',
    icon: '☠️', category: 'special',
  },
  lego: {
    name: 'LEGO',
    prompt: 'LEGO brick style, everything made of LEGO blocks, colorful plastic, toy world',
    icon: '🧱', category: 'special',
  },
  claymation: {
    name: 'Pâte à modeler',
    prompt: 'claymation style, stop motion, clay figures, Wallace and Gromit quality, handmade',
    icon: '🎭', category: 'special',
  },
  pixelart: {
    name: 'Pixel Art',
    prompt: 'pixel art style, 16-bit retro game, blocky pixels, vibrant palette, Nintendo',
    icon: '👾', category: 'special',
  },
  comic: {
    name: 'Bande dessinée',
    prompt: 'comic book style, bold outlines, speech bubbles, halftone shading, action panels',
    icon: '💥', category: 'special',
  },

  // --- PHOTOS ---
  vintage: {
    name: 'Vintage',
    prompt: 'vintage photo style, sepia tones, 1950s aesthetic, film grain, Kodak film',
    icon: '📷', category: 'photo',
  },
  polaroid: {
    name: 'Polaroid',
    prompt: 'polaroid instant photo, white border, slightly faded colors, nostalgic, candid',
    icon: '🖼️', category: 'photo',
  },
  hdr: {
    name: 'HDR Extrême',
    prompt: 'HDR photography, hyper detailed, extreme dynamic range, vivid colors, sharp',
    icon: '🔆', category: 'photo',
  },
  infrared: {
    name: 'Infrarouge',
    prompt: 'infrared photography, false colors, white foliage, red sky, surreal landscape',
    icon: '🔴', category: 'photo',
  },
  drone: {
    name: 'Vue drone',
    prompt: 'aerial drone shot, birds eye view, top down perspective, landscape, DJI quality',
    icon: '🛸', category: 'photo',
  },
  macro: {
    name: 'Macro',
    prompt: 'macro photography, extreme close-up, shallow depth of field, tiny details, sharp',
    icon: '🔍', category: 'photo',
  },

  // --- MISE EN SCÈNE ---
  scene: {
    name: 'Mise en scène libre',
    prompt: '',
    icon: '🌍', category: 'scene',
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
