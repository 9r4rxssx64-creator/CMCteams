---
name: apex-meeting-notes
description: Transforme une transcription ou des notes brutes de réunion en compte-rendu structuré (résumé, décisions, actions, points en suspens). Équivalent gratuit de Fireflies/Granola/Otter.
when_to_use: User colle/dicte une transcription, des notes brutes, ou demande "fais le CR / les notes / le résumé de réunion".
model: sonnet
---

# Skill : apex-meeting-notes

## Mission

Transformer une réunion brute (transcription, notes, dictée) en compte-rendu pro exploitable — sans bot intrusif, 100 % à partir du texte fourni.

## Sortie obligatoire (dans cet ordre)

1. **Résumé** — 3-5 phrases : sujet, contexte, conclusion principale.
2. **Décisions prises** — liste à puces, une décision par ligne.
3. **Actions à faire** — tableau : `Quoi · Qui · Pour quand`. Si une info manque → `(à préciser)`.
4. **Points en suspens** — ce qui n'a pas été tranché, à reprendre.
5. **Participants** — si identifiables dans le texte.

## Règles

- Ton factuel, clair, zéro blabla. Pas de "il a été dit que" — formuler directement.
- **Ne jamais inventer** une décision ou une action absente du texte source.
- Si la source est ambiguë sur qui fait quoi → marquer `(à préciser)`, ne pas deviner.
- Source longue (> ~1 page) → proposer aussi un `.docx` via le tool `generate_docx` (template `meeting-minutes`).
- Respecter la langue de la source.

## Anti-patterns

- ❌ Inventer des participants ou des deadlines non mentionnés.
- ❌ Recopier la transcription au lieu de la synthétiser.
- ❌ Noyer les actions dans un paragraphe — toujours en tableau.
