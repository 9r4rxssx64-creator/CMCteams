/* La Détente — récupère TOUT le catalogue Printify (tous les produits) groupé par
   catégorie, avec image d'aperçu, pour que l'admin choisisse quoi vendre.
   Écrit shops/la-detente/printify-blueprints.json. CI avec PRINTIFY_API_KEY. */
import fs from 'fs';

const KEY = process.env.PRINTIFY_API_KEY;
if (!KEY) { console.error('❌ PRINTIFY_API_KEY manquante'); process.exit(1); }
const BASE = 'https://api.printify.com/v1';
const H = { 'Authorization': 'Bearer ' + KEY, 'User-Agent': 'LaDetente-KDMC/1.0' };
const OUT = process.cwd() + '/shops/la-detente/printify-blueprints.json';

const CATS = [
  { id: 'tshirt',     label: 'T-shirts',            re: /(t-?shirt|tee)\b/i,  not: /long ?sleeve|tank|kids|toddler|baby|crop/i },
  { id: 'longsleeve', label: 'Manches longues',     re: /long ?sleeve/i },
  { id: 'hoodie',     label: 'Hoodies',             re: /hoodie|hooded/i },
  { id: 'sweatshirt', label: 'Sweats',              re: /sweatshirt|crewneck|crew neck/i, not: /hood/i },
  { id: 'polo',       label: 'Polos',               re: /polo/i },
  { id: 'tank',       label: 'Débardeurs',          re: /tank/i },
  { id: 'jacket',     label: 'Vestes & Zip',        re: /jacket|zip|bomber|windbreaker/i },
  { id: 'pants',      label: 'Joggings & Bas',      re: /jogger|sweatpant|leggings|shorts|pants/i },
  { id: 'kids',       label: 'Enfants & Bébé',      re: /kids|toddler|baby|youth|infant/i },
  { id: 'hat',        label: 'Casquettes & Bonnets',re: /\b(hat|cap|beanie|visor|snapback|trucker|bucket)\b/i },
  { id: 'bag',        label: 'Sacs & Totes',        re: /\b(bag|tote|backpack|pouch|duffle|fanny)\b/i },
  { id: 'mug',        label: 'Mugs & Bouteilles',   re: /\b(mug|tumbler|bottle|can cooler|glass)\b/i },
  { id: 'home',       label: 'Maison & Déco',       re: /poster|canvas|pillow|blanket|flag|towel|mat|tapestry|ornament/i },
  { id: 'accessory',  label: 'Accessoires',         re: /sock|phone|case|sticker|pin|patch|magnet|apron|bandana|keychain|notebook|mousepad/i }
];
function categorize(title) {
  for (const c of CATS) { if (c.re.test(title) && !(c.not && c.not.test(title))) return c.id; }
  return 'other';
}

(async () => {
  const r = await fetch(BASE + '/catalog/blueprints.json', { headers: H });
  const txt = await r.text();
  if (!r.ok) { console.error('HTTP ' + r.status + ' : ' + txt.slice(0, 160)); process.exit(2); }
  const bps = JSON.parse(txt);
  console.log('  ', bps.length, 'blueprints Printify');
  const groups = {};
  CATS.concat([{ id: 'other', label: 'Autres' }]).forEach(c => { groups[c.id] = { label: c.label, items: [] }; });
  bps.forEach(b => {
    const cat = categorize(b.title || '');
    groups[cat].items.push({
      id: b.id, title: b.title, brand: b.brand || '', model: b.model || '',
      image: (b.images && b.images[0]) || ''
    });
  });
  Object.keys(groups).forEach(k => { if (!groups[k].items.length) delete groups[k]; else groups[k].items.sort((a, b) => a.title.localeCompare(b.title)); });
  const cfg = {
    generated_at: new Date().toISOString(),
    total: bps.length,
    note: 'Catalogue Printify complet par catégorie — l\'admin choisit, applique un design, publie.',
    categories: groups
  };
  fs.writeFileSync(OUT, JSON.stringify(cfg, null, 2));
  const summ = Object.keys(groups).map(k => k + ':' + groups[k].items.length).join(' · ');
  console.log('\n🖼️ printify-blueprints.json écrit —', summ);
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
