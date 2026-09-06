# 🚀 Remettre kd-mc.com en ligne

> **⚠️ ÉTAT DU 5.09.2026 — ce document décrit la panne du 2-3.09, elle est TERMINÉE.**
> **GitHub a rouvert le 4.09 à 16h34 UTC**, le site vit de nouveau depuis GitHub et les
> **26** sous-domaines répondent (26 entrées dans `ROUTES` du routeur, vérifiées par
> `npm run test:uptime-couverture`). Les chiffres ci-dessous datent de la panne :
> « 20 sous-domaines » et « 17 Workers » étaient justes ce jour-là, ils ne le sont plus —
> aujourd'hui **26 sous-domaines** et **25 workers** sur le compte. Le mode d'emploi reste
> valable comme **secours** si GitHub retombe : la marche à suivre n'a pas changé, seuls
> les nombres ont bougé.

> **Inventaire d'abord**, comme demandé. Voilà ce qu'on a réellement, mesuré —
> pas supposé — avant toute recommandation.

---

## Ce que j'ai vérifié

| Cible | Depuis mon environnement |
|---|---|
| Cloudflare (API, tes Workers, kd-mc.com) | ❌ `000` — bloqué |
| Ton Firebase | ❌ `000` — bloqué |
| GitHub | ❌ `403` — compte suspendu |
| GitLab | ✅ `301` — joignable |

Identifiants Cloudflare : **aucun**, ni dans le dépôt, ni dans l'environnement,
ni de session `wrangler`. **Je ne peux donc rien déployer moi-même.** C'est
mesuré, pas une excuse.

Ce que tu as déjà : **17 Workers Cloudflare** configurés, un compte actif, ton
domaine et ses 20 sous-domaines. Il ne manque que la source des pages.

---

## ⚠️ AVANT TOUT : vérifie que tu es dans le BON compte Cloudflare

Kevin a **deux comptes Cloudflare**, et c'est ce qui a fait perdre du temps le
16/08 : le projet Pages a été créé dans l'un, alors que le routeur vit dans
l'autre.

**Le bon compte est celui dont le sous-domaine est `9r4rxssx64.workers.dev`**
(visible en bas de la page *Workers & Pages*, section « Détails du compte »).
Jamais `desarzens-kevin.workers.dev` — celui-là ne contient que 4 vieux Workers.

Signe qui ne trompe pas : dans le bon compte, la liste contient **`kdmc-router`**
et une quinzaine d'autres. Dans le mauvais, seulement 4 ou 5.

> À savoir : un projet **Pages** peut vivre dans n'importe lequel des deux —
> son adresse `*.pages.dev` est publique, le routeur la joint par Internet.
> Seul le **routeur** doit être cherché dans le bon compte.

---

## Deux chemins — le second est le tien

### 🅰️ Dépannage : le ZIP *(3 clics, 5 minutes)*

**`kd-mc-sites.zip`** — 7 Mo, 469 fichiers, **13 applications**.

1. **Créer un projet Pages** → onglet **« Upload assets »** (pas « Connect to Git ») → glisser le dossier des applications
2. **Changer UNE ligne dans le routeur** (compte `9r4rxssx64`) → *Modifier le code* → ligne **111** :

```js
    const upstreamUrl = UPSTREAM + upstreamPath + url.search;   // ← avant
    const upstreamUrl = 'https://kdmc0.pages.dev' + upstreamPath.replace('/CMCteams', '') + url.search;   // ← après
```

→ *Deploy*. C'est tout. Prouvé par `tests/verify-bascule-une-ligne.mjs`
(44 contrôles, 8 sous-domaines rendus depuis le VRAI code déployé, dans les
deux rangements possibles du paquet).

**Le défaut** : à chaque modification, il faut refaire le paquet et le renvoyer.
Ce n'est pas « tout auto ».

### 🅱️ Permanent et automatique *(≈ 10 min une fois, puis plus jamais)*

Cloudflare Pages se branche sur **GitLab** et **redéploie tout seul à chaque
push** ([doc](https://developers.cloudflare.com/pages/get-started/git-integration/)).

```
je pousse sur GitLab  →  Cloudflare construit et publie tout seul  →  kd-mc.com à jour
```

1. **▶️ [Créer un projet GitLab vide](https://gitlab.com/projects/new#blank_project)** — nom `CMCteams`, **privé**, sans README
2. **▶️ [Créer un jeton](https://gitlab.com/-/user_settings/personal_access_tokens)** — portée **`write_repository` seule**, expiration **demain** → me le coller
   *(je pousse les 395 commits, puis tu le supprimes)*
3. **▶️ [Créer un projet Pages](https://dash.cloudflare.com/?to=/:account/workers-and-pages/create/pages)** → **« Connect to Git »** → GitLab → `CMCteams`, avec :
   - Build command : `node services/kdmc-router/prepare-secours.mjs --pages`
   - Output directory : `services/kdmc-router/pages-upload`
4. La même ligne 14 du routeur qu'en 🅰️

**Ce que ça apporte en plus** : **16 applications** au lieu de 13 — l'arbre
généalogique, Chez Lolo et La Détente reviennent aussi. Et plus jamais de ZIP.

---

## ⚠️ Le piège du préfixe — et comment Kevin l'a révélé

GitHub servait les pages sous `/CMCteams/…` (le nom du dépôt) et le routeur
**en ligne** demande toujours ce préfixe (il est en dur dans la table `ROUTES`).
J'avais donc enveloppé le paquet dans un dossier `CMCteams/` pour n'avoir qu'à
changer l'adresse.

**Sauf que Cloudflare Pages APLATIT le dossier déposé** : ses fichiers
atterrissent à la **racine** du projet, le nom du dossier disparaît.

C'est Kevin qui l'a prouvé en une phrase : *« ouvert kdmc0.pages.dev, CMCteams
toujours »*. Impossible avec l'enveloppe — la racine n'aurait aucun `index.html`
et Cloudflare aurait renvoyé sa page 404. Donc : fichiers à la racine.

D'où la correction retenue : **une seule ligne**, la 111, qui change l'adresse
**et** retire le préfixe.

| Adresse ouverte | Ce qui s'affiche (paquet à la racine) |
|---|---|
| `kdmc0.pages.dev/` | **CMCteams** — Planning Casino de Monaco ✅ normal |
| `kdmc0.pages.dev/kdmc-home/index.html` | **KDMC APEX — Mon univers** |
| `kdmc0.pages.dev/tools/departs/index.html` | **CMCteams light — Départs** |
| `kdmc0.pages.dev/coffre-fort/index.html` | **🔐 Coffre-fort perso** |

> Leçon : un rangement supposé n'est pas un rangement vérifié. Le test
> `verify-bascule-une-ligne.mjs` couvre désormais **les deux** rangements et
> prouve que la correction de l'un ne marche PAS sur l'autre.

---

## Ce que j'ai nettoyé au passage

En vérifiant le paquet avant de te le donner, j'ai trouvé qu'on publiait des
choses qui n'ont rien à faire en ligne — et qui étaient **déjà** publiques sur
l'ancien site :

| | Avant | Maintenant |
|---|---|---|
| Cartes de code source *(exposent tout le source)* | 289 | **0** |
| Fichiers de test | 77 | **0** |
| Code serveur (Workers) | 9 | **0** |
| Notes internes *(dont la liste de tes secrets)* | 1 | **0** |

Aucune page ne les chargeait — vérifié, 0 référence. Et j'ai contrôlé qu'aucune
**vraie** clé ne traîne dans le paquet : les correspondances trouvées étaient
des exemples (`ghp_xxx`, `sk-ant-api03-XXXX`) et les motifs de détection du
coffre-fort. **0 clé réelle, 0 bloc de clé privée.**

Total : 1 747 → 1 370 fichiers, et les 16 applications toujours complètes.

---

## Ce que je ne peux pas faire, et pourquoi

Créer le projet Pages, glisser le ZIP, poser les variables : mon environnement
n'atteint pas Cloudflare (`CONNECT 403`, mesuré plus haut). Ce sont les seuls
gestes qui restent de ton côté.

Tout le reste est fait et vérifié : le paquet, son contenu fichier par fichier,
son innocuité, et la bascule du routeur (35 contrôles sur le vrai code).
