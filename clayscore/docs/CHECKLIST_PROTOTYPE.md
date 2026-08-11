# ClayScore — Checklist du prototype

**La marche à suivre, dans l'ordre, de « je n'ai rien » à « je fais une
démonstration à un club ».** À cocher au fur et à mesure.

> Le logiciel est **déjà fait et testé** (281 tests verts). Tout ce qui suit
> concerne le **matériel** et la **preuve sur le terrain**.

---

## Phase 0 — Gratuit, à faire **avant** de dépenser 1 €

*Durée : 1 à 2 week-ends · Coût : 0 €*

> **La chose la plus rentable du projet.** Filmer de vraies casses ne coûte
> rien et répond à la seule question qui compte : *est-ce que la précision de
> 100 % obtenue en simulation tient sur du vrai ?*

- [ ] Aller sur un stand avec le téléphone
- [ ] Filmer **20-30 casses** en mode **ralenti 240 fps**, sur trépied (~25 €),
      exposition et mise au point **verrouillées** (appui long sur l'écran)
- [ ] Filmer aussi : **5 manqués nets**, **2 no-birds**, **2 séquences fond
      forêt** (pas seulement ciel bleu)
- [ ] Noter pour chaque plateau la vraie réponse (cassé / manqué / no bird) —
      c'est ta **vérité terrain**
- [ ] Rejouer ces vidéos dans le logiciel : `config.yaml` → `type: file`
- [ ] **Mesurer** le taux de bonnes réponses sur du réel

**🚦 Point de décision :**
- **> 85 %** → excellent, commander le matériel en confiance
- **60-85 %** → normal, il faudra ajuster les seuils (`config.yaml`) avec de
  vraies images : ça se fait, et c'est même prévu pour
- **< 60 %** → comprendre pourquoi **avant** de dépenser 1 465 €

*(Bénéfice bonus : ces vidéos sont exactement les plans « signature » du plan
vidéo de démonstration.)*

---

## Phase 1 — Commander

*Durée : 3 à 5 semaines (délai Chine) · Coût : ~1 465 €*

**Ordre important** — le Jetson d'abord (délais), la Chine ensuite (long),
l'Europe en dernier (48 h, et on connaît alors les vraies dimensions).

- [ ] **Jetson Orin Nano** — au **prix officiel uniquement** (~280 €)
      → [Silicon Highway](https://www.siliconhighwaydirect.com/product-p/945-13766-0005-000.htm)
      · [Arrow](https://www.arrow.com/en/products/945-13766-0000-000/nvidia.html)
- [ ] **Demander les devis échantillon** au vendeur chinois (courriers de
      négociation prêts dans Gmail — objectif −10 à −20 %)
- [ ] **Commande Chine groupée**, chez **1 ou 2 vendeurs maximum** :
      3 caméras + 3 objectifs (**8 mm ET 12 mm si possible**) + filtres + IR
      → [Alibaba – Hikrobot MV-CS016](https://www.alibaba.com/product-detail/HIKROBOT-MV-CS016-10GC-1-2-1601122368910.html)
      · [AliExpress – IR 850 nm](https://fr.aliexpress.com/item/32757408525.html)
- [ ] **Demander au vendeur, par écrit** : monture C ou CS ? diamètre de filtre ?
      PoE inclus ? compatible Aravis/GenICam ?
- [ ] **Commande Europe** :
      [switch PoE (LDLC)](https://www.ldlc.com/en/product/PB00266981.html) ·
      [routeur GL.iNet](https://www.gl-inet.com/en-us/products) ·
      [SSD NVMe 500 Go](https://www.ldlc.com/recherche/ssd%20m.2%20nvme%20500%20go/) ·
      [micro USB](https://www.amazon.fr/s?k=micro+USB+omnidirectionnel+conf%C3%A9rence) ·
      [batterie LiFePO4 12V 30Ah](https://www.amazon.fr/s?k=batterie+LiFePO4+12V+30Ah) +
      son chargeur
- [ ] **Quincaillerie** : [caissons IP66](https://www.amazon.fr/s?k=bo%C3%AEtier+%C3%A9tanche+IP66+aluminium) ·
      [câble Ethernet extérieur Cat6](https://www.amazon.fr/s?k=c%C3%A2ble+ethernet+ext%C3%A9rieur+cat6+30m) ·
      presse-étoupes · [trépieds](https://www.amazon.fr/s?k=tr%C3%A9pied+photo+lourd) ·
      bornier à fusibles · gel de silice · caisse à outils étanche
- [ ] **Prévoir les frais de douane** sur le colis chinois (TVA 20 % + frais de
      dossier) — souvent oublié dans les budgets

📋 Détail complet de chaque poste : **`GUIDE_MATERIEL`**

---

## Phase 2 — Pendant l'attente de la livraison

*Durée : les 3-5 semaines d'attente · Coût : 0 €*

Rien n'oblige à attendre les bras croisés. Tout est faisable **sans matériel** :

- [ ] Installer le logiciel sur un ordinateur : `./install.sh --dev`
- [ ] Lancer `pytest` → **281 tests OK**
- [ ] Lancer `python -m tools.bench --all` → **100 %** sur les 3 bancs
- [ ] Faire tourner une **partie complète en simulation** et prendre en main
      l'interface tablette
- [ ] **Ajuster les seuils** avec les vidéos de la Phase 0
- [ ] Exporter des ralentis habillés (`python -m tools.overlay`) → prêts pour
      la vidéo de démonstration
- [ ] Monter la **vidéo concept** (voir `DOSSIER_VIDEO`) — utilisable dès
      maintenant pour MonacoTech et les premiers contacts
- [ ] Prendre rendez-vous avec le **Welcome Business Office** (gratuit)
- [ ] Faire vérifier la **clause d'activité secondaire** du contrat SBM
- [ ] Contacter **1 ou 2 présidents de clubs** pour un accord de test terrain

---

## Phase 3 — Assemblage

*Durée : 1 week-end · Coût : 0 € de plus*

- [ ] **Tout déballer et tout vérifier** avant de percer quoi que ce soit
      (comptage, casse, conformité à la commande)
- [ ] **Vérifier la monture** (C/CS) : l'objectif se visse-t-il sans forcer ?
- [ ] **Vérifier le diamètre des filtres** sur les objectifs reçus
- [ ] Percer les 3 caissons, coller les hublots → **laisser sécher 12 h**
- [ ] Monter les 3 pods (caméra + objectif + filtre + presse-étoupe + silice)
- [ ] Câbler le hub dans la caisse (bornier + fusibles + switch + Jetson +
      routeur + SSD)
- [ ] **Mesurer la consommation réelle** avec un wattmètre → comparer aux 38 W
      calculés
- [ ] **Test d'étanchéité** : arroser un pod au jet 30 s, ouvrir, vérifier
      qu'il est sec à l'intérieur

📋 Pas à pas illustré : **`GUIDE_MONTAGE`**

---

## Phase 4 — Premier allumage (sur une table, pas encore sur le stand)

*Durée : une demi-journée*

- [ ] `./install.sh --hardware` sur le Jetson
- [ ] `pytest` → toujours 130 OK (le matériel ne doit rien casser)
- [ ] `arv-tool-0.8 --list` → **3 caméras détectées**
- [ ] `config/config.yaml` → `type: aravis` + `type: mic`
- [ ] **Image en direct** vue depuis les 3 caméras
- [ ] Taper dans les mains → **coup de feu détecté**
- [ ] Réseau appliqué : `sudo ./deploy/network.sh --mode auto`
- [ ] Tablette connectée, **appli installée** sur l'écran d'accueil
- [ ] `http://clayscore.local:8000` répond (sinon utiliser l'adresse affichée)
- [ ] Onglet **📶 Réseau** : mode correct + « caméras isolées ✅ »
- [ ] **Code d'accès renseigné** (`network.access_pin`) si le hub est branché
      sur le réseau d'un club — obligatoire en concours
- [ ] **Test batterie** : laisser tourner 8 h en intérieur → vérifier
      l'autonomie annoncée
- [ ] Redémarrage automatique testé : couper le courant en pleine partie →
      la partie **doit reprendre où elle en était** (reprise après plantage,
      jalon 7)

---

## Phase 5 — Premier essai sur le stand ⭐

*Durée : une matinée · **L'étape de vérité***

- [ ] **Autorisation du responsable du stand** obtenue
- [ ] Pods placés **derrière/à côté** des tireurs, **jamais dans l'axe de tir**
- [ ] Les 2 pods stéréo écartés de **1,5-2,5 m**, même hauteur, même zone
      *(0,35 m → ±1 m d'erreur à 50 m ; 1,5 m → ±0,24 m : ça change tout)*
- [ ] Pod 3 en vue latérale
- [ ] Micro à **10-15 m en arrière**
- [ ] Objectifs réglés : **netteté à 25-30 m**, exposition **1/2000 s**, bagues
      **bloquées**
- [ ] **Calibration des corridors** : 10-20 plateaux lancés sans tirer
- [ ] **Série de 25 plateaux, réponses notées à la main en parallèle**
- [ ] **Comparer** ClayScore vs la feuille papier → **c'est le chiffre qui
      compte pour tout le reste du projet**

**🚦 Point de décision :**
- **≥ 95 %** → le produit existe. Passer en Phase 6.
- **85-95 %** → très bon départ : ajuster seuils, objectifs, placement, et
  refaire une série.
- **< 85 %** → analyser les erreurs une par une (l'appli archive chaque cas
  arbitré, jalon 8 : ces cas servent à ré-entraîner l'IA).

---

## Phase 6 — Preuve et démonstration

- [ ] **Tourner la vraie vidéo** (le script complet est dans `DOSSIER_VIDEO`)
- [ ] Faire **3 séries dans 3 conditions différentes** : plein soleil, ciel
      couvert, fin de journée → et publier les chiffres **honnêtement**
- [ ] **Démonstration à un club** en conditions réelles
- [ ] Faire **signer un test terrain** par un président de club (témoignage)
- [ ] Envoyer le dossier à **Laporte** (courriers FR/EN prêts dans
      `EMAIL_LAPORTE`)
- [ ] Candidater à **MonacoTech**
- [ ] Lancer le **marquage CE** (poste le plus incertain du budget — s'y
      prendre tôt)

---

## Les 8 pièges qui coûtent le plus cher

| # | Piège | Conséquence | Parade |
|---|---|---|---|
| 1 | Caméra **rolling shutter** | Plateau déformé → **tout est à refaire** | Exiger « global shutter » **par écrit** |
| 2 | Sauter la **Phase 0** | 1 465 € dépensés sans savoir si ça marche | Filmer d'abord. C'est gratuit. |
| 3 | Pods **trop rapprochés** | Distance imprécise, verdicts douteux | 1,5-2,5 m minimum |
| 4 | Pod qui **bouge** au vent | Détections fantômes partout | Piquet planté > trépied léger |
| 5 | **Exposition trop longue** | Plateau flou → casse invisible | 1/2000 s |
| 6 | **Micro trop près** | Saturation, coups ratés | 10-15 m en arrière |
| 7 | Switch PoE **230 V** | −20 % d'autonomie + une panne possible | Chercher un switch **DC** |
| 8 | **Douane oubliée** | +20 % surprise sur le colis chinois | Budgéter la TVA à l'import |

---

## Récapitulatif

| Phase | Durée | Coût | Sortie |
|---|---|---|---|
| 0 — Filmer | 1-2 week-ends | **0 €** | Précision réelle mesurée |
| 1 — Commander | 3-5 semaines | ~1 465 € | Matériel livré |
| 2 — Préparer | (en parallèle) | 0 € | Logiciel réglé, vidéo concept, RDV pris |
| 3 — Assembler | 1 week-end | 0 € | 3 pods + hub |
| 4 — Allumer | ½ journée | 0 € | Système fonctionnel sur table |
| 5 — Terrain | 1 matinée | 0 € | **Le chiffre qui compte** |
| 6 — Prouver | continu | ~200 € | Vidéo, témoignages, contacts |

**Total : ~1 665 € et environ 2 mois**, dont 5 semaines d'attente passive.

---

## Et si ça ne marche pas du premier coup ?

C'est **le cas normal**, pas l'échec. Le logiciel est conçu pour ça :

- Chaque cas ambigu **te demande de trancher** — aucun point douteux n'est
  attribué tout seul ;
- **Ta décision est archivée** et sert à ré-entraîner l'IA (jalon 8) ;
- Les seuils s'ajustent dans `config.yaml`, **sans toucher au code** ;
- Un **repli automatique** existe partout (IA absente, ffmpeg absent, matériel
  absent) : le système ne tombe jamais en panne à cause d'un composant manquant.

**Le vrai risque n'est pas que ça marche à 85 % au lieu de 98 %.
C'est de dépenser 1 465 € sans avoir fait la Phase 0.**
