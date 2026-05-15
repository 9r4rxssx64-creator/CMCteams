/**
 * APEX v13 — Self-signup service (clients publics)
 *
 * Mission Kevin 2026-05-08 02h : "création de compte, 1ère connexion etc avec validation WhatsApp"
 *
 * Architecture :
 *  1. Client public remplit form (prénom + nom + email + téléphone WhatsApp + plan)
 *  2. signup.requestSignup() → génère OTP, stocke dans apex_v13_signup_pending_<id>
 *  3. Client reçoit lien wa.me Kevin avec OTP pré-rempli
 *  4. Kevin valide via vue admin → approveSignup() crée user + alias + status pending_plan/family_bypass
 *  5. Client peut alors se connecter via landing avec son nom + 1er PIN qu'il choisit
 *
 * Sécurité :
 *  - Anti-spam : 1 inscription max / téléphone / 24h
 *  - Validation phone E.164 (+33xxx ou +377xxx Monaco)
 *  - Validation email RFC 5322 simplifiée
 *  - OTP 12 chars alphanumériques (entropie ~70 bits) via WhatsApp service
 *  - RGPD : consent obligatoire avant submit (CGU + traitement)
 */

import { logger } from '../core/logger.js';

import { auditLog } from './audit-log.js';
import { authGate } from './auth-gate.js';
import { kevinAlerts } from './kevin-alerts.js';
import { whatsapp } from './whatsapp.js';

export type SignupPlan = 'family' | 'free' | 'basic' | 'pro';

export interface SignupRequest {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  whatsapp: string; /* Format E.164 +33xxx */
  plan: SignupPlan;
  consent: { cgu: boolean; rgpd: boolean; ts: number };
  otp: string; /* Mémorisé pour validation manuelle Kevin (P3 : hash en P4) */
  inviteLink: string; /* wa.me link Kevin */
  status: 'awaiting_otp' | 'awaiting_kevin' | 'approved' | 'rejected' | 'expired';
  createdAt: number;
  expiresAt: number;
  reviewedBy?: string;
  reviewedAt?: number;
  rejectReason?: string;
}

const PHONE_RE = /^\+(\d{1,3})(\d{6,14})$/; /* E.164 strict */
const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const TTL_MS = 7 * 24 * 60 * 60 * 1000; /* 7 jours pour Kevin valide */
const ANTI_SPAM_MS = 24 * 60 * 60 * 1000; /* 1 inscription max / 24h / phone */

class Signup {
  /**
   * Validation client-side AVANT submit (rapide, pas d'écriture).
   */
  validate(req: Pick<SignupRequest, 'prenom' | 'nom' | 'email' | 'whatsapp' | 'consent'>): { ok: boolean; reason?: string } {
    if (!req.prenom || req.prenom.trim().length < 2) return { ok: false, reason: 'Prénom requis (min 2 caractères)' };
    if (!req.nom || req.nom.trim().length < 2) return { ok: false, reason: 'Nom requis (min 2 caractères)' };
    if (!req.email || !EMAIL_RE.test(req.email)) return { ok: false, reason: 'Email invalide' };
    if (!req.whatsapp || !PHONE_RE.test(req.whatsapp.replace(/[\s\-()]/g, ''))) {
      return { ok: false, reason: 'Numéro WhatsApp invalide (format +33xxx)' };
    }
    if (!req.consent.cgu || !req.consent.rgpd) return { ok: false, reason: 'CGU + RGPD obligatoires' };
    return { ok: true };
  }

  /**
   * Submit signup → génère OTP + lien wa.me Kevin.
   * Anti-spam 1/24h/phone. Stockage local + Firebase pour Kevin admin.
   */
  async requestSignup(req: Omit<SignupRequest, 'id' | 'otp' | 'inviteLink' | 'status' | 'createdAt' | 'expiresAt'>): Promise<{
    ok: boolean;
    reason?: string;
    inviteLink?: string;
    requestId?: string;
  }> {
    /* Validation */
    const v = this.validate(req);
    if (!v.ok) return { ok: false, reason: v.reason ?? 'Validation échouée' };

    /* Anti-spam phone-based */
    const cleanPhone = req.whatsapp.replace(/[\s\-()]/g, '');
    const recent = this.findRecentByPhone(cleanPhone);
    if (recent) {
      const remainingMin = Math.ceil((recent.createdAt + ANTI_SPAM_MS - Date.now()) / 60_000);
      if (remainingMin > 0) {
        return { ok: false, reason: `Inscription déjà en cours pour ce numéro (${remainingMin} min restantes)` };
      }
    }

    /* Génération ID + OTP via WhatsApp service */
    const id = `signup_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    const tempUid = `pending_${id}`;
    const fullName = `${req.prenom.trim()} ${req.nom.trim()}`;

    const wa = await whatsapp.requestConfirmation({
      uid: tempUid,
      name: fullName,
      whatsappPhone: cleanPhone,
    });

    if (!wa.ok || !wa.inviteLink || !wa.otp) {
      return { ok: false, reason: wa.reason ?? 'WhatsApp service indisponible' };
    }

    const record: SignupRequest = {
      id,
      prenom: req.prenom.trim(),
      nom: req.nom.trim(),
      email: req.email.trim().toLowerCase(),
      whatsapp: cleanPhone,
      plan: req.plan,
      consent: req.consent,
      otp: wa.otp,
      inviteLink: wa.inviteLink,
      status: 'awaiting_kevin',
      createdAt: Date.now(),
      expiresAt: Date.now() + TTL_MS,
    };

    try {
      const list = this.getAll();
      list.push(record);
      localStorage.setItem('apex_v13_signup_requests', JSON.stringify(list));
    } catch (err: unknown) {
      logger.warn('signup', 'persist failed', { err });
      return { ok: false, reason: 'Erreur stockage local' };
    }

    /* Audit + notif Kevin (niveau B notify) */
    await auditLog.record('signup.requested', {
      details: { id, name: fullName, plan: req.plan, email: req.email, phone_masked: this.maskPhone(cleanPhone) },
    });

    void kevinAlerts.alertKevin({
      severity: 'info',
      title: '📥 Nouvelle inscription Apex',
      body: `${fullName} (${req.plan}) souhaite créer un compte. Code: ${wa.otp}`,
      source: 'signup',
      details: { id, plan: req.plan },
    }).catch(() => { /* non-blocking */ });

    logger.info('signup', `Signup requested by ${fullName}`, { id, plan: req.plan });
    return { ok: true, inviteLink: wa.inviteLink, requestId: id };
  }

  /**
   * Liste demandes en attente (admin Kevin only).
   */
  listPending(): SignupRequest[] {
    return this.getAll()
      .filter((r) => r.status === 'awaiting_kevin' && r.expiresAt > Date.now())
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Liste demandes traitées (approved + rejected) — historique admin.
   */
  listProcessed(): SignupRequest[] {
    return this.getAll()
      .filter((r) => r.status === 'approved' || r.status === 'rejected')
      .sort((a, b) => (b.reviewedAt ?? 0) - (a.reviewedAt ?? 0));
  }

  /**
   * Approve signup → crée user + alias + status (Kevin admin only).
   * Bumps signup → 'approved', génère uid définitif, registre aliases multi-formats.
   */
  async approveSignup(opts: {
    requestId: string;
    type: 'client' | 'family';
    plan?: SignupPlan;
    adminUid: string;
  }): Promise<{ ok: boolean; uid?: string; reason?: string }> {
    if (opts.adminUid !== 'kdmc_admin') return { ok: false, reason: 'Admin Kevin uniquement' };

    const list = this.getAll();
    const idx = list.findIndex((r) => r.id === opts.requestId);
    if (idx === -1) return { ok: false, reason: 'Demande introuvable' };
    const req = list[idx];
    if (!req) return { ok: false, reason: 'Demande introuvable' };
    if (req.status !== 'awaiting_kevin') return { ok: false, reason: 'Demande déjà traitée' };
    if (req.expiresAt < Date.now()) {
      req.status = 'expired';
      list[idx] = req;
      try { localStorage.setItem('apex_v13_signup_requests', JSON.stringify(list)); } catch { /* ignore */ }
      return { ok: false, reason: 'Demande expirée' };
    }

    /* Génère uid définitif */
    const tier = opts.type === 'family' ? 'family' : (opts.plan ?? req.plan ?? 'free');
    const uid = `${tier}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    const fullName = `${req.prenom} ${req.nom}`;

    /* Création user record */
    try {
      const users = JSON.parse(localStorage.getItem('apex_v13_users') ?? '[]') as Array<{
        id: string; name: string; email: string; tier: string; whatsapp: string; createdAt: number; createdBy: string; activated: boolean;
      }>;
      users.push({
        id: uid,
        name: fullName,
        email: req.email,
        tier,
        whatsapp: req.whatsapp,
        createdAt: Date.now(),
        createdBy: opts.adminUid,
        activated: true,
      });
      localStorage.setItem('apex_v13_users', JSON.stringify(users));
      localStorage.setItem(`apex_v13_tier_${uid}`, tier);
    } catch (err: unknown) {
      logger.error('signup', 'user persist failed', { err });
      return { ok: false, reason: 'Erreur création user' };
    }

    /* Aliases pour reconnaissance flexible (règle Kevin v9.458) */
    const aliases = this.buildAliases(req.prenom, req.nom, req.email);
    authGate.registerUserAliases(uid, aliases);

    /* Statut */
    if (opts.type === 'family') {
      authGate.setStatus(uid, 'family_bypass');
    } else {
      authGate.setStatus(uid, 'pending_plan');
    }

    /* Update signup record */
    req.status = 'approved';
    req.reviewedBy = opts.adminUid;
    req.reviewedAt = Date.now();
    list[idx] = req;
    try { localStorage.setItem('apex_v13_signup_requests', JSON.stringify(list)); } catch { /* ignore */ }

    await auditLog.record('signup.approved', {
      actor: opts.adminUid,
      details: { requestId: opts.requestId, uid, type: opts.type, tier },
    });

    /* Notif Kevin niveau B (login event when client connects later) */
    logger.info('signup', `Approved ${fullName} → uid=${uid} tier=${tier}`);
    return { ok: true, uid };
  }

  /**
   * Reject signup → mark rejected (Kevin admin only).
   */
  async rejectSignup(opts: { requestId: string; adminUid: string; reason: string }): Promise<{ ok: boolean; reason?: string }> {
    if (opts.adminUid !== 'kdmc_admin') return { ok: false, reason: 'Admin Kevin uniquement' };

    const list = this.getAll();
    const idx = list.findIndex((r) => r.id === opts.requestId);
    if (idx === -1) return { ok: false, reason: 'Demande introuvable' };
    const req = list[idx];
    if (!req) return { ok: false, reason: 'Demande introuvable' };
    if (req.status !== 'awaiting_kevin') return { ok: false, reason: 'Demande déjà traitée' };

    req.status = 'rejected';
    req.reviewedBy = opts.adminUid;
    req.reviewedAt = Date.now();
    req.rejectReason = opts.reason.slice(0, 200);
    list[idx] = req;
    try { localStorage.setItem('apex_v13_signup_requests', JSON.stringify(list)); } catch { /* ignore */ }

    await auditLog.record('signup.rejected', {
      actor: opts.adminUid,
      details: { requestId: opts.requestId, reason: req.rejectReason },
    });
    logger.info('signup', `Rejected ${req.prenom} ${req.nom}`, { reason: req.rejectReason });
    return { ok: true };
  }

  /**
   * Cleanup expired demandes (sentinelle 1×/h).
   */
  async cleanupExpired(): Promise<number> {
    const list = this.getAll();
    const now = Date.now();
    let count = 0;
    for (const r of list) {
      if (r.status === 'awaiting_kevin' && r.expiresAt < now) {
        r.status = 'expired';
        count++;
      }
    }
    if (count > 0) {
      try { localStorage.setItem('apex_v13_signup_requests', JSON.stringify(list)); } catch { /* ignore */ }
      await auditLog.record('signup.cleanup', { details: { expired: count } });
    }
    return count;
  }

  /**
   * Build aliases multi-formats pour reconnaissance flexible.
   * (règle Kevin v9.458 — toutes les façons : casse, ordre, accents, tirets)
   */
  private buildAliases(prenom: string, nom: string, email: string): string[] {
    const p = prenom.trim();
    const n = nom.trim();
    const aliases = new Set<string>([
      `${p} ${n}`,
      `${n} ${p}`,
      `${p.toLowerCase()} ${n.toLowerCase()}`,
      `${n.toUpperCase()} ${p}`,
      email.trim().toLowerCase(),
    ]);
    /* Initiales + nom : "K DESARZENS" */
    if (p.length > 0) aliases.add(`${p.charAt(0).toUpperCase()} ${n}`);
    return [...aliases];
  }

  private getAll(): SignupRequest[] {
    try {
      return JSON.parse(localStorage.getItem('apex_v13_signup_requests') ?? '[]') as SignupRequest[];
    } catch {
      return [];
    }
  }

  private findRecentByPhone(phone: string): SignupRequest | null {
    const cutoff = Date.now() - ANTI_SPAM_MS;
    return this.getAll().find((r) => r.whatsapp === phone && r.createdAt > cutoff && r.status === 'awaiting_kevin') ?? null;
  }

  private maskPhone(phone: string): string {
    if (phone.length <= 4) return phone;
    return phone.slice(0, 4) + '***' + phone.slice(-2);
  }
}

export const signup = new Signup();
