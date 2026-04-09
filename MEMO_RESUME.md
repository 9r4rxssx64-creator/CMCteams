# 📌 Mémo de reprise — 2026-04-09

## Dernière version stable
**v9.54** — en cours de commit (après `eecf122` v9.53 poussée)

## État général
- Phase 1 (v9.45-v9.52) : terminée et stable
- Phase 2 (v9.53-v9.54) : en cours, 3 rôles experts nouvelle passe
- Bugs utilisateur signalés : **tous corrigés** (cadena, œil, BACCARA import)
- Règles persistantes : mémo pré-limite + reprise auto inscrites dans `~/.claude/CLAUDE.md`

## Tâche en cours
**Phase 2 — suite** : continuer les items experts non traités.

## Fait ✅ (Phase 2)
### v9.53 (commit `eecf122`)
- Templates de planning (save/apply/delete + vTemplates)
- Calcul solde CP annuel + widget visuel renderLeaveBalance
- Détection retardataires (non inscrits, inactifs 30j, sans email, sans photo) + vRetardataires
- Toast system 4 types (ok/err/warn/info) avec icônes + gradients + animations
- Preconnect Firebase/cdnjs + dns-prefetch Anthropic/EmailJS
- Règle reprise auto inscrite dans CLAUDE.md global

### v9.54 (en cours de commit)
- Calendrier d'affluence Casino (CALENDRIER_AFFLUENCE + getAffluenceEvents + getAffluenceForDay)
- Bandeau affluence dans vAccueil (Grand Prix, Pâques, haute saison, Fête Nationale Monaco)
- 3 niveaux d'intensité : peak (rouge) / high (or) / medium (bleu)

## À faire 🔲
### Phase 2 items restants
- [ ] **SRI hash PDF.js** exact via verification externe (low priority)
- [ ] **Export ICS par équipe** (pas seulement personnel)
- [ ] **Illustrations SVG empty states** (remplacer les emojis par SVG)
- [ ] **Refactor styles inline vers tokens** (progressif)
- [ ] **Dark/Light mode toggle** (optionnel)
- [ ] **Onboarding tour** pour nouveaux employés
- [ ] **Lazy-load modules lourds** (stats, audit)
- [ ] **Service Worker stale-while-revalidate**
- [ ] **Lighthouse perf audit** + fixes

### Audit import (toujours en attente)
- Subagent Explore a été relancé mais stall à 71 lignes
- À relancer après reset limite
- Focus : reconnaissance homonymes, extraction PDF, calcDepPos cohérence

## Prochaine étape concrète
1. Commit v9.54 (calendrier affluence)
2. Relancer audit import subagent (limit reset)
3. Continuer phase 2 items restants
4. Audit final + save finale avec tag v9.5X-stable

## Bugs actifs (à surveiller)
- **PORTA** : historiquement doublon dans vDeparts. Fixé v9.27/v9.30/v9.40. Stable.
- **Import pattern apostrophe** : O'BRIEN J accepté via _nImp() normalisation. OK.
- **Audit subagent** : rate-limited, à relancer en boucle.

## Contexte utilisateur
- DESARZENS K (U11804), admin Casino de Monte-Carlo
- 258 employés, 36 équipes
- Priorité : lisibilité infos sur fond photo, import PDF correct
- iPhone PWA safe-area iOS
- Règles permanentes : TodoWrite, audit, commit, mémo, reprise auto

## Décisions architecturales importantes
- **DEPTS extensible** : jeux_de_table seul actif, valets/machines préparés
- **calcDepPos = vDeparts logic** : ne pas toucher sans tester ensemble
- **gpl(y,m)** signature propre depuis v9.46
- **_conflictCache** invalidation par signature JSON
- **Template storage** : `cmc_templates` dans FB_FIX, max 20 templates
- **Solde CP** : 60 jours/an (convention SBM art.17.4)
- **Affluence events** : fixes annuels + Pâques mobile calculée

## Commandes utiles
```bash
# Syntax check JS
node -e "const fs=require('fs');const html=fs.readFileSync('/home/user/CMCteams/index.html','utf8');const s=html.lastIndexOf('<'+'script>'),e=html.lastIndexOf('</'+'script>');fs.writeFileSync('/tmp/test.js',html.slice(s+8,e));" && node --check /tmp/test.js

# État git
git log --oneline -10
git status
wc -c /home/user/CMCteams/index.html
```

## Méthodologie active (rappel)
- `~/.claude/CLAUDE.md` : 9 étapes expert + mémo pré-limite + reprise auto
- `CLAUDE.md` projet : règles CMCteams spécifiques
- Cycle : TodoWrite → analyse → execute → syntax check → audit subagent → corrections → commit → push → memo
