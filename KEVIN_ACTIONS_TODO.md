# KEVIN_ACTIONS_TODO.md — Tâches par priorité

## PRIORITÉ 1 — Token GitHub pour l'app (5 min)

Pour que le bouton "Générer" de ton app KDMC Studio publie directement sur YouTube :

1. Ouvre https://github.com/settings/tokens
2. Clique **"Generate new token (classic)"**
3. Nom : `KDMC Studio`
4. Coche : `repo` + `workflow`
5. Clique **"Generate token"**
6. Copie le token (commence par `ghp_`)
7. Ouvre ton app KDMC Studio → onglet **Réglages** → colle le token → **Connecter**

Après ça, le bouton "Générer" dans l'app lance tout automatiquement.

---

## PRIORITÉ 2 — Monétisation YouTube (quand tu atteins 1 000 abonnés)

YouTube te paie via virement bancaire (IBAN). Voici ce qu'il faudra faire :

1. Atteindre **1 000 abonnés + 4 000 heures de visionnage**
2. Aller sur https://www.youtube.com/account_monetization
3. Activer la monétisation → accepter les conditions
4. Créer un compte **Google AdSense** (ils demandent ton IBAN)
5. Google vérifie ton adresse (courrier avec code PIN, 2-3 semaines)
6. L'argent arrive par **virement bancaire chaque mois** (seuil minimum 70€)

Pas de PayPal ni Revolut — YouTube passe uniquement par virement IBAN.

---

## PRIORITÉ 3 — YouTube OAuth finalisé depuis ordi (FAIT ✅)

- ✅ Projet Google Cloud "KDMC SOCIAL" créé
- ✅ YouTube Data API v3 activée
- ✅ Client OAuth créé (Web client 1)
- ✅ Email testeur ajouté
- ✅ Refresh token obtenu et ajouté dans GitHub Secrets
- ✅ Secrets configurés : `GEMINI_API_KEY` + `YOUTUBE_CLIENT_ID` + `YOUTUBE_CLIENT_SECRET` + `YOUTUBE_REFRESH_TOKEN`

**Client ID** : `768871435113-09p70spa7k18gia9mibht34p2g2eb9ut.apps.googleusercontent.com`

---

## PRIORITÉ 4 — Telegram (5 min, optionnel)

Pour recevoir une notification sur ton téléphone à chaque vidéo publiée :

1. Ouvre Telegram, cherche **@BotFather**
2. Tape `/newbot`, choisis un nom
3. Copie le token
4. Envoie un message à ton bot puis ouvre `https://api.telegram.org/bot<TOKEN>/getUpdates`
5. Copie le `chat_id`
6. Ajoute 2 secrets GitHub : `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID`

---

## PRIORITÉ 5 — Apple Store Apex (plus tard)

Objectif : transformer Apex PWA → app native iOS sur Apple App Store.
- Apple Developer Program $99/an
- Option recommandée : Capacitor (garde le code web, wrapper natif)
- Prérequis : Apex stabilisé 100/100

---

## CE QUI MARCHE DÉJÀ (rien à faire)

- ✅ Pipeline vidéo 100% autonome (cron quotidien 12h Monaco)
- ✅ 51 stories prêtes (10 niches)
- ✅ Publication YouTube automatique
- ✅ App KDMC Studio : https://9r4rxssx64-creator.github.io/CMCteams/tools/social/app/
- ✅ 78 tests, 28 fichiers JS, 18 commandes CLI
- ✅ 5 templates, 9 langues, 10 color schemes

## RÈGLE PERMANENTE — Toutes les apps en français (Kevin 2026-05-18)

---

## OUTILS GRATUITS À INTÉGRER (liens directs)

| Outil | Gratuit | Usage | Lien |
|-------|---------|-------|------|
| Canva | Oui (gratuit) | Thumbnails, visuels | https://www.canva.com |
| Pixabay Music | Oui | Musique de fond gratuite | https://pixabay.com/music |
| YouTube Audio Library | Oui | Musique libre de droits | https://www.youtube.com/audiolibrary |
| Pollinations.ai | Oui (illimité) | Images IA pour backgrounds | https://pollinations.ai |
| Suno | 50 crédits/jour gratuit | Musique IA | https://suno.com |
| Opus Clip | 60 min/mois gratuit | Auto-extract Shorts viraux | https://www.opus.pro |
| TubeBuddy | $2/mois | SEO YouTube, A/B test titres | https://www.tubebuddy.com |
| Uppbeat | 10/mois gratuit | Musique royalty-free | https://uppbeat.io |
| OpenRouter | Gratuit (30+ modèles) | Scripts IA alternatif Gemini | https://openrouter.ai |
| Incompetech | Gratuit (attribution) | 2000+ tracks Kevin MacLeod | https://incompetech.com/music |
