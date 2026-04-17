# 🗓 TODO — Tâches à faire bientôt

> **Lecture obligatoire à chaque session par Claude.**

---

## ✅ FAIT SESSION 2026-04-17 (3e vague, v9.153→v9.164)

### Features UX / Admin
- [x] Filter chips familles + code (top 6) dans vPlan
- [x] Recherche rapide employé dans vPlan
- [x] Mode brosse admin (dbl-clic = applique dernier code)
- [x] Bulk select multi-cellules (Shift+Click desktop + long-press mobile)
- [x] Drag & drop cellules (swap/copy) + drag vers sélection
- [x] Live presence avatars (vPlan/vDeparts/vEmps)
- [x] Widget "En ligne" dans vAccueil (clic = viewAs admin)
- [x] Sparkline 12 mois cliquable dans vEmps
- [x] Heatmap annuelle cliquable dans vStats
- [x] Bandeau conflits auto-détection en haut vPlan
- [x] Badge rôle cadres (♊/🔍/🔎) dans colonne nom
- [x] Bouton "Aujourd'hui" + impression (CSS print dédié)

### Sécurité + Perf
- [x] Fix P0 XSS emp.id via JSON.stringify (onclick inline protégés)
- [x] Guards AID sur cellTouchStart/End/Cancel + cellDragEnd
- [x] Cache sparkline par render (-90% itérations sur vEmps 258 emps)
- [x] Opacity `.code-dim` relevée pour lisibilité mobile

---

## ✅ FAIT SESSION 2026-04-17 (vagues antérieures, v9.133→v9.152)

- [x] Constitution monégasque + sécurité + import 9 fallbacks + tutoriel
- [x] Audit expert 3 subagents
- [x] Ménage sessions + sync Firebase bidirectionnel

---

## 🟡 PRIORITÉ HAUTE (prochaine session)

### 1. Superviseurs import
Le texte PDF est tronqué au copier-coller. Warning déjà présent dans vImport.
Attendre test réel par Kevin.

### 2. Actions côté Kevin (hors code)
- Nettoyage Vercel (garder `kdmc-bot-2026`)
- Régénération token Telegram via @BotFather
- Ajouter 4 secrets GitHub Actions
- Backup chiffré tokens (règle 3-2-1)

### 3. Créer repos satellites
- IA-KDMC (stub dans `_PROJECTS_KDMC/IA-KDMC/CLAUDE.md`)
- e-KDMC (stub dans `_PROJECTS_KDMC/e-KDMC/CLAUDE.md`)

---

## 🟢 AMÉLIORATIONS FUTURES

- [ ] Export CSV planning mois complet (admin)
- [ ] Undo/Redo bulk operations (Ctrl+Z sur groupe d'opérations)
- [ ] Keyboard navigation cellules (flèches, Space, Delete)
- [ ] Heatmap par équipe (pas juste globale)
- [ ] Sparkline accumulée/tendance (pas juste mois par mois)
- [ ] Filter chips équipes (36 chips scrollables)
- [ ] Inspecteurs : séparer en équipe dédiée (si Kevin le demande)
- [ ] Annotations libres par jour (notes admin)
- [ ] Rappels "planning à vérifier" par email/SMS

---

*Dernière mise à jour : 2026-04-17 — v9.164 (12 versions livrées ce jour)*
