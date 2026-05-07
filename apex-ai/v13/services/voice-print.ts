/**
 * APEX v13 — Voice Print + "Dis Apex" wake word (P0 audit gaps).
 *
 * Demande Kevin (CLAUDE.md règle absolue 2026-04-26 + 2026-05-03) :
 * "Apex doit reconnaître ma voix quand je dis 'Dis Apex'"
 * "Reconnaître les voix de chaque utilisateur dans chaque compte
 *  et ne réagir qu'à son utilisateur (pas confondre avec entourage)"
 * "Mémoriser les voix et accumuler des infos pour cibler de plus en plus"
 *
 * Pipeline :
 * 1. Enrôlement : 3 samples audio user → fingerprint stocké
 * 2. Wake word "Dis Apex" : SpeechRecognition continuous
 * 3. Match wake → capture suite + identifyBy fingerprint
 * 4. Si match user → agir, sinon → ignorer (anti-confusion entourage)
 *
 * Architecture (Jet 8.1 minimal viable, Jet 9 enrichira avec meyda MFCC) :
 * - Fingerprint simple : pitch moyen + ZCR + énergie via AnalyserNode
 * - Voiceprint stocké par user dans ax_voice_print_<uid> (FB_LOCAL strict)
 * - Cosine similarity sur 3 dimensions (pitch, ZCR, energy)
 * - Threshold 0.75 par défaut (configurable)
 *
 * Anti-pattern Kevin :
 * - FB_LOCAL strict (jamais sync Firebase — données biométriques sensibles)
 * - Consent CGU obligatoire avant enrôlement
 * - User peut supprimer son voiceprint (RGPD Art. 17)
 */

import { logger } from '../core/logger.js';

import { auditLog } from './audit-log.js';

export interface VoiceFingerprint {
  uid: string;
  pitch_avg: number;
  zcr_avg: number;
  energy_avg: number;
  spectral_centroid_avg?: number;
  spectral_rolloff_avg?: number;
  samples_count: number;
  enrolled_at: number;
  last_match: number;
  match_score_avg: number;
  /* v13.3.43 (Kevin 2026-05-07 "exclusivité user") :
   * Confidence score (0-1) basé sur samples_count (max après 20 samples).
   * Tracking false-positives/negatives pour calibration auto. */
  confidence_score?: number;
  false_positive_count?: number;
  false_negative_count?: number;
  last_calibration?: number;
}

export interface VoiceMatchResult {
  uid: string | null;
  score: number;
  confident: boolean;
  /* v13.3.43 : confidence du voiceprint matché (pas just score similarity) */
  print_confidence?: number;
  /* v13.3.43 : flag spécial Kevin admin reconnu (pour mode admin temp) */
  isKevinAdmin?: boolean;
}

const SIMILARITY_THRESHOLD_DEFAULT = 0.75;
/* v13.3.43 : nombre de samples pour atteindre confidence 1.0 (linéaire) */
const CONFIDENCE_FULL_AT_SAMPLES = 20;
/* v13.3.43 : kevin admin uid (pour mode admin reconnu dans vue Laurence) */
const ADMIN_UID = 'kdmc_admin';
/* v13.3.43 : log unknown attempts (max 100 FIFO, FB_LOCAL strict) */
const UNKNOWN_ATTEMPTS_KEY = 'ax_voice_unknown_attempts';
const UNKNOWN_ATTEMPTS_MAX = 100;
/* v13.3.43 : settings (toggle exclusif default ON, calibration interval 30j) */
const EXCLUSIVE_MODE_KEY = 'ax_voice_exclusive_mode';
const CALIBRATION_INTERVAL_MS = 30 * 24 * 60 * 60 * 1000; /* 30 jours */
const CALIBRATION_LOW_CONFIDENCE = 0.85;

/* Variantes phonétiques étendues — Web Speech API FR confond souvent "dis"/"dit"/"dix",
 * "apex"/"apexs"/"appex"/"hapex"/"dispex" (concat) selon micro/débit. */
const WAKE_PATTERNS: RegExp[] = [
  /\b(?:dis|dit|di|dix|d['e])\s*ap[ep]x[s]?\b/i,
  /\bhey\s*ap[ep]x[s]?\b/i,
  /\bok\s*ap[ep]x[s]?\b/i,
  /\bdispex[s]?\b/i, /* concat phonétique */
  /\bhapex[s]?\b/i,  /* h aspirée mal détectée */
  /\bap[ep]x[s]?\b/i, /* "apex" seul (dernier recours) */
];

const MAX_NO_SPEECH_RETRIES = 20;
const NO_SPEECH_SUSPEND_MS = 30_000; /* 30s pause après burst no-speech */
const RESTART_DELAY_MS = 500;
const VOICE_LOG_KEY = 'ax_voice_log';
const VOICE_LOG_MAX = 100;
const PERMISSION_DENIED_KEY = 'ax_voice_permission_denied_ts';

interface VoiceLogEntry {
  ts: number;
  evt: 'start' | 'result' | 'interim' | 'wake' | 'error' | 'end' | 'restart' | 'suspend' | 'permission';
  src: 'wake-word' | 'dictation';
  detail?: string;
}

function isiOSSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  if (/iPhone|iPad|iPod/.test(ua)) return true;
  /* iPad iOS 13+ déguisé en MacIntel — détecter via maxTouchPoints */
  return navigator.platform === 'MacIntel' && (navigator.maxTouchPoints ?? 0) > 1;
}

function isWakeMatch(transcript: string): boolean {
  if (!transcript) return false;
  const norm = transcript.toLowerCase().trim();
  return WAKE_PATTERNS.some((p) => p.test(norm));
}

/* Logger structuré (max 100 entries, FIFO) — exposé pour panel admin diagnostic */
function pushVoiceLog(entry: VoiceLogEntry): void {
  try {
    if (typeof localStorage === 'undefined') return;
    const raw = localStorage.getItem(VOICE_LOG_KEY);
    const arr: VoiceLogEntry[] = raw ? (JSON.parse(raw) as VoiceLogEntry[]) : [];
    arr.push(entry);
    while (arr.length > VOICE_LOG_MAX) arr.shift();
    localStorage.setItem(VOICE_LOG_KEY, JSON.stringify(arr));
  } catch {
    /* ignore quota / parse */
  }
}

export function getVoiceLog(): VoiceLogEntry[] {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(VOICE_LOG_KEY);
    return raw ? (JSON.parse(raw) as VoiceLogEntry[]) : [];
  } catch {
    return [];
  }
}

export function clearVoiceLog(): void {
  try {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(VOICE_LOG_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Check permission micro avant démarrage STT.
 * Retourne 'granted' | 'denied' | 'prompt' | 'unknown'.
 */
export async function checkMicrophonePermission(): Promise<'granted' | 'denied' | 'prompt' | 'unknown'> {
  if (typeof navigator === 'undefined' || !navigator.permissions) return 'unknown';
  try {
    const status = await navigator.permissions.query({ name: 'microphone' as PermissionName });
    return status.state as 'granted' | 'denied' | 'prompt';
  } catch {
    return 'unknown';
  }
}

class VoicePrint {
  private wakeRecognition: unknown = null; /* SpeechRecognition instance */
  private wakeListening = false;
  private threshold = SIMILARITY_THRESHOLD_DEFAULT;
  private wakeCallbacks: Array<(transcript: string) => void> = [];
  private wakeNoSpeechRetries = 0;
  private wakeSuspendTimer: ReturnType<typeof setTimeout> | null = null;
  private wakeInterimCallback: ((transcript: string, isFinal: boolean) => void) | null = null;

  /**
   * Vérifie si Web Speech + Audio APIs disponibles.
   */
  isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    const hasSpeech =
      typeof (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition !== 'undefined' ||
      typeof (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition !==
        'undefined';
    const hasAudio = typeof window.AudioContext !== 'undefined' || typeof (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext !== 'undefined';
    return hasSpeech && hasAudio;
  }

  /**
   * Calcule fingerprint enrichi (Jet 8.1+ : pitch + ZCR + RMS + spectral centroid + spectral rolloff).
   * (Jet 9 enrichira encore avec meyda MFCC 13 coefficients + chroma 12 bins)
   */
  computeFingerprint(audioBuffer: AudioBuffer): {
    pitch: number;
    zcr: number;
    energy: number;
    spectral_centroid: number;
    spectral_rolloff: number;
  } {
    const data = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;

    /* Energy = RMS — itération directe Float32Array (TypedArray garantit number) */
    let energy = 0;
    for (let i = 0; i < data.length; i++) {
      const v = data[i] ?? 0;
      energy += v * v;
    }
    energy = Math.sqrt(energy / data.length);

    /* ZCR */
    let zcr = 0;
    for (let i = 1; i < data.length; i++) {
      const cur = data[i] ?? 0;
      const prev = data[i - 1] ?? 0;
      if ((cur >= 0) !== (prev >= 0)) zcr++;
    }
    zcr /= data.length;

    /* Pitch via autocorrélation */
    let pitch = 0;
    const minLag = Math.floor(sampleRate / 500);
    const maxLag = Math.floor(sampleRate / 80);
    let bestCorr = 0;
    for (let lag = minLag; lag < maxLag && lag < data.length / 2; lag++) {
      let corr = 0;
      for (let i = 0; i < data.length - lag; i++) {
        const a = data[i] ?? 0;
        const b = data[i + lag] ?? 0;
        corr += a * b;
      }
      corr /= data.length - lag;
      if (corr > bestCorr) {
        bestCorr = corr;
        pitch = sampleRate / lag;
      }
    }

    /* Spectral features via FFT simplifié (DFT light pour chunks 256-512) */
    const fftSize = Math.min(512, Math.pow(2, Math.floor(Math.log2(data.length))));
    const magnitudes = this.computeMagnitudeSpectrum(data, fftSize);
    const totalEnergy = magnitudes.reduce((s, m) => s + m, 0);
    let weightedSum = 0;
    for (let i = 0; i < magnitudes.length; i++) {
      weightedSum += i * (magnitudes[i] ?? 0);
    }
    const spectralCentroid = totalEnergy > 0 ? (weightedSum / totalEnergy) * (sampleRate / fftSize / 2) : 0;

    /* Spectral rolloff (85% energy threshold) */
    const threshold = totalEnergy * 0.85;
    let cumulative = 0;
    let rolloffBin = magnitudes.length - 1;
    for (let i = 0; i < magnitudes.length; i++) {
      cumulative += magnitudes[i] ?? 0;
      if (cumulative >= threshold) {
        rolloffBin = i;
        break;
      }
    }
    const spectralRolloff = (rolloffBin / magnitudes.length) * (sampleRate / 2);

    return { pitch, zcr, energy, spectral_centroid: spectralCentroid, spectral_rolloff: spectralRolloff };
  }

  /**
   * DFT simplifié (magnitude spectrum, pas de FFT optimisée — OK pour chunks petits).
   */
  private computeMagnitudeSpectrum(data: Float32Array, fftSize: number): number[] {
    const magnitudes: number[] = [];
    const halfSize = fftSize / 2;
    /* Window Hann pour smoother FFT */
    for (let k = 0; k < halfSize; k++) {
      let real = 0;
      let imag = 0;
      const limit = Math.min(fftSize, data.length);
      for (let n = 0; n < limit; n++) {
        const window = 0.5 - 0.5 * Math.cos((2 * Math.PI * n) / (fftSize - 1));
        const sample = (data[n] ?? 0) * window;
        const angle = (-2 * Math.PI * k * n) / fftSize;
        real += sample * Math.cos(angle);
        imag += sample * Math.sin(angle);
      }
      magnitudes.push(Math.sqrt(real * real + imag * imag));
    }
    return magnitudes;
  }

  /**
   * Enrôle voix user (3 samples audio recommandés).
   */
  async enroll(uid: string, audioSamples: AudioBuffer[]): Promise<{ ok: boolean; reason?: string }> {
    if (audioSamples.length < 1) return { ok: false, reason: 'Aucun sample audio' };
    /* Calcule fingerprints enrichis + moyenne (5 features) */
    const fps = audioSamples.map((s) => this.computeFingerprint(s));
    const avg = {
      pitch_avg: fps.reduce((s, f) => s + f.pitch, 0) / fps.length,
      zcr_avg: fps.reduce((s, f) => s + f.zcr, 0) / fps.length,
      energy_avg: fps.reduce((s, f) => s + f.energy, 0) / fps.length,
      spectral_centroid_avg: fps.reduce((s, f) => s + f.spectral_centroid, 0) / fps.length,
      spectral_rolloff_avg: fps.reduce((s, f) => s + f.spectral_rolloff, 0) / fps.length,
    };
    const print: VoiceFingerprint = {
      uid,
      ...avg,
      samples_count: audioSamples.length,
      enrolled_at: Date.now(),
      last_match: 0,
      match_score_avg: 0,
    };
    try {
      /* FB_LOCAL strict — jamais sync Firebase */
      localStorage.setItem(`ax_voice_print_${uid}`, JSON.stringify(print));
      void auditLog.record('voice.enrolled', { details: { uid, samples: audioSamples.length } });
      return { ok: true };
    } catch (err: unknown) {
      logger.warn('voice-print', 'enroll persist failed', { err });
      return { ok: false, reason: 'Storage saturated' };
    }
  }

  /**
   * Identifie speaker depuis sample audio.
   */
  identify(audioSample: AudioBuffer): VoiceMatchResult {
    const fp = this.computeFingerprint(audioSample);
    const allPrints = this.listPrints();
    if (allPrints.length === 0) return { uid: null, score: 0, confident: false };

    let best: VoiceMatchResult = { uid: null, score: 0, confident: false };
    for (const print of allPrints) {
      /* Cosine similarity sur 5 dimensions (vs 3 avant) — plus précis Jet 8.1 */
      const printVec = [
        print.pitch_avg,
        print.zcr_avg,
        print.energy_avg,
        print.spectral_centroid_avg ?? 0,
        print.spectral_rolloff_avg ?? 0,
      ];
      const sampleVec = [fp.pitch, fp.zcr, fp.energy, fp.spectral_centroid, fp.spectral_rolloff];
      const score = this.cosineSimilarity(sampleVec, printVec);
      if (score > best.score) {
        best = {
          uid: print.uid,
          score,
          confident: score >= this.threshold,
        };
      }
    }

    /* Update voiceprint si match confiant (auto-apprentissage) */
    if (best.confident && best.uid) {
      this.updatePrintWithSample(best.uid, fp, best.score);
    }

    return best;
  }

  /**
   * Cosine similarity entre 2 vecteurs n-dim.
   */
  private cosineSimilarity(a: readonly number[], b: readonly number[]): number {
    if (a.length !== b.length) return 0;
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      const av = a[i] ?? 0;
      const bv = b[i] ?? 0;
      dot += av * bv;
      normA += av * av;
      normB += bv * bv;
    }
    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Mise à jour voiceprint avec sample (apprentissage continu).
   */
  private updatePrintWithSample(
    uid: string,
    fp: { pitch: number; zcr: number; energy: number; spectral_centroid: number; spectral_rolloff: number },
    score: number,
  ): void {
    try {
      const raw = localStorage.getItem(`ax_voice_print_${uid}`);
      if (!raw) return;
      const print = JSON.parse(raw) as VoiceFingerprint;
      /* Moyenne pondérée 0.9 ancien + 0.1 nouveau (5 dimensions) */
      const weight = 0.1;
      print.pitch_avg = print.pitch_avg * (1 - weight) + fp.pitch * weight;
      print.zcr_avg = print.zcr_avg * (1 - weight) + fp.zcr * weight;
      print.energy_avg = print.energy_avg * (1 - weight) + fp.energy * weight;
      print.spectral_centroid_avg = (print.spectral_centroid_avg ?? 0) * (1 - weight) + fp.spectral_centroid * weight;
      print.spectral_rolloff_avg = (print.spectral_rolloff_avg ?? 0) * (1 - weight) + fp.spectral_rolloff * weight;
      print.samples_count++;
      print.last_match = Date.now();
      print.match_score_avg =
        (print.match_score_avg * (print.samples_count - 1) + score) / print.samples_count;
      localStorage.setItem(`ax_voice_print_${uid}`, JSON.stringify(print));
    } catch {
      /* ignore */
    }
  }

  /**
   * Liste tous voiceprints enrôlés.
   */
  listPrints(): VoiceFingerprint[] {
    const prints: VoiceFingerprint[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith('ax_voice_print_')) {
        try {
          const raw = localStorage.getItem(k);
          if (raw) prints.push(JSON.parse(raw) as VoiceFingerprint);
        } catch {
          /* ignore corrupt */
        }
      }
    }
    return prints;
  }

  /**
   * Suppression voiceprint user (RGPD Art. 17).
   */
  deletePrint(uid: string): boolean {
    try {
      localStorage.removeItem(`ax_voice_print_${uid}`);
      void auditLog.record('voice.deleted', { details: { uid } });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Set threshold similarity (admin tuning).
   */
  setThreshold(threshold: number): void {
    this.threshold = Math.max(0, Math.min(1, threshold));
  }

  getThreshold(): number {
    return this.threshold;
  }

  /**
   * Enregistre callback pour les transcriptions partielles (debug live UI).
   * Utile pour afficher "Transcription : ..." pendant que user parle.
   */
  onWakeInterim(cb: ((transcript: string, isFinal: boolean) => void) | null): void {
    this.wakeInterimCallback = cb;
  }

  /**
   * Wake word "Dis Apex" listener (continuous Web Speech API).
   *
   * iOS Safari quirks (CLAUDE.md erreur #43, fix v13.3.23) :
   * - `continuous = false` obligatoire (auto-stop après 15-30s silence)
   * - onerror 'aborted' = lifecycle normal → restart auto, NE PAS afficher en erreur
   * - onerror 'no-speech' burst → suspend 30s après 20 tentatives
   * - onerror 'not-allowed' → modal permissions iOS Settings
   * - `interimResults = true` : permet de voir transcription live
   */
  startWakeWord(callback: (transcript: string) => void): { ok: boolean; reason?: string } {
    if (!this.isSupported()) return { ok: false, reason: 'Web Speech API non supportée' };
    if (this.wakeListening) {
      this.wakeCallbacks.push(callback);
      return { ok: true };
    }
    try {
      const SpeechRec =
        (window as unknown as { SpeechRecognition?: new () => unknown }).SpeechRecognition ??
        (window as unknown as { webkitSpeechRecognition?: new () => unknown }).webkitSpeechRecognition;
      if (!SpeechRec) return { ok: false, reason: 'SpeechRecognition undefined' };

      const isiOS = isiOSSafari();
      const rec = new SpeechRec() as {
        continuous: boolean;
        interimResults: boolean;
        lang: string;
        onresult: (event: {
          results: ArrayLike<{ 0: { transcript: string }; isFinal?: boolean }> & { length: number };
        }) => void;
        onerror: (event: { error?: string }) => void;
        onend: () => void;
        start: () => void;
        stop: () => void;
      };
      rec.continuous = !isiOS; /* iOS Safari : continuous unstable, restart via onend */
      rec.interimResults = true;
      rec.lang = 'fr-FR';
      this.wakeNoSpeechRetries = 0;

      rec.onresult = (event) => {
        const results = event.results;
        for (let i = 0; i < results.length; i++) {
          const transcript = results[i]?.[0]?.transcript?.toLowerCase() ?? '';
          const isFinal = results[i]?.isFinal ?? false;
          /* Reset compteur no-speech dès qu'on capte du son */
          this.wakeNoSpeechRetries = 0;
          /* Live interim feedback (UI panel diagnostic ou toast progress) */
          if (this.wakeInterimCallback) {
            try {
              this.wakeInterimCallback(transcript, isFinal);
            } catch {
              /* ignore callback errors */
            }
          }
          pushVoiceLog({
            ts: Date.now(),
            evt: isFinal ? 'result' : 'interim',
            src: 'wake-word',
            detail: transcript.slice(0, 80),
          });
          if (isWakeMatch(transcript)) {
            pushVoiceLog({ ts: Date.now(), evt: 'wake', src: 'wake-word', detail: transcript.slice(0, 80) });
            void auditLog.record('voice.wake_detected', {
              details: { transcript: transcript.slice(0, 50) },
            });
            /* Iter copie pour éviter mutation pendant exec */
            const cbs = [...this.wakeCallbacks];
            for (const cb of cbs) {
              try {
                cb(transcript);
              } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err);
                logger.warn('voice-print', 'wake callback threw', { err: msg });
              }
            }
          }
        }
      };

      rec.onerror = (event) => {
        const err = event?.error ?? 'unknown';
        pushVoiceLog({ ts: Date.now(), evt: 'error', src: 'wake-word', detail: err });

        if (err === 'no-speech') {
          this.wakeNoSpeechRetries++;
          if (this.wakeNoSpeechRetries >= MAX_NO_SPEECH_RETRIES) {
            logger.warn('voice-print', `${MAX_NO_SPEECH_RETRIES}× no-speech consécutifs → suspend 30s`);
            pushVoiceLog({
              ts: Date.now(),
              evt: 'suspend',
              src: 'wake-word',
              detail: `${MAX_NO_SPEECH_RETRIES}× no-speech`,
            });
            /* Suspend temporaire : stop puis restart auto après 30s */
            this.suspendWakeAndResumeLater();
          }
          return;
        }

        if (err === 'not-allowed' || err === 'service-not-allowed') {
          logger.warn('voice-print', 'permission micro refusée');
          pushVoiceLog({ ts: Date.now(), evt: 'permission', src: 'wake-word', detail: 'denied' });
          try {
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem(PERMISSION_DENIED_KEY, String(Date.now()));
            }
          } catch {
            /* ignore */
          }
          this.stopWakeWord();
          return;
        }

        /* 'aborted', 'network', 'audio-capture' : recovery via onend (silencieux) */
      };

      rec.onend = () => {
        pushVoiceLog({ ts: Date.now(), evt: 'end', src: 'wake-word' });
        if (!this.wakeListening) return;
        /* Restart sur iOS (continuous=false) ou recovery erreur */
        setTimeout(() => {
          if (!this.wakeListening || this.wakeSuspendTimer !== null) return;
          try {
            rec.start();
            pushVoiceLog({ ts: Date.now(), evt: 'restart', src: 'wake-word' });
          } catch {
            /* ignore double-start race InvalidStateError — restart au prochain onend */
          }
        }, RESTART_DELAY_MS);
      };

      this.wakeRecognition = rec;
      this.wakeCallbacks = [callback];
      this.wakeListening = true;
      rec.start();
      pushVoiceLog({ ts: Date.now(), evt: 'start', src: 'wake-word', detail: isiOS ? 'iOS' : 'desktop' });
      return { ok: true };
    } catch (err: unknown) {
      const reason = err instanceof Error ? err.message : String(err);
      pushVoiceLog({ ts: Date.now(), evt: 'error', src: 'wake-word', detail: `start: ${reason}` });
      return { ok: false, reason };
    }
  }

  /**
   * Suspend wake word 30s après burst no-speech (anti drain batterie),
   * puis tente reprise automatique si toujours en mode listening.
   */
  private suspendWakeAndResumeLater(): void {
    if (this.wakeSuspendTimer) return; /* déjà programmé */
    /* Stop micro mais garde flag listening pour reprise auto */
    if (this.wakeRecognition) {
      try {
        (this.wakeRecognition as { stop: () => void }).stop();
      } catch {
        /* ignore */
      }
    }
    this.wakeSuspendTimer = setTimeout(() => {
      this.wakeSuspendTimer = null;
      this.wakeNoSpeechRetries = 0;
      if (!this.wakeListening || !this.wakeRecognition) return;
      try {
        (this.wakeRecognition as { start: () => void }).start();
        pushVoiceLog({ ts: Date.now(), evt: 'restart', src: 'wake-word', detail: 'after-suspend' });
      } catch {
        /* ignore */
      }
    }, NO_SPEECH_SUSPEND_MS);
  }

  /**
   * Stop wake word listening.
   */
  stopWakeWord(): void {
    if (!this.wakeListening) return;
    this.wakeListening = false;
    this.wakeCallbacks = [];
    this.wakeNoSpeechRetries = 0;
    if (this.wakeSuspendTimer) {
      clearTimeout(this.wakeSuspendTimer);
      this.wakeSuspendTimer = null;
    }
    if (this.wakeRecognition) {
      try {
        (this.wakeRecognition as { stop: () => void }).stop();
      } catch {
        /* ignore */
      }
      this.wakeRecognition = null;
    }
  }

  isListening(): boolean {
    return this.wakeListening;
  }

  /**
   * Stats admin dashboard.
   */
  getStats(): { enrolled_count: number; total_samples: number; avg_match_score: number } {
    const prints = this.listPrints();
    const total = prints.reduce((s, p) => s + p.samples_count, 0);
    const avgScore = prints.length > 0
      ? prints.reduce((s, p) => s + p.match_score_avg, 0) / prints.length
      : 0;
    return {
      enrolled_count: prints.length,
      total_samples: total,
      avg_match_score: Math.round(avgScore * 100) / 100,
    };
  }
}

export const voicePrint = new VoicePrint();
