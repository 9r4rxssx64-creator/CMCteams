/* KDMC Lingua — contenu des cours (100% original, aucun contenu tiers)
   Format : COURSES[langue] = { id, nom, drapeau, ttsLang, units[] }
   Chaque unité : { titre, couleur, lessons[] }
   Chaque leçon : { titre, words:[{fr,t}], phrases?:[{fr,t}] }
   fr = français (langue source) · t = langue cible               */
var COURSES = {
  en: {
    id: "en", nom: "Anglais", drapeau: "🇬🇧", ttsLang: "en-US",
    units: [
      { titre: "Les bases", couleur: "#12b981", lessons: [
        { titre: "Salutations", words: [
          {fr:"bonjour", t:"hello"},{fr:"salut", t:"hi"},{fr:"au revoir", t:"goodbye"},
          {fr:"merci", t:"thank you"},{fr:"oui", t:"yes"},{fr:"non", t:"no"},
          {fr:"s'il te plaît", t:"please"},{fr:"pardon", t:"sorry"} ] },
        { titre: "Les gens", words: [
          {fr:"homme", t:"man"},{fr:"femme", t:"woman"},{fr:"garçon", t:"boy"},
          {fr:"fille", t:"girl"},{fr:"ami", t:"friend"},{fr:"enfant", t:"child"},
          {fr:"nom", t:"name"},{fr:"moi", t:"me"} ],
          phrases: [ {fr:"je suis un homme", t:"i am a man"},{fr:"elle est une femme", t:"she is a woman"} ] },
        { titre: "Mots utiles", words: [
          {fr:"eau", t:"water"},{fr:"pain", t:"bread"},{fr:"maison", t:"house"},
          {fr:"livre", t:"book"},{fr:"chien", t:"dog"},{fr:"chat", t:"cat"} ],
          phrases: [ {fr:"le chat boit de l'eau", t:"the cat drinks water"} ] }
      ]},
      { titre: "Nourriture", couleur: "#f6b73c", lessons: [
        { titre: "À boire", words: [
          {fr:"café", t:"coffee"},{fr:"lait", t:"milk"},{fr:"vin", t:"wine"},
          {fr:"thé", t:"tea"},{fr:"jus", t:"juice"},{fr:"bière", t:"beer"} ],
          phrases: [ {fr:"je bois du café", t:"i drink coffee"} ] },
        { titre: "À manger", words: [
          {fr:"pomme", t:"apple"},{fr:"fromage", t:"cheese"},{fr:"poisson", t:"fish"},
          {fr:"viande", t:"meat"},{fr:"riz", t:"rice"},{fr:"œuf", t:"egg"},
          {fr:"gâteau", t:"cake"},{fr:"soupe", t:"soup"} ],
          phrases: [ {fr:"je mange une pomme", t:"i eat an apple"},{fr:"nous mangeons du riz", t:"we eat rice"} ] }
      ]},
      { titre: "Voyage", couleur: "#7c3aed", lessons: [
        { titre: "En ville", words: [
          {fr:"gare", t:"station"},{fr:"hôtel", t:"hotel"},{fr:"rue", t:"street"},
          {fr:"gauche", t:"left"},{fr:"droite", t:"right"},{fr:"ici", t:"here"} ],
          phrases: [ {fr:"où est la gare", t:"where is the station"} ] },
        { titre: "Phrases clés", words: [
          {fr:"grand", t:"big"},{fr:"petit", t:"small"},{fr:"nouveau", t:"new"},
          {fr:"beau", t:"beautiful"},{fr:"bon", t:"good"},{fr:"vite", t:"fast"} ],
          phrases: [ {fr:"la maison est grande", t:"the house is big"},{fr:"c'est un bon café", t:"it is a good coffee"} ] }
      ]}
    ]
  },
  it: {
    id: "it", nom: "Italien", drapeau: "🇮🇹", ttsLang: "it-IT",
    units: [
      { titre: "Le basi", couleur: "#12b981", lessons: [
        { titre: "Salutations", words: [
          {fr:"bonjour", t:"buongiorno"},{fr:"salut", t:"ciao"},{fr:"au revoir", t:"arrivederci"},
          {fr:"merci", t:"grazie"},{fr:"oui", t:"sì"},{fr:"non", t:"no"},
          {fr:"s'il te plaît", t:"per favore"},{fr:"pardon", t:"scusa"} ] },
        { titre: "Les gens", words: [
          {fr:"homme", t:"uomo"},{fr:"femme", t:"donna"},{fr:"garçon", t:"ragazzo"},
          {fr:"fille", t:"ragazza"},{fr:"ami", t:"amico"},{fr:"enfant", t:"bambino"},
          {fr:"nom", t:"nome"},{fr:"moi", t:"io"} ],
          phrases: [ {fr:"je suis un homme", t:"io sono un uomo"},{fr:"elle est une femme", t:"lei è una donna"} ] },
        { titre: "Mots utiles", words: [
          {fr:"eau", t:"acqua"},{fr:"pain", t:"pane"},{fr:"maison", t:"casa"},
          {fr:"livre", t:"libro"},{fr:"chien", t:"cane"},{fr:"chat", t:"gatto"} ],
          phrases: [ {fr:"le chat boit de l'eau", t:"il gatto beve acqua"} ] }
      ]},
      { titre: "Cibo", couleur: "#f6b73c", lessons: [
        { titre: "À boire", words: [
          {fr:"café", t:"caffè"},{fr:"lait", t:"latte"},{fr:"vin", t:"vino"},
          {fr:"thé", t:"tè"},{fr:"jus", t:"succo"},{fr:"bière", t:"birra"} ],
          phrases: [ {fr:"je bois du café", t:"io bevo caffè"} ] },
        { titre: "À manger", words: [
          {fr:"pomme", t:"mela"},{fr:"fromage", t:"formaggio"},{fr:"poisson", t:"pesce"},
          {fr:"viande", t:"carne"},{fr:"riz", t:"riso"},{fr:"œuf", t:"uovo"},
          {fr:"gâteau", t:"torta"},{fr:"soupe", t:"zuppa"} ],
          phrases: [ {fr:"je mange une pomme", t:"io mangio una mela"},{fr:"nous mangeons du riz", t:"noi mangiamo riso"} ] }
      ]},
      { titre: "Viaggio", couleur: "#7c3aed", lessons: [
        { titre: "En ville", words: [
          {fr:"gare", t:"stazione"},{fr:"hôtel", t:"albergo"},{fr:"rue", t:"strada"},
          {fr:"gauche", t:"sinistra"},{fr:"droite", t:"destra"},{fr:"ici", t:"qui"} ],
          phrases: [ {fr:"où est la gare", t:"dov'è la stazione"} ] },
        { titre: "Phrases clés", words: [
          {fr:"grand", t:"grande"},{fr:"petit", t:"piccolo"},{fr:"nouveau", t:"nuovo"},
          {fr:"beau", t:"bello"},{fr:"bon", t:"buono"},{fr:"vite", t:"veloce"} ],
          phrases: [ {fr:"la maison est grande", t:"la casa è grande"},{fr:"c'est un bon café", t:"è un buon caffè"} ] }
      ]}
    ]
  },
  es: {
    id: "es", nom: "Espagnol", drapeau: "🇪🇸", ttsLang: "es-ES",
    units: [
      { titre: "Lo básico", couleur: "#12b981", lessons: [
        { titre: "Salutations", words: [
          {fr:"bonjour", t:"buenos días"},{fr:"salut", t:"hola"},{fr:"au revoir", t:"adiós"},
          {fr:"merci", t:"gracias"},{fr:"oui", t:"sí"},{fr:"non", t:"no"},
          {fr:"s'il te plaît", t:"por favor"},{fr:"pardon", t:"perdón"} ] },
        { titre: "Les gens", words: [
          {fr:"homme", t:"hombre"},{fr:"femme", t:"mujer"},{fr:"garçon", t:"niño"},
          {fr:"fille", t:"niña"},{fr:"ami", t:"amigo"},{fr:"enfant", t:"hijo"},
          {fr:"nom", t:"nombre"},{fr:"moi", t:"yo"} ],
          phrases: [ {fr:"je suis un homme", t:"yo soy un hombre"},{fr:"elle est une femme", t:"ella es una mujer"} ] },
        { titre: "Mots utiles", words: [
          {fr:"eau", t:"agua"},{fr:"pain", t:"pan"},{fr:"maison", t:"casa"},
          {fr:"livre", t:"libro"},{fr:"chien", t:"perro"},{fr:"chat", t:"gato"} ],
          phrases: [ {fr:"le chat boit de l'eau", t:"el gato bebe agua"} ] }
      ]},
      { titre: "Comida", couleur: "#f6b73c", lessons: [
        { titre: "À boire", words: [
          {fr:"café", t:"café"},{fr:"lait", t:"leche"},{fr:"vin", t:"vino"},
          {fr:"thé", t:"té"},{fr:"jus", t:"zumo"},{fr:"bière", t:"cerveza"} ],
          phrases: [ {fr:"je bois du café", t:"yo bebo café"} ] },
        { titre: "À manger", words: [
          {fr:"pomme", t:"manzana"},{fr:"fromage", t:"queso"},{fr:"poisson", t:"pescado"},
          {fr:"viande", t:"carne"},{fr:"riz", t:"arroz"},{fr:"œuf", t:"huevo"},
          {fr:"gâteau", t:"pastel"},{fr:"soupe", t:"sopa"} ],
          phrases: [ {fr:"je mange une pomme", t:"yo como una manzana"},{fr:"nous mangeons du riz", t:"nosotros comemos arroz"} ] }
      ]},
      { titre: "Viaje", couleur: "#7c3aed", lessons: [
        { titre: "En ville", words: [
          {fr:"gare", t:"estación"},{fr:"hôtel", t:"hotel"},{fr:"rue", t:"calle"},
          {fr:"gauche", t:"izquierda"},{fr:"droite", t:"derecha"},{fr:"ici", t:"aquí"} ],
          phrases: [ {fr:"où est la gare", t:"dónde está la estación"} ] },
        { titre: "Phrases clés", words: [
          {fr:"grand", t:"grande"},{fr:"petit", t:"pequeño"},{fr:"nouveau", t:"nuevo"},
          {fr:"beau", t:"bonito"},{fr:"bon", t:"bueno"},{fr:"vite", t:"rápido"} ],
          phrases: [ {fr:"la maison est grande", t:"la casa es grande"},{fr:"c'est un bon café", t:"es un buen café"} ] }
      ]}
    ]
  }
};
