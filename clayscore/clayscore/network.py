"""Réseau ClayScore : autonome OU branché sur le réseau d'un club.

Trois modes, décidés par la configuration (`config/config.yaml`) :

- ``autonome`` : le hub crée SON PROPRE WiFi (hotspot). Aucun Internet, aucune
  infrastructure. C'est le mode d'un stand en pleine nature.
- ``reseau``   : le hub REJOINT le réseau existant du club (câble Ethernet ou
  WiFi client). Pratique en club équipé : la tablette reste sur le WiFi du
  club, l'écran TV du club-house voit les scores, et une sauvegarde
  Internet/NAS devient possible.
- ``auto``     : essaie de rejoindre un réseau existant ; si aucun n'est
  disponible au démarrage, bascule automatiquement en hotspot. C'est le
  défaut : le système marche **partout, sans réglage**.

Point important (et non évident) : les caméras GigE vivent sur LEUR PROPRE
réseau (le switch PoE), séparé du réseau du club. Le hub a donc deux pattes :

    [caméras GigE] --- eth_cam (192.168.10.x, fixe)  →  HUB
    [réseau club]  --- uplink  (DHCP du club)        →  HUB  →  tablettes

Cette séparation est volontaire :
  * le trafic caméra (élevé, sensible) ne traverse jamais le réseau du club ;
  * une panne du réseau du club n'arrête pas l'analyse des plateaux ;
  * inversement, le club n'est pas inondé par les flux vidéo.

Ce module ne fait AUCUNE modification système : il observe l'état réseau et
dit quoi faire. L'application effective est faite par ``deploy/network.sh``
(volontairement séparé : un module importé par les tests ne doit jamais
reconfigurer une machine).
"""
from __future__ import annotations

import os
import socket
import subprocess
from dataclasses import dataclass, field
from typing import Dict, List, Optional

MODES = ("auto", "autonome", "reseau")

# Sentinelle : distingue « détecte l'adresse toi-même » (_AUTO) de « il n'y a
# AUCUNE adresse » (None). Sans elle, impossible de tester le cas « la tablette
# ne pourra pas se connecter » — qui est justement le cas à ne pas rater.
_AUTO = object()

DEFAULT_HOTSPOT_SSID = "ClayScore"
DEFAULT_PORT = 8000
DEFAULT_HOSTNAME = "clayscore"          # → http://clayscore.local:8000 (mDNS)
DEFAULT_CAMERA_SUBNET = "192.168.10.0/24"


@dataclass
class NetworkConfig:
    """Ce que l'utilisateur demande (lu depuis config.yaml)."""

    mode: str = "auto"
    hotspot_ssid: str = DEFAULT_HOTSPOT_SSID
    hotspot_password: str = ""            # vide = ouvert (déconseillé)
    hostname: str = DEFAULT_HOSTNAME
    port: int = DEFAULT_PORT
    uplink_iface: str = "wlan0"           # patte vers le réseau du club
    camera_iface: str = "eth0"            # patte vers le switch PoE / caméras
    camera_subnet: str = DEFAULT_CAMERA_SUBNET
    # Sécurité : code d'accès exigé pour TOUTE écriture (nouvelle partie,
    # verdict, etc.). Voir `require_pin()` : sur un réseau partagé, il est
    # exigé par défaut (fail-closed).
    access_pin: str = ""
    require_pin_on_shared: bool = True

    def __post_init__(self) -> None:
        if self.mode not in MODES:
            raise ValueError(
                f"Mode réseau inconnu : {self.mode!r}. Attendu : {', '.join(MODES)}.")
        self.port = int(self.port)
        if not (1 <= self.port <= 65535):
            raise ValueError("Port réseau invalide.")

    @classmethod
    def from_dict(cls, data: Optional[Dict]) -> "NetworkConfig":
        data = dict(data or {})
        known = {f for f in cls.__dataclass_fields__}          # noqa: E501
        unknown = set(data) - known
        if unknown:
            raise ValueError(
                "Clés réseau inconnues dans la configuration : "
                + ", ".join(sorted(unknown)))
        return cls(**data)


@dataclass
class NetworkStatus:
    """Ce qui EST (mesuré sur la machine), pas ce qui est souhaité."""

    mode: str                       # mode effectif : autonome | reseau
    requested_mode: str
    connected: bool                 # une adresse utilisable existe
    ip: Optional[str]
    iface: Optional[str]
    hostname: str
    port: int
    urls: List[str] = field(default_factory=list)
    cameras_isolated: bool = False
    pin_required: bool = False
    detail: str = ""

    def to_dict(self) -> Dict:
        return {
            "mode": self.mode,
            "requested_mode": self.requested_mode,
            "connected": self.connected,
            "ip": self.ip,
            "iface": self.iface,
            "hostname": self.hostname,
            "port": self.port,
            "urls": list(self.urls),
            "cameras_isolated": self.cameras_isolated,
            "pin_required": self.pin_required,
            "detail": self.detail,
        }


# --- observation du système ------------------------------------------------ #
def _run(cmd: List[str], timeout: float = 3.0) -> str:
    """Exécute une commande de lecture seule. Retourne "" si indisponible."""
    try:
        out = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        return out.stdout if out.returncode == 0 else ""
    except (OSError, subprocess.SubprocessError):
        return ""


def has_uplink(probe: Optional[callable] = None) -> bool:
    """Un réseau existant est-il joignable (passerelle par défaut présente) ?

    Aucune requête Internet n'est faite : on regarde la table de routage. Un
    club sans Internet mais avec un réseau local reste donc bien détecté.
    """
    if probe is not None:                       # injection pour les tests
        return bool(probe())
    routes = _run(["ip", "route"])
    return "default via" in routes


def local_ip(iface: Optional[str] = None) -> Optional[str]:
    """Adresse IP locale utilisable, sans dépendance externe."""
    if iface:
        out = _run(["ip", "-4", "-o", "addr", "show", "dev", iface])
        for part in out.split():
            if "/" in part and part.count(".") == 3:
                return part.split("/")[0]
    # Repli : on demande au noyau par quelle adresse il sortirait. Aucun
    # paquet n'est réellement émis (socket UDP non connecté au réseau).
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.settimeout(0.2)
        s.connect(("192.0.2.1", 9))             # TEST-NET-1 (RFC 5737)
        return s.getsockname()[0]
    except OSError:
        return None
    finally:
        s.close()


def cameras_isolated(cfg: NetworkConfig, addrs: Optional[str] = None) -> bool:
    """Les caméras sont-elles bien sur leur propre patte réseau ?

    Vrai si l'interface caméra existe et porte une adresse du sous-réseau
    caméra. Sert de contrôle d'installation (règle : jamais les caméras sur le
    réseau du club).
    """
    prefix = cfg.camera_subnet.split("/")[0].rsplit(".", 1)[0] + "."
    out = addrs if addrs is not None else _run(
        ["ip", "-4", "-o", "addr", "show", "dev", cfg.camera_iface])
    return prefix in out


def resolve_mode(cfg: NetworkConfig, uplink: Optional[bool] = None) -> str:
    """Mode effectif : ce qui va réellement s'appliquer."""
    if cfg.mode in ("autonome", "reseau"):
        return cfg.mode
    up = has_uplink() if uplink is None else bool(uplink)
    return "reseau" if up else "autonome"


def require_pin(cfg: NetworkConfig, effective_mode: str) -> bool:
    """Faut-il un code d'accès pour écrire (nouvelle partie, verdict…) ?

    Règle simple et prévisible : **dès qu'un code est défini, il est exigé**,
    quel que soit le mode. Pas d'exception silencieuse — un arbitre ne doit
    jamais découvrir en concours que la protection ne s'appliquait pas.

    Si aucun code n'est défini, rien ne peut être exigé. Sur un réseau partagé
    c'est un risque réel (n'importe qui peut changer les scores) : il est
    signalé par `check_install`, plutôt que de bloquer un club en pleine
    compétition à cause d'un réglage oublié.
    """
    del effective_mode      # même règle dans tous les modes, volontairement
    return bool(cfg.access_pin)


def status(cfg: NetworkConfig, uplink: Optional[bool] = None,
           ip=_AUTO) -> NetworkStatus:
    """État réseau complet, prêt à afficher sur la tablette.

    `ip` : laisser vide pour détecter l'adresse réelle ; passer explicitement
    ``None`` pour le cas « aucune adresse » (hub injoignable).
    """
    mode = resolve_mode(cfg, uplink)
    addr = local_ip(cfg.uplink_iface if mode == "reseau" else None) \
        if ip is _AUTO else ip
    urls: List[str] = []
    if addr:
        urls.append(f"http://{addr}:{cfg.port}")
    if cfg.hostname:
        urls.append(f"http://{cfg.hostname}.local:{cfg.port}")
    if mode == "autonome":
        detail = (f"Le hub crée son propre WiFi « {cfg.hotspot_ssid} ». "
                  "Connecte la tablette à ce réseau, puis ouvre l'adresse.")
    else:
        detail = ("Le hub est branché sur le réseau existant. Reste sur le "
                  "WiFi du club et ouvre l'adresse.")
    return NetworkStatus(
        mode=mode,
        requested_mode=cfg.mode,
        connected=bool(addr),
        ip=addr,
        iface=cfg.uplink_iface if mode == "reseau" else "hotspot",
        hostname=cfg.hostname,
        port=cfg.port,
        urls=urls,
        cameras_isolated=cameras_isolated(cfg),
        pin_required=require_pin(cfg, mode),
        detail=detail,
    )


# --- contrôle d'installation ---------------------------------------------- #
def check_install(cfg: NetworkConfig, st: Optional[NetworkStatus] = None) -> List[Dict]:
    """Liste les problèmes réseau, en français simple, avec la solution.

    Sert au démarrage et à la vue « Réseau » de la tablette : Kevin voit
    immédiatement ce qui cloche, sans lire un log.
    """
    st = st or status(cfg)
    problems: List[Dict] = []
    if not st.connected:
        problems.append({
            "niveau": "bloquant",
            "quoi": "Aucune adresse réseau : la tablette ne pourra pas se connecter.",
            "solution": "Vérifie le câble/WiFi, ou force le mode autonome "
                        "(network.mode: autonome) pour créer le WiFi du hub.",
        })
    if not st.cameras_isolated:
        problems.append({
            "niveau": "important",
            "quoi": f"Les caméras ne sont pas sur leur propre réseau "
                    f"({cfg.camera_iface} / {cfg.camera_subnet}).",
            "solution": "Branche le switch PoE sur la 2e prise réseau du hub. "
                        "Sinon le trafic vidéo passe sur le réseau du club.",
        })
    if st.mode == "reseau" and not cfg.access_pin:
        problems.append({
            "niveau": "important",
            "quoi": "Réseau partagé SANS code d'accès : n'importe qui sur le "
                    "réseau du club peut modifier les scores.",
            "solution": "Renseigne network.access_pin dans config.yaml "
                        "(obligatoire en concours).",
        })
    if st.mode == "autonome" and not cfg.hotspot_password:
        problems.append({
            "niveau": "conseil",
            "quoi": "Le WiFi du hub est ouvert (sans mot de passe).",
            "solution": "Renseigne network.hotspot_password (8 caractères min).",
        })
    return problems


# --- génération de la commande d'application ------------------------------ #
def apply_command(cfg: NetworkConfig, effective_mode: Optional[str] = None) -> List[str]:
    """Commande à lancer pour appliquer le mode (exécutée par l'installateur).

    Renvoyée plutôt qu'exécutée : aucun import de ce module ne doit pouvoir
    reconfigurer une machine (les tests l'appellent en boucle).
    """
    mode = effective_mode or resolve_mode(cfg)
    script = os.path.join(os.path.dirname(os.path.dirname(
        os.path.abspath(__file__))), "deploy", "network.sh")
    cmd = [script, "--mode", mode,
           "--uplink", cfg.uplink_iface,
           "--camera-iface", cfg.camera_iface,
           "--camera-subnet", cfg.camera_subnet,
           "--hostname", cfg.hostname]
    if mode == "autonome":
        cmd += ["--ssid", cfg.hotspot_ssid]
        if cfg.hotspot_password:
            cmd += ["--password", cfg.hotspot_password]
    return cmd
