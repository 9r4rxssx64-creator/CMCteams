# FEATURES_GATING.md — Matrice permissions + forfaits + sécurité

> Kevin 2026-04-21 : "quand j'ajoute une feature, vois si pertinent pour
> admin / Laurence / clients. Toggle ON/OFF pour admin. Options dans les
> forfaits. Sécurité. Que ça rapporte un max sans être du n'importe quoi."

---

## 🔐 3 niveaux de permission

| Niveau | Qui | Accès |
|--------|-----|-------|
| **ADMIN** | Kevin (`kdmc_admin`) | Tout, y compris actions dangereuses (modify_css, inject_function, kill_all_devices, cmcWrite) |
| **LAURENCE** | Laurence SAINT-POLIT (prénom = user spécial, pro) | Mêmes features qu'un Business sans admin destructrices. Via `_checkPreconfiguredUser` role:"family" |
| **CLIENT** | Autres users | Features selon forfait. Jamais d'actions destructrices. |

---

## 📊 Matrice features × niveaux × forfaits

| Feature | Admin | Laurence | Free | Starter | Mid | Pro | Business | Enterprise | Danger si client ? |
|---------|-------|----------|------|---------|-----|-----|----------|------------|--------------------|
| **Chat IA de base** | ✅ | ✅ | ✅ 1k msg/mois | ✅ 5k | ✅ 20k | ✅ 50k | ✅ 200k | ✅ ∞ | Non |
| **Vision caméra (axUploadImage)** | ✅ | ✅ | ❌ | ✅ 50/mois | ✅ 200 | ✅ ∞ | ✅ ∞ | ✅ ∞ | Non (CGU OK) |
| **📷 Identify & Shop (v12.27)** | ✅ | ✅ | ❌ | ❌ | ✅ 20/mois | ✅ 100 | ✅ ∞ | ✅ ∞ | Non |
| **Web Search natif** | ✅ | ✅ | ❌ | ❌ | ✅ 30/mois | ✅ 200 | ✅ ∞ | ✅ ∞ | Non (coût API) |
| **PDF Upload + OCR** | ✅ | ✅ | ❌ | ✅ 5/mois | ✅ 30 | ✅ ∞ | ✅ ∞ | ✅ ∞ | Non |
| **Voice Dictée (STT)** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Non (CGU OK) |
| **TTS voix pro** | ✅ | ✅ | ❌ 1 voix | ✅ 5 voix | ✅ 10 voix | ✅ 44 voix | ✅ 44 | ✅ 44 | Non |
| **Finance (portefeuille, alertes)** | ✅ | ✅ | ❌ | ✅ 3 positions | ✅ 10 | ✅ ∞ | ✅ ∞ | ✅ ∞ | Non (données locales) |
| **Domotique IR/TV/HA/MQTT** | ✅ | ⚠️ (Laurence OK) | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ⚠️ Dangereux (contrôle appareils physiques) → limiter Pro+ |
| **Templates pro (80+)** | ✅ | ✅ | ❌ 5 | ✅ 20 | ✅ 50 | ✅ 80 | ✅ 80 | ✅ 80 | Non |
| **CrackPass (gén/test MDP)** | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ⚠️ Mild (pas de cracking réel, juste strength check) |
| **Coffre biométrique (vVault)** | ✅ | ❌ | ❌ | ✅ 10 entrées | ✅ 50 | ✅ ∞ | ✅ ∞ | ✅ ∞ | ⚠️ Sensible (crédentials) → admin-only pour l'instant |
| **Canvas code execution** | ✅ | ✅ | ❌ | ❌ | ✅ JS only | ✅ JS+Py | ✅ | ✅ | ⚠️ Dangereux (eval) → Pro+, sandbox obligatoire |
| **Inject Function / Modify CSS** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 🔴 TRÈS dangereux → ADMIN ONLY permanent |
| **cmcRead / cmcWrite** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 🔴 Casino data → ADMIN ONLY |
| **Multi-providers LLM (futur)** | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | Non |
| **Agents autonomes custom** | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ 5 | ✅ 20 | ✅ ∞ | ⚠️ Mild (peuvent consommer API) |
| **Marketplace extensions (futur)** | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ⚠️ Modération à prévoir |
| **Backup cloud chiffré** | ✅ | ✅ | ❌ local | ✅ 1/sem | ✅ 1/jour | ✅ auto 1h | ✅ real-time | ✅ real-time | Non |
| **Support prioritaire** | — | ✅ | ❌ | ❌ | ❌ | ✅ email 24h | ✅ 24/7 | ✅ dédié | Non |

---

## 🎛️ Toggles ADMIN (forcer ON/OFF globalement)

**Déjà en place** : `ax_toggles` dans localStorage + synced Firebase. Clés existantes :
- `whatsapp`, `instagram`, `facebook`, `email_gmail`, `email_outlook`
- `clipboard_sync`, `file_transfer`
- `web_search`, `code_execute`

**À ajouter** (v12.28) :
- `camera`, `identify_shop`, `domotique`, `crackpass`, `vault`, `canvas_exec`
- `multi_llm`, `agents_custom`, `marketplace`

**UI admin** : vue Réglages → section "Features ON/OFF" avec 20+ toggles.

---

## 💰 Impact forfaits révisé (upsell justifié)

| Plan | Prix actuel | Prix révisé | Features clés | Cible |
|------|-------------|-------------|---------------|-------|
| **Free** | 0€ | 0€ | Chat basique + 1k msg + voix TTS 1 | Acquisition |
| **Starter** | 4.99€ | 7.99€ | + Vision 50 + PDF 5 + Templates 20 | Particulier curieux |
| **Mid** 🆕 | — | 12.99€ | + Web search 30 + Finance 10 + Identify&Shop 20 + Canvas JS | Utilisateur régulier |
| **Pro** | 14.99€ | 19.99€ | + Domotique + Web ∞ + Vision ∞ + Canvas Py + Agents 5 + Multi-LLM | Power user |
| **Business** | 29.99€ | 39.99€ | + Agents 20 + Backup real-time + Support 24/7 | Équipes, PME |
| **Enterprise** | 79.99€ | 149€ | + Agents ∞ + Marketplace + SLA 99.9% + Webhook custom + dédié | Entreprises |
| **Lifetime** | 299€ | 399€ (= Pro à vie) | Pro features illimitées | Early adopters |

**Revenu mensuel projeté 100 clients (mix Starter 40 / Mid 30 / Pro 20 / Business 8 / Enterprise 2)** :
- Actuel : ~1 070 €/mois
- Révisé : ~2 350 €/mois (**+120%** grâce à Mid tier + hausses)

---

## 🛡️ Règles sécurité non-négociables

1. **`inject_function`, `modify_css`, `replace_in_code`** : ADMIN ONLY permanent, jamais exposé client
2. **`cmcRead`, `cmcWrite`** : ADMIN ONLY (casino data = confidentiel SBM)
3. **Domotique** : Pro+ (contrôle physique, risque si abus). Logger chaque action dans `ax_audit`
4. **Canvas code exec** : sandbox iframe obligatoire, whitelist APIs
5. **Vault** : admin-only pour l'instant (cred sensibles). V2 : opt-in client avec chiffrement user PIN
6. **Kill switch global** : admin peut désactiver n'importe quelle feature pour tous les users via `ax_toggles` Firebase sync
7. **Rate limit par plan** : enforced via `axCheckLimit(feature)` côté front + serveur proxy Cloudflare

---

## ✅ Implémentation v12.28

Helper universel `axIsFeatureAllowed(feature)` :
- Check `ax_toggles[feature]` (admin peut couper pour tous)
- Check `axIsAdmin()` → tout autorisé
- Check plan user via `axGetPlanInfo()` → match matrice ci-dessus
- Retourne `{allowed: bool, reason: string, upgrade: "plan_name"}`

Wrapper sur features à risque (ex: `axIdentifyAndShop`) :
```js
function axIdentifyAndShop(){
  var check = axIsFeatureAllowed("identify_shop");
  if (!check.allowed) {
    toast("Feature " + check.reason + " — upgrade " + check.upgrade, "warn");
    sv("plans");
    return;
  }
  // ... (existing code)
}
```

Toggles admin dans `vSettings` admin → section "Contrôle features".

---

**Dernière MAJ** : 2026-04-21 — Apex v12.28
