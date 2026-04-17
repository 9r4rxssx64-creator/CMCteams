# Mémo de reprise — 2026-04-17 (v9.157 livrée)

> **Lire en PREMIER à chaque nouvelle session.**
> Puis lire `NOTES_USER.md` (méta-règles admin + infos métier).
> Puis `~/.claude/CLAUDE.md` (règles globales multi-projets).
> **⚠️ AUSSI lire `TODO_REMINDERS.md`** — tâches en attente que Kevin a demandées.

---

## Dernière version stable

**`APP_VER = "v9.157"`** — branche `claude/resume-work-9OVV4` (à merger sur `main` pour déploiement)

### Session 2026-04-17 (2e vague) — 5 versions livrées (v9.153 → v9.157)

| Version | Contenu |
|---------|---------|
| v9.153 | Filter chips familles en haut de vPlan + Inline edit double-clic (mode brosse) |
| v9.154 | Live presence avatars (vPlan/vDeparts/vEmps) + Sparkline 12 mois (vEmps) + getRoleIcon |
| v9.155 | Heatmap densité 12 mois dans vStats + Bulk select Shift+Click (admin vPlan) |
| v9.156 | Drag & drop cellules admin (swap par défaut, Ctrl/Meta = copier) |
| v9.157 | Fix perf sparkline (cache par render + fenêtre A.year-1→A.year) + guard cellDragEnd |

### Audit subagent final

| Niveau | Finding | Action |
|--------|---------|--------|
| P0 | — | — |
| P1 | Perf sparkline calcStats carrière × 258 emps | ✅ Corrigé v9.157 (cache + scope réduit) |
| P1 | cellDragEnd sans guard AID | ✅ Corrigé v9.157 |
| P2 | Shift+Click pas dispo sur mobile tactile | ⚠️ Documenté (long-press futur) |
| P2 | iOS HTML5 DnD < 13 non documenté | ⚠️ Documenté (iOS récent OK) |

---

## 🎯 Capacités ajoutées

- **Filter chips famille** : bande haut de vPlan, toggle unique, compteur actifs par famille
- **Mode brosse admin** : double-clic sur cellule = applique le dernier code choisi (propagation ultra-rapide)
- **Live presence dots** : cercle vert pulsant à côté des noms en ligne (vPlan, vDeparts, vEmps)
- **Sparkline 12 mois** : SVG vert/rouge dans chaque ligne employé (trav vs abs)
- **Heatmap annuelle** : grille 12×31 dans vStats avec 5 niveaux de vert selon charge
- **Bulk select Shift+Click** : sélection multi-cellules, bandeau bleu avec actions groupées
- **Drag & drop cellules** : swap codes (HTML5 DnD), Ctrl/Meta = copier

---

## ⏳ En attente (voir TODO_REMINDERS.md)

1. **Superviseurs PDF tronqué** : warning déjà dans vImport, attendre import test réel
2. **Actions Kevin (non-code)** :
   - Nettoyage Vercel (garder `kdmc-bot-2026`)
   - Régénération token Telegram (@BotFather)
   - 4 secrets GitHub Actions à ajouter
   - Backup chiffré tokens (3-2-1)
3. **Repos satellites** : IA-KDMC + e-KDMC (stubs `_PROJECTS_KDMC/` présents, à créer sur GitHub)
4. **Features mobiles** :
   - Fallback long-press pour bulk select (Shift n'existe pas tactile)
   - Polyfill HTML5 DnD pour iOS anciens

---

*Dernière mise à jour : 2026-04-17 — v9.157*
