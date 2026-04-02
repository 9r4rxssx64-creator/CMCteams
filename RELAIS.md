# Document Relais — CMCteams v8.15
*Dernière mise à jour : 2 avril 2026*

---

## État actuel de l'application

- **Version** : `APP_VER = "v8.15"`, `DATA_VER = 22`
- **Fichier principal** : `index.html` (~290 KB, tout-en-un HTML+CSS+JS)
- **Déployé sur** : GitHub Pages (branche `main` → déploiement automatique)
- **258 employés** : BJ (équipes 1–10), Roulette (r1–r13), CMC (c1–c13)

---

## Ce qui a été fait dans ces sessions

### ✅ Corrections de plannings
- **ARCURI F (U00030)** : planifiée à partir du 17 avril avec sa rotation exacte
  `j17=20/5, j18=19/4, j19=16/22, j20=14/19, j21=RH, j22=R, j23=22/6, j24=19/4, j25=16/3, j26=14/19, j27=RH, j28=R, j29=20/5, j30=19/4`
- **LEMONNIER PH** : retiré de la ligne de départ équipe 5 → apparaît dans "Absents tout le mois"
- SEED Avril 2026 complété : 258 × 30 jours, aucune cellule vide, tous codes valides

### ✅ Bug critique corrigé — doImport() (v8.14)
**Problème** : `A.overrides[key] = {}` à la ligne 2519 effaçait TOUT le SEED quand on importait un PDF.  
**Fix** : Pour Avril 2026, l'import part maintenant du SEED complet, puis écrase uniquement les employés présents dans le PDF. Les absents du PDF conservent leur horaire seed (M, AF, CP, etc.).

```javascript
// AVANT (bugué) :
A.overrides[key] = {};

// APRÈS (corrigé) :
if(key === "2026-3" && typeof SEED_APR2026 !== "undefined") {
    A.overrides[key] = JSON.parse(JSON.stringify(SEED_APR2026));
} else {
    if(!A.overrides[key]) A.overrides[key] = {};
}
```

### ✅ Nettoyage des employés fantômes (v8.14)
- `DATA_VER` passé de 21 à 22 → migration forcée au premier chargement
- La migration supprime les employés `_imported` créés par les anciens imports ratés

### ✅ Section "Absents tout le mois" (v8.15)
- Les employés sans aucun jour travaillé **ne s'affichent plus** dans leurs tableaux de départ
- Ils apparaissent uniquement dans la section "Absents tout le mois" triée par :
  - 🏥 Maladie (M) : LEMONNIER PH, SIRIO S
  - 📚 Formation (AF) : BONO F, CATTALANO C, GARINO Y, KOVACS V
  - 🌴 Congé (CP) : DESSI P, ELIODORI V, MARIANI M, PEREIRA MACENA F, RICORDO B
  - 🛌 Repos tout le mois : BONO V

### ✅ Audit post-import automatique (v8.14)
Après chaque import PDF, l'app affiche :
- 🟡 Employés absents du PDF (liste avec leur planning conservé)
- 🔴 Employés sans aucun horaire (erreur critique)
- 🔵 Employés sans ligne de départ

### ✅ Écran Audit autonome (v8.14)
Admin → 🔍 Audit : vérification complète à tout moment sans import.
- Détection de noms similaires dans le PDF (algo bigrams)
- Bouton "Supprimer" par employé

### ✅ Lignes de départ roulette complètes (v8.13)
DEF_CHEFS_T completé avec TOUS les membres des équipes (avant : seuls les chefs étaient listés).

---

## Audit de l'état actuel (vérifié ce jour)

### Données de base
| Contrôle | Résultat |
|----------|---------|
| DEF_EMP | 258 employés |
| SEED Avril 2026 | 258 × 30 jours, 0 vide, 0 code invalide |
| Tous les 258 ont une entrée SEED | ✅ |
| Tous ont une ligne de départ (DEF_CHEFS_T) | 257/258 — LEMONNIER PH intentionnellement absent (→ section Absents) |
| Noms fantômes dans DEF_CHEFS_T | 0 ✅ |
| Cohérence équipe DEF_EMP ↔ DEF_CHEFS_T | ✅ Toutes équipes correctes |

### ⚠️ PROBLÈME EN SUSPENS — Jours de repos BJ incohérents

**Cause** : Lors d'une session précédente, 44 employés avec plannings incomplets ont été complétés algorithmiquement avec de **mauvais templates**. Les jours de repos de ~45 employés BJ ne correspondent pas au pattern de leur équipe.

**Équipes affectées** :
| Équipe | Pattern correct | Employés incorrects |
|--------|----------------|---------------------|
| 1 | repos j5,6,11,12,17,18,23,24,29,30 | ESPAGNOL S, TOMATIS P, SIRIO J, GALLIS F, CIOCO S |
| 2 | repos j3,4,9,10,15,16,21,22,27,28 | BRASSEUR F (1 jour manquant) |
| 3 | repos j1,2,7,8,13,14,19,20,25,26 | BELTRANDI N, SOSSO G, AGLIARDI M, COSTE W, EL MISSOURI O |
| 6 | repos j5,6,11,12,17,18,23,24,29,30 | VERZELLO O, CAISSON JC |
| 7 | repos j3,4,9,10,15,16,21,22,27,28 | NIGIONI J, GALLIS J, FARRUGIA VALERI S, MALGHERINI T |
| 8 | repos j1,2,7,8,13,14,19,20,25,26 | MAGAGNIN J, PETIT T, COURTIN F, CLAVE C, NICASTRO M, BONETTI P, CAMPI PH, COTTALORDA D |
| 9 | repos j2,3,8,9,14,15,20,21,26,27 | PASTOR P, BERNARDI JE |
| 10 | repos j4,5,10,11,16,17,22,23,28,29 | PASSERON G, ROSSI J |

**Équipes correctes** : 4, 5 (peu de données) ; 6 (3/5) ; 9 (3/5) ; 10 (3/5)

---

## 🎯 Par où commencer la prochaine fois

### Étape 1 — PRIORITÉ ABSOLUE : Réimporter le planning Avril V2

C'est la **seule solution fiable** pour corriger les jours de repos erronés.

1. Ouvrir l'app → Admin → Import planning
2. Coller le texte copié du PDF Avril V2
3. L'import corrigera automatiquement les plannings des employés trouvés dans le PDF
4. Vérifier le rapport d'import :
   - ✅ Employés importés avec bon planning
   - 🟡 Employés absents du PDF (conservent leur planning seed)
5. Aller dans Admin → 🔍 Audit pour voir ce qui reste à corriger

### Étape 2 — Vérifier les employés absents du PDF

Après import, l'audit listera les employés non trouvés dans le PDF. Pour chacun :
- S'il est malade/formation/congé → son horaire M/AF/CP dans le seed est déjà correct ✅
- S'il devrait être dans le PDF mais n'y est pas → vérifier l'orthographe du nom dans le PDF

### Étape 3 — Valider visuellement

Ouvrir la vue Planning → chaque équipe BJ doit avoir des colonnes de repos identiques pour tous ses membres.

---

## Structure technique clé

### Fichiers
```
index.html          # L'APPLICATION ENTIÈRE (~290 KB)
CLAUDE.md           # Instructions pour l'IA
RELAIS.md           # CE DOCUMENT
.github/workflows/deploy.yml  # Deploy auto sur GitHub Pages
```

### Variables globales importantes
```javascript
var AID      = "U11804";   // Admin : DESARZENS K
var DATA_VER = 22;         // Version schema localStorage
var APP_VER  = "v8.15";    // Version affichée
var MFR      = [...]        // Noms des mois en français (1-indexé)
```

### Clés localStorage
| Clé | Contenu |
|-----|---------|
| `cmc_e` | Tableau des employés |
| `cmc_t` | Tableau des équipes |
| `cmc_ov` | Overrides planning (SEED + imports) |
| `cmc_pw` | Mots de passe hashés |
| `cmc_chefs_t` | Ordre de départ par équipe |
| `cmc_ref_YYYY-M` | Référence brute du dernier import |
| `cmc_dver` | Version schema stockée |

### Fonctions critiques
```javascript
// Planning (lecture)
gpl()                    // Retourne le planning courant (overrides + genBase fallback)
genBase(y, m)            // Génère planning théorique via EP + REPOS
SEED_APR2026             // Planning Avril 2026 complet (258 emp × 30 jours)

// Import
doImport()               // Import PDF texte copié-collé
doImportJSON()           // Import JSON (merge, pas d'écrasement)
runVerification(y, m, ref)  // Vérifie planning vs référence PDF + audit complet

// Audit
runAudit(y, m)           // Vérification autonome complète
vAudit()                 // Vue interface de l'audit

// Départs
vDeparts()               // Vue départs avec section "Absents tout le mois"
syncChefsT()             // Synchronise CHEFS_T depuis DEF_CHEFS_T

// Migration
migrateEmployees()        // Appelée au démarrage, force reset si DATA_VER change
```

### Structure de l'override SEED (A.overrides["2026-3"])
```javascript
{
  "U00001": { 1: "19/4", 2: "16/22", 3: "14/19", 4: "22/6", 5: "RH", 6: "R", ... },
  "U00002": { ... },
  // 258 entrées × 30 jours chacune
}
```

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
| `RH` | Repos hebdomadaire (1er jour du bloc) |
| `R` | Repos (2e jour du bloc) |
| `RRT` | Récupération/repos |
| `CP` | Congé payé |
| `M` | Maladie |
| `AF` | Formation |

Codes CDP (départ prioritaire) : suffixe `*` → ex. `20/5*`

---

## Patterns de repos par équipe BJ (Avril 2026)

Les jours de repos doivent être identiques pour tous les membres d'une même équipe :

| Équipe | Jours de repos en avril |
|--------|------------------------|
| 1 et 6 | 5, 6, 11, 12, 17, 18, 23, 24, 29, 30 |
| 2 et 7 | 3, 4, 9, 10, 15, 16, 21, 22, 27, 28 |
| 3 et 8 | 1, 2, 7, 8, 13, 14, 19, 20, 25, 26 |
| 4 et 9 | 2, 3, 8, 9, 14, 15, 20, 21, 26, 27 |
| 5 et 10 | 4, 5, 10, 11, 16, 17, 22, 23, 28, 29 |

*(Les équipes miroirs 1↔6, 2↔7... ont les mêmes jours de repos mais des séquences de shifts différentes)*

---

## Commandes utiles pour l'IA (Claude)

```bash
# Vérifier la syntaxe JS
node --check /tmp/test.js

# Extraire et valider le JS de l'app
node -e "
const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const s = html.lastIndexOf('<script>'), e = html.lastIndexOf('</script>');
fs.writeFileSync('/tmp/test.js', html.slice(s+8, e));
" && node --check /tmp/test.js

# Audit Python du SEED
python3 audit_seed.py  # (script à créer si besoin)

# Déployer
git add index.html && git commit -m "vX.Y: description" && git push origin main
```

---

## Historique des versions récentes

| Version | DATA_VER | Description |
|---------|----------|-------------|
| v8.10 | 19 | ARCURI F planning exact depuis j17 |
| v8.11 | 20 | LEMONNIER PH → section Absents tout le mois |
| v8.12 | 21 | 44 employés incomplets corrigés (258 × 30 jours) |
| v8.13 | 21 | DEF_CHEFS_T roulette : tous membres ajoutés (41 employés) |
| v8.14 | 22 | **doImport() corrigé** : plus d'écrasement du SEED + Audit post-import + Écran Audit autonome |
| v8.15 | 22 | Absents tout le mois : exclusion auto des tableaux de départ, tri M→AF→CP→R |
