---
name: appstore
description: >
  Publier une app de kd-mc.com sur l'App Store (et TestFlight) en pilotant le CLI `asc`
  (App Store Connect API). À ouvrir dès que Kevin parle d'App Store, TestFlight, iPhone
  « vraie app », soumission Apple, capture d'écran de fiche, build, signature, ou
  « mettre le domaine sur l'App Store ». Contient AUSSI ce qui manque réellement pour y
  arriver — à dire avant de promettre quoi que ce soit.
---

# Publier sur l'App Store — CLI `asc`

## L'outil

**`rorkai/App-Store-Connect-CLI`** (Go, MIT, 5 823 ★, actif) — CLI de l'API App Store
Connect : TestFlight, builds, soumissions, signature, captures, abonnements, analytics.
**JSON d'abord, zéro question interactive** → c'est ce qui le rend pilotable par un agent.
Site : `asccli.sh`.

**`rorkai/app-store-connect-cli-skills`** (MIT, 963 ★) — les **skills d'agent** du CLI.
C'est la source la plus utile : elle décrit les **enchaînements** (publier, gérer une
bêta, préparer une fiche), pas seulement les commandes. Vendorisée dans
`vendor/agent-toolkit/app-store-connect-cli-skills/` → **la lire AVANT d'inventer une
séquence de commandes**.

Doc du CLI : `vendor/agent-toolkit/app-store-connect-cli/`.

## Ce qu'il faut AVANT de promettre l'App Store (à dire à Kevin, honnêtement)

| Prérequis | Qui peut le faire | État |
|---|---|---|
| Compte **Apple Developer Program** (99 €/an) | **Kevin seul** — c'est un paiement CB | ❓ à confirmer |
| **Clé API App Store Connect** (Issuer ID + Key ID + `.p8`) | **Kevin seul** — se génère dans son compte connecté | ❓ à créer une fois |
| Un **vrai binaire iOS** (`.ipa`) | Moi, en CI | ⚙️ à construire |
| Un **Mac pour compiler** | Moi — runner `macos-latest` de GitHub Actions | ✅ disponible |

**Le point qui bloque vraiment, et qu'il ne faut pas cacher** : une PWA **ne se soumet pas
telle quelle**. Il faut l'emballer dans une app native (Capacitor / WKWebView) compilée
avec Xcode. Et Apple **refuse les coquilles vides** autour d'un site (règle 4.2 : « minimum
functionality »). Les apps de Kevin qui ont une vraie chance : **CMCteams** (planning,
hors-ligne, notifications), **Apex Chat** (messagerie chiffrée), **Lingua** (apprentissage,
contenu propre). Un simple lanceur de liens serait refusé.

## Sécurité — non négociable

- La clé `.p8` est un **secret** : elle va dans les **secrets GitHub**
  (`ASC_KEY_ID`, `ASC_ISSUER_ID`, `ASC_PRIVATE_KEY`), **jamais dans le dépôt**, jamais
  journalisée, jamais affichée en clair (masquer comme `masque()` de `session-kevin.mjs`).
- Le binaire `asc` **n'est pas vendorisé** (règle : texte uniquement, jamais d'exécutable
  tiers dans le dépôt). Il s'installe sur la machine qui exécute — runner CI ou Mac de Kevin.
- Toute commande qui **soumet** ou **publie** (`submit`, `release`) est une action
  irréversible côté Apple → **confirmation de Kevin** avant, comme pour un déploiement prod.

## Méthode

1. Lire les skills vendorisés (`app-store-connect-cli-skills`) — l'enchaînement y est déjà écrit.
2. Vérifier les prérequis ci-dessus **avant** d'annoncer quoi que ce soit.
3. Construire sur `macos-latest` en CI (jamais sur le poste de Kevin — règle « le moins de clics »).
4. TestFlight **d'abord** (interne), App Store ensuite, après validation de Kevin.
5. Rapporter avec preuve (numéro de build, état réel lu via `asc`, pas supposé).

## Ce que je ne dois pas faire

- Promettre « ton domaine sera sur l'App Store » : ce sont des **apps** qui se publient, pas
  un domaine — et seulement avec un compte développeur payant.
- Lancer une soumission sans l'accord explicite de Kevin.
- Vendoriser ou exécuter un binaire tiers non vérifié.
