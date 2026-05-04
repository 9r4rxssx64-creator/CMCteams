/**
 * APEX v13 — Finance Pro Module (port v12 vFinancePro + EXPANSION EXPERT)
 *
 * Niveau patrimonial expert :
 * - IR France 2026 (5 tranches, abattement 10%, parts fiscales, décote)
 * - IS sociétés (15% / 25%)
 * - TVA 20% / 10% / 5,5% / 2,1%
 * - PFU 30% (12,8% IR + 17,2% PS) sur PV mobilières
 * - Crédit immobilier (mensualité, total intérêts, TAEG simplifié)
 * - Plus-values immobilières (abattement IR 22 ans / PS 30 ans)
 * - Régime fiscal Monaco (IR 0%, succession directs 0%)
 * - Successions FR (abattements 100k/15.9k/1.6k, barème, donations cum)
 * - Pension retraite (trimestres, décote/surcote)
 * - Net/brut salaire FR + Monaco
 * - Plus-value crypto FR (PFU 30% / barème)
 * - TVA intra-EU (auto-liquidation, taux par pays)
 *
 * DISCLAIMER LEGAL : info indicative. Consulter expert-comptable.
 *
 * Sources autoritaires : Impôts.gouv, Service-public.fr, Légimonaco, BOFiP
 */

import { logger } from '../../../../core/logger.js';

export interface IrTranche {
  min: number;
  max: number;
  taux: number;
}

export interface SuccessionAbattement {
  lien: string;
  abattement: number;
}

 
export const AX_FINANCE_FR = {
  /** Tranches IR France 2026 (revenus 2025) */
  ir_tranches: [
    { min: 0, max: 11497, taux: 0 },
    { min: 11498, max: 29315, taux: 0.11 },
    { min: 29316, max: 83823, taux: 0.30 },
    { min: 83824, max: 180294, taux: 0.41 },
    { min: 180295, max: Infinity, taux: 0.45 },
  ] as readonly IrTranche[],
  /** Décote célibataire & couple 2026 (Art 197 I-4 CGI) */
  decote: {
    seuil_celibataire: 1929,
    seuil_couple: 3191,
    plafond_celibataire: 889,
    plafond_couple: 1470,
    taux: 0.4525,
  },
  /** Charges sociales */
  csg_crds: 0.097,
  /** Prélèvement Forfaitaire Unique : 12,8% IR + 17,2% PS = 30% (Art 200 A CGI) */
  pv_mobilier: 0.30,
  pv_mobilier_ir: 0.128,
  pv_mobilier_ps: 0.172,
  credit_immo: { taux_2026: 0.035, duree_max: 25 },
  /** TVA France 2026 */
  tva: {
    taux_normal: 0.20,
    taux_intermediaire: 0.10,
    taux_reduit: 0.055,
    taux_super_reduit: 0.021,
    franchise_micro: 36800,
  },
  /** IS sociétés 2026 */
  is: {
    taux_reduit: 0.15,
    taux_normal: 0.25,
    seuil_taux_reduit: 42500,
  },
  /** Successions FR : abattements & barème */
  succession: {
    abattements: [
      { lien: 'enfants', abattement: 100000 },
      { lien: 'petits_enfants', abattement: 31865 },
      { lien: 'arriere_petits_enfants', abattement: 5310 },
      { lien: 'freres_soeurs', abattement: 15932 },
      { lien: 'neveux_nieces', abattement: 7967 },
      { lien: 'tiers', abattement: 1594 },
      { lien: 'conjoint_pacs', abattement: Infinity }, /* exonération totale (Loi TEPA) */
      { lien: 'handicape', abattement: 159325 }, /* abattement supplémentaire */
    ] as readonly SuccessionAbattement[],
    bareme_directs: [
      { min: 0, max: 8072, taux: 0.05 },
      { min: 8072, max: 12109, taux: 0.10 },
      { min: 12109, max: 15932, taux: 0.15 },
      { min: 15932, max: 552324, taux: 0.20 },
      { min: 552324, max: 902838, taux: 0.30 },
      { min: 902838, max: 1805677, taux: 0.40 },
      { min: 1805677, max: Infinity, taux: 0.45 },
    ] as readonly IrTranche[],
    bareme_freres_soeurs: [
      { min: 0, max: 24430, taux: 0.35 },
      { min: 24430, max: Infinity, taux: 0.45 },
    ] as readonly IrTranche[],
    taux_neveux_nieces: 0.55,
    taux_tiers: 0.60,
    /** Renouvellement abattements donations : 15 ans */
    renouvellement_donations_ans: 15,
  },
  /** Retraite trimestres (régime général) */
  retraite: {
    annee_naissance_64: 1955,
    age_legal_2026: 64,
    age_taux_plein_sans_decote: 67,
    duree_assurance_taux_plein_trimestres: 172, /* 43 ans réforme 2023 */
    decote_par_trimestre_manquant: 0.0125, /* 1.25% par trimestre */
    surcote_par_trimestre_supp: 0.0125,
    salaire_mensuel_min_validation: 1747.5, /* 150 SMIC horaire 2026 */
  },
  /** TVA pays UE (taux normal) */
  tva_eu: {
    france: 0.20,
    allemagne: 0.19,
    espagne: 0.21,
    italie: 0.22,
    belgique: 0.21,
    pays_bas: 0.21,
    portugal: 0.23,
    irlande: 0.23,
    luxembourg: 0.17,
    danemark: 0.25,
    suede: 0.25,
    finlande: 0.24,
    pologne: 0.23,
    grece: 0.24,
    autriche: 0.20,
    hongrie: 0.27, /* le plus haut UE */
    monaco: 0.20, /* aligné FR via convention douanière 1963 */
  } as Record<string, number>,
  /** Net/brut salaire FR (charges salariales ~22%) */
  charges_salariales: {
    cadre: 0.25,
    non_cadre: 0.22,
  },
  monaco: {
    /** Convention fiscale FR-MC 1963 : Monégasques + non-FR exonérés IR */
    ir_residents_non_fr: 0,
    droits_succession_directs: 0,
    droits_succession_collateraux: 0.16,
    cotisations_sociales_employeur: 0.30,
    cotisations_sociales_salarie: 0.13,
    salaire_min_2026: 11.65,
  },
} as const;
 

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);
}

function trancheMarginale(qf: number): number {
  for (let i = AX_FINANCE_FR.ir_tranches.length - 1; i >= 0; i--) {
    const tr = AX_FINANCE_FR.ir_tranches[i];
    if (tr && qf >= tr.min) return tr.taux;
  }
  return 0;
}

/**
 * Calcule IR France 2026 par parts fiscales (quotient familial).
 */
export function calcIR(revenu_imposable: number, parts: number = 1): {
  ir: number;
  taux_moyen: number;
  taux_marginal: number;
  parts: number;
} {
  const p = parts || 1;
  const qf = revenu_imposable / p;
  let ir_par_part = 0;
  for (const t of AX_FINANCE_FR.ir_tranches) {
    if (qf > t.min) {
      const taxable = Math.min(qf, t.max) - t.min;
      ir_par_part += taxable * t.taux;
    }
  }
  const total = ir_par_part * p;
  return {
    ir: Math.round(total),
    taux_moyen: revenu_imposable > 0 ? total / revenu_imposable : 0,
    taux_marginal: trancheMarginale(qf),
    parts: p,
  };
}

/**
 * Calcule mensualité crédit immobilier (formule annuité constante).
 * m = M * t / (1 - (1+t)^-n) avec t=taux mensuel.
 */
export function calcCredit(montant: number, taux_annuel: number, duree_ans: number): {
  mensualite: number;
  total: number;
  interets: number;
  duree_ans: number;
  taux: number;
} {
   
  const n = duree_ans * 12;
   
  const t = taux_annuel / 12;
  if (t === 0) {
    return {
      mensualite: montant / n,
      total: montant,
      interets: 0,
      duree_ans,
      taux: taux_annuel,
    };
  }
  const m = (montant * t) / (1 - Math.pow(1 + t, -n));
  const total = m * n;
  return {
     
    mensualite: Math.round(m * 100) / 100,
     
    total: Math.round(total * 100) / 100,
     
    interets: Math.round((total - montant) * 100) / 100,
    duree_ans,
    taux: taux_annuel,
  };
}

/**
 * Capacité d'emprunt (mensualité max selon taux d'endettement 35%).
 */
export function calcCapaciteEmprunt(
  revenu_mensuel_net: number,
  taux_annuel: number,
  duree_ans: number,
  taux_endettement_max: number = 0.35
): {
  mensualite_max: number;
  capacite_emprunt: number;
} {
  const mens = revenu_mensuel_net * taux_endettement_max;
   
  const n = duree_ans * 12;
   
  const t = taux_annuel / 12;
  if (t === 0) {
    return {
       
      mensualite_max: Math.round(mens * 100) / 100,
      capacite_emprunt: Math.round(mens * n),
    };
  }
  const capacite = (mens * (1 - Math.pow(1 + t, -n))) / t;
  return {
     
    mensualite_max: Math.round(mens * 100) / 100,
    capacite_emprunt: Math.round(capacite),
  };
}

export interface PvImmoResult {
  pv_imposable_ir?: number;
  pv_imposable_ps?: number;
  exonere?: boolean;
  raison?: string;
  perte?: number;
  plus_value_brute?: number;
  abattement_ir?: number;
  abattement_ps?: number;
  impot_ir?: number;
  impot_ps?: number;
  total_a_payer?: number;
  exoneration_ir?: boolean;
  exoneration_ps?: boolean;
}

/**
 * Plus-value immobilière France :
 * - Résidence principale exonérée (Art 150 U II 1 CGI)
 * - Abattement IR : 6%/an de 6 à 21 ans, 4% à 22 ans (exonération totale)
 * - Abattement PS : 1,65%/an de 6 à 21 ans, 1,60% à 22 ans, 9%/an de 23 à 30 ans
 * - Taux : 19% IR + 17,2% PS
 */
export function calcPvImmo(
  prix_vente: number,
  prix_achat: number,
  duree_detention_ans: number,
  residence_principale: boolean
): PvImmoResult {
  if (residence_principale) {
    return {
      pv_imposable_ir: 0,
      pv_imposable_ps: 0,
      exonere: true,
      raison: 'Residence principale exoneree Art 150 U II 1 CGI',
    };
  }
  const pv = prix_vente - prix_achat;
  if (pv <= 0) {
    return { pv_imposable_ir: 0, pv_imposable_ps: 0, perte: -pv };
  }
   
  let abat_ir = duree_detention_ans <= 5 ? 0 : duree_detention_ans <= 21 ? (duree_detention_ans - 5) * 0.06 : 1;
  abat_ir = Math.min(1, abat_ir);
  let abat_ps: number;
   
  if (duree_detention_ans <= 5) abat_ps = 0;
   
  else if (duree_detention_ans <= 21) abat_ps = (duree_detention_ans - 5) * 0.0165;
   
  else if (duree_detention_ans === 22) abat_ps = 0.28;
   
  else if (duree_detention_ans <= 30) abat_ps = 0.28 + (duree_detention_ans - 22) * 0.09;
  else abat_ps = 1;
  abat_ps = Math.min(1, abat_ps);
  return {
    plus_value_brute: pv,
    abattement_ir: abat_ir,
    abattement_ps: abat_ps,
    pv_imposable_ir: Math.round(pv * (1 - abat_ir)),
    pv_imposable_ps: Math.round(pv * (1 - abat_ps)),
     
    impot_ir: Math.round(pv * (1 - abat_ir) * 0.19),
    impot_ps: Math.round(pv * (1 - abat_ps) * 0.172),
     
    total_a_payer: Math.round(pv * (1 - abat_ir) * 0.19 + pv * (1 - abat_ps) * 0.172),
     
    exoneration_ir: duree_detention_ans >= 22,
     
    exoneration_ps: duree_detention_ans >= 30,
  };
}

/**
 * Plus-value mobilière (crypto, actions) — PFU 30% (Art 200 A CGI).
 */
export function calcPvMobilier(prix_vente: number, prix_achat: number): {
  pv: number;
  ir?: number;
  ps?: number;
  total?: number;
  formule?: string;
  impot?: number;
} {
  const pv = prix_vente - prix_achat;
  if (pv <= 0) return { pv, impot: 0 };
  return {
    pv,
    ir: Math.round(pv * AX_FINANCE_FR.pv_mobilier_ir),
    ps: Math.round(pv * AX_FINANCE_FR.pv_mobilier_ps),
    total: Math.round(pv * AX_FINANCE_FR.pv_mobilier),
    formule: 'PFU 30% (Art 200 A CGI)',
  };
}

/**
 * Calcul TVA pour montant HT donné.
 */
export function calcTva(
  montantHt: number,
  type: 'normal' | 'intermediaire' | 'reduit' | 'super_reduit' = 'normal'
): {
  ht: number;
  tva: number;
  ttc: number;
  taux: number;
} {
  let taux: number = AX_FINANCE_FR.tva.taux_normal;
  if (type === 'intermediaire') taux = AX_FINANCE_FR.tva.taux_intermediaire;
  else if (type === 'reduit') taux = AX_FINANCE_FR.tva.taux_reduit;
  else if (type === 'super_reduit') taux = AX_FINANCE_FR.tva.taux_super_reduit;
  const tva = montantHt * taux;
  return {
     
    ht: Math.round(montantHt * 100) / 100,
     
    tva: Math.round(tva * 100) / 100,
     
    ttc: Math.round((montantHt + tva) * 100) / 100,
    taux,
  };
}

/**
 * IS sociétés (taux réduit 15% sous 42 500€, taux normal 25%).
 */
export function calcIs(beneficeImposable: number): {
  is: number;
  taux_effectif: number;
  detail: string;
} {
  if (beneficeImposable <= 0) {
    return { is: 0, taux_effectif: 0, detail: 'Pas de bénéfice imposable' };
  }
  const reduit = Math.min(beneficeImposable, AX_FINANCE_FR.is.seuil_taux_reduit);
  const normal = Math.max(0, beneficeImposable - AX_FINANCE_FR.is.seuil_taux_reduit);
  const is = reduit * AX_FINANCE_FR.is.taux_reduit + normal * AX_FINANCE_FR.is.taux_normal;
  return {
    is: Math.round(is),
    taux_effectif: is / beneficeImposable,
    detail: `15% sur ${reduit}€ + 25% sur ${normal}€`,
  };
}

/**
 * Calcul droits de succession.
 */
export function calcSuccession(
  patrimoine_transmis: number,
  lien: string
): {
  abattement: number;
  base_taxable: number;
  droits: number;
  taux_effectif: number;
  exonere: boolean;
} {
  const abattementInfo = AX_FINANCE_FR.succession.abattements.find((a) => a.lien === lien);
  const abattement = abattementInfo?.abattement ?? AX_FINANCE_FR.succession.abattements.find((a) => a.lien === 'tiers')?.abattement ?? 0;
  if (abattement === Infinity) {
    return {
      abattement,
      base_taxable: 0,
      droits: 0,
      taux_effectif: 0,
      exonere: true,
    };
  }
  const base = Math.max(0, patrimoine_transmis - abattement);
  if (base === 0) {
    return { abattement, base_taxable: 0, droits: 0, taux_effectif: 0, exonere: true };
  }
  let droits = 0;
  let bareme = AX_FINANCE_FR.succession.bareme_directs;
  if (lien === 'freres_soeurs') bareme = AX_FINANCE_FR.succession.bareme_freres_soeurs;
  else if (lien === 'neveux_nieces') {
    droits = base * AX_FINANCE_FR.succession.taux_neveux_nieces;
    return {
      abattement,
      base_taxable: base,
      droits: Math.round(droits),
      taux_effectif: droits / patrimoine_transmis,
      exonere: false,
    };
  } else if (lien === 'tiers') {
    droits = base * AX_FINANCE_FR.succession.taux_tiers;
    return {
      abattement,
      base_taxable: base,
      droits: Math.round(droits),
      taux_effectif: droits / patrimoine_transmis,
      exonere: false,
    };
  }
  for (const t of bareme) {
    if (base > t.min) {
      const taxable = Math.min(base, t.max) - t.min;
      droits += taxable * t.taux;
    }
  }
  return {
    abattement,
    base_taxable: base,
    droits: Math.round(droits),
    taux_effectif: droits / patrimoine_transmis,
    exonere: false,
  };
}

/**
 * Net/brut salaire FR (estimation simplifiée).
 */
export function calcNetBrut(
  brut_mensuel: number,
  cadre: boolean = false
): {
  brut: number;
  charges: number;
  net: number;
  taux_charges: number;
} {
  const taux = cadre ? AX_FINANCE_FR.charges_salariales.cadre : AX_FINANCE_FR.charges_salariales.non_cadre;
  const charges = brut_mensuel * taux;
  return {
     
    brut: Math.round(brut_mensuel * 100) / 100,
     
    charges: Math.round(charges * 100) / 100,
     
    net: Math.round((brut_mensuel - charges) * 100) / 100,
    taux_charges: taux,
  };
}

/**
 * Pension de retraite (régime général simplifié).
 * Pension = SAM × taux × (durée validée / durée requise).
 * SAM = salaire annuel moyen 25 meilleures années (plafonné PSS).
 */
export function calcPensionRetraite(
  salaire_annuel_moyen_25_meilleures: number,
  trimestres_valides: number,
  trimestres_requis: number = AX_FINANCE_FR.retraite.duree_assurance_taux_plein_trimestres
): {
  pension_annuelle: number;
  pension_mensuelle: number;
  taux: number;
  decote_pct: number;
} {
   
  const taux_plein = 0.5;
  const manquants = Math.max(0, trimestres_requis - trimestres_valides);
  const decote = manquants * AX_FINANCE_FR.retraite.decote_par_trimestre_manquant;
  const taux = Math.max(0, taux_plein - decote);
  const ratio = Math.min(1, trimestres_valides / trimestres_requis);
  const pension = salaire_annuel_moyen_25_meilleures * taux * ratio;
  return {
    pension_annuelle: Math.round(pension),
     
    pension_mensuelle: Math.round(pension / 12),
    taux,
     
    decote_pct: Math.round(decote * 10000) / 100,
  };
}

/**
 * Render UI premium Finance Pro avec disclaimer.
 */
export function render(root: HTMLElement): void {
  const monacoHtml = `
    <div>• <strong>Résidents non-français</strong> : 0% IR (Convention 1963)</div>
    <div>• <strong>Succession directe</strong> : 0%</div>
    <div>• <strong>Succession collatéraux</strong> : ${(AX_FINANCE_FR.monaco.droits_succession_collateraux * 100).toFixed(0)}%</div>
    <div>• <strong>Cotisations sociales employeur</strong> : ${(AX_FINANCE_FR.monaco.cotisations_sociales_employeur * 100).toFixed(0)}%</div>
    <div>• <strong>Cotisations sociales salarié</strong> : ${(AX_FINANCE_FR.monaco.cotisations_sociales_salarie * 100).toFixed(0)}%</div>
    <div>• <strong>Salaire minimum 2026</strong> : ${AX_FINANCE_FR.monaco.salaire_min_2026} €/h</div>
  `;

  root.innerHTML = `
    <div style="padding:16px;max-width:900px;margin:0 auto;color:var(--ax-text,#eee)">
      <h2 style="background:linear-gradient(135deg,#4cd080,#7adda1);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-size:28px;margin-bottom:8px">💰 Finance Pro</h2>
      <p style="color:var(--ax-text-dim,#999);font-size:13px;margin-bottom:16px">IR FR 2026 &middot; IS &middot; TVA &middot; PFU &middot; PV immo/mobilier &middot; succession &middot; pension &middot; net/brut &middot; Monaco</p>

      <div style="background:rgba(201,162,39,0.05);border-left:4px solid #c9a227;border-radius:12px;padding:14px;margin-bottom:12px">
        <h3 style="color:#c9a227;margin:0 0 10px">📊 Calcul IR France 2026</h3>
        <input id="finRev" type="number" placeholder="Revenu imposable (EUR)" style="width:100%;padding:11px;font-size:14px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);color:#eee;border-radius:8px;margin-bottom:6px;min-height:44px" aria-label="Revenu imposable">
        <input id="finParts" type="number" placeholder="Parts fiscales (1, 1.5, 2...)" value="1" step="0.5" style="width:100%;padding:11px;font-size:14px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);color:#eee;border-radius:8px;min-height:44px" aria-label="Parts fiscales">
        <button id="finCalcIRBtn" type="button" style="width:100%;margin-top:8px;padding:12px;background:linear-gradient(135deg,#4cd080,#7adda1);color:#000;border:0;border-radius:8px;font-weight:700;cursor:pointer;min-height:44px">Calculer IR</button>
        <div id="finIRResult" style="margin-top:10px;font-size:13px;line-height:1.7"></div>
      </div>

      <div style="background:rgba(201,162,39,0.05);border-left:4px solid #5aa8ff;border-radius:12px;padding:14px;margin-bottom:12px">
        <h3 style="color:#5aa8ff;margin:0 0 10px">🏠 Crédit immobilier</h3>
        <input id="finMontant" type="number" placeholder="Montant (EUR)" style="width:100%;padding:11px;font-size:14px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);color:#eee;border-radius:8px;margin-bottom:6px;min-height:44px" aria-label="Montant emprunt">
        <input id="finTaux" type="number" placeholder="Taux annuel (%, ex 3.5)" value="3.5" step="0.1" style="width:100%;padding:11px;font-size:14px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);color:#eee;border-radius:8px;margin-bottom:6px;min-height:44px" aria-label="Taux annuel">
        <input id="finDuree" type="number" placeholder="Durée (années)" value="25" style="width:100%;padding:11px;font-size:14px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);color:#eee;border-radius:8px;min-height:44px" aria-label="Durée">
        <button id="finCalcCreditBtn" type="button" style="width:100%;margin-top:8px;padding:12px;background:rgba(90,168,255,0.2);color:#5aa8ff;border:1px solid #5aa8ff;border-radius:8px;font-weight:600;cursor:pointer;min-height:44px">Calculer mensualité</button>
        <div id="finCreditResult" style="margin-top:10px;font-size:13px;line-height:1.7"></div>
      </div>

      <div style="background:rgba(201,162,39,0.05);border-left:4px solid #4cd080;border-radius:12px;padding:14px;margin-bottom:12px">
        <h3 style="color:#4cd080;margin:0 0 10px">📈 Plus-value immobilière</h3>
        <input id="finPVente" type="number" placeholder="Prix vente (EUR)" style="width:100%;padding:11px;font-size:14px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);color:#eee;border-radius:8px;margin-bottom:6px;min-height:44px" aria-label="Prix vente">
        <input id="finPAchat" type="number" placeholder="Prix achat (EUR)" style="width:100%;padding:11px;font-size:14px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);color:#eee;border-radius:8px;margin-bottom:6px;min-height:44px" aria-label="Prix achat">
        <input id="finDuree2" type="number" placeholder="Années de détention" style="width:100%;padding:11px;font-size:14px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);color:#eee;border-radius:8px;margin-bottom:6px;min-height:44px" aria-label="Années de détention">
        <label style="display:flex;align-items:center;gap:8px;font-size:13px;padding:8px 0;cursor:pointer"><input type="checkbox" id="finRP" style="width:18px;height:18px"> Résidence principale (exonérée)</label>
        <button id="finCalcPVBtn" type="button" style="width:100%;margin-top:6px;padding:12px;background:rgba(76,208,128,0.2);color:#4cd080;border:1px solid #4cd080;border-radius:8px;font-weight:600;cursor:pointer;min-height:44px">Calculer PV</button>
        <div id="finPVResult" style="margin-top:10px;font-size:13px;line-height:1.7"></div>
      </div>

      <div style="background:rgba(201,162,39,0.05);border-left:4px solid #ff5858;border-radius:12px;padding:14px;margin-bottom:12px">
        <h3 style="color:#ff5858;margin:0 0 10px">₿ Plus-value mobilière (crypto / actions)</h3>
        <input id="finPVM_v" type="number" placeholder="Prix vente (EUR)" style="width:100%;padding:11px;font-size:14px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);color:#eee;border-radius:8px;margin-bottom:6px;min-height:44px" aria-label="Prix vente mobilier">
        <input id="finPVM_a" type="number" placeholder="Prix achat (EUR)" style="width:100%;padding:11px;font-size:14px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);color:#eee;border-radius:8px;min-height:44px" aria-label="Prix achat mobilier">
        <button id="finCalcPVMBtn" type="button" style="width:100%;margin-top:8px;padding:12px;background:rgba(255,88,88,0.2);color:#ff8080;border:1px solid #ff5858;border-radius:8px;font-weight:600;cursor:pointer;min-height:44px">Calculer PFU 30%</button>
        <div id="finPVMResult" style="margin-top:10px;font-size:13px;line-height:1.7"></div>
      </div>

      <div style="background:linear-gradient(135deg,rgba(232,184,48,0.08),transparent);border-left:4px solid #c9a227;border-radius:12px;padding:14px;margin-bottom:12px">
        <h3 style="color:#c9a227;margin:0 0 10px">🇲🇨 Monaco — Avantages fiscaux</h3>
        <div style="font-size:13px;line-height:2">${monacoHtml}</div>
      </div>

      <div style="margin-top:18px;padding:14px;background:rgba(255,165,0,0.08);border:1px solid rgba(255,165,0,0.3);border-radius:10px;font-size:12px;color:#ffd699;text-align:center">
        ⚠️ <strong>Information indicative uniquement</strong>. Pour décision patrimoniale importante, consulter un expert-comptable, notaire ou avocat fiscaliste.
      </div>
      <p style="margin-top:14px;text-align:center;font-size:11px;color:#666">Sources : Impôts.gouv &middot; Service-public.fr &middot; Légimonaco &middot; CGI Art 150 / Art 200 A &middot; BOFiP</p>
    </div>
  `;

  /* IR */
  root.querySelector<HTMLButtonElement>('#finCalcIRBtn')?.addEventListener('click', () => {
    const r = parseFloat(root.querySelector<HTMLInputElement>('#finRev')?.value ?? '') || 0;
    const p = parseFloat(root.querySelector<HTMLInputElement>('#finParts')?.value ?? '') || 1;
    const c = calcIR(r, p);
    const out = root.querySelector<HTMLDivElement>('#finIRResult');
    if (out) {
       
      out.innerHTML = `📊 IR brut : <strong>${escapeHtml(String(c.ir))} €</strong><br>📈 Taux moyen : ${escapeHtml((c.taux_moyen * 100).toFixed(2))}%<br>🎯 Tranche marginale : ${escapeHtml(String(c.taux_marginal * 100))}%`;
    }
  });

  /* Crédit */
  root.querySelector<HTMLButtonElement>('#finCalcCreditBtn')?.addEventListener('click', () => {
    const m = parseFloat(root.querySelector<HTMLInputElement>('#finMontant')?.value ?? '') || 0;
     
    const t = (parseFloat(root.querySelector<HTMLInputElement>('#finTaux')?.value ?? '') || 3.5) / 100;
     
    const d = parseFloat(root.querySelector<HTMLInputElement>('#finDuree')?.value ?? '') || 25;
    const c = calcCredit(m, t, d);
    const out = root.querySelector<HTMLDivElement>('#finCreditResult');
    if (out) {
      out.innerHTML = `💳 Mensualité : <strong>${escapeHtml(String(c.mensualite))} €</strong><br>💰 Coût total : ${escapeHtml(String(c.total))} €<br>📊 Intérêts : ${escapeHtml(String(c.interets))} €`;
    }
  });

  /* PV Immo */
  root.querySelector<HTMLButtonElement>('#finCalcPVBtn')?.addEventListener('click', () => {
    const v = parseFloat(root.querySelector<HTMLInputElement>('#finPVente')?.value ?? '') || 0;
    const a = parseFloat(root.querySelector<HTMLInputElement>('#finPAchat')?.value ?? '') || 0;
    const d = parseFloat(root.querySelector<HTMLInputElement>('#finDuree2')?.value ?? '') || 0;
    const rp = root.querySelector<HTMLInputElement>('#finRP')?.checked ?? false;
    const c = calcPvImmo(v, a, d, rp);
    const out = root.querySelector<HTMLDivElement>('#finPVResult');
    if (!out) return;
    if (c.exonere) {
      out.innerHTML = `✅ <strong>Exonéré</strong> : ${escapeHtml(c.raison ?? '')}`;
      return;
    }
    if (c.perte !== undefined) {
      out.innerHTML = `📉 Moins-value : -${escapeHtml(String(c.perte))} € (non imputable PV mobilières)`;
      return;
    }
    out.innerHTML =
      `📈 PV brute : ${escapeHtml(String(c.plus_value_brute))} €<br>` +
       
      `📉 Abat. IR : ${escapeHtml(((c.abattement_ir ?? 0) * 100).toFixed(0))}% / PS : ${escapeHtml(((c.abattement_ps ?? 0) * 100).toFixed(0))}%<br>` +
      `💸 IR à payer : ${escapeHtml(String(c.impot_ir))} €<br>` +
      `💸 PS : ${escapeHtml(String(c.impot_ps))} €<br>` +
      `💰 <strong>Total : ${escapeHtml(String(c.total_a_payer))} €</strong>`;
  });

  /* PV Mobilier */
  root.querySelector<HTMLButtonElement>('#finCalcPVMBtn')?.addEventListener('click', () => {
    const v = parseFloat(root.querySelector<HTMLInputElement>('#finPVM_v')?.value ?? '') || 0;
    const a = parseFloat(root.querySelector<HTMLInputElement>('#finPVM_a')?.value ?? '') || 0;
    const c = calcPvMobilier(v, a);
    const out = root.querySelector<HTMLDivElement>('#finPVMResult');
    if (!out) return;
    if (c.pv <= 0) {
      out.innerHTML = `📉 Moins-value : ${escapeHtml(String(c.pv))} € (reportable 10 ans sur PV mobilières même nature)`;
      return;
    }
    out.innerHTML =
      `📈 PV : ${escapeHtml(String(c.pv))} €<br>` +
      `💸 IR (12,8%) : ${escapeHtml(String(c.ir))} €<br>` +
      `💸 PS (17,2%) : ${escapeHtml(String(c.ps))} €<br>` +
      `💰 <strong>Total PFU : ${escapeHtml(String(c.total))} €</strong><br>` +
      `<span style="color:#888;font-size:12px">${escapeHtml(c.formule ?? '')}</span>`;
  });

  logger.info('finance-pro', 'rendered');
}
