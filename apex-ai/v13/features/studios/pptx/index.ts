/**
 * APEX v13.4.12 — Studio PPTX (vue UI).
 *
 * Génère présentation .pptx avec slides dynamiques.
 */

import { logger } from '../../../core/logger.js';
import { pptxGenerator, type PptxGenerateInput } from '../../../services/skills/pptx-generator.js';
import { toast } from '../../../ui/toast.js';

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c,
  );
}

const TEMPLATES = [
  { id: 'pitch-startup', label: 'Pitch startup', emoji: '🚀' },
  { id: 'business-quarterly', label: 'Review trimestrielle', emoji: '📊' },
  { id: 'lecture-academic', label: 'Cours académique', emoji: '🎓' },
  { id: 'wedding-anniversary', label: 'Mariage / Anniv', emoji: '💍' },
  { id: 'birthday-party', label: 'Anniversaire fun', emoji: '🎂' },
  { id: 'casino-training', label: 'Formation casino', emoji: '🎰' },
  { id: 'product-launch', label: 'Lancement produit', emoji: '📢' },
] as const;

let slidesState: Array<{ title: string; content: string }> = [
  { title: 'Slide 1', content: '• Point 1\n• Point 2\n• Point 3' },
];

export function render(rootEl: HTMLElement): void {
  function renderSlideRows(): string {
    return slidesState
      .map(
        (s, i) =>
          `<div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:12px;margin-bottom:10px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
              <strong style="color:#cbd5e1;font-size:13px">Slide ${i + 1}</strong>
              ${slidesState.length > 1 ? `<button data-rm="${i}" style="padding:4px 10px;background:#ef4444;color:#fff;border:0;border-radius:4px;font-size:12px;cursor:pointer">🗑</button>` : ''}
            </div>
            <input data-slide-title="${i}" value="${escapeHtml(s.title)}" placeholder="Titre slide" style="width:100%;padding:8px;background:#1e293b;border:1px solid #334155;border-radius:4px;color:#f1f5f9;font-size:14px;margin-bottom:6px">
            <textarea data-slide-content="${i}" rows="3" placeholder="Contenu (bullets)" style="width:100%;padding:8px;background:#1e293b;border:1px solid #334155;border-radius:4px;color:#f1f5f9;font-size:13px;resize:vertical">${escapeHtml(s.content)}</textarea>
          </div>`,
      )
      .join('');
  }

  function full(): void {
    rootEl.innerHTML = `
      <div style="max-width:760px;margin:0 auto;padding:20px">
        <h1 style="font-size:24px;margin-bottom:8px;color:#f1f5f9">📊 Studio PowerPoint</h1>
        <p style="color:#94a3b8;margin-bottom:20px">Génère un .pptx téléchargeable avec slides personnalisés.</p>

        <label style="display:block;margin-bottom:12px">
          <span style="font-size:13px;color:#cbd5e1;display:block;margin-bottom:6px;font-weight:600">Modèle</span>
          <select id="pptx-template" style="width:100%;padding:12px;background:#1e293b;border:1px solid #334155;border-radius:8px;color:#f1f5f9;font-size:15px">
            ${TEMPLATES.map((t) => `<option value="${t.id}">${t.emoji} ${escapeHtml(t.label)}</option>`).join('')}
          </select>
        </label>

        <label style="display:block;margin-bottom:12px">
          <span style="font-size:13px;color:#cbd5e1;display:block;margin-bottom:6px;font-weight:600">Titre</span>
          <input id="pptx-title" type="text" placeholder="Mon pitch Apex" style="width:100%;padding:10px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#f1f5f9;font-size:14px">
        </label>

        <label style="display:block;margin-bottom:12px">
          <span style="font-size:13px;color:#cbd5e1;display:block;margin-bottom:6px;font-weight:600">Auteur</span>
          <input id="pptx-author" type="text" placeholder="Kevin DESARZENS" style="width:100%;padding:10px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#f1f5f9;font-size:14px">
        </label>

        <label style="display:block;margin-bottom:16px">
          <span style="font-size:13px;color:#cbd5e1;display:block;margin-bottom:6px;font-weight:600">Mode</span>
          <select id="pptx-mode" style="width:100%;padding:10px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#f1f5f9;font-size:14px">
            <option value="pro">⚙️ Pro (sobre, business)</option>
            <option value="fun">🎉 Fun (couleurs vives)</option>
          </select>
        </label>

        <h3 style="font-size:16px;color:#f1f5f9;margin-bottom:12px">Slides (${slidesState.length})</h3>
        <div id="pptx-slides">${renderSlideRows()}</div>

        <button id="pptx-add-slide" style="width:100%;padding:10px;background:#3b82f6;color:#fff;border:0;border-radius:8px;font-size:14px;cursor:pointer;margin-bottom:16px;min-height:44px">
          ➕ Ajouter slide
        </button>

        <button id="pptx-generate" style="width:100%;padding:14px;background:#10b981;color:#fff;border:0;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;min-height:48px">
          ⬇️ Générer le .pptx
        </button>

        <div id="pptx-result" style="margin-top:20px"></div>
      </div>
    `;

    rootEl.querySelector('#pptx-add-slide')?.addEventListener('click', () => {
      slidesState.push({ title: `Slide ${slidesState.length + 1}`, content: '• Point 1' });
      full();
    });

    rootEl.querySelectorAll('[data-rm]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt((btn as HTMLElement).getAttribute('data-rm') ?? '-1', 10);
        if (idx >= 0 && slidesState.length > 1) {
          slidesState.splice(idx, 1);
          full();
        }
      });
    });

    rootEl.querySelector('#pptx-generate')?.addEventListener('click', async () => {
      const template = (rootEl.querySelector('#pptx-template') as HTMLSelectElement)?.value ?? 'pitch-startup';
      const title = (rootEl.querySelector('#pptx-title') as HTMLInputElement)?.value || 'Présentation';
      const author = (rootEl.querySelector('#pptx-author') as HTMLInputElement)?.value || 'Apex';
      const mode = (rootEl.querySelector('#pptx-mode') as HTMLSelectElement)?.value as 'pro' | 'fun';

      /* Read slides state from DOM */
      const slides = slidesState.map((_, i) => ({
        title:
          (rootEl.querySelector(`[data-slide-title="${i}"]`) as HTMLInputElement)?.value ?? `Slide ${i + 1}`,
        content: (rootEl.querySelector(`[data-slide-content="${i}"]`) as HTMLTextAreaElement)?.value ?? '',
      }));

      toast.info('Génération en cours...');
      try {
        const result = await pptxGenerator.generate({
          template: template as PptxGenerateInput['template'],
          title,
          author,
          slides,
          mode,
        });

        const resEl = rootEl.querySelector('#pptx-result');
        if (!resEl) return;
        if (result.success) {
          resEl.innerHTML = `
            <div style="background:#0f172a;border:1px solid #10b981;border-radius:12px;padding:16px;text-align:center">
              <p style="color:#10b981;font-size:14px;margin-bottom:12px">✅ ${escapeHtml(result.filename)} (${result.slideCount} slides, ${(result.sizeBytes / 1024).toFixed(1)} Ko)</p>
              <a href="${result.blobUrl}" download="${escapeHtml(result.filename)}" style="display:inline-block;padding:12px 20px;background:#10b981;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">⬇️ Télécharger</a>
            </div>`;
          toast.success(`✅ ${result.filename}`);
        } else {
          resEl.innerHTML = `<p style="color:#ef4444">❌ ${escapeHtml(result.error ?? 'Erreur')}</p>`;
          toast.error(`❌ ${result.error ?? 'Erreur'}`);
        }
      } catch (err) {
        logger.warn('studio-pptx', 'failed', { err });
        toast.error(`❌ ${err instanceof Error ? err.message : 'Erreur'}`);
      }
    });
  }

  full();
}
