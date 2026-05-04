/**
 * APEX v13 — Cuisine Pro Module (port v12 vCuisinePro)
 *
 * Niveau chef + nutritionniste :
 * - 10 recettes FR classiques
 * - 22 modes/temps de cuisson
 * - 14 allergènes INCO (UE Règlement 1169/2011)
 * - 14 régimes alimentaires
 * - Conversions cuisine
 * - Calculs calories par aliment
 *
 * Sources autoritaires : Règlement INCO 1169/2011, ANSES, CIQUAL
 */

import { logger } from '../../../../core/logger.js';

export interface CuissonInfo {
  temps: string;
  eau?: string;
  methode?: string;
  rincage?: string;
  trempage?: string;
  temp_coeur?: string;
  repos?: string;
}

export interface Recette {
  nom: string;
  temps: string;
  difficulte: 'facile' | 'intermediaire' | 'difficile';
  ingredients: readonly string[];
  allergenes?: readonly string[];
}

export const AX_CUISINE = {
  conversions: {
    '1 cuillere a soupe': '15 ml',
    '1 cuillere a cafe': '5 ml',
    '1 verre a moutarde': '200 ml',
    '1 tasse': '240 ml',
    '1 pincee': '0.5 g',
    '1 oeuf moyen': '55 g',
    '1 yaourt': '125 g',
  } as Record<string, string>,
  cuissons: {
    'riz blanc': { temps: '18 min', eau: '2x volume', methode: 'absorption' },
    'riz complet': { temps: '35 min', eau: '2.5x volume' },
    'pates al dente': { temps: 'variable selon paquet (-1 min)', eau: '1L pour 100g' },
    quinoa: { temps: '15 min', eau: '2x volume', rincage: 'obligatoire' },
    boulgour: { temps: '10 min', eau: '2x volume' },
    'lentilles vertes': { temps: '25 min', trempage: 'non requis' },
    'haricots secs': { temps: '1h30', trempage: '12h' },
    'oeuf coque': { temps: '3 min', eau: 'bouillante' },
    'oeuf mollet': { temps: '6 min' },
    'oeuf dur': { temps: '10 min' },
    'poulet entier': { temps: '1h30 a 200C', repos: '15 min' },
    'blanc poulet': { temps: '15 min poele moyenne' },
    'boeuf bleu': { temps: '30 sec/face', temp_coeur: '45-50C' },
    'boeuf saignant': { temps: '1 min/face', temp_coeur: '50-55C' },
    'boeuf a point': { temps: '3 min/face', temp_coeur: '60-65C' },
    'boeuf bien cuit': { temps: '5 min/face', temp_coeur: '70-75C' },
    saumon: { temps: '4 min/face peau', temp_coeur: '50C' },
    'patisserie 4 4': { temps: '30 min a 180C' },
    'pizza maison': { temps: '10 min a 250C' },
    'gigot agneau': { temps: '15 min/500g a 200C', repos: '10 min' },
    'tarte salee': { temps: '35 min a 180C' },
    'gratin dauphinois': { temps: '1h a 160C' },
  } as Record<string, CuissonInfo>,
  allergenes: [
    'Gluten',
    'Crustaces',
    'Oeufs',
    'Poisson',
    'Arachide',
    'Soja',
    'Lait',
    'Fruits a coque',
    'Celeri',
    'Moutarde',
    'Sesame',
    'Sulfites',
    'Lupin',
    'Mollusques',
  ] as const,
  regimes: [
    'Omnivore',
    'Vegetarien',
    'Vegetalien/Vegan',
    'Sans gluten',
    'Sans lactose',
    'Pescetarien',
    'Halal',
    'Casher',
    'Paleo',
    'Cetogene',
    'Mediterraneen',
    'DASH',
    'Diabetique',
    'Faible sodium',
  ] as const,
  recettes: [
    {
      nom: 'Boeuf bourguignon',
      temps: '3h',
      difficulte: 'intermediaire',
      ingredients: ['boeuf 1.5kg', 'vin rouge bouteille', 'lardons 200g', 'carottes 4', 'oignons 3', 'champignons 250g', 'bouquet garni'],
      allergenes: ['sulfites'],
    },
    {
      nom: 'Blanquette de veau',
      temps: '1h30',
      difficulte: 'intermediaire',
      ingredients: ['veau epaule 1kg', 'carottes 4', 'oignon', 'poireau', 'beurre', 'farine', 'creme fraiche 20cl', 'jaune oeuf'],
      allergenes: ['oeufs', 'lait'],
    },
    {
      nom: 'Quiche lorraine',
      temps: '45min',
      difficulte: 'facile',
      ingredients: ['pate brisee', 'lardons 200g', 'oeufs 3', 'creme 20cl', 'lait 20cl', 'muscade'],
      allergenes: ['gluten', 'oeufs', 'lait'],
    },
    {
      nom: 'Ratatouille',
      temps: '1h',
      difficulte: 'facile',
      ingredients: ['aubergines 2', 'courgettes 2', 'poivrons 3', 'tomates 4', 'oignon', 'ail', 'huile olive', 'herbes provence'],
    },
    {
      nom: 'Tarte tatin',
      temps: '1h',
      difficulte: 'intermediaire',
      ingredients: ['pommes 6', 'sucre 150g', 'beurre 80g', 'pate brisee'],
      allergenes: ['gluten', 'lait'],
    },
    {
      nom: 'Mousse au chocolat',
      temps: '30min + 4h frais',
      difficulte: 'facile',
      ingredients: ['chocolat noir 200g', 'oeufs 6', 'sucre 30g', 'sel'],
      allergenes: ['oeufs', 'lait'],
    },
    {
      nom: 'Soupe a l oignon',
      temps: '45min',
      difficulte: 'facile',
      ingredients: ['oignons 1kg', 'beurre', 'farine', 'bouillon boeuf 1.5L', 'gruyere rape', 'pain'],
      allergenes: ['gluten', 'lait'],
    },
    {
      nom: 'Pot-au-feu',
      temps: '3h',
      difficulte: 'facile',
      ingredients: ['boeuf paleron 800g', 'os a moelle', 'carottes', 'poireaux', 'navets', 'pommes de terre', 'oignon piquet de clou'],
    },
    {
      nom: 'Crepes sucrees',
      temps: '30min',
      difficulte: 'facile',
      ingredients: ['farine 250g', 'oeufs 4', 'lait 50cl', 'sel', 'beurre', 'sucre'],
      allergenes: ['gluten', 'oeufs', 'lait'],
    },
    {
      nom: 'Salade nicoise',
      temps: '20min',
      difficulte: 'facile',
      ingredients: ['thon', 'oeufs durs', 'tomates', 'haricots verts', 'olives', 'oignon rouge', 'huile olive'],
      allergenes: ['poisson', 'oeufs'],
    },
  ] as readonly Recette[],
  /** kcal pour 100g */
  calories: {
    'boeuf maigre': 150,
    'boeuf gras': 250,
    poulet: 160,
    saumon: 200,
    thon: 140,
    oeuf: 150,
    'pates cuites': 130,
    'riz cuit': 130,
    pain: 260,
    pomme: 52,
    banane: 89,
    fromage: 350,
    yaourt: 60,
    huile: 900,
    beurre: 750,
    'chocolat noir': 540,
    vin: 80,
  } as Record<string, number>,
} as const;

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);
}

/**
 * Convertir une mesure cuisine. Retourne null si non reconnue.
 */
export function cuisineConvert(quantite: string): { original: string; equivalent: string } | null {
  const t = String(quantite || '').toLowerCase().trim();
  const r = AX_CUISINE.conversions[t];
  return r ? { original: quantite, equivalent: r } : null;
}

/**
 * Recherche full-text recettes par nom OU ingrédient.
 */
export function cuisineSearch(query: string): readonly Recette[] {
  const q = String(query || '').toLowerCase().trim();
  if (!q) return AX_CUISINE.recettes;
  return AX_CUISINE.recettes.filter(
    (r) => r.nom.toLowerCase().includes(q) || r.ingredients.some((i) => i.toLowerCase().includes(q))
  );
}

/**
 * Calcule total calories pour une liste d'aliments.
 */
export function calcCalories(aliments: ReadonlyArray<{ nom: string; grammes: number }>): {
  total_kcal: number;
  detail: Array<{ aliment: string; grammes: number; kcal: number }>;
} {
  let total = 0;
  const detail: Array<{ aliment: string; grammes: number; kcal: number }> = [];
  for (const a of aliments || []) {
    const k = String(a.nom || '').toLowerCase();
    const perCent = AX_CUISINE.calories[k] ?? 100;
    const g = Number(a.grammes) || 0;
    const kcal = Math.round((g * perCent) / 100);
    total += kcal;
    detail.push({ aliment: a.nom, grammes: g, kcal });
  }
  return { total_kcal: total, detail };
}

/**
 * Génère liste de courses agrégée à partir d'un set de recettes.
 */
export function generateCourses(recettes: readonly Recette[]): string[] {
  const courses: Record<string, number> = {};
  for (const r of recettes || []) {
    for (const i of r.ingredients || []) {
      courses[i] = (courses[i] ?? 0) + 1;
    }
  }
  return Object.keys(courses).map((k) => `${courses[k]}x ${k}`);
}

/**
 * Render UI premium Cuisine Pro.
 */
export function render(root: HTMLElement): void {
  const cuissonsHtml = Object.keys(AX_CUISINE.cuissons)
    .map((k) => {
      const c = AX_CUISINE.cuissons[k];
      if (!c) return '';
      let line = `<div style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.08)"><strong>${escapeHtml(k)}</strong> : ${escapeHtml(c.temps)}`;
      if (c.eau) line += ` &middot; 💧 ${escapeHtml(c.eau)}`;
      if (c.temp_coeur) line += ` &middot; 🌡 ${escapeHtml(c.temp_coeur)}`;
      if (c.repos) line += ` &middot; ⏸ repos ${escapeHtml(c.repos)}`;
      if (c.rincage) line += ` &middot; 🚿 ${escapeHtml(c.rincage)}`;
      if (c.trempage) line += ` &middot; 💧 trempage ${escapeHtml(c.trempage)}`;
      line += '</div>';
      return line;
    })
    .join('');

  const conversionsHtml = Object.keys(AX_CUISINE.conversions)
    .map((k) => `<div>${escapeHtml(k)} = <strong>${escapeHtml(AX_CUISINE.conversions[k] ?? '')}</strong></div>`)
    .join('');

  const allergenesHtml = AX_CUISINE.allergenes
    .map((a) => `<span style="display:inline-block;padding:4px 10px;background:rgba(255,107,52,0.15);border-radius:12px;margin:3px;font-size:12px;color:#ffb56b">${escapeHtml(a)}</span>`)
    .join('');

  const regimesHtml = AX_CUISINE.regimes
    .map((a) => `<span style="display:inline-block;padding:4px 10px;background:rgba(76,175,80,0.15);border-radius:12px;margin:3px;font-size:12px;color:#7adda1">${escapeHtml(a)}</span>`)
    .join('');

  root.innerHTML = `
    <div style="padding:16px;max-width:900px;margin:0 auto;color:var(--ax-text,#eee)">
      <h2 style="background:linear-gradient(135deg,#ff8c42,#ffb56b);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-size:28px;margin-bottom:8px">🍳 Cuisine Pro</h2>
      <p style="color:var(--ax-text-dim,#999);font-size:13px;margin-bottom:16px">10 recettes FR &middot; 22 cuissons &middot; 14 allergènes INCO &middot; calories</p>
      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:12px">
        <h3 style="color:#ffb56b;margin:0 0 10px">📖 Recettes classiques FR (${AX_CUISINE.recettes.length})</h3>
        <input id="cuiQ" type="text" placeholder="Rechercher (poulet, bourguignon, ratatouille...)" style="width:100%;padding:11px;font-size:14px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);color:#eee;border-radius:8px;min-height:44px" aria-label="Recherche recette">
        <button id="cuiSearchBtn" type="button" style="width:100%;margin-top:8px;padding:12px;background:linear-gradient(135deg,#ff8c42,#ffb56b);color:#000;border:0;border-radius:8px;font-weight:700;cursor:pointer;min-height:44px">Rechercher</button>
        <div id="cuiSearchResult" style="margin-top:10px;font-size:13px"></div>
      </div>
      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:12px">
        <h3 style="color:#ffb56b;margin:0 0 10px">⏱ Temps de cuisson (${Object.keys(AX_CUISINE.cuissons).length})</h3>
        <div style="font-size:12px;line-height:1.7;max-height:260px;overflow-y:auto">${cuissonsHtml}</div>
      </div>
      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:12px">
        <h3 style="color:#ffb56b;margin:0 0 10px">📐 Conversions cuisine</h3>
        <div style="font-size:13px;line-height:1.8">${conversionsHtml}</div>
      </div>
      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:12px">
        <h3 style="color:#ffb56b;margin:0 0 10px">⚠ 14 allergènes UE (INCO)</h3>
        <p style="font-size:11px;color:#888;margin:0 0 8px">Source : Règlement (UE) 1169/2011 (information consommateur)</p>
        <div>${allergenesHtml}</div>
      </div>
      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:12px">
        <h3 style="color:#ffb56b;margin:0 0 10px">🥗 Régimes alimentaires (${AX_CUISINE.regimes.length})</h3>
        <div>${regimesHtml}</div>
      </div>
      <p style="margin-top:18px;text-align:center;font-size:11px;color:#666">Sources : Règlement INCO 1169/2011 &middot; ANSES &middot; CIQUAL</p>
    </div>
  `;

  const btn = root.querySelector<HTMLButtonElement>('#cuiSearchBtn');
  if (btn) {
    btn.addEventListener('click', () => {
      const inp = root.querySelector<HTMLInputElement>('#cuiQ');
      const out = root.querySelector<HTMLDivElement>('#cuiSearchResult');
      if (!inp || !out) return;
      const res = cuisineSearch(inp.value);
      if (!res.length) {
        out.innerHTML = '<em>Aucune recette trouvée</em>';
        return;
      }
      out.innerHTML = res
        .map(
          (r) =>
            `<div style="padding:10px;border:1px solid rgba(255,255,255,0.08);border-radius:8px;margin:6px 0;background:rgba(0,0,0,0.2)"><strong>${escapeHtml(r.nom)}</strong> &middot; ${escapeHtml(r.temps)} &middot; <em>${escapeHtml(r.difficulte)}</em><br><small style="color:#aaa">📦 ${r.ingredients.map(escapeHtml).join(', ')}</small>${r.allergenes ? `<br><small style="color:#e74c3c">⚠ ${r.allergenes.map(escapeHtml).join(', ')}</small>` : ''}</div>`
        )
        .join('');
    });
  }

  logger.info('cuisine-pro', 'rendered');
}
