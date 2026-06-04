/* La Détente — Worker de commande Printify (white-label, sécurisé).
   Détient PRINTIFY_API_KEY (secret CF). Reçoit une commande de la boutique,
   résout blueprint→provider→variant en live, et crée la commande Printify
   (statut "on-hold" : Kevin valide/paie dans Printify — pas de débit auto).
   Auth : Origin allowlist + header x-ld-app. */
const SHOP_ID = 27791653;
const API = 'https://api.printify.com/v1';
const IMG_BASE = 'https://9r4rxssx64-creator.github.io/CMCteams/shops/la-detente/img/designs/';
const ALLOW = ['https://9r4rxssx64-creator.github.io', 'http://localhost:8080', 'http://127.0.0.1:8080'];
const APP_TAG = 'ld-order-v1';

const GARMENT_BP = { tee: 6, hoodie: 77, cap: 5383, polo: null, tote: 1313 };
const COLOR_FR2EN = { 'Noir': 'Black', 'Blanc': 'White', 'Marine': 'Navy', 'Kaki': 'Military Green', 'Ardoise': 'Dark Heather', 'Bordeaux': 'Maroon', 'Anthracite': 'Black', 'Sable': 'Sand', 'Vert': 'Forest Green' };
const COUNTRY_ISO = { 'france': 'FR', 'monaco': 'MC', 'belgique': 'BE', 'belgium': 'BE', 'suisse': 'CH', 'switzerland': 'CH', 'luxembourg': 'LU', 'espagne': 'ES', 'spain': 'ES', 'italie': 'IT', 'italy': 'IT', 'allemagne': 'DE', 'germany': 'DE', 'royaume-uni': 'GB', 'uk': 'GB' };

function cors(origin) {
  const ok = ALLOW.includes(origin);
  return {
    'Access-Control-Allow-Origin': ok ? origin : ALLOW[0],
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-ld-app',
    'Content-Type': 'application/json'
  };
}
function J(obj, status, origin) { return new Response(JSON.stringify(obj), { status: status || 200, headers: cors(origin) }); }
function isoCountry(c) { return COUNTRY_ISO[String(c || '').toLowerCase().trim()] || 'FR'; }

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors(origin) });
    const url = new URL(request.url);
    if (request.method === 'GET' && url.pathname === '/') {
      return J({ ok: true, service: 'ld-printify-order', shop_id: SHOP_ID }, 200, origin);
    }
    // COÛT RÉEL : crée un produit-sonde, lit le cost réel, le supprime
    if (request.method === 'GET' && url.pathname === '/cost') {
      const KEY = env.PRINTIFY_API_KEY;
      if (!KEY) return J({ ok: false, detail: 'clé serveur absente' }, 500, origin);
      const bp = parseInt(url.searchParams.get('bp') || '0', 10);
      if (!bp) return J({ ok: false, detail: 'paramètre bp manquant' }, 400, origin);
      const H = { 'Authorization': 'Bearer ' + KEY, 'User-Agent': 'LaDetente-KDMC/1.0', 'Content-Type': 'application/json' };
      try {
        const pr = await fetch(`${API}/catalog/blueprints/${bp}/print_providers.json`, { headers: H });
        if (!pr.ok) return J({ ok: false, detail: 'providers HTTP ' + pr.status, where: 'providers' }, 502, origin);
        const providers = await pr.json();
        if (!providers.length) return J({ ok: false, detail: 'aucun print provider pour ce produit' }, 422, origin);
        const pp = providers[0].id;
        const vr = await fetch(`${API}/catalog/blueprints/${bp}/print_providers/${pp}/variants.json`, { headers: H });
        if (!vr.ok) return J({ ok: false, detail: 'variants HTTP ' + vr.status, where: 'variants' }, 502, origin);
        const variants = (await vr.json()).variants || [];
        if (!variants.length) return J({ ok: false, detail: 'aucune variante' }, 422, origin);
        let imgId = null;
        try {
          const up = await fetch(`${API}/uploads/images.json`, { method: 'POST', headers: H, body: JSON.stringify({ file_name: 'ld-probe.png', url: IMG_BASE + 'crest.png' }) });
          if (up.ok) { const uj = await up.json(); imgId = uj.id; }
        } catch (_) {}
        const vids = variants.map(v => v.id);
        const body = {
          title: 'LD cost probe ' + bp, description: 'probe', blueprint_id: bp, print_provider_id: pp,
          variants: variants.map(v => ({ id: v.id, price: 2000, is_enabled: true })),
          print_areas: imgId ? [{ variant_ids: vids, placeholders: [{ position: 'front', images: [{ id: imgId, x: 0.5, y: 0.5, scale: 1, angle: 0 }] }] }] : []
        };
        const cr = await fetch(`${API}/shops/${SHOP_ID}/products.json`, { method: 'POST', headers: H, body: JSON.stringify(body) });
        const ctxt = await cr.text();
        if (!cr.ok) return J({ ok: false, detail: 'création produit-sonde HTTP ' + cr.status + ' : ' + ctxt.slice(0, 300), where: 'create' }, 502, origin);
        let prod; try { prod = JSON.parse(ctxt); } catch (_) { prod = {}; }
        const costs = (prod.variants || []).map(v => v.cost).filter(c => typeof c === 'number' && c > 0);
        if (prod.id) { try { await fetch(`${API}/shops/${SHOP_ID}/products/${prod.id}.json`, { method: 'DELETE', headers: H }); } catch (_) {} }
        if (!costs.length) return J({ ok: false, detail: 'coût absent de la réponse produit', where: 'cost' }, 502, origin);
        return J({ ok: true, blueprint_id: bp, print_provider_id: pp, min_cost: Math.min(...costs) / 100, max_cost: Math.max(...costs) / 100, currency: 'shop' }, 200, origin);
      } catch (e) { return J({ ok: false, detail: String(e && e.message || e), where: 'exception' }, 500, origin); }
    }
    if (request.method !== 'POST' || url.pathname !== '/order') return J({ ok: false, detail: 'not found' }, 404, origin);
    if (!ALLOW.includes(origin)) return J({ ok: false, detail: 'origin refusée' }, 403, origin);
    if (request.headers.get('x-ld-app') !== APP_TAG) return J({ ok: false, detail: 'app tag invalide' }, 403, origin);
    const KEY = env.PRINTIFY_API_KEY;
    if (!KEY) return J({ ok: false, detail: 'clé serveur absente' }, 500, origin);
    const H = { 'Authorization': 'Bearer ' + KEY, 'User-Agent': 'LaDetente-KDMC/1.0', 'Content-Type': 'application/json' };

    let body; try { body = await request.json(); } catch (_) { return J({ ok: false, detail: 'json invalide' }, 400, origin); }
    const items = Array.isArray(body.items) ? body.items : [];
    const a = body.address || {};
    if (!items.length) return J({ ok: false, detail: 'panier vide' }, 400, origin);
    if (!a.name || !a.addr || !a.zip || !a.city) return J({ ok: false, detail: 'adresse incomplète' }, 400, origin);

    // Résolution variantes (cache par blueprint pendant la requête)
    const cache = {};
    async function resolve(bp) {
      if (cache[bp]) return cache[bp];
      const pr = await fetch(`${API}/catalog/blueprints/${bp}/print_providers.json`, { headers: H });
      if (!pr.ok) throw new Error('providers ' + bp + ' HTTP ' + pr.status);
      const providers = await pr.json();
      if (!providers.length) throw new Error('aucun provider pour ' + bp);
      const pp = providers[0].id;
      const vr = await fetch(`${API}/catalog/blueprints/${bp}/print_providers/${pp}/variants.json`, { headers: H });
      if (!vr.ok) throw new Error('variants ' + bp + ' HTTP ' + vr.status);
      const variants = (await vr.json()).variants || [];
      cache[bp] = { pp, variants };
      return cache[bp];
    }
    function pickVariant(variants, colorEn, size) {
      const norm = s => String(s || '').toLowerCase();
      const sz = norm(size) === 'xxl' ? '2xl' : norm(size);
      function opt(v, k) { const o = v.options || {}; return norm(o[k] || o[k[0].toUpperCase() + k.slice(1)] || ''); }
      function matchTitle(v) { return norm(v.title); }
      // 1) couleur + taille
      let hit = variants.find(v => (opt(v, 'color').includes(norm(colorEn)) || matchTitle(v).includes(norm(colorEn))) && (opt(v, 'size') === sz || matchTitle(v).includes('/ ' + sz) || matchTitle(v).endsWith(sz)));
      // 2) Black + taille
      if (!hit) hit = variants.find(v => (opt(v, 'color').includes('black') || matchTitle(v).includes('black')) && (opt(v, 'size') === sz || matchTitle(v).endsWith(sz)));
      // 3) n'importe quelle taille
      if (!hit) hit = variants.find(v => opt(v, 'size') === sz || matchTitle(v).endsWith(sz));
      // 4) premier dispo
      if (!hit) hit = variants[0];
      return hit;
    }

    // Upload base64 → Printify (logos perso), retourne une URL hébergée utilisable en print_areas
    const upCache = {};
    async function designSrc(it, design) {
      const dd = it.design_data || '';
      if (/^data:image\//.test(dd)) {
        const key = design || dd.slice(0, 40);
        if (upCache[key]) return upCache[key];
        const b64 = dd.split(',')[1] || '';
        const ur = await fetch(`${API}/uploads/images.json`, { method: 'POST', headers: H, body: JSON.stringify({ file_name: (design || 'logo') + '.png', contents: b64 }) });
        if (ur.ok) { const uj = await ur.json(); const src = uj.preview_url || uj.id; upCache[key] = src; return src; }
        warnings.push('upload base64 KO (' + ur.status + ')');
      }
      return IMG_BASE + design + '.png';
    }
    const lineItems = [];
    const warnings = [];
    for (const it of items) {
      const bp = it.blueprint_id || GARMENT_BP[it.garment] || GARMENT_BP.tee;
      const design = String(it.design || 'crest').replace(/[^a-z0-9-]/gi, '');
      const colorEn = COLOR_FR2EN[it.color] || it.color || 'Black';
      try {
        const { pp, variants } = await resolve(bp);
        const v = pickVariant(variants, colorEn, it.size || 'M');
        if (!v) { warnings.push('variante introuvable ' + bp); continue; }
        const src = await designSrc(it, design);
        lineItems.push({
          print_provider_id: pp, blueprint_id: bp, variant_id: v.id,
          print_areas: { front: src },
          quantity: Math.max(1, it.quantity || 1)
        });
      } catch (e) { warnings.push(e.message); }
    }
    if (!lineItems.length) return J({ ok: false, detail: 'aucune ligne résolue', warnings }, 422, origin);

    const tokens = String(a.name || '').trim().split(/\s+/);
    const first = tokens[0] || 'Client';
    const last = tokens.slice(1).join(' ') || 'La Détente';
    const orderBody = {
      external_id: String(body.orderId || ('LD-' + Date.now())).slice(0, 40),
      label: 'La Détente ' + (body.orderId || ''),
      line_items: lineItems,
      shipping_method: 1,
      is_printify_express: false,
      send_shipping_notification: false,
      address_to: {
        first_name: first, last_name: last,
        email: String(a.email || '').slice(0, 120),
        phone: String(a.phone || '').slice(0, 30),
        country: isoCountry(a.country), region: '',
        address1: String(a.addr || '').slice(0, 120), address2: '',
        city: String(a.city || '').slice(0, 60), zip: String(a.zip || '').slice(0, 16)
      }
    };
    const r = await fetch(`${API}/shops/${SHOP_ID}/orders.json`, { method: 'POST', headers: H, body: JSON.stringify(orderBody) });
    const txt = await r.text();
    if (!r.ok) return J({ ok: false, detail: 'Printify HTTP ' + r.status + ' : ' + txt.slice(0, 300), warnings }, 502, origin);
    let pj; try { pj = JSON.parse(txt); } catch (_) { pj = {}; }
    // Statut "on-hold" : Kevin valide/paie dans Printify. (Pas d'envoi auto en production.)
    return J({ ok: true, printify_order_id: pj.id || null, lines: lineItems.length, warnings, status: 'on-hold (à valider dans Printify)' }, 200, origin);
  }
};
