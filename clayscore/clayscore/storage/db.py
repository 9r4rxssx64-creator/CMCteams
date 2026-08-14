"""Persistance SQLite des parties (jalon 5).

Stocke les parties terminées, leurs fiches par tireur et les stats par poste,
pour l'historique consultable depuis la PWA. Aucune donnée réelle de personnel
n'est requise (les tireurs sont saisis à la volée).
"""
from __future__ import annotations

import json
import sqlite3
import threading
import time
from pathlib import Path
from typing import Dict, List, Optional

SCHEMA = """
CREATE TABLE IF NOT EXISTS parties (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at   REAL NOT NULL,
    discipline   TEXT NOT NULL,
    serie        INTEGER NOT NULL,
    cartouches   INTEGER NOT NULL,
    shooters     TEXT NOT NULL,      -- JSON
    scorecard    TEXT NOT NULL,      -- JSON
    stats_post   TEXT NOT NULL       -- JSON
);
"""


class Storage:
    def __init__(self, path: str | Path = "data/clayscore.db"):
        self.path = str(path)
        Path(self.path).parent.mkdir(parents=True, exist_ok=True)
        # check_same_thread=False : le serveur exécute les écritures dans un
        # fil séparé pour ne pas bloquer les autres tablettes. Un verrou est
        # donc OBLIGATOIRE — sans lui, deux requêtes simultanées corrompent la
        # connexion partagée.
        self._conn = sqlite3.connect(self.path, check_same_thread=False)
        self._conn.row_factory = sqlite3.Row
        self._lock = threading.Lock()
        with self._lock:
            self._conn.executescript(SCHEMA)
            self._conn.commit()

    def save_partie(self, partie, created_at: Optional[float] = None) -> int:
        ts = time.time() if created_at is None else float(created_at)
        with self._lock:
            cur = self._conn.execute(
                "INSERT INTO parties (created_at, discipline, serie, cartouches, "
                "shooters, scorecard, stats_post) VALUES (?,?,?,?,?,?,?)",
                (
                    ts,
                    partie.discipline.key,
                    partie.serie,
                    partie.cartouches,
                    json.dumps(partie.shooters, ensure_ascii=False),
                    json.dumps(partie.scorecard(), ensure_ascii=False),
                    json.dumps(partie.stats_by_post(), ensure_ascii=False),
                ),
            )
            self._conn.commit()
            if cur.lastrowid is None:  # jamais vu en pratique apres INSERT
                raise RuntimeError("la partie n'a pas ete enregistree (aucun identifiant rendu)")
            return int(cur.lastrowid)

    def list_parties(self, limit: int = 50) -> List[Dict]:
        # Borne dure : une requête ?limit=999999999 ne doit pas pouvoir vider
        # la base en mémoire ni figer le serveur.
        n = max(1, min(int(limit), 500))
        with self._lock:
            rows = self._conn.execute(
                "SELECT id, created_at, discipline, serie, cartouches, shooters, "
                "scorecard FROM parties ORDER BY id DESC LIMIT ?",
                (n,),
            ).fetchall()
        out = []
        for r in rows:
            out.append({
                "id": r["id"],
                "created_at": r["created_at"],
                "discipline": r["discipline"],
                "serie": r["serie"],
                "cartouches": r["cartouches"],
                "shooters": json.loads(r["shooters"]),
                "scorecard": json.loads(r["scorecard"]),
            })
        return out

    def get_partie(self, party_id: int) -> Optional[Dict]:
        with self._lock:
            r = self._conn.execute(
                "SELECT * FROM parties WHERE id=?", (int(party_id),)).fetchone()
        if r is None:
            return None
        return {
            "id": r["id"],
            "created_at": r["created_at"],
            "discipline": r["discipline"],
            "serie": r["serie"],
            "cartouches": r["cartouches"],
            "shooters": json.loads(r["shooters"]),
            "scorecard": json.loads(r["scorecard"]),
            "stats_post": json.loads(r["stats_post"]),
        }

    def close(self) -> None:
        with self._lock:
            self._conn.close()
