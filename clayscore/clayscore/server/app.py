"""Serveur ClayScore : FastAPI + WebSocket + PWA (jalon 5).

- REST : créer une partie, lancer/analyser un plateau, valider un verdict,
  historique, export CSV.
- WebSocket /ws : pousse l'état en temps réel à toutes les tablettes connectées.
- Fichiers statiques : la PWA (webapp/) + les ralentis (data/clips/*.mp4).

Tout fonctionne en simulation, sans matériel. Le réseau est local et autonome
(aucun accès Internet requis en production).
"""
from __future__ import annotations

import asyncio
import json
from pathlib import Path
from typing import List, Optional

from fastapi import (Depends, FastAPI, Header, HTTPException, WebSocket,
                     WebSocketDisconnect)
from fastapi.responses import FileResponse, PlainTextResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from .. import maintenance, network
from ..engine import MatchEngine
from ..game.disciplines import list_disciplines
from ..storage import Storage

VERSION = "0.8.0"

# Chemins projet.
_PKG_ROOT = Path(__file__).resolve().parent.parent.parent  # clayscore/
WEBAPP_DIR = _PKG_ROOT / "webapp"
CLIPS_DIR = _PKG_ROOT / "data" / "clips"
DB_PATH = _PKG_ROOT / "data" / "clayscore.db"


# --- modèles de requête --------------------------------------------------- #
class NewGame(BaseModel):
    discipline: str = "fosse_universelle"
    shooters: List[str] = ["Tireur 1"]
    serie: int = 25
    cartouches: Optional[int] = None
    auto_mode: bool = False
    machines: Optional[List[str]] = None   # multi-lanceurs (ex. ["Trap 1","Trap 2"])
    mode: str = "entrainement"             # entrainement | concours


class Verdict(BaseModel):
    verdict: Optional[str] = None   # None = accepte l'auto
    cartridge: int = 1


# --- gestion des connexions WebSocket ------------------------------------- #
class WSManager:
    def __init__(self):
        self._conns: List[WebSocket] = []
        self._lock = asyncio.Lock()

    async def connect(self, ws: WebSocket):
        await ws.accept()
        async with self._lock:
            self._conns.append(ws)

    async def disconnect(self, ws: WebSocket):
        async with self._lock:
            if ws in self._conns:
                self._conns.remove(ws)

    async def broadcast(self, payload: dict):
        data = json.dumps(payload, ensure_ascii=False)
        async with self._lock:
            dead = []
            for ws in self._conns:
                try:
                    await ws.send_text(data)
                except Exception:  # noqa: BLE001
                    dead.append(ws)
            for ws in dead:
                self._conns.remove(ws)


def create_app(clips_dir: Optional[str] = None,
               db_path: Optional[str] = None,
               state_path: Optional[str] = None,
               net: Optional[network.NetworkConfig] = None) -> FastAPI:
    app = FastAPI(title="ClayScore", version=VERSION)
    clips = Path(clips_dir) if clips_dir else CLIPS_DIR
    clips.mkdir(parents=True, exist_ok=True)
    statep = state_path or str(_PKG_ROOT / "data" / "match_state.json")

    app.state.net = net or network.NetworkConfig()
    app.state.engine = MatchEngine(clips_dir=str(clips), state_path=statep)
    # Reprise après crash / redémarrage (watchdog systemd) : rejoue le match.
    try:
        app.state.engine.restore_from_disk()
    except Exception:  # noqa: BLE001
        pass
    app.state.storage = Storage(db_path or str(DB_PATH))
    app.state.ws = WSManager()

    def engine() -> MatchEngine:
        return app.state.engine

    async def push_state():
        await app.state.ws.broadcast({"type": "state", "state": engine().state()})

    # --- code d'accès (écritures) ---------------------------------------- #
    # Indispensable dès que le hub est branché sur le réseau d'un club :
    # sans lui, n'importe qui sur ce réseau pourrait changer les scores.
    # Les lectures (affichage, mode TV) restent libres.
    def guard(x_clayscore_pin: Optional[str] = Header(default=None)) -> None:
        cfg: network.NetworkConfig = app.state.net
        if not network.require_pin(cfg, network.resolve_mode(cfg)):
            return
        if x_clayscore_pin != cfg.access_pin:
            raise HTTPException(401, "Code d'accès ClayScore requis.")

    # Travaux lourds (analyse d'un plateau, habillage vidéo, écriture base) :
    # exécutés dans un fil séparé. Sans ça, ils bloquent TOUT le serveur —
    # mesuré : une 2e tablette attendait 13× plus longtemps pendant l'analyse.
    async def offload(fn, *a, **kw):
        return await asyncio.to_thread(fn, *a, **kw)

    # --- API ------------------------------------------------------------- #
    @app.get("/api/disciplines")
    def disciplines():
        return [
            {"key": d.key, "label": d.label, "n_posts": d.n_posts,
             "cartridges": d.cartridges, "scoring": d.scoring,
             "double": bool(d.layout and max(d.layout) >= 2)}
            for d in list_disciplines()
        ]

    @app.post("/api/game/new", dependencies=[Depends(guard)])
    async def game_new(req: NewGame):
        try:
            st = await offload(engine().new_game, req.discipline, req.shooters,
                               req.serie, req.cartouches, req.auto_mode,
                               machines=req.machines, mode=req.mode)
        except (ValueError, RuntimeError) as e:
            raise HTTPException(400, str(e))
        await push_state()
        return st

    @app.get("/api/game/state")
    def game_state():
        return engine().state()

    @app.post("/api/game/throw", dependencies=[Depends(guard)])
    async def game_throw():
        try:
            res = await offload(engine().throw)
        except RuntimeError as e:
            raise HTTPException(400, str(e))
        # Entretien : le disque ne doit jamais se remplir en pleine compétition.
        # Le clip en cours d'arbitrage est protégé de la purge.
        pend = engine().pending
        keep = {Path(pend.clip_url).name} if pend and pend.clip_url else set()
        await offload(maintenance.cleanup_clips, str(clips), keep=keep)
        await push_state()
        return res

    @app.post("/api/game/verdict", dependencies=[Depends(guard)])
    async def game_verdict(req: Verdict):
        try:
            res = await offload(engine().commit, req.verdict, req.cartridge)
        except (ValueError, RuntimeError) as e:
            raise HTTPException(400, str(e))
        await push_state()
        return res

    @app.post("/api/game/finish", dependencies=[Depends(guard)])
    async def game_finish():
        eng = engine()
        if eng.partie is None:
            raise HTTPException(400, "Aucune partie à enregistrer.")
        pid = await offload(app.state.storage.save_partie, eng.partie)
        return {"saved_id": pid, "scorecard": eng.partie.scorecard()}

    @app.get("/api/game/csv", response_class=PlainTextResponse)
    def game_csv():
        eng = engine()
        if eng.partie is None:
            raise HTTPException(400, "Aucune partie en cours.")
        return eng.partie.to_csv()

    @app.get("/api/history")
    def history(limit: int = 50):
        return app.state.storage.list_parties(max(1, min(int(limit), 500)))

    @app.get("/api/history/{party_id}")
    def history_one(party_id: int):
        rec = app.state.storage.get_partie(party_id)
        if rec is None:
            raise HTTPException(404, "Partie introuvable.")
        return rec

    @app.post("/api/game/overlay", dependencies=[Depends(guard)])
    async def game_overlay():
        """Exporte le ralenti HABILLÉ (trajectoire + badge) du plateau courant.

        Sert la vidéo de démonstration (surimpressions gravées). Utilise le
        plateau en attente ; renvoie l'URL du clip habillé.
        """
        from ..replay import render_overlay_from_file
        eng = engine()
        if eng.pending is None:
            raise HTTPException(400, "Aucun plateau à habiller.")
        name = Path(eng.pending.clip_url).name
        src = clips / name
        if not src.exists():
            raise HTTPException(404, "Clip source introuvable.")
        out_name = src.stem + "_overlay.mp4"
        verdict = eng.pending.best_guess
        try:
            await offload(render_overlay_from_file, str(src),
                          str(clips / out_name), verdict, slowmo=4.0)
        except Exception as e:  # noqa: BLE001
            raise HTTPException(500, f"Habillage impossible : {e}")
        return {"clip_url": f"/clips/{out_name}", "verdict": verdict}

    # --- réseau, version, santé ------------------------------------------ #
    @app.get("/api/network")
    def net_status():
        """Où en est le réseau, et quelle adresse taper sur la tablette.

        Affiché dans l'appli : Kevin voit d'un coup d'œil s'il est en WiFi
        autonome ou branché au club, si les caméras sont bien isolées, et
        ce qui cloche le cas échéant.
        """
        cfg: network.NetworkConfig = app.state.net
        st = network.status(cfg)
        return {**st.to_dict(),
                "hotspot_ssid": cfg.hotspot_ssid,
                "problemes": network.check_install(cfg, st)}

    @app.get("/api/version")
    def version():
        """Sert la mise à jour automatique des tablettes (PWA)."""
        return {"version": VERSION}

    @app.get("/api/health")
    def health():
        """Contrôle rapide : partie en cours, place disque, réseau."""
        cfg: network.NetworkConfig = app.state.net
        eng = engine()
        return {
            "ok": True,
            "version": VERSION,
            "partie_active": eng.partie is not None,
            "disque": maintenance.disk_report(str(clips)),
            "reseau": network.status(cfg).to_dict(),
        }

    # --- ralentis (mp4) -------------------------------------------------- #
    @app.get("/clips/{name}")
    def clip(name: str):
        # Empêche la traversée de répertoire.
        safe = Path(name).name
        path = clips / safe
        if not path.exists():
            raise HTTPException(404, "Clip introuvable.")
        return FileResponse(str(path), media_type="video/mp4")

    # --- WebSocket ------------------------------------------------------- #
    @app.websocket("/ws")
    async def ws_endpoint(ws: WebSocket):
        await app.state.ws.connect(ws)
        try:
            await ws.send_text(json.dumps(
                {"type": "state", "state": engine().state()}, ensure_ascii=False))
            while True:
                await ws.receive_text()  # ping/keepalive (ignoré)
        except WebSocketDisconnect:
            await app.state.ws.disconnect(ws)
        except Exception:  # noqa: BLE001
            await app.state.ws.disconnect(ws)

    # --- PWA (statique) — monté en dernier pour ne pas masquer /api ------ #
    if WEBAPP_DIR.exists():
        app.mount("/", StaticFiles(directory=str(WEBAPP_DIR), html=True),
                  name="webapp")

    return app


app = create_app()
