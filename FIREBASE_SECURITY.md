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

## 2. ⚠️ Contrainte technique majeure (constat code 2026-05-21)

Les deux apps parlent à Firebase RTDB en **REST brut + SSE** :
`fetch('<rtdb>/....json')` pour lire/écrire + `new EventSource('<rtdb>/....json')`
pour la synchro temps réel. **Elles n'utilisent PAS le SDK Firebase.**

Or App Check ne s'attache automatiquement **qu'avec le SDK Firebase**. Pour du
REST brut :

- un `fetch()` peut éventuellement porter un jeton App Check (en-tête / param) ;
- mais un **`EventSource` (SSE) ne peut PAS porter de jeton** (pas d'en-tête
  custom, connexion longue durée alors que le jeton expire).

➡️ **Conclusion : activer « Enforce » App Check sur RTDB casserait la synchro
temps réel (SSE) des 2 apps.** App Check n'est donc PAS un simple interrupteur
ici. Enregistrer le fournisseur reCAPTCHA dans la console est **sans danger**
(n'enforce rien) — mais l'« Enforce » est bloquant tant que l'architecture
n'a pas changé.

## 3. Les 2 vraies solutions (chantier, pas une tâche d'un soir)

### Option A — Migrer les 2 apps vers le SDK Firebase
Remplacer le REST/SSE brut par `firebase/app` + `firebase/database` +
`firebase/app-check`. Le SDK utilise un WebSocket (pas SSE) et attache le jeton
App Check automatiquement → App Check « Enforce » fonctionne nativement.
- ✅ Solution propre et standard.
- ❌ Refacto réelle de la couche Firebase des 2 apps + tests.

### Option B — Proxy serveur (Cloudflare Worker)  ← recommandée
Toutes les écritures passent par un Worker Cloudflare (Apex en a déjà un :
`apex-ai/proxy-apex.js`). Le Worker détient un **secret Firebase serveur**
(database secret / service account) et écrit en mode admin. Règles RTDB :
`".write": false` pour tous les clients → **plus aucune écriture externe
possible**, seul le Worker écrit. Le Worker valide l'origine + un secret partagé.
- ✅ Bloque réellement « seul mon app » sans dépendre du SDK ni d'App Check.
- ✅ Réutilise une brique déjà existante (proxy-apex.js).
- ❌ Rerouter chaque `fbWrite()` / `fetch()` vers le Worker.

## 4. Règles RTDB d'accompagnement

`database.rules.example.json` (racine) est un **modèle** : il garde les apps
fonctionnelles + ajoute des `.validate` (plafonds de taille anti-DoS).
Le verrouillage réel des écritures (`".write": false` côté client) ne devient
sûr **qu'une fois l'option A ou B en place**.

⚠️ Ne PAS déployer de règles `.write: false` tant que A ou B n'est pas fait —
sinon les apps ne peuvent plus rien écrire.

## 5. État / prochaines étapes

- [x] Verrouillage **code GitHub** : fait (CODEOWNERS + branch-guard + protection
      de branche `main`).
- [x] `database.rules.example.json` : modèle créé.
- [ ] **Décision Kevin** : Option A (SDK) ou Option B (proxy Worker) ?
- [ ] Selon le choix : implémentation par Claude Code (chantier dédié).
- [ ] Puis seulement : régler les règles RTDB + (si A) activer App Check Enforce.

Tant que l'option A ou B n'est pas livrée, le verrouillage Firebase reste
**partiel** : code protégé ✅, données encore modifiables par REST ⚠️
(atténué par le chiffrement du coffre Apex).

## 6. Note — enregistrement reCAPTCHA en cours

Si une clé reCAPTCHA v3 a été créée et le fournisseur enregistré dans la console
App Check : **ce n'est pas perdu**. C'est sans danger (aucun Enforce) et la clé
resservira si l'option A (SDK) est retenue. Ne PAS activer « Enforce ».
