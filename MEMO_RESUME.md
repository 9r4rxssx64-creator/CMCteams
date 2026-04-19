# Mémo de reprise — v9.432 (session 2026-04-19 autonome complète)

## 🆕 Session 2026-04-19 — **35 versions mergées** (v9.398 → v9.432)

### Bloc final v9.416 → v9.432 (chaîne autonome complète)

| Version | Feature | PR |
|---------|---------|----|
| v9.416 | Framework actions one-click agents (`action={label,fn}`) + purge orphelins auto | #101 |
| v9.417 | Actions one-click sur TOUS les 13 agents (navigation + corrections) | #102 |
| v9.418 | IA prompt enrichi `cmc_lessons_learned` (mémoire cross-session) | #103 |
| v9.419 | Event-bus agents (`post_import`, `post_save_ov`, `post_chat_msg`) | #104 |
| v9.420 | Perf : 75 `find()` → `empById()` O(1) (~19 000 itérations/render économisées) | #105 |
| v9.421 | Memoize `gpl()` + invalidation ciblée saveOv/doImport | #106 |
| v9.422 | IA tools admin `admin_run_agent` + `admin_agent_action` + `admin_add_lesson` | #107 |
| v9.423 | Timeline visuelle 24h dans vAgents (barres densité statut) | #108 |
| v9.424 | Bannière Accueil enrichie (mini-cards par agent + quick-action inline) | #109 |
| v9.425 | `learnIdentity` durant import + sync Firebase throttle 30s | #110 |
| v9.426 | Chat-analyzer réactif temps réel (event `post_chat_msg`) | #111 |
| v9.427 | **Agent 14** 💡 lesson-suggester (patterns récurrents 7j → suggestions auto) | #112 |
| v9.428 | Timeline cliquable drill-down par heure | #113 |
| v9.429 | Push notif admin agents warn/err (dedup 1h, app cachée) | #114 |
| v9.430 | Daily digest 24h sur Accueil admin (rapports/alertes/connexions/modifs) | #115 |
| v9.431 | Filtres chips statut dans vAgents historique | #116 |
| v9.432 | Badge pulsant topbar admin si warn/err pending | #117 |

### 🤖 14 agents internes actifs

⚠ Conflit · 🧹 Hygiène · 🔥 Burnout · 💊 Sync · ⚡ Perf · ⚖ Convention · 🔄 Shifts · 🎓 Comp · ⚖ Rotation · ⏸ Pauses · 📄 Import · 📡 User-watcher · 💬 Chat-analyzer · 💡 Lesson-suggester

### 🔄 Chaîne 100% autonome opérationnelle

1. **Scan** : interval + event-bus réactif (post_import/save_ov/chat_msg)
2. **Report** : vAgents + bannière Accueil enrichie + badge topbar pulsant + push notif background
3. **Drill** : timeline cliquable + filtres chips statut + historique par heure
4. **Act** : quick-actions inline (purge/flush/goto) OU IA tools OU manuel
5. **Learn** : lesson-suggester détecte patterns récurrents → admin approuve → IA bénéficie
6. **Share** : cmc_lessons_learned cross-admin (FB_FIX) + IA prompt enrichi

### 📡 Surveillance live multi-users

- Agent 12 user-watcher chez TOUS les connectés (pas que admin)
- Digest télémétrie 1/h → `cmc_telemetry_digest_<uid>` visible par admin
- Chat-analyzer détecte confusion/frustration en **temps réel** (event sendMsg)
- `vTelemetry` admin-only : digests + lessons + suggestions auto

### 📜 Règles propagées 5 endroits

- `CLAUDE.md` projet + dossier Kevin (9 demandes ✅/🔄)
- `NOTES_USER.md`
- `~/.claude/CLAUDE.md` global (tous projets futurs)
- `buildIASystemPrompt` IA app (règles + agents + lessons)
- Agent descriptions (logique métier embarquée)

### ⚡ Perf / Qualité code

- 75 `find()` → `empById()` O(1)
- `gpl()` memoize par mois + invalidation ciblée
- Formule Haversine corrigée (asin → atan2)
- Anti-BORGIA strict (pas d'invention)
- Guards AID renforcés (22/22 fonctions destructives)

---

## 🗂 Extensions antérieures session 2026-04-19 (v9.410 → v9.415)

13 versions livrées et mergées sur `main` en autonomie :

| Version | Feature | PR |
|---------|---------|----|
| v9.410 | Inspecteurs/superviseurs team fusion (ins=sup unique) + auto-migration cadres | #94 |
| v9.411 | Auto-apply cadres absences haut-droite CP/AF/M/SS + strict matching anti-BORGIA | merged direct |
| v9.412 | ROLES_SBM 12→20 (Direction/Cadres/Niv 1-11/Support) + icônes + fiche profil + dossier permanent CLAUDE.md | #96 |
| v9.413 | Extraction légendes PDF (`parseLegendsFromPdf`) + `cmc_learned_legends` FB_FIX cross-device | #97 |
| v9.414 | **Surveillance live multi-users** : `reportUserEvent`, agent 12 `user-watcher` chez TOUS, `cmc_lessons_learned`, `vTelemetry` admin | #98 |
| v9.415 | Agent 13 `chat-analyzer` : détecte confusion/erreur/frustration dans chat users + iaHistory (5 patterns, 24h fenêtre) | #99 |

**13 agents internes actifs** : Conflit · Hygiène · Burnout · Sync · Perf · Convention · Shifts · Compétences · Rotation · Pauses · Import · User-watcher · Chat-analyzer.

**Règles permanentes propagées (5 fichiers)** :
- `CLAUDE.md` : dossier demandes + AU MAXIMUM + SUBAGENTS MAX + surveillance live
- `NOTES_USER.md` : AU MAXIMUM en tête
- `~/.claude/CLAUDE.md` : règles globales multi-projets (dossier + AU MAXIMUM + subagents + UX + sécu + perf + batching CI)
- `buildIASystemPrompt` : 7 règles injectées dans contexte IA app
- Internal agents : descriptions portent la logique métier

**Dossier Kevin (tableau ✅/🔄)** : tête de CLAUDE.md, à consulter en PREMIER.

---

# Mémo de reprise — v9.407 (session 2026-04-19 autonome)

> **REGLE ABSOLUE : TOUT AU MAXIMUM. TOUJOURS. DES LE DEBUT. SANS REDEMANDER.**
>
> **REGLES PERMANENTES pour CHAQUE session :**
> 0. TOUT AU MAXIMUM — ne JAMAIS mettre une valeur basse par defaut
> 1. Lire ce fichier EN PREMIER
> 2. Lire NOTES_USER.md (infos metier Kevin)
> 3. Lire ~/.claude/CLAUDE.md (règles globales multi-projets)
> 4. Lire CLAUDE.md projet (spécificités codebase)
> 5. Lire KDMC_AI_PROJECT.md (feuille de route si présent)
> 6. Lire MEMO_KEVIN_ACTIONS.md (actions Kevin si présent)
> 7. TodoWrite AVANT de coder
> 8. Ne JAMAIS oublier une demande — tout noter dans les 3 fichiers meta
> 9. Petits morceaux (Edit) pour eviter timeouts
> 10. Agents en arrière-plan pour auditer en permanence
> 11. Subagents Explore en parallèle (3-5) à chaque tâche non triviale
> 12. PROPAGATION : règle donnée → tous projets + agents locaux + internes app + IA app + skills + hooks

---

## 🆕 Session 2026-04-19 — v9.398 → v9.407 (10 versions, 14 commits autonomes)

### Livrables majeurs

| Version | Feature |
|---------|---------|
| v9.398 | **WebAuthn Face ID / Touch ID / Windows Hello** (enrôlement vMonProfil + login biométrique) |
| v9.399 | **Ping-casino + détection onsite** (WiFi fetch no-cors + GPS geofence combinés) |
| v9.400 | **Audit guards AID** systématique (21/22 OK, 1 gap fermé sur clearErrorLog) |
| v9.401 | **Framework agents internes** + règle CLAUDE SUBAGENTS MAX + 3 fixes audits (removeEmpPhoto fbWrite, fbStartListening cap 10, overscroll-behavior) |
| v9.402 | Fixes UX/perf/fluidité (pit boss buttons 44px, confirms explicites, DM toast, backdrop blur mobile) |
| v9.403 | Agent 6 compliance-watcher (Convention SBM Art. 17.5 temps réel) |
| v9.404 | Badge agents sur Accueil admin (alertes cliquables vers vAgents) |
| v9.405 | Sync-doctor auto-flush + IA context enrichi avec rapports agents |
| v9.406 | **4 agents HR** : shift-optimizer, comp-advisor, rotation-fairness, pause-guardian |
| v9.407 | **Agent 11 import-guardian** + règle suprême "TOUJOURS AU MAXIMUM" (CLAUDE.md + NOTES + IA prompt + global ~/.claude/CLAUDE.md) |

### 🤖 11 agents internes opérationnels dans l'app

⚠ Conflit · 🧹 Hygiène · 🔥 Burnout · 💊 Sync · ⚡ Perf · ⚖️ Convention SBM · 🔄 Shifts · 🎓 Compétences · ⚖ Rotation · ⏸ Pauses · 📄 Import PDF

- `vAgents` admin view : toggles ON/OFF par agent, historique 15 derniers, lancement manuel
- Badge Accueil cliquable si warn/err
- IA context inclut rapports live (répond "quoi de neuf ?")
- Auto-pause si onglet caché (économie batterie)
- Agent import-guardian auto-déclenché après chaque `doImport`
- Reports stockés dans `cmc_agent_reports` (FB_LOCAL, 50/agent max)

### 📜 Règles permanentes propagées (5 endroits)

1. **CLAUDE.md projet** : AU MAXIMUM + SUBAGENTS MAX (en tête)
2. **NOTES_USER.md** : AU MAXIMUM (en tête)
3. **~/.claude/CLAUDE.md** : nouveau fichier global (hérite CMCteams + APEX + tous futurs projets)
4. **buildIASystemPrompt** : 7 règles injectées dans contexte IA de l'app
5. **Agent propagation** : tous agents internes connaissent leur rôle (conflict, hygiene, burnout, sync, perf, compliance, shift, comp, rotfair, pause, import)

### 5 Explore subagents lancés en parallèle

Rapports complets traçés : performance (15 items P0/P1/P2), UX mobile 375px (15 items), scalabilité 500+ emps (12 items), fluidité visuelle (10 items), features créatives (10 idées).

### Blocage externe

Vercel Free rate limit atteint hier (100 previews/jour). GitHub Pages main continue à déployer normalement. Merge possible via bypass du check Vercel failure (code validé `node --check` OK).

---

# Mémo de reprise — 2026-04-19 (CMC v9.119 + KDMC v6.1)

> **REGLE ABSOLUE : TOUT AU MAXIMUM. TOUJOURS. DES LE DEBUT. SANS REDEMANDER.**
>
> **REGLES PERMANENTES pour CHAQUE session :**
> 0. TOUT AU MAXIMUM — ne JAMAIS mettre une valeur basse par defaut
> 1. Lire ce fichier EN PREMIER
> 2. Lire NOTES_USER.md (infos metier Kevin)
> 3. Lire KDMC_AI_PROJECT.md (feuille de route)
> 4. Lire MEMO_KEVIN_ACTIONS.md (actions Kevin)
> 5. TodoWrite AVANT de coder
> 6. Ne JAMAIS oublier une demande — tout noter
> 7. Se referer aux docs a chaque decision
> 8. MAJ tous les .md apres chaque session
> 9. Petits morceaux (Edit) pour eviter timeouts
> 10. Agents en arriere-plan pour auditer

> **Lire en PREMIER à chaque nouvelle session.**
> Puis lire `NOTES_USER.md` (méta-règles admin + infos métier).
> Puis `~/.claude/CLAUDE.md` (règles globales multi-projets).
> **⚠️ AUSSI lire `TODO_REMINDERS.md`** — tâches en attente que Kevin a demandées.

---

## 🗓 RAPPELS À TRAITER PROCHAINEMENT (voir TODO_REMINDERS.md)

1. **Nettoyage projets Vercel** (demandé 2026-04-16 03:05) — supprimer tous SAUF `kdmc-bot-2026`
2. Régénérer token Telegram (token visible dans captures)
3. Ajouter 4 secrets GitHub Actions pour activer crons fréquents
4. Backup chiffré tokens sur Drive (sécu 3-2-1)
5. Créer repos GitHub IA-KDMC + e-KDMC

---

## 🚨 Méta-règles admin (appliquer SANS que l'admin ait à redemander)

1. Chaque info métier admin → enregistrée IMMÉDIATEMENT dans `NOTES_USER.md`
2. Chaque nouvelle fonction = auto + sur-vérif + bouton manuel de secours
3. Priorité absolue = reconnaissance + placement correct à CHAQUE import PDF
4. Compétences `emp.post` = persistantes (plus jamais écrasées au reload — v9.108)
5. **IMPORTANT v9.116** : les familles/secteurs NE SONT PAS dérivés des compétences.
   - `emp.family` vient de l'IMPORT (team dispatch bj1..r13..c13)
   - `emp.post` (P/P+/E) reste dans la fiche, pour info / dispatch futur
   - `reassignAllFamiliesByCompSilent` reste dispo MANUELLEMENT (bouton), pas auto
6. Clé API Anthropic : backup Firebase auto + restore à la connexion (v9.108)
   - Console : https://console.anthropic.com/settings/keys
7. Tout s'enchaîne automatiquement (stats, vues, IA context suivent les modifs)

---

## Dernière version stable

**`APP_VER = "v9.117"`** — branche `main` (déployée GitHub Pages)

### Session 2026-04-13 — ce qui a été livré
| Version | Contenu |
|---------|---------|
| v9.103 | Couleurs CODES calibrées PDF SBM |
| v9.104 | Auto-vérif import totale (8 audits + auto-corrections + 4 boutons secours) |
| v9.105 | Fix crash Safari burn-out + CDP pêche clair + contraste AAA |
| v9.106 | Fix micro chat + préservation clé API reset + TTS chat |
| v9.107 | Helper secteurs P/P+/E (devenu manuel en v9.116) |
| v9.108 | Backup admin Firebase + persistance post + auto-classif import (revert v9.116) |
| v9.109 | Sync compact + auto-backup import + IA sur-vérif + auto-save profil |
| v9.110 | Visibilité MAX + modal burnout propre |
| v9.111 | Fix SW crash + 1 bouton fermer + login centré iOS |
| v9.112 | Fix toast thème qui masquait Continuer login |
| v9.113 | Thème clair RÉELLEMENT fonctionnel |
| v9.114 | Bouton pause diaporama + visibilité massive + fond vert défaut |
| v9.115 | Stats connexions complètes + fuzzy search IA |
| v9.116 | Retrait auto-reassign familles + restore DEF_EMP |
| v9.117 | Fix 3 sources de crashes (SW update, Firebase fetch, IA fetch) |

---

## 📋 Fichiers documentation à JOUR

| Fichier | Rôle |
|---------|------|
| `CLAUDE.md` | Guide assistant IA (règles, workflow, erreurs connues) |
| `NOTES_USER.md` | **Infos métier admin** (couleurs PDF, tables, horaires rôles, vision IA…) |
| `CHANGELOG.md` | Historique complet versions |
| `MEMO_RESUME.md` | État courant (ce fichier) |
| `README.md` | Vitrine projet |

---

## 🚀 Session nuit du 12 au 13 avril 2026

### Livré (v9.100 → v9.103)

| Version | Contenu |
|---------|---------|
| **v9.100** | Audit expert 4 subagents → 7 corrections P0/P1 (guards admin, FB_LOCAL, hashV2, touch targets, Escape, undo stacks) |
| **v9.101** | **URGENT** Fix crash Safari iOS `SyntaxError: Invalid escape` (3 onclick inline + null guards) + lisibilité textes ↑ |
| **v9.102** | Auto-vérification AUTOMATIQUE post-import (pas de bouton) + 5 outils IA sur-vérification (deep/compare/coherence/super) |
| **v9.103** | **Couleurs CODES calibrées** sur le PDF SBM original (screenshots fournis par admin) |

### Tests finaux
- **54/54 E2E PASS** sur 6 devices en ~29s
- 0 erreur runtime
- 32 versions livrées depuis v9.70 (v9.71 → v9.103)

---

## 🎯 Capacités actuelles

- **76 outils IA** (24 admin) — langage naturel complet
- **17 sujets aide `?`** contextuelle
- **43 actions** command palette ⌘K
- **Undo/Redo** ⌘Z global
- **Backup auto** quotidien + rotation 7j
- **Preview/Rollback import** SHA-256
- **Auto-vérification** post-import (bandeau + toast)
- **Dashboard LIVE** + Mode TV
- **Dark/Light/Auto** theme
- **IndexedDB** wrapper
- **Password gen + strength**
- **Error + Perf monitoring**
- **Réactions emojis chat**
- **Hash v2** sel dynamique
- **Circuit breaker Firebase** (5 échecs/60s cooldown)
- **PWA** Badge/Share/WakeLock/Shortcuts
- **Accessibilité AAA** (skip-link, ARIA, high contrast, font scaler)
- **Couleurs PDF SBM** calibrées

---

## ⏳ En attente d'inputs admin

Voir `NOTES_USER.md` pour détails :

1. **Horaires inspecteur/superviseur/pitboss** : structure `ROLE_SHIFTS` prête, attend codes exacts
2. **Plans casino + numéros tables + jeux** : gestion tables amovibles, salons (Atrium…)
3. **Couleurs affinées** : si les couleurs actuelles ne matchent pas à 100%, l'admin envoie nouveau screenshot

---

## 🔒 Règles permanentes (voir CLAUDE.md)

1. **§1** — TodoWrite obligatoire pour chaque demande
2. **§1bis** — UX : simple, visuel, ludique, compréhensible (icônes/emojis, tooltips, aide `?`)
3. **§1ter** — NOTES_USER.md : enregistrer IMMÉDIATEMENT toute info métier donnée par l'admin
4. **§Outils expert** — boîte à outils pour sessions futures
5. **§Erreurs connues** — 23 pièges documentés à ne JAMAIS refaire

---

## 🧪 Workflow testing

```bash
# Tests E2E locaux (6 devices, ~29s)
node tools/tests/e2e.test.js

# Validation syntaxe JS
node -e "const fs=require('fs');const h=fs.readFileSync('index.html','utf8');const s=h.lastIndexOf('<script>'),e=h.lastIndexOf('</script>');fs.writeFileSync('/tmp/t.js',h.slice(s+8,e));" && node --check /tmp/t.js

# Taille fichier
wc -c index.html   # ~1.24 MB actuellement

# Git status + log récent
git status && git log --oneline -10
```

---

## 🔮 Prochaines pistes

### Priorité haute (attend inputs)
- Horaires inspecteur/superviseur/pitboss (codes)
- Plans casino tables amovibles

### Améliorations continues possibles
- i18n étendu (EN/IT/DE complets) + traduction chat via IA
- Export PDF planning individuel (via window.print + CSS @media print)
- QR code partage planning
- Drag & drop planning (shifts)
- Bulk actions UI (checkbox selection)
- Notifications push serveur-less
- Onboarding interactif complet

---

## APEX AI v1.5 (2026-04-18) — NOUVEAU PROJET

**App IA premium livree dans `apex-ai/`** :
- `index.html` (355 KB, 1097 lignes) — 247+ actions, self-modifying, AI Crew
- `proxy-apex.js` — Proxy Cloudflare Workers avec streaming SSE
- `sw.js` — Service Worker v1.2 (push + background sync)
- `manifest.json` — PWA installable

**60 commits, 7 audits experts, corrections P0/P1/P2 appliquees**

**KDMC v6.1 — Capacites :**
- 247+ actions autonomes, 70+ templates pro, 10 personas
- AI Crew (5 agents internes: verificateur, critique, optimiseur, fact-checker, creatif)
- Local Workers (4 agents arriere-plan: erreurs, habitudes, taches, backup)
- Self-modifying + Self-improving (apprend des reactions)
- Auto-learn 24 marques appareils
- IFTTT Rules + Predictions + Monte Carlo
- Python + JS + Canvas + Code Editor
- 12 ambiances domotique, 42 commandes IR Broadlink
- Smart TV WiFi (Samsung, LG, Roku, Android TV)
- Assistant vocal continu type Siri (32 commandes)
- Finance (NPV/IRR/SMA/EMA/Finnhub/Crypto)
- Mode offline Gemma WebLLM
- 15 achievements, 6 themes, 4 langues
- Gamification XP + slot machine + Konami
- Deep Research + Multi-perspective
- Snapshots time travel + Export universel

**Voir MEMO_KEVIN_ACTIONS.md pour les actions restantes de Kevin.**

---

*Dernière mise à jour : 2026-04-18 — APEX AI v1.5 + CMC v9.119*
