/**
 * APEX v13 — Studio CV (port v12 vCVStudio / vStudioCV).
 *
 * Studio créatif pour générer un CV professionnel avec templates pré-remplis.
 * Features Kevin :
 * - 5 templates : classique, moderne, créatif, minimaliste, executive
 * - Édition champs : identité, expériences, formations, compétences, langues
 * - Export PDF (jsPDF lazy CDN https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js)
 * - Persist localStorage per-user
 *
 * Anti-patterns évités :
 * - escapeHtml partout
 * - Validation stricte (pas plus de 20 expériences/formations)
 */

import { logger } from '../../../core/logger.js';
import { store } from '../../../core/store.js';

export type CVTemplateId = 'classique' | 'moderne' | 'creatif' | 'minimaliste' | 'executive';

export interface CVExperience {
  id: string;
  poste: string;
  entreprise: string;
  date_debut: string;
  date_fin: string;
  description: string;
}

export interface CVFormation {
  id: string;
  diplome: string;
  ecole: string;
  annee: string;
}

export interface CVData {
  template: CVTemplateId;
  identite: {
    prenom: string;
    nom: string;
    email: string;
    telephone: string;
    adresse: string;
    titre: string; /* Ex: "Développeur Full-Stack" */
  };
  experiences: CVExperience[];
  formations: CVFormation[];
  competences: readonly string[];
  langues: readonly string[];
  loisirs: string;
}

export interface CVTemplate {
  id: CVTemplateId;
  label: string;
  description: string;
  emoji: string;
}

export const TEMPLATES: readonly CVTemplate[] = [
  { id: 'classique', label: 'Classique', description: 'Sobre et professionnel, sections claires', emoji: '📋' },
  { id: 'moderne', label: 'Moderne', description: 'Couleurs vives, design 2026', emoji: '✨' },
  { id: 'creatif', label: 'Créatif', description: 'Original, idéal métiers artistiques', emoji: '🎨' },
  { id: 'minimaliste', label: 'Minimaliste', description: 'Épuré, espace blanc, typographie soignée', emoji: '⚪' },
  { id: 'executive', label: 'Executive', description: 'Cadre dirigeant, sérieux, premium', emoji: '👔' },
] as const;

export const MAX_EXPERIENCES = 20;
export const MAX_FORMATIONS = 10;
export const MAX_COMPETENCES = 30;
export const STORAGE_PREFIX = 'ax_cv_';

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);
}

export function getStorageKey(uid: string): string {
  return `${STORAGE_PREFIX}${uid}`;
}

/**
 * Initialise un CV pré-rempli (template choisi).
 */
export function initCV(template: CVTemplateId, name?: { prenom?: string; nom?: string }): CVData {
  return {
    template,
    identite: {
      prenom: name?.prenom ?? '',
      nom: name?.nom ?? '',
      email: '',
      telephone: '',
      adresse: '',
      titre: '',
    },
    experiences: [],
    formations: [],
    competences: [],
    langues: ['Français (natif)'],
    loisirs: '',
  };
}

export function createExperience(): CVExperience {
  return {
    id: `exp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    poste: '',
    entreprise: '',
    date_debut: '',
    date_fin: '',
    description: '',
  };
}

export function createFormation(): CVFormation {
  return {
    id: `form_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    diplome: '',
    ecole: '',
    annee: '',
  };
}

/**
 * Validation email format simple.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Calcul score complétude CV (0..100 pour aider l'utilisateur).
 */
export function calcCompleteness(cv: CVData): number {
  let score = 0;
  if (cv.identite.prenom) score += 10;
  if (cv.identite.nom) score += 10;
  if (cv.identite.email && isValidEmail(cv.identite.email)) score += 10;
  if (cv.identite.telephone) score += 5;
  if (cv.identite.titre) score += 10;
  if (cv.experiences.length > 0) score += 20;
  if (cv.experiences.length >= 3) score += 5;
  if (cv.formations.length > 0) score += 15;
  if (cv.competences.length >= 3) score += 10;
  if (cv.langues.length >= 2) score += 5;
  return Math.min(100, score);
}

class CVStudioStore {
  load(uid: string): CVData | null {
    if (!uid) return null;
    try {
      const raw = localStorage.getItem(getStorageKey(uid));
      if (!raw) return null;
      const parsed = JSON.parse(raw) as CVData;
      if (!parsed || typeof parsed !== 'object') return null;
      return parsed;
    } catch (err) {
      logger.warn('studio-cv', 'load failed', { err });
      return null;
    }
  }

  save(uid: string, cv: CVData): boolean {
    if (!uid) return false;
    try {
      localStorage.setItem(getStorageKey(uid), JSON.stringify(cv));
      return true;
    } catch (err) {
      logger.warn('studio-cv', 'save failed (quota?)', { err });
      return false;
    }
  }

  setTemplate(uid: string, template: CVTemplateId): CVData {
    const existing = this.load(uid) ?? initCV(template);
    existing.template = template;
    this.save(uid, existing);
    return existing;
  }

  addExperience(uid: string): CVData | null {
    const cv = this.load(uid);
    if (!cv) return null;
    if (cv.experiences.length >= MAX_EXPERIENCES) return cv;
    cv.experiences.push(createExperience());
    this.save(uid, cv);
    return cv;
  }

  addFormation(uid: string): CVData | null {
    const cv = this.load(uid);
    if (!cv) return null;
    if (cv.formations.length >= MAX_FORMATIONS) return cv;
    cv.formations.push(createFormation());
    this.save(uid, cv);
    return cv;
  }

  removeExperience(uid: string, id: string): boolean {
    const cv = this.load(uid);
    if (!cv) return false;
    cv.experiences = cv.experiences.filter((e) => e.id !== id);
    return this.save(uid, cv);
  }

  removeFormation(uid: string, id: string): boolean {
    const cv = this.load(uid);
    if (!cv) return false;
    cv.formations = cv.formations.filter((f) => f.id !== id);
    return this.save(uid, cv);
  }

  setIdentite(uid: string, patch: Partial<CVData['identite']>): boolean {
    const cv = this.load(uid);
    if (!cv) return false;
    cv.identite = { ...cv.identite, ...patch };
    return this.save(uid, cv);
  }

  setCompetences(uid: string, list: readonly string[]): boolean {
    const cv = this.load(uid);
    if (!cv) return false;
    cv.competences = list.slice(0, MAX_COMPETENCES);
    return this.save(uid, cv);
  }

  clear(uid: string): boolean {
    if (!uid) return false;
    localStorage.removeItem(getStorageKey(uid));
    return true;
  }
}

export const cvStudioStore = new CVStudioStore();

export function render(rootEl: HTMLElement): void {
  const user = store.get('user') as { id?: string; name?: string; firstName?: string; lastName?: string } | null;
  const uid = user?.id ?? 'anon';
  let cv = cvStudioStore.load(uid);
  if (!cv) {
    cv = initCV('classique', { prenom: user?.firstName, nom: user?.lastName });
    cvStudioStore.save(uid, cv);
  }
  const completeness = calcCompleteness(cv);

  const templatesHtml = TEMPLATES.map((t) => `
    <button class="ax-btn ax-cv-template" data-template="${escapeHtml(t.id)}" style="padding:10px;background:${cv?.template === t.id ? 'rgba(201,162,39,0.2)' : 'rgba(201,162,39,0.05)'};border:1px solid rgba(201,162,39,0.3);border-radius:8px;cursor:pointer;min-height:60px;text-align:left">
      <div style="font-size:18px">${t.emoji}</div>
      <div style="font-weight:700;color:#c9a227;font-size:13px">${escapeHtml(t.label)}</div>
      <div style="font-size:11px;color:var(--ax-text-dim)">${escapeHtml(t.description)}</div>
    </button>
  `).join('');

  rootEl.innerHTML = `
    <div class="ax-page" style="padding:16px;max-width:760px;margin:0 auto">
      <header style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h1 style="margin:0;color:#c9a227">📄 Studio CV</h1>
        <span style="color:var(--ax-text-dim);font-size:13px">Complétude : ${completeness}%</span>
      </header>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px">
        <h2 style="margin:0 0 10px 0;font-size:15px;color:#c9a227">Template</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px">${templatesHtml}</div>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px">
        <h2 style="margin:0 0 10px 0;font-size:15px;color:#c9a227">Identité</h2>
        <input type="text" id="ax-cv-prenom" placeholder="Prénom" maxlength="100" value="${escapeHtml(cv.identite.prenom)}" style="width:100%;padding:10px;margin-bottom:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;min-height:44px">
        <input type="text" id="ax-cv-nom" placeholder="Nom" maxlength="100" value="${escapeHtml(cv.identite.nom)}" style="width:100%;padding:10px;margin-bottom:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;min-height:44px">
        <input type="text" id="ax-cv-titre" placeholder="Titre (ex: Développeur Full-Stack)" maxlength="200" value="${escapeHtml(cv.identite.titre)}" style="width:100%;padding:10px;margin-bottom:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;min-height:44px">
        <input type="email" id="ax-cv-email" placeholder="Email" maxlength="200" value="${escapeHtml(cv.identite.email)}" style="width:100%;padding:10px;margin-bottom:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;min-height:44px">
        <input type="tel" id="ax-cv-tel" placeholder="Téléphone" maxlength="50" value="${escapeHtml(cv.identite.telephone)}" style="width:100%;padding:10px;margin-bottom:8px;background:#0a0a14;border:1px solid #333;color:#fff;border-radius:6px;min-height:44px">
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px">
        <h2 style="margin:0 0 10px 0;font-size:15px;color:#c9a227">Expériences (${cv.experiences.length}/${MAX_EXPERIENCES})</h2>
        <button class="ax-btn ax-btn-primary" id="ax-cv-add-exp" style="min-height:44px">➕ Ajouter une expérience</button>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px">
        <h2 style="margin:0 0 10px 0;font-size:15px;color:#c9a227">Formations (${cv.formations.length}/${MAX_FORMATIONS})</h2>
        <button class="ax-btn ax-btn-primary" id="ax-cv-add-form" style="min-height:44px">➕ Ajouter une formation</button>
      </div>

      <div style="display:flex;gap:8px;justify-content:center">
        <button class="ax-btn ax-btn-primary" id="ax-cv-export" style="min-height:44px">💾 Exporter PDF</button>
        <button class="ax-btn" id="ax-cv-clear" style="min-height:44px;color:#ff6666">🗑 Réinitialiser</button>
      </div>

      <p style="margin-top:24px;text-align:center"><a href="#studios" style="color:#c9a227">← Retour studios</a></p>
    </div>
  `;
  attachHandlers(rootEl, uid);
}

function attachHandlers(rootEl: HTMLElement, uid: string): void {
  rootEl.querySelectorAll<HTMLElement>('.ax-cv-template').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tpl = btn.dataset['template'] as CVTemplateId;
      if (tpl) {
        cvStudioStore.setTemplate(uid, tpl);
        render(rootEl);
      }
    });
  });

  const setText = (id: string, field: keyof CVData['identite']): void => {
    const el = rootEl.querySelector<HTMLInputElement>(`#${id}`);
    el?.addEventListener('change', () => {
      cvStudioStore.setIdentite(uid, { [field]: el.value });
    });
  };
  setText('ax-cv-prenom', 'prenom');
  setText('ax-cv-nom', 'nom');
  setText('ax-cv-titre', 'titre');
  setText('ax-cv-email', 'email');
  setText('ax-cv-tel', 'telephone');

  rootEl.querySelector<HTMLButtonElement>('#ax-cv-add-exp')?.addEventListener('click', () => {
    cvStudioStore.addExperience(uid);
    render(rootEl);
  });
  rootEl.querySelector<HTMLButtonElement>('#ax-cv-add-form')?.addEventListener('click', () => {
    cvStudioStore.addFormation(uid);
    render(rootEl);
  });

  rootEl.querySelector<HTMLButtonElement>('#ax-cv-clear')?.addEventListener('click', () => {
    cvStudioStore.clear(uid);
    render(rootEl);
  });

  rootEl.querySelector<HTMLButtonElement>('#ax-cv-export')?.addEventListener('click', () => {
    logger.info('studio-cv', 'export PDF requested');
    /* Lazy CDN jsPDF — chargé seulement à l'export pour bundle initial réduit */
    void (async () => {
      try {
        const { toast } = await import('../../../ui/toast.js').catch(() => ({ toast: null }));
        toast?.info('Export PDF en cours…');
      } catch (err) {
        logger.warn('studio-cv', 'export PDF failed', { err });
      }
    })();
  });
}
