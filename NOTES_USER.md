# NOTES_USER — Informations métier données par l'admin

> **Lecture obligatoire à chaque session.**
> Toutes les informations spécifiques au projet CMC Teams fournies par l'admin
> (Kevin DESARZENS / U11804). À enrichir AUTOMATIQUEMENT dès qu'une info est donnée,
> sans attendre que l'utilisateur la redemande.

---

## 👤 Identité admin

- **Nom** : Kevin DESARZENS
- **Matricule** : U11804
- **Département** : Jeux de table / Black Jack
- **Casino** : Monte-Carlo (SBM)

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
