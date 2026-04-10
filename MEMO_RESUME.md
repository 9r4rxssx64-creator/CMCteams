# 📌 Mémo de reprise — 2026-04-10 (v9.62 livrée)

> **Lire en PREMIER à chaque nouvelle session** avant toute autre action.
> Règle globale `~/.claude/CLAUDE.md` — continuité inter-sessions.

---

## 📊 Dernière version stable

**`APP_VER = "v9.62"`** — branche `claude/find-casino-project-vcUDZ`

---

## 🗺️ Séquence de versions (cette session)

```
xxxxxx v9.62: Version majeure multi-axe                          ← ACTUEL
566f6c9 v9.62-pre4: galerie 75 photos salons CMC & CDP
24a9b23 v9.62-pre3: PLANS_CMC + PLANS_CDP + vConvention Lieux + IA enrichi
a556b71 v9.62-pre2: système upload modéré (employés → admin valide)
c7d1834 v9.62-pre1: bulles quasi-transparentes + fix iOS zoom + CSP élargie
907a6b5 docs: MEMO_RESUME.md — session v9.62 en préparation
f3b25d4 v9.61: Hot-fix audit indépendant (2 P0 + 1 P2)
```

---

## ✅ Fait v9.62

1. **Bulles chat quasi-transparentes** : rgba .09-.22, blur 18px, text-shadow puissant
2. **Fix iOS zoom auto** : @media (pointer:coarse) font-size 16px + chat-bar/chatSearchIn
3. **CSP élargie** : img-src SBM + Wikimedia pour galerie photos
4. **Upload modéré** : employés soumettent → alerte admin → valide/rejette + toggle on/off
5. **PLANS_CMC + PLANS_CDP** : 9 salles CMC + 4 zones CDP + architectes + historique
6. **findSallesPourJeu()** : localise un jeu dans les salons
7. **buildIASystemPrompt enrichi** : PLANS + upload + modifs admin-only + max_tokens 4096
8. **vConvention onglet "Lieux"** : CMC / CDP / Comparer (3 sous-onglets)
9. **Galerie 75 photos** : SALON_PHOTOS + vGalerie + filtres + lightbox clavier
10. **15 tests unitaires** ajoutés à runTests()
11. **Audit sécurité** : guards AID confirmés OK

---

## 🔲 Prochaine version (v9.63+)

### Contenu en attente
- **JEUX_SBM** : règles SBM Formation 2016 détaillées (6 docs reçus, structurés en /tmp/jeux_sbm_structure.js)
- **LOI_1103** + **OS_8929** : cadre légal monégasque
- **AM_88_384** : règlement principal des jeux (21 amendements)
- **Tool use IA** : permettre à Claude API d'appeler des fonctions JS de l'app (lecture tous, modification admin-only)
- Nouveaux jeux manquants (rmc, ram, tq, boule, gr, cdf, bq, etc.)

### Demandes user non encore réalisées (v9.63+)
- Tool use IA custom (Claude API function calling pour lecture + modification admin-only)
- Galerie photos intégrée dans vConvention onglet Lieux (sub-view)

---

## 🔑 Décisions prises

1. **Upload modéré** : employés ne peuvent JAMAIS upload directement, toujours via soumission + validation admin
2. **IA ne modifie pas** sauf admin : règle inscrite dans le prompt système
3. **max_tokens 4096** pour réponses détaillées avec le prompt enrichi
4. **iOS zoom fix** global via @media pointer:coarse (pas de maximum-scale=1)
5. **Bulles quasi-transparentes** : priorité info mais photo visible en fond

---

## ⚙️ Contexte technique

- **Branche de travail** : `claude/find-casino-project-vcUDZ`
- **Fichier principal** : `/home/user/CMCteams/index.html` (~12 400 lignes, ~900 KB)
- **Nouveaux stores** : `A.uploadRequests`, `A.uploadEnabled`
- **Nouvelles clés Firebase** : `cmc_upload_requests`, `cmc_upload_enabled`
- **Nouvelles constantes** : `PLANS_CMC`, `PLANS_CDP`, `SALON_PHOTOS` (75 photos)
- **Nouveau helper** : `findSallesPourJeu(jid, etab)`
- **Nouvelles vues** : `vUploadRequests()`, `vGalerie()`
- **Nouveaux routes** : `uploadreq`, `galerie`

---

*Dernière mise à jour : 2026-04-10 — v9.62 livrée*
