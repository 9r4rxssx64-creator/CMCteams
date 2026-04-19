# CMCteams — v9.202

**Application de gestion de planning et d'équipes pour le Casino de Monte-Carlo (SBM)**.

SPA monofichier HTML — pas de backend, pas de build, pas de dépendances d'exécution. Hébergée sur GitHub Pages.

🎬 **[Voir la vidéo de démonstration](./CMCTeams_Demo.mp4)** — 1:33, Full HD

---

## 📊 Notes auditées (2026-04-17, 12 audits externes)

| Axe | Note |
|-----|------|
| **Benchmark niche casino SBM** | **9.9/10** ⭐ (plafond atteint) |
| Sécurité | 8.1/10 |
| Performance | 8.4/10 |
| UX / accessibilité | 8.3/10 |
| Code / fonctionnalité | 7.8/10 |
| **Moyenne externe** | **8.5/10** |

Voir `AUDIT_EXTERNE_2026-04-17.md` pour détail des 12 audits et trade-offs documentés.

---

## ✨ Caractéristiques

### Couverture métier SBM Monaco (unique sur le marché)
- **258 employés** · 10 équipes BJ · 13 équipes Roulettes · 13 équipes CMC
- **4 casinos SBM** : CMC + CDP + Sun Casino + Monte-Carlo Bay (v9.197)
- **Convention Collective Jeux de Table SBM 2015** + Article 13 %CA/cagnottes (v9.196) intégré
- **Constitution de Monaco** + Loi 1.103 + Grand Prix F1 / EPT Poker / Tennis Masters (v9.195)
- **Calcul paie** avec indice Monaco historique Fonction Publique (v9.186)
- **Simulateur bulletin de paie** pré-visualisé (fixe + cagnotte + %CA, v9.198)
- **Rotation casino** 20/20 · 40/20 · 60/20 avec règles senior 55+

### Fonctionnalités
- **Firebase Realtime Database** pour synchronisation temps réel multi-appareils
- **PWA installable** + Web Share API + deep-links URL
- **IA Claude intégrée** avec 82 outils (tool-use) + sentinelle auto-check 60s
- **Import PDF planning SBM** avec 9 fallbacks + auto-apprentissage codes
- **Timeclock** (pointage entrée/sortie + historique 7j + export CSV)
- **Chat** public + DM + reply + MOTD + notifications
- **Gamification** : 10 badges automatiques (vétéran, pilier, fidèle, assidu…)

### UX premium
- **Design futuriste** : keyframes modernes, glass morphism, ripple, confetti
- **FAB contextuel** + Command Palette ⌘K + cheatsheet clavier
- **Drag & drop** cellules admin (swap / copy) + bulk select Shift+Click / long-press
- **Heatmap 12 mois** cliquable + sparkline 12 mois par employé
- **Live presence** avatars + widget "En ligne" + quick profile modal

### Sécurité
- CSP restrictive + hash 10K rounds (hashPwStrong v2 + sel)
- Rate-limiting PIN + rate-limit congés (3/24h) + anti-spam pointages (30s)
- Journal audit complet (500 entrées rolling) + snapshots rollback (15 rotatifs)
- Validation stricte inputs (saveOv, backups) + checksum stable (tri récursif)
- Session TTL 8h + device anomaly detection

### Accessibilité
- WCAG 2.1 AA : focus-visible, `role="status"`, `aria-pressed`, `aria-label`
- `prefers-reduced-motion` respecté globalement
- Safe-area iOS + 100dvh + media queries mobile (iPhone SE 375px = référence)

---

## 📁 Structure

```
CMCteams/
├── index.html                       # Application entière (~1.60 MB)
├── sw.js                            # Service Worker (cache v9.202)
├── manifest.json                    # PWA manifest + shortcuts + maskable icons
├── CMCTeams_Demo.mp4                # Vidéo de démonstration
├── CLAUDE.md                        # Guide pour assistants IA (architecture, règles)
├── NOTES_USER.md                    # Infos métier persistantes Kevin
├── CHANGELOG.md                     # Historique complet des versions
├── MEMO_RESUME.md                   # État courant + reprise de session
├── TODO_REMINDERS.md                # Tâches en attente
├── AUDIT_EXTERNE_2026-04-17.md      # Détail des 12 audits externes + trade-offs
├── LEARNINGS_SESSION_2026-04-17.md  # Rétrospective méthodes efficaces
├── firebase-rules.json              # Règles Firebase Realtime DB
├── proxy-anthropic-cloudflare.js    # Proxy optionnel API Anthropic (déploiement)
├── tools/                           # Scripts vidéo / intégrations / MCP
├── SETUP_FOR_LATER/                 # Docs déploiement Vercel / Telegram / secrets
├── _PROJECTS_KDMC/                  # Stubs CLAUDE.md des futurs projets satellites
└── .github/workflows/               # Déploiement GitHub Pages auto
```

---

## 📖 Documentation (à lire dans l'ordre pour démarrer)

1. **`MEMO_RESUME.md`** — état courant, version, récap batch
2. **`NOTES_USER.md`** — infos métier Kevin + méta-règles permanentes
3. **`CLAUDE.md`** — architecture, règles projet, erreurs connues
4. **`TODO_REMINDERS.md`** — tâches en attente
5. **`AUDIT_EXTERNE_2026-04-17.md`** — notes externes + trade-offs documentés
6. **`LEARNINGS_SESSION_2026-04-17.md`** — méthodes qui marchent / ne marchent pas

---

## 🏆 Positionnement

**Leader incontestable sur la niche "outil planning + RH conventionné casino SBM Monaco"**. Aucun concurrent généraliste (Deputy, When I Work, Planday, Kronos, UKG) ne couvre la Convention Collective Jeux de Table 2015, les codes bulletins SBM, la rotation 40/20 seniors, l'Article 13 %CA/cagnottes, les événements Monaco spécifiques ou le multi-casino SBM.

Position défensive : toute tentative de copie exigerait une connaissance métier SBM que seul Kevin DESARZENS (U11804) possède.

---

*Casino de Monte-Carlo — Société des Bains de Mer · v9.202 (2026-04-17)*
