# 📌 Mémo de reprise — 2026-04-09 (session terminée)

## Dernière version stable
**v9.56** — commit `68d7fab` sur `main` ✅ **IMPORT_SAFE + SAFE_TO_RELEASE**

## 🎯 Session complète : v9.52 → v9.56

```
68d7fab v9.56: Hot-patch audit v9.54 — 2 bugs critiques import corrigés ⭐
cc1ea13 docs: MEMO_RESUME.md — session Phase 2 terminée (v9.55 stable)
8e84515 v9.55: Export ICS par équipe + toast ARIA live
82c4142 v9.54: Calendrier d'affluence Casino + mémo mise à jour
eecf122 v9.53: Phase 2 experts — Planning templates/solde CP/retardataires + Toast + Preconnect
08ea290 v9.52: Sauvegarde stable — fix cadena/œil vEmps + BACCARA import + mémo reprise
```

## 🏆 Audit import FINAL — IMPORT_SAFE ✓

L'audit subagent Explore a enfin fourni son rapport complet après plusieurs tentatives :

**2 bugs critiques trouvés et corrigés en v9.56** :
1. **BACCARA regex incomplète ligne 9357** (section "Colonne4" CSV) — manquait `CHEF.*BACCAR|EMPLOYE.*BACCAR|CROUPIER.*BACCAR`. **Impact** : PDFs avec colonne structurée "EMPLOYE BACCARA" étaient importés en BJ.
2. **Pattern nom rejetait apostrophes** (4 occurrences) — `O'BRIEN J` → "INTROUVABLE" même si dans DEF_EMP. **Impact** : noms avec apostrophes perdus à l'import.

**15 vérifications passées** ✓ :
- Bug PORTA doublon départs (dedup strict v9.27/v9.30) ✓
- Bug 16/3* coupure stats (CODE_HOURS explicite) ✓
- Bug senior forcé roulettes (isRouletteChef limité v9.40) ✓
- Bug CP mistaken for FL (aliases CONGE→CP) ✓
- Homonymes DESSI F/P (dedup + initiale + bigram) ✓
- Re-import fusion correcte (corrections manuelles préservées) ✓
- getDays() 28/29/30/31 + débordement ✓
- _applyCodeArr array vide ✓
- Code "16/3*" conservé dans overrides ✓
- Mois absent/mal formaté safe ✓
- Pattern apostrophes (fixé v9.56) ✓

**Verdict final** : `IMPORT_SAFE` ✓

## 📦 Items livrés session complète

### Phase 2 — Rôle Planning Expert
- ✅ **Templates de planning** (save/apply/delete + vTemplates) v9.53
- ✅ **Calcul solde CP annuel** (calcLeaveBalance + widget) v9.53
- ✅ **Retardataires à relancer** (detectRetardataires + vRetardataires) v9.53
- ✅ **Calendrier d'affluence Casino** (CALENDRIER_AFFLUENCE + bandeau) v9.54
- ✅ **Export ICS par équipe** (exportTeamICS) v9.55

### Phase 2 — Rôle Designer
- ✅ **Toast system 4 types** (ok/err/warn/info + gradients + animations) v9.53
- ✅ **Animations CSS** (toastIn/toastOut/successPulse) v9.53
- ✅ **Toast ARIA live** (WCAG 2.1 AA) v9.55

### Phase 2 — Rôle IT
- ✅ **Preconnect / DNS prefetch** (Firebase, cdnjs, Anthropic, EmailJS) v9.53
- ✅ **Règle reprise auto** globale inscrite v9.53

### Bugs utilisateur corrigés
- ✅ Cadena mdp invisible fiche employé (reveal+copy) v9.52
- ✅ Œil viewAs disparu fiche employé (ajouté ligne matricule) v9.52
- ✅ Détection BACCARA manquante import (3 endroits) v9.52 + v9.56

## À faire (prochaine session)
- [ ] **SRI hash exact PDF.js** via vérification externe (low priority)
- [ ] **Illustrations SVG empty states** (remplacer emojis par SVG custom)
- [ ] **Refactor styles inline vers :root tokens** (progressif)
- [ ] **Dark/Light mode toggle** optionnel
- [ ] **Onboarding tour** pour nouveaux employés
- [ ] **Service Worker stale-while-revalidate** cache strategy
- [ ] **Lighthouse perf audit** complet
- [ ] **Lazy-load modules lourds** (stats, audit) — nécessite refactor
- [ ] **Tests unitaires** étendus (actuellement 16 tests)

## Contexte utilisateur
- **DESARZENS K (U11804)**, admin Casino de Monte-Carlo
- **258 employés**, 36 équipes (10 BJ + 13 roulettes + 13 CMC + baccara futur)
- **Priorité** : lisibilité infos sur fond photo, import PDF correct, fluidité
- **iPhone PWA** safe-area iOS, PWA installée écran d'accueil

## Règles permanentes inscrites
1. `~/.claude/CLAUDE.md` (global, tous projets) :
   - 9 étapes expert (informer → renseigner → analyser → demander → aller plus loin → exécuter → tester → audit → sauvegarder)
   - Mémo pré-limite (MEMO_RESUME.md avant fin crédit)
   - **Reprise automatique** : dès que la limite Claude est levée, lire MEMO_RESUME.md et reprendre le travail sans attendre l'utilisateur
2. `CLAUDE.md` projet (CMCteams) : règles spécifiques

## Décisions architecturales récentes
- **DEPTS extensible** : jeux_de_table seul actif, valets/machines préparés
- **cmc_templates** dans FB_FIX (max 20 templates synced)
- **calcLeaveBalance** : 60 jours/an (convention SBM art.17.4)
- **CALENDRIER_AFFLUENCE** : Pâques mobile calculée via algo Gauss
- **Pattern nom** : accepte apostrophes `/^[A-Z][A-Z\-'\u2019 ]+\s[A-Z]{1,2}$/`
- **BACCARA detection** : 4 endroits harmonisés avec même regex exhaustive

## Commandes utiles
```bash
# Syntax check JS
node -e "const fs=require('fs');const html=fs.readFileSync('/home/user/CMCteams/index.html','utf8');const s=html.lastIndexOf('<'+'script>'),e=html.lastIndexOf('</'+'script>');fs.writeFileSync('/tmp/test.js',html.slice(s+8,e));" && node --check /tmp/test.js

# État
git log --oneline -10
wc -c /home/user/CMCteams/index.html
grep -c 'A\.user\.id!==AID' /home/user/CMCteams/index.html  # guards admin (74)
```

## Taille du fichier
- v9.56 : **798 KB** (de 775 KB en début de session = +23 KB)

## Prochaine étape concrète
**Attendre nouvelle demande utilisateur.** Session complète et stable.
Si reprise automatique : lire ce mémo et reprendre les items "À faire" par ordre d'impact (commencer par illustrations SVG ou dark mode selon préférence utilisateur).
