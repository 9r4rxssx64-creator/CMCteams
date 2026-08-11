"""Tests exhaustifs du jalon 4 : machine à états de la partie."""
from __future__ import annotations

import pytest

from clayscore.game import Partie, get_discipline, list_disciplines
from clayscore.game.disciplines import Discipline


# --- validation des entrées --------------------------------------------- #
def test_invalid_shooters_count():
    with pytest.raises(ValueError):
        Partie("fosse_universelle", [])
    with pytest.raises(ValueError):
        Partie("fosse_universelle", [f"T{i}" for i in range(7)])


def test_invalid_serie():
    with pytest.raises(ValueError):
        Partie("fosse_universelle", ["A"], serie=0)


def test_unknown_discipline():
    with pytest.raises(ValueError):
        get_discipline("petanque")


def test_bad_verdict_and_cartridge():
    p = Partie("fosse_universelle", ["A"], serie=5)
    with pytest.raises(ValueError):
        p.submit_verdict("explosé")
    with pytest.raises(ValueError):
        p.submit_verdict("casse", cartridge=3)


# --- rotation stricte ---------------------------------------------------- #
def test_rotation_never_advances_without_verdict():
    p = Partie("fosse_universelle", ["A", "B"], serie=5)
    assert p.current_shooter == "A"
    assert p.current_post == 1
    # Tant qu'aucun verdict n'est soumis, on reste sur A.
    assert p.current_shooter == "A"
    p.submit_verdict("casse")           # tour simple validé
    assert p.current_shooter == "B"     # a avancé APRÈS le verdict


def test_round_robin_order():
    p = Partie("fosse_universelle", ["A", "B", "C"], serie=2)
    seen = []
    for _ in range(6):  # 3 tireurs x 2 plateaux
        seen.append(p.current_shooter)
        p.submit_verdict("casse")
    assert seen == ["A", "B", "C", "A", "B", "C"]
    assert p.finished


def test_post_rotation():
    p = Partie("fosse_universelle", ["A"], serie=7)  # 5 postes
    posts = []
    for _ in range(7):
        posts.append(p.current_post)
        p.submit_verdict("manque")
    assert posts == [1, 2, 3, 4, 5, 1, 2]


# --- NO BIRD : gel + rejeu ---------------------------------------------- #
def test_nobird_freezes_same_shooter_and_post():
    p = Partie("fosse_universelle", ["A", "B"], serie=5)
    assert (p.current_shooter, p.current_post) == ("A", 1)
    out = p.submit_verdict("nobird")
    assert out.kind == "nobird"
    # Gel : même tireur, même poste, plateau non compté.
    assert (p.current_shooter, p.current_post) == ("A", 1)
    assert p.clays_done[0] == 0
    assert p.nobird_count[0] == 1
    # On rejoue et on casse -> avance seulement maintenant.
    p.submit_verdict("casse")
    assert p.current_shooter == "B"
    assert p.clays_done[0] == 1


# --- doublés ------------------------------------------------------------- #
def _double_discipline():
    return Discipline("dbl", "Doublés", n_posts=5, cartridges=2, layout=(2,))


def test_double_needs_two_verdicts():
    p = Partie(_double_discipline(), ["A"], serie=4)
    assert p.current_is_double
    assert p.current_clay_in_turn == 1
    out1 = p.submit_verdict("casse")
    assert out1.kind == "need_more"
    assert p.current_clay_in_turn == 2
    assert p.clays_done[0] == 0            # rien validé tant que le doublé n'est pas fini
    out2 = p.submit_verdict("manque")
    assert out2.kind == "turn_complete"
    assert p.clays_done[0] == 2
    assert len(out2.committed) == 2


def test_nobird_on_double_replays_whole_double():
    p = Partie(_double_discipline(), ["A"], serie=4)
    p.submit_verdict("casse")             # 1er plateau du doublé
    assert p.current_clay_in_turn == 2
    p.submit_verdict("nobird")            # no-bird sur le 2e -> rejoue TOUT le doublé
    assert p.current_clay_in_turn == 1    # retour au 1er plateau
    assert p.clays_done[0] == 0           # le "cassé" provisoire est annulé
    assert p.nobird_count[0] == 1
    # On rejoue le doublé proprement.
    p.submit_verdict("casse")
    out = p.submit_verdict("casse")
    assert p.clays_done[0] == 2
    assert all(r.nobird_replays == 1 for r in out.committed)


def test_double_capped_at_series_boundary():
    # Série impaire avec doublés : le dernier tour est forcé en simple.
    p = Partie(_double_discipline(), ["A"], serie=3)
    p.submit_verdict("casse")
    p.submit_verdict("casse")             # 1er doublé -> 2 plateaux
    assert p.clays_done[0] == 2
    assert p.current_turn_size == 1       # reste 1 -> simple
    p.submit_verdict("casse")
    assert p.finished
    assert p.clays_done[0] == 3


# --- barèmes ------------------------------------------------------------- #
def test_scoring_standard():
    p = Partie("fosse_universelle", ["A"], serie=2)
    p.submit_verdict("casse")
    p.submit_verdict("manque")
    card = p.scorecard()[0]
    assert card["points"] == 1
    assert card["casse"] == 1 and card["manque"] == 1


def test_scoring_dtl():
    p = Partie("dtl", ["A"], serie=3)
    p.submit_verdict("casse", cartridge=1)   # 3 pts
    p.submit_verdict("casse", cartridge=2)   # 2 pts
    p.submit_verdict("manque", cartridge=2)  # 0
    card = p.scorecard()[0]
    assert card["points"] == 5
    assert card["casse"] == 2


# --- fin de partie ------------------------------------------------------- #
def test_series_completion_and_submit_after_finish():
    p = Partie("fosse_universelle", ["A"], serie=3)
    for _ in range(3):
        p.submit_verdict("casse")
    assert p.finished
    with pytest.raises(RuntimeError):
        p.submit_verdict("casse")


# --- fiches, stats, CSV -------------------------------------------------- #
def test_scorecard_pct_and_csv():
    p = Partie("fosse_universelle", ["Alice", "Bob"], serie=4)
    # Alice: casse,casse,manque,casse (3/4) ; Bob: manque x4 (0/4)
    seq_a = ["casse", "casse", "manque", "casse"]
    seq_b = ["manque"] * 4
    for a, b in zip(seq_a, seq_b):
        p.submit_verdict(a)  # Alice
        p.submit_verdict(b)  # Bob
    assert p.finished
    cards = {c["shooter"]: c for c in p.scorecard()}
    assert cards["Alice"]["casse"] == 3 and cards["Alice"]["pct"] == 75.0
    assert cards["Bob"]["casse"] == 0 and cards["Bob"]["pct"] == 0.0
    csv_text = p.to_csv()
    assert "tireur" in csv_text
    assert "Alice" in csv_text and "Bob" in csv_text
    assert len(csv_text.strip().splitlines()) == 3  # entête + 2 tireurs


def test_stats_by_post_and_machine():
    p = Partie("fosse_universelle", ["A"], serie=5)
    for _ in range(5):
        p.submit_verdict("casse", machine="Trap-1")
    posts = p.stats_by_post()
    assert sum(v["clays"] for v in posts.values()) == 5
    machines = p.stats_by_machine()
    assert machines["Trap-1"]["clays"] == 5
    assert machines["Trap-1"]["pct"] == 100.0


# --- toutes disciplines : partie complète jouable ------------------------ #
@pytest.mark.parametrize("disc", [d.key for d in list_disciplines()])
def test_full_game_all_disciplines(disc):
    # Partie complète, 2 tireurs, série 25, avec un no-bird injecté au début.
    p = Partie(disc, ["Kevin", "Laurence"], serie=25)
    injected = False
    guard = 0
    while not p.finished:
        guard += 1
        assert guard < 5000, "boucle de sécurité"
        if not injected:
            p.submit_verdict("nobird")   # 1 no-bird injecté
            injected = True
            continue
        # Motif déterministe cassé/manqué + choix de cartouche pour DTL.
        v = "casse" if (guard % 3) else "manque"
        p.submit_verdict(v, cartridge=1 if (guard % 2) else 2)
    # Chaque tireur a bien tiré exactement 25 plateaux (les no-bird ne comptent pas).
    for c in p.scorecard():
        assert c["clays"] == 25
    # Le no-bird a été rejoué (comptabilisé mais non décompté du total).
    assert sum(c["nobird"] for c in p.scorecard()) == 1


def test_full_fu_two_shooters_exact_scores():
    # Vérité arithmétique : Kevin casse tout, Laurence rate tout, 1 no-bird.
    p = Partie("fosse_universelle", ["Kevin", "Laurence"], serie=25)
    first = True
    while not p.finished:
        if p.current_shooter == "Kevin":
            if first:
                p.submit_verdict("nobird")  # no-bird sur le tout premier plateau
                first = False
            else:
                p.submit_verdict("casse")
        else:
            p.submit_verdict("manque")
    cards = {c["shooter"]: c for c in p.scorecard()}
    assert cards["Kevin"]["casse"] == 25 and cards["Kevin"]["points"] == 25
    assert cards["Kevin"]["nobird"] == 1
    assert cards["Laurence"]["casse"] == 0 and cards["Laurence"]["points"] == 0


# --- multi-lanceurs (dossier v4) ---------------------------------------- #
def test_multi_lanceurs_assignes_automatiquement():
    p = Partie("fosse_universelle", ["A"], serie=6,
               machines=["Trap 1", "Trap 2"])
    assert p.machines == ["Trap 1", "Trap 2"]
    seen = []
    for _ in range(6):
        seen.append(p.current_machine)   # lanceur attribué au poste courant
        p.submit_verdict("casse")
    # 2 lanceurs alternés sur les postes 1..5 puis retour au poste 1.
    assert seen == ["Trap 1", "Trap 2", "Trap 1", "Trap 2", "Trap 1", "Trap 1"]
    # Les statistiques distinguent bien les deux machines.
    stats = p.stats_by_machine()
    assert set(stats) == {"Trap 1", "Trap 2"}
    assert sum(v["clays"] for v in stats.values()) == 6


def test_lanceurs_par_defaut_un_par_poste():
    p = Partie("fosse_universelle", ["A"], serie=2)   # 5 postes
    assert len(p.machines) == 5
    assert p.current_machine == "Lanceur 1"


def test_machine_explicite_prioritaire():
    p = Partie("fosse_universelle", ["A"], serie=2, machines=["Trap 1"])
    p.submit_verdict("casse", machine="Trap secours")
    assert p.results[0].machine == "Trap secours"


def test_lanceurs_vides_refuses():
    with pytest.raises(ValueError):
        Partie("fosse_universelle", ["A"], serie=2, machines=[])


# --- mode concours (dossier v4) ----------------------------------------- #
def test_mode_concours_marque_officiel():
    p = Partie("fosse_universelle", ["A"], serie=2, mode="concours")
    st = p.state()
    assert st["mode"] == "concours" and st["official"] is True


def test_mode_entrainement_par_defaut():
    p = Partie("fosse_universelle", ["A"], serie=2)
    st = p.state()
    assert st["mode"] == "entrainement" and st["official"] is False


def test_mode_inconnu_refuse():
    with pytest.raises(ValueError):
        Partie("fosse_universelle", ["A"], serie=2, mode="apero")


# --- noms italiens (FITAV) : Kevin tire à Vintimille --------------------- #
@pytest.mark.parametrize("italien,attendu", [
    ("fossa_universale", "fosse_universelle"),
    ("fossa_olimpica", "fosse_olympique"),
    ("trap", "fosse_olympique"),
    ("percorso_di_caccia", "parcours"),
    ("percorso_caccia", "parcours"),
    ("compak_sporting", "compak"),
])
def test_nom_italien_donne_la_meme_discipline(italien, attendu):
    assert get_discipline(italien) is get_discipline(attendu)


def test_une_partie_se_joue_avec_le_nom_italien():
    p = Partie("fossa_olimpica", ["Kevin"], serie=3)
    assert p.discipline.key == "fosse_olympique"
    for _ in range(3):
        p.submit_verdict("casse")
    assert p.scorecard()[0]["points"] == 3
    assert p.finished


def test_elica_non_implementee_leve_une_erreur():
    # « Elica » (ZZ) existe en Italie mais n'est PAS implémentée : on refuse
    # au lieu de scorer avec les règles d'une autre discipline.
    with pytest.raises(ValueError):
        get_discipline("elica")
