# Apex v13.0 — Rebuild propre niveau entreprise commercialisable

## Status

🚧 **JET 1 EN COURS** — Foundations + cœur métier (cible 70/100)

Plan complet : `/root/.claude/plans/alors-nous-allons-faire-distributed-kay.md`

## Scope

Rebuild from scratch d'Apex AI (`apex-ai/index.html` v12.785 monolithe 3.3 MB → architecture modulaire ES6 propre v13.0).

### Pourquoi v13

- v12.785 : audit externe **9/100** (1897 catch silencieux, 191 innerHTML unsafe, 55+ setInterval zombies, 1016 helpers éparpillés)
- Kevin demande : commercialisable, 100/100 réel sur tous axes
- 3 chances max + 3 audits externes finaux

### À NE PAS toucher (CI gate `cross-app-preservation.yml`)

- `/index.html` racine (CMCteams)
- `/sw.js` racine
- `/tools/*`
- `/_PROJECTS_KDMC/*`
- `/messaging-app/*`
- `/services/*` (Cloudflare Workers — bumps OK, breaking NON)
- `.github/workflows/*` (ajout uniquement)
- Documents handoff (CLAUDE.md, NOTES_USER.md, MEMO_RESUME.md, etc.)

### Pendant le rebuild

- v12.785 reste en prod stable sur `/apex-ai/`
- v13.0 en parallèle sur `/apex-ai-v13/` (canary)
- Bascule via redirect `/apex-ai/` → `/apex-ai-v13/` SEULEMENT après 3 audits 100/100

## Architecture

```
apex-ai/v13/
├── index.html          (~30 KB shell minimal CSP nonce)
├── sw.js               (v13.0, pattern v12.785 préservé)
├── manifest.json
├── /assets/            (css, icons, fonts)
├── /core/              (bootstrap, store, router, di, logger, errors, memory, events)
├── /services/          (firebase, auth, vault, ai-router, voice, search, permissions, telemetry, push, cross-app, orchestrator)
├── /modules/           (9 modules ES6 réutilisés v12.785)
├── /features/          (chat, browser, 15 studios, 8 pro, admin, sentinels, settings, crypto, domotique, workflow)
├── /ui/                (modal-sheet, drilldown, animations, toast, hud-debug, rescue-button)
├── /workers/           (crypto, search-index, ocr — Web Workers off-main)
└── /migrations/        (migrate-v12-to-v13.ts)
```

## Stack

- **Build** : Vite 5 (statique, GitHub Pages compatible)
- **Lang** : TypeScript strict ESM
- **Style** : Tailwind CSS pré-build JIT (~30 KB gzipped)
- **Tests** : Vitest unit + Playwright E2E + axe-core a11y
- **Lint** : ESLint typescript-eslint strict + Prettier
- **CI** : Lighthouse CI + axe + semgrep + gitleaks + codeql + sonarcloud

## Priorités Kevin (ordre)

1. **Fonctionnel d'abord** (chat top, voice <200ms, stable)
2. **Pour Laurent + Kevin** (entre amis/famille)
3. **Plus tard** : commercialisation grand public + audits externes payants

## Plan 3 jets

| Jet | Cible audit | Effort | Périmètre |
|-----|------------|--------|-----------|
| 1 | 70/100 | 60-80h | Foundations : shell + core + services + chat MVP + migration data + dual-run |
| 2 | 90/100 | 100-130h | Voice + 5 providers + 15 studios + 8 pro + browser + 13 sentinelles + UX repensée |
| 3 | 100/100 | 60-80h | Sécu audit-grade + AI Safety + RGPD + perf budget + a11y AAA + docs |

## Migration data

Préservation Coffre + clés + mémoire CRITIQUE.

- Schémas Firebase préservés à l'identique
- LocalStorage : v13 lit clés v12.785 (`ax_*`) → copie nouveau namespace `apex_v13_*`
- Garde l'ancien intact 30j (rollback safe)
- Coffre : réchiffrement AES-GCM-256 si encore en AES-CBC

## Auto-géré 100%

Apex v13.0 doit être **autonome** :
- 13 sentinelles 24/7 + auto-fix whitelist
- Auto-update boot check + force reload
- Auto-backup quotidien + triple persistence
- Auto-test E2E + escalade `ax_claude_todo` Firebase
- Lessons learned auto-ajoutées à chaque fix

Kevin n'a JAMAIS besoin de :
- Re-saisir credentials
- Force-refresh manuel
- Vérifier que tout marche
- Lire les logs / debug

## Concurrence dépassée

Apex différencie sur :
- Voice latency <200ms (vs 300ms ChatGPT, 250ms Pi)
- Mobile-first PWA gesture-first (vs desktop-first Cursor/Replit)
- Privacy zero-knowledge + local-first (vs cloud-first Perplexity/Claude)
- Agent marketplace revenue-sharing 30% (vs ChatGPT credit-based)
- Accessibility AAA (vs concurrents qui ignorent a11y)
- Hybrid LLM orchestration (Claude reasoning + GPT code + Gemini vision + custom latency)

## Documentation

- Plan complet : `/root/.claude/plans/alors-nous-allons-faire-distributed-kay.md`
- Règles permanentes Kevin : `/CLAUDE.md` (37 règles + 52 lessons learned)
- Infos métier Kevin : `/NOTES_USER.md`
- Config partagée : `/MEMORY_PERSISTENT.md`
- Handoff Apex : `/APEX_HANDOFF.md`
