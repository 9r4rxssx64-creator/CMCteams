# Mémo de reprise — v9.284 (session bis étendue — 132 versions total sur 2 sessions)

> **Lire en PREMIER à chaque nouvelle session.**
> Puis `NOTES_USER.md`, `~/.claude/CLAUDE.md`, `CHANGELOG.md`.

---

## Dernière version stable

**`APP_VER = "v9.284"`** — branche `main`

- Session 1 (matin 2026-04-17) : v9.153 → v9.202 (50 versions, moyenne audit externe 6.62 → 8.50)
- Session 2 (après-midi/soir 2026-04-17 à 2026-04-18) : **v9.203 → v9.284 (82 versions, 19 PRs mergées)**

## 🎯 Modules majeurs session bis (v9.203-284)

### 🎰 Pit boss live (v9.211+)
- `vPit` : gestion tables ouvertes avec couverture/compétences
- Auto-assign compétence + GPS
- Auto-rotation cron 60s + opt-out
- Ghost alerts (emps détectés non assignés > 2min)

### 📍 Coord GPS tables (v9.223+)
- `cmc_table_coords` : {id, name, jeu, jeux[], lat, lng, salon}
- Admin capture position via bouton
- `detectEmpAtTable(pos)` seuil 4m + accuracy
- Dots tables sur carte admin

### 🕰 Heures effectives (v9.224+)
- `calcEffectiveHours(uid, dateTs)` — déduction pre/post-shift + coupure 16/3 stricte
- `vHeuresShift` jour + `vDashboardHeures` mensuel
- Export CSV jour + mois + dashboard conformité

### 📢 Notifs temps réel pit → employés (v9.233+)
- `sendPitMessage` : DM chat + notif push si arrière-plan
- Types : assign, break, fin_service, rotation, rotation_auto, convoc_*, flip, realloc_out
- Presets convocation : visite_medicale, habillement, rh, formation, pitboss, annonce
- Groupes : individual, present, all, team:X
- Bannière in-app `_checkPitBanner` avec TTS
- Ack + réactions emoji (✅ 👍 ⚠️ ⏳ ❌ 🙅)
- Badge pulsant topbar si pending

### 🧩 Solveur staffing + dernier call (v9.265+)
- `pitSolveStaffing` : algo allocation par score (compétence + chef + senior)
- `pitApplyStaffingPlan` : applique auto, notif emps retirés/ajoutés
- `pitDeclareLastCall` : bloque nouvelles ouvertures jusqu'à 14h lendemain

### 🔁 Tables réversibles (v9.268+)
- `cmc_table_coords[].jeux = ["bj","punto"]` (1 ou plus)
- `pitFlipTable` : change jeu en cours + notif + re-calibre rotDurMin
- Auto-rebalance si emps incompatibles (confirm prompt)
- UI multi-select jeux (checkboxes)

### 🗺 Plan d'implantation évolutif (v9.274+)
- `vPlanImplantation` : SVG 800×500 par établissement (CMC, Café, CDP, Sun)
- Drag & drop tables (position en % viewBox, responsive)
- Image de fond uploadable par URL
- Lien Google Maps par adresse
- Icônes créatives par jeu : ♠ ● ○ ♣ ♦ 🎲 ♥
- `autoPlacePlanFromGPS` : min-max normalization lat/lng → %
- Dots live pulsants 🟢 sur tables ouvertes
- Stats par salon (compteur + ouvertes live)
- Salons custom par établissement (ajout/suppression)
- **Clic sur table = ouvrir/fermer live** (mode consult)

## 📋 PRs mergées session bis

| PR | Titre | Versions |
|----|-------|----------|
| #20 | Coord tables GPS + heures effectives | v9.223-224 |
| #21 | CSV export + auto-assign GPS + dashboard heures | v9.225-227 |
| #22 | Lien table physique + ghost alerts | v9.228-229 |
| #23 | Ghost watcher + notifs temps réel emp + convocations | v9.230-237 |
| #24 | Ack emp + bannière in-app + rotation notif | v9.238-240 |
| #25 | Auto-rotation cron + dashboard pit boss | v9.241-243 |
| #26 | Export CSV ack + alerte conformité + docs | v9.244-246 |
| #27 | Historique session + fil emp + badge topbar | v9.247-249 |
| #28 | Tests unitaires notifs + notes | v9.250-251 |
| #29 | Notif push + auto-assign GPS + emoji feedback | v9.252-254 |
| #30 | Stats réactions + timer emp | v9.255-256 |
| #31 | **Fixes audit externe** (coupure 16/3 + races) | v9.257-259 |
| #32 | Polish UX (responsive + a11y) | v9.260-262 |
| #33 | Solveur staffing + dernier call + tests | v9.263-267 |
| #34 | Tables réversibles + flip | v9.268-270 |
| #35 | Datalist salons + auto-rebalance | v9.271-273 |
| #36 | Plan implantation évolutif casino+café | v9.274-277 |
| #37 | Plan ↔ GPS sync + live status + stats salon | v9.278-280 |
| #38 | Plan interactif (clic live + salons custom) | v9.281-283 |

## 🔑 Clés Firebase ajoutées session bis

| Clé | Sync | Usage |
|-----|------|-------|
| `cmc_table_coords` | FB_FIX | Coord GPS tables |
| `cmc_timings` | FB_FIX | Timings shift |
| `cmc_known_identities` | FB_FIX | Historique permanent identités |
| `cmc_positions` | FB_FIX | Positions live emps (rolling 48h) |
| `cmc_plan_positions` | FB_FIX | Positions visuelles tables plan |
| `cmc_plan_bg_images` | FB_FIX | Images de fond plan |
| `cmc_custom_salons` | FB_FIX | Salons custom par établissement |
| `cmc_ghost_log` | FB_LOCAL | Historique détections ghost |
| `cmc_auto_rotation_off` | FB_LOCAL | Opt-out auto-rotation |
| `cmc_auto_assign_gps` | FB_LOCAL | Opt-in auto-assign GPS |

## 🔍 Règles permanentes actives

- **Vérification 10 sources minimum** pour toute info factuelle
- **Merge autonome** quand CI Vercel green
- **Audit externe** via subagents Explore avant chaque batch majeur
- **Tests unitaires** après chaque nouvelle feature dans runTests()
- **esc() partout** sur données user avant innerHTML
- **Guards admin** `if(!A.user||A.user.id!==AID)return;` sur fonctions destructrices

## ⏳ Roadmap futurs

- **App native** (ROADMAP_NATIVE_APP.md) : ~15-20k€, 2 mois (géoloc 24/7)
- Module paie complet (Article 13 Convention + cagnottes par jeu)
- Intégration SI SBM externe
- Multi-langue IT/EN complet
- Export PDF planning signé

## ⏳ Actions Kevin hors code

- Nettoyage Vercel (kdmc-bot-2026)
- Token Telegram / secrets GitHub Actions
- Créer repos IA-KDMC + e-KDMC
- Valider budget app native si souhait 24/7 strict

---

*Dernière mise à jour : 2026-04-18 — v9.284 (132 versions total, 19 PRs mergées session bis, modules pit boss/coord GPS/heures effectives/notifs/plan implantation complets)*
