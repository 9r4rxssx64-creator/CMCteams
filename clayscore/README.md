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
- [ ] 1. Détection des lancements (≥ 99 % sur jeux synthétiques)
- [ ] 2. Détection des coups de feu (faux positifs < 1 %)
- [ ] 3. Verdicts cassé/manqué/no-bird (≥ 98 %, ambigus routés vers l'humain)
- [ ] 4. Machine à états de la partie (toutes disciplines, no-bird, doublés)
- [ ] 5. Serveur FastAPI + PWA (partie jouable au navigateur, ralentis)
- [ ] 6. Multi-caméras (fusion, calibration auto)
- [ ] 7. Intégration matériel (Aravis/GigE, micro, systemd, hotspot WiFi)
- [ ] 8. IA v2 (entraînement YOLO, export TensorRT pour Jetson)

## Licence

Code privé — tous droits réservés. Ne pas publier.
