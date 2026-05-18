# tools/social — Pipeline vidéo automatisé expert+++ multi-plateformes

> Système autonome de génération + publication de vidéos faceless pour YouTube, TikTok, Instagram Reels, Facebook, X.
> 8 900+ lignes · 28 fichiers · 78 tests · 51 stories · 18 commandes · 9 langues · 6 plateformes

---

## 🎬 Ce que ça fait

1. **Génère un script** depuis la bibliothèque (51 stories) ou via IA (Gemini/Gemma 4)
2. **Synthétise la voix** — Edge TTS (300+ voix neural, 9 langues) + espeak-ng fallback
3. **Synchronise les sous-titres** word-by-word style TikTok karaoké
4. **Rend les frames** PNG 30fps avec animations cinéma
5. **Compile en MP4** H.264 + AAC + musique de fond
6. **Génère thumbnails** IA (6 layouts × 10 color schemes)
7. **Analyse le score viral** + optimise titres/hooks
8. **Génère métadonnées SEO** (YouTube chapitres, TikTok #fyp, IG hashtags)
9. **Repurpose** en 14 contenus (Twitter thread, IG carousel, LinkedIn, blog, newsletter)
10. **Publie** sur YouTube / TikTok / Instagram / Facebook / Telegram
11. **Track les analytics** (RPM, revenue, engagement)

---

## 🚀 Quick Start

```bash
cd tools/social && npm install
sudo apt-get install -y espeak-ng    # TTS offline
mkdir -p data                        # Analytics/scheduler storage

node cli.js list-stories             # 51 stories disponibles
node cli.js generate --random --format short
node cli.js viral --action score --story betrayal-001
node cli.js seo --story betrayal-001
node cli.js repurpose --story betrayal-001 --export
```

---

## 📁 Architecture

```
tools/social/
├── cli.js                              # CLI 18 commandes
├── engine/                             # 15 modules
│   ├── compiler.js                     # FFmpeg H.264/VP9
│   ├── tts.js                          # TTS Edge + espeak-ng
│   ├── subtitle-engine.js              # Sync mot-par-mot
│   ├── frame-generator.js              # Frames PNG 30fps
│   ├── base-renderer.js                # Palette, fonts, Ken Burns
│   ├── script-generator.js             # Scripts IA (Gemini)
│   ├── shorts-extractor.js             # Clips 9:16
│   ├── thumbnail-generator.js          # Thumbnails IA 6 layouts
│   ├── analytics.js                    # RPM, revenue, tendances
│   ├── ab-testing.js                   # Z-test statistique
│   ├── branding.js                     # Watermark, intro/outro
│   ├── multi-lang.js                   # 9 langues + traduction
│   ├── viral-optimizer.js              # Scoring viral + hooks
│   ├── content-repurposer.js           # 1 vidéo → 14 contenus
│   └── seo-optimizer.js                # SEO multi-plateforme
├── templates/                          # 5 styles vidéo
│   ├── narrative-storytelling.js       # Faceless (niche #1)
│   ├── documentary.js                  # Ken Burns
│   ├── listicle.js                     # Top-N countdown
│   ├── breaking-news.js                # Breaking news
│   └── tutorial.js                     # Éducatif
├── publishers/                         # 4 APIs
│   ├── youtube.js                      # YouTube Data API v3
│   ├── facebook.js                     # Graph API + Reels
│   ├── instagram.js                    # Reels
│   └── base-publisher.js               # Retry, logging
├── scheduler/                          # Automation
│   ├── scheduler.js                    # Queue + calendrier
│   └── cron-runner.js                  # Runner standalone
├── tests/test-all.js                   # 78 tests
├── config/
│   ├── content-library.json            # 51 stories, 10 niches
│   └── platforms.json                  # Specs plateformes
└── data/                               # Persistance JSON
```

---

## 🎯 CLI — 18 commandes

### Core
```bash
node cli.js list-stories
node cli.js list-voices
node cli.js test-tts --text "Hello" --voice en-US-GuyNeural
node cli.js generate --random --format long --template documentary
node cli.js generate --ai-script --niche betrayal --format short
node cli.js generate-script --niche mystery --count 5
node cli.js extract-shorts --video X.mp4 --count 3
node cli.js publish --platform youtube --video X.mp4
node cli.js publish-telegram --video X.mp4
node cli.js status
```

### Advanced
```bash
node cli.js thumbnail --title "..." --variants
node cli.js analytics --action report --format html
node cli.js experiment --action create --variants "A,B,C"
node cli.js schedule --action calendar --days 30
node cli.js brand --action list
node cli.js translate --text "..." --to fr
node cli.js viral --action score --story betrayal-001
node cli.js repurpose --story betrayal-001 --export
node cli.js seo --story betrayal-001
```

---

## 📊 Monétisation (données 2026)

| Niche | RPM moyen | Range |
|-------|-----------|-------|
| Finance | $15.30 | $10-20 |
| Betrayal | $12.82 | $8-15 |
| True Crime | $11.00 | $7-14 |
| Mystery | $9.20 | $6-12 |
| Motivation | $5.80 | $4-8 |

Long-form paie **100x** plus que Shorts. Les Shorts servent à attirer du trafic.

---

## 🤖 GitHub Actions (autonome)

| Workflow | Déclencheur | Fonction |
|----------|-------------|----------|
| `social-publish.yml` | Quotidien 12h UTC | Génère + publie 1 vidéo |
| `social-scheduler.yml` | Toutes les 6h | Smart scheduler multi-plateforme |

---

## 🔧 Secrets requis

Ajouter dans https://github.com/OWNER/REPO/settings/secrets/actions :

| Secret | Requis | Effet |
|--------|--------|-------|
| `GOOGLE_AI_API_KEY` | Oui | Scripts IA + traduction |
| `YOUTUBE_CLIENT_ID` | Pour YouTube | Publication auto |
| `YOUTUBE_CLIENT_SECRET` | Pour YouTube | Publication auto |
| `YOUTUBE_REFRESH_TOKEN` | Pour YouTube | Publication auto |
| `TELEGRAM_BOT_TOKEN` | Pour notifs | Notifications téléphone |
| `TELEGRAM_CHAT_ID` | Pour notifs | Notifications téléphone |

---

## 💰 Coût : ~$0/mois

Edge TTS (gratuit), canvas (gratuit), FFmpeg (gratuit), Gemini Flash (gratuit 60 RPM), GitHub Actions (gratuit 2000 min/mois).

---

## 🔐 Sécurité

- Clés API dans env vars / GitHub Secrets uniquement
- Validation Telegram avant publication publique
- Rate-limiting par plateforme
- Logs dans `output/_publish-log.json`
