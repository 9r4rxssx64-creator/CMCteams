# ClayScore — Spécification technique (texte original)

> **Texte d'origine de Kevin, reproduit intégralement.** C'est le cahier des
> charges qui a servi à développer le logiciel. Conservé mot pour mot pour
> référence — les 8 jalons décrits ici ont tous été réalisés (voir
> `00_RECAPITULATIF_TOTAL`).
>
> 🔴 **Une seule ligne de ce cahier des charges s'est révélée fausse à
> l'usage** — elle est conservée telle quelle ci-dessous, mais ne pas la
> suivre : *« 3 caméras GigE Vision Hikrobot MV-CS016-10 (2 mono + 1
> couleur) »*. **Les 3 caméras doivent être en COULEUR.** Le test de l'orange
> du plateau tourne sur chaque caméra. Mesuré sur le banc des 27 scénarios :
> couleur **27/27**, monochrome **9/27**, avec des erreurs annoncées comme
> certaines. Correction et mesures : `MATERIEL_OPTIMAL` § 2.

---

# CLAUDE.md — Projet ClayScore
## Spécification pour développement autonome par Claude Code

> **Instruction générale** : tu es chargé de développer l'intégralité du logiciel ClayScore décrit ci-dessous, de façon autonome. Travaille par jalons, dans l'ordre. Chaque jalon doit être fonctionnel, testé (pytest) et exécutable en mode simulation avant de passer au suivant. L'utilisateur (Kevin) n'est pas développeur et travaille depuis une tablette : tout doit s'installer via un script unique et se piloter via navigateur. Commente le code en français.

---

## 1. Vue d'ensemble

ClayScore est un système de comptage automatique de points pour le ball-trap (tir aux plateaux d'argile). Il détecte, pour chaque plateau lancé : le lancement, puis le verdict **CASSÉ** (touché par le tireur), **MANQUÉ** (retombe intact) ou **NO BIRD** (plateau parti cassé du lanceur → à relancer, même tireur, même poste).

Matériel cible (peut ne pas être encore disponible — voir Mode Simulation) :
- Hub : NVIDIA Jetson Orin Nano Super (Ubuntu/JetPack, ARM64) — fallback dev : tout Linux x86
- 3 caméras GigE Vision Hikrobot MV-CS016-10 (2 mono + 1 couleur, IMX296, 1440×1080, jusqu'à 65 fps) via SDK Aravis (`python-aravis` / Harvester + GenTL)
- 1 micro USB (détection des coups de feu)
- Réseau local autonome : le hub sert une web-app ; les tablettes s'y connectent en WiFi local, AUCUN accès Internet en production

## 2. Mode Simulation (PRIORITÉ ABSOLUE — jalon 0)

Tout le système doit fonctionner **sans aucun matériel**, à partir de fichiers vidéo (.mp4) et audio (.wav) placés dans `data/samples/`. Une couche d'abstraction `sources/` expose la même interface pour : caméra GigE réelle, webcam USB, fichier vidéo. Idem pour l'audio (micro réel / fichier). Toute la logique (détection, suivi, verdicts, partie, UI) se développe et se teste en simulation. Le passage au matériel réel = changement de config uniquement (`config.yaml: source: aravis|webcam|file`).

Génère aussi un **simulateur synthétique** (`tools/synth.py`) : rendu OpenCV de plateaux (disques orange/noirs) sur fonds variés (ciel, forêt, contre-jour) suivant des trajectoires balistiques paramétrables, avec explosion en fragments, pour créer des jeux de test annotés automatiquement (vérité terrain connue → tests de précision chiffrés).

## 3. Architecture (monorepo Python)

```
clayscore/
├── install.sh              # installation one-shot (deps, service systemd, réseau)
├── config/                 # config.yaml + profils stands/disciplines (yaml)
├── clayscore/
│   ├── sources/            # video_source.py, audio_source.py (abstraction réel/simu)
│   ├── vision/             # detector.py (soustraction fond MOG2 + morpho, v2: YOLO),
│   │                       # tracker.py (Kalman, association multi-caméras),
│   │                       # verdict.py (cassé/manqué/no-bird/ambigu + score de confiance)
│   ├── audio/              # gunshot.py (détection impulsion, horodatage, 1 ou 2 coups)
│   ├── game/               # state_machine.py (partie, postes, rotation, no-bird gel,
│   │                       # doublés), disciplines.py (règles FU/FO/DTL/parcours/compak)
│   ├── server/             # FastAPI + WebSocket, API REST, static PWA
│   ├── storage/            # SQLite (parties, tireurs, stats), clips mp4 par plateau
│   └── calibration/        # auto-calibration corridors de vol sur plateaux d'essai
├── webapp/                 # PWA vanilla JS ou Svelte : score live, gros boutons
│                           # (RÉPÈTE/NO BIRD, validation ralenti), config partie,
│                           # historique, mode TV plein écran. Mobile-first, offline.
├── data/samples/           # vidéos/sons de test
├── tools/                  # synth.py, annotate.py, bench.py
└── tests/                  # pytest, >80% couverture sur game/ et verdict
```

## 4. Règles métier essentielles

- **Verdict** : fenêtre d'analyse ~800 ms après coup de feu. Fragments multiples + disparition du blob principal = CASSÉ. Trajectoire balistique continue jusqu'au sol = MANQUÉ. Confiance < seuil (config) = AMBIGU → l'UI présente le ralenti, l'humain tranche d'un tap ; le verdict humain est stocké comme vérité (et alimente `data/labeled/` pour l'entraînement futur).
- **NO BIRD auto** : fragments ou trajectoire anormale (écart au corridor calibré) détectés AVANT tout coup de feu → annonce NO BIRD, plateau non compté, rotation GELÉE : même tireur, même poste au lancer suivant. Bouton manuel équivalent dans l'UI.
- **La rotation n'avance jamais sans verdict validé.** State machine stricte, testée exhaustivement.
- **Partie** : config = discipline, 1-6 tireurs (noms), lanceurs actifs, série (25 par défaut), 1 ou 2 cartouches. Rotation selon la discipline. Doublés : 2 plateaux → 2 verdicts. Fiche finale par tireur, stats par poste/machine, export CSV.
- **Audio** : détection d'impulsion (RMS + montée brutale) ; 2 coups < 1,5 s = doublé ou 2e cartouche selon discipline.

## 5. Jalons (dans l'ordre, chacun testé avant le suivant)

0. **Simulation** : sources abstraites + synthétiseur + 3 vidéos synthétiques de référence.
1. **Détection des lancements** : compter les plateaux lancés sur vidéo (précision ≥ 99 % sur jeux synthétiques).
2. **Audio** : détection coups de feu sur .wav (faux positifs < 1 %).
3. **Verdicts** : cassé/manqué/no-bird sur synthèse (≥ 98 % ; ambigus correctement routés).
4. **State machine partie** : toutes disciplines, no-bird, doublés — tests exhaustifs.
5. **Serveur + PWA** : partie complète jouable en simulation depuis un navigateur mobile ; WebSocket temps réel ; ralentis servis en HTML5 video.
6. **Multi-caméras** : fusion des vues, association 3D grossière, calibration auto.
7. **Intégration matériel** : Aravis/GigE, micro réel, service systemd, hotspot WiFi (hostapd) via install.sh.
8. **v2 IA** : pipeline d'entraînement YOLO (ultralytics) sur `data/labeled/`, export TensorRT pour Jetson.

## 6. Contraintes

- Python 3.10+, OpenCV, NumPy, FastAPI, uvicorn, sounddevice, ultralytics (jalon 8). Pas de cloud, pas de télémétrie, tout fonctionne hors ligne.
- Performance cible Jetson : 3 flux 1440×1080 ≥ 50 fps en détection classique ; dégradation propre si CPU x86 modeste (résolution/fps adaptatifs).
- UI : français, boutons ≥ 60 px (gants), contraste extérieur plein soleil, PWA installable.
- Journalisation claire ; aucun crash ne doit interrompre une partie (watchdog + reprise d'état depuis SQLite).
- Licence : code privé (tous droits réservés) — ne pas publier.

## 7. Definition of done globale

Une partie de FU à 2 tireurs, 25 plateaux chacun avec doublés et un no-bird injecté, se joue de bout en bout en mode simulation depuis un téléphone, scores exacts, clips ralentis disponibles, puis la même chose fonctionne sur matériel réel en ne changeant que `config.yaml`.

---

## Où en est chaque point de cette spécification

| Point de la spec | État |
|---|---|
| Jalons 0 à 8 | ✅ tous réalisés et testés |
| Mode simulation (priorité absolue) | ✅ tout fonctionne sans matériel |
| Architecture (arborescence ci-dessus) | ✅ respectée |
| Règles métier (verdict, no-bird, rotation, doublés, audio) | ✅ implémentées et testées |
| Couverture > 80 % sur `game/` et `verdict` | ✅ 289 tests, dont la totalité des règles de partie |
| Definition of done globale | ✅ **vérifiée** : partie FU 2 tireurs × 25 plateaux + no-bird jouée via le serveur, scores exacts, ralentis servis |
| Matériel réel (Jetson, caméras, micro) | ⏳ code écrit et branché, **non testé sur matériel** (non acheté) |
| Performance 3 flux 1440×1080 ≥ 50 fps | ⏳ **non mesurée** (exige le Jetson) |
| Watchdog + reprise d'état | ✅ implémenté (service systemd + rejeu du match) |
| Licence privée, hors ligne, sans cloud | ✅ respecté (0 télémétrie, 0 licence payante) |
| Réseau autonome **et** branchable au réseau d'un club | ✅ 3 modes + bascule auto, caméras isolées (`GUIDE_RESEAU`) |
| Protection des scores sur réseau partagé | ✅ code d'accès sur les écritures, lectures libres |
| Tenue en clientèle (audit qualité) | ✅ 5 défauts réels corrigés + tests de non-régression (`AUDIT_QUALITE`) |
