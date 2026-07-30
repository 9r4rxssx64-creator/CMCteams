"""Tests du jalon 7 : capture pilotée par la source, reprise d'état, déploiement.

Le chemin RÉEL (segmentation d'un flux continu) est validé en simulation via un
flux vidéo+audio concaténé. Le passage au matériel ne change que la config.
"""
from __future__ import annotations

from pathlib import Path

import pytest

from clayscore.capture import LiveMatchSource, build_live_source
from clayscore.engine import MatchEngine
from clayscore.sources.video_memory import InMemoryVideoSource
from tools import synth

ROOT = Path(__file__).resolve().parents[1]


# --- segmentation d'un flux continu ------------------------------------- #
def test_live_capture_segments_and_scores(tmp_path):
    specs = [("casse", 501), ("manque", 502), ("nobird", 503),
             ("casse", 504), ("manque", 505)]
    frames, audio, sr, truths, _launches = synth.render_sequence(
        specs, background="ciel", gap_s=0.8, width=240, height=180,
        fps=30.0, duration_s=2.0, seed0=500)
    live = LiveMatchSource(InMemoryVideoSource(frames, 30.0), (audio, sr),
                           clips_dir=str(tmp_path))
    got = []
    while True:
        a = live.next_plateau()
        if a is None:
            break
        got.append(a)
    # Tous les plateaux du flux sont retrouvés...
    assert len(got) == len(specs)
    # ...avec les bons verdicts (vérité terrain).
    verdicts = [a.auto_verdict for a in got]
    assert verdicts == truths
    # Chaque plateau a produit un ralenti sur disque.
    for a in got:
        assert (tmp_path / Path(a.clip_url).name).exists()


def test_build_live_source_from_config(tmp_path):
    # Un clip isolé (fichier) -> 1 plateau segmenté, verdict correct.
    p = synth.SynthParams(scenario="casse", background="foret",
                          width=240, height=180, duration_s=2.0, seed=42)
    paths = synth.generate(p, str(tmp_path / "clip"))
    cfg = {"source": {
        "video": {"type": "file", "path": paths["video"]},
        "audio": {"type": "file", "path": paths["audio"]}}}
    live = build_live_source(cfg, clips_dir=str(tmp_path / "clips"))
    a = live.next_plateau()
    assert a is not None
    assert a.auto_verdict == "casse"
    assert live.next_plateau() is None  # un seul plateau


# --- reprise d'état après crash (watchdog) ------------------------------ #
def test_match_state_persistence_and_restore(tmp_path):
    sp = str(tmp_path / "state.json")
    eng = MatchEngine(clips_dir=str(tmp_path / "c1"), state_path=sp)
    eng.new_game("fosse_universelle", ["Kevin", "Laurence"], serie=5)
    # Joue quelques verdicts (dont un no-bird).
    eng.commit("casse")      # Kevin
    eng.commit("manque")     # Laurence
    eng.commit("nobird")     # Kevin (gelé)
    eng.commit("casse")      # Kevin
    st_before = eng.state()

    # Simule un crash : nouveau moteur, même fichier d'état.
    eng2 = MatchEngine(clips_dir=str(tmp_path / "c2"), state_path=sp)
    assert eng2.restore_from_disk() is True
    st_after = eng2.state()
    assert st_after["current_shooter"] == st_before["current_shooter"]
    assert st_after["scorecard"] == st_before["scorecard"]


def test_restore_noop_when_no_state(tmp_path):
    eng = MatchEngine(clips_dir=str(tmp_path / "c"),
                      state_path=str(tmp_path / "absent.json"))
    assert eng.restore_from_disk() is False


def test_restore_skips_finished_game(tmp_path):
    sp = str(tmp_path / "s.json")
    eng = MatchEngine(clips_dir=str(tmp_path / "c"), state_path=sp)
    eng.new_game("fosse_universelle", ["A"], serie=1)
    eng.commit("casse")  # termine la partie
    eng2 = MatchEngine(clips_dir=str(tmp_path / "c2"), state_path=sp)
    # Une partie terminée n'est pas « reprise ».
    assert eng2.restore_from_disk() is False


# --- sources matériel : échec propre sans matériel ---------------------- #
def test_mic_source_raises_cleanly_without_hardware():
    from clayscore.sources.audio_mic import MicAudioSource
    try:
        import sounddevice  # noqa: F401
        pytest.skip("sounddevice installé sur cette machine.")
    except Exception:  # noqa: BLE001
        pass
    with pytest.raises(RuntimeError):
        MicAudioSource().open()


# --- fichiers de déploiement -------------------------------------------- #
def test_deploy_files_present_and_wellformed():
    svc = (ROOT / "deploy" / "clayscore.service").read_text()
    assert "ExecStart=" in svc and "clayscore.server" in svc
    assert "Restart=always" in svc              # watchdog
    hostapd = (ROOT / "deploy" / "hostapd.conf").read_text()
    assert "ssid=ClayScore" in hostapd and "wpa=2" in hostapd
    dnsmasq = (ROOT / "deploy" / "dnsmasq.conf").read_text()
    assert "dhcp-range=" in dnsmasq
    setup = ROOT / "deploy" / "setup_hotspot.sh"
    assert setup.exists() and "hostapd" in setup.read_text()
