# CLAUDE.md — CMCteams Codebase Guide

Guide pour assistants IA travaillant sur ce dépôt. Mis à jour après session v9.506 / Apex v12.174 (2026-04-25).

---

## 🎨 RÈGLE PERMANENTE — SMART STUDIOS ANTICIPATIFS (Kevin 2026-04-25)

> **"Imaginons qu'on lui dise 'je veux faire un montage vidéo' → hop, il me sort une table de mixage vidéo. 'Montage musique' → table de mixage musique. 'Dossier préfecture' → tous les liens pré-remplis. Il anticipe à aller plus loin que ce que l'utilisateur attend. Quand il a compris le principe, il fait les recherches encore plus poussées pour surprendre dans le bon sens."**

À chaque demande utilisateur, Apex (et CMCteams quand pertinent) doit :

### 1. Détecter l'intention (axDetectIntent / cmcDetectIntent)

Map FR/EN d'expressions → studios dédiés :
- "montage video / clip / film / pub" → Studio Vidéo
- "montage musique / track / chanson" → Studio Musique
- "dossier prefecture / titre sejour / cni" → Studio Préfecture
- "cv / curriculum" → Studio CV
- "facture / devis" → Studio Facture
- "contrat / nda / cdi" → Studio Contrat
- "presentation / slides / pitch" → Studio Présentation
- "logo / branding" → Studio Logo
- "clip a partir de cette photo" → Studio Clip Photo→Vidéo

### 2. Ouvrir le studio dédié (axOpenStudio(name))

Chaque studio = vue UI dédiée avec :
- Tous les outils nécessaires PRÉ-CHARGÉS
- Templates rapides ("Vacances", "Pub produit", "Pitch startup", etc.)
- Formulaires pré-remplis depuis `A.user.reg`
- Liens directs externes pertinents (gouv.fr, banques, plateformes...)
- Export multi-format (PDF, MP4, MP3, DOCX, PNG, SVG)

### 3. Anticipation engine (axAnticipateNext)

Après chaque action :
- Détecter logical next steps ("logo généré → cartes de visite ? site web ? t-shirt ?")
- Proposer 3-5 suggestions visuelles cliquables
- Apprendre les patterns user dans `ax_anticipation_patterns`

### 4. Aller au-delà sans demander

- Si user demande "facture" → Apex propose AUSSI : devis lié, suivi paiement, relance auto
- Si user demande "CV" → Apex propose AUSSI : LinkedIn updaté, lettre motivation IA, mock entretien
- Si user demande "préfecture" → Apex propose AUSSI : checklist documents, calendrier RDV, notification rappel

### 5. Recherche autonome de meilleurs outils

Sentinelle "tools-watch" tourne périodiquement :
- Détecte nouveaux APIs (Replicate, ElevenLabs, Suno, Pika, etc.)
- Détecte mises à jour modèles IA (FLUX 2, Sora, Veo 2, etc.)
- Propose intégration auto via `ax_claude_todo` si pertinent

S'applique : Apex (Studios), CMCteams (Workflows métier casino), tous projets futurs.

---

## 👑 RÈGLE PERMANENTE — ADMIN-FIRST UX (Kevin 2026-04-25)

> **"Fais ma première vue, la mon équipe toujours, l'équipe miroir ensuite, et fait un système de famille différent de celui qui tu as mis, plus simple, plus intuitif, plus clair, plus facile d'accès. Plus simple pour l'admin, ici comme ailleurs, toujours en général, faire au plus simple pour que les infos soient faciles d'accès, recherchées, que tout soit clair et fonctionnel et visuel pour l'admin."**

S'applique à CMCteams + Apex + tous projets futurs, sans exception :

### 1. Hiérarchie d'affichage admin (priorité visuelle)

1. **Mon équipe** (équipe principale de l'admin) — TOUJOURS en premier
2. **Équipe miroir** (équipe complémentaire) — TOUJOURS en deuxième
3. **Familles regroupées** (BJ / Roulettes / CMC) — collapsibles, non hiérarchiques
4. **Cadres / Inspecteurs / Sup** — section dédiée séparée
5. **Tout le reste** — accessible via filtre/recherche, pas affiché par défaut

### 2. Système de familles simplifié

- **Pas de sous-niveaux complexes** (équipe.role.statut.dispo) — max 2 niveaux
- **Icônes claires** : 🃏 BJ / 🎰 Roulettes / 🎲 CMC / ⭐ Cadres
- **Couleurs distinctes** par famille (cohérence visuelle)
- **Badges nombre** : `(15)` à côté du nom famille → l'admin sait combien de monde
- **Toggle expand/collapse** : 1 clic = ouvert/fermé, état persisté

### 3. Accès rapide partout

- Recherche universelle TOUJOURS visible en haut (input avec placeholder explicite)
- Filtres rapides en chips cliquables (`[En ligne 12]` `[Malade 2]` `[Aujourd'hui 45]`)
- Stats cliquables → modal avec liste détaillée (pas pur affichage)

### 4. Test mental obligatoire avant chaque commit

- "Est-ce que MON équipe apparaît en haut sans scroller ?"
- "Est-ce qu'un admin trouve une info en moins de 3 clics ?"
- "Est-ce que c'est plus simple qu'avant ou plus complexe ?"
- "Si non → REPRENDRE jusqu'à ce que ce soit plus simple"

### 5. Anti-patterns interdits

- ❌ Mur de cards/lignes sans hiérarchie
- ❌ Boutons cachés dans menus déroulés (max 1 niveau)
- ❌ Trop de couleurs/badges (max 3 couleurs primaires + 2 accents)
- ❌ Texte technique visible (`emp.statut.contractCode === "RTP"` → "Repos")
- ❌ Ordre alphabétique strict (mon équipe doit ressortir d'abord)

S'applique à : `vEmps`, `vPlan`, `vDeparts`, `vMonPlanning`, `vAdminLinks` (Apex), tous nouveaux modules.

---

## 🤖 RÈGLE PERMANENTE — AGENTS TOUJOURS BOOSTÉS (Kevin 2026-04-25)

> **"Vérifie que tous les agents sont équipés au mieux, boostés, augmentés. Ajoute des outils dédiés individuellement spécifiques. Vérifie régulièrement si tu peux faire mieux. Va plus loin sans qu'on te le demande."**

À CHAQUE session, je DOIS automatiquement :

### 1. Audit agents/sentinelles initial

À chaque démarrage je vérifie :
- Combien d'agents existent (Apex AX_CREW_EXPERT, sentinelles AX_SENTINEL_TOOLS)
- Combien d'agents existent (CMCteams CMC_AGENT_TOOLS, sentinelles)
- Chaque agent a-t-il : `tools[]`, `data_sources[]`, `prompt_extension`, `auto_fix[]` ?
- Si manquant → enrichir IMMÉDIATEMENT sans demander

### 2. Outils dédiés par compétence

Chaque expert/sentinelle = outils spécialisés :
- Finance → finance_calculate, calculate, web_search
- Juriste → CONVENTION + BULLETIN_CODES + web_search jurisprudence
- CTO → code_execute, get_source, modify_css, inject_function
- Designer → modify_css, screenshot
- CISO → security audit tools, OWASP, NIST
- Performance → measure_render_time, detect_memory_leaks
- Erreurs → capture_stacktrace, detect_pattern, escalate_to_claude
- UX → measure_lcp/fid/cls, debounce, optimize_render
- Sentinelle Enrichissement Auto → détecte nouvelles APIs/libs/IA models

### 3. Auto-amélioration permanente

- Sentinelles tournent 24/7 (16+ agents)
- Détectent malfonction → auto-fix 3 stratégies → si échec → escalade Claude Code
- Lessons learned partagées cross-app (Apex ↔ CMCteams)
- Nouvelles APIs détectées → ajout auto dans system prompt
- Modèles IA upgrade → migration auto vers meilleur

### 4. Cross-app propagation

Si j'enrichis un agent dans Apex → je vérifie si pertinent CMCteams (et inverse).

S'applique à chaque interaction, sans exception.

---

## 🚀 RÈGLE PERMANENTE — TOUJOURS DÉPASSER LES ATTENTES (Kevin 2026-04-25)

> **"Toujours anticiper les attentes de l'utilisateur en allant au plus loin. Améliorer à chaque fois. Toujours donner des dossiers prêts à télécharger, prêts à copier, des liens directs, des informations claires, vérifiées. Concertation IA + agents + autonomie pour que tout s'optimise et se corrige sans cesse. Historique pour l'admin partout."**

À chaque réponse / action / livraison, je DOIS :

### 1. Réponses TOUJOURS actionnables

- **Boutons cliquables** dans chaque réponse (Coffre, Settings, action interne)
- **Liens directs** externes (billing, signup, console)
- **Documents** : Export PDF / Imprimer / Sauvegarder / Télécharger systématique
- **Code** : copiable en 1 clic + langage explicite
- **Anticiper la question suivante** : 1 suggestion "Pour aller plus loin..."
- **Surprendre positivement** : 1 idée non demandée mais utile

### 2. Concertation IA permanente

- 3-5 agents indépendants travaillent en parallèle (Promise.all)
- Avocat du diable conteste systématiquement
- Synthèse finale cite divergences + tranche
- Expert le plus compétent du domaine prend la décision finale

### 3. Auto-correction silencieuse

- Pas de message "rechargez" — auto-fix silencieux (toast "Petit souci détecté")
- Sentinelles tournent en permanence (16 agents)
- Si erreur détectée → escalade vers Claude Code automatique
- Historique COMPLET dans ax_audit + ax_err_log + ax_handoff_journal

### 4. Historique admin partout

- Toute action loggée : ax_audit (max 500), cmc_audit (max 500)
- Erreurs : ax_err_log (max 500)
- Click failures : ax_click_failures (max 50)
- Concertation experts : ax_crew_history (max 100)
- Connexions : ax_connection_log + cmc_userlog
- Visible admin via vAdminWorklog + vUsersActivity + vClickFailures + vAdminHistory

### 5. Optimisation continue

- Lessons learned partagées : ax_lessons_learned (Firebase shared)
- Cross-app : si lesson dans Apex → applique à CMCteams (et inverse)
- Telemetry incoming : ax_telemetry_in
- Pipeline auto-fix : detect → essayer 3 stratégies → si échec → escalade Claude Code

S'applique à chaque interaction, sans exception.

---

## 🔄 RÈGLE PERMANENTE — ENRICHISSEMENT AUTONOME OUTILS (Kevin 2026-04-25)

> **"Continue toujours ton travail. Vérifie régulièrement si tu ne peux pas te rajouter des outils, des programmes pour améliorer fonctionnement et possibilités. Ajoute en autonomie totale. Préviens l'IA de ce qu'elle a."**

À CHAQUE session, je DOIS :

### 1. Audit autonome (toutes les 1-2h)

Vérifier dans tous les projets (Apex + CMCteams + futurs) :
- Nouveaux APIs Web (navigator.*, document.*, Performance API)
- Nouvelles features iOS PWA / Safari
- Nouvelles librairies utiles (jsPDF, Chart.js, TensorFlow.js, Workbox, Dexie)
- Services externes complémentaires (Auth0, Sentry, Plausible, Resend)
- Nouveaux modèles IA disponibles (Gemini 2.5, Claude 5, GPT-5, etc.)

### 2. Ajout sans demander

Si une lib/service ajoute >20% valeur sans casser → **je l'ajoute directement** + commit + push.

Exemples :
- jsPDF pour export rapports PDF
- TensorFlow.js pour face detection locale
- Workbox pour cache strategies avancées
- Web NFC pour badge employé
- WebUSB pour devices custom
- WebRTC pour visio
- File System Access API pour gros fichiers
- Background Sync pour offline queue

### 3. Informer l'IA dans buildIASystemPrompt

À chaque ajout d'outil → j'enrichis le system prompt avec :
```
Nouveaux outils disponibles depuis vX.Y :
- [tool_name] : description courte + exemple d'utilisation
```

L'IA des apps connaît ainsi automatiquement ses nouvelles compétences.

### 4. Documenter dans CLAUDE_ACTIVITY

Chaque commit avec catégorie "Tools" ou "Enrichment" pour traçabilité.

### 5. Cross-app propagation

Si outil ajouté dans Apex → vérifier si pertinent CMCteams (et inverse).
Documenter dans CLAUDE.md section "Outils & APIs intégrés".

---

## 📒 RÈGLE PERMANENTE — Maintenir CLAUDE_ACTIVITY.json (Kevin 2026-04-25)

> **"Ajoute toutes tes données sur mon temps de travail et met le à jour comme doit faire IA de Apex et dans CMCteams et tu mets à jour dedans chacun toi aussi au fur et à mesure"**

À chaque commit que je fais sur ce repo, je DOIS régénérer `/home/user/CMCteams/CLAUDE_ACTIVITY.json` avec tous mes commits récents. Ce fichier est lu par les vues `vAdminWorklog` (Apex) et `vAdminTimework` (CMCteams) pour afficher mon activité à Kevin.

**Script de régénération** (à lancer avant chaque commit important) :

```bash
python3 -c "
import subprocess, json, re, time
out = subprocess.check_output(['git','log','--pretty=format:%H|%at|%s','--since=2026-04-21'], text=True)
commits = []
for line in out.strip().split('\n'):
    if not line: continue
    h, ts, msg = line.split('|',2)
    project='multi'
    if msg.startswith('Apex v'): project='apex'
    elif msg.startswith('CMCteams v') or msg.startswith('v9.'): project='cmcteams'
    elif msg.startswith('Backend'): project='backend'
    elif 'PRO ' in msg: project='backend'
    elif msg.startswith('CLAUDE'): project='docs'
    ver_match = re.search(r'v(\d+\.\d+)', msg)
    ver = ver_match.group(1) if ver_match else None
    commits.append({'sha':h[:8], 'ts':int(ts)*1000, 'msg':msg[:200], 'project':project, 'ver':ver, 'author':'claude-code'})
data = {'updated_at': int(time.time()*1000), 'total_commits': len(commits), 'projects': sorted(set(c['project'] for c in commits)), 'commits': commits[:120]}
json.dump(data, open('CLAUDE_ACTIVITY.json','w'), ensure_ascii=False, indent=2)
"
```

À faire idéalement à chaque commit. Acceptable de batcher (1× par session).

---

## 🗺 RÈGLE — PERMISSIONS MAP CMCteams (Kevin 2026-04-25)

> **"Seul l'admin voit la map. Le pit sait qui et quand est à table etc."**

Hiérarchie d'accès au système de carte interactive :

| Rôle | Map editor | Live positions | Édition |
|------|-----------|----------------|---------|
| **Admin Kevin** (AID U11804) | ✅ | ✅ | ✅ |
| **Pit Boss** (`emp.pit_boss` ou rôle pit) | ❌ | ✅ (lecture seule) | ❌ |
| **Cadre/Inspecteur/Sup** | ❌ | ✅ (lecture seule) | ❌ |
| **Chef de table** | ❌ | ✅ son équipe seulement | ❌ |
| **Employé simple** | ❌ | ❌ | ❌ |

Implémentation :
- `vMapEditor()` → guard `if(!A.user||A.user.id!==AID)return ...`
- `vTableMap()` (live read-only) → guard `if(!A.user||(A.user.id!==AID && !isPitBoss(A.user) && !isCadre(A.user)))return ...`
- Helper `isPitBoss(emp)` / `isCadre(emp)` à créer si absent

S'applique à tous les futurs subagents qui touchent à la map.

---

## 📱 RÈGLE CRITIQUE — KEVIN TRAVAILLE SUR iPHONE (Kevin 2026-04-25 permanent)

> **"Rappel toi tjs que je travail sur iPhone"**

**Implications obligatoires sur CHAQUE feature** :
- ❌ Pas de raccourcis clavier seuls (Cmd+K, Ctrl+F, etc.) → toujours doubler avec un bouton visible
- ❌ Pas de `:hover` actions critiques → utiliser tap + long-press
- ❌ Pas d'actions cachées sous focus/select → tout doit être tactile
- ✅ Touch targets minimum 44×44px (Apple HIG)
- ✅ Tester à 375px (iPhone SE) ET 390px (iPhone 14 Pro)
- ✅ Bouton visible PARTOUT pour fonctionnalités importantes (palette, recherche, voix)
- ✅ Safe-area-inset-bottom pour ne pas masquer sous home indicator
- ✅ Pas de scroll horizontal sauf nav explicite (`overflow-x:auto`)
- ✅ Font min 14px (sinon iOS zoom auto sur input)
- ✅ PWA Safari iOS-compatible (test prioritaire)

**Vérification à CHAQUE commit** :
- "Cette feature marche-t-elle iPhone sans clavier ?"
- "Est-ce qu'il y a un bouton tactile pour chaque action ?"
- "Touch targets >= 44px ?"

S'applique à Apex AI + CMCteams + futurs projets.

---

## 🔍 RÈGLE — RECHERCHE NOM/PRÉNOM TOUJOURS FLEXIBLE (Kevin 2026-04-21 v9.458+ / v12.57+)

> **"Laurence SAINT-POLIT ou SAINT-POLIT Laurence. Toutes les façons, avec ou sans trait d'union. Pour tout le monde. Anticipe partout les problèmes de connexion similaires."**

**Règle permanente absolue — Apex + CMCteams + tout projet futur :**

Aucun login, recherche, authentification ou match par nom ne doit être strict. Toujours accepter :
- ✅ Tous les ordres (prénom-nom / nom-prénom)
- ✅ Casse libre (majuscule/minuscule)
- ✅ Avec ou sans tirets / espaces
- ✅ Avec ou sans accents
- ✅ Nom collé (SAINTPOLIT) ou séparé (SAINT POLIT)
- ✅ Espaces multiples

**Algorithme obligatoire** (référence `_checkPreconfiguredUser` Apex v12.57) :
1. Match exact d'abord (perf)
2. Normalize : `.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[\s\-_]+/g," ").trim()`
3. Tokens triés alphabétiquement → match indépendant de l'ordre
4. Squash collé (tout sans espace) → accepte "saintpolitlaurence"
5. Substring token + tolérance ±1 char → accepte "SAINTPOLITLAURENCE"

**Zones à vérifier dans chaque projet** :
- Login (axLogin / doLogin)
- Recherche employés (findEmpByName CMCteams)
- Recherche clients / fiches
- Import PDF parser (reconnaissance noms)
- Chat DM (destination par nom)
- Admin queries ("qu'a fait Laurence")
- Tout autocomplete/suggestion

**Leçons tirées de problèmes passés** :
- Fuzzy match Levenshtein aveugle = danger (BORGIA T vs BORGIA L)
- Match strict = utilisateurs frustrés (TRADIEU typo, oubli tiret)
- Bon équilibre = tokens triés + tolérance contrôlée

**À propager quand j'ajoute un nouveau projet** : utiliser directement le helper `_checkPreconfiguredUser` comme référence + auditer toutes les fonctions de recherche.

---

## 🌉 RÈGLE — PIPELINE AUTONOMIE CROSS-PROJET (Kevin 2026-04-21 v9.458+)

> **"Tout problème de n'importe quel projet (Apex, CMCteams, futurs) doit remonter à Apex, qui essaie de réparer. Si Apex n'y arrive pas, te consulte et tu agis en autonomie sans aucune action de ma part."**

### Architecture à appliquer SYSTÉMATIQUEMENT (projets actuels + futurs)

```
Projet X → Firebase ax_telemetry_in → Apex reçoit → _aiHandleIssue auto-fix
                                                          ↓ échec
                                                  _escalateToClaudeCode
                                                          ↓
                                                  ax_claude_todo Firebase
                                                          ↓
                                            GitHub Action cron 2h
                                                          ↓
                                                 Claude Code → fix autonome
```

### Composants obligatoires dans chaque projet

1. **Fonction `_pushTelemetryToApex(id, kind, msg)`** : écrit dans Firebase `ax_telemetry_in` avec `src:"nomProjet"` + version
2. **FB_FIX inclut `ax_telemetry_in` + `ax_claude_todo` + `ax_lessons_learned`** (shared cross-app)
3. **Sentinelles autonomes** : monitor erreurs → appellent `_pushTelemetryToApex` après échec local
4. **Agent dédié** : patrouille la queue, escalade si saturation
5. **Lessons learned** partagées : `ax_lessons_learned` Firebase FB_FIX → chaque projet lit + ajoute

### Apex = orchestrateur central

- `_processIncomingTelemetry(buffer)` itère sur chaque entrée non processed
- `_aiHandleIssue(sentinelId, severity, finding)` whitelist auto-fix : flushSyncQueue, emergencyCleanup, fbReconnect, resetStreaming
- Si toutes tentatives échouent → `_escalateToClaudeCode({context}, reason, "critical")`
- Push Firebase `ax_claude_todo` avec `status:"pending"` + sev critical

### Claude Code = dernier recours

- GitHub Action `.github/workflows/claude-todo-watcher.yml` cron 2h
- Poll `/apex/ax_claude_todo.json` → analyse pending + critical (>2h non traité)
- Si critical > 0 ou pending > 20 → ouvre GitHub Issue + Telegram alert (optionnel)
- Prochaine session Claude Code : lit issue → fix → `_markTodoResolved` + ajoute lesson

### Obligations pour futurs projets (e-KDMC, IA-KDMC, etc.)

Avant merge première version :
- [ ] Implémenter `_pushTelemetryToApex` + hook sur erreurs critiques
- [ ] Ajouter `ax_telemetry_in` dans FB_FIX
- [ ] Créer au moins 1 sentinelle + 1 agent dédié
- [ ] Documenter dans le README du projet
- [ ] Mettre à jour `APEX_HANDOFF.md` pour Apex connaisse le projet

**Cette règle vaut pour TOUS projets présents et futurs sans exception.**

---

## 📌 DOSSIER DE TRAVAIL — Status au 2026-04-21 (7 PRs mergées cette session)

**Écosystème autonome complet déployé** (CMCteams v9.451 + Apex v12.11) :
- 23 agents CMC + 7 sentinelles + 16 sentinelles Apex = 46 watchers permanents
- Pipeline autonomie cross-app : sentinelles → IA Apex → Claude Code outbox
- Bridge IA Claude Haiku 4.5 avec whitelist 5 actions safe auto-exécutables
- CGU universel FaceID + Micro + Géoloc (RGPD, révocable)

**Items dossier :**

1. ✅ Bugs inspecteurs/superviseurs sans team/horaire → v9.409-410 (fusion ins=sup) + parser fix v9.446 (regex permissive) + fallback v9.447/v9.449 (name-first anywhere) + fix apostrophes v9.451 (22/6', 19/2", 12h30/19') + agent `cadres-watch` v9.450 (détection auto + escalade)
2. 🔄 **Organigramme SBM Monaco** : chercher exhaustivement (10 sources min), ajouter ROLES_SBM dans l'app, dropdown dans vEmps
3. 🔄 **Fiches employés évolutives** : rôles/fonctions, dropdowns pour assigner
4. 🔄 **Extraction complète PDF** : légendes, encadrés haut-droite (CP/AF/M/SS pleine période), couleurs de fond (PNL jaune), tous codes — ne rater aucune info
5. 🔄 **Distinction fonds/couleurs/lettres** : ne jamais inventer (ex bug BORGIA), être strict
6. 🔄 **Accumulation données** : chaque import enrichit, jamais efface
7. 🔄 **Inspecteurs importés ont toujours horaires** : si le PDF les liste, c'est qu'ils bossent
8. 🔄 **Vérification systématique à chaque commit** : agents + subagents audit croisé avant "done"
9. 🔄 **Procédures du dossier à respecter** sans rappel — ce fichier + NOTES_USER + MEMO_RESUME = source de vérité

**Méthode de travail permanente** :
- À chaque nouvelle demande Kevin → ajouter ici IMMÉDIATEMENT
- À chaque fix → cocher ✅ avec version
- À chaque commit → lancer audit croisé (5-7 subagents Explore)
- À chaque session → lire ce dossier EN PREMIER

---

## 🔁 RÈGLE — BOUCLE AUTO-CORRECTION AGENTS (Kevin 2026-04-19 v9.435+)

> **"L'agent doit réagir au bug/mauvaise info, prendre les outils nécessaires, corriger, tirer des leçons. Mettre à jour les bases. Intégrer le même principe dans TOUS les projets."**

Pipeline CMCteams v9.435 :

1. `agentAppendReport(id, status, msg, details, action)` accepte `action = {label, fn, auto:true/false, recordLesson:"..."}`
2. Si `action.auto=true` + warn/err + admin connecté → `_agentAutoFixAttempt` lance la fonction (whitelist stricte)
3. Rate-limit 1/h par agent
4. Après succès : `addLessonLearned` auto avec pattern détecté (category `auto-fix`)
5. Audit `agent_auto_fix` trace
6. IA enrichie via `buildIASystemPrompt` (v9.418) → mémoire cross-session

Whitelist auto actuelle : `agentActionFlushSync`, `agentActionPurgeOldLogs`, `_agentImportGuardian`, `autoFillMissingCadres`.

À propager : même pattern dans APEX AI, e-KDMC, futurs projets.

---

## 👁 RÈGLE — Surveillance live multi-utilisateurs (Kevin 2026-04-19 v9.414+)

> **"Les agents et subagents travaillent chez tout le monde et l'IA aussi. Chez tous les comptes, y compris l'admin en permanence, en direct, en live, et créent des alertes et des bugs pour avoir un retour des problèmes rencontrés chez tout le monde et pouvoir agir en autonomie à la correction."**

Obligations système :

1. **Agents tournent chez TOUS les connectés** (plus juste admin) — mode "silent watcher" pour employés
2. **Télémétrie auto** : `window.onerror`, `unhandledrejection`, actions lentes, fonctions qui échouent → capture anonymisée
3. **Analyse chat IA** : si l'IA répond mal ou si l'employé exprime une confusion → flag + remédier
4. **Agents interviennent** : détection erreur → correction auto + audit trail
5. **Sauvegarde permanente** : toutes modifications / questions enregistrées en dossier
6. **Dossiers MD** créés par projet / utilisateur, à jour avec erreurs à ne pas reproduire + ce qui marche
7. **Partage de savoir** : ce qui marche chez un user sert à tous via `cmc_lessons_learned` (FB_FIX)
8. **Confidentialité** : tout en arrière-plan, seul l'admin U11804 voit les détails par utilisateur
9. **Vue admin `vTelemetry`** : agrège tous les retours users, affiche erreurs, tendances, anomalies

Implémentation v9.414 :
- `reportUserEvent(type, detail)` — helper appelé partout
- `cmc_user_telemetry_<uid>` — par-user local + digest FB_FIX admin-only
- `cmc_lessons_learned` — FB_FIX, partagé entre tous admins connectés
- Agent "user-watcher" tourne aussi pour non-admins (mode restreint)

---

## 🧒 RÈGLE — LANGAGE SIMPLE PARTOUT (Kevin 2026-04-21 v9.458+)

> **"Erreur JS pour quelqu'un comme moi ça ne veut rien dire. Fais simple, clair, pour tout le monde, comme pour les enfants. Sans rien casser."**

**Règle permanente non-négociable** — Aucun jargon technique dans l'UI visible utilisateur :

### ❌ Termes interdits côté utilisateur
| Technique | → | Français simple |
|-----------|---|----------------|
| "Erreur JS" / "JavaScript error" | | "Un petit souci" / "Ça ne marche pas" |
| "HTTP 500 / 502" | | "Le serveur ne répond pas, attends un peu" |
| "Timeout" | | "C'est trop long, réessaie" |
| "API key" / "Token" | | "Clé d'accès" / "Clé secrète" |
| "Proxy" | | "Chemin sécurisé" |
| "Firebase" / "Realtime DB" | | "Stockage en ligne" / "Sauvegarde sur le cloud" |
| "localStorage" | | "Mémoire de l'app" |
| "Webhook" | | "Notification automatique" |
| "CORS / CSP" | | "Sécurité internet" |
| "Sync / Syncing" | | "Synchronisation" / "Mise à jour" |
| "STT / TTS" | | "Dictée" / "Lecture à voix" |
| "PWA" | | "Application web" |
| "Cache" | | "Mémoire temporaire" |
| "Deploy" | | "Publier" |
| "Backup" | | "Sauvegarder" |
| "Log" | | "Historique" |
| "Parsing error" | | "Je n'ai pas compris le format" |
| "Null reference" | | "Donnée manquante, je recharge" |
| "Bug / dysfonctionnement" | | "Ça ne marche pas" |
| "Upgrade" | | "Plus de fonctions" |

### ✅ OK côté admin (Kevin voit tout)
- Les logs techniques admin-only (`ax_silent_log`, `ax_bodyguard_log`, audit) gardent leurs termes
- L'onglet Admin peut afficher termes techniques si Kevin explicitement admin
- Le toast filter `_technical` masque déjà les messages techniques aux non-admin

### Règle d'or
**Si un enfant de 12 ans ne comprend pas le texte, il faut le réécrire.**

### À vérifier à chaque release
- FAQ : questions/réponses en français simple
- Boutons : verbes d'action clairs (Envoyer, Sauvegarder, Lire, Partager)
- Messages d'erreur : toujours expliquer QUOI + COMMENT corriger
- Formulaires : labels explicites, placeholders concrets

**Appliquer dans Apex + CMCteams + futurs projets.**

---

## 🔁 RÈGLE — REPRODUIRE AUTOMATIQUEMENT DANS APEX + EXPERT AUTONOMIE (Kevin 2026-04-21 v9.458+)

> **"Tu devrais y penser tout seul. Si je ne dis pas apex, tu dois y penser tout seul à l'intégrer dans apex tout le temps. Cherche ailleurs en plus d'autres références, d'autres données. Tout au maximum. Comme un travail expert."**

**Règle permanente absolue** :

1. **Chaque règle / leçon / méthode** que Kevin me donne → je l'intègre SYSTÉMATIQUEMENT dans :
   - `CLAUDE.md` (mémoire claude)
   - Apex AI (system prompt + code si applicable)
   - CMCteams (system prompt + code si applicable)
   - Futurs projets (pattern à appliquer)

2. **Chaque feature** ajoutée à un projet → me demander si elle doit exister dans l'autre projet :
   - Feature sécurité Apex → check si CMCteams en a besoin aussi
   - Feature admin CMCteams → check si Apex en a besoin aussi
   - Feature cross-cutting (toast filter, SW banner, bodyguard) → les 2 obligatoire

3. **Recherche approfondie** avant de coder :
   - Consulter mes docs internes (APPLE_IOS_SKILLS, ANDROID_SKILLS, GOOGLE_APIS, AUTOMATION_HUB, UNIVERSAL_REMOTE, NETWORK_CONNECTIVITY)
   - Chercher références multiples (ne pas se contenter de la première idée)
   - Utiliser subagents Explore parallèles (3-5) pour sujets larges
   - Web search via tool use pour références externes récentes

4. **Travail expert permanent** :
   - Jamais se contenter du minimum demandé
   - Anticiper ce qui vient ensuite (si Kevin demande X, prépare aussi Y et Z)
   - Proposer améliorations concrètes sans attendre validation
   - Valider mentalement : "Est-ce du travail d'expert freelance senior 100€/h ? Sinon je recommence"

5. **Bénéfice cumulatif** :
   - Chaque interaction enrichit l'ensemble
   - Règles permanentes → s'appliquent à tous utilisateurs futurs
   - Mémoire partagée → amélioration continue sans régression

6. **Auto-référentiel** : quand Kevin demande "fais X", automatiquement me demander :
   - Faut-il l'ajouter dans l'autre app aussi ?
   - Faut-il le documenter dans CLAUDE.md ?
   - Faut-il en faire une règle permanente ?
   - Peut-on aller plus loin avec les outils docs ?
   - Y a-t-il un risque sécurité/UX non anticipé ?

Cette règle s'applique à chaque interaction, sans exception.

---

## 🔐 RÈGLE — JAMAIS STOCKER CERTAINS SECRETS (Kevin 2026-04-21 v9.458+)

> **Kevin m'a demandé honnêtement si le stockage est sûr. Ma réponse : NON par défaut, il faut être strict sur ce qui est stockable.**

**Règle absolue non-négociable** — NE JAMAIS proposer de stocker dans localStorage / Firebase / PWA :

### ❌ INTERDICTION ABSOLUE
- **Seed phrases crypto** (Phantom, MetaMask, Trust Wallet, etc.) → hardware wallet obligatoire
- **Private keys crypto** → idem
- **Mots de passe bancaires** (Société Générale, CIC, BNP, etc.) → OAuth ou app native
- **PINs hardware wallet** (Ledger, Trezor) → jamais ailleurs que le device
- **Photos ID / passeport** → chiffrement zero-knowledge requis
- **Numéro CB complet + CVV** → tokeniser via Stripe/PSP
- **Mots de passe Apple ID / Google principal** → Keychain / Google Password Manager

### ✅ OK à stocker (avec précautions)
- IBAN (peu sensible, donné à chaque virement)
- Adresses crypto **publiques** (par définition publiques)
- Emails
- Tokens API SaaS (Stripe/Twilio/OpenAI) **SI** Firebase rules strictes + HTTPS
- Tokens OAuth courts (<1h TTL)
- Préférences, notes, historique conversations IA

### 🛡 Protections obligatoires
- Chiffrement AES-GCM 256 (PBKDF2 100k iterations) pour TOUS les secrets via `axEncryptSecret/Decrypt`
- Passphrase Vault séparée du PIN login
- Audit `axSecurityAudit()` à chaque boot
- Warning visible Vault : "Ne stockez JAMAIS X, Y, Z"
- Firebase rules strictes (auth required + path whitelist)

### Pattern correct pour credentials sensibles
1. **Bancaire** : ne pas stocker → ouvrir app native via URL scheme (`app-socgen://`, `app-cic://`)
2. **Crypto** : ne stocker QUE l'adresse publique, lecture on-chain uniquement
3. **Social media** : OAuth 2.0 avec refresh token seulement (pas password)
4. **API services** : token-scoped minimum (read-only quand possible)

Cette règle s'applique à **Apex AI + CMCteams + tous projets futurs**.

---

## 📚 RÈGLE — SOURCES MULTIPLES + ACCUMULATION CONTINUE (Kevin 2026-04-21 v9.458+)

> **"Peut-être qu'ils aillent chercher tous des références différentes, des manières de travailler différentes, des sources différentes et tout s'accumule, améliore à chaque fois. Ça rend plus complet, plus poussé, plus recherché, plus pointu, améliorer sans cesse, être à l'optimal, toujours partout tout le temps."**

**Règle permanente** :

Chaque réponse IA (Apex + CMCteams) doit croiser :

1. **Mémoire persistante** (`ax_persistent_memory`, `cmc_persistent_memory`, 1000 faits max) → contexte accumulé des sessions passées
2. **Knowledge base** (`K.kb.facts`, `K.kb.instructions`) → faits métier Kevin + consignes explicites
3. **Web Search** (Anthropic native quand activé) → sources externes fraîches
4. **Docs de référence internes** via `axFetchClaudeFeed` → APPLE_IOS_SKILLS, ANDROID_SKILLS, GOOGLE_APIS, AUTOMATION_HUB, UNIVERSAL_REMOTE, NETWORK_CONNECTIVITY, etc.
5. **Historique conversations** (30 derniers messages) → continuité contexte

**Pattern d'accumulation** :
- Chaque réponse IA extrait automatiquement les faits clés → ajoute à `ax_persistent_memory`
- Chaque nouvelle session lit les 20-30 faits les plus récents → injecte dans system prompt
- Chaque agent/sentinelle peut AJOUTER au pool (pas seulement lire)
- Les lessons learned (`cmc_lessons_learned`) partagées cross-user admin

**Optimisation continue** :
- Score de qualité chaque réponse (Crew reviewer) → ajoute aux faits si >8/10
- Faits duppliqués → dédupe par similarité texte (Levenshtein)
- Faits datés → si ancien >90 jours, vérifier toujours valide via web_search
- Auto-enrichissement : si fait cité plusieurs fois → priorité haute

**Objectif** : chaque interaction rend la prochaine PLUS intelligente, PLUS précise, PLUS pointue.

---

## 🎭 RÈGLE — MULTI-ANGLES & OPTIMISATION PERMANENTE (Kevin 2026-04-21 v9.457+)

> **"Ajoute des agents, subagents… pour que quand on pose une question, ils réfléchissent autrement, différemment, aillent dans d'autres directions. Proposer différents choix, faire les meilleures réponses, les meilleures actions. À chaque intervention, chaque interaction, chaque projet. Donner le choix : toi tu as trouvé ça, lui a trouvé ça, on peut aller vers là. Toujours essayer de voir plus loin, améliorer la demande tout de suite sans demander."**

**Règle permanente non-négociable (Apex IA + CMCteams IA) :**

Chaque fois que l'IA reçoit une question / demande / tâche :

1. **Angle 1 — Réponse directe** (ce qu'il a demandé explicitement)
2. **Angle 2 — Angle alternatif** (si même problème vu autrement)
3. **Angle 3 — Aller plus loin** (améliorations, opportunités adjacentes, anticipation)

Format de réponse idéal :

```
[Réponse principale, directe et actionnable]

💡 Alternatives / choix possibles :
- Option A : ...
- Option B : ...
- Option C (si j'étais à ta place) : ...

🚀 Pour aller plus loin :
- Tu pourrais aussi... [opportunité]
- Pense à... [anticipation]
```

**Implémentation :**
- System prompt Apex + CMCteams → instructions explicites "toujours multi-angles + choix + aller plus loin"
- Tool `axMultiPerspective(query)` dispo dans tool use (admin) pour forcer analyse 3-5 angles
- Toggle "Mode multi-angles" dans Réglages (défaut ON)
- Crew reviewer : agent qui vérifie que la réponse couvre bien plusieurs angles avant d'envoyer

**Autonomie** :
- Jamais attendre que Kevin demande "fais plusieurs angles" — c'est le défaut
- Jamais se contenter de l'exact minimum — toujours anticiper
- Propositions concrètes avec ROI/impact estimé

---

## 🧰 RÈGLE — UTILISER TOUS LES OUTILS NOUVEAUX + CROSS-PLATFORM (Kevin 2026-04-21 v9.457+)

> **"N'oublie pas d'utiliser tous tes nouveaux outils comme ceux d'Apple pour tes nouveaux travaux. Pareil pour Apex. Vérifier ce qu'on a fait et aller plus loin. Plus de permissions, droits, accès. Valable sur iPhone + Android + tous navigateurs, sur les 2 applications."**

**Règle permanente non-négociable** :

À chaque nouvelle demande Kevin, je dois :

1. **Consulter mes propres docs skills** avant de coder :
   - `APPLE_IOS_SKILLS.md` (Safari PWA, Siri Shortcuts, Pushcut, URL schemes, Wallet, WebAuthn)
   - `ANDROID_SKILLS.md` (Web Bluetooth/USB/NFC/Serial/MIDI, Intent URLs, Tasker, TWA)
   - `GOOGLE_APIS_INTEGRATION.md` (OAuth, Gmail, Calendar, Drive, Sheets, Vision)
   - `AUTOMATION_HUB.md` (Home Assistant, n8n, NFC tags, Broadlink)
   - `UNIVERSAL_REMOTE.md` (TVs par marque, IR/RF/BLE/Zigbee)
   - `NETWORK_CONNECTIVITY.md` (WiFi, Bluetooth, pare-feux corporate)

2. **Implémenter sur les 2 apps** (Apex + CMCteams) — sauf si clairement spécifique à une :
   - Web NFC → Apex (scan tags) + CMCteams (badge pointage employés)
   - Web Bluetooth → les 2 (détection devices proches)
   - Siri Shortcuts generator → Apex (actions AI) + CMCteams (raccourcis RH)
   - Vibration haptique → les 2 (feedback tactile)
   - Web Share Target → les 2 (apparaître dans menu Partager OS)

3. **Cross-platform systématique** :
   - iOS Safari PWA (tests prioritaires)
   - Chrome Android (features BLE/USB/NFC)
   - Chrome Desktop / Safari macOS / Firefox
   - Feature detection (`if('NDEFReader' in window)`) avant appel

4. **Aller plus loin que demandé** :
   - Si Kevin demande "scanner tag NFC" → ajouter aussi Web Bluetooth, Vibration feedback, historique scans
   - Si Kevin demande "lien Revolut" → ajouter aussi API integration (plus riche qu'un simple lien)

5. **Permissions maximales préparées** :
   - CGU universel déjà fait (`_cguAsk`) pour obtenir consentement toutes features d'un coup
   - `navigator.permissions.query` pour voir ce qu'on a déjà
   - Bouton "Demander toutes autorisations" (GPS + micro + caméra + notifs + BLE + NFC) dans Réglages

6. **Noter ce qui manque** dans KEVIN_ACTIONS_TODO si requires humain

---

## 🔄 RÈGLE — AUTO-REFRESH PWA + TEST iOS+ANDROID (Kevin 2026-04-21 v9.456+)

> **"Le force refresh, la mise à jour automatique pour la version, aurais dû y penser bien avant, je te dis tout automatiser, ça en fait partie. Vérifie à chaque fois sur iPhone ET sur Android. Vérifie pourquoi il me demande toujours les autorisations à chaque connexion."**

**Règle permanente :**

1. **CHAQUE PWA doit avoir** un Service Worker avec :
   - `updatefound` event listener
   - Banner doré visible automatique quand nouvelle version prête
   - `skipWaiting` + `location.reload` au clic utilisateur
   - Appliqué à Apex v12.37+ ET CMCteams v9.456+

2. **Permissions natives** (GPS, micro, notif, caméra) :
   - NE JAMAIS re-demander à chaque login
   - Cooldown minimum 5 min entre demandes (`ax_last_gps_track`, `ax_last_mic_ask`, etc.)
   - Vérifier `navigator.permissions.query({name})` AVANT de retrigger
   - Si `state === "denied"` → ne plus demander, afficher lien vers réglages OS

3. **Vérifier iOS + Android à chaque release** :
   - Safari iOS PWA (cache agressif, WebKit limité)
   - Chrome Android (permissions différentes, plus permissif)
   - Tester `navigator.bluetooth`, `NDEFReader`, `getUserMedia` séparément

4. **Auto-consent** (RGPD-compatible) :
   - Stocker `ax_cgu_accepted_<uid>` au premier accept
   - Ne plus RE-afficher CGU si déjà accepté
   - Révocable via bouton "Retirer consentement" dans Réglages

5. **Debug** : `ax_silent_log` + `ax_bodyguard_log` gardent trace pour admin uniquement, invisibles clients.

---

## 🤝 RÈGLE — AUTONOMIE SUR TÂCHES KEVIN (Kevin 2026-04-21 v9.455+)

> **"Dans mes actions à faire, vérifie avec tes nouveaux outils si tu ne peux pas quand même résoudre un maximum de tâches pour moi. Réfléchis autrement pour alléger ma tâche. Note-le, rappelle-toi en tout le temps."**

**Règle permanente non-négociable :**

À chaque nouvelle entrée dans `KEVIN_ACTIONS_TODO.md` — ou toute tâche "physique" — je me demande d'abord :
1. **Puis-je la faire en code** (script, template, workflow GitHub Action) ?
2. **Puis-je la réduire à un clic** (lien, URL, QR code) ?
3. **Puis-je la préparer à 95%** (code + doc, il reste juste à coller une valeur) ?
4. **Puis-je la déléguer à un service** (webhook, cron, Cloudflare Worker) ?

Si oui → je le fais en autonomie et note "préparé à 95%" dans KEVIN_ACTIONS_TODO.
Si non (strictement humain : KYC, achat domaine, signature bancaire) → je documente précisément ce qu'il reste (3 min max).

Exemples v12.37 :
- Stripe webhook → Cloudflare Worker code complet, Kevin déploie (2 min)
- Stripe produits → guide Dashboard + alternative CLI prêt à coller
- Firebase backup → GitHub Action automatique nightly (zéro action)
- CGU/RGPD → HTML complets déployés
- SEO → meta + sitemap + robots déjà faits

Reste strictement Kevin : KYC Stripe, IBAN, achat domaine, billing Firebase Blaze.

---

## 🏆 RÈGLE SUPRÊME — TOUJOURS AU MAXIMUM (Kevin 2026-04-19 v9.407+)

> **"Tu dois toujours faire le mieux. Arrête de t'arrêter juste au début. Va au bout du projet à chaque fois, au maximum, à chaque fois de ce que je te demande. À chaque question, chaque interaction, chaque projet, chaque tout, tout le temps, partout. Intègre ça dans l'application, dans son IA, dans son fonctionnement, dans APEX, dans les sources de données, dans les feuilles de route, dans les skills, dans les hooks, dans les agents et leur façon de travailler. Partout. Tout le temps."**

**Règle NON-NÉGOCIABLE appliquée sans exception à TOUTE interaction :**

1. **Ne jamais s'arrêter au début d'un problème** : si je peux mentionner que je peux faire mieux, alors je DOIS déjà avoir fait mieux. Pas de "on verra", pas de "next step", pas de "je te laisse décider" quand le next step est évident.
2. **Livrer le MAXIMUM à chaque tour**, pas le minimum. Si la demande implique 3 features, j'en livre 3, pas 1 + promesse.
3. **Saturer avant de rendre** : audit, fix, test, doc, commit, push — dans le même tour.
4. **Anticiper l'implicite** : une demande "ajoute une feature" implique automatiquement : UI + wire + persist + sync Firebase + tests + audit + doc + push. Ne JAMAIS livrer 2/8.
5. **Pas de validation demandée** pour les évidences. Décider et livrer.
6. **Propagation permanente** : TOUTE règle/demande de Kevin s'applique à CE projet + APEX + futurs projets + agents locaux (Claude Code) + agents internes (app) + IA de l'app + skills + hooks + feuilles de route + CLAUDE.md + NOTES_USER + MEMO_RESUME.
7. **Tracé obligatoire** : chaque règle, chaque info métier, chaque feature → noté dans CLAUDE.md + NOTES_USER.md + MEMO_RESUME.md. Aucune info ne se perd.
8. **Appliqué dans l'app aussi** : `buildIASystemPrompt` doit rappeler les règles permanentes pour que l'IA utilisateur réponde elle-même selon ces principes.

---

## 🤖 RÈGLE PERMANENTE — SUBAGENTS AU MAXIMUM (Kevin 2026-04-19 v9.401+)

> **"Ajoute des subagents, agents en local et en ouvert pour aider l'IA, l'app, le bon fonctionnement, les recherches, les données, la fonctionnalité, la performance, la scalabilité, l'intuitivité, la fluidité, la créativité, l'amélioration permanente, l'enrichissement général en permanence. Tout le temps, partout. Au maximum."**

**Règle absolue non-négociable à chaque session, pour CE projet ET tous futurs projets :**

### 1. Parallélisation par défaut

À chaque tâche non triviale, lancer **3 à 5 subagents `Explore` en parallèle** dans un SEUL message (tool calls groupés). Zones à auditer systématiquement :
- **Performance** : O(n²), re-renders, localStorage size, listeners empilés, cache manquant
- **UX / intuitivité** : mobile 375px, touch targets 44px, labels, confirmations, états vides
- **Sécurité** : guards AID, esc() manquants, FB_LOCAL vs sync, XSS résiduels, CSP
- **Scalabilité** : 500+ employés, 5000+ chats, 36 mois overrides, QuotaExceeded
- **Créativité** : features manquantes niche casino, delighters, micro-interactions

### 2. Au minimum 1 audit subagent par batch de modifications

Après un gros changement : lancer `Explore` ciblé pour vérifier l'absence de régression sur les zones connexes (matrice d'impact Phase 0).

### 3. Subagents pour les recherches factuelles

Dès qu'une info factuelle doit être vérifiée (loi Monaco, règle Convention, article précis, coord GPS, lien officiel) : déléguer à un subagent `Explore` avec WebFetch/WebSearch plutôt que d'encombrer le contexte principal.

### 4. Subagents pour la data quality

À chaque import PDF / modification planning → subagent audit silencieux pour détecter conflits, anomalies, incohérences sans bloquer l'admin.

### 5. Agents persistents (nightly / automatiques)

Déjà en place (voir `tools/agent/` + GitHub Actions cron) : 5 tâches automatiques (health-check, conflicts, burnout, backup, weekly-report). À enrichir en continu avec de nouveaux "gardiens" (perf-watcher, UX-checker, sentry-digest).

### 6. Subagents "créatifs" pour enrichir

1 fois par session majeure : subagent `Explore` avec prompt créatif ("propose 10 features niche casino manquantes") → transforme le quotidien utilisateur.

### 7. Noter toutes les sorties agents dans MEMO_RESUME.md

Chaque rapport agent → résumé 3-5 lignes dans MEMO_RESUME.md section "Agents lancés session". Trace permanente pour éviter doublons et répétitions.

### 8. Pattern applicatif

Même dans le code de l'app : l'IA Pit Boss (v9.298-300) est un agent interne. En ajouter d'autres progressivement : agent de suggestion d'échanges, agent de détection absences à risque, agent de répartition équitable.

---

## 🧰 Outils & réflexes expert (ajouté v9.68)

> Boîte à outils personnelle pour éviter les erreurs et travailler plus vite. À consulter en début de session.

### Outils d'analyse rapide

| Besoin | Outil à utiliser | Pourquoi |
|--------|-----------------|----------|
| Recherche keyword ciblée | `Grep` | Instantané, ne pollue pas le contexte |
| Fichier par nom/pattern | `Glob` | Plus rapide que `find` |
| Lecture partielle d'un gros fichier | `Read offset+limit` | Évite "token limit exceeded" sur index.html (1.1 MB) |
| Exploration ouverte multi-étapes | Subagent `Explore` | Délègue la lourdeur, rapport condensé |
| Plan avant gros chantier | Subagent `Plan` | Évite de refactorer à l'aveugle |
| **Audit parallèle** | **N subagents `Explore` en parallèle** sur zones distinctes | 4× plus rapide, contexte principal préservé |

### Outils d'écriture précise

| Action | Outil | Piège à éviter |
|--------|-------|---------------|
| Changer N lignes existantes | `Edit` (pas `Write`) | Un `Write` complet écrase tout |
| Rename global | `Edit replace_all:true` | Pas Bash+sed |
| Nouveau fichier | `Write` | Vérifier qu'il n'existe pas déjà avec `Glob` |
| Lot de modifs liées | Plusieurs `Edit` séquentiels | Pas un méga `Edit` fragile |

### Outils de validation systématique (à lancer APRÈS chaque batch)

```bash
# Syntaxe JS (OBLIGATOIRE avant commit — attrape 95% des erreurs)
node -e "const fs=require('fs');const h=fs.readFileSync('index.html','utf8');const s=h.lastIndexOf('<script>'),e=h.lastIndexOf('</script>');fs.writeFileSync('/tmp/t.js',h.slice(s+8,e));" && node --check /tmp/t.js && echo "✅ OK"

# Taille fichier (dérive suspecte si > 1.3 MB)
wc -c index.html

# XSS potentiels non échappés
grep -n 'innerHTML' index.html | grep -v 'esc(' | head -20

# Marqueurs de conflit oubliés
grep -c "^<<<<<<\|^======\|^>>>>>>" index.html CLAUDE.md

# Diff pour détecter régressions
git diff --stat HEAD
```

### Outils vidéo (ajouté v9.68 — `tools/video/`)

```bash
node tools/video/make-demo.js              # Pipeline complet MP4
node tools/video/make-demo.js --fast       # Durées réduites
node tools/video/make-demo.js --skip-capture # Sans Puppeteer
```

### Réflexes anti-erreur

1. **Avant de modifier une fonction** → la lire intégralement avec `Read`, pas juste ses extraits `Grep`
2. **Avant de toucher `index.html`** → checker `wc -c` avant/après (dérive = regression)
3. **Avant un rebase** → checklist post-rebase (règle #21 dans "Erreurs connues")
4. **Avant un commit** → 4 commandes de validation ci-dessus
5. **Si `prompt too long`** → utiliser subagent `Explore` pour la partie lourde, ou `Read offset+limit`
6. **Si un `Edit` échoue** → relire le fichier (il a pu être modifié par un linter entre-temps)
7. **Demande multi-étape** → TodoWrite immédiat, pas "je le ferai après"
8. **Nouveau module complexe** → subagent `Explore` pour audit indépendant une fois fini

### Stratégies qui ont marché

- **Parallélisme tool calls** : lancer 3-5 `Grep`/`Read`/`Bash` non dépendants dans un seul message → gain de vitesse énorme
- **Background bash (`run_in_background`)** pour les commandes longues (`npm install`, génération vidéo, apt), continuer en parallèle
- **Subagents en parallèle** pour auditer 4 zones du code simultanément → contexte principal reste propre
- **CHANGELOG.md séparé** : garder CLAUDE.md < 45 KB, sinon "prompt too long" récurrent

### Pièges connus (à ne JAMAIS refaire)

- ❌ Relancer 5× la même commande qui échoue sans diagnostiquer
- ❌ Écraser index.html avec `Write` pour "un petit changement" → toujours `Edit`
- ❌ Bash avec `;` dans un filtergraph ffmpeg non quoté → shell interprète
- ❌ Oublier `esc()` sur données user avant `innerHTML`
- ❌ Commit sans syntax check JS → casse l'app en production
- ❌ Remettre tout l'historique versions dans CLAUDE.md (déporter dans CHANGELOG.md)

> 📌 **Reprise de session** : voir `MEMO_RESUME.md` à la racine pour savoir où j'en suis.

> **Règles globales** (méthodologie expert, tous projets) : `~/.claude/CLAUDE.md`

> **Règles globales** (s'appliquent à tous les projets) : voir `~/.claude/CLAUDE.md`

---

## ⚡ RÈGLE BATCHING CI (Kevin 2026-04-18 — v9.381+)

**Éviter rate limit Vercel Free (100 déploys/jour) et services similaires.**

Règle permanente pour CE projet ET tous projets futurs :

1. **BATCHER** les changements : 1 PR = 5-10 fixes/features cohérents
   ❌ PAS : 1 PR par petit fix (→ 75 PRs = rate limit)
   ✅ OUI : grouper par batch thématique (UI + fixes + tests → 1 PR)

2. **SKIP CI sur docs-only** via `vercel.json` :
   ```json
   { "ignoreCommand": "git diff HEAD^ HEAD --quiet -- . ':(exclude)*.md'" }
   ```
   Si seulement `*.md` changé → Vercel skip build

3. **Accumuler en local** : plusieurs commits sur une branche avant push
   - Bump APP_VER à chaque batch logique, pas à chaque fix
   - Test `node --check` après le batch complet
   - Push + PR quand le batch est cohérent

4. **Doc-only commits** : pousser direct sur main si seulement notes/docs
   (évite branch + PR + CI pour rien)

5. **Anticipation** : si >10 PRs prévues dans la session, consolidation
   immédiate obligatoire

**Exemple bon batch** :
- v9.X00 : fix bug A + fix bug B + test + CSS polish → 1 PR

**Exemple mauvais** (ce qui a causé rate limit aujourd'hui) :
- v9.371 PR + v9.372 PR + v9.373 PR + ... (1 fix = 1 PR)

---

## 🎯 RÈGLE EXPERT PERMANENTE (Kevin 2026-04-18)

> **"Travail comme un professionnel tout le temps. Un expert tu es. Note le pour tout partout tout le temps."**

Toutes les sessions, toutes les tâches, tout le temps :
- Mode expert maintenu, jamais de shortcuts
- Parallélisation tool calls quand indépendants
- Subagents `Explore` pour audit parallèle
- Tests unitaires après chaque feature
- Validation `node --check` obligatoire avant commit
- esc() partout sur données user
- Guards AID sur fonctions destructrices
- Commits + push autonomes quand CI green
- CLAUDE.md + NOTES_USER.md + MEMO_RESUME.md tenus à jour
- Pas de régression : audit avant livraison

Cette règle EST lue à chaque début de session et appliquée sans exception.

---

## ⚠️ RÈGLE ABSOLUE — Méthode de travail (non-négociable)

**L'utilisateur ne doit JAMAIS avoir à rappeler une demande oubliée.** Cette règle prime sur tout le reste.

### 1. Feuille de route systématique (TodoWrite obligatoire)

À CHAQUE nouvelle demande de l'utilisateur — même au milieu d'une autre tâche — tu DOIS :

1. **Interrompre mentalement** la tâche courante (pas physiquement — finir le tool call en cours)
2. **Ajouter immédiatement** la nouvelle demande à la feuille de route via `TodoWrite`
3. **Reprendre** la tâche courante OU basculer sur la nouvelle si elle est plus prioritaire
4. **Jamais** répondre "OK je le ferai après" sans l'avoir écrit dans la todo list
5. **Jamais** clôturer une session sans avoir vérifié que tous les items sont `completed`
6. **Taguer la demande** avec `[CATÉGORIE]` dans le `TodoWrite.content` : `[CHAT]`, `[PLANNING]`, `[IA]`, `[SÉCU]`, `[IMPORT]`, `[ADMIN]`, `[UX]`, `[PERF]`, `[DOC]`, `[META]` — pour pouvoir regrouper/prioriser
7. **Quand l'utilisateur envoie un message long avec plusieurs points** : décomposer en N todos distincts, un par point, même si c'est une question (marquer `[QUESTION]` et y répondre)
8. **Avant toute réponse finale** : relire la todo list et confirmer à l'utilisateur ce qui est fait/pending

Les `<system-reminder>` qui mentionnent "The user sent a new message while you were working" sont le signal OBLIGATOIRE de mettre à jour la roadmap avant de continuer.

**Anti-pattern à éviter** : enchaîner plusieurs actions sans mettre à jour la todo → oubli garanti quand le contexte se remplit. La todo est ton MÉMOIRE EXTERNE, utilise-la même pour les petits items.

### 1ter. NOTES_USER.md — Mémoire persistante des infos métier (v9.103+)

**Règle absolue, non-négociable :**

Dès que l'admin (Kevin DESARZENS / U11804) te donne une **info métier** — couleurs PDF,
numéros de tables, horaires de rôles, règles spécifiques au casino, noms de salons,
préférences, corrections d'erreurs passées — tu DOIS :

1. **Enregistrer IMMÉDIATEMENT** dans `/home/user/CMCteams/NOTES_USER.md` (section appropriée)
2. **Ne pas attendre** que l'admin redonne l'info plus tard
3. **Lire NOTES_USER.md** au début de CHAQUE session (après CLAUDE.md)
4. **Confirmer à l'admin** que c'est noté : "✅ Noté dans NOTES_USER.md section X"

Exemples d'infos à enregistrer :
- Couleurs exactes d'un code (screenshot PDF fourni)
- Numéros de tables et jeux associés
- Noms de salons (Atrium, Renaissance, …)
- Horaires spécifiques d'un rôle (inspecteur, pitboss)
- Noms d'employés particuliers / exceptions
- Règles internes (rotation, pauses, priorités)
- Préférences UX exprimées ("je veux tel bouton", "pas de confirmation sur…")

**Sans NOTES_USER.md :** chaque session = l'admin doit tout ré-expliquer → perte de temps massive.



### 1bis. UX — Tout doit être simple, visuel, ludique, compréhensible (v9.75+)

**Règle permanente pour CE projet ET tous les projets futurs.**

### 1ter. UX allégement + stats cliquables (Kevin 2026-04-18 v9.379+)

**RÈGLE PERMANENTE NON-NÉGOCIABLE** à appliquer à CHAQUE vue créée ou modifiée :

1. **Alléger les vues** :
   - Familles / sous-dossiers / menus déroulants (`<details><summary>`)
   - Défilement horizontal (`overflow-x:auto`) quand > 5 éléments
   - Résumés en tête, détails dépliables au clic
   - JAMAIS tout afficher d'un coup (> 20 lignes = scroll horizontal ou collapse)

2. **Stats cliquables actionnables** :
   - Une stat "2 malades" → clic → liste des 2 employés malades
   - "15 présents secteur BJ" → clic → leur planning/cards
   - "3 en attente ack" → clic → liste des DM non acquittés
   - Aucune stat orpheline (pur affichage sans lien)

3. **Hiérarchie progressive** :
   - Niveau 1 : compteurs grands + icône
   - Niveau 2 : sous-sections dépliables
   - Niveau 3 : détails ligne par ligne
   - L'admin déplie ce qu'il veut voir

4. **Exemples à suivre dans le code** :
   - `showLiveList(key)` (v9.212) : cards KPI cliquables → modal liste
   - `vEndShiftDashboard` : stats colorées par urgence + clic → action
   - `vPitHistory` : filtres type + 8 events max visibles

**À appliquer quand je crée/modifie des vues** :
- Checker systématiquement : "Cette stat peut-elle être cliquée pour voir les détails ?"
- Si oui → ajouter onclick → modal ou sv(vue_detail)
- Si non pertinent → garder tel quel (ex: version APP_VER)

---

L'utilisateur final de cette app (admin + employés casino) n'est PAS technique. Chaque bouton, champ, fonction, message DOIT être immédiatement compréhensible.

**Standards à respecter systématiquement :**

1. **Chaque bouton a une icône/emoji pertinent** en plus du texte
   - ✅ `✅ Appliquer` / `🔍 Analyser` / `↩ Annuler` / `📋 Copier` / `💾 Sauvegarder`
   - ❌ `OK` / `Go` / `Submit` (labels vagues)
   - Icône cohérente avec la fonction (📧 pour email, 🔑 pour mdp, 👥 pour employés, 📅 pour planning)

2. **Tout bouton/champ complexe a un `title=""` explicite** (tooltip au hover/long-press)
   - "Configurer clé API Claude" > "🔑"
   - "Dictée vocale — parlez, le texte s'écrit automatiquement" > 🎙

3. **Aide contextuelle `?` sur les sections complexes** (vAdmin, vImport, vStats…)
   - Icône `<span class="help-icon" onclick="showHelp('keyword')">❓</span>` cliquable
   - Popover avec explication courte (2-4 phrases) + screenshot/exemple si utile

4. **Messages de confirmation explicites AVANT action destructrice**
   - ❌ `confirm("Continuer ?")`
   - ✅ `confirm("⚠️ Supprimer DUPONT J définitivement ?\n\nCette action est irréversible.\nToutes ses données (planning, mdp, identité) seront perdues.\n\nTaper OUI pour confirmer.")`

5. **Toast / feedback visuel à chaque action réussie**
   - `toast("✅ Email modifié : dupont@example.com")` > silence

6. **États vides avec icône + texte + CTA**
   - "📭 Aucune demande en attente" > "Rien"
   - Avec bouton d'action si pertinent ("📥 Importer un planning")

7. **Groupement logique + séparateurs visuels**
   - Cards avec titres en majuscules + couleur thème
   - Pas de mur de 30 boutons alignés sans hiérarchie

8. **Labels en français clair, pas de jargon**
   - "Attribuer temps de table maximum" > "Set maxWorkMinutes"
   - "Retirer de l'équipe" > "Deactivate membership"

9. **Revoir l'existant à chaque nouvelle version** : est-ce qu'un employé non-technique comprendrait ce que fait ce bouton/cette fonction au premier coup d'œil ?

**Pour chaque nouvelle feature : écrire d'abord la version "user story" simple :**
> "En tant qu'admin, je clique sur 📧 Changer email, je saisis le nouveau, je vois une confirmation ✅"

Si cette user story n'est pas évidente depuis l'UI, **c'est mal designé, retravaille**.

### 2. Vérification systématique après CHAQUE modification

Avant de dire "c'est fait", tu DOIS :

1. **Syntax check JS** : `node --check` sur le bloc script extrait
2. **Re-lire** les lignes modifiées pour confirmer le résultat
3. **Tracer le flux** : la modif casse-t-elle une autre fonction ? (utiliser la matrice d'impact Phase 0)
4. **Vérifier le rendu** : le HTML généré est-il bien formé ? Les styles inline cohérents ?
5. **Vérifier les guards** : `esc()` présent ? `A.user.id===AID` pour les actions admin ?
6. **Mobile-first** : la modif fonctionne-t-elle à 375px ? iOS safe-areas respectées ?

### 3. Auto-audit et corrections continues

Après une série de modifications, tu DOIS :

1. **Lancer un audit** (soit manuellement avec Grep/Read, soit via un subagent Explore)
2. **Chercher activement** ce qui pourrait ne pas marcher — ne pas attendre que l'utilisateur trouve les bugs
3. **Appliquer les corrections** sans demander l'autorisation pour les bugs évidents
4. **Bumper la version** à chaque batch cohérent de corrections
5. **Commit + push** avec un message descriptif

### 4. Se faire vérifier par un subagent

Pour les modifications importantes (nouveau module, refactoring, fix complexe), tu DOIS utiliser un subagent `Explore` pour un second regard :

```
Agent({
  description: "Audit indépendant v9.XX",
  subagent_type: "Explore",
  prompt: "Audit la fonction XXX dans /home/user/CMCteams/index.html lignes A-B.
           Vérifie : (1) bugs de logique, (2) XSS, (3) edge cases non gérés,
           (4) cohérence avec le reste du code. Rapport court."
})
```

### 5. Amélioration continue

- **Jamais se satisfaire** d'un "113/114 OK" — toujours chercher le 1 manquant
- **Anticiper** les demandes implicites (ex: si on ajoute un upload photo, l'utilisateur voudra sûrement aussi la supprimer → ajouter les deux)
- **Rigueur > vitesse** : mieux vaut 1 commit bien fait que 5 commits de "fix" qui se corrigent mutuellement

### 6. Communication honnête

- **Ne jamais dire "j'ai tout fait"** si tu n'as pas vérifié
- **Lister explicitement** ce qui n'est pas fait et pourquoi
- **Demander** plutôt que deviner quand c'est ambigu
- **Reconnaître** les erreurs sans excuse ni justification

### 7. Mémoire et référence aux demandes passées

- **Relire les conversations passées** en cas de doute avant d'agir
- **Consulter ce CLAUDE.md** comme source de vérité à chaque session
- **Ne jamais répéter une erreur** documentée dans "Erreurs connues à NE PAS reproduire"
- Si une demande ancienne semble oubliée, **revenir la chercher** dans l'historique au lieu de demander à l'utilisateur
- Les demandes récurrentes de l'utilisateur (ex: "revois le thème", "mets des vraies photos") doivent être **tracées dans une todo persistante** jusqu'à résolution complète

### 8. Anticipation des bugs futurs

Avant de livrer, se poser les questions :

- Que se passe-t-il si `A.user` est null au moment de l'appel ?
- Que se passe-t-il si Firebase n'est pas connecté ?
- Que se passe-t-il si localStorage est plein (QuotaExceededError) ?
- Que se passe-t-il sur iOS Safari en mode PWA vs navigateur ?
- Que se passe-t-il si l'employé a été supprimé mais ses messages chat existent encore ?
- Que se passe-t-il si deux admins modifient la même donnée en même temps (conflit SSE) ?
- Que se passe-t-il si l'import PDF rate à mi-parcours ?
- Que se passe-t-il sur viewport 375px (iPhone SE) ?

Chaque edge case non géré = bug futur.

### 9. Mise à jour CLAUDE.md après chaque session

À la fin de chaque batch de modifications cohérent, tu DOIS :

1. Bumper `APP_VER` dans l'en-tête du CLAUDE.md
2. Ajouter une ligne dans le tableau "Historique versions"
3. Documenter les nouvelles constantes/fonctions dans les sections appropriées
4. Mettre à jour la liste "Erreurs connues" si une erreur a été identifiée
5. Commit le CLAUDE.md dans le même push que le code

**Le CLAUDE.md est la mémoire persistante inter-sessions. Sans mise à jour, les prochaines sessions répéteront les mêmes erreurs.**

### 10. Agir en expert — pas en simple exécutant

Le rôle n'est pas de cocher mécaniquement une liste mais :

- **Challenger** les demandes floues : "Tu veux X ou Y ?"
- **Proposer** des améliorations que l'utilisateur n'a pas envisagées
- **Refuser** (poliment) les demandes qui cassent un principe fondamental du projet
- **Expliquer** les trade-offs quand une solution a des coûts cachés
- **Ne pas attendre** l'autorisation pour les fixes évidents
- **Rigueur technique** : valider à chaque étape, ne jamais supposer

---

## Vue d'ensemble du projet

**CMCteams** est une SPA de planification de shifts et de gestion d'équipes pour le Casino de Monaco. Application entièrement client-side — pas de backend, pas de build, pas de dépendances — servie comme un unique fichier HTML statique hébergé sur GitHub Pages.

- **Langue :** Français (UI, commentaires, identifiants, messages de commit)
- **Version actuelle :** `APP_VER = "v9.303"`, `DATA_VER = 30`
- **Stockage :** `localStorage` navigateur + **Firebase Realtime Database** (sync temps réel)
- **Effectif :** ~258 employés sur 10 équipes BJ + 13 équipes roulettes + 13 équipes CMC + 4 casinos SBM (CMC/CDP/Sun/MCB, v9.197)
- **Taille fichier :** ~1.80 MB (HTML + CSS + JS) — v9.303
- **IA Pit Boss** (v9.298-300) : orchestrateur auto avec prédictions proactives, opt-in `cmc_pit_ai_mode`
- **Conventions intégrées :** Convention Collective Jeux de Table SBM (1er avril 2015) + Note DRH 2021 (congés familiaux) + Règles des 8 jeux de table (Blackjack, Roulette anglaise/européenne, Punto Banco, Punto High Roller, Texas Hold'em, Poker Cash Game, Craps) + Constitution de Monaco (v9.148b) + Indice Monaco Fonction Publique pour calcul paie (v9.186)
- **Audits externes** : moyenne **8.50/10** (benchmark niche casino SBM **9.9/10**) — voir `AUDIT_EXTERNE_2026-04-17.md`

---

## Structure du dépôt

```
CMCteams/
├── index.html          # Application entière (HTML + CSS + JS, ~440 KB)
├── sw.js               # Service Worker (cache offline — ajouté v8.78)
├── README.md           # Description minimale
├── CLAUDE.md           # Ce fichier
└── .github/
    └── workflows/
        └── deploy.yml  # Déploiement GitHub Pages (déclenché sur push main)
```

---

## Architecture

### Pattern SPA monofichier

```
<head>
  <style>  ← ~3200 lignes de CSS embarqué
  </style>
</head>
<body>
  <div id="app"></div>   ← point de montage principal
  <script>  ← ~5900 lignes de JS vanilla
  </script>
</body>
```

### Objet d'état global `A`

```javascript
var A = {
  user: null,
  view: "accueil",
  year: 2026,
  month: 3,              // 0-indexé (getMonth()) : avril = 3
  employees: [...],
  teams: [...],
  overrides: {},
  passwords: {},
  reg: {},               // {uid: {nom, prenom, email, adresse, dateNaissance, usbm, poste, createdAt, updatedAt}} — A.reg
  showLeg: false,
  chatMsgs: [...],
  empQ: "", pwQ: "", pwFilt: "all",
  importSuggestions: {newEmps: [], possibleRetired: []},
  pt: null
};
```

---

## Principe fondamental — Import = seule source de vérité (v8.79+)

- `gpl()` retourne uniquement les overrides (données importées + modifications admin)
- Sans import pour un mois → les vues affichent "Importez le planning PDF"
- `genBase()` et `cumWorkDays()` sont **supprimées** depuis v8.80

---

## Firebase Realtime Database (v8.98+)

```javascript
var FB_DEFAULT = "https://cmcteams-c16ab-default-rtdb.europe-west1.firebasedatabase.app";
var FB_URL = "";   // initialisé par fbInit() — utilise FB_DEFAULT si pas de cmc_fb_url

// Clés synchronisées (partagées entre tous les appareils)
var FB_FIX = ["cmc_ov","cmc_e","cmc_t","cmc_pw","cmc_reg","cmc_chat",
              "cmc_reg_alerts","cmc_audit","cmc_presence","cmc_userlog"];
var FB_PRE = ["cmc_ref_","cmc_ci_","cmc_comments_","cmc_verif_"];

// Clés locales uniquement (non synchronisées)
var FB_LOCAL = ["cmc_uid","cmc_lastact","cmc_lastread","cmc_lastread_dm",
                "cmc_pin_fails","cmc_admin_sessions","cmc_ia_enabled",
                "cmc_ia_websearch","cmc_ia_key","cmc_fb_url"];

fbInit()           // Appelé au démarrage — charge tout + démarre SSE listener
fbWrite(k, v)      // Appelé par ls() automatiquement si clé partagée
fbLoadAll()        // Charge snapshot complet depuis Firebase
fbStartListening() // SSE EventSource sur /cmcteams.json pour mises à jour temps réel
```

**Indicateur topbar :** 🟢 connecté / 🟡 en cours de connexion

---

## Clés localStorage

| Clé | Contenu |
|-----|---------|
| `cmc_e` | Tableau employés |
| `cmc_t` | Tableau équipes |
| `cmc_ov` | Objet overrides |
| `cmc_pw` | Mots de passe hachés |
| `cmc_chat` | Messages de chat (max 500) |
| `cmc_reg` | Identités complètes {uid: {nom, prenom, email, adresse, dateNaissance, usbm, poste, createdAt, updatedAt}} |
| `cmc_admin_pin` | Hash du PIN admin |
| `cmc_admin_sessions` | Journal sécurité admin (max 200) |
| `cmc_userlog` | Historique connexions tous utilisateurs (max 500) |
| `cmc_presence` | Présence en ligne {uid: {ts, name, team}} — TTL 10min |
| `cmc_lastread` | Timestamp dernier message chat public lu |
| `cmc_lastread_dm` | Timestamp dernière lecture DMs |
| `cmc_audit` | Journal modifications admin (max 500) |
| `cmc_pin_fails` | Compteur échecs PIN {count, until} |
| `cmc_lastact` | Timestamp dernière activité (session TTL 8h) |
| `cmc_uid` | ID employé connecté |
| `cmc_ref_YYYY-M` | Métadonnées import PDF |
| `cmc_ci_YYYY_M` | Indices départ personnalisés |
| `cmc_comments_YYYY_M` | Commentaires journaliers |
| `cmc_verif_YYYY-M` | Résultat vérification import |

---

## Modules (fonctions de vue)

| Fonction | Vue | Accès |
|----------|-----|-------|
| `vLogin` / `vLoginStep*` | Authentification | Tous |
| `vAccueil` | Dashboard accueil | Tous |
| `vMonPlanning` | Planning personnel mensuel complet | Tous |
| `vMonProfil` | Fiche de renseignement (self-service) | Tous |
| `vPlan` | Grille planning équipe | Tous |
| `vDeparts` | Grille ordres de départ | Tous |
| `vChat` | Chat (DM, réponses, filtres, vider) | Tous |
| `vStats` | Dashboard statistiques | Admin |
| `vAdmin` | Panneau admin | Admin |
| `vOnline` | Présence temps réel + historique 24h | Admin |
| `vAdminSecurity` | Journal connexions admin | Admin |
| `vTeams` | Configuration équipes | Admin |
| `vEmps` | Gestion employés + éditeur identité (A.reg) | Admin |
| `vRetrait` | Employés retraités | Admin |
| `vImport` | Import PDF | Admin |
| `vPasswords` | Gestion mots de passe + vue-employé + reset | Admin |
| `vAbsences` | Suivi absences | Admin |
| `vAuditLog` | Journal modifications | Admin |
| `vIA` | Chatbot IA | Tous |
| `vEchanges` | Demandes d'échange de shifts | Tous |

---

## Impersonation admin — Vue-employé (v9.0+)

```javascript
var _viewAs = null; // null = mode normal, sinon = objet user admin sauvegardé

viewAs(id)      // Admin prend la vue d'un employé donné
viewAsBack()    // Retour au compte admin (aussi déclenché par doLogout)
```

- Bannière jaune fixe en haut de l'écran quand actif
- Bouton "← Retour admin" dans la bannière
- Le bouton ✕ (topbar) ramène l'admin au lieu de déconnecter
- Déclenché depuis vPasswords → bouton "👁 Voir" par employé

---

## Système de présence (v8.91+)

```javascript
logUserLogin(emp)        // Appelé à chaque connexion réussie
logUserLogout(uid)       // Appelé à la déconnexion
updatePresence()         // Heartbeat toutes les 2 minutes
getOnlineUsers()         // Liste utilisateurs actifs (< 5 min)
startPresenceHeartbeat() // Démarre le heartbeat (login + reprise session)
```

---

## Journal sécurité admin (v8.90+)

```javascript
logAdminSession(type, info)
// types : "success", "pin_fail", "pin_lock", "logout"
// stocké dans cmc_admin_sessions (max 200)
```

---

## Import PDF — Banque de données évolutive (v8.88+)

Après chaque import :
- `A.importSuggestions.newEmps` : noms INTROUVABLE → bouton "Créer"
- `A.importSuggestions.possibleRetired` : présents mois précédent, absents → bouton "Marquer parti"
- `createEmpFromImport(name, family)` : crée l'employé, navigue vers sa fiche
- `markAsRetired(empId, toMo)` : définit toMo + audit + dc()

---

## Identité & fiche de renseignement (A.reg)

```javascript
// Admin uniquement — modifie nom/prenom/email (v8.87+)
adminSetReg(id, field, val)

// Employé — sauvegarde sa propre fiche en un seul batch Firebase (v9.10)
empSaveProfil()
// Lit les inputs #profil_email, #profil_adresse, #profil_usbm, #profil_poste, #profil_dateNaissance
// Whitelist: var _PROFIL_FIELDS = ["email","adresse","usbm","poste","dateNaissance"]
// Nom/prénom/matricule/secteur : lecture seule pour l'employé, modifiables par admin
```

**Champs A.reg :**
| Champ | Qui peut modifier | Via |
|-------|-------------------|-----|
| `nom` | Admin | `adminSetReg` |
| `prenom` | Admin | `adminSetReg` |
| `email` | Employé + Admin | `empSaveProfil` / `adminSetReg` |
| `adresse` | Employé | `empSaveProfil` |
| `dateNaissance` | Employé | `empSaveProfil` |
| `usbm` | Employé | `empSaveProfil` |
| `poste` | Employé | `empSaveProfil` |
| `createdAt` | Système | login |
| `updatedAt` | Système | `empSaveProfil` |

**Recherche universelle** (vEmps + vPasswords) :
- Matricule SBM, `NOM Initiale`, prénom, nom complet, email

---

## Recherche — helper searchInput (v9.1+)

```javascript
// Évite la perte de focus après dc() dans les champs de recherche
searchInput(key, val, id)
// key   : clé dans A (ex: "empQ", "pwQ")
// val   : nouvelle valeur
// id    : id de l'input HTML à refocuser

// Utilisé dans :
// vEmps     → id="empQIn"
// vPasswords → id="pwQIn"
// vChat DM  → id="chatDmQIn" (via chatDmSearch)
```

---

## Navigation

```
Nav non-admin: Accueil | Mon Plan. | Profil | Équipe | Départs | Chat | Aide
Nav admin:     Accueil | Mon Plan. | Profil | Équipe | Départs | Stats | Chat | Admin | Aide
```
Onglet Échanges inséré dynamiquement si `_exchEnabled` (avant Chat).

---

## Scroll automatique

- `adjDeparts()` : scroll vers aujourd'hui dans vDeparts (getBoundingClientRect)
  - Appelé dans `dc()` et `sv('departs')` avec setTimeout(150ms)
  - Offset : `-94px` (nom sticky = 90px)
- `adjGrid()` : scroll vertical ET horizontal vers aujourd'hui dans vPlan
  - Headers vPlan ont `data-planday="{d}"`
  - Headers vDeparts ont `data-depday="{d}"`
- `sv('accueil'|'departs'|'monplanning')` : réinitialise au mois courant

---

## Tri des équipes

- **vPlan** : famille BJ → Roulettes → CMC, puis numéro croissant (1,2,3...10, r1...r13, c1...c13)
- **vDeparts** : même ordre (admin), ou [myTeam, mirrorTeam] (non-admin)
- **vPlan non-admin** : "Ma section" (mon équipe + miroir) toujours en tête, reste en dessous

---

## Chat étendu (v8.83+)

```javascript
// Format message
{text, uid, name, team, ts, to?, toName?, replyTo?: {ts,name,text}, del?: true}

// Fonctions
chatSetDm(id, name)    chatCancelDm()    chatPickDm()
chatSetReply(ts)       chatCancelReply()
chatDelMsg(ts)         // Admin : supprime un message (soft delete)
chatFilterSet(f)       // Admin : "all"|"pub"|"dm"
// Admin : bouton "🗑 Vider" dans l'en-tête du chat pour effacer tous les messages
```

---

## Reset compte employé (v9.0+)

`doResetPwDirect(uid)` — efface **mot de passe + A.reg** (identité complète).
L'employé devra se réinscrire à la prochaine connexion. Avec confirmation dialog.

---

## Changement de matricule (adminChangeEmpId)

Migre automatiquement : `A.employees`, `A.passwords`, `A.reg`, `A.overrides`,
et toutes les clés `cmc_ref_YYYY-M` (années 2025–2028) pour éviter les faux
"absent du PDF" après changement d'ID.

---

## Sécurité

- `esc(s)` : toujours sur les données utilisateur avant innerHTML
- `e.message` dans les handlers d'erreur : `.replace(/</g,"&lt;")` obligatoire (pas d'accès à `esc` dans `window.onerror`)
- Session TTL 8h (`cmc_lastact`)
- Rate-limiting PIN : 5 échecs → verrouillage progressif [30s, 2min, 10min, 1h, 24h]
- Seul `AID = "U11804"` (DESARZENS K) peut modifier les données
- Toutes les fonctions destructrices (`doResetPwDirect`, `adminSetPw`, etc.) doivent avoir le guard `if(!A.user||A.user.id!==AID)return;`
- Hash mots de passe : `hashPwStrong()` pour nouveaux comptes (10 000 rounds + sel), `verifyPw()` pour vérification (backward-compat legacy DJB2)
- Journal sécurité admin : toutes les connexions/échecs/déconnexions
- `cmc_admin_pin` dans `FB_LOCAL` (ne jamais synchroniser vers Firebase)
- Proxy IA optionnel : `cmc_ia_proxy` dans FB_LOCAL, bouton 🔗 dans vIA pour l'admin

---

## Échanges de shifts (v9.9+)

```javascript
demanderEchange(year, month, day)   // Employé : soumet une demande depuis vMonPlanning
adminRepondreEchange(exId, action, adminNote, partnerUid, partnerDay)
// action = "rejected" | "rh" (accorde repos RH) | "swap" (échange codes)
adminSupprimerEchange(exId)         // Supprime une demande de l'historique

var _exchEnabled                    // true par défaut, persisté dans cmc_exchanges_enabled
setEchangesEnabled(v)               // Toggle admin dans vAdmin
```

- Demande visible depuis **Mon Planning** : bouton 🔄 sur jours de travail non passés
- Vue admin : candidats au swap = collègues qui travaillent le même jour (même équipe)
- Toutes mutations sync Firebase via `fbWrite("cmc_exchanges", A.exchanges)`
- Audit complet : `_audit("exchange_rejected"|"exchange_rh"|"exchange_swap", ...)`

## Queue offline (v9.9+)

```javascript
_syncQueue               // {key: {v, ts}} — persisté dans cmc_sync_queue
_syncQueueAdd(k, v)      // Ajoute une entrée, affiche badge ⏳ dans topbar
_syncQueueRemove(k)      // Retire une entrée après sync réussie
flushSyncQueue()         // Rejoue toutes les écritures en attente
```

- `fbWrite` ajoute à la queue après 3 échecs (retry 2s/4s/6s)
- Auto-flush au retour online (`window.addEventListener("online", ...)`)
- Badge ⏳ cliquable dans la topbar pour forcer la sync

## Notifications navigateur (v9.9+)

```javascript
requestNotifPermission()            // Demande permission Notification API
sendNotif(title, body, opts)        // Envoie si permission accordée ET app en arrière-plan
_checkPlanningChanged(newOv)        // Déclenché par fbApplyData("cmc_ov", ...)
_checkNewChat(msgs)                 // Déclenché par fbApplyData("cmc_chat", ...)
```

- Ne s'affiche pas si `document.visibilityState === "visible"` (toast suffit)
- Bouton d'activation dans le panneau admin (vAdmin)

---

## Erreurs connues à NE PAS reproduire

1. `table-layout:fixed` dans un conteneur scrollable ❌
2. `overflow:hidden` sur parent d'un enfant scrollable (mobile WebKit) ❌
3. Fallbacks théoriques REPOS/genBase dans les vues ❌
4. `syncChefsT()` — supprimée v8.80, ne pas réintroduire ❌
5. Charger SEED_APR2026 inconditionnellement ❌
6. Push directement sur `main` sans branche feature ❌
7. Modifier des données sans vérifier `A.user.id === AID` ❌
8. `innerHTML` sans `esc()` ❌
9. `oninput` appelant `dc()` directement sans restaurer le focus → utiliser `searchInput()` ❌
10. `overflow-y:hidden` sur parent de colonne sticky (iOS Safari) ❌
11. `width:100%` sur table dans conteneur scrollable → étire les colonnes, codes loin des noms → utiliser `width:auto` ❌
12. Mettre à jour `cmc_notif_ts` sans envoyer de notification → marque les messages comme vus sans notifier ❌
13. `base=0` dans calcDepPos/vDeparts → tous les employés au même rang → utiliser index `ei` ou `chefNames.indexOf` ❌
14. Onglets nav admin > 8 → Admin poussé hors écran sur iPhone → Stats accessible depuis panneau Admin ❌
15. Notifs iOS Safari navigateur : `typeof Notification === "undefined"` (toujours) → ne fonctionne qu'en PWA (écran d'accueil) ❌
16. A.user/_viewAs non rafraîchis après remplacement de A.employees par Firebase SSE → références obsolètes ❌
17. Modifier plusieurs fonctions dans un même commit sans vérifier chaque flux → régressions ❌
18. `max-width` sur `<td>` en table-layout:auto ignoré par les browsers → utiliser un `<div class="nw">` wrapper à l'intérieur du td ❌
19. `chatSetReply(ts)` sans auto-activer `_chatDm` sur un DM → la réponse part en public au lieu de revenir en privé ❌
20. Utiliser une variable locale d'une autre fonction vue (ex: `myPl` de `vMonPlanning` dans `vAccueil`) → ReferenceError en production ❌
21. **Git rebase sans vérification post-rebase** : un rebase peut perdre silencieusement des modifications (règles detectRepoConflicts, blocs HTML dans vDocs, validation post-import). **OBLIGATION** : après TOUT rebase, vérifier avec `grep` que CHAQUE feature ajoutée est encore présente dans le fichier. Liste de contrôle post-rebase : `grep -c "mot_clé_unique_feature"` pour chaque ajout ❌
22. Données SEED incorrectes sans validation : SEED_APR2026 avait des horaires de travail au lieu de CP/AF pour REVOLLON. **OBLIGATION** : toute donnée SEED doit être vérifiée par `detectRepoConflicts()` — la règle 4 (horaire_dans_absence) attrape ce type d'erreur automatiquement ❌
23. Audit "simple" au lieu d'audit "général expert" : un audit qui vérifie seulement la syntaxe JS n'est PAS un audit expert. **OBLIGATION** : utiliser la checklist complète (21 points : 8 flux utilisateur + 5 flux admin + 5 sécurité + 3 données) à CHAQUE audit final ❌
24. **Fuzzy matching aveugle** (v9.376-377) : Levenshtein ≥0.75 matchait `BORGIA L` à `BORGIA T` (similarité 0.875). **OBLIGATION** : quand fuzzy match + surname identique + initiales différentes + initiales courtes (≤2 chars) → consulter `known_identities` (v9.220). Si nom vu ≥2 fois → vrai homonyme, sinon → anomalie OCR dans `cmc_import_anomalies`. Jamais matcher aveuglément les homonymes ❌
25. **Correction générique vs spécifique** : quand Kevin signale un bug précis (ex: BORGIA), le fix doit être **générique** (s'applique à tous les cas similaires), pas hardcodé au cas signalé. Toujours généraliser le pattern ❌
26. **Propagation codes invalides** (v9.373) : `autoFillMissingCadres` copiait sans validation → codes non reconnus se propageaient d'un mois à l'autre. **OBLIGATION** : valider `CODES[c]` avant toute copie cross-mois ❌
27. **KDMC: Sync Firebase donnees partagees** (v12.2) : `ax_shared_api_key` n'etait PAS dans `FB_FIX` et `_settingsApiKey` utilisait `localStorage.setItem` au lieu de `ls()` → la cle API ne se syncait JAMAIS vers Firebase → clients sur d'autres appareils sans cle. **OBLIGATION** : toute donnee partagee cross-device DOIT etre dans `FB_FIX` ET utiliser `ls()` pour ecrire. TOUJOURS verifier le flux COMPLET bout-en-bout (ecriture → fbShouldSync → Firebase → fbLoadAll → lecture client) ❌
28. **KDMC: Audit incomplet** (v12.0-12.1) : les audits verifiaient les guards admin mais PAS le flux de donnees. Resultat : bug invisible pendant 2 versions. **OBLIGATION** : chaque audit DOIT inclure 5 niveaux : (1) syntaxe, (2) securite/guards, (3) flux de donnees bout-en-bout, (4) fonctionnel, (5) UX. Ne JAMAIS se contenter des niveaux 1-2 ❌
29. **KDMC: System prompt hardcode** (v12.0) : `_callClaudeAPI` ignorait le parametre `sysPrompt` et utilisait une string basique hardcodee. **OBLIGATION** : toujours utiliser `sysPrompt||_buildSystemPrompt()` et VERIFIER que le prompt reel est celui attendu, pas un placeholder ❌
30. **KDMC v12.3 : IA "3 points infini"** (2026-04-20) — 3 causes cumulatives :
    (a) `_callClaudeAPI` hardcodait `https://api.anthropic.com/v1/messages` → ignorait `ax_proxy_url` → CORS hang Safari iOS PWA.
    (b) Filtre `typeof content==="string"` droppait `tool_use`/`tool_result`/image dans la recursion → API recevait conversation cassee.
    (c) Pas d'`AbortController` → fetch zombie apres timeout.
    **OBLIGATION** : JAMAIS hardcoder l'URL Anthropic, TOUJOURS passer par `ax_proxy_url` or default. JAMAIS filtrer par `typeof content==="string"` avant d'envoyer a l'API. TOUJOURS AbortController + signal.abort() dans le timeout. ❌
31. **Parser PDF trop strict = cadres rates** (v9.437, 2026-04-20) — ligne 26141 avait `parts.length<=6` sur la detection de section cadres. Quand le PDF SBM exporte la section avec plus de 6 colonnes (equipe, poste, notes), le header etait rejete silencieusement → ETTORI M, FOUQUE V, PLACENTI L, DOGLIOLO Y, MUS L, BOUVIER JF restaient sans horaires. **Regle Kevin** : "toutes les infos sont dans l'import, le parser doit les trouver" — NE PAS inventer de pattern par defaut, FIXER le parser. **OBLIGATION** : ne JAMAIS filtrer les headers PDF par nombre de colonnes. Le header textuel (PIT BOSS/SUPERVISEUR/INSPECTEUR) suffit a identifier la section. Un filtre trop strict = perte silencieuse de donnees critiques metier. ❌
32. **Regex header cadres sans anchor ^ = regression massive** (v9.437 → v9.444, 2026-04-20) — en retirant le filtre `parts.length<=6` je n'ai PAS ajoute d'anchor `^`. Resultat : regex matchait "SUPERVISEUR" n'importe ou dans une ligne (notes, commentaires) → fausses detections de section → tous les employes suivants mal classes → plus aucun horaire affiche chez qui que ce soit. **OBLIGATION** : quand on retire un filtre structurel, TOUJOURS ajouter un anchor pour eviter les faux positifs. v9.444 fix: `/^\s*(?:\d+...)?(KEYWORDS)\b/i`. v9.446: prefix elargi aux bullets/arrows `[\s\t*•◆▼▶►▪●○◌◈\-.\d)(:;]*`. v9.447: fallback name-first pour cadre sans header matche. ❌
33. **PR jamais mergee = deploiement fantome** (2026-04-20 soir) — 13 commits poussés sur `claude/fix-apex-ai-bugs-adHfF` jamais fusionnes dans main. GitHub Pages deploie depuis main → utilisateur ne voyait aucun de mes fixes pendant toute la session. Cause racine de plusieurs heures de frustration "rien ne marche". **OBLIGATION** : verifier au debut ET pendant la session sur quelle branche le deploiement se fait (`.github/workflows/deploy.yml`) et s'assurer que mes commits arrivent sur cette branche. Si on travaille sur une feature branch, creer et merger la PR des que les changements sont stables — ne pas attendre la fin de session. ❌
34. **Indicateur etat stale** (v9.447, 2026-04-20 nuit) — `_fbConnected=true` set uniquement dans le handler du snapshot initial `path==="/"`. Si un event put specifique arrivait avant, indicator bloque jaune. Firebase marchait mais UI mentait. **OBLIGATION** : tout indicateur d'etat binaire (connecte/deconnecte) doit etre mis a jour sur CHAQUE signe de vie (message recu, put event, reponse fetch OK), pas seulement sur l'etape d'initialisation formelle. ❌
35. **CGU universel pour features sensibles** (v9.448 / v12.9, Kevin 2026-04-20 nuit) — ajout d'un helper `cmcCguAsk(feature, label, desc)` (Apex : `_cguAsk`) qui demande consentement une seule fois par feature, persiste dans localStorage. Wrappe les entry points : biometrie (webauthnLogin / axBiometricAuth), micro (sttStart / axSttToggle), geolocalisation (axGetLocation). Revocable via `cmcCguRevoke(feature)`. Pattern a appliquer a TOUS futurs projets qui accedent aux capteurs device. RGPD/user control respecte. ✅

---

## Recherche d'outils (ToolSearch)

**À chaque session**, avant toute interaction GitHub ou MCP :

1. Les outils MCP sont listés dans les messages `<system-reminder>` comme "deferred tools"
2. Utiliser `ToolSearch` pour charger leur schéma avant de les appeler :
   ```
   ToolSearch("select:mcp__github__create_pull_request")
   ToolSearch("github")
   ToolSearch("select:AskUserQuestion,TodoWrite")
   ```

**Outils MCP courants dans ce projet :**

| Outil | Usage |
|-------|-------|
| `mcp__github__push_files` | Pousser des fichiers vers GitHub |
| `mcp__github__create_pull_request` | Créer une PR |
| `mcp__github__add_issue_comment` | Commenter une issue |
| `mcp__github__get_file_contents` | Lire un fichier sur GitHub |
| `mcp__github__list_branches` | Lister les branches |
| `mcp__github__search_code` | Chercher du code dans le repo |
| `mcp__github__pull_request_read` | Lire une PR |
| `mcp__github__subscribe_pr_activity` | S'abonner aux événements PR |

---

## Workflow Git

- **Branche principale :** `main` (déploie GitHub Pages)
- **Branche feature :** `claude/<description>`
- Messages de commit : format `vX.Y: description`


---

## Historique versions récentes

> 📖 **Historique complet** dans `CHANGELOG.md` à la racine du dépôt (v8.83 → v9.67 archivé).

| Version | Changements |
|---------|-------------|
| **v9.70** | **Fixes responsive mobile complets**. Tests multi-devices Puppeteer (5 profils : iPhone SE, iPhone 14 Pro, Galaxy S22, Pixel 7, iPad Air). Fix nav bas #bnav : scroll-x interne, labels cachés < 420px (ne garde que les emojis), compact sur petits écrans. Fix overflow accueil (raccourcis `max-width:100vw`). Fix toolbars vIA, vChat header, vMonPlanning header : `flex-wrap:wrap`. Ajout `html,body{overflow-x:hidden;max-width:100vw}` en safety net. Résultat : **70 PASS / 0 FAIL** sur 5 devices (avant : 55 PASS / 25 WARN overflow). iPhone SE 375px entièrement fonctionnel. |
| **v9.69** | **Audit expert 4 subagents parallèles + corrections**. Fix P1 : `cmc_motd` maintenant géré dans `fbApplyData` (accepte null=effacé, validation type objet). Fix P2 : auteur MOTD supprimé affiche "(supprimé)" au lieu de "undefined" ; bandeau MOTD gagne `word-break:break-word` + `overflow-wrap:anywhere` pour textes longs sans espaces. Section **"Outils & réflexes expert"** ajoutée dans CLAUDE.md (boîte à outils, commandes de validation, pièges à éviter). |
| **v9.68** | **Message du jour admin + sync Firebase**. Store `A.motd={text,ts,author}` dans FB_FIX (`cmc_motd`). Fonctions `setMotd`/`clearMotd`/`adminSetMotdFromInput` (guard AID, max 500 car., audit `motd_set`/`motd_clear`). UI admin : textarea + boutons Publier/Effacer. UI employé : bandeau doré 📢 en haut de `vAccueil` (pre-wrap, date/heure). |
| **v9.67** | **Version majeure 35+ fonctionnalités**. Splash screen, Firebase différé, auto-save fiches, CODE_HOURS complet, solde CP, dashboard RH + courbe 12 mois SVG, TTS/STT, compte visiteur U007, thèmes (Casino/Clair/Nuit), export PDF, templates planning, multi-langues FR/EN/IT, swipe mois, admin réorganisé 7 catégories, PWA installable, mode présentation. IA locale enrichie (36 outils). AUDIT 23/23 PASS. |
| **v9.66** | Lisibilité (ratio WCAG AA), tokens CSS typography+blur centralisés, titres serif Garamond. |
| **v9.65** | Cadre légal monégasque (Loi 1.103, OS 8.929, AM 88-384) + vConvention onglet Loi + 2 outils IA supplémentaires. |
| **v9.64** | JEUX_SBM Formation 2016 (6 jeux détaillés : BJ, RA, Craps, PB, THU, TCP) + vConvention Jeux enrichi + 2 outils IA. |
| **v9.63** | Tool use IA custom — 26 outils (21 lecture + 5 admin). IA_TOOLS[] + _iaExecuteTool + guard AID sur les 5 admin. |
| **v9.62** | Multi-axe : bulles chat transparentes + fix iOS zoom + CSP élargie + upload modéré + PLANS_CMC/CDP + galerie 75 photos salons + 15 tests unitaires. |

---

---

## Convention Collective Jeux de Table SBM (référence officielle)

> 📖 Document de référence intégré depuis v9.29 — consultable via `CONVENTION` et `BULLETIN_CODES` dans le code.
> Source : Convention Collective du 1er avril 2015 + Note 6 janvier 1993 (B. Lées).
> À utiliser pour répondre aux questions employés (chat, IA) et pour la gestion RH.

### Articles clés (voir `CONVENTION.articles`)

| Article | Sujet | Règle principale |
|---------|-------|------------------|
| **4** | Recrutement | Âge minimum **21 ans** |
| **5** | Écoles de jeux | 5 écoles premium sur 9 ans, min 1 an entre deux |
| **6** | Contrat | Contrat initial **12 mois**, essai **3 mois**, CDI à 18 mois |
| **10** | Carrière employés | Niveaux 1-7 selon jeux validés (Niv 7 = Expert tous jeux) |
| **11** | Promotions | Expert → Chef → Inspecteur → Sous-dir → Directeur |
| **13** | Rémunération | 3 parties : fixe (+200€/niveau) + %CA + %cagnottes. Min garanti 10,85 mois |
| **17.4** | Congés | **2 mois/an** : 1 mois été (1 mai-31 oct) + 1 mois hiver, 4 sem consécutives min |
| **17.5** | Repos hebdo | Min 1j, normalement 2j consécutifs, min 10j/6 sem. Majoration 50% si >4j supprimés |
| **17.6** | Forte affluence | Juillet-août, 16 déc-15 janv, Grand Prix, Pâques. Planning publié vendredi <12h |
| **17.8** | Pauses | **55+ et femmes enceintes : pause toutes 40 min** (au lieu de 60) |
| **18** | Congés familiaux | Mariage 4j · Naissance 3j · Décès proche 3j · Mariage enfant 2j · Décès beau-parent 1j |
| **23** | Maladie | Indemnisation 85% (min 91%), max **1095 jours** |
| **26** | Retraite | 10 ans=½ mois · 15 ans=1 mois · 20 ans=1,5 mois · 30 ans=2 mois. Groupe fermé=3 mois |
| **35** | Effectifs | Chefs de table = **25-30%** de l'effectif employés |

### Codes d'activité bulletins paie (voir `BULLETIN_CODES`)

Source : Note SBM du 6 janvier 1993 (Bernard Lées, DAJS).

| Catégorie | Codes principaux |
|-----------|------------------|
| **Présence/Repos** | P, RH, RTP, RTR, RRT, RHS, DP |
| **Congés Payés** | CP, CRH, CPS, CPM, CDP, CDH |
| **Fêtes Légales** | FL, CFL, FTP, FTR, RFT |
| **À la masse** | FCP, FCS, FRH, FFL |
| **Absences** | M, AT, MT, ABS, ABI, ABP, AF, CL, CEO, CSC, CSS |
| **Sanctions** | PNE, AMP, MPC, MPP |
| **Autres** | PAT, PRT, HC |

### Grilles de rémunération (Annexe 1 — nouveaux entrants)

| Niveau | Poste | Salaire/mois | %CA | %Cag |
|--------|-------|--------------|-----|------|
| 1 | Employé 1 jeu | 2 300 € | 0,003% | 0,06% |
| 7 | Expert (tous jeux) | 6 113 € | 0,012% | 0,24% |
| 9/1 | Sous-chef table | 6 460 € | 0,0135% | 0,27% |
| 11/1 | Chef de table | 7 000 € | 0,015% | 0,30% |

Cadres (Annexe 2) : Inspecteur 8 295-8 710 €, Sous-directeur 10 452 €.

### Accès dans l'app
- Vue `vConvention` (tous employés) — onglet 📖 Convention depuis l'Accueil
- 4 tabs : Articles / Codes paie / Grilles / Recherche
- Référence injectée dans le contexte IA (`buildIASystemPrompt`) → Claude peut citer les articles
- Helper `conventionSearch(q)`, `conventionCongeJours(evt)`, `bulletinCodeLabel(code)`, `bulletinAllCodes()`

### Utilisation par Claude Code (moi-même)
Quand tu me demandes une info RH, congés, promotion, salaire, etc. → je dois chercher dans ces données en priorité avant de répondre.

---

## Règles de rotation Casino de Monaco

> ⚠️ Règle opérationnelle à respecter dans tous les calculs de planning

### Tous les employés (standard)
- Patterns autorisés : **20/20** · **40/20** · **60/20** (travail/pause en minutes)
- Maximum **60 minutes de travail consécutif** en toutes circonstances

### Employés 55+ (★ rouge)
- Identifiés par `emp.senior = true` (ou `emp.family==="roulettes" && emp.chef` en rétro-compatibilité)
- Affichés avec `★` rouge dans le planning, vDeparts, vEmps
- **Même patterns que les autres (20/20, 40/20, 60/20)**
- **Par défaut : maximum 40 min de travail consécutif** → pause 20 min obligatoire
- **Avec accord de l'employé : jusqu'à 60 min autorisé** (même règle que standard)

### Exception
- **Roulette européenne** (compétence `E`) : règles de rotation différentes (à préciser)

### Constante dans le code
```javascript
var ROTATION = {
  senior:   {maxWork: 40, maxWorkConsent: 60, pause: 20, patterns: [20, 40, 60]},
  standard: {maxWork: 60, pause: 20, patterns: [20, 40, 60]},
  exceptionComp: "E"  // roulette européenne
};
function isSenior(emp)      // true si emp.senior || (roulettes && chef)
function empLabelHtml(emp)  // nom + ★ rouge si senior (pour innerHTML)
function empLabel(emp)      // nom + ★ texte (pour title="")
```

---

## Constantes

```javascript
var AID      = "U11804";   // Admin = DESARZENS K
var DATA_VER = 30;
var APP_VER  = "v9.303";
var SESSION_TTL = 8 * 60 * 60 * 1000; // 8h
var FB_DEFAULT = "https://cmcteams-c16ab-default-rtdb.europe-west1.firebasedatabase.app";
```

---

## Workflow expert — Développement CMCteams

> Procédure obligatoire pour chaque modification. Conçu pour une SPA monofichier casino avec 258 employés, sync Firebase temps réel, et contraintes mobiles.

### Phase 0 — Prise de contexte (avant tout code)

1. **Lire le CLAUDE.md** : vérifier APP_VER, DATA_VER, erreurs connues (#1–#20)
2. **Identifier la demande** : UI ? Logique métier ? Import ? Sécurité ? Firebase ?
3. **Cartographier l'impact** : quelles fonctions/vues sont touchées ?

```
Matrice d'impact rapide :
┌─────────────────┬──────────────────────────────────────────────┐
│ Zone modifiée   │ Vues à vérifier                              │
├─────────────────┼──────────────────────────────────────────────┤
│ A.employees     │ vEmps, vPlan, vDeparts, vAccueil, vStats     │
│ A.overrides     │ vPlan, vDeparts, vMonPlanning, vAccueil       │
│ A.reg           │ vMonProfil, vEmps, vPasswords                 │
│ A.passwords     │ vPasswords, vLogin                            │
│ A.chatMsgs      │ vChat                                        │
│ A.exchanges     │ vEchanges, vMonPlanning                       │
│ CHEFS_T / CI    │ vDeparts, calcDepPos                          │
│ CSS / Layout    │ vPlan, vDeparts, vMonPlanning (mobile!)       │
│ Firebase sync   │ fbWrite, fbApplyData, SSE listener            │
│ Navigation      │ render(), dc(), sv(), topbar                  │
│ Import PDF      │ doImport, vImport, importSuggestions           │
│ Sécurité        │ vLogin, admin guards, esc(), hashPwStrong()   │
└─────────────────┴──────────────────────────────────────────────┘
```

### Phase 1 — Analyse du code existant

1. **Lire les fonctions concernées** en entier (pas de modification à l'aveugle)
2. **Tracer le flux de données** : d'où vient la donnée → où elle est affichée
3. **Vérifier les dépendances** : `dc()` re-rend tout → un changement dans `vDeparts` peut affecter le scroll `adjDeparts()`
4. **Chercher les patterns similaires** : si on modifie une colonne dans vDeparts, vérifier vPlan aussi

### Phase 2 — Codage (règles strictes)

#### Sécurité (non-négociable)
- [ ] `esc()` sur TOUTE donnée utilisateur avant `innerHTML`
- [ ] Guard `if(!A.user||A.user.id!==AID)return;` sur fonctions admin destructrices
- [ ] `e.message.replace(/</g,"&lt;")` dans les handlers d'erreur (pas d'accès à `esc`)
- [ ] Pas de données sensibles en clair (clé API, PIN, mots de passe)

#### Layout & CSS
- [ ] Jamais `table-layout:fixed` dans un conteneur scrollable (#1)
- [ ] Jamais `overflow:hidden` sur parent d'enfant scrollable (#2)
- [ ] Jamais `overflow-y:hidden` sur parent de colonne sticky (#10)
- [ ] Jamais `width:100%` sur table scrollable → `width:auto` (#11)
- [ ] Jamais `max-width` sur `<td>` → wrapper `<div class="nw">` (#18)
- [ ] Tester scroll horizontal (vPlan/vDeparts) sur viewport 375px (iPhone SE)

#### Données & État
- [ ] `gpl()` = seule source de vérité (pas de fallback genBase) (#3)
- [ ] Ne jamais utiliser `base=0` dans calcDepPos → utiliser `ei` (#13)
- [ ] Rafraîchir `A.user`/`_viewAs` après remplacement `A.employees` par SSE (#16)
- [ ] Ne jamais utiliser une variable locale d'une autre vue (#20)
- [ ] `searchInput()` pour les champs de recherche (pas `oninput→dc()`) (#9)

#### Firebase
- [ ] Clés `FB_LOCAL` ne doivent JAMAIS être synchronisées
- [ ] `fbApplyData` doit cloner en profondeur (pas de référence partagée)
- [ ] `fbWrite` avec retry + queue offline en cas d'échec

#### Navigation & UX
- [ ] Max 8 onglets nav (mobile) (#14)
- [ ] `chatSetReply` doit auto-activer `_chatDm` pour les DM (#19)
- [ ] Notifications : vérifier `typeof Notification !== "undefined"` (iOS) (#15)

### Phase 3 — Validation (OBLIGATOIRE avant CHAQUE commit)

> ⚠️ **RÈGLE ABSOLUE** : Ne JAMAIS pousser sans avoir vérifié soi-même.
> Après CHAQUE modification, AVANT de commit :
> 1. Valider la syntaxe JS
> 2. Vérifier que la modification n'a PAS cassé les fonctions existantes
> 3. Simuler le rendu HTML généré pour les vues affectées
> 4. Comparer avec l'état précédent (git diff) pour détecter les régressions
> 5. Si modification CSS/layout : calculer les dimensions (largeurs colonnes vs contenu)
> 6. Ne JAMAIS enchaîner plusieurs commits de "fix" sans vérification — c'est signe de travail bâclé

```bash
# 1. Syntaxe JS (obligatoire avant commit)
node -e "
const fs=require('fs');
const html=fs.readFileSync('index.html','utf8');
const s=html.lastIndexOf('<script>'),e=html.lastIndexOf('</script>');
fs.writeFileSync('/tmp/test.js',html.slice(s+8,e));
" && node --check /tmp/test.js && echo "✅ JS OK"

# 2. Taille fichier (surveillance dérive)
wc -c index.html  # Attendu : ~440-540 KB

# 3. Recherche oublis sécurité
grep -n 'innerHTML' index.html | grep -v 'esc(' | head -20

# 4. Diff avec état précédent (vérifier régressions)
git diff --stat HEAD

# 5. Si modif layout : vérifier que les vues non-modifiées restent intactes
# Comparer les fonctions vPlan/vDeparts/vMonPlanning avec le dernier commit stable
```

### Règle anti-régression

> **INTERDIT** de modifier une vue (vPlan, vDeparts, etc.) sans vérifier que les AUTRES vues
> ne sont pas affectées. Utiliser la matrice d'impact Phase 0.
> Si un changement CSS affecte `.sth`, `.ntd`, `.ctd`, `.dth` → vérifier vPlan ET vDeparts.
> Si un changement touche `A.employees` → vérifier vEmps, vPlan, vDeparts, vAccueil, vStats.
> Un commit qui casse une fonction existante = travail à refaire entièrement.

#### Checklist de validation par type de changement

| Type | Vérifications |
|------|--------------|
| **UI/CSS** | Scroll OK ? Sticky OK ? Mobile 375px ? Noms lisibles ? |
| **Logique métier** | Rotation correcte ? Senior ★ respecté ? Tous les 258 emp ? |
| **Import** | Compétences BRTPECK ? newEmps/possibleRetired détectés ? |
| **Firebase** | fbWrite appelé ? SSE listener reçoit ? Queue offline ? |
| **Sécurité** | esc() partout ? Guards admin ? XSS dans erreurs ? |
| **Chat** | DM privé reste privé ? Reply correct ? Filtres admin ? |

### Phase 4 — Versionnement & Commit

1. **Bumper `APP_VER`** : format `vX.Y` (X = majeur, Y = incrémental)
   - Nouveau module/vue → bump X
   - Fix/amélioration → bump Y
2. **Ne PAS bumper `DATA_VER`** sauf si schéma `DEF_EMP`/`DEF_TEAMS` change
3. **Commit** : `vX.Y: description en français`
4. **Mettre à jour CLAUDE.md** : historique versions + constantes si changement

### Phase 5 — Déploiement

```
Branche feature → commit → push → PR (si demandé) → merge main → GitHub Pages auto
```

- Jamais de push direct sur `main`
- Un commit = un changement cohérent (pas de méga-commits multi-fonctions — erreur #17)
- Vérifier le déploiement GitHub Pages après merge

### Phase 5b — Vérification post-rebase/merge (OBLIGATOIRE — erreur #21)

> ⚠️ Un rebase peut PERDRE SILENCIEUSEMENT du code. Après TOUT rebase ou merge avec conflits :

```bash
# 1. Zéro marqueurs de conflit
grep -c "^<<<<<<\|^======\|^>>>>>>" index.html CLAUDE.md sw.js

# 2. Syntaxe JS valide
node -e "..." && node --check /tmp/test.js

# 3. Vérifier CHAQUE feature ajoutée dans cette session
grep -c "mot_cle_unique_1" index.html  # Doit être > 0
grep -c "mot_cle_unique_2" index.html  # Doit être > 0
# ... pour CHAQUE ajout

# 4. Les 5 règles detectRepoConflicts
grep -o "horaire_dans_absence\|absence_longue\|repos_insuffisant\|max_jours_consec\|donnees_manquantes" index.html | sort -u | wc -l
# Doit retourner 5

# 5. Validation post-import
grep -c "_postConflicts" index.html  # Doit être > 0

# Si un grep retourne 0 → le code a été perdu → restaurer AVANT de push
```

---

### Arbres de décision rapides

#### "Où modifier ?" — Localisation du code

```
Demande concerne...
├── L'apparence → CSS embarqué (<style>) ou style inline dans la vue
├── Une vue spécifique → fonction vNomDeLaVue()
├── Le planning → gpl(), overrides, CODES
├── Les départs → vDeparts(), calcDepPos(), CHEFS_T, CI
├── L'import PDF → doImport(), parseur texte/PDF.js
├── Firebase → fbInit/fbWrite/fbApplyData/fbStartListening
├── Login/sécurité → vLogin*, hashPwStrong, verifyPw, guards AID
├── Un employé → A.employees, DEF_EMP, A.reg
└── Le chat → vChat(), chatSetDm/Reply/Del, _chatDm/_chatReply
```

#### "Faut-il bumper DATA_VER ?"

```
Modification de DEF_EMP (ajout/retrait employé) → OUI
Modification de DEF_TEAMS (ajout/retrait équipe) → OUI
Changement de schéma A.employees (nouveau champ) → OUI
Tout le reste (CSS, logique, vues, Firebase) → NON
```

#### "Cette modification casse-t-elle le mobile ?"

```
Colonne > 130px dans une table scrollable → RISQUE
Position sticky + overflow sur parent → RISQUE (iOS Safari)
Plus de 8 onglets nav → CASSE (#14)
Font-size < 11px → illisible sur mobile
Touch target < 44px → difficile à toucher
```


## 🚨 REGLE UX ERREURS (Kevin 2026-04-21, OBLIGATOIRE)

JAMAIS afficher message erreur technique brut a l utilisateur final.
TOUJOURS remplacer par message actionnable clair.

| Technique (interdit) | User-friendly (attendu) |
|----------------------|-------------------------|
| undefined is not an object | Erreur interne, recharge la page |
| null reference | Donnees manquantes, reinstalle l icone |
| HTTP 500 / 502 / 503 | Serveur surcharge, reessaie dans 1 min |
| Failed to fetch / network | Reseau indisponible, verifie Wi-Fi/4G |
| CORS / Host not allowed | Blocage API, contacte admin ou attends |
| QuotaExceededError | Stockage plein, un cleanup auto a ete lance |
| Timeout | Pas de reponse apres 30s, reessaie |

Applicable dans :
- Chaque catch (try/catch ou .catch)
- Chaque toast visible user
- Chaque push message assistant dans K.messages/A.iaHistory
- Chaque alert/confirm

A verifier a chaque audit (axRunAudit, subagent audit).

---
