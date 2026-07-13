/*
 * kdmc-monaco/lib.js — logique PURE du connecteur (0 dépendance runtime CF, donc
 * testable en `node --test`). Le worker.js importe tout d'ici + `cloudflare:sockets`.
 */

/* ---------- filtre facture ---------- */
export const INVOICE_RE = /(facture|invoice|devis|quote|re[çc]u|receipt|quittance|ticket|comm?ande|order|paiement|payment|abonnement|[ée]ch[ée]ance|note d.honoraire|bon de commande|bill|statement|relev[ée])/i;
export function matchesInvoice(subject, filename, from) {
  return INVOICE_RE.test(String(subject || '') + ' ' + String(filename || '') + ' ' + String(from || ''));
}

/* ---------- parseur MIME (multipart, base64) — repris de kdmc-mail ---------- */
export function headerValue(headers, name) {
  const re = new RegExp('^' + name + ':\\s*([^\\r\\n]*(?:\\r?\\n[ \\t][^\\r\\n]*)*)', 'im');
  const m = headers.match(re);
  return m ? m[1].replace(/\r?\n[ \t]+/g, ' ').trim() : '';
}
export function paramValue(headerLine, key) {
  const m = headerLine.match(new RegExp(key + '\\s*=\\s*"?([^";]+)"?', 'i'));
  return m ? m[1].trim() : '';
}
function boundaryOf(headers) {
  const ct = headerValue(headers, 'Content-Type');
  return /multipart\//i.test(ct) ? paramValue(ct, 'boundary') : '';
}
export function parseMimeAttachments(raw) {
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
export function topHeadersOf(raw) {
  raw = String(raw || '');
  const sep = raw.indexOf('\r\n\r\n') >= 0 ? '\r\n\r\n' : '\n\n';
  const hi = raw.indexOf(sep);
  return hi < 0 ? raw : raw.slice(0, hi);
}
export function subjectOf(raw) { return headerValue(topHeadersOf(raw), 'Subject').slice(0, 160); }
export function fromOf(raw) { return headerValue(topHeadersOf(raw), 'From').slice(0, 120); }

/* ---------- IMAP ---------- */
export function imapDate(d) {
  const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return String(d.getUTCDate()).padStart(2, '0') + '-' + M[d.getUTCMonth()] + '-' + d.getUTCFullYear();
}
export function parseSearchUids(untagged) {
  const out = [];
  for (const l of (untagged || [])) {
    const m = /^\*\s+SEARCH\b(.*)$/i.exec(l);
    if (m) for (const t of m[1].trim().split(/\s+/)) { const n = parseInt(t, 10); if (n > 0) out.push(n); }
  }
  return out;
}
export function latin1(u8) { let s = ''; for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]); return s; }
export function imapQuote(s) { return '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"'; }

// Parseur PUR d'une réponse IMAP taguée sur un buffer d'octets. Gère les littéraux
// {N}. Renvoie null si incomplet (il faut lire plus), sinon
// { status, line, untagged:[], literals:[], consumed }. Testé sur un flux FETCH simulé.
export function parseTaggedResponse(u8, tag) {
  function crlfFrom(pos) { for (let i = pos; i + 1 < u8.length; i++) if (u8[i] === 13 && u8[i + 1] === 10) return i; return -1; }
  const untagged = []; const literals = [];
  let pos = 0;
  for (;;) {
    const c = crlfFrom(pos);
    if (c < 0) return null; // besoin de plus de données
    const line = latin1(u8.subarray(pos, c));
    const lm = /\{(\d+)\+?\}\s*$/.exec(line);
    if (lm) {
      const n = parseInt(lm[1], 10); const litStart = c + 2;
      if (u8.length < litStart + n) return null; // littéral incomplet
      literals.push(latin1(u8.subarray(litStart, litStart + n)));
      pos = litStart + n; // la ligne logique continue après le littéral
      continue;
    }
    pos = c + 2;
    if (line === tag || line.startsWith(tag + ' ')) {
      const status = (line.slice(tag.length).trim().split(/\s+/)[0] || '').toUpperCase();
      return { status, line, untagged, literals, consumed: pos };
    }
    untagged.push(line);
  }
}

/* ---------- crypto (global crypto.subtle : présent dans le worker ET node 22) ---------- */
export async function sha256HexOfB64(b64) {
  const bin = atob(b64); const u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  const d = await crypto.subtle.digest('SHA-256', u.buffer);
  return [...new Uint8Array(d)].map((x) => x.toString(16).padStart(2, '0')).join('');
}
export async function sha256Hex(str) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(str)));
  return [...new Uint8Array(d)].map((x) => x.toString(16).padStart(2, '0')).join('');
}

// Garde admin (leçon #95 : accepte le hash client OU le code en clair). Pur/testable.
export async function adminOk(request, env) {
  if (!env || !env.KDMC_ADMIN_PIN_SHA256) return false;
  const h = (request.headers.get('x-apex-pin') || request.headers.get('x-kdmc-pin') || '').toLowerCase().trim();
  if (!h) return false;
  if (h === String(env.KDMC_ADMIN_PIN_SHA256).toLowerCase()) return true;
  try { return (await sha256Hex(h)) === String(env.KDMC_ADMIN_PIN_SHA256).toLowerCase(); } catch { return false; }
}
