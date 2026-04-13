# Mémo de reprise — 2026-04-13 (v9.108 livrée)

> **Lire en PREMIER à chaque nouvelle session.**
> Puis lire `NOTES_USER.md` (méta-règles admin + infos métier).

---

## 🚨 Méta-règles admin (appliquer SANS que l'admin ait à redemander)

1. Chaque info métier admin → enregistrée IMMÉDIATEMENT dans `NOTES_USER.md`
2. Chaque nouvelle fonction = auto + sur-vérif + bouton manuel de secours
3. Priorité absolue = reconnaissance + placement correct à CHAQUE import PDF
4. Compétences `emp.post` = persistantes (plus jamais écrasées au reload — v9.108)
5. Secteurs dérivés auto : E → Européen · P/P+ rose → Groupe ouvert · P/P+ → Baccara
6. Clé API Anthropic : backup Firebase auto + restore à la connexion (v9.108)
   - Console : https://console.anthropic.com/settings/keys
7. Tout s'enchaîne automatiquement (stats, vues, IA context suivent les modifs)

---

## Dernière version stable

**`APP_VER = "v9.108"`** — branche `main` (déployée GitHub Pages)

---

## 📋 Fichiers documentation à JOUR

| Fichier | Rôle |
|---------|------|
| `CLAUDE.md` | Guide assistant IA (règles, workflow, erreurs connues) |
| `NOTES_USER.md` | **Infos métier admin** (couleurs PDF, tables, horaires rôles, vision IA…) |
| `CHANGELOG.md` | Historique complet versions |
| `MEMO_RESUME.md` | État courant (ce fichier) |
| `README.md` | Vitrine projet |

---

## 🚀 Session nuit du 12 au 13 avril 2026

### Livré (v9.100 → v9.103)

| Version | Contenu |
|---------|---------|
| **v9.100** | Audit expert 4 subagents → 7 corrections P0/P1 (guards admin, FB_LOCAL, hashV2, touch targets, Escape, undo stacks) |
| **v9.101** | **URGENT** Fix crash Safari iOS `SyntaxError: Invalid escape` (3 onclick inline + null guards) + lisibilité textes ↑ |
| **v9.102** | Auto-vérification AUTOMATIQUE post-import (pas de bouton) + 5 outils IA sur-vérification (deep/compare/coherence/super) |
| **v9.103** | **Couleurs CODES calibrées** sur le PDF SBM original (screenshots fournis par admin) |

### Tests finaux
- **54/54 E2E PASS** sur 6 devices en ~29s
- 0 erreur runtime
- 32 versions livrées depuis v9.70 (v9.71 → v9.103)

---

## 🎯 Capacités actuelles

- **76 outils IA** (24 admin) — langage naturel complet
- **17 sujets aide `?`** contextuelle
- **43 actions** command palette ⌘K
- **Undo/Redo** ⌘Z global
- **Backup auto** quotidien + rotation 7j
- **Preview/Rollback import** SHA-256
- **Auto-vérification** post-import (bandeau + toast)
- **Dashboard LIVE** + Mode TV
- **Dark/Light/Auto** theme
- **IndexedDB** wrapper
- **Password gen + strength**
- **Error + Perf monitoring**
- **Réactions emojis chat**
- **Hash v2** sel dynamique
- **Circuit breaker Firebase** (5 échecs/60s cooldown)
- **PWA** Badge/Share/WakeLock/Shortcuts
- **Accessibilité AAA** (skip-link, ARIA, high contrast, font scaler)
- **Couleurs PDF SBM** calibrées

---

## ⏳ En attente d'inputs admin

Voir `NOTES_USER.md` pour détails :

1. **Horaires inspecteur/superviseur/pitboss** : structure `ROLE_SHIFTS` prête, attend codes exacts
2. **Plans casino + numéros tables + jeux** : gestion tables amovibles, salons (Atrium…)
3. **Couleurs affinées** : si les couleurs actuelles ne matchent pas à 100%, l'admin envoie nouveau screenshot

---

## 🔒 Règles permanentes (voir CLAUDE.md)

1. **§1** — TodoWrite obligatoire pour chaque demande
2. **§1bis** — UX : simple, visuel, ludique, compréhensible (icônes/emojis, tooltips, aide `?`)
3. **§1ter** — NOTES_USER.md : enregistrer IMMÉDIATEMENT toute info métier donnée par l'admin
4. **§Outils expert** — boîte à outils pour sessions futures
5. **§Erreurs connues** — 23 pièges documentés à ne JAMAIS refaire

---

## 🧪 Workflow testing

```bash
# Tests E2E locaux (6 devices, ~29s)
node tools/tests/e2e.test.js

# Validation syntaxe JS
node -e "const fs=require('fs');const h=fs.readFileSync('index.html','utf8');const s=h.lastIndexOf('<script>'),e=h.lastIndexOf('</script>');fs.writeFileSync('/tmp/t.js',h.slice(s+8,e));" && node --check /tmp/t.js

# Taille fichier
wc -c index.html   # ~1.24 MB actuellement

# Git status + log récent
git status && git log --oneline -10
```

---

## 🔮 Prochaines pistes

### Priorité haute (attend inputs)
- Horaires inspecteur/superviseur/pitboss (codes)
- Plans casino tables amovibles

### Améliorations continues possibles
- i18n étendu (EN/IT/DE complets) + traduction chat via IA
- Export PDF planning individuel (via window.print + CSS @media print)
- QR code partage planning
- Drag & drop planning (shifts)
- Bulk actions UI (checkbox selection)
- Notifications push serveur-less
- Onboarding interactif complet

---

*Dernière mise à jour : 2026-04-13 — v9.103*
