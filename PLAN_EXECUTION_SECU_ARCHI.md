# PLAN D'EXÉCUTION — Sécurité 5/5 + Monolithe (CMCteams)

> Rédigé 2026-06-07 (après v9.786). **Aucun code prod modifié par ce document.**
> Objectif : feuille de route phasée, mesurée, avec rollback, pour les 3 chantiers
> architecturaux qui restent entre l'état actuel (~4/5 sécu, monolithe 3,17 Mo) et
> le « vrai 100/100 par axe ». Chaque phase est livrable indépendamment, testée,
> et **ne casse jamais la prod** (no-build static deploy + Firebase REST/SSE conservés
> tant que le remplacement n'est pas prouvé).

## État vérifié (mesuré le 2026-06-07)
- `index.html` = 3 170 415 o · 47 779 lignes · 1 398 fonctions · 96 vues · ~1 162 l. CSS.
- Déploiement : **fichier statique unique** sur GitHub Pages (aucune étape de build).
- Firebase : REST + SSE **sans token d'auth** (`grep` : aucun `?auth=`, `idToken`, `signInWith`). DB de fait ouverte.
- CSP : présente et restrictive (`default-src 'self'`, `object-src 'none'`, `form-action 'none'`) mais `script-src 'unsafe-inline'` (inhérent aux 47k lignes de handlers inline).
- Clé IA : `cmc_ia_key` en clair dans localStorage (FB_LOCAL, device-local, admin-only).
- Sécurité actuelle ≈ **4/5** (rate-limit PIN, TTL 8h, guards admin, esc(), CSP OK ; noopener + stack-admin durcis en v9.786).

---

## CHANTIER 1 — Vault clé IA (chiffrement au repos)  🟠 risque MOYEN (revu) · ROI moyen
**Gap** : `cmc_ia_key` lisible en clair (DevTools / vol fichier). **Cible** : chiffrée AES-GCM, jamais en clair.

> ⚠️ **Scope corrigé après mesure (2026-06-07)** : initialement estimé « 1 site de lecture » —
> **FAUX**. Mesuré : **9+ sites de lecture synchrones** (`12482, 27135, 37047, 42664,
> 43394, 43455, 43562, 43680, 47648`) + cache mémoire global `iaApiKey` + chaîne de
> fallback cross-app `_resolveIaKey` (lit `ax_shared_api_key`/`ax_api_key` et **re-persiste**
> `cmc_ia_key`) + restore config (43733) + bouton reset (1265/8959). WebCrypto AES-GCM est
> **asynchrone** → pas de decrypt synchrone possible ; l'obfuscation XOR synchrone est un
> **anti-pattern documenté** (lesson #55 : a cassé le vault Apex au force-update). Donc ce
> n'est PAS un bolt-on : il faut gérer l'ordre async au boot + migrer chaque site.

### Étapes (revues, sûres)
1. Helper `cmcEncryptSecret`/`cmcDecryptSecret` WebCrypto AES-GCM-256 + PBKDF2 (passphrase = PIN admin dérivé, pas de saisie en plus).
2. **Boot async d'abord** : au login admin, décrypter `cmc_ia_key_enc` → peupler le cache mémoire `iaApiKey` AVANT tout appel IA. Garde : si IA appelée avant fin du decrypt → attendre la promesse (flag `_iaKeyReady`).
3. **Tous les fallbacks `||localStorage.getItem("cmc_ia_key")` → `||iaApiKey`** (le cache mémoire déchiffré), JAMAIS lire le localStorage chiffré directement. Migrer les 9 sites un par un.
4. `_resolveIaKey` (cross-app) : chiffrer avant re-persist ; ne jamais réécrire en clair.
5. Écriture (`43685`) : `cmc_ia_key_enc` chiffré + `iaApiKey` mémoire + supprimer `cmc_ia_key` clair.
6. Migration boot one-shot : `cmc_ia_key` clair → chiffrer → effacer (idempotent). **Dual-read 1 version** (lire l'ancien clair si présent) avant suppression définitive.
7. Reset button (1265/8959) : préserver `cmc_ia_key_enc` au lieu de `cmc_ia_key`.

### Risque / Rollback
- Risque : race boot (IA appelée avant decrypt) → géré par flag `_iaKeyReady` + await. Si decrypt KO (PIN changé) → fallback « ressaisir la clé » (IA non critique au planning).
- Rollback : dual-read clair legacy 1 version.

### Validation mesurée
- Test runtime `test:vault-ia` : setKey → reload → getKey === valeur ; `cmc_ia_key` clair absent ; `cmc_ia_key_enc` ≠ clair ; un appel IA simulé récupère bien la clé déchiffrée. + les 9 sites lisent `iaApiKey`.
- `test:ci` vert.

**Effort : 1 session dédiée et soignée (pas un bolt-on). Isolation : index.html only.**

---

## CHANTIER 2 — Firebase Auth + Rules durcies  🟠 risque MOYEN · sécurité MAX
**Gap** : DB ouverte (n'importe qui avec l'URL lit/écrit planning, mdp hashés, chat). **C'est le vrai trou.** **Cible** : `auth.uid` requis, paths scopés, validation schéma.

### Pré-requis bloquant
L'app DOIT s'authentifier AVANT de durcir les règles, sinon **prod 100% cassée** (lecture/écriture refusées). Donc séquence stricte, jamais l'inverse.

### Étapes (ordre impératif)
1. **Phase A — Auth transparente (aucune UI en plus)**
   - Activer Firebase **Anonymous Auth** (ou custom-token via worker) sur le projet `cmcteams-c16ab`.
   - Dans l'app : obtenir un idToken au boot, l'ajouter à TOUTES les requêtes REST (`?auth=<idToken>`) et au SSE (`EventSource(url?auth=...)`). Refresh token avant expiration (1h).
   - **Rules encore ouvertes à ce stade** → aucun impact prod, on prépare juste le terrain.
   - Validation : logs réseau montrent `?auth=` partout ; app fonctionne identique.
2. **Phase B — Rules en mode CANARY (dual)**
   - Écrire `firebase-rules.json` strict : `".read"/".write": "auth != null"` au niveau racine `/cmcteams`, + validation par sous-clé (ex: `cmc_pw` lisible seulement si admin custom-claim).
   - Déployer sur un **chemin de test** (`/cmcteams_canary`) d'abord ; faire pointer une build canary dessus ; valider lecture/écriture OK avec auth.
3. **Phase C — Bascule prod + rollback armé**
   - Déployer les rules strictes sur `/cmcteams`. Garder l'ancien `firebase-rules.json` (ouvert) prêt à redéployer en 1 commande si incident.
   - Surveiller 24-48h (sentinelle `fb-auth-watch` : si taux d'erreurs 401/permission monte → rollback auto).
4. **Phase D — Claims admin**
   - Custom claim `role=admin` sur l'uid Kevin (via worker/CI), rules `cmc_pw`/`cmc_audit` = admin-only.

### Risque / Rollback
- Risque : un device non migré (vieux cache) perd l'accès → mitigé par MAJ auto network-first (v9.615) + phase canary.
- Rollback : redéployer `firebase-rules.json` ouvert (versionné dans le repo) → accès rétabli en secondes.

### Validation mesurée
- `test:fb-auth` : requête sans token → 401 ; avec token non-admin → `cmc_pw` refusé ; avec admin → OK.
- Monitoring : 0 hausse d'erreurs permission sur 48h.

**Effort : 2-3 sessions. Dépendances : 1 réglage console Firebase (activer Anonymous Auth) OU worker custom-token. Isolation : index.html + firebase-rules.json + workflow deploy-rules.**

---

## CHANTIER 3 — Build pipeline + CSP nonce + split monolithe  🔴 risque ÉLEVÉ · dette de fond
**Gap** : `script-src 'unsafe-inline'` + 3,17 Mo monolithe. **Cible** : sources modulaires, bundle émis = 1 `index.html` (modèle de déploiement INCHANGÉ), CSP avec nonce.

### Principe directeur (anti-régression)
Le **livrable de build reste un `index.html` unique** servi par Pages → le modèle no-build de déploiement ne change pas, seul l'amont (sources) est modularisé. On évite l'erreur #54 (source vs build désync) par CI stricte.

### Étapes (très incrémental, réversible à chaque pas)
1. **Phase 0 — Filet** : geler une baseline (tag git) + le `test:ci` actuel comme garde anti-régression visuelle/fonctionnelle.
2. **Phase A — Extraire le CSS** : sortir les 8 `<style>` → `assets/cmc.css`, inliné au build. Gain lisibilité, risque quasi nul. Valider rendu identique (Playwright screenshots).
3. **Phase B — Build esbuild** : introduire `esbuild` qui concatène/minifie les blocs JS en 1 bundle, **réinjecté dans index.html au build**. Sortie = même `index.html` monolithique mais minifié (gain taille ~40-50%). Source devient `src/*.js` découpé par domaine (parser, chat, ia, map, admin…). `npm run build` + CI qui vérifie `index.html` déployé == build (anti #54).
4. **Phase C — CSP nonce** : le plugin de build remplace `unsafe-inline` par un nonce par release sur les `<script>` ; les handlers `onclick=` inline migrés progressivement vers `addEventListener` (gros volume → étalé sur plusieurs sessions, module par module, chacun testé).
5. **Phase D — Tree-shaking / dead-code** : mesurer (coverage) le code réellement exécuté → retirer le mort confirmé (grep dynamique d'abord, cf. lesson #59).

### Risque / Rollback
- Risque : casse de rendu/handlers, désync source/déploiement (#54), perte du « ouvrir le HTML direct ».
- Rollback : chaque phase = 1 PR isolée, revert possible ; baseline taguée.

### Validation mesurée
- Playwright screenshots avant/après (rendu pixel-proche), `test:ci` vert, taille bundle mesurée, Lighthouse mobile avant/après.

**Effort : 5-8 sessions (Phase C = le gros). Isolation : ajoute src/ + build, index.html reste l'artefact déployé.**

---

## ORDRE RECOMMANDÉ (valeur / risque)
1. **Chantier 1 (Vault IA)** — quick win sûr, +sécu réel.
2. **Chantier 2 Phases A→C (Firebase Auth + Rules)** — **le vrai gain sécu** (ferme la DB ouverte). À faire avant de revendiquer 5/5.
3. **Chantier 3** — dette de fond, à étaler, le moins urgent (l'app marche, c'est de la qualité interne).

## Ce qui restera « hors app »
- Activation Anonymous Auth (1 réglage console Firebase) OU worker custom-token (automatisable via CI + secret).
- Déploiement des rules : via workflow `firebase-deploy-rules.yml` (token CI) → zéro clic Kevin une fois le secret posé.

## Garde-fous permanents (toutes phases)
- `test:ci` vert + Playwright avant chaque merge.
- Vérif déploiement réel sur le **vrai GitHub** (lesson #72/#79 : lire `sw.js`/`APP_VER` via API après merge).
- Isolation CMCteams stricte (jamais toucher `apex-ai/`, boutique, workflows partagés).
- Jamais annoncer un score non re-mesuré (lesson #59).
