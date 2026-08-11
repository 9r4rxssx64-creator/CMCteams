# ClayScore — Guide de montage et d'installation

**Du carton reçu au premier verdict affiché sur la tablette.**

---

## ⚠️ Honnêteté sur ce document

Je **n'ai jamais monté ce matériel physiquement**. Les étapes ci-dessous
découlent de la spécification, du code déjà écrit (qui, lui, est testé) et des
pratiques standard en vision industrielle. Chaque point marqué **« à confirmer
à réception »** est une hypothèse raisonnable à valider avec le matériel en
main. Rien n'est présenté comme vérifié sur le terrain — parce que ça ne l'est
pas encore.

**Durée annoncée dans la vidéo de démo : « prêt en 18 minutes ».** C'est un
objectif de communication pour une installation **répétée et rodée**, pas le
premier montage. Le premier prendra une demi-journée. C'est normal.

---

# PARTIE 1 — Assembler un pod (atelier, à la maison)

À faire **3 fois** — les **3 caméras sont en couleur** (voir `MATERIEL_OPTIMAL` § 2 : en monochrome, 9/27 au lieu de 27/27).
Temps : ~1 h par pod la première fois.

### Ce qu'il te faut sous la main
Perceuse + forets métal (Ø 16 mm et Ø 20 mm), tournevis cruciforme, joint
silicone, serre-câbles, un marqueur.

### Étape 1 — Préparer le caisson
1. Poser le caisson **ouvert**, face avant vers toi.
2. Placer la caméra dedans **objectif contre la face avant** et marquer au
   feutre le centre de l'objectif.
3. Percer un trou **de diamètre légèrement supérieur à l'objectif** sur la face
   avant (le hublot viendra par-dessus).
4. Percer **un trou Ø 16 mm sur le côté** pour le presse-étoupe (passage du
   câble Ethernet). Le mettre **vers le bas** : l'eau ne remonte pas.
5. **Ébavurer** les trous (une arête vive coupe un câble en un an).

### Étape 2 — Le hublot
1. Coller le hublot (verre/acrylique) sur le trou avant, **à l'extérieur**, au
   silicone, en cordon continu.
2. Laisser sécher **12 h** avant de continuer. *(Étape la plus tentante à
   bâcler, et la plus regrettée à la première pluie.)*

### Étape 3 — Monter la caméra
1. Visser l'objectif sur la caméra. ⚠️ **Ne jamais forcer** : si ça ne visse
   pas, c'est une histoire de monture C/CS → utiliser la bague de 5 mm.
2. Visser le filtre optique devant l'objectif (si tu en utilises un).
3. Fixer la caméra dans le caisson par ses **trous de fixation d'origine**
   (jamais collée) — objectif centré derrière le hublot.
4. Vérifier qu'il reste **~5 mm d'air** entre l'objectif et le hublot.

### Étape 4 — Câbler
1. Passer le câble Ethernet par le presse-étoupe **avant** de le brancher.
2. Brancher côté caméra, laisser **une boucle de mou** dedans (anti-arrachement).
3. Serrer le presse-étoupe.
4. Poser un **sachet de gel de silice** dans un coin.
5. Fermer, vérifier le joint, **marquer le pod au feutre : 1, 2 ou 3** — et
   marquer **le même numéro aux deux bouts du câble**.

### Étape 5 — Pour les 2 pods infrarouge
Fixer la couronne LED 850 nm **à l'extérieur** du caisson (elle chauffe, et à
l'intérieur elle éclairerait le hublot → voile blanc sur toute l'image).
Son alimentation passe par le **même presse-étoupe**, ou un second.

### ✅ Test avant de fermer définitivement
Brancher le pod au switch PoE, allumer, et vérifier depuis le hub :

```bash
arv-tool-0.8 --list          # doit lister la caméra
```

> Si rien n'apparaît : voir la section **Dépannage** en fin de document.

---

# PARTIE 2 — Le hub (la mallette centrale)

Tout ce qui n'est pas caméra tient dans **une seule caisse à outils étanche**
(~25 €, indispensable pour transporter le kit d'un stand à l'autre).

### Le schéma de câblage

```
   BATTERIE 12 V 30 Ah
        │  (+)  (−)
        ▼
   ┌─────────────────┐
   │  BORNIER 12 V   │  ← 1 fusible par départ (5 A suffit)
   │   à fusibles    │
   └──┬────┬────┬────┘
      │    │    │
      │    │    └──────────► ROUTEUR WiFi (12 V ou 5 V USB)
      │    │
      │    └───────────────► SWITCH PoE (12 V DC)
      │                          │  │  │
      │                          ▼  ▼  ▼   3 câbles Ethernet → POD 1, 2, 3
      │
      └────────────────────► JETSON (via son alim d'origine)
                                 │
                          ┌──────┴──────┐
                          │             │
                     SSD NVMe      MICRO USB
                     (interne)     (déporté 10-15 m)
                          │
                          └── 1 câble Ethernet → SWITCH PoE
                                                 (le hub voit les caméras)
```

### Règles de câblage
- **Un fusible par départ.** Une batterie 30 Ah peut débiter des centaines
  d'ampères en court-circuit.
- Le Jetson et le switch doivent être sur la **même prise Ethernet**, sinon le
  hub ne voit pas les caméras.
- **Le routeur peut rester séparé** (posé plus haut = meilleure portée WiFi).
- Le **micro se déporte** loin des tirs (10-15 m minimum) — sinon il sature.

### 🚩 Si ton switch PoE est en 230 V et pas en 12 V
Il faut un **convertisseur 12 V → 230 V (onduleur, ~40 €)**. Ça marche, mais
tu perds ~15-20 % d'autonomie (8,1 h → ~6,7 h) et tu ajoutes un point de panne.
**Le mieux reste de chercher un switch PoE alimenté en DC.** *(voir
`GUIDE_MATERIEL` § 8)*

### Bilan électrique (calculé)

| Élément | Conso |
|---|---:|
| Jetson Orin Nano (15 W) | 15 W |
| 3 caméras GigE | 9 W |
| Switch PoE | 5 W |
| Routeur WiFi | 5 W |
| SSD NVMe | 3 W |
| Micro USB | 1 W |
| **TOTAL** | **38 W** |

**12 V 30 Ah = 360 Wh → 9,5 h théoriques, ≈ 8,1 h réelles.**
→ Une journée de concours tient. **À confirmer par une mesure réelle** (un
wattmètre USB/DC à 12 € permet de vérifier en 1 minute).

---

# PARTIE 3 — Placer les pods sur le stand

**C'est l'étape qui décide de la précision du système.** Le reste est du
branchement ; ça, c'est de la géométrie.

### Le principe : deux yeux écartés voient la profondeur

Deux caméras qui regardent la même scène depuis deux points différents
permettent de calculer la **distance** du plateau (triangulation). Plus elles
sont **écartées**, plus la mesure est précise.

**Précision de la position 3D selon l'écartement** (objectif 12 mm, erreur de
lecture d'un demi-pixel) :

| Écartement des 2 pods | à 20 m | à 30 m | à 50 m |
|---|---|---|---|
| 0,35 m | ± 0,16 m | ± 0,37 m | ± 1,03 m |
| 0,80 m | ± 0,07 m | ± 0,16 m | ± 0,45 m |
| **1,50 m** | **± 0,04 m** | **± 0,09 m** | **± 0,24 m** |
| 2,50 m | ± 0,02 m | ± 0,05 m | ± 0,14 m |

**Conclusion : viser 1,5 à 2,5 m d'écartement entre les deux pods stéréo.**
Sous 0,50 m, la mesure de distance devient trop imprécise à 50 m pour être utile.

### Le placement recommandé

```
                    ↗ ↗ ↗   trajectoires des plateaux
                  ↗
        ═══════════════════   LANCEURS (fosse)
                  │
                  │  ~15-25 m
                  │
   [POD 1]────────┼────────[POD 2]     ← paire STÉRÉO, écartés de 1,5-2,5 m
      \           │           /           (ou plus si le terrain permet)
       \          │          /
        ────── PAS DE TIR ──────
                  │
              [POD 3]                  ← vue latérale / de secours
              (décalé de côté, ~10 m)

              🎤 MICRO ~10-15 m en arrière
```

### Les 6 règles de placement

1. **Derrière ou à côté des tireurs, jamais devant.** Sécurité absolue :
   **aucun matériel dans l'axe de tir**.
2. **Les 2 pods stéréo à la même hauteur**, écartés de 1,5-2,5 m, regardant
   **la même zone de ciel**.
3. **Le fond doit être du ciel**, pas des arbres qui bougent au vent. La
   détection de mouvement travaille beaucoup mieux sur un fond uniforme.
   *(Le logiciel gère les fonds complexes — les tests couvrent le fond forêt —
   mais le ciel reste plus fiable.)*
4. **Jamais le soleil dans le champ.** Orienter dos au soleil si possible.
   S'il faut tirer face au soleil : c'est là que le filtre IR sert.
5. **Le pod 3 en vue latérale** : il « voit » le plateau quand les deux autres
   sont éblouis ou quand un tireur passe devant. C'est le filet de sécurité —
   le logiciel comble automatiquement les occultations (jalon 6).
6. **Une fois calibré, on ne touche plus rien.** Un pod déplacé de 2 cm invalide
   la calibration stéréo.

---

# PARTIE 4 — Premier démarrage

### 1. Installer le logiciel sur le Jetson

```bash
git clone <dépôt>  /opt/clayscore
cd /opt/clayscore/clayscore
./install.sh --hardware
```

L'option `--hardware` installe Aravis (caméras GigE), PortAudio (micro),
hostapd/dnsmasq (WiFi local) et le service qui redémarre tout seul.

### 2. Vérifier que le logiciel tourne — **avant** de brancher la moindre caméra

```bash
source .venv/bin/activate
pytest                       # doit afficher 328 tests OK
python -m tools.bench --all  # doit afficher 100 % sur les 3 bancs
```

> **C'est le meilleur test de sérénité du projet** : si ça passe, le cerveau
> fonctionne, et tout problème ultérieur vient du matériel ou du placement.

### 3. Brancher les caméras et les déclarer

```bash
arv-tool-0.8 --list          # doit lister les 3 caméras
```

Puis éditer **un seul fichier** : `config/config.yaml`

```yaml
source:
  video:
    type: aravis        # ← au lieu de "file"
    width: 1440
    height: 1080
    fps: 50
    pixel_format: RGB8      # ⚠️ COULEUR obligatoire — jamais Mono8
  audio:
    type: mic           # ← au lieu de "file"
```

**C'est tout.** Aucune ligne de code à modifier pour passer de la simulation au
matériel réel — c'est le principe de conception du jalon 0.

### 4. Régler les objectifs (une seule fois, mais bien)

En visant la zone de vol, avec l'image en direct :

1. **La netteté** : demander à quelqu'un de tenir un plateau à la distance
   typique de casse (~25-30 m). Régler jusqu'à ce qu'il soit net. **Bloquer la
   bague** (vis ou goutte de vernis à ongles).
2. **Le diaphragme** : l'ouvrir au maximum (petit chiffre f/) → laisse entrer
   le plus de lumière → permet un temps d'exposition court.
3. **Le temps d'exposition** : le plus court possible.

**Flou de bougé d'un plateau à 25 m/s, à 30 m** (calculé) :

| Focale | 1/500 s | 1/1000 s | 1/2000 s | 1/4000 s |
|---|---|---|---|---|
| 8 mm | 3,9 px | 1,9 px | 1,0 px | 0,5 px |
| 12 mm | 5,8 px | 2,9 px | **1,4 px** ✅ | 0,7 px |
| 16 mm | 7,7 px | 3,9 px | 1,9 px | 1,0 px |

→ **Viser 1/2000 s.** À 1/500 s, un plateau qui ne fait que ~13 px de large est
étalé sur 6 px : il devient un trait, et la détection de la casse se dégrade.
Si 1/2000 s rend l'image trop sombre → **ouvrir plus le diaphragme**, monter
un objectif plus lumineux, ou accepter 1/1000 s (1,9 px de flou à 8 mm, encore
correct).

🔴 **Ne PAS passer en monochrome pour gagner de la lumière.** C'était le
conseil de la version précédente de ce guide, et il est faux : le verdict
reconnaît le plateau à son **orange**. Mesuré : **27/27 en couleur, 9/27 en
monochrome**, avec des erreurs sûres d'elles. Le logiciel refuse désormais un
format `Mono*` et bloque le départ d'épreuve sur un flux incolore.

### 5. Lancer le WiFi local et le serveur

```bash
sudo ./deploy/network.sh --mode auto     # réseau : autonome OU branché au club
sudo systemctl start clayscore           # démarre le hub
```

Le mode `auto` **rejoint le réseau du club s'il en existe un**, sinon il crée
son propre WiFi `ClayScore`. Le hub affiche lui-même l'adresse à taper et ce
qui cloche. Pour voir ce qui serait fait sans rien modifier :
`./deploy/network.sh --mode reseau --dry-run`

⚠️ **Les caméras restent sur leur propre réseau** (2ᵉ prise du hub), jamais sur
celui du club. L'appli le vérifie : onglet **📶 Réseau** → « caméras isolées ✅ ».

Détail complet des modes, du code d'accès et du dépannage : **`GUIDE_RESEAU`**.

Sur la tablette : se connecter au WiFi `ClayScore`, ouvrir
**`http://<ip-du-hub>:8000`**, puis « Ajouter à l'écran d'accueil » → l'appli
s'installe comme une vraie application.

### 6. Calibrer les corridors de vol

Lancer **10 à 20 plateaux d'essai** sans tirer dessus. Le logiciel apprend la
trajectoire « normale » (jalon 6) et saura ensuite reconnaître un départ
anormal → base de la détection **no bird** automatique.

⚠️ **À refaire à chaque changement de discipline ou de réglage de lanceur.**

---

# PARTIE 5 — Vérifier que ça marche vraiment

Ordre logique, du plus simple au plus complet :

| # | Test | Résultat attendu |
|---|---|---|
| 1 | `pytest` | 328 tests OK |
| 2 | `python -m tools.bench --all` | 100 % sur les 3 bancs |
| 3 | `arv-tool-0.8 --list` | 3 caméras listées |
| 4 | Ouvrir l'appli sur la tablette | Interface affichée, ✅ connecté |
| 5 | Taper dans les mains fort | Un coup de feu détecté |
| 6 | Lancer 1 plateau **sans tirer** | Lancement détecté → verdict **MANQUÉ** |
| 7 | Lancer 1 plateau **et le casser** | Verdict **CASSÉ**, ralenti visible |
| 8 | Lancer un plateau **déjà cassé** | **NO BIRD**, même tireur rejoue |
| 9 | Faire une série de 25 complète | Score juste, export CSV correct |

**Si les tests 1-2 passent mais que le 7 échoue, le problème est physique**
(placement, netteté, exposition, ou pod qui bouge) — **pas logiciel**. C'est
tout l'intérêt d'avoir validé le logiciel en simulation d'abord.

---

# Dépannage

| Symptôme | Cause probable | Solution |
|---|---|---|
| `arv-tool` ne voit aucune caméra | Pare-feu, ou IP dans un autre sous-réseau | Désactiver le pare-feu ; mettre le PC/Jetson en IP fixe `192.168.1.x` |
| Caméra vue, mais image noire | Exposition trop courte / bouchon d'objectif | Rallonger l'exposition, ouvrir le diaphragme, retirer le bouchon (oui, ça arrive) |
| Image « ondulée » ou saccadée | Câble Ethernet non Gigabit, ou trop long | Câble Cat6 < 100 m, port Gigabit |
| Plateau vu mais verdict toujours **AMBIGU** | Plateau trop petit à l'image | Objectif plus long (12 → 16 mm), ou rapprocher les pods |
| Détections partout sans plateau | Le pod **bouge** (vent) ou arbres en fond | Renforcer la fixation ; réorienter vers le ciel |
| Coups de feu non détectés | Micro trop loin | Rapprocher (mais > 10 m du pas de tir) |
| Coups de feu comptés en double | Écho sur un mur/bâtiment | Augmenter `min_gap_s` dans `config.yaml` |
| L'appli tablette ne se connecte pas | Mauvais WiFi, ou service arrêté | `sudo systemctl status clayscore` |
| Ralentis qui ne se lisent pas | ffmpeg absent | `pip install imageio-ffmpeg` *(bug déjà corrigé, mais la dépendance doit être présente)* |
| Buée sur le hublot le matin | Humidité enfermée | Gel de silice, à remplacer périodiquement |

---

# Sécurité — non négociable

1. **Aucun matériel dans l'axe de tir.** Jamais. Un pod ne coûte que 200 € ;
   un accident n'a pas de prix.
2. **Prévenir le responsable du stand** avant toute installation, et respecter
   son règlement intérieur.
3. **Protection auditive** pendant l'installation comme pendant les essais.
4. **Câbles enterrés, sous gaine ou plaqués** : personne ne doit trébucher.
5. **Batterie hors de portée**, sur un support sec et stable.
6. **Droit à l'image** : filmer des tireurs exige leur **accord écrit** (déjà
   mentionné dans le plan vidéo).

---

👉 Suite : **`CHECKLIST_PROTOTYPE`** — la marche à suivre, dans l'ordre, de la
commande à la première démonstration.
