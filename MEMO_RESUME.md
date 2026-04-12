# Mémo de reprise — 2026-04-12 (v9.100 livrée)

> **Lire en PREMIER à chaque nouvelle session.**

---

## Dernière version stable

**`APP_VER = "v9.100"`** — ~1.15 MB — branche `main` (déployée GitHub Pages)

---

## 🎯 Session ultime : 30 versions livrées (v9.71 → v9.100)

**v9.99** : Docs (CHANGELOG, MEMO, CLAUDE à jour)
**v9.100** : **Audit expert 4 subagents** → 7 corrections appliquées
- 4 P0 (guards toggleTVMode/showSyncQueueUI/_showImportDiff, FB_LOCAL complet, vDebug touch targets)
- 3 P1/P2 (hashPwV2 admin_set_password, Escape universel modals, undo stacks viewAs)
- **54/54 E2E PASS** (6 devices, 28.6s) → aucune régression

---

## Session épique : 28 versions livrées (v9.71 → v9.98)

### 🎯 Capacités finales

| Catégorie | Features |
|-----------|----------|
| **IA** | 71 outils (24 admin) • Mode proactif • Auto-diagnostic • Générateur mdp |
| **Sécurité** | Hash v2 sel dynamique • Device fingerprint • Circuit breaker • Proxy template |
| **Import** | Preview/Rollback/SHA-256 • Matching Levenshtein + Metaphone • Validation sommes |
| **UX** | Command palette ⌘K • Undo/Redo ⌘Z • Aide `?` (16 sujets) • Dark/Light/Auto |
| **Performance** | IndexedDB wrapper • Lazy-loader • Throttle • Error/Perf monitoring |
| **A11y AAA** | Skip-link • ARIA landmarks • High contrast • Font scaler • Reduce motion |
| **Resilience** | Retry jitter • Circuit breaker 5/60s • Sync queue UI • Offline-first |
| **PWA** | Badge API • Web Share • Wake Lock • Shortcuts long-press |
| **Dashboard** | LIVE temps réel • Mode TV grand écran • Release notes in-app |
| **Tests** | E2E Playwright 54 tests × 6 devices • CI/CD GitHub Actions |

### 📁 Fichiers livrés

- `index.html` — app principale (v9.98, ~1.15 MB)
- `manifest.json` — PWA avec 4 shortcuts
- `firebase-rules.json` — template Firebase Security Rules
- `proxy-anthropic-cloudflare.js` — template proxy sécurisé IA
- `tools/tests/e2e.test.js` — suite de tests E2E automatisés
- `tools/video/` — pipeline génération vidéo
- `.github/workflows/tests.yml` — CI/CD
- `CMCTeams_Demo.mp4` — vidéo de démo (1:33, 1080p)
- `CLAUDE.md` / `CHANGELOG.md` / `README.md` — docs

---

## Workflow testing

```bash
# Tests E2E locaux (6 devices, ~30s)
node tools/tests/e2e.test.js

# Validation syntaxe JS
node -e "const fs=require('fs');const h=fs.readFileSync('index.html','utf8');const s=h.lastIndexOf('<script>'),e=h.lastIndexOf('</script>');fs.writeFileSync('/tmp/t.js',h.slice(s+8,e));" && node --check /tmp/t.js

# Taille fichier
wc -c index.html
```

---

## Prochaines pistes (v9.99+)

### Priorité haute (demandé par utilisateur, attend inputs)
- **Tables casino amovibles** : quand plans + numéros + jeux fournis
- **Horaires inspecteur/superviseur/pitboss** : quand les codes sont fournis

### Améliorations continues
- i18n étendu (EN/IT/DE complets) + traduction chat via IA
- Export PDF planning individuel (via window.print + CSS @media print)
- QR code partage planning
- Drag & drop planning (shifts)
- Bulk actions UI (checkbox selection)
- Notifications push serveur-less
- Onboarding interactif complet

### Si scale
- Migration Firebase Auth + custom tokens
- Backend Cloudflare Workers + D1 (si > 10k users)
- Multi-tenancy (si plusieurs casinos)

---

## Règles permanentes (ne jamais oublier)

Voir `CLAUDE.md` sections :
- **§1bis UX** : tout doit être simple/visuel/ludique/compréhensible
- **§Outils & réflexes expert** : boîte à outils pour sessions futures
- **§Erreurs connues** : 23 pièges documentés à ne JAMAIS refaire

---

*Dernière mise à jour : 2026-04-12 — v9.98 • 28 versions livrées • 54/54 E2E PASS*
