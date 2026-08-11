#!/usr/bin/env python3
"""Assemble le dossier ClayScore : docs en HTML lisibles + menu d'accueil + vidéos."""
import base64, pathlib, shutil, subprocess, markdown

FONTS = "/mnt/skills/examples/canvas-design/canvas-fonts"
SRC = pathlib.Path("/home/user/CMCteams/clayscore")
PACK = pathlib.Path("/tmp/pack/ClayScore_Dossier_Complet")
DEMOS_H264 = pathlib.Path("/tmp/pack/demos_h264")

b64 = lambda p: base64.b64encode(pathlib.Path(p).read_bytes()).decode()
DISP = b64(f"{FONTS}/BigShoulders-Bold.ttf")
MONO = b64(f"{FONTS}/GeistMono-Regular.ttf")

CSS = f"""
@font-face{{font-family:'Shoulders';src:url(data:font/ttf;base64,{DISP}) format('truetype');font-weight:700}}
@font-face{{font-family:'ClayMono';src:url(data:font/ttf;base64,{MONO}) format('truetype');font-weight:400}}
:root{{
  --clay:#ff6a2b; --gold:#d9b45a; --casse:#28c281; --manque:#ff5a4d; --nobird:#f7a63b;
  --bg:#f4f6fb; --surface:#fff; --surface-2:#eef1f8; --text:#161d2b; --muted:#5a6678;
  --line:#dbe1ec; --hair:#e7ebf3; --ink:#0d1420;
}}
@media (prefers-color-scheme:dark){{:root{{
  --bg:#0a1019; --surface:#111a28; --surface-2:#0e1524; --text:#e9eefb;
  --muted:#93a2ba; --line:#213048; --hair:#1a2740;
}}}}
:root[data-theme=light]{{--bg:#f4f6fb;--surface:#fff;--surface-2:#eef1f8;--text:#161d2b;
  --muted:#5a6678;--line:#dbe1ec;--hair:#e7ebf3}}
:root[data-theme=dark]{{--bg:#0a1019;--surface:#111a28;--surface-2:#0e1524;--text:#e9eefb;
  --muted:#93a2ba;--line:#213048;--hair:#1a2740}}
*{{box-sizing:border-box}}
body{{margin:0;background:var(--bg);color:var(--text);line-height:1.65;
  font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  -webkit-text-size-adjust:100%}}
.doc{{max-width:820px;margin:0 auto;padding:28px 20px 80px}}
h1,h2,h3{{font-family:'Shoulders',system-ui,sans-serif;line-height:1.02;text-wrap:balance;
  letter-spacing:.01em}}
h1{{font-size:clamp(34px,7vw,52px);margin:12px 0 6px;border-bottom:3px solid var(--clay);
  padding-bottom:12px}}
h2{{font-size:clamp(24px,5vw,34px);margin:38px 0 10px;color:var(--text)}}
h3{{font-size:20px;margin:24px 0 8px}}
p,li{{font-size:16px}}
a{{color:var(--clay)}}
code{{font-family:'ClayMono',ui-monospace,monospace;background:var(--surface-2);
  padding:2px 6px;border-radius:5px;font-size:.9em}}
pre{{background:var(--ink);color:#e9eefb;padding:16px;border-radius:12px;overflow-x:auto}}
pre code{{background:none;color:inherit;padding:0}}
table{{width:100%;border-collapse:collapse;margin:18px 0;font-size:15px;display:block;overflow-x:auto}}
th,td{{padding:10px 12px;border-bottom:1px solid var(--hair);text-align:left;vertical-align:top}}
th{{background:var(--surface-2);font-family:'ClayMono',monospace;font-size:12px;
  letter-spacing:.08em;text-transform:uppercase;color:var(--muted);white-space:nowrap}}
blockquote{{border-left:4px solid var(--gold);background:var(--surface);margin:18px 0;
  padding:12px 18px;border-radius:0 10px 10px 0;color:var(--muted)}}
hr{{border:0;border-top:1px solid var(--line);margin:34px 0}}
.topbar{{background:var(--ink);color:#eef3fb;padding:12px 20px;display:flex;
  justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;position:sticky;top:0;z-index:9}}
.topbar a{{color:#eef3fb;text-decoration:none;font-family:'ClayMono',monospace;font-size:12px;
  letter-spacing:.1em;border:1px solid #22304a;padding:8px 14px;border-radius:8px}}
.topbar .b{{font-family:'Shoulders',sans-serif;font-size:22px;display:flex;align-items:center;gap:9px}}
.topbar .b i{{width:13px;height:13px;border-radius:50%;background:var(--clay);display:block}}
"""

MENU_CSS = CSS + """
.hero{background:var(--ink);color:#eef3fb;padding:44px 20px 40px;text-align:center}
.hero h1{border:0;font-size:clamp(40px,9vw,76px);margin:0;color:#fff}
.hero p{color:#9fb0c9;max-width:52ch;margin:14px auto 0;font-size:17px}
.tag{font-family:'ClayMono',monospace;font-size:12px;letter-spacing:.22em;color:var(--clay)}
.wrap{max-width:960px;margin:0 auto;padding:0 20px 70px}
.sec{margin-top:44px}
.sec h2{margin-bottom:6px}
.sub{color:var(--muted);margin:0 0 18px;font-size:15px}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:14px}
.card{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:18px;
  text-decoration:none;color:inherit;display:block;transition:transform .12s,border-color .12s}
.card:hover{transform:translateY(-2px);border-color:var(--clay)}
.card .k{font-family:'ClayMono',monospace;font-size:11px;letter-spacing:.14em;color:var(--clay);
  text-transform:uppercase}
.card h3{margin:6px 0 4px;font-size:21px}
.card p{margin:0;color:var(--muted);font-size:14px}
.vids{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px}
.vid{background:var(--surface);border:1px solid var(--line);border-radius:14px;overflow:hidden}
.vid video{width:100%;display:block;background:#000}
.vid .cap{padding:12px 14px}
.vid .badge{display:inline-block;padding:3px 10px;border-radius:7px;font-family:'ClayMono',monospace;
  font-size:11px;font-weight:700;color:#0c1420;letter-spacing:.08em}
.bg-c{background:var(--casse)}.bg-m{background:var(--manque)}.bg-n{background:var(--nobird)}
.vid p{margin:8px 0 0;font-size:14px;color:var(--muted)}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-top:8px}
.stat{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:16px;text-align:center}
.stat .n{font-family:'Shoulders',sans-serif;font-size:36px;color:var(--clay);line-height:1}
.stat .l{font-size:12px;color:var(--muted);margin-top:4px}
.note{background:var(--surface);border-left:4px solid var(--gold);border-radius:0 10px 10px 0;
  padding:16px 18px;margin-top:18px;font-size:15px}
.foot{text-align:center;color:var(--muted);font-size:13px;padding:30px 20px 60px;border-top:1px solid var(--line);margin-top:50px}
"""

def html_doc(title, body, depth=0):
    """depth = profondeur du fichier (0 = racine, 1 = sous-dossier)."""
    home = "../" * depth + "index.html"
    nav = f'<a href="{home}">← SOMMAIRE</a>' 
    return f"""<!doctype html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>{title}</title>
<style>{CSS}</style></head><body>
<div class="topbar"><span class="b"><i></i>CLAYSCORE</span>{nav}</div>
<div class="doc">{body}</div></body></html>"""

def convert_md(md_path: pathlib.Path, out_path: pathlib.Path, title: str, depth: int = 0):
    text = md_path.read_text(encoding="utf-8")
    body = markdown.markdown(text, extensions=["tables", "fenced_code", "toc", "nl2br"])
    out_path.write_text(html_doc(title, body, depth), encoding="utf-8")

# ---------------------------------------------------------------- assemblage
def main():
    if PACK.exists():
        shutil.rmtree(PACK)
    for d in ["documents", "pages", "demos", "logiciel", "documents/source_md"]:
        (PACK / d).mkdir(parents=True, exist_ok=True)

    # 1) Docs maîtres : .md (source) + .html (lisible)
    masters = [
        ("00_RECAPITULATIF_TOTAL", "Récapitulatif total"),
        ("01_COMMENT_UTILISER", "Comment utiliser"),
        ("02_ETAT_ET_LIMITES", "État et limites"),
    ]
    for stem, title in masters:
        src = SRC / "docs" / f"{stem}.md"
        shutil.copy(src, PACK / f"{stem}.md")
        convert_md(src, PACK / f"{stem}.html", f"ClayScore — {title}")

    # 2) Documents business : .md + .html
    business = [
        ("SPEC_TECHNIQUE", "Spécification technique (texte original)"),
        ("JOURNAL_PROJET", "Journal du projet"),
        ("GLOSSAIRE", "Glossaire"),
        ("AUDIT_QUALITE", "Audit qualité commerciale"),
        ("GUIDE_RESEAU", "Guide réseau"),
        ("GUIDE_COMPETITION", "Compétition officielle"),
        ("GUIDE_ALIMENTATION", "Guide alimentation"),
        ("GUIDE_GRANDE_SURFACE", "Grandes surfaces, sans fil"),
        ("GUIDE_ITALIE_FITAV", "Tirer en Italie (FITAV)"),
        ("PREVISIONNEL_CLUB", "Prévisionnel d'un club entier"),
        ("MATERIEL_OPTIMAL", "Matériel optimal et tarifs"),
        ("GUIDE_MATERIEL", "Guide du matériel"),
        ("GUIDE_MONTAGE", "Guide de montage et d'installation"),
        ("CHECKLIST_PROTOTYPE", "Checklist du prototype"),
        ("DOSSIER_BUSINESS", "Dossier business (Monaco)"),
        ("BUDGET_BOM", "Budget & liste d'achat"),
        ("DOSSIER_VIDEO", "Plan de la vidéo"),
        ("EMAIL_LAPORTE", "Emails Laporte"),
        ("ORIGINAL_DOSSIER_V4", "Dossier v4 — texte original"),
        ("ORIGINAL_PLAN_VIDEO", "Plan vidéo — texte original"),
    ]
    for stem, title in business:
        src = SRC / "docs" / f"{stem}.md"
        shutil.copy(src, PACK / "documents" / "source_md" / f"{stem}.md")
        convert_md(src, PACK / "documents" / f"{stem}.html", f"ClayScore — {title}", depth=1)

    # 3) Pages commerciales
    for f in ("landing.html", "onepager.html"):
        shutil.copy(SRC / "docs" / f, PACK / "pages" / f)

    # 4) Démos H.264
    for f in sorted(DEMOS_H264.glob("*.mp4")):
        shutil.copy(f, PACK / "demos" / f.name)

    # 5) Logiciel
    subprocess.run(
        f"cd {SRC} && tar cf - --exclude='.venv' --exclude='__pycache__' "
        "--exclude='.pytest_cache' --exclude='*.pyc' --exclude='data/clips' "
        "--exclude='data/out' --exclude='data/labeled' --exclude='data/yolo' "
        "--exclude='*.db' --exclude='match_state.json' --exclude='docs' . | "
        f"(cd {PACK}/logiciel && tar xf -)", shell=True, check=True)

    # 6) Menu d'accueil
    (PACK / "index.html").write_text(MENU, encoding="utf-8")
    # 7) CLAUDE.md (pour Claude Code du cousin)
    (PACK / "CLAUDE.md").write_text(CLAUDE_MD, encoding="utf-8")
    print("dossier assemblé :", PACK)

MENU = """<!doctype html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>ClayScore — Dossier complet</title><style>__CSS__</style></head><body>
<div class="hero">
  <div class="tag">DOSSIER COMPLET · AOÛT 2026</div>
  <h1>CLAYSCORE</h1>
  <p>L'arbitre électronique du ball-trap. Trois caméras, un micro, un boîtier IA :
  chaque plateau est jugé <strong>cassé</strong>, <strong>manqué</strong> ou <strong>no bird</strong>, en direct.</p>
</div>
<div class="wrap">

  <div class="sec">
    <h2>Regarde d'abord</h2>
    <p class="sub">Les 3 verdicts, filmés au ralenti. L'habillage (trajectoire + badge) est produit
    automatiquement par le logiciel — rien n'est monté à la main.</p>
    <div class="vids">
      <div class="vid">
        <video src="demos/casse_ciel_demo.mp4" controls playsinline muted loop preload="metadata"></video>
        <div class="cap"><span class="badge bg-c">✔ CASSÉ</span>
        <p>Le plateau explose après le coup de feu → le point est compté.</p></div>
      </div>
      <div class="vid">
        <video src="demos/manque_foret_demo.mp4" controls playsinline muted loop preload="metadata"></video>
        <div class="cap"><span class="badge bg-m">✗ MANQUÉ</span>
        <p>Le plateau poursuit sa trajectoire, intact → zéro point.</p></div>
      </div>
      <div class="vid">
        <video src="demos/nobird_contrejour_demo.mp4" controls playsinline muted loop preload="metadata"></video>
        <div class="cap"><span class="badge bg-n">↻ NO BIRD</span>
        <p>Parti cassé du lanceur, avant tout tir → on rejoue, même tireur.</p></div>
      </div>
    </div>
  </div>

  <div class="sec">
    <h2>Comprendre le projet</h2>
    <p class="sub">Trois documents, dans l'ordre. Commence par le récapitulatif.</p>
    <div class="cards">
      <a class="card" href="00_RECAPITULATIF_TOTAL.html">
        <div class="k">Commencer ici</div><h3>Récapitulatif total</h3>
        <p>Tout le projet : ce qui existe, ce qui est prouvé, les chiffres, les prochaines étapes.</p></a>
      <a class="card" href="01_COMMENT_UTILISER.html">
        <div class="k">Mode d'emploi</div><h3>Comment l'utiliser</h3>
        <p>Installer, lancer une partie, vérifier les preuves, brancher le matériel.</p></a>
      <a class="card" href="02_ETAT_ET_LIMITES.html">
        <div class="k">Honnêteté</div><h3>État &amp; limites</h3>
        <p>Ce qui est prouvé, ce qui ne l'est pas, et pourquoi.</p></a>
      <a class="card" href="documents/JOURNAL_PROJET.html">
        <div class="k">Historique</div><h3>Journal du projet</h3>
        <p>Tout ce qui a été construit, dans l'ordre — y compris les bugs trouvés et corrigés.</p></a>
      <a class="card" href="documents/GLOSSAIRE.html">
        <div class="k">Vocabulaire</div><h3>Glossaire</h3>
        <p>Tous les mots expliqués : ball-trap, produit, informatique, business.</p></a>
      <a class="card" href="documents/AUDIT_QUALITE.html">
        <div class="k">Qualité</div><h3>Audit qualité</h3>
        <p>Les défauts trouvés et corrigés, avec les mesures avant/après —
        et l'auto-critique de ce que l'audit ne prouve pas.</p></a>
      <a class="card" href="documents/SPEC_TECHNIQUE.html">
        <div class="k">Cahier des charges</div><h3>Spécification technique</h3>
        <p>Le texte d'origine qui a servi à développer le logiciel, et l'état de chaque point.</p></a>
    </div>
  </div>

  <div class="sec">
    <h2>Textes d'origine</h2>
    <p class="sub">Les documents de Kevin, reproduits mot pour mot, sans reformulation —
    pour que rien ne se perde.</p>
    <div class="cards">
      <a class="card" href="documents/ORIGINAL_DOSSIER_V4.html">
        <div class="k">Verbatim</div><h3>Dossier v4</h3>
        <p>Le dossier business d'origine : stratégie, cadre Monaco, liens d'achat.</p></a>
      <a class="card" href="documents/ORIGINAL_PLAN_VIDEO.html">
        <div class="k">Verbatim</div><h3>Plan de la vidéo</h3>
        <p>Le script et le storyboard d'origine, tels qu'écrits.</p></a>
      <a class="card" href="documents/SPEC_TECHNIQUE.html">
        <div class="k">Verbatim</div><h3>Spécification</h3>
        <p>Le cahier des charges du logiciel, tel qu'écrit.</p></a>
    </div>
  </div>

  <div class="sec">
    <h2>Le logiciel en chiffres</h2>
    <p class="sub">Mesurés, pas estimés — reproductibles avec <code>pytest</code>.</p>
    <div class="stats">
      <div class="stat"><div class="n">8/8</div><div class="l">jalons terminés</div></div>
      <div class="stat"><div class="n">117</div><div class="l">tests réussis</div></div>
      <div class="stat"><div class="n">100%</div><div class="l">bons verdicts (225 clips)</div></div>
      <div class="stat"><div class="n">0</div><div class="l">faux positif (coups de feu)</div></div>
      <div class="stat"><div class="n">5</div><div class="l">disciplines gérées</div></div>
      <div class="stat"><div class="n">0 €</div><div class="l">de licence logicielle</div></div>
    </div>
    <div class="note"><strong>À savoir :</strong> ces résultats sont obtenus en <em>simulation</em>
    (vidéos générées dont on connaît la réponse). La validation sur de vraies vidéos de stand
    reste à faire — c'est expliqué franchement dans « État &amp; limites ».</div>
  </div>

  <div class="sec">
    <h2>Construire le prototype</h2>
    <p class="sub">Le matériel à acheter, comment l'assembler, et dans quel ordre s'y prendre.</p>
    <div class="cards">
      <a class="card" href="documents/CHECKLIST_PROTOTYPE.html">
        <div class="k">Commencer ici</div><h3>Checklist du prototype</h3>
        <p>De « je n'ai rien » à la première démonstration, phase par phase, à cocher.
        La phase 0 est gratuite — et c'est la plus importante.</p></a>
      <a class="card" href="documents/GUIDE_MATERIEL.html">
        <div class="k">Achats</div><h3>Guide du matériel</h3>
        <p>Chaque pièce : à quoi elle sert, quoi prendre, le lien d'achat, et les pièges
        à éviter. Avec les calculs d'optique et d'autonomie.</p></a>
      <a class="card" href="documents/GUIDE_MONTAGE.html">
        <div class="k">Montage</div><h3>Assembler &amp; installer</h3>
        <p>Fabriquer les pods, câbler le hub, les placer sur le stand, régler les
        objectifs, calibrer — et le tableau de dépannage.</p></a>
      <a class="card" href="documents/GUIDE_COMPETITION.html">
        <div class="k">Officiel</div><h3>Compétition</h3>
        <p>Journal inaltérable, fiche scellée, contrôle avant épreuve — et
        la vérité sur l'homologation fédérale.</p></a>
      <a class="card" href="documents/GUIDE_ALIMENTATION.html">
        <div class="k">Énergie</div><h3>Alimentation</h3>
        <p>Batterie, secteur, ou dérivation sur les lanceurs — sans jamais
        la moindre coupure.</p></a>
      <a class="card" href="documents/GUIDE_GRANDE_SURFACE.html">
        <div class="k">Portée</div><h3>Grandes surfaces</h3>
        <p>Parcours de chasse et postes éloignés : pourquoi le sans-fil
        n'est possible qu'avec un pod qui décide sur place.</p></a>
      <a class="card" href="documents/MATERIEL_OPTIMAL.html">
        <div class="k">Achat</div><h3>Matériel optimal</h3>
        <p>Quoi acheter exactement, à quel prix relevé, dans quel ordre —
        et les pièges de commande qui coûtent cher.</p></a>
      <a class="card" href="documents/PREVISIONNEL_CLUB.html">
        <div class="k">Chiffré</div><h3>Prévisionnel club</h3>
        <p>3 terrains distants + club-house : 38 lanceurs, 10 caméras,
        12,6 Mbit/s de remontée, ≈ 5 280 € — en trois étapes.</p></a>
      <a class="card" href="documents/GUIDE_ITALIE_FITAV.html">
        <div class="k">Italie</div><h3>Tirer en Italie</h3>
        <p>Pedana, piattello, fossa olimpica : le dictionnaire du stand, et
        où poser les caméras à Vintimille.</p></a>
      <a class="card" href="documents/GUIDE_RESEAU.html">
        <div class="k">Réseau</div><h3>Autonome ou branché</h3>
        <p>Le boîtier crée son propre WiFi, ou rejoint celui du club. Code
        d'accès, caméras isolées, dépannage.</p></a>
      <a class="card" href="documents/BUDGET_BOM.html">
        <div class="k">Chiffres</div><h3>Budget &amp; liste d'achat</h3>
        <p>Le tableau récapitulatif : chaque poste, son prix cible, son lien d'achat,
        et la marge par kit.</p></a>
    </div>
    <div class="note"><strong>Honnêteté :</strong> ce matériel n'a jamais été monté —
    ces guides viennent de la spécification et des pratiques standard du domaine, pas
    d'un montage vérifié. Les pages marchandes n'ayant pas pu être ouvertes, les liens
    « recherche » ouvrent une recherche sur le site : <em>aucune référence produit n'a
    été inventée</em>.</div>
  </div>

  <div class="sec">
    <h2>Présentation &amp; business</h2>
    <p class="sub">Les pages commerciales et les documents de préparation.</p>
    <div class="cards">
      <a class="card" href="pages/landing.html">
        <div class="k">Page web</div><h3>Présentation produit</h3>
        <p>La page de présentation, avec une animation du plateau en vol.</p></a>
      <a class="card" href="pages/onepager.html">
        <div class="k">1 page</div><h3>Dossier partenaire</h3>
        <p>Le résumé pour un club, la FFBT ou un industriel. Imprimable en PDF.</p></a>
      <a class="card" href="documents/DOSSIER_BUSINESS.html">
        <div class="k">Stratégie</div><h3>Business &amp; Monaco</h3>
        <p>Statut, fiscalité, accompagnements — avec les points à faire valider.</p></a>
      <a class="card" href="documents/DOSSIER_VIDEO.html">
        <div class="k">Production</div><h3>Plan de la vidéo</h3>
        <p>Script, storyboard, tournage à l'iPhone, montage sur tablette.</p></a>
      <a class="card" href="documents/EMAIL_LAPORTE.html">
        <div class="k">Contact</div><h3>Emails Laporte</h3>
        <p>Prise de contact prête à envoyer, en français et en anglais.</p></a>
    </div>
  </div>

  <div class="sec">
    <h2>Le code source</h2>
    <p class="sub">Tout est dans le dossier <code>logiciel/</code> : le programme, les tests,
    les données d'exemple et la configuration du boîtier.</p>
    <div class="note">
      <strong>Pour lancer ClayScore</strong> (sur un ordinateur, pas une tablette) :<br>
      <code>cd logiciel</code> puis <code>./install.sh</code> puis <code>python -m clayscore.server</code><br>
      Ouvre ensuite <code>http://localhost:8000</code>. Détails dans « Comment l'utiliser ».<br><br>
      <strong>Avec Claude Code :</strong> ouvre simplement ce dossier — le fichier <code>CLAUDE.md</code>
      à la racine explique tout le projet à Claude, qui pourra te guider.
    </div>
  </div>

</div>
<div class="foot">
  ClayScore — conçu à Monaco · Kevin Desarzens<br>
  <a href="mailto:kevin.desarzens@gmail.com">kevin.desarzens@gmail.com</a> ·
  <a href="tel:+33672280277">+33 6 72 28 02 77</a>
</div>
</body></html>""".replace("__CSS__", MENU_CSS)

CLAUDE_MD = """# ClayScore — contexte projet (pour Claude Code)

Tu regardes le **dossier complet ClayScore**, un système de comptage automatique
de points pour le ball-trap (tir aux plateaux d'argile), créé par Kevin
Desarzens (Monaco).

## Le principe

Trois caméras + un micro reliés à un boîtier IA (NVIDIA Jetson) détectent, pour
chaque plateau lancé, le verdict :

- **CASSÉ** — le plateau explose après le coup de feu → point compté
- **MANQUÉ** — le plateau poursuit sa trajectoire intact → zéro
- **NO BIRD** — le plateau part déjà cassé du lanceur, AVANT tout tir → on
  rejoue (même tireur, même poste)
- **AMBIGU** — confiance trop faible → l'humain tranche sur le ralenti ; sa
  décision devient la vérité

Le tout sur réseau WiFi local **sans Internet**, piloté depuis une tablette.

## Où est quoi

| Dossier | Contenu |
|---|---|
| `index.html` | Menu d'accueil (à ouvrir dans un navigateur) |
| `00_RECAPITULATIF_TOTAL.md` | **Le document principal** : tout le projet |
| `01_COMMENT_UTILISER.md` | Mode d'emploi |
| `02_ETAT_ET_LIMITES.md` | Ce qui est prouvé / ce qui ne l'est pas |
| `documents/` | Spécification technique (cahier des charges), journal du projet, glossaire, **guide du matériel**, **guide de montage**, **checklist du prototype**, business, budget, plan vidéo, emails, **textes d'origine de Kevin mot pour mot** (HTML + sources .md) |
| `pages/` | Page de présentation et one-pager |
| `demos/` | 3 vidéos de démonstration (H.264) |
| `logiciel/` | **Le code source complet** |

## Le logiciel (`logiciel/`)

Python 3.10+, aucune licence payante. Développé en 8 jalons, tous terminés.

```
logiciel/
├── clayscore/
│   ├── sources/      # abstraction caméra/micro : fichier, webcam, GigE (Aravis)
│   ├── vision/       # detector (MOG2), tracker (Kalman), verdict, multicam, yolo
│   ├── audio/        # détection des coups de feu (RMS + seuil adaptatif)
│   ├── game/         # disciplines (FU/FO/DTL/parcours/compak) + machine à états
│   ├── server/       # FastAPI + WebSocket + PWA
│   ├── network.py    # réseau : autonome (hotspot) ou branché au réseau d'un club
│   ├── officiel.py   # compétition : journal inaltérable, fiche scellée, GO/NO-GO
│   ├── power.py      # alimentation : batterie / secteur / dérivation lanceur
│   ├── pods.py       # postes de vue filaires ou sans fil (grandes surfaces)
│   ├── maintenance.py# entretien auto du disque (jamais de "disque plein")
│   ├── capture.py    # découpe un flux continu en plateaux (chemin matériel réel)
│   ├── replay.py     # export ralenti habillé (badge + trajectoire, H.264)
│   └── engine.py     # moteur de match
├── webapp/           # l'appli tablette (PWA)
├── tools/            # synth (générateur de plateaux), bench, overlay, dataset, train
├── tests/            # 130 tests
└── config/config.yaml  # LE seul fichier à changer pour passer au vrai matériel
```

### Commandes utiles

```bash
cd logiciel
./install.sh                    # installe tout (crée .venv)
pytest                          # 130 tests → doivent tous passer
python -m tools.bench --all     # précision mesurée : 27/27 partout
python -m clayscore.server      # lance le serveur → http://localhost:8000
python -m tools.overlay --scenario casse --background ciel --out demo.mp4 --slowmo 4
```

## Points importants à connaître

1. **Tout est validé en simulation.** Les vidéos de test sont générées par
   `tools/synth.py` (le programme connaît la bonne réponse d'avance). La
   validation sur de vraies vidéos de ball-trap **reste à faire**.
2. **Le matériel n'est pas encore acheté.** Le code caméra GigE (Aravis) et
   micro est écrit et branché, mais non testé sur du vrai matériel.
3. **Passer au réel = changer `config/config.yaml`** (`source.video.type:
   aravis`, `source.audio.type: mic`). Aucune ligne de code à modifier.
4. **Ne jamais faire avancer la rotation sans verdict validé** — c'est une règle
   métier stricte, testée.
5. Le code et les commentaires sont **en français**.

## Si Kevin (ou son cousin) demande de l'aide

- Pour **comprendre** : commencer par `00_RECAPITULATIF_TOTAL.md`, puis
  `documents/SPEC_TECHNIQUE.md` (le cahier des charges d'origine) et
  `documents/JOURNAL_PROJET.md` (tout l'historique, bugs compris).
- Vocabulaire inconnu : `documents/GLOSSAIRE.md`.
- Pour **construire le prototype** : `documents/CHECKLIST_PROTOTYPE.md` (l'ordre
  des opérations), `documents/GUIDE_MATERIEL.md` (quoi acheter, où, les pièges)
  et `documents/GUIDE_MONTAGE.md` (assembler, câbler, placer, régler, dépanner).
  ⚠️ Ce matériel n'a jamais été monté : ces guides viennent de la spécification
  et des pratiques standard, pas d'un montage vérifié.
- Pour **essayer** : `01_COMMENT_UTILISER.md`.
- Pour **savoir ce qui est fiable** : `02_ETAT_ET_LIMITES.md`, et
  `documents/AUDIT_QUALITE.md` (défauts trouvés/corrigés + auto-critique).
- Pour le **réseau** (autonome ou branché au club, code d'accès) :
  `documents/GUIDE_RESEAU.md`.
- Pour la **compétition officielle** : `documents/GUIDE_COMPETITION.md`
  (⚠️ aucun logiciel ne s'homologue lui-même — la FFBT décide).
- Pour l'**alimentation** (batterie / secteur / lanceurs) :
  `documents/GUIDE_ALIMENTATION.md`.
- Pour les **grandes surfaces et le sans-fil** :
  `documents/GUIDE_GRANDE_SURFACE.md`.
- Pour **améliorer la détection** : le plus utile serait de vraies vidéos de
  stand, puis d'ajuster `clayscore/vision/detector.py` et/ou d'entraîner l'IA v2
  (`tools/train.py`).

Contact : Kevin Desarzens — kevin.desarzens@gmail.com — +33 6 72 28 02 77
"""

if __name__ == "__main__":
    main()
