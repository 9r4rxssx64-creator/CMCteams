/* KDMC Lingua — contenu des cours (100% original, aucun contenu tiers)
   COURSES[langue] = { id, nom, drapeau, ttsLang, units[] }
   unité : { titre, couleur, lessons[] } · leçon : { titre, words:[{fr,t}], phrases?:[{fr,t}] } */
function _u(titre,couleur,lessons){ return {titre:titre,couleur:couleur,lessons:lessons}; }
/* Jeu de mots commun (mêmes sens dans toutes les langues, traductions différentes) */
var COURSES = {
  en: { id:"en", nom:"Anglais", drapeau:"🇬🇧", ttsLang:"en-US", units:[
    _u("Les bases","#12b981",[
      {titre:"Salutations",words:[{fr:"bonjour",t:"hello"},{fr:"salut",t:"hi"},{fr:"au revoir",t:"goodbye"},{fr:"merci",t:"thank you"},{fr:"oui",t:"yes"},{fr:"non",t:"no"},{fr:"s'il te plaît",t:"please"},{fr:"pardon",t:"sorry"}]},
      {titre:"Les gens",words:[{fr:"homme",t:"man"},{fr:"femme",t:"woman"},{fr:"garçon",t:"boy"},{fr:"fille",t:"girl"},{fr:"ami",t:"friend"},{fr:"enfant",t:"child"},{fr:"nom",t:"name"},{fr:"moi",t:"me"}],phrases:[{fr:"je suis un homme",t:"i am a man"},{fr:"elle est une femme",t:"she is a woman"}]},
      {titre:"Mots utiles",words:[{fr:"eau",t:"water"},{fr:"pain",t:"bread"},{fr:"maison",t:"house"},{fr:"livre",t:"book"},{fr:"chien",t:"dog"},{fr:"chat",t:"cat"}],phrases:[{fr:"le chat boit de l'eau",t:"the cat drinks water"}]} ]),
    _u("Nourriture","#f6b73c",[
      {titre:"À boire",words:[{fr:"café",t:"coffee"},{fr:"lait",t:"milk"},{fr:"vin",t:"wine"},{fr:"thé",t:"tea"},{fr:"jus",t:"juice"},{fr:"bière",t:"beer"}],phrases:[{fr:"je bois du café",t:"i drink coffee"}]},
      {titre:"À manger",words:[{fr:"pomme",t:"apple"},{fr:"fromage",t:"cheese"},{fr:"poisson",t:"fish"},{fr:"viande",t:"meat"},{fr:"riz",t:"rice"},{fr:"œuf",t:"egg"},{fr:"gâteau",t:"cake"},{fr:"soupe",t:"soup"}],phrases:[{fr:"je mange une pomme",t:"i eat an apple"},{fr:"nous mangeons du riz",t:"we eat rice"}]} ]),
    _u("Voyage","#7c3aed",[
      {titre:"En ville",words:[{fr:"gare",t:"station"},{fr:"hôtel",t:"hotel"},{fr:"rue",t:"street"},{fr:"gauche",t:"left"},{fr:"droite",t:"right"},{fr:"ici",t:"here"}],phrases:[{fr:"où est la gare",t:"where is the station"}]},
      {titre:"Phrases clés",words:[{fr:"grand",t:"big"},{fr:"petit",t:"small"},{fr:"nouveau",t:"new"},{fr:"beau",t:"beautiful"},{fr:"bon",t:"good"},{fr:"vite",t:"fast"}],phrases:[{fr:"la maison est grande",t:"the house is big"},{fr:"c'est un bon café",t:"it is a good coffee"}]} ]) ]},

  it: { id:"it", nom:"Italien", drapeau:"🇮🇹", ttsLang:"it-IT", units:[
    _u("Le basi","#12b981",[
      {titre:"Salutations",words:[{fr:"bonjour",t:"buongiorno"},{fr:"salut",t:"ciao"},{fr:"au revoir",t:"arrivederci"},{fr:"merci",t:"grazie"},{fr:"oui",t:"sì"},{fr:"non",t:"no"},{fr:"s'il te plaît",t:"per favore"},{fr:"pardon",t:"scusa"}]},
      {titre:"Les gens",words:[{fr:"homme",t:"uomo"},{fr:"femme",t:"donna"},{fr:"garçon",t:"ragazzo"},{fr:"fille",t:"ragazza"},{fr:"ami",t:"amico"},{fr:"enfant",t:"bambino"},{fr:"nom",t:"nome"},{fr:"moi",t:"io"}],phrases:[{fr:"je suis un homme",t:"io sono un uomo"},{fr:"elle est une femme",t:"lei è una donna"}]},
      {titre:"Mots utiles",words:[{fr:"eau",t:"acqua"},{fr:"pain",t:"pane"},{fr:"maison",t:"casa"},{fr:"livre",t:"libro"},{fr:"chien",t:"cane"},{fr:"chat",t:"gatto"}],phrases:[{fr:"le chat boit de l'eau",t:"il gatto beve acqua"}]} ]),
    _u("Cibo","#f6b73c",[
      {titre:"À boire",words:[{fr:"café",t:"caffè"},{fr:"lait",t:"latte"},{fr:"vin",t:"vino"},{fr:"thé",t:"tè"},{fr:"jus",t:"succo"},{fr:"bière",t:"birra"}],phrases:[{fr:"je bois du café",t:"io bevo caffè"}]},
      {titre:"À manger",words:[{fr:"pomme",t:"mela"},{fr:"fromage",t:"formaggio"},{fr:"poisson",t:"pesce"},{fr:"viande",t:"carne"},{fr:"riz",t:"riso"},{fr:"œuf",t:"uovo"},{fr:"gâteau",t:"torta"},{fr:"soupe",t:"zuppa"}],phrases:[{fr:"je mange une pomme",t:"io mangio una mela"},{fr:"nous mangeons du riz",t:"noi mangiamo riso"}]} ]),
    _u("Viaggio","#7c3aed",[
      {titre:"En ville",words:[{fr:"gare",t:"stazione"},{fr:"hôtel",t:"albergo"},{fr:"rue",t:"strada"},{fr:"gauche",t:"sinistra"},{fr:"droite",t:"destra"},{fr:"ici",t:"qui"}],phrases:[{fr:"où est la gare",t:"dov'è la stazione"}]},
      {titre:"Phrases clés",words:[{fr:"grand",t:"grande"},{fr:"petit",t:"piccolo"},{fr:"nouveau",t:"nuovo"},{fr:"beau",t:"bello"},{fr:"bon",t:"buono"},{fr:"vite",t:"veloce"}],phrases:[{fr:"la maison est grande",t:"la casa è grande"},{fr:"c'est un bon café",t:"è un buon caffè"}]} ]) ]},

  es: { id:"es", nom:"Espagnol", drapeau:"🇪🇸", ttsLang:"es-ES", units:[
    _u("Lo básico","#12b981",[
      {titre:"Salutations",words:[{fr:"bonjour",t:"buenos días"},{fr:"salut",t:"hola"},{fr:"au revoir",t:"adiós"},{fr:"merci",t:"gracias"},{fr:"oui",t:"sí"},{fr:"non",t:"no"},{fr:"s'il te plaît",t:"por favor"},{fr:"pardon",t:"perdón"}]},
      {titre:"Les gens",words:[{fr:"homme",t:"hombre"},{fr:"femme",t:"mujer"},{fr:"garçon",t:"niño"},{fr:"fille",t:"niña"},{fr:"ami",t:"amigo"},{fr:"enfant",t:"hijo"},{fr:"nom",t:"nombre"},{fr:"moi",t:"yo"}],phrases:[{fr:"je suis un homme",t:"yo soy un hombre"},{fr:"elle est une femme",t:"ella es una mujer"}]},
      {titre:"Mots utiles",words:[{fr:"eau",t:"agua"},{fr:"pain",t:"pan"},{fr:"maison",t:"casa"},{fr:"livre",t:"libro"},{fr:"chien",t:"perro"},{fr:"chat",t:"gato"}],phrases:[{fr:"le chat boit de l'eau",t:"el gato bebe agua"}]} ]),
    _u("Comida","#f6b73c",[
      {titre:"À boire",words:[{fr:"café",t:"café"},{fr:"lait",t:"leche"},{fr:"vin",t:"vino"},{fr:"thé",t:"té"},{fr:"jus",t:"zumo"},{fr:"bière",t:"cerveza"}],phrases:[{fr:"je bois du café",t:"yo bebo café"}]},
      {titre:"À manger",words:[{fr:"pomme",t:"manzana"},{fr:"fromage",t:"queso"},{fr:"poisson",t:"pescado"},{fr:"viande",t:"carne"},{fr:"riz",t:"arroz"},{fr:"œuf",t:"huevo"},{fr:"gâteau",t:"pastel"},{fr:"soupe",t:"sopa"}],phrases:[{fr:"je mange une pomme",t:"yo como una manzana"},{fr:"nous mangeons du riz",t:"nosotros comemos arroz"}]} ]),
    _u("Viaje","#7c3aed",[
      {titre:"En ville",words:[{fr:"gare",t:"estación"},{fr:"hôtel",t:"hotel"},{fr:"rue",t:"calle"},{fr:"gauche",t:"izquierda"},{fr:"droite",t:"derecha"},{fr:"ici",t:"aquí"}],phrases:[{fr:"où est la gare",t:"dónde está la estación"}]},
      {titre:"Phrases clés",words:[{fr:"grand",t:"grande"},{fr:"petit",t:"pequeño"},{fr:"nouveau",t:"nuevo"},{fr:"beau",t:"bonito"},{fr:"bon",t:"bueno"},{fr:"vite",t:"rápido"}],phrases:[{fr:"la maison est grande",t:"la casa es grande"},{fr:"c'est un bon café",t:"es un buen café"}]} ]) ]},

  de: { id:"de", nom:"Allemand", drapeau:"🇩🇪", ttsLang:"de-DE", units:[
    _u("Grundlagen","#12b981",[
      {titre:"Salutations",words:[{fr:"bonjour",t:"guten Tag"},{fr:"salut",t:"hallo"},{fr:"au revoir",t:"auf Wiedersehen"},{fr:"merci",t:"danke"},{fr:"oui",t:"ja"},{fr:"non",t:"nein"},{fr:"s'il te plaît",t:"bitte"},{fr:"pardon",t:"Entschuldigung"}]},
      {titre:"Les gens",words:[{fr:"homme",t:"Mann"},{fr:"femme",t:"Frau"},{fr:"garçon",t:"Junge"},{fr:"fille",t:"Mädchen"},{fr:"ami",t:"Freund"},{fr:"enfant",t:"Kind"},{fr:"nom",t:"Name"},{fr:"moi",t:"ich"}],phrases:[{fr:"je suis un homme",t:"ich bin ein Mann"},{fr:"elle est une femme",t:"sie ist eine Frau"}]},
      {titre:"Mots utiles",words:[{fr:"eau",t:"Wasser"},{fr:"pain",t:"Brot"},{fr:"maison",t:"Haus"},{fr:"livre",t:"Buch"},{fr:"chien",t:"Hund"},{fr:"chat",t:"Katze"}],phrases:[{fr:"le chat boit de l'eau",t:"die Katze trinkt Wasser"}]} ]),
    _u("Essen","#f6b73c",[
      {titre:"À boire",words:[{fr:"café",t:"Kaffee"},{fr:"lait",t:"Milch"},{fr:"vin",t:"Wein"},{fr:"thé",t:"Tee"},{fr:"jus",t:"Saft"},{fr:"bière",t:"Bier"}],phrases:[{fr:"je bois du café",t:"ich trinke Kaffee"}]},
      {titre:"À manger",words:[{fr:"pomme",t:"Apfel"},{fr:"fromage",t:"Käse"},{fr:"poisson",t:"Fisch"},{fr:"viande",t:"Fleisch"},{fr:"riz",t:"Reis"},{fr:"œuf",t:"Ei"},{fr:"gâteau",t:"Kuchen"},{fr:"soupe",t:"Suppe"}],phrases:[{fr:"je mange une pomme",t:"ich esse einen Apfel"},{fr:"nous mangeons du riz",t:"wir essen Reis"}]} ]),
    _u("Reise","#7c3aed",[
      {titre:"En ville",words:[{fr:"gare",t:"Bahnhof"},{fr:"hôtel",t:"Hotel"},{fr:"rue",t:"Straße"},{fr:"gauche",t:"links"},{fr:"droite",t:"rechts"},{fr:"ici",t:"hier"}],phrases:[{fr:"où est la gare",t:"wo ist der Bahnhof"}]},
      {titre:"Phrases clés",words:[{fr:"grand",t:"groß"},{fr:"petit",t:"klein"},{fr:"nouveau",t:"neu"},{fr:"beau",t:"schön"},{fr:"bon",t:"gut"},{fr:"vite",t:"schnell"}],phrases:[{fr:"la maison est grande",t:"das Haus ist groß"},{fr:"c'est un bon café",t:"das ist ein guter Kaffee"}]} ]) ]},

  pt: { id:"pt", nom:"Portugais", drapeau:"🇵🇹", ttsLang:"pt-PT", units:[
    _u("O básico","#12b981",[
      {titre:"Salutations",words:[{fr:"bonjour",t:"bom dia"},{fr:"salut",t:"olá"},{fr:"au revoir",t:"adeus"},{fr:"merci",t:"obrigado"},{fr:"oui",t:"sim"},{fr:"non",t:"não"},{fr:"s'il te plaît",t:"por favor"},{fr:"pardon",t:"desculpa"}]},
      {titre:"Les gens",words:[{fr:"homme",t:"homem"},{fr:"femme",t:"mulher"},{fr:"garçon",t:"menino"},{fr:"fille",t:"menina"},{fr:"ami",t:"amigo"},{fr:"enfant",t:"criança"},{fr:"nom",t:"nome"},{fr:"moi",t:"eu"}],phrases:[{fr:"je suis un homme",t:"eu sou um homem"},{fr:"elle est une femme",t:"ela é uma mulher"}]},
      {titre:"Mots utiles",words:[{fr:"eau",t:"água"},{fr:"pain",t:"pão"},{fr:"maison",t:"casa"},{fr:"livre",t:"livro"},{fr:"chien",t:"cão"},{fr:"chat",t:"gato"}],phrases:[{fr:"le chat boit de l'eau",t:"o gato bebe água"}]} ]),
    _u("Comida","#f6b73c",[
      {titre:"À boire",words:[{fr:"café",t:"café"},{fr:"lait",t:"leite"},{fr:"vin",t:"vinho"},{fr:"thé",t:"chá"},{fr:"jus",t:"sumo"},{fr:"bière",t:"cerveja"}],phrases:[{fr:"je bois du café",t:"eu bebo café"}]},
      {titre:"À manger",words:[{fr:"pomme",t:"maçã"},{fr:"fromage",t:"queijo"},{fr:"poisson",t:"peixe"},{fr:"viande",t:"carne"},{fr:"riz",t:"arroz"},{fr:"œuf",t:"ovo"},{fr:"gâteau",t:"bolo"},{fr:"soupe",t:"sopa"}],phrases:[{fr:"je mange une pomme",t:"eu como uma maçã"},{fr:"nous mangeons du riz",t:"nós comemos arroz"}]} ]),
    _u("Viagem","#7c3aed",[
      {titre:"En ville",words:[{fr:"gare",t:"estação"},{fr:"hôtel",t:"hotel"},{fr:"rue",t:"rua"},{fr:"gauche",t:"esquerda"},{fr:"droite",t:"direita"},{fr:"ici",t:"aqui"}],phrases:[{fr:"où est la gare",t:"onde é a estação"}]},
      {titre:"Phrases clés",words:[{fr:"grand",t:"grande"},{fr:"petit",t:"pequeno"},{fr:"nouveau",t:"novo"},{fr:"beau",t:"bonito"},{fr:"bon",t:"bom"},{fr:"vite",t:"rápido"}],phrases:[{fr:"la maison est grande",t:"a casa é grande"},{fr:"c'est un bon café",t:"é um bom café"}]} ]) ]},

  nl: { id:"nl", nom:"Néerlandais", drapeau:"🇳🇱", ttsLang:"nl-NL", units:[
    _u("De basis","#12b981",[
      {titre:"Salutations",words:[{fr:"bonjour",t:"goedendag"},{fr:"salut",t:"hallo"},{fr:"au revoir",t:"tot ziens"},{fr:"merci",t:"dank je"},{fr:"oui",t:"ja"},{fr:"non",t:"nee"},{fr:"s'il te plaît",t:"alsjeblieft"},{fr:"pardon",t:"sorry"}]},
      {titre:"Les gens",words:[{fr:"homme",t:"man"},{fr:"femme",t:"vrouw"},{fr:"garçon",t:"jongen"},{fr:"fille",t:"meisje"},{fr:"ami",t:"vriend"},{fr:"enfant",t:"kind"},{fr:"nom",t:"naam"},{fr:"moi",t:"ik"}],phrases:[{fr:"je suis un homme",t:"ik ben een man"},{fr:"elle est une femme",t:"zij is een vrouw"}]},
      {titre:"Mots utiles",words:[{fr:"eau",t:"water"},{fr:"pain",t:"brood"},{fr:"maison",t:"huis"},{fr:"livre",t:"boek"},{fr:"chien",t:"hond"},{fr:"chat",t:"kat"}],phrases:[{fr:"le chat boit de l'eau",t:"de kat drinkt water"}]} ]),
    _u("Eten","#f6b73c",[
      {titre:"À boire",words:[{fr:"café",t:"koffie"},{fr:"lait",t:"melk"},{fr:"vin",t:"wijn"},{fr:"thé",t:"thee"},{fr:"jus",t:"sap"},{fr:"bière",t:"bier"}],phrases:[{fr:"je bois du café",t:"ik drink koffie"}]},
      {titre:"À manger",words:[{fr:"pomme",t:"appel"},{fr:"fromage",t:"kaas"},{fr:"poisson",t:"vis"},{fr:"viande",t:"vlees"},{fr:"riz",t:"rijst"},{fr:"œuf",t:"ei"},{fr:"gâteau",t:"taart"},{fr:"soupe",t:"soep"}],phrases:[{fr:"je mange une pomme",t:"ik eet een appel"},{fr:"nous mangeons du riz",t:"wij eten rijst"}]} ]),
    _u("Reizen","#7c3aed",[
      {titre:"En ville",words:[{fr:"gare",t:"station"},{fr:"hôtel",t:"hotel"},{fr:"rue",t:"straat"},{fr:"gauche",t:"links"},{fr:"droite",t:"rechts"},{fr:"ici",t:"hier"}],phrases:[{fr:"où est la gare",t:"waar is het station"}]},
      {titre:"Phrases clés",words:[{fr:"grand",t:"groot"},{fr:"petit",t:"klein"},{fr:"nouveau",t:"nieuw"},{fr:"beau",t:"mooi"},{fr:"bon",t:"goed"},{fr:"vite",t:"snel"}],phrases:[{fr:"la maison est grande",t:"het huis is groot"},{fr:"c'est un bon café",t:"het is een goede koffie"}]} ]) ]}
};
