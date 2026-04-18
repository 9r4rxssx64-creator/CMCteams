# GUIDE_IPHONE.md — Mémo actions pas à pas (iOS Safari)

> Destiné à Kevin DESARZENS — iPhone iOS Safari.
> Toutes les URLs ci-dessous sont **cliquables** depuis ce fichier sur GitHub.
> Format : **🎯 But → 🔗 URL → 👆 Ce que tu vas voir → ✅ Action**.

---

## 📌 Prérequis — accès et comptes

| Service | Compte | Statut |
|---------|--------|--------|
| **GitHub** | `9r4rxssx64-creator` | ✅ Confirmé |
| **Vercel** | `g7vrdynktn-5574's projects` | ✅ Confirmé (cmc-teams + kdmc-agent-monaco déployés) |
| **Anthropic API** | `ANTHROPIC_API_KEY` | ✅ Configuré dans env Vercel |
| **Telegram Bot** | Bot token + chat ID `5458942048` | ✅ Configuré dans env Vercel |
| **Firebase RTDB** | `cmcteams-c16ab` | ✅ URL dans le code |
| **Google Drive / Gmail** | Tokens OAuth | ⚠️ À vérifier |
| **Sentry** | — | ❌ Pas de compte (à créer si monitoring) |

---

## 🔴 ACTION URGENTE 1 — Résoudre le cron Vercel bloqué

**Problème :** ton agent `kdmc-agent-monaco` a un cron `*/15 * * * *` (toutes les 15 min) mais Vercel Hobby limite à **1 fois par jour**.

### 🎯 Solution gratuite recommandée : GitHub Actions

**Avantages :** gratuit (2000 min/mois repo public), pas de limite sur le cron, logs consultables.

**👆 Sur iPhone Safari :**

1. **Ouvre :** 🔗 https://github.com/9r4rxssx64-creator/CMCteams/actions
2. **Tu vas voir :** page "Actions" avec les workflows existants (`auto-backup.yml`, `auto-deploy-vercel.yml`, `deploy.yml`, `tests.yml`)
3. **✅ Action :** ne fais rien ici, c'est juste pour vérifier. **Je vais créer le workflow `agent-cron.yml` pour toi** (dis-moi quand tu veux que je le fasse — une ligne suffit : *« crée le cron GitHub Actions »*).

### 🎯 Alternative si tu préfères payer

**🔗 Vercel Pro :** https://vercel.com/team/g7vrdynktn-5574/settings/billing
- 👆 Tu verras "Upgrade to Pro" — **20 $/mois**
- ✅ Déverrouille tous les crons Vercel

👉 **Ma reco : GitHub Actions (gratuit)**

---

## 🟡 ACTION 2 — Créer compte Sentry (monitoring erreurs gratuit)

**Pourquoi :** ton agent et ton app tournent en prod, Sentry t'alerte en cas de crash (gratuit 5k erreurs/mois).

### 👆 Sur iPhone Safari :

1. **Ouvre :** 🔗 https://sentry.io/signup/
2. **Tu vas voir :** formulaire "Get started with Sentry" — 3 champs : email, password, organization name
3. **✅ Action :**
   - Email : ton email
   - Password : crée-en un fort
   - Organization : `kdmc` (ou `cmcteams`)
4. **Clique "Sign up"**
5. **Ensuite tu verras :** écran "Start with your platform" — choisis **Browser JavaScript**
6. **Tu auras une clé DSN** (`https://xxx@xxx.ingest.sentry.io/xxx`)
7. **Copie-la et envoie-la-moi** — je configurerai le MCP Sentry et l'intégration dans CMCteams.

---

## 🟢 ACTION 3 — (Optionnel) Créer compte Notion

**Pourquoi :** si tu veux que je lise/écrive dans ton Notion (doc projet, specs, notes).

### 👆 Sur iPhone Safari :

1. **Ouvre :** 🔗 https://www.notion.so/signup
2. **Tu vas voir :** écran "Sign up" — boutons Apple/Google/Email
3. **✅ Action :** connecte-toi avec ton Apple ID (le plus simple sur iPhone)
4. **Après la création :** le MCP Notion déjà installé dans le sandbox se connectera automatiquement au premier usage (OAuth pop-up dans le navigateur).

**Si tu n'utilises pas Notion : passe cette étape.**

---

## 🟢 ACTION 4 — (Optionnel) Créer compte Figma

**Pourquoi :** si tu veux mockuper l'UI avant que je code.

### 👆 Sur iPhone Safari :

1. **Ouvre :** 🔗 https://www.figma.com/signup
2. **Tu vas voir :** "Create a free account" — 3 champs
3. **✅ Action :** crée le compte (gratuit, usage personnel illimité)

**Si tu ne mockupes pas : passe cette étape.**

---

## 🔵 ACTION 5 — Corriger erreur Telegram "chat not found" (tu avais une capture)

**Problème que tu as vu :** `{"ok":false,"error_code":400,"description":"Bad Request: chat not found"}`

**Cause :** le `TELEGRAM_CHAT_ID` (actuellement `5458942048`) n'est peut-être pas le bon, ou ton bot n'a jamais démarré de conversation avec toi.

### 👆 Vérification sur iPhone (2 minutes) :

1. **Ouvre Telegram sur ton iPhone**
2. **Cherche ton bot** (par son nom @XXX_bot)
3. **Tape `/start`** dans la conversation avec lui
4. **Tu dois voir un message de bienvenue**
5. **Puis sur Safari ouvre :** 🔗 https://api.telegram.org/bot`<TON_TOKEN>`/getUpdates
   - Remplace `<TON_TOKEN>` par ton vrai bot token
   - **Tu vas voir du JSON** avec ton `chat.id` réel
6. **Compare** avec `5458942048` : si différent, **envoie-moi le bon** et je mets à jour env Vercel.

---

## 🚀 ACTION 6 — Installer MCP dans TON Claude Code (si tu en as un local)

**Si tu utilises Claude Code uniquement via le web** (claude.ai/code sur iPhone) : **tu n'as rien à faire**, j'ai installé les MCP côté sandbox.

**Si tu as Claude Code installé sur Mac/PC :** ouvre ton terminal et colle ces 4 commandes (déjà validées gratuites sans OAuth lourd) :

```bash
claude mcp add context7 --transport http https://mcp.context7.com/mcp
claude mcp add vercel --transport http https://mcp.vercel.com
claude mcp add sentry --transport http https://mcp.sentry.dev/mcp
claude mcp add hf --transport http https://huggingface.co/mcp
```

Puis vérifie :
```bash
claude mcp list
```

---

## 📊 État actuel des MCP installés dans ton sandbox

| MCP | Statut | Usage | Gratuit ? |
|-----|--------|-------|-----------|
| **Context7** | ✅ Installé | Docs à jour pour frameworks | ✅ Oui |
| **Vercel** | ✅ Installé | Gérer tes déploiements (cmc-teams, kdmc-agent-monaco) | ✅ Oui |
| **Sentry** | ✅ Installé | Monitoring erreurs prod | ✅ 5k events/mois |
| **Hugging Face** | ✅ Installé | Génération images gratuite (Flux, SDXL, etc.) | ✅ Oui (quota) |

---

## 🎨 Génération d'images gratuites (sans compte)

**Le plus simple :** API **Pollinations.ai** — zéro clé, zéro compte.

**Test sur ton iPhone** :
1. **Ouvre :** 🔗 https://image.pollinations.ai/prompt/casino%20monte%20carlo%20roulette%20table
2. **Tu vas voir :** une image générée à la volée
3. **✅ Action :** si ça te plaît, je peux intégrer ça dans CMCteams pour générer des illustrations (avatars employés, bannières, splash).

---

## ✅ Récap — ordre de priorité des actions

| # | Action | Durée | Priorité |
|---|--------|-------|----------|
| 1 | Dis-moi "crée le cron GitHub Actions" pour résoudre Vercel Hobby | 10 s | 🔴 Urgent |
| 2 | Créer compte Sentry + m'envoyer la DSN | 3 min | 🟡 Recommandé |
| 3 | Vérifier/corriger `TELEGRAM_CHAT_ID` | 2 min | 🔵 Utile |
| 4 | Créer compte Notion (si utile) | 2 min | 🟢 Optionnel |
| 5 | Créer compte Figma (si utile) | 2 min | 🟢 Optionnel |

---

## 📞 Comment me demander d'agir

À la prochaine session Claude Code (iPhone ou desktop), dis-moi simplement :
- *« Crée le cron GitHub Actions »* → je fais le workflow
- *« Voici ma DSN Sentry : ... »* → je configure le monitoring
- *« Le chat_id Telegram correct est : ... »* → je mets à jour Vercel
- *« Génère une image pour X »* → j'utilise Pollinations ou Hugging Face

---

**Tout est prêt. Les fichiers `MCP_INSTALL.md`, `GUIDE_IPHONE.md`, `~/.claude/CLAUDE.md` et l'enrichissement de `buildIASystemPrompt` sont committés sur la branche `claude/evaluate-resources-shZBa`.**
