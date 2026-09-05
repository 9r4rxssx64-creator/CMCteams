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

## [P1] Session admin locale obtenue en tapant le nom

- **Axe** : Sécurité · **Fichier** : `messaging-app/index.html:7430`
- **Statut** : 🟡 DÉDUIT (lecture du code, non rejoué)

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

## [P2] Le jeton de session circule dans l'URL du WebSocket

- **Axe** : Sécurité · **Fichier** : `messaging-app/api-worker.js:148`
- **Statut** : ✅ VÉRIFIÉ (lecture confirmée)

```js
token = new URL(request.url).searchParams.get('token');
```

Contournement légitime (le navigateur ne pose pas d'en-tête sur un upgrade WebSocket), mais un
jeton en query string se retrouve dans les journaux serveur, les proxys et les référents.

**Correctif** : jeton d'usage unique et court, échangé contre la session à l'ouverture du socket.

---

## [P2] CORS ouvert à tous sur toute l'API

- **Axe** : Sécurité · **Fichier** : `messaging-app/workers/lib/cors.js:13`
- **Statut** : ✅ VÉRIFIÉ

`Access-Control-Allow-Origin: '*'` sur les 4 workers, y compris les routes admin. Le commentaire
du fichier annonce déjà le durcissement par liste blanche — il n'a pas été fait.
Atténuation réelle : l'authentification passe par `Authorization`, pas par cookie, donc pas de CSRF
classique. Reste que n'importe quelle page peut appeler l'API avec un jeton volé.

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
