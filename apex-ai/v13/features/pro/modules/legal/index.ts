/**
 * APEX v13 — Legal Pro Module (port v12 vLegalLib)
 *
 * Niveau juridique expert :
 * - 18 codes français (Civil, Pénal, Travail, Commerce, Conso, Santé, etc.)
 * - 5 jurisprudences (Cassation, CE, Conseil Constitutionnel, CJUE, CEDH)
 * - Constitution Monaco + Légimonaco
 * - 6 organismes officiels (CNB, CNIL, Service Public, etc.)
 * - Recherche full-text + génération URL Légifrance
 *
 * DISCLAIMER LEGAL : info indicative. Consulter avocat.
 *
 * Sources autoritaires : Légifrance, Légimonaco, Curia, CEDH, Cassation, Conseil d'État
 */

import { logger } from '../../../../core/logger.js';

export const AX_LEGAL_FR = {
  codes: {
    civil: 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006070721/',
    penal: 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006070719/',
    travail: 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006072050/',
    commerce: 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000005634379/',
    consommation: 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006069565/',
    secu_sociale: 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006073189/',
    sante: 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006072665/',
    impots: 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006069577/',
    urbanisme: 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006074075/',
    environnement: 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006074220/',
    education: 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006071191/',
    transports: 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000023086525/',
    procedure_civile: 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006070716/',
    procedure_penale: 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006071154/',
    justice_admin: 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006070933/',
    propriete_intellectuelle: 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006069414/',
    monetaire_financier: 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006072026/',
    general_collectivites: 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006070633/',
  } as Record<string, string>,
  jurisprudence: {
    cassation: 'https://www.courdecassation.fr/recherche-judilibre',
    conseil_etat: 'https://www.conseil-etat.fr/decisions',
    conseil_constitutionnel: 'https://www.conseil-constitutionnel.fr/decisions',
    cjue: 'https://curia.europa.eu/juris/recherche.jsf',
    cedh: 'https://hudoc.echr.coe.int/fre',
  } as Record<string, string>,
  monaco: {
    constitution: 'https://journaldemonaco.gouv.mc/Journaux/2002/Journal-7569/Constitution-de-la-Principaute-de-Monaco',
    legimonaco: 'https://www.legimonaco.mc/',
  } as Record<string, string>,
  organismes: {
    avocat_cnb: 'https://www.avocat.fr',
    notaire: 'https://www.notaires.fr',
    huissier: 'https://www.huissier-justice.fr',
    cnil: 'https://www.cnil.fr',
    defenseur: 'https://www.defenseurdesdroits.fr',
    service_public: 'https://www.service-public.fr',
  } as Record<string, string>,
} as const;

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);
}

/**
 * Lookup article ou code → URL Légifrance directe ou recherche.
 */
export function legalLookup(article: string): string {
  const key = String(article || '').toLowerCase().trim();
  const direct = AX_LEGAL_FR.codes[key];
  if (direct) return direct;
  return `https://www.legifrance.gouv.fr/search/all?searchField=ALL&query=${encodeURIComponent(article)}`;
}

/**
 * Recherche jurisprudence par source + mots-clés.
 */
export function jurisprudenceSearch(source: string, keywords: string): string {
  const src = String(source || 'cassation').toLowerCase();
  const base = AX_LEGAL_FR.jurisprudence[src] ?? AX_LEGAL_FR.jurisprudence['cassation'] ?? '';
  return `${base}?search=${encodeURIComponent(keywords)}`;
}

/**
 * Liste tous les codes disponibles (clé technique + label lisible).
 */
export function listCodes(): Array<{ key: string; label: string; url: string }> {
  return Object.keys(AX_LEGAL_FR.codes).map((k) => ({
    key: k,
    label: k.replace(/_/g, ' '),
    url: AX_LEGAL_FR.codes[k] ?? '',
  }));
}

/**
 * Render UI premium Legal Pro avec disclaimer.
 */
export function render(root: HTMLElement): void {
  const codesHtml = Object.keys(AX_LEGAL_FR.codes)
    .map((k) => {
      const url = AX_LEGAL_FR.codes[k] ?? '';
      return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener" style="display:block;padding:9px 12px;color:#5aa8ff;text-decoration:none;border-bottom:1px solid rgba(255,255,255,0.06);transition:background 0.15s" onmouseover="this.style.background='rgba(90,168,255,0.1)'" onmouseout="this.style.background=''">📜 Code ${escapeHtml(k.replace(/_/g, ' '))}</a>`;
    })
    .join('');

  const jurisHtml = Object.keys(AX_LEGAL_FR.jurisprudence)
    .map((k) => {
      const url = AX_LEGAL_FR.jurisprudence[k] ?? '';
      return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener" style="display:block;padding:9px 12px;color:#5aa8ff;text-decoration:none;border-bottom:1px solid rgba(255,255,255,0.06)">🔍 ${escapeHtml(k.replace(/_/g, ' '))}</a>`;
    })
    .join('');

  const monacoHtml = Object.keys(AX_LEGAL_FR.monaco)
    .map((k) => {
      const url = AX_LEGAL_FR.monaco[k] ?? '';
      return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener" style="display:block;padding:9px 12px;color:#5aa8ff;text-decoration:none;border-bottom:1px solid rgba(255,255,255,0.06)">${escapeHtml(k.replace(/_/g, ' '))}</a>`;
    })
    .join('');

  const orgsHtml = Object.keys(AX_LEGAL_FR.organismes)
    .map((k) => {
      const url = AX_LEGAL_FR.organismes[k] ?? '';
      return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener" style="display:block;padding:9px 12px;color:#5aa8ff;text-decoration:none;border-bottom:1px solid rgba(255,255,255,0.06)">${escapeHtml(k.replace(/_/g, ' '))}</a>`;
    })
    .join('');

  root.innerHTML = `
    <div style="padding:16px;max-width:900px;margin:0 auto;color:var(--ax-text,#eee)">
      <h2 style="background:linear-gradient(135deg,#c9a227,#e8b830);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-size:28px;margin-bottom:8px">⚖ Bibliothèque juridique FR + Monaco</h2>
      <p style="color:var(--ax-text-dim,#999);font-size:13px;margin-bottom:16px">Liens directs Légifrance, jurisprudence (Cassation, CE, CJUE, CEDH), Monaco et organismes officiels</p>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:12px">
        <h3 style="color:#c9a227;margin:0 0 10px">🔎 Recherche article / code</h3>
        <input id="legalQ" type="text" placeholder="Ex: code civil, article 1240, RGPD..." style="width:100%;padding:11px;font-size:14px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);color:#eee;border-radius:8px;min-height:44px" aria-label="Recherche juridique">
        <button id="legalSearchBtn" type="button" style="width:100%;margin-top:8px;padding:12px;background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;border:0;border-radius:8px;font-weight:700;cursor:pointer;min-height:44px">Rechercher sur Légifrance</button>
        <div id="legalResult" style="margin-top:10px;font-size:13px"></div>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:12px">
        <h3 style="color:#c9a227;margin:0 0 10px">📚 Codes français (${Object.keys(AX_LEGAL_FR.codes).length})</h3>
        <div style="max-height:340px;overflow-y:auto">${codesHtml}</div>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:12px">
        <h3 style="color:#c9a227;margin:0 0 10px">⚖ Jurisprudence (${Object.keys(AX_LEGAL_FR.jurisprudence).length})</h3>
        ${jurisHtml}
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:12px">
        <h3 style="color:#c9a227;margin:0 0 10px">🇲🇨 Monaco</h3>
        ${monacoHtml}
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:12px">
        <h3 style="color:#c9a227;margin:0 0 10px">🏛 Organismes officiels (${Object.keys(AX_LEGAL_FR.organismes).length})</h3>
        ${orgsHtml}
      </div>

      <div style="margin-top:18px;padding:14px;background:rgba(255,165,0,0.08);border:1px solid rgba(255,165,0,0.3);border-radius:10px;font-size:12px;color:#ffd699;text-align:center">
        ⚠️ <strong>Information indicative uniquement</strong>. Pour décision juridique importante, consulter un avocat ou notaire qualifié.
      </div>
      <p style="margin-top:14px;text-align:center;font-size:11px;color:#666">Sources : Légifrance &middot; Légimonaco &middot; Cour de cassation &middot; Conseil d'État &middot; CJUE &middot; CEDH</p>
    </div>
  `;

  root.querySelector<HTMLButtonElement>('#legalSearchBtn')?.addEventListener('click', () => {
    const q = root.querySelector<HTMLInputElement>('#legalQ')?.value ?? '';
    const out = root.querySelector<HTMLDivElement>('#legalResult');
    if (!out || !q) return;
    const url = legalLookup(q);
    out.innerHTML = `🔗 <a href="${escapeHtml(url)}" target="_blank" rel="noopener" style="color:#5aa8ff">${escapeHtml(url)}</a>`;
  });

  logger.info('legal-pro', 'rendered');
}
