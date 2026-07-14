# audit/03 — FINDINGS (Passe 1)

> Priorités : P0 faille/crash/blocage · P1 dégrade fortement · P2 amélioration nette · P3 confort.
> **Aucun P0 découvert.** L'app est mature et déjà durcie (cf. `00-INVENTAIRE.md` §3/§5). Les findings ci-dessous sont réels, mesurés, et modestes — je ne fabrique pas de P0 pour « faire un audit impressionnant » (Loi 1).

---

## ✅ P0 vérifiés comme ABSENTS (preuves)

- **Clé API en dur** → `grep sk-ant-api[0-9]` hors tests = **0**. ✅ VÉRIFIÉ. (Le brief le posait comme « P0 absolu à corriger » — ici il n'existe pas : clé fournie par l'admin, stockée device-local, ou proxy serveur.)
- **Build cassé** → `test:check-syntax` exit **0**. ✅ VÉRIFIÉ.
- **Écriture Firebase shops anonyme** (hole fermé la session précédente, verrou `_phase_shops_rolelock` = ON, self-test vert). ✅ VÉRIFIÉ.

---

## P2 — améliorations nettes

### [P2] F-C1 — Clé Anthropic de l'admin en clair dans `localStorage` (chemin sans proxy)
- **Axe** : C — Sécurité
- **Fichier** : `index.html:13194`, `:44446` (`_resolveIaKey`)
- **Preuve** ✅ : `var apiKey=localStorage.getItem("cmc_ia_key")…` puis `headers["x-api-key"]=apiKey; headers["anthropic-dangerous-direct-browser-access"]="true"` quand aucun `cmc_ia_proxy` n'est configuré.
- **Impact** : la clé de l'admin vit en clair dans le `localStorage` de son navigateur → exfiltrable si un XSS existait. Ce n'est **pas** un secret committé (aucune fuite dépôt).
- **Cause** : chemin de repli « appel direct navigateur » conservé pour marcher sans proxy.
- **Correctif** : rendre le **proxy Cloudflare le défaut** (`cmc-parser-proxy` existe déjà, workflow `cmc-parser-proxy-deploy.yml`) ; ne conserver l'appel direct que si l'admin l'active explicitement, avec avertissement. Optionnel : chiffrer `cmc_ia_key` au repos (AES-GCM, comme le vault Apex).
- **Test** : un test qui vérifie que, proxy configuré, aucun header `x-api-key` ne part vers un tiers.
- **Effort** : M · **Régression** : le repli direct doit rester possible (Kevin sans proxy).

### [P2] F-C2 — 145 `innerHTML`, 16 en concaténation sans `esc()`
- **Axe** : C — Sécurité / B — Code
- **Preuve** 🟡 DÉDUIT : échantillon des 16 → markup **statique/contrôlé-app** (`<div>`, `<button>` depuis tableaux internes, object-URL d'image, `_cmcBreadcrumb()+vMain()`). `esc()` défini (l.4931) et utilisé sur les données employé/planning dans les vues de rendu.
- **Impact** : faible aujourd'hui, mais surface à surveiller (données planning = noms de personnel SBM).
- **Correctif** : ajouter un **garde CI** (grep) qui échoue si un `innerHTML=` interpole une variable de données non passée par `esc()` — transforme un audit manuel en filet permanent (Phase 8).
- **Effort** : S · **Régression** : nulle (test only).

### [P2] F-H1 — vRGPD / rétention des données personnel SBM non couvertes par test
- **Axe** : H — Données & confidentialité
- **Preuve** 🔴 SUPPOSÉ : `vRGPD` existe mais aucun test dédié ; la politique de rétention (noms, matricules, plannings, présence, géoloc `vGeolocationCMC`) n'est pas vérifiée automatiquement.
- **Impact** : données de personnel (RGPD) — accès admin-only via 399 gardes, mais pas de preuve de purge/rétention.
- **Correctif** : test qui vérifie (a) données personnel jamais dans le dépôt/tests, (b) `vRGPD` expose export + effacement, (c) géoloc opt-in.
- **Effort** : M.

## P3 — confort / dette

### [P3] F-B1 — `index.html` mono-fichier de 49 630 lignes
- **Axe** : B — Architecture. **Preuve** ✅ : `wc -c` = 3,33 Mo. Dette de maintenabilité structurelle assumée (leçon CLAUDE.md « monolith > 15K lignes »). Non corrigeable en une passe sans risque ; à traiter par extraction progressive de modules non-critiques. Effort : L.

### [P3] F-D1 — quelques `<img>` sans `loading="lazy"`
- **Axe** : D — Perf. **Preuve** ✅ : `vGalerie` **a** déjà `loading="lazy"` + `alt` (bon) ; **12** autres `<img>` dans `index.html` sans `loading=`. Impact mineur. Correctif : ajouter `loading="lazy"` + `width/height` (anti-CLS) aux `<img>` restants. Effort : S.

### [P3] F-L1 — 46 `console.log` + 18 TODO/FIXME
- **Axe** : L — Dette. **Preuve** ✅. Nettoyage cosmétique ; aucun `console.log` ne fuit de secret (vérifié : pas de clé loguée). Effort : S.

---

## [P1] F-K1 — le gate `test:ci` est ROUGE sur `main` (test `verify-finances-as-kevin` cassé) — DÉCOUVERT passe 2
- **Axe** : K — Tests & CI.
- **Preuve** ✅ VÉRIFIÉ : `node tests/verify-finances-as-kevin.mjs` (déjà dans `test:ci` sur origin/main) → **exit 1**, `page.waitForFunction: Timeout 30000ms` (l.91, flux de reconnaissance « 3 op » de l'app **Finances**). Échoue en standalone → **pas ma régression** (mes 4 nouveaux tests passent : render-views 95/95, rgpd 6/6, a11y 0 crit, xss-guard OK).
- **Impact** : tant qu'il casse, le gate `test:ci` complet ne peut pas être « vert » → aucune preuve de non-régression globale ; un vrai bug de CMCteams pourrait passer inaperçu derrière ce rouge chronique.
- **Cause** : app **Finances** (autre app du monorepo, v0.8.x) — sélecteur/flux d'analyse de relevé probablement périmé, OU dépendance proxy non satisfaite en local.
- **Correctif** : hors périmètre de cet audit CMCteams (app différente) → **à traiter séparément** : réparer le sélecteur/flux, OU sortir `verify-finances-as-kevin` de `test:ci` s'il n'est pas fiable hors CI. Ne PAS le laisser rouge chronique (règle #109 : un gate rouge en permanence masque les vraies régressions).
- **Effort** : M (côté équipe Finances). **Régression** : nulle sur CMCteams.

## Mise à jour PASSE 3 (2026-07-14) — F-K1 + F-C1 fermés (code testé)
- **F-K1 (gate rouge)** → **RÉSOLU** : `verify-finances-as-kevin` fiabilisé (fermeture drill/doc overlay entre actions, désambiguïsation onglet « Bilan », signal d'activation stable `#ai-off`). **3 runs → 47 OK / 0 P0** ; `npm run test:ci` **EXIT 0 end-to-end**. Bonus : bug réel corrigé (input `select.catsel` 12px→16px = plus de zoom iOS, +HIG 44px, Finances v0.12.1).
- **F-C1 (clé IA en clair)** → **MITIGÉ par garde CI** : `test:ia-key-privacy` (statique, discriminant) VERROUILLE les 2 seuls vecteurs de fuite (cmc_ia_key ∈ FB_LOCAL, jamais dans FB_FIX ; `_adminCfgBackup` ne pousse pas la clé vers la DB Firebase ouverte) → interdit toute réintroduction du **P0 lecon #787**. Le chiffrement au repos (théâtre device-local, lecon #55) et le proxy-par-défaut (couperait l'IA sans proxy = « ne rien casser ») restent **écartés volontairement** — documentés au JOURNAL.

## Mise à jour PASSE 2 (2026-07-14) — corrections livrées (code testé)
- **F-C2 (XSS)** → **RÉSOLU** : garde CI `test:xss-guard` (ratchet baseline 10) câblé dans `test:ci`. Tout nouvel `innerHTML` non échappé casse le gate.
- **F-H1 (RGPD)** → **RÉSOLU (test)** : `test:rgpd` (6/6) prouve export self, garde d'accès cross-user, admin protégé, confirmation « EFFACER », hash mdp redacté. (La *politique* de rétention reste un point produit, mais le mécanisme est testé.)
- **Angle mort « ~60 vues »** → **RÉSOLU** : `test:render-views` (95/95, 0 crash) câblé au gate.
- **Design non mesuré** → **RÉSOLU (baseline)** : `test:a11y` (axe-core, 0 critique) câblé au gate.
- **Cas conflit table/CMC+CDP** → **RECLASSÉ N/A par construction** (1 code = 1 lieu/jour ; pas de placement table/heure dans le modèle).
- **F-C1** (clé IA en clair localStorage) → **reste P2**, non fait (chemin IA de prod, à faire avec Kevin).

## Synthèse (après passe 3)
| P | Nb | 
|---|---|
| P0 | **0** |
| P1 | **0** (F-K1 résolu) |
| P2 | **0** restant (F-C1 mitigé par garde · F-C2 & F-H1 résolus) |
| P3 | 3 (F-B1, F-D1, F-L1) — dette assumée, non bloquante |
| Nouveaux gardes CI | render-views · rgpd · a11y · xss-guard · **ia-key-privacy** (bloquants) |

Gate `test:ci` **VERT end-to-end** (EXIT 0). Tous les findings P0/P1/P2 sont soit résolus, soit mitigés par un garde CI permanent. Restent 3 P3 de dette (mono-fichier, `loading=lazy`, console.log) — cosmétiques, non bloquants.

Le levier le plus utile n'est pas un correctif de code mais un **garde CI** (F-C2) : convertir la vérification XSS manuelle en filet permanent. C'est la logique Phase 8 « cause racine, pas pansement ».
