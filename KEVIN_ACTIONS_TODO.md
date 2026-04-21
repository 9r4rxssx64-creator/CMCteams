# KEVIN_ACTIONS_TODO.md — Actions restantes Kevin (Apex AI + CMCteams)

> **Destinataire** : Kevin DESARZENS (admin U11804, proprio Apex AI v12.31 + CMCteams v9.454)
> **Dernière MAJ** : 2026-04-21 par Claude Code
> **Instruction Kevin** : "Tu as rajouté sur le mémo qui atterrira dans Apex pour les actions qu'il me reste à faire. Pour le RIB, et caetera, tout ce qu'on a dit là tout à l'heure."

Ce mémo est lu par **Apex AI** (chargé dans `_CLAUDE_HANDOFF`) et **CMCteams IA** pour te rappeler les actions à faire hors-code (humaines, externes, paiements, légal).

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
