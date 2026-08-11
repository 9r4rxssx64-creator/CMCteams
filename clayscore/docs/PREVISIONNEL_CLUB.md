# ClayScore — Prévisionnel d'un club entier : 3 terrains distants + club-house

**Le cas de Vintimille : deux fosses olympiques, un parcours de chasse, et le
club-house un peu plus loin qui doit voir les scores et les caméras.**

> Tous les chiffres de cette page sont **calculés par le logiciel**
> (`clayscore/site.py`), pas tapés à la main. 32 tests vérifient ces calculs.
> Pour les rejouer : voir § 8.

---

## 1. Le résultat en une ligne

| | |
|---|---|
| **3 terrains** équipés + **1 club-house** | ✅ possible |
| **38 lanceurs** couverts | 15 + 15 (fosses olympiques) + 8 (parcours) |
| **10 postes de vue** (caméras) | 3 + 3 + 4 |
| **Ce qui remonte au club-house** | **12,6 Mbit/s** — score **+ retour caméra** |
| **Coût matériel total** | **≈ 4 611 €** (dont 2 721 € à prix relevés) |
| **Faisable en 3 fois** | 1 781 € → +1 291 € → +1 539 € |

---

## 2. Pourquoi ça marche (et pourquoi ce n'est pas évident)

Le piège, c'est de vouloir envoyer la vidéo au club-house.

```
   ❌ CE QUI NE MARCHE PAS
   caméra brute = 809 Mbit/s  ×3 caméras = 2 400 Mbit/s
   → aucune liaison sans fil ne transporte ça. Jamais.

   ✅ CE QU'ON FAIT
   Le calculateur reste SUR le terrain et décide sur place.
   Ce qui part au club-house :
        score / verdict ............   0,2 Mbit/s
        retour caméra (720p) .......   4,0 Mbit/s
        ────────────────────────────────────────
        par terrain ................   4,2 Mbit/s
        × 3 terrains ...............  12,6 Mbit/s   ← passe très large
```

Un pont WiFi directionnel transporte ~100 Mbit/s. On en utilise **12,6**.
Il reste donc **8× de marge** : on peut passer les trois terrains en **HD**
(36,6 Mbit/s) si un jour tu veux du ralenti exploitable sur l'écran du bar.

---

## 3. Le plan du club

```
                         ┌──────────────────────────┐
                         │       CLUB-HOUSE         │
                         │  📺 écran scores + vidéo │
                         │  mini-PC + routeur       │
                         └───▲───────▲───────▲──────┘
              pont dédié ────┘       │       └──── pont dédié
              (canal A)              │             (canal C)
                                pont dédié
                                 (canal B)
        ~250 m                    ~280 m                  ~700 m
   ┌───────────┐            ┌───────────┐          ┌────────────────┐
   │  FOSSE 1  │            │  FOSSE 2  │          │ PARCOURS CHASSE│
   │ 15 lanceurs│           │ 15 lanceurs│         │  8 lanceurs    │
   │ 3 caméras │            │ 3 caméras │          │  4 caméras     │
   │ 1 calculateur          │ 1 calculateur        │ 1 calculateur  │
   │ (câbles PoE, local)    │ (câbles PoE, local)  │ (PoE, local)   │
   └───────────┘            └───────────┘          └────────────────┘
```

**La règle d'or** : le câble ne sort jamais du terrain. À l'intérieur d'un
terrain, tout est câblé (PoE, ≤ 100 m). Entre les terrains et le club-house,
il n'y a **que du sans-fil**, et il ne transporte **que des décisions**.

⚠️ **Un pont directionnel est point-à-point.** Il en faut **un par terrain**,
sur des canaux 5 GHz différents. C'est l'erreur classique : croire qu'un seul
pont dessert tout le club. Le logiciel le signale automatiquement.

---

## 4. Terrain par terrain

### Les deux fosses olympiques — 15 lanceurs chacune

5 pédanes × **3 machines par pédane** = **15 machines**. Les trajectoires sont
donc très variées : il faut **voir large**.

| Choix | Décision | Pourquoi |
|---|---|---|
| Caméras | **3, toutes en COULEUR** | ⚠️ **mesuré** : en monochrome le banc tombe de 27/27 à 9/27 — le plateau est reconnu à son orange. Voir `MATERIEL_OPTIMAL` § 2 |
| Objectif | **8 mm** (pas 12 mm) | Sinon un plateau très latéral sort du champ |
| Liaison des caméras | **câble PoE**, 30 m | Vidéo brute : jamais sans fil |
| Alimentation | batterie 30 Ah toujours en ligne + secteur | Aucune coupure possible |

**Les deux fosses sont deux installations séparées**, pas un partage : chacune
a ses caméras et son calculateur. C'est ce qui permet de tirer sur les deux en
même temps.

### Le parcours de chasse — 8 lanceurs

Un parcours n'a **pas** de nombre de machines standard (contrairement à la FO
et la FU). J'ai pris **8** comme hypothèse de travail — **à confirmer sur
place**, c'est le seul chiffre du dossier que le règlement ne donne pas.

⚠️ **Le point à vérifier absolument** : ce prévisionnel traite le parcours
comme **un seul spot** avec 4 caméras. C'est valable si les postes de tir sont
groupés dans un rayon d'environ 50 m.

> **Si les postes sont éparpillés sur plusieurs hectares**, un parcours ne se
> couvre pas d'un bloc : il faut **une paire de caméras par poste de tir**,
> soit **+590 € par poste** (caméra + objectif + caisson + calculateur +
> batterie, cf. `BUDGET_BOM` § A-bis). C'est la seule ligne du budget qui peut
> bouger fortement. Une visite du parcours tranche en 10 minutes.

---

## 5. Le club-house

C'est la partie nouvelle : elle n'existait pas dans le kit « une fosse ».

| Matériel | Rôle | Prix cible |
|---|---|---:|
| **Mini-PC** | Reçoit les 3 terrains, agrège les scores, pilote l'écran | 200 € |
| **Écran / TV** | Affiche scores en direct + retour caméra | 250 € |
| **Routeur** | Réseau du club-house | 40 € |
| **3 ponts directionnels** (paires) | Une liaison dédiée par terrain | 255 € |

**Ce que voit le club-house :**
- les **scores en direct** des 3 terrains, côte à côte ;
- le **retour caméra** de chaque terrain (720p, ou HD si tu veux du ralenti) ;
- l'état de chaque terrain : batterie, caméras en ligne, liaison.

Tu peux couper le retour vidéo terrain par terrain : sans lui, il ne reste que
**0,2 Mbit/s** par terrain — ça passerait même en 4G.

---

## 6. Le prévisionnel matériel complet

Calculé par `Site.bom()`. Chaque prix porte sa provenance : voir `MATERIEL_OPTIMAL.md` pour la source et la date de chacun.

| Poste | Qté | Prix unit. | Total |
|---|---:|---:|---:|
| Caméra industrielle **COULEUR** | 10 | 168 € | 1 680 € |
| Objectif 8 mm | 10 | 35 € | 350 € |
| Filtre optique | 10 | 15 € | 150 € |
| Caisson étanche IP66 | 10 | 15 € | 150 € |
| Trépied / fixation | 10 | 15 € | 150 € |
| Calculateur (Jetson Orin Nano Super) | 3 | 216 € | 648 € |
| SSD NVMe 500 Go | 3 | 40 € | 120 € |
| Switch PoE | 3 | 60 € | 180 € |
| Micro (détection du coup de feu) | 3 | 25 € | 75 € |
| Batterie LiFePO4 30 Ah | 3 | 46 € | 138 € |
| Chargeur LiFePO4 | 3 | 25 € | 75 € |
| Câblage extérieur / connectique | 3 lots | 50 € | 150 € |
| Pont directionnel NanoStation 5AC Loco (paire) | 3 | 85 € | 255 € |
| Routeur club-house | 1 | 40 € | 40 € |
| **Mini-PC club-house** *(nouveau)* | 1 | 200 € | 200 € |
| **Écran club-house** *(nouveau)* | 1 | 250 € | 250 € |
| **TOTAL MATÉRIEL** | | | **4 611 €** |

> ⚠️ **Ce ne sont pas des devis.** **2 721 €** correspondent à des offres
> publiques réellement relevées (caméra, calculateur, batterie, pont) ; les
> **1 890 €** restants sont encore des hypothèses de planification. Le détail
> ligne par ligne, avec la source et la date de chaque prix relevé, est dans
> **`MATERIEL_OPTIMAL.md`**. **TVA et douane non comprises** sur une commande
> hors UE (+20 % + frais de dossier sur la partie chinoise).

---

## 7. En trois fois, pour étaler la dépense

Rien n'oblige à tout acheter d'un coup, et il vaut mieux prouver sur une fosse
avant de câbler le club.

| Étape | Ce qu'on installe | Coût de l'étape | Cumul |
|---|---|---:|---:|
| **1** | Fosse 1 seule (+ club-house déjà complet) | **1 781 €** | 1 781 € |
| **2** | Fosse 2 | **+1 291 €** | 3 072 € |
| **3** | Parcours de chasse | **+1 539 €** | 4 611 € |

L'étape 1 contient déjà l'écran, le mini-PC et le premier pont : dès le premier
week-end, **le club-house affiche les scores de la fosse 1**. Les étapes 2 et 3
ne font qu'ajouter un terrain — aucune reprise du câblage existant.

---

## 8. Rejouer le calcul toi-même

```python
from clayscore.pods import Pod
from clayscore.site import Site, Terrain

site = Site(nom="TAV Ventimiglia")
site.add(Terrain("FOSSE-1", "fosse_olympique", distance_club_m=250,
                 retour_camera="apercu", pods=[...]))
site.add(Terrain("FOSSE-2", "fosse_olympique", distance_club_m=280,
                 retour_camera="apercu", pods=[...]))
site.add(Terrain("CHASSE", "parcours", distance_club_m=700, n_lanceurs=8,
                 retour_camera="apercu", pods=[...]))

site.debit_club_mbps()   # -> 12.6
site.bom()["total"]      # -> 4611.0
site.check()             # -> les problèmes, en français, avec la solution
```

Le nombre de lanceurs est **déduit de la discipline** (FO = 15, FU = 5,
compak = 3 minimum). Pour un **parcours**, il n'y a pas de standard : le
logiciel **refuse** de deviner et exige `n_lanceurs=` — mieux vaut une erreur
qu'un prévisionnel faux.

---

## 9. Ce que le logiciel refuse avant que tu commandes

Ces contrôles tournent automatiquement — c'est le but : ne pas découvrir
l'erreur après avoir payé.

| Situation | Verdict |
|---|---|
| Vidéo brute sur du sans-fil | 🔴 **Bloquant** — 809 Mbit/s, impossible |
| Club-house à 800 m en WiFi ordinaire | 🔴 **Bloquant** — passer en pont directionnel |
| Terrain au-delà de 3 km en pont | 🔴 **Bloquant** — passer en 4G |
| Plusieurs terrains sur **la même** liaison partagée saturée | 🔴 **Bloquant** — ponts dédiés |
| 3 terrains en pont directionnel | 🟠 **Important** — 3 paires nécessaires, canaux différents |
| Terrain sans paire de caméras appairées | 🔴 **Bloquant** — plus de mesure de distance |
| Pod sans fil alimenté « par le câble réseau » | 🔴 **Bloquant** — incohérent |

---

## 10. Ce qui reste à vérifier sur place

Je ne peux pas l'inventer depuis un bureau. Une visite règle tout :

1. **Les distances réelles** fosses → club-house (j'ai pris 250 / 280 / 700 m).
2. **La vue dégagée** entre chaque terrain et le club-house — un pont
   directionnel exige de se voir. Un bâtiment ou des arbres = pont impossible,
   il faudra un relais.
3. **Le nombre de lanceurs du parcours** et surtout **l'écartement des postes
   de tir** (voir l'alerte du § 4 : c'est la ligne de budget qui peut bouger).
4. **L'électricité disponible** sur chaque terrain : secteur, ou dérivation
   lanceur (convertisseur **isolé** + fusible obligatoires, cf.
   `GUIDE_ALIMENTATION`).
5. **La marque des lanceurs** : sans intérêt pour le comptage (on filme le
   plateau, pas la machine), mais utile si un jour on veut déclencher le
   lanceur depuis ClayScore.

---

## À lire ensuite

- `GUIDE_ITALIE_FITAV.md` — le vocabulaire du stand et la différence FO / FU
- `GUIDE_GRANDE_SURFACE.md` — pourquoi le sans-fil n'est possible qu'avec un
  pod qui décide sur place
- `GUIDE_ALIMENTATION.md` — batterie, secteur, dérivation lanceur
- `BUDGET_BOM.md` — l'origine de chaque prix
- `GUIDE_MONTAGE.md` — poser et régler les caméras
