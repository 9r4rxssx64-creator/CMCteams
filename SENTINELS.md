# SENTINELLES EXPERT — Spec universelle (tous projets Kevin)

> Règle permanente : **chaque projet Kevin doit embarquer les 7 sentinelles ci-dessous**
> en plus de ses agents domain-specific. Elles tournent en autonomie totale, en permanence,
> chez tous les utilisateurs connectés.
>
> Cibles : CMCteams, KDMC Apex AI, e-KDMC, Remote, CrackPass, futurs projets.
>
> Dernière MAJ : 2026-04-20

---

## Les 7 sentinelles expert (non-négociables)

| # | Sentinelle | Icône | Intervalle | Mission |
|---|-----------|-------|-----------|---------|
| 1 | **perf-sentinel** | ⚡ | 2 min | Render time, RAM, localStorage %, funcs lentes (>100ms), DOM size |
| 2 | **security-sentinel** | 🛡 | 5 min | `innerHTML` sans `esc()`, guards admin manquants, CSP violations, sessions expirées |
| 3 | **data-integrity-sentinel** | 🧬 | 10 min | Refs orphelines, champs requis manquants, codes inconnus, doublons IDs |
| 4 | **api-sentinel** | 📡 | 1 min | Firebase SSE up, Anthropic API latence, proxy health, retry queue |
| 5 | **ux-sentinel** | 🎨 | 15 min | Boutons cassés (onclick fonction inexistante), états vides sans CTA, touch targets <44px |
| 6 | **self-heal-sentinel** | 🩺 | 3 min | Auto-fix : isStreaming stuck, queue offline flush, SW cache mismatch, intervals zombies |
| 7 | **learner-sentinel** | 🧠 | 30 min | Patterns récurrents (≥3×/7j) → auto-ajout `lessons_learned` cross-projets |

---

## Contrat d'exécution (commun à toutes)

Chaque sentinelle DOIT :

1. **Tourner chez tout le monde connecté** (admin ET employés — mode silent watcher pour non-admin)
2. **Dédupliquer** ses alertes (1 même pattern = 1 seul rapport par fenêtre de 1h)
3. **Auto-heal quand possible** (whitelist stricte de fixes : abort stream, flush queue, clear cache, etc.)
4. **Logger** dans un store dédié (`<prefix>_sentinels_log`, max 500 entries, FIFO)
5. **Remonter à l'admin** via badge topbar pulsant + vue dashboard dédiée
6. **Ne jamais inventer de données** — si pas de source, alerte only
7. **S'arrêter proprement** à `doLogout` (pas d'intervals zombies)
8. **Persister** — survit rechargement page via localStorage state
9. **Auto-apprendre** — chaque découverte notable → leçon enregistrée + partagée cross-admins
10. **Rate-limiter** le auto-fix — 1 action auto-corrective max par sentinelle par heure

---

## Tâches autonomes par sentinelle

### 1. ⚡ perf-sentinel (2 min)
- [x] Mesure `performance.now()` avant/après `dc()` → alerte si >500ms
- [x] Surveille taille localStorage → déclenche `emergencyCleanup` si >85%
- [x] Tracke top 10 funcs les plus lentes (via wrapper `perfMeasure`)
- [x] Détecte re-renders >10/s (boucle infinie DOM)
- [x] Alerte si `document.querySelectorAll("*").length` > 10000

### 2. 🛡 security-sentinel (5 min)
- [x] Scan `document.body.innerHTML` pour motifs de XSS résiduels
- [x] Vérifie présence guards `AID` / `axIsAdmin()` sur funcs admin connues
- [x] Check CSP via `document.querySelector("meta[http-equiv='Content-Security-Policy']")`
- [x] Détecte session > TTL → force logout
- [x] Audit `localStorage.getItem("*_pin")` jamais en clair

### 3. 🧬 data-integrity-sentinel (10 min)
- [x] Vérifie clés orphelines dans overrides (emp supprimé mais row existe)
- [x] Codes horaires inconnus (pas dans `CODES`) → liste
- [x] IDs dupliqués dans `employees` / `teams` / `users`
- [x] Champs requis : `emp.name`, `emp.id`, `emp.family` non vides
- [x] Refs croisées : `team.members` ⊆ `employees`

### 4. 📡 api-sentinel (1 min)
- [x] Firebase SSE : `_fbEs` ouvert et `readyState===1`
- [x] Anthropic API : ping `/health` proxy (si configuré) toutes les 5 min
- [x] Retry queue : taille < 50, sinon flush
- [x] Latence fetch moyenne — alerte si >3s sur 5 dernières

### 5. 🎨 ux-sentinel (15 min)
- [x] Scan `onclick="func("` → vérifier que `window.func` existe
- [x] Scan états vides sans CTA : `.empty` sans `<button>`
- [x] Touch targets : `button, a, [onclick]` avec getBoundingClientRect().height < 44px
- [x] Labels manquants (bouton sans texte ni aria-label)

### 6. 🩺 self-heal-sentinel (3 min) — WHITELIST STRICTE
- [x] `K.isStreaming` true + dernier msg >45s → `K.isStreaming=false; dc();`
- [x] Retry queue >10 items + online → flush
- [x] SW cache mismatch avec APP_VER → toast + proposer reload
- [x] Firebase SSE fermé + online → `fbStartListening()`
- [x] Intervals fantômes (pas dans `_globalIntervals`) → log warning

### 7. 🧠 learner-sentinel (30 min)
- [x] Scan `*_sentinels_log` des 7 derniers jours
- [x] Groupe par pattern (message ~30 premiers chars)
- [x] Si ≥3 occurrences → génère leçon brouillon
- [x] Push dans `cmc_lessons_learned` (FB_FIX, shared) avec flag `auto-generated`
- [x] Admin peut approuver/rejeter via vAgents

---

## Intégration dans chaque projet

### CMCteams (`index.html`)
- Ajouter les 7 sentinelles dans `APP_AGENTS` (à la suite des 15 existantes)
- Auto-start au login via `_startAgentsLoop`
- Vue admin `vAgents` affiche leur statut séparément (section "Sentinelles Expert")

### KDMC Apex AI (`apex-ai/index.html`)
- Ajouter via `axCreateLocalWorker("perf-sentinel", "perf_check", 120000)` etc.
- Démarrer dans `axInit()` si admin
- Dashboard dans `vWorkers`

### Futurs projets
- Embarquer `SENTINELS.md` comme spec à suivre
- Implémenter les 7 sentinelles avant tout autre agent domain-specific
- Tester leur déclenchement AVANT release

---

## Rate-limit auto-heal (whitelist globale)

Les seules fonctions dont le `self-heal-sentinel` peut déclencher l'exécution auto :

| Projet | Fonctions whitelist |
|--------|---------------------|
| CMCteams | `agentActionFlushSync`, `agentActionPurgeOldLogs`, `_agentImportGuardian`, `autoFillMissingCadres` |
| KDMC | `flushSyncQueue`, `_emergencyCleanup`, `fbStartListening`, `axForceRefresh` |
| Universel | `localStorage.setItem("<prefix>_isStreaming", false)` (reset UI stuck) |

**1 action / sentinelle / heure** — enforced par `<prefix>_sentinel_lastheal`.

---

## Audit & traçabilité

- Chaque déclenchement sentinelle → entry dans `<prefix>_audit` :
  `{ts, agent:"perf-sentinel", finding:"...", action:"auto-heal", result:"ok"}`
- Dashboard admin affiche les 50 derniers événements par sentinelle
- Badge topbar pulsant si ≥1 warn/err dans les 10 dernières min

---

## Règle permanente

**Kevin 2026-04-20** : *"Des sentinelles expert autonomes dédiées pour augmenter
la performance, la sécurité, le fonctionnement, etc., dans tous les projets. Leur
donner toutes les tâches importantes à exécuter en autonomie totale."*

→ Appliqué à CMCteams (v9.438+), KDMC Apex AI (v12.4+), et tous projets à venir.
