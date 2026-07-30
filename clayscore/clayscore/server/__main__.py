"""Point d'entrée serveur : `python -m clayscore.server`.

Lance le serveur ClayScore (PWA + API + WebSocket) sur le réseau local.
Par défaut sur 0.0.0.0:8000 pour être joignable par les tablettes en WiFi.
"""
from __future__ import annotations

import argparse

import uvicorn


def main() -> None:
    ap = argparse.ArgumentParser(description="Serveur ClayScore.")
    ap.add_argument("--host", default="0.0.0.0")
    ap.add_argument("--port", type=int, default=8000)
    ap.add_argument("--reload", action="store_true")
    args = ap.parse_args()
    uvicorn.run("clayscore.server.app:app", host=args.host, port=args.port,
                reload=args.reload)


if __name__ == "__main__":
    main()
