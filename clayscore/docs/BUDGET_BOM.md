# ClayScore — Budget & nomenclature (BOM)

> Feuille de budget pour le **prototype config max** et l'économie par kit.
> ⚠️ **Chiffres = hypothèses de planification de Kevin, non vérifiés ici.**
> Les prix fournisseurs sont des **cibles à confirmer** (devis/négociation).
> Mis à jour : 30/07/2026.

## A. Nomenclature du prototype (configuration complète v3)

| Poste | Détail | Qté | Prix cible unit. | Total cible | Acheter |
|---|---|---:|---:|---:|---|
| Caméras industrielles | Hikrobot **MV-CS016-10GC** (**3 × COULEUR**, global shutter, GigE+PoE) | 3 | ~139 € | ~417 € | ▸ [Alibaba (lien direct)](https://www.alibaba.com/product-detail/HIKROBOT-MV-CS016-10GC-1-2-1601122368910.html) |
| Objectifs | monture C, focale **8 et/ou 12 mm** | 3 | ~35 € | ~105 € | ▸ même vendeur · [recherche AliExpress](https://fr.aliexpress.com/w/wholesale-C-mount-12mm-machine-vision-lens.html) |
| Éclairage / filtre IR 850 nm | anti contre-jour, tous temps | 1 lot | ~60 € | ~60 € | ▸ [AliExpress (lien direct)](https://fr.aliexpress.com/item/32757408525.html) |
| Filtres optiques | passe-bande 850 nm / polarisant | 3 | ~15 € | ~45 € | ▸ même vendeur · [recherche AliExpress](https://fr.aliexpress.com/w/wholesale-850nm-bandpass-filter.html) |
| Caissons IP66 | boîtes alu étanches (pods) | 3 | ~15 € | ~45 € | ▸ [recherche Amazon](https://www.amazon.fr/s?k=bo%C3%AEtier+%C3%A9tanche+IP66+aluminium) · [AliExpress](https://fr.aliexpress.com/w/wholesale-IP66-aluminum-enclosure-box.html) |
| Hub IA | NVIDIA Jetson Orin Nano (**prix officiel**) | 1 | ~280 € | ~280 € | ▸ [Silicon Highway](https://www.siliconhighwaydirect.com/product-p/945-13766-0005-000.htm) · [Arrow](https://www.arrow.com/en/products/945-13766-0000-000/nvidia.html) |
| Stockage | SSD NVMe 500 Go M.2 (clips + base) | 1 | ~40 € | ~40 € | ▸ [recherche LDLC](https://www.ldlc.com/recherche/ssd%20m.2%20nvme%20500%20go/) · [Amazon](https://www.amazon.fr/s?k=SSD+M.2+NVMe+500+Go) |
| Switch PoE | alim + data caméras GigE (**entrée DC de préférence**) | 1 | ~60 € | ~60 € | ▸ [LDLC (lien direct)](https://www.ldlc.com/en/product/PB00266981.html) · [recherche](https://www.ldlc.com/recherche/switch%20poe%205%20ports/) |
| Routeur WiFi local | réseau autonome sans Internet | 1 | ~40 € | ~40 € | ▸ [GL.iNet (lien direct)](https://www.gl-inet.com/en-us/products) · [Amazon](https://www.amazon.fr/s?k=GL.iNet+routeur+voyage) |
| Micro USB | détection coups de feu, omnidirectionnel | 1 | ~25 € | ~25 € | ▸ [recherche Amazon](https://www.amazon.fr/s?k=micro+USB+omnidirectionnel+conf%C3%A9rence) |
| Batterie | LiFePO4 12 V 30 Ah (**8,1 h mesurés en calcul**) | 1 | ~130 € | ~130 € | ▸ [recherche Amazon](https://www.amazon.fr/s?k=batterie+LiFePO4+12V+30Ah) |
| Câblage / connectique | Cat6 **extérieur**, presse-étoupes, bornier à fusibles | 1 lot | ~50 € | ~50 € | ▸ [recherche Amazon](https://www.amazon.fr/s?k=c%C3%A2ble+ethernet+ext%C3%A9rieur+cat6+30m) · [LDLC](https://www.ldlc.com/recherche/cable%20reseau%20exterieur%20cat6/) |
| Trépieds / piquets pods | fixation terrain **rigide** | 3 | ~15 € | ~45 € | ▸ [recherche Amazon](https://www.amazon.fr/s?k=tr%C3%A9pied+photo+lourd) |
| **Total matériel prototype** | | | | **≈ 1 465 €** | |

**Extras conseillés (petites pièces qu'on découvre toujours au montage) :**

| Poste | Détail | ~Prix | Acheter |
|---|---|---:|---|
| 2ᵉ jeu d'objectifs | 8 mm **et** 12 mm pour choisir sur le terrain | +70 € | ▸ même vendeur |
| Chargeur LiFePO4 | dédié (un chargeur plomb abîme une LiFePO4) | +25 € | ▸ [recherche Amazon](https://www.amazon.fr/s?k=chargeur+LiFePO4+12V) |
| Hublots, presse-étoupes, gel de silice, visserie | étanchéité des pods | +30 € | ▸ [recherche presse-étoupe PG9](https://www.amazon.fr/s?k=presse+%C3%A9toupe+PG9) |
| Caisse à outils étanche | transport du hub | +25 € | ▸ [recherche Amazon](https://www.amazon.fr/s?k=caisse+%C3%A0+outils+%C3%A9tanche) |
| **Total réaliste avec extras** | | **≈ 1 615 €** | |

> 🔴 **CORRECTION 11/08/2026 — les 3 caméras doivent être COULEUR.**
> La version précédente de ce budget prévoyait « 2 mono + 1 couleur ». C'est
> une **erreur qui aurait cassé le produit** : le verdict repose sur la
> reconnaissance de l'**orange** du plateau. **Mesuré** sur le banc des 27
> scénarios : couleur **27/27**, monochrome **9/27** — et chaque « cassé »
> devient « manqué » avec une confiance de 0,72, donc **sans jamais être
> signalé comme ambigu**. Faux, et sûr de lui. Le logiciel refuse désormais de
> démarrer une épreuve sur un flux sans couleur (contrôle GO/NO-GO
> « Caméras en couleur »). Détail : `MATERIEL_OPTIMAL.md` § 2.
>
> 💶 **Prix révisés 12/08/2026** d'après des offres publiques réellement
> relevées — et, pour trois d'entre elles, **lues sur la fiche produit
> elle-même** après ouverture des pages marchandes (voir
> **`COMPARATIF_CHINE_UE.md`** et **`DEVIS_COMPARATIF.md`**) :
>
> | Poste | Cible initiale | Prix retenu | Vendeur | Confiance |
> |---|---:|---:|---|:--:|
> | Caméra `MV-CS016-10GC` couleur | 180 € | **138,66 €** 🇨🇳 | Alibaba (160 USD, 5-19 pcs) | 🟢 relevé |
> | Objectif monture C 8/12 mm | 35 € | **36,00 €** 🇨🇳 | AliExpress | 🟢 relevé |
> | Calculateur Jetson Orin Nano Super | 280 € | **392,50 €** 🇪🇺 | Gotronic | ✅ **lu sur la fiche** |
> | Batterie LiFePO4 12 V 30 Ah | 130 € | **46,00 €** 🇪🇺 | Amazon | 🟢 relevé |
> | Pont directionnel (la **paire**) | 120 € | **96,08 €** 🇪🇺 | Getic | ✅ **lu sur la fiche** |
>
> ⚠️ Les « **307 €** » du calculateur, repris d'un comparateur, étaient **faux
> de −22 %** : la vraie fiche affiche **392,50 €** chez Gotronic (465 € chez
> Kubii). C'est notre propre contrôle automatique des prix qui l'a trouvé.
> **Résultat : achat MIXTE** — optique de Chine, électronique et batteries
> d'Europe.
>
> 📉 **Le kit prototype de ce § A revient donc à ≈ 1 372 € HT** (≈ **1 477 €
> livré**, TVA comprise sur la part chinoise) au lieu des 1 465 € cibles :
> l'optique chinoise fait gagner plus que le calculateur ne fait perdre.
> Le **devis exécutable, avec un lien 1 clic par ligne**, est dans
> **`DEVIS_ETAPE_0.md`** (kit de validation) et **`DEVIS_COMPARATIF.md`**
> (club complet).
>
> ⚠️ **Sur les liens** : les liens « **lien direct** » sont ceux fournis par
> Kevin (dossier v4). Les liens « **recherche** » ouvrent une recherche sur le
> site, **pas une fiche produit précise** — les pages marchandes n'ont pas pu
> être ouvertes depuis l'environnement de développement, donc aucune référence
> produit n'a été inventée. Critères de choix détaillés dans **`GUIDE_MATERIEL`**.
>
> 💡 **Ne pas oublier la douane** sur le colis chinois : TVA 20 % + frais de
> dossier, souvent absents des budgets.

*Fourchette annoncée : **1 450 – 1 550 €** config max (prix échantillon négociés,
commande Chine groupée chez ≤ 2 vendeurs, un seul passage en douane).*
**Logiciel : 0 € de licence** (pile open source — le logiciel est déjà développé,
jalons 0→8, voir `README.md`).

## A-bis. Kit COMPÉTITION / GRANDE SURFACE (options)

Le kit de base (§ A) couvre une fosse câblée. Voici ce qu'il faut **en plus**
pour viser la compétition officielle et les grandes surfaces.

### Alimentation continue (aucune coupure possible)

| Poste | Détail | ~Prix | Acheter |
|---|---|---:|---|
| Chargeur LiFePO4 12 V | recharge sur secteur, batterie toujours en ligne | 25 € | ▸ [recherche Amazon](https://www.amazon.fr/s?k=chargeur+LiFePO4+12V) |
| Convertisseur DC-DC **isolé** | dérivation sur un lanceur, **en sécurité** | 20 € | ▸ [recherche Amazon](https://www.amazon.fr/s?k=convertisseur+DC+DC+isol%C3%A9+12V) |
| Porte-fusibles + fusibles | 1 fusible par départ | 10 € | ▸ [recherche Amazon](https://www.amazon.fr/s?k=porte+fusible+12V+auto) |
| Connecteurs Anderson | débrancher le lanceur en 5 s | 12 € | ▸ [recherche Amazon](https://www.amazon.fr/s?k=connecteur+anderson+powerpole) |
| Capteur INA226 | **mesurer** la conso au lieu de l'estimer | 8 € | ▸ [recherche Amazon](https://www.amazon.fr/s?k=INA226+capteur+courant) |
| **Sous-total alimentation** | | **~75 €** | |

### Poste de vue déporté sans fil (par poste)

| Poste | Détail | ~Prix | Acheter |
|---|---|---:|---|
| Calculateur de pod | rend le pod « intelligent » (il décide sur place) | 280 € | ▸ [Silicon Highway](https://www.siliconhighwaydirect.com/product-p/945-13766-0005-000.htm) |
| Caméra + objectif + caisson | identique au § A | 230 € | ▸ voir § A |
| Batterie 12 Ah + charge | autonomie ~12 h | 80 € | ▸ [recherche Amazon](https://www.amazon.fr/s?k=batterie+LiFePO4+12V+12Ah) |
| **Sous-total par poste déporté** | | **~590 €** | |

### Liaisons longue distance

| Poste | Portée | ~Prix | Acheter |
|---|---|---:|---|
| Pont WiFi directionnel 5 GHz (paire) | **> 1 km** | 120 € | ▸ [recherche LDLC](https://www.ldlc.com/recherche/pont%20wifi%20exterieur/) |
| Nœud WiFi maillé extérieur | ~150 m | 70 € | ▸ [recherche Amazon](https://www.amazon.fr/s?k=point+acc%C3%A8s+wifi+ext%C3%A9rieur+IP66) |
| Routeur 4G + SIM | illimitée | 30 € + abo | ▸ [recherche Amazon](https://www.amazon.fr/s?k=routeur+4G+ext%C3%A9rieur) |

### Récapitulatif des configurations

| Configuration | Contenu | Total cible | Total **révisé** (prix relevés) |
|---|---|---:|---:|
| **Base — une fosse câblée** | kit § A | ~1 465 € | **~1 372 € HT** · 1 477 € livré |
| **Compétition** | base + alimentation continue + extras | ~1 690 € | ~1 600 € HT |
| **Compétition + 1 poste déporté** | + pod intelligent + pont directionnel | ~2 400 € | ~2 400 € HT |
| **Parcours (3 zones déportées)** | + 3 pods intelligents + liaisons | ~3 580 € | ~3 580 € HT |
| **🎯 Club réel — 3 terrains + club-house** | 13 caméras d'arbitrage, 6 caméras de diffusion, 3 calculateurs, 3 ponts | — | **6 551 € HT** · **7 138 € livré** |

> Les deux dernières lignes « cible » n'ont **pas** été recalculées poste par
> poste : elles restent des ordres de grandeur. La ligne **Club réel** est
> calculée par le logiciel lui-même (`clayscore.site`), vendeur par vendeur,
> et détaillée dans **`DEVIS_COMPARATIF.md`** avec un lien 1 clic par ligne.
> En configuration *minimum* (sans caméra de secours, un seul jeu
> d'objectifs) : **5 424 € HT · 5 804 € livré**.

> ⚠️ La vidéo brute (**809 Mbit/s par caméra**) ne passera **jamais** sans fil.
> C'est le calculateur au pod qui rend le sans-fil possible, en ne transmettant
> que le verdict et un court ralenti (**0,2 Mbit/s**). Détail :
> `GUIDE_GRANDE_SURFACE`.

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
3. **Coût de l'agrément fédéral** — la FFBT n'a pas encore été contactée ; les conditions (et le coût) d'un dispositif d'aide à l'arbitrage sont inconnus. Voir `GUIDE_COMPETITION.md`.
4. **Fiscalité Monaco** (impôt sur les bénéfices 25 % si > 25 % du CA hors Monaco) — voir `DOSSIER_BUSINESS.md`, à valider Welcome Business Office.
5. **Volumes** : la marge 35 % suppose des prix d'achat en petite série ; ils baissent à volume.

*Ce fichier est un outil de planification, pas un devis engageant.*
