/**
 * APEX v13 — Permissions tiered (5 niveaux)
 *
 * Préservé de v12.785 (règle CLAUDE.md "compte admin unique Kevin + permissions tiered Laurence") :
 * - admin       : Kevin DESARZENS — tout autorisé (bypass commerce + permissions)
 * - laurence    : Laurence SAINT-POLIT — vue isolée + permissions tiered (auto/notify/validate)
 * - family      : Famille Kevin — accès étendu sans admin
 * - client_pro  : Clients payants pro — features pro + studios premium
 * - client_free : Clients gratuits — features de base
 */

import { store } from '../core/store.js';

export type Tier = 'admin' | 'laurence' | 'family' | 'client_pro' | 'client_free';

export type PermissionLevel = 'auto' | 'notify' | 'validate' | 'denied';

interface ActionPermissions {
  admin: PermissionLevel;
  laurence: PermissionLevel;
  family: PermissionLevel;
  client_pro: PermissionLevel;
  client_free: PermissionLevel;
}

/* Whitelist actions (auto = fait sans demander, notify = fait + push admin, validate = bloqué tant que admin pas validé) */
const ACTIONS: Record<string, ActionPermissions> = {
  /* Niveau A — auto */
  read_self: { admin: 'auto', laurence: 'auto', family: 'auto', client_pro: 'auto', client_free: 'auto' },
  edit_profile: { admin: 'auto', laurence: 'auto', family: 'auto', client_pro: 'auto', client_free: 'auto' },
  chat: { admin: 'auto', laurence: 'auto', family: 'auto', client_pro: 'auto', client_free: 'auto' },
  use_studios: { admin: 'auto', laurence: 'auto', family: 'auto', client_pro: 'auto', client_free: 'denied' },
  ai_query: { admin: 'auto', laurence: 'auto', family: 'auto', client_pro: 'auto', client_free: 'auto' },
  voice: { admin: 'auto', laurence: 'auto', family: 'auto', client_pro: 'auto', client_free: 'denied' },

  /* Niveau B — notify Kevin */
  login: { admin: 'auto', laurence: 'notify', family: 'notify', client_pro: 'notify', client_free: 'notify' },
  upload_large: { admin: 'auto', laurence: 'notify', family: 'auto', client_pro: 'auto', client_free: 'denied' },

  /* Niveau C — validate Kevin */
  erase_account: { admin: 'auto', laurence: 'validate', family: 'validate', client_pro: 'validate', client_free: 'validate' },
  export_data: { admin: 'auto', laurence: 'validate', family: 'auto', client_pro: 'auto', client_free: 'validate' },
  change_email: { admin: 'auto', laurence: 'validate', family: 'auto', client_pro: 'auto', client_free: 'validate' },
  purchase_above_50: { admin: 'auto', laurence: 'validate', family: 'validate', client_pro: 'auto', client_free: 'validate' },
  beta_features: { admin: 'auto', laurence: 'auto', family: 'auto', client_pro: 'auto', client_free: 'denied' },

  /* Admin only */
  admin_view: { admin: 'auto', laurence: 'denied', family: 'denied', client_pro: 'denied', client_free: 'denied' },
  toggle_commerce: { admin: 'auto', laurence: 'denied', family: 'denied', client_pro: 'denied', client_free: 'denied' },
  edit_other_users: { admin: 'auto', laurence: 'denied', family: 'denied', client_pro: 'denied', client_free: 'denied' },
};

class Permissions {
  getTier(): Tier {
    const user = store.get('user');
    if (!user) return 'client_free';
    if (user.id === 'kdmc_admin') return 'admin';
    if (user.id === 'laurence_sp') return 'laurence';
    /* Détection family/pro/free via plan stocké */
    try {
      const tier = localStorage.getItem(`apex_v13_tier_${user.id}`) as Tier | null;
      if (tier) return tier;
    } catch {
      /* ignore */
    }
    return 'client_free';
  }

  check(action: string): PermissionLevel {
    const tier = this.getTier();
    const def = ACTIONS[action];
    if (!def) return 'auto'; /* action inconnue = auto par défaut, à durcir Jet 3 */
    return def[tier];
  }

  isAllowed(action: string): boolean {
    return this.check(action) !== 'denied';
  }

  setTier(uid: string, tier: Tier): void {
    try {
      localStorage.setItem(`apex_v13_tier_${uid}`, tier);
    } catch {
      /* ignore */
    }
  }
}

export const permissions = new Permissions();
