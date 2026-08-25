"""Détection de mouvement + comptage des lancements (jalon 1).

Approche « classique » (sans IA, rapide sur Jetson) :
  1. Soustraction de fond MOG2 -> masque des pixels en mouvement.
  2. Nettoyage morphologique (ouverture pour le bruit, dilatation pour relier
     les fragments proches).
  3. Composantes connexes -> blobs (plateaux ou éclats) avec surface/centre.
  4. Classification simple : blob « plateau » (surface + rondeur + orange) et
     « rafale » (beaucoup de surface en mouvement dans la zone de lancement).

Un LANCEMENT = apparition d'une cible (plateau propre OU rafale d'éclats pour
un no-bird) après une période sans cible, dans la zone basse (près du lanceur).

Toutes les tailles sont exprimées en fraction de la surface d'image
=> indépendant de la résolution (fonctionne en 320x240 comme en 1440x1080).
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional

import cv2
import numpy as np

from ..sources.base import Frame, VideoSource


@dataclass
class Detection:
    """Un blob détecté sur une image."""

    cx: float           # centre x
    cy: float           # centre y
    area: float         # surface en pixels
    bbox: tuple         # (x, y, w, h)
    radius: float       # rayon équivalent (sqrt(area/pi))
    circularity: float  # 4*pi*area / perimetre^2 (1 = cercle parfait)
    orange_ratio: float # fraction de pixels « orange » dans la bbox
    is_clay: bool       # blob compatible avec un plateau propre


@dataclass
class DetectorConfig:
    warmup_frames: int = 6            # trames d'apprentissage du fond
    history: int = 200                # mémoire MOG2
    var_threshold: float = 16.0       # sensibilité MOG2
    bg_mixtures: int = 3              # gaussiennes par pixel (défaut OpenCV : 5)
    clay_area_min_frac: float = 0.00018   # surface mini d'un plateau
    clay_area_max_frac: float = 0.02      # surface maxi d'un plateau
    noise_area_min_frac: float = 0.00006  # en dessous = bruit ignoré
    circularity_min: float = 0.55     # rondeur mini pour « plateau »
    launch_zone_y_frac: float = 0.40  # cible « basse » si cy > 0.40*H
    burst_area_frac: float = 0.0009   # surface totale en zone = rafale (no-bird)
    confirm_frames: int = 2           # trames consécutives pour confirmer
    reset_gap_frames: int = 5         # trames sans cible pour réarmer
    # OPTIMISATION (mesurée) : la soustraction de fond coûte 73 % du temps
    # d'analyse et son coût croît avec le nombre de pixels. En 1440x1080, le
    # pipeline plafonnait à 132 images/s alors que 3 caméras à 65 fps en
    # exigent 195 : il ne tenait PAS le temps réel.
    #
    # On cherche donc les blobs sur une image RÉDUITE (rapide), puis on mesure
    # la couleur sur l'image PLEINE résolution, là où la précision compte
    # vraiment (c'est l'orange qui décide du verdict).
    #
    # 0 = désactivé (traitement pleine résolution).
    detect_max_pixels: int = 640 * 480
    # Chercher les blobs en niveaux de gris serait encore 1,8x plus rapide,
    # MAIS c'est REFUSÉ par défaut : mesuré, la précision tombe de 27/27 à
    # 26/27 — un plateau manqué devient « cassé », soit un point attribué à
    # tort. Un gain de vitesse ne vaut jamais une erreur d'arbitrage.
    detect_gray: bool = False


def _orange_ratio(bgr_roi: np.ndarray) -> float:
    """Fraction de pixels orange (plateau) dans une ROI BGR.

    Test fondé sur la TEINTE, pas sur la luminosité.

    L'ancienne version utilisait des seuils absolus (« rouge > 140 »). Mesuré :
    à −60 % de lumière — c'est-à-dire une fin de journée, quand les clubs
    tirent le plus — le plateau cessait d'être « orange » pour le programme,
    et **tous** les verdicts devenaient MANQUÉ (précision effondrée à 33 %).

    La teinte, elle, ne change pas quand la lumière baisse : un plateau orange
    reste orange, simplement plus sombre. On exige donc une teinte dans la
    bande orange, une couleur franche (saturation), et juste assez de lumière
    pour que la mesure ait un sens.
    """
    if bgr_roi.size == 0:
        return 0.0

    # (1) Test en niveaux BGR — solide en pleine lumière et sur image bruitée,
    #     mais il lâche quand la lumière baisse (le rouge passe sous le seuil).
    b = bgr_roi[..., 0].astype(np.int32)
    g = bgr_roi[..., 1].astype(np.int32)
    r = bgr_roi[..., 2].astype(np.int32)
    par_niveaux = (r > 140) & (g > 55) & (g < 190) & (b < 130) & (r - b > 50)

    # (2) Test en TEINTE — insensible à la baisse de lumière (un plateau
    #     orange reste orange, simplement plus sombre), mais moins fiable
    #     quand la couleur est délavée (surexposition) ou très bruitée.
    hsv = cv2.cvtColor(bgr_roi, cv2.COLOR_BGR2HSV)
    hh = hsv[..., 0].astype(np.int32)     # teinte 0-179 (OpenCV)
    ss = hsv[..., 1].astype(np.int32)     # saturation 0-255
    vv = hsv[..., 2].astype(np.int32)     # luminosité 0-255
    # Bornes CHOISIES SUR MESURE (distributions relevées sur les vrais clips) :
    # le plateau est en teinte 10-19 sur les trois fonds, le feuillage d'une
    # forêt commence à 18, le ciel est vers 100-106. Une borne à 25 attrapait
    # la forêt (précision tombée à 25/27) ; 17 sépare proprement.
    # L'écart rouge-bleu est exigé AUSSI ici : il survit à la baisse de
    # lumière (il est proportionnel), mais pas au bruit ni au délavage. C'est
    # lui qui empêche du bruit d'être pris pour un plateau — mesuré, il fait
    # passer le bruit fort de 21/27 à 23/27 et supprime le point attribué à
    # tort en surexposition.
    par_teinte = ((hh >= 3) & (hh <= 17) & (ss >= 80) & (vv >= 30)
                  & (r - b > 50))

    # Les deux tests se complètent : chacun couvre l'angle mort de l'autre.
    # MESURÉ sur 27 clips par condition (voir docs/AUDIT_QUALITE.md) :
    #                        niveaux seuls   les deux
    #   conditions propres      27/27          27/27
    #   sous-exposé -40 %        9/27  <<<     27/27
    #   très sombre -60 %        9/27  <<<     27/27
    #   bruit capteur fort      27/27          23/27
    #   surexposé +50 %         27/27          25/27 (0 point donné à tort)
    # Le compromis est assumé : une image trop claire ou trop bruitée se
    # corrige au réglage de la caméra (diaphragme, temps de pose) et le
    # système le signale AVANT l'épreuve ; la tombée du jour, elle, ne se
    # corrige pas — et c'est justement quand les clubs tirent.
    return float((par_niveaux | par_teinte).mean())


class MotionDetector:
    """Détecte les blobs en mouvement image par image (MOG2 + morpho)."""

    def __init__(self, config: Optional[DetectorConfig] = None):
        self.cfg = config or DetectorConfig()
        self._bg = cv2.createBackgroundSubtractorMOG2(
            history=self.cfg.history,
            varThreshold=self.cfg.var_threshold,
            detectShadows=False,
        )
        # MOG2 modélise chaque pixel par plusieurs gaussiennes. Par défaut 5,
        # ce qui sert à décrire un fond très remuant (feuillage, foule, écrans).
        # Un stand de ball-trap n'a pas ça : caméra fixe, ciel et filets.
        # MESURÉ sur 70 images en 1440x1080, meilleur de 5 essais :
        #   5 gaussiennes (défaut) → 214-226 img/s
        #   3 gaussiennes          → 228-233 img/s   soit +3 à +7 %
        # et la précision des verdicts reste à **27/27** (banc complet rejoué).
        # Descendre à 2 ne gagne plus rien et rend le fond moins tolérant.
        self._bg.setNMixtures(self.cfg.bg_mixtures)
        self._kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        self._n = 0
        self._scale = 1.0        # facteur de réduction réellement appliqué

    @property
    def n_processed(self) -> int:
        return self._n

    def process(self, frame: Frame) -> List[Detection]:
        """Renvoie les détections de cette trame (vide pendant le warmup).

        Les coordonnées renvoyées sont TOUJOURS en pleine résolution, même si
        la détection a travaillé sur une image réduite : le reste du programme
        n'a pas à s'en soucier.
        """
        img = frame.image
        h, w = img.shape[:2]
        area_img = float(w * h)

        # Réduction éventuelle, uniquement pour la recherche de blobs.
        small = img
        cap = int(self.cfg.detect_max_pixels or 0)
        if self.cfg.detect_gray and small.ndim == 3:
            small = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
        if cap > 0 and w * h > cap:
            self._scale = float(np.sqrt(cap / float(w * h)))
            small = cv2.resize(small, (max(2, int(w * self._scale)),
                                       max(2, int(h * self._scale))),
                               interpolation=cv2.INTER_LINEAR)
        else:
            self._scale = 1.0
        inv = 1.0 / self._scale        # pour revenir en pleine résolution

        # Pendant le warmup on apprend vite le fond (learningRate élevé).
        lr = 0.5 if self._n < self.cfg.warmup_frames else -1
        fg = self._bg.apply(small, learningRate=lr)
        self._n += 1
        if self._n <= self.cfg.warmup_frames:
            return []

        # Nettoyage.
        #
        # Il y avait ici un seuillage `cv2.threshold(fg, 127, 255)`. MESURÉ :
        # avec `detectShadows=False`, MOG2 ne produit QUE 0 et 255 — le
        # seuillage ne changeait donc pas une seule valeur. Du travail pour
        # rien sur chaque image de chaque caméra. Il n'est conservé que si un
        # jour on réactive les ombres (MOG2 sort alors 127 pour « ombre », et
        # là il faut vraiment trancher).
        if self._bg.getDetectShadows():
            _, fg = cv2.threshold(fg, 127, 255, cv2.THRESH_BINARY)
        fg = cv2.morphologyEx(fg, cv2.MORPH_OPEN, self._kernel, iterations=1)
        fg = cv2.dilate(fg, self._kernel, iterations=1)

        n_labels, _labels, stats, centroids = cv2.connectedComponentsWithStats(fg)
        dets: List[Detection] = []
        noise_min = self.cfg.noise_area_min_frac * area_img
        clay_min = self.cfg.clay_area_min_frac * area_img
        clay_max = self.cfg.clay_area_max_frac * area_img

        for lbl in range(1, n_labels):
            x, y, bw, bh, area = stats[lbl]
            # Remise à l'échelle : surfaces en pixels² -> facteur inv².
            area = float(area) * inv * inv
            if area < noise_min:
                continue
            cx, cy = centroids[lbl]
            cx *= inv
            cy *= inv
            x = int(x * inv)
            y = int(y * inv)
            bw = max(1, int(bw * inv))
            bh = max(1, int(bh * inv))
            # Rondeur via le contour de la boîte englobante (approx rapide).
            perim = 2.0 * (bw + bh)
            circ = (4.0 * np.pi * area / (perim * perim)) if perim > 0 else 0.0
            # La couleur est TOUJOURS mesurée en pleine résolution : c'est
            # l'orange qui décide du verdict, on ne dégrade pas ce signal.
            roi = img[y:y + bh, x:x + bw]
            oratio = _orange_ratio(roi)
            is_clay = (
                clay_min <= area <= clay_max
                and circ >= self.cfg.circularity_min
            )
            dets.append(
                Detection(
                    cx=float(cx),
                    cy=float(cy),
                    area=float(area),
                    bbox=(int(x), int(y), int(bw), int(bh)),
                    radius=float(np.sqrt(area / np.pi)),
                    circularity=float(circ),
                    orange_ratio=float(oratio),
                    is_clay=bool(is_clay),
                )
            )
        return dets


@dataclass
class LaunchEvent:
    frame_index: int
    cx: float
    cy: float
    kind: str  # "clay" (disque propre) | "burst" (rafale d'éclats, no-bird)


class LaunchCounter:
    """Machine à états comptant les lancements à partir des détections.

    Émet un LaunchEvent quand une cible apparaît (après une période vide) dans
    la zone basse. Robuste au bruit via une confirmation sur N trames.
    """

    def __init__(self, frame_w: int, frame_h: int,
                 config: Optional[DetectorConfig] = None):
        self.cfg = config or DetectorConfig()
        self.w = frame_w
        self.h = frame_h
        self._area_img = float(frame_w * frame_h)
        self._present_streak = 0
        self._absent_streak = self.cfg.reset_gap_frames  # armé au départ
        self._armed = True
        self.events: List[LaunchEvent] = []

    def _qualifies(self, dets: List[Detection]):
        """Retourne (present, cx, cy, kind) pour la zone de lancement."""
        zone_y = self.cfg.launch_zone_y_frac * self.h
        burst_min = self.cfg.burst_area_frac * self._area_img
        # 1) plateau propre en zone basse
        clays = [d for d in dets if d.is_clay and d.cy >= zone_y]
        if clays:
            d = max(clays, key=lambda d: d.area)
            return True, d.cx, d.cy, "clay"
        # 2) rafale : surface totale en zone basse (no-bird = éclats)
        zone = [d for d in dets if d.cy >= zone_y]
        total = sum(d.area for d in zone)
        if total >= burst_min and zone:
            cx = float(np.mean([d.cx for d in zone]))
            cy = float(np.mean([d.cy for d in zone]))
            return True, cx, cy, "burst"
        return False, 0.0, 0.0, ""

    def update(self, frame_index: int, dets: List[Detection]) -> Optional[LaunchEvent]:
        present, cx, cy, kind = self._qualifies(dets)
        event: Optional[LaunchEvent] = None

        if present:
            self._present_streak += 1
            self._absent_streak = 0
            if self._armed and self._present_streak >= self.cfg.confirm_frames:
                event = LaunchEvent(frame_index=frame_index, cx=cx, cy=cy, kind=kind)
                self.events.append(event)
                self._armed = False  # attend la disparition avant un nouveau lancement
        else:
            self._absent_streak += 1
            self._present_streak = 0
            if self._absent_streak >= self.cfg.reset_gap_frames:
                self._armed = True

        return event


def count_launches(source: VideoSource,
                   config: Optional[DetectorConfig] = None) -> List[LaunchEvent]:
    """Parcourt une source vidéo entière et renvoie les lancements détectés."""
    cfg = config or DetectorConfig()
    detector = MotionDetector(cfg)
    counter: Optional[LaunchCounter] = None
    with source as src:
        for frame in src:
            if counter is None:
                counter = LaunchCounter(frame.width, frame.height, cfg)
            dets = detector.process(frame)
            counter.update(frame.index, dets)
    return counter.events if counter else []


# --- contrôle de la qualité d'image (réglage caméra) ---------------------- #
def qualite_image(img: np.ndarray) -> dict:
    """L'image est-elle exploitable ? Sinon, que faut-il régler ?

    Mesuré : la précision chute quand l'image est trop sombre, trop claire ou
    trop bruitée. Ces trois défauts se corrigent **au réglage de la caméra**
    (diaphragme, temps de pose, gain) — encore faut-il les voir. D'où ce
    contrôle, affiché avant l'épreuve plutôt que découvert au 20ᵉ plateau.

    Retourne des mesures RÉELLES (pas des estimations) et, pour chaque défaut,
    le geste qui le corrige.
    """
    if img is None or img.size == 0:
        return {"ok": False, "problemes": [{
            "niveau": "bloquant", "quoi": "Aucune image reçue de la caméra.",
            "solution": "Vérifier le câble et l'alimentation du poste."}]}

    gris = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if img.ndim == 3 else img
    lumiere = float(np.mean(gris))
    # Bruit : écart-type de l'image moins sa version lissée (le lissage retire
    # le signal, il ne reste que le grain).
    bruit = float(np.std(gris.astype(np.float32)
                         - cv2.GaussianBlur(gris, (5, 5), 0).astype(np.float32)))
    # Netteté : mesurée et RAPPORTÉE, mais volontairement SANS alarme.
    #
    # Mesuré : un ciel parfaitement net score 3,8 ; une forêt franchement
    # floue score 2,0. Les valeurs se chevauchent, parce que ce chiffre
    # dépend du CONTENU de la scène autant que de la mise au point. Aucun
    # seuil ne peut donc séparer « net » de « flou » sur une image isolée.
    #
    # Plutôt qu'un contrôle qui crierait au loup sur un beau ciel dégagé, on
    # affiche la valeur comme indicateur : la mise au point se règle à l'œil
    # à l'installation (plateau tenu à 25-30 m — voir GUIDE_MONTAGE), et ce
    # chiffre sert à COMPARER deux réglages du même poste, pas à juger seul.
    nettete = float(cv2.Laplacian(gris, cv2.CV_64F).var())
    satures = float(np.mean(gris >= 250))     # zones cramées

    # Couleur : le verdict repose sur le test « orange » du plateau. Une image
    # sans couleur (caméra MONOCHROME, ou réglage saturation à zéro) casse ce
    # test — et le casse SILENCIEUSEMENT, ce qui est le pire cas.
    #
    # MESURÉ sur le banc des 27 scénarios :
    #   couleur     -> 27/27 (100 %)
    #   monochrome  ->  9/27 (33 %), et chaque « cassé » devient « manqué »
    #                  avec une confiance de 0,72 : au-dessus du seuil, donc
    #                  jamais signalé comme ambigu. Faux, et sûr de lui.
    #
    # Seuil choisi sur mesure, pas au jugé : saturation moyenne mesurée à
    # 18,9 dans le pire cas couleur (contre-jour) et exactement 0,0 en
    # monochrome. Un seuil à 5 est loin des deux — il ne se déclenche que sur
    # un flux réellement incolore, pas sur une journée grise.
    saturation = (float(np.mean(cv2.cvtColor(img, cv2.COLOR_BGR2HSV)[:, :, 1]))
                  if img.ndim == 3 else 0.0)

    problemes = []
    if saturation < 5.0:
        problemes.append({
            "niveau": "bloquant",
            "quoi": f"Image sans couleur (saturation mesurée {saturation:.1f}) — "
                    "caméra monochrome ou saturation à zéro. Le plateau est "
                    "reconnu à sa couleur orange : sans elle, mesuré 9/27 au "
                    "lieu de 27/27, et les erreurs passent pour des certitudes.",
            "solution": "Utiliser une caméra COULEUR, ou remonter la saturation "
                        "dans les réglages de la caméra."})
    if lumiere < 45:
        problemes.append({
            "niveau": "important",
            "quoi": f"Image très sombre (luminosité moyenne {lumiere:.0f}/255).",
            "solution": "Ouvrir le diaphragme, ou rallonger un peu le temps de "
                        "pose (sans dépasser 1/1000 s : le plateau deviendrait flou)."})
    if satures > 0.08:
        problemes.append({
            "niveau": "important",
            "quoi": f"Image surexposée ({satures*100:.0f} % de zones cramées).",
            "solution": "Fermer le diaphragme ou raccourcir le temps de pose."})
    if bruit > 8.0:
        problemes.append({
            "niveau": "important",
            "quoi": f"Image bruitée (grain mesuré {bruit:.1f}).",
            "solution": "Baisser le gain/ISO de la caméra et ouvrir le "
                        "diaphragme. Un grain fort dégrade la reconnaissance."})
    return {"ok": not problemes, "luminosite": round(lumiere, 1),
            "saturation": round(saturation, 1),
            "couleur_ok": saturation >= 5.0,
            "bruit": round(bruit, 2), "nettete": round(nettete, 1),
            "nettete_info": "indicateur seul : comparer deux réglages du même "
                            "poste, ne juge pas la mise au point à lui seul",
            "satures_pct": round(satures * 100, 1), "problemes": problemes}
