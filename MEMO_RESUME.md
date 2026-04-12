# Mémo de reprise — 2026-04-12 (v9.69 livrée)

> **Lire en PREMIER à chaque nouvelle session.**

---

## Dernière version stable

**`APP_VER = "v9.69"`** — ~1.05 MB — branche `claude/create-demo-video-Ey9Hu` (à merger dans `main`)

---

## Livré cette session

| Version | Contenu |
|---------|---------|
| **Vidéo démo** | Pipeline vidéo complet dans `tools/video/` (Puppeteer + node-canvas + FFmpeg) — MP4 1:33 / 1080p / 16 MB à la racine (`CMCTeams_Demo.mp4`) |
| **v9.68** | Message du jour admin + sync Firebase (`cmc_motd`) — textarea admin + bandeau doré accueil |
| **v9.69** | Audit expert parallèle (4 subagents Explore) + fixes P1 sync Firebase MOTD + P2 UX + nouvelle section "🧰 Outils & réflexes expert" dans CLAUDE.md |

---

## Nettoyage effectué

- **CLAUDE.md** : historique v8.83→v9.67 extrait vers `CHANGELOG.md` (74 KB → 44 KB, -40%)
- **CHANGELOG.md** : créé à la racine avec historique complet
- **RECAP.md** et **RELAIS.md** : supprimés (obsolètes v8.x, info déjà dans CLAUDE.md + CHANGELOG.md)
- **README.md** : enrichi (résumé + lien vidéo + architecture)

---

## Outils intégrés au projet (nouveaux)

```bash
# Pipeline vidéo réutilisable
node tools/video/make-demo.js              # MP4 complet
node tools/video/make-demo.js --fast       # Rapide
node tools/video/make-demo.js --format all # MP4 + WebM + GIF

# Dépendances: puppeteer, canvas, sharp, @ffmpeg-installer/ffmpeg
# (npm install à la racine)
```

---

## Prochaines pistes

- Merger `claude/create-demo-video-Ey9Hu` dans `main` pour déploiement GitHub Pages
- Roulette Monte-Carlo (AM 2019-819, 39 cases) dans JEUX + JEUX_SBM
- Rate limiting IA, token budget par user
- Tests E2E Puppeteer sur les flux critiques (connexion, MOTD, planning)

---

*Dernière mise à jour : 2026-04-12 — v9.69*
