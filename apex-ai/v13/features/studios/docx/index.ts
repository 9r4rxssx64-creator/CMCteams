/**
 * APEX v13.4.12 — Studio Docx (vue UI).
 *
 * Formulaire pour générer .docx (6 templates) sans passer par chat IA.
 * Délègue à docxGenerator (services/skills/docx-generator.ts).
 */

import { logger } from '../../../core/logger.js';
import { docxGenerator, type DocxGenerateInput } from '../../../services/skills/docx-generator.js';
import { toast } from '../../../ui/toast.js';

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c,
  );
}

const TEMPLATES_META: Array<{ id: string; label: string; emoji: string; fields: Array<{ key: string; label: string; type: 'text' | 'textarea' }> }> = [
  {
    id: 'letter-formal',
    label: 'Lettre formelle',
    emoji: '✉️',
    fields: [
      { key: 'sender_name', label: 'Expéditeur', type: 'text' },
      { key: 'recipient_name', label: 'Destinataire', type: 'text' },
      { key: 'subject', label: 'Objet', type: 'text' },
      { key: 'body', label: 'Corps de lettre', type: 'textarea' },
    ],
  },
  {
    id: 'contract-cdi',
    label: 'Contrat CDI',
    emoji: '📋',
    fields: [
      { key: 'employer_name', label: 'Employeur', type: 'text' },
      { key: 'employee_name', label: 'Salarié(e)', type: 'text' },
      { key: 'job_title', label: 'Poste', type: 'text' },
      { key: 'salary', label: 'Salaire brut (€/mois)', type: 'text' },
      { key: 'start_date', label: 'Date début', type: 'text' },
    ],
  },
  {
    id: 'contract-nda',
    label: 'NDA',
    emoji: '🤝',
    fields: [
      { key: 'party_a', label: 'Partie A', type: 'text' },
      { key: 'party_b', label: 'Partie B', type: 'text' },
      { key: 'scope', label: 'Périmètre', type: 'textarea' },
      { key: 'duration_years', label: 'Durée (années)', type: 'text' },
    ],
  },
  {
    id: 'cv-modern',
    label: 'CV moderne',
    emoji: '📄',
    fields: [
      { key: 'full_name', label: 'Nom complet', type: 'text' },
      { key: 'title', label: 'Titre/Poste', type: 'text' },
      { key: 'email', label: 'Email', type: 'text' },
      { key: 'phone', label: 'Téléphone', type: 'text' },
      { key: 'summary', label: 'Profil', type: 'textarea' },
      { key: 'experience', label: 'Expérience', type: 'textarea' },
      { key: 'education', label: 'Formation', type: 'textarea' },
      { key: 'skills', label: 'Compétences', type: 'textarea' },
    ],
  },
  {
    id: 'meeting-minutes',
    label: 'CR de réunion',
    emoji: '📝',
    fields: [
      { key: 'date', label: 'Date', type: 'text' },
      { key: 'participants', label: 'Participants', type: 'text' },
      { key: 'agenda', label: 'Ordre du jour', type: 'textarea' },
      { key: 'decisions', label: 'Décisions', type: 'textarea' },
      { key: 'actions', label: 'Actions', type: 'textarea' },
    ],
  },
  {
    id: 'report-monthly',
    label: 'Rapport mensuel',
    emoji: '📊',
    fields: [
      { key: 'period', label: 'Période', type: 'text' },
      { key: 'author', label: 'Auteur', type: 'text' },
      { key: 'highlights', label: 'Points clés', type: 'textarea' },
      { key: 'kpis', label: 'Indicateurs', type: 'textarea' },
      { key: 'challenges', label: 'Challenges', type: 'textarea' },
      { key: 'roadmap', label: 'Roadmap', type: 'textarea' },
    ],
  },
];

export function render(rootEl: HTMLElement): void {
  const selectedTemplate = TEMPLATES_META[0]!;

  function renderForm(template: typeof TEMPLATES_META[number]): string {
    return template.fields
      .map((f) =>
        f.type === 'textarea'
          ? `<label style="display:block;margin-bottom:8px"><span style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px">${escapeHtml(f.label)}</span><textarea data-field="${escapeHtml(f.key)}" rows="3" style="width:100%;padding:10px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#f1f5f9;font-size:14px;resize:vertical"></textarea></label>`
          : `<label style="display:block;margin-bottom:8px"><span style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px">${escapeHtml(f.label)}</span><input data-field="${escapeHtml(f.key)}" type="text" style="width:100%;padding:10px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#f1f5f9;font-size:14px"></label>`,
      )
      .join('');
  }

  function fullRender(template: typeof TEMPLATES_META[number]): void {
    rootEl.innerHTML = `
      <div style="max-width:720px;margin:0 auto;padding:20px">
        <h1 style="font-size:24px;margin-bottom:8px;color:#f1f5f9">📄 Studio Word — Document .docx</h1>
        <p style="color:#94a3b8;margin-bottom:20px">Génère un document Word téléchargeable. 100% client-side, aucune donnée envoyée serveur.</p>

        <label style="display:block;margin-bottom:16px">
          <span style="font-size:13px;color:#cbd5e1;display:block;margin-bottom:6px;font-weight:600">Choisir un modèle</span>
          <select id="docx-template-select" style="width:100%;padding:12px;background:#1e293b;border:1px solid #334155;border-radius:8px;color:#f1f5f9;font-size:15px">
            ${TEMPLATES_META.map((t) => `<option value="${t.id}" ${t.id === template.id ? 'selected' : ''}>${t.emoji} ${escapeHtml(t.label)}</option>`).join('')}
          </select>
        </label>

        <div id="docx-form-fields" style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:16px;margin-bottom:16px">
          ${renderForm(template)}
        </div>

        <button id="docx-generate" style="width:100%;padding:14px;background:#10b981;color:#fff;border:0;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;min-height:48px">
          ⬇️ Générer le .docx
        </button>

        <div id="docx-result" style="margin-top:20px"></div>
      </div>
    `;

    rootEl.querySelector('#docx-template-select')?.addEventListener('change', (e) => {
      const id = (e.target as HTMLSelectElement).value;
      const t = TEMPLATES_META.find((x) => x.id === id);
      if (t) fullRender(t);
    });

    rootEl.querySelector('#docx-generate')?.addEventListener('click', async () => {
      const selectEl = rootEl.querySelector('#docx-template-select') as HTMLSelectElement | null;
      const tplId = selectEl?.value ?? template.id;
      const tpl = TEMPLATES_META.find((x) => x.id === tplId) ?? template;

      const data: Record<string, unknown> = {};
      tpl.fields.forEach((f) => {
        const el = rootEl.querySelector(`[data-field="${f.key}"]`) as HTMLInputElement | HTMLTextAreaElement | null;
        data[f.key] = el?.value ?? '';
      });

      toast.info('Génération en cours...');
      try {
        const result = await docxGenerator.generate({
          template: tpl.id as DocxGenerateInput['template'],
          data,
        });
        const resEl = rootEl.querySelector('#docx-result');
        if (!resEl) return;
        if (result.success) {
          resEl.innerHTML = `
            <div style="background:#0f172a;border:1px solid #10b981;border-radius:12px;padding:16px;text-align:center">
              <p style="color:#10b981;font-size:14px;margin-bottom:12px">✅ ${escapeHtml(result.filename)} (${(result.sizeBytes / 1024).toFixed(1)} Ko)</p>
              <a href="${result.blobUrl}" download="${escapeHtml(result.filename)}" style="display:inline-block;padding:12px 20px;background:#10b981;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">⬇️ Télécharger</a>
            </div>`;
          toast.success(`✅ ${result.filename}`);
        } else {
          resEl.innerHTML = `<p style="color:#ef4444">❌ ${escapeHtml(result.error ?? 'Erreur inconnue')}</p>`;
          toast.error(`❌ ${result.error ?? 'Erreur'}`);
        }
      } catch (err) {
        logger.warn('studio-docx', 'failed', { err });
        toast.error(`❌ ${err instanceof Error ? err.message : 'Erreur'}`);
      }
    });
  }

  fullRender(selectedTemplate);
}
