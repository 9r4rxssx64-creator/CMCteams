# ClayScore — Devis comparatif · kit de validation (étape 0)

**Tous les liens sont cliquables et testés automatiquement** par le workflow `clayscore-verif-prix` : un lien mort est signalé, pas laissé dans un devis.

Confiance du prix : **✅ lu sur la fiche produit** · **🟢 vu en recherche datée** · **🟡 hypothèse à confirmer**.

---

## 1. Le comparatif — qui vend le moins cher

Un lien 🛒 mène à **la fiche du produit** (un clic, panier). Un lien 🔎 mène à **une recherche** : aucune fiche précise n'a été identifiée, il reste à choisir. On ne fait pas passer l'un pour l'autre.

### Calculateur — 1 à acheter

| | Vendeur | Pays | Prix unitaire | Lien | Remarque |
|:--:|---|:--:|---:|---|---|
| **✔** | Gotronic — Jetson Orin Nano Super | FR | ✅ 392.50 € | [🛒 Acheter](https://www.gotronic.fr/art-jetson-orin-nano-8gb-devkit-46547.htm) | LE MOINS CHER vérifié. Retenu. |
|  | Kubii — Jetson Orin Nano Super | FR | ✅ 465.00 € | [🛒 Acheter](https://www.kubii.com/fr/kits-de-developpement/4457-2137-kit-de-developpement-nvidia-jetson-nano-orin-8gb-3272496319639.html) | +18 % par rapport à Gotronic pour le même produit. |
|  | RS France — Jetson Orin Nano Super | FR | 🟡 — | [🛒 Acheter](https://fr.rs-online.com/web/p/modules-de-developpement-pour-processeurs/2647384) | Distributeur officiel : utile si Gotronic est en rupture. |

### Camera — 2 à acheter

| | Vendeur | Pays | Prix unitaire | Lien | Remarque |
|:--:|---|:--:|---:|---|---|
| **✔** | Alibaba — Hikrobot MV-CS016-10GC | CN | 🟢 138.66 € | [🛒 Acheter](https://www.alibaba.com/product-detail/HIKROBOT-MV-CS016-10GC-1-2-1601122368910.html) | 160 USD par 5-19 pièces · 157 par 20-99 · GigE + COULEUR + global shutter, 65,2 img/s. Prix affiché en JavaScript : non lisible automatiquement. |
|  | Basler acA1440-73gc (équivalent UE) | UE | 🟢 371.77 € | [🛒 Acheter](https://www.baslerweb.com/en/shop/aca1440-73gc/) | Comparatif : 2,7x le prix du Hikrobot pour +8 img/s dont on n'a pas besoin. Écarté. |
|  | AliExpress — Hikrobot MV-CS016-10GC | CN | 🟡 — | [🛒 Acheter](https://www.aliexpress.com/item/1005009578278144.html) | Même référence, à l'unité : utile pour commander 1 ou 2 caméras à l'étape 0 sans passer par un minimum de commande. |

### Objectif — 4 à acheter

| | Vendeur | Pays | Prix unitaire | Lien | Remarque |
|:--:|---|:--:|---:|---|---|
| **✔** | AliExpress — objectifs monture C 5 MP (8 et 12 mm) | CN | 🟢 36.00 € | [🔎 Chercher](https://fr.aliexpress.com/w/wholesale-8mm-12mm-c-mount-machine-vision-lens-f1.4.html) | Prendre du F1.4. Commander AVEC les caméras (même vendeur = un seul dédouanement). |

---

## 2. Le devis — un panier par vendeur

C'est ce qu'on exécute. Grouper chez un même vendeur évite de payer plusieurs fois les frais de port — et, pour la Chine, plusieurs dédouanements.

### AliExpress — objectifs monture C 5 MP (8 et 12 mm)

| Pièce | Qté | P.U. | Total | Lien |
|---|---:|---:|---:|---|
| objectif | 4 | 36.00 € | 144.00 € | [🔎 Chercher](https://fr.aliexpress.com/w/wholesale-8mm-12mm-c-mount-machine-vision-lens-f1.4.html) |
| **Sous-total AliExpress — objectifs monture C 5 MP (8 et 12 mm)** | | | **144.00 €** | |

### Alibaba — Hikrobot MV-CS016-10GC

| Pièce | Qté | P.U. | Total | Lien |
|---|---:|---:|---:|---|
| camera | 2 | 138.66 € | 277.32 € | [🛒 Acheter](https://www.alibaba.com/product-detail/HIKROBOT-MV-CS016-10GC-1-2-1601122368910.html) |
| **Sous-total Alibaba — Hikrobot MV-CS016-10GC** | | | **277.32 €** | |

### Gotronic — Jetson Orin Nano Super

| Pièce | Qté | P.U. | Total | Lien |
|---|---:|---:|---:|---|
| calculateur | 1 | 392.50 € | 392.50 € | [🛒 Acheter](https://www.gotronic.fr/art-jetson-orin-nano-8gb-devkit-46547.htm) |
| **Sous-total Gotronic — Jetson Orin Nano Super** | | | **392.50 €** | |

---

## 3. Récapitulatif

| | Montant |
|---|---:|
| **Kit de validation (étape 0)** | |
| Total HT | **813.82 €** |
| dont 🇨🇳 Chine | 421.32 € |
| dont 🇪🇺 Europe | 392.50 € |
| TVA 20 % sur la part chinoise | +84.26 € |
| **TOTAL LIVRÉ** | **898.08 €** |

> ⚠️ **Ce devis n'engage aucun vendeur.** Il est construit à partir de prix publics, dont certains lus sur la fiche (✅) et d'autres vus en recherche (🟢) ou estimés (🟡). Les **frais de port** et les **frais de dossier de douane** (15-30 € par colis) ne sont PAS compris. Sur 13 caméras, demander le palier « 20-99 pièces » au vendeur : c'est 3 € de moins par pièce.

