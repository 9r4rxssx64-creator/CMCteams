"""Point d'entrée serveur : `python -m clayscore.server`.

Lance le serveur ClayScore (PWA + API + WebSocket) sur le réseau local.
Par défaut sur 0.0.0.0:8000 pour être joignable par les tablettes, que le hub
crée son propre WiFi (mode autonome) ou qu'il soit branché sur le réseau d'un
club (mode réseau) — voir la section `network:` de config/config.yaml.
"""
from __future__ import annotations

import argparse
from pathlib import Path

import uvicorn

from .. import network, pods, power
from ..util.config import load_config
from .app import create_app

DEFAULT_CONFIG = Path(__file__).resolve().parents[2] / "config" / "config.yaml"


def build_app(config_path: str | None = None):
    """Construit l'application à partir de la configuration."""
    cfg = load_config(config_path or (DEFAULT_CONFIG if DEFAULT_CONFIG.exists() else None))
    net = network.NetworkConfig.from_dict(cfg.get("network"))
    app = create_app(net=net)

    # Postes de vue déclarés : le système contrôle qu'ils sont possibles.
    fleet = pods.PodFleet()
    for d in cfg.get("postes") or []:
        fleet.add(pods.Pod(**d))
    app.state.fleet = fleet

    # Alimentation : sources branchées + batterie installée.
    alim = cfg.get("alimentation") or {}
    app.state.sources = list(alim.get("sources") or [])
    app.state.battery = power.Battery(
        tension_v=float(alim.get("batterie_v", 12)),
        capacite_ah=float(alim.get("batterie_ah", 30)))
    return app, net, cfg


def main() -> None:
    ap = argparse.ArgumentParser(description="Serveur ClayScore.")
    ap.add_argument("--host", default="0.0.0.0")
    ap.add_argument("--port", type=int, default=None,
                    help="Par défaut : network.port de la configuration.")
    ap.add_argument("--config", default=None)
    ap.add_argument("--reload", action="store_true")
    args = ap.parse_args()

    app, net, _ = build_app(args.config)
    port = args.port or net.port

    # Affiche à l'écran ce que l'utilisateur doit faire — pas un log technique.
    st = network.status(net)
    print(f"ClayScore — réseau : {st.mode} ({st.detail})")
    for url in st.urls:
        print(f"  Sur la tablette, ouvrir : {url}")
    for p in network.check_install(net, st):
        print(f"  [{p['niveau']}] {p['quoi']}\n      → {p['solution']}")
    # Postes de vue : refuser tout de suite une installation impossible.
    for p in app.state.fleet.check():
        print(f"  [{p['niveau']}] {p['quoi']}\n      → {p['solution']}")

    if args.reload:
        uvicorn.run("clayscore.server.app:app", host=args.host, port=port,
                    reload=True)
    else:
        uvicorn.run(app, host=args.host, port=port)


if __name__ == "__main__":
    main()
