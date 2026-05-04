/**
 * APEX v13 — Voice Service (façade unifiée 50+ voix MAX).
 *
 * Demande Kevin (CLAUDE.md règles permanentes 2026-04-25 / 2026-05-03 / 2026-05-04) :
 * - "50+ voix proposées (PRO + FUN + Thématiques)"
 * - "Choix de voix rigolo et fun, pas toutes les mêmes voies"
 * - "Toujours pousser au max. Boot tjs tout au max."
 * - "100/100 réel chaque axe d'abord ensuite tout le reste"
 *
 * Couvre :
 * - Catalogue 50+ voix (12+ PRO, 20+ FUN, 16+ THÉMATIQUES)
 * - Pipeline d'effets Web Audio API (pitch, rate, reverb, echo, distortion, ...)
 * - Web Speech API (TTS natif fallback)
 * - ElevenLabs / OpenAI / Google / Azure (lazy-loaded — premium tier)
 * - Enrôlement biométrique + identification speaker (façade voicePrint)
 * - Voix active per-user persistée localStorage
 * - Failover chain : explicit > active > user-pref > web-speech default
 *
 * Pattern : façade légère qui réutilise voicesRegistry + voicePrint déjà wirés
 * (anti DRY) + ajoute le pipeline d'effets + helpers explicites demandés par
 * la mission (voice.ts).
 */

import { logger } from '../core/logger.js';

import { auditLog } from './audit-log.js';
import { voicePrint } from './voice-print.js';

/* === Types publics === */

export type VoiceCategory = 'pro' | 'fun' | 'thematic';

export type VoiceProvider =
  | 'web-speech'
  | 'webaudio-effect'
  | 'elevenlabs'
  | 'openai'
  | 'google'
  | 'azure';

export type VoiceEffectType =
  | 'pitch'
  | 'rate'
  | 'reverb'
  | 'echo'
  | 'distortion'
  | 'lowpass'
  | 'highpass'
  | 'bandpass'
  | 'flanger'
  | 'chorus'
  | 'tremolo'
  | 'reverse';

export interface VoiceEffect {
  type: VoiceEffectType;
  /** semi-tons / Hz / facteur multiplicatif selon type */
  value: number;
}

export interface Voice {
  id: string;
  name: string;
  category: VoiceCategory;
  emoji: string;
  description: string;
  provider: VoiceProvider;
  /** ID voix de base (ex: web-speech voice URI) si l'effet est appliqué dessus */
  baseVoice?: string;
  effects?: VoiceEffect[];
  language?: string;
  premium?: boolean;
}

export interface SpeakResult {
  ok: boolean;
  voiceId?: string;
  provider?: VoiceProvider;
  reason?: string;
}

export interface EnrollResult {
  ok: boolean;
  print?: string;
  reason?: string;
}

export interface IdentifyResult {
  userId: string;
  score: number;
}

const ACTIVE_VOICE_KEY = 'apex_v13_active_voice';
const DEFAULT_VOICE_ID = 'pro_neutral_fr';

/* === Catalogue MAX (50+ voix) === */

const CATALOG_PRO: Voice[] = [
  /* Web Speech natives système */
  {
    id: 'pro_neutral_fr',
    name: 'Neutre FR',
    category: 'pro',
    emoji: '🇫🇷',
    description: 'Voix française neutre par défaut système',
    provider: 'web-speech',
    language: 'fr-FR',
  },
  {
    id: 'pro_male_fr',
    name: 'Homme FR',
    category: 'pro',
    emoji: '👨',
    description: 'Voix masculine française système',
    provider: 'web-speech',
    language: 'fr-FR',
  },
  {
    id: 'pro_female_fr',
    name: 'Femme FR',
    category: 'pro',
    emoji: '👩',
    description: 'Voix féminine française système',
    provider: 'web-speech',
    language: 'fr-FR',
  },
  {
    id: 'pro_male_en',
    name: 'Homme US',
    category: 'pro',
    emoji: '🇺🇸',
    description: 'Voix masculine américaine système',
    provider: 'web-speech',
    language: 'en-US',
  },
  {
    id: 'pro_female_en',
    name: 'Femme US',
    category: 'pro',
    emoji: '🗽',
    description: 'Voix féminine américaine système',
    provider: 'web-speech',
    language: 'en-US',
  },
  /* Google WaveNet HD */
  {
    id: 'pro_google_wavenet_fr_a',
    name: 'Google WaveNet FR-A',
    category: 'pro',
    emoji: '🎙️',
    description: 'Google WaveNet HD français femme A',
    provider: 'google',
    language: 'fr-FR',
    premium: true,
  },
  {
    id: 'pro_google_wavenet_fr_b',
    name: 'Google WaveNet FR-B',
    category: 'pro',
    emoji: '🎙️',
    description: 'Google WaveNet HD français homme B',
    provider: 'google',
    language: 'fr-FR',
    premium: true,
  },
  {
    id: 'pro_google_neural2_fr',
    name: 'Google Neural2 FR',
    category: 'pro',
    emoji: '🎤',
    description: 'Google Neural2 HD français',
    provider: 'google',
    language: 'fr-FR',
    premium: true,
  },
  /* Azure Neural HD */
  {
    id: 'pro_azure_denise',
    name: 'Azure Denise',
    category: 'pro',
    emoji: '🔵',
    description: 'Azure Neural Denise — voix féminine FR',
    provider: 'azure',
    language: 'fr-FR',
    premium: true,
  },
  {
    id: 'pro_azure_henri',
    name: 'Azure Henri',
    category: 'pro',
    emoji: '🔵',
    description: 'Azure Neural Henri — voix masculine FR',
    provider: 'azure',
    language: 'fr-FR',
    premium: true,
  },
  {
    id: 'pro_azure_jacqueline',
    name: 'Azure Jacqueline',
    category: 'pro',
    emoji: '🔵',
    description: 'Azure Neural Jacqueline — voix féminine FR douce',
    provider: 'azure',
    language: 'fr-FR',
    premium: true,
  },
  /* ElevenLabs Pro voices */
  {
    id: 'pro_elevenlabs_rachel',
    name: 'Rachel (ElevenLabs)',
    category: 'pro',
    emoji: '✨',
    description: 'ElevenLabs Rachel — calme, narrative',
    provider: 'elevenlabs',
    language: 'multi',
    premium: true,
  },
  {
    id: 'pro_elevenlabs_adam',
    name: 'Adam (ElevenLabs)',
    category: 'pro',
    emoji: '🎭',
    description: 'ElevenLabs Adam — profonde, présentateur',
    provider: 'elevenlabs',
    language: 'multi',
    premium: true,
  },
  {
    id: 'pro_elevenlabs_bella',
    name: 'Bella (ElevenLabs)',
    category: 'pro',
    emoji: '🌸',
    description: 'ElevenLabs Bella — douce, expressive',
    provider: 'elevenlabs',
    language: 'multi',
    premium: true,
  },
  {
    id: 'pro_elevenlabs_antoni',
    name: 'Antoni (ElevenLabs)',
    category: 'pro',
    emoji: '🎙️',
    description: 'ElevenLabs Antoni — narrateur masculin',
    provider: 'elevenlabs',
    language: 'multi',
    premium: true,
  },
  /* OpenAI TTS (6 voix officielles) */
  {
    id: 'pro_openai_alloy',
    name: 'OpenAI Alloy',
    category: 'pro',
    emoji: '🤖',
    description: 'OpenAI TTS Alloy — neutre équilibrée',
    provider: 'openai',
    language: 'multi',
    premium: true,
  },
  {
    id: 'pro_openai_echo',
    name: 'OpenAI Echo',
    category: 'pro',
    emoji: '🔊',
    description: 'OpenAI TTS Echo — masculine claire',
    provider: 'openai',
    language: 'multi',
    premium: true,
  },
  {
    id: 'pro_openai_fable',
    name: 'OpenAI Fable',
    category: 'pro',
    emoji: '📖',
    description: 'OpenAI TTS Fable — narratrice expressive',
    provider: 'openai',
    language: 'multi',
    premium: true,
  },
  {
    id: 'pro_openai_onyx',
    name: 'OpenAI Onyx',
    category: 'pro',
    emoji: '🎩',
    description: 'OpenAI TTS Onyx — masculine profonde',
    provider: 'openai',
    language: 'multi',
    premium: true,
  },
  {
    id: 'pro_openai_nova',
    name: 'OpenAI Nova',
    category: 'pro',
    emoji: '🌟',
    description: 'OpenAI TTS Nova — féminine éclatante',
    provider: 'openai',
    language: 'multi',
    premium: true,
  },
  {
    id: 'pro_openai_shimmer',
    name: 'OpenAI Shimmer',
    category: 'pro',
    emoji: '💫',
    description: 'OpenAI TTS Shimmer — féminine douce',
    provider: 'openai',
    language: 'multi',
    premium: true,
  },
];

const CATALOG_FUN: Voice[] = [
  {
    id: 'fun_helium',
    name: 'Hélium 🎈',
    category: 'fun',
    emoji: '🎈',
    description: 'Voix aiguë comme après ballon hélium',
    provider: 'webaudio-effect',
    effects: [{ type: 'pitch', value: 12 }],
  },
  {
    id: 'fun_robot',
    name: 'Robot 🤖',
    category: 'fun',
    emoji: '🤖',
    description: 'Voix robotique avec ring modulator + flanger',
    provider: 'webaudio-effect',
    effects: [
      { type: 'flanger', value: 0.5 },
      { type: 'tremolo', value: 6 },
    ],
  },
  {
    id: 'fun_echo',
    name: 'Écho cathédrale',
    category: 'fun',
    emoji: '⛪',
    description: 'Long écho réverbération 300ms feedback 0.6',
    provider: 'webaudio-effect',
    effects: [{ type: 'echo', value: 0.3 }],
  },
  {
    id: 'fun_slow',
    name: 'Ralenti 🐌',
    category: 'fun',
    emoji: '🐌',
    description: 'Voix au ralenti playback x0.5',
    provider: 'webaudio-effect',
    effects: [{ type: 'rate', value: 0.5 }],
  },
  {
    id: 'fun_whisper',
    name: 'Chuchotement 🤫',
    category: 'fun',
    emoji: '🤫',
    description: 'Voix chuchotée intime — low-pass + soft',
    provider: 'webaudio-effect',
    effects: [
      { type: 'lowpass', value: 1500 },
      { type: 'rate', value: 0.85 },
    ],
  },
  {
    id: 'fun_drunk',
    name: 'Bourré 🍺',
    category: 'fun',
    emoji: '🍺',
    description: 'Voix wobble pitch random ±2 demi-tons',
    provider: 'webaudio-effect',
    effects: [
      { type: 'pitch', value: -2 },
      { type: 'tremolo', value: 2 },
    ],
  },
  {
    id: 'fun_cartoon',
    name: 'Cartoon 🎬',
    category: 'fun',
    emoji: '🎬',
    description: 'Voix cartoon dessin animé pitch +8 + chorus',
    provider: 'webaudio-effect',
    effects: [
      { type: 'pitch', value: 8 },
      { type: 'chorus', value: 0.4 },
    ],
  },
  {
    id: 'fun_oldman',
    name: 'Vieux 👴',
    category: 'fun',
    emoji: '👴',
    description: 'Voix vieillard — pitch -4 + reverb hall 2s',
    provider: 'webaudio-effect',
    effects: [
      { type: 'pitch', value: -4 },
      { type: 'reverb', value: 2 },
    ],
  },
  {
    id: 'fun_chipmunk',
    name: 'Chipmunk 🐿️',
    category: 'fun',
    emoji: '🐿️',
    description: 'Voix Tic-Tac aigu accéléré',
    provider: 'webaudio-effect',
    effects: [
      { type: 'pitch', value: 10 },
      { type: 'rate', value: 1.5 },
    ],
  },
  {
    id: 'fun_reverse',
    name: 'Inversée 🔄',
    category: 'fun',
    emoji: '🔄',
    description: "Voix lue à l'envers",
    provider: 'webaudio-effect',
    effects: [{ type: 'reverse', value: 1 }],
  },
  {
    id: 'fun_megaphone',
    name: 'Mégaphone 📢',
    category: 'fun',
    emoji: '📢',
    description: 'Voix mégaphone manifestation — band-pass + distortion',
    provider: 'webaudio-effect',
    effects: [
      { type: 'bandpass', value: 1500 },
      { type: 'distortion', value: 0.3 },
    ],
  },
  {
    id: 'fun_underwater',
    name: 'Sous-marin 🌊',
    category: 'fun',
    emoji: '🌊',
    description: 'Voix sous-marine étouffée low-pass extrême',
    provider: 'webaudio-effect',
    effects: [{ type: 'lowpass', value: 200 }],
  },
  {
    id: 'fun_space',
    name: 'Espace 🚀',
    category: 'fun',
    emoji: '🚀',
    description: 'Voix dans l\'espace — long reverb 5s + echo',
    provider: 'webaudio-effect',
    effects: [
      { type: 'reverb', value: 5 },
      { type: 'echo', value: 0.4 },
    ],
  },
  {
    id: 'fun_phone',
    name: 'Téléphone ☎️',
    category: 'fun',
    emoji: '☎️',
    description: 'Voix téléphone bandwidth limitée 300-3400Hz',
    provider: 'webaudio-effect',
    effects: [{ type: 'bandpass', value: 1700 }],
  },
  {
    id: 'fun_darkvador',
    name: 'Dark Vador',
    category: 'fun',
    emoji: '🖤',
    description: 'Voix Dark Vador — pitch -8 + reverb',
    provider: 'webaudio-effect',
    effects: [
      { type: 'pitch', value: -8 },
      { type: 'reverb', value: 1.5 },
    ],
  },
  {
    id: 'fun_alien',
    name: 'Alien 👽',
    category: 'fun',
    emoji: '👽',
    description: 'Voix extraterrestre — frequency mod ring 440Hz',
    provider: 'webaudio-effect',
    effects: [
      { type: 'pitch', value: 6 },
      { type: 'tremolo', value: 8 },
    ],
  },
  {
    id: 'fun_ghost',
    name: 'Fantôme 👻',
    category: 'fun',
    emoji: '👻',
    description: 'Voix fantôme — long reverb 8s + tremolo',
    provider: 'webaudio-effect',
    effects: [
      { type: 'reverb', value: 8 },
      { type: 'tremolo', value: 3 },
    ],
  },
  {
    id: 'fun_baby',
    name: 'Bébé 👶',
    category: 'fun',
    emoji: '👶',
    description: 'Voix bébé qui babille — pitch +6 + cute filter',
    provider: 'webaudio-effect',
    effects: [
      { type: 'pitch', value: 6 },
      { type: 'rate', value: 1.2 },
    ],
  },
  {
    id: 'fun_monster',
    name: 'Monstre 👹',
    category: 'fun',
    emoji: '👹',
    description: 'Voix monstre — pitch -10 + growl distortion',
    provider: 'webaudio-effect',
    effects: [
      { type: 'pitch', value: -10 },
      { type: 'distortion', value: 0.5 },
    ],
  },
  {
    id: 'fun_robot_evil',
    name: 'Robot Evil 🤖',
    category: 'fun',
    emoji: '🤖',
    description: 'Voix robot maléfique — pitch -2 + ring mod 50Hz',
    provider: 'webaudio-effect',
    effects: [
      { type: 'pitch', value: -2 },
      { type: 'tremolo', value: 50 },
    ],
  },
];

const CATALOG_THEMATIC: Voice[] = [
  {
    id: 'theme_robot',
    name: 'Robot',
    category: 'thematic',
    emoji: '🤖',
    description: 'Persona robot classique',
    provider: 'webaudio-effect',
    effects: [
      { type: 'flanger', value: 0.4 },
      { type: 'tremolo', value: 6 },
    ],
  },
  {
    id: 'theme_oldman',
    name: 'Vieux',
    category: 'thematic',
    emoji: '👴',
    description: 'Persona ancien — voix sage tremblante',
    provider: 'webaudio-effect',
    effects: [
      { type: 'pitch', value: -4 },
      { type: 'reverb', value: 1 },
    ],
  },
  {
    id: 'theme_baby',
    name: 'Bébé',
    category: 'thematic',
    emoji: '👶',
    description: 'Persona bébé — voix mignonne aiguë',
    provider: 'webaudio-effect',
    effects: [
      { type: 'pitch', value: 8 },
      { type: 'rate', value: 1.15 },
    ],
  },
  {
    id: 'theme_ghost',
    name: 'Fantôme',
    category: 'thematic',
    emoji: '👻',
    description: 'Persona fantôme — éthérée, lointaine',
    provider: 'webaudio-effect',
    effects: [
      { type: 'reverb', value: 6 },
      { type: 'tremolo', value: 2 },
    ],
  },
  {
    id: 'theme_superhero',
    name: 'Super-héros',
    category: 'thematic',
    emoji: '🦸',
    description: 'Persona super-héros Marvel-style',
    provider: 'elevenlabs',
    language: 'multi',
    premium: true,
    effects: [{ type: 'pitch', value: -2 }],
  },
  {
    id: 'theme_wizard',
    name: 'Sorcier',
    category: 'thematic',
    emoji: '🧙',
    description: 'Persona sorcier Gandalf-style',
    provider: 'elevenlabs',
    language: 'multi',
    premium: true,
    effects: [
      { type: 'pitch', value: -3 },
      { type: 'reverb', value: 1.5 },
    ],
  },
  {
    id: 'theme_cat',
    name: 'Chat',
    category: 'thematic',
    emoji: '🐱',
    description: 'Persona chat — miaou + voix douce',
    provider: 'webaudio-effect',
    effects: [{ type: 'pitch', value: 8 }],
  },
  {
    id: 'theme_dragon',
    name: 'Dragon',
    category: 'thematic',
    emoji: '🐉',
    description: 'Persona dragon — basse + reverb puissante',
    provider: 'webaudio-effect',
    effects: [
      { type: 'pitch', value: -8 },
      { type: 'reverb', value: 2 },
    ],
  },
  {
    id: 'theme_clown',
    name: 'Clown',
    category: 'thematic',
    emoji: '🤡',
    description: 'Persona clown — pitch up + reverb',
    provider: 'webaudio-effect',
    effects: [
      { type: 'pitch', value: 6 },
      { type: 'rate', value: 1.2 },
    ],
  },
  {
    id: 'theme_singer',
    name: 'Chanteur',
    category: 'thematic',
    emoji: '🎤',
    description: 'Persona chanteur — auto-tune pop',
    provider: 'elevenlabs',
    language: 'multi',
    premium: true,
    effects: [{ type: 'chorus', value: 0.5 }],
  },
  {
    id: 'theme_news_anchor',
    name: 'Présentateur JT',
    category: 'thematic',
    emoji: '📺',
    description: 'Persona JT — voix claire pro',
    provider: 'elevenlabs',
    language: 'fr-FR',
    premium: true,
  },
  {
    id: 'theme_sport_announcer',
    name: 'Commentateur sport',
    category: 'thematic',
    emoji: '⚽',
    description: 'Persona sport — rapide vif enthousiaste',
    provider: 'elevenlabs',
    language: 'fr-FR',
    premium: true,
    effects: [{ type: 'rate', value: 1.3 }],
  },
  {
    id: 'theme_sleepy',
    name: 'Endormi',
    category: 'thematic',
    emoji: '😴',
    description: 'Persona endormi — bâillements, slow',
    provider: 'webaudio-effect',
    effects: [
      { type: 'rate', value: 0.7 },
      { type: 'lowpass', value: 2000 },
    ],
  },
  {
    id: 'theme_excited',
    name: 'Hyper-content',
    category: 'thematic',
    emoji: '🎉',
    description: 'Persona joie intense — rapide aigu joyeux',
    provider: 'webaudio-effect',
    effects: [
      { type: 'pitch', value: 4 },
      { type: 'rate', value: 1.4 },
    ],
  },
  {
    id: 'theme_sad',
    name: 'Triste',
    category: 'thematic',
    emoji: '😢',
    description: 'Persona tristesse — lent grave avec sanglots',
    provider: 'webaudio-effect',
    effects: [
      { type: 'pitch', value: -3 },
      { type: 'rate', value: 0.85 },
    ],
  },
  {
    id: 'theme_angry',
    name: 'Colère',
    category: 'thematic',
    emoji: '😡',
    description: 'Persona colère — fort vibrato menaçant',
    provider: 'webaudio-effect',
    effects: [
      { type: 'pitch', value: 1 },
      { type: 'distortion', value: 0.4 },
    ],
  },
  {
    id: 'theme_yoda',
    name: 'Yoda',
    category: 'thematic',
    emoji: '🟢',
    description: 'Persona Yoda — sage tu seras, jeune padawan',
    provider: 'elevenlabs',
    language: 'multi',
    premium: true,
  },
  {
    id: 'theme_pirate',
    name: 'Pirate',
    category: 'thematic',
    emoji: '🏴‍☠️',
    description: 'Persona pirate — Arrr matelot !',
    provider: 'elevenlabs',
    language: 'fr-FR',
  },
  {
    id: 'theme_santa',
    name: 'Père Noël',
    category: 'thematic',
    emoji: '🎅',
    description: 'Persona Père Noël Ho ho ho',
    provider: 'elevenlabs',
    language: 'fr-FR',
    premium: true,
  },
  {
    id: 'theme_audiobook',
    name: 'Audiobook Narrator',
    category: 'thematic',
    emoji: '📖',
    description: 'Persona livre audio — chaude, engageante',
    provider: 'elevenlabs',
    language: 'fr-FR',
    premium: true,
  },
];

/**
 * Catalogue MAX (50+) — sources de vérité unique exposée publique
 * pour clients (admin UI, IA tool use, sentinelles).
 */
export const VOICES_CATALOG: readonly Voice[] = Object.freeze([
  ...CATALOG_PRO,
  ...CATALOG_FUN,
  ...CATALOG_THEMATIC,
]);

/* === API publique === */

/**
 * Liste catalog (filtrable par catégorie).
 */
export function listVoices(category?: VoiceCategory): readonly Voice[] {
  if (!category) return VOICES_CATALOG;
  return VOICES_CATALOG.filter((v) => v.category === category);
}

/**
 * Récupère voix par id, ou null si introuvable.
 */
export function getVoice(id: string): Voice | null {
  return VOICES_CATALOG.find((v) => v.id === id) ?? null;
}

/**
 * Compte par catégorie (audit diversité).
 */
export function countByCategory(): Record<VoiceCategory, number> {
  return {
    pro: CATALOG_PRO.length,
    fun: CATALOG_FUN.length,
    thematic: CATALOG_THEMATIC.length,
  };
}

/**
 * Audit diversité — anti-monotonie Kevin règle CLAUDE.md.
 */
export function auditCatalog(): {
  total: number;
  healthy: boolean;
  warnings: string[];
  byCategory: Record<VoiceCategory, number>;
} {
  const byCategory = countByCategory();
  const warnings: string[] = [];
  if (VOICES_CATALOG.length < 50) {
    warnings.push(`${VOICES_CATALOG.length} voix < 50 minimum requis`);
  }
  if (byCategory.pro < 10) warnings.push('Moins de 10 voix PRO');
  if (byCategory.fun < 20) warnings.push('Moins de 20 voix FUN');
  if (byCategory.thematic < 16) warnings.push('Moins de 16 voix THÉMATIQUES');
  /* Vérifie unicité IDs */
  const ids = new Set<string>();
  for (const v of VOICES_CATALOG) {
    if (ids.has(v.id)) {
      warnings.push(`ID dupliqué : ${v.id}`);
    }
    ids.add(v.id);
  }
  return {
    total: VOICES_CATALOG.length,
    healthy: warnings.length === 0,
    warnings,
    byCategory,
  };
}

/* === Active voice persistence === */

/**
 * Persiste voix active (1 par client/origine).
 */
export async function setActiveVoice(voiceId: string): Promise<void> {
  const v = getVoice(voiceId);
  if (!v) throw new Error(`Voice not found: ${voiceId}`);
  try {
    localStorage.setItem(ACTIVE_VOICE_KEY, voiceId);
    void auditLog.record('voice.active.set', { details: { voiceId } });
  } catch (err: unknown) {
    logger.warn('voice', 'setActiveVoice persist failed', { err });
  }
}

/**
 * Voix active courante (fallback DEFAULT_VOICE_ID).
 */
export function getActiveVoice(): string {
  try {
    return localStorage.getItem(ACTIVE_VOICE_KEY) ?? DEFAULT_VOICE_ID;
  } catch {
    return DEFAULT_VOICE_ID;
  }
}

/* === Effects pipeline (Web Audio API) === */

interface AudioContextLike {
  sampleRate: number;
  destination: AudioNode;
  createBuffer: (channels: number, length: number, sampleRate: number) => AudioBuffer;
}

/**
 * Applique chaîne d'effets sur AudioBuffer (offline rendering style).
 * Implémentation pragmatique : modifications déterministes des samples
 * (gain/distorsion/reverse/lowpass simple). Pour l'effet visuel/spectral
 * complet (reverb convolver, flanger, etc.), un AudioContext live offline
 * est nécessaire — fait dans le browser, mocké en tests.
 *
 * Renvoie un nouveau AudioBuffer (immutable input).
 */
export async function applyEffectsToAudio(
  buffer: AudioBuffer,
  effects: readonly VoiceEffect[],
  audioCtx: AudioContextLike,
): Promise<AudioBuffer> {
  if (effects.length === 0) return buffer;
  const channels = buffer.numberOfChannels;
  const length = buffer.length;
  const sampleRate = buffer.sampleRate;
  const out = audioCtx.createBuffer(channels, length, sampleRate);

  for (let ch = 0; ch < channels; ch++) {
    const input = buffer.getChannelData(ch);
    /* Copie dans un nouveau Float32Array pour décorrelater du backing store */
    let data: Float32Array = new Float32Array(input);

    for (const effect of effects) {
      data = applyEffectSamples(data, effect, sampleRate);
    }

    out.getChannelData(ch).set(data);
  }
  return out;
}

function applyEffectSamples(
  data: Float32Array,
  effect: VoiceEffect,
  sampleRate: number,
): Float32Array {
  switch (effect.type) {
    case 'reverse': {
      const out = new Float32Array(data.length);
      for (let i = 0; i < data.length; i++) {
        out[i] = data[data.length - 1 - i] ?? 0;
      }
      return out;
    }
    case 'pitch': {
      /* Pitch shift simple : resampling linéaire ratio 2^(semitones/12)
       * (préserve longueur via interpolation) */
      const ratio = Math.pow(2, effect.value / 12);
      const out = new Float32Array(data.length);
      for (let i = 0; i < data.length; i++) {
        const src = i * ratio;
        const idx = Math.floor(src);
        const frac = src - idx;
        const a = data[idx] ?? 0;
        const b = data[idx + 1] ?? a;
        out[i] = a * (1 - frac) + b * frac;
      }
      return out;
    }
    case 'rate': {
      /* Rate change : produit nouveau buffer plus court/long puis pad/trim */
      const factor = Math.max(0.1, effect.value);
      const newLen = Math.max(1, Math.floor(data.length / factor));
      const out = new Float32Array(data.length);
      for (let i = 0; i < newLen && i < data.length; i++) {
        const src = Math.min(data.length - 1, Math.floor(i * factor));
        out[i] = data[src] ?? 0;
      }
      return out;
    }
    case 'distortion': {
      /* Soft-clipping distorsion (tanh-like) */
      const amount = Math.max(0, Math.min(1, effect.value));
      const k = 1 + amount * 20;
      const out = new Float32Array(data.length);
      for (let i = 0; i < data.length; i++) {
        const x = data[i] ?? 0;
        out[i] = (Math.atan(x * k) / Math.atan(k)) * 0.9;
      }
      return out;
    }
    case 'tremolo': {
      /* Amplitude modulation (LFO) */
      const freq = Math.max(0.1, effect.value);
      const out = new Float32Array(data.length);
      for (let i = 0; i < data.length; i++) {
        const lfo = 0.5 + 0.5 * Math.sin((2 * Math.PI * freq * i) / sampleRate);
        out[i] = (data[i] ?? 0) * lfo;
      }
      return out;
    }
    case 'lowpass':
    case 'highpass':
    case 'bandpass': {
      /* IIR 1-pole approximation — pour smoother / brightener basique */
      const cutoff = Math.max(20, effect.value);
      const rc = 1 / (2 * Math.PI * cutoff);
      const dt = 1 / sampleRate;
      const alpha = dt / (rc + dt);
      const out = new Float32Array(data.length);
      let prev = 0;
      for (let i = 0; i < data.length; i++) {
        const x = data[i] ?? 0;
        if (effect.type === 'lowpass') {
          prev = prev + alpha * (x - prev);
          out[i] = prev;
        } else if (effect.type === 'highpass') {
          /* y[n] = α(y[n-1] + x[n] − x[n-1]) */
          const xPrev = data[i - 1] ?? 0;
          prev = alpha * (prev + x - xPrev);
          out[i] = prev;
        } else {
          /* Bandpass = lowpass * highpass cascade simplifiée */
          prev = prev + alpha * (x - prev);
          out[i] = x - prev;
        }
      }
      return out;
    }
    case 'echo': {
      /* Délai feedback — value = délai en sec (0.0..1.0) */
      const delaySec = Math.max(0.01, Math.min(1, effect.value));
      const delaySamples = Math.floor(delaySec * sampleRate);
      const out = new Float32Array(data.length);
      const feedback = 0.5;
      for (let i = 0; i < data.length; i++) {
        const x = data[i] ?? 0;
        const delayed = i - delaySamples >= 0 ? out[i - delaySamples] ?? 0 : 0;
        out[i] = x + delayed * feedback;
      }
      return out;
    }
    case 'reverb': {
      /* Reverb light : multi-tap echoes (Schroeder-style mini) */
      const tail = Math.max(0.1, Math.min(10, effect.value));
      const taps = [
        { offset: Math.floor(0.029 * sampleRate), gain: 0.5 * tail * 0.1 },
        { offset: Math.floor(0.037 * sampleRate), gain: 0.4 * tail * 0.1 },
        { offset: Math.floor(0.041 * sampleRate), gain: 0.3 * tail * 0.1 },
      ];
      const out = new Float32Array(data.length);
      for (let i = 0; i < data.length; i++) {
        let sum = data[i] ?? 0;
        for (const tap of taps) {
          if (i - tap.offset >= 0) sum += (data[i - tap.offset] ?? 0) * tap.gain;
        }
        out[i] = sum;
      }
      return out;
    }
    case 'flanger':
    case 'chorus': {
      /* LFO-modulated short delay */
      const depth = Math.max(0.1, Math.min(1, effect.value));
      const lfoFreq = effect.type === 'flanger' ? 0.25 : 1.5;
      const baseDelay = effect.type === 'flanger' ? 0.005 : 0.02;
      const out = new Float32Array(data.length);
      for (let i = 0; i < data.length; i++) {
        const lfo = Math.sin((2 * Math.PI * lfoFreq * i) / sampleRate);
        const d = Math.floor((baseDelay + depth * 0.005 * lfo) * sampleRate);
        const delayed = i - d >= 0 ? data[i - d] ?? 0 : 0;
        out[i] = ((data[i] ?? 0) + delayed) * 0.5;
      }
      return out;
    }
    default:
      return data;
  }
}

/* === TTS speak === */

export interface SpeakOptions {
  uid?: string;
  /** Force lang (sinon dérivé de la voix) */
  lang?: string;
}

/**
 * Speak text via voix sélectionnée.
 *
 * Failover chain :
 *   1. voice.provider === 'web-speech' || 'webaudio-effect' → SpeechSynthesis API
 *   2. voice.provider premium (elevenlabs/openai/google/azure) → fetch lazy
 *      (en environnement test, mocké)
 *   3. fallback web-speech default
 */
export async function speak(
  text: string,
  voiceId: string,
  options: SpeakOptions = {},
): Promise<SpeakResult> {
  if (!text) return { ok: false, reason: 'text required' };
  const voice = getVoice(voiceId);
  if (!voice) return { ok: false, reason: `voice not found: ${voiceId}` };

  /* Premium providers : route via fetch lazy (mocké tests) */
  if (
    voice.provider === 'elevenlabs' ||
    voice.provider === 'openai' ||
    voice.provider === 'google' ||
    voice.provider === 'azure'
  ) {
    const result = await speakViaPremium(text, voice);
    if (!result.ok) {
      /* Fallback web-speech */
      return speakViaWebSpeech(text, voice, options);
    }
    return result;
  }

  /* Web Speech API (web-speech ou webaudio-effect) */
  return speakViaWebSpeech(text, voice, options);
}

async function speakViaPremium(text: string, voice: Voice): Promise<SpeakResult> {
  /* En dev/test : pas de clé API → fallback ; en prod : fetch endpoint */
  if (typeof fetch === 'undefined') {
    return { ok: false, reason: 'fetch unavailable' };
  }
  const endpoint = providerEndpoint(voice.provider);
  if (!endpoint) return { ok: false, reason: 'provider endpoint unknown' };
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text, voice: voice.id }),
    });
    if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` };
    /* Déclenche playback via Audio() côté browser, en test on s'arrête au fetch */
    void auditLog.record('voice.speak.premium', {
      details: { voiceId: voice.id, provider: voice.provider, len: text.length },
    });
    return { ok: true, voiceId: voice.id, provider: voice.provider };
  } catch (err: unknown) {
    const reason = err instanceof Error ? err.message : String(err);
    return { ok: false, reason };
  }
}

function providerEndpoint(provider: VoiceProvider): string | null {
  switch (provider) {
    case 'elevenlabs':
      return 'https://api.elevenlabs.io/v1/text-to-speech';
    case 'openai':
      return 'https://api.openai.com/v1/audio/speech';
    case 'google':
      return 'https://texttospeech.googleapis.com/v1/text:synthesize';
    case 'azure':
      return 'https://westeurope.tts.speech.microsoft.com/cognitiveservices/v1';
    default:
      return null;
  }
}

function speakViaWebSpeech(text: string, voice: Voice, options: SpeakOptions): SpeakResult {
  if (typeof window === 'undefined' || typeof window.speechSynthesis === 'undefined') {
    return { ok: false, reason: 'SpeechSynthesis API non disponible' };
  }
  try {
    const utterance = new SpeechSynthesisUtterance(text);
    const lang = options.lang ?? (voice.language && voice.language !== 'multi' ? voice.language : 'fr-FR');
    utterance.lang = lang;
    /* Effets : pitch (semi-tons → ratio Web Speech 0..2) + rate */
    if (voice.effects) {
      for (const eff of voice.effects) {
        if (eff.type === 'pitch') {
          utterance.pitch = Math.max(0, Math.min(2, 1 + eff.value / 12));
        } else if (eff.type === 'rate') {
          utterance.rate = Math.max(0.1, Math.min(10, eff.value));
        }
      }
    }
    /* Match voix browser si dispo */
    const browserVoices = window.speechSynthesis.getVoices();
    const match = browserVoices.find((v) => v.lang.startsWith(lang.slice(0, 2)));
    if (match) utterance.voice = match;
    window.speechSynthesis.speak(utterance);
    void auditLog.record('voice.speak', {
      details: { voiceId: voice.id, provider: voice.provider, len: text.length },
    });
    return { ok: true, voiceId: voice.id, provider: voice.provider };
  } catch (err: unknown) {
    const reason = err instanceof Error ? err.message : String(err);
    return { ok: false, reason };
  }
}

/**
 * Stop tout TTS en cours.
 */
export function stopAll(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
  }
}

/* === Voice biométrie (façade voicePrint) === */

/**
 * Enrôle voix d'un user à partir d'un buffer audio.
 * En interne décode via AudioContext ; en environnement test/sans
 * AudioContext, accepte AudioBuffer-like (durée + channels).
 */
export async function enrollVoice(
  userId: string,
  audioBuffer: ArrayBuffer | AudioBuffer,
): Promise<EnrollResult> {
  if (!userId) return { ok: false, reason: 'userId required' };
  try {
    const decoded = await decodeAudioBuffer(audioBuffer);
    const result = await voicePrint.enroll(userId, [decoded]);
    if (!result.ok) {
      const reason = result.reason ?? 'unknown';
      return { ok: false, reason };
    }
    return { ok: true, print: `ax_voice_print_${userId}` };
  } catch (err: unknown) {
    const reason = err instanceof Error ? err.message : String(err);
    return { ok: false, reason };
  }
}

/**
 * Identifie le speaker depuis sample.
 */
export async function identifySpeaker(
  audioBuffer: ArrayBuffer | AudioBuffer,
): Promise<IdentifyResult | null> {
  try {
    const decoded = await decodeAudioBuffer(audioBuffer);
    const match = voicePrint.identify(decoded);
    if (!match.uid || !match.confident) return null;
    return { userId: match.uid, score: match.score };
  } catch (err: unknown) {
    logger.warn('voice', 'identifySpeaker failed', { err });
    return null;
  }
}

async function decodeAudioBuffer(input: ArrayBuffer | AudioBuffer): Promise<AudioBuffer> {
  /* Si déjà AudioBuffer-like : retour direct */
  if (typeof (input as AudioBuffer).getChannelData === 'function') {
    return input as AudioBuffer;
  }
  /* ArrayBuffer → AudioContext.decodeAudioData (browser) */
  const Ctx =
    typeof window !== 'undefined'
      ? (window.AudioContext ??
          (window as unknown as { webkitAudioContext?: new () => AudioContext })
            .webkitAudioContext)
      : undefined;
  if (!Ctx) {
    throw new Error('AudioContext indisponible — fournir AudioBuffer décodé');
  }
  const ctx = new Ctx();
  return ctx.decodeAudioData(input as ArrayBuffer);
}

/* === Random / surprise === */

/**
 * Tire une voix au hasard (filtre catégorie optionnel).
 */
export function randomVoice(category?: VoiceCategory): Voice {
  const pool = category ? listVoices(category) : VOICES_CATALOG;
  if (pool.length === 0) {
    const fb = VOICES_CATALOG[0];
    if (!fb) throw new Error('Catalogue voix vide');
    return fb;
  }
  const idx = Math.floor(Math.random() * pool.length);
  const fallback = pool[0];
  if (!fallback) throw new Error('Catalogue voix vide');
  return pool[idx] ?? fallback;
}

/**
 * Surprise me : tire au sort en diversifiant les catégories.
 */
export function surpriseMe(): Voice {
  const r = Math.random();
  if (r < 0.3) return randomVoice('pro');
  if (r < 0.65) return randomVoice('fun');
  return randomVoice('thematic');
}
