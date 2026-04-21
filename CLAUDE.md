# CLAUDE.md — CMCteams Codebase Guide

Guide pour assistants IA travaillant sur ce dépôt. Mis à jour après session v9.451 / Apex v12.11 (2026-04-21).

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
