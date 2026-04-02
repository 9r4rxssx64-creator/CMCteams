---
name: bump-version
description: Incrémente APP_VER et/ou DATA_VER dans index.html. Gère la version sémantique et ajoute un bloc de migration si DATA_VER change.
argument-hint: [type: patch|minor|major|data]
disable-model-invocation: false
allowed-tools: Read Edit Grep
---

# Bump Version — CMCteams

Incrémente la version de l'application dans index.html.

## Arguments
- `$ARGUMENTS` : type de bump
  - `patch` : v8.15 → v8.16 (corrections mineures)
  - `minor` : v8.15 → v9.0 (nouvelles fonctionnalités)
  - `major` : v8.15 → v9.0 (changement majeur — même que minor pour ce projet)
  - `data` : incrémente DATA_VER (force migration localStorage)
  - `both` : incrémente APP_VER (patch) ET DATA_VER

## Étapes

1. **Lire la version actuelle** dans index.html :
   - Chercher `APP_VER = "vX.Y"`
   - Chercher `DATA_VER = N`

2. **Calculer la nouvelle version** selon le type demandé

3. **Modifier index.html** :
   - Mettre à jour `APP_VER`
   - Si DATA_VER change, mettre aussi à jour `DATA_VER`

4. **Si DATA_VER change**, vérifier qu'un bloc de migration existe dans `migrateEmployees()` :
   - La migration doit gérer le nouveau DATA_VER
   - Rappeler à l'utilisateur d'ajouter la logique de migration si nécessaire

5. **Confirmer** les changements :
```
Version : vX.Y → vX.Z
DATA_VER : N → M (si changé)
```

## Règles
- Ne JAMAIS décrémenter une version
- APP_VER suit le format `vX.Y` (pas de semver strict)
- DATA_VER est un entier simple
- Toujours sauvegarder après modification
