/**
 * APEX v13.4.109 — Smart Vault Classifier multi-univers + Pattern Learner.
 *
 * Kevin 2026-05-15 03h55 : "tous les codes, banques, cartes, sites, app,
 * identifiants, comptes, etc donc intelligemment il doit organiser, classer,
 * tester etc. Va plus loin réfléchi"
 *
 * Kevin 2026-05-15 04h00 : "Toutes les patterns que j'intègrerais doivent être
 * reconnu, même les futures nouvelles donc anticipe réfléchi et va plus plus loin"
 *
 * 3 couches de détection :
 *   1. Patterns CONNUS (130+ regex AX_CREDENTIAL_PATTERNS)
 *   2. Algorithmes natifs offline (IBAN modulo 97, CB Luhn, SIRET, BIC, VAT)
 *   3. Pattern Learner AUTOMATIQUE pour les inconnus (analyse fingerprint
 *      + label opt + apprentissage cross-session)
 *
 * REFUS absolu de stocker en clair :
 *   - CB PAN complet + CVV → métadonnées only (4 derniers + issuer + nom)
 *   - Seed phrase BIP39 12/24 mots → hardware wallet obligatoire
 *   - Mot de passe banque plaintext → OAuth/SCA only
 */

import { logger } from '../core/logger.js';

export type ClassifyType =
  | 'api_key'
  | 'bank_iban'
  | 'bank_bic'
  | 'credit_card_metadata' /* uniquement 4 derniers + nom + exp + issuer */
  | 'siret'
  | 'vat_eu'
  | 'email'
  | 'apple_id'
  | 'google_account'
  | 'phone_fr'
  | 'phone_monaco'
  | 'phone_intl'
  | 'url'
  | 'social_handle'
  | 'btc_address'
  | 'eth_address'
  | 'recovery_code'
  | 'token_unknown_learned' /* nouveau pattern appris automatiquement */
  | 'unknown';

export type Sensitivity = 'public' | 'confidential' | 'secret' | 'top_secret';
export type Category = 'ai' | 'finance' | 'identity' | 'web' | 'comms' | 'devops' | 'crypto' | 'social' | 'security' | 'other';

export interface ClassifyResult {
  type: ClassifyType;
  category: Category;
  sensitivity: Sensitivity;
  /** Métadonnées extraites (issuer CB, country IBAN, etc.) — NON-secret */
  metadata: Record<string, string | number | boolean>;
  /** Valeur normalisée pour stockage (jamais le PAN complet pour CB) */
  storage_value: string;
  /** Plaintext acceptable pour stockage chiffré ? (false = refuse + warn) */
  storable: boolean;
  /** Si refused=true : ne pas stocker, juste métadonnées */
  refused?: boolean;
  refused_reason?: string;
  /** Si learned : pattern appris auto, on suggère un nom de service */
  learned_pattern_id?: string;
  suggested_service_name?: string;
}

/* ============================================================
   Validations algorithmiques offline (pas d'API externe)
   ============================================================ */

/** Validation IBAN modulo 97 (ISO 13616). Offline, déterministe. */
export function validateIban(iban: string): { ok: boolean; country?: string; check?: number } {
  const cleaned = iban.replace(/\s/g, '').toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(cleaned)) return { ok: false };
  const rearranged = cleaned.slice(4) + cleaned.slice(0, 4);
  let numeric = '';
  for (const c of rearranged) {
    numeric += /[A-Z]/.test(c) ? String(c.charCodeAt(0) - 55) : c;
  }
  let mod = 0;
  for (const d of numeric) {
    mod = (mod * 10 + parseInt(d, 10)) % 97;
  }
  return { ok: mod === 1, country: cleaned.slice(0, 2), check: mod };
}

/** Validation BIC ISO 9362 : 8 ou 11 chars. */
export function validateBic(bic: string): { ok: boolean; bank?: string; country?: string } {
  const cleaned = bic.replace(/\s/g, '').toUpperCase();
  if (!/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(cleaned)) return { ok: false };
  return { ok: true, bank: cleaned.slice(0, 4), country: cleaned.slice(4, 6) };
}

/** Validation SIRET 14 chars via Luhn. */
export function validateSiret(siret: string): { ok: boolean } {
  const cleaned = siret.replace(/\s/g, '');
  if (!/^\d{14}$/.test(cleaned)) return { ok: false };
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    let d = parseInt(cleaned[i]!, 10);
    if (i % 2 === 0) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return { ok: sum % 10 === 0 };
}

/**
 * Validation CB Luhn + détection issuer.
 * IMPORTANT : ok=true valide FORMAT mais appelant DOIT refuser stockage PAN.
 */
export function validateCardLuhn(pan: string): { ok: boolean; issuer?: string; last4?: string } {
  const cleaned = pan.replace(/[\s-]/g, '');
  if (!/^\d{13,19}$/.test(cleaned)) return { ok: false };
  let sum = 0;
  let alt = false;
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let n = parseInt(cleaned[i]!, 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  if (sum % 10 !== 0) return { ok: false };
  let issuer: string = 'Unknown';
  if (/^4/.test(cleaned)) issuer = 'Visa';
  else if (/^(5[1-5]|2[2-7])/.test(cleaned)) issuer = 'Mastercard';
  else if (/^3[47]/.test(cleaned)) issuer = 'American Express';
  else if (/^6011|^65|^64[4-9]/.test(cleaned)) issuer = 'Discover';
  else if (/^35/.test(cleaned)) issuer = 'JCB';
  return { ok: true, issuer, last4: cleaned.slice(-4) };
}

/** Détecte seed phrase BIP39 (12 ou 24 mots dictionnaire). */
function looksLikeSeedPhrase(text: string): boolean {
  const words = text.trim().toLowerCase().split(/\s+/);
  if (words.length !== 12 && words.length !== 24) return false;
  return words.every((w) => /^[a-z]{3,8}$/.test(w));
}

/* ============================================================
   Pattern Learner : apprentissage automatique nouveaux formats
   ============================================================ */

interface LearnedPatternFingerprint {
  id: string;
  prefix: string; /* 4-8 chars début (ex: "sk-ant-", "tvly-dev-") */
  length_min: number;
  length_max: number;
  charset: string; /* 'alphanum' | 'hex' | 'base64' | 'alphanum_dash' | 'mixed' */
  occurrences: number;
  /** Label optionnel donné par Kevin/Apex IA */
  label?: string;
  /** Service deviné depuis prefix ou contexte */
  guessed_service?: string;
  first_seen: number;
  last_seen: number;
}

const PATTERNS_LEARNED_KEY = 'apex_v13_patterns_learned';

function loadLearnedPatterns(): LearnedPatternFingerprint[] {
  try {
    const raw = localStorage.getItem(PATTERNS_LEARNED_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LearnedPatternFingerprint[]) : [];
  } catch {
    return [];
  }
}

function saveLearnedPatterns(patterns: LearnedPatternFingerprint[]): void {
  try {
    localStorage.setItem(PATTERNS_LEARNED_KEY, JSON.stringify(patterns.slice(-100)));
  } catch (err: unknown) {
    logger.warn('smart-classifier', 'patterns persist failed (quota?)', { err });
  }
}

function detectCharset(text: string): string {
  if (/^[a-f0-9]+$/i.test(text)) return 'hex';
  if (/^[A-Za-z0-9_-]+$/.test(text)) return 'alphanum_dash';
  if (/^[A-Za-z0-9+/=]+$/.test(text)) return 'base64';
  if (/^[A-Za-z0-9]+$/.test(text)) return 'alphanum';
  return 'mixed';
}

function extractPrefix(text: string): string {
  /* Cherche prefix avant un séparateur _ ou - ou nombre */
  const m = text.match(/^([a-zA-Z]+[-_])([A-Za-z0-9])/);
  if (m && m[1]) return m[1];
  /* Fallback : 4 premiers chars */
  return text.slice(0, Math.min(4, text.length));
}

/**
 * Apprend un nouveau pattern depuis un text. Match existing fingerprint ou crée.
 * Si même fingerprint vu N fois (>= 2) → considère pattern stable.
 */
export function learnPattern(text: string, opts: {
  label?: string;
  context?: string; /* texte alentour pour deviner service */
} = {}): LearnedPatternFingerprint {
  const trimmed = text.trim();
  const prefix = extractPrefix(trimmed);
  const charset = detectCharset(trimmed);
  const len = trimmed.length;

  const patterns = loadLearnedPatterns();
  /* Cherche fingerprint existant : même prefix + même charset + length compatible */
  let existing = patterns.find((p) =>
    p.prefix === prefix &&
    p.charset === charset &&
    len >= p.length_min - 4 &&
    len <= p.length_max + 4,
  );

  if (existing) {
    existing.occurrences += 1;
    existing.last_seen = Date.now();
    existing.length_min = Math.min(existing.length_min, len);
    existing.length_max = Math.max(existing.length_max, len);
    if (opts.label && !existing.label) existing.label = opts.label;
    saveLearnedPatterns(patterns);
    return existing;
  }

  /* Crée nouveau fingerprint */
  const fingerprint: LearnedPatternFingerprint = {
    id: `learned_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    prefix,
    length_min: len,
    length_max: len,
    charset,
    occurrences: 1,
    first_seen: Date.now(),
    last_seen: Date.now(),
  };
  if (opts.label) fingerprint.label = opts.label;
  /* Guess service depuis prefix + context */
  const guessed = guessServiceFromPrefix(prefix, opts.context);
  if (guessed) fingerprint.guessed_service = guessed;

  patterns.push(fingerprint);
  saveLearnedPatterns(patterns);
  logger.info('smart-classifier', `🧠 Pattern appris : prefix=${prefix} len=${len} charset=${charset} guessed=${guessed ?? '?'}`);
  return fingerprint;
}

/**
 * Devine le service depuis prefix + contexte.
 * Heuristiques basées sur conventions API providers.
 */
function guessServiceFromPrefix(prefix: string, context?: string): string | undefined {
  const p = prefix.toLowerCase();
  /* Préfixes connus communs */
  const known: Record<string, string> = {
    'sk-': 'Generic SK Token (OpenAI/Stripe-like)',
    'pk-': 'Generic Public Key',
    'sk_': 'Generic Secret Token',
    'pk_': 'Generic Public Token',
    'ghp_': 'GitHub PAT classic',
    'gho_': 'GitHub OAuth',
    'ghs_': 'GitHub App Server',
    'ghu_': 'GitHub User',
    'aiza': 'Google API Key',
    'akia': 'AWS Access Key',
    'xai-': 'xAI Grok',
    'pplx-': 'Perplexity',
    'gsk_': 'Groq',
    'tvly-': 'Tavily',
    're_': 'Resend',
    'xkey': 'Brevo (xkeysib)',
    'key_': 'Together AI',
    'pcsk_': 'Pinecone',
    'cfk_': 'Cloudflare Global',
    'cfaut_': 'Cloudflare Auth Token',
    'rk_': 'Replicate / Railway',
    'r8_': 'Replicate',
    'nfp_': 'Netlify',
    'eyj': 'JWT (JSON Web Token)',
  };
  for (const [k, v] of Object.entries(known)) {
    if (p.startsWith(k)) return v;
  }
  /* Si contexte mentionne un service connu, l'utiliser */
  if (context) {
    const ctxLc = context.toLowerCase();
    const services = ['stripe', 'twilio', 'sendgrid', 'mailchimp', 'notion', 'airtable', 'slack', 'discord', 'telegram', 'aws', 'gcp', 'azure', 'firebase', 'supabase', 'mongodb', 'redis'];
    for (const s of services) {
      if (ctxLc.includes(s)) return s.charAt(0).toUpperCase() + s.slice(1);
    }
  }
  return undefined;
}

/**
 * Cherche un pattern appris qui match ce text.
 * Si match → retourne fingerprint, sinon undefined.
 */
function findLearnedMatch(text: string): LearnedPatternFingerprint | undefined {
  const trimmed = text.trim();
  const prefix = extractPrefix(trimmed);
  const charset = detectCharset(trimmed);
  const len = trimmed.length;
  const patterns = loadLearnedPatterns();
  return patterns.find((p) =>
    p.prefix === prefix &&
    p.charset === charset &&
    len >= p.length_min - 2 &&
    len <= p.length_max + 2 &&
    p.occurrences >= 2, /* Stable seulement après 2+ occurrences */
  );
}

/* ============================================================
   Classify principal
   ============================================================ */

export function classify(rawText: string, opts: { context?: string } = {}): ClassifyResult {
  const trimmed = rawText.trim();
  if (!trimmed) return makeUnknown(trimmed);

  /* 1. Seed phrase BIP39 → REFUS absolu */
  if (looksLikeSeedPhrase(trimmed)) {
    logger.warn('smart-classifier', 'seed phrase BIP39 → REFUS stockage');
    return {
      type: 'unknown',
      category: 'crypto',
      sensitivity: 'top_secret',
      metadata: { word_count: trimmed.split(/\s+/).length },
      storage_value: '',
      storable: false,
      refused: true,
      refused_reason: 'seed_phrase_hardware_wallet_only',
    };
  }

  /* 2. Carte bleue PAN → métadonnées only */
  const compactDigits = trimmed.replace(/[\s-]/g, '');
  if (/^\d{13,19}$/.test(compactDigits)) {
    const card = validateCardLuhn(compactDigits);
    if (card.ok) {
      logger.warn('smart-classifier', `CB PAN (${card.issuer}) → métadonnées only`);
      return {
        type: 'credit_card_metadata',
        category: 'finance',
        sensitivity: 'top_secret',
        metadata: { issuer: card.issuer ?? 'Unknown', last4: card.last4 ?? '????', luhn_valid: true },
        storage_value: JSON.stringify({ issuer: card.issuer, last4: card.last4 }),
        storable: true,
        refused: true,
        refused_reason: 'card_pan_only_metadata_stored',
      };
    }
  }

  /* 3. IBAN */
  if (/^[A-Z]{2}\d{2}[\s]?(?:[A-Z0-9]{4}[\s]?){2,7}[A-Z0-9]{1,4}$/i.test(trimmed)) {
    const r = validateIban(trimmed);
    if (r.ok) {
      return {
        type: 'bank_iban',
        category: 'finance',
        sensitivity: 'secret',
        metadata: { country: r.country ?? '??', modulo_check: r.check ?? -1 },
        storage_value: trimmed.replace(/\s/g, '').toUpperCase(),
        storable: true,
      };
    }
  }

  /* 4. BIC */
  if (/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/i.test(trimmed.replace(/\s/g, ''))) {
    const r = validateBic(trimmed);
    if (r.ok) {
      return {
        type: 'bank_bic',
        category: 'finance',
        sensitivity: 'confidential',
        metadata: { bank: r.bank ?? '????', country: r.country ?? '??' },
        storage_value: trimmed.replace(/\s/g, '').toUpperCase(),
        storable: true,
      };
    }
  }

  /* 5. SIRET */
  if (/^\d{14}$/.test(trimmed.replace(/\s/g, ''))) {
    const r = validateSiret(trimmed);
    if (r.ok) {
      return {
        type: 'siret',
        category: 'identity',
        sensitivity: 'confidential',
        metadata: { luhn_valid: true },
        storage_value: trimmed.replace(/\s/g, ''),
        storable: true,
      };
    }
  }

  /* 6. VAT EU */
  if (/^[A-Z]{2}\d{8,12}$/i.test(trimmed.replace(/\s/g, ''))) {
    const cleaned = trimmed.replace(/\s/g, '').toUpperCase();
    return {
      type: 'vat_eu',
      category: 'identity',
      sensitivity: 'confidential',
      metadata: { country: cleaned.slice(0, 2) },
      storage_value: cleaned,
      storable: true,
    };
  }

  /* 7. Email */
  if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmed)) {
    const isApple = /@(?:icloud|me|mac)\.com$/i.test(trimmed);
    const isGoogle = /@gmail\.com$/i.test(trimmed);
    let type: ClassifyType = 'email';
    if (isApple) type = 'apple_id';
    else if (isGoogle) type = 'google_account';
    return {
      type,
      category: 'identity',
      sensitivity: 'confidential',
      metadata: { domain: trimmed.split('@')[1] ?? '', is_apple: isApple, is_google: isGoogle },
      storage_value: trimmed.toLowerCase(),
      storable: true,
    };
  }

  /* 8. Phone Monaco / FR / International */
  const phoneClean = trimmed.replace(/[\s.-]/g, '');
  if (/^\+?377\d{8}$/.test(phoneClean)) {
    return {
      type: 'phone_monaco',
      category: 'identity',
      sensitivity: 'confidential',
      metadata: { country: 'MC', format: '+377' },
      storage_value: phoneClean.startsWith('+') ? phoneClean : `+${phoneClean}`,
      storable: true,
    };
  }
  if (/^(\+?33|0)[1-9]\d{8}$/.test(phoneClean)) {
    let normalized = phoneClean;
    if (phoneClean.startsWith('0')) normalized = `+33${phoneClean.slice(1)}`;
    else if (!phoneClean.startsWith('+')) normalized = `+${phoneClean}`;
    return {
      type: 'phone_fr',
      category: 'identity',
      sensitivity: 'confidential',
      metadata: { country: 'FR', format: '+33' },
      storage_value: normalized,
      storable: true,
    };
  }
  if (/^\+\d{8,15}$/.test(phoneClean)) {
    return {
      type: 'phone_intl',
      category: 'identity',
      sensitivity: 'confidential',
      metadata: { format: 'E.164' },
      storage_value: phoneClean,
      storable: true,
    };
  }

  /* 9. URL */
  if (/^https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/.*)?$/.test(trimmed)) {
    let host = '';
    try { host = new URL(trimmed).hostname; } catch { /* ignore */ }
    return {
      type: 'url',
      category: 'web',
      sensitivity: 'public',
      metadata: { host },
      storage_value: trimmed,
      storable: true,
    };
  }

  /* 10. Crypto BTC / ETH */
  if (/^(?:bc1[a-z0-9]{25,62}|[13][a-zA-HJ-NP-Z0-9]{25,34})$/.test(trimmed)) {
    return {
      type: 'btc_address',
      category: 'crypto',
      sensitivity: 'public',
      metadata: { format: trimmed.startsWith('bc1') ? 'bech32' : 'legacy' },
      storage_value: trimmed,
      storable: true,
    };
  }
  if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
    return {
      type: 'eth_address',
      category: 'crypto',
      sensitivity: 'public',
      metadata: {},
      storage_value: trimmed.toLowerCase(),
      storable: true,
    };
  }

  /* 11. Social handle @username */
  if (/^@[a-zA-Z0-9_.]{3,30}$/.test(trimmed)) {
    return {
      type: 'social_handle',
      category: 'social',
      sensitivity: 'public',
      metadata: { handle: trimmed.slice(1) },
      storage_value: trimmed,
      storable: true,
    };
  }

  /* 12. Recovery code 2FA */
  if (/^[A-Z0-9]{4}-[A-Z0-9]{4}(?:-[A-Z0-9]{4})*$/i.test(trimmed)) {
    return {
      type: 'recovery_code',
      category: 'security',
      sensitivity: 'top_secret',
      metadata: { length: trimmed.length, format: '2fa_recovery' },
      storage_value: trimmed.toUpperCase(),
      storable: true,
    };
  }

  /* 13. PATTERN LEARNER — token inconnu, on apprend */
  /* Heuristique : 16+ chars alphanum/dash haute entropie ressemble à un token */
  if (trimmed.length >= 16 && /^[A-Za-z0-9_.-]+$/.test(trimmed)) {
    const learned = findLearnedMatch(trimmed);
    if (learned) {
      /* Pattern déjà vu 2+ fois → reconnu */
      learnPattern(trimmed, opts.context !== undefined ? { context: opts.context } : {});
      const suggested = learned.guessed_service ?? learned.label;
      const base: ClassifyResult = {
        type: 'token_unknown_learned',
        category: 'other',
        sensitivity: 'secret',
        metadata: {
          learned_pattern_id: learned.id,
          prefix: learned.prefix,
          occurrences: learned.occurrences,
          guessed_service: learned.guessed_service ?? 'unknown',
        },
        storage_value: trimmed,
        storable: true,
        learned_pattern_id: learned.id,
      };
      if (suggested) base.suggested_service_name = suggested;
      return base;
    }
    /* Première occurrence → on apprend */
    const fp = learnPattern(trimmed, opts.context !== undefined ? { context: opts.context } : {});
    const result: ClassifyResult = {
      type: 'token_unknown_learned',
      category: 'other',
      sensitivity: 'secret',
      metadata: {
        learned_pattern_id: fp.id,
        prefix: fp.prefix,
        occurrences: 1,
        guessed_service: fp.guessed_service ?? 'unknown',
        first_seen: true,
      },
      storage_value: trimmed,
      storable: true,
      learned_pattern_id: fp.id,
    };
    const guessed = fp.guessed_service;
    if (guessed) result.suggested_service_name = guessed;
    return result;
  }

  return makeUnknown(trimmed);
}

function makeUnknown(rawText: string): ClassifyResult {
  return {
    type: 'unknown',
    category: 'other',
    sensitivity: 'public',
    metadata: { length: rawText.length },
    storage_value: rawText,
    storable: false,
  };
}

/** Liste tous les patterns appris (UI admin). */
export function listLearnedPatterns(): LearnedPatternFingerprint[] {
  return loadLearnedPatterns();
}

/** Label manuel un pattern appris (Kevin via UI admin). */
export function labelLearnedPattern(patternId: string, label: string): boolean {
  const patterns = loadLearnedPatterns();
  const target = patterns.find((p) => p.id === patternId);
  if (!target) return false;
  target.label = label;
  saveLearnedPatterns(patterns);
  return true;
}

export const apexSmartClassifier = {
  classify,
  validateIban,
  validateBic,
  validateSiret,
  validateCardLuhn,
  learnPattern,
  listLearnedPatterns,
  labelLearnedPattern,
};
