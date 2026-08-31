#!/usr/bin/env bash
# Configure le hotspot WiFi local autonome du hub ClayScore (jalon 7).
#
# À lancer sur le HUB (Jetson/Linux) avec sudo. Idempotent.
# Réseau isolé sans Internet : IP statique 192.168.50.1, hostapd + dnsmasq.
#
# ⚠️ Nécessite une carte WiFi supportant le mode AP. Adapter IFACE si besoin.
set -euo pipefail

IFACE="${IFACE:-wlan0}"
HUB_IP="192.168.50.1/24"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Nom du réseau et mot de passe : surchargeables sans éditer hostapd.conf
# (utilisé par network.sh, qui les lit depuis config.yaml).
SSID="${SSID:-}"
PASSPHRASE="${PASSPHRASE:-}"
if [ -n "$PASSPHRASE" ] && [ "${#PASSPHRASE}" -lt 8 ]; then
  echo "ERREUR : le mot de passe WiFi doit faire 8 caractères minimum." >&2; exit 2
fi

if [ "$(id -u)" -ne 0 ]; then
  echo "Ce script doit être lancé avec sudo." >&2; exit 1
fi

echo "==> Configuration du hotspot ClayScore sur $IFACE"

# 1. IP statique sur l'interface WiFi.
ip addr flush dev "$IFACE" || true
ip addr add "$HUB_IP" dev "$IFACE" || true
ip link set "$IFACE" up || true

# 2. hostapd + dnsmasq (configs versionnées).
install -m 0644 "$HERE/hostapd.conf" /etc/hostapd/hostapd.conf
sed -i "s/^interface=.*/interface=$IFACE/" /etc/hostapd/hostapd.conf
[ -n "$SSID" ] && sed -i "s/^ssid=.*/ssid=$SSID/" /etc/hostapd/hostapd.conf
[ -n "$PASSPHRASE" ] && \
  sed -i "s/^wpa_passphrase=.*/wpa_passphrase=$PASSPHRASE/" /etc/hostapd/hostapd.conf
echo 'DAEMON_CONF="/etc/hostapd/hostapd.conf"' > /etc/default/hostapd

install -m 0644 "$HERE/dnsmasq.conf" /etc/dnsmasq.d/clayscore.conf
sed -i "s/^interface=.*/interface=$IFACE/" /etc/dnsmasq.d/clayscore.conf

# 3. Active les services.
systemctl unmask hostapd 2>/dev/null || true
systemctl enable --now dnsmasq
systemctl enable --now hostapd

echo "==> Hotspot 'ClayScore' actif. Le hub : http://192.168.50.1:8000"
echo "    (changez le mot de passe WiFi dans deploy/hostapd.conf)"
