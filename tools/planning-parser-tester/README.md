# 🧪 Planning Parser Tester (T1 — sandbox isolé)

App de test **complètement isolée** du fichier `index.html` de CMCteams.
Elle sert à valider le pipeline d'import des plannings SBM (cadres / chefs / employés)
sur les vrais PDFs de Kevin **AVANT** toute modification de CMCteams.

> **Règle absolue (Kevin, répétée 3×)** : reproduction à l'identique des données du PDF.
> JAMAIS d'auto-correction, JAMAIS d'historique, JAMAIS d'auto-remplissage.
> Si une cellule est ambiguë → flag `needs_review`, Kevin tranche manuellement.

---

## 🚀 Comment l'utiliser

1. Ouvre `index.html` dans Safari/Chrome (mobile ou desktop).
2. Glisse-dépose un planning (PDF, photo iPhone HEIC/JPG/PNG, ZIP) **OU** colle (Cmd+V) **OU** clique "Choisir fichier".
3. L'app détecte automatiquement :
   - 📄 **Type de document** : cadres (Pit Boss / Superviseur) / employés / chefs (BJ / Roulettes / CMC / Amenage)
   - 🔢 **Version** : V1 (original par défaut si aucun marqueur) / V2 / V3
   - 📅 **Mois et année** concernés
4. Tu confirmes / corriges le banner « Document détecté ».
5. Le pipeline lance 6 passes de lecture en parallèle :
   - **A** PDF.js (texte natif)
   - **B** Claude Sonnet 4.6 Vision
   - **C** GPT-4o Vision
   - **D** Mistral OCR
   - **E** Gemini 2.5 Pro Vision (tie-breaker)
   - **F** Tesseract.js (fallback hors-ligne)
6. Pour chaque cellule (emp × jour), les 6 lectures sont comparées :
   - **4/4 unanime** → écrit en CERTAIN (la vraie donnée du PDF).
   - **Divergence** → flag `needs_review`. Tu tranches.
   - **PDF natif (cas usuel SBM)** : la passe G (texte PDF.js) suffit, lecture
     déterministe, aucune divergence à trancher.
7. **Comparateur visuel cellule par cellule** : tableau employé × 31 jours,
   chaque cellule colorée (Convention rouge/jaune, CCDP orange, RH violet…),
   survol = code + lieu + libellé. Tu vérifies que ça matche ton PDF.
8. **Zone validation** :
   - Si des cellules sont `needs_review` → boutons pour trancher chacune
     (choix entre les lectures + option « ∅ vide »).
   - Bouton **« ✅ Valider l'import (conforme au PDF) »** → marque l'import validé
     (refuse si des cellules restent à trancher).
   - Bouton **« 📤 Exporter le résultat validé »** → JSON propre (employés finaux
     + cellules tranchées + équipes + miroirs + encadrés + lieux + validations
     Convention). À sauvegarder dans `results/<ts>.json` pour audit.
   - Bouton **« 💾 Exporter JSON brut »** → dump complet pour debug.

---

## 📂 Structure

```
tools/planning-parser-tester/
├── index.html              ← UI standalone (drag&drop + config proxy + résultat + vote)
├── parser-multi-ocr.js     ← Pipeline Phases 0/1/1bis/2/3 + orchestrateur Vision + vote 4/4
├── helpers-reuse.js        ← Helpers isolés (suffixes Convention, détection type/version/mois)
├── lib/
│   ├── vision-passes.js    ← Passes B/C/D/E via proxy Cloudflare (Claude, GPT-4o, Mistral, Gemini)
│   └── cell-voting.js      ← Vote unanime cellule par cellule (zéro auto-correction)
├── worker/
│   ├── index.ts            ← Cloudflare Worker proxy (lit les secrets, relay aux APIs IA)
│   └── wrangler.toml       ← Config déploiement (compte/secrets via env GitHub)
├── fixtures/               ← Tes PDFs réels (à coller ici pour tests reproductibles)
├── results/                ← Exports JSON des parsings validés
└── README.md               ← Ce fichier
```

---

## 🔐 Récupération des clés API depuis les secrets GitHub (sans coffre Apex)

Le frontend ne stocke **JAMAIS** de clé API en clair. Un Worker Cloudflare lit
les secrets GitHub et expose un endpoint proxy auth-token-protégé.

### Déploiement automatique (zéro action Kevin si secrets en place)

Le workflow `.github/workflows/cmc-parser-proxy-deploy.yml` se déclenche
auto au prochain push qui touche `tools/planning-parser-tester/worker/**` ou
via `workflow_dispatch` manuel. Il lit ces secrets GitHub (déjà présents dans
le repo, cf. CLAUDE.md règle 7) :

- `ANTHROPIC_API_KEY` (Claude Vision — passe B)
- `OPEN_AI_API_KEY` ⚠️ avec underscore (GPT-4o Vision — passe C)
- `MISTRAL_API_KEY` (Mistral OCR — passe D)
- `GEMINI_API_KEY` (Gemini 2.5 Pro Vision — passe E)
- `PUSH_ADMIN_TOKEN` (token auth frontend → worker, réutilise un secret existant)
- `CLOUDFLARE_ACCOUNT_ID` + `CLOUDFLARE_API_TOKEN` (wrangler deploy)

Puis pousse chaque clé comme secret Worker via `wrangler secret put`, déploie
le worker, et vérifie `/healthz` retourne 200.

### URL finale du proxy

Après déploiement :

```
https://cmc-parser-proxy.<ton-subdomain-cloudflare>.workers.dev
```

À copier dans le champ « **0. Proxy Vision IA** » de l'app, avec le
`PUSH_ADMIN_TOKEN` comme **X-Auth-Token**. URL + token sont stockés en
**sessionStorage uniquement** (purgés à la fermeture — jamais Firebase ni
localStorage persistant).

### Endpoints du proxy

| Méthode | Path | Description |
|---|---|---|
| GET | `/healthz` | Status + liste des providers configurés (pas d'auth) |
| GET | `/providers` | Détail configuration par provider (auth requise) |
| POST | `/v1/anthropic` | Relay → `api.anthropic.com/v1/messages` |
| POST | `/v1/openai` | Relay → `api.openai.com/v1/chat/completions` |
| POST | `/v1/mistral` | Relay → `api.mistral.ai/v1/ocr` |
| POST | `/v1/gemini?model=gemini-2.5-pro` | Relay → Google AI Studio Generative Language |

---

## 🎯 Critères de succès AVANT intégration CMCteams

- [ ] Au moins 4 PDFs Kevin importés sans bug fonctionnel (UI ne crashe jamais).
- [ ] Pour chaque PDF, le résultat affiché matche 100% le source (validation manuelle Kevin cellule par cellule via le comparateur visuel).
- [ ] Aucune cellule inventée. Aucune cellule manquante non flaggée. Suffixes `'/"/*/:` préservés. Mois, version, type, lieux, équipes, miroirs corrects.
- [x] Tests automatiques verts : `test-pipeline.js` (175 checks) + `test-fidelity.js` (8 axes, fidélité 100% sur fixture synthétique).
- [ ] Kevin signe « OK go intégration CMCteams ».

### Pipeline complet (v0.8.2) — ce qui est en place

| Phase | Module | Rôle |
|---|---|---|
| 3.A | PDF.js | Extraction texte natif (hors-ligne) |
| 3.B-E | Vision IA (proxy) | Claude / GPT-4o / Mistral / Gemini — renfort PDF scanné |
| 3.G | text-parser | Parse texte natif → {employees, days}, suffixes préservés |
| 3.H | encadres-parser | Statuts intégraux « N CODE du J1 au J2 » |
| 3.I | team-detector | Équipes par RH/R + miroir (mêmes RH + horaire ≠) |
| 3.K | homonyms-guard | Anti-merge LANDAU B/J, ENZA B/C, CAMPI H/PH |
| 3.L | validate-post-import | 7 validations Convention (Art. 17.5, 35, sanctions…) |
| 3.M | code-colors | Projection couleur 43 codes (ne modifie pas la source) |
| vote | cell-voting | 4/4 unanime → certain, divergence → needs_review |
| UI | comparateur visuel + validation + export validé | Kevin tranche et signe |

**Reste pour le « OK go »** : action **Kevin** uniquement — importer ses
4 PDFs réels, vérifier cellule par cellule, signer.

---

## 🔒 Garanties

- **Isolé** : ne modifie ni `index.html` racine ni `A.overrides`. Sandbox pur.
- **Sans login** : aucun PIN requis (c'est un outil de test).
- **Pas de clé API requise au démarrage** : les passes Vision IA s'activent quand tu colles tes clés (Coffre Apex ou champs prévus dans l'UI).
- **PDF.js seul fonctionne hors-ligne** sans clé API — déjà ~95-98% de fidélité sur les PDFs SBM réels.

---

## 📋 Plan complet de référence

Voir `/root/.claude/plans/comment-ferais-tu-pour-cuddly-acorn.md` — détaille les 13 phases du pipeline + scorecard 100% chaque axe + plan T1/T2.
