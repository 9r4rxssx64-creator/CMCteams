# NOTES_USER — Informations métier données par l'admin

> **Lecture obligatoire à chaque session.**

## 🎯 RÈGLE EXPERT PERMANENTE (Kevin 2026-04-18)
> **"Travail comme un professionnel tout le temps. Un expert tu es. Note le pour tout partout tout le temps."**

Mode expert maintenu sans exception sur toutes les sessions :
- Parallélisation + subagents
- Tests + validation avant commit
- Sécurité (esc, guards AID)
- Docs à jour (CLAUDE.md + NOTES_USER.md + MEMO_RESUME.md)
- Zéro régression


## 🆕 SESSION 2026-04-18 (v9.287) — Consigne PDF cadres haut-droite

**Demande Kevin** : "Oubli pas d'enregistrer et de prendre en compte les cadres en haut à droite des planning chefs/cate/employé : **vacances / formation / malade / sans solde**."

### Contexte
Screenshot PDF MAI 2026 V1 montre des cadres info en haut-droite du planning avec :
- Nom employé + code compétences (`.BRT`, `.BRTP`, `.BRTCPK`, `BRTCP+.`)
- Code état plein mois : **CP** (congé payé / vacances), **AF** (formation), **M** (malade), **SS** (sans solde)
- Colonnes `du X au Y` pour la période (ex: "1 au 31" = plein mois)

### À faire (roadmap)
1. **Parser PDF** détecter ces cadres et leurs codes d'état plein période
2. **Store** : pour chaque uid + mois → {code, du, au, source:"pdf_cadre"}
3. **Import** : générer automatiquement les overrides pour tous les jours de la période
4. **Import preview** : afficher les absences longue durée détectées dans vImportVerif
5. **vRetrait / vAbsences** : afficher les cadres comme source distincte

### Codes à capturer (enrichir CONVENTION.bulletinCodes)
- **CP** : Congé payé (vacances) → plein mois si cadre
- **AF** : Absence formation
- **M** / **MAL** : Maladie
- **SS** : Sans solde (absence autorisée non payée)
- **ABI** : Absence injustifiée
- **AT** : Arrêt travail
- **PAT** : Paternité (déjà couvert)
- **CFL** : Congé fêtes légales

---

## 🆕 SESSION 2026-04-17 (v9.207 → v9.213) — Features majeures livrées

### v9.207 — Auto-fill cadres manquants
- PDF tronqué = 5 superviseurs + 18 pit boss partiels → auto-complétés
- `autoFillMissingCadres(year, month)` : copie mois N-1 (≥80%) ou pattern RH dimanche
- Auto-trigger dans doImport + bouton FAB "✨ Auto-remplir cadres manquants"
- Bouton direct dans Vérification import (v9.208)

### v9.209 — Géolocalisation timeclock opt-in
- `_features.geoloc` (toggle admin Fonctionnalités)
- `timeclockPunch` enrichi {lat, lng, accuracy}

### v9.210 — Géofence + carte live admin
- `A.geofence = {center, radius, enabled, tolerance}` sync Firebase
- `geoDistance(a, b)` approximation Monaco (erreur < 0.5m sur 1km)
- `vGeoAdmin` : iframe OSM + carte SVG custom + liste employés triée + recherche
- **Tolerance INDOOR** : GPS timeout → accepter pointage (pas bloquer), permission refusée → reject strict

### v9.211 — vPit : vue pit boss live (MAJEUR)
- `A.live = {date, tables, statuts, events, pitBossId}`
- Persist : `cmc_live_<YYYY-MM-DD>` sync Firebase via FB_PRE
- 7 actions : openTable, closeTable, setStatut, libererEmp, assignEmp, removeEmp, rotateNow
- Auto-assign par compétence : `JEU_COMP` mapping bj→B, roul_eur→E, etc.
- Rotation : roul_eur=20min, senior=40min, standard=60min
- Accès : admin + `emp.chef` + `family=cadres`
- FAB "♊ Pit Boss Live"

### v9.212 — Cards vGestionLive cliquables
- Chaque KPI ouvre modal liste : `working/online/rest/leave/sick/active/fam_*`
- `showLiveList(key)` + `showEmpQuickProfile` au clic emp

### v9.213 — Réattribution auto secteurs baccara
- Bouton `🎯 Réattribuer auto` dans vGestionLive
- Détecte emps P/P+ sans E mal classés, re-assign selon règle

## 📝 Features demandées à LIVRER (ordre priorité)

### v9.214 — Identités permanentes (demande Kevin 2026-04-17)
> "L'app doit garder et accumuler les identités des personnes qu'elle apprend dans les plannings importés même effacé, dans les nouvelles connexions et sauvegarder à chaque fois."

**Plan** :
- Nouvelle clé `cmc_known_identities` (sync Firebase, FB_FIX)
- À chaque détection nom dans PDF import → enregistrer `{name, firstSeenAt, sources[], lastSeenAt}`
- Jamais supprimé même si employé effacé (`delEmp`)
- Consultable via vEmps → "Identités apprises" (liste historique)

### v9.215 — Timings admin (demande Kevin)
> "Il faut un réglage admin lorsqu'une personne entre dans le casino et est effectif au travail. Temps de change habit, temps de pause, coupure…"

**Plan** : `A.timings = {preShiftMin:15, postShiftMin:5, pauseMin:20, coupureMin:120}` avec UI admin. Impact calcul heures effectives timeclock.

### v9.216 — Auto-tracking positions tables (demande Kevin, dépend plan casino)
> "Avec le plan on ajustera. Quand on aura le plan l'app saura quand l'employé est à quelle table et quand elle bouge de ces endroits cibles"

**Plan** :
- Admin saisit coord (lat/lng) de chaque table dans la config
- App match position emp → table la plus proche (géoloc temps réel)
- Auto-marque "à table Tx" ou "en break" selon distance
- Intégration vPit pour mise à jour live sans intervention

## 🔍 RÈGLE PERMANENTE — Vérification multi-source (2026-04-17)

**Pour TOUTE information factuelle que Claude doit fournir, calculer ou appliquer :**

1. **Minimum 10 sources de données** à croiser avant de produire la réponse/action
2. Si sources divergent → signaler explicitement à l'admin et demander clarification
3. Toujours citer les sources consultées dans la réponse (ou au moins l'ordre de grandeur)
4. Ne JAMAIS inventer un chiffre/loi/règle sans vérification
5. Pour les calculs de paie, conventions, lois, indices : **vérification obligatoire**
6. Domaines particulièrement sensibles : paie, fiscalité, convention SBM, lois monégasques, horaires réglementaires, droit du travail

**Note technique** : si WebSearch / WebFetch indisponibles, Claude doit le dire explicitement et proposer de chercher à la place.

### Indice salaires Monaco (à vérifier)
- Admin indique : "indice INCE" (possible ICEC, indice coût emploi)
- À croiser avec : INSEE France, Convention SBM, Journal de Monaco, Direction du Travail Monaco
- Appliqué annuellement pour actualiser les salaires de base des années antérieures
- Intégrer le facteur d'indexation dans le calcul de paie (salaire_base × facteur_cumul)

---

## 🧠 RÈGLES RÔLES selon compétences (v9.134 — 2026-04-16)

L'app DOIT auto-inférer le rôle de l'employé à partir de `emp.post` (compétences)
ET de sa présence dans le planning des "Chefs cartes" à chaque import.

### Nomenclature officielle (Casino de Monaco)

| Groupe planning | Détection compétences | Rôle auto |
|-----------------|----------------------|-----------|
| Chefs jeux américains (BJ) | dans planning "chef cartes américaines" | **Chef BJ** (family=bj, chef=true) |
| Chefs jeux européens | `E` seul ou avec comp. européennes | **Chef jeu européen** (roulettes, chef=true) |
| Sous-chefs jeux européens | Toutes comp. E + apparaît dans planning chefs cartes | **Sous-chef JE** (roulettes, sousChef=true) |
| Employés européens | `E` sans être chef/sous-chef | **Employé européen** (roulettes) |
| Chefs groupe fermé Baccara | `P` ou `P+` SANS `E` | **Chef GF Baccara** (baccara, chef=true, gf=true) |
| Chefs GF jeux européens | Toutes comp. GF européennes | **Chef GF européen** — rare dans chefs cartes |

### Règles visuelles plannings Pit Boss / Inspecteurs (demande admin 2026-04-16 soir)

| Visuel | Signification |
|--------|--------------|
| Fond **jaune** | Poker No Limit (PNL) |
| Fond **blanc** | Pas de Poker No Limit ce jour |
| Noms en **rouge** | Noms non reconnus par le PDF (pas grave la couleur en soi) |
| **Étoile rouge** (★) | Personne de +55 ans (senior) |

- Les pit boss PEUVENT avoir fond jaune OU fond blanc selon le service du jour
- La légende en bas du planning PDF pit boss de mai indique les significations exactes
- Se servir de cette légende pour reconnaître les codes correctement

### Comparaison formats plannings cadres (demande admin 2026-04-16)

| Type | Format PDF | Particularités |
|------|-----------|----------------|
| **Chefs cartes (BJ/Roul.)** | Bloc NOM + codes positionnels (jours 1→30) | ★ = chef, * = ligne positionnelle |
| **Pit Boss** | Bloc NOM + codes, fond jaune = PNL, ★ rouge = 55+ | CADRE_LIEU table différencie CMC/CCDP/PNL |
| **Superviseurs** | Même format que pit boss, section SUPERVISEUR après | Souvent après une ligne vide (bug fix v9.133) |
| **Inspecteurs** | Similaire pit boss, à intégrer plus tard | TODO : ajouter family:"cadres", role:"inspecteur" |

**Points communs (importants pour reconnaissance)** :
- Tous ont les mêmes CODES horaires (19/4, 22/6, 16/20, 15/20, etc.)
- CADRE_LIEU s'applique à TOUS les cadres (même mapping)
- ★ = senior (55+) dans TOUS les plannings cadres
- Tous utilisent le format bloc (entête noms + lignes positionnelles)
- Compétences P/P+/E ne s'appliquent PAS aux pit boss/superviseurs/inspecteurs

### Auto-apprentissage codes (v9.140 — demande admin 2026-04-16)

> "Couleur cases fonds, dans les légendes des plannings déjà importés et apprend des nouveaux au fur à mesure"

- Chaque code rencontré lors d'un import qui n'est PAS dans CODES dict est AUTO-APPRIS
- Couleur de fond générée par hash du code (couleur unique déterministe)
- Label deviné si format horaire (ex: "15/21" → "15h–21h")
- Stocké dans `cmc_learned_codes` (localStorage) → persiste entre sessions
- Fusionné dans CODES au boot → visible dans légendes, planning, départs
- Admin peut ajuster via les outils IA ou manuellement si besoin

---

### Règles précises

1. **PRIORITÉ #1 — Groupe OUVERT vs Groupe FERMÉ** (demande admin 2026-04-16 soir)
   - **Tous les nouveaux employés** depuis la Convention (1er avril 2015) = **GROUPE OUVERT**
   - Les nouveaux employés qui arrivent dans les imports (jamais vus avant) = **GROUPE OUVERT**
   - Ils ne peuvent JAMAIS sortir du groupe ouvert (flag permanent)
   - Les anciens déjà attribués chefs/etc. = GROUPE FERMÉ (historique)
   - Flag app : `emp.groupeOuvert=true` (ou `emp.pinkComp=true`) pour groupe ouvert
   - Par défaut : `groupeOuvert=false` (fermé) pour les anciens

2. **Si `post` contient `P` ou `P+` SANS `E`** :
   - Si **groupe ouvert** → family=cmc, chef=false (reste employé GO, PAS chef baccara)
   - Si **groupe fermé** → Chef groupe fermé Baccara (family=baccara, chef=true, gf=true)

3. **Si `post` contient `E`** → NE PEUT PAS être groupe fermé. Automatiquement jeu européen.
4. **Si chef européen (toutes compétences E)** → Chef JE
5. **Si `E` + apparaît dans planning chefs cartes (mais pas chef complet)** → Sous-chef JE
6. **Sinon `E` seul** → Employé européen
7. Les chefs GF européens viennent **jamais ou très rarement** dans les plannings chefs cartes
8. **Inspecteurs + cadres supérieurs** : à gérer plus tard (TODO future session)

### Automatisation à chaque import

- Re-classifier les employés suivant leurs compétences + présence planning chefs
- Mettre à jour `emp.family`, `emp.chef`, `emp.sousChef`, `emp.gf` automatiquement
- Recalculer les stats et afficher les changements dans l'audit
- Bouton manuel de secours pour forcer re-classification

> ## 🚨 MÉTA-RÈGLES PERMANENTES (session 2026-04-13)
>
> **À appliquer SANS que l'admin ait à le redemander.**
>
> 0. **MODE EXPERT PERMANENT** : TodoWrite, subagents parallèles, audit Explore,
>    syntax check + tests AVANT commit, sur-vérification auto 6 points,
>    matrice d'impact, edge cases iOS/localStorage/Firebase.
>    Détails dans `~/.claude/CLAUDE.md` section "MODE EXPERT PERMANENT".
>
> 1. **Chaque info métier reçue = enregistrée IMMÉDIATEMENT dans ce fichier**
>    (règle §1ter CLAUDE.md). Ne jamais attendre que l'admin redemande.
>
> 2. **Chaque nouvelle fonctionnalité/info doit être :**
>    - ✅ Appliquée **automatiquement** partout dans l'app
>    - ✅ **Vérifiée + sur-vérifiée** par tous les outils possibles (tests E2E,
>      IA interne `_iaExecuteTool`, audits custom, `detectRepoConflicts`, etc.)
>    - ✅ Accompagnée d'un **bouton manuel de secours** (backup UX)
>    - ✅ La **priorité reste l'auto** : les boutons manuels ne sont qu'un fallback
>
> 3. **À CHAQUE IMPORT PDF** (priorité absolue, non-négociable) :
>    - ✅ Reconnaissance des données (noms, compétences, codes, horaires)
>    - ✅ Mise à jour auto des fiches employés (post, family, horaires)
>    - ✅ Re-attribution auto des secteurs (via `reassignAllFamiliesByCompSilent`)
>    - ✅ Détection conflits + corrections auto SAFE
>    - ✅ Vérification + survérification 8 audits
>    - ✅ Rapport visuel enrichi avec KPIs + bannières
>    - ✅ 4 boutons manuels de secours : Re-vérifier, Rapport complet,
>      Voir conflits, Annuler import
>    - ✅ Les stats, vPlan, vDeparts, vStats, vEmps suivent automatiquement
>
> 4. **Compétences employés = source de vérité locale + import**
>    - `emp.post` n'est PLUS jamais écrasé par DEF_EMP au reload (v9.108)
>    - Import met à jour `emp.post` si PDF contient des compétences différentes
>    - `emp.family` est dérivée de `emp.post` + `emp.pinkComp` (pas statique)
>    - Respecter les modifications admin manuelles (toggle 🌸, réattribution)
>
> 5. **Clé API Claude (sk-ant-...) :**
>    - Console Anthropic : https://console.anthropic.com/settings/keys
>    - JAMAIS stockée dans le repo/commits/NOTES (sécurité)
>    - Auto-backup Firebase (v9.108) : `cmc_admin_cfg`
>    - Auto-restore à la connexion admin si localStorage vide
>    - "Reset complet" (erreur screen) préserve la clé (v9.106)
>
> 6. **Tout doit s'enchaîner** : quand une info change (comp, equipe, horaire),
>    toutes les vues dépendantes (stats, planning, départs, IA context)
>    doivent refléter le changement automatiquement.
>
> ---
>
> Toutes les informations spécifiques au projet CMC Teams fournies par l'admin
> (Kevin DESARZENS / U11804). À enrichir AUTOMATIQUEMENT dès qu'une info est donnée,
> sans attendre que l'utilisateur la redemande.

---

## 👤 Identité admin

- **Nom** : Kevin DESARZENS
- **Matricule** : U11804
- **Département** : Jeux de table / Black Jack
- **Casino** : Monte-Carlo (SBM)
- **Email** : kevind@monaco.mc

---

## 🤖 Écosystème agent + intégrations (2026-04-13)

**Construit en autonomie** (commit `672d9a2`+ suivants) :

### Agent 24/7 (`tools/agent/`)
- 5 tâches automatiques (health-check, conflicts, burnout, backup, weekly-report)
- Déployable sur **Vercel** (gratuit, recommandé)
- Variables env requises : `ANTHROPIC_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `AGENT_SECRET`
- ⚠️ **Clé Anthropic** : peut RÉUTILISER celle de l'app CMC Teams (multi-usage)

### 8 intégrations (`tools/integrations/`)
Gmail · Telegram · Drive · Calendar · Outlook · Facebook · Instagram · WhatsApp Business
- Chacune : `client.js` + `setup.md` + `package.json` + `README.md`
- Aucun secret en clair (env vars uniquement)

### 5 skills Claude Code (`~/.claude/skills/`)
`/cmc-deploy` · `/cmc-backup` · `/cmc-planning` · `/cmc-stats` · `/kdmc-status`

### MCP servers (`tools/mcp/servers/`)
- `firebase-mcp.js` : 5 outils Firebase (get/set/employees/planning/health)
- `gmail-mcp.js` : wrapper Gmail (read/send/search/markRead)
- `telegram-mcp.js` : wrapper Telegram (send/photo/doc)
- Settings template : `tools/mcp/mcp_settings.example.json`

### GitHub Actions automation
- `tests.yml` : tests E2E à chaque push
- `auto-backup.yml` : backup quotidien 3h UTC (nécessite secrets repo)
- `auto-deploy-vercel.yml` : notif Telegram quand agent modifié

### Procédure de déploiement
- Voir `SETUP_FOR_LATER/0-LIRE_EN_PREMIER.md`
- Phase 1 (Android, 30 min) : tout fonctionne sans ordi
- Phase 2 (Ordi, 1-2h) : confort + intégrations OAuth complexes

### 2 futurs projets (en attente)
- `_PROJECTS_KDMC/IA-KDMC/CLAUDE.md` (mirror du dossier `/home/user/IA-KDMC/`)
- `_PROJECTS_KDMC/e-KDMC/CLAUDE.md` (mirror du dossier `/home/user/e-KDMC/`)
- À démarrer quand l'admin le demande

---

## ⚠️ CORRECTION v9.118 — PAT = PATERNITÉ (pas Patrimonial)

**Demande admin (2026-04-13) :**
> "PAT veut dire paternité, donc jour de congé, donc pas de défaut pour Giacobbi."

**Corrections appliquées :**
- Label CODES : `PAT` → "Paternité" (bleu tendre `#b8e0f0`, texte `#0c3a58`)
- `isWork()` : PAT ajouté aux exceptions (n'est PLUS comptabilisé comme travail)
- `_absTypes` (règles conflits) : PAT inclus + MT, AT, FL, ABS, ABI, CSS
- `detect_burnout_risk` absTypes : PAT ajouté (ne compte pas comme défaut)
- Prompt IA : "PAT=PATERNITÉ (congé, pas défaut — v9.118)"

**Impact :**
- GIACOBBI J : ses jours PAT ne seront plus signalés comme "absence non justifiée"
- Les stats burn-out excluent correctement les paternités
- La règle conflit "horaire dans absence" considère PAT comme absence normale
- Le rapport post-import ne signale plus PAT comme code inconnu

**Autres codes absence reconnus (v9.118) :**
| Code | Sens | isWork |
|------|------|--------|
| RH | Repos hebdo | non |
| R | Repos | non |
| CP | Congé payé | non |
| AF | Formation | non (mais présent) |
| M | Maladie | non |
| RRT | Récup repos travaillé | non |
| PAT | **Paternité** | non (v9.118) |
| MT | Maternité | non (v9.118) |
| AT | Accident travail | non (v9.118) |
| FL | Fête légale | non (v9.118) |
| ABS | Absence tolérée | non (v9.118) |
| ABI | Absence injustifiée | non (v9.118) |
| CSS | Congé sans solde | non (v9.118) |

---

## ⚠️ CORRECTION v9.116 — Familles NE VIENNENT PAS des compétences

**Demande admin explicite (2026-04-13) :**

> "Les compétences P/P+/E doivent rester dans les fiches employés UNIQUEMENT,
> pas dans le dispatch d'équipe. Le planning et les départs utilisent le team
> dispatch de l'import. Les compétences peuvent être notifiées à côté des noms
> si besoin, mais pas piloter le dispatch."

**Règle appliquée :**
- `emp.family` vient de l'**import PDF** (bj1..bj10, r1..r13, c1..c13)
- `emp.post` (compétences BRTPECK) reste dans la fiche pour info
- `emp.pinkComp` (marqueur rose) aussi conservé en fiche
- `reassignAllFamiliesByCompSilent()` **n'est PAS appelée automatiquement**
- Bouton manuel `🎯 Attribuer secteurs` dans vEmps reste dispo en secours
- Migration one-shot `cmc_fam_restored_v116` restaure les familles DEF_EMP
  pour les employés modifiés par v9.107-v9.108

**Règle historique (conservée pour le bouton manuel uniquement) :**
- `E` → Européen (roulettes)
- `P/P+` avec case rose 🌸 → Groupe ouvert (cmc)
- `P/P+` seul → Baccara (baccara)

---

## 🎨 Couleurs du PDF original SBM (v9.103)

Screenshots fournis le 2026-04-12 (plannings avril 2026 v2) :

### Horaires CMC standard (fonds pastel clairs)
| Code | Fond | Texte |
|------|------|-------|
| `22/6` | Rose pastel `#fccfe0` | `#a82858` |
| `19/4` | Jaune pâle `#fff4a0` | `#6a5410` |
| `16/3` | Orange pêche `#ffc890` | `#8a4a10` (coupure) |
| `14/19` | Vert tendre `#c4e8a8` | `#3a6a18` |
| `20/5` | Bleu clair `#b8d4f0` | `#1a5090` |
| `16/22` | Lavande `#d4c4ec` | `#5838a0` |

### Variantes CCDP + CMC (suffixées *, " ou ')
Orange pêche vif `#ffb480` / texte `#a84018` — tous les codes `XX/Y*`.

### Repos / congés / absences
| Code | Fond | Rôle |
|------|------|------|
| `RH` | Violet lavande `#c8a8e0` | Repos hebdo |
| `R` | Gris clair `#e8e8e8` | Repos simple |
| `CP` | Rose saumon `#f8c0d0` | Congé payé |
| `AF` | Vert `#a8e0a8` | Formation |
| `M` | Jaune vif canari `#ffe840` | Maladie |
| `RRT` | Jaune orange `#ffd850` | Récup repos travaillé |
| `HC` | Vert-jaune `#d8e8a8` | Heures comp. |
| `PRT` | Jaune orange `#ffd060` | Prêt |

### Couleurs des noms (sidebar)
- **Chefs Black Jack** : fond jaune canari
- **Employés CMC** : fond vert clair ou bleu clair léger
- **★ rouge** devant nom : senior 55+

---

## 🎯 Détection secteur par compétences (v9.107)

**Règle donnée par l'admin le 2026-04-13 :**

| Compétences affichées | Fond case | Secteur |
|----------------------|-----------|---------|
| `P` ou `P+` (sans E) | normal | **Baccara** |
| `P` ou `P+` (sans E) | **rose** | **Groupe ouvert** |
| `E` (avec ou sans autres) | — | **Européen** |

**Impact :**
- L'import PDF doit classer automatiquement l'employé dans le bon secteur selon ses compétences
- L'affichage (vPlan, vDeparts, vEmps) doit grouper par secteur : BJ / Baccara / Groupe ouvert / Européen / Roulettes / CMC
- Les cases compétences avec fond rose = indicateur `groupe_ouvert`

**Codes compétences standard (rappel) :**
- `B` = Black Jack
- `R` = Roulette anglaise
- `T` = Texas Hold'em
- `P` = Punto Banco (Baccara)
- `P+` = Punto Banco High Roller
- `E` = Roulette européenne
- `C` = Craps
- `K` = Poker Cash Game

---

## 🕐 Plannings Pit Boss + Inspecteurs (demande 2026-04-16)

**Demande admin :**
> "Je vais renvoyer le planning des pit boss et celui des inspecteurs à implanter
> dans l'app, une autre section avec toujours pareil attribution d'horaires exacte
> pour chaque cadre, lieu exact."

**Spécifications :**
- **Nouvelle section** dédiée dans l'app (onglet ou sous-menu de vPlan/vDeparts)
- **Planning pit boss** : horaires exactes, attribution par cadre, lieu exact
- **Planning inspecteurs** : idem, horaires propres aux inspecteurs
- **Attribution par cadre** : chaque pit boss / inspecteur a son horaire individuel
- **Lieu exact** : salle/zone d'affectation (Renaissance, Atrium, Europe, Amériques, etc.)
- L'import PDF doit gérer ces plannings séparément (format à voir quand Kevin envoie les PDF)

**Impact technique :**
- Nouvelle clé overrides (ex: `cmc_ov_pitboss`, `cmc_ov_inspecteur`) ou sous-clés dans `cmc_ov`
- Nouveaux rôles `pit` / `ins` dans `ROLE_SHIFTS` (structure prête depuis v9.80)
- Salle/lieu comme champ additionnel par entrée planning
- ⚠️ Espace localStorage : prévoir nettoyage agressif (v9.120) + possible migration IndexedDB

**PDF REÇUS (2026-04-16 04:00) — ANALYSE COMPLÈTE captures ZOOM :**

### ⚠️ Info admin (2026-04-16 04:25) : "Les inspecteurs vont tous passer pit boss à terme"
→ Prévoir migration inspecteur → pit boss. Pas de section inspecteur dédiée à créer.
→ La structure `role:"pit"` / `role:"sup"` suffit. Ajouter `role:"ins"` si inspecteurs avant transition.

### ⚠️ Info admin (2026-04-16 04:25) : "Fais des familles dans les fiches"
→ Afficher la famille (BJ/Roulettes/CMC/Cadres) clairement dans chaque fiche employé/cadre.
→ Filtres par famille dans vEmps, vCadres.

### ⚠️ Info admin (2026-04-16 04:25) : "Organise toute la partie admin bcp plus clairement"
→ Refonte UX admin demandée : plus fonctionnel, visuel, intuitif, pratique.
→ Regrouper par catégorie, cards claires, icônes cohérentes, actions directes.

### ⚠️ Info admin (2026-04-16 04:25) : "Augmente encore bcp la visibilité des écrits"
→ Font-weight global remonté, text-shadow renforcé, couleurs plus contrastées.
→ Appliquer sur TOUTES les vues sans exception.

### Titre section dans le PDF : `Pit Boss 15`

### 16 PIT BOSS (noms complets + matricules)
| Matricule | Nom | Actif |
|-----------|-----|-------|
| 62224/62056 | JANEL JM | oui |
| 62224/62056 | GARELLI C | oui (*) |
| 62224/62056 | LANDAU J | oui |
| 62224/62056 | PETIT J | oui |
| 0 | BOUVIER JF | oui |
| 62224/62056 | JONIAUX S | oui |
| 62224/62056 | HERVE A | oui |
| 62224/62056 | EMMERICH JC | oui |
| 62224/62056 | ENZA C | oui |
| — | CORNUTELLO A | oui |
| 62224/62056 | PENNACINO JP | oui |
| 62224/62056 | DI COLANGELO F | oui (*) |
| 62224/62056 | CAMPI H | oui |
| 62224/62056 | PELAZZA F | oui (*) |
| 62224/62056 | LONG JP | oui (*) |
| 62224/62056 | ROSPOCHER G | oui (*) — MALADIE tout le mois avril |

### 5 SUPERVISEURS
| Matricule | Nom |
|-----------|-----|
| 0 | ETTORI M. |
| 0 | FOUQUE V. |
| — | PLACENTI L. (*) |
| 62224/62056 | DOGLIOLO Y. |
| 0 | MUS L. |

### CODES HORAIRES PIT BOSS (légende verte — TOUS LIRE)
Barre légende : `15 | HD | 12H30/19 | 12H30/19 | 15/19 | 16/20 | 19/2 | 19/4 | 19/4 | 22/6 | 22/6`

**Mapping code → lieu (tableau légende) :**
| Code | Lieu |
|------|------|
| `19/4` | **CCDP** |
| `16/20` | **CMC** |
| `12H30/19` | **CMC** |
| `22/6` | **CMC** |
| `19/4'` (avec ') | **CMC** |
| `15/19` | **CCDP** |
| `19/2` | **CMC** |
| `12H30/19` (2ème) | **CMC** |
| `15/20` (rose) | **POKER NO LIMIT** |

⚠️ **ATTENTION** : `19/4` PIT BOSS = CCDP, mais `19/4` EMPLOYÉ = CMC.
Le MÊME code a un LIEU DIFFÉRENT selon le rôle ! L'app doit gérer ça.

`19/4'` (avec apostrophe) = CMC (comme les employés variante CDP).

### CODES HORAIRES SUPERVISEUR (légende bleue/cyan)
Visibles en bas du PDF avril (coupé). À confirmer avec Kevin.

### Autres codes vus dans les cellules
| Code | Sens |
|------|------|
| `PK` | Poker (fond rose — affectation Poker) |
| `HD` | Hors Département ? ou Jour Férié ? (fond rouge vif) |
| `RRT` | Récup repos travaillé |
| `PRT` | Prêt |
| `CP` | Congé payé |
| `RH` | Repos hebdo |
| `R` | Repos |
| `M` | Maladie (ROSPOCHER G tout le mois avril) |

### Format spécial `12H30/19`
Ce code contient un "H" (heure) : signifie **12h30 à 19h**.
Le parseur doit accepter le format `XXhXX/YY` en plus de `XX/YY`.

### Colonnes après le nom
- Colonne 1 : `*` = marqueur spécial (senior ? ou annotation)
- Colonne 2 : nombre (1, 11, 21) = peut-être index de rotation ou début de service
- Colonne 3 : nombre (30, 31, 20, 10) = nombre de jours du mois ou fin de service

---

**ANCIENNE ANALYSE (remplacée) :**

### Document 1 : "7 PLANNING PIT BOSS-SUPE..." — Avril 2026
- **2 sections dans le même PDF** : PIT BOSS (barre verte) + SUPERVISEUR (barre bleue)
- Format identique au planning employés : noms à gauche, 30 jours en colonnes, codes couleurs dans les cellules
- Matricules en colonne gauche (format XX/XX/XXXX ou XXXXXXXX)
- Couleurs identiques (rose = 22/6, jaune = 19/4, violet = 16/22, vert = 14/19, bleu = 20/5, orange = 16/3)

**Noms PIT BOSS (lisibles partiellement) :**
- ANSEL M, GARELLI C, BENIST ?, BOUVIER B, HERVE A, DINA C
- CORNALULLO R, FRANCOTTE ?, DI COLANTOSIO F, PELAZZA F, ROSPOCHER G
- Environ 12-15 pit boss

**Noms SUPERVISEUR :**
- Section séparée en dessous (barre bleue)
- ~3-5 superviseurs visibles (texte trop petit pour lire)

**Légende PIT BOSS (codes horaires + LIEU) :**
| Code | Lieu | Couleur fond |
|------|------|-------------|
| 19/6 | CCDP | orange |
| 19/70 | CMC | ? |
| 15/6? | CMC | ? |
| 22/6 | CMC | rose |
| 23/6 | CMC | ? |
| 19/3 | CMC | ? |
| 15/70 | ? | ? |
| — | POKER NO LIMIT | jaune vif |

**Légende SUPERVISEUR :**
| Code | Lieu |
|------|------|
| 23/6 | CMC |
| 19/20 | CMC |
| 22/6 | CMC |
| 19/3 | CMC |

### Document 2 : "3 PLANNING PIT BOSS-..." — Mai 2026
- Même format que Avril
- Mêmes noms (à confirmer)
- Mois de Mai 2026

### Points clés à implémenter
1. **Import séparé** : détecter "PIT BOSS" / "SUPERVISEUR" comme catégorie (pas "employé")
2. **Codes horaires DIFFÉRENTS** des employés : 19/6, 19/70, 23/6, 15/6, 15/70 → NOUVEAUX codes à ajouter au dictionnaire CODES
3. **Lieu EXACT** par code : chaque horaire correspond à un lieu (CMC, CCDP, Poker No Limit)
4. **Vue dédiée** dans l'app : onglet "Cadres" ou sous-section vPlan/vDeparts
5. **Stockage** : clé séparée `cmc_ov_cadres` ou sous-clé dans `cmc_ov` avec tag `role:"pit"/"sup"`

### Format du PDF (pour le parseur)
- Titre contient "PIT BOSS" et/ou "SUPERVISEUR" → détecter comme planning cadres
- Même structure de grille que les employés (jours 1-31 en colonnes)
- Légende en bas avec barres colorées = mapping code → lieu

**⚠️ Les images sont trop petites pour lire tous les détails. Kevin devra :**
- [ ] Envoyer les PDF directement (pas screenshots) dans l'app CMC Teams via Import
- [ ] OU envoyer des captures ZOOM sur la légende et les noms pour que je lise tout

---

## 🕐 Horaires multi-rôles (à compléter)

**v9.80 préparation structure dans ROLE_SHIFTS.**

L'admin a dit : *"Bientôt nous aurons les horaires inspecteur, superviseurs, pitboss,
qui sont différentes. Prévoit dans l'import et dans l'app."*

**STATUS : En attente des codes exacts**. Structure prête dans `ROLE_SHIFTS[roleId]`.

Rôles identifiés :
- `ins` : Inspecteur
- `sup` : Superviseur
- `pit` : Pitboss
- `asi` : Assistant
- `ema`/`emb`/`eme` : Employés (américain/baccara/européen)
- `cam`/`ce`/`sce`/`cba` : Chefs

---

## 🎰 Plans casino & Tables

### ✅ Plans des casinos DÉJÀ dans l'app (depuis v9.62)

**`PLANS_CMC`** (Casino de Monte-Carlo, ligne 1152 de index.html) :
- 8 salles structurées : `renaissance`, `atrium`, `europe`, `ameriques`, `blanche`, `medecin`, `touzet`, `superprives`
- Pour chaque salle : architecte, description historique, jeux exploités, dress code, accès, horaires
- 6 annexes (Train Bleu, Salon Rose, Bars, Opéra Garnier, etc.)
- Historique complet (fondation 1856 Charles III, extensions Garnier/Dutrou, etc.)

**`PLANS_CDP`** (Casino Café de Paris, ligne 1250) :
- Zone principale + Electronic Gaming + 2 terrasses
- Chiffres : 640 machines, 18 postes roulette élec, jackpot 1M€

**Vue app** : accessible via onglet `vConvention` → "🏛️ Lieux" (3 sous-onglets CMC / CDP / Comparer)

**Outils IA** :
- `find_game_rooms(game, establishment)` : trouve les salles pour un jeu donné
- `get_convention_article` : consultation réglementaire

### ⏳ Ce qui MANQUE pour la gestion dynamique des tables

L'admin a demandé : *"Tables amovibles, pouvoir bouger/renommer/changer numéros/jeux exploités, mettre des noms de salon, tables amovibles selon moments (travaux, manifestations)."*

Ce qui existe déjà = description **statique** des salles et jeux possibles.
Ce qui MANQUE = structure de **tables individuelles** (numéros, état dynamique, assignation).

**Features à implémenter** :
- Schéma `A.tables[]` avec : `{id, num, salle, jeu, ouverte, employe?, derniereModif}`
- UI drag & drop entre salons
- Éditeur : renommer table, changer numéro, changer jeu exploité
- Renommer / ajouter salons configurables
- Historique versions (snapshots selon événement : travaux, manif)
- Intégration planning : affecter employé à table selon shift

**En attente de l'admin** :
- Numéros exacts des tables par salle (ex: Europe → tables 1-8 ?)
- Jeu par défaut par numéro (ex: Table 1 Europe = Black-Jack ?)
- Nom des salles en usage vs nom PDF officiel

---

## 🤖 Vision IA (v9.77+)

L'admin veut l'IA au maximum de ses capacités :

1. **Admin peut tout modifier via langage naturel**
   - "Change l'email de DUPONT", "Crée employé MARTIN équipe r3", "Publie MOTD…"
   - 76 outils dont 24 admin (v9.102)

2. **IA intervient automatiquement** :
   - Vérifie les imports (verify_import_integrity, deep_verify_import)
   - Propose suggestions proactives sur l'accueil
   - Monitore burnout / anomalies
   - Corrige/signale problèmes en autonomie

3. **Gestion tables casino (future)** :
   - Optimisation rotation tables, affectation employés
   - Calcul nombre d'employés nécessaires selon ouvertures
   - Respect pauses 20/40/60 min (seniors vs standard)
   - Modèles de casinos internationaux comme référence

4. **Restrictions users non-admin** :
   - Lecture seule pour tout ce qui est modification
   - Peuvent interroger planning, convention, jeux
   - **Burn-out info = admin-only** (confirmé v9.105 ligne 7717 `if(isAdm&&...)`)

---

## 🛡 Stabilité & pièges connus (session 2026-04-13)

1. **Jamais d'échappements compliqués dans `onclick=` inline**
   - Pattern `fn:"...\\\"function\\\"..."` → crash Safari iOS "Invalid escape in identifier"
   - Toujours utiliser un **helper nommé** (ex: `_showBurnoutRisks(y,m)`)
   - Jamais `\u{XXXX}` (ES6) → utiliser surrogate pair `\uD83D\uDCF1`

2. **DOM orphelin après `dc()` dans STT (v9.106)**
   - `sttStart` capturait `inputEl` AVANT `dc()` → reference détachée
   - Fix : re-query `document.getElementById(targetInputId)` dans `onresult`
   - Règle : toute fonction async qui vit au-delà d'un `dc()` doit re-query le DOM

3. **`localStorage.clear()` doit TOUJOURS préserver la config admin**
   - cmc_ia_key, cmc_ia_proxy, cmc_fb_url, cmc_theme, cmc_a11y, cmc_lang,
     cmc_tts_enabled, cmc_ia_enabled, cmc_ia_websearch, cmc_emailjs_config
   - Appliqué dans : bouton erreur (ligne 564), reset migration (ligne 4453)
   - Le bouton admin "Reset total" (confirmDanger VIDER) est la seule exception nucléaire

---

## 🎨 Couleurs CODES (v9.105 — affinées à partir PDF SBM)

| Code | Fond | Texte | Usage |
|------|------|-------|-------|
| `22/6` | `#fccfe0` rose pastel | `#6a1838` | CMC standard |
| `19/4` | `#fff4a0` jaune pâle | `#463808` | CMC standard |
| `16/3` | `#ffb070` pêche saturé | `#5a2808` | CMC standard (plus franc) |
| `14/19` | `#c4e8a8` vert tendre | `#1f5008` | CMC standard |
| `20/5` | `#b8d4f0` bleu clair | `#0c3a78` | CMC standard |
| `16/22` | `#d4c4ec` lavande | `#402088` | CMC standard |
| `20/5*` `19/4*` `16/3*` `16/22*` | `#ffe4d0` **pêche TRÈS clair** | `#804418` | **CDP (distinct)** |
| `19/4'` | `#ffe4d0` | `#804418` | Convention |
| `RH` | `#c8a8e0` violet | `#2a0870` | Repos hebdo |
| `R` | `#e8e8e8` gris | `#202020` | Repos |
| `CP` | `#f8c0d0` rose saumon | `#6a1028` | Congé payé |
| `AF` | `#a8e0a8` vert | `#0c3a0c` | Formation |
| `M` | `#ffe840` canari | `#4a3808` | Maladie |
| `RRT` | `#ffd850` | `#5a3808` | Récup repos travaillé |
| `HC` | `#d8e8a8` vert-jaune | `#2e3a10` | Heures comp. |
| `PRT` | `#ffd060` | `#5a3808` | Prêt |

**Règle admin** : CDP **beaucoup plus clair** visuellement que CMC (même horaire 16/3 vs 16/3*).

**Transparences réduites (v9.105)** :
- `.card` : rgba(14,28,18,.55) (avant .28)
- `.sth` / `.dth` : rgba(18,32,22,.55) (avant .22)
- `.inp` : rgba(255,255,255,.14) (avant .09)
- Bordures gold : .32 (avant .18)

---

## 📱 UX / Règles permanentes

1. **Simple, visuel, ludique, compréhensible** (règle 1bis CLAUDE.md)
   - Icônes/emojis sur chaque bouton
   - Aide contextuelle `?` sur sections complexes
   - User stories avant nouvelle feature
   - Labels français clairs (pas jargon)

2. **Vérifications AUTOMATIQUES** (pas de boutons)
   - v9.102 : auto-vérification après chaque import (bandeau + toast)
   - Pas besoin d'action admin pour contrôler qualité

3. **Notes persistantes obligatoires**
   - Toute info métier donnée par l'admin = à stocker dans ce fichier
   - Sans attendre que l'admin redemande

---

## 🔧 Infrastructure

- **Déploiement** : GitHub Pages branche `main` (auto)
- **Firebase** : RTDB `cmcteams-c16ab` (europe-west1)
- **AID admin** : `U11804`
- **Session TTL** : 8h (ajustable)
- **Version actuelle** : voir `APP_VER` dans index.html

---

---

## 📱 Comptes & appareils Kevin (session 2026-04-18)

**Appareils :**
- iPhone (principal) — Safari PWA
- Tablette Android (chez sa belle-fille actuellement)
- Ordinateur (pas sur lui, a connecter plus tard)

**Compte Cloudflare :** Desarzens.kevin@gmail.com
**Proxy KDMC :** `https://kdmc-proxy.desarzens-kevin.workers.dev` — NON FONCTIONNEL (code Worker incorrect, retourne "Host not in allowlist"). A corriger quand Kevin aura un PC. En attendant, cle API directe fonctionne parfaitement.

**Femme de Kevin :** SAINT-POLIT Laurence — compte KDMC gratuit (free plan)
**REGLE :** Aucune modification importante de l'app sans accord explicite de Kevin.

**Comptes email :**
- Gmail : Desarzens.kevin@gmail.com
- Outlook : kevind@monaco.mc (sur iPhone)
- iCloud (adresse a confirmer — icloud.com ou mac.com)

**Services multimedia :**
- Spotify (compte actif) — integre dans KDMC (playlists, recherche, ambiances)

**Reseaux sociaux / messagerie :**
- WhatsApp (a connecter via Meta Business API)
- Instagram (a connecter)
- Facebook (a connecter)
- Telegram : bot @Kdmc_kevind_2026_bot (deja cree)

**Demande admin (2026-04-18) :**
> "Je veux que tu aies acces a tous mes outils, toutes mes applications
> au maximum pour pouvoir agir quand je te le demande. Executer des
> actions pour moi sur tous mes appareils."

**Actions requises :**
- [ ] Gmail : activer API Google + OAuth
- [ ] Outlook/monaco.mc : configurer OAuth Microsoft
- [ ] WhatsApp : creer compte Meta Business API
- [ ] Instagram/Facebook : lier Meta Business Suite
- [ ] iCloud : mot de passe d'app specifique
- [ ] Configurer tout dans la section admin APEX AI

---

---

## ⚠️ ANTI-TIMEOUT — Regle permanente (2026-04-18)

**Probleme** : "API Error: Stream idle timeout" quand on ecrit des gros fichiers d'un coup.

**Solution obligatoire :**
1. JAMAIS ecrire un fichier > 500 lignes en un seul Write — decouper en morceaux
2. Ecrire le squelette d'abord (Write), puis completer par Edit sequentiels
3. Agents : leur donner des taches COURTES et PRECISES (pas "ecris 4000 lignes")
4. Si timeout : reprendre IMMEDIATEMENT ou on en etait, sans tout recommencer
5. Travailler en autonomie — ne jamais s'arreter a cause d'un timeout

**Kevin ne veut PLUS voir de timeout bloquer le travail.**

---

## 📡 Domotique Kevin (2026-04-19)

**Broadlink** : present sur le reseau local de Kevin
- Modele : a confirmer (probablement RM4 Mini ou RM Pro)
- Protocole : UDP proprietaire (necessite bridge HTTP pour controle web)
- Usage : TV, climatisation, lumieres, volets

**Configuration necessaire (Kevin) :**
- [ ] Installer broadlink-http-rest sur un appareil local (PC, Raspberry Pi, ou NAS)
  - `pip install broadlinkhttp` ou Docker : `docker run -p 8780:8780 rackhd/broadlink-http`
  - OU installer Home Assistant avec integration Broadlink native
- [ ] Configurer l'URL du bridge dans APEX AI > Reglages > IR Blaster
- [ ] Apprendre les codes IR de chaque appareil (TV, AC, lumieres)

**Appareils a controler :**
- [ ] TV (marque a confirmer)
- [ ] Climatisation (marque a confirmer)
- [ ] Lumieres (si connectees via IR)
- [ ] Volets (si connectes)

---

## 📡 Broadlink Kevin (2026-04-19)

**Kevin a un Broadlink sur son reseau local.**
- 42 commandes IR pre-configurees (TV, AC, lumieres, volets, ventilo, barre son, projecteur)
- Bridge HTTP requis : `pip install broadlinkhttp` sur un appareil local
- URL a configurer dans KDMC > Reglages > IR Blaster

## 🤖 KDMC v6.1 — Capacites (2026-04-19)

**L'IA peut modifier l'app + se faire aider + verifier son travail :**
- Self-modify: CSS, JS, onglets, code source
- AI Crew: 5 agents internes verifient chaque reponse
- Local Workers: 4 agents arriere-plan surveillent en permanence
- Auto-learn: reconnait 24 marques d'appareils automatiquement
- Self-improving: apprend des reactions 👍👎

**247+ actions, 70+ templates, 10 personas, 15 achievements, 12 ambiances**

## 🚨 REGLE ABSOLUE N°1 (Kevin 2026-04-19)

> **TOUT AU MAXIMUM. TOUJOURS. DES LE DEBUT. SANS QU'ON AIT A LE REDEMANDER.**
> - Stockage : MAXIMUM
> - Performance : MAXIMUM
> - Securite : MAXIMUM
> - Nombre de voix/themes/templates/personas : MAXIMUM
> - Limites/quotas : les plus hauts possibles
> - Qualite code : EXPERT SENIOR
> - Chaque fonction : la MEILLEURE possible
> - Ne JAMAIS mettre une valeur basse "par defaut" — toujours le MAX
> - Se faire aider par des agents pour verifier qu'on est au MAX
> - APPRENDRE de ses erreurs et NE PLUS les refaire
> - NOTER cette regle PARTOUT (CLAUDE.md, NOTES_USER.md, system prompt app)

## 🚨 REGLE ABSOLUE N°0 — AUTONOMIE TOTALE (Kevin 2026-04-19)

> **FAIRE TOUT EN AUTONOMIE. NE DEMANDER A KEVIN QUE CE QUI EST IMPOSSIBLE.**
> - Si Claude a les infos → configurer lui-meme SANS demander
> - Si Claude a les acces → faire lui-meme SANS demander
> - Si Claude a les outils → utiliser lui-meme SANS demander
> - VERIFIER que c'est VRAIMENT impossible avant de demander
> - Cette regle s'applique a TOUS les projets, TOUTES les sessions, TOUTES les interactions
> - NE PLUS JAMAIS dire "Kevin doit faire X" si Claude peut le faire

## ⚠️ Regle permissions (2026-04-19)
> **Toute demande de permission (micro, notifications, camera, etc.) = UNE SEULE FOIS.**
> Si acceptee: sauvegarder et ne PLUS redemander. JAMAIS.
> Si refusee: sauvegarder et ne PLUS redemander. JAMAIS.
> Note: Safari iOS redemande parfois les permissions — c'est une limitation Apple, pas l'app.
> L'app doit MINIMISER les demandes au strict necessaire.

## 📋 Regles permanentes (rappel)

1. **Toute info de Kevin = noter dans NOTES_USER.md immediatement**
2. **Lire MEMO_RESUME.md + NOTES_USER.md au debut de CHAQUE session**
3. **MAJ tous les .md apres chaque session**
4. **Ne JAMAIS oublier une demande — tout dans TodoWrite**
5. **Se referer aux feuilles de route pour CHAQUE action**
6. **A chaque fin de travail, se demander : puis-je faire mieux ?**
7. **Chaque livrable = verifie, teste, corrige, sauvegarde AVANT livraison**
8. **Ne JAMAIS s'arreter avant d'avoir tout termine**
9. **Agents/workers en arriere-plan pour surveiller en permanence**
10. **Si l'app ne connait pas un sujet, elle va chercher les infos (web_search) AVANT de repondre**
11. **L'app doit anticiper bugs, fonctions cassees, et corriger automatiquement**
12. **Long terme : l'app doit durer pour toujours, etre gratuite/low-cost, rapporter un maximum**

## 💰 Objectif business KDMC

- **Visibilite maximale** : SEO, Product Hunt, Reddit, LinkedIn, TikTok, YouTube
- **Publicite** : mettre en avant les avantages vs concurrence partout
- **Revenus** : Free/Pro (14.99 EUR)/Enterprise (49.99 EUR)/Lifetime (249 EUR)
- **Couts quasi zero** : GitHub Pages (gratuit), Firebase (gratuit), Cloudflare (gratuit)
- **Marge nette : ~85%**
- **Objectif 3 ans : 900 000 EUR/an**

---

*Dernière mise à jour : 2026-04-19 (KDMC v6.1 — 60 commits, 355 KB)*
