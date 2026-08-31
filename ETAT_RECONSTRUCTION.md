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
