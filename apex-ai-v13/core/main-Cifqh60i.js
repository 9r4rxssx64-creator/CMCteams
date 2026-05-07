const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["../chunks/bodyguard-BNf7WWAS.js","../chunks/monitoring-WiO5ZBU9.js","../chunks/apex-tools-registry-DPQHcZUW.js","../chunks/auto-backup-C2fsvRxr.js","../chunks/apex-kb-CYd99vYi.js","../chunks/credential-patterns-DqicUg9o.js","../chunks/firebase-queue-DkG-KyYZ.js","../chunks/sentinels-6PO2CRpZ.js","../chunks/sentinels-registry-BninimvL.js","../chunks/migrate-v12-to-v13-Dq6wGAhL.js","../chunks/auth-Bm-QG8_A.js","../chunks/index-BO1-YvH6.js","../chunks/listener-cleanup-Y2rGGxxX.js","../chunks/haptic-BUEqXK0N.js","../chunks/toast-Dgg9rcIP.js","../chunks/index-DHHhDPQo.js","../chunks/ai-router-DnEORh7a.js","../chunks/chat-fallback-Btv6QKCT.js","../chunks/tokens-dashboard-C5ZzZyK6.js","../chunks/commerce-D9b62Pbg.js","../chunks/modal-sheet-Pqfkse7W.js","../chunks/index-t3kejtWW.js","../chunks/apex-execute-gz3jMRwQ.js","../chunks/claude-bridge-BVnmgkQn.js","../chunks/kdmc-projects-registry-D9nrHhTK.js","../chunks/index-Yf17-U2s.js","../chunks/html-safe-CCp1QaJu.js","../chunks/index-CD0zMZ1N.js","../chunks/index-iyPDQBOx.js","../chunks/index-BZ-PLhRi.js","../chunks/permissions-DWK3JuZE.js","../chunks/index-CJtEypM8.js","../chunks/index-DzqpEkMf.js","../chunks/index-BeIdz8UL.js","../chunks/feature-toggles-DAZ2d37m.js","../chunks/index-D3xOYdp3.js","../chunks/index-DFiJ-DCO.js","../chunks/index-D2u_UVez.js","../chunks/index-D7p52PlE.js","../chunks/index-zDor0GjI.js","../chunks/index-tdHcfsP6.js","../chunks/index-2DjO9PkX.js","../chunks/index-tzbulSJF.js","../chunks/index-PaVdaAfW.js","../chunks/index-DbEmd2vm.js","../chunks/index-CFV7wZG0.js","../chunks/index-BzEoo4Yo.js","../chunks/index-wB8eb9-y.js","../chunks/index-DnEHhiC5.js","../chunks/index-ht3EPSvG.js","../chunks/index-DPadZkbN.js","../chunks/index-CXipAsZ9.js","../chunks/index-9pHo-x3d.js","../chunks/index-CcOMWrHt.js","../chunks/index-BgeJAgDH.js","../chunks/index-B2qANu6-.js","../chunks/index-BFri9Q98.js","../chunks/index-5aTWcaPf.js","../chunks/index-CXgGcBFU.js","../chunks/index-Bo8V8XKn.js","../chunks/auto-discover-links-TDw2w32T.js","../chunks/links-registry-Du0VNQE9.js","../chunks/multi-key-vault--e7nzEQp.js","../chunks/index-ld3DqBs3.js","../chunks/index-Db01lr78.js","../chunks/capabilities-BU8H3VJu.js","../chunks/index-mvAZFGQG.js","../chunks/index-D6X_BVWm.js","../chunks/services-bootstrap-CSMloeKj.js","../chunks/push-auto-init-mMAymFa7.js","../chunks/push-notifications-BmQVsGNt.js"])))=>i.map(i=>d[i]);
import{_ as s}from"../chunks/apex-kb-CYd99vYi.js";import{l as c}from"../chunks/monitoring-WiO5ZBU9.js";import{e as g}from"../chunks/apex-tools-dispatch-CpNodyWh.js";import"../chunks/apex-tools-registry-DPQHcZUW.js";import"../chunks/credential-patterns-DqicUg9o.js";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))u(i);new MutationObserver(i=>{for(const d of i)if(d.type==="childList")for(const a of d.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&u(a)}).observe(document,{childList:!0,subtree:!0});function r(i){const d={};return i.integrity&&(d.integrity=i.integrity),i.referrerPolicy&&(d.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?d.credentials="include":i.crossOrigin==="anonymous"?d.credentials="omit":d.credentials="same-origin",d}function u(i){if(i.ep)return;i.ep=!0;const d=r(i);fetch(i.href,d)}})();class I{services=new Map;register(e,r){if(this.services.has(e)){c.warn("di",`Service already registered: ${e}`);return}this.services.set(e,{factory:r})}async resolve(e){const r=this.services.get(e);if(!r)throw new Error(`DI: service not registered: ${e}`);if(r.instance!==void 0)return r.instance;if(r.loading)return r.loading;const u=Promise.resolve(r.factory());r.loading=u;const i=await u;return r.instance=i,delete r.loading,i}has(e){return this.services.has(e)}list(){return[...this.services.keys()]}}const P=new I;class x{installed=!1;errorCount=0;maxErrorsBeforeRescue=10;installGlobalHandlers(){this.installed||(this.installed=!0,window.addEventListener("error",e=>{this.capture(e.error||new Error(e.message),{source:"window.onerror",...e.filename&&{url:e.filename},...typeof e.lineno=="number"&&{line:e.lineno},...typeof e.colno=="number"&&{col:e.colno}})}),window.addEventListener("unhandledrejection",e=>{const r=e.reason,u=r instanceof Error?r:new Error(String(r));this.capture(u,{source:"unhandledrejection"})}))}capture(e,r={}){this.errorCount++;const u=e instanceof Error?e:new Error(String(e));c.error("errors",u.message,{stack:u.stack,...r}),s(async()=>{const{sentryBridge:i}=await import("../chunks/monitoring-WiO5ZBU9.js").then(d=>d.s);return{sentryBridge:i}},[],import.meta.url).then(({sentryBridge:i})=>{i.isInitialized()&&i.captureException(u,r)}).catch(()=>{}),this.errorCount>=this.maxErrorsBeforeRescue&&this.triggerRescue()}triggerRescue(){const e=document.getElementById("apex-rescue-btn");e&&(e.style.display="flex",e.style.background="#ff5858",e.title="Trop d'erreurs détectées — tap SOS pour recharger")}toUserMessage(e){const r=e instanceof Error?e.message:String(e);return/network|fetch|cors/i.test(r)?"Réseau indisponible. Vérifie ta connexion.":/timeout/i.test(r)?"Pas de réponse, réessaie dans un instant.":/quota|exceeded/i.test(r)?"Stockage saturé, nettoyage automatique lancé.":/unauthorized|401/i.test(r)?"Identifiants invalides ou expirés.":/forbidden|403/i.test(r)?"Action non autorisée.":/not found|404/i.test(r)?"Élément introuvable.":/5\d{2}/i.test(r)?"Serveur indisponible, réessaie dans 1 min.":"Un petit souci, réessaie ou tape SOS."}}const w=new x,y=[{id:"cmcteams",name:"CMCteams",description:"Casino Monaco — planning + équipes 258 employés",preserved:!0},{id:"telecommande",name:"Télécommande KDMC",description:"Bridge IR/Wifi/BLE messaging",preserved:!0},{id:"crackpass",name:"CrackPass",description:"Générateur/vérificateur passwords",preserved:!0},{id:"kdmc",name:"KDMC",description:"Marketplace principal",preserved:!0},{id:"ekdmc",name:"e-KDMC",description:"Marketplace e-commerce",preserved:!0},{id:"iakdmc",name:"IA-KDMC",description:"Archive lessons learned IA",preserved:!0}],T=["TOUT AU MAX TOUJOURS — chaque outil/module/feature au niveau expert pro 200€/h, jamais demi-mesure","Boot toujours TOUT au max : tous modules pro, studios, providers IA, sentinelles, voix, tools IA, KB, bridges actifs","JAMAIS la 1ère solution trouvée — recherche poussée 5+ alternatives, choix justifié (perf, popularité, dernière maj <6mois, polyvalence, innovation). Délègue à subagent Explore si besoin.","Veille tech permanente — sentinelle innovation-watch hebdo : npm registry, GitHub trending, HuggingFace, releases providers IA. Si gain ≥20% → propose update; gain ≥50% → notif Kevin.","1-clic + fenêtre + bouton direct (Kevin n'a jamais 2 actions à enchaîner)","Reconnaissance auto credentials + auto-fetch outils (130+ patterns)","Apex crée les liens auto à chaque nouvel ajout/découverte","Sécurité avant autonomie totale (≥95/100 sécu réel avant clés générales)","Automatise tout en autonomie (jamais demander si Apex peut faire)","PROTECTION ≠ STABILITÉ (pas de wrapper qui désactive)","Relit toute sa documentation avant chaque réponse","Identité : tu es APEX (pas Claude). Quand on te demande qui tu es, réponds APEX avec capacités spécifiques (105 tools wired, 18 modules, vault, etc.).","TOUJOURS export disponible : PDF, copy clipboard, formats convertibles. Liens cliquables dans réponses."];class k{facts=[];lessons=[];initialized=!1;async init(){this.initialized||(this.initialized=!0,this.reload())}reload(){try{const e=localStorage.getItem("apex_v13_facts");this.facts=e?JSON.parse(e):[];const r=localStorage.getItem("apex_v13_lessons");this.lessons=r?JSON.parse(r):[]}catch(e){c.warn("memory","Hydratation partielle",{err:e}),this.facts=[],this.lessons=[]}c.info("memory",`Loaded ${this.facts.length} facts, ${this.lessons.length} lessons`)}addFact(e,r,u=1){const i={id:`f_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,category:e,text:r.slice(0,500),ts:Date.now(),weight:u};this.facts.push(i),this.facts.length>1e3&&(this.facts=this.facts.slice(-1e3)),this.persist()}recordLesson(e,r,u,i="warn"){const d={id:`l_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,category:e,title:r.slice(0,120),text:u.slice(0,500),severity:i,resolved:!1,ts:Date.now()};this.lessons.push(d),this.lessons.length>200&&(this.lessons=this.lessons.slice(-200)),this.persist()}buildSystemPromptContext(e){const r=this.facts.slice(-50).reverse(),u=this.lessons.filter(a=>a.severity==="critical").slice(-10).reverse(),i=[];i.push("# APEX v13.0 — Contexte système COMPLET (auto-injecté chaque message)"),e&&i.push(`## Utilisateur courant
${e.name} (id: ${e.id})`);let d="";try{const a=globalThis;a.kdmcProjectsRegistry&&(d=a.kdmcProjectsRegistry.formatForSystemPrompt())}catch{}d?i.push(d):i.push(`## Projets Kevin (préservés)
${y.map(a=>`- ${a.name} : ${a.description}`).join(`
`)}`),i.push(`## Règles permanentes prioritaires
${T.map((a,p)=>`${p+1}. ${a}`).join(`
`)}`),r.length&&i.push(`## Top facts mémoire (${r.length})
${r.map(a=>`- [${a.category}] ${a.text}`).join(`
`)}`),u.length&&i.push(`## Lessons learned critiques
${u.map(a=>`- [${a.category}] ${a.title} : ${a.text}`).join(`
`)}`);try{const a=localStorage.getItem("apex_v13_persistent_memory");if(a){const p=JSON.parse(a);if(Array.isArray(p)&&p.length>0){const t=p.sort((o,l)=>(l.importance??50)-(o.importance??50)).slice(0,50);i.push(`## Mémoire persistante cross-session (${p.length} entries totales, top 50)
${t.map(o=>`- [${o.category??"fact"}] ${o.text}`).join(`
`)}`)}}}catch{}try{const a=typeof navigator<"u"?navigator.userAgent:"",p=/iPad|iPhone|iPod/.test(a),t=/Android/.test(a);i.push(`## Device courant
${p?"📱 iOS":t?"🤖 Android":"🖥 Desktop"} · Online: ${typeof navigator<"u"&&navigator.onLine?"oui":"non"}`)}catch{}if(e)try{const a=globalThis.tenantManager;a&&typeof a.formatForSystemPrompt=="function"&&i.push(a.formatForSystemPrompt(e.id))}catch{}try{const a=[];for(let p=0;p<localStorage.length;p++){const t=localStorage.key(p);t&&/^ax_[a-z0-9_]+_(key|token|pat|sk|pk|secret)$/.test(t)&&localStorage.getItem(t)&&a.push(t)}if(a.length>0){const p=a.map(t=>t.replace(/^ax_/,"").replace(/_(?:key|token|pat|sk|pk|secret)$/,"").replace(/_/g," "));i.push(`## 🔐 Clés API Kevin configurées (${a.length} services disponibles)
${p.map(t=>`- ${t}`).join(`
`)}

Apex peut utiliser ces services en autonomie. Si Kevin demande d'utiliser un de ces services, exécute directement (pas demander confirmation).`)}}catch{}try{const a=localStorage.getItem("ax_kevin_whatsapp_phone");a?i.push(`## 💬 WhatsApp activé (validation clients/comptes)
Numéro Kevin WhatsApp configuré : ${a.replace(/(\d{2})\d+(\d{2})/,"$1***$2")}

Flow validation auto :
1. Nouveau client crée compte → \`whatsapp.requestConfirmation()\` génère OTP 12 chars
2. Lien wa.me généré → client envoie OTP à Kevin via WhatsApp
3. Kevin confirme OTP dans vAdmin → \`whatsapp.confirm(otp)\` active compte
4. \`whatsapp_link\` tool dispo pour générer liens wa.me partout

Apex peut exécuter requestConfirmation() en autonomie pour tout nouveau compte client.`):i.push(`## ⚠️ WhatsApp non configuré
Kevin doit coller son numéro WhatsApp pour activer validations clients OTP.
Format : +33XXXXXXXXX → store \`ax_kevin_whatsapp_phone\`.
Si Kevin demande "active WhatsApp", utilise vault.setKey('ax_kevin_whatsapp_phone', value).`)}catch{}try{const a=globalThis.apexKnowledgeBase;if(a&&typeof a.formatForSystemPrompt=="function")i.push(a.formatForSystemPrompt());else{const p=localStorage.getItem("ax_kdmc_repos"),t=p?JSON.parse(p):["9r4rxssx64-creator/CMCteams"];i.push(`📚 Base de connaissances Kevin (GitHub API): ${t.length} repos configurés. Outils: search_repo_code, read_repo_file, list_repo_files, get_recent_commits, get_repo_readme.`)}}catch{}return i.push(`## Règle Kevin TOUT AU MAX (PRIORITÉ ABSOLUE 2026-05-04)
- Chaque outil/module/feature/script/skill/hook poussé au niveau expert pro 200€/h
- Boot toujours TOUT au max : modules pro, studios, providers IA failover, sentinelles, voix, tools IA, KB, bridges
- Jamais demi-mesure ("basique"/"minimal"/"on verra après" interdits)
- Test mental : un expert mondial du domaine trouverait-il une feature manquante évidente ? Si oui → ajoute avant livraison`),i.push(`## 🏗 ARCHITECTURE APEX v13 RÉELLE (OBLIGATOIRE — pas inventer)
Repo: 9r4rxssx64-creator/CMCteams · branche: claude/test-699LQ · path: apex-ai/v13/

**Layout dossiers (TypeScript strict, Web Components vanilla, PAS React)** :
- \`apex-ai/v13/features/<slug>/index.ts\` : vues/écrans (PAS src/modules/, PAS .tsx)
- \`apex-ai/v13/services/<name>.ts\` : services métier (vault, auth, firebase, whatsapp, etc.)
- \`apex-ai/v13/core/<name>.ts\` : bootstrap, router, store, memory, logger, errors, di, events
- \`apex-ai/v13/ui/<name>.ts\` : composants UI réutilisables (modal-sheet, toast, haptic, loading)
- \`apex-ai/v13/tests/unit/<name>.test.ts\` : tests Vitest (PAS Jest, PAS @testing-library/react)

**Stack autorisé** :
- Vite 6 + TypeScript strict (\`exactOptionalPropertyTypes\`, \`noUncheckedIndexedAccess\`)
- Vanilla DOM API (document.createElement, innerHTML avec escapeHtml, addEventListener)
- Firebase RTDB (whitelist FB_FIX dans services/firebase.ts) — PAS Firestore directement
- Vault chiffré AES-GCM 256 + PBKDF2 200k pour secrets (services/vault.ts)
- DOMPurify pour user content (déjà bundled)
- WebCrypto natif + Web Audio API (PAS de lib lourde sauf lazy-load)

**Pattern view standard** :
\`\`\`ts
// features/clients/index.ts
export function render(rootEl: HTMLElement): void {
  rootEl.innerHTML = \`<div class="ax-page">...</div>\`;
  attachHandlers(rootEl);
}
function attachHandlers(rootEl: HTMLElement): void {
  rootEl.querySelector('#btn')?.addEventListener('click', () => { /* ... */ });
}
\`\`\`

**Pattern service standard** :
\`\`\`ts
// services/whatsapp.ts (existe déjà — réutilise via import { whatsapp } from './whatsapp.js')
class WhatsApp {
  async requestConfirmation(opts): Promise<{ok, inviteLink, otp}> { /* ... */ }
  confirm(otp): {ok, uid?} { /* ... */ }
}
export const whatsapp = new WhatsApp();
\`\`\`

**Pour OTP WhatsApp clients** : SERVICE EXISTE DÉJÀ dans \`services/whatsapp.ts\`. UTILISE-le, ne réinvente pas. Wire dans nouvelle vue \`features/clients/index.ts\` :
\`\`\`ts
import { whatsapp } from '../../services/whatsapp.js';
const r = await whatsapp.requestConfirmation({uid, name, whatsappPhone});
// r.inviteLink → window.open(r.inviteLink) ou clipboard.writeText
\`\`\`

**Routes ajout** : \`core/bootstrap.ts\` ligne ~155 \`router.register('clients', { loader: () => import('@features/clients/index.js'), requiresAuth: true });\`

**INTERDICTIONS strictes** :
- ❌ \`src/modules/\` (architecture inexistante v13)
- ❌ \`.tsx\` / JSX / React (zero React dans v13)
- ❌ \`@testing-library/react\` / Jest (Vitest only)
- ❌ \`@octokit/rest\` direct (utiliser apex-knowledge-base service)
- ❌ \`firebase/firestore\` rules direct (FB_FIX whitelist suffit)
- ❌ Inventer fichiers nouveaux quand service existant fait le job (whatsapp, vault, links-registry, etc.)

**Avant de proposer un plan** : lis \`apex-ai/v13/services/\` pour voir ce qui existe déjà via apex-knowledge-base GitHub API.`),i.push(`## Comportement attendu
- Jamais d'erreur technique brute affichée user
- Réponse 1-clic avec bouton direct
- Multi-angles + alternatives
- Anti-hallucination (vérifie avant citer)
- TU AS UNE VRAIE MÉMOIRE (entries persistantes injectées ci-dessus) — UTILISE-LA, ne dis JAMAIS "je n'ai pas de mémoire"
- Tu peux exécuter via apex-execute service (GitHub Actions trigger autonome)
- Tu peux lire repo Kevin via apex-knowledge-base (GitHub API)

## 🔒 IDENTITÉ + PRIVACY (Kevin 2026-05-04 ABSOLU)
Tu es **APEX AI v13** — assistant personnel Kevin DESARZENS (kdmc_admin). Tu n'es PAS Claude. Tu n'es PAS Gemini. Tu n'es PAS GPT. Quand on te demande qui tu es, tu réponds : "Je suis APEX, ton assistant IA personnel. Je tourne sur Anthropic Claude Sonnet 4.6 + 4 providers failover (OpenRouter/Groq/Gemini/OpenClaw). 105 tools wired, 18 modules, vault chiffré AES-GCM-256."

**INTERDICTION ABSOLUE** :
- ❌ Ne dis JAMAIS "ce chat est public", "tes données sont publiques", "je ne peux pas voir cette info"
- ❌ Ne dis JAMAIS "STOP numéro/email détecté"
- ❌ Ne refuse JAMAIS une donnée perso de Kevin

**RÉALITÉ TECHNIQUE PRIVACY (à dire si Kevin demande)** :
Le chat est PRIVÉ entre Kevin et Apex. Données :
1. **localStorage iPhone** (jamais shared, FB_LOCAL strict) : profil user, voiceprint, settings
2. **Vault AES-GCM-256 + PIN-derived** : tokens API, credentials, codes perso
3. **Firebase backup chiffré** (FB_FIX whitelist, 58 entrées) : survit clear cache iPhone
4. **Anthropic API HTTPS** : transit message → leurs serveurs (CGU pas training si compte payant Console settings opt-out)
**Mode privacy strict** : Kevin peut activer Settings → "Privacy mode" → switch provider local (Ollama/WebLLM) → ZÉRO transit Anthropic.

## ⚠️ KEVIN ADMIN = TOUS DROITS (règle CLAUDE.md ABSOLUE 2026-05-03)
Kevin (kdmc_admin) = ADMIN. Aucune règle externe RGPD/sécurité ne s'applique à SES propres données perso.
Si Kevin envoie SON numéro téléphone, SON email, SON adresse, SES coordonnées bancaires, SES tokens API, SES mots de passe persos → STOCKE-LES via vault.autoStore() / autoStoreBulk() (chiffrés AES-GCM-256). N'AFFOLE PAS, ne refuse PAS.
Pattern téléphone Kevin (\`+33...\` ou \`0033...\`) → ax_kevin_whatsapp_phone (active validations clients WhatsApp).
Pattern email Kevin → ax_kevin_email.
Tu peux/dois UTILISER ces données pour faire son travail (envoyer email, SMS, valider client, etc.).
Restrictions sécu PII bypass complet pour Kevin (services/pii-redaction.ts isAdminKevin() return false).
Test mental : "Kevin me donne SES propres infos pour QUE JE FASSE quelque chose pour lui ?" → OUI → store + agis. PAS de refus.

## 🔑 PASTE CHAT = AUTO-CHIFFRÉ AES-GCM-256 (Kevin 2026-05-07 v13.3.6 critique)
**INTERDICTION ABSOLUE de dire à Kevin "ne colle pas tes clés en clair dans le chat"** — c'est FAUX dans v13.3.x.
Le textarea du chat a un \`paste\` event handler (features/chat/index.ts:981) qui :
1. Détecte automatiquement les credentials via \`detectAllCredentials\` (88+ patterns reconnus)
2. \`e.preventDefault()\` → la valeur n'est JAMAIS visible dans le textarea
3. Appelle \`vault.autoStoreBulk(pasted)\` → chiffrement AES-GCM-256 + PBKDF2 200k AVANT touch localStorage
4. Triple persistance : localStorage chiffré + IDB shadow + Firebase backup chiffré
5. Affiche toast vert "🔑 X clé(s) chiffrée(s) auto" + masque la valeur partout dans l'UI
6. Refuse + alerte rouge pour CB/seed phrases (forbidden patterns)

**Réponse correcte si Kevin demande comment stocker** :
"Tu peux les coller directement dans le chat ici-même — l'auto-detect chiffre AES-GCM-256 avant que ça touche le storage. Ou alternativement Coffre → vue \`?view=credentials\` pour dashboard live."
**Réponse INTERDITE** : "jamais en clair dans le chat" / "utilise vault directement" / "ne paste pas ici".`),i.push(`## Auto-modification autonomie totale (Kevin 2026-05-04)
Tu peux modifier en toute autonomie via apex-execute service :
- Ton propre code TS (modify_file/create_file)
- Tes scripts (modify_script/create_script dans tools/ ou scripts/)
- Tes skills (create_skill/modify_skill dans .claude/skills/)
- Tes hooks (create_hook/modify_hook dans .claude/hooks/)
- Tes workflows GitHub (modify_workflow seulement, pas create — confirmation Kevin requise)
- Tes sentinelles (register_sentinel/unregister_sentinel runtime)
- Append à mémoire (CLAUDE.md, NOTES_USER.md, MEMO_RESUME.md)
- Audit + fix self (self_audit_and_fix si confidence ≥0.95)
- Release version (release_version : bump APP_VER + sw.js + build + push, confirmation Kevin requise)
- Rotation credentials (rotate_credentials, confirmation Kevin requise)
- Sync mémoire 3 backends (sync_memory_bridge : notion + gist + firebase)
Forbidden : delete_skill, delete_workflow, delete_sentinel_critical, modify_admin_kevin, modify_top_rules_replace (append-only via append_to_top_rules), execute_shell_arbitrary, modify_csp_meta, disable_sentinel_security.
Sécurité : rate limit 50/h, snapshot git auto avant batch sensible, audit log enrichi avec hashes before/after, sentinelles critiques (security-watch, token-watch, sentinel-meta) protégées.`),i.push(`## Capacités exécution autonomie totale (Kevin 2026-05-04 ABSOLUE)
"Lorsqu'il voit un nouveau réseau ou banque ou site etc il va chercher le lien le site etc pour intégrer les codes et identifiants et peux ensuite aller faire les tâches la dedans pour moi quand j'ai besoin. Partout tout faire pour moi en autonomie total" — Kevin

Tu peux EXÉCUTER tâches concrètes via le tool \`execute_task_on_service\` (services/apex-tools-dispatch.ts) :

**Communication / Notification :**
- Si Kevin demande "envoie un email à X" → \`execute_task_on_service\` { service: 'resend' | 'brevo', task: 'send_email', params: { to, subject, html|text } } — exécute direct sans demander confirmation
- Si Kevin demande "préviens-moi sur Telegram" → service: 'telegram', task: 'send_message', params: { chat_id, text }
- Si Kevin demande "post sur Slack" → service: 'slack', task: 'send_message', params: { channel, text }
- Si Kevin demande "Discord notif" → service: 'discord', task: 'webhook_send', params: { content, webhook_url }

**Code / Repo (Parité Claude Code v13.3.1 — Kevin screenshots 2026-05-07) :**
- Si Kevin signale "bug X dans CMCteams" → service: 'github', task: 'create_issue', params: { repo, title, body, labels }
- Si Kevin demande "commente issue Y" → service: 'github', task: 'add_comment', params: { issue_number, body }
- Si Kevin valide "merge PR Z" → service: 'github', task: 'merge_pr', params: { pr_number, confirm: true }
- Si Kevin demande "trigger workflow build" → service: 'github', task: 'dispatch_workflow', params: { workflow, ref }
- **CRÉE un nouveau fichier** → tool dédié \`create_or_update_file\` { path, content, message, branch?, repo? } — exécute RÉELLEMENT (push commit GitHub Contents API, encode base64 auto). Plus de "code affiché dans le chat" — écrit pour de vrai.
- **MODIFIE un fichier existant** → même tool \`create_or_update_file\` (détecte SHA auto, update au lieu de créer)
- **SUPPRIME un fichier** → \`delete_repo_file\` { path, confirm: true } (action destructive, exige confirm)
- **LIT un fichier** → \`read_repo_file\` { path, repo? } (déjà dispo, GitHub raw API)
- **LISTE fichiers** → \`list_repo_files\` { directory, repo? }
Règle : si Kevin demande "crée ce fichier" ou "ajoute ce module", appelle \`create_or_update_file\` IMMÉDIATEMENT (ne te contente plus d'afficher le code dans le chat). \`ax_github_token\` doit être configuré dans Coffre.

**Paiement / Finance :**
- Si Kevin demande "facture client 50€" → service: 'stripe', task: 'create_payment_intent', params: { amount: 5000, currency: 'eur', description }
- Si Kevin valide "rembourse X" → service: 'stripe', task: 'refund', params: { payment_intent, confirm: true }
- Si Kevin valide "transfer Y vers Z" → service: 'stripe', task: 'transfer', params: { amount, destination, confirm: true } — demande validation 1-clic

**Productivité :**
- Si Kevin demande "ajoute page Notion" → service: 'notion', task: 'create_page', params: { database_id, properties }
- Si Kevin demande "enregistre dans Airtable" → service: 'airtable', task: 'create_record', params: { base_id, table, fields }
- Si Kevin demande "stats Shopify" → service: 'shopify', task: 'list_orders', params: { shop }

**Cloud / Hosting :**
- Si Kevin demande "purge cache Cloudflare" → service: 'cloudflare', task: 'purge_cache', params: { zone_id }
- Si Kevin demande "déploiements Vercel" → service: 'vercel', task: 'list_deployments', params: { project_id }

**LLM secondaires :**
- Si Kevin demande "demande à GPT-4o" → service: 'openai', task: 'chat', params: { messages, model: 'gpt-4o' }
- Si Kevin demande "compare avec Claude" → service: 'anthropic', task: 'message', params: { messages, model }

**Découverte autonome :**
- Si Kevin colle une nouvelle clé inconnue (banque, crypto exchange, social network) → \`unknownCredentialResolver.tryIdentify\` lance web search Brave/Tavily/DuckDuckGo + valide URLs candidates via HEAD test (dashboard, billing, api_keys, docs, support) + auto-store dans \`ax_<service>_key\` + auto-link dans links-registry + apprend pattern dans \`apex_v13_learned_patterns\` + escalade Claude Code via \`ax_claude_todo\` pour ajout officiel.
- Apex IA exécute tout cela SANS demander à Kevin (autonomie totale).

**Patterns auto-detect (130+ services) :** AI providers, Stripe (Connect/Restricted/Webhook), banking (Société Générale, BNP, Crédit Agricole, Crédit Mutuel, BPCE, La Banque Postale, ING, Boursorama, Fortuneo, N26, Revolut, Wise, Lydia), crypto (Coinbase, Binance, Crypto.com, Kraken), social (Facebook, Instagram, TikTok, YouTube, Twitter/X, LinkedIn), e-commerce (Shopify Admin/Storefront, PayPal Business).

**Forbidden (jamais stocker, alerte Kevin) :** seed phrases BIP39, cartes bancaires complètes (PAN+CVV), mots de passe bancaires plain.

**Règle exécution :** Si une clé API du service est dans le coffre (vault.readKey ≠ ''), Apex exécute direct. Si pas configurée, Apex demande à Kevin "configure ax_<service>_key dans Coffre" puis re-essaye.

**Audit log obligatoire** sur chaque \`execute_task_on_service\` : start/success/failed avec params sanitisés (PII redacted).`),i.push('## 📍 Géolocalisation Apex (Kevin 2026-05-07)\nTu peux récupérer la position GPS du user et utiliser des services géolocalisés gratuits :\n- `get_my_location` : position GPS courante (haute précision ~5m). Demande autorisation browser au 1er appel.\n- `distance_to` : distance Haversine vers destination (adresse texte geocoded ou lat,lng). Retour en km.\n- `find_nearby` : cherche lieux proches (restaurants, pharmacies, hôpitaux, ATM, etc.) via Overpass API OSM gratuit.\n- `reverse_geocode` : transforme lat/lng en adresse postale (Nominatim OSM gratuit).\n- `weather_local` : météo locale 7 jours (Open-Meteo gratuit sans clé).\n\nService `geolocation` (services/geolocation.ts) expose aussi :\n- `watchPosition` continu pour suivi temps réel + `clearWatch`\n- `watchGeofence` : trigger callbacks onEnter/onExit zones (ex: Casino, Domicile)\n- `saveFavoriteLocation` : home/work/other persistés localStorage\n- `distanceBetween` (Haversine) + `bearingBetween` (direction 0-360°)\n- `getCountryFromIP` (Cloudflare cdn-cgi/trace + ipapi.co fallback)\n- `getLocalTime` (timezone + offset depuis longitude)\n\n**Privacy P0** : positions stockées localement uniquement, JAMAIS sync Firebase (cf. erreur #44 ax_user_locations leak v12).\nSi Kevin demande "où est le restaurant le plus proche", utilise find_nearby category=\'restaurant\'. Si "quel temps demain", utilise weather_local.'),i.push(`## Parité Claude Code 100% (Kevin 2026-05-04 ABSOLUE)
"Il doit avoir accès à tout ce que tu as accès pour se modifier, se corriger, s'améliorer etc en toute autonomie" — Kevin

Tu as accès à TOUS les outils Claude Code via le service \`apexClaudeCodeParity\` (services/apex-claude-code-parity.ts) :
- File ops : read / edit / write / list (path validé, anti traversal, audit log)
- Search : grep / glob (GitHub Code Search API + git tree)
- Bash : whitelist stricte (npm, git, node, tsc, eslint, vitest, python3, npx — JAMAIS rm/dd/curl/sudo)
- Web : webFetch / webSearch (DuckDuckGo + CORS proxy fallback)
- Subagents : spawnSubagent (Explore/Plan parallélisation)
- Todos persistant : todoWrite / todoRead
- GitHub MCP : createPR, commentOnPR, mergePR, createIssue, closeIssue, searchCode, getFileContents, pushFiles
- Auto-improvement : selfAudit, selfFix, proposeNewFeature, releaseVersion
- Memory : appendToMemory (CLAUDE.md / NOTES_USER.md / MEMO_RESUME.md), syncMemoryBridge (3 backends)

Workflow type pour bug fix Kevin signale :
1. grep pattern → identifie fichier
2. read fichier → comprend contexte
3. edit (oldStr → newStr) ou write (full replace)
4. bash "npm test" → si OK passe à 5, sinon rollback
5. createPR ou pushFiles direct
6. mergePR si tests CI green
Tout en autonomie, sans demander Kevin (sauf actions destructrices : delete_*, force_push).`),i.join(`

`)}getFacts(){return this.facts}getLessons(){return this.lessons}getProjects(){return y}persist(){try{localStorage.setItem("apex_v13_facts",JSON.stringify(this.facts)),localStorage.setItem("apex_v13_lessons",JSON.stringify(this.lessons))}catch(e){c.warn("memory","persist failed (quota?)",{err:e})}}}const R=new k;class O{state={};listeners=new Map;initialized=!1;init(e){if(this.initialized)return;this.initialized=!0;const r=this.loadPersisted();this.state={user:null,view:"landing",isStreaming:!1,online:navigator.onLine,appVer:"",isAdmin:!1,commerceEnabled:!0,theme:"dark",...e,...r}}get(e){return this.state[e]}set(e,r){const u=this.state[e];u!==r&&(this.state[e]=r,this.persistKey(e,r),g.emit("store:change",{key:e,value:r}),this.notify(e,r,u))}subscribe(e,r){const u=this.listeners.get(e)??new Set;return u.add(r),this.listeners.set(e,u),()=>u.delete(r)}snapshot(){return{...this.state}}notify(e,r,u){this.listeners.get(e)?.forEach(i=>{try{i(r,u)}catch{}})}PERSISTED_KEYS=new Set(["theme","commerceEnabled"]);persistKey(e,r){if(this.PERSISTED_KEYS.has(e))try{localStorage.setItem(`apex_v13_${e}`,JSON.stringify(r))}catch{}}loadPersisted(){const e={};for(const r of this.PERSISTED_KEYS)try{const u=localStorage.getItem(`apex_v13_${r}`);u&&(e[r]=JSON.parse(u))}catch{}return e}}const _=new O;class L{routes=new Map;currentRoute="";rootEl=null;initialized=!1;register(e,r){this.routes.set(e,r)}init(){this.initialized||(this.initialized=!0,this.rootEl=document.getElementById("apex-root"),window.addEventListener("hashchange",()=>void this.dispatch()))}navigate(e){if(location.hash===`#${e}`){this.dispatch();return}location.hash=`#${e}`}async dispatch(){if(!this.rootEl){c.warn("router","dispatch called before init");return}const e=location.hash.replace(/^#\/?/,"")||this.defaultRoute(),r=this.routes.get(e);if(!r){c.warn("router",`Unknown route: ${e} → fallback`),this.renderNotFound(e);return}const u=_.get("user")!==null,i=_.get("isAdmin");if(r.requiresAuth&&!u){this.navigate("login");return}if(r.requiresAdmin&&!i){this.renderForbidden();return}const d=this.currentRoute;this.currentRoute=e,g.emit("route:change",{from:d,to:e}),_.set("view",e);try{await(await r.loader()).render(this.rootEl)}catch(a){w.capture(a,{source:"manual"}),this.renderError(w.toUserMessage(a))}}defaultRoute(){return _.get("user")?"chat":"landing"}renderNotFound(e){this.rootEl&&(this.rootEl.innerHTML=`
      <div class="ax-empty">
        <h2>Page introuvable</h2>
        <p>Route "${this.escape(e)}" inconnue.</p>
        <button class="ax-btn" onclick="location.hash='#chat'">Retour</button>
      </div>
    `)}renderForbidden(){this.rootEl&&(this.rootEl.innerHTML=`
      <div class="ax-empty">
        <h2>Accès réservé</h2>
        <p>Cette section est réservée à l'admin.</p>
        <button class="ax-btn" onclick="location.hash='#chat'">Retour</button>
      </div>
    `)}renderError(e){this.rootEl&&(this.rootEl.innerHTML=`
      <div class="ax-empty">
        <h2>Souci de chargement</h2>
        <p>${this.escape(e)}</p>
        <button class="ax-btn" onclick="location.reload()">Recharger</button>
      </div>
    `)}escape(e){return e.replace(/[&<>"']/g,r=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[r]??r)}}const n=new L,v="v13.3.25",S="kdmc_admin";async function D(){const h={startedAt:performance.now(),online:navigator.onLine,pwaInstalled:window.matchMedia("(display-mode: standalone)").matches,isAdmin:!1};w.installGlobalHandlers(),c.info("boot",`APEX ${v} starting`,{ctx:h});const e=async(t,o)=>{try{await o()}catch(l){c.warn("boot",`Service init failed: ${t} (continuing degraded)`,{err:l})}};await e("sentry",async()=>{const{sentryBridge:t}=await s(async()=>{const{sentryBridge:o}=await import("../chunks/monitoring-WiO5ZBU9.js").then(l=>l.s);return{sentryBridge:o}},[],import.meta.url);await t.init();try{const o="apex_v13_sentry_last_test_ts",l=parseInt(localStorage.getItem(o)??"0",10),A=1440*60*1e3;if(Date.now()-l>A&&t.isInitialized()){const m=await t.sendTestEvent();m.ok?(localStorage.setItem(o,String(Date.now())),c.info("boot",`Sentry test event sent (sink=${m.sink})`)):c.warn("boot",`Sentry test event skipped: ${m.reason??"unknown"}`)}}catch{}}),await e("bodyguard",async()=>{const{bodyguard:t}=await s(async()=>{const{bodyguard:o}=await import("../chunks/bodyguard-BNf7WWAS.js");return{bodyguard:o}},__vite__mapDeps([0,1,2]),import.meta.url);t.install()}),await e("audit-log",async()=>{const{auditLog:t}=await s(async()=>{const{auditLog:o}=await import("../chunks/apex-tools-registry-DPQHcZUW.js").then(l=>l.c);return{auditLog:o}},__vite__mapDeps([2,1]),import.meta.url);t.init(),await t.record("boot.start",{details:{ver:v}})}),await e("auto-backup",async()=>{const{autoBackup:t}=await s(async()=>{const{autoBackup:o}=await import("../chunks/auto-backup-C2fsvRxr.js");return{autoBackup:o}},__vite__mapDeps([3,4,1,2,5]),import.meta.url);await t.init();try{if(t.getStats().total_backups===0){const l=await t.snapshot("manual");try{localStorage.setItem("ax_last_backup_ts",String(Date.now()))}catch{}c.info("boot",`Initial backup created: ${l.id} (${(l.size_bytes/1024).toFixed(1)} KB)`)}}catch(o){c.warn("boot","Initial backup snapshot failed (continuing)",{err:o})}}),await e("observability",async()=>{const{observability:t}=await s(async()=>{const{observability:o}=await import("../chunks/monitoring-WiO5ZBU9.js").then(l=>l.b);return{observability:o}},[],import.meta.url);t.init()}),await e("firebase-queue",async()=>{const{firebaseQueue:t}=await s(async()=>{const{firebaseQueue:o}=await import("../chunks/firebase-queue-DkG-KyYZ.js");return{firebaseQueue:o}},__vite__mapDeps([6,4,1,2,5]),import.meta.url);t.init()}),await e("sentinels",async()=>{const{sentinels:t}=await s(async()=>{const{sentinels:l}=await import("../chunks/sentinels-6PO2CRpZ.js");return{sentinels:l}},__vite__mapDeps([7,4,1,2,5]),import.meta.url),{bootstrapSentinelsRegistry:o}=await s(async()=>{const{bootstrapSentinelsRegistry:l}=await import("../chunks/sentinels-registry-BninimvL.js");return{bootstrapSentinelsRegistry:l}},__vite__mapDeps([8,4,1,2,5,7]),import.meta.url);o(),t.init()}),"serviceWorker"in navigator||c.warn("boot","Service Worker not supported — degraded mode"),(!("crypto"in window)||!window.crypto.subtle)&&c.error("boot","Web Crypto API not available — vault DISABLED"),_.init({user:null,view:"landing",isStreaming:!1,online:h.online,appVer:v}),await R.init().catch(t=>{c.error("boot","Memory init failed (degraded)",{err:t})});const{firebase:r}=await s(async()=>{const{firebase:t}=await import("../chunks/apex-tools-dispatch-CpNodyWh.js").then(o=>o.a);return{firebase:t}},__vite__mapDeps([4,1,2,5]),import.meta.url);if(await r.init().catch(t=>{c.error("boot","Firebase init failed (degraded offline mode)",{err:t})}),!localStorage.getItem("apex_v13_migrated"))try{const{migrate:t}=await s(async()=>{const{migrate:o}=await import("../chunks/migrate-v12-to-v13-Dq6wGAhL.js");return{migrate:o}},__vite__mapDeps([9,1]),import.meta.url);await t(),localStorage.setItem("apex_v13_migrated",new Date().toISOString()),c.info("boot","Migration v12→v13 completed")}catch(t){c.error("boot","Migration failed (continuing with empty state)",{err:t})}const{auth:i}=await s(async()=>{const{auth:t}=await import("../chunks/auth-Bm-QG8_A.js");return{auth:t}},__vite__mapDeps([10,4,1,2,5]),import.meta.url);if(h.isAdmin=await i.isAdmin().catch(()=>!1),_.set("isAdmin",h.isAdmin),n.register("landing",{loader:()=>s(()=>import("../chunks/index-BO1-YvH6.js"),__vite__mapDeps([11,4,1,2,5,12,10,13,14]),import.meta.url)}),n.register("login",{loader:()=>s(()=>import("../chunks/index-BO1-YvH6.js"),__vite__mapDeps([11,4,1,2,5,12,10,13,14]),import.meta.url)}),n.register("chat",{loader:()=>s(()=>import("../chunks/index-DHHhDPQo.js"),__vite__mapDeps([15,4,1,2,5,16,17,18,19,13,20,14]),import.meta.url),requiresAuth:!0}),n.register("admin",{loader:()=>s(()=>import("../chunks/index-t3kejtWW.js"),__vite__mapDeps([21,4,1,2,5,12,22,23,10,19,24,13,14]),import.meta.url),requiresAdmin:!0}),n.register("credentials",{loader:()=>s(()=>import("../chunks/index-Yf17-U2s.js"),__vite__mapDeps([25,4,1,2,5,12,26,13,14]),import.meta.url),requiresAdmin:!0}),n.register("studios",{loader:()=>s(()=>import("../chunks/index-CD0zMZ1N.js"),__vite__mapDeps([27,4,1,2,5]),import.meta.url),requiresAuth:!0}),n.register("pro",{loader:()=>s(()=>import("../chunks/index-iyPDQBOx.js"),__vite__mapDeps([28,4,1,2,5]),import.meta.url),requiresAuth:!0}),n.register("laurence",{loader:()=>s(()=>import("../chunks/index-BZ-PLhRi.js"),__vite__mapDeps([29,4,1,2,5,30]),import.meta.url),requiresAuth:!0}),n.register("settings",{loader:()=>s(()=>import("../chunks/index-CJtEypM8.js"),__vite__mapDeps([31,4,1,2,5,12]),import.meta.url),requiresAuth:!0}),n.register("sentinels",{loader:()=>s(()=>import("../chunks/index-DzqpEkMf.js"),__vite__mapDeps([32,4,1,2,5,12]),import.meta.url),requiresAdmin:!0}),n.register("browser",{loader:()=>s(()=>import("../chunks/index-BeIdz8UL.js"),__vite__mapDeps([33,4,1,2,5,12,34]),import.meta.url),requiresAuth:!0}),n.register("crypto",{loader:()=>s(()=>import("../chunks/index-D3xOYdp3.js"),__vite__mapDeps([35,1]),import.meta.url),requiresAuth:!0}),n.register("domotique",{loader:()=>s(()=>import("../chunks/index-DFiJ-DCO.js"),__vite__mapDeps([36,1]),import.meta.url),requiresAuth:!0}),n.register("workflow",{loader:()=>s(()=>import("../chunks/index-D2u_UVez.js"),__vite__mapDeps([37,1]),import.meta.url),requiresAuth:!0}),n.register("remote",{loader:()=>s(()=>import("../chunks/index-D7p52PlE.js"),__vite__mapDeps([38,4,1,2,5,26]),import.meta.url),requiresAuth:!0}),n.register("notes",{loader:()=>s(()=>import("../chunks/index-zDor0GjI.js"),__vite__mapDeps([39,1,12,4,2,5]),import.meta.url),requiresAuth:!0}),n.register("calendar",{loader:()=>s(()=>import("../chunks/index-tdHcfsP6.js"),__vite__mapDeps([40,1,12,4,2,5]),import.meta.url),requiresAuth:!0}),n.register("billing",{loader:()=>s(()=>import("../chunks/index-2DjO9PkX.js"),__vite__mapDeps([41,1,4,2,5]),import.meta.url),requiresAuth:!0}),n.register("calculators",{loader:()=>s(()=>import("../chunks/index-tzbulSJF.js"),__vite__mapDeps([42,1]),import.meta.url),requiresAuth:!0}),n.register("archive",{loader:()=>s(()=>import("../chunks/index-PaVdaAfW.js"),__vite__mapDeps([43,1,12,4,2,5]),import.meta.url),requiresAuth:!0}),n.register("device",{loader:()=>s(()=>import("../chunks/index-DbEmd2vm.js"),__vite__mapDeps([44,1,12,14,13]),import.meta.url),requiresAuth:!0}),n.register("studio-music",{loader:()=>s(()=>import("../chunks/index-CFV7wZG0.js"),__vite__mapDeps([45,1,12,34,4,2,5]),import.meta.url),requiresAuth:!0}),n.register("studio-video",{loader:()=>s(()=>import("../chunks/index-BzEoo4Yo.js"),__vite__mapDeps([46,1,12,34,4,2,5]),import.meta.url),requiresAuth:!0}),n.register("studio-cv",{loader:()=>s(()=>import("../chunks/index-wB8eb9-y.js"),__vite__mapDeps([47,4,1,2,5,12]),import.meta.url),requiresAuth:!0}),n.register("studio-invoice",{loader:()=>s(()=>import("../chunks/index-DnEHhiC5.js"),__vite__mapDeps([48,1,12,4,2,5]),import.meta.url),requiresAuth:!0}),n.register("studio-contract",{loader:()=>s(()=>import("../chunks/index-ht3EPSvG.js"),__vite__mapDeps([49,1,12,4,2,5]),import.meta.url),requiresAuth:!0}),n.register("studio-logo",{loader:()=>s(()=>import("../chunks/index-DPadZkbN.js"),__vite__mapDeps([50,1,4,2,5]),import.meta.url),requiresAuth:!0}),n.register("studio-presentation",{loader:()=>s(()=>import("../chunks/index-CXipAsZ9.js"),__vite__mapDeps([51,1,4,2,5]),import.meta.url),requiresAuth:!0}),n.register("studio-prefecture",{loader:()=>s(()=>import("../chunks/index-9pHo-x3d.js"),__vite__mapDeps([52,1,4,2,5]),import.meta.url),requiresAuth:!0}),n.register("studio-clip",{loader:()=>s(()=>import("../chunks/index-CcOMWrHt.js"),__vite__mapDeps([53,1,4,2,5]),import.meta.url),requiresAuth:!0}),n.register("studio-photo",{loader:()=>s(()=>import("../chunks/index-BgeJAgDH.js"),__vite__mapDeps([54,1,4,2,5]),import.meta.url),requiresAuth:!0}),n.register("pro-business",{loader:()=>s(()=>import("../chunks/index-B2qANu6-.js"),__vite__mapDeps([55,1]),import.meta.url),requiresAuth:!0}),n.register("pro-education",{loader:()=>s(()=>import("../chunks/index-BFri9Q98.js"),__vite__mapDeps([56,1]),import.meta.url),requiresAuth:!0}),n.register("pro-certifications",{loader:()=>s(()=>import("../chunks/index-5aTWcaPf.js"),__vite__mapDeps([57,1]),import.meta.url),requiresAuth:!0}),n.register("dashboard",{loader:()=>s(()=>import("../chunks/index-CXgGcBFU.js"),__vite__mapDeps([58,4,1,2,5,12,13]),import.meta.url),requiresAuth:!0}),n.register("vault",{loader:()=>s(()=>import("../chunks/index-Bo8V8XKn.js"),__vite__mapDeps([59,1,12,60,4,2,5,61,62,13,14]),import.meta.url),requiresAdmin:!0}),n.register("knowledge-bank",{loader:()=>s(()=>import("../chunks/index-ld3DqBs3.js"),__vite__mapDeps([63,1,12,13,14]),import.meta.url),requiresAuth:!0}),n.register("apex-toolbox",{loader:()=>s(()=>import("../chunks/index-Db01lr78.js"),__vite__mapDeps([64,4,1,2,5,12,65,13,14]),import.meta.url),requiresAuth:!0}),n.register("self-diag",{loader:()=>s(()=>import("../chunks/index-mvAZFGQG.js"),__vite__mapDeps([66,4,1,2,5,12,13,14]),import.meta.url),requiresAuth:!0}),n.register("admin-backup",{loader:()=>s(()=>import("../chunks/index-D6X_BVWm.js"),__vite__mapDeps([67,1,12,3,4,2,5,13,14]),import.meta.url),requiresAdmin:!0}),n.init(),g.emit("boot:routerReady",{ctx:h}),(async()=>{try{const t=window.location.pathname.replace(/[^/]+$/,"")+"index.html?_v="+Date.now(),o=await fetch(t,{method:"GET",cache:"no-store",signal:AbortSignal.timeout(5e3)});if(!o.ok)return;const m=(await o.text()).match(/data-app-ver="(v[\d.]+)"/)?.[1];if(!m||m===v)return;const E="apex_v13_force_reload_"+m;if(sessionStorage.getItem(E)){c.warn("boot",`version mismatch ${v} vs ${m} mais reload déjà tenté → abandonne (loop guard)`);return}sessionStorage.setItem(E,String(Date.now())),c.warn("boot",`🔄 Version stale détectée : local ${v}, remote ${m} → force reload`);try{const f=document.createElement("div");f.style.cssText="position:fixed;top:0;left:0;right:0;z-index:99999;padding:16px;background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;font:600 14px/1.4 system-ui;text-align:center;box-shadow:0 4px 16px rgba(0,0,0,0.4)",f.textContent=`🔄 Mise à jour automatique en cours (${v} → ${m})…`,document.body?.appendChild(f)}catch{}try{if("serviceWorker"in navigator){const f=await navigator.serviceWorker.getRegistrations();await Promise.all(f.map(b=>b.unregister()))}if("caches"in window){const f=await caches.keys();await Promise.all(f.map(b=>caches.delete(b)))}}catch(f){c.warn("boot","force reload cleanup failed",{err:f})}window.location.href=window.location.pathname+"?_forceupd="+m+"&t="+Date.now()}catch(t){c.debug("boot","force version check skipped",{err:t})}})(),"serviceWorker"in navigator){navigator.serviceWorker.register("./sw.js").then(o=>{c.info("boot","SW registered",{scope:o.scope}),setInterval(()=>{o.update().catch(()=>{})},300*1e3),document.addEventListener("visibilitychange",()=>{document.hidden||o.update().catch(()=>{})})}).catch(o=>{c.warn("boot","SW register failed",{err:o})});let t=!1;navigator.serviceWorker.addEventListener("controllerchange",()=>{t||(t=!0,window.location.reload())}),navigator.serviceWorker.addEventListener("message",o=>{const l=o.data;l?.type&&(l.type==="push_resubscribed"?(c.info("push","SW auto-resubscribed",{endpoint:l.endpoint?.slice(0,60)}),g.emit("push:resubscribed",{endpoint:l.endpoint})):l.type==="notification_clicked"&&g.emit("notification:clicked",{url:l.url}))})}s(async()=>{const{bootstrapServices:t}=await import("../chunks/services-bootstrap-CSMloeKj.js");return{bootstrapServices:t}},__vite__mapDeps([68,4,1,2,5]),import.meta.url).then(({bootstrapServices:t})=>{const o=h.isAdmin?S:_.get("user")?.id??null;return t(o)}).then(t=>{const o=t.filter(l=>l.ok).length;c.info("boot",`services-bootstrap : ${o}/${t.length} OK`)}).catch(t=>{c.warn("boot","services-bootstrap failed (non-blocking)",{err:t})}),s(async()=>{const{pushAutoInit:t}=await import("../chunks/push-auto-init-mMAymFa7.js");return{pushAutoInit:t}},__vite__mapDeps([69,4,1,2,5,70]),import.meta.url).then(({pushAutoInit:t})=>{const o=h.isAdmin?S:_.get("user")?.id??"anon";return t.autoInit(o)}).then(t=>{c.info("push","auto-init complete",{env:t.environment,subscribed:t.subscribed,needs_install:t.needs_install_guide}),g.emit("push:status",t)}).catch(t=>{c.warn("push","auto-init failed (non-blocking)",{err:t})});let d=!1;const a=async()=>{if(!(d||!navigator.onLine)){d=!0;try{if("serviceWorker"in navigator)try{const m=await navigator.serviceWorker.getRegistration();m&&m.update()}catch{}const t=location.pathname.replace(/[^/]*$/,"")+"index.html?__forceupd="+Date.now()+"&_r="+Math.random().toString(36).slice(2),A=(await(await fetch(t,{cache:"reload",headers:{"Cache-Control":"no-cache, no-store, must-revalidate",Pragma:"no-cache"}})).text()).match(/data-app-ver=['"]([^'"]+)['"]/);if(A?.[1]&&A[1]!==v){c.info("boot",`🔄 force-update: local=${v} → remote=${A[1]} — reload imminent`);try{if("serviceWorker"in navigator){const m=await navigator.serviceWorker.getRegistrations();await Promise.all(m.map(E=>E.unregister()))}}catch{}try{if("caches"in window){const m=await caches.keys();await Promise.all(m.map(E=>caches.delete(E)))}}catch{}setTimeout(()=>{location.replace(location.pathname+"?_forceupd="+Date.now()+"&_v="+(A[1]??"new"))},300)}}catch(t){c.warn("boot","force-update check failed",{err:t})}finally{d=!1}}};setTimeout(()=>void a(),500),setTimeout(()=>void a(),3e3),document.addEventListener("visibilitychange",()=>{document.hidden||a()}),window.addEventListener("focus",()=>void a()),setInterval(()=>void a(),300*1e3),window.addEventListener("online",()=>{_.set("online",!0),g.emit("network:online",{}),c.info("network","Online")}),window.addEventListener("offline",()=>{_.set("online",!1),g.emit("network:offline",{}),c.info("network","Offline")}),n.dispatch(),setTimeout(()=>{const t=document.getElementById("apex-splash");t&&(t.hidden=!0,setTimeout(()=>t.remove(),600))},100);const p=Math.round(performance.now()-h.startedAt);c.info("boot",`APEX ${v} ready in ${p}ms`),g.emit("boot:complete",{ctx:h,bootMs:p})}D().catch(h=>{console.error("[APEX boot crash]",h);const e=document.getElementById("apex-root");e&&(e.innerHTML=`
      <div style="padding:40px;text-align:center;color:#fff;background:#08080f;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center">
        <h1 style="color:#c9a227;font-family:Georgia,serif;letter-spacing:3px">APEX</h1>
        <p style="color:#a0a4c0;margin:16px 0">Un souci au démarrage. Tape SOS en bas-droite pour recharger proprement.</p>
        <p style="color:#6a6f8a;font-size:11px;margin-top:24px">Version ${v}</p>
      </div>
    `);const r=document.getElementById("apex-rescue-btn");r&&(r.style.display="flex")});window.__APEX__={ver:v,di:P,store:_,logger:c};export{v as A,w as e,R as m,n as r,_ as s};
//# sourceMappingURL=main-Cifqh60i.js.map
