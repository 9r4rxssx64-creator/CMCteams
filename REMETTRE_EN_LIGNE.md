# 🚀 Remettre kd-mc.com en ligne

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

## Deux chemins — le second est le tien

### 🅰️ Dépannage : le ZIP *(3 clics, 5 minutes)*

**`kd-mc-sites.zip`** — 7 Mo, 469 fichiers, **13 applications**.

1. **▶️ [Créer un projet Pages](https://dash.cloudflare.com/?to=/:account/workers-and-pages/create/pages)** → onglet **« Upload assets »** (pas « Connect to Git ») → nom `kdmc` → glisser le ZIP
2. Vérifier `https://kdmc.pages.dev/kdmc-home/index.html`
3. **▶️ [Réglages du routeur](https://dash.cloudflare.com/?to=/:account/workers/services/view/kdmc-router/production/settings)** → *Variables* → ajouter :

| Nom | Valeur |
|---|---|
| `UPSTREAM_BASE` | `https://kdmc.pages.dev` |
| `UPSTREAM_PREFIX` | *(vide)* |

**Le défaut** : à chaque modification, il faut refaire un ZIP et le renvoyer.
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
4. Les mêmes 2 variables du routeur qu'en 🅰️

**Ce que ça apporte en plus** : **16 applications** au lieu de 13 — l'arbre
généalogique, Chez Lolo et La Détente reviennent aussi. Et plus jamais de ZIP.

---

## ⚠️ Le seul piège, dans les deux cas

`UPSTREAM_PREFIX` doit rester **vide**. GitHub servait tes pages sous
`/CMCteams/…` (le nom du dépôt), Cloudflare les sert à la racine. C'est cette
variable vide qui retire le préfixe. Oubliée → **404 partout**.

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
