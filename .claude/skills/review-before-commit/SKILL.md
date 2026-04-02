---
name: review-before-commit
description: Agent de revue de code automatique avant chaque commit. Analyse le diff git pour détecter problèmes de qualité, sécurité, conventions. DOIT être invoqué avant tout git commit.
user-invocable: false
allowed-tools: Read Bash Grep
context: fork
agent: general-purpose
---

# Agent de Revue Pré-Commit

**INVOCATION AUTOMATIQUE** : Cet agent DOIT être exécuté avant chaque commit sur le projet CMCteams.

## Mission

Analyser le `git diff --staged` (ou `git diff` si rien n'est stagé) et vérifier la qualité du code modifié.

## Vérifications

### 1. Sécurité XSS
Pour chaque ligne ajoutée contenant `innerHTML`, `.innerHTML =`, ou `.innerHTML +=` :
- Vérifier que toute variable utilisateur passe par `esc()`
- Variables utilisateur = `emp.name`, `A.chatMsgs[*].text`, input values, données importées
- Les constantes hardcodées (HTML statique, codes de shift) sont sûres

### 2. Conventions du projet
- **Langue** : Les commentaires, noms de variables UI, et strings visibles sont en **français**
- **Noms de fonctions** : les vues commencent par `v` (vPlan, vStats...)
- **État global** : mutations via `A.propriété`, pas de variables globales parasites
- **Sauvegarde** : après mutation de `A.employees` → `ls("cmc_e", A.employees)` est appelé
- **Sauvegarde** : après mutation de `A.overrides` → `ls("cmc_ov", A.overrides)` est appelé

### 3. Qualité du code
- Pas de `console.log` oublié (sauf dans des blocs de debug intentionnels)
- Pas de `debugger` statement
- Pas de code commenté inutile laissé
- Pas de fonctions dupliquées
- Pas de variables déclarées mais jamais utilisées dans le diff
- Les template literals `${}` sont correctement fermés

### 4. Intégrité des données
Si le diff touche `DEF_EMP`, `SEED_APR2026`, `DEF_CHEFS_T`, ou `DEF_TEAMS` :
- Vérifier que les IDs sont uniques
- Vérifier que les codes de shift sont valides (22/6, 19/4, 16/3, 14/19, 20/5, 16/22, RH, R, CP, M, AF, RRT + variantes avec *)
- Vérifier que les équipes référencées existent

### 5. Cohérence des versions
Si `APP_VER` ou `DATA_VER` est modifié :
- Vérifier que la version ne diminue pas
- Si `DATA_VER` change, vérifier qu'une migration correspondante existe

## Format de sortie

```
📋 Revue pré-commit
====================
Fichiers modifiés : N
Lignes ajoutées : +X | Lignes supprimées : -Y

[✅/⚠️/❌] Sécurité XSS
[✅/⚠️/❌] Conventions projet
[✅/⚠️/❌] Qualité code
[✅/⚠️/❌] Intégrité données
[✅/⚠️/❌] Versions cohérentes

Détail :
  - [problème éventuel 1]
  - [problème éventuel 2]

Verdict : ✅ PRÊT À COMMIT / ❌ CORRECTIONS NÉCESSAIRES
```
