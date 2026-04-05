# Document Relais — CMCteams
*Dernière mise à jour : 5 avril 2026 — Version v8.61*

---

## État actuel de l'application

| Paramètre | Valeur |
|-----------|--------|
| **Version** | `APP_VER = "v8.63"` |
| **DATA_VER** | `29` |
| **Fichier** | `index.html` (~360 KB, tout-en-un HTML+CSS+JS) |
| **Déployé** | GitHub Pages (branche `main` → déploiement automatique) |
| **Employés** | ~258 (BJ équipes 1–10, Roulettes r1–r13, CMC c1–c13) |
| **JS syntax** | ✅ validé par `node --check` |

---

## Fonctionnalités disponibles (audit complet)

### Vues accessibles à tous les employés
| Vue | Fonction | Description |
|-----|----------|-------------|
| Planning | `vPlan()` | Grille mensuelle 30 jours, navigation mois/année, légende |
| Départs | `vDeparts()` | Tableaux de départ par équipe, section "Absents tout le mois" |
| Absences | `vAbsences()` | Suivi congés / maladies / formations |
| Chat | `vChat()` | Messagerie d'équipe avec badge nouvelles messages |
| Aide IA | `vIA()` | Chatbot assistant (répond en français) |
| Accueil | `vAccueil()` | Page d'accueil après connexion |

### Vues admin uniquement
| Vue | Fonction | Description |
|-----|----------|-------------|
| Admin | `vAdmin()` | Dashboard avec accès à toutes les fonctions admin |
| Statistiques | `vStats()` | Stats par équipe/employé avec navigation multi-mois |
| Équipes | `vTeams()` | Gestion chefs d'équipe et ordres de départ |
| Employés | `vEmps()` | CRUD employés |
| Import | `vImport()` | Import planning PDF (drag & drop, conversion automatique) |
| Vérification import | `vImportVerif()` | Vérification employé par employé après import |
| Audit | `vAudit()` | Vérification complète des effectifs + détection anomalies |
| Journal audit | `vAuditLog()` | Journal des modifications manuelles admin |
| Gestion mois | `vMoisStockes()` | Gestion des mois stockés en localStorage |

---

## Historique complet des versions

### v8.10 à v8.15 (sessions précédentes)
| Version | DATA_VER | Changements |
|---------|----------|-------------|
| v8.10 | 19 | ARCURI F : planning exact depuis j17 avril |
| v8.11 | 20 | LEMONNIER PH → section Absents tout le mois |
| v8.12 | 21 | 44 employés incomplets complétés (258 × 30 jours) |
| v8.13 | 21 | DEF_CHEFS_T roulette : tous membres ajoutés (41 employés) |
| v8.14 | 22 | **doImport() corrigé** : plus d'écrasement du SEED lors de l'import |
| v8.15 | 22 | Section "Absents tout le mois" avec tri M→AF→CP→R |

### v8.27 à v8.30 (session sécurité)
| Version | Changements |
|---------|-------------|
| v8.27 | `esc()` XSS complet, suppression mots de passe en clair, `gpl()` import partiel, `hardReset` avec backup |
| v8.28 | Export CSV planning, rate-limiting PIN, session 8h auto-expiry, alerte quota localStorage |
| v8.29 | Gestion multi-mois localStorage, jauge stockage, journal d'audit modifications, `vStats` refait |
| v8.30 | LEMONNIER PH retiré équipe 5 (`toMo:1`), profils EP équipe 5 synchronisés (`i=2`), SEED protégé contre écrasement imports |

### v8.50 à v8.61 (session import PDF + vérification)
| Version | Changements |
|---------|-------------|
| v8.50–v8.55 | Amélioration parser CSV/texte : détection double-shift, consensus équipe, fill automatique |
| v8.56 | **Bug** : `hasDoubleShift()` manquait COURTIN F (consensus de 2 sources identiques) |
| v8.57 | `hasDoubleShift()` basé sur pattern (2 codes identiques consécutifs non-personnels), indépendant du consensus |
| v8.58 | Repair pass : employees avec < 5 codes remplis depuis consensus équipe ou équipe miroir |
| v8.59 | Condition repair pass corrigée : `< days` au lieu de `> 0` |
| v8.60 | Parser CSV structuré : auto-détection lignes 32+ colonnes → parsing colonne-par-colonne |
| v8.61 | **PDF.js CDN** : import PDF direct sans copier-coller + `vImportVerif()` vérification employé par employé |

---

## Ce qui a fonctionné ✅

### Import et parsing
- **Parser texte multi-passes** : détection nom employé, codes shifts, jours de repos
- **`hasDoubleShift(empId)`** : détection fiable des outliers (2 codes identiques consécutifs = données corrompues)
- **Consensus équipe** : remplissage des employés manquants depuis la majorité de l'équipe
- **Repair pass** : deuxième passe pour les employés avec < 30 codes (partiel)
- **Équipe miroir fallback** : LANTERI E (r6 seul) rempli depuis r13
- **Parser CSV 32+ colonnes** : auto-détection et parsing colonne-par-colonne
- **PDF.js direct** : extraction PDF dans le navigateur, 0 copier-coller

### Sécurité
- **`esc()`** : protection XSS sur tous les innerHTML avec données utilisateur
- **Suppression mots de passe en clair** : stockage hashé uniquement
- **Session TTL 8h** : déconnexion automatique après inactivité
- **Rate-limiting PIN** : verrouillage progressif [30s, 2min, 10min, 1h, 24h]

### Données
- **SEED Avril 2026** : 258 employés × 30 jours, protégé contre écrasement par import réel
- **`toMo`** : désactivation employé à partir d'un mois (LEMONNIER PH)
- **Journal d'audit** : trace toutes modifications manuelles admin (max 500 entrées)
- **Export CSV** : planning exportable depuis la vue admin

### UI
- **Drag & drop PDF** : zone de dépôt visible dans la vue import
- **`vImportVerif()`** : grille 30 jours par employé avec code-couleur + clic pour corriger
- **`vStats`** : navigation multi-mois, groupes par équipe
- **`hardReset`** : télécharge backup JSON avant nettoyage localStorage

---

## Ce qui n'a pas fonctionné / Problèmes rencontrés ❌

### Parser PDF texte (v8.50–v8.55)
- **Problème** : Le texte copié-collé depuis iOS donnait des formats ambigus (espaces insécables, lignes fusionnées)
- **Résolution** : PDF.js en v8.61 évite entièrement le copier-coller

### Détection outliers (v8.56)
- **Problème** : `hasDoubleShift()` basé sur consensus échouait si consensus = 2 sources (COURTIN F avait agreement 100% sur j1 avec CLAVE C)
- **Résolution** : Réécriture en pattern-based (v8.57) — détecte `14/19 14/19`, `RH RH`, `16/22 16/22` directement

### Repair pass (v8.58→v8.59)
- **Problème** : Condition `> 0` excluait les employés avec 1–4 codes (partiel) du repair pass
- **Résolution** : Changé en `>= days` (skip si déjà complet)

### Edits Python nécessaires
- Plusieurs `Edit` tool ont échoué sur `index.html` en raison de séquences Unicode échappées (`\u00e9` vs `é`) dans le fichier
- **Résolution** : Utilisation de `python3 -c` pour les remplacements complexes (lecture UTF-8, substitution string, réécriture)

### Fonctions orphelines découvertes (nettoyage v8.62)
- `setChef()`, `addChef()`, `removeChef()` : définies mais jamais appelées (remplacées par `pickChef()`)
- `parseCMCPlanningFromRows()` : wrapper de compatibilité non référencé
- `detectMonthFromName()`, `detectTeamFromRow()` : helpers de parsing ancien non appelés
- `repairBJSchedules()` : ancienne fonction de réparation pré-`hasDoubleShift`, non appelée
- `splitTwoEmpLines()` : appelée comme IIFE dans `doImport`, donc **à garder**

---

## Architecture technique clé

### Pattern SPA monofichier
```
index.html
├── <style>      ~9 KB CSS embarqué
├── <body>
│   ├── #app     point de montage principal
│   ├── #toast   notifications
│   ├── #pk      overlay sélection
│   └── #ov      overlay modal
└── <script>     ~350 KB JS vanilla
```

### Objet d'état global `A`
```javascript
var A = {
  user: null,          // employé connecté
  view: "planning",    // vue courante
  year: 2026,
  month: 3,            // 1-indexé (avril = 3 dans le système interne)
  employees: [...],    // 258 employés
  teams: [...],
  overrides: {},       // "2026-3" → {eid → {jour → code}}
  passwords: {},       // mots de passe hashés
  showLeg: false,
  chatMsgs: [...]
};
```

### Constantes critiques
```javascript
var AID      = "U11804";   // Admin = DESARZENS K (équipe 5)
var DATA_VER = 29;         // Incrémenter + migration si schéma change
var APP_VER  = "v8.61";    // Affiché dans l'UI
```

### Clés localStorage
| Clé | Contenu |
|-----|---------|
| `cmc_e` | Tableau employés |
| `cmc_t` | Tableau équipes |
| `cmc_ov` | Overrides planning |
| `cmc_pw` | Mots de passe hashés |
| `cmc_chat` | Messages chat |
| `cmc_chef_eq` | Map chefs d'équipe |
| `cmc_chefs_t` | Chefs par tour (ordre départ) |
| `cmc_admin_pin` | Hash PIN admin |
| `cmc_lastread` | Timestamp dernier message chat lu |
| `cmc_ref_YYYY-M` | Référence import PDF du mois |
| `cmc_audit` | Journal modifications admin (max 500) |
| `cmc_pin_fails` | Compteur échecs PIN `{count, until}` |
| `cmc_lastact` | Timestamp dernière activité (session TTL) |
| `cmc_uid` | ID employé connecté (persiste entre rechargements) |
| `cmc_dver` | Version schéma stockée |

### Fonctions critiques
```javascript
// Rendu
render()           // Re-rend tout #app
dc()               // Re-rend seulement #content (plus rapide)
sv(view)           // Changer de vue + dc()

// Planning
gpl()              // Planning courant (overrides + genBase fallback)
genBase(y, m)      // Planning théorique via EP + REPOS
moOff(y, m)        // Offset mois depuis mars 2026
cumWorkDays(t, mo) // Jours ouvrés cumulés pour une équipe
isEmpActive(e,y,m) // Filtre employés actifs (toMo)

// Import
doImport()                  // Parse texte/CSV/PDF converti, remplit overrides
handleFileImport(input)     // Détecte PDF→PDF.js, CSV→doImport direct
_extractPdfLines(file, cb)  // Extraction PDF via PDF.js (Y-grouping)
hasDoubleShift(empId)       // Détecte outlier (2 codes identiques consécutifs)
runVerification(y,m,ref)    // Compare planning vs référence PDF

// Sécurité
esc(s)             // Échappe HTML (anti-XSS) — TOUJOURS utiliser avant innerHTML
hashPw(pw)         // Hash simple (non cryptographique, OK intranet)
touchSession()     // Renouvelle TTL session

// Stockage
lg(key, fallback)  // localStorage.getItem + JSON.parse
ls(key, value)     // localStorage.setItem + JSON.stringify
saveOv()           // Sauvegarde overrides + trace audit

// Admin
hardReset()        // Backup JSON + nettoyage complet localStorage
runAudit(y, m)     // Vérification complète effectifs
```

---

## Taille des blocs de code

| Bloc | Taille approx. |
|------|---------------|
| `SEED_APR2026` | ~76 KB (258 emp × 30 jours) |
| `DEF_EMP` | ~27 KB (258 employés) |
| `EP` (profils shift) | ~6 KB |
| `DEF_CHEFS_T` | ~3 KB |
| CSS | ~9 KB |
| **Total** | **~360 KB** |

---

## Codes de planning valides

| Code | Signification |
|------|--------------|
| `22/6` | Nuit 22h–6h |
| `19/4` | 19h–4h |
| `16/3` | 16h–3h |
| `14/19` | 14h–19h |
| `20/5` | 20h–5h |
| `16/22` | 16h–22h |
| `RH` | Repos hebdomadaire (1er jour) |
| `R` | Repos (2e jour) |
| `RRT` | Récupération |
| `CP` | Congé payé |
| `M` | Maladie |
| `AF` | Formation |

Codes CDP : suffixe `*` → `20/5*`, `16/3*`, etc.

---

## Patterns de repos par équipe BJ (Avril 2026)

| Équipes miroirs | Jours de repos |
|-----------------|---------------|
| 1 ↔ 6 | 5, 6, 11, 12, 17, 18, 23, 24, 29, 30 |
| 2 ↔ 7 | 3, 4, 9, 10, 15, 16, 21, 22, 27, 28 |
| 3 ↔ 8 | 1, 2, 7, 8, 13, 14, 19, 20, 25, 26 |
| 4 ↔ 9 | 2, 3, 8, 9, 14, 15, 20, 21, 26, 27 |
| 5 ↔ 10 | 4, 5, 10, 11, 16, 17, 22, 23, 28, 29 |

---

## Problèmes connus / À faire

1. **`cumWorkDays()` cycle 30 jours** : mois de 31 jours → +1 jour ouvré possible pour équipes 3 et 8. Non corrigé (risqué).
2. **Équipes BJ 1–4, 6–10** : profils EP non audités pour désynchronisation (seule l'équipe 5 a été validée).
3. **PDF.js Y-tolerance = 3pt** : peut mal grouper des lignes très proches dans certains PDF. Ajuster TOL si nécessaire.
4. **`hashPw()`** : hash simple non cryptographique — acceptable pour intranet, pas pour prod publique.
5. **Fonctions orphelines** (supprimées en v8.62) : `setChef`, `addChef`, `removeChef`, `parseCMCPlanningFromRows`, `detectMonthFromName`, `detectTeamFromRow`, `repairBJSchedules`.

---

## Workflow de développement

### Ajouter une vue
1. Créer `vMaVue()` retournant une string HTML
2. Ajouter `case"maVue": return isAdm?vMaVue():"";` dans le `switch` de `vMain()`
3. Si accessible non-admin : supprimer la condition `isAdm`
4. Naviguer : `A.view="maVue"; dc();` ou via `sv('maVue')`

### Modifier les données employés/équipes
- Toujours sauvegarder : `ls("cmc_e", A.employees)` / `ls("cmc_t", A.teams)`
- Si schéma change : incrémenter `DATA_VER` + ajouter bloc migration au démarrage

### Déployer
```bash
git add index.html
git commit -m "vX.Y: description en français"
git checkout main
git merge claude/<branche> --ff-only
git push origin main
# → GitHub Actions déploie automatiquement
```

### Valider la syntaxe JS
```bash
node -e "
const fs=require('fs');
const html=fs.readFileSync('index.html','utf8');
const s=html.lastIndexOf('<script>'),e=html.lastIndexOf('</script>');
fs.writeFileSync('/tmp/test.js',html.slice(s+8,e));
" && node --check /tmp/test.js && echo "JS OK"
```

### Éditer du code avec Unicode (éviter les échecs Edit tool)
```python
# Si l'Edit tool échoue à cause d'Unicode :
python3 -c "
with open('index.html','r',encoding='utf-8') as f: c=f.read()
c=c.replace('ancien texte','nouveau texte',1)
with open('index.html','w',encoding='utf-8') as f: f.write(c)
print('Done')
"
```

---

## Simulation équipe 5 avril 2026 (validée)

```
i=2, cumWorkDays("5",1)=21, si0=(2+21)%4=3
Séquence ["20/5","19/4","16/3","14/19"], si0=3 → D01=14/19

PUGNETTI S:   D01:14/19  D02:20/5   D03:19/4  D04:RH  D05:R  D06:16/3
DESARZENS K:  D01:14/19  D02:20/5*  D03:19/4  D04:RH  D05:R  D06:16/3*
MARIOTTINI J: D01:14/19  D02:20/5   D03:19/4  D04:RH  D05:R  D06:16/3
DESSI F:      D01:14/19  D02:20/5*  D03:19/4  D04:RH  D05:R  D06:16/3*
✅ Même shift de base, 3 avril = 19/4 confirmé
```
