# 📋 Reconnaissance des imports SBM — Spec exhaustive (Kevin 2026-05-28)

> **Règle absolue Kevin** (répétée 3×) : « Reproduction à l'identique, aucune
> erreur ou oubli n'est toléré. Jamais. » Toute donnée écrite = exactement
> ce qui est dans le PDF source. Aucune invention, aucun fallback historique,
> aucun auto-remplissage. Cellule ambiguë → `needs_review`, Kevin tranche.

> Source : `NOTES_USER.md` (2016 lignes) + `CLAUDE.md` erreurs #38/44/47/48/50/51/61/62/63 + relecture parser-tester v0.6.1.

---

## 0. SYNTHÈSE ANTI-OUBLI — TOUT ce qu'une PERSONNE doit avoir reconnu (Kevin 2026-05-28)

> « Toutes les personnes avec leurs compétences, horaires, équipes, équipes
> miroir, lieux de travail, grade, groupe, etc. n'oublie rien. Tout sert à
> quelque chose, couleur, traits, etc. »

**Checklist exhaustive par personne** (chaque ligne du PDF) — aucune
ne doit manquer pour qualifier la lecture comme « complète ».

⚠ AVANT de regarder les lignes, le document lui-même doit être identifié :

### ⓪ Méta-import (niveau document, OBLIGATOIRE en tête de chaque import)

| Attribut document | Source | Sens | Sandbox T1 |
|---|---|---|---|
| **Mois** | Titre PDF (`MAI 2026`, `Juin 2026`, `Mai 2026 V2`) → minuscule + accents NFD | Détermine la clé `YYYY-M` de stockage `A.overrides[key]` et le nombre de jours (28/29/30/31) | ✅ `detectMonthYear` `helpers-reuse.js:120` |
| **Année** | Idem (4 chiffres après le mois) | Indispensable pour la clé YYYY-M | ✅ idem |
| **Version** | Filename `V2`/`V3` (priorité) puis contenu | V1 par défaut si absent (= original SBM). V2/V3 = mises à jour successives. Le merge respecte la version (cf § 9 et règle MERGE Kevin 2026-05-07) | ✅ `detectVersion` `helpers-reuse.js:94` |
| **Type document** | « Pit Boss »/« SUPERVISEUR »/« INSPECTEUR »/« BJ Éq »/« Roul. Éq »/« CMC Éq »/« AMENAGEMENT » | Détermine quelle famille parser appliquer (cadres vs chefs vs employés vs aménagement) | ✅ `detectPlanningType` `helpers-reuse.js:56` |
| **Naming SBM officiel** | Confirmé Kevin 2026-05-16 | « Mai » seul = cadres ; « Mai V1/V2 » = chefs/employés | doc § 1 |
| **Hash SHA-256 du PDF** | Calcul client-side | Idempotence import (dédupe) + audit log | ✅ `sha256` `helpers-reuse.js:230` |
| **Timestamp import** | `Date.now()` | Audit, ordre des versions | ✅ |
| **Source PDF** (filename + bytes) | Drag&drop / paste / fichier | Traçabilité | ✅ |

**Effet du méta-import sur le reste** :
- Clé de stockage : `key = "${year}-${month}"` (ex `"2026-4"` pour mai 2026, mois 0-indexé)
- Nombre de cellules à remplir par personne : `daysInMonth(year, month)` (28/29/30/31)
- Merge V2/V3 vs V1 : ne JAMAIS effacer les sections non couvertes par le nouvel import (Kevin 2026-05-07 : import incrémental) — cf § 9
- Si **mois manquant** → cellule de saisie obligatoire, l'import ne se valide pas sans
- Si **version ambiguë** → demander à Kevin de confirmer (banner « V1 par défaut, OK ? »)

### A. Identification

| Attribut | Source PDF | Sens | Détail |
|---|---|---|---|
| **Surname** (1 à 2 tokens) | Texte avant l'initiale | Identité | § 1.1 |
| **Initiale(s)** (1 à 3 lettres) | Token après surname | Différencier homonymes | § 1.2 |
| **Matricule SBM** | Format `62224/62056` ou `0` ou `—` ou vide | Téléphones internes — **À IGNORER pour cadres** mais utile pour employés | § 6.1 |
| **Code BRTPECK** | Avant le nom (`BRTP+K`, `.BRTCP+E.`, `BRTCP+KE`) | Compétences validées | § 1.3 |

### B. Compétences (lettres BRTPECK)

| Lettre | Jeu | Source | Détail |
|---|---|---|---|
| `B` | BlackJack | Code poste | § 1.3 |
| `R` | Roulette américaine | Code poste | § 1.3 |
| `T` | Texas Hold'em | Code poste | § 1.3 |
| `P` | Punto Banco (Baccara) | Code poste | § 1.3 |
| `E` | Roulette Européenne (école premium SBM Art. 4) | Code poste | § 1.3 |
| `C` | Craps | Code poste | § 1.3 |
| `K` | BJ Super / Poker Cash | Code poste | § 1.3 |
| **`+E`** = ajoutée formellement post-formation | `+` indique acquisition après l'embauche initiale | § 1.3 |
| **`+K`** = pratique avancée post-promotion | Idem | § 1.3 |
| **Total 7 lettres** = Expert (Convention Art. 11 niv 7) | — | § 1.3 |

### C. Grade / rôle

| Grade | Signal PDF | Stockage interne |
|---|---|---|
| Employé | Section « CMC Éq.N » / pas de chef/cadre | `chef=false` |
| Sous-chef | `E` + apparaît dans planning chefs cartes | `sousChef=true` |
| Chef de table | `.` à la fin du code BRTPECK (`BRTCP+E.`) | `chef=true` |
| Chef GF Baccara | `P`/`P+` SANS `E`, groupe fermé | `gf=true, family=baccara` |
| Inspecteur (en transition Pit Boss) | Section « INSPECTEUR » | `role="ins"` |
| Superviseur | Section « SUPERVISEUR » | `role="sup", family="cadres"` |
| Pit Boss | Section « Pit Boss 15 » | `role="pit", family="cadres"` |
| Cadres en faisant fonction | Fond bleu (Vision) — BOUVIER JF avr 2026 | `faisant_fonction=true` |

### D. Groupe (issue Convention SBM 1er avril 2015)

| Groupe | Détection | Flag |
|---|---|---|
| **Groupe OUVERT** | Tous les nouveaux post-Convention 2015 + nouveaux dans imports | `groupeOuvert=true` (permanent, jamais retiré) |
| **Groupe FERMÉ** | Anciens déjà attribués chefs/spécialités avant 2015 | `groupeOuvert=false` |
| Compétence rose 🌸 (`pinkComp=true`) | Visuel PDF + admin manuel | Indique groupe ouvert pour `P`/`P+` |
| Européen | A `E` dans code poste | family=`roulettes` |
| Baccara fermé | `P` ou `P+` SANS `E` ET groupe fermé | family=`baccara` |

### E. Famille (déduite section PDF)

| Famille | Section header PDF | Code interne |
|---|---|---|
| Chefs BJ | « Chef BJ », « BLACKJACK », « BJ Éq.N » | `bj` |
| Chefs Roulettes / Jeux Européens | « Roul. Éq.N », « ROULETTES » | `roulettes` |
| Employés CMC | « CMC Éq.N », « CARTES CMC » | `cmc` |
| Cadres | « Pit Boss 15 », « SUPERVISEUR », « INSPECTEUR » | `cadres` |
| Aménagement | « AMENAGEMENT », « Horaires aménagés » | `amenage` |
| Baccara (fermé) | `P`/`P+` sans `E` ET ancien | `baccara` |

### F. Équipe + équipe miroir (CHANGE chaque mois)

| Attribut | Source PDF | Stockage |
|---|---|---|
| **Équipe courante du mois** | Pattern RH/R identique OU colonne PDF OU numéro explicite (V1 juin+) | `emp.teamHistory["YYYY-M"]` |
| **Équipe miroir du mois** | Même nombre d'emps + offset RH constant + horaire de base différent | `cmc_team_mirror_<key>` map |
| **Famille du mois** | Section PDF où apparaît le bloc | `emp.familyHistory["YYYY-M"]` |
| **JAMAIS `emp.team` DEF_EMP** comme équipe courante | Règle absolue Kevin 2026-05-16 | — |

**Effectifs typiques par équipe** :
- Chefs BJ : 2-3 emps
- Roulettes : 5-6 emps
- Cadres : PAS d'équipe (rotation individuelle 1-14)

### G. Horaires (cellules jour 1 à 31)

| Pour CHAQUE jour du mois | À reconnaître | Source |
|---|---|---|
| **Code horaire** | `22/6`, `19/4`, `16/3`, `14/19`, `20/5`, `16/22`, `16/20`, `15/19`, `19/2`, `15/20`, `12h30/19`, `12H30/19` | Cellule jour |
| **Suffixe `c`** | Chef (`22/6c`) | Idem |
| **Suffixe `*`** | Lieu CCDP+CMC (`20/5*`) | Idem |
| **Suffixe `'`** | Convention (rouge/jaune) | Idem |
| **Suffixe `"`** | Variante Convention | Idem |
| **Suffixe `"'`** | Combo Convention | Idem |
| **Suffixe `:`** | Variante préservée | Idem |
| **Code statut** | `RH`, `R`, `CP`, `AF`, `M`, `MAL`, `MT`, `PAT`, `AT`, `ABS`, `ABI`, `SS`, `RRT`, `CRH`, `CFL`, `FL`, `CSS`, `EDC`, `HC`, `PRT`, `HD`, `PK` | Idem |
| **Cellule vide** | Pas de travail ce jour | flag `needs_review` si emp dans PDF mais 0 cellule (Erreur P0) |

### H. Lieu de travail (déduit du code horaire + rôle)

| Code | Employé | Pit Boss / Superviseur |
|---|---|---|
| `22/6` | CMC | CMC |
| `19/4` | CMC | **CCDP** (≠ employé !) |
| `19/4'` | CMC | CMC |
| `16/3` | CMC | CMC |
| `12h30/19` ou `12H30/19` | CMC | CMC |
| `15/19` | — | CCDP |
| `19/2` | — | CMC |
| `15/20` (rose) | — | **POKER NO LIMIT (PNL)** |
| `16/20` | — | CMC |
| Suffixe `*` | CCDP+CMC | CCDP+CMC |
| Suffixe `CDP` standalone | CCDP | CCDP |

⚠ **Le même code horaire a un lieu DIFFÉRENT selon le rôle.** Le mapping
`CODE_TO_LIEU` doit être conditionnel sur `emp.family` / `emp.role`. § 7.

### I. Marqueurs visuels (sens distincts à NE PAS confondre)

| Marqueur | Position | Sens | Détection |
|---|---|---|---|
| `★` rouge | **AVANT** le nom (col matricule) | Chef européen OU senior 55+ (Kevin 2026-05-16 : chef européen prioritaire) | Texte brut + Vision IA |
| `*` (astérisque) | **AVANT** le nom | Idem `★` rouge | Texte brut |
| `*` (astérisque) | **APRÈS** un code (`20/5*`) | Lieu CCDP+CMC | Suffixe code |
| Fond **jaune** ligne Pit Boss | Ligne entière | Service PNL ce jour | Vision IA |
| Fond **blanc** ligne Pit Boss | Ligne entière | Pas PNL | Vision IA |
| Fond **bleu** ligne Superviseur | Ligne entière | Faisant fonction Pit Boss | Vision IA |
| Texte **rouge** sur nom | Nom seul | Non reconnu par le PDF (visuel marginal) | Vision IA |
| **Trait noir foncé** entre blocs | Séparateur d'équipes | Délimite équipes du PDF (perdu au copy-paste) | Vision IA |
| Compétence sur fond rose `🌸` | Cellule compétence | Groupe ouvert (post-Convention 2015) | Vision IA + flag manuel |
| Fond **rouge / texte jaune** sur cellule | Cellule horaire avec suffixe `'`/`"` | Jours Convention | Suffixe code + Vision IA |
| Fond **orange** sur cellule | Suffixe `*` | CCDP | Suffixe code + Vision IA |
| Fond **vert** sur cellule | Code `AF` | Formation | Code + Vision IA |
| Fond **rose pastel** sur cellule | Code `22/6` | Standard CMC | Vision IA |
| Fond **jaune pâle** sur cellule | Code `19/4` | Standard CMC | Vision IA |
| Fond **violet** sur cellule | Code `RH` | Repos hebdo | Vision IA |
| Fond **canari** sur cellule | Code `M` | Maladie | Vision IA |
| Fond **bleu tendre** sur cellule | Code `PAT` | Paternité | Vision IA |

### J. Statuts intégraux (encadrés « du X au Y »)

| Encadré PDF | Période | Personnes | Cellules à remplir |
|---|---|---|---|
| `2 CP du au` (Chefs BJ) | 1-31 (mois entier) | MATTONE F, PEREIRA MACENA F | 31 cellules `CP` |
| `10 CP du au` (Roulettes) | 1-31 | SANGIORGIO G, etc. | 31 cellules `CP` |
| `8 CP du au` (Employés CMC) | 1-31 | FAIVRE R, etc. | 31 cellules `CP` |
| `13 FORMATION du au` (Chefs) | 1-31 | FILIPPI F, LAVAGNA J, MOREL F, etc. | 31 cellules `AF` |
| `3 FORMATION du au` (Employés) | 4-8 | MATTERA M, INZIRILLO R, CAPIOMONT K | 5 cellules `AF` (jours 4-8) |
| `7 M du au` (Roulettes) | 1-31 | LORENZI Y, SANNA O, etc. | 31 cellules `M` |
| `1 M du au` (Chefs) | 1-31 | ROBIN M, CAPRA C, LEMONNIER PH | 31 cellules `M` |
| `4 M du au` (Employés) | 1-31 | MIRANDA T, etc. | 31 cellules `M` |
| `EDC du au` | 1-31 | DE RYCKE K, MARTIRE M, ELENA C | 31 cellules `EDC` |

**Priorité quand emp dans 2 encadrés** : CP intégral + AF 4-8 (CAPIOMONT, INZIRILLO, MATTERA) :
- CP par défaut (31 cellules)
- AF surcharge sur jours 4-8 spécifiques

### K. Statuts particuliers (cas connus mai 2026)

| Personne | Statut | Période |
|---|---|---|
| ROSPOCHER G (Pit Boss) | `M` (maladie) | tout le mois 31 cellules |
| PENNACINO JP (Pit Boss) | `CP` partiel | jours 1-20 puis codes normaux 21-31 |

---

## 1. Méta-document (à reconnaître AVANT toute extraction de cellule)

| À reconnaître | Format / signal | Statut sandbox T1 | Lieu code |
|---|---|---|---|
| **Mois + année** | « MAI 2026 », « JUIN 2026 », « Mai 2026 V2 » dans le titre | ✅ `detectMonthYear` | `helpers-reuse.js:120` |
| **Version planning** | « V1 » (par défaut si absent), « V2 », « V3 » | ✅ `detectVersion` | `helpers-reuse.js:94` |
| **Type document** | Cadres (Pit Boss/Supe/Inspecteur) · Chefs BJ · Chefs Roulettes · Employés CMC · Aménagement | ✅ `detectPlanningType` | `helpers-reuse.js:56` |
| **Famille section** | BJ / Roulettes / CMC / Cadres / Aménagement (déduite section PDF) | ⚠ Partiel (détection global doc, pas section ligne par ligne) | `text-parser.js` |
| **Date d'import** | timestamp pour idempotence + audit | ✅ via worker | — |
| **Hash SHA-256 du PDF** | dédupe imports identiques | ✅ `sha256` | `helpers-reuse.js:230` |

**Naming SBM officiel** (confirmé Kevin 2026-05-16) :
- V1 = 1er planning du mois (pas de V dans le nom)
- V2/V3 = mises à jour
- « Mai » seul = planning Pit Boss/Superviseurs (cadres) ; « Mai V2 » = chefs/employés

---

## 1. Identification des personnes (lignes employé)

### 1.1 Noms

| À reconnaître | Format | Sandbox | Lieu |
|---|---|---|---|
| **Nom 2 tokens** : `NOM Initiale(s)` | `BORGIA T`, `DESARZENS K` | ✅ `NAME_RE` | `text-parser.js:36` |
| **Nom 3 tokens** : `NOM1 NOM2 Initiale` | `LANTERI MINET P`, `DELLA PINA L`, `DE RYCKE K`, `LE DUC F` | ✅ `NAME_RE_MULTI` | `text-parser.js:39` |
| **Initiale composée** (jusqu'à 3 lettres) | `BORGIA Fr`, `BERNARDI JE`, `EMMERICH JC`, `DI COLANGELO F` | ✅ `[A-Z]{1,3}` | `text-parser.js:36` |
| **Accents conservés** | `LÉVI L`, `MÜLLER A` | ✅ regex avec É È À Ê Â Ô Û Ä Ë Ï Ö Ü Ç | `text-parser.js:36` |
| **Apostrophes/tirets dans nom** | `O'BRIEN`, `SAINT-POLIT` | ✅ class char `'\-` | `text-parser.js:36` |

### 1.2 Homonymes — JAMAIS confondre (CLAUDE.md erreur #38/#44, NOTES_USER lignes 65-94)

Liste cumulative à ne **JAMAIS** matcher fuzzy sans vérif initiale :

| Surname identique | Initiales différentes | Rôles distincts |
|---|---|---|
| LANDAU | B (chef BJ) vs J (Pit Boss) | Frères |
| ENZA | B (chef BJ) vs C (Pit Boss) | Frères |
| ESPAGNOL | S (chef BJ), P (employé), A (employé) | — |
| CAMPI | H (Pit Boss) vs PH (chef) | Couple Hélène + Philippe |
| BORGIA | T (employé CP) vs L (employé) | — |
| BERNARDI | JE (chef roul.) vs J (employé CMC) vs BERNARD J (autre) | — |
| DESSI | P vs F | — |
| ELIODORI | V vs J | — |
| SEGGIARO | G vs J | — |
| BARILARO | A vs H | — |
| PETIT | T (Thierry) vs J (Johanna) | Couple ou frère/sœur |
| BRASSEUR | F (chef) vs Fr (employé) | — |
| LANTERI | E vs T vs MINET P | — |
| LAVAGNA | J vs Y vs E | — |
| CATALA | P (employé M) vs T (employé CMC) | — |
| ELENA | C (EDC) vs A | — |
| MATTERA | M vs ? | — |

**Règle parser stricte v9.658** : `runAudit` propose « noms similaires » SEULEMENT si
surname EXACTEMENT identique OU similarité ≥ 0.85. **Pas de Levenshtein lax 0.55.**

⚠ Gap sandbox T1 : `EXCLUDE_NAMES` filtre les codes mais **aucun mécanisme actuel pour bloquer le matching cross-initiale**. À renforcer si le vote détecte un homonyme.

### 1.3 Compétences `BRTPECK` (code devant le nom)

| Lettre | Jeu |
|---|---|
| **B** | Black Jack |
| **R** | Roulette américaine |
| **T** | Texas Hold'em |
| **P** | Punto Banco (Baccara) |
| **E** | Roulette Européenne (école premium SBM Art. 4) |
| **C** | Craps |
| **K** | BJ Super / Poker Cash Game (`+K` = pratique avancée post-promotion) |

**Conventions** :
- `+E` = compétence ajoutée formellement (formation suivie ET validée)
- `.` à la fin = chef de table (`BRTCP+E.`)
- `.` au début = employé cartes CMC (`.BRTCP+KE`)
- 7 compétences = Expert (Convention Art. 11)

✅ `parseBrtpeck` implémenté `helpers-reuse.js:198`.
⚠ Gap T1 : `text-parser.js` ne capture pas le code BRTPECK lors de l'extraction (juste nom+codes), à enrichir.

### 1.4 Marqueurs visuels noms

| Visuel | Position | Sens | Sandbox |
|---|---|---|---|
| `★` ou `*` rouge | AVANT le nom (col matricule) | **Chef européen** (compétence E premium) — Kevin 2026-05-16 | ⚠ Détecte présence mais pas position |
| `★` rouge | AVANT nom Pit Boss | **Senior 55+** (rotation 40 min) | ⚠ Idem |
| Fond **jaune** ligne | Pit Boss / Superviseur | **Poker No Limit (PNL)** ce jour | ❌ Vision IA requise (couleur) |
| Fond **bleu** ligne | Superviseur | **Faisant fonction Pit Boss** (BOUVIER JF avr 2026) | ❌ Vision IA requise |
| Nom en **rouge** | — | Nom non reconnu par le PDF (visuel marginal) | ❌ Vision IA requise |

⚠ Le `*` a **3 sens distincts** selon position :
1. **AVANT le nom** = chef européen / senior
2. **APRÈS un code** (`20/5*`) = lieu CCDP+CMC
3. **`★`** rouge dédié = senior

### 1.5 Numéro équipe explicite (format V1 juin 2026+)

Format : `BRTP+K 5 NAME` → entre POST et NOM, le `5` = numéro d'équipe.

⚠ Gap T1 : non implémenté dans `text-parser.js`. Quand présent, doit être prioritaire sur la détection par pattern RH (`_cmcDetectTeamsByRestPattern`).

---

## 2. Codes horaires (cellules jour)

### 2.1 Format de base

| Format | Exemples | Sandbox | Notes |
|---|---|---|---|
| `XX/Y` | `22/6`, `19/4`, `16/3`, `14/19`, `20/5`, `16/22` | ✅ `CODE_RE` | Standard CMC |
| `XX/YZ` | `16/20`, `15/19`, `19/2`, `15/20` | ✅ | |
| `XXhYY/Z` | `12h30/19`, `12H30/19` | ⚠ Regex accepte `h?` minuscule mais **pas H majuscule** | NOTES_USER ligne 1214 |

### 2.2 Suffixes (sens **distincts**, à préserver caractère par caractère)

| Suffixe | Position | Sens | Couleur fond PDF |
|---|---|---|---|
| `c` | minuscule fin | **Chef** (`22/6c` = chef sur cycle 22/6) | Blanc / défaut |
| `*` | fin | **CCDP + CMC** (lieu : Café de Paris + Casino + CMC) | Orange |
| `'` (apostrophe simple) | fin | **Convention** (jours ajoutés par direction) | **Rouge fond / Jaune texte** |
| `"` (guillemet double) | fin | Variante Convention | Rouge / jaune |
| `"'` (combo) | fin | Variante Convention mix (`19/4"'`) | Rouge / jaune |
| `:` | fin | Variante préservée tel quel (`19/4:`) | — |
| `CDP` (suffixe mot) | fin | Standalone CCDP | Orange |

✅ `SUFFIX_MEANING` dans `helpers-reuse.js:15`.
✅ `_cmcEnsureQuoteVariant()` clone l'entrée `CODES` de base dans la variante.
✅ `_cmcIsConv(code)` (`/['"]$/`) couvre `'` ET `"`.
⚠ Gap T1 : `text-parser.js` `CODE_RE` accepte `[c'"\*\:CDP]*` mais le **suffixe `CDP` complet** est exclu (regex char class ne matche que des lettres séparées).

### 2.3 Codes spéciaux Pit Boss / Superviseur

| Code | Sens |
|---|---|
| `PK` | Poker Cash Game (rotation Pit Boss au PK) — mai 2026 |
| `HD` | Hors Département / Jour férié spécial (fond rouge vif) |
| `12h30/19` | 12h30→19h (CMC) |
| `19/4` (chez Pit Boss) | **CCDP** (≠ employé où c'est CMC) ⚠ même code, lieu différent selon rôle |
| `19/4'` (apostrophe) | CMC (chez Pit Boss) |
| `15/20` (rose) | Poker No Limit |
| `16/20`, `22/6`, `19/2`, `15/19`, `12H30/19` | CMC |

⚠ Gap T1 : le mapping code→lieu n'est **pas implémenté** côté text-parser. Le helper `LIEUX_SBM` liste juste les lieux. À enrichir par un mapping `CODE_TO_LIEU` par rôle.

### 2.4 Codes statut (43 codes officiels Note SBM 6 janv 1993, Bernard Lées)

**Source de vérité absolue** : index.html ligne 2084 (`BULLETIN_CODES`)
+ Convention Collective 1er avril 2015. Tous ces codes peuvent apparaître
dans une cellule jour OU dans un encadré « du au ».

#### Présence / Repos (7 codes)

| Code | Sens | Couleur fond NOTES_USER |
|---|---|---|
| `P`   | Jour de Présence | — |
| `RH`  | Repos Hebdomadaire | Violet lavande `#c8a8e0` |
| `R`   | Repos simple | Gris clair `#e8e8e8` |
| `RTP` | Repos Travaillé à Payer | — |
| `RTR` | Repos Travaillé à Récupérer (+ compteur) | — |
| `RRT` | Récupération Repos Travaillé (- compteur) | Jaune orange `#ffd850` |
| `RHS` | Récupération Heures Supplémentaires | — |
| `DP`  | Jour de Disposition | — |

#### Congés (6 codes)

| Code | Sens |
|---|---|
| `CP`  | Jour ouvrable de Congé Payé (rose saumon `#f8c0d0`) |
| `CRH` | Repos Hebdo inclus dans Congé |
| `CPS` | Congé Payé Samedi (5e pour 5 sem) |
| `CPM` | 1er jour Période Congé — droit fractionnement |
| `CDP` | Jour Congé Déjà Payé |
| `CDH` | Repos Hebdo inclus dans Congés Déjà Payés |

#### Fêtes légales (5 codes — Art. 17.3 Convention)

| Code | Sens |
|---|---|
| `FL`  | Fête Légale chômée et payée |
| `CFL` | Fête Légale incluse dans Congé Payé |
| `FTP` | Fête Légale Travaillée à Payer |
| `FTR` | Fête Légale Travaillée à Récupérer (+ compteur) |
| `RFT` | Récupération Fête Travaillée (- compteur) |

Jours fériés Monaco : 1er janvier, Sainte-Dévote (27 janv), Lundi de Pâques,
1er mai (prime 150€ / 280€ groupe fermé), Ascension, Lundi de Pentecôte,
Fête-Dieu, Assomption (15 août), Toussaint, Fête Nationale (19 nov),
Immaculée Conception (8 déc), Noël.

#### À la masse (4 codes — variantes employés à la masse)

| Code | Sens |
|---|---|
| `FCP` | Idem CP pour employé à la masse |
| `FCS` | Idem CPS pour employé à la masse |
| `FRH` | Idem CRH pour employé à la masse |
| `FFL` | Idem CFL pour employé à la masse |

#### Absences (12 codes)

| Code | Sens | Couleur |
|---|---|---|
| `M`   | Absence Maladie (indemnisée ou non) | Jaune canari `#ffe840` |
| `MAL` | Maladie longue durée | — |
| `AT`  | Accident du Travail ou Trajet | — |
| `MT`  | Congé Maternité | — |
| `ABS` | Absence tolérée non payée | — |
| `ABI` | Absence Injustifiée (sanction possible) | — |
| `ABP` | Absence autorisée exceptionnellement payée | — |
| `AF`  | Absence Rémunérée Formation (= Présence) | **Vert** `#a8e0a8` |
| `CL`  | **Congé Légal événement familial** (Art. 18 Convention) | — |
| `CEO` | Congé d'Éducation Ouvrière | — |
| `CSC` | Congé Supplémentaire Cadre | — |
| `CSS` | Congé Sans Solde | — |

⚠ **`CL`** = code officiel pour congés familiaux Art. 18 (mariage 4j,
naissance 3j, décès proche 3j, etc.). Distinct de `CSS` (sans solde) et
`ABS` (toléré non payé).

#### Sanctions (4 codes — peuvent apparaître si l'admin les ajoute)

| Code | Sens |
|---|---|
| `PNE` | Préavis non Exécuté |
| `AMP` | Mise à Pied non rémunérée |
| `MPC` | Mise à Pied Conservatoire (attente décision) |
| `MPP` | Mise à Pied Payée |

#### Autres (4 codes)

| Code | Sens | Couleur |
|---|---|---|
| `PAT` | Paternité (v9.118 — pas Patrimonial !) | Bleu tendre `#b8e0f0` |
| `PRT` | Prêt (mis à disposition autre service) | Jaune orange `#ffd060` |
| `HC`  | Heures Complémentaires | Vert-jaune `#d8e8a8` |
| `EDC` | En Détachement Cadre (statut spécial SBM) | — |

#### Pit Boss spécifiques (2 codes)

| Code | Sens |
|---|---|
| `HD`  | Hors Département / Jour férié spécial | Fond rouge vif |
| `PK`  | Poker Cash Game / Rotation Pit Boss au PK | Fond rose |

✅ Tous ces codes (43) sont implémentés dans `helpers-reuse.js`
`BULLETIN_CODES_FULL` et acceptés par `text-parser.js` `CODE_RE` v0.3.0+.

✅ `STATUT_CODES`/`STATUT_LABEL` dans `helpers-reuse.js:146`.
✅ `CODE_RE` text-parser couvre tous ces codes (vérifier `MT`).
⚠ Gap T1 : le mapping code→couleur (`bg`/`fg`) n'est pas posé sur les cellules statut, juste sur les codes horaires Convention/CCDP.

### 2.5 Apostrophes courbes → droites (normalisation pré-parse)

Apostrophes Unicode `‘ ’ ʼ` → `'` droite ; `“ ” → "` droite.

✅ `normalizeQuotes` `helpers-reuse.js:25`. Doit être appelé **AVANT** toute analyse de code (sinon `22/6'` U+2019 ≠ `22/6'` ASCII).

---

## 3. Encadrés « du X au Y » (statuts intégrales)

Section bas/haut-droite du PDF avec absences/formations longue durée.

### 3.1 Format

`N STATUT du J1 au J2` où N = nombre de personnes, STATUT = code, J1-J2 = période.

Exemples Kevin (mai V2 confirmé) :
- `13 FORMATION du au` (Chefs BJ détachés formation tout le mois)
- `3 FORMATION du au` (Employés CMC courte période 4-8 mai)
- `2 CP du au` (Chefs BJ CP intégral)
- `10 CP du au` (Roulettes / européens)
- `8 CP du au` (Employés CMC)
- `7 M du au` (Roulettes maladie longue)
- `1 M du au` (Chefs BJ)
- `4 M du au` (Employés CMC/aménagement)
- `EDC du au` (En Détachement Cadre)

### 3.2 Codes attendus dans encadrés

`CP`, `AF`/FORMATION, `M`, `MAL`, `MT`, `PAT`, `EDC`, `SS`, `ABI`, `AT`, `CFL`, `CRH`, `ABS`.

⚠ **JAMAIS** chercher mots français longs (FORMATION/MALADIE) — leçon CLAUDE.md erreur #49. Toujours détecter via codes courts officiels + période `(?:DU\s+)?(\d{1,2})\s+(?:AU\s+)?(\d{1,2})`.

### 3.3 Périodes partielles

Le parser doit accepter TOUTES les périodes :
- `1 31` (mois entier)
- `1 15` (1ère quinzaine — ex DESSI P)
- `16 31` (2ème quinzaine — ex BAILET JF)
- `1 30` (juin/avril/sept/nov)
- `4 8` (sous-période courte — FORMATION typique)
- Tout `fromDay toDay` avec `1≤fromDay≤toDay≤days`

### 3.4 Priorité encadrés vs grille

**Règle Kevin** : pour un emp en CP intégral + FORMATION 4-8 (cas CAPIOMONT, INZIRILLO, MATTERA) :
- CP par défaut sur tout le mois (encadré)
- AF surcharge sur dates spécifiques 4-8 (autre encadré)
- Le parser doit gérer la priorité (CP fond, AF surcharge dates précises)

⚠ Gap T1 sandbox : **les encadrés ne sont pas parsés** par `text-parser.js`. À ajouter (passe dédiée après extraction grille).

---

## 4. Équipes & miroirs

### 4.1 Détection équipes par pattern RH (V1 sans marqueur explicite)

**Algorithme officiel SBM** (NOTES_USER ligne 8-40 + correction Kevin 2026-05-28) :

**Sources de délimitation par priorité décroissante** :
1. **Gros trait noir foncé** entre blocs équipes — visible PDF, **PERDU au copy-paste**
   (donc détectable uniquement par Vision IA passes B-E qui voient le rendu graphique)
2. **Numéro équipe explicite** entre POST et NOM (V1 juin 2026+ format `BRTP+K 5 NAME`)
3. **Pattern RH/R identique** + horaire base identique = **MÊME équipe**
4. **Colonne PDF** (algo `_cmcDetectTeamsByPdfColumn` v9.719) — fallback

**Règle miroir (CORRIGÉE Kevin 2026-05-28)** :
- 2 équipes sont **miroir l'une de l'autre** quand elles ont :
  - **MÊMES jours RH/R** (identiques, pas décalés)
  - **HORAIRES DE BASE DIFFÉRENTS** (sinon ce serait la même équipe)
  - **Position différente dans le PDF** (principale en haut, miroir plus bas)
- L'idée métier : 2 groupes qui se reposent les mêmes jours mais
  travaillent à des horaires différents (matinée vs soirée) pour
  couvrir les amplitudes d'ouverture du casino.
- **Secteur cartes** (BJ / CMC / Roulettes — confirmé Kevin 2026-05-28) :
  équipe `20/5` ⇆ miroir `22/6` (ou inverse). Cycle suivant inverse les
  attributions. Le 1er jour de travail : un en 22h, l'autre en 20h.
- Exemple vérité terrain juin V1 (NOTES_USER 134+) :
  - Équipe principale : BARONE E et al., horaire `20/5`
  - Équipe miroir : BONO V et al., horaire `22/6'` — MÊMES RH/R que principale
- Cadres (Pit Boss / Sup) : **pas d'équipe ni miroir** — rotation
  individuelle (offset 1-14).

**Effectifs typiques** : 4-6 emps par équipe (header PDF indique le compte
« 4 RH du au »). Famille (BJ/Roul/CMC) déduite de la section PDF où
apparaît le bloc.

✅ Implémenté dans `lib/team-detector.js` v0.2.0 : clustering par (`rhDays`,
`firstWorkCodeNorm`), détection miroir via `isMirrorPair(A,B)` (rhEqual + base ≠).

### 4.2 Détection équipes par colonne PDF (v9.719+, recommandée)

**Algorithme préféré** (`_cmcDetectTeamsByPdfColumn` v9.719) :
- Parse les entêtes de rotation (`<count> <code> du au` répétés = N colonnes)
- Remplit chaque colonne verticalement
- **Chaque COLONNE PDF = une équipe distincte** (pas chaque LIGNE)
- Hybride avec pattern RH en fallback

⚠ Gap T1 : ni l'un ni l'autre algorithme implémenté dans `text-parser.js`. À ajouter après la passe extraction de cellules.

### 4.3 Numéro équipe explicite (V1 juin 2026+)

Format : `BRTP+K 5 NAME` où `5` = numéro équipe entre POST et NOM. Prioritaire sur les algos de détection.

### 4.4 Effectifs par famille (vérité terrain)

| Famille | Emps/équipe (typique) |
|---|---|
| Chefs BJ | 2-3 emps/équipe (effectifs petits) |
| Roulettes | 5-6 emps/équipe |
| Cadres (Pit Boss/Sup) | **pas d'équipes** — assignation individuelle offset rotation 1-14 |

### 4.5 Pas d'équipes pour les cadres

**Règle Kevin 2026-05-16** : ne PAS chercher équipes Pit Boss via pattern RH. Les Pit Boss/Superviseurs sont individuellement assignés, jamais regroupés en équipes structurées (A/B/C + miroirs).

⚠ `_cmcDetectTeamsByRestPattern` doit skipper `family==="cadres"`.

### 4.6 Section « Horaires aménagés »

**v9.730** : section dédiée pour les 2 emps (BLANZIERI K, ACCOMASSO F en mai 2026). Famille `amenage`, regroupés dans UNE équipe « 🕐 Horaires aménagés » (pas fragmenté par colonne).

✅ Détecté dans `detectPlanningType` `helpers-reuse.js:73`.

---

## 5. Familles & sections

### 5.1 Familles officielles

| Famille | Signaux PDF | Code interne |
|---|---|---|
| **Chefs BJ** | « Chef BJ », « BLACKJACK », « BJ Éq.N » | `bj` |
| **Chefs Roulettes** | « ROUL. Éq.N », « ROULETTES » | `roulettes` |
| **Employés CMC** | « CMC Éq.N », « CARTES CMC » | `cmc` |
| **Cadres** | « Pit Boss 15 », « SUPERVISEUR », « INSPECTEUR » | `cadres` |
| **Aménagement** | « AMENAGEMENT », « Horaires aménagés » | `amenage` |
| **Baccara** (groupe fermé) | `P`/`P+` sans `E` ET ancien | `baccara` |
| **Groupe Ouvert** | `P`/`P+` post-Convention 2015 + flag pink | `cmc` (groupe ouvert) |

### 5.2 Règle « tous changent chaque mois »

**Kevin 2026-05-16** :
- ❌ Nombre d'équipes variable (5 un mois, 6 le suivant)
- ❌ Nombre d'emps/équipe variable
- ❌ Pas d'historique : chaque import RÉÉCRIT `emp.teamHistory[key]`
- ❌ `emp.team` DEF_EMP = valeur initiale, JAMAIS courante
- ❌ `autoFillMissingCadres()` historique = **INTERDIT** (Erreur #48 désactivé v9.604)

### 5.3 Tranchage famille fiable

**v9.713** : `_famFromCells` classait tout code « plain » en roulettes. Fix :
- `bj`/`cmc` : signaux **fiables** (suffixes `c` chef BJ, `"` Convention CMC)
- `roulettes`/plain : déférer à la section PDF (`familyHistory[key]`)

### 5.4 Détection chef BJ vs employé

**Kevin 2026-05-19** : LARINI H ≠ SOLIMEIS F même section. Chaque COLONNE du PDF = équipe distincte (pas chaque ligne).

✅ Algo `_cmcDetectTeamsByPdfColumn` v9.719.

---

## 6. Cadres (Pit Boss / Superviseur / Inspecteur)

### 6.1 Structure PDF

| Col | Contenu | Prendre en compte ? |
|---|---|---|
| 1 | `62224/620` = 2 téléphones internes | **NON — IGNORER** |
| 2 | Nom cadre | OUI |
| 3 | `*` optionnel OU nombre priorité | Skip (metadata) |
| 4 | Nombre durée | Skip (metadata) |
| 5+ | Codes horaires/jour avec apostrophes/quotes | OUI |

### 6.2 Headers sections

- `Pit Boss 15` puis noms (pluriel implicite)
- `SUPERVISEUR` (singulier)
- `INSPECTEUR` (en transition — tous promus Pit Boss en mai 2026)

### 6.3 Codes fréquents cadres

`22/6'`, `22/6"`, `22/6"'`, `19/2"`, `12h30/19'`. Strip apostrophes droites/courbes avant lookup CODES.

### 6.4 Pas d'équipe assignée

Contrairement BJ/roulettes/CMC : pas d'assignation numérique, juste nom + horaires. `emp.team` peut rester `"pit15"` ou `"sup"`.

### 6.5 Faisant fonction (fond bleu)

- Superviseur faisant le job de pit boss sans titre officiel
- BOUVIER JF (avril 2026 : faisant fonction)
- Les 5 superviseurs (ETTORI M, FOUQUE V, PLACENTI L, DOGLIOLO Y, MUS L) — fond bleu ou texte rouge

⚠ Le fond bleu/rouge est juste visuel. Le parser texte lit la ligne tel quel. Vision IA peut détecter la couleur si dispo.

### 6.6 Statuts Pit Boss mai 2026 (vérité terrain confirmée Kevin 2026-05-16)

**16 Pit Boss** : JANEL JM, GARELLI C, PETIT J, HERVÉ A, LANDAU J, PELAZZA F, CORNUTELLO A, DI COLANGELO F, CAMPI H, EMMERICH JC, LONG JP, ENZA C, JONIAUX S, BOUVIER JF, ROSPOCHER G, PENNACINO JP.

**5 Superviseurs** : ETTORI M, FOUQUE V, PLACENTI L, DOGLIOLO Y, MUS L.

**Statuts intégraux** :
- 🤒 ROSPOCHER G = M tout le mois
- 🏖️ PENNACINO JP = CP partiel (jours 1-20)

---

## 7. Lieux SBM

| Code lieu | Sens |
|---|---|
| `CMC` | Casino de Monte-Carlo (référence) |
| `CDP` / `CCDP` | Casino Café de Paris (= **C**asino + **C**afé + **D**e + **P**aris). « CCDP » = même chose |
| `SUN` | Sun Casino |
| `MCB` | Monte-Carlo Bay Casino |
| `PNL` / `POKER NO LIMIT` | Salle Poker No Limit |

✅ `LIEUX_SBM`/`isLieuSBM` `helpers-reuse.js:168`.

**⚠ Règle critique** : le **même code horaire** a un **lieu différent selon le rôle**.
Exemple : `19/4` chez Pit Boss = **CCDP**, chez employé = **CMC**.
Le mapping CODE→LIEU doit être conditionnel sur `emp.family`.

⚠ Gap T1 : aucun mapping `CODE_TO_LIEU` n'est implémenté.

---

## 8. Couleurs visuelles (Vision IA uniquement)

### 8.1 Horaires CMC standard (fonds pastel clairs)

| Code | Fond | Texte |
|---|---|---|
| `22/6` | Rose pastel `#fccfe0` | `#a82858` |
| `19/4` | Jaune pâle `#fff4a0` | `#6a5410` |
| `16/3` | Orange pêche `#ffc890` ou `#ffb070` saturé | `#8a4a10` |
| `14/19` | Vert tendre `#c4e8a8` | `#3a6a18` |
| `20/5` | Bleu clair `#b8d4f0` | `#1a5090` |
| `16/22` | Lavande `#d4c4ec` | `#5838a0` |

### 8.2 Suffixes (sens couleur)

| Suffixe | Fond PDF | Texte PDF | Sens |
|---|---|---|---|
| `c` | Blanc (default) | Noir | CMC chef |
| `*` | Orange (`#ffe4d0`/`#ffb480`) | Rouge (`#804418`/`#a84018`) | CCDP+CMC |
| `'` ou `"` ou `"'` | **Rouge** (`#d8342e`) | **Jaune** (`#ffe23a`) | Convention |
| `:` | — | — | Variante neutre |

### 8.3 Statuts

| Code | Fond |
|---|---|
| `RH` | Violet `#c8a8e0` |
| `R` | Gris `#e8e8e8` |
| `CP` | Rose saumon `#f8c0d0` |
| `AF` | **Vert** `#a8e0a8` |
| `M` | Jaune canari `#ffe840` |
| `PAT` | Bleu tendre `#b8e0f0` |
| `RRT` | Jaune orange `#ffd850` |
| `HC` | Vert-jaune `#d8e8a8` |
| `PRT` | Jaune orange `#ffd060` |

### 8.4 Noms (sidebar)

- Chefs BJ : fond jaune canari
- Employés CMC : vert clair ou bleu clair léger
- `★` rouge : senior 55+ / chef européen

### 8.5 Ligne Pit Boss

- Fond **jaune** = service PNL ce jour
- Fond **blanc** = pas PNL
- Fond **bleu** = faisant fonction
- Nom en rouge = non reconnu

---

## 9. Règles métier d'écriture (post-parsing)

### 9.1 INTERDITS absolus

- ❌ Inventer un code non vu dans le PDF
- ❌ Auto-fill historique mois N-1 sans flag explicite et confirmation
- ❌ Fuzzy match aveugle (Erreur #24, #50)
- ❌ Substituer un code via `CDP_MAP` sans code source observé
- ❌ Strip suffixes `'`/`"`/`*`/`:` (Erreur #63)
- ❌ Écraser cellule déjà parsée par consensus (Erreur #62 — passe consensus = fill-empty-only)
- ❌ Auto-upgrade CDP `*` selon profil (Erreur #63)
- ❌ Modifier `emp.team` DEF_EMP depuis import (Erreur #50)
- ❌ Mots français longs dans regex statut (Erreur #49)

### 9.2 OBLIGATOIRE

- ✅ Snapshot pré-import (rollback possible)
- ✅ Audit log immutable (`_audit("import_lossless_check", ...)`)
- ✅ Validation `_cmcValidateAgainstSource` cellule par cellule (v9.596)
- ✅ Sentinelle `import-fidelity` audit post-import (v9.607)
- ✅ Si écart > 5% texte source vs cellules écrites → **ERREUR P0** banner rouge
- ✅ Chaque nom du PDF DOIT avoir ≥ 1 cellule remplie (règle absolue Kevin 2026-05-26)

### 9.3 Validation post-import (règle absolue Kevin 2026-05-26)

`_postValidateImport` doit :
1. Scanner le texte source du PDF
2. Extraire tous les noms via regex `[A-Z]{2,}\s+[A-Z]{1,3}\s+\d+\s+\d+`
3. Vérifier que chaque nom matching dans DB a `Object.keys(A.overrides[key][emp.id]||{}).length > 0`
4. Si un nom est dans le PDF mais 0 cellule → ERREUR P0 + banner rouge + escalade Apex

### 9.4 Test régression `test:everyone-has-planning`

À créer (ou vérifier existant) : pour chaque fixture PDF, extraire tous les noms et vérifier chaque emp matching dans DB a ≥ 1 cellule. Câblé dans `test:ci`.

---

## 10. Pipeline T1 — État actuel sandbox vs cible

### 10.1 6 passes parallèles (vote unanime)

| Passe | Outil | Statut | Hors-ligne ? |
|---|---|---|---|
| A | PDF.js (texte natif extraction) | ✅ v0.6.1 | ✅ |
| B | Claude Sonnet 4.6 Vision | ✅ via proxy | ❌ |
| C | GPT-4o Vision | ✅ via proxy | ❌ |
| D | Mistral Pixtral | ✅ via proxy (refactor v0.5.0 chat completions image_url) | ❌ |
| E | Gemini 2.5 Pro Vision | ✅ via proxy | ❌ |
| F | Tesseract.js | 🚧 stub — non implémentée | ✅ (futur) |
| G | Parser texte natif (depuis sortie A) | ✅ v0.6.0 | ✅ |

✅ Vote unanime cellule par cellule : `lib/cell-voting.js` `voteCells()` appelé par `parser-multi-ocr.js:459` après les passes Vision.

### 10.2 Gaps identifiés (priorisés)

**Priorité 1 — Reconnaissance manquante** :
1. Mapping `CODE_TO_LIEU` par rôle (`19/4` employé = CMC, Pit Boss = CCDP)
2. Parsing des encadrés « du au » (statuts intégraux CP/M/AF)
3. Détection équipes par pattern RH ou colonne PDF dans le sandbox
4. Capture du code BRTPECK (compétences) lors de l'extraction de ligne
5. Détection numéro équipe explicite V1 juin format `BRTP+K 5 NAME`

**Priorité 2 — Robustesse regex** :
6. `CODE_RE` text-parser accepte `H` majuscule pour `12H30/19`
7. Suffixe `CDP` mot complet (pas char class) dans regex code
8. Vérifier `MT` (maternité) dans CODE_RE

**Priorité 3 — Validation** :
9. ✅ **FAIT v0.8.0** — `validateEveryoneHasPlanning` (chaque nom PDF → ≥1 cellule)
10. ✅ **FAIT v0.8.0** — `lib/code-colors.js` mapping 43 codes → `{bg, fg, label}` (Phase 3.M)
11. ✅ **FAIT v0.8.0** — `lib/homonyms-guard.js` bloque fuzzy match cross-initiale (Phase 3.K)

**Priorité 4 — Vote unanime** :
12. ✅ **FAIT v0.8.0** — comparateur visuel cellule par cellule (`renderEmployeeGrid` dans index.html : tableau emp×jour coloré + tooltip code/lieu/libellé)
13. Export JSON (bouton « 💾 Exporter JSON » existant — export `results/<ts>.json` automatique reste à câbler après validation Kevin)

---

## 11. Tests régression actuels (12/12 ✅)

`tools/planning-parser-tester/test-pipeline.js` couvre :
1. Syntax JS de tous les modules
2. Helpers exportés (ensurePdfJsReady, getProxyConfig, voteCells, cloneBytes)
3. Phase A clone le buffer AVANT pdf.js (bug #12)
4. 4 passes Vision avec cloneBytes (bugs #C/D/E)
5. Mistral utilise Pixtral chat completions (v0.5.0)
6. Claude alias stable `claude-sonnet-4-6` + cascade fallback (bug #9)
7. Versions PIPE et VP cohérentes (bug #13)
8. `_autoLoaded.worker_url` cohérent (bug #7)
9. Pas de TypeScript dans .js (bug #11)
10. Worker `/test/*` exempté de l'auth (bug #8)
11. Workflow Node 22 (bug #2)
12. Secrets noms conformes CLAUDE.md règle 7

**Tests à ajouter (gap)** :
- `npm run test:fidelity` équivalent dans sandbox (reproduction PDF identique sur fixture)
- Cell-voting : vote unanime 4/4 → CERTAIN, vote 3/4 → needs_review
- Text-parser : `12H30/19` capturé, suffixes préservés, multi-token names
- Homonymes : LANDAU B ≠ LANDAU J ne mergent jamais
- Encadrés statut : `2 CP du 1 au 31` → 31 cellules CP

---

## 13. Convention Collective SBM (articles applicables aux imports)

Source : index.html ligne 1881 (`CONVENTION`) — 38 articles structurés.
Liste des articles qui **impactent directement** la lecture/validation
des plannings :

### 13.1 Articles clés (Art. + impact import)

| Article | Sujet | Impact pour le parser/validation |
|---|---|---|
| **Art. 4** | Recrutement — âge min 21 ans | Aucun nouveau ne doit avoir <21 ans (validation RH) |
| **Art. 6** | Contrat — 12 mois initial + 3 mois essai | Nouveau dans planning depuis ≤3 mois = essai |
| **Art. 10** | Carrière — niveaux 1-7 selon jeux validés | Niveau déductible depuis compétences BRTPECK : 1 lettre=niv1, …, 7 lettres=Expert |
| **Art. 11** | Promotions Expert→Chef→Inspecteur→Sous-dir→Directeur | Détectable via `.` final code poste (chef), section PDF (cadre) |
| **Art. 13** | Rémunération employés (fixe +200€/niveau + %CA + %cagn) | Non visible dans planning |
| **Art. 17.4** | Congés 2 mois/an (1 mai-31 oct + hiver, 4 sem min consécutives) | **Encadré CP intégral mois entier** = bloc Art. 17.4 |
| **Art. 17.5** | Repos hebdo : min 1j, normalement 2j consécutifs, **min 10j/6 sem** | **Validation post-import** : ratio repos/6 sem ≥ 10 |
| **Art. 17.5 (2e jour supprimable)** | 4 premiers récupérés sans majoration, +50% au-delà | RTR (récup) + RH (planifié) à distinguer |
| **Art. 17.6** | **Forte affluence** : juillet-août, 16 déc-15 janv, Grand Prix, Pâques. Planning publié vendredi <12h, 4 sem à venir | Plus de V2/V3 ; validations RH plus permissives |
| **Art. 17.7** | Heures supplémentaires employés + inspecteurs | `HC` (heures comp.), `RHS` (récup HS) |
| **Art. 17.8** | **55+ et femmes enceintes** : pause toutes les 40 min (au lieu 60) | Marqueur ★ rouge (senior 55+) — femmes enceintes : donnée RH externe |
| **Art. 18** | **Congés familiaux** uniformisés 2019, étendus 2021 pacs | Code `CL` : mariage 4j · naissance 3j · décès proche 3j · mariage enfant 2j · décès beau-parent 1j · décès oncle/tante 1j |
| **Art. 19** | Congés sans solde (>1 sem) | Code `CSS` |
| **Art. 20** | Temps partiel max 1 an renouvelable | Validation : ratio jours travaillés/mois |
| **Art. 21** | Maladie — certificat dès 1er jour, ≥21j = avis médecine du travail | Bloc `M` ou `MAL` ≥21j → traité comme MAL |
| **Art. 23** | Indemnisation maladie 85% (min 91%), max 1095 jours | Code `M` peut être indemnisé ou non |
| **Art. 25** | Discipline — sanctions 1er/2e niveau | Codes `PNE`, `AMP`, `MPC`, `MPP` |
| **Art. 26** | Retraite (10ans=½ · 15ans=1 · 20ans=1,5 · 30ans=2 mois) | Pas d'impact direct |
| **Art. 35** | **Effectifs — Chefs = 25-30%** de l'effectif employés. Groupe fermé : 33,5% transitoire (10 ans). Plancher absolu 336 (cadres+emps) | **Validation post-import** : ratio chefs/employés dans la fourchette |

### 13.2 Calendrier d'affluence (Art. 17.6 + impact import)

Source : index.html ligne 2147 (`CALENDRIER_AFFLUENCE`). Périodes où
le casino tourne à plein régime et le planning peut être ajusté plusieurs
fois (V2, V3) :

| Période | Intensité | Impact |
|---|---|---|
| 1er-15 janvier (Réveillon + 1ère quinzaine) | high | Plus de V2 |
| 27 janvier (Sainte-Dévote Monaco) | medium | — |
| **22-26 mai (Grand Prix F1)** | **peak** | V2/V3 fréquents, planning publié vendredi <12h |
| 20-25 juin (Monte-Carlo TV Festival) | high | — |
| **Juillet-août** | **peak** | Effectifs tendus, moins de RH possibles |
| 15 août (Assomption + feux) | high | FL ou FTP |
| 19 nov (Fête Nationale Monaco) | high | FL ou FTP |
| **16 décembre - 31 décembre** | **peak** | Vacances Noël + Réveillon |
| **Pâques (mobile)** | high | Week-end pascal — calculé via algo Gauss année courante |

**Conséquences pour le parser** :
- En période peak : autoriser plus de versions (V3, V4) sans alerter
- Validation Art. 17.5 (min 10j RH/6 sem) plus permissive
- Plus de codes `FTP`/`FTR` (fêtes travaillées) dans les cellules
- Le « 2e jour de repos supprimable » devient fréquent → `RTR` qui s'accumule

### 13.3 Règles de validation post-import (à ajouter dans le pipeline)

Checks Art. 17.5 + Art. 35 à appliquer après extraction :

1. **`validateMinRestPerSixWeeks`** : pour chaque emp, vérifier qu'il a
   au moins **10 jours RH/R sur toute fenêtre glissante de 6 semaines**
   (42 jours). Si <10 → flag warning « violation Art. 17.5 ».
2. **`validateChefRatio`** : ratio (effectif `chef=true`) / (effectif total
   non-cadre) ∈ [25%, 30%] (Art. 35). Hors fourchette → flag info.
3. **`validateMin336Effectif`** : effectif total cadres+employés ≥ 336
   (plancher absolu Art. 35). En-dessous → flag warning.
4. **`validateSeniorMarker`** : tout emp marqué `★`/`*` rouge avant le nom
   doit avoir `senior=true` (pause 40 min) OU `chef_european=true`.
5. **`validate2ndDayRestSupressionCount`** : compter les semaines où le
   2e jour de repos est supprimé → 4 premières récupérées sans majoration,
   au-delà = +50% (info statistique).
6. **`validateNoForbiddenCodes`** : sanctions (`PNE`, `AMP`, `MPC`, `MPP`)
   présentes → flag CRITICAL (vérifier avec RH avant de garder).
7. **`validateAffluencePeriodVersion`** : si import = période peak ET
   numéro version ≥ V3 → log info « cohérent ». Si import = période calme
   ET V3+ → flag warning « pourquoi 3 versions ? ».

✅ **Implémenté v0.8.0** dans `lib/validate-post-import.js` (Phase 3.L) :
`validateMinRestPerSixWeeks` (Art. 17.5), `validateChefRatio` (Art. 35),
`validateMin336Effectif`, `validateSeniorMarker`, `validateNoForbiddenCodes`
(sanctions CRITICAL), `validateEveryoneHasPlanning` (règle absolue Kevin
2026-05-26), `validateAffluencePeriodVersion` (Art. 17.6). `runAll()` exécute
les 7 checks et retourne findings priorisés par severity.

### 13.4 Niveaux carrière déductibles depuis compétences BRTPECK (Art. 10)

| Nombre de lettres BRTPECK | Niveau | Salaire mensuel | Convention |
|---|---|---|---|
| 1 lettre (B ou R ou T ou P ou E ou C ou K) | **Niveau 1** | 2 300 € | Art. 10/13 |
| 2 lettres | Niveau 2 | 2 765 € | Idem |
| 3 lettres | Niveau 3 | 3 127 € | Idem |
| 4 lettres | Niveau 4 | 4 000 € | Idem |
| 5 lettres | Niveau 5 | 4 700 € | Idem |
| 6 lettres | Niveau 6 | 5 413 € | Idem |
| **7 lettres (BRTPECK complet)** | **Niveau 7 — Expert Jeux Premium** | 6 113 € | Art. 10 (Expert) |
| 7 lettres + `.` final | **Niveau 11/1 — Chef de table** | 7 000 € | Art. 11 |
| 7 lettres + 5 ans Expert | **Niveau 9/1 — Sous-chef** | 6 460 € | Art. 14 |
| Cadres (Pit Boss / Inspecteur) | Cadres SBM | 8 295-10 452 € | Art. 15 |

Le niveau n'est pas dans le PDF mais peut être **inféré** depuis le code
poste (BRTPECK + `.`) et la présence dans la section cadres.

### 13.5 Compétences BRTPECK détaillées (Art. 5)

| Lettre | Jeu | École premium |
|---|---|---|
| `B` | BlackJack | École de base |
| `R` | Roulette anglaise (37 cases, 0 vert) | École de base |
| `T` | Texas Hold'em (Poker tournoi) | École premium |
| `P` | Punto Banco (Baccara) | École premium |
| `E` | **Roulette Européenne** | **École PREMIUM SBM** (Art. 4) — plaque jaune |
| `C` | Craps (dés) | École premium |
| `K` | BJ Super / Poker Cash Game | École premium |

**Convention Art. 5** : 5 écoles premium maximum sur 9 ans, **min 1 an
entre 2 écoles**. La compétence `E` (roulette européenne) confère le
statut **chef européen** (marqueur `★` rouge devant le nom).

---

## 12. Critères « OK go intégration CMCteams » (README T1)

- [ ] 4 PDFs Kevin importés sans bug fonctionnel (UI ne crashe jamais)
- [ ] Pour chaque PDF, résultat affiché matche 100% le source (validation manuelle Kevin cellule par cellule)
- [ ] Aucune cellule inventée. Aucune cellule manquante non flaggée. Suffixes `'`/`"`/`*`/`:` préservés. Mois, version, type, lieux, équipes, miroirs corrects.
- [ ] Tests automatiques verts (vitest + Playwright sur les 4 fixtures)
- [ ] Kevin signe « OK go intégration CMCteams »

---

**Lieu de stockage** : `IMPORT_RECONNAISSANCE.md` à la racine.
[Voir sur GitHub](https://github.com/9r4rxssx64-creator/cmcteams/blob/main/IMPORT_RECONNAISSANCE.md).

À chaque nouvelle info Kevin sur les imports → mettre à jour ce document
**IMMÉDIATEMENT** (règle CLAUDE.md §1ter NOTES_USER).
