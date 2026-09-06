# Pull requests ouvertes — le vrai « travail resté en rade »

**Établi le 2026-09-06** via le connecteur GitHub (mesure directe, pas déduction).

> **Pourquoi ce document existe** : j'avais d'abord analysé les *branches* (370). C'était le
> mauvais angle. Une branche traîne souvent sans rien vouloir dire ; **une pull request ouverte,**
> **c'est une session qui a fini son travail et qui a explicitement demandé qu'il soit intégré.**
> Voilà le vrai « resté en rade ». Je n'ai pu le voir qu'après avoir découvert — parce que Kevin
> me l'a dit — que le connecteur GitHub fonctionnait (leçon #229).

## Le compte

| Catégorie | Nombre | Ce qu'il faut en faire |
|---|---:|---|
| 🔴 **Auto-rollback** (annulations automatiques) | **18** | **NE JAMAIS FUSIONNER** — voir ci-dessous |
| 🟠 **Sessions Claude** | **20** | à trier une par une |
| 🟡 **Dependabot** (mises à jour de dépendances) | **5** | à jour ou à fermer |
| ⚪ **Builds auto-deploy** | **3** | obsolètes |
| | **46** | |

---

## 🔴 Le point le plus important : 18 annulations dorment dans le dépôt

Ces PR ont été ouvertes automatiquement pour **ANNULER** une livraison jugée fautive sur le
moment. Elles n'ont jamais été ni fusionnées ni fermées — elles sont restées ouvertes des mois.

**Le danger est concret** : si l'une d'elles est fusionnée aujourd'hui, par erreur ou par un
automatisme, elle **retire du code livré depuis** — Face ID, activation IA, commandes
cliquables, corrections de sécurité P0… Et comme `main` a avancé de milliers de commits depuis,
le résultat serait imprévisible.

| PR | Date | Ce qu'elle annulerait |
|---|---|---|
| #922 | 2026-06-08 | wake-word opt-in (#919) |
| #933 | 2026-06-08 | connexion proxy + Coffre UI (#929) |
| #941 | 2026-06-08 | PIN proxy auth (#936) |
| #951 | 2026-06-08 | en-tête non-collant (#945) |
| #962 | 2026-06-08 | apex-parity run_ios_e2e (#953) |
| #966 | 2026-06-08 | commandes cliquables (#960) |
| #969 | 2026-06-08 | commandes perso avec cible (#963) |
| #980 | 2026-06-08 | sync Firebase commandes perso (#974) |
| #984 | 2026-06-08 | message IA KO précis (#981) |
| #988 | 2026-06-08 | activation IA 1 tap (#985) |
| #1000 | 2026-06-08 | test régression contrat auth proxy |
| #1008 | 2026-06-08 | fix préflight CORS manquant |
| #1184 | 2026-06-10 | Apex auto-login Face ID (#1180) |
| #1190 | 2026-06-10 | Stripe billing retiré (#1187) |
| #1197 | 2026-06-10 | purge Stripe partout |
| #1342 | 2026-06-13 | lien « ← KDMC » ne chevauche plus |
| #1872 | 2026-07-01 | audit externe corrections P0 sécurité |
| #1968 | 2026-07-03 | IA admin reste sur Anthropic |

**Recommandation** : les **fermer** (pas les fusionner). Fermer une PR est réversible —
elle se rouvre en un clic si besoin. Les laisser ouvertes, c'est garder 18 mines.

---

## 🟠 20 sessions Claude dont le travail n'a jamais été intégré

De la plus ancienne à la plus récente. Les quatre dernières (5-6 septembre) sont probablement
des **sessions encore vivantes** — leur PR est normale, pas abandonnée.

| PR | Date | Branche | Sujet |
|---|---|---|---|
| #126 | 2026-04-21 | `claude/v9446-regex-cadres` | v9.447: Fallback cadres name-first + fix indicateur Firebase |
| #141 | 2026-04-21 | `claude/v1218-feed-bidirectionnel` | v12.19: Auto-seed mémoire Apex + vault social links |
| #207 | 2026-04-24 | `claude/v1279-crew-cmc-perf` | URGENT v12.80: FAB hidden par defaut + force login si vide |
| #270 | 2026-05-18 | `claude/test-699LQ` | Apex v13.4.225 — fix « tjs v207 iPhone » + double filet auto-MAJ |
| #857 | 2026-06-06 | `claude/lolo-crew-review-tDzp7` | Docs temps réel — session Chez Lolo + leçons #90/#91 |
| #1107 | 2026-06-09 | `claude/kdmc-sso-pwa` | SSO PWA |
| #1453 | 2026-06-17 | `claude/ld-empty-catalog` | catalogue vide Chez Lolo |
| #1525 | 2026-06-18 | `claude/ld-logo-gen` | génération de logo |
| #1639 | 2026-06-22 | `claude/ld-logo-img` | image de logo |
| #2027 | 2026-07-04 | `claude/free-apis-analysis-c4sy5d` | analyse des API gratuites |
| #2529 | 2026-07-14 | `claude/account-statements-analysis-9sebdc` | Finances v0.13.3 + connecteur Monaco |
| #2619 | 2026-07-17 | `claude/monaco-kv-frugal` | Monaco KV frugal |
| #3009 | 2026-08-05 | `claude/kdmc-access-visible-proof` | preuve visible d'accès kdmc |
| #3011 | 2026-08-05 | `claude/espion-max` | espion max |
| #3025 | 2026-08-05 | `claude/compte-unique` | compte unique |
| #3651 | 2026-09-05 | `claude/lingua-prenom-nom` | Lingua prénom+nom |
| #3669 | 2026-09-05 | `claude/miroir-pour-chaque` | miroir pour chaque |
| #3679 | 2026-09-06 | `claude/surveillance-domaine-26-adresses` | surveillance domaine 26 adresses |
| #3694 | 2026-09-06 | `claude/sarzance-family-tree-3jxi7i` | arbre famille Sarzance |
| #3710 | 2026-09-06 | `claude/apex-chat-mfa-faceid` | MA session (clean, en cours de fusion) **(la mienne, en cours)** |

**Ce qu'il faut décider, PR par PR** : le sujet est-il encore utile aujourd'hui, ou le besoin
a-t-il été traité autrement depuis ? Une PR d'avril posée sur le `main` d'aujourd'hui ne se
fusionne pas à l'aveugle — c'est une régression assurée.

---

## 🟡 5 mises à jour de dépendances (Dependabot, 8 juin)

- **#902** — bump peter-evans/create-pull-request 6→8
- **#903** — bump actions/setup-python 5→6
- **#904** — bump actions/download-artifact 4→8
- **#905** — bump cloudflare/wrangler-action 3→4
- **#906** — bump actions/setup-node 4→6

Ce sont des montées de version d'outils GitHub Actions. Trois mois de retard : à revalider
(les versions proposées ont peut-être encore changé) plutôt qu'à fusionner en l'état.

## ⚪ 3 builds automatiques obsolètes

- **#1437** — Auto-deploy Apex v13.4.334 build (2026-06-16)
- **#1871** — Auto-deploy Apex v13.4.336 build (2026-07-01)
- **#3129** — Auto-deploy Apex v13.4.364 build (2026-08-07)

Des builds figés d'anciennes versions d'Apex. Sans objet aujourd'hui.

---

## Ce que je n'ai pas fait

**Je n'ai fermé ni fusionné aucune PR.** Fusionner du code vieux de plusieurs mois sur un
`main` qui a énormément bougé provoquerait des régressions, et fermer 18 PR touche à ton dépôt
de façon visible. Les deux sont des décisions qui te reviennent — je les ai préparées, pas prises.
