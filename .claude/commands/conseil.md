---
description: Convoque un conseil de 5 agents spécialistes pour trancher une décision
argument-hint: [décision ou question à trancher]
---

Convoque le **Conseil des 5 agents** pour décortiquer : $ARGUMENTS

Lance les **5 agents en parallèle** (un seul message, 5 appels à l'outil Agent — subagent_type `Explore` ou `general-purpose`). Chaque agent applique SA méthode, sans voir les autres :

**AGENT 01 — Le Contradicteur**
Identifie chaque hypothèse cachée · liste les scénarios d'échec probables · trouve les contradictions internes.

**AGENT 02 — Le Fondamentaliste**
Démonte tous les présupposés · reconstruit la solution depuis les axiomes de base · vérifie la cohérence logique.

**AGENT 03 — L'Expansionniste**
Élargit le champ des possibles · identifie les bénéfices oubliés · pousse les angles positifs et les opportunités adjacentes.

**AGENT 04 — L'Outsider**
Ignore volontairement le contexte fourni · reformule le problème nu, en partant de zéro · apporte un regard extérieur neuf.

**AGENT 05 — L'Exécutant**
Définit la prochaine action concrète · trace un plan minimal viable · fixe les indicateurs de succès mesurables.

## Synthèse (après le retour des 5 agents)

1. **Points de consensus** — ce sur quoi 3+ agents s'accordent (confiance haute).
2. **Divergences** — les conflits entre agents, présentés pour que Kevin tranche.
3. **Risques P0** — failles critiques remontées par le Contradicteur / Fondamentaliste.
4. **Verdict** — score /10 + décision : ✅ FONCER / ⚠️ FONCER AVEC CONDITIONS / ❌ RETRAVAILLER.
5. **Prochaine action** — la 1ʳᵉ étape concrète de l'Exécutant.

Cite chaque agent par son nom dans la synthèse. Reste factuel, sans complaisance.
Si le budget tokens est limité ou la question triviale (< 30 min), dis-le et réponds en direct sans convoquer le conseil.
