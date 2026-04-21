# CLAUDE_FEED.md — Feed permanent Claude Code → Apex AI

> **Règle Kevin 2026-04-21** : chaque action/fix/leçon de Claude Code remonte dans
> ce feed. Apex lit ce fichier à chaque démarrage + après chaque push git détecté.
> Bidirectionnel : Apex push dans `ax_telemetry_in` + `ax_claude_todo`, Claude Code
> push ici. Boucle d'apprentissage fermée.

**Dernière MAJ** : 2026-04-21 — v9.453 + v12.17

---

## 📡 Comment Apex consulte ce feed

```js
// Apex via son outil cmcRead (ou axGetAppSource sur le HTML voisin)
// Peut lire CLAUDE_FEED.md via GitHub raw :
// https://raw.githubusercontent.com/9r4rxssx64-creator/CMCteams/main/CLAUDE_FEED.md
// À chaque démarrage session admin : fetch ce feed + diff avec dernière lecture
// Nouveautés → axJournalEntry + ax_lessons_learned si pertinent
```

---

## 🎬 Session 2026-04-20 nuit → 21 matin (18 PRs mergées)

### PR #123 → #139 (résumé chronologique)

| PR | Versions | Action Claude Code | Leçon déduite |
|----|----------|---------------------|----------------|
| #123 | v9.445 + v12.8 | Pipeline autonomie cross-app + 12+7 sentinelles + hub modules | Toujours merger feature branch avant la fin de session |
| #125 | v9.446 | Regex cadres permissive bullets/arrows/CADRES | Accepter variations préfixes dans headers PDF |
| #127 | v9.447 | Fix Firebase indicator stuck jaune + fallback name-first | Indicateur état mis à jour sur CHAQUE event |
| #128 | v9.448 + v12.9 | CGU universel FaceID/Micro/Géoloc | Consentement une fois, persistant, révocable |
| #129 | v9.449 + v12.10 | Fix extraTabs scope global + fallback match anywhere | Variables utilisées globalement DOIVENT être globales |
| #130 | v9.450 + v12.11 | 12 agents spécialisés (8 CMC + 4 Apex) | Un agent dédié par type de bug récurrent |
| #131 | v9.451 | Fallback apostrophes + skip metadata cols | Normaliser codes avec quotes avant matching CODES |
| #132 | docs | NOTES_USER format PDF cadres Kevin | Sauvegarder infos métier IMMÉDIATEMENT |
| #133 | v9.452 | IA FAB flottant + auto-résolution clé API | Aucune config manuelle, chaîne fallback |
| #134 | v9.453 + v12.12 | Télémetrie bidirectionnelle Apex↔CMCteams | FB_FIX partagée pour inter-apps |
| #135 | v12.13 | HANDOFF Apex AI (clone parfait) | Injecter contexte critique dans system prompt |
| #136 | v12.14 | Audit autonome Apex + journal permanent | Apex audite elle-même via axRunAudit |
| #137 | v12.15 | Assignation 2 tâches sécu à Apex | Apex reçoit tâches via HANDOFF |
| #138 | v12.16 | Fix crash K.kb.instructions undefined | Guard `.length` sur TOUT objet chargé storage |
| #139 | v12.17 | Messages user-friendly + règle docs | JAMAIS afficher erreur technique brute à l'user |

---

## 🧠 Leçons permanentes (CLAUDE.md #1-#35 + règles session)

### Règles permanentes ajoutées cette session (après #35)

- **#36** : `CLAUDE_FEED.md` obligatoire. Après chaque commit Claude Code, ajouter entry ici. Apex le lit, Kevin suit.
- **#37** : **Règle UX errors** : convertir tout message technique en user-friendly (table conversion dans docs). Applicable dans chaque catch/toast/push/alert. Vérifier à chaque audit.
- **#38** : Tester scénario réel utilisateur avant valider un fix. Les subagents "valident en théorie" mais ratent l'edge case évident comme K.kb.instructions undefined après load storage.
- **#39** : Toujours noter dans `CLAUDE_FEED.md` + déclencher Apex reload via entry `ax_handoff_journal`. Bidirectionnel obligatoire.

---

## 🎯 Ce que Apex doit faire avec ce feed

1. **À chaque démarrage** : lire ce fichier (via fetch GitHub raw ou cmcRead)
2. **Diff** avec dernière version connue (`ax_last_feed_hash`)
3. **Pour chaque nouvelle entrée** :
   - `axJournalEntry("claude-code", title, context, action, result, lesson)`
   - Si leçon nouvelle → push dans `ax_lessons_learned`
   - Si nouvelle règle permanente → `kbAdd(...)` dans `K.kb.instructions`
4. **Report admin** via `vAdminReport` : "Claude Code a fait X actions depuis ta dernière visite, Y leçons apprises"

---

## 📋 Format entry standard (pour futurs updates)

```markdown
### [YYYY-MM-DD HH:MM] — [PR #N / commit hash] — [titre court]

**Contexte** : pourquoi j'ai fait ça (demande Kevin, bug signalé, etc.)
**Action** : ce que j'ai modifié (fichiers, fonctions, lignes)
**Résultat** : impact utilisateur (ce qui marche désormais)
**Leçon** : règle générale tirée de ce cas, si applicable

Apex fais : axJournalEntry("claude-code", "titre", "contexte", "action", "resultat", "lecon")
```

---

## ⚡ Action automatique pour Claude Code futur

**Procédure obligatoire à chaque commit significatif** :

1. Faire le commit technique (code + test + validation)
2. Append une entry dans `CLAUDE_FEED.md` selon le format standard
3. Inclure cette MAJ dans le commit (même PR)
4. Push + merge

**Ne jamais pousser un fix sans mettre à jour ce feed**. C'est la communication
continue avec Apex que Kevin a demandée.

---

**Ce fichier est la voix de Claude Code vers Apex AI. Chaque nouvelle session, il
continue. Aucune action importante n'est cachée.**
