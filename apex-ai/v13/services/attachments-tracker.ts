/**
 * APEX v13 — Attachments Tracker
 * Kevin 2026-05-09 : "Sois au courant de ce que je mets comme pièces jointes dans Apex"
 *
 * Apex garde en mémoire TOUTES les pièces jointes de la session :
 * - Fichiers uploadés (image, vidéo, audio, PDF, doc, archive)
 * - Résultats d'analyse (vision IA, OCR, multi-source)
 * - Transformations appliquées (cartoon, anime, video, remove-bg)
 * - Pièces jointes clipboard (Ctrl+V)
 *
 * Persisté localStorage (ax_v13_attachments) + Firebase backup.
 * Apex peut répondre "que m'as-tu envoyé ?" → liste complète.
 */

export interface AttachmentEntry {
  id: string;
  ts: number;
  name: string;
  type: string;           // MIME type
  size: number;           // bytes
  source: 'file_picker' | 'drag_drop' | 'clipboard_paste' | 'camera' | 'url';
  status: 'uploading' | 'analyzing' | 'ready' | 'error';
  analysis?: {
    type?: string;        // 'device_image', 'smart_tv', 'broadlink_account', 'photo', 'document'
    description?: string;
    credentials_found?: number;
    urls_found?: number;
    text_extracted?: string;
    device_detected?: string;
  };
  transformations?: Array<{
    type: 'cartoon' | 'anime' | 'video' | 'remove-bg' | 'stylize';
    outputUrl?: string;
    ts: number;
    ok: boolean;
  }>;
  dataUrl?: string;       // thumbnail (images only, cap 200KB)
  objectUrl?: string;     // blob: URL (session only, non-persisté)
  session_id?: string;
}

const STORAGE_KEY = 'ax_v13_attachments';
const MAX_ENTRIES = 100;
const MAX_DATA_URL_SIZE = 200 * 1024; // 200KB pour thumbnails

class AttachmentsTracker {
  private entries: AttachmentEntry[] = [];
  private listeners: Array<(entries: AttachmentEntry[]) => void> = [];

  constructor() {
    this.load();
  }

  private load(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as AttachmentEntry[];
      if (Array.isArray(parsed)) {
        // Strip objectUrl (blob: URLs invalides après reload)
        this.entries = parsed.map(e => {
          const copy: AttachmentEntry = { ...e };
          delete copy.objectUrl;
          return copy;
        });
      }
    } catch {
      this.entries = [];
    }
  }

  private save(): void {
    try {
      const toSave = this.entries
        .slice(-MAX_ENTRIES)
        .map(e => {
          const copy: AttachmentEntry = { ...e };
          delete copy.objectUrl;
          // Ne pas persister dataUrl si trop grand (économise localStorage)
          if (copy.dataUrl && copy.dataUrl.length > MAX_DATA_URL_SIZE) {
            delete copy.dataUrl;
          }
          return copy;
        });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch {
      // Quota exceeded → trim agressif
      try {
        const half = this.entries.slice(-Math.floor(MAX_ENTRIES / 2))
          .map(e => {
            const copy: AttachmentEntry = { ...e };
            delete copy.objectUrl;
            delete copy.dataUrl;
            return copy;
          });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(half));
      } catch { /* skip */ }
    }
  }

  private notify(): void {
    for (const listener of this.listeners) {
      try { listener([...this.entries]); } catch { /* ignore */ }
    }
  }

  /** Ajoute une pièce jointe à la session */
  add(file: File, source: AttachmentEntry['source'] = 'file_picker'): AttachmentEntry {
    const id = `att_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const entry: AttachmentEntry = {
      id,
      ts: Date.now(),
      name: file.name,
      type: file.type || 'application/octet-stream',
      size: file.size,
      source,
      status: 'uploading',
      session_id: this.getSessionId(),
    };

    // Génère objectUrl pour preview
    try {
      entry.objectUrl = URL.createObjectURL(file);
    } catch { /* ignore */ }

    // Génère thumbnail dataUrl pour images (async, non-bloquant)
    if (file.type.startsWith('image/') && file.size < 5 * 1024 * 1024) {
      void this.generateThumbnail(file, id);
    }

    this.entries.push(entry);
    this.save();
    this.notify();
    return entry;
  }

  /** Génère miniature base64 (max 200KB) pour une image */
  private async generateThumbnail(file: File, id: string): Promise<void> {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const img = new Image();
      const url = URL.createObjectURL(file);
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = url;
      });
      const MAX_DIM = 120;
      const ratio = Math.min(MAX_DIM / img.width, MAX_DIM / img.height, 1);
      canvas.width = Math.round(img.width * ratio);
      canvas.height = Math.round(img.height * ratio);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
      if (dataUrl.length <= MAX_DATA_URL_SIZE) {
        this.updateEntry(id, { dataUrl });
      }
    } catch { /* ignore */ }
  }

  /** Met à jour le statut/analyse d'une pièce jointe */
  updateEntry(id: string, patch: Partial<AttachmentEntry>): void {
    const idx = this.entries.findIndex(e => e.id === id);
    if (idx < 0) return;
    this.entries[idx] = { ...this.entries[idx]!, ...patch };
    this.save();
    this.notify();
  }

  /** Marque une pièce jointe comme analysée */
  markAnalyzed(id: string, analysis: AttachmentEntry['analysis']): void {
    const patch: Partial<AttachmentEntry> = { status: 'ready' };
    if (analysis !== undefined) patch.analysis = analysis;
    this.updateEntry(id, patch);
  }

  /** Ajoute une transformation (cartoon, anime, etc.) */
  addTransformation(id: string, transform: NonNullable<AttachmentEntry['transformations']>[number]): void {
    const entry = this.entries.find(e => e.id === id);
    if (!entry) return;
    const transforms = entry.transformations ?? [];
    transforms.push(transform);
    this.updateEntry(id, { transformations: transforms });
  }

  /** Retourne toutes les pièces jointes de la session courante */
  getSessionEntries(): AttachmentEntry[] {
    const sid = this.getSessionId();
    return this.entries.filter(e => e.session_id === sid);
  }

  /** Retourne toutes les pièces jointes (toutes sessions) */
  getAll(): AttachmentEntry[] {
    return [...this.entries];
  }

  /** Retourne les pièces jointes par type */
  getByType(mimePrefix: string): AttachmentEntry[] {
    return this.entries.filter(e => e.type.startsWith(mimePrefix));
  }

  /** Résumé lisible pour le contexte IA */
  getSummaryForAI(): string {
    const session = this.getSessionEntries();
    if (session.length === 0) return '';

    const lines: string[] = [`📎 **${session.length} pièce(s) jointe(s) dans cette session :**`];
    for (const e of session) {
      const sizeMB = (e.size / 1024 / 1024).toFixed(2);
      const icon = this.getIcon(e.type);
      let line = `- ${icon} **${e.name}** (${sizeMB} MB, ${e.type})`;
      if (e.analysis?.description) {
        line += ` → ${e.analysis.description}`;
      }
      if (e.analysis?.device_detected) {
        line += ` [Device: ${e.analysis.device_detected}]`;
      }
      if (e.analysis?.credentials_found && e.analysis.credentials_found > 0) {
        line += ` [${e.analysis.credentials_found} credential(s) extrait(s)]`;
      }
      if (e.transformations && e.transformations.length > 0) {
        const transformNames = e.transformations.map(t => t.type).join(', ');
        line += ` [Transformé: ${transformNames}]`;
      }
      lines.push(line);
    }
    return lines.join('\n');
  }

  /** Retourne un résumé compact pour le système prompt */
  getSystemPromptContext(): string {
    const session = this.getSessionEntries();
    if (session.length === 0) return '';
    const summary = session.map(e => {
      const sizeMB = (e.size / 1024 / 1024).toFixed(1);
      return `${e.name}(${sizeMB}MB,${e.type.split('/')[1] ?? e.type})`;
    }).join('; ');
    return `\n\n📎 Pièces jointes session: ${summary}`;
  }

  /** Icon emoji par type MIME */
  private getIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎬';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return '📦';
    if (mimeType.includes('word') || mimeType.includes('docx')) return '📝';
    if (mimeType.includes('sheet') || mimeType.includes('xlsx')) return '📊';
    return '📎';
  }

  /** Session ID simple basé sur date (change à minuit) */
  private getSessionId(): string {
    return new Date().toISOString().slice(0, 10);
  }

  /** Écoute les changements */
  onChange(listener: (entries: AttachmentEntry[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /** Vide les pièces jointes de la session */
  clearSession(): void {
    const sid = this.getSessionId();
    this.entries = this.entries.filter(e => e.session_id !== sid);
    this.save();
    this.notify();
  }

  /** Vide tout */
  clearAll(): void {
    this.entries = [];
    localStorage.removeItem(STORAGE_KEY);
    this.notify();
  }

  /** Compte pièces jointes session */
  get count(): number {
    return this.getSessionEntries().length;
  }

  /** A-t-on des images dans la session ? */
  get hasImages(): boolean {
    return this.getSessionEntries().some(e => e.type.startsWith('image/'));
  }

  /** A-t-on des documents dans la session ? */
  get hasDocuments(): boolean {
    return this.getSessionEntries().some(e =>
      e.type.includes('pdf') || e.type.includes('word') || e.type.includes('text')
    );
  }
}

export const attachmentsTracker = new AttachmentsTracker();
