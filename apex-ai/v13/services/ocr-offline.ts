/**
 * APEX v13.3.57 PUSH-100 — OCR Offline (tesseract.js fallback)
 *
 * Quand Vision IA (Claude / GPT-4 Vision) est indisponible (pas de clé,
 * quota épuisé, network down), fallback OCR offline via tesseract.js
 * lazy-loadé depuis CDN.
 *
 * Anti-pattern Kevin :
 * - Lazy load uniquement à la demande (~3 MB tesseract WASM)
 * - Cache mémoire pour évites re-init worker à chaque appel
 * - Timeout strict pour éviter blocage UI
 * - Pas de stockage image (privacy)
 */

import { logger } from '../core/logger.js';

const TESSERACT_CDN = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.0.5/dist/tesseract.min.js';
const DEFAULT_LANG = 'fra+eng'; /* Français + Anglais par défaut Kevin */
const DEFAULT_TIMEOUT_MS = 60_000; /* 60s max — OCR peut être lent sur grande image */

interface TesseractWorker {
  recognize: (image: string | Blob | HTMLImageElement | HTMLCanvasElement) => Promise<{
    data: { text: string; confidence: number };
  }>;
  terminate: () => Promise<void>;
}

interface TesseractGlobal {
  createWorker: (lang: string) => Promise<TesseractWorker>;
}

declare global {
  interface Window {
    Tesseract?: TesseractGlobal;
  }
}

export interface OcrResult {
  ok: boolean;
  text: string;
  confidence: number;
  latency_ms: number;
  error?: string;
  source: 'tesseract-offline';
}

class OcrOfflineService {
  private worker: TesseractWorker | null = null;
  private workerLang: string | null = null;
  private loadPromise: Promise<void> | null = null;

  /**
   * Charge tesseract.js depuis CDN (lazy, idempotent).
   * Si déjà chargé, retourne immédiatement.
   */
  private async loadTesseract(): Promise<void> {
    if (typeof window === 'undefined') {
      throw new Error('OCR offline requires browser environment');
    }
    if (window.Tesseract) return;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = TESSERACT_CDN;
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.onload = (): void => {
        if (window.Tesseract) {
          logger.info('ocr-offline', 'tesseract.js loaded from CDN');
          resolve();
        } else {
          reject(new Error('tesseract.js loaded but Window.Tesseract undefined'));
        }
      };
      script.onerror = (): void => {
        this.loadPromise = null; /* allow retry */
        reject(new Error('Failed to load tesseract.js from CDN'));
      };
      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  /**
   * Init worker tesseract pour une langue.
   * Si worker existe avec autre langue → terminate puis re-create.
   */
  private async ensureWorker(lang: string): Promise<TesseractWorker> {
    await this.loadTesseract();
    if (!window.Tesseract) {
      throw new Error('Tesseract global not available after load');
    }
    if (this.worker && this.workerLang === lang) {
      return this.worker;
    }
    /* Terminate old worker if lang changed */
    if (this.worker && this.workerLang !== lang) {
      try {
        await this.worker.terminate();
      } catch {
        /* ignore */
      }
      this.worker = null;
      this.workerLang = null;
    }
    this.worker = await window.Tesseract.createWorker(lang);
    this.workerLang = lang;
    return this.worker;
  }

  /**
   * Reconnaît du texte dans une image.
   * @param imageBase64 - Image encodée base64 ('data:image/png;base64,...' ou raw base64)
   * @param options - { lang, timeoutMs }
   */
  async recognizeText(
    imageBase64: string,
    options: { lang?: string; timeoutMs?: number } = {},
  ): Promise<OcrResult> {
    const start = Date.now();
    const lang = options.lang ?? DEFAULT_LANG;
    const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const result: OcrResult = {
      ok: false,
      text: '',
      confidence: 0,
      latency_ms: 0,
      source: 'tesseract-offline',
    };

    if (!imageBase64) {
      result.error = 'empty_image';
      return result;
    }

    try {
      const worker = await this.ensureWorker(lang);
      /* Normalize : si pas de prefix data:, ajoute */
      const dataUrl = imageBase64.startsWith('data:') ? imageBase64 : `data:image/png;base64,${imageBase64}`;
      /* Wrap dans Promise.race pour timeout strict */
      const recognition = worker.recognize(dataUrl);
      const timeout = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('ocr_timeout')), timeoutMs);
      });
      const recognized = await Promise.race([recognition, timeout]);
      result.ok = true;
      result.text = recognized.data.text;
      result.confidence = Math.round(recognized.data.confidence) / 100;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      result.error = msg;
      logger.warn('ocr-offline', 'recognition failed', { err: msg });
    } finally {
      result.latency_ms = Date.now() - start;
    }
    return result;
  }

  /**
   * True si OCR offline est dispo (browser context + tesseract chargeable).
   */
  isAvailable(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  }

  /**
   * Cleanup : termine le worker et libère mémoire.
   */
  async cleanup(): Promise<void> {
    if (this.worker) {
      try {
        await this.worker.terminate();
      } catch {
        /* ignore */
      }
      this.worker = null;
      this.workerLang = null;
    }
  }
}

export const ocrOffline = new OcrOfflineService();
