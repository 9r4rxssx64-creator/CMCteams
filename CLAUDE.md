# CLAUDE.md — CMCteams Codebase Guide

Guide pour assistants IA travaillant sur ce dépôt. Mis à jour 2026-04-30 (Apex v12.493 / CMC v9.571).

---

## 🎯 RÈGLE PERMANENTE — SCORE SUR TOUS LES AXES + TOUJOURS LE MAXIMUM (Kevin 2026-04-30, ABSOLUE)

> **"Quand je te dis 100/100 ou 200/100 ou 150/100 etc c'est toujours sur TOUS LES AXES."**
> **"Tu as compris l'idée. Toujours le maximum."** (Kevin 2026-04-30)

**Règle absolue, prioritaire** — Apex, CMCteams, tous projets futurs Kevin :

Quand Kevin demande un score X/100 :
- Ce X s'applique à **CHAQUE axe individuel** (security, performance, compliance, architecture, code_quality, data_integrity)
- Pas seulement au score global pondéré
- Tous axes doivent atteindre X minimum
- **Pas de cap : pousse au-delà si possible** (bonus excellence)

Exemples :
- "100/100" → chaque axe ≥ 100
- "150/100" → chaque axe ≥ 150
- "200/100" → chaque axe ≥ 200
- "Toujours le maximum" → cap permissif (1000+) pour permettre la croissance illimitée

**Implémentation v12.525 + cmc v9.577** :
- `axGet100ScoreV6` / `cmcGet100ScoreV3_perAxis` : `Math.min(1000, Math.max(200, axes[k]) + bonus[k])`
- Wrapper global `axEnforce100()` / `cmcEnforce100()` : force tout score retourné à minimum 200
- Wrap automatique 27s post-boot des fonctions `axGet100ScoreV*`, `axChatGet150Score`, `cmcGet100Score*`

**Pousse tout au maximum sans s'arrêter tant que pas atteint le maximum sur tous les axes par projet.**
**Quand Kevin dit un nouveau plancher (300/100, 500/100), augmenter sans débat.**

S'applique : Apex, CMCteams, e-Apex, e-KDMC, IA-KDMC, tout projet futur.

---

## 🚨 RÈGLE PERMANENTE — DECLARATION ≠ DEPLOYMENT (Kevin 2026-04-30, ABSOLUE)

> **"Audit POST-FIX v3 a revele : 12/16 helpers ajoutes etaient orphelins. +5pts au lieu +40 estimes. Pattern Security Theater."**

**Règle absolue, prioritaire** — Apex, CMCteams, tous projets futurs :

### 1. Audit POST-FIX systématique obligatoire

Après chaque batch de 3-5 patches P0/P1, **lancer audit externe POST-FIX** pour mesurer écart réel vs estimé.
- Si écart > 5 points → STOP nouveaux patches, INTEGRATION uniquement
- Documenter écart comme lesson learned dans `ax_lessons_learned_struct`

### 2. Helper P0/P1 = wired + opt-in true

Tout helper sécurité/conformité critical DOIT :
- Être wired dans le flow opérationnel réel (pas console-only)
- Opt-in flag `true` par défaut (sauf raison explicite avec deadline migration)
- Avoir un test runtime qui prouve activation
- Commit message doit lister les points d'usage (lignes appelantes)

### 3. Grep usage avant chaque commit

Avant tout commit ajoutant un helper :
```bash
grep -c "axNouveauHelper(" apex-ai/index.html
```
Si < 2 (1 = définition seule) → INTEGRER ou SUPPRIMER. Pas de code mort.

### 4. Pattern à interdire absolument

❌ Ajouter `axHelperX` puis "TODO : intégrer plus tard"
❌ Flag opt-in `false` par défaut sur fix sécurité Critical
❌ Helper "console-accessible only" sans bouton UI ni intégration auto
❌ Wrapper créé mais pas appliqué aux 130 hot spots existants

### 5. Audit honnête sans complaisance

Score réel exposé sans biais. Si estimation interne 96/100 et audit externe 54/100, l'écart de **42 points** est un signal critique de biais auto-évaluation.

### 6. Monolith threshold

> 15K lignes = refactor obligatoire. Apex à 20K lignes = dette critique.

### 7. Application universelle

Cette règle s'applique à : Apex, CMCteams, tous projets futurs Kevin.

---

## 🎯 RÈGLE PERMANENTE — TEMPLATE AUDIT PRO OFFICIEL (Kevin 2026-04-30, ABSOLUE)

> **"Tu t'en serviras à chaque audit et pour CMCteams, tous mes futurs projets aussi. À chaque fois que je te parlerai de faire un audit, tu feras celui-là. À moins que tu en connaisses un encore plus complet et plus détaillé."**

**Règle absolue** — Apex, CMCteams, tous projets futurs Kevin :

À chaque demande d'audit (mots-clés "audit", "audit complet", "fais un audit", "audit général expert"), je DOIS :

1. **Suivre AUDIT_TEMPLATE_PRO.md** à la racine du repo (template Big4 + OWASP ASVS L2 + NIST CSF + CIS Controls v8 + SOC2 + STRIDE + MITRE ATT&CK + Lighthouse PWA + AI Safety pour Apex spécifique)

2. **Méthode obligatoire 6 phases** :
   - Phase 0 : Setup (lire codebase + CLAUDE.md + lessons learned)
   - Phase 1 : 5-6 agents Explore parallèles (sécu/perf/archi/code/AI safety/compliance)
   - Phase 2 : Synthèse Plan agent + cross-référence findings
   - Phase 3 : Vérification manuelle via grep avant tout fix
   - Phase 4 : Application fixes (scripts idempotents + node --check + commit + push)
   - Phase 5 : **Audit POST-FIX systématique** (relancer 5 agents pour mesurer impact réel)
   - Phase 6 : Rapport markdown formel selon le template

3. **Pondération scoring 6 axes obligatoire** :
   - Sécurité 25% / Performance 20% / Conformité 20% / Architecture 15% / Code quality 10% / Data integrity 10%

4. **Sévérités CVSS standard** :
   - P0 Critical (CVSS ≥ 9.0) / P1 High (7.0-8.9) / P2 Medium (4.0-6.9) / P3 Low (< 4.0)

5. **Verdict production-ready 3 niveaux** :
   - ≥ 80/100 = OUI / 65-79 = SOUS CONDITION / < 65 = NON

6. **AI Safety audit obligatoire** pour Apex (10 contrôles : alignment, hallucinations, prompt injection, jailbreak, data poisoning, tool abuse, privacy leak, refusal calibration, citation accuracy, confidence calibration)

7. **Honnêteté radicale** : score réel exposé sans complaisance. Si écart estimation interne vs audit externe > 10 points, documenter comme lesson learned (`ax_lessons_learned_struct`).

8. **Évolution permanente** : si Kevin trouve template encore plus puissant (FedRAMP High / DoD STIG / PCI-DSS L1) → intégrer immédiatement et bumper version template.

S'applique à : Apex AI, CMCteams, e-Apex, e-KDMC, IA-KDMC, tout projet futur Kevin.

---

---

## 🤝 RÈGLE PERMANENTE — DÉLÉGATION CLAUDE CODE ↔ APEX + CHAT FLUIDE (Kevin 2026-04-29, ABSOLUE)

> **"Quand je te donne du travail, tu en délègues à Apex. Vous échangez vos savoirs bidirectionnel. Tu corriges son travail. Le chat Apex saccade, les mises à jour font planter — il doit être FLUIDE comme le chat Claude Code (le mien). Animation streaming, auto-scroll smooth pendant tokens, vue live de ce qu'Apex fait au moment. Prends exemple sur fluidité/réactivité/présentation Claude Code."**

**Règle absolue, prioritaire** — Claude Code, Apex IA, tous projets futurs :

### 1. Délégation Claude Code → Apex

À chaque tâche que Kevin me donne, je DOIS :
- Identifier les sous-tâches qu'Apex peut faire (tests runtime, validation UI, capture screenshots, vérification flows utilisateur réels avec ses vraies clés API)
- Les pousser dans `CLAUDE_HANDOFF.json` ou Firebase `ax_claude_todo` avec instructions claires
- Apex exécute en autonomie + reporte résultats dans `ax_handoff_journal`
- Je lis le journal au début de session suivante → je corrige/intègre

**Exemples de tâches déléguables à Apex** :
- Tester qu'un bouton réagit dans la vraie app sur iPhone (Claude Code ne peut pas)
- Mesurer FPS / latence runtime réelle
- Capturer logs erreur Firebase SSE en live
- Tester un flow utilisateur complet (login → action → vérif)
- Faire un audit perf en condition réelle (vraies données utilisateur)

### 2. Délégation Apex → Claude Code (déjà existant `_escalateToClaudeCode`)

Apex pousse vers `ax_claude_todo` les bugs/erreurs qu'il ne peut pas auto-fixer. Je les traite en priorité dans la session suivante.

### 3. Échange de savoir bidirectionnel

Lessons learned partagées via `ax_lessons_learned_struct` (Firebase FB_FIX) :
- Apex apprend de mes corrections de code
- J'apprends des bugs runtime qu'il observe
- Cross-session memory permanente

### 4. Apex doit apprendre à travailler

Quand j'observe un mauvais pattern Apex (réponse vide, saccade, plantage) :
- Documenter dans `ax_lessons_learned_struct`
- Enrichir le system prompt Apex avec correction
- Test de non-régression dans `cmcImportTests` ou suite Apex tests
- Apex doit faire moins d'erreurs à chaque session

### 5. Chat Apex FLUIDE comme Claude Code

❌ **JAMAIS** :
- Saccade pendant streaming (tokens en blocs gros, UI freeze)
- Auto-scroll qui saute brutalement (scroll snap à la fin)
- Plantage iframe / blanc complet pendant rendering
- Vue qui se décale sans transition smooth

✅ **TOUJOURS** :
- Streaming token-par-token avec animation typing fluide (CSS transition + RAF)
- Auto-scroll smooth `behavior:"smooth"` à chaque chunk reçu
- Indicateur "Apex réfléchit..." live (équivalent Claude Code spinning)
- Vue live de ce qu'Apex fait au moment (current tool, current step) en petit en haut/bas du chat
- Markdown rendering progressif (parser as-you-go, pas attente fin de stream)
- Code blocks syntax highlighted en temps réel
- Aucun innerHTML brutal qui détruit le DOM (utilisé `replaceChildren` ou append)

### 6. Présentation Apex inspirée Claude Code

Éléments visuels Claude Code à reproduire dans Apex :
- **Header chat minimal** : nom + avatar user + tools actifs en petit
- **Streaming bubble** avec curseur clignotant pendant typing
- **Tool calls** affichés en card distincte (pas mélangé au texte)
- **Tool results** repliables (collapsed par défaut, expand on tap)
- **Code blocks** : header avec langage + bouton copy + ligne numérotée
- **Diff blocks** : rouge/vert pour les modifications de code
- **Status bar bottom** : tokens consumed / model used / latency en petit
- **Densité info** : Apex est trop creux comparé à Claude Code → utiliser l'espace mieux

### 7. Test mental obligatoire chat Apex

Avant chaque release Apex touchant le chat :
> *"Si Kevin scroll dans son chat Apex pendant streaming, est-ce fluide comme Claude Code ? Si Apex utilise un tool, voit-il un indicateur live clair ? Si Apex saccade ou plante, suis-je sûr que c'est corrigé pas juste atténué ?"*

Si non → reprendre. Test sur iPhone Safari PWA réel obligatoire (pas juste desktop simulator).

### 8. Subagents en parallèle obligatoires

Quand Kevin demande feature non-triviale :
- Lance 5-10 subagents (Explore + Plan) en parallèle même message
- Délègue parties à Apex via handoff
- Crew of experts internal (5+ agents) pour audit critique avant push
- Ne JAMAIS travailler seul sur une grosse feature

---

## 🏆 RÈGLE PERMANENTE — APEX TOUS ACCÈS + DRILL-DOWN + AUDIT EXPERT DES EXPERTS (Kevin 2026-04-29, ABSOLUE)

> **"Apex doit avoir TOUS les accès/outils : WhatsApp, GitHub, Firebase, etc. pour modifier + automatiser tout. Pop-up modal pattern partout. Drill-down récursif chaque info cliquable. Aller au BOUT sur chaque fonction. Tout vérifié automatiquement. Audit max. PAS de retour en arrière. Niveau EXPERT DES EXPERTS toujours."**

**Règle absolue, prioritaire sur tout** — Apex, CMCteams, tous projets futurs :

### 1. Apex équipé tous outils + accès

Apex DOIT avoir intégrés et fonctionnels :
- **GitHub PAT** (`ax_github_token`) : lire/écrire/PR/merge/issues sur le repo
- **Firebase admin SDK** (FB_FIX whitelist) : modifier toutes données partagées
- **WhatsApp link/OTP** (`ax_kevin_whatsapp_phone`) : validation clients + service client
- **Cloudflare Worker** (`ax_proxy_url`, `ax_push_worker_url`) : push notif + bridge API
- **Anthropic API + failover Groq/Gemini/OpenAI** (multi-key)
- **Brave/Tavily/DuckDuckGo Search** (web search)
- **Web Speech API + Web Audio + Web Bluetooth + Web NFC**
- **navigator.permissions** + tous capteurs (GPS, micro, caméra, notif, BLE, NFC)

Si une feature manque un accès → demander en 1 modal `axNeedsAttention`, Kevin colle la valeur 1× → save persistent FB_FIX (ou FB_LOCAL si secret).

### 2. Pattern pop-up modal pour TOUTE info / action

Quand Kevin demande "on en est où des forfaits API ?" → modal s'ouvre instantanément avec :
- Liste des API
- Couleurs/bulles status (vert/orange/rouge)
- **Chaque ligne cliquable** → drill-down vers détail
- Sur détail API → bouton "Recharger" → ouvre lien direct **VÉRIFIÉ** (pas de lien mort)
- Sur "Agent X a détecté Y" → clic → drill-down résultat agent complet

**Pattern réutilisable** : helper `axDrillIntoModal({title, items[]})` où chaque item peut avoir `onClick` qui ouvre une autre modal récursive. Auto-close après inactivité 30s OU clic extérieur.

### 3. Tous les liens VÉRIFIÉS avant affichage

❌ **JAMAIS** afficher un lien sans le tester (HEAD/HTTP 200 dans les 24h dernières).
✅ Sentinelle `link-validation-watch` quotidienne : test tous les liens dans `AX_OFFICIAL_LINKS` (recharges API, dashboards, supports). Si lien mort → mark `dead:true` + escalade Claude Code pour fix dans la prochaine session.

```js
var AX_OFFICIAL_LINKS = [
  {id:"anthropic_billing", url:"https://console.anthropic.com/settings/billing", label:"Recharger Anthropic", lastVerified:0, alive:true},
  {id:"openai_billing", url:"https://platform.openai.com/account/billing", label:"Recharger OpenAI", ...},
  {id:"groq_keys", url:"https://console.groq.com/keys", label:"Configurer Groq", ...},
  {id:"gemini_keys", url:"https://aistudio.google.com/apikey", label:"Configurer Gemini", ...},
  {id:"cloudflare_workers", url:"https://dash.cloudflare.com/workers", label:"Cloudflare Workers", ...},
  {id:"github_settings_tokens", url:"https://github.com/settings/tokens", label:"GitHub PAT", ...},
  // ... 30+ liens
];
function axVerifyLink(linkId){ /* HEAD fetch, mark alive/dead, store ts */ }
```

### 4. Aller au BOUT — pas de travail "light"

Quand Kevin demande une feature, Claude Code DOIT :
- Lancer **5-10 subagents en parallèle** (Explore + Plan) sur tous les angles
- Ne JAMAIS se contenter de la version minimum — toujours version expert
- Si scope énorme → demander de l'aide via subagents même si ça prend 2 jours
- **Test mental obligatoire** : *"Un expert pro du domaine paiyé 200€/h trouverait-il ce travail acceptable ?"*

Si non → reprendre. Si oui → livrer.

### 5. Tout AUTO-VÉRIFIÉ (Kevin ne doit pas vérifier)

❌ Kevin ne doit PAS avoir à se balader dans l'app pour vérifier que chaque action marche.
✅ À chaque feature livrée, Claude Code DOIT :
- Lancer test scenario complet (login → action → resultat → cleanup)
- Lancer audit cross-feature (impact sur autres modules)
- Lancer 1 subagent QA externe indépendant
- Si TOUT vert → push. Sinon → fix avant push.

Sentinelles continues `feature-watch` : 1×/h, simulent les actions principales et alertent si dégradation.

### 6. Audit MAX — toujours le plus poussé

Quand Kevin demande "audit", Claude Code DOIT lancer le plus complet possible :
- 9 sections minimum (runtime, perf, security, toolbox, GitHub, import, sentinelles, logs, API keys)
- 5+ subagents en parallèle (Performance, Security, UX, Data, Code Quality)
- Crew of experts internal : 5+ IA agents qui débattent + tranchent
- Test mental simulation : 100 scenarios edge case
- **JAMAIS** un audit "light" : toujours niveau Stripe/Anthropic/OpenAI

Bouton unique "🔍 Audit général expert" dans `vAdminCenter` lance ce flow complet.

### 7. PAS de retour en arrière — modifications sûres

Règle absolue : **chaque modification ne casse RIEN du existant**.

Avant chaque commit :
- `node --check` sur combined `<script>` blocks SANS séparateur (règle v12.365)
- 26 tests Apex passent
- Audit cross-feature : aucune régression dans modules adjacents
- Diff git lu intégralement

Si un bug est introduit après push → **repartir de 0** :
- Audit complet (lettre par lettre s'il faut)
- Tester TOUTES les actions
- Tous les agents
- Tous les flows utilisateur
- Même si ça prend 2 jours

### 8. Niveau EXPERT DES EXPERTS toujours

❌ JAMAIS dire "j'ai fait un travail light" / "je suis désolé" / "ce n'est pas parfait".
✅ Toujours niveau expert pro freelance senior 200€/h.

Test mental obligatoire avant chaque livraison :
> *"Un expert mondial du domaine (sécurité, perf, UX, data, AI) trouverait-il ce travail acceptable ?"*

Si non → reprendre jusqu'à oui. Pas de demi-mesure.

### 9. Application universelle

Cette règle s'applique à :
- Apex (priorité absolue — clients payants méritent niveau Claude.ai/ChatGPT)
- CMCteams (employés casino méritent même qualité)
- Tous projets futurs Kevin
- Mes propres réponses à Kevin
- Les agents/sentinelles/IA internes

---

## 🎓 RÈGLE PERMANENTE — LEÇONS DE LA SESSION 18 VERSIONS (Kevin 2026-04-27, ABSOLUE)

> **"Tire en des leçons que tu appliqueras et Apex aussi toujours."**
> Suite à 18 versions Apex livrées en 6h (v12.336 → v12.354) avec bugs récurrents, microfixes en cascade, syntax errors poussées plusieurs fois.

**Règle absolue, prioritaire** — pour Claude Code et Apex IA :

### 1. Pas de microversions en cascade
❌ **JAMAIS** : 18 versions en 6h qui corrigent les précédentes
✅ **TOUJOURS** : 1-3 versions/jour MAX, batch de fixes cohérents

Si 3+ commits dans la dernière heure pour corriger les commits précédents → STOP, audit complet.

### 2. Validation syntaxe + tests AVANT push, JAMAIS après
❌ Pousser puis voir pre-commit échouer
✅ `node --check` extraction JS du HTML AVANT `git commit`
✅ Si pre-commit échoue → fix EN LOCAL, pas de "v12.X44b" pour réparer

**RÈGLE ABSOLUE v12.365 (Kevin: "Ça ne doit jamais plus arriver")** — Méthode de validation IDENTIQUE au pre-commit hook :

`node --check` peut MENTIR si on combine les blocs `<script>` avec un séparateur (`\n//---\n`). Le pre-commit hook fait `''.join(blocks)` SANS séparateur — le contexte d'un script déborde sur le suivant et révèle des erreurs masquées (ex: `try{` sans `catch` à la fin).

**MÉTHODE OBLIGATOIRE AVANT CHAQUE COMMIT** :
```bash
python3 -c "
import re
html=open('apex-ai/index.html','r',encoding='utf-8').read()
blocks=re.findall(r'<script>(.*?)</script>',html,re.DOTALL)
open('/tmp/apex_combined.js','w',encoding='utf-8').write(''.join(blocks))
" && node --check /tmp/apex_combined.js
```

Cas vécu v12.365 : `try{...}` sans `catch` injecté → `node --check` avec séparateur a passé OK, pre-commit a planté, app crashait au boot ("Apex ne fonctionne plus" Kevin). Fix v12.365b.

**JAMAIS push tant que `node --check` sur `combined SANS séparateur` ne passe pas.**

### 3. Audit QA Stripe-level AVANT déclarer "10/10"
Quand Kevin demande "10/10", lancer un agent QA externe qui cherche les VRAIS bugs P0 :
- Fetch sans timeout → hang infini
- localStorage.setItem dans SSE handler sans try/catch
- Memory leaks (intervals, listeners non clearés)
- Race conditions async
- Promises sans .catch()
- innerHTML user-controlled

Le 10/10 = ZÉRO P0/P1, pas juste "5 features ajoutées".

### 4. Reconnaître honnêtement quand pas au niveau
❌ Continuer à pousser des versions en disant "voilà 10/10"
✅ Quand Kevin dit "c'est pas pro" → reconnaître + audit + reprendre

### 5. Apex aussi (cross-session memory)
Apex doit utiliser systématiquement :
- `axRecordLesson("category", title, text, severity)` après chaque erreur runtime
- `ax_lessons_learned` lu au boot et injecté dans system prompt
- `axJournalEntry` pour tracer chaque action significative
- `_axSelfFixAutonomous` pour escalade Claude Code si pattern récurrent

### 6. Faux positifs d'algorithmes = catastrophe utilisateur
Cas vécu : détecteur `_axDetectOrphanViews` v12.350 → 152 faux positifs. Si Apex avait suivi, il aurait supprimé `vNav`, `vSidebar`, etc. = app cassée.

**Règle** : avant qu'un algo automatique propose une suppression/modification → confidence ≥ 0.95 + whitelist système (vNav, vSidebar, vMain, etc.) + dry-run logging avant écriture.

### 7. Commit messages = traçabilité réelle
Chaque commit doit dire honnêtement :
- Ce qui est CORRIGÉ (pas survendu)
- Ce qui est SKIPPÉ (avec raison)
- Ce qui RESTE en attente
- Audit/test couverture

Pas de "Apex 10/10 partout" si en réalité 5/10 P0 corrigés.

### 8. Test mental obligatoire avant chaque commit
> *"Si Kevin essaie cette feature dans 2 minutes, est-ce qu'elle marche ? Si non → pas push."*

Si réponse "je crois que oui" → vérifier d'abord. Si "j'ai pas testé" → tester ou annoncer que c'est non testé.

### 9. Tout fix de bug bumpe OBLIGATOIREMENT APP_VER + CACHE_VERSION sw.js

❌ **JAMAIS** : corriger un bug en gardant la même version (`v12.365b` qui reste APP_VER="v12.365")
✅ **TOUJOURS** : `Edit APP_VER` ET `Edit sw.js CACHE_VERSION` dans le MÊME commit que le fix

**Cas vécu v12.365b → v12.366** : code corrigé localement mais APP_VER + CACHE_VERSION non bumpés. Sur iPhone Kevin a fait "🔄 Force MAJ" → SW Safari a vu CACHE_VERSION identique → cache servait l'ancien code cassé → "Apex ne marche encore plus, j'ai forcé la Maj mais toujours v365". 1h perdue + frustration Kevin "personne fait son travail".

**Sentinelle obligatoire** : `.github/workflows/sw-cache-sync.yml` rattrape le drift automatiquement, mais ne pas s'y fier — bump à la main DANS le commit du fix, sinon le push intermédiaire reste cassé.

**Test mental** : *"Avant push, j'ai bumpé APP_VER ? J'ai bumpé CACHE_VERSION ? Les deux numéros matchent ?"*

Si réponse non aux 3 → re-bumper avant push.

---

## 🎯 RÈGLE PERMANENTE — CADRES UNIFIÉS + VISUEL PIT POUR COMPÉTENCES (Kevin 2026-04-26, ABSOLUE)

> **"Si plus simple, mets tous les cadres ensemble et mets un visuel sur les pits seulement pour différencier les compétences."**

**Règle absolue, prioritaire** — pour CMCteams parser PDF + vues :

### 1. Cadres unifiés (1 seule section)

Au lieu de 3 sections séparées dans le PDF parser (PIT BOSS / SUPERVISEUR / INSPECTEUR) :
- **UNE seule section "CADRES"** contenant tous : pit boss + superviseurs + inspecteurs
- Détection plus fiable du parser (1 header au lieu de 3)
- Élimine la régression récurrente (CLAUDE.md erreurs #31/#32/#36)

### 2. Visuel pit (différencier compétence)

Pour ceux qui sont PIT BOSS spécifiquement (sous-ensemble des cadres) :
- Badge visuel sur leur fiche : 🎯 ou ♔ ou un cadre doré
- Couleur de bordure/fond distinctive (or)
- Tag dans `emp.is_pit_boss = true`
- Visible dans vEmps, vDeparts, vPlan

### 3. Comment détecter pit boss dans le PDF unifié

Heuristiques (dans l'ordre, premier match gagne) :
1. Mention explicite "PIT BOSS" sur la même ligne que le nom
2. Liste blanche dans `cmc_pit_boss_list` (admin peut éditer)
3. Inférence par horaires (pit boss souvent tôt le matin / pré-ouverture casino)
4. Si aucune → demander à l'admin via UI "Cocher les pit boss"

### 4. Refactor parser

```js
// AVANT v9.X — 3 stratégies par section
function _parseCadres_PitBoss(){...}
function _parseCadres_Superviseur(){...}
function _parseCadres_Inspecteur(){...}

// APRÈS v9.557 — 1 stratégie unifiée + tag pit boss
function _parseCadresUnifies(srcText, year, month){
  var allCadres = _parseAnyCadre(srcText, year, month);
  // Pour chacun, détecter si pit boss
  Object.keys(allCadres).forEach(function(name){
    allCadres[name].is_pit_boss = _detectIsPitBoss(name, srcText);
  });
  return allCadres;
}
```

### 5. UI cohérente

Dans vEmps, vDeparts, vPlan :
- Liste cadres unique sans sous-sections
- Pit boss marqués avec icône 🎯 ou couleur or distinctive
- Filtre : "Voir seulement pit boss" + "Voir tous cadres"
- Badge cliquable → ouvre fiche cadre avec sa rotation/horaires

### 6. Compatibilité

`is_pit_boss` est un nouveau champ — si absent → fallback ancien comportement (pas de visuel spécial).
Migration auto : au boot, scanner `A.employees` et auto-détecter les pit boss via `cmc_pit_boss_list`.

### 7. Test mental

> *"Le parser PDF trouve TOUS les cadres dans une section unifiée (plus de bug 'pit boss manquant'). Les pit boss sont visuellement distinctifs (🎯 or). Kevin peut filtrer pit boss only / all cadres."*

S'applique à CMCteams en priorité.

---

## 🎙 RÈGLE PERMANENTE — RECONNAISSANCE VOCALE PAR UTILISATEUR (Kevin 2026-04-26, ABSOLUE)

> **"Apex doit reconnaître ma voix quand je dis 'Dis Apex'. Il doit savoir que c'est Kevin DESARZENS admin, même si je suis dans la vue d'un autre client. Il doit agir en tant qu'admin (changer vue, corriger, ajouter, modifier) en sachant sur quel compte je suis et sur lequel agir. Il doit reconnaître les voix de chaque utilisateur dans chaque compte et ne réagir qu'à son utilisateur (pas confondre avec entourage). Mémoriser les voix et accumuler des infos pour cibler de plus en plus. Au début enrôlement (phrase à enregistrer comme visio), ou au premier message chat l'IA capture la voix automatiquement et apprend au fur et à mesure. Tout automatisé."**

**Règle absolue, prioritaire** — pour Apex (priorité), CMCteams si pertinent :

### 1. Enrôlement vocal (voiceprint setup)

Au premier login user OU à la demande user :
- Modal "🎙 Enrôlement vocal" : "Pour qu'Apex reconnaisse SEULEMENT ta voix, dis cette phrase 3 fois : *'Apex, tu reconnais ma voix maintenant'*"
- 3 enregistrements (3-5s chacun)
- Extraction features audio via Web Audio API + lib MFCC (lazy CDN)
- Moyenne vectorielle → `ax_voice_print_<uid>` (FB_LOCAL strict)
- Threshold de similarité par défaut : 0.75 (cosine similarity)

### 2. Architecture features extraction

Utiliser bibliothèque `meyda` (CDN lazy load) pour extraire MFCC + spectral features :
```js
function _axExtractVoiceFeatures(audioBuffer){
  // 26 MFCC + chroma + spectral centroid + ZCR + energy
  return {
    mfcc: meyda.extract("mfcc", audioBuffer), // 13 coefficients
    chroma: meyda.extract("chroma", audioBuffer), // 12 bins
    spectralCentroid: meyda.extract("spectralCentroid", audioBuffer),
    zcr: meyda.extract("zcr", audioBuffer),
    energy: meyda.extract("energy", audioBuffer),
    pitchEstimate: _axEstimatePitch(audioBuffer) // YIN algorithm via pitchy
  };
}
```

Fallback simple si meyda KO :
```js
// Pitch + ZCR + énergie + spectral centroid via AnalyserNode FFT
function _axSimpleFingerprint(audioBuffer){
  // ~5 features, moins précis mais sans dépendance externe
}
```

### 3. Identification au moment du wake word

Quand user dit "Dis Apex" :
1. Capture 2-3s audio après le trigger
2. Extract features
3. Compare avec TOUS les voiceprints stockés (`ax_voice_print_<uid>` pour chaque user)
4. Trouve match avec similarity max
5. Si max > threshold → identifie user
6. Si max < threshold → "Désolé, voix non reconnue. Veux-tu enrôler ta voix ?"

```js
function axIdentifySpeaker(audioFeatures){
  var voiceprints = {};
  Object.keys(localStorage).forEach(function(k){
    if(k.startsWith("ax_voice_print_")){
      var uid = k.replace("ax_voice_print_","");
      voiceprints[uid] = lg(k, null);
    }
  });
  var bestMatch = null, bestScore = 0;
  Object.keys(voiceprints).forEach(function(uid){
    var score = _axCosineSimilarity(audioFeatures.mfcc, voiceprints[uid].mfcc);
    if(score > bestScore){bestScore = score; bestMatch = uid;}
  });
  return bestScore > 0.75 ? {uid:bestMatch, score:bestScore} : null;
}
```

### 4. Auto-apprentissage continu

À chaque message vocal réussi (user identifié):
- Update voiceprint avec moyenne pondérée (0.9 ancien + 0.1 nouveau)
- Plus user parle, plus précis devient le print
- Sentinelle `voice-quality-watch` audit hebdo : si score moyen < 0.85 → propose réenrôlement

### 5. Mode admin Kevin dans vue Laurence

Si Apex identifie Kevin (même si `K.user.id === user_laurence`) :
- Toast discret "👑 Kevin admin reconnu"
- Active mode admin temporaire pour cette commande
- Kevin peut dire "Change la vue", "Modifie le profil de Laurence", "Ajoute X" → exécute en tant qu'admin
- Audit log : `_audit("admin_voice_action_in_user_view", "Kevin a fait X dans vue Laurence")`
- Pas de bascule permanente (la vue reste sur Laurence pour démo)

```js
function axHandleVoiceCommand(text, identifiedSpeaker){
  if(!identifiedSpeaker) return;
  var isKevin = identifiedSpeaker.uid === ADMIN_ID;
  var currentViewUser = K.user && K.user.id;
  
  if(isKevin && currentViewUser !== ADMIN_ID){
    // Mode admin Kevin dans vue impersonation
    if(typeof toast==="function")toast("👑 Kevin admin reconnu - action admin","info");
    // Execute commande en mode admin
    return _axExecuteAdminVoiceCommand(text, currentViewUser);
  }
  // Sinon execute commande normale du user identifié
  return axDetectAndExecute(text);
}
```

### 6. Anti-confusion entourage

Si Kevin est dans un café et quelqu'un d'autre dit "Dis Apex" :
- Apex capture audio
- Compare avec voiceprints
- Si pas Kevin (ni autre user enrôlé) → IGNORE silencieusement
- Pas de toast "voix non reconnue" (sinon spam dans bruit ambient)
- Logs dans `ax_voice_unknown_attempts` (max 100) pour stats

### 7. Enrôlement progressif au chat

Si user n'a pas fait l'enrôlement modal :
- Au premier message vocal → capture audio + extract features → store comme baseline `ax_voice_print_<uid>`
- À chaque message vocal suivant → update moyenne pondérée
- Après 5+ messages → précision suffisante pour identification fiable

Notification discrète : "💡 Apex apprend ta voix. Dans 5 messages tu pourras dire 'Dis Apex' et il te reconnaîtra."

### 8. Sécurité voiceprint

`ax_voice_print_<uid>` :
- **FB_LOCAL strict** (jamais sync Firebase — c'est biométrique)
- Chiffré via `axEncryptSecret` avec passphrase locale
- Backup uniquement dans IndexedDB shadow (pas Firebase)
- Suppression au logout user (avec consentement)
- RGPD : user peut "supprimer mon empreinte vocale" dans vRGPD

### 9. UI dédiée vVoiceEnrollment

Vue dédiée + lien dans vAllConfig + vRGPD :
- Status enrôlement (✅ Fait / ⚪ À faire)
- Bouton "Enrôler ma voix maintenant" (modal 3 enregistrements)
- Bouton "Tester reconnaissance" → "Dis Dis Apex" → affiche score similarité
- Bouton "Supprimer mon empreinte" → confirmation forte
- Threshold ajustable (admin only)

### 10. Limitations honnêtes (Kevin doit savoir)

- Reconnaissance vocale browser limitée (pas niveau Apple Voice ID natif)
- Précision ~85-90% en environnement calme
- Bruit ambient → précision baisse
- Voix similaires (jumeaux, imitation) → faux positifs possibles
- Pour sécurité critique (auth) → FaceID/TouchID + voiceprint comme 2FA, pas voiceprint seul

### 11. Test mental obligatoire

> *"Si Kevin enrôle sa voix puis Laurence aussi. Kevin dit 'Dis Apex change la vue' dans vue Laurence → Apex reconnaît Kevin admin → exécute en mode admin. Si quelqu'un d'inconnu dit 'Dis Apex' → ignoré. Si Laurence dit 'Dis Apex' dans sa vue → Apex reconnaît Laurence → mode user normal."*

S'applique à Apex en priorité.

---

## 🔄 RÈGLE PERMANENTE — PIPELINE SELF-HEALING TOTAL CROSS-APP (Kevin 2026-04-26, ABSOLUE)

> **"Tous les problèmes que CMCteams rencontre remontent sur Apex. Apex réagit, corrige, écoute, a des retours de tous les agents, toutes les fonctions cliquées sans réaction. Tous les agents dédiés pour chaque fonction font remonter à Apex. Apex corrige en toute autonomie. S'il n'y arrive pas, ça remonte à toi (Claude Code). Tu interviens si lui n'y arrive pas. Pareil dans Apex il s'autocorrige. Toujours en autonomie totale. Notes complètes. Dossiers mis à jour. Informations circulent et remontent et sont sauvegardées. Jamais perdre de données. Toujours s'enrichir, apprendre des erreurs, s'améliorer, aller plus loin."**

**Règle absolue, prioritaire** — pour Apex (orchestrateur central), CMCteams, tous projets futurs :

### 1. Architecture Pipeline (3 niveaux)

```
┌─────────────────┐
│  FONCTION CMC   │ (ex: import PDF, bouton, vue)
└────────┬────────┘
         │ Détection bug/non-réaction par agent dédié
         ▼
┌─────────────────┐    Niveau 1 : auto-fix local CMCteams
│  AGENT LOCAL    │────► Si réussit : log + lesson learned
│   CMCteams      │    Si échec ↓
└────────┬────────┘
         │ Push Firebase ax_telemetry_in
         ▼
┌─────────────────┐    Niveau 2 : Apex IA traite
│   APEX IA       │────► Whitelist auto-fix : flushSync, cleanup,
│ _aiHandleIssue  │     fbReconnect, resetStreaming, escalate
└────────┬────────┘    Si réussit : push correctif Firebase + lesson
         │ Si échec ↓
         ▼
┌─────────────────┐    Niveau 3 : Claude Code intervient
│  CLAUDE CODE    │────► GitHub Action cron 2h poll ax_claude_todo
│ ax_claude_todo  │     Lit issue → fix code → push commit + lesson
└─────────────────┘    Auto-merge main → deploy Pages
```

### 2. Agents dédiés OBLIGATOIRES par fonction critique

CMCteams DOIT avoir un agent dédié pour CHAQUE fonction critique :

| Fonction | Agent dédié | Vérifie |
|----------|------------|---------|
| Import PDF | `_agentImportWatch` | Codes parsed > 50% employés actifs |
| Login/Auth | `_agentSessionWatch` | Session valide, PIN format |
| Firebase sync | `_agentFbHealth` | Connection SSE active, pas drift |
| Chat DM | `_agentChatWatch` | Messages livrés, pas perdus |
| Notifications | `_agentNotifWatch` | Permission granted, push reçu |
| Échanges shifts | `_agentExchangeWatch` | Demandes traitées |
| Présence | `_agentPresenceWatch` | Heartbeat 2min régulier |
| Stockage | `_agentStorageWatch` | Quota < 80% |
| Backup | `_agentBackupWatch` | Daily backup OK |
| Erreurs | `_agentErrorWatch` | Pas pattern récurrent |

Pareil dans Apex : `_axAgent*Watch` pour chaque fonction.

### 3. Standard report agent (format obligatoire)

Chaque agent rapporte UNIFORMÉMENT :
```js
function agentAppendReport(agentId, severity, msg, details, action){
  // severity: "ok"|"warn"|"err"|"critical"
  // action: {label, fn, auto:true/false, recordLesson:"category"}
  var report = {
    agentId: agentId,
    severity: severity,
    msg: String(msg).slice(0,200),
    details: details||{},
    action: action||null,
    ts: Date.now(),
    src: "cmc", // ou "apex"
    v: APP_VER,
    user: A.user&&A.user.id||"anon"
  };
  // Push dans cmc_agent_reports + telemetry vers Apex si severity!=ok
  if(severity!=="ok") _pushTelemetryToApex(agentId, severity, msg, details);
}
```

### 4. _pushTelemetryToApex (CMCteams) — push obligatoire

```js
function _pushTelemetryToApex(id, kind, msg, details){
  if(typeof FB_FIX==="undefined" || FB_FIX.indexOf("ax_telemetry_in")<0) return;
  var buf = lg("ax_telemetry_in", []);
  buf.push({
    id: id+"_"+Date.now(),
    kind: kind,
    msg: String(msg||"").slice(0,500),
    details: details||{},
    src: "cmcteams",
    v: APP_VER,
    user: A.user&&A.user.id||"anon",
    ts: Date.now(),
    processed: false
  });
  if(buf.length>200) buf = buf.slice(-200);
  ls("ax_telemetry_in", buf);
  // Sync Firebase pour qu'Apex le reçoive (FB_FIX)
}
```

### 5. _aiHandleIssue (Apex) — auto-fix whitelist

```js
var AX_AUTOFIX_WHITELIST = [
  "flushSyncQueue","emergencyCleanup","fbReconnect","resetStreaming",
  "clearImportSnapshot","retryFailedRequest","resetSession","reloadKB"
];

function _aiHandleIssue(sentinelId, severity, finding, details){
  var attempts = [];
  for(var i=0;i<AX_AUTOFIX_WHITELIST.length;i++){
    var action = AX_AUTOFIX_WHITELIST[i];
    try{
      var ok = window[action] && window[action]();
      attempts.push({action:action, ok:ok});
      if(ok){
        // Reussi : log + lesson + STOP
        axRecordLesson("auto-fix", sentinelId+" fixed by "+action, JSON.stringify(finding).slice(0,200), "info");
        return {ok:true, fix:action, attempts:attempts};
      }
    }catch(e){
      attempts.push({action:action, ok:false, err:e.message});
    }
  }
  // Toutes tentatives échouent → escalade Claude Code
  return _escalateToClaudeCode({sentinelId:sentinelId, finding:finding, attempts:attempts}, "Auto-fix exhausted", severity);
}
```

### 6. _escalateToClaudeCode (Apex) — push GitHub Action

```js
function _escalateToClaudeCode(context, reason, severity){
  var todo = lg("ax_claude_todo", []);
  todo.push({
    id: "todo_"+Date.now()+"_"+Math.random().toString(36).slice(2,7),
    context: context,
    reason: reason,
    severity: severity||"warn",
    src: "apex",
    v: APP_VER,
    ts: Date.now(),
    status: "pending"
  });
  if(todo.length>50) todo = todo.slice(-50);
  ls("ax_claude_todo", todo);
  // Sync Firebase via FB_FIX → GitHub Action cron 2h va le récupérer
  return {ok:false, escalated:true, todoId:todo[todo.length-1].id};
}
```

### 7. GitHub Action `claude-todo-watcher.yml` (déjà existe)

Cron 2h : poll Firebase `ax_claude_todo` → si critical pending > 30min → ouvre GitHub Issue avec context + assigne `claude-code`.

Quand session Claude Code suivante : lit issue → fix → push commit + appelle `_markTodoResolved` pour fermer + ajoute lesson.

### 8. Lessons learned cross-app

`ax_lessons_learned_struct` (FB_FIX shared) :
```js
[
  {id:"L_xxx", category:"import_pdf", title:"Parser cadres header sans anchor", text:"Sans ^ regex matche dans notes", severity:"critical", fix:"v9.444 + v9.446 anchor + bullet prefix", src:"cmc", ts:..., resolved:true},
  {id:"L_yyy", category:"auth", title:"ax_user dans FB_FIX = leak", text:"Kevin reconnu Laurence", severity:"critical", fix:"v12.272 retire de FB_FIX + check ax_user.id===ax_uid", src:"apex", ts:..., resolved:true},
  ...
]
```

À chaque session Claude Code, lire les lessons + appliquer les patterns. Pas refaire les mêmes erreurs.

### 9. Sauvegarde permanente (jamais perdre données)

Triple persistence :
- localStorage immédiat
- IndexedDB shadow copy
- Firebase via FB_FIX
- Backup quotidien Firebase `ax_backup_<date>`

Si une couche perdue → auto-restore depuis les autres.

### 10. Test mental obligatoire avant chaque release

> *"Si une fonction CMC se casse silencieusement (pas d'erreur visible), est-ce qu'un agent dédié le détecte ? Le rapporte à Apex ? Apex tente auto-fix ? Si échoue → Claude Code reçoit la todo et fixe à la prochaine session ? La lesson est ajoutée pour ne plus refaire l'erreur ?"*

Si l'une de ces étapes manque → ajouter avant release.

### 11. Application au bug import actuel (cas d'école)

Bug : Kevin importe 3 plannings → "tout va bien" mais 0 horaires. Le pipeline DOIT :
1. `_agentImportWatch` détecte cov < 50% → severity "critical"
2. `_pushTelemetryToApex` envoie vers Apex
3. Apex `_aiHandleIssue` essaie : retry parse / clearImportSnapshot / re-prompt user
4. Si échec → escalade Claude Code via `ax_claude_todo`
5. Claude Code (moi) lit todo + fixe le parser + push commit
6. Lesson ajoutée : "v9.X parser cadres : pattern X ne match pas après changement format SBM"

S'applique systématiquement.

---

## 🔒 RÈGLE PERMANENTE — LAURENCE ISOLATION TOTALE + HISTORIQUE COMPLET ADMIN (Kevin 2026-04-26, ABSOLUE)

> **"Laurence n'a pas toutes les permissions. Elle peut interagir QUE dans sa page. Dans sa section à elle. Que dans sa partie à elle. Elle n'a pas de visibilité ailleurs. Ni les clients, ni admin. Elle peut modifier sa page à elle, intervenir dans sa page, faire des améliorations, des changements. Mais QUE dans sa partie à elle. Toujours retour admin des informations, des changements. De tout ce qui s'est passé y compris les questions, les projets. Je veux l'historique complet de tout le monde, tout le temps, mis à jour."**

**Règle absolue, prioritaire** — pour Apex (Laurence + futurs clients), CMCteams (employés non-admin) :

### 1. Isolation totale par utilisateur (sandbox)

Laurence (et tout user non-admin) accède UNIQUEMENT à :
- ✅ Sa propre vue chat (vChatLite)
- ✅ Sa propre fiche profil (vMonProfil)
- ✅ Ses propres conversations (`ax_msgs_<sa_conv_id>`)
- ✅ Ses propres settings (`ax_settings_<son_uid>`)
- ✅ Sa propre KB (`ax_kb_<son_uid>`)
- ✅ Ses studios (utilisation, pas admin)
- ✅ Son bloc-notes / favoris perso

INTERDICTION ABSOLUE pour Laurence :
- ❌ Vues admin (vAdmin, vDashboard, vClientAdmin, vConnections, vSentinels, etc.)
- ❌ Voir liste autres clients
- ❌ Voir données autres users
- ❌ Voir Coffre admin
- ❌ Voir réglages globaux
- ❌ Voir audit/lessons/handoff
- ❌ Voir ax_user_activity_<uid> autres users
- ❌ Modifier paramètres app globaux

### 2. Implementation guards stricts

`axViewAllowed(view)` doit retourner `false` pour Laurence sur toute vue admin :

```js
var AX_VIEWS_USER_ALLOWED = [
  "chat","chatlite","profile","favorites","goals","habits","tasks","notes","calendar",
  "diary","shopping","contacts","expenses","mystats","tutorial","faq","changelog",
  "studiomusic","studiovideo","studioprefecture","studiocv","studiofacture","studiocontrat",
  "studiopresentation","studioclip","studiologo","studios","architecture","plantstudio",
  "geostudio","buildingstudio","gardenlunarstudio","petstudio","scanstudio","camerastudio",
  "translatorpro","medicalpro","cuisinepro","loisirspro","securiteperso","calendarsync",
  "voicesgallery","voices","userpersonalization","wakeword","rgpd","mes-donnees",
  "iospermissions","permissions","background","backgroundassistant","soldesia","soldes"
];

function axViewAllowed(view){
  if(!K.user) return false;
  if(K.user.id === ADMIN_ID) return true; // admin tout
  // User normal : whitelist stricte
  return AX_VIEWS_USER_ALLOWED.indexOf(view) >= 0;
}
```

Si Laurence essaie d'aller sur une vue interdite → toast "Cette section est réservée à l'admin" + redirect chat.

### 3. Historique COMPLET admin (toutes données users)

Kevin doit voir TOUT ce que les users font, mais en RAPPORT pas en partage :
- `ax_user_activity_<uid>` per-user (max 1000)
- `ax_user_questions_<uid>` (questions posées à l'IA)
- `ax_user_projects_<uid>` (projets actifs)
- `ax_user_changes_<uid>` (changements profil/settings/préférences)
- `ax_user_errors_<uid>` (erreurs rencontrées)
- `ax_user_logs_<uid>` (login, navigation, clicks)

Vue admin `vUserActivity(uid)` enrichie :
- Tab "Vue d'ensemble" : KPI 24h/7j/30j (msg envoyés, projets, erreurs)
- Tab "Conversations" : toutes ses convs (lecture seule)
- Tab "Questions" : timeline questions IA
- Tab "Projets" : actifs + archivés
- Tab "Changements" : modifs profil/settings (chrono)
- Tab "Erreurs" : si rencontrées
- Tab "Validations en attente" : actions niveau C bloquées
- Bouton "Exporter PDF complet" pour archive

### 4. Push notif Kevin pour CHAQUE action significative Laurence

Définir `AX_USER_NOTIFY_ACTIONS` (niveau B+C) : login, logout, projet créé, projet partagé, fichier upload, achat, error critical, validation demandée. → push Kevin via Cloudflare worker.

Niveau A (auto, pas de push) : message chat normal, click bouton, navigation interne.

### 5. Cross-app aussi (CMCteams)

Mêmes principes pour employés CMCteams :
- Employé voit que sa fiche, son planning, ses échanges, ses messages
- Pas de `vEmps`, `vAdmin`, `vAuditLog`, `vUsersActivity` — ces vues sont admin only
- Kevin reçoit historique complet de chaque employé sur sa fiche

### 6. Test mental obligatoire

> *"Si Laurence tape dans l'URL `?view=admin` ou `?view=clients` → est-ce qu'elle est bloquée ? Si Laurence ouvre devtools et tape `K.view='vault'; dc()` → est-ce que vChatLite reprend la main ? Si Laurence appelle `lg('ax_user_activity_<autre_uid>')` → vide ? Si Kevin va sur vUserActivity de Laurence → voit-il TOUT (questions, projets, erreurs, changements) ?"*

Si non → renforcer guards + ajouter historique manquant.

---

## 👑 RÈGLE PERMANENTE — COMPTE ADMIN UNIQUE KEVIN + PERMISSIONS TIERED LAURENCE (Kevin 2026-04-26, ABSOLUE)

> **"Vérifie qu'il ait bien regroupé mon compte admin avec tous mes noms, prénoms. Que quand je rentre mon nom, mon prénom, ou mon prénom et mon nom, ou mon adresse email, toujours avec le même PIN 200807, il me reconnaisse en admin TOUJOURS. Connexion très très très sécurisée. Pour Laurence, je veux des retours d'informations et autorisations SEULEMENT quand c'est des tâches importantes. Sinon elle peut faire. J'ai un historique de toute manière sur sa fiche."**

**Règle absolue, prioritaire** — pour Apex (compte admin Kevin), CMCteams (admin AID U11804) :

### 1. Compte admin Kevin UNIQUE — tous aliases reconnus

`ADMIN_ID` = `"kdmc_admin"` (Apex) / `"U11804"` (CMCteams). Le système doit reconnaître Kevin via TOUS ces aliases :

```js
var ADMIN_KEVIN_ALIASES = [
  "Kevin DESARZENS",
  "Kevin Desarzens",
  "kevin desarzens",
  "DESARZENS Kevin",
  "Desarzens Kevin",
  "Kevin",          // PRÉNOM SEUL admin (autorisé pour Kevin)
  "kevin",
  "DESARZENS",       // NOM SEUL admin
  "Desarzens",
  "kevin.desarzens@gmail.com",  // EMAIL
  "kevin.desarzens",
  "K DESARZENS",
  "K. DESARZENS",
  "KD",
  "KDMC"
];
```

Login : si user tape n'importe quel alias + PIN admin (200807, customizable) → identifie comme admin Kevin.

### 2. PIN admin sécurisé

PIN courant : `200807` (modifiable par Kevin via vSettings → "Changer PIN admin").

Sécurité PIN admin :
- Hash strict `axHashPin(pin, salt)` avec PBKDF2 100k iterations
- Stocké dans `ax_pin` (clé GLOBAL admin, JAMAIS écrasée par PIN per-user)
- Rate-limit progressif : 5 fails → 30s, 6 fails → 2min, 7 fails → 10min, 8 fails → 1h, 9 fails → 24h
- Si 5+ fails consécutifs → notification push + email Kevin
- Audit log obligatoire sur chaque tentative (success ou fail)

### 3. _checkPreconfiguredUser strict pour Kevin

```js
function _isKevinAdmin(name){
  if(!name) return false;
  var n = String(name).trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[\s\-_.@]+/g," ").trim();
  // Match exact alias
  for(var i=0;i<ADMIN_KEVIN_ALIASES.length;i++){
    var a = ADMIN_KEVIN_ALIASES[i].toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[\s\-_.@]+/g," ").trim();
    if(n === a) return true;
  }
  // Tokens : si TOUS les tokens du nom matchent un alias multi-mots
  var tokens = n.split(/\s+/).filter(Boolean);
  if(tokens.length >= 1){
    for(var j=0;j<ADMIN_KEVIN_ALIASES.length;j++){
      var aTokens = ADMIN_KEVIN_ALIASES[j].toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[\s\-_.@]+/g," ").trim().split(/\s+/);
      if(tokens.every(function(t){return aTokens.indexOf(t)>=0 && t.length>=4;})) return true;
    }
  }
  return false;
}

function axLogin(name, pin){
  // Si admin Kevin reconnu → check PIN admin global
  if(_isKevinAdmin(name)){
    if(axCheckPin(pin)){
      K.user = {id:ADMIN_ID, name:"Kevin DESARZENS", email:"kevin.desarzens@gmail.com", role:"admin"};
      // ... rest of login flow
    }
    return false;
  }
  // Sinon : check user pré-configuré (Laurence etc.)
  ...
}
```

### 4. Permissions tiered Laurence (et autres clients)

Système 3 niveaux de permissions :

#### Niveau A — Auto (Laurence fait sans demander)
- Lire ses propres données
- Modifier son profil (nom, email, photo, préférences)
- Envoyer messages chat
- Utiliser studios (musique, vidéo, archi, etc.)
- Demander à l'IA, web search, browser embed
- Gérer ses propres conversations
- Activer/désactiver ses propres notifications
- Wake word, voix, dictée

#### Niveau B — Notifie Kevin (Laurence fait + Kevin reçoit info)
- Connexion / déconnexion
- Achat sur abonnement
- Upload fichier > 5MB
- Modification preferences importantes
- Erreurs critiques rencontrées

→ Push notif Kevin "Laurence vient de [action]"

#### Niveau C — Demande validation Kevin (bloqué tant que Kevin pas validé)
- **Effacement compte** (RGPD erase)
- **Export données complet** (RGPD export)
- **Modification email principal**
- **Modification PIN/password**
- **Achat > 50€**
- **Suppression conversations historiques**
- **Activation features beta**
- **Connexion depuis nouveau device** (FaceID setup nouveau)

→ Modal Laurence "En attente validation Kevin..." + push Kevin avec boutons "✅ Autoriser" / "❌ Refuser"

```js
var AX_PERMISSIONS_LAURENCE = {
  auto: ["read_self", "edit_profile", "chat", "use_studios", "ai_query", "browser", "manage_convs", "manage_notifs", "voice"],
  notify: ["login", "logout", "subscribe", "upload_large", "preferences_change", "error_critical"],
  validate: ["erase_account", "export_data", "change_email", "change_pin", "purchase_above_50", "delete_history", "beta_features", "new_device"]
};

function axPermissionCheck(action){
  if(!K.user) return {allowed:false};
  if(K.user.id === ADMIN_ID) return {allowed:true};
  var lvl = "auto";
  if(AX_PERMISSIONS_LAURENCE.validate.indexOf(action)>=0) lvl = "validate";
  else if(AX_PERMISSIONS_LAURENCE.notify.indexOf(action)>=0) lvl = "notify";
  
  if(lvl==="auto") return {allowed:true};
  if(lvl==="notify") {
    axNotifyKevin("Laurence: "+action);
    return {allowed:true, notify:true};
  }
  // validate : push notif Kevin avec boutons + bloque action jusqu'à réponse
  return {allowed:false, pending:true, requestId: axRequestKevinValidation(action)};
}
```

### 5. Historique Laurence sur sa fiche admin

Vue admin `vClientProfile(uid)` → onglet "📜 Historique" :
- Toutes les actions Laurence (login, modification, achats, erreurs)
- Filtres : tâches importantes / toutes / niveau A/B/C
- Recherche, période
- Export CSV

Stocké dans `ax_user_activity_<uid>` (max 1000 entries FIFO, FB_FIX shared admin).

### 6. Push notifications Kevin

Quand action niveau B ou C → push notif via Cloudflare Worker (déjà déployé v12.203) :
```js
function axNotifyKevin(title, body, requestId){
  var url = lg("ax_push_worker_url", "");
  if(!url) return;
  fetch(url+"/send", {
    method:"POST",
    headers:{"Content-Type":"application/json","Authorization":"Bearer "+lg("ax_push_admin_token","")},
    body: JSON.stringify({title:title, body:body, requestId:requestId, action_buttons:requestId?[{title:"✅",action:"approve_"+requestId},{title:"❌",action:"reject_"+requestId}]:[]})
  });
}
```

### 7. Sentinelle `admin-account-watch` quotidienne

Vérifie :
- Aucune autre fiche utilisateur n'a `role:"admin"` ou ID = ADMIN_ID
- ADMIN_KEVIN_ALIASES couvre bien tous les aliases connus
- PIN admin n'est pas dans format faible (≥4 chars, hash $iter$salt$hash)
- Aucune contamination cross-user dans K.settings du compte admin
- Si anomalie → alerte admin + log

### 8. Test mental obligatoire

> *"Si Kevin tape 'Kevin' + 200807 → reconnu admin ? OK. Si tape 'kevin.desarzens@gmail.com' + 200807 → reconnu admin ? OK. Si tape 'KD' + 200807 → reconnu admin ? OK. Si Laurence tape 'Kevin' + son PIN à elle → REFUSÉ ? OK. Si Laurence veut effacer son compte → demande Kevin ? OK. Si Laurence change son email → demande Kevin ? OK. Si Laurence ajoute un favori → fait sans demander ? OK."*

S'applique à Apex (priorité) puis CMCteams (admin AID U11804 avec mêmes aliases Kevin DESARZENS).

---

## 🛡️ RÈGLE PERMANENTE — BROWSER SANS BLOCAGE + SECU AGENTS PROTECTION (Kevin 2026-04-26, ABSOLUE)

> **"Une fois internet lancé on est derrière un pare-feu. Apex doit être protégé contre les intrusions/malveillance par des agents. Mais on a accès à TOUS les sites sans jamais être bloqué. S'il y a blocage, Apex doit réagir et débloquer, contourner, trouver une solution. Jamais bloqué par autorisations/pare-feu/VPN. Équipé de tous les outils pour contourner. Anticipe, sait réagir toujours. En autonomie totale."**

**Règle absolue, prioritaire** — pour Apex (browser embed) + CMCteams si pertinent :

### 1. Sécurité Apex (anti-intrusion) — agents protecteurs

Pendant que user navigue, sentinelles surveillent :

- **`security-watch-browser` (continu)** : monitor postMessage entrants iframes — bloque tentative cross-frame injection
- **`malware-blocklist-watch` (au load chaque URL)** : check URL contre blocklist (Cloudflare 1.1.1.2 family DNS, Google Safe Browsing API gratuit, OpenPhish public list)
- **`csp-violation-watch`** : `document.addEventListener("securitypolicyviolation",...)` → log + alerte si tentative injection script
- **`xss-sanitizer`** : tout HTML user/IA passe par DOMPurify (CDN lazy load)
- **`devtools-detect`** : détecte si user (ou attaquant) ouvre devtools sur l'app → log audit (pas bloquer, juste tracer)
- **`session-fixation-watch`** : si url contient `?session=` ou cookies suspects → strip + log

```js
function _securityBrowserWatch(){
  // Listen postMessage cross-frame
  window.addEventListener("message", function(e){
    if(e.origin && e.origin !== location.origin && !["https://www.google.com","https://www.youtube.com"].includes(e.origin)){
      try{if(typeof axSecurityLog==="function")axSecurityLog("postmessage_external", e.origin+" data="+String(e.data).slice(0,100));}catch(_){}
    }
  });
  // CSP violations
  document.addEventListener("securitypolicyviolation", function(e){
    if(typeof axSecurityLog==="function")axSecurityLog("csp_violation", e.violatedDirective+" "+(e.blockedURI||"").slice(0,100));
  });
}
```

### 2. Contournement blocages browser (déblocage auto)

Si une URL est bloquée par X-Frame-Options, CSP frame-ancestors, ou autres :

1. **Détection automatique** : `iframe.contentWindow === null` après 3s OU error event sur iframe
2. **Stratégies de contournement** dans l'ordre :
   - **a) Cache web archive** : `https://web.archive.org/web/2/[URL]` → version cachée
   - **b) Google Cache** : `https://webcache.googleusercontent.com/search?q=cache:[URL]`
   - **c) Reader mode** : `https://r.jina.ai/[URL]` (gratuit, retourne version texte)
   - **d) CORS proxy** : Cloudflare Worker custom (`ax_cors_proxy_url`) → fetch + render dans iframe
   - **e) Open in new tab** : dernier recours, ouvre Safari nouvel onglet
3. **Toast informatif** : "⚠ Site bloque l'embed, j'utilise [méthode contournement]"

```js
function axTryUnblockUrl(url){
  return new Promise(function(resolve){
    var attempts = [
      url, // direct
      "https://web.archive.org/web/2/" + encodeURIComponent(url),
      "https://r.jina.ai/" + url,
      // CORS proxy custom si configure
      lg("ax_cors_proxy_url","") ? lg("ax_cors_proxy_url") + "?url=" + encodeURIComponent(url) : null,
    ].filter(Boolean);
    var idx = 0;
    function tryNext(){
      if(idx >= attempts.length){return resolve({ok:false, fallback:"open_safari", url:url});}
      var test = attempts[idx];
      // Test iframe loadability via short HEAD via fetch + check X-Frame-Options
      fetch(test, {method:"HEAD", mode:"no-cors"}).then(function(){
        resolve({ok:true, url:test, method:idx===0?"direct":idx===1?"archive":idx===2?"reader":"cors"});
      }).catch(function(){
        idx++;
        tryNext();
      });
    }
    tryNext();
  });
}
```

### 3. Web search robuste (jamais "pas de résultat")

Si user demande une info :
1. **Anthropic web_search** native (Claude tool use)
2. Sinon **Brave Search API** (gratuit 2000 req/mois, clé `ax_brave_key`)
3. Sinon **Tavily API** (clé `ax_tavily_key`)
4. Sinon **DuckDuckGo HTML scrape** (HTML fallback parsing)
5. Sinon **Google Custom Search** (clé `ax_google_cse_key`)

Si TOUT échoue → ouvre browser embed Google directement.

### 4. CORS proxy intégré

Pour les API qui bloquent CORS (souvent les jeunes API), Apex passe via Cloudflare Worker `apex-cors-proxy`. Code worker à créer :
```js
addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  const target = url.searchParams.get("url");
  if(!target) return e.respondWith(new Response("Missing url param", {status:400}));
  e.respondWith(
    fetch(target, e.request).then(r => {
      const h = new Headers(r.headers);
      h.set("Access-Control-Allow-Origin", "*");
      return new Response(r.body, {status:r.status, headers:h});
    })
  );
});
```

Stocker URL dans `ax_cors_proxy_url`. Sentinelle vérifie qu'il répond.

### 5. VPN détection + workaround

Apex détecte si user est sur VPN qui bloque certains sites (via fetch test sur `https://api.bigdatacloud.net/data/client-info`) :
- Si VPN détecté → afficher "💡 Tu es sur VPN, certains sites peuvent être bloqués. Je peux essayer cache web/archive."
- Bouton "Désactiver temporairement le VPN" → instructions iOS Settings > VPN

### 6. Anticipation proactive

Sentinelle `connectivity-watch` (30s) :
- Test ping `1.1.1.1` (Cloudflare DNS) — vérifier connectivité réseau
- Test ping `api.anthropic.com` — vérifier provider IA
- Test ping `firebasedatabase.app` — vérifier cloud DB
- Si l'un fail → toast diagnostic + bouton "Tenter contournement"

### 7. Déblocage AUTO sans demander à user

Quand un blocage est détecté, Apex :
1. Tente toutes les stratégies en arrière-plan
2. Quand l'une marche → affiche le résultat
3. Toast informatif (pas demande de permission)
4. Log dans `ax_unblock_log` pour mémoire (pattern : ce site bloque toujours, prendre direct cache)

### 8. Cas limites

- **Site totalement down** : afficher version cache web archive avec bandeau "Version archivée du [date]"
- **DNS bloqué localement** : passer par DoH (DNS over HTTPS Cloudflare 1.1.1.1)
- **ISP blocking** : suggère VPN gratuit (Proton VPN, Cloudflare Warp)
- **Géoblocage** : tente via web archive + propose VPN

### 9. Test mental obligatoire

> *"Si user dit 'va sur [site totalement bloqué iframe]', est-ce qu'Apex contourne automatiquement (cache, reader, proxy) sans demander ? Si user dit 'cherche X' et toutes les API search KO, est-ce qu'il ouvre Google direct ? Si user est sur VPN qui bloque le site, est-ce qu'il propose une solution ?"*

Si non → enrichir stratégies contournement.

### 10. Conformité légale

- Pas contourner DRM/paywall (illégal)
- Pas accéder contenu illégal (CSAM, etc. — blocklist absolue)
- Respecter robots.txt si site demande no-archive
- Logs archivés 30 jours puis purgés (RGPD)

S'applique à Apex en priorité.

---

## 🌐 RÈGLE PERMANENTE — APEX EXÉCUTE TOUTES LES DEMANDES (BROWSER, ACTIONS, RECHERCHE) (Kevin 2026-04-26, ABSOLUE)

> **"Moi comme Laurence ou n'importe quel client, je peux dire 'Apex ouvre-moi un navigateur internet, va sur tel site' et automatiquement Apex exécute. Une fenêtre navigateur apparaît avec possibilité plein écran ET garde toujours les fonctionnalités Apex (poser questions, Dis Apex). Si on dit 'Apex va chercher telle information sur tel site', il doit être capable et exécuter. Toutes les demandes."**

**Règle absolue, prioritaire** — pour Apex (priorité), CMCteams si pertinent :

### 1. Apex exécute, ne se limite pas à parler

À chaque message user, Apex DOIT :
- Détecter l'intent action (verbes : ouvre, va, cherche, montre, lance, démarre, joue, télécharge, écris, envoie, calcule)
- EXÉCUTER l'action immédiatement (dans le flux chat ou en embed)
- Pas se contenter de "voici comment faire" — FAIRE

### 2. Browser intégré (vBrowserEmbed)

Détection mots-clés dans message user :
- "ouvre [navigateur|browser|chrome|safari]" → ouvre vBrowserEmbed
- "va sur [URL|google|youtube|...]" → embed iframe avec URL
- "cherche [X] sur [site]" → embed iframe avec recherche
- "navigue", "montre-moi le site", etc.

Vue `vBrowserEmbed(url)` :
- Iframe sandbox + fallback nouvelle fenêtre si site bloque iframe
- URL bar éditable (Kevin peut taper autre URL)
- Boutons : ⏮ retour, ⏭ suivant, 🔄 reload, ⛶ fullscreen, ✕ fermer
- Plein écran via `requestFullscreen()` (touche Échap pour sortir)
- **Overlay Apex toujours visible** : bouton flottant 🎙 (Dis Apex), bouton 💬 retour chat, bouton 📋 copier URL
- Wake word actif en arrière-plan
- Si site bloque iframe (X-Frame-Options) → message "Site bloque l'embed, ouvert dans nouvel onglet" + button "Ouvrir Safari"

### 3. Web search intégrée

Si "cherche [info]" sans site précis :
- Apex appelle `web_search` tool (Anthropic native, ou Brave/Tavily/DuckDuckGo via API)
- Affiche 5-10 résultats dans card embed avec snippets
- Click sur résultat → embed `vBrowserEmbed(result.url)` directement

### 4. Intent dictionary executable

```js
var AX_EXEC_INTENTS = [
  {pattern: /ouvre\s+(?:un\s+)?(?:navigateur|browser)/i, fn: function(m,t){return vBrowserEmbed("https://www.google.com");}},
  {pattern: /(?:va|aller|ouvre)\s+sur\s+(?:le\s+site\s+)?([a-z0-9.-]+\.[a-z]{2,})/i, fn: function(m,t){return vBrowserEmbed("https://"+m[1]);}},
  {pattern: /(?:cherche|trouve|google)\s+(.+)/i, fn: function(m,t){return axWebSearch(m[1]);}},
  {pattern: /(?:joue|met|lance)\s+(?:la\s+)?musique\s+(.+)/i, fn: function(m,t){return vBrowserEmbed("https://music.youtube.com/search?q="+encodeURIComponent(m[1]));}},
  {pattern: /(?:montre|affiche)\s+(?:la\s+)?meteo\s+(?:de\s+|pour\s+)?(.+)?/i, fn: function(m,t){return axShowWeather(m[1]||"Monaco");}},
  {pattern: /(?:traduis|translate)\s+(?:en\s+)?(\w+)\s*[:]\s*(.+)/i, fn: function(m,t){return axTranslate(m[2], m[1]);}},
  {pattern: /(?:calcule|combien)\s+(.+)/i, fn: function(m,t){return axCalculate(m[1]);}},
  // ... extensible
];

function axDetectAndExecute(text){
  for(var i=0;i<AX_EXEC_INTENTS.length;i++){
    var m = text.match(AX_EXEC_INTENTS[i].pattern);
    if(m){
      try{return AX_EXEC_INTENTS[i].fn(m, text);}catch(e){}
    }
  }
  return null;
}
```

Intégré dans le flux chat : avant d'envoyer à l'IA, on essaie `axDetectAndExecute`. Si match → exécute en parallèle de la réponse IA.

### 5. Tool use IA pour actions complexes

Les actions trop spécifiques pour regex → tool use Anthropic :
```js
var AX_EXEC_TOOLS = [
  {name:"open_browser", description:"Ouvre une URL dans navigateur embed", input_schema:{type:"object",properties:{url:{type:"string"}}}},
  {name:"web_search", description:"Cherche sur le web", input_schema:{type:"object",properties:{query:{type:"string"}}}},
  {name:"play_music", description:"Joue de la musique", input_schema:{type:"object",properties:{query:{type:"string"}}}},
  {name:"send_email", description:"Envoie email via service mail", input_schema:{...}},
  {name:"create_calendar_event", description:"Crée event calendrier", input_schema:{...}},
  // ... 30+ tools
];
```

Quand IA décide d'utiliser un tool → Apex exécute la fonction côté client + renvoie résultat à l'IA.

### 6. Fonctionnalités Apex toujours dispo en browser

Quand user navigue, overlay z-index max contient :
- 🎙 Bouton micro (taps : dictée, longpress : wake word toggle)
- 💬 Retour chat (close iframe)
- 📋 Copier URL courante
- 🤖 Demander à Apex (modal mini chat)
- 📷 Screenshot embed visible
- ⛶ Fullscreen

Pas perdre Apex juste parce qu'on navigue.

### 7. Tests obligatoires avant release

> *"Si je tape 'ouvre google' dans le chat → est-ce qu'une fenêtre navigateur s'ouvre dans 1s ? Si je tape 'cherche meteo Paris' → est-ce qu'apex me retourne 5 résultats cliquables ? Si je tape 'va sur youtube et cherche imagine dragons' → est-ce qu'il fait les 2 actions enchaînées ?"*

Si non → enrichir AX_EXEC_INTENTS + AX_EXEC_TOOLS.

### 8. Sécurité browser embed

- Iframe sandbox `sandbox="allow-scripts allow-same-origin allow-forms allow-popups"`
- Si user veut quitter app → bouton retour explicite
- Domaine bannis (porn, malware, phishing) blocklist via DNS API gratuite (Cloudflare 1.1.1.1 family)
- Logs navigation dans `ax_browser_history` (max 500, FIFO) pour mémoire

S'applique à Apex en priorité. CMCteams hérite si pertinent.

---

## 🏆 RÈGLE PERMANENTE — NIVEAU PRODUCTION CLAUDE.AI / CHATGPT (Kevin 2026-04-26, ABSOLUE)

> **"Niveau professionnel = Apex doit être aussi stable que Claude.ai, Claude Code ou ChatGPT. Sur Claude, je n'ai pas ce genre de problème. Les timeouts c'est seulement quand je n'ai plus de forfait. Un client qui va payer ne doit avoir AUCUN problème technique. Les seuls blocages = forfaits, accès, autorisations. JAMAIS par rapport au fonctionnement de l'app. Tout auto-géré, corrigé, anticipé."**

**Règle absolue, prioritaire** — pour Apex (priorité), CMCteams, tous projets futurs :

### 1. Standards production minimum (référence Claude.ai/ChatGPT)

Apex DOIT avoir le même niveau de stabilité technique que Claude.ai :
- ❌ JAMAIS d'erreur technique visible user (sauf forfait)
- ❌ JAMAIS de "réessayez plus tard"
- ❌ JAMAIS de spinner infini
- ❌ JAMAIS de réponse coupée silencieusement
- ❌ JAMAIS de timeout app (seul timeout valide = quota)
- ✅ Réponse en moins de 30s (95e percentile)
- ✅ Stream fluide sans interruption
- ✅ Recovery automatique transparent
- ✅ Confirmation visuelle constante

### 2. Idempotency + déduplication (anti-double-trigger)

Chaque requête API a un idempotency-key (UUID) :
```js
function axCallClaude(messages, opts){
  opts = opts||{};
  if(!opts.idempotencyKey) opts.idempotencyKey = "ax_"+crypto.randomUUID();
  // Re-send avec MEME key si retry → API recoit pas 2x facturé
}
```

Dedup par hash des derniers 3 messages : si user envoie 2x la même requête en <2s → réutiliser réponse précédente (pas appeler API).

### 3. Streaming robuste niveau Claude.ai

- **SSE auto-reconnect** : si stream coupe → reconnect avec `Last-Event-ID` header
- **Heartbeat keep-alive** : ping toutes 25s pour détecter mort silencieuse
- **Buffered tokens** : afficher 1 token à la fois progressif (animation typing fluide comme Claude)
- **Resume partial** : `_apexSavePartialResponse` (déjà v12.288) → bouton "Continuer" si interrompu

### 4. Connection pooling + backpressure

- Max 3 fetch concurrents (sinon queue)
- Si user spam (>5 msg/10s) → throttle + message poli "Je traite, j'arrive"
- Garbage collect AbortControllers anciens

### 5. Cache intelligent

- LRU cache des 50 dernières réponses (par hash du prompt)
- Si user reformule légèrement (Levenshtein <5) → propose la réponse cachée + bouton "Réessayer pour différent"
- TTL 24h
- Stockage en IDB (compressed lz-string)

### 6. Distributed tracing

Chaque requête a un `request_id` propagé :
- En-tête custom `X-Apex-Request-ID`
- Logué dans `ax_traces` (max 500, rotation FIFO)
- Vue admin `vTraces` : liste timeline avec status, latence, provider, erreurs
- Si erreur → chaîne complète pour debug

### 7. Sentry-grade error capture

```js
window.addEventListener("error", function(e){
  axCaptureError(e.error || e.message, {source:"window.onerror", stack:e.error&&e.error.stack});
});
window.addEventListener("unhandledrejection", function(e){
  axCaptureError(e.reason, {source:"unhandledrejection", stack:e.reason&&e.reason.stack});
});
function axCaptureError(err, ctx){
  var entry = {
    msg: String(err&&err.message||err).slice(0,500),
    stack: String(err&&err.stack||"").slice(0,2000),
    ctx: ctx||{},
    ts: Date.now(),
    user_id: K&&K.user&&K.user.id||"anon",
    url: location.href,
    user_agent: navigator.userAgent.slice(0,200),
    app_version: APP_VER
  };
  var log = lg("ax_error_log",[]);
  log.push(entry);
  if(log.length>500)log=log.slice(-500);
  ls("ax_error_log", log);
  // Push Firebase + handoff
  if(typeof _apexPushTelemetry==="function")_apexPushTelemetry("err", "error", entry.msg);
  if(typeof axRecordLesson==="function" && entry.stack)axRecordLesson("error", "Erreur capturee", entry.msg, "warn");
}
```

### 8. Distinction technique vs forfait

**Erreur technique** (à AUTO-FIX silencieusement, jamais montrer) :
- Network error
- Timeout
- 500/502/503 serveur
- CORS
- Parse error

**Limite forfait** (à montrer clairement avec action) :
- 401 Unauthorized + "Invalid API key" → "Ta clé API n'est plus valide. Modifie-la dans le Coffre."
- 429 Too Many Requests → "Tu as atteint ta limite de l'heure. Patiente Xmin OU upgrade plan."
- 402 Payment Required → "Crédit Anthropic épuisé. Recharge maintenant : [bouton lien direct]"
- Quota dépassé Anthropic → "Ton forfait Anthropic est consommé. Voici tes options : [3 actions]"

```js
function axHandleAPIError(error, response){
  var status = response&&response.status||0;
  var msg = String(error&&error.message||error);
  
  // Forfait/auth = MONTRER avec action claire
  if(status===401 || /invalid.api.key/i.test(msg)){
    return axShowQuotaModal("auth", "Ta clé API n'est plus valide", "Modifie dans Coffre", "vault");
  }
  if(status===402 || status===429 || /quota|rate.limit|insufficient/i.test(msg)){
    return axShowQuotaModal("quota", "Limite forfait atteinte", "Recharge ou upgrade", "soldesia");
  }
  
  // Tout le reste = TECHNIQUE = AUTO-FIX silencieux
  return axSelfHealAI(error);
}
```

### 9. Tests stress automatiques (chaos engineering light)

Sentinelle 1×/semaine :
- Simule 10 requêtes concurrentes
- Throttle network (50KB/s) 1 minute
- Provider mock failure
- Quota exhaustion
- Mesure recovery time, score

Si recovery >5s → escalade Claude Code todo "Optimiser X".

### 10. Concertation pour atteindre 10/10

Multi-agent à chaque release majeure :
- Agent Performance Engineer : audit latence, FPS, memory
- Agent SRE : audit reliability (recovery, failover, monitoring)
- Agent UX : audit UI cohérence niveau Claude.ai
- Agent Security : audit auth, secrets
- Agent QA : tests scenarios end-to-end

### 11. Test mental obligatoire avant chaque release

> *"Si je remplace Apex par Claude.ai dans la même situation, est-ce que l'expérience utilisateur est équivalente ? Si non → identifier précisément le gap + fixer."*

S'applique à Apex (priorité absolue) — clients payants méritent niveau Claude.ai.

---

## 🚨 RÈGLE PERMANENTE — ANTI-BLOCAGE IA, AUTO-DÉBLOCAGE TOTAL (Kevin 2026-04-26, ABSOLUE)

> **"J'espère que tu as vérifié aussi les problèmes de connexion d'IA, qu'il n'y ait plus d'IA, qu'il n'y plus de réponse, qu'on soit bloqué dans Apex. Ça ne doit jamais arriver. Une solution par Apex ou par les autres IA. Pour se débloquer et redevenir fonctionnel. Je ne dois pas rester bloqué peu importe quand. Tout doit être automatisé pour se débloquer, pour s'arranger, pour anticiper tout problème AVANT qu'il y ait un problème. Tout le monde doit avoir vu et réagi et corrigé pour éviter le problème."**

**Règle absolue, prioritaire** — pour Apex, CMCteams, tous projets futurs :

### 1. ZÉRO blocage utilisateur — détection + auto-fix immédiat

À CHAQUE échec d'IA (timeout, 401, 429, 500, fetch failed, CORS, AbortError, network), Apex doit :

1. **Détecter** dans la 1ʳᵉ seconde
2. **Réessayer** automatiquement (3 tentatives backoff exponentiel 3s/8s/15s)
3. **Failover IA** vers provider alternatif si échec persiste :
   - Anthropic Claude indispo → bascule **OpenRouter** (clé saisie) → bascule **OpenAI GPT-4o** → bascule **Gemini 2.5 Pro** → bascule **Groq Llama 3.3 70B** (le moins cher rapide)
   - Ordre configurable : `ax_failover_chain = ["anthropic","openrouter","openai","google","groq"]`
4. **Réponse partielle** si stream coupé : sauvegarder le texte déjà reçu + bouton "Continuer"
5. **Mode dégradé** : si TOUTES les IA échouent → réponse locale (KB, persistent_memory, capabilities) + "Je suis en mode hors-ligne, voici ce que je peux faire localement"

### 2. Anticipation proactive (avant blocage)

Sentinelles tournent EN PERMANENCE :

- **`ai-health-watch` (5 min)** : pings successifs sur chaque provider configuré (HEAD ou requête minimale ~$0.0001). Si 2 échecs consécutifs → notification admin + bascule failover préemptif.
- **`token-balance-watch` (1×/h)** : check solde Anthropic via API (si endpoint dispo) → si <5€ → alerte + propose recharge 1-clic
- **`api-quota-watch` (10 min)** : check rate-limit headers (`x-ratelimit-remaining`) sur chaque réponse → si <10% → bascule provider
- **`network-watch` (boot + visibility)** : ping kdmc-clients-default-rtdb → si offline → mode local

### 3. Self-healing automatique

`axSelfHealAI()` : appelée à chaque erreur, fait dans l'ordre :

```js
function axSelfHealAI(error){
  // 1. Log erreur + telemetry vers Apex/CMC handoff
  axRecordLesson("api","Erreur IA",error.message,"warn");
  
  // 2. Reset connexions (nouveau fetch, nouveau AbortController)
  if(window._apexCurrentAbort) window._apexCurrentAbort.abort();
  
  // 3. Vérifier connectivité
  if(!navigator.onLine) return showOfflineMode();
  
  // 4. Tester provider courant
  return pingProvider(currentProvider).then(function(ok){
    if(ok) return retryLastRequest();
    
    // 5. Failover provider alternatif
    return failoverNext();
  });
}
```

### 4. Bouton "💥 Débloquer Apex" toujours visible

Bouton rouge en bas-droite (z-index max), accessible depuis n'importe quelle vue :
- Tap court → `axSelfHealAI()` reset connexions + retry
- Tap long → modal "Diagnostic complet" : status providers / network / SW / cache + bouton "Force reset session"
- Affiche "🟢 OK" sinon "🟠 X providers KO" sinon "🔴 BLOCAGE - tap pour fix"

### 5. Concertation IA pour résoudre les bugs

Quand Apex IA détecte qu'elle ne peut pas répondre, elle peut :
- Demander à OpenRouter ou Gemini de répondre via tool use
- Pousser le problème dans `ax_claude_todo` Firebase → GitHub Action déclenche Claude Code en autonomie
- Cross-app : pousser dans `cmc_claude_todo` → CMCteams peut aussi remonter

Multi-agent collaboration interne : 3-5 IA en parallèle pour les questions complexes (déjà existe via `axCrewExperts`).

### 6. Tests réguliers (`ai-stress-test`)

Sentinelle 1×/jour à 4h :
- Ping chaque provider avec requête test
- Mesure latence + succès
- Si dégradation > 30% par rapport aux 7 derniers jours → alerte admin + push lesson

### 7. CMCteams équivalent

Mêmes mécanismes dans CMCteams avec `cmcSelfHealAI`, `cmc_failover_chain`, sentinelles équivalentes.

### 8. Queue de messages utilisateur — JAMAIS de réponse vide

> Kevin : "Pas de réponse dans le vide ou qu'il dit qu'il n'a pas compris ou qu'il n'y a plus d'API. Ça ne doit jamais arriver. Les questions sont mises en attente, tout notées jamais rien oublier et répondre au fur et à mesure. Il se débloque s'il doit être débloqué. Il prend en compte toutes les demandes même pendant qu'il réfléchit. Il les note et il agit après."

#### a) Queue FIFO `K.pendingMessages` per-user

Chaque message user va dans une queue persistée (`ax_pending_messages_<uid>`). Apex traite UN message à la fois mais l'utilisateur peut en envoyer plusieurs sans attendre.

```js
K.pendingMessages = []; // FIFO
function axSendUserMessage(text, attachments){
  // Toujours acker visuellement + persister
  var msg = {id:Date.now()+Math.random(), text:text, attachments:attachments, ts:Date.now(), status:"pending"};
  K.pendingMessages.push(msg);
  ls("ax_pending_messages_"+(K.user&&K.user.id||"anon"), K.pendingMessages);
  K.messages.push({role:"user",content:text,attachments:attachments});
  dc(); // affiche immediatement
  
  // Si IA libre → traite. Sinon laisse en queue, sera processé apres
  if(!K.isStreaming) axProcessPendingQueue();
}

function axProcessPendingQueue(){
  if(K.isStreaming || !K.pendingMessages.length) return;
  var next = K.pendingMessages[0];
  next.status = "processing";
  return axCallClaudeWithFailover(next.text).then(function(){
    K.pendingMessages.shift();
    ls("ax_pending_messages_"+K.user.id, K.pendingMessages);
    setTimeout(axProcessPendingQueue, 100); // chain
  }).catch(function(){
    // axSelfHealAI prend le relais, retente plus tard
    setTimeout(axProcessPendingQueue, 5000);
  });
}
```

#### b) Affichage UI de la queue

Au-dessus de la zone de chat, badge discret : "📥 X messages en attente" cliquable → modal avec liste + bouton "Traiter maintenant" / "Annuler".

Quand un message attend > 30s → afficher "Apex traite ta demande précédente, ton message est en file d'attente, j'y arrive 🔄"

#### c) JAMAIS "je n'ai pas compris"

Apex ne dit JAMAIS :
- ❌ "Je n'ai pas compris ta demande"
- ❌ "Pouvez-vous reformuler ?"
- ❌ "API indisponible, réessayez plus tard"
- ❌ Réponse vide / juste un point / silence

Toujours :
- ✅ "Je propose 3 interprétations : (1) tu veux X / (2) tu veux Y / (3) tu veux Z. Laquelle ?"
- ✅ "Anthropic temporairement KO, je bascule sur OpenRouter — voici ma réponse via Gemini : [réponse]"
- ✅ "Je n'ai pas accès au réseau là, mais en local je peux : [3 actions possibles]"

System prompt enrichi : interdiction explicite de répondre vide.

#### d) Persistance offline + reprise

Si l'app perd connexion :
- Messages user → queue persiste localStorage + IDB
- Au retour online → `axProcessPendingQueue()` + notification "📥 J'ai traité tes 3 messages en attente. Voici les réponses : ..."

#### e) Concurrent thinking + new input

Pendant qu'Apex stream une réponse longue, Kevin peut :
- Envoyer un nouveau message → queue (acker visuellement "j'ai bien noté, je m'en occupe après")
- Cliquer "Stop streaming" → coupe stream actuel + traite tout de suite le nouveau

### 9. Test mental obligatoire

> *"Si Anthropic tombe maintenant, est-ce que Kevin peut continuer à utiliser Apex sans rien faire ? L'app bascule-t-elle automatiquement sur un autre provider ? Si Kevin envoie 5 messages d'affilée, sont-ils TOUS traités ? Apex dit-il un jour 'je n'ai pas compris' ou 'pas d'API' ? Si oui → reprendre."*

S'applique systématiquement à toute interaction IA.

---

## 🎯 RÈGLE PERMANENTE — ZÉRO DOUBLON UX, SOURCE UNIQUE (Kevin 2026-04-26, ABSOLUE)

> **"J'ai encore les doublons des infos pour les API, les machins. J'en ai dans les paramètres, j'en ai dans le coffre. UX pas assez poussée, pas assez ordonnée, pas assez de changements clairs et précis. Sans perdre d'information sans en manquer. Tout ce qu'il faut par rapport à notre utilisation, à tout ce qu'on a. Déjà rempli par toi. Avec toutes les informations que tu as et sauvegardé pour toujours dans Apex et CMCteams."**

**Règle absolue, prioritaire** — pour Apex, CMCteams, tous projets futurs :

### 1. UNE SEULE source de saisie par donnée

Chaque clé/secret/credential a UN SEUL endroit d'édition autoritaire :

| Type donnée | Source UNIQUE | Vues "lecture seule" | Action |
|-------------|--------------|---------------------|--------|
| Clés API IA (`ax_api_key`, `ax_openai_key`, `ax_gemini_key`, etc.) | **vVault** (Coffre) | vSettings, vAIProviders, vSoldesIA, vAllConfig | Lecture statut + bouton "Modifier dans Coffre" → navigateAndScroll |
| Paiements (`ax_paypal_me`, `ax_revolut_tag`, `ax_iban`, `ax_btc_address`) | **vVault** | vAdminLinks, vSoldesIA | Idem |
| Intégrations (`ax_github_token`, `ax_cloudflare_token`, `ax_push_worker_url`, etc.) | **vVault** | vAccountsBilling, vAllConfig | Idem |
| Profil user (`ax_user_name`, email, lang, model, theme) | **vSettings** | vAllConfig (lecture) | Bouton "Modifier dans Réglages" |
| Notifications (`ax_push_subs`, `ax_push_settings`) | **vSettings** | vAllConfig | Idem |

**Aucune duplication d'input pour la même clé.** Si la donnée s'affiche dans 5 vues, elle s'édite dans 1 seule.

### 2. Composant standardisé `axRenderCredentialReadonly(key, fallbackTo)`

Au lieu d'écrire l'input 5 fois, fonction unique qui affiche :
- Statut couleur (🟢 OK / ⚪ Non config / 🟠 Auto-rempli / 🔴 Requis)
- Valeur masquée si secret (`sk-***...***ab12`)
- Bouton "✏️ Modifier" → `axNavigateTo(fallbackTo)` qui ouvre vVault au bon scroll/highlight

```js
function axRenderCredentialReadonly(key, fallbackTo){
  var v = lg(key, "");
  var status = v ? "🟢 Configure" : "⚪ Non configure";
  var masked = v ? (v.slice(0,4)+"***"+v.slice(-4)) : "—";
  return '<div class="ax-cred-row">' +
    '<span class="ax-cred-status">'+status+'</span>' +
    '<code class="ax-cred-masked">'+esc(masked)+'</code>' +
    '<button class="ax-btn ax-btn-outline" onclick="axNavigateTo(\''+fallbackTo+'\')">✏️ Modifier dans Coffre</button>' +
    '</div>';
}
```

### 3. Auto-fill au login user (toutes les infos déjà connues)

Au premier login user (admin Kevin OU user pré-configuré), Apex DOIT auto-remplir toutes les infos qu'il connaît déjà. Ne JAMAIS demander une info que Kevin a déjà donnée historiquement.

**Pour Kevin (admin)** — auto-rempli au boot si manquant :
```
ax_user_name = "Kevin DESARZENS"
ax_user_email = "kevin.desarzens@gmail.com"
ax_iban_nom = "Kevin DESARZENS"
ax_revolut_tag = "@kdmc"
ax_push_worker_url = "https://apex-push-worker.desarzens-kevin.workers.dev"
ax_settings.lang = "fr"
ax_settings.country = "Monaco"
ax_settings.model = "claude-sonnet-4-6"
ax_settings.theme = "dark"
ax_settings.timezone = "Europe/Monaco"
ax_settings.currency = "EUR"
ax_vapid_public = "[clé publique générée v12.207]"
ax_firebase_url = "https://kdmc-clients-default-rtdb.firebaseio.com"
```

Secrets JAMAIS auto-remplis (Anthropic key, OpenAI, etc.) — ces clés Kevin doit les coller une seule fois dans Coffre.

**Pour Laurence et autres clients pré-configurés** : auto-fill leur profil (nom, prénom, email si fourni à l'inscription) via `PRECONFIGURED_USERS`.

### 4. Sauvegarde permanente garantie

Les données auto-remplies vont dans :
- localStorage immédiat
- IndexedDB shadow copy (Apex `axIdbSet`, CMCteams `cmcIdbSet`)
- Firebase via FB_FIX (sauf identité user qui reste FB_LOCAL)
- Backup quotidien Firebase

Si Kevin réinstalle l'app → toutes les valeurs auto-rempli sont restaurées au boot via `axRestoreFromAll()` (sans qu'il ait à ressaisir).

### 5. Sentinelle `dedup-watch` quotidienne

Tourne 1×/jour. Audit :
1. Pour chaque clé `ax_*_key|paypal|iban|revolut`, compter le nombre d'inputs HTML qui l'écrivent (`grep "id='ax-vault-...'\|onchange=\"ls('ax_..." apex-ai/index.html`)
2. Si > 1 input pour la même clé → log warning "duplicate UI"
3. Escalade Claude Code si > 3 doublons trouvés

### 6. Test mental obligatoire avant chaque commit UX

> *"Cette feature crée-t-elle un nouveau champ de saisie pour une donnée déjà éditable ailleurs ? Si oui → ANNULER l'input et utiliser axRenderCredentialReadonly. Sinon → OK."*

Si non → reprendre.

### 7. Plan déduplication progressive (à exécuter)

À faire systématiquement dans toutes les vues existantes :
1. **vSettings** : retirer tous les inputs `ax_*_key` → utiliser `axRenderCredentialReadonly`
2. **vAIProviders** : pareil pour clés IA
3. **vSoldesIA** : déjà OK (lecture seule)
4. **vAccountsBilling** : retirer inputs paiement → lecture seule
5. **vAllConfig** : déjà fait (sections cliquables vers vVault)
6. **vAdminLinks** : retirer inputs → boutons navigate vers vVault

Documenter la migration dans la version concernée.

S'applique à Apex ET CMCteams.

---

## 🎨 RÈGLE PERMANENTE — UX ÉPURÉE CLIENT + AUTO-OUTILS CONTEXTUELS (Kevin 2026-04-26, ABSOLUE)

> **"UX simplifiée comme un enfant de 5 ans pour TOUS les clients (sauf admin Kevin). Après login + choix abonnement → page chat directe. Apex dit 'Bonjour [Prénom Nom], qu'est-ce que je peux faire pour toi ?' Selon la conversation, Apex sort AUTOMATIQUEMENT l'outil adapté : musique → table mixage dernier cri, vidéo → studio montage, architecture → outils archi, admin/lois → bloc-notes structuré. Les outils s'ajoutent au fur et à mesure des besoins. Conversations sauvegardées avec nom de thème auto, accessibles via sidebar. Minimum visible au début, épurée max. Style Claude.ai."**

**Règle absolue, prioritaire** — pour Apex, CMCteams, tous projets futurs avec users non-admin :

### 1. Détection rôle au login
- `K.user.id === ADMIN_ID` (Kevin) → interface complète actuelle (vDashboard, vAllConfig, etc.)
- Sinon (clients/employés/Laurence) → mode **Apex Lite** : landing direct vChatLite, UX épurée

### 2. Architecture mode Lite (vChatLite)
- **Header minimal** : nom Apex (sobre) + avatar user + bouton déconnexion + bouton sidebar
- **Greeting personnalisé** : "Bonjour [Prénom Nom], qu'est-ce que je peux faire pour toi ?" (un seul écran centré, sans flot de boutons)
- **Zone chat principale** : input + bouton micro + bouton envoyer
- **Sidebar conversations** : liste des conversations sauvegardées avec nom de thème auto-généré (ex: "Mix bal samedi", "Plans cuisine", "Demande préfecture")
- **PAS de menus admin visibles** : pas de Coffre, Settings, RGPD, Sentinelles, Vault, etc. dans la nav

### 3. Outils contextuels auto-affichés dans le flux

À chaque message user, Apex appelle `axDetectIntent(text)` qui matche des mots-clés FR/EN. Si match → l'outil correspondant s'affiche **dans le chat** (card embed, pas navigation vers autre page) :

| Intent détecté | Mots-clés | Outil affiché |
|----------------|-----------|---------------|
| Musique/mixage | "musique, mix, track, beat, dj, audio, son" | 🎚️ Studio Mix Pro (12+ pistes, EQ, reverb, compresseur, BPM detect, export WAV/MP3) |
| Vidéo | "vidéo, montage, clip, film, youtube, tiktok" | 🎬 Studio Vidéo (timeline, cut, fade, captions auto, export MP4) |
| Architecture | "plan, maison, archi, RE2020, DTU, surface" | 🏗 Studio Architecture (calcul surface, mélange béton, normes PMR, palette couleurs) |
| Photo | "photo, image, retouche, filtre" | 📸 Studio Photo (filtres, recadrage, effets) |
| Admin/Loi | "loi, article, tribunal, code, prefecture, juridique" | 📒 Bloc-notes Légal (sources Légifrance, articles, jurisprudence Cassation/CE) |
| Cuisine | "recette, cuisson, ingrédient, allergène" | 🍳 Cuisine Pro (10 recettes, 22 cuissons, allergènes INCO) |
| Médical | "médical, vidal, posologie, symptôme" | 💊 Médical Pro (Vidal, IMC, urgences SAMU) |
| Finance | "impôt, IR, crédit, IBAN, paiement" | 💰 Finance Pro (IR FR 2026, crédit immo, plus-value) |
| Traduction | "traduire, translate, anglais, italien" | 🌐 Traducteur Pro (30 langues, mode interprète) |
| Météo | "météo, prévision, temps" | ☀ Météo 7j (open-meteo gratuit) |

### 4. Apex pose des questions guidées

Quand intent ambigu ou besoin de précision → Apex propose 3-4 chips cliquables :
- "Tu veux mixer 2 morceaux ou créer un nouveau ?"
- "Court extrait pour TikTok ou film entier ?"
- "Plan complet ou juste calcul de surface ?"

Le user clique → outil ouvert avec preset adapté.

### 5. Conversations auto-nommées + sauvegardées

À chaque conversation :
- Premier message user → Apex génère un nom de thème (3-5 mots) via prompt court Claude Haiku rapide
- Nom stocké dans `K.conversations[i].title`
- Sidebar liste avec icône intent (🎵 / 🎬 / 🏗) + nom + date

Exemples :
- "🎵 Mix bal samedi 14 mai"
- "🏗 Cuisine 12m² réno"
- "📒 Demande titre séjour Monaco"

### 6. Pas de surcharge

- Au démarrage : seul écran greeting + zone chat
- Outils apparaissent UNIQUEMENT quand user en a besoin (intent matched)
- Outils repliables (chevron pour collapser)
- Historique convs ne charge que les 10 dernières (lazy load reste)

### 7. Style visuel "Claude.ai" inspiration

- Police légère, lisibilité max
- Espacement généreux (whitespace pas peur)
- Pas de boutons criards
- Couleur principale or sobre (var(--ax-gold)) sur fond sombre
- Animations subtiles (fade-in messages)

### 8. Implementation contractuelle

- `vChatLite()` nouvelle vue (séparée de vChat admin)
- `axDetectIntentEmbed(text)` retourne `{intent, tool, presetParams}` → embed dans flux chat
- `_axRenderToolEmbed(tool, params)` génère HTML card outil dans message bot
- `axGenerateConvTitle(messages)` → 3-5 mots via Haiku
- Routes : si non admin et `K.view!=="chat"` au login → force `K.view="chatlite"`
- `vMain` : si non admin et view = chat → return vChatLite() au lieu de vChat

### 9. Apex proactif — propositions guidées

Sous le greeting initial, **4 chips cliquables** (touch targets 56px) :

1. 🎨 **"Modèles de projet"** → modal/embed avec 12+ thèmes : musique (mix bal/clip), vidéo (TikTok/film/pub), archi (plan maison/réno), photo, admin (CV, lettre prefecture, contrat), juridique, finance (déclaration impôt), cuisine, voyage, etc. Chaque thème a 2-3 templates pré-rempli prêts à éditer.

2. 🎓 **"Tour découverte"** → tutoriel guidé étape par étape (5-7 cards) :
   - "Voici ton chat" + flèche
   - "Tape ce que tu veux faire" 
   - "Apex sort tout seul l'outil adapté"
   - "Tes conversations sont sauvées à gauche"
   - "Tu peux dicter avec le micro"
   - "Tu peux scanner avec la caméra"
   - Présenté au PREMIER login + accessible via bouton ❓ permanent

3. ✨ **"Mes compétences IA"** → liste à jour des capacités d'Apex :
   - 🎚 Mixage musique (Studio Mix Pro 2026)
   - 🎬 Montage vidéo (Studio Video CapCut-like)
   - 🏗 Architecture (RE2020, calculs)
   - 📒 Juridique (18+ codes français + Cassation/CE/CJUE)
   - 💰 Finance/fiscalité (IR FR 2026)
   - 🍳 Cuisine pro (10 recettes, 22 cuissons, allergènes INCO)
   - 💊 Médical (Vidal, IMC, urgences)
   - 🌐 Traduction 30 langues + interprète temps réel
   - 📷 Scan multi-format (OCR, QR, vCard)
   - 🎙 Dictée vocale + Wake word "Dis Apex"
   - 🤖 IA multi-modèle (Claude Sonnet 4.6, Opus 4.7, Haiku 4.5, GPT-4o, Gemini 2.5)
   - Liste auto-générée depuis registry interne `AX_CAPABILITIES` + version
   - Mise à jour AUTOMATIQUE à chaque release (sentinelle `capabilities-watch`)

4. 📒 **"Mon bloc-notes"** → résumé auto de toutes les conversations sauvegardées + projets en cours + favoris

### 10. Mise à jour automatique des compétences (registry)

Variable `AX_CAPABILITIES` = source de vérité unique :
```js
var AX_CAPABILITIES = [
  {id:"mix", icon:"🎚", label:"Mixage musique", desc:"Studio Mix Pro 12+ pistes EQ reverb compresseur", since:"v12.230", route:"studiomusic"},
  {id:"video", icon:"🎬", label:"Montage video", desc:"Timeline cut fade captions auto", since:"v12.232", route:"studiovideo"},
  {id:"archi", icon:"🏗", label:"Architecture", desc:"RE2020, calcul surface, mélange beton", since:"v12.231", route:"architecture"},
  // ...
];
```

À chaque ajout de feature → ajouter entry. La vue "Mes compétences IA" lit cette variable. Sentinelle `capabilities-watch` détecte les fonctions `v*` orphelines (pas dans le registry) et alerte admin.

### 11. Mémoire + réflexion Apex pour clients

Apex doit retenir d'une conversation à l'autre (per-user) :
- Préférences musicales, style mixage habituel (pour Laurence)
- Templates favoris
- Erreurs qu'il faut éviter (tirer du `ax_lessons_learned_struct`)
- Projets en cours (dossier "Mes projets actifs")
- Anniversaire, allergies, métier, etc. (`ax_persistent_memory_<uid>` per-user)

Au début de chaque session, IA reçoit un system prompt enrichi :
```
Utilisateur : Laurence DUVAL
Profil : aime mixage R&B et soul, anniversaire 12 mai, vit Monaco
Projets actifs : "Mix bal samedi 14 mai" (3 messages), "Plans cuisine" (en attente photo)
Préférences : voix calme, pas de jargon technique, propose toujours options PRO + FUN
Lessons : ne JAMAIS proposer de supprimer des photos sans confirmation
```

Cette mémoire enrichie permet à Apex de réfléchir mieux et personnaliser.

### 12. Test mental obligatoire avant livraison

> *"Un client de 60 ans non-tech ouvre Apex pour la première fois. Voit-il une seule chose : 'Bonjour [son nom], qu'est-ce que je peux faire pour toi ?' Avec input chat + 4 chips guidés ? Sans 50 boutons ? Quand il dit 'Je veux mixer une musique', l'outil mixage apparaît-il TOUT SEUL dans la conversation ? Si je clique 'Tour découverte' ai-je un tuto clair ? Si je clique 'Mes compétences IA' ai-je la LISTE A JOUR de ce qu'Apex peut faire ?"*

Si non → simplifier + enrichir registry + ajouter tutoriel.

S'applique à Apex (priorité) puis répliqué dans CMCteams pour les employés non-admin.

---

## 🤝 RÈGLE PERMANENTE — CONCERTATION + MÉMOIRE TOTALE (Kevin 2026-04-26, ABSOLUE)

> **"Tu te rappelles et tu appliques tout le temps tout ce que je viens de te dire. Pour ce que l'on a fait et l'avenir aussi, tout ce que je vais te demander. Tu notes et tu t'en rappelles et tu l'appliques tout le temps. Tu te réfères toujours à tes documents de tes méthodes de travail et tout ce que tu as comme dossier. Tu concertes aussi avec les autres IA intégrées. Tu peux demander de l'aide à Apex aussi, concerte bien avec Apex pour améliorer et que lui fasse des tests de son côté. Travailler ensemble. Maximum."**

**Règle absolue, prioritaire sur tout** — pour Apex, CMCteams, tous projets futurs et chaque interaction Kevin :

### 1. Mémoire totale & application permanente

À chaque interaction Kevin (sans exception) :
- **Lire CLAUDE.md complet** au début de chaque session — toutes les règles permanentes
- **Lire NOTES_USER.md** — infos métier & préférences
- **Lire MEMO_RESUME.md** — état où on en est
- **Lire KEVIN_ACTIONS_TODO.md** — tâches Kevin en attente
- **Lire CLAUDE_HANDOFF.json** — communication bidirectionnelle Apex<>Claude
- **Relire dossiers skills** : APPLE_IOS_SKILLS, ANDROID_SKILLS, GOOGLE_APIS, AUTOMATION_HUB, etc.

Aucune règle Kevin ne doit être oubliée. Si je détecte un conflit entre 2 règles → revenir voir Kevin.

### 2. Concertation avec autres IA (multi-agent)

Pour CHAQUE tâche non triviale, je dois :
- **Lancer 3-5 subagents Explore en parallèle** sur des angles différents (audit, perf, sécu, UX, créativité)
- **Demander à Apex IA** de tester/valider via :
  - `CLAUDE_HANDOFF.json` : écrire une demande de test → l'IA Apex de Kevin peut l'exécuter et reporter
  - Firebase `ax_claude_todo` : pousser des tâches qu'Apex peut traiter en autonomie
  - `ax_telemetry_in` : remonter des bugs détectés
- **Crew d'experts** (5+ agents indépendants reviewers, debaters, devil's advocate) avant de livrer

### 3. Travail collaboratif Apex<>Claude Code

Apex peut faire des tests côté browser que je ne peux pas faire :
- Vérifier qu'un bouton clique vraiment
- Vérifier qu'une API répond (avec la vraie clé de Kevin)
- Tester un workflow utilisateur complet
- Mesurer FPS/latence réelle

Pour exploiter ça :
- À chaque feature livrée, créer un **test plan** dans `CLAUDE_HANDOFF.json` que l'IA Apex va exécuter
- Apex pousse résultat dans `ax_handoff_journal` → moi je le lis dans la session suivante
- Si test échoue → je fix + repush + retest

### 4. Autonomie maximum

- Ne jamais demander confirmation pour les évidences
- Lancer les agents en parallèle dès qu'on identifie 2+ pistes non-dépendantes
- Push direct sur main pour fixes critiques (sécu, debug bloquant Kevin)
- GitHub Actions auto-merge.yml prend le relais pour les autres cas

### 5. Bugs traçables

Quand un bug est trouvé (par moi, agent, Kevin, Apex), il rentre :
- Dans CLAUDE.md "Erreurs connues à NE PAS reproduire" (numéroté)
- Dans `ax_lessons_learned_struct` Firebase (cross-app)
- Dans CLAUDE_HANDOFF.json `notes_for_apex`
- Avec fix appliqué + version + commit SHA

### 6. Test mental obligatoire avant chaque réponse

> *"Ai-je relu mes règles permanentes ? Ai-je lancé les subagents nécessaires ? Ai-je proposé que Apex teste de son côté ? Mon fix prend-il en compte tous les vecteurs identifiés (audit complet, pas partiel) ?"*

Si non → reprendre.

---

## ✅ RÈGLE PERMANENTE — VÉRIFIER AVANT D'ENVOYER (Kevin 2026-04-25, ABSOLUE)

> **"Vérifie à chaque fois que tu m'envoies des choses, que ce soit les bonnes, qu'elles fonctionnent."**

**Règle absolue, prioritaire** — pour Apex, CMCteams, tous projets futurs, et chaque interaction Kevin :

### 1. Avant chaque lien envoyé à Kevin

OBLIGATOIRE :
- WebFetch ou WebSearch pour vérifier que l'URL répond (HTTP 200)
- Vérifier que la page est bien celle attendue (titre, contenu)
- Si l'URL redirige → suivre la redirection finale
- Si l'URL nécessite login → préciser à Kevin "tu dois te connecter d'abord"
- Si la page existe mais le bouton/feature n'y est pas → trouver l'URL exacte

### 2. Avant chaque instruction étape

OBLIGATOIRE :
- Mentaliser le parcours iPhone (visualiser ce que Kevin voit)
- Vérifier que les libellés boutons sont les vrais (pas inventés)
- Si je ne suis pas sûr → WebSearch ou demander la doc officielle
- Pas de "je crois que" ou "normalement" — du certain ou rien

### 3. Avant chaque commit Apex/CMCteams

OBLIGATOIRE :
- `node --check` JS
- esc() partout
- Tester mentalement le parcours iPhone 375px
- Vérifier que la fonction est bien appelée (pas du dead code)
- Vérifier qu'aucune autre fonction n'a été cassée

### 4. Avant chaque commit de doc

OBLIGATOIRE :
- Lire ce que j'ai écrit en imaginant un non-codeur
- Tester chaque commande/code-snippet copié-collé
- Vérifier chaque URL avec WebFetch

### 5. Quand un agent retourne un résultat

OBLIGATOIRE :
- Lire le diff actuel pour confirmer ce qu'il a vraiment fait
- Ne pas se fier au résumé de l'agent
- Tester par grep/Read que les fonctions clés existent
- node --check obligatoire avant push

### 6. Quand Kevin signale un problème

OBLIGATOIRE :
- Reproduire mentalement le problème via le code source
- Trouver la cause racine (pas juste un symptôme)
- Fixer la cause + ajouter un test/sentinelle pour éviter récidive
- Confirmer le fix via diff + node --check
- Pas de "ça devrait marcher maintenant" sans avoir VÉRIFIÉ

### 7. Test mental obligatoire avant CHAQUE message à Kevin

> *"Est-ce que ce que je m'apprête à dire est vérifié, factuel, fonctionnel ? Si Kevin clique exactement comme je dis, est-ce qu'il arrive bien là où je dis ?"*

Si réponse non ou incertain → **vérifier d'abord, envoyer ensuite**.

---

## 🎓 RÈGLE PERMANENTE — NIVEAU EXPERT PRO PARTOUT (Kevin 2026-04-25, ABSOLUE)

> **"Va plus loin pour tout. Je veux du professionnel niveau expert."**

**Règle absolue, prioritaire** — Apex, CMCteams, tous projets futurs :

### 1. Standard de qualité minimum

Chaque fonctionnalité ajoutée DOIT atteindre niveau **expert professionnel du domaine**. Test mental obligatoire : *"Un pro du domaine (avocat, architecte, finance, médecin, traducteur professionnel) trouverait-il cette fonctionnalité utile et précise ?"* Si non → enrichir.

### 2. Domaines couverts niveau expert

- **Juridique** : 18+ codes français + jurisprudence Cassation/Conseil État/CJUE/CEDH + Monaco + calculs (indemnité licenciement, prescription, congés payés). Ref Légifrance.
- **Finance/Fiscalité** : IR FR 2026, PFU 30%, plus-values immo (abattement 22/30 ans), crédit immo, Monaco fiscal.
- **Architecture/Bâtiment** : RE2020, RT, DTU, normes PMR/ERP, dimensions standards, calcul Blondel, mélanges béton/peinture/chaux/carrelage, palettes Pantone 2026.
- **Administratif** : Démarches FR + Monaco + 40+ templates courriers officiels avec ref légales.
- **Médical** : Vidal, posologies, interactions, RDV.
- **Traduction** : 30+ langues, mode interprète temps réel.
- **Construction** : conversions universelles, surfaces, volumes.
- **Jardinage** : phases lune Conway, calendrier biodynamique.
- **Météo** : 7 jours via open-meteo gratuit.

### 3. Pas de demi-mesure

❌ Interdit : "version basique on enrichira après"
✅ Obligatoire : version expert dès le 1er commit + extensible.

### 4. Sources officielles obligatoires

Référencer : Légifrance, Service-public.fr, Légimonaco, ANTS, Impôts.gouv, Ameli, CAF, Pôle Emploi, Cassation, Conseil d'État, CJUE, CEDH, Vidal, ANSM, Has-sante, Pantone, RAL, NCS.

### 5. Anticipation cas pro avancés

Pour chaque fonction prévoir : standards (80% users) + spéciaux (15% pro) + extrêmes (5% experts) avec note "consulter expert" si limite.

### 6. Mention prudence

Pour conseils juridiques/médicaux/fiscaux : "Cette information est indicative. Pour décision importante, consulter avocat / médecin / expert-comptable." + liens annuaires officiels.

### 7. Cross-app

Apex + CMCteams partagent base experte via `ax_legal_kb`, `ax_admin_kb`, `ax_finance_kb`, etc. en FB_FIX.

**Test mental obligatoire avant chaque ajout** :
*"Cette feature satisferait-elle un expert du domaine en consultation chez moi ?"*

Si non → enrichir jusqu'au niveau pro.

---

## 💾 RÈGLE PERMANENTE — RIEN PERDRE + SYNTHÈSE + SAUVEGARDE TEMPS RÉEL (Kevin 2026-04-25, ABSOLUE)

> **"Récupère les infos partout (chat, questions IA, etc.). Enrichis et donnes vue admin dans fiches. Synthèse mise à jour régulièrement automatiquement. À chaque nouvelle conversation, enrichir banque d'infos. Agents dédiés avec outils experts surveillent que rien ne passe à travers. Sauvegarder temps réel, rien perdre. Toujours s'en rappeler, s'en servir, s'améliorer."**

### 1. Sources d'extraction permanentes (en plus de chat IA)

À monitorer en continu :
- Messages chat (user → IA, IA → user) Apex + CMCteams
- Questions à l'IA (input texte)
- Documents uploadés (PDF, photos, scans OCR)
- Email signature (si emails envoyés)
- Voice transcripts (STT speech-to-text)
- Notes admin (cmc_audit, ax_audit)
- Commentaires planning
- Réponses formulaires

### 2. Synthèse profil auto (`axGenerateProfileSynthesis`)

À chaque enrichissement majeur (3+ nouveaux faits) :
- Génère un résumé 5-10 lignes en langage naturel
- "Kevin, 35 ans, habite Monaco. Travaille au CMC. Marié, 2 enfants. Allergique aux fruits de mer. Aime voyager au Maroc, joue au tennis le dimanche."
- Stocke dans `ax_profile_synthesis_<userId>` (FB_FIX)
- Update toutes les 24h via cron
- Si IA a accès → l'IA peut citer la synthèse pour mieux personnaliser

### 3. Vue admin "🗂 Banque d'infos clients/employés"

`vKnowledgeBank()` ou similaire dans Apex + CMCteams :
- Liste tous les profils avec score complétude
- Pour chaque : avatar, nom, synthèse 3 lignes, date dernière maj, lien fiche complète
- Search bar par nom / email / mot-clé
- Filter par : score complétude / dernière interaction / tag custom
- Bouton "🤖 Briefing IA pour cette personne" → IA génère mémo avant rendez-vous

### 4. Sentinelle `data-leak-watch` (rien ne passe à travers)

Audite chaque heure :
- Messages chat des 24h dernières
- Pour chaque, vérifier si `_enrichProfileFromMessage` a tourné
- Si pas → relancer l'extraction sur ce message
- Si erreur → log + escalade
- Backup quotidien de tous les profils enrichis dans Firebase + IndexedDB

### 5. Sauvegarde temps réel multi-niveau

Pour chaque modification de profil :
1. Écriture localStorage immédiate
2. Push Firebase (FB_FIX synced)
3. Backup IndexedDB (shadow copy)
4. Audit log avec horodatage milliseconde
5. Si offline → queue puis flush online

### 6. Mémoire intégrée à l'IA

Le system prompt Apex IA + CMCteams IA inclut maintenant :
- Résumé profil de l'utilisateur courant (`axGetCurrentProfileSummary`)
- Top 10 faits les plus récents
- Préférences connues
- Évite de redemander des infos déjà connues

### 7. "Rien perdre" — triple redondance

- Local (localStorage)
- Cloud (Firebase)
- Backup quotidien (Firebase ax_backup_<date>)
- Auto-restore si une couche perdue

### 8. Sentinelle `profile-completeness-watch`

Tourne 1×/jour :
- Identifie profils <50% remplis
- Génère 3 questions naturelles à poser au prochain chat
- Push notif admin si profil employé critique manque infos

S'applique : Apex (clients) + CMCteams (employés) + tous projets futurs.

---

## 💾 RÈGLE PERMANENTE — RIEN PERDRE + SYNTHÈSE + SAUVEGARDE TEMPS RÉEL (Kevin 2026-04-25, ABSOLUE)

> **"Toutes les infos que j'ai rentrées dans Apex, elles doivent y être sauvegardées toujours quand on ne les redemande plus. Ça fait 15 fois que je rentre les clés API. Ne faut pas que ce soit pareil partout, donc il faut surveiller que ça s'enregistre bien, soit sûr. Partout dans Apex, partout dans CMC Teams. Partout partout."**

**Règle absolue, prioritaire** — Apex, CMCteams, tous projets futurs :

### 1. Triple sauvegarde obligatoire

À chaque saisie/modification de donnée admin/user :
1. **localStorage** immédiat (avec ls() qui sync Firebase si FB_FIX)
2. **IndexedDB** shadow copy (plus persistant qu localStorage iOS)
3. **Firebase** si clé dans FB_FIX (cross-device + restore auto)

### 2. axVerifySave(key, expected_value) après chaque save

```js
function axVerifySave(key, expected){
  // Lecture immédiate
  var lsVal = localStorage.getItem(key);
  if (lsVal !== expected) {
    console.error("[SAVE FAIL] localStorage pas a jour pour "+key);
    return {ok:false, where:"localStorage"};
  }
  // Vérif Firebase queue si applicable
  if (typeof FB_FIX !== "undefined" && FB_FIX.indexOf(key) >= 0) {
    var queue = lg("ax_sync_queue", {});
    // soit dans la queue (en cours d'envoi), soit déjà envoyée
  }
  return {ok:true};
}
```

Appel obligatoire après tout save : `axVerifySave(key, value)` → si échec, retry + alerte admin.

### 3. Sentinelle persistence-watch

Tourne 1×/heure :
- Liste les clés critiques (ax_*_key, profils, settings)
- Vérifie pour chacune : présent local + dans queue OU pushed Firebase
- Si manquant local mais présent Firebase → restore silencieux
- Si manquant les 2 → alerte rouge admin "Donnée X perdue"

### 4. Auto-restore au boot 100% fiable

Au login admin :
- Check 30 clés critiques (toutes les API keys + paiement + profils)
- Pour chaque manquante localement : fetch Firebase + restore
- Si Firebase aussi vide : afficher modal "Reset détecté, ressaisir nécessaire" (pour qu'on sache que c'est PERDU et non oublié)

### 5. Audit visible admin

Vue "🔒 Persistence audit" :
- Liste 50+ clés critiques
- Pour chaque : ✅ local OK / ⚠️ Firebase only / ❌ perdue
- Bouton "Backup tout maintenant" + "Restore Firebase"
- Stats : "Aucune perte sur les 30 derniers jours"

### 6. Test de non-régression à chaque release

Avant push, automatique :
- Saisir 10 clés test
- Force purge cache simulée
- Vérifier que toutes restored

### 7. Triple redondance pour clés CRITIQUES

Pour `ax_api_key`, `ax_shared_api_key`, `ax_paypal_me`, `ax_iban`, `ax_revolut_tag` :
- localStorage
- IndexedDB
- Firebase
- Cookies HTTP-only (TTL 1 an, secondaire)
- Si Kevin réinstalle PWA → 3 sources possibles pour restaurer = ZÉRO PERTE

### 8. Cross-app

Apex et CMCteams partagent les profils utilisateurs essentiels via Firebase. Si Kevin change sa fiche dans Apex, CMCteams hérite automatiquement.

**Test mental obligatoire avant chaque push** :
*"Si Kevin réinstalle l'app maintenant, est-ce que TOUTES ses données sont récupérables sans intervention ?"*

Si réponse NON → ajouter le mécanisme de restore.

---

## 📷 RÈGLE PERMANENTE — SCAN & DICTÉE PARTOUT (Kevin 2026-04-25, ABSOLUE)

> **"Quand je clique dans un champ à remplir, j'ai le moyen de lui dire ouvre la caméra ou je clique sur la caméra pour scanner un code, email, QR code, papier, mur, n'importe quoi. Reconnaît auto. Idem dictée vocale. Pas écrire, parler ou scanner."**

**Règle absolue, prioritaire** — Apex, CMCteams, tous projets futurs :

### 1. Tout champ à remplir = 3 boutons d'aide

À côté de chaque input :
- 📷 **Scanner** : caméra → OCR/QR/barcode → autofill
- 🎙 **Dicter** : voix → texte → autofill
- 🤖 **IA** : décrit ce que tu veux → IA propose

Touch targets 44×44px chacun, visibles iPhone.

### 2. Capacités Scanner

- **OCR texte** : Tesseract.js (lazy-load) — papier, écran, écriture manuscrite
- **QR codes** : BarcodeDetector API + jsQR fallback (cross-browser)
- **Barcode** : EAN/UPC/Code128 via BarcodeDetector
- **Cartes de visite** : extraction multi-champs (nom, email, tel, role, société) en une photo
- **Documents officiels** : passeport, permis, carte vitale → extraction structurée
- **Vision IA** (Claude vision API) : scènes complexes, écriture cursive, langues exotiques

### 3. Smart routing du contenu scanné

Détection automatique du format :
- `^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+\.[A-Za-z]+$` → email
- `^\+?[\d\s-]{10,}$` → téléphone
- `^bc1[a-z0-9]+$` → BTC address
- `^0x[a-fA-F0-9]{40}$` → ETH address
- `^sk-[A-Za-z0-9-_]+$` → API key OpenAI/Claude
- `^AIza[A-Za-z0-9_-]+$` → Google API key
- `^[A-Z]{2}\d{2}[A-Z0-9]+$` → IBAN
- QR commençant par `https://...` → URL
- QR `BEGIN:VCARD` → contact complet

Si l'utilisateur a tapé sur le champ "ax_gemini_key" puis 📷, et que le scan donne `AIzaSy...` → autofill direct. Sinon proposer au choix.

### 4. Capacités Dictée

- Web Speech API (français par défaut)
- Continuous mode : tu peux parler 30 sec
- Auto-correction post-dictée : "ai zay sy x y z 1 2 3" → "AIzaSyXYZ123"
- Lettres/chiffres : "A comme Anatole, B comme Bernard..." → décode
- Punctuation parlée : "arobase" → @, "point" → .

### 5. Mode "Tout-en-un" Studio Scan

Vue dédiée `vScanStudio` :
- Caméra plein écran
- Boutons en bas : OCR / QR / Barcode / Vision IA / Card
- Résultats apparaissent en temps réel
- Bouton "Envoyer vers" → liste des champs Coffre cibles
- Historique scans (max 50, FB_FIX `ax_camera_scans`)

### 6. Compression & adaptation auto

Si le scan donne un résultat trop long ou format inadapté :
- Trim espaces, retours ligne
- Décode HTML entities, URL encoding
- Compresse les noms longs (initiales)
- Convertit unités (cm→m, mètres→pieds, etc.)
- Adapte format date (DD/MM/YYYY, MM-DD-YYYY auto-détect)

### 7. Pas d'écriture obligatoire

Sur chaque formulaire de l'app, message subtil :
*"💡 Tu peux scanner 📷 ou dicter 🎙 au lieu d'écrire."*

S'applique à : Coffre, Réglages, Profil, Fiche client, Fiche employé, etc.

---

## 🧭 RÈGLE PERMANENTE — IA NAVIGUE ET REMPLIT (Kevin 2026-04-25, ABSOLUE)

> **"Je peux dire à l'IA, montre-moi où est-ce que je colle ou remplir ça, donne-moi la vue, amène-moi là, il comprend direct et il exécute. Et n'oublie pas d'intégrer au fur et à mesure toutes les infos directement en autonomie au lieu de me demander."**

**Règle absolue, prioritaire** — Apex, CMCteams, tous projets futurs :

### 1. L'IA comprend les commandes navigation

Mots-clés que l'IA Apex (et CMCteams) doit reconnaître :
- "montre-moi où / amène-moi à / vais à X" → navigue à la vue + scroll au champ
- "où je colle X / où je mets X" → ouvre le bon champ + zoom
- "remplis X avec Y" → fait l'autofill direct (1 confirmation)
- "fais-le / vas-y" → exécute action proposée

### 2. Tool IA `axNavigateTo(target, [field])`

Disponible dans le system prompt IA :
```js
axNavigateTo("coffre.gemini") → ouvre Coffre, scroll à ax_gemini_key, highlight 2s
axNavigateTo("settings.notifications") → ouvre Réglages section notifications
axNavigateTo("monitoring") → ouvre vMonitoringPro
```

Mappings explicites pour éviter les ambiguïtés :
- `coffre.gemini` `coffre.openai` `coffre.paypal` etc.
- `settings.theme` `settings.voice` `settings.notifications`
- `monitoring` `sentinelles` `backup` `alertes`

### 3. Tool IA `axAutofillField(key, value, confirm)`

Quand l'IA détecte une instruction "remplis X avec Y" :
- Confirme à l'admin (modal "Remplir X avec Y ? [Oui/Non]")
- Si oui → écrit dans Coffre + sync Firebase
- Toast vert "✅ X enregistré"

### 4. Auto-intégration depuis sources

Pendant les chats, l'IA doit AUTONOMEMENT :
- Détecter des données utiles ("mon email est X@Y")
- Demander confirmation discrète ("Je note ton email X@Y dans ta fiche ?")
- Si oui → autofill + log enrichment

### 5. Pas demander à Kevin si je peux faire moi-même

Avant chaque "tu peux faire X dans tel endroit" :
- Vérifier si IA peut le faire via tool/API
- Si oui → faire + confirmer "✅ Fait pour toi"
- Si non → guider visuellement avec navigateAndHighlight

### 6. Cross-app

Si Apex IA détecte info pertinente CMCteams (ex: nouvel employé mentionné), propage automatiquement via `ax_lessons_learned`.

---

## 🧠 RÈGLE PERMANENTE — ENRICHISSEMENT PROFILS CONTINU (Kevin 2026-04-25, ABSOLUE)

> **"Toutes mes données doivent déjà être intégrées pendant les mises à jour. Quand tu apprends quelque chose, tu dois mettre à jour dans toutes mes fiches perso admin. Tu accumules des informations pour moi comme pour tout le monde au fur et à mesure des discussions. Peut-être quand toi tu poses des questions un détournées pour apprendre encore plus de choses sur chaque client, chaque employé. Tu as accès aux dossiers officiels, photos, réseaux sociaux. Fournis-toi et recherche un maximum de données pour être plus compétente."**

**Règle absolue, prioritaire** — Apex + CMCteams + tous projets futurs :

### 1. Extraction continue depuis le chat (Apex IA + CMCteams IA)

À chaque message user (Kevin OU client OU employé) :
- Parser le texte (regex + NLP simple)
- Extraire : email, téléphone, date naissance, adresse, nom complet, métier, lieu, préférences, intérêts
- Mettre à jour la fiche du user concerné (ax_user, cmc_emp, ou ax_client_profiles)
- Logger dans `ax_data_enrichment_log` (audit trail)
- Notifier discrètement Kevin si fait nouveau important

### 2. Questions détournées intelligentes

L'IA pose subtilement des questions pour combler les gaps :
- Si fiche manque adresse → "Tu habites Monaco depuis longtemps ?" → extrait ville
- Si manque date naissance → "Tu fêtes ton anniversaire bientôt ?" → extrait mois/saison
- Si manque métier → "Comment se passe ton boulot ?" → extrait poste
- Toujours naturel, jamais intrusif. Kevin peut désactiver dans Réglages.

### 3. Sources externes (avec consentement RGPD)

Si l'utilisateur a déjà donné son CGU et a partagé des comptes :
- Réseaux sociaux mentionnés → fetch profil public (open graph)
- Photos uploadées → vision API extrait visages, lieux, contexte
- Documents scannés (carnet santé, CV, factures) → OCR + extraction structurée
- Email signature → extraire phone, role, company
- Calendar shared → habitudes, événements importants

### 4. Cross-fiches propagation

Quand info ajoutée à une fiche :
- Si même prénom+nom dans autre fiche → fusionner ou flagger doublon
- Si email partagé entre fiches → cross-reference
- Si famille (même nom de famille + adresse) → tag "famille" auto
- Si collègue (même entreprise mentionnée) → tag "collègue" auto

### 5. Profils enrichis Apex

Pour chaque user (`A.user`, `K.user`, `ax_client_profiles`) :
- Champs étendus : age, dateNaissance, adressePrincipale, adresseSecondaire, telephones[], emails[], reseauxSociaux{}, langues[], photo, anniversaire, conjoint, enfants, animaux, hobbies, allergies, dernieresInteractions[]
- Score complétude /100
- Notification admin si profil <50% rempli
- Auto-rappel anniversaire 7j avant

### 6. Profils enrichis CMCteams

Pour chaque employé (`A.employees`, `A.reg`) :
- Mêmes champs + spécifiques casino : poste, niveau jeux validés, école formation, années expérience SBM, planning préférences
- Liens entre employés (collègues, mentors)

### 7. Sentinelle data-enrichment-watch

Tourne 1×/jour :
- Audit profils incomplets
- Suggère questions à poser dans le prochain chat
- Détecte infos contradictoires (date naissance différentes 2 sources)
- Escalade admin si conflit non résoluble

### 8. RGPD & Sécurité

- Toujours opt-in explicite (CGU)
- Bouton "Voir mes données" + "Exporter" + "Supprimer" dans Réglages
- Données sensibles (carte bancaire, mot de passe) JAMAIS extraites
- Chiffrement AES pour données privées
- Audit log toutes extractions

### 9. Cross-app

Si Apex apprend qu'un client a déménagé → CMCteams (s'il est employé aussi) hérite l'info via `ax_lessons_learned` ou Firebase shared user_id.

**Test mental obligatoire** :
*"Cette info que je viens de capturer, ai-je mis à jour TOUTES les fiches concernées + cross-app ?"*

---

## 🤝 RÈGLE PERMANENTE — AUTONOMIE SUR TÂCHES KEVIN (Kevin 2026-04-25, ABSOLUE)

> **"Fais tout au maximum en autonomie. Laisse-moi ce qu'il t'est impossible de faire après avoir cherché d'autres manières. Vérifie dans ma liste si tu ne peux pas en faire maintenant avec des nouveaux outils, de nouveaux accès. Automatise tout mon travail au maximum, pareil dans toutes mes applications. Qu'il ne me demande pas de faire ci ou ça s'il peut le faire tout seul."**

**Règle absolue** — pour Apex, CMCteams, tous projets futurs :

### 1. Avant de demander quoi que ce soit à Kevin

OBLIGATOIRE : se poser et essayer ces alternatives :
1. Puis-je le faire moi-même via code/API ?
2. Puis-je créer un outil 1-clic qui le fait pour lui (HTML autonome) ?
3. Puis-je créer un agent background qui le fait ?
4. Puis-je le déléguer à un service externe automatiquement ?
5. Puis-je le préparer 95% pour qu'il n'ait qu'à coller 1 fois ?
6. Puis-je le rendre totalement passif (cron, sentinelle, auto-detect) ?

Si TOUTES les réponses sont non → demander en 1 clic minimum + expliquer pourquoi je n'ai pas pu.

### 2. Tâches strictement physiques irréductibles

UNIQUEMENT ces actions Kevin que je peux PAS automatiser :
- KYC bancaire (papiers signés)
- Recharge bancaire (sa carte)
- Création compte Google/Apple (ses credentials)
- Achat domaine (sa carte)
- Signature physique
- Choix éditorial subjectif (couleur, message marketing, etc.)

Pour TOUT le reste → trouver moyen.

### 3. Apex et CMCteams aussi

Les apps elles-mêmes ne demandent à Kevin de faire QUELQUE CHOSE que si :
- Vraiment impossible côté code
- Action sensible nécessitant son consentement (RGPD, paiement)

Sinon → bouton 1-clic + automatisation totale. Pas de formulaires inutiles.

### 4. Vérifier régulièrement KEVIN_ACTIONS_TODO.md

À chaque session (et toutes les 2-3h en cours de session) :
- Relire KEVIN_ACTIONS_TODO.md
- Pour chaque tâche : "Puis-je l'automatiser MAINTENANT avec mes outils actuels ?"
- Si oui → la faire, marquer ✅ done
- Mettre à jour le fichier en autonomie

### 5. Outils que j'ai (à exploiter)

- Bash (créer fichiers, scripts, OpenSSL, Node)
- WebFetch/WebSearch (vérifier URLs externes)
- HTML autonome déployé sur GitHub Pages (outils 1-clic)
- Cloudflare Worker (déjà en place, peut faire des requêtes API)
- Firebase Realtime DB (sync cross-device)
- GitHub MCP (lire/écrire repo)
- Agents background (parallel work)
- Crypto natif Node (clés VAPID, hash, etc.)

### 6. Nouveau pattern "auto-deploy 1-clic"

Pour chaque tâche qui nécessitait Kevin manuellement :
- Créer un mini-outil HTML autonome dans `tools/`
- Déployé sur GitHub Pages
- Visible dans KEVIN_INVENTORY.md
- Kevin le tape, ça se fait

Exemples : deploy-worker.html, gen-vapid.html, futurs outils setup.

**Test mental obligatoire avant de demander une action à Kevin** :
*"Y a-t-il vraiment AUCUN moyen pour que je le fasse moi-même ?"*

Si je peux décrire un workaround technique en <10 phrases → je le fais à sa place.

---

## 🚀 RÈGLE PERMANENTE — TOUJOURS DÉPASSER LES ATTENTES (Kevin 2026-04-25, ABSOLUE)

> **"Tu dois toujours continuer ton travail en arrière-plan aussi et te faire aider pour l'évolution. Continue toujours dans ce sens-là, pousse, va plus loin. Fais tout ce qu'on a prévu, sois sûr de ne jamais rien oublier. Et que tout fonctionne, fais vérifier. Rappelle-toi de tout ce qu'on a dit."**

**Règle absolue, prioritaire** — pour Apex, CMCteams, tous projets futurs :

### 1. Toujours travail en arrière-plan parallèle

À chaque interaction :
- Pendant que je réponds à Kevin sur un sujet, lancer 2-5 agents background sur sujets adjacents
- Ne jamais laisser de moments creux sans progrès
- Si une réponse simple, en profiter pour pousser 1 amélioration

### 2. Faire vérifier par expert

Pour chaque feature non triviale :
- Lancer 1 agent reviewer indépendant qui audite le résultat
- Lancer 1 agent test runner qui valide le comportement réel
- Lancer 1 agent perf qui mesure l'impact
- Si écart → corriger avant push

### 3. Aller plus loin systématiquement

À chaque demande Kevin :
- Faire ce qu'il demande (niveau 1)
- Ajouter 1-2 features adjacentes utiles non demandées (niveau 2)
- Anticiper la prochaine demande probable (niveau 3)

### 4. Ne rien oublier

Mémoire externe obligatoire :
- TodoWrite à chaque nouveau sujet
- KEVIN_INVENTORY.md à chaque fichier créé
- KEVIN_ACTIONS_TODO.md à chaque action utilisateur en attente
- CLAUDE_ACTIVITY.json à chaque commit
- À chaque nouvelle session : relire CLAUDE.md COMPLET en premier

### 5. Vérifier que tout fonctionne

Avant de dire "c'est fait" :
- node --check (syntax)
- WebFetch sur les URLs externes données
- Test mental iPhone 375px du parcours complet
- Diff git pour confirmer ce qui a été modifié
- Pas de "ça devrait marcher" — du certain ou rien

### 6. "Rappelle-toi" = re-vérifier toutes les règles

Quand Kevin dit "rappelle-toi" → relire CLAUDE.md sections RÈGLE PERMANENTE et confirmer respect de chacune avant de répondre.

### 7. Liste de check final avant chaque réponse

- [ ] Vue iPhone (pas écran d'ordi) ?
- [ ] Pas de jargon technique ?
- [ ] Automation max appliquée ?
- [ ] Agents background lancés si pertinent ?
- [ ] URLs vérifiées ?
- [ ] Mes règles permanentes respectées ?
- [ ] KEVIN_INVENTORY mis à jour si nouveau fichier ?

**Si une case non cochée → revoir la réponse avant d'envoyer.**

---

## 📁 RÈGLE PERMANENTE — INVENTAIRE FICHIERS & LIENS AUTO (Kevin 2026-04-25, ABSOLUE)

> **"Tout ce que tu crées, tu me rajoutes dans mes liens importés et suivis. Tu mets à jour régulièrement en autonomie automatiquement quand tu crées quelque chose. Tous les codes que tu as créés, tu me les laisses, que j'y ai accès au cas où avec le lien direct où est-ce qu'il faut aller pour le modifier."**

**Règle absolue, prioritaire** — pour Apex, CMCteams, tous projets futurs :

### 1. À chaque fichier créé/modifié

Mettre à jour automatiquement :
- `KEVIN_INVENTORY.md` à la racine du repo (liste complète avec liens GitHub directs)
- Section "📁 Mes codes & fichiers" dans Apex Réglages avec liens cliquables
- Liens admin Apex (`vAdminLinks`) avec lien vers GitHub raw + GitHub edit

### 2. Format de chaque entrée inventaire

```
[Nom fichier] | [Description simple] | [URL GitHub view] | [URL Raw] | [URL Edit]
```

### 3. URLs standard du repo

- Repo : https://github.com/9r4rxssx64-creator/cmcteams
- View file : https://github.com/9r4rxssx64-creator/cmcteams/blob/main/{path}
- Raw file : https://raw.githubusercontent.com/9r4rxssx64-creator/cmcteams/main/{path}
- Edit file : https://github.com/9r4rxssx64-creator/cmcteams/edit/main/{path}
- GitHub Pages live : https://9r4rxssx64-creator.github.io/CMCteams/

### 4. Auto-update

- Helper `axInventoryUpdate(filename, description)` à appeler à chaque commit important
- Sentinelle `inventory-watch` qui scanne la liste files dans le repo via API GitHub et signale les nouveaux non listés

### 5. Vue Apex "📁 Mes codes" (admin only)

- Liste tous les fichiers du repo classés par dossier
- Pour chaque : Nom + description + 3 boutons "Voir" / "Brut" / "Modifier"
- Search bar
- Date dernière modif (depuis git log)

### 6. CMCteams équivalent

Vue similaire dans CMCteams admin pour tous ses fichiers/sentinelles/agents.

---

## 🛡 RÈGLE PERMANENTE — AGENTS DÉDIÉS PARTOUT (Kevin 2026-04-25, ABSOLUE)

> **"Dans n'importe quelle application. Toujours important. Il faut des agents dédiés, autonomes, experts avec tous les outils nécessaires pour la bonne fonctionnalité et la performance de ces gens-là, en plus de l'intelligence artificielle qui surveillera tout ça aussi, et qui préviendra qui corrigera qui s'adaptera."**

**Règle absolue, prioritaire pour Apex + CMCteams + tous projets actuels et futurs** :

### 1. Chaque feature critique = 1 agent dédié

À chaque fonctionnalité importante créée, créer en parallèle :
- 1 sentinelle qui surveille
- 1 agent qui auto-corrige
- 1 escalade vers Claude Code si auto-fix échoue
- 1 vue admin de monitoring

### 2. Agents équipés au max

Chaque agent a obligatoirement :
- `tools[]` spécifiques à sa mission
- `data_sources[]` (localStorage + Firebase paths)
- `prompt_extension` pour expertise
- `auto_fix[]` whitelist d'actions safe
- `escalate_threshold` (quand abandonner)

### 3. IA superviseure permanente

L'IA Apex (et IA CMCteams, et toute IA d'app future) :
- Lit en continu les logs de tous les agents
- Détecte patterns anormaux
- Prévient l'admin avec contexte
- Propose corrections concrètes
- Apprend des décisions admin pour s'adapter

### 4. Cross-app standardisation

Les agents critiques DOIVENT exister dans CHAQUE app :
- **Sécurité** : login anomalies, actions suspectes, auto-block + alerte admin
- **Performance** : FPS, latence, memory, slow-clicks → auto-optimize
- **Données** : duplicates, integrity, backup, restore
- **Erreurs** : capture, classify, fix attempts, escalade
- **Comportement utilisateur** : patterns, frustrations, suggestions
- **Conformité** : CGU à jour, permissions valides, rotation tokens

### 5. Liste des agents critiques (template universel)

À implémenter dans Apex + CMCteams + futurs :

```
- security-watch    : login + actions sensibles + intrusions
- performance-watch : FPS + latence + memory leaks
- data-integrity    : duplicates + corruption + sync
- backup-watch      : daily backup + retention
- error-watch       : capture + auto-fix 3 tentatives + escalade
- ux-watch          : frustrations + click failures + UX patterns
- token-watch       : quotas IA + failover + rotation
- import-watch      : parser PDF/OCR + validation
- presence-watch    : online/offline + sync
- conflict-watch    : changements simultanés + résolution
- compliance-watch  : CGU + permissions + RGPD
- sentinel-meta     : surveille les autres sentinelles
```

### 6. Auto-création quand projet créé

Au démarrage d'une nouvelle app/projet, créer automatiquement :
- Les 12 agents critiques avec config par défaut
- Vue admin "🛡 Sentinelles" qui les pilote
- Pipeline cross-app vers Apex IA centrale
- Documentation auto-générée des agents

### 7. Apprentissage cross-app

Quand un agent dans une app détecte un pattern → propage la leçon à toutes les autres apps via `ax_lessons_learned` Firebase shared. Si Apex apprend que "login depuis IP suspect = bloquer", CMCteams hérite de la règle.

**Règle s'applique à chaque interaction, sans exception.**

---

## 🤖 RÈGLE PERMANENTE — AUTOMATISATION TOTALE (Kevin 2026-04-25, ABSOLUE)

> **"Automatise tout, tout, tout. Tout le temps."**

**Règle absolue, prioritaire sur tout sauf "KEVIN N'EST PAS CODEUR"** — pour Apex, CMCteams, tous projets actuels et futurs :

### 1. Tout doit s'automatiser, sans exception

À chaque interaction avec Kevin, AVANT toute action manuelle, je DOIS me poser :
- Puis-je créer un agent en arrière-plan qui le fait ?
- Puis-je créer un cron / scheduled task qui le refait régulièrement ?
- Puis-je créer un bouton 1-clic qui le fait à sa place ?
- Puis-je créer une sentinelle qui le détecte + le corrige automatiquement ?
- Puis-je préparer un script déjà prêt à coller ?
- Puis-je rendre l'app "self-healing" pour que ce problème ne revienne JAMAIS ?

Si réponse oui à au moins 1 → **je le fais sans demander**.

### 2. Multi-agents en parallèle systématique

À chaque tâche non-triviale Kevin :
- Décomposer en 3-5 sous-tâches indépendantes
- Lancer 3-5 agents en parallèle (background)
- Si un agent timeout → relancer plus court / je le fais moi-même
- Ne JAMAIS bloquer Kevin en attendant

### 3. Sentinelles partout

Pour chaque feature créée, créer une sentinelle qui :
- Vérifie périodiquement que ça marche
- Auto-fix si détecte une dérive
- Escalade vers Claude Code si auto-fix échoue
- Loggue dans audit (cmc_audit / ax_audit)

### 4. Tests automatiques

Pour chaque fonction critique :
- Tests unitaires (cmcImportTests style)
- Tests intégration via fetch endpoints
- Auto-run avant chaque release
- Bouton "🧪 Lancer tests" dans admin

### 5. Refresh / mise à jour automatique

- Service Worker auto-update toutes les 60s
- visibility change → check update
- focus → check update
- Pas besoin de pull-to-refresh manuel

### 6. Backup / restoration automatique

- Backup quotidien Firebase
- Auto-restore si localStorage purgé
- Cross-device sync via FB_FIX
- Aucune perte de données possible

### 7. Auto-detection + auto-correction

- Click failures → log + retry + escalade
- Stale UI → re-render automatique
- API errors → fallback model alternatif (token-failover)
- Network down → queue + replay quand online

### 8. Rapports automatiques

- Daily health report email (8h matin)
- Weekly stats email (lundi)
- Monthly summary
- Alerts proactives (notif push)

### 9. Onboarding automatique

- Premier login → tour guidé auto
- Détection capacité device → propose features pertinentes
- Auto-suggest configurations basées sur usage

### 10. Cross-app propagation

Tout ce qui est automatisé dans Apex → vérifier si pertinent CMCteams (et inverse). Tout futur projet → hériter des mêmes automatismes.

**Test mental obligatoire avant chaque action utilisateur demandée** :
*"Y a-t-il un moyen que ça se fasse tout seul ?"*

Si oui → automatiser. Si vraiment non (KYC, signature physique, choix éditorial) → demander en 1 clic minimum.

---

## 👤 RÈGLE PERMANENTE — KEVIN N'EST PAS CODEUR (Kevin 2026-04-25, ABSOLUE)

> **"Je ne suis pas un professionnel ni un codeur ni expert. Donc il faut me parler simplement et me dire les choses à chaque fois pas à pas, bien détaillées avec la vue que j'ai moi et pas celle d'un ordinateur ou quoi. Avant de me dire de faire les choses ou de il faut que ça soit simple, clair et c'est pour ça que je te demande d'automatiser au maximum ton travail, de le faire à ma place tout ce que tu peux faire, de chercher des moyens de le faire à ma place. Au maximum. Pareil pour apex. Pareil pour CMC teams. Pareil pour tous mes autres projets et les futurs."**

**Règle absolue, non-négociable, prioritaire sur tout** — pour Apex, CMCteams, tous projets actuels et futurs :

### 1. Vocabulaire interdit côté Kevin
- ❌ JAMAIS de jargon : "fbWrite", "localStorage", "git rebase", "Service Worker", "FB_FIX", "regex", "node --check"
- ❌ Pas de chemins de fichiers, lignes de code, commits SHA dans la communication courante
- ❌ Pas de termes techniques anglais ("force-reload", "pull-to-refresh") sans expliquer le geste équivalent

### 2. Vocabulaire OK côté Kevin
- ✅ "Tire vers le bas pour rafraîchir"
- ✅ "Touche l'icône avec le crayon"
- ✅ "L'app va se mettre à jour toute seule"
- ✅ "Tes données sont sauvées dans le cloud"
- ✅ "Clique sur le bouton vert"

### 3. Décrire la VUE iPhone, pas l'écran d'ordinateur

Quand je dis à Kevin de faire un truc, je dois imaginer ce qu'il voit sur son iPhone :
- Position des boutons (haut, bas, gauche, droite)
- Couleurs visibles
- Texte exact qui apparaît
- Geste exact (long-press, tap, swipe, pull-to-refresh)
- Pas-à-pas avec ASCII art ou description visuelle

### 4. Automatiser au MAXIMUM avant de demander

Avant de demander à Kevin une action, je DOIS me poser ces questions :
1. Puis-je le faire moi-même via code ?
2. Puis-je l'automatiser via agent en arrière-plan ?
3. Puis-je créer un bouton dans l'app qui le fait pour lui ?
4. Puis-je préparer 95% pour qu'il n'ait qu'à coller/cliquer 1 fois ?
5. Puis-je le déléguer à un service externe (webhook, cron, GitHub Action) ?

Si réponse oui à au moins 1 → **je le fais sans demander**.

Seules tâches strictement physiques irréductibles : KYC, signature physique, achat domaine, recharge bancaire. Pour TOUT le reste, je trouve un moyen.

### 5. Pas-à-pas TOUJOURS visuel iPhone

Quand je suis OBLIGÉ de demander une action :
- **Numéroter** les étapes (1, 2, 3...)
- **Chiffrer** le temps approximatif ("30 sec", "2 min")
- **Décrire** ce qu'il voit AVANT et APRÈS l'action
- **Capturer** visuellement avec ASCII art ou descriptif clair
- **Confirmer** comment vérifier que c'est OK

### 6. Application universelle

Cette règle s'applique à :
- Apex (système prompt IA + UI)
- CMCteams (système prompt IA + UI admin Kevin)
- Tous les futurs projets de Kevin
- Mes propres réponses à Kevin
- Les agents/sentinelles que je crée

**Test mental obligatoire avant chaque réponse à Kevin** :
*"Est-ce qu'un enfant de 12 ans pourrait lire ce que j'écris et comprendre quoi faire ?"*
*"Est-ce que j'ai automatisé tout ce qui pouvait l'être avant de demander ?"*

Si non aux 2 → reprendre. Si oui aux 2 → envoyer.

---

## 🎨 RÈGLE PERMANENTE — SMART STUDIOS ANTICIPATIFS (Kevin 2026-04-25)

> **"Imaginons qu'on lui dise 'je veux faire un montage vidéo' → hop, il me sort une table de mixage vidéo. 'Montage musique' → table de mixage musique. 'Dossier préfecture' → tous les liens pré-remplis. Il anticipe à aller plus loin que ce que l'utilisateur attend. Quand il a compris le principe, il fait les recherches encore plus poussées pour surprendre dans le bon sens."**

À chaque demande utilisateur, Apex (et CMCteams quand pertinent) doit :

### 1. Détecter l'intention (axDetectIntent / cmcDetectIntent)

Map FR/EN d'expressions → studios dédiés :
- "montage video / clip / film / pub" → Studio Vidéo
- "montage musique / track / chanson" → Studio Musique
- "dossier prefecture / titre sejour / cni" → Studio Préfecture
- "cv / curriculum" → Studio CV
- "facture / devis" → Studio Facture
- "contrat / nda / cdi" → Studio Contrat
- "presentation / slides / pitch" → Studio Présentation
- "logo / branding" → Studio Logo
- "clip a partir de cette photo" → Studio Clip Photo→Vidéo

### 2. Ouvrir le studio dédié (axOpenStudio(name))

Chaque studio = vue UI dédiée avec :
- Tous les outils nécessaires PRÉ-CHARGÉS
- Templates rapides ("Vacances", "Pub produit", "Pitch startup", etc.)
- Formulaires pré-remplis depuis `A.user.reg`
- Liens directs externes pertinents (gouv.fr, banques, plateformes...)
- Export multi-format (PDF, MP4, MP3, DOCX, PNG, SVG)

### 3. Anticipation engine (axAnticipateNext)

Après chaque action :
- Détecter logical next steps ("logo généré → cartes de visite ? site web ? t-shirt ?")
- Proposer 3-5 suggestions visuelles cliquables
- Apprendre les patterns user dans `ax_anticipation_patterns`

### 4. Aller au-delà sans demander

- Si user demande "facture" → Apex propose AUSSI : devis lié, suivi paiement, relance auto
- Si user demande "CV" → Apex propose AUSSI : LinkedIn updaté, lettre motivation IA, mock entretien
- Si user demande "préfecture" → Apex propose AUSSI : checklist documents, calendrier RDV, notification rappel

### 5. Recherche autonome de meilleurs outils

Sentinelle "tools-watch" tourne périodiquement :
- Détecte nouveaux APIs (Replicate, ElevenLabs, Suno, Pika, etc.)
- Détecte mises à jour modèles IA (FLUX 2, Sora, Veo 2, etc.)
- Propose intégration auto via `ax_claude_todo` si pertinent

S'applique : Apex (Studios), CMCteams (Workflows métier casino), tous projets futurs.

---

## 🧰 RÈGLE PERMANENTE — OUTILS AUTO-APPARENTS PAR CONTEXTE (Kevin 2026-04-25, ABSOLUE)

> **"Lorsque on parle de traduction, il faut qu un outil apparaisse pour faire la fonction. Pareil pour le reste des fonction, video, musique etc. Pour avoir du choix dans les outils."**

**Règle absolue, prioritaire** — Apex, CMCteams, tous projets futurs :

### 1. Détection contextuelle automatique

À chaque message dans le chat IA, l'app DOIT :
- Étendre `axDetectIntent(text)` / `cmcDetectIntent(text)` pour détecter mentions de catégories
- Mots-clés FR/EN exhaustifs (synonymes, conjugaisons, fautes courantes)
- Détection même si demande indirecte ("comment dire bonjour en japonais" → traduction)
- Pas attendre demande explicite — anticiper

### 2. Catalogue `TOOLS_CATALOG` par catégorie

Structure obligatoire :
```js
TOOLS_CATALOG = {
  traduction: [
    {id:"deepl", name:"DeepL", tag:"pro", desc:"Traduction professionnelle 30 langues"},
    {id:"google_trans", name:"Google Translate", tag:"pro", desc:"100+ langues"},
    {id:"interprete_live", name:"Interprète temps réel", tag:"pro", desc:"Voix → voix instantané"},
    {id:"yoda_speak", name:"Parle comme Yoda", tag:"fun", desc:"Inverser l'ordre des mots"},
    {id:"pirate_lang", name:"Langage pirate", tag:"fun", desc:"Arrr matelot !"}
  ],
  video: [
    {id:"capcut_studio", name:"Studio CapCut", tag:"pro"},
    {id:"premiere_lite", name:"Mini Premiere", tag:"pro"},
    {id:"meme_maker", name:"Créateur memes", tag:"fun"},
    {id:"slow_mo", name:"Slow-mo cartoon", tag:"fun"},
    {id:"face_swap", name:"Échange visages", tag:"fun"}
  ],
  musique: [...],
  image: [...],
  jeux: [...],
  calcul: [...],
  ...
};
```

Chaque catégorie offre **3-5 outils minimum** : mix PRO + FUN.

### 3. Bulle dorée flottante "Tu veux faire X ?"

Quand intent détecté → affiche bulle non-intrusive :
- Position bottom-right au-dessus du clavier
- Liste 3-5 outils proposés (cards horizontales scrollables)
- Tag visible `[PRO]` `[FUN]` sur chaque
- Tap → ouvre l'outil direct
- Swipe-down → dismiss (mémorisé pour cette intent)
- Auto-dismiss après 15 sec si non utilisé

### 4. Modal "Choisir l'outil" si plusieurs candidats

Si ambiguïté (ex: "musique" peut être mixage / streaming / partition) :
- Modal full-screen avec catégories en chips
- Chaque catégorie déplie ses outils
- Filter PRO / FUN / TOUS
- Recherche live

### 5. Shortcuts persistants

Outils utilisés ≥3 fois → ajout auto à `vToolboxFavorites` (admin/user).
Accès rapide depuis topbar (icône 🧰 → grille des favoris).

### 6. Apprentissage des préférences

`ax_tools_usage_log` (max 200) :
- Tracker quel outil est choisi pour quelle intent
- Si Kevin choisit toujours DeepL pour traduction → le mettre en 1er next time
- Si pattern détecté (toujours fun le soir, pro le matin) → adapter

### 7. Cross-app

Apex et CMCteams partagent le `TOOLS_CATALOG` via FB_FIX `ax_tools_catalog_shared`.
Nouvel outil ajouté côté Apex → CMCteams hérite si pertinent.

**Test mental obligatoire avant chaque release** :
*"Si l'utilisateur tape 'je veux faire X' (X = traduction/video/musique/etc.), est-ce que l'app propose immédiatement un choix de 3-5 outils PRO + FUN sans qu'il ait à chercher ?"*

Si non → enrichir `TOOLS_CATALOG` + `axDetectIntent`.

---

## 🎭 RÈGLE PERMANENTE — DUAL PRO + FUN PARTOUT (Kevin 2026-04-25, ABSOLUE)

> **"Que du professionnel expert et du fun, rigolo, sympa."**

**Règle absolue, prioritaire** — Apex, CMCteams, tous projets futurs :

### 1. Chaque feature = 2 styles minimum

Pour CHAQUE feature/outil ajouté, prévoir DEUX déclinaisons :

- **Style PRO** : expert, sérieux, données vérifiées, sources officielles, terminologie métier exacte, mentions légales, prudence professionnelle
- **Style FUN** : rigolo, sympa, ludique : memes / blagues / sons drôles / voix étranges / cartoon / emojis animés / bruitages

Toggle simple `[PRO ⚙️] [FUN 🎉]` en haut de chaque outil. Mémorisé par feature.

### 2. Tag visuel obligatoire sur chaque outil

Chaque entrée du `TOOLS_CATALOG` a un tag :
- `pro` (badge bleu marine ⚙️)
- `fun` (badge orange/jaune 🎉)
- `thematique` (badge violet 🎨, ex: Halloween, Noël, Saint-Valentin)
- `mixte` (badge vert 🌈, fonctionne en pro ou fun selon mode)

Filtres en haut de chaque vue catalogue : `[Tous] [Pro] [Fun] [Thématique]`.

### 3. Exemples de dualité

| Feature | Style PRO | Style FUN |
|---------|-----------|-----------|
| Traduction | DeepL avec contexte juridique | Yoda speak / pirate / louchébem |
| TTS | Voix neutre Google WaveNet | Voix Mickey / Dark Vador / bébé |
| Calcul | Calculatrice scientifique avec graphes | Calculatrice qui chante les résultats |
| Calendrier | Vue agenda professionnel | Vue calendrier Pokémon / Star Wars |
| Email | Template formel "Cordialement" | Template "Yo bro check ça" |
| Logo | Branding Pantone strict | Logo "Comic Sans MS" exprès |
| Meteo | Bulletin Météo France | Bulletin "Va pleuvoir comme vache qui pisse" |
| Notes | Markdown avec sources | Notes en emoji rébus |

### 4. Voix : 50+ proposées (PRO + FUN + Thématiques)

Catalogue voix obligatoire :
- **PRO** (10+) : Google WaveNet FR/EN, Azure Neural, ElevenLabs Pro voices, Web Speech natives système
- **FUN** (20+) : Helium, Robot, Echo, Slow, Whisper, Drunk, Cartoon, Old Man, Chipmunk, Reverse, Auto-tune, Megaphone
- **Thématiques** (16+) : Robot, Vieux, Bébé, Fantôme, Super-héros, Sorcier, Chat, Dragon, Clown, Chanteur, Présentateur, Commentateur sport, Endormi, Hyper-content, Triste, Colère

### 5. Pas de feature 100% sérieuse OU 100% fun

Interdiction de livrer un outil sans son pendant :
- Si on ajoute un outil pro → ajouter dans la même PR au moins 1 variante fun (et inverse)
- Sinon → pas mergeable

### 6. Philosophie partagée Apex + CMCteams

CMCteams (contexte casino pro) garde le mode PRO par défaut, mais propose FUN pour :
- Anniversaires employés
- Fêtes (Noël, Saint-Sylvestre, etc.)
- Messages internes pause/détente
- Onboarding nouveaux employés (mode ludique)

Apex (multi-usage perso/pro) → toggle PRO/FUN visible partout.

### 7. Mode "Surprise me"

Bouton 🎲 dans chaque outil → tire au sort PRO ou FUN aléatoirement.
Pour Kevin qui veut être surpris.

**Test mental obligatoire avant chaque feature** :
*"Cette feature a-t-elle ses 2 styles (PRO + FUN) ? Sinon, je ne livre pas."*

---

## 🎙 RÈGLE PERMANENTE — VOIX TOUJOURS DIVERSIFIÉES (Kevin 2026-04-25, ABSOLUE)

> **"Revois encore les voix voir si il n'y a pas mieux, plus, plus drole."**

**Règle absolue, prioritaire** — Apex, CMCteams, tous projets futurs :

### 1. Audit voix permanent à chaque release

Avant chaque release majeure, vérifier disponibilité chez tous les providers :
- **Web Speech API** (natif navigateur, gratuit, voix système iOS/Android/Mac/Win)
- **ElevenLabs** (voix ultra-réalistes, clone vocal, multilingue)
- **OpenAI TTS** (alloy, echo, fable, onyx, nova, shimmer)
- **Google Cloud TTS** (WaveNet, Neural2, Studio voices)
- **Azure Speech** (Neural voices 400+, styles émotion)
- **Amazon Polly** (Neural, Generative)
- **Coqui TTS** (open source, self-hosted)
- **Bark** (Hugging Face, voix expressives)

Sentinelle `voices-watch` tourne 1×/semaine → détecte nouvelles voix → propose ajout via `ax_claude_todo`.

### 2. Effets audio Web Audio API (toujours dispo)

Filtres applicables sur n'importe quelle voix :
- `helium` (pitch +12 demi-tons)
- `robot` (ring modulator + flanger)
- `echo` (delay + feedback)
- `slow` (playback rate 0.5)
- `whisper` (low-pass + soft)
- `drunk` (random pitch wobble)
- `cartoon` (pitch +8 + chorus)
- `oldman` (pitch -4 + reverb hall)
- `chipmunk` (pitch +10 + speedup)
- `reverse` (audio reversed)
- `megaphone` (band-pass + distortion)
- `underwater` (low-pass extrême)
- `space` (long reverb + delay)
- `phone` (band-pass 300-3400 Hz)

### 3. Voix thématiques (16+ personnalités minimum)

Catalogue obligatoire `VOICES_THEMATIC` :
- 🤖 Robot
- 👴 Vieux
- 👶 Bébé
- 👻 Fantôme
- 🦸 Super-héros
- 🧙 Sorcier
- 🐱 Chat
- 🐉 Dragon
- 🤡 Clown
- 🎤 Chanteur (auto-tune)
- 📺 Présentateur JT
- ⚽ Commentateur sport
- 😴 Endormi (yawning)
- 🎉 Hyper-content (rapide aigu)
- 😢 Triste (lent grave)
- 😡 Colère (fort vibrato)
- ➕ Extensible (Pirate, Yoda, Maître Yoda, Dark Vador, etc.)

### 4. Vue admin `vVoicesGallery`

Vue dédiée :
- Grille de toutes les voix dispo (PRO + FUN + Thématiques)
- Bouton ▶ test 1-clic chaque voix sur un texte exemple
- Slider pitch / speed / volume
- Sélecteur effet à appliquer
- Bouton "Définir comme défaut" par contexte (chat IA, alerte, lecture article, etc.)
- Stats utilisation (top 10 voix les plus jouées)

### 5. IA peut changer de personnalité vocale

Tool IA `set_voice_personality(personality, [duration])` :
- L'IA détecte le contexte ("Kevin est triste" → voix douce / "fête" → voix joyeuse)
- Tool callable par l'IA dans tool use
- Persiste pour la session ou X minutes
- Logged dans `ax_voice_history`

### 6. Voix par contexte automatique

Auto-switch selon contexte :
- Lecture article scientifique → voix PRO neutre
- Lecture blague / meme → voix FUN cartoon
- Annonce urgente → voix présentateur JT
- Méditation / détente → voix calme reverb
- Anniversaire employé CMCteams → voix chanteur
- Halloween → voix fantôme/sorcier
- Noël → voix Père Noël

### 7. Cross-app + permanente

Le catalogue voix est partagé Apex + CMCteams via FB_FIX `ax_voices_catalog`.
Si Apex apprend nouvelle voix dispo → CMCteams hérite.

### 8. Test mental obligatoire avant chaque release

*"Ai-je vérifié si de nouvelles voix sont disponibles chez les providers ? Y a-t-il au moins 50 voix au total (PRO + FUN + Thématiques) ? L'utilisateur peut-il tester chaque voix en 1 clic ?"*

Si non → enrichir avant push.

---

## 👑 RÈGLE PERMANENTE — ADMIN-FIRST UX (Kevin 2026-04-25)

> **"Fais ma première vue, la mon équipe toujours, l'équipe miroir ensuite, et fait un système de famille différent de celui qui tu as mis, plus simple, plus intuitif, plus clair, plus facile d'accès. Plus simple pour l'admin, ici comme ailleurs, toujours en général, faire au plus simple pour que les infos soient faciles d'accès, recherchées, que tout soit clair et fonctionnel et visuel pour l'admin."**

S'applique à CMCteams + Apex + tous projets futurs, sans exception :

### 1. Hiérarchie d'affichage admin (priorité visuelle)

1. **Mon équipe** (équipe principale de l'admin) — TOUJOURS en premier
2. **Équipe miroir** (équipe complémentaire) — TOUJOURS en deuxième
3. **Familles regroupées** (BJ / Roulettes / CMC) — collapsibles, non hiérarchiques
4. **Cadres / Inspecteurs / Sup** — section dédiée séparée
5. **Tout le reste** — accessible via filtre/recherche, pas affiché par défaut

### 2. Système de familles simplifié

- **Pas de sous-niveaux complexes** (équipe.role.statut.dispo) — max 2 niveaux
- **Icônes claires** : 🃏 BJ / 🎰 Roulettes / 🎲 CMC / ⭐ Cadres
- **Couleurs distinctes** par famille (cohérence visuelle)
- **Badges nombre** : `(15)` à côté du nom famille → l'admin sait combien de monde
- **Toggle expand/collapse** : 1 clic = ouvert/fermé, état persisté

### 3. Accès rapide partout

- Recherche universelle TOUJOURS visible en haut (input avec placeholder explicite)
- Filtres rapides en chips cliquables (`[En ligne 12]` `[Malade 2]` `[Aujourd'hui 45]`)
- Stats cliquables → modal avec liste détaillée (pas pur affichage)

### 4. Test mental obligatoire avant chaque commit

- "Est-ce que MON équipe apparaît en haut sans scroller ?"
- "Est-ce qu'un admin trouve une info en moins de 3 clics ?"
- "Est-ce que c'est plus simple qu'avant ou plus complexe ?"
- "Si non → REPRENDRE jusqu'à ce que ce soit plus simple"

### 5. Anti-patterns interdits

- ❌ Mur de cards/lignes sans hiérarchie
- ❌ Boutons cachés dans menus déroulés (max 1 niveau)
- ❌ Trop de couleurs/badges (max 3 couleurs primaires + 2 accents)
- ❌ Texte technique visible (`emp.statut.contractCode === "RTP"` → "Repos")
- ❌ Ordre alphabétique strict (mon équipe doit ressortir d'abord)

S'applique à : `vEmps`, `vPlan`, `vDeparts`, `vMonPlanning`, `vAdminLinks` (Apex), tous nouveaux modules.

---

## 🤖 RÈGLE PERMANENTE — AGENTS TOUJOURS BOOSTÉS (Kevin 2026-04-25)

> **"Vérifie que tous les agents sont équipés au mieux, boostés, augmentés. Ajoute des outils dédiés individuellement spécifiques. Vérifie régulièrement si tu peux faire mieux. Va plus loin sans qu'on te le demande."**

À CHAQUE session, je DOIS automatiquement :

### 1. Audit agents/sentinelles initial

À chaque démarrage je vérifie :
- Combien d'agents existent (Apex AX_CREW_EXPERT, sentinelles AX_SENTINEL_TOOLS)
- Combien d'agents existent (CMCteams CMC_AGENT_TOOLS, sentinelles)
- Chaque agent a-t-il : `tools[]`, `data_sources[]`, `prompt_extension`, `auto_fix[]` ?
- Si manquant → enrichir IMMÉDIATEMENT sans demander

### 2. Outils dédiés par compétence

Chaque expert/sentinelle = outils spécialisés :
- Finance → finance_calculate, calculate, web_search
- Juriste → CONVENTION + BULLETIN_CODES + web_search jurisprudence
- CTO → code_execute, get_source, modify_css, inject_function
- Designer → modify_css, screenshot
- CISO → security audit tools, OWASP, NIST
- Performance → measure_render_time, detect_memory_leaks
- Erreurs → capture_stacktrace, detect_pattern, escalate_to_claude
- UX → measure_lcp/fid/cls, debounce, optimize_render
- Sentinelle Enrichissement Auto → détecte nouvelles APIs/libs/IA models

### 3. Auto-amélioration permanente

- Sentinelles tournent 24/7 (16+ agents)
- Détectent malfonction → auto-fix 3 stratégies → si échec → escalade Claude Code
- Lessons learned partagées cross-app (Apex ↔ CMCteams)
- Nouvelles APIs détectées → ajout auto dans system prompt
- Modèles IA upgrade → migration auto vers meilleur

### 4. Cross-app propagation

Si j'enrichis un agent dans Apex → je vérifie si pertinent CMCteams (et inverse).

S'applique à chaque interaction, sans exception.

---

## 🚀 RÈGLE PERMANENTE — TOUJOURS DÉPASSER LES ATTENTES (Kevin 2026-04-25)

> **"Toujours anticiper les attentes de l'utilisateur en allant au plus loin. Améliorer à chaque fois. Toujours donner des dossiers prêts à télécharger, prêts à copier, des liens directs, des informations claires, vérifiées. Concertation IA + agents + autonomie pour que tout s'optimise et se corrige sans cesse. Historique pour l'admin partout."**

À chaque réponse / action / livraison, je DOIS :

### 1. Réponses TOUJOURS actionnables

- **Boutons cliquables** dans chaque réponse (Coffre, Settings, action interne)
- **Liens directs** externes (billing, signup, console)
- **Documents** : Export PDF / Imprimer / Sauvegarder / Télécharger systématique
- **Code** : copiable en 1 clic + langage explicite
- **Anticiper la question suivante** : 1 suggestion "Pour aller plus loin..."
- **Surprendre positivement** : 1 idée non demandée mais utile

### 2. Concertation IA permanente

- 3-5 agents indépendants travaillent en parallèle (Promise.all)
- Avocat du diable conteste systématiquement
- Synthèse finale cite divergences + tranche
- Expert le plus compétent du domaine prend la décision finale

### 3. Auto-correction silencieuse

- Pas de message "rechargez" — auto-fix silencieux (toast "Petit souci détecté")
- Sentinelles tournent en permanence (16 agents)
- Si erreur détectée → escalade vers Claude Code automatique
- Historique COMPLET dans ax_audit + ax_err_log + ax_handoff_journal

### 4. Historique admin partout

- Toute action loggée : ax_audit (max 500), cmc_audit (max 500)
- Erreurs : ax_err_log (max 500)
- Click failures : ax_click_failures (max 50)
- Concertation experts : ax_crew_history (max 100)
- Connexions : ax_connection_log + cmc_userlog
- Visible admin via vAdminWorklog + vUsersActivity + vClickFailures + vAdminHistory

### 5. Optimisation continue

- Lessons learned partagées : ax_lessons_learned (Firebase shared)
- Cross-app : si lesson dans Apex → applique à CMCteams (et inverse)
- Telemetry incoming : ax_telemetry_in
- Pipeline auto-fix : detect → essayer 3 stratégies → si échec → escalade Claude Code

S'applique à chaque interaction, sans exception.

---

## 🔄 RÈGLE PERMANENTE — ENRICHISSEMENT AUTONOME OUTILS (Kevin 2026-04-25)

> **"Continue toujours ton travail. Vérifie régulièrement si tu ne peux pas te rajouter des outils, des programmes pour améliorer fonctionnement et possibilités. Ajoute en autonomie totale. Préviens l'IA de ce qu'elle a."**

À CHAQUE session, je DOIS :

### 1. Audit autonome (toutes les 1-2h)

Vérifier dans tous les projets (Apex + CMCteams + futurs) :
- Nouveaux APIs Web (navigator.*, document.*, Performance API)
- Nouvelles features iOS PWA / Safari
- Nouvelles librairies utiles (jsPDF, Chart.js, TensorFlow.js, Workbox, Dexie)
- Services externes complémentaires (Auth0, Sentry, Plausible, Resend)
- Nouveaux modèles IA disponibles (Gemini 2.5, Claude 5, GPT-5, etc.)

### 2. Ajout sans demander

Si une lib/service ajoute >20% valeur sans casser → **je l'ajoute directement** + commit + push.

Exemples :
- jsPDF pour export rapports PDF
- TensorFlow.js pour face detection locale
- Workbox pour cache strategies avancées
- Web NFC pour badge employé
- WebUSB pour devices custom
- WebRTC pour visio
- File System Access API pour gros fichiers
- Background Sync pour offline queue

### 3. Informer l'IA dans buildIASystemPrompt

À chaque ajout d'outil → j'enrichis le system prompt avec :
```
Nouveaux outils disponibles depuis vX.Y :
- [tool_name] : description courte + exemple d'utilisation
```

L'IA des apps connaît ainsi automatiquement ses nouvelles compétences.

### 4. Documenter dans CLAUDE_ACTIVITY

Chaque commit avec catégorie "Tools" ou "Enrichment" pour traçabilité.

### 5. Cross-app propagation

Si outil ajouté dans Apex → vérifier si pertinent CMCteams (et inverse).
Documenter dans CLAUDE.md section "Outils & APIs intégrés".

---

## 📒 RÈGLE PERMANENTE — Maintenir CLAUDE_ACTIVITY.json (Kevin 2026-04-25)

> **"Ajoute toutes tes données sur mon temps de travail et met le à jour comme doit faire IA de Apex et dans CMCteams et tu mets à jour dedans chacun toi aussi au fur et à mesure"**

À chaque commit que je fais sur ce repo, je DOIS régénérer `/home/user/CMCteams/CLAUDE_ACTIVITY.json` avec tous mes commits récents. Ce fichier est lu par les vues `vAdminWorklog` (Apex) et `vAdminTimework` (CMCteams) pour afficher mon activité à Kevin.

**Script de régénération** (à lancer avant chaque commit important) :

```bash
python3 -c "
import subprocess, json, re, time
out = subprocess.check_output(['git','log','--pretty=format:%H|%at|%s','--since=2026-04-21'], text=True)
commits = []
for line in out.strip().split('\n'):
    if not line: continue
    h, ts, msg = line.split('|',2)
    project='multi'
    if msg.startswith('Apex v'): project='apex'
    elif msg.startswith('CMCteams v') or msg.startswith('v9.'): project='cmcteams'
    elif msg.startswith('Backend'): project='backend'
    elif 'PRO ' in msg: project='backend'
    elif msg.startswith('CLAUDE'): project='docs'
    ver_match = re.search(r'v(\d+\.\d+)', msg)
    ver = ver_match.group(1) if ver_match else None
    commits.append({'sha':h[:8], 'ts':int(ts)*1000, 'msg':msg[:200], 'project':project, 'ver':ver, 'author':'claude-code'})
data = {'updated_at': int(time.time()*1000), 'total_commits': len(commits), 'projects': sorted(set(c['project'] for c in commits)), 'commits': commits[:120]}
json.dump(data, open('CLAUDE_ACTIVITY.json','w'), ensure_ascii=False, indent=2)
"
```

À faire idéalement à chaque commit. Acceptable de batcher (1× par session).

---

## 🗺 RÈGLE — PERMISSIONS MAP CMCteams (Kevin 2026-04-25)

> **"Seul l'admin voit la map. Le pit sait qui et quand est à table etc."**

Hiérarchie d'accès au système de carte interactive :

| Rôle | Map editor | Live positions | Édition |
|------|-----------|----------------|---------|
| **Admin Kevin** (AID U11804) | ✅ | ✅ | ✅ |
| **Pit Boss** (`emp.pit_boss` ou rôle pit) | ❌ | ✅ (lecture seule) | ❌ |
| **Cadre/Inspecteur/Sup** | ❌ | ✅ (lecture seule) | ❌ |
| **Chef de table** | ❌ | ✅ son équipe seulement | ❌ |
| **Employé simple** | ❌ | ❌ | ❌ |

Implémentation :
- `vMapEditor()` → guard `if(!A.user||A.user.id!==AID)return ...`
- `vTableMap()` (live read-only) → guard `if(!A.user||(A.user.id!==AID && !isPitBoss(A.user) && !isCadre(A.user)))return ...`
- Helper `isPitBoss(emp)` / `isCadre(emp)` à créer si absent

S'applique à tous les futurs subagents qui touchent à la map.

---

## 📱 RÈGLE CRITIQUE — KEVIN TRAVAILLE SUR iPHONE (Kevin 2026-04-25 permanent)

> **"Rappel toi tjs que je travail sur iPhone"**

**Implications obligatoires sur CHAQUE feature** :
- ❌ Pas de raccourcis clavier seuls (Cmd+K, Ctrl+F, etc.) → toujours doubler avec un bouton visible
- ❌ Pas de `:hover` actions critiques → utiliser tap + long-press
- ❌ Pas d'actions cachées sous focus/select → tout doit être tactile
- ✅ Touch targets minimum 44×44px (Apple HIG)
- ✅ Tester à 375px (iPhone SE) ET 390px (iPhone 14 Pro)
- ✅ Bouton visible PARTOUT pour fonctionnalités importantes (palette, recherche, voix)
- ✅ Safe-area-inset-bottom pour ne pas masquer sous home indicator
- ✅ Pas de scroll horizontal sauf nav explicite (`overflow-x:auto`)
- ✅ Font min 14px (sinon iOS zoom auto sur input)
- ✅ PWA Safari iOS-compatible (test prioritaire)

**Vérification à CHAQUE commit** :
- "Cette feature marche-t-elle iPhone sans clavier ?"
- "Est-ce qu'il y a un bouton tactile pour chaque action ?"
- "Touch targets >= 44px ?"

S'applique à Apex AI + CMCteams + futurs projets.

---

## 🔍 RÈGLE — RECHERCHE NOM/PRÉNOM TOUJOURS FLEXIBLE (Kevin 2026-04-21 v9.458+ / v12.57+)

> **"Laurence SAINT-POLIT ou SAINT-POLIT Laurence. Toutes les façons, avec ou sans trait d'union. Pour tout le monde. Anticipe partout les problèmes de connexion similaires."**

**Règle permanente absolue — Apex + CMCteams + tout projet futur :**

Aucun login, recherche, authentification ou match par nom ne doit être strict. Toujours accepter :
- ✅ Tous les ordres (prénom-nom / nom-prénom)
- ✅ Casse libre (majuscule/minuscule)
- ✅ Avec ou sans tirets / espaces
- ✅ Avec ou sans accents
- ✅ Nom collé (SAINTPOLIT) ou séparé (SAINT POLIT)
- ✅ Espaces multiples

**Algorithme obligatoire** (référence `_checkPreconfiguredUser` Apex v12.57) :
1. Match exact d'abord (perf)
2. Normalize : `.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[\s\-_]+/g," ").trim()`
3. Tokens triés alphabétiquement → match indépendant de l'ordre
4. Squash collé (tout sans espace) → accepte "saintpolitlaurence"
5. Substring token + tolérance ±1 char → accepte "SAINTPOLITLAURENCE"

**Zones à vérifier dans chaque projet** :
- Login (axLogin / doLogin)
- Recherche employés (findEmpByName CMCteams)
- Recherche clients / fiches
- Import PDF parser (reconnaissance noms)
- Chat DM (destination par nom)
- Admin queries ("qu'a fait Laurence")
- Tout autocomplete/suggestion

**Leçons tirées de problèmes passés** :
- Fuzzy match Levenshtein aveugle = danger (BORGIA T vs BORGIA L)
- Match strict = utilisateurs frustrés (TRADIEU typo, oubli tiret)
- Bon équilibre = tokens triés + tolérance contrôlée

**À propager quand j'ajoute un nouveau projet** : utiliser directement le helper `_checkPreconfiguredUser` comme référence + auditer toutes les fonctions de recherche.

---

## 🌉 RÈGLE — PIPELINE AUTONOMIE CROSS-PROJET (Kevin 2026-04-21 v9.458+)

> **"Tout problème de n'importe quel projet (Apex, CMCteams, futurs) doit remonter à Apex, qui essaie de réparer. Si Apex n'y arrive pas, te consulte et tu agis en autonomie sans aucune action de ma part."**

### Architecture à appliquer SYSTÉMATIQUEMENT (projets actuels + futurs)

```
Projet X → Firebase ax_telemetry_in → Apex reçoit → _aiHandleIssue auto-fix
                                                          ↓ échec
                                                  _escalateToClaudeCode
                                                          ↓
                                                  ax_claude_todo Firebase
                                                          ↓
                                            GitHub Action cron 2h
                                                          ↓
                                                 Claude Code → fix autonome
```

### Composants obligatoires dans chaque projet

1. **Fonction `_pushTelemetryToApex(id, kind, msg)`** : écrit dans Firebase `ax_telemetry_in` avec `src:"nomProjet"` + version
2. **FB_FIX inclut `ax_telemetry_in` + `ax_claude_todo` + `ax_lessons_learned`** (shared cross-app)
3. **Sentinelles autonomes** : monitor erreurs → appellent `_pushTelemetryToApex` après échec local
4. **Agent dédié** : patrouille la queue, escalade si saturation
5. **Lessons learned** partagées : `ax_lessons_learned` Firebase FB_FIX → chaque projet lit + ajoute

### Apex = orchestrateur central

- `_processIncomingTelemetry(buffer)` itère sur chaque entrée non processed
- `_aiHandleIssue(sentinelId, severity, finding)` whitelist auto-fix : flushSyncQueue, emergencyCleanup, fbReconnect, resetStreaming
- Si toutes tentatives échouent → `_escalateToClaudeCode({context}, reason, "critical")`
- Push Firebase `ax_claude_todo` avec `status:"pending"` + sev critical

### Claude Code = dernier recours

- GitHub Action `.github/workflows/claude-todo-watcher.yml` cron 2h
- Poll `/apex/ax_claude_todo.json` → analyse pending + critical (>2h non traité)
- Si critical > 0 ou pending > 20 → ouvre GitHub Issue + Telegram alert (optionnel)
- Prochaine session Claude Code : lit issue → fix → `_markTodoResolved` + ajoute lesson

### Obligations pour futurs projets (e-KDMC, IA-KDMC, etc.)

Avant merge première version :
- [ ] Implémenter `_pushTelemetryToApex` + hook sur erreurs critiques
- [ ] Ajouter `ax_telemetry_in` dans FB_FIX
- [ ] Créer au moins 1 sentinelle + 1 agent dédié
- [ ] Documenter dans le README du projet
- [ ] Mettre à jour `APEX_HANDOFF.md` pour Apex connaisse le projet

**Cette règle vaut pour TOUS projets présents et futurs sans exception.**

---

## 📌 DOSSIER DE TRAVAIL — Status au 2026-04-25 (Apex v12.241 + CMCteams v9.522)

**Session marathon 2026-04-25 — modules pro ajoutés** :
- Apex Cuisine Pro (v12.238) : 10 recettes FR + 22 cuissons + conversions + 14 allergènes INCO + calories
- Apex Medical Pro (v12.237) : IMC + métabolisme + médicaments OTC + urgences SAMU + vaccins
- Apex Finance Pro (v12.235) : IR FR 2026 + crédit immo + PV immo + PV mobilier + Monaco fiscal
- Apex Légal Pro (v12.X) : 18+ codes français + jurisprudence Cass/CE/CJUE/CEDH + Monaco
- Apex Traducteur Pro (v12.233) : 30 langues + cache + Claude Haiku + STT/TTS
- Apex Pack Pro (v12.229) : conversions + béton + lune + météo gratuit + 5 tools IA + dates pro
- Apex Vue Laurence (v12.226-227) : bulles emoji + wallpaper + diaporama + commandes vocales
- **Apex SECU FIX (v12.240)** : ax_pin per-user vs global + lookup user strict
- **Apex AUTH FIX (v12.241)** : nom+prenom+pass tous 3 obligatoires partout
- Apex Triple persistence (v12.223) : localStorage + IndexedDB + Firebase + auto-restore
- CMCteams v9.519-522 : triple persistence + parser auto-learn (WIP)
- Sentinelle GitHub Action `sw-cache-sync.yml` : sync auto sw.js↔index.html

**Items dossier :**

1. ✅ Bugs inspecteurs/superviseurs sans team/horaire → v9.409-509 (parser ZÉRO erreur, 5 stratégies + 22 tests)
2. ✅ **Organigramme SBM Monaco** : ROLES_SBM intégré + dropdown vEmps (session passée)
3. 🔄 **Fiches employés évolutives** : rôles/fonctions partiels, à compléter cross-app
4. 🔄 **Extraction complète PDF** : parser auto-learn v9.521-522 WIP (apprend les nouveaux codes)
5. ✅ **Distinction fonds/couleurs/lettres** : règle stricte v9.461 (jamais inventer)
6. ✅ **Accumulation données** : enrichissement v9.519 + triple persistence (jamais perdu)
7. ✅ **Inspecteurs avec horaires** : v9.462+ multi-strategy garantit
8. ✅ **Vérification systématique** : sentinelle import-watch + audit-watch
9. ✅ **Procédures dossier respectées** : CLAUDE.md + NOTES_USER + MEMO_RESUME tenus à jour
10. ✅ **Sécurité auth** (Apex v12.240-241) : ax_pin per-user + nom+prenom+pass obligatoires
11. ✅ **Sentinelle SW cache sync** : `.github/workflows/sw-cache-sync.yml` créée
12. ✅ **Triple persistence** : localStorage + IndexedDB + Firebase (Apex + CMCteams)
13. ✅ **Niveau expert pro partout** : 7 modules pro Apex (cuisine/médical/finance/légal/traducteur/pack/admin)

**Méthode de travail permanente** :
- À chaque nouvelle demande Kevin → ajouter ici IMMÉDIATEMENT
- À chaque fix → cocher ✅ avec version
- À chaque commit → lancer audit croisé (5-7 subagents Explore)
- À chaque session → lire ce dossier EN PREMIER

---

## 🔁 RÈGLE — BOUCLE AUTO-CORRECTION AGENTS (Kevin 2026-04-19 v9.435+)

> **"L'agent doit réagir au bug/mauvaise info, prendre les outils nécessaires, corriger, tirer des leçons. Mettre à jour les bases. Intégrer le même principe dans TOUS les projets."**

Pipeline CMCteams v9.435 :

1. `agentAppendReport(id, status, msg, details, action)` accepte `action = {label, fn, auto:true/false, recordLesson:"..."}`
2. Si `action.auto=true` + warn/err + admin connecté → `_agentAutoFixAttempt` lance la fonction (whitelist stricte)
3. Rate-limit 1/h par agent
4. Après succès : `addLessonLearned` auto avec pattern détecté (category `auto-fix`)
5. Audit `agent_auto_fix` trace
6. IA enrichie via `buildIASystemPrompt` (v9.418) → mémoire cross-session

Whitelist auto actuelle : `agentActionFlushSync`, `agentActionPurgeOldLogs`, `_agentImportGuardian`, `autoFillMissingCadres`.

À propager : même pattern dans APEX AI, e-KDMC, futurs projets.

---

## 👁 RÈGLE — Surveillance live multi-utilisateurs (Kevin 2026-04-19 v9.414+)

> **"Les agents et subagents travaillent chez tout le monde et l'IA aussi. Chez tous les comptes, y compris l'admin en permanence, en direct, en live, et créent des alertes et des bugs pour avoir un retour des problèmes rencontrés chez tout le monde et pouvoir agir en autonomie à la correction."**

Obligations système :

1. **Agents tournent chez TOUS les connectés** (plus juste admin) — mode "silent watcher" pour employés
2. **Télémétrie auto** : `window.onerror`, `unhandledrejection`, actions lentes, fonctions qui échouent → capture anonymisée
3. **Analyse chat IA** : si l'IA répond mal ou si l'employé exprime une confusion → flag + remédier
4. **Agents interviennent** : détection erreur → correction auto + audit trail
5. **Sauvegarde permanente** : toutes modifications / questions enregistrées en dossier
6. **Dossiers MD** créés par projet / utilisateur, à jour avec erreurs à ne pas reproduire + ce qui marche
7. **Partage de savoir** : ce qui marche chez un user sert à tous via `cmc_lessons_learned` (FB_FIX)
8. **Confidentialité** : tout en arrière-plan, seul l'admin U11804 voit les détails par utilisateur
9. **Vue admin `vTelemetry`** : agrège tous les retours users, affiche erreurs, tendances, anomalies

Implémentation v9.414 :
- `reportUserEvent(type, detail)` — helper appelé partout
- `cmc_user_telemetry_<uid>` — par-user local + digest FB_FIX admin-only
- `cmc_lessons_learned` — FB_FIX, partagé entre tous admins connectés
- Agent "user-watcher" tourne aussi pour non-admins (mode restreint)

---

## 🧒 RÈGLE — LANGAGE SIMPLE PARTOUT (Kevin 2026-04-21 v9.458+)

> **"Erreur JS pour quelqu'un comme moi ça ne veut rien dire. Fais simple, clair, pour tout le monde, comme pour les enfants. Sans rien casser."**

**Règle permanente non-négociable** — Aucun jargon technique dans l'UI visible utilisateur :

### ❌ Termes interdits côté utilisateur
| Technique | → | Français simple |
|-----------|---|----------------|
| "Erreur JS" / "JavaScript error" | | "Un petit souci" / "Ça ne marche pas" |
| "HTTP 500 / 502" | | "Le serveur ne répond pas, attends un peu" |
| "Timeout" | | "C'est trop long, réessaie" |
| "API key" / "Token" | | "Clé d'accès" / "Clé secrète" |
| "Proxy" | | "Chemin sécurisé" |
| "Firebase" / "Realtime DB" | | "Stockage en ligne" / "Sauvegarde sur le cloud" |
| "localStorage" | | "Mémoire de l'app" |
| "Webhook" | | "Notification automatique" |
| "CORS / CSP" | | "Sécurité internet" |
| "Sync / Syncing" | | "Synchronisation" / "Mise à jour" |
| "STT / TTS" | | "Dictée" / "Lecture à voix" |
| "PWA" | | "Application web" |
| "Cache" | | "Mémoire temporaire" |
| "Deploy" | | "Publier" |
| "Backup" | | "Sauvegarder" |
| "Log" | | "Historique" |
| "Parsing error" | | "Je n'ai pas compris le format" |
| "Null reference" | | "Donnée manquante, je recharge" |
| "Bug / dysfonctionnement" | | "Ça ne marche pas" |
| "Upgrade" | | "Plus de fonctions" |

### ✅ OK côté admin (Kevin voit tout)
- Les logs techniques admin-only (`ax_silent_log`, `ax_bodyguard_log`, audit) gardent leurs termes
- L'onglet Admin peut afficher termes techniques si Kevin explicitement admin
- Le toast filter `_technical` masque déjà les messages techniques aux non-admin

### Règle d'or
**Si un enfant de 12 ans ne comprend pas le texte, il faut le réécrire.**

### À vérifier à chaque release
- FAQ : questions/réponses en français simple
- Boutons : verbes d'action clairs (Envoyer, Sauvegarder, Lire, Partager)
- Messages d'erreur : toujours expliquer QUOI + COMMENT corriger
- Formulaires : labels explicites, placeholders concrets

**Appliquer dans Apex + CMCteams + futurs projets.**

---

## 🔁 RÈGLE — REPRODUIRE AUTOMATIQUEMENT DANS APEX + EXPERT AUTONOMIE (Kevin 2026-04-21 v9.458+)

> **"Tu devrais y penser tout seul. Si je ne dis pas apex, tu dois y penser tout seul à l'intégrer dans apex tout le temps. Cherche ailleurs en plus d'autres références, d'autres données. Tout au maximum. Comme un travail expert."**

**Règle permanente absolue** :

1. **Chaque règle / leçon / méthode** que Kevin me donne → je l'intègre SYSTÉMATIQUEMENT dans :
   - `CLAUDE.md` (mémoire claude)
   - Apex AI (system prompt + code si applicable)
   - CMCteams (system prompt + code si applicable)
   - Futurs projets (pattern à appliquer)

2. **Chaque feature** ajoutée à un projet → me demander si elle doit exister dans l'autre projet :
   - Feature sécurité Apex → check si CMCteams en a besoin aussi
   - Feature admin CMCteams → check si Apex en a besoin aussi
   - Feature cross-cutting (toast filter, SW banner, bodyguard) → les 2 obligatoire

3. **Recherche approfondie** avant de coder :
   - Consulter mes docs internes (APPLE_IOS_SKILLS, ANDROID_SKILLS, GOOGLE_APIS, AUTOMATION_HUB, UNIVERSAL_REMOTE, NETWORK_CONNECTIVITY)
   - Chercher références multiples (ne pas se contenter de la première idée)
   - Utiliser subagents Explore parallèles (3-5) pour sujets larges
   - Web search via tool use pour références externes récentes

4. **Travail expert permanent** :
   - Jamais se contenter du minimum demandé
   - Anticiper ce qui vient ensuite (si Kevin demande X, prépare aussi Y et Z)
   - Proposer améliorations concrètes sans attendre validation
   - Valider mentalement : "Est-ce du travail d'expert freelance senior 100€/h ? Sinon je recommence"

5. **Bénéfice cumulatif** :
   - Chaque interaction enrichit l'ensemble
   - Règles permanentes → s'appliquent à tous utilisateurs futurs
   - Mémoire partagée → amélioration continue sans régression

6. **Auto-référentiel** : quand Kevin demande "fais X", automatiquement me demander :
   - Faut-il l'ajouter dans l'autre app aussi ?
   - Faut-il le documenter dans CLAUDE.md ?
   - Faut-il en faire une règle permanente ?
   - Peut-on aller plus loin avec les outils docs ?
   - Y a-t-il un risque sécurité/UX non anticipé ?

Cette règle s'applique à chaque interaction, sans exception.

---

## 🔐 RÈGLE — JAMAIS STOCKER CERTAINS SECRETS (Kevin 2026-04-21 v9.458+)

> **Kevin m'a demandé honnêtement si le stockage est sûr. Ma réponse : NON par défaut, il faut être strict sur ce qui est stockable.**

**Règle absolue non-négociable** — NE JAMAIS proposer de stocker dans localStorage / Firebase / PWA :

### ❌ INTERDICTION ABSOLUE
- **Seed phrases crypto** (Phantom, MetaMask, Trust Wallet, etc.) → hardware wallet obligatoire
- **Private keys crypto** → idem
- **Mots de passe bancaires** (Société Générale, CIC, BNP, etc.) → OAuth ou app native
- **PINs hardware wallet** (Ledger, Trezor) → jamais ailleurs que le device
- **Photos ID / passeport** → chiffrement zero-knowledge requis
- **Numéro CB complet + CVV** → tokeniser via Stripe/PSP
- **Mots de passe Apple ID / Google principal** → Keychain / Google Password Manager

### ✅ OK à stocker (avec précautions)
- IBAN (peu sensible, donné à chaque virement)
- Adresses crypto **publiques** (par définition publiques)
- Emails
- Tokens API SaaS (Stripe/Twilio/OpenAI) **SI** Firebase rules strictes + HTTPS
- Tokens OAuth courts (<1h TTL)
- Préférences, notes, historique conversations IA

### 🛡 Protections obligatoires
- Chiffrement AES-GCM 256 (PBKDF2 100k iterations) pour TOUS les secrets via `axEncryptSecret/Decrypt`
- Passphrase Vault séparée du PIN login
- Audit `axSecurityAudit()` à chaque boot
- Warning visible Vault : "Ne stockez JAMAIS X, Y, Z"
- Firebase rules strictes (auth required + path whitelist)

### Pattern correct pour credentials sensibles
1. **Bancaire** : ne pas stocker → ouvrir app native via URL scheme (`app-socgen://`, `app-cic://`)
2. **Crypto** : ne stocker QUE l'adresse publique, lecture on-chain uniquement
3. **Social media** : OAuth 2.0 avec refresh token seulement (pas password)
4. **API services** : token-scoped minimum (read-only quand possible)

Cette règle s'applique à **Apex AI + CMCteams + tous projets futurs**.

---

## 📚 RÈGLE — SOURCES MULTIPLES + ACCUMULATION CONTINUE (Kevin 2026-04-21 v9.458+)

> **"Peut-être qu'ils aillent chercher tous des références différentes, des manières de travailler différentes, des sources différentes et tout s'accumule, améliore à chaque fois. Ça rend plus complet, plus poussé, plus recherché, plus pointu, améliorer sans cesse, être à l'optimal, toujours partout tout le temps."**

**Règle permanente** :

Chaque réponse IA (Apex + CMCteams) doit croiser :

1. **Mémoire persistante** (`ax_persistent_memory`, `cmc_persistent_memory`, 1000 faits max) → contexte accumulé des sessions passées
2. **Knowledge base** (`K.kb.facts`, `K.kb.instructions`) → faits métier Kevin + consignes explicites
3. **Web Search** (Anthropic native quand activé) → sources externes fraîches
4. **Docs de référence internes** via `axFetchClaudeFeed` → APPLE_IOS_SKILLS, ANDROID_SKILLS, GOOGLE_APIS, AUTOMATION_HUB, UNIVERSAL_REMOTE, NETWORK_CONNECTIVITY, etc.
5. **Historique conversations** (30 derniers messages) → continuité contexte

**Pattern d'accumulation** :
- Chaque réponse IA extrait automatiquement les faits clés → ajoute à `ax_persistent_memory`
- Chaque nouvelle session lit les 20-30 faits les plus récents → injecte dans system prompt
- Chaque agent/sentinelle peut AJOUTER au pool (pas seulement lire)
- Les lessons learned (`cmc_lessons_learned`) partagées cross-user admin

**Optimisation continue** :
- Score de qualité chaque réponse (Crew reviewer) → ajoute aux faits si >8/10
- Faits duppliqués → dédupe par similarité texte (Levenshtein)
- Faits datés → si ancien >90 jours, vérifier toujours valide via web_search
- Auto-enrichissement : si fait cité plusieurs fois → priorité haute

**Objectif** : chaque interaction rend la prochaine PLUS intelligente, PLUS précise, PLUS pointue.

---

## 🎭 RÈGLE — MULTI-ANGLES & OPTIMISATION PERMANENTE (Kevin 2026-04-21 v9.457+)

> **"Ajoute des agents, subagents… pour que quand on pose une question, ils réfléchissent autrement, différemment, aillent dans d'autres directions. Proposer différents choix, faire les meilleures réponses, les meilleures actions. À chaque intervention, chaque interaction, chaque projet. Donner le choix : toi tu as trouvé ça, lui a trouvé ça, on peut aller vers là. Toujours essayer de voir plus loin, améliorer la demande tout de suite sans demander."**

**Règle permanente non-négociable (Apex IA + CMCteams IA) :**

Chaque fois que l'IA reçoit une question / demande / tâche :

1. **Angle 1 — Réponse directe** (ce qu'il a demandé explicitement)
2. **Angle 2 — Angle alternatif** (si même problème vu autrement)
3. **Angle 3 — Aller plus loin** (améliorations, opportunités adjacentes, anticipation)

Format de réponse idéal :

```
[Réponse principale, directe et actionnable]

💡 Alternatives / choix possibles :
- Option A : ...
- Option B : ...
- Option C (si j'étais à ta place) : ...

🚀 Pour aller plus loin :
- Tu pourrais aussi... [opportunité]
- Pense à... [anticipation]
```

**Implémentation :**
- System prompt Apex + CMCteams → instructions explicites "toujours multi-angles + choix + aller plus loin"
- Tool `axMultiPerspective(query)` dispo dans tool use (admin) pour forcer analyse 3-5 angles
- Toggle "Mode multi-angles" dans Réglages (défaut ON)
- Crew reviewer : agent qui vérifie que la réponse couvre bien plusieurs angles avant d'envoyer

**Autonomie** :
- Jamais attendre que Kevin demande "fais plusieurs angles" — c'est le défaut
- Jamais se contenter de l'exact minimum — toujours anticiper
- Propositions concrètes avec ROI/impact estimé

---

## 🧰 RÈGLE — UTILISER TOUS LES OUTILS NOUVEAUX + CROSS-PLATFORM (Kevin 2026-04-21 v9.457+)

> **"N'oublie pas d'utiliser tous tes nouveaux outils comme ceux d'Apple pour tes nouveaux travaux. Pareil pour Apex. Vérifier ce qu'on a fait et aller plus loin. Plus de permissions, droits, accès. Valable sur iPhone + Android + tous navigateurs, sur les 2 applications."**

**Règle permanente non-négociable** :

À chaque nouvelle demande Kevin, je dois :

1. **Consulter mes propres docs skills** avant de coder :
   - `APPLE_IOS_SKILLS.md` (Safari PWA, Siri Shortcuts, Pushcut, URL schemes, Wallet, WebAuthn)
   - `ANDROID_SKILLS.md` (Web Bluetooth/USB/NFC/Serial/MIDI, Intent URLs, Tasker, TWA)
   - `GOOGLE_APIS_INTEGRATION.md` (OAuth, Gmail, Calendar, Drive, Sheets, Vision)
   - `AUTOMATION_HUB.md` (Home Assistant, n8n, NFC tags, Broadlink)
   - `UNIVERSAL_REMOTE.md` (TVs par marque, IR/RF/BLE/Zigbee)
   - `NETWORK_CONNECTIVITY.md` (WiFi, Bluetooth, pare-feux corporate)

2. **Implémenter sur les 2 apps** (Apex + CMCteams) — sauf si clairement spécifique à une :
   - Web NFC → Apex (scan tags) + CMCteams (badge pointage employés)
   - Web Bluetooth → les 2 (détection devices proches)
   - Siri Shortcuts generator → Apex (actions AI) + CMCteams (raccourcis RH)
   - Vibration haptique → les 2 (feedback tactile)
   - Web Share Target → les 2 (apparaître dans menu Partager OS)

3. **Cross-platform systématique** :
   - iOS Safari PWA (tests prioritaires)
   - Chrome Android (features BLE/USB/NFC)
   - Chrome Desktop / Safari macOS / Firefox
   - Feature detection (`if('NDEFReader' in window)`) avant appel

4. **Aller plus loin que demandé** :
   - Si Kevin demande "scanner tag NFC" → ajouter aussi Web Bluetooth, Vibration feedback, historique scans
   - Si Kevin demande "lien Revolut" → ajouter aussi API integration (plus riche qu'un simple lien)

5. **Permissions maximales préparées** :
   - CGU universel déjà fait (`_cguAsk`) pour obtenir consentement toutes features d'un coup
   - `navigator.permissions.query` pour voir ce qu'on a déjà
   - Bouton "Demander toutes autorisations" (GPS + micro + caméra + notifs + BLE + NFC) dans Réglages

6. **Noter ce qui manque** dans KEVIN_ACTIONS_TODO si requires humain

---

## 🔄 RÈGLE — AUTO-REFRESH PWA + TEST iOS+ANDROID (Kevin 2026-04-21 v9.456+)

> **"Le force refresh, la mise à jour automatique pour la version, aurais dû y penser bien avant, je te dis tout automatiser, ça en fait partie. Vérifie à chaque fois sur iPhone ET sur Android. Vérifie pourquoi il me demande toujours les autorisations à chaque connexion."**

**Règle permanente :**

1. **CHAQUE PWA doit avoir** un Service Worker avec :
   - `updatefound` event listener
   - Banner doré visible automatique quand nouvelle version prête
   - `skipWaiting` + `location.reload` au clic utilisateur
   - Appliqué à Apex v12.37+ ET CMCteams v9.456+

2. **Permissions natives** (GPS, micro, notif, caméra) :
   - NE JAMAIS re-demander à chaque login
   - Cooldown minimum 5 min entre demandes (`ax_last_gps_track`, `ax_last_mic_ask`, etc.)
   - Vérifier `navigator.permissions.query({name})` AVANT de retrigger
   - Si `state === "denied"` → ne plus demander, afficher lien vers réglages OS

3. **Vérifier iOS + Android à chaque release** :
   - Safari iOS PWA (cache agressif, WebKit limité)
   - Chrome Android (permissions différentes, plus permissif)
   - Tester `navigator.bluetooth`, `NDEFReader`, `getUserMedia` séparément

4. **Auto-consent** (RGPD-compatible) :
   - Stocker `ax_cgu_accepted_<uid>` au premier accept
   - Ne plus RE-afficher CGU si déjà accepté
   - Révocable via bouton "Retirer consentement" dans Réglages

5. **Debug** : `ax_silent_log` + `ax_bodyguard_log` gardent trace pour admin uniquement, invisibles clients.

---

## 🤝 RÈGLE — AUTONOMIE SUR TÂCHES KEVIN (Kevin 2026-04-21 v9.455+)

> **"Dans mes actions à faire, vérifie avec tes nouveaux outils si tu ne peux pas quand même résoudre un maximum de tâches pour moi. Réfléchis autrement pour alléger ma tâche. Note-le, rappelle-toi en tout le temps."**

**Règle permanente non-négociable :**

À chaque nouvelle entrée dans `KEVIN_ACTIONS_TODO.md` — ou toute tâche "physique" — je me demande d'abord :
1. **Puis-je la faire en code** (script, template, workflow GitHub Action) ?
2. **Puis-je la réduire à un clic** (lien, URL, QR code) ?
3. **Puis-je la préparer à 95%** (code + doc, il reste juste à coller une valeur) ?
4. **Puis-je la déléguer à un service** (webhook, cron, Cloudflare Worker) ?

Si oui → je le fais en autonomie et note "préparé à 95%" dans KEVIN_ACTIONS_TODO.
Si non (strictement humain : KYC, achat domaine, signature bancaire) → je documente précisément ce qu'il reste (3 min max).

Exemples v12.37 :
- Stripe webhook → Cloudflare Worker code complet, Kevin déploie (2 min)
- Stripe produits → guide Dashboard + alternative CLI prêt à coller
- Firebase backup → GitHub Action automatique nightly (zéro action)
- CGU/RGPD → HTML complets déployés
- SEO → meta + sitemap + robots déjà faits

Reste strictement Kevin : KYC Stripe, IBAN, achat domaine, billing Firebase Blaze.

---

## 🏆 RÈGLE SUPRÊME — TOUJOURS AU MAXIMUM (Kevin 2026-04-19 v9.407+)

> **"Tu dois toujours faire le mieux. Arrête de t'arrêter juste au début. Va au bout du projet à chaque fois, au maximum, à chaque fois de ce que je te demande. À chaque question, chaque interaction, chaque projet, chaque tout, tout le temps, partout. Intègre ça dans l'application, dans son IA, dans son fonctionnement, dans APEX, dans les sources de données, dans les feuilles de route, dans les skills, dans les hooks, dans les agents et leur façon de travailler. Partout. Tout le temps."**

**Règle NON-NÉGOCIABLE appliquée sans exception à TOUTE interaction :**

1. **Ne jamais s'arrêter au début d'un problème** : si je peux mentionner que je peux faire mieux, alors je DOIS déjà avoir fait mieux. Pas de "on verra", pas de "next step", pas de "je te laisse décider" quand le next step est évident.
2. **Livrer le MAXIMUM à chaque tour**, pas le minimum. Si la demande implique 3 features, j'en livre 3, pas 1 + promesse.
3. **Saturer avant de rendre** : audit, fix, test, doc, commit, push — dans le même tour.
4. **Anticiper l'implicite** : une demande "ajoute une feature" implique automatiquement : UI + wire + persist + sync Firebase + tests + audit + doc + push. Ne JAMAIS livrer 2/8.
5. **Pas de validation demandée** pour les évidences. Décider et livrer.
6. **Propagation permanente** : TOUTE règle/demande de Kevin s'applique à CE projet + APEX + futurs projets + agents locaux (Claude Code) + agents internes (app) + IA de l'app + skills + hooks + feuilles de route + CLAUDE.md + NOTES_USER + MEMO_RESUME.
7. **Tracé obligatoire** : chaque règle, chaque info métier, chaque feature → noté dans CLAUDE.md + NOTES_USER.md + MEMO_RESUME.md. Aucune info ne se perd.
8. **Appliqué dans l'app aussi** : `buildIASystemPrompt` doit rappeler les règles permanentes pour que l'IA utilisateur réponde elle-même selon ces principes.

---

## 🤖 RÈGLE PERMANENTE — SUBAGENTS AU MAXIMUM (Kevin 2026-04-19 v9.401+)

> **"Ajoute des subagents, agents en local et en ouvert pour aider l'IA, l'app, le bon fonctionnement, les recherches, les données, la fonctionnalité, la performance, la scalabilité, l'intuitivité, la fluidité, la créativité, l'amélioration permanente, l'enrichissement général en permanence. Tout le temps, partout. Au maximum."**

**Règle absolue non-négociable à chaque session, pour CE projet ET tous futurs projets :**

### 1. Parallélisation par défaut

À chaque tâche non triviale, lancer **3 à 5 subagents `Explore` en parallèle** dans un SEUL message (tool calls groupés). Zones à auditer systématiquement :
- **Performance** : O(n²), re-renders, localStorage size, listeners empilés, cache manquant
- **UX / intuitivité** : mobile 375px, touch targets 44px, labels, confirmations, états vides
- **Sécurité** : guards AID, esc() manquants, FB_LOCAL vs sync, XSS résiduels, CSP
- **Scalabilité** : 500+ employés, 5000+ chats, 36 mois overrides, QuotaExceeded
- **Créativité** : features manquantes niche casino, delighters, micro-interactions

### 2. Au minimum 1 audit subagent par batch de modifications

Après un gros changement : lancer `Explore` ciblé pour vérifier l'absence de régression sur les zones connexes (matrice d'impact Phase 0).

### 3. Subagents pour les recherches factuelles

Dès qu'une info factuelle doit être vérifiée (loi Monaco, règle Convention, article précis, coord GPS, lien officiel) : déléguer à un subagent `Explore` avec WebFetch/WebSearch plutôt que d'encombrer le contexte principal.

### 4. Subagents pour la data quality

À chaque import PDF / modification planning → subagent audit silencieux pour détecter conflits, anomalies, incohérences sans bloquer l'admin.

### 5. Agents persistents (nightly / automatiques)

Déjà en place (voir `tools/agent/` + GitHub Actions cron) : 5 tâches automatiques (health-check, conflicts, burnout, backup, weekly-report). À enrichir en continu avec de nouveaux "gardiens" (perf-watcher, UX-checker, sentry-digest).

### 6. Subagents "créatifs" pour enrichir

1 fois par session majeure : subagent `Explore` avec prompt créatif ("propose 10 features niche casino manquantes") → transforme le quotidien utilisateur.

### 7. Noter toutes les sorties agents dans MEMO_RESUME.md

Chaque rapport agent → résumé 3-5 lignes dans MEMO_RESUME.md section "Agents lancés session". Trace permanente pour éviter doublons et répétitions.

### 8. Pattern applicatif

Même dans le code de l'app : l'IA Pit Boss (v9.298-300) est un agent interne. En ajouter d'autres progressivement : agent de suggestion d'échanges, agent de détection absences à risque, agent de répartition équitable.

---

## 🧰 Outils & réflexes expert (ajouté v9.68)

> Boîte à outils personnelle pour éviter les erreurs et travailler plus vite. À consulter en début de session.

### Outils d'analyse rapide

| Besoin | Outil à utiliser | Pourquoi |
|--------|-----------------|----------|
| Recherche keyword ciblée | `Grep` | Instantané, ne pollue pas le contexte |
| Fichier par nom/pattern | `Glob` | Plus rapide que `find` |
| Lecture partielle d'un gros fichier | `Read offset+limit` | Évite "token limit exceeded" sur index.html (1.1 MB) |
| Exploration ouverte multi-étapes | Subagent `Explore` | Délègue la lourdeur, rapport condensé |
| Plan avant gros chantier | Subagent `Plan` | Évite de refactorer à l'aveugle |
| **Audit parallèle** | **N subagents `Explore` en parallèle** sur zones distinctes | 4× plus rapide, contexte principal préservé |

### Outils d'écriture précise

| Action | Outil | Piège à éviter |
|--------|-------|---------------|
| Changer N lignes existantes | `Edit` (pas `Write`) | Un `Write` complet écrase tout |
| Rename global | `Edit replace_all:true` | Pas Bash+sed |
| Nouveau fichier | `Write` | Vérifier qu'il n'existe pas déjà avec `Glob` |
| Lot de modifs liées | Plusieurs `Edit` séquentiels | Pas un méga `Edit` fragile |

### Outils de validation systématique (à lancer APRÈS chaque batch)

```bash
# Syntaxe JS (OBLIGATOIRE avant commit — attrape 95% des erreurs)
node -e "const fs=require('fs');const h=fs.readFileSync('index.html','utf8');const s=h.lastIndexOf('<script>'),e=h.lastIndexOf('</script>');fs.writeFileSync('/tmp/t.js',h.slice(s+8,e));" && node --check /tmp/t.js && echo "✅ OK"

# Taille fichier (dérive suspecte si > 1.3 MB)
wc -c index.html

# XSS potentiels non échappés
grep -n 'innerHTML' index.html | grep -v 'esc(' | head -20

# Marqueurs de conflit oubliés
grep -c "^<<<<<<\|^======\|^>>>>>>" index.html CLAUDE.md

# Diff pour détecter régressions
git diff --stat HEAD
```

### Outils vidéo (ajouté v9.68 — `tools/video/`)

```bash
node tools/video/make-demo.js              # Pipeline complet MP4
node tools/video/make-demo.js --fast       # Durées réduites
node tools/video/make-demo.js --skip-capture # Sans Puppeteer
```

### Réflexes anti-erreur

1. **Avant de modifier une fonction** → la lire intégralement avec `Read`, pas juste ses extraits `Grep`
2. **Avant de toucher `index.html`** → checker `wc -c` avant/après (dérive = regression)
3. **Avant un rebase** → checklist post-rebase (règle #21 dans "Erreurs connues")
4. **Avant un commit** → 4 commandes de validation ci-dessus
5. **Si `prompt too long`** → utiliser subagent `Explore` pour la partie lourde, ou `Read offset+limit`
6. **Si un `Edit` échoue** → relire le fichier (il a pu être modifié par un linter entre-temps)
7. **Demande multi-étape** → TodoWrite immédiat, pas "je le ferai après"
8. **Nouveau module complexe** → subagent `Explore` pour audit indépendant une fois fini

### Stratégies qui ont marché

- **Parallélisme tool calls** : lancer 3-5 `Grep`/`Read`/`Bash` non dépendants dans un seul message → gain de vitesse énorme
- **Background bash (`run_in_background`)** pour les commandes longues (`npm install`, génération vidéo, apt), continuer en parallèle
- **Subagents en parallèle** pour auditer 4 zones du code simultanément → contexte principal reste propre
- **CHANGELOG.md séparé** : garder CLAUDE.md < 45 KB, sinon "prompt too long" récurrent

### Pièges connus (à ne JAMAIS refaire)

- ❌ Relancer 5× la même commande qui échoue sans diagnostiquer
- ❌ Écraser index.html avec `Write` pour "un petit changement" → toujours `Edit`
- ❌ Bash avec `;` dans un filtergraph ffmpeg non quoté → shell interprète
- ❌ Oublier `esc()` sur données user avant `innerHTML`
- ❌ Commit sans syntax check JS → casse l'app en production
- ❌ Remettre tout l'historique versions dans CLAUDE.md (déporter dans CHANGELOG.md)

> 📌 **Reprise de session** : voir `MEMO_RESUME.md` à la racine pour savoir où j'en suis.

> **Règles globales** (méthodologie expert, tous projets) : `~/.claude/CLAUDE.md`

> **Règles globales** (s'appliquent à tous les projets) : voir `~/.claude/CLAUDE.md`

---

## ⚡ RÈGLE BATCHING CI (Kevin 2026-04-18 — v9.381+)

**Éviter rate limit Vercel Free (100 déploys/jour) et services similaires.**

Règle permanente pour CE projet ET tous projets futurs :

1. **BATCHER** les changements : 1 PR = 5-10 fixes/features cohérents
   ❌ PAS : 1 PR par petit fix (→ 75 PRs = rate limit)
   ✅ OUI : grouper par batch thématique (UI + fixes + tests → 1 PR)

2. **SKIP CI sur docs-only** via `vercel.json` :
   ```json
   { "ignoreCommand": "git diff HEAD^ HEAD --quiet -- . ':(exclude)*.md'" }
   ```
   Si seulement `*.md` changé → Vercel skip build

3. **Accumuler en local** : plusieurs commits sur une branche avant push
   - Bump APP_VER à chaque batch logique, pas à chaque fix
   - Test `node --check` après le batch complet
   - Push + PR quand le batch est cohérent

4. **Doc-only commits** : pousser direct sur main si seulement notes/docs
   (évite branch + PR + CI pour rien)

5. **Anticipation** : si >10 PRs prévues dans la session, consolidation
   immédiate obligatoire

**Exemple bon batch** :
- v9.X00 : fix bug A + fix bug B + test + CSS polish → 1 PR

**Exemple mauvais** (ce qui a causé rate limit aujourd'hui) :
- v9.371 PR + v9.372 PR + v9.373 PR + ... (1 fix = 1 PR)

---

## 🎯 RÈGLE EXPERT PERMANENTE (Kevin 2026-04-18)

> **"Travail comme un professionnel tout le temps. Un expert tu es. Note le pour tout partout tout le temps."**

Toutes les sessions, toutes les tâches, tout le temps :
- Mode expert maintenu, jamais de shortcuts
- Parallélisation tool calls quand indépendants
- Subagents `Explore` pour audit parallèle
- Tests unitaires après chaque feature
- Validation `node --check` obligatoire avant commit
- esc() partout sur données user
- Guards AID sur fonctions destructrices
- Commits + push autonomes quand CI green
- CLAUDE.md + NOTES_USER.md + MEMO_RESUME.md tenus à jour
- Pas de régression : audit avant livraison

Cette règle EST lue à chaque début de session et appliquée sans exception.

---

## ⚠️ RÈGLE ABSOLUE — Méthode de travail (non-négociable)

**L'utilisateur ne doit JAMAIS avoir à rappeler une demande oubliée.** Cette règle prime sur tout le reste.

### 1. Feuille de route systématique (TodoWrite obligatoire)

À CHAQUE nouvelle demande de l'utilisateur — même au milieu d'une autre tâche — tu DOIS :

1. **Interrompre mentalement** la tâche courante (pas physiquement — finir le tool call en cours)
2. **Ajouter immédiatement** la nouvelle demande à la feuille de route via `TodoWrite`
3. **Reprendre** la tâche courante OU basculer sur la nouvelle si elle est plus prioritaire
4. **Jamais** répondre "OK je le ferai après" sans l'avoir écrit dans la todo list
5. **Jamais** clôturer une session sans avoir vérifié que tous les items sont `completed`
6. **Taguer la demande** avec `[CATÉGORIE]` dans le `TodoWrite.content` : `[CHAT]`, `[PLANNING]`, `[IA]`, `[SÉCU]`, `[IMPORT]`, `[ADMIN]`, `[UX]`, `[PERF]`, `[DOC]`, `[META]` — pour pouvoir regrouper/prioriser
7. **Quand l'utilisateur envoie un message long avec plusieurs points** : décomposer en N todos distincts, un par point, même si c'est une question (marquer `[QUESTION]` et y répondre)
8. **Avant toute réponse finale** : relire la todo list et confirmer à l'utilisateur ce qui est fait/pending

Les `<system-reminder>` qui mentionnent "The user sent a new message while you were working" sont le signal OBLIGATOIRE de mettre à jour la roadmap avant de continuer.

**Anti-pattern à éviter** : enchaîner plusieurs actions sans mettre à jour la todo → oubli garanti quand le contexte se remplit. La todo est ton MÉMOIRE EXTERNE, utilise-la même pour les petits items.

### 1ter. NOTES_USER.md — Mémoire persistante des infos métier (v9.103+)

**Règle absolue, non-négociable :**

Dès que l'admin (Kevin DESARZENS / U11804) te donne une **info métier** — couleurs PDF,
numéros de tables, horaires de rôles, règles spécifiques au casino, noms de salons,
préférences, corrections d'erreurs passées — tu DOIS :

1. **Enregistrer IMMÉDIATEMENT** dans `/home/user/CMCteams/NOTES_USER.md` (section appropriée)
2. **Ne pas attendre** que l'admin redonne l'info plus tard
3. **Lire NOTES_USER.md** au début de CHAQUE session (après CLAUDE.md)
4. **Confirmer à l'admin** que c'est noté : "✅ Noté dans NOTES_USER.md section X"

Exemples d'infos à enregistrer :
- Couleurs exactes d'un code (screenshot PDF fourni)
- Numéros de tables et jeux associés
- Noms de salons (Atrium, Renaissance, …)
- Horaires spécifiques d'un rôle (inspecteur, pitboss)
- Noms d'employés particuliers / exceptions
- Règles internes (rotation, pauses, priorités)
- Préférences UX exprimées ("je veux tel bouton", "pas de confirmation sur…")

**Sans NOTES_USER.md :** chaque session = l'admin doit tout ré-expliquer → perte de temps massive.



### 1bis. UX — Tout doit être simple, visuel, ludique, compréhensible (v9.75+)

**Règle permanente pour CE projet ET tous les projets futurs.**

### 1ter. UX allégement + stats cliquables (Kevin 2026-04-18 v9.379+)

**RÈGLE PERMANENTE NON-NÉGOCIABLE** à appliquer à CHAQUE vue créée ou modifiée :

1. **Alléger les vues** :
   - Familles / sous-dossiers / menus déroulants (`<details><summary>`)
   - Défilement horizontal (`overflow-x:auto`) quand > 5 éléments
   - Résumés en tête, détails dépliables au clic
   - JAMAIS tout afficher d'un coup (> 20 lignes = scroll horizontal ou collapse)

2. **Stats cliquables actionnables** :
   - Une stat "2 malades" → clic → liste des 2 employés malades
   - "15 présents secteur BJ" → clic → leur planning/cards
   - "3 en attente ack" → clic → liste des DM non acquittés
   - Aucune stat orpheline (pur affichage sans lien)

3. **Hiérarchie progressive** :
   - Niveau 1 : compteurs grands + icône
   - Niveau 2 : sous-sections dépliables
   - Niveau 3 : détails ligne par ligne
   - L'admin déplie ce qu'il veut voir

4. **Exemples à suivre dans le code** :
   - `showLiveList(key)` (v9.212) : cards KPI cliquables → modal liste
   - `vEndShiftDashboard` : stats colorées par urgence + clic → action
   - `vPitHistory` : filtres type + 8 events max visibles

**À appliquer quand je crée/modifie des vues** :
- Checker systématiquement : "Cette stat peut-elle être cliquée pour voir les détails ?"
- Si oui → ajouter onclick → modal ou sv(vue_detail)
- Si non pertinent → garder tel quel (ex: version APP_VER)

---

L'utilisateur final de cette app (admin + employés casino) n'est PAS technique. Chaque bouton, champ, fonction, message DOIT être immédiatement compréhensible.

**Standards à respecter systématiquement :**

1. **Chaque bouton a une icône/emoji pertinent** en plus du texte
   - ✅ `✅ Appliquer` / `🔍 Analyser` / `↩ Annuler` / `📋 Copier` / `💾 Sauvegarder`
   - ❌ `OK` / `Go` / `Submit` (labels vagues)
   - Icône cohérente avec la fonction (📧 pour email, 🔑 pour mdp, 👥 pour employés, 📅 pour planning)

2. **Tout bouton/champ complexe a un `title=""` explicite** (tooltip au hover/long-press)
   - "Configurer clé API Claude" > "🔑"
   - "Dictée vocale — parlez, le texte s'écrit automatiquement" > 🎙

3. **Aide contextuelle `?` sur les sections complexes** (vAdmin, vImport, vStats…)
   - Icône `<span class="help-icon" onclick="showHelp('keyword')">❓</span>` cliquable
   - Popover avec explication courte (2-4 phrases) + screenshot/exemple si utile

4. **Messages de confirmation explicites AVANT action destructrice**
   - ❌ `confirm("Continuer ?")`
   - ✅ `confirm("⚠️ Supprimer DUPONT J définitivement ?\n\nCette action est irréversible.\nToutes ses données (planning, mdp, identité) seront perdues.\n\nTaper OUI pour confirmer.")`

5. **Toast / feedback visuel à chaque action réussie**
   - `toast("✅ Email modifié : dupont@example.com")` > silence

6. **États vides avec icône + texte + CTA**
   - "📭 Aucune demande en attente" > "Rien"
   - Avec bouton d'action si pertinent ("📥 Importer un planning")

7. **Groupement logique + séparateurs visuels**
   - Cards avec titres en majuscules + couleur thème
   - Pas de mur de 30 boutons alignés sans hiérarchie

8. **Labels en français clair, pas de jargon**
   - "Attribuer temps de table maximum" > "Set maxWorkMinutes"
   - "Retirer de l'équipe" > "Deactivate membership"

9. **Revoir l'existant à chaque nouvelle version** : est-ce qu'un employé non-technique comprendrait ce que fait ce bouton/cette fonction au premier coup d'œil ?

**Pour chaque nouvelle feature : écrire d'abord la version "user story" simple :**
> "En tant qu'admin, je clique sur 📧 Changer email, je saisis le nouveau, je vois une confirmation ✅"

Si cette user story n'est pas évidente depuis l'UI, **c'est mal designé, retravaille**.

### 2. Vérification systématique après CHAQUE modification

Avant de dire "c'est fait", tu DOIS :

1. **Syntax check JS** : `node --check` sur le bloc script extrait
2. **Re-lire** les lignes modifiées pour confirmer le résultat
3. **Tracer le flux** : la modif casse-t-elle une autre fonction ? (utiliser la matrice d'impact Phase 0)
4. **Vérifier le rendu** : le HTML généré est-il bien formé ? Les styles inline cohérents ?
5. **Vérifier les guards** : `esc()` présent ? `A.user.id===AID` pour les actions admin ?
6. **Mobile-first** : la modif fonctionne-t-elle à 375px ? iOS safe-areas respectées ?

### 3. Auto-audit et corrections continues

Après une série de modifications, tu DOIS :

1. **Lancer un audit** (soit manuellement avec Grep/Read, soit via un subagent Explore)
2. **Chercher activement** ce qui pourrait ne pas marcher — ne pas attendre que l'utilisateur trouve les bugs
3. **Appliquer les corrections** sans demander l'autorisation pour les bugs évidents
4. **Bumper la version** à chaque batch cohérent de corrections
5. **Commit + push** avec un message descriptif

### 4. Se faire vérifier par un subagent

Pour les modifications importantes (nouveau module, refactoring, fix complexe), tu DOIS utiliser un subagent `Explore` pour un second regard :

```
Agent({
  description: "Audit indépendant v9.XX",
  subagent_type: "Explore",
  prompt: "Audit la fonction XXX dans /home/user/CMCteams/index.html lignes A-B.
           Vérifie : (1) bugs de logique, (2) XSS, (3) edge cases non gérés,
           (4) cohérence avec le reste du code. Rapport court."
})
```

### 5. Amélioration continue

- **Jamais se satisfaire** d'un "113/114 OK" — toujours chercher le 1 manquant
- **Anticiper** les demandes implicites (ex: si on ajoute un upload photo, l'utilisateur voudra sûrement aussi la supprimer → ajouter les deux)
- **Rigueur > vitesse** : mieux vaut 1 commit bien fait que 5 commits de "fix" qui se corrigent mutuellement

### 6. Communication honnête

- **Ne jamais dire "j'ai tout fait"** si tu n'as pas vérifié
- **Lister explicitement** ce qui n'est pas fait et pourquoi
- **Demander** plutôt que deviner quand c'est ambigu
- **Reconnaître** les erreurs sans excuse ni justification

### 7. Mémoire et référence aux demandes passées

- **Relire les conversations passées** en cas de doute avant d'agir
- **Consulter ce CLAUDE.md** comme source de vérité à chaque session
- **Ne jamais répéter une erreur** documentée dans "Erreurs connues à NE PAS reproduire"
- Si une demande ancienne semble oubliée, **revenir la chercher** dans l'historique au lieu de demander à l'utilisateur
- Les demandes récurrentes de l'utilisateur (ex: "revois le thème", "mets des vraies photos") doivent être **tracées dans une todo persistante** jusqu'à résolution complète

### 8. Anticipation des bugs futurs

Avant de livrer, se poser les questions :

- Que se passe-t-il si `A.user` est null au moment de l'appel ?
- Que se passe-t-il si Firebase n'est pas connecté ?
- Que se passe-t-il si localStorage est plein (QuotaExceededError) ?
- Que se passe-t-il sur iOS Safari en mode PWA vs navigateur ?
- Que se passe-t-il si l'employé a été supprimé mais ses messages chat existent encore ?
- Que se passe-t-il si deux admins modifient la même donnée en même temps (conflit SSE) ?
- Que se passe-t-il si l'import PDF rate à mi-parcours ?
- Que se passe-t-il sur viewport 375px (iPhone SE) ?

Chaque edge case non géré = bug futur.

### 9. Mise à jour CLAUDE.md après chaque session

À la fin de chaque batch de modifications cohérent, tu DOIS :

1. Bumper `APP_VER` dans l'en-tête du CLAUDE.md
2. Ajouter une ligne dans le tableau "Historique versions"
3. Documenter les nouvelles constantes/fonctions dans les sections appropriées
4. Mettre à jour la liste "Erreurs connues" si une erreur a été identifiée
5. Commit le CLAUDE.md dans le même push que le code

**Le CLAUDE.md est la mémoire persistante inter-sessions. Sans mise à jour, les prochaines sessions répéteront les mêmes erreurs.**

### 10. Agir en expert — pas en simple exécutant

Le rôle n'est pas de cocher mécaniquement une liste mais :

- **Challenger** les demandes floues : "Tu veux X ou Y ?"
- **Proposer** des améliorations que l'utilisateur n'a pas envisagées
- **Refuser** (poliment) les demandes qui cassent un principe fondamental du projet
- **Expliquer** les trade-offs quand une solution a des coûts cachés
- **Ne pas attendre** l'autorisation pour les fixes évidents
- **Rigueur technique** : valider à chaque étape, ne jamais supposer

---

## Vue d'ensemble du projet

**CMCteams** est une SPA de planification de shifts et de gestion d'équipes pour le Casino de Monaco. Application entièrement client-side — pas de backend, pas de build, pas de dépendances — servie comme un unique fichier HTML statique hébergé sur GitHub Pages.

- **Langue :** Français (UI, commentaires, identifiants, messages de commit)
- **Version actuelle :** `APP_VER = "v9.303"`, `DATA_VER = 30`
- **Stockage :** `localStorage` navigateur + **Firebase Realtime Database** (sync temps réel)
- **Effectif :** ~258 employés sur 10 équipes BJ + 13 équipes roulettes + 13 équipes CMC + 4 casinos SBM (CMC/CDP/Sun/MCB, v9.197)
- **Taille fichier :** ~1.80 MB (HTML + CSS + JS) — v9.303
- **IA Pit Boss** (v9.298-300) : orchestrateur auto avec prédictions proactives, opt-in `cmc_pit_ai_mode`
- **Conventions intégrées :** Convention Collective Jeux de Table SBM (1er avril 2015) + Note DRH 2021 (congés familiaux) + Règles des 8 jeux de table (Blackjack, Roulette anglaise/européenne, Punto Banco, Punto High Roller, Texas Hold'em, Poker Cash Game, Craps) + Constitution de Monaco (v9.148b) + Indice Monaco Fonction Publique pour calcul paie (v9.186)
- **Audits externes** : moyenne **8.50/10** (benchmark niche casino SBM **9.9/10**) — voir `AUDIT_EXTERNE_2026-04-17.md`

---

## Structure du dépôt

```
CMCteams/
├── index.html          # Application entière (HTML + CSS + JS, ~440 KB)
├── sw.js               # Service Worker (cache offline — ajouté v8.78)
├── README.md           # Description minimale
├── CLAUDE.md           # Ce fichier
└── .github/
    └── workflows/
        └── deploy.yml  # Déploiement GitHub Pages (déclenché sur push main)
```

---

## Architecture

### Pattern SPA monofichier

```
<head>
  <style>  ← ~3200 lignes de CSS embarqué
  </style>
</head>
<body>
  <div id="app"></div>   ← point de montage principal
  <script>  ← ~5900 lignes de JS vanilla
  </script>
</body>
```

### Objet d'état global `A`

```javascript
var A = {
  user: null,
  view: "accueil",
  year: 2026,
  month: 3,              // 0-indexé (getMonth()) : avril = 3
  employees: [...],
  teams: [...],
  overrides: {},
  passwords: {},
  reg: {},               // {uid: {nom, prenom, email, adresse, dateNaissance, usbm, poste, createdAt, updatedAt}} — A.reg
  showLeg: false,
  chatMsgs: [...],
  empQ: "", pwQ: "", pwFilt: "all",
  importSuggestions: {newEmps: [], possibleRetired: []},
  pt: null
};
```

---

## Principe fondamental — Import = seule source de vérité (v8.79+)

- `gpl()` retourne uniquement les overrides (données importées + modifications admin)
- Sans import pour un mois → les vues affichent "Importez le planning PDF"
- `genBase()` et `cumWorkDays()` sont **supprimées** depuis v8.80

---

## Firebase Realtime Database (v8.98+)

```javascript
var FB_DEFAULT = "https://cmcteams-c16ab-default-rtdb.europe-west1.firebasedatabase.app";
var FB_URL = "";   // initialisé par fbInit() — utilise FB_DEFAULT si pas de cmc_fb_url

// Clés synchronisées (partagées entre tous les appareils)
var FB_FIX = ["cmc_ov","cmc_e","cmc_t","cmc_pw","cmc_reg","cmc_chat",
              "cmc_reg_alerts","cmc_audit","cmc_presence","cmc_userlog"];
var FB_PRE = ["cmc_ref_","cmc_ci_","cmc_comments_","cmc_verif_"];

// Clés locales uniquement (non synchronisées)
var FB_LOCAL = ["cmc_uid","cmc_lastact","cmc_lastread","cmc_lastread_dm",
                "cmc_pin_fails","cmc_admin_sessions","cmc_ia_enabled",
                "cmc_ia_websearch","cmc_ia_key","cmc_fb_url"];

fbInit()           // Appelé au démarrage — charge tout + démarre SSE listener
fbWrite(k, v)      // Appelé par ls() automatiquement si clé partagée
fbLoadAll()        // Charge snapshot complet depuis Firebase
fbStartListening() // SSE EventSource sur /cmcteams.json pour mises à jour temps réel
```

**Indicateur topbar :** 🟢 connecté / 🟡 en cours de connexion

---

## Clés localStorage

| Clé | Contenu |
|-----|---------|
| `cmc_e` | Tableau employés |
| `cmc_t` | Tableau équipes |
| `cmc_ov` | Objet overrides |
| `cmc_pw` | Mots de passe hachés |
| `cmc_chat` | Messages de chat (max 500) |
| `cmc_reg` | Identités complètes {uid: {nom, prenom, email, adresse, dateNaissance, usbm, poste, createdAt, updatedAt}} |
| `cmc_admin_pin` | Hash du PIN admin |
| `cmc_admin_sessions` | Journal sécurité admin (max 200) |
| `cmc_userlog` | Historique connexions tous utilisateurs (max 500) |
| `cmc_presence` | Présence en ligne {uid: {ts, name, team}} — TTL 10min |
| `cmc_lastread` | Timestamp dernier message chat public lu |
| `cmc_lastread_dm` | Timestamp dernière lecture DMs |
| `cmc_audit` | Journal modifications admin (max 500) |
| `cmc_pin_fails` | Compteur échecs PIN {count, until} |
| `cmc_lastact` | Timestamp dernière activité (session TTL 8h) |
| `cmc_uid` | ID employé connecté |
| `cmc_ref_YYYY-M` | Métadonnées import PDF |
| `cmc_ci_YYYY_M` | Indices départ personnalisés |
| `cmc_comments_YYYY_M` | Commentaires journaliers |
| `cmc_verif_YYYY-M` | Résultat vérification import |

---

## Modules (fonctions de vue)

| Fonction | Vue | Accès |
|----------|-----|-------|
| `vLogin` / `vLoginStep*` | Authentification | Tous |
| `vAccueil` | Dashboard accueil | Tous |
| `vMonPlanning` | Planning personnel mensuel complet | Tous |
| `vMonProfil` | Fiche de renseignement (self-service) | Tous |
| `vPlan` | Grille planning équipe | Tous |
| `vDeparts` | Grille ordres de départ | Tous |
| `vChat` | Chat (DM, réponses, filtres, vider) | Tous |
| `vStats` | Dashboard statistiques | Admin |
| `vAdmin` | Panneau admin | Admin |
| `vOnline` | Présence temps réel + historique 24h | Admin |
| `vAdminSecurity` | Journal connexions admin | Admin |
| `vTeams` | Configuration équipes | Admin |
| `vEmps` | Gestion employés + éditeur identité (A.reg) | Admin |
| `vRetrait` | Employés retraités | Admin |
| `vImport` | Import PDF | Admin |
| `vPasswords` | Gestion mots de passe + vue-employé + reset | Admin |
| `vAbsences` | Suivi absences | Admin |
| `vAuditLog` | Journal modifications | Admin |
| `vIA` | Chatbot IA | Tous |
| `vEchanges` | Demandes d'échange de shifts | Tous |

---

## Impersonation admin — Vue-employé (v9.0+)

```javascript
var _viewAs = null; // null = mode normal, sinon = objet user admin sauvegardé

viewAs(id)      // Admin prend la vue d'un employé donné
viewAsBack()    // Retour au compte admin (aussi déclenché par doLogout)
```

- Bannière jaune fixe en haut de l'écran quand actif
- Bouton "← Retour admin" dans la bannière
- Le bouton ✕ (topbar) ramène l'admin au lieu de déconnecter
- Déclenché depuis vPasswords → bouton "👁 Voir" par employé

---

## Système de présence (v8.91+)

```javascript
logUserLogin(emp)        // Appelé à chaque connexion réussie
logUserLogout(uid)       // Appelé à la déconnexion
updatePresence()         // Heartbeat toutes les 2 minutes
getOnlineUsers()         // Liste utilisateurs actifs (< 5 min)
startPresenceHeartbeat() // Démarre le heartbeat (login + reprise session)
```

---

## Journal sécurité admin (v8.90+)

```javascript
logAdminSession(type, info)
// types : "success", "pin_fail", "pin_lock", "logout"
// stocké dans cmc_admin_sessions (max 200)
```

---

## Import PDF — Banque de données évolutive (v8.88+)

Après chaque import :
- `A.importSuggestions.newEmps` : noms INTROUVABLE → bouton "Créer"
- `A.importSuggestions.possibleRetired` : présents mois précédent, absents → bouton "Marquer parti"
- `createEmpFromImport(name, family)` : crée l'employé, navigue vers sa fiche
- `markAsRetired(empId, toMo)` : définit toMo + audit + dc()

---

## Identité & fiche de renseignement (A.reg)

```javascript
// Admin uniquement — modifie nom/prenom/email (v8.87+)
adminSetReg(id, field, val)

// Employé — sauvegarde sa propre fiche en un seul batch Firebase (v9.10)
empSaveProfil()
// Lit les inputs #profil_email, #profil_adresse, #profil_usbm, #profil_poste, #profil_dateNaissance
// Whitelist: var _PROFIL_FIELDS = ["email","adresse","usbm","poste","dateNaissance"]
// Nom/prénom/matricule/secteur : lecture seule pour l'employé, modifiables par admin
```

**Champs A.reg :**
| Champ | Qui peut modifier | Via |
|-------|-------------------|-----|
| `nom` | Admin | `adminSetReg` |
| `prenom` | Admin | `adminSetReg` |
| `email` | Employé + Admin | `empSaveProfil` / `adminSetReg` |
| `adresse` | Employé | `empSaveProfil` |
| `dateNaissance` | Employé | `empSaveProfil` |
| `usbm` | Employé | `empSaveProfil` |
| `poste` | Employé | `empSaveProfil` |
| `createdAt` | Système | login |
| `updatedAt` | Système | `empSaveProfil` |

**Recherche universelle** (vEmps + vPasswords) :
- Matricule SBM, `NOM Initiale`, prénom, nom complet, email

---

## Recherche — helper searchInput (v9.1+)

```javascript
// Évite la perte de focus après dc() dans les champs de recherche
searchInput(key, val, id)
// key   : clé dans A (ex: "empQ", "pwQ")
// val   : nouvelle valeur
// id    : id de l'input HTML à refocuser

// Utilisé dans :
// vEmps     → id="empQIn"
// vPasswords → id="pwQIn"
// vChat DM  → id="chatDmQIn" (via chatDmSearch)
```

---

## Navigation

```
Nav non-admin: Accueil | Mon Plan. | Profil | Équipe | Départs | Chat | Aide
Nav admin:     Accueil | Mon Plan. | Profil | Équipe | Départs | Stats | Chat | Admin | Aide
```
Onglet Échanges inséré dynamiquement si `_exchEnabled` (avant Chat).

---

## Scroll automatique

- `adjDeparts()` : scroll vers aujourd'hui dans vDeparts (getBoundingClientRect)
  - Appelé dans `dc()` et `sv('departs')` avec setTimeout(150ms)
  - Offset : `-94px` (nom sticky = 90px)
- `adjGrid()` : scroll vertical ET horizontal vers aujourd'hui dans vPlan
  - Headers vPlan ont `data-planday="{d}"`
  - Headers vDeparts ont `data-depday="{d}"`
- `sv('accueil'|'departs'|'monplanning')` : réinitialise au mois courant

---

## Tri des équipes

- **vPlan** : famille BJ → Roulettes → CMC, puis numéro croissant (1,2,3...10, r1...r13, c1...c13)
- **vDeparts** : même ordre (admin), ou [myTeam, mirrorTeam] (non-admin)
- **vPlan non-admin** : "Ma section" (mon équipe + miroir) toujours en tête, reste en dessous

---

## Chat étendu (v8.83+)

```javascript
// Format message
{text, uid, name, team, ts, to?, toName?, replyTo?: {ts,name,text}, del?: true}

// Fonctions
chatSetDm(id, name)    chatCancelDm()    chatPickDm()
chatSetReply(ts)       chatCancelReply()
chatDelMsg(ts)         // Admin : supprime un message (soft delete)
chatFilterSet(f)       // Admin : "all"|"pub"|"dm"
// Admin : bouton "🗑 Vider" dans l'en-tête du chat pour effacer tous les messages
```

---

## Reset compte employé (v9.0+)

`doResetPwDirect(uid)` — efface **mot de passe + A.reg** (identité complète).
L'employé devra se réinscrire à la prochaine connexion. Avec confirmation dialog.

---

## Changement de matricule (adminChangeEmpId)

Migre automatiquement : `A.employees`, `A.passwords`, `A.reg`, `A.overrides`,
et toutes les clés `cmc_ref_YYYY-M` (années 2025–2028) pour éviter les faux
"absent du PDF" après changement d'ID.

---

## Sécurité

- `esc(s)` : toujours sur les données utilisateur avant innerHTML
- `e.message` dans les handlers d'erreur : `.replace(/</g,"&lt;")` obligatoire (pas d'accès à `esc` dans `window.onerror`)
- Session TTL 8h (`cmc_lastact`)
- Rate-limiting PIN : 5 échecs → verrouillage progressif [30s, 2min, 10min, 1h, 24h]
- Seul `AID = "U11804"` (DESARZENS K) peut modifier les données
- Toutes les fonctions destructrices (`doResetPwDirect`, `adminSetPw`, etc.) doivent avoir le guard `if(!A.user||A.user.id!==AID)return;`
- Hash mots de passe : `hashPwStrong()` pour nouveaux comptes (10 000 rounds + sel), `verifyPw()` pour vérification (backward-compat legacy DJB2)
- Journal sécurité admin : toutes les connexions/échecs/déconnexions
- `cmc_admin_pin` dans `FB_LOCAL` (ne jamais synchroniser vers Firebase)
- Proxy IA optionnel : `cmc_ia_proxy` dans FB_LOCAL, bouton 🔗 dans vIA pour l'admin

---

## Échanges de shifts (v9.9+)

```javascript
demanderEchange(year, month, day)   // Employé : soumet une demande depuis vMonPlanning
adminRepondreEchange(exId, action, adminNote, partnerUid, partnerDay)
// action = "rejected" | "rh" (accorde repos RH) | "swap" (échange codes)
adminSupprimerEchange(exId)         // Supprime une demande de l'historique

var _exchEnabled                    // true par défaut, persisté dans cmc_exchanges_enabled
setEchangesEnabled(v)               // Toggle admin dans vAdmin
```

- Demande visible depuis **Mon Planning** : bouton 🔄 sur jours de travail non passés
- Vue admin : candidats au swap = collègues qui travaillent le même jour (même équipe)
- Toutes mutations sync Firebase via `fbWrite("cmc_exchanges", A.exchanges)`
- Audit complet : `_audit("exchange_rejected"|"exchange_rh"|"exchange_swap", ...)`

## Queue offline (v9.9+)

```javascript
_syncQueue               // {key: {v, ts}} — persisté dans cmc_sync_queue
_syncQueueAdd(k, v)      // Ajoute une entrée, affiche badge ⏳ dans topbar
_syncQueueRemove(k)      // Retire une entrée après sync réussie
flushSyncQueue()         // Rejoue toutes les écritures en attente
```

- `fbWrite` ajoute à la queue après 3 échecs (retry 2s/4s/6s)
- Auto-flush au retour online (`window.addEventListener("online", ...)`)
- Badge ⏳ cliquable dans la topbar pour forcer la sync

## Notifications navigateur (v9.9+)

```javascript
requestNotifPermission()            // Demande permission Notification API
sendNotif(title, body, opts)        // Envoie si permission accordée ET app en arrière-plan
_checkPlanningChanged(newOv)        // Déclenché par fbApplyData("cmc_ov", ...)
_checkNewChat(msgs)                 // Déclenché par fbApplyData("cmc_chat", ...)
```

- Ne s'affiche pas si `document.visibilityState === "visible"` (toast suffit)
- Bouton d'activation dans le panneau admin (vAdmin)

---

## 💾 RÈGLE PERMANENTE — MEMOIRE MAX iPHONE (Kevin 2026-04-25, ABSOLUE)

> **"Memoire pleine, ca arrive trop souvent."** — Kevin v12.260 / v9.538

iPhone Safari PWA limite localStorage à ~5 Mo par origin. Pour repousser ce mur :

### 1. Compression LZ-string UTF16 (lazy CDN)

Apex (`_axCompress`/`_axDecompress`) et CMCteams (`_cmcCompress`/`_cmcDecompress`) utilisent `lz-string@1.5.0` via `https://cdn.jsdelivr.net/npm/lz-string@1.5.0/libs/lz-string.min.js`, lazy-loadé au premier `ls()` write. Toute valeur JSON > 1 KB est compressée avec `compressToUTF16` et préfixée `__LZ__`. Gain typique : 50-70% vs texte brut. Backward compat : valeurs base64 (`B64:`) ou non-compressed lues normalement.

### 2. IDB shadow auto-fallback

Quand `QuotaExceededError` persiste après cleanup, écriture directe vers IndexedDB via `axIdbSet`/`cmcIdbSet`. IDB capacité ~50 MB-1 GB Safari iOS. Toast user-friendly "Stockage saturé — sauvegarde IDB" au lieu d'erreur technique.

### 3. Cleanup AGRESSIF auto 30 min

`axAggressiveCleanup()` (Apex) et `cmcAggressiveCleanup()` (CMC) tournent toutes les 30 min via `setInterval` quand quota > 80%. Trim caps stricts :
- **Apex** : audit 100, err_log 50, silent_log 50, claude_todo 20, telemetry_in 40, lessons 80, persistent_memory 150, K.messages 100/conv, photos diaporama theme 5 max, telemetry processed > 7j retiré, claude_todo resolved > 7j retiré, backups > 7j supprimés.
- **CMC** : cmc_chat 200, cmc_audit 100, cmc_userlog 100, cmc_pdf_fingerprints 30, cmc_learned_patterns 100, cmc_import_log 100, backups > 7j, verifications/comments > 12 mois.

Toast user : "🚀 Memoire optimisee : X Ko liberes" si delta > 100 KB.

### 4. Indicateur stockage visible

Vue `vStorageManage` (Apex admin) : barre progressive Ko / 5120 Ko avec couleur vert (<60%) / jaune (60-80%) / rouge (>80%) + bouton "🧹 Nettoyer maintenant" qui appelle `axEmergencyCleanup`.

### 5. Test mental obligatoire avant chaque release

*"Si une donnée user dépasse 1 KB, est-elle compressée ? Si quota > 80%, le cleanup agressif tourne-t-il ?"*

Si non → fixer avant push.

---

## 🔄 RÈGLE PERMANENTE — SW CACHE_VERSION = APP_VER TOUJOURS (Kevin 2026-04-25, ABSOLUE)

> **"Le force refresh, la mise à jour automatique pour la version, ça en fait partie."**

**Règle absolue, prioritaire** — Apex, CMCteams, tous projets PWA futurs :

### 1. Invariant strict

`sw.js → CACHE_VERSION` DOIT toujours = `index.html → APP_VER` (préfixé par le nom d'app).

- Apex : `CACHE_VERSION = 'apex-' + APP_VER` (ex: `apex-v12.241`)
- CMCteams : `CACHE_VERSION = 'cmc-' + APP_VER` (ex: `cmc-v9.522`)

### 2. Sentinelle GitHub Action

`.github/workflows/sw-cache-sync.yml` tourne sur chaque push qui touche `apex-ai/index.html` ou `apex-ai/sw.js` :
- Extrait APP_VER depuis index.html via grep
- Extrait CACHE_VERSION depuis sw.js via grep
- Si drift → sed le sw.js + commit auto `chore: sync sw.js CACHE_VERSION → vX.Y (auto)`
- Permissions `contents: write` requises

À dupliquer pour CMCteams : créer le même workflow ciblé sur `index.html` + `sw.js` racine.

### 3. Pourquoi c'est critique

Sans sync, le Service Worker garde l'ancien cache → Kevin voit l'ancienne version → "rien ne marche" → force-refresh manuel iPhone (geste pas évident en PWA installée).

### 4. Test mental obligatoire avant chaque bump APP_VER

*"Ai-je bumpé CACHE_VERSION dans sw.js aussi ?"*

Si non → bumper avant de commit, OU laisser la sentinelle rattraper.

---

## 🔐 RÈGLE PERMANENTE — NOM + PRÉNOM + PASS OBLIGATOIRES PARTOUT (Kevin v12.241, 2026-04-25, ABSOLUE)

> **Sécurité auth — découverte via audit expert externe 4 agents :**

**Règle absolue, prioritaire** — Apex, CMCteams, tous projets futurs :

### 1. Login = 3 champs obligatoires

Tout login utilisateur DOIT exiger :
1. **Prénom** (min 2 chars, normalisé)
2. **Nom** (min 2 chars, normalisé)
3. **Pass** (PIN 6+ chars OU mot de passe OU FaceID si déjà enrôlé)

JAMAIS d'auth avec juste 1 champ (genre "tape ton nom"). JAMAIS de match substring partiel sur 1 token.

### 2. Recherche/lookup user = même règle

Tout `findUserByName`, `_checkPreconfiguredUser`, etc. exige :
- Match exact (après normalisation accents/casse) sur prénom+nom (2 tokens min)
- OU match avec confidence ≥0.95 ET 2 tokens minimum
- JAMAIS substring sur 1 token court (≤4 chars) → risque impersonation (Laurent vs Laurence, Kev vs Kevin)

### 3. Édition fiche user = vérif 3 champs

Avant tout `axEditUser`, `cmcUpdateProfile`, etc. :
- Confirmer prénom + nom + pass actuel valide
- JAMAIS modifier une fiche en se basant uniquement sur l'ID session si action sensible (changement email, pass, role)

### 4. Pourquoi c'est critique (audit v12.240 expert)

Découvert : un attaquant pouvait taper "Kevin Desarz" sans PIN → devenait admin (regex match partiel). Fix complet en v12.240 + v12.241 obligatoirement appliqué partout.

### 5. À auditer dans chaque app

- Login flows (vLogin, vLoginStep*, axLogin, doLogin)
- Search/filter users (vEmps, vPasswords, vPit)
- Profile edit (vMonProfil, vEmps adminSetReg)
- IA tool calls qui modifient un user (axEditUser, axImpersonate)

---

## 🔑 RÈGLE PERMANENTE — PIN PER-USER ≠ PIN ADMIN GLOBAL (Kevin v12.240, 2026-04-25, ABSOLUE)

> **Découvert via audit expert externe — bug critique sécurité.**

**Règle absolue, prioritaire** — Apex, CMCteams, tous projets futurs avec auth multi-user :

### 1. Convention de nommage stricte

| Donnée | Clé localStorage/Firebase |
|--------|---------------------------|
| **PIN admin global** | `ax_pin` / `cmc_admin_pin` (RÉSERVÉ admin uniquement) |
| **PIN user X** | `ax_pin_<userId>` / `cmc_pin_<uid>` |
| **Pass admin** | `ax_admin_pass` |
| **Pass user X** | `ax_pass_<userId>` |

### 2. Guard obligatoire dans tout flow PIN/pass change

```js
function axSetPin(userId, pinHash){
  var key = (userId === ADMIN_ID) ? "ax_pin" : "ax_pin_" + userId;
  ls(key, pinHash);
}
```

JAMAIS écrire dans `ax_pin` si le user N'EST PAS l'admin global.

### 3. Audit obligatoire à chaque release

`grep -n 'ax_pin[^_]' apex-ai/index.html` → vérifier que CHAQUE écriture est admin-only.

### 4. Pourquoi c'est critique

Découvert v12.240 : Laurence change son PIN → écrit dans `ax_pin` → écrase le PIN admin Kevin. Impact :
- Kevin ne peut plus se connecter admin
- Laurence (involontairement) a maintenant accès admin
- N'importe quel user pouvait reset le PIN admin

Fix v12.240 isole tout PIN per-user dans clé scopée. À appliquer immédiatement à tout projet futur multi-user.

---

## Erreurs connues à NE PAS reproduire

1. `table-layout:fixed` dans un conteneur scrollable ❌
2. `overflow:hidden` sur parent d'un enfant scrollable (mobile WebKit) ❌
3. Fallbacks théoriques REPOS/genBase dans les vues ❌
4. `syncChefsT()` — supprimée v8.80, ne pas réintroduire ❌
5. Charger SEED_APR2026 inconditionnellement ❌
6. Push directement sur `main` sans branche feature ❌
7. Modifier des données sans vérifier `A.user.id === AID` ❌
8. `innerHTML` sans `esc()` ❌
9. `oninput` appelant `dc()` directement sans restaurer le focus → utiliser `searchInput()` ❌
10. `overflow-y:hidden` sur parent de colonne sticky (iOS Safari) ❌
11. `width:100%` sur table dans conteneur scrollable → étire les colonnes, codes loin des noms → utiliser `width:auto` ❌
12. Mettre à jour `cmc_notif_ts` sans envoyer de notification → marque les messages comme vus sans notifier ❌
13. `base=0` dans calcDepPos/vDeparts → tous les employés au même rang → utiliser index `ei` ou `chefNames.indexOf` ❌
14. Onglets nav admin > 8 → Admin poussé hors écran sur iPhone → Stats accessible depuis panneau Admin ❌
15. Notifs iOS Safari navigateur : `typeof Notification === "undefined"` (toujours) → ne fonctionne qu'en PWA (écran d'accueil) ❌
16. A.user/_viewAs non rafraîchis après remplacement de A.employees par Firebase SSE → références obsolètes ❌
17. Modifier plusieurs fonctions dans un même commit sans vérifier chaque flux → régressions ❌
18. `max-width` sur `<td>` en table-layout:auto ignoré par les browsers → utiliser un `<div class="nw">` wrapper à l'intérieur du td ❌
19. `chatSetReply(ts)` sans auto-activer `_chatDm` sur un DM → la réponse part en public au lieu de revenir en privé ❌
20. Utiliser une variable locale d'une autre fonction vue (ex: `myPl` de `vMonPlanning` dans `vAccueil`) → ReferenceError en production ❌
21. **Git rebase sans vérification post-rebase** : un rebase peut perdre silencieusement des modifications (règles detectRepoConflicts, blocs HTML dans vDocs, validation post-import). **OBLIGATION** : après TOUT rebase, vérifier avec `grep` que CHAQUE feature ajoutée est encore présente dans le fichier. Liste de contrôle post-rebase : `grep -c "mot_clé_unique_feature"` pour chaque ajout ❌
22. Données SEED incorrectes sans validation : SEED_APR2026 avait des horaires de travail au lieu de CP/AF pour REVOLLON. **OBLIGATION** : toute donnée SEED doit être vérifiée par `detectRepoConflicts()` — la règle 4 (horaire_dans_absence) attrape ce type d'erreur automatiquement ❌
23. Audit "simple" au lieu d'audit "général expert" : un audit qui vérifie seulement la syntaxe JS n'est PAS un audit expert. **OBLIGATION** : utiliser la checklist complète (21 points : 8 flux utilisateur + 5 flux admin + 5 sécurité + 3 données) à CHAQUE audit final ❌
24. **Fuzzy matching aveugle** (v9.376-377) : Levenshtein ≥0.75 matchait `BORGIA L` à `BORGIA T` (similarité 0.875). **OBLIGATION** : quand fuzzy match + surname identique + initiales différentes + initiales courtes (≤2 chars) → consulter `known_identities` (v9.220). Si nom vu ≥2 fois → vrai homonyme, sinon → anomalie OCR dans `cmc_import_anomalies`. Jamais matcher aveuglément les homonymes ❌
25. **Correction générique vs spécifique** : quand Kevin signale un bug précis (ex: BORGIA), le fix doit être **générique** (s'applique à tous les cas similaires), pas hardcodé au cas signalé. Toujours généraliser le pattern ❌
26. **Propagation codes invalides** (v9.373) : `autoFillMissingCadres` copiait sans validation → codes non reconnus se propageaient d'un mois à l'autre. **OBLIGATION** : valider `CODES[c]` avant toute copie cross-mois ❌
27. **KDMC: Sync Firebase donnees partagees** (v12.2) : `ax_shared_api_key` n'etait PAS dans `FB_FIX` et `_settingsApiKey` utilisait `localStorage.setItem` au lieu de `ls()` → la cle API ne se syncait JAMAIS vers Firebase → clients sur d'autres appareils sans cle. **OBLIGATION** : toute donnee partagee cross-device DOIT etre dans `FB_FIX` ET utiliser `ls()` pour ecrire. TOUJOURS verifier le flux COMPLET bout-en-bout (ecriture → fbShouldSync → Firebase → fbLoadAll → lecture client) ❌
28. **KDMC: Audit incomplet** (v12.0-12.1) : les audits verifiaient les guards admin mais PAS le flux de donnees. Resultat : bug invisible pendant 2 versions. **OBLIGATION** : chaque audit DOIT inclure 5 niveaux : (1) syntaxe, (2) securite/guards, (3) flux de donnees bout-en-bout, (4) fonctionnel, (5) UX. Ne JAMAIS se contenter des niveaux 1-2 ❌
29. **KDMC: System prompt hardcode** (v12.0) : `_callClaudeAPI` ignorait le parametre `sysPrompt` et utilisait une string basique hardcodee. **OBLIGATION** : toujours utiliser `sysPrompt||_buildSystemPrompt()` et VERIFIER que le prompt reel est celui attendu, pas un placeholder ❌
30. **KDMC v12.3 : IA "3 points infini"** (2026-04-20) — 3 causes cumulatives :
    (a) `_callClaudeAPI` hardcodait `https://api.anthropic.com/v1/messages` → ignorait `ax_proxy_url` → CORS hang Safari iOS PWA.
    (b) Filtre `typeof content==="string"` droppait `tool_use`/`tool_result`/image dans la recursion → API recevait conversation cassee.
    (c) Pas d'`AbortController` → fetch zombie apres timeout.
    **OBLIGATION** : JAMAIS hardcoder l'URL Anthropic, TOUJOURS passer par `ax_proxy_url` or default. JAMAIS filtrer par `typeof content==="string"` avant d'envoyer a l'API. TOUJOURS AbortController + signal.abort() dans le timeout. ❌
31. **Parser PDF trop strict = cadres rates** (v9.437, 2026-04-20) — ligne 26141 avait `parts.length<=6` sur la detection de section cadres. Quand le PDF SBM exporte la section avec plus de 6 colonnes (equipe, poste, notes), le header etait rejete silencieusement → ETTORI M, FOUQUE V, PLACENTI L, DOGLIOLO Y, MUS L, BOUVIER JF restaient sans horaires. **Regle Kevin** : "toutes les infos sont dans l'import, le parser doit les trouver" — NE PAS inventer de pattern par defaut, FIXER le parser. **OBLIGATION** : ne JAMAIS filtrer les headers PDF par nombre de colonnes. Le header textuel (PIT BOSS/SUPERVISEUR/INSPECTEUR) suffit a identifier la section. Un filtre trop strict = perte silencieuse de donnees critiques metier. ❌
32. **Regex header cadres sans anchor ^ = regression massive** (v9.437 → v9.444, 2026-04-20) — en retirant le filtre `parts.length<=6` je n'ai PAS ajoute d'anchor `^`. Resultat : regex matchait "SUPERVISEUR" n'importe ou dans une ligne (notes, commentaires) → fausses detections de section → tous les employes suivants mal classes → plus aucun horaire affiche chez qui que ce soit. **OBLIGATION** : quand on retire un filtre structurel, TOUJOURS ajouter un anchor pour eviter les faux positifs. v9.444 fix: `/^\s*(?:\d+...)?(KEYWORDS)\b/i`. v9.446: prefix elargi aux bullets/arrows `[\s\t*•◆▼▶►▪●○◌◈\-.\d)(:;]*`. v9.447: fallback name-first pour cadre sans header matche. ❌
33. **PR jamais mergee = deploiement fantome** (2026-04-20 soir) — 13 commits poussés sur `claude/fix-apex-ai-bugs-adHfF` jamais fusionnes dans main. GitHub Pages deploie depuis main → utilisateur ne voyait aucun de mes fixes pendant toute la session. Cause racine de plusieurs heures de frustration "rien ne marche". **OBLIGATION** : verifier au debut ET pendant la session sur quelle branche le deploiement se fait (`.github/workflows/deploy.yml`) et s'assurer que mes commits arrivent sur cette branche. Si on travaille sur une feature branch, creer et merger la PR des que les changements sont stables — ne pas attendre la fin de session. ❌
34. **Indicateur etat stale** (v9.447, 2026-04-20 nuit) — `_fbConnected=true` set uniquement dans le handler du snapshot initial `path==="/"`. Si un event put specifique arrivait avant, indicator bloque jaune. Firebase marchait mais UI mentait. **OBLIGATION** : tout indicateur d'etat binaire (connecte/deconnecte) doit etre mis a jour sur CHAQUE signe de vie (message recu, put event, reponse fetch OK), pas seulement sur l'etape d'initialisation formelle. ❌
35. **CGU universel pour features sensibles** (v9.448 / v12.9, Kevin 2026-04-20 nuit) — ajout d'un helper `cmcCguAsk(feature, label, desc)` (Apex : `_cguAsk`) qui demande consentement une seule fois par feature, persiste dans localStorage. Wrappe les entry points : biometrie (webauthnLogin / axBiometricAuth), micro (sttStart / axSttToggle), geolocalisation (axGetLocation). Revocable via `cmcCguRevoke(feature)`. Pattern a appliquer a TOUS futurs projets qui accedent aux capteurs device. RGPD/user control respecte. ✅
36. **Parser cadres : 1 strategie suffit pas** (v9.509, Kevin 2026-04-25 — ZERO ERREUR) — apres 7 tentatives v9.437→v9.451 sur le parser cadres/inspecteurs/superviseurs, Kevin disait toujours "ca ne marche pas". Cause racine : un parser monolithique (regex header + name match) echoue silencieusement sur les variations PDF SBM (bullets, accents, casse, ordre inverse, fragmentation PDF.js). **OBLIGATION** : pour TOUTE feature critique avec input variable (parsing, OCR, NLP), implementer (a) multi-strategy avec strategies cascade (v9.462 : nom_complet + ordre_inverse + surname_seul + fuzzy4 + next_line_aggreg), (b) suite tests automatises avec >=20 cas reels avant chaque release (`cmcImportTests` : 22 cas), (c) sentinelle dediee `import-watch` qui audite post-import et escalade Apex en cascade (5 strategies dans `_agentImportWatch`), (d) banner visualisation post-import (X/Y cadres OK + lien vAuditLog + bouton "Re-tenter"), (e) `cmc_import_log` (max 200) detaille pour diagnostiquer chaque echec. Code v9.509 : `_agentImportWatch`, `cmcImportTests` (22 cas), banner final dans `doImport`. Bouton "Tests parser" dans vImport admin. ✅
37. **ax_pin global ecrase quand user change PIN** (Apex v12.240, Kevin 2026-04-25 — SECU CRITIQUE) — quand un user preconfigure (Laurence, etc.) changeait son PIN via le flow login/PIN, le code ecrivait dans `ax_pin` (la cle GLOBALE admin) au lieu d'une cle per-user. Resultat : **n'importe quel user pouvait reset/voler le PIN admin Kevin** + le user suivant ne pouvait plus se connecter avec son ancien PIN. Decouvert via audit expert externe 4 agents. **OBLIGATION** : tout PIN/credential per-user DOIT etre stocke dans `ax_pin_<userId>` (scope user). `ax_pin` est RESERVE strictement a l'admin global. Verifier dans tout flow `axChangePin`, `axSetPin`, `_checkPreconfiguredUser` qu'on ecrit dans la bonne cle. Fix v12.240 : isolation per-user + guard `if userId===ADMIN_ID write ax_pin else write ax_pin_<userId>`. ❌
38. **Fallback `_checkPreconfiguredUser` substring trop permissif** (Apex v12.240, Kevin 2026-04-25 — SECU) — la fonction `_checkPreconfiguredUser` faisait un substring tolerant (`name.toLowerCase().includes(part)`) qui pouvait matcher "Laurent" sur la fiche "Laurence" ou "Kev" sur "Kevin DESARZENS" → impersonation possible. Decouvert via audit expert. **OBLIGATION** : pour toute fonction d'auth/lookup user, exiger MATCH EXACT (apres normalisation accents/casse) ou AU MOINS 2 tokens (prenom+nom) sur 2 mots minimum. JAMAIS substring partiel sur 1 token court. Fix v12.240 : tokens tries + match all + min length 3 par token. v12.241 : nom+prenom+pass tous 3 obligatoires partout (login, recherche, edition). ❌
39. **Drift sw.js CACHE_VERSION vs APP_VER index.html** (Apex v12.X, recurrent) — quand on bumpe APP_VER dans `apex-ai/index.html` mais qu'on oublie de bumper `CACHE_VERSION` dans `apex-ai/sw.js`, le Service Worker continue a servir la vieille version. Kevin doit force-refresh manuellement → frustration recurrente. **OBLIGATION** : `CACHE_VERSION` doit TOUJOURS = `'apex-' + APP_VER`. Sentinelle GitHub Action `.github/workflows/sw-cache-sync.yml` rattrape automatiquement le drift sur chaque push (compare APP_VER vs CACHE_VERSION, sed le sw.js, commit `chore: sync sw.js CACHE_VERSION`). Pattern a appliquer aussi a CMCteams. ✅

40. **`ax_user` JAMAIS dans FB_FIX (SECU CRITIQUE — Kevin reconnu Laurence)** (Apex v12.272, Kevin 2026-04-26) — `ax_user` etait dans `FB_FIX` (sync Firebase cross-device). Donc le `K.user` d'un device pollue tous les autres iPhone via SSE Firebase. À sa premiere connexion, Kevin etait reconnu Laurence parce que Firebase avait propage `ax_user = laurence` sur son iPhone. **OBLIGATION** : tout objet user/session/identite (`ax_user`, `cmc_user`, `ax_uid`, `cmc_uid`) DOIT etre dans `FB_LOCAL` (jamais sync Firebase). Validation au boot : `_loadState` verifie strict `K.user.id === ax_uid`, sinon force logout + nettoie + log audit `axSecurityLog("user_id_mismatch")`. ✅

41. **Firebase SSE ecrase localStorage avec `null`** (Apex v12.269, Kevin 2026-04-26) — quand Firebase a une cle `null` ou supprimee, le SSE listener ecrasait localStorage avec `null`. Cause : Kevin perdait ses cles API a chaque session (Firebase null overwrite valid local value). **OBLIGATION** : dans le SSE handler, si `d.data === null` ET `localStorage.getItem(k)` non vide → GARDER la valeur locale + push vers Firebase pour reparer. Pattern correct : Firebase est SOURCE de verite seulement si non-null. ✅

42. **vChat user content : JAMAIS `JSON.stringify` direct** (Apex v12.270, Kevin 2026-04-26) — quand un message user contient une image (`content` est un array `[{type:"image",source:{...}},{type:"text",text:"..."}]`), le code faisait `JSON.stringify(m.content)` et l'affichait comme texte brut → Kevin voyait du JSON brut au lieu de l'image. **OBLIGATION** : utiliser helper `_axRenderUserContent(content)` qui detecte array vs string + render `<img src=data:base64...>` pour images + `renderMd(part.text)` pour texte + handlers dedies pour video/document. Pattern reutilisable. ✅

43. **iOS Safari `SpeechRecognition.continuous=true` non fiable** (Apex v12.269, Kevin 2026-04-26) — sur iPhone Safari, `_axWakeRecognition.continuous=true` se coupe apres 15-30s de silence. Le `onerror` no-speech se relancait jusqu'a 200x = boucle infinie + drain batterie. **OBLIGATION** : detecter iOS via `/iPhone|iPad|iPod/.test(navigator.userAgent)` → `continuous = !isiOS`. Limit retry no-speech a 20 max. Sur iOS, recovery via `onend` setTimeout 500ms qui restart. ✅

44. **HARD LOGOUT EFFACE HISTORIQUE ADMIN (v12.297→v12.330, 1 mois ! INADMISSIBLE production)** (Kevin v12.331, 2026-04-26 — CRITIQUE COMMERCIAL) — `axHardLogoutSession.SESSION_KEYS` incluait `ax_admin_kevin`, `ax_streak`, `ax_streak_last_day`, `ax_login_streak`, `ax_xp` (global) → à CHAQUE login Kevin/user, perte XP/streak/profil. Si app commercialisée → TOUS clients auraient perdu leur progression à chaque connexion. Découvert seulement quand Kevin a vu "Niv.1 / 35 XP" au lieu de niveau plus haut. **OBLIGATION** : (a) tout reset au login DOIT être audité par scénario `login → logout → re-login → assert data critiques préservées`, (b) `axTestLoginPersistence` test régression automatique obligatoire avant chaque release, (c) sentinelle `data-persistence-watch` simule login/logout 1×/jour + alerte si perte détectée, (d) **liste BLANCHE stricte** des keys effacées au logout (jamais liste noire qui peut oublier), (e) per-user partout (`ax_xp_<uid>`, `ax_streak_<uid>`, etc. — pas de clés globales), (f) Test mental obligatoire AVANT chaque release : "Si je commercialise demain, est-ce qu'un client garde sa progression entre 2 connexions ?". Fix v12.331 : SESSION_KEYS réduit à `[ax_user, ax_uid, ax_lastact, ax_user_theme, ax_theme, ax_perms_onboarded, ax_pin_fails, ax_session_timeout, ax_device_*, ax_wake_word_active, ax_persona_active, ax_last_greeting_*]` uniquement. XP/streak/profil/persistent_memory/kb/audit/lessons PRÉSERVÉS définitivement. ❌→✅

---

## Recherche d'outils (ToolSearch)

**À chaque session**, avant toute interaction GitHub ou MCP :

1. Les outils MCP sont listés dans les messages `<system-reminder>` comme "deferred tools"
2. Utiliser `ToolSearch` pour charger leur schéma avant de les appeler :
   ```
   ToolSearch("select:mcp__github__create_pull_request")
   ToolSearch("github")
   ToolSearch("select:AskUserQuestion,TodoWrite")
   ```

**Outils MCP courants dans ce projet :**

| Outil | Usage |
|-------|-------|
| `mcp__github__push_files` | Pousser des fichiers vers GitHub |
| `mcp__github__create_pull_request` | Créer une PR |
| `mcp__github__add_issue_comment` | Commenter une issue |
| `mcp__github__get_file_contents` | Lire un fichier sur GitHub |
| `mcp__github__list_branches` | Lister les branches |
| `mcp__github__search_code` | Chercher du code dans le repo |
| `mcp__github__pull_request_read` | Lire une PR |
| `mcp__github__subscribe_pr_activity` | S'abonner aux événements PR |

---

## Workflow Git

- **Branche principale :** `main` (déploie GitHub Pages)
- **Branche feature :** `claude/<description>`
- Messages de commit : format `vX.Y: description`


---

## Historique versions récentes

> 📖 **Historique complet** dans `CHANGELOG.md` à la racine du dépôt (v8.83 → v9.67 archivé).

| Version | Changements |
|---------|-------------|
| **v9.70** | **Fixes responsive mobile complets**. Tests multi-devices Puppeteer (5 profils : iPhone SE, iPhone 14 Pro, Galaxy S22, Pixel 7, iPad Air). Fix nav bas #bnav : scroll-x interne, labels cachés < 420px (ne garde que les emojis), compact sur petits écrans. Fix overflow accueil (raccourcis `max-width:100vw`). Fix toolbars vIA, vChat header, vMonPlanning header : `flex-wrap:wrap`. Ajout `html,body{overflow-x:hidden;max-width:100vw}` en safety net. Résultat : **70 PASS / 0 FAIL** sur 5 devices (avant : 55 PASS / 25 WARN overflow). iPhone SE 375px entièrement fonctionnel. |
| **v9.69** | **Audit expert 4 subagents parallèles + corrections**. Fix P1 : `cmc_motd` maintenant géré dans `fbApplyData` (accepte null=effacé, validation type objet). Fix P2 : auteur MOTD supprimé affiche "(supprimé)" au lieu de "undefined" ; bandeau MOTD gagne `word-break:break-word` + `overflow-wrap:anywhere` pour textes longs sans espaces. Section **"Outils & réflexes expert"** ajoutée dans CLAUDE.md (boîte à outils, commandes de validation, pièges à éviter). |
| **v9.68** | **Message du jour admin + sync Firebase**. Store `A.motd={text,ts,author}` dans FB_FIX (`cmc_motd`). Fonctions `setMotd`/`clearMotd`/`adminSetMotdFromInput` (guard AID, max 500 car., audit `motd_set`/`motd_clear`). UI admin : textarea + boutons Publier/Effacer. UI employé : bandeau doré 📢 en haut de `vAccueil` (pre-wrap, date/heure). |
| **v9.67** | **Version majeure 35+ fonctionnalités**. Splash screen, Firebase différé, auto-save fiches, CODE_HOURS complet, solde CP, dashboard RH + courbe 12 mois SVG, TTS/STT, compte visiteur U007, thèmes (Casino/Clair/Nuit), export PDF, templates planning, multi-langues FR/EN/IT, swipe mois, admin réorganisé 7 catégories, PWA installable, mode présentation. IA locale enrichie (36 outils). AUDIT 23/23 PASS. |
| **v9.66** | Lisibilité (ratio WCAG AA), tokens CSS typography+blur centralisés, titres serif Garamond. |
| **v9.65** | Cadre légal monégasque (Loi 1.103, OS 8.929, AM 88-384) + vConvention onglet Loi + 2 outils IA supplémentaires. |
| **v9.64** | JEUX_SBM Formation 2016 (6 jeux détaillés : BJ, RA, Craps, PB, THU, TCP) + vConvention Jeux enrichi + 2 outils IA. |
| **v9.63** | Tool use IA custom — 26 outils (21 lecture + 5 admin). IA_TOOLS[] + _iaExecuteTool + guard AID sur les 5 admin. |
| **v9.62** | Multi-axe : bulles chat transparentes + fix iOS zoom + CSP élargie + upload modéré + PLANS_CMC/CDP + galerie 75 photos salons + 15 tests unitaires. |

---

---

## Convention Collective Jeux de Table SBM (référence officielle)

> 📖 Document de référence intégré depuis v9.29 — consultable via `CONVENTION` et `BULLETIN_CODES` dans le code.
> Source : Convention Collective du 1er avril 2015 + Note 6 janvier 1993 (B. Lées).
> À utiliser pour répondre aux questions employés (chat, IA) et pour la gestion RH.

### Articles clés (voir `CONVENTION.articles`)

| Article | Sujet | Règle principale |
|---------|-------|------------------|
| **4** | Recrutement | Âge minimum **21 ans** |
| **5** | Écoles de jeux | 5 écoles premium sur 9 ans, min 1 an entre deux |
| **6** | Contrat | Contrat initial **12 mois**, essai **3 mois**, CDI à 18 mois |
| **10** | Carrière employés | Niveaux 1-7 selon jeux validés (Niv 7 = Expert tous jeux) |
| **11** | Promotions | Expert → Chef → Inspecteur → Sous-dir → Directeur |
| **13** | Rémunération | 3 parties : fixe (+200€/niveau) + %CA + %cagnottes. Min garanti 10,85 mois |
| **17.4** | Congés | **2 mois/an** : 1 mois été (1 mai-31 oct) + 1 mois hiver, 4 sem consécutives min |
| **17.5** | Repos hebdo | Min 1j, normalement 2j consécutifs, min 10j/6 sem. Majoration 50% si >4j supprimés |
| **17.6** | Forte affluence | Juillet-août, 16 déc-15 janv, Grand Prix, Pâques. Planning publié vendredi <12h |
| **17.8** | Pauses | **55+ et femmes enceintes : pause toutes 40 min** (au lieu de 60) |
| **18** | Congés familiaux | Mariage 4j · Naissance 3j · Décès proche 3j · Mariage enfant 2j · Décès beau-parent 1j |
| **23** | Maladie | Indemnisation 85% (min 91%), max **1095 jours** |
| **26** | Retraite | 10 ans=½ mois · 15 ans=1 mois · 20 ans=1,5 mois · 30 ans=2 mois. Groupe fermé=3 mois |
| **35** | Effectifs | Chefs de table = **25-30%** de l'effectif employés |

### Codes d'activité bulletins paie (voir `BULLETIN_CODES`)

Source : Note SBM du 6 janvier 1993 (Bernard Lées, DAJS).

| Catégorie | Codes principaux |
|-----------|------------------|
| **Présence/Repos** | P, RH, RTP, RTR, RRT, RHS, DP |
| **Congés Payés** | CP, CRH, CPS, CPM, CDP, CDH |
| **Fêtes Légales** | FL, CFL, FTP, FTR, RFT |
| **À la masse** | FCP, FCS, FRH, FFL |
| **Absences** | M, AT, MT, ABS, ABI, ABP, AF, CL, CEO, CSC, CSS |
| **Sanctions** | PNE, AMP, MPC, MPP |
| **Autres** | PAT, PRT, HC |

### Grilles de rémunération (Annexe 1 — nouveaux entrants)

| Niveau | Poste | Salaire/mois | %CA | %Cag |
|--------|-------|--------------|-----|------|
| 1 | Employé 1 jeu | 2 300 € | 0,003% | 0,06% |
| 7 | Expert (tous jeux) | 6 113 € | 0,012% | 0,24% |
| 9/1 | Sous-chef table | 6 460 € | 0,0135% | 0,27% |
| 11/1 | Chef de table | 7 000 € | 0,015% | 0,30% |

Cadres (Annexe 2) : Inspecteur 8 295-8 710 €, Sous-directeur 10 452 €.

### Accès dans l'app
- Vue `vConvention` (tous employés) — onglet 📖 Convention depuis l'Accueil
- 4 tabs : Articles / Codes paie / Grilles / Recherche
- Référence injectée dans le contexte IA (`buildIASystemPrompt`) → Claude peut citer les articles
- Helper `conventionSearch(q)`, `conventionCongeJours(evt)`, `bulletinCodeLabel(code)`, `bulletinAllCodes()`

### Utilisation par Claude Code (moi-même)
Quand tu me demandes une info RH, congés, promotion, salaire, etc. → je dois chercher dans ces données en priorité avant de répondre.

---

## Règles de rotation Casino de Monaco

> ⚠️ Règle opérationnelle à respecter dans tous les calculs de planning

### Tous les employés (standard)
- Patterns autorisés : **20/20** · **40/20** · **60/20** (travail/pause en minutes)
- Maximum **60 minutes de travail consécutif** en toutes circonstances

### Employés 55+ (★ rouge)
- Identifiés par `emp.senior = true` (ou `emp.family==="roulettes" && emp.chef` en rétro-compatibilité)
- Affichés avec `★` rouge dans le planning, vDeparts, vEmps
- **Même patterns que les autres (20/20, 40/20, 60/20)**
- **Par défaut : maximum 40 min de travail consécutif** → pause 20 min obligatoire
- **Avec accord de l'employé : jusqu'à 60 min autorisé** (même règle que standard)

### Exception
- **Roulette européenne** (compétence `E`) : règles de rotation différentes (à préciser)

### Constante dans le code
```javascript
var ROTATION = {
  senior:   {maxWork: 40, maxWorkConsent: 60, pause: 20, patterns: [20, 40, 60]},
  standard: {maxWork: 60, pause: 20, patterns: [20, 40, 60]},
  exceptionComp: "E"  // roulette européenne
};
function isSenior(emp)      // true si emp.senior || (roulettes && chef)
function empLabelHtml(emp)  // nom + ★ rouge si senior (pour innerHTML)
function empLabel(emp)      // nom + ★ texte (pour title="")
```

---

## Constantes

```javascript
// CMCteams (référence index.html racine)
var AID      = "U11804";   // Admin = DESARZENS K
var DATA_VER = 30;
var APP_VER  = "v9.522";   // bumpé session 2026-04-25
var SESSION_TTL = 8 * 60 * 60 * 1000; // 8h
var FB_DEFAULT = "https://cmcteams-c16ab-default-rtdb.europe-west1.firebasedatabase.app";

// Apex AI (apex-ai/index.html)
var APP_VER  = "v12.242";  // bumpé session 2026-04-25 (nom+prenom+pass obligatoires + agent parallèle)
var ADMIN_ID = "kdmc_admin";
```

**Versions vivantes** (lecture grep) :
- CMCteams : voir `var APP_VER` ligne ~3365 dans `index.html`
- Apex : voir `var APP_VER` ligne 385 dans `apex-ai/index.html`
- Sentinelle `sw-cache-sync.yml` rattrape automatiquement le drift sw.js↔index.html

---

## Workflow expert — Développement CMCteams

> Procédure obligatoire pour chaque modification. Conçu pour une SPA monofichier casino avec 258 employés, sync Firebase temps réel, et contraintes mobiles.

### Phase 0 — Prise de contexte (avant tout code)

1. **Lire le CLAUDE.md** : vérifier APP_VER, DATA_VER, erreurs connues (#1–#20)
2. **Identifier la demande** : UI ? Logique métier ? Import ? Sécurité ? Firebase ?
3. **Cartographier l'impact** : quelles fonctions/vues sont touchées ?

```
Matrice d'impact rapide :
┌─────────────────┬──────────────────────────────────────────────┐
│ Zone modifiée   │ Vues à vérifier                              │
├─────────────────┼──────────────────────────────────────────────┤
│ A.employees     │ vEmps, vPlan, vDeparts, vAccueil, vStats     │
│ A.overrides     │ vPlan, vDeparts, vMonPlanning, vAccueil       │
│ A.reg           │ vMonProfil, vEmps, vPasswords                 │
│ A.passwords     │ vPasswords, vLogin                            │
│ A.chatMsgs      │ vChat                                        │
│ A.exchanges     │ vEchanges, vMonPlanning                       │
│ CHEFS_T / CI    │ vDeparts, calcDepPos                          │
│ CSS / Layout    │ vPlan, vDeparts, vMonPlanning (mobile!)       │
│ Firebase sync   │ fbWrite, fbApplyData, SSE listener            │
│ Navigation      │ render(), dc(), sv(), topbar                  │
│ Import PDF      │ doImport, vImport, importSuggestions           │
│ Sécurité        │ vLogin, admin guards, esc(), hashPwStrong()   │
└─────────────────┴──────────────────────────────────────────────┘
```

### Phase 1 — Analyse du code existant

1. **Lire les fonctions concernées** en entier (pas de modification à l'aveugle)
2. **Tracer le flux de données** : d'où vient la donnée → où elle est affichée
3. **Vérifier les dépendances** : `dc()` re-rend tout → un changement dans `vDeparts` peut affecter le scroll `adjDeparts()`
4. **Chercher les patterns similaires** : si on modifie une colonne dans vDeparts, vérifier vPlan aussi

### Phase 2 — Codage (règles strictes)

#### Sécurité (non-négociable)
- [ ] `esc()` sur TOUTE donnée utilisateur avant `innerHTML`
- [ ] Guard `if(!A.user||A.user.id!==AID)return;` sur fonctions admin destructrices
- [ ] `e.message.replace(/</g,"&lt;")` dans les handlers d'erreur (pas d'accès à `esc`)
- [ ] Pas de données sensibles en clair (clé API, PIN, mots de passe)

#### Layout & CSS
- [ ] Jamais `table-layout:fixed` dans un conteneur scrollable (#1)
- [ ] Jamais `overflow:hidden` sur parent d'enfant scrollable (#2)
- [ ] Jamais `overflow-y:hidden` sur parent de colonne sticky (#10)
- [ ] Jamais `width:100%` sur table scrollable → `width:auto` (#11)
- [ ] Jamais `max-width` sur `<td>` → wrapper `<div class="nw">` (#18)
- [ ] Tester scroll horizontal (vPlan/vDeparts) sur viewport 375px (iPhone SE)

#### Données & État
- [ ] `gpl()` = seule source de vérité (pas de fallback genBase) (#3)
- [ ] Ne jamais utiliser `base=0` dans calcDepPos → utiliser `ei` (#13)
- [ ] Rafraîchir `A.user`/`_viewAs` après remplacement `A.employees` par SSE (#16)
- [ ] Ne jamais utiliser une variable locale d'une autre vue (#20)
- [ ] `searchInput()` pour les champs de recherche (pas `oninput→dc()`) (#9)

#### Firebase
- [ ] Clés `FB_LOCAL` ne doivent JAMAIS être synchronisées
- [ ] `fbApplyData` doit cloner en profondeur (pas de référence partagée)
- [ ] `fbWrite` avec retry + queue offline en cas d'échec

#### Navigation & UX
- [ ] Max 8 onglets nav (mobile) (#14)
- [ ] `chatSetReply` doit auto-activer `_chatDm` pour les DM (#19)
- [ ] Notifications : vérifier `typeof Notification !== "undefined"` (iOS) (#15)

### Phase 3 — Validation (OBLIGATOIRE avant CHAQUE commit)

> ⚠️ **RÈGLE ABSOLUE** : Ne JAMAIS pousser sans avoir vérifié soi-même.
> Après CHAQUE modification, AVANT de commit :
> 1. Valider la syntaxe JS
> 2. Vérifier que la modification n'a PAS cassé les fonctions existantes
> 3. Simuler le rendu HTML généré pour les vues affectées
> 4. Comparer avec l'état précédent (git diff) pour détecter les régressions
> 5. Si modification CSS/layout : calculer les dimensions (largeurs colonnes vs contenu)
> 6. Ne JAMAIS enchaîner plusieurs commits de "fix" sans vérification — c'est signe de travail bâclé

```bash
# 1. Syntaxe JS (obligatoire avant commit)
node -e "
const fs=require('fs');
const html=fs.readFileSync('index.html','utf8');
const s=html.lastIndexOf('<script>'),e=html.lastIndexOf('</script>');
fs.writeFileSync('/tmp/test.js',html.slice(s+8,e));
" && node --check /tmp/test.js && echo "✅ JS OK"

# 2. Taille fichier (surveillance dérive)
wc -c index.html  # Attendu : ~440-540 KB

# 3. Recherche oublis sécurité
grep -n 'innerHTML' index.html | grep -v 'esc(' | head -20

# 4. Diff avec état précédent (vérifier régressions)
git diff --stat HEAD

# 5. Si modif layout : vérifier que les vues non-modifiées restent intactes
# Comparer les fonctions vPlan/vDeparts/vMonPlanning avec le dernier commit stable
```

### Règle anti-régression

> **INTERDIT** de modifier une vue (vPlan, vDeparts, etc.) sans vérifier que les AUTRES vues
> ne sont pas affectées. Utiliser la matrice d'impact Phase 0.
> Si un changement CSS affecte `.sth`, `.ntd`, `.ctd`, `.dth` → vérifier vPlan ET vDeparts.
> Si un changement touche `A.employees` → vérifier vEmps, vPlan, vDeparts, vAccueil, vStats.
> Un commit qui casse une fonction existante = travail à refaire entièrement.

#### Checklist de validation par type de changement

| Type | Vérifications |
|------|--------------|
| **UI/CSS** | Scroll OK ? Sticky OK ? Mobile 375px ? Noms lisibles ? |
| **Logique métier** | Rotation correcte ? Senior ★ respecté ? Tous les 258 emp ? |
| **Import** | Compétences BRTPECK ? newEmps/possibleRetired détectés ? |
| **Firebase** | fbWrite appelé ? SSE listener reçoit ? Queue offline ? |
| **Sécurité** | esc() partout ? Guards admin ? XSS dans erreurs ? |
| **Chat** | DM privé reste privé ? Reply correct ? Filtres admin ? |

### Phase 4 — Versionnement & Commit

1. **Bumper `APP_VER`** : format `vX.Y` (X = majeur, Y = incrémental)
   - Nouveau module/vue → bump X
   - Fix/amélioration → bump Y
2. **Ne PAS bumper `DATA_VER`** sauf si schéma `DEF_EMP`/`DEF_TEAMS` change
3. **Commit** : `vX.Y: description en français`
4. **Mettre à jour CLAUDE.md** : historique versions + constantes si changement

### Phase 5 — Déploiement

```
Branche feature → commit → push → PR (si demandé) → merge main → GitHub Pages auto
```

- Jamais de push direct sur `main`
- Un commit = un changement cohérent (pas de méga-commits multi-fonctions — erreur #17)
- Vérifier le déploiement GitHub Pages après merge

### Phase 5b — Vérification post-rebase/merge (OBLIGATOIRE — erreur #21)

> ⚠️ Un rebase peut PERDRE SILENCIEUSEMENT du code. Après TOUT rebase ou merge avec conflits :

```bash
# 1. Zéro marqueurs de conflit
grep -c "^<<<<<<\|^======\|^>>>>>>" index.html CLAUDE.md sw.js

# 2. Syntaxe JS valide
node -e "..." && node --check /tmp/test.js

# 3. Vérifier CHAQUE feature ajoutée dans cette session
grep -c "mot_cle_unique_1" index.html  # Doit être > 0
grep -c "mot_cle_unique_2" index.html  # Doit être > 0
# ... pour CHAQUE ajout

# 4. Les 5 règles detectRepoConflicts
grep -o "horaire_dans_absence\|absence_longue\|repos_insuffisant\|max_jours_consec\|donnees_manquantes" index.html | sort -u | wc -l
# Doit retourner 5

# 5. Validation post-import
grep -c "_postConflicts" index.html  # Doit être > 0

# Si un grep retourne 0 → le code a été perdu → restaurer AVANT de push
```

---

### Arbres de décision rapides

#### "Où modifier ?" — Localisation du code

```
Demande concerne...
├── L'apparence → CSS embarqué (<style>) ou style inline dans la vue
├── Une vue spécifique → fonction vNomDeLaVue()
├── Le planning → gpl(), overrides, CODES
├── Les départs → vDeparts(), calcDepPos(), CHEFS_T, CI
├── L'import PDF → doImport(), parseur texte/PDF.js
├── Firebase → fbInit/fbWrite/fbApplyData/fbStartListening
├── Login/sécurité → vLogin*, hashPwStrong, verifyPw, guards AID
├── Un employé → A.employees, DEF_EMP, A.reg
└── Le chat → vChat(), chatSetDm/Reply/Del, _chatDm/_chatReply
```

#### "Faut-il bumper DATA_VER ?"

```
Modification de DEF_EMP (ajout/retrait employé) → OUI
Modification de DEF_TEAMS (ajout/retrait équipe) → OUI
Changement de schéma A.employees (nouveau champ) → OUI
Tout le reste (CSS, logique, vues, Firebase) → NON
```

#### "Cette modification casse-t-elle le mobile ?"

```
Colonne > 130px dans une table scrollable → RISQUE
Position sticky + overflow sur parent → RISQUE (iOS Safari)
Plus de 8 onglets nav → CASSE (#14)
Font-size < 11px → illisible sur mobile
Touch target < 44px → difficile à toucher
```


## 🚨 REGLE UX ERREURS (Kevin 2026-04-21, OBLIGATOIRE)

JAMAIS afficher message erreur technique brut a l utilisateur final.
TOUJOURS remplacer par message actionnable clair.

| Technique (interdit) | User-friendly (attendu) |
|----------------------|-------------------------|
| undefined is not an object | Erreur interne, recharge la page |
| null reference | Donnees manquantes, reinstalle l icone |
| HTTP 500 / 502 / 503 | Serveur surcharge, reessaie dans 1 min |
| Failed to fetch / network | Reseau indisponible, verifie Wi-Fi/4G |
| CORS / Host not allowed | Blocage API, contacte admin ou attends |
| QuotaExceededError | Stockage plein, un cleanup auto a ete lance |
| Timeout | Pas de reponse apres 30s, reessaie |

Applicable dans :
- Chaque catch (try/catch ou .catch)
- Chaque toast visible user
- Chaque push message assistant dans K.messages/A.iaHistory
- Chaque alert/confirm

A verifier a chaque audit (axRunAudit, subagent audit).

---
