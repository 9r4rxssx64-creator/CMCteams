"""Exigences « compétition officielle » : traçabilité, preuve, contestation.

Ce qui distingue un jouet d'un système utilisable en concours homologué n'est
pas la précision : c'est la **preuve**. Une fédération n'accepte un arbitrage
électronique que si l'on peut démontrer, après coup, que le résultat n'a pas
été modifié — et qu'un tireur peut contester devant un jury.

Trois briques ici :

1. **Journal inaltérable** — chaque événement (plateau, verdict, correction,
   réclamation) est chaîné au précédent par une empreinte. Modifier une seule
   ligne a posteriori casse toute la chaîne, et ça se voit.
2. **Fiche officielle scellée** — le résultat final porte un sceau calculé sur
   son contenu ; le moindre chiffre changé invalide le sceau.
3. **Contrôle avant compétition** — une liste de points bloquants (mode
   concours, code d'accès, caméras, alimentation, place disque, horloge). Tant
   qu'un point est rouge, on ne démarre pas.

⚠️ **Ce module ne délivre AUCUNE homologation.** Aucun logiciel ne peut le
faire : l'homologation est une décision de la fédération (FFBT / FITASC /
ISSF), au terme d'une procédure avec dossier, essais et jury. Ce qui est fourni
ici, ce sont les **exigences techniques** qui rendent ce dossier défendable.
Voir `docs/GUIDE_COMPETITION.md`.
"""
from __future__ import annotations

import hashlib
import json
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional

GENESIS = "0" * 64          # empreinte de départ de la chaîne

# Événements journalisés. Tout ce qui touche un score DOIT y figurer.
EVENT_TYPES = (
    "partie_ouverte", "plateau_analyse", "verdict_valide", "verdict_corrige",
    "no_bird", "reclamation", "decision_jury", "partie_close",
    "incident_technique", "reprise_apres_panne",
)


def _hash(payload: str) -> str:
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


@dataclass
class Entry:
    seq: int
    ts: float
    type: str
    data: Dict
    prev: str
    hash: str

    def to_dict(self) -> Dict:
        return {"seq": self.seq, "ts": self.ts, "type": self.type,
                "data": self.data, "prev": self.prev, "hash": self.hash}


class OfficialJournal:
    """Journal chaîné, en ajout seul, écrit sur disque à chaque événement.

    Écriture immédiate (pas de tampon) : une coupure de courant ne doit pas
    faire disparaître les derniers plateaux.
    """

    def __init__(self, path: str | Path):
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self._entries: List[Entry] = []
        if self.path.exists():
            self._load()

    # --- écriture ------------------------------------------------------- #
    def append(self, type_: str, data: Optional[Dict] = None,
               ts: Optional[float] = None) -> Entry:
        if type_ not in EVENT_TYPES:
            raise ValueError(
                f"Type d'événement inconnu : {type_!r}. "
                "Un événement non prévu ne doit pas entrer dans un journal officiel.")
        prev = self._entries[-1].hash if self._entries else GENESIS
        seq = len(self._entries) + 1
        stamp = time.time() if ts is None else float(ts)
        body = {"seq": seq, "ts": stamp, "type": type_,
                "data": data or {}, "prev": prev}
        h = _hash(json.dumps(body, sort_keys=True, ensure_ascii=False))
        entry = Entry(seq=seq, ts=stamp, type=type_, data=data or {},
                      prev=prev, hash=h)
        self._entries.append(entry)
        with self.path.open("a", encoding="utf-8") as fh:
            fh.write(json.dumps(entry.to_dict(), ensure_ascii=False) + "\n")
            fh.flush()
        return entry

    # --- lecture / contrôle --------------------------------------------- #
    def _load(self) -> None:
        for line in self.path.read_text(encoding="utf-8").splitlines():
            if not line.strip():
                continue
            d = json.loads(line)
            self._entries.append(Entry(
                seq=d["seq"], ts=d["ts"], type=d["type"],
                data=d["data"], prev=d["prev"], hash=d["hash"]))

    @property
    def entries(self) -> List[Entry]:
        return list(self._entries)

    def verify(self) -> Dict:
        """Le journal a-t-il été modifié ? Réponse vérifiable par un tiers."""
        prev = GENESIS
        for i, e in enumerate(self._entries, start=1):
            if e.seq != i:
                return {"ok": False, "faute": e.seq,
                        "raison": "Numérotation interrompue (ligne supprimée ?)."}
            if e.prev != prev:
                return {"ok": False, "faute": e.seq,
                        "raison": "Chaînage rompu (ligne insérée ou retirée)."}
            body = {"seq": e.seq, "ts": e.ts, "type": e.type,
                    "data": e.data, "prev": e.prev}
            if _hash(json.dumps(body, sort_keys=True, ensure_ascii=False)) != e.hash:
                return {"ok": False, "faute": e.seq,
                        "raison": "Contenu modifié après coup."}
            prev = e.hash
        return {"ok": True, "entrees": len(self._entries),
                "sceau": prev if self._entries else GENESIS}

    def replay(self, type_: Optional[str] = None) -> List[Dict]:
        return [e.to_dict() for e in self._entries
                if type_ is None or e.type == type_]


# --- fiche officielle scellée --------------------------------------------- #
def seal_scorecard(scorecard: List[Dict], meta: Dict,
                   journal_seal: str = GENESIS) -> Dict:
    """Scelle une fiche : le sceau dépend du contenu ET du journal.

    Changer un score, un nom ou une ligne du journal change le sceau. Deux
    exemplaires imprimés portant le même sceau sont donc identiques.
    """
    body = {"scorecard": scorecard, "meta": meta, "journal": journal_seal}
    payload = json.dumps(body, sort_keys=True, ensure_ascii=False)
    sceau = _hash(payload)
    return {**body, "sceau": sceau, "sceau_court": sceau[:12].upper()}


def verify_seal(sealed: Dict) -> bool:
    """Contrôle qu'une fiche n'a pas été retouchée."""
    if "sceau" not in sealed:
        return False
    body = {"scorecard": sealed.get("scorecard"), "meta": sealed.get("meta"),
            "journal": sealed.get("journal")}
    return _hash(json.dumps(body, sort_keys=True,
                            ensure_ascii=False)) == sealed["sceau"]


# --- contrôle avant compétition ------------------------------------------- #
@dataclass
class CheckItem:
    cle: str
    quoi: str
    ok: bool
    bloquant: bool = True
    solution: str = ""

    def to_dict(self) -> Dict:
        return {"cle": self.cle, "quoi": self.quoi, "ok": self.ok,
                "bloquant": self.bloquant, "solution": self.solution}


@dataclass
class PreCompetitionReport:
    go: bool
    items: List[CheckItem] = field(default_factory=list)

    def to_dict(self) -> Dict:
        return {"go": self.go,
                "bloquants": [i.to_dict() for i in self.items
                              if i.bloquant and not i.ok],
                "avertissements": [i.to_dict() for i in self.items
                                   if not i.bloquant and not i.ok],
                "items": [i.to_dict() for i in self.items]}


def pre_competition_check(*, mode: str, pin_actif: bool, cameras_isolees: bool,
                          pods_ok: int, pods_total: int,
                          alimentation_ok: bool, autonomie_h: Optional[float],
                          disque_libre_mo: float, journal_ok: bool,
                          horloge_synchro: bool,
                          duree_epreuve_h: float = 8.0) -> PreCompetitionReport:
    """GO / NO-GO avant une épreuve. Un seul rouge = on ne démarre pas.

    Volontairement sévère : en compétition, un défaut découvert au 20ᵉ plateau
    coûte l'épreuve entière. Mieux vaut refuser de démarrer.
    """
    items = [
        CheckItem("mode", "Mode concours activé (chaque plateau arbitré)",
                  mode == "concours",
                  solution="Créer la partie en mode « concours »."),
        CheckItem("code", "Code d'accès actif (scores non modifiables par un tiers)",
                  bool(pin_actif),
                  solution="Renseigner network.access_pin dans config.yaml."),
        CheckItem("cameras", "Caméras sur leur réseau dédié",
                  bool(cameras_isolees),
                  solution="Brancher le switch PoE sur la prise caméras du hub."),
        CheckItem("pods", f"Tous les postes de vue en service ({pods_ok}/{pods_total})",
                  pods_total > 0 and pods_ok == pods_total,
                  solution="Vérifier alimentation et liaison du poste en défaut."),
        CheckItem("alimentation", "Alimentation confirmée (secteur, lanceur ou batterie)",
                  bool(alimentation_ok),
                  solution="Brancher une source, ou vérifier la charge de la batterie."),
        CheckItem("autonomie",
                  f"Autonomie couvrant l'épreuve ({duree_epreuve_h:.0f} h)",
                  autonomie_h is None or autonomie_h >= duree_epreuve_h,
                  solution="Brancher au secteur/lanceur, ou recharger la batterie."),
        CheckItem("disque", "Place disque suffisante (≥ 2 Go)",
                  disque_libre_mo >= 2000,
                  solution="Lancer l'entretien, ou libérer de la place."),
        CheckItem("journal", "Journal officiel intègre",
                  bool(journal_ok),
                  solution="Journal altéré : ouvrir un nouveau journal et prévenir le jury."),
        CheckItem("horloge", "Horloges des postes synchronisées",
                  bool(horloge_synchro), bloquant=False,
                  solution="Resynchroniser les postes (une dérive fausse l'ordre des tirs)."),
    ]
    go = all(i.ok for i in items if i.bloquant)
    return PreCompetitionReport(go=go, items=items)
