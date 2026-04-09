# 📌 Mémo de reprise — 2026-04-09 (session Phase 2 terminée)

## Dernière version stable
**v9.55** — commit `8e84515` sur `main` ✅ **SAFE_TO_RELEASE**

## Historique commits récents
```
8e84515 v9.55: Export ICS par équipe + toast ARIA live
82c4142 v9.54: Calendrier d'affluence Casino + mémo mise à jour
eecf122 v9.53: Phase 2 experts — Planning templates/solde CP/retardataires + Toast + Preconnect
08ea290 v9.52: Sauvegarde stable — fix cadena/œil vEmps + BACCARA import + mémo reprise
3e3afda v9.51: Diaporama fond d'écran — défilement photos 5s crossfade
3b79803 v9.50: Département Jeux de table + fonds perso par employé
```

## État général
- **Phase 1** (v9.45-v9.46) : terminée et stable
- **Phase 1 pas à pas** (v9.47-v9.52) : terminée et stable
- **Phase 2** (v9.53-v9.55) : nouvelle passe experts — terminée
- **Bugs utilisateur** : tous corrigés (cadena mdp, œil viewAs, BACCARA import)
- **Règles persistantes** : mémo pré-limite + reprise auto dans `~/.claude/CLAUDE.md`
- **Audit manuel** : ✅ 74 guards admin, toutes nouvelles fonctions protégées

## Items livrés session complète

### Phase 2 — Rôle Planning Expert
- ✅ **Templates de planning** (save/apply/delete + vTemplates) v9.53
- ✅ **Calcul solde CP annuel** (calcLeaveBalance + widget) v9.53
- ✅ **Retardataires à relancer** (detectRetardataires + vRetardataires) v9.53
- ✅ **Calendrier d'affluence Casino** (CALENDRIER_AFFLUENCE + bandeau) v9.54
- ✅ **Export ICS par équipe** (exportTeamICS) v9.55

### Phase 2 — Rôle Designer
- ✅ **Toast system 4 types** (ok/err/warn/info + gradients + animations) v9.53
- ✅ **Animations CSS** (toastIn/toastOut/successPulse) v9.53

### Phase 2 — Rôle IT
- ✅ **Preconnect / DNS prefetch** (Firebase, cdnjs, Anthropic, EmailJS) v9.53
- ✅ **Règle reprise auto** inscrite globalement v9.53
- ✅ **ARIA toast** (role="status" aria-live="polite") v9.55

## À faire (prochaine session ou plus tard)
- [ ] **SRI hash exact PDF.js** via vérification externe (low priority)
- [ ] **Illustrations SVG empty states** (remplacer emojis par SVG custom)
- [ ] **Refactor styles inline vers :root tokens** (progressif)
- [ ] **Dark/Light mode toggle** optionnel
- [ ] **Onboarding tour** pour nouveaux employés
- [ ] **Service Worker stale-while-revalidate** cache strategy
- [ ] **Lighthouse perf audit** complet
- [ ] **Audit import** subagent en profondeur (toujours rate-limité aujourd'hui)
- [ ] **Lazy-load modules lourds** (stats, audit) — nécessite refactor

## Bugs actifs (à surveiller)
- **PORTA** : historiquement doublon vDeparts. Fixé v9.27/v9.30/v9.40. Stable.
- **Pattern import apostrophe** : O'BRIEN J accepté via _nImp() normalisation. OK.
- **Audit subagent import** : plusieurs rate-limits. À relancer demain.

## Décisions architecturales récentes
- **DEPTS extensible** : jeux_de_table seul actif, valets/machines préparés
- **cmc_templates** dans FB_FIX (max 20 templates synced)
- **calcLeaveBalance** : 60 jours/an constante (convention SBM art.17.4)
- **CALENDRIER_AFFLUENCE** : Pâques mobile calculée via algo Gauss
- **toast system** : 4 types avec configurations distinctes par icône/couleur
- **Preconnect** : Firebase crossorigin (auth potentielle future)

## Contexte utilisateur
- **DESARZENS K (U11804)**, admin Casino de Monte-Carlo
- **258 employés**, 36 équipes (10 BJ + 13 roulettes + 13 CMC + quelques baccara)
- **Priorités** : lisibilité infos sur fond photo, import PDF correct, fluidité
- **iPhone PWA** safe-area iOS, PWA installée écran d'accueil
- **Règles** : TodoWrite, audit, commit, mémo, reprise auto, continuer jusqu'à fin tâche

## Prochaine étape concrète
Attendre nouvelle demande utilisateur. Session Phase 2 complète.
Si reprise auto sur limite : lire ce mémo, reprendre items "À faire" par ordre d'impact.

## Commandes utiles
```bash
# Syntax check JS
node -e "const fs=require('fs');const html=fs.readFileSync('/home/user/CMCteams/index.html','utf8');const s=html.lastIndexOf('<'+'script>'),e=html.lastIndexOf('</'+'script>');fs.writeFileSync('/tmp/test.js',html.slice(s+8,e));" && node --check /tmp/test.js

# État
git log --oneline -10
git status
wc -c /home/user/CMCteams/index.html
grep -c 'A\.user\.id!==AID' /home/user/CMCteams/index.html  # guards admin
```

## Méthodologie active
- `~/.claude/CLAUDE.md` (global) : 9 étapes expert + mémo pré-limite + reprise auto
- `CLAUDE.md` projet : règles CMCteams spécifiques
- Cycle : TodoWrite → analyse → execute → syntax check → audit subagent → corrections → commit → push → memo update

## Taille du fichier
- v9.55 : **797 KB** (vs 620 KB au début de la session)
- +177 KB de features livrées en Phase 1 + Phase 2
