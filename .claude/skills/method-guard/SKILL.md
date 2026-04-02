---
name: method-guard
description: Agent gardien de méthodologie. Vérifie que Claude suit les bonnes pratiques du projet CMCteams — lecture avant édition, sauvegarde localStorage, conventions françaises, pas de sur-ingénierie. S'auto-invoque périodiquement.
user-invocable: false
allowed-tools: Read Grep
---

# Agent Gardien de Méthodologie

**INVOCATION AUTOMATIQUE** : Cet agent vérifie que les bonnes pratiques de travail sur CMCteams sont respectées.

## Règles fondamentales à vérifier

### 1. Lire avant d'éditer
- **JAMAIS** modifier index.html sans l'avoir lu d'abord
- Toujours lire la zone ciblée (±20 lignes) avant un Edit
- Comprendre le contexte existant avant de proposer un changement

### 2. Pas de sur-ingénierie
- Ce projet est un SPA monofichier vanilla JS — **pas de framework, pas de build**
- Ne JAMAIS proposer : npm, webpack, React, TypeScript, ESLint, Prettier, etc.
- Ne JAMAIS créer de fichiers JS/CSS séparés sauf demande explicite
- Ne JAMAIS refactorer du code qui fonctionne sans qu'on le demande
- 3 lignes similaires > 1 abstraction prématurée

### 3. Conventions françaises
- UI strings : toujours en français
- Commentaires dans le code : français
- Commit messages : français (sauf technique pur)
- Noms de variables internes : abbréviations françaises OK (eq, emp, mois, ann)

### 4. Sauvegardes localStorage obligatoires
Après TOUTE mutation de données, vérifier l'appel correspondant :
```
A.employees modifié → ls("cmc_e", A.employees)
A.teams modifié → ls("cmc_t", A.teams)  
A.overrides modifié → ls("cmc_ov", A.overrides)
A.passwords modifié → ls("cmc_pw", A.passwords)
A.chatMsgs modifié → ls("cmc_chat", A.chatMsgs)
```

### 5. Protection XSS systématique
Tout contenu utilisateur dans innerHTML → `esc()` obligatoire.
Ne jamais écrire : `innerHTML = ... + nom + ...`
Toujours écrire : `innerHTML = ... + esc(nom) + ...`

### 6. Versionning
- Correction de bug → bump patch (v8.15 → v8.16)
- Nouvelle fonctionnalité → bump minor (v8.15 → v9.0)
- Changement de schema données → bump DATA_VER + migration

### 7. Test mental avant chaque changement
Avant de modifier du code, se poser :
1. Est-ce que je comprends ce que fait le code actuel ?
2. Mon changement peut-il casser autre chose ?
3. Ai-je vérifié les fonctions qui appellent/sont appelées par ce code ?
4. Le changement est-il le plus simple possible ?

### 8. Pas d'effets de bord
- Ne pas modifier des données hors du scope demandé
- Ne pas ajouter de features non demandées
- Ne pas "améliorer" du code adjacent
- Ne pas ajouter de commentaires/docstrings non demandés

## Quand signaler un problème

Si une de ces règles est violée dans le travail en cours :
1. Signaler immédiatement à l'utilisateur
2. Proposer la correction
3. Ne PAS continuer tant que le problème n'est pas résolu
