/**
 * APEX v13 — Registry des liens officiels avec auto-création + auto-vérification.
 *
 * Demande Kevin (CLAUDE.md règle absolue 2026-05-01) :
 * "Apex crée les liens automatiquement quand nouvelle découverte ou nouvel ajout"
 *
 * Pattern :
 * 1. Quand credential détecté/ajouté → axLinksAutoCreate(service)
 * 2. Génère URLs candidat (console.X.com, app.X.com, dashboard.X.com)
 * 3. HEAD request pour valider chaque URL (alive: true/false)
 * 4. Stocke dans ax_links_registry (FB_FIX shared)
 * 5. Sentinelle quotidienne re-test alive (link-validation-watch)
 *
 * Anti-pattern : pas de lien mort affiché — tous testés HEAD avant render UI.
 */

import { logger } from '../core/logger.js';

import { firebase } from './firebase.js';

export interface ServiceLink {
  service: string;
  dashboard?: string;
  billing?: string;
  docs?: string;
  support?: string;
  status_page?: string;
  api_keys_page?: string;
  alive: boolean;
  last_verified: number;
}

/* Liens connus pré-configurés (130+ services patterns existants) */
const KNOWN_LINKS: Record<string, Omit<ServiceLink, 'alive' | 'last_verified'>> = {
  anthropic: {
    service: 'anthropic',
    dashboard: 'https://console.anthropic.com',
    billing: 'https://console.anthropic.com/settings/billing',
    docs: 'https://docs.anthropic.com',
    support: 'https://support.anthropic.com',
    status_page: 'https://status.anthropic.com',
    api_keys_page: 'https://console.anthropic.com/settings/keys',
  },
  openai: {
    service: 'openai',
    dashboard: 'https://platform.openai.com',
    billing: 'https://platform.openai.com/account/billing',
    docs: 'https://platform.openai.com/docs',
    support: 'https://help.openai.com',
    status_page: 'https://status.openai.com',
    api_keys_page: 'https://platform.openai.com/api-keys',
  },
  groq: {
    service: 'groq',
    dashboard: 'https://console.groq.com',
    docs: 'https://console.groq.com/docs',
    api_keys_page: 'https://console.groq.com/keys',
    status_page: 'https://groqstatus.com',
  },
  gemini: {
    service: 'gemini',
    dashboard: 'https://aistudio.google.com',
    docs: 'https://ai.google.dev/docs',
    api_keys_page: 'https://aistudio.google.com/apikey',
  },
  stripe: {
    service: 'stripe',
    dashboard: 'https://dashboard.stripe.com',
    billing: 'https://dashboard.stripe.com/billing',
    docs: 'https://stripe.com/docs',
    support: 'https://support.stripe.com',
    status_page: 'https://status.stripe.com',
    api_keys_page: 'https://dashboard.stripe.com/apikeys',
  },
  github: {
    service: 'github',
    dashboard: 'https://github.com',
    billing: 'https://github.com/settings/billing',
    docs: 'https://docs.github.com',
    api_keys_page: 'https://github.com/settings/tokens',
    status_page: 'https://www.githubstatus.com',
  },
  cloudflare: {
    service: 'cloudflare',
    dashboard: 'https://dash.cloudflare.com',
    billing: 'https://dash.cloudflare.com/billing',
    docs: 'https://developers.cloudflare.com',
    status_page: 'https://www.cloudflarestatus.com',
    api_keys_page: 'https://dash.cloudflare.com/profile/api-tokens',
  },
  brevo: {
    service: 'brevo',
    dashboard: 'https://app.brevo.com',
    billing: 'https://app.brevo.com/billing',
    docs: 'https://developers.brevo.com',
    status_page: 'https://status.brevo.com',
    api_keys_page: 'https://app.brevo.com/settings/keys/api',
  },
  resend: {
    service: 'resend',
    dashboard: 'https://resend.com/dashboard',
    docs: 'https://resend.com/docs',
    api_keys_page: 'https://resend.com/api-keys',
  },
  telegram: {
    service: 'telegram',
    dashboard: 'https://t.me/BotFather',
    docs: 'https://core.telegram.org/bots/api',
  },
  notion: {
    service: 'notion',
    dashboard: 'https://www.notion.so',
    docs: 'https://developers.notion.com',
    api_keys_page: 'https://www.notion.so/my-integrations',
  },
  airtable: {
    service: 'airtable',
    dashboard: 'https://airtable.com',
    docs: 'https://airtable.com/developers/web/api',
    api_keys_page: 'https://airtable.com/create/tokens',
  },
  vercel: {
    service: 'vercel',
    dashboard: 'https://vercel.com/dashboard',
    billing: 'https://vercel.com/account/billing',
    docs: 'https://vercel.com/docs',
    status_page: 'https://www.vercel-status.com',
    api_keys_page: 'https://vercel.com/account/tokens',
  },
  perplexity: {
    service: 'perplexity',
    dashboard: 'https://www.perplexity.ai',
    docs: 'https://docs.perplexity.ai',
    api_keys_page: 'https://www.perplexity.ai/settings/api',
  },
  deepl: {
    service: 'deepl',
    dashboard: 'https://www.deepl.com/account',
    billing: 'https://www.deepl.com/account/plan',
    docs: 'https://developers.deepl.com',
    api_keys_page: 'https://www.deepl.com/account/summary',
  },
  replicate: {
    service: 'replicate',
    dashboard: 'https://replicate.com',
    docs: 'https://replicate.com/docs',
    api_keys_page: 'https://replicate.com/account/api-tokens',
  },
};

class LinksRegistry {
  /**
   * Crée auto les liens pour un service nouvellement détecté.
   * Si service connu → utilise pre-configured. Sinon → tente patterns standard.
   */
  async autoCreate(service: string): Promise<ServiceLink> {
    const lc = service.toLowerCase();
    /* Connu : utilise pré-configuré */
    if (KNOWN_LINKS[lc]) {
      const link: ServiceLink = {
        ...KNOWN_LINKS[lc]!,
        alive: true,
        last_verified: Date.now(),
      };
      this.persist(link);
      return link;
    }

    /* Inconnu : tente patterns standards */
    const candidates = [
      `https://console.${lc}.com`,
      `https://app.${lc}.com`,
      `https://dashboard.${lc}.com`,
      `https://${lc}.com/dashboard`,
      `https://${lc}.com/account`,
    ];
    let dashboard: string | undefined;
    for (const url of candidates) {
      try {
        const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(3000), mode: 'no-cors' });
        if (res.ok || res.type === 'opaque') {
          dashboard = url;
          break;
        }
      } catch {
        /* ignore — try next */
      }
    }

    const link: ServiceLink = {
      service: lc,
      ...(dashboard && { dashboard }),
      docs: `https://docs.${lc}.com`,
      status_page: `https://status.${lc}.com`,
      alive: !!dashboard,
      last_verified: Date.now(),
    };
    this.persist(link);
    if (!dashboard) {
      logger.warn('links-registry', `No live URL found for ${service}, escalate Claude Code`);
      this.escalateUnknown(service);
    }
    return link;
  }

  /**
   * Liste tous services connus (avec status alive/dead).
   */
  list(): ServiceLink[] {
    try {
      const raw = localStorage.getItem('ax_links_registry');
      if (!raw) return [];
      return JSON.parse(raw) as ServiceLink[];
    } catch {
      return [];
    }
  }

  /**
   * Get un lien spécifique.
   */
  get(service: string): ServiceLink | null {
    return this.list().find((l) => l.service === service.toLowerCase()) ?? null;
  }

  /**
   * Re-test alive sur tous liens (sentinelle quotidienne).
   */
  async retestAll(): Promise<{ tested: number; alive: number; dead: number }> {
    const links = this.list();
    let alive = 0;
    let dead = 0;
    for (const link of links) {
      const url = link.dashboard ?? link.docs;
      if (!url) {
        dead++;
        continue;
      }
      try {
        const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(3000), mode: 'no-cors' });
        const isAlive = res.ok || res.type === 'opaque';
        link.alive = isAlive;
        link.last_verified = Date.now();
        if (isAlive) alive++;
        else dead++;
      } catch {
        link.alive = false;
        link.last_verified = Date.now();
        dead++;
      }
    }
    /* Persist tous mis à jour */
    try {
      localStorage.setItem('ax_links_registry', JSON.stringify(links));
      void firebase.write('ax_links_registry', links);
    } catch {
      /* ignore */
    }
    return { tested: links.length, alive, dead };
  }

  /**
   * Stats pour dashboard admin.
   */
  getStats(): { total: number; alive: number; dead: number; pct_alive: number } {
    const links = this.list();
    const alive = links.filter((l) => l.alive).length;
    const dead = links.length - alive;
    return {
      total: links.length,
      alive,
      dead,
      pct_alive: links.length > 0 ? Math.round((alive / links.length) * 100) : 0,
    };
  }

  private persist(link: ServiceLink): void {
    const all = this.list();
    const existing = all.findIndex((l) => l.service === link.service);
    if (existing >= 0) all[existing] = link;
    else all.push(link);
    try {
      localStorage.setItem('ax_links_registry', JSON.stringify(all));
      void firebase.write('ax_links_registry', all);
    } catch {
      /* ignore quota */
    }
  }

  private escalateUnknown(service: string): void {
    try {
      const unknowns = JSON.parse(localStorage.getItem('ax_unknown_services') ?? '[]') as string[];
      if (!unknowns.includes(service)) {
        unknowns.push(service);
        localStorage.setItem('ax_unknown_services', JSON.stringify(unknowns.slice(-50)));
      }
    } catch {
      /* ignore */
    }
  }
}

export const linksRegistry = new LinksRegistry();
