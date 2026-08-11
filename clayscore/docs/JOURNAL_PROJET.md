# ClayScore — Journal du projet

**Tout ce qui a été construit, dans l'ordre, avec les problèmes rencontrés et
comment ils ont été résolus.** Rien n'est masqué : les erreurs figurent aussi.

---

## Vue d'ensemble

| Date | Étape | Résultat |
|---|---|---|
| 30/07/2026 | Jalons 0 → 8 (le logiciel complet) | 112 tests verts |
| 30/07/2026 | Dossier business v4 archivé | — |
| 30/07/2026 | Export ralenti habillé (demandé par le plan vidéo) | +5 tests |
| 30/07/2026 | Badge accentué + livrables business (BOM, emails, pages) | +0 test |
| 30/07/2026 | Coordonnées réelles, tout en privé | — |
| 11/08/2026 | Dossier récapitulatif total | — |
| 11/08/2026 | **Bug corrigé** : vidéos illisibles en navigateur/iPhone | +2 tests |
| 11/08/2026 | **2 écarts comblés** : multi-lanceurs + mode concours | +11 tests |
| 11/08/2026 | Guides matériel / montage / prototype + liens d'achat | — |
| 11/08/2026 | **Audit qualité commerciale** : 5 défauts réels corrigés | +18 tests |
| 11/08/2026 | **Réseau autonome OU branché au club** + code d'accès | +11 tests |
| 11/08/2026 | **Niveau compétition** : preuve, alimentation, sans fil | +51 tests |
| **Total** | | **224 tests verts** |

---

## 1. Le développement du logiciel (jalons 0 à 8)

Chaque jalon a été livré **fonctionnel et testé** avant de passer au suivant,
comme demandé dans la spécification.

### Jalon 0 — Mode simulation *(la fondation)*
Créé la couche qui rend le matériel interchangeable : le même code lit un
fichier vidéo, une webcam ou une caméra GigE. Puis un **générateur de plateaux**
(`tools/synth.py`) qui fabrique des vidéos de plateaux volant et explosant, avec
la **bonne réponse connue d'avance**. C'est ce qui permet de mesurer la
précision en chiffres, sans annoter à la main.
→ 3 clips de référence livrés (cassé / manqué / no bird).

### Jalon 1 — Détection des lancements
Soustraction de fond (MOG2) + nettoyage + composantes connexes, puis une machine
à états qui déclenche un « lancement » quand une cible apparaît en zone basse.
Toutes les tailles sont en **fraction d'image** → fonctionne quelle que soit la
résolution.
→ **27/27 = 100 %**, zéro faux positif sur fond statique.

### Jalon 2 — Détection des coups de feu
Enveloppe d'énergie (RMS) + **seuil adaptatif** (médiane + écart absolu médian) :
robuste au bruit ambiant, contrairement à un seuil fixe.
→ **27/27 = 100 %**, **0 faux positif**, timing < 100 ms.

### Jalon 3 — Verdicts *(le cœur)*
Fusion vidéo + audio sur 800 ms. **Trois difficultés rencontrées et résolues :**

1. *Le bruit du capteur passait pour une explosion.* → Solution : ne compter que
   les éclats **orange** (le bruit est gris, jamais orange).
2. *Un plateau parfois découpé en plusieurs morceaux par le détecteur passait
   pour une explosion.* → Solution : exiger une **étendue spatiale** (une vraie
   explosion s'étale ; un plateau scindé reste compact).
3. *Un plateau qui passait devant un nuage perdait sa forme ronde et le suivi
   s'arrêtait — lu à tort comme « pulvérisé ».* → Solution : suivre le plus gros
   blob **orange** plutôt que le disque « parfaitement rond ».

→ Après ces 3 corrections : **225/225 = 100 %**, confiance minimale 0,80.

### Jalon 4 — Gestion de partie
5 disciplines (FU, FO, DTL, parcours, compak). Règles strictes testées :
la rotation **n'avance jamais** sans verdict validé ; un **no-bird gèle** tout
(même tireur, même poste, et un doublé se rejoue en entier) ; un doublé exige
2 verdicts.

### Jalon 5 — Serveur + tablette
FastAPI + WebSocket (scores en direct) + appli web installable (PWA), gros
boutons, ralentis, historique en base, export CSV, mode TV.

### Jalon 6 — Multi-caméras
Triangulation stéréo (position 3D), fusion des vues, comblement des occultations,
et **calibration automatique des corridors de vol** (apprend la trajectoire
normale sur des plateaux d'essai → repère les départs anormaux).

### Jalon 7 — Intégration matériel
Le vrai chemin : **découper un flux vidéo continu** en plateaux individuels
(testé : 5 plateaux sur 5 retrouvés avec les bons verdicts). Plus : service qui
redémarre seul, hotspot WiFi, et **reprise du match après un plantage**.

### Jalon 8 — IA v2
Génération automatique d'une base d'images annotées (depuis la vérité terrain),
détecteur YOLO enfichable **avec repli automatique** sur la méthode classique si
l'IA n'est pas disponible, script d'entraînement + export Jetson (TensorRT), et
archivage des cas que tu arbitres pour ré-entraîner.

---

## 2. Les problèmes trouvés APRÈS coup (et corrigés)

### 🐛 Les vidéos ne s'ouvraient pas dans un navigateur ni sur iPhone
**Découvert le 11/08** en préparant le dossier pour ton cousin.
OpenCV écrit du **MPEG-4 Part 2**, un format que ni les navigateurs ni iOS ne
lisent. Conséquence : les ralentis affichés **dans l'appli tablette** ne se
seraient pas lus non plus — c'était un vrai défaut du produit, pas seulement du
dossier.
**Corrigé** : conversion automatique en **H.264** (via ffmpeg embarqué), avec
repli propre si ffmpeg est absent. **+2 tests** dont un qui vérifie le codec.

### 🐛 Deux fonctions annoncées dans le dossier v4 n'existaient pas
**Découvert le 11/08** en comparant point par point le dossier v4 au logiciel.
1. **Multi-lanceurs** — annoncé, absent. → Ajouté : tu déclares tes lanceurs,
   ils sont attribués automatiquement aux postes, avec statistiques par machine.
2. **Mode concours** — annoncé, absent. → Ajouté : fiche marquée officielle et
   validation automatique **désactivée d'office** (chaque plateau arbitré).
**+11 tests.**

### 🐛 Un défaut dans mon propre code, attrapé par un test
En codant les multi-lanceurs, une liste **vide** était silencieusement remplacée
par les valeurs par défaut — une faute de saisie serait passée inaperçue. Le
test l'a révélé ; la liste vide est maintenant **refusée**.

### 🐛 Une erreur de ma part sur la sauvegarde
Un `git add` lancé depuis le mauvais dossier n'a enregistré que 2 fichiers sur 6,
alors que le message annonçait les 6. Détecté par le contrôle automatique de fin
de session, **corrigé** avec un message qui explique le rattrapage.

---

### 🐛 Cinq défauts trouvés à l'audit qualité (11/08)

Audit demandé : « zéro erreur, qualité commercialisable ». Cinq défauts réels,
tous corrigés, chacun avec un test qui empêche le retour du bug.

1. **Le serveur se figeait pendant chaque analyse.** Mesuré : une 2ᵉ tablette
   attendait **530 ms au lieu de 41 ms** (13× plus lent) — l'écran TV du
   club-house se serait figé à chaque plateau. Cause : le verrou interne était
   gardé pendant toute l'analyse. Corrigé → **530 ms → 2,7 ms**.
2. **Faille XSS** : un tireur nommé `<img onerror=...>` exécutait du code sur
   toutes les tablettes et l'écran TV. Corrigé (échappement) + test qui relit
   le code de l'appli et échoue si la faille revient.
3. **Aucune protection des scores** sur un réseau partagé. Corrigé : code
   d'accès sur toutes les écritures, lectures libres.
4. **Le disque se remplissait sans limite** → panne garantie un jour, en pleine
   compétition. Corrigé : entretien automatique, le clip en cours d'arbitrage
   étant protégé.
5. **Deux tablettes pouvaient analyser deux plateaux à la fois** (plateau
   fantôme dans la fiche). Corrigé : un seul à la fois, message clair au second.

Plus : verrou manquant sur la base, historique non borné, mot de passe WiFi
ignoré par le script hotspot, et 10 alertes de qualité de code → **0**.

### 🌐 Réseau : autonome ET branchable (11/08)

Le boîtier crée son propre WiFi **ou** rejoint le réseau d'un club, et bascule
tout seul selon ce qu'il trouve. Les caméras restent **toujours** sur leur
propre réseau : le club n'est pas inondé par la vidéo, et une panne de sa box
n'arrête pas l'arbitrage. Détail complet : `GUIDE_RESEAU`.

---

### 🏆 Niveau compétition officielle (11/08)

Trois briques ajoutées, plus une erreur de conception attrapée par un test.

- **Preuve** : journal chaîné (toute modification se voit), fiche scellée,
  contrôle GO/NO-GO qui refuse de démarrer une épreuve mal préparée, et
  distinction entre verdict accepté et **correction humaine** — c'est
  exactement ce qu'un jury relit. Détail : `GUIDE_COMPETITION`.
- **Alimentation** : batterie **toujours en ligne**, rechargée par le secteur
  ou par dérivation sur un lanceur → changer de source ne coupe jamais rien.
  Détail : `GUIDE_ALIMENTATION`.
- **Grandes surfaces** : une caméra produit **809 Mbit/s** bruts — 2,4 Gbit/s
  à trois. Aucune liaison sans fil ne transporte ça. D'où le **pod
  intelligent** qui décide sur place et n'envoie que le verdict + un court
  ralenti : **0,2 Mbit/s**, donc sans fil jusqu'à plus d'un kilomètre.
  Détail : `GUIDE_GRANDE_SURFACE`.

### 🐛 Une hypothèse fausse dans mon propre modèle

Le premier modèle supposait qu'un pod sans fil *compressait forcément* sa
vidéo. C'est faux : une caméra industrielle envoie du brut, sauf matériel
d'encodage dédié. Le modèle laissait donc passer une installation impossible.
Le test l'a révélé ; le type de flux (`brut` / `compresse` / `edge`) est
désormais **déclaré explicitement**, jamais deviné.

---

### ⚡ Deux défauts majeurs trouvés en optimisant (11/08)

1. **Le système ne tenait pas le temps réel.** Le banc tourne sur des clips
   240×180 ; les vraies caméras font 1440×1080, soit 27× plus de pixels. À
   cette résolution : **89 images/s alors qu'il en faut 195** pour 3 caméras.
   Corrigé (détection sur image réduite, couleur en pleine résolution) :
   **288 images/s, 48 % de marge.** Validé sans perte en regénérant les clips
   en 1440×1080 — le banc habituel n'aurait rien prouvé, la réduction ne s'y
   déclenchant jamais.
2. **Le système devenait aveugle à la tombée du jour.** À −60 % de lumière,
   la précision tombait à **33 %** (le hasard) : tous les verdicts devenaient
   MANQUÉ. Cause : des seuils de couleur **absolus**. Corrigé par un test
   fondé sur la teinte, dont les bornes ont été relevées sur les vrais clips.
   **33 % → 100 %.**

Deux optimisations ont été **refusées après mesure** : la détection en
niveaux de gris (1,8× plus rapide mais un point attribué à tort), et une
alarme de mise au point (un ciel net score 3,8, une forêt floue 2,0 : les
valeurs se chevauchent, aucun seuil ne peut trancher).

---

## 3. Les décisions techniques importantes

| Décision | Pourquoi |
|---|---|
| Détection « classique » (MOG2) d'abord, IA ensuite | Fonctionne sans carte graphique, démarre instantanément, et sert de **filet de sécurité** si l'IA échoue |
| Tout piloté par un seul fichier de configuration | Passer au vrai matériel ne demande **aucune modification de code** |
| Suivi du plateau par la **couleur orange** | Plus robuste que la forme : un plateau flou ou partiellement caché reste orange |
| Verdict ambigu → **l'humain tranche** | Aucun point douteux attribué sans toi ; ta décision devient la vérité et nourrit l'IA |
| Générateur de plateaux avec vérité terrain | Permet de **mesurer** la précision au lieu de l'estimer |
| Zéro dépendance payante | Coût logiciel = 0 € de licence |
| Repli systématique (IA absente, ffmpeg absent, matériel absent) | **Le système ne tombe jamais en panne** à cause d'un composant manquant |
| Réseau des caméras **séparé** de celui du club | Le club n'est pas inondé par la vidéo, et sa panne réseau n'arrête pas l'arbitrage |
| Analyse faite **hors du verrou** | Une tablette qui analyse ne fige plus les autres ni l'écran TV |
| Lectures libres, **écritures protégées** par code | L'écran TV et les spectateurs voient tout ; seuls les scores sont protégés |
| Journal **chaîné** plutôt que simple fichier de log | Un score modifié après coup devient détectable par un tiers |
| Batterie **toujours en ligne** (jamais alimenté direct) | Changer ou perdre une source ne provoque aucune coupure |
| Type de flux **déclaré**, jamais deviné | Une installation sans fil impossible est refusée avant le terrain |
| Détection sur image **réduite**, couleur en **pleine résolution** | On accélère la recherche, jamais la décision |
| Couleur jugée sur les **niveaux ET la teinte** | Les deux se complètent : l'un tient en pleine lumière, l'autre à la tombée du jour |
| Mesurer et afficher plutôt qu'alarmer quand on ne peut pas conclure | Un contrôle qui crie au loup fait perdre plus de temps qu'il n'en fait gagner |

---

## 4. Ce qui reste vrai malgré tout ce travail

Le logiciel est **entièrement validé en simulation**. Les vidéos de test sont
générées par ordinateur : un seul plateau, fond maîtrisé, pas de vent ni de
pluie. **La précision réelle sur un stand n'est pas encore mesurée.**

C'est pour ça que la prochaine étape la plus utile — et gratuite — reste de
**filmer de vraies casses** au téléphone.

*(Détail complet des zones d'ombre : voir `02_ETAT_ET_LIMITES`.)*
