/**
 * APEX v13.4.12 — Studio XLSX (vue UI).
 *
 * Tableur simple : import CSV ou saisie manuelle → export .xlsx.
 */

import { logger } from '../../../core/logger.js';
import { xlsxGenerator, type XlsxCellValue } from '../../../services/skills/xlsx-generator.js';
import { toast } from '../../../ui/toast.js';

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c,
  );
}

export function render(rootEl: HTMLElement): void {
  rootEl.innerHTML = `
    <div style="max-width:800px;margin:0 auto;padding:20px">
      <h1 style="font-size:24px;margin-bottom:8px;color:#f1f5f9">📈 Studio Excel — Tableau .xlsx</h1>
      <p style="color:#94a3b8;margin-bottom:20px">Génère un tableau Excel multi-feuilles. Colle données CSV ou saisis manuellement.</p>

      <label style="display:block;margin-bottom:12px">
        <span style="font-size:13px;color:#cbd5e1;display:block;margin-bottom:6px;font-weight:600">Nom fichier</span>
        <input id="xlsx-filename" type="text" value="tableau.xlsx" style="width:100%;padding:10px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#f1f5f9;font-size:14px">
      </label>

      <label style="display:block;margin-bottom:12px">
        <span style="font-size:13px;color:#cbd5e1;display:block;margin-bottom:6px;font-weight:600">Nom de la feuille</span>
        <input id="xlsx-sheetname" type="text" value="Sheet1" style="width:100%;padding:10px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#f1f5f9;font-size:14px">
      </label>

      <label style="display:block;margin-bottom:12px">
        <span style="font-size:13px;color:#cbd5e1;display:block;margin-bottom:6px;font-weight:600">Données (CSV, 1ère ligne = headers)</span>
        <textarea id="xlsx-data" rows="10" placeholder="Catégorie,Recettes,Dépenses&#10;Salaire,4500,0&#10;Loyer,0,1200&#10;Courses,0,400" style="width:100%;padding:10px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#f1f5f9;font-size:13px;font-family:monospace;resize:vertical">Catégorie,Recettes,Dépenses
Salaire,4500,0
Loyer,0,1200
Courses,0,400</textarea>
      </label>

      <label style="display:block;margin-bottom:16px">
        <input type="checkbox" id="xlsx-freeze" checked> <span style="color:#cbd5e1;font-size:13px">Figer la 1ère ligne (headers)</span>
      </label>

      <button id="xlsx-generate" style="width:100%;padding:14px;background:#10b981;color:#fff;border:0;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;min-height:48px">
        ⬇️ Générer le .xlsx
      </button>

      <div id="xlsx-result" style="margin-top:20px"></div>
    </div>
  `;

  rootEl.querySelector('#xlsx-generate')?.addEventListener('click', async () => {
    const filename = (rootEl.querySelector('#xlsx-filename') as HTMLInputElement)?.value || 'tableau.xlsx';
    const sheetName = (rootEl.querySelector('#xlsx-sheetname') as HTMLInputElement)?.value || 'Sheet1';
    const csvText = (rootEl.querySelector('#xlsx-data') as HTMLTextAreaElement)?.value ?? '';
    const freeze = (rootEl.querySelector('#xlsx-freeze') as HTMLInputElement)?.checked ?? true;

    /* Parse CSV (split sur virgule simple — pas guillemets pour cette version) */
    const rows: XlsxCellValue[][] = csvText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((line) =>
        line.split(',').map((cell) => {
          const trimmed = cell.trim();
          const num = Number(trimmed);
          return !isNaN(num) && trimmed !== '' ? num : trimmed;
        }),
      );

    if (rows.length === 0) {
      toast.error('Aucune donnée à exporter');
      return;
    }

    toast.info('Génération en cours...');
    try {
      const result = await xlsxGenerator.generate({
        filename,
        sheets: [
          {
            name: sheetName,
            data: rows,
            freezeHeader: freeze,
          },
        ],
      });

      const resEl = rootEl.querySelector('#xlsx-result');
      if (!resEl) return;
      if (result.success) {
        resEl.innerHTML = `
          <div style="background:#0f172a;border:1px solid #10b981;border-radius:12px;padding:16px;text-align:center">
            <p style="color:#10b981;font-size:14px;margin-bottom:12px">✅ ${escapeHtml(result.filename)} (${result.sheetCount} feuille, ${(result.sizeBytes / 1024).toFixed(1)} Ko)</p>
            <a href="${result.blobUrl}" download="${escapeHtml(result.filename)}" style="display:inline-block;padding:12px 20px;background:#10b981;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">⬇️ Télécharger</a>
          </div>`;
        toast.success(`✅ ${result.filename}`);
      } else {
        resEl.innerHTML = `<p style="color:#ef4444">❌ ${escapeHtml(result.error ?? 'Erreur')}</p>`;
        toast.error(`❌ ${result.error ?? 'Erreur'}`);
      }
    } catch (err) {
      logger.warn('studio-xlsx', 'failed', { err });
      toast.error(`❌ ${err instanceof Error ? err.message : 'Erreur'}`);
    }
  });
}
