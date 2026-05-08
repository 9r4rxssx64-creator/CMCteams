/**
 * APEX v13 — Vue Coffre (Vault) — Refonte visuelle premium (Kevin 2026-05-07)
 *
 * Demande Kevin : "Je veux un visuel de mes codes que je mets au fur à mesure.
 * Classé, organisé, que j'ai accès. Je peux ajouter manuellement ou dans le chat etc."
 *
 * Nouveautés v13.0.83+ :
 *  - 10 catégories avec accordéon (IA / Paiements / DevOps / Comms / Social /
 *    Stockage / E-commerce / Crypto / Identité / Autres)
 *  - Cards premium par credential : status badge live (🟢🟡🔴), valeur masquée,
 *    bouton 🔄 Test, 💰 Recharger, ✏️ Modifier, 🗑 Supprimer
 *  - Modal "+ Ajouter manuellement" : sélecteur catégorie + service + valeur
 *    + bouton "Détecter automatiquement" (auto-detect via patterns)
 *  - Search filter live (fuzzy par nom service + alias)
 *  - Stats header (total / actifs / dégradés / invalides)
 *  - Bouton "🔄 Tester tout" (test toutes les clés en parallèle)
 *
 * Sécurité :
 *  - escapeHtml partout (XSS)
 *  - Confirm avant delete
 *  - Valeurs jamais exposées en clair (toujours masquées 4+••••••+4)
 *  - Touch targets ≥ 32px (mobile-first iPhone 375px)
 */

import { logger } from '../../core/logger.js';
import { createCleanupScope, type CleanupScope } from '../../core/listener-cleanup.js';
import { store } from '../../core/store.js';
import { autoDiscoverLinks } from '../../services/auto-discover-links.js';
import { CREDENTIAL_PATTERNS, detectCredential, type CredentialPattern } from '../../services/credential-patterns.js';
import { linksRegistry } from '../../services/links-registry.js';
import { multiKeyVault, type KeyEntry, type KeyStatus } from '../../services/multi-key-vault.js';
import { vault } from '../../services/vault.js';
import { haptic } from '../../ui/haptic.js';
import { skeleton } from '../../ui/skeleton.js';
import { toast } from '../../ui/toast.js';

/* P1-6 (audit v13.2.7) : scope listeners pour anti-leak SPA navigation. */
let activeVaultScope: CleanupScope | null = null;

export function dispose(): void {
  activeVaultScope?.cleanup();
  activeVaultScope = null;
}

/**
 * Échappement HTML strict (XSS-safe).
 */
export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);
}

/* ──────────────────────────── Types & domain helpers ──────────────────────────── */

export interface VaultEntry {
  pattern: CredentialPattern;
  status: 'configured' | 'empty' | 'encrypted' | 'plaintext_legacy';
  masked: string;
}

export interface CredentialDisplay {
  /** ID interne unique (multi-key) ou storageKey (legacy) */
  id: string;
  /** Identifiant service (ex: "anthropic", "stripe") */
  service: string;
  /** Nom affichable (ex: "Anthropic Claude") */
  serviceName: string;
  /** Alias optionnel ("perso", "client X") */
  alias?: string;
  /** Catégorie agrégée pour groupement UI (id catégorie) */
  category: string;
  /** Statut runtime (multi-key vault) */
  status: KeyStatus;
  /** Préfixe en clair pour masquage (4+•••+4) — jamais la valeur complète */
  preview?: string;
  /** Timestamps */
  addedAt?: number;
  lastTestedAt?: number;
  /** URL recharge directe (1-clic) si link registry connaît */
  rechargeUrl?: string;
  /** Logo officiel (favicon ou SVG provider) — optional */
  logoUrl?: string;
  /** Source de l'entrée pour wiring actions */
  source: 'multi-key' | 'legacy';
}

export interface CategoryDef {
  id: string;
  label: string;
  /** Liste de mots-clés (substring, case-insensitive) qui rattachent un service à cette catégorie */
  serviceMatchers: ReadonlyArray<string>;
  /** Catégories CredentialPattern["category"] mappées (pour entrées legacy) */
  patternCategories: ReadonlyArray<CredentialPattern['category']>;
}

export const CATEGORIES: ReadonlyArray<CategoryDef> = [
  {
    id: 'ai',
    label: '🤖 IA & LLM',
    serviceMatchers: [
      'anthropic', 'openai', 'groq', 'google', 'gemini', 'openrouter', 'cohere',
      'mistral', 'perplexity', 'deepseek', 'xai', 'elevenlabs', 'replicate',
      'huggingface', 'fireworks', 'togetherai', 'deepl',
    ],
    patternCategories: ['ai'],
  },
  {
    id: 'finance',
    label: '💳 Paiements & Finance',
    serviceMatchers: [
      'stripe', 'paypal', 'revolut', 'wise', 'lydia', 'n26', 'boursorama',
      'fortuneo', 'ing', 'socgen', 'bnp', 'credit_agricole', 'credit_mutuel',
      'banque_postale', 'lbp', 'bpce', 'shopify',
    ],
    patternCategories: ['finance'],
  },
  {
    id: 'devops',
    label: '🛠 DevOps & Code',
    serviceMatchers: [
      'github', 'gitlab', 'cloudflare', 'vercel', 'netlify', 'railway',
      'aws', 'heroku', 'sentry', 'npm',
    ],
    patternCategories: ['devops'],
  },
  {
    id: 'comms',
    label: '📨 Communications',
    serviceMatchers: [
      'telegram', 'discord', 'slack', 'brevo', 'resend', 'twilio',
      'sendgrid', 'mailchimp', 'whatsapp',
    ],
    patternCategories: ['comms'],
  },
  {
    id: 'social',
    label: '🌐 Réseaux sociaux',
    serviceMatchers: [
      'facebook', 'instagram', 'tiktok', 'youtube', 'twitter', 'linkedin',
    ],
    patternCategories: [],
  },
  {
    id: 'storage',
    label: '☁️ Stockage & Cloud',
    serviceMatchers: [
      'firebase', 'supabase', 'airtable', 'notion', 'dropbox', 'pinecone', 'weaviate',
    ],
    patternCategories: ['storage'],
  },
  {
    id: 'ecommerce',
    label: '🛒 E-commerce',
    serviceMatchers: ['shopify', 'stripe_connect', 'paypal_business'],
    patternCategories: [],
  },
  {
    id: 'crypto',
    label: '₿ Crypto',
    serviceMatchers: ['coinbase', 'binance', 'crypto_com', 'kraken'],
    patternCategories: [],
  },
  {
    id: 'identity',
    label: '🆔 Identité Kevin',
    serviceMatchers: [
      'kevin', 'iban', 'siret', 'vat', 'bic', 'apple', 'microsoft',
    ],
    patternCategories: ['identity'],
  },
  {
    id: 'other',
    label: '📦 Autres',
    serviceMatchers: [],
    patternCategories: ['saas'],
  },
];

/**
 * Map service ID → catégorie UI. Match le PLUS LONG mot-clé gagne (préfère
 * "kevin" sur "email" pour kevin_email). Fallback "other".
 */
export function classifyService(service: string, patternCat?: CredentialPattern['category']): string {
  const lc = service.toLowerCase();
  let best: { catId: string; matchLen: number } | null = null;
  for (const cat of CATEGORIES) {
    if (cat.id === 'other') continue;
    for (const m of cat.serviceMatchers) {
      if (lc.includes(m)) {
        if (!best || m.length > best.matchLen) {
          best = { catId: cat.id, matchLen: m.length };
        }
      }
    }
  }
  if (best) return best.catId;
  if (patternCat) {
    for (const cat of CATEGORIES) {
      if (cat.patternCategories.includes(patternCat)) return cat.id;
    }
  }
  return 'other';
}

/* ──────────────────────────── Listings (legacy + multi-key) ──────────────────────────── */

/**
 * Liste credentials legacy (1 clé / storageKey) — back-compat tests + paste auto-detect.
 */
export function listVaultEntries(): VaultEntry[] {
  return CREDENTIAL_PATTERNS.filter((p) => p.category !== 'forbidden').map((p) => {
    const status = vault.getKeyStatus(p.storageKey);
    const raw = (() => {
      try {
        return localStorage.getItem(p.storageKey) ?? '';
      } catch {
        return '';
      }
    })();
    const masked = raw && raw.length > 8 && !raw.startsWith('AXENC1:')
      ? vault.maskKey(raw)
      : raw.startsWith('AXENC1:') ? '🔒 chiffré' : '';
    return { pattern: p, status, masked };
  });
}

/**
 * Filtre les entrées legacy par catégorie ou statut.
 */
export function filterVaultEntries(
  entries: ReadonlyArray<VaultEntry>,
  filter: { category?: CredentialPattern['category']; configuredOnly?: boolean; query?: string },
): VaultEntry[] {
  return entries.filter((e) => {
    if (filter.category && e.pattern.category !== filter.category) return false;
    if (filter.configuredOnly && e.status === 'empty') return false;
    if (filter.query) {
      const q = filter.query.toLowerCase();
      const matches = e.pattern.name.toLowerCase().includes(q) || e.pattern.storageKey.toLowerCase().includes(q);
      if (!matches) return false;
    }
    return true;
  });
}

/**
 * Construit la liste affichable enrichie pour la nouvelle UI : multi-key vault
 * (chaque clé est sa propre card) + rechargeUrl auto-injecté.
 */
export function buildCredentialDisplays(): CredentialDisplay[] {
  const items: CredentialDisplay[] = [];
  let mkAll: KeyEntry[] = [];
  try {
    mkAll = multiKeyVault.listAll(true);
  } catch (err: unknown) {
    logger.warn('feature-vault', 'multiKeyVault.listAll failed', { err });
  }
  for (const k of mkAll) {
    const link = linksRegistry.get(k.service);
    const pattern = CREDENTIAL_PATTERNS.find((p) => p.storageKey.includes(k.service));
    const display: CredentialDisplay = {
      id: k.id,
      service: k.service,
      serviceName: link?.name ?? capitalize(k.service),
      category: classifyService(k.service, pattern?.category),
      status: k.status,
      source: 'multi-key',
    };
    if (k.alias !== undefined) display.alias = k.alias;
    if (k.addedAt !== undefined) display.addedAt = k.addedAt;
    if (k.lastTestedAt !== undefined) display.lastTestedAt = k.lastTestedAt;
    const recharge = linksRegistry.getRechargeLink(k.service);
    if (recharge) display.rechargeUrl = recharge;
    items.push(display);
  }
  return items;
}

/**
 * Stats agrégées pour le header.
 */
export function computeStats(): { total: number; active: number; failing: number; invalid: number } {
  const items = buildCredentialDisplays();
  const stats = { total: items.length, active: 0, failing: 0, invalid: 0 };
  for (const it of items) {
    if (it.status === 'active') stats.active += 1;
    else if (it.status === 'failing' || it.status === 'rate-limited') stats.failing += 1;
    else if (it.status === 'invalid') stats.invalid += 1;
  }
  return stats;
}

/**
 * Filtrage + groupement par catégorie pour le rendu accordéon.
 */
export function getCredentialsForCategory(cat: CategoryDef, query = ''): CredentialDisplay[] {
  const all = buildCredentialDisplays();
  const q = query.trim().toLowerCase();
  return all.filter((c) => {
    if (c.category !== cat.id) return false;
    if (!q) return true;
    return (
      c.service.toLowerCase().includes(q)
      || c.serviceName.toLowerCase().includes(q)
      || (c.alias?.toLowerCase().includes(q) ?? false)
    );
  });
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ──────────────────────────── Auto-detect + persist ──────────────────────────── */

/**
 * Auto-detect + store legacy (kept for back-compat tests + paste textarea).
 */
export async function autoDetectAndStore(
  input: string,
): Promise<{ ok: true; pattern_name: string; storage_key: string } | { ok: false; reason: string }> {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, reason: 'Entrée vide' };
  const detected = detectCredential(trimmed);
  if (!detected) return { ok: false, reason: 'Aucun pattern reconnu' };
  if (detected.category === 'forbidden') {
    return { ok: false, reason: '🚨 Type interdit (cartes/seed phrases jamais stockées)' };
  }
  try {
    const encrypted = await vault.encryptAuto(trimmed);
    localStorage.setItem(detected.storageKey, encrypted);
    return { ok: true, pattern_name: detected.name, storage_key: detected.storageKey };
  } catch (err: unknown) {
    logger.warn('vault-feature', 'autoDetectAndStore failed', { err });
    return { ok: false, reason: 'Erreur chiffrement' };
  }
}

/**
 * Removes credential from legacy storage.
 */
export function removeCredential(storageKey: string): boolean {
  try {
    localStorage.removeItem(storageKey);
    return true;
  } catch (err: unknown) {
    logger.warn('vault-feature', 'remove failed', { err });
    return false;
  }
}

/**
 * Export coffre legacy en JSON (pour backup).
 */
export function exportVaultJson(entries: ReadonlyArray<VaultEntry>): string {
  const payload = {
    exported_at: new Date().toISOString(),
    version: 1,
    entries: entries
      .filter((e) => e.status !== 'empty')
      .map((e) => {
        const raw = (() => {
          try {
            return localStorage.getItem(e.pattern.storageKey) ?? '';
          } catch {
            return '';
          }
        })();
        return { storage_key: e.pattern.storageKey, name: e.pattern.name, value_encrypted: raw };
      }),
  };
  return JSON.stringify(payload, null, 2);
}

/* ──────────────────────────── Rendering helpers ──────────────────────────── */

/**
 * Card HTML pour un credential (multi-key) — premium look.
 */
export function renderCredentialCard(c: CredentialDisplay): string {
  const statusColor = STATUS_COLORS[c.status] ?? '#888';
  const statusEmoji = STATUS_EMOJIS[c.status] ?? '⚪';
  const previewSafe = (c.preview ?? '').slice(0, 4) + '••••••' + (c.preview ?? '').slice(-4);
  const masked = c.preview ? previewSafe : '••••••';
  const recharge = c.rechargeUrl ?? '';
  const alias = c.alias ? `<span style="color:#888;font-size:11px">— ${escapeHtml(c.alias)}</span>` : '';
  const logoTag = c.logoUrl
    ? `<img src="${escapeHtml(c.logoUrl)}" alt="" loading="lazy" decoding="async" style="width:24px;height:24px;border-radius:6px" onerror="this.style.display='none'">`
    : '';
  const meta: string[] = [];
  if (c.addedAt) meta.push(`Ajouté ${formatRelativeTime(c.addedAt)}`);
  if (c.lastTestedAt) meta.push(`Testé ${formatRelativeTime(c.lastTestedAt)}`);
  const metaLine = meta.length > 0
    ? `<div style="display:flex;gap:8px;font-size:11px;color:#888;margin-bottom:10px">${meta.map((m) => `<span>${escapeHtml(m)}</span>`).join('')}</div>`
    : '';

  return `
    <div class="ax-cred-card" data-cred-id="${escapeHtml(c.id)}" data-service="${escapeHtml(c.service)}"
      style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:14px;transition:all 200ms ease-out;position:relative;display:flex;flex-direction:column;gap:8px">
      <div style="position:absolute;top:14px;right:14px;width:10px;height:10px;border-radius:50%;background:${escapeHtml(statusColor)};box-shadow:0 0 8px ${escapeHtml(statusColor)}" title="${escapeHtml(statusEmoji)} ${escapeHtml(c.status)}"></div>
      <div style="display:flex;align-items:center;gap:10px">
        ${logoTag}
        <strong style="font-size:15px;color:#fff">${escapeHtml(c.serviceName)}</strong>
        ${alias}
      </div>
      <code style="display:block;padding:6px 10px;background:rgba(0,0,0,0.3);border-radius:6px;font-size:11px;color:#888;font-family:'SF Mono',Menlo,monospace;letter-spacing:1px">${escapeHtml(masked)}</code>
      ${metaLine}
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <button data-action="test" data-cred-id="${escapeHtml(c.id)}"
          style="flex:1;min-width:80px;padding:6px 10px;background:rgba(34,204,119,0.1);color:#22cc77;border:1px solid rgba(34,204,119,0.3);border-radius:6px;cursor:pointer;font-size:11px;min-height:32px">🔄 Test</button>
        <button data-action="recharge" data-service="${escapeHtml(c.service)}" data-recharge-url="${escapeHtml(recharge)}" ${recharge ? '' : 'disabled'}
          style="flex:1;min-width:80px;padding:6px 10px;background:rgba(201,162,39,0.1);color:#c9a227;border:1px solid rgba(201,162,39,0.3);border-radius:6px;cursor:pointer;font-size:11px;min-height:32px;${recharge ? '' : 'opacity:0.4;cursor:not-allowed'}">💰 Recharger</button>
        <button data-action="discover-links" data-service="${escapeHtml(c.service)}"
          title="Cherche login/dashboard/billing/api_keys/usage en autonomie"
          style="flex:1;min-width:80px;padding:6px 10px;background:rgba(74,158,255,0.1);color:#4a9eff;border:1px solid rgba(74,158,255,0.3);border-radius:6px;cursor:pointer;font-size:11px;min-height:32px">🔍 Chercher liens</button>
        <button data-action="edit" data-cred-id="${escapeHtml(c.id)}"
          style="padding:6px 10px;background:rgba(255,255,255,0.05);color:#aaa;border:1px solid rgba(255,255,255,0.1);border-radius:6px;cursor:pointer;font-size:11px;min-height:32px">✏️</button>
        <button data-action="delete" data-cred-id="${escapeHtml(c.id)}"
          style="padding:6px 10px;background:rgba(255,91,91,0.1);color:#ff5b5b;border:1px solid rgba(255,91,91,0.3);border-radius:6px;cursor:pointer;font-size:11px;min-height:32px">🗑</button>
      </div>
    </div>
  `;
}

const STATUS_COLORS: Record<KeyStatus, string> = {
  active: '#22cc77',
  failing: '#ffaa00',
  'rate-limited': '#ffaa00',
  invalid: '#ff5b5b',
  unknown: '#888',
};

const STATUS_EMOJIS: Record<KeyStatus, string> = {
  active: '🟢',
  failing: '🟡',
  'rate-limited': '🟡',
  invalid: '🔴',
  unknown: '⚪',
};

/**
 * Formate un timestamp en "il y a Xmin / Xj".
 */
export function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 0 || !Number.isFinite(diff)) return 'à l\'instant';
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'à l\'instant';
  if (min < 60) return `il y a ${min}min`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `il y a ${hr}h`;
  const d = Math.floor(hr / 24);
  if (d < 30) return `il y a ${d}j`;
  const mo = Math.floor(d / 30);
  return `il y a ${mo} mois`;
}

/* ──────────────────────────── Render principal ──────────────────────────── */

let activeQuery = '';

export function render(rootEl: HTMLElement): void {
  /* P1-6 : cleanup ancien scope avant re-render */
  activeVaultScope?.cleanup();
  activeVaultScope = createCleanupScope('vault');
  const isAdmin = store.get('isAdmin') as boolean | undefined;
  if (!isAdmin) {
    rootEl.innerHTML = `<div style="padding:40px;text-align:center"><h2 style="color:#c9a227">🔒 Coffre admin</h2><p style="color:#a0a4c0">Cette section est réservée à l'admin Kevin.</p></div>`;
    return;
  }

  const stats = computeStats();

  rootEl.innerHTML = `
    <style>
      /* v13.3.22 UX iPhone PWA fix Kevin "j'ai dû descendre la page on voit plus le haut" :
       * Header + search bar STICKY robustes (top:0 sans interférence padding parent).
       * Compact-mode auto via class .ax-vault-scrolled (ajoutée en JS au scroll > 80px).
       * Bottom safe-area + FAB floating "Tester tout" si scrollé loin. */
      .ax-vault-page button:active { transform: scale(0.96); }
      .ax-vault-page details[open] > summary .ax-chevron { transform: rotate(180deg); }
      .ax-cred-card:hover { transform: translateY(-2px); border-color: rgba(232,184,48,0.3) !important; }
      .ax-vault-sticky-wrap {
        position: sticky;
        top: 0;
        z-index: 50;
        margin: 0 -16px;
        padding: 0 16px;
        background: rgba(8,8,15,0.96);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        border-bottom: 1px solid rgba(201,162,39,0.15);
        transition: padding 200ms ease, box-shadow 200ms ease;
      }
      .ax-vault-page.ax-vault-scrolled .ax-vault-sticky-wrap {
        padding-top: 4px;
        padding-bottom: 4px;
        box-shadow: 0 6px 18px rgba(0,0,0,0.45);
      }
      .ax-vault-page.ax-vault-scrolled .ax-vault-stats { display: none; }
      .ax-vault-page.ax-vault-scrolled .ax-vault-h1 { font-size: 18px; }
      .ax-vault-page.ax-vault-scrolled .ax-vault-search-row {
        margin-top: 6px;
        padding-bottom: 6px;
      }
      .ax-vault-fab {
        position: fixed;
        right: 16px;
        bottom: calc(env(safe-area-inset-bottom, 0px) + 80px);
        z-index: 18;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: linear-gradient(135deg,#c9a227,#e8b830);
        color: #000;
        font-size: 22px;
        font-weight: 700;
        border: none;
        cursor: pointer;
        box-shadow: 0 8px 24px rgba(201,162,39,0.45);
        opacity: 0;
        transform: translateY(16px) scale(0.9);
        pointer-events: none;
        transition: opacity 220ms ease, transform 220ms cubic-bezier(0.16,1,0.3,1);
      }
      .ax-vault-page.ax-vault-scrolled .ax-vault-fab {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }
      @media (prefers-reduced-motion: reduce) {
        .ax-cred-card, .ax-vault-sticky-wrap, .ax-vault-fab { transition: none !important; }
        .ax-vault-page button:active { transform: none !important; }
      }
    </style>
    <div class="ax-vault-page" style="padding:env(safe-area-inset-top,16px) 16px calc(env(safe-area-inset-bottom,16px) + 96px);max-width:1140px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif">

      <div class="ax-vault-sticky-wrap">
        <header style="padding:12px 0">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">
            <h1 class="ax-vault-h1" style="margin:0;font-size:24px;background:linear-gradient(135deg,#c9a227,#e8b830);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-weight:700;transition:font-size 200ms ease">🔐 Coffre Codes</h1>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <button id="ax-vault-add-manual" style="padding:8px 14px;background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;border:none;border-radius:10px;font-weight:700;cursor:pointer;font-size:13px;min-height:40px">+ Ajouter</button>
              <button id="ax-vault-test-all" style="padding:8px 14px;background:rgba(201,162,39,0.1);color:#c9a227;border:1px solid rgba(201,162,39,0.3);border-radius:10px;cursor:pointer;font-size:13px;min-height:40px">🔄 Tester tout</button>
            </div>
          </div>
          <div class="ax-vault-stats" style="display:flex;gap:14px;padding:8px 0 0;font-size:12px;color:#aaa;flex-wrap:wrap">
            <span>📊 ${stats.total} codes</span>
            <span style="color:#22cc77">🟢 ${stats.active} actifs</span>
            <span style="color:#ffaa00">🟡 ${stats.failing} dégradés</span>
            <span style="color:#ff5b5b">🔴 ${stats.invalid} invalides</span>
          </div>
        </header>

        <div class="ax-vault-search-row" style="padding-bottom:12px;transition:padding 200ms ease">
          <input type="text" id="ax-vault-search" value="${escapeHtml(activeQuery)}" placeholder="🔍 Chercher un service..."
            style="width:100%;padding:12px 16px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;color:#fff;font-size:15px;box-sizing:border-box;-webkit-appearance:none;min-height:44px">
        </div>
      </div>

      <div style="height:14px"></div>

      <section style="background:linear-gradient(135deg,rgba(20,20,35,0.7),rgba(14,14,28,0.5));border:1px solid rgba(232,184,48,0.18);border-radius:14px;padding:14px;margin-bottom:14px">
        <h3 style="margin:0 0 8px;font-size:13px;color:#e8b830;text-transform:uppercase;letter-spacing:0.08em;font-weight:700">🔍 Auto-détection rapide</h3>
        <p style="color:rgba(255,255,255,0.6);font-size:12px;margin:0 0 10px">Colle ici n'importe quelle clé API, Apex la reconnaît + la range automatiquement.</p>
        <textarea id="ax-vault-paste" placeholder="Colle ta clé ici (sk-ant-..., AIzaSy..., re_...)"
          style="width:100%;background:rgba(0,0,0,0.35);color:#fff;border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 12px;font-family:'SF Mono',Menlo,monospace;font-size:12px;min-height:60px;resize:vertical;box-sizing:border-box;-webkit-appearance:none"></textarea>
        <button id="ax-vault-paste-btn"
          style="margin-top:10px;padding:10px 20px;background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;min-height:40px">🔍 Détecter & stocker</button>
        <div id="ax-vault-paste-result" style="margin-top:8px;font-size:12px"></div>
      </section>

      <div id="ax-vault-categories" style="display:flex;flex-direction:column;gap:12px"></div>

      <section style="margin-top:18px;padding:14px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:14px">
        <h3 style="margin:0 0 10px;color:#e8b830;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;font-weight:700">💾 Backup & Restore</h3>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button id="ax-vault-export"
            style="padding:8px 14px;background:rgba(106,138,255,0.15);color:#6a8aff;border:1px solid rgba(106,138,255,0.3);border-radius:9px;font-size:12px;font-weight:600;cursor:pointer;min-height:36px">📥 Exporter (JSON)</button>
        </div>
      </section>

      <p style="text-align:center;color:rgba(255,255,255,0.4);font-size:11px;margin-top:16px;padding:14px;background:rgba(255,255,255,0.02);border-radius:12px;line-height:1.6">
        🛡 <strong style="color:rgba(255,255,255,0.6)">Sécurité</strong> : AES-GCM 256 + PBKDF2 200k iterations · Audit log immutable<br>
        <span style="opacity:0.7">FB_LOCAL strict pour ax_pin/ax_user · jamais de plaintext en backup</span>
      </p>

      <button id="ax-vault-fab" class="ax-vault-fab" type="button" aria-label="Tester toutes les clés" title="Tester toutes les clés">🔄</button>
      <div id="ax-vault-modal-root"></div>
    </div>
  `;

  renderCategories(rootEl);
  attachHandlers(rootEl);
  attachScrollUx(rootEl);
  logger.info('feature-vault', `rendered (${stats.total} entries)`);
}

/**
 * v13.3.22 UX iPhone PWA — auto compact-mode header au scroll + FAB.
 * Listener scroll passif (perf) + threshold 80px + cleanup auto via scope.
 */
function attachScrollUx(rootEl: HTMLElement): void {
  const page = rootEl.querySelector<HTMLElement>('.ax-vault-page');
  const fab = rootEl.querySelector<HTMLButtonElement>('#ax-vault-fab');
  if (!page) return;

  let lastY = 0;
  let raf = 0;
  const onScroll = (): void => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      if (y === lastY) return;
      lastY = y;
      if (y > 80) page.classList.add('ax-vault-scrolled');
      else page.classList.remove('ax-vault-scrolled');
    });
  };
  if (activeVaultScope) {
    activeVaultScope.bind(window, 'scroll', onScroll, { passive: true });
  } else {
    window.addEventListener('scroll', onScroll, { passive: true });
  }
  /* Initial state */
  onScroll();

  /* FAB → trigger "Tester tout" handler (réutilise listener du bouton header) */
  if (fab && activeVaultScope) {
    activeVaultScope.bind(fab, 'click', () => {
      haptic.tap();
      const headerBtn = rootEl.querySelector<HTMLButtonElement>('#ax-vault-test-all');
      headerBtn?.click();
    });
  }
}

function renderCategories(rootEl: HTMLElement): void {
  const container = rootEl.querySelector<HTMLDivElement>('#ax-vault-categories');
  if (!container) return;
  /* H3 audit fix v13.3.74 — skeleton si pas encore décrypté (computeStats peut être 0 au boot) */
  const stats = computeStats();
  if (stats.total === 0 && !container.dataset['axInitialized']) {
    container.dataset['axInitialized'] = '1';
    const dispose = skeleton(container, 'vault-cards');
    /* Auto-clear après 250ms (decrypt sync localStorage en général < 100ms) */
    setTimeout(() => {
      dispose();
      /* Re-render once decrypt done */
      renderCategories(rootEl);
    }, 250);
    return;
  }
  container.innerHTML = CATEGORIES.map((cat) => {
    const credsInCat = getCredentialsForCategory(cat, activeQuery);
    /* Hide empty cats sauf identity (Kevin veut toujours voir cette section) */
    if (credsInCat.length === 0 && cat.id !== 'identity') return '';
    const isOpen = credsInCat.length > 0;
    return `
      <details class="ax-cat" data-cat-id="${escapeHtml(cat.id)}" ${isOpen ? 'open' : ''}
        style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:14px;overflow:hidden">
        <summary style="padding:14px 16px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;font-weight:600;list-style:none;-webkit-tap-highlight-color:transparent;min-height:44px">
          <span>${escapeHtml(cat.label)} <span style="color:#888;font-weight:400;font-size:13px">(${credsInCat.length})</span></span>
          <span class="ax-chevron" style="color:#888;transition:transform 200ms ease-out">▼</span>
        </summary>
        <div style="padding:0 14px 14px;display:grid;grid-template-columns:repeat(auto-fill, minmax(280px,1fr));gap:10px">
          ${credsInCat.map((c) => renderCredentialCard(c)).join('')}
          ${credsInCat.length === 0 ? `
            <div style="padding:20px;color:#666;text-align:center;grid-column:1/-1;font-size:13px">
              Aucun code dans cette catégorie<br>
              <button data-action="add-to-cat" data-cat-id="${escapeHtml(cat.id)}"
                style="margin-top:10px;padding:8px 14px;background:rgba(201,162,39,0.1);color:#c9a227;border:1px solid rgba(201,162,39,0.3);border-radius:8px;cursor:pointer;font-size:12px;min-height:36px">
                + Ajouter ${escapeHtml(cat.label)}
              </button>
            </div>
          ` : ''}
        </div>
      </details>
    `;
  }).join('');
}

/* ──────────────────────────── Handlers ──────────────────────────── */

function attachHandlers(rootEl: HTMLElement): void {
  /* Search live (debounced) */
  const searchEl = rootEl.querySelector<HTMLInputElement>('#ax-vault-search');
  if (searchEl) {
    let debounce: ReturnType<typeof setTimeout> | null = null;
    activeVaultScope!.bind(searchEl, 'input', () => {
      if (debounce) clearTimeout(debounce);
      debounce = setTimeout(() => {
        activeQuery = searchEl.value.trim();
        renderCategories(rootEl);
        attachCardHandlers(rootEl);
      }, 240);
    });
  }

  /* "+ Ajouter" header button */
  const addBtn = rootEl.querySelector<HTMLButtonElement>('#ax-vault-add-manual');
  if (addBtn && activeVaultScope) activeVaultScope.bind(addBtn, 'click', () => {
    haptic.tap();
    openAddModal(rootEl);
  });

  /* "🔄 Tester tout" */
  const testAllBtn = rootEl.querySelector<HTMLButtonElement>('#ax-vault-test-all');
  if (testAllBtn && activeVaultScope) activeVaultScope.bind(testAllBtn, 'click', () => {
    void (async () => {
      haptic.tap();
      toast.info('Test de toutes les clés en cours…');
      try {
        const result = await multiKeyVault.healthCheckAll();
        toast.success(`✅ ${result.tested} testées · ${result.recovered} récupérées · ${result.stillDown} HS`);
        render(rootEl);
      } catch (err: unknown) {
        logger.warn('feature-vault', 'testAll failed', { err });
        toast.error('Erreur pendant le test global');
      }
    })();
  });

  /* Auto-detect paste */
  const pasteBtn = rootEl.querySelector<HTMLButtonElement>('#ax-vault-paste-btn');
  if (pasteBtn && activeVaultScope) activeVaultScope.bind(pasteBtn, 'click', () => {
    void (async () => {
      haptic.tap();
      const ta = rootEl.querySelector<HTMLTextAreaElement>('#ax-vault-paste');
      const result = rootEl.querySelector<HTMLDivElement>('#ax-vault-paste-result');
      if (!ta || !result) return;
      const r = await autoDetectAndStore(ta.value);
      if (r.ok) {
        haptic.success();
        toast.success(`✅ ${r.pattern_name} stocké`);
        result.innerHTML = `<div style="padding:8px;background:rgba(34,204,119,.1);color:#22cc77;border-radius:8px">✅ ${escapeHtml(r.pattern_name)} → ${escapeHtml(r.storage_key)}</div>`;
        ta.value = '';
        /* Tente aussi addition multi-key (si service connu via storageKey) */
        const detected = detectCredential(ta.value.trim());
        if (detected) {
          const serviceFromKey = detected.storageKey.replace(/^(ax_|apex_v13_)/, '').replace(/_(?:key|token|pat|sk|pk|id|secret)$/, '');
          try {
            await multiKeyVault.addKey(serviceFromKey, ta.value.trim());
          } catch {
            /* legacy mode only — not blocking */
          }
        }
        render(rootEl);
      } else {
        haptic.error();
        toast.error(r.reason);
        result.innerHTML = `<div style="padding:8px;background:rgba(255,88,88,.1);color:#ff5858;border-radius:8px">⚠ ${escapeHtml(r.reason)}</div>`;
      }
    })();
  });

  /* Export JSON */
  const exportBtn = rootEl.querySelector<HTMLButtonElement>('#ax-vault-export');
  if (exportBtn && activeVaultScope) activeVaultScope.bind(exportBtn, 'click', () => {
    haptic.tap();
    const json = exportVaultJson(listVaultEntries());
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `apex-vault-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Coffre exporté (chiffré)');
  });

  attachCardHandlers(rootEl);
}

function attachCardHandlers(rootEl: HTMLElement): void {
  /* Per-card actions */
  rootEl.querySelectorAll<HTMLButtonElement>('[data-action="test"]').forEach((btn) => {
    activeVaultScope!.bind(btn, 'click', (e) => {
      e.stopPropagation();
      const credId = btn.dataset['credId'] ?? '';
      void onTestKey(rootEl, credId, btn);
    });
  });
  rootEl.querySelectorAll<HTMLButtonElement>('[data-action="recharge"]').forEach((btn) => {
    activeVaultScope!.bind(btn, 'click', (e) => {
      e.stopPropagation();
      const url = btn.dataset['rechargeUrl'] ?? '';
      const service = btn.dataset['service'] ?? '';
      onRecharge(url, service);
    });
  });
  rootEl.querySelectorAll<HTMLButtonElement>('[data-action="discover-links"]').forEach((btn) => {
    activeVaultScope!.bind(btn, 'click', (e) => {
      e.stopPropagation();
      const service = btn.dataset['service'] ?? '';
      void onDiscoverLinks(rootEl, service, btn);
    });
  });
  rootEl.querySelectorAll<HTMLButtonElement>('[data-action="edit"]').forEach((btn) => {
    activeVaultScope!.bind(btn, 'click', (e) => {
      e.stopPropagation();
      const credId = btn.dataset['credId'] ?? '';
      openEditModal(rootEl, credId);
    });
  });
  rootEl.querySelectorAll<HTMLButtonElement>('[data-action="delete"]').forEach((btn) => {
    activeVaultScope!.bind(btn, 'click', (e) => {
      e.stopPropagation();
      const credId = btn.dataset['credId'] ?? '';
      onDeleteKey(rootEl, credId);
    });
  });
  rootEl.querySelectorAll<HTMLButtonElement>('[data-action="add-to-cat"]').forEach((btn) => {
    activeVaultScope!.bind(btn, 'click', (e) => {
      e.stopPropagation();
      const catId = btn.dataset['catId'] ?? '';
      openAddModal(rootEl, catId);
    });
  });
}

/* ──────────────────────────── Action implementations ──────────────────────────── */

async function onTestKey(rootEl: HTMLElement, credId: string, btn: HTMLButtonElement): Promise<void> {
  if (!credId) return;
  haptic.tap();
  const original = btn.textContent;
  btn.textContent = '⏳ Test…';
  btn.setAttribute('disabled', 'true');
  try {
    const r = await multiKeyVault.testKey(credId);
    if (r.ok) {
      haptic.success();
      toast.success(`✅ Active (${r.latencyMs}ms)`);
    } else {
      haptic.error();
      toast.error(`❌ ${r.reason ?? 'Test échoué'}`);
    }
    render(rootEl);
  } catch (err: unknown) {
    logger.warn('feature-vault', 'testKey failed', { err });
    haptic.error();
    toast.error('Erreur pendant le test');
    btn.textContent = original;
    btn.removeAttribute('disabled');
  }
}

function onRecharge(url: string, service: string): void {
  haptic.tap();
  if (!url) {
    toast.warn(`Aucune page recharge connue pour ${service}`);
    return;
  }
  try {
    window.open(url, '_blank', 'noopener,noreferrer');
  } catch (err: unknown) {
    logger.warn('feature-vault', 'recharge open failed', { err });
    toast.error('Impossible d\'ouvrir le lien');
  }
}

/**
 * Cherche en autonomie tous les liens (login/dashboard/billing/api_keys/usage/...)
 * pour un service. Cascade : pre_configured → web_search → pattern_discovery.
 *
 * UI feedback : spinner sur bouton, toast avec count + sources trouvées.
 */
async function onDiscoverLinks(rootEl: HTMLElement, service: string, btn: HTMLButtonElement): Promise<void> {
  if (!service) return;
  haptic.tap();
  const original = btn.textContent;
  btn.textContent = '⏳ Recherche…';
  btn.setAttribute('disabled', 'true');
  try {
    const result = await autoDiscoverLinks.discover(service, { force: true });
    const found: string[] = [];
    if (result.login) found.push('login');
    if (result.dashboard) found.push('dashboard');
    if (result.billing) found.push('billing');
    if (result.api_keys) found.push('api_keys');
    if (result.usage) found.push('usage');
    if (result.docs) found.push('docs');
    if (result.password_reset) found.push('reset_pw');
    if (result.account_settings) found.push('settings');
    if (result.support) found.push('support');
    if (result.status_page) found.push('status');
    if (result.alive && found.length > 0) {
      haptic.success();
      toast.success(`🔗 ${found.length} liens trouvés (${result.source}) : ${found.join(', ')}`);
    } else {
      haptic.error();
      toast.warn(`Aucun lien validé pour ${service} — réessaie plus tard`);
    }
    render(rootEl);
  } catch (err: unknown) {
    logger.warn('feature-vault', 'discoverLinks failed', { err });
    haptic.error();
    toast.error('Erreur pendant la recherche de liens');
  } finally {
    btn.textContent = original;
    btn.removeAttribute('disabled');
  }
}

function onDeleteKey(rootEl: HTMLElement, credId: string): void {
  if (!credId) return;
  haptic.tap();
  /* v13.3.54 fix Kevin "je ne peux pas effacer les doublons api anthropic" :
   * AVANT : appel markInvalid → clé restait dans la liste (juste status invalide).
   * APRÈS : removeKey direct → clé VRAIMENT supprimée + whitelist deleted (POUBELLE-FIX
   * v13.3.51) empêche restoration depuis IDB shadow / Firebase. */
  if (!window.confirm('Supprimer cette clé définitivement ? Elle sera retirée du Coffre + ne sera plus restaurée auto.')) {
    return;
  }
  try {
    multiKeyVault.removeKey(credId);
    haptic.success();
    toast.success('Clé supprimée définitivement ✓');
    render(rootEl);
  } catch (err: unknown) {
    logger.warn('feature-vault', 'delete failed', { err });
    haptic.error();
    toast.error('Suppression échouée');
  }
}

/* ──────────────────────────── Modals ──────────────────────────── */

function modalRoot(rootEl: HTMLElement): HTMLElement {
  let root = rootEl.querySelector<HTMLDivElement>('#ax-vault-modal-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'ax-vault-modal-root';
    rootEl.appendChild(root);
  }
  return root;
}

function closeModal(rootEl: HTMLElement): void {
  const root = modalRoot(rootEl);
  root.innerHTML = '';
}

function openAddModal(rootEl: HTMLElement, presetCategory?: string): void {
  const root = modalRoot(rootEl);
  const catOpts = CATEGORIES
    .filter((c) => c.id !== 'other')
    .map((c) => `<option value="${escapeHtml(c.id)}" ${presetCategory === c.id ? 'selected' : ''}>${escapeHtml(c.label)}</option>`)
    .join('');
  root.innerHTML = `
    <div role="dialog" aria-modal="true" aria-label="Ajouter une clé"
      style="position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)">
      <div style="background:#0e0e1c;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:20px;max-width:440px;width:100%;max-height:90vh;overflow-y:auto">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
          <h2 style="margin:0;font-size:18px;color:#e8b830">+ Ajouter une clé</h2>
          <button id="ax-vault-modal-close" aria-label="Fermer"
            style="background:transparent;border:0;color:#aaa;font-size:24px;cursor:pointer;min-height:32px;min-width:32px">×</button>
        </div>
        <label style="display:block;margin-bottom:10px;font-size:13px;color:rgba(255,255,255,0.7)">
          Catégorie
          <select id="ax-vault-add-cat" style="width:100%;margin-top:4px;padding:10px;background:rgba(255,255,255,0.04);color:#fff;border:1px solid rgba(255,255,255,0.1);border-radius:8px;font-size:14px;min-height:44px">
            ${catOpts}
          </select>
        </label>
        <label style="display:block;margin-bottom:10px;font-size:13px;color:rgba(255,255,255,0.7)">
          Service (ex: anthropic, openai, stripe)
          <input type="text" id="ax-vault-add-service" placeholder="anthropic"
            style="width:100%;margin-top:4px;padding:10px;background:rgba(255,255,255,0.04);color:#fff;border:1px solid rgba(255,255,255,0.1);border-radius:8px;font-size:14px;min-height:44px;box-sizing:border-box;-webkit-appearance:none">
        </label>
        <label style="display:block;margin-bottom:10px;font-size:13px;color:rgba(255,255,255,0.7)">
          Alias (optionnel)
          <input type="text" id="ax-vault-add-alias" placeholder="perso, client X..."
            style="width:100%;margin-top:4px;padding:10px;background:rgba(255,255,255,0.04);color:#fff;border:1px solid rgba(255,255,255,0.1);border-radius:8px;font-size:14px;min-height:44px;box-sizing:border-box;-webkit-appearance:none">
        </label>
        <label style="display:block;margin-bottom:10px;font-size:13px;color:rgba(255,255,255,0.7)">
          Valeur (clé / token)
          <textarea id="ax-vault-add-value" placeholder="Colle la clé ici"
            style="width:100%;margin-top:4px;padding:10px;background:rgba(0,0,0,0.4);color:#fff;border:1px solid rgba(255,255,255,0.1);border-radius:8px;font-size:13px;min-height:80px;font-family:'SF Mono',Menlo,monospace;box-sizing:border-box;-webkit-appearance:none;resize:vertical"></textarea>
        </label>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px">
          <button id="ax-vault-add-detect"
            style="flex:1;min-width:140px;padding:10px;background:rgba(106,138,255,0.15);color:#6a8aff;border:1px solid rgba(106,138,255,0.3);border-radius:8px;cursor:pointer;font-size:13px;min-height:44px">🔍 Détecter automatiquement</button>
          <button id="ax-vault-add-save"
            style="flex:1;min-width:140px;padding:10px;background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:700;min-height:44px">🔒 Chiffrer & Sauvegarder</button>
        </div>
      </div>
    </div>
  `;
  (() => { const __b = root.querySelector<HTMLButtonElement>('#ax-vault-modal-close'); if (__b && activeVaultScope) activeVaultScope.bind(__b, 'click', () => closeModal(rootEl)); })();
  /* Click outside */
  const dialog = root.querySelector<HTMLDivElement>('[role="dialog"]');
  if (dialog && activeVaultScope) activeVaultScope.bind(dialog, 'click', (e) => {
    if (e.target === dialog) closeModal(rootEl);
  });
  /* Auto-detect button */
  const addDetectBtn = root.querySelector<HTMLButtonElement>('#ax-vault-add-detect');
  if (addDetectBtn && activeVaultScope) activeVaultScope.bind(addDetectBtn, 'click', () => {
    void (async () => {
      haptic.tap();
      const valueEl = root.querySelector<HTMLTextAreaElement>('#ax-vault-add-value');
      if (!valueEl) return;
      const detected = detectCredential(valueEl.value.trim());
      if (!detected) {
        toast.warn('Aucun pattern reconnu');
        return;
      }
      if (detected.category === 'forbidden') {
        toast.error('🚨 Type interdit');
        return;
      }
      const serviceEl = root.querySelector<HTMLInputElement>('#ax-vault-add-service');
      const catEl = root.querySelector<HTMLSelectElement>('#ax-vault-add-cat');
      if (serviceEl) {
        const sk = detected.storageKey.replace(/^(ax_|apex_v13_)/, '').replace(/_(?:key|token|pat|sk|pk|id|secret)$/, '');
        serviceEl.value = sk;
      }
      if (catEl) catEl.value = classifyService(serviceEl?.value ?? '', detected.category);
      toast.success(`Détecté: ${detected.name}`);
    })();
  });
  /* Save */
  const addSaveBtn = root.querySelector<HTMLButtonElement>('#ax-vault-add-save');
  if (addSaveBtn && activeVaultScope) activeVaultScope.bind(addSaveBtn, 'click', () => {
    void (async () => {
      haptic.tap();
      const service = root.querySelector<HTMLInputElement>('#ax-vault-add-service')?.value.trim() ?? '';
      const alias = root.querySelector<HTMLInputElement>('#ax-vault-add-alias')?.value.trim() ?? '';
      const value = root.querySelector<HTMLTextAreaElement>('#ax-vault-add-value')?.value.trim() ?? '';
      if (!service || !value) {
        toast.warn('Service et valeur requis');
        return;
      }
      try {
        const opts: { alias?: string } = {};
        if (alias) opts.alias = alias;
        await multiKeyVault.addKey(service, value, opts);
        toast.success(`✅ Clé ${service} chiffrée + sauvegardée`);
        closeModal(rootEl);
        render(rootEl);
      } catch (err: unknown) {
        logger.warn('feature-vault', 'add manual failed', { err });
        toast.error('Erreur pendant la sauvegarde');
      }
    })();
  });
}

function openEditModal(rootEl: HTMLElement, credId: string): void {
  const root = modalRoot(rootEl);
  const entry = multiKeyVault.listAll(true).find((k) => k.id === credId);
  if (!entry) {
    toast.error('Clé introuvable');
    return;
  }
  root.innerHTML = `
    <div role="dialog" aria-modal="true" aria-label="Modifier une clé"
      style="position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)">
      <div style="background:#0e0e1c;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:20px;max-width:440px;width:100%">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
          <h2 style="margin:0;font-size:18px;color:#e8b830">✏️ Modifier ${escapeHtml(entry.service)}</h2>
          <button id="ax-vault-modal-close" aria-label="Fermer"
            style="background:transparent;border:0;color:#aaa;font-size:24px;cursor:pointer;min-height:32px;min-width:32px">×</button>
        </div>
        <p style="color:rgba(255,255,255,0.6);font-size:12px;margin:0 0 12px">Une nouvelle valeur remplacera l'ancienne (chiffrement AES-GCM 256).</p>
        <label style="display:block;margin-bottom:10px;font-size:13px;color:rgba(255,255,255,0.7)">
          Nouvelle valeur
          <textarea id="ax-vault-edit-value" placeholder="Colle la nouvelle clé"
            style="width:100%;margin-top:4px;padding:10px;background:rgba(0,0,0,0.4);color:#fff;border:1px solid rgba(255,255,255,0.1);border-radius:8px;font-size:13px;min-height:80px;font-family:'SF Mono',Menlo,monospace;box-sizing:border-box;-webkit-appearance:none;resize:vertical"></textarea>
        </label>
        <label style="display:block;margin-bottom:10px;font-size:13px;color:rgba(255,255,255,0.7)">
          Alias (optionnel)
          <input type="text" id="ax-vault-edit-alias" value="${escapeHtml(entry.alias ?? '')}"
            style="width:100%;margin-top:4px;padding:10px;background:rgba(255,255,255,0.04);color:#fff;border:1px solid rgba(255,255,255,0.1);border-radius:8px;font-size:14px;min-height:44px;box-sizing:border-box;-webkit-appearance:none">
        </label>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px">
          <button id="ax-vault-edit-cancel"
            style="flex:1;min-width:120px;padding:10px;background:rgba(255,255,255,0.04);color:#aaa;border:1px solid rgba(255,255,255,0.1);border-radius:8px;cursor:pointer;font-size:13px;min-height:44px">Annuler</button>
          <button id="ax-vault-edit-save"
            style="flex:1;min-width:120px;padding:10px;background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:700;min-height:44px">💾 Enregistrer</button>
        </div>
      </div>
    </div>
  `;
  (() => { const __b = root.querySelector<HTMLButtonElement>('#ax-vault-modal-close'); if (__b && activeVaultScope) activeVaultScope.bind(__b, 'click', () => closeModal(rootEl)); })();
  (() => { const __c = root.querySelector<HTMLButtonElement>('#ax-vault-edit-cancel'); if (__c && activeVaultScope) activeVaultScope.bind(__c, 'click', () => closeModal(rootEl)); })();
  const editSaveBtn = root.querySelector<HTMLButtonElement>('#ax-vault-edit-save');
  if (editSaveBtn && activeVaultScope) activeVaultScope.bind(editSaveBtn, 'click', () => {
    void (async () => {
      haptic.tap();
      const newValue = root.querySelector<HTMLTextAreaElement>('#ax-vault-edit-value')?.value.trim() ?? '';
      const newAlias = root.querySelector<HTMLInputElement>('#ax-vault-edit-alias')?.value.trim() ?? '';
      if (!newValue) {
        toast.warn('Valeur requise');
        return;
      }
      try {
        /* Marque l'ancienne invalide + ajoute la nouvelle */
        multiKeyVault.markInvalid(credId, 'replaced via edit');
        const opts: { alias?: string } = {};
        if (newAlias) opts.alias = newAlias;
        await multiKeyVault.addKey(entry.service, newValue, opts);
        toast.success('✅ Clé mise à jour');
        closeModal(rootEl);
        render(rootEl);
      } catch (err: unknown) {
        logger.warn('feature-vault', 'edit save failed', { err });
        toast.error('Erreur pendant la modification');
      }
    })();
  });
}
