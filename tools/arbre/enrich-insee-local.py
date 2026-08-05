#!/usr/bin/env python3
# =============================================================================
# ENRICHISSEMENT INSEE v2 — dataset LOCAL complet (Kevin « une fois les documents »)
# -----------------------------------------------------------------------------
# Bien plus puissant que la v1 (API matchid, rappel faible sur les noms composés) :
# interroge le fichier des décès INSEE COMPLET (Parquet sur R2) via DuckDB + httpfs
# (Range HTTP), avec correspondance robuste : nom exact / sans espaces / préfixe,
# prénom par jetons, proximité d'année, indice lieu de naissance. Zéro invention :
# chaque candidat porte son numéro d'acte + code lieu (vérifiables).
# Sortie : arbre/research/ENRICH-INSEE-LOCAL.md. Réseau ouvert requis (runner CI).
# Usage : python3 tools/arbre/enrich-insee-local.py
# =============================================================================
import re, json, urllib.request, sys
import duckdb

BASE = "https://pub-1a8025a4d1634431908305a40060beda.r2.dev"

def norm(s):
    s = (s or "").upper()
    s = s.replace("É","E").replace("È","E").replace("Ê","E").replace("Ë","E")
    s = s.replace("À","A").replace("Â","A").replace("Ä","A").replace("Ç","C")
    s = s.replace("Î","I").replace("Ï","I").replace("Ô","O").replace("Ö","O")
    s = s.replace("Û","U").replace("Ù","U").replace("Ü","U").replace("Œ","OE")
    s = re.sub(r"[^A-Z '\-]", " ", s)
    return re.sub(r"\s+", " ", s).strip()

def yr(s):
    m = re.search(r"(1[6-9]\d\d|20\d\d)", s or "")
    return int(m.group(1)) if m else None

# 1) config.json (manifeste des partitions)
try:
    cfg = json.load(urllib.request.urlopen(BASE+"/config.json", timeout=30))
except Exception as e:
    print("::error::config.json introuvable sur R2 —", e); sys.exit(1)
PARTS = cfg.get("parts", {})

# 2) seed de l'arbre
html = open("arbre/index.html", encoding="utf-8").read()
blocks = re.findall(r'add\(\{id:"[\s\S]*?\}\);', html)
def field(b, n):
    m = re.search(r'[,{]'+n+r':\s*"((?:[^"\\]|\\.)*)"', b); return m.group(1) if m else None
def dt(b, key):
    m = re.search(key+r':\{date:"([^"]*)"(?:,lieu:"([^"]*)")?', b)
    return (m.group(1), m.group(2) or "") if m else ("","")
persons = []
for b in blocks:
    pid = field(b,'id')
    if not pid: continue
    nd, nl = dt(b,'naissance'); dd, dl = dt(b,'deces')
    persons.append(dict(id=pid, prenom=field(b,'prenom') or "", nom=field(b,'nom') or "",
                        vivant=bool(re.search(r'vivant:true', b)),
                        nd=nd, nl=nl, dd=dd, dl=dl))

con = duckdb.connect()
con.execute("INSTALL httpfs; LOAD httpfs;")
con.execute("SET enable_http_metadata_cache=true;")

out = ["# 🔎 Enrichissement INSEE v2 — dataset LOCAL complet ("+__import__('datetime').date.today().isoformat()+")",
       "", "Fichier des décès INSEE COMPLET (Parquet sur R2), correspondance robuste. "
       "Chaque candidat porte son n° d'acte + code lieu INSEE (vérifiables). Aucune donnée inventée.", ""]
conf=corr=piste=rien=0

def q(s): return "'"+str(s).replace("'","''")+"'"

for p in persons:
    if p["vivant"] or not p["nom"] or not p["prenom"]:
        continue
    nom = norm(p["nom"]); noms = nom.replace(" ","").replace("-","")
    pref = nom[0] if nom else ""
    files = PARTS.get(pref) or PARTS.get("AUTRE")
    if not files:
        continue
    urls = "["+",".join(q(BASE+"/"+f) for f in files)+"]"
    # match nom : exact, sans espaces/tirets, ou préfixe (noms composés VAN DEN BOSCH, DE SARZENS…)
    where = ("(nom = "+q(nom)+" OR replace(replace(nom,' ',''),'-','') = "+q(noms)
             +" OR nom LIKE "+q(nom+" %")+" OR nom LIKE "+q("% "+nom)+")")
    try:
        rows = con.execute(
            "SELECT nom,prenoms,sexe,date_naissance,commune_naissance,pays_naissance,"
            "date_deces,code_lieu_deces,num_acte FROM read_parquet("+urls+") WHERE "+where+" LIMIT 60"
        ).fetchall()
    except Exception as e:
        out.append("- **"+p["prenom"]+" "+p["nom"]+"** : erreur requête — "+str(e)[:90]); continue
    if not rows:
        rien+=1; out.append("- **"+p["prenom"]+" "+p["nom"]+"** : 0 dans le fichier complet"); continue
    pf = norm(p["prenom"]).split(" ")
    byN, byD = yr(p["nd"]), yr(p["dd"])
    lieuN = norm(p["nl"])
    scored=[]
    for r in rows:
        rnom,rpre,rsx,rdn,rcn,rpn,rdd,rld,ract = r
        hf = norm(rpre or "").split(" ")
        hbn, hbd = yr(rdn), yr(rdd)
        sc=0
        if any(t and t in hf for t in pf): sc+=2
        if pf and hf and pf[0]==hf[0]: sc+=1
        if byN and hbn and abs(byN-hbn)<=1: sc+=3
        elif byN and hbn and abs(byN-hbn)<=3: sc+=1
        if byD and hbd and abs(byD-hbd)<=1: sc+=3
        if lieuN and rcn and (norm(rcn) in lieuN or lieuN in norm(rcn)): sc+=2
        scored.append((sc, r, hbn, hbd))
    scored.sort(key=lambda x:-x[0])
    best = scored[0]; sc, r, hbn, hbd = best
    rnom,rpre,rsx,rdn,rcn,rpn,rdd,rld,ract = r
    def fmt(r):
        rnom,rpre,rsx,rdn,rcn,rpn,rdd,rld,ract = r
        return (rpre+" "+rnom+" — né "+(rdn or "?")+" à "+(rcn or "?")
                +(" ("+rpn+")" if rpn and rpn!="FRANCE" else "")
                +" — † "+(rdd or "?")+" (acte "+(ract or "?")+", lieu "+(rld or "?")+")")
    known = (str(byN) if byN else "?")+"/"+(str(byD) if byD else "?")
    found = (str(hbn) if hbn else "?")+"/"+(str(hbd) if hbd else "?")
    if sc>=6:
        tag="✅ CONFIRMÉ"
        if (byD and hbd and byD!=hbd) or (byN and hbn and byN!=hbn): tag="✏️ À CORRIGER"; corr+=1
        else: conf+=1
        out.append("- **"+p["prenom"]+" "+p["nom"]+"** — "+tag+" (connu "+known+" vs INSEE "+found+")")
        out.append("  · "+fmt(r))
    elif sc>=4:
        piste+=1
        out.append("- **"+p["prenom"]+" "+p["nom"]+"** — 🟡 PISTE (score "+str(sc)+") : "+fmt(r))
        for s2 in scored[1:3]:
            if s2[0]>=3: out.append("    · autre : "+fmt(s2[1]))
    else:
        rien+=1
        out.append("- **"+p["prenom"]+" "+p["nom"]+"** — "+str(len(rows))+" homonyme(s), aucun fiable (meilleur "+str(sc)+")")

out.insert(4, "**Bilan : "+str(conf)+" confirmé(s) · "+str(corr)+" à corriger · "+str(piste)+" piste(s) · "+str(rien)+" sans correspondance.**\n")
open("arbre/research/ENRICH-INSEE-LOCAL.md","w",encoding="utf-8").write("\n".join(out)+"\n")
print("Rapport : arbre/research/ENRICH-INSEE-LOCAL.md  ("+str(conf)+" conf, "+str(corr)+" corr, "+str(piste)+" pistes)")
