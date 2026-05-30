/**
 * firebase-auth-bridge.ts — Pont Phase 5 (côté client Apex).
 *
 * À la connexion (event `auth:login`), obtient un id_token Firebase auprès de
 * apex-auth-worker (qui valide le hash de PIN et signe le token côté serveur),
 * puis l'expose via getToken() pour que firebase.ts l'attache en RTDB `?auth=`.
 *
 * 🛟 FAIL-OPEN ABSOLU : toute erreur (worker absent, hash inconnu, réseau, parse)
 * → pas de token → getToken() renvoie '' → firebase.ts n'attache rien → comportement
 * STRICTEMENT identique à aujourd'hui. Aucune régression possible tant que les
 * règles RTDB restent ouvertes (la bascule stricte = étape séparée, gated).
 *
 * Le hash de PIN n'est PAS recalculé ici : on réutilise celui déjà stocké en
 * localStorage par auth.ts (`apex_v13_pin` admin / `apex_v13_pin_<uid>`), qui est
 * exactement la valeur que le worker compare à /apex/ax_pin_<uid>. Au 1er login
 * (record Firebase absent) → bootstrap par PUT direct (règles ouvertes phase 4) →
 * le worker pourra valider ensuite (lecture admin, même sous règles strictes).
 */
import { events } from '../../core/events.js';
import { logger } from '../../core/logger.js';

const DEFAULT_WORKER_URL = 'https://apex-auth-worker.9r4rxssx64.workers.dev';
const FB_DEFAULT = 'https://cmcteams-c16ab-default-rtdb.europe-west1.firebasedatabase.app';

const TOKEN_KEY = 'apex_v13_fb_idtoken';
const EXP_KEY = 'apex_v13_fb_idtoken_exp';
const REFRESH_KEY = 'apex_v13_fb_refresh';
const STATUS_KEY = 'apex_v13_fb_auth_status';

type LoginResult = 'ok' | 'user_not_found' | string;

class FirebaseAuthBridge {
  private idToken = '';
  private exp = 0;
  private started = false;

  /** Wiré au boot (core/bootstrap.ts safeInit). Idempotent. */
  init(): void {
    if (this.started) return;
    this.started = true;

    /* Restore token encore valide (évite un appel worker à chaque reload) */
    try {
      const t = localStorage.getItem(TOKEN_KEY);
      const e = parseInt(localStorage.getItem(EXP_KEY) ?? '0', 10);
      if (t && e > Date.now() + 60_000) { this.idToken = t; this.exp = e; }
    } catch { /* ignore */ }

    events.on('auth:login', (p) => { void this.activate(p.uid, p.isAdmin); });
    events.on('auth:logout', () => { this.clear(); });

    /* Déjà loggé au boot mais pas de token frais → tenter activation */
    try {
      const uid = localStorage.getItem('apex_v13_uid');
      if (uid && !this.getToken()) {
        void this.activate(uid, uid === 'kdmc_admin');
      }
    } catch { /* ignore */ }
  }

  /** Token id_token valide (>30s avant expiry) ou '' (fail-open). Lecture sync. */
  getToken(): string {
    if (this.idToken && this.exp > Date.now() + 30_000) return this.idToken;
    return '';
  }

  private workerUrl(): string {
    try { return localStorage.getItem('ax_auth_worker_url') || DEFAULT_WORKER_URL; }
    catch { return DEFAULT_WORKER_URL; }
  }

  private fbUrl(): string {
    try { return localStorage.getItem('apex_v13_fb_url') || FB_DEFAULT; }
    catch { return FB_DEFAULT; }
  }

  private setStatus(s: Record<string, unknown>): void {
    try { localStorage.setItem(STATUS_KEY, JSON.stringify({ ...s, ts: Date.now() })); }
    catch { /* ignore */ }
  }

  /**
   * Obtient un id_token pour ce user. Fail-open : renvoie false sans jamais throw.
   */
  async activate(uid: string, isAdmin: boolean): Promise<boolean> {
    try {
      if (!uid) return false;
      const pinKey = isAdmin ? 'apex_v13_pin' : `apex_v13_pin_${uid}`;
      const pinHash = localStorage.getItem(pinKey);
      if (!pinHash) { this.setStatus({ ok: false, reason: 'no_local_pin' }); return false; }

      let res = await this.callLogin(uid, pinHash);
      if (res === 'user_not_found') {
        /* Bootstrap : créer le record Firebase (règles ouvertes) puis réessayer */
        await this.bootstrapFirebasePin(uid, pinHash);
        res = await this.callLogin(uid, pinHash);
      }

      if (res !== 'ok') { this.setStatus({ ok: false, reason: 'login:' + res }); return false; }

      this.setStatus({ ok: true, has_id_token: !!this.idToken, mode: this.idToken ? 'id_token' : 'custom_only' });
      logger.info('fb-auth-bridge', 'Phase 5 activée', { has_id_token: !!this.idToken, uid });
      return true;
    } catch (e) {
      this.setStatus({ ok: false, reason: 'exception:' + String((e as Error)?.message ?? e).slice(0, 80) });
      return false;
    }
  }

  private async callLogin(uid: string, pinHash: string): Promise<LoginResult> {
    try {
      const r = await fetch(this.workerUrl() + '/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, pin_hash: pinHash }),
        signal: AbortSignal.timeout(10_000),
      });
      const data = await r.json().catch(() => ({})) as {
        ok?: boolean; error?: string; id_token?: string; refresh_token?: string; expires_in?: number;
      };
      if (r.ok && data.ok) {
        if (data.id_token) {
          this.idToken = data.id_token;
          this.exp = Date.now() + ((Number(data.expires_in) || 3600) * 1000);
          try {
            localStorage.setItem(TOKEN_KEY, this.idToken);
            localStorage.setItem(EXP_KEY, String(this.exp));
            if (data.refresh_token) localStorage.setItem(REFRESH_KEY, data.refresh_token);
          } catch { /* ignore */ }
        }
        return 'ok';
      }
      return data?.error ? String(data.error) : ('http_' + r.status);
    } catch (e) {
      return 'fetch_error:' + String((e as Error)?.message ?? e).slice(0, 60);
    }
  }

  /** PUT direct du hash dans /apex/ax_pin_<uid> (règles ouvertes phase 4). Best-effort. */
  private async bootstrapFirebasePin(uid: string, pinHash: string): Promise<void> {
    try {
      await fetch(`${this.fbUrl()}/apex/ax_pin_${encodeURIComponent(uid)}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pinHash),
        signal: AbortSignal.timeout(8_000),
      });
    } catch (e) {
      logger.warn('fb-auth-bridge', 'bootstrap pin failed (fail-open)', { err: e });
    }
  }

  clear(): void {
    this.idToken = '';
    this.exp = 0;
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(EXP_KEY);
      localStorage.removeItem(REFRESH_KEY);
    } catch { /* ignore */ }
  }
}

export const firebaseAuthBridge = new FirebaseAuthBridge();
