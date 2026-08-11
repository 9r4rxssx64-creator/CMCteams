"""Source vidéo pour caméra GigE Vision via Aravis (matériel réel).

Cible : Hikrobot MV-CS016-10 (IMX296, 1440x1080, jusqu'à 65 fps) pilotée
par le SDK Aravis (bindings GObject `gi.repository.Aravis`).

⚠️ En mode simulation, Aravis n'est PAS installé. Ce module se charge sans
erreur mais `open()` lève une RuntimeError explicite avec la marche à suivre.
Le passage au matériel réel ne change QUE la configuration
(`source.video.type: aravis`), pas le reste du code.

Installation matériel (Jetson / Linux) :
    sudo apt install aravis-tools libaravis-0.8-dev gir1.2-aravis-0.8
    pip install pygobject
"""
from __future__ import annotations

from typing import Optional

import numpy as np

from .base import Frame, VideoSource

# --------------------------------------------------------------------------
# Formats de pixels : le point où une installation se sabote en silence.
#
# Le verdict repose sur la reconnaissance de l'ORANGE du plateau. MESURÉ sur
# le banc des 27 scénarios : en couleur 27/27, en monochrome 9/27 — et les
# erreurs sortent avec une confiance de 0,72, donc sans jamais demander
# d'arbitrage. D'où deux garde-fous ici :
#
#   1. un format MONO est REFUSÉ à la construction (message explicite) ;
#   2. une mosaïque Bayer est déballée avec la BONNE correspondance OpenCV.
#
# ⚠️ Le piège Bayer, MESURÉ et non supposé : le nommage OpenCV est décalé
# d'un cran par rapport au nommage GenICam. Sur une cible orange
# BGR (30,120,240), `BayerRG8` déballé avec `COLOR_BayerRG2BGR` ressort en
# BGR (240,120,30) — teinte 107, du BLEU. Le rouge et le bleu sont échangés,
# et le test « orange » ne voit plus rien. La correspondance ci-dessous a été
# vérifiée par mesure sur les quatre motifs, et un test la verrouille.
BAYER_VERS_OPENCV = {
    "BayerRG8": "COLOR_BayerBG2BGR",
    "BayerBG8": "COLOR_BayerRG2BGR",
    "BayerGR8": "COLOR_BayerGB2BGR",
    "BayerGB8": "COLOR_BayerGR2BGR",
}

# Formats sortis directement en 3 canaux par la caméra : aucune ambiguïté
# possible. C'est le choix RECOMMANDÉ quand le modèle le propose.
FORMATS_3_CANAUX = ("RGB8", "BGR8", "RGB8Packed", "BGR8Packed")


def decode_image(arr, width: int, height: int, pixel_format: str):
    """Transforme les octets bruts de la caméra en image BGR exploitable.

    Extrait de `read()` exprès : c'est la partie qui peut casser le produit en
    silence, et elle doit être testable SANS matériel.
    """
    import cv2

    fmt = str(pixel_format)
    if fmt in FORMATS_3_CANAUX or arr.size >= width * height * 3:
        return arr[: width * height * 3].reshape(height, width, 3)

    plan = arr[: width * height].reshape(height, width)
    if fmt in BAYER_VERS_OPENCV:
        return cv2.cvtColor(plan, getattr(cv2, BAYER_VERS_OPENCV[fmt]))
    # Dernier recours : un plan unique non Bayer = monochrome. On le convertit
    # pour ne pas planter, mais `qualite_image()` le signalera comme bloquant.
    return cv2.cvtColor(plan, cv2.COLOR_GRAY2BGR)


def _try_import_aravis():
    """Importe Aravis si disponible, sinon renvoie None."""
    try:  # pragma: no cover - dépend du matériel/OS
        import gi

        gi.require_version("Aravis", "0.8")
        from gi.repository import Aravis  # type: ignore

        return Aravis
    except Exception:  # noqa: BLE001 - toute erreur = Aravis indisponible
        return None


class AravisVideoSource(VideoSource):
    """Caméra GigE Vision Hikrobot via Aravis.

    Paramètres principaux (depuis la config) :
        camera_id : identifiant Aravis ("Hikrobot-<serial>") ou None (1re caméra)
        width/height : ROI capteur (défaut plein capteur 1440x1080)
        fps : cadence d'acquisition
        pixel_format : COULEUR obligatoire — "RGB8"/"BGR8" (recommandé) ou
            "BayerRG8"/"BayerBG8"/"BayerGR8"/"BayerGB8". Un format Mono est
            REFUSÉ : le verdict a besoin de l'orange du plateau.
        n_buffers : profondeur du flux (défaut 20)
    """

    def __init__(
        self,
        camera_id: Optional[str] = None,
        width: int = 1440,
        height: int = 1080,
        fps: float = 50.0,
        pixel_format: str = "RGB8",
        n_buffers: int = 20,
        autoriser_mono: bool = False,
    ):
        self.camera_id = camera_id
        self._req_width = int(width)
        self._req_height = int(height)
        self._req_fps = float(fps)
        self.pixel_format = str(pixel_format)
        if self.pixel_format.lower().startswith("mono") and not autoriser_mono:
            raise ValueError(
                f"Format de pixels {self.pixel_format!r} : la caméra sortirait "
                "du NOIR ET BLANC. Le plateau est reconnu à sa couleur orange "
                "— mesuré 9/27 au lieu de 27/27, et les erreurs passent pour "
                "des certitudes.\n"
                "Utiliser un format couleur : RGB8 (recommandé), ou "
                f"{', '.join(sorted(BAYER_VERS_OPENCV))}.")
        self.n_buffers = int(n_buffers)
        self._camera = None
        self._stream = None
        self._index = 0

    def open(self) -> "AravisVideoSource":  # pragma: no cover - matériel réel
        Aravis = _try_import_aravis()
        if Aravis is None:
            raise RuntimeError(
                "Aravis (GigE Vision) est indisponible dans cet environnement.\n"
                "En mode simulation, utilisez `source.video.type: file`.\n"
                "Sur le matériel (Jetson/Linux) installez :\n"
                "  sudo apt install aravis-tools libaravis-0.8-dev "
                "gir1.2-aravis-0.8\n"
                "  pip install pygobject"
            )
        cam = Aravis.Camera.new(self.camera_id)
        cam.set_region(0, 0, self._req_width, self._req_height)
        try:
            cam.set_pixel_format_from_string(self.pixel_format)
        except Exception:  # noqa: BLE001 - format optionnel selon modèle
            pass
        cam.set_frame_rate(self._req_fps)
        payload = cam.get_payload()
        stream = cam.create_stream(None, None)
        for _ in range(self.n_buffers):
            stream.push_buffer(Aravis.Buffer.new_allocate(payload))
        cam.start_acquisition()
        self._camera = cam
        self._stream = stream
        self._index = 0
        return self

    @property
    def fps(self) -> float:
        return self._req_fps

    @property
    def width(self) -> int:
        return self._req_width

    @property
    def height(self) -> int:
        return self._req_height

    def read(self) -> Optional[Frame]:  # pragma: no cover - matériel réel
        if self._stream is None:
            raise RuntimeError("Source non ouverte — appelez open() d'abord.")
        buf = self._stream.timeout_pop_buffer(1_000_000)  # 1 s max
        if buf is None:
            return None
        try:
            w = buf.get_image_width()
            h = buf.get_image_height()
            data = buf.get_data()
            arr = np.frombuffer(data, dtype=np.uint8)
            image = decode_image(arr, w, h, self.pixel_format)
            frame = Frame(
                index=self._index,
                timestamp=self._index / self._req_fps,
                image=image.copy(),
            )
            self._index += 1
            return frame
        finally:
            self._stream.push_buffer(buf)

    def close(self) -> None:  # pragma: no cover - matériel réel
        if self._camera is not None:
            try:
                self._camera.stop_acquisition()
            except Exception:  # noqa: BLE001
                pass
            self._camera = None
            self._stream = None
