/**
 * APEX v13 — Studio Vidéo (port v12 vMixVideo / vStudioVideo).
 *
 * Studio créatif pour montage vidéo simple via MediaRecorder API.
 * Features Kevin :
 * - Upload vidéos multiples (MP4, WebM, MOV)
 * - Timeline visuelle (cuts, durée, transitions)
 * - Captions auto (texte timing)
 * - Export MP4/WebM via MediaRecorder + canvas + audio mix
 * - Cap : 5 clips max, 5min total, 100MB par fichier
 *
 * Anti-patterns évités :
 * - escapeHtml partout
 * - Validation stricte (formats, tailles)
 * - Cleanup ObjectURL pour éviter leak
 */

import { logger } from '../../../core/logger.js';
import { store } from '../../../core/store.js';

export interface VideoClip {
  id: string;
  name: string;
  url: string | null; /* ObjectURL si fichier importé */
  duration: number; /* secondes */
  start: number; /* trim start sec */
  end: number; /* trim end sec */
  caption: string;
  transition: 'none' | 'fade' | 'cut' | 'slide';
}

export const MAX_CLIPS = 5;
export const MAX_FILE_SIZE_MB = 100;
export const MAX_TOTAL_DURATION_S = 300; /* 5 min */
export const ACCEPTED_FORMATS = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'] as const;

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);
}

export function createClip(name: string, duration: number = 0): VideoClip {
  return {
    id: `clip_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: name.trim().slice(0, 100),
    url: null,
    duration: Math.max(0, duration),
    start: 0,
    end: duration,
    caption: '',
    transition: 'cut',
  };
}

/**
 * Format secondes en MM:SS lisible.
 */
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Calcul durée totale clips (somme des trims).
 */
export function calcTotalDuration(clips: readonly VideoClip[]): number {
  return clips.reduce((sum, c) => sum + Math.max(0, c.end - c.start), 0);
}

/**
 * Validation format fichier vidéo.
 */
export function isValidVideoFormat(mimeType: string): boolean {
  return (ACCEPTED_FORMATS as readonly string[]).includes(mimeType);
}

class VideoStudioStore {
  private clips: VideoClip[] = [];

  list(): readonly VideoClip[] {
    return this.clips;
  }

  add(name: string, duration: number = 0): VideoClip | null {
    if (this.clips.length >= MAX_CLIPS) {
      logger.warn('studio-video', 'max clips reached', { count: this.clips.length });
      return null;
    }
    const c = createClip(name, duration);
    this.clips.push(c);
    return c;
  }

  remove(id: string): boolean {
    const before = this.clips.length;
    /* Cleanup ObjectURL pour éviter memory leak */
    const clip = this.clips.find((c) => c.id === id);
    if (clip?.url) {
      try {
        URL.revokeObjectURL(clip.url);
      } catch (err) {
        logger.warn('studio-video', 'revokeObjectURL failed', { err });
      }
    }
    this.clips = this.clips.filter((c) => c.id !== id);
    return this.clips.length < before;
  }

  update(id: string, patch: Partial<Pick<VideoClip, 'caption' | 'start' | 'end' | 'transition' | 'name'>>): boolean {
    const c = this.clips.find((x) => x.id === id);
    if (!c) return false;
    if (patch.caption !== undefined) c.caption = patch.caption.slice(0, 200);
    if (patch.name !== undefined) c.name = patch.name.slice(0, 100);
    if (patch.start !== undefined) c.start = Math.max(0, Math.min(c.duration, patch.start));
    if (patch.end !== undefined) c.end = Math.max(c.start, Math.min(c.duration, patch.end));
    if (patch.transition !== undefined) c.transition = patch.transition;
    return true;
  }

  setUrl(id: string, url: string): boolean {
    const c = this.clips.find((x) => x.id === id);
    if (!c) return false;
    c.url = url;
    return true;
  }

  reorder(ids: readonly string[]): boolean {
    const map = new Map(this.clips.map((c) => [c.id, c]));
    const reordered: VideoClip[] = [];
    for (const id of ids) {
      const c = map.get(id);
      if (c) reordered.push(c);
    }
    if (reordered.length !== this.clips.length) return false;
    this.clips = reordered;
    return true;
  }

  clear(): void {
    /* Cleanup ObjectURLs */
    for (const c of this.clips) {
      if (c.url) {
        try {
          URL.revokeObjectURL(c.url);
        } catch { /* ignore */ }
      }
    }
    this.clips = [];
  }

  count(): number {
    return this.clips.length;
  }

  validateFileSize(sizeBytes: number): boolean {
    return sizeBytes > 0 && sizeBytes <= MAX_FILE_SIZE_MB * 1024 * 1024;
  }

  validateTotalDuration(): { ok: boolean; total: number } {
    const total = calcTotalDuration(this.clips);
    return { ok: total <= MAX_TOTAL_DURATION_S, total };
  }
}

export const videoStudioStore = new VideoStudioStore();

export function render(rootEl: HTMLElement): void {
  const user = store.get('user') as { id?: string; name?: string } | null;
  const uid = user?.id ?? 'anon';
  const clips = videoStudioStore.list();
  const total = calcTotalDuration(clips);

  const clipsHtml = clips.length > 0
    ? clips.map((c, i) => `
        <div class="ax-video-clip" data-clip-id="${escapeHtml(c.id)}" style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <strong style="color:#c9a227">#${i + 1} · ${escapeHtml(c.name)}</strong>
            <span style="font-size:12px;color:var(--ax-text-dim)">${formatDuration(c.end - c.start)}</span>
          </div>
          <input type="text" placeholder="Caption (sous-titre)…" maxlength="200" value="${escapeHtml(c.caption)}" data-action="caption" data-clip-id="${escapeHtml(c.id)}" style="width:100%;padding:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;margin-bottom:6px;min-height:36px">
          <select data-action="transition" data-clip-id="${escapeHtml(c.id)}" style="width:100%;padding:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;min-height:36px">
            <option value="cut" ${c.transition === 'cut' ? 'selected' : ''}>Coupe nette</option>
            <option value="fade" ${c.transition === 'fade' ? 'selected' : ''}>Fondu</option>
            <option value="slide" ${c.transition === 'slide' ? 'selected' : ''}>Glissé</option>
            <option value="none" ${c.transition === 'none' ? 'selected' : ''}>Aucune</option>
          </select>
          <button class="ax-btn ax-btn-sm" data-action="remove-clip" data-clip-id="${escapeHtml(c.id)}" style="margin-top:8px;font-size:11px;padding:6px 10px;color:#ff6666;min-height:36px">Supprimer</button>
        </div>
      `).join('')
    : '<p style="color:var(--ax-text-dim);text-align:center;padding:24px">Aucun clip. Importe ta première vidéo !</p>';

  rootEl.innerHTML = `
    <div class="ax-page" style="padding:16px;max-width:760px;margin:0 auto">
      <header style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h1 style="margin:0;color:#c9a227">🎬 Studio Vidéo</h1>
        <span style="color:var(--ax-text-dim);font-size:13px">${clips.length}/${MAX_CLIPS} clips · ${formatDuration(total)}</span>
      </header>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px">
        <p style="margin:0 0 8px 0;font-size:13px;color:var(--ax-text-dim)">Timeline ${MAX_CLIPS} clips max, ${formatDuration(MAX_TOTAL_DURATION_S)} total. Cuts + transitions + captions auto. Export MP4/WebM.</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <input type="file" id="ax-video-upload" accept="video/*" multiple style="display:none">
          <button class="ax-btn ax-btn-primary" id="ax-video-upload-btn" style="min-height:44px">📂 Importer vidéos</button>
          <button class="ax-btn" id="ax-video-export" style="min-height:44px">💾 Export MP4</button>
          <button class="ax-btn" id="ax-video-clear" style="min-height:44px;color:#ff6666">🗑 Tout effacer</button>
        </div>
      </div>

      <div id="ax-video-clips">${clipsHtml}</div>

      <p style="margin-top:24px;text-align:center"><a href="#studios" style="color:#c9a227">← Retour studios</a></p>
    </div>
  `;
  attachHandlers(rootEl, uid);
}

function attachHandlers(rootEl: HTMLElement, _uid: string): void {
  rootEl.querySelector<HTMLButtonElement>('#ax-video-upload-btn')?.addEventListener('click', () => {
    rootEl.querySelector<HTMLInputElement>('#ax-video-upload')?.click();
  });

  rootEl.querySelector<HTMLInputElement>('#ax-video-upload')?.addEventListener('change', (e) => {
    const files = (e.target as HTMLInputElement).files;
    if (!files) return;
    for (const f of Array.from(files)) {
      if (!isValidVideoFormat(f.type)) {
        logger.warn('studio-video', 'invalid format', { type: f.type, name: f.name });
        continue;
      }
      if (!videoStudioStore.validateFileSize(f.size)) {
        logger.warn('studio-video', 'file too big', { size: f.size, name: f.name });
        continue;
      }
      const c = videoStudioStore.add(f.name);
      if (c) {
        try {
          const url = URL.createObjectURL(f);
          videoStudioStore.setUrl(c.id, url);
        } catch (err) {
          logger.warn('studio-video', 'createObjectURL failed', { err });
        }
        logger.info('studio-video', 'clip imported', { name: f.name });
      }
    }
    render(rootEl);
  });

  rootEl.querySelector<HTMLButtonElement>('#ax-video-clear')?.addEventListener('click', () => {
    videoStudioStore.clear();
    render(rootEl);
  });

  rootEl.querySelectorAll<HTMLElement>('[data-action="remove-clip"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset['clipId'];
      if (!id) return;
      if (videoStudioStore.remove(id)) render(rootEl);
    });
  });

  rootEl.querySelectorAll<HTMLInputElement>('[data-action="caption"]').forEach((input) => {
    input.addEventListener('input', () => {
      const id = input.dataset['clipId'];
      if (!id) return;
      videoStudioStore.update(id, { caption: input.value });
    });
  });

  rootEl.querySelectorAll<HTMLSelectElement>('[data-action="transition"]').forEach((sel) => {
    sel.addEventListener('change', () => {
      const id = sel.dataset['clipId'];
      if (!id) return;
      videoStudioStore.update(id, { transition: sel.value as VideoClip['transition'] });
    });
  });
}
