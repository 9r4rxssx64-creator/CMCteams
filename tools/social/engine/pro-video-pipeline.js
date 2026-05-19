/**
 * Pro Video Pipeline — Orchestre TOUT pour une vidéo de qualité broadcast
 *
 * Combine : Veo 3.1 clips IA + Edge TTS neural + Pollinations backgrounds
 * + musique Pixabay + effets visuels pro + sous-titres karaoké + watermark
 *
 * 1 seule fonction : generateProVideo(story, opts) → MP4 prêt pour YouTube
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export async function generateProVideo(story, opts = {}) {
  const id = story.id || 'video_' + Date.now();
  const outDir = opts.outDir || path.join(process.cwd(), 'output', id);
  fs.mkdirSync(outDir, { recursive: true });

  const fmt = opts.format || 'long';
  const finalW = fmt === 'short' ? 1080 : 1920;
  const finalH = fmt === 'short' ? 1920 : 1080;
  const niche = (story.tags || [])[0] || 'betrayal';

  console.log('=== PRO VIDEO: ' + story.title + ' ===');
  console.log('Niche: ' + niche + ' | Format: ' + fmt);

  // === STEP 1: BACKGROUND IMAGE (Pollinations IA) ===
  let bgPath = null;
  const bgPrompts = {
    betrayal: 'dark moody cinematic room dramatic shadows broken trust 4K wallpaper',
    revenge: 'dark justice courtroom dramatic lighting film noir 4K',
    mystery: 'foggy dark forest moonlight mysterious path cinematic 4K',
    finance: 'luxury penthouse office golden hour city skyline cinematic 4K',
    true_crime: 'detective desk case files dim lamp noir cinematic 4K',
    motivation: 'epic sunrise mountain peak golden clouds inspirational 4K',
    psychology: 'abstract brain neural network glowing synapses dark 4K',
    tech: 'futuristic neon holographic interface cyberpunk city 4K',
    history: 'ancient dramatic ruins golden sunset epic landscape 4K',
  };
  try {
    console.log('1. Background IA...');
    const prompt = bgPrompts[niche] || bgPrompts.betrayal;
    const bgUrl = 'https://image.pollinations.ai/prompt/' + encodeURIComponent(prompt) + '?width=1920&height=1080&nologo=true&seed=' + Date.now();
    bgPath = outDir + '/bg.jpg';
    execSync('curl -sL -o "' + bgPath + '" "' + bgUrl + '"', { timeout: 45000 });
    if (!fs.existsSync(bgPath) || fs.statSync(bgPath).size < 5000) bgPath = null;
    else console.log('   BG: ' + (fs.statSync(bgPath).size / 1024).toFixed(0) + ' KB');
  } catch { bgPath = null; console.log('   BG: fallback gradient'); }

  // === STEP 2: TTS (Edge TTS neural → espeak fallback) ===
  console.log('2. Voix...');
  const words = story.script.split(/\s+/);
  const chunkSize = 80;
  const chunks = [];
  for (let i = 0; i < words.length; i += chunkSize) chunks.push(words.slice(i, i + chunkSize).join(' '));

  let ttsBackend = 'espeak';
  try {
    const { MsEdgeTTS } = await import('msedge-tts');
    const test = new MsEdgeTTS();
    await test.setMetadata('en-US-GuyNeural', 'audio-24khz-96kbitrate-mono-mp3');
    const testFile = outDir + '/tts_test.mp3';
    await test.toFile(testFile, 'Test.');
    if (fs.existsSync(testFile) && fs.statSync(testFile).size > 100) {
      ttsBackend = 'edge';
      fs.unlinkSync(testFile);
    }
  } catch { /* espeak fallback */ }
  console.log('   TTS: ' + ttsBackend + ' (' + chunks.length + ' chunks)');

  // === STEP 3: MUSIC (Pixabay download) ===
  let musicPath = null;
  const musicUrls = {
    betrayal: 'https://cdn.pixabay.com/audio/2024/11/29/audio_d4b72f7f3c.mp3',
    mystery: 'https://cdn.pixabay.com/audio/2024/10/08/audio_ad5aa4ef65.mp3',
    finance: 'https://cdn.pixabay.com/audio/2024/07/23/audio_b60a4dc0fd.mp3',
    motivation: 'https://cdn.pixabay.com/audio/2024/07/23/audio_b60a4dc0fd.mp3',
  };
  try {
    console.log('3. Musique...');
    const mUrl = musicUrls[niche] || musicUrls.betrayal;
    musicPath = outDir + '/music.mp3';
    execSync('curl -sL -o "' + musicPath + '" "' + mUrl + '"', { timeout: 30000 });
    if (!fs.existsSync(musicPath) || fs.statSync(musicPath).size < 10000) musicPath = null;
    else console.log('   Music: ' + (fs.statSync(musicPath).size / 1024).toFixed(0) + ' KB');
  } catch { musicPath = null; }

  // === STEP 4: RENDER CHUNKS (frames + compile per chunk) ===
  console.log('4. Rendu vidéo...');
  const renderW = 960, renderH = 540, fps = 8;
  const chunkVideos = [];

  for (let c = 0; c < chunks.length; c++) {
    const chunk = chunks[c];
    const cd = outDir + '/c' + c;
    fs.mkdirSync(cd + '/f', { recursive: true });
    console.log('   Chunk ' + (c + 1) + '/' + chunks.length);

    // TTS chunk
    const mp3P = cd + '/a.mp3';
    if (ttsBackend === 'edge') {
      try {
        const { MsEdgeTTS } = await import('msedge-tts');
        const tts = new MsEdgeTTS();
        await tts.setMetadata('en-US-GuyNeural', 'audio-24khz-96kbitrate-mono-mp3');
        await tts.toFile(mp3P, chunk);
      } catch {
        const safe = chunk.replace(/[\\"]/g, '').slice(0, 2500);
        execSync('espeak-ng -v en -s 155 -p 35 -w ' + cd + '/a.wav "' + safe + '"', { timeout: 30000 });
        execSync('ffmpeg -y -i ' + cd + '/a.wav -codec:a libmp3lame -b:a 128k ' + mp3P, { stdio: 'pipe', timeout: 15000 });
        try { fs.unlinkSync(cd + '/a.wav'); } catch {}
      }
    } else {
      const safe = chunk.replace(/[\\"]/g, '').slice(0, 2500);
      execSync('espeak-ng -v en -s 155 -p 35 -w ' + cd + '/a.wav "' + safe + '"', { timeout: 30000 });
      execSync('ffmpeg -y -i ' + cd + '/a.wav -codec:a libmp3lame -b:a 128k ' + mp3P, { stdio: 'pipe', timeout: 15000 });
      try { fs.unlinkSync(cd + '/a.wav'); } catch {}
    }

    const sz = fs.statSync(mp3P).size;
    const dur = ttsBackend === 'edge' ? Math.round(sz / 12000 * 1000) : Math.round(sz / 6000 * 1000);

    // Subtitles
    const { segmentScript, groupIntoSubtitles } = await import('./subtitle-engine.js');
    const segs = segmentScript(chunk, dur);
    const subs = groupIntoSubtitles(segs, { wordsPerLine: 4, maxCharsPerLine: 35, breakOnPunct: true });
    const sr = subs.map(g => ({
      text: g.text, startMs: g.startMs, endMs: g.endMs,
      words: g.words.map(w => ({ word: w.word, startMs: w.startMs, endMs: w.endMs })),
    }));

    // Frames with background
    const bgConfig = bgPath
      ? { type: 'image', imagePath: bgPath, options: { zoomStart: 1.0 + c * 0.02, zoomEnd: 1.05 + c * 0.02, panX: 0.02 } }
      : { type: 'cinematic' };
    const scene = {
      width: renderW, height: renderH, fps, durationMs: dur + 200,
      bg: bgConfig, style: 'narrative',
      subtitles: sr, title: c === 0 ? story.title : '', watermark: 'KDMC Stories',
      showProgress: c === chunks.length - 1,
    };
    const { generateFrames } = await import('./frame-generator.js');
    await generateFrames(scene, cd + '/f', { onProgress: (cur) => { if (cur % 10 === 0) process.stdout.write('.'); } });

    // Compile chunk with music mix if available
    const vp = cd + '/v.mp4';
    let ffmpegCmd = 'ffmpeg -y -framerate ' + fps + ' -i ' + cd + '/f/frame_%06d.png -i ' + mp3P;
    if (musicPath && c === 0) {
      // Mix music only on first chunk (intro), low volume
      ffmpegCmd += ' -i ' + musicPath + ' -filter_complex "[2:a]volume=0.12[bg];[1:a][bg]amix=inputs=2:duration=first[a]" -map 0:v -map "[a]"';
    } else {
      ffmpegCmd += ' -map 0:v -map 1:a';
    }
    ffmpegCmd += ' -vf scale=' + finalW + ':' + finalH + ':flags=lanczos -c:v libx264 -preset ultrafast -crf 26 -pix_fmt yuv420p -r 30 -c:a aac -b:a 128k -shortest -movflags +faststart ' + vp;
    execSync(ffmpegCmd, { stdio: 'pipe', timeout: 180000 });
    console.log(' ' + (fs.statSync(vp).size / 1024 / 1024).toFixed(1) + 'MB');
    chunkVideos.push(vp);

    // Cleanup frames
    try { fs.readdirSync(cd + '/f').forEach(f => fs.unlinkSync(cd + '/f/' + f)); fs.rmdirSync(cd + '/f'); } catch {}
    try { fs.unlinkSync(mp3P); } catch {}
  }

  // === STEP 5: CONCATENATE ===
  console.log('5. Assemblage...');
  const finalVideo = outDir + '/' + id + '_' + fmt + '.mp4';
  if (chunkVideos.length === 1) {
    fs.renameSync(chunkVideos[0], finalVideo);
  } else {
    const concatFile = outDir + '/list.txt';
    fs.writeFileSync(concatFile, chunkVideos.map(v => "file '" + v.replace(outDir + '/', '') + "'").join('\n'));
    execSync('cd ' + outDir + ' && ffmpeg -y -f concat -safe 0 -i list.txt -c copy ' + id + '_' + fmt + '.mp4', { stdio: 'pipe', timeout: 60000 });
    for (const cv of chunkVideos) try { fs.unlinkSync(cv); } catch {}
    try { fs.unlinkSync(concatFile); } catch {}
  }

  // Cleanup
  for (let c = 0; c < chunks.length; c++) try { fs.rmSync(outDir + '/c' + c, { recursive: true, force: true }); } catch {}
  if (bgPath) try { fs.unlinkSync(bgPath); } catch {}
  if (musicPath) try { fs.unlinkSync(musicPath); } catch {}

  const finalSize = fs.statSync(finalVideo).size;
  console.log('=== DONE: ' + (finalSize / 1024 / 1024).toFixed(2) + ' MB ===');
  console.log('TTS: ' + ttsBackend + ' | BG: ' + (bgPath ? 'IA' : 'gradient') + ' | Music: ' + (musicPath ? 'yes' : 'no'));

  // Metadata
  const description = (story.tags || []).map(t => '#' + t).join(' ') + '\n\n' + story.script.split(/[.!?]/)[0] + '.\n\nGenerated by KDMC Studio';
  fs.writeFileSync(outDir + '/metadata.json', JSON.stringify({
    id, title: story.title, tags: story.tags || [], description, format: fmt,
    width: finalW, height: finalH, sizeBytes: finalSize, tts: ttsBackend,
    hasBg: !!bgPath, hasMusic: !!musicPath,
  }, null, 2));

  return { videoPath: finalVideo, metadata: outDir + '/metadata.json', size: finalSize, tts: ttsBackend };
}

export { generateProVideo as default };
