# ClayScore — Guide du matériel

**Chaque pièce à acheter, expliquée : à quoi elle sert, quoi prendre, combien,
où l'acheter en un clic, et les pièges à éviter.**

---

## ⚠️ À lire d'abord — honnêteté sur ce document

- Je **n'ai jamais monté ce matériel physiquement**. Les choix ci-dessous
  découlent de la spécification et des pratiques standard en vision
  industrielle (GigE / PoE), pas d'un montage vérifié.
- Je n'ai **pas pu ouvrir les pages produit** (l'accès aux sites marchands est
  bloqué depuis mon environnement). Donc :
  - les liens **« ▸ lien direct »** sont **ceux que Kevin a fournis** dans le
    dossier v4 ;
  - les liens **« ▸ recherche »** ouvrent une **recherche** sur le site, pas
    une fiche produit précise → **il faut choisir soi-même** dans la liste, en
    vérifiant les critères de la colonne « à vérifier ».
- Les prix sont des **cibles de planification**, à confirmer par devis.

---

## Vue d'ensemble : à quoi ressemble le kit

```
        POD 1              POD 2              POD 3
      (couleur)          (couleur)           (couleur)
         │                  │                   │
         └── câble Ethernet ─┴─ câble Ethernet ──┘
                            │
                   ┌────────┴────────┐
                   │   SWITCH PoE    │  ← alimente ET connecte les 3 caméras
                   └────────┬────────┘     avec UN SEUL câble par pod
                            │
          ┌─────────────────┼──────────────────┐
          │                 │                  │
   ┌──────┴──────┐   ┌──────┴──────┐   ┌───────┴───────┐
   │ HUB Jetson  │   │  ROUTEUR    │   │   BATTERIE    │
   │ + SSD       │   │   WiFi      │   │  12 V 30 Ah   │
   │ + micro USB │   │  (local)    │   │               │
   └─────────────┘   └──────┬──────┘   └───────────────┘
                            │ WiFi (sans Internet)
                       📱 TABLETTE de l'arbitre
```

**L'idée clé** : un seul câble Ethernet par pod transporte **à la fois
l'électricité et l'image** (c'est ça, le PoE). Pas de rallonge secteur à tirer
jusqu'aux caméras.

---

## 1. Les caméras — la pièce la plus importante

| | |
|---|---|
| **Rôle** | Voir le plateau en vol et l'instant de la casse |
| **Quantité** | **3, toutes en COULEUR** (réf. finissant par `C`, jamais `M`) |
| **Prix relevé** | ~168 € pièce → **~504 €** (194 USD par 5-19 pcs, août 2026) |
| **Achat** | ▸ [lien direct — Alibaba, Hikrobot MV-CS016](https://www.alibaba.com/product-detail/HIKROBOT-MV-CS016-10GC-1-2-1601122368910.html) |
| **Alternative** | ▸ [recherche Alibaba « GigE global shutter camera »](https://www.alibaba.com/trade/search?SearchText=GigE+global+shutter+industrial+camera) |

### Pourquoi celle-là (et pas une caméra de surveillance à 40 €)

1. **Global shutter** — la caméra fige **toute l'image d'un coup**. Une caméra
   normale (*rolling shutter*) lit l'image ligne par ligne : un plateau à
   90 km/h en ressort **penché et déformé**. C'est le critère **non
   négociable** : sans ça, rien ne marche.
2. **GigE Vision + PoE** — un câble réseau unique = image + alimentation, sur
   **100 m** de distance. Idéal pour des pods dispersés sur un stand.
3. **65 images/seconde** — assez pour voir la casse, pas seulement l'avant/après.
4. 🔴 **LES 3 EN COULEUR — correction du 11/08/2026.** Ce guide recommandait
   « 2 mono + 1 couleur », au motif que le monochrome capte mieux la lumière.
   **C'était une erreur, et elle est mesurée** : le test de l'**orange** du
   plateau tourne sur **chaque** caméra, pas seulement sur une. Banc des 27
   scénarios rejoué en désaturé :

   | | Résultat |
   |---|---|
   | Couleur | **27/27 = 100 %** |
   | Monochrome | **9/27 = 33 %** |

   Et le pire : chaque « cassé » devient « manqué » avec une confiance de
   **0,72**, au-dessus du seuil d'arbitrage — le système se trompe **sans
   jamais demander de vérification**. Le logiciel refuse désormais de démarrer
   une épreuve sur un flux sans couleur. Détail : `MATERIEL_OPTIMAL` § 2.

   *Pour la fin de journée*, la vraie réponse n'est pas le monochrome mais un
   objectif plus ouvert et un gain maîtrisé (voir § objectifs).

### À vérifier avant de commander
- [ ] Référence finissant par **`C` = couleur** (jamais `M` = mono) — ⚠️ le
      point qui casse le produit en silence
- [ ] Mention explicite **« global shutter »** (pas « rolling »)
- [ ] Interface **GigE** (Gigabit Ethernet) **avec PoE**, pas USB3
- [ ] Monture d'objectif **C** ou **CS** (à noter — ça conditionne les objectifs)
- [ ] Résolution ≈ **1440 × 1080**, capteur **Sony IMX273** ou équivalent
- [ ] Compatible **GenICam / Aravis** (le logiciel utilise Aravis)

### 🚩 Pièges
- Une caméra USB3 **ne peut pas** être déportée à 30 m — c'est le piège n°1.
- « 4K » n'aide pas : plus de pixels = plus lent. **La vitesse prime.**
- Certains vendeurs annoncent PoE mais livrent une version « alim externe » :
  le vérifier **par écrit** avant paiement.

---

## 2. Les objectifs — le choix qui décide de tout le placement

| | |
|---|---|
| **Rôle** | Décider ce que la caméra voit : large et proche, ou étroit et loin |
| **Quantité** | **3**, monture C, focale **8 à 12 mm** |
| **Prix cible** | ~35 € pièce → **~105 €** |
| **Achat** | ▸ demander **au même vendeur que les caméras** (port mutualisé) |
| **Alternative** | ▸ [recherche AliExpress « C mount 12mm machine vision lens »](https://fr.aliexpress.com/w/wholesale-C-mount-12mm-machine-vision-lens.html) |

### Comment choisir la focale (chiffres calculés pour ce capteur)

**Largeur de ciel couverte** :

| Focale | Angle | à 20 m | à 30 m | à 50 m |
|---|---|---|---|---|
| 6 mm | 45° | 16,6 m | 24,8 m | 41,4 m |
| **8 mm** | 34,5° | 12,4 m | 18,6 m | 31,1 m |
| **12 mm** | 23,4° | 8,3 m | 12,4 m | 20,7 m |
| 16 mm | 17,6° | 6,2 m | 9,3 m | 15,5 m |

**Taille du plateau à l'image** (un plateau fait 110 mm) :

| Focale | à 20 m | à 30 m | à 50 m |
|---|---|---|---|
| 6 mm | 9,6 px | 6,4 px | 3,8 px |
| **8 mm** | 12,8 px | 8,5 px | 5,1 px |
| **12 mm** | 19,1 px | 12,8 px | 7,7 px |
| 16 mm | 25,5 px | 17 px | 10,2 px |

**Règle simple** : en dessous de **~8 pixels**, le plateau devient un point
gris et la détection de la casse devient hasardeuse.
→ **8 mm** si tu veux voir large (parcours de chasse, trajectoires variées).
→ **12 mm** si tu veux de la précision sur une zone connue (fosse).

💡 **Le plus sage pour le prototype : commander 2 focales** (8 mm **et** 12 mm,
~70 € de plus) et essayer les deux sur le terrain. C'est le seul paramètre
qu'on ne peut pas deviner depuis un bureau.

### 🚩 Pièges
- **Monture** : un objectif CS sur une caméra C (ou l'inverse) ne fait pas le
  point. Une bague d'adaptation de 5 mm existe — la commander par précaution.
- Prendre des objectifs **« 1/2,9" ou plus grand »** : un objectif prévu pour
  un petit capteur donne un cercle noir dans les coins.
- Objectifs à **iris manuel** = très bien ici (on règle une fois, on bloque).

---

## 3. Filtre / éclairage infrarouge 850 nm

| | |
|---|---|
| **Rôle** | Voir correctement à contre-jour et en fin de journée |
| **Quantité** | 1 lot |
| **Prix cible** | **~60 €** |
| **Achat** | ▸ [lien direct — AliExpress 850 nm](https://fr.aliexpress.com/item/32757408525.html) |

Le 850 nm est une lumière **quasi invisible à l'œil** : elle n'éblouit pas les
tireurs et n'est pas soumise aux variations du ciel. Combinée à un filtre
passe-bande, la caméra ne voit **que** cette longueur d'onde → le fond devient
stable, ce qui aide énormément la détection de mouvement.

### 🚩 Pièges
- **Le plateau vole loin** : un éclairage IR n'éclaire pas le ciel à 40 m. En
  extérieur de jour, l'IR sert surtout **au filtrage** (stabiliser l'image),
  pas à éclairer. C'est un **plus, pas une solution miracle**.
- Ne jamais viser les tireurs avec une LED IR puissante à courte distance.

---

## 4. Filtres optiques

| | |
|---|---|
| **Rôle** | Couper les reflets (polarisant) ou isoler l'IR (passe-bande) |
| **Quantité** | 3 |
| **Prix cible** | ~15 € pièce → **~45 €** |
| **Achat** | ▸ même vendeur que les caméras/objectifs |
| **Alternative** | ▸ [recherche AliExpress « 850nm bandpass filter M25.5 / M30.5 »](https://fr.aliexpress.com/w/wholesale-850nm-bandpass-filter.html) |

⚠️ **Le diamètre du filtre dépend de l'objectif choisi** (souvent M25,5 ou
M30,5). → **Commander les filtres APRÈS avoir reçu les objectifs**, ou demander
au vendeur le diamètre exact.

---

## 5. Caissons étanches (les « pods »)

| | |
|---|---|
| **Rôle** | Protéger caméra + objectif de la pluie, la poussière, les chocs |
| **Quantité** | 3, indice **IP66** minimum |
| **Prix cible** | ~15 € pièce → **~45 €** |
| **Achat** | ▸ [recherche Amazon « boîtier étanche IP66 aluminium »](https://www.amazon.fr/s?k=bo%C3%AEtier+%C3%A9tanche+IP66+aluminium) · ▸ [recherche AliExpress](https://fr.aliexpress.com/w/wholesale-IP66-aluminum-enclosure-box.html) |

**L'économie du dossier v4 est ici** : un caisson « machine vision » de marque
coûte 150 €+ ; un boîtier alu IP66 générique à 15 € offre **la même protection**
— c'est de la boîte en aluminium avec un joint.

### À prévoir en plus (petit budget, gros impact)
- Une **vitre / hublot** en verre ou acrylique devant l'objectif
  (~5 €) — sinon il faut percer et l'étanchéité est perdue.
- **2 presse-étoupes PG9** par caisson (passage de câble étanche, ~1 € pièce).
- Un **sachet de gel de silice** dedans : évite la buée au petit matin. ~3 € les 50.

### 🚩 Pièges
- Un caisson **noir en plein soleil** monte très haut en température et la
  caméra peut se mettre en sécurité. → prendre **alu clair** ou peindre en
  blanc, et prévoir une petite casquette pare-soleil.
- **Percer proprement** : un trou mal fait = eau à la première pluie.

---

## 6. Le hub — NVIDIA Jetson Orin Nano

| | |
|---|---|
| **Rôle** | Le cerveau : reçoit les 3 flux vidéo, analyse, rend les verdicts |
| **Quantité** | 1 |
| **Prix relevé** | **~216 €** (249 USD prix officiel NVIDIA) — ⚠️ le double sur certaines places de marché |
| **Achat** | ▸ [lien direct — Silicon Highway](https://www.siliconhighwaydirect.com/product-p/945-13766-0005-000.htm) · ▸ [lien direct — Arrow](https://www.arrow.com/en/products/945-13766-0000-000/nvidia.html) |

Pourquoi un Jetson et pas un PC portable : il consomme **15 W** (contre 60-90 W),
démarre tout seul au branchement, et embarque une puce graphique NVIDIA capable
de faire tourner l'IA du jalon 8 en temps réel (TensorRT).

### 🚩 Pièges
- **Ne jamais acheter au prix spéculatif** (on voit du 450-600 € en période de
  pénurie). Si les deux liens ci-dessus sont en rupture : attendre ou
  commander en pré-commande — c'est une économie de 200 €.
- Vérifier que c'est bien le **Developer Kit** (carte + support + alim), pas le
  module seul (qui nécessite une carte porteuse en plus).
- Le Jetson **n'a pas de WiFi intégré** sur toutes les révisions → d'où le
  routeur dédié (§ 9), qui est de toute façon plus fiable en extérieur.

---

## 7. Stockage SSD NVMe

| | |
|---|---|
| **Rôle** | Stocker les ralentis vidéo + la base des parties |
| **Quantité** | 1, **500 Go** (format M.2 2280, NVMe) |
| **Prix cible** | **~40 €** |
| **Achat** | ▸ [recherche LDLC « SSD M.2 NVMe 500 Go »](https://www.ldlc.com/recherche/ssd%20m.2%20nvme%20500%20go/) · ▸ [recherche Amazon](https://www.amazon.fr/s?k=SSD+M.2+NVMe+500+Go) |

**Pourquoi pas une carte micro-SD** : une carte SD s'use vite en écriture
continue et **lâche sans prévenir** — c'est la panne classique des projets
Jetson/Raspberry. Le SSD est 10× plus rapide et bien plus fiable.

**Combien de parties tiennent dedans ?** Un ralenti de plateau pèse ~1 à 3 Mo.
Une série de 25 plateaux ≈ 50 Mo. → **500 Go = plusieurs milliers de parties**.

---

## 8. Switch PoE

| | |
|---|---|
| **Rôle** | Alimenter **et** connecter les 3 caméras avec un seul câble chacune |
| **Quantité** | 1, **4 ports PoE minimum**, norme **802.3af/at** |
| **Prix cible** | **~60 €** |
| **Achat** | ▸ [lien direct — LDLC](https://www.ldlc.com/en/product/PB00266981.html) · ▸ [recherche LDLC « switch PoE 5 ports »](https://www.ldlc.com/recherche/switch%20poe%205%20ports/) |

### À vérifier
- [ ] **Budget PoE total ≥ 30 W** (3 caméras × ~3-6 W, large marge)
- [ ] Ports **Gigabit** (100 Mbit/s ne suffit pas pour 3 flux)
- [ ] Idéalement un modèle **12 V ou 48 V DC en entrée** → se branche
      directement sur la batterie, **sans onduleur 230 V** (gros gain
      d'autonomie et de simplicité)

### 🚩 Piège majeur
Un switch PoE « 230 V uniquement » **oblige à ajouter un convertisseur**
12 V → 230 V, qui gaspille 15-20 % de la batterie et ajoute une panne possible.
**Chercher explicitement un switch PoE alimenté en DC.**

---

## 9. Routeur WiFi local

| | |
|---|---|
| **Rôle** | Créer le réseau WiFi du stand pour que la tablette parle au hub |
| **Quantité** | 1 |
| **Prix cible** | **~40 €** |
| **Achat** | ▸ [lien direct — GL.iNet](https://www.gl-inet.com/en-us/products) · ▸ [recherche Amazon « GL.iNet routeur voyage »](https://www.amazon.fr/s?k=GL.iNet+routeur+voyage) |

**Aucun abonnement, aucune carte SIM, aucun Internet.** Le routeur crée un
réseau local `ClayScore` ; la tablette s'y connecte comme à un WiFi de maison.
Les modèles GL.iNet fonctionnent en **5 V USB ou 12 V**, donc directement sur
la batterie.

💡 **Alternative gratuite** : le Jetson peut créer lui-même le hotspot
(`deploy/setup_hotspot.sh` est déjà écrit et livré). Le routeur dédié reste
préférable : meilleure portée, et le hub garde toute sa puissance pour l'analyse.

---

## 10. Micro USB (détection des coups de feu)

| | |
|---|---|
| **Rôle** | Entendre la détonation → c'est elle qui déclenche le verdict |
| **Quantité** | 1, USB, **omnidirectionnel** |
| **Prix cible** | **~25 €** |
| **Achat** | ▸ [recherche Amazon « micro USB omnidirectionnel conférence »](https://www.amazon.fr/s?k=micro+USB+omnidirectionnel+conf%C3%A9rence) |

Le logiciel utilise un **seuil adaptatif** (médiane + écart absolu médian) : il
s'adapte tout seul au bruit ambiant, donc **pas besoin d'un micro de studio**.
Testé : **27/27 détections, 0 fausse alerte**.

### 🚩 Pièges
- **La détonation sature n'importe quel micro** à courte distance. Le placer à
  **au moins 10-15 m** du pas de tir, ou dans le dos des postes.
- Prendre un micro **avec câble** (2-3 m) pour pouvoir l'éloigner du hub.
- Éviter les micros « à réduction de bruit » automatique : ils écrasent
  justement les pics… qui sont notre signal.

---

## 11. Batterie

| | |
|---|---|
| **Rôle** | Une journée complète d'autonomie sans prise secteur |
| **Quantité** | 1, **LiFePO4 12 V 30 Ah** |
| **Prix relevé** | **~46 €** (LiFePO4 12 V 30 Ah avec BMS, juillet 2026) |
| **Achat** | ▸ [recherche Amazon « batterie LiFePO4 12V 30Ah »](https://www.amazon.fr/s?k=batterie+LiFePO4+12V+30Ah) |

### Le calcul d'autonomie (fait, pas estimé)

| Élément | Conso |
|---|---:|
| Jetson Orin Nano (mode 15 W) | 15 W |
| 3 caméras GigE (3 W pièce) | 9 W |
| Switch PoE | 5 W |
| Routeur WiFi | 5 W |
| SSD NVMe | 3 W |
| Micro USB | 1 W |
| **TOTAL** | **38 W** |

| Batterie | Capacité | Théorique | **Réel (85 % de rendement)** |
|---|---|---|---|
| 12 V 20 Ah | 240 Wh | 6,3 h | 5,4 h |
| **12 V 30 Ah** | **360 Wh** | 9,5 h | **8,1 h** ✅ |
| 12 V 50 Ah | 600 Wh | 15,8 h | 13,4 h |

→ **30 Ah = une journée de concours (8 h)**. C'est exactement le
dimensionnement « juste » annoncé dans le dossier v4 : payer 50 Ah serait
+70 € pour une autonomie inutile.

### Pourquoi LiFePO4 (et pas plomb ou lithium classique)
- **3× plus légère** qu'une batterie plomb de même capacité (à porter sur un stand)
- **2 000+ cycles** au lieu de ~300
- **Chimie stable** : ne s'emballe pas thermiquement comme le lithium-ion

### 🚩 Pièges
- Vérifier la présence d'un **BMS intégré** (protection décharge profonde) —
  c'est standard, mais à confirmer.
- Prendre le **chargeur LiFePO4 dédié** (~25 €, souvent non inclus) : un
  chargeur plomb abîme une LiFePO4.

---

## 12. Câblage et connectique

| | |
|---|---|
| **Rôle** | Relier tout ça, dehors, sans que ça lâche à la première pluie |
| **Prix cible** | **~50 €** le lot |
| **Achat** | ▸ [recherche Amazon « câble Ethernet extérieur Cat6 30m »](https://www.amazon.fr/s?k=c%C3%A2ble+ethernet+ext%C3%A9rieur+cat6+30m) · ▸ [recherche LDLC](https://www.ldlc.com/recherche/cable%20reseau%20exterieur%20cat6/) |

**Liste de courses détaillée :**

| Article | Qté | ~Prix |
|---|---|---:|
| Câble Ethernet **Cat6 extérieur** 20-30 m | 3 | ~10 € pièce |
| Presse-étoupes PG9 | 6 | ~1 € pièce |
| Bornier / répartiteur 12 V à fusibles | 1 | ~10 € |
| Câble d'alimentation 12 V + cosses | 1 lot | ~8 € |
| Serre-câbles + gaine spiralée | 1 lot | ~6 € |

### 🚩 Pièges
- Du câble Ethernet **d'intérieur** durcit et se fissure au soleil/gel. Prendre
  du **« outdoor / UV resistant »**, la différence est de 3 € par câble.
- Toujours mettre un **fusible** sur la ligne 12 V (une batterie 30 Ah peut
  débiter énormément en court-circuit).
- **Marquer chaque câble** aux deux bouts (1, 2, 3) dès le premier montage.

---

## 13. Trépieds / piquets pour les pods

| | |
|---|---|
| **Rôle** | Tenir les caméras **parfaitement immobiles** |
| **Quantité** | 3 |
| **Prix cible** | ~15 € pièce → **~45 €** |
| **Achat** | ▸ [recherche Amazon « trépied photo lourd 1,5 m »](https://www.amazon.fr/s?k=tr%C3%A9pied+photo+lourd) · ▸ [recherche piquet de terre](https://www.amazon.fr/s?k=piquet+de+terre+support+cam%C3%A9ra) |

### ⚠️ Le point le plus sous-estimé du projet
Le logiciel fait de la **soustraction de fond** : il compare chaque image à la
précédente. **Si la caméra bouge, tout bouge, et tout devient « mouvement ».**
Un trépied léger qui vibre au vent peut à lui seul faire chuter la précision.

→ Privilégier : **piquet planté au sol** > trépied lourd > trépied léger lesté.
→ Après la calibration, **ne plus toucher aux pods** de la journée.

---

## Récapitulatif du budget

| Poste | Total cible |
|---|---:|
| Caméras (3) | 540 € |
| Objectifs (3) | 105 € |
| IR 850 nm | 60 € |
| Filtres (3) | 45 € |
| Caissons IP66 (3) | 45 € |
| Hub Jetson | 280 € |
| SSD NVMe | 40 € |
| Switch PoE | 60 € |
| Routeur WiFi | 40 € |
| Micro USB | 25 € |
| Batterie | 130 € |
| Câblage | 50 € |
| Trépieds (3) | 45 € |
| **TOTAL** | **≈ 1 300 €** (prix révisés 11/08/2026 — voir `MATERIEL_OPTIMAL`) |
| *+ 2e jeu d'objectifs (recommandé)* | *+ 70 €* |
| *+ chargeur LiFePO4* | *+ 25 €* |
| *+ visserie / hublots / gel de silice* | *+ 30 €* |
| **Réaliste avec les extras** | **≈ 1 590 €** |

Cohérent avec la fourchette du dossier v4 (**1 450 – 1 550 €**), les extras
étant des petites pièces qu'on découvre toujours au montage.

**Logiciel : 0 €** — il est déjà écrit et testé (308 tests verts).

---

## Ordre de commande conseillé

1. **Le Jetson en premier** (délais les plus longs, parfois en rupture).
2. **Le colis Chine groupé** (caméras + objectifs + filtres + IR) chez **1 ou 2
   vendeurs maximum** → un seul port, un seul passage en douane.
   *Prévoir 3 à 5 semaines.*
3. **Le reste en Europe** (LDLC / Amazon, livré en 48 h) — à commander **en
   dernier**, quand on connaît les diamètres et les montures réels.

👉 La suite : **`GUIDE_MONTAGE`** (assembler et installer) puis
**`CHECKLIST_PROTOTYPE`** (la marche à suivre pas à pas).
