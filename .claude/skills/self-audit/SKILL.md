---
name: self-audit
description: Auto-évaluation de la session de travail Claude. Vérifie la cohérence des actions effectuées, les oublis potentiels, et propose des améliorations. À invoquer en fin de session ou après une série de modifications.
disable-model-invocation: true
allowed-tools: Read Bash Grep
---

# Self-Audit — Auto-évaluation de session

**Invocation** : `/self-audit` — évalue la qualité du travail effectué dans cette session.

## Vérifications

### 1. Fichiers modifiés dans cette session
```bash
git diff --name-only HEAD~5 2>/dev/null || git diff --name-only
git log --oneline -5
```
Pour chaque fichier modifié, vérifier :
- Le changement est-il cohérent avec la demande de l'utilisateur ?
- Y a-t-il des modifications non demandées ?

### 2. Complétude du travail
- La demande de l'utilisateur a-t-elle été entièrement satisfaite ?
- Y a-t-il des parties laissées incomplètes ?
- Les TODO/FIXME dans le code ont-ils été résolus ?

### 3. Documentation mise à jour
Si des changements significatifs ont été faits :
- RELAIS.md doit-il être mis à jour ?
- CLAUDE.md doit-il refléter de nouvelles conventions ?
- Les commentaires dans le code sont-ils à jour ?

### 4. Cohérence des versions
```bash
grep -o 'APP_VER="[^"]*"' index.html
grep -o 'DATA_VER=[0-9]*' index.html
```
- La version reflète-t-elle les changements effectués ?
- Si des données ont changé, DATA_VER a-t-il été incrémenté ?

### 5. Tests mentaux
Pour chaque modification de code :
- **Cas nominal** : le code fonctionne-t-il pour le cas standard ?
- **Cas limite** : que se passe-t-il avec 0 employés ? Un mois sans SEED ? Un employé sans équipe ?
- **Régression** : les fonctionnalités existantes sont-elles préservées ?
- **Mobile** : l'affichage fonctionne-t-il sur petit écran ?

### 6. Sécurité
- Aucune clé API commitée ?
- `esc()` utilisé pour tout contenu dynamique dans innerHTML ?
- Pas d'`eval()` ou de `Function()` ajouté ?

### 7. Performance
- Pas de boucles O(n²) ajoutées sur les 258 employés × 30 jours ?
- Pas de `render()` appelé en boucle ?
- Pas de recalcul inutile dans les fonctions de vue ?

## Rapport

```
🔎 Self-Audit — Session du [date]
===================================

Modifications effectuées :
  - [liste des changements]

Vérifications :
  [✅/⚠️/❌] Complétude de la demande
  [✅/⚠️/❌] Pas de modifications non demandées
  [✅/⚠️/❌] Documentation à jour
  [✅/⚠️/❌] Versions cohérentes
  [✅/⚠️/❌] Tests mentaux passés
  [✅/⚠️/❌] Sécurité OK
  [✅/⚠️/❌] Performance OK

Actions recommandées :
  - [action 1 si nécessaire]
  - [action 2 si nécessaire]

Score global : X/7 ✅
```
