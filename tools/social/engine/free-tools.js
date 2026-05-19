/**
 * Free Tools Hub — Intégration outils gratuits (0€)
 * Remplace les outils payants à 333€/mois
 *
 * Pollinations.ai — Images IA illimitées (remplace Midjourney 30€)
 * Pixabay — Musique royalty-free (remplace Epidemic Sound)
 * Canva liens — Thumbnails (remplace Canva Pro 12€)
 * OpenRouter — Scripts IA (remplace/complète Gemini)
 * TubeBuddy/vidIQ — SEO YouTube free tier
 */

const TOOLS = {
  pollinations: {
    name: 'Pollinations.ai',
    type: 'image',
    free: true,
    description: 'Images IA illimitées, sans inscription',
    replaces: 'Midjourney ($30/mois)',
    baseUrl: 'https://image.pollinations.ai/prompt/',
  },
  pixabay: {
    name: 'Pixabay Music',
    type: 'music',
    free: true,
    description: '30 000+ tracks CC0, commercial OK',
    replaces: 'Epidemic Sound ($15/mois)',
    searchUrl: 'https://pixabay.com/music/search/',
    apiUrl: 'https://pixabay.com/api/',
  },
  suno: {
    name: 'Suno Free',
    type: 'music-ai',
    free: true,
    limit: '50 crédits/jour',
    description: 'Musique IA originale',
    replaces: 'Suno Pro ($10/mois)',
    url: 'https://suno.com',
  },
  openrouter: {
    name: 'OpenRouter',
    type: 'llm',
    free: true,
    description: '30+ modèles IA gratuits (DeepSeek, Llama, Qwen)',
    replaces: 'Gemini payant / GPT-4',
    baseUrl: 'https://openrouter.ai/api/v1/chat/completions',
  },
  canva: {
    name: 'Canva Free',
    type: 'design',
    free: true,
    description: 'Thumbnails, visuels, templates',
    replaces: 'Canva Pro ($12/mois)',
    url: 'https://www.canva.com',
  },
  opusclip: {
    name: 'Opus Clip Free',
    type: 'shorts',
    free: true,
    limit: '60 min/mois',
    description: 'Auto-extract clips viraux',
    replaces: 'Opus Clip Pro ($26/mois)',
    url: 'https://www.opus.pro',
  },
  tubebuddy: {
    name: 'TubeBuddy Free',
    type: 'seo',
    free: true,
    description: 'SEO YouTube basique',
    replaces: 'TubeBuddy Legend ($13/mois)',
    url: 'https://www.tubebuddy.com',
  },
  vidiq: {
    name: 'vidIQ Free',
    type: 'seo',
    free: true,
    description: 'Analytics YouTube basique',
    replaces: 'vidIQ Boost ($16/mois)',
    url: 'https://vidiq.com',
  },
  incompetech: {
    name: 'Incompetech',
    type: 'music',
    free: true,
    description: '2000+ tracks Kevin MacLeod (attribution)',
    url: 'https://incompetech.com/music/',
  },
  ytaudio: {
    name: 'YouTube Audio Library',
    type: 'music',
    free: true,
    description: '1000+ tracks CC0',
    url: 'https://www.youtube.com/audiolibrary',
  },
};

export async function generateBackgroundImage(prompt, opts = {}) {
  const width = opts.width || 1920;
  const height = opts.height || 1080;
  const seed = opts.seed || Math.floor(Math.random() * 999999);
  const encoded = encodeURIComponent(prompt);
  const url = `${TOOLS.pollinations.baseUrl}${encoded}?width=${width}&height=${height}&seed=${seed}&nologo=true`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Pollinations ${resp.status}`);
    const buffer = Buffer.from(await resp.arrayBuffer());
    const outPath = opts.outPath || `/tmp/bg_${seed}.jpg`;
    const fs = await import('fs');
    fs.default.writeFileSync(outPath, buffer);
    return { path: outPath, url, width, height, provider: 'pollinations' };
  } catch (err) {
    return { error: err.message, provider: 'pollinations' };
  }
}

export async function generateScriptOpenRouter(topic, opts = {}) {
  const model = opts.model || 'deepseek/deepseek-chat';
  const apiKey = opts.apiKey || process.env.OPENROUTER_API_KEY || '';

  const systemPrompt = `You are a viral storytelling scriptwriter. Write a 200-400 word narration script about: ${topic}.
Rules: Hook in first sentence. Specific names/dates/amounts. Emotional escalation. Twist ending. Conversational tone.
No AI phrases like "It's worth noting". Output ONLY the script, nothing else.`;

  try {
    const resp = await fetch(TOOLS.openrouter.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {}),
        'HTTP-Referer': 'https://github.com/9r4rxssx64-creator/CMCteams',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: systemPrompt }],
        max_tokens: 2000,
        temperature: 0.8,
      }),
    });
    if (!resp.ok) throw new Error(`OpenRouter ${resp.status}`);
    const data = await resp.json();
    const script = data.choices?.[0]?.message?.content || '';
    return { script: script.trim(), model, provider: 'openrouter' };
  } catch (err) {
    return { error: err.message, provider: 'openrouter' };
  }
}

export function getVideoPrompts(niche) {
  const prompts = {
    betrayal: 'dark moody cinematic scene, broken trust, dramatic lighting, noir style',
    finance: 'luxury office with money stacks, gold coins, stock market screens, cinematic',
    mystery: 'foggy dark forest path, mysterious atmosphere, moonlight, cinematic horror',
    true_crime: 'detective desk with evidence, dark room, police files, noir cinematic',
    motivation: 'sunrise over mountain peak, golden light, epic landscape, inspirational',
    psychology: 'brain neural network glowing, dark background, scientific visualization',
    tech: 'futuristic holographic interface, neon blue circuits, cyberpunk style',
    history: 'ancient ruins at sunset, dramatic clouds, historical epic cinematic',
  };
  return prompts[niche] || prompts.betrayal;
}

export function listTools() {
  return Object.values(TOOLS).map(t => ({
    name: t.name,
    type: t.type,
    free: t.free,
    limit: t.limit || 'illimité',
    description: t.description,
    replaces: t.replaces || '-',
    url: t.url || t.baseUrl || t.searchUrl,
  }));
}

export function getTool(id) {
  return TOOLS[id] || null;
}

export { TOOLS };
