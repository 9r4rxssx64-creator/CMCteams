# KDMC AI — Fichier Reference Persistant

> Ce fichier est la memoire de l'app KDMC. L'IA le lit et le met a jour automatiquement.
> Derniere MAJ: 2026-04-20 — v12.1

---

## Identite

- **Nom**: KDMC AI
- **Version**: v12.1
- **Createur**: Kevin DESARZENS (kevind@monaco.mc)
- **Hebergement**: GitHub Pages (9r4rxssx64-creator.github.io/CMCteams/apex-ai/)
- **Firebase**: cmcteams-c16ab-default-rtdb.europe-west1.firebasedatabase.app
- **Taille**: 575 KB monofichier HTML

---

## Projets geres depuis KDMC

| Projet | Statut | Description |
|--------|--------|-------------|
| KDMC AI | Production v12.1 | Cette app — assistant IA premium |
| CMCteams | Production v9.303 | Planning casino 258 employes |
| e-KDMC | Developpement v0.1 | E-commerce automatise |
| Remote | Integre | Telecommande universelle IR/TV/HA |
| CrackPass | Integre | Generateur/testeur MDP |
| IA-KDMC | A demarrer | Projet IA personnel |

---

## Architecture agents (26 workers)

### Systeme (7)
- Erreurs (2min) — compte erreurs/heure, alerte si >5
- Performance (1min) — DOM load time, RAM, cores
- Stockage (5min) — localStorage usage, alerte >80%
- Memoire (5min) — taille totale, conversations, messages
- Reseau (2min) — online/offline, type connexion, debit
- Session (1min) — TTL session, alerte expiration
- SW-Health (10min) — Service Worker actif et a jour

### Securite (2)
- Securite (10min) — PIN, proxy, erreurs, API key
- CrackPass-Audit (30min) — fonctions MDP operationnelles

### Qualite (5)
- Qualite (15min) — satisfaction, reactions thumbs up/down
- UX-Feedback (20min) — feedbacks 24h
- UI-Coherence (15min) — vues cassees, fonctions manquantes
- Code-Integrity (10min) — nombre fonctions, erreurs recentes
- Scalability (15min) — taille HTML, nombre fonctions

### Donnees (3)
- Data-Sync (5min) — queue sync offline, Firebase connecte
- API-Health (3min) — cle API presente, proxy configure
- Firebase-Health (5min) — connexion SSE active

### Apps (3)
- CMCteams-Watch (10min) — presence employes, chat
- Remote-Devices (5min) — IR/TV/HA connectes
- E-Commerce (10min) — produits, commandes en attente

### Automatisation (6)
- Habitudes (10min) — habitudes non cochees, rappel 20h
- Taches (5min) — taches en attente
- Backup (1h) — snapshot auto a 3h
- Auto-Cleanup (1h) — nettoie convs >60j, tronque erreurs
- Apprentissage (30min) — appareils appris, KB growth
- Auto-Learn — s'ameliore des reactions utilisateur

---

## Lecons apprises (auto-enrichi)

1. **Ne jamais hardcoder le system prompt** — toujours utiliser _buildSystemPrompt()
2. **Toujours guard admin sur les fonctions settings** — 9 fonctions corrigees
3. **Quotes dans les strings HTML** — eviter d'affaires, utiliser "CA" ou esc()
4. **SW cache** — TOUJOURS bumper avec la version app
5. **Boutons touch** — minimum 44px sur mobile
6. **Firebase user-prefix** — fbShouldSync doit checker les cles suffixees
7. **Timeout API** — toujours mettre un timeout (60s) sinon freeze
8. **CSS .ax-msg** — ne pas definir 2 fois (fusionner)
9. **axInjectFunction** — toujours guard admin (code injection)
10. **cmcRead** — proteger par admin (donnees sensibles)

---

## Regles permanentes

1. TOUT AU MAXIMUM — jamais de valeur basse par defaut
2. Agents en permanence — 26 workers actifs surveillent tout
3. Auto-apprentissage — apprend des reactions, des erreurs, s'ameliore
4. Auto-nettoyage — nettoie convs anciennes, erreurs, queue
5. Auto-backup — snapshot quotidien a 3h
6. Centralisation — toutes les donnees dans Firebase + localStorage
7. Securite 5 couches — PIN, guard admin, chiffrement, audit, kill switch
8. Self-modify — peut modifier son CSS, ses fonctions, ses tabs en direct
9. Multi-projet — gere KDMC + CMCteams + e-KDMC + Remote + CrackPass
10. Anticipation — prevoit les bugs avant qu'ils arrivent

---

## Metriques cles

- 350+ actions autonomes
- 26 workers en arriere-plan
- 13 personas
- 80+ templates pro
- 44 voix
- 6 themes
- 5 langues
- 40+ vues premium
- 23 guards login
- 23 guards admin
- 41 headers gradient
- 31 left-borders

---

## Connexions configurables

- Claude API (sk-ant-...)
- Firebase RTDB
- Sentry monitoring
- Stripe paiement
- Telegram bot
- EmailJS
- Broadlink IR
- Smart TV WiFi
- Home Assistant
- MQTT IoT
- Finnhub finance
- Cloudflare Workers

---

*Ce fichier est mis a jour automatiquement par les workers KDMC.*
