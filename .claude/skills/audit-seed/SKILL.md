---
name: audit-seed
description: Audit complet de l'intégrité des données SEED et planning dans index.html. Vérifie cohérence employés, codes valides, jours de repos par équipe.
disable-model-invocation: false
allowed-tools: Read Bash Grep
---

# Audit SEED & Planning — CMCteams

Audit complet de l'intégrité des données de planning dans index.html.

## Vérifications à effectuer

### 1. Comptage des employés
- Compter les entrées dans `DEF_EMP`
- Vérifier que le total correspond (258 attendus)
- Lister les familles : BJ (éq 1-10), Roulette (r1-r13), CMC (c1-c13)

### 2. Codes de planning valides
Extraire le SEED et vérifier que chaque code est dans la liste autorisée :
```
22/6, 19/4, 16/3, 14/19, 20/5, 16/22, RH, R, CP, M, AF, RRT
```
Plus les variantes avec `*` (CDP) : `22/6*`, `19/4*`, `16/3*`, `14/19*`, `20/5*`, `16/22*`

### 3. Complétude du SEED
- Chaque employé doit avoir 30 jours (avril) ou 31 jours selon le mois
- Aucun jour ne doit être vide ou `undefined`

### 4. Cohérence des jours de repos BJ
Vérifier les patterns de repos par équipe miroir :

| Équipes | Jours de repos |
|---------|---------------|
| 1 et 6 | 5, 6, 11, 12, 17, 18, 23, 24, 29, 30 |
| 2 et 7 | 3, 4, 9, 10, 15, 16, 21, 22, 27, 28 |
| 3 et 8 | 1, 2, 7, 8, 13, 14, 19, 20, 25, 26 |
| 4 et 9 | 2, 3, 8, 9, 14, 15, 20, 21, 26, 27 |
| 5 et 10 | 4, 5, 10, 11, 16, 17, 22, 23, 28, 29 |

### 5. Cohérence DEF_EMP ↔ DEF_CHEFS_T
- Chaque employé de DEF_EMP doit avoir une entrée dans DEF_CHEFS_T (sauf absents intentionnels)
- Aucun nom fantôme dans DEF_CHEFS_T qui ne serait pas dans DEF_EMP

### 6. Résultat
Afficher un tableau récapitulatif :
```
| Contrôle                    | Résultat |
|-----------------------------|----------|
| Nombre d'employés DEF_EMP   | X / 258  |
| Codes valides SEED          | ✅ / ❌  |
| Jours complets SEED         | X / 258  |
| Repos BJ cohérents          | ✅ / ❌  |
| DEF_EMP ↔ DEF_CHEFS_T      | ✅ / ❌  |
```

Lister les anomalies détaillées si trouvées.
