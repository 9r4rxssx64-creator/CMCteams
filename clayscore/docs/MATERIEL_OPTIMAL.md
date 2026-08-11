# ClayScore — Matériel optimal et tarifs : l'estimation précise

**Ce qu'il faut acheter, pourquoi c'est ce modèle-là, ce que ça coûte
réellement, et ce qui reste à confirmer.**

> Mis à jour le **11/08/2026**. Deux natures de prix, jamais mélangées :
> **🟢 RELEVÉ** = offre publique réellement trouvée (référence, source, date).
> **🟡 cible** = hypothèse de planification, jamais confirmée chez un vendeur.
> Conversion : **1 USD = 0,866 €** (1 EUR = 1,1542 USD, 11/08/2026).

---

## 1. Le besoin, chiffré (ce que le matériel doit tenir)

Ce ne sont pas des souhaits, ce sont des mesures déjà faites sur le logiciel :

| Contrainte | Valeur | D'où elle vient |
|---|---|---|
| Résolution | ≥ 1440 × 1080 | Un plateau à 30 m doit faire assez de pixels |
| Cadence | **65 img/s** par caméra | En dessous, un plateau rapide « saute » entre deux images |
| Obturateur | **global** (pas rolling) | Un obturateur déroulant déforme un objet rapide |
| **Couleur** | **obligatoire** | ⚠️ voir § 2 — c'est le point le plus important |
| Débit à absorber | **195 img/s** (3 caméras) | 3 × 65 |
| Débit mesuré du logiciel | **288 img/s** | Banc, machine de développement |

---

## 2. 🔴 La décision la plus importante : COULEUR, jamais monochrome

C'est une erreur qui était dans le budget précédent (« 2 mono + 1 couleur »)
et qui aurait cassé le produit. Je l'ai **mesurée** avant de la corriger.

Le verdict repose sur la reconnaissance de l'**orange** du plateau. J'ai rejoué
le banc complet (27 scénarios : cassé / manqué / no-bird × ciel / forêt /
contre-jour × 3 tirages) en désaturant chaque image — exactement ce que
renvoie une caméra monochrome :

```
   COULEUR (référence) ....... 27/27 = 100 %
   MONOCHROME ................  9/27 =  33 %
```

Et le pire n'est pas le score. **Chaque « cassé » devient « manqué » avec une
confiance de 0,72** — au-dessus du seuil d'arbitrage (0,60). Le système ne
demande donc **jamais** d'arbitrage humain : il se trompe, toute la journée,
avec assurance. Un défaut invisible qui fausse une compétition entière.

**Ce qui a été corrigé dans le logiciel** (pour que ça n'arrive jamais) :
- la qualité d'image mesure désormais la **saturation** ;
- seuil choisi **sur mesure**, pas au jugé : pire cas couleur du banc
  (contre-jour) = **18,9**, monochrome = **0,0** → seuil à **5**, loin des
  deux, donc pas de faux positif un jour de grisaille ;
- une caméra sans couleur est **bloquante** au contrôle GO/NO-GO avant épreuve.

> **Conséquence d'achat, non négociable : les 3 caméras d'un terrain sont
> COULEUR.** Chez Hikrobot, les références se terminent par `C` (couleur) et
> non `M` (mono) : `MV-CS016-10**GC**`, pas `-10GM`.

### 2-bis. Le piège qui suit : le format de pixels

Acheter une caméra couleur ne suffit pas — **il faut aussi la régler en
couleur**, et deux réglages faux donnent exactement le même désastre :

| Réglage | Ce qui se passe | Verdict |
|---|---|---|
| `pixel_format: Mono8` | La caméra couleur sort du **noir et blanc** | 🔴 9/27 |
| `pixel_format: BayerRG8` mal déballé | **Rouge et bleu échangés** — l'orange devient **bleu** | 🔴 plus aucun orange |
| `pixel_format: RGB8` | La caméra fait le travail elle-même | ✅ |

Le second piège n'est pas théorique, il est **mesuré** : le nommage OpenCV est
décalé d'un cran par rapport au nommage GenICam des capteurs. Sur une cible
orange BGR (30, 120, 240), `BayerRG8` déballé avec le code « évident »
`COLOR_BayerRG2BGR` ressort en BGR **(240, 120, 30)** — teinte **107**, du
bleu franc. La bonne correspondance, vérifiée sur les quatre motifs :

| Capteur (GenICam) | Code OpenCV correct |
|---|---|
| `BayerRG8` | `COLOR_BayerBG2BGR` |
| `BayerBG8` | `COLOR_BayerRG2BGR` |
| `BayerGR8` | `COLOR_BayerGB2BGR` |
| `BayerGB8` | `COLOR_BayerGR2BGR` |

**Ce qui a été corrigé dans le logiciel** : le format par défaut était
`Mono8` (la configuration sortie de la boîte cassait donc le produit) — il est
désormais **`RGB8`** ; un format `Mono*` est **refusé** avec un message
explicite ; et le déballage Bayer utilise la table ci-dessus, verrouillée par
un test qui vérifie qu'une mosaïque orange ressort bien **orange**.

> ✅ **À la commande comme au réglage : demander `RGB8`** (ou `BGR8`) quand le
> modèle le propose. La caméra démosaïque elle-même, et toute cette classe de
> pièges disparaît.

---

## 3. Le choix de la caméra — et la surprise de 2026

Deux routes crédibles. J'ai comparé au prix réel du jour, pas au prix d'hier.

| | **Caméra industrielle GigE** | **Raspberry Pi Global Shutter** |
|---|---|---|
| Référence | Hikrobot MV-CS016 (IMX273) | RPi GS Camera (IMX296) |
| Résolution | 1440 × 1080 | 1456 × 1088 |
| Cadence | 65 img/s | 60 img/s |
| Obturateur global | ✅ | ✅ |
| Déclenchement externe (paire synchro) | ✅ | ✅ |
| Monture objectif | C | C/CS |
| **Prix caméra** | **139 €** 🟢 (160 USD, réf. `-10GC`) | **43 €** 🟢 (50 USD) |
| Longueur de câble | **100 m** (Ethernet) | **~30 cm** (nappe CSI) |
| Alimentation | **par le câble réseau (PoE)** | séparée, par caméra |

À première vue le Raspberry gagne 4× sur le prix. **Sauf qu'une nappe CSI fait
30 cm** : il faut donc un Raspberry Pi *collé à chaque caméra*. Et c'est là que
2026 change tout :

> 💥 **Le prix du Raspberry Pi a explosé.** Le Pi 5 8 Go est passé de **80 USD**
> à **175 USD** (avril 2026), à cause de la flambée du prix des mémoires. Un
> revendeur européen l'affiche à **189 €**.

Le calcul devient donc :

| Route | Coût par caméra | Câblage |
|---|---:|---|
| Industrielle GigE | **139 €** | 1 câble : données **+** courant, 100 m |
| Raspberry (1 Pi par caméra) | 43 + 152 = **195 €** | nappe + alim + réseau par caméra |

**La route « pas chère » est devenue la plus chère.** Et elle reste la plus
compliquée à installer (une paire stéréo est séparée de plusieurs mètres : on
ne peut pas mettre deux caméras sur le même Pi).

> ✅ **Décision : caméra industrielle GigE couleur, alimentée en PoE.**
> Un seul câble par caméra, jusqu'à 100 m, données et courant ensemble.
> C'est aussi ce qui rend le produit installable par un club sans électricien.

---

## 4. Le calculateur du terrain

| Option | Prix | Ce que ça apporte | Risque |
|---|---:|---|---|
| **Jetson Orin Nano Super** | **392,50 €** ✅ (vérifié Gotronic ; Kubii 465 €) | GPU : indispensable **si** on active le détecteur IA (YOLO) | Forte demande — le prix au comptant peut être un multiple du tarif officiel |
| Mini-PC Intel N100 | 🟡 non relevé | x86, ports USB3/Ethernet, souvent moins cher | Pas de GPU → détecteur classique seulement |

**Le détecteur livré aujourd'hui (classique) tourne sur processeur**, pas sur
GPU. Le Jetson n'est donc nécessaire que pour la variante IA.

> ⚠️ **Ce que je n'ai PAS mesuré** : les 288 img/s ont été mesurés sur la
> machine de développement, **pas** sur un Jetson ni sur un N100. Le seuil à
> tenir est **195 img/s**.
>
> ✅ **Ce qu'il faut faire, et c'est peu cher** : acheter **UN SEUL**
> calculateur, lancer `python -m tools.bench --all` dessus, et **ne commander
> les deux autres qu'après**. Avec 2 caméras et 4 objectifs, ça fait **899 €
> livré** pour supprimer le seul vrai risque technique du projet — détail dans
> **`COMPARATIF_CHINE_UE.md`** § 5.

---

## 5. La liaison vers le club-house

| Matériel | Prix | Performance | Besoin réel |
|---|---:|---|---|
| **Ubiquiti NanoStation 5AC Loco** (la paire) | **96,08 €** ✅ (48,04 € l'unité chez Getic) | 450+ Mbit/s annoncés, portée > 10 km | **4,2 Mbit/s** par terrain |

La marge est énorme (×100). C'est voulu : en extérieur, la pluie, les feuilles
et les autres réseaux 5 GHz mangent du débit. On dimensionne large et on ne
touche plus.

⚠️ **Un pont est point-à-point** : il en faut **une paire par terrain**, sur
des canaux différents. Le logiciel le signale tout seul.

---

## 6. Le tableau d'achat complet — club de 3 terrains

Ce tableau est **calculé** par `Site.bom()`, pas tapé à la main.

| Poste | Réf. / critère | Qté | Unit. | Total | Prix |
|---|---|---:|---:|---:|:--:|
| Caméra industrielle **couleur** | Hikrobot MV-CS016-10GC | 13 | 139 € | 1 807 € | 🟢 |
| Objectifs **8 mm ET 12 mm** F1.4 | monture C, 5 MP | 26 | 36 € | 936 € | 🟢 |
| Filtre optique | passe-bande 850 nm / polarisant | 13 | 15 € | 195 € | 🟡 |
| Caisson IP66 | boîtier aluminium | 13 | 15 € | 195 € | 🟡 |
| Fixation rigide | trépied lourd / piquet | 13 | 15 € | 195 € | 🟡 |
| Calculateur | Jetson Orin Nano Super (UE) | 3 | 392,50 € | 1 178 € | ✅ |
| SSD NVMe 500 Go | clips + base | 3 | 40 € | 120 € | 🟡 |
| Switch PoE | TP-Link TL-SG1005P (65 W) | 3 | 60 € | 180 € | 🟡 |
| Micro USB | omnidirectionnel | 3 | 25 € | 75 € | 🟡 |
| Batterie LiFePO4 12 V 30 Ah | avec BMS | 3 | 46 € | 138 € | 🟢 |
| Chargeur LiFePO4 | dédié | 3 | 25 € | 75 € | 🟡 |
| Câblage extérieur | Cat6 ext., presse-étoupes, fusibles | 3 lots | 50 € | 150 € | 🟡 |
| Pont directionnel (paire) | NanoStation 5AC Loco — Getic (UE) | 3 | 96,08 € | 288 € | ✅ |
| Routeur club-house | WiFi local | 1 | 40 € | 40 € | 🟡 |
| Mini-PC club-house | agrège + pilote l'écran | 1 | 200 € | 200 € | 🟡 |
| Écran club-house | TV scores + retour caméra | 1 | 250 € | 250 € | 🟡 |
| **TOTAL (config OPTIMALE)** | | | | **6 022 € HT** | |

**Répartition honnête :**

| | Montant | Part |
|---|---:|---:|
| ✅ Prix **vérifiés sur la fiche produit** | **1 466 €** | 24 % |
| 🟢 Prix **relevés** (recherche datée) | **2 881 €** | 48 % |
| 🟡 Prix **à confirmer** (hypothèses) | **1 675 €** | 28 % |

> ⚠️ **Aucun de ces chiffres n'est un devis.** Ils ne comprennent ni la **TVA**
> ni la **douane** sur la partie hors UE (compter **+20 %** + frais de dossier
> sur la commande chinoise, soit environ **+340 €** sur les 1 680 € de caméras).

**Livré, TVA comprise sur la part chinoise : 6 570 €.** En config *minimum*
(sans secours ni double focale) : 5 244 €. Détail et étapes :
**`COMPARATIF_CHINE_UE.md`**.

---

## 7. Les 4 prix qu'il reste à obtenir (et comment)

Ce sont les seules inconnues qui pèsent :

| Poste | Montant en jeu | Comment lever le doute |
|---|---:|---|
| **Écran + mini-PC club-house** | 450 € | Regarder d'abord ce que le club **a déjà** : une TV au bar et un vieux PC suffisent. Ça peut tomber à 0 € |
| **Switch PoE** | 180 € | En prendre un à **entrée continue 12-48 V** (se branche sur la batterie). ⚠️ à 12 V, le budget PoE tombe à ~60 W — assez pour 4 caméras |
| **Petites pièces** (filtres, caissons, fixations, câblage) | 735 € | Un seul lot chez un vendeur : c'est le poste le plus dispersé, donc celui où on perd du temps et des frais de port |

---

## 8. Les pièges de commande (ceux qui coûtent cher)

1. **Référence terminée par `M` = monochrome.** Prendre `C`. Voir § 2 — c'est
   l'erreur qui casse le produit sans qu'on la voie.
2. **Rolling shutter.** Une caméra « 1080p 60 fps » à 30 € sur une place de
   marché est presque toujours à obturateur déroulant : elle déforme un objet
   rapide. Il faut lire **« global shutter »** noir sur blanc.
3. **Douane.** +20 % de TVA + frais sur le colis chinois. Grouper chez **un
   seul** vendeur pour n'avoir **qu'un** dédouanement.
4. **Objectif inadapté au capteur.** Un objectif prévu pour 1/1.8" fonctionne
   sur un capteur 1/2.9", l'inverse non (coins noirs). Dans le doute, prendre
   le plus grand format.
5. **Switch PoE alimenté seulement en 230 V.** En choisir un à **entrée
   continue (DC)** : il se branche alors directement sur la batterie, sans
   onduleur.
6. **Jetson au prix du marché parallèle.** Le tarif officiel est de 249 USD ;
   certaines places de marché le vendent au double. Passer par un distributeur
   officiel.

---

## 9. L'ordre d'achat que je recommande

| # | Achat | Montant | Ce que ça prouve |
|---|---|---:|---|
| **1** | 1 calculateur + 2 caméras couleur + 2 objectifs | **~620 €** | Que la cadence tient sur le vrai matériel (`tools/bench`), et que la paire stéréo se synchronise |
| **2** | Le reste de la fosse 1 + le club-house | ~1 160 € | Un vrai week-end de tir, scores affichés au bar |
| **3** | Fosse 2 | ~1 291 € | Deux terrains en simultané |
| **4** | Parcours de chasse | ~1 539 € | Le cas difficile, après avoir tout validé |

L'étape 1 est la seule vraiment importante : **620 € pour vérifier la seule
hypothèse non mesurée du dossier** (la puissance du calculateur). Tant qu'elle
n'est pas faite, ne pas commander dix caméras.

---

## 10. Ce que je ne peux pas faire depuis ici — honnêtement

- **Je ne peux pas ouvrir les pages marchandes.** Le pare-feu de mon
  environnement bloque tout sauf les moteurs de recherche. Les prix 🟢 viennent
  donc de **résultats de recherche datés**, pas de fiches produit ouvertes.
  Ils sont à revérifier au moment de commander.
- **Aucun de ces prix n'est un devis**, et les remises par quantité ne sont
  pas négociées.
- **Je n'ai pas mesuré le logiciel sur le matériel final** (Jetson / N100).
  C'est le seul risque technique restant, et l'étape 1 du § 9 le lève.
- **Le prix de la variante GigE (`10GC`)** n'a pas été relevé séparément de la
  version USB3 (`10UC`) : les 168 € viennent de la référence USB3.

---

## Sources des prix relevés

- [Raspberry Pi — Global Shutter Camera (50 USD)](https://www.raspberrypi.com/products/raspberry-pi-global-shutter-camera/)
- [Raspberry Pi — hausse des prix liée à la mémoire (Pi 5 à 175 USD)](https://www.raspberrypi.com/news/more-memory-driven-price-rises/)
- [Welectron — Raspberry Pi 5 8 Go à 189 €](https://www.welectron.com/Raspberry-Pi-5-8-GB-RAM_1)
- [Alibaba — Hikrobot MV-CS016-10UC (194 USD par 5-19 pièces)](https://www.alibaba.com/product-detail/HIKROBOT-MV-CS016-10UC-1-6_1601123150025.html)
- [NVIDIA — Jetson Orin Nano Super Developer Kit (249 USD)](https://www.nvidia.com/en-us/autonomous-machines/embedded-systems/jetson-orin/nano-super-developer-kit/)
- [Ubiquiti Store — NanoStation 5AC Loco](https://store.ui.com/us/en/products/loco5ac)
- [eBay Allemagne — batterie LiFePO4 12 V 30 Ah (à partir de 46 €)](https://www.ebay.de/itm/226970219019)
- [TP-Link TL-SG1005P — fiche officielle](https://www.tp-link.com/us/business-networking/poe-switch/tl-sg1005p/)
- [Trading Economics — taux EUR/USD (1,1542 au 11/08/2026)](https://tradingeconomics.com/euro-area/currency)

## À lire ensuite

- `PREVISIONNEL_CLUB.md` — le plan des 3 terrains + club-house
- `GUIDE_MATERIEL.md` — le rôle de chaque pièce et les critères de choix
- `GUIDE_MONTAGE.md` — poser, câbler, régler
- `BUDGET_BOM.md` — l'historique du budget et la correction du 11/08/2026
