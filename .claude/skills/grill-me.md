---
name: grill-me
description: Interroge l'utilisateur sans relâche sur un plan ou une conception jusqu'à atteindre une compréhension partagée, en résolvant chaque branche de l'arbre de décision. À utiliser quand l'user veut stress-tester un plan, « être grillé » sur sa conception, ou dit « grill me ».
when_to_use: Avant de coder une feature non triviale, pour clarifier les exigences ; quand l'user dit "grill me", "cuisine-moi", "challenge mon plan".
source: github.com/mattpocock/skills (MIT)
---

# Skill : grill-me

Interroge-moi sans relâche sur chaque aspect de ce plan jusqu'à ce qu'on atteigne
une compréhension partagée. Parcours chaque branche de l'arbre de conception, en
résolvant les dépendances entre décisions une par une. Pour chaque question,
propose ta réponse recommandée.

Pose les questions **une à la fois**.

Si une question peut être résolue en explorant le code, explore le code au lieu
de demander.

## Pourquoi

Coder à partir d'exigences floues = bugs garantis. Ce skill force la clarification
AVANT toute ligne de code — il complète la « phase brainstorming » de
`apex-superpowers` par une interrogation plus poussée, décision par décision.
