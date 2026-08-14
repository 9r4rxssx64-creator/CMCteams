

# --- rôle « diffusion » : montrer, pas juger ----------------------------- #
def test_le_role_diffusion_existe_et_est_distingue_de_l_arbitrage():
    from clayscore.pods import ROLES, ROLES_ARBITRAGE, Pod
    assert "diffusion" in ROLES
    assert "diffusion" not in ROLES_ARBITRAGE
    p = Pod("DIF-1", role="diffusion", flux="compresse")
    assert p.diffusion is True
    assert Pod("A", role="stereo_a").diffusion is False


def test_une_camera_de_diffusion_en_video_brute_est_signalee():
    from clayscore.pods import Pod, check_link
    p = Pod("DIF-1", role="diffusion", flux="brut", liaison="ethernet")
    avis = [x for x in check_link(p) if "diffusion" in x["quoi"]]
    assert len(avis) == 1
    assert "compresse" in avis[0]["solution"]


def test_une_camera_de_diffusion_compressee_ne_declenche_aucune_alerte():
    from clayscore.pods import Pod, check_link
    p = Pod("DIF-1", role="diffusion", flux="compresse", liaison="ethernet")
    assert check_link(p) == []


def test_la_diffusion_ne_compte_pas_comme_paire_stereo():
    from clayscore.pods import Pod, PodFleet
    f = PodFleet([Pod("D1", role="diffusion", flux="compresse"),
                  Pod("D2", role="diffusion", flux="compresse")])
    assert f.stereo_ok() is False
