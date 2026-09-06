# Apex Chat — Findings d'audit

**Date** : 2026-09-05 · **Version auditée** : `v1.1.281` (`messaging-app/index.html:461`)
**Méthode** : lecture du code + exécution réelle (tests, reproduction de faille en bac à sable)
**Statuts de preuve** : ✅ VÉRIFIÉ (commande exécutée) · 🟡 DÉDUIT (lecture) · 🔴 SUPPOSÉ

---

## [P0] Un jeton admin de 30 jours s'obtient sans OTP, avec un numéro public

- **Axe** : Sécurité
- **Fichier** : `messaging-app/workers/api-worker.js:759-806` (bypass) · `messaging-app/index.html:7193` (fuite du numéro)
- **Statut** : ✅ **VÉRIFIÉ** — reproduit en bac à sable, handler réel importé

### Preuve (sortie réelle)

```
POST /api/auth/verify-otp  { phone:"+33672280277", pseudo:"pirate", otp:"000000" }
env : ALLOW_TEST_OTP='false'  (le backdoor universel est bien fermé)

HTTP 200
is_admin : true
sub      : kdmc_admin
payload  : {"sub":"kdmc_admin","pseudo":"pirate","is_admin":true,...} → validité 30 jours
```

### Cause racine

`handleVerifyOtp` court-circuite l'OTP dès que `phone === env.KEVIN_PHONE_E164` :

```js
if (otp === '000000') {
  ...
  if (kevinSecret && phoneNorm === kevinSecret) {   // ← seule condition
    const jwt = await signJWT({ sub:'kdmc_admin', is_admin:true, exp:+30j }, env.JWT_SIGN_KEY);
    return json({ ok:true, token:jwt, user:{ id:'kdmc_admin', is_admin:true }});
  }
}
```

Le secret qui garde cette porte est **un numéro de téléphone**, et ce numéro est **écrit en clair
dans le fichier public servi à chaque visiteur** :

```
messaging-app/index.html:7193   const isKevinByPhone = cleanPhone === '+33672280277';
messaging-app/index.html:7430   ... || K.authData.phone === '+33672280277';
```

Un secret publié dans le client n'est plus un secret. Aucune preuve de possession du numéro
n'est exigée : pas de SMS, pas de Face ID, pas de second facteur.

### Impact mesuré

Le jeton obtenu ouvre les **20 routes `/api/admin/*`**. En particulier
`GET /api/admin/all-users` (`api-worker.js:3377`) renvoie, jusqu'à 500 fiches par page :

```sql
SELECT id, pseudo, real_name, display_name, phone, avatar_url, created_at, last_seen,
       is_admin, is_banned, admin_authorized, last_ip_hash, last_user_agent,
       last_lat, last_lng, last_geo_label, last_device_label, premium_until, ...
```

→ **vrais noms, numéros de téléphone en clair, coordonnées GPS, appareils** de tous les inscrits.
S'y ajoutent `/api/admin/map`, `/api/admin/users/:id/geo-history`, `/api/admin/search`,
`/api/admin/commands` (bannir / supprimer / déconnecter), `/api/admin/invite-magic`.

Et `kdmc_admin` est inséré comme **membre invisible** (`kevin_invisible`) de chaque conversation
(`api-worker.js:1670-2171`) — le jeton donne donc aussi l'accès au flux des conversations.
Le contenu des messages reste protégé par le chiffrement de bout en bout **quand il est actif** ;
`ConversationDO.js:455-458` montre qu'il peut être désactivé, auquel cas le texte est stocké en clair.

### Correctif

1. Retirer le numéro de `index.html` (2 occurrences) — il n'a rien à faire dans un fichier public.
2. Exiger une vraie preuve pour l'admin : OTP réel, ou Face ID / passkey (`_biometricSupported`
   existe déjà en `index.html:14437`), ou jeton signé hors bande.
3. Réduire la durée du jeton admin (30 j → quelques heures) et permettre sa révocation.
4. Ne jamais faire reposer un privilège sur une donnée servie au client.

### Test qui prouve le correctif

Un test qui rejoue exactement la requête ci-dessus et attend **403**, câblé dans `test:ci`.
Sabotage de contrôle : réactiver le bypass → le test doit échouer.

**Effort** : S (quelques lignes) · **Régression possible** : Kevin doit pouvoir se reconnecter —
prévoir le chemin de secours (Face ID déjà présent) **avant** de fermer la porte.

---

## [P1] Session admin locale obtenue en tapant le nom — ✅ CORRIGÉ v1.1.285 (05/09)

- **Axe** : Sécurité · **Fichier** : `messaging-app/index.html:7430`
- **Statut** : ✅ VÉRIFIÉ — corrigé v1.1.285, garde de non-régression câblée (`tests/unit/no-client-side-admin-by-name.test.js`), 1086/1086 tests verts.

> **Correctif appliqué (v1.1.285)** : l'admin est décidé UNIQUEMENT côté serveur
> (`user.is_admin` renvoyé par le Worker + JWT). Les 3 vecteurs client par le nom
> sont supprimés : (1) repli hors-ligne = simple utilisateur (`is_admin:false`,
> plus de `kdmc_admin`) ; (2) plus de `K.user.is_admin=true` dérivé du nom dans
> `K.login`/restauration → on lit `user.is_admin` du serveur ; (3) **le pire** :
> le bypass en ligne fabriquait un jeton `'local-admin-'` avec `is_admin:true`
> MÊME sur refus serveur (401 `admin_mfa_required`) → désormais session simple
> utilisateur sur refus (pas de lock-out ; l'admin re-vient via le SSO Face ID).
> Anti-lock-out préservé côté serveur (`X-Apex-Admin-Token`). Cf. leçon #216.

Si le worker est injoignable, le client crée un compte local :

```js
const isKevin = isKevinAdmin(K.authData.name) || K.authData.phone === '+33672280277';
const localUser = { id: isKevin ? 'kdmc_admin' : ('local_'+...), ... };
```

Taper « Kevin Desarzens » en coupant le réseau suffit à obtenir une session marquée admin
côté navigateur. Sans jeton serveur valide, les données distantes restent hors de portée,
mais le panneau admin et les données déjà en cache s'ouvrent.

**Correctif** : le repli hors-ligne ne doit jamais accorder `kdmc_admin` ni `is_admin`.

---

## [P2] Le jeton de session circule dans l'URL du WebSocket — ✅ CORRIGÉ v1.1.286

- **Axe** : Sécurité · **Fichier** : `messaging-app/api-worker.js:148`
- **Statut** : ✅ VÉRIFIÉ (lecture confirmée) → ✅ **CORRIGÉ ET PROUVÉ** (v1.1.286)

```js
token = new URL(request.url).searchParams.get('token');
```

Contournement légitime (le navigateur ne pose pas d'en-tête sur un upgrade WebSocket), mais un
jeton en query string se retrouve dans les journaux serveur, les proxys et les référents.

**Correctif** : jeton d'usage unique et court, échangé contre la session à l'ouverture du socket.

### ✅ Correctif appliqué — v1.1.286 (2026-09-06)

**Serveur** (`workers/api-worker.js`)
- Nouvelle route `POST /api/auth/ws-ticket` : échange le jeton de session (en-tête `Authorization`,
  qui ne voyage jamais dans une URL) contre un **ticket** signé `{typ:'wstkt', jti, exp: +60 s}`.
- `getAuthUser` accepte `?ticket=` et **consomme le `jti`** dans `ws_tickets` (`INSERT OR IGNORE`
  sur une clé primaire → la consommation est **atomique**, un rejeu insère 0 ligne et est refusé).
- Un ticket **ne vaut jamais session** : rejeté en `Authorization: Bearer` comme en `?token=`.
- Base indisponible → **fail-closed** (un ticket non consommable ne peut pas valoir session).

**Client** (`index.html`)
- `K._wsTicket()` demande un ticket, `_openWs` connecte en `?ticket=`.
- `?token=` conservé **une version** en repli explicite (une app encore en cache doit continuer à
  se connecter — règle « jamais casser la connexion »). À retirer en v1.1.287.

**Preuve** — `tests/unit/ws-ticket-usage-unique.test.js`, 6 tests sur le vrai worker :
ticket refusé sans session · ticket valide ouvre le chemin WS · **le même ticket une 2ᵉ fois est
refusé** · un ticket ne vaut pas session (Bearer et `?token=`) · repli `?token=` intact ·
le client demande bien un ticket.
**Discriminant prouvé par sabotage** : usage unique retiré → 1 échec ; garde « ticket ≠ session »
retirée → 1 échec ; restauré → 6/6. Suite complète **1104/1104**, navigateur réel **5/5**, 0 exception JS.

**Reste** (même classe, traité séparément) : les URL de médias (`K._mediaSrc`) portent encore
`?token=` — voir le finding P2c ci-dessous.

---

## [P2c] Le jeton de session circule aussi dans les URL de médias

- **Axe** : Sécurité · **Fichier** : `messaging-app/index.html` (`K._mediaSrc`)
- **Statut** : ✅ VÉRIFIÉ (lecture confirmée) — **non corrigé**

```js
return full + (full.indexOf('?') >= 0 ? '&' : '?') + 'token=' + encodeURIComponent(K.token || '');
```

Même défaut que le P2a, sur un autre chemin : le jeton de session part dans l'attribut `src` de
chaque image/vidéo. Il entre donc dans le DOM, l'historique du navigateur et les journaux du
serveur de médias.

**Pourquoi ce n'est pas livré dans le même lot** : un média est lu **plusieurs fois** (aperçu,
plein écran, re-rendu), donc un ticket à usage unique ne convient pas tel quel — il faut un
ticket court **réutilisable** dans sa fenêtre, plus un rafraîchissement côté client. Ça touche
tout le rendu des médias : le livrer à l'aveugle dans le même commit que le WebSocket risquait de
casser l'affichage des photos. À traiter comme une étape vérifiée à part.

---

## [P2] CORS ouvert à tous sur toute l'API — ✅ CORRIGÉ v1.1.287

- **Axe** : Sécurité · **Fichier** : `messaging-app/workers/lib/cors.js:13`
- **Statut** : ✅ VÉRIFIÉ → ✅ **CORRIGÉ ET PROUVÉ** (v1.1.287)

`Access-Control-Allow-Origin: '*'` sur les 4 workers, y compris les routes admin. Le commentaire
du fichier annonce déjà le durcissement par liste blanche — il n'a pas été fait.
Atténuation réelle : l'authentification passe par `Authorization`, pas par cookie, donc pas de CSRF
classique. Reste que n'importe quelle page peut appeler l'API avec un jeton volé.

### ✅ Correctif appliqué — v1.1.287 (2026-09-06)

**Ce que `*` permettait vraiment** (à dire honnêtement) : l'authentification étant portée par un
en-tête `Bearer` et non par un cookie, un site tiers ne pouvait **pas lire** les données d'un
utilisateur connecté. Ce qu'il pouvait faire : déclencher les routes **non authentifiées** depuis
les navigateurs de ses visiteurs — `send-otp` (**coût SMS réel**) et `check-phone` (**énumération
de numéros**). C'est ça qui est fermé.

**Comment** — `workers/lib/cors.js`
- `ALLOWED_ORIGINS` : les origines **mesurées**, pas devinées — `apex-chat.kd-mc.com` (domaine
  canonique, `services/kdmc-router/worker.js:34`), `9r4rxssx64-creator.github.io` (hôte GitHub
  Pages réel, celui que charge `apex-chat-e2e.yml`), `kd-mc.com` / `www.kd-mc.com` (le portail),
  plus `localhost`/`127.0.0.1` pour le développement.
- `applyCors(request, response)` renvoie l'origine demandeuse **si elle est autorisée**, et
  **retire** l'en-tête sinon. Sans en-tête `Origin` (curl, Service Binding), rien n'est envoyé —
  il n'y a pas de contrôle CORS à faire.
- `Vary: Origin` **ajouté** (pas écrasé), sinon un cache pourrait servir à un site la réponse
  autorisée d'un autre — et écraser un `Vary: Accept-Encoding` casserait la compression.
- **Un upgrade WebSocket (101) est renvoyé tel quel** : sa réponse transporte un objet `webSocket`
  non reconstructible, le recopier couperait le temps réel.

**Où** : en **UN seul point par worker** — le `fetch` de tête des 4 workers est enveloppé
(`const _workerHandler = {...}` puis `export default { ..._workerHandler, fetch: applyCors(...) }`).
Aucun site d'appel n'est touché, donc aucune réponse ne peut échapper au filtre. C'est ce qui rend
le correctif sûr : mon estimation initiale (« refondre 4 pipelines de réponse ») était fausse.

**Preuve** — `tests/unit/cors-origines-autorisees.test.js` (5 tests) + les 4 tests de routing des
workers mis à jour : origine autorisée renvoyée telle quelle · origine inconnue → aucun en-tête ·
sans `Origin` → aucun en-tête · `Vary` cumulé · 101 renvoyé **à l'identique**. La liste est
**dérivée des fichiers du dépôt** (canonical de `index.html` + `APEX_CHAT_URL` du workflow e2e),
donc oublier le vrai hôte GitHub Pages fait échouer le test (leçon #218).
**Discriminant prouvé par sabotage** : `applyCors` remis en passe-plat → 3 échecs ; hôte GitHub
Pages retiré de la liste → 2 échecs ; restauré → 47/47.
Suite complète **1109/1109**, couverture `cors.js` **100 %**, navigateur réel **5/5**.

**Limite honnête** : le CORS est un contrôle **du navigateur**. Il n'empêche pas un appel direct
(curl, script serveur) — ça, ce sont l'authentification et les limites de débit qui le tiennent.
Ce correctif ferme l'abus **par navigateur de visiteur**, pas l'abus direct.

---

## Ce qui est solide (vérifié, pas supposé)

| Point | Preuve |
|---|---|
| Suite de tests | ✅ **1077 tests / 51 fichiers, tous verts** (`npx vitest run --coverage`, 18,3 s) |
| Couverture | ✅ `lib/` **100 %** · workers/DO **100 %** · `api-worker.js` 82,61 % (plancher 80 % tenu) |
| Backdoor `000000` universel | ✅ **FERMÉ** — `ALLOW_TEST_OTP = "false"` (`wrangler.toml`) |
| Secrets en dur | ✅ **Aucun** — scan `sk-ant-`/`AIza`/`ghp_`/`whsec_`/`sk_live_` : 0 résultat hors tests |
| Vérification JWT | ✅ Correcte — HMAC systématique, l'en-tête `alg` n'est jamais lu (pas de confusion d'algorithme), expiration contrôlée |
| Endpoints `/api/test/*` | ✅ Verrouillés par `X-Test-Auth`, limités à 2 numéros jetables, désactivables par flag |
| XSS | 🟡 Les 8 interpolations `innerHTML` sans `esc()` inspectées sont des codes HTTP / compteurs internes — **aucune donnée utilisateur**. Les 99 autres `innerHTML` n'ont pas été audités un par un |
| Affirmations publiques de l'app | ✅ Honnêtes : « chiffrée en transit (HTTPS), serveur privé » — plus de « post-quantum » |

---

## Documentation à corriger (le code est juste, les docs mentent)

| Document | Ce qu'il affirme | Réalité mesurée |
|---|---|---|
| `messaging-app/README.md:4` | « Chiffrement militaire post-quantum (PQXDH) — Serveur aveugle » | `lib/crypto-core.js` : **ECDH P-256 + HKDF-SHA256 + AES-GCM-256 + PBKDF2 100k**. Solide, mais **rien de post-quantique** : zéro Kyber, zéro ML-KEM dans tout le dépôt. Seul `0001_init.sql:30` porte un commentaire « Kyber-768 » sur une colonne remplie de `'PENDING_PQXDH'` |
| `messaging-app/README.md` | « Serveur aveugle » | Faux en mode A : `kdmc_admin` est membre invisible de chaque conversation |
| `messaging-app/README.md` | « Phase 1 (Foundation) en cours », fichiers « à créer » | Tout existe : 16 098 lignes de front, 5 902 lignes de worker, 823 lignes de DO |
| `MEMO_KEVIN_RESTE_A_FAIRE.md` | Daté v1.1.3, demande de fermer le backdoor `000000` | Fermé depuis v1.1.174. Le document a **278 versions de retard** |
| `messaging-app/package.json:3` | `"version": "1.1.262"` | L'app tourne en `v1.1.281` |

L'app livrée dit la vérité ; ce sont les documents internes qui sont périmés. C'est l'inverse
du danger habituel, mais ça reste un risque : quelqu'un qui lit le README croit vendre du
post-quantique.

---

## Ce que je n'ai PAS pu faire — et pourquoi

Trois passes obligatoires de la règle « fais ton audit » n'ont pas pu tourner :

| Passe | Bloquant | Comment la lancer |
|---|---|---|
| **LIVE réelle** (vraies pages, vrai navigateur) | Le proxy de cette session n'autorise pas `kd-mc.com`. `gh` n'est pas installé, aucun outil GitHub Actions n'est exposé ici → je ne peux pas déclencher le workflow moi-même | Actions → `audit-live.yml` et `apex-chat-e2e.yml` |
| **Second avis indépendant (non-Claude)** | Idem | Actions → `ai-review-independent.yml` |
| **Scan sécu outillé** (gitleaks, Semgrep, OSV, Trivy, zizmor) | Idem | Actions → `security-suite.yml` et `strix-scan.yml` |

Tant qu'elles n'ont pas tourné, cet audit reste **statique + tests locaux**. Il a suffi à trouver
le P0, mais il ne remplace pas la vérification en conditions réelles.

---

## Auto-critique (obligatoire)

**Le point le plus faible de mon audit** : je n'ai pas touché le vrai site. Tout ce qui n'existe
qu'à l'exécution — un déploiement en retard sur le code, une variable d'environnement différente
en production, une règle Cloudflare — m'est invisible. En particulier, je n'ai **pas pu vérifier
que `KEVIN_PHONE_E164` en production vaut bien le numéro publié dans `index.html`** ; si Kevin l'a
changé côté Cloudflare sans mettre à jour le HTML, le P0 n'est pas exploitable aujourd'hui. C'est
la première chose à confirmer.

**Ce que je n'ai pas pu vérifier** : la passe live, le second avis indépendant, le scan sécu
outillé (trois passes que la règle rend obligatoires). Ni les 99 `innerHTML` un par un — j'ai
inspecté les 8 qui interpolent une variable, pas les autres. Ni le comportement réel du
chiffrement bout en bout entre deux vrais téléphones. Ni si `e2e_strict` est activé en production,
ce qui décide si les messages sont stockés chiffrés ou en clair.

**Ce dont je ne suis pas certain** : l'ampleur exacte de l'accès aux **contenus** de conversation
avec un jeton admin volé. Le statut de membre invisible est certain ; savoir si l'attaquant peut
déchiffrer demanderait de rejouer un échange de clés réel entre deux clients, ce que je n'ai pas
fait. J'ai donc décrit ce qui est prouvé (identités, numéros, GPS, pouvoirs d'administration) et
signalé le reste comme non tranché, plutôt que d'annoncer « il lit tous tes messages ».
