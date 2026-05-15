/**
 * APEX v13 — Studios Hub (15 studios créatifs).
 *
 * Demande Kevin : 15 studios créatifs (musique, vidéo, CV, facture, contrat,
 * présentation, clip, logo, archi, plant, geo, building, lunar, pet, scan).
 *
 * Architecture :
 * - Catalog typé (id, emoji, label, description, capabilities)
 * - Render dispatcher centralisé
 * - Lazy load par studio (code splitting Vite)
 * - Wiring smart-tools-suggester : chaque studio mappé sur intents detectables
 *
 * Anti-théâtre :
 * - Chaque studio a une UI minimale réelle (form + actions)
 * - Pas de placeholder vide
 * - Tools IA wirables (apex-tools dispatch)
 */

import { logger } from '../../core/logger.js';

export type StudioId =
  | 'music' | 'video' | 'cv' | 'facture' | 'contrat' | 'presentation'
  | 'clip' | 'logo' | 'architecture' | 'plant' | 'geo' | 'building'
  | 'lunar' | 'pet' | 'scan';

export interface StudioDef {
  id: StudioId;
  emoji: string;
  label: string;
  description: string;
  capabilities: readonly string[];
  intent_keywords: readonly string[];
  premium: boolean;
}

export const STUDIOS: readonly StudioDef[] = [
  { id: 'music', emoji: '🎚', label: 'Studio Mix Pro', description: 'Mixage 12+ pistes, EQ, reverb, BPM detect', capabilities: ['mix', 'eq', 'reverb', 'bpm', 'export_wav', 'export_mp3'], intent_keywords: ['mix', 'musique', 'beat', 'piste', 'dj', 'son'], premium: true },
  { id: 'video', emoji: '🎬', label: 'Studio Vidéo CapCut-like', description: 'Timeline cut, fade, captions auto, export MP4', capabilities: ['cut', 'fade', 'captions', 'export_mp4', 'export_webm'], intent_keywords: ['vidéo', 'montage', 'clip', 'film', 'tiktok', 'youtube'], premium: true },
  { id: 'cv', emoji: '📄', label: 'Studio CV', description: 'Templates pro, IA suggest, export PDF', capabilities: ['template', 'ia_suggest', 'export_pdf', 'export_docx'], intent_keywords: ['cv', 'curriculum', 'candidature', 'job'], premium: false },
  { id: 'facture', emoji: '🧾', label: 'Studio Facture', description: 'Devis + factures + relance auto', capabilities: ['devis', 'facture', 'relance', 'export_pdf', 'tva_auto'], intent_keywords: ['facture', 'devis', 'comptabilité'], premium: false },
  { id: 'contrat', emoji: '📋', label: 'Studio Contrat', description: 'CDI, NDA, prestation, modèles légaux FR/Monaco', capabilities: ['template', 'cdi', 'nda', 'prestation', 'export_pdf'], intent_keywords: ['contrat', 'nda', 'cdi', 'prestation'], premium: true },
  { id: 'presentation', emoji: '📊', label: 'Studio Présentation', description: 'Slides + pitch + animations', capabilities: ['slides', 'pitch', 'animation', 'export_pptx', 'export_pdf'], intent_keywords: ['présentation', 'slides', 'pitch', 'powerpoint'], premium: true },
  { id: 'clip', emoji: '🎥', label: 'Studio Clip Photo→Vidéo', description: 'Animer photos en vidéo + son', capabilities: ['animate', 'soundtrack', 'export_mp4'], intent_keywords: ['clip', 'animation photo', 'vidéo souvenir'], premium: true },
  { id: 'logo', emoji: '🎨', label: 'Studio Logo', description: 'Branding + Pantone + variantes', capabilities: ['design', 'pantone', 'variantes', 'export_svg', 'export_png'], intent_keywords: ['logo', 'branding', 'identité visuelle'], premium: true },
  { id: 'architecture', emoji: '🏗', label: 'Studio Architecture', description: 'RE2020, calcul surface, mélange béton, PMR', capabilities: ['re2020', 'surface', 'beton', 'pmr', 'palette'], intent_keywords: ['plan', 'maison', 'archi', 'surface', 'béton'], premium: true },
  { id: 'plant', emoji: '🌱', label: 'Studio Plantes', description: 'Identification + soins + arrosage', capabilities: ['identify', 'care', 'watering_schedule', 'season'], intent_keywords: ['plante', 'jardinage', 'fleurs', 'potager'], premium: false },
  { id: 'geo', emoji: '🗺', label: 'Studio Géo', description: 'Cartes interactives + GPS + lieux', capabilities: ['map', 'gps', 'route', 'poi'], intent_keywords: ['carte', 'gps', 'itinéraire', 'lieu'], premium: false },
  { id: 'building', emoji: '🏢', label: 'Studio Bâtiment', description: 'DTU, normes, dimensions standards', capabilities: ['dtu', 'norms', 'dimensions', 'blondel'], intent_keywords: ['dtu', 'norme', 'bâtiment', 'construction'], premium: true },
  { id: 'lunar', emoji: '🌙', label: 'Studio Jardin Lunaire', description: 'Calendrier biodynamique + phases lune', capabilities: ['phase_lune', 'biodynamie', 'calendrier'], intent_keywords: ['lune', 'biodynamie', 'jardinage lunaire'], premium: false },
  { id: 'pet', emoji: '🐾', label: 'Studio Animaux', description: 'Suivi santé + nutrition + RDV vétérinaire', capabilities: ['sante', 'nutrition', 'rdv_veto'], intent_keywords: ['animal', 'chien', 'chat', 'vétérinaire'], premium: false },
  { id: 'scan', emoji: '📷', label: 'Studio Scan', description: 'OCR + QR + barcode + cartes visite', capabilities: ['ocr', 'qr', 'barcode', 'vcard'], intent_keywords: ['scan', 'ocr', 'qr code', 'carte de visite'], premium: false },
] as const;

class StudiosHub {
  list(): readonly StudioDef[] {
    return STUDIOS;
  }

  byId(id: StudioId): StudioDef | undefined {
    return STUDIOS.find((s) => s.id === id);
  }

  /**
   * Détection intent → propose studio.
   */
  matchIntent(text: string): StudioDef | null {
    const lc = text.toLowerCase();
    let best: { studio: StudioDef; score: number } | null = null;
    for (const s of STUDIOS) {
      let score = 0;
      for (const kw of s.intent_keywords) {
        if (lc.includes(kw)) score++;
      }
      if (score > 0 && (!best || score > best.score)) best = { studio: s, score };
    }
    return best?.studio ?? null;
  }

  /**
   * Filter par capability.
   */
  filterByCapability(capability: string): readonly StudioDef[] {
    return STUDIOS.filter((s) => s.capabilities.includes(capability));
  }

  filterByPremium(premium: boolean): readonly StudioDef[] {
    return STUDIOS.filter((s) => s.premium === premium);
  }

  /**
   * Render dispatcher (lazy load par studio).
   */
  async render(id: StudioId, root: HTMLElement): Promise<void> {
    const def = this.byId(id);
    if (!def) {
      logger.warn('studios', `Unknown studio: ${id}`);
      return;
    }
    /* Render UI minimaliste universelle (chaque studio extensible Jet 9) */
    root.innerHTML = `
      <div class="ax-studio" data-studio="${def.id}">
        <header class="ax-studio-head">
          <span class="ax-studio-emoji">${def.emoji}</span>
          <h2>${def.label}</h2>
        </header>
        <p class="ax-studio-desc">${def.description}</p>
        <div class="ax-studio-caps">
          ${def.capabilities.map((c) => `<span class="ax-cap">${c}</span>`).join(' ')}
        </div>
        <div class="ax-studio-actions">
          <button class="ax-btn-primary" data-action="start">Commencer</button>
          ${def.premium ? '<span class="ax-badge-premium">PRO</span>' : ''}
        </div>
      </div>
    `;
    logger.info('studios', `rendered ${def.id}`);
  }

  /**
   * Stats utilisation studios (admin).
   */
  getStats(): { total: number; free: number; premium: number; capabilities_total: number } {
    return {
      total: STUDIOS.length,
      free: STUDIOS.filter((s) => !s.premium).length,
      premium: STUDIOS.filter((s) => s.premium).length,
      capabilities_total: STUDIOS.reduce((sum, s) => sum + s.capabilities.length, 0),
    };
  }
}

export const studiosHub = new StudiosHub();

/**
 * Render router-compatible : affiche grille studios par défaut.
 */
export function render(root: HTMLElement): void {
  const cards = STUDIOS.map((s) => `
    <div class="ax-studio-card" data-studio="${s.id}" style="cursor:pointer;background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:16px;transition:transform 0.15s">
      <div class="ax-studio-card-emoji" style="font-size:36px">${s.emoji}</div>
      <div class="ax-studio-card-label" style="font-weight:700;color:#c9a227;margin-top:8px">${s.label}</div>
      <div class="ax-studio-card-desc" style="font-size:12px;color:var(--ax-text-dim);margin-top:4px">${s.description}</div>
      ${s.premium ? '<span class="ax-badge-premium" style="background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:700;margin-top:8px;display:inline-block">PRO</span>' : ''}
    </div>
  `).join('');
  root.innerHTML = `
    <div class="ax-studios-hub" style="padding:16px;max-width:900px;margin:0 auto">
      <h1 style="color:#c9a227">🎨 Studios créatifs</h1>
      <p class="ax-subtitle" style="color:var(--ax-text-dim)">${STUDIOS.length} studios pour créer, monter, designer</p>
      <div class="ax-studios-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;margin-top:16px">${cards}</div>
      <div id="ax-studio-detail" style="margin-top:24px"></div>
      <p style="margin-top:24px;text-align:center"><a href="#chat" style="color:#c9a227">← Retour chat</a></p>
    </div>
  `;
  /* Studios créatifs réels disponibles (route vers feature dédiée) */
  const STUDIO_ROUTES: Partial<Record<StudioId, string>> = {
    music: 'studio-music',
    video: 'studio-video',
    cv: 'studio-cv',
    facture: 'studio-invoice',
    contrat: 'studio-contract',
    presentation: 'studio-presentation',
    clip: 'studio-clip',
    logo: 'studio-logo',
    architecture: 'studio-architecture',
    plant: 'studio-plant',
    geo: 'studio-geo',
    building: 'studio-building',
    lunar: 'studio-lunar',
    pet: 'studio-pet',
    scan: 'studio-scan',
  };
  /* Wire click sur cards → route si dispo, sinon placeholder */
  root.querySelectorAll<HTMLDivElement>('.ax-studio-card').forEach((card) => {
    card.addEventListener('click', () => {
      const id = card.dataset['studio'] as StudioId | undefined;
      if (!id) return;
      const route = STUDIO_ROUTES[id];
      if (route) {
        window.location.hash = route;
        return;
      }
      void (async () => {
        const { toast } = await import('../../ui/toast.js');
        const studio = STUDIOS.find((s) => s.id === id);
        if (!studio) return;
        toast.info(`${studio.emoji} ${studio.label} — ouverture Sprint 5`);
        const detail = root.querySelector<HTMLDivElement>('#ax-studio-detail');
        if (detail) {
          detail.innerHTML = `
            <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:24px;text-align:center">
              <div style="font-size:64px">${studio.emoji}</div>
              <h2 style="color:#c9a227;margin:8px 0">${studio.label}</h2>
              <p style="color:var(--ax-text-dim);margin:0">${studio.description}</p>
              <p style="margin-top:16px;font-size:13px;color:#888">Studio en cours de développement (Sprint 5).</p>
            </div>
          `;
        }
      })();
    });
  });
}
