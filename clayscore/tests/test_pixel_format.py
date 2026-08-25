"""Le format de pixels de la caméra : là où une installation se sabote en silence.

Mesuré : en monochrome, le banc de verdicts tombe de 27/27 à 9/27, et les
erreurs sortent avec une confiance de 0,72 — donc sans jamais demander
d'arbitrage. Ces tests verrouillent les deux garde-fous : refus du mono, et
déballage Bayer avec la BONNE correspondance OpenCV.
"""
import cv2
import numpy as np
import pytest

from clayscore.sources.video_aravis import (
    BAYER_VERS_OPENCV, AravisVideoSource, decode_image)
from clayscore.vision.detector import qualite_image

# Un plateau orange franc, en BGR.
ORANGE_BGR = (30, 120, 240)
MOTIFS = {                       # motif du capteur, convention GenICam
    "BayerRG8": [["R", "G"], ["G", "B"]],
    "BayerBG8": [["B", "G"], ["G", "R"]],
    "BayerGR8": [["G", "R"], ["B", "G"]],
    "BayerGB8": [["G", "B"], ["R", "G"]],
}


def _mosaique(motif, h=16, w=16):
    """Fabrique la mosaïque brute que sortirait le capteur."""
    val = {"B": ORANGE_BGR[0], "G": ORANGE_BGR[1], "R": ORANGE_BGR[2]}
    m = np.zeros((h, w), np.uint8)
    for dy in (0, 1):
        for dx in (0, 1):
            m[dy::2, dx::2] = val[motif[dy][dx]]
    return m


# --- Bayer : la couleur doit ressortir ORANGE, pas bleue ------------------ #
@pytest.mark.parametrize("fmt", sorted(MOTIFS))
def test_une_mosaique_bayer_ressort_bien_en_orange(fmt):
    h = w = 16
    brut = _mosaique(MOTIFS[fmt], h, w).reshape(-1)
    img = decode_image(brut, w, h, fmt)

    assert img.shape == (h, w, 3)
    b, g, r = (int(x) for x in img[h // 2, w // 2])
    assert r > b, f"{fmt} : rouge et bleu échangés — l'orange devient du bleu"
    assert abs(r - ORANGE_BGR[2]) < 30 and abs(b - ORANGE_BGR[0]) < 30
    teinte = int(cv2.cvtColor(img, cv2.COLOR_BGR2HSV)[h // 2, w // 2, 0])
    assert teinte < 25, f"{fmt} : teinte {teinte} — ce n'est plus de l'orange"


def test_le_mauvais_code_opencv_donnerait_du_bleu():
    # Preuve que le piège est réel, pas théorique : avec le code « évident »
    # (BayerRG8 -> COLOR_BayerRG2BGR), l'orange devient bleu.
    h = w = 16
    m = _mosaique(MOTIFS["BayerRG8"], h, w)
    faux = cv2.cvtColor(m, cv2.COLOR_BayerRG2BGR)
    b, g, r = (int(x) for x in faux[h // 2, w // 2])
    assert b > r, "le piège Bayer n'existe plus : revérifier la table"
    assert BAYER_VERS_OPENCV["BayerRG8"] == "COLOR_BayerBG2BGR"


def test_une_image_bayer_decodee_passe_le_controle_couleur():
    h = w = 32
    img = decode_image(_mosaique(MOTIFS["BayerRG8"], h, w).reshape(-1),
                       w, h, "BayerRG8")
    assert qualite_image(img)["couleur_ok"] is True


# --- formats 3 canaux : passe-plat -------------------------------------- #
def test_format_rgb8_est_pris_tel_quel():
    h, w = 8, 8
    src = np.tile(np.array(ORANGE_BGR, np.uint8), (h, w, 1))
    out = decode_image(src.reshape(-1), w, h, "RGB8")
    assert out.shape == (h, w, 3)
    assert tuple(int(x) for x in out[0, 0]) == ORANGE_BGR


# --- mono : refusé à la construction ------------------------------------- #
def test_un_format_mono_est_refuse():
    with pytest.raises(ValueError, match="NOIR ET BLANC"):
        AravisVideoSource(pixel_format="Mono8")
    with pytest.raises(ValueError):
        AravisVideoSource(pixel_format="mono12")


def test_le_defaut_de_la_camera_est_en_couleur():
    # Le défaut historique était Mono8 : la configuration sortie de la boîte
    # cassait le produit sans rien dire.
    src = AravisVideoSource()
    assert src.pixel_format == "RGB8"
    assert not src.pixel_format.lower().startswith("mono")


def test_le_mono_reste_possible_si_on_le_demande_explicitement():
    src = AravisVideoSource(pixel_format="Mono8", autoriser_mono=True)
    assert src.pixel_format == "Mono8"
    # ...mais l'image produite est bien signalée comme incolore.
    h = w = 8
    plan = np.full(h * w, 120, np.uint8)
    img = decode_image(plan, w, h, "Mono8")
    assert qualite_image(img)["couleur_ok"] is False


def test_la_fabrique_ne_construit_plus_une_camera_noir_et_blanc():
    from clayscore.sources import build_video_source
    v = build_video_source({"type": "aravis"})
    assert v.pixel_format == "RGB8"
    with pytest.raises(ValueError, match="NOIR ET BLANC"):
        build_video_source({"type": "aravis", "pixel_format": "Mono8"})
