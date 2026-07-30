#!/usr/bin/env bash
# Installation one-shot de ClayScore.
#
# Objectif : Kevin lance UN script, tout s'installe. Fonctionne en mode
# simulation partout (Linux x86, Mac, Jetson) SANS matériel. Les composants
# matériel (caméras GigE, micro, hotspot WiFi) sont installés uniquement avec
# l'option --hardware sur le hub Jetson.
#
# Usage :
#   ./install.sh                 # simulation (dépendances Python de base)
#   ./install.sh --dev           # + outils de test (pytest)
#   ./install.sh --hardware      # + Aravis, sounddevice, hostapd (Jetson/Linux)
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$HERE"

WITH_DEV=0
WITH_HW=0
for arg in "$@"; do
  case "$arg" in
    --dev) WITH_DEV=1 ;;
    --hardware) WITH_HW=1 ;;
    *) echo "Option inconnue : $arg" >&2; exit 2 ;;
  esac
done

echo "==> ClayScore : installation (répertoire : $HERE)"

# 1. Python + venv
PY="${PYTHON:-python3}"
if ! command -v "$PY" >/dev/null 2>&1; then
  echo "ERREUR : python3 introuvable. Installez Python 3.10+." >&2
  exit 1
fi

if [ ! -d ".venv" ]; then
  echo "==> Création de l'environnement virtuel .venv"
  "$PY" -m venv .venv
fi
# shellcheck disable=SC1091
source .venv/bin/activate
python -m pip install --upgrade pip >/dev/null

# 2. Dépendances runtime (simulation)
echo "==> Installation des dépendances Python (runtime)"
pip install -r requirements.txt

# 3. Outils de dev (option)
if [ "$WITH_DEV" -eq 1 ]; then
  echo "==> Installation des outils de développement"
  pip install pytest pytest-cov
fi

# 4. Génération des données de simulation de référence
echo "==> Génération des 3 clips de référence (data/samples/)"
python -m tools.synth --make-reference-set --outdir data/samples

# 5. Matériel (option, Jetson/Linux uniquement)
if [ "$WITH_HW" -eq 1 ]; then
  echo "==> Installation des composants matériel (nécessite sudo)"
  if command -v apt-get >/dev/null 2>&1; then
    sudo apt-get update
    # Caméras GigE Vision via Aravis
    sudo apt-get install -y aravis-tools libaravis-0.8-dev gir1.2-aravis-0.8 \
      libgirepository1.0-dev || true
    # Micro USB
    sudo apt-get install -y libportaudio2 || true
    # Hotspot WiFi local (réseau autonome, sans Internet)
    sudo apt-get install -y hostapd dnsmasq || true
    pip install pygobject sounddevice || true
  else
    echo "ATTENTION : apt-get introuvable — installez Aravis/PortAudio manuellement." >&2
  fi
  echo "==> Composants matériel installés. Configurez source.video.type: aravis"
fi

echo ""
echo "==> Installation terminée."
echo "    Tests   : source .venv/bin/activate && pytest"
echo "    Démo    : python -m tools.synth --scenario casse --background ciel --out /tmp/demo"
echo "    Config  : config/config.yaml (source.video.type: file|webcam|aravis)"
