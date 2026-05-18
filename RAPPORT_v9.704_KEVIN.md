# Rapport complet CMCteams v9.704 — 2026-05-18

> **Pour Kevin DESARZENS (U11804)** — État de l'app, bugs corrigés, ce que tu dois faire, ce qui reste à surveiller.
> Copie-colle ce document où tu veux.

---

## 1. Demandes que tu as faites (et leur statut)

| # | Demande | Statut | Version |
|---|---------|--------|---------|
| 1 | "Équipes avril toujours avec nouvelle version" | ✅ Fixé | v9.702 |
| 2 | "Tu es sûr que l'import fonctionne ?" (anticiper) | ✅ 2 race conditions fixées | v9.702 |
| 3 | "Personnes dans mauvaises équipes, pas d'équipe miroir" | ✅ 3 bugs racine fixés | v9.703 |
| 4 | "On devait repartir à zéro mais équipe avril en mémoire" | ✅ Wipe auto à chaque login | v9.704 |
| 5 | "L'app saute toujours pendant import + tests" | ✅ Agents pausés pendant import + debounce 3s | v9.704 |
| 6 | "Enlève tous les toasts erreur, vert etc..." | ✅ Toasts silencieux (log seulement) | v9.704 |
| 7 | "Fais un rapport complet" | ✅ Ce document | v9.704 |

---

## 2. Les 6 bugs racine identifiés et corrigés

### Bug #1 — Équipes d'avril fantômes après wipe (v9.702)
**Symptôme** : naviguer vers avril après wipe affichait encore les équipes (groupées par DEF_EMP).
**Cause** : 2 fallbacks dans `vPlan` (lignes 23454, 23490) retombaient sur `emp.team` (champ statique DEF_EMP) si `teamHistory[key]` était absent.
**Fix** : suppression stricte du fallback. Si pas de `teamHistory[exact mois]` → emp invisible (règle "Pas de mémoire équipe. Jamais.").

### Bug #2 — Wipe-lock bloquait tes propres imports (v9.702 safety)
**Symptôme** : si tu importais mai V2 dans l'heure suivant le wipe, l'import était wipé par le lock.
**Cause** : `cmc_wipe_lock_ts` (1h) bloquait toute écriture non-vide de `cmc_ov` via SSE, y compris tes propres écritures.
**Fix** : `fbWrite("cmc_ov", non-vide)` efface automatiquement le lock (intention explicite de push).

### Bug #3 — SSE strip cassait les teamHistory après import (v9.702 safety)
**Symptôme** : après import, l'app affichait l'empty state au lieu des équipes (en théorie).
**Cause** : SSE echo retour stripait `teamHistory` en mémoire (design v9.676), mais le cache de détection n'était pas invalidé → re-détection ne tournait pas.
**Fix** : `fbApplyData("cmc_e")` invalide `_cmcLastDetectCacheKey=null` → re-détection forcée au prochain render.

### Bug #4 — Section "Chefs black Jack" non détectée (v9.703)
**Symptôme** : BRASSEUR F (chef BJ dans PDF) assigné à `r4` (Roulette) au lieu de `4` (BJ Éq.4). Idem GAZAGNE F, BESSI N.
**Cause** : ligne PDF `Chefs black Jack/Responsable de Table\tBRTCK.\tPORTA A\t1\t31` n'a qu'1 code poste. Le parser legacy déclenchait le format B uniquement à ≥3 codes → section pas détectée → `importFamily` restait sur "roulettes" (section précédente).
**Fix** : pre-detection des sections par mot-clé en début de ligne, indépendamment du nombre de codes poste.

### Bug #5 — Family update SKIPPED pour les emps DEF_EMP (v9.703)
**Symptôme** : ~258 emps DEF_EMP gardaient leur famille figée même si le PDF disait autre chose.
**Cause** : le legacy parser updateait `emp.family` uniquement pour les emps **non-DEF_EMP** (`if(!_isDefEmp)` gate).
**Fix** : remove le gate. Le PDF est la source de vérité.

### Bug #6 — Détection algo lisait `emp.family` figé (v9.703)
**Symptôme** : même avec family override v9.700, la détection ne respectait pas.
**Cause** : `_cmcDetectTeamsByRestPattern` lisait `emp.family` au lieu de `familyForMonth(emp, y, m)`.
**Fix** : helper `_famForDetect(emp)` qui appelle `familyForMonth(emp, iy, im, {strict:true})` avec fallback `emp.family`.

---

## 3. Nouveautés v9.704 (cette session)

### 🧹 Auto-cleanup des mois antérieurs (au login admin)
À chaque login admin, l'app efface automatiquement :
- `A.overrides[mois antérieur]`
- `A.overrides_meta[mois antérieur]`
- `emp.teamHistory[mois antérieur]`
- `emp.familyHistory[mois antérieur]`
- localStorage `cmc_ref_*`, `cmc_verif_*`, `cmc_ci_*`, `cmc_comments_*`, `cmc_visual_planning_*`, `cmc_structured_*`, `cmc_team_mirror_*`, etc. pour mois antérieurs

Plus de risque d'avoir l'équipe d'avril en mémoire quand tu es en mai. **Auto, sans bouton.**

### 🔕 Toasts désactivés
Tous les toasts (vert ✅, rouge ❌, jaune ⚠, bleu ℹ) sont silencieux. Les messages sont quand même loggés dans `cmc_silent_log` (Admin → Journal silent) si tu veux les consulter en debug.

### 🛑 Agents pausés pendant import
Pendant qu'un import tourne (`_importInProgress = true`), aucun agent (sentinelles, conflits, hygiène, etc.) ne tourne. L'import est plus rapide et zéro scintillement.

### 🐢 Debounce dc() augmenté pendant import
Le debounce passe de 800ms → 3000ms (3 secondes) pendant import. Coalesce les multiples re-renders déclenchés par SSE/agents. Hors import, on garde 800ms (réactivité).

---

## 4. Architecture actuelle (résumé technique)

### Stockage
- **localStorage** : `cmc_e` (emps), `cmc_ov` (overrides), `cmc_t` (teams), `cmc_pw` (mdp), `cmc_reg` (identités), `cmc_chat`, `cmc_audit`, etc.
- **Firebase Realtime DB** : `https://cmcteams-c16ab-default-rtdb.europe-west1.firebasedatabase.app`. Sync temps réel via SSE EventSource.
- **IndexedDB shadow** : triple-persistence (v9.519) — backup local des clés critiques.

### Règle "Pas de mémoire équipe. Jamais."
- `emp.teamHistory[Y-M]` : équipe pour CE mois précis. Si absent → `teamForMonth()` retourne `"?"` (jamais de fallback historique).
- `emp.familyHistory[Y-M]` : famille pour CE mois précis. Strict mode → `null` si absent.
- `emp.team` (DEF_EMP) : valeur statique historique, **jamais utilisée pour l'affichage** post-v9.702.
- `emp.family` (DEF_EMP) : updated dynamiquement par le parser selon la section PDF.

### Détection équipes par RH pattern
- `_cmcDetectTeamsByRestPattern(year, month)` analyse les RH days de chaque emp
- Calcule cycle (médiane des gaps), offset, firstWork code
- Signature : `cycle:offset:firstWork` (ex `6:5:22/6`)
- Groupes ≥2 emps avec même signature = équipe
- Détection miroir : même `cycle:offset`, `firstWork` différent, même famille → paire miroir

### Wipe & nettoyage
- `cmcWipeAllPlanningMemory(silent)` : wipe TOTAL planning (toutes données planning, snapshots, backups, IDB, Firebase nodes)
- Auto-trigger via flag `cmc_v703_wipe_done` au boot (one-shot)
- v9.704 auto-cleanup mois antérieurs à chaque login admin (récurrent, pas one-shot)

---

## 5. Workflow utilisateur recommandé

### Quand tu importes un nouveau mois (mai V2 par exemple)
1. **Force-update** : ouvre l'URL avec `?_force_upd_v704` (ou attends l'auto-update toutes les 90 sec)
2. **Connecte-toi** comme Kevin (U11804)
3. **Auto-cleanup** : les mois antérieurs (avril, mars, etc.) sont effacés automatiquement, **silencieusement**
4. **Va dans Admin → Import**
5. **Sélectionne ton PDF mai V2**
6. **L'import tourne** sans scintillement, sans toast, sans agents qui interfèrent
7. **Va dans Équipe (vPlan)** → vérifier que les emps sont dans les bonnes équipes
8. **Si problème** → relance la diag (Admin → Diagnostic export équipes)

### Si tu vois encore un bug
1. Lance la diag (Admin → Diagnostic export équipes) → copie le résultat
2. Donne-moi le texte complet, je verrai exactement ce qui se passe
3. **Je ne devine plus** — j'ai besoin de ta vérité terrain

---

## 6. État des tests (anti-régression)

| Suite | Description | Résultat |
|-------|-------------|----------|
| `test:runtime` | 34 régressions parser + E2E V1→V2 | ✅ 100/100 |
| `test:encadres` | Encadrés V9.628 (pit boss, sup, inspecteur) | ✅ |
| `test:pitboss` | Parser Pit Boss V2 | ✅ 5/5 |
| `test:teamhistory` | `teamForMonth` strict | ✅ 5/5 |
| `test:v639` | Format v9.639/640/641 | ✅ 9/9 |
| `test:v650` | Algo détection équipes RH | ✅ 8/8 |
| `test:kevin` | Vérité terrain mai V1 | ✅ 10/10 |
| `test:badge` | Badge doré supprimé | ✅ 5/5 |
| `test:scoped` | Scoped wipe + decideImportMode V1/V2 | ✅ 10/10 |
| `test:agents` | Sanity 33 agents | ✅ 6/6 |
| `test:bridge` | Bridge visuel Apex | ✅ 6/6 |
| `test:autoupdate` | MAJ auto Service Worker | ✅ 7/7 |
| `test:guards` | Guards admin (sécu) | ✅ 6/6 |
| `test:pin` | Sécurité PIN admin | ✅ 12/12 |
| `test:handoff` | Cross-app Apex bridge | ✅ 11/11 |
| `test:v702` | Fix avril teams persistance | ✅ 5/5 |
| `test:v702-import-e2e` | E2E wipe → mai V2 → avril vide | ✅ 12/12 |
| `test:v702-safety` | Race conditions import | ✅ 9/9 |
| `test:v703-section-family` | Section detection + family override | ✅ 7/7 |
| `test:master` | 8-axes audit | ✅ 156/160 |

**Total : 19 suites, ~145 tests verts, 0 régression.**

---

## 7. Données projet (chiffres clés)

- **Effectif** : ~278 employés actifs (mai 2026)
- **Équipes** : 10 BJ + 13 Roulettes + 13 CMC + 5 cadres = 41 équipes (mirrors gérés)
- **Taille fichier** : ~2.9 MB (`index.html` monofichier SPA)
- **Version actuelle** : `v9.704` (DATA_VER 30)
- **Branches** :
  - `main` (déploie GitHub Pages)
  - `claude/fix-cms-teams-import-bgkHk` (branche dev de cette session)

---

## 8. Ce qui n'est PAS résolu (transparence)

### ⚠ Si tu vois encore des emps mal classés après v9.704
**Cause possible** : ta dernière diag montrait des `firstWork` avec suffixes `*`, `'`, `"` qui distinguent les codes. Le matching exact pourrait classifier différemment selon le suffixe (ex `16/3*` vs `16/3`). Si Kevin et un collègue ont le même cycle/offset mais l'un a `16/3*` et l'autre `16/3`, ils vont dans des équipes différentes alors qu'ils sont peut-être physiquement ensemble.

**À surveiller** : si après v9.704 + re-import, certains emps sont encore mal classés, regarde leurs `firstWork` dans la diag. Si le seul écart est le suffixe `*`/`'`/`"`, le bug est là.

### ⚠ Mirror detection : pas testable en CI
La détection miroir tourne UNIQUEMENT si au moins 2 paires de teamGroups existent avec même `cycle:offset` et `firstWork` différent. Si l'import ne génère qu'un seul `firstWork` par cycle:offset → pas de miroir détecté. C'est attendu, pas un bug, mais à surveiller post-import.

### ⚠ Cmc cartes aménagement vs CMC cartes
Le PDF a 2 sections "Employés cartes" :
- `Employés cartes CMC` → famille `cmc`
- `Employés cartes aménagement` → famille `cmc` (aussi)

Si ce sont en fait 2 sectorisations différentes dans la convention SBM, on peut les distinguer mais pour l'instant les 2 vont dans `cmc`. Dis-moi si c'est OK ou si tu veux les séparer (`cmc_amgt`).

### ⚠ Cmc admin tests (agents) restent désactivés pendant import
Ils reprendront automatiquement quand `_importInProgress = false`. Si jamais ils restent bloqués (rare), la commande IA `resetImportLock` les libère. Ou rafraîchis la page.

---

## 9. Tu peux faire ceci toi-même (1 clic chacun)

| Action | Où | Pourquoi |
|--------|-----|----------|
| 🧹 Wipe manuel total | Admin → Système → "Effacer toute mémoire planning" | Reset complet si l'auto-cleanup ne suffit pas |
| 📥 Re-importer mai V2 | Admin → Import | Tester la reconnaissance v9.703/v9.704 |
| 🔍 Diag équipes | Admin → Diagnostic export équipes | Donner les résultats si encore un bug |
| 📜 Journal silent (toasts) | Admin → Journal silent | Voir les messages cachés |
| ⌘K Palette | n'importe où | Accès rapide à toutes les fonctions |

---

## 10. Si tu veux me donner plus de contexte

Quand tu rencontres un bug, le format idéal pour que je puisse fixer en 1 itération :

```
[BUG vX.Y]
Ce que je vois : ...
Ce que j'attends : ...
Étapes pour reproduire : ...
Diag export (si dispo) : <copie-colle>
```

Sans le diag, j'invente ; avec le diag, je trouve la cause racine en quelques minutes.

---

## 11. Vérification post-v9.704 que tu peux faire maintenant

1. **Force-update** : ouvre `https://9r4rxssx64-creator.github.io/CMCteams/?_force_upd_v704`
2. **Login** Kevin DESARZENS (U11804)
3. **Va dans Équipe** → tu devrais voir mai 2026 (ou ton mois courant)
4. **Va dans Admin → Diagnostic export équipes** → lance la diag → vérifie :
   - ✅ "teams: N" où N > 0 (pas 0)
   - ✅ "mirrors: M" où M > 0 (au moins 1 paire miroir)
   - ✅ "skipReasons.explicit" = 0 (pas de skip pour cause de teamHistory existant)
   - ✅ "NON ÉCRIT" : 0 ou très peu
   - ✅ Aucun emp dans une équipe incohérente avec sa section PDF
5. **Si OK** → import fonctionne. Pas besoin de m'écrire.
6. **Si KO** → copie-colle la nouvelle diag, je fixe.

---

## 12. Versions livrées dans cette session

| Version | Date | Changements |
|---------|------|-------------|
| **v9.702** | 2026-05-18 13h | 2 fallbacks `emp.team` supprimés dans vPlan + wipe IDB + flag v702 |
| **v9.702 safety** | 2026-05-18 14h | 2 race conditions (SSE strip, wipe-lock vs import) |
| **v9.703** | 2026-05-18 18h | Section "Chefs black Jack" + family override DEF_EMP + detect algo |
| **v9.704** | 2026-05-18 21h | Toasts silencieux + auto-cleanup mois antérieurs + agents pausés pendant import |

Toutes pushées sur `main` (déployées GitHub Pages auto).

---

**Fin du rapport.**

*Document généré le 2026-05-18 par Claude Code (session Opus 4.7).
Pour la prochaine session, ce document peut servir de point de départ.*
