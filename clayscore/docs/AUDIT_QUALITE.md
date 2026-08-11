# ClayScore — Audit qualité commerciale

**Objectif : « zéro erreur, qualité commercialisable ». Voici ce qui a été
cherché, ce qui a été trouvé, ce qui a été corrigé — et ce qui reste vrai.**

Date : 11/08/2026 · Version : 0.10.0

> **Règle appliquée : mesurer, jamais estimer.** Chaque chiffre ci-dessous
> vient d'une commande exécutée, pas d'une impression.

---

## Résultat en une ligne

**5 défauts réels trouvés, dont 3 qui auraient posé problème en clientèle.
Tous corrigés, chacun avec un test qui empêche le retour du bug.**

| | Avant | Après |
|---|---|---|
| Tests automatiques | 130 | **224** |
| Alertes de qualité de code | 10 | **0** |
| Précision (lancements / coups de feu / verdicts) | 27/27 · 27/27 · 27/27 | **inchangée : 100 %** |
| Recette de bout en bout | — | **18/18 contrôles** |

---

## Les défauts trouvés

### 🔴 1. Le serveur se figeait pendant chaque analyse

**Mesuré** : pendant l'analyse d'un plateau, une **2ᵉ tablette** mettait
**530 ms** à répondre au lieu de 41 ms — **13× plus lent**. Sur du vrai
matériel (capture + vidéo), c'est bien pire.

**Ce que ça donnait en vrai** : l'écran TV du club-house se fige à chaque
plateau, la 2ᵉ tablette ne réagit plus, les scores en direct saccadent.
Inacceptable pour un produit vendu.

**Cause racine** : le verrou interne était gardé **pendant toute l'analyse**
(~1 s). Tout le reste attendait derrière.

**Correction** : l'analyse se fait désormais **hors du verrou**, et les
traitements lourds (analyse, habillage vidéo, écriture en base) tournent dans
un fil séparé.

**Vérifié après correction** : **530 ms → 2,7 ms**. Le serveur reste réactif.

---

### 🔴 2. Un nom de tireur pouvait exécuter du code (faille XSS)

Les noms saisis étaient insérés **tels quels** dans la page, à 6 endroits
(tableau des scores, écran TV, historique, fiche finale).

**Ce que ça donnait en vrai** : quelqu'un s'inscrit sous le nom
`<img src=x onerror=...>` et son code s'exécute **sur toutes les tablettes et
sur l'écran TV du club-house**. Sur le réseau partagé d'un club, c'est une
porte ouverte.

**Correction** : échappement systématique de toute donnée saisie.
**Test** : parcourt le code de l'appli et **échoue** si un nom est inséré sans
échappement — la faille ne peut plus revenir par inadvertance.

---

### 🔴 3. Aucune protection des scores sur un réseau partagé

Tant que le boîtier créait son propre WiFi, le réseau restait privé. Dès qu'on
le branche sur le réseau d'un club — ce qui est désormais prévu — **n'importe
qui sur ce réseau pouvait changer un score** depuis son téléphone.

**Correction** : un **code d'accès** protège toutes les écritures (nouvelle
partie, lancer, verdict, enregistrement). Les lectures restent libres (écran
TV, spectateurs, historique).

**Vérifié sur un vrai serveur** : sans code → refusé ; mauvais code → refusé ;
bon code → accepté ; lecture → toujours libre.

---

### 🟠 4. Le disque se remplissait sans limite

Chaque plateau produit un ralenti. **Rien ne les supprimait jamais.**

**Ce que ça donnait en vrai** : au bout de quelques saisons, le disque est
plein — et la panne tombe forcément au pire moment : à l'écriture d'un clip,
en pleine compétition.

**Correction** : entretien automatique après chaque plateau (600 clips /
5 Go max, les plus anciens partent en premier). **Le clip que l'arbitre est en
train de regarder n'est jamais supprimé.** Les scores, eux, ne sont jamais
touchés (ils sont en base, quelques kilo-octets par partie).

---

### 🟠 5. Deux tablettes pouvaient lancer deux plateaux à la fois

Si deux arbitres appuyaient en même temps, **deux plateaux** étaient consommés
pour un seul lancé réel — donc un plateau fantôme dans la fiche.

**Correction** : un seul plateau analysé à la fois ; le second reçoit un
message clair. **Test** : 4 appuis simultanés → 1 accepté, 3 refusés.

---

### 🟡 Défauts mineurs corrigés au passage

- Base de données accédée depuis plusieurs fils **sans verrou** → verrou ajouté
  (indispensable maintenant que les écritures sont déportées).
- `?limit=1000000000` sur l'historique n'était pas borné → plafonné à 500.
- 10 alertes de qualité de code (imports et variables inutilisés) → **0**.
- Le mot de passe WiFi passé au script hotspot était **ignoré** → il est
  maintenant appliqué, avec refus des mots de passe de moins de 8 caractères.

---

## Ce qui a été vérifié et qui allait déjà bien

| Contrôle | Résultat |
|---|---|
| Secrets (clés, mots de passe) dans le code | **aucun** |
| Traversée de répertoire sur les vidéos (`/clips/../../etc/passwd`) | **bloquée** |
| Codec des ralentis | **H.264** — lisible iPhone et navigateur |
| Le service worker ne sert jamais de score périmé | **confirmé** |
| Reprise après coupure de courant en pleine partie | **la partie repart où elle en était** |
| `except:` masquant des erreurs | **aucun** |
| Comptage avec no-bird rejoués | **12 plateaux pour 12, exact** |
| Mode concours : validation auto | **désactivée d'office** |

---

## Recette complète (exécutée sur un vrai serveur)

Partie de A à Z : 2 tireurs, mode concours, 2 lanceurs, 13 lancers dont
1 no-bird rejoué, en 8,4 secondes.

```
== SÉCURITÉ ==            écriture sans code refusée · mauvais code refusé · lecture libre
== RÉSEAU ==              mode réseau actif · http://clayscore.local:8000 · code exigé
== PARTIE ==              partie créée · fiche officielle · validation auto coupée
                          partie terminée · 12 plateaux comptés pour 12
== SORTIES ==             CSV · enregistrement en base · historique · état système
== VIDÉOS ==              ralenti servi · codec H.264 · traversée de répertoire bloquée

18/18 contrôles OK
```

### Recette compétition (passe 2)

Installation réaliste : 2 postes filaires + **1 poste sans fil à 800 m**
alimenté par dérivation sur un lanceur, épreuve en mode concours.

```
== INSTALLATION ==        3 postes dont 1 sans fil à 800 m · aucun problème
                          débit total 1618 Mbit/s (le poste déporté n'envoie que 0,2)
== ALIMENTATION ==        alimenté par le lanceur, batterie en tampon
                          autonomie illimitée · rappel du convertisseur isolé
== CONTRÔLE ==            NO-GO annoncé, point manquant nommé
                          GO complet une fois les caméras sur leur réseau
== ÉPREUVE ==             épreuve concours jouée jusqu'au bout
== PREUVE ==              journal intègre (12 événements) · fiche scellée
                          fiche retouchée → sceau invalide
                          ligne supprimée → détectée

16/16 contrôles OK
```

💡 **Un point mérite d'être noté** : lors du premier passage, le contrôle a
refusé le GO parce qu'il ne trouvait **pas de réseau caméras** sur la machine
de développement. Ce n'était pas un bug — le contrôle lit l'état **réel** de
la machine, et il avait raison de refuser. C'est exactement le comportement
attendu sur un stand mal câblé.

---

## Passe 2 — niveau compétition (même journée)

Après les 5 défauts ci-dessus, une seconde passe a porté sur les exigences de
compétition, l'alimentation et les grandes surfaces. **Un défaut de conception
supplémentaire a été trouvé — dans mon propre modèle.**

### 🟠 6. Une hypothèse fausse laissait passer une installation impossible

Le premier modèle de liaison supposait qu'un poste sans fil **compressait
forcément** sa vidéo. C'est faux : une caméra industrielle envoie du **brut**
(809 Mbit/s), sauf matériel d'encodage dédié. Conséquence : le système aurait
**accepté** une installation WiFi qui ne pouvait pas fonctionner — découverte
garantie sur le terrain, après achat.

**Détecté par** un test que j'avais écrit pour vérifier le refus… et qui a
échoué. **Corrigé** : le type de flux (`brut` / `compresse` / `edge`) est
maintenant **déclaré explicitement**, jamais deviné.

**Ajouté dans cette passe** : journal inaltérable (une ligne modifiée ou
supprimée est détectée), fiche scellée, contrôle GO/NO-GO avec 8 points
bloquants testés un par un, alimentation sans coupure (batterie toujours en
ligne), et refus motivé des installations sans fil impossibles.
**+51 tests.**

---

## Passe 3 — optimisation et robustesse (même journée)

Deux défauts **majeurs** trouvés, tous deux invisibles sur le banc de test
habituel — parce qu'il teste des images propres, en petite résolution.

### 🔴 7. Le système ne tenait PAS le temps réel sur le matériel prévu

Le banc tourne sur des clips 240×180. Les vraies caméras font **1440×1080**,
soit **27× plus de pixels**. Mesuré à cette résolution :

| | images/s | 3 caméras à 65 fps (195 img/s) |
|---|---:|---|
| **Avant** | **89** | ❌ **impossible** |
| **Après** | **288** | ✅ 48 % de marge |

**Cause** : la soustraction de fond représente **73 %** du temps d'analyse, et
son coût suit le nombre de pixels.

**Correction** : les blobs sont cherchés sur une image **réduite** (rapide),
mais la **couleur reste mesurée en pleine résolution** — c'est elle qui décide
du verdict, on n'accélère que la recherche, jamais la décision.

**Un piège évité** : mesurer la précision sur le banc habituel n'aurait rien
prouvé — en 240×180, la réduction ne se déclenche jamais. J'ai donc regénéré
les clips en 1440×1080 pour exercer le vrai chemin : **18/18 avec réduction,
18/18 sans**. Sans perte, sur le bon chemin de code.

**Une optimisation refusée** : chercher les blobs en niveaux de gris serait
encore 1,8× plus rapide. Mesuré, la précision tombe de 27/27 à 26/27 — un
plateau **manqué** devenant « cassé », donc un point attribué à tort. Refusé
et documenté dans le code : aucun gain de vitesse ne vaut une erreur
d'arbitrage.

### 🔴 8. Le système devenait aveugle à la tombée du jour

Test de robustesse : on dégrade les images comme le ferait une vraie journée
(pénombre, grain, surexposition) et on regarde où ça casse.

**Résultat avant correction** : à **−40 % et −60 % de lumière**, la précision
tombait à **33 %** — c'est-à-dire le hasard. Tous les verdicts devenaient
MANQUÉ. Et c'est **la fin de journée, quand les clubs tirent le plus.**

**Cause racine** : le test de couleur utilisait des seuils **absolus**
(« rouge > 140 »). En basse lumière, le rouge passe sous le seuil et le
plateau cesse d'être « orange » pour le programme.

**Correction** : on ajoute un test fondé sur la **teinte**, qui ne change pas
quand la lumière baisse — un plateau orange reste orange, simplement plus
sombre. Bornes **choisies sur mesure**, pas au jugé : distributions relevées
sur les vrais clips (plateau en teinte 10-19, feuillage de forêt à partir de
18, ciel vers 100-106). Une borne à 25 attrapait la forêt.

| Condition (27 clips chacune) | Avant | Après |
|---|---|---|
| Conditions propres | 27/27 | **27/27** |
| Sous-exposé −40 % | 9/27 ❌ | **27/27** ✅ |
| Très sombre −60 % | 9/27 ❌ | **27/27** ✅ |
| Flou de mise au point | 27/27 | **27/27** |
| Bruit capteur fort | 27/27 | 23/27 |
| Surexposé +50 % | 27/27 | 25/27 *(0 point donné à tort)* |

**Le compromis est assumé et mesuré**, pas subi : une image trop claire ou
trop bruitée **se corrige au réglage de la caméra** (diaphragme, temps de
pose, gain) ; la tombée du jour, non. Quatre variantes ont été comparées
chiffres en main avant de retenir celle-ci — c'est la seule qui supprime
aussi le point attribué à tort.

### 🟠 9. Ces défauts de réglage sont maintenant détectés AVANT l'épreuve

Puisque pénombre, grain et surexposition se corrigent au réglage, le système
les **mesure et les signale** — avec le geste qui corrige, dans l'onglet
« Système » de la tablette. Zéro faux avertissement sur les trois fonds.

**Une alarme volontairement retirée** : je voulais aussi détecter une mise au
point ratée. Mesuré : un **ciel parfaitement net score 3,8** et une **forêt
franchement floue score 2,0** — les valeurs se chevauchent, parce que ce
chiffre dépend du contenu de la scène autant que de la netteté. Aucun seuil
ne peut trancher sur une image isolée. **Plutôt que de livrer un contrôle qui
crie au loup sur un beau ciel dégagé, la valeur est affichée comme simple
indicateur** — utile pour comparer deux réglages du même poste, pas pour
juger seule.

### 🟡 Un test instable corrigé

Le premier test de performance passait seul et échouait en suite complète
(machine chargée). Un test instable est pire que pas de test : il mesure
désormais le meilleur de 3 essais, et le garde-fou principal porte sur le
**rapport** avant/après, qui ne dépend pas de la machine.

---

## Auto-critique — ce que cet audit ne prouve pas

**Le point le plus faible** : tout reste vérifié **en simulation**. Les vidéos
sont générées par ordinateur. La précision de 100 % est celle du simulateur,
**pas celle d'un vrai stand**. Aucune correction de cet audit ne change ça.

**Ce que je n'ai pas pu vérifier :**
- Le **matériel réel** : caméras GigE, micro, Jetson, carte WiFi en point
  d'accès, jumbo frames du switch. Rien de tout ça n'existe encore.
- Le nom `clayscore.local` (mDNS) selon les tablettes — iPad le gère nativement,
  certains Android non ; l'adresse IP reste toujours affichée en secours.
- La tenue dans la durée : une journée complète de tir sans redémarrage.
- Les **pages marchandes** des liens d'achat (accès bloqué depuis
  l'environnement de développement).

**Ce dont je ne suis pas certain :**
- Les limites d'entretien (600 clips / 5 Go) sont un choix raisonnable, **pas
  une mesure** : la taille d'un vrai clip en 1440×1080 reste inconnue tant
  qu'aucune caméra n'a filmé.
- Le code d'accès protège d'un curieux sur le réseau du club. Ce **n'est pas**
  une sécurité de niveau bancaire : quelqu'un de déterminé sur le même réseau
  pourrait l'intercepter (pas de chiffrement HTTPS en local).
- « Qualité commercialisable » sur le **logiciel** : oui, à mon meilleur
  niveau. Sur le **produit complet** : non — il manque encore la preuve
  terrain, le marquage CE et un vrai boîtier.
- **« Compétition officielle » : le mot est piégeux.** Les exigences
  techniques (preuve, traçabilité, contestation, disponibilité) sont
  implémentées et testées. Mais **aucun logiciel ne s'homologue lui-même** :
  c'est une décision de fédération, et la FFBT n'a pas encore été contactée.
  Je n'ai pas pu lire les règlements (accès web bloqué). Voir
  `GUIDE_COMPETITION` — le chemin y est décrit sans détour.
- Le **pod intelligent** (qui rend le sans-fil possible) est **conçu, modélisé
  et testé en logiciel**, mais le calculateur déporté n'a jamais tourné :
  c'est du matériel non acheté. Les portées sans fil sont des ordres de
  grandeur, pas des mesures.
- Les **288 images/s** sont mesurées sur cette machine de développement. Un
  Jetson est plus lent (ARM) : divisé par 3, on retomberait à ~96 img/s, sous
  le besoin de 195. **À vérifier sur le vrai Jetson** — et si le compte n'y
  est pas, le levier existe déjà : la carte graphique du Jetson (chemin
  TensorRT du jalon 8) n'est pas encore utilisée pour la détection.
- La **robustesse est mesurée sur des dégradations simulées** (assombrissement,
  bruit gaussien). Une vraie fin de journée apporte aussi des couleurs qui
  changent, des ombres longues et des contre-jours rasants. Le sens de la
  correction est certain ; l'ampleur reste à confirmer sur de vraies images.
- Le **bruit capteur fort reste un point faible** (23/27). Il se corrige en
  baissant le gain de la caméra — le système le signale — mais je n'ai pas
  trouvé de correctif logiciel sans coût ailleurs.

---

## Pour rejouer cet audit

```bash
python3 -m pytest -q                    # 224 tests
python3 -m tools.bench --all            # précision mesurée
ruff check clayscore tools tests        # qualité de code
node --check webapp/app.js              # syntaxe de l'appli tablette
bash -n deploy/network.sh               # syntaxe des scripts
```
