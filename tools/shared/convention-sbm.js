/* CONVENTION COLLECTIVE JEUX DE TABLE SBM — référence officielle (1er avril 2015).
 *
 * v9.908 : SORTIE de index.html (13 Ko / 93 lignes) pour tenir le plafond du mono-fichier.
 * La garde `npm run test:file-size-guard` interdit de RELEVER le plafond pour accommoder du
 * nouveau code : elle demande d'extraire. C'est le bon candidat — de la DONNÉE pure, en
 * lecture seule, sans aucune dépendance au reste de l'app.
 *
 * Chargé par index.html AVANT les blocs <script> internes (même mécanique que planning-seed.js
 * et boards-gen.js). Si le fichier ne charge pas, l'app garde un objet vide et continue :
 * seule la vue Convention est vide, RIEN d'autre ne casse.
 */
window.CMC_CONVENTION={
  version:"1er avril 2015",
  source:"Convention Collective Jeux de Table SBM",
  signataires:"Soci\u00e9t\u00e9 des Bains de Mer (SBM) + syndicats repr\u00e9sentatifs",
  regles:{
    ageMin:21,
    periodeEssaiMois:3,
    contratInitialMois:12,
    commissionAptitudeMois:18,
    congesAnMois:2,
    congesPeriodeEste:"1er mai \u2013 31 octobre",
    congesMinConsecutives:4,
    reposHebdoMinJours:1,
    reposHebdoNormalJours:2,
    reposMin6Semaines:10,
    pauseSeniorsMin:40,
    pauseStandardMin:60,
    pauseDuree:20,
    prime1Mai:150,
    prime1MaiGroupeFerme:280,
    heureDiviseur:169,
    collationNuit:"3h \u00e0 7h",
    ecolesPremiumMax:5,
    ecolesPremiumDelaiAns:9,
    ecolesMinIntervalleAns:1,
    maladieIndemPct:85,
    maladieDureeMaxJours:1095,
    groupeFermeRetraiteMois:3,
    detachementMaxMois:6,
    majorationRepos5ePlus:50,
    ratioChefsMin:25,
    ratioChefsMax:30
  },
  articles:[
    {num:1,titre:"D\u00e9finitions cl\u00e9s",cat:"base",contenu:"Encadrement : directeurs, sous-directeurs, inspecteurs, chefs de table. Groupe ferm\u00e9 : salari\u00e9s pr\u00e9sents avant mise en \u0153uvre CC. Nouveaux entrants : apr\u00e8s CC. Faisant-fonction : occuper un poste sup\u00e9rieur sans le titre. Secteur Jeux de table : employ\u00e9s et cadres jeux, hors annexes."},
    {num:4,titre:"Recrutement",cat:"rh",contenu:"\u00c2ge minimum 21 ans \u00e0 l'ouverture du poste. Pi\u00e8ces : acte naissance, casier, CNI, dipl\u00f4mes, certificat m\u00e9dical, attestation \u00c9cole d'int\u00e9gration. Agr\u00e9ment administratif obligatoire (loi 1.103 du 12 juin 1987)."},
    {num:5,titre:"\u00c9coles de jeux",cat:"formation",contenu:"5.1 \u00c9cole d'int\u00e9gration : tests aptitude, langue (anglais + 1 autre), calcul mental, m\u00e9moire, coordination. Note \u00e9liminatoire <8/20. Dur\u00e9e min 3 mois. 5.2 5 \u00e9coles premium apr\u00e8s int\u00e9gration dans les 9 ans. Min 1 an entre 2 \u00e9coles. Jeux : BJ, Punto, Pokers, Roulette anglaise/europ\u00e9enne, Craps."},
    {num:6,titre:"Contrat de travail",cat:"rh",contenu:"Engagement employ\u00e9 niveau 1, contrat 12 mois. 3 premiers mois = p\u00e9riode d'essai. \u00c0 18 mois : Commission d'Aptitude propose CDI ou non-reconduction."},
    {num:7,titre:"P\u00e9riode d'essai",cat:"rh",contenu:"Dur\u00e9e 3 mois r\u00e9ciproques. Rupture possible sans pr\u00e9avis ni indemnit\u00e9s."},
    {num:8,titre:"D\u00e9tachements",cat:"rh",contenu:"Dur\u00e9e max 6 mois (retour service origine ensuite). D\u00e9tachement d'office : n\u00e9cessit\u00e9 fonctionnement. R\u00e9mun\u00e9ration : conditions du poste, garantie du salaire d'origine hors heures sup."},
    {num:10,titre:"\u00c9volution de carri\u00e8re employ\u00e9s",cat:"carriere",contenu:"Niveaux 1 \u00e0 7 selon nombre de jeux valid\u00e9s. Niveau 7 = Expert Jeux Premium (tous jeux, 12 mois anciennet\u00e9 min). Changement de niveau au 1er du mois suivant notification. Expert valid\u00e9 par Commission d'Aptitude."},
    {num:11,titre:"Promotions",cat:"carriere",contenu:"Expert/Sous-chef \u2192 Chef de table. Chef de table \u2192 Inspecteur. Inspecteur \u2192 Sous-directeur. Sous-directeur \u2192 Directeur. Conditions : 2 tests langue + \u00e9preuve orale + (inspecteurs/sous-dir) \u00e9val managers. Candidat = premier quart du classement."},
    {num:12,titre:"Commission d'Aptitude",cat:"rh",contenu:"Compos\u00e9e : DG Jeux (voix pr\u00e9pond\u00e9rante), DRH, Directeur Formation, 3 d\u00e9l\u00e9gu\u00e9s du personnel jeux. D\u00e9cisions \u00e0 la majorit\u00e9."},
    {num:13,titre:"R\u00e9mun\u00e9ration employ\u00e9s",cat:"salaire",contenu:"3 parties : fixe (garanti par niveau, +200\u20ac/mois par niveau), 1re variable (% CA jeux), 2e variable (% cagnottes). Minimum garanti 10,85 mois du salaire de r\u00e9f\u00e9rence. Versement mensuel + exc\u00e9dent en mars N+1. Indexation INSEE prix consommation France."},
    {num:14,titre:"D\u00e9roulement carri\u00e8re Expert/Sous-chef/Chef",cat:"carriere",contenu:"Expert Jeux Premium + 5 ans \u2192 Niv 9/1 (Sous-chef). Sous-chef 9/1 + 3 ans \u2192 9/2. Sous-chef 9/2 + 5 ans ou Chef 11/1 + 5 ans \u2192 9/3 ou 11/2. Ensuite +1 \u00e9chelon tous les 4 ans."},
    {num:15,titre:"R\u00e9mun\u00e9ration cadres",cat:"salaire",contenu:"Inspecteurs et sous-directeurs : salaire garanti fixe + variable (CA > 80M) + bonus annuel max 10%. Inspecteur \u2265 110% du chef de table le mieux pay\u00e9. Sous-directeur \u2265 125% du CdT le mieux pay\u00e9. Faisant-fonction : prime = 50% diff\u00e9rence salaires garantis."},
    {num:17,titre:"Conditions d'emploi",cat:"travail",contenu:"17.2 Dur\u00e9e l\u00e9gale sans distinction jour/nuit. Temps effectif hors repas/habillage. Formations = temps effectif. 17.3 J.f\u00e9ri\u00e9s programm\u00e9s (1er mai, F\u00eate Nat). Prime 1er mai 150\u20ac bruts (sauf absents maladie/CP/injustifi\u00e9s). 17.4 2 mois cong\u00e9s/an : 1 mois bloc (1er mai \u2013 31 oct), 1 mois bloc (hiver), 4 sem cons\u00e9cutives min. 17.5 Repos hebdo min 1 jour (24h+11h=35h). Normalement 2 jours cons\u00e9cutifs. Hors forte affluence, 2e jour supprimable : 4 premiers r\u00e9cup\u00e9r\u00e9s sans majoration, au-del\u00e0 volontaire + 50% majoration. Min garanti 10 jours/6 sem. Taux horaire = 1/169e. 17.6 Forte affluence : juillet-ao\u00fbt, 16 d\u00e9c-15 janv, Grand Prix, P\u00e2ques. Planning publi\u00e9 vendredi <12h (4 sem \u00e0 venir). 17.7 Heures sup employ\u00e9s + inspecteurs. 17.8 Femmes enceintes et +55 ans : pause toutes les 40 min (au lieu 60). 17.9 Cantines habituelles. 3h-7h : collation."},
    {num:18,titre:"Cong\u00e9s familiaux",cat:"conges",contenu:"Dispositions uniformis\u00e9es en 2019, \u00e9tendues depuis 2021 aux couples sous contrat d'union libre (Monaco) ou pacs\u00e9s (France). Mariage civil du salari\u00e9 : 4 jours ouvr\u00e9s. Naissance/adoption d'un enfant : 3 j. D\u00e9c\u00e8s (conjoint, enfant, p\u00e8re, m\u00e8re y compris parents adoptifs, fr\u00e8re, s\u0153ur, grand-p\u00e8re, grand-m\u00e8re, petit-enfant du salari\u00e9) : 3 j. D\u00e9c\u00e8s oncle/tante du salari\u00e9 : 1 j. Mariage d'un enfant ou enfant du conjoint : 2 j. D\u00e9c\u00e8s beau-p\u00e8re/belle-m\u00e8re : 1 j. D\u00e9c\u00e8s grand-p\u00e8re/grand-m\u00e8re/fr\u00e8re/s\u0153ur du conjoint : 1 j. R\u00c8GLES D'APPLICATION : jours \u00e0 prendre imp\u00e9rativement le jour de l'\u00e9v\u00e9nement, voire la veille ou le lendemain. Si salari\u00e9 en R/RH le jour J, cong\u00e9 pos\u00e9 \u00e0 compter du lendemain du R/RH. D\u00e9compt\u00e9s en jours ouvr\u00e9s, fractionnables uniquement par les R/RH. Si l'\u00e9v\u00e9nement intervient pendant cong\u00e9s pay\u00e9s, r\u00e9cup\u00e9rations ou maladie, le salari\u00e9 est consid\u00e9r\u00e9 comme d\u00e9j\u00e0 disponible : pas de report ni r\u00e9cup\u00e9ration. Source : Note d'information DRH Sophie VINCENT (2021-16-12). R\u00e9f\u00e9rence : Article 18 CC."},
    {num:19,titre:"Cong\u00e9s sans solde",cat:"conges",contenu:"19.1 Dur\u00e9e >1 sem, non r\u00e9mun\u00e9r\u00e9, pr\u00e9avis 15 jours ouvrables (<3 mois) ou 2 mois (\u22653 mois), r\u00e9ponse DRH 10 j. 19.2 De plein droit 3 mois renouvelable 1x : accompagner ascendant/conjoint fin de vie, enfant malade/handicap\u00e9, mandat politique. 19.3 Convenances personnelles : max 1 an renouvelable 1x (CDI), retour aux m\u00eames conditions."},
    {num:20,titre:"Temps partiel",cat:"rh",contenu:"Demande voie hi\u00e9rarchique. DRH pas oblig\u00e9e d'accepter. Max 1 an renouvelable, pr\u00e9avis 3 mois. R\u00e9mun\u00e9ration au prorata strict."},
    {num:21,titre:"Absences maladie",cat:"absences",contenu:"Certificat m\u00e9dical en 2 exemplaires d\u00e8s 1er jour. Transmission \u00e9lectronique admise, original dans 3 j ouvrables. Arr\u00eat \u2265 21 jours : avis d'aptitude M\u00e9decine du Travail requis."},
    {num:23,titre:"Indemnisation maladie",cat:"absences",contenu:"Indemnisation \u00e0 85% de 10,85 mois salaire r\u00e9f\u00e9rence (employ\u00e9s) ou salaire garanti (cadres). Min 91% salaire garanti mensuel brut (plafonn\u00e9 4x plafond SS = 12 680\u20ac \u00e0 signature). Au-del\u00e0 : 80%. Dur\u00e9e max 1 095 jours ou retraite l\u00e9gale."},
    {num:25,titre:"Discipline",cat:"discipline",contenu:"Sanctions 1er niveau : r\u00e9primande verbale, mise en garde \u00e9crite, avertissement dossier. 2e niveau : mise \u00e0 pied, mutation d'office, r\u00e9trogradation, licenciement avec/sans pr\u00e9avis et/ou indemnit\u00e9. Proc\u00e9dure 2e niveau : Commission paritaire (3+3), convoqu\u00e9e >=8 jours calendaires, PV confidentiel. Appel 48h par recommand\u00e9."},
    {num:26,titre:"D\u00e9part retraite",cat:"retraite",contenu:"Indemnit\u00e9s volontaires : 10 ans = \u00bd mois. 15 ans = 1 mois. 20 ans = 1,5 mois. 30 ans = 2 mois. Salaire r\u00e9f = moyenne 12 derniers mois. Mise retraite (employeur, \u226565 ans) = indemnit\u00e9 art 28. Groupe ferm\u00e9 : 3 mois salaire garanti."},
    {num:27,titre:"Pr\u00e9avis rupture",cat:"rupture",contenu:"\u22652 ans : 2 mois. \u226510 ans ou cadre : 3 mois. D\u00e9mission : pr\u00e9avis divis\u00e9 par 2."},
    {num:28,titre:"Indemnisation licenciement",cat:"rupture",contenu:"Indemnit\u00e9 l\u00e9gale cong\u00e9diement + indemnit\u00e9 sp\u00e9ciale si \u2265 10 ans : 1 mois (10), 2 mois (20), 3 mois (30). Groupe ferm\u00e9 : 3 mois + \u00bd mois/ann\u00e9e r\u00e9volue (>2 ans)."},
    {num:30,titre:"Repr\u00e9sentation personnel",cat:"syndicat",contenu:"D\u00e9l\u00e9gu\u00e9s du Personnel : max 15h/mois. D\u00e9l\u00e9gu\u00e9s Syndicaux : 4h/mois (max 2/syndicat). Bureaux syndicaux (SG, SGA, Tr\u00e9s, Arch) : 20h/mois. Congr\u00e8s syndical : 16 j/an (1 personne)."},
    {num:35,titre:"Suivi effectifs",cat:"effectifs",contenu:"Seuil information annuelle : effectif <380 personnes. Plancher absolu : 336 (cadres + employ\u00e9s). Chefs de table : 25-30% de l'effectif employ\u00e9s. Groupe ferm\u00e9 : ratio transitoire 33,5% \u00e0 ramener dans les 10 ans."},
    {num:38,titre:"Date d'effet",cat:"base",contenu:"En vigueur depuis 1er avril 2015. Annule et remplace tous textes et usages conventionnels ant\u00e9rieurs."}
  ],
  congesFamiliaux:[
    {evenement:"Mariage civil du salari\u00e9",jours:4,cat:"mariage"},
    {evenement:"Naissance ou adoption d'un enfant",jours:3,cat:"naissance"},
    {evenement:"D\u00e9c\u00e8s conjoint, enfant, p\u00e8re, m\u00e8re (y compris parents adoptifs), fr\u00e8re, s\u0153ur, grand-p\u00e8re, grand-m\u00e8re, petit-enfant du salari\u00e9",jours:3,cat:"deces"},
    {evenement:"D\u00e9c\u00e8s de l'oncle ou de la tante du salari\u00e9",jours:1,cat:"deces"},
    {evenement:"Mariage d'un enfant ou de l'enfant du conjoint",jours:2,cat:"mariage"},
    {evenement:"D\u00e9c\u00e8s du beau-p\u00e8re ou de la belle-m\u00e8re",jours:1,cat:"deces"},
    {evenement:"D\u00e9c\u00e8s du grand-p\u00e8re, de la grand-m\u00e8re, du fr\u00e8re ou de la s\u0153ur du conjoint",jours:1,cat:"deces"}
  ],
  congesFamiliauxRegles:{
    extension2021:"Dispositions \u00e9tendues officiellement aux couples sous contrat d'union libre (Monaco) ou pacs\u00e9s (France).",
    priseObligatoire:"Jours instaur\u00e9s pour lib\u00e9rer le salari\u00e9 en vue de l'\u00e9v\u00e9nement familial. \u00c0 prendre imp\u00e9rativement le jour de l'\u00e9v\u00e9nement, voire \u00e0 partir de la veille ou du lendemain.",
    siReposHebdo:"Si le salari\u00e9 est en R/RH le jour de l'\u00e9v\u00e9nement, le cong\u00e9 pourra \u00eatre pos\u00e9 \u00e0 compter du lendemain du R/RH.",
    decompte:"D\u00e9compt\u00e9s en jours ouvr\u00e9s. Fractionnables uniquement par les R/RH.",
    siAbsence:"Si l'\u00e9v\u00e9nement intervient durant une p\u00e9riode d'absence (cong\u00e9s pay\u00e9s, r\u00e9cup\u00e9rations, maladie\u2026), le salari\u00e9 est consid\u00e9r\u00e9 comme d\u00e9j\u00e0 disponible et ne peut pas b\u00e9n\u00e9ficier de ces jours. Pas de report ni r\u00e9cup\u00e9ration.",
    source:"Note d'information DRH Sophie VINCENT (2021-16-12). R\u00e9f\u00e9rence : Article 18 Convention Collective Jeux de Table SBM."
  },
  grilleEmployes:[
    {poste:"Employ\u00e9",jeux:"1 jeu",niveau:"1",pctCA:0.003,pctCag:0.06,salMois:2300,salAn:24955},
    {poste:"Employ\u00e9",jeux:"2 jeux",niveau:"2",pctCA:0.0045,pctCag:0.09,salMois:2765,salAn:30000},
    {poste:"Employ\u00e9",jeux:"3 jeux",niveau:"3",pctCA:0.006,pctCag:0.12,salMois:3127,salAn:33928},
    {poste:"Employ\u00e9",jeux:"4 jeux",niveau:"4",pctCA:0.0075,pctCag:0.15,salMois:4000,salAn:43400},
    {poste:"Employ\u00e9",jeux:"5 jeux",niveau:"5",pctCA:0.009,pctCag:0.18,salMois:4700,salAn:50995},
    {poste:"Employ\u00e9",jeux:"6 jeux",niveau:"6",pctCA:0.0105,pctCag:0.21,salMois:5413,salAn:58731},
    {poste:"Expert Jeux Premium",jeux:"Tous",niveau:"7",pctCA:0.012,pctCag:0.24,salMois:6113,salAn:66326},
    {poste:"Sous-chef de table",jeux:"Tous",niveau:"9/1",pctCA:0.0135,pctCag:0.27,salMois:6460,salAn:70091},
    {poste:"Chef de table",jeux:"Tous",niveau:"11/1",pctCA:0.015,pctCag:0.3,salMois:7000,salAn:75950}
  ],
  grilleCadres:[
    {poste:"Inspecteur <5 ans",pctCA:0.0006,salMois:8295,salAn:90000},
    {poste:"Inspecteur +5 ans",pctCA:0.0007,salMois:8710,salAn:94500},
    {poste:"Sous-Directeur",pctCA:0.0008,salMois:10452,salAn:113400}
  ]
};

/* CODES D'ACTIVITÉ DES BULLETINS DE PAIE — note SBM du 6 janvier 1993.
   v9.908 : sortis de index.html avec la convention (même nature : de la donnée de référence). */
window.CMC_BULLETIN_CODES={
  source:"Note SBM du 6 janvier 1993 - Bernard L\u00e9\u00e8s, Directeur Affaires Juridiques et Sociales",
  categories:{
    presence:[
      {code:"P",   l:"Jour de Pr\u00e9sence"},
      {code:"RH",  l:"Repos Hebdomadaire"},
      {code:"RTP", l:"Repos Travaill\u00e9 \u00e0 Payer"},
      {code:"RTR", l:"Repos Travaill\u00e9 \u00e0 R\u00e9cup\u00e9rer (+ au compteur)"},
      {code:"RRT", l:"R\u00e9cup\u00e9ration Repos Travaill\u00e9 (- au compteur)"},
      {code:"RHS", l:"R\u00e9cup\u00e9ration Heures Suppl\u00e9mentaires"},
      {code:"DP",  l:"Jour de Disposition"}
    ],
    conges:[
      {code:"CP",  l:"Jour ouvrable de Cong\u00e9 Pay\u00e9"},
      {code:"CRH", l:"Repos Hebdo inclus dans Cong\u00e9"},
      {code:"CPS", l:"Cong\u00e9 Pay\u00e9 Samedi (5e pour 5 sem)"},
      {code:"CPM", l:"1er jour P\u00e9riode Cong\u00e9 - droit fractionnement"},
      {code:"CDP", l:"Jour Cong\u00e9 D\u00e9j\u00e0 Pay\u00e9"},
      {code:"CDH", l:"Repos Hebdo inclus dans Cong\u00e9s D\u00e9j\u00e0 Pay\u00e9s"}
    ],
    fetes:[
      {code:"FL",  l:"F\u00eate L\u00e9gale ch\u00f4m\u00e9e et pay\u00e9e"},
      {code:"CFL", l:"F\u00eate L\u00e9gale incluse dans Cong\u00e9 Pay\u00e9"},
      {code:"FTP", l:"F\u00eate L\u00e9gale Travaill\u00e9e \u00e0 Payer"},
      {code:"FTR", l:"F\u00eate L\u00e9gale Travaill\u00e9e \u00e0 R\u00e9cup\u00e9rer (+ au compteur)"},
      {code:"RFT", l:"R\u00e9cup\u00e9ration F\u00eate Travaill\u00e9e (- au compteur)"}
    ],
    masse:[
      {code:"FCP", l:"Idem CP pour employ\u00e9 \u00e0 la masse"},
      {code:"FCS", l:"Idem CPS pour employ\u00e9 \u00e0 la masse"},
      {code:"FRH", l:"Idem CRH pour employ\u00e9 \u00e0 la masse"},
      {code:"FFL", l:"Idem CFL pour employ\u00e9 \u00e0 la masse"}
    ],
    absences:[
      {code:"M",   l:"Absence Maladie (indemnis\u00e9e ou non)"},
      {code:"AT",  l:"Accident du Travail ou Trajet"},
      {code:"MT",  l:"Cong\u00e9 Maternit\u00e9"},
      {code:"ABS", l:"Absence toler\u00e9e non pay\u00e9e"},
      {code:"ABI", l:"Absence Injustifi\u00e9e (sanction possible)"},
      {code:"ABP", l:"Absence autoris\u00e9e exceptionnellement pay\u00e9e"},
      {code:"AF",  l:"Absence R\u00e9mun\u00e9r\u00e9e Formation (= Pr\u00e9sence)"},
      {code:"CL",  l:"Cong\u00e9 L\u00e9gal \u00e9v\u00e9nement familial"},
      {code:"CEO", l:"Cong\u00e9 d'\u00c9ducation Ouvri\u00e8re"},
      {code:"CSC", l:"Cong\u00e9 Suppl\u00e9mentaire Cadre"},
      {code:"CSS", l:"Cong\u00e9 Sans Solde"}
    ],
    sanctions:[
      {code:"PNE", l:"Pr\u00e9avis non Ex\u00e9cut\u00e9"},
      {code:"AMP", l:"Mise \u00e0 Pied non r\u00e9mun\u00e9r\u00e9e"},
      {code:"MPC", l:"Mise \u00e0 Pied Conservatoire (attente d\u00e9cision)"},
      {code:"MPP", l:"Mise \u00e0 Pied Pay\u00e9e"}
    ],
    autres:[
      {code:"PAT", l:"Paternit\u00e9"},
      {code:"PRT", l:"Pr\u00eat (mis \u00e0 disposition autre service)"},
      {code:"HC",  l:"Heures Compl\u00e9mentaires"}
    ]
  }
};
