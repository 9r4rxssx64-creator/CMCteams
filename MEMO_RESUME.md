# Mémo de reprise — 2026-04-17 (v9.153 livrée)

> **Lire en PREMIER à chaque nouvelle session.**
> Puis lire `NOTES_USER.md` (méta-règles admin + infos métier).
> Puis `~/.claude/CLAUDE.md` (règles globales multi-projets).
> **⚠️ AUSSI lire `TODO_REMINDERS.md`** — tâches en attente que Kevin a demandées.
> **⚠️ ET `GUIDE_IPHONE.md`** — actions prioritaires à faire par Kevin sur iPhone.

---

## Dernière version stable

**`APP_VER = "v9.153"`** — branche `claude/evaluate-resources-shZBa` (en cours)

### 🆕 Session 2026-04-17 (suite) — v9.153 + workflow cron

- **MCP installés dans sandbox** : Context7, Vercel, Sentry, Hugging Face (tous gratuits).
- **`~/.claude/CLAUDE.md` créé** : règles permanentes globales multi-projets.
- **`buildIASystemPrompt` enrichi** : 10 règles de travail injectées dans l'IA de l'app (index.html L17892).
- **`GUIDE_IPHONE.md` créé** : mémo actions prioritaires iOS Safari avec URLs directes cliquables.
- **`MCP_INSTALL.md` mis à jour** : statuts installés + section images gratuits (Pollinations, HF).
- **`.github/workflows/agent-cron.yml` créé** : remplace les crons Vercel Hobby bloqués (3 crons : 3h, 8h, 9h lundi UTC). ⚠️ **Nécessite `AGENT_SECRET` dans secrets GitHub avant activation.**

---

## Versions livrées session 2026-04-17

### Session 2026-04-17 — 17 versions livrées (v9.133 → v9.149)

| Version | Contenu |
|---------|---------|
| v9.133 | Anti-crash scroll iOS + overflow codes + BOUVIER JF |
| v9.135 | Auto-inférence rôles P/P+/E + vTeams pliable |
| v9.136 | Groupe Ouvert/Fermé + sécurité IA + auto-fix vides |
| v9.137 | vPlan + vDeparts familles pliables |
| v9.138 | Premium UX + monégasque 80+ clés |
| v9.139 | Senior ★ auto-détecté + fond jaune PNL |
| v9.140 | Auto-apprentissage codes inconnus |
| v9.141 | 9 niveaux fallback noms |
| v9.142 | FIX CRITIQUE : format B seuil 0 cadres |
| v9.143 | Perf array.join + SVG donut stats |
| v9.144 | Visibilité MAXIMALE textes |
| v9.145 | Fix tag PDF {{CO |
| v9.146 | Scan secours brute-force |
| v9.147 | BORGIA T + adminRenameEmp |
| v9.148 | SÉCURITÉ : passwords clear supprimés |
| v9.148b | Constitution de Monaco intégrée |
| v9.149 | Audit expert 3 subagents — P0/P1 corrigés |
| v9.150 | Outil IA Constitution + fond jaune PNL PDF |
| v9.151 | FIX CRITIQUE connexion : fbWrite manquant sur 6 fonctions |
| v9.151b | Sync Firebase bidirectionnel (admin↔employés) |
| v9.152 | Tutoriel onboarding 8 étapes + aide intégrée |

### Audits

| Audit | Résultat |
|-------|----------|
| Subagent CSS+constantes (L.1-5000) | 10 findings, P1 corrigés |
| Subagent Vues (L.8000-13000) | 10 findings, guards OK |
| Subagent Import+IA (L.13000+) | 10 findings, mutex ajouté |
| Vérification finale 5 points | 5/5 PASS |

---

## 🎯 Capacités actuelles

- **82 outils IA** + Constitution + Monaco
- **Constitution monégasque** (onglet 🇲🇨 + recherche + 45 articles)
- **Convention Collective SBM** (35 articles + codes + grilles)
- **Familles pliables** dans vPlan, vDeparts, vTeams
- **Auto-apprentissage codes** import
- **Sécurité** : hash-only passwords, double garde IA, mutex import
- **Premium UX** : toast undo, focus-visible, SVG stats, micro-interactions
- **4 langues** : FR, EN, IT, Monégasque
- **Admin Rename** : modifier nom employé partout
- **Tutoriel onboarding** : 8 étapes à la 1ère connexion (auto + revoir depuis Aide)
- **Connexion fix** : sync Firebase bidirectionnel sur toutes les fonctions mdp/reg

---

## ⏳ En attente — ordre de priorité (voir GUIDE_IPHONE.md)

### 🔴 P1 — URGENT (Kevin, 5 min)
1. **Ajouter `AGENT_SECRET` dans secrets GitHub** → active le workflow `agent-cron.yml` et débloque l'agent 24/7.
   URL : https://github.com/9r4rxssx64-creator/CMCteams/settings/secrets/actions/new
2. **Désactiver les crons Vercel** (après activation GitHub Actions) — demander à Claude : *"désactive les crons Vercel"*.

### 🟠 P2 — IMPORTANT (Kevin, 2 min)
3. **Corriger `TELEGRAM_CHAT_ID`** (erreur "chat not found" vue) — démarrer le bot Telegram puis vérifier le chat_id via `/getUpdates`.

### 🟡 P3 — UTILE (Kevin, 3 min)
4. **Créer compte Sentry** + envoyer la DSN à Claude → monitoring erreurs gratuit 5k/mois.

### 🟢 P4 — OPTIONNEL
5. Compte Notion / Figma (si usage futur).
6. Intégration Pollinations dans IA_TOOLS CMCteams (outil de génération d'images) — à la demande.

### 📋 Anciennes tâches TODO_REMINDERS.md
7. Superviseurs : section PDF tronquée au copier-coller.
8. Nettoyage Vercel + token Telegram + secrets GitHub (partiellement couvert par P1-P3).
9. Repos IA-KDMC + e-KDMC.
10. Features futures : drag & drop, bulk select, inline edit.

---

*Dernière mise à jour : 2026-04-17 — v9.153 (workflow cron créé, MCP installés, règles globales)*
