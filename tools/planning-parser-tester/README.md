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
7. Tu valides cellule par cellule via le comparateur visuel.
8. Bouton "Tout valider" → export `results/<ts>.json` pour audit.

---

## 📂 Structure

```
tools/planning-parser-tester/
├── index.html              ← UI standalone (drag&drop + résultat + comparateur)
├── parser-multi-ocr.js     ← Pipeline Phases 1-13 (multi-format + multi-OCR + audit)
├── helpers-reuse.js        ← Helpers isolés (suffixes Convention, détection famille, etc.)
├── fixtures/               ← Tes PDFs réels (à coller ici pour tests reproductibles)
├── results/                ← Exports JSON des parsings validés
└── README.md               ← Ce fichier
```

---

## 🎯 Critères de succès AVANT intégration CMCteams

- [ ] Au moins 4 PDFs Kevin importés sans bug fonctionnel (UI ne crashe jamais).
- [ ] Pour chaque PDF, le résultat affiché matche 100% le source (validation manuelle Kevin cellule par cellule).
- [ ] Aucune cellule inventée. Aucune cellule manquante non flaggée. Suffixes `'/"/*/:` préservés. Mois, version, type, lieux, équipes, miroirs corrects.
- [ ] Tests automatiques verts (vitest + Playwright sur les 4 fixtures).
- [ ] Kevin signe « OK go intégration CMCteams ».

---

## 🔒 Garanties

- **Isolé** : ne modifie ni `index.html` racine ni `A.overrides`. Sandbox pur.
- **Sans login** : aucun PIN requis (c'est un outil de test).
- **Pas de clé API requise au démarrage** : les passes Vision IA s'activent quand tu colles tes clés (Coffre Apex ou champs prévus dans l'UI).
- **PDF.js seul fonctionne hors-ligne** sans clé API — déjà ~95-98% de fidélité sur les PDFs SBM réels.

---

## 📋 Plan complet de référence

Voir `/root/.claude/plans/comment-ferais-tu-pour-cuddly-acorn.md` — détaille les 13 phases du pipeline + scorecard 100% chaque axe + plan T1/T2.
