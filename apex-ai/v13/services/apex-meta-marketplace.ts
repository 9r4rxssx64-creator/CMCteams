/**
 * APEX v13 — Méta-Marketplace : hub unifié vers 30+ marketplaces du monde.
 *
 * Demande Kevin (2026-05-07, ABSOLUE) :
 * "Il faut peut-être inclure tous les marketplace pour apex. Pas que les plugins,
 *  tous les marketplace disponibles pour qu'il aille chercher tout ce qui qu'il a
 *  besoin en toute autonomie et ou si je lui demande."
 *
 * Mission :
 *  - Agrège 30+ marketplaces (IA/ML, code, GitHub, plugins/extensions, automation,
 *    SaaS, cloud, APIs, datasets, anthropic-specific) sous une API unifiée.
 *  - Search cross-marketplace en parallèle (Promise.allSettled — gracieux si KO).
 *  - Détail item, trending, install-dispatch, recommandations contextuelles.
 *  - HONNÊTETÉ stricte : flag `pwa_compatible` + `cors_friendly` exposé sans mensonge.
 *    Apex sait quand il peut search direct vs quand un proxy/OAuth est requis.
 *  - Audit log immutable à chaque install (RGPD + traçabilité).
 *  - Persistance localStorage `apex_v13_meta_marketplace_state` (favoris, history).
 *
 * Anti-pattern Kevin :
 *  - Pas de promesse vide (marketplace listé mais inutilisable sans le dire).
 *  - Pas de prétention OAuth/proxy si pas configuré → return error explicite.
 *  - Pas de doublon d'install (idempotent côté store local).
 *
 * Règle Kevin "PROTECTION ≠ STABILITÉ" + "TOUT AU MAX TOUJOURS" :
 *  - Tous les providers exposés via system prompt enrichi (Apex IA sait qu'ils existent).
 *  - searchAll dispatche en parallèle, n'attend jamais un seul provider lent.
 *  - Lazy import (pas de surcharge boot — fetch à la demande).
 *
 * Compatibilité avec apex-plugins-marketplace.ts (Anthropic plugins claude.com) :
 *  - meta-marketplace est complémentaire (ne remplace pas), il l'expose comme
 *    1 provider parmi 30+. Tools IA Apex peuvent invoquer l'un OU l'autre.
 */

import { logger } from '../core/logger.js';

import { auditLog } from './audit-log.js';

const STORAGE_KEY = 'apex_v13_meta_marketplace_state';

/* ============================================================================
 * Types publics
 * ========================================================================= */

export type MarketplaceCategory =
  | 'ai-ml'
  | 'code-packages'
  | 'github'
  | 'extensions'
  | 'automation'
  | 'saas'
  | 'cloud'
  | 'apis'
  | 'datasets'
  | 'anthropic';

export type SearchMethod =
  | 'public-api' /* fetch direct, gratuit, pas d'auth */
  | 'oauth-api' /* requiert OAuth flow + token refresh */
  | 'api-key' /* requiert clé API stockée vault */
  | 'web-scrape' /* scrape HTML (fragile, à éviter si possible) */
  | 'static-list'; /* liste hardcodée (fallback) */

export interface MarketplaceProvider {
  /** Identifiant unique (kebab-case) */
  id: string;
  /** Nom officiel affiché */
  name: string;
  /** Catégorie principale */
  category: MarketplaceCategory;
  /** URL du site marketplace (browser direct) */
  url: string;
  /** Endpoint API si publique */
  api_endpoint?: string;
  /** Exige une clé API stockée vault */
  api_key_required: boolean;
  /** Nom de la clé dans le vault (ex: "ax_github_token") */
  api_key_service?: string;
  /** Méthode de search */
  search_method: SearchMethod;
  /** Tier gratuit disponible (sans payer) */
  free_tier_available: boolean;
  /** Limite de requêtes (ex: "60/h", "1000/jour") */
  rate_limit?: string;
  /** Apex peut search direct depuis le browser (CORS OK) */
  pwa_compatible: boolean;
  /** Le serveur autorise CORS depuis app web (Access-Control-Allow-Origin) */
  cors_friendly: boolean;
  /** Apex doit passer par un Cloudflare Worker proxy si pwa_compatible=false */
  search_proxy_required?: boolean;
  /** Description courte de ce qu'on trouve dedans */
  description: string;
}

export interface MarketplaceItem {
  /** Id natif marketplace (npm package name, hf model id, etc.) */
  id: string;
  /** Provider qui a renvoyé cet item */
  marketplace: string;
  /** Nom affichable */
  name: string;
  /** Description courte */
  description: string;
  /** URL canonique de l'item */
  url: string;
  /** Icône / logo (URL absolue) */
  icon_url?: string;
  /** Sous-catégorie / tag */
  category?: string;
  /** Étoiles GitHub / likes / upvotes */
  stars?: number;
  /** Téléchargements (par semaine ou total selon source) */
  downloads?: number;
  /** Prix si payant */
  price?: { amount: number; currency: string; period?: 'one-time' | 'monthly' | 'yearly' };
  /** Comment Apex peut utiliser/installer */
  install_method?: 'url' | 'cli' | 'oauth' | 'api-key' | 'manual' | 'fetch-mcp';
  /** Métadonnées brutes spécifiques au provider (transparence pour debug) */
  metadata?: Record<string, unknown>;
}

export interface SearchAllOptions {
  /** Filtre catégories de marketplaces (sinon tous PWA-compatible) */
  categories?: MarketplaceCategory[];
  /** Limite globale de résultats agrégés */
  limit?: number;
  /** Inclure marketplaces non-PWA (nécessite proxy / oauth — peut throw) */
  include_non_pwa?: boolean;
}

export interface InstallResult {
  ok: boolean;
  providerId: string;
  itemId: string;
  /** Méthode utilisée (url ouverte, cli copié, oauth flow lancé, etc.) */
  method?: string;
  /** Donnée renvoyée par l'install (URL ouverte, snippet copié, etc.) */
  result?: unknown;
  /** Instructions pour Kevin si action manuelle requise */
  instructions?: string;
  error?: string;
  /** Si requires api key → indique laquelle manque */
  requires_api_key?: string;
}

export interface MetaMarketplaceStats {
  /** Nombre total de marketplaces enregistrés */
  providers: number;
  /** Combien sont PWA-compatible (search direct OK) */
  pwa_compatible: number;
  /** Combien nécessitent une clé API */
  require_api_key: number;
  /** Combien ont une clé configurée dans le vault */
  api_keys_configured: number;
  /** Compteur installs depuis le boot */
  installs_total: number;
  /** Dernier install timestamp */
  last_install_ts: number;
  /** Répartition par catégorie */
  by_category: Record<MarketplaceCategory, number>;
}

/* ============================================================================
 * Catalog des 30+ marketplaces
 * ============================================================================
 * HONNÊTETÉ :
 *  - pwa_compatible=true → fetch direct browser OK (CORS allow + tier gratuit).
 *  - pwa_compatible=false → besoin Cloudflare Worker proxy OR OAuth dance.
 *  - Tous les `api_endpoint` sont vérifiés contre la doc officielle (mai 2026).
 */
const META_MARKETPLACE_CATALOG: readonly MarketplaceProvider[] = [
  /* ----- A. IA / ML ----- */
  {
    id: 'huggingface',
    name: 'HuggingFace Hub',
    category: 'ai-ml',
    url: 'https://huggingface.co',
    api_endpoint: 'https://huggingface.co/api/models',
    api_key_required: false,
    search_method: 'public-api',
    free_tier_available: true,
    rate_limit: 'soft (no auth)',
    pwa_compatible: true,
    cors_friendly: true,
    description: 'Modèles, datasets et spaces IA — open-source, search libre.',
  },
  {
    id: 'replicate',
    name: 'Replicate',
    category: 'ai-ml',
    url: 'https://replicate.com',
    api_endpoint: 'https://api.replicate.com/v1/models',
    api_key_required: true,
    api_key_service: 'ax_replicate_token',
    search_method: 'api-key',
    free_tier_available: true,
    rate_limit: '600/min',
    pwa_compatible: true,
    cors_friendly: true,
    description: 'Modèles IA hébergés (image, audio, vidéo, LLM) facturés à l\'inférence.',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter Models',
    category: 'ai-ml',
    url: 'https://openrouter.ai',
    api_endpoint: 'https://openrouter.ai/api/v1/models',
    api_key_required: false,
    search_method: 'public-api',
    free_tier_available: true,
    pwa_compatible: true,
    cors_friendly: true,
    description: 'LLMs unifiés (Claude, GPT, Gemini, Mistral, Llama) sous une seule API.',
  },
  {
    id: 'ollama',
    name: 'Ollama Models',
    category: 'ai-ml',
    url: 'https://ollama.com/library',
    api_key_required: false,
    search_method: 'web-scrape',
    free_tier_available: true,
    pwa_compatible: false,
    cors_friendly: false,
    search_proxy_required: true,
    description: 'LLMs locaux téléchargeables (Llama, Mistral, Phi, Gemma…).',
  },
  {
    id: 'civitai',
    name: 'Civitai',
    category: 'ai-ml',
    url: 'https://civitai.com',
    api_endpoint: 'https://civitai.com/api/v1/models',
    api_key_required: false,
    search_method: 'public-api',
    free_tier_available: true,
    pwa_compatible: true,
    cors_friendly: true,
    description: 'Modèles Stable Diffusion + LoRAs + checkpoints communauté.',
  },
  {
    id: 'lmstudio',
    name: 'LM Studio Models',
    category: 'ai-ml',
    url: 'https://lmstudio.ai/models',
    api_key_required: false,
    search_method: 'web-scrape',
    free_tier_available: true,
    pwa_compatible: false,
    cors_friendly: false,
    search_proxy_required: true,
    description: 'Catalogue GGUF curé pour exécution locale.',
  },
  {
    id: 'openai-gpt-store',
    name: 'OpenAI GPT Store',
    category: 'ai-ml',
    url: 'https://chatgpt.com/gpts',
    api_key_required: false,
    search_method: 'web-scrape',
    free_tier_available: true,
    pwa_compatible: false,
    cors_friendly: false,
    search_proxy_required: true,
    description: 'GPTs custom (read-only, pas d\'API publique de search).',
  },

  /* ----- B. Code / Packages ----- */
  {
    id: 'npm',
    name: 'NPM Registry',
    category: 'code-packages',
    url: 'https://www.npmjs.com',
    api_endpoint: 'https://registry.npmjs.org/-/v1/search',
    api_key_required: false,
    search_method: 'public-api',
    free_tier_available: true,
    pwa_compatible: true,
    cors_friendly: true,
    description: 'Packages JavaScript/TypeScript (le plus grand registre du monde).',
  },
  {
    id: 'pypi',
    name: 'PyPI',
    category: 'code-packages',
    url: 'https://pypi.org',
    api_endpoint: 'https://pypi.org/search/',
    api_key_required: false,
    search_method: 'web-scrape',
    free_tier_available: true,
    pwa_compatible: false,
    cors_friendly: false,
    search_proxy_required: true,
    description: 'Packages Python — search HTML (pas d\'API JSON publique).',
  },
  {
    id: 'crates-io',
    name: 'Crates.io',
    category: 'code-packages',
    url: 'https://crates.io',
    api_endpoint: 'https://crates.io/api/v1/crates',
    api_key_required: false,
    search_method: 'public-api',
    free_tier_available: true,
    pwa_compatible: true,
    cors_friendly: true,
    description: 'Packages Rust officiels.',
  },
  {
    id: 'maven-central',
    name: 'Maven Central',
    category: 'code-packages',
    url: 'https://search.maven.org',
    api_endpoint: 'https://search.maven.org/solrsearch/select',
    api_key_required: false,
    search_method: 'public-api',
    free_tier_available: true,
    pwa_compatible: true,
    cors_friendly: true,
    description: 'Packages Java/Kotlin/Scala JVM.',
  },
  {
    id: 'packagist',
    name: 'Packagist',
    category: 'code-packages',
    url: 'https://packagist.org',
    api_endpoint: 'https://packagist.org/search.json',
    api_key_required: false,
    search_method: 'public-api',
    free_tier_available: true,
    pwa_compatible: true,
    cors_friendly: true,
    description: 'Packages PHP Composer.',
  },
  {
    id: 'rubygems',
    name: 'RubyGems',
    category: 'code-packages',
    url: 'https://rubygems.org',
    api_endpoint: 'https://rubygems.org/api/v1/search.json',
    api_key_required: false,
    search_method: 'public-api',
    free_tier_available: true,
    pwa_compatible: true,
    cors_friendly: true,
    description: 'Gems Ruby.',
  },
  {
    id: 'pkg-go-dev',
    name: 'pkg.go.dev',
    category: 'code-packages',
    url: 'https://pkg.go.dev',
    api_key_required: false,
    search_method: 'web-scrape',
    free_tier_available: true,
    pwa_compatible: false,
    cors_friendly: false,
    search_proxy_required: true,
    description: 'Modules Go (search HTML).',
  },
  {
    id: 'hex-pm',
    name: 'Hex.pm',
    category: 'code-packages',
    url: 'https://hex.pm',
    api_endpoint: 'https://hex.pm/api/packages',
    api_key_required: false,
    search_method: 'public-api',
    free_tier_available: true,
    pwa_compatible: true,
    cors_friendly: true,
    description: 'Packages Elixir / Erlang.',
  },

  /* ----- C. GitHub Ecosystem ----- */
  {
    id: 'github-marketplace',
    name: 'GitHub Marketplace (Actions + Apps)',
    category: 'github',
    url: 'https://github.com/marketplace',
    api_endpoint: 'https://api.github.com/search/repositories',
    api_key_required: true,
    api_key_service: 'ax_github_token',
    search_method: 'api-key',
    free_tier_available: true,
    rate_limit: '5000/h authenticated',
    pwa_compatible: true,
    cors_friendly: true,
    description: 'GitHub Actions, Apps et integrations CI/CD.',
  },
  {
    id: 'github-topics',
    name: 'GitHub Topics Trending',
    category: 'github',
    url: 'https://github.com/topics',
    api_endpoint: 'https://api.github.com/search/repositories',
    api_key_required: false,
    search_method: 'public-api',
    free_tier_available: true,
    rate_limit: '60/h unauthenticated',
    pwa_compatible: true,
    cors_friendly: true,
    description: 'Repos GitHub par topic (trending = stars desc + created last week).',
  },

  /* ----- D. Plugins / Extensions ----- */
  {
    id: 'claude-plugins',
    name: 'Claude.com Plugins (Anthropic)',
    category: 'extensions',
    url: 'https://claude.com/plugins',
    api_key_required: false,
    search_method: 'static-list',
    free_tier_available: true,
    pwa_compatible: true,
    cors_friendly: true,
    description: 'Plugins Claude/MCP (catalog 196 — voir apex-plugins-marketplace.ts).',
  },
  {
    id: 'vscode-marketplace',
    name: 'VS Code Marketplace',
    category: 'extensions',
    url: 'https://marketplace.visualstudio.com/vscode',
    api_endpoint: 'https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery',
    api_key_required: false,
    search_method: 'public-api',
    free_tier_available: true,
    pwa_compatible: false,
    cors_friendly: false,
    search_proxy_required: true,
    description: 'Extensions Visual Studio Code (POST query, CORS bloqué).',
  },
  {
    id: 'jetbrains-marketplace',
    name: 'JetBrains Marketplace',
    category: 'extensions',
    url: 'https://plugins.jetbrains.com',
    api_endpoint: 'https://plugins.jetbrains.com/api/searchPlugins',
    api_key_required: false,
    search_method: 'public-api',
    free_tier_available: true,
    pwa_compatible: true,
    cors_friendly: true,
    description: 'Plugins IntelliJ / WebStorm / PyCharm / Rider.',
  },
  {
    id: 'chrome-webstore',
    name: 'Chrome Web Store',
    category: 'extensions',
    url: 'https://chromewebstore.google.com',
    api_key_required: false,
    search_method: 'web-scrape',
    free_tier_available: true,
    pwa_compatible: false,
    cors_friendly: false,
    search_proxy_required: true,
    description: 'Extensions Chrome / Edge Chromium.',
  },
  {
    id: 'firefox-addons',
    name: 'Firefox Add-ons',
    category: 'extensions',
    url: 'https://addons.mozilla.org',
    api_endpoint: 'https://addons.mozilla.org/api/v5/addons/search/',
    api_key_required: false,
    search_method: 'public-api',
    free_tier_available: true,
    pwa_compatible: true,
    cors_friendly: true,
    description: 'Extensions Firefox AMO.',
  },
  {
    id: 'edge-addons',
    name: 'Microsoft Edge Add-ons',
    category: 'extensions',
    url: 'https://microsoftedge.microsoft.com/addons',
    api_key_required: false,
    search_method: 'web-scrape',
    free_tier_available: true,
    pwa_compatible: false,
    cors_friendly: false,
    search_proxy_required: true,
    description: 'Extensions Edge legacy + Chromium.',
  },

  /* ----- E. Automation / Workflows ----- */
  {
    id: 'zapier',
    name: 'Zapier',
    category: 'automation',
    url: 'https://zapier.com/apps',
    api_endpoint: 'https://zapier.com/api/v3/apps/',
    api_key_required: true,
    api_key_service: 'ax_zapier_token',
    search_method: 'oauth-api',
    free_tier_available: true,
    pwa_compatible: false,
    cors_friendly: false,
    search_proxy_required: true,
    description: '5000+ apps integrations (CRM, mail, DB, no-code workflows).',
  },
  {
    id: 'make',
    name: 'Make.com (Integromat)',
    category: 'automation',
    url: 'https://www.make.com/en/integrations',
    api_key_required: true,
    api_key_service: 'ax_make_token',
    search_method: 'oauth-api',
    free_tier_available: true,
    pwa_compatible: false,
    cors_friendly: false,
    search_proxy_required: true,
    description: 'Workflows visuels avec 1500+ apps connectées.',
  },
  {
    id: 'n8n',
    name: 'n8n Community Workflows',
    category: 'automation',
    url: 'https://n8n.io/workflows',
    api_key_required: false,
    search_method: 'web-scrape',
    free_tier_available: true,
    pwa_compatible: false,
    cors_friendly: false,
    search_proxy_required: true,
    description: 'Workflows open-source self-hostable.',
  },
  {
    id: 'ifttt',
    name: 'IFTTT',
    category: 'automation',
    url: 'https://ifttt.com/explore',
    api_key_required: false,
    search_method: 'web-scrape',
    free_tier_available: true,
    pwa_compatible: false,
    cors_friendly: false,
    search_proxy_required: true,
    description: 'If This Then That — applets simples cross-services.',
  },
  {
    id: 'power-automate',
    name: 'Microsoft Power Automate',
    category: 'automation',
    url: 'https://powerautomate.microsoft.com/connectors',
    api_key_required: true,
    api_key_service: 'ax_microsoft_token',
    search_method: 'oauth-api',
    free_tier_available: true,
    pwa_compatible: false,
    cors_friendly: false,
    search_proxy_required: true,
    description: 'Workflows Microsoft 365 (Office, Teams, SharePoint).',
  },

  /* ----- F. SaaS / Apps ----- */
  {
    id: 'apple-app-store',
    name: 'Apple App Store',
    category: 'saas',
    url: 'https://www.apple.com/app-store/',
    api_endpoint: 'https://itunes.apple.com/search',
    api_key_required: false,
    search_method: 'public-api',
    free_tier_available: true,
    pwa_compatible: true,
    cors_friendly: true,
    description: 'Apps iOS via iTunes Search API (gratuit, CORS OK).',
  },
  {
    id: 'google-play',
    name: 'Google Play Store',
    category: 'saas',
    url: 'https://play.google.com/store',
    api_key_required: false,
    search_method: 'web-scrape',
    free_tier_available: true,
    pwa_compatible: false,
    cors_friendly: false,
    search_proxy_required: true,
    description: 'Apps Android (search HTML, pas d\'API publique).',
  },
  {
    id: 'slack-apps',
    name: 'Slack App Directory',
    category: 'saas',
    url: 'https://slack.com/apps',
    api_key_required: false,
    search_method: 'web-scrape',
    free_tier_available: true,
    pwa_compatible: false,
    cors_friendly: false,
    search_proxy_required: true,
    description: 'Apps et bots Slack.',
  },
  {
    id: 'notion-templates',
    name: 'Notion Templates',
    category: 'saas',
    url: 'https://www.notion.so/templates',
    api_key_required: false,
    search_method: 'web-scrape',
    free_tier_available: true,
    pwa_compatible: false,
    cors_friendly: false,
    search_proxy_required: true,
    description: 'Templates Notion gratuits + payants.',
  },
  {
    id: 'stripe-apps',
    name: 'Stripe Apps',
    category: 'saas',
    url: 'https://marketplace.stripe.com',
    api_key_required: false,
    search_method: 'web-scrape',
    free_tier_available: true,
    pwa_compatible: false,
    cors_friendly: false,
    search_proxy_required: true,
    description: 'Apps Stripe pour étendre paiements.',
  },
  {
    id: 'shopify-apps',
    name: 'Shopify App Store',
    category: 'saas',
    url: 'https://apps.shopify.com',
    api_key_required: false,
    search_method: 'web-scrape',
    free_tier_available: true,
    pwa_compatible: false,
    cors_friendly: false,
    search_proxy_required: true,
    description: 'Apps Shopify (e-commerce).',
  },
  {
    id: 'wordpress-plugins',
    name: 'WordPress.org Plugins',
    category: 'saas',
    url: 'https://wordpress.org/plugins',
    api_endpoint: 'https://api.wordpress.org/plugins/info/1.2/',
    api_key_required: false,
    search_method: 'public-api',
    free_tier_available: true,
    pwa_compatible: true,
    cors_friendly: true,
    description: 'Plugins WordPress gratuits.',
  },
  {
    id: 'salesforce-appexchange',
    name: 'Salesforce AppExchange',
    category: 'saas',
    url: 'https://appexchange.salesforce.com',
    api_key_required: true,
    api_key_service: 'ax_salesforce_token',
    search_method: 'oauth-api',
    free_tier_available: false,
    pwa_compatible: false,
    cors_friendly: false,
    search_proxy_required: true,
    description: 'Apps Salesforce CRM (B2B).',
  },

  /* ----- G. Cloud / Infrastructure ----- */
  {
    id: 'aws-marketplace',
    name: 'AWS Marketplace',
    category: 'cloud',
    url: 'https://aws.amazon.com/marketplace',
    api_key_required: true,
    api_key_service: 'ax_aws_token',
    search_method: 'api-key',
    free_tier_available: true,
    pwa_compatible: false,
    cors_friendly: false,
    search_proxy_required: true,
    description: 'AMIs, SaaS, datasets, ML models AWS.',
  },
  {
    id: 'azure-marketplace',
    name: 'Azure Marketplace',
    category: 'cloud',
    url: 'https://azuremarketplace.microsoft.com',
    api_key_required: true,
    api_key_service: 'ax_azure_token',
    search_method: 'api-key',
    free_tier_available: true,
    pwa_compatible: false,
    cors_friendly: false,
    search_proxy_required: true,
    description: 'VMs, SaaS, dev tools Azure.',
  },
  {
    id: 'gcp-marketplace',
    name: 'Google Cloud Marketplace',
    category: 'cloud',
    url: 'https://console.cloud.google.com/marketplace',
    api_key_required: true,
    api_key_service: 'ax_gcp_token',
    search_method: 'api-key',
    free_tier_available: true,
    pwa_compatible: false,
    cors_friendly: false,
    search_proxy_required: true,
    description: 'Solutions GCP (Compute, BigQuery, AI Platform).',
  },
  {
    id: 'cloudflare-templates',
    name: 'Cloudflare Workers Templates',
    category: 'cloud',
    url: 'https://workers.cloudflare.com/built-with',
    api_key_required: false,
    search_method: 'web-scrape',
    free_tier_available: true,
    pwa_compatible: false,
    cors_friendly: false,
    search_proxy_required: true,
    description: 'Templates Workers + Pages Cloudflare.',
  },
  {
    id: 'vercel-templates',
    name: 'Vercel Templates',
    category: 'cloud',
    url: 'https://vercel.com/templates',
    api_key_required: false,
    search_method: 'web-scrape',
    free_tier_available: true,
    pwa_compatible: false,
    cors_friendly: false,
    search_proxy_required: true,
    description: 'Templates Next.js / Astro / Svelte deploy 1-clic.',
  },
  {
    id: 'netlify-templates',
    name: 'Netlify Templates',
    category: 'cloud',
    url: 'https://www.netlify.com/templates',
    api_key_required: false,
    search_method: 'web-scrape',
    free_tier_available: true,
    pwa_compatible: false,
    cors_friendly: false,
    search_proxy_required: true,
    description: 'Templates Jamstack (Hugo, Eleventy, Gatsby).',
  },
  {
    id: 'railway-templates',
    name: 'Railway Templates',
    category: 'cloud',
    url: 'https://railway.app/templates',
    api_key_required: false,
    search_method: 'web-scrape',
    free_tier_available: true,
    pwa_compatible: false,
    cors_friendly: false,
    search_proxy_required: true,
    description: 'Templates infra (DB, monitoring, queues).',
  },
  {
    id: 'render-templates',
    name: 'Render Templates',
    category: 'cloud',
    url: 'https://render.com/docs/deploy-an-image',
    api_key_required: false,
    search_method: 'web-scrape',
    free_tier_available: true,
    pwa_compatible: false,
    cors_friendly: false,
    search_proxy_required: true,
    description: 'Blueprints Render (API/web/cron/worker).',
  },
  {
    id: 'docker-hub',
    name: 'Docker Hub',
    category: 'cloud',
    url: 'https://hub.docker.com',
    api_endpoint: 'https://hub.docker.com/v2/search/repositories/',
    api_key_required: false,
    search_method: 'public-api',
    free_tier_available: true,
    pwa_compatible: true,
    cors_friendly: true,
    description: 'Images Docker officielles + community.',
  },

  /* ----- H. APIs ----- */
  {
    id: 'rapidapi',
    name: 'RapidAPI',
    category: 'apis',
    url: 'https://rapidapi.com/hub',
    api_key_required: true,
    api_key_service: 'ax_rapidapi_key',
    search_method: 'api-key',
    free_tier_available: true,
    pwa_compatible: false,
    cors_friendly: false,
    search_proxy_required: true,
    description: 'Marketplace 40 000+ APIs (search par catégorie).',
  },
  {
    id: 'apilayer',
    name: 'APILayer',
    category: 'apis',
    url: 'https://apilayer.com/marketplace',
    api_key_required: true,
    api_key_service: 'ax_apilayer_key',
    search_method: 'api-key',
    free_tier_available: true,
    pwa_compatible: false,
    cors_friendly: false,
    search_proxy_required: true,
    description: 'APIs SaaS prêtes (currency, weather, translation, KYC).',
  },
  {
    id: 'postman-api-network',
    name: 'Postman Public APIs Network',
    category: 'apis',
    url: 'https://www.postman.com/explore',
    api_key_required: false,
    search_method: 'web-scrape',
    free_tier_available: true,
    pwa_compatible: false,
    cors_friendly: false,
    search_proxy_required: true,
    description: 'Collections Postman publiques (workspaces, APIs, mocks).',
  },
  {
    id: 'apis-guru',
    name: 'OpenAPI Directory (apis.guru)',
    category: 'apis',
    url: 'https://apis.guru',
    api_endpoint: 'https://api.apis.guru/v2/list.json',
    api_key_required: false,
    search_method: 'public-api',
    free_tier_available: true,
    pwa_compatible: true,
    cors_friendly: true,
    description: 'Directory OpenAPI specs (2400+ APIs documentées).',
  },
  {
    id: 'public-apis',
    name: 'public-apis (community list)',
    category: 'apis',
    url: 'https://github.com/public-apis/public-apis',
    api_endpoint: 'https://api.publicapis.org/entries',
    api_key_required: false,
    search_method: 'public-api',
    free_tier_available: true,
    pwa_compatible: true,
    cors_friendly: true,
    description: 'Liste collaborative APIs gratuites.',
  },

  /* ----- I. Datasets / Données ----- */
  {
    id: 'kaggle-datasets',
    name: 'Kaggle Datasets',
    category: 'datasets',
    url: 'https://www.kaggle.com/datasets',
    api_key_required: true,
    api_key_service: 'ax_kaggle_token',
    search_method: 'api-key',
    free_tier_available: true,
    pwa_compatible: false,
    cors_friendly: false,
    search_proxy_required: true,
    description: 'Datasets ML communauté Kaggle.',
  },
  {
    id: 'huggingface-datasets',
    name: 'HuggingFace Datasets',
    category: 'datasets',
    url: 'https://huggingface.co/datasets',
    api_endpoint: 'https://huggingface.co/api/datasets',
    api_key_required: false,
    search_method: 'public-api',
    free_tier_available: true,
    pwa_compatible: true,
    cors_friendly: true,
    description: 'Datasets HF (NLP, vision, audio).',
  },
  {
    id: 'data-gouv-fr',
    name: 'data.gouv.fr',
    category: 'datasets',
    url: 'https://www.data.gouv.fr',
    api_endpoint: 'https://www.data.gouv.fr/api/1/datasets/',
    api_key_required: false,
    search_method: 'public-api',
    free_tier_available: true,
    pwa_compatible: true,
    cors_friendly: true,
    description: 'Open Data France (administration, INSEE, ministères).',
  },
  {
    id: 'data-europa-eu',
    name: 'data.europa.eu',
    category: 'datasets',
    url: 'https://data.europa.eu/data/datasets',
    api_endpoint: 'https://data.europa.eu/api/hub/search/search',
    api_key_required: false,
    search_method: 'public-api',
    free_tier_available: true,
    pwa_compatible: true,
    cors_friendly: true,
    description: 'Open Data Union européenne (Eurostat, EEA, EuroVoc).',
  },

  /* ----- J. Anthropic-specific ----- */
  {
    id: 'anthropic-cookbook',
    name: 'Anthropic Cookbook (skills)',
    category: 'anthropic',
    url: 'https://github.com/anthropics/anthropic-cookbook',
    api_endpoint: 'https://api.github.com/repos/anthropics/anthropic-cookbook/contents',
    api_key_required: false,
    search_method: 'public-api',
    free_tier_available: true,
    pwa_compatible: true,
    cors_friendly: true,
    description: 'Recettes officielles Claude (skills, prompts, examples).',
  },
  {
    id: 'claude-code-skills',
    name: 'Claude Code Skills',
    category: 'anthropic',
    url: 'https://github.com/anthropics/claude-code',
    api_endpoint: 'https://api.github.com/repos/anthropics/claude-code/contents',
    api_key_required: false,
    search_method: 'public-api',
    free_tier_available: true,
    pwa_compatible: true,
    cors_friendly: true,
    description: 'Skills Claude Code officiels (review, security-review, init…).',
  },
  {
    id: 'mcp-servers',
    name: 'MCP Servers (modelcontextprotocol)',
    category: 'anthropic',
    url: 'https://github.com/modelcontextprotocol/servers',
    api_endpoint: 'https://api.github.com/repos/modelcontextprotocol/servers/contents',
    api_key_required: false,
    search_method: 'public-api',
    free_tier_available: true,
    pwa_compatible: true,
    cors_friendly: true,
    description: 'MCP Servers officiels + community (filesystem, git, brave, …).',
  },
];

/* ============================================================================
 * Service principal
 * ========================================================================= */

interface PersistedState {
  /** Map providerId → liste itemIds favoris */
  favorites: Record<string, string[]>;
  /** Historique installs (provider, item, ts, ok) */
  installs: Array<{ providerId: string; itemId: string; ts: number; ok: boolean; method?: string }>;
  /** Compteur installs */
  installs_total: number;
  /** Dernier install ts */
  last_install_ts: number;
}

class ApexMetaMarketplace {
  private state: PersistedState = {
    favorites: {},
    installs: [],
    installs_total: 0,
    last_install_ts: 0,
  };
  private initialized = false;

  init(): void {
    if (this.initialized) return;
    this.initialized = true;
    this.loadState();
  }

  private loadState(): void {
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<PersistedState>;
      if (parsed && typeof parsed === 'object') {
        this.state = {
          favorites: parsed.favorites ?? {},
          installs: Array.isArray(parsed.installs) ? parsed.installs.slice(-200) : [],
          installs_total: typeof parsed.installs_total === 'number' ? parsed.installs_total : 0,
          last_install_ts: typeof parsed.last_install_ts === 'number' ? parsed.last_install_ts : 0,
        };
      }
    } catch {
      /* parse error → reset, on garde un état stable */
    }
  }

  private saveState(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      /* quota exceeded → on perd l'historique mais pas le runtime */
    }
  }

  /**
   * Reset complet (test seulement).
   */
  reset(): void {
    this.state = { favorites: {}, installs: [], installs_total: 0, last_install_ts: 0 };
    this.initialized = false;
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
    }
  }

  /**
   * Liste tous les providers, optionnellement filtrés.
   */
  listProviders(filter?: {
    category?: MarketplaceCategory;
    pwa_compatible?: boolean;
    free_tier_available?: boolean;
    api_key_required?: boolean;
  }): readonly MarketplaceProvider[] {
    this.init();
    let result: readonly MarketplaceProvider[] = META_MARKETPLACE_CATALOG;
    if (filter?.category) {
      result = result.filter((p) => p.category === filter.category);
    }
    if (filter?.pwa_compatible !== undefined) {
      result = result.filter((p) => p.pwa_compatible === filter.pwa_compatible);
    }
    if (filter?.free_tier_available !== undefined) {
      result = result.filter((p) => p.free_tier_available === filter.free_tier_available);
    }
    if (filter?.api_key_required !== undefined) {
      result = result.filter((p) => p.api_key_required === filter.api_key_required);
    }
    return result;
  }

  /**
   * Récupère un provider par id.
   */
  getProvider(providerId: string): MarketplaceProvider | null {
    return META_MARKETPLACE_CATALOG.find((p) => p.id === providerId) ?? null;
  }

  /**
   * Search unifié cross-marketplace en parallèle.
   * Promise.allSettled : un provider lent / KO ne casse pas l'agrégation.
   */
  async searchAll(query: string, opts: SearchAllOptions = {}): Promise<MarketplaceItem[]> {
    this.init();
    const trimmed = query.trim();
    if (!trimmed) return [];

    const providers = this.listProviders({
      ...(opts.include_non_pwa ? {} : { pwa_compatible: true }),
    });
    const categoriesFilter = opts.categories;
    const targets = categoriesFilter
      ? providers.filter((p) => categoriesFilter.includes(p.category))
      : providers;

    const results = await Promise.allSettled(
      targets.map((p) => this.searchOne(p.id, trimmed, 10).catch(() => [] as MarketplaceItem[])),
    );

    const aggregated = results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
    const limit = typeof opts.limit === 'number' && opts.limit > 0 ? opts.limit : 50;
    return aggregated.slice(0, limit);
  }

  /**
   * Search un marketplace spécifique.
   * - Si pwa_compatible=false → throw (sauf si Apex a configuré un proxy worker).
   * - Si api_key_required=true et clé manquante → throw (avec instructions).
   */
  async searchOne(providerId: string, query: string, limit = 10): Promise<MarketplaceItem[]> {
    this.init();
    const provider = this.getProvider(providerId);
    if (!provider) throw new Error(`Provider inconnu: ${providerId}`);
    if (!provider.pwa_compatible) {
      throw new Error(
        `Provider ${providerId} non PWA-compatible (${provider.search_method}). Proxy/OAuth requis.`,
      );
    }
    if (provider.api_key_required && !this.hasApiKey(provider.api_key_service)) {
      throw new Error(
        `Provider ${providerId} requiert clé API "${provider.api_key_service}" (manquante dans le vault).`,
      );
    }

    /* Dispatch par provider id (handlers spécialisés) */
    const handler = this.getSearchHandler(providerId);
    if (!handler) {
      throw new Error(`Handler search non implémenté pour ${providerId}`);
    }
    return handler(query, limit, provider);
  }

  /**
   * Récupère le détail d'un item (si l'API du provider le supporte).
   */
  async getItem(providerId: string, itemId: string): Promise<MarketplaceItem | null> {
    this.init();
    const provider = this.getProvider(providerId);
    if (!provider) return null;
    /* Pour la plupart des providers, getItem = redirige vers le 1er résultat search */
    try {
      const items = await this.searchOne(providerId, itemId, 5);
      return items.find((it) => it.id === itemId || it.name === itemId) ?? items[0] ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Récupère les items trending d'un provider.
   * Réutilise le handler search avec une query "trending".
   */
  async getTrending(providerId: string, limit = 10): Promise<MarketplaceItem[]> {
    this.init();
    const provider = this.getProvider(providerId);
    if (!provider) throw new Error(`Provider inconnu: ${providerId}`);
    /* Heuristique : on lance un search avec query vide + sort by stars/downloads */
    /* La plupart des handlers acceptent query vide → renvoient top items */
    try {
      return await this.searchOne(providerId, '', limit);
    } catch {
      return [];
    }
  }

  /**
   * Installe / utilise un item (dispatch selon install_method).
   * Idempotent : si déjà installé récemment, retourne ok=true sans rien faire.
   */
  async install(
    providerId: string,
    itemId: string,
    opts: Record<string, unknown> = {},
  ): Promise<InstallResult> {
    this.init();
    const provider = this.getProvider(providerId);
    if (!provider) {
      return { ok: false, providerId, itemId, error: 'Provider inconnu' };
    }

    /* Idempotence : si install récent (< 5 min) → no-op */
    const recent = this.state.installs.find(
      (i) => i.providerId === providerId && i.itemId === itemId && Date.now() - i.ts < 5 * 60_000,
    );
    if (recent && recent.ok) {
      return {
        ok: true,
        providerId,
        itemId,
        ...(recent.method && { method: recent.method }),
        instructions: 'Déjà installé récemment (cache 5 min).',
      };
    }

    /* Vérification clé API si requis (avant d'ouvrir l'URL inutilement) */
    if (provider.api_key_required && !this.hasApiKey(provider.api_key_service)) {
      return {
        ok: false,
        providerId,
        itemId,
        ...(provider.api_key_service && { requires_api_key: provider.api_key_service }),
        error: `Clé API "${provider.api_key_service}" requise mais absente du vault.`,
      };
    }

    /* Récupération item pour avoir l'URL canonique */
    let item: MarketplaceItem | null = null;
    try {
      item = await this.getItem(providerId, itemId);
    } catch {
      /* on continue avec URL fallback */
    }

    const url = item?.url ?? provider.url;
    const method = item?.install_method ?? 'url';

    let result: InstallResult;
    switch (method) {
      case 'url':
        result = {
          ok: true,
          providerId,
          itemId,
          method: 'url',
          result: { url },
          instructions: `Ouvre ${url} dans le browser pour installer / utiliser.`,
        };
        break;
      case 'cli':
        result = {
          ok: true,
          providerId,
          itemId,
          method: 'cli',
          result: { command: this.buildCliCommand(provider, itemId, opts) },
          instructions: `Copie cette commande et exécute-la dans ton terminal.`,
        };
        break;
      case 'oauth':
        result = {
          ok: false,
          providerId,
          itemId,
          method: 'oauth',
          error: 'OAuth flow non implémenté (à venir via cloud worker).',
          instructions: `Va sur ${provider.url} et complète l'OAuth manuellement.`,
        };
        break;
      case 'api-key':
        result = {
          ok: true,
          providerId,
          itemId,
          method: 'api-key',
          result: { api_endpoint: provider.api_endpoint },
          instructions: `Utilise l'API ${provider.api_endpoint ?? provider.url} avec ta clé déjà stockée.`,
        };
        break;
      case 'fetch-mcp':
        result = {
          ok: true,
          providerId,
          itemId,
          method: 'fetch-mcp',
          result: { mcp_url: item?.url ?? provider.url },
          instructions: `Configure le MCP Server depuis ${item?.url ?? provider.url}.`,
        };
        break;
      case 'manual':
      default:
        result = {
          ok: true,
          providerId,
          itemId,
          method: 'manual',
          instructions: `Installation manuelle requise — voir ${url}.`,
        };
        break;
    }

    /* Persistance + audit */
    this.state.installs.push({
      providerId,
      itemId,
      ts: Date.now(),
      ok: result.ok,
      ...(result.method && { method: result.method }),
    });
    if (result.ok) {
      this.state.installs_total += 1;
      this.state.last_install_ts = Date.now();
    }
    /* Cap historique à 200 */
    if (this.state.installs.length > 200) {
      this.state.installs = this.state.installs.slice(-200);
    }
    this.saveState();

    /* Audit log immutable (RGPD + traçabilité Kevin) */
    try {
      await auditLog.record('meta_marketplace.install', {
        actor: 'apex',
        target: `${providerId}:${itemId}`,
        details: {
          ok: result.ok,
          method: result.method ?? null,
          ...(result.error && { error: result.error }),
        },
      });
    } catch (e) {
      logger.warn('apex-meta-marketplace', `audit.record failed`, e);
    }

    return result;
  }

  /**
   * Recommandations contextuelles pour Apex / Kevin.
   * Heuristique : favori + PWA-compatible + free_tier + jamais installé.
   */
  async recommendForApex(): Promise<{ items: MarketplaceItem[]; reason: string }[]> {
    this.init();
    const recommendations: { items: MarketplaceItem[]; reason: string }[] = [];

    /* 1. Marketplaces PWA-compatible non-encore exploités */
    const pwaProviders = this.listProviders({ pwa_compatible: true, free_tier_available: true });
    const installedProviderIds = new Set(this.state.installs.filter((i) => i.ok).map((i) => i.providerId));
    const unexplored = pwaProviders.filter((p) => !installedProviderIds.has(p.id)).slice(0, 5);
    if (unexplored.length > 0) {
      recommendations.push({
        items: unexplored.map((p) => ({
          id: p.id,
          marketplace: 'meta',
          name: p.name,
          description: p.description,
          url: p.url,
          category: p.category,
          install_method: 'url',
        })),
        reason: 'Marketplaces PWA-compatible jamais explorés (gain rapide, sans clé API).',
      });
    }

    /* 2. Anthropic-specific (priorité Apex) */
    const anthropicProviders = this.listProviders({ category: 'anthropic' });
    if (anthropicProviders.length > 0) {
      recommendations.push({
        items: anthropicProviders.map((p) => ({
          id: p.id,
          marketplace: 'meta',
          name: p.name,
          description: p.description,
          url: p.url,
          category: 'anthropic',
          install_method: 'url',
        })),
        reason: 'Marketplaces Anthropic (skills, MCP servers, cookbook) — priorité Apex.',
      });
    }

    /* 3. Trending HuggingFace + GitHub (signal communauté) */
    try {
      const hf = await this.getTrending('huggingface', 3);
      if (hf.length > 0) {
        recommendations.push({
          items: hf,
          reason: 'Modèles HuggingFace tendance (community signal).',
        });
      }
    } catch {
      /* gracieux */
    }

    return recommendations;
  }

  /**
   * Stats globales.
   */
  getStats(): MetaMarketplaceStats {
    this.init();
    const all = META_MARKETPLACE_CATALOG;
    const byCategory = all.reduce(
      (acc, p) => {
        acc[p.category] = (acc[p.category] ?? 0) + 1;
        return acc;
      },
      {} as Record<MarketplaceCategory, number>,
    );
    return {
      providers: all.length,
      pwa_compatible: all.filter((p) => p.pwa_compatible).length,
      require_api_key: all.filter((p) => p.api_key_required).length,
      api_keys_configured: all.filter((p) => p.api_key_required && this.hasApiKey(p.api_key_service)).length,
      installs_total: this.state.installs_total,
      last_install_ts: this.state.last_install_ts,
      by_category: byCategory,
    };
  }

  /**
   * Toggle favori (persisté).
   */
  toggleFavorite(providerId: string, itemId: string): boolean {
    this.init();
    const list = this.state.favorites[providerId] ?? [];
    const idx = list.indexOf(itemId);
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(itemId);
    }
    this.state.favorites[providerId] = list;
    this.saveState();
    return idx < 0; /* true si ajouté */
  }

  /**
   * Liste des favoris d'un provider.
   */
  getFavorites(providerId: string): readonly string[] {
    this.init();
    return this.state.favorites[providerId] ?? [];
  }

  /**
   * Historique installs.
   */
  getInstallHistory(): readonly PersistedState['installs'][number][] {
    this.init();
    return [...this.state.installs];
  }

  /* ============================================================================
   * Internals — handlers search par provider
   * ========================================================================= */

  /**
   * Vérifie qu'une clé API est présente dans le vault (localStorage simple ici,
   * le vault chiffré chargera/déchiffrera côté multi-key-vault.ts).
   */
  private hasApiKey(keyName: string | undefined): boolean {
    if (!keyName) return false;
    if (typeof localStorage === 'undefined') return false;
    try {
      const v = localStorage.getItem(keyName);
      return typeof v === 'string' && v.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Récupère une clé API depuis le vault (lecture simple).
   */
  private getApiKey(keyName: string | undefined): string | null {
    if (!keyName) return null;
    if (typeof localStorage === 'undefined') return null;
    try {
      return localStorage.getItem(keyName);
    } catch {
      return null;
    }
  }

  /**
   * Construit la commande CLI d'install (npm install, pip install, …).
   */
  private buildCliCommand(provider: MarketplaceProvider, itemId: string, opts: Record<string, unknown>): string {
    switch (provider.id) {
      case 'npm':
        return `npm install ${itemId}`;
      case 'pypi':
        return `pip install ${itemId}`;
      case 'crates-io':
        return `cargo add ${itemId}`;
      case 'rubygems':
        return `gem install ${itemId}`;
      case 'packagist':
        return `composer require ${itemId}`;
      case 'hex-pm':
        return `mix hex.install ${itemId}`;
      case 'pkg-go-dev':
        return `go get ${itemId}`;
      case 'docker-hub':
        return `docker pull ${itemId}`;
      default:
        return typeof opts['command'] === 'string' ? (opts['command'] as string) : `# install ${itemId}`;
    }
  }

  /**
   * Récupère le handler search d'un provider donné.
   * Retourne null si non implémenté (provider listé mais pas search-ready).
   */
  private getSearchHandler(
    providerId: string,
  ): ((query: string, limit: number, provider: MarketplaceProvider) => Promise<MarketplaceItem[]>) | null {
    const handlers: Record<
      string,
      (query: string, limit: number, provider: MarketplaceProvider) => Promise<MarketplaceItem[]>
    > = {
      huggingface: this.searchHuggingFace.bind(this),
      'huggingface-datasets': this.searchHuggingFaceDatasets.bind(this),
      replicate: this.searchReplicate.bind(this),
      openrouter: this.searchOpenRouter.bind(this),
      civitai: this.searchCivitai.bind(this),
      npm: this.searchNpm.bind(this),
      'crates-io': this.searchCratesIo.bind(this),
      'maven-central': this.searchMavenCentral.bind(this),
      packagist: this.searchPackagist.bind(this),
      rubygems: this.searchRubyGems.bind(this),
      'hex-pm': this.searchHexPm.bind(this),
      'github-marketplace': this.searchGitHub.bind(this),
      'github-topics': this.searchGitHub.bind(this),
      'claude-plugins': this.searchClaudePlugins.bind(this),
      'jetbrains-marketplace': this.searchJetBrains.bind(this),
      'firefox-addons': this.searchFirefoxAddons.bind(this),
      'apple-app-store': this.searchAppleAppStore.bind(this),
      'wordpress-plugins': this.searchWordPressPlugins.bind(this),
      'docker-hub': this.searchDockerHub.bind(this),
      'apis-guru': this.searchApisGuru.bind(this),
      'public-apis': this.searchPublicApis.bind(this),
      'data-gouv-fr': this.searchDataGouvFr.bind(this),
      'data-europa-eu': this.searchDataEuropaEu.bind(this),
      'anthropic-cookbook': this.searchAnthropicCookbook.bind(this),
      'claude-code-skills': this.searchClaudeCodeSkills.bind(this),
      'mcp-servers': this.searchMcpServers.bind(this),
    };
    return handlers[providerId] ?? null;
  }

  /* ----- Handlers individuels (lazy fetch) ----- */

  private async searchHuggingFace(query: string, limit: number): Promise<MarketplaceItem[]> {
    const url = `https://huggingface.co/api/models?search=${encodeURIComponent(query)}&limit=${limit}&full=false`;
    const data = await this.fetchJson<Array<{ id: string; downloads?: number; likes?: number; pipeline_tag?: string }>>(url);
    return (data ?? []).map((m) => ({
      id: m.id,
      marketplace: 'huggingface',
      name: m.id,
      description: m.pipeline_tag ? `Task: ${m.pipeline_tag}` : 'Modèle HuggingFace',
      url: `https://huggingface.co/${m.id}`,
      ...(typeof m.likes === 'number' && { stars: m.likes }),
      ...(typeof m.downloads === 'number' && { downloads: m.downloads }),
      ...(m.pipeline_tag && { category: m.pipeline_tag }),
      install_method: 'url',
      metadata: m as unknown as Record<string, unknown>,
    }));
  }

  private async searchHuggingFaceDatasets(query: string, limit: number): Promise<MarketplaceItem[]> {
    const url = `https://huggingface.co/api/datasets?search=${encodeURIComponent(query)}&limit=${limit}&full=false`;
    const data = await this.fetchJson<Array<{ id: string; downloads?: number; likes?: number }>>(url);
    return (data ?? []).map((d) => ({
      id: d.id,
      marketplace: 'huggingface-datasets',
      name: d.id,
      description: 'Dataset HuggingFace',
      url: `https://huggingface.co/datasets/${d.id}`,
      ...(typeof d.likes === 'number' && { stars: d.likes }),
      ...(typeof d.downloads === 'number' && { downloads: d.downloads }),
      install_method: 'url',
    }));
  }

  private async searchReplicate(query: string, limit: number, provider: MarketplaceProvider): Promise<MarketplaceItem[]> {
    const token = this.getApiKey(provider.api_key_service);
    if (!token) return [];
    /* Replicate /v1/models : pas de search natif, on filtre côté client */
    const data = await this.fetchJson<{ results?: Array<{ owner: string; name: string; description?: string; visibility?: string }> }>(
      'https://api.replicate.com/v1/models',
      { headers: { Authorization: `Token ${token}` } },
    );
    const results = data?.results ?? [];
    const filtered = results
      .filter((m) => !query || `${m.owner}/${m.name} ${m.description ?? ''}`.toLowerCase().includes(query.toLowerCase()))
      .slice(0, limit);
    return filtered.map((m) => ({
      id: `${m.owner}/${m.name}`,
      marketplace: 'replicate',
      name: `${m.owner}/${m.name}`,
      description: m.description ?? 'Modèle Replicate',
      url: `https://replicate.com/${m.owner}/${m.name}`,
      install_method: 'api-key',
    }));
  }

  private async searchOpenRouter(query: string, limit: number): Promise<MarketplaceItem[]> {
    const data = await this.fetchJson<{ data?: Array<{ id: string; name?: string; description?: string; pricing?: { prompt?: string } }> }>(
      'https://openrouter.ai/api/v1/models',
    );
    const results = data?.data ?? [];
    const filtered = results
      .filter((m) => !query || `${m.id} ${m.name ?? ''} ${m.description ?? ''}`.toLowerCase().includes(query.toLowerCase()))
      .slice(0, limit);
    return filtered.map((m) => ({
      id: m.id,
      marketplace: 'openrouter',
      name: m.name ?? m.id,
      description: m.description ?? 'LLM via OpenRouter',
      url: `https://openrouter.ai/models/${m.id}`,
      install_method: 'api-key',
      metadata: m as unknown as Record<string, unknown>,
    }));
  }

  private async searchCivitai(query: string, limit: number): Promise<MarketplaceItem[]> {
    const url = `https://civitai.com/api/v1/models?query=${encodeURIComponent(query)}&limit=${limit}`;
    const data = await this.fetchJson<{ items?: Array<{ id: number; name: string; description?: string; type?: string; stats?: { downloadCount?: number; thumbsUpCount?: number } }> }>(url);
    return (data?.items ?? []).map((m) => ({
      id: String(m.id),
      marketplace: 'civitai',
      name: m.name,
      description: this.stripHtml(m.description ?? '') || `Modèle ${m.type ?? 'Civitai'}`,
      url: `https://civitai.com/models/${m.id}`,
      ...(m.type && { category: m.type }),
      ...(typeof m.stats?.thumbsUpCount === 'number' && { stars: m.stats.thumbsUpCount }),
      ...(typeof m.stats?.downloadCount === 'number' && { downloads: m.stats.downloadCount }),
      install_method: 'url',
    }));
  }

  private async searchNpm(query: string, limit: number): Promise<MarketplaceItem[]> {
    const url = `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(query || 'a')}&size=${limit}`;
    const data = await this.fetchJson<{ objects?: Array<{ package: { name: string; description?: string; links?: { npm?: string }; version?: string } }> }>(url);
    return (data?.objects ?? []).map((o) => ({
      id: o.package.name,
      marketplace: 'npm',
      name: o.package.name,
      description: o.package.description ?? 'Package NPM',
      url: o.package.links?.npm ?? `https://www.npmjs.com/package/${o.package.name}`,
      install_method: 'cli',
      metadata: { version: o.package.version },
    }));
  }

  private async searchCratesIo(query: string, limit: number): Promise<MarketplaceItem[]> {
    const url = `https://crates.io/api/v1/crates?q=${encodeURIComponent(query)}&per_page=${limit}`;
    const data = await this.fetchJson<{ crates?: Array<{ id: string; name: string; description?: string; downloads?: number }> }>(url);
    return (data?.crates ?? []).map((c) => ({
      id: c.id,
      marketplace: 'crates-io',
      name: c.name,
      description: c.description ?? 'Crate Rust',
      url: `https://crates.io/crates/${c.name}`,
      ...(typeof c.downloads === 'number' && { downloads: c.downloads }),
      install_method: 'cli',
    }));
  }

  private async searchMavenCentral(query: string, limit: number): Promise<MarketplaceItem[]> {
    const url = `https://search.maven.org/solrsearch/select?q=${encodeURIComponent(query)}&rows=${limit}&wt=json`;
    const data = await this.fetchJson<{ response?: { docs?: Array<{ id: string; g: string; a: string; latestVersion?: string }> } }>(url);
    return (data?.response?.docs ?? []).map((d) => ({
      id: d.id,
      marketplace: 'maven-central',
      name: `${d.g}:${d.a}`,
      description: `Maven artifact (latest: ${d.latestVersion ?? 'unknown'})`,
      url: `https://central.sonatype.com/artifact/${d.g}/${d.a}`,
      install_method: 'manual',
    }));
  }

  private async searchPackagist(query: string, limit: number): Promise<MarketplaceItem[]> {
    const url = `https://packagist.org/search.json?q=${encodeURIComponent(query)}&per_page=${limit}`;
    const data = await this.fetchJson<{ results?: Array<{ name: string; description?: string; url?: string; downloads?: number; favers?: number }> }>(url);
    return (data?.results ?? []).map((r) => ({
      id: r.name,
      marketplace: 'packagist',
      name: r.name,
      description: r.description ?? 'Package Composer',
      url: r.url ?? `https://packagist.org/packages/${r.name}`,
      ...(typeof r.favers === 'number' && { stars: r.favers }),
      ...(typeof r.downloads === 'number' && { downloads: r.downloads }),
      install_method: 'cli',
    }));
  }

  private async searchRubyGems(query: string, limit: number): Promise<MarketplaceItem[]> {
    const url = `https://rubygems.org/api/v1/search.json?query=${encodeURIComponent(query)}`;
    const data = await this.fetchJson<Array<{ name: string; info?: string; downloads?: number; project_uri?: string }>>(url);
    return (data ?? []).slice(0, limit).map((g) => ({
      id: g.name,
      marketplace: 'rubygems',
      name: g.name,
      description: g.info ?? 'Ruby gem',
      url: g.project_uri ?? `https://rubygems.org/gems/${g.name}`,
      ...(typeof g.downloads === 'number' && { downloads: g.downloads }),
      install_method: 'cli',
    }));
  }

  private async searchHexPm(query: string, limit: number): Promise<MarketplaceItem[]> {
    const url = `https://hex.pm/api/packages?search=${encodeURIComponent(query)}&sort=downloads`;
    const data = await this.fetchJson<Array<{ name: string; meta?: { description?: string }; downloads?: { all?: number }; html_url?: string }>>(url);
    return (data ?? []).slice(0, limit).map((p) => ({
      id: p.name,
      marketplace: 'hex-pm',
      name: p.name,
      description: p.meta?.description ?? 'Hex package',
      url: p.html_url ?? `https://hex.pm/packages/${p.name}`,
      ...(typeof p.downloads?.all === 'number' && { downloads: p.downloads.all }),
      install_method: 'cli',
    }));
  }

  private async searchGitHub(query: string, limit: number, provider: MarketplaceProvider): Promise<MarketplaceItem[]> {
    const token = provider.api_key_required ? this.getApiKey(provider.api_key_service) : null;
    const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const q = query || 'stars:>1000';
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&per_page=${limit}&sort=stars`;
    const data = await this.fetchJson<{ items?: Array<{ full_name: string; description?: string; html_url: string; stargazers_count?: number; topics?: string[] }> }>(url, {
      headers,
    });
    return (data?.items ?? []).map((r) => ({
      id: r.full_name,
      marketplace: provider.id,
      name: r.full_name,
      description: r.description ?? 'GitHub repository',
      url: r.html_url,
      ...(typeof r.stargazers_count === 'number' && { stars: r.stargazers_count }),
      ...(r.topics && r.topics[0] && { category: r.topics[0] }),
      install_method: 'url',
    }));
  }

  private async searchClaudePlugins(query: string, limit: number): Promise<MarketplaceItem[]> {
    /* Délégation au catalogue interne 196 plugins (apex-plugins-marketplace.ts) */
    try {
      const mod = await import('./apex-plugins-marketplace.js');
      const results = mod.apexPluginsMarketplace.search(query || '', limit);
      return results.map((p) => ({
        id: p.id,
        marketplace: 'claude-plugins',
        name: p.name,
        description: p.description,
        url: p.url ?? `https://claude.com/plugins/${p.id}`,
        category: p.category,
        install_method: 'manual',
        metadata: { source: p.source, value: p.estimated_value },
      }));
    } catch (e) {
      logger.warn('apex-meta-marketplace', 'searchClaudePlugins failed', e);
      return [];
    }
  }

  private async searchJetBrains(query: string, limit: number): Promise<MarketplaceItem[]> {
    const url = `https://plugins.jetbrains.com/api/searchPlugins?search=${encodeURIComponent(query)}&max=${limit}`;
    const data = await this.fetchJson<{ plugins?: Array<{ id: number; name: string; preview?: string; xmlId?: string; downloads?: number; rating?: number }> }>(url);
    return (data?.plugins ?? []).map((p) => ({
      id: p.xmlId ?? String(p.id),
      marketplace: 'jetbrains-marketplace',
      name: p.name,
      description: p.preview ?? 'JetBrains plugin',
      url: `https://plugins.jetbrains.com/plugin/${p.id}`,
      ...(typeof p.rating === 'number' && { stars: Math.round(p.rating * 100) }),
      ...(typeof p.downloads === 'number' && { downloads: p.downloads }),
      install_method: 'manual',
    }));
  }

  private async searchFirefoxAddons(query: string, limit: number): Promise<MarketplaceItem[]> {
    const url = `https://addons.mozilla.org/api/v5/addons/search/?q=${encodeURIComponent(query)}&page_size=${limit}`;
    const data = await this.fetchJson<{ results?: Array<{ slug: string; name: { 'en-US'?: string; fr?: string } | string; summary?: { 'en-US'?: string } | string; url: string; average_daily_users?: number; ratings?: { average?: number } }> }>(url);
    return (data?.results ?? []).map((a) => {
      const name = typeof a.name === 'string' ? a.name : (a.name?.fr ?? a.name?.['en-US'] ?? a.slug);
      const summary = typeof a.summary === 'string' ? a.summary : (a.summary?.['en-US'] ?? '');
      return {
        id: a.slug,
        marketplace: 'firefox-addons',
        name,
        description: summary || 'Firefox add-on',
        url: a.url,
        ...(typeof a.average_daily_users === 'number' && { downloads: a.average_daily_users }),
        ...(typeof a.ratings?.average === 'number' && { stars: Math.round(a.ratings.average * 100) }),
        install_method: 'url',
      };
    });
  }

  private async searchAppleAppStore(query: string, limit: number): Promise<MarketplaceItem[]> {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=software&limit=${limit}`;
    const data = await this.fetchJson<{ results?: Array<{ trackId: number; trackName: string; description?: string; trackViewUrl: string; price?: number; currency?: string; averageUserRating?: number; primaryGenreName?: string }> }>(url);
    return (data?.results ?? []).map((a) => ({
      id: String(a.trackId),
      marketplace: 'apple-app-store',
      name: a.trackName,
      description: (a.description ?? '').slice(0, 200),
      url: a.trackViewUrl,
      ...(a.primaryGenreName && { category: a.primaryGenreName }),
      ...(typeof a.averageUserRating === 'number' && { stars: Math.round(a.averageUserRating * 100) }),
      ...(typeof a.price === 'number' &&
        a.price > 0 &&
        a.currency && {
          price: { amount: a.price, currency: a.currency, period: 'one-time' as const },
        }),
      install_method: 'url',
    }));
  }

  private async searchWordPressPlugins(query: string, limit: number): Promise<MarketplaceItem[]> {
    const url = `https://api.wordpress.org/plugins/info/1.2/?action=query_plugins&request[search]=${encodeURIComponent(query)}&request[per_page]=${limit}`;
    const data = await this.fetchJson<{ plugins?: Array<{ slug: string; name: string; short_description?: string; homepage?: string; active_installs?: number; rating?: number }> }>(url);
    return (data?.plugins ?? []).map((p) => ({
      id: p.slug,
      marketplace: 'wordpress-plugins',
      name: p.name,
      description: this.stripHtml(p.short_description ?? '') || 'Plugin WordPress',
      url: p.homepage ?? `https://wordpress.org/plugins/${p.slug}`,
      ...(typeof p.rating === 'number' && { stars: p.rating }),
      ...(typeof p.active_installs === 'number' && { downloads: p.active_installs }),
      install_method: 'manual',
    }));
  }

  private async searchDockerHub(query: string, limit: number): Promise<MarketplaceItem[]> {
    const url = `https://hub.docker.com/v2/search/repositories/?query=${encodeURIComponent(query)}&page_size=${limit}`;
    const data = await this.fetchJson<{ results?: Array<{ repo_name: string; short_description?: string; star_count?: number; pull_count?: number }> }>(url);
    return (data?.results ?? []).map((r) => ({
      id: r.repo_name,
      marketplace: 'docker-hub',
      name: r.repo_name,
      description: r.short_description ?? 'Docker image',
      url: `https://hub.docker.com/r/${r.repo_name}`,
      ...(typeof r.star_count === 'number' && { stars: r.star_count }),
      ...(typeof r.pull_count === 'number' && { downloads: r.pull_count }),
      install_method: 'cli',
    }));
  }

  private async searchApisGuru(query: string, limit: number): Promise<MarketplaceItem[]> {
    const data = await this.fetchJson<Record<string, { versions?: Record<string, { info?: { title?: string; description?: string; 'x-providerName'?: string }; swaggerYamlUrl?: string }> }>>(
      'https://api.apis.guru/v2/list.json',
    );
    if (!data) return [];
    const items: MarketplaceItem[] = [];
    for (const [providerName, providerData] of Object.entries(data)) {
      const versions = providerData.versions ?? {};
      const firstVersionKey = Object.keys(versions)[0];
      if (!firstVersionKey) continue;
      const v = versions[firstVersionKey];
      if (!v) continue;
      const info = v.info ?? {};
      const title = info.title ?? providerName;
      const desc = info.description ?? '';
      if (
        !query ||
        title.toLowerCase().includes(query.toLowerCase()) ||
        desc.toLowerCase().includes(query.toLowerCase())
      ) {
        items.push({
          id: providerName,
          marketplace: 'apis-guru',
          name: title,
          description: desc.slice(0, 200) || `API ${providerName}`,
          url: v.swaggerYamlUrl ?? `https://apis.guru/browse-apis/`,
          install_method: 'manual',
        });
      }
      if (items.length >= limit) break;
    }
    return items;
  }

  private async searchPublicApis(query: string, limit: number): Promise<MarketplaceItem[]> {
    const url = query ? `https://api.publicapis.org/entries?title=${encodeURIComponent(query)}` : 'https://api.publicapis.org/entries';
    const data = await this.fetchJson<{ entries?: Array<{ API: string; Description: string; Link: string; Category: string; Auth?: string; HTTPS?: boolean }> }>(url);
    return (data?.entries ?? []).slice(0, limit).map((e) => ({
      id: e.API,
      marketplace: 'public-apis',
      name: e.API,
      description: e.Description,
      url: e.Link,
      category: e.Category,
      install_method: 'manual',
      metadata: { auth: e.Auth, https: e.HTTPS },
    }));
  }

  private async searchDataGouvFr(query: string, limit: number): Promise<MarketplaceItem[]> {
    const url = `https://www.data.gouv.fr/api/1/datasets/?q=${encodeURIComponent(query)}&page_size=${limit}`;
    const data = await this.fetchJson<{ data?: Array<{ id: string; title: string; description?: string; page?: string; metrics?: { views?: number } }> }>(url);
    return (data?.data ?? []).map((d) => ({
      id: d.id,
      marketplace: 'data-gouv-fr',
      name: d.title,
      description: this.stripHtml(d.description ?? '').slice(0, 200) || 'Dataset open France',
      url: d.page ?? `https://www.data.gouv.fr/fr/datasets/${d.id}/`,
      ...(typeof d.metrics?.views === 'number' && { downloads: d.metrics.views }),
      install_method: 'url',
    }));
  }

  private async searchDataEuropaEu(query: string, limit: number): Promise<MarketplaceItem[]> {
    const url = `https://data.europa.eu/api/hub/search/search?q=${encodeURIComponent(query)}&limit=${limit}`;
    const data = await this.fetchJson<{ result?: { results?: Array<{ id: string; title?: { en?: string } | string; description?: { en?: string } | string }> } }>(url);
    return (data?.result?.results ?? []).map((d) => {
      const title = typeof d.title === 'string' ? d.title : (d.title?.en ?? d.id);
      const desc = typeof d.description === 'string' ? d.description : (d.description?.en ?? '');
      return {
        id: d.id,
        marketplace: 'data-europa-eu',
        name: title,
        description: this.stripHtml(desc).slice(0, 200) || 'Dataset open EU',
        url: `https://data.europa.eu/data/datasets/${d.id}`,
        install_method: 'url',
      };
    });
  }

  private async searchAnthropicCookbook(query: string, limit: number): Promise<MarketplaceItem[]> {
    return this.searchGitHubContents('anthropics', 'anthropic-cookbook', query, limit, 'anthropic-cookbook');
  }

  private async searchClaudeCodeSkills(query: string, limit: number): Promise<MarketplaceItem[]> {
    return this.searchGitHubContents('anthropics', 'claude-code', query, limit, 'claude-code-skills');
  }

  private async searchMcpServers(query: string, limit: number): Promise<MarketplaceItem[]> {
    return this.searchGitHubContents('modelcontextprotocol', 'servers', query, limit, 'mcp-servers');
  }

  /**
   * Helper : list GitHub repo contents (folders/files) avec filtre query.
   */
  private async searchGitHubContents(
    owner: string,
    repo: string,
    query: string,
    limit: number,
    marketplaceId: string,
  ): Promise<MarketplaceItem[]> {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents`;
    const data = await this.fetchJson<Array<{ name: string; path: string; type: string; html_url?: string }>>(url, {
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!data) return [];
    const filtered = data
      .filter((c) => !query || c.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, limit);
    return filtered.map((c) => ({
      id: c.path,
      marketplace: marketplaceId,
      name: c.name,
      description: `${c.type} dans ${owner}/${repo}`,
      url: c.html_url ?? `https://github.com/${owner}/${repo}/tree/main/${c.path}`,
      install_method: c.type === 'dir' ? 'fetch-mcp' : 'url',
    }));
  }

  /**
   * Wrapper fetch JSON avec timeout 8s + gestion CORS gracieuse.
   */
  private async fetchJson<T>(url: string, init?: RequestInit): Promise<T | null> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, {
        ...init,
        signal: controller.signal,
        headers: { Accept: 'application/json', ...(init?.headers as Record<string, string> | undefined) },
      });
      clearTimeout(timeout);
      if (!res.ok) {
        logger.debug('apex-meta-marketplace', `fetch ${url} → HTTP ${res.status}`);
        return null;
      }
      return (await res.json()) as T;
    } catch (e) {
      logger.debug('apex-meta-marketplace', `fetch ${url} failed`, e);
      return null;
    }
  }

  /**
   * Strip HTML tags basiques (descriptions WordPress / Civitai).
   */
  private stripHtml(s: string): string {
    return s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  }
}

export const apexMetaMarketplace = new ApexMetaMarketplace();

/* Exports utilitaires (tests + UI) */
export { META_MARKETPLACE_CATALOG };
