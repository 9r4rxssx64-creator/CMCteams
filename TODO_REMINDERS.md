# 🗓 TODO — Tâches à faire bientôt

> **Lecture obligatoire à chaque session par Claude.**
> Liste dynamique des choses à faire que Kevin a demandées en cours mais pas encore exécutées.

---

## 🟡 PRIORITÉ HAUTE — À faire dès demain (2026-04-17)

### 1. Nettoyage des projets Vercel
**Demande Kevin (2026-04-16 03:05)** :
> "Fais moi penser à faire le tri dans les projets demain. Faire propre ou ça bloqué."

**Contexte** : pendant le déploiement de l'agent 24/7 sur Vercel, plusieurs projets fantômes ont été créés à cause d'erreurs successives :
- `cmc-teams` (créé Mar 20 — "No Production Deployment")
- `project-zg03h` (par défaut)
- `kdmc-agent` (essai 1, échec)
- `kdmc-agent-2026` (essai 2, échec)
- `kdmc-bot-2026` (FINAL, en production ✅)

**Action à faire** :
1. Aller sur https://vercel.com/dashboard
2. Pour chaque projet SAUF `kdmc-bot-2026` :
   - Tape sur les **⋯** à droite du projet
   - **Settings → Delete Project**
   - Tape le nom du projet pour confirmer
3. Garder uniquement `kdmc-bot-2026` (l'agent actif)

**Ne pas oublier** : si suppression, vérifier d'abord qu'on n'utilise pas la deploiement de cmc-teams (probablement non, car l'app CMC Teams est sur GitHub Pages, pas Vercel).

---

### 2. Sauvegarde tokens dans gestionnaire de mots de passe
**Contexte** : actuellement les 4 tokens (Anthropic, Telegram bot, chat ID, Agent Secret) sont uniquement dans les Notes iPhone. Bonne pratique : ajouter une 2ème copie dans Bitwarden / 1Password / Apple Keychain.

---

### 3. Régénérer le token Telegram (si pas déjà fait)
**Contexte** : le token Telegram a été visible sur des captures d'écran envoyées dans la conversation. Sécurité = régénérer.

**Action** :
1. Ouvrir conversation **@BotFather**
2. Tape `/revoke`
3. Sélectionne `@Kdmc_kevind_2026_bot`
4. Récupère le **nouveau** token
5. Met à jour Notes iPhone
6. Met à jour Vercel : Settings → Environment Variables → modifier `TELEGRAM_BOT_TOKEN`
7. Redéployer (Settings → Deployments → Redeploy le dernier)

---

## 🟢 PRIORITÉ MOYENNE — Au fil de l'eau

### 4. Activer GitHub Actions (crons fréquents)
**Contexte** : Vercel Hobby limite à 1 cron/jour. Pour avoir health-check 15min et conflicts-check 1h, on peut activer le workflow GitHub Actions déjà préparé dans `.github/workflows/auto-backup.yml`.

**Action** :
1. Aller sur https://github.com/9r4rxssx64-creator/cmcteams/settings/secrets/actions
2. Ajouter les secrets :
   - `ANTHROPIC_API_KEY`
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
   - `FB_URL` (default OK)
3. Le workflow tournera tous les jours à 3h UTC

---

### 5. Backup tokens chiffré sur Drive
**Contexte** : 3ème copie hors-site (stratégie 3-2-1).

**Action** : voir `SETUP_FOR_LATER/4-CONFIGURATION_FINALE.md` section "Sauvegarde des secrets".

---

### 6. Créer les vrais repos GitHub IA-KDMC + e-KDMC
Pour les avoir comme projets séparés dans Claude Code iOS.
Voir `SETUP_FOR_LATER/REPONSES_QUESTIONS.md` section "Où sont les 2 autres projets".

---

## ✅ FAIT (à archiver)

- ✅ 2026-04-16 : Bot Telegram créé (`@Kdmc_kevind_2026_bot`)
- ✅ 2026-04-16 : Compte Vercel + import projet
- ✅ 2026-04-16 : Agent 24/7 déployé sur Vercel (`kdmc-bot-2026`)
- ✅ 2026-04-16 : `vercel.json` adapté pour Hobby tier (3 crons/jour)

---

*Mis à jour : 2026-04-16 — Claude (à mettre à jour à chaque session selon avancement)*
