"""Pont d'import vers les outils de simulation (`tools/synth.py`).

Le paquet `tools` vit à la racine du projet (à côté du paquet `clayscore`).
Ce pont garantit qu'il est importable depuis le runtime, quel que soit le
répertoire courant d'où uvicorn est lancé.
"""
from __future__ import annotations

import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parent.parent  # racine du projet clayscore/
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from tools import synth  # noqa: E402,F401  (ré-exporté)

__all__ = ["synth"]
