# Verrouillage des données Firebase — CMCteams + Apex AI

> Objectif Kevin (2026-05-21) : « bloquer les projets pour que personne de
> l'extérieur ne puisse les modifier, sauf Apex AI ».

## 1. État actuel (constat audit)

Les deux apps écrivent dans Firebase Realtime Database **sans authentification** :

| App | RTDB |
|-----|------|
| CMCteams | `cmcteams-c16ab` |
| Apex AI | `kdmc-clients-default-rtdb` |

Conséquence : toute personne qui connaît l'URL de la base peut lire/écrire les
données (planning, employés, chat, mémoire Apex). Le coffre Apex est chiffré
AES-GCM côté client → son contenu reste illisible, mais il peut être **écrasé**.

## 2. Pourquoi les règles RTDB seules ne suffisent pas

Les règles `database.rules.json` décident `.read`/`.write` selon `auth`. Or
les apps n'ouvrent **aucune session Firebase** : `auth` est toujours `null`.

- Mettre `".write": "auth != null"` → **bloque aussi les apps** (régression totale).
- Sans identité, une règle ne peut **pas distinguer « l'app de Kevin » d'un tiers**.

## 3. La vraie solution — Firebase App Check

**App Check** atteste que les requêtes proviennent de **ton app authentique**
(et pas d'un script tiers). C'est le seul mécanisme qui réalise réellement
« seul Apex AI / mes apps peuvent écrire ».

Étapes (console Firebase — action Kevin, ~10 min, une seule fois) :

1. Console Firebase → **App Check** → enregistrer chaque app web.
   Fournisseur recommandé : **reCAPTCHA Enterprise** (ou v3).
2. Côté code (je peux le faire sur demande) : initialiser le SDK App Check au
   boot des deux apps avec la clé de site.
3. Console → App Check → **Enforce** sur Realtime Database.
4. Déployer `database.rules.example.json` adapté (voir §4).

Après §3, toute requête sans jeton App Check valide est **refusée par Firebase** —
y compris les apps externes, scripts, navigateurs tiers.

## 4. Règles RTDB d'accompagnement

`database.rules.example.json` (à la racine) est un **modèle** : il garde les
apps fonctionnelles (lecture/écriture autorisées) MAIS ajoute des
`.validate` (plafonds de taille anti-pollution / anti-DoS) et **doit être
complété avec App Check actif** via `auth.token` pour le verrouillage réel.

⚠️ Ne PAS déployer tel quel sans avoir vérifié qu'il couvre toutes les clés
réellement écrites par les apps — un déploiement aveugle peut bloquer l'app.
Le déploiement se fait via la console Firebase (Database → Rules) ou
`firebase deploy --only database`.

## 5. Action restante côté Kevin

- [ ] Activer App Check sur les 2 projets Firebase (console).
- [ ] Me redonner le feu vert pour intégrer le SDK App Check dans les 2 apps.
- [ ] Activer "Enforce" puis déployer les règles.

Tant que §3 n'est pas fait, le verrouillage Firebase reste **partiel**
(durcissement structurel uniquement, pas de blocage par identité).
