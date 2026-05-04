/**
 * APEX v13 — Medical Pro Module (port v12 vMedicalPro)
 *
 * Niveau Vidal/professionnel santé :
 * - 6+ médicaments OTC France (DCI, posologie, contre-indications, interactions, grossesse)
 * - Calc IMC + métabolisme base (Mifflin-St Jeor)
 * - 9 urgences SAMU + actions
 * - 7 vaccins adulte
 *
 * DISCLAIMER LEGAL : information indicative uniquement.
 * Pour diagnostic et prescription, consulter un médecin.
 *
 * Sources autoritaires : Vidal, ANSM, Has-sante, Ameli
 */

import { logger } from '../../../../core/logger.js';

export interface OtcMedicament {
  dci: string;
  classe: string;
  posologie?: string;
  contre_indications?: readonly string[];
  interactions?: readonly string[];
  grossesse?: string;
  danger_overdose?: string;
  overdose?: string;
  usage?: string;
}

export interface UrgenceMedicale {
  action: string;
  risque?: string;
  details?: string;
}

export interface BmiCategorie {
  min: number;
  max: number;
  label: string;
}

export const AX_MEDICAL_FR = {
  sources: {
    vidal: 'https://www.vidal.fr',
    ansm: 'https://ansm.sante.fr',
    has_sante: 'https://www.has-sante.fr',
    ameli: 'https://www.ameli.fr',
    doctolib: 'https://www.doctolib.fr',
    sos_medecins: 'https://www.sosmedecins-france.fr',
    samu: '15',
    pompiers: '18',
    police: '17',
    urgence_europe: '112',
    pharmacie_garde: '32 37',
  } as Record<string, string>,
  otc: {
    doliprane: {
      dci: 'Paracetamol',
      classe: 'Antalgique-Antipyretique',
      posologie: '1g x 3-4/jour adulte',
      contre_indications: ['Insuffisance hepatique severe'],
      interactions: ['Alcool>3g/jour', 'Anticoagulants'],
      grossesse: 'Tous trimestres OK',
      danger_overdose: '4g/jour max - hepatotoxique > 6g',
    },
    ibuprofene: {
      dci: 'Ibuprofene',
      classe: 'AINS',
      posologie: '200-400mg x 3/jour',
      contre_indications: ['Ulcere', 'Insuf renale', 'Asthme aspirine', 'Grossesse 3T'],
      interactions: ['Anticoagulants', 'IEC', 'Diuretiques'],
      grossesse: 'Contre-indique T3',
      overdose: '1200mg/jour max',
    },
    aspirine: {
      dci: 'Acide acetylsalicylique',
      classe: 'AINS',
      posologie: '500mg x 3-4/j',
      contre_indications: ['<16ans (Reye)', 'Ulcere', 'Hemophilie'],
      grossesse: 'CI au T3',
    },
    smecta: {
      dci: 'Diosmectite',
      classe: 'Antidiarrheique',
      posologie: '3 sachets/jour 3 jours max',
      contre_indications: ['Enfant <2ans (plomb trace)'],
    },
    spasfon: {
      dci: 'Phloroglucinol',
      classe: 'Antispasmodique',
      posologie: '2cp x 3/j',
    },
    bepanthen: {
      dci: 'Dexpanthenol',
      classe: 'Cicatrisant cutane',
      usage: 'Brulures legeres, irritations',
    },
    aspegic: {
      dci: 'Acide acetylsalicylique',
      classe: 'AINS antalgique',
      posologie: '500-1000mg x 3/j max',
      contre_indications: ['Ulcere', 'Hemophilie', 'Grossesse 3T'],
    },
    nurofen: {
      dci: 'Ibuprofene',
      classe: 'AINS',
      posologie: '200-400mg x 3/j',
      contre_indications: ['Asthme aspirine', 'Ulcere'],
    },
  } as Record<string, OtcMedicament>,
  urgences: {
    'douleur thoracique': { action: '15 SAMU IMMEDIAT', risque: 'Infarctus' },
    'perte conscience': { action: '15 SAMU + PLS', risque: 'Multiple' },
    'essoufflement aigu': { action: '15 SAMU', risque: 'Embolie pulmonaire / OAP' },
    'saignement abondant': { action: '15 SAMU + compression', risque: 'Hemorragie' },
    'AVC suspecte (FAST)': {
      action: '15 SAMU URGENT',
      details: 'Face asymetrie, Arm faiblesse, Speech bafouille, Time',
    },
    convulsions: { action: '15 SAMU + PLS', risque: 'Crise' },
    intoxication: {
      action: 'Centre antipoison 04 91 75 25 25 (Marseille) ou 01 40 05 48 48 (Paris)',
    },
    'brulure etendue': { action: '15 SAMU + eau froide 20 min', risque: 'Choc' },
    'reaction allergique grave': {
      action: '15 SAMU + Anapen IM si dispo',
      risque: 'Anaphylaxie',
    },
  } as Record<string, UrgenceMedicale>,
  vaccins_adulte: {
    'DTP (Diphterie-Tetanos-Polio)':
      'Tous les 20 ans (25/45/65 ans), puis tous les 10 ans apres 65 ans',
    Coqueluche: 'Rappel 25 ans + chaque grossesse',
    'ROR (Rougeole-Oreillons-Rubeole)': 'Ne apres 1980 : 2 doses obligatoires',
    'Hepatite B': '3 doses si expose',
    Grippe: 'Annuel >65 ans ou comorbidites',
    'COVID-19': 'Selon recommandations HAS',
    Meningocoque: 'Si voyage zone endemique',
  } as Record<string, string>,
  bmi_categories: [
    { min: 0, max: 18.5, label: 'Maigreur' },
    { min: 18.5, max: 25, label: 'Normal' },
    { min: 25, max: 30, label: 'Surpoids' },
    { min: 30, max: 35, label: 'Obesite I' },
    { min: 35, max: 40, label: 'Obesite II' },
    { min: 40, max: Infinity, label: 'Obesite III morbide' },
  ] as readonly BmiCategorie[],
} as const;

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);
}

/**
 * IMC = poids (kg) / taille^2 (m).
 */
export function calcBmi(poids_kg: number, taille_m: number): {
  bmi: number;
  categorie: string;
  recommandation: string;
} | null {
  if (!poids_kg || !taille_m) return null;
  const b = poids_kg / (taille_m * taille_m);
  const c = AX_MEDICAL_FR.bmi_categories.find((x) => b >= x.min && b < x.max);
  return {
    bmi: Math.round(b * 10) / 10,
    categorie: c?.label ?? '?',
    recommandation:
      b > 30
        ? 'Consulter medecin pour suivi obesite'
        : b < 18.5
          ? 'Surveillance nutritionnelle recommandee'
          : 'Poids sante OK',
  };
}

/**
 * Métabolisme de base (Mifflin-St Jeor 1990) + maintenance selon activité.
 */
export function calcMetabolismeBase(
  poids_kg: number,
  taille_cm: number,
  age: number,
  sexe: 'homme' | 'femme'
): {
  metabolisme_kcal: number;
  maintenance_sedentaire: number;
  maintenance_actif: number;
  maintenance_sportif: number;
} {
  const bmr =
    sexe === 'homme'
      ? 10 * poids_kg + 6.25 * taille_cm - 5 * age + 5
      : 10 * poids_kg + 6.25 * taille_cm - 5 * age - 161;
  return {
    metabolisme_kcal: Math.round(bmr),
    maintenance_sedentaire: Math.round(bmr * 1.2),
    maintenance_actif: Math.round(bmr * 1.55),
    maintenance_sportif: Math.round(bmr * 1.725),
  };
}

/**
 * Date présumée d'accouchement (DPA = date dernières règles + 280j).
 */
export function calcDpp(date_dr: string): {
  date_presumee_accouchement: string;
  semaines_amenorrhee: number;
} {
  const dt = new Date(date_dr);
  dt.setDate(dt.getDate() + 280);
  return {
    date_presumee_accouchement: dt.toISOString().slice(0, 10),
    semaines_amenorrhee: Math.floor((Date.now() - new Date(date_dr).getTime()) / (7 * 86400000)),
  };
}

/**
 * Lookup médicament OTC. Si inconnu → URL Vidal.
 */
export function medicalLookup(nom: string): {
  nom: string;
  dci?: string;
  classe?: string;
  posologie?: string;
  contre_indications?: readonly string[];
  interactions?: readonly string[];
  grossesse?: string;
  danger_overdose?: string;
  overdose?: string;
  usage?: string;
  source?: string;
  vidal_url?: string;
  note?: string;
} {
  const k = String(nom || '').toLowerCase().trim();
  const i = AX_MEDICAL_FR.otc[k];
  if (i) return { nom, source: 'OTC France', ...i };
  return {
    nom,
    vidal_url: `https://www.vidal.fr/recherche/index.html?q=${encodeURIComponent(nom)}`,
    note: 'Consulter Vidal pour info detaillee',
  };
}

/**
 * Match urgence par mot-clé partiel.
 */
export function medicalUrgence(symptome: string): { symptome: string; action: string; risque?: string; details?: string; note?: string } {
  const k = String(symptome || '').toLowerCase().trim();
  for (const key of Object.keys(AX_MEDICAL_FR.urgences)) {
    const firstWord = key.toLowerCase().split(' ')[0] ?? '';
    if ((firstWord && k.includes(firstWord)) || key.toLowerCase().includes(k)) {
      const u = AX_MEDICAL_FR.urgences[key];
      if (u) return { symptome: key, ...u };
    }
  }
  return {
    symptome,
    action: 'En cas de doute appeler le 15 SAMU',
    note: 'Symptome non reconnu - consulter medecin',
  };
}

/**
 * Render UI premium Medical Pro avec disclaimer légal.
 */
export function render(root: HTMLElement): void {
  const urgencesHtml = Object.keys(AX_MEDICAL_FR.urgences)
    .map((k) => {
      const u = AX_MEDICAL_FR.urgences[k];
      if (!u) return '';
      return `<div style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.08)"><strong>${escapeHtml(k)}</strong><br><span style="color:#ff5858">${escapeHtml(u.action)}</span>${u.risque ? `<br><small>Risque: ${escapeHtml(u.risque)}</small>` : ''}${u.details ? `<br><small style="color:#999">${escapeHtml(u.details)}</small>` : ''}</div>`;
    })
    .join('');

  const vaccinsHtml = Object.keys(AX_MEDICAL_FR.vaccins_adulte)
    .map((v) => `<div style="margin:4px 0"><strong style="color:#ff8080">${escapeHtml(v)}</strong> : ${escapeHtml(AX_MEDICAL_FR.vaccins_adulte[v] ?? '')}</div>`)
    .join('');

  const sourcesHtml = Object.keys(AX_MEDICAL_FR.sources)
    .map((k) => {
      const v = AX_MEDICAL_FR.sources[k] ?? '';
      if (/^https?:/.test(v)) {
        return `<a href="${escapeHtml(v)}" target="_blank" rel="noopener" style="display:block;color:#5aa8ff;padding:4px 0;text-decoration:none">${escapeHtml(k.replace(/_/g, ' '))}</a>`;
      }
      return `<div style="padding:4px 0">📞 ${escapeHtml(k.replace(/_/g, ' '))} : <strong style="color:#ff5858">${escapeHtml(v)}</strong></div>`;
    })
    .join('');

  root.innerHTML = `
    <div style="padding:16px;max-width:900px;margin:0 auto;color:var(--ax-text,#eee)">
      <h2 style="background:linear-gradient(135deg,#ff5858,#ff8080);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-size:28px;margin-bottom:8px">⚕ Medical Pro</h2>
      <p style="color:var(--ax-text-dim,#999);font-size:13px;margin-bottom:16px">Vidal OTC &middot; IMC + métabolisme &middot; 9 urgences SAMU &middot; vaccins adulte</p>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:12px">
        <h3 style="color:#ff8080;margin:0 0 10px">📊 IMC + Métabolisme de base</h3>
        <input id="medP" type="number" placeholder="Poids (kg)" style="width:100%;padding:11px;font-size:14px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);color:#eee;border-radius:8px;margin-bottom:6px;min-height:44px" aria-label="Poids kg">
        <input id="medT" type="number" placeholder="Taille (cm, ex 175)" style="width:100%;padding:11px;font-size:14px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);color:#eee;border-radius:8px;margin-bottom:6px;min-height:44px" aria-label="Taille cm">
        <input id="medA" type="number" placeholder="Age" style="width:100%;padding:11px;font-size:14px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);color:#eee;border-radius:8px;margin-bottom:6px;min-height:44px" aria-label="Age">
        <select id="medS" style="width:100%;padding:11px;font-size:14px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);color:#eee;border-radius:8px;min-height:44px" aria-label="Sexe">
          <option value="homme">Homme</option><option value="femme">Femme</option>
        </select>
        <button id="medCalcBtn" type="button" style="width:100%;margin-top:8px;padding:12px;background:linear-gradient(135deg,#ff5858,#ff8080);color:#fff;border:0;border-radius:8px;font-weight:700;cursor:pointer;min-height:44px">Calculer</button>
        <div id="medResult" style="margin-top:10px;font-size:13px;line-height:1.7"></div>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:12px">
        <h3 style="color:#ff8080;margin:0 0 10px">💊 Info médicament (${Object.keys(AX_MEDICAL_FR.otc).length} OTC)</h3>
        <input id="medMed" type="text" placeholder="Doliprane, Ibuprofène, Aspirine..." style="width:100%;padding:11px;font-size:14px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);color:#eee;border-radius:8px;min-height:44px" aria-label="Nom médicament">
        <button id="medLookupBtn" type="button" style="width:100%;margin-top:8px;padding:12px;background:rgba(255,88,88,0.2);color:#ff8080;border:1px solid #ff5858;border-radius:8px;font-weight:600;cursor:pointer;min-height:44px">Rechercher</button>
        <div id="medMedResult" style="margin-top:10px;font-size:13px;line-height:1.7"></div>
      </div>

      <div style="background:rgba(201,162,39,0.05);border-left:4px solid #ff5858;border-radius:12px;padding:14px;margin-bottom:12px">
        <h3 style="color:#ff5858;margin:0 0 10px">🚨 Urgences (15 SAMU / 18 / 112)</h3>
        <div style="font-size:13px;line-height:1.6">${urgencesHtml}</div>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:12px">
        <h3 style="color:#ff8080;margin:0 0 10px">💉 Calendrier vaccinal adulte</h3>
        <div style="font-size:12px;line-height:1.7">${vaccinsHtml}</div>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:12px">
        <h3 style="color:#ff8080;margin:0 0 10px">🔗 Sources officielles : Vidal &middot; ANSM &middot; HAS &middot; Ameli</h3>
        <div style="font-size:13px">${sourcesHtml}</div>
      </div>

      <div class="ax-disclaimer" data-disclaimer="medical" style="margin-top:18px;padding:14px;background:rgba(255,88,88,0.08);border:1px solid rgba(255,88,88,0.3);border-radius:10px;font-size:12px;color:#ffaaaa;text-align:center">
        ⚠️ <strong>Information indicative uniquement</strong>. Pour décision importante, diagnostic ou prescription, consulter un professionnel qualifié (médecin, pharmacien).
      </div>
    </div>
  `;

  const calcBtn = root.querySelector<HTMLButtonElement>('#medCalcBtn');
  if (calcBtn) {
    calcBtn.addEventListener('click', () => {
      const p = parseFloat(root.querySelector<HTMLInputElement>('#medP')?.value ?? '') || 0;
      const tCm = parseFloat(root.querySelector<HTMLInputElement>('#medT')?.value ?? '') || 0;
      const a = parseFloat(root.querySelector<HTMLInputElement>('#medA')?.value ?? '') || 30;
      const s = (root.querySelector<HTMLSelectElement>('#medS')?.value ?? 'homme') as 'homme' | 'femme';
      const out = root.querySelector<HTMLDivElement>('#medResult');
      if (!out || !p || !tCm) return;
      const bmi = calcBmi(p, tCm / 100);
      const meta = calcMetabolismeBase(p, tCm, a, s);
      if (!bmi) {
        out.textContent = 'Données invalides';
        return;
      }
      out.innerHTML =
        `📊 IMC : <strong>${escapeHtml(String(bmi.bmi))}</strong> (${escapeHtml(bmi.categorie)})<br>${escapeHtml(bmi.recommandation)}` +
        `<br><br>🔥 Métabolisme base : <strong>${escapeHtml(String(meta.metabolisme_kcal))}</strong> kcal/jour<br>` +
        `Sédentaire : ${escapeHtml(String(meta.maintenance_sedentaire))} kcal<br>Actif : ${escapeHtml(String(meta.maintenance_actif))} kcal<br>Sportif : ${escapeHtml(String(meta.maintenance_sportif))} kcal`;
    });
  }

  const lookupBtn = root.querySelector<HTMLButtonElement>('#medLookupBtn');
  if (lookupBtn) {
    lookupBtn.addEventListener('click', () => {
      const m = root.querySelector<HTMLInputElement>('#medMed')?.value ?? '';
      const out = root.querySelector<HTMLDivElement>('#medMedResult');
      if (!out || !m) return;
      const info = medicalLookup(m);
      let r = `<strong>${escapeHtml(info.nom)}</strong>`;
      if (info.dci) r += ` (${escapeHtml(info.dci)})`;
      if (info.classe) r += `<br>📌 Classe : ${escapeHtml(info.classe)}`;
      if (info.posologie) r += `<br>💊 Posologie : ${escapeHtml(info.posologie)}`;
      if (info.contre_indications) r += `<br>🚫 CI : ${info.contre_indications.map(escapeHtml).join(', ')}`;
      if (info.interactions) r += `<br>⚠ Interactions : ${info.interactions.map(escapeHtml).join(', ')}`;
      if (info.grossesse) r += `<br>🤰 Grossesse : ${escapeHtml(info.grossesse)}`;
      if (info.danger_overdose ?? info.overdose) r += `<br>☠ Overdose : ${escapeHtml(info.danger_overdose ?? info.overdose ?? '')}`;
      if (info.vidal_url) r += `<br><a href="${escapeHtml(info.vidal_url)}" target="_blank" rel="noopener" style="color:#5aa8ff">→ Vidal complet</a>`;
      if (info.note) r += `<br><em style="color:#999">${escapeHtml(info.note)}</em>`;
      out.innerHTML = r;
    });
  }

  logger.info('medical-pro', 'rendered');
}
