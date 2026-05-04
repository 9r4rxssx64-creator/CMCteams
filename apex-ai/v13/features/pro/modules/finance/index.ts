/**
 * APEX v13 — Finance Pro Module (port v12 vFinancePro)
 *
 * Niveau patrimonial expert :
 * - IR France 2026 (5 tranches, abattement 10%, parts fiscales)
 * - PFU 30% (12,8% IR + 17,2% PS) sur PV mobilières
 * - Crédit immobilier (mensualité, total intérêts, TAEG simplifié)
 * - Plus-values immobilières (abattement IR 22 ans / PS 30 ans)
 * - Régime fiscal Monaco (IR 0%, succession directs 0%)
 *
 * DISCLAIMER LEGAL : info indicative. Consulter expert-comptable.
 *
 * Sources autoritaires : Impôts.gouv, Service-public.fr, Légimonaco
 */

import { logger } from '../../../../core/logger.js';

export interface IrTranche {
  min: number;
  max: number;
  taux: number;
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
  csg_crds: 0.097,
  /** Prélèvement Forfaitaire Unique : 12,8% IR + 17,2% PS = 30% (Art 200 A CGI) */
  pv_mobilier: 0.30,
  pv_mobilier_ir: 0.128,
  pv_mobilier_ps: 0.172,
  credit_immo: { taux_2026: 0.035, duree_max: 25 },
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
      <p style="color:var(--ax-text-dim,#999);font-size:13px;margin-bottom:16px">Conseils niveau patrimonial : fiscalité FR 2026, immobilier, crypto/actions, Monaco</p>

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
      <p style="margin-top:14px;text-align:center;font-size:11px;color:#666">Sources : Impôts.gouv &middot; Service-public.fr &middot; Légimonaco &middot; CGI Art 150 / Art 200 A</p>
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
