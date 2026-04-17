# 🗓 TODO — Tâches à faire bientôt

> **Lecture obligatoire à chaque session par Claude.**

---

## ✅ FAIT SESSION 2026-04-17 (2e vague, v9.153→v9.157)

- [x] Filter chips familles en haut de vPlan (toggle mutuel, compteur actifs)
- [x] Inline edit double-clic = applique le dernier code (mode brosse)
- [x] Live presence dots dans vPlan/vDeparts/vEmps (cercle vert pulsant)
- [x] Sparkline SVG 12 mois dans chaque ligne employé (vEmps)
- [x] Heatmap densité planning 12×31 dans vStats (5 niveaux, tooltip)
- [x] Bulk select Shift+Click admin avec bandeau action (Appliquer/Vider)
- [x] Drag & drop cellules admin (swap / Ctrl-copy)
- [x] Fix perf sparkline (cache par render, -90% d'itérations)
- [x] Audit subagent P0/P1 : 2 P1 corrigés immédiatement

## ✅ FAIT SESSION 2026-04-17 (1ère vague, v9.133→v9.152)

- [x] Constitution monégasque + sécurité + import 9 fallbacks + tutoriel onboarding
- [x] Audit expert 3 subagents (30 findings, P0/P1 corrigés)
- [x] Ménage sessions + branche feature supprimée

---

## 🟡 PRIORITÉ HAUTE (prochaine session)

### 1. Superviseurs import
Le texte PDF est tronqué au copier-coller (section SUPERVISEUR coupée).
Warning déjà dans vImport. Attendre test réel par Kevin.

### 2. Actions côté Kevin (non-code — à faire via comptes)
- Nettoyer Vercel (garder `kdmc-bot-2026`)
- Régénérer token Telegram via @BotFather
- Ajouter 4 secrets GitHub Actions
- Backup chiffré tokens (règle 3-2-1)

### 3. Créer repos satellites
- IA-KDMC (stub dans `_PROJECTS_KDMC/IA-KDMC/CLAUDE.md`)
- e-KDMC (stub dans `_PROJECTS_KDMC/e-KDMC/CLAUDE.md`)

### 4. Mobile UX — perte Shift+Click
- Ajouter fallback **long-press** sur mobile pour bulk select cellules
- Tester drag & drop sur iOS ≥13 (devrait fonctionner)

---

## 🟢 AMÉLIORATIONS FUTURES

- [ ] Filter chips équipes (36 chips scrollables)
- [ ] Filter chips codes (highlight cellules par code)
- [ ] Heatmap cliquable (clic jour → ouvre détail journalier)
- [ ] Sparkline cliquable (ouvre stats mois au clic sur barre)
- [ ] Live presence avatars photos (au lieu de cercle simple)
- [ ] Intégration role "inspecteur" distincte (pour l'instant merge pit boss)
- [ ] Drag & drop multi-sélection (glisser toute une sélection d'un coup)

---

*Dernière mise à jour : 2026-04-17 — v9.157*
