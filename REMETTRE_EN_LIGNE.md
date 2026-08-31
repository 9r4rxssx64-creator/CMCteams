# 🚀 Remettre kd-mc.com en ligne — sans GitHub, sans GitLab, sans jeton

> Tu as eu le bon réflexe : **tout peut passer par Cloudflare.** C'est plus
> simple, plus généreux, et ça ne demande aucun compte supplémentaire.

---

## Pourquoi Cloudflare suffit

| | GitHub Pages *(mort)* | GitLab | **Cloudflare Pages** |
|---|---|---|---|
| Trafic | 100 Go/mois | — | **illimité** |
| Fichiers par site | — | — | 20 000 *(on en a 846)* |
| Minutes de calcul | 10 mises en ligne/h | 400 min/mois | **0 nécessaire** |
| Compte à créer | — | oui | **aucun, tu l'as déjà** |
| Jeton à me confier | — | oui | **aucun** |

Le seul manque de Cloudflare : il n'héberge pas de **dépôt de code** (l'historique
des versions). Mais ça, ce n'est pas urgent — tes sites, si.

---

## Ce que tu as reçu

**`kd-mc-sites.zip`** — 11 Mo, 846 fichiers. Il contient les 13 applications que
servent tes sous-domaines. Vérifié : les 13 pages d'accueil sont bien dedans.

Les fichiers sont **à la racine du ZIP** (pas de dossier `CMCteams/` autour) —
c'est important pour l'étape 3.

---

## Étape 1 — Créer le site *(≈ 2 min, dans Safari)*

**▶️ [Créer un projet Pages](https://dash.cloudflare.com/?to=/:account/workers-and-pages/create/pages)**

- Choisir l'onglet **« Upload assets »** (envoi direct) — surtout **pas**
  « Connect to Git », on n'en a pas besoin
- Nom du projet : `kdmc`
- Glisser le fichier **`kd-mc-sites.zip`**

Cloudflare décompresse tout seul. À la fin il te donne une adresse du type
**`https://kdmc.pages.dev`** — note-la, elle sert à l'étape suivante.

## Étape 2 — Vérifier *(10 secondes)*

Ouvre `https://kdmc.pages.dev/kdmc-home/index.html`

Tu dois voir ta page d'accueil. Si oui, le plus dur est fait.

## Étape 3 — Rebrancher le domaine *(≈ 1 min, 2 réglages)*

Ton routeur sait déjà changer de source **sans nouvelle mise en ligne**.

**▶️ [Réglages du routeur](https://dash.cloudflare.com/?to=/:account/workers/services/view/kdmc-router/production/settings)**
→ *Settings* → *Variables and Secrets* → **Add variable** :

| Nom | Valeur |
|---|---|
| `UPSTREAM_BASE` | `https://kdmc.pages.dev` *(l'adresse de l'étape 1)* |
| `UPSTREAM_PREFIX` | *(laisser complètement vide)* |

**Save and deploy.** Attends 30 secondes, puis ouvre **kd-mc.com**.

> **Pourquoi la deuxième variable doit rester vide** : GitHub servait tes pages
> sous `/CMCteams/…` (le nom du dépôt). Cloudflare Pages les sert à la racine.
> La variable vide dit au routeur de retirer ce préfixe. Si tu l'oublies, tu
> auras des 404 partout — c'est le seul piège de la manœuvre.

---

## Ce qui revient, et ce qui attend

**Revient tout de suite (13 applications) :** l'accueil kd-mc.com · CMCteams ·
Apex AI · Apex Chat · le coffre · **Départs / CMCteams light** · Créa Studio ·
le tableau de bord crypto · PoolPilot · Autorisations · Lingua · Dashboard ·
Sourcing.

**Attend un second envoi (trop lourd pour un premier ZIP) :** l'arbre
généalogique (160 Mo de photos), Chez Lolo (62 Mo) et La Détente (14 Mo). Dis-moi
quand tu veux, je prépare un deuxième paquet — même manipulation, ça vient
s'ajouter.

## Et si quelque chose cloche

- **404 partout** → `UPSTREAM_PREFIX` n'est pas vide, ou contient un espace
- **Une seule app en 404** → elle est dans le lot « attend un second envoi »
- **Le site s'affiche mais sans les images** → normal pour les apps lourdes,
  elles arrivent au second envoi

## Pour la suite : le code

Tes sites seront en ligne, mais l'**historique de ton code** (395 versions) n'est
nulle part de public. Deux options, sans urgence :

1. **GitLab** — tout est prêt de mon côté, voir `MIGRATION_GITLAB.md`
2. **Attendre GitHub** — si la seconde demande aboutit

En attendant, l'historique complet est dans le fichier `.patch` que je t'ai
envoyé : rien n'est perdu.

## Ce que je ne peux pas faire

Mon environnement n'atteint pas Cloudflare (`CONNECT 403`, mesuré) — je ne peux
donc ni créer le projet ni cliquer à ta place. J'ai fait tout le reste :
préparer le paquet, le vérifier fichier par fichier, et rendre la bascule
réalisable en deux réglages depuis ton iPhone.
