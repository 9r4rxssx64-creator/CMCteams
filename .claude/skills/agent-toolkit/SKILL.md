---
name: agent-toolkit
description: >
  Boîte à outils agents — les 6 dépôts du tableau « Une Notion = Un Projet » (Kevin 2026-08-06) :
  skills d'ingénieur (anthropics/skills), mémoire d'agent (gbrain), 67 systèmes de design
  (awesome-design-skills), économie de jetons (rtk), OS d'entreprise humains+agents
  (meridian-company-os), IA gratuites par API (free-llm-api-resources). À ouvrir dès qu'on écrit
  un SKILL.md, qu'on choisit une direction visuelle, qu'on veut réduire le coût en jetons,
  qu'un forfait IA est épuisé, ou qu'on parle mémoire d'agent / pilotage d'équipe d'agents.
---

# Boîte à outils agents — les 6 dépôts du tableau

Kevin a filmé un tableau « **Une Notion = Un Projet** » listant 6 dépôts GitHub et m'a dit :
*« Récupère et installe tout ça pour toi et Apex et utilise. Note tout. »*

Le contenu **texte** de ces 6 dépôts est vendorisé dans **`vendor/agent-toolkit/<id>/`**, avec
`vendor/agent-toolkit/MANIFEST.json` qui donne pour chacun l'URL, le **SHA du commit** récupéré,
la licence et la date. Mise à jour : workflow **`agent-toolkit-sync.yml`** (bouton + cron mensuel).

## Les 6, et quand je m'en sers

| Notion | Dépôt | Je l'ouvre quand… |
|---|---|---|
| 🛠 Ingénieur | [anthropics/skills](https://github.com/anthropics/skills) | j'écris ou je corrige un `SKILL.md` — c'est la référence officielle du format et des bons découpages (docx/pdf/pptx/xlsx, mcp-builder, artifacts). |
| 🧠 Mémoire | [garrytan/gbrain](https://github.com/garrytan/gbrain) | je touche à la mémoire d'agent. À **comparer** à notre `tools/memory` maison (compact-memory) avant d'inventer autre chose. |
| 🎨 Design | [bergside/awesome-design-skills](https://github.com/bergside/awesome-design-skills) | Kevin demande une direction visuelle. 67 systèmes prêts (`SKILL.md` pour moi + `DESIGN.md` pour l'humain) + `index.json`. **Anti-« design d'IA générique »** : je pioche une direction précise au lieu du crème/serif/terracotta par défaut. |
| 💰 Économie de jetons | [rtk-ai/rtk](https://github.com/rtk-ai/rtk) | une commande crache 500 lignes inutiles dans mon contexte. `rtk <cmd>` compresse la sortie. Voir « honnêteté » plus bas. |
| 🏢 Entreprise | [codejunkie99/meridian-company-os](https://github.com/codejunkie99/meridian-company-os) | on parle de piloter **humains + agents** dans une même console (cockpit, kanban, objectifs, gouvernance, audit). Inspiration directe pour l'admin de kd-mc.com. |
| 🆓 LLM gratuit | [free-llm-api-resources](https://github.com/jeis4wpi/free-llm-api-resources) | un forfait IA est épuisé, ou je cherche un repli gratuit. Liste tenue à jour : modèles, quotas, limites. |

## Réflexes concrets

- **Avant d'écrire un `SKILL.md`** → lire 2 exemples dans `vendor/agent-toolkit/skills/`.
- **Avant de proposer une maquette / un thème** → `vendor/agent-toolkit/awesome-design-skills/index.json`,
  choisir une direction nommée, et le **dire** à Kevin (« j'ai pris tel système »).
- **Avant d'ajouter un provider IA** → vérifier `free-llm-api-resources` : y a-t-il un gratuit qui
  fait l'affaire ? ⚠️ Ne JAMAIS changer l'IA principale : Anthropic reste par défaut (leçon #124/#129),
  les nouveaux vont **en fin** de `DEFAULT_CHAIN`.
- **Quand une commande est bavarde** → `rtk <cmd>` si le binaire est là, sinon `| head -N`.

## Honnêteté sur `rtk` (ne pas survendre)

`rtk` est un **binaire Rust** installé par téléchargement GitHub → **impossible dans le bac à sable**
(egress bloqué) et de toute façon le conteneur est éphémère. On vendorise donc sa **doc**, pas le binaire.
Mesure indépendante citée par ses propres utilisateurs : sur un corpus réel de 614 M de jetons,
les outils de ce type ont économisé **~3,7 %** — pas les 60-90 % annoncés. Donc : utile, pas magique,
et **aucun hook automatique n'a été installé** (un wrapper qui réécrit toutes mes commandes serait
exactement le genre de « protection » qui casse plus qu'elle ne protège — cf. règle PROTECTION ≠ STABILITÉ).

## Côté Apex

Les 6 sont enregistrés dans le catalogue Apex (`apex-ai/v13/data/apex-plugins-catalog.ts`,
catégorie/tag `agent-toolkit`) → Apex les connaît, les liste dans sa vue Plugins, et sait à quoi
chacun sert. Test de non-régression : `apex-ai/v13/tests/unit/agent-toolkit-catalog.test.ts`.

## Licences

Chaque dossier vendorisé embarque le `LICENSE` d'origine quand le dépôt en a un, et le
`MANIFEST.json` rappelle la licence + le SHA exact. On ne redistribue que du texte de documentation.
