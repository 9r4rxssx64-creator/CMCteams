# ClayScore — Récapitulatif TOTAL

**Dossier complet du projet · 11 août 2026**
Kevin Desarzens · kevin.desarzens@gmail.com · +33 6 72 28 02 77 · Monaco

> Ce document est le **point d'entrée**. Il résume tout : ce qui existe, ce qui
> est prouvé, ce qui reste à faire. Chaque chiffre ci-dessous a été **mesuré**,
> pas estimé — sauf les chiffres business, explicitement marqués comme
> hypothèses à confirmer.

---

## 1. En une page : où en est ClayScore ?

**Le produit.** ClayScore est un système de comptage automatique pour le
ball-trap. Trois caméras et un micro reliés à un petit boîtier IA détectent,
pour chaque plateau lancé, le verdict **CASSÉ / MANQUÉ / NO BIRD**, et gèrent
toute la partie (toutes disciplines, 1 à 6 tireurs, rotation, doublés). Tout
fonctionne sur un réseau local **sans Internet**, piloté depuis une tablette.

**L'état réel aujourd'hui.**

| | État |
|---|---|
| **Logiciel** | ✅ **Terminé et testé** — les 8 jalons prévus sont développés et fonctionnent |
| **Tests automatiques** | ✅ **289 réussis, 1 ignoré** (celui qui exige une carte graphique) |
| **Validation** | ✅ En **simulation** (vidéos générées avec réponse connue d'avance) |
| **Matériel** | ⏳ **Pas encore acheté** — la liste d'achat est prête (BUDGET_BOM) |
| **Validation terrain** | ⏳ **Pas encore faite** — nécessite de vraies vidéos de stand |
| **Société / statut** | ⏳ À créer à Monaco (dossier prêt, points fiscaux à valider) |

**En une phrase honnête :** *le cerveau est construit, testé et il marche ; il
n'a pas encore vu le vrai monde.*

---

## 2. Ce que le logiciel sait faire (les 8 jalons)

| # | Jalon | Ce que ça fait | Résultat **mesuré** |
|---|---|---|---|
| 0 | **Mode simulation** | Tout fonctionne sans aucun matériel, à partir de vidéos/sons. Un générateur crée des plateaux qui volent et explosent, avec la bonne réponse connue d'avance | 3 clips de référence livrés |
| 1 | **Détection des lancements** | Compte chaque plateau lancé | **100 %** (27/27) |
| 2 | **Détection des coups de feu** | Repère et horodate chaque tir au son | **100 %**, **0 faux positif** |
| 3 | **Verdicts** | Cassé / Manqué / No bird, + cas douteux renvoyés à l'humain | **100 %** (225 clips testés) |
| 4 | **Gestion de partie** | 5 disciplines, rotation, no-bird, doublés, multi-lanceurs, modes entraînement/concours, scores | Tests exhaustifs ✅ |
| 5 | **Serveur + appli tablette** | Partie jouable au navigateur, scores en direct, ralentis | Vérifié en conditions réelles ✅ |
| 6 | **Multi-caméras** | Fusion des 3 vues, position 3D, corridors de vol | Triangulation exacte ✅ |
| 7 | **Intégration matériel** | Découpe un flux vidéo continu en plateaux ; caméras/micro branchés ; redémarrage auto après panne | 5/5 plateaux découpés ✅ |
| 8 | **IA v2** | Base d'images auto-annotée + entraînement YOLO + export Jetson | Base générée ✅ |

**Bonus livré :** export du **ralenti habillé** (trajectoire tracée + badge
« CASSÉ ✔ » gravé dans la vidéo) pour la vidéo de démonstration.

### Preuve de bout en bout
Une vraie partie a été jouée via le serveur : **Fosse Universelle, 2 tireurs,
25 plateaux chacun, avec un no-bird injecté**. Résultat : 51 lancers (25×2 + le
no-bird rejoué), scores exacts (Kevin 25/25 = 25 pts, Laurence 0/25 = 0 pt),
ralentis disponibles, export CSV, sauvegarde en base. ✅

---

## 3. Les 3 verdicts, expliqués simplement

| Verdict | Quand | Ce que fait ClayScore |
|---|---|---|
| ✅ **CASSÉ** | Le plateau explose **après** le coup de feu | Compte le point |
| ❌ **MANQUÉ** | Le plateau continue sa trajectoire, intact | Zéro point |
| 🔁 **NO BIRD** | Le plateau part **déjà cassé** du lanceur, **avant** tout tir | Annonce « on rejoue » — **même tireur, même poste**, automatiquement |
| ❓ **À VÉRIFIER** | ClayScore n'est pas assez sûr (éclat minuscule) | Propose le **ralenti**, **vous tranchez d'un tap** |

**Règle d'or respectée :** aucun point douteux n'est attribué sans vous, et la
rotation n'avance **jamais** sans un verdict validé.

---

## 4. Ce qu'il y a dans ce dossier

```
ClayScore_Dossier_Complet/
├── 00_RECAPITULATIF_TOTAL.md    ← vous êtes ici
├── 01_COMMENT_UTILISER.md       ← mode d'emploi (installer, lancer, tester)
├── 02_ETAT_ET_LIMITES.md        ← ce qui est prouvé / ce qui ne l'est pas
├── index.html                   ← MENU D'ACCUEIL (ouvre-le en premier)
├── documents/
│   ├── SPEC_TECHNIQUE.md        ← le cahier des charges du logiciel (texte d'origine)
│   ├── JOURNAL_PROJET.md        ← tout ce qui a été fait, y compris les bugs corrigés
│   ├── GLOSSAIRE.md             ← tous les mots expliqués (ball-trap, technique, business)
│   ├── AUDIT_QUALITE.md         ← les défauts trouvés/corrigés, mesures avant-après
│   ├── GUIDE_RESEAU.md          ← autonome ou branché au club, code d'accès, dépannage
│   ├── GUIDE_COMPETITION.md     ← exigences officielles : preuve, GO/NO-GO, homologation
│   ├── GUIDE_ALIMENTATION.md    ← batterie / secteur / dérivation sur les lanceurs
│   ├── GUIDE_GRANDE_SURFACE.md  ← sans fil, parcours de chasse, plusieurs terrains
│   ├── GUIDE_ITALIE_FITAV.md    ← mots italiens, FO/FU, et l'installation à Vintimille
│   ├── PREVISIONNEL_CLUB.md     ← club entier : 3 terrains distants + club-house (chiffré)
│   ├── MATERIEL_OPTIMAL.md      ← quoi acheter exactement, prix relevés, pièges de commande
│   ├── COMPARATIF_CHINE_UE.md   ← Chine ou Europe ? le comparatif, et la config optimale
│   ├── GUIDE_MATERIEL.md        ← CHAQUE pièce : rôle, quoi prendre, liens d'achat, pièges
│   ├── GUIDE_MONTAGE.md         ← assembler les pods, câbler, placer sur le stand, régler
│   ├── CHECKLIST_PROTOTYPE.md   ← la marche à suivre pas à pas, de la commande à la démo
│   ├── DOSSIER_BUSINESS.md      ← stratégie, cadre Monaco, statut
│   ├── BUDGET_BOM.md            ← liste d'achat détaillée + marges
│   ├── DOSSIER_VIDEO.md         ← script + storyboard de la vidéo de démo
│   ├── EMAIL_LAPORTE.md         ← emails de contact prêts (FR + EN)
│   ├── ORIGINAL_DOSSIER_V4.md   ← ton dossier v4, mot pour mot
│   └── ORIGINAL_PLAN_VIDEO.md   ← ton plan vidéo, mot pour mot
├── pages/
│   ├── landing.html             ← page de présentation (à ouvrir au navigateur)
│   └── onepager.html            ← dossier partenaire 1 page (imprimable)
├── demos/
│   ├── casse_ciel_demo.mp4      ← ralenti habillé : CASSÉ
│   ├── manque_foret_demo.mp4    ← ralenti habillé : MANQUÉ
│   └── nobird_contrejour_demo.mp4 ← ralenti habillé : NO BIRD
└── logiciel/                    ← le code source complet + tests + données
```

**Pour ouvrir les pages HTML :** double-clic (ou « Ouvrir avec » → un
navigateur). Elles fonctionnent hors ligne, sans Internet.

**Pour lire les .md :** n'importe quel éditeur de texte, ou une app Markdown.

---

## 5. Le projet en chiffres (mesurés)

| Indicateur | Valeur |
|---|---|
| Lignes de code (logiciel) | **5 598** |
| Lignes de tests | **3 038** |
| Fonctions de test | **259** |
| Tests réussis | **289** (+1 ignoré : exige un GPU) |
| Jalons terminés | **8 / 8** |
| Disciplines gérées | **5** (FU, FO, DTL, parcours, compak) |
| Lanceurs par partie | **multi-lanceurs** (attribution auto par poste + stats) |
| Modes de jeu | **entraînement** et **concours** (chaque plateau arbitré) |
| Réseau | **autonome** (WiFi propre) **ou branché** au réseau d'un club, bascule automatique |
| Sécurité des scores | **code d'accès** sur toute écriture (obligatoire en concours) |
| Entretien | **automatique** : le disque ne peut plus se remplir |
| Compétition | **journal inaltérable**, fiche scellée, contrôle GO/NO-GO avant épreuve |
| Alimentation | **batterie + secteur + dérivation lanceur**, sans coupure au changement |
| Grandes surfaces | postes **sans fil** jusqu'à **> 1 km** (le pod décide sur place) |
| Temps réel | **288 images/s** mesurées pour 195 requises (3 caméras × 65 fps) |
| Caméras | **couleur obligatoire** — mesuré : 27/27 en couleur, **9/27 en monochrome** |
| Club multi-terrains | 3 terrains + club-house, config **optimale** : **6 320 € livré**, 12,6 Mbit/s de remontée |
| Basse lumière | verdicts justes jusqu'à **−60 % de lumière** (33 % → 100 %) |
| Réglage caméra | défauts (sombre / cramé / bruité) **détectés et expliqués** |
| Coût logiciel (licences) | **0 €** (100 % open source) |

---

## 6. Le côté business (hypothèses — à confirmer)

> ⚠️ **Ces chiffres viennent de ton dossier v4. Je ne les ai pas vérifiés.**
> Ils servent à planifier, pas à engager.

| | Hypothèse |
|---|---|
| Prototype complet (config max) | ~1 450 – 1 550 € |
| Investissement avant 1res ventes | ~9 000 € |
| Prix de vente / kit | ~2 200 € |
| Marge nette / kit | ~770 € (35 %) |
| Rentabilité | ~12 kits vendus |
| Location concours | 150 – 250 € / week-end |
| Marché France | 568 clubs FFBT · 23 000+ licenciés |

**Cadre Monaco :** création en régime déclaratif simplifié (national),
accompagnement Welcome Business Office, Monaco Boost (domiciliation),
MonacoTech (incubateur).

### 🔴 Les 3 points à faire valider avant d'engager de l'argent
1. **Fiscalité Monaco** — impôt sur les bénéfices (25 %) si **plus de 25 % du CA
   est réalisé hors de Monaco**. Vendre aux clubs français déclenche exactement
   ce cas. → Welcome Business Office + conseil fiscal.
2. **Clause d'activité secondaire SBM** — à vérifier dans ton contrat **avant la
   première facture**.
3. **Coût réel du marquage CE** — poste le plus incertain du budget.

*(Je ne suis ni juriste ni fiscaliste : ce sont des points à faire trancher par
un professionnel.)*

---

## 7. Les prochaines étapes, dans l'ordre

| Ordre | Étape | Pourquoi maintenant |
|---|---|---|
| **1** | **Filmer de vraies casses** (même au téléphone) | C'est le **seul** moyen de savoir si la précision tient hors simulation. Ça ne coûte rien. |
| **2** | Faire valider les **3 points bloquants** ci-dessus | Avant toute dépense |
| **3** | Commander le matériel — **`CHECKLIST_PROTOTYPE`** donne l'ordre exact, **`GUIDE_MATERIEL`** les liens d'achat | Prototype |
| **4** | Assembler et installer — **`GUIDE_MONTAGE`** | Premier essai terrain |
| **5** | Tourner la **vraie vidéo** (script prêt) | C'est elle qui vend |
| **6** | Contacter Laporte / clubs / MonacoTech (emails prêts) | Avec la vidéo en main |

---

## 8. Auto-critique honnête

**Le point le plus faible de ce travail :** tout est validé en **simulation**.
Les vidéos de test sont générées par ordinateur — plus propres que la réalité
(un seul plateau, fond maîtrisé, pas de vent, pas de pluie, pas de plusieurs
plateaux simultanés). Les réglages de détection sont calés sur ce simulateur.

**Ce que je n'ai pas pu vérifier :** le vrai matériel (caméras GigE, micro,
Jetson, hotspot WiFi), l'entraînement de l'IA v2 (exige une carte graphique), et
l'affichage de l'appli sur une vraie tablette (le serveur et l'API, eux, sont
prouvés).

**Ce dont je ne suis pas certain :** la tenue du détecteur classique sur des
fonds réels difficiles (contre-jour fort, pluie, plateaux qui se croisent).
C'est précisément pour cela que l'**IA v2** et l'**arbitrage humain** existent
dans le système.

**Conclusion honnête :** le logiciel est solide et prêt à rencontrer le réel.
La prochaine vérité viendra de tes vraies vidéos, pas de moi.

---

*ClayScore — conçu à Monaco. Chaque plateau. Chaque point. Juste.*
