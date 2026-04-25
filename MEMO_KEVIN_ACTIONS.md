# MEMO ACTIONS KEVIN — Mise à jour 2026-04-25 (220+ commits Apex+CMCteams session)

> Ce fichier liste TOUTES les actions à faire par priorité. Triées par **impact business** et **urgence**.
> Claude Code met à jour à chaque session. Kevin coche ce qui est fait.

---

## 🚨 TÂCHE URGENTE #1 (à faire MAINTENANT, 2 min)

**Tester que Apex marche sur ton iPhone après tous les commits**

1. Ouvre Apex (icône écran d'accueil)
2. **Si écran blanc** :
   - Long-press icône → **Supprimer l'app**
   - Safari → `https://9r4rxssx64-creator.github.io/CMCteams/apex-ai/`
   - **Partager** → **Ajouter à l'écran d'accueil**
   - Réouvre l'icône
3. Si tu vois la page de connexion → **OK la PWA marche**
4. Tape ton nom + PIN admin → tu accèdes au dashboard

**Si toujours blanc après réinstall** : signale-moi, je débugger.

---

## 🔴 P1 — CRITIQUE BUSINESS (sans ça, app pas commercialisable)

### 1.1 ✅ Anthropic API (déjà fait — vérifier solde)
- [ ] Connecte-toi : https://console.anthropic.com/settings/billing
- [ ] Vérifie solde > $5 (sinon recharge minimum $5)
- [ ] **URGENCE** si quota épuisé (subagents bloqués jusqu'à reset 2:20am UTC)

### 1.2 Stripe KYC + Payment Links (CRITIQUE — sans = pas de paiements auto)
- [ ] https://dashboard.stripe.com → Activer compte (KYC : pièce ID + RIB)
  - **Sans société Monaco** : Stripe Atlas (~$500 setup, société Delaware) OU **Stripe Atlas Lite**
  - **Alternative simple** : Stripe France auto-entrepreneur (5 min, juste SIRET requis)
- [ ] Crée 4 Payment Links pour les plans :
  - Starter 4.99€/mo
  - Pro 39.99€/mo
  - Business 69.99€/mo
  - Enterprise 299€ one-shot
- [ ] Apex → Admin → Configurer paiements Stripe → colle les 4 URLs
- **Temps** : 30 min si SIRET déjà, 1-3j si KYC

### 1.3 PayPal.me (alternative sans société, plus simple)
- [ ] https://paypal.me → Configure ton username (5 min, pas de société requise)
- [ ] Apex → Coffre → `ax_paypal_me` → ton username (ex: `KevinDESARZENS`)
- **Temps** : 5 min · **Coût** : 0€ + 3% par transaction

### 1.4 OpenAI credits (fallback IA si Anthropic down)
- [ ] https://platform.openai.com/account/billing → Ajoute $5
- [ ] Récupère clé API : https://platform.openai.com/api-keys
- [ ] Apex → Coffre → `ax_openai_key`
- [ ] Railway → Variables → `OPENAI_API_KEY`
- **Temps** : 10 min · **Coût** : $5

---

## 🟠 P2 — IMPORTANT (qualité pro / extension)

### 2.1 Compte société (pour Stripe Business officiel)
- Auto-entrepreneur France : 5 min via URSSAF (si tu peux résider France)
- SARL Monaco : 1500-3000€ + délai 2-3 mois
- Stripe Atlas (Delaware) : $500 + 1 semaine
- **Recommandation** : auto-entrepreneur France si tu peux

### 2.2 Mistral AI (Européen RGPD, FR pur)
- [ ] https://console.mistral.ai → $5 credits
- [ ] Coffre → `ax_mistral_key`
- **Temps** : 5 min · **Coût** : $5

### 2.3 Perplexity Pro (recherche augmentée)
- [ ] https://www.perplexity.ai/api → $5+ credits OU abo Pro $20/mo
- [ ] Coffre → `ax_perplexity_key`
- **Temps** : 5 min · **Coût** : $5-20

### 2.4 DeepSeek Coder (code 12x moins cher)
- [ ] https://platform.deepseek.com → $5 credits
- [ ] Coffre → `ax_deepseek_key`
- **Temps** : 5 min · **Coût** : $5

### 2.5 Google AI Studio (Gemini gratuit jusqu'à 1500 req/jour)
- [ ] https://aistudio.google.com/apikey → Créer clé
- [ ] Coffre → `ax_gemini_key`
- **Temps** : 3 min · **Coût** : 0$

### 2.6 xAI Grok (actualité X/Twitter)
- [ ] https://console.x.ai/team → $5 credits
- [ ] Coffre → `ax_grok_key`
- **Temps** : 5 min · **Coût** : $5

### 2.7 Railway billing (vérifier ton abo actif)
- [ ] https://railway.app/account/billing → Vérifier carte enregistrée + plan Hobby $5/mo
- [ ] Token Railway pour API : Account Settings → Tokens → Coffre `ax_railway_token`

---

## 🟡 P3 — NICE TO HAVE (extensions)

### 3.1 Sentry (monitoring erreurs prod)
- [ ] https://sentry.io → Free tier 5k events/mo
- [ ] Coffre → `ax_sentry_dsn`

### 3.2 Twilio (SMS notifications)
- [ ] https://www.twilio.com → $1 credits trial
- [ ] Coffre → `ax_twilio_sid` + `ax_twilio_token`

### 3.3 Pinecone (vector KB)
- [ ] https://www.pinecone.io → Free tier 1 index
- [ ] Coffre → `ax_pinecone_key`

### 3.4 VPN iOS natif
- [ ] App Store → NordVPN ou ProtonVPN ou ExpressVPN
- [ ] **Coût** : $3-12/mo
- [ ] VPN actif partout sur iPhone (dont Apex)

### 3.5 Google Workspace email pro (kevin@apex.sbs)
- [ ] https://workspace.google.com → $6/mo
- [ ] Email pro à la place de gmail.com

---

## 📊 RÉCAP COÛTS ABOS

| Service | Coût / mois | Type | Priorité |
|---------|-------------|------|----------|
| Railway Hobby | 5€ | Backend | ✅ Actif |
| apex.sbs (annuel) | 35$/an = 3$/mo | Domaine | ✅ Actif |
| Anthropic | Pay-as-you-go (~10$/mo) | API | ✅ Actif |
| OpenAI | $5+ | API fallback | 🔴 P1 |
| Stripe | 1.4% + 0.25€ par trans | Paiements | 🔴 P1 |
| Mistral | $5+ | API EU | 🟠 P2 |
| Perplexity | $5-20 | Recherche | 🟠 P2 |
| DeepSeek | $5+ | Code | 🟠 P2 |
| Gemini | 0$ | API multimodal | 🟠 P2 |
| Grok | $5+ | API actualité | 🟠 P2 |
| Sentry | 0$ free | Monitoring | 🟡 P3 |
| Twilio | $1+ | SMS | 🟡 P3 |
| VPN | 3-12$/mo | Privacy | 🟡 P3 |

**Total minimum CRITIQUE** : ~10€/mo (Railway + Anthropic ~5€ usage)
**Total tous P1+P2** : ~50€/mo (croît avec usage)

---

## 🎯 ORDRE EXACT À SUIVRE

**MAINTENANT (10 min total)** :

1. **Tester Apex iPhone** (2 min)
2. **Anthropic solde** (1 min)
3. **PayPal.me username** (5 min) → Apex Coffre `ax_paypal_me` → tu peux déjà recevoir paiements

**Cette semaine (1h total)** :

4. **OpenAI $5** (10 min) → fallback IA + GPT-4o multimodal
5. **Gemini gratuit** (3 min) → multimodal sans coût
6. **Stripe KYC démarrage** (30 min lancement, 1-3j attente validation)

**Quand Stripe validé** :

7. Crée 4 Payment Links → Apex Configurer paiements
8. Tu peux vendre tes abos automatiquement

**Le reste (P2/P3) = optionnel pour démarrer.**

---

## ✅ DÉJÀ FAIT EN AUTONOMIE PAR CLAUDE CODE (220+ commits cette session)

### Apex AI (v12.105 → v12.155+)
- Login strict + FaceID auto + reset comptes
- Backend FastAPI Railway api.apex.sbs (déployé)
- 13 modèles IA (Claude/GPT/Gemini/Mistral/Perplexity/DeepSeek/Grok)
- Auto-routing par domaine (code/recherche/multimodal/raisonnement)
- Multi-currency 6 devises
- Localisation 14 pays + i18n FR/EN/IT
- 13 méthodes paiement (Stripe/PayPal/Crypto/IBAN/Wise/Lydia/etc.)
- Email cascade automatique 4 emails
- Référral parrainage avec bonus 50%
- GPS haute précision + geofencing
- OCR Scanner Claude Vision
- Navigateur web intégré + bookmarks
- Voice commands universels
- Agents concertation experte (10 experts par compétence)
- Health Status admin (diagnostic 1 écran)
- Services dashboard live (15 services trackés)
- Storage hybride pro (localStorage + IndexedDB + Railway)
- Worklog admin Kevin
- Per-user activity tracker
- Universal search 🔍
- Command Palette ⚡ (45+ commandes)
- Tutorial 9 guides + Onboarding pro
- Breadcrumbs visibles
- 30+ voix premium iOS
- SEO + PWA install + Open Graph
- Push notifications
- Backup nightly auto
- Service Worker pro versioning
- Feature flags ON/OFF par fonction
- Niveaux IA économie/moyen/fort par utilisateur
- Mode global niveau IA
- Reset comptes (garde Kevin + Laurence)

### CMCteams (v9.471 → v9.502+)
- Login strict + FaceID auto + niveau IA employés
- GPS auto + 4 casinos SBM auto-checkin
- Map editor multi-casinos + upload floor plan
- Touch gestures iPhone (pinch/pan/long-press)
- Live employee overlay sur carte
- Pit Boss visual map view (break box)
- 20 voix premium iOS
- Breadcrumbs
- OCR Scanner Claude Vision
- Navigateur web intégré
- Pub Apex multi-endroits + popup admin
- Smart routing IA Haiku/Sonnet/Opus
- Worklog admin + activité Claude Code
- Per-user activity tracker
- Niveau IA global employés (simplifié)

### Backend Railway (api.apex.sbs)
- FastAPI déployé
- Routes : github / chat / pdf / auth / subscription / services
- Endpoint `/api/services/balances` pour fetch live API status
- Multi-provider chat passthrough (Anthropic/OpenAI fallback)

---

## 🔄 EN COURS (subagents background)

- Services Pro Dashboard live (vServicesPro)
- Voice commands ON/OFF par fonction
- Agents experts par compétence

Reset Anthropic quota : 2:20am UTC pour relancer si besoin.

---

## 📞 SUPPORT URGENT

Si problème bloquant :
- **App ne s'ouvre pas** : supprime icône + réinstalle depuis Safari
- **IA ne répond pas** : vérifie solde Anthropic + clé dans Coffre
- **Backend down** : vérifie Railway dashboard
- **Demande Claude Code** : reviens dans la conversation

Tout est versionné Git. Aucune perte possible.
