const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["../chunks/bodyguard-Cx4-aOLU.js","../chunks/monitoring-B17vNBOa.js","../chunks/apex-tools-registry-Duck4KzY.js","../chunks/auto-backup-0f5FUo72.js","../chunks/apex-kb-BZEQo2pJ.js","../chunks/credential-patterns-BybElwOv.js","../chunks/firebase-queue-B5PRgVQH.js","../chunks/sentinels-CGiSKL0u.js","../chunks/sentinels-registry-DthOnM2C.js","../chunks/migrate-v12-to-v13-BH7vN9c4.js","../chunks/auth-D7Sr5e5f.js","../chunks/index-DcRGdPmb.js","../chunks/haptic-BUEqXK0N.js","../chunks/toast-Dgg9rcIP.js","../chunks/index-C4ImELA6.js","../chunks/ai-router-s_DHSaA-.js","../chunks/chat-fallback-BTgk9lp3.js","../chunks/tokens-dashboard-C5ZzZyK6.js","../chunks/commerce-B2BkWDa2.js","../chunks/modal-sheet-Pqfkse7W.js","../chunks/index-_gtsw5uv.js","../chunks/apex-execute-BswHPWiT.js","../chunks/claude-bridge-YDEQBf5-.js","../chunks/kdmc-projects-registry-Bc-QS4so.js","../chunks/index-CKaUwEg8.js","../chunks/index-BbA7xxHZ.js","../chunks/index-XlCXb5LB.js","../chunks/permissions-DuD18ml4.js","../chunks/index-CV9aTWwM.js","../chunks/index-Bsq3cREx.js","../chunks/listener-cleanup-Y2rGGxxX.js","../chunks/index-42D4rGyr.js","../chunks/feature-toggles-CztUNbca.js","../chunks/index-NPYRSQTs.js","../chunks/index-BtnZR27Y.js","../chunks/index-Dl_IgUgo.js","../chunks/index-bA2iwVx1.js","../chunks/index-GNa7yCQX.js","../chunks/index-DNDPyX9x.js","../chunks/index-BOFfVuS7.js","../chunks/index-CUrrHf9M.js","../chunks/index-CZkodK9d.js","../chunks/index-BHFQrxzO.js","../chunks/index-CyofNi-0.js","../chunks/index-D_S7GY1H.js","../chunks/index-Crv71TiS.js","../chunks/index-tLXodXgl.js","../chunks/index-E7HQP95z.js","../chunks/index-BsXOzS4Y.js","../chunks/index-DGFZxVAz.js","../chunks/index-DHNUfb3O.js","../chunks/index-B5nviofd.js","../chunks/index-D_cBQ5Vj.js","../chunks/index-Cnmdxqv0.js","../chunks/index-D6B42LM7.js","../chunks/index-enaMCqMg.js","../chunks/index-B2_WOWaL.js","../chunks/auto-discover-links-CfYm6I3P.js","../chunks/links-registry-Ccej85hR.js","../chunks/multi-key-vault-IPd8qiav.js","../chunks/index-FVNNNjOi.js","../chunks/index-DWkaeGTA.js","../chunks/capabilities-BtwAbxnn.js","../chunks/index-C78yqs2J.js","../chunks/index-BIzEPJrv.js","../chunks/services-bootstrap-zL4QGTPf.js","../chunks/push-auto-init-owwLHsiv.js","../chunks/push-notifications-DlbJh_7q.js"])))=>i.map(i=>d[i]);
import{_ as o}from"../chunks/apex-kb-BZEQo2pJ.js";import{l as u}from"../chunks/monitoring-B17vNBOa.js";import{e as v}from"../chunks/apex-tools-dispatch-CVI00iKM.js";import"../chunks/apex-tools-registry-Duck4KzY.js";import"../chunks/credential-patterns-BybElwOv.js";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))c(i);new MutationObserver(i=>{for(const l of i)if(l.type==="childList")for(const s of l.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&c(s)}).observe(document,{childList:!0,subtree:!0});function r(i){const l={};return i.integrity&&(l.integrity=i.integrity),i.referrerPolicy&&(l.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?l.credentials="include":i.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function c(i){if(i.ep)return;i.ep=!0;const l=r(i);fetch(i.href,l)}})();class w{services=new Map;register(e,r){if(this.services.has(e)){u.warn("di",`Service already registered: ${e}`);return}this.services.set(e,{factory:r})}async resolve(e){const r=this.services.get(e);if(!r)throw new Error(`DI: service not registered: ${e}`);if(r.instance!==void 0)return r.instance;if(r.loading)return r.loading;const c=Promise.resolve(r.factory());r.loading=c;const i=await c;return r.instance=i,delete r.loading,i}has(e){return this.services.has(e)}list(){return[...this.services.keys()]}}const S=new w;class P{installed=!1;errorCount=0;maxErrorsBeforeRescue=10;installGlobalHandlers(){this.installed||(this.installed=!0,window.addEventListener("error",e=>{this.capture(e.error||new Error(e.message),{source:"window.onerror",...e.filename&&{url:e.filename},...typeof e.lineno=="number"&&{line:e.lineno},...typeof e.colno=="number"&&{col:e.colno}})}),window.addEventListener("unhandledrejection",e=>{const r=e.reason,c=r instanceof Error?r:new Error(String(r));this.capture(c,{source:"unhandledrejection"})}))}capture(e,r={}){this.errorCount++;const c=e instanceof Error?e:new Error(String(e));u.error("errors",c.message,{stack:c.stack,...r}),o(async()=>{const{sentryBridge:i}=await import("../chunks/monitoring-B17vNBOa.js").then(l=>l.s);return{sentryBridge:i}},[],import.meta.url).then(({sentryBridge:i})=>{i.isInitialized()&&i.captureException(c,r)}).catch(()=>{}),this.errorCount>=this.maxErrorsBeforeRescue&&this.triggerRescue()}triggerRescue(){const e=document.getElementById("apex-rescue-btn");e&&(e.style.display="flex",e.style.background="#ff5858",e.title="Trop d'erreurs détectées — tap SOS pour recharger")}toUserMessage(e){const r=e instanceof Error?e.message:String(e);return/network|fetch|cors/i.test(r)?"Réseau indisponible. Vérifie ta connexion.":/timeout/i.test(r)?"Pas de réponse, réessaie dans un instant.":/quota|exceeded/i.test(r)?"Stockage saturé, nettoyage automatique lancé.":/unauthorized|401/i.test(r)?"Identifiants invalides ou expirés.":/forbidden|403/i.test(r)?"Action non autorisée.":/not found|404/i.test(r)?"Élément introuvable.":/5\d{2}/i.test(r)?"Serveur indisponible, réessaie dans 1 min.":"Un petit souci, réessaie ou tape SOS."}}const E=new P,b=[{id:"cmcteams",name:"CMCteams",description:"Casino Monaco — planning + équipes 258 employés",preserved:!0},{id:"telecommande",name:"Télécommande KDMC",description:"Bridge IR/Wifi/BLE messaging",preserved:!0},{id:"crackpass",name:"CrackPass",description:"Générateur/vérificateur passwords",preserved:!0},{id:"kdmc",name:"KDMC",description:"Marketplace principal",preserved:!0},{id:"ekdmc",name:"e-KDMC",description:"Marketplace e-commerce",preserved:!0},{id:"iakdmc",name:"IA-KDMC",description:"Archive lessons learned IA",preserved:!0}],I=["TOUT AU MAX TOUJOURS — chaque outil/module/feature au niveau expert pro 200€/h, jamais demi-mesure","Boot toujours TOUT au max : tous modules pro, studios, providers IA, sentinelles, voix, tools IA, KB, bridges actifs","JAMAIS la 1ère solution trouvée — recherche poussée 5+ alternatives, choix justifié (perf, popularité, dernière maj <6mois, polyvalence, innovation). Délègue à subagent Explore si besoin.","Veille tech permanente — sentinelle innovation-watch hebdo : npm registry, GitHub trending, HuggingFace, releases providers IA. Si gain ≥20% → propose update; gain ≥50% → notif Kevin.","1-clic + fenêtre + bouton direct (Kevin n'a jamais 2 actions à enchaîner)","Reconnaissance auto credentials + auto-fetch outils (130+ patterns)","Apex crée les liens auto à chaque nouvel ajout/découverte","Sécurité avant autonomie totale (≥95/100 sécu réel avant clés générales)","Automatise tout en autonomie (jamais demander si Apex peut faire)","PROTECTION ≠ STABILITÉ (pas de wrapper qui désactive)","Relit toute sa documentation avant chaque réponse","Identité : tu es APEX (pas Claude). Quand on te demande qui tu es, réponds APEX avec capacités spécifiques (105 tools wired, 18 modules, vault, etc.).","TOUJOURS export disponible : PDF, copy clipboard, formats convertibles. Liens cliquables dans réponses."];class T{facts=[];lessons=[];initialized=!1;async init(){this.initialized||(this.initialized=!0,this.reload())}reload(){try{const e=localStorage.getItem("apex_v13_facts");this.facts=e?JSON.parse(e):[];const r=localStorage.getItem("apex_v13_lessons");this.lessons=r?JSON.parse(r):[]}catch(e){u.warn("memory","Hydratation partielle",{err:e}),this.facts=[],this.lessons=[]}u.info("memory",`Loaded ${this.facts.length} facts, ${this.lessons.length} lessons`)}addFact(e,r,c=1){const i={id:`f_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,category:e,text:r.slice(0,500),ts:Date.now(),weight:c};this.facts.push(i),this.facts.length>1e3&&(this.facts=this.facts.slice(-1e3)),this.persist()}recordLesson(e,r,c,i="warn"){const l={id:`l_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,category:e,title:r.slice(0,120),text:c.slice(0,500),severity:i,resolved:!1,ts:Date.now()};this.lessons.push(l),this.lessons.length>200&&(this.lessons=this.lessons.slice(-200)),this.persist()}buildSystemPromptContext(e){const r=this.facts.slice(-50).reverse(),c=this.lessons.filter(s=>s.severity==="critical").slice(-10).reverse(),i=[];i.push("# APEX v13.0 — Contexte système COMPLET (auto-injecté chaque message)"),e&&i.push(`## Utilisateur courant
${e.name} (id: ${e.id})`);let l="";try{const s=globalThis;s.kdmcProjectsRegistry&&(l=s.kdmcProjectsRegistry.formatForSystemPrompt())}catch{}l?i.push(l):i.push(`## Projets Kevin (préservés)
${b.map(s=>`- ${s.name} : ${s.description}`).join(`
`)}`),i.push(`## Règles permanentes prioritaires
${I.map((s,p)=>`${p+1}. ${s}`).join(`
`)}`),r.length&&i.push(`## Top facts mémoire (${r.length})
${r.map(s=>`- [${s.category}] ${s.text}`).join(`
`)}`),c.length&&i.push(`## Lessons learned critiques
${c.map(s=>`- [${s.category}] ${s.title} : ${s.text}`).join(`
`)}`);try{const s=localStorage.getItem("apex_v13_persistent_memory");if(s){const p=JSON.parse(s);if(Array.isArray(p)&&p.length>0){const t=p.sort((n,d)=>(d.importance??50)-(n.importance??50)).slice(0,50);i.push(`## Mémoire persistante cross-session (${p.length} entries totales, top 50)
${t.map(n=>`- [${n.category??"fact"}] ${n.text}`).join(`
`)}`)}}}catch{}try{const s=typeof navigator<"u"?navigator.userAgent:"",p=/iPad|iPhone|iPod/.test(s),t=/Android/.test(s);i.push(`## Device courant
${p?"📱 iOS":t?"🤖 Android":"🖥 Desktop"} · Online: ${typeof navigator<"u"&&navigator.onLine?"oui":"non"}`)}catch{}if(e)try{const s=globalThis.tenantManager;s&&typeof s.formatForSystemPrompt=="function"&&i.push(s.formatForSystemPrompt(e.id))}catch{}try{const s=[];for(let p=0;p<localStorage.length;p++){const t=localStorage.key(p);t&&/^ax_[a-z0-9_]+_(key|token|pat|sk|pk|secret)$/.test(t)&&localStorage.getItem(t)&&s.push(t)}if(s.length>0){const p=s.map(t=>t.replace(/^ax_/,"").replace(/_(?:key|token|pat|sk|pk|secret)$/,"").replace(/_/g," "));i.push(`## 🔐 Clés API Kevin configurées (${s.length} services disponibles)
${p.map(t=>`- ${t}`).join(`
`)}

Apex peut utiliser ces services en autonomie. Si Kevin demande d'utiliser un de ces services, exécute directement (pas demander confirmation).`)}}catch{}try{const s=localStorage.getItem("ax_kevin_whatsapp_phone");s?i.push(`## 💬 WhatsApp activé (validation clients/comptes)
Numéro Kevin WhatsApp configuré : ${s.replace(/(\d{2})\d+(\d{2})/,"$1***$2")}

Flow validation auto :
1. Nouveau client crée compte → \`whatsapp.requestConfirmation()\` génère OTP 12 chars
2. Lien wa.me généré → client envoie OTP à Kevin via WhatsApp
3. Kevin confirme OTP dans vAdmin → \`whatsapp.confirm(otp)\` active compte
4. \`whatsapp_link\` tool dispo pour générer liens wa.me partout

Apex peut exécuter requestConfirmation() en autonomie pour tout nouveau compte client.`):i.push(`## ⚠️ WhatsApp non configuré
Kevin doit coller son numéro WhatsApp pour activer validations clients OTP.
Format : +33XXXXXXXXX → store \`ax_kevin_whatsapp_phone\`.
Si Kevin demande "active WhatsApp", utilise vault.setKey('ax_kevin_whatsapp_phone', value).`)}catch{}try{const s=globalThis.apexKnowledgeBase;if(s&&typeof s.formatForSystemPrompt=="function")i.push(s.formatForSystemPrompt());else{const p=localStorage.getItem("ax_kdmc_repos"),t=p?JSON.parse(p):["9r4rxssx64-creator/CMCteams"];i.push(`📚 Base de connaissances Kevin (GitHub API): ${t.length} repos configurés. Outils: search_repo_code, read_repo_file, list_repo_files, get_recent_commits, get_repo_readme.`)}}catch{}return i.push(`## Règle Kevin TOUT AU MAX (PRIORITÉ ABSOLUE 2026-05-04)
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
Test mental : "Kevin me donne SES propres infos pour QUE JE FASSE quelque chose pour lui ?" → OUI → store + agis. PAS de refus.`),i.push(`## Auto-modification autonomie totale (Kevin 2026-05-04)
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

**Code / Repo :**
- Si Kevin signale "bug X dans CMCteams" → service: 'github', task: 'create_issue', params: { repo, title, body, labels }
- Si Kevin demande "commente issue Y" → service: 'github', task: 'add_comment', params: { issue_number, body }
- Si Kevin valide "merge PR Z" → service: 'github', task: 'merge_pr', params: { pr_number, confirm: true }
- Si Kevin demande "trigger workflow build" → service: 'github', task: 'dispatch_workflow', params: { workflow, ref }

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

`)}getFacts(){return this.facts}getLessons(){return this.lessons}getProjects(){return b}persist(){try{localStorage.setItem("apex_v13_facts",JSON.stringify(this.facts)),localStorage.setItem("apex_v13_lessons",JSON.stringify(this.lessons))}catch(e){u.warn("memory","persist failed (quota?)",{err:e})}}}const k=new T;class x{state={};listeners=new Map;initialized=!1;init(e){if(this.initialized)return;this.initialized=!0;const r=this.loadPersisted();this.state={user:null,view:"landing",isStreaming:!1,online:navigator.onLine,appVer:"",isAdmin:!1,commerceEnabled:!0,theme:"dark",...e,...r}}get(e){return this.state[e]}set(e,r){const c=this.state[e];c!==r&&(this.state[e]=r,this.persistKey(e,r),v.emit("store:change",{key:e,value:r}),this.notify(e,r,c))}subscribe(e,r){const c=this.listeners.get(e)??new Set;return c.add(r),this.listeners.set(e,c),()=>c.delete(r)}snapshot(){return{...this.state}}notify(e,r,c){this.listeners.get(e)?.forEach(i=>{try{i(r,c)}catch{}})}PERSISTED_KEYS=new Set(["theme","commerceEnabled"]);persistKey(e,r){if(this.PERSISTED_KEYS.has(e))try{localStorage.setItem(`apex_v13_${e}`,JSON.stringify(r))}catch{}}loadPersisted(){const e={};for(const r of this.PERSISTED_KEYS)try{const c=localStorage.getItem(`apex_v13_${r}`);c&&(e[r]=JSON.parse(c))}catch{}return e}}const h=new x;class R{routes=new Map;currentRoute="";rootEl=null;initialized=!1;register(e,r){this.routes.set(e,r)}init(){this.initialized||(this.initialized=!0,this.rootEl=document.getElementById("apex-root"),window.addEventListener("hashchange",()=>void this.dispatch()))}navigate(e){if(location.hash===`#${e}`){this.dispatch();return}location.hash=`#${e}`}async dispatch(){if(!this.rootEl){u.warn("router","dispatch called before init");return}const e=location.hash.replace(/^#\/?/,"")||this.defaultRoute(),r=this.routes.get(e);if(!r){u.warn("router",`Unknown route: ${e} → fallback`),this.renderNotFound(e);return}const c=h.get("user")!==null,i=h.get("isAdmin");if(r.requiresAuth&&!c){this.navigate("login");return}if(r.requiresAdmin&&!i){this.renderForbidden();return}const l=this.currentRoute;this.currentRoute=e,v.emit("route:change",{from:l,to:e}),h.set("view",e);try{await(await r.loader()).render(this.rootEl)}catch(s){E.capture(s,{source:"manual"}),this.renderError(E.toUserMessage(s))}}defaultRoute(){return h.get("user")?"chat":"landing"}renderNotFound(e){this.rootEl&&(this.rootEl.innerHTML=`
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
    `)}escape(e){return e.replace(/[&<>"']/g,r=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[r]??r)}}const a=new R,_="v13.3.0",y="kdmc_admin";async function O(){const m={startedAt:performance.now(),online:navigator.onLine,pwaInstalled:window.matchMedia("(display-mode: standalone)").matches,isAdmin:!1};E.installGlobalHandlers(),u.info("boot",`APEX ${_} starting`,{ctx:m});const e=async(t,n)=>{try{await n()}catch(d){u.warn("boot",`Service init failed: ${t} (continuing degraded)`,{err:d})}};await e("sentry",async()=>{const{sentryBridge:t}=await o(async()=>{const{sentryBridge:n}=await import("../chunks/monitoring-B17vNBOa.js").then(d=>d.s);return{sentryBridge:n}},[],import.meta.url);await t.init()}),await e("bodyguard",async()=>{const{bodyguard:t}=await o(async()=>{const{bodyguard:n}=await import("../chunks/bodyguard-Cx4-aOLU.js");return{bodyguard:n}},__vite__mapDeps([0,1,2]),import.meta.url);t.install()}),await e("audit-log",async()=>{const{auditLog:t}=await o(async()=>{const{auditLog:n}=await import("../chunks/apex-tools-registry-Duck4KzY.js").then(d=>d.c);return{auditLog:n}},__vite__mapDeps([2,1]),import.meta.url);t.init(),await t.record("boot.start",{details:{ver:_}})}),await e("auto-backup",async()=>{const{autoBackup:t}=await o(async()=>{const{autoBackup:n}=await import("../chunks/auto-backup-0f5FUo72.js");return{autoBackup:n}},__vite__mapDeps([3,4,1,2,5]),import.meta.url);await t.init()}),await e("observability",async()=>{const{observability:t}=await o(async()=>{const{observability:n}=await import("../chunks/monitoring-B17vNBOa.js").then(d=>d.b);return{observability:n}},[],import.meta.url);t.init()}),await e("firebase-queue",async()=>{const{firebaseQueue:t}=await o(async()=>{const{firebaseQueue:n}=await import("../chunks/firebase-queue-B5PRgVQH.js");return{firebaseQueue:n}},__vite__mapDeps([6,4,1,2,5]),import.meta.url);t.init()}),await e("sentinels",async()=>{const{sentinels:t}=await o(async()=>{const{sentinels:d}=await import("../chunks/sentinels-CGiSKL0u.js");return{sentinels:d}},__vite__mapDeps([7,4,1,2,5]),import.meta.url),{bootstrapSentinelsRegistry:n}=await o(async()=>{const{bootstrapSentinelsRegistry:d}=await import("../chunks/sentinels-registry-DthOnM2C.js");return{bootstrapSentinelsRegistry:d}},__vite__mapDeps([8,4,1,2,5,7]),import.meta.url);n(),t.init()}),"serviceWorker"in navigator||u.warn("boot","Service Worker not supported — degraded mode"),(!("crypto"in window)||!window.crypto.subtle)&&u.error("boot","Web Crypto API not available — vault DISABLED"),h.init({user:null,view:"landing",isStreaming:!1,online:m.online,appVer:_}),await k.init().catch(t=>{u.error("boot","Memory init failed (degraded)",{err:t})});const{firebase:r}=await o(async()=>{const{firebase:t}=await import("../chunks/apex-tools-dispatch-CVI00iKM.js").then(n=>n.a);return{firebase:t}},__vite__mapDeps([4,1,2,5]),import.meta.url);if(await r.init().catch(t=>{u.error("boot","Firebase init failed (degraded offline mode)",{err:t})}),!localStorage.getItem("apex_v13_migrated"))try{const{migrate:t}=await o(async()=>{const{migrate:n}=await import("../chunks/migrate-v12-to-v13-BH7vN9c4.js");return{migrate:n}},__vite__mapDeps([9,1]),import.meta.url);await t(),localStorage.setItem("apex_v13_migrated",new Date().toISOString()),u.info("boot","Migration v12→v13 completed")}catch(t){u.error("boot","Migration failed (continuing with empty state)",{err:t})}const{auth:i}=await o(async()=>{const{auth:t}=await import("../chunks/auth-D7Sr5e5f.js");return{auth:t}},__vite__mapDeps([10,4,1,2,5]),import.meta.url);if(m.isAdmin=await i.isAdmin().catch(()=>!1),h.set("isAdmin",m.isAdmin),a.register("landing",{loader:()=>o(()=>import("../chunks/index-DcRGdPmb.js"),__vite__mapDeps([11,4,1,2,5,10,12,13]),import.meta.url)}),a.register("login",{loader:()=>o(()=>import("../chunks/index-DcRGdPmb.js"),__vite__mapDeps([11,4,1,2,5,10,12,13]),import.meta.url)}),a.register("chat",{loader:()=>o(()=>import("../chunks/index-C4ImELA6.js"),__vite__mapDeps([14,4,1,2,5,15,16,17,18,12,19,13]),import.meta.url),requiresAuth:!0}),a.register("admin",{loader:()=>o(()=>import("../chunks/index-_gtsw5uv.js"),__vite__mapDeps([20,4,1,2,5,21,22,10,18,23,12,13]),import.meta.url),requiresAdmin:!0}),a.register("studios",{loader:()=>o(()=>import("../chunks/index-CKaUwEg8.js"),__vite__mapDeps([24,4,1,2,5]),import.meta.url),requiresAuth:!0}),a.register("pro",{loader:()=>o(()=>import("../chunks/index-BbA7xxHZ.js"),__vite__mapDeps([25,4,1,2,5]),import.meta.url),requiresAuth:!0}),a.register("laurence",{loader:()=>o(()=>import("../chunks/index-XlCXb5LB.js"),__vite__mapDeps([26,4,1,2,5,27]),import.meta.url),requiresAuth:!0}),a.register("settings",{loader:()=>o(()=>import("../chunks/index-CV9aTWwM.js"),__vite__mapDeps([28,4,1,2,5]),import.meta.url),requiresAuth:!0}),a.register("sentinels",{loader:()=>o(()=>import("../chunks/index-Bsq3cREx.js"),__vite__mapDeps([29,4,1,2,5,30]),import.meta.url),requiresAdmin:!0}),a.register("browser",{loader:()=>o(()=>import("../chunks/index-42D4rGyr.js"),__vite__mapDeps([31,4,1,2,5,32]),import.meta.url),requiresAuth:!0}),a.register("crypto",{loader:()=>o(()=>import("../chunks/index-NPYRSQTs.js"),__vite__mapDeps([33,1]),import.meta.url),requiresAuth:!0}),a.register("domotique",{loader:()=>o(()=>import("../chunks/index-BtnZR27Y.js"),__vite__mapDeps([34,1]),import.meta.url),requiresAuth:!0}),a.register("workflow",{loader:()=>o(()=>import("../chunks/index-Dl_IgUgo.js"),__vite__mapDeps([35,1]),import.meta.url),requiresAuth:!0}),a.register("remote",{loader:()=>o(()=>import("../chunks/index-bA2iwVx1.js"),__vite__mapDeps([36,4,1,2,5]),import.meta.url),requiresAuth:!0}),a.register("notes",{loader:()=>o(()=>import("../chunks/index-GNa7yCQX.js"),__vite__mapDeps([37,1,4,2,5]),import.meta.url),requiresAuth:!0}),a.register("calendar",{loader:()=>o(()=>import("../chunks/index-DNDPyX9x.js"),__vite__mapDeps([38,1,4,2,5]),import.meta.url),requiresAuth:!0}),a.register("billing",{loader:()=>o(()=>import("../chunks/index-BOFfVuS7.js"),__vite__mapDeps([39,1,4,2,5]),import.meta.url),requiresAuth:!0}),a.register("calculators",{loader:()=>o(()=>import("../chunks/index-CUrrHf9M.js"),__vite__mapDeps([40,1]),import.meta.url),requiresAuth:!0}),a.register("archive",{loader:()=>o(()=>import("../chunks/index-CZkodK9d.js"),__vite__mapDeps([41,1,4,2,5]),import.meta.url),requiresAuth:!0}),a.register("studio-music",{loader:()=>o(()=>import("../chunks/index-BHFQrxzO.js"),__vite__mapDeps([42,1,32,4,2,5]),import.meta.url),requiresAuth:!0}),a.register("studio-video",{loader:()=>o(()=>import("../chunks/index-CyofNi-0.js"),__vite__mapDeps([43,1,32,4,2,5]),import.meta.url),requiresAuth:!0}),a.register("studio-cv",{loader:()=>o(()=>import("../chunks/index-D_S7GY1H.js"),__vite__mapDeps([44,4,1,2,5]),import.meta.url),requiresAuth:!0}),a.register("studio-invoice",{loader:()=>o(()=>import("../chunks/index-Crv71TiS.js"),__vite__mapDeps([45,1,4,2,5]),import.meta.url),requiresAuth:!0}),a.register("studio-contract",{loader:()=>o(()=>import("../chunks/index-tLXodXgl.js"),__vite__mapDeps([46,1,4,2,5]),import.meta.url),requiresAuth:!0}),a.register("studio-logo",{loader:()=>o(()=>import("../chunks/index-E7HQP95z.js"),__vite__mapDeps([47,1,4,2,5]),import.meta.url),requiresAuth:!0}),a.register("studio-presentation",{loader:()=>o(()=>import("../chunks/index-BsXOzS4Y.js"),__vite__mapDeps([48,1,4,2,5]),import.meta.url),requiresAuth:!0}),a.register("studio-prefecture",{loader:()=>o(()=>import("../chunks/index-DGFZxVAz.js"),__vite__mapDeps([49,1,4,2,5]),import.meta.url),requiresAuth:!0}),a.register("studio-clip",{loader:()=>o(()=>import("../chunks/index-DHNUfb3O.js"),__vite__mapDeps([50,1,4,2,5]),import.meta.url),requiresAuth:!0}),a.register("studio-photo",{loader:()=>o(()=>import("../chunks/index-B5nviofd.js"),__vite__mapDeps([51,1,4,2,5]),import.meta.url),requiresAuth:!0}),a.register("pro-business",{loader:()=>o(()=>import("../chunks/index-D_cBQ5Vj.js"),__vite__mapDeps([52,1]),import.meta.url),requiresAuth:!0}),a.register("pro-education",{loader:()=>o(()=>import("../chunks/index-Cnmdxqv0.js"),__vite__mapDeps([53,1]),import.meta.url),requiresAuth:!0}),a.register("pro-certifications",{loader:()=>o(()=>import("../chunks/index-D6B42LM7.js"),__vite__mapDeps([54,1]),import.meta.url),requiresAuth:!0}),a.register("dashboard",{loader:()=>o(()=>import("../chunks/index-enaMCqMg.js"),__vite__mapDeps([55,4,1,2,5,12]),import.meta.url),requiresAuth:!0}),a.register("vault",{loader:()=>o(()=>import("../chunks/index-B2_WOWaL.js"),__vite__mapDeps([56,1,57,4,2,5,58,59,12,13]),import.meta.url),requiresAdmin:!0}),a.register("knowledge-bank",{loader:()=>o(()=>import("../chunks/index-FVNNNjOi.js"),__vite__mapDeps([60,1,12,13]),import.meta.url),requiresAuth:!0}),a.register("apex-toolbox",{loader:()=>o(()=>import("../chunks/index-DWkaeGTA.js"),__vite__mapDeps([61,4,1,2,5,62,12,13]),import.meta.url),requiresAuth:!0}),a.register("self-diag",{loader:()=>o(()=>import("../chunks/index-C78yqs2J.js"),__vite__mapDeps([63,4,1,2,5,30,12,13]),import.meta.url),requiresAuth:!0}),a.register("admin-backup",{loader:()=>o(()=>import("../chunks/index-BIzEPJrv.js"),__vite__mapDeps([64,1,3,4,2,5,12,13]),import.meta.url),requiresAdmin:!0}),a.init(),v.emit("boot:routerReady",{ctx:m}),"serviceWorker"in navigator){navigator.serviceWorker.register("./sw.js").then(n=>{u.info("boot","SW registered",{scope:n.scope}),setInterval(()=>{n.update().catch(()=>{})},300*1e3),document.addEventListener("visibilitychange",()=>{document.hidden||n.update().catch(()=>{})})}).catch(n=>{u.warn("boot","SW register failed",{err:n})});let t=!1;navigator.serviceWorker.addEventListener("controllerchange",()=>{t||(t=!0,window.location.reload())}),navigator.serviceWorker.addEventListener("message",n=>{const d=n.data;d?.type&&(d.type==="push_resubscribed"?(u.info("push","SW auto-resubscribed",{endpoint:d.endpoint?.slice(0,60)}),v.emit("push:resubscribed",{endpoint:d.endpoint})):d.type==="notification_clicked"&&v.emit("notification:clicked",{url:d.url}))})}o(async()=>{const{bootstrapServices:t}=await import("../chunks/services-bootstrap-zL4QGTPf.js");return{bootstrapServices:t}},__vite__mapDeps([65,4,1,2,5]),import.meta.url).then(({bootstrapServices:t})=>{const n=m.isAdmin?y:h.get("user")?.id??null;return t(n)}).then(t=>{const n=t.filter(d=>d.ok).length;u.info("boot",`services-bootstrap : ${n}/${t.length} OK`)}).catch(t=>{u.warn("boot","services-bootstrap failed (non-blocking)",{err:t})}),o(async()=>{const{pushAutoInit:t}=await import("../chunks/push-auto-init-owwLHsiv.js");return{pushAutoInit:t}},__vite__mapDeps([66,4,1,2,5,67]),import.meta.url).then(({pushAutoInit:t})=>{const n=m.isAdmin?y:h.get("user")?.id??"anon";return t.autoInit(n)}).then(t=>{u.info("push","auto-init complete",{env:t.environment,subscribed:t.subscribed,needs_install:t.needs_install_guide}),v.emit("push:status",t)}).catch(t=>{u.warn("push","auto-init failed (non-blocking)",{err:t})});let l=!1;const s=async()=>{if(!(l||!navigator.onLine)){l=!0;try{if("serviceWorker"in navigator)try{const f=await navigator.serviceWorker.getRegistration();f&&f.update()}catch{}const t=location.pathname.replace(/[^/]*$/,"")+"index.html?__forceupd="+Date.now()+"&_r="+Math.random().toString(36).slice(2),g=(await(await fetch(t,{cache:"reload",headers:{"Cache-Control":"no-cache, no-store, must-revalidate",Pragma:"no-cache"}})).text()).match(/data-app-ver=['"]([^'"]+)['"]/);if(g?.[1]&&g[1]!==_){u.info("boot",`🔄 force-update: local=${_} → remote=${g[1]} — reload imminent`);try{if("serviceWorker"in navigator){const f=await navigator.serviceWorker.getRegistrations();await Promise.all(f.map(A=>A.unregister()))}}catch{}try{if("caches"in window){const f=await caches.keys();await Promise.all(f.map(A=>caches.delete(A)))}}catch{}setTimeout(()=>{location.replace(location.pathname+"?_forceupd="+Date.now()+"&_v="+(g[1]??"new"))},300)}}catch(t){u.warn("boot","force-update check failed",{err:t})}finally{l=!1}}};setTimeout(()=>void s(),500),setTimeout(()=>void s(),3e3),document.addEventListener("visibilitychange",()=>{document.hidden||s()}),window.addEventListener("focus",()=>void s()),setInterval(()=>void s(),300*1e3),window.addEventListener("online",()=>{h.set("online",!0),v.emit("network:online",{}),u.info("network","Online")}),window.addEventListener("offline",()=>{h.set("online",!1),v.emit("network:offline",{}),u.info("network","Offline")}),a.dispatch(),setTimeout(()=>{const t=document.getElementById("apex-splash");t&&(t.hidden=!0,setTimeout(()=>t.remove(),600))},100);const p=Math.round(performance.now()-m.startedAt);u.info("boot",`APEX ${_} ready in ${p}ms`),v.emit("boot:complete",{ctx:m,bootMs:p})}O().catch(m=>{console.error("[APEX boot crash]",m);const e=document.getElementById("apex-root");e&&(e.innerHTML=`
      <div style="padding:40px;text-align:center;color:#fff;background:#08080f;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center">
        <h1 style="color:#c9a227;font-family:Georgia,serif;letter-spacing:3px">APEX</h1>
        <p style="color:#a0a4c0;margin:16px 0">Un souci au démarrage. Tape SOS en bas-droite pour recharger proprement.</p>
        <p style="color:#6a6f8a;font-size:11px;margin-top:24px">Version ${_}</p>
      </div>
    `);const r=document.getElementById("apex-rescue-btn");r&&(r.style.display="flex")});window.__APEX__={ver:_,di:S,store:h,logger:u};export{E as e,k as m,a as r,h as s};
//# sourceMappingURL=main-BHzORHz8.js.map
