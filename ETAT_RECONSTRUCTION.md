# 📓 ÉTAT DE LA RECONSTRUCTION kd-mc.com — journal de bord

> Mis à jour 2026-08-30. Source de vérité de "où on en est" après le blocage GitHub
> du 24/08. À LIRE EN PREMIER par toute session. Ne jamais refaire ce qui est ✅.

## 🗺 L'architecture actuelle (retenir)

- **Code** : GitLab `kdmc-group/Kdmc-project` (**id 85753352**), branche `main`,
  compte `desarzens.kevin`. Jeton API : `/root/.gitlab_api_token` (session) + coffre CI.
- **Pages** : Cloudflare Pages **`kdmc-site.pages.dev`**, compte **Desarzens.kevin@gmail.com**
  (id `ffaca6f306a953f82834db0970f300f0`). Publiées à la racine ET sous `/CMCteams/`.
- **Machine** : `.gitlab-ci.yml` + `tools/gitlab/*.sh`. Chaque push republie tout.
  Sonde d'état 1×/jour (06h Monaco). Clé Cloudflare au coffre GitLab (`CLOUDFLARE_API_TOKEN`).
- **Données** : Firebase (`cmcteams-c16ab`) — jamais parties.
- **kd-mc.com** : CAPTIF de l'ANCIEN compte Cloudflare (login GitHub, verrouillé). Ses
  17 workers TOURNENT ENCORE. Le domaine ne revient que par l'accès à ce compte.

## ✅ FAIT — NE PAS REFAIRE

- Sauvegarde complète du code livrée à Kevin (21 Mo, 4535 fichiers).
- Site entier publié sur `kdmc-site.pages.dev` (6/6 pages vivantes, republication auto).
- CMCteams de secours aussi sur `kdmc0.pages.dev`.
- Machine GitLab→Cloudflare : construite, éprouvée (leçons #200/#201 : pas de `:` dans
  script YAML → scripts .sh ; `|| true` sur toute extraction grep ; valider par `ci/lint`).
- Outils "mes yeux/mains" : `renaitre-workers` (var DEPLOYER_WORKERS), `regarder-cloudflare`
  (var REGARDER = inventaire Cloudflare), `sonder-url` (var SONDER_URL = lire une page).
- **9 workers RENÉS** chez Desarzens-Kevin (adresses `*.desarzens-kevin.workers.dev`) :
  coffre-r2, kdmc-crea-famille, kdmc-mail, kdmc-outlook, kdmc-monaco, kdmc-crea-ai,
  kdmc-apis, kdmc-balances, kdmc-live.
- R2 activé (Kevin) → coffre-r2 a son seau `coffre-vault`.
- **~35 clés au coffre GitLab** (masquées quand charset le permet). Clés dérivées sans Kevin :
  hash PIN (KDMC/APEX_ADMIN_PIN_SHA256), MONACO_ENC_KEY (neuve), FIREBASE_PROJECT_ID corrigé
  (= `cmcteams-c16ab`, PAS kdmc-clients). Pose auto des clés par la machine (secrets-map.txt).
- Appel GitHub : dossier "Reinstatement request" envoyé (compte `9r4rxssx64-creator`).

## ⏳ RESTE À FAIRE — workers (8 sur 17)

| Worker | Ce qui manque | Qui |
|---|---|---|
| kdmc-router | Durable Objects → migration dédiée + 15 secrets (dont KDMC_SSO_SECRET, KDMC_RP_*, push) | moi |
| apex-v13-backend | 7 bindings Durable Objects → migration dédiée | moi |
| kdmc-rag | **Vectorize** (base vectorielle) → à recréer dans le nouveau compte | moi |
| apex-vault-svc | KV + VAULT_MASTER_KEY, JWT_VERIFY_KEY | moi (clés à générer/retrouver) |
| apex-chat-svc | KV + SVC_TOKEN | moi |
| apex-sentinels-svc | GITHUB_PAT (compte bloqué→inutile), TELEGRAM_* | reporté |
| kdmc-access | **NOUVEAU** service account Firebase (l'ancien est compromis+tronqué) | Kevin régénère |
| apex-auth-worker | idem nouveau service account Firebase | Kevin régénère |

## ⏳ RESTE À FAIRE — fonctions en attente d'une clé ABSENTE de l'envoi Kevin

- `BRAVE_API_KEY` (kdmc-apis : recherche Brave)
- `OPENROUTER_API_KEY` (kdmc-balances)
- `FIRMS_MAP_KEY` (kdmc-live : carte des feux NASA)
- `PRINTIFY_API_KEY`, `JWT_SECRET`, `AGENT_SECRET` : refusés par le garde-fou anti-abus
  → Kevin les ajoute à la main dans GitLab (Settings → CI/CD → Variables → Masked).
Le worker tourne ; seule la fonction concernée attend sa clé.

## 🚨 RÉVOCATIONS URGENTES (clés exposées dans le chat le 30/08) — ACTION KEVIN

1. **BINANCE** (API Key + Secret) — ARGENT RÉEL → supprimer MAINTENANT (API Management).
2. Clé privée **Firebase** (service account) — compromise + tronquée → régénérer.
3. Cloudflare **Global API Key** (`cfk_`) → révoquer (jeton limité déjà en place).
4. Les **2 GitHub PAT** → révoquer (compte bloqué de toute façon).
5. Mot de passe **KdmcSentry2026!SBM** → changer.
> Aucune de ces 5 n'est stockée au coffre (règle : jamais mot de passe/carte/argent).

## 🚫 CE QU'ON NE FAIT PAS / NE REFAIT PAS

- Ne PAS redéployer de doublons de workers avec des KV/R2 VIDES sans nécessité : les
  originaux (ancien compte) tournent encore avec leurs données. Les nouveaux sont des
  doublures ; les données restent dans l'ancien compte tant que kd-mc.com n'est pas rendu.
- Ne PAS recréer les automatismes en GitHub Actions (c'est ce qui a causé le blocage).
  Les horloges vont sur Cloudflare Cron, sobres (~1/jour).
- Ne PAS mettre un `:` dans une ligne `script:` d'un `.gitlab-ci.yml` (casse le YAML).
- Ne PAS stocker Binance/mots de passe/cartes/clé privée au coffre.
- YouTube (API/CLIENT_ID/SECRET/REFRESH) : rangés pour plus tard, mais AUCUN worker actuel
  ne les utilise (features sociales parquées) — ne pas les câbler sans demande.

## 📋 ACTIONS KEVIN (par priorité)

1. 🚨 Révoquer **Binance** (argent).
2. Rouvrir l'ancien compte **Cloudflare** (échelle A→E dans KEVIN_ACTIONS_TODO) = LA clé de kd-mc.com.
3. Régénérer le **service account Firebase** → me donner le nouveau (débloque access + auth).
4. Ajouter à la main **PRINTIFY_API_KEY / JWT_SECRET / AGENT_SECRET** au coffre GitLab.
5. Donner (si dispo) **BRAVE / OPENROUTER / FIRMS** pour les 3 fonctions en attente.
6. Répondre à **Apple / Flora** (dossier 20000136822150) : décrire le bug API réel
   (en attente de Kevin : "ça se passe où et quoi").
7. Suivre la **réintégration GitHub** (dossier envoyé).

---

## 🍎 APP STORE — le fichier `.p8` bloqué au téléchargement (à reprendre plus tard)

**Statut : EN PAUSE, pas urgent.** L'App Store ne concerne AUCUNE brique de la
reconstruction en cours. À reprendre à tête reposée, de préférence sur un ordinateur.

### Le problème (mots de Kevin)
« À chaque nouvelle clé je n'arrive pas à télécharger le dossier. Ça bloque **rouge**. »
→ Donc ce n'est PAS la règle "téléchargeable une seule fois" : même une clé NEUVE échoue.
C'est un vrai problème de téléchargement `.p8` (très probablement iPhone Safari qui gère
mal ce type de fichier), et c'est le bug ouvert chez **Apple / Flora (dossier 20000136822150)**.

### Ce qu'on sait déjà (ne pas redemander)
- Kevin a un compte Apple Developer. IDs connus : Use ID `8cb3c77c-64e8-4383-b849-ca8327f75200`,
  Key ID `2PW4U56J7C` (ancienne clé, `.p8` perdu), Team ID `Y45767LAGC`.
- Le `.p8` sert UNIQUEMENT à publier sur l'App Store / TestFlight. Tâche 5, parquée.
- Une clé `.p8` ne se télécharge qu'UNE fois, juste après création. Perdue = créer une neuve.

### Pas à pas pour reprendre (ordre de fiabilité)

**A. Sur un ORDINATEUR (le plus fiable — recommandé)**
1. appstoreconnect.apple.com → Users and Access → Integrations → **App Store Connect API**.
2. Bouton **+** → nom `gitlab-deploy`, accès **App Manager** → **Generate**.
3. **Télécharger le `.p8` immédiatement** (seule chance). Sur ordi, ça descend direct.
4. Le `.p8` NE PASSE JAMAIS par le chat. Kevin le dépose lui-même dans le coffre GitLab :
   Settings → CI/CD → Variables → `ASC_PRIVATE_KEY` (type File ou variable), + `ASC_KEY_ID`
   (le nouveau Key ID) + `ASC_ISSUER_ID` (visible en haut de la page API, format UUID).
5. Me dire "c'est dans GitLab" → je branche `.github`→ pardon, la CI iOS (macos) via GitLab
   ou le workflow ios-testflight (à adapter GitLab). Chaîne de build déjà écrite (mobile/).

**B. Si Kevin insiste sur iPhone (capricieux)**
1. Safari → onglets (2 carrés bas droite) → **Privée** → refaire création + téléchargement
   (un bloqueur de contenu empêche souvent le `.p8`).
2. Réglages → Safari → désactiver **Bloquer les fenêtres surgissantes**.
3. Vérifier **app Fichiers → Téléchargements** : le rouge peut s'afficher MAIS le fichier
   être quand même arrivé.
4. Si toujours rouge → **capture d'écran du message rouge** = la clé du diagnostic ET la
   réponse à Flora. Sans elle, on devine.

### Réponse à Apple / Flora (dossier 20000136822150) — EN ATTENTE
Flora (Assistance développement) demande : étapes de repro, date/heure + fuseau, captures
"4 coins", navigateur + version, appareil + OS, étapes déjà tentées, dernier OS.
→ **Bloqué sur : le texte exact du message rouge (capture).** Dès que Kevin l'envoie, rédiger
la réponse complète point par point (appareil = iPhone, navigateur = Safari iOS + version,
étapes tentées = privée / pop-ups / Fichiers). Ne RIEN inventer sans la capture.

### Ce qu'on NE fait pas
- Ne pas promettre l'App Store tant que le `.p8` n'est pas récupéré ET la chaîne build testée.
- Ne pas faire coller le `.p8` dans le chat (secret → GitLab directement).
- Ne pas changer le `bundleId` figé (com.kdmc.cmcteams / apexchat / lingua).

---

## 📦 COLIS d'une session-sœur (cmcteams-78) — récupéré le 31/08

Une AUTRE session Claude (`cmcteams-78`), bloquée sur GitHub comme la mienne, a encapsulé
son travail dans un Artifact (git bundle base64). Kevin l'a transmis.

- **Vérifié** : sha256 du bundle = `42db2fb9a1ac50ebd44a5dba4162da8a90d7181744d36fe9b00ee2a2ee6c9957`
  (identique à l'attendu) · `git bundle verify` OK · tête `90831ce2`.
- **8 commits** (base = origin/main GitHub `7b2d8b6b2`, présent en local) :
  septembre 2026 intégré (app+Départs) · horaires+lieux vérifiés 22 557 cellules · MATTERA M
  + MOREL F retrouvés + garde PDF→seed · **son propre secours GitLab + pipeline GitLab→Cloudflare**
  · outil gitlab-onboard · app blindée contre fichier de données cassé (écran kdmc0.pages.dev).
- **Action faite** : branche poussée sur GitLab `claude/cmcteams-clicking-issue-rmli6m` (PAS main) → préservée.

### ⚠️ À RÉCONCILIER plus tard (quand GitHub rouvre)
DEUX reconstructions parallèles ont fait des choses proches :
- CETTE session : branche `claude/domain-one-click-links-s43ilc` (= main GitLab), workers renés.
- Session-sœur : branche `claude/cmcteams-clicking-issue-rmli6m` (basée sur l'ancien main GitHub).
Les deux ont un secours GitLab + pipeline Cloudflare → NE PAS empiler à l'aveugle. À la réouverture
GitHub : comparer les deux, garder le meilleur de chaque (les 8 commits de planning de la sœur sont
du contenu métier unique à conserver ; les scripts d'infra peuvent se recouper).
