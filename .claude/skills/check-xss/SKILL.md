---
name: check-xss
description: Analyse index.html pour détecter les vulnérabilités XSS potentielles. Vérifie que esc() est utilisé pour tout contenu utilisateur injecté dans innerHTML.
disable-model-invocation: false
allowed-tools: Read Grep Bash
---

# Audit Sécurité XSS — CMCteams

Analyse le code JavaScript d'index.html pour détecter les vulnérabilités XSS.

## Vérifications

### 1. innerHTML sans esc()
Chercher tous les patterns `innerHTML` et `+=` qui injectent des variables sans passer par `esc()` :
- Pattern dangereux : `innerHTML = ... + variable + ...` sans `esc(variable)`
- Pattern dangereux : template literals avec `${variable}` dans innerHTML sans `esc()`

### 2. Sources de données utilisateur
Identifier les sources de contenu utilisateur :
- `A.chatMsgs` (messages du chat)
- Champs de saisie (input/textarea)
- Noms d'employés modifiés par l'admin
- Données importées du PDF

### 3. Utilisation correcte de esc()
Vérifier que `esc()` est appliqué sur :
- Tous les noms affichés (`emp.name`)
- Messages du chat
- Données importées avant affichage
- Tout contenu dans les attributs HTML (title, placeholder, etc.)

### 4. Patterns sûrs (ignorer)
- Constantes hardcodées (HTML statique)
- Valeurs numériques (dates, compteurs)
- Codes de shift (CODES constant)
- IDs d'employés (format UxxxXX contrôlé)

## Résultat

```
🔍 Audit XSS — CMCteams
========================
innerHTML trouvés : N
  - Sans esc() : X (⚠️ à vérifier)
  - Avec esc() : Y (✅)
  - Statiques : Z (✅ pas de variable)

Détail des cas suspects :
  Ligne XXX : [extrait du code] — ⚠️ variable non échappée
```

Proposer un correctif pour chaque cas suspect.
