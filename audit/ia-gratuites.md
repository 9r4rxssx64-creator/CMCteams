# 🔎 Les IA gratuites — vérifiées pour de vrai

> Écrit automatiquement par la CI (elle a le réseau ouvert, pas moi).
> Dernier passage : **2026-09-06 16:37 UTC**. Rien n'est recopié de mémoire.

## 🎨 Qui transforme ta photo aujourd'hui

| Ce qu'on teste | Résultat | Moteur qui a servi | Gratuit ? |
|---|---|---|---|
| figurine (garde ton visage) | ✅ image reçue (1051 Ko) | replicate-edit:flux-kontext-pro | 💰 **payant** |
| poses de danse | ❌ 502 — Je n'ai pas pu fabriquer les poses à partir de ta photo. Je préfère te le dire plutôt que de te rendre quelqu'un d'autre. | — | — |

> 🔴 **Quelque chose ne marche pas** — le détail est dans le tableau, avec la cause exacte.

## 🔑 Les clés

| Fournisseur | Nom du secret | État | Ce qu'il a répondu |
|---|---|---|---|
| cerebras | `CEREBRAS_API_KEY` | ❌ refuse (404) | {"message":"Model does not exist or you do not have access to it.","type":"not_found_error","param":"model","code":"mode |
| nvidia | `NVIDIA_API_KEY` | ⚪ pas de clé — rien à faire tant que tu n'en veux pas | — |
| sambanova | `SAMBANOVA_API_KEY` | ⚪ pas de clé — rien à faire tant que tu n'en veux pas | — |
| huggingface | `HF_TOKEN` | ⚪ pas de clé — rien à faire tant que tu n'en veux pas | — |
| nebius | `NEBIUS_API_KEY` | ⚪ pas de clé — rien à faire tant que tu n'en veux pas | — |
| scaleway | `SCALEWAY_API_KEY` | ⚪ pas de clé — rien à faire tant que tu n'en veux pas | — |
| glm | `GLM_API_KEY` | ⚪ pas de clé — rien à faire tant que tu n'en veux pas | — |
| qwen | `DASHSCOPE_API_KEY` | ⚪ pas de clé — rien à faire tant que tu n'en veux pas | — |
| xai (déjà à toi) | `XAI_API_KEY` | ❌ refuse (400) | {"code":"invalid-argument","error":"Model not found: grok-2-latest"} |
| perplexity (déjà à toi) | `PERPLEXITI_API_KEY` | ❌ refuse (401) | {"error":{"message":"Invalid API key provided. You can find your API key at https://www.perplexity.ai/settings/api.","ty |

## 🔗 Les liens que je t'ai donnés répondent-ils ?

| Fournisseur | Lien | État |
|---|---|---|
| nvidia | [build.nvidia.com/](https://build.nvidia.com/) | ✅ répond |
| cerebras | [cloud.cerebras.ai/](https://cloud.cerebras.ai/) | ✅ répond |
| glm | [open.bigmodel.cn/](https://open.bigmodel.cn/) | ✅ répond |
| perplexity (déjà à toi) | [www.perplexity.ai/settings/api](https://www.perplexity.ai/settings/api) | 🟡 refuse les robots (le lien marche pour toi) |
| huggingface | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) | ✅ répond |
| scaleway | [console.scaleway.com/](https://console.scaleway.com/) | ✅ répond |
| xai (déjà à toi) | [console.x.ai/](https://console.x.ai/) | ✅ répond |
| sambanova | [cloud.sambanova.ai/](https://cloud.sambanova.ai/) | ✅ répond |
| qwen | [modelstudio.console.alibabacloud.com/](https://modelstudio.console.alibabacloud.com/) | ✅ répond |
| nebius | [studio.nebius.com/](https://studio.nebius.com/) | ✅ répond |

> ✅ Tous les liens répondent — aucun ne t'enverra dans le mur.

---

*« 🟡 refuse les robots » veut dire que le site bloque les visites automatiques :
le lien marche très bien depuis ton iPhone, c'est juste la CI qu'il refuse.*
