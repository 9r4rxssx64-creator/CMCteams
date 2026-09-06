# Compte-rendu du compactage des branches

Genere le 2026-09-06 20:44 UTC par auto-merge-claude.yml.

| Mesure | Valeur |
|---|---:|
| Branches `claude/*` vues apres fetch | 371 |
| Supprimees | 0 |
| Gardees (recentes, non-ancetres, ou protegees) | 136 |

Si `vues` vaut 0 : le fetch n'a pas ramene les branches.
Si `vues` est correct mais `supprimees` vaut 0 : soit tout est
deja propre, soit le jeton n'a pas le droit de supprimer une
reference — c'est CE cas qu'il faut distinguer, et que ce
fichier rend enfin visible.
