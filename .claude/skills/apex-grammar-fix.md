---
name: apex-grammar-fix
description: Corrige orthographe, grammaire, ponctuation et style d'un texte. Rend une version corrigée + la liste des corrections. Équivalent gratuit de Grammarly.
when_to_use: User demande "corrige", "relis", "améliore l'orthographe/le français", "réécris proprement", ou fournit un texte à corriger.
model: sonnet
---

# Skill : apex-grammar-fix

## Mission

Corriger un texte (orthographe, grammaire, accords, ponctuation, clarté) en respectant
le sens et le registre de l'auteur.

## Sortie obligatoire

1. **Texte corrigé** — version finale, prête à copier (dans un bloc).
2. **Corrections clés** — liste courte : `faute → correction` + raison (orthographe / grammaire / accord / ponctuation / style / clarté).

## Règles

- **Respecter le sens** : corriger la forme, jamais changer le fond.
- **Respecter le registre** : si l'user écrit familier, ne pas tout passer en soutenu.
- **Ne rien inventer** : pas d'ajout de contenu, pas de phrases nouvelles.
- Distinguer la **correction** (faute objective) de la **suggestion de style** (préférence) — marquer les suggestions comme optionnelles.
- Proposer une version "plus pro" **seulement si pertinent** et en plus, jamais à la place.
- Langue : corriger dans la langue du texte (FR, EN, IT...).

## Anti-patterns

- ❌ Réécrire entièrement un texte qui n'a que 2 fautes.
- ❌ Imposer un style soutenu sur un message volontairement décontracté.
- ❌ Rendre uniquement le texte corrigé sans expliquer les corrections.
