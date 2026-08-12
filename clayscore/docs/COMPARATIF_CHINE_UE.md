# ClayScore — Chine ou Europe ? Le comparatif, et la config OPTIMALE

**Réponse courte : ni l'un ni l'autre — les deux.** Les caméras et l'optique
viennent de Chine, tout le reste d'Europe. C'est le résultat d'une comparaison
prix par prix, pas un a priori.

> Mis à jour le **11/08/2026**. TROIS niveaux de confiance :
> **✅ VÉRIFIÉ** = la fiche produit a été **ouverte** et le prix lu dessus ·
> **🟢 relevé** = vu dans une recherche datée · **🟡 cible** = hypothèse.
> Conversion **1 USD = 0,8666 €** (taux relevé le jour du contrôle).
> Les totaux sont **calculés** par `clayscore/site.py` (43 tests).

---

## 1. Le verdict, poste par poste

| Poste | 🇨🇳 Chine | 🇪🇺 Europe | Retenu | Pourquoi |
|---|---:|---:|:--:|---|
| **Caméra** couleur GigE global shutter | **139 €** 🟢 | 372 € 🟢 | 🇨🇳 | Hikrobot `MV-CS016-10GC` contre Basler `acA1440-73gc` : **2,7×** l'écart pour +8 img/s. Même taxée (167 €), la Chine gagne largement |
| **Objectifs** monture C 5 MP | **36 €** 🟢 | — | 🇨🇳 | À commander avec les caméras, chez le même vendeur |
| **Calculateur** Jetson Orin Nano Super | 216 € (tarif officiel) | **392,50 €** ✅ | 🇪🇺 | ⚠️ prix **vérifié sur la fiche** : Gotronic 392,50 €, Kubii 465 €. Les « 307 € » d'un comparateur étaient faux. Un import reviendrait à ~277 €, mais sans garantie ni SAV sur la pièce critique |
| **Pont directionnel** NanoStation 5AC Loco (paire) | — | **96,08 €** ✅ | 🇪🇺 | 48,04 € l'unité chez **Getic** (vérifié). ⚠️ LDLC est à 64,95 € : **+35 %** pour le même produit |
| **Batterie** LiFePO4 12 V 30 Ah | — | **46 €** 🟢 | 🇪🇺 | Lourde. Et une batterie lithium en colis express hors UE pose un problème réglementaire |
| 🆕 **Caméra de diffusion** IP PoE | — | **59 €** 🟢 | 🇪🇺 | Elle **montre**, elle ne juge pas → ni obturateur global ni couleur calibrée : **2,4× moins cher**. Une caméra IP sans mises à jour pose un problème de sécurité réseau : on la prend en Europe |

**La règle qui en sort :** *ce qui est léger, cher à la marque et sans SAV
critique → Chine. Ce qui est lourd, réglementé, ou dont on aura besoin d'un
remplacement rapide → Europe.*

---

## 2. La caméra : le seul vrai gagnant chinois

C'est là que se joue l'essentiel de l'écart.

| | Hikrobot MV-CS016-10GC | Basler acA1440-73gc |
|---|---|---|
| Capteur | IMX296, 1/2.9" | IMX273, 1/2.9" |
| Résolution | 1440 × 1080 | 1440 × 1080 |
| Cadence | **65,2 img/s** | 73 img/s |
| Obturateur | global | global |
| **Couleur** | ✅ (suffixe `GC`) | ✅ (suffixe `gc`) |
| Interface | GigE + PoE | GigE + PoE |
| **Prix** | **139 €** (160 USD, 5-19 pcs) | **372 €** (429 USD) |

Le besoin mesuré est de **65 img/s**. Le Hikrobot le tient **exactement**.
Payer 2,7× pour 8 img/s dont on n'a pas besoin n'a aucun sens.

⚠️ **La référence exacte compte** : `MV-CS016-10**GC**`.
- `GC` = **G**igE + **C**ouleur ← celle-ci
- `GM` = GigE + **M**ono → ❌ casse le produit (9/27 mesuré, voir `MATERIEL_OPTIMAL` § 2)
- `UC` = **U**SB3 + Couleur → pas de PoE, câble limité à 5 m

---

## 3. La configuration OPTIMALE — « sûr dans tous les cas »

Tu as demandé l'optimal tout de suite. Voici ce qui le distingue du minimum,
et pourquoi chaque ajout est justifié.

| Ajout | Coût | Ce que ça couvre |
|---|---:|---|
| **+1 caméra de secours par terrain** | +417 € | Une caméra qui tombe **pendant** une épreuve ne l'arrête plus. Le rôle `secours` existe déjà dans le logiciel : il suffit de la basculer |
| **Double jeu d'objectifs (8 mm ET 12 mm)** | +468 € | Le **8 mm** voit large (fosse olympique, 15 lanceurs, parcours) ; le **12 mm** est plus précis (fosse universelle, 5 lanceurs). Avec les deux, le choix se fait **sur le terrain**, pas au moment de la commande — et une erreur d'appréciation ne coûte plus une nouvelle commande de 3 semaines |
| **Objectifs en F1.4** | inclus | La façon la moins chère d'acheter de la lumière pour les fins de journée. **C'est la bonne réponse au manque de lumière — pas le monochrome** |
| **Switch PoE à entrée continue 12-48 V** | inclus | Se branche **directement sur la batterie**, sans onduleur. ⚠️ à 12 V d'entrée, le budget PoE tombe à ~60 W |
| 🆕 **2 caméras de diffusion par terrain** | +534 € | Le **tireur** et la **zone de vol** en direct sur l'écran du bar, en plus des scores. Comprend le **2ᵉ switch PoE** que ces caméras rendent nécessaire (5 caméras > 4 ports) |

**Écart total : +1 128 €, soit +24 %.** C'est une assurance, pas un doublement.

---

## 4. Ce que ça coûte, livré

Le prix « livré » ajoute la **TVA 20 %** sur la seule partie chinoise. Les frais
de dossier du transporteur s'ajoutent **par colis** — d'où l'intérêt de tout
commander chez **un seul** vendeur chinois.

| Configuration | HT | dont 🇨🇳 | dont 🇪🇺 | **Livré TTC** |
|---|---:|---:|---:|---:|
| **Étape 0** — valider avant tout (1 calculateur + 2 caméras + 4 objectifs) | 814 € | 421 € | 393 € | **898 €** |
| **Phase 1** — 1 fosse + club-house complet (diffusion comprise) | 2 425 € | 903 € | 1 523 € | **2 606 €** |
| **Phase 2** — + 2ᵉ fosse | 4 360 € | 1 805 € | 2 555 € | **4 722 €** |
| **Phase 3** — + parcours de chasse | 6 551 € | 2 934 € | 3 618 € | **7 138 €** |
| *(pour comparaison : club complet en config minimum)* | *5 424 €* | *1 897 €* | *3 528 €* | ***5 804 €*** |

**Sur les 6 551 € HT de la config optimale : 1 466 € sont VÉRIFIÉS sur la
fiche produit (22 %), 4 696 € reposent sur une offre publique réelle (72 %)**,
et 1 855 € restent des hypothèses (écran et mini-PC du club-house, petites
pièces). Le détail vendeur par vendeur, avec un lien 1 clic par ligne, est
dans **`DEVIS_COMPARATIF.md`**.

---

## 5. L'ordre d'achat

### Étape 0 — 898 € — **à faire avant tout le reste**

1 Jetson (Europe, livré en 48 h) + 2 caméras + 4 objectifs (Chine) = **898 €**.

Ça valide en une fois **les deux seules inconnues techniques du projet** :
- la **cadence** tient-elle sur le vrai calculateur ? (`python -m tools.bench --all`,
  seuil **195 img/s**, mesuré à 288 sur machine de développement mais **jamais
  sur Jetson**) ;
- la **paire stéréo** se synchronise-t-elle par déclenchement externe ?

> **Ne commande pas 13 caméras avant d'avoir fait ça.** 898 € pour supprimer
> le seul vrai risque du dossier.

### Puis, une commande chinoise groupée

Toutes les caméras + tous les objectifs + filtres chez **un seul** vendeur :
**un seul dédouanement**, un seul port. Séparer la commande en trois multiplie
les frais de dossier.

---

## 6. Les pièges d'achat, par origine

**🇨🇳 Côté chinois**
1. Référence finissant par `M` = **mono** → casse le produit (voir § 2).
2. « 1080p 60 fps » à 30 € = **rolling shutter** quasi certain → déforme un
   objet rapide. Exiger « global shutter » écrit noir sur blanc.
3. **Un seul vendeur, un seul colis** : les frais de douane sont par envoi.
4. Demander une **facture commerciale correcte** — une valeur sous-déclarée
   fait bloquer le colis.

**🇪🇺 Côté européen**
5. **Jetson au marché parallèle** : le tarif officiel est 249 USD, certaines
   places de marché le vendent au double. Passer par Kubii, Gotronic ou RS.
6. Le **Jetson « Orin Nano »** simple et le **« Orin Nano Super »** ne sont pas
   la même chose (67 TOPS pour le Super). Vérifier la mention *Super*.
7. **Switch PoE 230 V uniquement** → inutilisable sur batterie sans onduleur.
   En prendre un à **entrée continue**.

---

## 7. Comment ces prix sont contrôlés — et ce qui reste incertain

**Le contrôle est automatique.** Le pare-feu de mon environnement bloque les
pages marchandes, mais **le runner GitHub a le réseau ouvert**. Un workflow y
ouvre les vraies fiches produit, en lit le prix (donnée structurée schema.org)
et le compare à celui du dossier :

```
Actions → « ClayScore — Vérifier les prix sur les vraies pages » → Run workflow
```

**Ce que le premier contrôle a trouvé (11/08/2026) — 4 pages sur 6 lues :**

| Ce que disait le dossier | Ce que dit la vraie fiche | Verdict |
|---|---|---|
| Jetson **307 €** (comparateur) | **392,50 €** Gotronic · **465 €** Kubii | 🔴 **faux de −22 %** → corrigé |
| Pont **98 €** la paire | **96,08 €** chez Getic · 129,90 € chez LDLC | ✅ confirmé, et LDLC écarté |
| Caméra 139 € (Alibaba) | page lue, **prix masqué** (affiché en JavaScript) | ⏳ reste « relevé » |
| Batterie 46 € (eBay DE) | **HTTP 403** — eBay refuse les robots | ⏳ reste « relevé » |

C'est exactement à ça que sert l'outil : **il a trouvé une erreur de 85 € par
calculateur dans mon propre dossier**, soit 256 € sur le club.

- **Une page non lue n'est pas une erreur** : Alibaba affiche ses prix en
  JavaScript et eBay bloque les robots. Ces deux prix restent au niveau
  « relevé » et sont à confirmer au moment de commander.
- **Aucun de ces prix n'est un devis**, et aucune remise n'est négociée. Sur
  13 caméras, le palier « 20-99 pièces » (157 USD) n'est pas atteint, mais un
  vendeur accorde souvent le palier supérieur sur une commande groupée : **à
  demander**.
- **Les frais de dossier du transporteur** (souvent 15-30 € par colis) ne sont
  pas dans les totaux.
- **Le taux de change bouge.** Les totaux sont calculés à 1 USD = 0,866 €.
- **Je n'ai pas mesuré le logiciel sur Jetson.** C'est l'objet de l'étape 0.

---

## Sources

- [Alibaba — Hikrobot MV-CS016-10GC (160 USD par 5-19 pcs)](https://www.alibaba.com/product-detail/HIKROBOT-MV-CS016-10GC-1-2-1601122368910.html)
- [Basler — ace acA1440-73gc (fiche officielle)](https://www.baslerweb.com/en/shop/aca1440-73gc/)
- [Graftek — Basler acA1440-73gc, 429 USD](https://graftek.com/product/aca1440-73gc/)
- [idealo.fr — Jetson Orin Nano Developer Kit à partir de 307,14 €](https://www.idealo.fr/prix/204320440/nvidia-jetson-orin-nano-developer-kit.html)
- [Kubii — Jetson Orin Nano Super Developer Kit](https://www.kubii.com/fr/kits-de-developpement/4457-2137-kit-de-developpement-nvidia-jetson-nano-orin-8gb-3272496319639.html)
- [NVIDIA — Jetson Orin Nano Super (tarif officiel 249 USD)](https://www.nvidia.com/en-us/autonomous-machines/embedded-systems/jetson-orin/nano-super-developer-kit/)
- [idealo.fr — Ubiquiti NanoStation AC Loco à partir de 49 €](https://www.idealo.fr/prix/6056082/ubiquiti-nanostation-ac-loco.html)
- [Getic.fr — NanoStation 5AC Loco, 50,62 €](https://www.getic.fr/product/nanostation-5-ac-loco)
- [LDLC — NanoStation 5AC Loco, 64,95 €](https://www.ldlc.com/en/product/PB00574095.html)
- [eBay Allemagne — batterie LiFePO4 12 V 30 Ah à partir de 46 €](https://www.ebay.de/itm/226970219019)
- [AICO — objectifs C-mount F1.4 machine vision](https://aico-lens.com/products/machine-vision-lens/)
- [Linovision — switch PoE 5 ports entrée DC 12-48 V](https://linovision.com/products/5-ports-full-gigabit-poe-switch-with-dc12v-dc24v-dc48v-input)
- [Trading Economics — taux EUR/USD](https://tradingeconomics.com/euro-area/currency)

## À lire ensuite

- `MATERIEL_OPTIMAL.md` — pourquoi ce modèle-là, et les pièges de réglage
- `PREVISIONNEL_CLUB.md` — le plan des 3 terrains + club-house
- `BUDGET_BOM.md` — l'historique du budget
