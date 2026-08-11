"""Entretien automatique du hub : le disque ne doit JAMAIS se remplir.

Chaque plateau produit un ralenti vidéo. Sans entretien, un club qui tire tous
les week-ends finit par saturer le SSD — et la panne tombe forcément au pire
moment : en pleine compétition, au moment d'écrire un clip.

Règle appliquée : on garde les clips **récents** (les seuls utiles : on rejoue
le plateau qu'on vient de tirer), dans une limite de nombre ET de taille. Les
plus anciens partent en premier. Les scores, eux, ne sont jamais supprimés :
ils sont dans la base, qui pèse quelques kilo-octets par partie.
"""
from __future__ import annotations

from pathlib import Path
from typing import Dict, List, Optional

# Valeurs par défaut : ~2 journées de tir en clips, et un plafond de 5 Go qui
# laisse largement la place au système sur un SSD de 500 Go.
DEFAULT_MAX_FILES = 600
DEFAULT_MAX_MB = 5000


def _clip_files(clips_dir: Path) -> List[Path]:
    return [p for p in clips_dir.glob("*.mp4") if p.is_file()]


def disk_report(clips_dir: str | Path) -> Dict:
    """Combien de clips, quelle place — pour l'affichage sur la tablette."""
    d = Path(clips_dir)
    files = _clip_files(d) if d.exists() else []
    total = sum(p.stat().st_size for p in files)
    return {
        "clips": len(files),
        "bytes": total,
        "mb": round(total / (1024 * 1024), 1),
    }


def cleanup_clips(clips_dir: str | Path,
                  max_files: int = DEFAULT_MAX_FILES,
                  max_mb: int = DEFAULT_MAX_MB,
                  keep: Optional[set] = None) -> Dict:
    """Supprime les ralentis les plus anciens au-delà des limites.

    `keep` : chemins/noms à ne jamais supprimer (le plateau en cours d'analyse,
    par exemple — on ne retire pas la vidéo que l'arbitre est en train de
    regarder). Ne lève jamais : l'entretien ne doit pas casser une partie.
    """
    d = Path(clips_dir)
    if not d.exists():
        return {"deleted": 0, "freed_mb": 0.0, "kept": 0}

    protected = {Path(k).name for k in (keep or set())}
    files = _clip_files(d)
    # Plus récents d'abord (on garde la tête de liste).
    files.sort(key=lambda p: p.stat().st_mtime, reverse=True)

    max_bytes = max(1, int(max_mb)) * 1024 * 1024
    max_files = max(1, int(max_files))

    deleted, freed, running = 0, 0, 0
    for i, p in enumerate(files):
        try:
            size = p.stat().st_size
        except OSError:
            continue
        over = (i >= max_files) or (running + size > max_bytes)
        if over and p.name not in protected:
            try:
                p.unlink()
                deleted += 1
                freed += size
                continue
            except OSError:
                pass        # fichier verrouillé/lu : on réessaiera plus tard
        running += size

    return {
        "deleted": deleted,
        "freed_mb": round(freed / (1024 * 1024), 1),
        "kept": len(files) - deleted,
    }
