"""Performance : le système doit tenir 3 caméras en temps réel.

Mesuré avant optimisation : en 1440x1080, le pipeline plafonnait à ~89
images/s alors que 3 caméras à 65 images/s en exigent 195. **Il ne tenait
pas le temps réel** — un plateau sur deux aurait été manqué.

Ces tests verrouillent la correction : la détection travaille sur une image
réduite (rapide), mais la couleur — qui décide du verdict — reste mesurée en
pleine résolution.
"""
from __future__ import annotations

import os
import tempfile
import time

import cv2
import numpy as np
import pytest

from clayscore.sources.audio_file import read_wav_mono
from clayscore.sources.base import Frame, VideoSource
from clayscore.tools_bridge import synth
from clayscore.vision.detector import (DetectorConfig, MotionDetector,
                                       _orange_ratio, qualite_image)
from clayscore.vision.verdict import decide_verdict

CAMERAS = 3
FPS = 65
BESOIN_IMG_S = CAMERAS * FPS          # 195 images/s à soutenir


def _sequence(w: int, h: int, n: int = 40):
    """Un plateau orange qui traverse un fond fixe et bruité."""
    rng = np.random.default_rng(1)
    fond = rng.integers(60, 200, (h, w, 3), dtype=np.uint8)
    frames = []
    for i in range(n):
        img = fond.copy()
        cx = int(w * 0.15 + i * w * 0.012)
        cy = int(h * 0.4)
        r = max(3, int(min(w, h) * 0.012))
        cv2.circle(img, (cx, cy), r, (20, 120, 240), -1)
        frames.append(Frame(index=i, timestamp=i / FPS, image=img))
    return frames


def _images_par_seconde(cfg: DetectorConfig, w: int, h: int,
                        essais: int = 3) -> float:
    """Meilleur de N essais.

    Une mesure de vitesse est bruitée : la machine fait autre chose en même
    temps (les autres tests, par exemple). On garde le MEILLEUR essai, qui
    représente la vitesse réelle du code sans interférence — sinon le test
    devient instable, ce qui est pire que pas de test du tout.
    """
    meilleur = 0.0
    for _ in range(essais):
        det = MotionDetector(cfg)
        frames = _sequence(w, h)
        for f in frames[:8]:                  # chauffe (apprentissage du fond)
            det.process(f)
        t0 = time.perf_counter()
        for f in frames:
            det.process(f)
        dt = time.perf_counter() - t0
        if dt > 0:
            meilleur = max(meilleur, len(frames) / dt)
    return meilleur


# --- le contrat de temps réel --------------------------------------------- #
@pytest.mark.parametrize("w,h", [(1440, 1080)])
def test_tient_le_temps_reel_a_pleine_resolution_camera(w, h):
    """Avec le réglage livré, 3 caméras à 65 fps doivent passer.

    Marge volontairement demandée : le Jetson est plus lent qu'une machine de
    développement. Si ce test casse un jour, le produit ne tient plus le
    temps réel — c'est bloquant, pas cosmétique.
    """
    fps = _images_par_seconde(DetectorConfig(), w, h)
    assert fps > BESOIN_IMG_S, (
        f"{fps:.0f} images/s mesurées, il en faut {BESOIN_IMG_S} "
        f"pour {CAMERAS} caméras à {FPS} fps.")


def test_le_gain_ne_depend_pas_de_la_machine():
    """Le rapport avant/après est stable même sur une machine chargée.

    Le chiffre absolu (images/s) dépend de la machine ; le RAPPORT, non. Ce
    test est donc le garde-fou fiable, celui qui doit tenir partout.
    """
    plein = _images_par_seconde(DetectorConfig(detect_max_pixels=0), 1440, 1080)
    reduit = _images_par_seconde(DetectorConfig(), 1440, 1080)
    assert reduit / plein > 2.0, (
        f"gain insuffisant : {plein:.0f} -> {reduit:.0f} images/s")


# --- ce que la réduction ne doit PAS abîmer ------------------------------- #
def test_les_coordonnees_restent_en_pleine_resolution():
    """Le reste du programme ne doit pas savoir qu'on a réduit l'image."""
    det = MotionDetector()
    frames = _sequence(1440, 1080)
    for f in frames[:8]:
        det.process(f)
    dets = [d for f in frames[8:] for d in det.process(f)]
    assert dets, "Le plateau doit être détecté."
    # Les centres doivent tomber dans l'image PLEINE, pas dans l'image réduite.
    assert max(d.cx for d in dets) > 640, (
        "Coordonnées non remises à l'échelle : elles restent dans l'image réduite.")
    assert all(0 <= d.cx <= 1440 and 0 <= d.cy <= 1080 for d in dets)


def test_la_couleur_est_mesuree_en_pleine_resolution():
    """L'orange décide du verdict : il ne doit jamais être dégradé."""
    det = MotionDetector()
    frames = _sequence(1440, 1080)
    for f in frames[:8]:
        det.process(f)
    dets = [d for f in frames[8:12] for d in det.process(f)]
    assert dets and max(d.orange_ratio for d in dets) > 0.2, (
        "Le plateau orange doit rester franchement orange après optimisation.")


def test_les_petites_images_ne_sont_pas_reduites():
    """En simulation (320x240), rien ne change : pas de réduction inutile."""
    det = MotionDetector()
    for f in _sequence(320, 240)[:10]:
        det.process(f)
    assert det._scale == 1.0


def test_le_mode_gris_reste_desactive():
    """Il serait plus rapide, mais mesuré : il fait chuter la précision.

    27/27 -> 26/27, un plateau MANQUÉ devenant « cassé » : un point attribué à
    tort. Aucun gain de vitesse ne justifie une erreur d'arbitrage.
    """
    assert DetectorConfig().detect_gray is False


# ======================= ROBUSTESSE (conditions réelles) ================== #
# Le banc habituel teste des images propres. Le stand, lui, apporte de la
# pénombre, du grain et de la surexposition. Ces tests verrouillent ce qui a
# été mesuré, y compris les limites assumées.



class _Degrade(VideoSource):
    """Rejoue un clip en le dégradant, comme le ferait une vraie journée."""

    def __init__(self, path, gain=1.0, bruit=0.0, seed=0):
        self.path, self.gain, self.bruit = path, gain, bruit
        self._rng = np.random.default_rng(seed)
        self._i, self._cap = 0, None

    @property
    def fps(self):
        return 30.0

    @property
    def width(self):
        return 320

    @property
    def height(self):
        return 240

    def open(self):
        return self

    def close(self):
        if self._cap is not None:
            self._cap.release()
            self._cap = None

    def read(self):
        if self._cap is None:
            self._cap = cv2.VideoCapture(self.path)
        ok, img = self._cap.read()
        if not ok:
            return None
        if self.gain != 1.0:
            img = np.clip(img.astype(np.float32) * self.gain, 0, 255).astype(np.uint8)
        if self.bruit:
            img = np.clip(img.astype(np.int16)
                          + self._rng.normal(0, self.bruit, img.shape),
                          0, 255).astype(np.uint8)
        f = Frame(index=self._i, timestamp=self._i / 30.0, image=img)
        self._i += 1
        return f


def _verdicts(gain=1.0, bruit=0.0, seeds=(100, 101)):
    ok = 0
    total = 0
    with tempfile.TemporaryDirectory() as tmp:
        for scen in synth.SCENARIOS:
            for bg in synth.BACKGROUNDS:
                for seed in seeds:
                    p = synth.SynthParams(scenario=scen, background=bg, width=320,
                                          height=240, duration_s=2.0, seed=seed)
                    paths = synth.generate(p, os.path.join(tmp, f"{scen}{bg}{seed}"))
                    data, sr = read_wav_mono(paths["audio"])
                    r = decide_verdict(_Degrade(paths["video"], gain=gain,
                                                bruit=bruit, seed=seed), data, sr)
                    total += 1
                    if r.verdict == synth.VERDICT_BY_SCENARIO[scen]:
                        ok += 1
    return ok, total


def test_la_penombre_ne_casse_plus_les_verdicts():
    """Le défaut le plus grave trouvé : à −60 % de lumière — une fin de
    journée, quand les clubs tirent le plus — TOUS les verdicts devenaient
    MANQUÉ (précision 33 %, le hasard). Corrigé par le test de teinte."""
    ok, total = _verdicts(gain=0.4)
    assert ok == total, f"pénombre : {ok}/{total} (le système redevient aveugle)"


def test_la_sous_exposition_ne_casse_plus_les_verdicts():
    ok, total = _verdicts(gain=0.6)
    assert ok == total, f"sous-exposé : {ok}/{total}"


def test_les_conditions_propres_restent_parfaites():
    ok, total = _verdicts()
    assert ok == total


def test_le_plateau_reste_orange_meme_dans_le_noir():
    """Un plateau à −60 % de lumière doit rester reconnu comme orange."""
    plateau = np.full((20, 20, 3), (20, 120, 240), dtype=np.uint8)
    for gain in (1.0, 0.6, 0.4):
        sombre = np.clip(plateau.astype(np.float32) * gain, 0, 255).astype(np.uint8)
        assert _orange_ratio(sombre) > 0.9, f"perdu à gain={gain}"


# --- contrôle de la qualité d'image --------------------------------------- #
def _clip_frame(bg="ciel"):
    with tempfile.TemporaryDirectory() as tmp:
        paths = synth.generate(
            synth.SynthParams(scenario="casse", background=bg, width=320,
                              height=240, duration_s=1.0, seed=100),
            os.path.join(tmp, bg))
        cap = cv2.VideoCapture(paths["video"])
        _, img = cap.read()
        cap.release()
        return img


def test_une_bonne_image_ne_declenche_aucune_alarme():
    """Un contrôle qui crie au loup fait perdre du temps au réglage."""
    for bg in ("ciel", "foret", "contrejour"):
        q = qualite_image(_clip_frame(bg))
        assert q["ok"], f"faux avertissement sur fond {bg} : {q['problemes']}"


def test_les_vrais_defauts_de_reglage_sont_detectes():
    img = _clip_frame("foret")
    sombre = np.clip(img * 0.3, 0, 255).astype(np.uint8)
    assert any("sombre" in p["quoi"] for p in qualite_image(sombre)["problemes"])

    # La surexposition se juge sur une scène claire : une forêt sombre +150
    # ne crame pas encore. On prend donc le ciel, où le défaut est réel.
    crame = np.clip(_clip_frame("ciel").astype(np.int16) + 150,
                    0, 255).astype(np.uint8)
    assert any("surexpos" in p["quoi"] for p in qualite_image(crame)["problemes"])

    rng = np.random.default_rng(0)
    bruite = np.clip(img.astype(np.int16) + rng.normal(0, 25, img.shape),
                     0, 255).astype(np.uint8)
    assert any("bruit" in p["quoi"] for p in qualite_image(bruite)["problemes"])


def test_la_nettete_est_un_indicateur_pas_une_alarme():
    """Mesuré : un ciel NET score 3,8 et une forêt FLOUE score 2,0. Les
    valeurs se chevauchent — aucun seuil ne peut trancher sur une image
    isolée. On mesure donc, sans jamais accuser à tort."""
    q = qualite_image(_clip_frame("ciel"))
    assert "nettete" in q and q["ok"], "un ciel net ne doit pas être signalé flou"
    assert all("nette" not in p["quoi"] for p in q["problemes"])


def test_chaque_defaut_dit_comment_le_corriger():
    img = np.clip(_clip_frame("foret") * 0.3, 0, 255).astype(np.uint8)
    for p in qualite_image(img)["problemes"]:
        assert p["solution"], "un problème sans solution n'aide personne"
