# Mémo de reprise — 2026-04-17 (v9.149 livrée)

> **Lire en PREMIER à chaque nouvelle session.**
> Puis lire `NOTES_USER.md` (méta-règles admin + infos métier).
> Puis `~/.claude/CLAUDE.md` (règles globales multi-projets).
> **⚠️ AUSSI lire `TODO_REMINDERS.md`** — tâches en attente que Kevin a demandées.

---

## Dernière version stable

**`APP_VER = "v9.149"`** — branche `main` (déployée GitHub Pages)

### Session 2026-04-17 — 17 versions livrées (v9.133 → v9.149)

| Version | Contenu |
|---------|---------|
| v9.133 | Anti-crash scroll iOS + overflow codes + BOUVIER JF |
| v9.135 | Auto-inférence rôles P/P+/E + vTeams pliable |
| v9.136 | Groupe Ouvert/Fermé + sécurité IA + auto-fix vides |
| v9.137 | vPlan + vDeparts familles pliables |
| v9.138 | Premium UX + monégasque 80+ clés |
| v9.139 | Senior ★ auto-détecté + fond jaune PNL |
| v9.140 | Auto-apprentissage codes inconnus |
| v9.141 | 9 niveaux fallback noms |
| v9.142 | FIX CRITIQUE : format B seuil 0 cadres |
| v9.143 | Perf array.join + SVG donut stats |
| v9.144 | Visibilité MAXIMALE textes |
| v9.145 | Fix tag PDF {{CO |
| v9.146 | Scan secours brute-force |
| v9.147 | BORGIA T + adminRenameEmp |
| v9.148 | SÉCURITÉ : passwords clear supprimés |
| v9.148b | Constitution de Monaco intégrée |
| v9.149 | Audit expert 3 subagents — P0/P1 corrigés |

### Audits

| Audit | Résultat |
|-------|----------|
| Subagent CSS+constantes (L.1-5000) | 10 findings, P1 corrigés |
| Subagent Vues (L.8000-13000) | 10 findings, guards OK |
| Subagent Import+IA (L.13000+) | 10 findings, mutex ajouté |
| Vérification finale 5 points | 5/5 PASS |

---

## 🎯 Capacités actuelles

- **82 outils IA** + Constitution + Monaco
- **Constitution monégasque** (onglet 🇲🇨 + recherche + 45 articles)
- **Convention Collective SBM** (35 articles + codes + grilles)
- **Familles pliables** dans vPlan, vDeparts, vTeams
- **Auto-apprentissage codes** import
- **Sécurité** : hash-only passwords, double garde IA, mutex import
- **Premium UX** : toast undo, focus-visible, SVG stats, micro-interactions
- **4 langues** : FR, EN, IT, Monégasque
- **Admin Rename** : modifier nom employé partout

---

## ⏳ En attente (voir TODO_REMINDERS.md)

1. Superviseurs : section PDF tronquée au copier-coller
2. Nettoyage Vercel + token Telegram + secrets GitHub
3. Repos IA-KDMC + e-KDMC
4. Features futures : drag & drop, bulk select, inline edit

---

*Dernière mise à jour : 2026-04-17 — v9.149*
