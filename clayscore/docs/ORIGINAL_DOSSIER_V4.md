# ClayScore — Dossier v4 (texte original, non modifié)

> **Texte de Kevin, reproduit mot pour mot**, sans annotation ni reformulation.
> La version commentée (avec les points à valider signalés) est dans
> `DOSSIER_BUSINESS`.

---

# ClayScore — Dossier v4 (mis à jour Monaco)
### Résumé exécutif · Stratégie « le max dès le début, à moindre coût » · Cadre monégasque

*30 juillet 2026 — remplace le dossier complet précédent pour les sections finances et statut.*

---

## Résumé exécutif (1 minute de lecture)

**Le produit** : ClayScore, système de comptage automatique pour toutes les disciplines du ball-trap (FU, FO, DTL, parcours de chasse, compak). 3 pods caméra industriels (global shutter, monochrome + couleur, infrarouge 850 nm), un hub IA NVIDIA Jetson, réseau WiFi local autonome sans Internet, pilotage sur tablette. Verdicts automatiques ~98-99 %, cas ambigus arbitrés sur ralenti d'un tap. Gestion complète de partie : 1-6 tireurs, multi-lanceurs, rotation automatique, no-bird/répète, doublés, mode concours et mode TV.

**Le marché** : aucun produit équivalent n'existe. 568 clubs FFBT et 23 000+ licenciés en France, plus les stands FFTir, les organisateurs de concours, l'export (UK, Italie, Espagne, USA) — et un partenaire industriel potentiel, Laporte (leader mondial des lanceurs), à 40 min de chez toi.

**Les chiffres** : ~1 450-1 680 € de prototype complet (config max, prix négociés), ~9 000 € d'investissement total avant les premières ventes, rentabilité vers le 12e kit vendu, ~770 € de marge nette par kit (35 %), levier location 150-250 €/week-end de concours.

**Ton cadre** : création à Monaco en tant que national (régime déclaratif simplifié, pas d'impôt sur le revenu, accompagnement Welcome Business Office, Monaco Boost, MonacoTech).

---

## 1. Stratégie « le max dès le début, à moindre coût »

Tu pars directement sur la **configuration complète v3** (3 pods, mono + couleur, IR, filtres, réseau autonome) — rien n'est retiré. Les économies viennent de la méthode d'achat, pas du contenu :

1. **Prix échantillon négociés** sur tout le colis Chine (courriers prêts dans Gmail) : −10 à −20 % réalistes → caméras + accessoires de ~950 € à **~800-850 €**.
2. **Une seule commande Chine groupée** chez 2 vendeurs max : port mutualisé, un seul passage en douane.
3. **Jetson au prix officiel uniquement** (249 $ + TVA ≈ 280 €) — jamais au prix spéculatif.
4. **Caissons IP66 génériques** à 45 € au lieu de caissons "machine vision" à 150+ € : même protection, c'est de la boîte alu.
5. **Batterie dimensionnée juste** : 12 V 30 Ah LiFePO4 suffit pour une journée complète — inutile de payer 50 Ah.
6. **Zéro licence logicielle** : toute la pile est open source ; ton coût logiciel, c'est ton temps avec moi (et Claude Code — voir le fichier de spécifications joint).

**Budget prototype config max, optimisé : ≈ 1 450-1 550 €** (au lieu de 1 680 €), sans rien sacrifier.

## 2. Cadre monégasque (remplace la section « statut » précédente)

- **Création** : en tant que Monégasque, régime déclaratif simplifié auprès de la Direction du Développement Économique. Accompagnement gratuit : **Welcome Business Office**.
- **Fiscalité** : pas d'impôt sur le revenu. Point à faire préciser : l'impôt sur les bénéfices (25 %) si plus de 25 % du CA est réalisé hors de Monaco (ce qui sera le cas en vendant aux clubs français). Même ainsi, cadre plus favorable que le régime français.
- **TVA / CE / douane** : Monaco étant dans le territoire douanier et TVA français, tout le dossier (livraisons Chine, marquage CE, ventes France/UE) s'applique à l'identique.
- **Accélérateurs réservés ou favorables aux nationaux** : **Monaco Boost** (domiciliation professionnelle à coût réduit — ton adresse société sans local) et **MonacoTech** (incubateur : un projet sport-tech + IA porté par un Monégasque est pile leur cible — financement et visibilité possibles).
- **SBM** : faire vérifier la clause d'activité secondaire de ton contrat avant la première facture. *(Je ne suis ni juriste ni fiscaliste — validation Welcome Business Office recommandée sur ces points.)*
- **Argument marketing bonus** : « conçu à Monaco » — crédibilité et image pour un produit premium, y compris à l'export.

## 3. Rappel des liens d'achat (inchangés)

Chine (groupé, prix échantillon à négocier) : caméras [Alibaba – MV-CS016](https://www.alibaba.com/product-detail/HIKROBOT-MV-CS016-10GC-1-2-1601122368910.html) · IR [AliExpress 850 nm](https://fr.aliexpress.com/item/32757408525.html) · objectifs/caissons/filtres : même vendeur que les caméras si possible.
Europe : Jetson [Silicon Highway](https://www.siliconhighwaydirect.com/product-p/945-13766-0005-000.htm) / [Arrow](https://www.arrow.com/en/products/945-13766-0000-000/nvidia.html) · switch PoE [LDLC](https://www.ldlc.com/en/product/PB00266981.html) · routeur [GL.iNet](https://www.gl-inet.com/en-us/products) · batterie/micro/SSD : Amazon.fr & LDLC.

Le plan d'amortissement, les scénarios de vente et la liste clients du dossier complet précédent restent valables tels quels.
