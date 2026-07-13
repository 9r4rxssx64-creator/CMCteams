/*
 * kdmc-mail — réception des factures/devis par mail (Cloudflare Email Routing).
 *
 * Kevin transfère (ou fait suivre automatiquement) ses factures/devis à
 * factures@kd-mc.com. Ce worker reçoit le mail, extrait les pièces jointes
 * PDF / photos et les met EN ATTENTE dans le KV partagé (ACCOUNTS) sous la clé
 * `mail:p:<id>`. L'app Finances (tools/finances/) les récupère ensuite via le
 * routeur (/__mail/scan, admin only), les classe (IA), dédoublonne, garde les
 * originaux chiffrés, puis acquitte (/__mail/ack → suppression du KV).
 *
 * Le worker ne stocke JAMAIS le corps du mail — seulement les pièces jointes
 * utiles (PDF/image), avec un plafond de taille et un nombre max en attente.
 * Aucune donnée n'est lisible sans passer par l'app (le contenu comptable est
 * chiffré côté client). Fail-safe : toute erreur d'extraction est ignorée
 * silencieusement (le mail n'est jamais perdu côté Cloudflare).
 */

const MAX_ATTACH = 15 * 1024 * 1024; // 15 Mo / pièce jointe
const MAX_PENDING = 200;             // file d'attente max
const TTL = 60 * 60 * 24 * 60;       // 60 jours si jamais l'app ne passe pas
// Kevin fait suivre AUTOMATIQUEMENT *tous* ses mails monaco.mc → factures@kd-mc.com.
// On ne garde que ce qui ressemble à une facture pour ne pas polluer l'app Finances :
// un PDF est TOUJOURS gardé (les factures/devis sont des PDF — jamais de faux négatif),
// une image n'est gardée que si le sujet/expéditeur/nom de fichier contient un mot-clé
// facture (sinon = logo de signature, bannière newsletter, photo perso → écarté).
const INVOICE_RE = /(facture|invoice|devis|quote|re[çc]u|receipt|quittance|ticket|comm?ande|order|paiement|payment|abonnement|[ée]ch[ée]ance|note d.honoraire|bon de commande|bill|statement|relev[ée])/i;

/* ------- Parseur MIME minimal (multipart, base64) — pur & testable ------- */
function headerValue(headers, name) {
  const re = new RegExp('^' + name + ':\\s*([^\\r\\n]*(?:\\r?\\n[ \\t][^\\r\\n]*)*)', 'im');
  const m = headers.match(re);
  return m ? m[1].replace(/\r?\n[ \t]+/g, ' ').trim() : '';
}
function paramValue(headerLine, key) {
  const m = headerLine.match(new RegExp(key + '\\s*=\\s*"?([^";]+)"?', 'i'));
  return m ? m[1].trim() : '';
}
function boundaryOf(headers) {
  const ct = headerValue(headers, 'Content-Type');
  return /multipart\//i.test(ct) ? paramValue(ct, 'boundary') : '';
}
/* Renvoie [{ filename, mime, b64 }] pour chaque pièce jointe PDF/image. */
function parseMimeAttachments(raw) {
  raw = String(raw || '');
  const sep = raw.indexOf('\r\n\r\n') >= 0 ? '\r\n\r\n' : '\n\n';
  const hi = raw.indexOf(sep);
  if (hi < 0) return [];
  const topHeaders = raw.slice(0, hi);
  const boundary = boundaryOf(topHeaders);
  const out = [];
  function walk(headers, body) {
    const bnd = boundaryOf(headers);
    if (bnd) {
      const parts = body.split('--' + bnd);
      for (let p of parts) {
        p = p.replace(/^\r?\n/, '');
        if (!p || p === '--' || p.startsWith('--')) continue;
        const s = p.indexOf('\r\n\r\n') >= 0 ? '\r\n\r\n' : '\n\n';
        const h = p.indexOf(s);
        if (h < 0) continue;
        walk(p.slice(0, h), p.slice(h + s.length));
      }
      return;
    }
    const ct = headerValue(headers, 'Content-Type');
    const cte = headerValue(headers, 'Content-Transfer-Encoding').toLowerCase();
    const cd = headerValue(headers, 'Content-Disposition');
    const mime = (ct.split(';')[0] || '').trim().toLowerCase();
    const isPdf = mime === 'application/pdf';
    const isImg = /^image\//.test(mime);
    if ((!isPdf && !isImg) || cte.indexOf('base64') < 0) return;
    let name = paramValue(cd, 'filename') || paramValue(ct, 'name') || (isPdf ? 'facture.pdf' : 'facture.jpg');
    const b64 = body.replace(/[\r\n\s]/g, '');
    if (!b64) return;
    out.push({ filename: name, mime, b64 });
  }
  if (boundary) walk(topHeaders, raw.slice(hi + sep.length));
  return out;
}

async function sha256Hex(b64) {
  const bin = atob(b64); const u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  const d = await crypto.subtle.digest('SHA-256', u.buffer);
  return [...new Uint8Array(d)].map((x) => x.toString(16).padStart(2, '0')).join('');
}

export default {
  async email(message, env) {
    try {
      if (!env || !env.ACCOUNTS) return;
      // Anti-débordement : ne pas dépasser MAX_PENDING pièces en attente.
      const cur = await env.ACCOUNTS.list({ prefix: 'mail:p:' });
      if (cur.keys && cur.keys.length >= MAX_PENDING) return;
      const raw = await new Response(message.raw).text();
      const from = (message.from || '').slice(0, 120);
      const subject = (message.headers && message.headers.get && message.headers.get('subject') || '').slice(0, 160);
      const atts = parseMimeAttachments(raw);
      const invCtx = INVOICE_RE.test(subject + ' ' + from);
      for (const a of atts) {
        const approxBytes = Math.floor(a.b64.length * 0.75);
        if (approxBytes > MAX_ATTACH) continue;
        // Filtre facture : PDF toujours gardé ; image seulement si mot-clé facture.
        const isPdf = /pdf/i.test(a.mime || '') || /\.pdf$/i.test(a.filename || '');
        if (!isPdf && !(invCtx || INVOICE_RE.test(a.filename || ''))) continue;
        let hash = ''; try { hash = await sha256Hex(a.b64); } catch { /* */ }
        const id = (hash || (Date.now().toString(36) + Math.random().toString(36).slice(2, 8)));
        const rec = { from, subject, date: new Date().toISOString(), filename: a.filename, mime: a.mime, b64: a.b64, size: approxBytes, hash, ts: Date.now() };
        await env.ACCOUNTS.put('mail:p:' + id, JSON.stringify(rec), { expirationTtl: TTL });
      }
    } catch { /* fail-safe : ne jamais rejeter le mail */ }
  },
  // /health uniquement — la récupération réelle passe par le routeur (/__mail/*, admin only).
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === '/health') return new Response(JSON.stringify({ ok: true, worker: 'kdmc-mail' }), { headers: { 'content-type': 'application/json' } });
    return new Response('kdmc-mail', { status: 200 });
  }
};

export { parseMimeAttachments };
