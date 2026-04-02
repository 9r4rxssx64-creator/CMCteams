---
name: find-employee
description: Recherche un employé CMCteams par nom, matricule ou équipe dans index.html. Affiche toutes ses données (équipe, poste, planning, overrides).
argument-hint: [nom-ou-matricule]
disable-model-invocation: false
allowed-tools: Read Grep Glob
---

# Recherche Employé — CMCteams

Recherche l'employé "$ARGUMENTS" dans le code source d'index.html.

## Étapes

1. **Rechercher dans DEF_EMP** : Chercher le nom ou l'ID dans la constante `DEF_EMP` d'index.html
   - Utiliser Grep avec le pattern `$ARGUMENTS` (insensible à la casse) dans index.html
   - Si c'est un matricule (ex: U00001), chercher l'ID exact
   - Si c'est un nom, chercher dans les champs `name`

2. **Extraire les informations** :
   - `id` : matricule SBM
   - `name` : nom complet
   - `team` : équipe (1-10, r1-r13, c1-c13)
   - `post` : poste (BRTP+K, etc.)
   - `chef` : est chef d'équipe ?
   - `family` : famille (bj, roulette, cmc)

3. **Chercher dans DEF_CHEFS_T** : Vérifier si l'employé apparaît dans les lignes de départ

4. **Chercher dans SEED_APR2026** : Vérifier s'il a un planning seedé pour avril 2026

5. **Résultat** : Afficher un résumé clair avec toutes les données trouvées

## Format de sortie

```
👤 NOM PRENOM (ID)
   Équipe: X | Poste: Y | Chef: oui/non
   Famille: bj/roulette/cmc
   Ligne de départ: position N dans équipe X
   Planning avril 2026: [résumé des premiers jours]
```
