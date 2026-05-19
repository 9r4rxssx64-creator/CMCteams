/**
 * Music Manager — Télécharge et gère la musique de fond gratuite
 * Sources : Pixabay Music API, fichiers locaux
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const MUSIC_DIR = path.join(process.cwd(), 'tools/social/assets/music');

const PIXABAY_TRACKS = {
  cinematic_dark: 'https://cdn.pixabay.com/audio/2024/11/29/audio_d4b72f7f3c.mp3',
  cinematic_epic: 'https://cdn.pixabay.com/audio/2024/09/19/audio_84e32a9d7b.mp3',
  ambient_mystery: 'https://cdn.pixabay.com/audio/2024/10/08/audio_ad5aa4ef65.mp3',
  dark_suspense: 'https://cdn.pixabay.com/audio/2024/08/15/audio_93f3a04c37.mp3',
  motivational: 'https://cdn.pixabay.com/audio/2024/07/23/audio_b60a4dc0fd.mp3',
};

const NICHE_MUSIC = {
  betrayal: ['cinematic_dark', 'dark_suspense'],
  revenge: ['cinematic_dark', 'cinematic_epic'],
  mystery: ['ambient_mystery', 'dark_suspense'],
  finance: ['cinematic_epic', 'motivational'],
  true_crime: ['dark_suspense', 'cinematic_dark'],
  motivation: ['motivational', 'cinematic_epic'],
  psychology: ['ambient_mystery', 'cinematic_dark'],
  tech: ['cinematic_epic', 'ambient_mystery'],
  history: ['cinematic_epic', 'cinematic_dark'],
};

export function ensureMusicDir() {
  fs.mkdirSync(MUSIC_DIR, { recursive: true });
}

export async function downloadTrack(trackId) {
  ensureMusicDir();
  const url = PIXABAY_TRACKS[trackId];
  if (!url) return null;
  const filePath = path.join(MUSIC_DIR, `${trackId}.mp3`);
  if (fs.existsSync(filePath) && fs.statSync(filePath).size > 10000) return filePath;
  try {
    execSync(`curl -sL -o "${filePath}" "${url}"`, { timeout: 30000 });
    if (fs.existsSync(filePath) && fs.statSync(filePath).size > 10000) return filePath;
  } catch {}
  return null;
}

export async function getMusicForNiche(niche) {
  const tracks = NICHE_MUSIC[niche] || NICHE_MUSIC.betrayal;
  for (const trackId of tracks) {
    const filePath = await downloadTrack(trackId);
    if (filePath) return filePath;
  }
  return null;
}

export function listAvailableTracks() {
  return Object.entries(PIXABAY_TRACKS).map(([id, url]) => ({
    id,
    url,
    niches: Object.entries(NICHE_MUSIC).filter(([, tracks]) => tracks.includes(id)).map(([n]) => n),
  }));
}

export function getLocalMusic() {
  ensureMusicDir();
  return fs.readdirSync(MUSIC_DIR).filter(f => /\.(mp3|m4a|wav)$/i.test(f)).map(f => path.join(MUSIC_DIR, f));
}

export { MUSIC_DIR, PIXABAY_TRACKS, NICHE_MUSIC };
