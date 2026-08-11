"""Chargement de la configuration ClayScore (YAML) avec valeurs par défaut.

La config pilote TOUT le comportement réel vs simulation. Charger, fusionner
avec les défauts, exposer un accès pratique par section.
"""
from __future__ import annotations

import copy
from pathlib import Path
from typing import Any, Dict

import yaml

# Défauts complets : garantissent que le code tourne même sans fichier config.
DEFAULTS: Dict[str, Any] = {
    "source": {
        "video": {
            "type": "file",  # file | webcam | aravis
            "path": "data/samples/casse_ciel.mp4",
            "loop": False,
        },
        "audio": {
            "type": "file",  # file | mic
            "path": "data/samples/casse_ciel.wav",
            "chunk_size": 1024,
        },
    },
    # Fenêtre d'analyse du verdict après coup de feu (ms).
    "verdict": {
        "window_ms": 800,
        "confidence_threshold": 0.6,  # sous ce seuil -> AMBIGU (arbitrage humain)
    },
    # Détection audio (jalon 2).
    "audio_detection": {
        "min_gap_s": 0.15,       # écart mini entre 2 impulsions distinctes
        "double_window_s": 1.5,  # 2 coups < 1.5 s = doublé / 2e cartouche
    },
    # Partie (jalon 4).
    "game": {
        "discipline": "fosse_universelle",
        "serie": 25,
        "cartouches": 2,
    },
    # Réseau du hub : autonome (WiFi propre) ou branché au réseau d'un club.
    # "auto" = rejoint un réseau existant s'il y en a un, sinon crée le sien.
    "network": {
        "mode": "auto",                       # auto | autonome | reseau
        "hotspot_ssid": "ClayScore",
        "hotspot_password": "",
        "hostname": "clayscore",              # -> http://clayscore.local:8000
        "port": 8000,
        "uplink_iface": "wlan0",              # patte vers le réseau du club
        "camera_iface": "eth0",               # patte vers le switch PoE (isolée)
        "camera_subnet": "192.168.10.0/24",
        "access_pin": "",                     # code exigé pour toute écriture
        "require_pin_on_shared": True,
    },
    # Entretien automatique : le disque ne doit jamais se remplir.
    "maintenance": {
        "clips_max_files": 600,
        "clips_max_mb": 5000,
    },
}


def _deep_merge(base: Dict[str, Any], override: Dict[str, Any]) -> Dict[str, Any]:
    """Fusion récursive : `override` complète/écrase `base` sans le muter."""
    result = copy.deepcopy(base)
    for key, value in (override or {}).items():
        if (
            key in result
            and isinstance(result[key], dict)
            and isinstance(value, dict)
        ):
            result[key] = _deep_merge(result[key], value)
        else:
            result[key] = copy.deepcopy(value)
    return result


def load_config(path: str | Path | None = None) -> Dict[str, Any]:
    """Charge la config depuis un fichier YAML, fusionnée avec les défauts.

    Si `path` est None ou inexistant, renvoie les défauts (utile pour les tests
    et le premier démarrage).
    """
    if path is None:
        return copy.deepcopy(DEFAULTS)
    p = Path(path)
    if not p.exists():
        return copy.deepcopy(DEFAULTS)
    with p.open("r", encoding="utf-8") as fh:
        loaded = yaml.safe_load(fh) or {}
    if not isinstance(loaded, dict):
        raise ValueError(f"Config YAML invalide (racine non-mapping) : {path}")
    return _deep_merge(DEFAULTS, loaded)
