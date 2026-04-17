# Mémo de reprise — 2026-04-17 (v9.198 livrée — 46 versions session)

> **Lire en PREMIER à chaque nouvelle session.**
> Puis `NOTES_USER.md`, `~/.claude/CLAUDE.md`, `TODO_REMINDERS.md`, `AUDIT_EXTERNE_2026-04-17.md`.

---

## Dernière version stable

**`APP_VER = "v9.198"`** — branche `claude/resume-work-9OVV4`

### Session 2026-04-17 — **46 versions livrées (v9.153 → v9.198)**

## 📊 Notes externes consolidées (10 audits)

| Agent | v9.190 | v9.193 | v9.198 |
|-------|--------|--------|--------|
| Sécurité | 6.5 | 7.8 | 7.8 |
| Performance | 6.5 | 7.5 | 7.5 |
| UX / a11y | 6.8 | 7.4 | 7.4 |
| Code / fonctionnalité | 6.8 | 7.9 | 7.9 |
| **Benchmark concurrence** | 6.5 | 9.0 | **9.9** |
| **Moyenne** | **6.62** | **7.92** | **8.10** |

### v9.198 gain final
- Benchmark passe de 9.0 à **9.9/10** grâce aux 4 modules niche livrés
- **"Plafond fonctionnel atteint pour un produit non-intégré SI SBM"** (auditeur externe)
- Les 4 autres axes restent sur les trade-offs SPA monofichier assumés

## 🏆 4 modules niche livrés (propositions #1, #2, #3, #7 benchmark)

### v9.195 Module Événements Monaco
- 6 événements récurrents SEED (GP F1 +50%, EPT +60%, Tennis +25%, Festival été +40%, Fêtes +35%, Fête Nationale +30%)
- `renderEventBanner()` bandeau vAccueil si actif ou J-14
- `vEvents()` panneau admin CRUD

### v9.196 Module Cagnottes & %CA (Article 13)
- `JEUX_CA` : 8 jeux (BJ, Roulettes A/E, Punto/HR, Craps, Hold'em, Poker Cash)
- `calcCagnotteSplit()` : répartition proportionnelle aux shifts
- `renderMyCagnotteCard()` : widget employé vAccueil
- `vCagnottes()` : panneau admin saisie CA + récap

### v9.197 Multi-Casino SBM
- 4 établissements : CMC + CDP + Sun + Monte-Carlo Bay
- Filtre UI actif (localStorage persistent)
- `vCasinos()` panneau admin avec stats par étab

### v9.198 Bulletin paie pré-visualisé unifié
- `showBulletinPaie(empId)` : modal récap (fixe + cagnotte + %CA + jours détaillés)
- Consolide calcSalaireSBM + calcCagnotteSplit
- Bouton Imprimer intégré

## 📈 Plan global 46 versions

| Batch | Versions | Thème |
|-------|----------|-------|
| 1 | v9.153-157 | UX admin + data viz |
| 2 | v9.158-164 | Extensions + fix P0 |
| 3 | v9.165-173 | Features dépasse concurrence |
| 4 | v9.174-183 | Premium novateur |
| 5 | v9.184-189 | Vers 10/10 (PWA, snapshots, paie, keyboard nav) |
| 6 | v9.190-194 | Audits externes + améliorations post-audit |
| 7 | v9.195-198 | Modules niche SBM (4 propositions benchmark) |

## 🔍 Règle permanente active

**Vérification 10 sources minimum** pour toute info factuelle (voir NOTES_USER.md).
Appliquée lors de l'intégration de l'indice Monaco v9.186.

## ⏳ Gaps résiduels au 10/10 parfait

### Côté technique (trade-offs SPA monofichier assumés)
- Chiffrement AES-GCM des `clear` passwords (~3h)
- Event delegation → CSP SHA256 (~2h)
- `dcView()` granular Virtual-DOM-like (~2h)

### Côté niche (0.1 pt du 10/10)
- Intégration SIRH SBM (dépend partenariat externe)
- Module pourboires automatique terminal caisse (hors scope SBM)

### Actions Kevin (hors code)
- Nettoyage Vercel (garder kdmc-bot-2026)
- Régénération token Telegram
- 4 secrets GitHub Actions
- Repos IA-KDMC + e-KDMC

---

*Dernière mise à jour : 2026-04-17 — v9.198 (46 versions, 11 audits, moyenne externe 8.1/10, benchmark niche 9.9/10)*
