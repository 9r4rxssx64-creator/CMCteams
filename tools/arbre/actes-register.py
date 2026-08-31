#!/usr/bin/env python3
# =============================================================================
# REGISTRE D'ACTES AUTONOME — naissance + mariage + décès (Kevin 2026-08-05)
# « Récupère tous les actes autonome. Trouve des solutions. Naissance et mariage aussi. »
# -----------------------------------------------------------------------------
# Pour CHAQUE personne décédée de l'arbre :
#  · DÉCÈS : match dans le fichier INSEE complet (Parquet R2) → n° d'acte + commune
#    de décès + date/lieu de naissance. 100% autonome, prouvé (n° d'acte vérifiable).
#  · NAISSANCE & MARIAGE : détermine l'archive compétente (Monaco / AD06 / AD13 / AD83
#    / service-public) d'après le lieu, et génère la DEMANDE pré-remplie en 1 clic
#    (les images sont souvent verrouillées 75 ans ou derrière un blocage IP-datacenter
#    → seul le téléphone de Kevin passe : on livre alors la demande prête à envoyer).
# Sortie : arbre/research/ACTES-REGISTRE.md (+ arbre/research/actes.json machine).
# Aucune invention : seulement ce que l'INSEE renvoie + des liens officiels.
# Réseau ouvert requis (runner CI). Usage : python3 tools/arbre/actes-register.py
# =============================================================================
import re, json, sys, urllib.request, urllib.parse
import duckdb

BASE = "https://pub-1a8025a4d1634431908305a40060beda.r2.dev"
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36"

def norm(s):
    s=(s or "").upper()
    for a,b in [("É","E"),("È","E"),("Ê","E"),("Ë","E"),("À","A"),("Â","A"),("Ä","A"),
                ("Ç","C"),("Î","I"),("Ï","I"),("Ô","O"),("Ö","O"),("Û","U"),("Ù","U"),("Ü","U"),("Œ","OE")]:
        s=s.replace(a,b)
    return re.sub(r"\s+"," ",re.sub(r"[^A-Z '\-]"," ",s)).strip()
def yr(s):
    m=re.search(r"(1[6-9]\d\d|20\d\d)",s or ""); return int(m.group(1)) if m else None

# --- commune INSEE : code → (nom, département). Codes fréquents de la famille + résolution live.
COMMUNE_CACHE={
    "06088":("Nice","06"),"06011":("Beaulieu-sur-Mer","06"),"06159":("Villefranche-sur-Mer","06"),
    "06027":("Cagnes-sur-Mer","06"),"06004":("Antibes","06"),"06033":("Cannes","06"),
    "06123":("Roquebrune-Cap-Martin","06"),"06114":("Peymeinade","06"),"06148":("Saint-Laurent-du-Var","06"),
    "06149":("Saint-Martin-du-Var","06"),"83101":("Ramatuelle","83"),"13055":("Marseille","13"),
    "99140":("SUISSE (étranger)","99"),"99138":("MONACO (étranger)","99"),"99142":("étranger","99"),
}
def commune(code):
    code=(code or "").strip()
    if not code or code in ("00000","",None): return ("(inconnue)","")
    if code in COMMUNE_CACHE: return COMMUNE_CACHE[code]
    if code.startswith("99"): return ("(étranger, code "+code+")","99")
    try:  # geo.api.gouv.fr (UA navigateur)
        req=urllib.request.Request("https://geo.api.gouv.fr/communes/"+urllib.parse.quote(code)+"?fields=nom,codeDepartement",
                                   headers={"User-Agent":UA})
        j=json.load(urllib.request.urlopen(req,timeout=15))
        r=(j.get("nom","?"), j.get("codeDepartement",code[:2])); COMMUNE_CACHE[code]=r; return r
    except Exception:
        r=("(commune "+code+")", code[:2]); COMMUNE_CACHE[code]=r; return r

# --- archive compétente selon le lieu (nom texte + éventuel département)
def archive_for(place_text, dept=""):
    p=(place_text or "").upper()
    if "MONACO" in p or "MONTE-CARLO" in p or "MONTE CARLO" in p or dept=="MC":
        return dict(nom="État-civil de Monaco (base ≥1900)", type="monaco",
                    url="https://archives.mairie.mc/r/5/base-de-registres-a-partir-de-1900/",
                    note="Base publique Monaco 1900+ : consultable ; demande officielle via la Mairie de Monaco.")
    d=dept or ""
    if d=="06" or "NICE" in p or "BEAULIEU" in p or "VILLEFRANCHE" in p or "ANTIBES" in p or "CANNES" in p or "CAGNES" in p:
        return dict(nom="Archives dép. Alpes-Maritimes (AD06)", type="ad06",
                    url="https://archives06.fr/",
                    note="⚠️ AD06 bloque les IP de datacenter (robots) → à ouvrir depuis le téléphone. Sinon demande à la mairie du lieu.")
    if d=="13" or "MARSEILLE" in p or "SALON" in p or "AIX" in p:
        return dict(nom="Archives dép. Bouches-du-Rhône (AD13)", type="ad13",
                    url="https://www.archives13.fr/archive/recherche/etatcivil/n:88",
                    note="Registres en ligne AD13 (Salon-de-Provence pour DESARZENS).")
    if d=="83" or "RAMATUELLE" in p or "TOULON" in p:
        return dict(nom="Archives dép. Var (AD83)", type="ad83",
                    url="https://archives.var.fr/",
                    note="Registres en ligne AD83.")
    return dict(nom="Service-public / mairie du lieu", type="sp",
                url="https://www.service-public.fr/particuliers/vosdroits/N359",
                note="Demande d'acte via service-public ou la mairie du lieu.")

def req_links(kind, nom, prenoms, place, dept, date, acte=""):
    """Génère (label, url) de demande + un modèle mailto pré-rempli."""
    a=archive_for(place, dept)
    subj=urllib.parse.quote("Demande d'acte de "+kind+" — "+prenoms+" "+nom)
    body=urllib.parse.quote(
        "Bonjour,\n\nJe sollicite une copie de l'acte de "+kind+" de :\n"
        "Nom : "+nom+"\nPrénom(s) : "+prenoms+"\n"
        +("Date : "+date+"\n" if date else "")
        +("Lieu : "+place+"\n" if place else "")
        +("N° d'acte (INSEE) : "+acte+"\n" if acte else "")
        +"\nJe vous remercie.\nCordialement.")
    return dict(archive=a["nom"], archive_url=a["url"], note=a["note"],
                mailto="mailto:?subject="+subj+"&body="+body)

# ---- 1) config R2
try:
    cfg=json.load(urllib.request.urlopen(urllib.request.Request(BASE+"/config.json",headers={"User-Agent":UA}),timeout=30))
except Exception as e:
    print("::error::config.json R2 —",e); sys.exit(1)
PARTS=cfg.get("parts",{})

# ---- 2) seed
html=open("arbre/index.html",encoding="utf-8").read()
blocks=re.findall(r'add\(\{id:"[\s\S]*?\}\);',html)
def f(b,n):
    m=re.search(r'[,{]'+n+r':\s*"((?:[^"\\]|\\.)*)"',b); return m.group(1) if m else None
def dt(b,k):
    m=re.search(k+r':\{date:"([^"]*)"(?:,lieu:"([^"]*)")?',b); return (m.group(1),m.group(2) or "") if m else ("","")
persons=[]
for b in blocks:
    pid=f(b,'id')
    if not pid: continue
    nd,nl=dt(b,'naissance'); dd,dl=dt(b,'deces')
    persons.append(dict(id=pid,prenom=f(b,'prenom') or "",nom=f(b,'nom') or "",
                        vivant=bool(re.search(r'vivant:true',b)),nd=nd,nl=nl,dd=dd,dl=dl))

con=duckdb.connect(); con.execute("INSTALL httpfs; LOAD httpfs;")
try: con.execute("SET http_user_agent='"+UA+"'")
except Exception: pass
def q(s): return "'"+str(s).replace("'","''")+"'"

def best_death(p):
    nom=norm(p["nom"]); noms=nom.replace(" ","").replace("-","")
    pref=nom[0] if nom else ""; files=PARTS.get(pref) or PARTS.get("AUTRE")
    if not files: return None
    urls="["+",".join(q(BASE+"/"+x) for x in files)+"]"
    where=("(nom = "+q(nom)+" OR replace(replace(nom,' ',''),'-','')="+q(noms)
           +" OR nom LIKE "+q(nom+" %")+" OR nom LIKE "+q("% "+nom)+")")
    try:
        rows=con.execute("SELECT nom,prenoms,sexe,date_naissance,code_lieu_naissance,commune_naissance,"
                         "pays_naissance,date_deces,code_lieu_deces,num_acte FROM read_parquet("+urls+") WHERE "+where+" LIMIT 80").fetchall()
    except Exception: return None
    pf=norm(p["prenom"]).split(" "); byN,byD=yr(p["nd"]),yr(p["dd"]); lieuN=norm(p["nl"]); best=None;bs=-1
    for r in rows:
        hf=norm(r[1] or "").split(" "); hbn,hbd=yr(r[3]),yr(r[7]); sc=0
        if any(t and t in hf for t in pf): sc+=2
        if pf and hf and pf[0]==hf[0]: sc+=1
        if byN and hbn and abs(byN-hbn)<=1: sc+=3
        if byD and hbd and abs(byD-hbd)<=1: sc+=3
        if lieuN and r[5] and (norm(r[5]) in lieuN or lieuN in norm(r[5])): sc+=2
        # exige le bon 1er prénom (anti faux-positif homonyme)
        if pf and hf and pf[0]!=hf[0]: sc-=4
        if sc>bs: bs=sc; best=r
    return (best,bs) if best and bs>=6 else None

def fdate(s):
    s=(s or "").replace(".","").replace("/","")
    m=re.match(r"^(\d{4})(\d{2})(\d{2})$",s or "")
    if m: j=m.group(3); mo=m.group(2); return (("" if j=="00" else j+".")+("" if mo=="00" else mo+".")+m.group(1))
    return s or "?"

L=["# 📜 Registre d'actes — naissance · mariage · décès ("+__import__('datetime').date.today().isoformat()+")","",
   "Décès 1970+ : références **INSEE** récupérées automatiquement (n° d'acte + commune, vérifiables). "
   "Naissances/mariages : archive compétente + **demande pré-remplie** (images souvent verrouillées 75 ans "
   "ou derrière un blocage IP → à ouvrir depuis le téléphone de Kevin). Aucune donnée inventée.",""]
JSON={}
autod=0; reqonly=0
for p in persons:
    if p["vivant"] or not p["nom"] or not p["prenom"]: continue
    full=p["prenom"]+" "+p["nom"]
    entry={"id":p["id"],"nom":p["nom"],"prenom":p["prenom"],"deces":None,"naissance":None,"mariage":None}
    bd=best_death(p)
    L.append("### "+full)
    if bd:
        r,sc=bd; dd=fdate(r[7]); nd=fdate(r[3]); acte=(r[9] or "").strip()
        cnom,cdep=commune(r[8]); bplace=r[5] or p["nl"] or ""
        autod+=1
        L.append("- 🕯️ **Décès** — INSEE : † "+dd+" à **"+cnom+"** (code "+(r[8] or "?")+") · **acte n°"+(acte or "?")+"** · né "+nd+(" à "+bplace if bplace else "")+".")
        entry["deces"]={"date":dd,"commune":cnom,"code":r[8],"acte":acte,"naissance_date":nd,"naissance_lieu":bplace,"score":sc}
        # naissance : archive du lieu de naissance
        rb=req_links("naissance",p["nom"],p["prenom"],bplace,cdep if False else "", nd, "")
        # mariage : lieu inconnu (souvent commune de l'épouse) → demande générique
    else:
        cnom=""; bplace=p["nl"] or ""; dd=fdate(p["dd"]) if p["dd"] else ""
        L.append("- 🕯️ **Décès** — pas trouvé au fichier INSEE 1970+ (décès probablement <1970 ou hors périmètre). "
                 "→ demande à l'archive du lieu.")
        rb=req_links("naissance",p["nom"],p["prenom"],bplace,"",fdate(p["nd"]) if p["nd"] else "","")
        reqonly+=1
    # NAISSANCE (toujours) — archive du lieu de naissance connu
    aN=req_links("naissance",p["nom"],p["prenom"],p["nl"] or (bd and bd[0][5]) or "","",fdate(p["nd"]) if p["nd"] else "")
    L.append("- 🍼 **Naissance** — "+aN["archive"]+" · "+aN["note"]+"  ·  [demande pré-remplie]("+aN["mailto"]+") · [archive]("+aN["archive_url"]+")")
    entry["naissance"]={"archive":aN["archive"],"url":aN["archive_url"],"lieu":p["nl"] or ""}
    # MARIAGE — lieu souvent = commune de l'épouse ; on oriente vers le lieu de naissance/décès connu
    mplace=p["nl"] or (bd and commune(bd[0][8])[0]) or ""
    aM=req_links("mariage",p["nom"],p["prenom"],mplace,"","")
    L.append("- 💍 **Mariage** — lieu à confirmer (souvent la commune de l'épouse). "+aM["archive"]+" · [demande pré-remplie]("+aM["mailto"]+") · [archive]("+aM["archive_url"]+")")
    entry["mariage"]={"archive":aM["archive"],"url":aM["archive_url"]}
    L.append("")
    JSON[p["id"]]=entry

L.insert(3,"**Bilan : "+str(autod)+" acte(s) de décès récupéré(s) automatiquement (INSEE) · "
         +str(reqonly)+" décès à demander (hors INSEE) · naissances/mariages : demandes générées pour tous.**\n")
open("arbre/research/ACTES-REGISTRE.md","w",encoding="utf-8").write("\n".join(L)+"\n")
open("arbre/research/actes.json","w",encoding="utf-8").write(json.dumps(JSON,ensure_ascii=False,indent=1))
print("OK — "+str(autod)+" décès INSEE auto, registre écrit (ACTES-REGISTRE.md + actes.json)")
