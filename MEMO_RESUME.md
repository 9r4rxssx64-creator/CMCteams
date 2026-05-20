# MEMO_RESUME.md — Session Social Video Pipeline 2026-05-20

## État actuel

### Pipeline vidéo automatisé KDMC Studio
- **Workflow** : `.github/workflows/social-publish.yml` — tourne tous les jours 12h Monaco
- **Moteur** : `tools/social/generate_video.py` — Python, production broadcast
- **App** : `tools/social/app/index.html` — KDMC Studio v2.1.1 (PWA)

### Architecture technique
1. **TTS** : edge-tts neural (en-US-GuyNeural, dramatique) → gTTS → espeak fallback
2. **Vidéo** : 6-10 clips Pexels stock (changement scène toutes les 7s) + fallback AI Ken Burns
3. **Sous-titres** : ASS animés, timing mot-par-mot depuis edge-tts VTT
4. **Musique** : Pixabay, volume 7%, fade in 4s / fade out 5s
5. **Effets** : vignette, film grain, color grading cinématique (sombre, contrasté, désaturé)
6. **Upload** : YouTube API resumable upload, privacy=private

### Secrets GitHub configurés
- `YOUTUBE_CLIENT_ID` ✅
- `YOUTUBE_CLIENT_SECRET` ✅
- `YOUTUBE_REFRESH_TOKEN` ✅
- `GOOGLE_AI_API_KEY` ✅ (Gemini)
- `PEXELS_API_KEY` ✅ (stock vidéo)

### Bibliothèque de contenus
- `config/content-library.json` : 51 histoires (10 niches)
- `config/viral-stories.json` : 12 histoires virales style Reddit (**NOUVEAU**)
  - Style : AITA, ProRevenge, MaliciousCompliance
  - Hooks : "I found my wife's secret phone", "My boss fired me then begged me to come back"
  - Basé sur recherche des vidéos qui marchent le mieux en 2025-2026
  - Première personne, conversationnel, enjeux émotionnels, twist inattendu

### Recherche virales (2025-2026) — Ce qui marche
- **Format** : Reddit stories (AITA, ProRevenge, MaliciousCompliance)
- **Durée** : 10-30 minutes (1500-4000 mots)
- **Structure** : hook discret → buildup tension → twist dramatique → résolution karma
- **Titres** : sous-estimer le drame ("I found my wife's..." > "SHOCKING SECRET")
- **Hooks** : ouvertures défensives ("I know this sounds bad, but hear me out...")
- **Top chaînes** : BRIGHT SIDE (45M), DaFuq Boom ($500K-1.3M/mois)
- **RPM** : $12-35 selon la niche (betrayal/karma = meilleur RPM)

### Modules engine/ (22 fichiers)
- tts.js, tts-smart.mjs, subtitle-engine.js, frame-generator.js
- base-renderer.js, compiler.js, script-generator.js, thumbnail-generator.js
- analytics.js, ab-testing.js, branding.js, multi-lang.js
- viral-optimizer.js, content-repurposer.js, seo-optimizer.js
- photo-to-video.js, video-remix.js, free-tools.js
- ai-providers.js, ai-video-gen.js, pro-video-pipeline.js
- music-manager.js, visual-effects.js, shorts-extractor.js

### Ce qui reste à faire
- [ ] Tester le nouveau pipeline v3 (multi-scène Pexels)
- [ ] Vérifier que edge-tts fonctionne bien en CI GitHub Actions
- [ ] Ajouter plus d'histoires virales (objectif 50+)
- [ ] Intégrer Remotion pour animations de texte niveau CapCut
- [ ] Shorts extraction automatique (9:16)
- [ ] Telegram notifications
- [ ] Dashboard analytics dans l'app

### Projet YouTube KDMC SOCIAL
- Project ID : kdmc-social
- Status : Published "In production" (tokens permanents)
- Client ID : 768871435113-09p70spa7k18gia9mibht34p2g2eb9ut.apps.googleusercontent.com
