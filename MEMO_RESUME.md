# 📌 Mémo de reprise — 2026-04-09

## Dernière version stable
**v9.52** — commit `TBD` (ce commit) sur `main`

## État général
- Audit import PDF manuel effectué (agent rate-limited)
- 2 bugs utilisateur critiques fixés (cadena mdp + bouton œil viewAs)
- 1 bug import trouvé et fixé (détection section BACCARA manquante)
- Règle permanente "memo pré-limite" inscrite dans `~/.claude/CLAUDE.md`

## Tâche en cours
**Phase 2** — 3 rôles experts (Planning → Designer → IT en dernier)
Sur demande utilisateur : nouvelle passe d'améliorations après la phase 1 (v9.45).

## Fait ✅ (session en cours)
- `v9.47` Historique employé + Export paie CSV enrichi + Vue "Qui est libre ?"
- `v9.48` Focus-visible + skip-link + reduced-motion + tablet breakpoint + transitions
- `v9.49` Lisibilité prioritaire (opacité renforcée) + lazy-load PDF.js
- `v9.50` Département "Jeux de table" extensible + fonds perso par employé
- `v9.51` Diaporama fond d'écran 5s crossfade
- `v9.52` Fix cadena/mdp + œil viewAs fiche employé + détection BACCARA à l'import + règle mémo

## À faire 🔲 (Phase 2 — 3 rôles experts)

### Rôle 1 : Expert Planning (NOUVEAUX items — pas ceux de v9.45)
- [ ] **Templates de planning** : sauvegarder un mois comme template, réutiliser
- [ ] **Rappels auto retardataires** : détection employés non inscrits depuis X jours
- [ ] **Calcul auto jours de congés restants** par employé (solde CP)
- [ ] **Détection doublons à l'import** (employé déjà importé)
- [ ] **Export ICS complet** par équipe (pas seulement personnel)
- [ ] **Validation horaires** (alertes si incohérence chef/équipe)
- [ ] **Notifications RH automatiques** (anniversaires, retraites approchantes)
- [ ] **Calendrier événements** affluence (Grand Prix, Pâques, Fêtes)

### Rôle 2 : Designer (NOUVEAUX items)
- [ ] **Refactorer styles inline vers tokens** (:root CSS déjà défini v9.45)
- [ ] **Dark/Light mode toggle** optionnel
- [ ] **Toast system** CSS cohérent (classes .toast-success/error/info)
- [ ] **Illustrations custom** (empty states plus humains)
- [ ] **Loading skeletons actifs** sur les listes (déjà classes, pas utilisées)
- [ ] **Onboarding tour** pour nouveaux employés
- [ ] **Micro-animations** success/error feedback

### Rôle 3 : IT/Sécurité (en dernier)
- [ ] **SRI hash exact** sur PDF.js CDN (via WebFetch)
- [ ] **Audit accessibility WCAG AAA** complet
- [ ] **Lighthouse perf** audit + fixes
- [ ] **Lazy-load autres modules** lourds (stats, audit, etc.)
- [ ] **Service Worker** cache strategy améliorée (stale-while-revalidate)
- [ ] **Preload critical CSS** inline / rest async
- [ ] **HTTP/2 hints** (preconnect Firebase, Anthropic)
- [ ] **Meilleure error recovery** (retry + fallback sur fbWrite)

## Prochaine étape concrète
**Phase 2 Rôle 1 — Planning** : commencer par `templates de planning` (feature la plus demandée RH). Implémenter :
1. `savePlanningTemplate(name)` — sauve le mois courant comme template
2. `listPlanningTemplates()` — liste les templates disponibles
3. `applyPlanningTemplate(tplId)` — applique un template au mois courant
4. Vue admin `vTemplates` + entrées menu

## Bugs actifs (non résolus ou à surveiller)
- **PORTA** : historiquement doublon dans vDeparts. Fixé v9.27/v9.30/v9.40 avec dédup id+nom. Reste à surveiller.
- **Import pattern O'BRIEN** : pattern `/^[A-Z][A-Z\- ]+\s[A-Z]{1,2}$/` rejette les apostrophes, mais `_nImp()` les normalise en espaces donc OK.

## Décisions architecturales importantes
- **DEPTS extensible** : `DEPTS[0] = "jeux_de_table"` est le seul actif. Valets/Machines à sous préparés mais non utilisés.
- **calcDepPos** utilise la même logique que vDeparts (dédup id+nom, chefEmps filtered) — NE PAS toucher sans tester les deux ensemble.
- **gpl(y, m)** accepte params optionnels depuis v9.46 — utiliser cette signature propre, pas l'IIFE qui mute A.year/A.month.
- **Cache `_conflictCache`** dans detectRepoConflicts — signature JSON pour invalidation auto.

## Contexte utilisateur important
- Utilisateur : DESARZENS K (U11804), admin du Casino de Monte-Carlo
- 258 employés, 36 équipes (10 BJ + 13 roulettes + 13 CMC)
- Priorité absolue : **lisibilité des infos** sur fond photo (opacité cards .82/.88)
- iPhone PWA avec safe-area iOS
- Règle : jamais oublier une demande, TodoWrite immédiat, audit avant release

## Commandes utiles
```bash
# Syntax check JS
node -e "const fs=require('fs');const html=fs.readFileSync('/home/user/CMCteams/index.html','utf8');const s=html.lastIndexOf('<'+'script>'),e=html.lastIndexOf('</'+'script>');fs.writeFileSync('/tmp/test.js',html.slice(s+8,e));" && node --check /tmp/test.js

# Status
git log --oneline -10
git status
wc -c /home/user/CMCteams/index.html
```

## Méthodologie (rappel)
Voir `~/.claude/CLAUDE.md` (règle globale expert 9 étapes) et `CLAUDE.md` projet (règles CMCteams spécifiques).

**Règle mémo** : ce fichier DOIT être mis à jour avant chaque fin de session ou approche de limite crédit.
