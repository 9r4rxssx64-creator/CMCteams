# Mémo de reprise — 2026-04-17 (v9.147 livrée)

> **Lire en PREMIER à chaque nouvelle session.**
> Puis lire `NOTES_USER.md` (méta-règles admin + infos métier).
> Puis `~/.claude/CLAUDE.md` (règles globales multi-projets).
> **⚠️ AUSSI lire `TODO_REMINDERS.md`** — tâches en attente que Kevin a demandées.

---

## 🚨 PROBLÈME EN COURS (priorité 1)

**5 superviseurs (ETTORI M, FOUQUE V, PLACENTI L, DOGLIOLO Y, MUS L) + BOUVIER JF (pit15)**
ont TOUJOURS 0 horaire après import malgré v9.133→v9.147.

**Diagnostic en cours** : 3 subagents audit lancés. Le scan de secours brute-force (v9.146)
et le diagnostic console (v9.146) devraient aider à identifier la cause racine.

**Hypothèse** : le texte PDF collé ne contient peut-être PAS les sections superviseur/pit boss,
OU le format est radicalement différent de ce qu'on suppose.

**Prochaine action** : vérifier les logs console [DIAG CADRES] après import pour voir
si les noms sont présents dans le texte.

---

## 🗓 RAPPELS À TRAITER

1. **Constitution monégasque** : intégrer dans la base de données app (comme vConvention)
2. **Nettoyage projets Vercel** : supprimer tous sauf `kdmc-bot-2026`
3. **Régénérer token Telegram** (visible dans captures)
4. **Ajouter 4 secrets GitHub Actions**
5. **Backup chiffré tokens** sur Drive
6. **Créer repos GitHub** IA-KDMC + e-KDMC

---

## Dernière version stable

**`APP_VER = "v9.147"`** — branche `main` (déployée GitHub Pages)

### Session 2026-04-17 — ce qui a été livré (v9.133 → v9.147)

| Version | Contenu |
|---------|---------|
| v9.133 | Anti-crash scroll iOS + débordement codes + BOUVIER JF dots→JF + visibilité |
| v9.135 | Auto-inférence rôles P/P+/E + vue équipes pliable par famille |
| v9.136 | Groupe Ouvert/Fermé + sécurité IA hardcodée + auto-fix emp vides |
| v9.137 | Planning + Départs familles pliables (anti-surcharge) |
| v9.138 | Premium UX (toast undo, focus-visible, micro-interactions) + monégasque 80+ clés |
| v9.139 | Senior ★ auto-détecté import + fond jaune PNL + couleurs cadres |
| v9.140 | Auto-apprentissage codes inconnus (couleur hash + label deviné) |
| v9.141 | 9 niveaux fallback noms + regex assouplie + log erreurs positions |
| v9.142 | FIX CRITIQUE format B seuil 0 pour cadres + section detection |
| v9.142b | Zéro-erreur : CSV→cadre passthrough + lignes vides + header-block assoupli |
| v9.143 | Perf array.join + data viz SVG (donut présence + barre familles) |
| v9.144 | Visibilité MAX : textes blancs, fonds opaques, tailles minimum 13px |
| v9.145 | Fix tag PDF {{CO qui fuitait + nettoyage guillemets |
| v9.146 | Scan secours brute-force + diagnostic visible cadres vides |
| v9.147 | BORGIA L→T + adminRenameEmp() + champ nom modifiable admin |

### Capacités ajoutées cette session

- **Import** : 9 niveaux fallback + auto-learn codes + brute-force secours + diagnostic console
- **UX Premium** : toast undo, focus-visible, micro-interactions, optimistic sync
- **Organisation** : familles pliables dans planning, départs, équipes admin
- **Sécurité** : double garde IA admin, audit tentatives non-autorisées
- **Métier** : GO/GF, senior ★, fond jaune PNL, rôles P/P+/E
- **i18n** : monégasque complet 80+ clés
- **Data Viz** : donut SVG présence + barre répartition familles
- **Admin** : renommage employé partout + BORGIA corrigé

---

## 📋 Fichiers documentation à JOUR

| Fichier | Rôle |
|---------|------|
| `CLAUDE.md` | Guide assistant IA (règles, workflow, erreurs connues) |
| `NOTES_USER.md` | Infos métier admin (couleurs, tables, horaires, GO/GF, cadres) |
| `CHANGELOG.md` | Historique complet versions |
| `MEMO_RESUME.md` | État courant (ce fichier) |
| `~/.claude/CLAUDE.md` | Règles globales multi-projets |

---

*Dernière mise à jour : 2026-04-17 — v9.147*
