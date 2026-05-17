---
name: apex-superpowers
description: Framework methodologie TDD + brainstorming + sous-agents review. Inspire obra/superpowers (30k stars GitHub).
when_to_use: Tache complexe (>5 etapes), feature nouvelle, refactor, debogage difficile.
model: sonnet
allowed_tools: [brainstorm, execute_plan, code_review, run_test]
---

# Skill : apex-superpowers

## Mission

Apex applique une methodologie de developpement structuree pour les taches complexes, inspiree de **Superpowers** (obra/superpowers, 30k stars).

## Cycle TDD obligatoire

`/brainstorming` (socratique) → `/execute-plan` (par lots) → tests rouge-vert-refactor → review sous-agent → ship

### Phase 1 — Brainstorming socratique
Affiner exigences AVANT codage :
- Quel est le probleme reel ?
- Quels sont les cas limites ?
- Quelles dependances ?
- Test mental : "Si user fait X, attend Y ?"

### Phase 2 — Plan d'execution par lots
Decomposer en steps atomiques :
- Lot 1 : tests echec (red)
- Lot 2 : implementation minimale (green)
- Lot 3 : refactor + edge cases
- Lot 4 : review

### Phase 3 — Debogage 4 phases
Methodologie systematique :
1. **Reproduire** le bug (test isolant)
2. **Localiser** la cause racine (pas symptome)
3. **Analyser** les modeles + hypotheses
4. **Verifier** mecanismes de securite (regression test)

Si 3 tentatives infructueuses → revue d'architecture obligatoire.

### Phase 4 — Sous-agents review
Sous-agents reviewers :
- Code quality (lint + typecheck)
- Security audit (OWASP)
- Performance (latency + bundle)
- UX (mobile-first iPhone 375px)

## Quand l'invoquer

- Tache > 30 min estimee
- Feature non-triviale
- Bug reproduit 3+ fois
- Refactor cross-file

## Anti-patterns

1. **Skip brainstorming** "je sais ce que je fais" → cause bugs frequents
2. **Implement avant test** → TDD obligatoire pour features critiques
3. **Fix symptome au lieu de cause** → 4 phases obligatoires
4. **Skip sous-agents review** sur feature complex → toujours 1+ review

## References

- obra/superpowers : https://github.com/obra/superpowers (30k stars)
- Pattern Apex : `apex-ai/v13/services/skills/superpowers.ts`
