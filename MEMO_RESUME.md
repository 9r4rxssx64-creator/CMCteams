# Mémo de reprise — 2026-04-17 (v9.148b livrée)

> **Lire en PREMIER à chaque nouvelle session.**
> Puis lire `NOTES_USER.md` (méta-règles admin + infos métier).
> Puis `~/.claude/CLAUDE.md` (règles globales multi-projets).
> **⚠️ AUSSI lire `TODO_REMINDERS.md`** — tâches en attente que Kevin a demandées.

---

## 🚨 PROBLÈME IDENTIFIÉ — Superviseurs sans horaire

**Cause racine identifiée** : La section SUPERVISEUR est en BAS du PDF pit boss et est
**TRONQUÉE au copier-coller**. Le texte n'arrive pas dans l'app → aucun parser ne peut
fonctionner. Solution : l'admin doit copier TOUTE la page ou importer séparément.

**Message d'avertissement ajouté** dans la zone d'import (v9.148).

---

## Dernière version stable

**`APP_VER = "v9.148b"`** — branche `main` (déployée GitHub Pages)

### Session 2026-04-17 — ce qui a été livré (v9.133 → v9.148b)

| Version | Contenu |
|---------|---------|
| v9.133 | Anti-crash scroll iOS + overflow codes + BOUVIER JF dots→JF |
| v9.135 | Auto-inférence rôles P/P+/E + vTeams pliable par famille |
| v9.136 | Groupe Ouvert/Fermé + sécurité IA double garde + auto-fix vides |
| v9.137 | vPlan + vDeparts familles pliables (anti-surcharge visuelle) |
| v9.138 | Premium UX (toast undo, focus-visible, micro-interactions) + monégasque 80+ clés |
| v9.139 | Senior ★ auto-détecté import + fond jaune PNL + couleurs cadres |
| v9.140 | Auto-apprentissage codes inconnus (hash couleur + label deviné) |
| v9.141 | 9 niveaux fallback noms + regex assouplie + log erreurs |
| v9.142 | FIX CRITIQUE : format B seuil 0 cadres + section detection |
| v9.143 | Perf array.join + SVG donut stats + zéro-erreur import |
| v9.144 | Visibilité MAXIMALE : textes blancs, fonds opaques, 13px min |
| v9.145 | Fix tag PDF {{CO + nettoyage guillemets |
| v9.146 | Scan secours brute-force + diagnostic console cadres |
| v9.147 | BORGIA T + adminRenameEmp + champ nom modifiable admin |
| v9.148 | SÉCURITÉ : suppression mots de passe en clair + diagnostic import |
| v9.148b | Constitution de Monaco intégrée (45+ articles, 10 titres, recherche) |

### Audit subagent final : 5/5 PASS
1. Syntaxe JS ✓
2. Sécurité (passwords clear supprimés, admin guards) ✓
3. Constitution (CONSTITUTION_MC + onglet + recherche) ✓
4. Import (CSV/text coexistence, rescue scan, BORGIA T) ✓
5. Admin Rename (emp.name + CHEFS_T + CHEF_EQ + Firebase) ✓

---

## 🎯 Capacités actuelles

- **82 outils IA** (24 admin) + 2 outils Constitution/Monaco
- **Constitution monégasque** consultable (onglet 🇲🇨 + recherche)
- **Convention Collective SBM** (35 articles + codes paie + grilles)
- **Familles pliables** dans vPlan, vDeparts, vTeams
- **Auto-apprentissage codes** (couleur hash, label deviné, persisté)
- **Sécurité renforcée** : plus de mots de passe en clair, double garde IA
- **Premium UX** : toast undo, focus-visible, micro-interactions, SVG stats
- **4 langues** : FR, EN, IT, Monégasque (80+ clés)
- **Admin Rename** : modifier le nom d'un employé partout dans l'app

---

## ⏳ En attente

1. **Superviseurs** : attendre que l'admin copie la section complète du PDF
2. **Inspecteurs** : à intégrer plus tard (TODO futur)
3. **Drag & drop planning** : feature premium identifiée (effort 6h)
4. **Bulk multi-select** avec Shift+Click (effort 5h)

---

*Dernière mise à jour : 2026-04-17 — v9.148b*
