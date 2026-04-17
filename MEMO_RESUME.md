# Mémo de reprise — 2026-04-17 (v9.251 livrée — 98 versions total en 2 sessions)

> **Lire en PREMIER à chaque nouvelle session.**
> Puis `NOTES_USER.md`, `~/.claude/CLAUDE.md`, `TODO_REMINDERS.md`, `CHANGELOG.md`.

---

## Dernière version stable

**`APP_VER = "v9.251"`** — branche `main`

### Session 2026-04-17 bis — **49 versions livrées (v9.203 → v9.251)**

En plus des 50 versions du matin (v9.153 → v9.202), nouvelle session l'après-midi avec Kevin qui a demandé :
- Géolocalisation continue (app ouverte + Wake Lock + keep-alive)
- Vue pit boss (gestion opérationnelle tables live)
- Identités permanentes
- Timings shift (change habit / pause / coupure)
- Coord GPS tables + auto-détection
- Heures effectives (déduction tampons + coupure 16/3)
- **Notifs temps réel pit boss → employés** (assign table, break, fin service, convocations, rotation)
- Accusé de réception + dashboard conformité + export CSV

## 🎯 Modules majeurs livrés session bis

### 🎰 vPit — Gestion live Pit Boss (v9.211+)
- Tables ouvertes avec couverture emps / compétences
- Auto-assign par compétence + GPS
- Rotation auto toutes 60s si expirée
- Ghost alerts (emps détectés non assignés)
- Historique session `vPitHistory`
- Dashboard conformité `vPitDashboard` avec 4 KPIs + toggle auto-rotation
- Export CSV stats ack pour audit RH

### 📍 Coord GPS tables (v9.223)
- `cmc_table_coords` : {id,name,jeu,lat,lng,salon,updatedAt}
- Admin capture position avec bouton "ma position actuelle"
- `detectEmpAtTable(pos)` seuil 4m + accuracy GPS
- Dots tables (losange doré) sur carte admin `_renderGeoSvg`
- Lien avec tables live (`pitAction("linkPhys")`)

### 🕰 Heures effectives (v9.224)
- `calcEffectiveHours(uid, dateTs)` déduction pre/post-shift (change habit)
- Détection auto coupure 16/3 (gap ≥ 1h entre 20h-22h)
- `vHeuresShift()` jour par jour + `vDashboardHeures()` mensuel
- Export CSV jour + mois avec récap par employé
- Barre progression vs temps contractuel

### 📢 Notifs temps réel employés (v9.233-240)
- `sendPitMessage(uid, text, type)` insère DM + déclenche bannière + TTS
- 7 types : assign, break, fin, rotation, rotation_auto, convoc_*, info
- Presets convocation : visite_medicale, habillement, rh, formation, pitboss, annonce
- Messages groupés : `{uids: [...]}` OU `{group: "present"|"all"|"team:X"}`
- Bannière in-app `_checkPitBanner()` animation `pitBannerSlide` + TTS
- Accusé de réception `pitAckMessage(ts)` → `ackedAt`
- Badge pulsant topbar emp si pending
- Fil emp `vMonFilPit()` accessible FAB

### 👻 Ghost watcher (v9.230-232)
- `pollGhostAlerts()` toutes 30s
- Notif persistant > 2min via `sendNotif` tag `ghost-<uid>`
- Historique `cmc_ghost_log` (FB_LOCAL, rolling 500)

## 📋 PRs créées et mergées (session bis)

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
| #28 | Tests unitaires notifs + notes finales | v9.250-251 |

## 🔑 Stockage Firebase ajouté

| Clé | Type | Usage |
|-----|------|-------|
| `cmc_table_coords` | FB_FIX | Coord GPS tables physiques |
| `cmc_timings` | FB_FIX | Timings shift (pre/post/pause/coupure) |
| `cmc_known_identities` | FB_FIX | Historique permanent identités |
| `cmc_positions` | FB_FIX | Positions live emps (rolling 48h) |
| `cmc_ghost_log` | FB_LOCAL | Historique détections ghost |
| `cmc_auto_rotation_off` | FB_LOCAL | Opt-out auto-rotation |

## 🔍 Règle permanente active

**Vérification 10 sources minimum** pour toute info factuelle (voir NOTES_USER.md).
**Merge autonome** quand CI Vercel green (pas d'attente Kevin).

## ⏳ Roadmap suite (si Kevin valide)

- **App native** ROADMAP_NATIVE_APP.md : ~15-20k€, 2 mois (vraie géoloc 24/7)
- Module paie complet (Article 13 Convention + cagnottes par jeu)
- Intégration SI SBM externe (seul gap pour note 10/10 niche)
- Multi-langue IT/EN complet

## ⏳ Actions Kevin hors code

- Nettoyage Vercel (kdmc-bot-2026)
- Token Telegram / secrets GitHub Actions
- Créer repos IA-KDMC + e-KDMC
- Consentement CGU affiché à première connexion (v9.217 OK)

---

*Dernière mise à jour : 2026-04-17 — v9.251 (99 versions total sur 2 sessions, 9 PRs mergées session bis, modules pit boss / heures effectives / notifs temps réel complets)*
