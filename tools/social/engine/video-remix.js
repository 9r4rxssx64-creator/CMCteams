/**
 * Video Remix Engine — Prend un bout de vidéo et le transforme
 *
 * Modes :
 * - slowmo : ralenti cinématique
 * - reverse : lecture à l'envers
 * - loop : boucle parfaite (boomerang)
 * - speed : accéléré (timelapse)
 * - zoom : zoom progressif dramatique
 * - glitch : effet glitch/VHS
 * - noir : noir et blanc cinéma
 * - vignette : vignette dramatique + grain
 * - split : écran splitté (avant/après)
 * - caption : ajoute texte/sous-titres sur la vidéo
 * - music : remplace/ajoute musique de fond
 * - trim : coupe un extrait précis
 * - vertical : convertit 16:9 → 9:16 (TikTok/Shorts)
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const EFFECTS = {
  slowmo: {
    name: 'Ralenti',
    icon: '🐌',
    description: 'Ralenti cinématique x2 ou x4',
    filter: (speed) => `setpts=${1/speed}*PTS`,
    audioFilter: (speed) => `atempo=${speed}`,
  },
  reverse: {
    name: 'Marche arrière',
    icon: '⏪',
    description: 'Lecture inversée',
    filter: () => 'reverse',
    audioFilter: () => 'areverse',
  },
  loop: {
    name: 'Boomerang',
    icon: '🔄',
    description: 'Avant puis arrière en boucle',
  },
  speed: {
    name: 'Accéléré',
    icon: '⚡',
    description: 'Timelapse x2 à x8',
    filter: (speed) => `setpts=${1/speed}*PTS`,
    audioFilter: (speed) => {
      const filters = [];
      let remaining = speed;
      while (remaining > 2) { filters.push('atempo=2.0'); remaining /= 2; }
      if (remaining > 1) filters.push(`atempo=${remaining}`);
      return filters.join(',');
    },
  },
  zoom: {
    name: 'Zoom dramatique',
    icon: '🔍',
    description: 'Zoom progressif vers le centre',
    filter: (factor) => `zoompan=z='min(zoom+0.001,${factor||1.5})':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080:fps=30`,
  },
  glitch: {
    name: 'Glitch',
    icon: '📺',
    description: 'Effet glitch/VHS rétro',
    filter: () => 'noise=alls=20:allf=t+u,eq=contrast=1.3:brightness=0.05,hue=s=0.8',
  },
  noir: {
    name: 'Noir & Blanc',
    icon: '🎬',
    description: 'Cinéma noir et blanc avec grain',
    filter: () => 'hue=s=0,eq=contrast=1.4:brightness=-0.05,noise=alls=8:allf=t',
  },
  vignette: {
    name: 'Vignette cinéma',
    icon: '🎥',
    description: 'Vignette sombre + grain film',
    filter: () => 'vignette=PI/4,noise=alls=5:allf=t',
  },
  vertical: {
    name: 'Vertical (TikTok)',
    icon: '📱',
    description: 'Convertit en 9:16 pour TikTok/Shorts/Reels',
    filter: () => 'crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=1080:1920',
  },
};

function findFfmpeg() {
  try {
    execSync('ffmpeg -version', { stdio: 'pipe' });
    return 'ffmpeg';
  } catch {
    try {
      const mod = JSON.parse(execSync('node -e "console.log(require(\'@ffmpeg-installer/ffmpeg\').path)"', { encoding: 'utf-8' }).trim());
      return mod;
    } catch { return 'ffmpeg'; }
  }
}

export function listEffects() {
  return Object.entries(EFFECTS).map(([id, e]) => ({
    id, name: e.name, icon: e.icon, description: e.description,
  }));
}

export function applyEffect(inputVideo, effect, opts = {}) {
  if (!fs.existsSync(inputVideo)) throw new Error(`Vidéo introuvable: ${inputVideo}`);
  const eff = EFFECTS[effect];
  if (!eff) throw new Error(`Effet inconnu: ${effect}. Disponibles: ${Object.keys(EFFECTS).join(', ')}`);

  const outDir = opts.outDir || path.dirname(inputVideo);
  const ext = path.extname(inputVideo);
  const base = path.basename(inputVideo, ext);
  const outPath = opts.outPath || path.join(outDir, `${base}_${effect}${ext}`);

  const ffmpeg = findFfmpeg();
  let cmd;

  switch (effect) {
    case 'slowmo': {
      const speed = opts.speed || 0.5;
      const vf = eff.filter(speed);
      const af = eff.audioFilter(speed);
      cmd = `${ffmpeg} -y -i "${inputVideo}" -vf "${vf}" -af "${af}" -c:v libx264 -preset fast -crf 23 "${outPath}"`;
      break;
    }
    case 'reverse': {
      cmd = `${ffmpeg} -y -i "${inputVideo}" -vf "${eff.filter()}" -af "${eff.audioFilter()}" -c:v libx264 -preset fast -crf 23 "${outPath}"`;
      break;
    }
    case 'loop': {
      const tmpReverse = path.join(outDir, `${base}_tmp_rev${ext}`);
      execSync(`${ffmpeg} -y -i "${inputVideo}" -vf reverse -af areverse -c:v libx264 -preset ultrafast -crf 23 "${tmpReverse}"`, { stdio: 'pipe', timeout: 120000 });
      const concatFile = path.join(outDir, 'loop_concat.txt');
      fs.writeFileSync(concatFile, `file '${inputVideo}'\nfile '${tmpReverse}'`);
      cmd = `${ffmpeg} -y -f concat -safe 0 -i "${concatFile}" -c copy "${outPath}"`;
      execSync(cmd, { stdio: 'pipe', timeout: 60000 });
      try { fs.unlinkSync(tmpReverse); fs.unlinkSync(concatFile); } catch {}
      return { path: outPath, effect, size: fs.statSync(outPath).size };
    }
    case 'speed': {
      const speed = opts.speed || 2;
      const vf = eff.filter(speed);
      const af = eff.audioFilter(speed);
      cmd = `${ffmpeg} -y -i "${inputVideo}" -vf "${vf}" -af "${af}" -c:v libx264 -preset fast -crf 23 "${outPath}"`;
      break;
    }
    case 'zoom':
    case 'glitch':
    case 'noir':
    case 'vignette':
    case 'vertical': {
      const vf = eff.filter(opts.factor);
      cmd = `${ffmpeg} -y -i "${inputVideo}" -vf "${vf}" -c:v libx264 -preset fast -crf 23 -c:a copy "${outPath}"`;
      break;
    }
    default:
      throw new Error(`Effet ${effect} non implémenté`);
  }

  execSync(cmd, { stdio: 'pipe', timeout: 300000 });

  return {
    path: outPath,
    effect,
    size: fs.statSync(outPath).size,
  };
}

export function trimVideo(inputVideo, startSec, endSec, opts = {}) {
  if (!fs.existsSync(inputVideo)) throw new Error(`Vidéo introuvable: ${inputVideo}`);
  const outDir = opts.outDir || path.dirname(inputVideo);
  const ext = path.extname(inputVideo);
  const base = path.basename(inputVideo, ext);
  const outPath = opts.outPath || path.join(outDir, `${base}_trim_${startSec}-${endSec}${ext}`);
  const ffmpeg = findFfmpeg();
  const duration = endSec - startSec;
  execSync(`${ffmpeg} -y -i "${inputVideo}" -ss ${startSec} -t ${duration} -c:v libx264 -preset fast -crf 23 -c:a aac "${outPath}"`, { stdio: 'pipe', timeout: 120000 });
  return { path: outPath, startSec, endSec, duration, size: fs.statSync(outPath).size };
}

export function addCaption(inputVideo, text, opts = {}) {
  if (!fs.existsSync(inputVideo)) throw new Error(`Vidéo introuvable: ${inputVideo}`);
  const outDir = opts.outDir || path.dirname(inputVideo);
  const ext = path.extname(inputVideo);
  const base = path.basename(inputVideo, ext);
  const outPath = opts.outPath || path.join(outDir, `${base}_caption${ext}`);
  const ffmpeg = findFfmpeg();
  const fontSize = opts.fontSize || 48;
  const color = opts.color || 'white';
  const position = opts.position || 'bottom';
  const y = position === 'top' ? '50' : position === 'center' ? '(h-text_h)/2' : 'h-th-60';
  const safeText = text.replace(/'/g, "\\'").replace(/"/g, '\\"');
  const vf = `drawtext=text='${safeText}':fontsize=${fontSize}:fontcolor=${color}:x=(w-text_w)/2:y=${y}:shadowcolor=black:shadowx=2:shadowy=2`;
  execSync(`${ffmpeg} -y -i "${inputVideo}" -vf "${vf}" -c:v libx264 -preset fast -crf 23 -c:a copy "${outPath}"`, { stdio: 'pipe', timeout: 120000 });
  return { path: outPath, text, size: fs.statSync(outPath).size };
}

export function addMusic(inputVideo, musicPath, opts = {}) {
  if (!fs.existsSync(inputVideo)) throw new Error(`Vidéo introuvable: ${inputVideo}`);
  if (!fs.existsSync(musicPath)) throw new Error(`Musique introuvable: ${musicPath}`);
  const outDir = opts.outDir || path.dirname(inputVideo);
  const ext = path.extname(inputVideo);
  const base = path.basename(inputVideo, ext);
  const outPath = opts.outPath || path.join(outDir, `${base}_music${ext}`);
  const ffmpeg = findFfmpeg();
  const volume = opts.volume || 0.3;
  const mix = opts.keepOriginalAudio !== false;
  if (mix) {
    execSync(`${ffmpeg} -y -i "${inputVideo}" -i "${musicPath}" -filter_complex "[1:a]volume=${volume}[bg];[0:a][bg]amix=inputs=2:duration=first[a]" -map 0:v -map "[a]" -c:v copy -c:a aac "${outPath}"`, { stdio: 'pipe', timeout: 120000 });
  } else {
    execSync(`${ffmpeg} -y -i "${inputVideo}" -i "${musicPath}" -map 0:v -map 1:a -c:v copy -c:a aac -shortest "${outPath}"`, { stdio: 'pipe', timeout: 120000 });
  }
  return { path: outPath, music: musicPath, size: fs.statSync(outPath).size };
}

export function applyMultipleEffects(inputVideo, effects, opts = {}) {
  let current = inputVideo;
  const results = [];
  for (const eff of effects) {
    const effectName = typeof eff === 'string' ? eff : eff.effect;
    const effectOpts = typeof eff === 'string' ? opts : { ...opts, ...eff };
    const result = applyEffect(current, effectName, effectOpts);
    results.push(result);
    current = result.path;
  }
  return { finalPath: current, steps: results };
}

export { EFFECTS };
