---
name: planning-summary
description: Génère un résumé rapide du planning d'un mois donné. Statistiques par équipe, absences, répartition des shifts.
argument-hint: [mois année] (ex: avril 2026)
disable-model-invocation: false
allowed-tools: Read Grep Bash
---

# Résumé Planning — CMCteams

Génère un résumé statistique du planning pour le mois demandé : $ARGUMENTS

## Données à extraire

### 1. Identifier le SEED du mois
- Chercher `SEED_APR2026` ou équivalent dans index.html
- Si pas de SEED spécifique, vérifier les overrides

### 2. Statistiques globales
- Nombre total d'employés planifiés
- Nombre d'employés par famille (BJ, Roulette, CMC)

### 3. Répartition des absences
Compter par type d'absence :

| Type | Code | Nombre d'employés |
|------|------|-------------------|
| Maladie | M | ? |
| Formation | AF | ? |
| Congé payé | CP | ? |
| Repos spécial | RRT | ? |

### 4. Répartition des shifts par équipe BJ
Pour chaque équipe BJ (1-10), compter la fréquence de chaque code horaire.

### 5. Employés absents tout le mois
Lister les employés dont TOUS les jours sont M, CP, AF ou R.

### 6. Format de sortie

```
📅 Planning [MOIS] [ANNÉE]
================================
Employés planifiés : XXX / 258
BJ: XX | Roulette: XX | CMC: XXX

📊 Absences :
  Maladie (M)    : X employés
  Formation (AF) : X employés
  Congé (CP)     : X employés

📋 Par équipe BJ :
  Éq.1 : X actifs, Y absents
  Éq.2 : X actifs, Y absents
  ...

⚠️ Anomalies détectées : (si applicable)
  - Employé X sans planning
  - Équipe Y avec repos incohérents
```
