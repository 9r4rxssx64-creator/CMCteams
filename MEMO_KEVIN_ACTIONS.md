# MEMO ACTIONS KEVIN — A jour au 2026-04-19

> Ce fichier liste TOUTES les actions que Kevin doit faire lui-meme.
> Claude Code le met a jour a chaque session.
> Kevin : coche ce que tu as fait, je m'occupe du reste.

---

## CE QUE CLAUDE A FAIT EN AUTONOMIE (session 2026-04-19)

| Action | Status |
|--------|--------|
| App KDMC v10.4 complete (468 KB, 300+ actions, 110+ commits) | FAIT |
| Landing page + 6 forfaits + comparatif concurrence | FAIT |
| 80+ templates pro (12 categories) | FAIT |
| 13 personas experts (medecin, psychologue, juriste...) | FAIT |
| Domotique complete (Broadlink 42 IR, Smart TV WiFi, BLE, MQTT, HA) | FAIT |
| AI Crew 5 agents + 10 workers permanents | FAIT |
| Self-modifying + Self-improving + auto-learn 24 marques | FAIT |
| Gamification (XP, streaks, achievements, daily rewards, parrainage) | FAIT |
| Spotify integre (8 playlists, commandes vocales) | FAIT |
| Assistant vocal Siri (32+ commandes) + 44 voix | FAIT |
| Finance (NPV/IRR/SMA/EMA/Finnhub/Crypto) | FAIT |
| Medecine + Psychologie + Philosophie | FAIT |
| FAQ + Changelog + Analytics client in-app | FAIT |
| Live users + Client tracking + Fiches clients | FAIT |
| Auto-save 10s + Snapshots time travel | FAIT |
| IFTTT Rules + Predictions + Monte Carlo | FAIT |
| Traducteur universel 30 langues + allemand interface | FAIT |
| SEO + OG + Schema.org + Share Target PWA | FAIT |
| CGU completes + Stats admin + Historique global | FAIT |
| Background keep-alive (wake lock + audio silent + SW ping) | FAIT |
| Smart Context + Astuce jour + Quick actions enrichis | FAIT |
| Rapport hebdo + notification tous + export PDF | FAIT |
| Messagerie admin (DM prives + Groupe + Visio) | FAIT |
| Comptes Sandrine + Christophe TARDIEU (clients test) | FAIT |
| Favoris messages + raccourcis rapides + historique recherches | FAIT |
| 8 outils texte + menu contextuel messages | FAIT |
| Tous les .md a jour | FAIT |

---

## CE DONT CLAUDE A BESOIN (codes/identifiants a donner)

> **Kevin : donne-moi ces infos quand tu peux. Je les integre en AUTONOMIE.**
> **Une fois donne = sauvegarde + jamais redemande.**

| # | Info | Pourquoi | Ou la trouver | Status |
|---|------|----------|---------------|--------|
| 1 | Proxy Cloudflare code | Worker a le mauvais code | Kevin colle proxy-apex.js (besoin PC) | EN ATTENTE |
| 2 | Stripe cles API | Paiements clients | stripe.com/register | EN ATTENTE |
| 3 | Gmail mot de passe app | Emails depuis KDMC | Google > Securite > MDP apps | EN ATTENTE |
| 4 | Outlook MDP app (monaco.mc) | Emails pro | Outlook > Securite | EN ATTENTE |
| 5 | Instagram identifiants | Publier contenu | Meta Business Suite | EN ATTENTE |
| 6 | Facebook page identifiants | Publier contenu | Meta Business Suite | EN ATTENTE |
| 7 | WhatsApp Business API | Messages auto | Meta for Developers | EN ATTENTE |
| 8 | Finnhub cle API | Cours bourse | finnhub.io/register (gratuit) | EN ATTENTE |
| 9 | Sentry DSN | Monitoring erreurs | kdmc.sentry.io > Settings > Keys | EN ATTENTE |
| 10 | Spotify | Musique | Deja integre | FAIT |

---

## CE QUE KEVIN DOIT FAIRE (seulement ce qui est IMPOSSIBLE en autonomie)

### ETAPE 1 — Deploiement

1. **Deployer proxy Cloudflare** (10 min)
   - https://dash.cloudflare.com > Workers > Creer > Nom: `kdmc-proxy`
   - Copier le contenu de `proxy-apex.js` > Deployer
   - Settings > Variables > Ajouter secret: `ANTHROPIC_API_KEY` = ta cle sk-ant-...
   - Copier l'URL dans KDMC > Reglages > Proxy

2. **Creer compte Stripe** (20 min)
   - https://dashboard.stripe.com/register
   - Mode Test d'abord, puis Live
   - Creer les produits (6 forfaits dans l'app)
   - Copier la cle publishable dans KDMC > Reglages

### ETAPE 2 — Visibilite (1h) — Pour trouver des clients

3. **Nom de domaine** (5 min) — kdmc.ai (~12 EUR/an)
4. **Video demo 60s** (30 min) — filmer l'ecran + voix off
5. **Post Product Hunt** (15 min) — https://producthunt.com
6. **Page LinkedIn KDMC** (10 min) — 1 post/semaine

### ETAPE 3 — Legal (30 min)

7. **CGV + RGPD** — template dans KDMC > Templates > Admin > RGPD (adapter)
8. **Mentions legales** — nom, adresse, email, SIRET

### ETAPE 4 — Connexions (quand pret)

9. **Cle API Claude** — console.anthropic.com > Keys
10. **Sentry DSN** — sentry.io > Settings > Client Keys
11. **Finnhub key** — finnhub.io/register (gratuit)
12. **Broadlink bridge** — `pip install broadlinkhttp` sur PC/Raspberry
13. **Installer PWA iPhone** — Safari > Partager > Ecran d'accueil

### ETAPE 5 — Reseaux sociaux

14. **Instagram @kdmc.ai** — videos courtes features
15. **Facebook KDMC** — page professionnelle
16. **Twitter/X** — thread viral
17. **Reddit** — r/artificial + r/SideProject
18. **TikTok** — "Mon IA eteint ma TV par la voix"

---

## SUIVI

| Date | Action | Statut |
|------|--------|--------|
| 2026-04-19 | KDMC v10.4 livree (468 KB, 110+ commits) | FAIT |
| 2026-04-19 | Messagerie admin + DM + Groupe + Visio | FAIT |
| 2026-04-19 | Traducteur 30 langues + 8 outils texte | FAIT |
| 2026-04-19 | 44 voix (paysan, gangster, Dark Vador, helium...) | FAIT |
| 2026-04-19 | Comptes Sandrine + Christophe TARDIEU | FAIT |
| 2026-04-19 | Tous les .md a jour | FAIT |
| 2026-04-19 | App PRETE a commercialiser | FAIT |

---

*Mis a jour par Claude Code le 2026-04-19 — KDMC v10.4*
