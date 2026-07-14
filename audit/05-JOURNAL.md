# audit/05 — JOURNAL (décisions, hypothèses, limites, auto-critique)

## Décisions
1. **Le dépôt n'est pas React** (0 `.jsx`, pas de `src/`, react absent). J'ai suivi la Loi 2 : au lieu d'appliquer le brief à la lettre (installer vitest+RTL+Playwright+Error-Boundary React), j'ai **adapté l'audit à la stack réelle** (SPA vanilla mono-fichier). Installer une stack React aurait violé la Loi 4.
2. **Ne pas réinstaller une prévention déjà présente** : le dépôt a déjà 121 workflows dont `gitleaks.yml`, `semgrep.yml`, `strix-scan.yml`, `cmc-runtime-audit.yml`, `audit-live.yml`, + `CLAUDE.md` (143 leçons). La Phase 8 du brief existe déjà à ~90 %. J'ai **vérifié** son existence plutôt que la recréer.
3. **Branche `claude/audit-passe-1`** (préfixe `claude/` au lieu du `audit/passe-1` du brief) pour rester compatible avec l'automatisation du dépôt (auto-merge/cleanup ne gèrent que `claude/*`) — consigné ici par honnêteté.
4. **Aucun P0 fabriqué.** Après vérif réelle, le P0-absolu du brief (clé API en dur) est **absent**. Je le dis, plutôt que d'inventer un finding pour « faire riche ».
5. **Pas de réécriture de composants design à l'aveugle** : sur une SPA de prod 3,3 Mo sans mesure pixel live, ce serait Loi 1/Loi 4 violées. Je **recommande de mesurer d'abord** (axe-core live).

## Hypothèses écrites (Loi 2)
- 🔴 La clé IA direct-navigateur est **la clé de Kevin** (admin), pas une clé partagée multi-utilisateurs → risque circonscrit à son appareil. À confirmer avec Kevin.
- 🔴 Les ~60 vues sans test dédié (studios, live, geo, stats secondaires) **fonctionnent** mais ne sont pas prouvées → angle mort assumé.

## Ce que je N'AI PAS pu vérifier cette passe
- Contraste réel / rendu pixel / axe-core (nécessite la passe live `audit-live.yml` en CI — non déclenchée ici).
- `npm audit` des devDeps (outillage non servi au client — faible priorité).
- Les cas métier « 2 croupiers même table » / « CMC+CDP simultané » en **runtime réel** (pas de test dédié → 🔴).
- Exhaustivité fonctionnelle des 102 vues : le gate `test:ci` couvre le **cœur** (import/parsing/départs/équipes/auth), pas les 60 vues périphériques.

## Auto-critique honnête
- **Le point le plus faible de mon audit est** : la couverture fonctionnelle. J'ai prouvé le cœur métier (import/départs/équipes/auth via le gate maison), mais **~60 des 102 vues n'ont aucun test dédié** ; je ne les ai pas toutes exercées en runtime cette passe (budget d'une session vs app de 49 630 lignes). La Loi 3 (exhaustivité) n'est donc **pas** pleinement satisfaite sur les vues périphériques — je le déclare au lieu de le masquer.
- **Ce que je n'ai pas pu vérifier est** : le contraste/design en pixel réel, le RGPD/rétention en runtime, et 2 cas métier de conflit d'affectation.
- **Ce dont je ne suis pas certain est** : que les 16 `innerHTML` en concat sans `esc()` soient TOUS sûrs — je les ai échantillonnés (statiques/contrôlés-app), pas prouvés un par un ; d'où le finding F-C2 qui propose un **garde CI** plutôt qu'une affirmation.

## Prochaine passe (recommandée, non faite)
1. Livrer le **garde CI XSS** (F-C2) + **axe-core** dans un smoke Playwright (design measurable).
2. Écrire 3-4 tests métier manquants : conflit table/horaire, CMC+CDP simultané, vRGPD export/effacement.
3. Rendre le proxy IA par défaut (F-C1).
