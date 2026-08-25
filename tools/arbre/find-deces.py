#!/usr/bin/env python3
# =============================================================================
# ARBRE — RETROUVER UN DÉCÈS PRÉCIS (Kevin 2026-08-06 : « l'acte de décès de mon
# père Gérard, l'année dernière »). Outil générique réutilisable.
# Interroge DEUX sources et affiche tout dans le log du job :
#   1. API INSEE matchid (deces.matchid.io) — à jour mensuellement
#   2. Le fichier COMPLET sur R2 (Parquet, DuckDB) — n° d'acte + code commune
# Variantes de nom essayées (DESARZENS / DE SARZENS / DE-SARZENS…).
# Env : NOM, PRENOM, YMIN, YMAX. Réseau ouvert requis (runner CI).
# =============================================================================
import os, re, json, urllib.request, urllib.parse
import duckdb

NOM=os.environ.get("NOM","DESARZENS"); PRENOM=os.environ.get("PRENOM","Gérard")
YMIN=int(os.environ.get("YMIN","2024")); YMAX=int(os.environ.get("YMAX","2026"))
BASE="https://pub-1a8025a4d1634431908305a40060beda.r2.dev"
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36"

def norm(s):
    s=(s or "").upper()
    for a,b in [("É","E"),("È","E"),("Ê","E"),("Ë","E"),("À","A"),("Â","A"),("Ä","A"),
                ("Ç","C"),("Î","I"),("Ï","I"),("Ô","O"),("Ö","O"),("Û","U"),("Ù","U"),("Ü","U")]:
        s=s.replace(a,b)
    return re.sub(r"\s+"," ",re.sub(r"[^A-Z '\-]"," ",s)).strip()
def get(url):
    req=urllib.request.Request(url,headers={"User-Agent":UA,"Accept":"application/json"})
    return json.load(urllib.request.urlopen(req,timeout=30))
def fd(s):
    s=re.sub(r"\D","",str(s or ""))
    return (s[6:8]+"."+s[4:6]+"."+s[0:4]) if len(s)==8 else (s or "?")

nomN=norm(NOM); preN=norm(PRENOM).split(" ")[0]
variants=sorted(set([nomN, nomN.replace(" ",""), "DE "+nomN if not nomN.startswith("DE ") else nomN[3:], nomN.replace("DE ","")]))
print("🔎 Recherche décès : prénom «",PRENOM,"» · nom «",NOM,"» (+ variantes",variants,") · années",YMIN,"→",YMAX)

print("\n===== SOURCE 1 : API INSEE (matchid) =====")
found_api=[]
for v in variants:
    q=urllib.parse.quote((PRENOM+" "+v).strip())
    try: hits=(get("https://deces.matchid.io/deces/api/v1/search?q="+q+"&size=30").get("response") or {}).get("persons") or []
    except Exception as e: print("  ("+v+") erreur:",str(e)[:80]); continue
    for h in hits:
        nm=norm((h.get("name") or {}).get("last")); fs=[norm(x) for x in ((h.get("name") or {}).get("first") or [])]
        d=(h.get("death") or {}); b=(h.get("birth") or {})
        dy=int(re.sub(r"\D","",str(d.get("date") or "0"))[:4] or 0)
        if nm.replace(" ","")!=v.replace(" ",""): continue
        if preN not in fs: continue
        if not (YMIN<=dy<=YMAX):
            print("  (hors période) ",fs,nm,"† ",fd(d.get("date")),"à",(d.get("location") or {}).get("city","?"),"· né",fd(b.get("date")),"à",(b.get("location") or {}).get("city","?"),"· id",h.get("id"))
            continue
        found_api.append(h)
        print("  ✅ MATCH:",(" ".join(((h.get("name") or {}).get("first") or []))),nm,
              "· né",fd(b.get("date")),"à",(b.get("location") or {}).get("city","?"),
              "· † ",fd(d.get("date")),"à",(d.get("location") or {}).get("city","?"),
              "(",(d.get("location") or {}).get("code","?"),") · acte n°",d.get("certificateId","?"),
              "· fiche https://deces.matchid.io/id/"+str(h.get("id")))
if not found_api: print("  Aucun décès",YMIN,"-",YMAX,"pour ces variantes via l'API.")

print("\n===== SOURCE 2 : fichier COMPLET sur R2 (n° d'acte) =====")
try:
    cfg=get(BASE+"/config.json"); parts=cfg.get("parts",{}).get("D") or []
    urls="["+",".join("'"+BASE+"/"+p+"'" for p in parts)+"]"
    con=duckdb.connect(); con.execute("INSTALL httpfs; LOAD httpfs;")
    try: con.execute("SET http_user_agent='"+UA+"'")
    except Exception: pass
    conds=" OR ".join("replace(replace(nom,' ',''),'-','')='"+v.replace(" ","").replace("'","''")+"'" for v in variants)
    rows=con.execute("SELECT nom,prenoms,sexe,date_naissance,commune_naissance,pays_naissance,date_deces,code_lieu_deces,num_acte "
                     "FROM read_parquet("+urls+") WHERE ("+conds+") AND substr(date_deces,1,4) BETWEEN '"+str(YMIN)+"' AND '"+str(YMAX)+"'").fetchall()
    if not rows: print("  Aucun décès",YMIN,"-",YMAX,"dans le fichier complet.")
    for r in rows:
        ok="✅" if preN in norm(r[1]).split(" ") else "·"
        print(" ",ok,r[1],r[0],"· né",fd(r[3]),"à",(r[4] or "?"),"· †",fd(r[6]),"· commune INSEE",r[7],"· ACTE n°",(r[8] or "?").strip())
    # tous décès DESARZENS (toutes années) pour contexte
    allr=con.execute("SELECT prenoms,nom,date_naissance,date_deces,code_lieu_deces,num_acte FROM read_parquet("+urls+") WHERE ("+conds+") ORDER BY date_deces").fetchall()
    print("\n  (contexte : TOUS les décès de ce nom dans le fichier, 1970→auj. :",len(allr),")")
    for r in allr: print("   ·",r[0],r[1],"né",fd(r[2]),"† ",fd(r[3]),"commune",r[4],"acte",(r[5] or "?").strip())
except Exception as e:
    print("  Erreur R2/DuckDB:",str(e)[:200])

print("\nNote honnête : un décès très récent peut manquer (publication mensuelle INSEE, ~1-2 mois de délai),")
print("et une personne ayant fait opposition n'apparaît pas. Dans ce cas → demande d'acte à la mairie du décès (droit de la famille).")
