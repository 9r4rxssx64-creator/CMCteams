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
        pixel_format : "Mono8", "BayerRG8", "RGB8", ...
        n_buffers : profondeur du flux (défaut 20)
    """

    def __init__(
        self,
        camera_id: Optional[str] = None,
        width: int = 1440,
        height: int = 1080,
        fps: float = 50.0,
        pixel_format: str = "Mono8",
        n_buffers: int = 20,
    ):
        self.camera_id = camera_id
        self._req_width = int(width)
        self._req_height = int(height)
        self._req_fps = float(fps)
        self.pixel_format = str(pixel_format)
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
            if arr.size >= w * h * 3:
                image = arr[: w * h * 3].reshape(h, w, 3)
            else:
                mono = arr[: w * h].reshape(h, w)
                import cv2

                image = cv2.cvtColor(mono, cv2.COLOR_GRAY2BGR)
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
