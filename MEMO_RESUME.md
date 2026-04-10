# 📌 Mémo de reprise — 2026-04-10 (session en cours)

> **Lire en PREMIER à chaque nouvelle session** avant toute autre action.
> Règle globale `~/.claude/CLAUDE.md` — continuité inter-sessions.

---

## 📊 Dernière version stable

**`APP_VER = "v9.61"`** — commit `f3b25d4` sur `main` et `claude/find-casino-project-vcUDZ`

---

## 🗺️ Séquence de versions (cette session)

```
f3b25d4 v9.61: Hot-fix audit indépendant (2 P0 + 1 P2)         ← ACTUEL
3760716 v9.60: Partage par dossier + fix mdp clair + logs enrichis
97ba840 v9.59: Fix fond perso cas par cas + flèche retour + TCP
b35d215 v9.18: Cards éclaircies (puis rebase → abandonné)
65c1f7b v9.17: Hot-fix scintillement + import qui déconne (rebase)
73e36d6 v9.16: Sprint 1 sécurité/design (rebase)
93b7194 v9.58: Accès par employé + hot-fix scintillement/import
36f89a4 v9.15: Accès employés (avant rebase sur main v9.57)
1ef8d00 v9.57 main (base réelle, 50 commits d'avance vs ma branche initiale)
```

---

## 🎯 Tâche en cours : **v9.62**

**Intégration des données officielles reçues** dans toute l'app, pas uniquement vConvention.

### Priorité confirmée par le user
- v9.62 = **JEUX_SBM** (6 docs SBM Formation 2016 déjà reçus) + intégration transverse dans toute l'app
- v9.63 = LOI_1103 + OS_8929 (cadre légal général)
- v9.64 = AM_88_384 (règlement principal des jeux)
- v9.65 = Nouveaux jeux manquants (rmc, ram, tq, boule, gr, cdf, bq, paig, carib, stud, thnl, war)

### Instructions user (2026-04-10)
> "Forcément que tu as des modifications à faire dans l'app par rapport à toutes tes nouvelles données.
> Fais en même temps travailler tes outils pour t'aider à intégrer tout partout. N'oublie rien.
> Fais le tour de tout pour être sûr. Et suis ta feuille de route."

> **[NOUVEAU]** "Il faut que l'IA de l'app soit des plus performante pour aider dans l'app au maximum.
> La solliciter au max. Pour tout ce qu'elle peut faire. Lui donner accès à tout dans l'app pour
> agir ou réfléchir source de données. Sécuriser l'app au maximum de l'extérieur et bloquer les
> modifs sauf pour admin. L'IA ne peut pas modifier l'app sauf pour l'admin."

> **[NOUVEAU]** 7e doc officiel reçu : **PLANS_CMC_CDP** (architecture + disposition interne des salles)
> → sauvegardé dans `/tmp/plans_cmc_cdp.md` avec synthèse structurée JS-ready.

→ Plan : **paralléliser via 5 subagents Explore** pour faire le tour exhaustif de l'app (impact transverse + audit vIA + sécurité + tests + JEUX_SBM structure).

---

## 📥 Documents officiels reçus (buffer pour v9.62→v9.65)

### Règles SBM Formation 2016 (docs internes — v9.62)

| # | Jeu | Source | Pages | Clé JEUX |
|---|-----|--------|-------|----------|
| 1 | **Roulette Anglaise** | SBM Formation sept 2016 | 2 | `ra` |
| 2 | **Black-Jack "21"** | SBM Formation mars 2016 | 2 | `bj` |
| 3 | **Three Card Poker** | SBM Formation nov 2016 | 4 | `tcp` ✅ (déjà dans JEUX depuis v9.59) |
| 3b | **Three Card Poker — Procédures** | SBM Formation nov 2016 | 9 | `tcp.procedures` |
| 4 | **Craps** | SBM Formation juil 2016 | 6 | `craps` |
| 5 | **Punto-Banco** | SBM Formation juil 2016 | 2 + tableau tirage | `pb` |
| 6 | **Texas Hold'em Ultimate** | SBM Formation juin 2016 | 5 + table récap + lexique | `thu` |

### Textes législatifs monégasques (v9.63-v9.65)

| # | Texte | Publication | Version |
|---|-------|-------------|---------|
| 7 | **Loi n° 1.103 du 12 juin 1987** | JO du 26/06/1987 | Modifiée par Loi n° 1.261 du 23/12/2002 |
| 8 | **Ordonnance Souveraine n° 8.929 du 15/07/1987** | JO du 24/07/1987 | Consolidée art. 1 (OS n° 1.948 du 7/11/2008) |
| 9 | **Arrêté Ministériel n° 88-384 du 26/07/1988** | JO n° 6827 du 29/07/1988 | 21 amendements (consolidation au 20/04/2021) |
| 10 | **AM n° 2019-819 du 24/09/2019** — Roulette Monte-Carlo | JO n° 8453 | 39 cases (0, 00, CMC) |
| 11 | **AM n° 2006-370 du 24/07/2006** — Three Card Poker | JO n° 7767 | Modifié par AM 2020-617 |
| 12 | **AM n° 2006-371 du 24/07/2006** — Black-Jack One Deck | — | Modifié par AM 2009-593 |
| 13 | **AM n° 96-166 du 17/04/1996** — Comptabilisation recettes brutes | JO n° 7127 | Consolidé 15/10/2022 |
| 14 | **Règlement salle SBM Monte-Carlo** | montecarlosbm.com | Interne SBM |

### Plans architecturaux CMC & CDP (v9.62) — NOUVEAU 2026-04-10

| # | Doc | Source | Format | Fichier buffer |
|---|-----|--------|--------|----------------|
| 15 | **PLANS_CMC_CDP** | User avril 2026 (compilation Gallica/BnF + SBM officiel + Wikipedia) | Markdown + JS-ready | `/tmp/plans_cmc_cdp.md` |

**Contenu** : 9 salles CMC (Renaissance, Atrium, Europe, Amériques, Blanche, Médecin, Touzet, Super Privés, Annexes) + CDP 3 niveaux + tables de correspondance jeux↔salles + horaires + dress codes + différences CMC/CDP. 11 plans Garnier 1877-1880 libres de droits via Gallica.

**À intégrer v9.62** :
- Constantes JS `PLANS_CMC` + `PLANS_CDP` dans index.html (~300-500 lignes)
- Nouvel onglet vConvention "🏛️ Lieux"
- Injection dans `buildIASystemPrompt()` (+~2000 tokens)
- Helper `_getSalleJeu(jid, etab)` pour localiser un jeu

---

## ✅ Fait (session 2026-04-09 / 2026-04-10)

- v9.15 **Accès par employé** (A.access, isUserFloating, modale admin)
- v9.16 Sprint 1 sécurité/design (CSP, XSS vAuditLog, design tokens, touch 44px) *(abandonné après rebase)*
- v9.17 Hot-fix scintillement + import qui déconne *(abandonné après rebase)*
- v9.18 Cards éclaircies backdrop-filter *(abandonné après rebase)*
- **v9.58** Rebase sur v9.57 main + cherry-pick Accès employés (correction erreur méthodologique majeure)
- **v9.59** Fix fond perso cas par cas + flèche retour globale (`_viewHistory` + `goBack`) + TCP ajouté à JEUX
- **v9.60** Partage par catégorie (`A.docCatShared`) + fix mdp clair perdu au sync + logs connexion enrichis (browser/OS/city/isp via ipwho.is)
- **v9.61** Hot-fix audit subagent : `fbApplyData("cmc_pw")` hash compare + `_dcPending` reset catch import + timeout 5s AbortController sur ipwho/ipify

---

## 🔲 Prochaine étape concrète : v9.62

### Plan validé par user (avec parallélisation subagents)

**Étape 1** ✅ **MEMO_RESUME.md** (ce fichier)

**Étape 2** — **Lancer 5 subagents Explore en parallèle** (background, 2026-04-10) :
- **Subagent A** (`a45ff55e`) : *Audit impact transverse* — TOUTES les zones à enrichir (buildIASystemPrompt, vConvention, vMonProfil, vOnboarding, vAdmin, compétences, docs, etc.)
- **Subagent B** (`a221e8c2`) : *Audit vIA actuel + plan Claude API* — tool use, prompt système enrichi, sécurité tools admin-only
- **Subagent C** (`aeea4703`) : *Sécurité modifications* — guards AID inventaire, CSP, XSS, SSE, points d'attaque externes
- **Subagent D** (`ae2c0a84`) : *Tests unitaires runTests* — 15-25 nouveaux tests helpers v9.58-v9.61
- **Subagent E** (`ab296d8c`) : *Structure JEUX_SBM JS* → `/tmp/jeux_sbm_structure.js` (6 jeux SBM Formation 2016, syntaxe validée)

**Étape 3** — Synchrone pendant les subagents : lire structure JEUX L843-964 + vConvention onglet jeux L6354-6402

**Étape 4** — Synthétiser les 3 rapports + préparer le build

**Étape 5** — Build v9.62 par petits lots :
1. Créer `JEUX_SBM` avec la structure + contenu des 6 jeux
2. Ajouter mini-tabs Express/SBM/Procédures dans `vConvention` branche jeux
3. Intégrer les modifs transverses identifiées par subagent A
4. Ajouter tests unitaires identifiés par subagent C
5. `node --check` après chaque étape

**Étape 6** — Audit final via subagent Explore avant commit

**Étape 7** — Fix + bump v9.62 + CLAUDE.md historique + commit + push + merge main

**Étape 8** — Mettre à jour ce MEMO_RESUME.md → "v9.62 livré, prochaine v9.63"

---

## 🐛 Bugs connus non corrigés

Aucun — tous les bugs identifiés par l'audit indépendant ont été corrigés en v9.61.

---

## 🔑 Décisions prises

1. **Méthodologie expert re-adoptée** après remarque user sur feuille de route (MEMO_RESUME + plan + audit subagent + CLAUDE.md update)
2. **Découpage v9.62→v9.65** pour l'intégration législative (pas de big bang)
3. **Ordre** : contenu concret d'abord (JEUX_SBM), loi cadre après
4. **Audit indépendant via subagent Explore** obligatoire avant chaque commit majeur
5. **Parallélisation par subagents** pour faire le tour exhaustif de l'app sans rien oublier

---

## ⚙️ Contexte technique

- **Branche de travail** : `claude/find-casino-project-vcUDZ` (alignée sur `main`)
- **Fichier principal** : `/home/user/CMCteams/index.html` (~11 170 lignes après v9.61)
- **Firebase** : sync SSE temps réel, clé `cmc_doc_cats_shared` dans FB_FIX depuis v9.60
- **Nouveaux helpers récents** :
  - `isUserFloating(u,y,m)` (v9.58)
  - `isFeatureBlocked(uid,feat)` (v9.58)
  - `setUserAccess(uid,mode,blocked)` (v9.58)
  - `getUserAccess(uid)` (v9.58)
  - `goBack()` + `_viewHistory` (v9.59)
  - `isDocShared(d)` (v9.60)
  - `toggleDocCatShared(catId)` (v9.60)
  - `dcDebounced()` (v9.58)
  - `_flushImportPending()` (v9.58)
- **Store ajoutés** : `A.access`, `A.docCatShared`
- **vPasswords** : affiche mdp en clair via `_pwClear` (corrigé en v9.60 + v9.61)

---

## 🚨 Règles à NE JAMAIS oublier

1. **TodoWrite immédiat** à chaque nouvelle demande user
2. **node --check** avant chaque commit
3. **Audit subagent** avant de merger une version majeure
4. **MEMO_RESUME.md** mis à jour à chaque fin de batch
5. **CLAUDE.md historique** à chaque bump
6. **Jamais push direct main** sans permission (actuellement autorisé → merge via fast-forward OK)
7. **Jamais --force** sans permission (seulement `--force-with-lease`)
8. **Commits descriptifs** : le pourquoi, pas juste le quoi
9. **`esc()` systématique** sur toute donnée avant innerHTML
10. **Guards admin `AID`** sur fonctions destructives

---

*Dernière mise à jour : 2026-04-10 — après v9.61 commit `f3b25d4`, avant v9.62 (subagents en cours)*
