# Chantier — Verrouillage Firebase via Worker (Option B)

> Objectif : seul le `firebase-write-proxy` (Cloudflare Worker) peut écrire
> dans Firebase. RTDB passe à `.write:false`. Lectures/SSE inchangées.

## Pièces livrées (inertes, ne cassent rien tant que non déployées)

| Fichier | Rôle |
|---|---|
| `apex-ai/firebase-write-proxy.js` | Le Worker Cloudflare (point d'écriture unique) |
| `database.rules.locked.json` | Règles RTDB finales (`.write:false`) |
| `FIREBASE_SECURITY.md` | Contexte + pourquoi Option B |

## Séquence SÛRE — l'ordre est critique (aucune perte de données)

Chaque étape laisse les apps **100 % fonctionnelles**. On ne verrouille
qu'à la toute fin, une fois tout vérifié.

### Étape 1 — Déployer le Worker  *(Kevin + Claude)*
- Cloudflare → Create Worker `firebase-write-proxy` → coller le fichier.
- Variables/Secrets : `CMC_RTDB_URL`, `APEX_RTDB_URL`, `CMC_DB_SECRET`,
  `APEX_DB_SECRET`, `PROXY_KEY` (cf. en-tête du fichier Worker).
- Tester : `GET <worker>/health` → `{ok:true}`.
- ✅ À ce stade : apps inchangées, rien rerouté.

### Étape 2 — Rerouter les ÉCRITURES des apps  *(Claude)*
Chokepoints d'écriture (bornés) :
- **CMCteams** : `fbWrite()` + ~3 écritures directes (`cmc_admin_cfg`,
  `audit_request`, `cmc_wipe_lock_ts`).
- **Apex** : la méthode d'écriture de `services/storage/firebase.ts`
  + `vault-firebase-backup`.
- Chaque écriture POST vers le Worker AU LIEU de la RTDB directe.
- **Filet de sécurité** : pendant cette étape, les règles RTDB sont
  encore `.write:true` → même si un chemin était oublié, rien ne casse.
- Snapshot/backup Firebase complet AVANT (règle Kevin « ne jamais perdre »).

### Étape 3 — Vérifier  *(Kevin teste en live)*
- Créer/modifier une donnée dans chaque app → confirmer qu'elle est bien
  écrite (via le Worker) et relue.
- `wrangler tail` sur le Worker → voir les écritures passer.
- Tant qu'un doute subsiste → NE PAS passer à l'étape 4.

### Étape 4 — Verrouiller RTDB  *(Kevin)*
- Console Firebase → Realtime Database → Règles → coller
  `database.rules.locked.json` → Publier. Pour les 2 projets.
- ✅ Désormais : écriture directe externe = refusée. Seul le Worker écrit.

### Rollback
Si problème à l'étape 4 : recoller les règles ouvertes (`.write:true`) →
les apps réécrivent direct immédiatement. Réversible en 30 s.

## Ce que Kevin doit fournir

1. **Database secret** de chaque projet Firebase :
   Console Firebase → ⚙ Paramètres du projet → onglet **Comptes de service**
   → **Secrets de base de données** → « Afficher ». Copier la valeur.
   *(Si l'option n'apparaît pas : projet récent sans secret hérité → on
   basculera sur un compte de service, je gère le code.)*
2. **URL RTDB** du projet Apex (Console → Realtime Database → l'URL en haut).
3. Confirmer l'accès Cloudflare (le secret `CLOUDFLARE_API_TOKEN` existe déjà
   dans le repo pour les workflows de déploiement).

## Limite honnête

Phase 1 (ce chantier) = durcissement fort : RTDB verrouillée en écriture,
point de contrôle unique, validation des chemins/tailles. **Pas** une
attestation cryptographique (un attaquant lisant le JS de l'app pourrait
rejouer des requêtes vers le Worker). Phase 2 possible : faire vérifier un
jeton App Check par le Worker. Les **lectures** restent ouvertes
(`.read:true`) — nécessaire pour la synchro SSE ; les verrouiller serait un
chantier séparé.
