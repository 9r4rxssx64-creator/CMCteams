---
name: apex-agent-toolkit
description: Boîte à outils agents — les 6 dépôts du tableau « Une Notion = Un Projet » (Kevin 2026-08-06), installés côté Apex ET côté Claude Code. Sert de référence pour écrire un skill, choisir une direction visuelle, réduire le coût en jetons, replier sur une IA gratuite, ou parler mémoire d'agent / pilotage d'équipe d'agents.
when_to_use: Auto. Dès qu'on crée un skill (skill_factory_create), qu'on génère un design system, qu'un forfait IA est épuisé, ou que Kevin parle de mémoire d'agent, d'économie de jetons, ou de piloter humains + agents.
model: sonnet
allowed_tools: [skill_factory_create, generate_design_system, read_repo_file, search_repo_code]
---

# Boîte à outils agents (parité Claude Code)

Contenu vendorisé dans **`vendor/agent-toolkit/<id>/`** du dépôt (texte seulement, épinglé au SHA,
`MANIFEST.json` = URL + licence + version). Mise à jour auto : workflow `agent-toolkit-sync.yml`
(bouton + 1er de chaque mois). Les 6 sont aussi dans le catalogue plugins (tag `agent-toolkit`).

| Notion | Dépôt | Quand je m'en sers |
|---|---|---|
| Ingénieur | `anthropics/skills` | avant de créer/corriger un skill — format `SKILL.md` de référence |
| Mémoire | `garrytan/gbrain` | avant de toucher à la mémoire d'agent (comparer à la mémoire compacte maison) |
| Design | `bergside/awesome-design-skills` | avant toute maquette → choisir une direction **nommée** (anti-design générique) |
| Jetons | `rtk-ai/rtk` | sortie trop bavarde. Gain réel ~3,7 %, **pas** 60-90 % → ne jamais survendre |
| Entreprise | `codejunkie99/meridian-company-os` | piloter humains + agents dans une console (inspiration admin kd-mc.com) |
| LLM gratuit | `jeis4wpi/free-llm-api-resources` | forfait épuisé → repli **en FIN** de chaîne |

## Règles

- ⚠️ **Anthropic reste l'IA principale.** Un provider gratuit s'ajoute en **fin** de `DEFAULT_CHAIN`,
  jamais en tête (leçons #124/#129).
- **Ne jamais installer** un binaire tiers ni un hook qui s'interpose sur toutes les commandes
  (PROTECTION ≠ STABILITÉ). On vendorise la **doc**, pas l'exécutable.
- **Ajouter une source** = `tools/agent-toolkit/sources.json` **ET** le catalogue plugins dans le
  MÊME commit (un test vérifie que les deux URL concordent).
- Après chaque passage du workflow : **lire `MANIFEST.json`** — un `ok:false` (dépôt renommé/404)
  ne se voit pas dans la conclusion du run.

Version longue (côté Claude Code) : `.claude/skills/agent-toolkit/SKILL.md`.
