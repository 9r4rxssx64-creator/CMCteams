# 🔄 REPRISE / HANDOFF — Session SEO + Avocat/Droit + GitHub MCP

> But : tout savoir pour reprendre sur une **nouvelle branche** sans rien relire de l'historique.
> Dernière mise à jour : 2026-06-01. Méthode de vérité = **WebFetch `raw.githubusercontent.com`** (PAS le proxy git local, qui ment — cf. lesson #79).

---

## 1. ✅ DÉJÀ LIVRÉ ET EN PROD (sur le VRAI main, vérifié WebFetch raw)

| Livraison | Preuve sur main |
|---|---|
| **SEO Apex vitrine indexable** (title, canonical, robots index, OG/Twitter, JSON-LD SoftwareApplication, noscript indexable, `robots.txt`/`sitemap.xml`/`llms.txt`/`og-image.png`) | `apex-ai-v13/llms.txt` présent |
| **Section Avocat/Droit** (claude-for-legal : 12 modules, 151 skills, 10 agents, Apache-2.0) + orchestrateur `/legal` + parité Apex | `.claude/skills/legal/SKILL.md` présent |
| **SEO + Google APIs** (skill claude-seo, extensions free, workflow seo-audit, pont clés Google) | `.claude/skills/seo/SKILL.md` présent |
| **`.mcp.json` serveur GitHub MCP** (URL-seule `https://api.githubcopilot.com/mcp/`, SANS header — credential via Coffre) | vérifié : `.mcp.json` sur main contient `github` sans `headers` (PR #530 + edits directs GitHub) |

→ **Ces 4 blocs sont définitivement sur main. Ne pas les refaire.**

---

## 2. ⏳ EN ATTENTE (commits doc non mergés sur le vrai main)

Branche `claude/seo-skill-install-2rdyZ`, 5 commits **pure documentation** (zéro impact fonctionnel) :
- `31c094cc3` mémo friction GitHub (KEVIN_ACTIONS_TODO « MÉMO À FAIRE »)
- `cdbf5b907` lesson #79 (proxy git désync)
- `500ea357` / `4aec71d1` .mcp.json github (déjà reflété sur main via edits directs de Kevin)
- `01bc60cb0` lesson #80 (GitHub MCP non chargé)

Ces commits **n'atteignent pas le vrai GitHub** car le proxy git `127.0.0.1` ne propage pas (lesson #78/#79). **Non urgent** : c'est de la doc. À reprendre via le modèle §4.

---

## 3. 🚧 LE BLOCAGE CENTRAL — GitHub MCP (lessons #78 → #80)

**Symptôme** : impossible de merger/pusher en autonomie depuis les sessions Claude Code web de CMCteams.

**Causes empiriquement vérifiées** :
1. **Proxy git `127.0.0.1`** : `git push` répond `[new branch]` mais ne propage PAS durablement vers le vrai GitHub ; `git ls-remote`/`cat-file` du proxy **mentent** (vu proxy main = `6b1ca9b4` alors que vrai main = `b38e20e5`). Push direct sur `main` = **403** (protégé).
2. **GitHub MCP `mcp__github__*` ABSENT** du registre d'outils des sessions CMCteams (vérifié par ToolSearch sur 3 sessions, noms exacts + mots-clés → rien). Seuls Figma/Sentry/Apollo/Supabase/etc. chargés.
3. **Hypothèse forte (lesson #80)** : les **Coffres d'identifiants GitHub** (Jeton Bearer + OAuth, Actifs, URL `api.githubcopilot.com`) sont configurés sur **`platform.claude.com`** (agent **Apex AI** / env `apex-ai-env`). Or les sessions CMCteams tournent sur **`claude.ai/code`** = **produit séparé** → le Coffre n'alimente pas ces sessions. `.mcp.json` correct ne suffit pas si le runtime n'a pas le credential.

**Ce qui est ÉLIMINÉ comme cause** : `.mcp.json` (correct, vérifié), header parasite (retiré), réseau (`apex-ai-env` = Unrestricted).

---

## 4. ✅ MODÈLE DE LIVRAISON QUI MARCHE (à utiliser tant que GitHub MCP absent)

**« Je prépare le diff exact → Kevin applique/merge sur github.com »**
C'est ainsi que les 3 features + PR #530 sont passées :
- Pour un fichier : je donne le contenu complet → Kevin **édite directement sur GitHub** (`github.com/.../edit/main/<fichier>`) → Commit. L'éditeur web touche le **vrai** GitHub (contourne le proxy).
- Pour une branche existante sur le vrai GitHub : **Create PR → Merge** (mobile OK).
- ⚠️ Sur iPhone, le bouton **« Run workflow »** (workflow_dispatch) est masqué → préférer **Create PR**.

**Vérifier un merge** = WebFetch `raw.githubusercontent.com/9r4rxssx64-creator/CMCteams/main/<fichier-témoin>`. JAMAIS se fier à `git ls-remote`/`git log` du proxy.

---

## 5. ❓ QUESTION OUVERTE POUR DÉBLOQUER L'AUTONOMIE

Où `create_pull_request`/`merge_pull_request` sont-ils « chargés » ?
- Si **platform.claude.com (agent Apex AI)** → normal qu'ils soient absents des sessions CMCteams (produits séparés).
- Pour les avoir dans les sessions **CMCteams**, il faut rattacher le serveur GitHub MCP + credential à **l'environnement/agent qui exécute les sessions CMCteams** (pas seulement `apex-ai-env`), puis **relancer une session** et **revérifier par ToolSearch** que `mcp__github__*` apparaît AVANT de promettre quoi que ce soit.

---

## 6. 🆕 REPRENDRE SUR UNE NOUVELLE BRANCHE — procédure

1. **Lire ce fichier** + `CLAUDE.md` lessons **#72, #78, #79, #80**.
2. **Au démarrage** : `ToolSearch "github merge pull request"` → si `mcp__github__*` présent ⇒ autonomie totale (créer branche + PR + merge par API). Sinon ⇒ modèle §4.
3. **État vérité** : WebFetch `raw.../main/apex-ai-v13/llms.txt` (doit exister) pour confirmer que les features sont là.
4. **Repartir du SHA que KEVIN voit** sur github.com (pas du main proxy). Lui demander le SHA de main si besoin.
5. Nouvelle branche : `claude/<sujet>` ; livrer en petits commits ; pour merger, modèle §4.
6. **Ne PAS** refaire les 4 livraisons du §1 (déjà en prod).

---

## 7. 📌 ACTION KEVIN (durable, hors session)
Reconnecter/rattacher le **GitHub MCP** au runtime des sessions **claude.ai/code CMCteams** (pas seulement l'agent Apex AI sur platform.claude.com). Tant que ce n'est pas fait, garder le modèle §4 (qui fonctionne).
