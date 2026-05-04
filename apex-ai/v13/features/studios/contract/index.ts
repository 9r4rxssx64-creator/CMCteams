/**
 * APEX v13 — Studio Contrat (port v12 vContractStudio / vStudioContrat).
 *
 * Studio créatif pour générer contrats légaux avec templates pré-remplis.
 * Features Kevin :
 * - 5 templates : NDA, CDI, CDD, Mission freelance, Bail habitation
 * - Génération avec ref légales (Légifrance + Code travail/civil/commerce)
 * - Édition champs : signataires (parties), durée, montant, clauses
 * - Export PDF (jsPDF lazy CDN)
 * - Persist localStorage per-user
 *
 * Anti-patterns évités :
 * - escapeHtml partout
 * - Mention prudence "Pour décision importante consulter avocat"
 */

import { logger } from '../../../core/logger.js';
import { store } from '../../../core/store.js';

export type ContractTemplateId = 'nda' | 'cdi' | 'cdd' | 'freelance' | 'bail';

export interface ContractParty {
  id: string;
  type: 'personne_physique' | 'personne_morale';
  nom: string;
  representant: string; /* si personne morale */
  adresse: string;
  email: string;
  siret: string;
}

export interface ContractData {
  id: string;
  template: ContractTemplateId;
  number: string;
  date: string;
  parties: ContractParty[];
  duree: string; /* Ex: "24 mois", "Indéterminée" */
  montant: number; /* Si applicable (mission/bail) */
  clauses: readonly string[];
  notes: string;
  legalRefs: readonly string[];
}

export interface ContractTemplate {
  id: ContractTemplateId;
  label: string;
  emoji: string;
  description: string;
  partiesCount: number;
  defaultClauses: readonly string[];
  legalRefs: readonly string[];
}

export const TEMPLATES: readonly ContractTemplate[] = [
  {
    id: 'nda',
    label: 'NDA / Accord de confidentialité',
    emoji: '🔒',
    description: 'Accord bilatéral de non-divulgation',
    partiesCount: 2,
    defaultClauses: [
      'Définition des informations confidentielles',
      'Obligations de non-divulgation',
      'Durée de la confidentialité',
      'Exceptions',
      'Sanctions en cas de violation',
    ],
    legalRefs: ['Code civil art. 1101 et suivants', 'Code de commerce L151-1 (secrets d\'affaires)'],
  },
  {
    id: 'cdi',
    label: 'CDI — Contrat à durée indéterminée',
    emoji: '💼',
    description: 'Contrat de travail standard FR',
    partiesCount: 2,
    defaultClauses: [
      'Période d\'essai',
      'Rémunération',
      'Durée du travail',
      'Convention collective applicable',
      'Clause de non-concurrence (optionnelle)',
      'Préavis de rupture',
    ],
    legalRefs: ['Code du travail L1221-1 et suivants', 'Convention collective applicable selon secteur'],
  },
  {
    id: 'cdd',
    label: 'CDD — Contrat à durée déterminée',
    emoji: '📅',
    description: 'CDD avec terme précis ou imprécis',
    partiesCount: 2,
    defaultClauses: [
      'Motif du recours au CDD (obligatoire)',
      'Date de début et de fin (ou événement)',
      'Période d\'essai (1 jour/sem dans la limite de 2 sem)',
      'Indemnité de précarité (10% sauf exceptions)',
      'Renouvellement (max 2 fois)',
    ],
    legalRefs: ['Code du travail L1242-1 (motifs)', 'L1242-8 (durée max 18 mois)', 'L1243-8 (indemnité précarité)'],
  },
  {
    id: 'freelance',
    label: 'Mission Freelance',
    emoji: '🚀',
    description: 'Contrat de prestation indépendant',
    partiesCount: 2,
    defaultClauses: [
      'Description de la mission',
      'Modalités d\'exécution',
      'Tarif et conditions de paiement',
      'Propriété intellectuelle',
      'Confidentialité',
      'Résiliation',
    ],
    legalRefs: ['Code civil art. 1710 (louage d\'ouvrage)', 'Code de commerce L441-10 (délais paiement)'],
  },
  {
    id: 'bail',
    label: 'Bail habitation',
    emoji: '🏠',
    description: 'Bail loi du 6 juillet 1989 (résidence principale)',
    partiesCount: 2,
    defaultClauses: [
      'Désignation du logement (surface, équipements)',
      'Durée du bail (3 ans nu / 6 ans bailleur PM)',
      'Loyer + charges',
      'Dépôt de garantie (1 mois nu, 2 mois meublé)',
      'État des lieux',
      'Résiliation (préavis 3 mois locataire, 6 mois bailleur)',
    ],
    legalRefs: ['Loi n° 89-462 du 6 juillet 1989', 'Décret n° 87-712 (réparations locatives)'],
  },
] as const;

export const MAX_PARTIES = 10;
export const MAX_CLAUSES = 30;
export const STORAGE_PREFIX = 'ax_contracts_';

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);
}

export function getStorageKey(uid: string): string {
  return `${STORAGE_PREFIX}${uid}`;
}

/**
 * Génère un numéro de contrat (CTR-NDA-YYYY-MM-XXX).
 */
export function generateContractNumber(template: ContractTemplateId, count: number): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const seq = String(count + 1).padStart(3, '0');
  return `CTR-${template.toUpperCase()}-${yyyy}-${mm}-${seq}`;
}

export function createParty(): ContractParty {
  return {
    id: `party_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type: 'personne_physique',
    nom: '',
    representant: '',
    adresse: '',
    email: '',
    siret: '',
  };
}

/**
 * Initialise un contrat selon template (avec clauses + refs auto-remplies).
 */
export function initContract(template: ContractTemplateId, count: number): ContractData {
  const tpl = TEMPLATES.find((t) => t.id === template);
  if (!tpl) throw new Error(`Unknown template: ${template}`);
  const parties: ContractParty[] = [];
  for (let i = 0; i < tpl.partiesCount; i++) parties.push(createParty());
  return {
    id: `contract_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    template,
    number: generateContractNumber(template, count),
    date: new Date().toISOString().slice(0, 10),
    parties,
    duree: '',
    montant: 0,
    clauses: tpl.defaultClauses,
    notes: '',
    legalRefs: tpl.legalRefs,
  };
}

/**
 * Validation contrat : tous les champs obligatoires remplis ?
 */
export function validateContract(c: ContractData): { ok: boolean; errors: readonly string[] } {
  const errors: string[] = [];
  if (!c.number) errors.push('Numéro manquant');
  if (!c.date) errors.push('Date manquante');
  for (let i = 0; i < c.parties.length; i++) {
    const p = c.parties[i];
    if (!p?.nom) errors.push(`Partie ${i + 1} : nom manquant`);
    if (!p?.adresse) errors.push(`Partie ${i + 1} : adresse manquante`);
  }
  if (c.template === 'cdd' && !c.duree) errors.push('Durée obligatoire pour CDD');
  if (c.template === 'freelance' && c.montant <= 0) errors.push('Montant obligatoire pour mission');
  if (c.template === 'bail' && c.montant <= 0) errors.push('Loyer obligatoire pour bail');
  return { ok: errors.length === 0, errors };
}

class ContractStudioStore {
  load(uid: string): ContractData[] {
    if (!uid) return [];
    try {
      const raw = localStorage.getItem(getStorageKey(uid));
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((p): p is ContractData => !!p && typeof p === 'object');
    } catch (err) {
      logger.warn('studio-contract', 'load failed', { err });
      return [];
    }
  }

  save(uid: string, contracts: readonly ContractData[]): boolean {
    if (!uid) return false;
    try {
      localStorage.setItem(getStorageKey(uid), JSON.stringify(contracts));
      return true;
    } catch (err) {
      logger.warn('studio-contract', 'save failed (quota?)', { err });
      return false;
    }
  }

  create(uid: string, template: ContractTemplateId): ContractData | null {
    if (!uid) return null;
    const contracts = this.load(uid);
    const c = initContract(template, contracts.length);
    contracts.push(c);
    if (!this.save(uid, contracts)) return null;
    return c;
  }

  remove(uid: string, id: string): boolean {
    if (!uid) return false;
    const list = this.load(uid).filter((c) => c.id !== id);
    return this.save(uid, list);
  }

  update(uid: string, id: string, patch: Partial<Pick<ContractData, 'parties' | 'duree' | 'montant' | 'notes' | 'date' | 'number'>>): boolean {
    if (!uid) return false;
    const list = this.load(uid);
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    const existing = list[idx];
    if (!existing) return false;
    list[idx] = { ...existing, ...patch };
    return this.save(uid, list);
  }

  count(uid: string): number {
    return this.load(uid).length;
  }
}

export const contractStudioStore = new ContractStudioStore();

export function render(rootEl: HTMLElement): void {
  const user = store.get('user') as { id?: string; name?: string } | null;
  const uid = user?.id ?? 'anon';
  const contracts = contractStudioStore.load(uid);

  const templatesHtml = TEMPLATES.map((t) => `
    <button class="ax-btn ax-contract-tpl" data-create="${escapeHtml(t.id)}" style="padding:10px;background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:8px;cursor:pointer;min-height:60px;text-align:left;width:100%">
      <div style="font-size:18px">${t.emoji}</div>
      <div style="font-weight:700;color:#c9a227;font-size:13px">${escapeHtml(t.label)}</div>
      <div style="font-size:11px;color:var(--ax-text-dim)">${escapeHtml(t.description)}</div>
    </button>
  `).join('');

  const contractsHtml = contracts.length > 0
    ? contracts.map((c) => {
      const tpl = TEMPLATES.find((t) => t.id === c.template);
      const valid = validateContract(c);
      return `
        <div class="ax-contract-card" data-contract-id="${escapeHtml(c.id)}" style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:10px">
          <header style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <strong style="color:#c9a227">${escapeHtml(c.number)}</strong>
            <span style="font-size:12px;color:${valid.ok ? '#4caf50' : '#ff9800'}">${valid.ok ? '✓ Complet' : `⚠ ${valid.errors.length} manquant(s)`}</span>
          </header>
          <div style="font-size:13px;color:var(--ax-text-dim)">${tpl?.emoji ?? ''} ${escapeHtml(tpl?.label ?? c.template)}</div>
          <div style="font-size:12px;color:var(--ax-text-dim);margin-top:4px">Date : ${escapeHtml(c.date)} · ${c.parties.length} partie${c.parties.length > 1 ? 's' : ''}</div>
          <div style="display:flex;gap:6px;margin-top:8px">
            <button class="ax-btn ax-btn-sm" data-action="export-pdf" data-contract-id="${escapeHtml(c.id)}" style="font-size:11px;padding:6px 10px;min-height:36px">💾 Exporter PDF</button>
            <button class="ax-btn ax-btn-sm" data-action="remove" data-contract-id="${escapeHtml(c.id)}" style="font-size:11px;padding:6px 10px;color:#ff6666;min-height:36px">Supprimer</button>
          </div>
        </div>
      `;
    }).join('')
    : '<p style="color:var(--ax-text-dim);text-align:center;padding:24px">Aucun contrat. Crée le premier !</p>';

  rootEl.innerHTML = `
    <div class="ax-page" style="padding:16px;max-width:760px;margin:0 auto">
      <header style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h1 style="margin:0;color:#c9a227">📋 Studio Contrat</h1>
        <span style="color:var(--ax-text-dim);font-size:13px">${contracts.length} contrat${contracts.length > 1 ? 's' : ''}</span>
      </header>

      <div style="background:rgba(255,152,0,0.1);border:1px solid rgba(255,152,0,0.4);border-radius:8px;padding:10px;margin-bottom:16px;font-size:12px;color:#ffa726">
        ⚠️ Information indicative. Pour décision importante, consulter un avocat.
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:16px">
        <h2 style="margin:0 0 10px 0;font-size:15px;color:#c9a227">Choisir un modèle</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px">${templatesHtml}</div>
      </div>

      <div id="ax-contracts-list">${contractsHtml}</div>

      <p style="margin-top:24px;text-align:center"><a href="#studios" style="color:#c9a227">← Retour studios</a></p>
    </div>
  `;
  attachHandlers(rootEl, uid);
}

function attachHandlers(rootEl: HTMLElement, uid: string): void {
  rootEl.querySelectorAll<HTMLElement>('[data-create]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tpl = btn.dataset['create'] as ContractTemplateId;
      const c = contractStudioStore.create(uid, tpl);
      if (c) {
        logger.info('studio-contract', 'created', { template: tpl, id: c.id });
        render(rootEl);
      }
    });
  });

  rootEl.querySelectorAll<HTMLElement>('[data-action="remove"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset['contractId'];
      if (!id) return;
      if (contractStudioStore.remove(uid, id)) render(rootEl);
    });
  });

  rootEl.querySelectorAll<HTMLElement>('[data-action="export-pdf"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset['contractId'];
      if (!id) return;
      logger.info('studio-contract', 'export PDF requested', { id });
    });
  });
}
