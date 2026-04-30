# tools/social — Pipeline vidéo automatisé multi-plateformes

> Système autonome de génération + publication de vidéos faceless pour YouTube, TikTok, Instagram Reels, Facebook, X.
> Stratégie ROI : narrative storytelling long-form (RPM $12.82, croissance 21x en 2026).

---

## 🎬 Ce que ça fait

1. **Génère un script** depuis la bibliothèque `config/content-library.json`
2. **Synthétise la voix** (TTS) — espeak-ng (local, gratuit) ou Edge TTS (qualité premium)
3. **Synchronise les sous-titres** word-by-word style TikTok karaoké
4. **Rend les frames** PNG 30fps avec animations cinéma (gradient, vignette, captions pop-in)
5. **Compile en MP4** H.264 + AAC + musique de fond optionnelle
6. **Publie** sur YouTube / TikTok / Instagram Reels / Facebook / X (selon clés API)
7. **Notifie via Telegram** la livraison

Format supporté :
- **Long-form** 1920x1080 (16:9) — pour YouTube principal
- **Short-form** 1080x1920 (9:16) — pour TikTok, Reels, Shorts

---

## 🚀 Quick Start

```bash
# 1. Installer les dépendances
cd tools/social && npm install

# 2. Installer espeak-ng (TTS local)
sudo apt-get install -y espeak-ng

# 3. Lister les histoires disponibles
node cli.js list-stories

# 4. Générer une vidéo test
node cli.js generate --story fact-short-001 --format short

# Résultat : output/fact-short-001/fact-short-001_short.mp4
```

---

## 📁 Architecture

```
tools/social/
├── cli.js                          # Interface CLI principale
├── package.json
│
├── config/
│   ├── platforms.json              # Specs par plateforme (formats, limites)
│   └── content-library.json        # Pool d'histoires/scripts
│
├── engine/
│   ├── tts.js                      # TTS multi-backend (Edge + espeak-ng)
│   ├── subtitle-engine.js          # Sync mots/audio
│   ├── base-renderer.js            # Primitives canvas (palette, fonts)
│   ├── frame-generator.js          # Génère séquence PNG d'une scène
│   └── compiler.js                 # FFmpeg + audio mux
│
├── templates/
│   └── narrative-storytelling.js   # Template principal (faceless)
│
├── publishers/
│   ├── base-publisher.js           # Retry, validation, logging
│   ├── facebook.js                 # Upload vidéo + Reels
│   └── instagram.js                # Reels (via URL publique)
│
└── assets/
    ├── music/                      # Tracks royalty-free MP3 (à ajouter)
    └── backgrounds/                # Images de fond (optionnel)
```

---

## 🎯 CLI complet

| Commande | Description |
|----------|-------------|
| `node cli.js list-stories` | Liste les histoires de la bibliothèque |
| `node cli.js list-voices` | Liste les voix TTS disponibles |
| `node cli.js test-tts --text "..."` | Test rapide de génération vocale |
| `node cli.js generate --story <id> --format short\|long` | Génère une vidéo |
| `node cli.js generate --random --format long` | Sélection aléatoire |
| `node cli.js generate --story <id> --send-telegram` | Génère + envoie sur Telegram |
| `node cli.js publish-telegram --video <path>` | Envoie une vidéo existante |
| `node cli.js status` | Liste les vidéos générées |

### Options `generate`
- `--type narrative` : Type de contenu (défaut)
- `--story <id>` : ID spécifique
- `--random` : Sélection aléatoire
- `--format long|short` : Format vidéo
- `--music <path>` : Musique de fond MP3
- `--bg <path>` : Image de fond
- `--send-telegram` : Envoie après génération
- `--keep` : Garde les frames PNG (debug)
- `--verbose` : Logs ffmpeg

---

## 🔧 Configuration des plateformes

### Variables d'environnement par plateforme

Stocker dans `~/.claude/secrets/cmcteams.env` (jamais commité) :

```bash
# Telegram (notifications + livraison)
export TELEGRAM_BOT_TOKEN="..."
export TELEGRAM_CHAT_ID="..."

# Facebook + Instagram (le même token)
export FB_PAGE_ID="..."
export FB_PAGE_TOKEN="..."
export IG_USER_ID="..."
export IG_ACCESS_TOKEN="${FB_PAGE_TOKEN}"   # même valeur

# YouTube (à venir — voir tools/social/docs/setup-youtube.md)
export YOUTUBE_CLIENT_ID="..."
export YOUTUBE_CLIENT_SECRET="..."
export YOUTUBE_REFRESH_TOKEN="..."

# TikTok (à venir — voir tools/social/docs/setup-tiktok.md)
export TIKTOK_CLIENT_KEY="..."
export TIKTOK_CLIENT_SECRET="..."
export TIKTOK_ACCESS_TOKEN="..."

# X / Twitter (à venir)
export TWITTER_API_KEY="..."
export TWITTER_API_SECRET="..."
export TWITTER_ACCESS_TOKEN="..."
export TWITTER_ACCESS_SECRET="..."
```

Charger avant utilisation :
```bash
source ~/.claude/secrets/cmcteams.env
```

---

## 📊 Stratégie de monétisation (basée sur données réelles 2026)

### RPM par niche (revenus pour 1000 vues)

| Niche | RPM | Croissance | Status |
|-------|-----|------------|--------|
| **Narrative storytelling** (trahison, revenge) | **$12.82** | **21x** | Priorité 1 |
| Finance / Make Money Online | $10-15 | Stable | Priorité 2 |
| True crime documentaires | $8-12 | Forte | Priorité 2 |
| Soundscapes / Sleep | $10-11 | 19x | Niche calme |
| Animated storytelling | $9-13 | Forte | Effort moyen |

### Long-form vs Shorts

- **YouTube Shorts** : $0.01-0.05 / 1000 vues → 20-100M vues pour 1000€/mois
- **YouTube Long-form** : $4-15 / 1000 vues → 67K-250K vues pour 1000€/mois

**→ Long-form paie 100x plus.** Les Shorts servent à attirer du trafic vers le long-form.

### Timeline réaliste

| Période | Revenus | Phase |
|---------|---------|-------|
| Mois 1-3 | $0 | Construction library |
| Mois 4-6 | $0-50 | Premiers abonnés |
| Mois 6-12 | $50-500/mois | Seuil monétisation atteint |
| Mois 12-18 | $500-3000/mois | Compounding |
| Mois 18-24+ | $2500-10000/mois | Si constant |

### ⚠️ Politique YouTube (2025-2026)

YouTube interdit les vidéos "mass-produced, no creative input". Pour rester monétisable :
- ✅ Direction créative humaine (validation des scripts)
- ✅ Stories originales ou angle unique
- ✅ Voix variées + musique soigneusement choisie
- ❌ Pas de pure IA générique copié-collé

---

## 💰 Coût total

**Près de zéro** :
- TTS : espeak-ng (gratuit, local) ou edge-tts (gratuit, internet)
- Rendering : node-canvas (gratuit)
- Encoding : FFmpeg (gratuit)
- Musique : Pixabay/Uppbeat (royalty-free)
- Hosting : GitHub Pages / Google Drive (gratuit)
- Cron : GitHub Actions (gratuit)

Comparé aux outils SaaS (InVideo, Fliki, Pictory) à $78-120/mois.

---

## 🛠 Roadmap (prochaines étapes)

### Phase 2 (en cours)
- [ ] Publisher YouTube (googleapis SDK)
- [ ] Publisher TikTok (sandbox API)
- [ ] Publisher X / Twitter (OAuth 1.0a)
- [ ] Extracteur de Shorts depuis long-form

### Phase 3
- [ ] Scheduler cron + GitHub Actions
- [ ] Dashboard analytics multi-plateformes
- [ ] Génération de miniatures auto
- [ ] Bibliothèque content : 100+ histoires

### Phase 4
- [ ] Voix Edge TTS (besoin accès `speech.platform.bing.com`)
- [ ] Templates supplémentaires : finance, true-crime, motivation
- [ ] A/B testing miniatures
- [ ] Auto-réponse aux commentaires (avec validation admin)

---

## 🔐 Sécurité

- Toutes les clés API → `~/.claude/secrets/` (jamais dans le repo)
- Environnement de production → GitHub Secrets
- Validation manuelle via Telegram avant publication
- Rate-limiting par plateforme
- Logs de publication dans `output/_publish-log.json`

---

## 📝 Sources & références

- [YouTube CPM/RPM 2026 — OutlierKit](https://outlierkit.com/blog/most-profitable-youtube-niches)
- [Faceless Channel Earnings Strategy](https://www.unkoa.com/faceless-youtube-10000-month-2025/)
- [Faceless YouTube Automation Guide 2026](https://tamzidulhaque.com/youtube-automation-business-2026-guide-faceless-adsense/)
- [msedge-tts npm](https://www.npmjs.com/package/msedge-tts)
- [espeak-ng documentation](https://github.com/espeak-ng/espeak-ng)
