# ClayScore 🎯

Comptage **automatique** de points pour le ball-trap (tir aux plateaux d'argile).

Pour chaque plateau lancé, ClayScore détecte le lancement puis rend un verdict :
**CASSÉ** · **MANQUÉ** · **NO BIRD** (plateau parti cassé du lanceur → à relancer).

> **État actuel : jalon 0 — Mode Simulation** ✅
> Tout fonctionne **sans aucun matériel**, à partir de fichiers vidéo/audio.
> Le passage au matériel réel (caméras GigE, micro) ne changera que `config/config.yaml`.

---

## Installation (un seul script)

```bash
cd clayscore
./install.sh          # simulation (par défaut) — crée .venv et les données de test
./install.sh --dev    # + outils de test (pytest)
./install.sh --hardware   # + caméras GigE (Aravis), micro, hotspot WiFi (sur le hub)
```

L'installation crée un environnement Python isolé (`.venv`), installe les
dépendances et génère automatiquement les 3 clips de référence.

## Démarrage rapide (simulation)

```bash
source .venv/bin/activate

# Générer un clip de test annoté (vidéo + son + vérité terrain)
python -m tools.synth --scenario casse  --background ciel       --out data/out/demo
python -m tools.synth --scenario manque --background foret      --out data/out/demo2
python -m tools.synth --scenario nobird --background contrejour --out data/out/demo3

# Ou (re)générer les 3 clips de référence d'un coup
python -m tools.synth --make-reference-set --outdir data/samples

# Lancer les tests
pytest
```

## Ce qui est livré au jalon 0

| Élément | Rôle |
|---|---|
| `clayscore/sources/` | **Abstraction des sources** : la même interface pour fichier, webcam et caméra GigE (Aravis). C'est le seul endroit qui décide réel vs simulation. |
| `tools/synth.py` | **Synthétiseur** : génère des plateaux (disques orange) sur fonds variés (ciel, forêt, contre-jour), trajectoires balistiques, explosion en fragments, **avec vérité terrain connue** (position, lancement, coup de feu, verdict). Sert de jeu de test annoté automatiquement. |
| `data/samples/` | Les **3 vidéos de référence** (`.mp4`) + son (`.wav`) + annotation (`.json`), une par verdict. |
| `config/config.yaml` | Configuration unique (source vidéo/audio, fenêtre de verdict, règles de partie). |
| `tests/` | Suite pytest (sources, synthétiseur, config). |

### Les 3 scénarios (cohérents avec les règles métier)

- **casse** : le tireur fait feu, le plateau explose **après** le coup → CASSÉ.
- **manque** : le tireur fait feu mais rate, le plateau poursuit intact → MANQUÉ.
- **nobird** : le plateau part déjà cassé du lanceur, **avant** tout coup de feu → NO BIRD.

Chaque clip embarque son annotation JSON (`verdict_truth`, `launch_frame`,
`gunshot_frame`, `break_frame`, et la position exacte du plateau/des fragments
image par image) → on peut **mesurer** la précision des jalons suivants en chiffres.

## Passer au matériel réel

Il suffira de changer `config/config.yaml` :

```yaml
source:
  video:
    type: aravis        # au lieu de "file"
    width: 1440
    height: 1080
    fps: 50
  audio:
    type: mic           # au lieu de "file"
```

Aucune autre modification de code. En simulation, `type: aravis`/`mic` lèvent une
erreur explicite (matériel absent) — c'est attendu et testé.

## Feuille de route (jalons)

- [x] **0. Simulation** — sources abstraites + synthétiseur + 3 clips de référence
- [x] **1. Détection des lancements** — 100 % mesuré sur jeux synthétiques
- [x] **2. Détection des coups de feu** — 0 % faux positifs mesuré
- [x] **3. Verdicts cassé/manqué/no-bird** — 100 % mesuré, ambigus routés vers l'humain
- [x] **4. Machine à états de la partie** — 5 disciplines, no-bird, doublés (tests exhaustifs)
- [x] **5. Serveur FastAPI + PWA** — partie jouable au navigateur, WebSocket temps réel, ralentis
- [x] **6. Multi-caméras** — fusion stéréo, triangulation 3D grossière, calibration auto des corridors
- [x] **7. Intégration matériel** — capture pilotée par la source (segmentation live), Aravis/micro branchés, systemd + hotspot WiFi, reprise d'état après crash
- [x] **8. IA v2** — dataset YOLO auto-annoté, détecteur enfichable (repli classique), pipeline d'entraînement + export TensorRT, boucle data/labeled/

### IA v2 (jalon 8)

```bash
python -m tools.dataset --out data/yolo         # dataset YOLO auto-annoté (vérité terrain)
python -m tools.train --dry-run                 # voir le plan d'entraînement
# sur une machine GPU / Jetson :
pip install ultralytics
python -m tools.train --build-dataset --export-tensorrt
```

Le détecteur IA est **enfichable** via `config.yaml` (`detector.type: yolo`,
`weights: models/clayscore-yolo.pt`) et **retombe automatiquement** sur le
détecteur classique (MOG2) si le modèle/la lib manquent — le pipeline ne casse
jamais. Les cas ambigus tranchés par l'humain alimentent `data/labeled/` pour
ré-entraîner l'IA. *L'entraînement et l'export TensorRT exigent un GPU/Jetson ;
le reste (dataset, repli, guardes) fonctionne partout en simulation.*

### Lancer le système (simulation)

```bash
python -m clayscore.server          # démarre le hub (PWA + API + WebSocket) sur :8000
# puis, depuis une tablette sur le même WiFi : http://<ip-du-hub>:8000
```

La PWA permet de configurer une partie (discipline, tireurs, série), de lancer
chaque plateau (analysé automatiquement par le pipeline vision/audio), de voir
le **ralenti** et d'un tap valider CASSÉ / MANQUÉ / NO BIRD. Scores en direct
(WebSocket), historique (SQLite), export CSV, mode TV plein écran.

## Licence

Code privé — tous droits réservés. Ne pas publier.
