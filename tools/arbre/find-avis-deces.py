#!/usr/bin/env python3
"""Cherche un avis de décès publié (pompes funèbres / journaux) pour un NOM donné.

Interroge plusieurs sites français d'avis de décès côté serveur (la CI a le réseau
ouvert ; l'agent, non). Affiche pour chaque site : OK/KO + extraits autour du nom.
Ne commit rien — tout est dans le log. Erreurs TOUJOURS détaillées (cause exacte).

Usage : NOM=MAIFFRET PRENOM=Monique python3 tools/arbre/find-avis-deces.py
"""
import os, re, html, urllib.request, urllib.parse, ssl, json, sys

NOM = os.environ.get("NOM", "MAIFFRET").strip()
PRENOM = os.environ.get("PRENOM", "").strip()
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")
CTX = ssl.create_default_context()

def fetch(url, timeout=25):
    req = urllib.request.Request(url, headers={
        "User-Agent": UA, "Accept-Language": "fr-FR,fr;q=0.9",
        "Accept": "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8"})
    with urllib.request.urlopen(req, timeout=timeout, context=CTX) as r:
        return r.read().decode("utf-8", "replace"), r.status

def clean(t):
    t = html.unescape(re.sub(r"<[^>]+>", " ", t))
    return re.sub(r"\s+", " ", t).strip()

def extraits(texte, nom, rayon=260, maxn=8):
    out, low = [], texte.lower()
    for m in re.finditer(re.escape(nom.lower()), low):
        a, b = max(0, m.start() - rayon), min(len(texte), m.end() + rayon)
        seg = clean(texte[a:b])
        if seg and seg not in out:
            out.append(seg)
        if len(out) >= maxn:
            break
    return out

q = urllib.parse.quote(NOM)
qlow = urllib.parse.quote(NOM.lower())
SITES = [
    ("dansnoscoeurs.fr (recherche)", f"https://www.dansnoscoeurs.fr/recherche/simple?nom={qlow}"),
    ("avis-de-deces.net (recherche)", f"https://www.avis-de-deces.net/recherche-avis-deces.html?nom={qlow}"),
    ("avisobseques.fr (recherche)", f"https://avisobseques.fr/?s={qlow}"),
    ("libramemoria.com (recherche)", f"https://www.libramemoria.com/avis/rechercher?query={qlow}"),
    ("pfg.fr (recherche)", f"https://www.pfg.fr/avis-de-deces/resultats?query={qlow}"),
    ("simplifia.fr (fichier INSEE, humains)", f"https://www.simplifia.fr/avis-deces/recherche?nom={qlow}"),
    ("echo-necro dansnoscoeurs Nice-Matin", "https://www.dansnoscoeurs.fr/avis-necrologiques/nice-matin/38"),
    ("Bing (index web)", f"https://www.bing.com/search?q=%22{q}%22+avis+de+d%C3%A9c%C3%A8s+{urllib.parse.quote(PRENOM)}"),
    ("DuckDuckGo (index web)", f"https://html.duckduckgo.com/html/?q=%22{q}%22+avis+de+d%C3%A9c%C3%A8s+{urllib.parse.quote(PRENOM)}"),
]

print(f"🔎 Avis de décès — NOM={NOM!r} PRENOM={PRENOM!r}\n" + "=" * 70)
trouves = 0
for label, url in SITES:
    print(f"\n### {label}\n    {url}")
    try:
        body, status = fetch(url)
    except Exception as e:
        print(f"    ❌ KO — {type(e).__name__}: {e}")
        continue
    segs = extraits(body, NOM)
    if not segs:
        print(f"    ✅ HTTP {status} — aucun résultat contenant « {NOM} » sur cette page.")
        continue
    trouves += len(segs)
    print(f"    ✅ HTTP {status} — {len(segs)} extrait(s) contenant « {NOM} » :")
    for s in segs:
        marque = "  ⭐" if (PRENOM and PRENOM.lower() in s.lower()) else "    "
        print(f"{marque} • {s[:520]}")
    # liens directs vers des avis dans le HTML brut
    liens = sorted(set(re.findall(r'href="([^"]*%s[^"]*)"' % re.escape(NOM.lower()), body.lower())))[:6]
    for l in liens:
        print(f"      ↪ lien : {l}")

print("\n" + "=" * 70)
print(f"Bilan : {trouves} extrait(s) au total. ⭐ = contient aussi le prénom {PRENOM!r}."
      if PRENOM else f"Bilan : {trouves} extrait(s) au total.")
print("Rappel : un avis publié par les pompes funèbres peut prendre quelques jours à paraître ;")
print("le fichier INSEE (workflow arbre-find-deces) est mis à jour chaque mois.")
