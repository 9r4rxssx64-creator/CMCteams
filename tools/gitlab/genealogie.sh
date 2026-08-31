#!/bin/sh
# Recherche généalogique via CI (réseau ouvert) : pour chaque NOM, récupère la
# liste des décès (fichier INSEE, 1970+) sur acte-deces.fr et en extrait chaque
# entrée (prénoms, dates+lieux naissance/décès). Lecture seule. Var NAMES (csv).
set -eu
apk add --no-cache curl python3 >/dev/null
NAMES="${NAMES:-maiffret}"
echo "===== RECHERCHE GENEALOGIE (INSEE via acte-deces.fr) ====="
echo "$NAMES" | tr ',' '\n' | while read raw; do
  n=$(printf '%s' "$raw" | tr '[:upper:]' '[:lower:]' | tr -d ' ')
  [ -z "$n" ] && continue
  url="https://www.acte-deces.fr/recherche-deces-famille-$n"
  echo ""
  echo "### $n  ($url)"
  if ! curl -s --max-time 30 -A "Mozilla/5.0 (genealogie)" "$url" -o /tmp/p.html; then
    echo "  (réseau KO)"; continue
  fi
  python3 - "$n" <<'PY'
import sys,re,html
name=sys.argv[1]
try: t=open('/tmp/p.html',encoding='utf-8',errors='ignore').read()
except: print("  (lecture KO)"); raise SystemExit
m=re.search(r'(\d+)\s+décès portant', t) or re.search(r'"description":"(\d+)\s+décès', t)
print("  total INSEE:", m.group(1) if m else "?")
# retire scripts/styles puis balises
b=re.sub(r'<script.*?</script>','',t,flags=re.S)
b=re.sub(r'<style.*?</style>','',b,flags=re.S)
b=re.sub(r'<[^>]+>',' ',b)
b=html.unescape(b); b=re.sub(r'[ \t]+',' ',b)
# chaque entrée décès contient au moins une date jj/mm/aaaa ; on capture une
# fenêtre lisible autour de chaque bloc "Prénom(s) ... né ... décédé ..."
pat=re.compile(r'([A-ZÉÈÀÎ][\wéèêëàâîïôûç\'\- ]{1,45}?)\s+(?:née?|n\.)\s*(?:le|à)\s*([^,;]{4,40}?)(?:,| )+(?:décéd[ée]+|d\.)\s*(?:le|à)\s*([^,;<\n]{4,45})',re.I)
seen=set(); c=0
for mm in pat.finditer(b):
    who=mm.group(1).strip(); nais=mm.group(2).strip(); dec=mm.group(3).strip()
    k=(who+nais+dec).lower()
    if k in seen: continue
    seen.add(k); c+=1
    if c>60: print("  … (liste tronquée)"); break
    print(f"   • {who} | né {nais} | † {dec}")
if c==0:
    # repli : montrer les segments contenant une date
    for mm in re.finditer(r'.{0,50}[0-3]?\d/[01]?\d/(19|20)\d\d.{0,50}', b):
        s=mm.group(0).strip()
        if re.search(r'[A-Za-zÉ]{3}', s):
            print("   ~", s[:120]); c+=1
            if c>40: break
    if c==0: print("  (aucune entrée datée extraite — structure de page différente)")
PY
done
echo ""
echo "===== FIN GENEALOGIE ====="
