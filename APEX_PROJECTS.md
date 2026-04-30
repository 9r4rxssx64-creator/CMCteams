# 📁 APEX PROJECTS — Registry central tous projets Kevin

> Mis à jour 2026-04-30 (Apex v12.547)
> Source de vérité unique pour tous les projets gérés par Apex AI.
> Apex IA peut consulter ce fichier en autonomie via `cmcRead("APEX_PROJECTS.md")`.

---

## 🎯 Vision Kevin

> **"Intègre tous les projets dans Apex projets et fourni à Apex tout ce dont il a besoin comme meilleurs outils, accès, autorisations, et tout ce dont il pourrait avoir besoin pour terminer ces projets un par un, les gérer depuis Apex auto-géré tout comme dans Apex et les autres projets. Automatisé. Et quand ce sont des outils, s'en servir et les intégrer dans Apex pour l'admin et Apex en autonomie comme les autres fonctions de l'app"** — Kevin 2026-04-30

### Principes
- **Zero confusion** : 1 seul repo (cmcteams), 1 seule branche active (`claude/fix-apex-ai-bugs-adHfF`)
- **Apex AI = orchestrateur** : tous les projets accessibles depuis vue `vProjects` (`?view=projects`)
- **Apex IA autonome** : tools + accès + permissions pour gérer chaque projet sans intervention Kevin
- **Allègement Kevin** : modal `axNeedsAttention` 1-clic seulement quand impossible automatiser
- **Outils dernier cri** : Edge TTS, Gemini, FFmpeg latest, Anthropic Claude 4.7, Cloudflare Workers
- **100/100 réel** sur chaque axe et chaque projet

---

## 📦 11 PROJETS GÉRÉS

| # | ID | Nom | Statut | Version | Localisation |
|---|----|----|--------|---------|--------------|
| 1 | `kdmc` | **APEX AI** | 🟢 Production | v12.547 | `apex-ai/` |
| 2 | `cmcteams` | **CMCteams** (casino Monaco) | 🟢 Production | v9.579 | `index.html` racine |
| 3 | `apexchat` | **Apex Chat** (WhatsApp clone) | 🟠 Dév Mode A | v0.2 | `messaging-app/` |
| 4 | `socialvideo` | **Social Video Pipeline** | 🟠 Dév Phase 3 | v0.3 | `tools/social/` |
| 5 | `remote` | **Télécommande Universelle** | 🟢 Production | v1.2 | dans Apex AI |
| 6 | `crackpass` | **CrackPass / Vault** | 🟢 Production | v1.1 | dans Apex AI |
| 7 | `cloudflare` | **Cloudflare Tools** | 🟢 Production | v1.0 | `tools/cloudflare/` |
| 8 | `backend` | **Backend Proxy** | 🟢 Production | v1.0 | `apex-ai/proxy-apex.js` |
| 9 | `ekdmc` | **e-APEX** (e-commerce) | 🟠 Dév | v0.1 | TBD |
| 10 | `bilan` | **Bilan Général** | 🟢 Production | live | `BILAN_PRO.md` + `vBilan` |
| 11 | `iakdmc` | **IA-APEX** | ⚪ À démarrer | v0.0 | TBD |

---

## 🔑 ACCÈS & TOKENS REQUIS (registry `AX_APEX_PROJECTS_TOKENS` v12.547)

| Token | Service | Project | Required | Setup URL |
|-------|---------|---------|----------|-----------|
| `ax_api_key` | Anthropic Claude | apex-ai | ✅ | https://console.anthropic.com/settings/keys |
| `ax_gh_pat` | GitHub PAT (workflow scope) | all | ✅ | https://github.com/settings/tokens/new?scopes=workflow,repo |
| `ax_gemini_key` | Google Gemini AI | socialvideo | ⚪ | https://aistudio.google.com/app/apikey |
| `ax_openrouter_key` | OpenRouter (failover IA) | apex-ai | ⚪ | https://openrouter.ai/keys |
| `ax_groq_key` | Groq (failover gratuit) | apex-ai | ⚪ | https://console.groq.com/keys |
| `ax_elevenlabs_key` | ElevenLabs (voix premium) | apex-ai | ⚪ | https://elevenlabs.io/app/settings/api-keys |
| `ax_cf_token` | Cloudflare API | cloudflare | ⚪ | https://dash.cloudflare.com/profile/api-tokens |
| `ax_youtube_oauth` | YouTube OAuth (publication) | socialvideo | ⚪ | https://console.cloud.google.com/apis/credentials |
| `ax_fb_page_token` | Facebook Page Access | socialvideo | ⚪ | https://developers.facebook.com/tools/explorer/ |
| `ax_ig_user_id` | Instagram Business | socialvideo | ⚪ | https://developers.facebook.com/docs/instagram-api/getting-started |
| `ax_stripe_key` | Stripe (paiements) | apex-ai | ⚪ | https://dashboard.stripe.com/apikeys |
| `ax_kevin_whatsapp_phone` | WhatsApp Kevin (OTP) | apex-chat | ⚪ | https://wa.me/ |

**Helper audit** : `axAuditApexProjectsTokens()` retourne `{present, missing, total}`.

**Stockage** :
- Localement chiffré AES-GCM 256 (v12.529+)
- Sync Firebase chiffré pour cross-device admin (sauf clés sensibles biométrie)
- GitHub Secrets pour tokens API publication (YouTube/FB/IG/Gemini)

---

## 🤖 AUTONOMIE APEX IA

### Niveau 1 : auto-fix sans intervention
Apex IA exécute en autonomie via `_aiHandleIssue(sentinelId, severity, finding)` whitelist :
- `flushSyncQueue` `emergencyCleanup` `fbReconnect` `resetStreaming` `clearImportSnapshot`
- `retryFailedRequest` `resetSession` `reloadKB` `axMigrateLSEncrypt` `axStorageEmergencyCleanup`
- `axCleanupAllListeners` `axClearOldIntervals` `axStorageEmergencyCleanup`

### Niveau 2 : modal `axNeedsAttention` 1-clic
Apex propose une action modale à Kevin (validation 1 tap) :
- Renouvellement token expiré (FB Page Token expire 60j)
- Quota Anthropic atteint → bascule failover
- Nouveau device login → OTP WhatsApp
- DPA signature requise (juriste 2-4K€)

### Niveau 3 : escalade Claude Code via `ax_claude_todo`
Si auto-fix exhausted :
- Push entry `{context, reason, severity:critical, src:apex, ts}` dans Firebase `ax_claude_todo`
- GitHub Action `claude-todo-watcher.yml` cron 2h poll → ouvre Issue
- Prochaine session Claude Code : lit issue → fix → push commit + lesson learned

---

## 🛠 TOOLS APEX IA (callable depuis chat)

### Existants v12.546
- `axCallClaude(messages, opts)` — appel API Anthropic avec failover
- `axDetectIntent(text)` — détection contextuelle outils (musique/vidéo/archi/préfecture/admin)
- `axDeployFirebaseRules()` — copie rules + ouvre console Firebase 1-clic
- `axScanResponseForFakeUrls(text)` — anti-hallucination URL whitelist 30+ domaines
- `axDetectJailbreak(text)` — 7 patterns regex (DAN, ignore_instructions, safety_bypass, etc.)
- `axRedactOutbound(text)` — credential scan avant Anthropic (50+ patterns)
- `kbAdd(text, source, type)` — KB injection regex defense
- `axCreateSocialVideo({topic, niche, format, template, platform, lang, schedule})` — **NEW v12.547**

### Nouveaux v12.547
- `vSocialVideo()` — vue admin pipeline vidéos (file jobs + tokens + templates)
- `_axShowSocialVideoModal()` — form simple créer nouvelle vidéo
- `axAuditApexProjectsTokens()` — audit présence/manque tokens

### À créer (futurs projets)
- `axCreateApexChatInvite(phone, msg)` — invite WhatsApp 1-clic Apex Chat
- `axDeployCloudflareWorker(name, code)` — déploiement worker via API
- `axEcomCreateProduct(title, price, image)` — e-APEX produit
- `axBackupAllProjects()` — snapshot tous projets dans Firebase

---

## 📋 ROADMAP PAR PROJET

### Apex AI (v12.547 → v13.0)
- ✅ Wiring helpers Compliance/AI Safety/Consent (v12.537-541 mes patches)
- ✅ Logger central + 14 P0 audit chat (v12.542-545 P2XG9 patches)
- ✅ Apex Projects vue centrale (v12.547)
- ⏳ EU AI Act Art.52 disclosure complet
- ⏳ Firebase Phase 5 (auth.uid per-user)
- ⏳ DPA signatures contractuelles (juriste)

### Apex Chat (v0.2 Mode A)
- ✅ messaging-app/ structure complète (workers + D1 + DO + PWA static)
- ✅ Mode A actée (admin voit contenus) — bascule depuis Mode B
- ⏳ 8 fichiers à adapter pour Mode A (subagent ac0260a plan livré)
- ⏳ Frontend index.html + connexion workers
- ⏳ Auth Firebase Phone Provider (SMS OTP 6 chiffres)

### Social Video Pipeline (v0.3 Phase 3)
- ✅ Recovery depuis branche RvjYq (24 .js, 7000 LOC)
- ✅ Vue admin vSocialVideo + axCreateSocialVideo helper (v12.547)
- ✅ 2 GitHub Actions (social-publish.yml + social-scheduler.yml)
- ⏳ Setup tokens (PAT GitHub + Gemini + YouTube + FB + IG)
- ⏳ Premier dispatch test
- ⏳ Analytics dashboard intégré dans vue admin

### CMCteams (v9.579)
- 🟢 Production stable — planning Monaco 258 employés
- ⏳ Continue maintenance + sentinelles

### e-APEX (v0.1)
- ⏳ À spécifier (e-commerce automatisé)

### IA-APEX (v0.0)
- ⏳ À démarrer (projet IA personnel)

---

## 🤝 SENTINELLE `projects-watch` (à implémenter)

Audit hebdomadaire chaque projet :
- Status build (CI green ?)
- Last commit < 30 jours ?
- Tests passent ?
- Tokens expirent < 7j ?
- Quota API atteint ?

Si KO → escalade Claude Code via `ax_claude_todo`.

---

## 📂 FICHIERS DE RÉFÉRENCE

| Doc | Contenu |
|-----|---------|
| `CLAUDE.md` | Règles permanentes Kevin + erreurs connues |
| `KDMC_AI_PROJECT.md` | Feuille de route Apex AI complète |
| `APEX_HANDOFF.md` | Transfert connaissance Claude Code → Apex IA |
| `WHATSAPP_CLONE_PROJECT.md` | Spec Apex Chat v1.0 |
| `messaging-app/PROJECT_MEMO.md` | Mémoire vivante Apex Chat (Mode A actée 2026-04-30) |
| `BRANCH_REPORT_P2XG9.md` | Rapport branche audit chat 12 agents |
| `tools/social/README.md` | Doc Social Video Pipeline |
| `KEVIN_INVENTORY.md` | Tous les codes/fichiers/liens (auto-mis-à-jour) |
| `STACK_AUTONOMOUS.md` | Stack technique recommandée |
| `BILAN_PRO.md` | Bilan financier Apex + CMCteams |

---

**Source de vérité** : ce fichier. À mettre à jour à chaque ajout/modification de projet.
