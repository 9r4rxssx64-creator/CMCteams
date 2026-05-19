/**
 * AI Video Generation — Génération de vraies vidéos IA
 * Google Veo 3.1 (10 gratuits/mois) + Seedance 2.0 + Pollinations Video
 *
 * Au lieu de frames statiques → vraies scènes vidéo animées par IA
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const PROVIDERS = {
  veo: {
    name: 'Google Veo 3.1',
    free: '10 vidéos/mois',
    quality: '9.5/10',
    maxDuration: 8,
    resolution: '1080p',
    envKey: 'GEMINI_API_KEY',
    model: 'veo-3.1-generate-preview',
  },
  pollinations_video: {
    name: 'Pollinations Video',
    free: 'illimité',
    quality: '7/10',
    baseUrl: 'https://video.pollinations.ai/prompt/',
  },
  seedance: {
    name: 'Seedance 2.0 (ByteDance)',
    free: 'crédits quotidiens via Dreamina',
    quality: '8.5/10',
    maxDuration: 10,
  },
};

export async function generateVideoClipVeo(prompt, opts = {}) {
  const apiKey = opts.apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) return { error: 'GEMINI_API_KEY required for Veo', provider: 'veo' };

  const duration = Math.min(opts.duration || 8, 8);
  const aspect = opts.aspect || '16:9';

  try {
    console.log('Veo 3.1: generating ' + duration + 's video...');
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${PROVIDERS.veo.model}:predictLongRunning?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: {
            sampleCount: 1,
            durationSeconds: duration,
            aspectRatio: aspect,
            personGeneration: 'dont_allow',
          },
        }),
      }
    );

    if (!resp.ok) {
      const err = await resp.text();
      return { error: `Veo API ${resp.status}: ${err.slice(0, 200)}`, provider: 'veo' };
    }

    const data = await resp.json();
    const operationName = data.name;
    if (!operationName) return { error: 'No operation returned', provider: 'veo' };

    console.log('Veo: polling operation ' + operationName);
    let result = null;
    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 5000));
      const poll = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${apiKey}`
      );
      const pollData = await poll.json();
      if (pollData.done) {
        result = pollData;
        break;
      }
      if (i % 6 === 0) process.stdout.write('.');
    }

    if (!result || !result.response) return { error: 'Veo timeout', provider: 'veo' };

    const videoData = result.response?.predictions?.[0]?.bytesBase64Encoded
      || result.response?.generatedSamples?.[0]?.video?.bytesBase64Encoded;

    if (!videoData) return { error: 'No video data in response', provider: 'veo' };

    const outPath = opts.outPath || path.join(process.cwd(), 'output', `veo_${Date.now()}.mp4`);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, Buffer.from(videoData, 'base64'));
    console.log(' Veo OK: ' + outPath);
    return { path: outPath, duration, provider: 'veo', quality: 'HD' };
  } catch (err) {
    return { error: err.message, provider: 'veo' };
  }
}

export async function generateVideoClipPollinations(prompt, opts = {}) {
  const encoded = encodeURIComponent(prompt);
  const url = `${PROVIDERS.pollinations_video.baseUrl}${encoded}`;

  try {
    console.log('Pollinations Video: generating...');
    const outPath = opts.outPath || path.join(process.cwd(), 'output', `poll_vid_${Date.now()}.mp4`);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    execSync(`curl -sL -o "${outPath}" "${url}"`, { timeout: 60000 });
    if (fs.existsSync(outPath) && fs.statSync(outPath).size > 10000) {
      return { path: outPath, provider: 'pollinations_video' };
    }
    return { error: 'Download failed or too small', provider: 'pollinations_video' };
  } catch (err) {
    return { error: err.message, provider: 'pollinations_video' };
  }
}

export async function generateVideoClip(prompt, opts = {}) {
  // Try Veo first (best quality), then Pollinations
  if (process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || opts.apiKey) {
    const veo = await generateVideoClipVeo(prompt, opts);
    if (!veo.error) return veo;
    console.log('Veo failed: ' + veo.error + ', trying Pollinations...');
  }
  return generateVideoClipPollinations(prompt, opts);
}

export function getScenePrompts(niche, title) {
  const base = {
    betrayal: [
      'dark moody room, person looking at phone with shocked expression, dramatic shadows, cinematic 4K',
      'broken glass on floor, dark room, dramatic lighting, emotional scene, cinematic',
      'empty chair at dinner table, one plate untouched, candlelight, dramatic cinematography',
    ],
    revenge: [
      'person walking away from burning building, epic cinematic shot, dramatic sky',
      'courtroom scene, dramatic lighting, judge gavel striking, justice served',
      'chess pieces falling, dramatic slow motion, strategic victory, cinematic',
    ],
    mystery: [
      'foggy dark alley with single streetlight, mysterious figure in distance, noir',
      'old locked door with light coming through keyhole, suspense, cinematic',
      'detective examining evidence under lamp, noir style, dramatic shadows',
    ],
    finance: [
      'stock market screens crashing red, trader with head in hands, dramatic',
      'pile of money being swept away by wind, dramatic slow motion, cinematic',
      'luxury car keys being handed over, then taken back, dramatic reversal',
    ],
    motivation: [
      'person standing on mountain peak at sunrise, arms raised, epic cinematic',
      'athlete crossing finish line, crowd cheering, dramatic slow motion, triumph',
      'empty road stretching to horizon at golden hour, journey ahead, inspirational',
    ],
    true_crime: [
      'evidence board with photos and red string, detective office, noir cinematic',
      'police car lights flashing in dark night, rain, dramatic atmosphere',
      'fingerprint being examined under UV light, forensic lab, suspense cinematic',
    ],
    psychology: [
      'human brain illustration with glowing neural pathways, scientific cinematic',
      'mirror reflection showing different expression than person, surreal, dramatic',
      'maze aerial view with one path highlighted, puzzle metaphor, cinematic',
    ],
    tech: [
      'holographic screens floating in dark room, futuristic interface, cyberpunk',
      'code scrolling on multiple monitors in dark room, hacker aesthetic, dramatic',
      'robot hand reaching toward human hand, AI future, dramatic lighting',
    ],
  };
  return base[niche] || base.betrayal;
}

export function listProviders() {
  return Object.entries(PROVIDERS).map(([id, p]) => ({
    id, name: p.name, free: p.free, quality: p.quality,
  }));
}

export { PROVIDERS };
