# 🔎 VEILLE OUTILS — Registre d'évaluation

> Dossier de suivi des outils que Kevin repère (TikTok, liens, captures).
> Règle CLAUDE.md « VEILLE OUTILS » (Kevin 2026-05-22) : chaque outil montré est
> évalué, comparé à l'existant, puis **intégré** (✅) / **déjà couvert** (⚖️) / **écarté** (❌).
> Gratuit + pertinent + sûr → installé. Payant → prix + verdict rentabilité.

---

## Légende verdict
- ✅ **Intégré** — meilleur que l'existant ou comble un vrai manque
- ⚖️ **Déjà couvert** — Apex/projets ont déjà aussi bien ou mieux
- ❌ **Écarté** — moins puissant / risque / hors sujet / payant sans valeur ajoutée

---

## Évaluations

| Date | Outil | Type | Prix | Plus performant que l'existant ? | Verdict |
|------|-------|------|------|----------------------------------|---------|
| 2026-05-21 | DeepSeek-Coder-V2 | Modèle IA code (poids ouverts) | API DeepSeek ~payante à l'usage (très bas coût) | DeepSeek déjà branché comme provider ; fort en code, économique | ✅ Intégré — directive « spécialiste code » ajoutée au system prompt Apex (`core/memory.ts`) |
| 2026-05-21 | superpowers (obra/superpowers) | Skills méthodo Claude Code | Gratuit | Existait partiel (`apex-superpowers.md`, 6 méthodos) | ✅ Intégré — enrichi 6 → 14 méthodologies |
| 2026-05-21 | claude-mem (thedotmack) | Mémoire cross-session CC | Gratuit | Apex a déjà mieux (`claude-mem-bridge.ts` + mémoire 3 backends) | ⚖️ Déjà couvert |
| 2026-05-21 | impeccable (pbakaus) | CLI anti-AI-slop design | Gratuit | Déjà présent (`apex-impeccable-design.md`, `stop-slop.md`) | ⚖️ Déjà couvert |
| 2026-05-21 | ui-ux-pro-max-skill | Skill système de design | Gratuit | Manque réel (pas de catalogue styles/palettes/UX) | ✅ Intégré — `.claude/skills/apex-ui-ux-pro-max.md` |
| 2026-05-21 | taste-skill (LeonxInx) | Skill goût UI | Gratuit | Manque réel (pas d'heuristiques de goût) | ✅ Intégré — `.claude/skills/apex-taste.md` |
| 2026-05-21 | thinking-styles (100 codes Claude) | Slash-commands CC | Gratuit | Nouveau | ✅ Intégré — 10 commands `.claude/commands/` |
| 2026-05-21 | claw-code (ultraworkers) | "Repo le plus rapide, 192k★" | — | Signal arnaque (192k★ « record » + invite Discord) | ❌ Écarté — risque, non vérifiable |
| 2026-05-21 | Violentmonkey / qBittorrent / JDownloader / Mullvad | Outils navigateur / torrent / VPN | Gratuit/Payant | Hors sujet (vidéo anti-piratage) | ❌ Écarté — hors périmètre projet |
| 2026-05-21 | DirectX / Visual Studio / .NET / XNA / Unreal (Geopogo) | Gamedev Windows | — | Hors sujet (PWA web) | ❌ Écarté — hors périmètre |
| 2026-05-22 | cache-audit (ussumant/cache-audit) | Skill audit prompt caching | Gratuit (MIT) | Nouveau ; utile (CLAUDE.md 481 Ko = vrai sujet cache) | ✅ Intégré — `.claude/skills/cache-audit.md` |
| 2026-05-22 | Context7 (Upstash) | Serveur MCP docs live | Gratuit | Déjà connecté comme MCP dans l'environnement | ⚖️ Déjà disponible |
| 2026-05-22 | Code review / Claude mem (Top 5 plugins) | Skills CC | Gratuit | Déjà présents (`apex-code-review.md`, `claude-mem-bridge.ts`) | ⚖️ Déjà couvert |
| 2026-05-22 | « feature dev » / « Creator » (Top 5 plugins) | Skills CC | Gratuit ? | Non identifiables (pas d'URL) | ⏳ En attente — URL GitHub requise |
| 2026-05-22 | Wispr Flow (wisprflow.ai) | App dictée vocale | Free tier limité ; Pro ~12-15 $/mois (à confirmer) | Apex a déjà une dictée native gratuite (Web Speech API + wake word) | ❌ Écarté — payant ; équivalent gratuit déjà dans Apex |
| 2026-05-22 | 21st.dev Magic MCP | MCP composants UI | Pro 20 $/mois | Skills design Apex couvrent le besoin | ❌ Écarté — payant, non prioritaire |
| 2026-05-22 | « 5 Skills Claude » (Nina Roig) — Avocat du Diable, Red Team, Reality Check, Boucle Infinie, Aigle Superviseur | Skills/commands CC (markdown auto-créés) | Gratuit | Concepts déjà couverts : `contrarian`/`critic`, skill `verify`, `apex-code-review`, `apex-superpowers` (plan-driven), `stop-slop` + règle absolue END-TO-END | ⚖️ Déjà couvert — 4/5 seraient des doublons (règle ZÉRO DOUBLON). ✅ 1 apport intégré : commande `contrarian` enrichie du framework Steel-man + score /10 |
| 2026-05-22 | Higgsfield MCP (`mcp.higgsfield.ai`) | Serveur MCP — génération image/vidéo cinématique | Payant — abonnement Higgsfield ~9-49 $/mois selon plan (à confirmer) | Apex a déjà des modules image/vidéo (futuristic modules : `apex-image-gen-flux2-pro`, `apex-video-gen-sora-2`) | ❌ Écarté — payant ; connecteur MCP à ajouter par Kevin dans les réglages Claude (pas installable dans le repo Apex) |
| 2026-05-22 | mattpocock/skills (28 skills CC) | Skills Claude Code | Gratuit (MIT) | Matt Pocock, repo réputé (1,8M installs). 28 skills évalués : tdd / diagnose / write-a-skill / improve-codebase-architecture déjà couverts (`apex-superpowers`, `tdd-implement`, `apex-skill-factory`, règle ARCHITECTURE) ; caveman / shoehorn / scaffold-exercises non pertinents ; to-issues / to-prd / triage = workflow issue-tracker marginal | ⚖️ Majorité déjà couverte (ZÉRO DOUBLON). ✅ 1 intégré : `grill-me` (le #1, 188K installs) — interrogation structurée avant de coder, `.claude/skills/grill-me.md` |
| 2026-05-22 | « 24 AI productivity tools » (ChatGPT, Claude, Perplexity, Canva, Gamma, ElevenLabs, Midjourney, Runway, HeyGen, Descript, Zapier, Make, Notion, NotebookLM…) | Services SaaS tiers | Freemium / Paid | Apex couvre déjà ~80 % des fonctions (multi-providers IA, generate_pptx, design, voix, video_edit, modules image/vidéo) | ⚖️ Pas installables (services externes) — fonctions déjà dans Apex. Manque seulement : meeting notes, correction grammaire |

---

## Manques identifiés → comblés

- ✅ **Notes de réunion automatiques** (équivalent Fireflies/Granola/Otter) — intégré 2026-05-22 : skill `apex-meeting-notes.md` + directive auto dans le system prompt Apex (`core/memory.ts`). Gratuit.
- ✅ **Correction grammaire/style** (équivalent Grammarly) — intégré 2026-05-22 : skill `apex-grammar-fix.md` + directive auto dans le system prompt Apex. Gratuit.

---

*Dernière mise à jour : 2026-05-22*
