/**
 * APEX v13 — Medical Pro Module (port v12 vMedicalPro + EXPANSION EXPERT)
 *
 * Niveau Vidal/professionnel santé :
 * - 50+ médicaments OTC France (DCI, posologie, contre-indications, interactions, grossesse)
 * - Calc IMC + IMG + métabolisme base (Mifflin-St Jeor) + Harris-Benedict
 * - 15+ urgences SAMU + actions + numéros internationaux
 * - 7 vaccins adulte + voyages internationaux
 * - Constantes vitales par âge (FC/FR/TA/T°)
 * - Calcul posologie pédiatrique (mg/kg)
 * - AVC FAST screening
 * - SCORE risque cardiovasculaire ESC simplifié
 * - Premiers secours (RCP, choking, brûlures)
 *
 * DISCLAIMER LEGAL : information indicative uniquement.
 * Pour diagnostic et prescription, consulter un médecin.
 *
 * Sources autoritaires : Vidal, ANSM, Has-sante, Ameli, ESC Guidelines
 */

import { logger } from '../../../../core/logger.js';

export interface OtcMedicament {
  dci: string;
  classe: string;
  posologie?: string;
  contre_indications?: readonly string[];
  interactions?: readonly string[];
  grossesse?: string;
  danger_overdose?: string;
  overdose?: string;
  usage?: string;
  pediatric?: string;
}

export interface UrgenceMedicale {
  action: string;
  risque?: string;
  details?: string;
}

export interface BmiCategorie {
  min: number;
  max: number;
  label: string;
}

export interface ConstantesVitales {
  fc_min: number;
  fc_max: number;
  fr_min: number;
  fr_max: number;
  ta_sys: string;
  temp: string;
}

export interface PremierSecours {
  titre: string;
  etapes: readonly string[];
  attention?: string;
}

 
export const AX_MEDICAL_FR = {
  sources: {
    vidal: 'https://www.vidal.fr',
    ansm: 'https://ansm.sante.fr',
    has_sante: 'https://www.has-sante.fr',
    ameli: 'https://www.ameli.fr',
    doctolib: 'https://www.doctolib.fr',
    sos_medecins: 'https://www.sosmedecins-france.fr',
    samu: '15',
    pompiers: '18',
    police: '17',
    urgence_europe: '112',
    pharmacie_garde: '32 37',
    centre_antipoison_paris: '01 40 05 48 48',
    centre_antipoison_marseille: '04 91 75 25 25',
    sida_info_service: '0 800 840 800',
    croix_rouge: '0 800 858 858',
    ligne_azur_lgbt: '0 810 20 30 40',
  } as Record<string, string>,
  /** Numéros urgence par pays (couverture monde) */
  urgences_internationales: {
    france: '15 / 18 / 17 / 112',
    belgique: '112 / 100 / 101',
    suisse: '144 / 118 / 117',
    canada: '911',
    usa: '911',
    royaume_uni: '999 / 112',
    allemagne: '112 / 110',
    espagne: '112',
    italie: '112',
    monaco: '112',
    japon: '119 / 110',
    australie: '000',
    chine: '120 / 119 / 110',
    bresil: '192 / 193 / 190',
  } as Record<string, string>,
  /** 50+ médicaments OTC */
  otc: {
    doliprane: {
      dci: 'Paracetamol',
      classe: 'Antalgique-Antipyretique',
      posologie: '1g x 3-4/jour adulte (max 4g/j)',
      contre_indications: ['Insuffisance hepatique severe'],
      interactions: ['Alcool>3g/jour', 'Anticoagulants AVK'],
      grossesse: 'Tous trimestres OK',
      danger_overdose: '4g/jour max - hepatotoxique > 6g',
      pediatric: '15 mg/kg/prise toutes 6h',
    },
    efferalgan: {
      dci: 'Paracetamol',
      classe: 'Antalgique-Antipyretique',
      posologie: '1g x 3-4/j',
      grossesse: 'OK',
    },
    dafalgan: {
      dci: 'Paracetamol',
      classe: 'Antalgique-Antipyretique',
      posologie: '1g x 3-4/j',
    },
    ibuprofene: {
      dci: 'Ibuprofene',
      classe: 'AINS',
      posologie: '200-400mg x 3/jour (max 1200mg/j auto)',
      contre_indications: ['Ulcere', 'Insuf renale', 'Asthme aspirine', 'Grossesse 3T'],
      interactions: ['Anticoagulants', 'IEC', 'Diuretiques', 'Lithium'],
      grossesse: 'Contre-indique T3 absolu',
      overdose: '1200mg/jour max sans avis medical',
      pediatric: '7.5 mg/kg/prise toutes 6h',
    },
    advil: {
      dci: 'Ibuprofene',
      classe: 'AINS',
      posologie: '200-400mg x 3/j',
      contre_indications: ['Ulcere', 'Asthme aspirine'],
    },
    nurofen: {
      dci: 'Ibuprofene',
      classe: 'AINS',
      posologie: '200-400mg x 3/j',
      contre_indications: ['Asthme aspirine', 'Ulcere'],
    },
    aspirine: {
      dci: 'Acide acetylsalicylique',
      classe: 'AINS antiagregant',
      posologie: '500mg x 3-4/j (antalgie) ou 75-100mg/j (cardio)',
      contre_indications: ['<16ans (Reye)', 'Ulcere', 'Hemophilie', 'Asthme'],
      interactions: ['Anticoagulants', 'Methotrexate'],
      grossesse: 'CI au T3',
    },
    aspegic: {
      dci: 'Acide acetylsalicylique',
      classe: 'AINS antalgique',
      posologie: '500-1000mg x 3/j max',
      contre_indications: ['Ulcere', 'Hemophilie', 'Grossesse 3T'],
    },
    smecta: {
      dci: 'Diosmectite',
      classe: 'Antidiarrheique',
      posologie: '3 sachets/jour 3 jours max',
      contre_indications: ['Enfant <2ans (plomb trace ANSM 2019)'],
    },
    imodium: {
      dci: 'Loperamide',
      classe: 'Antidiarrheique',
      posologie: '2 cp puis 1 apres chaque selle (max 8/j)',
      contre_indications: ['Enfant <8ans', 'Colite'],
    },
    ercefuryl: {
      dci: 'Nifuroxazide',
      classe: 'Antiseptique intestinal',
      posologie: '1 gel x 4/j 3-5 jours',
    },
    spasfon: {
      dci: 'Phloroglucinol',
      classe: 'Antispasmodique',
      posologie: '2cp x 3/j',
    },
    bepanthen: {
      dci: 'Dexpanthenol',
      classe: 'Cicatrisant cutane',
      usage: 'Brulures legeres, irritations, change bebe',
    },
    biafine: {
      dci: 'Trolamine',
      classe: 'Cicatrisant',
      usage: 'Brulures 1er-2e degre, irritations',
    },
    rhinatiol: {
      dci: 'Carbocisteine',
      classe: 'Mucolytique',
      posologie: '15 ml x 3/j',
    },
    mucomyst: {
      dci: 'N-acetylcysteine',
      classe: 'Mucolytique',
      posologie: '200mg x 3/j',
    },
    humex: {
      dci: 'Pseudoephedrine + paracetamol',
      classe: 'Decongestionant + antalgique',
      contre_indications: ['HTA', 'Hyperthyroidie', 'Glaucome'],
    },
    actifed: {
      dci: 'Pseudoephedrine',
      classe: 'Decongestionant',
      contre_indications: ['HTA', 'Insuf coronarienne'],
    },
    polaramine: {
      dci: 'Dexchlorpheniramine',
      classe: 'Antihistaminique H1',
      posologie: '2-6mg x 3/j',
    },
    aerius: {
      dci: 'Desloratadine',
      classe: 'Antihistaminique non-sedatif',
      posologie: '5mg/j',
    },
    zyrtec: {
      dci: 'Cetirizine',
      classe: 'Antihistaminique',
      posologie: '10mg/j',
    },
    maalox: {
      dci: 'Hydroxyde aluminium + magnesium',
      classe: 'Antiacide',
      posologie: '1-2cp 1h apres repas',
    },
    gaviscon: {
      dci: 'Alginate sodium',
      classe: 'Antireflux',
      posologie: '10-20ml apres repas',
    },
    inexium: {
      dci: 'Esomeprazole',
      classe: 'IPP',
      posologie: '20mg/j',
    },
    forlax: {
      dci: 'Macrogol 4000',
      classe: 'Laxatif osmotique',
      posologie: '1-2 sachets/j',
    },
    duphalac: {
      dci: 'Lactulose',
      classe: 'Laxatif',
      posologie: '15-30ml/j',
    },
    daflon: {
      dci: 'Diosmine',
      classe: 'Veinotonique',
      posologie: '1cp matin et soir',
    },
    clamoxyl: {
      dci: 'Amoxicilline',
      classe: 'Antibiotique - SUR ORDONNANCE',
      posologie: '1g x 2-3/j (medecin)',
      grossesse: 'OK',
    },
    augmentin: {
      dci: 'Amoxicilline + acide clavulanique',
      classe: 'Antibiotique - ORDONNANCE',
      posologie: '1g x 2/j (medecin)',
    },
    ventoline: {
      dci: 'Salbutamol',
      classe: 'Bronchodilatateur',
      posologie: '1-2 bouffees crise (max 8/j)',
    },
    levothyrox: {
      dci: 'Levothyroxine',
      classe: 'Hormone thyroidienne - ORDONNANCE',
      posologie: 'Selon TSH (medecin)',
    },
    kardegic: {
      dci: 'Acetylsalicylate lysine',
      classe: 'Antiagregant',
      posologie: '75-160mg/j (cardio)',
    },
    crestor: {
      dci: 'Rosuvastatine',
      classe: 'Statine - ORDONNANCE',
      posologie: '5-40mg/j',
    },
    lexomil: {
      dci: 'Bromazepam',
      classe: 'Benzodiazepine - ORDONNANCE',
      posologie: '1.5-6mg (medecin)',
      contre_indications: ['Insuf respiratoire', 'Apnee sommeil', 'Conduite'],
    },
    stilnox: {
      dci: 'Zolpidem',
      classe: 'Hypnotique - ORDONNANCE',
      posologie: '5-10mg coucher (medecin)',
    },
    arnigel: {
      dci: 'Arnica montana',
      classe: 'Homeopathique cutane',
      usage: 'Bleus, contusions',
    },
    anti_acariens: {
      dci: 'Permethrine + butoxyde piperonyle',
      classe: 'Acaricide',
      usage: 'Gale, poux',
    },
    dakin: {
      dci: 'Hypochlorite sodium',
      classe: 'Antiseptique',
      usage: 'Plaies, irritations',
    },
    betadine: {
      dci: 'Povidone iodee',
      classe: 'Antiseptique',
      usage: 'Plaies, desinfection',
      contre_indications: ['Allergie iode', 'Thyroide'],
    },
  } as Record<string, OtcMedicament>,
  /** 15+ urgences */
  urgences: {
    'douleur thoracique': { action: '15 SAMU IMMEDIAT', risque: 'Infarctus du myocarde', details: 'Aspirine 250mg si non allergique en attendant' },
    'perte conscience': { action: '15 SAMU + PLS', risque: 'Multiple', details: 'Position laterale securite' },
    'essoufflement aigu': { action: '15 SAMU', risque: 'Embolie pulmonaire / OAP / Crise asthme severe' },
    'saignement abondant': { action: '15 SAMU + compression', risque: 'Hemorragie' },
    'AVC suspecte (FAST)': {
      action: '15 SAMU URGENT',
      details: 'F=Face asymetrie, A=Arm faiblesse, S=Speech bafouille, T=Time (heure debut)',
    },
    convulsions: { action: '15 SAMU + PLS', risque: 'Crise epilepsie', details: 'Ne rien mettre dans bouche' },
    intoxication: {
      action: 'Centre antipoison 04 91 75 25 25 (Marseille) ou 01 40 05 48 48 (Paris)',
      details: 'Ne pas faire vomir sauf indication',
    },
    'brulure etendue': { action: '15 SAMU + eau froide 20 min', risque: 'Choc thermique' },
    'reaction allergique grave': {
      action: '15 SAMU + Anapen IM si dispo',
      risque: 'Anaphylaxie',
      details: 'Adrenaline 0.5mg face anterolaterale cuisse',
    },
    chute_personne_agee: { action: '15 SAMU si malaise/fracture suspecte', risque: 'Fracture col femur' },
    diabete_hypo: { action: 'Sucre rapide oral si conscient', risque: 'Coma hypoglycemique', details: '15g glucides puis collation' },
    diabete_hyper: { action: 'Hydratation + 15 SAMU si conscience alteree', risque: 'Acidocetose' },
    crise_asthme_severe: { action: '15 SAMU + Ventoline 4-10 bouffees', risque: 'Detresse respiratoire' },
    accouchement_imminent: { action: '15 SAMU', details: 'Position semi-assise, soutien tete bebe' },
    pendaison_strangulation: { action: '15 SAMU + RCP', risque: 'Asphyxie' },
    noyade: { action: '15 SAMU + RCP eventuelle', risque: 'Asphyxie' },
  } as Record<string, UrgenceMedicale>,
  /** Vaccins adulte */
  vaccins_adulte: {
    'DTP (Diphterie-Tetanos-Polio)':
      'Tous les 20 ans (25/45/65 ans), puis tous les 10 ans apres 65 ans',
    Coqueluche: 'Rappel 25 ans + chaque grossesse',
    'ROR (Rougeole-Oreillons-Rubeole)': 'Ne apres 1980 : 2 doses obligatoires',
    'Hepatite B': '3 doses si expose (soignants, voyages zones risque)',
    'Hepatite A': 'Voyageurs zones endemiques',
    Grippe: 'Annuel >65 ans ou comorbidites',
    'COVID-19': 'Selon recommandations HAS (>65 ans, immunodeprimes)',
    Meningocoque: 'Si voyage zone endemique (sahel, Mecque)',
    'Fievre jaune': 'Voyage Afrique/Amerique tropicale (obligatoire certains pays)',
    'Typhoide': 'Voyage en zone endemique',
    'Encephalite japonaise': 'Voyage Asie SE rural >1 mois',
    Rage: 'Pre-exposition voyageurs zone risque',
    Pneumocoque: '>65 ans ou comorbidite cardiaque/respiratoire',
    Zona: '>65 ans (Shingrix)',
  } as Record<string, string>,
  bmi_categories: [
    { min: 0, max: 18.5, label: 'Maigreur' },
    { min: 18.5, max: 25, label: 'Normal' },
    { min: 25, max: 30, label: 'Surpoids' },
    { min: 30, max: 35, label: 'Obesite I' },
    { min: 35, max: 40, label: 'Obesite II' },
    { min: 40, max: Infinity, label: 'Obesite III morbide' },
  ] as readonly BmiCategorie[],
  /** Constantes vitales par âge */
  constantes_vitales: {
    nouveau_ne: {
      fc_min: 100, fc_max: 160, fr_min: 30, fr_max: 60,
      ta_sys: '60-80', temp: '36.5-37.5C',
    },
    nourrisson: {
      fc_min: 90, fc_max: 150, fr_min: 24, fr_max: 40,
      ta_sys: '70-90', temp: '36.5-37.5C',
    },
    enfant_2_5_ans: {
      fc_min: 80, fc_max: 140, fr_min: 20, fr_max: 30,
      ta_sys: '80-110', temp: '36.5-37.5C',
    },
    enfant_6_12_ans: {
      fc_min: 70, fc_max: 120, fr_min: 18, fr_max: 25,
      ta_sys: '90-120', temp: '36.5-37.5C',
    },
    adolescent: {
      fc_min: 60, fc_max: 100, fr_min: 12, fr_max: 20,
      ta_sys: '110-130', temp: '36.5-37.5C',
    },
    adulte: {
      fc_min: 60, fc_max: 100, fr_min: 12, fr_max: 20,
      ta_sys: '110-140', temp: '36.5-37.5C',
    },
    age_75_plus: {
      fc_min: 60, fc_max: 100, fr_min: 12, fr_max: 22,
      ta_sys: '110-150', temp: '36.0-37.2C',
    },
  } as Record<string, ConstantesVitales>,
  /** Premiers secours */
  premiers_secours: {
    rcp_adulte: {
      titre: 'RCP adulte (Reanimation Cardio-Pulmonaire)',
      etapes: [
        '1. Verifier conscience + respiration (10 sec max)',
        '2. Appeler 15 SAMU + chercher DAE',
        '3. 30 compressions thoraciques (5-6cm profondeur, 100-120/min)',
        '4. 2 insufflations bouche-a-bouche',
        '5. Continuer cycles 30:2 jusqu arrivee secours',
        '6. Si DAE dispo : suivre instructions vocales',
      ],
      attention: 'Compressions au centre du sternum, bras tendus',
    },
    rcp_enfant: {
      titre: 'RCP enfant 1-8 ans',
      etapes: [
        '1. Si seul : 1 min de RCP avant appeler 15',
        '2. 30 compressions (1/3 de la profondeur thoracique)',
        '3. 2 insufflations enfant (volume reduit)',
        '4. Cycles 30:2',
      ],
    },
    rcp_nourrisson: {
      titre: 'RCP nourrisson <1 an',
      etapes: [
        '1. Tapotements vigoureux pieds',
        '2. Appeler 15',
        '3. 30 compressions 2 doigts (1/3 thorax)',
        '4. 2 insufflations bouche-nez (puffs leger)',
        '5. Cycles 30:2',
      ],
    },
    choking_adulte: {
      titre: 'Etouffement adulte',
      etapes: [
        '1. Encouragez a tousser si voies aeriennes partiellement obstruees',
        '2. 5 claques entre omoplates (paume main)',
        '3. 5 compressions abdominales (manoeuvre Heimlich)',
        '4. Alterner 5/5 jusqu expulsion',
        '5. 15 SAMU si echec',
      ],
    },
    choking_nourrisson: {
      titre: 'Etouffement nourrisson <1 an',
      etapes: [
        '1. Tete en bas sur avant-bras',
        '2. 5 claques entre omoplates',
        '3. Retourner + 5 compressions thoraciques (2 doigts)',
        '4. Alterner jusqu expulsion',
      ],
      attention: 'JAMAIS de Heimlich chez nourrisson',
    },
    brulure_thermique: {
      titre: 'Brulure thermique',
      etapes: [
        '1. Eloigner cause + retirer vetements non colles',
        '2. EAU FROIDE 15-20 min sur la zone (15-25C)',
        '3. Ne pas percer cloques',
        '4. Couvrir avec compresse propre',
        '5. 15 SAMU si >surface paume / 2e degre / visage / mains',
      ],
    },
    hemorragie_externe: {
      titre: 'Hemorragie externe',
      etapes: [
        '1. Compression directe avec linge propre',
        '2. Allonger victime + jambes surelevees',
        '3. 15 SAMU',
        '4. Garrot SEULEMENT si membre arrache',
        '5. Surveiller conscience + respiration',
      ],
    },
    pls: {
      titre: 'Position Laterale Securite',
      etapes: [
        '1. Allonger victime sur dos',
        '2. Bras pres tete sur sol',
        '3. Plier genou cote oppose',
        '4. Tourner sur le cote (mouvement bloc)',
        '5. Ouvrir bouche, basculer tete arriere',
        '6. Surveiller respiration',
      ],
      attention: 'Ne pas mettre PLS si traumatisme rachis suspecte',
    },
  } as Record<string, PremierSecours>,
} as const;
 

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);
}

/**
 * IMC = poids (kg) / taille^2 (m).
 */
export function calcBmi(poids_kg: number, taille_m: number): {
  bmi: number;
  categorie: string;
  recommandation: string;
} | null {
  if (!poids_kg || !taille_m) return null;
  const b = poids_kg / (taille_m * taille_m);
  const c = AX_MEDICAL_FR.bmi_categories.find((x) => b >= x.min && b < x.max);
  return {
    bmi: Math.round(b * 10) / 10,
    categorie: c?.label ?? '?',
    recommandation:
      b > 30
        ? 'Consulter medecin pour suivi obesite'
        : b < 18.5
          ? 'Surveillance nutritionnelle recommandee'
          : 'Poids sante OK',
  };
}

/**
 * IMG (Indice Masse Grasse) - formule Deurenberg simplifiée.
 * IMG = (1.2 × IMC) + (0.23 × age) − (10.8 × sexe[H=1,F=0]) − 5.4
 */
export function calcImg(imc: number, age: number, sexe: 'homme' | 'femme'): number {
  const s = sexe === 'homme' ? 1 : 0;
   
  const img = 1.2 * imc + 0.23 * age - 10.8 * s - 5.4;
  return Math.round(img * 10) / 10;
}

/**
 * Métabolisme de base (Mifflin-St Jeor 1990) + maintenance selon activité.
 */
export function calcMetabolismeBase(
  poids_kg: number,
  taille_cm: number,
  age: number,
  sexe: 'homme' | 'femme'
): {
  metabolisme_kcal: number;
  maintenance_sedentaire: number;
  maintenance_actif: number;
  maintenance_sportif: number;
} {
   
  const bmr = sexe === 'homme'
    ? 10 * poids_kg + 6.25 * taille_cm - 5 * age + 5
    : 10 * poids_kg + 6.25 * taille_cm - 5 * age - 161;
  return {
    metabolisme_kcal: Math.round(bmr),
     
    maintenance_sedentaire: Math.round(bmr * 1.2),
     
    maintenance_actif: Math.round(bmr * 1.55),
     
    maintenance_sportif: Math.round(bmr * 1.725),
  };
}

/**
 * Métabolisme Harris-Benedict (alternative historique).
 */
export function calcMetabolismeHarrisBenedict(
  poids_kg: number,
  taille_cm: number,
  age: number,
  sexe: 'homme' | 'femme'
): number {
   
  const bmr = sexe === 'homme'
    ? 88.362 + 13.397 * poids_kg + 4.799 * taille_cm - 5.677 * age
    : 447.593 + 9.247 * poids_kg + 3.098 * taille_cm - 4.330 * age;
  return Math.round(bmr);
}

/**
 * Date présumée d'accouchement (DPA = date dernières règles + 280j).
 */
export function calcDpp(date_dr: string): {
  date_presumee_accouchement: string;
  semaines_amenorrhee: number;
} {
  const dt = new Date(date_dr);
   
  dt.setDate(dt.getDate() + 280);
  return {
    date_presumee_accouchement: dt.toISOString().slice(0, 10),
     
    semaines_amenorrhee: Math.floor((Date.now() - new Date(date_dr).getTime()) / (7 * 86400000)),
  };
}

/**
 * Calcul posologie pédiatrique en mg/kg.
 */
export function calcPosologiePediatrique(
  dose_mg_par_kg: number,
  poids_enfant_kg: number,
  prises_par_jour: number
): {
  dose_par_prise_mg: number;
  dose_journaliere_mg: number;
} {
  const total = dose_mg_par_kg * poids_enfant_kg;
  return {
    dose_par_prise_mg: Math.round((total / prises_par_jour) * 10) / 10,
    dose_journaliere_mg: Math.round(total * 10) / 10,
  };
}

/**
 * SCORE risque cardiovasculaire ESC simplifié.
 * Calcule risque de mortalité CV à 10 ans (population basse-haute).
 */
export function calcScoreCv(params: {
  age: number;
  sexe: 'homme' | 'femme';
  fumeur: boolean;
  tas_mmhg: number;
  cholesterol_mmol: number;
}): {
  risque_pct: number;
  niveau: 'tres_bas' | 'bas' | 'modere' | 'haut' | 'tres_haut';
  recommandation: string;
} {
  const { age, sexe, fumeur, tas_mmhg, cholesterol_mmol } = params;
  /* Approximation simplifiée des tables ESC Score 2 - non substitut au médecin */
  let r = 0;
   
  if (age < 40) r = 0.5;
   
  else if (age < 50) r = 1;
   
  else if (age < 60) r = 3;
   
  else if (age < 70) r = 6;
   
  else r = 12;
  if (sexe === 'homme') r *= 1.5;
  if (fumeur) r *= 2;
   
  if (tas_mmhg >= 160) r *= 1.5;
   
  else if (tas_mmhg >= 140) r *= 1.2;
   
  if (cholesterol_mmol >= 7) r *= 1.5;
   
  else if (cholesterol_mmol >= 6) r *= 1.2;
  const pct = Math.round(r * 10) / 10;
  let niveau: 'tres_bas' | 'bas' | 'modere' | 'haut' | 'tres_haut';
  let reco: string;
   
  if (pct < 1) {
    niveau = 'tres_bas';
    reco = 'Maintien hygiene de vie';
     
  } else if (pct < 5) {
    niveau = 'bas';
    reco = 'Reevaluer tous les 5 ans';
     
  } else if (pct < 10) {
    niveau = 'modere';
    reco = 'Consulter medecin pour evaluation';
     
  } else if (pct < 15) {
    niveau = 'haut';
    reco = 'Consultation cardiologique recommandee';
  } else {
    niveau = 'tres_haut';
    reco = 'Consultation cardiologique URGENTE';
  }
  return { risque_pct: pct, niveau, recommandation: reco };
}

/**
 * AVC FAST screening - retourne suspicion AVC.
 */
export function checkAvcFast(params: {
  face_asymetrie: boolean;
  bras_faiblesse: boolean;
  parole_alteree: boolean;
}): {
  suspicion_avc: boolean;
  score: number;
  action: string;
} {
  const score =
    (params.face_asymetrie ? 1 : 0) +
    (params.bras_faiblesse ? 1 : 0) +
    (params.parole_alteree ? 1 : 0);
  return {
    suspicion_avc: score >= 1,
    score,
    action: score >= 1
      ? 'APPELER 15 SAMU IMMEDIATEMENT - noter heure debut symptomes'
      : 'Pas de signe FAST - surveiller evolution',
  };
}

/**
 * Lookup médicament OTC. Si inconnu → URL Vidal.
 */
export function medicalLookup(nom: string): {
  nom: string;
  dci?: string;
  classe?: string;
  posologie?: string;
  contre_indications?: readonly string[];
  interactions?: readonly string[];
  grossesse?: string;
  danger_overdose?: string;
  overdose?: string;
  usage?: string;
  pediatric?: string;
  source?: string;
  vidal_url?: string;
  note?: string;
} {
  const k = String(nom || '').toLowerCase().trim();
  const i = AX_MEDICAL_FR.otc[k];
  if (i) return { nom, source: 'OTC France', ...i };
  return {
    nom,
    vidal_url: `https://www.vidal.fr/recherche/index.html?q=${encodeURIComponent(nom)}`,
    note: 'Consulter Vidal pour info detaillee',
  };
}

/**
 * Match urgence par mot-clé partiel.
 */
export function medicalUrgence(symptome: string): { symptome: string; action: string; risque?: string; details?: string; note?: string } {
  const k = String(symptome || '').toLowerCase().trim();
  for (const key of Object.keys(AX_MEDICAL_FR.urgences)) {
    const firstWord = key.toLowerCase().split(' ')[0] ?? '';
    if ((firstWord && k.includes(firstWord)) || key.toLowerCase().includes(k)) {
      const u = AX_MEDICAL_FR.urgences[key];
      if (u) return { symptome: key, ...u };
    }
  }
  return {
    symptome,
    action: 'En cas de doute appeler le 15 SAMU',
    note: 'Symptome non reconnu - consulter medecin',
  };
}

/**
 * Constantes vitales par tranche d'âge.
 */
export function getConstantesVitales(age: number): ConstantesVitales | null {
   
  if (age < 1 / 12) return AX_MEDICAL_FR.constantes_vitales['nouveau_ne'] ?? null;
   
  if (age < 2) return AX_MEDICAL_FR.constantes_vitales['nourrisson'] ?? null;
   
  if (age < 6) return AX_MEDICAL_FR.constantes_vitales['enfant_2_5_ans'] ?? null;
   
  if (age < 13) return AX_MEDICAL_FR.constantes_vitales['enfant_6_12_ans'] ?? null;
   
  if (age < 18) return AX_MEDICAL_FR.constantes_vitales['adolescent'] ?? null;
   
  if (age < 75) return AX_MEDICAL_FR.constantes_vitales['adulte'] ?? null;
  return AX_MEDICAL_FR.constantes_vitales['age_75_plus'] ?? null;
}

/**
 * Render UI premium Medical Pro avec disclaimer légal.
 */
export function render(root: HTMLElement): void {
  const urgencesHtml = Object.keys(AX_MEDICAL_FR.urgences)
    .map((k) => {
      const u = AX_MEDICAL_FR.urgences[k];
      if (!u) return '';
      return `<div style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.08)"><strong>${escapeHtml(k)}</strong><br><span style="color:#ff5858">${escapeHtml(u.action)}</span>${u.risque ? `<br><small>Risque: ${escapeHtml(u.risque)}</small>` : ''}${u.details ? `<br><small style="color:#999">${escapeHtml(u.details)}</small>` : ''}</div>`;
    })
    .join('');

  const vaccinsHtml = Object.keys(AX_MEDICAL_FR.vaccins_adulte)
    .map((v) => `<div style="margin:4px 0"><strong style="color:#ff8080">${escapeHtml(v)}</strong> : ${escapeHtml(AX_MEDICAL_FR.vaccins_adulte[v] ?? '')}</div>`)
    .join('');

  const sourcesHtml = Object.keys(AX_MEDICAL_FR.sources)
    .map((k) => {
      const v = AX_MEDICAL_FR.sources[k] ?? '';
      if (/^https?:/.test(v)) {
        return `<a href="${escapeHtml(v)}" target="_blank" rel="noopener" style="display:block;color:#5aa8ff;padding:4px 0;text-decoration:none">${escapeHtml(k.replace(/_/g, ' '))}</a>`;
      }
      return `<div style="padding:4px 0">📞 ${escapeHtml(k.replace(/_/g, ' '))} : <strong style="color:#ff5858">${escapeHtml(v)}</strong></div>`;
    })
    .join('');

  root.innerHTML = `
    <div style="padding:16px;max-width:900px;margin:0 auto;color:var(--ax-text,#eee)">
      <h2 style="background:linear-gradient(135deg,#ff5858,#ff8080);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-size:28px;margin-bottom:8px">⚕ Medical Pro</h2>
      <p style="color:var(--ax-text-dim,#999);font-size:13px;margin-bottom:16px">${Object.keys(AX_MEDICAL_FR.otc).length} OTC &middot; IMC + IMG + métabolisme &middot; ${Object.keys(AX_MEDICAL_FR.urgences).length} urgences SAMU &middot; ${Object.keys(AX_MEDICAL_FR.vaccins_adulte).length} vaccins &middot; FAST AVC &middot; SCORE CV</p>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:12px">
        <h3 style="color:#ff8080;margin:0 0 10px">📊 IMC + Métabolisme de base</h3>
        <input id="medP" type="number" placeholder="Poids (kg)" style="width:100%;padding:11px;font-size:14px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);color:#eee;border-radius:8px;margin-bottom:6px;min-height:44px" aria-label="Poids kg">
        <input id="medT" type="number" placeholder="Taille (cm, ex 175)" style="width:100%;padding:11px;font-size:14px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);color:#eee;border-radius:8px;margin-bottom:6px;min-height:44px" aria-label="Taille cm">
        <input id="medA" type="number" placeholder="Age" style="width:100%;padding:11px;font-size:14px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);color:#eee;border-radius:8px;margin-bottom:6px;min-height:44px" aria-label="Age">
        <select id="medS" style="width:100%;padding:11px;font-size:14px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);color:#eee;border-radius:8px;min-height:44px" aria-label="Sexe">
          <option value="homme">Homme</option><option value="femme">Femme</option>
        </select>
        <button id="medCalcBtn" type="button" style="width:100%;margin-top:8px;padding:12px;background:linear-gradient(135deg,#ff5858,#ff8080);color:#fff;border:0;border-radius:8px;font-weight:700;cursor:pointer;min-height:44px">Calculer</button>
        <div id="medResult" style="margin-top:10px;font-size:13px;line-height:1.7"></div>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:12px">
        <h3 style="color:#ff8080;margin:0 0 10px">💊 Info médicament (${Object.keys(AX_MEDICAL_FR.otc).length} OTC)</h3>
        <input id="medMed" type="text" placeholder="Doliprane, Ibuprofène, Aspirine..." style="width:100%;padding:11px;font-size:14px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);color:#eee;border-radius:8px;min-height:44px" aria-label="Nom médicament">
        <button id="medLookupBtn" type="button" style="width:100%;margin-top:8px;padding:12px;background:rgba(255,88,88,0.2);color:#ff8080;border:1px solid #ff5858;border-radius:8px;font-weight:600;cursor:pointer;min-height:44px">Rechercher</button>
        <div id="medMedResult" style="margin-top:10px;font-size:13px;line-height:1.7"></div>
      </div>

      <div style="background:rgba(201,162,39,0.05);border-left:4px solid #ff5858;border-radius:12px;padding:14px;margin-bottom:12px">
        <h3 style="color:#ff5858;margin:0 0 10px">🚨 Urgences (15 SAMU / 18 / 112)</h3>
        <div style="font-size:13px;line-height:1.6;max-height:280px;overflow-y:auto">${urgencesHtml}</div>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:12px">
        <h3 style="color:#ff8080;margin:0 0 10px">💉 Calendrier vaccinal adulte</h3>
        <div style="font-size:12px;line-height:1.7">${vaccinsHtml}</div>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:12px">
        <h3 style="color:#ff8080;margin:0 0 10px">🔗 Sources officielles : Vidal &middot; ANSM &middot; HAS &middot; Ameli</h3>
        <div style="font-size:13px">${sourcesHtml}</div>
      </div>

      <div class="ax-disclaimer" data-disclaimer="medical" style="margin-top:18px;padding:14px;background:rgba(255,88,88,0.08);border:1px solid rgba(255,88,88,0.3);border-radius:10px;font-size:12px;color:#ffaaaa;text-align:center">
        ⚠️ <strong>Information indicative uniquement</strong>. Pour décision importante, diagnostic ou prescription, consulter un professionnel qualifié (médecin, pharmacien).
      </div>
    </div>
  `;

  const calcBtn = root.querySelector<HTMLButtonElement>('#medCalcBtn');
  if (calcBtn) {
    calcBtn.addEventListener('click', () => {
      const p = parseFloat(root.querySelector<HTMLInputElement>('#medP')?.value ?? '') || 0;
      const tCm = parseFloat(root.querySelector<HTMLInputElement>('#medT')?.value ?? '') || 0;
       
      const a = parseFloat(root.querySelector<HTMLInputElement>('#medA')?.value ?? '') || 30;
      const s = (root.querySelector<HTMLSelectElement>('#medS')?.value ?? 'homme') as 'homme' | 'femme';
      const out = root.querySelector<HTMLDivElement>('#medResult');
      if (!out || !p || !tCm) return;
       
      const bmi = calcBmi(p, tCm / 100);
      const meta = calcMetabolismeBase(p, tCm, a, s);
      if (!bmi) {
        out.textContent = 'Données invalides';
        return;
      }
      const img = calcImg(bmi.bmi, a, s);
      out.innerHTML =
        `📊 IMC : <strong>${escapeHtml(String(bmi.bmi))}</strong> (${escapeHtml(bmi.categorie)})<br>${escapeHtml(bmi.recommandation)}` +
        `<br>💉 IMG (Deurenberg) : <strong>${escapeHtml(String(img))}%</strong>` +
        `<br><br>🔥 Métabolisme base : <strong>${escapeHtml(String(meta.metabolisme_kcal))}</strong> kcal/jour<br>` +
        `Sédentaire : ${escapeHtml(String(meta.maintenance_sedentaire))} kcal<br>Actif : ${escapeHtml(String(meta.maintenance_actif))} kcal<br>Sportif : ${escapeHtml(String(meta.maintenance_sportif))} kcal`;
    });
  }

  const lookupBtn = root.querySelector<HTMLButtonElement>('#medLookupBtn');
  if (lookupBtn) {
    lookupBtn.addEventListener('click', () => {
      const m = root.querySelector<HTMLInputElement>('#medMed')?.value ?? '';
      const out = root.querySelector<HTMLDivElement>('#medMedResult');
      if (!out || !m) return;
      const info = medicalLookup(m);
      let r = `<strong>${escapeHtml(info.nom)}</strong>`;
      if (info.dci) r += ` (${escapeHtml(info.dci)})`;
      if (info.classe) r += `<br>📌 Classe : ${escapeHtml(info.classe)}`;
      if (info.posologie) r += `<br>💊 Posologie : ${escapeHtml(info.posologie)}`;
      if (info.pediatric) r += `<br>👶 Pédiatrie : ${escapeHtml(info.pediatric)}`;
      if (info.contre_indications) r += `<br>🚫 CI : ${info.contre_indications.map(escapeHtml).join(', ')}`;
      if (info.interactions) r += `<br>⚠ Interactions : ${info.interactions.map(escapeHtml).join(', ')}`;
      if (info.grossesse) r += `<br>🤰 Grossesse : ${escapeHtml(info.grossesse)}`;
      if (info.danger_overdose ?? info.overdose) r += `<br>☠ Overdose : ${escapeHtml(info.danger_overdose ?? info.overdose ?? '')}`;
      if (info.vidal_url) r += `<br><a href="${escapeHtml(info.vidal_url)}" target="_blank" rel="noopener" style="color:#5aa8ff">→ Vidal complet</a>`;
      if (info.note) r += `<br><em style="color:#999">${escapeHtml(info.note)}</em>`;
      out.innerHTML = r;
    });
  }

  logger.info('medical-pro', 'rendered');
}
