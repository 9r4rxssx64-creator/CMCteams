# 🌳 PASSATION ARBRE — état au 1.09.2026 (v3.13 EN LIGNE) — À LIRE EN PREMIER par toute session qui reprend l'arbre

> Ce document remplace toute passation antérieure. Il a été écrit après la session du 31.08–1.09.2026
> qui a publié les versions v3.9 → v3.13 et tranché la branche Marielle/Beaumelle AVEC Kevin.

## 0. ÉTAT ACTUEL (vérifié, pas supposé)

- **EN LIGNE : v3.13** → https://kdmc-site.pages.dev/arbre/ (code d'accès famille : **MAIFFRET**, majuscules).
- `arbre/index.html` : `APP_VER="v3.13"` (~l.265) · `SEED_VERSION=62` (~l.1420) · **119 fiches seed, 0 lien cassé**.
- `arbre/sw.js` : `CACHE = "arbre-v3.13"` (l.2). **Règle : le trio APP_VER + SEED_VERSION + CACHE se bumpe ENSEMBLE à chaque modif de fiche.**
- Kevin = admin, sur iPhone, PAS codeur : parler simple, liens cliquables, 1 clic max.

## 1. ⚠️ LA VOIE DE PUBLICATION QUI MARCHE (le point qui a fait perdre le plus de temps)

- **GitHub = BLOQUÉ (403 en lecture ET en écriture)** depuis le blocage du compte 9r4rxssx64-creator (24.08.2026). Ne pas s'acharner dessus tant que le compte n'est pas rétabli.
- **La voie réelle et PROUVÉE (v3.9→v3.13 publiées par elle)** : remote git `gitlab` → dépôt **gitlab.com/kdmc-group/Kdmc-project** (id 85753352), branche **main** → CI GitLab job `publier-site` → **Cloudflare Pages kdmc-site.pages.dev** (contenu servi à la racine ET sous /CMCteams/).
- Chaque commit sur `main` republie TOUT le site (~1,5 min). Docs seuls → mettre `[skip ci]` dans le message.
- Méthode sûre utilisée (historiques divergents) : commiter sur sa branche, puis `git checkout -B pub-arbre gitlab/main && git cherry-pick <sha> && git push gitlab HEAD:main`. Vérifier le job : API GitLab `/projects/85753352/pipelines?ref=main` → jobs → `publier-site = success`. **Ne pas dire « en ligne » avant le success.**
- Note honnête : une passation du 31.08 (session « Sarzance ») qualifiait GitLab de « fausse consigne » — c'était FAUX : cette voie publie réellement. Le point valable qui reste : le jeton GitLab a circulé en clair → **Kevin doit le faire tourner** (son action, personne d'autre ne peut).

## 2. VÉRIFS OBLIGATOIRES AVANT CHAQUE COMMIT ARBRE

```bash
# Syntaxe (bloquant)
node -e "const fs=require('fs');const h=fs.readFileSync('arbre/index.html','utf8');const b=[...h.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n');fs.writeFileSync('/tmp/a.js',b);" && node --check /tmp/a.js
# 0 lien cassé (pere/mere/conjoints → ids existants)
node -e "const h=require('fs').readFileSync('arbre/index.html','utf8');const ids=new Set([...h.matchAll(/id:\"(seed_[a-z_0-9]+)\"/g)].map(m=>m[1]));const refs=[...h.matchAll(/(?:pere|mere):\"(seed_[a-z_0-9]+)\"/g)].map(m=>m[1]);const r2=[...h.matchAll(/conjoints:\[([^\]]*)\]/g)].flatMap(m=>[...m[1].matchAll(/\"(seed_[a-z_0-9]+)\"/g)].map(x=>x[1]));const miss=[...new Set([...refs,...r2])].filter(r=>!ids.has(r));console.log(miss.length?'CASSES: '+miss:'OK '+ids.size+' fiches');"
```
- **JAMAIS inventer de généalogie.** Tout lien de parenté vient de KEVIN ou d'un ACTE — jamais d'une lecture de manuscrit par l'IA seule (l'erreur « v3.7 Magnani/Bauman inventée » puis « Hosmann mal lu » a coûté 2 corrections publiques).
- Jamais toucher `/index.html` racine (CMCteams, 258 employés).

## 3. ✅ DÉCISIONS FAMILLE TRANCHÉES PAR KEVIN LE 1.09.2026 (NE PLUS JAMAIS REVENIR EN ARRIÈRE)

- **Marielle MAGNANI** — MAGNANI = son **nom de jeune fille**. Fille de **Monique MAIFFRET × Jean Auguste Désiré MAGNANI** (les 3 prénoms ET le nom confirmés par Kevin). L'ancienne lecture « HOSMANN » du dessin = **erreur de déchiffrage**, corrigée partout (l'id technique `seed_jean_hosmann` reste, seul l'affichage a changé).
- Marielle **divorcée 2 fois** : de **David BAUMANN** et de **M. LADJ**.
- Enfants de Marielle : **Léa LADJ** (fille de M. LADJ) + **Noémie** (ajoutée ; père et nom de famille à préciser).
- **David BAUMANN n'est PAS le frère** de Jean-Marie/Marie-France (le dessin le rattachait à tort à la fratrie). Il est l'ex-mari de Marielle et le **père de Nadine BAUMANN** (mère de Nadine à préciser). Une seule fiche David (`seed_david_bauwmann`, détachée de Germaine).
- **Fratrie BEAUMELLE** (et non « Bauwmann ») : **Jean-Marie BEAUMELLE × Odile PINSON → Nicolas + Léa BEAUMELLE** ; **Marie-France BEAUMELLE**.
- Corrections antérieures toujours valables : Nicolas = fils de **Jean-Marie** (pas de Marielle) ; Jean-Marie marié à **Odile** (pas à Marielle).

## 4. ❓ QUESTIONS OUVERTES (à demander à Kevin ou aux archives — ne pas deviner)

1. **Vraie maman de Jean-Marie et Marie-France BEAUMELLE** — contradiction signalée dans la fiche de Rosa Germaine : le document familial la donne **décédée ENFANT le 13.03.1929** → elle ne peut pas être leur mère ; l'un des deux documents se trompe.
2. Mère de **Nadine BAUMANN**.
3. Père + nom de famille de **Noémie**.
4. Prénom de **M. LADJ** (illisible sur le dessin : « Sonia/Sami/Samir ? »).
5. **Marie-France BEAUMELLE** : sœur ou épouse de Jean-Marie ? (trait ambigu sur le dessin).
6. Les 8 sans nom de famille : Yvette · Michèle · Charlotte · Marie-France (compagne d'Émile) · Yvonne · Christine · Philippe · Laura.

## 5. 🔎 RECHERCHES VÉRIFIÉES LE 1.09.2026 (intégrées en v3.10, sources cliquables dans les fiches)

- **Victor SAUVAIGO** (grand-père maternel) : acte INSEE **relu en direct** — « Jean Marius Victor SAUVAIGO, né 12.07.1912 à Nice, † 9.09.1999 à Nice (87 ans) » ; prénom « Victor » du résistant **corroboré en ligne** (Commission d'histoire de l'occupation, BYU eudocs) ; **parution TV** : documentaire RMC Découverte « 39-45 : Les policiers dans la Résistance ». **Étape la plus rentable** : copie intégrale de l'acte de décès (Nice, n°4103, gratuit, service-public.fr F1444) → donnera ses PARENTS.
- **BRICCO** = piémontais *bric/bricco* « colline, sommet » (Monferrato/Langhe) — confirme l'origine Piémont.
- **BRANCALASSO** (honnêteté) : le seul patronyme documenté = famille de **Tursi, Basilicate** (barons d'Episcopia, 1766) — **pas** Piémont/Sardaigne ; à trancher par archives (Turin, ou Potenza/Matera). Rien d'inventé.
- **Outil auto** : `tools/gitlab/genealogie.sh` (job CI `genealogie`, variable `NAMES=nom1,nom2`) lit le fichier INSEE des décès via acte-deces.fr **depuis le runner CI** (l'agent est bloqué réseau). Déjà passé sur 21 noms de la famille.

## 6. HISTORIQUE DES VERSIONS DE CETTE SESSION

- v3.9 : version autoritaire Sarzance (118 fiches) republiée après retrait d'une intégration erronée.
- v3.10 : citations vérifiées (doc TV Victor, sens BRICCO, note Brancalasso/Tursi).
- v3.11 : Marielle MAGNANI + Noémie ajoutée + fratrie BEAUMELLE renommée.
- v3.12 : David BAUMANN = ex-mari (fiches fusionnées, détaché de la fratrie) ; contradiction Germaine 1929 signalée.
- v3.13 : Jean Auguste Désiré MAGNANI confirmé (prénoms + nom) — publié, `publier-site = success`.

## 7. OÙ SONT LES RAPPORTS COMPLETS (rien n'est perdu)

- `arbre/research/VICTOR-SAUVAIGO-CITATIONS-2026-09-01.md` — rapport complet citations/parutions Victor (toutes les URLs).
- `arbre/research/BRICCO-LEO-BRANCALASSO-2026-09-01.md` — rapport complet lignée italienne + sens des noms.
- `arbre/research/INSEE-DECES-21-NOMS-2026-09-01.md` — extraction INSEE brute des 21 noms de la famille.
- `arbre/RECHERCHES-EN-COURS.md` — plan de recherche par ancêtre (session Sarzance, toujours valable pour les archives).
- `KEVIN_ACTIONS_TODO.md` (racine) — les actions qui n'appartiennent qu'à Kevin (acte n°4103, jeton GitLab, GitHub).
- `LESSONS.md` #202-203 — les leçons de cette session (généalogie = Kevin/actes uniquement ; infra = preuve empirique).

*(Le plan de recherche détaillé par ancêtre reste dans `arbre/RECHERCHES-EN-COURS.md` — toujours valable pour les pistes d'archives.)*
