# Apex Chat — Findings d'audit

**Date** : 2026-09-05 · **Version auditée** : `v1.1.281` (`messaging-app/index.html:461`)
**Méthode** : lecture du code + exécution réelle (tests, reproduction de faille en bac à sable)
**Statuts de preuve** : ✅ VÉRIFIÉ (commande exécutée) · 🟡 DÉDUIT (lecture) · 🔴 SUPPOSÉ

---

## [P0] Un jeton admin de 30 jours s'obtient sans OTP, avec un numéro public — ✅ CORRIGÉ v1.1.283→v1.1.284

- **Axe** : Sécurité
- **Fichier** : `messaging-app/workers/api-worker.js:759-806` (bypass) · `messaging-app/index.html:7193` (fuite du numéro)
- **Statut** : ✅ VÉRIFIÉ (reproduit en bac à sable le 05/09) → ✅ **CORRIGÉ ET PROUVÉ** (v1.1.284, re-mesuré le 10/09)

> **⚠️ Ce finding décrivait l'état du 5 septembre. Il est fermé depuis le 6.**
> Le correctif et sa preuve mesurée sont en bas de section (« ✅ Correctif appliqué »).
> Ce qui suit est conservé **tel quel** comme trace de la faille d'origine — c'est ce
> qui permet de vérifier que le correctif ferme bien *ce* trou-là, et pas un autre.

### Preuve (sortie réelle, 2026-09-05, AVANT correctif)

```
POST /api/auth/verify-otp  { phone:"‹tél. admin›", pseudo:"pirate", otp:"000000" }
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
messaging-app/index.html:7193   const isKevinByPhone = cleanPhone === '‹tél. admin›';
messaging-app/index.html:7430   ... || K.authData.phone === '‹tél. admin›';
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

### ✅ Correctif appliqué — v1.1.283 → v1.1.284 (2026-09-06)

La faille tenait sur **deux jambes** : un secret qui n'en était pas un (un numéro publié dans la
page), et une porte qui s'ouvrait sur la seule présentation de ce secret. Les deux sont coupées.

**1. Le numéro n'est plus dans le fichier public** (`index.html`)
Les deux occurrences (`isKevinByPhone`, `K.authData.phone === …`) sont supprimées avec le
mécanisme d'admin-par-le-nom (finding P1 ci-dessous, v1.1.285). L'admin est décidé **côté
serveur** uniquement (`user.is_admin` du Worker + JWT).

**2. La porte exige une vraie preuve** (`workers/api-worker.js`, ~l. 805-830)

```js
if (kevinSecret && phoneNorm === kevinSecret) {
// v1.1.283 — FERMETURE PORTE ADMIN (audit 05/09, faille P0).
if (env.ADMIN_BYPASS_REQUIRE_MFA === 'true') {
  const provided = (request.headers.get('X-Apex-Admin-Token') || '').trim();
  const expected = (env.APEX_CHAT_ADMIN_TOKEN || '').trim();
  if (!expected || provided !== expected) {
    return err('Preuve admin requise (Face ID / clé admin)', 401, 'admin_mfa_required', …);
  }
}
```

Connaître le numéro ne suffit plus : il faut **un secret que le client ne porte pas**
(`APEX_CHAT_ADMIN_TOKEN`, secret Cloudflare). Le chemin admin normal reste le **SSO central**
(`/api/auth/sso-from-kdmc` → Face ID / passkey) ; `X-Apex-Admin-Token` n'est que l'anti-lock-out.
La régression annoncée plus haut (« Kevin doit pouvoir se reconnecter ») est donc traitée : le
drapeau n'a été activé qu'**après** que le chemin de secours existe.

**Preuve — chaîne mesurée le 2026-09-10** (statut ✅ VÉRIFIÉ, commandes exécutées) :

| Contrôle | Commande | Résultat |
|---|---|---|
| Le numéro a quitté la page publique | `grep -rn "‹tél. admin›" index.html` | **0 ligne** ✅ |
| Il ne reste que dans les tests | `grep -rln … .` | **12 fichiers de test** (non servis) — plus aucun `.md` depuis le 10/09, voir P3 ✅ |
| La garde est ACTIVE en config déployée | `grep … workers/wrangler.toml:140` | `ADMIN_BYPASS_REQUIRE_MFA = "true"` ✅ |
| Le backdoor universel reste fermé | `workers/wrangler.toml:149` | `ALLOW_TEST_OTP = "false"` ✅ |
| Les deux gardes passent | `npx vitest run …mfa… …phone…` | **6/6 verts** (1,01 s) ✅ |
| Suite complète | `npx vitest run` | **1115/1115, 59 fichiers** (18,13 s) ✅ |

**Discriminant prouvé par sabotage** (`tests/unit/admin-bypass-mfa.test.js`, en-tête du fichier) :
retirer la garde `ADMIN_BYPASS_REQUIRE_MFA` du worker → **le 3ᵉ test échoue** (« l'inconnu
redeviendrait admin »). Le test couvre les 3 comportements : drapeau OFF → accès comme avant
(pas de lock-out à l'activation) · drapeau ON + jeton correct → accès accordé · drapeau ON +
jeton absent/faux → **401 `admin_mfa_required`**. Second garde : `no-admin-phone-in-page.test.js`
échoue si le numéro revient dans `index.html`.

**🔴 Limite honnête — ce qui n'a PAS pu être vérifié** : je n'ai pas pu rejouer la requête
contre le **Worker réellement déployé**. Le POST vers
`apex-chat-api.9r4rxssx64.workers.dev/api/auth/verify-otp` est refusé par la politique de sortie
réseau de cette session (`CONNECT tunnel failed, response 403` — refus d'egress, pas du service ;
règle du proxy : on le signale, on ne le contourne pas). Tout ce qui précède prouve donc que
**le code source et la configuration versionnée** ferment la porte, pas que le déploiement en
production porte bien cette version. Ce dernier maillon se ferme par la CI, réseau ouvert :
Actions → `apex-chat-e2e.yml`, qui rejoue le parcours contre le vrai worker.

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
const isKevin = isKevinAdmin(K.authData.name) || K.authData.phone === '‹tél. admin›';
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

## [P2c] Le jeton de session circule aussi dans les URL de médias — ✅ CORRIGÉ v1.1.288

- **Axe** : Sécurité · **Fichier** : `messaging-app/index.html` (`K._mediaSrc`)
- **Statut** : ✅ VÉRIFIÉ (lecture confirmée) → ✅ **CORRIGÉ ET PROUVÉ** (v1.1.288)

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

### ✅ Correctif appliqué — v1.1.288 (2026-09-06)

La protection d'un ticket média n'est pas l'usage unique (impossible ici) mais sa **portée** :

**Serveur** (`workers/api-worker.js`)
- `POST /api/auth/media-ticket` → ticket `{typ:'mtkt', exp: +5 min}`, **réutilisable**.
- `getAuthUser(request, env, { allowMediaTicket: true })` : le paramètre n'est passé que par
  `handleMediaGet`. Un ticket média posé sur **n'importe quelle autre route** n'est même pas lu →
  il ne sert **qu'**à afficher un fichier.
- Durcissement généralisé au passage : **tout jeton portant un `typ`** (ticket WS, ticket média,
  invitation magique) est refusé comme jeton de session. Les jetons de session, eux, n'ont pas de
  `typ` — la règle est donc structurelle, pas une liste à tenir à jour.
- L'autorisation de fond est inchangée : propriétaire, ou membre d'une conversation partagée.

**Client** (`index.html`)
- `K._ensureMediaTicket()` : un seul ticket en cache, demandé **dès la connexion** et renouvelé
  30 s avant expiration ; les appels concurrents partagent la même requête.
- `K._mediaSrc` reste **synchrone** : ticket valide → `?mt=` ; sinon repli `?token=` **et**
  demande d'un ticket en arrière-plan → **jamais d'image cassée**.
- Garder le même ticket 5 min garde les URL **stables**, donc le cache du navigateur efficace.

**Preuve** — `tests/unit/media-ticket-portee-limitee.test.js`, 6 tests sur le vrai worker :
ticket refusé sans session · sert un média **trois fois de suite** (réutilisable) · refusé en
Bearer · refusé en `?token=` · **ignoré sur une autre route** · un ticket WebSocket n'est pas un
ticket média · le client demande bien un ticket.
**Discriminant prouvé par sabotage** : restriction de route retirée → 1 échec ; garde « jeton typé
≠ session » retirée → 2 échecs (média **et** WebSocket) ; restauré → 12/12.
Suite complète **1115/1115**, gate de couverture vert, navigateur réel **5/5**, 0 exception JS.

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

## [P2] Les deux voies **iPhone** des tests navigateur sont rouges à chaque exécution depuis le 6 septembre — et personne ne le voyait

- **Axe** : Fiabilité / fausse assurance (le test qui compte le plus pour Kevin est celui qui échoue)
- **Fichier:ligne** : `messaging-app/workers/lib/cors.js:40` (`LOCAL_DEV = /^http:\/\/…/`) · symptôme dans `messaging-app/tests/e2e/smoke.spec.js:78`
- **Statut** : ✅ **VÉRIFIÉ** (2026-09-10, mesuré sur 60 runs réels) · ✅ **CORRIGÉ** (même jour)

> ⚠️ **Correction de ma propre erreur.** La première version de ce finding disait :
> *« 19 tests navigateur sur 22 ne sont lancés par aucune automatisation »*. **C'était faux.**
> Les 19 fichiers de `messaging-app/tests/e2e/` **sont** lancés — par `messaging-app-tests.yml`
> (job `e2e`, 4 navigateurs : iphone-safari, iphone-se, chromium-desktop, pixel-android), à
> chaque push sur `claude/**` et `main`. Mon grep cherchait `test:e2e` dans les workflows ;
> celui-ci appelle `npx playwright test` directement. Une recherche trop étroite m'a fait
> déclarer dormante une suite qui tournait — et m'a fait **rater ce qu'elle disait vraiment**.
> Le garde `tests/specs-lances.test.mjs` (ajouté) ne cherche plus un mot : il suit ce que
> chaque workflow **exécute** (étape `playwright test` + `testDir` de sa config).

### Preuve (sorties réelles)

```
$ 60 derniers runs de messaging-app-tests.yml (API GitHub, 2026-09-10 19:20 UTC)
  60 runs terminés · 28 en échec · 19 où SEULES les voies iPhone échouent
  plus ancien échec « iPhone seulement » : 2026-09-06T16:00:55Z

$ run 34519030133 (le dernier avant correction)
  success   tests
  success   e2e (chromium-desktop)
  success   e2e (pixel-android)
  failure   e2e (iphone-safari)   → smoke.spec.js:70 « crypto-core ESM module chargé sans erreur »
  failure   e2e (iphone-se)       → idem
  erreur capturée : "…/apex-chat-api.9r4rxssx64.workers.dev/api/system/config due to access control checks."

$ localement, les 19 fichiers (56 tests) sur Chromium préinstallé → 56 passed (29.6s)
```

### Impact

Le navigateur de Kevin est **Safari sur iPhone**. C'est précisément la seule voie qui échoue.
Depuis le 6 septembre, **chaque** push d'Apex Chat produit un run rouge sur iPhone, noyé dans
un workflow qui n'est ni bloquant ni lu (28 échecs sur 60, aucun n'a été traité). Un contrôle
rouge en permanence finit par ne plus être regardé : c'est le contraire d'un contrôle.

### Cause racine (pas le symptôme)

Le 6 septembre, l'audit P2b (v1.1.287) a remplacé `Access-Control-Allow-Origin: *` par une
liste d'origines — un vrai durcissement. L'exception « développement local » a été écrite
`http://localhost` **uniquement**. Or les tests navigateur se servent en **HTTPS**
(`tests/serve-https.sh`), et ce n'est pas un caprice : WebKit applique
`upgrade-insecure-requests` même sur localhost, donc en HTTP tous les modules ES échouent.
L'origine des tests est `https://localhost:4173` → refusée → **WebKit** signale l'appel API
bloqué comme une erreur de page → le test « 0 erreur » tombe. **Chromium**, lui, ne remonte
pas cet échec de la même façon → vert. Le durcissement a cassé sa propre vérification, sur
le seul navigateur qui compte, et la couleur verte de Chromium a masqué le rouge de WebKit.

Le fait qui prouve le lien : la date du premier échec « iPhone seulement » (6.09 16:00) est
celle du déploiement de v1.1.287.

### Correctif (appliqué)

`LOCAL_DEV = /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/` — `https?` au lieu de
`http`. Même machine, même confiance : autoriser `https://localhost` n'ouvre **rien** de plus
que `http://localhost` déjà autorisé. Le déploiement du worker est automatique (push sur
`claude/**` touchant `workers/**`).

### Test qui le prouve

- `tests/unit/cors-origines-autorisees.test.js` : `https://localhost:4173` et
  `https://127.0.0.1:4173` → autorisés ; `https://localhost.evil.example` → refusé (5/5 ✅).
- La preuve **réelle** : le prochain run de `messaging-app-tests.yml` avec les 4 voies vertes
  (consigné dans `02-RESULTATS.md` § 6.4 dès qu'il est passé).
- Garde permanente ajoutée : `npm run test:specs-lances` (dans `test:ci`) — tout dossier de
  specs Playwright du dépôt doit être exécuté par un workflow, en suivant ce que le workflow
  **lance**, pas un mot-clé.

**Effort** : S · **Régression possible** : aucune sur la prod (les origines réelles ne
changent pas) ; la seule chose qui change, c'est qu'un test rouge devient vert pour de vrai.

---

## [P3] Le numéro personnel de Kevin reste écrit dans 12 fichiers de test d'un dépôt **public**

- **Axe** : Vie privée (plus sécurité)
- **Fichiers** : `messaging-app/tests/unit/*.js` (11) + `tests/e2e/auth-flow.spec.js`
- **Statut** : ✅ VÉRIFIÉ (`grep -rln`) · ✅ **CORRIGÉ le 10/09 (soir)** — plus aucun numéro réel dans le dépôt

**Ce que ce n'est PAS** : ce n'est plus une faille. Depuis v1.1.284, connaître ce numéro
n'ouvre **aucune** porte — l'admin exige une preuve serveur (`X-Apex-Admin-Token` ou SSO
Face ID). Le classer P0 serait crier au loup.

**Ce que c'est** : une **donnée personnelle** publiée. Le dépôt `9r4rxssx64-creator/CMCteams`
est public ; n'importe qui peut lire le numéro de portable de Kevin, et un moissonneur
automatique le récupérera. Le risque est du démarchage et de l'hameçonnage par SMS, pas une
intrusion dans l'app.

**Traité le 10/09** : le numéro a été retiré de `messaging-app/MEMO_KEVIN_RESTE_A_FAIRE.md`
(le seul document en prose qui le portait — la ligne décrivait en plus un comportement
supprimé depuis, elle a été corrigée en même temps). ✅ Vérifié : **plus aucun `.md`** du
dépôt ne contient le numéro.

**Fait le 10/09 au soir (à froid, suite verte avant et après)** :
- **113 occurrences** du numéro, sous 4 formes, dans **12 fichiers** de test → remplacées par un
  analogue **fictif de même forme** (`+33600000001`, `0600000001`…), de façon programmatique :
  le vrai numéro n'a jamais été affiché ni écrit pendant l'opération. Les 1115 tests restent verts
  (le format `0X → +33X` est conservé, donc les tests de normalisation aussi).
- Deux autres numéros de fixture **ne ressemblaient pas** à des valeurs synthétiques (pas de
  suite de zéros, pas de répétition). Impossible de savoir s'ils étaient réels ; traités comme
  s'ils l'étaient → remplacés (`+33600000010`, `+33600000020`). Coût : nul. Bénéfice si c'était
  vrai : une personne de moins publiée.
- **Le garde lui-même publiait ce qu'il protégeait** : `no-admin-phone-in-page.test.js` portait le
  vrai numéro sous 4 formes pour vérifier qu'il n'était pas dans la page. Réécrit : il refuse
  **tout** numéro dans `index.html` hors 5 exemples pédagogiques faux, et **tout** numéro dans
  `tests/` hors la liste des fixtures synthétiques — sans jamais connaître un vrai numéro. Prouvé
  discriminant (un numéro inconnu → échec, masqué à 5 caractères dans le message).
- Vérification finale : scan de tout `messaging-app/` (code, tests, docs, config) → **0 fichier**
  contenant une forme du numéro. Les vrais numéros vivent en secrets Cloudflare
  (`KEVIN_PHONE_E164`, `LAURENCE_PHONE_E164`), jamais dans le dépôt.

**Effort réel** : S · **Régression** : aucune (1115/1115 avant, 1115/1115 après ; le garde passe de 2 à 4 contrôles).

---

## Ce qui est solide (vérifié, pas supposé)

| Point | Preuve |
|---|---|
| Suite de tests | ✅ **1115 tests / 59 fichiers, tous verts** (`npx vitest run`, 18,13 s — re-mesuré 10/09) |
| Couverture | ✅ Global **89,47 %** lignes / 84,30 % branches / 94,96 % fonctions · `lib/` **100 %** · DO **100 %** · `ia`/`push`/`sms`-worker **100 %** · `api-worker.js` **83,42 %** (plancher 80 % tenu) |
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
| `messaging-app/README.md` | « Phase 1 (Foundation) en cours », fichiers « à créer » | Tout existe : **16 293** lignes de front, **6 946** lignes de workers, **834** lignes de DO (mesuré 10/09) |
| `MEMO_KEVIN_RESTE_A_FAIRE.md` | Daté v1.1.3, demande de fermer le backdoor `000000` | Fermé depuis v1.1.174. Le document a **285 versions de retard** — et il **contient encore le numéro admin en clair** (fichier de travail, non servi, mais à nettoyer) |
| ~~`messaging-app/package.json:3`~~ | ~~`"version": "1.1.262"`~~ | ✅ **CORRIGÉ** : `package.json` = `1.1.288` = `index.html` (`__APEX_CHAT_VERSION__`, l. 461) |

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

---

## Addendum — 2026-09-10 (passe de re-mesure)

Ce document avait **quatre jours de retard sur le code** : les 5 findings étaient corrigés, mais
le P0 — le plus grave — était encore rédigé comme *ouvert*. Un livrable d'audit périmé est un
livrable qui **ment**, dans le sens le plus dangereux (il fait croire à un trou qui n'existe
plus, donc il fait perdre la confiance dans les quatre autres lignes qui, elles, sont justes).
Corrigé ci-dessus, avec la chaîne de mesure et sa date.

**Ce qui reste vrai de l'auto-critique du 05/09** : je n'ai toujours **pas touché le vrai site**.
La question « `KEVIN_PHONE_E164` en production vaut-il le numéro publié ? » est en revanche
devenue **sans objet** : le numéro n'est plus publié nulle part dans le fichier servi, donc il
n'y a plus de secret client à faire correspondre. Le maillon manquant a changé de nature : ce
n'est plus « la faille est-elle exploitable ? » mais « **la version déployée porte-t-elle bien
le correctif ?** ». Cette question-là ne se tranche pas depuis cette session (egress 403) — elle
se tranche en CI (`apex-chat-e2e.yml`).

**Ce dont je ne suis toujours pas certain** : que le Worker en production tourne la v1.1.288.
`workers_get_worker` (MCP Cloudflare) ne renvoie ici que `name`/`id`, sans `modified_on` — je ne
peux donc pas dater le déploiement, et je ne l'affirme pas.

Les livrables `00-INVENTAIRE.md`, `01-FONCTIONS.md`, `02-RESULTATS.md`, `04-DESIGN.md` et
`05-JOURNAL.md`, absents jusqu'ici (le protocole d'audit en exige six, il n'y en avait qu'un),
ont été écrits dans la même passe.

---

## Addendum — 2026-09-10 (soir) — le scan sécu outillé a tourné : ce qu'il dit **vraiment** d'Apex Chat

Le tableau « Ce que je n'ai PAS pu faire » plus haut est désormais faux sur sa troisième ligne :
`security-suite.yml` (run `34519764156`) et `strix-scan.yml` (run `34520670517`) ont tourné, lancés
par `node tools/ci/ci.mjs run`, et leur rapport a été lu par `node tools/ci/ci.mjs report`.

**Chiffre brut, à ne pas prendre pour un verdict** : 2 211 signalements sur **tout** le dépôt
(gitleaks 258, TruffleHog 52, OSV 17, Trivy 0, Semgrep 1 167, zizmor 717). La règle de l'audit
impose de **vérifier chaque signalement avant d'agir** et d'écarter les faux positifs **avec
preuve**. Voici le tri, limité au périmètre Apex Chat (`messaging-app/` + les 19 workflows qui
le touchent), avec pour chaque classe : ce que dit l'outil, ce que j'ai vérifié, la conclusion.

### [P3] Outils de test d'Apex Chat portant 7 vulnérabilités connues — ✅ CORRIGÉ le 10/09

- **Axe** : sécurité (dépendances) · **Fichier** : `messaging-app/package.json`
- **Preuve** (`npm audit`, exécuté ici) : **production : 0** vulnérabilité. Outils de test :
  **7** (4 critiques, 1 haute, 2 moyennes) — toutes dans la chaîne `vitest 1.x` (`@vitest/ui`
  : lecture de fichiers arbitraires quand son serveur écoute · `happy-dom 14` : évasion du bac
  à sable → exécution de code depuis une balise `<script>` · `vite`/`esbuild` : traversée de
  chemin, serveur de dev interrogeable).
- **Impact réel** : aucun sur l'app déployée — ces paquets ne tournent qu'en CI et sur les
  machines de test. Le risque est un test qui charge du HTML hostile.
- **Cause racine** : versions figées depuis la création du projet (`^1.6.0`, `^14.12.0`), aucun
  garde ne signale une dépendance de test vulnérable.
- **Correctif** : `vitest 5`, `@vitest/ui 5`, `@vitest/coverage-v8 5`, `happy-dom 20` →
  `npm audit` : **0** vulnérabilité, toutes catégories.
- **Test qui prouve** : **1 117 / 1 117** tests unitaires verts après mise à jour. Un seul
  fichier a dû être adapté (`tests/unit/visio-mesh.test.js`) : happy-dom 20 rend `navigator`
  non assignable, le test redéfinit la propriété au lieu de l'écraser. Comportement testé
  inchangé.
- **Effort** : S · **Régression possible** : aucune sur l'app (paquets de test uniquement).

### [P3] Deux workflows installaient `wrangler` sans version, avec le jeton Cloudflare en main — ✅ CORRIGÉ le 10/09

- **Axe** : sécurité (chaîne d'approvisionnement) · **Fichiers** : `deploy-apex-chat.yml`
  (`npm install -g wrangler`), `sync-secrets-to-cloudflare.yml` (`wrangler@latest`).
- **Preuve** : zizmor « adhoc-packages » ; lecture des deux lignes.
- **Impact** : « ce que npm publiera demain » s'exécute avec le jeton qui déploie l'API et pose
  les secrets. Une majeure publiée avec un changement de comportement casse un déploiement ;
  un paquet compromis fait pire.
- **Correctif** : `wrangler@4` — c'est ce qui tourne déjà (dernier déploiement vert
  `34520637740` a installé la dernière version, 4.x). Zéro changement de comportement aujourd'hui,
  plus de saut de majeure silencieux demain.
- **Test qui prouve** : YAML validé ; le prochain déploiement le prouvera en vrai.

### [P3] Un job de déploiement sans `permissions:` déclarées — ✅ CORRIGÉ le 10/09

- **Fichier** : `deploy-cloudflare-workers.yml` (services Apex, adjacent à Apex Chat — il est
  apparu dans le périmètre parce qu'il déploie `chat-svc`).
- **Preuve** : zizmor « excessive-permissions » ; le job ne fait que `wrangler` + `curl` vers
  Cloudflare, jamais un `git push` ni un appel `gh`.
- **Correctif** : `permissions: contents: read` sur le job. Les 18 autres workflows du
  périmètre déclaraient déjà leurs permissions.

### Écartés avec preuve (faux positifs)

| Outil · règle | Ce qu'il signale | Ce que j'ai vérifié | Verdict |
|---|---|---|---|
| gitleaks × 8 | `messaging-app/workers/push-worker.js` | Lecture du fichier : **une clé VAPID publique** (envoyée à chaque navigateur, publique par conception) et les deux chaînes `-----BEGIN/END PRIVATE KEY-----` qui servent à **retirer l'en-tête** d'une variable d'environnement. Aucune valeur de clé dans le fichier | faux positif |
| TruffleHog × 52 (dépôt entier) | « secrets » | **0 confirmé vivant** par l'outil lui-même (vérification auprès des fournisseurs) | rien à révoquer |
| zizmor « template-injection » | 149 sur le dépôt | Passe `awk` sur les 19 workflows Apex Chat : **0** `${{ github.event.* }}` dans un `run:` | hors périmètre |
| zizmor « artipacked » | 5 étapes `upload-artifact` du périmètre | Chemins : rapports Playwright, couverture, un fichier chiffré `/tmp/out/latest.sql.enc` — **jamais le dépôt** ni `.git/` | faux positif |
| zizmor « unpinned-uses » | 33 `uses:` du périmètre | Tous des actions **officielles** (`actions/*`, `cloudflare/wrangler-action`) sur une **version publiée** (`@v4`, `@v6`…), conformes à la règle du dépôt public | recommandation P3 : épingler sur un SHA, pas une faille |
| Semgrep « plaintext-http-link » × 2 | `tests/unit/media-gallery.test.js` | `http://b.io` = URL de **fixture** dans un test, jamais appelée | faux positif |
| OSV × 17 (dépôt entier) | dépendances | `messaging-app` : production 0 (mesuré `npm audit`) ; les 7 de test corrigées ci-dessus. Les autres lignes sont dans d'autres lockfiles du dépôt | hors périmètre |

### Ce que je n'avais **pas** pu trier — trié le soir même, avec l'outil construit pour ça

**9 des 11 signalements Semgrep de `messaging-app` étaient anonymes** à 20 h : le rapport
lisible depuis cette session ne portait que des comptes par règle et par dossier, pas les
lignes. Rejouer Semgrep ici est impossible : ses règles se téléchargent depuis `semgrep.dev`,
injoignable (mesuré : réponse 000). J'ai ajouté à `security-suite.yml` une entrée `detail_path` :
pour les préfixes demandés, le check-run liste **chaque signalement** (outil · gravité ·
fichier:ligne · règle), plafonné à 400 lignes, sans jamais imprimer la valeur d'un secret.

**Relancé (run 34527892077) et lu : 47 lignes, 47 ouvertes, 0 faille.** Le détail est au
§ 6.5 de `02-RESULTATS.md`. En résumé : 4 `missing-integrity` sur des `<link canonical /
dns-prefetch>` (pas de SRI possible), 5 `unsafe-formatstring` INFO sur des `console.warn`, 1
`urllib` dans un script CI sans entrée utilisateur, 1 `cors-misconfiguration` sur la réflexion
d'origine **après** liste blanche (voulu, testé), **3 `gha-curl-pipe-shell` classés ERROR qui
sont des `curl | python3 -c "json.load…"`** — la réponse d'API est parsée, jamais exécutée —,
et les 7 gitleaks (clé VAPID publique ×3, CSS, `'TEAMID'` de test, en-têtes PEM ×2). Deux
recommandations P3 restaient ouvertes, ni l'une ni l'autre n'est une faille : remplacer
`python3 -c` par `jq` dans les trois workflows, et épingler les actions sur un SHA.

**Appliquées le 11/09** (Kevin : « Go ») : `jq -r '.[0].number // empty'` dans
`apex-chat-e2e.yml`, `jq -er '.result[0].id'` et `jq -r '.result.id // empty'` dans
`deploy-apex-chat.yml` (la réponse était déjà lue comme une donnée ; `jq` est déclaratif, sans
interpréteur) ; les **23 `uses:`** des 10 workflows du périmètre sont épinglés sur le SHA de
leur tag (`actions/checkout@d23441a4… # v6`, etc., SHA résolus par `git ls-remote` sur les
dépôts officiels), la version restant lisible en commentaire. Dependabot (déjà configuré,
hebdomadaire) proposera les montées. Gardes relancées : `test:depot-public-sain`,
`test:actions-conformes`, `test:workflows-pipefail`, `test:ci-no-stampede` — vertes.

### Pentest IA (Strix) — exécuté, tué par le délai, puis compris et relancé

`strix-scan.yml` a été **arrêté par le délai de 26 minutes** (rc = 124) avant d'écrire son
rapport. Son tableau de bord annonçait **1 vulnérabilité MEDIUM** dont je ne connaissais **pas
le contenu**. Coût mesuré de cette exécution : **13,77 $** (31,8 M jetons, modèle gpt-5.4, avec
des erreurs de flux « Error streaming response » répétées).

**11/09 — cause racine, lue dans le code de Strix** (clone superficiel de `usestrix/strix`,
version 1.6.2, `requires-python >= 3.12`) : (1) Strix écrit ses résultats dans
**`strix_runs/<run>/`** (`penetration_test_report.md`, `vulnerabilities/*.md`,
`vulnerabilities.csv|json`, `run.json`) — le workflow copiait **`agent_runs/`**, l'ancien
nom ; (2) sur SIGTERM, `signal_handler` appelle `report_state.cleanup(status="interrupted")`
qui **écrit les artefacts avant de sortir**. Le rapport de la MEDIUM a donc très probablement
été écrit, dans un dossier que personne ne copiait. **Correctif** : les deux dossiers sont
copiés ; la dépense est **bornée** (`--max-budget-usd`, 15 $ par défaut : Strix s'arrête seul,
proprement) au lieu de compter sur un `timeout` qui le tue au milieu d'une phrase ; la
profondeur est un choix (`--scan-mode quick|standard|deep`, `standard` par défaut) ; délai du job
75 min ; le check-run porte l'**inventaire des fichiers produits**, le nombre d'erreurs de
flux, puis le rapport final, les fiches de vulnérabilité et l'index CSV, dans cet ordre.
Relancé sur `https://apex-chat.kd-mc.com/` — résultat à lire par
`node tools/ci/ci.mjs report <run_id>`.

**Lu (run `34588162278`, 38 min, 14,00 $, 33,1 M jetons dont 31,8 M en cache, rc=2 = « fini
avec findings ») : 2 MEDIUM, les deux confirmées dans le code et corrigées.**

### [P1] Une session SSO « faible » forgée à distance lisait l'historique de Kevin et coupait toutes ses sessions — ✅ CORRIGÉ le 11/09

- **Axe** : sécurité (routeur `services/kdmc-router/worker.js`, hors app mais sur le chemin
  de toutes les apps du domaine). Strix vuln-0001, CWE-287, CVSS 6,5.
- **Preuve (Strix, sur le vrai domaine)** : `POST /__sso/issue {"uid":"x","name":"y"}` sans
  aucune preuve → `ok:true` + cookie `kdmc_sso` sur `.kd-mc.com` ; `GET /__sso/whoami` le
  reconnaît (`verified:false, admin:false`). Aussi accepté avec `Origin: https://evil.example`
  et `Content-Type: text/plain` (requête « simple » : un site tiers pose le cookie dans le
  navigateur d'un visiteur).
- **Ce qui est voulu** (pas une faille) : l'émission auto-déclarée existe pour la règle
  « reconnu auto pour tous » ; `admin` exige `verified` (Face ID), c'est vérifié par `whoami`.
- **Ce qui était une faille, trouvé en lisant les consommateurs de cette session** :
  `GET /__sso/me/history` et `POST /__sso/me/revoke` ne demandaient qu'une **session**, pas une
  session **vérifiée**. Avec un token forgé sur `uid=kdmc_admin`, un inconnu lisait la fiche
  canonique de Kevin (appareils, apps, historique de connexions) et posait `revoked_at` sur
  cette fiche → **toutes** les sessions de Kevin tombaient, Face ID comprises (déconnexion
  forcée de l'admin par n'importe qui). Cause racine : le self-service supposait qu'un uid
  dans un token venait forcément de son propriétaire.
- **Correctif** : `/me/history` et `/me/revoke` exigent `s.verified` (même règle que
  `/passkeys/delete`) ; `/__sso/issue` refuse un `Origin` hors `kd-mc.com` / `*.kd-mc.com` /
  app native (`capacitor://`, `ionic://`) / **même origine que l'hôte appelé** (portail servi en
  local, test navigateur), et `Origin: null` (sans en-tête Origin : inchangé, aucun navigateur
  tiers en jeu). Rien ne change pour Kevin (ses sessions sont Face ID) ni pour la connexion
  automatique par nom. **Mesuré après coup** : la première version refusait la même origine
  sur `127.0.0.1:port` → le test navigateur réel du SSO (`tools/kdmc-sso-e2e`, relancé une fois
  son installation réparée) perdait 2 contrôles ; corrigé, 8/8 en local.
- **Test qui prouve** : `services/kdmc-router/self-service.test.mjs` (23/23, 10 nouveaux :
  token forgé → history/revoke refusés, fiche intacte, vraie session vivante ; `/issue` depuis
  `evil.example`, `null`, `kd-mc.com.evil.example` → 403 sans cookie ; depuis `kd-mc.com`,
  `apex-chat.kd-mc.com`, `capacitor://localhost` → accepté). **Ces tests SSO ne tournaient dans
  aucun workflow** : ajoutés à `deploy-kdmc-router.yml` avant chaque déploiement.
- **Résiduel assumé** : une session faible forgée sur un uid admin **écrit toujours un
  passage** dans la fiche « qui se connecte » (métadonnées d'appareil, aucune donnée) — les
  apps de Kevin envoient elles-mêmes cet uid avant Face ID, le bloquer casserait sa connexion
  automatique. Consigné, pas corrigé.
- Effort S · régression : un utilisateur **sans** passkey ne peut plus lire son historique ni
  « déconnecter ses autres appareils » sans Face ID — message clair, aucun blocage de connexion.

### [P2] Un lien piégé faisait activer un Premium par l'admin sans confirmation — ✅ CORRIGÉ le 11/09 (v1.1.289)

- **Axe** : sécurité (client `messaging-app/index.html`). Strix vuln-0002, CWE-352, CVSS 4,3.
- **Preuve** : au boot, `?grant_premium=<uid>&plan=<plan>` est lu et, dès que `K.user.is_admin`,
  `K._adminGrantPremium(guid, gplan)` part **sans confirmation** (`POST /api/admin/grant-premium`
  intercepté avec les valeurs de l'URL). Même chemin via le message `grant-premium` du service
  worker. Le serveur exige le jeton admin : seul Kevin peut le déclencher, mais **à son insu**.
- **Correctif** : `K._confirmGrantPremium(uid, plan)` — une fenêtre qui **nomme** l'utilisateur
  et la formule — devant les deux déclencheurs externes ; « Annuler » ne fait rien ; le bouton
  du panneau admin (clic explicite) est inchangé. La notification « ✅ Activer » demande donc
  un tap de plus, qui dit ce qui va être activé (règle « double-confirm » des actions admin).
- **Test qui prouve** : `messaging-app/tests/unit/premium-deep-link-confirm.test.js` (4 tests,
  lit la page servie ; **prouvé discriminant** : garde retirée → 2 échecs nommant le
  déclencheur).
- Effort S · régression : aucune (un tap de plus pour l'admin sur ce seul parcours).

**Ce que Strix n'a pas trouvé** (surfaces revues sans problème) : `/diag.html`,
`/force-update.html`, `/force-logout.html` (nettoyage local, aucune action serveur), injection
sur les entrées SSO (SQL/NoSQL/XXE/timing : rien). **Ce qu'il n'a pas testé** : les parcours
authentifiés (OTP), conversations, invitations, WebSocket, admin — il n'avait pas de compte.
Le run montre encore **654 erreurs de flux LLM** (« Error streaming response ») : le scan a
fini quand même, mais c'est du temps et de l'argent perdus côté fournisseur.
