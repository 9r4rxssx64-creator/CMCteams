/**
 * APEX v13.4.12 — Studio PDF (vue UI).
 *
 * Formulaire pour générer .pdf (facture, devis, etc.) via jsPDF.
 */

import { escapeHtml } from '../../../core/escape-html.js';
import { logger } from '../../../core/logger.js';
import { pdfGenerator, type PdfGenerateInput } from '../../../services/skills/pdf-generator.js';
import { toast } from '../../../ui/toast.js';

const TEMPLATES = [
  { id: 'invoice', label: 'Facture', emoji: '💰' },
  { id: 'quote', label: 'Devis', emoji: '📋' },
  { id: 'contract-signed', label: 'Contrat à signer', emoji: '✍️' },
  { id: 'report-standard', label: 'Rapport', emoji: '📊' },
  { id: 'certificate', label: 'Certificat', emoji: '🏆' },
  { id: 'receipt', label: 'Reçu', emoji: '🧾' },
  { id: 'custom', label: 'Texte libre', emoji: '📝' },
] as const;

export function render(rootEl: HTMLElement): void {
  rootEl.innerHTML = `
    <div style="max-width:720px;margin:0 auto;padding:20px">
      <h1 style="font-size:24px;margin-bottom:8px;color:#f1f5f9">📑 Studio PDF</h1>
      <p style="color:#94a3b8;margin-bottom:20px">Génère un PDF pro téléchargeable.</p>

      <label style="display:block;margin-bottom:16px">
        <span style="font-size:13px;color:#cbd5e1;display:block;margin-bottom:6px;font-weight:600">Type de document</span>
        <select id="pdf-template" style="width:100%;padding:12px;background:#1e293b;border:1px solid #334155;border-radius:8px;color:#f1f5f9;font-size:15px">
          ${TEMPLATES.map((t) => `<option value="${t.id}">${t.emoji} ${escapeHtml(t.label)}</option>`).join('')}
        </select>
      </label>

      <div style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:16px;margin-bottom:16px">
        <label style="display:block;margin-bottom:10px">
          <span style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px">N° / Référence</span>
          <input id="pdf-number" type="text" placeholder="F-2026-001" style="width:100%;padding:10px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#f1f5f9;font-size:14px">
        </label>
        <label style="display:block;margin-bottom:10px">
          <span style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px">Client / Destinataire</span>
          <input id="pdf-client" type="text" style="width:100%;padding:10px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#f1f5f9;font-size:14px">
        </label>
        <label style="display:block;margin-bottom:10px">
          <span style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px">Adresse client</span>
          <input id="pdf-address" type="text" style="width:100%;padding:10px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#f1f5f9;font-size:14px">
        </label>
        <label style="display:block;margin-bottom:10px">
          <span style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px">Lignes (1 par ligne : "description | qty | prix HT")</span>
          <textarea id="pdf-items" rows="4" placeholder="Service A | 1 | 500&#10;Service B | 2 | 250" style="width:100%;padding:10px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#f1f5f9;font-size:14px;resize:vertical"></textarea>
        </label>
        <label style="display:block;margin-bottom:10px">
          <span style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px">Watermark (optionnel)</span>
          <select id="pdf-watermark" style="width:100%;padding:10px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#f1f5f9;font-size:14px">
            <option value="">Aucun</option>
            <option value="BROUILLON">BROUILLON</option>
            <option value="CONFIDENTIEL">CONFIDENTIEL</option>
          </select>
        </label>
      </div>

      <button id="pdf-generate" style="width:100%;padding:14px;background:#10b981;color:#fff;border:0;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;min-height:48px">
        ⬇️ Générer le PDF
      </button>

      <div id="pdf-result" style="margin-top:20px"></div>
    </div>
  `;

  rootEl.querySelector('#pdf-generate')?.addEventListener('click', async () => {
    const template = (rootEl.querySelector('#pdf-template') as HTMLSelectElement)?.value ?? 'invoice';
    const number = (rootEl.querySelector('#pdf-number') as HTMLInputElement)?.value ?? '';
    const clientName = (rootEl.querySelector('#pdf-client') as HTMLInputElement)?.value ?? '';
    const clientAddress = (rootEl.querySelector('#pdf-address') as HTMLInputElement)?.value ?? '';
    const itemsText = (rootEl.querySelector('#pdf-items') as HTMLTextAreaElement)?.value ?? '';
    const watermark = (rootEl.querySelector('#pdf-watermark') as HTMLSelectElement)?.value ?? '';

    const items = itemsText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split('|').map((p) => p.trim());
        return {
          description: parts[0] ?? '',
          quantity: parseFloat(parts[1] ?? '1') || 1,
          unit_price: parseFloat(parts[2] ?? '0') || 0,
        };
      });

    toast.info('Génération en cours...');
    try {
      const result = await pdfGenerator.generate({
        template: template as PdfGenerateInput['template'],
        data: {
          number,
          client_name: clientName,
          client_address: clientAddress,
          items,
          date: new Date().toLocaleDateString('fr-FR'),
        },
        ...(watermark
          ? { options: { watermark: watermark as 'BROUILLON' | 'CONFIDENTIEL' } }
          : {}),
      });

      const resEl = rootEl.querySelector('#pdf-result');
      if (!resEl) return;
      if (result.success) {
        resEl.innerHTML = `
          <div style="background:#0f172a;border:1px solid #10b981;border-radius:12px;padding:16px;text-align:center">
            <p style="color:#10b981;font-size:14px;margin-bottom:12px">✅ ${escapeHtml(result.filename)} (${result.pageCount} page${result.pageCount > 1 ? 's' : ''}, ${(result.sizeBytes / 1024).toFixed(1)} Ko)</p>
            <a href="${result.blobUrl}" download="${escapeHtml(result.filename)}" style="display:inline-block;padding:12px 20px;background:#10b981;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">⬇️ Télécharger</a>
          </div>`;
        toast.success(`✅ ${result.filename}`);
      } else {
        resEl.innerHTML = `<p style="color:#ef4444">❌ ${escapeHtml(result.error ?? 'Erreur')}</p>`;
        toast.error(`❌ ${result.error ?? 'Erreur'}`);
      }
    } catch (err) {
      logger.warn('studio-pdf', 'failed', { err });
      toast.error(`❌ ${err instanceof Error ? err.message : 'Erreur'}`);
    }
  });
}
