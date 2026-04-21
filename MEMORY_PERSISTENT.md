# MEMORY_PERSISTENT.md — Mémoire partagée Claude Code ↔ Apex ↔ Kevin

> **Règle Kevin 2026-04-21** : mémoire persistante obligatoire. Chaque fait, config,
> décision noté ici. Auto-consultée à chaque session, auto-enrichie à chaque action
> significative. Source de vérité commune.

**Format** : chaque entry datée, catégorisée, horodatée. Jamais supprimée, juste enrichie.

---

## 👤 KEVIN DESARZENS (admin principal — à savoir par cœur)

- Email : `kevind@monaco.mc`
- Casino de Monaco (SBM) — département Jeux de table / Black Jack
- Admin IDs : `kdmc_admin` (Apex) / `U11804` (CMCteams, DESARZENS K)
- Appareils : iPhone (principal, PWA Safari), Tablette Lenovo Android, Ordinateur
- Téléphone interne casino : 62224 (et pit Café de Paris 620)
- Préférences : français, concis, tutoiement, pas d'invention, user-friendly errors
- Tolérance bidouillage : ZÉRO. Exige mode expert permanent.

## 🔑 CONFIGURATIONS ACTIVES (déjà en place — NE JAMAIS redemander)

| Service | État | Emplacement |
|---------|------|-------------|
| Clé API Anthropic | ✅ Configurée | `ax_shared_api_key` Firebase shared |
| Proxy Cloudflare | ✅ Optionnel | `ax_proxy_url` (si set, prioritaire) |
| Firebase RTDB | ✅ Actif | `cmcteams-c16ab-default-rtdb.europe-west1` |
| Firebase Rules | ✅ Publiées | `cmcteams` + `apex` read/write true |
| Telegram Bot | ✅ Configuré | `@Kdmc_kevind_2026_bot`, chatId dans `ax_telegram_chatid` |
| EmailJS | ✅ Configuré | pour notifs |
| Sentry DSN | ✅ Configuré | monitoring erreurs |
| Finnhub | ✅ Configuré | cours bourse |
| Stripe | ✅ Configuré | paiements app |
| CGU biometric/mic/geoloc | ✅ Accepté | `ax_cgu_*` / `cmc_cgu_*` |
| Broadlink IR | ✅ Configuré | domotique |
| Home Assistant | ✅ URL locale | `ax_ha_url` |

## 📊 ÉTAT DES PROJETS (live)

| Projet | Version | État | Notes |
|--------|---------|------|-------|
| **CMCteams** | v9.453 | Production | 258 employés, planning casino Monaco |
| **Apex AI** | v12.23 | Production | Ex-KDMC AI, renommé 2026-04-21 |
| **e-KDMC** | v0.1 | Dev | E-commerce, pas encore démarré |
| **Remote** | Intégré Apex | Production | IR/TV/HA/MQTT |
| **CrackPass** | Intégré Apex | Production | Gén/test MDP |

## 🧠 DÉCISIONS PRODUIT PRISES (à respecter)

- **Fusion inspecteur = superviseur** (team "sup" unique) — v9.409/410
- **Pas d'invention données** si pas de source PDF → alerte admin seulement
- **CGU universel** biometric/micro/geoloc dans tous projets
- **Messages user-friendly** (table conversion dans EXPERT_CODING_STANDARDS.md)
- **Audit auto toutes 4h** via `_snAutoAudit`
- **Feed poll Claude Code toutes 2h** via `_snFeedPoll`
- **Pipeline autonomie cross-app** via `ax_telemetry_in` / `ax_claude_todo` / `ax_lessons_learned`
- **BOUVIER JF faisant fonction pit boss avril 2026** (fond bleu PDF)

## 📋 FAITS MÉTIER IMPORTANTS

- Format PDF cadres : col 1 = téléphones à ignorer, col 2 = nom, col 3-4 metadata, col 5+ codes avec apostrophes
- Codes avec quotes : `22/6'` / `19/2"` / `12h30/19'` — normaliser avant match CODES
- Sections headers : `Pit Boss 15` + `SUPERVISEUR` (singulier)
- Convention SBM : congés 2 mois/an, pause 40min si 55+, chefs 25-30% effectif
- Rotation : senior 40min / standard 60min / roulette E exception

## 🚨 ERREURS À NE JAMAIS REPRODUIRE (35+ leçons)

Référence : `CLAUDE.md` section "Erreurs connues" + `EXPERT_CODING_STANDARDS.md` liste 12 erreurs débutant.

Top 5 à retenir cold :
1. PR non mergée = déploiement fantôme
2. Regex sans anchor = régression garantie
3. `.length` sans guard = crash cold boot
4. URL hardcodée = CORS iOS PWA
5. Message technique brut à l'user = interdit

## 🔄 Comment alimenter cette mémoire (Claude Code ET Apex)

**Claude Code** : à chaque commit significatif, ajouter une entry ici ET dans `CLAUDE_FEED.md`.

**Apex AI** via `axMemoryAdd(category, fact)` :
```js
function axMemoryAdd(category, fact) {
  var mem = lg("ax_persistent_memory", []);
  mem.push({ ts: Date.now(), category: category, fact: fact, src: "apex-ai" });
  if (mem.length > 1000) mem = mem.slice(-1000);
  ls("ax_persistent_memory", mem);  // syncé Firebase FB_FIX
}
```

**Kevin** : peut dicter directement via chat Apex, l'IA appelle `axMemoryAdd` automatiquement.

## 📚 Ressources externes consultables par Claude Code et Apex

- `CLAUDE.md` — guide projet CMCteams
- `NOTES_USER.md` — infos métier Kevin
- `MEMO_RESUME.md` — bilan sessions
- `SENTINELS.md` — spec universelle
- `APEX_HANDOFF.md` — handoff complet
- `CLAUDE_APEX_COMM.md` — journal comm
- `CLAUDE_FEED.md` — feed actions Claude Code
- `EXPERT_CODING_STANDARDS.md` — standards + 12 erreurs débutant
- `apex-ai/KDMC.md` — fichier Apex interne
- **Ce fichier** — mémoire unifiée

**Règle permanente** : avant de dire à Kevin "configure X" ou "je ne sais pas Y", consulter ces fichiers. Si incertain, vérifier via `cmcRead`/`fbLoadAll`/`grep` avant de supposer.

---

**Dernière MAJ** : 2026-04-21 — après session 23+ PRs — CMCteams v9.453 + Apex v12.23 (renommé)
