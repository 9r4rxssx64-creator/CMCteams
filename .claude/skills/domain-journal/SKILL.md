---
name: domain-journal
description: >
  « Qui se connecte » — le journal des personnes qui utilisent le domaine kd-mc.com
  (admin.kd-mc.com) : d'où viennent les connexions, comment on lit la donnée réelle, la règle
  « un compte par personne », la vie privée. À ouvrir dès qu'on touche à admin.kd-mc.com, au
  routeur kdmc-router, aux comptes/fiches/fusion d'identités, aux connexions, appareils, lieux,
  ou quand Kevin demande « qui s'est connecté », « l'historique de X », « les comptes en double ».
---

# Qui se connecte — le journal du domaine

## ⚠️ Avant tout : la donnée EXISTE DÉJÀ (leçon #164)

Le 2026-08-05 j'ai construit un journal des connexions **en double** alors qu'il existait déjà et
qu'il contenait **191 connexions**. Ma recherche portait sur le vocabulaire de MA solution
(`/log`, « journal ») au lieu du **concept métier** (`hits`, `history`, « connexion »), et j'ai pris
« ma base est vide » pour « la donnée n'existe pas ».

> **Règle** : avant d'ajouter un stockage ici, cherche `hits`, `history`, `devices`, `places`,
> `apps`, `last_seen` dans `services/kdmc-router/worker.js`, et regarde ce que Kevin voit à l'écran.

## Qui écrit quoi

| Brique | Rôle |
|---|---|
| **`services/kdmc-router/`** (worker `kdmc-router`) | Sert **kd-mc.com et tous les sous-domaines**. À chaque visite il enrichit la fiche de la personne dans le KV `ACCOUNTS` : `hits`, `history[]` (app, durée, lieu, appareil), `devices`, `places`, `apps`, `last_*`, `hours`. **C'est la SOURCE UNIQUE des connexions.** |
| **`services/kdmc-access/`** (worker `kdmc-access`) | Sert **admin.kd-mc.com** : la page « Qui se connecte » (`page.js`), l'ingestion des **actions** (`POST /log`) et leur relecture (`GET /history`). |
| Les apps (CMCteams, Apex Chat, Lingua…) | Envoient leurs **actions** (connexion, progression…) à `admin.kd-mc.com/log`. Métadonnées seulement — **jamais** le contenu privé (message, planning). |

La page fusionne les deux : **connexions** (routeur, déjà peuplé) + **actions** (kdmc-access).

## Lire les vraies connexions

`GET https://kd-mc.com/__admin/domain-log` — lecture seule, en-tête `x-apex-pin` = SHA-256 du code
admin. **Auth par en-tête, pas par cookie** : le préflight est obligatoire, aucune autorité ambiante
→ zéro surface CSRF ajoutée. Comparaison en temps constant, fail-closed, CORS limité à
`admin.kd-mc.com`, projection minimale (ni e-mail, ni jeton, ni contenu privé).

Preuve automatique à chaque déploiement (`deploy-kdmc-access.yml`) : écrit un évènement, le relit,
puis affiche `Connexions RÉELLES lisibles → N personnes | M connexions`.

## Un compte par personne (règle absolue de Kevin)

- `canonFor()` range toutes les fiches d'une personne dans **un seul dossier** via l'annuaire
  `nm:<prénom nom>` (le premier identifiant vu devient le dossier). **Exige 2 mots** — un prénom
  seul ne regroupe rien.
- `mergeIntoCanon()` absorbe les fiches déjà éparpillées : connexions additionnées, historiques
  concaténés, appareils/lieux/apps réunis. L'ancienne fiche devient un **renvoi** (`merged_into`),
  jamais supprimée.
- **Ce n'est pas « une seule fois »** : `merged_at` + re-passage au plus 1×/semaine (leçon #166),
  sinon un doublon né plus tard n'est jamais absorbé (vécu : 196 + 116 connexions au même nom).
- **Identité stricte** : `isAdminName` exige nom de famille **ET** prénom/initiale. Un patronyme
  partagé n'identifie personne (« Ronan Desarzens » ≠ Kevin). ⚠️ **Une fusion à tort ne se défait
  pas** — la fiche source est réécrite en renvoi.

Tests : `services/kdmc-router/compte-unique.test.mjs` (10) · `domain-log.test.mjs` (7) ·
`services/kdmc-access/page-logic.test.mjs` (4).

## Pièges déjà payés

- **Robots ≠ personnes** : « CI Smoke », « Vérification automatique » polluaient les compteurs →
  `isBot()` + bascule pour les afficher. Attention aux prénoms contenant « ci » (Cindy, Patricia).
- **Deux comptes du même nom** : la page **additionne** (`+=`), ne remplace jamais (`=`).
- **Oslo, NO** dans les lieux de Kevin = **iCloud Private Relay**, pas une intrusion.
- **Préflight CORS** : `handleAdmin` répondait 204 à TOUS les `OPTIONS` → la lecture cross-origin
  était bloquée et la page restait vide sans erreur. Exclure la route lue depuis un autre domaine.
- **Une app peut « envoyer » sans que ça passe** : vérifier aussi que son **CSP** autorise
  `admin.kd-mc.com` (Apex v13 : envoi présent dans le bundle, CSP absente → rien n'arrive).
- **Anti-écriture trop fréquente** : une 2ᵉ visite < 120 s ne réécrit rien. Dans un test, vieillir
  **aussi** `last_seen`, sinon on teste le throttle et pas la fusion.

## Vie privée

Métadonnées uniquement (qui, quand, quelle app, quel appareil, quelle ville, combien de temps).
**Jamais** le contenu : pas de message, pas de planning, pas d'e-mail, pas de jeton dans la réponse.
Le test `domain-log.test.mjs` le vérifie.
