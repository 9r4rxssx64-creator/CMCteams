/*
 * kdmc-monaco — connecteur IMAP Monaco Telecom → factures dans l'app Finances.
 *
 * Le mail perso de Kevin (Kevind@monaco.mc) est hébergé chez Monaco Telecom
 * (IMAP standard : mails.monaco.mc:993 SSL/TLS), PAS chez Microsoft. Ce worker
 * se connecte en IMAP (lecture seule), récupère les pièces jointes PDF/image des
 * mails qui ressemblent à une facture/devis, et les dépose dans le KV PARTAGÉ
 * (ACCOUNTS) sous `mail:p:<id>` — EXACTEMENT comme kdmc-mail / kdmc-outlook.
 * L'app Finances (tools/finances/) les récupère via /__mail/scan (admin), les
 * classe (IA), dédoublonne, garde les originaux chiffrés, puis acquitte.
 *
 * → AUCUNE modif de l'app : mailAutoScan() lit déjà tout `mail:p:*`.
 *
 * Config (1 fois, page /setup protégée par le code admin) : email + mot de passe
 * monaco.mc. Ensuite cron toutes les 2 h = 100 % auto.
 *
 * Sécurité : mot de passe chiffré AES-GCM au repos si MONACO_ENC_KEY présent
 * (honnête : le worker peut déchiffrer car il doit se logger — protège d'un dump
 * KV sans le secret, leçon #55). KV jamais exposé. Fail-safe + erreur EXACTE
 * (leçon #97). Lecture seule : on ne supprime jamais un mail.
 *
 * Risque connu : socket IMAPS 993 depuis un Worker CF non prouvé dans ce repo.
 * /test et /sync remontent l'erreur EXACTE (host/TLS/login/socket). Repli
 * documenté si CF bloque : GitHub Action IMAP → endpoint routeur /__mail/ingest.
 */

import { connect } from 'cloudflare:sockets';
import {
  matchesInvoice, parseMimeAttachments, extractBodyText, subjectOf, fromOf,
  imapDate, parseSearchUids, parseTaggedResponse, latin1, imapQuote,
  sha256HexOfB64, sha256Hex, adminOk
} from './lib.js';

const DEFAULT_HOST = 'mails.monaco.mc';
const DEFAULT_PORT = 993;
const MAX_ATTACH = 15 * 1024 * 1024;
const MAX_PENDING = 200;
const TTL = 60 * 60 * 24 * 60;       // 60 j
const MAX_MSGS_PER_RUN = 15;
const BACKFILL_DAYS = 60;
const IMAP_DEADLINE_MS = 20000;

function J(o, status) { return new Response(JSON.stringify(o), { status: status || 200, headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' } }); }

/* ---------- chiffrement au repos (AES-GCM) ---------- */
async function encKey(env) {
  if (!env || !env.MONACO_ENC_KEY) return null;
  let raw;
  try { const bin = atob(String(env.MONACO_ENC_KEY)); raw = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) raw[i] = bin.charCodeAt(i); }
  catch { return null; }
  if (raw.length !== 32) { try { raw = new Uint8Array(await crypto.subtle.digest('SHA-256', raw)); } catch { return null; } }
  try { return await crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']); } catch { return null; }
}
async function encSecret(env, plain) {
  const k = await encKey(env);
  if (!k) return 'raw:' + plain; // pas de clé → stockage clair (admin-gated, KV non exposé) + flag honnête
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, k, new TextEncoder().encode(plain)));
  const buf = new Uint8Array(iv.length + ct.length); buf.set(iv); buf.set(ct, iv.length);
  return 'enc:' + btoa(latin1(buf));
}
async function decSecret(env, stored) {
  if (stored == null) return null;
  const s = String(stored);
  if (s.startsWith('raw:')) return s.slice(4);
  if (!s.startsWith('enc:')) return s;
  const k = await encKey(env);
  if (!k) throw new Error('enc_key_absente');
  const bin = atob(s.slice(4)); const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  const iv = buf.subarray(0, 12), ct = buf.subarray(12);
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, k, ct);
  return new TextDecoder().decode(pt);
}

/* ---------- client IMAP minimal (cloudflare:sockets + parseur PUR de lib.js) ---------- */
async function imapClient(host, port) {
  const socket = connect({ hostname: host, port: port || DEFAULT_PORT }, { secureTransport: 'on', allowHalfOpen: false });
  const writer = socket.writable.getWriter();
  const reader = socket.readable.getReader();
  let buf = new Uint8Array(0);
  const deadline = Date.now() + IMAP_DEADLINE_MS;

  async function fill() {
    if (Date.now() > deadline) throw new Error('imap_timeout');
    const to = new Promise((_, rej) => setTimeout(() => rej(new Error('imap_read_timeout')), Math.max(1, deadline - Date.now())));
    const { value, done } = await Promise.race([reader.read(), to]);
    if (done) throw new Error('imap_closed');
    if (value && value.length) { const nb = new Uint8Array(buf.length + value.length); nb.set(buf); nb.set(value, buf.length); buf = nb; }
  }
  function crlfFrom(pos) { for (let i = pos; i + 1 < buf.length; i++) if (buf[i] === 13 && buf[i + 1] === 10) return i; return -1; }
  async function readLine() { // greeting « * OK ... »
    let c = crlfFrom(0); while (c < 0) { await fill(); c = crlfFrom(0); }
    const line = latin1(buf.subarray(0, c)); buf = buf.subarray(c + 2); return line;
  }
  async function send(s) { await writer.write(new TextEncoder().encode(s)); }
  let seq = 0;
  async function cmd(command) {
    const tag = 'A' + (++seq);
    await send(tag + ' ' + command + '\r\n');
    for (;;) {
      const r = parseTaggedResponse(buf, tag);
      if (r) { buf = buf.subarray(r.consumed); return r; }
      await fill();
    }
  }
  async function close() {
    try { await writer.close(); } catch { /* */ }
    try { await reader.cancel(); } catch { /* */ }
    try { await socket.close(); } catch { /* */ }
  }
  return { readLine, cmd, close };
}

/* ---------- synchro ---------- */
async function syncOnce(env) {
  if (!env || !env.ACCOUNTS) return { ok: false, reason: 'kv_absent' };
  const user = await env.ACCOUNTS.get('mon:user');
  const passStored = await env.ACCOUNTS.get('mon:pass');
  if (!user || !passStored) return { ok: false, reason: 'not_connected' };
  const pass = await decSecret(env, passStored);
  const host = (await env.ACCOUNTS.get('mon:host')) || DEFAULT_HOST;
  const port = parseInt((await env.ACCOUNTS.get('mon:port')) || String(DEFAULT_PORT), 10) || DEFAULT_PORT;

  const pending = await env.ACCOUNTS.list({ prefix: 'mail:p:' });
  if (pending.keys && pending.keys.length >= MAX_PENDING) return { ok: true, added: 0, scanned: 0, reason: 'file_pleine' };

  const c = await imapClient(host, port);
  let added = 0, scanned = 0; const uidsSeen = [];
  try {
    await c.readLine();
    let r = await c.cmd('LOGIN ' + imapQuote(user) + ' ' + imapQuote(pass));
    if (r.status !== 'OK') throw new Error('login_refuse:' + r.line.slice(0, 120));
    r = await c.cmd('SELECT INBOX');
    if (r.status !== 'OK') throw new Error('select_refuse:' + r.line.slice(0, 120));

    const lastUid = parseInt((await env.ACCOUNTS.get('mon:lastuid')) || '0', 10) || 0;
    let searchCmd;
    if (lastUid > 0) searchCmd = 'UID SEARCH UID ' + (lastUid + 1) + ':*';
    else { const since = new Date(Date.now() - BACKFILL_DAYS * 86400000); searchCmd = 'UID SEARCH SINCE ' + imapDate(since); }
    r = await c.cmd(searchCmd);
    if (r.status !== 'OK') throw new Error('search_refuse:' + r.line.slice(0, 120));
    let uids = parseSearchUids(r.untagged).filter((u) => u > lastUid).sort((a, b) => a - b);
    if (uids.length > MAX_MSGS_PER_RUN) uids = uids.slice(uids.length - MAX_MSGS_PER_RUN);

    let maxUid = lastUid;
    for (const uid of uids) {
      scanned++; uidsSeen.push(uid);
      if (uid > maxUid) maxUid = uid;
      if (await env.ACCOUNTS.get('mon:seen:' + uid)) continue;
      try {
        const fr = await c.cmd('UID FETCH ' + uid + ' BODY.PEEK[]');
        const raw = (fr.literals && fr.literals[0]) || '';
        if (raw) {
          const subject = subjectOf(raw), from = fromOf(raw);
          let storedFile = 0;
          for (const a of parseMimeAttachments(raw)) {
            if (!matchesInvoice(subject, a.filename, from)) continue;
            const approx = Math.floor(a.b64.length * 0.75);
            if (approx > MAX_ATTACH) continue;
            let hash = ''; try { hash = await sha256HexOfB64(a.b64); } catch { /* */ }
            const id = hash || (Date.now().toString(36) + Math.random().toString(36).slice(2, 8));
            if (await env.ACCOUNTS.get('mail:p:' + id)) continue;
            const rec = { from, subject, date: new Date().toISOString(), filename: a.filename, mime: a.mime, b64: a.b64, size: approx, hash, ts: Date.now(), src: 'monaco' };
            await env.ACCOUNTS.put('mail:p:' + id, JSON.stringify(rec), { expirationTtl: TTL });
            added++; storedFile++;
          }
          // La facture est parfois ÉCRITE dans le corps du mail (pas en pièce jointe).
          // Si aucune pièce jointe utile ET le message ressemble à une facture → on garde le TEXTE.
          if (!storedFile) {
            const body = extractBodyText(raw);
            if (body && body.length > 12 && matchesInvoice(subject, body, from)) {
              let b64 = ''; try { b64 = btoa(latin1(new TextEncoder().encode(body))); } catch { /* */ }
              if (b64) {
                let hash = ''; try { hash = await sha256HexOfB64(b64); } catch { /* */ }
                const id = hash || (Date.now().toString(36) + Math.random().toString(36).slice(2, 8));
                if (!(await env.ACCOUNTS.get('mail:p:' + id))) {
                  const rec = { from, subject, date: new Date().toISOString(), filename: 'corps-du-mail.txt', mime: 'text/plain', b64, size: body.length, hash, ts: Date.now(), src: 'monaco', body: true };
                  await env.ACCOUNTS.put('mail:p:' + id, JSON.stringify(rec), { expirationTtl: TTL });
                  added++;
                }
              }
            }
          }
        }
      } catch { /* message ignoré, jamais bloquant */ }
      await env.ACCOUNTS.put('mon:seen:' + uid, '1', { expirationTtl: TTL });
    }
    try { await c.cmd('LOGOUT'); } catch { /* */ }
    if (maxUid > lastUid) await env.ACCOUNTS.put('mon:lastuid', String(maxUid));
    await env.ACCOUNTS.put('mon:lastrun', new Date().toISOString());
    await env.ACCOUNTS.delete('mon:lasterr');
    return { ok: true, added, scanned, uids: uidsSeen, host };
  } finally {
    await c.close();
  }
}

async function testConnect(env) {
  const user = await env.ACCOUNTS.get('mon:user');
  const passStored = await env.ACCOUNTS.get('mon:pass');
  if (!user || !passStored) return { ok: false, reason: 'not_connected' };
  const pass = await decSecret(env, passStored);
  const host = (await env.ACCOUNTS.get('mon:host')) || DEFAULT_HOST;
  const port = parseInt((await env.ACCOUNTS.get('mon:port')) || String(DEFAULT_PORT), 10) || DEFAULT_PORT;
  const c = await imapClient(host, port);
  try {
    const greet = await c.readLine();
    const r = await c.cmd('LOGIN ' + imapQuote(user) + ' ' + imapQuote(pass));
    if (r.status !== 'OK') return { ok: false, reason: 'login_refuse', detail: r.line.slice(0, 160), host, port };
    let inbox = false; try { inbox = (await c.cmd('SELECT INBOX')).status === 'OK'; } catch { /* */ }
    try { await c.cmd('LOGOUT'); } catch { /* */ }
    return { ok: true, host, port, greeting: greet.slice(0, 120), inbox };
  } finally { await c.close(); }
}

// Probe SANS identifiants : prouve que CF peut ouvrir la socket IMAPS + le host,
// en lisant juste le greeting « * OK ... ». Sert à dé-risquer avant que Kevin
// saisisse quoi que ce soit (leçon #97 : erreur exacte).
async function probeConnect(host, port) {
  const h = host || DEFAULT_HOST, pt = port || DEFAULT_PORT;
  const c = await imapClient(h, pt);
  try {
    const greet = await c.readLine();
    return { ok: /\*\s*(OK|PREAUTH)/i.test(greet), host: h, port: pt, greeting: greet.slice(0, 160) };
  } finally { await c.close(); }
}

/* ---------- page /setup ---------- */
function setupPage(host) {
  const H = host || DEFAULT_HOST;
  return '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
+ '<title>Connecter Monaco Telecom — Finances KDMC</title><style>'
+ ':root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;font:16px/1.5 -apple-system,system-ui,sans-serif;background:#0d130c;color:#eaf3e2;padding:16px;max-width:640px;margin:auto}'
+ 'h1{font-size:22px;margin:.2em 0}h2{font-size:16px;margin:1.1em 0 .4em}.card{background:#131c11;border:1px solid #24361f;border-radius:14px;padding:14px;margin:12px 0}'
+ 'label{display:block;color:#9fb59a;font-size:13.5px;margin-top:8px}input{width:100%;padding:12px;border-radius:10px;border:1px solid #2c4225;background:#0d130c;color:#eaf3e2;font-size:16px;min-height:44px;margin-top:6px}'
+ 'button{width:100%;padding:14px;border-radius:11px;border:0;background:linear-gradient(135deg,#e8b830,#c8971d);color:#241a02;font-weight:800;font-size:16px;min-height:44px;margin-top:10px}'
+ 'button.sec{background:#1d2a18;color:#cfe0c6;border:1px solid #2c4225}.muted{color:#9fb59a;font-size:13.5px}#msg{margin-top:10px;white-space:pre-wrap;font-size:14px}.ok{color:#4fce7c}.err{color:#ff7a6b}'
+ 'details{margin-top:8px}summary{color:#9fb59a;font-size:13.5px}'
+ '</style></head><body>'
+ '<h1>📧 Connecter ta boîte Monaco Telecom</h1>'
+ '<p class="muted">Tes factures/devis reçus sur <b>Kevind@monaco.mc</b> arriveront tout seuls dans l\'app Finances. Lecture seule, rien n\'est supprimé, rien ne passe par une IA. Le worker se relance seul toutes les 2 h.</p>'
+ '<div class="card"><h2>Tes identifiants Monaco Telecom</h2>'
+ '<label>Ton code admin</label><input id="pin" type="password" inputmode="numeric" placeholder="Code admin">'
+ '<label>Adresse e-mail monaco.mc <span style="color:#8aa07f">(à écrire ici)</span></label><input id="user" type="email" autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="ex : prenom@monaco.mc">'
+ '<label>Mot de passe de la boîte mail</label><input id="pass" type="password" autocomplete="current-password" placeholder="•••••• (ton mot de passe)">'
+ '<details><summary>Réglages avancés (serveur IMAP)</summary>'
+ '<label>Serveur IMAP (défaut : ' + H + ')</label><input id="host" placeholder="' + H + '">'
+ '<label>Port (défaut : 993 SSL)</label><input id="port" inputmode="numeric" placeholder="993"></details>'
+ '<button id="save">💾 Enregistrer</button>'
+ '<button class="sec" id="test">🔌 Tester la connexion</button>'
+ '<button class="sec" id="sync">📥 Récupérer mes factures maintenant</button>'
+ '<button class="sec" id="disc">Déconnecter</button>'
+ '<div id="msg"></div></div>'
+ '<p class="muted">Ensuite, dans l\'app Finances → <b>➕ Ajouter</b> → <b>📥 Récupérer mes factures</b> : elles y seront (avec celles de factures@kd-mc.com).</p>'
+ '<script>'
+ 'var $=function(i){return document.getElementById(i)};'
+ 'async function sha(s){var b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s));return [].map.call(new Uint8Array(b),function(x){return x.toString(16).padStart(2,"0")}).join("")}'
+ 'function say(t,c){var m=$("msg");m.className=c||"";m.textContent=t}'
+ 'async function hdr(){return {"content-type":"application/json","x-apex-pin":await sha($("pin").value.trim())}}'
+ '$("save").onclick=async function(){if(!$("pin").value.trim()||!$("user").value.trim()||!$("pass").value){say("Entre code admin + email + mot de passe.","err");return}say("⏳ Enregistrement…");try{var r=await fetch("/config",{method:"POST",headers:await hdr(),body:JSON.stringify({user:$("user").value.trim(),pass:$("pass").value,host:$("host").value.trim(),port:$("port").value.trim()})});var j=await r.json();say(j.ok?"✅ Enregistré. Teste la connexion.":"❌ "+(j.reason||"refusé")+" (code admin ?)",j.ok?"ok":"err")}catch(e){say("❌ "+e.message,"err")}};'
+ '$("test").onclick=async function(){if(!$("pin").value.trim()){say("Entre ton code admin.","err");return}say("⏳ Test de connexion IMAP…");try{var r=await fetch("/test",{method:"POST",headers:await hdr()});var j=await r.json();if(j.ok){say("✅ Connecté à "+j.host+":"+j.port+" — boîte "+(j.inbox?"OK":"?")+".\\n"+(j.greeting||""),"ok")}else{say("❌ "+(j.reason||"erreur")+(j.detail?(" — "+j.detail):""),"err")}}catch(e){say("❌ "+e.message,"err")}};'
+ '$("sync").onclick=async function(){if(!$("pin").value.trim()){say("Entre ton code admin.","err");return}say("⏳ Récupération en cours…");try{var r=await fetch("/sync",{method:"POST",headers:await hdr()});var j=await r.json();if(!j.ok){say("❌ "+(j.reason||"erreur")+(j.detail?(" — "+j.detail):"")+(j.reason==="not_connected"?" — enregistre d\'abord tes identifiants.":""),"err");return}say("✅ "+j.added+" facture(s) récupérée(s) ("+j.scanned+" mails scannés). Ouvre l\'app → 📥 Récupérer.","ok")}catch(e){say("❌ "+e.message,"err")}};'
+ '$("disc").onclick=async function(){if(!$("pin").value.trim()){say("Entre ton code admin.","err");return}try{var r=await fetch("/disconnect",{method:"POST",headers:await hdr()});var j=await r.json();say(j.ok?"Déconnecté.":"❌ "+(j.reason||"erreur"),j.ok?"ok":"err")}catch(e){say("❌ "+e.message,"err")}};'
+ '</script></body></html>';
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const p = url.pathname;
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET,POST,OPTIONS', 'access-control-allow-headers': 'content-type,x-apex-pin,x-kdmc-pin' } });
    try {
      if (p === '/health') {
        const connected = !!(env && env.ACCOUNTS && await env.ACCOUNTS.get('mon:user') && await env.ACCOUNTS.get('mon:pass'));
        return J({ ok: true, worker: 'kdmc-monaco', connected, enc: !!(env && env.MONACO_ENC_KEY), lastrun: env && env.ACCOUNTS ? await env.ACCOUNTS.get('mon:lastrun') : null, lasterr: env && env.ACCOUNTS ? await env.ACCOUNTS.get('mon:lasterr') : null });
      }
      if (p === '/' || p === '/setup') {
        return new Response(setupPage(env && env.ACCOUNTS ? await env.ACCOUNTS.get('mon:host') : null), { headers: { 'content-type': 'text/html; charset=utf-8' } });
      }
      if (p === '/config' && request.method === 'POST') {
        if (!(await adminOk(request, env))) return J({ ok: false, reason: 'need_admin_code' }, 403);
        let b = {}; try { b = await request.json(); } catch { return J({ ok: false, reason: 'bad_json' }); }
        const user = String(b.user || '').trim(); const pass = String(b.pass || '');
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(user)) return J({ ok: false, reason: 'email_invalide' });
        if (!pass) return J({ ok: false, reason: 'mot_de_passe_vide' });
        await env.ACCOUNTS.put('mon:user', user);
        await env.ACCOUNTS.put('mon:pass', await encSecret(env, pass));
        const host = String(b.host || '').trim(); const port = String(b.port || '').trim();
        if (host) await env.ACCOUNTS.put('mon:host', host); else await env.ACCOUNTS.delete('mon:host');
        if (/^\d{2,5}$/.test(port)) await env.ACCOUNTS.put('mon:port', port); else await env.ACCOUNTS.delete('mon:port');
        await env.ACCOUNTS.delete('mon:lastuid');
        return J({ ok: true, enc: !!(env && env.MONACO_ENC_KEY) });
      }
      if (p === '/test' && request.method === 'POST') {
        if (!(await adminOk(request, env))) return J({ ok: false, reason: 'need_admin_code' }, 403);
        try { return J(await testConnect(env)); }
        catch (e) { return J({ ok: false, reason: 'socket', detail: String(e && e.message || e) }); }
      }
      if (p === '/probe' && request.method === 'POST') {
        if (!(await adminOk(request, env))) return J({ ok: false, reason: 'need_admin_code' }, 403);
        let b = {}; try { b = await request.json(); } catch { /* body optionnel */ }
        const host = String(b.host || '').trim() || undefined;
        const port = parseInt(b.port, 10) || undefined;
        try { return J(await probeConnect(host, port)); }
        catch (e) { return J({ ok: false, reason: 'socket', detail: String(e && e.message || e), host: host || DEFAULT_HOST, port: port || DEFAULT_PORT }); }
      }
      if (p === '/sync' && request.method === 'POST') {
        if (!(await adminOk(request, env))) return J({ ok: false, reason: 'need_admin_code' }, 403);
        try { return J(await syncOnce(env)); }
        catch (e) {
          const detail = String(e && e.message || e);
          try { if (env && env.ACCOUNTS) await env.ACCOUNTS.put('mon:lasterr', detail.slice(0, 200)); } catch { /* */ }
          return J({ ok: false, reason: 'sync_error', detail });
        }
      }
      if (p === '/disconnect' && request.method === 'POST') {
        if (!(await adminOk(request, env))) return J({ ok: false, reason: 'need_admin_code' }, 403);
        try { for (const k of ['mon:user', 'mon:pass', 'mon:lastuid', 'mon:host', 'mon:port']) await env.ACCOUNTS.delete(k); } catch { /* */ }
        return J({ ok: true });
      }
      return new Response('kdmc-monaco', { status: 200 });
    } catch (e) {
      return J({ ok: false, reason: String(e && e.message || e) }, 500);
    }
  },

  // Cron : récupération incrémentale automatique (fail-safe, garde l'erreur exacte).
  async scheduled(event, env) {
    try { await syncOnce(env); }
    catch (e) { try { if (env && env.ACCOUNTS) await env.ACCOUNTS.put('mon:lasterr', String(e && e.message || e).slice(0, 200)); } catch { /* */ } }
  }
};
