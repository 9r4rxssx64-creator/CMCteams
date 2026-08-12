"""L'extraction de prix : elle doit être fiable, ou dire qu'elle a échoué.

Ces tests tournent SANS réseau (le réseau, c'est le rôle du runner CI) : ils
vérifient la partie qui décide — le décodage d'une page marchande.
"""
import pytest

from tools.verif_prix import (
    OFFRES, extraire_prix, prix_depuis_jsonld, prix_depuis_texte,
    rendre_markdown, verifier)

JSONLD = '''<html><head>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Product","name":"Cam",
 "offers":{"@type":"Offer","price":"139.90","priceCurrency":"EUR"}}
</script></head><body>affiché ailleurs : 999 €</body></html>'''

META = ('<html><head><meta property="product:price:amount" content="307.14">'
        '</head><body>rien</body></html>')

TEXTE = '<html><body><span class="prix">1 234,56 €</span></body></html>'


# --- JSON-LD : la source la plus fiable ---------------------------------- #
def test_le_jsonld_est_prefere_au_texte_de_la_page():
    # La page affiche « 999 € » ailleurs : on ne doit PAS le prendre.
    prix, methode = extraire_prix(JSONLD)
    assert prix == 139.90 and methode == "json-ld"


def test_jsonld_imbrique_et_liste():
    html = ('<script type="application/ld+json">'
            '[{"@type":"Product","offers":[{"price":49.0},{"price":64.95}]}]'
            '</script>')
    # Plusieurs offres : on retient la MOINS chère.
    assert prix_depuis_jsonld(html) == 49.0


def test_jsonld_casse_ne_fait_pas_planter():
    assert prix_depuis_jsonld('<script type="application/ld+json">{oops</script>') is None


def test_jsonld_sans_prix_renvoie_none():
    html = '<script type="application/ld+json">{"@type":"Article"}</script>'
    assert prix_depuis_jsonld(html) is None


# --- repli meta ----------------------------------------------------------- #
def test_meta_prise_quand_il_n_y_a_pas_de_jsonld():
    prix, methode = extraire_prix(META)
    assert prix == 307.14 and methode == "meta"


# --- dernier recours : le texte ------------------------------------------- #
def test_texte_avec_espace_insecable_et_virgule():
    assert prix_depuis_texte(TEXTE) == 1234.56


@pytest.mark.parametrize("html", [
    "<body>aucun prix ici</body>",
    "<body>0 €</body>",              # 0 n'est pas un prix
    "<body>999999999 €</body>",      # un long nombre ne doit PAS être découpé
    "<body>12345 €</body>",          # ni un nombre sans séparateur de milliers
])
def test_le_texte_refuse_de_deviner(html):
    assert prix_depuis_texte(html) is None


def test_page_sans_prix_est_un_echec_pas_un_zero():
    prix, methode = extraire_prix("<html><body>page vide</body></html>")
    assert prix is None and methode == "aucune"


# --- comparaison au dossier ---------------------------------------------- #
def _offre(poste="camera", devise="EUR", facteur=1.0):
    from tools.verif_prix import Offre
    return Offre(poste, "test", "https://exemple.invalid", devise, facteur)


def test_ecart_calcule_et_alerte_au_dela_du_seuil(monkeypatch):
    monkeypatch.setattr("tools.verif_prix.telecharger",
                        lambda url, timeout=25: (JSONLD, "ok"))
    lignes = verifier([_offre()], {"camera": 139.0}, tolerance_pct=12.0, taux=0.866)
    assert lignes[0]["prix"] == 139.90
    assert lignes[0]["ecart_pct"] == pytest.approx(0.6, abs=0.1)
    assert lignes[0]["alerte"] is False

    lignes = verifier([_offre()], {"camera": 100.0}, tolerance_pct=12.0, taux=0.866)
    assert lignes[0]["alerte"] is True        # +39,9 % : il faut corriger


def test_conversion_usd_et_facteur_paire(monkeypatch):
    monkeypatch.setattr("tools.verif_prix.telecharger",
                        lambda url, timeout=25: (JSONLD, "ok"))
    # 139,90 USD x 0,866 = 121,15 €
    ligne = verifier([_offre(devise="USD")], {}, 12.0, 0.866)[0]
    assert ligne["prix"] == pytest.approx(121.15, abs=0.01)
    # Une page qui vend l'unité, alors qu'on budgète la PAIRE.
    ligne = verifier([_offre(facteur=2.0)], {}, 12.0, 0.866)[0]
    assert ligne["prix"] == pytest.approx(279.80, abs=0.01)


def test_une_page_bloquee_est_signalee_pas_inventee(monkeypatch):
    monkeypatch.setattr("tools.verif_prix.telecharger",
                        lambda url, timeout=25: (None, "HTTP 403"))
    ligne = verifier([_offre()], {"camera": 139.0}, 12.0, 0.866)[0]
    assert ligne["prix"] is None
    assert ligne["detail"] == "HTTP 403"
    assert ligne["ecart_pct"] is None


def test_le_rapport_dit_ce_qui_n_a_pas_pu_etre_lu(monkeypatch):
    monkeypatch.setattr("tools.verif_prix.telecharger",
                        lambda url, timeout=25: (None, "HTTP 403"))
    lignes = verifier([_offre()], {"camera": 139.0}, 12.0, 0.866)
    md = rendre_markdown(lignes, {"camera": 139.0}, 0.866, "test", 12.0)
    assert "403" in md
    assert "0/1 pages lues" in md
    assert "n'est PAS une erreur du dossier" in md


# --- cohérence avec le dossier ------------------------------------------- #
def test_chaque_offre_surveille_un_poste_qui_existe():
    from clayscore.site import PRIX
    for o in OFFRES:
        assert o.poste in PRIX, f"{o.nom} surveille un poste inconnu : {o.poste}"
        assert o.url.startswith("https://")
        assert o.devise in ("EUR", "USD")


def test_les_postes_a_prix_releve_sont_tous_surveilles():
    # Si un prix est annoncé « relevé », une page doit permettre de le revérifier.
    from clayscore.site import PRIX, prix_releve
    surveilles = {o.poste for o in OFFRES}
    releves = {p for p in PRIX if prix_releve(p)}
    # « objectif » et « camera_diffusion » se commandent sur une page de
    # recherche (lot d'optiques, gamme de caméras) : aucune fiche unique.
    manquants = releves - surveilles - {"objectif", "camera_diffusion"}
    assert not manquants, f"prix relevé sans page de contrôle : {manquants}"


# --- contrôle des liens --------------------------------------------------- #
def test_les_offres_a_controler_viennent_du_catalogue():
    from tools.verif_prix import offres_du_catalogue
    offres = offres_du_catalogue()
    assert offres, "aucune fiche produit à contrôler"
    # Uniquement des fiches (une page de recherche n'a pas de prix unique).
    from clayscore.fournisseurs import CATALOGUE
    fiches = {f.url for f in CATALOGUE if f.lien == "fiche" and f.prix}
    assert {o.url for o in offres} == fiches


def test_le_facteur_reconstruit_la_paire_depuis_le_prix_unitaire():
    from tools.verif_prix import offres_du_catalogue
    pont = next(o for o in offres_du_catalogue()
                if o.poste == "pont_directionnel" and "Getic" in o.nom)
    assert pont.facteur == 2.0        # 1 / 0.5 : deux antennes par pont


def test_un_lien_mort_est_signale(monkeypatch):
    from tools.verif_prix import rendre_liens, tester_liens
    monkeypatch.setattr("tools.verif_prix.telecharger",
                        lambda url, timeout=20: (None, "HTTP 404"))
    res = tester_liens([("Vendeur X", "https://exemple.invalid/fiche")])
    assert res[0]["vivant"] is False
    md = rendre_liens(res)
    assert "🔴" in md and "404" in md
    assert "0/1 liens répondent" in md


def test_un_403_est_explique_et_non_pris_pour_un_lien_casse(monkeypatch):
    from tools.verif_prix import rendre_liens, tester_liens
    monkeypatch.setattr("tools.verif_prix.telecharger",
                        lambda url, timeout=20: (None, "HTTP 403"))
    md = rendre_liens(tester_liens([("eBay", "https://ebay.de/itm/1")]))
    assert "refuse les robots" in md
    assert "pas** que le lien est mort" in md


# --------------------------------------------------------- schémas d'URL ----
# Trouvé par bandit (B310/CWE-22) : `urlopen` sait ouvrir `file://`. Une URL de
# fournisseur mal saisie lirait alors un fichier de la machine et son contenu
# remonterait dans le rapport de prix. Ces tests verrouillent le filtre.

def test_une_url_file_est_refusee_sans_lire_le_disque(tmp_path):
    """`file://` doit être refusé — et surtout, rien ne doit être lu."""
    from tools.verif_prix import telecharger
    secret = tmp_path / "secret.txt"
    secret.write_text("MOT DE PASSE = 200807", encoding="utf-8")

    html, detail = telecharger(f"file://{secret}")

    assert html is None, "un fichier local ne doit JAMAIS être téléchargé"
    assert "schéma refusé" in detail
    assert "200807" not in (detail or ""), "le contenu du fichier a fuité"


def test_les_autres_schemas_dangereux_sont_refuses():
    from tools.verif_prix import telecharger
    for url in ("ftp://exemple.invalid/x", "data:text/html,<b>x</b>",
                "gopher://exemple.invalid", "exemple.invalid/sans-schema"):
        html, detail = telecharger(url)
        assert html is None, f"{url} aurait dû être refusé"
        assert "schéma refusé" in detail


def test_https_reste_accepte(monkeypatch):
    """Le filtre ne doit pas casser le cas normal."""
    import tools.verif_prix as vp

    class _Faux:
        def read(self):
            return b"<html>ok</html>"
        def __enter__(self):
            return self
        def __exit__(self, *exc):
            return False

    monkeypatch.setattr(vp.urllib.request, "urlopen",
                        lambda req, timeout=0: _Faux())
    html, detail = vp.telecharger("https://exemple.invalid/fiche")
    assert html == "<html>ok</html>" and detail == "ok"
