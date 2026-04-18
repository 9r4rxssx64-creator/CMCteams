# NOTES_USER — Informations métier données par l'admin

> **Lecture obligatoire à chaque session.**
> Apex relit ce doc au boot via `memory.syncDocsAtBoot()` (cache 6h IDB).

---

## 🎯 RÈGLE MÉTIER FONDAMENTALE — DÉTECTION ÉQUIPES PAR JOURS REPOS (Kevin 2026-05-15)

> **"Avant ça marchait, reconnaissance équipe et équipe miroir par rapport aux jours de congés. Le trait noir plus foncé délimite les équipes quand il y est, sinon fait regarder les jours repos. Il y a plusieurs personnes avec les mêmes jours c'est une équipe, plus bas d'autres personnes avec les mêmes jours repos c'est l'équipe miroir."**

### Algorithme officiel SBM pour identification équipes V1 (employés/chefs roulettes/BJ/CMC)

Le PDF SBM utilise 2 conventions pour délimiter les équipes :

1. **Trait noir plus foncé** entre les blocs d'équipes (visible dans le PDF mais **disparu après copy-paste texte**)
2. **Pattern de jours de repos (RH/R) IDENTIQUE** entre membres d'une même équipe

### Règle de détection

- Les employés ayant **exactement les mêmes jours RH dans le mois** appartiennent à la **MÊME équipe**
- L'**équipe miroir** est le groupe avec **pattern RH décalé d'un offset constant** (généralement +N jours dans le cycle)
- Chaque équipe a typiquement **4-6 employés** (le header PDF indique le compte : "4 RH du au" = 4 emps avec RH à cette position)
- Famille (BJ/Roulettes/CMC) déduite de la section PDF dans laquelle apparaît le bloc

### Quand l'algorithme s'applique

- V1 mai 2026 format (sans marqueur d'équipe explicite) → équipes reconstruites par pattern RH
- V1 juin 2026 format (avec numéro d'équipe explicite entre POST et NOM, ex `BRTP+K 5 NAME`) → équipe EXPLICITE prioritaire
- V2 cadres (PIT BOSS / SUPERVISEUR / INSPECTEUR) → équipes "pit15" / "sup" depuis section header (pas pattern RH)

### Implémentation

`_cmcDetectTeamsByRestPattern(iy, im)` (v9.648, ligne ~32700 index.html) :
- Appelé auto dans `_postValidateImport` après chaque import
- Skip emps avec teamHistory déjà écrit (priorité parser explicite)
- Skip emps avec <20 cells (signature non fiable)
- Skip groupes <3 emps (faux groupements évités)
- Détection miroir = paires (A,B) avec même family + même taille + offset RH constant
- Stocké : `emp.teamHistory[key] = teamId` + `cmc_team_mirror_<key> = {teamId: mirrorId}`

### Vérité terrain Pit Boss mai 2026 V2 (Kevin 2026-05-16)

**Naming SBM** :
- "Mai V2" = naming utilisé sur planning des **chefs et employés** (V1 = 1er PDF mois, V2 = mise à jour)
- "Mai" tout court = naming utilisé pour le planning **Pit Boss/Superviseurs** (pas de versionning V1/V2 distinct pour cadres)

**Évolution organisationnelle (importante)** :
- Plus d'inspecteurs SBM en mai 2026 → tous **promus Pit Boss**
- Effectif : 16 Pit Boss + 5 Superviseurs

**Ordre des Pit Boss dans le planning (premier jour)** :
JANEL JM, GARELLI C, PETIT J, HERVÉ A, LANDAU J, PELAZZA F, CORNUTELLO A, DI COLANGELO F, CAMPI H, EMMERICH JC, LONG JP, ENZA C, JONIAUX S, BOUVIER JF (+ ETTORI M, FOUQUE V, PLACENTI L, DOGLIOLO Y, MUS L = Superviseurs)

**Code horaire `PK`** = Poker Cash Game (rotation Pit Boss au PK)

**Statuts mai Pit Boss** :
- 🤒 ROSPOCHER G = M (maladie) **tout le mois** (codes "M M M M M M..." 31 jours)
- 🏖️ PENNACINO JP = CP partiel (jours 1-20 CP, ensuite codes normaux 21-31)

**Pas d'équipes structurées** :
Contrairement aux V1 chefs/employés, les Pit Boss n'ont pas d'équipes (A/B/C + miroirs). Ils sont individuellement assignés selon leur position dans la rotation (offset 1-14 dans le cycle).
Algo : ne pas chercher équipes Pit Boss via pattern RH, juste les laisser avec emp.team = "pit15" ou "sup".

### ⚠ Attention HOMONYMES

Des employés ont le même nom de famille mais des prénoms différents. Ne JAMAIS confondre :
- BORGIA T vs BORGIA L
- LANDAU B (chef BJ) vs LANDAU J (Pit Boss)
- DESSI P vs DESSI F
- ELIODORI V vs ELIODORI J
- SEGGIARO G vs SEGGIARO J
- ENZA B (chef BJ) vs ENZA C (Pit Boss)
- BARILARO A vs BARILARO H
- ESPAGNOL S (chef BJ) vs ESPAGNOL P (Employé) vs ESPAGNOL A (Employé)
- CAPRA C vs CAMPI PH vs CAMPI H (Pit Boss)
- BERNARDI JE (chef roulette) vs BERNARDI J (Employé CMC)
- BERNARD J (Employé) vs BERNARDI J/JE (différents)
- ESPAGNOL S vs ESPAGNOL P vs ESPAGNOL A
- MARTINI M (Employé CP) vs MARTIRE M (EDC)
- LAVAGNA J (chef FORMATION) vs LAVAGNA Y (Employé) vs LAVAGNA E (Employé)
- LANTERI E (employé) vs LANTERI T (employé) vs LANTERI MINET P (Roulette équipe 2)
- DELLA PINA L vs DELLA PINA M
- CATALA P (Employé M) vs CATALA T (Employé CMC)
- ELENA C (Employé EDC) vs ELENA A (Employé)
- MORANA A (Employé CMC) vs ?
- BRASSEUR F (chef BJ) vs BRASSEUR Fr (Employé)
- BORGIA T (Employé CP) vs BORGIA L (Employé)
- MATTERA M (Employé CP/Formation) vs ?
- INZIRILLO R (Employé CP/Formation) vs ?
- CAPIOMONT K (Employé CP/Formation) vs ?

**Règle parser** : bien vérifier l'initiale après le nom (ex `BORGIA T` ≠ `BORGIA L`). Fuzzy match interdit sans vérification d'initiale.
Voir `cmc_known_identities` (v9.220) pour la liste cumulative.

### 🔥 Confirmations Kevin 2026-05-16 (v9.658)

Kevin a confirmé spécifiquement :
- **ENZA Christophe** (Pit Boss) ≠ **ENZA Bruno** (chef européen ou chef européen — frères potentiels). Note : initialement écrit "Iaenza/etenza" par dictée vocale, mais c'est bien "ENZA".
- **LANDAU Ben** vs **LANDAU Jonathan** : ce sont **deux frères**, jamais les confondre.
- **PETIT Thierry** vs **PETIT Johanna** : couple ou frère/sœur, à ne pas confondre.
- **CAMPI H** vs **CAMPI PH** : c'est un **couple** — CAMPI Hélène + CAMPI Philippe. Les deux doivent apparaître séparément, jamais merger.

**Règle parser stricte v9.658** : la fonction `runAudit` propose des "noms similaires" SEULEMENT si le surname (1er token) est EXACTEMENT identique OU si la similarité globale ≥ 0.85 (typo évident). Plus de Levenshtein 0.55 lax qui matchait MAIARELLI → GARELLI faux positifs.

### 🚫 RÈGLE ABSOLUE : ZÉRO HISTORIQUE, ZÉRO ACQUIS (Kevin 2026-05-16)

**Le planning change TOUT le mois entièrement :**

1. ❌ **Nombre d'équipes variable** : peut y avoir 5 équipes un mois, 6 le mois suivant
2. ❌ **Nombre d'employés par équipe variable** : équipe peut avoir 4, 5, 6, 7+ emps selon le mois
3. ❌ **JAMAIS d'historique** : ne pas se baser sur l'équipe du mois précédent
4. ❌ **JAMAIS d'acquis** : `emp.team` DEF_EMP n'est qu'une valeur initiale, jamais courante
5. ❌ **PAS d'équipe pour les Pit Boss/Cadres** : ils sont assignés individuellement (offset rotation 1-14)

**Implications algorithme** :
- ✅ Chaque import RÉÉCRIT complètement `emp.teamHistory[key]` pour le mois
- ✅ Scoped wipe v9.643 efface teamHistory[key] avant parser (jamais de fallback ancien)
- ✅ Algo `_cmcDetectTeamsByRestPattern` skip les cadres (family="cadres")
- ✅ `teamForMonth` strict mode v9.647 ne fallback PAS sur emp.team DEF_EMP pour affichage courant
- ❌ **INTERDIT** : `autoFillMissingCadres()` copie historique mois N-1 → désactivé v9.604 (Erreur #48)

**Conséquence pour affichage** :
- Si pas de teamHistory[key] pour ce mois → emp dans section "❔ Pas de planning ce mois" (v9.647)
- Ne JAMAIS afficher emp.team DEF_EMP comme équipe courante
- Refresh complet à chaque import

### 📅 Convention versioning planning SBM (Kevin 2026-05-16)

- **Pas de V** dans le nom du planning = **V1** (premier planning du mois)
- **V2, V3, etc.** = mises à jour successives
- Le naming est toujours **écrit sur le planning** (ex "Mai 2026", "Mai 2026 V2", "Juin 2026")

### Vérité terrain Juin 2026 V1 (Kevin 2026-05-16) — équipes Roulettes confirmées

| # | Équipe principale | Membres | Code | Miroir | Membres | Code |
|---|---|---|---|---|---|---|
| 1 | (4 emps) | SOLFERINO F, ROSSI J, VECCHIERINI L, DELMAS G | `20/5` | (5 emps) | BONO V, CHATTAHY N, GARRO S, CARPINELLI K, MOUFLARD L | `22/6'` |
| 2 | (6 emps) | BASILE F, RINALDI S, RAMOS R, PARIZIA K, MILLET T, MARCHI T | `19/4` | (4 emps) | BARONE E, MARCHISIO M, GARCIA N, DAGIONI M | `19/4""` |

**📌 Preuve règle "tous changent chaque mois"** (cf section emp.team DEF_EMP) :

| Emp | Mai V1 | Juin V1 |
|---|---|---|
| BARONE E | Équipe A principale (`20/5`) | Équipe 2 MIROIR (`19/4""`) |
| BASILE F | Miroir A' (`22/6'`) | Équipe 2 principale (`19/4`) |
| PARIZIA K | Équipe A principale | Équipe 2 principale |
| DAGIONI M | Équipe A principale | Équipe 2 miroir |
| RAMOS R | Chef BJ section dédiée | Équipe 2 roulettes (réaffecté) |

**Conclusion** : `emp.team` du DEF_EMP n'est JAMAIS la vérité courante. Seul `emp.teamHistory[key]` écrit par l'import du mois donne l'équipe correcte. Mon algo doit détecter ces réaffectations sans erreur (v9.654 algorithme RH pattern).

### Vérité terrain V1 mai 2026 (Kevin 2026-05-16) — équipes Roulettes confirmées

Référence pour calibrer/valider l'algo `_cmcDetectTeamsByRestPattern`.

| # | Équipe principale | Code jour 1 | Équipe miroir | Code jour 1 | RH days |
|---|---|---|---|---|---|
| 1 | BARONE E, AUREGLIA R, PARIZIA K, GANCIA G, DAGIONI M | `20/5` | BASILE F, RINALDI S, SIRIO J, MALENFANT PJ, MILLET T, MARCHI T | `22/6'` | [5,11,17,23,29] |
| 2 | AUBERT P, HAREL H, SBARATTO S, CARDONA P, LANTERI MINET P | `19/4` | LE DUC F, CHOISIT J, DEVERINI F, NUNEZ S | `19/4""` | [4,10,16,22,28] |
| 3 | PORASSO C, ANTOGNELLI D, MERLINO B, ADROIT N, SEGGIARO G, ROSSI D | `16/22` | MUCCILLI D, IMBERT E, BRASSEUR F, RUZIC M, PICCIONE F | `16/3` | [3,9,15,21,27] |

**Conventions** :
- Sur premier jour travail : équipe = 22h, miroir = 20h. Cycle suivant inverse.
- Exceptions possibles selon affluence/direction SBM.

**Statuts mois entier** :
- 🎓 FORMATION — **CHEFS** détachés au service formation tout le mois (encadré "13 FORMATION du au" section Chefs BJ) :
  FILIPPI F, LAVAGNA J, MOREL F, BONO F, VIGNA M, GAZAGNE F, EHRET G, PORTA A, GRAUSS A
- 🎓 FORMATION — **EMPLOYÉS** courte période (4-8 mai, encadré "3 FORMATION du au" section Employés CMC) :
  MATTERA M, INZIRILLO R, CAPIOMONT K
- 🏖️ CP intégral du mois — **CHEFS BJ** (encadré "2 CP du au" section Chefs BJ) :
  MATTONE F, PEREIRA MACENA F
- 🏖️ CP intégral du mois — **CHEFS ROULETTES / jeux européens** (encadré "10 CP du au" section Roulettes) :
  SANGIORGIO G, BOURDIER C, CASSINI A, PASSERON G, NOVARETTI B, ELIODORI V, GRAUSS A, MACCARIO S, ANDRE C, CELLARIO T
- 🏖️ CP intégral du mois — **EMPLOYÉS** (encadré "8 CP du au" section Employés CMC) :
  FAIVRE R, CAPIOMONT K, INZIRILLO R, MANFREDI H, MASSEGLIA J, MATTERA M, NOBBIO G, BORGIA T

  ⚠ Superposition : CAPIOMONT, INZIRILLO et MATTERA ont une exception FORMATION 4-8 mai → CP partout SAUF jours 4-8 où ils sont en AF (formation). Le parser doit gérer cette priorité (CP par défaut, AF surcharge sur dates spécifiques).
- 🤒 MALADIE longue durée — **ROULETTES** (encadré "7 M du au" section Roulettes) :
  LORENZI Y, SANNA O, GALLIS F, BESSI N, ARDISSON S, SEGGIARO J, ORRADO F
- 🤒 MALADIE longue durée — **CHEFS** (encadré "1 M du au" section Chefs BJ) :
  ROBIN M, CAPRA C, LEMONNIER PH
- 🤒 MALADIE longue durée — **EMPLOYÉS** (encadré "4 M du au" section Employés CMC/aménagement) :
  MIRANDA T, CATALA P, MARTINI M, RICHARDIN T
- 📋 EDC (En Détachement Cadre / statut spécial SBM, encadré "EDC du au") :
  DE RYCKE K, MARTIRE M, ELENA C

**⚠ Important** : les chefs et employés en M longue durée sont dans des **cases SÉPARÉES** du PDF (sections différentes). Ne pas les confondre dans le parsing.

### 🎨 Nomenclature visuelle codes horaires SBM — **Mai V2 Pit Boss** (Kevin 2026-05-16)

**Distinction CRITIQUE des marqueurs `*` / `★`** :

| Marqueur | Position | Signification |
|---|---|---|
| `★` ou `*` rouge | À côté du **NOM** (avant les codes) | **Chef européen** (compétence E école premium SBM Art. 4) |
| `*` après un code horaire | Suffixe d'un code (ex `20/5*`) | **CCDP + CMC** (lieu : Café de Paris + Casino + Cercle Monaco Carlo) |

**Codes horaires par couleur de fond dans le PDF original** :

| Couleur fond PDF | Écriture | Exemples codes | Signification métier |
|---|---|---|---|
| **BLANC** | noir | `22/6c`, `19/4c`, `16/3c`, `14/19c` (avec suffixe `c`) | Travail au CMC normal |
| **ORANGE** | rouge | `22/6*`, `19/4*`, `16/3*`, `16/22*` (suffixe `*`) | CCDP + Casino + CMC (chef européen au Café de Paris) |
| **ROUGE** | jaune | `19/4"'` (avec tirets `"'` après le code) | **Jours de CONVENTION** : jours rajoutés ponctuellement par la direction quand ils ont besoin de personnel supplémentaire sur les cycles |
| **VERT** | normal | `AF` | **Formation** 9h15-17h45 en salle blanche (employés ET chefs/professeurs détachés au service formation) |

**Cette nomenclature visuelle s'applique pour mai V2** (cadres Pit Boss/Superviseurs). Codes V2 spécifiques :
- Codes Pit Boss : `22/6`, `16/20`, `12h30/19`, `19/2`, `15/19`, `19/4'`, `19/4:`
- Codes alternés (cycle) avec suffixes `'`, `:`, `*` pour distinguer lieu/jour

**Implications algorithme / affichage** :
1. Le suffixe `c` est juste CMC normal (à conserver ou ignorer selon contexte)
2. Le suffixe `*` est CCDP+CMC → afficher fond orange dans la cellule de l'UI
3. Le suffixe `"'` (multiple tirets) = CONVENTION → fond rouge écriture jaune
4. `AF` = formation → fond vert
5. Mon algo `_firstWorkCode` v9.654 garde les suffixes ', ", * pour distinguer cycles ✓
6. Mais `_firstWorkCode` norme `c` (enlève suffix CMC) → cohérent

**Pour le rendu UI** : la fonction de coloration des cellules `cmcMetaForCell` (v9.619) stocke `bg` dans `A.overrides_meta[key][eid][d]`. Mapping à faire :
- `c` suffix → bg blanc (default)
- `*` suffix → bg orange "CCDP"
- `"'` suffix → bg rouge "CONV"
- `AF` → bg vert "FORMATION"
- `CDP` standalone → bg orange "CCDP"
- `CP` → bg rose "CONGÉ"
- `RH` → bg violet
- `R` → bg lavande

### ⭐ Petite étoile rouge `*` = CHEF EUROPÉEN (Kevin 2026-05-16)

Le marqueur `*` rouge à côté du nom dans le PDF SBM (ex `BARONE E *`, `PORASSO C *`, `HAREL H *`) signifie **chef européen** = compétence Roulette Européenne (E) validée à l'**école premium SBM** (Convention Art. 4, École Jeux 1 an minimum).

⚠ **Distinction importante** :
- Ma règle CLAUDE.md actuelle utilise `emp.senior=true` pour le marker `*` rouge et applique rotation 40 min (règle 55+ ans)
- Kevin précise : le `*` signifie en fait "chef européen", PAS senior 55+
- À clarifier : sont-ils corrélés ? (chefs européens sont souvent les plus anciens donc parfois 55+, mais pas systématique)

**TODO algo** : ajouter `emp.chef_european = true` quand parser détecte `*` rouge, en parallèle de `emp.senior=true`. Permettra de :
- Maintenir rétro-compat règle rotation 40 min
- Ajouter règle séparée pour chefs européens (carrière, ancienneté, paie)
- Affichage badge spécifique 🎖️ chef européen dans fiche emp

### Compétences BRTPECK encodées dans le code poste devant le nom

Le code poste devant chaque nom (ex `BRTP+E.`) indique les compétences validées de l'employé selon la Formation Jeux SBM 2016 :

| Lettre | Jeu | Notes |
|---|---|---|
| **B** | BlackJack | Compétence base américaine |
| **R** | Roulette américaine | |
| **T** | Texas Hold'em | Poker tournoi |
| **P** | Punto Banco | Baccara |
| **E** | Roulette Européenne | Plaque jaune SBM (Convention art. 4 = école premium) |
| **C** | Craps | Dés |
| **K** | BlacKjack Super | Variante haut roller |

Conventions des codes poste :
- `+E` = compétence ajoutée formellement (formation suivie ET validée)
- `.` à la fin = chef (Chef de Table) ex `BRTCP+E.`
- Préfixe `.` au début = employé cartes CMC (ex `.BRTCP+KE`)
- `+K` = pratique blackjack avancé après promotion
- Niveau Expert (Convention Art. 11) = 7 compétences toutes = BRTPECK complet
- Tier sous-chef (Convention Art. 11 niveau 9/1) = 7 compétences + 5 ans expérience

Exemple décodage `BRTP+E.` :
- B+R+T+P = base 4 jeux
- +E = roulette européenne ajoutée
- . = chef de table
- Total : 5 compétences, chef

Exemple `.BRTCP+KE` :
- . = section CMC
- B+R+T+C+P = 5 jeux base
- +K = blackjack super
- +E = roulette européenne
- Total : 7 compétences = Expert

### Conséquence cruciale

⚠️ **Kevin et collègues changent d'équipe CHAQUE MOIS au Casino SBM.**

- `emp.team` du DEF_EMP est une valeur **historique/défaut**, PAS l'équipe courante
- L'équipe courante = `emp.teamHistory[YYYY-M]` écrite par l'import du mois
- Si pas de teamHistory pour le mois → emp n'a PAS d'équipe ce mois (placé dans section "❔ Pas de planning ce mois" v9.647)
- Ne JAMAIS utiliser `emp.team` comme fallback pour afficher l'équipe courante

---

## 🆕 SESSION 2026-05-07 — Nouvelles fonctions Apex / outils / liens (Kevin 23h59)

### 🏠 IoT Smart Home — Apex pilote la domotique (livré v13.3.51 + IOT-AUTONOMY en cours v13.3.52)

**Subagent BROADLINK-VISION + IOT-AUTONOMY** : Apex peut maintenant identifier un device sur photo (Vision IA GPT-4o) puis envoyer commande IR/RF/Wi-Fi automatique.

**Providers IoT installables** (registry `services/iot-providers-registry.ts` — 6 builtin) :
| Provider | URL cloud | Devices supportés |
|---|---|---|
| **eWeLink** (Sonoff) | https://us-apia.coolkit.cc | Prises Wi-Fi, interrupteurs, capteurs |
| **Tuya / SmartLife** | https://openapi.tuyaeu.com | Lampes, prises, capteurs Tuya |
| **Broadlink** (RM Pro 4) | https://api.ibroadlink.com | IR universel + RF 433MHz |
| **Philips Hue** | bridge local | Lampes Hue |
| **Sonos** | API local SOAP | Enceintes Sonos |
| **Home Assistant** | http://homeassistant.local:8123 | Tout intégré HA |

**Tool IA** : `install_iot_provider` permet à l'IA d'installer un provider en autonomie via dialog Kevin.

**Vue admin** : `?view=broadlink-setup` (scan compte + devices + codes IR) + `?view=iot-providers` (liste + install).

**Apex flow autonome** :
1. Kevin photographie une TV → `vision-device-analyze.ts` détecte marque+modèle
2. Apex cherche dans Broadlink Cloud les codes IR pour ce modèle
3. Pilote en 1 commande vocale : "Dis Apex éteins la TV salon"

### 🔧 Outils Apex chat (livré v13.3.50 — CHAT-MAX subagent)

Le chat Apex a été poussé au max :

**10 Slash commands** (`services/slash-commands.ts`) :
- `/help` — liste commandes
- `/clear` — efface conversation
- `/regen` — régénère dernier message IA
- `/fork` — fork conversation à partir d'un message
- `/voice` — toggle voix TTS
- `/theme [casino|ocean|sunset|emerald|pride|halloween|christmas|valentine]` — change thème
- `/persona [pro|fun|expert|ami]` — change personnalité IA
- `/lang [fr|en|it|es|de]` — change langue
- `/export` — export conversation Markdown
- `/share` — copy lien partage

**3 Chips suggestions** (`services/suggestions.ts`) — 14 catégories contextuelles :
Affichées sous greeting initial, contextuelles selon historique :
finance, music, video, archi, photo, admin/loi, cuisine, médical, voyage, traduction, calcul, créatif, juridique, scientifique.

**Markdown enrichi** (`ui/markdown.ts` — 307 lignes) :
- Tables avec alignement
- Code blocks avec bouton copy + syntax highlight progressif
- Footnotes `[^1]`
- Strikethrough `~~texte~~`
- Auto-linkify URLs

**Chat features** :
- 🔄 **Régénérer** (button per-message) — ré-appelle IA avec même prompt
- 📋 **Fork conversation** — branche depuis n'importe quel message
- ✂ **Smart auto-scroll** — ne scroll pas si user a scrollé manuellement (UX iPhone fix)
- 🧹 **Cap context** — 30 messages max envoyés à API (cap system prompt 32K + cap conversation)

### 🛡 Sécurité credentials (livré v13.3.51 — POUBELLE-FIX)

**Bug fix Kevin "j'ai poubelle plusieurs fois mais il se remet"** :
- `vault.startCredentialsWatch` whitelist `isDeleted` → suppressions persistent (pas re-restore depuis IDB shadow)
- `multi-key-vault.removeKey` triple cleanup : localStorage + IDB shadow + Firebase + audit
- Bouton "Récupérer cette clé" 🔓 si decrypt failed (multi-passphrase retry)

### 📡 Pipeline temps-réel Apex↔Claude Code (livré v13.3.27 — subagent N)

**Conférence autonome bidirectionnelle** :
- Apex push erreur critique → `claudeBridge.escalateNow(todo)` → POST `/repos/.../dispatches` GitHub → workflow tourne immédiatement (<30s)
- Workflow ouvre Issue auto avec contexte
- Claude Code fix → écrit `handoff_journal` Firebase action='fixed'
- Apex SSE listener auto-résout todo + toast doré "🤝 Claude Code a fixé : [titre]"

**Workflow** : `.github/workflows/claude-todo-watcher.yml` cron **5min** + repository_dispatch immédiat.

**Action Kevin pour activer** : Coffre `ax_github_token` (PAT scope `repo` + `workflow`).

### 📊 Smart-router IA (livré v13.3.33 — SMART-ROUTER subagent)

**Auto-route 10 providers selon score 4 critères pondérés** (`services/smart-router.ts` 639L) :
- **Latence** 40% (mesure live)
- **Crédit restant** 30% (auto-detect quota)
- **Qualité** 20% (selon use-case : code/vision/chat)
- **Uptime** 10% (historique 7j)

**Auto-mask** provider KO depuis >24h (sentinelle smart-router-watch).

**Vue admin** : `?view=smart-router` voir status live + score temps réel.

**Préférences Kevin** :
- **Veille X / Twitter / Telegram** → Grok (xAI)
- **Code / refactor / architecture** → Claude (Anthropic)
- **Vision / photos / device-analyze** → GPT-4o (OpenAI)
- **Latence critique** → Groq (Llama 3.3 70B Versatile)

### 🎤 Voice biometrie progressive (livré v13.3.45 — VOICE-EXCLUSIF + VOICE-PROGRESSIVE)

**4 phases progressive** (`services/voice-print.ts` 1267L) :
| Phase | Threshold | Comportement |
|---|---|---|
| **OUVERT** | 0.00 | Tout le monde peut activer wake word "Dis Apex" |
| **APPRENTISSAGE** | 0.50 | Apex apprend ta voix sur 5 messages |
| **AFFINAGE** | 0.65 | Score similarité progressif, fausses détections silencieuses |
| **EXCLUSIF** | 0.85 | Seul user enrôlé déclenche, Kevin admin override actif |

**Multi-user isolation** : `ax_voice_print_<uid>` (FB_LOCAL strict, jamais sync Firebase, biométrique).

**Kevin admin override** : Kevin reconnu dans la vue de Laurence → mode admin temporaire pour cette commande seulement.

**Vue admin** : `?view=voice-bio` enrôler/tester/supprimer.

### 🌐 Liens nouveaux à connaître

| Service | URL | Usage |
|---|---|---|
| **Tavily** | https://app.tavily.com/home | Web search alt 1 (key collée Kevin ✓) |
| **Brave Search API** | https://brave.com/search/api/ | Web search alt 2 (gratuit 2000 req/mois) |
| **Google Custom Search** | https://programmablesearchengine.google.com/ | Web search alt 3 |
| **Broadlink Cloud** | https://api.ibroadlink.com | IoT IR/RF Broadlink |
| **eWeLink** | https://us-apia.coolkit.cc | IoT Sonoff |
| **Tuya / SmartLife** | https://openapi.tuyaeu.com + https://developer.tuya.com/en/docs/cloud/ | IoT Tuya |
| **eWeLink API docs** | https://coolkit-technologies.github.io/eWeLink-API/ | Doc dev eWeLink |

### 🎨 UX session FINAL (livré v13.3.31 — UX subagent)

**8 thèmes complets** :
Casino (or noir) / Ocean (bleu) / Sunset (orange) / Emerald (vert) / Pride / Halloween / Christmas / Valentine.

**10 voix FUN** (rajoutées aux 51 existantes = 61 total) :
Hulk, Voldemort, Rappeur, BébéRobot, Vache, Chien, Chat, YodaPlus, Minion, T-Rex.

**Easter eggs** :
- Konami code (↑↑↓↓←→←→BA) → confettis géants
- Triple-tap logo → mode FUN auto-activé
- 4× boot consécutifs → message gratitude

**PRO ⚙️ / FUN 🎉 toggle global** (top right) — switch instantané ton réponses IA.

### 💰 Plans commerciaux (livré v13.3.45 — INNOVATION-COMMERCIAL)

`services/commerce.ts` (204L) — tiers Free / Basic / Pro :
- **Free** : 100 messages/mois, 3 voix, pas Studios
- **Basic** : 9.99€/mois — 1000 msg, 50 voix, Studios musique+vidéo+CV
- **Pro** : 29.99€/mois — illimité, 61 voix, tous Studios, IA Pro priorité, support direct

**Landing commerciale** : `tools/apex-landing.html` (admin Kevin déploie sur kdmc.cloud).

**Onboarding** : `features/onboarding/` 5 steps first-run (chat → voice → studios → favoris → "Mes compétences IA").

**Catalogue features** : `docs/apex-features.md` — pour pitch commercial.

### 🌳 Décisions Kevin gravées (cette session)

- ✅ **Garde Claude + Grok** (smart-router auto-route selon use-case, pas besoin de choisir)
- ✅ **10 clés Coffre** prioritaires : Anthropic, GitHub, Groq, DeepSeek, Mistral, Cohere, xAI, Perplexity, YouTube, Railway
- ✅ **Wake word** : 4 phases progressives (OUVERT → APPRENTISSAGE → AFFINAGE → EXCLUSIF) — pas d'enrôlement obligatoire au début
- ✅ **Casino Monaco** : préférences IA selon use-case (X = Grok, code = Claude, vision = GPT-4o, latence = Groq)
- ✅ **IoT à piloter** : Broadlink + eWeLink + SmartLife + futurs (auto-installable via tool IA)

---

## 👤 IDENTIFIANTS DE CONNEXION — ordre flexible (Kevin 2026-04-21)

**Règle absolue** : les noms de connexion doivent matcher quel que soit l'ordre prénom/nom, la casse, les tirets, les accents, les espaces multiples.

Utilisateurs preconfigurés dans Apex (`PRECONFIGURED_USERS`) :

| Clé officielle | Tous les formats acceptés |
|----------------|---------------------------|
| **Laurence SAINT-POLIT** | Laurence SAINT-POLIT, SAINT-POLIT Laurence, saint-polit laurence, laurence saint polit, Saint-Polit Laurence, etc. |
| **Christophe TARDIEU** | Christophe TARDIEU, TARDIEU Christophe, tardieu christophe, etc. |
| **Sandrine TARDIEU** | Sandrine TARDIEU, TARDIEU Sandrine, sandrine-tardieu, etc. |
| **TARDIEU** (compte test) | TARDIEU, tardieu |
| **Kevin DESARZENS** (admin) | Toute casse/tiret/underscore matche admin (regex `/kevin[\s_-]*desarz/i`) |

**Implémentation v12.57** : `_checkPreconfiguredUser` normalise (lowercase, suppression accents, tirets → espaces) puis compare par **ensemble de mots triés alphabétiquement** → indépendant de l'ordre.

**S'applique à tout nouvel user préconfiguré** — ajouter simplement dans `PRECONFIGURED_USERS`, la matchage flexible fonctionne automatiquement.

---


## 🔑 CONFIGURATIONS UTILISATEUR DEJA EN PLACE (ne pas redemander)

- ✅ **Clé API Anthropic** : Kevin a une clé valide configurée. Elle vit dans `ax_shared_api_key` (Firebase shared, FB_FIX). JAMAIS redemander. Si l'app dit "manquante", c'est un problème de sync au boot — `_getApiKeyAsync` v12.21 la récupère en auto depuis Firebase.
- ✅ **Firebase RTDB** : `cmcteams-c16ab-default-rtdb.europe-west1.firebasedatabase.app`. Règles publiées par Kevin avec `cmcteams` + `apex` read/write autorisés.
- ✅ **Proxy Cloudflare** : si `ax_proxy_url` est set, l'utiliser en priorité (évite CORS iOS PWA).
- ✅ **Telegram bot** : `@Kdmc_kevind_2026_bot` (via `axTelegramSend`, chatId dans `ax_telegram_chatid`).
- ✅ **Email** : kevind@monaco.mc (Outlook), Gmail, iCloud (configs via EmailJS).
- ✅ **Réseaux sociaux** : comptes Instagram/FB/Twitter/LinkedIn/TikTok/YouTube/Pinterest/Snapchat/Reddit créés. Identifiants dans vVault Apex.
- ✅ **Appareils** : iPhone (principal), Tablette Lenovo Android, Ordinateur.
- ✅ **Domotique** : Broadlink IR configuré + Home Assistant (urls dans localStorage).
- ✅ **Sentry DSN, Finnhub API key** : configurés.

**Règle Claude Code** : avant de dire "configure X", chercher d'abord si X n'est pas déjà dans cette liste. Si incertain, vérifier via  ou demander à Kevin explicitement sans supposer.

---

## 📄 FORMAT PDF CADRES (Kevin 2026-04-21) — CRUCIAL pour fallback parser

**Structure exacte PDF SBM "PLANNING PIT BOSS" / mensuel cadres :**

| Col | Contenu | Prendre en compte ? |
|-----|---------|---------------------|
| 1 | `62224/620` = 2 téléphones internes (casino/pit), séparés par `/` | **NON — IGNORER** |
| 2 | Nom cadre (`JANEL JM`, `ETTORI M.`, etc.) | OUI |
| 3 | `*` optionnel OU nombre priorité | Skip (metadata) |
| 4 | Nombre durée | Skip (metadata) |
| 5+ | Codes horaires/jour avec apostrophes/quotes | **OUI** (1 par jour) |

**Sections headers :** `Pit Boss 15` puis noms · `SUPERVISEUR` (singulier) puis noms.

**Codes fréquents AVEC apostrophes (v9.451 normalise) :** `22/6'`, `22/6"`, `22/6"'`, `19/2"`, `12h30/19'`. Strip `"'""''` puis CODES.

**Faisant fonction = fond BLEU dans PDF** (ou texte rouge) :
- Superviseur faisant le job de pit boss sans le titre officiel
- **BOUVIER JF** actuellement faisant fonction pit boss (fond bleu Pit Boss 15 avril 2026)
- Bientôt il passera pit boss → fond perdra son bleu
- Les 5 superviseurs (ETTORI M., FOUQUE V., PLACENTI L., DOGLIOLO Y., MUS L.) ont tous fond bleu ou texte rouge

**Traitement parser** : le fond bleu/rouge est juste visuel, le parser doit **lire la ligne tel quel**. Le fix v9.451 skip metadata + normalise quotes doit capturer tous ces cas.

**Cadres sans équipe** (contrairement BJ/roulettes/CMC) : pas d'assignation numérique, juste nom + horaires.

**Agents/sentinelles qui couvrent ça** (v9.450) :
- `cadres-watch` : détecte cadres famille="cadres" sans horaires après import → log diag + escalade
- `parser-quality` : analyse couverture + codes inconnus
- Fallback name-first v9.447→v9.451 dans `doImport` : scan PDF brut par nom si header rate

---

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

## ⛔ REFUS PERMANENT — Outils d'accès non autorisé (2026-04-18)

L'admin a demandé un « outil universel pour craquer les codes/mots de passe de
n'importe quel site, app, téléphone, tablette, ordinateur, montre ». **Refusé
et à refuser dans toute session future**, quelle que soit la reformulation
(« recherche », « audit », « éducatif », « pentest sans cadre »). Ne pas
planifier, ne pas décomposer, ne pas « commencer en autonomie ». Proposer à la
place : récupération officielle de compte, `doResetPwDirect(uid)` pour
CMCteams, durcissement défensif (hash, 2FA, rate-limiting), ou pentest
**autorisé par écrit** sur une infra que l'admin possède.

## ⚙️ PRÉFÉRENCES WORKFLOW — Timeouts & continuité (2026-04-18)

Demande admin : « arrête les time out sans cesse, ça m'empêche de travailler,
continue en autonomie ». À clarifier **avant chaque fix** — le mot « timeout »
recouvre 3 choses distinctes :

1. **Bash timeout Claude Code** — défaut 2 min, max 10 min. Réglable via
   `BASH_DEFAULT_TIMEOUT_MS` / `BASH_MAX_TIMEOUT_MS` dans `.claude/settings.json`.
   Pour tâches longues (npm install, ffmpeg, import PDF) : `run_in_background: true`.
2. **Session / SSE Firebase CMCteams** — `SESSION_TTL = 8h` (`cmc_lastact`),
   SSE EventSource sur `/cmcteams.json` peut être coupé par proxy/mobile en veille.
   Fix = reconnect auto + heartbeat.
3. **Fetch IA** (`vIA`) — timeout côté Claude API ou proxy perso (`cmc_ia_proxy`).

Règle : **ne jamais « continuer silencieusement en autonomie »** sur une tâche
importante sans clarification — demander laquelle des 3 couches est concernée,
puis appliquer le fix ciblé (`update-config` skill pour settings.json, code
pour SSE/fetch). Utiliser `run_in_background` + notification de fin pour les
commandes longues plutôt que de laisser expirer un timeout court.

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

**Femme de Kevin :** SAINT-POLIT Laurence — compte gratuit, role family (peut modifier son theme)
**Clients test TARDIEU :**
- TARDIEU — compte gratuit, PIN 2026, role client
- Sandrine TARDIEU — compte gratuit, PIN 2026, role client
- Christophe TARDIEU — compte gratuit, PIN 2026, role client
- Tous doivent changer leur PIN a la premiere connexion
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

## ✅ Lecons apprises (ne plus reproduire)

1. **Cle API** : JAMAIS montrer/demander aux clients — cle partagee automatique
2. **Settings admin** : TOUJOURS cacher aux non-admin — check isAdm AVANT d'afficher
3. **Onboarding** : JAMAIS parler de config technique aux clients — guide simple
4. **Service Worker** : TOUJOURS bumper la version cache apres chaque maj majeure
5. **Streaming API** : NE PAS utiliser sur Safari iOS PWA — mode JSON simple
6. **Permissions** : 1 SEULE demande, sauvegarder, ne PLUS redemander
7. **Toast parasites** : NE PAS afficher au demarrage (taux change, decouverte, etc)
8. **Variables** : TOUJOURS declarer AVANT d'utiliser (crash silencieux sinon)
9. **Tester CHAQUE role** : admin + family + client AVANT de livrer
10. **localStorage** : sauvegarder TOUT en permanence (pas sessionStorage)

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

## 🤖 PRÉFÉRENCES IA PROVIDERS (Kevin 2026-05-07, décision)

**Décision Kevin** : "On garde les 2" (Claude + Grok)

### Smart-router Apex v13.3.33+ route automatiquement

| Tâche détectée | Provider auto |
|---|---|
| Code / programmation | Claude Sonnet 4.6 / Opus 4.7 (#1 fiabilité) |
| Reasoning structuré / analyse longue | Claude Opus 4.7 |
| Recherche actualité X (Twitter) live | xAI Grok 3/4 (UNIQUE) |
| Vision / image / audio / vidéo | OpenAI GPT-4o (multimodal natif) |
| Latence ultra-rapide / résumé | Groq (Llama 3.3 70B) |
| Free tier économe | Gemini |
| Failover si quota Anthropic épuisé | OpenRouter → Groq → Gemini → Grok |

### 10 clés API actuellement dans Coffre Kevin (vu screenshot 20:56)

✅ Anthropic Claude (principal)
✅ GitHub
✅ Groq (KO actuellement → recharge https://console.groq.com/keys)
✅ DeepSeek
✅ Mistral
✅ Cohere
✅ xAI Grok
✅ Perplexity
✅ YouTube
✅ Railway

### Auto-mask v13.3.36+

Smart-router masque AUTOMATIQUEMENT les providers avec score ≤ 10 (KO persistent fail_count > 10 ou décrypt failed). Kevin n'a aucune action à faire — Apex bascule auto.

### Cas spécifiques Kevin

- **Casino Monaco veille X** : utilise Grok → "Cherche tweets actualité Casino Monaco"
- **Code Apex/CMCteams** : Claude reste référence (ce travail = preuve)
- **Photos / scan** : GPT-4o vision auto-routé
- **Email rapide** : Groq pour latence < 500ms


## 🎙 Wake Word "Dis Apex" — Flow apprentissage progressif (Kevin 2026-05-07)

**Principe Kevin** : "Au début il écoute tout le monde puis il affine pour finir exclusif utilisateur"

### 4 phases du voiceprint Kevin

| Phase | Samples | Comportement Apex |
|---|---|---|
| 🟢 **OUVERT** | 0-3 | Accepte TOUTE voix qui dit "Dis Apex" — collecte baseline + apprentissage rapide |
| 🟡 **APPRENTISSAGE** | 4-9 | Threshold faible 0.50 — accepte voix similaires + averti si grosse divergence |
| 🟠 **AFFINAGE** | 10-19 | Threshold moyen 0.65 — commence à filtrer voix très différentes (TV en fond, collègue qui passe) |
| 🔴 **EXCLUSIF** | 20+ | Threshold strict 0.75-0.85 — **n'accepte QUE Kevin** (anti-confusion entourage) |

### Logique threshold dynamique

```ts
function getThreshold(samples_count: number): number {
  if (samples_count < 4)  return 0.0;   // Accepte tout
  if (samples_count < 10) return 0.50;  // Apprentissage
  if (samples_count < 20) return 0.65;  // Affinage
  return 0.85;                          // Exclusif strict
}
```

### Avantage UX

- **Démarrage immédiat** : Kevin commence à utiliser "Dis Apex" tout de suite, pas d'enrôlement préalable obligatoire
- **Précision progressive** : à chaque utilisation, Apex apprend mieux la voix Kevin
- **Auto-exclusivité** : quand assez de samples accumulés (~20), Apex devient automatiquement exclusif sans intervention
- **Anti-confusion entourage** : à partir de 20 samples, voix télé / conversations / collègues IGNORÉES silencieusement

### UI feedback Kevin

Dans Réglages → "🎙 Voice Bio" :
- Barre progression "Apprentissage voix : 12/20 samples (60%)"
- Toggle "Mode exclusif anticipé" : si activé, force exclusivité dès 10 samples
- Bouton "🔄 Ré-enrôler ma voix" si reset souhaité (RGPD)

### Si plusieurs users (Laurence, clients)

- Chaque user a son propre voiceprint progressif
- Mode admin Kevin : si Kevin reconnu (via son voiceprint) dans la vue d'un autre user → bascule mode admin temp
- Kevin admin a la PRIORITÉ même dans la vue Laurence (sa voix override)

