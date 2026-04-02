# CMCteams — Récapitulatif complet

> Application de planning et gestion des équipes du département Cartes  
> Casino de Monte-Carlo (SBM)  
> Dernière mise à jour : v8.2 — Avril 2026

---

## État actuel de l'application

| Paramètre | Valeur |
|-----------|--------|
| **Version** | v8.2 |
| **DATA_VER** | 11 |
| **Fichier principal** | `index.html` (≈ 263 KB) |
| **Hébergement** | GitHub Pages (branche `main`) |
| **Technologie** | Vanilla JS/HTML/CSS — SPA sans framework |
| **Stockage** | `localStorage` uniquement (pas de serveur) |
| **Langue UI** | Français |

---

## Architecture

```
index.html          ← toute l'application (HTML + CSS + JS)
CLAUDE.md           ← guide pour l'IA
RECAP.md            ← ce fichier
.github/workflows/deploy.yml  ← déploiement GitHub Pages automatique
```

**Flux de déploiement** : `git push` sur `main` → GitHub Actions → GitHub Pages  
**Pas de build, pas de dépendances.** Éditer `index.html` suffit.

---

## Effectif total

| Famille | Équipes | Employés |
|---------|---------|----------|
| **BJ Chefs Cartes** (Blackjack) | 10 (Éq.1–10) | 64 |
| **Roulettes** | 13 (r1–r13) | 65 |
| **Employés CMC Cartes** | 13 (c1–c13) | 129 |
| **TOTAL** | **36 équipes** | **258 employés** |

---

## Structure des équipes et employés

### BJ Chefs Cartes — 64 employés

Paires miroirs : 1↔6 · 2↔7 · 3↔8 · 4↔9 · 5↔10

| Éq. | Miroir | Employés |
|-----|--------|----------|
| **1** | 6 | LANDAU B, MILLO W, SIRIO J, FABRE SOCCAL Y, ESPAGNOL S, TOMATIS P, GALLIS F, CIOCO S |
| **2** | 7 | MATTONE F, BRASSEUR F, GAZAGNE F, GATTI B, BONO F |
| **3** | 8 | BELTRANDI N, SOSSO G, AGLIARDI M, COSTE W, FIA S, EL MISSOURI O |
| **4** | 9 | PALMARO M, BASILE G, ENZA B, FOREST M, REVOLLON L, COZZI H |
| **5** | 10 | PUGNETTI S, MARIOTTINI J, DESARZENS K ★ADMIN, DESSI F, LEMONNIER PH |
| **6** | 1 | LARINI H, VERZELLO O, PARIZIA K, DANIEL S, CAISSON JC |
| **7** | 2 | BATTAGLIA D, NIGIONI J, GALLIS J, FARRUGIA VALERI S, MALGHERINI T |
| **8** | 3 | MAGAGNIN J, MERLINO B, ARCURI F, PAGLIAI D, PETIT T, COURTIN F, CLAVE C, NICASTRO M, BONETTI P, CAMPI PH, COTTALORDA D, DESSI P, PEREIRA MACENA F |
| **9** | 4 | PASTOR P, MAGARA M, GARCIA A, FURST P, BERNARDI JE |
| **10** | 5 | PASSERON G, ROSSI J, FAUTRIER M, GARRO S, PORTA A, RICORDO B |

### Roulettes — 65 employés

Paires miroirs : r1↔r8 · r2↔r9 · r3↔r10 · r4↔r11 · r5↔r12 · r6↔r13

| Éq. | Miroir | Employés |
|-----|--------|----------|
| **r1** | r8 | BASILE F ★, MARCHISIO M, GIORSETTI S, MALENFANT PJ, MILLET T |
| **r2** | r9 | LE DUC F ★, SOLIMEIS F, VECCHIERINI L, NUNEZ S |
| **r3** | r10 | MUCCILLI D ★, BENNEJEAN I, GARINO Y, SEGGIARO G, ANDRE C, PICCIONE F |
| **r4** | r11 | FRAPPIER R ★, VIGNA M, PODGORNY B, DUPONT A, ELIODORI J, ELIODORI V |
| **r5** | r12 | CRETOT L ★, SABINE O, CERETTI R, BOYER G, GIAUNA S, SIMONETTI N |
| **r6** | r13 | LANTERI E |
| **r7** | — | BONO V ★, CHATTAHY N, MARIANI M, ALDRIGHETTI JP, CARPINELLI K, MOUFLARD L |
| **r8** | r1 | BARONE E ★, RAMOS R, GARCIA N, GANCIA G, DAGIONI M |
| **r9** | r2 | AUBERT P ★, HAREL H, SBARATTO S, CARDONA P, LANTERI MINET P |
| **r10** | r3 | PORASSO C ★, ANTOGNELLI D, MERLINO T, BESSI N, ADROIT N, RUZIC M, ROSSI D |
| **r11** | r4 | TERRAGNO S ★, COSTAGLIOLI J, HORGNE C, CASTEL N, BEARD B |
| **r12** | r5 | RIGOLI JL ★, CONNEN R, NOVARETTI B, NIGIONI C, SALVANHAC G |
| **r13** | r6 | SOLFERINO F ★, VATRICAN T, DEVERINI F, DELMAS G |

### Employés CMC Cartes — 129 employés

Paires miroirs : c1↔c7 · c2↔c8 · c3↔c9 · c4↔c10 · c11↔c8 · c12↔c9

| Éq. | Miroir | Employés |
|-----|--------|----------|
| **c1** | c7 | BARILARO A, SYNAVE S, CABALLERO PA, DELLA PINA M, LAVAGNA Y, LAVAGNA E, MONTESANO M, KOVACS V, CATTALANO C, KARUANA T |
| **c2** | c8 | SANTINI K, BARILARO H, SERRA N, TESTA G, SUBTIL C, COTTON J, SOURMAILLE C, MATTONI C, MALGHERINI J, DJORDJEVIC G, BINI G |
| **c3** | c9 | BLANCHI H, LEVESY A, MORRA A, GENDREAU C, SORGI GM, FERRARI G, JOUGLAIN I, BASTIANELLI A, COSSO N, GENDREAU V |
| **c4** | c10 | ESPAGNOL A, CATALA T, MICHELIS A, VERDA N, BERNARD J, MORET A, BOTTA V, QUISSET Y, TOMA O, POUGET C, BRASSEUR FR |
| **c5** | — | ELENA C, SESTINI F, BAUBRIT R, GIACOLETTO S, DUPORT R, AGACCIO S, MBOREHA N, DELLA PINA L, ELENA A, CUCCHI H, CASELLA A |
| **c6** | — | CASTELLINI K, LUBIN O, NIGIONI A, RONCALLI A, CREMA F, PANIZZI S, LANGELLOTTI D, PAZZAGLIA A, ADELLI M, MAIARELLI M, LANTERI T |
| **c7** | c1 | ESPAGNOL P, DARDANNE K, SEGALEN L, CANE J, SINITO A, DALMASSO N, EL MISSOURI M, COCCHI H, CASTALDI V, GIOVANNETTI R |
| **c8** | c2 | GSTALDER F, GAZZA S, BAILET JF, DE RYCKE K, MARQUET N, SANTINI M, BATTAGLIA DE, MORTINI M, SCALZO M, BONNEFOND M |
| **c9** | c3 | DEGL INNOCENTI V, MUCCILLI A, SCHWIETZER M, TANNA K, GIACOBBI J, MANFREDI H, MERENDA V, COSLOVICH V, VOILLEQUIN R, BORGIA L |
| **c10** | c4 | BOIRON B, MIANI N, BERNARDI J, CRESCI C, SONDOORKHAN N, SIRIO S, INZIRILLO R, FRASCA A, ORENGO N, CHINTEMI J, TULEU C, AHMED A |
| **c11** | c8 | GILETTA B, BANTI H, ADELHEIM P, MARTIRE M, DE REGIBUS L, MORANA A, MORTER L, DI LUCA L, CAMILLERI P, DELAUNAY L |
| **c12** | c9 | BESSO N, GUERRE S, CAMBI O, ONNIS S, BLANCHY F, BERTOLOTTO F, ABBAS N, DEGIOVANNI R, VOUKASSOVITCH H, CAISSON K, TOULET F |
| **c13** | — | BLANZIERI K, ACCOMASSO F *(horaires aménagés)* |

---

## Compte admin

| Champ | Valeur |
|-------|--------|
| **Nom** | DESARZENS K |
| **Matricule (ID)** | `U11804` |
| **Équipe** | BJ Éq.5 |
| **Rôle** | Admin (`AID = "U11804"`) |
| **Accès exclusifs** | Admin panel, Import, Équipes, Employés, Stats, clé API IA |

---

## Codes horaires (CODES)

| Code | Libellé | Horaire |
|------|---------|---------|
| `22/6` | Nuit | 22h – 6h |
| `19/4` | Soirée longue | 19h – 4h |
| `16/3` | Après-midi/nuit | 16h – 3h |
| `14/19` | Journée | 14h – 19h |
| `20/5` | Soirée/nuit | 20h – 5h |
| `16/22` | Après-midi | 16h – 22h |
| `RH` | Repos Hebdomadaire | — |
| `R` | Repos | — |
| `CP` | Congé Payé | — |
| `M` | Maladie | — |
| `AF` | Formation | — |
| `RRT` | Récupération | — |

Les codes avec `*` (ex: `20/5*`, `16/3*`) indiquent un horaire avec CDP (Chef De Partie).

---

## Clés localStorage

| Clé | Contenu |
|-----|---------|
| `cmc_e` | Tableau des employés |
| `cmc_t` | Tableau des équipes |
| `cmc_ov` | Overrides planning `{"2026-3": {"U00001": {1:"22/6", ...}}}` |
| `cmc_pw` | Mots de passe hashés |
| `cmc_chat` | Messages du chat |
| `cmc_dver` | Version données (actuellement `11`) |
| `cmc_uid` | ID de l'utilisateur connecté |
| `cmc_ia_key` | Clé API Anthropic (saisie par l'admin) |
| `cmc_admin_pin` | PIN admin hashé |
| `cmc_chef_eq` | Chefs d'équipe par équipe |
| `cmc_chefs_t` | Chefs de partie par équipe/tour |
| `cmc_ci_YYYY_M` | Cache des indices de départ |
| `cmc_ref_YYYY-M` | Données de référence pour vérification |
| `cmc_lastread` | Dernier timestamp de lecture chat |

---

## Vues de l'application

| Vue | Accès | Description |
|-----|-------|-------------|
| `accueil` | Tous | Tableau de bord — employés au travail aujourd'hui |
| `planning` | Tous | Grille planning mensuelle (scroll horizontal) |
| `departs` | Tous | Ordre de départ par équipe et par jour |
| `absences` | Tous | Suivi des absences du mois |
| `stats` | Admin | Statistiques horaires |
| `chat` | Tous | Messagerie interne |
| `admin` | Admin | Panneau d'administration |
| `teams` | Admin | Configuration des équipes |
| `employees` | Admin | Gestion des employés |
| `import` | Admin | Import PDF planning |
| `ia` | Tous | Assistant IA (Claude API) |

---

## Assistant IA

- **Modèle** : `claude-haiku-4-5-20251001`
- **API** : Anthropic directement depuis le navigateur
- **Header requis** : `anthropic-dangerous-direct-browser-access: true`
- **Clé API** : stockée dans `cmc_ia_key` (localStorage)
- **Configuration** : bouton 🔑 visible uniquement pour l'admin (DESARZENS K)
- **Contexte injecté** : liste des 258 employés par équipe, planning du jour, codes horaires
- **Mode dégradé** : réponses locales par mots-clés si pas de clé API

**Pour activer :**
1. Se connecter en tant que DESARZENS K
2. Aller dans l'onglet **IA**
3. Cliquer sur 🔑 → saisir la clé `sk-ant-...`

---

## Planning Avril 2026 — données pré-chargées

- **Source** : PDF V2 Avril 2026 (extrait du planning officiel SBM)
- **Employés avec données** : 241 / 258
- **17 absents tout le mois** (CP/Maladie/Formation/Congé) :

| Employé | Statut | Équipe |
|---------|--------|--------|
| BONO F | Formation | BJ Éq.2 |
| LEMONNIER PH | Maladie | BJ Éq.5 |
| DESARZENS K | Présent | BJ Éq.5 |
| RICORDO B | CP | BJ Éq.10 |
| PEREIRA MACENA F | Congé | BJ Éq.8 |
| DESSI P | Congé | BJ Éq.8 |
| ELIODORI V | Congé tout le mois | Roul. r4 |
| MERLINO B | Non parsé (PDF) | BJ Éq.8 |
| ARCURI F | Non parsé (PDF) | BJ Éq.8 |
| PAGLIAI D | Non parsé (PDF) | BJ Éq.8 |
| LANTERI E | Non parsé (PDF) | Roul. r6 |
| CARPINELLI K | Non parsé (PDF) | Roul. r7 |
| MOUFLARD L | Non parsé (PDF) | Roul. r7 |
| DEVERINI F | Non parsé (PDF) | Roul. r13 |
| DELMAS G | Non parsé (PDF) | Roul. r13 |
| BAILET JF | Non parsé (PDF) | CMC c8 |
| ACCOMASSO F | Non parsé (PDF) | CMC c13 |

> Les "Non parsé (PDF)" sont dans la base mais sans horaires Avril — ils apparaissent dans leur équipe sans codes de shift. Ils peuvent être saisis manuellement via le planning (admin).

---

## Historique des versions

| Version | DATA_VER | Description |
|---------|----------|-------------|
| v7.2 | 7 | Import 3 formats PDF (roulettes, CMC, BJ) |
| v7.3 | 7 | Audit général, fix import, équipes miroir |
| v7.4 | 7 | Suppression génération auto planning |
| v7.5 | 7 | Planning vide sans import |
| v7.6 | 7→8 | Limite import 60→500 employés |
| v7.7 | 8 | Migration forcée localStorage |
| v7.8 | 8 | Refonte visuelle thème clair |
| v7.9 | 9 | Ajout 36 équipes + 129 employés CMC |
| v8.0 | 9→10 | Assistant IA Claude API intégré |
| v8.1 | 10 | Fix migration équipes (reset DEF_TEAMS) |
| **v8.2** | **11** | **Planning Avril 2026 pré-chargé (241 emp.)** |

---

## Système de migration (DATA_VER)

À chaque bump de `DATA_VER`, au premier chargement :
1. Synchronise les employés depuis `DEF_EMP` (team, family, chef, post)
2. Réinitialise `A.teams` depuis `DEF_TEAMS` (36 équipes)
3. Efface le cache CI (`cmc_ci_*`)
4. Supprime les employés importés hors `DEF_EMP`
5. Charge le planning Avril 2026 pré-seedé si `cmc_ov["2026-3"]` est vide

---

## Import d'un nouveau planning (mois suivants)

1. Se connecter comme **DESARZENS K**
2. Aller dans **Admin → Import**
3. Sélectionner le mois/année
4. Coller le texte extrait du PDF planning SBM
5. Cliquer **Importer**

Le parseur reconnaît 3 formats :
- **BJ** : `[PREFIXE] NOM from to shift1...shift30` avec codes suffixés `c`, `'c`, `*`
- **Roulettes** : section avec noms en en-tête puis données par position
- **CMC** : même format que BJ avec suffixes `"`, `"'`, `*`

---

## Fonctions JS clés

| Fonction | Rôle |
|----------|------|
| `render()` | Rendu complet (login ou app) |
| `dc()` | Re-rendu du contenu seul |
| `gpl()` | Retourne le planning du mois affiché (overrides uniquement) |
| `lg(key, fallback)` | Lecture localStorage avec JSON.parse |
| `ls(key, value)` | Écriture localStorage avec JSON.stringify |
| `esc(s)` | Échappe le HTML (obligatoire pour données user) |
| `tc(teamId)` | Couleur d'une équipe |
| `gt(teamId)` | Objet équipe depuis A.teams |
| `gm(teamId)` | Équipe miroir |
| `isEmpActive(emp, y, m)` | Vrai si l'employé est actif ce mois |
| `hasImportedData(y, m)` | Vrai si planning importé pour ce mois |
| `saveOv(eid, day, code)` | Sauvegarde un override (admin seulement) |
| `callClaudeIA(q)` | Appel API Anthropic pour l'assistant IA |
| `forceRefresh()` | Force rechargement depuis serveur (anti-cache iOS) |

---

## Points de vigilance

- **XSS** : toujours utiliser `esc()` avant d'injecter du contenu utilisateur dans `innerHTML`
- **Clé API** : ne jamais la partager / committer — elle est dans `localStorage` uniquement
- **DATA_VER** : incrémenter à chaque changement de schéma `DEF_EMP` ou `DEF_TEAMS`
- **Nouveau mois** : le planning est vide jusqu'à import PDF — normal et voulu
- **iOS Safari** : utiliser le bouton "Actualiser" de l'app si le cache pose problème
- **Admin** : seul `U11804` (DESARZENS K) a accès aux fonctions d'administration

---

## Ajouter un employé (procédure)

1. Ajouter l'entrée dans `DEF_EMP` dans `index.html` avec un ID unique (`U00259`, etc.)
2. Bumper `DATA_VER` (ex: 11→12)
3. La migration synchronisera automatiquement au prochain chargement

---

## Ajouter un mois de planning (procédure)

1. Admin → Import
2. Sélectionner mois et année
3. Coller texte PDF
4. Importer

OU manuellement : l'admin peut cliquer sur chaque cellule du planning pour saisir un code.

---

*Document généré automatiquement — Casino de Monte-Carlo / CMCteams v8.2*
