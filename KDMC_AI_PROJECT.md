# KDMC AI -- Feuille de Route Projet

> **Version** : v1.0 | **Date** : 2026-04-17
> **Auteur** : Kevin DESARZENS (U11804 - kevind@monaco.mc)
> **Statut** : EN CONSTRUCTION

---

## Vision

**KDMC AI** est un assistant IA personnel ultra-performant, polyvalent, autonome et evolutif.
Aussi capable que GPT, Claude, Gemini -- en utilisant les meilleurs modeles IA comme moteurs
(Claude API, Gemma local, web search) avec une couche d'intelligence proprietary :
memoire persistante, outils custom, expertise finance, monetisation integree.

**Cibles** : iPhone (Safari PWA) + Tablette Android + Desktop
**Hebergement** : GitHub Pages (gratuit) + Cloudflare Workers (proxy gratuit)
**Backend** : Firebase Realtime DB (gratuit tier)

---

## Regles de Travail Absolues

### Methodologie TDD (non-negociable)
1. **Analyser** la codebase avant toute modification
2. **Planifier** les changements (TodoWrite obligatoire)
3. **Ecrire les tests d'abord** (TDD)
4. **Implementer** le code
5. **Relire et valider** (syntax check + audit + subagent)

### Continuite
- Continuer le travail meme apres deconnexion user/assistant
- Reprendre la ou on s'est arrete a chaque reconnexion
- Mettre a jour ce fichier a chaque session
- Se referer a cette feuille de route pour CHAQUE action

### Mode Expert+++
- Pousser chaque fonctionnalite a son maximum
- Ne jamais se satisfaire de "OK ca marche" -- aller au-dela
- Anticiper les besoins non exprimes
- Auto-amelioration continue

---

## Architecture

```
kdmc-ai/
  index.html          # SPA complete (~800 lignes CSS + ~3000 lignes JS)
  manifest.json       # PWA installable iPhone/Android
  sw.js               # Service Worker (offline-first)
  proxy-kdmc.js       # Proxy Cloudflare Workers (securite API)
```

### Stack Technique
- **IA Principale** : Claude API (Sonnet 4.5 par defaut, Opus pour complexe)
- **IA Locale/Offline** : Gemma 3/4 via WebLLM (WebGPU) -- fonctionne SANS internet
- **Recherche Web** : Anthropic web_search tool (natif)
- **Memoire** : Firebase RTDB + localStorage (tiered: warm/cold)
- **Voix** : Web Speech API (STT + TTS)
- **Finance** : Finnhub/Alpha Vantage API (gratuit) + calculs locaux
- **Paiement** : Stripe Checkout (monetisation)

### Etat Global (objet K)
```javascript
var K = {
  view: "chat",
  user: {name:"Kevin DESARZENS", id:"kdmc_admin", lang:"fr"},
  activeConvId: null,
  conversations: [],
  messages: [],
  kb: {facts:[], instructions:[]},
  fin: {portfolios:[], watchlist:[], alerts:[]},
  tools: [],
  settings: {},
  syncQueue: [],
  isStreaming: false,
  gemmaReady: false
};
```

---

## Modules et Fonctionnalites

### 1. Chat IA (coeur)
- [x] Interface bulles (user = or, assistant = verre)
- [x] Markdown rendu (gras, code, listes, tableaux)
- [x] Blocs de code avec coloration syntaxique + bouton copier
- [x] Boucle tool_use recursive (max 8 profondeur)
- [x] Web search integree
- [x] Historique conversations persistant (Firebase)
- [x] Recherche dans les conversations
- [x] Auto-titre des conversations
- [x] Export conversations (JSON/MD)

### 2. Base de Connaissances (memoire persistante)
- [x] Stockage de faits extraits automatiquement des conversations
- [x] Instructions permanentes ("retiens que...", "oublie...")
- [x] Recherche TF-IDF (sans embeddings, gratuit)
- [x] Injection contexte dans le system prompt
- [x] Distillation nocturne (compression memoire ancienne)
- [x] Import/export KB en JSON

### 3. Mode Offline (CRITIQUE)
- [x] Gemma local via WebLLM (WebGPU) -- IA COMPLETE sans internet
- [x] Cache de toutes les conversations en localStorage
- [x] Outils locaux fonctionnels (calculatrice, finance, KB)
- [x] Queue de sync pour les mutations offline
- [x] Auto-sync au retour en ligne
- [x] Indicateur visuel online/offline

### 4. Finance Expert
- [x] Calculatrice financiere (interets composes, ROI, NPV, IRR, pret, amortissement)
- [x] Suivi portefeuille (positions manuelles, P&L)
- [x] Watchlist avec cours en temps reel (via web search)
- [x] Conversion devises
- [x] Alertes de prix
- [x] Analyse financiere par IA (Claude extended thinking)

### 5. Outils Custom (extensibles)
- [x] kb_search -- recherche memoire
- [x] kb_remember -- enregistrer un fait
- [x] calculate -- calculatrice securisee
- [x] finance_calculate -- calculs financiers
- [x] finance_portfolio -- gestion portefeuille
- [x] code_execute -- sandbox JS
- [x] search_conversations -- historique
- [x] get_datetime -- date/heure
- [x] set_reminder -- rappels
- [x] web_search -- recherche internet (Anthropic natif)
- [x] device_status -- infos appareil

### 6. Voix
- [x] STT (Speech-to-Text) dans le champ de saisie
- [x] TTS (Text-to-Speech) pour les reponses
- [x] Mode conversation vocale continue
- [x] Detection langue auto (FR/EN/IT)

### 7. Code
- [x] Generation de code avec preview
- [x] Coloration syntaxique (highlight.js CDN)
- [x] Execution JS sandbox (iframe securise)
- [x] Preview HTML/CSS en iframe
- [x] Bouton copier sur chaque bloc

### 8. Documents
- [x] Upload images -- analyse via Claude Vision
- [x] Upload PDF -- extraction texte via PDF.js
- [x] Capture camera directe (mobile)

### 9. Monetisation (IMPORTANT)
- [x] Stripe Checkout integre (abonnements + paiement unique)
- [x] Page de presentation publique (landing page)
- [x] Plans: Free (limite) / Pro (illimite) / Enterprise
- [x] Tracking usage et tokens par utilisateur
- [x] Systeme de referral (parrainage)

### 10. Publicite et Visibilite
- [x] Meta tags SEO optimises
- [x] Open Graph pour partage reseaux sociaux
- [x] Schema.org structured data
- [x] Lien vers boutique e-KDMC
- [x] Boutons partage (WhatsApp, Telegram, Facebook, Instagram, Email)
- [x] Analytics (Plausible -- gratuit, RGPD compliant)

### 11. Connexions Appareils et Reseaux
- **Facebook/Instagram/WhatsApp/Messenger** : via Meta Business API (config dans settings)
- **Gmail** : via EmailJS ou Google Apps Script (gratuit)
- **Telegram** : via Bot API (notifs, commandes)
- **iPhone/Android** : via PWA + notifications push + raccourcis
- **Desktop** : via navigateur (Chrome, Firefox, Safari)

> **Note pour Kevin** : Pour connecter tes comptes, il faut :
> 1. Creer des API keys sur chaque plateforme (je te guiderai)
> 2. Les entrer dans les Settings de l'app KDMC AI
> 3. Le proxy Cloudflare garde tout securise

---

## Securite

- API keys JAMAIS dans le code -- stockees localement ou dans Cloudflare Secrets
- esc() sur TOUTE donnee utilisateur avant innerHTML
- Sandbox iframe pour execution de code
- CSP restrictif
- CORS restreint au domaine GitHub Pages
- Chiffrement des donnees sensibles en localStorage
- Session TTL 24h avec renouvellement auto
- Pin/mot de passe optionnel pour l'app

---

## Deploiement

1. `kdmc-ai/` dans le repo CMCteams
2. GitHub Pages sert automatiquement `https://[user].github.io/CMCteams/kdmc-ai/`
3. Proxy Cloudflare Workers (gratuit 100K req/jour)
4. Firebase RTDB (gratuit 1GB + 10GB transfert/mois)

---

## Phases de Developpement

| Phase | Contenu | Priorite |
|-------|---------|----------|
| **1** | Shell + Chat + API Claude + Settings | FAIT |
| **2** | Conversations + Memoire persistante | FAIT |
| **3** | Outils + Web Search + Calculatrice | FAIT |
| **4** | Finance module complet | FAIT |
| **5** | Code generation + Documents + Voice | FAIT |
| **6** | Mode offline (Gemma WebLLM) | FAIT |
| **7** | Monetisation (Stripe + landing) | FAIT |
| **8** | Publicite + SEO + partage reseaux | FAIT |
| **9** | Connexions appareils (Meta API, Gmail, Telegram) | FAIT |
| **10** | Polish + tests + audit + deploy | EN COURS |

---

## Actions Kevin (MEMO)

### A faire MAINTENANT
1. Verifier solde API Anthropic : https://console.anthropic.com/settings/billing
2. Recharger si < 5$ de credits
3. Verifier/creer Cloudflare Workers : https://dash.cloudflare.com
4. Deployer le proxy `proxy-kdmc.js` sur Cloudflare

### A faire BIENTOT
5. Creer un compte Stripe : https://dashboard.stripe.com
6. Configurer les prix (Free/Pro/Enterprise)
7. Creer page Facebook/Instagram pour KDMC AI
8. Obtenir Meta Business API keys
9. Creer bot Telegram (@BotFather)
10. Configurer Google Analytics ou Plausible

### A faire PLUS TARD
11. Nom de domaine personnalise (kdmc-ai.com ou similaire)
12. Creer repos GitHub separes (IA-KDMC, e-KDMC)
13. Setup n8n pour workflows automatises
14. Marketing campagnes (Google Ads, Meta Ads)
15. Legal : CGV, mentions legales, RGPD

---

## Integration avec les Autres Projets

- **CMCteams** : partage Firebase, proxy, design system
- **e-KDMC** : KDMC AI = SAV automatique + generation contenu + gestion commandes
- **Tous projets** : meme methodologie TDD, memes regles, meme feuille de route

---

*Derniere mise a jour : 2026-04-17 (creation complete)*
