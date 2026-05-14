import{l as m}from"./monitoring-3uBGKGRH.js";import{s as p}from"../core/main-CvZGkqT7.js";import{g as f}from"./apex-tools-dispatch-CuGBkqp0.js";import"./apex-kb-_d6cfAGK.js";import"./credential-patterns-guxfirLX.js";import"./multi-source-analyze-NEWSpUg3.js";import"./apex-tools-registry-BCFLyYun.js";import"./voice-By9njYem.js";const t={codes:{civil:"https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006070721/",penal:"https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006070719/",travail:"https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006072050/",commerce:"https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000005634379/",consommation:"https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006069565/",secu_sociale:"https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006073189/",sante:"https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006072665/",impots:"https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006069577/",urbanisme:"https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006074075/",environnement:"https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006074220/",education:"https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006071191/",transports:"https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000023086525/",procedure_civile:"https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006070716/",procedure_penale:"https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006071154/",justice_admin:"https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006070933/",propriete_intellectuelle:"https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006069414/",monetaire_financier:"https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006072026/",general_collectivites:"https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006070633/",construction_habitation:"https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006074096/",mutualite:"https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006074067/",sport:"https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006071318/",tourisme:"https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006074073/",energie:"https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000023983208/",patrimoine:"https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006074236/",forestier:"https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000025244092/"},jurisprudence:{cassation:"https://www.courdecassation.fr/recherche-judilibre",conseil_etat:"https://www.conseil-etat.fr/decisions",conseil_constitutionnel:"https://www.conseil-constitutionnel.fr/decisions",cjue:"https://curia.europa.eu/juris/recherche.jsf",cedh:"https://hudoc.echr.coe.int/fre"},constitutions:{france_1958:"https://www.conseil-constitutionnel.fr/le-bloc-de-constitutionnalite/texte-integral-de-la-constitution-du-4-octobre-1958-en-vigueur",monaco_1962:"https://journaldemonaco.gouv.mc/Journaux/2002/Journal-7569/Constitution-de-la-Principaute-de-Monaco",declaration_dh_1789:"https://www.legifrance.gouv.fr/contenu/menu/droit-national-en-vigueur/constitution/declaration-des-droits-de-l-homme-et-du-citoyen-de-1789"},monaco:{constitution:"https://journaldemonaco.gouv.mc/Journaux/2002/Journal-7569/Constitution-de-la-Principaute-de-Monaco",legimonaco:"https://www.legimonaco.mc/"},organismes:{avocat_cnb:"https://www.avocat.fr",notaire:"https://www.notaires.fr",huissier:"https://www.huissier-justice.fr",cnil:"https://www.cnil.fr",defenseur:"https://www.defenseurdesdroits.fr",service_public:"https://www.service-public.fr",legifrance:"https://www.legifrance.gouv.fr",bofip:"https://bofip.impots.gouv.fr",journal_officiel:"https://www.journal-officiel.gouv.fr",direct_finances_publiques:"https://www.economie.gouv.fr/dgfip"},templates:{demission_cdi:{titre:"Démission CDI",destinataire:"Employeur",texte:`Madame, Monsieur,

Par la présente, je vous informe de ma décision de démissionner de mon poste de [poste] que j'occupe depuis le [date]. Conformément à l'article L1237-1 du Code du travail, je respecterai un préavis de [durée] à compter de la réception de cette lettre, soit jusqu'au [date fin].

Je vous remercie pour ces années de collaboration.

Veuillez agréer, Madame, Monsieur, mes salutations distinguées.`,ref_legales:"Art L1237-1 Code du travail"},rupture_conventionnelle:{titre:"Demande rupture conventionnelle",destinataire:"Employeur",texte:`Madame, Monsieur,

Je sollicite par la présente l'ouverture d'une procédure de rupture conventionnelle de mon contrat de travail (Articles L1237-11 à L1237-16 du Code du travail). Je vous propose de fixer un entretien préliminaire afin d'en discuter ensemble les modalités.

Veuillez agréer mes salutations distinguées.`,ref_legales:"Art L1237-11 à L1237-16 Code du travail"},contestation_facture:{titre:"Contestation de facture",destinataire:"Société",texte:`Madame, Monsieur,

J'ai bien reçu votre facture n°[numéro] en date du [date] d'un montant de [montant] euros.

Je conteste cette facture pour le motif suivant : [motif détaillé].

Conformément à l'article L218-1 du Code de la consommation, je vous demande de bien vouloir procéder à sa rectification. À défaut, je me verrai contraint(e) de saisir le médiateur de la consommation.

Dans l'attente de votre retour, je vous prie de recevoir mes salutations.`,ref_legales:"Art L218-1 Code de la consommation"},mise_en_demeure_paiement:{titre:"Mise en demeure de paiement",destinataire:"Débiteur",texte:`Madame, Monsieur,

Malgré nos relances, je constate que la somme de [montant] euros, due au titre de [objet] et exigible depuis le [date], demeure impayée.

Par la présente, je vous mets en demeure de régler cette somme dans un délai de 8 jours à compter de la réception de cette lettre. À défaut, je me verrai contraint(e) d'engager toutes les voies de droit pour obtenir paiement, intérêts moratoires inclus (Art 1231-6 Code civil).

Veuillez agréer mes salutations distinguées.`,ref_legales:"Art 1231-6 Code civil"},plainte_simple:{titre:"Plainte simple au procureur",destinataire:"Procureur de la République",texte:`Monsieur le Procureur de la République,

J'ai l'honneur de porter à votre connaissance les faits suivants :

[Description précise des faits, dates, lieux, témoins éventuels]

Ces faits sont susceptibles de constituer l'infraction de [qualification juridique].

Je vous demande de bien vouloir engager les poursuites qui vous paraîtront utiles.

Je me tiens à votre disposition pour toute information complémentaire.

Je vous prie d'agréer, Monsieur le Procureur de la République, l'expression de ma haute considération.`,ref_legales:"Art 40 Code de procédure pénale"},droit_acces_rgpd:{titre:"Droit d'accès RGPD",destinataire:"Responsable de traitement",texte:`Madame, Monsieur,

Conformément à l'article 15 du Règlement Général sur la Protection des Données (RGPD), je sollicite par la présente l'accès à l'ensemble des données personnelles me concernant que vous détenez.

Je vous prie de bien vouloir me communiquer dans un délai d'un mois (Art 12 RGPD) :
- Une copie de toutes mes données personnelles
- Les finalités du traitement
- Les destinataires éventuels
- La durée de conservation

Je joins copie de ma pièce d'identité.

Veuillez agréer mes salutations distinguées.`,ref_legales:"Art 15 RGPD"},droit_oubli_rgpd:{titre:"Droit à l'oubli RGPD",destinataire:"Responsable de traitement",texte:`Madame, Monsieur,

Je vous demande, en vertu de l'article 17 du RGPD, l'effacement de toutes les données personnelles me concernant que vous détenez.

J'attire votre attention sur le délai légal de réponse d'un mois.

Veuillez agréer mes salutations distinguées.`,ref_legales:"Art 17 RGPD"},declaration_sinistre_assurance:{titre:"Déclaration de sinistre",destinataire:"Assureur",texte:`Madame, Monsieur,

Numéro de contrat : [n°contrat]

Je déclare le sinistre survenu le [date] à [heure], dans les circonstances suivantes : [description].

Dommages constatés : [liste détaillée]

Témoins : [si applicable]

Je joins les pièces justificatives nécessaires (photos, devis, factures).

Dans l'attente de votre prise en charge.`,ref_legales:"Art L113-2 Code des assurances"},reclamation_consommation:{titre:"Réclamation consommation",destinataire:"Service client",texte:`Madame, Monsieur,

Objet : Réclamation suite à [problème]

Le [date], j'ai [acheté / souscrit / commandé] [produit/service] pour un montant de [montant] euros.

J'ai constaté le problème suivant : [description].

Conformément à mes droits de consommateur (Code de la consommation), je vous demande [remboursement / remplacement / réparation] dans un délai de 15 jours.

À défaut de retour favorable, je saisirai le médiateur de la consommation puis le tribunal compétent.

Veuillez agréer mes salutations.`,ref_legales:"Art L217-1 et s. Code de la consommation"},conge_parental:{titre:"Congé parental d'éducation",destinataire:"Employeur",texte:`Madame, Monsieur,

Conformément aux articles L1225-47 et suivants du Code du travail, je sollicite le bénéfice d'un congé parental d'éducation à compter du [date], pour une durée initiale de [6 mois / 1 an].

Mon enfant [prénom] est né le [date].

Je vous prie d'agréer mes salutations.`,ref_legales:"Art L1225-47 Code du travail"},contestation_pv:{titre:"Contestation procès-verbal",destinataire:"Officier du Ministère Public",texte:`Monsieur l'Officier du Ministère Public,

Je conteste le procès-verbal n°[numéro] dressé le [date] pour [motif] pour les raisons suivantes : [arguments].

Je joins tous éléments justificatifs.

Je vous prie d'agréer mes respectueuses salutations.`,ref_legales:"Art 530 Code de procédure pénale"},plainte_avec_partie_civile:{titre:"Plainte avec constitution de partie civile",destinataire:"Doyen des juges d'instruction",texte:`Monsieur le Doyen,

J'ai l'honneur de déposer plainte avec constitution de partie civile pour les faits suivants : [description précise des faits].

Je me constitue partie civile et chiffre mon préjudice à [montant] euros.

Je vous prie d'agréer mes respectueuses salutations.`,ref_legales:"Art 85 Code de procédure pénale"},revocation_caution:{titre:"Révocation engagement de caution",destinataire:"Créancier",texte:`Madame, Monsieur,

Par acte du [date], je m'étais porté(e) caution pour [débiteur].

Je vous notifie ma volonté de révoquer cet engagement à l'expiration du préavis légal et notamment pour les dettes futures, conformément à l'article 2316 du Code civil.

Veuillez agréer mes salutations.`,ref_legales:"Art 2316 Code civil"},contestation_taxe_fonciere:{titre:"Réclamation taxe foncière",destinataire:"Centre des Finances Publiques",texte:`Madame, Monsieur,

Je conteste l'avis d'imposition n°[numéro] établi pour la taxe foncière de l'année [année].

Motif : [argument détaillé]

Conformément aux articles L190 et s. du LPF, je sollicite la révision de mon imposition.

Veuillez agréer mes respectueuses salutations.`,ref_legales:"Art L190 Livre Procédures Fiscales"},rgpd_opposition:{titre:"Droit d'opposition au traitement",destinataire:"Responsable de traitement",texte:`Madame, Monsieur,

En application de l'article 21 du RGPD, je m'oppose au traitement de mes données personnelles à des fins [marketing direct / profilage / autre].

Merci de cesser tout traitement à cette fin et de me confirmer l'exécution dans un délai d'un mois.`,ref_legales:"Art 21 RGPD"},declaration_main_main:{titre:"Déclaration don manuel",destinataire:"Service Impôts",texte:`Madame, Monsieur,

Je déclare avoir reçu de [donateur] un don manuel d'un montant de [montant] euros le [date].

Lien de parenté : [enfant / petit-enfant / autre]

Abattement applicable : [100 000 € enfants / 31 865 € petits-enfants].

Joint formulaire 2735.`,ref_legales:"Art 757 CGI"},convocation_temoin:{titre:"Demande de convocation comme témoin",destinataire:"Tribunal",texte:`Madame, Monsieur,

Dans le cadre de l'affaire n°[numéro], je demande à être entendu(e) comme témoin pour les raisons suivantes : [raisons].

Je me tiens à votre disposition.`,ref_legales:"Art 222 Code procédure civile"},refus_consentement_medical:{titre:"Refus de soins / Consentement éclairé",destinataire:"Médecin",texte:`Docteur,

Après avoir reçu une information claire sur les risques du traitement [traitement], je refuse expressément en pleine conscience.

Je reste informé(e) des conséquences possibles.`,ref_legales:"Art L1111-4 Code santé publique"},droit_de_retrait:{titre:"Droit de retrait",destinataire:"Employeur",texte:`Madame, Monsieur,

Conformément à l'article L4131-1 du Code du travail, j'exerce mon droit de retrait suite à : [danger grave et imminent].

Je vous demande de remédier à la situation avant toute reprise.`,ref_legales:"Art L4131-1 Code du travail"},revendication_propriete:{titre:"Revendication de propriété",destinataire:"Détenteur du bien",texte:`Madame, Monsieur,

Je revendique la propriété du bien suivant : [description].

Titre de propriété : [acte authentique du date].

Merci de me restituer ce bien sous 15 jours, à défaut action en revendication (Art 2276 Code civil).`,ref_legales:"Art 2276 Code civil"},appel_jugement:{titre:"Déclaration d'appel",destinataire:"Cour d'appel",texte:`Madame, Monsieur le Greffier,

Je relève appel du jugement rendu le [date] par le [tribunal] dans l'affaire n°[numéro].

Motifs d'appel : [arguments].`,ref_legales:"Art 901 Code procédure civile"},contestation_amende_majoree:{titre:"Contestation amende majorée",destinataire:"Officier Ministère Public",texte:`Monsieur l'Officier du Ministère Public,

Je conteste l'amende forfaitaire majorée n°[numéro] notifiée le [date] pour les motifs suivants : [arguments].

Je joins toutes pièces utiles.`,ref_legales:"Art 530 Code procédure pénale"},demande_garde_alternee:{titre:"Demande de garde alternée",destinataire:"Juge aux Affaires Familiales",texte:`Monsieur le Juge,

Je sollicite la mise en place d'une résidence alternée pour notre enfant [prénom], dans les conditions suivantes : [modalités].

Mon ex-conjoint(e) [accepte / s'oppose à] cette demande.`,ref_legales:"Art 373-2-9 Code civil"},declaration_naissance_tardive:{titre:"Déclaration de naissance hors délai",destinataire:"Tribunal Judiciaire",texte:`Monsieur le Procureur,

Je sollicite l'établissement d'un jugement supplétif d'acte de naissance pour [prénom] né(e) le [date] à [lieu].

La déclaration n'a pas été faite dans les 5 jours pour les raisons suivantes : [motif].`,ref_legales:"Art 55 Code civil"},demande_attestation_employeur:{titre:"Demande attestation employeur",destinataire:"Employeur",texte:`Madame, Monsieur,

Je vous prie de me délivrer une attestation de [emploi/salaire/présence] précisant mon poste, mon ancienneté et mon salaire actuel.

Document nécessaire pour [motif].

Cordialement.`,ref_legales:"Art L3243-2 Code du travail"},demande_lettre_recommandation:{titre:"Demande lettre de recommandation",destinataire:"Ancien employeur",texte:`Madame, Monsieur,

Dans le cadre de ma recherche [d'emploi / d'études], je souhaiterais une lettre de recommandation de votre part qui mette en avant les compétences acquises pendant mon poste de [poste].

Merci d'avance.`,ref_legales:""},relance_facture:{titre:"Relance facture impayée",destinataire:"Client",texte:`Madame, Monsieur,

Notre facture n°[numéro] du [date] d'un montant de [montant] euros est échue depuis le [date].

Nous vous prions de bien vouloir procéder au règlement sous 8 jours.

À défaut, nous serons contraints d'engager une procédure de recouvrement (Art L441-10 Code commerce, intérêts moratoires + indemnité forfaitaire 40€).

Cordialement.`,ref_legales:"Art L441-10 Code de commerce"},contestation_pension_alimentaire:{titre:"Demande révision pension alimentaire",destinataire:"JAF",texte:`Monsieur le Juge aux Affaires Familiales,

Je sollicite la révision de la pension alimentaire fixée par jugement du [date], en raison de : [changement situation : perte emploi / nouveau enfant / etc].

Mes ressources actuelles : [détails].

Merci de bien vouloir convoquer les parties.`,ref_legales:"Art 373-2-13 Code civil"},demande_aide_juridictionnelle:{titre:"Demande aide juridictionnelle",destinataire:"BAJ Bureau Aide Juridictionnelle",texte:`Madame, Monsieur,

Je sollicite le bénéfice de l'aide juridictionnelle [totale / partielle] pour la procédure suivante : [type].

Mes revenus mensuels : [montant] euros (joint avis imposition).

Merci de bien vouloir traiter ma demande.`,ref_legales:"Loi 91-647 du 10/07/1991"},contestation_tarif_artisan:{titre:"Contestation devis travaux",destinataire:"Artisan",texte:`Madame, Monsieur,

Suite à votre devis n°[numéro] du [date], je conteste le montant facturé pour : [motifs].

Conformément aux articles L111-1 et s. du Code de la consommation, je demande [reduction / annulation / regularisation].

À défaut de réponse sous 15 jours, je saisirai le médiateur de la consommation.`,ref_legales:"Art L111-1 Code de la consommation"},declaration_main_levee_hypotheque:{titre:"Demande mainlevée hypothèque",destinataire:"Notaire",texte:`Maître,

Je sollicite la mainlevée de l'hypothèque inscrite sur mon bien sis [adresse], suite au remboursement intégral de mon prêt n°[numéro] le [date].

Merci de procéder aux démarches de radiation auprès du Service de Publicité Foncière.`,ref_legales:"Art 2440 Code civil"},demande_certificat_hospitalier:{titre:"Demande certificat médical hospitalier",destinataire:"Médecin chef de service",texte:`Docteur,

Je sollicite la délivrance d'un certificat médical détaillé concernant mon hospitalisation du [date début] au [date fin] dans votre service.

Document nécessaire pour : [motif].

Cordialement.`,ref_legales:"Art L1111-7 Code santé publique"},contestation_pv_stationnement:{titre:"Contestation PV stationnement (FPS)",destinataire:"CCSP / Commission contentieux",texte:`Madame, Monsieur,

Je conteste le forfait de post-stationnement n°[numéro] du [date] à [lieu] pour les raisons suivantes : [motifs : stationnement payé / panneau invisible / véhicule revendu / etc].

Je joins toutes les pièces justificatives.

Merci de bien vouloir annuler ce FPS.`,ref_legales:"Art L2333-87 CGCT"},declaration_grossesse_employeur:{titre:"Déclaration grossesse à employeur",destinataire:"Employeur",texte:`Madame, Monsieur,

Je vous informe de mon état de grossesse, attesté par certificat médical en pièce jointe.

Date présumée d'accouchement : [date].

Je bénéficie des protections prévues aux articles L1225-1 et suivants du Code du travail (interdiction licenciement, aménagements horaires, congé maternité 16 semaines).`,ref_legales:"Art L1225-1 et s. Code du travail"},demande_dossier_medical:{titre:"Demande accès dossier médical",destinataire:"Hôpital / Médecin",texte:`Madame, Monsieur,

Conformément à l'article L1111-7 du Code de la santé publique, je sollicite la communication d'une copie de mon dossier médical complet.

Délai légal : 8 jours (1 mois si dossier ancien > 5 ans).

Je joins copie ma pièce d'identité.`,ref_legales:"Art L1111-7 Code santé publique"},declaration_changement_nom:{titre:"Demande changement de nom",destinataire:"Mairie de naissance",texte:`Madame, Monsieur,

Conformément à la loi du 2 mars 2022, je sollicite mon changement de nom de famille de [nom actuel] à [nom souhaité]. Motif : [adoption nom parent / mariage / autre].

Merci de procéder à la modification.`,ref_legales:"Loi 2022-301 Art 61-3-1 Code civil"},rupture_pacs:{titre:"Rupture PACS unilatérale",destinataire:"Mairie / Notaire",texte:`Madame, Monsieur,

Je vous notifie ma volonté de rupture unilatérale du PACS n°[numéro] enregistré le [date].

Merci d'enregistrer la dissolution.

Je vais notifier mon partenaire par huissier conformément à l'article 515-7 du Code civil.`,ref_legales:"Art 515-7 Code civil"},demande_succession_partage:{titre:"Demande partage succession",destinataire:"Notaire",texte:`Maître,

Dans le cadre de la succession de [défunt] décédé(e) le [date], je sollicite l'ouverture de la procédure de partage entre les héritiers.

Les biens à partager sont : [liste].

Merci de convoquer une réunion.`,ref_legales:"Art 815 Code civil"},demande_residence_assignment:{titre:"Demande titre de séjour",destinataire:"Préfecture",texte:`Monsieur le Préfet,

Je sollicite la délivrance d'un titre de séjour [type : salarié / étudiant / vie privée et familiale / etc].

Je joins l'ensemble des pièces justificatives.

Date d'entrée en France : [date].`,ref_legales:"Art L313-1 et s. CESEDA"},contestation_cna:{titre:"Recours CNDA (asile)",destinataire:"CNDA",texte:`Madame, Monsieur,

Je forme recours contre la décision OFPRA du [date] m'ayant refusé le statut de réfugié pour les raisons suivantes : [arguments].

Je joins tous éléments nouveaux à l'appui.`,ref_legales:"Art L731-1 CESEDA"},demande_carte_grise:{titre:"Demande certificat immatriculation",destinataire:"ANTS",texte:`Madame, Monsieur,

Je sollicite l'immatriculation du véhicule [marque/modèle/n° série] suite à [achat / héritage / changement].

Je joins : carte grise vendeur, certificat cession, contrôle technique, attestation assurance.`,ref_legales:"Art R322-1 Code route"},declaration_perte_documents:{titre:"Déclaration perte papiers",destinataire:"Mairie / Police",texte:`Madame, Monsieur,

Je déclare la perte du document suivant : [type : CNI / passeport / permis / carte vitale].

Date présumée perte : [date].

Lieu : [lieu].

Merci de me délivrer un récépissé de déclaration.`,ref_legales:""},procuration_administrative:{titre:"Procuration administrative",destinataire:"Tiers",texte:`Je soussigné(e) [nom prénom] né(e) le [date] à [lieu], domicilié(e) [adresse], donne procuration à [nom mandataire] pour [démarches précises].

Validité : [durée].

Fait à [lieu], le [date]. Signature.`,ref_legales:"Art 1984 Code civil"},demande_dette_publique:{titre:"Demande remise gracieuse impôts",destinataire:"Trésor Public",texte:`Madame, Monsieur le Trésorier,

Je sollicite une remise gracieuse [totale / partielle] de l'impôt n°[numéro] d'un montant de [montant] euros.

Motifs : [perte emploi / maladie / surendettement / précarité financière].

Mes ressources actuelles : [montant].

Joint avis imposition + justificatifs.`,ref_legales:"Art L247 LPF"}}};function s(e){return e.replace(/[&<>"']/g,n=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[n]??n)}function g(e){const n=String(e||"").toLowerCase().trim(),r=t.codes[n];return r||`https://www.legifrance.gouv.fr/search/all?searchField=ALL&query=${encodeURIComponent(e)}`}function C(e,n){const r=String(e||"cassation").toLowerCase();return`${t.jurisprudence[r]??t.jurisprudence.cassation??""}?search=${encodeURIComponent(n)}`}function L(){return Object.keys(t.codes).map(e=>({key:e,label:e.replace(/_/g," "),url:t.codes[e]??""}))}function y(e,n){if(n<8/12)return{indemnite:0,detail:"Pas d'indemnité légale (ancienneté < 8 mois)",formule:"Art L1234-9 Code du travail"};let r=0;const o=Math.min(n,10);return r+=1/4*e*o,n>10&&(r+=1/3*e*(n-10)),{indemnite:Math.round(r),detail:`1/4 mois × ${o} ans${n>10?` + 1/3 mois × ${n-10} ans`:""}`,formule:"Art L1234-9 + R1234-2 Code du travail"}}function A(e,n,r=.0697){return Math.round(e*r*n/365)}function J(e){const n=Math.min(30,e*2.5);return{jours_ouvrables:Math.round(n*10)/10,semaines_equivalent:Math.round(n/6*10)/10}}function T(e,n){const r={civil:5,contravention:1,delit:6,crime:20},o=new Date(e);o.setFullYear(o.getFullYear()+(r[n]||5));const l=o.toISOString().slice(0,10),d=Math.max(0,Math.floor((o.getTime()-Date.now())/864e5));return{date_fait:e,date_prescription:l,jours_restants:d}}function E(e){return e<6?{duree_mois:0,description:"Pas de préavis légal (< 6 mois)"}:e<24?{duree_mois:1,description:"1 mois (entre 6 mois et 2 ans)"}:{duree_mois:2,description:"2 mois (≥ 2 ans)"}}function D(e){const n=e.toLowerCase().trim();return n?Object.keys(t.templates).filter(r=>{const o=t.templates[r];return o?r.includes(n)||o.titre.toLowerCase().includes(n)||(o.ref_legales??"").toLowerCase().includes(n):!1}).map(r=>({key:r,titre:t.templates[r]?.titre??"",destinataire:t.templates[r]?.destinataire??""})):Object.keys(t.templates).map(r=>({key:r,titre:t.templates[r]?.titre??"",destinataire:t.templates[r]?.destinataire??""}))}function P(e){const n=e.toLowerCase();return Object.keys(t.templates).filter(r=>(t.templates[r]?.destinataire??"").toLowerCase().includes(n)).map(r=>({key:r,titre:t.templates[r]?.titre??""}))}function q(){return Object.keys(t.templates).length}function G(e){const n=Math.min(30,e*2.5);return{jours_ouvrables:Math.round(n*10)/10,jours_ouvres:Math.round(n*5/6*10)/10}}function k(e){return{civile_droit_commun:{duree:"5 ans",reference:"Art 2224 Code civil"},creance_consommation:{duree:"2 ans",reference:"Art L218-2 Code conso"},salaire:{duree:"3 ans",reference:"Art L3245-1 Code travail"},licenciement_irregulier:{duree:"12 mois",reference:"Art L1471-1 Code travail"},penal_contravention:{duree:"1 an",reference:"Art 9 Code procédure pénale"},penal_delit:{duree:"6 ans",reference:"Art 8 Code procédure pénale"},penal_crime:{duree:"20 ans",reference:"Art 7 Code procédure pénale"},penal_crime_grave_mineurs:{duree:"30 ans / imprescriptible",reference:"Art 7 al 3"},penal_terrorisme_crime_humanite:{duree:"Imprescriptible",reference:"Art 7"},fiscal_isf_ifi:{duree:"6 ans",reference:"Art L181 LPF"},fiscal_ir:{duree:"3 ans",reference:"Art L169 LPF"},reparation_dommage_corporel:{duree:"10 ans",reference:"Art 2226 Code civil"},inscription_hypothecaire:{duree:"50 ans max",reference:"Art 2434 Code civil"}}[e]??null}function R(e){return t.templates[e]??null}function I(){return Object.keys(t.templates).map(e=>({key:e,titre:t.templates[e]?.titre??e}))}function $(e){const n=p.get("user")?.id??"anon";if(!f("pro.legal",e,n))return;const r=Object.keys(t.codes).map(i=>{const a=t.codes[i]??"";return`<a href="${s(a)}" target="_blank" rel="noopener" style="display:block;padding:9px 12px;color:#5aa8ff;text-decoration:none;border-bottom:1px solid rgba(255,255,255,0.06);transition:background 0.15s" onmouseover="this.style.background='rgba(90,168,255,0.1)'" onmouseout="this.style.background=''">📜 Code ${s(i.replace(/_/g," "))}</a>`}).join(""),o=Object.keys(t.jurisprudence).map(i=>{const a=t.jurisprudence[i]??"";return`<a href="${s(a)}" target="_blank" rel="noopener" style="display:block;padding:9px 12px;color:#5aa8ff;text-decoration:none;border-bottom:1px solid rgba(255,255,255,0.06)">🔍 ${s(i.replace(/_/g," "))}</a>`}).join(""),l=Object.keys(t.monaco).map(i=>{const a=t.monaco[i]??"";return`<a href="${s(a)}" target="_blank" rel="noopener" style="display:block;padding:9px 12px;color:#5aa8ff;text-decoration:none;border-bottom:1px solid rgba(255,255,255,0.06)">${s(i.replace(/_/g," "))}</a>`}).join(""),d=Object.keys(t.organismes).map(i=>{const a=t.organismes[i]??"";return`<a href="${s(a)}" target="_blank" rel="noopener" style="display:block;padding:9px 12px;color:#5aa8ff;text-decoration:none;border-bottom:1px solid rgba(255,255,255,0.06)">${s(i.replace(/_/g," "))}</a>`}).join(""),u=Object.keys(t.templates).map(i=>{const a=t.templates[i];return a?`<div style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:13px"><strong>${s(a.titre)}</strong>${a.ref_legales?`<br><small style="color:#888">${s(a.ref_legales)}</small>`:""}</div>`:""}).join("");e.innerHTML=`
    <div style="padding:16px;max-width:900px;margin:0 auto;color:var(--ax-text,#eee)">
      <h2 style="background:linear-gradient(135deg,#c9a227,#e8b830);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-size:28px;margin-bottom:8px">⚖ Bibliothèque juridique FR + Monaco</h2>
      <p style="color:var(--ax-text-dim,#999);font-size:13px;margin-bottom:16px">${Object.keys(t.codes).length} codes &middot; ${Object.keys(t.jurisprudence).length} jurisprudences &middot; ${Object.keys(t.templates).length} templates lettres &middot; calculs (indemnité, prescription, congés)</p>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:12px">
        <h3 style="color:#c9a227;margin:0 0 10px">🔎 Recherche article / code</h3>
        <input id="legalQ" type="text" placeholder="Ex: code civil, article 1240, RGPD..." style="width:100%;padding:11px;font-size:14px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);color:#eee;border-radius:8px;min-height:44px" aria-label="Recherche juridique">
        <button id="legalSearchBtn" type="button" style="width:100%;margin-top:8px;padding:12px;background:linear-gradient(135deg,#c9a227,#e8b830);color:#000;border:0;border-radius:8px;font-weight:700;cursor:pointer;min-height:44px">Rechercher sur Légifrance</button>
        <div id="legalResult" style="margin-top:10px;font-size:13px"></div>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:12px">
        <h3 style="color:#c9a227;margin:0 0 10px">📚 Codes français (${Object.keys(t.codes).length})</h3>
        <div style="max-height:340px;overflow-y:auto">${r}</div>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:12px">
        <h3 style="color:#c9a227;margin:0 0 10px">⚖ Jurisprudence (${Object.keys(t.jurisprudence).length})</h3>
        ${o}
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:12px">
        <h3 style="color:#c9a227;margin:0 0 10px">📝 Templates lettres officielles (${Object.keys(t.templates).length})</h3>
        <div style="max-height:300px;overflow-y:auto">${u}</div>
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:12px">
        <h3 style="color:#c9a227;margin:0 0 10px">🇲🇨 Monaco</h3>
        ${l}
      </div>

      <div style="background:rgba(201,162,39,0.05);border:1px solid rgba(201,162,39,0.3);border-radius:12px;padding:14px;margin-bottom:12px">
        <h3 style="color:#c9a227;margin:0 0 10px">🏛 Organismes officiels (${Object.keys(t.organismes).length})</h3>
        ${d}
      </div>

      <div style="margin-top:18px;padding:14px;background:rgba(255,165,0,0.08);border:1px solid rgba(255,165,0,0.3);border-radius:10px;font-size:12px;color:#ffd699;text-align:center">
        ⚠️ <strong>Information indicative uniquement</strong>. Pour décision juridique importante, consulter un avocat ou notaire qualifié.
      </div>
      <p style="margin-top:14px;text-align:center;font-size:11px;color:#666">Sources : Légifrance &middot; Légimonaco &middot; Cour de cassation &middot; Conseil d'État &middot; CJUE &middot; CEDH</p>
    </div>
  `,e.querySelector("#legalSearchBtn")?.addEventListener("click",()=>{const i=e.querySelector("#legalQ")?.value??"",a=e.querySelector("#legalResult");if(!a||!i)return;const c=g(i);a.innerHTML=`🔗 <a href="${s(c)}" target="_blank" rel="noopener" style="color:#5aa8ff">${s(c)}</a>`}),m.info("legal-pro","rendered")}export{t as AX_LEGAL_FR,J as calcConcesPaies,G as calcCongesPayes,y as calcIndemniteLicenciement,A as calcInteretsMoratoires,E as calcPreavisCdi,T as calcPrescription,q as countTemplates,k as getDelaiPrescription,R as getTemplate,C as jurisprudenceSearch,g as legalLookup,L as listCodes,I as listTemplates,P as listTemplatesByDestinataire,$ as render,D as searchTemplates};
