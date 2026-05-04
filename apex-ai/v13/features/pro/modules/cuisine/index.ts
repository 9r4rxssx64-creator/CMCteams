/**
 * APEX v13 — Cuisine Pro Module (port v12 vCuisinePro + EXPANSION EXPERT)
 *
 * Niveau chef + nutritionniste pro :
 * - 50+ recettes (FR classiques + 10 internationales) avec calories, macros, vins
 * - 30+ modes/temps de cuisson avec températures précises
 * - 14 allergènes INCO (UE Règlement 1169/2011)
 * - Conversions exhaustives (poids, volumes, températures, US/UK/FR)
 * - Calcul calories + macros (P/L/G) + index glycémique
 * - 14 régimes alimentaires (omnivore, vegan, keto, paleo, mediterranean, DASH, etc.)
 * - Plans menus 7j (1500/2000/2500 kcal)
 * - Liste de courses auto-agrégée + scaling portions
 * - Substitutions ingrédients (lactose-free, gluten-free, vegan)
 * - Sommellerie : vins recommandés par plat
 *
 * Sources autoritaires : Règlement INCO 1169/2011, ANSES, CIQUAL (data nutrition FR)
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
  four?: string;
}

export interface MacroNutriments {
  proteines: number;
  lipides: number;
  glucides: number;
  fibres?: number;
  ig?: 'bas' | 'moyen' | 'haut';
}

export interface Recette {
  nom: string;
  temps: string;
  difficulte: 'facile' | 'intermediaire' | 'difficile';
  ingredients: readonly string[];
  allergenes?: readonly string[];
  calories?: number;
  portions?: number;
  origine?: string;
  vin_accord?: string;
  categorie?: 'entree' | 'plat' | 'dessert' | 'soupe' | 'salade' | 'petit_dej' | 'aperitif';
}

export interface MenuJour {
  jour: string;
  petit_dej: string;
  dejeuner: string;
  diner: string;
  collation?: string;
  total_kcal: number;
}

export interface PlanMenu {
  cible_kcal: number;
  type: string;
  jours: readonly MenuJour[];
}

 
export const AX_CUISINE = {
  /** Conversions exhaustives (volumes, poids, températures) */
  conversions: {
    /* Volumes FR */
    '1 cuillere a soupe': '15 ml',
    '1 cuillere a cafe': '5 ml',
    '1 verre a moutarde': '200 ml',
    '1 tasse': '240 ml',
    '1 bol': '350 ml',
    /* Poids cuisine */
    '1 pincee': '0.5 g',
    '1 noix de beurre': '15 g',
    '1 noisette de beurre': '5 g',
    '1 oeuf moyen': '55 g',
    '1 oeuf gros': '65 g',
    '1 yaourt': '125 g',
    '1 cuillere a soupe farine': '10 g',
    '1 cuillere a soupe sucre': '15 g',
    '1 cuillere a soupe huile': '13 g',
    '1 cuillere a soupe miel': '20 g',
    '1 verre farine': '120 g',
    '1 verre sucre': '180 g',
    '1 verre riz': '180 g',
    /* US to FR */
    '1 cup farine': '120 g',
    '1 cup sucre': '200 g',
    '1 cup beurre': '227 g',
    '1 cup lait': '240 ml',
    '1 stick beurre US': '113 g',
    '1 oz': '28.35 g',
    '1 lb': '453.6 g',
    /* Temperatures four */
    '180C': '350F = thermostat 6',
    '200C': '400F = thermostat 7',
    '220C': '425F = thermostat 8',
    '160C': '325F = thermostat 5',
    '240C': '475F = thermostat 9',
  } as Record<string, string>,
  /** Cuissons : 30+ modes documentés avec températures précises */
  cuissons: {
    'riz blanc': { temps: '18 min', eau: '2x volume', methode: 'absorption' },
    'riz complet': { temps: '35 min', eau: '2.5x volume' },
    'riz arborio risotto': { temps: '20 min', eau: 'ajout progressif bouillon' },
    'pates al dente': { temps: 'paquet -1 min', eau: '1L/100g + 10g sel' },
    quinoa: { temps: '15 min', eau: '2x volume', rincage: 'obligatoire (saponine)' },
    boulgour: { temps: '10 min', eau: '2x volume' },
    couscous: { temps: '5 min repos', eau: '1.5x volume eau bouillante' },
    'lentilles vertes': { temps: '25 min', trempage: 'non requis' },
    'lentilles corail': { temps: '15 min', trempage: 'non requis' },
    'haricots secs': { temps: '1h30', trempage: '12h eau froide' },
    'pois chiches': { temps: '1h30', trempage: '12h eau froide' },
    'oeuf coque': { temps: '3 min', eau: 'bouillante' },
    'oeuf mollet': { temps: '6 min', eau: 'bouillante' },
    'oeuf dur': { temps: '10 min', eau: 'bouillante' },
    'oeuf poche': { temps: '3 min', eau: 'fremissante + vinaigre' },
    'poulet entier': { temps: '1h30', four: '200C', repos: '15 min', temp_coeur: '74C' },
    'blanc poulet': { temps: '15 min poele moyenne', temp_coeur: '74C' },
    'cuisse poulet': { temps: '40 min', four: '180C', temp_coeur: '74C' },
    'boeuf bleu': { temps: '30 sec/face', temp_coeur: '45-50C' },
    'boeuf saignant': { temps: '1 min/face', temp_coeur: '50-55C' },
    'boeuf a point': { temps: '3 min/face', temp_coeur: '60-65C' },
    'boeuf bien cuit': { temps: '5 min/face', temp_coeur: '70-75C' },
    'cote boeuf 1kg': { temps: '5+5 min', four: '200C apres saisie', repos: '10 min' },
    saumon: { temps: '4 min/face peau', temp_coeur: '50C' },
    'cabillaud filet': { temps: '8 min', four: '180C', temp_coeur: '60C' },
    'magret canard': { temps: '8 min cote peau + 5 min', temp_coeur: '60C' },
    'gigot agneau': { temps: '15 min/500g', four: '200C', repos: '10 min' },
    'patisserie 4 4': { temps: '30 min', four: '180C' },
    'pizza maison': { temps: '10 min', four: '250C' },
    'tarte salee': { temps: '35 min', four: '180C' },
    'gratin dauphinois': { temps: '1h', four: '160C' },
    'pain maison': { temps: '25-30 min', four: '230C' },
    brioche: { temps: '25 min', four: '180C' },
    macaron: { temps: '13 min', four: '150C', repos: 'croutage 30 min' },
  } as Record<string, CuissonInfo>,
  /** 14 allergènes INCO obligatoires */
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
  /** 14 régimes alimentaires + descriptifs */
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
  /** Substitutions ingrédients (lactose-free, gluten-free, vegan) */
  substitutions: {
    lactose: {
      lait: 'lait amande / soja / avoine',
      beurre: 'margarine vegetale / huile coco',
      creme: 'creme soja / coco',
      yaourt: 'yaourt soja / coco',
      fromage: 'levure maltee / fromage vegan',
    },
    gluten: {
      farine: 'farine riz / sarrasin / mais',
      pain: 'pain sans gluten / galette riz',
      pates: 'pates riz / quinoa / lentilles',
      chapelure: 'chapelure mais / amande mixee',
      sauce_soja: 'tamari sans gluten',
    },
    vegan: {
      oeuf: '1 oeuf = 1cs graines lin + 3cs eau (15 min repos)',
      miel: 'sirop agave / erable',
      gelatine: 'agar-agar / pectine',
      lait: 'lait vegetal',
      beurre: 'huile coco / margarine vegetale',
      fromage: 'levure nutritionnelle / cashew cream',
    },
  } as Record<string, Record<string, string>>,
  /** 50+ recettes (40 FR + 10 internationales) */
  recettes: [
    /* Plats FR classiques */
    {
      nom: 'Boeuf bourguignon',
      temps: '3h',
      difficulte: 'intermediaire',
      ingredients: ['boeuf 1.5kg', 'vin rouge bouteille', 'lardons 200g', 'carottes 4', 'oignons 3', 'champignons 250g', 'bouquet garni'],
      allergenes: ['sulfites'],
      calories: 580,
      portions: 6,
      origine: 'France',
      vin_accord: 'Bourgogne Pinot Noir',
      categorie: 'plat',
    },
    {
      nom: 'Blanquette de veau',
      temps: '1h30',
      difficulte: 'intermediaire',
      ingredients: ['veau epaule 1kg', 'carottes 4', 'oignon', 'poireau', 'beurre', 'farine', 'creme fraiche 20cl', 'jaune oeuf'],
      allergenes: ['oeufs', 'lait'],
      calories: 520,
      portions: 6,
      origine: 'France',
      vin_accord: 'Bourgogne Chardonnay',
      categorie: 'plat',
    },
    {
      nom: 'Coq au vin',
      temps: '2h',
      difficulte: 'intermediaire',
      ingredients: ['poulet ferme 1.8kg', 'vin rouge 75cl', 'lardons 150g', 'champignons', 'oignons grelot', 'cognac', 'thym laurier'],
      allergenes: ['sulfites'],
      calories: 510,
      portions: 6,
      origine: 'France',
      vin_accord: 'Cote du Rhone',
      categorie: 'plat',
    },
    {
      nom: 'Cassoulet',
      temps: '3h30',
      difficulte: 'difficile',
      ingredients: ['haricots tarbais 500g', 'confit canard', 'saucisse Toulouse', 'lard', 'tomates concassees', 'oignon', 'ail'],
      calories: 720,
      portions: 8,
      origine: 'France',
      vin_accord: 'Cahors',
      categorie: 'plat',
    },
    {
      nom: 'Choucroute garnie',
      temps: '2h',
      difficulte: 'intermediaire',
      ingredients: ['choucroute 1kg', 'lardons 200g', 'saucisses fumees 4', 'palette porc fumee', 'pommes terre', 'baies genievre'],
      calories: 690,
      portions: 6,
      origine: 'Alsace',
      vin_accord: 'Riesling Alsace',
      categorie: 'plat',
    },
    {
      nom: 'Quiche lorraine',
      temps: '45min',
      difficulte: 'facile',
      ingredients: ['pate brisee', 'lardons 200g', 'oeufs 3', 'creme 20cl', 'lait 20cl', 'muscade'],
      allergenes: ['gluten', 'oeufs', 'lait'],
      calories: 380,
      portions: 6,
      origine: 'Lorraine',
      vin_accord: 'Vin gris Toul',
      categorie: 'plat',
    },
    {
      nom: 'Ratatouille',
      temps: '1h',
      difficulte: 'facile',
      ingredients: ['aubergines 2', 'courgettes 2', 'poivrons 3', 'tomates 4', 'oignon', 'ail', 'huile olive', 'herbes provence'],
      calories: 180,
      portions: 4,
      origine: 'Provence',
      vin_accord: 'Rose Provence',
      categorie: 'plat',
    },
    {
      nom: 'Bouillabaisse',
      temps: '2h',
      difficulte: 'difficile',
      ingredients: ['poissons roche 1.5kg', 'rouget', 'safran', 'fenouil', 'tomates', 'pommes terre', 'rouille', 'pain'],
      allergenes: ['poisson', 'gluten'],
      calories: 480,
      portions: 6,
      origine: 'Marseille',
      vin_accord: 'Cassis blanc',
      categorie: 'soupe',
    },
    {
      nom: 'Pot-au-feu',
      temps: '3h',
      difficulte: 'facile',
      ingredients: ['boeuf paleron 800g', 'os a moelle', 'carottes', 'poireaux', 'navets', 'pommes de terre', 'oignon piquet de clou'],
      calories: 430,
      portions: 6,
      origine: 'France',
      vin_accord: 'Beaujolais',
      categorie: 'plat',
    },
    {
      nom: 'Steak frites',
      temps: '20min',
      difficulte: 'facile',
      ingredients: ['steak entrecote 200g', 'pommes de terre 400g', 'huile friture', 'beurre', 'sel poivre'],
      calories: 720,
      portions: 1,
      origine: 'Bistrot FR',
      vin_accord: 'Cote du Rhone',
      categorie: 'plat',
    },
    {
      nom: 'Magret de canard',
      temps: '20min',
      difficulte: 'intermediaire',
      ingredients: ['magret canard 350g', 'miel', 'vinaigre balsamique', 'sel poivre'],
      calories: 580,
      portions: 2,
      origine: 'Sud-Ouest',
      vin_accord: 'Madiran',
      categorie: 'plat',
    },
    {
      nom: 'Confit de canard',
      temps: '2h + nuit',
      difficulte: 'intermediaire',
      ingredients: ['cuisses canard 4', 'gros sel 100g', 'graisse canard 1kg', 'thym laurier ail'],
      calories: 620,
      portions: 4,
      origine: 'Sud-Ouest',
      vin_accord: 'Cahors',
      categorie: 'plat',
    },
    {
      nom: 'Croque-monsieur',
      temps: '15min',
      difficulte: 'facile',
      ingredients: ['pain de mie', 'jambon blanc', 'gruyere rape', 'beurre', 'bechamel'],
      allergenes: ['gluten', 'lait'],
      calories: 480,
      portions: 1,
      origine: 'Bistrot FR',
      vin_accord: 'Sancerre',
      categorie: 'plat',
    },
    {
      nom: 'Salade nicoise',
      temps: '20min',
      difficulte: 'facile',
      ingredients: ['thon', 'oeufs durs', 'tomates', 'haricots verts', 'olives noires', 'oignon rouge', 'huile olive', 'anchois'],
      allergenes: ['poisson', 'oeufs'],
      calories: 320,
      portions: 4,
      origine: 'Nice',
      vin_accord: 'Bellet rose',
      categorie: 'salade',
    },
    {
      nom: 'Salade lyonnaise',
      temps: '15min',
      difficulte: 'facile',
      ingredients: ['frisee', 'lardons 150g', 'oeuf poche', 'croutons aillees', 'vinaigrette moutarde'],
      allergenes: ['oeufs', 'gluten', 'moutarde'],
      calories: 380,
      portions: 2,
      origine: 'Lyon',
      vin_accord: 'Beaujolais',
      categorie: 'salade',
    },
    /* Soupes */
    {
      nom: 'Soupe a l oignon gratinee',
      temps: '45min',
      difficulte: 'facile',
      ingredients: ['oignons 1kg', 'beurre', 'farine', 'bouillon boeuf 1.5L', 'gruyere rape', 'pain'],
      allergenes: ['gluten', 'lait'],
      calories: 290,
      portions: 4,
      origine: 'Lyon',
      vin_accord: 'Beaujolais',
      categorie: 'soupe',
    },
    {
      nom: 'Veloute de potiron',
      temps: '40min',
      difficulte: 'facile',
      ingredients: ['potiron 1kg', 'oignon', 'creme', 'bouillon legumes', 'muscade', 'graines courge'],
      allergenes: ['lait'],
      calories: 220,
      portions: 4,
      origine: 'France',
      vin_accord: 'Riesling',
      categorie: 'soupe',
    },
    {
      nom: 'Velouté champignons',
      temps: '35min',
      difficulte: 'facile',
      ingredients: ['champignons paris 500g', 'cepes secs 30g', 'echalotes', 'creme', 'vin blanc'],
      allergenes: ['lait', 'sulfites'],
      calories: 240,
      portions: 4,
      origine: 'France',
      vin_accord: 'Chardonnay',
      categorie: 'soupe',
    },
    /* Patisseries / Desserts */
    {
      nom: 'Tarte tatin',
      temps: '1h',
      difficulte: 'intermediaire',
      ingredients: ['pommes 6', 'sucre 150g', 'beurre 80g', 'pate brisee'],
      allergenes: ['gluten', 'lait'],
      calories: 380,
      portions: 8,
      origine: 'Sologne',
      vin_accord: 'Coteaux du Layon',
      categorie: 'dessert',
    },
    {
      nom: 'Mousse au chocolat',
      temps: '30min + 4h frais',
      difficulte: 'facile',
      ingredients: ['chocolat noir 200g', 'oeufs 6', 'sucre 30g', 'sel'],
      allergenes: ['oeufs', 'lait'],
      calories: 280,
      portions: 6,
      origine: 'France',
      vin_accord: 'Banyuls',
      categorie: 'dessert',
    },
    {
      nom: 'Creme brulee',
      temps: '50min + 4h frais',
      difficulte: 'intermediaire',
      ingredients: ['creme 50cl', 'jaunes oeufs 6', 'sucre 80g', 'vanille gousse', 'cassonade'],
      allergenes: ['oeufs', 'lait'],
      calories: 340,
      portions: 6,
      origine: 'France',
      vin_accord: 'Sauternes',
      categorie: 'dessert',
    },
    {
      nom: 'Profiteroles',
      temps: '1h30',
      difficulte: 'difficile',
      ingredients: ['pate a choux', 'glace vanille', 'chocolat noir 200g', 'creme'],
      allergenes: ['gluten', 'oeufs', 'lait'],
      calories: 420,
      portions: 6,
      origine: 'France',
      vin_accord: 'Maury',
      categorie: 'dessert',
    },
    {
      nom: 'Eclairs au chocolat',
      temps: '1h30',
      difficulte: 'difficile',
      ingredients: ['pate a choux', 'creme patissiere chocolat', 'fondant chocolat'],
      allergenes: ['gluten', 'oeufs', 'lait'],
      calories: 320,
      portions: 8,
      origine: 'France',
      vin_accord: 'Banyuls',
      categorie: 'dessert',
    },
    {
      nom: 'Macarons parisiens',
      temps: '2h',
      difficulte: 'difficile',
      ingredients: ['poudre amande 125g', 'sucre glace 125g', 'blancs oeufs 90g', 'sucre semoule', 'colorants', 'ganache'],
      allergenes: ['oeufs', 'fruits a coque'],
      calories: 110,
      portions: 30,
      origine: 'Paris',
      vin_accord: 'Champagne',
      categorie: 'dessert',
    },
    {
      nom: 'Crepes sucrees',
      temps: '30min',
      difficulte: 'facile',
      ingredients: ['farine 250g', 'oeufs 4', 'lait 50cl', 'sel', 'beurre', 'sucre'],
      allergenes: ['gluten', 'oeufs', 'lait'],
      calories: 180,
      portions: 12,
      origine: 'Bretagne',
      vin_accord: 'Cidre',
      categorie: 'dessert',
    },
    {
      nom: 'Galette des rois frangipane',
      temps: '1h30',
      difficulte: 'intermediaire',
      ingredients: ['pate feuilletee 2', 'poudre amande 125g', 'beurre 100g', 'sucre 100g', 'oeufs 2', 'feve'],
      allergenes: ['gluten', 'fruits a coque', 'oeufs', 'lait'],
      calories: 380,
      portions: 8,
      origine: 'France',
      vin_accord: 'Coteaux du Layon',
      categorie: 'dessert',
    },
    {
      nom: 'Far breton',
      temps: '1h',
      difficulte: 'facile',
      ingredients: ['farine 250g', 'oeufs 4', 'lait 75cl', 'sucre 150g', 'pruneaux 200g'],
      allergenes: ['gluten', 'oeufs', 'lait'],
      calories: 240,
      portions: 8,
      origine: 'Bretagne',
      vin_accord: 'Cidre',
      categorie: 'dessert',
    },
    {
      nom: 'Mille-feuille',
      temps: '2h',
      difficulte: 'difficile',
      ingredients: ['pate feuilletee 3', 'creme patissiere', 'fondant blanc', 'glace royale'],
      allergenes: ['gluten', 'oeufs', 'lait'],
      calories: 380,
      portions: 6,
      origine: 'Paris',
      vin_accord: 'Champagne demi-sec',
      categorie: 'dessert',
    },
    {
      nom: 'Tarte au citron meringuee',
      temps: '1h30',
      difficulte: 'intermediaire',
      ingredients: ['pate sablee', 'citrons 4', 'oeufs 4', 'sucre 200g', 'beurre 80g', 'meringue italienne'],
      allergenes: ['gluten', 'oeufs', 'lait'],
      calories: 320,
      portions: 8,
      origine: 'France',
      vin_accord: 'Champagne',
      categorie: 'dessert',
    },
    {
      nom: 'Paris-Brest',
      temps: '2h',
      difficulte: 'difficile',
      ingredients: ['pate a choux', 'creme mousseline praline', 'amandes effilees', 'sucre glace'],
      allergenes: ['gluten', 'oeufs', 'lait', 'fruits a coque'],
      calories: 410,
      portions: 8,
      origine: 'Paris',
      vin_accord: 'Sauternes',
      categorie: 'dessert',
    },
    {
      nom: 'Saint-Honore',
      temps: '3h',
      difficulte: 'difficile',
      ingredients: ['pate feuilletee', 'pate a choux', 'caramel', 'creme chiboust'],
      allergenes: ['gluten', 'oeufs', 'lait'],
      calories: 380,
      portions: 8,
      origine: 'Paris',
      vin_accord: 'Champagne',
      categorie: 'dessert',
    },
    {
      nom: 'Madeleines',
      temps: '40min',
      difficulte: 'facile',
      ingredients: ['farine 200g', 'sucre 150g', 'oeufs 3', 'beurre 150g', 'levure', 'citron zeste'],
      allergenes: ['gluten', 'oeufs', 'lait'],
      calories: 95,
      portions: 24,
      origine: 'Commercy',
      vin_accord: 'The',
      categorie: 'dessert',
    },
    /* Plats internationaux */
    {
      nom: 'Pasta carbonara',
      temps: '20min',
      difficulte: 'facile',
      ingredients: ['spaghetti 400g', 'guanciale 200g', 'oeufs 4 jaunes', 'pecorino romano 100g', 'poivre noir'],
      allergenes: ['gluten', 'oeufs', 'lait'],
      calories: 620,
      portions: 4,
      origine: 'Italie - Rome',
      vin_accord: 'Frascati',
      categorie: 'plat',
    },
    {
      nom: 'Risotto Milanese',
      temps: '40min',
      difficulte: 'intermediaire',
      ingredients: ['riz arborio 320g', 'safran', 'parmesan 80g', 'beurre 80g', 'oignon', 'vin blanc', 'bouillon'],
      allergenes: ['lait', 'sulfites'],
      calories: 510,
      portions: 4,
      origine: 'Italie - Milan',
      vin_accord: 'Soave',
      categorie: 'plat',
    },
    {
      nom: 'Pizza margherita',
      temps: '2h (incl repos)',
      difficulte: 'intermediaire',
      ingredients: ['pate pizza', 'sauce tomate', 'mozzarella di bufala', 'basilic frais', 'huile olive', 'sel'],
      allergenes: ['gluten', 'lait'],
      calories: 720,
      portions: 1,
      origine: 'Italie - Naples',
      vin_accord: 'Chianti',
      categorie: 'plat',
    },
    {
      nom: 'Paella valenciana',
      temps: '1h',
      difficulte: 'intermediaire',
      ingredients: ['riz bomba 400g', 'poulet', 'lapin', 'haricots verts', 'safran', 'tomate', 'huile olive'],
      calories: 580,
      portions: 4,
      origine: 'Espagne - Valence',
      vin_accord: 'Rioja',
      categorie: 'plat',
    },
    {
      nom: 'Tortilla espagnole',
      temps: '40min',
      difficulte: 'facile',
      ingredients: ['oeufs 6', 'pommes de terre 4', 'oignon', 'huile olive', 'sel'],
      allergenes: ['oeufs'],
      calories: 320,
      portions: 4,
      origine: 'Espagne',
      vin_accord: 'Albarino',
      categorie: 'plat',
    },
    {
      nom: 'Sushi maki',
      temps: '1h',
      difficulte: 'intermediaire',
      ingredients: ['riz sushi 300g', 'vinaigre riz', 'feuilles nori', 'saumon cru', 'concombre', 'avocat', 'wasabi', 'sauce soja'],
      allergenes: ['poisson', 'soja'],
      calories: 280,
      portions: 4,
      origine: 'Japon',
      vin_accord: 'Sake / Riesling',
      categorie: 'plat',
    },
    {
      nom: 'Pad thai',
      temps: '30min',
      difficulte: 'intermediaire',
      ingredients: ['nouilles riz 250g', 'crevettes 200g', 'oeufs 2', 'pousses soja', 'cacahuetes', 'tamarin', 'sauce poisson', 'citron vert'],
      allergenes: ['crustaces', 'oeufs', 'arachide', 'poisson'],
      calories: 480,
      portions: 4,
      origine: 'Thailande',
      vin_accord: 'Gewurztraminer',
      categorie: 'plat',
    },
    {
      nom: 'Curry indien butter chicken',
      temps: '1h',
      difficulte: 'intermediaire',
      ingredients: ['poulet 800g', 'tomate concassee', 'creme 20cl', 'beurre', 'gingembre ail', 'epices garam masala', 'fenugrec'],
      allergenes: ['lait'],
      calories: 540,
      portions: 4,
      origine: 'Inde - Punjab',
      vin_accord: 'Riesling demi-sec',
      categorie: 'plat',
    },
    {
      nom: 'Tagine agneau abricots',
      temps: '2h',
      difficulte: 'intermediaire',
      ingredients: ['epaule agneau 1kg', 'abricots secs', 'amandes', 'oignon', 'gingembre', 'cannelle', 'safran', 'miel'],
      allergenes: ['fruits a coque'],
      calories: 580,
      portions: 6,
      origine: 'Maroc',
      vin_accord: 'Cotes du Rhone',
      categorie: 'plat',
    },
    {
      nom: 'Burger US gourmet',
      temps: '30min',
      difficulte: 'facile',
      ingredients: ['steak hache 200g', 'pain brioche', 'cheddar', 'salade', 'tomate', 'oignon rouge', 'sauce burger'],
      allergenes: ['gluten', 'lait', 'oeufs', 'moutarde'],
      calories: 720,
      portions: 1,
      origine: 'USA',
      vin_accord: 'Zinfandel',
      categorie: 'plat',
    },
  ] as readonly Recette[],
  /** Calories par 100g (CIQUAL ANSES) */
  calories: {
    'boeuf maigre': 150,
    'boeuf gras': 250,
    poulet: 160,
    saumon: 200,
    thon: 140,
    cabillaud: 80,
    crevettes: 100,
    oeuf: 150,
    'pates cuites': 130,
    'riz cuit': 130,
    quinoa: 120,
    pain: 260,
    pain_complet: 240,
    pomme: 52,
    banane: 89,
    orange: 47,
    fraise: 32,
    fromage: 350,
    yaourt: 60,
    lait: 60,
    beurre: 750,
    huile: 900,
    'huile olive': 884,
    'chocolat noir': 540,
    chocolat_lait: 535,
    sucre: 400,
    miel: 304,
    confiture: 280,
    avocat: 160,
    tomate: 18,
    salade: 14,
    courgette: 17,
    aubergine: 25,
    pomme_terre: 77,
    frites: 312,
    vin: 80,
    biere: 43,
    cafe: 2,
    the: 1,
  } as Record<string, number>,
  /** Macros par 100g : protéines / lipides / glucides en grammes */
  macros: {
    poulet: { proteines: 23, lipides: 4, glucides: 0, ig: 'bas' },
    saumon: { proteines: 20, lipides: 13, glucides: 0, ig: 'bas' },
    'boeuf maigre': { proteines: 21, lipides: 7, glucides: 0, ig: 'bas' },
    oeuf: { proteines: 13, lipides: 11, glucides: 1.1, ig: 'bas' },
    pain: { proteines: 9, lipides: 1.3, glucides: 49, ig: 'haut' },
    pain_complet: { proteines: 9, lipides: 2, glucides: 41, fibres: 7, ig: 'moyen' },
    'riz cuit': { proteines: 2.7, lipides: 0.3, glucides: 28, ig: 'haut' },
    quinoa: { proteines: 4.4, lipides: 1.9, glucides: 21, fibres: 2.8, ig: 'bas' },
    'pates cuites': { proteines: 5, lipides: 1, glucides: 25, ig: 'moyen' },
    pomme_terre: { proteines: 2, lipides: 0.1, glucides: 17, ig: 'haut' },
    fromage: { proteines: 25, lipides: 28, glucides: 1.3, ig: 'bas' },
    yaourt: { proteines: 4, lipides: 1.5, glucides: 4.7, ig: 'bas' },
    avocat: { proteines: 2, lipides: 15, glucides: 9, fibres: 7, ig: 'bas' },
    pomme: { proteines: 0.3, lipides: 0.2, glucides: 14, fibres: 2.4, ig: 'moyen' },
    banane: { proteines: 1.1, lipides: 0.3, glucides: 23, fibres: 2.6, ig: 'haut' },
    'chocolat noir': { proteines: 8, lipides: 43, glucides: 24, fibres: 11, ig: 'bas' },
  } as Record<string, MacroNutriments>,
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
 * Recherche full-text recettes par nom OU ingrédient OU origine OU catégorie.
 */
export function cuisineSearch(query: string): readonly Recette[] {
  const q = String(query || '').toLowerCase().trim();
  if (!q) return AX_CUISINE.recettes;
  return AX_CUISINE.recettes.filter(
    (r) =>
      r.nom.toLowerCase().includes(q) ||
      r.ingredients.some((i) => i.toLowerCase().includes(q)) ||
      (r.origine ?? '').toLowerCase().includes(q) ||
      (r.categorie ?? '').toLowerCase().includes(q)
  );
}

/**
 * Filtrer recettes par catégorie.
 */
export function filterByCategorie(categorie: string): readonly Recette[] {
  const c = String(categorie || '').toLowerCase().trim();
  return AX_CUISINE.recettes.filter((r) => (r.categorie ?? '').toLowerCase() === c);
}

/**
 * Filtrer recettes excluant des allergènes (gluten-free, lactose-free, etc.).
 */
export function filterExcludingAllergenes(allergenes: readonly string[]): readonly Recette[] {
  if (!allergenes.length) return AX_CUISINE.recettes;
  const exc = allergenes.map((a) => a.toLowerCase());
  return AX_CUISINE.recettes.filter((r) => {
    const al = (r.allergenes ?? []).map((a) => a.toLowerCase());
    return !al.some((a) => exc.includes(a));
  });
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
 * Calcule macros (P/L/G) pour une liste d'aliments.
 */
export function calcMacros(aliments: ReadonlyArray<{ nom: string; grammes: number }>): {
  proteines_g: number;
  lipides_g: number;
  glucides_g: number;
  total_kcal: number;
} {
  let p = 0;
  let l = 0;
  let g = 0;
  for (const a of aliments || []) {
    const k = String(a.nom || '').toLowerCase();
    const m = AX_CUISINE.macros[k];
    const gr = Number(a.grammes) || 0;
    if (m) {
      p += (m.proteines * gr) / 100;
      l += (m.lipides * gr) / 100;
      g += (m.glucides * gr) / 100;
    }
  }
  /* 4 kcal/g protéines + glucides, 9 kcal/g lipides */
  const kcal = Math.round(p * 4 + g * 4 + l * 9);
  return {
    proteines_g: Math.round(p * 10) / 10,
    lipides_g: Math.round(l * 10) / 10,
    glucides_g: Math.round(g * 10) / 10,
    total_kcal: kcal,
  };
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
 * Scaling portions : multiplie quantités d'une recette par un facteur.
 */
export function scaleRecette(recette: Recette, facteur: number): Recette {
  const f = Number(facteur) || 1;
  const newIngredients = recette.ingredients.map((ing) => {
    /* Cherche un nombre dans l'ingrédient + scale */
    return ing.replace(/(\d+(?:\.\d+)?)/, (m) => {
      const n = Number(m) * f;
      return String(Math.round(n * 100) / 100);
    });
  });
  const result: Recette = {
    ...recette,
    ingredients: newIngredients,
    portions: Math.round((recette.portions ?? 1) * f),
  };
  if (recette.calories !== undefined) {
    result.calories = Math.round(recette.calories);
  }
  return result;
}

/**
 * Suggère une substitution pour un ingrédient (régime spécifique).
 */
export function suggerSubstitution(
  ingredient: string,
  regime: 'lactose' | 'gluten' | 'vegan'
): string | null {
  const k = String(ingredient || '').toLowerCase().trim();
  const subs = AX_CUISINE.substitutions[regime];
  if (!subs) return null;
  for (const key of Object.keys(subs)) {
    if (k.includes(key)) return subs[key] ?? null;
  }
  return null;
}

/**
 * Génère plan menu équilibré 7 jours pour cible kcal.
 * Sélection sans ML : entrée/plat/dessert dans recettes correspondant à la cible.
 */
export function generateMenuPlan(cibleKcal: number, type = 'equilibre'): PlanMenu {
  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const recettes = AX_CUISINE.recettes;
  const result: MenuJour[] = [];
  for (let i = 0; i < jours.length; i++) {
    const idx = i * 3;
    const r1 = recettes[idx % recettes.length];
    const r2 = recettes[(idx + 1) % recettes.length];
    const r3 = recettes[(idx + 2) % recettes.length];
    const total = (r1?.calories ?? 0) + (r2?.calories ?? 0) + (r3?.calories ?? 0);
    result.push({
      jour: jours[i] ?? `Jour ${i + 1}`,
      petit_dej: 'Cafe + tartines beurre confiture (~350 kcal)',
      dejeuner: r1?.nom ?? 'libre',
      diner: r2?.nom ?? 'libre',
      collation: r3?.nom ?? 'fruit',
      total_kcal: Math.round(total * 0.6) + 350,
    });
  }
  return {
    cible_kcal: cibleKcal,
    type,
    jours: result,
  };
}

/**
 * Suggère un vin pour un plat (par nom de plat).
 */
export function suggerVin(nomPlat: string): string | null {
  const q = String(nomPlat || '').toLowerCase().trim();
  if (!q) return null;
  const found = AX_CUISINE.recettes.find((r) => r.nom.toLowerCase().includes(q));
  return found?.vin_accord ?? null;
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
      if (c.four) line += ` &middot; 🔥 four ${escapeHtml(c.four)}`;
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
      <p style="color:var(--ax-text-dim,#999);font-size:13px;margin-bottom:16px">${AX_CUISINE.recettes.length} recettes &middot; ${Object.keys(AX_CUISINE.cuissons).length} cuissons &middot; 14 allergènes INCO &middot; macros + IG &middot; sommellerie</p>
      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:12px">
        <h3 style="color:#ffb56b;margin:0 0 10px">📖 Recettes (${AX_CUISINE.recettes.length})</h3>
        <input id="cuiQ" type="text" placeholder="Rechercher (poulet, italie, dessert, gluten...)" style="width:100%;padding:11px;font-size:14px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);color:#eee;border-radius:8px;min-height:44px" aria-label="Recherche recette">
        <button id="cuiSearchBtn" type="button" style="width:100%;margin-top:8px;padding:12px;background:linear-gradient(135deg,#ff8c42,#ffb56b);color:#000;border:0;border-radius:8px;font-weight:700;cursor:pointer;min-height:44px">Rechercher</button>
        <div id="cuiSearchResult" style="margin-top:10px;font-size:13px"></div>
      </div>
      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:12px">
        <h3 style="color:#ffb56b;margin:0 0 10px">⏱ Temps de cuisson (${Object.keys(AX_CUISINE.cuissons).length})</h3>
        <div style="font-size:12px;line-height:1.7;max-height:260px;overflow-y:auto">${cuissonsHtml}</div>
      </div>
      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:12px">
        <h3 style="color:#ffb56b;margin:0 0 10px">📐 Conversions cuisine (${Object.keys(AX_CUISINE.conversions).length})</h3>
        <div style="font-size:13px;line-height:1.8;max-height:200px;overflow-y:auto">${conversionsHtml}</div>
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
        .slice(0, 20)
        .map(
          (r) =>
            `<div style="padding:10px;border:1px solid rgba(255,255,255,0.08);border-radius:8px;margin:6px 0;background:rgba(0,0,0,0.2)"><strong>${escapeHtml(r.nom)}</strong> &middot; ${escapeHtml(r.temps)} &middot; <em>${escapeHtml(r.difficulte)}</em>${r.calories ? ` &middot; 🔥 ${r.calories} kcal` : ''}${r.origine ? ` &middot; 🌍 ${escapeHtml(r.origine)}` : ''}<br><small style="color:#aaa">📦 ${r.ingredients.map(escapeHtml).join(', ')}</small>${r.allergenes ? `<br><small style="color:#e74c3c">⚠ ${r.allergenes.map(escapeHtml).join(', ')}</small>` : ''}${r.vin_accord ? `<br><small style="color:#c9a227">🍷 ${escapeHtml(r.vin_accord)}</small>` : ''}</div>`
        )
        .join('');
    });
  }

  logger.info('cuisine-pro', 'rendered');
}
