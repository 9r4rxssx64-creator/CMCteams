/**
 * AI Providers Hub — Connexion aux meilleurs outils gratuits 2026
 * Centralise tous les appels API IA (images, vidéo, musique, TTS)
 */
import fs from 'fs';
import { execSync } from 'child_process';

export const PROVIDERS = {
  // === IMAGES IA ===
  pollinations: {
    name: 'Pollinations.ai',
    type: 'image',
    free: true,
    noSignup: true,
    generate: async (prompt, opts = {}) => {
      const w = opts.width || 1920;
      const h = opts.height || 1080;
      const seed = opts.seed || Math.floor(Math.random() * 999999);
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${w}&height=${h}&seed=${seed}&nologo=true`;
      const outPath = opts.outPath || `/tmp/pollinations_${seed}.jpg`;
      try {
        execSync(`curl -sL -o "${outPath}" "${url}"`, { timeout: 45000 });
        if (fs.existsSync(outPath) && fs.statSync(outPath).size > 5000) return { path: outPath, url, provider: 'pollinations' };
      } catch {}
      return { error: 'Pollinations failed', provider: 'pollinations' };
    },
  },

  puter: {
    name: 'Puter.js (FLUX)',
    type: 'image',
    free: true,
    noSignup: true,
    note: 'Needs browser or Puter SDK — best for app, not CI',
  },

  // === TTS IA ===
  edgeTTS: {
    name: 'Edge TTS (Microsoft Neural)',
    type: 'tts',
    free: true,
    voices: 300,
    generate: async (text, outPath, opts = {}) => {
      try {
        const { MsEdgeTTS } = await import('msedge-tts');
        const tts = new MsEdgeTTS();
        const voice = opts.voice || 'en-US-GuyNeural';
        await tts.setMetadata(voice, 'audio-24khz-96kbitrate-mono-mp3');
        await tts.toFile(outPath, text);
        if (fs.existsSync(outPath) && fs.statSync(outPath).size > 100) {
          return { path: outPath, provider: 'edge-tts', voice };
        }
      } catch {}
      return { error: 'Edge TTS failed', provider: 'edge-tts' };
    },
  },

  espeak: {
    name: 'espeak-ng (offline)',
    type: 'tts',
    free: true,
    offline: true,
    generate: (text, outPath, opts = {}) => {
      const safe = text.replace(/[\\"]/g, '').slice(0, 3000);
      const wavPath = outPath.replace(/\.mp3$/, '.wav');
      try {
        execSync(`espeak-ng -v en -s 155 -p 35 -w "${wavPath}" "${safe}"`, { timeout: 30000 });
        execSync(`ffmpeg -y -i "${wavPath}" -codec:a libmp3lame -b:a 128k "${outPath}"`, { stdio: 'pipe', timeout: 15000 });
        try { fs.unlinkSync(wavPath); } catch {}
        if (fs.existsSync(outPath)) return { path: outPath, provider: 'espeak' };
      } catch {}
      return { error: 'espeak failed', provider: 'espeak' };
    },
  },

  // === SCRIPTS IA ===
  gemini: {
    name: 'Google Gemini Flash',
    type: 'llm',
    free: true,
    limit: '60 req/min',
    envKey: 'GEMINI_API_KEY',
  },

  openrouter: {
    name: 'OpenRouter (30+ modèles)',
    type: 'llm',
    free: true,
    limit: '20 req/min per model',
    url: 'https://openrouter.ai/api/v1/chat/completions',
  },

  cerebras: {
    name: 'Cerebras',
    type: 'llm',
    free: true,
    limit: '1M tokens/jour',
  },
};

export async function generateImage(prompt, opts = {}) {
  return PROVIDERS.pollinations.generate(prompt, opts);
}

export async function generateSpeech(text, outPath, opts = {}) {
  // Try Edge TTS first (better quality), fallback to espeak
  const edge = await PROVIDERS.edgeTTS.generate(text, outPath, opts);
  if (!edge.error) return edge;
  console.log('Edge TTS unavailable, using espeak');
  return PROVIDERS.espeak.generate(text, outPath, opts);
}

export function listProviders(type = null) {
  return Object.entries(PROVIDERS)
    .filter(([, p]) => !type || p.type === type)
    .map(([id, p]) => ({ id, name: p.name, type: p.type, free: p.free }));
}
