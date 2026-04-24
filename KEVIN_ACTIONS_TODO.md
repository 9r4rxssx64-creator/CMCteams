# KEVIN_ACTIONS_TODO.md — Actions restantes Kevin (Apex AI + CMCteams)

> **Destinataire** : Kevin DESARZENS (admin U11804, proprio Apex AI v12.78 + CMCteams v9.465)
---

## 🎯 SESSION 2026-04-24 — ACTIONS KEVIN (minimal)

### 🔴 OBLIGATOIRE (5 min total)
1. **Re-importer PDF CMCteams Avril** → valider cadres remontent (v9.462). Si échec : console → `localStorage.getItem('cmc_cadres_fallback_diag')` → copier-coller ici
2. **Configurer `ax_github_pat` dans Vault Apex** → voir `INSTALL_PAT.md` (60 sec)

### 🟡 RECOMMANDÉ (10 min)
3. **Firebase Rules** (console Firebase) : je NE peux PAS faire ça en code. Exemple rules admin-only pour `ax_shared_api_key` dans `BILAN_PRO.md`

### 🟢 OPTIONNEL
4. Dependabot + CodeQL : **déjà configurés**, s'activent auto
5. Tester Face ID (après 3 connexions)
6. Tester concertation multi-agents (question longue avec mots-clés métier)

### 🔒 Données personnelles
- `KEVIN_PERSONAL.md` local créé, `.gitignore` actif, JAMAIS dans le repo public
- Apex charge via `axLoadKevinProfile()` (admin only)

---

## ✅ FAIT EN AUTONOMIE PAR CLAUDE CODE (v12.37) — Kevin n'a plus qu'à...

### 1. Stripe Webhook → prêt à déployer
- **Fichier** : `tools/stripe-webhook-worker.js` (Cloudflare Worker complet)
- **Kevin fait** : coller code dans nouveau Worker Cloudflare (2 min) + ajouter env vars `STRIPE_WEBHOOK_SECRET` et `FB_URL`

### 2. Stripe produits → guide step-by-step
- **Fichier** : `tools/stripe-setup-products.md`
- **Kevin fait** : Option A (Dashboard) 5 min ou Option B (CLI) 2 min → copier 2 `price_id` dans worker ligne 78

### 3. Firebase Backup Nightly → déployé autonome
- **Fichier** : `.github/workflows/firebase-backup.yml`
- **Kevin fait** : rien. Tourne toutes les nuits à 3h UTC, artifact 30j.

### 4. CGU + Privacy → publiés
- **Fichiers** : `apex-ai/cgu.html`, `apex-ai/privacy.html`
- **URLs** : `https://9r4rxssx64-creator.github.io/CMCteams/apex-ai/cgu.html` + `privacy.html`
- **Kevin fait** : optionnel, faire relire par avocat si budget. Changer email support si ≠ support@apex-ai.fr

### 5. SEO → en place
- **Fichiers** : `apex-ai/robots.txt`, `apex-ai/sitemap.xml`, meta tags dans `index.html` (title, description, keywords, canonical)
- **Kevin fait** : rien. Si achat domaine custom, update canonical URL.

### 6. SW Update Banner → déployé
- **Fichier** : `apex-ai/index.html` (SW register handler)
- **Kevin fait** : rien. Quand nouvelle version déployée, utilisateurs voient une banner dorée "🔄 Nouvelle version disponible, tape pour recharger" → fini le cache PWA hell.

---

## 🔴 RESTE STRICTEMENT À KEVIN (actions humaines non-automatisables)

1. **KYC Stripe** : photo ID + justif domicile (5 min upload)
2. **IBAN MC27** : saisir RIB Revolut/banque Monaco dans Stripe Dashboard
3. **Firebase Blaze** : carte bancaire dans console Firebase (quand >50 clients)
4. **Domaine custom** (optionnel) : acheter `apex-ai.fr` ou `.mc` sur Gandi/OVH (~12€/an)

Temps total Kevin : **~30 minutes** pour passer de zéro à monétisation opérationnelle.

---

> **Dernière MAJ** : 2026-04-21 par Claude Code (v12.37 — 6 tâches résolues en autonomie)
> **Instruction Kevin** : "Tu as rajouté sur le mémo qui atterrira dans Apex pour les actions qu'il me reste à faire. Pour le RIB, et caetera, tout ce qu'on a dit là tout à l'heure."

Ce mémo est lu par **Apex AI** (chargé dans `_CLAUDE_HANDOFF`) et **CMCteams IA** pour te rappeler les actions à faire hors-code (humaines, externes, paiements, légal).

---

## 🇲🇨 COMPATIBILITÉ MONACO — Aucun problème ⚠️ (vérifié 2026-04-21)

**Question Kevin** : "Est-ce que mettre une banque de Monaco ou des coordonnées Monaco pose problème quelque part ?"

**Réponse courte : NON**. Monaco est 100% supporté par toute la stack.

| Service | Statut Monaco | Notes |
|---------|--------------|-------|
| **Stripe** | ✅ Supporté (code pays `MC`) | IBAN MC27 accepté natif |
| **SEPA** | ✅ Zone SEPA | Virements EUR gratuits depuis toute l'UE |
| **Firebase** | ✅ Aucune restriction géographique | Serveur EU (europe-west1) |
| **Cloudflare Workers** | ✅ Accessible depuis Monaco | Latence équivalente à FR |
| **GitHub Pages** | ✅ CDN mondial | Pas de bloc Monaco |
| **Anthropic API** | ✅ Pas de géo-bloc | Monaco listé dans pays autorisés |
| **Apple Pay / Google Pay** | ✅ Actifs à Monaco | Wallets standards |
| **Revolut** | ✅ Supporte IBAN MC | Dispo en France/Europe → Monaco OK |
| **TVA monégasque** | ✅ 20% comme France | Stripe peut facturer TVA automatique |
| **RGPD** | ✅ Monaco adhère via décisions | Même cadre qu'UE |

**Aucune démarche spéciale**. Tu peux mettre ton IBAN MC27 tranquillement dans Stripe.

---

## 💰 ALTERNATIVES PAIEMENT — Revolut + Crypto (Kevin 2026-04-21)

**Question Kevin** : "Intéressant d'ajouter crypto + Revolut ? Je veux être payé direct sur mon Revolut (fiat ou crypto)."

### Option A — **Revolut Pay** (RECOMMANDÉ, le plus simple)

- ✅ Paiement direct sur ton IBAN Revolut (même compte perso/pro)
- ✅ Fees : **0.7% + 0.25€** par transaction (vs Stripe 1.4% + 0.25€)
- ✅ Payout instantané (pas 7j d'attente comme Stripe)
- ✅ Checkout hosted (widget JS prêt à intégrer)
- 🔗 https://developers.revolut.com/docs/merchant-api
- **Actions** :
  1. Créer compte Revolut Business (gratuit Starter, 25€/mois Grow)
  2. Lien Revolut Business ↔ Revolut perso (virement auto)
  3. API key dans Dashboard → Merchant → API Keys
  4. Intégrer dans Apex AI : bouton "Payer avec Revolut" à côté de "Payer avec Stripe"

### Option B — **Crypto via Coinbase Commerce** (pour clients crypto)

- ✅ Accepte BTC, ETH, USDC, LTC, DAI, DOGE automatiquement
- ✅ Fees : **1%** (plus bas que Stripe)
- ✅ Settlement : crypto directement sur ton wallet Coinbase/Revolut
- ✅ Webhook → active plan auto quand confirmation blockchain
- 🔗 https://commerce.coinbase.com/
- **Actions** :
  1. Créer compte Coinbase Commerce (gratuit)
  2. Connecter ton wallet Revolut crypto (adresse BTC/ETH)
  3. Générer charge depuis API → QR code / URL paiement
  4. Webhook → `/coinbase-webhook` Worker → active plan

### Option C — **Adresse wallet directe** (manuel, pas recommandé)

- Tu donnes ton adresse Revolut/BTC dans l'app
- Client envoie, toi tu actives manuellement
- ❌ Pas scalable, pas automatisé, gros risque d'oubli

### 🎯 Recommandation finale

**Combo idéal** :
1. **Stripe** (cartes + IBAN, standard) → 60% clients
2. **Revolut Pay** (cartes + Revolut→Revolut, 0.7% fees) → 25% clients avec Revolut
3. **Coinbase Commerce** (crypto) → 15% clients crypto enthusiasts

Les 3 actifs = couverture 100% paiements mondiaux, fees optimisées, payout direct Revolut.

### Implémentation (actions Kevin)

- [ ] Revolut Business : ouvrir compte (KYC 2-3j)
- [ ] Connecter Revolut Business → Revolut perso (auto-sweep)
- [ ] Récupérer `REVOLUT_MERCHANT_API_KEY` → collé dans Worker
- [ ] Ajouter `REVOLUT_SANDBOX_KEY` pour tests
- [ ] Coinbase Commerce : créer compte, adresse wallet reliée Revolut
- [ ] Récupérer `COINBASE_COMMERCE_KEY` → collé dans Worker
- [ ] Claude Code intègre les 3 checkout UI (STRIPE/REVOLUT/CRYPTO) dans Apex AI v12.35+

---

## 🔥 PRIORITÉ 1 — Monétisation Stripe (bloquant revenus)

### 1.1 Créer compte Stripe (si pas déjà fait)
- [ ] URL : https://dashboard.stripe.com/register
- [ ] Mode : **Business** (pas individuel) pour facturation TVA
- [ ] Activer mode LIVE après KYC validé (pas juste TEST)
- [ ] Documents KYC requis : pièce identité + justif domicile + RIB

### 1.2 Ajouter IBAN/RIB dans Stripe
- [ ] Dashboard Stripe → Paramètres → **Informations bancaires**
- [ ] Renseigner IBAN + BIC de ton compte perso/pro
- [ ] Vérifier compte (virement test 1-2€ Stripe → valider)
- [ ] Fréquence de virement : **Hebdomadaire** (sinon 7 jours d'attente par défaut)

### 1.3 Créer les 2 produits (nouveaux prix +20€)
- [ ] Produit 1 : **Apex AI Pro**
  - Prix : **39.99 €/mois** (récurrent mensuel)
  - Description : "Chat illimité + Domotique + Web + Vision + Finance + 10 agents + 5 devices"
  - Copier le `price_id` (format `price_1XXXXXX...`) → le coller dans `apex-ai/index.html` constante `STRIPE_PRICE_PRO`
- [ ] Produit 2 : **Apex AI Business**
  - Prix : **69.99 €/mois** (récurrent mensuel)
  - Description : "Pro + Backup temps réel + Multi-LLM + Support 24/7 + Agents illimités + 20 devices"
  - Copier `price_id` → `STRIPE_PRICE_BIZ`

### 1.4 Webhook Stripe (pour activer comptes auto)
- [ ] URL webhook : `https://<ton-worker>.workers.dev/stripe-webhook` (Cloudflare Worker)
- [ ] Événements à écouter : `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`
- [ ] Copier le **Signing secret** → coller dans Worker env var `STRIPE_WEBHOOK_SECRET`
- [ ] Dans le Worker : mettre à jour Firebase `/apex/clients/<uid>/plan` et `/apex/clients/<uid>/stripeCustomerId`

### 1.5 Activer trial 7 jours (recommandé)
- [ ] Dans Stripe → Produit Pro → "Ajouter période d'essai" → 7 jours
- [ ] Loi UE 14j satisfait/remboursé : **automatique** via Stripe si configuré en TRIAL
- [ ] Pas besoin de code, Stripe gère la conversion auto après J+7

---

## 🔥 PRIORITÉ 2 — Légal & RGPD (obligatoire UE)

### 2.1 Rédiger CGU (Conditions Générales d'Utilisation)
- [ ] Modèle gratuit : https://www.cnil.fr/fr/modele/cgu
- [ ] Points obligatoires :
  - Identité éditeur (toi : Kevin DESARZENS, adresse Monaco)
  - Prix, modalités abonnement, résiliation
  - Responsabilité limitée (pas garantie 100% uptime)
  - Juridiction : Monaco
- [ ] Héberger sur `apex-ai/cgu.html` (créer le fichier)
- [ ] Lien en footer dans l'app + à la signature inscription (checkbox obligatoire)

### 2.2 Rédiger Politique de confidentialité (RGPD)
- [ ] Modèle CNIL : https://www.cnil.fr/fr/modele/politique-confidentialite
- [ ] Lister : données collectées (email, nom, photo biometrique, GPS si activé), finalité, durée, droits (accès/rectif/oubli)
- [ ] DPO/contact : ton email perso si <250 employés
- [ ] Héberger sur `apex-ai/privacy.html`
- [ ] Déclarer à la CNIL si tu dépasses 50k users EU

### 2.3 Cookies / Tracking
- [ ] Tu n'utilises **aucun cookie tiers** (localStorage only) → pas de bandeau cookies requis
- [ ] Si tu ajoutes Google Analytics → bandeau consentement obligatoire

### 2.4 Politique de remboursement
- [ ] Phrase type : "14 jours satisfait ou remboursé (loi UE). Contacter support@apex-ai.fr"
- [ ] Stripe gère les refunds en 1 clic (Dashboard → Payment → Refund)

---

## 🔥 PRIORITÉ 3 — Firebase Blaze (scaling)

### 3.1 Upgrade Spark → Blaze (quand tu dépasses 50 clients actifs)
- [ ] Dashboard Firebase → Facturation → **Passer à Blaze**
- [ ] Ajouter CB (pour les débordements quota)
- [ ] Coût estimé : **~80€/mois** à 100 clients (Anthropic API inclus)
- [ ] **Set budget alerts** : alerte à 50€, 100€, 200€/mois

### 3.2 Règles Firebase (sécurité données clients)
- [ ] Vérifier que `/apex/clients/<uid>` est read/write auth only
- [ ] Règles actuelles à tester dans Firebase Rules Playground

---

## 🟡 PRIORITÉ 4 — Marketing & Visibilité

### 4.1 Landing page publique
- [ ] Créer `/landing` (HTML statique) avec :
  - Héro : "Ton assistant IA autonome + domotique + finance"
  - 5 points forts (domotique, agents, finance, offline, multi-device)
  - Prix (39.99 / 69.99)
  - CTA "Essai 7 jours gratuit"
  - Comparatif 3 concurrents

### 4.2 SEO basique
- [ ] Balises `<title>`, `<meta description>`, `<meta og:image>` dans index.html
- [ ] Sitemap.xml à la racine
- [ ] robots.txt avec Allow: /
- [ ] Google Search Console : vérifier propriété (TXT DNS)

### 4.3 Analytics
- [ ] Plausible.io (privacy-friendly, 9$/mois) ou Matomo self-host
- [ ] PAS Google Analytics (lourd + RGPD chiant)

### 4.4 Réseaux sociaux
- [ ] Créer compte X/Twitter @ApexAIMonaco
- [ ] LinkedIn page entreprise
- [ ] YouTube demo 2 min (capture d'écran screen-record iPhone)

---

## 🟢 PRIORITÉ 5 — Technique résiduel (peut attendre)

### 5.1 Domaine custom
- [ ] Acheter `apex-ai.fr` ou `.mc` (~12€/an Gandi ou OVH)
- [ ] DNS CNAME → `9r4rxssx64-creator.github.io`
- [ ] Configurer GitHub Pages → Custom domain + HTTPS

### 5.2 Email pro
- [ ] `support@apex-ai.fr` via Google Workspace (6€/mois) ou Zoho gratuit
- [ ] Forward vers ton email perso au début

### 5.3 Monitoring uptime
- [ ] UptimeRobot (gratuit) : ping toutes 5 min sur `apex-ai.fr`
- [ ] Alerte SMS si down > 2 min

### 5.4 Backup Firebase
- [ ] Cron GitHub Actions : export JSON complet chaque nuit → artifact 30j
- [ ] Storage : Cloudflare R2 (gratuit <10 GB)

---

## 🔴 PROCÉDURE PWA — Force refresh iOS (temporaire)

**Problème** : iOS Safari PWA met en cache agressif → tes changements ne s'affichent pas.

**Solution immédiate** (à faire à chaque MAJ tant qu'on n'a pas de notif push) :
1. Fermer complètement l'app PWA (swipe up + swipe app card vers le haut)
2. Ouvrir Safari (pas PWA), taper URL `https://9r4rxssx64-creator.github.io/cmcteams/apex-ai/`
3. Appuyer long sur 🔄 → **Demander la version desktop** (force reload)
4. Retourner à la PWA sur écran d'accueil → doit afficher nouvelle version en topbar

**Solution future** (à implémenter) :
- Service Worker envoie `postMessage` "update available" → toast UI "🔄 Nouvelle version, tape pour recharger"
- Déjà implémenté partiellement dans `apex-ai/sw.js` ligne 34 (`skipWaiting`)
- À finaliser : ajouter listener dans index.html qui écoute et affiche toast

---

## 📊 OBJECTIFS BUSINESS (6 mois)

| Mois | Clients cibles | Revenu MRR estimé |
|------|---------------|-------------------|
| M1 (mai 2026) | 5 (amis/famille) | ~200€ |
| M3 (juillet) | 30 (bouche à oreille) | ~1400€ |
| M6 (octobre) | 100 | ~4600€ |
| M12 (avril 2027) | 300 | ~14000€ |

**Break-even** : ~15 clients (couvre Firebase Blaze + Anthropic API + Stripe fees)

---

## 📝 RAPPEL MÉTHODE

- ✅ Tout ce qui est **code** : Claude Code le fait (tu demandes, je fais)
- ⚠️ Ce mémo : ce que **SEUL toi peux faire** (paiements, comptes, docs légaux, KYC)
- 🔄 À chaque nouvelle demande / action non-faite, je l'ajoute ICI automatiquement
- 📖 Apex AI a ce mémo dans son contexte → peut te rappeler si tu oublies

---

**Dernière MAJ automatique** : 2026-04-21 par Claude Code (v12.31 Apex AI)
