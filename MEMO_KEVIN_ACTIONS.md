# MEMO ACTIONS KEVIN -- A jour au 2026-04-17

> Ce fichier liste TOUTES les actions que Kevin doit faire lui-meme.
> Claude Code le met a jour a chaque session.
> Kevin : coche ce que tu as fait, je m'occupe du reste.

---

## URGENT -- A faire MAINTENANT

### 1. Recharger credits API Claude
- [ ] Aller sur https://console.anthropic.com/settings/billing
- [ ] Verifier le solde (si 0$ = erreur API dans l'app)
- [ ] Recharger (minimum 10$ recommande)
- [ ] L'erreur API dans CMCteams disparaitra automatiquement apres recharge

### 2. Verifier la cle API
- [ ] Aller sur https://console.anthropic.com/settings/keys
- [ ] Verifier que ta cle commence par `sk-ant-api03-...`
- [ ] Si elle est revoquee, en creer une nouvelle
- [ ] La saisir dans CMCteams : Aide IA > bouton cle

---

## IMPORTANT -- A faire cette semaine

### 3. Deployer le proxy Cloudflare (securite + fiabilite)
- [ ] Creer compte gratuit sur https://dash.cloudflare.com
- [ ] Menu "Workers & Pages" > "Creer" > "Creer un Worker"
- [ ] Nom : `kdmc-ai-proxy`
- [ ] Copier le contenu de `proxy-kdmc.js` dans l'editeur > Deployer
- [ ] Settings > Variables and Secrets > Ajouter :
  - Name: `ANTHROPIC_API_KEY`
  - Value: ta cle `sk-ant-api03-...` (type: Encrypted)
- [ ] Noter l'URL : `https://kdmc-ai-proxy.TON-USER.workers.dev`
- [ ] La saisir dans l'app KDMC AI (Settings > Proxy)
- **Avantage** : ta cle n'est plus exposee dans le navigateur, plus de CORS

### 4. Creer compte Stripe (monetisation)
- [ ] Aller sur https://dashboard.stripe.com/register
- [ ] Activer le mode Test d'abord
- [ ] Creer les produits/prix :
  - Free : 0 EUR/mois (5 messages/jour)
  - Pro : 9.99 EUR/mois (illimite)
  - Enterprise : 49.99 EUR/mois (multi-users + support)
- [ ] Noter les cles API (publishable + secret)

### 5. Nettoyage projets Vercel
- [ ] Aller sur https://vercel.com/dashboard
- [ ] Supprimer tous les projets SAUF `kdmc-bot-2026`
- [ ] Cela a ete demande le 2026-04-16

### 6. Regenerer token Telegram
- [ ] Token visible dans des captures d'ecran = compromis
- [ ] Aller sur Telegram > @BotFather > /revoke > selectionner le bot
- [ ] Copier le nouveau token
- [ ] Le mettre dans les secrets Vercel

---

## MOYEN TERME -- Quand tu as le temps

### 7. Reseaux sociaux pour KDMC AI
- [ ] Creer page Facebook "KDMC AI"
- [ ] Creer compte Instagram "kdmc.ai"
- [ ] Lier les comptes dans Meta Business Suite
- [ ] Obtenir Meta Business API keys (pour integration app)

### 8. Nom de domaine
- [ ] Choisir : kdmc-ai.com / kdmc.ai / kdmc-app.com
- [ ] Acheter sur Namecheap ou Google Domains (~12 EUR/an)
- [ ] Configurer DNS vers GitHub Pages

### 9. GitHub Actions secrets
- [ ] Repo CMCteams > Settings > Secrets > Actions
- [ ] Ajouter : ANTHROPIC_API_KEY, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, AGENT_SECRET

### 10. Creer repos GitHub separes
- [ ] https://github.com/new > "IA-KDMC" (prive)
- [ ] https://github.com/new > "e-KDMC" (prive)

### 11. Backup securise
- [ ] Stocker tous les tokens/cles dans un gestionnaire de mots de passe
- [ ] Backup chiffre sur Google Drive (regle 3-2-1)

---

## CONNEXIONS APPAREILS (quand l'app sera prete)

### iPhone
- [ ] Ouvrir KDMC AI dans Safari
- [ ] Bouton partage > "Ajouter a l'ecran d'accueil"
- [ ] L'app s'installe comme une vraie app
- [ ] Activer les notifications quand demande

### Tablette Android
- [ ] Ouvrir KDMC AI dans Chrome
- [ ] Menu 3 points > "Installer l'application"
- [ ] Accepter les notifications

### Facebook / Instagram / WhatsApp / Messenger
- [ ] Je te guiderai etape par etape quand l'app sera prete
- [ ] Necessite : Meta Business Suite + API keys
- [ ] L'app pourra ensuite lire/envoyer des messages pour toi

### Gmail
- [ ] Sera connecte via EmailJS (gratuit 200 emails/mois)
- [ ] Ou Google Apps Script (illimite, gratuit)

---

## SUIVI

| Date | Action | Statut |
|------|--------|--------|
| 2026-04-17 | Recharger API credits | EN ATTENTE |
| 2026-04-17 | Verifier cle API | EN ATTENTE |
| 2026-04-17 | Deployer proxy Cloudflare | EN ATTENTE |
| 2026-04-16 | Nettoyage Vercel | EN ATTENTE |
| 2026-04-16 | Regenerer token Telegram | EN ATTENTE |

---

*Mis a jour par Claude Code le 2026-04-17*
*Prochaine mise a jour : a chaque session*
