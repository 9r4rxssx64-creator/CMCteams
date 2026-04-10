# 📌 Mémo de reprise — 2026-04-10 (v9.63 livrée)

> **Lire en PREMIER à chaque nouvelle session** avant toute autre action.

---

## 📊 Dernière version stable

**`APP_VER = "v9.63"`** — branche `claude/find-casino-project-vcUDZ` + `main`

---

## ✅ Livré cette session

### v9.62 — Multi-axe
- Bulles chat quasi-transparentes + textes soutenus (text-shadow)
- Fix iOS zoom auto (pointer:coarse)
- CSP élargie SBM + Wikimedia
- Upload modéré complet (employés → alerte admin → valide/rejette + on/off)
- PLANS_CMC + PLANS_CDP (9 salles + 4 zones)
- buildIASystemPrompt enrichi + max_tokens 4096
- vConvention onglet "Lieux" (CMC / CDP / Comparer)
- Galerie 75 photos SALON_PHOTOS + vGalerie()
- 15 tests unitaires

### v9.63 — Tool use IA custom (26 outils)
- 21 outils lecture : get_planning, search_employees, get_employee_info, get_stats, get_today_status, find_game_rooms, search_convention, get_team_roster, get_conflicts, get_upload_requests, get_who_is_free, get_leave_balance, get_all_teams, get_audit_log, get_online_users, get_monthly_summary, get_game_rules, get_salary_grid, get_absences, get_rotation_rules, get_documents
- 5 outils admin : set_planning_code, set_employee_team, admin_set_employee_field, admin_validate_upload, admin_reject_upload
- Audit ia_tool sur chaque appel

---

## 🔲 Prochaine version (v9.64+)

- **JEUX_SBM** : règles SBM Formation 2016 détaillées (6 docs reçus)
- **LOI_1103 + OS_8929 + AM_88_384** : cadre légal monégasque
- Nouveaux jeux manquants
- vConvention onglet Jeux enrichi (sub-tabs Express / SBM / Procédures)

---

*Dernière mise à jour : 2026-04-10 — v9.63 livrée*
