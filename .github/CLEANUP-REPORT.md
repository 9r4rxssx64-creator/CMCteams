# Compte-rendu du menage automatique

Genere le 2026-09-07 00:15 UTC par auto-merge-claude.yml.

## Branches


**Cause exacte du refus de suppression** (premiere occurrence, `claude/actions-done-doc`) :
```
remote: error: GH013: Repository rule violations found for refs/heads/claude/actions-done-doc.        
remote: Review all repository rules at https://github.com/9r4rxssx64-creator/CMCteams/rules?ref=refs%2Fheads%2Fclaude%2Factions-done-doc        
remote: 
remote: - Cannot delete this branch        
remote: 
To https://github.com/9r4rxssx64-creator/CMCteams
 ! [remote rejected]     claude/actions-done-doc (push declined due to repository rule violations)
error: failed to push some refs to 'https://github.com/9r4rxssx64-creator/CMCteams'
```

> **Ce n'est pas un probleme de jeton** : une **regle du depot** interdit la suppression.
> Aucun acces (session, connecteur, CI) ne passe outre. Reglages -> Rules -> Rulesets.
> Ruleset(s) concerne(s) : `16725169`
> On arrete de tenter les autres a chaque livraison ; ca repartira seul si la regle change.


| vues | supprimees | gardees |
|---:|---:|---:|
| 375 | 0 | 140 |

Echecs de suppression : **1**

Non tentees (plafond, ou regle du depot) : **234**

## Annulations automatiques dormantes


**0 fermee(s), 0 en echec.**
