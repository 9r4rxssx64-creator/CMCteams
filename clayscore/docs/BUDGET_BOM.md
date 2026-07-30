# ClayScore — Budget & nomenclature (BOM)

> Feuille de budget pour le **prototype config max** et l'économie par kit.
> ⚠️ **Chiffres = hypothèses de planification de Kevin, non vérifiés ici.**
> Les prix fournisseurs sont des **cibles à confirmer** (devis/négociation).
> Mis à jour : 30/07/2026.

## A. Nomenclature du prototype (configuration complète v3)

| Poste | Détail | Qté | Prix cible unit. | Total cible | Source |
|---|---|---:|---:|---:|---|
| Caméras industrielles | Hikrobot MV-CS016 (2 mono + 1 couleur, global shutter) | 3 | ~180 € | ~540 € | [Alibaba](https://www.alibaba.com/product-detail/HIKROBOT-MV-CS016-10GC-1-2-1601122368910.html) |
| Objectifs | montures C, focale adaptée | 3 | ~35 € | ~105 € | même vendeur caméras |
| Éclairage / filtre IR 850 nm | anti contre-jour, tous temps | 1 lot | ~60 € | ~60 € | [AliExpress](https://fr.aliexpress.com/item/32757408525.html) |
| Filtres optiques | passe-bande / polarisant | 3 | ~15 € | ~45 € | même vendeur |
| Caissons IP66 génériques | boîtes alu étanches (pods) | 3 | ~15 € | ~45 € | générique |
| Hub IA | NVIDIA Jetson Orin Nano (prix officiel) | 1 | ~280 € | ~280 € | [Silicon Highway](https://www.siliconhighwaydirect.com/product-p/945-13766-0005-000.htm) / [Arrow](https://www.arrow.com/en/products/945-13766-0000-000/nvidia.html) |
| Stockage | SSD NVMe (clips + base) | 1 | ~40 € | ~40 € | Amazon.fr / LDLC |
| Switch PoE | alim + data caméras GigE | 1 | ~60 € | ~60 € | [LDLC](https://www.ldlc.com/en/product/PB00266981.html) |
| Routeur WiFi local | réseau autonome sans Internet | 1 | ~40 € | ~40 € | [GL.iNet](https://www.gl-inet.com/en-us/products) |
| Micro USB | détection coups de feu | 1 | ~25 € | ~25 € | Amazon.fr |
| Batterie | LiFePO4 12 V 30 Ah (1 journée) | 1 | ~130 € | ~130 € | Amazon.fr |
| Câblage / connectique | GigE, alim, étanche | 1 lot | ~50 € | ~50 € | générique |
| Trépieds / piquets pods | fixation terrain | 3 | ~15 € | ~45 € | générique |
| **Total matériel prototype** | | | | **≈ 1 465 €** | |

*Fourchette annoncée : **1 450 – 1 550 €** config max (prix échantillon négociés,
commande Chine groupée chez ≤ 2 vendeurs, un seul passage en douane).*
**Logiciel : 0 € de licence** (pile open source — le logiciel est déjà développé,
jalons 0→8, voir `README.md`).

## B. Investissement total avant premières ventes (~9 000 €, hypothèse)

| Poste | Estimation |
|---|---:|
| 2 unités de démo (prototype + 1 kit vitrine) | ~2 900 € |
| Vidéo de démonstration (trépied, micro, etc.) | ~55 – 145 € |
| Déplacements / démos clubs & concours | ~800 € |
| Création société Monaco + frais admin | ~500 € |
| Marquage CE / conformité (tests, doc) | ~1 500 € |
| Marketing (site, impressions, salons) | ~800 € |
| Marge de sécurité / imprévus | ~2 300 € |
| **Total (ordre de grandeur)** | **≈ 9 000 €** |

## C. Économie par kit (hypothèse)

| Indicateur | Valeur |
|---|---:|
| Coût de revient / kit | ~1 430 € |
| Prix de vente / kit | ~2 200 € |
| **Marge nette / kit** | **~770 € (≈ 35 %)** |
| Seuil de rentabilité | **~12 kits vendus** (12 × 770 € ≈ 9 240 € ≈ investissement) |
| Levier location (concours) | 150 – 250 € / week-end |

## D. À confirmer avant d'engager les dépenses

1. **Devis fournisseurs réels** (Alibaba/AliExpress/LDLC/Arrow) — les prix ci-dessus sont des cibles.
2. **Coût réel du marquage CE** (peut varier fortement) — poste le plus incertain.
3. **Fiscalité Monaco** (impôt sur les bénéfices 25 % si > 25 % du CA hors Monaco) — voir `DOSSIER_BUSINESS.md`, à valider Welcome Business Office.
4. **Volumes** : la marge 35 % suppose des prix d'achat en petite série ; ils baissent à volume.

*Ce fichier est un outil de planification, pas un devis engageant.*
