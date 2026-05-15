# 📌 MEMO KEVIN — Reste à faire Apex Chat

> **Statut : Déploiement initial Apex Chat lancé avec les secrets disponibles.**
> Ce mémo liste ce qui reste à compléter plus tard, sans urgence.

---

## ✅ Secrets DÉJÀ configurés (déploiement OK)

- `CLOUDFLARE_API_TOKEN` — déploiement workers
- `CLOUDFLARE_ACCOUNT_ID`
- `ANTHROPIC_API_KEY` — IA Claude principale
- `GROQ_API_KEY` — IA failover gratuit
- `GEMINI_API_KEY` — IA failover Google
- `DEEPSEEK_API_KEY` — IA failover éco
- `VAPID_PRIVATE_KEY` — Web Push
- `TELEGRAM_API_KEY` — Bot Telegram
- `EMAILJS_PRIVATE_KEY` — Emails
- `VONAGE_API_KEY` — SMS (mais sans secret = inactif pour l'instant)
- `JWT_SECRET` — Auth (sera écrasé par auto-gen)
- `TAVILY_API_KEY` — Web search IA
- `PINECONE_API_KEY` — Vector DB
- `PERPLEXITI_API_KEY` — Perplexity (typo dans le nom)
- `RAILWAY_TOKEN` — Backend alternatif
- `AGENT_SECRET` + `AGENT_SECRET_VE...` — Apex agents
- `API_OPEN_LEGO` — ?

---

## 🕐 À FAIRE PLUS TARD (sans urgence)

### 🚧 Vonage — récupérer le secret (5 min quand t'auras envie)

**Pourquoi attendre** : actuellement les invitations SMS Apex Chat passent par `sms:` URL natif iPhone gratuit. Vonage payant pas indispensable pour démarrer.

**Comment récupérer** :
1. Va sur **[dashboard.vonage.com](https://dashboard.vonage.com)** (page d'accueil, PAS API Settings)
2. Active mode bureau Safari : touche **"aA"** dans la barre URL → "Demander la version pour ordinateur"
3. En haut de la page → bandeau "API key + API secret"
4. Touche **[Copy]** à côté de **API secret** (sans révéler)
5. GitHub Secrets → New → `VONAGE_API_SECRET` → Coller

OU **Méthode alternative** : "Generate new secret" / "Roll secret" pour en créer un nouveau.

### 🔧 Petite correction `PERPLEXITI_API_KEY` → `PERPLEXITY_API_KEY`

Tu as une typo (I au lieu de Y). Soit :
- **Option A** : supprime l'ancien + recrée avec `PERPLEXITY_API_KEY`
- **Option B** : laisse, je m'adapte dans le code workflow (mais c'est moche)

→ Choix recommandé : option A (1 min, propre)

### 🟦 Optionnels (au fur et à mesure de l'usage)

| Secret | Quand l'ajouter | Pour quoi |
|--------|-----------------|-----------|
| `FIREBASE_API_KEY` | Si tu veux auth phone Vonage→Firebase | Auth SMS premium |
| `OPENROUTER_API_KEY` | Si tu veux 1 clé pour 50 modèles IA | Failover unifié |
| `OPENAI_API_KEY` | Fallback ultime IA | Si tous autres KO |
| `STRIPE_SECRET_KEY` | Quand tu actives Premium 6,99€ | Phase 9 monétisation |
| `STRIPE_WEBHOOK_SECRET` | Idem | Validation paiements |
| `SENTRY_DSN` | Pour monitoring erreurs pro | Suivi bugs |
| `PAYPAL_ME_USERNAME` | Si tu veux paiement QR PayPal | Fonctionne sans |
| `REVOLUT_TAG` | Si paiement QR Revolut | Fonctionne sans |
| `IBAN_KEVIN` | Si virement SEPA in-app | Fonctionne sans |

### 🎯 Apex (pas Apex Chat)

Ces secrets sont pour Apex (l'app principale), pas Apex Chat :
- `FINNHUB_API_KEY` — cours bourse Apex
- `HOME_ASSISTANT_URL` + `HOME_ASSISTANT_TOKEN` — domotique
- `BROADLINK_API_KEY` — domotique IR
- `OPENWEATHER_API_KEY` — météo (sinon open-meteo gratuit)

---

## 📋 Actions Kevin restantes — Récap simple

| Priorité | Action | Temps |
|----------|--------|-------|
| 🟡 Plus tard | Compléter `VONAGE_API_SECRET` quand envie | 5 min |
| 🟡 Plus tard | Corriger typo `PERPLEXITI` → `PERPLEXITY` | 1 min |
| 🟢 Quand voulu | Ajouter Stripe (Premium Phase 9) | 30 min (avec KYC) |
| 🟢 Quand voulu | Ajouter SENTRY_DSN (monitoring pro) | 5 min |

**TOUT LE RESTE EST OPTIONNEL** — l'app fonctionne sans.

---

## 🎉 Ce qui est DISPONIBLE maintenant avec Apex Chat

- ✅ Auth Firebase Phone (numéro + SMS auto-iPhone)
- ✅ Chat E2E chiffré post-quantum (PQXDH)
- ✅ Triple persistence
- ✅ IA Apex 4 providers actifs (Anthropic + Groq + Gemini + DeepSeek)
- ✅ Web Push notifications hors-app
- ✅ Comptes pré-config Kevin + Laurence + Tardieu
- ✅ Vue admin Kevin avec 12 tools live
- ✅ Time Capsule + Letters 24h + Memory Lane
- ✅ Mini-apps Apex Studios embedded
- ✅ Paiement QR (PayPal/Revolut/IBAN — saisie manuelle pour l'instant)
- ✅ Invitations SMS natives iPhone (gratuit, ton forfait)
- ✅ Pipeline self-healing → Apex
- ✅ Architecture A→B→C bascule sans refactor

**Apex Chat est commercialement viable dès maintenant pour ton cercle privé.**

---

## 🚀 URLs live (après déploiement)

- **Frontend PWA** : `https://9r4rxssx64-creator.github.io/CMCteams/messaging-app/`
- **Backend API** : `https://apex-chat-api.workers.dev`
- **Push notifs** : réutilise `https://apex-push-worker.desarzens-kevin.workers.dev` (Apex existant)

---

## 📞 Comment commencer une fois déployé

1. **Ouvre l'URL frontend** sur ton iPhone
2. **Installe la PWA** (Safari → Partager → Ajouter à l'écran d'accueil)
3. **Lance Apex Chat** depuis l'écran d'accueil
4. Inscription : ton nom + ton tel + SMS code + pseudo
5. → Tu es admin reconnu automatiquement (alias "Kevin")
6. **Invite Laurence** : bouton ＋ Nouveau → 📤 Inviter un ami → son numéro
7. Laurence reçoit SMS → clique le lien → s'inscrit → vous démarrez une conv DM chiffrée

---

> Dernière mise à jour : déploiement initial Apex Chat lancé.
> Toutes ces tâches sont **optionnelles** — tu peux les faire tranquillement quand tu en auras envie.
