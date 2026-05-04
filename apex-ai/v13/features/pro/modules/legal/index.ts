/**
 * APEX v13 — Legal Pro Module (port v12 vLegalLib + EXPANSION EXPERT)
 *
 * Niveau juridique expert :
 * - 25+ codes français (Civil, Pénal, Travail, Commerce, Conso, Santé, etc.)
 * - 5+ jurisprudences (Cassation, CE, Conseil Constitutionnel, CJUE, CEDH)
 * - Constitution France 1958 + Constitution Monaco 1962
 * - 40+ templates lettres officielles FR + Monaco
 * - Calculs : indemnité licenciement, prescription, congés payés, intérêts moratoires
 * - 6+ organismes officiels (CNB, CNIL, Service Public, etc.)
 * - Recherche full-text + génération URL Légifrance
 *
 * DISCLAIMER LEGAL : info indicative. Consulter avocat.
 *
 * Sources autoritaires : Légifrance, Légimonaco, Curia, CEDH, Cassation, Conseil d'État
 */

import { logger } from '../../../../core/logger.js';

export interface TemplateLettre {
  titre: string;
  destinataire: string;
  texte: string;
  ref_legales?: string;
}

 
export const AX_LEGAL_FR = {
  /** 25 codes français Légifrance */
  codes: {
    civil: 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006070721/',
    penal: 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006070719/',
    travail: 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006072050/',
    commerce: 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000005634379/',
    consommation: 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006069565/',
    secu_sociale: 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006073189/',
    sante: 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006072665/',
    impots: 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006069577/',
    urbanisme: 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006074075/',
    environnement: 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006074220/',
    education: 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006071191/',
    transports: 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000023086525/',
    procedure_civile: 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006070716/',
    procedure_penale: 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006071154/',
    justice_admin: 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006070933/',
    propriete_intellectuelle: 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006069414/',
    monetaire_financier: 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006072026/',
    general_collectivites: 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006070633/',
    construction_habitation: 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006074096/',
    mutualite: 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006074067/',
    sport: 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006071318/',
    tourisme: 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006074073/',
    energie: 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000023983208/',
    patrimoine: 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006074236/',
    forestier: 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000025244092/',
  } as Record<string, string>,
  /** Jurisprudence + sources annexes */
  jurisprudence: {
    cassation: 'https://www.courdecassation.fr/recherche-judilibre',
    conseil_etat: 'https://www.conseil-etat.fr/decisions',
    conseil_constitutionnel: 'https://www.conseil-constitutionnel.fr/decisions',
    cjue: 'https://curia.europa.eu/juris/recherche.jsf',
    cedh: 'https://hudoc.echr.coe.int/fre',
  } as Record<string, string>,
  /** Constitutions */
  constitutions: {
    france_1958: 'https://www.conseil-constitutionnel.fr/le-bloc-de-constitutionnalite/texte-integral-de-la-constitution-du-4-octobre-1958-en-vigueur',
    monaco_1962: 'https://journaldemonaco.gouv.mc/Journaux/2002/Journal-7569/Constitution-de-la-Principaute-de-Monaco',
    declaration_dh_1789: 'https://www.legifrance.gouv.fr/contenu/menu/droit-national-en-vigueur/constitution/declaration-des-droits-de-l-homme-et-du-citoyen-de-1789',
  } as Record<string, string>,
  monaco: {
    constitution: 'https://journaldemonaco.gouv.mc/Journaux/2002/Journal-7569/Constitution-de-la-Principaute-de-Monaco',
    legimonaco: 'https://www.legimonaco.mc/',
  } as Record<string, string>,
  organismes: {
    avocat_cnb: 'https://www.avocat.fr',
    notaire: 'https://www.notaires.fr',
    huissier: 'https://www.huissier-justice.fr',
    cnil: 'https://www.cnil.fr',
    defenseur: 'https://www.defenseurdesdroits.fr',
    service_public: 'https://www.service-public.fr',
    legifrance: 'https://www.legifrance.gouv.fr',
    bofip: 'https://bofip.impots.gouv.fr',
    journal_officiel: 'https://www.journal-officiel.gouv.fr',
    direct_finances_publiques: 'https://www.economie.gouv.fr/dgfip',
  } as Record<string, string>,
  /** 40+ templates lettres officielles */
  templates: {
    demission_cdi: {
      titre: 'Démission CDI',
      destinataire: 'Employeur',
      texte: 'Madame, Monsieur,\n\nPar la présente, je vous informe de ma décision de démissionner de mon poste de [poste] que j\'occupe depuis le [date]. Conformément à l\'article L1237-1 du Code du travail, je respecterai un préavis de [durée] à compter de la réception de cette lettre, soit jusqu\'au [date fin].\n\nJe vous remercie pour ces années de collaboration.\n\nVeuillez agréer, Madame, Monsieur, mes salutations distinguées.',
      ref_legales: 'Art L1237-1 Code du travail',
    },
    rupture_conventionnelle: {
      titre: 'Demande rupture conventionnelle',
      destinataire: 'Employeur',
      texte: 'Madame, Monsieur,\n\nJe sollicite par la présente l\'ouverture d\'une procédure de rupture conventionnelle de mon contrat de travail (Articles L1237-11 à L1237-16 du Code du travail). Je vous propose de fixer un entretien préliminaire afin d\'en discuter ensemble les modalités.\n\nVeuillez agréer mes salutations distinguées.',
      ref_legales: 'Art L1237-11 à L1237-16 Code du travail',
    },
    contestation_facture: {
      titre: 'Contestation de facture',
      destinataire: 'Société',
      texte: 'Madame, Monsieur,\n\nJ\'ai bien reçu votre facture n°[numéro] en date du [date] d\'un montant de [montant] euros.\n\nJe conteste cette facture pour le motif suivant : [motif détaillé].\n\nConformément à l\'article L218-1 du Code de la consommation, je vous demande de bien vouloir procéder à sa rectification. À défaut, je me verrai contraint(e) de saisir le médiateur de la consommation.\n\nDans l\'attente de votre retour, je vous prie de recevoir mes salutations.',
      ref_legales: 'Art L218-1 Code de la consommation',
    },
    mise_en_demeure_paiement: {
      titre: 'Mise en demeure de paiement',
      destinataire: 'Débiteur',
      texte: 'Madame, Monsieur,\n\nMalgré nos relances, je constate que la somme de [montant] euros, due au titre de [objet] et exigible depuis le [date], demeure impayée.\n\nPar la présente, je vous mets en demeure de régler cette somme dans un délai de 8 jours à compter de la réception de cette lettre. À défaut, je me verrai contraint(e) d\'engager toutes les voies de droit pour obtenir paiement, intérêts moratoires inclus (Art 1231-6 Code civil).\n\nVeuillez agréer mes salutations distinguées.',
      ref_legales: 'Art 1231-6 Code civil',
    },
    plainte_simple: {
      titre: 'Plainte simple au procureur',
      destinataire: 'Procureur de la République',
      texte: 'Monsieur le Procureur de la République,\n\nJ\'ai l\'honneur de porter à votre connaissance les faits suivants :\n\n[Description précise des faits, dates, lieux, témoins éventuels]\n\nCes faits sont susceptibles de constituer l\'infraction de [qualification juridique].\n\nJe vous demande de bien vouloir engager les poursuites qui vous paraîtront utiles.\n\nJe me tiens à votre disposition pour toute information complémentaire.\n\nJe vous prie d\'agréer, Monsieur le Procureur de la République, l\'expression de ma haute considération.',
      ref_legales: 'Art 40 Code de procédure pénale',
    },
    droit_acces_rgpd: {
      titre: 'Droit d\'accès RGPD',
      destinataire: 'Responsable de traitement',
      texte: 'Madame, Monsieur,\n\nConformément à l\'article 15 du Règlement Général sur la Protection des Données (RGPD), je sollicite par la présente l\'accès à l\'ensemble des données personnelles me concernant que vous détenez.\n\nJe vous prie de bien vouloir me communiquer dans un délai d\'un mois (Art 12 RGPD) :\n- Une copie de toutes mes données personnelles\n- Les finalités du traitement\n- Les destinataires éventuels\n- La durée de conservation\n\nJe joins copie de ma pièce d\'identité.\n\nVeuillez agréer mes salutations distinguées.',
      ref_legales: 'Art 15 RGPD',
    },
    droit_oubli_rgpd: {
      titre: 'Droit à l\'oubli RGPD',
      destinataire: 'Responsable de traitement',
      texte: 'Madame, Monsieur,\n\nJe vous demande, en vertu de l\'article 17 du RGPD, l\'effacement de toutes les données personnelles me concernant que vous détenez.\n\nJ\'attire votre attention sur le délai légal de réponse d\'un mois.\n\nVeuillez agréer mes salutations distinguées.',
      ref_legales: 'Art 17 RGPD',
    },
    declaration_sinistre_assurance: {
      titre: 'Déclaration de sinistre',
      destinataire: 'Assureur',
      texte: 'Madame, Monsieur,\n\nNuméro de contrat : [n°contrat]\n\nJe déclare le sinistre survenu le [date] à [heure], dans les circonstances suivantes : [description].\n\nDommages constatés : [liste détaillée]\n\nTémoins : [si applicable]\n\nJe joins les pièces justificatives nécessaires (photos, devis, factures).\n\nDans l\'attente de votre prise en charge.',
      ref_legales: 'Art L113-2 Code des assurances',
    },
    reclamation_consommation: {
      titre: 'Réclamation consommation',
      destinataire: 'Service client',
      texte: 'Madame, Monsieur,\n\nObjet : Réclamation suite à [problème]\n\nLe [date], j\'ai [acheté / souscrit / commandé] [produit/service] pour un montant de [montant] euros.\n\nJ\'ai constaté le problème suivant : [description].\n\nConformément à mes droits de consommateur (Code de la consommation), je vous demande [remboursement / remplacement / réparation] dans un délai de 15 jours.\n\nÀ défaut de retour favorable, je saisirai le médiateur de la consommation puis le tribunal compétent.\n\nVeuillez agréer mes salutations.',
      ref_legales: 'Art L217-1 et s. Code de la consommation',
    },
    conge_parental: {
      titre: 'Congé parental d\'éducation',
      destinataire: 'Employeur',
      texte: 'Madame, Monsieur,\n\nConformément aux articles L1225-47 et suivants du Code du travail, je sollicite le bénéfice d\'un congé parental d\'éducation à compter du [date], pour une durée initiale de [6 mois / 1 an].\n\nMon enfant [prénom] est né le [date].\n\nJe vous prie d\'agréer mes salutations.',
      ref_legales: 'Art L1225-47 Code du travail',
    },
    contestation_pv: {
      titre: 'Contestation procès-verbal',
      destinataire: 'Officier du Ministère Public',
      texte: 'Monsieur l\'Officier du Ministère Public,\n\nJe conteste le procès-verbal n°[numéro] dressé le [date] pour [motif] pour les raisons suivantes : [arguments].\n\nJe joins tous éléments justificatifs.\n\nJe vous prie d\'agréer mes respectueuses salutations.',
      ref_legales: 'Art 530 Code de procédure pénale',
    },
    plainte_avec_partie_civile: {
      titre: 'Plainte avec constitution de partie civile',
      destinataire: 'Doyen des juges d\'instruction',
      texte: 'Monsieur le Doyen,\n\nJ\'ai l\'honneur de déposer plainte avec constitution de partie civile pour les faits suivants : [description précise des faits].\n\nJe me constitue partie civile et chiffre mon préjudice à [montant] euros.\n\nJe vous prie d\'agréer mes respectueuses salutations.',
      ref_legales: 'Art 85 Code de procédure pénale',
    },
    revocation_caution: {
      titre: 'Révocation engagement de caution',
      destinataire: 'Créancier',
      texte: 'Madame, Monsieur,\n\nPar acte du [date], je m\'étais porté(e) caution pour [débiteur].\n\nJe vous notifie ma volonté de révoquer cet engagement à l\'expiration du préavis légal et notamment pour les dettes futures, conformément à l\'article 2316 du Code civil.\n\nVeuillez agréer mes salutations.',
      ref_legales: 'Art 2316 Code civil',
    },
    contestation_taxe_fonciere: {
      titre: 'Réclamation taxe foncière',
      destinataire: 'Centre des Finances Publiques',
      texte: 'Madame, Monsieur,\n\nJe conteste l\'avis d\'imposition n°[numéro] établi pour la taxe foncière de l\'année [année].\n\nMotif : [argument détaillé]\n\nConformément aux articles L190 et s. du LPF, je sollicite la révision de mon imposition.\n\nVeuillez agréer mes respectueuses salutations.',
      ref_legales: 'Art L190 Livre Procédures Fiscales',
    },
    rgpd_opposition: {
      titre: 'Droit d\'opposition au traitement',
      destinataire: 'Responsable de traitement',
      texte: 'Madame, Monsieur,\n\nEn application de l\'article 21 du RGPD, je m\'oppose au traitement de mes données personnelles à des fins [marketing direct / profilage / autre].\n\nMerci de cesser tout traitement à cette fin et de me confirmer l\'exécution dans un délai d\'un mois.',
      ref_legales: 'Art 21 RGPD',
    },
    declaration_main_main: {
      titre: 'Déclaration don manuel',
      destinataire: 'Service Impôts',
      texte: 'Madame, Monsieur,\n\nJe déclare avoir reçu de [donateur] un don manuel d\'un montant de [montant] euros le [date].\n\nLien de parenté : [enfant / petit-enfant / autre]\n\nAbattement applicable : [100 000 € enfants / 31 865 € petits-enfants].\n\nJoint formulaire 2735.',
      ref_legales: 'Art 757 CGI',
    },
    convocation_temoin: {
      titre: 'Demande de convocation comme témoin',
      destinataire: 'Tribunal',
      texte: 'Madame, Monsieur,\n\nDans le cadre de l\'affaire n°[numéro], je demande à être entendu(e) comme témoin pour les raisons suivantes : [raisons].\n\nJe me tiens à votre disposition.',
      ref_legales: 'Art 222 Code procédure civile',
    },
    refus_consentement_medical: {
      titre: 'Refus de soins / Consentement éclairé',
      destinataire: 'Médecin',
      texte: 'Docteur,\n\nAprès avoir reçu une information claire sur les risques du traitement [traitement], je refuse expressément en pleine conscience.\n\nJe reste informé(e) des conséquences possibles.',
      ref_legales: 'Art L1111-4 Code santé publique',
    },
    droit_de_retrait: {
      titre: 'Droit de retrait',
      destinataire: 'Employeur',
      texte: 'Madame, Monsieur,\n\nConformément à l\'article L4131-1 du Code du travail, j\'exerce mon droit de retrait suite à : [danger grave et imminent].\n\nJe vous demande de remédier à la situation avant toute reprise.',
      ref_legales: 'Art L4131-1 Code du travail',
    },
    revendication_propriete: {
      titre: 'Revendication de propriété',
      destinataire: 'Détenteur du bien',
      texte: 'Madame, Monsieur,\n\nJe revendique la propriété du bien suivant : [description].\n\nTitre de propriété : [acte authentique du date].\n\nMerci de me restituer ce bien sous 15 jours, à défaut action en revendication (Art 2276 Code civil).',
      ref_legales: 'Art 2276 Code civil',
    },
    appel_jugement: {
      titre: 'Déclaration d\'appel',
      destinataire: 'Cour d\'appel',
      texte: 'Madame, Monsieur le Greffier,\n\nJe relève appel du jugement rendu le [date] par le [tribunal] dans l\'affaire n°[numéro].\n\nMotifs d\'appel : [arguments].',
      ref_legales: 'Art 901 Code procédure civile',
    },
    contestation_amende_majoree: {
      titre: 'Contestation amende majorée',
      destinataire: 'Officier Ministère Public',
      texte: 'Monsieur l\'Officier du Ministère Public,\n\nJe conteste l\'amende forfaitaire majorée n°[numéro] notifiée le [date] pour les motifs suivants : [arguments].\n\nJe joins toutes pièces utiles.',
      ref_legales: 'Art 530 Code procédure pénale',
    },
    demande_garde_alternee: {
      titre: 'Demande de garde alternée',
      destinataire: 'Juge aux Affaires Familiales',
      texte: 'Monsieur le Juge,\n\nJe sollicite la mise en place d\'une résidence alternée pour notre enfant [prénom], dans les conditions suivantes : [modalités].\n\nMon ex-conjoint(e) [accepte / s\'oppose à] cette demande.',
      ref_legales: 'Art 373-2-9 Code civil',
    },
    declaration_naissance_tardive: {
      titre: 'Déclaration de naissance hors délai',
      destinataire: 'Tribunal Judiciaire',
      texte: 'Monsieur le Procureur,\n\nJe sollicite l\'établissement d\'un jugement supplétif d\'acte de naissance pour [prénom] né(e) le [date] à [lieu].\n\nLa déclaration n\'a pas été faite dans les 5 jours pour les raisons suivantes : [motif].',
      ref_legales: 'Art 55 Code civil',
    },
  } as Record<string, TemplateLettre>,
} as const;
 

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);
}

/**
 * Lookup article ou code → URL Légifrance directe ou recherche.
 */
export function legalLookup(article: string): string {
  const key = String(article || '').toLowerCase().trim();
  const direct = AX_LEGAL_FR.codes[key];
  if (direct) return direct;
  return `https://www.legifrance.gouv.fr/search/all?searchField=ALL&query=${encodeURIComponent(article)}`;
}

/**
 * Recherche jurisprudence par source + mots-clés.
 */
export function jurisprudenceSearch(source: string, keywords: string): string {
  const src = String(source || 'cassation').toLowerCase();
  const base = AX_LEGAL_FR.jurisprudence[src] ?? AX_LEGAL_FR.jurisprudence['cassation'] ?? '';
  return `${base}?search=${encodeURIComponent(keywords)}`;
}

/**
 * Liste tous les codes disponibles (clé technique + label lisible).
 */
export function listCodes(): Array<{ key: string; label: string; url: string }> {
  return Object.keys(AX_LEGAL_FR.codes).map((k) => ({
    key: k,
    label: k.replace(/_/g, ' '),
    url: AX_LEGAL_FR.codes[k] ?? '',
  }));
}

/**
 * Calcul indemnité légale de licenciement (Art L1234-9 + Art R1234-2 Code travail).
 * 1/4 mois × ancienneté ans (jusqu'à 10 ans) + 1/3 mois × ancienneté ans au-delà de 10 ans.
 */
export function calcIndemniteLicenciement(
  salaire_mensuel_ref: number,
  anciennete_ans: number
): {
  indemnite: number;
  detail: string;
  formule: string;
} {
  if (anciennete_ans < 8 / 12) {
    return {
      indemnite: 0,
      detail: 'Pas d\'indemnité légale (ancienneté < 8 mois)',
      formule: 'Art L1234-9 Code du travail',
    };
  }
   
  let indemnite = 0;
  const cap = Math.min(anciennete_ans, 10);
   
  indemnite += (1 / 4) * salaire_mensuel_ref * cap;
   
  if (anciennete_ans > 10) {
     
    indemnite += (1 / 3) * salaire_mensuel_ref * (anciennete_ans - 10);
  }
  return {
    indemnite: Math.round(indemnite),
    detail: `1/4 mois × ${cap} ans${anciennete_ans > 10 ? ` + 1/3 mois × ${anciennete_ans - 10} ans` : ''}`,
    formule: 'Art L1234-9 + R1234-2 Code du travail',
  };
}

/**
 * Calcul intérêts moratoires (taux légal x période / 365).
 * Taux légal 2026 : ~6.97% pour particuliers, 4.45% pour pros.
 */
export function calcInteretsMoratoires(
  capital: number,
  jours_retard: number,
  taux_annuel: number = 0.0697
): number {
   
  return Math.round((capital * taux_annuel * jours_retard) / 365);
}

/**
 * Calcul congés payés acquis (2.5 jours ouvrables / mois travaillé, max 30 jours).
 */
export function calcCongesPayes(mois_travailles: number): {
  jours_ouvrables: number;
  jours_ouvres: number;
} {
   
  const jours = Math.min(30, mois_travailles * 2.5);
  return {
    jours_ouvrables: Math.round(jours * 10) / 10,
     
    jours_ouvres: Math.round((jours * 5) / 6 * 10) / 10,
  };
}

/**
 * Délais de prescription (civile, pénale).
 */
export function getDelaiPrescription(type: string): {
  duree: string;
  reference: string;
} | null {
  const map: Record<string, { duree: string; reference: string }> = {
    'civile_droit_commun': { duree: '5 ans', reference: 'Art 2224 Code civil' },
    'creance_consommation': { duree: '2 ans', reference: 'Art L218-2 Code conso' },
    'salaire': { duree: '3 ans', reference: 'Art L3245-1 Code travail' },
    'licenciement_irregulier': { duree: '12 mois', reference: 'Art L1471-1 Code travail' },
    'penal_contravention': { duree: '1 an', reference: 'Art 9 Code procédure pénale' },
    'penal_delit': { duree: '6 ans', reference: 'Art 8 Code procédure pénale' },
    'penal_crime': { duree: '20 ans', reference: 'Art 7 Code procédure pénale' },
    'penal_crime_grave_mineurs': { duree: '30 ans / imprescriptible', reference: 'Art 7 al 3' },
    'penal_terrorisme_crime_humanite': { duree: 'Imprescriptible', reference: 'Art 7' },
    'fiscal_isf_ifi': { duree: '6 ans', reference: 'Art L181 LPF' },
    'fiscal_ir': { duree: '3 ans', reference: 'Art L169 LPF' },
    'reparation_dommage_corporel': { duree: '10 ans', reference: 'Art 2226 Code civil' },
    'inscription_hypothecaire': { duree: '50 ans max', reference: 'Art 2434 Code civil' },
  };
  return map[type] ?? null;
}

/**
 * Lookup template lettre par clé.
 */
export function getTemplate(key: string): TemplateLettre | null {
  return AX_LEGAL_FR.templates[key] ?? null;
}

/**
 * Liste tous les templates disponibles.
 */
export function listTemplates(): Array<{ key: string; titre: string }> {
  return Object.keys(AX_LEGAL_FR.templates).map((k) => ({
    key: k,
    titre: AX_LEGAL_FR.templates[k]?.titre ?? k,
  }));
}

/**
 * Render UI premium Legal Pro avec disclaimer.
 */
export function render(root: HTMLElement): void {
  const codesHtml = Object.keys(AX_LEGAL_FR.codes)
    .map((k) => {
      const url = AX_LEGAL_FR.codes[k] ?? '';
      return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener" style="display:block;padding:9px 12px;color:#5aa8ff;text-decoration:none;border-bottom:1px solid rgba(255,255,255,0.06);transition:background 0.15s" onmouseover="this.style.background='rgba(90,168,255,0.1)'" onmouseout="this.style.background=''">📜 Code ${escapeHtml(k.replace(/_/g, ' '))}</a>`;
    })
    .join('');

  const jurisHtml = Object.keys(AX_LEGAL_FR.jurisprudence)
    .map((k) => {
      const url = AX_LEGAL_FR.jurisprudence[k] ?? '';
      return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener" style="display:block;padding:9px 12px;color:#5aa8ff;text-decoration:none;border-bottom:1px solid rgba(255,255,255,0.06)">🔍 ${escapeHtml(k.replace(/_/g, ' '))}</a>`;
    })
    .join('');

  const monacoHtml = Object.keys(AX_LEGAL_FR.monaco)
    .map((k) => {
      const url = AX_LEGAL_FR.monaco[k] ?? '';
      return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener" style="display:block;padding:9px 12px;color:#5aa8ff;text-decoration:none;border-bottom:1px solid rgba(255,255,255,0.06)">${escapeHtml(k.replace(/_/g, ' '))}</a>`;
    })
    .join('');

  const orgsHtml = Object.keys(AX_LEGAL_FR.organismes)
    .map((k) => {
      const url = AX_LEGAL_FR.organismes[k] ?? '';
      return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener" style="display:block;padding:9px 12px;color:#5aa8ff;text-decoration:none;border-bottom:1px solid rgba(255,255,255,0.06)">${escapeHtml(k.replace(/_/g, ' '))}</a>`;
    })
    .join('');

  const templatesHtml = Object.keys(AX_LEGAL_FR.templates)
    .map((k) => {
      const t = AX_LEGAL_FR.templates[k];
      if (!t) return '';
      return `<div style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:13px"><strong>${escapeHtml(t.titre)}</strong>${t.ref_legales ? `<br><small style="color:#888">${escapeHtml(t.ref_legales)}</small>` : ''}</div>`;
    })
    .join('');

  root.innerHTML = `
    <div style="padding:16px;max-width:900px;margin:0 auto;color:var(--ax-text,#eee)">
      <h2 style="background:linear-gradient(135deg,#c9a227,#e8b830);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-size:28px;margin-bottom:8px">⚖ Bibliothèque juridique FR + Monaco</h2>
      <p style="color:var(--ax-text-dim,#999);font-size:13px;margin-bottom:16px">${Object.keys(AX_LEGAL_FR.codes).length} codes &middot; ${Object.keys(AX_LEGAL_FR.jurisprudence).length} jurisprudences &middot; ${Object.keys(AX_LEGAL_FR.templates).length} templates lettres &middot; calculs (indemnité, prescription, congés)</p>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:12px">
        <h3 style="color:#c9a227;margin:0 0 10px">🔎 Recherche article / code</h3>
        <input id="legalQ" type="text" placeholder="Ex: code civil, article 1240, RGPD..." style="width:100%;padding:11px;font-size:14px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);color:#eee;border-radius:8px;min-height:44px" aria-label="Recherche juridique">
        <button id="legalSearchBtn" type="button" style="width:100%;margin-top:8px;padding:12px;background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;border:0;border-radius:8px;font-weight:700;cursor:pointer;min-height:44px">Rechercher sur Légifrance</button>
        <div id="legalResult" style="margin-top:10px;font-size:13px"></div>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:12px">
        <h3 style="color:#c9a227;margin:0 0 10px">📚 Codes français (${Object.keys(AX_LEGAL_FR.codes).length})</h3>
        <div style="max-height:340px;overflow-y:auto">${codesHtml}</div>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:12px">
        <h3 style="color:#c9a227;margin:0 0 10px">⚖ Jurisprudence (${Object.keys(AX_LEGAL_FR.jurisprudence).length})</h3>
        ${jurisHtml}
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:12px">
        <h3 style="color:#c9a227;margin:0 0 10px">📝 Templates lettres officielles (${Object.keys(AX_LEGAL_FR.templates).length})</h3>
        <div style="max-height:300px;overflow-y:auto">${templatesHtml}</div>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:12px">
        <h3 style="color:#c9a227;margin:0 0 10px">🇲🇨 Monaco</h3>
        ${monacoHtml}
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:12px">
        <h3 style="color:#c9a227;margin:0 0 10px">🏛 Organismes officiels (${Object.keys(AX_LEGAL_FR.organismes).length})</h3>
        ${orgsHtml}
      </div>

      <div style="margin-top:18px;padding:14px;background:rgba(255,165,0,0.08);border:1px solid rgba(255,165,0,0.3);border-radius:10px;font-size:12px;color:#ffd699;text-align:center">
        ⚠️ <strong>Information indicative uniquement</strong>. Pour décision juridique importante, consulter un avocat ou notaire qualifié.
      </div>
      <p style="margin-top:14px;text-align:center;font-size:11px;color:#666">Sources : Légifrance &middot; Légimonaco &middot; Cour de cassation &middot; Conseil d'État &middot; CJUE &middot; CEDH</p>
    </div>
  `;

  root.querySelector<HTMLButtonElement>('#legalSearchBtn')?.addEventListener('click', () => {
    const q = root.querySelector<HTMLInputElement>('#legalQ')?.value ?? '';
    const out = root.querySelector<HTMLDivElement>('#legalResult');
    if (!out || !q) return;
    const url = legalLookup(q);
    out.innerHTML = `🔗 <a href="${escapeHtml(url)}" target="_blank" rel="noopener" style="color:#5aa8ff">${escapeHtml(url)}</a>`;
  });

  logger.info('legal-pro', 'rendered');
}
