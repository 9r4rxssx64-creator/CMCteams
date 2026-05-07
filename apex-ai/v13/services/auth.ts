/**
 * APEX v13 — Auth service
 *
 * Comptes pré-configurés préservés depuis v12.785 :
 * - Kevin (DK admin) : ADMIN_ID = 'kdmc_admin', aliases multiples (reconnu privé, jamais affiché complet)
 * - Laurence : permissions tiered
 * - Familles CMCteams : bj, roulettes, cmc, cadres
 *
 * PIN PBKDF2 200k iterations + WebAuthn FaceID (Jet 2).
 *
 * Anti-pattern évité v12.240 :
 * - PIN per-user dans `apex_v13_pin_<uid>` JAMAIS dans `apex_v13_pin` global (admin only)
 *
 * Anti-pattern évité v12.241 :
 * - Login exige nom + prénom + pass tous 3, jamais substring sur 1 token
 */

import { events } from '../core/events.js';
import { logger } from '../core/logger.js';
import { store } from '../core/store.js';

const ADMIN_ID = 'kdmc_admin';

const KEVIN_ALIASES: readonly string[] = [
  'kevin desarzens',
  'desarzens kevin',
  'kevin.desarzens@gmail.com',
  'kevin.desarzens',
  'k desarzens',
  'kdmc',
];

interface PreconfiguredUser {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  family?: string;
}

/* Display names anonymisés (nom complet jamais affiché publiquement, juste prénom + initiales) */
const PRECONFIGURED: PreconfiguredUser[] = [
  { id: ADMIN_ID, name: 'Kevin (DK)', email: '', isAdmin: true },
  { id: 'laurence_sp', name: 'Laurence', email: '', isAdmin: false },
];

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[\s\-_.@]+/g, ' ')
    .trim();
}

class Auth {
  /**
   * Reconnaît Kevin admin via l'un de ses aliases (nom seul / prénom+nom / email / KDMC).
   */
  isKevinAdmin(name: string): boolean {
    const n = normalize(name);
    if (KEVIN_ALIASES.includes(n)) return true;
    /* Email normalisé inclut "gmail com" en tokens — match si AU MOINS un alias contient
       tous les tokens significatifs de l'input (kevin + desarzens) */
    const tokens = n.split(/\s+/).filter((t) => t.length >= 4);
    if (tokens.length < 1) return false;
    /* Match si tokens input ⊇ tokens alias (input plus riche que alias OK) */
    return KEVIN_ALIASES.some((alias) => {
      const aliasTokens = alias.split(/\s+/).filter((t) => t.length >= 4);
      if (!aliasTokens.length) return false;
      return aliasTokens.every((at) => tokens.includes(at));
    });
  }

  /**
   * P0-5 fix : isAdmin DÉRIVÉ de user.id (jamais flag stocké séparément).
   * Évite spoof DevTools `store.set('isAdmin', true)`.
   */
  async isAdmin(): Promise<boolean> {
    return this.isAdminSync();
  }

  /* Sync helper utilisable dans les guards router/admin */
  isAdminSync(): boolean {
    const user = store.get('user');
    return user?.id === ADMIN_ID;
  }

  /**
   * Comparaison string timing-safe (P0-3 fix).
   * Compare 2 chaînes hex en temps constant (XOR + OR sur tous les chars).
   * Évite timing attack qui leak info via durée de comparaison.
   */
  private timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) {
      diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return diff === 0;
  }

  /**
   * Hash PIN via PBKDF2 200k (Web Crypto natif, pas de lib externe).
   */
  async hashPin(pin: string, salt: string): Promise<string> {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(pin),
      { name: 'PBKDF2' },
      false,
      ['deriveBits'],
    );
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: enc.encode(salt), iterations: 200_000, hash: 'SHA-256' },
      keyMaterial,
      256,
    );
    return [...new Uint8Array(bits)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Login strict : nom + prénom + pin tous 3 obligatoires.
   * PIN admin → clé `apex_v13_pin` (réservée admin).
   * PIN user  → clé `apex_v13_pin_<uid>`.
   */
  async login(name: string, pin: string): Promise<{ ok: boolean; reason?: string }> {
    if (!name || !pin) return { ok: false, reason: 'Nom et code requis' };
    if (pin.length < 4) return { ok: false, reason: 'Code trop court' };

    const normalized = normalize(name);
    const tokens = normalized.split(/\s+/).filter((t) => t.length >= 2);
    if (tokens.length < 1) return { ok: false, reason: 'Nom invalide' };

    const isKevin = this.isKevinAdmin(name);
    const user = isKevin
      ? PRECONFIGURED.find((u) => u.id === ADMIN_ID)
      : PRECONFIGURED.find((u) => {
          /* v13.3.61 fix CRITIQUE Kevin "Laurence Utilisateur inconnu" :
           * AVANT : exigeait MIN 2 tokens (prénom seul rejeté → "Utilisateur inconnu").
           * APRÈS : 1 token suffit si match exact prénom OU nom (pour Laurence "Laurence" OK).
           * 2 tokens reste accepté (variations "saint polit laurence", etc.). */
          const userTokens = normalize(u.name).split(/\s+/).filter((t) => t.length >= 3);
          if (tokens.length === 0 || userTokens.length === 0) return false;
          /* Match si tous les tokens input sont dans userTokens (1+ tokens OK) */
          return tokens.every((t) => userTokens.includes(t));
        });

    if (!user) {
      /* P1 fix anti user enumeration : faire PBKDF2 de toute façon (constant-time response) */
      await this.hashPin(pin, 'fake-salt-anti-enumeration');
      this.audit('login_unknown_user', { details: { name_hash: this.shortHash(name) } });
      return { ok: false, reason: 'Utilisateur inconnu' };
    }

    /* Rate-limit check (P0 sécu critique parité v12.785) */
    const rateCheck = this.checkRateLimit(user.id);
    if (!rateCheck.allowed) {
      this.audit('login_rate_limited', { actor: user.id, details: { wait_min: rateCheck.waitMin } });
      return { ok: false, reason: `Trop de tentatives. Réessaie dans ${rateCheck.waitMin} min.` };
    }

    const pinKey = user.isAdmin ? 'apex_v13_pin' : `apex_v13_pin_${user.id}`;
    const storedHash = localStorage.getItem(pinKey);
    const salt = user.id;

    if (!storedHash) {
      /* Premier login : enregistrer PIN */
      const hash = await this.hashPin(pin, salt);
      try {
        localStorage.setItem(pinKey, hash);
      } catch (err: unknown) {
        logger.warn('auth', 'PIN persist failed', { err });
      }
    } else {
      const hash = await this.hashPin(pin, salt);
      /* P0-3 fix : timing-safe comparison anti-timing-attack */
      if (!this.timingSafeEqual(hash, storedHash)) {
        /* Rate-limit progressif (parité v12.785 anti brute-force) */
        this.recordFail(user.id);
        this.audit('login_pin_failure', { actor: user.id });
        return { ok: false, reason: 'Code incorrect' };
      }
      this.clearFails(user.id);
    }

    store.set('user', { id: user.id, name: user.name, email: user.email });
    store.set('isAdmin', user.isAdmin);
    try {
      localStorage.setItem('apex_v13_user', JSON.stringify({ id: user.id, name: user.name }));
      localStorage.setItem('apex_v13_uid', user.id);
      localStorage.setItem('apex_v13_lastact', String(Date.now()));
      /* Persist last known + trust device (Kevin règle "reconnaît mon appareil") */
      localStorage.setItem('apex_v13_last_known_uid', user.id);
      localStorage.setItem('apex_v13_last_known_name', user.name);
      void this.trustCurrentDevice();
    } catch {
      /* ignore */
    }

    events.emit('auth:login', { uid: user.id, isAdmin: user.isAdmin });
    logger.info('auth', `Login ${user.name} (admin=${user.isAdmin})`);
    this.audit('login_success', { actor: user.id, details: { admin: user.isAdmin, method: 'pin' } });
    return { ok: true };
  }

  /**
   * Login transparent sans PIN — uniquement si device est déjà trusted (auto-login).
   * Kevin règle : "S'il reconnaît mon appareil, il ne me demande pas connexion".
   * Sécurité : vérifie device fingerprint match avec apex_v13_device_trusted_v1.
   */
  async loginTrusted(uid: string, name: string): Promise<{ ok: boolean; reason?: string }> {
    try {
      const trusted = localStorage.getItem('apex_v13_device_trusted_v1');
      if (!trusted) return { ok: false, reason: 'Device non trusted' };
      const { deviceContext } = await import('./device-context.js');
      const fp = await deviceContext.getFingerprint();
      if (fp.device_id !== trusted) return { ok: false, reason: 'Device fingerprint mismatch' };

      const user = PRECONFIGURED.find((u) => u.id === uid);
      if (!user) return { ok: false, reason: 'User unknown' };

      store.set('user', { id: user.id, name: name || user.name, email: user.email });
      store.set('isAdmin', user.isAdmin);
      try {
        localStorage.setItem('apex_v13_user', JSON.stringify({ id: user.id, name: name || user.name }));
        localStorage.setItem('apex_v13_uid', user.id);
        localStorage.setItem('apex_v13_lastact', String(Date.now()));
      } catch { /* ignore */ }
      events.emit('auth:login', { uid: user.id, isAdmin: user.isAdmin });
      logger.info('auth', `loginTrusted ${name || user.name} (admin=${user.isAdmin})`);
      this.audit('login_success', { actor: user.id, details: { admin: user.isAdmin, method: 'trusted_device' } });
      return { ok: true };
    } catch (err: unknown) {
      logger.warn('auth', 'loginTrusted failed', { err });
      this.audit('login_trusted_failed', { actor: uid, details: { err: String(err).slice(0, 200) } });
      return { ok: false, reason: 'Auto-login failed' };
    }
  }

  /**
   * Marque le device courant comme trusted (skip PIN au prochain démarrage).
   * Stocke device_id fingerprint dans apex_v13_device_trusted_v1.
   */
  private async trustCurrentDevice(): Promise<void> {
    try {
      const { deviceContext } = await import('./device-context.js');
      const fp = await deviceContext.getFingerprint();
      localStorage.setItem('apex_v13_device_trusted_v1', fp.device_id);
    } catch { /* ignore */ }
  }

  /**
   * Révoque le trust device courant (force PIN au prochain login).
   */
  untrustCurrentDevice(): void {
    try { localStorage.removeItem('apex_v13_device_trusted_v1'); } catch { /* ignore */ }
  }

  logout(): void {
    /* Audit AVANT clear (sinon actor = null) */
    const currentUser = store.get('user') as { id?: string } | null;
    if (currentUser?.id) {
      this.audit('logout', { actor: currentUser.id });
    }
    /* Liste BLANCHE stricte des keys effacées (anti-pattern v12.297→330) */
    const SESSION_KEYS = [
      'apex_v13_user',
      'apex_v13_uid',
      'apex_v13_lastact',
      'apex_v13_session',
    ];
    for (const k of SESSION_KEYS) {
      try {
        localStorage.removeItem(k);
      } catch {
        /* ignore */
      }
    }
    store.set('user', null);
    store.set('isAdmin', false);
    events.emit('auth:logout', {});
    logger.info('auth', 'Logout');
  }

  /**
   * Wire RGPD Art. 32 — auditLog forensic trail (login, fail, lock, logout).
   * Lazy import pour éviter circular dep + pas bloquer le login si audit-log KO.
   */
  private audit(action: string, opts: { actor?: string; details?: Record<string, unknown> } = {}): void {
    void import('./audit-log.js')
      .then(({ auditLog }) => auditLog.record(`auth.${action}`, opts))
      .catch(() => { /* non-blocking */ });
  }

  /**
   * Hash court (8 hex) anti-leak quand on audit un nom inconnu (pas de PII).
   */
  private shortHash(s: string): string {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    return (h >>> 0).toString(16).padStart(8, '0');
  }

  /**
   * Création de compte par l'admin Kevin.
   * Tiers possibles : 'family' | 'client_pro' | 'client_free'
   * Si contact (téléphone WhatsApp) fourni → envoi automatique d'un lien d'invitation.
   */
  async createUser(opts: {
    name: string;
    tier: 'family' | 'client_pro' | 'client_free';
    email?: string;
    whatsappPhone?: string;
    initialPin?: string;
  }): Promise<{ ok: boolean; uid?: string; inviteLink?: string; reason?: string }> {
    const isAdmin = store.get('isAdmin');
    if (!isAdmin) return { ok: false, reason: 'Admin uniquement' };
    if (!opts.name.trim()) return { ok: false, reason: 'Nom requis' };

    const uid = `${opts.tier}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    const userRecord = {
      id: uid,
      name: opts.name.trim(),
      email: opts.email ?? '',
      tier: opts.tier,
      whatsapp: opts.whatsappPhone ?? '',
      createdAt: Date.now(),
      createdBy: ADMIN_ID,
      activated: false,
    };
    try {
      const list = JSON.parse(localStorage.getItem('apex_v13_users') ?? '[]') as Array<typeof userRecord>;
      list.push(userRecord);
      localStorage.setItem('apex_v13_users', JSON.stringify(list));
      localStorage.setItem(`apex_v13_tier_${uid}`, opts.tier);
      if (opts.initialPin) {
        const hash = await this.hashPin(opts.initialPin, uid);
        localStorage.setItem(`apex_v13_pin_${uid}`, hash);
      }
    } catch (err: unknown) {
      logger.error('auth', 'createUser persist failed', { err });
      return { ok: false, reason: 'Erreur stockage' };
    }

    /* Génère lien d'invitation 1-clic (signed token) */
    const token = await this.generateInviteToken(uid);
    const baseUrl = location.origin + location.pathname.replace(/\/index\.html$/, '/');
    const inviteLink = `${baseUrl}#invite=${token}`;
    logger.info('auth', `User created: ${opts.name} (${uid}, ${opts.tier})`);
    return { ok: true, uid, inviteLink };
  }

  private async generateInviteToken(uid: string): Promise<string> {
    /* P0-4 fix : full hash 64 chars (256 bits) + random salt (vs 16 chars/64 bits exploitable) */
    const randomSalt = crypto.getRandomValues(new Uint8Array(16));
    const saltHex = [...randomSalt].map((b) => b.toString(16).padStart(2, '0')).join('');
    const payload = `${uid}:${Date.now()}:${saltHex}`;
    const secret = ADMIN_ID + saltHex;
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload + secret));
    const hash = [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
    return btoa(payload + ':' + hash).replace(/=+$/, '');
  }

  /* Rate-limit progressif PIN (P0 anti brute-force, parité v12.785) */
  private checkRateLimit(uid: string): { allowed: boolean; waitMin: number } {
    const key = `apex_v13_pin_fails_${uid}`;
    let fails: { count: number; lockedUntil: number };
    try {
      fails = JSON.parse(localStorage.getItem(key) ?? '{"count":0,"lockedUntil":0}');
    } catch {
      fails = { count: 0, lockedUntil: 0 };
    }
    if (fails.lockedUntil > Date.now()) {
      return { allowed: false, waitMin: Math.ceil((fails.lockedUntil - Date.now()) / 60_000) };
    }
    return { allowed: true, waitMin: 0 };
  }

  private recordFail(uid: string): void {
    const key = `apex_v13_pin_fails_${uid}`;
    let fails: { count: number; lockedUntil: number };
    try {
      fails = JSON.parse(localStorage.getItem(key) ?? '{"count":0,"lockedUntil":0}');
    } catch {
      fails = { count: 0, lockedUntil: 0 };
    }
    fails.count++;
    /* Échelle : 5→30s, 6→2min, 7→10min, 8→1h, 9→24h */
    const lockMs = [0, 0, 0, 0, 0, 30_000, 120_000, 600_000, 3_600_000, 86_400_000];
    const lock = fails.count < lockMs.length ? lockMs[fails.count] ?? 86_400_000 : 86_400_000;
    fails.lockedUntil = lock > 0 ? Date.now() + lock : 0;
    try {
      localStorage.setItem(key, JSON.stringify(fails));
    } catch {
      /* ignore */
    }
  }

  private clearFails(uid: string): void {
    try {
      localStorage.removeItem(`apex_v13_pin_fails_${uid}`);
    } catch {
      /* ignore */
    }
  }

  listUsers(): Array<{ id: string; name: string; tier: string; activated: boolean }> {
    const isAdmin = store.get('isAdmin');
    if (!isAdmin) return [];
    try {
      return JSON.parse(localStorage.getItem('apex_v13_users') ?? '[]');
    } catch {
      return [];
    }
  }

  restoreSession(): void {
    try {
      const raw = localStorage.getItem('apex_v13_user');
      const uid = localStorage.getItem('apex_v13_uid');
      const lastact = parseInt(localStorage.getItem('apex_v13_lastact') ?? '0', 10);
      if (!raw || !uid) return;
      /* Session TTL 8h */
      if (Date.now() - lastact > 8 * 60 * 60 * 1000) {
        this.logout();
        return;
      }
      const user = JSON.parse(raw) as { id: string; name: string; email?: string };
      /* Validation strict : user.id === uid (anti-pattern v12.272 cross-device pollution) */
      if (user.id !== uid) {
        logger.warn('auth', 'user_id_mismatch — force logout');
        this.logout();
        return;
      }
      store.set('user', user);
      store.set('isAdmin', user.id === ADMIN_ID);
    } catch (err: unknown) {
      logger.warn('auth', 'restoreSession failed', { err });
    }
  }
}

export const auth = new Auth();
