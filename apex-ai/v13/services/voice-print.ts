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
  samples_count: number;
  enrolled_at: number;
  last_match: number;
  match_score_avg: number;
}

export interface VoiceMatchResult {
  uid: string | null;
  score: number;
  confident: boolean;
}

const SIMILARITY_THRESHOLD_DEFAULT = 0.75;
const WAKE_WORDS = ['dis apex', 'dis apex', 'dit apex', 'di apex', 'hey apex', 'apex'];

class VoicePrint {
  private wakeRecognition: unknown = null; /* SpeechRecognition instance */
  private wakeListening = false;
  private threshold = SIMILARITY_THRESHOLD_DEFAULT;
  private wakeCallbacks: Array<(transcript: string) => void> = [];

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
   * Calcule fingerprint simplifié depuis AudioBuffer.
   * (Jet 9 enrichira avec meyda MFCC + chroma + spectral centroid)
   */
  computeFingerprint(audioBuffer: AudioBuffer): { pitch: number; zcr: number; energy: number } {
    const data = audioBuffer.getChannelData(0);
    /* Energy = RMS (moyenne quadratique) */
    let energy = 0;
    for (let i = 0; i < data.length; i++) energy += data[i]! * data[i]!;
    energy = Math.sqrt(energy / data.length);

    /* Zero Crossing Rate : nombre de fois que le signal change de signe */
    let zcr = 0;
    for (let i = 1; i < data.length; i++) {
      if ((data[i]! >= 0) !== (data[i - 1]! >= 0)) zcr++;
    }
    zcr /= data.length;

    /* Pitch estimate : autocorrélation simple (Jet 9 → YIN algorithm via pitchy) */
    let pitch = 0;
    const sampleRate = audioBuffer.sampleRate;
    const minLag = Math.floor(sampleRate / 500); /* 500 Hz = pitch max attendu */
    const maxLag = Math.floor(sampleRate / 80); /* 80 Hz = pitch min */
    let bestCorr = 0;
    for (let lag = minLag; lag < maxLag && lag < data.length / 2; lag++) {
      let corr = 0;
      for (let i = 0; i < data.length - lag; i++) corr += data[i]! * data[i + lag]!;
      corr /= data.length - lag;
      if (corr > bestCorr) {
        bestCorr = corr;
        pitch = sampleRate / lag;
      }
    }

    return { pitch, zcr, energy };
  }

  /**
   * Enrôle voix user (3 samples audio recommandés).
   */
  async enroll(uid: string, audioSamples: AudioBuffer[]): Promise<{ ok: boolean; reason?: string }> {
    if (audioSamples.length < 1) return { ok: false, reason: 'Aucun sample audio' };
    /* Calcule fingerprints + moyenne */
    const fps = audioSamples.map((s) => this.computeFingerprint(s));
    const avg = {
      pitch_avg: fps.reduce((s, f) => s + f.pitch, 0) / fps.length,
      zcr_avg: fps.reduce((s, f) => s + f.zcr, 0) / fps.length,
      energy_avg: fps.reduce((s, f) => s + f.energy, 0) / fps.length,
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
      const score = this.cosineSimilarity(
        [fp.pitch, fp.zcr, fp.energy],
        [print.pitch_avg, print.zcr_avg, print.energy_avg],
      );
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
      dot += a[i]! * b[i]!;
      normA += a[i]! * a[i]!;
      normB += b[i]! * b[i]!;
    }
    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Mise à jour voiceprint avec sample (apprentissage continu).
   */
  private updatePrintWithSample(
    uid: string,
    fp: { pitch: number; zcr: number; energy: number },
    score: number,
  ): void {
    try {
      const raw = localStorage.getItem(`ax_voice_print_${uid}`);
      if (!raw) return;
      const print = JSON.parse(raw) as VoiceFingerprint;
      /* Moyenne pondérée 0.9 ancien + 0.1 nouveau */
      const weight = 0.1;
      print.pitch_avg = print.pitch_avg * (1 - weight) + fp.pitch * weight;
      print.zcr_avg = print.zcr_avg * (1 - weight) + fp.zcr * weight;
      print.energy_avg = print.energy_avg * (1 - weight) + fp.energy * weight;
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
   * Wake word "Dis Apex" listener (continuous Web Speech API).
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

      const isiOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
      const rec = new SpeechRec() as {
        continuous: boolean;
        interimResults: boolean;
        lang: string;
        onresult: (event: { results: ArrayLike<{ 0: { transcript: string } }> & { length: number } }) => void;
        onerror: (event: unknown) => void;
        onend: () => void;
        start: () => void;
        stop: () => void;
      };
      rec.continuous = !isiOS; /* iOS Safari : continuous unstable, restart via onend */
      rec.interimResults = true;
      rec.lang = 'fr-FR';

      rec.onresult = (event) => {
        const results = event.results;
        for (let i = 0; i < results.length; i++) {
          const transcript = results[i]?.[0]?.transcript?.toLowerCase() ?? '';
          if (WAKE_WORDS.some((w) => transcript.includes(w))) {
            void auditLog.record('voice.wake_detected', { details: { transcript: transcript.slice(0, 50) } });
            this.wakeCallbacks.forEach((cb) => cb(transcript));
          }
        }
      };

      rec.onerror = (_event) => {
        /* iOS no-speech : restart silencieusement */
      };

      rec.onend = () => {
        if (this.wakeListening) {
          /* Restart sur iOS où continuous fail */
          setTimeout(() => {
            try {
              rec.start();
            } catch {
              /* ignore double-start */
            }
          }, 500);
        }
      };

      this.wakeRecognition = rec;
      this.wakeCallbacks = [callback];
      this.wakeListening = true;
      rec.start();
      return { ok: true };
    } catch (err: unknown) {
      const reason = err instanceof Error ? err.message : String(err);
      return { ok: false, reason };
    }
  }

  /**
   * Stop wake word listening.
   */
  stopWakeWord(): void {
    if (!this.wakeListening) return;
    this.wakeListening = false;
    this.wakeCallbacks = [];
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
