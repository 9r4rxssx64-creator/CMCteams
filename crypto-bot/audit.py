"""Journal d'audit append-only (une ligne JSON par événement).

Rien n'est jamais réécrit : on ne fait qu'ajouter. Permet de reconstituer
exactement ce que le bot a décidé et pourquoi (règle « journal d'audit de
toutes les actions sensibles »).
"""
from __future__ import annotations

import json
import os
import time
from datetime import datetime, timezone

LOG_DIR = os.path.join(os.path.dirname(__file__), "logs")


def _ensure_dir() -> None:
    os.makedirs(LOG_DIR, exist_ok=True)


def log(event: str, **fields) -> dict:
    """Écrit un événement dans logs/audit.jsonl et le renvoie."""
    _ensure_dir()
    entry = {
        "ts": time.time(),
        "iso": datetime.now(timezone.utc).isoformat(),
        "event": event,
    }
    entry.update(fields)
    path = os.path.join(LOG_DIR, "audit.jsonl")
    with open(path, "a", encoding="utf-8") as fh:
        fh.write(json.dumps(entry, ensure_ascii=False) + "\n")
    return entry


def console(msg: str) -> None:
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}", flush=True)
