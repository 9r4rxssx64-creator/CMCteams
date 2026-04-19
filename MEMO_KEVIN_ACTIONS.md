# MEMO ACTIONS KEVIN -- A jour au 2026-04-17

> Ce fichier liste TOUTES les actions que Kevin doit faire lui-meme.
> Claude Code le met a jour a chaque session.
> Kevin : coche ce que tu as fait, je m'occupe du reste.

---

## URGENT -- A faire MAINTENANT

### 1. Erreurs API dans Claude Code / Claude.ai
- **Statut** : Kevin voit des erreurs API dans ses conversations Claude
- **Solde API** : Verifie OK (credits disponibles)
- **Cause probable** : Surcharge temporaire serveurs Anthropic
- **Actions :**
  - [ ] Verifier https://status.anthropic.com (statut serveurs)
  - [ ] Si "Degraded Performance" : attendre que ca passe
  - [ ] Si tout est vert : deconnecter/reconnecter la session
  - [ ] Si ca persiste > 1h : contacter support@anthropic.com
- **Note** : cette erreur n'a RIEN a voir avec la cle API CMCteams

### 2. Cle API CMCteams (app)
- [ ] Verifier que ta cle commence par `sk-ant-api03-...`
- [ ] La saisir dans CMCteams : Aide IA > bouton cle
- [ ] Solde API : https://console.anthropic.com/settings/billing

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
|------|--------|--------
| 2026-04-18 | APEX AI v1.5 livree (10/10 audit) | FAIT |
| 2026-04-18 | proxy-apex.js (streaming) cree | FAIT |
| 2026-04-18 | sw.js corrige (paths apex-ai) | FAIT |
| 2026-04-18 | Comptes email/reseaux notes | FAIT |
| 2026-04-19 | KDMC v6.1 livree (355 KB, 60 commits) | FAIT |
| 2026-04-19 | 7 audits experts + corrections P0/P1/P2 | FAIT |
| 2026-04-19 | INTEGRATION_STANDARD.md cree | FAIT |
| 2026-04-19 | Rename APEX AI -> KDMC | FAIT |
| 2026-04-19 | 70+ templates pro (10 categories) | FAIT |
| 2026-04-19 | 10 personas, 15 achievements, 12 ambiances | FAIT |
| 2026-04-19 | AI Crew + Local Workers integres | FAIT |
| 2026-04-19 | Broadlink configure (42 commandes IR) | FAIT |
| 2026-04-19 | Auto-learn 24 marques appareils | FAIT |

---

## A FAIRE PAR KEVIN (actions restantes)

### URGENT (pour commercialiser)

1. **Creer compte Stripe** (20 min)
   - https://dashboard.stripe.com/register
   - Produits: Free (0 EUR), Pro (14.99 EUR/mois), Pro Annuel (119.99 EUR/an), Enterprise (49.99 EUR/mois), Lifetime (249 EUR)
   - Configurer dans KDMC > Reglages > Stripe

2. **Deployer proxy Cloudflare** (10 min)
   - https://dash.cloudflare.com > Workers > Creer
   - Copier `proxy-apex.js` > Deployer
   - Secret: ANTHROPIC_API_KEY = ta cle sk-ant-...
   - URL dans KDMC > Reglages > Proxy

3. **Acheter nom de domaine** (5 min)
   - Suggestion: kdmc.ai ou kdmc-app.com (~12 EUR/an)
   - DNS vers GitHub Pages

4. **CGV + Mentions legales + RGPD** (30 min)
   - Template dispo dans KDMC > Templates > Admin > RGPD
   - Adapter avec tes coordonnees

### IMPORTANT (visibilite)

5. **Video demo 60s** — filmer l'ecran montrant les features cles
6. **Post Product Hunt** — https://producthunt.com (gratuit)
7. **Page LinkedIn KDMC** — posts reguliers
8. **Page Instagram @kdmc.ai** — videos courtes features
9. **Thread Twitter/X** — "J'ai cree une IA qui..."
10. **Post Reddit** — r/artificial + r/SideProject

### MOYEN TERME

11. **Configurer Sentry DSN** dans Reglages
12. **Configurer Finnhub key** (cours bourse gratuit)
13. **Configurer Broadlink** — `pip install broadlinkhttp` sur un appareil local
14. **Configurer Home Assistant** (Raspberry Pi ~50 EUR)
15. **Installer PWA sur iPhone** — Safari > Partager > Ecran d'accueil
| 2026-04-17 | Recharger API credits | EN ATTENTE |
| 2026-04-17 | Verifier cle API | EN ATTENTE |
| 2026-04-17 | Deployer proxy Cloudflare | EN ATTENTE |
| 2026-04-16 | Nettoyage Vercel | EN ATTENTE |
| 2026-04-16 | Regenerer token Telegram | EN ATTENTE |

---

*Mis a jour par Claude Code le 2026-04-17*
*Prochaine mise a jour : a chaque session*
