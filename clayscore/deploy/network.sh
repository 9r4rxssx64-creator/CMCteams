#!/usr/bin/env bash
# ClayScore — applique le mode réseau du hub.
#
#   autonome : le hub crée son propre WiFi (hotspot). Aucune infrastructure.
#   reseau   : le hub rejoint le réseau existant du club (Ethernet ou WiFi).
#
# Dans les DEUX cas, les caméras restent sur LEUR réseau à elles (switch PoE),
# jamais sur le réseau du club : trafic vidéo isolé, et une panne du réseau du
# club n'arrête pas l'analyse des plateaux.
#
# Usage :
#   sudo ./network.sh --mode autonome --ssid ClayScore --password monmotdepasse
#   sudo ./network.sh --mode reseau
#   ./network.sh --mode reseau --dry-run     # montre sans rien changer
#
# Idempotent : relancer la même commande ne casse rien.
set -euo pipefail

MODE=""
SSID="ClayScore"
PASSWORD=""
UPLINK="wlan0"
CAM_IFACE="eth0"
CAM_SUBNET="192.168.10.0/24"
HOSTNAME_="clayscore"
DRY=0

usage() { sed -n '2,20p' "$0"; exit "${1:-0}"; }

while [ $# -gt 0 ]; do
  case "$1" in
    --mode)          MODE="${2:-}"; shift 2 ;;
    --ssid)          SSID="${2:-}"; shift 2 ;;
    --password)      PASSWORD="${2:-}"; shift 2 ;;
    --uplink)        UPLINK="${2:-}"; shift 2 ;;
    --camera-iface)  CAM_IFACE="${2:-}"; shift 2 ;;
    --camera-subnet) CAM_SUBNET="${2:-}"; shift 2 ;;
    --hostname)      HOSTNAME_="${2:-}"; shift 2 ;;
    --dry-run)       DRY=1; shift ;;
    -h|--help)       usage 0 ;;
    *) echo "Option inconnue : $1" >&2; usage 2 ;;
  esac
done

case "$MODE" in
  autonome|reseau) ;;
  *) echo "ERREUR : --mode doit être 'autonome' ou 'reseau'." >&2; exit 2 ;;
esac

run() {
  if [ "$DRY" -eq 1 ]; then
    echo "  [dry-run] $*"
  else
    "$@"
  fi
}

echo "==> ClayScore réseau : mode $MODE"
echo "    uplink (club)   : $UPLINK"
echo "    caméras         : $CAM_IFACE sur $CAM_SUBNET (isolé)"
[ "$DRY" -eq 1 ] && echo "    (simulation — aucune modification)"

# --------------------------------------------------------------------------
# 1. Réseau CAMÉRAS — identique dans les deux modes.
#    Adresse fixe : les caméras GigE ne doivent pas dépendre d'un DHCP.
# --------------------------------------------------------------------------
CAM_IP="$(echo "$CAM_SUBNET" | cut -d/ -f1 | awk -F. '{print $1"."$2"."$3".1"}')"
CAM_CIDR="$(echo "$CAM_SUBNET" | cut -d/ -f2)"
echo "==> Réseau caméras : $CAM_IP/$CAM_CIDR sur $CAM_IFACE"
if ip link show "$CAM_IFACE" >/dev/null 2>&1; then
  run ip addr replace "$CAM_IP/$CAM_CIDR" dev "$CAM_IFACE"
  run ip link set "$CAM_IFACE" up
  # Trames jumbo : indispensable au débit GigE Vision (à confirmer selon le switch).
  run ip link set "$CAM_IFACE" mtu 9000 || true
else
  echo "    ATTENTION : interface $CAM_IFACE absente — caméras non configurées." >&2
fi

# --------------------------------------------------------------------------
# 2. Nom réseau (mDNS) : http://clayscore.local:8000 dans les deux modes,
#    pour ne JAMAIS avoir à taper une adresse IP sur la tablette.
# --------------------------------------------------------------------------
echo "==> Nom réseau : $HOSTNAME_.local"
if command -v hostnamectl >/dev/null 2>&1; then
  run hostnamectl set-hostname "$HOSTNAME_" || true
fi
if command -v apt-get >/dev/null 2>&1 && ! command -v avahi-daemon >/dev/null 2>&1; then
  echo "    (installation d'avahi-daemon pour le nom .local)"
  run apt-get install -y avahi-daemon || true
fi
run systemctl enable --now avahi-daemon || true

# --------------------------------------------------------------------------
# 3. Le mode lui-même
# --------------------------------------------------------------------------
if [ "$MODE" = "autonome" ]; then
  echo "==> Hotspot « $SSID » sur $UPLINK"
  if [ -z "$PASSWORD" ]; then
    echo "    ATTENTION : WiFi SANS mot de passe (déconseillé en concours)." >&2
  elif [ "${#PASSWORD}" -lt 8 ]; then
    echo "ERREUR : le mot de passe WiFi doit faire 8 caractères minimum." >&2
    exit 2
  fi
  run systemctl stop wpa_supplicant || true
  HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  if [ "$DRY" -eq 1 ]; then
    echo "  [dry-run] IFACE=$UPLINK SSID=$SSID $HERE/setup_hotspot.sh"
  else
    IFACE="$UPLINK" SSID="$SSID" PASSPHRASE="$PASSWORD" "$HERE/setup_hotspot.sh"
  fi
  echo "==> Prêt. Sur la tablette : WiFi « $SSID » puis http://$HOSTNAME_.local:8000"
else
  echo "==> Rejoint le réseau existant via $UPLINK (DHCP)"
  run systemctl stop hostapd || true
  run systemctl disable hostapd || true
  run systemctl stop dnsmasq || true
  run systemctl disable dnsmasq || true
  if command -v dhclient >/dev/null 2>&1; then
    run dhclient -v "$UPLINK" || true
  elif command -v networkctl >/dev/null 2>&1; then
    run networkctl reconfigure "$UPLINK" || true
  fi
  echo "==> Prêt. Reste sur le WiFi du club : http://$HOSTNAME_.local:8000"
fi

# --------------------------------------------------------------------------
# 4. Contrôle final : jamais les caméras sur le réseau du club
# --------------------------------------------------------------------------
if [ "$DRY" -eq 0 ] && ip link show "$CAM_IFACE" >/dev/null 2>&1; then
  if ip -4 -o addr show dev "$CAM_IFACE" | grep -q "${CAM_IP%.*}."; then
    echo "==> ✅ Caméras bien isolées sur $CAM_IFACE"
  else
    echo "==> ⚠️  Caméras NON isolées : vérifie le branchement du switch PoE." >&2
  fi
fi

echo "==> Terminé. Vérification depuis la tablette : page « Réseau » de l'appli."
