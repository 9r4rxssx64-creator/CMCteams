# NOTES_USER — Informations métier données par l'admin

> **Lecture obligatoire à chaque session.**
>
> ## 🚨 MÉTA-RÈGLES PERMANENTES (session 2026-04-13)
>
> **À appliquer SANS que l'admin ait à le redemander.**
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

*Dernière mise à jour : 2026-04-13 (v9.103)*
