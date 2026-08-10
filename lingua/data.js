/* KDMC Lingua — contenu (100% original, aucun contenu tiers).
   Architecture : un CURRICULUM commun (par sens, en français) + un LEXIQUE par langue.
   COURSES est généré automatiquement → ajouter du contenu = éditer CURRICULUM + LEX. */

var LANGS = ["en","it","es","de","pt","nl"];
var LMETA = {
  en:{nom:"Anglais",   drapeau:"🇬🇧", tts:"en-US"},
  it:{nom:"Italien",   drapeau:"🇮🇹", tts:"it-IT"},
  es:{nom:"Espagnol",  drapeau:"🇪🇸", tts:"es-ES"},
  de:{nom:"Allemand",  drapeau:"🇩🇪", tts:"de-DE"},
  pt:{nom:"Portugais", drapeau:"🇵🇹", tts:"pt-PT"},
  nl:{nom:"Néerlandais",drapeau:"🇳🇱",tts:"nl-NL"}
};

/* --- Programme : unités → leçons → mots (fr) + phrases (fr) --- */
var CURRICULUM = [
  {t:"Les bases 🌱", c:"#12b981", L:[
    {t:"Salutations", w:["bonjour","salut","au revoir","merci","oui","non","s'il te plaît","pardon"]},
    {t:"Les gens", w:["homme","femme","garçon","fille","ami","enfant","nom","moi"], p:["je suis un homme","elle est une femme"]},
    {t:"Mots utiles", w:["eau","pain","maison","livre","chien","chat"], p:["le chat boit de l'eau"]} ]},
  {t:"Nourriture 🍎", c:"#f6b73c", L:[
    {t:"À boire", w:["café","lait","vin","thé","jus","bière"], p:["je bois du café"]},
    {t:"À manger", w:["pomme","fromage","poisson","viande","riz","œuf","gâteau","soupe"], p:["je mange une pomme","nous mangeons du riz"]} ]},
  {t:"Les nombres 🔢", c:"#3b82f6", L:[
    {t:"De 0 à 5", w:["zéro","un","deux","trois","quatre","cinq"]},
    {t:"De 6 à 100", w:["six","sept","huit","neuf","dix","cent"], p:["j'ai deux chats","trois pommes"]} ]},
  {t:"La famille 👪", c:"#ec4899", L:[
    {t:"Les proches", w:["mère","père","frère","sœur"]},
    {t:"La famille", w:["grand-mère","grand-père","bébé","famille"]} ]},
  {t:"Les couleurs 🎨", c:"#8b5cf6", L:[
    {t:"Couleurs vives", w:["rouge","bleu","vert","jaune"], p:["une fleur rouge"]},
    {t:"Autres couleurs", w:["noir","blanc","orange","rose"], p:["le chat est noir"]} ]},
  {t:"Les animaux 🐾", c:"#14b8a6", L:[
    {t:"À la ferme", w:["cheval","oiseau","vache","poule"]},
    {t:"Autres animaux", w:["cochon","lapin","mouton","souris"]} ]},
  {t:"Le temps ⏰", c:"#f97316", L:[
    {t:"Les moments", w:["jour","nuit","matin","soir"]},
    {t:"Les durées", w:["semaine","mois","année","heure","minute"]},
    {t:"Les repères", w:["aujourd'hui","demain","hier"]} ]},
  {t:"Voyage ✈️", c:"#7c3aed", L:[
    {t:"En ville", w:["gare","hôtel","rue","gauche","droite","ici"], p:["où est la gare"]},
    {t:"Décrire", w:["grand","petit","nouveau","beau","bon","vite"], p:["la maison est grande","c'est un bon café"]} ]},
  {t:"À la maison 🏠", c:"#0ea5e9", L:[
    {t:"Les objets", w:["table","chaise","lit","porte","fenêtre","clé","téléphone","lampe"], p:["nous avons une maison"]} ]},
  {t:"Les vêtements 👕", c:"#e11d48", L:[
    {t:"Les habits", w:["chemise","pantalon","chaussures","robe","chapeau","manteau"]} ]},
  {t:"La nature 🌿", c:"#22c55e", L:[
    {t:"Dehors", w:["soleil","lune","mer","montagne"], p:["le soleil est grand"]},
    {t:"Le paysage", w:["arbre","fleur","ciel","plage"]} ]},
  {t:"Phrases 💬", c:"#a855f7", L:[
    {t:"Les verbes", w:["oui","non","bon"], p:["je parle","tu vas","il a un chien","nous avons une maison","j'aime le café"]} ]}
];

/* --- Lexique par langue : fr → traduction (mots ET phrases) --- */
var LEX = {
  en:{ "bonjour":"hello","salut":"hi","au revoir":"goodbye","merci":"thank you","oui":"yes","non":"no","s'il te plaît":"please","pardon":"sorry",
    "homme":"man","femme":"woman","garçon":"boy","fille":"girl","ami":"friend","enfant":"child","nom":"name","moi":"me",
    "eau":"water","pain":"bread","maison":"house","livre":"book","chien":"dog","chat":"cat",
    "café":"coffee","lait":"milk","vin":"wine","thé":"tea","jus":"juice","bière":"beer",
    "pomme":"apple","fromage":"cheese","poisson":"fish","viande":"meat","riz":"rice","œuf":"egg","gâteau":"cake","soupe":"soup",
    "zéro":"zero","un":"one","deux":"two","trois":"three","quatre":"four","cinq":"five","six":"six","sept":"seven","huit":"eight","neuf":"nine","dix":"ten","cent":"hundred",
    "mère":"mother","père":"father","frère":"brother","sœur":"sister","grand-mère":"grandmother","grand-père":"grandfather","bébé":"baby","famille":"family",
    "rouge":"red","bleu":"blue","vert":"green","jaune":"yellow","noir":"black","blanc":"white","orange":"orange","rose":"pink",
    "cheval":"horse","oiseau":"bird","vache":"cow","poule":"hen","cochon":"pig","lapin":"rabbit","mouton":"sheep","souris":"mouse",
    "jour":"day","nuit":"night","matin":"morning","soir":"evening","semaine":"week","mois":"month","année":"year","heure":"hour","minute":"minute","aujourd'hui":"today","demain":"tomorrow","hier":"yesterday",
    "gare":"station","hôtel":"hotel","rue":"street","gauche":"left","droite":"right","ici":"here","grand":"big","petit":"small","nouveau":"new","beau":"beautiful","bon":"good","vite":"fast",
    "table":"table","chaise":"chair","lit":"bed","porte":"door","fenêtre":"window","clé":"key","téléphone":"phone","lampe":"lamp",
    "chemise":"shirt","pantalon":"trousers","chaussures":"shoes","robe":"dress","chapeau":"hat","manteau":"coat",
    "soleil":"sun","lune":"moon","mer":"sea","montagne":"mountain","arbre":"tree","fleur":"flower","ciel":"sky","plage":"beach",
    "je suis un homme":"i am a man","elle est une femme":"she is a woman","le chat boit de l'eau":"the cat drinks water","je bois du café":"i drink coffee","je mange une pomme":"i eat an apple","nous mangeons du riz":"we eat rice","où est la gare":"where is the station","la maison est grande":"the house is big","c'est un bon café":"it is a good coffee","j'ai deux chats":"i have two cats","trois pommes":"three apples","le chat est noir":"the cat is black","une fleur rouge":"a red flower","je parle":"i speak","tu vas":"you go","il a un chien":"he has a dog","nous avons une maison":"we have a house","le soleil est grand":"the sun is big","j'aime le café":"i like coffee" },

  it:{ "bonjour":"buongiorno","salut":"ciao","au revoir":"arrivederci","merci":"grazie","oui":"sì","non":"no","s'il te plaît":"per favore","pardon":"scusa",
    "homme":"uomo","femme":"donna","garçon":"ragazzo","fille":"ragazza","ami":"amico","enfant":"bambino","nom":"nome","moi":"io",
    "eau":"acqua","pain":"pane","maison":"casa","livre":"libro","chien":"cane","chat":"gatto",
    "café":"caffè","lait":"latte","vin":"vino","thé":"tè","jus":"succo","bière":"birra",
    "pomme":"mela","fromage":"formaggio","poisson":"pesce","viande":"carne","riz":"riso","œuf":"uovo","gâteau":"torta","soupe":"zuppa",
    "zéro":"zero","un":"uno","deux":"due","trois":"tre","quatre":"quattro","cinq":"cinque","six":"sei","sept":"sette","huit":"otto","neuf":"nove","dix":"dieci","cent":"cento",
    "mère":"madre","père":"padre","frère":"fratello","sœur":"sorella","grand-mère":"nonna","grand-père":"nonno","bébé":"bebè","famille":"famiglia",
    "rouge":"rosso","bleu":"blu","vert":"verde","jaune":"giallo","noir":"nero","blanc":"bianco","orange":"arancione","rose":"rosa",
    "cheval":"cavallo","oiseau":"uccello","vache":"mucca","poule":"gallina","cochon":"maiale","lapin":"coniglio","mouton":"pecora","souris":"topo",
    "jour":"giorno","nuit":"notte","matin":"mattina","soir":"sera","semaine":"settimana","mois":"mese","année":"anno","heure":"ora","minute":"minuto","aujourd'hui":"oggi","demain":"domani","hier":"ieri",
    "gare":"stazione","hôtel":"albergo","rue":"strada","gauche":"sinistra","droite":"destra","ici":"qui","grand":"grande","petit":"piccolo","nouveau":"nuovo","beau":"bello","bon":"buono","vite":"veloce",
    "table":"tavolo","chaise":"sedia","lit":"letto","porte":"porta","fenêtre":"finestra","clé":"chiave","téléphone":"telefono","lampe":"lampada",
    "chemise":"camicia","pantalon":"pantaloni","chaussures":"scarpe","robe":"vestito","chapeau":"cappello","manteau":"cappotto",
    "soleil":"sole","lune":"luna","mer":"mare","montagne":"montagna","arbre":"albero","fleur":"fiore","ciel":"cielo","plage":"spiaggia",
    "je suis un homme":"io sono un uomo","elle est une femme":"lei è una donna","le chat boit de l'eau":"il gatto beve acqua","je bois du café":"io bevo caffè","je mange une pomme":"io mangio una mela","nous mangeons du riz":"noi mangiamo riso","où est la gare":"dov'è la stazione","la maison est grande":"la casa è grande","c'est un bon café":"è un buon caffè","j'ai deux chats":"io ho due gatti","trois pommes":"tre mele","le chat est noir":"il gatto è nero","une fleur rouge":"un fiore rosso","je parle":"io parlo","tu vas":"tu vai","il a un chien":"lui ha un cane","nous avons une maison":"noi abbiamo una casa","le soleil est grand":"il sole è grande","j'aime le café":"mi piace il caffè" },

  es:{ "bonjour":"buenos días","salut":"hola","au revoir":"adiós","merci":"gracias","oui":"sí","non":"no","s'il te plaît":"por favor","pardon":"perdón",
    "homme":"hombre","femme":"mujer","garçon":"chico","fille":"chica","ami":"amigo","enfant":"niño","nom":"nombre","moi":"yo",
    "eau":"agua","pain":"pan","maison":"casa","livre":"libro","chien":"perro","chat":"gato",
    "café":"café","lait":"leche","vin":"vino","thé":"té","jus":"zumo","bière":"cerveza",
    "pomme":"manzana","fromage":"queso","poisson":"pescado","viande":"carne","riz":"arroz","œuf":"huevo","gâteau":"pastel","soupe":"sopa",
    "zéro":"cero","un":"uno","deux":"dos","trois":"tres","quatre":"cuatro","cinq":"cinco","six":"seis","sept":"siete","huit":"ocho","neuf":"nueve","dix":"diez","cent":"cien",
    "mère":"madre","père":"padre","frère":"hermano","sœur":"hermana","grand-mère":"abuela","grand-père":"abuelo","bébé":"bebé","famille":"familia",
    "rouge":"rojo","bleu":"azul","vert":"verde","jaune":"amarillo","noir":"negro","blanc":"blanco","orange":"naranja","rose":"rosa",
    "cheval":"caballo","oiseau":"pájaro","vache":"vaca","poule":"gallina","cochon":"cerdo","lapin":"conejo","mouton":"oveja","souris":"ratón",
    "jour":"día","nuit":"noche","matin":"mañana","soir":"tarde","semaine":"semana","mois":"mes","année":"año","heure":"hora","minute":"minuto","aujourd'hui":"hoy","demain":"mañana","hier":"ayer",
    "gare":"estación","hôtel":"hotel","rue":"calle","gauche":"izquierda","droite":"derecha","ici":"aquí","grand":"grande","petit":"pequeño","nouveau":"nuevo","beau":"bonito","bon":"bueno","vite":"rápido",
    "table":"mesa","chaise":"silla","lit":"cama","porte":"puerta","fenêtre":"ventana","clé":"llave","téléphone":"teléfono","lampe":"lámpara",
    "chemise":"camisa","pantalon":"pantalón","chaussures":"zapatos","robe":"vestido","chapeau":"sombrero","manteau":"abrigo",
    "soleil":"sol","lune":"luna","mer":"mar","montagne":"montaña","arbre":"árbol","fleur":"flor","ciel":"cielo","plage":"playa",
    "je suis un homme":"yo soy un hombre","elle est une femme":"ella es una mujer","le chat boit de l'eau":"el gato bebe agua","je bois du café":"yo bebo café","je mange une pomme":"yo como una manzana","nous mangeons du riz":"nosotros comemos arroz","où est la gare":"dónde está la estación","la maison est grande":"la casa es grande","c'est un bon café":"es un buen café","j'ai deux chats":"yo tengo dos gatos","trois pommes":"tres manzanas","le chat est noir":"el gato es negro","une fleur rouge":"una flor roja","je parle":"yo hablo","tu vas":"tú vas","il a un chien":"él tiene un perro","nous avons une maison":"nosotros tenemos una casa","le soleil est grand":"el sol es grande","j'aime le café":"me gusta el café" },

  de:{ "bonjour":"guten Tag","salut":"hallo","au revoir":"auf Wiedersehen","merci":"danke","oui":"ja","non":"nein","s'il te plaît":"bitte","pardon":"Entschuldigung",
    "homme":"Mann","femme":"Frau","garçon":"Junge","fille":"Mädchen","ami":"Freund","enfant":"Kind","nom":"Name","moi":"ich",
    "eau":"Wasser","pain":"Brot","maison":"Haus","livre":"Buch","chien":"Hund","chat":"Katze",
    "café":"Kaffee","lait":"Milch","vin":"Wein","thé":"Tee","jus":"Saft","bière":"Bier",
    "pomme":"Apfel","fromage":"Käse","poisson":"Fisch","viande":"Fleisch","riz":"Reis","œuf":"Ei","gâteau":"Kuchen","soupe":"Suppe",
    "zéro":"null","un":"eins","deux":"zwei","trois":"drei","quatre":"vier","cinq":"fünf","six":"sechs","sept":"sieben","huit":"acht","neuf":"neun","dix":"zehn","cent":"hundert",
    "mère":"Mutter","père":"Vater","frère":"Bruder","sœur":"Schwester","grand-mère":"Großmutter","grand-père":"Großvater","bébé":"Baby","famille":"Familie",
    "rouge":"rot","bleu":"blau","vert":"grün","jaune":"gelb","noir":"schwarz","blanc":"weiß","orange":"orange","rose":"rosa",
    "cheval":"Pferd","oiseau":"Vogel","vache":"Kuh","poule":"Henne","cochon":"Schwein","lapin":"Kaninchen","mouton":"Schaf","souris":"Maus",
    "jour":"Tag","nuit":"Nacht","matin":"Morgen","soir":"Abend","semaine":"Woche","mois":"Monat","année":"Jahr","heure":"Stunde","minute":"Minute","aujourd'hui":"heute","demain":"morgen","hier":"gestern",
    "gare":"Bahnhof","hôtel":"Hotel","rue":"Straße","gauche":"links","droite":"rechts","ici":"hier","grand":"groß","petit":"klein","nouveau":"neu","beau":"schön","bon":"gut","vite":"schnell",
    "table":"Tisch","chaise":"Stuhl","lit":"Bett","porte":"Tür","fenêtre":"Fenster","clé":"Schlüssel","téléphone":"Telefon","lampe":"Lampe",
    "chemise":"Hemd","pantalon":"Hose","chaussures":"Schuhe","robe":"Kleid","chapeau":"Hut","manteau":"Mantel",
    "soleil":"Sonne","lune":"Mond","mer":"Meer","montagne":"Berg","arbre":"Baum","fleur":"Blume","ciel":"Himmel","plage":"Strand",
    "je suis un homme":"ich bin ein Mann","elle est une femme":"sie ist eine Frau","le chat boit de l'eau":"die Katze trinkt Wasser","je bois du café":"ich trinke Kaffee","je mange une pomme":"ich esse einen Apfel","nous mangeons du riz":"wir essen Reis","où est la gare":"wo ist der Bahnhof","la maison est grande":"das Haus ist groß","c'est un bon café":"das ist ein guter Kaffee","j'ai deux chats":"ich habe zwei Katzen","trois pommes":"drei Äpfel","le chat est noir":"die Katze ist schwarz","une fleur rouge":"eine rote Blume","je parle":"ich spreche","tu vas":"du gehst","il a un chien":"er hat einen Hund","nous avons une maison":"wir haben ein Haus","le soleil est grand":"die Sonne ist groß","j'aime le café":"ich mag Kaffee" },

  pt:{ "bonjour":"bom dia","salut":"olá","au revoir":"adeus","merci":"obrigado","oui":"sim","non":"não","s'il te plaît":"por favor","pardon":"desculpa",
    "homme":"homem","femme":"mulher","garçon":"menino","fille":"menina","ami":"amigo","enfant":"criança","nom":"nome","moi":"eu",
    "eau":"água","pain":"pão","maison":"casa","livre":"livro","chien":"cão","chat":"gato",
    "café":"café","lait":"leite","vin":"vinho","thé":"chá","jus":"sumo","bière":"cerveja",
    "pomme":"maçã","fromage":"queijo","poisson":"peixe","viande":"carne","riz":"arroz","œuf":"ovo","gâteau":"bolo","soupe":"sopa",
    "zéro":"zero","un":"um","deux":"dois","trois":"três","quatre":"quatro","cinq":"cinco","six":"seis","sept":"sete","huit":"oito","neuf":"nove","dix":"dez","cent":"cem",
    "mère":"mãe","père":"pai","frère":"irmão","sœur":"irmã","grand-mère":"avó","grand-père":"avô","bébé":"bebé","famille":"família",
    "rouge":"vermelho","bleu":"azul","vert":"verde","jaune":"amarelo","noir":"preto","blanc":"branco","orange":"laranja","rose":"cor-de-rosa",
    "cheval":"cavalo","oiseau":"pássaro","vache":"vaca","poule":"galinha","cochon":"porco","lapin":"coelho","mouton":"ovelha","souris":"rato",
    "jour":"dia","nuit":"noite","matin":"manhã","soir":"tarde","semaine":"semana","mois":"mês","année":"ano","heure":"hora","minute":"minuto","aujourd'hui":"hoje","demain":"amanhã","hier":"ontem",
    "gare":"estação","hôtel":"hotel","rue":"rua","gauche":"esquerda","droite":"direita","ici":"aqui","grand":"grande","petit":"pequeno","nouveau":"novo","beau":"bonito","bon":"bom","vite":"rápido",
    "table":"mesa","chaise":"cadeira","lit":"cama","porte":"porta","fenêtre":"janela","clé":"chave","téléphone":"telefone","lampe":"lâmpada",
    "chemise":"camisa","pantalon":"calças","chaussures":"sapatos","robe":"vestido","chapeau":"chapéu","manteau":"casaco",
    "soleil":"sol","lune":"lua","mer":"mar","montagne":"montanha","arbre":"árvore","fleur":"flor","ciel":"céu","plage":"praia",
    "je suis un homme":"eu sou um homem","elle est une femme":"ela é uma mulher","le chat boit de l'eau":"o gato bebe água","je bois du café":"eu bebo café","je mange une pomme":"eu como uma maçã","nous mangeons du riz":"nós comemos arroz","où est la gare":"onde é a estação","la maison est grande":"a casa é grande","c'est un bon café":"é um bom café","j'ai deux chats":"eu tenho dois gatos","trois pommes":"três maçãs","le chat est noir":"o gato é preto","une fleur rouge":"uma flor vermelha","je parle":"eu falo","tu vas":"tu vais","il a un chien":"ele tem um cão","nous avons une maison":"nós temos uma casa","le soleil est grand":"o sol é grande","j'aime le café":"eu gosto de café" },

  nl:{ "bonjour":"goedendag","salut":"hallo","au revoir":"tot ziens","merci":"dank je","oui":"ja","non":"nee","s'il te plaît":"alsjeblieft","pardon":"sorry",
    "homme":"man","femme":"vrouw","garçon":"jongen","fille":"meisje","ami":"vriend","enfant":"kind","nom":"naam","moi":"ik",
    "eau":"water","pain":"brood","maison":"huis","livre":"boek","chien":"hond","chat":"kat",
    "café":"koffie","lait":"melk","vin":"wijn","thé":"thee","jus":"sap","bière":"bier",
    "pomme":"appel","fromage":"kaas","poisson":"vis","viande":"vlees","riz":"rijst","œuf":"ei","gâteau":"taart","soupe":"soep",
    "zéro":"nul","un":"één","deux":"twee","trois":"drie","quatre":"vier","cinq":"vijf","six":"zes","sept":"zeven","huit":"acht","neuf":"negen","dix":"tien","cent":"honderd",
    "mère":"moeder","père":"vader","frère":"broer","sœur":"zus","grand-mère":"oma","grand-père":"opa","bébé":"baby","famille":"familie",
    "rouge":"rood","bleu":"blauw","vert":"groen","jaune":"geel","noir":"zwart","blanc":"wit","orange":"oranje","rose":"roze",
    "cheval":"paard","oiseau":"vogel","vache":"koe","poule":"kip","cochon":"varken","lapin":"konijn","mouton":"schaap","souris":"muis",
    "jour":"dag","nuit":"nacht","matin":"ochtend","soir":"avond","semaine":"week","mois":"maand","année":"jaar","heure":"uur","minute":"minuut","aujourd'hui":"vandaag","demain":"morgen","hier":"gisteren",
    "gare":"station","hôtel":"hotel","rue":"straat","gauche":"links","droite":"rechts","ici":"hier","grand":"groot","petit":"klein","nouveau":"nieuw","beau":"mooi","bon":"goed","vite":"snel",
    "table":"tafel","chaise":"stoel","lit":"bed","porte":"deur","fenêtre":"raam","clé":"sleutel","téléphone":"telefoon","lampe":"lamp",
    "chemise":"overhemd","pantalon":"broek","chaussures":"schoenen","robe":"jurk","chapeau":"hoed","manteau":"jas",
    "soleil":"zon","lune":"maan","mer":"zee","montagne":"berg","arbre":"boom","fleur":"bloem","ciel":"hemel","plage":"strand",
    "je suis un homme":"ik ben een man","elle est une femme":"zij is een vrouw","le chat boit de l'eau":"de kat drinkt water","je bois du café":"ik drink koffie","je mange une pomme":"ik eet een appel","nous mangeons du riz":"wij eten rijst","où est la gare":"waar is het station","la maison est grande":"het huis is groot","c'est un bon café":"het is een goede koffie","j'ai deux chats":"ik heb twee katten","trois pommes":"drie appels","le chat est noir":"de kat is zwart","une fleur rouge":"een rode bloem","je parle":"ik spreek","tu vas":"jij gaat","il a un chien":"hij heeft een hond","nous avons une maison":"wij hebben een huis","le soleil est grand":"de zon is groot","j'aime le café":"ik hou van koffie" }
};

/* --- Phrasier voyage (pour le traducteur) --- */
var PHRASEBOOK = {
  "comment ça va":{en:"how are you",it:"come stai",es:"cómo estás",de:"wie geht's",pt:"como estás",nl:"hoe gaat het"},
  "je ne comprends pas":{en:"i don't understand",it:"non capisco",es:"no entiendo",de:"ich verstehe nicht",pt:"não percebo",nl:"ik begrijp het niet"},
  "parlez-vous anglais":{en:"do you speak english",it:"parli inglese",es:"hablas inglés",de:"sprichst du Englisch",pt:"falas inglês",nl:"spreek je Engels"},
  "où sont les toilettes":{en:"where is the toilet",it:"dov'è il bagno",es:"dónde está el baño",de:"wo ist die Toilette",pt:"onde é a casa de banho",nl:"waar is het toilet"},
  "combien ça coûte":{en:"how much is it",it:"quanto costa",es:"cuánto cuesta",de:"wie viel kostet das",pt:"quanto custa",nl:"hoeveel kost het"},
  "l'addition s'il vous plaît":{en:"the bill please",it:"il conto per favore",es:"la cuenta por favor",de:"die Rechnung bitte",pt:"a conta por favor",nl:"de rekening alstublieft"},
  "aidez-moi":{en:"help me",it:"aiutami",es:"ayúdame",de:"hilf mir",pt:"ajuda-me",nl:"help me"},
  "je suis perdu":{en:"i am lost",it:"mi sono perso",es:"estoy perdido",de:"ich habe mich verlaufen",pt:"estou perdido",nl:"ik ben verdwaald"},
  "je t'aime":{en:"i love you",it:"ti amo",es:"te quiero",de:"ich liebe dich",pt:"amo-te",nl:"ik hou van je"},
  "bonne journée":{en:"have a good day",it:"buona giornata",es:"buen día",de:"schönen Tag",pt:"tenha um bom dia",nl:"fijne dag"},
  "santé":{en:"cheers",it:"salute",es:"salud",de:"prost",pt:"saúde",nl:"proost"},
  "bienvenue":{en:"welcome",it:"benvenuto",es:"bienvenido",de:"willkommen",pt:"bem-vindo",nl:"welkom"}
};

/* --- EXTENSION DE CONTENU (100% original) : +13 unités, 6 langues --- */
var CURRICULUM_X = [
  {t:"Verbes essentiels 🗣️", c:"#0891b2", L:[
    {t:"Verbes 1", w:["être","avoir","aller","faire","venir","voir","vouloir","pouvoir"]},
    {t:"Verbes 2", w:["manger","boire","parler","aimer","savoir","dire","donner","dormir"]} ]},
  {t:"Le corps 🧍", c:"#d946ef", L:[
    {t:"Le visage", w:["tête","cheveux","œil","nez","bouche","oreille","dent"]},
    {t:"Le corps", w:["main","bras","jambe","pied","doigt","cœur","dos","ventre"]} ]},
  {t:"Fruits et légumes 🥕", c:"#65a30d", L:[
    {t:"Les fruits", w:["fruit","banane","fraise","citron","raisin","poire"]},
    {t:"Les légumes", w:["légume","tomate","carotte","oignon","salade","pomme de terre"]} ]},
  {t:"En ville 🏙️", c:"#0d9488", L:[
    {t:"Les lieux", w:["ville","magasin","marché","banque","école","hôpital","pharmacie"]},
    {t:"Encore des lieux", w:["restaurant","église","parc","pont","aéroport","musée"]} ]},
  {t:"Les transports 🚗", c:"#ea580c", L:[
    {t:"Sur la route", w:["voiture","bus","vélo","moto","taxi","camion"]},
    {t:"Voyager", w:["train","avion","bateau","métro"]} ]},
  {t:"Les métiers 👩‍⚕️", c:"#be123c", L:[
    {t:"Métiers 1", w:["médecin","professeur","cuisinier","policier","serveur"]},
    {t:"Métiers 2", w:["avocat","ingénieur","artiste","boulanger","agriculteur"]} ]},
  {t:"Jours et saisons 📅", c:"#4f46e5", L:[
    {t:"Les jours", w:["lundi","mardi","mercredi","jeudi","vendredi","samedi","dimanche"]},
    {t:"Les saisons", w:["printemps","été","automne","hiver"]} ]},
  {t:"La météo ☔", c:"#0284c7", L:[
    {t:"Le temps qu'il fait", w:["pluie","neige","vent","nuage","orage","chaud","froid"], p:["il pleut","il fait chaud"]} ]},
  {t:"Adjectifs utiles ✨", c:"#9333ea", L:[
    {t:"Contraires 1", w:["heureux","triste","facile","difficile","jeune","vieux"]},
    {t:"Contraires 2", w:["propre","sale","plein","vide","cher","content"]} ]},
  {t:"Au restaurant 🍽️", c:"#db2777", L:[
    {t:"Commander", w:["menu","plat","entrée","dessert","addition"]},
    {t:"À table", w:["fourchette","couteau","cuillère","assiette","verre","tasse"]} ]},
  {t:"Les achats 🛒", c:"#16a34a", L:[
    {t:"Payer", w:["argent","prix","euro","carte","monnaie"]},
    {t:"Verbes utiles", w:["acheter","vendre","payer","coûter"]} ]},
  {t:"Poser des questions ❓", c:"#c026d3", L:[
    {t:"Mots interrogatifs", w:["qui","quoi","où","quand","comment","pourquoi","combien"]} ]},
  {t:"Encore des nombres 🔢", c:"#2563eb", L:[
    {t:"11 à 20", w:["onze","douze","treize","quatorze","quinze","seize","dix-sept","dix-huit","dix-neuf","vingt"]},
    {t:"Les dizaines", w:["trente","quarante","cinquante","mille"]} ]}
];
var LEX_X = {
  en:{ "être":"to be","avoir":"to have","aller":"to go","faire":"to do","venir":"to come","voir":"to see","vouloir":"to want","pouvoir":"can","manger":"to eat","boire":"to drink","parler":"to speak","aimer":"to love","savoir":"to know","dire":"to say","donner":"to give","dormir":"to sleep",
    "tête":"head","cheveux":"hair","œil":"eye","nez":"nose","bouche":"mouth","oreille":"ear","dent":"tooth","main":"hand","bras":"arm","jambe":"leg","pied":"foot","doigt":"finger","cœur":"heart","dos":"back","ventre":"belly",
    "fruit":"fruit","banane":"banana","fraise":"strawberry","citron":"lemon","raisin":"grape","poire":"pear","légume":"vegetable","tomate":"tomato","carotte":"carrot","oignon":"onion","salade":"salad","pomme de terre":"potato",
    "ville":"city","magasin":"shop","marché":"market","banque":"bank","école":"school","hôpital":"hospital","pharmacie":"pharmacy","restaurant":"restaurant","église":"church","parc":"park","pont":"bridge","aéroport":"airport","musée":"museum",
    "voiture":"car","bus":"bus","vélo":"bike","moto":"motorbike","taxi":"taxi","camion":"truck","train":"train","avion":"plane","bateau":"boat","métro":"metro",
    "médecin":"doctor","professeur":"teacher","cuisinier":"cook","policier":"policeman","serveur":"waiter","avocat":"lawyer","ingénieur":"engineer","artiste":"artist","boulanger":"baker","agriculteur":"farmer",
    "lundi":"Monday","mardi":"Tuesday","mercredi":"Wednesday","jeudi":"Thursday","vendredi":"Friday","samedi":"Saturday","dimanche":"Sunday","printemps":"spring","été":"summer","automne":"autumn","hiver":"winter",
    "pluie":"rain","neige":"snow","vent":"wind","nuage":"cloud","orage":"storm","chaud":"hot","froid":"cold","il pleut":"it is raining","il fait chaud":"it is hot",
    "heureux":"happy","triste":"sad","facile":"easy","difficile":"hard","jeune":"young","vieux":"old","propre":"clean","sale":"dirty","plein":"full","vide":"empty","cher":"expensive","content":"glad",
    "menu":"menu","plat":"dish","entrée":"starter","dessert":"dessert","addition":"bill","fourchette":"fork","couteau":"knife","cuillère":"spoon","assiette":"plate","verre":"glass","tasse":"cup",
    "argent":"money","prix":"price","euro":"euro","carte":"card","monnaie":"change","acheter":"to buy","vendre":"to sell","payer":"to pay","coûter":"to cost",
    "qui":"who","quoi":"what","où":"where","quand":"when","comment":"how","pourquoi":"why","combien":"how much",
    "onze":"eleven","douze":"twelve","treize":"thirteen","quatorze":"fourteen","quinze":"fifteen","seize":"sixteen","dix-sept":"seventeen","dix-huit":"eighteen","dix-neuf":"nineteen","vingt":"twenty","trente":"thirty","quarante":"forty","cinquante":"fifty","mille":"thousand" },
  it:{ "être":"essere","avoir":"avere","aller":"andare","faire":"fare","venir":"venire","voir":"vedere","vouloir":"volere","pouvoir":"potere","manger":"mangiare","boire":"bere","parler":"parlare","aimer":"amare","savoir":"sapere","dire":"dire","donner":"dare","dormir":"dormire",
    "tête":"testa","cheveux":"capelli","œil":"occhio","nez":"naso","bouche":"bocca","oreille":"orecchio","dent":"dente","main":"mano","bras":"braccio","jambe":"gamba","pied":"piede","doigt":"dito","cœur":"cuore","dos":"schiena","ventre":"pancia",
    "fruit":"frutta","banane":"banana","fraise":"fragola","citron":"limone","raisin":"uva","poire":"pera","légume":"verdura","tomate":"pomodoro","carotte":"carota","oignon":"cipolla","salade":"insalata","pomme de terre":"patata",
    "ville":"città","magasin":"negozio","marché":"mercato","banque":"banca","école":"scuola","hôpital":"ospedale","pharmacie":"farmacia","restaurant":"ristorante","église":"chiesa","parc":"parco","pont":"ponte","aéroport":"aeroporto","musée":"museo",
    "voiture":"macchina","bus":"autobus","vélo":"bicicletta","moto":"moto","taxi":"taxi","camion":"camion","train":"treno","avion":"aereo","bateau":"barca","métro":"metropolitana",
    "médecin":"medico","professeur":"insegnante","cuisinier":"cuoco","policier":"poliziotto","serveur":"cameriere","avocat":"avvocato","ingénieur":"ingegnere","artiste":"artista","boulanger":"panettiere","agriculteur":"agricoltore",
    "lundi":"lunedì","mardi":"martedì","mercredi":"mercoledì","jeudi":"giovedì","vendredi":"venerdì","samedi":"sabato","dimanche":"domenica","printemps":"primavera","été":"estate","automne":"autunno","hiver":"inverno",
    "pluie":"pioggia","neige":"neve","vent":"vento","nuage":"nuvola","orage":"temporale","chaud":"caldo","froid":"freddo","il pleut":"piove","il fait chaud":"fa caldo",
    "heureux":"felice","triste":"triste","facile":"facile","difficile":"difficile","jeune":"giovane","vieux":"vecchio","propre":"pulito","sale":"sporco","plein":"pieno","vide":"vuoto","cher":"caro","content":"contento",
    "menu":"menù","plat":"piatto","entrée":"antipasto","dessert":"dolce","addition":"conto","fourchette":"forchetta","couteau":"coltello","cuillère":"cucchiaio","assiette":"piatto","verre":"bicchiere","tasse":"tazza",
    "argent":"soldi","prix":"prezzo","euro":"euro","carte":"carta","monnaie":"resto","acheter":"comprare","vendre":"vendere","payer":"pagare","coûter":"costare",
    "qui":"chi","quoi":"cosa","où":"dove","quand":"quando","comment":"come","pourquoi":"perché","combien":"quanto",
    "onze":"undici","douze":"dodici","treize":"tredici","quatorze":"quattordici","quinze":"quindici","seize":"sedici","dix-sept":"diciassette","dix-huit":"diciotto","dix-neuf":"diciannove","vingt":"venti","trente":"trenta","quarante":"quaranta","cinquante":"cinquanta","mille":"mille" },
  es:{ "être":"ser","avoir":"tener","aller":"ir","faire":"hacer","venir":"venir","voir":"ver","vouloir":"querer","pouvoir":"poder","manger":"comer","boire":"beber","parler":"hablar","aimer":"amar","savoir":"saber","dire":"decir","donner":"dar","dormir":"dormir",
    "tête":"cabeza","cheveux":"pelo","œil":"ojo","nez":"nariz","bouche":"boca","oreille":"oreja","dent":"diente","main":"mano","bras":"brazo","jambe":"pierna","pied":"pie","doigt":"dedo","cœur":"corazón","dos":"espalda","ventre":"barriga",
    "fruit":"fruta","banane":"plátano","fraise":"fresa","citron":"limón","raisin":"uva","poire":"pera","légume":"verdura","tomate":"tomate","carotte":"zanahoria","oignon":"cebolla","salade":"ensalada","pomme de terre":"patata",
    "ville":"ciudad","magasin":"tienda","marché":"mercado","banque":"banco","école":"escuela","hôpital":"hospital","pharmacie":"farmacia","restaurant":"restaurante","église":"iglesia","parc":"parque","pont":"puente","aéroport":"aeropuerto","musée":"museo",
    "voiture":"coche","bus":"autobús","vélo":"bicicleta","moto":"moto","taxi":"taxi","camion":"camión","train":"tren","avion":"avión","bateau":"barco","métro":"metro",
    "médecin":"médico","professeur":"profesor","cuisinier":"cocinero","policier":"policía","serveur":"camarero","avocat":"abogado","ingénieur":"ingeniero","artiste":"artista","boulanger":"panadero","agriculteur":"agricultor",
    "lundi":"lunes","mardi":"martes","mercredi":"miércoles","jeudi":"jueves","vendredi":"viernes","samedi":"sábado","dimanche":"domingo","printemps":"primavera","été":"verano","automne":"otoño","hiver":"invierno",
    "pluie":"lluvia","neige":"nieve","vent":"viento","nuage":"nube","orage":"tormenta","chaud":"caliente","froid":"frío","il pleut":"llueve","il fait chaud":"hace calor",
    "heureux":"feliz","triste":"triste","facile":"fácil","difficile":"difícil","jeune":"joven","vieux":"viejo","propre":"limpio","sale":"sucio","plein":"lleno","vide":"vacío","cher":"caro","content":"contento",
    "menu":"menú","plat":"plato","entrée":"entrante","dessert":"postre","addition":"cuenta","fourchette":"tenedor","couteau":"cuchillo","cuillère":"cuchara","assiette":"plato","verre":"vaso","tasse":"taza",
    "argent":"dinero","prix":"precio","euro":"euro","carte":"tarjeta","monnaie":"cambio","acheter":"comprar","vendre":"vender","payer":"pagar","coûter":"costar",
    "qui":"quién","quoi":"qué","où":"dónde","quand":"cuándo","comment":"cómo","pourquoi":"por qué","combien":"cuánto",
    "onze":"once","douze":"doce","treize":"trece","quatorze":"catorce","quinze":"quince","seize":"dieciséis","dix-sept":"diecisiete","dix-huit":"dieciocho","dix-neuf":"diecinueve","vingt":"veinte","trente":"treinta","quarante":"cuarenta","cinquante":"cincuenta","mille":"mil" },
  de:{ "être":"sein","avoir":"haben","aller":"gehen","faire":"machen","venir":"kommen","voir":"sehen","vouloir":"wollen","pouvoir":"können","manger":"essen","boire":"trinken","parler":"sprechen","aimer":"lieben","savoir":"wissen","dire":"sagen","donner":"geben","dormir":"schlafen",
    "tête":"Kopf","cheveux":"Haare","œil":"Auge","nez":"Nase","bouche":"Mund","oreille":"Ohr","dent":"Zahn","main":"Hand","bras":"Arm","jambe":"Bein","pied":"Fuß","doigt":"Finger","cœur":"Herz","dos":"Rücken","ventre":"Bauch",
    "fruit":"Obst","banane":"Banane","fraise":"Erdbeere","citron":"Zitrone","raisin":"Traube","poire":"Birne","légume":"Gemüse","tomate":"Tomate","carotte":"Karotte","oignon":"Zwiebel","salade":"Salat","pomme de terre":"Kartoffel",
    "ville":"Stadt","magasin":"Geschäft","marché":"Markt","banque":"Bank","école":"Schule","hôpital":"Krankenhaus","pharmacie":"Apotheke","restaurant":"Restaurant","église":"Kirche","parc":"Park","pont":"Brücke","aéroport":"Flughafen","musée":"Museum",
    "voiture":"Auto","bus":"Bus","vélo":"Fahrrad","moto":"Motorrad","taxi":"Taxi","camion":"Lastwagen","train":"Zug","avion":"Flugzeug","bateau":"Boot","métro":"U-Bahn",
    "médecin":"Arzt","professeur":"Lehrer","cuisinier":"Koch","policier":"Polizist","serveur":"Kellner","avocat":"Anwalt","ingénieur":"Ingenieur","artiste":"Künstler","boulanger":"Bäcker","agriculteur":"Bauer",
    "lundi":"Montag","mardi":"Dienstag","mercredi":"Mittwoch","jeudi":"Donnerstag","vendredi":"Freitag","samedi":"Samstag","dimanche":"Sonntag","printemps":"Frühling","été":"Sommer","automne":"Herbst","hiver":"Winter",
    "pluie":"Regen","neige":"Schnee","vent":"Wind","nuage":"Wolke","orage":"Gewitter","chaud":"heiß","froid":"kalt","il pleut":"es regnet","il fait chaud":"es ist heiß",
    "heureux":"glücklich","triste":"traurig","facile":"einfach","difficile":"schwer","jeune":"jung","vieux":"alt","propre":"sauber","sale":"schmutzig","plein":"voll","vide":"leer","cher":"teuer","content":"froh",
    "menu":"Speisekarte","plat":"Gericht","entrée":"Vorspeise","dessert":"Nachtisch","addition":"Rechnung","fourchette":"Gabel","couteau":"Messer","cuillère":"Löffel","assiette":"Teller","verre":"Glas","tasse":"Tasse",
    "argent":"Geld","prix":"Preis","euro":"Euro","carte":"Karte","monnaie":"Wechselgeld","acheter":"kaufen","vendre":"verkaufen","payer":"bezahlen","coûter":"kosten",
    "qui":"wer","quoi":"was","où":"wo","quand":"wann","comment":"wie","pourquoi":"warum","combien":"wie viel",
    "onze":"elf","douze":"zwölf","treize":"dreizehn","quatorze":"vierzehn","quinze":"fünfzehn","seize":"sechzehn","dix-sept":"siebzehn","dix-huit":"achtzehn","dix-neuf":"neunzehn","vingt":"zwanzig","trente":"dreißig","quarante":"vierzig","cinquante":"fünfzig","mille":"tausend" },
  pt:{ "être":"ser","avoir":"ter","aller":"ir","faire":"fazer","venir":"vir","voir":"ver","vouloir":"querer","pouvoir":"poder","manger":"comer","boire":"beber","parler":"falar","aimer":"amar","savoir":"saber","dire":"dizer","donner":"dar","dormir":"dormir",
    "tête":"cabeça","cheveux":"cabelo","œil":"olho","nez":"nariz","bouche":"boca","oreille":"orelha","dent":"dente","main":"mão","bras":"braço","jambe":"perna","pied":"pé","doigt":"dedo","cœur":"coração","dos":"costas","ventre":"barriga",
    "fruit":"fruta","banane":"banana","fraise":"morango","citron":"limão","raisin":"uva","poire":"pera","légume":"legume","tomate":"tomate","carotte":"cenoura","oignon":"cebola","salade":"salada","pomme de terre":"batata",
    "ville":"cidade","magasin":"loja","marché":"mercado","banque":"banco","école":"escola","hôpital":"hospital","pharmacie":"farmácia","restaurant":"restaurante","église":"igreja","parc":"parque","pont":"ponte","aéroport":"aeroporto","musée":"museu",
    "voiture":"carro","bus":"autocarro","vélo":"bicicleta","moto":"mota","taxi":"táxi","camion":"camião","train":"comboio","avion":"avião","bateau":"barco","métro":"metro",
    "médecin":"médico","professeur":"professor","cuisinier":"cozinheiro","policier":"polícia","serveur":"empregado","avocat":"advogado","ingénieur":"engenheiro","artiste":"artista","boulanger":"padeiro","agriculteur":"agricultor",
    "lundi":"segunda-feira","mardi":"terça-feira","mercredi":"quarta-feira","jeudi":"quinta-feira","vendredi":"sexta-feira","samedi":"sábado","dimanche":"domingo","printemps":"primavera","été":"verão","automne":"outono","hiver":"inverno",
    "pluie":"chuva","neige":"neve","vent":"vento","nuage":"nuvem","orage":"tempestade","chaud":"quente","froid":"frio","il pleut":"está a chover","il fait chaud":"está calor",
    "heureux":"feliz","triste":"triste","facile":"fácil","difficile":"difícil","jeune":"jovem","vieux":"velho","propre":"limpo","sale":"sujo","plein":"cheio","vide":"vazio","cher":"caro","content":"contente",
    "menu":"menu","plat":"prato","entrée":"entrada","dessert":"sobremesa","addition":"conta","fourchette":"garfo","couteau":"faca","cuillère":"colher","assiette":"prato","verre":"copo","tasse":"chávena",
    "argent":"dinheiro","prix":"preço","euro":"euro","carte":"cartão","monnaie":"troco","acheter":"comprar","vendre":"vender","payer":"pagar","coûter":"custar",
    "qui":"quem","quoi":"o quê","où":"onde","quand":"quando","comment":"como","pourquoi":"porquê","combien":"quanto",
    "onze":"onze","douze":"doze","treize":"treze","quatorze":"catorze","quinze":"quinze","seize":"dezasseis","dix-sept":"dezassete","dix-huit":"dezoito","dix-neuf":"dezanove","vingt":"vinte","trente":"trinta","quarante":"quarenta","cinquante":"cinquenta","mille":"mil" },
  nl:{ "être":"zijn","avoir":"hebben","aller":"gaan","faire":"doen","venir":"komen","voir":"zien","vouloir":"willen","pouvoir":"kunnen","manger":"eten","boire":"drinken","parler":"spreken","aimer":"houden van","savoir":"weten","dire":"zeggen","donner":"geven","dormir":"slapen",
    "tête":"hoofd","cheveux":"haar","œil":"oog","nez":"neus","bouche":"mond","oreille":"oor","dent":"tand","main":"hand","bras":"arm","jambe":"been","pied":"voet","doigt":"vinger","cœur":"hart","dos":"rug","ventre":"buik",
    "fruit":"fruit","banane":"banaan","fraise":"aardbei","citron":"citroen","raisin":"druif","poire":"peer","légume":"groente","tomate":"tomaat","carotte":"wortel","oignon":"ui","salade":"salade","pomme de terre":"aardappel",
    "ville":"stad","magasin":"winkel","marché":"markt","banque":"bank","école":"school","hôpital":"ziekenhuis","pharmacie":"apotheek","restaurant":"restaurant","église":"kerk","parc":"park","pont":"brug","aéroport":"luchthaven","musée":"museum",
    "voiture":"auto","bus":"bus","vélo":"fiets","moto":"motor","taxi":"taxi","camion":"vrachtwagen","train":"trein","avion":"vliegtuig","bateau":"boot","métro":"metro",
    "médecin":"dokter","professeur":"leraar","cuisinier":"kok","policier":"politieagent","serveur":"ober","avocat":"advocaat","ingénieur":"ingenieur","artiste":"kunstenaar","boulanger":"bakker","agriculteur":"boer",
    "lundi":"maandag","mardi":"dinsdag","mercredi":"woensdag","jeudi":"donderdag","vendredi":"vrijdag","samedi":"zaterdag","dimanche":"zondag","printemps":"lente","été":"zomer","automne":"herfst","hiver":"winter",
    "pluie":"regen","neige":"sneeuw","vent":"wind","nuage":"wolk","orage":"onweer","chaud":"warm","froid":"koud","il pleut":"het regent","il fait chaud":"het is warm",
    "heureux":"blij","triste":"verdrietig","facile":"makkelijk","difficile":"moeilijk","jeune":"jong","vieux":"oud","propre":"schoon","sale":"vuil","plein":"vol","vide":"leeg","cher":"duur","content":"tevreden",
    "menu":"menu","plat":"gerecht","entrée":"voorgerecht","dessert":"nagerecht","addition":"rekening","fourchette":"vork","couteau":"mes","cuillère":"lepel","assiette":"bord","verre":"glas","tasse":"kopje",
    "argent":"geld","prix":"prijs","euro":"euro","carte":"kaart","monnaie":"wisselgeld","acheter":"kopen","vendre":"verkopen","payer":"betalen","coûter":"kosten",
    "qui":"wie","quoi":"wat","où":"waar","quand":"wanneer","comment":"hoe","pourquoi":"waarom","combien":"hoeveel",
    "onze":"elf","douze":"twaalf","treize":"dertien","quatorze":"veertien","quinze":"vijftien","seize":"zestien","dix-sept":"zeventien","dix-huit":"achttien","dix-neuf":"negentien","vingt":"twintig","trente":"dertig","quarante":"veertig","cinquante":"vijftig","mille":"duizend" }
};
CURRICULUM_X.forEach(function(u){ CURRICULUM.push(u); });
LANGS.forEach(function(l){ var s=LEX_X[l]||{}; Object.keys(s).forEach(function(k){ LEX[l][k]=s[k]; }); });

/* --- Phrasier voyage supplémentaire --- */
var PHRASEBOOK_X = {
  "à quelle heure":{en:"at what time",it:"a che ora",es:"a qué hora",de:"um wie viel Uhr",pt:"a que horas",nl:"hoe laat"},
  "je voudrais":{en:"i would like",it:"vorrei",es:"quería",de:"ich möchte",pt:"queria",nl:"ik wil graag"},
  "c'est délicieux":{en:"it is delicious",it:"è delizioso",es:"está delicioso",de:"das ist köstlich",pt:"está delicioso",nl:"het is heerlijk"},
  "à bientôt":{en:"see you soon",it:"a presto",es:"hasta pronto",de:"bis bald",pt:"até breve",nl:"tot snel"},
  "bonne nuit":{en:"good night",it:"buonanotte",es:"buenas noches",de:"gute Nacht",pt:"boa noite",nl:"goedenacht"},
  "bon appétit":{en:"enjoy your meal",it:"buon appetito",es:"buen provecho",de:"guten Appetit",pt:"bom apetite",nl:"eet smakelijk"},
  "excusez-moi":{en:"excuse me",it:"mi scusi",es:"disculpe",de:"entschuldigen Sie",pt:"com licença",nl:"excuseer"},
  "de rien":{en:"you're welcome",it:"prego",es:"de nada",de:"gern geschehen",pt:"de nada",nl:"graag gedaan"},
  "je m'appelle":{en:"my name is",it:"mi chiamo",es:"me llamo",de:"ich heiße",pt:"chamo-me",nl:"ik heet"},
  "enchanté":{en:"nice to meet you",it:"piacere",es:"encantado",de:"freut mich",pt:"prazer",nl:"aangenaam"}
};
Object.keys(PHRASEBOOK_X).forEach(function(k){ PHRASEBOOK[k]=PHRASEBOOK_X[k]; });

/* --- Phrases du quotidien (parcours) --- */
var PHRASEBOOK_X2 = {
  "où est":{en:"where is",it:"dov'è",es:"dónde está",de:"wo ist",pt:"onde fica",nl:"waar is"},
  "je cherche":{en:"i am looking for",it:"sto cercando",es:"estoy buscando",de:"ich suche",pt:"estou à procura",nl:"ik zoek"},
  "à droite":{en:"to the right",it:"a destra",es:"a la derecha",de:"nach rechts",pt:"à direita",nl:"naar rechts"},
  "à gauche":{en:"to the left",it:"a sinistra",es:"a la izquierda",de:"nach links",pt:"à esquerda",nl:"naar links"},
  "tout droit":{en:"straight ahead",it:"dritto",es:"todo recto",de:"geradeaus",pt:"em frente",nl:"rechtdoor"},
  "je suis désolé":{en:"i am sorry",it:"mi dispiace",es:"lo siento",de:"es tut mir leid",pt:"lamento",nl:"het spijt me"},
  "pas de problème":{en:"no problem",it:"nessun problema",es:"no hay problema",de:"kein Problem",pt:"sem problema",nl:"geen probleem"},
  "un moment":{en:"one moment",it:"un momento",es:"un momento",de:"einen Moment",pt:"um momento",nl:"een moment"},
  "je voudrais un café":{en:"i would like a coffee",it:"vorrei un caffè",es:"quería un café",de:"ich möchte einen Kaffee",pt:"queria um café",nl:"ik wil graag een koffie"},
  "au secours":{en:"help",it:"aiuto",es:"socorro",de:"Hilfe",pt:"socorro",nl:"help"}
};
Object.keys(PHRASEBOOK_X2).forEach(function(k){ PHRASEBOOK[k]=PHRASEBOOK_X2[k]; });

/* --- Parcours : jalons de niveau (par nombre de mots maîtrisés) + conseils du prof (100% original) --- */
/* Paliers CECRL RÉALISTES (repères honnêtes du vocabulaire actif). AVANT : ça s'arrêtait à
   « A2+ » à 240 mots et la barre Coach appelait ça « 100% bilingue » — FAUX. Être bilingue
   (C1-C2) demande plusieurs MILLIERS de mots et des années. On garde des paliers rapprochés au
   début (là où on progresse vite) puis l'échelle réelle jusqu'au bilingue. */
var LEVELS = [
  {code:"Débutant", cefr:"—",  min:0},
  {code:"A1",  cefr:"A1", min:80},
  {code:"A1+", cefr:"A1", min:200},
  {code:"A2",  cefr:"A2", min:450},
  {code:"A2+", cefr:"A2", min:800},
  {code:"B1",  cefr:"B1", min:1400},
  {code:"B2",  cefr:"B2", min:2800},
  {code:"C1",  cefr:"C1", min:5000},
  {code:"Bilingue", cefr:"C2", min:9000}
];
var TEACHER_TIPS = [
  "Révise 5 minutes juste avant de dormir : ton cerveau fixe les mots pendant la nuit. 🌙",
  "Dis les mots à voix haute — parler ancre mieux que lire. 🗣️",
  "Mieux vaut 10 min chaque jour qu'une heure le dimanche : la régularité gagne. 📆",
  "Associe chaque mot à une image dans ta tête, pas à sa traduction. 🖼️",
  "Refais les révisions proposées : revoir au bon moment, c'est 80% de la mémoire. 🔁",
  "Compte, cuisine, range… en pensant dans ta nouvelle langue. 🧠",
  "N'aie pas peur de te tromper : une erreur t'apprend plus qu'une bonne réponse. 💪",
  "Écoute la prononciation et répète juste après, comme un écho. 🎧",
  "Apprends d'abord les mots que TU utilises tous les jours. 🎯",
  "Un mini-objectif atteignable : 1 leçon par jour suffit pour progresser. ✅",
  "Relie chaque nouveau mot à ceux que tu connais déjà (même thème). 🔗",
  "Fais une leçon dans les transports ou la file d'attente : le temps mort devient utile. ⏳",
  "Termine toujours sur une réussite : ça donne envie de revenir demain. 🌟",
  "Le soir, raconte ta journée en 3 petites phrases dans ta nouvelle langue. 📝",
  "Passe l'examen de l'unité : ce qui résiste, c'est exactement ce qu'il faut revoir. 🏆"
];

/* --- v2.44 : programme intermédiaire (A2 → B1) — parité garantie sur les 6 langues.
   Un seul dictionnaire source NEWV (fr → {en,it,es,de,pt,nl}) alimente le lexique de
   TOUTES les langues d'un coup : impossible qu'une langue ait moins que les autres. --- */
var CURRICULUM_Y = [
  { t:"Les émotions 😊", c:"#f59e0b", L:[
    { t:"Se sentir", w:["fatigué","fâché","inquiet","surpris","fier","calme"], p:["je suis fatigué"] },
    { t:"Le cœur", w:["seul","amoureux","peur","rire","pleurer"], p:["elle a peur"] }
  ]},
  { t:"Le temps qui passe ⏳", c:"#8b5cf6", L:[
    { t:"Quand ?", w:["maintenant","bientôt","tard","tôt","longtemps"], p:["je mange maintenant"] },
    { t:"À quelle fréquence", w:["toujours","jamais","souvent","parfois","avant","après"], p:["je bois souvent du thé"] }
  ]},
  { t:"Au travail 💼", c:"#0ea5e9", L:[
    { t:"Le bureau", w:["travail","bureau","réunion","patron","collègue","ordinateur"], p:["je travaille au bureau"] },
    { t:"L'entreprise", w:["projet","salaire","entreprise","réussir","travailler"], p:["j'aime mon travail"] }
  ]},
  { t:"La santé 🩺", c:"#ef4444", L:[
    { t:"Être malade", w:["malade","douleur","médicament","fièvre"], p:["je suis malade"] },
    { t:"Aller mieux", w:["se reposer","guérir","santé","fort","faible","respirer"], p:["je vais mieux"] }
  ]},
  { t:"Les loisirs 🎭", c:"#ec4899", L:[
    { t:"Bouger", w:["jouer","nager","courir","danser","voyager","sport"], p:["j'aime le sport"] },
    { t:"Arts et loisirs", w:["lire","écrire","chanter","musique","film","jeu"], p:["j'aime lire"] }
  ]},
  { t:"La technologie 📱", c:"#14b8a6", L:[
    { t:"Mon téléphone", w:["écran","message","photo","application","batterie"], p:["je regarde une photo"] },
    { t:"En ligne", w:["internet","mot de passe","en ligne","clavier","ordinateur portable"], p:["je suis en ligne"] }
  ]},
  { t:"Opinions et idées 💡", c:"#a855f7", L:[
    { t:"Réfléchir", w:["penser","croire","comprendre","expliquer"], p:["je pense que oui"] },
    { t:"Discuter", w:["raison","vérité","problème","solution","idée","important"], p:["c'est une bonne idée"] }
  ]}
];
var NEWV = {
  "fatigué":{en:"tired",it:"stanco",es:"cansado",de:"müde",pt:"cansado",nl:"moe"},
  "fâché":{en:"angry",it:"arrabbiato",es:"enfadado",de:"wütend",pt:"zangado",nl:"boos"},
  "inquiet":{en:"worried",it:"preoccupato",es:"preocupado",de:"besorgt",pt:"preocupado",nl:"bezorgd"},
  "surpris":{en:"surprised",it:"sorpreso",es:"sorprendido",de:"überrascht",pt:"surpreso",nl:"verrast"},
  "fier":{en:"proud",it:"fiero",es:"orgulloso",de:"stolz",pt:"orgulhoso",nl:"trots"},
  "calme":{en:"calm",it:"calmo",es:"tranquilo",de:"ruhig",pt:"calmo",nl:"kalm"},
  "seul":{en:"alone",it:"solo",es:"solo",de:"allein",pt:"sozinho",nl:"alleen"},
  "amoureux":{en:"in love",it:"innamorato",es:"enamorado",de:"verliebt",pt:"apaixonado",nl:"verliefd"},
  "peur":{en:"fear",it:"paura",es:"miedo",de:"Angst",pt:"medo",nl:"angst"},
  "rire":{en:"to laugh",it:"ridere",es:"reír",de:"lachen",pt:"rir",nl:"lachen"},
  "pleurer":{en:"to cry",it:"piangere",es:"llorar",de:"weinen",pt:"chorar",nl:"huilen"},
  "maintenant":{en:"now",it:"adesso",es:"ahora",de:"jetzt",pt:"agora",nl:"nu"},
  "bientôt":{en:"soon",it:"presto",es:"pronto",de:"bald",pt:"em breve",nl:"binnenkort"},
  "tard":{en:"late",it:"tardi",es:"tarde",de:"spät",pt:"tarde",nl:"laat"},
  "tôt":{en:"early",it:"presto",es:"temprano",de:"früh",pt:"cedo",nl:"vroeg"},
  "longtemps":{en:"a long time",it:"a lungo",es:"mucho tiempo",de:"lange",pt:"muito tempo",nl:"lang"},
  "toujours":{en:"always",it:"sempre",es:"siempre",de:"immer",pt:"sempre",nl:"altijd"},
  "jamais":{en:"never",it:"mai",es:"nunca",de:"nie",pt:"nunca",nl:"nooit"},
  "souvent":{en:"often",it:"spesso",es:"a menudo",de:"oft",pt:"frequentemente",nl:"vaak"},
  "parfois":{en:"sometimes",it:"a volte",es:"a veces",de:"manchmal",pt:"às vezes",nl:"soms"},
  "avant":{en:"before",it:"prima",es:"antes",de:"vor",pt:"antes",nl:"voor"},
  "après":{en:"after",it:"dopo",es:"después",de:"nach",pt:"depois",nl:"na"},
  "travail":{en:"work",it:"lavoro",es:"trabajo",de:"Arbeit",pt:"trabalho",nl:"werk"},
  "bureau":{en:"office",it:"ufficio",es:"oficina",de:"Büro",pt:"escritório",nl:"kantoor"},
  "réunion":{en:"meeting",it:"riunione",es:"reunión",de:"Besprechung",pt:"reunião",nl:"vergadering"},
  "patron":{en:"boss",it:"capo",es:"jefe",de:"Chef",pt:"chefe",nl:"baas"},
  "collègue":{en:"colleague",it:"collega",es:"colega",de:"Kollege",pt:"colega",nl:"collega"},
  "ordinateur":{en:"computer",it:"computer",es:"ordenador",de:"Computer",pt:"computador",nl:"computer"},
  "projet":{en:"project",it:"progetto",es:"proyecto",de:"Projekt",pt:"projeto",nl:"project"},
  "salaire":{en:"salary",it:"stipendio",es:"salario",de:"Gehalt",pt:"salário",nl:"salaris"},
  "entreprise":{en:"company",it:"azienda",es:"empresa",de:"Firma",pt:"empresa",nl:"bedrijf"},
  "réussir":{en:"to succeed",it:"riuscire",es:"lograr",de:"gelingen",pt:"conseguir",nl:"slagen"},
  "travailler":{en:"to work",it:"lavorare",es:"trabajar",de:"arbeiten",pt:"trabalhar",nl:"werken"},
  "malade":{en:"sick",it:"malato",es:"enfermo",de:"krank",pt:"doente",nl:"ziek"},
  "douleur":{en:"pain",it:"dolore",es:"dolor",de:"Schmerz",pt:"dor",nl:"pijn"},
  "médicament":{en:"medicine",it:"medicina",es:"medicina",de:"Medikament",pt:"remédio",nl:"medicijn"},
  "fièvre":{en:"fever",it:"febbre",es:"fiebre",de:"Fieber",pt:"febre",nl:"koorts"},
  "se reposer":{en:"to rest",it:"riposare",es:"descansar",de:"sich ausruhen",pt:"descansar",nl:"rusten"},
  "guérir":{en:"to heal",it:"guarire",es:"curar",de:"heilen",pt:"curar",nl:"genezen"},
  "santé":{en:"health",it:"salute",es:"salud",de:"Gesundheit",pt:"saúde",nl:"gezondheid"},
  "fort":{en:"strong",it:"forte",es:"fuerte",de:"stark",pt:"forte",nl:"sterk"},
  "faible":{en:"weak",it:"debole",es:"débil",de:"schwach",pt:"fraco",nl:"zwak"},
  "respirer":{en:"to breathe",it:"respirare",es:"respirar",de:"atmen",pt:"respirar",nl:"ademen"},
  "jouer":{en:"to play",it:"giocare",es:"jugar",de:"spielen",pt:"jogar",nl:"spelen"},
  "nager":{en:"to swim",it:"nuotare",es:"nadar",de:"schwimmen",pt:"nadar",nl:"zwemmen"},
  "courir":{en:"to run",it:"correre",es:"correr",de:"laufen",pt:"correr",nl:"rennen"},
  "danser":{en:"to dance",it:"ballare",es:"bailar",de:"tanzen",pt:"dançar",nl:"dansen"},
  "voyager":{en:"to travel",it:"viaggiare",es:"viajar",de:"reisen",pt:"viajar",nl:"reizen"},
  "sport":{en:"sport",it:"sport",es:"deporte",de:"Sport",pt:"esporte",nl:"sport"},
  "lire":{en:"to read",it:"leggere",es:"leer",de:"lesen",pt:"ler",nl:"lezen"},
  "écrire":{en:"to write",it:"scrivere",es:"escribir",de:"schreiben",pt:"escrever",nl:"schrijven"},
  "chanter":{en:"to sing",it:"cantare",es:"cantar",de:"singen",pt:"cantar",nl:"zingen"},
  "musique":{en:"music",it:"musica",es:"música",de:"Musik",pt:"música",nl:"muziek"},
  "film":{en:"movie",it:"film",es:"película",de:"Film",pt:"filme",nl:"film"},
  "jeu":{en:"game",it:"gioco",es:"juego",de:"Spiel",pt:"jogo",nl:"spel"},
  "écran":{en:"screen",it:"schermo",es:"pantalla",de:"Bildschirm",pt:"tela",nl:"scherm"},
  "message":{en:"message",it:"messaggio",es:"mensaje",de:"Nachricht",pt:"mensagem",nl:"bericht"},
  "photo":{en:"photo",it:"foto",es:"foto",de:"Foto",pt:"foto",nl:"foto"},
  "application":{en:"app",it:"app",es:"aplicación",de:"App",pt:"aplicativo",nl:"app"},
  "batterie":{en:"battery",it:"batteria",es:"batería",de:"Batterie",pt:"bateria",nl:"batterij"},
  "internet":{en:"internet",it:"internet",es:"internet",de:"Internet",pt:"internet",nl:"internet"},
  "mot de passe":{en:"password",it:"password",es:"contraseña",de:"Passwort",pt:"senha",nl:"wachtwoord"},
  "en ligne":{en:"online",it:"online",es:"en línea",de:"online",pt:"online",nl:"online"},
  "clavier":{en:"keyboard",it:"tastiera",es:"teclado",de:"Tastatur",pt:"teclado",nl:"toetsenbord"},
  "ordinateur portable":{en:"laptop",it:"portatile",es:"portátil",de:"Laptop",pt:"portátil",nl:"laptop"},
  "penser":{en:"to think",it:"pensare",es:"pensar",de:"denken",pt:"pensar",nl:"denken"},
  "croire":{en:"to believe",it:"credere",es:"creer",de:"glauben",pt:"acreditar",nl:"geloven"},
  "comprendre":{en:"to understand",it:"capire",es:"entender",de:"verstehen",pt:"entender",nl:"begrijpen"},
  "expliquer":{en:"to explain",it:"spiegare",es:"explicar",de:"erklären",pt:"explicar",nl:"uitleggen"},
  "raison":{en:"reason",it:"ragione",es:"razón",de:"Grund",pt:"razão",nl:"reden"},
  "vérité":{en:"truth",it:"verità",es:"verdad",de:"Wahrheit",pt:"verdade",nl:"waarheid"},
  "problème":{en:"problem",it:"problema",es:"problema",de:"Problem",pt:"problema",nl:"probleem"},
  "solution":{en:"solution",it:"soluzione",es:"solución",de:"Lösung",pt:"solução",nl:"oplossing"},
  "idée":{en:"idea",it:"idea",es:"idea",de:"Idee",pt:"ideia",nl:"idee"},
  "important":{en:"important",it:"importante",es:"importante",de:"wichtig",pt:"importante",nl:"belangrijk"},
  "je suis fatigué":{en:"I am tired",it:"sono stanco",es:"estoy cansado",de:"ich bin müde",pt:"estou cansado",nl:"ik ben moe"},
  "elle a peur":{en:"she is afraid",it:"ha paura",es:"tiene miedo",de:"sie hat Angst",pt:"ela tem medo",nl:"zij is bang"},
  "je mange maintenant":{en:"I eat now",it:"mangio adesso",es:"como ahora",de:"ich esse jetzt",pt:"como agora",nl:"ik eet nu"},
  "je bois souvent du thé":{en:"I often drink tea",it:"bevo spesso il tè",es:"bebo té a menudo",de:"ich trinke oft Tee",pt:"bebo chá com frequência",nl:"ik drink vaak thee"},
  "je travaille au bureau":{en:"I work at the office",it:"lavoro in ufficio",es:"trabajo en la oficina",de:"ich arbeite im Büro",pt:"trabalho no escritório",nl:"ik werk op kantoor"},
  "j'aime mon travail":{en:"I like my work",it:"amo il mio lavoro",es:"me gusta mi trabajo",de:"ich mag meine Arbeit",pt:"gosto do meu trabalho",nl:"ik hou van mijn werk"},
  "je suis malade":{en:"I am sick",it:"sono malato",es:"estoy enfermo",de:"ich bin krank",pt:"estou doente",nl:"ik ben ziek"},
  "je vais mieux":{en:"I feel better",it:"sto meglio",es:"estoy mejor",de:"es geht mir besser",pt:"estou melhor",nl:"het gaat beter"},
  "j'aime le sport":{en:"I like sport",it:"mi piace lo sport",es:"me gusta el deporte",de:"ich mag Sport",pt:"gosto de esporte",nl:"ik hou van sport"},
  "j'aime lire":{en:"I like to read",it:"mi piace leggere",es:"me gusta leer",de:"ich lese gern",pt:"gosto de ler",nl:"ik lees graag"},
  "je regarde une photo":{en:"I look at a photo",it:"guardo una foto",es:"miro una foto",de:"ich schaue ein Foto an",pt:"olho uma foto",nl:"ik kijk naar een foto"},
  "je suis en ligne":{en:"I am online",it:"sono online",es:"estoy en línea",de:"ich bin online",pt:"estou online",nl:"ik ben online"},
  "je pense que oui":{en:"I think so",it:"penso di sì",es:"creo que sí",de:"ich glaube schon",pt:"acho que sim",nl:"ik denk het wel"},
  "c'est une bonne idée":{en:"it's a good idea",it:"è una buona idea",es:"es una buena idea",de:"das ist eine gute Idee",pt:"é uma boa ideia",nl:"het is een goed idee"}
};
CURRICULUM_Y.forEach(function(u){ CURRICULUM.push(u); });
LANGS.forEach(function(l){ Object.keys(NEWV).forEach(function(k){ if(NEWV[k][l]) LEX[l][k]=NEWV[k][l]; }); });

/* --- v2.56 : GRANDE extension (palier A2 → B1) — 12 unités, ~160 mots + phrases.
   Même mécanisme à parité garantie : NEWV2 (fr → 6 langues) alimente tout d'un coup.
   Vocabulaire de haute fréquence uniquement, portugais EUROPÉEN (pt-PT). --- */
var CURRICULUM_Z = [
  { t:"Verbes du quotidien 🔁", c:"#10b981", L:[
    { t:"Agir", w:["prendre","trouver","chercher","attendre","ouvrir","fermer","commencer","finir"], p:["je cherche la gare"] },
    { t:"Vivre", w:["aider","habiter","porter","essayer","apprendre","oublier","montrer"] }
  ]},
  { t:"La cuisine 🍳", c:"#f59e0b", L:[
    { t:"Dans la cuisine", w:["cuisine","four","frigo","bouteille","recette","cuisiner"] },
    { t:"Les ingrédients", w:["sel","poivre","sucre","huile","beurre","farine"] },
    { t:"Les repas", w:["petit-déjeuner","déjeuner","dîner"] }
  ]},
  { t:"La salle de bain 🛁", c:"#0ea5e9", L:[
    { t:"Se préparer", w:["savon","douche","bain","serviette","se laver"], p:["je me lave les mains"] },
    { t:"Les objets", w:["brosse à dents","dentifrice","miroir","peigne","shampoing"] }
  ]},
  { t:"Les lieux de la ville 🏛", c:"#8b5cf6", L:[
    { t:"Sortir", w:["bibliothèque","piscine","cinéma","théâtre","stade","place"] },
    { t:"Les services", w:["poste","mairie","boulangerie","boucherie","quartier","coin"] }
  ]},
  { t:"La position 🧭", c:"#3b82f6", L:[
    { t:"Où c'est ?", w:["sous","sur","devant","derrière","entre","à côté"] },
    { t:"S'orienter", w:["en haut","en bas","tout droit","près","loin"] }
  ]},
  { t:"Faire les courses 💰", c:"#ec4899", L:[
    { t:"Au magasin", w:["gratuit","soldes","liste","sac","panier","cadeau"], p:["c'est trop cher"] },
    { t:"À la caisse", w:["client","caisse","ouvert","fermé","trop"], p:["le magasin est ouvert"] }
  ]},
  { t:"Voyager loin ✈️", c:"#7c3aed", L:[
    { t:"Les papiers", w:["valise","passeport","billet","bagage","frontière","douane"] },
    { t:"Le trajet", w:["départ","arrivée","retard","réserver","annuler","vacances"], p:["je réserve un hôtel"] }
  ]},
  { t:"Décrire encore ✨", c:"#f97316", L:[
    { t:"Les mesures", w:["lourd","léger","long","court","large","étroit"] },
    { t:"Les qualités", w:["rapide","lent","dangereux","sûr","riche","pauvre","drôle","gentil"] }
  ]},
  { t:"Communiquer 📞", c:"#14b8a6", L:[
    { t:"Échanger", w:["appeler","répondre","demander","envoyer","recevoir"], p:["je t'appelle demain"] },
    { t:"Les messages", w:["question","réponse","nouvelle","lettre","adresse","e-mail","numéro"] }
  ]},
  { t:"La nature sauvage 🌍", c:"#22c55e", L:[
    { t:"Les paysages", w:["rivière","lac","forêt","île","colline","champ"], p:["la rivière est froide"] },
    { t:"Les éléments", w:["herbe","feuille","pierre","terre","feu","étoile"] }
  ]},
  { t:"Les animaux sauvages 🦁", c:"#e11d48", L:[
    { t:"Les grands", w:["lion","tigre","éléphant","singe","ours","loup"] },
    { t:"Les petits", w:["renard","serpent","abeille","papillon","araignée","canard"], p:["l'abeille aime les fleurs"] }
  ]},
  { t:"Petits mots essentiels 🔗", c:"#a855f7", L:[
    { t:"Relier", w:["avec","sans","aussi","mais","parce que","ou","si","donc"], p:["je voyage avec ma famille"] },
    { t:"Nuancer", w:["beaucoup","peu","très","peut-être","quelque chose","rien","tout","quelqu'un"] }
  ]}
];
var NEWV2 = {
  "prendre":{en:"to take",it:"prendere",es:"tomar",de:"nehmen",pt:"tomar",nl:"nemen"},
  "trouver":{en:"to find",it:"trovare",es:"encontrar",de:"finden",pt:"encontrar",nl:"vinden"},
  "chercher":{en:"to look for",it:"cercare",es:"buscar",de:"suchen",pt:"procurar",nl:"zoeken"},
  "attendre":{en:"to wait",it:"aspettare",es:"esperar",de:"warten",pt:"esperar",nl:"wachten"},
  "ouvrir":{en:"to open",it:"aprire",es:"abrir",de:"öffnen",pt:"abrir",nl:"openen"},
  "fermer":{en:"to close",it:"chiudere",es:"cerrar",de:"schließen",pt:"fechar",nl:"sluiten"},
  "commencer":{en:"to start",it:"cominciare",es:"empezar",de:"anfangen",pt:"começar",nl:"beginnen"},
  "finir":{en:"to finish",it:"finire",es:"terminar",de:"beenden",pt:"acabar",nl:"eindigen"},
  "aider":{en:"to help",it:"aiutare",es:"ayudar",de:"helfen",pt:"ajudar",nl:"helpen"},
  "habiter":{en:"to live",it:"abitare",es:"vivir",de:"wohnen",pt:"morar",nl:"wonen"},
  "porter":{en:"to carry",it:"portare",es:"llevar",de:"tragen",pt:"levar",nl:"dragen"},
  "essayer":{en:"to try",it:"provare",es:"intentar",de:"versuchen",pt:"tentar",nl:"proberen"},
  "apprendre":{en:"to learn",it:"imparare",es:"aprender",de:"lernen",pt:"aprender",nl:"leren"},
  "oublier":{en:"to forget",it:"dimenticare",es:"olvidar",de:"vergessen",pt:"esquecer",nl:"vergeten"},
  "montrer":{en:"to show",it:"mostrare",es:"mostrar",de:"zeigen",pt:"mostrar",nl:"laten zien"},
  "cuisine":{en:"kitchen",it:"cucina",es:"cocina",de:"Küche",pt:"cozinha",nl:"keuken"},
  "four":{en:"oven",it:"forno",es:"horno",de:"Ofen",pt:"forno",nl:"oven"},
  "frigo":{en:"fridge",it:"frigorifero",es:"nevera",de:"Kühlschrank",pt:"frigorífico",nl:"koelkast"},
  "bouteille":{en:"bottle",it:"bottiglia",es:"botella",de:"Flasche",pt:"garrafa",nl:"fles"},
  "recette":{en:"recipe",it:"ricetta",es:"receta",de:"Rezept",pt:"receita",nl:"recept"},
  "cuisiner":{en:"to cook",it:"cucinare",es:"cocinar",de:"kochen",pt:"cozinhar",nl:"koken"},
  "sel":{en:"salt",it:"sale",es:"sal",de:"Salz",pt:"sal",nl:"zout"},
  "poivre":{en:"pepper",it:"pepe",es:"pimienta",de:"Pfeffer",pt:"pimenta",nl:"peper"},
  "sucre":{en:"sugar",it:"zucchero",es:"azúcar",de:"Zucker",pt:"açúcar",nl:"suiker"},
  "huile":{en:"oil",it:"olio",es:"aceite",de:"Öl",pt:"óleo",nl:"olie"},
  "beurre":{en:"butter",it:"burro",es:"mantequilla",de:"Butter",pt:"manteiga",nl:"boter"},
  "farine":{en:"flour",it:"farina",es:"harina",de:"Mehl",pt:"farinha",nl:"meel"},
  "petit-déjeuner":{en:"breakfast",it:"colazione",es:"desayuno",de:"Frühstück",pt:"pequeno-almoço",nl:"ontbijt"},
  "déjeuner":{en:"lunch",it:"pranzo",es:"almuerzo",de:"Mittagessen",pt:"almoço",nl:"lunch"},
  "dîner":{en:"dinner",it:"cena",es:"cena",de:"Abendessen",pt:"jantar",nl:"avondeten"},
  "savon":{en:"soap",it:"sapone",es:"jabón",de:"Seife",pt:"sabonete",nl:"zeep"},
  "douche":{en:"shower",it:"doccia",es:"ducha",de:"Dusche",pt:"duche",nl:"douche"},
  "bain":{en:"bath",it:"bagno",es:"baño",de:"Bad",pt:"banho",nl:"bad"},
  "serviette":{en:"towel",it:"asciugamano",es:"toalla",de:"Handtuch",pt:"toalha",nl:"handdoek"},
  "se laver":{en:"to wash",it:"lavarsi",es:"lavarse",de:"sich waschen",pt:"lavar-se",nl:"zich wassen"},
  "brosse à dents":{en:"toothbrush",it:"spazzolino",es:"cepillo de dientes",de:"Zahnbürste",pt:"escova de dentes",nl:"tandenborstel"},
  "dentifrice":{en:"toothpaste",it:"dentifricio",es:"pasta de dientes",de:"Zahnpasta",pt:"pasta de dentes",nl:"tandpasta"},
  "miroir":{en:"mirror",it:"specchio",es:"espejo",de:"Spiegel",pt:"espelho",nl:"spiegel"},
  "peigne":{en:"comb",it:"pettine",es:"peine",de:"Kamm",pt:"pente",nl:"kam"},
  "shampoing":{en:"shampoo",it:"shampoo",es:"champú",de:"Shampoo",pt:"champô",nl:"shampoo"},
  "bibliothèque":{en:"library",it:"biblioteca",es:"biblioteca",de:"Bibliothek",pt:"biblioteca",nl:"bibliotheek"},
  "piscine":{en:"swimming pool",it:"piscina",es:"piscina",de:"Schwimmbad",pt:"piscina",nl:"zwembad"},
  "cinéma":{en:"cinema",it:"cinema",es:"cine",de:"Kino",pt:"cinema",nl:"bioscoop"},
  "théâtre":{en:"theatre",it:"teatro",es:"teatro",de:"Theater",pt:"teatro",nl:"theater"},
  "stade":{en:"stadium",it:"stadio",es:"estadio",de:"Stadion",pt:"estádio",nl:"stadion"},
  "place":{en:"square",it:"piazza",es:"plaza",de:"Platz",pt:"praça",nl:"plein"},
  "poste":{en:"post office",it:"posta",es:"correos",de:"Post",pt:"correios",nl:"postkantoor"},
  "mairie":{en:"town hall",it:"municipio",es:"ayuntamiento",de:"Rathaus",pt:"câmara municipal",nl:"stadhuis"},
  "boulangerie":{en:"bakery",it:"panetteria",es:"panadería",de:"Bäckerei",pt:"padaria",nl:"bakkerij"},
  "boucherie":{en:"butcher's shop",it:"macelleria",es:"carnicería",de:"Metzgerei",pt:"talho",nl:"slagerij"},
  "quartier":{en:"neighbourhood",it:"quartiere",es:"barrio",de:"Viertel",pt:"bairro",nl:"wijk"},
  "coin":{en:"corner",it:"angolo",es:"esquina",de:"Ecke",pt:"esquina",nl:"hoek"},
  "sous":{en:"under",it:"sotto",es:"debajo",de:"unter",pt:"debaixo",nl:"onder"},
  "sur":{en:"on",it:"su",es:"sobre",de:"auf",pt:"sobre",nl:"op"},
  "devant":{en:"in front",it:"davanti",es:"delante",de:"vor",pt:"à frente",nl:"vooraan"},
  "derrière":{en:"behind",it:"dietro",es:"detrás",de:"hinter",pt:"atrás",nl:"achter"},
  "entre":{en:"between",it:"tra",es:"entre",de:"zwischen",pt:"entre",nl:"tussen"},
  "à côté":{en:"next to",it:"accanto",es:"al lado",de:"daneben",pt:"ao lado",nl:"ernaast"},
  "en haut":{en:"up",it:"in alto",es:"arriba",de:"oben",pt:"em cima",nl:"boven"},
  "en bas":{en:"down",it:"in basso",es:"abajo",de:"unten",pt:"em baixo",nl:"beneden"},
  "tout droit":{en:"straight ahead",it:"dritto",es:"todo recto",de:"geradeaus",pt:"sempre em frente",nl:"rechtdoor"},
  "près":{en:"near",it:"vicino",es:"cerca",de:"nah",pt:"perto",nl:"dichtbij"},
  "loin":{en:"far",it:"lontano",es:"lejos",de:"weit",pt:"longe",nl:"ver"},
  "gratuit":{en:"free",it:"gratis",es:"gratis",de:"kostenlos",pt:"grátis",nl:"gratis"},
  "soldes":{en:"sales",it:"saldi",es:"rebajas",de:"Schlussverkauf",pt:"saldos",nl:"uitverkoop"},
  "liste":{en:"list",it:"lista",es:"lista",de:"Liste",pt:"lista",nl:"lijst"},
  "sac":{en:"bag",it:"borsa",es:"bolsa",de:"Tasche",pt:"saco",nl:"tas"},
  "panier":{en:"basket",it:"cesto",es:"cesta",de:"Korb",pt:"cesto",nl:"mand"},
  "cadeau":{en:"gift",it:"regalo",es:"regalo",de:"Geschenk",pt:"presente",nl:"cadeau"},
  "client":{en:"customer",it:"cliente",es:"cliente",de:"Kunde",pt:"cliente",nl:"klant"},
  "caisse":{en:"checkout",it:"cassa",es:"caja",de:"Kasse",pt:"caixa",nl:"kassa"},
  "ouvert":{en:"open",it:"aperto",es:"abierto",de:"geöffnet",pt:"aberto",nl:"open"},
  "fermé":{en:"closed",it:"chiuso",es:"cerrado",de:"geschlossen",pt:"fechado",nl:"gesloten"},
  "trop":{en:"too much",it:"troppo",es:"demasiado",de:"zu viel",pt:"demasiado",nl:"te veel"},
  "valise":{en:"suitcase",it:"valigia",es:"maleta",de:"Koffer",pt:"mala",nl:"koffer"},
  "passeport":{en:"passport",it:"passaporto",es:"pasaporte",de:"Reisepass",pt:"passaporte",nl:"paspoort"},
  "billet":{en:"ticket",it:"biglietto",es:"billete",de:"Ticket",pt:"bilhete",nl:"kaartje"},
  "bagage":{en:"luggage",it:"bagaglio",es:"equipaje",de:"Gepäck",pt:"bagagem",nl:"bagage"},
  "frontière":{en:"border",it:"frontiera",es:"frontera",de:"Grenze",pt:"fronteira",nl:"grens"},
  "douane":{en:"customs",it:"dogana",es:"aduana",de:"Zoll",pt:"alfândega",nl:"douane"},
  "départ":{en:"departure",it:"partenza",es:"salida",de:"Abfahrt",pt:"partida",nl:"vertrek"},
  "arrivée":{en:"arrival",it:"arrivo",es:"llegada",de:"Ankunft",pt:"chegada",nl:"aankomst"},
  "retard":{en:"delay",it:"ritardo",es:"retraso",de:"Verspätung",pt:"atraso",nl:"vertraging"},
  "réserver":{en:"to book",it:"prenotare",es:"reservar",de:"reservieren",pt:"reservar",nl:"reserveren"},
  "annuler":{en:"to cancel",it:"annullare",es:"cancelar",de:"stornieren",pt:"cancelar",nl:"annuleren"},
  "vacances":{en:"holidays",it:"vacanze",es:"vacaciones",de:"Urlaub",pt:"férias",nl:"vakantie"},
  "lourd":{en:"heavy",it:"pesante",es:"pesado",de:"schwer",pt:"pesado",nl:"zwaar"},
  "léger":{en:"light",it:"leggero",es:"ligero",de:"leicht",pt:"leve",nl:"licht"},
  "long":{en:"long",it:"lungo",es:"largo",de:"lang",pt:"longo",nl:"lang"},
  "court":{en:"short",it:"corto",es:"corto",de:"kurz",pt:"curto",nl:"kort"},
  "large":{en:"wide",it:"largo",es:"ancho",de:"breit",pt:"largo",nl:"breed"},
  "étroit":{en:"narrow",it:"stretto",es:"estrecho",de:"eng",pt:"estreito",nl:"smal"},
  "rapide":{en:"fast",it:"veloce",es:"rápido",de:"schnell",pt:"rápido",nl:"snel"},
  "lent":{en:"slow",it:"lento",es:"lento",de:"langsam",pt:"lento",nl:"langzaam"},
  "dangereux":{en:"dangerous",it:"pericoloso",es:"peligroso",de:"gefährlich",pt:"perigoso",nl:"gevaarlijk"},
  "sûr":{en:"safe",it:"sicuro",es:"seguro",de:"sicher",pt:"seguro",nl:"veilig"},
  "riche":{en:"rich",it:"ricco",es:"rico",de:"reich",pt:"rico",nl:"rijk"},
  "pauvre":{en:"poor",it:"povero",es:"pobre",de:"arm",pt:"pobre",nl:"arm"},
  "drôle":{en:"funny",it:"divertente",es:"gracioso",de:"lustig",pt:"engraçado",nl:"grappig"},
  "gentil":{en:"kind",it:"gentile",es:"amable",de:"nett",pt:"gentil",nl:"aardig"},
  "appeler":{en:"to call",it:"chiamare",es:"llamar",de:"anrufen",pt:"telefonar",nl:"bellen"},
  "répondre":{en:"to answer",it:"rispondere",es:"responder",de:"antworten",pt:"responder",nl:"antwoorden"},
  "demander":{en:"to ask",it:"chiedere",es:"preguntar",de:"fragen",pt:"perguntar",nl:"vragen"},
  "envoyer":{en:"to send",it:"inviare",es:"enviar",de:"schicken",pt:"enviar",nl:"sturen"},
  "recevoir":{en:"to receive",it:"ricevere",es:"recibir",de:"bekommen",pt:"receber",nl:"ontvangen"},
  "question":{en:"question",it:"domanda",es:"pregunta",de:"Frage",pt:"pergunta",nl:"vraag"},
  "réponse":{en:"answer",it:"risposta",es:"respuesta",de:"Antwort",pt:"resposta",nl:"antwoord"},
  "nouvelle":{en:"news",it:"notizia",es:"noticia",de:"Nachricht",pt:"notícia",nl:"nieuws"},
  "lettre":{en:"letter",it:"lettera",es:"carta",de:"Brief",pt:"carta",nl:"brief"},
  "adresse":{en:"address",it:"indirizzo",es:"dirección",de:"Adresse",pt:"morada",nl:"adres"},
  "e-mail":{en:"email",it:"email",es:"correo electrónico",de:"E-Mail",pt:"e-mail",nl:"e-mail"},
  "numéro":{en:"number",it:"numero",es:"número",de:"Nummer",pt:"número",nl:"nummer"},
  "rivière":{en:"river",it:"fiume",es:"río",de:"Fluss",pt:"rio",nl:"rivier"},
  "lac":{en:"lake",it:"lago",es:"lago",de:"See",pt:"lago",nl:"meer"},
  "forêt":{en:"forest",it:"foresta",es:"bosque",de:"Wald",pt:"floresta",nl:"bos"},
  "île":{en:"island",it:"isola",es:"isla",de:"Insel",pt:"ilha",nl:"eiland"},
  "colline":{en:"hill",it:"collina",es:"colina",de:"Hügel",pt:"colina",nl:"heuvel"},
  "champ":{en:"field",it:"campo",es:"campo",de:"Feld",pt:"campo",nl:"veld"},
  "herbe":{en:"grass",it:"erba",es:"hierba",de:"Gras",pt:"erva",nl:"gras"},
  "feuille":{en:"leaf",it:"foglia",es:"hoja",de:"Blatt",pt:"folha",nl:"blad"},
  "pierre":{en:"stone",it:"pietra",es:"piedra",de:"Stein",pt:"pedra",nl:"steen"},
  "terre":{en:"earth",it:"terra",es:"tierra",de:"Erde",pt:"terra",nl:"aarde"},
  "feu":{en:"fire",it:"fuoco",es:"fuego",de:"Feuer",pt:"fogo",nl:"vuur"},
  "étoile":{en:"star",it:"stella",es:"estrella",de:"Stern",pt:"estrela",nl:"ster"},
  "lion":{en:"lion",it:"leone",es:"león",de:"Löwe",pt:"leão",nl:"leeuw"},
  "tigre":{en:"tiger",it:"tigre",es:"tigre",de:"Tiger",pt:"tigre",nl:"tijger"},
  "éléphant":{en:"elephant",it:"elefante",es:"elefante",de:"Elefant",pt:"elefante",nl:"olifant"},
  "singe":{en:"monkey",it:"scimmia",es:"mono",de:"Affe",pt:"macaco",nl:"aap"},
  "ours":{en:"bear",it:"orso",es:"oso",de:"Bär",pt:"urso",nl:"beer"},
  "loup":{en:"wolf",it:"lupo",es:"lobo",de:"Wolf",pt:"lobo",nl:"wolf"},
  "renard":{en:"fox",it:"volpe",es:"zorro",de:"Fuchs",pt:"raposa",nl:"vos"},
  "serpent":{en:"snake",it:"serpente",es:"serpiente",de:"Schlange",pt:"cobra",nl:"slang"},
  "abeille":{en:"bee",it:"ape",es:"abeja",de:"Biene",pt:"abelha",nl:"bij"},
  "papillon":{en:"butterfly",it:"farfalla",es:"mariposa",de:"Schmetterling",pt:"borboleta",nl:"vlinder"},
  "araignée":{en:"spider",it:"ragno",es:"araña",de:"Spinne",pt:"aranha",nl:"spin"},
  "canard":{en:"duck",it:"anatra",es:"pato",de:"Ente",pt:"pato",nl:"eend"},
  "avec":{en:"with",it:"con",es:"con",de:"mit",pt:"com",nl:"met"},
  "sans":{en:"without",it:"senza",es:"sin",de:"ohne",pt:"sem",nl:"zonder"},
  "aussi":{en:"also",it:"anche",es:"también",de:"auch",pt:"também",nl:"ook"},
  "mais":{en:"but",it:"ma",es:"pero",de:"aber",pt:"mas",nl:"maar"},
  "parce que":{en:"because",it:"perché",es:"porque",de:"weil",pt:"porque",nl:"omdat"},
  "ou":{en:"or",it:"o",es:"o",de:"oder",pt:"ou",nl:"of"},
  "si":{en:"if",it:"se",es:"si",de:"wenn",pt:"se",nl:"als"},
  "donc":{en:"so",it:"quindi",es:"entonces",de:"also",pt:"portanto",nl:"dus"},
  "beaucoup":{en:"a lot",it:"molto",es:"mucho",de:"viel",pt:"muito",nl:"veel"},
  "peu":{en:"little",it:"poco",es:"poco",de:"wenig",pt:"pouco",nl:"weinig"},
  "très":{en:"very",it:"molto",es:"muy",de:"sehr",pt:"muito",nl:"heel"},
  "peut-être":{en:"maybe",it:"forse",es:"quizás",de:"vielleicht",pt:"talvez",nl:"misschien"},
  "quelque chose":{en:"something",it:"qualcosa",es:"algo",de:"etwas",pt:"alguma coisa",nl:"iets"},
  "rien":{en:"nothing",it:"niente",es:"nada",de:"nichts",pt:"nada",nl:"niets"},
  "tout":{en:"everything",it:"tutto",es:"todo",de:"alles",pt:"tudo",nl:"alles"},
  "quelqu'un":{en:"someone",it:"qualcuno",es:"alguien",de:"jemand",pt:"alguém",nl:"iemand"},
  "je cherche la gare":{en:"I am looking for the station",it:"cerco la stazione",es:"busco la estación",de:"ich suche den Bahnhof",pt:"procuro a estação",nl:"ik zoek het station"},
  "je me lave les mains":{en:"I wash my hands",it:"mi lavo le mani",es:"me lavo las manos",de:"ich wasche mir die Hände",pt:"lavo as mãos",nl:"ik was mijn handen"},
  "c'est trop cher":{en:"it is too expensive",it:"è troppo caro",es:"es demasiado caro",de:"das ist zu teuer",pt:"é demasiado caro",nl:"het is te duur"},
  "le magasin est ouvert":{en:"the shop is open",it:"il negozio è aperto",es:"la tienda está abierta",de:"das Geschäft ist geöffnet",pt:"a loja está aberta",nl:"de winkel is open"},
  "je réserve un hôtel":{en:"I book a hotel",it:"prenoto un hotel",es:"reservo un hotel",de:"ich reserviere ein Hotel",pt:"reservo um hotel",nl:"ik reserveer een hotel"},
  "je t'appelle demain":{en:"I will call you tomorrow",it:"ti chiamo domani",es:"te llamo mañana",de:"ich rufe dich morgen an",pt:"telefono-te amanhã",nl:"ik bel je morgen"},
  "la rivière est froide":{en:"the river is cold",it:"il fiume è freddo",es:"el río está frío",de:"der Fluss ist kalt",pt:"o rio está frio",nl:"de rivier is koud"},
  "l'abeille aime les fleurs":{en:"the bee likes flowers",it:"l'ape ama i fiori",es:"a la abeja le gustan las flores",de:"die Biene mag Blumen",pt:"a abelha gosta de flores",nl:"de bij houdt van bloemen"},
  "je voyage avec ma famille":{en:"I travel with my family",it:"viaggio con la mia famiglia",es:"viajo con mi familia",de:"ich reise mit meiner Familie",pt:"viajo com a minha família",nl:"ik reis met mijn familie"}
};
CURRICULUM_Z.forEach(function(u){ CURRICULUM.push(u); });
LANGS.forEach(function(l){ Object.keys(NEWV2).forEach(function(k){ if(NEWV2[k][l]) LEX[l][k]=NEWV2[k][l]; }); });

/* --- v2.57 « Enrichi +++ » : 2e grande vague (A2 solide → cap A2+/B1) — 16 unités, ~187 entrées.
   Toujours le même mécanisme à parité garantie. Portugais EUROPÉEN assumé partout
   (constipação, auscultadores, videojogo, ficheiro, descarregar, conduzir, turma…). --- */
var CURRICULUM_W = [
  { t:"La maison en détail 🛋", c:"#0ea5e9", L:[
    { t:"Les pièces", w:["salon","chambre","jardin","garage","étage","escalier"] },
    { t:"La structure", w:["toit","mur","sol","plafond","ascenseur","voisin"] }
  ]},
  { t:"Les objets du quotidien 🔑", c:"#f59e0b", L:[
    { t:"Sur moi", w:["montre","lunettes","parapluie","portefeuille","stylo","crayon"] },
    { t:"À la maison", w:["ciseaux","papier","journal","boîte","bougie"] }
  ]},
  { t:"Le caractère 💭", c:"#8b5cf6", L:[
    { t:"Les qualités", w:["intelligent","poli","courageux","honnête","patient","sympathique"] },
    { t:"Les traits", w:["timide","sérieux","paresseux","curieux","méchant","sévère"] }
  ]},
  { t:"Apprendre 🎓", c:"#10b981", L:[
    { t:"En classe", w:["élève","classe","leçon","examen","note","erreur","cahier"] },
    { t:"Les mots", w:["mot","phrase","langue","dictionnaire","page","sac à dos"] }
  ]},
  { t:"Le temps libre 🎨", c:"#ec4899", L:[
    { t:"Créer", w:["dessiner","peindre","chanson","guitare","piano"] },
    { t:"Sortir", w:["marcher","promenade","pêcher","fête","invité"] }
  ]},
  { t:"Les sens 👂", c:"#3b82f6", L:[
    { t:"Percevoir", w:["regarder","écouter","entendre","toucher","goûter"] },
    { t:"Le corps encore", w:["voix","peau","épaule","genou","cou","sourire"] }
  ]},
  { t:"La grande famille 👥", c:"#e11d48", L:[
    { t:"Les proches encore", w:["oncle","tante","cousin","neveu","nièce"] },
    { t:"Les gens", w:["mari","couple","adulte","personne"] }
  ]},
  { t:"Les mesures 📏", c:"#7c3aed", L:[
    { t:"Compter", w:["mètre","kilomètre","kilo","litre"] },
    { t:"Les parts", w:["moitié","quart","double","premier","dernier","prochain"] }
  ]},
  { t:"À table encore 🍲", c:"#f97316", L:[
    { t:"Les goûts", w:["goût","délicieux","sucré","salé","amer","épicé"], p:["c'est délicieux"] },
    { t:"La faim", w:["faim","soif","boisson","morceau","tranche"], p:["j'ai faim","j'ai soif"] }
  ]},
  { t:"Les métiers encore 💼", c:"#14b8a6", L:[
    { t:"Qui fait quoi", w:["métier","usine","vendeur","infirmier","pompier"] },
    { t:"En ville", w:["facteur","coiffeur","dentiste","gagner","perdre"] }
  ]},
  { t:"Le cœur encore 💗", c:"#a855f7", L:[
    { t:"Les élans", w:["espoir","joie","chance","rêve","espérer"], p:["je rêve de voyager"] },
    { t:"Les ombres", w:["colère","honte","souci","embrasser"] }
  ]},
  { t:"Chez le médecin 🏥", c:"#ef4444", L:[
    { t:"Les soucis", w:["rendez-vous","blessure","sang","tousser"] },
    { t:"Se soigner", w:["rhume","grippe","urgence","sain"] }
  ]},
  { t:"Le numérique 🖥", c:"#22c55e", L:[
    { t:"Les appareils", w:["imprimante","écouteurs","appareil photo","allumer","éteindre"] },
    { t:"En ligne encore", w:["fichier","site","réseau","jeu vidéo","télécharger"] }
  ]},
  { t:"Le monde 🌐", c:"#0ea5e9", L:[
    { t:"La carte", w:["pays","monde","capitale","drapeau"], p:["mon pays est beau"] },
    { t:"Les directions", w:["nord","sud","est","ouest"] },
    { t:"L'histoire", w:["roi","reine","guerre","paix"] }
  ]},
  { t:"Parler couramment 🗣", c:"#f6b73c", L:[
    { t:"Survivre", w:["je ne comprends pas","pouvez-vous répéter","je suis d'accord","ça ne fait rien","bien sûr"] },
    { t:"Être poli", w:["à bientôt","bon appétit","félicitations","bienvenue","attention"] }
  ]},
  { t:"Bouger partout 🏃", c:"#12b981", L:[
    { t:"Aller et venir", w:["entrer","sortir","monter","descendre","rester","partir"], p:["je reste à la maison","le train part à huit heures"] },
    { t:"En mouvement", w:["tomber","sauter","voler","conduire","arrêter","revenir"] }
  ]}
];
var NEWV3 = {
  "salon":{en:"living room",it:"soggiorno",es:"salón",de:"Wohnzimmer",pt:"sala de estar",nl:"woonkamer"},
  "chambre":{en:"bedroom",it:"camera",es:"habitación",de:"Schlafzimmer",pt:"quarto",nl:"slaapkamer"},
  "jardin":{en:"garden",it:"giardino",es:"jardín",de:"Garten",pt:"jardim",nl:"tuin"},
  "garage":{en:"garage",it:"garage",es:"garaje",de:"Garage",pt:"garagem",nl:"garage"},
  "étage":{en:"floor",it:"piano",es:"piso",de:"Etage",pt:"andar",nl:"verdieping"},
  "escalier":{en:"stairs",it:"scale",es:"escalera",de:"Treppe",pt:"escada",nl:"trap"},
  "toit":{en:"roof",it:"tetto",es:"tejado",de:"Dach",pt:"telhado",nl:"dak"},
  "mur":{en:"wall",it:"muro",es:"pared",de:"Wand",pt:"parede",nl:"muur"},
  "sol":{en:"floor",it:"pavimento",es:"suelo",de:"Boden",pt:"chão",nl:"vloer"},
  "plafond":{en:"ceiling",it:"soffitto",es:"techo",de:"Decke",pt:"teto",nl:"plafond"},
  "ascenseur":{en:"lift",it:"ascensore",es:"ascensor",de:"Aufzug",pt:"elevador",nl:"lift"},
  "voisin":{en:"neighbour",it:"vicino",es:"vecino",de:"Nachbar",pt:"vizinho",nl:"buurman"},
  "montre":{en:"watch",it:"orologio",es:"reloj",de:"Uhr",pt:"relógio",nl:"horloge"},
  "lunettes":{en:"glasses",it:"occhiali",es:"gafas",de:"Brille",pt:"óculos",nl:"bril"},
  "parapluie":{en:"umbrella",it:"ombrello",es:"paraguas",de:"Regenschirm",pt:"guarda-chuva",nl:"paraplu"},
  "portefeuille":{en:"wallet",it:"portafoglio",es:"cartera",de:"Brieftasche",pt:"carteira",nl:"portemonnee"},
  "stylo":{en:"pen",it:"penna",es:"bolígrafo",de:"Kugelschreiber",pt:"caneta",nl:"pen"},
  "crayon":{en:"pencil",it:"matita",es:"lápiz",de:"Bleistift",pt:"lápis",nl:"potlood"},
  "ciseaux":{en:"scissors",it:"forbici",es:"tijeras",de:"Schere",pt:"tesoura",nl:"schaar"},
  "papier":{en:"paper",it:"carta",es:"papel",de:"Papier",pt:"papel",nl:"papier"},
  "journal":{en:"newspaper",it:"giornale",es:"periódico",de:"Zeitung",pt:"jornal",nl:"krant"},
  "boîte":{en:"box",it:"scatola",es:"caja",de:"Schachtel",pt:"caixa",nl:"doos"},
  "bougie":{en:"candle",it:"candela",es:"vela",de:"Kerze",pt:"vela",nl:"kaars"},
  "intelligent":{en:"intelligent",it:"intelligente",es:"inteligente",de:"intelligent",pt:"inteligente",nl:"slim"},
  "poli":{en:"polite",it:"educato",es:"educado",de:"höflich",pt:"educado",nl:"beleefd"},
  "courageux":{en:"brave",it:"coraggioso",es:"valiente",de:"mutig",pt:"corajoso",nl:"moedig"},
  "honnête":{en:"honest",it:"onesto",es:"honesto",de:"ehrlich",pt:"honesto",nl:"eerlijk"},
  "patient":{en:"patient",it:"paziente",es:"paciente",de:"geduldig",pt:"paciente",nl:"geduldig"},
  "sympathique":{en:"nice",it:"simpatico",es:"simpático",de:"sympathisch",pt:"simpático",nl:"sympathiek"},
  "timide":{en:"shy",it:"timido",es:"tímido",de:"schüchtern",pt:"tímido",nl:"verlegen"},
  "sérieux":{en:"serious",it:"serio",es:"serio",de:"ernst",pt:"sério",nl:"serieus"},
  "paresseux":{en:"lazy",it:"pigro",es:"perezoso",de:"faul",pt:"preguiçoso",nl:"lui"},
  "curieux":{en:"curious",it:"curioso",es:"curioso",de:"neugierig",pt:"curioso",nl:"nieuwsgierig"},
  "méchant":{en:"mean",it:"cattivo",es:"malo",de:"böse",pt:"mau",nl:"gemeen"},
  "sévère":{en:"strict",it:"severo",es:"estricto",de:"streng",pt:"severo",nl:"streng"},
  "élève":{en:"pupil",it:"alunno",es:"alumno",de:"Schüler",pt:"aluno",nl:"leerling"},
  "classe":{en:"class",it:"classe",es:"clase",de:"Klasse",pt:"turma",nl:"klas"},
  "leçon":{en:"lesson",it:"lezione",es:"lección",de:"Lektion",pt:"lição",nl:"les"},
  "examen":{en:"exam",it:"esame",es:"examen",de:"Prüfung",pt:"exame",nl:"examen"},
  "note":{en:"grade",it:"voto",es:"nota",de:"Note",pt:"nota",nl:"cijfer"},
  "erreur":{en:"mistake",it:"errore",es:"error",de:"Fehler",pt:"erro",nl:"fout"},
  "cahier":{en:"notebook",it:"quaderno",es:"cuaderno",de:"Heft",pt:"caderno",nl:"schrift"},
  "mot":{en:"word",it:"parola",es:"palabra",de:"Wort",pt:"palavra",nl:"woord"},
  "phrase":{en:"sentence",it:"frase",es:"frase",de:"Satz",pt:"frase",nl:"zin"},
  "langue":{en:"language",it:"lingua",es:"idioma",de:"Sprache",pt:"língua",nl:"taal"},
  "dictionnaire":{en:"dictionary",it:"dizionario",es:"diccionario",de:"Wörterbuch",pt:"dicionário",nl:"woordenboek"},
  "page":{en:"page",it:"pagina",es:"página",de:"Seite",pt:"página",nl:"pagina"},
  "sac à dos":{en:"backpack",it:"zaino",es:"mochila",de:"Rucksack",pt:"mochila",nl:"rugzak"},
  "dessiner":{en:"to draw",it:"disegnare",es:"dibujar",de:"zeichnen",pt:"desenhar",nl:"tekenen"},
  "peindre":{en:"to paint",it:"dipingere",es:"pintar",de:"malen",pt:"pintar",nl:"schilderen"},
  "chanson":{en:"song",it:"canzone",es:"canción",de:"Lied",pt:"canção",nl:"lied"},
  "guitare":{en:"guitar",it:"chitarra",es:"guitarra",de:"Gitarre",pt:"guitarra",nl:"gitaar"},
  "piano":{en:"piano",it:"pianoforte",es:"piano",de:"Klavier",pt:"piano",nl:"piano"},
  "marcher":{en:"to walk",it:"camminare",es:"caminar",de:"zu Fuß gehen",pt:"caminhar",nl:"wandelen"},
  "promenade":{en:"walk",it:"passeggiata",es:"paseo",de:"Spaziergang",pt:"passeio",nl:"wandeling"},
  "pêcher":{en:"to fish",it:"pescare",es:"pescar",de:"angeln",pt:"pescar",nl:"vissen"},
  "fête":{en:"party",it:"festa",es:"fiesta",de:"Party",pt:"festa",nl:"feest"},
  "invité":{en:"guest",it:"ospite",es:"invitado",de:"Gast",pt:"convidado",nl:"gast"},
  "regarder":{en:"to watch",it:"guardare",es:"mirar",de:"schauen",pt:"olhar",nl:"kijken"},
  "écouter":{en:"to listen",it:"ascoltare",es:"escuchar",de:"zuhören",pt:"escutar",nl:"luisteren"},
  "entendre":{en:"to hear",it:"sentire",es:"oír",de:"hören",pt:"ouvir",nl:"horen"},
  "toucher":{en:"to touch",it:"toccare",es:"tocar",de:"berühren",pt:"tocar",nl:"aanraken"},
  "goûter":{en:"to taste",it:"assaggiare",es:"probar",de:"probieren",pt:"provar",nl:"proeven"},
  "voix":{en:"voice",it:"voce",es:"voz",de:"Stimme",pt:"voz",nl:"stem"},
  "peau":{en:"skin",it:"pelle",es:"piel",de:"Haut",pt:"pele",nl:"huid"},
  "épaule":{en:"shoulder",it:"spalla",es:"hombro",de:"Schulter",pt:"ombro",nl:"schouder"},
  "genou":{en:"knee",it:"ginocchio",es:"rodilla",de:"Knie",pt:"joelho",nl:"knie"},
  "cou":{en:"neck",it:"collo",es:"cuello",de:"Hals",pt:"pescoço",nl:"nek"},
  "sourire":{en:"smile",it:"sorriso",es:"sonrisa",de:"Lächeln",pt:"sorriso",nl:"glimlach"},
  "oncle":{en:"uncle",it:"zio",es:"tío",de:"Onkel",pt:"tio",nl:"oom"},
  "tante":{en:"aunt",it:"zia",es:"tía",de:"Tante",pt:"tia",nl:"tante"},
  "cousin":{en:"cousin",it:"cugino",es:"primo",de:"Cousin",pt:"primo",nl:"neef"},
  "neveu":{en:"nephew",it:"nipote",es:"sobrino",de:"Neffe",pt:"sobrinho",nl:"neefje"},
  "nièce":{en:"niece",it:"nipote",es:"sobrina",de:"Nichte",pt:"sobrinha",nl:"nichtje"},
  "mari":{en:"husband",it:"marito",es:"marido",de:"Ehemann",pt:"marido",nl:"echtgenoot"},
  "couple":{en:"couple",it:"coppia",es:"pareja",de:"Paar",pt:"casal",nl:"stel"},
  "adulte":{en:"adult",it:"adulto",es:"adulto",de:"Erwachsener",pt:"adulto",nl:"volwassene"},
  "personne":{en:"person",it:"persona",es:"persona",de:"Person",pt:"pessoa",nl:"persoon"},
  "mètre":{en:"metre",it:"metro",es:"metro",de:"Meter",pt:"metro",nl:"meter"},
  "kilomètre":{en:"kilometre",it:"chilometro",es:"kilómetro",de:"Kilometer",pt:"quilómetro",nl:"kilometer"},
  "kilo":{en:"kilo",it:"chilo",es:"kilo",de:"Kilo",pt:"quilo",nl:"kilo"},
  "litre":{en:"litre",it:"litro",es:"litro",de:"Liter",pt:"litro",nl:"liter"},
  "moitié":{en:"half",it:"metà",es:"mitad",de:"Hälfte",pt:"metade",nl:"helft"},
  "quart":{en:"quarter",it:"quarto",es:"cuarto",de:"Viertel",pt:"quarto",nl:"kwart"},
  "double":{en:"double",it:"doppio",es:"doble",de:"doppelt",pt:"dobro",nl:"dubbel"},
  "premier":{en:"first",it:"primo",es:"primero",de:"erste",pt:"primeiro",nl:"eerste"},
  "dernier":{en:"last",it:"ultimo",es:"último",de:"letzte",pt:"último",nl:"laatste"},
  "prochain":{en:"next",it:"prossimo",es:"próximo",de:"nächste",pt:"próximo",nl:"volgende"},
  "goût":{en:"taste",it:"gusto",es:"sabor",de:"Geschmack",pt:"sabor",nl:"smaak"},
  "délicieux":{en:"delicious",it:"delizioso",es:"delicioso",de:"lecker",pt:"delicioso",nl:"heerlijk"},
  "sucré":{en:"sweet",it:"dolce",es:"dulce",de:"süß",pt:"doce",nl:"zoet"},
  "salé":{en:"salty",it:"salato",es:"salado",de:"salzig",pt:"salgado",nl:"zout"},
  "amer":{en:"bitter",it:"amaro",es:"amargo",de:"bitter",pt:"amargo",nl:"bitter"},
  "épicé":{en:"spicy",it:"piccante",es:"picante",de:"scharf",pt:"picante",nl:"pittig"},
  "faim":{en:"hunger",it:"fame",es:"hambre",de:"Hunger",pt:"fome",nl:"honger"},
  "soif":{en:"thirst",it:"sete",es:"sed",de:"Durst",pt:"sede",nl:"dorst"},
  "boisson":{en:"drink",it:"bevanda",es:"bebida",de:"Getränk",pt:"bebida",nl:"drankje"},
  "morceau":{en:"piece",it:"pezzo",es:"trozo",de:"Stück",pt:"pedaço",nl:"stuk"},
  "tranche":{en:"slice",it:"fetta",es:"rebanada",de:"Scheibe",pt:"fatia",nl:"plak"},
  "métier":{en:"profession",it:"mestiere",es:"oficio",de:"Beruf",pt:"profissão",nl:"beroep"},
  "usine":{en:"factory",it:"fabbrica",es:"fábrica",de:"Fabrik",pt:"fábrica",nl:"fabriek"},
  "vendeur":{en:"salesman",it:"venditore",es:"vendedor",de:"Verkäufer",pt:"vendedor",nl:"verkoper"},
  "infirmier":{en:"nurse",it:"infermiere",es:"enfermero",de:"Krankenpfleger",pt:"enfermeiro",nl:"verpleger"},
  "pompier":{en:"firefighter",it:"pompiere",es:"bombero",de:"Feuerwehrmann",pt:"bombeiro",nl:"brandweerman"},
  "facteur":{en:"postman",it:"postino",es:"cartero",de:"Briefträger",pt:"carteiro",nl:"postbode"},
  "coiffeur":{en:"hairdresser",it:"parrucchiere",es:"peluquero",de:"Friseur",pt:"cabeleireiro",nl:"kapper"},
  "dentiste":{en:"dentist",it:"dentista",es:"dentista",de:"Zahnarzt",pt:"dentista",nl:"tandarts"},
  "gagner":{en:"to win",it:"vincere",es:"ganar",de:"gewinnen",pt:"ganhar",nl:"winnen"},
  "perdre":{en:"to lose",it:"perdere",es:"perder",de:"verlieren",pt:"perder",nl:"verliezen"},
  "espoir":{en:"hope",it:"speranza",es:"esperanza",de:"Hoffnung",pt:"esperança",nl:"hoop"},
  "joie":{en:"joy",it:"gioia",es:"alegría",de:"Freude",pt:"alegria",nl:"vreugde"},
  "chance":{en:"luck",it:"fortuna",es:"suerte",de:"Glück",pt:"sorte",nl:"geluk"},
  "rêve":{en:"dream",it:"sogno",es:"sueño",de:"Traum",pt:"sonho",nl:"droom"},
  "espérer":{en:"to hope",it:"sperare",es:"esperar",de:"hoffen",pt:"esperar",nl:"hopen"},
  "colère":{en:"anger",it:"rabbia",es:"enfado",de:"Wut",pt:"raiva",nl:"woede"},
  "honte":{en:"shame",it:"vergogna",es:"vergüenza",de:"Scham",pt:"vergonha",nl:"schaamte"},
  "souci":{en:"worry",it:"preoccupazione",es:"preocupación",de:"Sorge",pt:"preocupação",nl:"zorg"},
  "embrasser":{en:"to kiss",it:"baciare",es:"besar",de:"küssen",pt:"beijar",nl:"kussen"},
  "rendez-vous":{en:"appointment",it:"appuntamento",es:"cita",de:"Termin",pt:"consulta",nl:"afspraak"},
  "blessure":{en:"injury",it:"ferita",es:"herida",de:"Verletzung",pt:"ferida",nl:"wond"},
  "sang":{en:"blood",it:"sangue",es:"sangre",de:"Blut",pt:"sangue",nl:"bloed"},
  "tousser":{en:"to cough",it:"tossire",es:"toser",de:"husten",pt:"tossir",nl:"hoesten"},
  "rhume":{en:"cold",it:"raffreddore",es:"resfriado",de:"Erkältung",pt:"constipação",nl:"verkoudheid"},
  "grippe":{en:"flu",it:"influenza",es:"gripe",de:"Grippe",pt:"gripe",nl:"griep"},
  "urgence":{en:"emergency",it:"emergenza",es:"emergencia",de:"Notfall",pt:"emergência",nl:"noodgeval"},
  "sain":{en:"healthy",it:"sano",es:"sano",de:"gesund",pt:"saudável",nl:"gezond"},
  "imprimante":{en:"printer",it:"stampante",es:"impresora",de:"Drucker",pt:"impressora",nl:"printer"},
  "écouteurs":{en:"headphones",it:"cuffie",es:"auriculares",de:"Kopfhörer",pt:"auscultadores",nl:"koptelefoon"},
  "appareil photo":{en:"camera",it:"macchina fotografica",es:"cámara",de:"Kamera",pt:"máquina fotográfica",nl:"camera"},
  "allumer":{en:"to switch on",it:"accendere",es:"encender",de:"einschalten",pt:"ligar",nl:"aanzetten"},
  "éteindre":{en:"to switch off",it:"spegnere",es:"apagar",de:"ausschalten",pt:"desligar",nl:"uitzetten"},
  "fichier":{en:"file",it:"file",es:"archivo",de:"Datei",pt:"ficheiro",nl:"bestand"},
  "site":{en:"website",it:"sito",es:"sitio web",de:"Webseite",pt:"site",nl:"website"},
  "réseau":{en:"network",it:"rete",es:"red",de:"Netzwerk",pt:"rede",nl:"netwerk"},
  "jeu vidéo":{en:"video game",it:"videogioco",es:"videojuego",de:"Videospiel",pt:"videojogo",nl:"computerspel"},
  "télécharger":{en:"to download",it:"scaricare",es:"descargar",de:"herunterladen",pt:"descarregar",nl:"downloaden"},
  "pays":{en:"country",it:"paese",es:"país",de:"Land",pt:"país",nl:"land"},
  "monde":{en:"world",it:"mondo",es:"mundo",de:"Welt",pt:"mundo",nl:"wereld"},
  "capitale":{en:"capital",it:"capitale",es:"capital",de:"Hauptstadt",pt:"capital",nl:"hoofdstad"},
  "drapeau":{en:"flag",it:"bandiera",es:"bandera",de:"Flagge",pt:"bandeira",nl:"vlag"},
  "nord":{en:"north",it:"nord",es:"norte",de:"Norden",pt:"norte",nl:"noorden"},
  "sud":{en:"south",it:"sud",es:"sur",de:"Süden",pt:"sul",nl:"zuiden"},
  "est":{en:"east",it:"est",es:"este",de:"Osten",pt:"leste",nl:"oosten"},
  "ouest":{en:"west",it:"ovest",es:"oeste",de:"Westen",pt:"oeste",nl:"westen"},
  "roi":{en:"king",it:"re",es:"rey",de:"König",pt:"rei",nl:"koning"},
  "reine":{en:"queen",it:"regina",es:"reina",de:"Königin",pt:"rainha",nl:"koningin"},
  "guerre":{en:"war",it:"guerra",es:"guerra",de:"Krieg",pt:"guerra",nl:"oorlog"},
  "paix":{en:"peace",it:"pace",es:"paz",de:"Frieden",pt:"paz",nl:"vrede"},
  "je ne comprends pas":{en:"I don't understand",it:"non capisco",es:"no entiendo",de:"ich verstehe nicht",pt:"não percebo",nl:"ik begrijp het niet"},
  "pouvez-vous répéter":{en:"can you repeat",it:"può ripetere",es:"¿puede repetir?",de:"können Sie das wiederholen",pt:"pode repetir",nl:"kunt u dat herhalen"},
  "je suis d'accord":{en:"I agree",it:"sono d'accordo",es:"estoy de acuerdo",de:"ich stimme zu",pt:"concordo",nl:"ik ben het eens"},
  "ça ne fait rien":{en:"it doesn't matter",it:"non fa niente",es:"no importa",de:"das macht nichts",pt:"não faz mal",nl:"het geeft niet"},
  "bien sûr":{en:"of course",it:"certo",es:"por supuesto",de:"natürlich",pt:"claro",nl:"natuurlijk"},
  "à bientôt":{en:"see you soon",it:"a presto",es:"hasta pronto",de:"bis bald",pt:"até breve",nl:"tot snel"},
  "bon appétit":{en:"enjoy your meal",it:"buon appetito",es:"buen provecho",de:"guten Appetit",pt:"bom apetite",nl:"eet smakelijk"},
  "félicitations":{en:"congratulations",it:"congratulazioni",es:"enhorabuena",de:"herzlichen Glückwunsch",pt:"parabéns",nl:"gefeliciteerd"},
  "bienvenue":{en:"welcome",it:"benvenuto",es:"bienvenido",de:"willkommen",pt:"bem-vindo",nl:"welkom"},
  "attention":{en:"watch out",it:"attenzione",es:"cuidado",de:"Achtung",pt:"cuidado",nl:"pas op"},
  "entrer":{en:"to enter",it:"entrare",es:"entrar",de:"eintreten",pt:"entrar",nl:"binnenkomen"},
  "sortir":{en:"to go out",it:"uscire",es:"salir",de:"ausgehen",pt:"sair",nl:"uitgaan"},
  "monter":{en:"to go up",it:"salire",es:"subir",de:"hinaufgehen",pt:"subir",nl:"omhooggaan"},
  "descendre":{en:"to go down",it:"scendere",es:"bajar",de:"hinuntergehen",pt:"descer",nl:"naar beneden gaan"},
  "rester":{en:"to stay",it:"restare",es:"quedarse",de:"bleiben",pt:"ficar",nl:"blijven"},
  "partir":{en:"to leave",it:"partire",es:"irse",de:"weggehen",pt:"partir",nl:"vertrekken"},
  "tomber":{en:"to fall",it:"cadere",es:"caer",de:"fallen",pt:"cair",nl:"vallen"},
  "sauter":{en:"to jump",it:"saltare",es:"saltar",de:"springen",pt:"saltar",nl:"springen"},
  "voler":{en:"to fly",it:"volare",es:"volar",de:"fliegen",pt:"voar",nl:"vliegen"},
  "conduire":{en:"to drive",it:"guidare",es:"conducir",de:"fahren",pt:"conduzir",nl:"rijden"},
  "arrêter":{en:"to stop",it:"fermare",es:"parar",de:"anhalten",pt:"parar",nl:"stoppen"},
  "revenir":{en:"to come back",it:"tornare",es:"volver",de:"zurückkommen",pt:"voltar",nl:"terugkomen"},
  "c'est délicieux":{en:"it is delicious",it:"è delizioso",es:"está delicioso",de:"das ist lecker",pt:"está delicioso",nl:"het is heerlijk"},
  "j'ai faim":{en:"I am hungry",it:"ho fame",es:"tengo hambre",de:"ich habe Hunger",pt:"tenho fome",nl:"ik heb honger"},
  "j'ai soif":{en:"I am thirsty",it:"ho sete",es:"tengo sed",de:"ich habe Durst",pt:"tenho sede",nl:"ik heb dorst"},
  "je rêve de voyager":{en:"I dream of travelling",it:"sogno di viaggiare",es:"sueño con viajar",de:"ich träume vom Reisen",pt:"sonho em viajar",nl:"ik droom van reizen"},
  "mon pays est beau":{en:"my country is beautiful",it:"il mio paese è bello",es:"mi país es bonito",de:"mein Land ist schön",pt:"o meu país é bonito",nl:"mijn land is mooi"},
  "je reste à la maison":{en:"I stay at home",it:"resto a casa",es:"me quedo en casa",de:"ich bleibe zu Hause",pt:"fico em casa",nl:"ik blijf thuis"},
  "le train part à huit heures":{en:"the train leaves at eight",it:"il treno parte alle otto",es:"el tren sale a las ocho",de:"der Zug fährt um acht ab",pt:"o comboio parte às oito",nl:"de trein vertrekt om acht uur"}
};
CURRICULUM_W.forEach(function(u){ CURRICULUM.push(u); });
LANGS.forEach(function(l){ Object.keys(NEWV3).forEach(function(k){ if(NEWV3[k][l]) LEX[l][k]=NEWV3[k][l]; }); });

/* --- v2.58 : 3e vague — objectif franchir A2+ (800 mots maîtrisables). 12 unités, 145 entrées.
   Parité garantie (NEWV4). Portugais EUROPÉEN encore : camisola, fiambre, rebuçado, bolacha,
   gelado, compota, renda, poupar, multibanco, carta de condução, trânsito, algures, apenas… --- */
var CURRICULUM_V = [
  { t:"Bon appétit encore 🥐", c:"#f59e0b", L:[
    { t:"Au menu", w:["poulet","jambon","saucisse","pâtes","frites","champignon"] },
    { t:"Les douceurs", w:["miel","confiture","yaourt","glace","chocolat","bonbon","biscuit"] }
  ]},
  { t:"L'argent malin 🏦", c:"#10b981", L:[
    { t:"À la banque", w:["compte","facture","impôt","loyer","pièce","distributeur"] },
    { t:"Gérer", w:["économiser","dépenser","économies","reçu"] }
  ]},
  { t:"S'habiller encore 👗", c:"#ec4899", L:[
    { t:"La garde-robe", w:["jupe","pull","veste","chaussettes","gants","écharpe"] },
    { t:"Les détails", w:["ceinture","poche","bouton","taille","mode"] }
  ]},
  { t:"La routine du matin 🕐", c:"#3b82f6", L:[
    { t:"Se lancer", w:["se réveiller","se lever","s'habiller","réveil","se dépêcher"], p:["je me lève à sept heures"] },
    { t:"À la maison", w:["se coucher","préparer","nettoyer","ranger","repasser"] }
  ]},
  { t:"La vie qui passe 👶", c:"#8b5cf6", L:[
    { t:"Les étapes", w:["naître","grandir","mourir","vie","mort","âge"] },
    { t:"Les grands jours", w:["anniversaire","mariage","naissance","enfance"], p:["joyeux anniversaire","la vie est belle"] },
    { t:"Le fil du temps", w:["avenir","passé","souvenir"] }
  ]},
  { t:"Décrire le monde 🎨", c:"#f97316", L:[
    { t:"La matière", w:["clair","foncé","mouillé","sec","doux","dur"] },
    { t:"L'espace", w:["profond","haut","bas","moderne","ancien"] },
    { t:"L'ambiance", w:["bruyant","silencieux","bruit","ennuyeux","intéressant","célèbre"] }
  ]},
  { t:"Petits mots 2 ❓", c:"#a855f7", L:[
    { t:"Situer", w:["lequel","quelque part","nulle part","ensemble","seulement"] },
    { t:"Rythmer", w:["d'accord","vraiment","déjà","presque","ensuite","enfin","tout de suite"] }
  ]},
  { t:"Raconter 🗨", c:"#14b8a6", L:[
    { t:"Dire le monde", w:["raconter","décrire","répéter","traduire","signifier","histoire"] },
    { t:"Entre nous", w:["promettre","mentir","crier","remercier","inviter","souhaiter"] }
  ]},
  { t:"La planète 🌱", c:"#22c55e", L:[
    { t:"Protéger", w:["environnement","pollution","déchets","recycler","protéger","énergie"] },
    { t:"La Terre", w:["planète","climat","nature","air","sauvage","animal","paysage","lumière"] }
  ]},
  { t:"Les fêtes 🎉", c:"#e11d48", L:[
    { t:"Le calendrier", w:["Noël","Pâques","nouvel an","week-end","jour férié"] },
    { t:"Faire la fête", w:["surprise","ballon","feu d'artifice","invitation","carnaval"] }
  ]},
  { t:"Vrai ou faux ⚖", c:"#0ea5e9", L:[
    { t:"Juger", w:["vrai","faux","possible","impossible"], p:["je suis prêt"] },
    { t:"L'état", w:["utile","prêt","occupé","libre"] }
  ]},
  { t:"Sur la route 🚦", c:"#7c3aed", L:[
    { t:"Conduire", w:["permis","essence","station-service","se garer","vitesse"], p:["il y a trop de circulation"] },
    { t:"Le trajet", w:["feu rouge","carrefour","autoroute","circulation","accident"] }
  ]}
];
var NEWV4 = {
  "poulet":{en:"chicken",it:"pollo",es:"pollo",de:"Hähnchen",pt:"frango",nl:"kip"},
  "jambon":{en:"ham",it:"prosciutto",es:"jamón",de:"Schinken",pt:"fiambre",nl:"ham"},
  "saucisse":{en:"sausage",it:"salsiccia",es:"salchicha",de:"Wurst",pt:"salsicha",nl:"worst"},
  "pâtes":{en:"pasta",it:"pasta",es:"pasta",de:"Nudeln",pt:"massa",nl:"pasta"},
  "frites":{en:"fries",it:"patatine fritte",es:"patatas fritas",de:"Pommes",pt:"batatas fritas",nl:"friet"},
  "champignon":{en:"mushroom",it:"fungo",es:"champiñón",de:"Pilz",pt:"cogumelo",nl:"champignon"},
  "miel":{en:"honey",it:"miele",es:"miel",de:"Honig",pt:"mel",nl:"honing"},
  "confiture":{en:"jam",it:"marmellata",es:"mermelada",de:"Marmelade",pt:"compota",nl:"jam"},
  "yaourt":{en:"yoghurt",it:"yogurt",es:"yogur",de:"Joghurt",pt:"iogurte",nl:"yoghurt"},
  "glace":{en:"ice cream",it:"gelato",es:"helado",de:"Eis",pt:"gelado",nl:"ijsje"},
  "chocolat":{en:"chocolate",it:"cioccolato",es:"chocolate",de:"Schokolade",pt:"chocolate",nl:"chocolade"},
  "bonbon":{en:"sweet",it:"caramella",es:"caramelo",de:"Bonbon",pt:"rebuçado",nl:"snoepje"},
  "biscuit":{en:"biscuit",it:"biscotto",es:"galleta",de:"Keks",pt:"bolacha",nl:"koekje"},
  "compte":{en:"account",it:"conto",es:"cuenta",de:"Konto",pt:"conta",nl:"rekening"},
  "facture":{en:"invoice",it:"fattura",es:"factura",de:"Rechnung",pt:"fatura",nl:"factuur"},
  "impôt":{en:"tax",it:"tassa",es:"impuesto",de:"Steuer",pt:"imposto",nl:"belasting"},
  "loyer":{en:"rent",it:"affitto",es:"alquiler",de:"Miete",pt:"renda",nl:"huur"},
  "pièce":{en:"coin",it:"moneta",es:"moneda",de:"Münze",pt:"moeda",nl:"munt"},
  "distributeur":{en:"cash machine",it:"bancomat",es:"cajero",de:"Geldautomat",pt:"multibanco",nl:"geldautomaat"},
  "économiser":{en:"to save",it:"risparmiare",es:"ahorrar",de:"sparen",pt:"poupar",nl:"sparen"},
  "dépenser":{en:"to spend",it:"spendere",es:"gastar",de:"ausgeben",pt:"gastar",nl:"uitgeven"},
  "économies":{en:"savings",it:"risparmi",es:"ahorros",de:"Ersparnisse",pt:"poupanças",nl:"spaargeld"},
  "reçu":{en:"receipt",it:"ricevuta",es:"recibo",de:"Quittung",pt:"recibo",nl:"kassabon"},
  "jupe":{en:"skirt",it:"gonna",es:"falda",de:"Rock",pt:"saia",nl:"rok"},
  "pull":{en:"jumper",it:"maglione",es:"jersey",de:"Pullover",pt:"camisola",nl:"trui"},
  "veste":{en:"jacket",it:"giacca",es:"chaqueta",de:"Jacke",pt:"casaco",nl:"jasje"},
  "chaussettes":{en:"socks",it:"calzini",es:"calcetines",de:"Socken",pt:"meias",nl:"sokken"},
  "gants":{en:"gloves",it:"guanti",es:"guantes",de:"Handschuhe",pt:"luvas",nl:"handschoenen"},
  "écharpe":{en:"scarf",it:"sciarpa",es:"bufanda",de:"Schal",pt:"cachecol",nl:"sjaal"},
  "ceinture":{en:"belt",it:"cintura",es:"cinturón",de:"Gürtel",pt:"cinto",nl:"riem"},
  "poche":{en:"pocket",it:"tasca",es:"bolsillo",de:"Hosentasche",pt:"bolso",nl:"zak"},
  "bouton":{en:"button",it:"bottone",es:"botón",de:"Knopf",pt:"botão",nl:"knoop"},
  "taille":{en:"size",it:"taglia",es:"talla",de:"Größe",pt:"tamanho",nl:"maat"},
  "mode":{en:"fashion",it:"moda",es:"moda",de:"Mode",pt:"moda",nl:"mode"},
  "se réveiller":{en:"to wake up",it:"svegliarsi",es:"despertarse",de:"aufwachen",pt:"acordar",nl:"wakker worden"},
  "se lever":{en:"to get up",it:"alzarsi",es:"levantarse",de:"aufstehen",pt:"levantar-se",nl:"opstaan"},
  "s'habiller":{en:"to get dressed",it:"vestirsi",es:"vestirse",de:"sich anziehen",pt:"vestir-se",nl:"zich aankleden"},
  "réveil":{en:"alarm clock",it:"sveglia",es:"despertador",de:"Wecker",pt:"despertador",nl:"wekker"},
  "se dépêcher":{en:"to hurry",it:"sbrigarsi",es:"darse prisa",de:"sich beeilen",pt:"despachar-se",nl:"zich haasten"},
  "se coucher":{en:"to go to bed",it:"andare a letto",es:"acostarse",de:"schlafen gehen",pt:"deitar-se",nl:"naar bed gaan"},
  "préparer":{en:"to prepare",it:"preparare",es:"preparar",de:"vorbereiten",pt:"preparar",nl:"voorbereiden"},
  "nettoyer":{en:"to clean",it:"pulire",es:"limpiar",de:"putzen",pt:"limpar",nl:"schoonmaken"},
  "ranger":{en:"to tidy",it:"riordinare",es:"ordenar",de:"aufräumen",pt:"arrumar",nl:"opruimen"},
  "repasser":{en:"to iron",it:"stirare",es:"planchar",de:"bügeln",pt:"passar a ferro",nl:"strijken"},
  "naître":{en:"to be born",it:"nascere",es:"nacer",de:"geboren werden",pt:"nascer",nl:"geboren worden"},
  "grandir":{en:"to grow",it:"crescere",es:"crecer",de:"wachsen",pt:"crescer",nl:"groeien"},
  "mourir":{en:"to die",it:"morire",es:"morir",de:"sterben",pt:"morrer",nl:"sterven"},
  "vie":{en:"life",it:"vita",es:"vida",de:"Leben",pt:"vida",nl:"leven"},
  "mort":{en:"death",it:"morte",es:"muerte",de:"Tod",pt:"morte",nl:"dood"},
  "âge":{en:"age",it:"età",es:"edad",de:"Alter",pt:"idade",nl:"leeftijd"},
  "anniversaire":{en:"birthday",it:"compleanno",es:"cumpleaños",de:"Geburtstag",pt:"aniversário",nl:"verjaardag"},
  "mariage":{en:"wedding",it:"matrimonio",es:"boda",de:"Hochzeit",pt:"casamento",nl:"bruiloft"},
  "naissance":{en:"birth",it:"nascita",es:"nacimiento",de:"Geburt",pt:"nascimento",nl:"geboorte"},
  "enfance":{en:"childhood",it:"infanzia",es:"infancia",de:"Kindheit",pt:"infância",nl:"kindertijd"},
  "avenir":{en:"future",it:"futuro",es:"futuro",de:"Zukunft",pt:"futuro",nl:"toekomst"},
  "passé":{en:"past",it:"passato",es:"pasado",de:"Vergangenheit",pt:"passado",nl:"verleden"},
  "souvenir":{en:"memory",it:"ricordo",es:"recuerdo",de:"Erinnerung",pt:"lembrança",nl:"herinnering"},
  "clair":{en:"light",it:"chiaro",es:"claro",de:"hell",pt:"claro",nl:"licht"},
  "foncé":{en:"dark",it:"scuro",es:"oscuro",de:"dunkel",pt:"escuro",nl:"donker"},
  "mouillé":{en:"wet",it:"bagnato",es:"mojado",de:"nass",pt:"molhado",nl:"nat"},
  "sec":{en:"dry",it:"asciutto",es:"seco",de:"trocken",pt:"seco",nl:"droog"},
  "doux":{en:"soft",it:"morbido",es:"suave",de:"weich",pt:"macio",nl:"zacht"},
  "dur":{en:"hard",it:"duro",es:"duro",de:"hart",pt:"duro",nl:"hard"},
  "profond":{en:"deep",it:"profondo",es:"profundo",de:"tief",pt:"profundo",nl:"diep"},
  "haut":{en:"high",it:"alto",es:"alto",de:"hoch",pt:"alto",nl:"hoog"},
  "bas":{en:"low",it:"basso",es:"bajo",de:"niedrig",pt:"baixo",nl:"laag"},
  "moderne":{en:"modern",it:"moderno",es:"moderno",de:"modern",pt:"moderno",nl:"modern"},
  "ancien":{en:"ancient",it:"antico",es:"antiguo",de:"alt",pt:"antigo",nl:"oud"},
  "bruyant":{en:"noisy",it:"rumoroso",es:"ruidoso",de:"laut",pt:"barulhento",nl:"lawaaierig"},
  "silencieux":{en:"quiet",it:"silenzioso",es:"silencioso",de:"leise",pt:"silencioso",nl:"stil"},
  "bruit":{en:"noise",it:"rumore",es:"ruido",de:"Lärm",pt:"barulho",nl:"lawaai"},
  "ennuyeux":{en:"boring",it:"noioso",es:"aburrido",de:"langweilig",pt:"aborrecido",nl:"saai"},
  "intéressant":{en:"interesting",it:"interessante",es:"interesante",de:"interessant",pt:"interessante",nl:"interessant"},
  "célèbre":{en:"famous",it:"famoso",es:"famoso",de:"berühmt",pt:"famoso",nl:"beroemd"},
  "lequel":{en:"which one",it:"quale",es:"cuál",de:"welcher",pt:"qual",nl:"welke"},
  "quelque part":{en:"somewhere",it:"da qualche parte",es:"en alguna parte",de:"irgendwo",pt:"algures",nl:"ergens"},
  "nulle part":{en:"nowhere",it:"da nessuna parte",es:"en ninguna parte",de:"nirgendwo",pt:"em lado nenhum",nl:"nergens"},
  "ensemble":{en:"together",it:"insieme",es:"juntos",de:"zusammen",pt:"juntos",nl:"samen"},
  "seulement":{en:"only",it:"soltanto",es:"solamente",de:"nur",pt:"apenas",nl:"alleen"},
  "d'accord":{en:"okay",it:"va bene",es:"vale",de:"in Ordnung",pt:"está bem",nl:"akkoord"},
  "vraiment":{en:"really",it:"davvero",es:"realmente",de:"wirklich",pt:"realmente",nl:"echt"},
  "déjà":{en:"already",it:"già",es:"ya",de:"schon",pt:"já",nl:"al"},
  "presque":{en:"almost",it:"quasi",es:"casi",de:"fast",pt:"quase",nl:"bijna"},
  "ensuite":{en:"then",it:"poi",es:"luego",de:"danach",pt:"depois",nl:"daarna"},
  "enfin":{en:"finally",it:"infine",es:"por fin",de:"endlich",pt:"finalmente",nl:"eindelijk"},
  "tout de suite":{en:"right away",it:"subito",es:"enseguida",de:"sofort",pt:"imediatamente",nl:"meteen"},
  "raconter":{en:"to tell",it:"raccontare",es:"contar",de:"erzählen",pt:"contar",nl:"vertellen"},
  "décrire":{en:"to describe",it:"descrivere",es:"describir",de:"beschreiben",pt:"descrever",nl:"beschrijven"},
  "répéter":{en:"to repeat",it:"ripetere",es:"repetir",de:"wiederholen",pt:"repetir",nl:"herhalen"},
  "traduire":{en:"to translate",it:"tradurre",es:"traducir",de:"übersetzen",pt:"traduzir",nl:"vertalen"},
  "signifier":{en:"to mean",it:"significare",es:"significar",de:"bedeuten",pt:"significar",nl:"betekenen"},
  "histoire":{en:"story",it:"storia",es:"historia",de:"Geschichte",pt:"história",nl:"verhaal"},
  "promettre":{en:"to promise",it:"promettere",es:"prometer",de:"versprechen",pt:"prometer",nl:"beloven"},
  "mentir":{en:"to lie",it:"mentire",es:"mentir",de:"lügen",pt:"mentir",nl:"liegen"},
  "crier":{en:"to shout",it:"gridare",es:"gritar",de:"schreien",pt:"gritar",nl:"schreeuwen"},
  "remercier":{en:"to thank",it:"ringraziare",es:"agradecer",de:"danken",pt:"agradecer",nl:"bedanken"},
  "inviter":{en:"to invite",it:"invitare",es:"invitar",de:"einladen",pt:"convidar",nl:"uitnodigen"},
  "souhaiter":{en:"to wish",it:"augurare",es:"desear",de:"wünschen",pt:"desejar",nl:"wensen"},
  "environnement":{en:"environment",it:"ambiente",es:"medio ambiente",de:"Umwelt",pt:"ambiente",nl:"milieu"},
  "pollution":{en:"pollution",it:"inquinamento",es:"contaminación",de:"Verschmutzung",pt:"poluição",nl:"vervuiling"},
  "déchets":{en:"waste",it:"rifiuti",es:"basura",de:"Müll",pt:"lixo",nl:"afval"},
  "recycler":{en:"to recycle",it:"riciclare",es:"reciclar",de:"recyceln",pt:"reciclar",nl:"recyclen"},
  "protéger":{en:"to protect",it:"proteggere",es:"proteger",de:"schützen",pt:"proteger",nl:"beschermen"},
  "énergie":{en:"energy",it:"energia",es:"energía",de:"Energie",pt:"energia",nl:"energie"},
  "planète":{en:"planet",it:"pianeta",es:"planeta",de:"Planet",pt:"planeta",nl:"planeet"},
  "climat":{en:"climate",it:"clima",es:"clima",de:"Klima",pt:"clima",nl:"klimaat"},
  "nature":{en:"nature",it:"natura",es:"naturaleza",de:"Natur",pt:"natureza",nl:"natuur"},
  "air":{en:"air",it:"aria",es:"aire",de:"Luft",pt:"ar",nl:"lucht"},
  "sauvage":{en:"wild",it:"selvaggio",es:"salvaje",de:"wild",pt:"selvagem",nl:"wild"},
  "animal":{en:"animal",it:"animale",es:"animal",de:"Tier",pt:"animal",nl:"dier"},
  "paysage":{en:"landscape",it:"paesaggio",es:"paisaje",de:"Landschaft",pt:"paisagem",nl:"landschap"},
  "lumière":{en:"light",it:"luce",es:"luz",de:"Licht",pt:"luz",nl:"licht"},
  "Noël":{en:"Christmas",it:"Natale",es:"Navidad",de:"Weihnachten",pt:"Natal",nl:"Kerstmis"},
  "Pâques":{en:"Easter",it:"Pasqua",es:"Pascua",de:"Ostern",pt:"Páscoa",nl:"Pasen"},
  "nouvel an":{en:"New Year",it:"Capodanno",es:"Año Nuevo",de:"Neujahr",pt:"Ano Novo",nl:"Nieuwjaar"},
  "week-end":{en:"weekend",it:"fine settimana",es:"fin de semana",de:"Wochenende",pt:"fim de semana",nl:"weekend"},
  "jour férié":{en:"public holiday",it:"giorno festivo",es:"día festivo",de:"Feiertag",pt:"feriado",nl:"feestdag"},
  "surprise":{en:"surprise",it:"sorpresa",es:"sorpresa",de:"Überraschung",pt:"surpresa",nl:"verrassing"},
  "ballon":{en:"balloon",it:"palloncino",es:"globo",de:"Luftballon",pt:"balão",nl:"ballon"},
  "feu d'artifice":{en:"fireworks",it:"fuochi d'artificio",es:"fuegos artificiales",de:"Feuerwerk",pt:"fogo de artifício",nl:"vuurwerk"},
  "invitation":{en:"invitation",it:"invito",es:"invitación",de:"Einladung",pt:"convite",nl:"uitnodiging"},
  "carnaval":{en:"carnival",it:"carnevale",es:"carnaval",de:"Karneval",pt:"Carnaval",nl:"carnaval"},
  "vrai":{en:"true",it:"vero",es:"verdadero",de:"wahr",pt:"verdadeiro",nl:"waar"},
  "faux":{en:"false",it:"falso",es:"falso",de:"falsch",pt:"falso",nl:"fout"},
  "possible":{en:"possible",it:"possibile",es:"posible",de:"möglich",pt:"possível",nl:"mogelijk"},
  "impossible":{en:"impossible",it:"impossibile",es:"imposible",de:"unmöglich",pt:"impossível",nl:"onmogelijk"},
  "utile":{en:"useful",it:"utile",es:"útil",de:"nützlich",pt:"útil",nl:"nuttig"},
  "prêt":{en:"ready",it:"pronto",es:"listo",de:"bereit",pt:"pronto",nl:"klaar"},
  "occupé":{en:"busy",it:"occupato",es:"ocupado",de:"beschäftigt",pt:"ocupado",nl:"bezet"},
  "libre":{en:"free",it:"libero",es:"libre",de:"frei",pt:"livre",nl:"vrij"},
  "permis":{en:"driving licence",it:"patente",es:"carné de conducir",de:"Führerschein",pt:"carta de condução",nl:"rijbewijs"},
  "essence":{en:"petrol",it:"benzina",es:"gasolina",de:"Benzin",pt:"gasolina",nl:"benzine"},
  "station-service":{en:"petrol station",it:"stazione di servizio",es:"gasolinera",de:"Tankstelle",pt:"bomba de gasolina",nl:"tankstation"},
  "se garer":{en:"to park",it:"parcheggiare",es:"aparcar",de:"parken",pt:"estacionar",nl:"parkeren"},
  "vitesse":{en:"speed",it:"velocità",es:"velocidad",de:"Geschwindigkeit",pt:"velocidade",nl:"snelheid"},
  "feu rouge":{en:"traffic light",it:"semaforo",es:"semáforo",de:"Ampel",pt:"semáforo",nl:"stoplicht"},
  "carrefour":{en:"crossroads",it:"incrocio",es:"cruce",de:"Kreuzung",pt:"cruzamento",nl:"kruispunt"},
  "autoroute":{en:"motorway",it:"autostrada",es:"autopista",de:"Autobahn",pt:"autoestrada",nl:"snelweg"},
  "circulation":{en:"traffic",it:"traffico",es:"tráfico",de:"Verkehr",pt:"trânsito",nl:"verkeer"},
  "accident":{en:"accident",it:"incidente",es:"accidente",de:"Unfall",pt:"acidente",nl:"ongeluk"},
  "je me lève à sept heures":{en:"I get up at seven",it:"mi alzo alle sette",es:"me levanto a las siete",de:"ich stehe um sieben auf",pt:"levanto-me às sete",nl:"ik sta om zeven uur op"},
  "joyeux anniversaire":{en:"happy birthday",it:"buon compleanno",es:"feliz cumpleaños",de:"alles Gute zum Geburtstag",pt:"feliz aniversário",nl:"gefeliciteerd met je verjaardag"},
  "la vie est belle":{en:"life is beautiful",it:"la vita è bella",es:"la vida es bella",de:"das Leben ist schön",pt:"a vida é bela",nl:"het leven is mooi"},
  "je suis prêt":{en:"I am ready",it:"sono pronto",es:"estoy listo",de:"ich bin bereit",pt:"estou pronto",nl:"ik ben klaar"},
  "il y a trop de circulation":{en:"there is too much traffic",it:"c'è troppo traffico",es:"hay demasiado tráfico",de:"es gibt zu viel Verkehr",pt:"há muito trânsito",nl:"er is te veel verkeer"}
};
CURRICULUM_V.forEach(function(u){ CURRICULUM.push(u); });
LANGS.forEach(function(l){ Object.keys(NEWV4).forEach(function(k){ if(NEWV4[k][l]) LEX[l][k]=NEWV4[k][l]; }); });

/* --- EXTENSION v2.59 (vague 4, cap B1) : 12 unités — émotions fines, météo fine, cuisine du chef,
   logement, corps en action, magasin, études, temps précis, entraide, actualité, avis, monde.
   Parité garantie (NEWV5). Portugais EUROPÉEN toujours : stressado, húmido, tabuleiro, montra,
   secção, apanhar, partilhar, confio em ti — jamais la variante brésilienne. --- */
var CURRICULUM_U = [
  { t:"Émotions fines 💫", c:"#e879a9", L:[
    { t:"Ce que je ressens", w:["nerveux","déçu","jaloux","stressé"], p:[] },
    { t:"Bien dans sa peau", w:["détendu","ému","satisfait","reconnaissant"], p:[] } ]},
  { t:"Météo fine 🌦", c:"#60a5fa", L:[
    { t:"Le ciel gronde", w:["brouillard","éclair","tonnerre","arc-en-ciel","tempête"], p:["quel temps fait-il"] },
    { t:"Le thermomètre", w:["gel","degré","prévisions","humide","sécheresse"], p:[] } ]},
  { t:"Cuisine du chef 👨‍🍳", c:"#f59e0b", L:[
    { t:"Aux fourneaux", w:["bouillir","frire","griller","mélanger","couper","verser"], p:[] },
    { t:"Les ustensiles", w:["casserole","poêle","plateau","nappe","micro-ondes"], p:[] } ]},
  { t:"Le logement 🏘", c:"#a78bfa", L:[
    { t:"Mon immeuble", w:["appartement","immeuble","rez-de-chaussée","balcon","terrasse","cheminée"], p:[] },
    { t:"Meubler la maison", w:["meuble","canapé","armoire","tiroir","rideau","tapis"], p:[] },
    { t:"On déménage", w:["déménager"], p:["nous déménageons demain"] } ]},
  { t:"Le corps en action 💪", c:"#34d399", L:[
    { t:"Pousser et tirer", w:["pousser","tirer","lancer","attraper","tenir"], p:[] },
    { t:"Tout en muscles", w:["soulever","plier","frapper","glisser","grimper"], p:[] } ]},
  { t:"Au magasin 🛍", c:"#fb7185", L:[
    { t:"Dans les rayons", w:["rayon","vitrine","marque","qualité","choix"], p:[] },
    { t:"Bonnes affaires", w:["rembourser","échanger","promotion","comparer","choisir"], p:[] } ]},
  { t:"Les études 📖", c:"#38bdf8", L:[
    { t:"À la fac", w:["université","étudiant","cours","diplôme","échouer","étudier"], p:["j'étudie à l'université"] },
    { t:"Les matières", w:["matière","mathématiques","sciences","géographie","connaissance"], p:[] } ]},
  { t:"Le temps précis ⌚", c:"#fbbf24", L:[
    { t:"À la seconde", w:["seconde","instant","siècle","époque","midi","minuit"], p:[] },
    { t:"L'agenda", w:["date","calendrier","horaire","durée","pendant","depuis"], p:[] } ]},
  { t:"S'entraider 🤝", c:"#4ade80", L:[
    { t:"Compter l'un sur l'autre", w:["conseil","aide","service","soutien","confiance","respect"], p:["je te fais confiance"] },
    { t:"Gestes d'amitié", w:["amitié","partager","offrir","accueillir","défendre","visiter"], p:[] } ]},
  { t:"L'actualité 📰", c:"#94a3b8", L:[
    { t:"Les médias", w:["journaliste","article","radio","télévision","chaîne","publicité"], p:[] },
    { t:"La vie publique", w:["gouvernement","loi","élection","président"], p:[] },
    { t:"L'ordre et la liberté", w:["police","sécurité","liberté"], p:[] } ]},
  { t:"Exprimer son avis 🗣", c:"#f472b6", L:[
    { t:"Je pense que", w:["avis","préférer","décider","changer","douter","se tromper"], p:["à mon avis, c'est vrai"] },
    { t:"Convaincre", w:["convaincre","exemple","discussion","promesse","mensonge","secret"], p:[] } ]},
  { t:"Autour du monde 🧳", c:"#22d3ee", L:[
    { t:"Partir loin", w:["à l'étranger","culture","tradition","religion","touriste","guide"], p:[] },
    { t:"Merveilles à voir", w:["monument","château","tour","désert","aventure","carte postale"], p:[] } ]}
];
var NEWV5 = {
  "nerveux":{en:"nervous",it:"nervoso",es:"nervioso",de:"nervös",pt:"nervoso",nl:"zenuwachtig"},
  "déçu":{en:"disappointed",it:"deluso",es:"decepcionado",de:"enttäuscht",pt:"desiludido",nl:"teleurgesteld"},
  "jaloux":{en:"jealous",it:"geloso",es:"celoso",de:"eifersüchtig",pt:"ciumento",nl:"jaloers"},
  "stressé":{en:"stressed",it:"stressato",es:"estresado",de:"gestresst",pt:"stressado",nl:"gestrest"},
  "détendu":{en:"relaxed",it:"rilassato",es:"relajado",de:"entspannt",pt:"descontraído",nl:"ontspannen"},
  "ému":{en:"moved",it:"commosso",es:"emocionado",de:"gerührt",pt:"comovido",nl:"ontroerd"},
  "satisfait":{en:"satisfied",it:"soddisfatto",es:"satisfecho",de:"zufrieden",pt:"satisfeito",nl:"tevreden"},
  "reconnaissant":{en:"grateful",it:"grato",es:"agradecido",de:"dankbar",pt:"grato",nl:"dankbaar"},
  "brouillard":{en:"fog",it:"nebbia",es:"niebla",de:"Nebel",pt:"nevoeiro",nl:"mist"},
  "éclair":{en:"lightning",it:"fulmine",es:"relámpago",de:"Blitz",pt:"relâmpago",nl:"bliksem"},
  "tonnerre":{en:"thunder",it:"tuono",es:"trueno",de:"Donner",pt:"trovão",nl:"donder"},
  "arc-en-ciel":{en:"rainbow",it:"arcobaleno",es:"arcoíris",de:"Regenbogen",pt:"arco-íris",nl:"regenboog"},
  "tempête":{en:"storm",it:"tempesta",es:"tormenta",de:"Sturm",pt:"tempestade",nl:"storm"},
  "gel":{en:"frost",it:"gelo",es:"helada",de:"Frost",pt:"geada",nl:"vorst"},
  "degré":{en:"degree",it:"grado",es:"grado",de:"Grad",pt:"grau",nl:"graad"},
  "prévisions":{en:"forecast",it:"previsioni",es:"pronóstico",de:"Wettervorhersage",pt:"previsões",nl:"weersvoorspelling"},
  "humide":{en:"humid",it:"umido",es:"húmedo",de:"feucht",pt:"húmido",nl:"vochtig"},
  "sécheresse":{en:"drought",it:"siccità",es:"sequía",de:"Dürre",pt:"seca",nl:"droogte"},
  "bouillir":{en:"to boil",it:"bollire",es:"hervir",de:"kochen",pt:"ferver",nl:"koken"},
  "frire":{en:"to fry",it:"friggere",es:"freír",de:"braten",pt:"fritar",nl:"bakken"},
  "griller":{en:"to grill",it:"grigliare",es:"asar a la parrilla",de:"grillen",pt:"grelhar",nl:"grillen"},
  "mélanger":{en:"to mix",it:"mescolare",es:"mezclar",de:"mischen",pt:"misturar",nl:"mengen"},
  "couper":{en:"to cut",it:"tagliare",es:"cortar",de:"schneiden",pt:"cortar",nl:"snijden"},
  "verser":{en:"to pour",it:"versare",es:"verter",de:"gießen",pt:"verter",nl:"gieten"},
  "casserole":{en:"saucepan",it:"pentola",es:"cacerola",de:"Kochtopf",pt:"panela",nl:"pan"},
  "poêle":{en:"frying pan",it:"padella",es:"sartén",de:"Pfanne",pt:"frigideira",nl:"koekenpan"},
  "plateau":{en:"tray",it:"vassoio",es:"bandeja",de:"Tablett",pt:"tabuleiro",nl:"dienblad"},
  "nappe":{en:"tablecloth",it:"tovaglia",es:"mantel",de:"Tischdecke",pt:"toalha de mesa",nl:"tafelkleed"},
  "micro-ondes":{en:"microwave",it:"microonde",es:"microondas",de:"Mikrowelle",pt:"micro-ondas",nl:"magnetron"},
  "appartement":{en:"flat",it:"appartamento",es:"piso",de:"Wohnung",pt:"apartamento",nl:"appartement"},
  "immeuble":{en:"building",it:"palazzo",es:"edificio",de:"Gebäude",pt:"prédio",nl:"gebouw"},
  "rez-de-chaussée":{en:"ground floor",it:"pianterreno",es:"planta baja",de:"Erdgeschoss",pt:"rés-do-chão",nl:"begane grond"},
  "balcon":{en:"balcony",it:"balcone",es:"balcón",de:"Balkon",pt:"varanda",nl:"balkon"},
  "terrasse":{en:"terrace",it:"terrazza",es:"terraza",de:"Terrasse",pt:"terraço",nl:"terras"},
  "cheminée":{en:"fireplace",it:"camino",es:"chimenea",de:"Kamin",pt:"lareira",nl:"open haard"},
  "meuble":{en:"piece of furniture",it:"mobile",es:"mueble",de:"Möbelstück",pt:"móvel",nl:"meubel"},
  "canapé":{en:"sofa",it:"divano",es:"sofá",de:"Sofa",pt:"sofá",nl:"bank"},
  "armoire":{en:"wardrobe",it:"armadio",es:"armario",de:"Schrank",pt:"armário",nl:"kast"},
  "tiroir":{en:"drawer",it:"cassetto",es:"cajón",de:"Schublade",pt:"gaveta",nl:"lade"},
  "rideau":{en:"curtain",it:"tenda",es:"cortina",de:"Vorhang",pt:"cortina",nl:"gordijn"},
  "tapis":{en:"carpet",it:"tappeto",es:"alfombra",de:"Teppich",pt:"tapete",nl:"tapijt"},
  "déménager":{en:"to move house",it:"traslocare",es:"mudarse",de:"umziehen",pt:"mudar de casa",nl:"verhuizen"},
  "pousser":{en:"to push",it:"spingere",es:"empujar",de:"schieben",pt:"empurrar",nl:"duwen"},
  "tirer":{en:"to pull",it:"tirare",es:"tirar",de:"ziehen",pt:"puxar",nl:"trekken"},
  "lancer":{en:"to throw",it:"lanciare",es:"lanzar",de:"werfen",pt:"lançar",nl:"gooien"},
  "attraper":{en:"to catch",it:"afferrare",es:"atrapar",de:"fangen",pt:"apanhar",nl:"vangen"},
  "tenir":{en:"to hold",it:"tenere",es:"sostener",de:"halten",pt:"segurar",nl:"vasthouden"},
  "soulever":{en:"to lift",it:"sollevare",es:"levantar",de:"heben",pt:"levantar",nl:"optillen"},
  "plier":{en:"to fold",it:"piegare",es:"doblar",de:"falten",pt:"dobrar",nl:"vouwen"},
  "frapper":{en:"to hit",it:"colpire",es:"golpear",de:"schlagen",pt:"bater",nl:"slaan"},
  "glisser":{en:"to slip",it:"scivolare",es:"resbalar",de:"rutschen",pt:"escorregar",nl:"glijden"},
  "grimper":{en:"to climb",it:"arrampicarsi",es:"trepar",de:"klettern",pt:"trepar",nl:"klimmen"},
  "rayon":{en:"department",it:"reparto",es:"sección",de:"Abteilung",pt:"secção",nl:"afdeling"},
  "vitrine":{en:"shop window",it:"vetrina",es:"escaparate",de:"Schaufenster",pt:"montra",nl:"etalage"},
  "marque":{en:"brand",it:"marca",es:"marca",de:"Marke",pt:"marca",nl:"merk"},
  "qualité":{en:"quality",it:"qualità",es:"calidad",de:"Qualität",pt:"qualidade",nl:"kwaliteit"},
  "choix":{en:"choice",it:"scelta",es:"elección",de:"Auswahl",pt:"escolha",nl:"keuze"},
  "rembourser":{en:"to refund",it:"rimborsare",es:"reembolsar",de:"erstatten",pt:"reembolsar",nl:"terugbetalen"},
  "échanger":{en:"to exchange",it:"cambiare",es:"cambiar",de:"umtauschen",pt:"trocar",nl:"ruilen"},
  "promotion":{en:"special offer",it:"promozione",es:"oferta",de:"Sonderangebot",pt:"promoção",nl:"aanbieding"},
  "comparer":{en:"to compare",it:"confrontare",es:"comparar",de:"vergleichen",pt:"comparar",nl:"vergelijken"},
  "choisir":{en:"to choose",it:"scegliere",es:"elegir",de:"wählen",pt:"escolher",nl:"kiezen"},
  "université":{en:"university",it:"università",es:"universidad",de:"Universität",pt:"universidade",nl:"universiteit"},
  "étudiant":{en:"student",it:"studente",es:"estudiante",de:"Student",pt:"estudante",nl:"student"},
  "cours":{en:"class",it:"lezione",es:"clase",de:"Unterricht",pt:"aula",nl:"les"},
  "diplôme":{en:"degree",it:"diploma",es:"diploma",de:"Abschluss",pt:"diploma",nl:"diploma"},
  "échouer":{en:"to fail",it:"fallire",es:"fracasar",de:"scheitern",pt:"falhar",nl:"falen"},
  "étudier":{en:"to study",it:"studiare",es:"estudiar",de:"studieren",pt:"estudar",nl:"studeren"},
  "matière":{en:"subject",it:"materia",es:"asignatura",de:"Fach",pt:"disciplina",nl:"vak"},
  "mathématiques":{en:"mathematics",it:"matematica",es:"matemáticas",de:"Mathematik",pt:"matemática",nl:"wiskunde"},
  "sciences":{en:"science",it:"scienze",es:"ciencias",de:"Wissenschaften",pt:"ciências",nl:"wetenschappen"},
  "géographie":{en:"geography",it:"geografia",es:"geografía",de:"Geographie",pt:"geografia",nl:"aardrijkskunde"},
  "connaissance":{en:"knowledge",it:"conoscenza",es:"conocimiento",de:"Wissen",pt:"conhecimento",nl:"kennis"},
  "seconde":{en:"second",it:"secondo",es:"segundo",de:"Sekunde",pt:"segundo",nl:"seconde"},
  "instant":{en:"moment",it:"istante",es:"instante",de:"Augenblick",pt:"instante",nl:"ogenblik"},
  "siècle":{en:"century",it:"secolo",es:"siglo",de:"Jahrhundert",pt:"século",nl:"eeuw"},
  "époque":{en:"era",it:"epoca",es:"época",de:"Epoche",pt:"época",nl:"tijdperk"},
  "midi":{en:"noon",it:"mezzogiorno",es:"mediodía",de:"Mittag",pt:"meio-dia",nl:"middaguur"},
  "minuit":{en:"midnight",it:"mezzanotte",es:"medianoche",de:"Mitternacht",pt:"meia-noite",nl:"middernacht"},
  "date":{en:"date",it:"data",es:"fecha",de:"Datum",pt:"data",nl:"datum"},
  "calendrier":{en:"calendar",it:"calendario",es:"calendario",de:"Kalender",pt:"calendário",nl:"kalender"},
  "horaire":{en:"timetable",it:"orario",es:"horario",de:"Zeitplan",pt:"horário",nl:"rooster"},
  "durée":{en:"duration",it:"durata",es:"duración",de:"Dauer",pt:"duração",nl:"duur"},
  "pendant":{en:"during",it:"durante",es:"durante",de:"während",pt:"durante",nl:"tijdens"},
  "depuis":{en:"since",it:"da",es:"desde",de:"seit",pt:"desde",nl:"sinds"},
  "conseil":{en:"advice",it:"consiglio",es:"consejo",de:"Rat",pt:"conselho",nl:"advies"},
  "aide":{en:"help",it:"aiuto",es:"ayuda",de:"Hilfe",pt:"ajuda",nl:"hulp"},
  "service":{en:"service",it:"servizio",es:"servicio",de:"Dienst",pt:"serviço",nl:"dienst"},
  "soutien":{en:"support",it:"sostegno",es:"apoyo",de:"Unterstützung",pt:"apoio",nl:"steun"},
  "confiance":{en:"trust",it:"fiducia",es:"confianza",de:"Vertrauen",pt:"confiança",nl:"vertrouwen"},
  "respect":{en:"respect",it:"rispetto",es:"respeto",de:"Respekt",pt:"respeito",nl:"respect"},
  "amitié":{en:"friendship",it:"amicizia",es:"amistad",de:"Freundschaft",pt:"amizade",nl:"vriendschap"},
  "partager":{en:"to share",it:"condividere",es:"compartir",de:"teilen",pt:"partilhar",nl:"delen"},
  "offrir":{en:"to offer",it:"offrire",es:"ofrecer",de:"anbieten",pt:"oferecer",nl:"aanbieden"},
  "accueillir":{en:"to welcome",it:"accogliere",es:"acoger",de:"empfangen",pt:"acolher",nl:"verwelkomen"},
  "défendre":{en:"to defend",it:"difendere",es:"defender",de:"verteidigen",pt:"defender",nl:"verdedigen"},
  "visiter":{en:"to visit",it:"visitare",es:"visitar",de:"besuchen",pt:"visitar",nl:"bezoeken"},
  "journaliste":{en:"journalist",it:"giornalista",es:"periodista",de:"Journalist",pt:"jornalista",nl:"journalist"},
  "article":{en:"article",it:"articolo",es:"artículo",de:"Artikel",pt:"artigo",nl:"artikel"},
  "radio":{en:"radio",it:"radio",es:"radio",de:"Radio",pt:"rádio",nl:"radio"},
  "télévision":{en:"television",it:"televisione",es:"televisión",de:"Fernsehen",pt:"televisão",nl:"televisie"},
  "chaîne":{en:"channel",it:"canale",es:"canal",de:"Sender",pt:"canal",nl:"zender"},
  "publicité":{en:"advertising",it:"pubblicità",es:"publicidad",de:"Werbung",pt:"publicidade",nl:"reclame"},
  "gouvernement":{en:"government",it:"governo",es:"gobierno",de:"Regierung",pt:"governo",nl:"regering"},
  "loi":{en:"law",it:"legge",es:"ley",de:"Gesetz",pt:"lei",nl:"wet"},
  "élection":{en:"election",it:"elezione",es:"elección",de:"Wahl",pt:"eleição",nl:"verkiezing"},
  "président":{en:"president",it:"presidente",es:"presidente",de:"Präsident",pt:"presidente",nl:"president"},
  "police":{en:"police",it:"polizia",es:"policía",de:"Polizei",pt:"polícia",nl:"politie"},
  "sécurité":{en:"security",it:"sicurezza",es:"seguridad",de:"Sicherheit",pt:"segurança",nl:"veiligheid"},
  "liberté":{en:"freedom",it:"libertà",es:"libertad",de:"Freiheit",pt:"liberdade",nl:"vrijheid"},
  "avis":{en:"opinion",it:"opinione",es:"opinión",de:"Meinung",pt:"opinião",nl:"mening"},
  "préférer":{en:"to prefer",it:"preferire",es:"preferir",de:"bevorzugen",pt:"preferir",nl:"prefereren"},
  "décider":{en:"to decide",it:"decidere",es:"decidir",de:"entscheiden",pt:"decidir",nl:"beslissen"},
  "changer":{en:"to change",it:"cambiare",es:"cambiar",de:"ändern",pt:"mudar",nl:"veranderen"},
  "douter":{en:"to doubt",it:"dubitare",es:"dudar",de:"zweifeln",pt:"duvidar",nl:"twijfelen"},
  "se tromper":{en:"to be wrong",it:"sbagliarsi",es:"equivocarse",de:"sich irren",pt:"enganar-se",nl:"zich vergissen"},
  "convaincre":{en:"to convince",it:"convincere",es:"convencer",de:"überzeugen",pt:"convencer",nl:"overtuigen"},
  "exemple":{en:"example",it:"esempio",es:"ejemplo",de:"Beispiel",pt:"exemplo",nl:"voorbeeld"},
  "discussion":{en:"discussion",it:"discussione",es:"discusión",de:"Diskussion",pt:"discussão",nl:"discussie"},
  "promesse":{en:"promise",it:"promessa",es:"promesa",de:"Versprechen",pt:"promessa",nl:"belofte"},
  "mensonge":{en:"lie",it:"bugia",es:"mentira",de:"Lüge",pt:"mentira",nl:"leugen"},
  "secret":{en:"secret",it:"segreto",es:"secreto",de:"Geheimnis",pt:"segredo",nl:"geheim"},
  "à l'étranger":{en:"abroad",it:"all'estero",es:"en el extranjero",de:"im Ausland",pt:"no estrangeiro",nl:"in het buitenland"},
  "culture":{en:"culture",it:"cultura",es:"cultura",de:"Kultur",pt:"cultura",nl:"cultuur"},
  "tradition":{en:"tradition",it:"tradizione",es:"tradición",de:"Tradition",pt:"tradição",nl:"traditie"},
  "religion":{en:"religion",it:"religione",es:"religión",de:"Religion",pt:"religião",nl:"religie"},
  "touriste":{en:"tourist",it:"turista",es:"turista",de:"Tourist",pt:"turista",nl:"toerist"},
  "guide":{en:"guide",it:"guida",es:"guía",de:"Reiseleiter",pt:"guia",nl:"gids"},
  "monument":{en:"monument",it:"monumento",es:"monumento",de:"Denkmal",pt:"monumento",nl:"monument"},
  "château":{en:"castle",it:"castello",es:"castillo",de:"Schloss",pt:"castelo",nl:"kasteel"},
  "tour":{en:"tower",it:"torre",es:"torre",de:"Turm",pt:"torre",nl:"toren"},
  "désert":{en:"desert",it:"deserto",es:"desierto",de:"Wüste",pt:"deserto",nl:"woestijn"},
  "aventure":{en:"adventure",it:"avventura",es:"aventura",de:"Abenteuer",pt:"aventura",nl:"avontuur"},
  "carte postale":{en:"postcard",it:"cartolina",es:"postal",de:"Postkarte",pt:"postal",nl:"ansichtkaart"},
  "à mon avis, c'est vrai":{en:"in my opinion, it's true",it:"secondo me è vero",es:"en mi opinión, es verdad",de:"meiner Meinung nach ist das wahr",pt:"na minha opinião, é verdade",nl:"volgens mij is het waar"},
  "je te fais confiance":{en:"I trust you",it:"mi fido di te",es:"confío en ti",de:"ich vertraue dir",pt:"confio em ti",nl:"ik vertrouw je"},
  "quel temps fait-il":{en:"what's the weather like",it:"che tempo fa",es:"qué tiempo hace",de:"wie ist das Wetter",pt:"como está o tempo",nl:"wat voor weer is het"},
  "nous déménageons demain":{en:"we are moving tomorrow",it:"traslochiamo domani",es:"nos mudamos mañana",de:"wir ziehen morgen um",pt:"mudamos de casa amanhã",nl:"we verhuizen morgen"},
  "j'étudie à l'université":{en:"I study at university",it:"studio all'università",es:"estudio en la universidad",de:"ich studiere an der Universität",pt:"estudo na universidade",nl:"ik studeer aan de universiteit"}
};
CURRICULUM_U.forEach(function(u){ CURRICULUM.push(u); });
LANGS.forEach(function(l){ Object.keys(NEWV5).forEach(function(k){ if(NEWV5[k][l]) LEX[l][k]=NEWV5[k][l]; }); });

/* --- EXTENSION v2.61 (vague 5, cap B1) : 12 unités — docteur, carrière, nature, caractères,
   bricolage, urgences, restaurant, sorties, mots de liaison, pensée, argent, matières.
   Parité garantie (NEWV6). Portugais EUROPÉEN toujours : penso, reforma, trilho, chave de fendas,
   mal passado, exceto, espetáculo, lembro-me de ti — jamais la variante brésilienne. --- */
var CURRICULUM_T = [
  { t:"Chez le docteur 🩹", c:"#f87171", L:[
    { t:"En consultation", w:["ordonnance","vaccin","pansement","opération","piqûre","salle d'attente"], p:["j'ai besoin d'un médecin"] },
    { t:"Petits bobos", w:["éternuer","saigner","vertige","cicatrice","plâtre","béquilles"], p:[] } ]},
  { t:"La carrière 💼", c:"#818cf8", L:[
    { t:"Trouver sa place", w:["embaucher","candidature","expérience","compétence","formation","stage"], p:["je cherche du travail"] },
    { t:"Les tournants", w:["démissionner","licencier","retraite","chômage","augmentation","réussite"], p:[] } ]},
  { t:"Pleine nature 🏞", c:"#4ade80", L:[
    { t:"Relief sauvage", w:["vallée","falaise","cascade","rocher","sommet"], p:[] },
    { t:"Au bord de l'eau", w:["ruisseau","grotte","boue","sentier"], p:[] },
    { t:"Petites vies", w:["insecte","grenouille","branche","écorce","mousse"], p:[] } ]},
  { t:"Les caractères 🎭", c:"#fbbf24", L:[
    { t:"Qualités", w:["généreux","sage","modeste","sensible","aimable"], p:[] },
    { t:"Petits défauts", w:["égoïste","têtu","bavard","maladroit","franc"], p:[] } ]},
  { t:"Le bricolage 🔨", c:"#fb923c", L:[
    { t:"La boîte à outils", w:["marteau","clou","vis","tournevis","outil","pelle"], p:[] },
    { t:"Au travail", w:["réparer","percer","coller","mesurer","échelle"], p:[] },
    { t:"Le matériel", w:["pinceau","scie","tuyau","corde","fil"], p:[] } ]},
  { t:"Les urgences 🚨", c:"#ef4444", L:[
    { t:"Alerte !", w:["incendie","ambulance","secours","danger","alarme"], p:["il y a le feu"] },
    { t:"Rester prudent", w:["voleur","témoin","prudent","avertir","fuite"], p:[] } ]},
  { t:"Bien manger dehors 🍽", c:"#f59e0b", L:[
    { t:"À table !", w:["réservation","pourboire","commander","végétarien","saignant","bien cuit"], p:["l'addition, s'il vous plaît"] } ]},
  { t:"Sortir le soir 🎪", c:"#c084fc", L:[
    { t:"En scène", w:["concert","spectacle","chanteur","acteur","scène","applaudir"], p:["le spectacle commence à huit heures"] },
    { t:"L'affiche du soir", w:["exposition","ambiance","cirque","affiche","entracte"], p:[] } ]},
  { t:"Les mots de liaison 🔗", c:"#94a3b8", L:[
    { t:"Nuancer", w:["cependant","pourtant","malgré","sauf","environ","plutôt"], p:[] },
    { t:"Relier ses idées", w:["sans doute","d'ailleurs","en fait","au lieu de","grâce à","à cause de"], p:[] } ]},
  { t:"La pensée 🧠", c:"#38bdf8", L:[
    { t:"Se souvenir", w:["se souvenir","mémoire","reconnaître","regretter","deviner"], p:["je me souviens de toi"] },
    { t:"Imaginer demain", w:["imaginer","réfléchir","supposer","hésiter","prévoir"], p:[] } ]},
  { t:"Question d'argent 💶", c:"#34d399", L:[
    { t:"Prêter et rendre", w:["emprunter","prêter","dette","récompense"], p:["ça vaut la peine"] } ]},
  { t:"Les matières 🧵", c:"#a78bfa", L:[
    { t:"Dur comme le métal", w:["métal","plastique","bois","or","carton"], p:[] },
    { t:"Doux comme la soie", w:["coton","laine","cuir","soie","tissu"], p:[] } ]}
];
var NEWV6 = {
  "ordonnance":{en:"prescription",it:"ricetta",es:"receta",de:"Rezept",pt:"receita",nl:"recept"},
  "vaccin":{en:"vaccine",it:"vaccino",es:"vacuna",de:"Impfstoff",pt:"vacina",nl:"vaccin"},
  "pansement":{en:"plaster",it:"cerotto",es:"tirita",de:"Pflaster",pt:"penso",nl:"pleister"},
  "opération":{en:"operation",it:"operazione",es:"operación",de:"Operation",pt:"operação",nl:"operatie"},
  "piqûre":{en:"injection",it:"puntura",es:"inyección",de:"Spritze",pt:"injeção",nl:"prik"},
  "salle d'attente":{en:"waiting room",it:"sala d'attesa",es:"sala de espera",de:"Wartezimmer",pt:"sala de espera",nl:"wachtkamer"},
  "éternuer":{en:"to sneeze",it:"starnutire",es:"estornudar",de:"niesen",pt:"espirrar",nl:"niezen"},
  "saigner":{en:"to bleed",it:"sanguinare",es:"sangrar",de:"bluten",pt:"sangrar",nl:"bloeden"},
  "vertige":{en:"dizziness",it:"vertigini",es:"mareo",de:"Schwindel",pt:"tonturas",nl:"duizeligheid"},
  "cicatrice":{en:"scar",it:"cicatrice",es:"cicatriz",de:"Narbe",pt:"cicatriz",nl:"litteken"},
  "plâtre":{en:"cast",it:"gesso",es:"escayola",de:"Gips",pt:"gesso",nl:"gips"},
  "béquilles":{en:"crutches",it:"stampelle",es:"muletas",de:"Krücken",pt:"muletas",nl:"krukken"},
  "embaucher":{en:"to hire",it:"assumere",es:"contratar",de:"einstellen",pt:"contratar",nl:"aannemen"},
  "candidature":{en:"application",it:"candidatura",es:"candidatura",de:"Bewerbung",pt:"candidatura",nl:"sollicitatie"},
  "expérience":{en:"experience",it:"esperienza",es:"experiencia",de:"Erfahrung",pt:"experiência",nl:"ervaring"},
  "compétence":{en:"skill",it:"competenza",es:"competencia",de:"Kompetenz",pt:"competência",nl:"vaardigheid"},
  "formation":{en:"training",it:"formazione",es:"formación",de:"Ausbildung",pt:"formação",nl:"opleiding"},
  "stage":{en:"internship",it:"tirocinio",es:"prácticas",de:"Praktikum",pt:"estágio",nl:"stage"},
  "démissionner":{en:"to resign",it:"dimettersi",es:"dimitir",de:"kündigen",pt:"demitir-se",nl:"ontslag nemen"},
  "licencier":{en:"to dismiss",it:"licenziare",es:"despedir",de:"entlassen",pt:"despedir",nl:"ontslaan"},
  "retraite":{en:"retirement",it:"pensione",es:"jubilación",de:"Rente",pt:"reforma",nl:"pensioen"},
  "chômage":{en:"unemployment",it:"disoccupazione",es:"desempleo",de:"Arbeitslosigkeit",pt:"desemprego",nl:"werkloosheid"},
  "augmentation":{en:"pay rise",it:"aumento",es:"aumento",de:"Gehaltserhöhung",pt:"aumento",nl:"opslag"},
  "réussite":{en:"success",it:"successo",es:"éxito",de:"Erfolg",pt:"sucesso",nl:"succes"},
  "vallée":{en:"valley",it:"valle",es:"valle",de:"Tal",pt:"vale",nl:"vallei"},
  "falaise":{en:"cliff",it:"scogliera",es:"acantilado",de:"Klippe",pt:"falésia",nl:"klif"},
  "cascade":{en:"waterfall",it:"cascata",es:"cascada",de:"Wasserfall",pt:"cascata",nl:"waterval"},
  "rocher":{en:"rock",it:"roccia",es:"roca",de:"Felsen",pt:"rocha",nl:"rots"},
  "sommet":{en:"summit",it:"cima",es:"cumbre",de:"Gipfel",pt:"cume",nl:"top"},
  "ruisseau":{en:"stream",it:"ruscello",es:"arroyo",de:"Bach",pt:"ribeiro",nl:"beek"},
  "grotte":{en:"cave",it:"grotta",es:"cueva",de:"Höhle",pt:"gruta",nl:"grot"},
  "boue":{en:"mud",it:"fango",es:"barro",de:"Schlamm",pt:"lama",nl:"modder"},
  "sentier":{en:"path",it:"sentiero",es:"sendero",de:"Pfad",pt:"trilho",nl:"pad"},
  "insecte":{en:"insect",it:"insetto",es:"insecto",de:"Insekt",pt:"inseto",nl:"insect"},
  "grenouille":{en:"frog",it:"rana",es:"rana",de:"Frosch",pt:"rã",nl:"kikker"},
  "branche":{en:"branch",it:"ramo",es:"rama",de:"Ast",pt:"ramo",nl:"tak"},
  "écorce":{en:"bark",it:"corteccia",es:"corteza",de:"Rinde",pt:"casca",nl:"schors"},
  "mousse":{en:"moss",it:"muschio",es:"musgo",de:"Moos",pt:"musgo",nl:"mos"},
  "généreux":{en:"generous",it:"generoso",es:"generoso",de:"großzügig",pt:"generoso",nl:"vrijgevig"},
  "sage":{en:"wise",it:"saggio",es:"sabio",de:"weise",pt:"sábio",nl:"wijs"},
  "modeste":{en:"modest",it:"modesto",es:"modesto",de:"bescheiden",pt:"modesto",nl:"bescheiden"},
  "sensible":{en:"sensitive",it:"sensibile",es:"sensible",de:"sensibel",pt:"sensível",nl:"gevoelig"},
  "aimable":{en:"kind",it:"gentile",es:"amable",de:"freundlich",pt:"amável",nl:"vriendelijk"},
  "égoïste":{en:"selfish",it:"egoista",es:"egoísta",de:"egoistisch",pt:"egoísta",nl:"egoïstisch"},
  "têtu":{en:"stubborn",it:"testardo",es:"terco",de:"stur",pt:"teimoso",nl:"koppig"},
  "bavard":{en:"talkative",it:"chiacchierone",es:"hablador",de:"gesprächig",pt:"falador",nl:"spraakzaam"},
  "maladroit":{en:"clumsy",it:"maldestro",es:"torpe",de:"ungeschickt",pt:"desajeitado",nl:"onhandig"},
  "franc":{en:"frank",it:"franco",es:"franco",de:"offen",pt:"franco",nl:"openhartig"},
  "marteau":{en:"hammer",it:"martello",es:"martillo",de:"Hammer",pt:"martelo",nl:"hamer"},
  "clou":{en:"nail",it:"chiodo",es:"clavo",de:"Nagel",pt:"prego",nl:"spijker"},
  "vis":{en:"screw",it:"vite",es:"tornillo",de:"Schraube",pt:"parafuso",nl:"schroef"},
  "tournevis":{en:"screwdriver",it:"cacciavite",es:"destornillador",de:"Schraubenzieher",pt:"chave de fendas",nl:"schroevendraaier"},
  "outil":{en:"tool",it:"attrezzo",es:"herramienta",de:"Werkzeug",pt:"ferramenta",nl:"gereedschap"},
  "pelle":{en:"shovel",it:"pala",es:"pala",de:"Schaufel",pt:"pá",nl:"schep"},
  "réparer":{en:"to repair",it:"riparare",es:"reparar",de:"reparieren",pt:"reparar",nl:"repareren"},
  "percer":{en:"to drill",it:"forare",es:"taladrar",de:"bohren",pt:"furar",nl:"boren"},
  "coller":{en:"to glue",it:"incollare",es:"pegar",de:"kleben",pt:"colar",nl:"lijmen"},
  "mesurer":{en:"to measure",it:"misurare",es:"medir",de:"messen",pt:"medir",nl:"meten"},
  "échelle":{en:"ladder",it:"scala",es:"escalera",de:"Leiter",pt:"escada de mão",nl:"ladder"},
  "pinceau":{en:"paintbrush",it:"pennello",es:"pincel",de:"Pinsel",pt:"pincel",nl:"kwast"},
  "scie":{en:"saw",it:"sega",es:"sierra",de:"Säge",pt:"serra",nl:"zaag"},
  "tuyau":{en:"pipe",it:"tubo",es:"tubería",de:"Rohr",pt:"cano",nl:"buis"},
  "corde":{en:"rope",it:"corda",es:"cuerda",de:"Seil",pt:"corda",nl:"touw"},
  "fil":{en:"thread",it:"filo",es:"hilo",de:"Faden",pt:"fio",nl:"draad"},
  "incendie":{en:"fire",it:"incendio",es:"incendio",de:"Brand",pt:"incêndio",nl:"brand"},
  "ambulance":{en:"ambulance",it:"ambulanza",es:"ambulancia",de:"Krankenwagen",pt:"ambulância",nl:"ambulance"},
  "secours":{en:"rescue",it:"soccorso",es:"socorro",de:"Rettung",pt:"socorro",nl:"redding"},
  "danger":{en:"danger",it:"pericolo",es:"peligro",de:"Gefahr",pt:"perigo",nl:"gevaar"},
  "alarme":{en:"alarm",it:"allarme",es:"alarma",de:"Alarm",pt:"alarme",nl:"alarm"},
  "voleur":{en:"thief",it:"ladro",es:"ladrón",de:"Dieb",pt:"ladrão",nl:"dief"},
  "témoin":{en:"witness",it:"testimone",es:"testigo",de:"Zeuge",pt:"testemunha",nl:"getuige"},
  "prudent":{en:"careful",it:"prudente",es:"prudente",de:"vorsichtig",pt:"prudente",nl:"voorzichtig"},
  "avertir":{en:"to warn",it:"avvertire",es:"avisar",de:"warnen",pt:"avisar",nl:"waarschuwen"},
  "fuite":{en:"leak",it:"perdita",es:"fuga",de:"Leck",pt:"fuga",nl:"lek"},
  "réservation":{en:"reservation",it:"prenotazione",es:"reserva",de:"Reservierung",pt:"reserva",nl:"reservering"},
  "pourboire":{en:"tip",it:"mancia",es:"propina",de:"Trinkgeld",pt:"gorjeta",nl:"fooi"},
  "commander":{en:"to order",it:"ordinare",es:"pedir",de:"bestellen",pt:"pedir",nl:"bestellen"},
  "végétarien":{en:"vegetarian",it:"vegetariano",es:"vegetariano",de:"vegetarisch",pt:"vegetariano",nl:"vegetarisch"},
  "saignant":{en:"rare",it:"al sangue",es:"poco hecho",de:"blutig",pt:"mal passado",nl:"rood"},
  "bien cuit":{en:"well done",it:"ben cotto",es:"muy hecho",de:"durchgebraten",pt:"bem passado",nl:"doorbakken"},
  "concert":{en:"concert",it:"concerto",es:"concierto",de:"Konzert",pt:"concerto",nl:"concert"},
  "spectacle":{en:"show",it:"spettacolo",es:"espectáculo",de:"Vorstellung",pt:"espetáculo",nl:"voorstelling"},
  "chanteur":{en:"singer",it:"cantante",es:"cantante",de:"Sänger",pt:"cantor",nl:"zanger"},
  "acteur":{en:"actor",it:"attore",es:"actor",de:"Schauspieler",pt:"ator",nl:"acteur"},
  "scène":{en:"stage",it:"palcoscenico",es:"escenario",de:"Bühne",pt:"palco",nl:"podium"},
  "applaudir":{en:"to applaud",it:"applaudire",es:"aplaudir",de:"applaudieren",pt:"aplaudir",nl:"applaudisseren"},
  "exposition":{en:"exhibition",it:"mostra",es:"exposición",de:"Ausstellung",pt:"exposição",nl:"tentoonstelling"},
  "ambiance":{en:"atmosphere",it:"atmosfera",es:"ambiente",de:"Stimmung",pt:"ambiente",nl:"sfeer"},
  "cirque":{en:"circus",it:"circo",es:"circo",de:"Zirkus",pt:"circo",nl:"circus"},
  "affiche":{en:"poster",it:"manifesto",es:"cartel",de:"Plakat",pt:"cartaz",nl:"poster"},
  "entracte":{en:"interval",it:"intervallo",es:"intermedio",de:"Pause",pt:"intervalo",nl:"pauze"},
  "cependant":{en:"however",it:"tuttavia",es:"sin embargo",de:"jedoch",pt:"no entanto",nl:"echter"},
  "pourtant":{en:"yet",it:"eppure",es:"aun así",de:"dennoch",pt:"contudo",nl:"toch"},
  "malgré":{en:"despite",it:"nonostante",es:"a pesar de",de:"trotz",pt:"apesar de",nl:"ondanks"},
  "sauf":{en:"except",it:"tranne",es:"excepto",de:"außer",pt:"exceto",nl:"behalve"},
  "environ":{en:"about",it:"circa",es:"aproximadamente",de:"ungefähr",pt:"cerca de",nl:"ongeveer"},
  "plutôt":{en:"rather",it:"piuttosto",es:"más bien",de:"eher",pt:"de preferência",nl:"eerder"},
  "sans doute":{en:"probably",it:"probabilmente",es:"probablemente",de:"wahrscheinlich",pt:"provavelmente",nl:"waarschijnlijk"},
  "d'ailleurs":{en:"besides",it:"del resto",es:"por cierto",de:"übrigens",pt:"aliás",nl:"trouwens"},
  "en fait":{en:"actually",it:"in realtà",es:"en realidad",de:"eigentlich",pt:"na verdade",nl:"eigenlijk"},
  "au lieu de":{en:"instead of",it:"invece di",es:"en lugar de",de:"anstatt",pt:"em vez de",nl:"in plaats van"},
  "grâce à":{en:"thanks to",it:"grazie a",es:"gracias a",de:"dank",pt:"graças a",nl:"dankzij"},
  "à cause de":{en:"because of",it:"a causa di",es:"a causa de",de:"wegen",pt:"por causa de",nl:"vanwege"},
  "se souvenir":{en:"to remember",it:"ricordarsi",es:"acordarse",de:"sich erinnern",pt:"lembrar-se",nl:"zich herinneren"},
  "mémoire":{en:"memory",it:"memoria",es:"memoria",de:"Gedächtnis",pt:"memória",nl:"geheugen"},
  "reconnaître":{en:"to recognise",it:"riconoscere",es:"reconocer",de:"erkennen",pt:"reconhecer",nl:"herkennen"},
  "regretter":{en:"to regret",it:"rimpiangere",es:"lamentar",de:"bedauern",pt:"lamentar",nl:"betreuren"},
  "deviner":{en:"to guess",it:"indovinare",es:"adivinar",de:"erraten",pt:"adivinhar",nl:"raden"},
  "imaginer":{en:"to imagine",it:"immaginare",es:"imaginar",de:"sich vorstellen",pt:"imaginar",nl:"zich voorstellen"},
  "réfléchir":{en:"to think it over",it:"riflettere",es:"reflexionar",de:"nachdenken",pt:"refletir",nl:"nadenken"},
  "supposer":{en:"to suppose",it:"supporre",es:"suponer",de:"vermuten",pt:"supor",nl:"veronderstellen"},
  "hésiter":{en:"to hesitate",it:"esitare",es:"vacilar",de:"zögern",pt:"hesitar",nl:"aarzelen"},
  "prévoir":{en:"to foresee",it:"prevedere",es:"prever",de:"vorhersehen",pt:"prever",nl:"voorzien"},
  "emprunter":{en:"to borrow",it:"prendere in prestito",es:"pedir prestado",de:"sich leihen",pt:"pedir emprestado",nl:"lenen"},
  "prêter":{en:"to lend",it:"prestare",es:"prestar",de:"verleihen",pt:"emprestar",nl:"uitlenen"},
  "dette":{en:"debt",it:"debito",es:"deuda",de:"Schulden",pt:"dívida",nl:"schuld"},
  "récompense":{en:"reward",it:"ricompensa",es:"recompensa",de:"Belohnung",pt:"recompensa",nl:"beloning"},
  "métal":{en:"metal",it:"metallo",es:"metal",de:"Metall",pt:"metal",nl:"metaal"},
  "plastique":{en:"plastic",it:"plastica",es:"plástico",de:"Plastik",pt:"plástico",nl:"plastic"},
  "bois":{en:"wood",it:"legno",es:"madera",de:"Holz",pt:"madeira",nl:"hout"},
  "or":{en:"gold",it:"oro",es:"oro",de:"Gold",pt:"ouro",nl:"goud"},
  "carton":{en:"cardboard",it:"cartone",es:"cartón",de:"Pappe",pt:"cartão",nl:"karton"},
  "coton":{en:"cotton",it:"cotone",es:"algodón",de:"Baumwolle",pt:"algodão",nl:"katoen"},
  "laine":{en:"wool",it:"lana",es:"lana",de:"Wolle",pt:"lã",nl:"wol"},
  "cuir":{en:"leather",it:"cuoio",es:"cuero",de:"Leder",pt:"couro",nl:"leer"},
  "soie":{en:"silk",it:"seta",es:"seda",de:"Seide",pt:"seda",nl:"zijde"},
  "tissu":{en:"fabric",it:"tessuto",es:"tela",de:"Stoff",pt:"tecido",nl:"stof"},
  "j'ai besoin d'un médecin":{en:"I need a doctor",it:"ho bisogno di un medico",es:"necesito un médico",de:"ich brauche einen Arzt",pt:"preciso de um médico",nl:"ik heb een dokter nodig"},
  "je cherche du travail":{en:"I am looking for a job",it:"cerco lavoro",es:"busco trabajo",de:"ich suche Arbeit",pt:"procuro trabalho",nl:"ik zoek werk"},
  "il y a le feu":{en:"there is a fire",it:"c'è un incendio",es:"hay un incendio",de:"es brennt",pt:"há um incêndio",nl:"er is brand"},
  "l'addition, s'il vous plaît":{en:"the bill, please",it:"il conto, per favore",es:"la cuenta, por favor",de:"die Rechnung, bitte",pt:"a conta, por favor",nl:"de rekening, alstublieft"},
  "le spectacle commence à huit heures":{en:"the show starts at eight",it:"lo spettacolo inizia alle otto",es:"el espectáculo empieza a las ocho",de:"die Vorstellung beginnt um acht Uhr",pt:"o espetáculo começa às oito",nl:"de voorstelling begint om acht uur"},
  "je me souviens de toi":{en:"I remember you",it:"mi ricordo di te",es:"me acuerdo de ti",de:"ich erinnere mich an dich",pt:"lembro-me de ti",nl:"ik herinner me jou"},
  "ça vaut la peine":{en:"it's worth it",it:"ne vale la pena",es:"vale la pena",de:"es lohnt sich",pt:"vale a pena",nl:"het is de moeite waard"}
};
CURRICULUM_T.forEach(function(u){ CURRICULUM.push(u); });
LANGS.forEach(function(l){ Object.keys(NEWV6).forEach(function(k){ if(NEWV6[k][l]) LEX[l][k]=NEWV6[k][l]; }); });

/* --- EXTENSION v2.62 (vague 6, cap B1) : 14 unités — aéroport, gare, ville, ferme, sport,
   arts, poste, ménage, grande famille, grands jours, communiquer, verbes précieux, se repérer,
   fruits du verger. Parité garantie (NEWV7). Portugais EUROPÉEN toujours : descolagem, comboio,
   bilheteira, passadeira, quinta, equipa, golo, encomenda, loiça, gémeos, alperce, ananás. --- */
var CURRICULUM_S = [
  { t:"À l'aéroport 🛫", c:"#38bdf8", L:[
    { t:"Embarquement immédiat", w:["embarquement","décollage","atterrissage","bagage à main","hublot","piste"], p:[] } ]},
  { t:"À la gare 🚆", c:"#818cf8", L:[
    { t:"Prendre le train", w:["quai","guichet","aller simple","aller-retour","correspondance"], p:["le train est en retard","où est le quai"] } ]},
  { t:"La ville en détail 🏙", c:"#94a3b8", L:[
    { t:"Dans la rue", w:["trottoir","passage piéton","panneau","lampadaire","boîte aux lettres","rond-point"], p:[] },
    { t:"Autour de la place", w:["fontaine","statue","banlieue","centre-ville","tunnel"], p:[] } ]},
  { t:"À la ferme 🌾", c:"#a3e635", L:[
    { t:"Les champs", w:["ferme","récolte","semer","tracteur","blé"], p:[] },
    { t:"Les bâtiments", w:["grange","étable","poulailler","puits","épouvantail"], p:[] },
    { t:"Autour des bêtes", w:["troupeau","berger","foin","vigne","maïs"], p:[] } ]},
  { t:"Le sport en grand ⚽", c:"#34d399", L:[
    { t:"Le grand match", w:["équipe","match","but","arbitre","terrain","tournoi"], p:[] },
    { t:"Gagner et perdre", w:["victoire","défaite","entraînement","adversaire","champion","médaille"], p:[] } ]},
  { t:"L'atelier d'artiste 🎨", c:"#c084fc", L:[
    { t:"Peindre et sculpter", w:["peintre","tableau","sculpture","sculpteur","atelier","dessin"], p:[] },
    { t:"À la galerie", w:["œuvre","portrait","chef-d'œuvre","galerie","exposer"], p:[] } ]},
  { t:"À la poste 📮", c:"#fbbf24", L:[
    { t:"Envoyer un colis", w:["colis","timbre","enveloppe","livraison","expéditeur","destinataire"], p:[] },
    { t:"Au guichet", w:["formulaire","signature","tampon"], p:[] } ]},
  { t:"Le grand ménage 🧹", c:"#60a5fa", L:[
    { t:"Tout nettoyer", w:["balayer","aspirateur","lessive","vaisselle","poussière"], p:[] },
    { t:"Les bons outils", w:["balai","seau","éponge","serpillière"], p:[] } ]},
  { t:"La grande famille 👨‍👩‍👧", c:"#f472b6", L:[
    { t:"La belle-famille", w:["beau-père","belle-mère","gendre","belle-sœur","beau-frère","époux"], p:[] },
    { t:"Petits et grands", w:["jumeaux","aîné","cadet","petit-fils","petite-fille","veuf"], p:[] } ]},
  { t:"Les grands jours 💒", c:"#fb7185", L:[
    { t:"Jour de fête", w:["cérémonie","bouquet","alliance","discours"], p:["félicitations pour ton mariage"] },
    { t:"Les étapes de la vie", w:["baptême","enterrement"], p:[] } ]},
  { t:"Communiquer 🗣", c:"#22d3ee", L:[
    { t:"Prendre la parole", w:["annoncer","prévenir","saluer","interrompre","prononcer"], p:["puis-je vous aider"] },
    { t:"À voix basse", w:["bavarder","chuchoter","se plaindre","avouer","exagérer"], p:[] } ]},
  { t:"Verbes précieux ⚙️", c:"#e879a9", L:[
    { t:"Oser et mériter", w:["éviter","oser","mériter","atteindre","appartenir","dépendre"], p:["à qui appartient ce sac"] },
    { t:"Sembler et suffire", w:["sembler","paraître","exister","suffire","diminuer","augmenter"], p:[] },
    { t:"Du concret", w:["réclamer","emballer","serrer","lâcher"], p:[] } ]},
  { t:"Se repérer 🧭", c:"#fbbf24", L:[
    { t:"Dessus, dessous", w:["au-dessus","au-dessous","à travers","le long de","parmi","contre"], p:[] },
    { t:"Tout autour", w:["au fond de","autour","vers","en face","à l'intérieur","à l'extérieur","au milieu"], p:[] } ]},
  { t:"Les fruits du verger 🍓", c:"#f87171", L:[
    { t:"Fruits rouges", w:["framboise","cerise","prune","myrtille","pêche"], p:[] },
    { t:"Fruits du soleil", w:["abricot","melon","pastèque","ananas","concombre"], p:[] },
    { t:"Du potager au panier", w:["poireau","chou","noix","noisette","châtaigne"], p:[] } ]}
];
var NEWV7 = {
  "embarquement":{en:"boarding",it:"imbarco",es:"embarque",de:"Boarding",pt:"embarque",nl:"instappen"},
  "décollage":{en:"take-off",it:"decollo",es:"despegue",de:"Start",pt:"descolagem",nl:"opstijgen"},
  "atterrissage":{en:"landing",it:"atterraggio",es:"aterrizaje",de:"Landung",pt:"aterragem",nl:"landing"},
  "bagage à main":{en:"hand luggage",it:"bagaglio a mano",es:"equipaje de mano",de:"Handgepäck",pt:"bagagem de mão",nl:"handbagage"},
  "hublot":{en:"porthole",it:"oblò",es:"ojo de buey",de:"Bullauge",pt:"vigia",nl:"patrijspoort"},
  "piste":{en:"runway",it:"pista",es:"pista",de:"Landebahn",pt:"pista",nl:"landingsbaan"},
  "quai":{en:"platform",it:"binario",es:"andén",de:"Bahnsteig",pt:"cais",nl:"perron"},
  "guichet":{en:"ticket office",it:"sportello",es:"taquilla",de:"Schalter",pt:"bilheteira",nl:"loket"},
  "aller simple":{en:"single ticket",it:"solo andata",es:"billete de ida",de:"einfache Fahrkarte",pt:"bilhete de ida",nl:"enkele reis"},
  "aller-retour":{en:"return ticket",it:"andata e ritorno",es:"billete de ida y vuelta",de:"Hin- und Rückfahrkarte",pt:"bilhete de ida e volta",nl:"retourtje"},
  "correspondance":{en:"connection",it:"coincidenza",es:"transbordo",de:"Anschluss",pt:"ligação",nl:"overstap"},
  "trottoir":{en:"pavement",it:"marciapiede",es:"acera",de:"Bürgersteig",pt:"passeio",nl:"stoep"},
  "passage piéton":{en:"pedestrian crossing",it:"strisce pedonali",es:"paso de cebra",de:"Zebrastreifen",pt:"passadeira",nl:"zebrapad"},
  "panneau":{en:"road sign",it:"cartello",es:"señal",de:"Schild",pt:"sinal",nl:"verkeersbord"},
  "lampadaire":{en:"street lamp",it:"lampione",es:"farola",de:"Straßenlaterne",pt:"candeeiro de rua",nl:"lantaarnpaal"},
  "boîte aux lettres":{en:"letterbox",it:"cassetta delle lettere",es:"buzón",de:"Briefkasten",pt:"caixa do correio",nl:"brievenbus"},
  "rond-point":{en:"roundabout",it:"rotonda",es:"rotonda",de:"Kreisverkehr",pt:"rotunda",nl:"rotonde"},
  "fontaine":{en:"fountain",it:"fontana",es:"fuente",de:"Springbrunnen",pt:"fonte",nl:"fontein"},
  "statue":{en:"statue",it:"statua",es:"estatua",de:"Statue",pt:"estátua",nl:"standbeeld"},
  "banlieue":{en:"suburbs",it:"periferia",es:"afueras",de:"Vorort",pt:"subúrbio",nl:"buitenwijk"},
  "centre-ville":{en:"city centre",it:"centro città",es:"centro de la ciudad",de:"Innenstadt",pt:"centro da cidade",nl:"stadscentrum"},
  "tunnel":{en:"tunnel",it:"tunnel",es:"túnel",de:"Tunnel",pt:"túnel",nl:"tunnel"},
  "ferme":{en:"farm",it:"fattoria",es:"granja",de:"Bauernhof",pt:"quinta",nl:"boerderij"},
  "récolte":{en:"harvest",it:"raccolto",es:"cosecha",de:"Ernte",pt:"colheita",nl:"oogst"},
  "semer":{en:"to sow",it:"seminare",es:"sembrar",de:"säen",pt:"semear",nl:"zaaien"},
  "tracteur":{en:"tractor",it:"trattore",es:"tractor",de:"Traktor",pt:"trator",nl:"tractor"},
  "blé":{en:"wheat",it:"grano",es:"trigo",de:"Weizen",pt:"trigo",nl:"tarwe"},
  "grange":{en:"barn",it:"fienile",es:"granero",de:"Scheune",pt:"celeiro",nl:"schuur"},
  "étable":{en:"cowshed",it:"stalla",es:"establo",de:"Stall",pt:"estábulo",nl:"stal"},
  "poulailler":{en:"henhouse",it:"pollaio",es:"gallinero",de:"Hühnerstall",pt:"galinheiro",nl:"kippenhok"},
  "puits":{en:"well",it:"pozzo",es:"pozo",de:"Brunnen",pt:"poço",nl:"put"},
  "épouvantail":{en:"scarecrow",it:"spaventapasseri",es:"espantapájaros",de:"Vogelscheuche",pt:"espantalho",nl:"vogelverschrikker"},
  "troupeau":{en:"herd",it:"gregge",es:"rebaño",de:"Herde",pt:"rebanho",nl:"kudde"},
  "berger":{en:"shepherd",it:"pastore",es:"pastor",de:"Hirte",pt:"pastor",nl:"herder"},
  "foin":{en:"hay",it:"fieno",es:"heno",de:"Heu",pt:"feno",nl:"hooi"},
  "vigne":{en:"vine",it:"vigna",es:"viña",de:"Rebe",pt:"videira",nl:"wijnstok"},
  "maïs":{en:"corn",it:"mais",es:"maíz",de:"Mais",pt:"milho",nl:"maïs"},
  "équipe":{en:"team",it:"squadra",es:"equipo",de:"Mannschaft",pt:"equipa",nl:"ploeg"},
  "match":{en:"match",it:"partita",es:"partido",de:"Match",pt:"partida",nl:"wedstrijd"},
  "but":{en:"goal",it:"gol",es:"gol",de:"Tor",pt:"golo",nl:"doelpunt"},
  "arbitre":{en:"referee",it:"arbitro",es:"árbitro",de:"Schiedsrichter",pt:"árbitro",nl:"scheidsrechter"},
  "terrain":{en:"pitch",it:"campo da gioco",es:"terreno de juego",de:"Spielfeld",pt:"campo de jogos",nl:"speelveld"},
  "tournoi":{en:"tournament",it:"torneo",es:"torneo",de:"Turnier",pt:"torneio",nl:"toernooi"},
  "victoire":{en:"victory",it:"vittoria",es:"victoria",de:"Sieg",pt:"vitória",nl:"overwinning"},
  "défaite":{en:"defeat",it:"sconfitta",es:"derrota",de:"Niederlage",pt:"derrota",nl:"nederlaag"},
  "entraînement":{en:"practice",it:"allenamento",es:"entrenamiento",de:"Training",pt:"treino",nl:"training"},
  "adversaire":{en:"opponent",it:"avversario",es:"adversario",de:"Gegner",pt:"adversário",nl:"tegenstander"},
  "champion":{en:"champion",it:"campione",es:"campeón",de:"Meister",pt:"campeão",nl:"kampioen"},
  "médaille":{en:"medal",it:"medaglia",es:"medalla",de:"Medaille",pt:"medalha",nl:"medaille"},
  "peintre":{en:"painter",it:"pittore",es:"pintor",de:"Maler",pt:"pintor",nl:"schilder"},
  "tableau":{en:"painting",it:"quadro",es:"cuadro",de:"Gemälde",pt:"quadro",nl:"schilderij"},
  "sculpture":{en:"sculpture",it:"scultura",es:"escultura",de:"Skulptur",pt:"escultura",nl:"beeldhouwwerk"},
  "sculpteur":{en:"sculptor",it:"scultore",es:"escultor",de:"Bildhauer",pt:"escultor",nl:"beeldhouwer"},
  "atelier":{en:"studio",it:"atelier",es:"taller",de:"Atelier",pt:"atelier",nl:"atelier"},
  "dessin":{en:"drawing",it:"disegno",es:"dibujo",de:"Zeichnung",pt:"desenho",nl:"tekening"},
  "œuvre":{en:"work of art",it:"opera",es:"obra",de:"Werk",pt:"obra",nl:"kunstwerk"},
  "portrait":{en:"portrait",it:"ritratto",es:"retrato",de:"Porträt",pt:"retrato",nl:"portret"},
  "chef-d'œuvre":{en:"masterpiece",it:"capolavoro",es:"obra maestra",de:"Meisterwerk",pt:"obra-prima",nl:"meesterwerk"},
  "galerie":{en:"gallery",it:"galleria",es:"galería",de:"Galerie",pt:"galeria",nl:"galerie"},
  "exposer":{en:"to exhibit",it:"esporre",es:"exponer",de:"ausstellen",pt:"expor",nl:"tentoonstellen"},
  "colis":{en:"parcel",it:"pacco",es:"paquete",de:"Paket",pt:"encomenda",nl:"pakket"},
  "timbre":{en:"stamp",it:"francobollo",es:"sello",de:"Briefmarke",pt:"selo",nl:"postzegel"},
  "enveloppe":{en:"envelope",it:"busta",es:"sobre",de:"Umschlag",pt:"envelope",nl:"envelop"},
  "livraison":{en:"delivery",it:"consegna",es:"entrega",de:"Lieferung",pt:"entrega",nl:"bezorging"},
  "expéditeur":{en:"sender",it:"mittente",es:"remitente",de:"Absender",pt:"remetente",nl:"afzender"},
  "destinataire":{en:"recipient",it:"destinatario",es:"destinatario",de:"Empfänger",pt:"destinatário",nl:"ontvanger"},
  "formulaire":{en:"form",it:"modulo",es:"formulario",de:"Formular",pt:"formulário",nl:"formulier"},
  "signature":{en:"signature",it:"firma",es:"firma",de:"Unterschrift",pt:"assinatura",nl:"handtekening"},
  "tampon":{en:"rubber stamp",it:"timbro",es:"tampón",de:"Stempel",pt:"carimbo",nl:"stempel"},
  "balayer":{en:"to sweep",it:"spazzare",es:"barrer",de:"fegen",pt:"varrer",nl:"vegen"},
  "aspirateur":{en:"vacuum cleaner",it:"aspirapolvere",es:"aspiradora",de:"Staubsauger",pt:"aspirador",nl:"stofzuiger"},
  "lessive":{en:"laundry",it:"bucato",es:"colada",de:"Wäsche",pt:"lavagem da roupa",nl:"was"},
  "vaisselle":{en:"dishes",it:"stoviglie",es:"vajilla",de:"Geschirr",pt:"loiça",nl:"afwas"},
  "poussière":{en:"dust",it:"polvere",es:"polvo",de:"Staub",pt:"pó",nl:"stof"},
  "balai":{en:"broom",it:"scopa",es:"escoba",de:"Besen",pt:"vassoura",nl:"bezem"},
  "seau":{en:"bucket",it:"secchio",es:"cubo",de:"Eimer",pt:"balde",nl:"emmer"},
  "éponge":{en:"sponge",it:"spugna",es:"esponja",de:"Schwamm",pt:"esponja",nl:"spons"},
  "serpillière":{en:"mop",it:"mocio",es:"fregona",de:"Wischmopp",pt:"esfregona",nl:"dweil"},
  "beau-père":{en:"father-in-law",it:"suocero",es:"suegro",de:"Schwiegervater",pt:"sogro",nl:"schoonvader"},
  "belle-mère":{en:"mother-in-law",it:"suocera",es:"suegra",de:"Schwiegermutter",pt:"sogra",nl:"schoonmoeder"},
  "gendre":{en:"son-in-law",it:"genero",es:"yerno",de:"Schwiegersohn",pt:"genro",nl:"schoonzoon"},
  "belle-sœur":{en:"sister-in-law",it:"cognata",es:"cuñada",de:"Schwägerin",pt:"cunhada",nl:"schoonzus"},
  "beau-frère":{en:"brother-in-law",it:"cognato",es:"cuñado",de:"Schwager",pt:"cunhado",nl:"zwager"},
  "époux":{en:"spouse",it:"coniuge",es:"cónyuge",de:"Ehepartner",pt:"cônjuge",nl:"echtgenoot"},
  "jumeaux":{en:"twins",it:"gemelli",es:"gemelos",de:"Zwillinge",pt:"gémeos",nl:"tweeling"},
  "aîné":{en:"eldest",it:"primogenito",es:"primogénito",de:"der Älteste",pt:"primogénito",nl:"oudste"},
  "cadet":{en:"youngest",it:"il minore",es:"el menor",de:"der Jüngste",pt:"o mais novo",nl:"jongste"},
  "petit-fils":{en:"grandson",it:"nipotino",es:"nieto",de:"Enkel",pt:"neto",nl:"kleinzoon"},
  "petite-fille":{en:"granddaughter",it:"nipotina",es:"nieta",de:"Enkelin",pt:"neta",nl:"kleindochter"},
  "veuf":{en:"widower",it:"vedovo",es:"viudo",de:"Witwer",pt:"viúvo",nl:"weduwnaar"},
  "cérémonie":{en:"ceremony",it:"cerimonia",es:"ceremonia",de:"Zeremonie",pt:"cerimónia",nl:"ceremonie"},
  "bouquet":{en:"bouquet",it:"mazzo di fiori",es:"ramo de flores",de:"Blumenstrauß",pt:"ramo de flores",nl:"boeket"},
  "alliance":{en:"wedding ring",it:"fede",es:"alianza",de:"Ehering",pt:"aliança",nl:"trouwring"},
  "discours":{en:"speech",it:"discorso",es:"discurso",de:"Rede",pt:"discurso",nl:"toespraak"},
  "baptême":{en:"christening",it:"battesimo",es:"bautizo",de:"Taufe",pt:"batismo",nl:"doop"},
  "enterrement":{en:"funeral",it:"funerale",es:"entierro",de:"Beerdigung",pt:"funeral",nl:"begrafenis"},
  "annoncer":{en:"to announce",it:"annunciare",es:"anunciar",de:"ankündigen",pt:"anunciar",nl:"aankondigen"},
  "prévenir":{en:"to notify",it:"avvisare",es:"advertir",de:"benachrichtigen",pt:"prevenir",nl:"verwittigen"},
  "saluer":{en:"to greet",it:"salutare",es:"saludar",de:"grüßen",pt:"cumprimentar",nl:"groeten"},
  "interrompre":{en:"to interrupt",it:"interrompere",es:"interrumpir",de:"unterbrechen",pt:"interromper",nl:"onderbreken"},
  "prononcer":{en:"to pronounce",it:"pronunciare",es:"pronunciar",de:"aussprechen",pt:"pronunciar",nl:"uitspreken"},
  "bavarder":{en:"to chat",it:"chiacchierare",es:"charlar",de:"plaudern",pt:"conversar",nl:"kletsen"},
  "chuchoter":{en:"to whisper",it:"sussurrare",es:"susurrar",de:"flüstern",pt:"sussurrar",nl:"fluisteren"},
  "se plaindre":{en:"to complain",it:"lamentarsi",es:"quejarse",de:"sich beschweren",pt:"queixar-se",nl:"klagen"},
  "avouer":{en:"to confess",it:"confessare",es:"confesar",de:"gestehen",pt:"confessar",nl:"bekennen"},
  "exagérer":{en:"to exaggerate",it:"esagerare",es:"exagerar",de:"übertreiben",pt:"exagerar",nl:"overdrijven"},
  "éviter":{en:"to avoid",it:"evitare",es:"evitar",de:"vermeiden",pt:"evitar",nl:"vermijden"},
  "oser":{en:"to dare",it:"osare",es:"atreverse",de:"wagen",pt:"ousar",nl:"durven"},
  "mériter":{en:"to deserve",it:"meritare",es:"merecer",de:"verdienen",pt:"merecer",nl:"verdienen"},
  "atteindre":{en:"to reach",it:"raggiungere",es:"alcanzar",de:"erreichen",pt:"alcançar",nl:"bereiken"},
  "appartenir":{en:"to belong",it:"appartenere",es:"pertenecer",de:"gehören",pt:"pertencer",nl:"toebehoren"},
  "dépendre":{en:"to depend",it:"dipendere",es:"depender",de:"abhängen",pt:"depender",nl:"afhangen"},
  "sembler":{en:"to seem",it:"sembrare",es:"parecer",de:"scheinen",pt:"parecer",nl:"lijken"},
  "paraître":{en:"to appear",it:"apparire",es:"aparentar",de:"wirken",pt:"aparentar",nl:"schijnen"},
  "exister":{en:"to exist",it:"esistere",es:"existir",de:"existieren",pt:"existir",nl:"bestaan"},
  "suffire":{en:"to be enough",it:"bastare",es:"bastar",de:"genügen",pt:"bastar",nl:"volstaan"},
  "diminuer":{en:"to decrease",it:"diminuire",es:"disminuir",de:"verringern",pt:"diminuir",nl:"verminderen"},
  "augmenter":{en:"to increase",it:"aumentare",es:"aumentar",de:"erhöhen",pt:"aumentar",nl:"verhogen"},
  "réclamer":{en:"to demand",it:"reclamare",es:"reclamar",de:"fordern",pt:"reclamar",nl:"eisen"},
  "emballer":{en:"to wrap",it:"impacchettare",es:"envolver",de:"einpacken",pt:"embrulhar",nl:"inpakken"},
  "serrer":{en:"to tighten",it:"stringere",es:"apretar",de:"festziehen",pt:"apertar",nl:"aandraaien"},
  "lâcher":{en:"to let go",it:"mollare",es:"soltar",de:"loslassen",pt:"largar",nl:"loslaten"},
  "au-dessus":{en:"above",it:"al di sopra",es:"por encima",de:"oberhalb",pt:"por cima",nl:"erboven"},
  "au-dessous":{en:"below",it:"al di sotto",es:"por debajo",de:"unterhalb",pt:"por baixo",nl:"eronder"},
  "à travers":{en:"through",it:"attraverso",es:"a través de",de:"durch",pt:"através de",nl:"doorheen"},
  "le long de":{en:"along",it:"lungo",es:"a lo largo de",de:"entlang",pt:"ao longo de",nl:"langs"},
  "parmi":{en:"among",it:"fra",es:"en medio de",de:"inmitten",pt:"no meio de",nl:"te midden van"},
  "contre":{en:"against",it:"contro",es:"contra",de:"gegen",pt:"contra",nl:"tegen"},
  "au fond de":{en:"at the bottom of",it:"in fondo a",es:"en el fondo de",de:"am Grund von",pt:"no fundo de",nl:"onderin"},
  "autour":{en:"around",it:"intorno",es:"alrededor",de:"ringsum",pt:"à volta",nl:"rondom"},
  "vers":{en:"towards",it:"verso",es:"hacia",de:"in Richtung",pt:"em direção a",nl:"naar"},
  "en face":{en:"opposite",it:"di fronte",es:"enfrente",de:"gegenüber",pt:"em frente",nl:"tegenover"},
  "à l'intérieur":{en:"inside",it:"all'interno",es:"dentro",de:"drinnen",pt:"lá dentro",nl:"binnen"},
  "à l'extérieur":{en:"outside",it:"all'esterno",es:"en el exterior",de:"außerhalb",pt:"no exterior",nl:"aan de buitenkant"},
  "au milieu":{en:"in the middle",it:"in mezzo",es:"en medio",de:"in der Mitte",pt:"no meio",nl:"in het midden"},
  "framboise":{en:"raspberry",it:"lampone",es:"frambuesa",de:"Himbeere",pt:"framboesa",nl:"framboos"},
  "cerise":{en:"cherry",it:"ciliegia",es:"cereza",de:"Kirsche",pt:"cereja",nl:"kers"},
  "prune":{en:"plum",it:"prugna",es:"ciruela",de:"Pflaume",pt:"ameixa",nl:"pruim"},
  "myrtille":{en:"blueberry",it:"mirtillo",es:"arándano",de:"Blaubeere",pt:"mirtilo",nl:"bosbes"},
  "pêche":{en:"peach",it:"pesca",es:"melocotón",de:"Pfirsich",pt:"pêssego",nl:"perzik"},
  "abricot":{en:"apricot",it:"albicocca",es:"albaricoque",de:"Aprikose",pt:"alperce",nl:"abrikoos"},
  "melon":{en:"melon",it:"melone",es:"melón",de:"Melone",pt:"melão",nl:"meloen"},
  "pastèque":{en:"watermelon",it:"anguria",es:"sandía",de:"Wassermelone",pt:"melancia",nl:"watermeloen"},
  "ananas":{en:"pineapple",it:"ananas",es:"piña",de:"Ananas",pt:"ananás",nl:"ananas"},
  "concombre":{en:"cucumber",it:"cetriolo",es:"pepino",de:"Gurke",pt:"pepino",nl:"komkommer"},
  "poireau":{en:"leek",it:"porro",es:"puerro",de:"Lauch",pt:"alho-francês",nl:"prei"},
  "chou":{en:"cabbage",it:"cavolo",es:"col",de:"Kohl",pt:"couve",nl:"kool"},
  "noix":{en:"walnut",it:"noce",es:"nuez",de:"Walnuss",pt:"noz",nl:"walnoot"},
  "noisette":{en:"hazelnut",it:"nocciola",es:"avellana",de:"Haselnuss",pt:"avelã",nl:"hazelnoot"},
  "châtaigne":{en:"chestnut",it:"castagna",es:"castaña",de:"Kastanie",pt:"castanha",nl:"kastanje"},
  "le train est en retard":{en:"the train is late",it:"il treno è in ritardo",es:"el tren llega tarde",de:"der Zug hat Verspätung",pt:"o comboio está atrasado",nl:"de trein heeft vertraging"},
  "où est le quai":{en:"where is the platform",it:"dov'è il binario",es:"dónde está el andén",de:"wo ist der Bahnsteig",pt:"onde é o cais",nl:"waar is het perron"},
  "félicitations pour ton mariage":{en:"congratulations on your wedding",it:"congratulazioni per il tuo matrimonio",es:"felicidades por tu boda",de:"herzlichen Glückwunsch zur Hochzeit",pt:"parabéns pelo teu casamento",nl:"gefeliciteerd met je huwelijk"},
  "puis-je vous aider":{en:"may I help you",it:"posso aiutarla",es:"puedo ayudarle",de:"kann ich Ihnen helfen",pt:"posso ajudá-lo",nl:"kan ik u helpen"},
  "à qui appartient ce sac":{en:"whose bag is this",it:"di chi è questa borsa",es:"de quién es esta bolsa",de:"wem gehört diese Tasche",pt:"de quem é este saco",nl:"van wie is deze tas"}
};
CURRICULUM_S.forEach(function(u){ CURRICULUM.push(u); });
LANGS.forEach(function(l){ Object.keys(NEWV7).forEach(function(k){ if(NEWV7[k][l]) LEX[l][k]=NEWV7[k][l]; }); });

/* --- EXTENSION v2.63 (vague 7 — LE PALIER B1) : 19 unités — hôtel, mer, vie marine, espace,
   sciences, justice, histoire, voiture, corps, élégance, plein air, ustensiles, métiers, musique,
   catastrophes, adjectifs, verbes, mots du temps, expressions. Parité garantie (NEWV8).
   Portugais EUROPÉEN toujours : receção, almofada, foguetão, travão, fato, atacador, palhinha,
   canalizador, terramoto, dececionante, carregar, força, fazer figas. --- */
var CURRICULUM_R = [
  { t:"À l'hôtel 🏨", c:"#c084fc", L:[
    { t:"Bienvenue !", w:["réception","réceptionniste","chambre double","chambre simple","auberge"], p:[] },
    { t:"Une bonne nuit", w:["climatisation","chauffage","oreiller","couverture","drap"], p:[] } ]},
  { t:"En mer ⛵", c:"#38bdf8", L:[
    { t:"Larguer les amarres", w:["voile","ancre","équipage","capitaine","croisière","port"], p:[] },
    { t:"Face aux vagues", w:["phare","marée","mouette","filet","naufrage","bouée"], p:[] } ]},
  { t:"La vie marine 🦀", c:"#22d3ee", L:[
    { t:"Sous l'eau", w:["algue","coquillage","crabe","méduse","pieuvre"], p:[] } ]},
  { t:"L'espace 🚀", c:"#818cf8", L:[
    { t:"Décoller", w:["fusée","navette","satellite","astronaute","télescope","gravité"], p:[] },
    { t:"L'infini", w:["comète","galaxie","univers","étoile filante","ovni","extraterrestre"], p:[] } ]},
  { t:"Les sciences 🔬", c:"#34d399", L:[
    { t:"Au laboratoire", w:["chimie","physique","biologie","laboratoire","microscope"], p:[] },
    { t:"Chercher et trouver", w:["invention","découverte","chercheur","théorie","cerveau"], p:[] } ]},
  { t:"La justice ⚖️", c:"#94a3b8", L:[
    { t:"Au tribunal", w:["tribunal","juge","procès","preuve","plainte"], p:[] },
    { t:"Coupable ou innocent", w:["coupable","innocent","prison","amende","interdit"], p:[] } ]},
  { t:"Il était une fois 🏰", c:"#fbbf24", L:[
    { t:"Rois et chevaliers", w:["couronne","trône","chevalier","héros","empire"], p:["il était une fois"] },
    { t:"La grande bataille", w:["bataille","armée","soldat","révolution"], p:[] },
    { t:"Les armes d'antan", w:["épée","bouclier","flèche","canon"], p:[] } ]},
  { t:"Sous le capot 🚗", c:"#fb923c", L:[
    { t:"Au volant", w:["moteur","frein","pneu","volant","coffre","capot"], p:[] },
    { t:"Sur la route", w:["klaxon","rétroviseur","pare-brise","essuie-glace","embouteillage","panne"], p:[] } ]},
  { t:"Le corps au-dedans 🫀", c:"#f87171", L:[
    { t:"Les organes", w:["poumon","estomac","foie","muscle","squelette","veine"], p:[] },
    { t:"Des pieds à la tête", w:["côte","cheville","poignet","menton","hanche","mollet"], p:[] },
    { t:"Le visage en détail", w:["sourcil","cil","paupière","nuque","paume"], p:[] } ]},
  { t:"L'élégance 👔", c:"#e879a9", L:[
    { t:"Sur son trente-et-un", w:["costume","cravate","nœud papillon","gilet","imperméable","bretelles"], p:[] },
    { t:"Les finitions", w:["fermeture éclair","talon","semelle","lacet","col","manche"], p:[] } ]},
  { t:"Le plein air 🏕", c:"#4ade80", L:[
    { t:"Partir camper", w:["camping","tente","sac de couchage","lampe de poche","hamac"], p:[] },
    { t:"L'aventure", w:["randonnée","chasse","boussole","jumelles","feu de camp"], p:[] } ]},
  { t:"Ustensiles malins 🍽", c:"#f59e0b", L:[
    { t:"Dans le tiroir", w:["fouet","louche","passoire","râpe","entonnoir"], p:[] },
    { t:"À déboucher", w:["couvercle","bouchon","tire-bouchon","glaçon","paille"], p:[] } ]},
  { t:"Les métiers 🛠", c:"#a78bfa", L:[
    { t:"Les mains d'or", w:["plombier","électricien","menuisier","bijoutier"], p:[] },
    { t:"Au service de tous", w:["vétérinaire","pêcheur","chauffeur","fleuriste"], p:[] } ]},
  { t:"En musique 🎻", c:"#f472b6", L:[
    { t:"L'orchestre", w:["orchestre","violon","flûte","trompette"], p:[] },
    { t:"En rythme", w:["mélodie","rythme","chorale","tambour"], p:[] } ]},
  { t:"La Terre en colère 🌋", c:"#ef4444", L:[
    { t:"Catastrophes naturelles", w:["volcan","inondation","tremblement de terre","avalanche","canicule","continent"], p:[] } ]},
  { t:"Adjectifs qui brillent ✨", c:"#fbbf24", L:[
    { t:"Ça impressionne", w:["étonnant","effrayant","passionnant","émouvant","précieux","semblable"], p:[] },
    { t:"Le mot juste", w:["épuisant","décevant","indispensable","disponible","provisoire"], p:[] } ]},
  { t:"Verbes d'action 🏗", c:"#60a5fa", L:[
    { t:"Construire et défaire", w:["détruire","creuser","vider","verrouiller","brancher","débrancher"], p:[] },
    { t:"Du geste précis", w:["appuyer","secouer","frotter","essuyer","plonger","ramer"], p:[] } ]},
  { t:"Les mots du temps ⏳", c:"#94a3b8", L:[
    { t:"Hier et demain", w:["autrefois","récemment","désormais","auparavant","à l'avenir"], p:[] },
    { t:"D'un coup", w:["aussitôt","tout à coup","dès que"], p:[] } ]},
  { t:"Expressions du quotidien 💬", c:"#22d3ee", L:[
    { t:"Les petites phrases", w:["bon courage","tant pis","tant mieux","ça m'est égal"], p:["bonne chance pour ton examen","je croise les doigts"] },
    { t:"Dans la conversation", w:["pas de souci","quel dommage","à ta santé","en route"], p:["au secours","en cas d'urgence, appelez la police"] } ]}
];
var NEWV8 = {
  "réception":{en:"reception",it:"reception",es:"recepción",de:"Rezeption",pt:"receção",nl:"receptie"},
  "réceptionniste":{en:"receptionist",it:"receptionist",es:"recepcionista",de:"Rezeptionist",pt:"rececionista",nl:"receptionist"},
  "chambre double":{en:"double room",it:"camera doppia",es:"habitación doble",de:"Doppelzimmer",pt:"quarto duplo",nl:"tweepersoonskamer"},
  "chambre simple":{en:"single room",it:"camera singola",es:"habitación individual",de:"Einzelzimmer",pt:"quarto individual",nl:"eenpersoonskamer"},
  "auberge":{en:"inn",it:"locanda",es:"posada",de:"Gasthaus",pt:"estalagem",nl:"herberg"},
  "climatisation":{en:"air conditioning",it:"aria condizionata",es:"aire acondicionado",de:"Klimaanlage",pt:"ar condicionado",nl:"airconditioning"},
  "chauffage":{en:"heating",it:"riscaldamento",es:"calefacción",de:"Heizung",pt:"aquecimento",nl:"verwarming"},
  "oreiller":{en:"pillow",it:"cuscino",es:"almohada",de:"Kissen",pt:"almofada",nl:"hoofdkussen"},
  "couverture":{en:"blanket",it:"coperta",es:"manta",de:"Decke",pt:"cobertor",nl:"deken"},
  "drap":{en:"sheet",it:"lenzuolo",es:"sábana",de:"Bettlaken",pt:"lençol",nl:"laken"},
  "voile":{en:"sail",it:"vela",es:"vela",de:"Segel",pt:"vela",nl:"zeil"},
  "ancre":{en:"anchor",it:"ancora",es:"ancla",de:"Anker",pt:"âncora",nl:"anker"},
  "équipage":{en:"crew",it:"equipaggio",es:"tripulación",de:"Besatzung",pt:"tripulação",nl:"bemanning"},
  "capitaine":{en:"captain",it:"capitano",es:"capitán",de:"Kapitän",pt:"capitão",nl:"kapitein"},
  "croisière":{en:"cruise",it:"crociera",es:"crucero",de:"Kreuzfahrt",pt:"cruzeiro",nl:"cruise"},
  "port":{en:"harbour",it:"porto",es:"puerto",de:"Hafen",pt:"porto",nl:"haven"},
  "phare":{en:"lighthouse",it:"faro",es:"faro",de:"Leuchtturm",pt:"farol",nl:"vuurtoren"},
  "marée":{en:"tide",it:"marea",es:"marea",de:"Gezeiten",pt:"maré",nl:"getij"},
  "mouette":{en:"seagull",it:"gabbiano",es:"gaviota",de:"Möwe",pt:"gaivota",nl:"meeuw"},
  "filet":{en:"net",it:"rete",es:"red",de:"Netz",pt:"rede",nl:"net"},
  "naufrage":{en:"shipwreck",it:"naufragio",es:"naufragio",de:"Schiffbruch",pt:"naufrágio",nl:"schipbreuk"},
  "bouée":{en:"buoy",it:"boa",es:"boya",de:"Boje",pt:"boia",nl:"boei"},
  "algue":{en:"seaweed",it:"alga",es:"alga",de:"Alge",pt:"alga",nl:"zeewier"},
  "coquillage":{en:"seashell",it:"conchiglia",es:"concha",de:"Muschel",pt:"concha",nl:"schelp"},
  "crabe":{en:"crab",it:"granchio",es:"cangrejo",de:"Krabbe",pt:"caranguejo",nl:"krab"},
  "méduse":{en:"jellyfish",it:"medusa",es:"medusa",de:"Qualle",pt:"alforreca",nl:"kwal"},
  "pieuvre":{en:"octopus",it:"polpo",es:"pulpo",de:"Krake",pt:"polvo",nl:"octopus"},
  "fusée":{en:"rocket",it:"razzo",es:"cohete",de:"Rakete",pt:"foguetão",nl:"raket"},
  "navette":{en:"shuttle",it:"navetta",es:"transbordador",de:"Raumfähre",pt:"vaivém",nl:"ruimteveer"},
  "satellite":{en:"satellite",it:"satellite",es:"satélite",de:"Satellit",pt:"satélite",nl:"satelliet"},
  "astronaute":{en:"astronaut",it:"astronauta",es:"astronauta",de:"Astronaut",pt:"astronauta",nl:"astronaut"},
  "télescope":{en:"telescope",it:"telescopio",es:"telescopio",de:"Teleskop",pt:"telescópio",nl:"telescoop"},
  "gravité":{en:"gravity",it:"gravità",es:"gravedad",de:"Schwerkraft",pt:"gravidade",nl:"zwaartekracht"},
  "comète":{en:"comet",it:"cometa",es:"cometa",de:"Komet",pt:"cometa",nl:"komeet"},
  "galaxie":{en:"galaxy",it:"galassia",es:"galaxia",de:"Galaxie",pt:"galáxia",nl:"sterrenstelsel"},
  "univers":{en:"universe",it:"universo",es:"universo",de:"Universum",pt:"universo",nl:"heelal"},
  "étoile filante":{en:"shooting star",it:"stella cadente",es:"estrella fugaz",de:"Sternschnuppe",pt:"estrela cadente",nl:"vallende ster"},
  "ovni":{en:"UFO",it:"UFO",es:"ovni",de:"UFO",pt:"OVNI",nl:"ufo"},
  "extraterrestre":{en:"alien",it:"extraterrestre",es:"extraterrestre",de:"Außerirdischer",pt:"extraterrestre",nl:"buitenaards wezen"},
  "chimie":{en:"chemistry",it:"chimica",es:"química",de:"Chemie",pt:"química",nl:"scheikunde"},
  "physique":{en:"physics",it:"fisica",es:"física",de:"Physik",pt:"física",nl:"natuurkunde"},
  "biologie":{en:"biology",it:"biologia",es:"biología",de:"Biologie",pt:"biologia",nl:"biologie"},
  "laboratoire":{en:"laboratory",it:"laboratorio",es:"laboratorio",de:"Labor",pt:"laboratório",nl:"laboratorium"},
  "microscope":{en:"microscope",it:"microscopio",es:"microscopio",de:"Mikroskop",pt:"microscópio",nl:"microscoop"},
  "invention":{en:"invention",it:"invenzione",es:"invento",de:"Erfindung",pt:"invenção",nl:"uitvinding"},
  "découverte":{en:"discovery",it:"scoperta",es:"descubrimiento",de:"Entdeckung",pt:"descoberta",nl:"ontdekking"},
  "chercheur":{en:"researcher",it:"ricercatore",es:"investigador",de:"Forscher",pt:"investigador",nl:"onderzoeker"},
  "théorie":{en:"theory",it:"teoria",es:"teoría",de:"Theorie",pt:"teoria",nl:"theorie"},
  "cerveau":{en:"brain",it:"cervello",es:"cerebro",de:"Gehirn",pt:"cérebro",nl:"hersenen"},
  "tribunal":{en:"court",it:"tribunale",es:"tribunal",de:"Gericht",pt:"tribunal",nl:"rechtbank"},
  "juge":{en:"judge",it:"giudice",es:"juez",de:"Richter",pt:"juiz",nl:"rechter"},
  "procès":{en:"trial",it:"processo",es:"juicio",de:"Prozess",pt:"julgamento",nl:"proces"},
  "preuve":{en:"proof",it:"prova",es:"prueba",de:"Beweis",pt:"prova",nl:"bewijs"},
  "plainte":{en:"complaint",it:"denuncia",es:"denuncia",de:"Anzeige",pt:"queixa",nl:"klacht"},
  "coupable":{en:"guilty",it:"colpevole",es:"culpable",de:"schuldig",pt:"culpado",nl:"schuldig"},
  "innocent":{en:"innocent",it:"innocente",es:"inocente",de:"unschuldig",pt:"inocente",nl:"onschuldig"},
  "prison":{en:"prison",it:"prigione",es:"cárcel",de:"Gefängnis",pt:"prisão",nl:"gevangenis"},
  "amende":{en:"fine",it:"multa",es:"multa",de:"Geldstrafe",pt:"multa",nl:"boete"},
  "interdit":{en:"forbidden",it:"vietato",es:"prohibido",de:"verboten",pt:"proibido",nl:"verboden"},
  "couronne":{en:"crown",it:"corona",es:"corona",de:"Krone",pt:"coroa",nl:"kroon"},
  "trône":{en:"throne",it:"trono",es:"trono",de:"Thron",pt:"trono",nl:"troon"},
  "chevalier":{en:"knight",it:"cavaliere",es:"caballero",de:"Ritter",pt:"cavaleiro",nl:"ridder"},
  "héros":{en:"hero",it:"eroe",es:"héroe",de:"Held",pt:"herói",nl:"held"},
  "empire":{en:"empire",it:"impero",es:"imperio",de:"Imperium",pt:"império",nl:"keizerrijk"},
  "bataille":{en:"battle",it:"battaglia",es:"batalla",de:"Schlacht",pt:"batalha",nl:"veldslag"},
  "armée":{en:"army",it:"esercito",es:"ejército",de:"Armee",pt:"exército",nl:"leger"},
  "soldat":{en:"soldier",it:"soldato",es:"soldado",de:"Soldat",pt:"soldado",nl:"soldaat"},
  "révolution":{en:"revolution",it:"rivoluzione",es:"revolución",de:"Revolution",pt:"revolução",nl:"revolutie"},
  "épée":{en:"sword",it:"spada",es:"espada",de:"Schwert",pt:"espada",nl:"zwaard"},
  "bouclier":{en:"shield",it:"scudo",es:"escudo",de:"Schutzschild",pt:"escudo",nl:"schild"},
  "flèche":{en:"arrow",it:"freccia",es:"flecha",de:"Pfeil",pt:"seta",nl:"pijl"},
  "canon":{en:"cannon",it:"cannone",es:"cañón",de:"Kanone",pt:"canhão",nl:"kanon"},
  "moteur":{en:"engine",it:"motore",es:"motor",de:"Motor",pt:"motor",nl:"motor"},
  "frein":{en:"brake",it:"freno",es:"freno",de:"Bremse",pt:"travão",nl:"rem"},
  "pneu":{en:"tyre",it:"pneumatico",es:"neumático",de:"Reifen",pt:"pneu",nl:"band"},
  "volant":{en:"steering wheel",it:"volante",es:"volante",de:"Lenkrad",pt:"volante",nl:"stuur"},
  "coffre":{en:"boot",it:"bagagliaio",es:"maletero",de:"Kofferraum",pt:"mala do carro",nl:"kofferbak"},
  "capot":{en:"bonnet",it:"cofano",es:"capó",de:"Motorhaube",pt:"capot",nl:"motorkap"},
  "klaxon":{en:"horn",it:"clacson",es:"claxon",de:"Hupe",pt:"buzina",nl:"claxon"},
  "rétroviseur":{en:"rear-view mirror",it:"specchietto retrovisore",es:"retrovisor",de:"Rückspiegel",pt:"retrovisor",nl:"achteruitkijkspiegel"},
  "pare-brise":{en:"windscreen",it:"parabrezza",es:"parabrisas",de:"Windschutzscheibe",pt:"para-brisas",nl:"voorruit"},
  "essuie-glace":{en:"windscreen wiper",it:"tergicristallo",es:"limpiaparabrisas",de:"Scheibenwischer",pt:"limpa-para-brisas",nl:"ruitenwisser"},
  "embouteillage":{en:"traffic jam",it:"ingorgo",es:"atasco",de:"Stau",pt:"engarrafamento",nl:"file"},
  "panne":{en:"breakdown",it:"guasto",es:"avería",de:"Panne",pt:"avaria",nl:"pech"},
  "poumon":{en:"lung",it:"polmone",es:"pulmón",de:"Lunge",pt:"pulmão",nl:"long"},
  "estomac":{en:"stomach",it:"stomaco",es:"estómago",de:"Magen",pt:"estômago",nl:"maag"},
  "foie":{en:"liver",it:"fegato",es:"hígado",de:"Leber",pt:"fígado",nl:"lever"},
  "muscle":{en:"muscle",it:"muscolo",es:"músculo",de:"Muskel",pt:"músculo",nl:"spier"},
  "squelette":{en:"skeleton",it:"scheletro",es:"esqueleto",de:"Skelett",pt:"esqueleto",nl:"skelet"},
  "veine":{en:"vein",it:"vena",es:"vena",de:"Vene",pt:"veia",nl:"ader"},
  "côte":{en:"rib",it:"costola",es:"costilla",de:"Rippe",pt:"costela",nl:"rib"},
  "cheville":{en:"ankle",it:"caviglia",es:"tobillo",de:"Knöchel",pt:"tornozelo",nl:"enkel"},
  "poignet":{en:"wrist",it:"polso",es:"muñeca",de:"Handgelenk",pt:"pulso",nl:"pols"},
  "menton":{en:"chin",it:"mento",es:"barbilla",de:"Kinn",pt:"queixo",nl:"kin"},
  "hanche":{en:"hip",it:"anca",es:"cadera",de:"Hüfte",pt:"anca",nl:"heup"},
  "mollet":{en:"calf",it:"polpaccio",es:"pantorrilla",de:"Wade",pt:"barriga da perna",nl:"kuit"},
  "sourcil":{en:"eyebrow",it:"sopracciglio",es:"ceja",de:"Augenbraue",pt:"sobrancelha",nl:"wenkbrauw"},
  "cil":{en:"eyelash",it:"ciglio",es:"pestaña",de:"Wimper",pt:"pestana",nl:"wimper"},
  "paupière":{en:"eyelid",it:"palpebra",es:"párpado",de:"Augenlid",pt:"pálpebra",nl:"ooglid"},
  "nuque":{en:"nape",it:"nuca",es:"nuca",de:"Nacken",pt:"nuca",nl:"nek"},
  "paume":{en:"palm",it:"palmo",es:"palma",de:"Handfläche",pt:"palma da mão",nl:"handpalm"},
  "costume":{en:"suit",it:"completo",es:"traje",de:"Anzug",pt:"fato",nl:"pak"},
  "cravate":{en:"tie",it:"cravatta",es:"corbata",de:"Krawatte",pt:"gravata",nl:"stropdas"},
  "nœud papillon":{en:"bow tie",it:"papillon",es:"pajarita",de:"Fliege",pt:"laço",nl:"vlinderdas"},
  "gilet":{en:"waistcoat",it:"gilet",es:"chaleco",de:"Weste",pt:"colete",nl:"vest"},
  "imperméable":{en:"raincoat",it:"impermeabile",es:"impermeable",de:"Regenmantel",pt:"gabardina",nl:"regenjas"},
  "bretelles":{en:"braces",it:"bretelle",es:"tirantes",de:"Hosenträger",pt:"suspensórios",nl:"bretels"},
  "fermeture éclair":{en:"zip",it:"cerniera",es:"cremallera",de:"Reißverschluss",pt:"fecho",nl:"rits"},
  "talon":{en:"heel",it:"tacco",es:"tacón",de:"Absatz",pt:"salto",nl:"hak"},
  "semelle":{en:"sole",it:"suola",es:"suela",de:"Sohle",pt:"sola",nl:"zool"},
  "lacet":{en:"shoelace",it:"laccio",es:"cordón",de:"Schnürsenkel",pt:"atacador",nl:"veter"},
  "col":{en:"collar",it:"colletto",es:"cuello de camisa",de:"Kragen",pt:"colarinho",nl:"kraag"},
  "manche":{en:"sleeve",it:"manica",es:"manga",de:"Ärmel",pt:"manga",nl:"mouw"},
  "camping":{en:"camping",it:"campeggio",es:"camping",de:"Camping",pt:"campismo",nl:"kamperen"},
  "tente":{en:"tent",it:"tenda",es:"tienda de campaña",de:"Zelt",pt:"tenda",nl:"tent"},
  "sac de couchage":{en:"sleeping bag",it:"sacco a pelo",es:"saco de dormir",de:"Schlafsack",pt:"saco-cama",nl:"slaapzak"},
  "lampe de poche":{en:"torch",it:"torcia",es:"linterna",de:"Taschenlampe",pt:"lanterna",nl:"zaklamp"},
  "hamac":{en:"hammock",it:"amaca",es:"hamaca",de:"Hängematte",pt:"cama de rede",nl:"hangmat"},
  "randonnée":{en:"hike",it:"escursione",es:"senderismo",de:"Wanderung",pt:"caminhada",nl:"wandeling"},
  "chasse":{en:"hunting",it:"caccia",es:"caza",de:"Jagd",pt:"caça",nl:"jacht"},
  "boussole":{en:"compass",it:"bussola",es:"brújula",de:"Kompass",pt:"bússola",nl:"kompas"},
  "jumelles":{en:"binoculars",it:"binocolo",es:"prismáticos",de:"Fernglas",pt:"binóculos",nl:"verrekijker"},
  "feu de camp":{en:"campfire",it:"falò",es:"hoguera",de:"Lagerfeuer",pt:"fogueira",nl:"kampvuur"},
  "fouet":{en:"whisk",it:"frusta",es:"batidor",de:"Schneebesen",pt:"batedor de varas",nl:"garde"},
  "louche":{en:"ladle",it:"mestolo",es:"cucharón",de:"Schöpfkelle",pt:"concha de sopa",nl:"soeplepel"},
  "passoire":{en:"colander",it:"scolapasta",es:"colador",de:"Sieb",pt:"escorredor",nl:"vergiet"},
  "râpe":{en:"grater",it:"grattugia",es:"rallador",de:"Reibe",pt:"ralador",nl:"rasp"},
  "entonnoir":{en:"funnel",it:"imbuto",es:"embudo",de:"Trichter",pt:"funil",nl:"trechter"},
  "couvercle":{en:"lid",it:"coperchio",es:"tapa",de:"Deckel",pt:"tampa",nl:"deksel"},
  "bouchon":{en:"cork",it:"tappo",es:"corcho",de:"Korken",pt:"rolha",nl:"kurk"},
  "tire-bouchon":{en:"corkscrew",it:"cavatappi",es:"sacacorchos",de:"Korkenzieher",pt:"saca-rolhas",nl:"kurkentrekker"},
  "glaçon":{en:"ice cube",it:"cubetto di ghiaccio",es:"cubito de hielo",de:"Eiswürfel",pt:"cubo de gelo",nl:"ijsblokje"},
  "paille":{en:"straw",it:"cannuccia",es:"pajita",de:"Strohhalm",pt:"palhinha",nl:"rietje"},
  "plombier":{en:"plumber",it:"idraulico",es:"fontanero",de:"Klempner",pt:"canalizador",nl:"loodgieter"},
  "électricien":{en:"electrician",it:"elettricista",es:"electricista",de:"Elektriker",pt:"eletricista",nl:"elektricien"},
  "menuisier":{en:"carpenter",it:"falegname",es:"carpintero",de:"Tischler",pt:"carpinteiro",nl:"timmerman"},
  "bijoutier":{en:"jeweller",it:"gioielliere",es:"joyero",de:"Juwelier",pt:"joalheiro",nl:"juwelier"},
  "vétérinaire":{en:"vet",it:"veterinario",es:"veterinario",de:"Tierarzt",pt:"veterinário",nl:"dierenarts"},
  "pêcheur":{en:"fisherman",it:"pescatore",es:"pescador",de:"Fischer",pt:"pescador",nl:"visser"},
  "chauffeur":{en:"driver",it:"autista",es:"conductor",de:"Fahrer",pt:"motorista",nl:"chauffeur"},
  "fleuriste":{en:"florist",it:"fiorista",es:"florista",de:"Florist",pt:"florista",nl:"bloemist"},
  "orchestre":{en:"orchestra",it:"orchestra",es:"orquesta",de:"Orchester",pt:"orquestra",nl:"orkest"},
  "violon":{en:"violin",it:"violino",es:"violín",de:"Geige",pt:"violino",nl:"viool"},
  "flûte":{en:"flute",it:"flauto",es:"flauta",de:"Flöte",pt:"flauta",nl:"fluit"},
  "trompette":{en:"trumpet",it:"tromba",es:"trompeta",de:"Trompete",pt:"trompete",nl:"trompet"},
  "mélodie":{en:"melody",it:"melodia",es:"melodía",de:"Melodie",pt:"melodia",nl:"melodie"},
  "rythme":{en:"rhythm",it:"ritmo",es:"ritmo",de:"Rhythmus",pt:"ritmo",nl:"ritme"},
  "chorale":{en:"choir",it:"coro",es:"coro",de:"Chor",pt:"coro",nl:"koor"},
  "tambour":{en:"drum",it:"tamburo",es:"tambor",de:"Trommel",pt:"tambor",nl:"trommel"},
  "volcan":{en:"volcano",it:"vulcano",es:"volcán",de:"Vulkan",pt:"vulcão",nl:"vulkaan"},
  "inondation":{en:"flood",it:"alluvione",es:"inundación",de:"Überschwemmung",pt:"inundação",nl:"overstroming"},
  "tremblement de terre":{en:"earthquake",it:"terremoto",es:"terremoto",de:"Erdbeben",pt:"terramoto",nl:"aardbeving"},
  "avalanche":{en:"avalanche",it:"valanga",es:"avalancha",de:"Lawine",pt:"avalancha",nl:"lawine"},
  "canicule":{en:"heatwave",it:"ondata di caldo",es:"ola de calor",de:"Hitzewelle",pt:"onda de calor",nl:"hittegolf"},
  "continent":{en:"continent",it:"continente",es:"continente",de:"Kontinent",pt:"continente",nl:"continent"},
  "étonnant":{en:"surprising",it:"sorprendente",es:"sorprendente",de:"erstaunlich",pt:"surpreendente",nl:"verrassend"},
  "effrayant":{en:"frightening",it:"spaventoso",es:"aterrador",de:"erschreckend",pt:"assustador",nl:"beangstigend"},
  "passionnant":{en:"fascinating",it:"appassionante",es:"apasionante",de:"fesselnd",pt:"empolgante",nl:"boeiend"},
  "émouvant":{en:"moving",it:"commovente",es:"conmovedor",de:"ergreifend",pt:"comovente",nl:"ontroerend"},
  "précieux":{en:"precious",it:"prezioso",es:"precioso",de:"kostbar",pt:"precioso",nl:"kostbaar"},
  "semblable":{en:"similar",it:"simile",es:"parecido",de:"ähnlich",pt:"semelhante",nl:"vergelijkbaar"},
  "épuisant":{en:"exhausting",it:"estenuante",es:"agotador",de:"erschöpfend",pt:"exaustivo",nl:"uitputtend"},
  "décevant":{en:"disappointing",it:"deludente",es:"decepcionante",de:"enttäuschend",pt:"dececionante",nl:"teleurstellend"},
  "indispensable":{en:"essential",it:"indispensabile",es:"imprescindible",de:"unentbehrlich",pt:"indispensável",nl:"onmisbaar"},
  "disponible":{en:"available",it:"disponibile",es:"disponible",de:"verfügbar",pt:"disponível",nl:"beschikbaar"},
  "provisoire":{en:"temporary",it:"provvisorio",es:"provisional",de:"vorläufig",pt:"provisório",nl:"tijdelijk"},
  "détruire":{en:"to destroy",it:"distruggere",es:"destruir",de:"zerstören",pt:"destruir",nl:"vernietigen"},
  "creuser":{en:"to dig",it:"scavare",es:"cavar",de:"graben",pt:"cavar",nl:"graven"},
  "vider":{en:"to empty",it:"svuotare",es:"vaciar",de:"leeren",pt:"esvaziar",nl:"leegmaken"},
  "verrouiller":{en:"to lock",it:"chiudere a chiave",es:"cerrar con llave",de:"verriegeln",pt:"trancar",nl:"vergrendelen"},
  "brancher":{en:"to plug in",it:"collegare",es:"enchufar",de:"anschließen",pt:"ligar à corrente",nl:"aansluiten"},
  "débrancher":{en:"to unplug",it:"scollegare",es:"desenchufar",de:"ausstecken",pt:"desligar da corrente",nl:"loskoppelen"},
  "appuyer":{en:"to press",it:"premere",es:"pulsar",de:"drücken",pt:"carregar",nl:"drukken"},
  "secouer":{en:"to shake",it:"scuotere",es:"sacudir",de:"schütteln",pt:"sacudir",nl:"schudden"},
  "frotter":{en:"to rub",it:"strofinare",es:"frotar",de:"reiben",pt:"esfregar",nl:"wrijven"},
  "essuyer":{en:"to wipe",it:"asciugare",es:"secar",de:"abwischen",pt:"enxugar",nl:"afvegen"},
  "plonger":{en:"to dive",it:"tuffarsi",es:"bucear",de:"tauchen",pt:"mergulhar",nl:"duiken"},
  "ramer":{en:"to row",it:"remare",es:"remar",de:"rudern",pt:"remar",nl:"roeien"},
  "autrefois":{en:"in the past",it:"un tempo",es:"antiguamente",de:"früher",pt:"antigamente",nl:"vroeger"},
  "récemment":{en:"recently",it:"recentemente",es:"recientemente",de:"kürzlich",pt:"recentemente",nl:"onlangs"},
  "désormais":{en:"from now on",it:"d'ora in poi",es:"a partir de ahora",de:"von nun an",pt:"doravante",nl:"voortaan"},
  "auparavant":{en:"beforehand",it:"in precedenza",es:"anteriormente",de:"zuvor",pt:"anteriormente",nl:"voordien"},
  "à l'avenir":{en:"in the future",it:"in futuro",es:"en el futuro",de:"in Zukunft",pt:"no futuro",nl:"in de toekomst"},
  "aussitôt":{en:"at once",it:"immediatamente",es:"de inmediato",de:"sogleich",pt:"imediatamente",nl:"onmiddellijk"},
  "tout à coup":{en:"suddenly",it:"all'improvviso",es:"de repente",de:"plötzlich",pt:"de repente",nl:"plotseling"},
  "dès que":{en:"as soon as",it:"non appena",es:"en cuanto",de:"sobald",pt:"assim que",nl:"zodra"},
  "bon courage":{en:"hang in there",it:"coraggio",es:"ánimo",de:"Kopf hoch",pt:"força",nl:"sterkte"},
  "tant pis":{en:"too bad",it:"pazienza",es:"tanto peor",de:"Pech gehabt",pt:"paciência",nl:"jammer dan"},
  "tant mieux":{en:"so much the better",it:"tanto meglio",es:"tanto mejor",de:"umso besser",pt:"ainda bem",nl:"des te beter"},
  "ça m'est égal":{en:"I don't mind",it:"per me è uguale",es:"me da igual",de:"das ist mir egal",pt:"tanto faz",nl:"het maakt mij niet uit"},
  "pas de souci":{en:"no worries",it:"nessun problema",es:"sin problema",de:"kein Problem",pt:"sem problema",nl:"geen probleem"},
  "quel dommage":{en:"what a pity",it:"che peccato",es:"qué pena",de:"wie schade",pt:"que pena",nl:"wat jammer"},
  "à ta santé":{en:"cheers",it:"salute",es:"salud",de:"zum Wohl",pt:"à tua saúde",nl:"proost"},
  "en route":{en:"on the way",it:"in cammino",es:"en camino",de:"unterwegs",pt:"a caminho",nl:"onderweg"},
  "il était une fois":{en:"once upon a time",it:"c'era una volta",es:"érase una vez",de:"es war einmal",pt:"era uma vez",nl:"er was eens"},
  "bonne chance pour ton examen":{en:"good luck with your exam",it:"in bocca al lupo per l'esame",es:"buena suerte con tu examen",de:"viel Glück bei deiner Prüfung",pt:"boa sorte para o teu exame",nl:"veel succes met je examen"},
  "je croise les doigts":{en:"I'm crossing my fingers",it:"incrocio le dita",es:"cruzo los dedos",de:"ich drücke dir die Daumen",pt:"faço figas",nl:"ik duim voor je"},
  "au secours":{en:"help",it:"aiuto",es:"auxilio",de:"Hilfe",pt:"acudam",nl:"help"},
  "en cas d'urgence, appelez la police":{en:"in an emergency, call the police",it:"in caso di emergenza, chiamate la polizia",es:"en caso de emergencia, llame a la policía",de:"im Notfall rufen Sie die Polizei",pt:"em caso de emergência, chame a polícia",nl:"bel in geval van nood de politie"}
};
CURRICULUM_R.forEach(function(u){ CURRICULUM.push(u); });
LANGS.forEach(function(l){ Object.keys(NEWV8).forEach(function(k){ if(NEWV8[k][l]) LEX[l][k]=NEWV8[k][l]; }); });

/* --- EXTENSION v2.64 (vague 8 — cap B2) : 11 unités — économie, vie citoyenne, planète,
   grandes idées, littérature, verbes de haut niveau, santé approfondie, sentiments fins,
   caractères trempés, bureau, médias. Parité garantie (NEWV9). Portugais EUROPÉEN toujours :
   presidente da câmara, volume de negócios, desflorestação, ozono, equacionar, perfecionista,
   ata, saudade, estou farto, podes contar comigo. --- */
var CURRICULUM_Q = [
  { t:"L'économie 💰", c:"#34d399", L:[
    { t:"Les comptes", w:["bénéfice","perte","budget","taxe","chiffre d'affaires","bilan"], p:[] },
    { t:"Monter sa boîte", w:["investir","croissance","concurrence","fournisseur","actionnaire"], p:[] },
    { t:"Les coups durs", w:["crise","faillite","endettement","négocier"], p:[] } ]},
  { t:"La vie citoyenne 🗳", c:"#94a3b8", L:[
    { t:"La démocratie", w:["citoyen","démocratie","vote","campagne électorale","débat","discours politique"], p:[] },
    { t:"Les élus", w:["ministre","maire","député","syndicat"], p:[] },
    { t:"Se faire entendre", w:["égalité","injustice","manifestation","grève"], p:[] } ]},
  { t:"Protéger la planète 🌍", c:"#4ade80", L:[
    { t:"Les énergies", w:["pétrole","panneau solaire","éolienne","centrale nucléaire","empreinte carbone"], p:[] },
    { t:"Les bons gestes", w:["recyclage","trier","gaspiller","ordures"], p:["il vaut mieux prévenir que guérir"] },
    { t:"La nature en danger", w:["réchauffement","biodiversité","déforestation","couche d'ozone","espèce menacée"], p:[] } ]},
  { t:"Les grandes idées 💭", c:"#c084fc", L:[
    { t:"Les forces de l'âme", w:["courage","patience","sagesse","volonté","conscience","sincérité"], p:[] },
    { t:"Les zones d'ombre", w:["désespoir","folie","doute","humiliation","orgueil","remords"], p:[] },
    { t:"Le fil de la vie", w:["fierté","destin","hasard","soupçon"], p:[] } ]},
  { t:"La littérature 📚", c:"#fbbf24", L:[
    { t:"Écrire un livre", w:["roman","chapitre","personnage","intrigue","dénouement","récit"], p:[] },
    { t:"Vers et rimes", w:["poème","poésie","conte","traduction"], p:[] },
    { t:"Le monde du livre", w:["éditeur","librairie","publier","sous-titres"], p:[] } ]},
  { t:"Verbes de haut niveau 🛠", c:"#60a5fa", L:[
    { t:"Aller au bout", w:["accomplir","entreprendre","aboutir","renoncer","surmonter"], p:["tu peux compter sur moi"] },
    { t:"Peser ses mots", w:["envisager","constater","souligner","prétendre","admettre"], p:[] },
    { t:"Tenir bon", w:["exiger","négliger","aborder","persuader"], p:["ça n'a rien à voir"] } ]},
  { t:"La santé approfondie 🩺", c:"#f87171", L:[
    { t:"Chez le spécialiste", w:["consultation","symptôme","diagnostic","traitement"], p:[] },
    { t:"Se défendre", w:["allergie","vaccination","immunité","microbe","contagieux"], p:[] },
    { t:"Se remettre", w:["régime","vitamines","épidémie","guérison","rechute"], p:[] } ]},
  { t:"Les sentiments fins 💓", c:"#f472b6", L:[
    { t:"Ce qui apaise", w:["soulagement","admiration","enthousiasme","compassion","nostalgie"], p:[] },
    { t:"Ce qui ronge", w:["inquiétude","angoisse","méfiance","frustration"], p:["j'en ai marre"] },
    { t:"Entre les deux", w:["mépris","gêne","indifférence"], p:[] } ]},
  { t:"Caractères trempés 🎭", c:"#fb923c", L:[
    { t:"Fonceurs", w:["ambitieux","audacieux","loyal","perfectionniste","insouciant"], p:[] },
    { t:"À double face", w:["arrogant","humble","hypocrite","rancunier","indulgent"], p:[] } ]},
  { t:"Au bureau 💼", c:"#818cf8", L:[
    { t:"La journée de travail", w:["ordre du jour","échéance","objectif","tâche","responsabilité","procès-verbal"], p:[] },
    { t:"La vie de l'équipe", w:["congé","télétravail","démission","recrutement","entretien d'embauche"], p:["ce n'est pas la peine"] } ]},
  { t:"Les médias 📰", c:"#22d3ee", L:[
    { t:"La une", w:["reportage","interview","gros titre","rédaction"], p:[] },
    { t:"L'opinion", w:["rumeur","scandale","censure","sondage"], p:[] } ]}
];
var NEWV9 = {
  "bénéfice":{en:"profit",it:"profitto",es:"beneficio",de:"Gewinn",pt:"lucro",nl:"winst"},
  "perte":{en:"loss",it:"perdita",es:"pérdida",de:"Verlust",pt:"prejuízo",nl:"verlies"},
  "budget":{en:"budget",it:"budget",es:"presupuesto",de:"Budget",pt:"orçamento",nl:"budget"},
  "taxe":{en:"tax",it:"tassa",es:"tasa",de:"Steuer",pt:"taxa",nl:"belasting"},
  "chiffre d'affaires":{en:"turnover",it:"fatturato",es:"facturación",de:"Umsatz",pt:"volume de negócios",nl:"omzet"},
  "bilan":{en:"balance sheet",it:"bilancio",es:"balance",de:"Bilanz",pt:"balanço",nl:"balans"},
  "investir":{en:"to invest",it:"investire",es:"invertir",de:"investieren",pt:"investir",nl:"investeren"},
  "croissance":{en:"growth",it:"crescita",es:"crecimiento",de:"Wachstum",pt:"crescimento",nl:"groei"},
  "concurrence":{en:"competition",it:"concorrenza",es:"rivalidad",de:"Konkurrenz",pt:"concorrência",nl:"concurrentie"},
  "fournisseur":{en:"supplier",it:"fornitore",es:"proveedor",de:"Lieferant",pt:"fornecedor",nl:"leverancier"},
  "actionnaire":{en:"shareholder",it:"azionista",es:"accionista",de:"Aktionär",pt:"acionista",nl:"aandeelhouder"},
  "crise":{en:"crisis",it:"crisi",es:"crisis",de:"Krise",pt:"crise",nl:"crisis"},
  "faillite":{en:"bankruptcy",it:"fallimento",es:"quiebra",de:"Konkurs",pt:"falência",nl:"faillissement"},
  "endettement":{en:"indebtedness",it:"indebitamento",es:"endeudamiento",de:"Verschuldung",pt:"endividamento",nl:"schuldenlast"},
  "négocier":{en:"to negotiate",it:"negoziare",es:"negociar",de:"verhandeln",pt:"negociar",nl:"onderhandelen"},
  "citoyen":{en:"citizen",it:"cittadino",es:"ciudadano",de:"Bürger",pt:"cidadão",nl:"burger"},
  "démocratie":{en:"democracy",it:"democrazia",es:"democracia",de:"Demokratie",pt:"democracia",nl:"democratie"},
  "vote":{en:"vote",it:"voto",es:"voto",de:"Abstimmung",pt:"voto",nl:"stem"},
  "campagne électorale":{en:"election campaign",it:"campagna elettorale",es:"campaña electoral",de:"Wahlkampf",pt:"campanha eleitoral",nl:"verkiezingscampagne"},
  "débat":{en:"debate",it:"dibattito",es:"debate",de:"Debatte",pt:"debate",nl:"debat"},
  "discours politique":{en:"political speech",it:"discorso politico",es:"discurso político",de:"politische Rede",pt:"discurso político",nl:"politieke toespraak"},
  "ministre":{en:"minister",it:"ministro",es:"ministro",de:"Minister",pt:"ministro",nl:"minister"},
  "maire":{en:"mayor",it:"sindaco",es:"alcalde",de:"Bürgermeister",pt:"presidente da câmara",nl:"burgemeester"},
  "député":{en:"member of parliament",it:"deputato",es:"diputado",de:"Abgeordneter",pt:"deputado",nl:"parlementslid"},
  "syndicat":{en:"trade union",it:"sindacato",es:"sindicato",de:"Gewerkschaft",pt:"sindicato",nl:"vakbond"},
  "égalité":{en:"equality",it:"uguaglianza",es:"igualdad",de:"Gleichheit",pt:"igualdade",nl:"gelijkheid"},
  "injustice":{en:"injustice",it:"ingiustizia",es:"injusticia",de:"Ungerechtigkeit",pt:"injustiça",nl:"onrecht"},
  "manifestation":{en:"demonstration",it:"manifestazione",es:"manifestación",de:"Demonstration",pt:"manifestação",nl:"betoging"},
  "grève":{en:"strike",it:"sciopero",es:"huelga",de:"Streik",pt:"greve",nl:"staking"},
  "pétrole":{en:"oil",it:"petrolio",es:"petróleo",de:"Erdöl",pt:"petróleo",nl:"aardolie"},
  "panneau solaire":{en:"solar panel",it:"pannello solare",es:"panel solar",de:"Solarpanel",pt:"painel solar",nl:"zonnepaneel"},
  "éolienne":{en:"wind turbine",it:"turbina eolica",es:"aerogenerador",de:"Windrad",pt:"turbina eólica",nl:"windmolen"},
  "centrale nucléaire":{en:"nuclear power plant",it:"centrale nucleare",es:"central nuclear",de:"Atomkraftwerk",pt:"central nuclear",nl:"kerncentrale"},
  "empreinte carbone":{en:"carbon footprint",it:"impronta di carbonio",es:"huella de carbono",de:"CO2-Fußabdruck",pt:"pegada de carbono",nl:"CO2-voetafdruk"},
  "recyclage":{en:"recycling",it:"riciclaggio",es:"reciclaje",de:"Recycling",pt:"reciclagem",nl:"recycling"},
  "trier":{en:"to sort",it:"smistare",es:"clasificar",de:"sortieren",pt:"triar",nl:"sorteren"},
  "gaspiller":{en:"to waste",it:"sprecare",es:"desperdiciar",de:"verschwenden",pt:"desperdiçar",nl:"verspillen"},
  "ordures":{en:"rubbish",it:"spazzatura",es:"basura",de:"Müll",pt:"lixo",nl:"afval"},
  "réchauffement":{en:"global warming",it:"riscaldamento globale",es:"calentamiento global",de:"Erderwärmung",pt:"aquecimento global",nl:"opwarming van de aarde"},
  "biodiversité":{en:"biodiversity",it:"biodiversità",es:"biodiversidad",de:"Artenvielfalt",pt:"biodiversidade",nl:"biodiversiteit"},
  "déforestation":{en:"deforestation",it:"deforestazione",es:"deforestación",de:"Abholzung",pt:"desflorestação",nl:"ontbossing"},
  "couche d'ozone":{en:"ozone layer",it:"strato di ozono",es:"capa de ozono",de:"Ozonschicht",pt:"camada de ozono",nl:"ozonlaag"},
  "espèce menacée":{en:"endangered species",it:"specie a rischio",es:"especie en peligro",de:"bedrohte Art",pt:"espécie ameaçada",nl:"bedreigde diersoort"},
  "courage":{en:"courage",it:"coraggio",es:"valentía",de:"Mut",pt:"coragem",nl:"moed"},
  "patience":{en:"patience",it:"pazienza",es:"paciencia",de:"Geduld",pt:"paciência",nl:"geduld"},
  "sagesse":{en:"wisdom",it:"saggezza",es:"sabiduría",de:"Weisheit",pt:"sabedoria",nl:"wijsheid"},
  "volonté":{en:"willpower",it:"volontà",es:"voluntad",de:"Wille",pt:"vontade",nl:"wilskracht"},
  "conscience":{en:"conscience",it:"coscienza",es:"conciencia",de:"Gewissen",pt:"consciência",nl:"geweten"},
  "sincérité":{en:"sincerity",it:"sincerità",es:"sinceridad",de:"Aufrichtigkeit",pt:"sinceridade",nl:"oprechtheid"},
  "désespoir":{en:"despair",it:"disperazione",es:"desesperación",de:"Verzweiflung",pt:"desespero",nl:"wanhoop"},
  "folie":{en:"madness",it:"follia",es:"locura",de:"Wahnsinn",pt:"loucura",nl:"waanzin"},
  "doute":{en:"doubt",it:"dubbio",es:"duda",de:"Zweifel",pt:"dúvida",nl:"twijfel"},
  "humiliation":{en:"humiliation",it:"umiliazione",es:"humillación",de:"Demütigung",pt:"humilhação",nl:"vernedering"},
  "orgueil":{en:"hubris",it:"superbia",es:"soberbia",de:"Hochmut",pt:"soberba",nl:"hoogmoed"},
  "remords":{en:"remorse",it:"rimorso",es:"remordimiento",de:"Reue",pt:"remorso",nl:"wroeging"},
  "fierté":{en:"pride",it:"fierezza",es:"orgullo",de:"Stolz",pt:"orgulho",nl:"trots"},
  "destin":{en:"fate",it:"destino",es:"destino",de:"Schicksal",pt:"destino",nl:"lot"},
  "hasard":{en:"chance",it:"caso",es:"casualidad",de:"Zufall",pt:"acaso",nl:"toeval"},
  "soupçon":{en:"suspicion",it:"sospetto",es:"sospecha",de:"Verdacht",pt:"suspeita",nl:"verdenking"},
  "roman":{en:"novel",it:"romanzo",es:"novela",de:"Roman",pt:"romance",nl:"roman"},
  "chapitre":{en:"chapter",it:"capitolo",es:"capítulo",de:"Kapitel",pt:"capítulo",nl:"hoofdstuk"},
  "personnage":{en:"character",it:"personaggio",es:"personaje",de:"Figur",pt:"personagem",nl:"personage"},
  "intrigue":{en:"plot",it:"trama",es:"trama",de:"Handlung",pt:"enredo",nl:"plot"},
  "dénouement":{en:"ending",it:"epilogo",es:"desenlace",de:"Auflösung",pt:"desfecho",nl:"ontknoping"},
  "récit":{en:"tale",it:"racconto",es:"relato",de:"Erzählung",pt:"narrativa",nl:"vertelling"},
  "poème":{en:"poem",it:"poema",es:"poema",de:"Gedicht",pt:"poema",nl:"gedicht"},
  "poésie":{en:"poetry",it:"poesia",es:"poesía",de:"Dichtung",pt:"poesia",nl:"poëzie"},
  "conte":{en:"fairy tale",it:"fiaba",es:"cuento",de:"Märchen",pt:"conto",nl:"sprookje"},
  "traduction":{en:"translation",it:"traduzione",es:"traducción",de:"Übersetzung",pt:"tradução",nl:"vertaling"},
  "éditeur":{en:"publisher",it:"editore",es:"editor",de:"Verleger",pt:"editor",nl:"uitgever"},
  "librairie":{en:"bookshop",it:"libreria",es:"librería",de:"Buchhandlung",pt:"livraria",nl:"boekhandel"},
  "publier":{en:"to publish",it:"pubblicare",es:"publicar",de:"veröffentlichen",pt:"publicar",nl:"publiceren"},
  "sous-titres":{en:"subtitles",it:"sottotitoli",es:"subtítulos",de:"Untertitel",pt:"legendas",nl:"ondertitels"},
  "accomplir":{en:"to accomplish",it:"compiere",es:"cumplir",de:"vollbringen",pt:"cumprir",nl:"volbrengen"},
  "entreprendre":{en:"to undertake",it:"intraprendere",es:"emprender",de:"unternehmen",pt:"empreender",nl:"ondernemen"},
  "aboutir":{en:"to come to fruition",it:"andare in porto",es:"culminar",de:"münden",pt:"chegar a bom porto",nl:"uitmonden"},
  "renoncer":{en:"to give up",it:"rinunciare",es:"renunciar",de:"verzichten",pt:"renunciar",nl:"afzien"},
  "surmonter":{en:"to overcome",it:"superare",es:"superar",de:"überwinden",pt:"superar",nl:"overwinnen"},
  "envisager":{en:"to consider",it:"considerare",es:"plantearse",de:"in Betracht ziehen",pt:"equacionar",nl:"overwegen"},
  "constater":{en:"to note",it:"constatare",es:"constatar",de:"feststellen",pt:"constatar",nl:"vaststellen"},
  "souligner":{en:"to underline",it:"sottolineare",es:"subrayar",de:"unterstreichen",pt:"sublinhar",nl:"onderstrepen"},
  "prétendre":{en:"to claim",it:"sostenere",es:"alegar",de:"behaupten",pt:"alegar",nl:"beweren"},
  "admettre":{en:"to admit",it:"ammettere",es:"admitir",de:"zugeben",pt:"admitir",nl:"toegeven"},
  "exiger":{en:"to require",it:"esigere",es:"exigir",de:"verlangen",pt:"exigir",nl:"vereisen"},
  "négliger":{en:"to neglect",it:"trascurare",es:"descuidar",de:"vernachlässigen",pt:"negligenciar",nl:"verwaarlozen"},
  "aborder":{en:"to tackle",it:"affrontare",es:"abordar",de:"angehen",pt:"abordar",nl:"aanpakken"},
  "persuader":{en:"to persuade",it:"persuadere",es:"persuadir",de:"überreden",pt:"persuadir",nl:"overhalen"},
  "consultation":{en:"consultation",it:"visita medica",es:"consulta",de:"Sprechstunde",pt:"consulta",nl:"consult"},
  "symptôme":{en:"symptom",it:"sintomo",es:"síntoma",de:"Symptom",pt:"sintoma",nl:"symptoom"},
  "diagnostic":{en:"diagnosis",it:"diagnosi",es:"diagnóstico",de:"Diagnose",pt:"diagnóstico",nl:"diagnose"},
  "traitement":{en:"treatment",it:"trattamento",es:"tratamiento",de:"Behandlung",pt:"tratamento",nl:"behandeling"},
  "allergie":{en:"allergy",it:"allergia",es:"alergia",de:"Allergie",pt:"alergia",nl:"allergie"},
  "vaccination":{en:"vaccination",it:"vaccinazione",es:"vacunación",de:"Impfung",pt:"vacinação",nl:"vaccinatie"},
  "immunité":{en:"immunity",it:"immunità",es:"inmunidad",de:"Immunität",pt:"imunidade",nl:"immuniteit"},
  "microbe":{en:"germ",it:"microbo",es:"microbio",de:"Keim",pt:"micróbio",nl:"ziektekiem"},
  "contagieux":{en:"contagious",it:"contagioso",es:"contagioso",de:"ansteckend",pt:"contagioso",nl:"besmettelijk"},
  "régime":{en:"diet",it:"dieta",es:"dieta",de:"Diät",pt:"dieta",nl:"dieet"},
  "vitamines":{en:"vitamins",it:"vitamine",es:"vitaminas",de:"Vitamine",pt:"vitaminas",nl:"vitamines"},
  "épidémie":{en:"epidemic",it:"epidemia",es:"epidemia",de:"Epidemie",pt:"epidemia",nl:"epidemie"},
  "guérison":{en:"recovery",it:"guarigione",es:"curación",de:"Heilung",pt:"cura",nl:"genezing"},
  "rechute":{en:"relapse",it:"ricaduta",es:"recaída",de:"Rückfall",pt:"recaída",nl:"terugval"},
  "soulagement":{en:"relief",it:"sollievo",es:"alivio",de:"Erleichterung",pt:"alívio",nl:"opluchting"},
  "admiration":{en:"admiration",it:"ammirazione",es:"admiración",de:"Bewunderung",pt:"admiração",nl:"bewondering"},
  "enthousiasme":{en:"enthusiasm",it:"entusiasmo",es:"entusiasmo",de:"Begeisterung",pt:"entusiasmo",nl:"enthousiasme"},
  "compassion":{en:"compassion",it:"compassione",es:"compasión",de:"Mitgefühl",pt:"compaixão",nl:"medeleven"},
  "nostalgie":{en:"nostalgia",it:"nostalgia",es:"nostalgia",de:"Wehmut",pt:"saudade",nl:"weemoed"},
  "inquiétude":{en:"worry",it:"preoccupazione",es:"preocupación",de:"Sorge",pt:"preocupação",nl:"bezorgdheid"},
  "angoisse":{en:"anxiety",it:"angoscia",es:"angustia",de:"Beklemmung",pt:"angústia",nl:"beklemming"},
  "méfiance":{en:"distrust",it:"diffidenza",es:"desconfianza",de:"Misstrauen",pt:"desconfiança",nl:"wantrouwen"},
  "frustration":{en:"frustration",it:"frustrazione",es:"frustración",de:"Frustration",pt:"frustração",nl:"frustratie"},
  "mépris":{en:"contempt",it:"disprezzo",es:"desprecio",de:"Verachtung",pt:"desprezo",nl:"minachting"},
  "gêne":{en:"embarrassment",it:"imbarazzo",es:"incomodidad",de:"Verlegenheit",pt:"embaraço",nl:"ongemak"},
  "indifférence":{en:"indifference",it:"indifferenza",es:"indiferencia",de:"Gleichgültigkeit",pt:"indiferença",nl:"onverschilligheid"},
  "ambitieux":{en:"ambitious",it:"ambizioso",es:"ambicioso",de:"ehrgeizig",pt:"ambicioso",nl:"ambitieus"},
  "audacieux":{en:"daring",it:"audace",es:"audaz",de:"kühn",pt:"ousado",nl:"stoutmoedig"},
  "loyal":{en:"loyal",it:"leale",es:"leal",de:"loyal",pt:"leal",nl:"loyaal"},
  "perfectionniste":{en:"perfectionist",it:"perfezionista",es:"perfeccionista",de:"Perfektionist",pt:"perfecionista",nl:"perfectionist"},
  "insouciant":{en:"carefree",it:"spensierato",es:"despreocupado",de:"unbekümmert",pt:"despreocupado",nl:"zorgeloos"},
  "arrogant":{en:"arrogant",it:"arrogante",es:"arrogante",de:"arrogant",pt:"arrogante",nl:"arrogant"},
  "humble":{en:"humble",it:"umile",es:"humilde",de:"demütig",pt:"humilde",nl:"nederig"},
  "hypocrite":{en:"hypocritical",it:"ipocrita",es:"hipócrita",de:"heuchlerisch",pt:"hipócrita",nl:"hypocriet"},
  "rancunier":{en:"resentful",it:"rancoroso",es:"rencoroso",de:"nachtragend",pt:"rancoroso",nl:"haatdragend"},
  "indulgent":{en:"lenient",it:"indulgente",es:"indulgente",de:"nachsichtig",pt:"indulgente",nl:"toegeeflijk"},
  "ordre du jour":{en:"agenda",it:"ordine del giorno",es:"orden del día",de:"Tagesordnung",pt:"ordem do dia",nl:"agenda"},
  "échéance":{en:"deadline",it:"scadenza",es:"plazo",de:"Frist",pt:"prazo",nl:"termijn"},
  "objectif":{en:"objective",it:"obiettivo",es:"objetivo",de:"Ziel",pt:"objetivo",nl:"doelstelling"},
  "tâche":{en:"task",it:"compito",es:"tarea",de:"Aufgabe",pt:"tarefa",nl:"taak"},
  "responsabilité":{en:"responsibility",it:"responsabilità",es:"responsabilidad",de:"Verantwortung",pt:"responsabilidade",nl:"verantwoordelijkheid"},
  "procès-verbal":{en:"minutes",it:"verbale",es:"acta",de:"Protokoll",pt:"ata",nl:"notulen"},
  "congé":{en:"leave",it:"congedo",es:"permiso",de:"Freistellung",pt:"folga",nl:"verlof"},
  "télétravail":{en:"remote working",it:"telelavoro",es:"teletrabajo",de:"Homeoffice",pt:"teletrabalho",nl:"thuiswerken"},
  "démission":{en:"resignation",it:"dimissioni",es:"dimisión",de:"Kündigung",pt:"demissão",nl:"ontslagname"},
  "recrutement":{en:"recruitment",it:"reclutamento",es:"contratación",de:"Rekrutierung",pt:"recrutamento",nl:"werving"},
  "entretien d'embauche":{en:"job interview",it:"colloquio di lavoro",es:"entrevista de trabajo",de:"Vorstellungsgespräch",pt:"entrevista de emprego",nl:"sollicitatiegesprek"},
  "reportage":{en:"news report",it:"reportage",es:"reportaje",de:"Reportage",pt:"reportagem",nl:"reportage"},
  "interview":{en:"interview",it:"intervista",es:"entrevista",de:"Interview",pt:"entrevista",nl:"interview"},
  "gros titre":{en:"headline",it:"titolo principale",es:"titular",de:"Schlagzeile",pt:"manchete",nl:"krantenkop"},
  "rédaction":{en:"editorial team",it:"redazione",es:"redacción",de:"Redaktion",pt:"redação",nl:"redactie"},
  "rumeur":{en:"rumour",it:"diceria",es:"rumor",de:"Gerücht",pt:"boato",nl:"gerucht"},
  "scandale":{en:"scandal",it:"scandalo",es:"escándalo",de:"Skandal",pt:"escândalo",nl:"schandaal"},
  "censure":{en:"censorship",it:"censura",es:"censura",de:"Zensur",pt:"censura",nl:"censuur"},
  "sondage":{en:"poll",it:"sondaggio",es:"encuesta",de:"Umfrage",pt:"sondagem",nl:"peiling"},
  "il vaut mieux prévenir que guérir":{en:"prevention is better than cure",it:"prevenire è meglio che curare",es:"más vale prevenir que curar",de:"Vorbeugen ist besser als Heilen",pt:"mais vale prevenir do que remediar",nl:"voorkomen is beter dan genezen"},
  "ce n'est pas la peine":{en:"there's no need",it:"non serve",es:"no hace falta",de:"das ist nicht nötig",pt:"não é preciso",nl:"dat hoeft niet"},
  "j'en ai marre":{en:"I'm fed up",it:"non ne posso più",es:"estoy harto",de:"ich habe es satt",pt:"estou farto",nl:"ik ben het zat"},
  "ça n'a rien à voir":{en:"that has nothing to do with it",it:"non c'entra niente",es:"no tiene nada que ver",de:"das hat nichts damit zu tun",pt:"não tem nada a ver",nl:"dat heeft er niets mee te maken"},
  "tu peux compter sur moi":{en:"you can count on me",it:"puoi contare su di me",es:"puedes contar conmigo",de:"du kannst auf mich zählen",pt:"podes contar comigo",nl:"je kunt op mij rekenen"}
};
CURRICULUM_Q.forEach(function(u){ CURRICULUM.push(u); });
LANGS.forEach(function(l){ Object.keys(NEWV9).forEach(function(k){ if(NEWV9[k][l]) LEX[l][k]=NEWV9[k][l]; }); });

/* --- EXTENSION v2.65 (vague 9 — cap B2) : 11 unités — banque, numérique, chantier, enquête,
   international, cuisine du chef, adjectifs de précision, connecteurs soutenus, sciences,
   logement/droit, expressions imagées. Parité garantie (NEWV10). Portugais EUROPÉEN toujours :
   ecrã tátil, betão, burla, portagem, cozedura, lume brando, numerário, conta da luz. --- */
var CURRICULUM_P = [
  { t:"À la banque 🏦", c:"#34d399", L:[
    { t:"Les opérations", w:["virement","prélèvement","intérêts","taux","devise"], p:[] },
    { t:"Gérer son argent", w:["hypothèque","livret d'épargne","chéquier","espèces","facture d'électricité"], p:[] } ]},
  { t:"Le numérique avancé 💻", c:"#60a5fa", L:[
    { t:"Machines et programmes", w:["intelligence artificielle","données","logiciel","matériel","sauvegarde","mise à jour"], p:[] },
    { t:"Le côté obscur", w:["piratage","virus informatique","écran tactile","objet connecté","réseau social"], p:[] } ]},
  { t:"Le grand chantier 🏗", c:"#fb923c", L:[
    { t:"Bâtir haut", w:["gratte-ciel","béton","brique","grue","échafaudage"], p:[] },
    { t:"De la cave au toit", w:["fondations","charpente","façade","toiture","permis de construire"], p:[] } ]},
  { t:"Enquête policière 🕵️", c:"#94a3b8", L:[
    { t:"Sur les lieux", w:["enquête","indice","suspect","témoignage","empreintes digitales","alibi"], p:[] },
    { t:"Le dossier s'épaissit", w:["cambriolage","agression","escroquerie","interrogatoire","menottes","rançon"], p:[] } ]},
  { t:"La scène internationale 🌐", c:"#818cf8", L:[
    { t:"La diplomatie", w:["ambassade","consulat","traité","diplomatie","cessez-le-feu"], p:[] },
    { t:"Un monde en mouvement", w:["réfugié","immigration","émigration","mondialisation","aide humanitaire"], p:[] } ]},
  { t:"Les secrets du chef 👨‍🍳", c:"#f59e0b", L:[
    { t:"Préparer", w:["assaisonner","éplucher","mariner","pétrir","levure"], p:[] },
    { t:"Cuire doucement", w:["mijoter","cuisson","garniture","épices","herbes aromatiques"], p:[] } ]},
  { t:"Adjectifs de précision ✨", c:"#fbbf24", L:[
    { t:"Le travail bien fait", w:["rentable","fiable","exigeant","soigneux","rigoureux","approfondi"], p:[] },
    { t:"Nuances de matière", w:["négligent","souple","rigide","robuste","durable","superficiel"], p:[] } ]},
  { t:"Connecteurs soutenus 🔗", c:"#94a3b8", L:[
    { t:"Nuancer sa pensée", w:["néanmoins","toutefois","en revanche","par conséquent","d'autant plus","en outre"], p:[] },
    { t:"Articuler son discours", w:["quant à","faute de","à condition que","bien que","afin de","tandis que"], p:[] } ]},
  { t:"Au microscope 🔬", c:"#22d3ee", L:[
    { t:"L'infiniment petit", w:["cellule","gène","ADN","molécule","atome"], p:[] },
    { t:"La démarche scientifique", w:["évolution","échantillon","hypothèse","démonstration","éprouvette"], p:[] } ]},
  { t:"Logement et droit 🏠", c:"#a78bfa", L:[
    { t:"Louer et posséder", w:["locataire","propriétaire","bail","caution","assurance","héritage"], p:[] },
    { t:"Sur la route aussi", w:["testament","notaire","péage","covoiturage","contravention","stationnement"], p:[] } ]},
  { t:"Expressions imagées 💬", c:"#f472b6", L:[
    { t:"Comme un natif", w:["ça saute aux yeux","il n'y a pas de quoi","à vrai dire","en fin de compte","quoi qu'il en soit"], p:[] } ]}
];
var NEWV10 = {
  "virement":{en:"bank transfer",it:"bonifico",es:"transferencia",de:"Überweisung",pt:"transferência",nl:"overschrijving"},
  "prélèvement":{en:"direct debit",it:"addebito diretto",es:"domiciliación",de:"Lastschrift",pt:"débito direto",nl:"automatische incasso"},
  "intérêts":{en:"interest",it:"interessi",es:"intereses",de:"Zinsen",pt:"juros",nl:"rente"},
  "taux":{en:"rate",it:"tasso",es:"tipo de interés",de:"Zinssatz",pt:"taxa de juro",nl:"rentevoet"},
  "devise":{en:"currency",it:"valuta",es:"divisa",de:"Währung",pt:"divisa",nl:"valuta"},
  "hypothèque":{en:"mortgage",it:"ipoteca",es:"hipoteca",de:"Hypothek",pt:"hipoteca",nl:"hypotheek"},
  "livret d'épargne":{en:"savings account",it:"libretto di risparmio",es:"cuenta de ahorros",de:"Sparbuch",pt:"conta-poupança",nl:"spaarrekening"},
  "chéquier":{en:"chequebook",it:"libretto degli assegni",es:"talonario de cheques",de:"Scheckheft",pt:"livro de cheques",nl:"chequeboek"},
  "espèces":{en:"cash",it:"contanti",es:"efectivo",de:"Bargeld",pt:"numerário",nl:"contant geld"},
  "facture d'électricité":{en:"electricity bill",it:"bolletta della luce",es:"factura de la luz",de:"Stromrechnung",pt:"conta da luz",nl:"elektriciteitsrekening"},
  "intelligence artificielle":{en:"artificial intelligence",it:"intelligenza artificiale",es:"inteligencia artificial",de:"künstliche Intelligenz",pt:"inteligência artificial",nl:"kunstmatige intelligentie"},
  "données":{en:"data",it:"dati",es:"datos",de:"Daten",pt:"dados",nl:"gegevens"},
  "logiciel":{en:"software",it:"software",es:"software",de:"Software",pt:"software",nl:"software"},
  "matériel":{en:"hardware",it:"hardware",es:"hardware",de:"Hardware",pt:"hardware",nl:"hardware"},
  "sauvegarde":{en:"backup",it:"backup",es:"copia de seguridad",de:"Sicherungskopie",pt:"cópia de segurança",nl:"back-up"},
  "mise à jour":{en:"update",it:"aggiornamento",es:"actualización",de:"Aktualisierung",pt:"atualização",nl:"update"},
  "piratage":{en:"hacking",it:"pirateria informatica",es:"piratería",de:"Hacking",pt:"pirataria informática",nl:"hacken"},
  "virus informatique":{en:"computer virus",it:"virus informatico",es:"virus informático",de:"Computervirus",pt:"vírus informático",nl:"computervirus"},
  "écran tactile":{en:"touchscreen",it:"schermo tattile",es:"pantalla táctil",de:"Touchscreen",pt:"ecrã tátil",nl:"touchscreen"},
  "objet connecté":{en:"smart device",it:"dispositivo connesso",es:"dispositivo conectado",de:"smartes Gerät",pt:"dispositivo inteligente",nl:"slim apparaat"},
  "réseau social":{en:"social network",it:"social network",es:"red social",de:"soziales Netzwerk",pt:"rede social",nl:"sociaal netwerk"},
  "gratte-ciel":{en:"skyscraper",it:"grattacielo",es:"rascacielos",de:"Wolkenkratzer",pt:"arranha-céus",nl:"wolkenkrabber"},
  "béton":{en:"concrete",it:"calcestruzzo",es:"hormigón",de:"Beton",pt:"betão",nl:"beton"},
  "brique":{en:"brick",it:"mattone",es:"ladrillo",de:"Ziegel",pt:"tijolo",nl:"baksteen"},
  "grue":{en:"crane",it:"gru",es:"grúa",de:"Kran",pt:"grua",nl:"hijskraan"},
  "échafaudage":{en:"scaffolding",it:"impalcatura",es:"andamio",de:"Gerüst",pt:"andaime",nl:"steiger"},
  "fondations":{en:"foundations",it:"fondamenta",es:"cimientos",de:"Fundament",pt:"alicerces",nl:"fundering"},
  "charpente":{en:"roof frame",it:"intelaiatura",es:"armazón",de:"Dachstuhl",pt:"estrutura do telhado",nl:"dakconstructie"},
  "façade":{en:"façade",it:"facciata",es:"fachada",de:"Fassade",pt:"fachada",nl:"gevel"},
  "toiture":{en:"roofing",it:"copertura",es:"cubierta",de:"Bedachung",pt:"cobertura",nl:"dakbedekking"},
  "permis de construire":{en:"building permit",it:"permesso di costruire",es:"licencia de obras",de:"Baugenehmigung",pt:"licença de construção",nl:"bouwvergunning"},
  "enquête":{en:"investigation",it:"indagine",es:"investigación",de:"Ermittlung",pt:"investigação",nl:"onderzoek"},
  "indice":{en:"clue",it:"indizio",es:"indicio",de:"Hinweis",pt:"indício",nl:"aanwijzing"},
  "suspect":{en:"suspect",it:"sospettato",es:"sospechoso",de:"Verdächtiger",pt:"suspeito",nl:"verdachte"},
  "témoignage":{en:"testimony",it:"testimonianza",es:"testimonio",de:"Zeugenaussage",pt:"testemunho",nl:"getuigenis"},
  "empreintes digitales":{en:"fingerprints",it:"impronte digitali",es:"huellas dactilares",de:"Fingerabdrücke",pt:"impressões digitais",nl:"vingerafdrukken"},
  "alibi":{en:"alibi",it:"alibi",es:"coartada",de:"Alibi",pt:"álibi",nl:"alibi"},
  "cambriolage":{en:"burglary",it:"furto con scasso",es:"robo",de:"Einbruch",pt:"assalto",nl:"inbraak"},
  "agression":{en:"assault",it:"aggressione",es:"agresión",de:"Angriff",pt:"agressão",nl:"aanval"},
  "escroquerie":{en:"fraud",it:"truffa",es:"estafa",de:"Betrug",pt:"burla",nl:"oplichting"},
  "interrogatoire":{en:"interrogation",it:"interrogatorio",es:"interrogatorio",de:"Verhör",pt:"interrogatório",nl:"verhoor"},
  "menottes":{en:"handcuffs",it:"manette",es:"esposas",de:"Handschellen",pt:"algemas",nl:"handboeien"},
  "rançon":{en:"ransom",it:"riscatto",es:"rescate",de:"Lösegeld",pt:"resgate",nl:"losgeld"},
  "ambassade":{en:"embassy",it:"ambasciata",es:"embajada",de:"Botschaft",pt:"embaixada",nl:"ambassade"},
  "consulat":{en:"consulate",it:"consolato",es:"consulado",de:"Konsulat",pt:"consulado",nl:"consulaat"},
  "traité":{en:"treaty",it:"trattato",es:"tratado",de:"Abkommen",pt:"tratado",nl:"verdrag"},
  "diplomatie":{en:"diplomacy",it:"diplomazia",es:"diplomacia",de:"Diplomatie",pt:"diplomacia",nl:"diplomatie"},
  "cessez-le-feu":{en:"ceasefire",it:"cessate il fuoco",es:"alto el fuego",de:"Waffenstillstand",pt:"cessar-fogo",nl:"staakt-het-vuren"},
  "réfugié":{en:"refugee",it:"rifugiato",es:"refugiado",de:"Flüchtling",pt:"refugiado",nl:"vluchteling"},
  "immigration":{en:"immigration",it:"immigrazione",es:"inmigración",de:"Einwanderung",pt:"imigração",nl:"immigratie"},
  "émigration":{en:"emigration",it:"emigrazione",es:"emigración",de:"Auswanderung",pt:"emigração",nl:"emigratie"},
  "mondialisation":{en:"globalisation",it:"globalizzazione",es:"globalización",de:"Globalisierung",pt:"globalização",nl:"globalisering"},
  "aide humanitaire":{en:"humanitarian aid",it:"aiuti umanitari",es:"ayuda humanitaria",de:"humanitäre Hilfe",pt:"ajuda humanitária",nl:"humanitaire hulp"},
  "assaisonner":{en:"to season",it:"condire",es:"aliñar",de:"würzen",pt:"temperar",nl:"op smaak brengen"},
  "éplucher":{en:"to peel",it:"sbucciare",es:"pelar",de:"schälen",pt:"descascar",nl:"schillen"},
  "mariner":{en:"to marinate",it:"marinare",es:"marinar",de:"marinieren",pt:"marinar",nl:"marineren"},
  "pétrir":{en:"to knead",it:"impastare",es:"amasar",de:"kneten",pt:"amassar",nl:"kneden"},
  "levure":{en:"yeast",it:"lievito",es:"levadura",de:"Hefe",pt:"fermento",nl:"gist"},
  "mijoter":{en:"to simmer",it:"cuocere a fuoco lento",es:"cocer a fuego lento",de:"köcheln",pt:"cozinhar em lume brando",nl:"sudderen"},
  "cuisson":{en:"cooking time",it:"cottura",es:"cocción",de:"Garzeit",pt:"cozedura",nl:"gaartijd"},
  "garniture":{en:"side dish",it:"contorno",es:"guarnición",de:"Beilage",pt:"acompanhamento",nl:"bijgerecht"},
  "épices":{en:"spices",it:"spezie",es:"especias",de:"Gewürze",pt:"especiarias",nl:"specerijen"},
  "herbes aromatiques":{en:"herbs",it:"erbe aromatiche",es:"hierbas aromáticas",de:"Kräuter",pt:"ervas aromáticas",nl:"kruiden"},
  "rentable":{en:"profitable",it:"redditizio",es:"rentable",de:"rentabel",pt:"rentável",nl:"winstgevend"},
  "fiable":{en:"reliable",it:"affidabile",es:"fiable",de:"zuverlässig",pt:"fiável",nl:"betrouwbaar"},
  "exigeant":{en:"demanding",it:"esigente",es:"exigente",de:"anspruchsvoll",pt:"exigente",nl:"veeleisend"},
  "soigneux":{en:"meticulous",it:"accurato",es:"cuidadoso",de:"sorgfältig",pt:"cuidadoso",nl:"zorgvuldig"},
  "rigoureux":{en:"rigorous",it:"rigoroso",es:"riguroso",de:"rigoros",pt:"rigoroso",nl:"rigoureus"},
  "approfondi":{en:"in-depth",it:"approfondito",es:"exhaustivo",de:"gründlich",pt:"aprofundado",nl:"diepgaand"},
  "négligent":{en:"careless",it:"negligente",es:"descuidado",de:"nachlässig",pt:"negligente",nl:"slordig"},
  "souple":{en:"flexible",it:"flessibile",es:"flexible",de:"flexibel",pt:"flexível",nl:"soepel"},
  "rigide":{en:"rigid",it:"rigido",es:"rígido",de:"starr",pt:"rígido",nl:"rigide"},
  "robuste":{en:"sturdy",it:"robusto",es:"robusto",de:"robust",pt:"robusto",nl:"robuust"},
  "durable":{en:"sustainable",it:"sostenibile",es:"sostenible",de:"nachhaltig",pt:"sustentável",nl:"duurzaam"},
  "superficiel":{en:"superficial",it:"superficiale",es:"superficial",de:"oberflächlich",pt:"superficial",nl:"oppervlakkig"},
  "néanmoins":{en:"nevertheless",it:"nondimeno",es:"no obstante",de:"nichtsdestotrotz",pt:"não obstante",nl:"niettemin"},
  "toutefois":{en:"nonetheless",it:"però",es:"con todo",de:"allerdings",pt:"todavia",nl:"evenwel"},
  "en revanche":{en:"on the other hand",it:"in compenso",es:"en cambio",de:"hingegen",pt:"em contrapartida",nl:"daarentegen"},
  "par conséquent":{en:"consequently",it:"di conseguenza",es:"por consiguiente",de:"folglich",pt:"por conseguinte",nl:"bijgevolg"},
  "d'autant plus":{en:"all the more",it:"a maggior ragione",es:"tanto más",de:"umso mehr",pt:"tanto mais",nl:"des te meer"},
  "en outre":{en:"furthermore",it:"inoltre",es:"además",de:"außerdem",pt:"além disso",nl:"bovendien"},
  "quant à":{en:"as for",it:"quanto a",es:"en cuanto a",de:"bezüglich",pt:"quanto a",nl:"wat betreft"},
  "faute de":{en:"for lack of",it:"in mancanza di",es:"a falta de",de:"mangels",pt:"à falta de",nl:"bij gebrek aan"},
  "à condition que":{en:"provided that",it:"a condizione che",es:"siempre que",de:"vorausgesetzt, dass",pt:"desde que",nl:"op voorwaarde dat"},
  "bien que":{en:"although",it:"sebbene",es:"aunque",de:"obwohl",pt:"embora",nl:"hoewel"},
  "afin de":{en:"in order to",it:"al fine di",es:"con el fin de",de:"um zu",pt:"a fim de",nl:"teneinde"},
  "tandis que":{en:"whereas",it:"mentre",es:"mientras que",de:"wohingegen",pt:"enquanto",nl:"terwijl"},
  "cellule":{en:"cell",it:"cellula",es:"célula",de:"Zelle",pt:"célula",nl:"cel"},
  "gène":{en:"gene",it:"gene",es:"gen",de:"Gen",pt:"gene",nl:"gen"},
  "ADN":{en:"DNA",it:"DNA",es:"ADN",de:"DNS",pt:"ADN",nl:"DNA"},
  "molécule":{en:"molecule",it:"molecola",es:"molécula",de:"Molekül",pt:"molécula",nl:"molecuul"},
  "atome":{en:"atom",it:"atomo",es:"átomo",de:"Atom",pt:"átomo",nl:"atoom"},
  "évolution":{en:"evolution",it:"evoluzione",es:"evolución",de:"Evolution",pt:"evolução",nl:"evolutie"},
  "échantillon":{en:"sample",it:"esemplare",es:"muestra",de:"Probe",pt:"amostra",nl:"monster"},
  "hypothèse":{en:"hypothesis",it:"ipotesi",es:"hipótesis",de:"Hypothese",pt:"hipótese",nl:"hypothese"},
  "démonstration":{en:"demonstration",it:"dimostrazione",es:"demostración",de:"Beweisführung",pt:"demonstração",nl:"bewijsvoering"},
  "éprouvette":{en:"test tube",it:"provetta",es:"probeta",de:"Reagenzglas",pt:"proveta",nl:"reageerbuis"},
  "locataire":{en:"tenant",it:"inquilino",es:"inquilino",de:"Mieter",pt:"inquilino",nl:"huurder"},
  "propriétaire":{en:"owner",it:"proprietario",es:"propietario",de:"Eigentümer",pt:"proprietário",nl:"eigenaar"},
  "bail":{en:"lease",it:"contratto d'affitto",es:"contrato de alquiler",de:"Mietvertrag",pt:"contrato de arrendamento",nl:"huurcontract"},
  "caution":{en:"deposit",it:"cauzione",es:"fianza",de:"Kaution",pt:"caução",nl:"borg"},
  "assurance":{en:"insurance",it:"assicurazione",es:"seguro",de:"Versicherung",pt:"seguro",nl:"verzekering"},
  "héritage":{en:"inheritance",it:"eredità",es:"herencia",de:"Erbe",pt:"herança",nl:"erfenis"},
  "testament":{en:"will",it:"testamento",es:"testamento",de:"Testament",pt:"testamento",nl:"testament"},
  "notaire":{en:"notary",it:"notaio",es:"notario",de:"Notar",pt:"notário",nl:"notaris"},
  "péage":{en:"toll",it:"pedaggio",es:"peaje",de:"Maut",pt:"portagem",nl:"tol"},
  "covoiturage":{en:"carpooling",it:"car pooling",es:"coche compartido",de:"Fahrgemeinschaft",pt:"partilha de carro",nl:"carpoolen"},
  "contravention":{en:"traffic ticket",it:"contravvenzione",es:"multa de tráfico",de:"Strafzettel",pt:"multa de trânsito",nl:"verkeersboete"},
  "stationnement":{en:"parking",it:"sosta",es:"estacionamiento",de:"Parken",pt:"estacionamento",nl:"parkeren"},
  "ça saute aux yeux":{en:"it's obvious",it:"salta agli occhi",es:"salta a la vista",de:"das springt ins Auge",pt:"salta à vista",nl:"het springt in het oog"},
  "il n'y a pas de quoi":{en:"don't mention it",it:"non c'è di che",es:"no hay de qué",de:"keine Ursache",pt:"não tem de quê",nl:"graag gedaan"},
  "à vrai dire":{en:"to tell the truth",it:"a dire il vero",es:"a decir verdad",de:"um ehrlich zu sein",pt:"para dizer a verdade",nl:"eerlijk gezegd"},
  "en fin de compte":{en:"in the end",it:"in fin dei conti",es:"al fin y al cabo",de:"letzten Endes",pt:"no fim de contas",nl:"uiteindelijk"},
  "quoi qu'il en soit":{en:"be that as it may",it:"comunque sia",es:"sea como sea",de:"wie dem auch sei",pt:"seja como for",nl:"hoe dan ook"}
};
CURRICULUM_P.forEach(function(u){ CURRICULUM.push(u); });
LANGS.forEach(function(l){ Object.keys(NEWV10).forEach(function(k){ if(NEWV10[k][l]) LEX[l][k]=NEWV10[k][l]; }); });

/* --- EXTENSION v2.66 (vague 10 — cap B2) : 10 unités — cinéma, étapes de la vie, débattre,
   religions, université, tourisme, sport intensif, cours d'eau, verbes vifs, loisirs créatifs.
   Parité garantie (NEWV11). Portugais EUROPÉEN toujours : realizador, guião, dobragem, genérico,
   vedeta, doutoramento, licenciatura, investigação, posto de turismo, época baixa, equipa,
   aguarela. --- */
var CURRICULUM_O = [
  { t:"Le cinéma 🎬", c:"#c084fc", L:[
    { t:"Sur le plateau", w:["réalisateur","tournage","scénario","figurant","vedette","plateau de tournage"], p:[] },
    { t:"En salle", w:["doublage","bande-annonce","générique","effets spéciaux","court-métrage","sous-titrage"], p:[] } ]},
  { t:"Les étapes de la vie 🧓", c:"#fbbf24", L:[
    { t:"Grandir", w:["nourrisson","adolescence","jeunesse","majorité"], p:[] },
    { t:"Le grand âge", w:["vieillesse","décès","état civil","espérance de vie"], p:[] } ]},
  { t:"L'art de débattre 🗣", c:"#38bdf8", L:[
    { t:"Argumenter", w:["argument","réfuter","nuancer","objection","porte-parole"], p:[] },
    { t:"Trouver un accord", w:["compromis","consensus","polémique","controverse","mauvaise foi"], p:[] } ]},
  { t:"Croyances et religions ⛪", c:"#94a3b8", L:[
    { t:"Les lieux sacrés", w:["mosquée","synagogue","temple","prière","pèlerinage"], p:[] },
    { t:"Croire ou ne pas croire", w:["croyance","foi","athée","rite","laïcité"], p:[] } ]},
  { t:"L'université 🎓", c:"#818cf8", L:[
    { t:"Les diplômes", w:["licence","master","doctorat","thèse","soutenance"], p:[] },
    { t:"La vie étudiante", w:["amphithéâtre","bourse","inscription","recherche scientifique","stage de fin d'études"], p:[] } ]},
  { t:"Voyager malin 🧳", c:"#22d3ee", L:[
    { t:"Préparer le départ", w:["hébergement","itinéraire","formalités","visa","assurance voyage"], p:[] },
    { t:"Une fois sur place", w:["escale","hors saison","haute saison","dépaysement","office de tourisme"], p:[] } ]},
  { t:"Le sport intensif 💪", c:"#34d399", L:[
    { t:"L'effort", w:["échauffement","étirement","endurance","souffle","transpiration"], p:[] },
    { t:"Après l'effort", w:["courbature","récupération","dopage","performance","esprit d'équipe"], p:[] } ]},
  { t:"Les cours d'eau 🌊", c:"#60a5fa", L:[
    { t:"Du fleuve à la mer", w:["barrage","écluse","affluent","delta","estuaire"], p:[] },
    { t:"Au bord de l'eau", w:["berge","noyade","crue","nappe phréatique"], p:[] } ]},
  { t:"Verbes vifs 🔥", c:"#ef4444", L:[
    { t:"Ça surgit", w:["jaillir","s'effondrer","surgir","se répandre","déborder"], p:[] },
    { t:"Ça se transforme", w:["engloutir","dissoudre","s'évaporer","congeler","fondre"], p:[] } ]},
  { t:"Loisirs créatifs 🤹", c:"#f472b6", L:[
    { t:"Fil et aiguille", w:["tricot","couture","broderie","poterie","aquarelle"], p:[] },
    { t:"Jeux d'esprit", w:["calligraphie","origami","maquette","échecs","jeu de dames"], p:[] } ]}
];
var NEWV11 = {
  "réalisateur":{en:"film director",it:"regista",es:"director de cine",de:"Regisseur",pt:"realizador",nl:"regisseur"},
  "tournage":{en:"filming",it:"riprese",es:"rodaje",de:"Dreharbeiten",pt:"rodagem",nl:"filmopnamen"},
  "scénario":{en:"screenplay",it:"sceneggiatura",es:"guion",de:"Drehbuch",pt:"guião",nl:"scenario"},
  "figurant":{en:"extra",it:"comparsa",es:"figurante",de:"Komparse",pt:"figurante",nl:"figurant"},
  "vedette":{en:"film star",it:"celebrità",es:"estrella de cine",de:"Filmstar",pt:"vedeta",nl:"filmster"},
  "plateau de tournage":{en:"film set",it:"set cinematografico",es:"plató",de:"Filmset",pt:"set de filmagem",nl:"filmset"},
  "doublage":{en:"dubbing",it:"doppiaggio",es:"doblaje",de:"Synchronisation",pt:"dobragem",nl:"nasynchronisatie"},
  "bande-annonce":{en:"trailer",it:"trailer",es:"tráiler",de:"Trailer",pt:"trailer",nl:"trailer"},
  "générique":{en:"credits",it:"titoli di coda",es:"créditos",de:"Abspann",pt:"genérico",nl:"aftiteling"},
  "effets spéciaux":{en:"special effects",it:"effetti speciali",es:"efectos especiales",de:"Spezialeffekte",pt:"efeitos especiais",nl:"speciale effecten"},
  "court-métrage":{en:"short film",it:"cortometraggio",es:"cortometraje",de:"Kurzfilm",pt:"curta-metragem",nl:"korte film"},
  "sous-titrage":{en:"subtitling",it:"sottotitolazione",es:"subtitulado",de:"Untertitelung",pt:"legendagem",nl:"ondertiteling"},
  "nourrisson":{en:"infant",it:"lattante",es:"lactante",de:"Säugling",pt:"lactente",nl:"zuigeling"},
  "adolescence":{en:"adolescence",it:"adolescenza",es:"adolescencia",de:"Adoleszenz",pt:"adolescência",nl:"puberteit"},
  "jeunesse":{en:"youth",it:"gioventù",es:"juventud",de:"Jugend",pt:"juventude",nl:"jeugd"},
  "majorité":{en:"coming of age",it:"maggiore età",es:"mayoría de edad",de:"Volljährigkeit",pt:"maioridade",nl:"meerderjarigheid"},
  "vieillesse":{en:"old age",it:"vecchiaia",es:"vejez",de:"Alter",pt:"velhice",nl:"ouderdom"},
  "décès":{en:"decease",it:"decesso",es:"fallecimiento",de:"Ableben",pt:"falecimento",nl:"overlijden"},
  "état civil":{en:"civil status",it:"stato civile",es:"estado civil",de:"Personenstand",pt:"estado civil",nl:"burgerlijke staat"},
  "espérance de vie":{en:"life expectancy",it:"aspettativa di vita",es:"esperanza de vida",de:"Lebenserwartung",pt:"esperança de vida",nl:"levensverwachting"},
  "argument":{en:"argument",it:"argomentazione",es:"argumento",de:"Argument",pt:"argumento",nl:"argument"},
  "réfuter":{en:"to refute",it:"confutare",es:"refutar",de:"widerlegen",pt:"refutar",nl:"weerleggen"},
  "nuancer":{en:"to nuance",it:"sfumare",es:"matizar",de:"differenzieren",pt:"matizar",nl:"nuanceren"},
  "objection":{en:"objection",it:"obiezione",es:"objeción",de:"Einwand",pt:"objeção",nl:"bezwaar"},
  "porte-parole":{en:"spokesperson",it:"portavoce",es:"portavoz",de:"Sprecher",pt:"porta-voz",nl:"woordvoerder"},
  "compromis":{en:"compromise",it:"compromesso",es:"compromiso",de:"Kompromiss",pt:"compromisso",nl:"compromis"},
  "consensus":{en:"consensus",it:"consenso",es:"consenso",de:"Konsens",pt:"consenso",nl:"consensus"},
  "polémique":{en:"polemic",it:"polemica",es:"polémica",de:"Polemik",pt:"polémica",nl:"polemiek"},
  "controverse":{en:"controversy",it:"controversia",es:"controversia",de:"Kontroverse",pt:"controvérsia",nl:"controverse"},
  "mauvaise foi":{en:"bad faith",it:"malafede",es:"mala fe",de:"Unredlichkeit",pt:"má-fé",nl:"kwade trouw"},
  "mosquée":{en:"mosque",it:"moschea",es:"mezquita",de:"Moschee",pt:"mesquita",nl:"moskee"},
  "synagogue":{en:"synagogue",it:"sinagoga",es:"sinagoga",de:"Synagoge",pt:"sinagoga",nl:"synagoge"},
  "temple":{en:"temple",it:"tempio",es:"templo",de:"Tempel",pt:"templo",nl:"tempel"},
  "prière":{en:"prayer",it:"preghiera",es:"oración",de:"Gebet",pt:"oração",nl:"gebed"},
  "pèlerinage":{en:"pilgrimage",it:"pellegrinaggio",es:"peregrinación",de:"Pilgerfahrt",pt:"peregrinação",nl:"bedevaart"},
  "croyance":{en:"belief",it:"credenza",es:"creencia",de:"Überzeugung",pt:"crença",nl:"geloofsovertuiging"},
  "foi":{en:"faith",it:"fede religiosa",es:"fe",de:"Glaube",pt:"fé",nl:"geloof"},
  "athée":{en:"atheist",it:"ateo",es:"ateo",de:"Atheist",pt:"ateu",nl:"atheïst"},
  "rite":{en:"rite",it:"rito",es:"rito",de:"Ritus",pt:"rito",nl:"ritueel"},
  "laïcité":{en:"secularism",it:"laicità",es:"laicismo",de:"Laizität",pt:"laicidade",nl:"secularisme"},
  "licence":{en:"bachelor's degree",it:"laurea",es:"grado",de:"Bachelor",pt:"licenciatura",nl:"bachelor"},
  "master":{en:"master's degree",it:"laurea magistrale",es:"máster",de:"Master",pt:"mestrado",nl:"master"},
  "doctorat":{en:"doctorate",it:"dottorato",es:"doctorado",de:"Promotion",pt:"doutoramento",nl:"doctoraat"},
  "thèse":{en:"thesis",it:"tesi",es:"tesis",de:"Dissertation",pt:"tese",nl:"proefschrift"},
  "soutenance":{en:"viva",it:"discussione della tesi",es:"defensa de tesis",de:"Disputation",pt:"defesa de tese",nl:"scriptieverdediging"},
  "amphithéâtre":{en:"lecture hall",it:"aula magna",es:"anfiteatro",de:"Hörsaal",pt:"anfiteatro",nl:"collegezaal"},
  "bourse":{en:"scholarship",it:"borsa di studio",es:"beca",de:"Stipendium",pt:"bolsa de estudo",nl:"studiebeurs"},
  "inscription":{en:"enrolment",it:"iscrizione",es:"matrícula",de:"Einschreibung",pt:"inscrição",nl:"inschrijving"},
  "recherche scientifique":{en:"scientific research",it:"ricerca scientifica",es:"investigación científica",de:"wissenschaftliche Forschung",pt:"investigação científica",nl:"wetenschappelijk onderzoek"},
  "stage de fin d'études":{en:"graduation internship",it:"tirocinio finale",es:"prácticas de fin de carrera",de:"Abschlusspraktikum",pt:"estágio curricular",nl:"afstudeerstage"},
  "hébergement":{en:"accommodation",it:"alloggio",es:"alojamiento",de:"Unterkunft",pt:"alojamento",nl:"accommodatie"},
  "itinéraire":{en:"itinerary",it:"itinerario",es:"itinerario",de:"Reiseroute",pt:"itinerário",nl:"reisroute"},
  "formalités":{en:"formalities",it:"formalità",es:"trámites",de:"Formalitäten",pt:"formalidades",nl:"formaliteiten"},
  "visa":{en:"visa",it:"visto",es:"visado",de:"Visum",pt:"visto",nl:"visum"},
  "assurance voyage":{en:"travel insurance",it:"assicurazione di viaggio",es:"seguro de viaje",de:"Reiseversicherung",pt:"seguro de viagem",nl:"reisverzekering"},
  "escale":{en:"stopover",it:"scalo",es:"escala",de:"Zwischenstopp",pt:"escala",nl:"tussenstop"},
  "hors saison":{en:"off season",it:"bassa stagione",es:"temporada baja",de:"Nebensaison",pt:"época baixa",nl:"laagseizoen"},
  "haute saison":{en:"high season",it:"alta stagione",es:"temporada alta",de:"Hochsaison",pt:"época alta",nl:"hoogseizoen"},
  "dépaysement":{en:"change of scenery",it:"spaesamento",es:"cambio de aires",de:"Tapetenwechsel",pt:"mudança de ares",nl:"verandering van omgeving"},
  "office de tourisme":{en:"tourist office",it:"ufficio del turismo",es:"oficina de turismo",de:"Touristeninformation",pt:"posto de turismo",nl:"VVV-kantoor"},
  "échauffement":{en:"warm-up",it:"riscaldamento muscolare",es:"calentamiento",de:"Aufwärmen",pt:"aquecimento muscular",nl:"warming-up"},
  "étirement":{en:"stretching",it:"stretching",es:"estiramiento",de:"Dehnung",pt:"alongamento",nl:"rekoefening"},
  "endurance":{en:"stamina",it:"resistenza",es:"resistencia",de:"Ausdauer",pt:"resistência",nl:"uithoudingsvermogen"},
  "souffle":{en:"breath",it:"fiato",es:"aliento",de:"Atem",pt:"fôlego",nl:"adem"},
  "transpiration":{en:"sweat",it:"sudore",es:"sudor",de:"Schweiß",pt:"suor",nl:"zweet"},
  "courbature":{en:"aching muscles",it:"indolenzimento",es:"agujetas",de:"Muskelkater",pt:"dores musculares",nl:"spierpijn"},
  "récupération":{en:"recuperation",it:"recupero",es:"recuperación",de:"Erholung",pt:"recuperação",nl:"herstel"},
  "dopage":{en:"doping",it:"doping",es:"dopaje",de:"Doping",pt:"doping",nl:"doping"},
  "performance":{en:"performance",it:"prestazione",es:"rendimiento",de:"Leistung",pt:"desempenho",nl:"prestatie"},
  "esprit d'équipe":{en:"team spirit",it:"spirito di squadra",es:"espíritu de equipo",de:"Teamgeist",pt:"espírito de equipa",nl:"teamgeest"},
  "barrage":{en:"dam",it:"diga",es:"presa",de:"Staudamm",pt:"barragem",nl:"stuwdam"},
  "écluse":{en:"lock",it:"chiusa",es:"esclusa",de:"Schleuse",pt:"eclusa",nl:"sluis"},
  "affluent":{en:"tributary",it:"affluente",es:"afluente",de:"Nebenfluss",pt:"afluente",nl:"zijrivier"},
  "delta":{en:"delta",it:"delta",es:"delta",de:"Delta",pt:"delta",nl:"delta"},
  "estuaire":{en:"estuary",it:"estuario",es:"estuario",de:"Flussmündung",pt:"estuário",nl:"riviermonding"},
  "berge":{en:"riverbank",it:"riva",es:"orilla",de:"Ufer",pt:"margem do rio",nl:"oever"},
  "noyade":{en:"drowning",it:"annegamento",es:"ahogamiento",de:"Ertrinken",pt:"afogamento",nl:"verdrinking"},
  "crue":{en:"spate",it:"piena",es:"crecida",de:"Hochwasser",pt:"cheia",nl:"hoogwater"},
  "nappe phréatique":{en:"groundwater",it:"falda acquifera",es:"acuífero",de:"Grundwasser",pt:"lençol freático",nl:"grondwater"},
  "jaillir":{en:"to gush",it:"sgorgare",es:"brotar",de:"sprudeln",pt:"jorrar",nl:"gutsen"},
  "s'effondrer":{en:"to collapse",it:"crollare",es:"derrumbarse",de:"einstürzen",pt:"desmoronar-se",nl:"instorten"},
  "surgir":{en:"to spring up",it:"spuntare",es:"surgir",de:"auftauchen",pt:"surgir",nl:"opduiken"},
  "se répandre":{en:"to spread",it:"diffondersi",es:"propagarse",de:"sich ausbreiten",pt:"espalhar-se",nl:"zich verspreiden"},
  "déborder":{en:"to overflow",it:"traboccare",es:"desbordarse",de:"überlaufen",pt:"transbordar",nl:"overlopen"},
  "engloutir":{en:"to engulf",it:"inghiottire",es:"engullir",de:"verschlingen",pt:"tragar",nl:"verzwelgen"},
  "dissoudre":{en:"to dissolve",it:"sciogliere",es:"disolver",de:"auflösen",pt:"dissolver",nl:"oplossen"},
  "s'évaporer":{en:"to evaporate",it:"evaporare",es:"evaporarse",de:"verdunsten",pt:"evaporar-se",nl:"verdampen"},
  "congeler":{en:"to freeze",it:"congelare",es:"congelar",de:"einfrieren",pt:"congelar",nl:"invriezen"},
  "fondre":{en:"to melt",it:"fondere",es:"derretirse",de:"schmelzen",pt:"derreter",nl:"smelten"},
  "tricot":{en:"knitting",it:"lavoro a maglia",es:"hacer punto",de:"Stricken",pt:"tricot",nl:"breien"},
  "couture":{en:"sewing",it:"cucito",es:"costura",de:"Nähen",pt:"costura",nl:"naaien"},
  "broderie":{en:"embroidery",it:"ricamo",es:"bordado",de:"Stickerei",pt:"bordado",nl:"borduurwerk"},
  "poterie":{en:"pottery",it:"ceramica",es:"alfarería",de:"Töpferei",pt:"olaria",nl:"pottenbakken"},
  "aquarelle":{en:"watercolour",it:"acquerello",es:"acuarela",de:"Aquarell",pt:"aguarela",nl:"aquarel"},
  "calligraphie":{en:"calligraphy",it:"calligrafia",es:"caligrafía",de:"Kalligrafie",pt:"caligrafia",nl:"kalligrafie"},
  "origami":{en:"origami",it:"origami",es:"papiroflexia",de:"Origami",pt:"origami",nl:"origami"},
  "maquette":{en:"scale model",it:"modellino",es:"maqueta",de:"Miniaturmodell",pt:"maqueta",nl:"schaalmodel"},
  "échecs":{en:"chess",it:"scacchi",es:"ajedrez",de:"Schach",pt:"xadrez",nl:"schaken"},
  "jeu de dames":{en:"draughts",it:"dama",es:"damas",de:"Damespiel",pt:"jogo de damas",nl:"dammen"}
};
CURRICULUM_O.forEach(function(u){ CURRICULUM.push(u); });
LANGS.forEach(function(l){ Object.keys(NEWV11).forEach(function(k){ if(NEWV11[k][l]) LEX[l][k]=NEWV11[k][l]; }); });

/* --- Vague 11 (v2.69, cap B2) : citoyenneté & travail + nuances (fréquence, rythme, caractère, connecteurs) --- */
var CURRICULUM_M = [
  {t:"Citoyens 🏛️", c:"#0ea5e9", L:[
    {t:"La nation", w:["nation","peuple","société","droit","devoir","voter"]},
    {t:"La justice", w:["justice","contrat","signer","remboursement"]},
    {t:"Au travail", w:["entretien","délai","effort","progrès","résultat"]} ]},
  {t:"Nuances 🎚️", c:"#a855f7", L:[
    {t:"La fréquence", w:["quotidien","hebdomadaire","mensuel","annuel"]},
    {t:"Le rythme", w:["immédiat","soudain","progressif","définitif"]},
    {t:"Qualités", w:["efficace","inutile","évident","compliqué","précis","vague"]},
    {t:"Caractères", w:["sincère","avare","impoli","imprudent","lâche","fou"]},
    {t:"Pour argumenter", w:["en effet","autrement dit","dorénavant"]} ]}
];
var NEWV12 = {
"nation":{en:"nation",it:"nazione",es:"nación",de:"Nation",pt:"nação",nl:"natie"},
"peuple":{en:"people",it:"popolo",es:"pueblo",de:"Volk",pt:"povo",nl:"volk"},
"société":{en:"society",it:"società",es:"sociedad",de:"Gesellschaft",pt:"sociedade",nl:"samenleving"},
"droit":{en:"right",it:"diritto",es:"derecho",de:"Recht",pt:"direito",nl:"recht"},
"devoir":{en:"duty",it:"dovere",es:"deber",de:"Pflicht",pt:"dever",nl:"plicht"},
"voter":{en:"vote",it:"votare",es:"votar",de:"wählen",pt:"votar",nl:"stemmen"},
"justice":{en:"justice",it:"giustizia",es:"justicia",de:"Gerechtigkeit",pt:"justiça",nl:"rechtvaardigheid"},
"contrat":{en:"contract",it:"contratto",es:"contrato",de:"Vertrag",pt:"contrato",nl:"contract"},
"signer":{en:"sign",it:"firmare",es:"firmar",de:"unterschreiben",pt:"assinar",nl:"ondertekenen"},
"remboursement":{en:"refund",it:"rimborso",es:"reembolso",de:"Rückerstattung",pt:"reembolso",nl:"terugbetaling"},
"entretien":{en:"interview",it:"colloquio",es:"entrevista",de:"Vorstellungsgespräch",pt:"entrevista",nl:"sollicitatiegesprek"},
"délai":{en:"deadline",it:"scadenza",es:"plazo",de:"Frist",pt:"prazo",nl:"termijn"},
"effort":{en:"effort",it:"sforzo",es:"esfuerzo",de:"Anstrengung",pt:"esforço",nl:"inspanning"},
"progrès":{en:"progress",it:"progresso",es:"progreso",de:"Fortschritt",pt:"progresso",nl:"vooruitgang"},
"résultat":{en:"result",it:"risultato",es:"resultado",de:"Ergebnis",pt:"resultado",nl:"resultaat"},
"quotidien":{en:"daily",it:"quotidiano",es:"diario",de:"täglich",pt:"diário",nl:"dagelijks"},
"hebdomadaire":{en:"weekly",it:"settimanale",es:"semanal",de:"wöchentlich",pt:"semanal",nl:"wekelijks"},
"mensuel":{en:"monthly",it:"mensile",es:"mensual",de:"monatlich",pt:"mensal",nl:"maandelijks"},
"annuel":{en:"yearly",it:"annuale",es:"anual",de:"jährlich",pt:"anual",nl:"jaarlijks"},
"immédiat":{en:"immediate",it:"immediato",es:"inmediato",de:"sofortig",pt:"imediato",nl:"onmiddellijk"},
"soudain":{en:"sudden",it:"improvviso",es:"repentino",de:"plötzlich",pt:"repentino",nl:"plotseling"},
"progressif":{en:"gradual",it:"graduale",es:"gradual",de:"allmählich",pt:"gradual",nl:"geleidelijk"},
"définitif":{en:"final",it:"definitivo",es:"definitivo",de:"endgültig",pt:"definitivo",nl:"definitief"},
"efficace":{en:"effective",it:"efficace",es:"eficaz",de:"wirksam",pt:"eficaz",nl:"doeltreffend"},
"inutile":{en:"useless",it:"inutile",es:"inútil",de:"nutzlos",pt:"inútil",nl:"nutteloos"},
"évident":{en:"obvious",it:"ovvio",es:"evidente",de:"offensichtlich",pt:"óbvio",nl:"duidelijk"},
"compliqué":{en:"complicated",it:"complicato",es:"complicado",de:"kompliziert",pt:"complicado",nl:"ingewikkeld"},
"précis":{en:"precise",it:"preciso",es:"preciso",de:"genau",pt:"preciso",nl:"nauwkeurig"},
"vague":{en:"vague",it:"vago",es:"vago",de:"vage",pt:"vago",nl:"vaag"},
"sincère":{en:"sincere",it:"sincero",es:"sincero",de:"aufrichtig",pt:"sincero",nl:"oprecht"},
"avare":{en:"stingy",it:"avaro",es:"tacaño",de:"geizig",pt:"avarento",nl:"gierig"},
"impoli":{en:"rude",it:"maleducato",es:"maleducado",de:"unhöflich",pt:"mal-educado",nl:"onbeleefd"},
"imprudent":{en:"careless",it:"imprudente",es:"imprudente",de:"unvorsichtig",pt:"imprudente",nl:"onvoorzichtig"},
"lâche":{en:"cowardly",it:"codardo",es:"cobarde",de:"feige",pt:"cobarde",nl:"laf"},
"fou":{en:"crazy",it:"pazzo",es:"loco",de:"verrückt",pt:"louco",nl:"gek"},
"en effet":{en:"indeed",it:"infatti",es:"en efecto",de:"in der Tat",pt:"de facto",nl:"inderdaad"},
"autrement dit":{en:"in other words",it:"in altre parole",es:"en otras palabras",de:"mit anderen Worten",pt:"por outras palavras",nl:"met andere woorden"},
"dorénavant":{en:"from now on",it:"d'ora in poi",es:"de ahora en adelante",de:"von nun an",pt:"doravante",nl:"voortaan"}
};
CURRICULUM_M.forEach(function(u){ CURRICULUM.push(u); });
LANGS.forEach(function(l){ Object.keys(NEWV12).forEach(function(k){ if(NEWV12[k][l]) LEX[l][k]=NEWV12[k][l]; }); });

/* --- Vague 12 (v2.71, cap B2) : verbes de relation (promesse, soutien, autorité, négociation) + sciences --- */
var CURRICULUM_L2 = [
  {t:"Dire et faire 🤝", c:"#f43f5e", L:[
    {t:"Promettre", w:["jurer","pardonner","trahir","se venger","prouver"]},
    {t:"Soutenir", w:["féliciter","encourager","consoler","rassurer"]},
    {t:"Autorité", w:["interdire","autoriser","obéir","désobéir","punir","récompenser"]},
    {t:"Négocier", w:["menacer","supplier","soupçonner","insister","céder","parier"]} ]},
  {t:"Sciences 🔭", c:"#06b6d4", L:[
    {t:"La Terre", w:["océan","atmosphère","oxygène","espèce"]},
    {t:"Découvertes", w:["électricité","robot","éclipse"]} ]}
];
var NEWV13 = {
"jurer":{en:"swear",it:"giurare",es:"jurar",de:"schwören",pt:"jurar",nl:"zweren"},
"pardonner":{en:"forgive",it:"perdonare",es:"perdonar",de:"verzeihen",pt:"perdoar",nl:"vergeven"},
"trahir":{en:"betray",it:"tradire",es:"traicionar",de:"verraten",pt:"trair",nl:"verraden"},
"se venger":{en:"take revenge",it:"vendicarsi",es:"vengarse",de:"sich rächen",pt:"vingar-se",nl:"wraak nemen"},
"prouver":{en:"prove",it:"dimostrare",es:"demostrar",de:"beweisen",pt:"provar",nl:"bewijzen"},
"féliciter":{en:"congratulate",it:"congratularsi",es:"felicitar",de:"gratulieren",pt:"felicitar",nl:"feliciteren"},
"encourager":{en:"encourage",it:"incoraggiare",es:"animar",de:"ermutigen",pt:"encorajar",nl:"aanmoedigen"},
"consoler":{en:"comfort",it:"consolare",es:"consolar",de:"trösten",pt:"consolar",nl:"troosten"},
"rassurer":{en:"reassure",it:"rassicurare",es:"tranquilizar",de:"beruhigen",pt:"tranquilizar",nl:"geruststellen"},
"interdire":{en:"forbid",it:"vietare",es:"prohibir",de:"verbieten",pt:"proibir",nl:"verbieden"},
"autoriser":{en:"allow",it:"autorizzare",es:"autorizar",de:"erlauben",pt:"autorizar",nl:"toestaan"},
"obéir":{en:"obey",it:"obbedire",es:"obedecer",de:"gehorchen",pt:"obedecer",nl:"gehoorzamen"},
"désobéir":{en:"disobey",it:"disobbedire",es:"desobedecer",de:"nicht gehorchen",pt:"desobedecer",nl:"niet gehoorzamen"},
"punir":{en:"punish",it:"punire",es:"castigar",de:"bestrafen",pt:"castigar",nl:"straffen"},
"récompenser":{en:"reward",it:"ricompensare",es:"recompensar",de:"belohnen",pt:"recompensar",nl:"belonen"},
"menacer":{en:"threaten",it:"minacciare",es:"amenazar",de:"drohen",pt:"ameaçar",nl:"dreigen"},
"supplier":{en:"beg",it:"supplicare",es:"suplicar",de:"anflehen",pt:"suplicar",nl:"smeken"},
"soupçonner":{en:"suspect",it:"sospettare",es:"sospechar",de:"verdächtigen",pt:"suspeitar",nl:"verdenken"},
"insister":{en:"insist",it:"insistere",es:"insistir",de:"beharren",pt:"insistir",nl:"aandringen"},
"céder":{en:"give in",it:"cedere",es:"ceder",de:"nachgeben",pt:"ceder",nl:"toegeven"},
"parier":{en:"bet",it:"scommettere",es:"apostar",de:"wetten",pt:"apostar",nl:"wedden"},
"océan":{en:"ocean",it:"oceano",es:"océano",de:"Ozean",pt:"oceano",nl:"oceaan"},
"atmosphère":{en:"atmosphere",it:"atmosfera",es:"atmósfera",de:"Atmosphäre",pt:"atmosfera",nl:"atmosfeer"},
"oxygène":{en:"oxygen",it:"ossigeno",es:"oxígeno",de:"Sauerstoff",pt:"oxigénio",nl:"zuurstof"},
"espèce":{en:"species",it:"specie",es:"especie",de:"Art",pt:"espécie",nl:"soort"},
"électricité":{en:"electricity",it:"elettricità",es:"electricidad",de:"Strom",pt:"eletricidade",nl:"elektriciteit"},
"robot":{en:"robot",it:"robot",es:"robot",de:"Roboter",pt:"robô",nl:"robot"},
"éclipse":{en:"eclipse",it:"eclissi",es:"eclipse",de:"Finsternis",pt:"eclipse",nl:"verduistering"}
};
CURRICULUM_L2.forEach(function(u){ CURRICULUM.push(u); });
LANGS.forEach(function(l){ Object.keys(NEWV13).forEach(function(k){ if(NEWV13[k][l]) LEX[l][k]=NEWV13[k][l]; }); });

/* --- Vague 13 (v2.73, cap B2) : bricolage (matériaux, gestes) + cuisine & quantités --- */
var CURRICULUM_K = [
  {t:"Bricolage 🔨", c:"#b45309", L:[
    {t:"Matériaux", w:["fer","acier","sable","colle","peinture","aiguille"]},
    {t:"À l'œuvre", w:["construire","casser","visser"]} ]},
  {t:"Cuisine et quantités 🍳", c:"#65a30d", L:[
    {t:"En cuisine", w:["vinaigre","moutarde","sauce","ingrédient","congélateur","mixeur"]},
    {t:"Les quantités", w:["tiers","plusieurs","quelques","aucun","chaque","au moins","au maximum"]} ]}
];
var NEWV14 = {
"fer":{en:"iron",it:"ferro",es:"hierro",de:"Eisen",pt:"ferro",nl:"ijzer"},
"acier":{en:"steel",it:"acciaio",es:"acero",de:"Stahl",pt:"aço",nl:"staal"},
"sable":{en:"sand",it:"sabbia",es:"arena",de:"Sand",pt:"areia",nl:"zand"},
"colle":{en:"glue",it:"colla",es:"pegamento",de:"Kleber",pt:"cola",nl:"lijm"},
"peinture":{en:"paint",it:"vernice",es:"pintura",de:"Farbe",pt:"tinta",nl:"verf"},
"aiguille":{en:"needle",it:"ago",es:"aguja",de:"Nadel",pt:"agulha",nl:"naald"},
"construire":{en:"build",it:"costruire",es:"construir",de:"bauen",pt:"construir",nl:"bouwen"},
"casser":{en:"break",it:"rompere",es:"romper",de:"zerbrechen",pt:"partir",nl:"breken"},
"visser":{en:"screw",it:"avvitare",es:"atornillar",de:"schrauben",pt:"aparafusar",nl:"schroeven"},
"vinaigre":{en:"vinegar",it:"aceto",es:"vinagre",de:"Essig",pt:"vinagre",nl:"azijn"},
"moutarde":{en:"mustard",it:"senape",es:"mostaza",de:"Senf",pt:"mostarda",nl:"mosterd"},
"sauce":{en:"sauce",it:"salsa",es:"salsa",de:"Soße",pt:"molho",nl:"saus"},
"ingrédient":{en:"ingredient",it:"ingrediente",es:"ingrediente",de:"Zutat",pt:"ingrediente",nl:"ingrediënt"},
"congélateur":{en:"freezer",it:"congelatore",es:"congelador",de:"Gefrierschrank",pt:"congelador",nl:"vriezer"},
"mixeur":{en:"blender",it:"frullatore",es:"batidora",de:"Mixer",pt:"liquidificadora",nl:"blender"},
"tiers":{en:"third",it:"terzo",es:"tercio",de:"Drittel",pt:"terço",nl:"een derde"},
"plusieurs":{en:"several",it:"parecchi",es:"varios",de:"mehrere",pt:"vários",nl:"verschillende"},
"quelques":{en:"a few",it:"alcuni",es:"algunos",de:"einige",pt:"alguns",nl:"enkele"},
"aucun":{en:"none",it:"nessuno",es:"ninguno",de:"keiner",pt:"nenhum",nl:"geen"},
"chaque":{en:"each",it:"ogni",es:"cada",de:"jeder",pt:"cada",nl:"elk"},
"au moins":{en:"at least",it:"almeno",es:"al menos",de:"mindestens",pt:"pelo menos",nl:"minstens"},
"au maximum":{en:"at most",it:"al massimo",es:"como máximo",de:"höchstens",pt:"no máximo",nl:"hoogstens"}
};
CURRICULUM_K.forEach(function(u){ CURRICULUM.push(u); });
LANGS.forEach(function(l){ Object.keys(NEWV14).forEach(function(k){ if(NEWV14[k][l]) LEX[l][k]=NEWV14[k][l]; }); });

/* ============ 🌏 NOUVELLES LANGUES — Europe de l'Est + Asie (cours DÉMARRAGE) ============
   Kevin 2026-08-10 : « ajoute langues pays de l'est, asiatique, etc ». Chaque nouvelle langue
   couvre ENTIÈREMENT les 8 premières unités (A1 démarrage) et grandit vague par vague comme
   les 6 langues d'origine. VÉRITÉ : seules les unités 100 % traduites entrent dans le cours —
   aucun repli français silencieux. noType = écriture au clavier remplacée par des choix
   (alphabets non latins) ; les phrases zh/ja sont segmentées par espaces (blocs de mots). */
var LANGS2 = ["pl","ru","uk","cs","zh","ja","ko","ar"];
var LMETA2 = {
  pl:{nom:"Polonais",  drapeau:"🇵🇱", tts:"pl-PL"},
  ru:{nom:"Russe",     drapeau:"🇷🇺", tts:"ru-RU", noType:true},
  uk:{nom:"Ukrainien", drapeau:"🇺🇦", tts:"uk-UA", noType:true},
  cs:{nom:"Tchèque",   drapeau:"🇨🇿", tts:"cs-CZ"},
  zh:{nom:"Chinois (mandarin)", drapeau:"🇨🇳", tts:"zh-CN", noType:true},
  ja:{nom:"Japonais",  drapeau:"🇯🇵", tts:"ja-JP", noType:true},
  ko:{nom:"Coréen",    drapeau:"🇰🇷", tts:"ko-KR", noType:true},
  ar:{nom:"Arabe",     drapeau:"🇸🇦", tts:"ar-SA", noType:true, rtl:true}
};
Object.keys(LMETA2).forEach(function(k){ LMETA[k]=LMETA2[k]; });
var LEX2 = {
pl:{
"bonjour":"dzień dobry","salut":"cześć","au revoir":"do widzenia","merci":"dziękuję","oui":"tak","non":"nie","s'il te plaît":"proszę","pardon":"przepraszam",
"homme":"mężczyzna","femme":"kobieta","garçon":"chłopiec","fille":"dziewczyna","ami":"przyjaciel","enfant":"dziecko","nom":"imię","moi":"ja",
"eau":"woda","pain":"chleb","maison":"dom","livre":"książka","chien":"pies","chat":"kot",
"je suis un homme":"jestem mężczyzną","elle est une femme":"ona jest kobietą","le chat boit de l'eau":"kot pije wodę",
"café":"kawa","lait":"mleko","vin":"wino","thé":"herbata","jus":"sok","bière":"piwo",
"pomme":"jabłko","fromage":"ser","poisson":"ryba","viande":"mięso","riz":"ryż","œuf":"jajko","gâteau":"ciasto","soupe":"zupa",
"je bois du café":"piję kawę","je mange une pomme":"jem jabłko","nous mangeons du riz":"jemy ryż",
"zéro":"zero","un":"jeden","deux":"dwa","trois":"trzy","quatre":"cztery","cinq":"pięć","six":"sześć","sept":"siedem","huit":"osiem","neuf":"dziewięć","dix":"dziesięć","cent":"sto",
"j'ai deux chats":"mam dwa koty","trois pommes":"trzy jabłka",
"mère":"matka","père":"ojciec","frère":"brat","sœur":"siostra","grand-mère":"babcia","grand-père":"dziadek","bébé":"niemowlę","famille":"rodzina",
"rouge":"czerwony","bleu":"niebieski","vert":"zielony","jaune":"żółty","noir":"czarny","blanc":"biały","orange":"pomarańczowy","rose":"różowy",
"une fleur rouge":"czerwony kwiat","le chat est noir":"kot jest czarny",
"cheval":"koń","oiseau":"ptak","vache":"krowa","poule":"kura","cochon":"świnia","lapin":"królik","mouton":"owca","souris":"mysz",
"jour":"dzień","nuit":"noc","matin":"rano","soir":"wieczór","semaine":"tydzień","mois":"miesiąc","année":"rok","heure":"godzina","minute":"minuta","aujourd'hui":"dzisiaj","demain":"jutro","hier":"wczoraj",
"gare":"dworzec","hôtel":"hotel","rue":"ulica","gauche":"lewo","droite":"prawo","ici":"tutaj","grand":"duży","petit":"mały","nouveau":"nowy","beau":"piękny","bon":"dobry","vite":"szybko",
"où est la gare":"gdzie jest dworzec","la maison est grande":"dom jest duży","c'est un bon café":"to jest dobra kawa"
},
ru:{
"bonjour":"здравствуйте","salut":"привет","au revoir":"до свидания","merci":"спасибо","oui":"да","non":"нет","s'il te plaît":"пожалуйста","pardon":"извините",
"homme":"мужчина","femme":"женщина","garçon":"мальчик","fille":"девочка","ami":"друг","enfant":"ребёнок","nom":"имя","moi":"я",
"eau":"вода","pain":"хлеб","maison":"дом","livre":"книга","chien":"собака","chat":"кот",
"je suis un homme":"я мужчина","elle est une femme":"она женщина","le chat boit de l'eau":"кот пьёт воду",
"café":"кофе","lait":"молоко","vin":"вино","thé":"чай","jus":"сок","bière":"пиво",
"pomme":"яблоко","fromage":"сыр","poisson":"рыба","viande":"мясо","riz":"рис","œuf":"яйцо","gâteau":"торт","soupe":"суп",
"je bois du café":"я пью кофе","je mange une pomme":"я ем яблоко","nous mangeons du riz":"мы едим рис",
"zéro":"ноль","un":"один","deux":"два","trois":"три","quatre":"четыре","cinq":"пять","six":"шесть","sept":"семь","huit":"восемь","neuf":"девять","dix":"десять","cent":"сто",
"j'ai deux chats":"у меня два кота","trois pommes":"три яблока",
"mère":"мама","père":"папа","frère":"брат","sœur":"сестра","grand-mère":"бабушка","grand-père":"дедушка","bébé":"малыш","famille":"семья",
"rouge":"красный","bleu":"синий","vert":"зелёный","jaune":"жёлтый","noir":"чёрный","blanc":"белый","orange":"оранжевый","rose":"розовый",
"une fleur rouge":"красный цветок","le chat est noir":"кот чёрный",
"cheval":"лошадь","oiseau":"птица","vache":"корова","poule":"курица","cochon":"свинья","lapin":"кролик","mouton":"овца","souris":"мышь",
"jour":"день","nuit":"ночь","matin":"утро","soir":"вечер","semaine":"неделя","mois":"месяц","année":"год","heure":"час","minute":"минута","aujourd'hui":"сегодня","demain":"завтра","hier":"вчера",
"gare":"вокзал","hôtel":"отель","rue":"улица","gauche":"налево","droite":"направо","ici":"здесь","grand":"большой","petit":"маленький","nouveau":"новый","beau":"красивый","bon":"хороший","vite":"быстро",
"où est la gare":"где вокзал","la maison est grande":"дом большой","c'est un bon café":"это хороший кофе"
},
uk:{
"bonjour":"добрий день","salut":"привіт","au revoir":"до побачення","merci":"дякую","oui":"так","non":"ні","s'il te plaît":"будь ласка","pardon":"вибачте",
"homme":"чоловік","femme":"жінка","garçon":"хлопчик","fille":"дівчинка","ami":"друг","enfant":"дитина","nom":"ім'я","moi":"я",
"eau":"вода","pain":"хліб","maison":"дім","livre":"книга","chien":"собака","chat":"кіт",
"je suis un homme":"я чоловік","elle est une femme":"вона жінка","le chat boit de l'eau":"кіт п'є воду",
"café":"кава","lait":"молоко","vin":"вино","thé":"чай","jus":"сік","bière":"пиво",
"pomme":"яблуко","fromage":"сир","poisson":"риба","viande":"м'ясо","riz":"рис","œuf":"яйце","gâteau":"торт","soupe":"суп",
"je bois du café":"я п'ю каву","je mange une pomme":"я їм яблуко","nous mangeons du riz":"ми їмо рис",
"zéro":"нуль","un":"один","deux":"два","trois":"три","quatre":"чотири","cinq":"п'ять","six":"шість","sept":"сім","huit":"вісім","neuf":"дев'ять","dix":"десять","cent":"сто",
"j'ai deux chats":"у мене два коти","trois pommes":"три яблука",
"mère":"мама","père":"тато","frère":"брат","sœur":"сестра","grand-mère":"бабуся","grand-père":"дідусь","bébé":"малюк","famille":"сім'я",
"rouge":"червоний","bleu":"синій","vert":"зелений","jaune":"жовтий","noir":"чорний","blanc":"білий","orange":"помаранчевий","rose":"рожевий",
"une fleur rouge":"червона квітка","le chat est noir":"кіт чорний",
"cheval":"кінь","oiseau":"птах","vache":"корова","poule":"курка","cochon":"свиня","lapin":"кролик","mouton":"вівця","souris":"миша",
"jour":"день","nuit":"ніч","matin":"ранок","soir":"вечір","semaine":"тиждень","mois":"місяць","année":"рік","heure":"година","minute":"хвилина","aujourd'hui":"сьогодні","demain":"завтра","hier":"вчора",
"gare":"вокзал","hôtel":"готель","rue":"вулиця","gauche":"ліворуч","droite":"праворуч","ici":"тут","grand":"великий","petit":"маленький","nouveau":"новий","beau":"гарний","bon":"добрий","vite":"швидко",
"où est la gare":"де вокзал","la maison est grande":"дім великий","c'est un bon café":"це добра кава"
},
cs:{
"bonjour":"dobrý den","salut":"ahoj","au revoir":"na shledanou","merci":"děkuji","oui":"ano","non":"ne","s'il te plaît":"prosím","pardon":"promiňte",
"homme":"muž","femme":"žena","garçon":"chlapec","fille":"dívka","ami":"přítel","enfant":"dítě","nom":"jméno","moi":"já",
"eau":"voda","pain":"chléb","maison":"dům","livre":"kniha","chien":"pes","chat":"kočka",
"je suis un homme":"jsem muž","elle est une femme":"ona je žena","le chat boit de l'eau":"kočka pije vodu",
"café":"káva","lait":"mléko","vin":"víno","thé":"čaj","jus":"džus","bière":"pivo",
"pomme":"jablko","fromage":"sýr","poisson":"ryba","viande":"maso","riz":"rýže","œuf":"vejce","gâteau":"dort","soupe":"polévka",
"je bois du café":"piju kávu","je mange une pomme":"jím jablko","nous mangeons du riz":"jíme rýži",
"zéro":"nula","un":"jeden","deux":"dva","trois":"tři","quatre":"čtyři","cinq":"pět","six":"šest","sept":"sedm","huit":"osm","neuf":"devět","dix":"deset","cent":"sto",
"j'ai deux chats":"mám dvě kočky","trois pommes":"tři jablka",
"mère":"matka","père":"otec","frère":"bratr","sœur":"sestra","grand-mère":"babička","grand-père":"dědeček","bébé":"miminko","famille":"rodina",
"rouge":"červený","bleu":"modrý","vert":"zelený","jaune":"žlutý","noir":"černý","blanc":"bílý","orange":"oranžový","rose":"růžový",
"une fleur rouge":"červená květina","le chat est noir":"kočka je černá",
"cheval":"kůň","oiseau":"pták","vache":"kráva","poule":"slepice","cochon":"prase","lapin":"králík","mouton":"ovce","souris":"myš",
"jour":"den","nuit":"noc","matin":"ráno","soir":"večer","semaine":"týden","mois":"měsíc","année":"rok","heure":"hodina","minute":"minuta","aujourd'hui":"dnes","demain":"zítra","hier":"včera",
"gare":"nádraží","hôtel":"hotel","rue":"ulice","gauche":"vlevo","droite":"vpravo","ici":"tady","grand":"velký","petit":"malý","nouveau":"nový","beau":"krásný","bon":"dobrý","vite":"rychle",
"où est la gare":"kde je nádraží","la maison est grande":"dům je velký","c'est un bon café":"to je dobrá káva"
},
zh:{
"bonjour":"你好","salut":"嗨","au revoir":"再见","merci":"谢谢","oui":"是","non":"不","s'il te plaît":"请","pardon":"对不起",
"homme":"男人","femme":"女人","garçon":"男孩","fille":"女孩","ami":"朋友","enfant":"孩子","nom":"名字","moi":"我",
"eau":"水","pain":"面包","maison":"房子","livre":"书","chien":"狗","chat":"猫",
"je suis un homme":"我 是 男人","elle est une femme":"她 是 女人","le chat boit de l'eau":"猫 喝 水",
"café":"咖啡","lait":"牛奶","vin":"葡萄酒","thé":"茶","jus":"果汁","bière":"啤酒",
"pomme":"苹果","fromage":"奶酪","poisson":"鱼","viande":"肉","riz":"米饭","œuf":"鸡蛋","gâteau":"蛋糕","soupe":"汤",
"je bois du café":"我 喝 咖啡","je mange une pomme":"我 吃 苹果","nous mangeons du riz":"我们 吃 米饭",
"zéro":"零","un":"一","deux":"二","trois":"三","quatre":"四","cinq":"五","six":"六","sept":"七","huit":"八","neuf":"九","dix":"十","cent":"百",
"j'ai deux chats":"我 有 两 只 猫","trois pommes":"三 个 苹果",
"mère":"妈妈","père":"爸爸","frère":"哥哥","sœur":"姐姐","grand-mère":"奶奶","grand-père":"爷爷","bébé":"宝宝","famille":"家庭",
"rouge":"红色","bleu":"蓝色","vert":"绿色","jaune":"黄色","noir":"黑色","blanc":"白色","orange":"橙色","rose":"粉色",
"une fleur rouge":"红色 的 花","le chat est noir":"猫 是 黑色 的",
"cheval":"马","oiseau":"鸟","vache":"奶牛","poule":"母鸡","cochon":"猪","lapin":"兔子","mouton":"绵羊","souris":"老鼠",
"jour":"白天","nuit":"夜晚","matin":"早上","soir":"晚上","semaine":"星期","mois":"月","année":"年","heure":"小时","minute":"分钟","aujourd'hui":"今天","demain":"明天","hier":"昨天",
"gare":"火车站","hôtel":"酒店","rue":"街道","gauche":"左边","droite":"右边","ici":"这里","grand":"大","petit":"小","nouveau":"新","beau":"漂亮","bon":"好","vite":"快",
"où est la gare":"火车站 在 哪里","la maison est grande":"房子 很 大","c'est un bon café":"这 是 很 好 的 咖啡"
},
ja:{
"bonjour":"こんにちは","salut":"やあ","au revoir":"さようなら","merci":"ありがとう","oui":"はい","non":"いいえ","s'il te plaît":"おねがいします","pardon":"すみません",
"homme":"男の人","femme":"女の人","garçon":"男の子","fille":"女の子","ami":"友だち","enfant":"子ども","nom":"名前","moi":"私",
"eau":"水","pain":"パン","maison":"家","livre":"本","chien":"犬","chat":"猫",
"je suis un homme":"私 は 男の人 です","elle est une femme":"彼女 は 女の人 です","le chat boit de l'eau":"猫 は 水 を 飲みます",
"café":"コーヒー","lait":"牛乳","vin":"ワイン","thé":"お茶","jus":"ジュース","bière":"ビール",
"pomme":"りんご","fromage":"チーズ","poisson":"魚","viande":"肉","riz":"ご飯","œuf":"卵","gâteau":"ケーキ","soupe":"スープ",
"je bois du café":"私 は コーヒー を 飲みます","je mange une pomme":"私 は りんご を 食べます","nous mangeons du riz":"私たち は ご飯 を 食べます",
"zéro":"ゼロ","un":"一","deux":"二","trois":"三","quatre":"四","cinq":"五","six":"六","sept":"七","huit":"八","neuf":"九","dix":"十","cent":"百",
"j'ai deux chats":"猫 が 二匹 います","trois pommes":"りんご 三個",
"mère":"お母さん","père":"お父さん","frère":"兄","sœur":"姉","grand-mère":"おばあさん","grand-père":"おじいさん","bébé":"赤ちゃん","famille":"家族",
"rouge":"赤","bleu":"青","vert":"緑","jaune":"黄色","noir":"黒","blanc":"白","orange":"オレンジ色","rose":"ピンク",
"une fleur rouge":"赤い 花","le chat est noir":"猫 は 黒い です",
"cheval":"馬","oiseau":"鳥","vache":"牛","poule":"にわとり","cochon":"豚","lapin":"うさぎ","mouton":"羊","souris":"ねずみ",
"jour":"昼","nuit":"夜","matin":"朝","soir":"晩","semaine":"週","mois":"月","année":"年","heure":"時間","minute":"分","aujourd'hui":"今日","demain":"明日","hier":"昨日",
"gare":"駅","hôtel":"ホテル","rue":"道","gauche":"左","droite":"右","ici":"ここ","grand":"大きい","petit":"小さい","nouveau":"新しい","beau":"きれい","bon":"いい","vite":"速く",
"où est la gare":"駅 は どこ です か","la maison est grande":"家 は 大きい です","c'est un bon café":"これ は いい コーヒー です"
},
ko:{
"bonjour":"안녕하세요","salut":"안녕","au revoir":"안녕히 가세요","merci":"감사합니다","oui":"네","non":"아니요","s'il te plaît":"주세요","pardon":"미안해요",
"homme":"남자","femme":"여자","garçon":"남자아이","fille":"여자아이","ami":"친구","enfant":"아이","nom":"이름","moi":"나",
"eau":"물","pain":"빵","maison":"집","livre":"책","chien":"개","chat":"고양이",
"je suis un homme":"저는 남자입니다","elle est une femme":"그녀는 여자입니다","le chat boit de l'eau":"고양이가 물을 마셔요",
"café":"커피","lait":"우유","vin":"와인","thé":"차","jus":"주스","bière":"맥주",
"pomme":"사과","fromage":"치즈","poisson":"생선","viande":"고기","riz":"밥","œuf":"계란","gâteau":"케이크","soupe":"수프",
"je bois du café":"저는 커피를 마셔요","je mange une pomme":"저는 사과를 먹어요","nous mangeons du riz":"우리는 밥을 먹어요",
"zéro":"영","un":"하나","deux":"둘","trois":"셋","quatre":"넷","cinq":"다섯","six":"여섯","sept":"일곱","huit":"여덟","neuf":"아홉","dix":"열","cent":"백",
"j'ai deux chats":"고양이가 두 마리 있어요","trois pommes":"사과 세 개",
"mère":"엄마","père":"아빠","frère":"오빠","sœur":"언니","grand-mère":"할머니","grand-père":"할아버지","bébé":"아기","famille":"가족",
"rouge":"빨간색","bleu":"파란색","vert":"초록색","jaune":"노란색","noir":"검은색","blanc":"흰색","orange":"주황색","rose":"분홍색",
"une fleur rouge":"빨간 꽃","le chat est noir":"고양이는 검은색이에요",
"cheval":"말","oiseau":"새","vache":"소","poule":"닭","cochon":"돼지","lapin":"토끼","mouton":"양","souris":"쥐",
"jour":"낮","nuit":"밤","matin":"아침","soir":"저녁","semaine":"주","mois":"달","année":"년","heure":"시간","minute":"분","aujourd'hui":"오늘","demain":"내일","hier":"어제",
"gare":"기차역","hôtel":"호텔","rue":"길","gauche":"왼쪽","droite":"오른쪽","ici":"여기","grand":"크다","petit":"작다","nouveau":"새롭다","beau":"아름답다","bon":"좋다","vite":"빨리",
"où est la gare":"기차역이 어디예요","la maison est grande":"집이 커요","c'est un bon café":"이것은 좋은 커피예요"
},
ar:{
"bonjour":"مرحبا","salut":"أهلا","au revoir":"مع السلامة","merci":"شكرا","oui":"نعم","non":"لا","s'il te plaît":"من فضلك","pardon":"عفوا",
"homme":"رجل","femme":"امرأة","garçon":"ولد","fille":"بنت","ami":"صديق","enfant":"طفل","nom":"اسم","moi":"أنا",
"eau":"ماء","pain":"خبز","maison":"بيت","livre":"كتاب","chien":"كلب","chat":"قط",
"je suis un homme":"أنا رجل","elle est une femme":"هي امرأة","le chat boit de l'eau":"القط يشرب الماء",
"café":"قهوة","lait":"حليب","vin":"نبيذ","thé":"شاي","jus":"عصير","bière":"بيرة",
"pomme":"تفاحة","fromage":"جبن","poisson":"سمك","viande":"لحم","riz":"أرز","œuf":"بيضة","gâteau":"كعكة","soupe":"حساء",
"je bois du café":"أنا أشرب القهوة","je mange une pomme":"أنا آكل تفاحة","nous mangeons du riz":"نحن نأكل الأرز",
"zéro":"صفر","un":"واحد","deux":"اثنان","trois":"ثلاثة","quatre":"أربعة","cinq":"خمسة","six":"ستة","sept":"سبعة","huit":"ثمانية","neuf":"تسعة","dix":"عشرة","cent":"مئة",
"j'ai deux chats":"عندي قطان","trois pommes":"ثلاث تفاحات",
"mère":"أم","père":"أب","frère":"أخ","sœur":"أخت","grand-mère":"جدة","grand-père":"جد","bébé":"رضيع","famille":"عائلة",
"rouge":"أحمر","bleu":"أزرق","vert":"أخضر","jaune":"أصفر","noir":"أسود","blanc":"أبيض","orange":"برتقالي","rose":"وردي",
"une fleur rouge":"زهرة حمراء","le chat est noir":"القط أسود",
"cheval":"حصان","oiseau":"طائر","vache":"بقرة","poule":"دجاجة","cochon":"خنزير","lapin":"أرنب","mouton":"خروف","souris":"فأر",
"jour":"نهار","nuit":"ليل","matin":"صباح","soir":"مساء","semaine":"أسبوع","mois":"شهر","année":"سنة","heure":"ساعة","minute":"دقيقة","aujourd'hui":"اليوم","demain":"غدا","hier":"أمس",
"gare":"محطة القطار","hôtel":"فندق","rue":"شارع","gauche":"يسار","droite":"يمين","ici":"هنا","grand":"كبير","petit":"صغير","nouveau":"جديد","beau":"جميل","bon":"جيد","vite":"بسرعة",
"où est la gare":"أين محطة القطار","la maison est grande":"البيت كبير","c'est un bon café":"هذه قهوة جيدة"
}
};
/* Vague 2 des nouvelles langues (v2.69) : unités 9-16 — maison, vêtements, nature, phrases,
   verbes essentiels, corps, fruits & légumes, en ville. Les 8 cours passent de 8 à 16 unités.
   Notes vérité (homographes RÉELS assumés, pas des erreurs) : ja 月 = lune ET mois ;
   ko 달 = lune/mois, 배 = ventre/poire, 다리 = jambe/pont — c'est la langue. Verbes ar donnés
   à la 3ᵉ pers. du présent (convention des dictionnaires arabes) ; ja en forme polie ます. */
var LEX2B = {
pl:{
"table":"stół","chaise":"krzesło","lit":"łóżko","porte":"drzwi","fenêtre":"okno","clé":"klucz","téléphone":"telefon","lampe":"lampa","nous avons une maison":"mamy dom",
"chemise":"koszula","pantalon":"spodnie","chaussures":"buty","robe":"sukienka","chapeau":"kapelusz","manteau":"płaszcz",
"soleil":"słońce","lune":"księżyc","mer":"morze","montagne":"góra","arbre":"drzewo","fleur":"kwiat","ciel":"niebo","plage":"plaża","le soleil est grand":"słońce jest duże",
"je parle":"mówię","tu vas":"idziesz","il a un chien":"on ma psa","j'aime le café":"lubię kawę",
"être":"być","avoir":"mieć","aller":"iść","faire":"robić","venir":"przychodzić","voir":"widzieć","vouloir":"chcieć","pouvoir":"móc","manger":"jeść","boire":"pić","parler":"mówić","aimer":"kochać","savoir":"wiedzieć","dire":"powiedzieć","donner":"dawać","dormir":"spać",
"tête":"głowa","cheveux":"włosy","œil":"oko","nez":"nos","bouche":"usta","oreille":"ucho","dent":"ząb","main":"ręka","bras":"ramię","jambe":"noga","pied":"stopa","doigt":"palec","cœur":"serce","dos":"plecy","ventre":"brzuch",
"fruit":"owoc","banane":"banan","fraise":"truskawka","citron":"cytryna","raisin":"winogrona","poire":"gruszka","légume":"warzywo","tomate":"pomidor","carotte":"marchewka","oignon":"cebula","salade":"sałata","pomme de terre":"ziemniak",
"ville":"miasto","magasin":"sklep","marché":"targ","banque":"bank","école":"szkoła","hôpital":"szpital","pharmacie":"apteka","restaurant":"restauracja","église":"kościół","parc":"park","pont":"most","aéroport":"lotnisko","musée":"muzeum"
},
ru:{
"table":"стол","chaise":"стул","lit":"кровать","porte":"дверь","fenêtre":"окно","clé":"ключ","téléphone":"телефон","lampe":"лампа","nous avons une maison":"у нас есть дом",
"chemise":"рубашка","pantalon":"брюки","chaussures":"обувь","robe":"платье","chapeau":"шляпа","manteau":"пальто",
"soleil":"солнце","lune":"луна","mer":"море","montagne":"гора","arbre":"дерево","fleur":"цветок","ciel":"небо","plage":"пляж","le soleil est grand":"солнце большое",
"je parle":"я говорю","tu vas":"ты идёшь","il a un chien":"у него есть собака","j'aime le café":"я люблю кофе",
"être":"быть","avoir":"иметь","aller":"идти","faire":"делать","venir":"приходить","voir":"видеть","vouloir":"хотеть","pouvoir":"мочь","manger":"есть","boire":"пить","parler":"говорить","aimer":"любить","savoir":"знать","dire":"сказать","donner":"давать","dormir":"спать",
"tête":"голова","cheveux":"волосы","œil":"глаз","nez":"нос","bouche":"рот","oreille":"ухо","dent":"зуб","main":"кисть руки","bras":"рука","jambe":"нога","pied":"ступня","doigt":"палец","cœur":"сердце","dos":"спина","ventre":"живот",
"fruit":"фрукт","banane":"банан","fraise":"клубника","citron":"лимон","raisin":"виноград","poire":"груша","légume":"овощ","tomate":"помидор","carotte":"морковь","oignon":"лук","salade":"салат","pomme de terre":"картофель",
"ville":"город","magasin":"магазин","marché":"рынок","banque":"банк","école":"школа","hôpital":"больница","pharmacie":"аптека","restaurant":"ресторан","église":"церковь","parc":"парк","pont":"мост","aéroport":"аэропорт","musée":"музей"
},
uk:{
"table":"стіл","chaise":"стілець","lit":"ліжко","porte":"двері","fenêtre":"вікно","clé":"ключ","téléphone":"телефон","lampe":"лампа","nous avons une maison":"у нас є дім",
"chemise":"сорочка","pantalon":"штани","chaussures":"взуття","robe":"сукня","chapeau":"капелюх","manteau":"пальто",
"soleil":"сонце","lune":"місяць","mer":"море","montagne":"гора","arbre":"дерево","fleur":"квітка","ciel":"небо","plage":"пляж","le soleil est grand":"сонце велике",
"je parle":"я говорю","tu vas":"ти йдеш","il a un chien":"у нього є собака","j'aime le café":"я люблю каву",
"être":"бути","avoir":"мати","aller":"йти","faire":"робити","venir":"приходити","voir":"бачити","vouloir":"хотіти","pouvoir":"могти","manger":"їсти","boire":"пити","parler":"говорити","aimer":"любити","savoir":"знати","dire":"сказати","donner":"давати","dormir":"спати",
"tête":"голова","cheveux":"волосся","œil":"око","nez":"ніс","bouche":"рот","oreille":"вухо","dent":"зуб","main":"кисть руки","bras":"рука","jambe":"нога","pied":"ступня","doigt":"палець","cœur":"серце","dos":"спина","ventre":"живіт",
"fruit":"фрукт","banane":"банан","fraise":"полуниця","citron":"лимон","raisin":"виноград","poire":"груша","légume":"овоч","tomate":"помідор","carotte":"морква","oignon":"цибуля","salade":"салат","pomme de terre":"картопля",
"ville":"місто","magasin":"магазин","marché":"ринок","banque":"банк","école":"школа","hôpital":"лікарня","pharmacie":"аптека","restaurant":"ресторан","église":"церква","parc":"парк","pont":"міст","aéroport":"аеропорт","musée":"музей"
},
cs:{
"table":"stůl","chaise":"židle","lit":"postel","porte":"dveře","fenêtre":"okno","clé":"klíč","téléphone":"telefon","lampe":"lampa","nous avons une maison":"máme dům",
"chemise":"košile","pantalon":"kalhoty","chaussures":"boty","robe":"šaty","chapeau":"klobouk","manteau":"kabát",
"soleil":"slunce","lune":"měsíc","mer":"moře","montagne":"hora","arbre":"strom","fleur":"květina","ciel":"nebe","plage":"pláž","le soleil est grand":"slunce je velké",
"je parle":"mluvím","tu vas":"jdeš","il a un chien":"on má psa","j'aime le café":"mám ráda kávu",
"être":"být","avoir":"mít","aller":"jít","faire":"dělat","venir":"přijít","voir":"vidět","vouloir":"chtít","pouvoir":"moct","manger":"jíst","boire":"pít","parler":"mluvit","aimer":"milovat","savoir":"vědět","dire":"říct","donner":"dát","dormir":"spát",
"tête":"hlava","cheveux":"vlasy","œil":"oko","nez":"nos","bouche":"ústa","oreille":"ucho","dent":"zub","main":"ruka","bras":"paže","jambe":"noha","pied":"chodidlo","doigt":"prst","cœur":"srdce","dos":"záda","ventre":"břicho",
"fruit":"ovoce","banane":"banán","fraise":"jahoda","citron":"citron","raisin":"hrozny","poire":"hruška","légume":"zelenina","tomate":"rajče","carotte":"mrkev","oignon":"cibule","salade":"salát","pomme de terre":"brambora",
"ville":"město","magasin":"obchod","marché":"trh","banque":"banka","école":"škola","hôpital":"nemocnice","pharmacie":"lékárna","restaurant":"restaurace","église":"kostel","parc":"park","pont":"most","aéroport":"letiště","musée":"muzeum"
},
zh:{
"table":"桌子","chaise":"椅子","lit":"床","porte":"门","fenêtre":"窗户","clé":"钥匙","téléphone":"电话","lampe":"灯","nous avons une maison":"我们 有 房子",
"chemise":"衬衫","pantalon":"裤子","chaussures":"鞋子","robe":"连衣裙","chapeau":"帽子","manteau":"大衣",
"soleil":"太阳","lune":"月亮","mer":"大海","montagne":"山","arbre":"树","fleur":"花","ciel":"天空","plage":"海滩","le soleil est grand":"太阳 很 大",
"je parle":"我 说话","tu vas":"你 去","il a un chien":"他 有 一 只 狗","j'aime le café":"我 喜欢 咖啡",
"être":"是","avoir":"有","aller":"去","faire":"做","venir":"来","voir":"看","vouloir":"想要","pouvoir":"能","manger":"吃","boire":"喝","parler":"说话","aimer":"爱","savoir":"知道","dire":"说","donner":"给","dormir":"睡觉",
"tête":"头","cheveux":"头发","œil":"眼睛","nez":"鼻子","bouche":"嘴巴","oreille":"耳朵","dent":"牙齿","main":"手","bras":"手臂","jambe":"腿","pied":"脚","doigt":"手指","cœur":"心脏","dos":"背","ventre":"肚子",
"fruit":"水果","banane":"香蕉","fraise":"草莓","citron":"柠檬","raisin":"葡萄","poire":"梨","légume":"蔬菜","tomate":"西红柿","carotte":"胡萝卜","oignon":"洋葱","salade":"生菜","pomme de terre":"土豆",
"ville":"城市","magasin":"商店","marché":"市场","banque":"银行","école":"学校","hôpital":"医院","pharmacie":"药店","restaurant":"餐厅","église":"教堂","parc":"公园","pont":"桥","aéroport":"机场","musée":"博物馆"
},
ja:{
"table":"テーブル","chaise":"いす","lit":"ベッド","porte":"ドア","fenêtre":"窓","clé":"鍵","téléphone":"電話","lampe":"ランプ","nous avons une maison":"私たち は 家 が あります",
"chemise":"シャツ","pantalon":"ズボン","chaussures":"靴","robe":"ワンピース","chapeau":"帽子","manteau":"コート",
"soleil":"太陽","lune":"月","mer":"海","montagne":"山","arbre":"木","fleur":"花","ciel":"空","plage":"ビーチ","le soleil est grand":"太陽 は 大きい です",
"je parle":"私 は 話します","tu vas":"あなた は 行きます","il a un chien":"彼 は 犬 が います","j'aime le café":"私 は コーヒー が 好き です",
"être":"です","avoir":"あります","aller":"行きます","faire":"します","venir":"来ます","voir":"見ます","vouloir":"ほしい","pouvoir":"できます","manger":"食べます","boire":"飲みます","parler":"話します","aimer":"愛する","savoir":"知っています","dire":"言います","donner":"あげます","dormir":"寝ます",
"tête":"頭","cheveux":"髪","œil":"目","nez":"鼻","bouche":"口","oreille":"耳","dent":"歯","main":"手","bras":"腕","jambe":"脚","pied":"足","doigt":"指","cœur":"心臓","dos":"背中","ventre":"おなか",
"fruit":"果物","banane":"バナナ","fraise":"いちご","citron":"レモン","raisin":"ぶどう","poire":"なし","légume":"野菜","tomate":"トマト","carotte":"にんじん","oignon":"たまねぎ","salade":"レタス","pomme de terre":"じゃがいも",
"ville":"町","magasin":"店","marché":"市場","banque":"銀行","école":"学校","hôpital":"病院","pharmacie":"薬局","restaurant":"レストラン","église":"教会","parc":"公園","pont":"橋","aéroport":"空港","musée":"博物館"
},
ko:{
"table":"테이블","chaise":"의자","lit":"침대","porte":"문","fenêtre":"창문","clé":"열쇠","téléphone":"전화","lampe":"램프","nous avons une maison":"우리는 집이 있어요",
"chemise":"셔츠","pantalon":"바지","chaussures":"신발","robe":"원피스","chapeau":"모자","manteau":"코트",
"soleil":"해","lune":"달","mer":"바다","montagne":"산","arbre":"나무","fleur":"꽃","ciel":"하늘","plage":"해변","le soleil est grand":"해가 커요",
"je parle":"저는 말해요","tu vas":"당신은 가요","il a un chien":"그는 개가 있어요","j'aime le café":"저는 커피를 좋아해요",
"être":"이다","avoir":"있다","aller":"가다","faire":"하다","venir":"오다","voir":"보다","vouloir":"원하다","pouvoir":"할 수 있다","manger":"먹다","boire":"마시다","parler":"이야기하다","aimer":"사랑하다","savoir":"알다","dire":"말하다","donner":"주다","dormir":"자다",
"tête":"머리","cheveux":"머리카락","œil":"눈","nez":"코","bouche":"입","oreille":"귀","dent":"치아","main":"손","bras":"팔","jambe":"다리","pied":"발","doigt":"손가락","cœur":"심장","dos":"등","ventre":"배",
"fruit":"과일","banane":"바나나","fraise":"딸기","citron":"레몬","raisin":"포도","poire":"배","légume":"채소","tomate":"토마토","carotte":"당근","oignon":"양파","salade":"상추","pomme de terre":"감자",
"ville":"도시","magasin":"가게","marché":"시장","banque":"은행","école":"학교","hôpital":"병원","pharmacie":"약국","restaurant":"식당","église":"교회","parc":"공원","pont":"다리","aéroport":"공항","musée":"박물관"
},
ar:{
"table":"طاولة","chaise":"كرسي","lit":"سرير","porte":"باب","fenêtre":"نافذة","clé":"مفتاح","téléphone":"هاتف","lampe":"مصباح","nous avons une maison":"عندنا بيت",
"chemise":"قميص","pantalon":"بنطال","chaussures":"حذاء","robe":"فستان","chapeau":"قبعة","manteau":"معطف",
"soleil":"شمس","lune":"قمر","mer":"بحر","montagne":"جبل","arbre":"شجرة","fleur":"زهرة","ciel":"سماء","plage":"شاطئ","le soleil est grand":"الشمس كبيرة",
"je parle":"أنا أتكلم","tu vas":"أنت تذهب","il a un chien":"عنده كلب","j'aime le café":"أحب القهوة",
"être":"يكون","avoir":"يملك","aller":"يذهب","faire":"يفعل","venir":"يأتي","voir":"يرى","vouloir":"يريد","pouvoir":"يستطيع","manger":"يأكل","boire":"يشرب","parler":"يتكلم","aimer":"يحب","savoir":"يعرف","dire":"يقول","donner":"يعطي","dormir":"ينام",
"tête":"رأس","cheveux":"شعر","œil":"عين","nez":"أنف","bouche":"فم","oreille":"أذن","dent":"سن","main":"يد","bras":"ذراع","jambe":"ساق","pied":"قدم","doigt":"إصبع","cœur":"قلب","dos":"ظهر","ventre":"بطن",
"fruit":"فاكهة","banane":"موز","fraise":"فراولة","citron":"ليمون","raisin":"عنب","poire":"كمثرى","légume":"خضار","tomate":"طماطم","carotte":"جزر","oignon":"بصل","salade":"خس","pomme de terre":"بطاطا",
"ville":"مدينة","magasin":"متجر","marché":"سوق","banque":"بنك","école":"مدرسة","hôpital":"مستشفى","pharmacie":"صيدلية","restaurant":"مطعم","église":"كنيسة","parc":"حديقة","pont":"جسر","aéroport":"مطار","musée":"متحف"
}
};
LANGS2.forEach(function(l){ var b=LEX2B[l]||{}; Object.keys(b).forEach(function(k){ LEX2[l][k]=b[k]; }); });
/* Vague 3 des nouvelles langues (v2.71) : unités 17-24 — transports, métiers, jours & saisons,
   météo, adjectifs utiles, restaurant, achats, questions. Les 8 cours passent de 16 à 24 unités.
   Homographes RÉELS assumés (c'est la langue, pas une erreur) : ko 배 = bateau (déjà ventre/poire),
   ko 눈 = neige (déjà œil) ; cs stát = coûter (aussi « être debout »). Adjectifs ko en forme du
   dictionnaire (-다), verbes ja en forme polie ます. */
var LEX2C = {
pl:{
"voiture":"samochód","bus":"autobus","vélo":"rower","moto":"motocykl","taxi":"taksówka","camion":"ciężarówka","train":"pociąg","avion":"samolot","bateau":"statek","métro":"metro",
"médecin":"lekarz","professeur":"nauczyciel","cuisinier":"kucharz","policier":"policjant","serveur":"kelner","avocat":"prawnik","ingénieur":"inżynier","artiste":"artysta","boulanger":"piekarz","agriculteur":"rolnik",
"lundi":"poniedziałek","mardi":"wtorek","mercredi":"środa","jeudi":"czwartek","vendredi":"piątek","samedi":"sobota","dimanche":"niedziela","printemps":"wiosna","été":"lato","automne":"jesień","hiver":"zima",
"pluie":"deszcz","neige":"śnieg","vent":"wiatr","nuage":"chmura","orage":"burza","chaud":"gorący","froid":"zimny","il pleut":"pada deszcz","il fait chaud":"jest gorąco",
"heureux":"szczęśliwy","triste":"smutny","facile":"łatwy","difficile":"trudny","jeune":"młody","vieux":"stary","propre":"czysty","sale":"brudny","plein":"pełny","vide":"pusty","cher":"drogi","content":"zadowolony",
"menu":"menu","plat":"danie","entrée":"przystawka","dessert":"deser","addition":"rachunek","fourchette":"widelec","couteau":"nóż","cuillère":"łyżka","assiette":"talerz","verre":"szklanka","tasse":"filiżanka",
"argent":"pieniądze","prix":"cena","euro":"euro","carte":"karta","monnaie":"reszta","acheter":"kupować","vendre":"sprzedawać","payer":"płacić","coûter":"kosztować",
"qui":"kto","quoi":"co","où":"gdzie","quand":"kiedy","comment":"jak","pourquoi":"dlaczego","combien":"ile"
},
ru:{
"voiture":"машина","bus":"автобус","vélo":"велосипед","moto":"мотоцикл","taxi":"такси","camion":"грузовик","train":"поезд","avion":"самолёт","bateau":"корабль","métro":"метро",
"médecin":"врач","professeur":"учитель","cuisinier":"повар","policier":"полицейский","serveur":"официант","avocat":"адвокат","ingénieur":"инженер","artiste":"художник","boulanger":"пекарь","agriculteur":"фермер",
"lundi":"понедельник","mardi":"вторник","mercredi":"среда","jeudi":"четверг","vendredi":"пятница","samedi":"суббота","dimanche":"воскресенье","printemps":"весна","été":"лето","automne":"осень","hiver":"зима",
"pluie":"дождь","neige":"снег","vent":"ветер","nuage":"облако","orage":"гроза","chaud":"горячий","froid":"холодный","il pleut":"идёт дождь","il fait chaud":"жарко",
"heureux":"счастливый","triste":"грустный","facile":"лёгкий","difficile":"трудный","jeune":"молодой","vieux":"старый","propre":"чистый","sale":"грязный","plein":"полный","vide":"пустой","cher":"дорогой","content":"довольный",
"menu":"меню","plat":"блюдо","entrée":"закуска","dessert":"десерт","addition":"счёт","fourchette":"вилка","couteau":"нож","cuillère":"ложка","assiette":"тарелка","verre":"стакан","tasse":"чашка",
"argent":"деньги","prix":"цена","euro":"евро","carte":"карта","monnaie":"сдача","acheter":"покупать","vendre":"продавать","payer":"платить","coûter":"стоить",
"qui":"кто","quoi":"что","où":"где","quand":"когда","comment":"как","pourquoi":"почему","combien":"сколько"
},
uk:{
"voiture":"машина","bus":"автобус","vélo":"велосипед","moto":"мотоцикл","taxi":"таксі","camion":"вантажівка","train":"потяг","avion":"літак","bateau":"корабель","métro":"метро",
"médecin":"лікар","professeur":"вчитель","cuisinier":"кухар","policier":"поліцейський","serveur":"офіціант","avocat":"адвокат","ingénieur":"інженер","artiste":"художник","boulanger":"пекар","agriculteur":"фермер",
"lundi":"понеділок","mardi":"вівторок","mercredi":"середа","jeudi":"четвер","vendredi":"п'ятниця","samedi":"субота","dimanche":"неділя","printemps":"весна","été":"літо","automne":"осінь","hiver":"зима",
"pluie":"дощ","neige":"сніг","vent":"вітер","nuage":"хмара","orage":"гроза","chaud":"гарячий","froid":"холодний","il pleut":"іде дощ","il fait chaud":"спекотно",
"heureux":"щасливий","triste":"сумний","facile":"легкий","difficile":"складний","jeune":"молодий","vieux":"старий","propre":"чистий","sale":"брудний","plein":"повний","vide":"порожній","cher":"дорогий","content":"задоволений",
"menu":"меню","plat":"страва","entrée":"закуска","dessert":"десерт","addition":"рахунок","fourchette":"виделка","couteau":"ніж","cuillère":"ложка","assiette":"тарілка","verre":"склянка","tasse":"чашка",
"argent":"гроші","prix":"ціна","euro":"євро","carte":"картка","monnaie":"решта","acheter":"купувати","vendre":"продавати","payer":"платити","coûter":"коштувати",
"qui":"хто","quoi":"що","où":"де","quand":"коли","comment":"як","pourquoi":"чому","combien":"скільки"
},
cs:{
"voiture":"auto","bus":"autobus","vélo":"kolo","moto":"motorka","taxi":"taxi","camion":"kamion","train":"vlak","avion":"letadlo","bateau":"loď","métro":"metro",
"médecin":"lékař","professeur":"učitel","cuisinier":"kuchař","policier":"policista","serveur":"číšník","avocat":"právník","ingénieur":"inženýr","artiste":"umělec","boulanger":"pekař","agriculteur":"zemědělec",
"lundi":"pondělí","mardi":"úterý","mercredi":"středa","jeudi":"čtvrtek","vendredi":"pátek","samedi":"sobota","dimanche":"neděle","printemps":"jaro","été":"léto","automne":"podzim","hiver":"zima",
"pluie":"déšť","neige":"sníh","vent":"vítr","nuage":"mrak","orage":"bouřka","chaud":"horký","froid":"studený","il pleut":"prší","il fait chaud":"je horko",
"heureux":"šťastný","triste":"smutný","facile":"snadný","difficile":"těžký","jeune":"mladý","vieux":"starý","propre":"čistý","sale":"špinavý","plein":"plný","vide":"prázdný","cher":"drahý","content":"spokojený",
"menu":"jídelní lístek","plat":"jídlo","entrée":"předkrm","dessert":"dezert","addition":"účet","fourchette":"vidlička","couteau":"nůž","cuillère":"lžíce","assiette":"talíř","verre":"sklenice","tasse":"šálek",
"argent":"peníze","prix":"cena","euro":"euro","carte":"karta","monnaie":"drobné","acheter":"kupovat","vendre":"prodávat","payer":"platit","coûter":"stát",
"qui":"kdo","quoi":"co","où":"kde","quand":"kdy","comment":"jak","pourquoi":"proč","combien":"kolik"
},
zh:{
"voiture":"汽车","bus":"公共汽车","vélo":"自行车","moto":"摩托车","taxi":"出租车","camion":"卡车","train":"火车","avion":"飞机","bateau":"船","métro":"地铁",
"médecin":"医生","professeur":"老师","cuisinier":"厨师","policier":"警察","serveur":"服务员","avocat":"律师","ingénieur":"工程师","artiste":"艺术家","boulanger":"面包师","agriculteur":"农民",
"lundi":"星期一","mardi":"星期二","mercredi":"星期三","jeudi":"星期四","vendredi":"星期五","samedi":"星期六","dimanche":"星期日","printemps":"春天","été":"夏天","automne":"秋天","hiver":"冬天",
"pluie":"雨","neige":"雪","vent":"风","nuage":"云","orage":"雷雨","chaud":"热","froid":"冷","il pleut":"下雨 了","il fait chaud":"天气 很 热",
"heureux":"幸福","triste":"难过","facile":"容易","difficile":"难","jeune":"年轻","vieux":"老","propre":"干净","sale":"脏","plein":"满","vide":"空","cher":"贵","content":"高兴",
"menu":"菜单","plat":"菜","entrée":"开胃菜","dessert":"甜点","addition":"账单","fourchette":"叉子","couteau":"刀","cuillère":"勺子","assiette":"盘子","verre":"玻璃杯","tasse":"杯子",
"argent":"钱","prix":"价格","euro":"欧元","carte":"银行卡","monnaie":"零钱","acheter":"买","vendre":"卖","payer":"付钱","coûter":"花费",
"qui":"谁","quoi":"什么","où":"哪里","quand":"什么时候","comment":"怎么","pourquoi":"为什么","combien":"多少"
},
ja:{
"voiture":"車","bus":"バス","vélo":"自転車","moto":"バイク","taxi":"タクシー","camion":"トラック","train":"電車","avion":"飛行機","bateau":"船","métro":"地下鉄",
"médecin":"医者","professeur":"先生","cuisinier":"料理人","policier":"警察官","serveur":"ウェイター","avocat":"弁護士","ingénieur":"エンジニア","artiste":"芸術家","boulanger":"パン職人","agriculteur":"農家",
"lundi":"月曜日","mardi":"火曜日","mercredi":"水曜日","jeudi":"木曜日","vendredi":"金曜日","samedi":"土曜日","dimanche":"日曜日","printemps":"春","été":"夏","automne":"秋","hiver":"冬",
"pluie":"雨","neige":"雪","vent":"風","nuage":"雲","orage":"雷雨","chaud":"暑い","froid":"寒い","il pleut":"雨 が 降っています","il fait chaud":"暑い です",
"heureux":"幸せ","triste":"悲しい","facile":"簡単","difficile":"難しい","jeune":"若い","vieux":"古い","propre":"清潔","sale":"汚い","plein":"いっぱい","vide":"空っぽ","cher":"高い","content":"うれしい",
"menu":"メニュー","plat":"料理","entrée":"前菜","dessert":"デザート","addition":"お会計","fourchette":"フォーク","couteau":"ナイフ","cuillère":"スプーン","assiette":"皿","verre":"グラス","tasse":"カップ",
"argent":"お金","prix":"値段","euro":"ユーロ","carte":"カード","monnaie":"おつり","acheter":"買います","vendre":"売ります","payer":"払います","coûter":"かかります",
"qui":"誰","quoi":"何","où":"どこ","quand":"いつ","comment":"どうやって","pourquoi":"なぜ","combien":"いくら"
},
ko:{
"voiture":"자동차","bus":"버스","vélo":"자전거","moto":"오토바이","taxi":"택시","camion":"트럭","train":"기차","avion":"비행기","bateau":"배","métro":"지하철",
"médecin":"의사","professeur":"선생님","cuisinier":"요리사","policier":"경찰관","serveur":"웨이터","avocat":"변호사","ingénieur":"엔지니어","artiste":"예술가","boulanger":"제빵사","agriculteur":"농부",
"lundi":"월요일","mardi":"화요일","mercredi":"수요일","jeudi":"목요일","vendredi":"금요일","samedi":"토요일","dimanche":"일요일","printemps":"봄","été":"여름","automne":"가을","hiver":"겨울",
"pluie":"비","neige":"눈","vent":"바람","nuage":"구름","orage":"뇌우","chaud":"덥다","froid":"춥다","il pleut":"비가 와요","il fait chaud":"날씨가 더워요",
"heureux":"행복하다","triste":"슬프다","facile":"쉽다","difficile":"어렵다","jeune":"젊다","vieux":"늙다","propre":"깨끗하다","sale":"더럽다","plein":"가득하다","vide":"비다","cher":"비싸다","content":"기쁘다",
"menu":"메뉴","plat":"요리","entrée":"애피타이저","dessert":"디저트","addition":"계산서","fourchette":"포크","couteau":"칼","cuillère":"숟가락","assiette":"접시","verre":"유리잔","tasse":"컵",
"argent":"돈","prix":"가격","euro":"유로","carte":"카드","monnaie":"거스름돈","acheter":"사다","vendre":"팔다","payer":"지불하다","coûter":"돈이 들다",
"qui":"누구","quoi":"무엇","où":"어디","quand":"언제","comment":"어떻게","pourquoi":"왜","combien":"얼마"
},
ar:{
"voiture":"سيارة","bus":"حافلة","vélo":"دراجة","moto":"دراجة نارية","taxi":"سيارة أجرة","camion":"شاحنة","train":"قطار","avion":"طائرة","bateau":"سفينة","métro":"مترو",
"médecin":"طبيب","professeur":"معلم","cuisinier":"طباخ","policier":"شرطي","serveur":"نادل","avocat":"محام","ingénieur":"مهندس","artiste":"فنان","boulanger":"خباز","agriculteur":"مزارع",
"lundi":"الاثنين","mardi":"الثلاثاء","mercredi":"الأربعاء","jeudi":"الخميس","vendredi":"الجمعة","samedi":"السبت","dimanche":"الأحد","printemps":"الربيع","été":"الصيف","automne":"الخريف","hiver":"الشتاء",
"pluie":"مطر","neige":"ثلج","vent":"ريح","nuage":"سحابة","orage":"عاصفة","chaud":"حار","froid":"بارد","il pleut":"إنها تمطر","il fait chaud":"الجو حار",
"heureux":"سعيد","triste":"حزين","facile":"سهل","difficile":"صعب","jeune":"شاب","vieux":"عجوز","propre":"نظيف","sale":"متسخ","plein":"ممتلئ","vide":"فارغ","cher":"غالي","content":"مسرور",
"menu":"قائمة الطعام","plat":"طبق","entrée":"مقبلات","dessert":"حلوى","addition":"الحساب","fourchette":"شوكة","couteau":"سكين","cuillère":"ملعقة","assiette":"صحن","verre":"كوب","tasse":"فنجان",
"argent":"مال","prix":"سعر","euro":"يورو","carte":"بطاقة","monnaie":"فكة","acheter":"يشتري","vendre":"يبيع","payer":"يدفع","coûter":"يكلف",
"qui":"من","quoi":"ماذا","où":"أين","quand":"متى","comment":"كيف","pourquoi":"لماذا","combien":"كم"
}
};
LANGS2.forEach(function(l){ var c2=LEX2C[l]||{}; Object.keys(c2).forEach(function(k){ LEX2[l][k]=c2[k]; }); });
/* Vague 4 des nouvelles langues (v2.73) : unités 25-32 — nombres 11-1000, émotions, le temps qui
   passe, au travail, la santé, les loisirs, la technologie, opinions & idées. 24 → 32 unités.
   Homographes réels assumés : zh 工作 = travail/travailler ; ko 일 = travail (aussi jour/un),
   쓰다 = écrire (aussi porter/utiliser). Genre : cs à la voix de Bee (féminin) ; pl/ru colle au
   masculin du français affiché. Coréen : nombres natifs jusqu'à 50, sino-coréen 천 (1000). */
var LEX2D = {
pl:{
"onze":"jedenaście","douze":"dwanaście","treize":"trzynaście","quatorze":"czternaście","quinze":"piętnaście","seize":"szesnaście","dix-sept":"siedemnaście","dix-huit":"osiemnaście","dix-neuf":"dziewiętnaście","vingt":"dwadzieścia","trente":"trzydzieści","quarante":"czterdzieści","cinquante":"pięćdziesiąt","mille":"tysiąc",
"fatigué":"zmęczony","fâché":"zły","inquiet":"zmartwiony","surpris":"zaskoczony","fier":"dumny","calme":"spokojny","seul":"samotny","amoureux":"zakochany","peur":"strach","rire":"śmiać się","pleurer":"płakać","je suis fatigué":"jestem zmęczony","elle a peur":"ona się boi",
"maintenant":"teraz","bientôt":"wkrótce","tard":"późno","tôt":"wcześnie","longtemps":"długo","toujours":"zawsze","jamais":"nigdy","souvent":"często","parfois":"czasami","avant":"przed","après":"po","je mange maintenant":"jem teraz","je bois souvent du thé":"często piję herbatę",
"travail":"praca","bureau":"biuro","réunion":"spotkanie","patron":"szef","collègue":"kolega","ordinateur":"komputer","projet":"projekt","salaire":"pensja","entreprise":"firma","réussir":"odnieść sukces","travailler":"pracować","je travaille au bureau":"pracuję w biurze","j'aime mon travail":"lubię moją pracę",
"malade":"chory","douleur":"ból","médicament":"lekarstwo","fièvre":"gorączka","se reposer":"odpoczywać","guérir":"wyzdrowieć","santé":"zdrowie","fort":"silny","faible":"słaby","respirer":"oddychać","je suis malade":"jestem chory","je vais mieux":"czuję się lepiej",
"jouer":"grać","nager":"pływać","courir":"biegać","danser":"tańczyć","voyager":"podróżować","sport":"sport","lire":"czytać","écrire":"pisać","chanter":"śpiewać","musique":"muzyka","film":"film","jeu":"gra","j'aime le sport":"lubię sport","j'aime lire":"lubię czytać",
"écran":"ekran","message":"wiadomość","photo":"zdjęcie","application":"aplikacja","batterie":"bateria","internet":"internet","mot de passe":"hasło","en ligne":"online","clavier":"klawiatura","ordinateur portable":"laptop","je regarde une photo":"oglądam zdjęcie","je suis en ligne":"jestem online",
"penser":"myśleć","croire":"wierzyć","comprendre":"rozumieć","expliquer":"wyjaśniać","raison":"powód","vérité":"prawda","problème":"problem","solution":"rozwiązanie","idée":"pomysł","important":"ważny","je pense que oui":"myślę że tak","c'est une bonne idée":"to dobry pomysł"
},
ru:{
"onze":"одиннадцать","douze":"двенадцать","treize":"тринадцать","quatorze":"четырнадцать","quinze":"пятнадцать","seize":"шестнадцать","dix-sept":"семнадцать","dix-huit":"восемнадцать","dix-neuf":"девятнадцать","vingt":"двадцать","trente":"тридцать","quarante":"сорок","cinquante":"пятьдесят","mille":"тысяча",
"fatigué":"усталый","fâché":"сердитый","inquiet":"обеспокоенный","surpris":"удивлённый","fier":"гордый","calme":"спокойный","seul":"одинокий","amoureux":"влюблённый","peur":"страх","rire":"смеяться","pleurer":"плакать","je suis fatigué":"я устал","elle a peur":"она боится",
"maintenant":"сейчас","bientôt":"скоро","tard":"поздно","tôt":"рано","longtemps":"долго","toujours":"всегда","jamais":"никогда","souvent":"часто","parfois":"иногда","avant":"до","après":"после","je mange maintenant":"я ем сейчас","je bois souvent du thé":"я часто пью чай",
"travail":"работа","bureau":"офис","réunion":"совещание","patron":"начальник","collègue":"коллега","ordinateur":"компьютер","projet":"проект","salaire":"зарплата","entreprise":"компания","réussir":"преуспеть","travailler":"работать","je travaille au bureau":"я работаю в офисе","j'aime mon travail":"я люблю свою работу",
"malade":"больной","douleur":"боль","médicament":"лекарство","fièvre":"жар","se reposer":"отдыхать","guérir":"выздороветь","santé":"здоровье","fort":"сильный","faible":"слабый","respirer":"дышать","je suis malade":"я болею","je vais mieux":"мне лучше",
"jouer":"играть","nager":"плавать","courir":"бегать","danser":"танцевать","voyager":"путешествовать","sport":"спорт","lire":"читать","écrire":"писать","chanter":"петь","musique":"музыка","film":"фильм","jeu":"игра","j'aime le sport":"я люблю спорт","j'aime lire":"я люблю читать",
"écran":"экран","message":"сообщение","photo":"фотография","application":"приложение","batterie":"батарея","internet":"интернет","mot de passe":"пароль","en ligne":"онлайн","clavier":"клавиатура","ordinateur portable":"ноутбук","je regarde une photo":"я смотрю фотографию","je suis en ligne":"я онлайн",
"penser":"думать","croire":"верить","comprendre":"понимать","expliquer":"объяснять","raison":"причина","vérité":"правда","problème":"проблема","solution":"решение","idée":"идея","important":"важный","je pense que oui":"я думаю что да","c'est une bonne idée":"это хорошая идея"
},
uk:{
"onze":"одинадцять","douze":"дванадцять","treize":"тринадцять","quatorze":"чотирнадцять","quinze":"п'ятнадцять","seize":"шістнадцять","dix-sept":"сімнадцять","dix-huit":"вісімнадцять","dix-neuf":"дев'ятнадцять","vingt":"двадцять","trente":"тридцять","quarante":"сорок","cinquante":"п'ятдесят","mille":"тисяча",
"fatigué":"втомлений","fâché":"сердитий","inquiet":"стурбований","surpris":"здивований","fier":"гордий","calme":"спокійний","seul":"самотній","amoureux":"закоханий","peur":"страх","rire":"сміятися","pleurer":"плакати","je suis fatigué":"я втомлений","elle a peur":"вона боїться",
"maintenant":"зараз","bientôt":"скоро","tard":"пізно","tôt":"рано","longtemps":"довго","toujours":"завжди","jamais":"ніколи","souvent":"часто","parfois":"іноді","avant":"до","après":"після","je mange maintenant":"я їм зараз","je bois souvent du thé":"я часто п'ю чай",
"travail":"робота","bureau":"офіс","réunion":"нарада","patron":"начальник","collègue":"колега","ordinateur":"комп'ютер","projet":"проєкт","salaire":"зарплата","entreprise":"компанія","réussir":"досягти успіху","travailler":"працювати","je travaille au bureau":"я працюю в офісі","j'aime mon travail":"я люблю свою роботу",
"malade":"хворий","douleur":"біль","médicament":"ліки","fièvre":"гарячка","se reposer":"відпочивати","guérir":"одужати","santé":"здоров'я","fort":"сильний","faible":"слабкий","respirer":"дихати","je suis malade":"я хворію","je vais mieux":"мені краще",
"jouer":"грати","nager":"плавати","courir":"бігати","danser":"танцювати","voyager":"подорожувати","sport":"спорт","lire":"читати","écrire":"писати","chanter":"співати","musique":"музика","film":"фільм","jeu":"гра","j'aime le sport":"я люблю спорт","j'aime lire":"я люблю читати",
"écran":"екран","message":"повідомлення","photo":"фотографія","application":"застосунок","batterie":"батарея","internet":"інтернет","mot de passe":"пароль","en ligne":"онлайн","clavier":"клавіатура","ordinateur portable":"ноутбук","je regarde une photo":"я дивлюся фотографію","je suis en ligne":"я онлайн",
"penser":"думати","croire":"вірити","comprendre":"розуміти","expliquer":"пояснювати","raison":"причина","vérité":"правда","problème":"проблема","solution":"рішення","idée":"ідея","important":"важливий","je pense que oui":"я думаю що так","c'est une bonne idée":"це хороша ідея"
},
cs:{
"onze":"jedenáct","douze":"dvanáct","treize":"třináct","quatorze":"čtrnáct","quinze":"patnáct","seize":"šestnáct","dix-sept":"sedmnáct","dix-huit":"osmnáct","dix-neuf":"devatenáct","vingt":"dvacet","trente":"třicet","quarante":"čtyřicet","cinquante":"padesát","mille":"tisíc",
"fatigué":"unavený","fâché":"naštvaný","inquiet":"ustaraný","surpris":"překvapený","fier":"hrdý","calme":"klidný","seul":"osamělý","amoureux":"zamilovaný","peur":"strach","rire":"smát se","pleurer":"plakat","je suis fatigué":"jsem unavená","elle a peur":"ona se bojí",
"maintenant":"teď","bientôt":"brzy","tard":"pozdě","tôt":"časně","longtemps":"dlouho","toujours":"vždy","jamais":"nikdy","souvent":"často","parfois":"někdy","avant":"před","après":"po","je mange maintenant":"jím teď","je bois souvent du thé":"často piju čaj",
"travail":"práce","bureau":"kancelář","réunion":"schůzka","patron":"šéf","collègue":"kolega","ordinateur":"počítač","projet":"projekt","salaire":"plat","entreprise":"firma","réussir":"uspět","travailler":"pracovat","je travaille au bureau":"pracuji v kanceláři","j'aime mon travail":"mám ráda svou práci",
"malade":"nemocný","douleur":"bolest","médicament":"lék","fièvre":"horečka","se reposer":"odpočívat","guérir":"uzdravit se","santé":"zdraví","fort":"silný","faible":"slabý","respirer":"dýchat","je suis malade":"jsem nemocná","je vais mieux":"je mi lépe",
"jouer":"hrát","nager":"plavat","courir":"běhat","danser":"tancovat","voyager":"cestovat","sport":"sport","lire":"číst","écrire":"psát","chanter":"zpívat","musique":"hudba","film":"film","jeu":"hra","j'aime le sport":"mám ráda sport","j'aime lire":"ráda čtu",
"écran":"obrazovka","message":"zpráva","photo":"fotka","application":"aplikace","batterie":"baterie","internet":"internet","mot de passe":"heslo","en ligne":"online","clavier":"klávesnice","ordinateur portable":"notebook","je regarde une photo":"dívám se na fotku","je suis en ligne":"jsem online",
"penser":"myslet","croire":"věřit","comprendre":"rozumět","expliquer":"vysvětlit","raison":"důvod","vérité":"pravda","problème":"problém","solution":"řešení","idée":"nápad","important":"důležitý","je pense que oui":"myslím že ano","c'est une bonne idée":"to je dobrý nápad"
},
zh:{
"onze":"十一","douze":"十二","treize":"十三","quatorze":"十四","quinze":"十五","seize":"十六","dix-sept":"十七","dix-huit":"十八","dix-neuf":"十九","vingt":"二十","trente":"三十","quarante":"四十","cinquante":"五十","mille":"千",
"fatigué":"累","fâché":"生气","inquiet":"担心","surpris":"惊讶","fier":"骄傲","calme":"平静","seul":"孤单","amoureux":"恋爱中","peur":"害怕","rire":"笑","pleurer":"哭","je suis fatigué":"我 很 累","elle a peur":"她 害怕",
"maintenant":"现在","bientôt":"很快","tard":"晚","tôt":"早","longtemps":"很久","toujours":"总是","jamais":"从不","souvent":"经常","parfois":"有时","avant":"以前","après":"以后","je mange maintenant":"我 现在 吃饭","je bois souvent du thé":"我 经常 喝 茶",
"travail":"工作","bureau":"办公室","réunion":"会议","patron":"老板","collègue":"同事","ordinateur":"电脑","projet":"项目","salaire":"工资","entreprise":"公司","réussir":"成功","travailler":"工作","je travaille au bureau":"我 在 办公室 工作","j'aime mon travail":"我 喜欢 我 的 工作",
"malade":"生病","douleur":"疼痛","médicament":"药","fièvre":"发烧","se reposer":"休息","guérir":"康复","santé":"健康","fort":"强壮","faible":"虚弱","respirer":"呼吸","je suis malade":"我 生病 了","je vais mieux":"我 好多 了",
"jouer":"玩","nager":"游泳","courir":"跑步","danser":"跳舞","voyager":"旅行","sport":"运动","lire":"读书","écrire":"写","chanter":"唱歌","musique":"音乐","film":"电影","jeu":"游戏","j'aime le sport":"我 喜欢 运动","j'aime lire":"我 喜欢 读书",
"écran":"屏幕","message":"消息","photo":"照片","application":"应用","batterie":"电池","internet":"互联网","mot de passe":"密码","en ligne":"在线","clavier":"键盘","ordinateur portable":"笔记本电脑","je regarde une photo":"我 看 照片","je suis en ligne":"我 在线",
"penser":"想","croire":"相信","comprendre":"明白","expliquer":"解释","raison":"原因","vérité":"真相","problème":"问题","solution":"解决办法","idée":"主意","important":"重要","je pense que oui":"我 想 是 的","c'est une bonne idée":"这 是 个 好 主意"
},
ja:{
"onze":"十一","douze":"十二","treize":"十三","quatorze":"十四","quinze":"十五","seize":"十六","dix-sept":"十七","dix-huit":"十八","dix-neuf":"十九","vingt":"二十","trente":"三十","quarante":"四十","cinquante":"五十","mille":"千",
"fatigué":"疲れた","fâché":"怒っている","inquiet":"心配","surpris":"驚いた","fier":"誇らしい","calme":"穏やか","seul":"一人ぼっち","amoureux":"恋している","peur":"恐れ","rire":"笑います","pleurer":"泣きます","je suis fatigué":"私 は 疲れました","elle a peur":"彼女 は 怖がっています",
"maintenant":"今","bientôt":"もうすぐ","tard":"遅く","tôt":"早く","longtemps":"長い間","toujours":"いつも","jamais":"決して","souvent":"よく","parfois":"時々","avant":"前","après":"後","je mange maintenant":"私 は 今 食べます","je bois souvent du thé":"私 は よく お茶 を 飲みます",
"travail":"仕事","bureau":"オフィス","réunion":"会議","patron":"上司","collègue":"同僚","ordinateur":"パソコン","projet":"プロジェクト","salaire":"給料","entreprise":"会社","réussir":"成功します","travailler":"働きます","je travaille au bureau":"私 は オフィス で 働きます","j'aime mon travail":"私 は 仕事 が 好き です",
"malade":"病気","douleur":"痛み","médicament":"薬","fièvre":"熱","se reposer":"休みます","guérir":"治ります","santé":"健康","fort":"強い","faible":"弱い","respirer":"呼吸します","je suis malade":"私 は 病気 です","je vais mieux":"私 は よくなりました",
"jouer":"遊びます","nager":"泳ぎます","courir":"走ります","danser":"踊ります","voyager":"旅行します","sport":"スポーツ","lire":"読みます","écrire":"書きます","chanter":"歌います","musique":"音楽","film":"映画","jeu":"ゲーム","j'aime le sport":"私 は スポーツ が 好き です","j'aime lire":"私 は 読書 が 好き です",
"écran":"画面","message":"メッセージ","photo":"写真","application":"アプリ","batterie":"バッテリー","internet":"インターネット","mot de passe":"パスワード","en ligne":"オンライン","clavier":"キーボード","ordinateur portable":"ノートパソコン","je regarde une photo":"私 は 写真 を 見ます","je suis en ligne":"私 は オンライン です",
"penser":"思います","croire":"信じます","comprendre":"わかります","expliquer":"説明します","raison":"理由","vérité":"真実","problème":"問題","solution":"解決策","idée":"アイデア","important":"大切","je pense que oui":"私 は そう 思います","c'est une bonne idée":"それ は いい アイデア です"
},
ko:{
"onze":"열하나","douze":"열둘","treize":"열셋","quatorze":"열넷","quinze":"열다섯","seize":"열여섯","dix-sept":"열일곱","dix-huit":"열여덟","dix-neuf":"열아홉","vingt":"스물","trente":"서른","quarante":"마흔","cinquante":"쉰","mille":"천",
"fatigué":"피곤하다","fâché":"화나다","inquiet":"걱정하다","surpris":"놀라다","fier":"자랑스럽다","calme":"차분하다","seul":"외롭다","amoureux":"사랑에 빠지다","peur":"두려움","rire":"웃다","pleurer":"울다","je suis fatigué":"저는 피곤해요","elle a peur":"그녀는 무서워해요",
"maintenant":"지금","bientôt":"곧","tard":"늦게","tôt":"일찍","longtemps":"오랫동안","toujours":"항상","jamais":"절대","souvent":"자주","parfois":"가끔","avant":"전에","après":"후에","je mange maintenant":"저는 지금 먹어요","je bois souvent du thé":"저는 자주 차를 마셔요",
"travail":"일","bureau":"사무실","réunion":"회의","patron":"상사","collègue":"동료","ordinateur":"컴퓨터","projet":"프로젝트","salaire":"월급","entreprise":"회사","réussir":"성공하다","travailler":"일하다","je travaille au bureau":"저는 사무실에서 일해요","j'aime mon travail":"저는 제 일을 좋아해요",
"malade":"아프다","douleur":"통증","médicament":"약","fièvre":"열","se reposer":"쉬다","guérir":"낫다","santé":"건강","fort":"강하다","faible":"약하다","respirer":"숨쉬다","je suis malade":"저는 아파요","je vais mieux":"저는 나아지고 있어요",
"jouer":"놀다","nager":"수영하다","courir":"달리다","danser":"춤추다","voyager":"여행하다","sport":"운동","lire":"읽다","écrire":"쓰다","chanter":"노래하다","musique":"음악","film":"영화","jeu":"게임","j'aime le sport":"저는 운동을 좋아해요","j'aime lire":"저는 읽는 것을 좋아해요",
"écran":"화면","message":"메시지","photo":"사진","application":"앱","batterie":"배터리","internet":"인터넷","mot de passe":"비밀번호","en ligne":"온라인","clavier":"키보드","ordinateur portable":"노트북","je regarde une photo":"저는 사진을 봐요","je suis en ligne":"저는 온라인이에요",
"penser":"생각하다","croire":"믿다","comprendre":"이해하다","expliquer":"설명하다","raison":"이유","vérité":"진실","problème":"문제","solution":"해결책","idée":"아이디어","important":"중요하다","je pense que oui":"저는 그렇다고 생각해요","c'est une bonne idée":"좋은 생각이에요"
},
ar:{
"onze":"أحد عشر","douze":"اثنا عشر","treize":"ثلاثة عشر","quatorze":"أربعة عشر","quinze":"خمسة عشر","seize":"ستة عشر","dix-sept":"سبعة عشر","dix-huit":"ثمانية عشر","dix-neuf":"تسعة عشر","vingt":"عشرون","trente":"ثلاثون","quarante":"أربعون","cinquante":"خمسون","mille":"ألف",
"fatigué":"متعب","fâché":"غاضب","inquiet":"قلق","surpris":"متفاجئ","fier":"فخور","calme":"هادئ","seul":"وحيد","amoureux":"واقع في الحب","peur":"خوف","rire":"يضحك","pleurer":"يبكي","je suis fatigué":"أنا متعب","elle a peur":"هي خائفة",
"maintenant":"الآن","bientôt":"قريبا","tard":"متأخرا","tôt":"مبكرا","longtemps":"طويلا","toujours":"دائما","jamais":"أبدا","souvent":"غالبا","parfois":"أحيانا","avant":"قبل","après":"بعد","je mange maintenant":"أنا آكل الآن","je bois souvent du thé":"أشرب الشاي غالبا",
"travail":"عمل","bureau":"مكتب","réunion":"اجتماع","patron":"مدير","collègue":"زميل","ordinateur":"حاسوب","projet":"مشروع","salaire":"راتب","entreprise":"شركة","réussir":"ينجح","travailler":"يعمل","je travaille au bureau":"أعمل في المكتب","j'aime mon travail":"أحب عملي",
"malade":"مريض","douleur":"ألم","médicament":"دواء","fièvre":"حمى","se reposer":"يستريح","guérir":"يشفى","santé":"صحة","fort":"قوي","faible":"ضعيف","respirer":"يتنفس","je suis malade":"أنا مريض","je vais mieux":"أنا أتحسن",
"jouer":"يلعب","nager":"يسبح","courir":"يجري","danser":"يرقص","voyager":"يسافر","sport":"رياضة","lire":"يقرأ","écrire":"يكتب","chanter":"يغني","musique":"موسيقى","film":"فيلم","jeu":"لعبة","j'aime le sport":"أحب الرياضة","j'aime lire":"أحب القراءة",
"écran":"شاشة","message":"رسالة","photo":"صورة","application":"تطبيق","batterie":"بطارية","internet":"إنترنت","mot de passe":"كلمة السر","en ligne":"متصل","clavier":"لوحة المفاتيح","ordinateur portable":"حاسوب محمول","je regarde une photo":"أنظر إلى صورة","je suis en ligne":"أنا متصل",
"penser":"يفكر","croire":"يعتقد","comprendre":"يفهم","expliquer":"يشرح","raison":"سبب","vérité":"حقيقة","problème":"مشكلة","solution":"حل","idée":"فكرة","important":"مهم","je pense que oui":"أعتقد ذلك","c'est une bonne idée":"هذه فكرة جيدة"
}
};
LANGS2.forEach(function(l){ var d2=LEX2D[l]||{}; Object.keys(d2).forEach(function(k){ LEX2[l][k]=d2[k]; }); });
/* Vague 5 des nouvelles langues (v2.74) : unités 33-40 — verbes du quotidien, la cuisine, la salle
   de bain, lieux de la ville, la position, faire les courses, voyager loin, décrire encore.
   32 → 40 unités. Homographes réels supplémentaires assumés : ru/uk лёгкий/легкий = facile ET
   léger ; cs těžký = difficile ET lourd ; zh 快 = vite/rapide ; ja すぎる (trop) = suffixe enseigné
   tel quel ; ru huile = растительное масло pour distinguer du beurre (масло). */
var LEX2E = {
pl:{
"prendre":"brać","trouver":"znajdować","chercher":"szukać","attendre":"czekać","ouvrir":"otwierać","fermer":"zamykać","commencer":"zaczynać","finir":"kończyć","aider":"pomagać","habiter":"mieszkać","porter":"nosić","essayer":"próbować","apprendre":"uczyć się","oublier":"zapominać","montrer":"pokazywać","je cherche la gare":"szukam dworca",
"cuisine":"kuchnia","four":"piekarnik","frigo":"lodówka","bouteille":"butelka","recette":"przepis","cuisiner":"gotować","sel":"sól","poivre":"pieprz","sucre":"cukier","huile":"olej","beurre":"masło","farine":"mąka","petit-déjeuner":"śniadanie","déjeuner":"obiad","dîner":"kolacja",
"savon":"mydło","douche":"prysznic","bain":"kąpiel","serviette":"ręcznik","se laver":"myć się","brosse à dents":"szczoteczka do zębów","dentifrice":"pasta do zębów","miroir":"lustro","peigne":"grzebień","shampoing":"szampon","je me lave les mains":"myję ręce",
"bibliothèque":"biblioteka","piscine":"basen","cinéma":"kino","théâtre":"teatr","stade":"stadion","place":"plac","poste":"poczta","mairie":"ratusz","boulangerie":"piekarnia","boucherie":"sklep mięsny","quartier":"dzielnica","coin":"róg",
"sous":"pod","sur":"na","devant":"przed","derrière":"za","entre":"między","à côté":"obok","en haut":"na górze","en bas":"na dole","tout droit":"prosto","près":"blisko","loin":"daleko",
"gratuit":"darmowy","soldes":"wyprzedaż","liste":"lista","sac":"torba","panier":"koszyk","cadeau":"prezent","client":"klient","caisse":"kasa","ouvert":"otwarty","fermé":"zamknięty","trop":"za bardzo","c'est trop cher":"to jest za drogie","le magasin est ouvert":"sklep jest otwarty",
"valise":"walizka","passeport":"paszport","billet":"bilet","bagage":"bagaż","frontière":"granica","douane":"urząd celny","départ":"odjazd","arrivée":"przyjazd","retard":"opóźnienie","réserver":"rezerwować","annuler":"anulować","vacances":"wakacje","je réserve un hôtel":"rezerwuję hotel",
"lourd":"ciężki","léger":"lekki","long":"długi","court":"krótki","large":"szeroki","étroit":"wąski","rapide":"szybki","lent":"wolny","dangereux":"niebezpieczny","sûr":"bezpieczny","riche":"bogaty","pauvre":"biedny","drôle":"zabawny","gentil":"miły"
},
ru:{
"prendre":"брать","trouver":"находить","chercher":"искать","attendre":"ждать","ouvrir":"открывать","fermer":"закрывать","commencer":"начинать","finir":"заканчивать","aider":"помогать","habiter":"жить","porter":"носить","essayer":"пробовать","apprendre":"учиться","oublier":"забывать","montrer":"показывать","je cherche la gare":"я ищу вокзал",
"cuisine":"кухня","four":"духовка","frigo":"холодильник","bouteille":"бутылка","recette":"рецепт","cuisiner":"готовить","sel":"соль","poivre":"перец","sucre":"сахар","huile":"растительное масло","beurre":"масло","farine":"мука","petit-déjeuner":"завтрак","déjeuner":"обед","dîner":"ужин",
"savon":"мыло","douche":"душ","bain":"ванна","serviette":"полотенце","se laver":"мыться","brosse à dents":"зубная щётка","dentifrice":"зубная паста","miroir":"зеркало","peigne":"расчёска","shampoing":"шампунь","je me lave les mains":"я мою руки",
"bibliothèque":"библиотека","piscine":"бассейн","cinéma":"кинотеатр","théâtre":"театр","stade":"стадион","place":"площадь","poste":"почта","mairie":"мэрия","boulangerie":"булочная","boucherie":"мясной магазин","quartier":"район","coin":"угол",
"sous":"под","sur":"на","devant":"перед","derrière":"за","entre":"между","à côté":"рядом","en haut":"наверху","en bas":"внизу","tout droit":"прямо","près":"близко","loin":"далеко",
"gratuit":"бесплатный","soldes":"распродажа","liste":"список","sac":"сумка","panier":"корзина","cadeau":"подарок","client":"клиент","caisse":"касса","ouvert":"открытый","fermé":"закрытый","trop":"слишком","c'est trop cher":"это слишком дорого","le magasin est ouvert":"магазин открыт",
"valise":"чемодан","passeport":"паспорт","billet":"билет","bagage":"багаж","frontière":"граница","douane":"таможня","départ":"отъезд","arrivée":"прибытие","retard":"задержка","réserver":"бронировать","annuler":"отменять","vacances":"отпуск","je réserve un hôtel":"я бронирую отель",
"lourd":"тяжёлый","léger":"лёгкий","long":"длинный","court":"короткий","large":"широкий","étroit":"узкий","rapide":"быстрый","lent":"медленный","dangereux":"опасный","sûr":"безопасный","riche":"богатый","pauvre":"бедный","drôle":"смешной","gentil":"добрый"
},
uk:{
"prendre":"брати","trouver":"знаходити","chercher":"шукати","attendre":"чекати","ouvrir":"відкривати","fermer":"закривати","commencer":"починати","finir":"закінчувати","aider":"допомагати","habiter":"жити","porter":"носити","essayer":"пробувати","apprendre":"вчитися","oublier":"забувати","montrer":"показувати","je cherche la gare":"я шукаю вокзал",
"cuisine":"кухня","four":"духовка","frigo":"холодильник","bouteille":"пляшка","recette":"рецепт","cuisiner":"готувати","sel":"сіль","poivre":"перець","sucre":"цукор","huile":"олія","beurre":"масло","farine":"борошно","petit-déjeuner":"сніданок","déjeuner":"обід","dîner":"вечеря",
"savon":"мило","douche":"душ","bain":"ванна","serviette":"рушник","se laver":"митися","brosse à dents":"зубна щітка","dentifrice":"зубна паста","miroir":"дзеркало","peigne":"гребінець","shampoing":"шампунь","je me lave les mains":"я мию руки",
"bibliothèque":"бібліотека","piscine":"басейн","cinéma":"кінотеатр","théâtre":"театр","stade":"стадіон","place":"площа","poste":"пошта","mairie":"мерія","boulangerie":"пекарня","boucherie":"м'ясна крамниця","quartier":"район","coin":"ріг",
"sous":"під","sur":"на","devant":"перед","derrière":"за","entre":"між","à côté":"поруч","en haut":"нагорі","en bas":"внизу","tout droit":"прямо","près":"близько","loin":"далеко",
"gratuit":"безкоштовний","soldes":"розпродаж","liste":"список","sac":"сумка","panier":"кошик","cadeau":"подарунок","client":"клієнт","caisse":"каса","ouvert":"відкритий","fermé":"закритий","trop":"занадто","c'est trop cher":"це занадто дорого","le magasin est ouvert":"магазин відкритий",
"valise":"валіза","passeport":"паспорт","billet":"квиток","bagage":"багаж","frontière":"кордон","douane":"митниця","départ":"від'їзд","arrivée":"прибуття","retard":"затримка","réserver":"бронювати","annuler":"скасовувати","vacances":"відпустка","je réserve un hôtel":"я бронюю готель",
"lourd":"важкий","léger":"легкий","long":"довгий","court":"короткий","large":"широкий","étroit":"вузький","rapide":"швидкий","lent":"повільний","dangereux":"небезпечний","sûr":"безпечний","riche":"багатий","pauvre":"бідний","drôle":"смішний","gentil":"добрий"
},
cs:{
"prendre":"brát","trouver":"najít","chercher":"hledat","attendre":"čekat","ouvrir":"otevřít","fermer":"zavřít","commencer":"začít","finir":"skončit","aider":"pomáhat","habiter":"bydlet","porter":"nosit","essayer":"zkoušet","apprendre":"učit se","oublier":"zapomínat","montrer":"ukázat","je cherche la gare":"hledám nádraží",
"cuisine":"kuchyně","four":"trouba","frigo":"lednička","bouteille":"láhev","recette":"recept","cuisiner":"vařit","sel":"sůl","poivre":"pepř","sucre":"cukr","huile":"olej","beurre":"máslo","farine":"mouka","petit-déjeuner":"snídaně","déjeuner":"oběd","dîner":"večeře",
"savon":"mýdlo","douche":"sprcha","bain":"koupel","serviette":"ručník","se laver":"mýt se","brosse à dents":"zubní kartáček","dentifrice":"zubní pasta","miroir":"zrcadlo","peigne":"hřeben","shampoing":"šampon","je me lave les mains":"myji si ruce",
"bibliothèque":"knihovna","piscine":"bazén","cinéma":"kino","théâtre":"divadlo","stade":"stadion","place":"náměstí","poste":"pošta","mairie":"radnice","boulangerie":"pekárna","boucherie":"řeznictví","quartier":"čtvrť","coin":"roh",
"sous":"pod","sur":"na","devant":"před","derrière":"za","entre":"mezi","à côté":"vedle","en haut":"nahoře","en bas":"dole","tout droit":"rovně","près":"blízko","loin":"daleko",
"gratuit":"zdarma","soldes":"výprodej","liste":"seznam","sac":"taška","panier":"košík","cadeau":"dárek","client":"zákazník","caisse":"pokladna","ouvert":"otevřený","fermé":"zavřený","trop":"příliš","c'est trop cher":"to je příliš drahé","le magasin est ouvert":"obchod je otevřený",
"valise":"kufr","passeport":"pas","billet":"lístek","bagage":"zavazadlo","frontière":"hranice","douane":"celnice","départ":"odjezd","arrivée":"příjezd","retard":"zpoždění","réserver":"rezervovat","annuler":"zrušit","vacances":"dovolená","je réserve un hôtel":"rezervuji hotel",
"lourd":"těžký","léger":"lehký","long":"dlouhý","court":"krátký","large":"široký","étroit":"úzký","rapide":"rychlý","lent":"pomalý","dangereux":"nebezpečný","sûr":"bezpečný","riche":"bohatý","pauvre":"chudý","drôle":"vtipný","gentil":"milý"
},
zh:{
"prendre":"拿","trouver":"找到","chercher":"找","attendre":"等","ouvrir":"打开","fermer":"关","commencer":"开始","finir":"结束","aider":"帮助","habiter":"住","porter":"穿","essayer":"试","apprendre":"学习","oublier":"忘记","montrer":"展示","je cherche la gare":"我 找 火车站",
"cuisine":"厨房","four":"烤箱","frigo":"冰箱","bouteille":"瓶子","recette":"食谱","cuisiner":"做饭","sel":"盐","poivre":"胡椒","sucre":"糖","huile":"油","beurre":"黄油","farine":"面粉","petit-déjeuner":"早饭","déjeuner":"午饭","dîner":"晚饭",
"savon":"肥皂","douche":"淋浴","bain":"泡澡","serviette":"毛巾","se laver":"洗澡","brosse à dents":"牙刷","dentifrice":"牙膏","miroir":"镜子","peigne":"梳子","shampoing":"洗发水","je me lave les mains":"我 洗 手",
"bibliothèque":"图书馆","piscine":"游泳池","cinéma":"电影院","théâtre":"剧院","stade":"体育场","place":"广场","poste":"邮局","mairie":"市政厅","boulangerie":"面包店","boucherie":"肉店","quartier":"街区","coin":"角落",
"sous":"下面","sur":"上面","devant":"前面","derrière":"后面","entre":"中间","à côté":"旁边","en haut":"顶部","en bas":"底部","tout droit":"一直走","près":"近","loin":"远",
"gratuit":"免费","soldes":"打折","liste":"清单","sac":"袋子","panier":"购物篮","cadeau":"礼物","client":"顾客","caisse":"收银台","ouvert":"开门","fermé":"关门","trop":"太","c'est trop cher":"这 太 贵 了","le magasin est ouvert":"商店 开门 了",
"valise":"行李箱","passeport":"护照","billet":"票","bagage":"行李","frontière":"边境","douane":"海关","départ":"出发","arrivée":"到达","retard":"延误","réserver":"预订","annuler":"取消","vacances":"假期","je réserve un hôtel":"我 预订 酒店",
"lourd":"重","léger":"轻","long":"长","court":"短","large":"宽","étroit":"窄","rapide":"快","lent":"慢","dangereux":"危险","sûr":"安全","riche":"富有","pauvre":"贫穷","drôle":"有趣","gentil":"善良"
},
ja:{
"prendre":"取ります","trouver":"見つけます","chercher":"探します","attendre":"待ちます","ouvrir":"開けます","fermer":"閉めます","commencer":"始めます","finir":"終わります","aider":"手伝います","habiter":"住みます","porter":"着ます","essayer":"試します","apprendre":"学びます","oublier":"忘れます","montrer":"見せます","je cherche la gare":"私 は 駅 を 探します",
"cuisine":"台所","four":"オーブン","frigo":"冷蔵庫","bouteille":"ボトル","recette":"レシピ","cuisiner":"料理します","sel":"塩","poivre":"こしょう","sucre":"砂糖","huile":"油","beurre":"バター","farine":"小麦粉","petit-déjeuner":"朝ごはん","déjeuner":"昼ごはん","dîner":"晩ごはん",
"savon":"せっけん","douche":"シャワー","bain":"お風呂","serviette":"タオル","se laver":"洗います","brosse à dents":"歯ブラシ","dentifrice":"歯磨き粉","miroir":"鏡","peigne":"くし","shampoing":"シャンプー","je me lave les mains":"私 は 手 を 洗います",
"bibliothèque":"図書館","piscine":"プール","cinéma":"映画館","théâtre":"劇場","stade":"スタジアム","place":"広場","poste":"郵便局","mairie":"市役所","boulangerie":"パン屋","boucherie":"肉屋","quartier":"地区","coin":"角",
"sous":"下","sur":"上","devant":"前","derrière":"後ろ","entre":"間","à côté":"となり","en haut":"上の方","en bas":"下の方","tout droit":"まっすぐ","près":"近く","loin":"遠く",
"gratuit":"無料","soldes":"セール","liste":"リスト","sac":"袋","panier":"買い物かご","cadeau":"プレゼント","client":"お客さん","caisse":"レジ","ouvert":"開いている","fermé":"閉まっている","trop":"すぎる","c'est trop cher":"これ は 高すぎます","le magasin est ouvert":"店 は 開いています",
"valise":"スーツケース","passeport":"パスポート","billet":"チケット","bagage":"荷物","frontière":"国境","douane":"税関","départ":"出発","arrivée":"到着","retard":"遅れ","réserver":"予約します","annuler":"キャンセルします","vacances":"休暇","je réserve un hôtel":"私 は ホテル を 予約します",
"lourd":"重い","léger":"軽い","long":"長い","court":"短い","large":"広い","étroit":"狭い","rapide":"速い","lent":"遅い","dangereux":"危ない","sûr":"安全","riche":"金持ち","pauvre":"貧しい","drôle":"面白い","gentil":"優しい"
},
ko:{
"prendre":"가져가다","trouver":"발견하다","chercher":"찾다","attendre":"기다리다","ouvrir":"열다","fermer":"닫다","commencer":"시작하다","finir":"끝내다","aider":"돕다","habiter":"살다","porter":"입다","essayer":"시도하다","apprendre":"배우다","oublier":"잊다","montrer":"보여주다","je cherche la gare":"저는 기차역을 찾아요",
"cuisine":"부엌","four":"오븐","frigo":"냉장고","bouteille":"병","recette":"요리법","cuisiner":"요리하다","sel":"소금","poivre":"후추","sucre":"설탕","huile":"기름","beurre":"버터","farine":"밀가루","petit-déjeuner":"아침 식사","déjeuner":"점심 식사","dîner":"저녁 식사",
"savon":"비누","douche":"샤워","bain":"목욕","serviette":"수건","se laver":"씻다","brosse à dents":"칫솔","dentifrice":"치약","miroir":"거울","peigne":"빗","shampoing":"샴푸","je me lave les mains":"저는 손을 씻어요",
"bibliothèque":"도서관","piscine":"수영장","cinéma":"영화관","théâtre":"극장","stade":"경기장","place":"광장","poste":"우체국","mairie":"시청","boulangerie":"빵집","boucherie":"정육점","quartier":"동네","coin":"모퉁이",
"sous":"아래","sur":"위","devant":"앞","derrière":"뒤","entre":"사이","à côté":"옆","en haut":"위쪽","en bas":"아래쪽","tout droit":"직진","près":"가까이","loin":"멀리",
"gratuit":"무료","soldes":"세일","liste":"목록","sac":"가방","panier":"장바구니","cadeau":"선물","client":"손님","caisse":"계산대","ouvert":"열려 있다","fermé":"닫혀 있다","trop":"너무","c'est trop cher":"이것은 너무 비싸요","le magasin est ouvert":"가게가 열려 있어요",
"valise":"여행 가방","passeport":"여권","billet":"표","bagage":"짐","frontière":"국경","douane":"세관","départ":"출발","arrivée":"도착","retard":"지연","réserver":"예약하다","annuler":"취소하다","vacances":"휴가","je réserve un hôtel":"저는 호텔을 예약해요",
"lourd":"무겁다","léger":"가볍다","long":"길다","court":"짧다","large":"넓다","étroit":"좁다","rapide":"빠르다","lent":"느리다","dangereux":"위험하다","sûr":"안전하다","riche":"부유하다","pauvre":"가난하다","drôle":"웃기다","gentil":"친절하다"
},
ar:{
"prendre":"يأخذ","trouver":"يجد","chercher":"يبحث","attendre":"ينتظر","ouvrir":"يفتح","fermer":"يغلق","commencer":"يبدأ","finir":"ينهي","aider":"يساعد","habiter":"يسكن","porter":"يرتدي","essayer":"يحاول","apprendre":"يتعلم","oublier":"ينسى","montrer":"يعرض","je cherche la gare":"أبحث عن محطة القطار",
"cuisine":"مطبخ","four":"فرن","frigo":"ثلاجة","bouteille":"زجاجة","recette":"وصفة","cuisiner":"يطبخ","sel":"ملح","poivre":"فلفل","sucre":"سكر","huile":"زيت","beurre":"زبدة","farine":"طحين","petit-déjeuner":"فطور","déjeuner":"غداء","dîner":"عشاء",
"savon":"صابون","douche":"دش","bain":"حمام","serviette":"منشفة","se laver":"يغتسل","brosse à dents":"فرشاة أسنان","dentifrice":"معجون أسنان","miroir":"مرآة","peigne":"مشط","shampoing":"شامبو","je me lave les mains":"أغسل يدي",
"bibliothèque":"مكتبة","piscine":"مسبح","cinéma":"سينما","théâtre":"مسرح","stade":"ملعب","place":"ساحة","poste":"مكتب البريد","mairie":"البلدية","boulangerie":"مخبز","boucherie":"ملحمة","quartier":"حي","coin":"زاوية",
"sous":"تحت","sur":"فوق","devant":"أمام","derrière":"خلف","entre":"بين","à côté":"بجانب","en haut":"في الأعلى","en bas":"في الأسفل","tout droit":"إلى الأمام","près":"قريب","loin":"بعيد",
"gratuit":"مجاني","soldes":"تخفيضات","liste":"قائمة","sac":"حقيبة","panier":"سلة","cadeau":"هدية","client":"زبون","caisse":"صندوق الدفع","ouvert":"مفتوح","fermé":"مغلق","trop":"أكثر من اللازم","c'est trop cher":"هذا غال جدا","le magasin est ouvert":"المتجر مفتوح",
"valise":"حقيبة سفر","passeport":"جواز سفر","billet":"تذكرة","bagage":"أمتعة","frontière":"حدود","douane":"جمارك","départ":"مغادرة","arrivée":"وصول","retard":"تأخير","réserver":"يحجز","annuler":"يلغي","vacances":"عطلة","je réserve un hôtel":"أحجز فندقا",
"lourd":"ثقيل","léger":"خفيف","long":"طويل","court":"قصير","large":"عريض","étroit":"ضيق","rapide":"سريع","lent":"بطيء","dangereux":"خطير","sûr":"آمن","riche":"غني","pauvre":"فقير","drôle":"مضحك","gentil":"لطيف"
}
};
LANGS2.forEach(function(l){ var e2=LEX2E[l]||{}; Object.keys(e2).forEach(function(k){ LEX2[l][k]=e2[k]; }); });
/* Vague 6 des nouvelles langues (v2.75) : unités 41-48 — communiquer, la nature sauvage, les
   animaux sauvages, petits mots essentiels, la maison en détail, objets du quotidien, le
   caractère, apprendre. 40 → 48 unités. Distinctions faites pour éviter les doublons de valeur :
   pl nouvelle=nowina (message=wiadomość) ; zh réponse=答案 (répondre=回答), mot=单词 ;
   ar lettre=خطاب (message=رسالة), feuille=ورقة شجر (papier=ورق), jardin=بستان (parc=حديقة),
   toit=سطح (plafond=سقف), montre=ساعة يد (heure=ساعة), crayon=قلم رصاص (stylo=قلم).
   Homographe réel assumé : zh 问题 = question ET problème (c'est la langue). */
var LEX2F = {
pl:{
"appeler":"dzwonić","répondre":"odpowiadać","demander":"pytać","envoyer":"wysyłać","recevoir":"otrzymywać","question":"pytanie","réponse":"odpowiedź","nouvelle":"nowina","lettre":"list","adresse":"adres","e-mail":"e-mail","numéro":"numer","je t'appelle demain":"zadzwonię do ciebie jutro",
"rivière":"rzeka","lac":"jezioro","forêt":"las","île":"wyspa","colline":"wzgórze","champ":"pole","herbe":"trawa","feuille":"liść","pierre":"kamień","terre":"ziemia","feu":"ogień","étoile":"gwiazda","la rivière est froide":"rzeka jest zimna",
"lion":"lew","tigre":"tygrys","éléphant":"słoń","singe":"małpa","ours":"niedźwiedź","loup":"wilk","renard":"lis","serpent":"wąż","abeille":"pszczoła","papillon":"motyl","araignée":"pająk","canard":"kaczka","l'abeille aime les fleurs":"pszczoła lubi kwiaty",
"avec":"z","sans":"bez","aussi":"też","mais":"ale","parce que":"ponieważ","ou":"albo","si":"jeśli","donc":"więc","beaucoup":"dużo","peu":"mało","très":"bardzo","peut-être":"może","quelque chose":"coś","rien":"nic","tout":"wszystko","quelqu'un":"ktoś","je voyage avec ma famille":"podróżuję z rodziną",
"salon":"salon","chambre":"sypialnia","jardin":"ogród","garage":"garaż","étage":"piętro","escalier":"schody","toit":"dach","mur":"ściana","sol":"podłoga","plafond":"sufit","ascenseur":"winda","voisin":"sąsiad",
"montre":"zegarek","lunettes":"okulary","parapluie":"parasol","portefeuille":"portfel","stylo":"długopis","crayon":"ołówek","ciseaux":"nożyczki","papier":"papier","journal":"gazeta","boîte":"pudełko","bougie":"świeca",
"intelligent":"inteligentny","poli":"uprzejmy","courageux":"odważny","honnête":"uczciwy","patient":"cierpliwy","sympathique":"sympatyczny","timide":"nieśmiały","sérieux":"poważny","paresseux":"leniwy","curieux":"ciekawski","méchant":"złośliwy","sévère":"surowy",
"élève":"uczeń","classe":"klasa","leçon":"lekcja","examen":"egzamin","note":"ocena","erreur":"błąd","cahier":"zeszyt","mot":"słowo","phrase":"zdanie","langue":"język","dictionnaire":"słownik","page":"strona","sac à dos":"plecak"
},
ru:{
"appeler":"звонить","répondre":"отвечать","demander":"спрашивать","envoyer":"отправлять","recevoir":"получать","question":"вопрос","réponse":"ответ","nouvelle":"новость","lettre":"письмо","adresse":"адрес","e-mail":"электронная почта","numéro":"номер","je t'appelle demain":"я позвоню тебе завтра",
"rivière":"река","lac":"озеро","forêt":"лес","île":"остров","colline":"холм","champ":"поле","herbe":"трава","feuille":"лист","pierre":"камень","terre":"земля","feu":"огонь","étoile":"звезда","la rivière est froide":"река холодная",
"lion":"лев","tigre":"тигр","éléphant":"слон","singe":"обезьяна","ours":"медведь","loup":"волк","renard":"лиса","serpent":"змея","abeille":"пчела","papillon":"бабочка","araignée":"паук","canard":"утка","l'abeille aime les fleurs":"пчела любит цветы",
"avec":"с","sans":"без","aussi":"тоже","mais":"но","parce que":"потому что","ou":"или","si":"если","donc":"поэтому","beaucoup":"много","peu":"мало","très":"очень","peut-être":"может быть","quelque chose":"что-то","rien":"ничего","tout":"всё","quelqu'un":"кто-то","je voyage avec ma famille":"я путешествую с семьёй",
"salon":"гостиная","chambre":"спальня","jardin":"сад","garage":"гараж","étage":"этаж","escalier":"лестница","toit":"крыша","mur":"стена","sol":"пол","plafond":"потолок","ascenseur":"лифт","voisin":"сосед",
"montre":"часы","lunettes":"очки","parapluie":"зонт","portefeuille":"кошелёк","stylo":"ручка","crayon":"карандаш","ciseaux":"ножницы","papier":"бумага","journal":"газета","boîte":"коробка","bougie":"свеча",
"intelligent":"умный","poli":"вежливый","courageux":"смелый","honnête":"честный","patient":"терпеливый","sympathique":"приятный","timide":"застенчивый","sérieux":"серьёзный","paresseux":"ленивый","curieux":"любопытный","méchant":"злой","sévère":"строгий",
"élève":"ученик","classe":"класс","leçon":"урок","examen":"экзамен","note":"оценка","erreur":"ошибка","cahier":"тетрадь","mot":"слово","phrase":"предложение","langue":"язык","dictionnaire":"словарь","page":"страница","sac à dos":"рюкзак"
},
uk:{
"appeler":"дзвонити","répondre":"відповідати","demander":"запитувати","envoyer":"надсилати","recevoir":"отримувати","question":"питання","réponse":"відповідь","nouvelle":"новина","lettre":"лист","adresse":"адреса","e-mail":"електронна пошта","numéro":"номер","je t'appelle demain":"я подзвоню тобі завтра",
"rivière":"річка","lac":"озеро","forêt":"ліс","île":"острів","colline":"пагорб","champ":"поле","herbe":"трава","feuille":"листок","pierre":"камінь","terre":"земля","feu":"вогонь","étoile":"зірка","la rivière est froide":"річка холодна",
"lion":"лев","tigre":"тигр","éléphant":"слон","singe":"мавпа","ours":"ведмідь","loup":"вовк","renard":"лисиця","serpent":"змія","abeille":"бджола","papillon":"метелик","araignée":"павук","canard":"качка","l'abeille aime les fleurs":"бджола любить квіти",
"avec":"з","sans":"без","aussi":"теж","mais":"але","parce que":"тому що","ou":"або","si":"якщо","donc":"тому","beaucoup":"багато","peu":"мало","très":"дуже","peut-être":"можливо","quelque chose":"щось","rien":"нічого","tout":"все","quelqu'un":"хтось","je voyage avec ma famille":"я подорожую з сім'єю",
"salon":"вітальня","chambre":"спальня","jardin":"сад","garage":"гараж","étage":"поверх","escalier":"сходи","toit":"дах","mur":"стіна","sol":"підлога","plafond":"стеля","ascenseur":"ліфт","voisin":"сусід",
"montre":"годинник","lunettes":"окуляри","parapluie":"парасолька","portefeuille":"гаманець","stylo":"ручка","crayon":"олівець","ciseaux":"ножиці","papier":"папір","journal":"газета","boîte":"коробка","bougie":"свічка",
"intelligent":"розумний","poli":"ввічливий","courageux":"сміливий","honnête":"чесний","patient":"терплячий","sympathique":"приємний","timide":"сором'язливий","sérieux":"серйозний","paresseux":"лінивий","curieux":"допитливий","méchant":"злий","sévère":"суворий",
"élève":"учень","classe":"клас","leçon":"урок","examen":"іспит","note":"оцінка","erreur":"помилка","cahier":"зошит","mot":"слово","phrase":"речення","langue":"мова","dictionnaire":"словник","page":"сторінка","sac à dos":"рюкзак"
},
cs:{
"appeler":"volat","répondre":"odpovídat","demander":"ptát se","envoyer":"posílat","recevoir":"dostávat","question":"otázka","réponse":"odpověď","nouvelle":"novinka","lettre":"dopis","adresse":"adresa","e-mail":"e-mail","numéro":"číslo","je t'appelle demain":"zavolám ti zítra",
"rivière":"řeka","lac":"jezero","forêt":"les","île":"ostrov","colline":"kopec","champ":"pole","herbe":"tráva","feuille":"list","pierre":"kámen","terre":"země","feu":"oheň","étoile":"hvězda","la rivière est froide":"řeka je studená",
"lion":"lev","tigre":"tygr","éléphant":"slon","singe":"opice","ours":"medvěd","loup":"vlk","renard":"liška","serpent":"had","abeille":"včela","papillon":"motýl","araignée":"pavouk","canard":"kachna","l'abeille aime les fleurs":"včela miluje květiny",
"avec":"s","sans":"bez","aussi":"také","mais":"ale","parce que":"protože","ou":"nebo","si":"jestli","donc":"takže","beaucoup":"hodně","peu":"málo","très":"velmi","peut-être":"možná","quelque chose":"něco","rien":"nic","tout":"všechno","quelqu'un":"někdo","je voyage avec ma famille":"cestuji s rodinou",
"salon":"obývací pokoj","chambre":"ložnice","jardin":"zahrada","garage":"garáž","étage":"patro","escalier":"schody","toit":"střecha","mur":"zeď","sol":"podlaha","plafond":"strop","ascenseur":"výtah","voisin":"soused",
"montre":"hodinky","lunettes":"brýle","parapluie":"deštník","portefeuille":"peněženka","stylo":"propiska","crayon":"tužka","ciseaux":"nůžky","papier":"papír","journal":"noviny","boîte":"krabice","bougie":"svíčka",
"intelligent":"chytrý","poli":"zdvořilý","courageux":"odvážný","honnête":"čestný","patient":"trpělivý","sympathique":"sympatický","timide":"stydlivý","sérieux":"vážný","paresseux":"líný","curieux":"zvědavý","méchant":"zlý","sévère":"přísný",
"élève":"žák","classe":"třída","leçon":"lekce","examen":"zkouška","note":"známka","erreur":"chyba","cahier":"sešit","mot":"slovo","phrase":"věta","langue":"jazyk","dictionnaire":"slovník","page":"stránka","sac à dos":"batoh"
},
zh:{
"appeler":"打电话","répondre":"回答","demander":"问","envoyer":"发送","recevoir":"收到","question":"问题","réponse":"答案","nouvelle":"新闻","lettre":"信","adresse":"地址","e-mail":"电子邮件","numéro":"号码","je t'appelle demain":"我 明天 给 你 打电话",
"rivière":"河","lac":"湖","forêt":"森林","île":"岛","colline":"山丘","champ":"田野","herbe":"草","feuille":"叶子","pierre":"石头","terre":"土地","feu":"火","étoile":"星星","la rivière est froide":"河水 很 冷",
"lion":"狮子","tigre":"老虎","éléphant":"大象","singe":"猴子","ours":"熊","loup":"狼","renard":"狐狸","serpent":"蛇","abeille":"蜜蜂","papillon":"蝴蝶","araignée":"蜘蛛","canard":"鸭子","l'abeille aime les fleurs":"蜜蜂 喜欢 花",
"avec":"和","sans":"没有","aussi":"也","mais":"但是","parce que":"因为","ou":"或者","si":"如果","donc":"所以","beaucoup":"很多","peu":"少","très":"很","peut-être":"也许","quelque chose":"东西","rien":"没什么","tout":"一切","quelqu'un":"有人","je voyage avec ma famille":"我 和 家人 一起 旅行",
"salon":"客厅","chambre":"卧室","jardin":"花园","garage":"车库","étage":"楼层","escalier":"楼梯","toit":"屋顶","mur":"墙","sol":"地板","plafond":"天花板","ascenseur":"电梯","voisin":"邻居",
"montre":"手表","lunettes":"眼镜","parapluie":"雨伞","portefeuille":"钱包","stylo":"钢笔","crayon":"铅笔","ciseaux":"剪刀","papier":"纸","journal":"报纸","boîte":"盒子","bougie":"蜡烛",
"intelligent":"聪明","poli":"有礼貌","courageux":"勇敢","honnête":"诚实","patient":"有耐心","sympathique":"友好","timide":"害羞","sérieux":"认真","paresseux":"懒惰","curieux":"好奇","méchant":"凶","sévère":"严格",
"élève":"学生","classe":"班级","leçon":"课","examen":"考试","note":"分数","erreur":"错误","cahier":"笔记本","mot":"单词","phrase":"句子","langue":"语言","dictionnaire":"词典","page":"页","sac à dos":"书包"
},
ja:{
"appeler":"電話します","répondre":"答えます","demander":"聞きます","envoyer":"送ります","recevoir":"受け取ります","question":"質問","réponse":"答え","nouvelle":"ニュース","lettre":"手紙","adresse":"住所","e-mail":"メール","numéro":"番号","je t'appelle demain":"明日 電話します",
"rivière":"川","lac":"湖","forêt":"森","île":"島","colline":"丘","champ":"畑","herbe":"草","feuille":"葉","pierre":"石","terre":"土","feu":"火","étoile":"星","la rivière est froide":"川 は 冷たい です",
"lion":"ライオン","tigre":"トラ","éléphant":"ゾウ","singe":"サル","ours":"クマ","loup":"オオカミ","renard":"キツネ","serpent":"ヘビ","abeille":"ミツバチ","papillon":"チョウ","araignée":"クモ","canard":"アヒル","l'abeille aime les fleurs":"ミツバチ は 花 が 好き です",
"avec":"と","sans":"なしで","aussi":"も","mais":"でも","parce que":"なぜなら","ou":"または","si":"もし","donc":"だから","beaucoup":"たくさん","peu":"少し","très":"とても","peut-être":"たぶん","quelque chose":"何か","rien":"何も","tout":"全部","quelqu'un":"誰か","je voyage avec ma famille":"私 は 家族 と 旅行します",
"salon":"リビング","chambre":"寝室","jardin":"庭","garage":"ガレージ","étage":"階","escalier":"階段","toit":"屋根","mur":"壁","sol":"床","plafond":"天井","ascenseur":"エレベーター","voisin":"隣人",
"montre":"腕時計","lunettes":"めがね","parapluie":"傘","portefeuille":"財布","stylo":"ペン","crayon":"えんぴつ","ciseaux":"はさみ","papier":"紙","journal":"新聞","boîte":"箱","bougie":"ろうそく",
"intelligent":"賢い","poli":"礼儀正しい","courageux":"勇敢","honnête":"正直","patient":"我慢強い","sympathique":"感じがいい","timide":"恥ずかしがり屋","sérieux":"まじめ","paresseux":"怠け者","curieux":"好奇心が強い","méchant":"意地悪","sévère":"厳しい",
"élève":"生徒","classe":"クラス","leçon":"授業","examen":"試験","note":"成績","erreur":"間違い","cahier":"ノート","mot":"単語","phrase":"文","langue":"言語","dictionnaire":"辞書","page":"ページ","sac à dos":"リュックサック"
},
ko:{
"appeler":"전화하다","répondre":"대답하다","demander":"묻다","envoyer":"보내다","recevoir":"받다","question":"질문","réponse":"대답","nouvelle":"소식","lettre":"편지","adresse":"주소","e-mail":"이메일","numéro":"번호","je t'appelle demain":"내일 전화할게요",
"rivière":"강","lac":"호수","forêt":"숲","île":"섬","colline":"언덕","champ":"밭","herbe":"풀","feuille":"잎","pierre":"돌","terre":"땅","feu":"불","étoile":"별","la rivière est froide":"강이 차가워요",
"lion":"사자","tigre":"호랑이","éléphant":"코끼리","singe":"원숭이","ours":"곰","loup":"늑대","renard":"여우","serpent":"뱀","abeille":"꿀벌","papillon":"나비","araignée":"거미","canard":"오리","l'abeille aime les fleurs":"꿀벌은 꽃을 좋아해요",
"avec":"와","sans":"없이","aussi":"또한","mais":"하지만","parce que":"왜냐하면","ou":"또는","si":"만약","donc":"그래서","beaucoup":"많이","peu":"조금","très":"아주","peut-être":"아마","quelque chose":"뭔가","rien":"아무것도","tout":"전부","quelqu'un":"누군가","je voyage avec ma famille":"저는 가족과 여행해요",
"salon":"거실","chambre":"침실","jardin":"정원","garage":"차고","étage":"층","escalier":"계단","toit":"지붕","mur":"벽","sol":"바닥","plafond":"천장","ascenseur":"엘리베이터","voisin":"이웃",
"montre":"손목시계","lunettes":"안경","parapluie":"우산","portefeuille":"지갑","stylo":"펜","crayon":"연필","ciseaux":"가위","papier":"종이","journal":"신문","boîte":"상자","bougie":"양초",
"intelligent":"똑똑하다","poli":"예의 바르다","courageux":"용감하다","honnête":"정직하다","patient":"참을성이 있다","sympathique":"상냥하다","timide":"수줍다","sérieux":"진지하다","paresseux":"게으르다","curieux":"호기심이 많다","méchant":"못되다","sévère":"엄격하다",
"élève":"학생","classe":"반","leçon":"수업","examen":"시험","note":"성적","erreur":"실수","cahier":"공책","mot":"단어","phrase":"문장","langue":"언어","dictionnaire":"사전","page":"페이지","sac à dos":"배낭"
},
ar:{
"appeler":"يتصل","répondre":"يجيب","demander":"يسأل","envoyer":"يرسل","recevoir":"يستقبل","question":"سؤال","réponse":"جواب","nouvelle":"خبر","lettre":"خطاب","adresse":"عنوان","e-mail":"بريد إلكتروني","numéro":"رقم","je t'appelle demain":"سأتصل بك غدا",
"rivière":"نهر","lac":"بحيرة","forêt":"غابة","île":"جزيرة","colline":"تلة","champ":"حقل","herbe":"عشب","feuille":"ورقة شجر","pierre":"حجر","terre":"أرض","feu":"نار","étoile":"نجمة","la rivière est froide":"النهر بارد",
"lion":"أسد","tigre":"نمر","éléphant":"فيل","singe":"قرد","ours":"دب","loup":"ذئب","renard":"ثعلب","serpent":"ثعبان","abeille":"نحلة","papillon":"فراشة","araignée":"عنكبوت","canard":"بطة","l'abeille aime les fleurs":"النحلة تحب الزهور",
"avec":"مع","sans":"بدون","aussi":"أيضا","mais":"لكن","parce que":"لأن","ou":"أو","si":"إذا","donc":"لذلك","beaucoup":"كثيرا","peu":"قليلا","très":"جدا","peut-être":"ربما","quelque chose":"شيء ما","rien":"لا شيء","tout":"كل شيء","quelqu'un":"شخص ما","je voyage avec ma famille":"أسافر مع عائلتي",
"salon":"غرفة الجلوس","chambre":"غرفة النوم","jardin":"بستان","garage":"مرآب","étage":"طابق","escalier":"درج","toit":"سطح","mur":"جدار","sol":"أرضية","plafond":"سقف","ascenseur":"مصعد","voisin":"جار",
"montre":"ساعة يد","lunettes":"نظارة","parapluie":"مظلة","portefeuille":"محفظة","stylo":"قلم","crayon":"قلم رصاص","ciseaux":"مقص","papier":"ورق","journal":"جريدة","boîte":"صندوق","bougie":"شمعة",
"intelligent":"ذكي","poli":"مهذب","courageux":"شجاع","honnête":"صادق","patient":"صبور","sympathique":"ودود","timide":"خجول","sérieux":"جاد","paresseux":"كسول","curieux":"فضولي","méchant":"شرير","sévère":"صارم",
"élève":"تلميذ","classe":"صف","leçon":"درس","examen":"امتحان","note":"علامة","erreur":"خطأ","cahier":"دفتر","mot":"كلمة","phrase":"جملة","langue":"لغة","dictionnaire":"قاموس","page":"صفحة","sac à dos":"حقيبة ظهر"
}
};
LANGS2.forEach(function(l){ var f2=LEX2F[l]||{}; Object.keys(f2).forEach(function(k){ LEX2[l][k]=f2[k]; }); });
/* Vague 7 des nouvelles langues (v2.76) : unités 49-56 — le temps libre, les sens, la grande
   famille, les mesures, à table encore, les métiers encore, le cœur encore, chez le médecin.
   48 → 56 unités. Anti-doublons : pl épaule=bark (bras=ramię), ru goûter=пробовать на вкус
   (essayer=пробовать), zh regarder=观看 (voir=看), espérer=盼望 (espoir=希望), sain=健康的 ;
   ja regarder=見つめます, sain=健康的 ; ko regarder=바라보다, invité=초대 손님 (client=손님).
   Homographes RÉELS assumés : uk чоловік = homme ET mari ; ko 쓰다 (+ amer) ; ar حار = chaud
   ET épicé ; ja 心配 = inquiet ET souci. */
var LEX2G = {
pl:{
"dessiner":"rysować","peindre":"malować","chanson":"piosenka","guitare":"gitara","piano":"pianino","marcher":"chodzić","promenade":"spacer","pêcher":"łowić ryby","fête":"impreza","invité":"gość",
"regarder":"patrzeć","écouter":"słuchać","entendre":"słyszeć","toucher":"dotykać","goûter":"smakować","voix":"głos","peau":"skóra","épaule":"bark","genou":"kolano","cou":"szyja","sourire":"uśmiech",
"oncle":"wujek","tante":"ciocia","cousin":"kuzyn","neveu":"bratanek","nièce":"bratanica","mari":"mąż","couple":"para","adulte":"dorosły","personne":"osoba",
"mètre":"metr","kilomètre":"kilometr","kilo":"kilogram","litre":"litr","moitié":"połowa","quart":"ćwierć","double":"podwójny","premier":"pierwszy","dernier":"ostatni","prochain":"następny",
"goût":"smak","délicieux":"pyszny","sucré":"słodki","salé":"słony","amer":"gorzki","épicé":"ostry","faim":"głód","soif":"pragnienie","boisson":"napój","morceau":"kawałek","tranche":"plasterek","c'est délicieux":"to jest pyszne","j'ai faim":"jestem głodny","j'ai soif":"chce mi się pić",
"métier":"zawód","usine":"fabryka","vendeur":"sprzedawca","infirmier":"pielęgniarz","pompier":"strażak","facteur":"listonosz","coiffeur":"fryzjer","dentiste":"dentysta","gagner":"wygrywać","perdre":"przegrywać",
"espoir":"nadzieja","joie":"radość","chance":"szczęście","rêve":"marzenie","espérer":"mieć nadzieję","colère":"gniew","honte":"wstyd","souci":"zmartwienie","embrasser":"całować","je rêve de voyager":"marzę o podróżach",
"rendez-vous":"wizyta","blessure":"rana","sang":"krew","tousser":"kaszleć","rhume":"przeziębienie","grippe":"grypa","urgence":"nagły wypadek","sain":"zdrowy"
},
ru:{
"dessiner":"рисовать","peindre":"рисовать красками","chanson":"песня","guitare":"гитара","piano":"пианино","marcher":"ходить","promenade":"прогулка","pêcher":"ловить рыбу","fête":"праздник","invité":"гость",
"regarder":"смотреть","écouter":"слушать","entendre":"слышать","toucher":"трогать","goûter":"пробовать на вкус","voix":"голос","peau":"кожа","épaule":"плечо","genou":"колено","cou":"шея","sourire":"улыбка",
"oncle":"дядя","tante":"тётя","cousin":"кузен","neveu":"племянник","nièce":"племянница","mari":"муж","couple":"пара","adulte":"взрослый","personne":"человек",
"mètre":"метр","kilomètre":"километр","kilo":"килограмм","litre":"литр","moitié":"половина","quart":"четверть","double":"двойной","premier":"первый","dernier":"последний","prochain":"следующий",
"goût":"вкус","délicieux":"вкусный","sucré":"сладкий","salé":"солёный","amer":"горький","épicé":"острый","faim":"голод","soif":"жажда","boisson":"напиток","morceau":"кусок","tranche":"ломтик","c'est délicieux":"это вкусно","j'ai faim":"я голоден","j'ai soif":"я хочу пить",
"métier":"профессия","usine":"завод","vendeur":"продавец","infirmier":"медбрат","pompier":"пожарный","facteur":"почтальон","coiffeur":"парикмахер","dentiste":"стоматолог","gagner":"выигрывать","perdre":"проигрывать",
"espoir":"надежда","joie":"радость","chance":"удача","rêve":"мечта","espérer":"надеяться","colère":"гнев","honte":"стыд","souci":"беспокойство","embrasser":"целовать","je rêve de voyager":"я мечтаю путешествовать",
"rendez-vous":"приём","blessure":"рана","sang":"кровь","tousser":"кашлять","rhume":"простуда","grippe":"грипп","urgence":"экстренный случай","sain":"здоровый"
},
uk:{
"dessiner":"малювати","peindre":"малювати фарбами","chanson":"пісня","guitare":"гітара","piano":"піаніно","marcher":"ходити","promenade":"прогулянка","pêcher":"ловити рибу","fête":"свято","invité":"гість",
"regarder":"дивитися","écouter":"слухати","entendre":"чути","toucher":"торкатися","goûter":"куштувати","voix":"голос","peau":"шкіра","épaule":"плече","genou":"коліно","cou":"шия","sourire":"усмішка",
"oncle":"дядько","tante":"тітка","cousin":"кузен","neveu":"племінник","nièce":"племінниця","mari":"чоловік","couple":"пара","adulte":"дорослий","personne":"людина",
"mètre":"метр","kilomètre":"кілометр","kilo":"кілограм","litre":"літр","moitié":"половина","quart":"чверть","double":"подвійний","premier":"перший","dernier":"останній","prochain":"наступний",
"goût":"смак","délicieux":"смачний","sucré":"солодкий","salé":"солоний","amer":"гіркий","épicé":"гострий","faim":"голод","soif":"спрага","boisson":"напій","morceau":"шматок","tranche":"скибка","c'est délicieux":"це смачно","j'ai faim":"я голодний","j'ai soif":"я хочу пити",
"métier":"професія","usine":"завод","vendeur":"продавець","infirmier":"медбрат","pompier":"пожежник","facteur":"листоноша","coiffeur":"перукар","dentiste":"стоматолог","gagner":"вигравати","perdre":"програвати",
"espoir":"надія","joie":"радість","chance":"удача","rêve":"мрія","espérer":"сподіватися","colère":"гнів","honte":"сором","souci":"турбота","embrasser":"цілувати","je rêve de voyager":"я мрію подорожувати",
"rendez-vous":"прийом","blessure":"рана","sang":"кров","tousser":"кашляти","rhume":"застуда","grippe":"грип","urgence":"невідкладний випадок","sain":"здоровий"
},
cs:{
"dessiner":"kreslit","peindre":"malovat","chanson":"píseň","guitare":"kytara","piano":"klavír","marcher":"chodit","promenade":"procházka","pêcher":"rybařit","fête":"oslava","invité":"host",
"regarder":"dívat se","écouter":"poslouchat","entendre":"slyšet","toucher":"dotýkat se","goûter":"ochutnávat","voix":"hlas","peau":"kůže","épaule":"rameno","genou":"koleno","cou":"krk","sourire":"úsměv",
"oncle":"strýc","tante":"teta","cousin":"bratranec","neveu":"synovec","nièce":"neteř","mari":"manžel","couple":"pár","adulte":"dospělý","personne":"osoba",
"mètre":"metr","kilomètre":"kilometr","kilo":"kilogram","litre":"litr","moitié":"polovina","quart":"čtvrtina","double":"dvojitý","premier":"první","dernier":"poslední","prochain":"příští",
"goût":"chuť","délicieux":"výborný","sucré":"sladký","salé":"slaný","amer":"hořký","épicé":"pálivý","faim":"hlad","soif":"žízeň","boisson":"nápoj","morceau":"kousek","tranche":"plátek","c'est délicieux":"to je výborné","j'ai faim":"mám hlad","j'ai soif":"mám žízeň",
"métier":"povolání","usine":"továrna","vendeur":"prodavač","infirmier":"zdravotník","pompier":"hasič","facteur":"pošťák","coiffeur":"kadeřník","dentiste":"zubař","gagner":"vyhrávat","perdre":"prohrávat",
"espoir":"naděje","joie":"radost","chance":"štěstí","rêve":"sen","espérer":"doufat","colère":"hněv","honte":"stud","souci":"starost","embrasser":"líbat","je rêve de voyager":"sním o cestování",
"rendez-vous":"termín","blessure":"rána","sang":"krev","tousser":"kašlat","rhume":"nachlazení","grippe":"chřipka","urgence":"pohotovost","sain":"zdravý"
},
zh:{
"dessiner":"画画","peindre":"绘画","chanson":"歌曲","guitare":"吉他","piano":"钢琴","marcher":"走路","promenade":"散步","pêcher":"钓鱼","fête":"聚会","invité":"客人",
"regarder":"观看","écouter":"听","entendre":"听见","toucher":"摸","goûter":"尝","voix":"声音","peau":"皮肤","épaule":"肩膀","genou":"膝盖","cou":"脖子","sourire":"微笑",
"oncle":"叔叔","tante":"阿姨","cousin":"表哥","neveu":"侄子","nièce":"侄女","mari":"丈夫","couple":"夫妻","adulte":"成年人","personne":"人",
"mètre":"米","kilomètre":"公里","kilo":"公斤","litre":"升","moitié":"一半","quart":"四分之一","double":"双倍","premier":"第一","dernier":"最后","prochain":"下一个",
"goût":"味道","délicieux":"好吃","sucré":"甜","salé":"咸","amer":"苦","épicé":"辣","faim":"饿","soif":"渴","boisson":"饮料","morceau":"块","tranche":"片","c'est délicieux":"很 好吃","j'ai faim":"我 饿 了","j'ai soif":"我 渴 了",
"métier":"职业","usine":"工厂","vendeur":"售货员","infirmier":"护士","pompier":"消防员","facteur":"邮递员","coiffeur":"理发师","dentiste":"牙医","gagner":"赢","perdre":"输",
"espoir":"希望","joie":"快乐","chance":"运气","rêve":"梦想","espérer":"盼望","colère":"愤怒","honte":"羞耻","souci":"烦恼","embrasser":"亲吻","je rêve de voyager":"我 梦想 去 旅行",
"rendez-vous":"预约","blessure":"伤口","sang":"血","tousser":"咳嗽","rhume":"感冒","grippe":"流感","urgence":"急诊","sain":"健康的"
},
ja:{
"dessiner":"絵を描きます","peindre":"塗ります","chanson":"歌","guitare":"ギター","piano":"ピアノ","marcher":"歩きます","promenade":"散歩","pêcher":"釣りをします","fête":"パーティー","invité":"ゲスト",
"regarder":"見つめます","écouter":"聞きます","entendre":"聞こえます","toucher":"触ります","goûter":"味わいます","voix":"声","peau":"肌","épaule":"肩","genou":"ひざ","cou":"首","sourire":"笑顔",
"oncle":"おじさん","tante":"おばさん","cousin":"いとこ","neveu":"おい","nièce":"めい","mari":"夫","couple":"カップル","adulte":"大人","personne":"人",
"mètre":"メートル","kilomètre":"キロメートル","kilo":"キロ","litre":"リットル","moitié":"半分","quart":"四分の一","double":"二倍","premier":"最初","dernier":"最後","prochain":"次",
"goût":"味","délicieux":"おいしい","sucré":"甘い","salé":"しょっぱい","amer":"苦い","épicé":"辛い","faim":"空腹","soif":"のどの渇き","boisson":"飲み物","morceau":"かけら","tranche":"一切れ","c'est délicieux":"おいしい です","j'ai faim":"おなか が すきました","j'ai soif":"のど が かわきました",
"métier":"職業","usine":"工場","vendeur":"店員","infirmier":"看護師","pompier":"消防士","facteur":"郵便配達員","coiffeur":"美容師","dentiste":"歯医者","gagner":"勝ちます","perdre":"負けます",
"espoir":"希望","joie":"喜び","chance":"運","rêve":"夢","espérer":"望みます","colère":"怒り","honte":"恥","souci":"心配","embrasser":"キスします","je rêve de voyager":"私 は 旅行 を 夢見ています",
"rendez-vous":"予約","blessure":"けが","sang":"血","tousser":"せきをします","rhume":"風邪","grippe":"インフルエンザ","urgence":"救急","sain":"健康的"
},
ko:{
"dessiner":"그리다","peindre":"칠하다","chanson":"노래","guitare":"기타","piano":"피아노","marcher":"걷다","promenade":"산책","pêcher":"낚시하다","fête":"파티","invité":"초대 손님",
"regarder":"바라보다","écouter":"듣다","entendre":"들리다","toucher":"만지다","goûter":"맛보다","voix":"목소리","peau":"피부","épaule":"어깨","genou":"무릎","cou":"목","sourire":"미소",
"oncle":"삼촌","tante":"이모","cousin":"사촌","neveu":"조카","nièce":"조카딸","mari":"남편","couple":"커플","adulte":"어른","personne":"사람",
"mètre":"미터","kilomètre":"킬로미터","kilo":"킬로그램","litre":"리터","moitié":"절반","quart":"사분의 일","double":"두 배","premier":"첫 번째","dernier":"마지막","prochain":"다음",
"goût":"맛","délicieux":"맛있다","sucré":"달다","salé":"짜다","amer":"쓰다","épicé":"맵다","faim":"배고픔","soif":"갈증","boisson":"음료","morceau":"조각","tranche":"얇은 조각","c'est délicieux":"맛있어요","j'ai faim":"배고파요","j'ai soif":"목말라요",
"métier":"직업","usine":"공장","vendeur":"판매원","infirmier":"간호사","pompier":"소방관","facteur":"우편집배원","coiffeur":"미용사","dentiste":"치과 의사","gagner":"이기다","perdre":"지다",
"espoir":"희망","joie":"기쁨","chance":"운","rêve":"꿈","espérer":"바라다","colère":"분노","honte":"부끄러움","souci":"걱정","embrasser":"키스하다","je rêve de voyager":"저는 여행하는 꿈을 꿔요",
"rendez-vous":"예약","blessure":"상처","sang":"피","tousser":"기침하다","rhume":"감기","grippe":"독감","urgence":"응급","sain":"건강하다"
},
ar:{
"dessiner":"يرسم","peindre":"يلون","chanson":"أغنية","guitare":"غيتار","piano":"بيانو","marcher":"يمشي","promenade":"نزهة","pêcher":"يصطاد","fête":"حفلة","invité":"ضيف",
"regarder":"ينظر","écouter":"يستمع","entendre":"يسمع","toucher":"يلمس","goûter":"يتذوق","voix":"صوت","peau":"جلد","épaule":"كتف","genou":"ركبة","cou":"رقبة","sourire":"ابتسامة",
"oncle":"عم","tante":"عمة","cousin":"ابن عم","neveu":"ابن أخ","nièce":"ابنة أخ","mari":"زوج","couple":"زوجان","adulte":"بالغ","personne":"شخص",
"mètre":"متر","kilomètre":"كيلومتر","kilo":"كيلوغرام","litre":"لتر","moitié":"نصف","quart":"ربع","double":"ضعف","premier":"أول","dernier":"أخير","prochain":"التالي",
"goût":"طعم","délicieux":"لذيذ","sucré":"حلو","salé":"مالح","amer":"مر","épicé":"حار","faim":"جوع","soif":"عطش","boisson":"مشروب","morceau":"قطعة","tranche":"شريحة","c'est délicieux":"هذا لذيذ","j'ai faim":"أنا جائع","j'ai soif":"أنا عطشان",
"métier":"مهنة","usine":"مصنع","vendeur":"بائع","infirmier":"ممرض","pompier":"رجل إطفاء","facteur":"ساعي البريد","coiffeur":"حلاق","dentiste":"طبيب أسنان","gagner":"يربح","perdre":"يخسر",
"espoir":"أمل","joie":"فرح","chance":"حظ","rêve":"حلم","espérer":"يأمل","colère":"غضب","honte":"خجل","souci":"هم","embrasser":"يقبّل","je rêve de voyager":"أحلم بالسفر",
"rendez-vous":"موعد","blessure":"جرح","sang":"دم","tousser":"يسعل","rhume":"زكام","grippe":"إنفلونزا","urgence":"طوارئ","sain":"معافى"
}
};
LANGS2.forEach(function(l){ var g2=LEX2G[l]||{}; Object.keys(g2).forEach(function(k){ LEX2[l][k]=g2[k]; }); });
/* Vague 8 des nouvelles langues (v2.77) : unités 57-64 — le numérique, le monde, parler
   couramment, bouger partout, bon appétit encore, l'argent malin, s'habiller encore, la routine
   du matin. 56 → 64 unités. Anti-doublons : zh allumer/éteindre=开机/关机, se coucher=上床睡觉,
   ranger=收拾 ; ru préparer=подготавливать (cuisiner=готовить), nettoyer=чистить (ranger=убирать) ;
   pl facture=faktura (addition=rachunek) ; ja se réveiller=目が覚めます (se lever=起きます) ;
   ko se coucher=잠자리에 들다 ; ar se coucher=يذهب للنوم, bonbon=سكاكر (dessert=حلوى).
   Homographes RÉELS assumés : ru мир = monde ET paix, курица = poule/poulet, счёт = compte/addition ;
   cs země = terre/pays, účet = compte/addition ; ja 寝ます = dormir/se coucher ; ko 쓰다 (+ dépenser). */
var LEX2H = {
pl:{
"imprimante":"drukarka","écouteurs":"słuchawki","appareil photo":"aparat fotograficzny","allumer":"włączać","éteindre":"wyłączać","fichier":"plik","site":"strona internetowa","réseau":"sieć","jeu vidéo":"gra wideo","télécharger":"pobierać",
"pays":"kraj","monde":"świat","capitale":"stolica","drapeau":"flaga","nord":"północ","sud":"południe","est":"wschód","ouest":"zachód","roi":"król","reine":"królowa","guerre":"wojna","paix":"pokój","mon pays est beau":"mój kraj jest piękny",
"je ne comprends pas":"nie rozumiem","pouvez-vous répéter":"czy może pan powtórzyć","je suis d'accord":"zgadzam się","ça ne fait rien":"nic nie szkodzi","bien sûr":"oczywiście","à bientôt":"do zobaczenia","bon appétit":"smacznego","félicitations":"gratulacje","bienvenue":"witamy","attention":"uwaga",
"entrer":"wchodzić","sortir":"wychodzić","monter":"iść w górę","descendre":"schodzić","rester":"zostawać","partir":"wyjeżdżać","tomber":"spadać","sauter":"skakać","voler":"latać","conduire":"prowadzić","arrêter":"zatrzymywać","revenir":"wracać","je reste à la maison":"zostaję w domu","le train part à huit heures":"pociąg odjeżdża o ósmej",
"poulet":"kurczak","jambon":"szynka","saucisse":"kiełbasa","pâtes":"makaron","frites":"frytki","champignon":"grzyb","miel":"miód","confiture":"dżem","yaourt":"jogurt","glace":"lody","chocolat":"czekolada","bonbon":"cukierek","biscuit":"herbatnik",
"compte":"konto","facture":"faktura","impôt":"podatek","loyer":"czynsz","pièce":"moneta","distributeur":"bankomat","économiser":"oszczędzać","dépenser":"wydawać","économies":"oszczędności","reçu":"paragon",
"jupe":"spódnica","pull":"sweter","veste":"kurtka","chaussettes":"skarpetki","gants":"rękawiczki","écharpe":"szalik","ceinture":"pasek","poche":"kieszeń","bouton":"guzik","taille":"rozmiar","mode":"moda",
"se réveiller":"budzić się","se lever":"wstawać","s'habiller":"ubierać się","réveil":"budzik","se dépêcher":"spieszyć się","se coucher":"kłaść się spać","préparer":"przygotowywać","nettoyer":"sprzątać","ranger":"porządkować","repasser":"prasować","je me lève à sept heures":"wstaję o siódmej"
},
ru:{
"imprimante":"принтер","écouteurs":"наушники","appareil photo":"фотоаппарат","allumer":"включать","éteindre":"выключать","fichier":"файл","site":"сайт","réseau":"сеть","jeu vidéo":"видеоигра","télécharger":"скачивать",
"pays":"страна","monde":"мир","capitale":"столица","drapeau":"флаг","nord":"север","sud":"юг","est":"восток","ouest":"запад","roi":"король","reine":"королева","guerre":"война","paix":"мир","mon pays est beau":"моя страна красивая",
"je ne comprends pas":"я не понимаю","pouvez-vous répéter":"повторите пожалуйста","je suis d'accord":"я согласен","ça ne fait rien":"ничего страшного","bien sûr":"конечно","à bientôt":"до скорого","bon appétit":"приятного аппетита","félicitations":"поздравляю","bienvenue":"добро пожаловать","attention":"осторожно",
"entrer":"входить","sortir":"выходить","monter":"подниматься","descendre":"спускаться","rester":"оставаться","partir":"уезжать","tomber":"падать","sauter":"прыгать","voler":"летать","conduire":"водить","arrêter":"останавливать","revenir":"возвращаться","je reste à la maison":"я остаюсь дома","le train part à huit heures":"поезд отправляется в восемь часов",
"poulet":"курица","jambon":"ветчина","saucisse":"колбаса","pâtes":"макароны","frites":"картофель фри","champignon":"гриб","miel":"мёд","confiture":"варенье","yaourt":"йогурт","glace":"мороженое","chocolat":"шоколад","bonbon":"конфета","biscuit":"печенье",
"compte":"счёт","facture":"квитанция","impôt":"налог","loyer":"арендная плата","pièce":"монета","distributeur":"банкомат","économiser":"экономить","dépenser":"тратить","économies":"сбережения","reçu":"чек",
"jupe":"юбка","pull":"свитер","veste":"куртка","chaussettes":"носки","gants":"перчатки","écharpe":"шарф","ceinture":"ремень","poche":"карман","bouton":"пуговица","taille":"размер","mode":"мода",
"se réveiller":"просыпаться","se lever":"вставать","s'habiller":"одеваться","réveil":"будильник","se dépêcher":"торопиться","se coucher":"ложиться спать","préparer":"подготавливать","nettoyer":"чистить","ranger":"убирать","repasser":"гладить","je me lève à sept heures":"я встаю в семь часов"
},
uk:{
"imprimante":"принтер","écouteurs":"навушники","appareil photo":"фотоапарат","allumer":"вмикати","éteindre":"вимикати","fichier":"файл","site":"сайт","réseau":"мережа","jeu vidéo":"відеогра","télécharger":"завантажувати",
"pays":"країна","monde":"світ","capitale":"столиця","drapeau":"прапор","nord":"північ","sud":"південь","est":"схід","ouest":"захід","roi":"король","reine":"королева","guerre":"війна","paix":"мир","mon pays est beau":"моя країна гарна",
"je ne comprends pas":"я не розумію","pouvez-vous répéter":"повторіть будь ласка","je suis d'accord":"я згоден","ça ne fait rien":"нічого страшного","bien sûr":"звичайно","à bientôt":"до зустрічі","bon appétit":"смачного","félicitations":"вітаю","bienvenue":"ласкаво просимо","attention":"обережно",
"entrer":"заходити","sortir":"виходити","monter":"підніматися","descendre":"спускатися","rester":"залишатися","partir":"від'їжджати","tomber":"падати","sauter":"стрибати","voler":"літати","conduire":"водити","arrêter":"зупиняти","revenir":"повертатися","je reste à la maison":"я залишаюся вдома","le train part à huit heures":"потяг відправляється о восьмій",
"poulet":"курка","jambon":"шинка","saucisse":"ковбаса","pâtes":"макарони","frites":"картопля фрі","champignon":"гриб","miel":"мед","confiture":"варення","yaourt":"йогурт","glace":"морозиво","chocolat":"шоколад","bonbon":"цукерка","biscuit":"печиво",
"compte":"рахунок","facture":"квитанція","impôt":"податок","loyer":"орендна плата","pièce":"монета","distributeur":"банкомат","économiser":"заощаджувати","dépenser":"витрачати","économies":"заощадження","reçu":"чек",
"jupe":"спідниця","pull":"светр","veste":"куртка","chaussettes":"шкарпетки","gants":"рукавички","écharpe":"шарф","ceinture":"ремінь","poche":"кишеня","bouton":"ґудзик","taille":"розмір","mode":"мода",
"se réveiller":"прокидатися","se lever":"вставати","s'habiller":"одягатися","réveil":"будильник","se dépêcher":"поспішати","se coucher":"лягати спати","préparer":"підготовувати","nettoyer":"чистити","ranger":"прибирати","repasser":"прасувати","je me lève à sept heures":"я встаю о сьомій"
},
cs:{
"imprimante":"tiskárna","écouteurs":"sluchátka","appareil photo":"fotoaparát","allumer":"zapnout","éteindre":"vypnout","fichier":"soubor","site":"webová stránka","réseau":"síť","jeu vidéo":"videohra","télécharger":"stáhnout",
"pays":"země","monde":"svět","capitale":"hlavní město","drapeau":"vlajka","nord":"sever","sud":"jih","est":"východ","ouest":"západ","roi":"král","reine":"královna","guerre":"válka","paix":"mír","mon pays est beau":"moje země je krásná",
"je ne comprends pas":"nerozumím","pouvez-vous répéter":"můžete to zopakovat","je suis d'accord":"souhlasím","ça ne fait rien":"to nevadí","bien sûr":"samozřejmě","à bientôt":"brzy na viděnou","bon appétit":"dobrou chuť","félicitations":"gratuluji","bienvenue":"vítejte","attention":"pozor",
"entrer":"vcházet","sortir":"vycházet","monter":"stoupat","descendre":"scházet","rester":"zůstávat","partir":"odjíždět","tomber":"padat","sauter":"skákat","voler":"létat","conduire":"řídit","arrêter":"zastavovat","revenir":"vracet se","je reste à la maison":"zůstávám doma","le train part à huit heures":"vlak odjíždí v osm hodin",
"poulet":"kuře","jambon":"šunka","saucisse":"klobása","pâtes":"těstoviny","frites":"hranolky","champignon":"houba","miel":"med","confiture":"džem","yaourt":"jogurt","glace":"zmrzlina","chocolat":"čokoláda","bonbon":"bonbón","biscuit":"sušenka",
"compte":"účet","facture":"faktura","impôt":"daň","loyer":"nájem","pièce":"mince","distributeur":"bankomat","économiser":"šetřit","dépenser":"utrácet","économies":"úspory","reçu":"účtenka",
"jupe":"sukně","pull":"svetr","veste":"bunda","chaussettes":"ponožky","gants":"rukavice","écharpe":"šála","ceinture":"pásek","poche":"kapsa","bouton":"knoflík","taille":"velikost","mode":"móda",
"se réveiller":"probouzet se","se lever":"vstávat","s'habiller":"oblékat se","réveil":"budík","se dépêcher":"spěchat","se coucher":"jít spát","préparer":"připravovat","nettoyer":"čistit","ranger":"uklízet","repasser":"žehlit","je me lève à sept heures":"vstávám v sedm hodin"
},
zh:{
"imprimante":"打印机","écouteurs":"耳机","appareil photo":"相机","allumer":"开机","éteindre":"关机","fichier":"文件","site":"网站","réseau":"网络","jeu vidéo":"电子游戏","télécharger":"下载",
"pays":"国家","monde":"世界","capitale":"首都","drapeau":"国旗","nord":"北","sud":"南","est":"东","ouest":"西","roi":"国王","reine":"王后","guerre":"战争","paix":"和平","mon pays est beau":"我 的 国家 很 美",
"je ne comprends pas":"我 不 明白","pouvez-vous répéter":"请 再 说 一遍","je suis d'accord":"我 同意","ça ne fait rien":"没关系","bien sûr":"当然","à bientôt":"回头见","bon appétit":"慢慢吃","félicitations":"恭喜","bienvenue":"欢迎","attention":"小心",
"entrer":"进","sortir":"出去","monter":"上去","descendre":"下去","rester":"留下","partir":"离开","tomber":"摔倒","sauter":"跳","voler":"飞","conduire":"开车","arrêter":"停","revenir":"回来","je reste à la maison":"我 留 在 家里","le train part à huit heures":"火车 八点 出发",
"poulet":"鸡肉","jambon":"火腿","saucisse":"香肠","pâtes":"意大利面","frites":"薯条","champignon":"蘑菇","miel":"蜂蜜","confiture":"果酱","yaourt":"酸奶","glace":"冰淇淋","chocolat":"巧克力","bonbon":"糖果","biscuit":"饼干",
"compte":"账户","facture":"发票","impôt":"税","loyer":"房租","pièce":"硬币","distributeur":"取款机","économiser":"存钱","dépenser":"花钱","économies":"积蓄","reçu":"收据",
"jupe":"裙子","pull":"毛衣","veste":"夹克","chaussettes":"袜子","gants":"手套","écharpe":"围巾","ceinture":"腰带","poche":"口袋","bouton":"扣子","taille":"尺寸","mode":"时尚",
"se réveiller":"醒来","se lever":"起床","s'habiller":"穿衣服","réveil":"闹钟","se dépêcher":"赶时间","se coucher":"上床睡觉","préparer":"准备","nettoyer":"打扫","ranger":"收拾","repasser":"熨衣服","je me lève à sept heures":"我 七点 起床"
},
ja:{
"imprimante":"プリンター","écouteurs":"イヤホン","appareil photo":"カメラ","allumer":"つけます","éteindre":"消します","fichier":"ファイル","site":"ウェブサイト","réseau":"ネットワーク","jeu vidéo":"テレビゲーム","télécharger":"ダウンロードします",
"pays":"国","monde":"世界","capitale":"首都","drapeau":"国旗","nord":"北","sud":"南","est":"東","ouest":"西","roi":"王様","reine":"女王","guerre":"戦争","paix":"平和","mon pays est beau":"私 の 国 は 美しい です",
"je ne comprends pas":"わかりません","pouvez-vous répéter":"もう一度 言ってください","je suis d'accord":"賛成 です","ça ne fait rien":"大丈夫 です","bien sûr":"もちろん","à bientôt":"また ね","bon appétit":"いただきます","félicitations":"おめでとう","bienvenue":"ようこそ","attention":"気をつけて",
"entrer":"入ります","sortir":"出ます","monter":"上がります","descendre":"下ります","rester":"残ります","partir":"出発します","tomber":"転びます","sauter":"跳びます","voler":"飛びます","conduire":"運転します","arrêter":"止めます","revenir":"戻ります","je reste à la maison":"私 は 家 に います","le train part à huit heures":"電車 は 八時 に 出発します",
"poulet":"鶏肉","jambon":"ハム","saucisse":"ソーセージ","pâtes":"パスタ","frites":"フライドポテト","champignon":"きのこ","miel":"はちみつ","confiture":"ジャム","yaourt":"ヨーグルト","glace":"アイスクリーム","chocolat":"チョコレート","bonbon":"あめ","biscuit":"クッキー",
"compte":"口座","facture":"請求書","impôt":"税金","loyer":"家賃","pièce":"硬貨","distributeur":"ATM","économiser":"貯金します","dépenser":"使います","économies":"貯金","reçu":"レシート",
"jupe":"スカート","pull":"セーター","veste":"ジャケット","chaussettes":"靴下","gants":"手袋","écharpe":"マフラー","ceinture":"ベルト","poche":"ポケット","bouton":"ボタン","taille":"サイズ","mode":"ファッション",
"se réveiller":"目が覚めます","se lever":"起きます","s'habiller":"着替えます","réveil":"目覚まし時計","se dépêcher":"急ぎます","se coucher":"寝ます","préparer":"準備します","nettoyer":"掃除します","ranger":"片付けます","repasser":"アイロンをかけます","je me lève à sept heures":"私 は 七時 に 起きます"
},
ko:{
"imprimante":"프린터","écouteurs":"이어폰","appareil photo":"카메라","allumer":"켜다","éteindre":"끄다","fichier":"파일","site":"웹사이트","réseau":"네트워크","jeu vidéo":"비디오 게임","télécharger":"다운로드하다",
"pays":"나라","monde":"세계","capitale":"수도","drapeau":"국기","nord":"북쪽","sud":"남쪽","est":"동쪽","ouest":"서쪽","roi":"왕","reine":"여왕","guerre":"전쟁","paix":"평화","mon pays est beau":"우리 나라는 아름다워요",
"je ne comprends pas":"이해가 안 돼요","pouvez-vous répéter":"다시 말해 주세요","je suis d'accord":"동의해요","ça ne fait rien":"괜찮아요","bien sûr":"물론이죠","à bientôt":"또 봐요","bon appétit":"맛있게 드세요","félicitations":"축하해요","bienvenue":"환영해요","attention":"조심하세요",
"entrer":"들어가다","sortir":"나가다","monter":"올라가다","descendre":"내려가다","rester":"머무르다","partir":"떠나다","tomber":"넘어지다","sauter":"뛰다","voler":"날다","conduire":"운전하다","arrêter":"멈추다","revenir":"돌아오다","je reste à la maison":"저는 집에 있어요","le train part à huit heures":"기차는 여덟 시에 출발해요",
"poulet":"닭고기","jambon":"햄","saucisse":"소시지","pâtes":"파스타","frites":"감자튀김","champignon":"버섯","miel":"꿀","confiture":"잼","yaourt":"요구르트","glace":"아이스크림","chocolat":"초콜릿","bonbon":"사탕","biscuit":"쿠키",
"compte":"계좌","facture":"청구서","impôt":"세금","loyer":"집세","pièce":"동전","distributeur":"현금 인출기","économiser":"저축하다","dépenser":"쓰다","économies":"저축","reçu":"영수증",
"jupe":"치마","pull":"스웨터","veste":"재킷","chaussettes":"양말","gants":"장갑","écharpe":"목도리","ceinture":"벨트","poche":"주머니","bouton":"단추","taille":"사이즈","mode":"패션",
"se réveiller":"깨다","se lever":"일어나다","s'habiller":"옷을 입다","réveil":"알람 시계","se dépêcher":"서두르다","se coucher":"잠자리에 들다","préparer":"준비하다","nettoyer":"청소하다","ranger":"정리하다","repasser":"다림질하다","je me lève à sept heures":"저는 일곱 시에 일어나요"
},
ar:{
"imprimante":"طابعة","écouteurs":"سماعات","appareil photo":"كاميرا","allumer":"يشغل","éteindre":"يطفئ","fichier":"ملف","site":"موقع إلكتروني","réseau":"شبكة","jeu vidéo":"لعبة فيديو","télécharger":"يحمل",
"pays":"بلد","monde":"عالم","capitale":"عاصمة","drapeau":"علم","nord":"شمال","sud":"جنوب","est":"شرق","ouest":"غرب","roi":"ملك","reine":"ملكة","guerre":"حرب","paix":"سلام","mon pays est beau":"بلدي جميل",
"je ne comprends pas":"لا أفهم","pouvez-vous répéter":"هل يمكنك أن تكرر","je suis d'accord":"أنا موافق","ça ne fait rien":"لا بأس","bien sûr":"بالطبع","à bientôt":"إلى اللقاء","bon appétit":"بالهناء والشفاء","félicitations":"مبروك","bienvenue":"أهلا وسهلا","attention":"انتبه",
"entrer":"يدخل","sortir":"يخرج","monter":"يصعد","descendre":"ينزل","rester":"يبقى","partir":"يغادر","tomber":"يسقط","sauter":"يقفز","voler":"يطير","conduire":"يقود","arrêter":"يوقف","revenir":"يعود","je reste à la maison":"أبقى في البيت","le train part à huit heures":"يغادر القطار في الساعة الثامنة",
"poulet":"دجاج","jambon":"جامبون","saucisse":"نقانق","pâtes":"معكرونة","frites":"بطاطس مقلية","champignon":"فطر","miel":"عسل","confiture":"مربى","yaourt":"زبادي","glace":"آيس كريم","chocolat":"شوكولاتة","bonbon":"سكاكر","biscuit":"بسكويت",
"compte":"حساب","facture":"فاتورة","impôt":"ضريبة","loyer":"إيجار","pièce":"عملة معدنية","distributeur":"صراف آلي","économiser":"يوفر","dépenser":"ينفق","économies":"مدخرات","reçu":"إيصال",
"jupe":"تنورة","pull":"كنزة","veste":"سترة","chaussettes":"جوارب","gants":"قفازات","écharpe":"وشاح","ceinture":"حزام","poche":"جيب","bouton":"زر","taille":"مقاس","mode":"موضة",
"se réveiller":"يستيقظ","se lever":"ينهض","s'habiller":"يلبس","réveil":"منبه","se dépêcher":"يستعجل","se coucher":"يذهب للنوم","préparer":"يحضر","nettoyer":"ينظف","ranger":"يرتب","repasser":"يكوي","je me lève à sept heures":"أنهض في الساعة السابعة"
}
};
LANGS2.forEach(function(l){ var h2=LEX2H[l]||{}; Object.keys(h2).forEach(function(k){ LEX2[l][k]=h2[k]; }); });
/* ── Vague 9 nouvelles langues (v2.78) : unités 65-72 — la vie qui passe, décrire le
   monde, petits mots 2, raconter, la planète, les fêtes, vrai ou faux, sur la route.
   Anti-collisions vérifiées : pl ancien=dawny (stary=vieux) ; ru ancien=старинный
   (старый=vieux), tout de suite=немедленно (сейчас=maintenant), d'accord=ладно ;
   uk jour férié=святковий день (свято=fête) ; cs ancien=starobylý (starý=vieux),
   feu rouge=červená (fém., ≠ červený=rouge) ; ja ancien=昔の (古い=vieux),
   intéressant=興味深い (面白い=drôle), raconter=語ります (話します=parler) ;
   ar silencieux=صامت (هادئ=calme), Noël=عيد الميلاد المجيد (≠ عيد ميلاد=anniversaire).
   Homographe réel assumé : ja 高い = cher ET haut (takai, seul mot naturel). */
var LEX2I = {
pl:{
"naître":"rodzić się","grandir":"dorastać","mourir":"umierać","vie":"życie","mort":"śmierć","âge":"wiek","anniversaire":"urodziny","mariage":"ślub","naissance":"narodziny","enfance":"dzieciństwo","joyeux anniversaire":"wszystkiego najlepszego","la vie est belle":"życie jest piękne","avenir":"przyszłość","passé":"przeszłość","souvenir":"wspomnienie",
"clair":"jasny","foncé":"ciemny","mouillé":"mokry","sec":"suchy","doux":"miękki","dur":"twardy","profond":"głęboki","haut":"wysoki","bas":"niski","moderne":"nowoczesny","ancien":"dawny","bruyant":"hałaśliwy","silencieux":"cichy","bruit":"hałas","ennuyeux":"nudny","intéressant":"ciekawy","célèbre":"sławny",
"lequel":"który","quelque part":"gdzieś","nulle part":"nigdzie","ensemble":"razem","seulement":"tylko","d'accord":"zgoda","vraiment":"naprawdę","déjà":"już","presque":"prawie","ensuite":"następnie","enfin":"nareszcie","tout de suite":"natychmiast",
"raconter":"opowiadać","décrire":"opisywać","répéter":"powtarzać","traduire":"tłumaczyć","signifier":"znaczyć","histoire":"historia","promettre":"obiecywać","mentir":"kłamać","crier":"krzyczeć","remercier":"dziękować","inviter":"zapraszać","souhaiter":"życzyć",
"environnement":"środowisko","pollution":"zanieczyszczenie","déchets":"śmieci","recycler":"poddawać recyklingowi","protéger":"chronić","énergie":"energia","planète":"planeta","climat":"klimat","nature":"przyroda","air":"powietrze","sauvage":"dziki","animal":"zwierzę","paysage":"krajobraz","lumière":"światło",
"Noël":"Boże Narodzenie","Pâques":"Wielkanoc","nouvel an":"Nowy Rok","week-end":"weekend","jour férié":"święto","surprise":"niespodzianka","ballon":"balon","feu d'artifice":"fajerwerki","invitation":"zaproszenie","carnaval":"karnawał",
"vrai":"prawdziwy","faux":"fałszywy","possible":"możliwy","impossible":"niemożliwy","je suis prêt":"jestem gotowy","utile":"przydatny","prêt":"gotowy","occupé":"zajęty","libre":"wolny",
"permis":"prawo jazdy","essence":"benzyna","station-service":"stacja benzynowa","se garer":"parkować","vitesse":"prędkość","il y a trop de circulation":"jest za duży ruch","feu rouge":"czerwone światło","carrefour":"skrzyżowanie","autoroute":"autostrada","circulation":"ruch uliczny","accident":"wypadek"
},
ru:{
"naître":"рождаться","grandir":"расти","mourir":"умирать","vie":"жизнь","mort":"смерть","âge":"возраст","anniversaire":"день рождения","mariage":"свадьба","naissance":"рождение","enfance":"детство","joyeux anniversaire":"с днём рождения","la vie est belle":"жизнь прекрасна","avenir":"будущее","passé":"прошлое","souvenir":"воспоминание",
"clair":"светлый","foncé":"тёмный","mouillé":"мокрый","sec":"сухой","doux":"мягкий","dur":"твёрдый","profond":"глубокий","haut":"высокий","bas":"низкий","moderne":"современный","ancien":"старинный","bruyant":"шумный","silencieux":"тихий","bruit":"шум","ennuyeux":"скучный","intéressant":"интересный","célèbre":"известный",
"lequel":"который","quelque part":"где-то","nulle part":"нигде","ensemble":"вместе","seulement":"только","d'accord":"ладно","vraiment":"действительно","déjà":"уже","presque":"почти","ensuite":"затем","enfin":"наконец","tout de suite":"немедленно",
"raconter":"рассказывать","décrire":"описывать","répéter":"повторять","traduire":"переводить","signifier":"означать","histoire":"история","promettre":"обещать","mentir":"врать","crier":"кричать","remercier":"благодарить","inviter":"приглашать","souhaiter":"желать",
"environnement":"окружающая среда","pollution":"загрязнение","déchets":"мусор","recycler":"перерабатывать","protéger":"защищать","énergie":"энергия","planète":"планета","climat":"климат","nature":"природа","air":"воздух","sauvage":"дикий","animal":"животное","paysage":"пейзаж","lumière":"свет",
"Noël":"Рождество","Pâques":"Пасха","nouvel an":"Новый год","week-end":"выходные","jour férié":"праздничный день","surprise":"сюрприз","ballon":"воздушный шар","feu d'artifice":"фейерверк","invitation":"приглашение","carnaval":"карнавал",
"vrai":"настоящий","faux":"ложный","possible":"возможный","impossible":"невозможный","je suis prêt":"я готов","utile":"полезный","prêt":"готовый","occupé":"занятый","libre":"свободный",
"permis":"водительские права","essence":"бензин","station-service":"заправка","se garer":"парковаться","vitesse":"скорость","il y a trop de circulation":"слишком много машин","feu rouge":"красный свет","carrefour":"перекрёсток","autoroute":"шоссе","circulation":"движение","accident":"авария"
},
uk:{
"naître":"народжуватися","grandir":"рости","mourir":"помирати","vie":"життя","mort":"смерть","âge":"вік","anniversaire":"день народження","mariage":"весілля","naissance":"народження","enfance":"дитинство","joyeux anniversaire":"з днем народження","la vie est belle":"життя прекрасне","avenir":"майбутнє","passé":"минуле","souvenir":"спогад",
"clair":"світлий","foncé":"темний","mouillé":"мокрий","sec":"сухий","doux":"м'який","dur":"твердий","profond":"глибокий","haut":"високий","bas":"низький","moderne":"сучасний","ancien":"давній","bruyant":"гучний","silencieux":"тихий","bruit":"шум","ennuyeux":"нудний","intéressant":"цікавий","célèbre":"відомий",
"lequel":"котрий","quelque part":"десь","nulle part":"ніде","ensemble":"разом","seulement":"тільки","d'accord":"гаразд","vraiment":"справді","déjà":"вже","presque":"майже","ensuite":"потім","enfin":"нарешті","tout de suite":"негайно",
"raconter":"розповідати","décrire":"описувати","répéter":"повторювати","traduire":"перекладати","signifier":"означати","histoire":"історія","promettre":"обіцяти","mentir":"брехати","crier":"кричати","remercier":"дякувати","inviter":"запрошувати","souhaiter":"бажати",
"environnement":"довкілля","pollution":"забруднення","déchets":"сміття","recycler":"переробляти","protéger":"захищати","énergie":"енергія","planète":"планета","climat":"клімат","nature":"природа","air":"повітря","sauvage":"дикий","animal":"тварина","paysage":"краєвид","lumière":"світло",
"Noël":"Різдво","Pâques":"Великдень","nouvel an":"Новий рік","week-end":"вихідні","jour férié":"святковий день","surprise":"сюрприз","ballon":"повітряна кулька","feu d'artifice":"феєрверк","invitation":"запрошення","carnaval":"карнавал",
"vrai":"правдивий","faux":"хибний","possible":"можливий","impossible":"неможливий","je suis prêt":"я готовий","utile":"корисний","prêt":"готовий","occupé":"зайнятий","libre":"вільний",
"permis":"водійські права","essence":"бензин","station-service":"заправка","se garer":"паркуватися","vitesse":"швидкість","il y a trop de circulation":"забагато машин","feu rouge":"червоне світло","carrefour":"перехрестя","autoroute":"автомагістраль","circulation":"дорожній рух","accident":"аварія"
},
cs:{
"naître":"narodit se","grandir":"vyrůstat","mourir":"umírat","vie":"život","mort":"smrt","âge":"věk","anniversaire":"narozeniny","mariage":"svatba","naissance":"narození","enfance":"dětství","joyeux anniversaire":"všechno nejlepší","la vie est belle":"život je krásný","avenir":"budoucnost","passé":"minulost","souvenir":"vzpomínka",
"clair":"světlý","foncé":"tmavý","mouillé":"mokrý","sec":"suchý","doux":"měkký","dur":"tvrdý","profond":"hluboký","haut":"vysoký","bas":"nízký","moderne":"moderní","ancien":"starobylý","bruyant":"hlučný","silencieux":"tichý","bruit":"hluk","ennuyeux":"nudný","intéressant":"zajímavý","célèbre":"slavný",
"lequel":"který","quelque part":"někde","nulle part":"nikde","ensemble":"spolu","seulement":"jenom","d'accord":"dobře","vraiment":"opravdu","déjà":"už","presque":"skoro","ensuite":"potom","enfin":"konečně","tout de suite":"hned",
"raconter":"vyprávět","décrire":"popisovat","répéter":"opakovat","traduire":"překládat","signifier":"znamenat","histoire":"příběh","promettre":"slibovat","mentir":"lhát","crier":"křičet","remercier":"děkovat","inviter":"zvát","souhaiter":"přát",
"environnement":"životní prostředí","pollution":"znečištění","déchets":"odpadky","recycler":"recyklovat","protéger":"chránit","énergie":"energie","planète":"planeta","climat":"podnebí","nature":"příroda","air":"vzduch","sauvage":"divoký","animal":"zvíře","paysage":"krajina","lumière":"světlo",
"Noël":"Vánoce","Pâques":"Velikonoce","nouvel an":"Nový rok","week-end":"víkend","jour férié":"svátek","surprise":"překvapení","ballon":"balónek","feu d'artifice":"ohňostroj","invitation":"pozvánka","carnaval":"karneval",
"vrai":"pravdivý","faux":"falešný","possible":"možný","impossible":"nemožný","je suis prêt":"jsem připraven","utile":"užitečný","prêt":"připravený","occupé":"zaneprázdněný","libre":"volný",
"permis":"řidičský průkaz","essence":"benzín","station-service":"čerpací stanice","se garer":"parkovat","vitesse":"rychlost","il y a trop de circulation":"je moc velký provoz","feu rouge":"červená","carrefour":"křižovatka","autoroute":"dálnice","circulation":"provoz","accident":"nehoda"
},
zh:{
"naître":"出生","grandir":"长大","mourir":"死","vie":"生活","mort":"死亡","âge":"年龄","anniversaire":"生日","mariage":"婚礼","naissance":"诞生","enfance":"童年","joyeux anniversaire":"生日 快乐","la vie est belle":"生活 真 美好","avenir":"未来","passé":"过去","souvenir":"回忆",
"clair":"明亮的","foncé":"深色的","mouillé":"湿的","sec":"干的","doux":"柔软的","dur":"硬的","profond":"深的","haut":"高的","bas":"低的","moderne":"现代的","ancien":"古老的","bruyant":"吵闹的","silencieux":"安静的","bruit":"噪音","ennuyeux":"无聊的","intéressant":"有趣的","célèbre":"有名的",
"lequel":"哪一个","quelque part":"某个地方","nulle part":"哪里都不","ensemble":"一起","seulement":"只","d'accord":"好的","vraiment":"确实","déjà":"已经","presque":"几乎","ensuite":"然后","enfin":"终于","tout de suite":"马上",
"raconter":"讲述","décrire":"描述","répéter":"重复","traduire":"翻译","signifier":"意思是","histoire":"故事","promettre":"承诺","mentir":"说谎","crier":"喊叫","remercier":"感谢","inviter":"邀请","souhaiter":"祝愿",
"environnement":"环境","pollution":"污染","déchets":"垃圾","recycler":"回收","protéger":"保护","énergie":"能源","planète":"行星","climat":"气候","nature":"大自然","air":"空气","sauvage":"野生的","animal":"动物","paysage":"风景","lumière":"光",
"Noël":"圣诞节","Pâques":"复活节","nouvel an":"新年","week-end":"周末","jour férié":"法定假日","surprise":"惊喜","ballon":"气球","feu d'artifice":"烟花","invitation":"邀请函","carnaval":"狂欢节",
"vrai":"真的","faux":"假的","possible":"可能的","impossible":"不可能的","je suis prêt":"我 准备好了","utile":"有用的","prêt":"准备好的","occupé":"忙碌的","libre":"有空的",
"permis":"驾照","essence":"汽油","station-service":"加油站","se garer":"停车","vitesse":"速度","il y a trop de circulation":"路上 车 太多了","feu rouge":"红灯","carrefour":"十字路口","autoroute":"高速公路","circulation":"交通","accident":"事故"
},
ja:{
"naître":"生まれます","grandir":"育ちます","mourir":"死にます","vie":"人生","mort":"死","âge":"年齢","anniversaire":"誕生日","mariage":"結婚式","naissance":"誕生","enfance":"子供時代","joyeux anniversaire":"お誕生日 おめでとう","la vie est belle":"人生 は 美しい です","avenir":"未来","passé":"過去","souvenir":"思い出",
"clair":"明るい","foncé":"暗い","mouillé":"濡れた","sec":"乾いた","doux":"柔らかい","dur":"硬い","profond":"深い","haut":"高い","bas":"低い","moderne":"現代的な","ancien":"昔の","bruyant":"うるさい","silencieux":"静かな","bruit":"騒音","ennuyeux":"退屈な","intéressant":"興味深い","célèbre":"有名な",
"lequel":"どれ","quelque part":"どこかに","nulle part":"どこにも","ensemble":"一緒に","seulement":"だけ","d'accord":"分かりました","vraiment":"本当に","déjà":"もう","presque":"ほとんど","ensuite":"それから","enfin":"やっと","tout de suite":"すぐに",
"raconter":"語ります","décrire":"描写します","répéter":"繰り返します","traduire":"翻訳します","signifier":"意味します","histoire":"物語","promettre":"約束します","mentir":"嘘をつきます","crier":"叫びます","remercier":"感謝します","inviter":"招待します","souhaiter":"願います",
"environnement":"環境","pollution":"汚染","déchets":"ゴミ","recycler":"リサイクルします","protéger":"守ります","énergie":"エネルギー","planète":"惑星","climat":"気候","nature":"自然","air":"空気","sauvage":"野生の","animal":"動物","paysage":"景色","lumière":"光",
"Noël":"クリスマス","Pâques":"イースター","nouvel an":"お正月","week-end":"週末","jour férié":"祝日","surprise":"サプライズ","ballon":"風船","feu d'artifice":"花火","invitation":"招待状","carnaval":"カーニバル",
"vrai":"本当の","faux":"偽の","possible":"可能な","impossible":"不可能な","je suis prêt":"準備 が できました","utile":"役に立つ","prêt":"準備ができた","occupé":"忙しい","libre":"暇な",
"permis":"運転免許","essence":"ガソリン","station-service":"ガソリンスタンド","se garer":"駐車します","vitesse":"スピード","il y a trop de circulation":"交通量 が 多い です","feu rouge":"赤信号","carrefour":"交差点","autoroute":"高速道路","circulation":"交通量","accident":"事故"
},
ko:{
"naître":"태어나다","grandir":"자라다","mourir":"죽다","vie":"인생","mort":"죽음","âge":"나이","anniversaire":"생일","mariage":"결혼식","naissance":"탄생","enfance":"어린 시절","joyeux anniversaire":"생일 축하해요","la vie est belle":"인생은 아름다워요","avenir":"미래","passé":"과거","souvenir":"추억",
"clair":"밝은","foncé":"어두운","mouillé":"젖은","sec":"마른","doux":"부드러운","dur":"딱딱한","profond":"깊은","haut":"높은","bas":"낮은","moderne":"현대적인","ancien":"오래된","bruyant":"시끄러운","silencieux":"조용한","bruit":"소음","ennuyeux":"지루한","intéressant":"흥미로운","célèbre":"유명한",
"lequel":"어느 것","quelque part":"어딘가에","nulle part":"아무 데도","ensemble":"함께","seulement":"오직","d'accord":"알겠어요","vraiment":"정말","déjà":"이미","presque":"거의","ensuite":"그다음에","enfin":"마침내","tout de suite":"바로",
"raconter":"들려주다","décrire":"묘사하다","répéter":"반복하다","traduire":"번역하다","signifier":"의미하다","histoire":"이야기","promettre":"약속하다","mentir":"거짓말하다","crier":"소리치다","remercier":"감사하다","inviter":"초대하다","souhaiter":"빌다",
"environnement":"환경","pollution":"오염","déchets":"쓰레기","recycler":"재활용하다","protéger":"보호하다","énergie":"에너지","planète":"행성","climat":"기후","nature":"자연","air":"공기","sauvage":"야생의","animal":"동물","paysage":"경치","lumière":"빛",
"Noël":"크리스마스","Pâques":"부활절","nouvel an":"새해","week-end":"주말","jour férié":"공휴일","surprise":"서프라이즈","ballon":"풍선","feu d'artifice":"불꽃놀이","invitation":"초대장","carnaval":"카니발",
"vrai":"진짜","faux":"가짜","possible":"가능한","impossible":"불가능한","je suis prêt":"준비됐어요","utile":"유용한","prêt":"준비된","occupé":"바쁜","libre":"한가한",
"permis":"운전면허","essence":"휘발유","station-service":"주유소","se garer":"주차하다","vitesse":"속도","il y a trop de circulation":"차가 너무 많아요","feu rouge":"빨간불","carrefour":"교차로","autoroute":"고속도로","circulation":"교통","accident":"사고"
},
ar:{
"naître":"يولد","grandir":"يكبر","mourir":"يموت","vie":"حياة","mort":"موت","âge":"عمر","anniversaire":"عيد ميلاد","mariage":"زفاف","naissance":"ولادة","enfance":"طفولة","joyeux anniversaire":"عيد ميلاد سعيد","la vie est belle":"الحياة جميلة","avenir":"مستقبل","passé":"ماضٍ","souvenir":"ذكرى",
"clair":"فاتح","foncé":"داكن","mouillé":"مبلل","sec":"جاف","doux":"ناعم","dur":"صلب","profond":"عميق","haut":"عالٍ","bas":"منخفض","moderne":"حديث","ancien":"قديم","bruyant":"صاخب","silencieux":"صامت","bruit":"ضجيج","ennuyeux":"ممل","intéressant":"مثير للاهتمام","célèbre":"مشهور",
"lequel":"أيهما","quelque part":"في مكان ما","nulle part":"لا مكان","ensemble":"معًا","seulement":"فقط","d'accord":"حسنًا","vraiment":"حقًا","déjà":"بالفعل","presque":"تقريبًا","ensuite":"بعد ذلك","enfin":"أخيرًا","tout de suite":"فورًا",
"raconter":"يروي","décrire":"يصف","répéter":"يكرر","traduire":"يترجم","signifier":"يعني","histoire":"قصة","promettre":"يعد","mentir":"يكذب","crier":"يصرخ","remercier":"يشكر","inviter":"يدعو","souhaiter":"يتمنى",
"environnement":"بيئة","pollution":"تلوث","déchets":"نفايات","recycler":"يعيد التدوير","protéger":"يحمي","énergie":"طاقة","planète":"كوكب","climat":"مناخ","nature":"طبيعة","air":"هواء","sauvage":"بري","animal":"حيوان","paysage":"منظر طبيعي","lumière":"ضوء",
"Noël":"عيد الميلاد المجيد","Pâques":"عيد الفصح","nouvel an":"رأس السنة","week-end":"عطلة نهاية الأسبوع","jour férié":"عطلة رسمية","surprise":"مفاجأة","ballon":"بالون","feu d'artifice":"ألعاب نارية","invitation":"دعوة","carnaval":"كرنفال",
"vrai":"صحيح","faux":"خاطئ","possible":"ممكن","impossible":"مستحيل","je suis prêt":"أنا جاهز","utile":"مفيد","prêt":"جاهز","occupé":"مشغول","libre":"متفرغ",
"permis":"رخصة قيادة","essence":"بنزين","station-service":"محطة وقود","se garer":"يركن السيارة","vitesse":"سرعة","il y a trop de circulation":"هناك ازدحام شديد","feu rouge":"إشارة حمراء","carrefour":"تقاطع","autoroute":"طريق سريع","circulation":"حركة المرور","accident":"حادث"
}
};
LANGS2.forEach(function(l){ var i2=LEX2I[l]||{}; Object.keys(i2).forEach(function(k){ LEX2[l][k]=i2[k]; }); });
/* ── Vague 10 nouvelles langues (v2.79) : unités 73-80 — émotions fines, météo fine,
   cuisine du chef, le logement, le corps en action, au magasin, les études, le temps précis.
   Anti-collisions vérifiées : pl bouillir=wrzeć (gotować=cuisiner), tempête=sztorm
   (burza=orage), satisfait=usatysfakcjonowany (zadowolony=content), cours=zajęcia
   (lekcja=leçon), échouer=oblać (przegrywać=perdre), siècle=stulecie (wiek=âge) ;
   ru depuis=с тех пор (с=avec), satisfait=удовлетворённый (довольный=content),
   étudier=изучать (учиться=apprendre), cours=занятие (урок=leçon), tempête=буря
   (гроза=orage) ; uk grimper=лізти (підніматися=monter), depuis=відтоді (з=avec),
   satisfait=вдоволений (задоволений=content), cours=заняття (урок=leçon) ;
   cs bouillir=vřít (vařit=cuisiner), cours=přednáška (hodina=heure), satisfait=uspokojený
   (spokojený=content), tempête=bouře (bouřka=orage) ; zh étudier=读书 (学习=apprendre),
   tenir=握住 (拿=prendre), cours=课程 (课=leçon), grimper=爬 (上去=monter) ;
   ja promotion=特売 (セール=soldes), grimper=登ります (上がります=monter), pendant=〜の間
   (間=entre) ; ko grimper=오르다 (올라가다=monter), détendu=느긋한 ; ar tempête=عاصفة شديدة
   (عاصفة=orage), tiroir=دُرج (درج=escalier), attraper=يمسك / tenir=يحمل.
   Homographes réels assumés : pl południe=sud+midi, północ=nord+minuit, uk північ=nord+minuit (mots slaves
   uniques, pas d'alternative) ; ar يدفع=payer ET pousser (dafaʿa, seul verbe naturel). */
var LEX2J = {
pl:{
"nerveux":"zdenerwowany","déçu":"rozczarowany","jaloux":"zazdrosny","stressé":"zestresowany","détendu":"zrelaksowany","ému":"wzruszony","satisfait":"usatysfakcjonowany","reconnaissant":"wdzięczny",
"brouillard":"mgła","éclair":"błyskawica","tonnerre":"grzmot","arc-en-ciel":"tęcza","tempête":"sztorm","quel temps fait-il":"jaka jest pogoda","gel":"mróz","degré":"stopień","prévisions":"prognoza","humide":"wilgotny","sécheresse":"susza",
"bouillir":"wrzeć","frire":"smażyć","griller":"grillować","mélanger":"mieszać","couper":"kroić","verser":"nalewać","casserole":"garnek","poêle":"patelnia","plateau":"taca","nappe":"obrus","micro-ondes":"mikrofalówka",
"appartement":"mieszkanie","immeuble":"blok","rez-de-chaussée":"parter","balcon":"balkon","terrasse":"taras","cheminée":"kominek","meuble":"mebel","canapé":"sofa","armoire":"szafa","tiroir":"szuflada","rideau":"zasłona","tapis":"dywan","déménager":"przeprowadzać się","nous déménageons demain":"jutro się przeprowadzamy",
"pousser":"pchać","tirer":"ciągnąć","lancer":"rzucać","attraper":"łapać","tenir":"trzymać","soulever":"podnosić","plier":"zginać","frapper":"uderzać","glisser":"ślizgać się","grimper":"wspinać się",
"rayon":"dział","vitrine":"witryna","marque":"marka","qualité":"jakość","choix":"wybór","rembourser":"zwracać pieniądze","échanger":"wymieniać","promotion":"promocja","comparer":"porównywać","choisir":"wybierać",
"université":"uniwersytet","étudiant":"student","cours":"zajęcia","diplôme":"dyplom","échouer":"oblać","étudier":"studiować","j'étudie à l'université":"studiuję na uniwersytecie","matière":"przedmiot","mathématiques":"matematyka","sciences":"nauka","géographie":"geografia","connaissance":"wiedza",
"seconde":"sekunda","instant":"chwila","siècle":"stulecie","époque":"epoka","midi":"południe","minuit":"północ","date":"data","calendrier":"kalendarz","horaire":"harmonogram","durée":"czas trwania","pendant":"podczas","depuis":"od"
},
ru:{
"nerveux":"нервный","déçu":"разочарованный","jaloux":"ревнивый","stressé":"напряжённый","détendu":"расслабленный","ému":"растроганный","satisfait":"удовлетворённый","reconnaissant":"благодарный",
"brouillard":"туман","éclair":"молния","tonnerre":"гром","arc-en-ciel":"радуга","tempête":"буря","quel temps fait-il":"какая погода","gel":"мороз","degré":"градус","prévisions":"прогноз","humide":"влажный","sécheresse":"засуха",
"bouillir":"кипятить","frire":"жарить","griller":"жарить на гриле","mélanger":"смешивать","couper":"резать","verser":"наливать","casserole":"кастрюля","poêle":"сковорода","plateau":"поднос","nappe":"скатерть","micro-ondes":"микроволновка",
"appartement":"квартира","immeuble":"здание","rez-de-chaussée":"первый этаж","balcon":"балкон","terrasse":"терраса","cheminée":"камин","meuble":"мебель","canapé":"диван","armoire":"шкаф","tiroir":"ящик","rideau":"штора","tapis":"ковёр","déménager":"переезжать","nous déménageons demain":"мы переезжаем завтра",
"pousser":"толкать","tirer":"тянуть","lancer":"бросать","attraper":"ловить","tenir":"держать","soulever":"поднимать","plier":"сгибать","frapper":"ударять","glisser":"скользить","grimper":"взбираться",
"rayon":"отдел","vitrine":"витрина","marque":"бренд","qualité":"качество","choix":"выбор","rembourser":"возвращать деньги","échanger":"обменивать","promotion":"акция","comparer":"сравнивать","choisir":"выбирать",
"université":"университет","étudiant":"студент","cours":"занятие","diplôme":"диплом","échouer":"провалиться","étudier":"изучать","j'étudie à l'université":"я учусь в университете","matière":"предмет","mathématiques":"математика","sciences":"наука","géographie":"география","connaissance":"знание",
"seconde":"секунда","instant":"момент","siècle":"век","époque":"эпоха","midi":"полдень","minuit":"полночь","date":"дата","calendrier":"календарь","horaire":"расписание","durée":"продолжительность","pendant":"во время","depuis":"с тех пор"
},
uk:{
"nerveux":"знервований","déçu":"розчарований","jaloux":"ревнивий","stressé":"напружений","détendu":"розслаблений","ému":"зворушений","satisfait":"вдоволений","reconnaissant":"вдячний",
"brouillard":"туман","éclair":"блискавка","tonnerre":"грім","arc-en-ciel":"веселка","tempête":"буря","quel temps fait-il":"яка погода","gel":"мороз","degré":"градус","prévisions":"прогноз","humide":"вологий","sécheresse":"посуха",
"bouillir":"кип'ятити","frire":"смажити","griller":"смажити на грилі","mélanger":"змішувати","couper":"різати","verser":"наливати","casserole":"каструля","poêle":"сковорідка","plateau":"таця","nappe":"скатертина","micro-ondes":"мікрохвильовка",
"appartement":"квартира","immeuble":"багатоповерхівка","rez-de-chaussée":"перший поверх","balcon":"балкон","terrasse":"тераса","cheminée":"камін","meuble":"меблі","canapé":"диван","armoire":"шафа","tiroir":"шухляда","rideau":"фіранка","tapis":"килим","déménager":"переїжджати","nous déménageons demain":"ми переїжджаємо завтра",
"pousser":"штовхати","tirer":"тягнути","lancer":"кидати","attraper":"ловити","tenir":"тримати","soulever":"піднімати","plier":"згинати","frapper":"вдаряти","glisser":"ковзати","grimper":"лізти",
"rayon":"відділ","vitrine":"вітрина","marque":"бренд","qualité":"якість","choix":"вибір","rembourser":"повертати гроші","échanger":"обмінювати","promotion":"акція","comparer":"порівнювати","choisir":"вибирати",
"université":"університет","étudiant":"студент","cours":"заняття","diplôme":"диплом","échouer":"провалитися","étudier":"навчатися","j'étudie à l'université":"я навчаюся в університеті","matière":"предмет","mathématiques":"математика","sciences":"наука","géographie":"географія","connaissance":"знання",
"seconde":"секунда","instant":"мить","siècle":"століття","époque":"епоха","midi":"полудень","minuit":"північ","date":"дата","calendrier":"календар","horaire":"розклад","durée":"тривалість","pendant":"під час","depuis":"відтоді"
},
cs:{
"nerveux":"nervózní","déçu":"zklamaný","jaloux":"žárlivý","stressé":"vystresovaný","détendu":"uvolněný","ému":"dojatý","satisfait":"uspokojený","reconnaissant":"vděčný",
"brouillard":"mlha","éclair":"blesk","tonnerre":"hrom","arc-en-ciel":"duha","tempête":"bouře","quel temps fait-il":"jaké je počasí","gel":"mráz","degré":"stupeň","prévisions":"předpověď","humide":"vlhký","sécheresse":"sucho",
"bouillir":"vřít","frire":"smažit","griller":"grilovat","mélanger":"míchat","couper":"krájet","verser":"nalévat","casserole":"hrnec","poêle":"pánev","plateau":"podnos","nappe":"ubrus","micro-ondes":"mikrovlnka",
"appartement":"byt","immeuble":"bytový dům","rez-de-chaussée":"přízemí","balcon":"balkón","terrasse":"terasa","cheminée":"krb","meuble":"nábytek","canapé":"pohovka","armoire":"skříň","tiroir":"šuplík","rideau":"závěs","tapis":"koberec","déménager":"stěhovat se","nous déménageons demain":"zítra se stěhujeme",
"pousser":"tlačit","tirer":"táhnout","lancer":"házet","attraper":"chytat","tenir":"držet","soulever":"zvedat","plier":"ohýbat","frapper":"udeřit","glisser":"klouzat","grimper":"šplhat",
"rayon":"oddělení","vitrine":"výloha","marque":"značka","qualité":"kvalita","choix":"výběr","rembourser":"vracet peníze","échanger":"vyměňovat","promotion":"akce","comparer":"srovnávat","choisir":"vybírat",
"université":"univerzita","étudiant":"student","cours":"přednáška","diplôme":"diplom","échouer":"neuspět","étudier":"studovat","j'étudie à l'université":"studuji na univerzitě","matière":"předmět","mathématiques":"matematika","sciences":"věda","géographie":"zeměpis","connaissance":"znalost",
"seconde":"sekunda","instant":"okamžik","siècle":"století","époque":"epocha","midi":"poledne","minuit":"půlnoc","date":"datum","calendrier":"kalendář","horaire":"rozvrh","durée":"trvání","pendant":"během","depuis":"od té doby"
},
zh:{
"nerveux":"紧张的","déçu":"失望的","jaloux":"嫉妒的","stressé":"压力大的","détendu":"放松的","ému":"感动的","satisfait":"满意的","reconnaissant":"感激的",
"brouillard":"雾","éclair":"闪电","tonnerre":"雷","arc-en-ciel":"彩虹","tempête":"暴风雨","quel temps fait-il":"天气 怎么样","gel":"霜冻","degré":"度","prévisions":"天气预报","humide":"潮湿的","sécheresse":"干旱",
"bouillir":"煮","frire":"炸","griller":"烤","mélanger":"搅拌","couper":"切","verser":"倒","casserole":"锅","poêle":"平底锅","plateau":"托盘","nappe":"桌布","micro-ondes":"微波炉",
"appartement":"公寓","immeuble":"大楼","rez-de-chaussée":"一楼","balcon":"阳台","terrasse":"露台","cheminée":"壁炉","meuble":"家具","canapé":"沙发","armoire":"衣柜","tiroir":"抽屉","rideau":"窗帘","tapis":"地毯","déménager":"搬家","nous déménageons demain":"我们 明天 搬家",
"pousser":"推","tirer":"拉","lancer":"扔","attraper":"抓住","tenir":"握住","soulever":"举起","plier":"弯曲","frapper":"打","glisser":"滑","grimper":"爬",
"rayon":"货架","vitrine":"橱窗","marque":"品牌","qualité":"质量","choix":"选择","rembourser":"退款","échanger":"交换","promotion":"促销","comparer":"比较","choisir":"选",
"université":"大学","étudiant":"大学生","cours":"课程","diplôme":"文凭","échouer":"不及格","étudier":"念书","j'étudie à l'université":"我 在 大学 念书","matière":"科目","mathématiques":"数学","sciences":"科学","géographie":"地理","connaissance":"知识",
"seconde":"秒","instant":"瞬间","siècle":"世纪","époque":"时代","midi":"中午","minuit":"午夜","date":"日期","calendrier":"日历","horaire":"时刻表","durée":"时长","pendant":"期间","depuis":"自从"
},
ja:{
"nerveux":"緊張した","déçu":"がっかりした","jaloux":"嫉妬深い","stressé":"ストレスを感じた","détendu":"リラックスした","ému":"感動した","satisfait":"満足した","reconnaissant":"感謝している",
"brouillard":"霧","éclair":"稲妻","tonnerre":"雷","arc-en-ciel":"虹","tempête":"嵐","quel temps fait-il":"天気 は どう です か","gel":"霜","degré":"度","prévisions":"天気予報","humide":"湿った","sécheresse":"干ばつ",
"bouillir":"茹でます","frire":"揚げます","griller":"焼きます","mélanger":"混ぜます","couper":"切ります","verser":"注ぎます","casserole":"鍋","poêle":"フライパン","plateau":"トレイ","nappe":"テーブルクロス","micro-ondes":"電子レンジ",
"appartement":"アパート","immeuble":"ビル","rez-de-chaussée":"一階","balcon":"バルコニー","terrasse":"テラス","cheminée":"暖炉","meuble":"家具","canapé":"ソファ","armoire":"タンス","tiroir":"引き出し","rideau":"カーテン","tapis":"カーペット","déménager":"引っ越します","nous déménageons demain":"私たち は 明日 引っ越します",
"pousser":"押します","tirer":"引きます","lancer":"投げます","attraper":"捕まえます","tenir":"持ちます","soulever":"持ち上げます","plier":"曲げます","frapper":"叩きます","glisser":"滑ります","grimper":"登ります",
"rayon":"売り場","vitrine":"ショーウィンドウ","marque":"ブランド","qualité":"品質","choix":"選択","rembourser":"返金します","échanger":"交換します","promotion":"特売","comparer":"比べます","choisir":"選びます",
"université":"大学","étudiant":"学生","cours":"講義","diplôme":"卒業証書","échouer":"失敗します","étudier":"勉強します","j'étudie à l'université":"私 は 大学 で 勉強します","matière":"科目","mathématiques":"数学","sciences":"科学","géographie":"地理","connaissance":"知識",
"seconde":"秒","instant":"瞬間","siècle":"世紀","époque":"時代","midi":"正午","minuit":"真夜中","date":"日付","calendrier":"カレンダー","horaire":"時刻表","durée":"期間","pendant":"〜の間","depuis":"から"
},
ko:{
"nerveux":"긴장한","déçu":"실망한","jaloux":"질투하는","stressé":"스트레스받은","détendu":"느긋한","ému":"감동한","satisfait":"만족한","reconnaissant":"고마워하는",
"brouillard":"안개","éclair":"번개","tonnerre":"천둥","arc-en-ciel":"무지개","tempête":"폭풍","quel temps fait-il":"날씨가 어때요","gel":"서리","degré":"도","prévisions":"일기예보","humide":"습한","sécheresse":"가뭄",
"bouillir":"끓이다","frire":"튀기다","griller":"굽다","mélanger":"섞다","couper":"자르다","verser":"붓다","casserole":"냄비","poêle":"프라이팬","plateau":"쟁반","nappe":"식탁보","micro-ondes":"전자레인지",
"appartement":"아파트","immeuble":"건물","rez-de-chaussée":"1층","balcon":"발코니","terrasse":"테라스","cheminée":"벽난로","meuble":"가구","canapé":"소파","armoire":"옷장","tiroir":"서랍","rideau":"커튼","tapis":"카펫","déménager":"이사하다","nous déménageons demain":"우리는 내일 이사해요",
"pousser":"밀다","tirer":"당기다","lancer":"던지다","attraper":"잡다","tenir":"쥐다","soulever":"들어 올리다","plier":"구부리다","frapper":"치다","glisser":"미끄러지다","grimper":"오르다",
"rayon":"코너","vitrine":"쇼윈도","marque":"브랜드","qualité":"품질","choix":"선택","rembourser":"환불하다","échanger":"교환하다","promotion":"프로모션","comparer":"비교하다","choisir":"고르다",
"université":"대학교","étudiant":"대학생","cours":"강의","diplôme":"졸업장","échouer":"실패하다","étudier":"공부하다","j'étudie à l'université":"저는 대학교에서 공부해요","matière":"과목","mathématiques":"수학","sciences":"과학","géographie":"지리","connaissance":"지식",
"seconde":"초","instant":"순간","siècle":"세기","époque":"시대","midi":"정오","minuit":"자정","date":"날짜","calendrier":"달력","horaire":"시간표","durée":"기간","pendant":"동안","depuis":"부터"
},
ar:{
"nerveux":"متوتر","déçu":"خائب الأمل","jaloux":"غيور","stressé":"مضغوط","détendu":"مسترخٍ","ému":"متأثر","satisfait":"راضٍ","reconnaissant":"ممتن",
"brouillard":"ضباب","éclair":"برق","tonnerre":"رعد","arc-en-ciel":"قوس قزح","tempête":"عاصفة شديدة","quel temps fait-il":"كيف الطقس","gel":"صقيع","degré":"درجة","prévisions":"توقعات الطقس","humide":"رطب","sécheresse":"جفاف",
"bouillir":"يغلي","frire":"يقلي","griller":"يشوي","mélanger":"يخلط","couper":"يقطع","verser":"يسكب","casserole":"قدر","poêle":"مقلاة","plateau":"صينية","nappe":"مفرش طاولة","micro-ondes":"ميكروويف",
"appartement":"شقة","immeuble":"مبنى سكني","rez-de-chaussée":"الطابق الأرضي","balcon":"شرفة","terrasse":"تراس","cheminée":"مدفأة","meuble":"أثاث","canapé":"أريكة","armoire":"خزانة","tiroir":"دُرج","rideau":"ستارة","tapis":"سجادة","déménager":"ينتقل","nous déménageons demain":"سننتقل غدًا",
"pousser":"يدفع","tirer":"يسحب","lancer":"يرمي","attraper":"يلتقط","tenir":"يمسك","soulever":"يرفع","plier":"يثني","frapper":"يضرب","glisser":"ينزلق","grimper":"يتسلق",
"rayon":"قسم","vitrine":"واجهة المتجر","marque":"علامة تجارية","qualité":"جودة","choix":"اختيار","rembourser":"يرد المال","échanger":"يستبدل","promotion":"عرض","comparer":"يقارن","choisir":"يختار",
"université":"جامعة","étudiant":"طالب","cours":"محاضرة","diplôme":"شهادة","échouer":"يفشل","étudier":"يدرس","j'étudie à l'université":"أدرس في الجامعة","matière":"مادة","mathématiques":"رياضيات","sciences":"علوم","géographie":"جغرافيا","connaissance":"معرفة",
"seconde":"ثانية","instant":"لحظة","siècle":"قرن","époque":"عصر","midi":"الظهيرة","minuit":"منتصف الليل","date":"تاريخ","calendrier":"تقويم","horaire":"جدول","durée":"مدة","pendant":"خلال","depuis":"منذ"
}
};
LANGS2.forEach(function(l){ var j2=LEX2J[l]||{}; Object.keys(j2).forEach(function(k){ LEX2[l][k]=j2[k]; }); });
/* ── Vague 11 nouvelles langues (v2.80) : unités 81-88 — s'entraider, l'actualité,
   exprimer son avis, autour du monde, chez le docteur, la carrière, pleine nature,
   les caractères. Anti-collisions vérifiées : pl aimable=uprzejmy (miły=gentil),
   avis=opinia (zdanie=phrase) ; ru ordonnance=рецепт врача (рецепт=recette),
   défendre=заступаться (защищать=protéger) ; uk ordonnance=рецепт лікаря,
   rocher=скеля (камінь=pierre), défendre=боронити (захищати=protéger) ;
   cs ordonnance=lékařský předpis (recept=recette), aimable=laskavý (milý=gentil) ;
   zh aide=帮忙 (帮助=aider), accueillir=迎接 (欢迎=bienvenue), réussite=成就
   (成功=réussir), défendre=保卫 (保护=protéger) ; ja sage=賢明な (賢い=intelligent),
   aimable=愛想がいい (優しい=gentil), défendre=かばいます (守ります=protéger) ;
   ko exemple=예시, ruisseau=개울, défendre=지키다 (보호하다=protéger) ;
   ar ordonnance=وصفة طبية (وصفة=recette), aimable=ودود (لطيف=gentil),
   ruisseau=غدير (جدول=horaire), défendre=يدافع عن (يحمي=protéger). */
var LEX2K = {
pl:{
"conseil":"rada","aide":"pomoc","service":"przysługa","soutien":"wsparcie","confiance":"zaufanie","respect":"szacunek","je te fais confiance":"ufam ci","amitié":"przyjaźń","partager":"dzielić się","offrir":"podarować","accueillir":"witać","défendre":"bronić","visiter":"odwiedzać",
"journaliste":"dziennikarz","article":"artykuł","radio":"radio","télévision":"telewizja","chaîne":"kanał","publicité":"reklama","gouvernement":"rząd","loi":"ustawa","élection":"wybory","président":"prezydent","police":"policja","sécurité":"bezpieczeństwo","liberté":"wolność",
"avis":"opinia","préférer":"woleć","décider":"decydować","changer":"zmieniać","douter":"wątpić","se tromper":"mylić się","à mon avis, c'est vrai":"moim zdaniem to prawda","convaincre":"przekonywać","exemple":"przykład","discussion":"dyskusja","promesse":"obietnica","mensonge":"kłamstwo","secret":"tajemnica",
"à l'étranger":"za granicą","culture":"kultura","tradition":"tradycja","religion":"religia","touriste":"turysta","guide":"przewodnik","monument":"zabytek","château":"zamek","tour":"wieża","désert":"pustynia","aventure":"przygoda","carte postale":"pocztówka",
"ordonnance":"recepta","vaccin":"szczepionka","pansement":"plaster","opération":"operacja","piqûre":"zastrzyk","salle d'attente":"poczekalnia","j'ai besoin d'un médecin":"potrzebuję lekarza","éternuer":"kichać","saigner":"krwawić","vertige":"zawroty głowy","cicatrice":"blizna","plâtre":"gips","béquilles":"kule",
"embaucher":"zatrudniać","candidature":"kandydatura","expérience":"doświadczenie","compétence":"umiejętność","formation":"szkolenie","stage":"staż","je cherche du travail":"szukam pracy","démissionner":"rezygnować","licencier":"zwalniać","retraite":"emerytura","chômage":"bezrobocie","augmentation":"podwyżka","réussite":"sukces",
"vallée":"dolina","falaise":"klif","cascade":"wodospad","rocher":"skała","sommet":"szczyt","ruisseau":"strumień","grotte":"jaskinia","boue":"błoto","sentier":"ścieżka","insecte":"owad","grenouille":"żaba","branche":"gałąź","écorce":"kora","mousse":"mech",
"généreux":"hojny","sage":"mądry","modeste":"skromny","sensible":"wrażliwy","aimable":"życzliwy","égoïste":"samolubny","têtu":"uparty","bavard":"gadatliwy","maladroit":"niezdarny","franc":"szczery"
},
ru:{
"conseil":"совет","aide":"помощь","service":"услуга","soutien":"поддержка","confiance":"доверие","respect":"уважение","je te fais confiance":"я тебе доверяю","amitié":"дружба","partager":"делиться","offrir":"дарить","accueillir":"встречать","défendre":"заступаться","visiter":"навещать",
"journaliste":"журналист","article":"статья","radio":"радио","télévision":"телевидение","chaîne":"канал","publicité":"реклама","gouvernement":"правительство","loi":"закон","élection":"выборы","président":"президент","police":"полиция","sécurité":"безопасность","liberté":"свобода",
"avis":"мнение","préférer":"предпочитать","décider":"решать","changer":"менять","douter":"сомневаться","se tromper":"ошибаться","à mon avis, c'est vrai":"по-моему, это правда","convaincre":"убеждать","exemple":"пример","discussion":"обсуждение","promesse":"обещание","mensonge":"ложь","secret":"секрет",
"à l'étranger":"за границей","culture":"культура","tradition":"традиция","religion":"религия","touriste":"турист","guide":"гид","monument":"памятник","château":"замок","tour":"башня","désert":"пустыня","aventure":"приключение","carte postale":"открытка",
"ordonnance":"рецепт врача","vaccin":"вакцина","pansement":"пластырь","opération":"операция","piqûre":"укол","salle d'attente":"зал ожидания","j'ai besoin d'un médecin":"мне нужен врач","éternuer":"чихать","saigner":"кровоточить","vertige":"головокружение","cicatrice":"шрам","plâtre":"гипс","béquilles":"костыли",
"embaucher":"нанимать","candidature":"кандидатура","expérience":"опыт","compétence":"навык","formation":"обучение","stage":"стажировка","je cherche du travail":"я ищу работу","démissionner":"увольняться","licencier":"увольнять","retraite":"пенсия","chômage":"безработица","augmentation":"прибавка","réussite":"успех",
"vallée":"долина","falaise":"утёс","cascade":"водопад","rocher":"скала","sommet":"вершина","ruisseau":"ручей","grotte":"пещера","boue":"грязь","sentier":"тропа","insecte":"насекомое","grenouille":"лягушка","branche":"ветка","écorce":"кора","mousse":"мох",
"généreux":"щедрый","sage":"мудрый","modeste":"скромный","sensible":"чувствительный","aimable":"любезный","égoïste":"эгоистичный","têtu":"упрямый","bavard":"болтливый","maladroit":"неуклюжий","franc":"откровенный"
},
uk:{
"conseil":"порада","aide":"допомога","service":"послуга","soutien":"підтримка","confiance":"довіра","respect":"повага","je te fais confiance":"я тобі довіряю","amitié":"дружба","partager":"ділитися","offrir":"дарувати","accueillir":"зустрічати","défendre":"боронити","visiter":"відвідувати",
"journaliste":"журналіст","article":"стаття","radio":"радіо","télévision":"телебачення","chaîne":"канал","publicité":"реклама","gouvernement":"уряд","loi":"закон","élection":"вибори","président":"президент","police":"поліція","sécurité":"безпека","liberté":"свобода",
"avis":"думка","préférer":"віддавати перевагу","décider":"вирішувати","changer":"змінювати","douter":"сумніватися","se tromper":"помилятися","à mon avis, c'est vrai":"на мою думку, це правда","convaincre":"переконувати","exemple":"приклад","discussion":"обговорення","promesse":"обіцянка","mensonge":"брехня","secret":"секрет",
"à l'étranger":"за кордоном","culture":"культура","tradition":"традиція","religion":"релігія","touriste":"турист","guide":"гід","monument":"пам'ятка","château":"замок","tour":"вежа","désert":"пустеля","aventure":"пригода","carte postale":"листівка",
"ordonnance":"рецепт лікаря","vaccin":"вакцина","pansement":"пластир","opération":"операція","piqûre":"укол","salle d'attente":"зала очікування","j'ai besoin d'un médecin":"мені потрібен лікар","éternuer":"чхати","saigner":"кровоточити","vertige":"запаморочення","cicatrice":"шрам","plâtre":"гіпс","béquilles":"милиці",
"embaucher":"наймати","candidature":"кандидатура","expérience":"досвід","compétence":"навичка","formation":"навчання","stage":"стажування","je cherche du travail":"я шукаю роботу","démissionner":"звільнятися","licencier":"звільняти","retraite":"пенсія","chômage":"безробіття","augmentation":"надбавка","réussite":"успіх",
"vallée":"долина","falaise":"урвище","cascade":"водоспад","rocher":"скеля","sommet":"вершина","ruisseau":"струмок","grotte":"печера","boue":"багнюка","sentier":"стежка","insecte":"комаха","grenouille":"жаба","branche":"гілка","écorce":"кора","mousse":"мох",
"généreux":"щедрий","sage":"мудрий","modeste":"скромний","sensible":"чутливий","aimable":"люб'язний","égoïste":"егоїстичний","têtu":"впертий","bavard":"балакучий","maladroit":"незграбний","franc":"відвертий"
},
cs:{
"conseil":"rada","aide":"pomoc","service":"služba","soutien":"podpora","confiance":"důvěra","respect":"respekt","je te fais confiance":"věřím ti","amitié":"přátelství","partager":"sdílet","offrir":"darovat","accueillir":"vítat","défendre":"bránit","visiter":"navštěvovat",
"journaliste":"novinář","article":"článek","radio":"rádio","télévision":"televize","chaîne":"kanál","publicité":"reklama","gouvernement":"vláda","loi":"zákon","élection":"volby","président":"prezident","police":"policie","sécurité":"bezpečnost","liberté":"svoboda",
"avis":"názor","préférer":"preferovat","décider":"rozhodovat","changer":"měnit","douter":"pochybovat","se tromper":"mýlit se","à mon avis, c'est vrai":"podle mě je to pravda","convaincre":"přesvědčovat","exemple":"příklad","discussion":"diskuse","promesse":"slib","mensonge":"lež","secret":"tajemství",
"à l'étranger":"v zahraničí","culture":"kultura","tradition":"tradice","religion":"náboženství","touriste":"turista","guide":"průvodce","monument":"památka","château":"hrad","tour":"věž","désert":"poušť","aventure":"dobrodružství","carte postale":"pohlednice",
"ordonnance":"lékařský předpis","vaccin":"vakcína","pansement":"náplast","opération":"operace","piqûre":"injekce","salle d'attente":"čekárna","j'ai besoin d'un médecin":"potřebuji lékaře","éternuer":"kýchat","saigner":"krvácet","vertige":"závrať","cicatrice":"jizva","plâtre":"sádra","béquilles":"berle",
"embaucher":"zaměstnávat","candidature":"kandidatura","expérience":"zkušenost","compétence":"dovednost","formation":"školení","stage":"stáž","je cherche du travail":"hledám práci","démissionner":"rezignovat","licencier":"propouštět","retraite":"důchod","chômage":"nezaměstnanost","augmentation":"zvýšení platu","réussite":"úspěch",
"vallée":"údolí","falaise":"útes","cascade":"vodopád","rocher":"skála","sommet":"vrchol","ruisseau":"potok","grotte":"jeskyně","boue":"bláto","sentier":"stezka","insecte":"hmyz","grenouille":"žába","branche":"větev","écorce":"kůra","mousse":"mech",
"généreux":"štědrý","sage":"moudrý","modeste":"skromný","sensible":"citlivý","aimable":"laskavý","égoïste":"sobecký","têtu":"tvrdohlavý","bavard":"upovídaný","maladroit":"nešikovný","franc":"upřímný"
},
zh:{
"conseil":"建议","aide":"帮忙","service":"服务","soutien":"支持","confiance":"信任","respect":"尊重","je te fais confiance":"我 相信 你","amitié":"友谊","partager":"分享","offrir":"赠送","accueillir":"迎接","défendre":"保卫","visiter":"拜访",
"journaliste":"记者","article":"文章","radio":"收音机","télévision":"电视机","chaîne":"频道","publicité":"广告","gouvernement":"政府","loi":"法律","élection":"选举","président":"总统","police":"警方","sécurité":"治安","liberté":"自由",
"avis":"意见","préférer":"更喜欢","décider":"决定","changer":"改变","douter":"怀疑","se tromper":"弄错","à mon avis, c'est vrai":"在 我 看来 这 是 真的","convaincre":"说服","exemple":"例子","discussion":"讨论","promesse":"诺言","mensonge":"谎言","secret":"秘密",
"à l'étranger":"在国外","culture":"文化","tradition":"传统","religion":"宗教","touriste":"游客","guide":"导游","monument":"纪念碑","château":"城堡","tour":"塔","désert":"沙漠","aventure":"冒险","carte postale":"明信片",
"ordonnance":"处方","vaccin":"疫苗","pansement":"创可贴","opération":"手术","piqûre":"打针","salle d'attente":"候诊室","j'ai besoin d'un médecin":"我 需要 医生","éternuer":"打喷嚏","saigner":"流血","vertige":"头晕","cicatrice":"疤痕","plâtre":"石膏","béquilles":"拐杖",
"embaucher":"雇用","candidature":"求职申请","expérience":"经验","compétence":"技能","formation":"培训","stage":"实习","je cherche du travail":"我 在 找 工作","démissionner":"辞职","licencier":"解雇","retraite":"退休","chômage":"失业","augmentation":"加薪","réussite":"成就",
"vallée":"山谷","falaise":"悬崖","cascade":"瀑布","rocher":"岩石","sommet":"山顶","ruisseau":"小溪","grotte":"洞穴","boue":"泥","sentier":"小路","insecte":"昆虫","grenouille":"青蛙","branche":"树枝","écorce":"树皮","mousse":"苔藓",
"généreux":"慷慨的","sage":"明智的","modeste":"谦虚的","sensible":"敏感的","aimable":"和蔼的","égoïste":"自私的","têtu":"固执的","bavard":"话多的","maladroit":"笨拙的","franc":"坦率的"
},
ja:{
"conseil":"アドバイス","aide":"助け","service":"サービス","soutien":"支え","confiance":"信頼","respect":"尊敬","je te fais confiance":"あなた を 信じます","amitié":"友情","partager":"分けます","offrir":"贈ります","accueillir":"迎えます","défendre":"かばいます","visiter":"訪ねます",
"journaliste":"記者","article":"記事","radio":"ラジオ","télévision":"テレビ","chaîne":"チャンネル","publicité":"広告","gouvernement":"政府","loi":"法律","élection":"選挙","président":"大統領","police":"警方","sécurité":"治安","liberté":"自由",
"avis":"意見","préférer":"好みます","décider":"決めます","changer":"変えます","douter":"疑います","se tromper":"間違えます","à mon avis, c'est vrai":"私 の 意見 では それ は 本当 です","convaincre":"説得します","exemple":"例","discussion":"議論","promesse":"約束","mensonge":"嘘","secret":"秘密",
"à l'étranger":"海外で","culture":"文化","tradition":"伝統","religion":"宗教","touriste":"観光客","guide":"ガイド","monument":"記念碑","château":"城","tour":"塔","désert":"砂漠","aventure":"冒険","carte postale":"はがき",
"ordonnance":"処方箋","vaccin":"ワクチン","pansement":"絆創膏","opération":"手術","piqûre":"注射","salle d'attente":"待合室","j'ai besoin d'un médecin":"医者 が 必要 です","éternuer":"くしゃみをします","saigner":"血が出ます","vertige":"めまい","cicatrice":"傷跡","plâtre":"ギプス","béquilles":"松葉杖",
"embaucher":"雇います","candidature":"応募","expérience":"経験","compétence":"スキル","formation":"研修","stage":"インターンシップ","je cherche du travail":"仕事 を 探しています","démissionner":"辞めます","licencier":"解雇します","retraite":"退職","chômage":"失業","augmentation":"昇給","réussite":"成功",
"vallée":"谷","falaise":"崖","cascade":"滝","rocher":"岩","sommet":"頂上","ruisseau":"小川","grotte":"洞窟","boue":"泥","sentier":"小道","insecte":"昆虫","grenouille":"カエル","branche":"枝","écorce":"樹皮","mousse":"苔",
"généreux":"気前がいい","sage":"賢明な","modeste":"謙虚な","sensible":"敏感な","aimable":"愛想がいい","égoïste":"わがままな","têtu":"頑固な","bavard":"おしゃべりな","maladroit":"不器用な","franc":"率直な"
},
ko:{
"conseil":"조언","aide":"도움","service":"서비스","soutien":"지원","confiance":"신뢰","respect":"존중","je te fais confiance":"너를 믿어요","amitié":"우정","partager":"나누다","offrir":"선물하다","accueillir":"맞이하다","défendre":"지키다","visiter":"방문하다",
"journaliste":"기자","article":"기사","radio":"라디오","télévision":"텔레비전","chaîne":"채널","publicité":"광고","gouvernement":"정부","loi":"법","élection":"선거","président":"대통령","police":"경찰","sécurité":"안전","liberté":"자유",
"avis":"의견","préférer":"선호하다","décider":"결정하다","changer":"바꾸다","douter":"의심하다","se tromper":"실수하다","à mon avis, c'est vrai":"제 생각에는 그게 사실이에요","convaincre":"설득하다","exemple":"예시","discussion":"토론","promesse":"약속","mensonge":"거짓말","secret":"비밀",
"à l'étranger":"해외에서","culture":"문화","tradition":"전통","religion":"종교","touriste":"관광객","guide":"가이드","monument":"기념물","château":"성","tour":"탑","désert":"사막","aventure":"모험","carte postale":"엽서",
"ordonnance":"처방전","vaccin":"백신","pansement":"반창고","opération":"수술","piqûre":"주사","salle d'attente":"대기실","j'ai besoin d'un médecin":"의사가 필요해요","éternuer":"재채기하다","saigner":"피가 나다","vertige":"어지러움","cicatrice":"흉터","plâtre":"깁스","béquilles":"목발",
"embaucher":"고용하다","candidature":"지원서","expérience":"경험","compétence":"기술","formation":"연수","stage":"인턴십","je cherche du travail":"일자리를 찾고 있어요","démissionner":"사직하다","licencier":"해고하다","retraite":"은퇴","chômage":"실업","augmentation":"임금 인상","réussite":"성공",
"vallée":"계곡","falaise":"절벽","cascade":"폭포","rocher":"바위","sommet":"정상","ruisseau":"개울","grotte":"동굴","boue":"진흙","sentier":"오솔길","insecte":"곤충","grenouille":"개구리","branche":"나뭇가지","écorce":"나무껍질","mousse":"이끼",
"généreux":"너그러운","sage":"현명한","modeste":"겸손한","sensible":"섬세한","aimable":"상냥한","égoïste":"이기적인","têtu":"고집이 센","bavard":"수다스러운","maladroit":"서투른","franc":"솔직한"
},
ar:{
"conseil":"نصيحة","aide":"مساعدة","service":"خدمة","soutien":"دعم","confiance":"ثقة","respect":"احترام","je te fais confiance":"أثق بك","amitié":"صداقة","partager":"يشارك","offrir":"يهدي","accueillir":"يرحب بـ","défendre":"يدافع عن","visiter":"يزور",
"journaliste":"صحفي","article":"مقال","radio":"راديو","télévision":"تلفزيون","chaîne":"قناة","publicité":"إعلان","gouvernement":"حكومة","loi":"قانون","élection":"انتخابات","président":"رئيس","police":"شرطة","sécurité":"أمان","liberté":"حرية",
"avis":"رأي","préférer":"يفضل","décider":"يقرر","changer":"يغير","douter":"يشك","se tromper":"يخطئ","à mon avis, c'est vrai":"في رأيي هذا صحيح","convaincre":"يقنع","exemple":"مثال","discussion":"نقاش","promesse":"وعد","mensonge":"كذبة","secret":"سر",
"à l'étranger":"في الخارج","culture":"ثقافة","tradition":"تقليد","religion":"دين","touriste":"سائح","guide":"مرشد","monument":"نصب تذكاري","château":"قلعة","tour":"برج","désert":"صحراء","aventure":"مغامرة","carte postale":"بطاقة بريدية",
"ordonnance":"وصفة طبية","vaccin":"لقاح","pansement":"ضمادة","opération":"عملية جراحية","piqûre":"حقنة","salle d'attente":"غرفة الانتظار","j'ai besoin d'un médecin":"أحتاج إلى طبيب","éternuer":"يعطس","saigner":"ينزف","vertige":"دوخة","cicatrice":"ندبة","plâtre":"جبيرة","béquilles":"عكازات",
"embaucher":"يوظف","candidature":"طلب توظيف","expérience":"خبرة","compétence":"مهارة","formation":"تدريب","stage":"تدريب عملي","je cherche du travail":"أبحث عن عمل","démissionner":"يستقيل","licencier":"يفصل","retraite":"تقاعد","chômage":"بطالة","augmentation":"علاوة","réussite":"نجاح",
"vallée":"وادٍ","falaise":"جرف","cascade":"شلال","rocher":"صخرة","sommet":"قمة","ruisseau":"غدير","grotte":"كهف","boue":"طين","sentier":"درب","insecte":"حشرة","grenouille":"ضفدع","branche":"غصن","écorce":"لحاء","mousse":"طحلب",
"généreux":"كريم","sage":"حكيم","modeste":"متواضع","sensible":"حساس","aimable":"دمث","égoïste":"أناني","têtu":"عنيد","bavard":"ثرثار","maladroit":"أخرق","franc":"صريح"
}
};
LANGS2.forEach(function(l){ var k2=LEX2K[l]||{}; Object.keys(k2).forEach(function(k){ LEX2[l][k]=k2[k]; }); });
/* ── Vague 12 nouvelles langues (v2.81) : unités 89-96 — le bricolage, les urgences,
   bien manger dehors, sortir le soir, mots de liaison, la pensée, question d'argent,
   les matières. Anti-collisions vérifiées : ru échelle=стремянка (лестница=escalier),
   bois=древесина (дерево=arbre), se souvenir=вспоминать ; zh réservation=订位
   (预订=réserver), plutôt=宁愿 (比较=comparer) ; ja réservation=席の予約
   (予約=rendez-vous), entracte=休憩 ; ko environ=대략 (약=médicament), bois=목재
   (나무=arbre) ; ar cependant=ومع ذلك (لكن=mais), scène=خشبة المسرح (مسرح=théâtre),
   réfléchir=يتأمل (يفكر=penser), dette=ديون (دين=religion), spectacle=عرض مسرحي
   (عرض=promotion). Emprunter/prêter distingués partout (ja 借ります/貸します,
   ko 빌리다/빌려주다, zh 借/借给, ar يقترض/يقرض, cs půjčovat si/půjčovat,
   pl pożyczać/pożyczać komuś, uk позичати/давати в борг, ru брать в долг/одалживать).
   Homographes réels assumés : zh 危险 (dangereux ET danger, même mot) ; peau ET cuir (polysémie classique sans autre mot) :
   pl skóra, ru кожа, uk шкіра, cs kůže, ar جلد. */
var LEX2L = {
pl:{
"marteau":"młotek","clou":"gwóźdź","vis":"śruba","tournevis":"śrubokręt","outil":"narzędzie","pelle":"łopata","réparer":"naprawiać","percer":"wiercić","coller":"kleić","mesurer":"mierzyć","échelle":"drabina","pinceau":"pędzel","scie":"piła","tuyau":"rura","corde":"lina","fil":"drut",
"incendie":"pożar","ambulance":"karetka","secours":"ratunek","danger":"niebezpieczeństwo","alarme":"alarm","il y a le feu":"pali się","voleur":"złodziej","témoin":"świadek","prudent":"ostrożny","avertir":"ostrzegać","fuite":"wyciek",
"réservation":"rezerwacja","pourboire":"napiwek","commander":"zamawiać","végétarien":"wegetarianin","saignant":"krwisty","bien cuit":"dobrze wysmażony","l'addition, s'il vous plaît":"rachunek proszę",
"concert":"koncert","spectacle":"przedstawienie","chanteur":"piosenkarz","acteur":"aktor","scène":"scena","applaudir":"klaskać","le spectacle commence à huit heures":"przedstawienie zaczyna się o ósmej","exposition":"wystawa","ambiance":"atmosfera","cirque":"cyrk","affiche":"plakat","entracte":"antrakt",
"cependant":"jednak","pourtant":"mimo to","malgré":"mimo","sauf":"oprócz","environ":"około","plutôt":"raczej","sans doute":"zapewne","d'ailleurs":"zresztą","en fait":"właściwie","au lieu de":"zamiast","grâce à":"dzięki","à cause de":"z powodu",
"se souvenir":"pamiętać","mémoire":"pamięć","reconnaître":"rozpoznawać","regretter":"żałować","deviner":"zgadywać","je me souviens de toi":"pamiętam cię","imaginer":"wyobrażać sobie","réfléchir":"zastanawiać się","supposer":"przypuszczać","hésiter":"wahać się","prévoir":"przewidywać",
"emprunter":"pożyczać","prêter":"pożyczać komuś","dette":"dług","récompense":"nagroda","ça vaut la peine":"warto",
"métal":"metal","plastique":"plastik","bois":"drewno","or":"złoto","carton":"karton","coton":"bawełna","laine":"wełna","cuir":"skóra","soie":"jedwab","tissu":"tkanina"
},
ru:{
"marteau":"молоток","clou":"гвоздь","vis":"винт","tournevis":"отвёртка","outil":"инструмент","pelle":"лопата","réparer":"чинить","percer":"сверлить","coller":"клеить","mesurer":"измерять","échelle":"стремянка","pinceau":"кисть","scie":"пила","tuyau":"труба","corde":"верёвка","fil":"провод",
"incendie":"пожар","ambulance":"скорая помощь","secours":"спасение","danger":"опасность","alarme":"сигнализация","il y a le feu":"тут пожар","voleur":"вор","témoin":"свидетель","prudent":"осторожный","avertir":"предупреждать","fuite":"утечка",
"réservation":"бронирование","pourboire":"чаевые","commander":"заказывать","végétarien":"вегетарианец","saignant":"с кровью","bien cuit":"хорошо прожаренный","l'addition, s'il vous plaît":"счёт, пожалуйста",
"concert":"концерт","spectacle":"спектакль","chanteur":"певец","acteur":"актёр","scène":"сцена","applaudir":"аплодировать","le spectacle commence à huit heures":"спектакль начинается в восемь","exposition":"выставка","ambiance":"атмосфера","cirque":"цирк","affiche":"афиша","entracte":"антракт",
"cependant":"однако","pourtant":"всё-таки","malgré":"несмотря на","sauf":"кроме","environ":"примерно","plutôt":"скорее","sans doute":"наверное","d'ailleurs":"кстати","en fait":"на самом деле","au lieu de":"вместо","grâce à":"благодаря","à cause de":"из-за",
"se souvenir":"вспоминать","mémoire":"память","reconnaître":"узнавать","regretter":"жалеть","deviner":"угадывать","je me souviens de toi":"я помню тебя","imaginer":"представлять","réfléchir":"размышлять","supposer":"предполагать","hésiter":"колебаться","prévoir":"предвидеть",
"emprunter":"брать в долг","prêter":"одалживать","dette":"долг","récompense":"награда","ça vaut la peine":"это того стоит",
"métal":"металл","plastique":"пластик","bois":"древесина","or":"золото","carton":"картон","coton":"хлопок","laine":"шерсть","cuir":"кожа","soie":"шёлк","tissu":"ткань"
},
uk:{
"marteau":"молоток","clou":"цвях","vis":"гвинт","tournevis":"викрутка","outil":"інструмент","pelle":"лопата","réparer":"ремонтувати","percer":"свердлити","coller":"клеїти","mesurer":"вимірювати","échelle":"драбина","pinceau":"пензель","scie":"пилка","tuyau":"труба","corde":"мотузка","fil":"дріт",
"incendie":"пожежа","ambulance":"швидка допомога","secours":"порятунок","danger":"небезпека","alarme":"сигналізація","il y a le feu":"тут пожежа","voleur":"злодій","témoin":"свідок","prudent":"обережний","avertir":"попереджати","fuite":"витік",
"réservation":"бронювання","pourboire":"чайові","commander":"замовляти","végétarien":"вегетаріанець","saignant":"з кров'ю","bien cuit":"добре просмажений","l'addition, s'il vous plaît":"рахунок, будь ласка",
"concert":"концерт","spectacle":"вистава","chanteur":"співак","acteur":"актор","scène":"сцена","applaudir":"аплодувати","le spectacle commence à huit heures":"вистава починається о восьмій","exposition":"виставка","ambiance":"атмосфера","cirque":"цирк","affiche":"афіша","entracte":"антракт",
"cependant":"однак","pourtant":"все ж таки","malgré":"попри","sauf":"крім","environ":"приблизно","plutôt":"радше","sans doute":"мабуть","d'ailleurs":"до речі","en fait":"насправді","au lieu de":"замість","grâce à":"завдяки","à cause de":"через",
"se souvenir":"згадувати","mémoire":"пам'ять","reconnaître":"впізнавати","regretter":"шкодувати","deviner":"вгадувати","je me souviens de toi":"я пам'ятаю тебе","imaginer":"уявляти","réfléchir":"розмірковувати","supposer":"припускати","hésiter":"вагатися","prévoir":"передбачати",
"emprunter":"позичати","prêter":"давати в борг","dette":"борг","récompense":"нагорода","ça vaut la peine":"це того варте",
"métal":"метал","plastique":"пластик","bois":"деревина","or":"золото","carton":"картон","coton":"бавовна","laine":"вовна","cuir":"шкіра","soie":"шовк","tissu":"тканина"
},
cs:{
"marteau":"kladivo","clou":"hřebík","vis":"šroub","tournevis":"šroubovák","outil":"nástroj","pelle":"lopata","réparer":"opravovat","percer":"vrtat","coller":"lepit","mesurer":"měřit","échelle":"žebřík","pinceau":"štětec","scie":"pila","tuyau":"trubka","corde":"lano","fil":"drát",
"incendie":"požár","ambulance":"sanitka","secours":"záchrana","danger":"nebezpečí","alarme":"alarm","il y a le feu":"hoří","voleur":"zloděj","témoin":"svědek","prudent":"opatrný","avertir":"varovat","fuite":"únik",
"réservation":"rezervace","pourboire":"spropitné","commander":"objednávat","végétarien":"vegetarián","saignant":"krvavý","bien cuit":"dobře propečený","l'addition, s'il vous plaît":"účet prosím",
"concert":"koncert","spectacle":"představení","chanteur":"zpěvák","acteur":"herec","scène":"scéna","applaudir":"tleskat","le spectacle commence à huit heures":"představení začíná v osm","exposition":"výstava","ambiance":"atmosféra","cirque":"cirkus","affiche":"plakát","entracte":"přestávka",
"cependant":"však","pourtant":"přesto","malgré":"navzdory","sauf":"kromě","environ":"přibližně","plutôt":"spíše","sans doute":"nejspíš","d'ailleurs":"ostatně","en fait":"vlastně","au lieu de":"namísto","grâce à":"díky","à cause de":"kvůli",
"se souvenir":"pamatovat si","mémoire":"paměť","reconnaître":"rozpoznávat","regretter":"litovat","deviner":"hádat","je me souviens de toi":"pamatuji si tě","imaginer":"představovat si","réfléchir":"přemýšlet","supposer":"předpokládat","hésiter":"váhat","prévoir":"předvídat",
"emprunter":"půjčovat si","prêter":"půjčovat","dette":"dluh","récompense":"odměna","ça vaut la peine":"stojí to za to",
"métal":"kov","plastique":"plast","bois":"dřevo","or":"zlato","carton":"karton","coton":"bavlna","laine":"vlna","cuir":"kůže","soie":"hedvábí","tissu":"látka"
},
zh:{
"marteau":"锤子","clou":"钉子","vis":"螺丝","tournevis":"螺丝刀","outil":"工具","pelle":"铲子","réparer":"修理","percer":"钻孔","coller":"粘","mesurer":"测量","échelle":"梯子","pinceau":"刷子","scie":"锯子","tuyau":"管子","corde":"绳子","fil":"电线",
"incendie":"火灾","ambulance":"救护车","secours":"救援","danger":"危险","alarme":"警报","il y a le feu":"着火 了","voleur":"小偷","témoin":"目击者","prudent":"小心的","avertir":"警告","fuite":"泄漏",
"réservation":"订位","pourboire":"小费","commander":"点菜","végétarien":"素食者","saignant":"三分熟","bien cuit":"全熟","l'addition, s'il vous plaît":"请 结账",
"concert":"音乐会","spectacle":"演出","chanteur":"歌手","acteur":"演员","scène":"舞台","applaudir":"鼓掌","le spectacle commence à huit heures":"演出 八点 开始","exposition":"展览","ambiance":"气氛","cirque":"马戏团","affiche":"海报","entracte":"中场休息",
"cependant":"然而","pourtant":"不过","malgré":"尽管","sauf":"除了","environ":"大约","plutôt":"宁愿","sans doute":"大概","d'ailleurs":"况且","en fait":"其实","au lieu de":"而不是","grâce à":"多亏了","à cause de":"由于",
"se souvenir":"记得","mémoire":"记忆","reconnaître":"认出","regretter":"后悔","deviner":"猜","je me souviens de toi":"我 记得 你","imaginer":"想象","réfléchir":"思考","supposer":"假设","hésiter":"犹豫","prévoir":"预测",
"emprunter":"借","prêter":"借给","dette":"债务","récompense":"奖励","ça vaut la peine":"这 值得",
"métal":"金属","plastique":"塑料","bois":"木头","or":"黄金","carton":"纸板","coton":"棉花","laine":"羊毛","cuir":"皮革","soie":"丝绸","tissu":"布料"
},
ja:{
"marteau":"ハンマー","clou":"釘","vis":"ネジ","tournevis":"ドライバー","outil":"道具","pelle":"シャベル","réparer":"修理します","percer":"穴を開けます","coller":"貼ります","mesurer":"測ります","échelle":"はしご","pinceau":"刷毛","scie":"のこぎり","tuyau":"パイプ","corde":"ロープ","fil":"針金",
"incendie":"火事","ambulance":"救急車","secours":"救助","danger":"危険","alarme":"警報","il y a le feu":"火事 です","voleur":"泥棒","témoin":"目撃者","prudent":"慎重な","avertir":"警告します","fuite":"漏れ",
"réservation":"席の予約","pourboire":"チップ","commander":"注文します","végétarien":"ベジタリアン","saignant":"レア","bien cuit":"ウェルダン","l'addition, s'il vous plaît":"お会計 お願いします",
"concert":"コンサート","spectacle":"ショー","chanteur":"歌手","acteur":"俳優","scène":"舞台","applaudir":"拍手します","le spectacle commence à huit heures":"ショー は 八時 に 始まります","exposition":"展覧会","ambiance":"雰囲気","cirque":"サーカス","affiche":"ポスター","entracte":"休憩",
"cependant":"しかし","pourtant":"それでも","malgré":"〜にもかかわらず","sauf":"〜以外","environ":"約","plutôt":"むしろ","sans doute":"おそらく","d'ailleurs":"ちなみに","en fait":"実は","au lieu de":"〜の代わりに","grâce à":"〜のおかげで","à cause de":"〜のせいで",
"se souvenir":"覚えています","mémoire":"記憶","reconnaître":"見分けます","regretter":"後悔します","deviner":"当てます","je me souviens de toi":"あなた を 覚えています","imaginer":"想像します","réfléchir":"考えます","supposer":"推測します","hésiter":"ためらいます","prévoir":"予測します",
"emprunter":"借ります","prêter":"貸します","dette":"借金","récompense":"ご褒美","ça vaut la peine":"その 価値 が あります",
"métal":"金属","plastique":"プラスチック","bois":"木材","or":"金","carton":"段ボール","coton":"綿","laine":"ウール","cuir":"革","soie":"絹","tissu":"布"
},
ko:{
"marteau":"망치","clou":"못","vis":"나사","tournevis":"드라이버","outil":"도구","pelle":"삽","réparer":"수리하다","percer":"뚫다","coller":"붙이다","mesurer":"재다","échelle":"사다리","pinceau":"붓","scie":"톱","tuyau":"파이프","corde":"밧줄","fil":"철사",
"incendie":"화재","ambulance":"구급차","secours":"구조","danger":"위험","alarme":"경보","il y a le feu":"불이 났어요","voleur":"도둑","témoin":"목격자","prudent":"신중한","avertir":"경고하다","fuite":"누수",
"réservation":"자리 예약","pourboire":"팁","commander":"주문하다","végétarien":"채식주의자","saignant":"레어","bien cuit":"웰던","l'addition, s'il vous plaît":"계산서 주세요",
"concert":"콘서트","spectacle":"공연","chanteur":"가수","acteur":"배우","scène":"무대","applaudir":"박수를 치다","le spectacle commence à huit heures":"공연은 여덟 시에 시작해요","exposition":"전시회","ambiance":"분위기","cirque":"서커스","affiche":"포스터","entracte":"인터미션",
"cependant":"그러나","pourtant":"그래도","malgré":"에도 불구하고","sauf":"제외하고","environ":"대략","plutôt":"오히려","sans doute":"아마도","d'ailleurs":"게다가","en fait":"사실은","au lieu de":"대신에","grâce à":"덕분에","à cause de":"때문에",
"se souvenir":"기억하다","mémoire":"기억","reconnaître":"알아보다","regretter":"후회하다","deviner":"맞히다","je me souviens de toi":"너를 기억해요","imaginer":"상상하다","réfléchir":"곰곰이 생각하다","supposer":"추측하다","hésiter":"망설이다","prévoir":"예측하다",
"emprunter":"빌리다","prêter":"빌려주다","dette":"빚","récompense":"보상","ça vaut la peine":"그럴 가치가 있어요",
"métal":"금속","plastique":"플라스틱","bois":"목재","or":"금","carton":"판지","coton":"면","laine":"양모","cuir":"가죽","soie":"실크","tissu":"옷감"
},
ar:{
"marteau":"مطرقة","clou":"مسمار","vis":"برغي","tournevis":"مفك","outil":"أداة","pelle":"مجرفة","réparer":"يصلح","percer":"يثقب","coller":"يلصق","mesurer":"يقيس","échelle":"سلم","pinceau":"فرشاة طلاء","scie":"منشار","tuyau":"أنبوب","corde":"حبل","fil":"سلك",
"incendie":"حريق","ambulance":"سيارة إسعاف","secours":"إنقاذ","danger":"خطر","alarme":"إنذار","il y a le feu":"هناك حريق","voleur":"لص","témoin":"شاهد","prudent":"حذر","avertir":"يحذر","fuite":"تسرب",
"réservation":"حجز","pourboire":"بقشيش","commander":"يطلب","végétarien":"نباتي","saignant":"قليل الاستواء","bien cuit":"مطهو جيدًا","l'addition, s'il vous plaît":"الحساب من فضلك",
"concert":"حفلة موسيقية","spectacle":"عرض مسرحي","chanteur":"مغني","acteur":"ممثل","scène":"خشبة المسرح","applaudir":"يصفق","le spectacle commence à huit heures":"يبدأ العرض في الساعة الثامنة","exposition":"معرض","ambiance":"أجواء","cirque":"سيرك","affiche":"ملصق","entracte":"استراحة",
"cependant":"ومع ذلك","pourtant":"رغم ذلك","malgré":"رغم","sauf":"ما عدا","environ":"حوالي","plutôt":"بالأحرى","sans doute":"على الأرجح","d'ailleurs":"بالمناسبة","en fait":"في الواقع","au lieu de":"بدلاً من","grâce à":"بفضل","à cause de":"بسبب",
"se souvenir":"يتذكر","mémoire":"ذاكرة","reconnaître":"يتعرف على","regretter":"يندم","deviner":"يخمن","je me souviens de toi":"أتذكرك","imaginer":"يتخيل","réfléchir":"يتأمل","supposer":"يفترض","hésiter":"يتردد","prévoir":"يتوقع",
"emprunter":"يقترض","prêter":"يقرض","dette":"ديون","récompense":"مكافأة","ça vaut la peine":"يستحق العناء",
"métal":"معدن","plastique":"بلاستيك","bois":"خشب","or":"ذهب","carton":"كرتون","coton":"قطن","laine":"صوف","cuir":"جلد","soie":"حرير","tissu":"قماش"
}
};
LANGS2.forEach(function(l){ var l2=LEX2L[l]||{}; Object.keys(l2).forEach(function(k){ LEX2[l][k]=l2[k]; }); });
/* ── Vague 13 nouvelles langues (v2.82) : unités 97-104 — à l'aéroport, à la gare,
   la ville en détail, à la ferme, le sport en grand, l'atelier d'artiste, à la poste,
   le grand ménage. Anti-collisions vérifiées : pl guichet=okienko (kasa=caisse) ;
   ru terrain=площадка (поле=champ), peintre=живописец (художник=artiste),
   guichet=окошко (касса=caisse), atterrissage=приземление (посадка=embarquement) ;
   uk guichet=віконце, peintre=живописець ; cs éponge=houbička (houba=champignon),
   panneau=dopravní značka (značka=marque), lampadaire=pouliční lampa (lampa=lampe),
   sculpture=plastika (socha=statue) ; zh tableau=画作 (画画=dessiner) ;
   ko terrain=운동장 (경기장=stade), tableau=회화 ; ar terrain=أرض الملعب (ملعب=stade),
   entraînement=تمرين (تدريب=formation), galerie=صالة عرض (معرض=exposition). */
var LEX2M = {
pl:{
"embarquement":"wejście na pokład","décollage":"start","atterrissage":"lądowanie","bagage à main":"bagaż podręczny","hublot":"iluminator","piste":"pas startowy",
"quai":"peron","guichet":"okienko","aller simple":"bilet w jedną stronę","aller-retour":"bilet w obie strony","correspondance":"przesiadka","le train est en retard":"pociąg jest opóźniony","où est le quai":"gdzie jest peron",
"trottoir":"chodnik","passage piéton":"przejście dla pieszych","panneau":"znak","lampadaire":"latarnia","boîte aux lettres":"skrzynka pocztowa","rond-point":"rondo","fontaine":"fontanna","statue":"posąg","banlieue":"przedmieścia","centre-ville":"centrum miasta","tunnel":"tunel",
"ferme":"gospodarstwo","récolte":"zbiory","semer":"siać","tracteur":"traktor","blé":"pszenica","grange":"stodoła","étable":"obora","poulailler":"kurnik","puits":"studnia","épouvantail":"strach na wróble","troupeau":"stado","berger":"pasterz","foin":"siano","vigne":"winnica","maïs":"kukurydza",
"équipe":"drużyna","match":"mecz","but":"gol","arbitre":"sędzia","terrain":"boisko","tournoi":"turniej","victoire":"zwycięstwo","défaite":"porażka","entraînement":"trening","adversaire":"przeciwnik","champion":"mistrz","médaille":"medal",
"peintre":"malarz","tableau":"obraz","sculpture":"rzeźba","sculpteur":"rzeźbiarz","atelier":"pracownia","dessin":"rysunek","œuvre":"dzieło","portrait":"portret","chef-d'œuvre":"arcydzieło","galerie":"galeria","exposer":"wystawiać",
"colis":"paczka","timbre":"znaczek","enveloppe":"koperta","livraison":"dostawa","expéditeur":"nadawca","destinataire":"odbiorca","formulaire":"formularz","signature":"podpis","tampon":"pieczątka",
"balayer":"zamiatać","aspirateur":"odkurzacz","lessive":"pranie","vaisselle":"naczynia","poussière":"kurz","balai":"miotła","seau":"wiadro","éponge":"gąbka","serpillière":"mop"
},
ru:{
"embarquement":"посадка","décollage":"взлёт","atterrissage":"приземление","bagage à main":"ручная кладь","hublot":"иллюминатор","piste":"взлётная полоса",
"quai":"платформа","guichet":"окошко","aller simple":"билет в одну сторону","aller-retour":"билет туда и обратно","correspondance":"пересадка","le train est en retard":"поезд опаздывает","où est le quai":"где платформа",
"trottoir":"тротуар","passage piéton":"пешеходный переход","panneau":"знак","lampadaire":"фонарь","boîte aux lettres":"почтовый ящик","rond-point":"круговое движение","fontaine":"фонтан","statue":"статуя","banlieue":"пригород","centre-ville":"центр города","tunnel":"тоннель",
"ferme":"ферма","récolte":"урожай","semer":"сеять","tracteur":"трактор","blé":"пшеница","grange":"амбар","étable":"коровник","poulailler":"курятник","puits":"колодец","épouvantail":"пугало","troupeau":"стадо","berger":"пастух","foin":"сено","vigne":"виноградник","maïs":"кукуруза",
"équipe":"команда","match":"матч","but":"гол","arbitre":"судья","terrain":"площадка","tournoi":"турнир","victoire":"победа","défaite":"поражение","entraînement":"тренировка","adversaire":"соперник","champion":"чемпион","médaille":"медаль",
"peintre":"живописец","tableau":"картина","sculpture":"скульптура","sculpteur":"скульптор","atelier":"мастерская","dessin":"рисунок","œuvre":"произведение","portrait":"портрет","chef-d'œuvre":"шедевр","galerie":"галерея","exposer":"выставлять",
"colis":"посылка","timbre":"марка","enveloppe":"конверт","livraison":"доставка","expéditeur":"отправитель","destinataire":"получатель","formulaire":"бланк","signature":"подпись","tampon":"печать",
"balayer":"подметать","aspirateur":"пылесос","lessive":"стирка","vaisselle":"посуда","poussière":"пыль","balai":"метла","seau":"ведро","éponge":"губка","serpillière":"швабра"
},
uk:{
"embarquement":"посадка","décollage":"зліт","atterrissage":"приземлення","bagage à main":"ручна поклажа","hublot":"ілюмінатор","piste":"злітна смуга",
"quai":"платформа","guichet":"віконце","aller simple":"квиток в один бік","aller-retour":"квиток туди й назад","correspondance":"пересадка","le train est en retard":"потяг запізнюється","où est le quai":"де платформа",
"trottoir":"тротуар","passage piéton":"пішохідний перехід","panneau":"знак","lampadaire":"ліхтар","boîte aux lettres":"поштова скринька","rond-point":"кільце","fontaine":"фонтан","statue":"статуя","banlieue":"передмістя","centre-ville":"центр міста","tunnel":"тунель",
"ferme":"ферма","récolte":"врожай","semer":"сіяти","tracteur":"трактор","blé":"пшениця","grange":"стодола","étable":"корівник","poulailler":"курник","puits":"колодязь","épouvantail":"опудало","troupeau":"стадо","berger":"пастух","foin":"сіно","vigne":"виноградник","maïs":"кукурудза",
"équipe":"команда","match":"матч","but":"гол","arbitre":"суддя","terrain":"майданчик","tournoi":"турнір","victoire":"перемога","défaite":"поразка","entraînement":"тренування","adversaire":"суперник","champion":"чемпіон","médaille":"медаль",
"peintre":"живописець","tableau":"картина","sculpture":"скульптура","sculpteur":"скульптор","atelier":"майстерня","dessin":"малюнок","œuvre":"твір","portrait":"портрет","chef-d'œuvre":"шедевр","galerie":"галерея","exposer":"виставляти",
"colis":"посилка","timbre":"марка","enveloppe":"конверт","livraison":"доставка","expéditeur":"відправник","destinataire":"одержувач","formulaire":"бланк","signature":"підпис","tampon":"печатка",
"balayer":"підмітати","aspirateur":"пилосос","lessive":"прання","vaisselle":"посуд","poussière":"пил","balai":"мітла","seau":"відро","éponge":"губка","serpillière":"швабра"
},
cs:{
"embarquement":"nástup","décollage":"vzlet","atterrissage":"přistání","bagage à main":"příruční zavazadlo","hublot":"okénko","piste":"ranvej",
"quai":"nástupiště","guichet":"přepážka","aller simple":"jednosměrná jízdenka","aller-retour":"zpáteční jízdenka","correspondance":"přestup","le train est en retard":"vlak má zpoždění","où est le quai":"kde je nástupiště",
"trottoir":"chodník","passage piéton":"přechod pro chodce","panneau":"dopravní značka","lampadaire":"pouliční lampa","boîte aux lettres":"poštovní schránka","rond-point":"kruhový objezd","fontaine":"fontána","statue":"socha","banlieue":"předměstí","centre-ville":"centrum města","tunnel":"tunel",
"ferme":"farma","récolte":"sklizeň","semer":"sít","tracteur":"traktor","blé":"pšenice","grange":"stodola","étable":"chlév","poulailler":"kurník","puits":"studna","épouvantail":"strašák","troupeau":"stádo","berger":"pastýř","foin":"seno","vigne":"vinice","maïs":"kukuřice",
"équipe":"tým","match":"zápas","but":"gól","arbitre":"rozhodčí","terrain":"hřiště","tournoi":"turnaj","victoire":"vítězství","défaite":"porážka","entraînement":"trénink","adversaire":"soupeř","champion":"šampion","médaille":"medaile",
"peintre":"malíř","tableau":"obraz","sculpture":"plastika","sculpteur":"sochař","atelier":"ateliér","dessin":"kresba","œuvre":"dílo","portrait":"portrét","chef-d'œuvre":"mistrovské dílo","galerie":"galerie","exposer":"vystavovat",
"colis":"balík","timbre":"poštovní známka","enveloppe":"obálka","livraison":"doručení","expéditeur":"odesílatel","destinataire":"příjemce","formulaire":"formulář","signature":"podpis","tampon":"razítko",
"balayer":"zametat","aspirateur":"vysavač","lessive":"praní","vaisselle":"nádobí","poussière":"prach","balai":"koště","seau":"kbelík","éponge":"houbička","serpillière":"mop"
},
zh:{
"embarquement":"登机","décollage":"起飞","atterrissage":"降落","bagage à main":"手提行李","hublot":"舷窗","piste":"跑道",
"quai":"站台","guichet":"售票处","aller simple":"单程票","aller-retour":"往返票","correspondance":"换乘","le train est en retard":"火车 晚点 了","où est le quai":"站台 在 哪里",
"trottoir":"人行道","passage piéton":"人行横道","panneau":"路牌","lampadaire":"路灯","boîte aux lettres":"邮箱","rond-point":"环岛","fontaine":"喷泉","statue":"雕像","banlieue":"郊区","centre-ville":"市中心","tunnel":"隧道",
"ferme":"农场","récolte":"收成","semer":"播种","tracteur":"拖拉机","blé":"小麦","grange":"谷仓","étable":"牛棚","poulailler":"鸡舍","puits":"水井","épouvantail":"稻草人","troupeau":"畜群","berger":"牧羊人","foin":"干草","vigne":"葡萄园","maïs":"玉米",
"équipe":"队","match":"比赛","but":"进球","arbitre":"裁判","terrain":"球场","tournoi":"锦标赛","victoire":"胜利","défaite":"失败","entraînement":"训练","adversaire":"对手","champion":"冠军","médaille":"奖牌",
"peintre":"画家","tableau":"画作","sculpture":"雕塑","sculpteur":"雕塑家","atelier":"工作室","dessin":"图画","œuvre":"作品","portrait":"肖像","chef-d'œuvre":"杰作","galerie":"画廊","exposer":"展出",
"colis":"包裹","timbre":"邮票","enveloppe":"信封","livraison":"送货","expéditeur":"寄件人","destinataire":"收件人","formulaire":"表格","signature":"签名","tampon":"印章",
"balayer":"扫地","aspirateur":"吸尘器","lessive":"洗衣服","vaisselle":"餐具","poussière":"灰尘","balai":"扫帚","seau":"水桶","éponge":"海绵","serpillière":"拖把"
},
ja:{
"embarquement":"搭乗","décollage":"離陸","atterrissage":"着陸","bagage à main":"手荷物","hublot":"舷窓","piste":"滑走路",
"quai":"ホーム","guichet":"窓口","aller simple":"片道切符","aller-retour":"往復切符","correspondance":"乗り換え","le train est en retard":"電車 は 遅れています","où est le quai":"ホーム は どこ です か",
"trottoir":"歩道","passage piéton":"横断歩道","panneau":"標識","lampadaire":"街灯","boîte aux lettres":"ポスト","rond-point":"ロータリー","fontaine":"噴水","statue":"彫像","banlieue":"郊外","centre-ville":"中心街","tunnel":"トンネル",
"ferme":"農場","récolte":"収穫","semer":"種をまきます","tracteur":"トラクター","blé":"小麦","grange":"納屋","étable":"牛小屋","poulailler":"鶏小屋","puits":"井戸","épouvantail":"かかし","troupeau":"群れ","berger":"羊飼い","foin":"干し草","vigne":"ぶどう畑","maïs":"トウモロコシ",
"équipe":"チーム","match":"試合","but":"ゴール","arbitre":"審判","terrain":"グラウンド","tournoi":"トーナメント","victoire":"勝利","défaite":"敗北","entraînement":"トレーニング","adversaire":"相手","champion":"チャンピオン","médaille":"メダル",
"peintre":"画家","tableau":"絵画","sculpture":"彫刻","sculpteur":"彫刻家","atelier":"アトリエ","dessin":"絵","œuvre":"作品","portrait":"肖像画","chef-d'œuvre":"傑作","galerie":"ギャラリー","exposer":"展示します",
"colis":"小包","timbre":"切手","enveloppe":"封筒","livraison":"配達","expéditeur":"差出人","destinataire":"宛先","formulaire":"用紙","signature":"署名","tampon":"はんこ",
"balayer":"掃きます","aspirateur":"掃除機","lessive":"洗濯","vaisselle":"食器","poussière":"ほこり","balai":"ほうき","seau":"バケツ","éponge":"スポンジ","serpillière":"モップ"
},
ko:{
"embarquement":"탑승","décollage":"이륙","atterrissage":"착륙","bagage à main":"기내 수하물","hublot":"비행기 창문","piste":"활주로",
"quai":"승강장","guichet":"매표소","aller simple":"편도표","aller-retour":"왕복표","correspondance":"환승","le train est en retard":"기차가 연착됐어요","où est le quai":"승강장이 어디예요",
"trottoir":"인도","passage piéton":"횡단보도","panneau":"표지판","lampadaire":"가로등","boîte aux lettres":"우체통","rond-point":"로터리","fontaine":"분수","statue":"동상","banlieue":"교외","centre-ville":"시내","tunnel":"터널",
"ferme":"농장","récolte":"수확","semer":"씨를 뿌리다","tracteur":"트랙터","blé":"밀","grange":"헛간","étable":"외양간","poulailler":"닭장","puits":"우물","épouvantail":"허수아비","troupeau":"가축 떼","berger":"양치기","foin":"건초","vigne":"포도밭","maïs":"옥수수",
"équipe":"팀","match":"경기","but":"골","arbitre":"심판","terrain":"운동장","tournoi":"토너먼트","victoire":"승리","défaite":"패배","entraînement":"훈련","adversaire":"상대","champion":"챔피언","médaille":"메달",
"peintre":"화가","tableau":"회화","sculpture":"조각품","sculpteur":"조각가","atelier":"작업실","dessin":"그림","œuvre":"작품","portrait":"초상화","chef-d'œuvre":"걸작","galerie":"갤러리","exposer":"전시하다",
"colis":"소포","timbre":"우표","enveloppe":"봉투","livraison":"배달","expéditeur":"보내는 사람","destinataire":"받는 사람","formulaire":"양식","signature":"서명","tampon":"도장",
"balayer":"쓸다","aspirateur":"청소기","lessive":"빨래","vaisselle":"설거지","poussière":"먼지","balai":"빗자루","seau":"양동이","éponge":"스펀지","serpillière":"대걸레"
},
ar:{
"embarquement":"صعود الطائرة","décollage":"إقلاع","atterrissage":"هبوط","bagage à main":"حقيبة يد","hublot":"نافذة الطائرة","piste":"مدرج",
"quai":"رصيف","guichet":"شباك التذاكر","aller simple":"تذكرة ذهاب","aller-retour":"تذكرة ذهاب وعودة","correspondance":"تبديل","le train est en retard":"القطار متأخر","où est le quai":"أين الرصيف",
"trottoir":"رصيف المشاة","passage piéton":"ممر مشاة","panneau":"لافتة","lampadaire":"عمود إنارة","boîte aux lettres":"صندوق بريد","rond-point":"دوار","fontaine":"نافورة","statue":"تمثال","banlieue":"ضواحي","centre-ville":"وسط المدينة","tunnel":"نفق",
"ferme":"مزرعة","récolte":"حصاد","semer":"يزرع","tracteur":"جرار","blé":"قمح","grange":"مخزن الحبوب","étable":"حظيرة","poulailler":"قن الدجاج","puits":"بئر","épouvantail":"فزاعة","troupeau":"قطيع","berger":"راعٍ","foin":"قش","vigne":"كرم العنب","maïs":"ذرة",
"équipe":"فريق","match":"مباراة","but":"هدف","arbitre":"حكم","terrain":"أرض الملعب","tournoi":"بطولة","victoire":"انتصار","défaite":"هزيمة","entraînement":"تمرين","adversaire":"خصم","champion":"بطل","médaille":"ميدالية",
"peintre":"رسام","tableau":"لوحة","sculpture":"منحوتة","sculpteur":"نحات","atelier":"ورشة","dessin":"رسم","œuvre":"عمل فني","portrait":"بورتريه","chef-d'œuvre":"تحفة","galerie":"صالة عرض","exposer":"يقيم معرضًا",
"colis":"طرد","timbre":"طابع بريدي","enveloppe":"ظرف","livraison":"توصيل","expéditeur":"مرسل","destinataire":"مستلم","formulaire":"استمارة","signature":"توقيع","tampon":"ختم",
"balayer":"يكنس","aspirateur":"مكنسة كهربائية","lessive":"غسيل الملابس","vaisselle":"غسيل الأطباق","poussière":"غبار","balai":"مكنسة","seau":"دلو","éponge":"إسفنجة","serpillière":"ممسحة"
}
};
LANGS2.forEach(function(l){ var m2=LEX2M[l]||{}; Object.keys(m2).forEach(function(k){ LEX2[l][k]=m2[k]; }); });
/* ── Vague 14 nouvelles langues (v2.83) : unités 105-112 — la grande famille, les grands
   jours, communiquer, verbes précieux, se repérer, les fruits du verger, à l'hôtel, en mer.
   Anti-collisions vérifiées : époux ≠ mari partout (ru супруг/муж, cs choť/manžel,
   zh 配偶/丈夫, ja 配偶者, ko 배우자, ar قرين/زوج, uk муж bookish/чоловік) ;
   au-dessus/au-dessous ≠ sur/sous (pl powyżej/poniżej, ru выше/ниже, uk вище/нижче,
   cs výše/níže, ar أعلى/أسفل car فوق=sur تحت=sous) ; filet=sieć rybacka/рыболовная
   сеть/rybářská síť (sieć/сеть/síť=réseau) ; ru prévenir=извещать (предупреждать=avertir) ;
   ar à l'extérieur=خارجًا (في الخارج=à l'étranger), cérémonie=مراسم (حفلة=fête).
   Homographes réels assumés : ko 밤 = nuit ET châtaigne (le classique coréen) ;
   cs mezi = entre ET parmi (même mot, pas d'alternative). */
var LEX2N = {
pl:{
"beau-père":"teść","belle-mère":"teściowa","gendre":"zięć","belle-sœur":"szwagierka","beau-frère":"szwagier","époux":"małżonek","jumeaux":"bliźniaki","aîné":"najstarszy","cadet":"najmłodszy","petit-fils":"wnuk","petite-fille":"wnuczka","veuf":"wdowiec",
"cérémonie":"ceremonia","bouquet":"bukiet","alliance":"obrączka","discours":"przemówienie","félicitations pour ton mariage":"gratulacje z okazji ślubu","baptême":"chrzest","enterrement":"pogrzeb",
"annoncer":"ogłaszać","prévenir":"uprzedzać","saluer":"pozdrawiać","interrompre":"przerywać","prononcer":"wymawiać","puis-je vous aider":"czy mogę pomóc","bavarder":"gadać","chuchoter":"szeptać","se plaindre":"narzekać","avouer":"przyznawać się","exagérer":"przesadzać",
"éviter":"unikać","oser":"odważać się","mériter":"zasługiwać","atteindre":"osiągać","appartenir":"należeć","dépendre":"zależeć","à qui appartient ce sac":"do kogo należy ta torba","sembler":"wydawać się","paraître":"zdawać się","exister":"istnieć","suffire":"wystarczać","diminuer":"zmniejszać","augmenter":"zwiększać","réclamer":"domagać się","emballer":"pakować","serrer":"ściskać","lâcher":"puszczać",
"au-dessus":"powyżej","au-dessous":"poniżej","à travers":"przez","le long de":"wzdłuż","parmi":"wśród","contre":"przeciwko","au fond de":"na dnie","autour":"wokół","vers":"w stronę","en face":"naprzeciwko","à l'intérieur":"wewnątrz","à l'extérieur":"na zewnątrz","au milieu":"pośrodku",
"framboise":"malina","cerise":"wiśnia","prune":"śliwka","myrtille":"borówka","pêche":"brzoskwinia","abricot":"morela","melon":"melon","pastèque":"arbuz","ananas":"ananas","concombre":"ogórek","poireau":"por","chou":"kapusta","noix":"orzech","noisette":"orzech laskowy","châtaigne":"kasztan",
"réception":"recepcja","réceptionniste":"recepcjonista","chambre double":"pokój dwuosobowy","chambre simple":"pokój jednoosobowy","auberge":"gospoda","climatisation":"klimatyzacja","chauffage":"ogrzewanie","oreiller":"poduszka","couverture":"koc","drap":"prześcieradło",
"voile":"żagiel","ancre":"kotwica","équipage":"załoga","capitaine":"kapitan","croisière":"rejs","port":"port","phare":"latarnia morska","marée":"przypływ","mouette":"mewa","filet":"sieć rybacka","naufrage":"rozbicie statku","bouée":"boja"
},
ru:{
"beau-père":"тесть","belle-mère":"тёща","gendre":"зять","belle-sœur":"невестка","beau-frère":"шурин","époux":"супруг","jumeaux":"близнецы","aîné":"старший","cadet":"младший","petit-fils":"внук","petite-fille":"внучка","veuf":"вдовец",
"cérémonie":"церемония","bouquet":"букет","alliance":"обручальное кольцо","discours":"речь","félicitations pour ton mariage":"поздравляю со свадьбой","baptême":"крещение","enterrement":"похороны",
"annoncer":"объявлять","prévenir":"извещать","saluer":"здороваться","interrompre":"перебивать","prononcer":"произносить","puis-je vous aider":"чем я могу помочь","bavarder":"болтать","chuchoter":"шептать","se plaindre":"жаловаться","avouer":"признаваться","exagérer":"преувеличивать",
"éviter":"избегать","oser":"осмеливаться","mériter":"заслуживать","atteindre":"достигать","appartenir":"принадлежать","dépendre":"зависеть","à qui appartient ce sac":"чья это сумка","sembler":"казаться","paraître":"выглядеть","exister":"существовать","suffire":"хватать","diminuer":"уменьшать","augmenter":"увеличивать","réclamer":"требовать","emballer":"упаковывать","serrer":"сжимать","lâcher":"отпускать",
"au-dessus":"выше","au-dessous":"ниже","à travers":"сквозь","le long de":"вдоль","parmi":"среди","contre":"против","au fond de":"на дне","autour":"вокруг","vers":"в сторону","en face":"напротив","à l'intérieur":"внутри","à l'extérieur":"снаружи","au milieu":"посередине",
"framboise":"малина","cerise":"вишня","prune":"слива","myrtille":"черника","pêche":"персик","abricot":"абрикос","melon":"дыня","pastèque":"арбуз","ananas":"ананас","concombre":"огурец","poireau":"лук-порей","chou":"капуста","noix":"орех","noisette":"фундук","châtaigne":"каштан",
"réception":"стойка регистрации","réceptionniste":"администратор","chambre double":"двухместный номер","chambre simple":"одноместный номер","auberge":"постоялый двор","climatisation":"кондиционер","chauffage":"отопление","oreiller":"подушка","couverture":"одеяло","drap":"простыня",
"voile":"парус","ancre":"якорь","équipage":"экипаж","capitaine":"капитан","croisière":"круиз","port":"порт","phare":"маяк","marée":"прилив","mouette":"чайка","filet":"рыболовная сеть","naufrage":"кораблекрушение","bouée":"буй"
},
uk:{
"beau-père":"тесть","belle-mère":"теща","gendre":"зять","belle-sœur":"невістка","beau-frère":"шурин","époux":"муж","jumeaux":"близнюки","aîné":"старший","cadet":"молодший","petit-fils":"онук","petite-fille":"онука","veuf":"вдівець",
"cérémonie":"церемонія","bouquet":"букет","alliance":"обручка","discours":"промова","félicitations pour ton mariage":"вітаю з весіллям","baptême":"хрещення","enterrement":"похорон",
"annoncer":"оголошувати","prévenir":"сповіщати","saluer":"вітатися","interrompre":"перебивати","prononcer":"вимовляти","puis-je vous aider":"чим я можу допомогти","bavarder":"балакати","chuchoter":"шепотіти","se plaindre":"скаржитися","avouer":"зізнаватися","exagérer":"перебільшувати",
"éviter":"уникати","oser":"наважуватися","mériter":"заслуговувати","atteindre":"досягати","appartenir":"належати","dépendre":"залежати","à qui appartient ce sac":"чия це сумка","sembler":"здаватися","paraître":"видаватися","exister":"існувати","suffire":"вистачати","diminuer":"зменшувати","augmenter":"збільшувати","réclamer":"вимагати","emballer":"пакувати","serrer":"стискати","lâcher":"відпускати",
"au-dessus":"вище","au-dessous":"нижче","à travers":"крізь","le long de":"вздовж","parmi":"серед","contre":"проти","au fond de":"на дні","autour":"навколо","vers":"у бік","en face":"навпроти","à l'intérieur":"всередині","à l'extérieur":"зовні","au milieu":"посередині",
"framboise":"малина","cerise":"вишня","prune":"слива","myrtille":"чорниця","pêche":"персик","abricot":"абрикос","melon":"диня","pastèque":"кавун","ananas":"ананас","concombre":"огірок","poireau":"цибуля-порей","chou":"капуста","noix":"горіх","noisette":"фундук","châtaigne":"каштан",
"réception":"рецепція","réceptionniste":"адміністратор","chambre double":"двомісний номер","chambre simple":"одномісний номер","auberge":"корчма","climatisation":"кондиціонер","chauffage":"опалення","oreiller":"подушка","couverture":"ковдра","drap":"простирадло",
"voile":"вітрило","ancre":"якір","équipage":"екіпаж","capitaine":"капітан","croisière":"круїз","port":"порт","phare":"маяк","marée":"приплив","mouette":"чайка","filet":"рибальська сітка","naufrage":"корабельна аварія","bouée":"буй"
},
cs:{
"beau-père":"tchán","belle-mère":"tchyně","gendre":"zeť","belle-sœur":"švagrová","beau-frère":"švagr","époux":"choť","jumeaux":"dvojčata","aîné":"nejstarší","cadet":"nejmladší","petit-fils":"vnuk","petite-fille":"vnučka","veuf":"vdovec",
"cérémonie":"obřad","bouquet":"kytice","alliance":"snubní prsten","discours":"projev","félicitations pour ton mariage":"gratuluji ke svatbě","baptême":"křest","enterrement":"pohřeb",
"annoncer":"oznamovat","prévenir":"upozorňovat","saluer":"zdravit","interrompre":"přerušovat","prononcer":"vyslovovat","puis-je vous aider":"mohu vám pomoci","bavarder":"povídat si","chuchoter":"šeptat","se plaindre":"stěžovat si","avouer":"přiznávat se","exagérer":"přehánět",
"éviter":"vyhýbat se","oser":"odvažovat se","mériter":"zasloužit si","atteindre":"dosahovat","appartenir":"patřit","dépendre":"záviset","à qui appartient ce sac":"komu patří ta taška","sembler":"zdát se","paraître":"jevit se","exister":"existovat","suffire":"stačit","diminuer":"zmenšovat","augmenter":"zvětšovat","réclamer":"domáhat se","emballer":"balit","serrer":"svírat","lâcher":"pouštět",
"au-dessus":"výše","au-dessous":"níže","à travers":"skrz","le long de":"podél","parmi":"mezi","contre":"proti","au fond de":"na dně","autour":"kolem","vers":"směrem k","en face":"naproti","à l'intérieur":"uvnitř","à l'extérieur":"venku","au milieu":"uprostřed",
"framboise":"malina","cerise":"třešeň","prune":"švestka","myrtille":"borůvka","pêche":"broskev","abricot":"meruňka","melon":"meloun","pastèque":"vodní meloun","ananas":"ananas","concombre":"okurka","poireau":"pórek","chou":"zelí","noix":"ořech","noisette":"lískový ořech","châtaigne":"kaštan",
"réception":"recepce","réceptionniste":"recepční","chambre double":"dvoulůžkový pokoj","chambre simple":"jednolůžkový pokoj","auberge":"hostinec","climatisation":"klimatizace","chauffage":"topení","oreiller":"polštář","couverture":"deka","drap":"prostěradlo",
"voile":"plachta","ancre":"kotva","équipage":"posádka","capitaine":"kapitán","croisière":"plavba","port":"přístav","phare":"maják","marée":"příliv","mouette":"racek","filet":"rybářská síť","naufrage":"ztroskotání","bouée":"bóje"
},
zh:{
"beau-père":"岳父","belle-mère":"岳母","gendre":"女婿","belle-sœur":"嫂子","beau-frère":"姐夫","époux":"配偶","jumeaux":"双胞胎","aîné":"长子","cadet":"幼子","petit-fils":"孙子","petite-fille":"孙女","veuf":"鳏夫",
"cérémonie":"仪式","bouquet":"花束","alliance":"婚戒","discours":"演讲","félicitations pour ton mariage":"恭喜 你 结婚","baptême":"洗礼","enterrement":"葬礼",
"annoncer":"宣布","prévenir":"通知","saluer":"打招呼","interrompre":"打断","prononcer":"发音","puis-je vous aider":"我 能 帮 你 吗","bavarder":"聊天","chuchoter":"小声说","se plaindre":"抱怨","avouer":"承认","exagérer":"夸张",
"éviter":"避免","oser":"敢","mériter":"值得","atteindre":"达到","appartenir":"属于","dépendre":"取决于","à qui appartient ce sac":"这个 包 是 谁 的","sembler":"好像","paraître":"显得","exister":"存在","suffire":"足够","diminuer":"减少","augmenter":"增加","réclamer":"要求","emballer":"包装","serrer":"握紧","lâcher":"放开",
"au-dessus":"上方","au-dessous":"下方","à travers":"穿过","le long de":"沿着","parmi":"之中","contre":"靠着","au fond de":"在深处","autour":"周围","vers":"朝","en face":"对面","à l'intérieur":"在里面","à l'extérieur":"在外面","au milieu":"在中间",
"framboise":"覆盆子","cerise":"樱桃","prune":"李子","myrtille":"蓝莓","pêche":"桃子","abricot":"杏","melon":"甜瓜","pastèque":"西瓜","ananas":"菠萝","concombre":"黄瓜","poireau":"韭葱","chou":"卷心菜","noix":"核桃","noisette":"榛子","châtaigne":"栗子",
"réception":"前台","réceptionniste":"前台接待员","chambre double":"双人房","chambre simple":"单人房","auberge":"客栈","climatisation":"空调","chauffage":"暖气","oreiller":"枕头","couverture":"毯子","drap":"床单",
"voile":"帆","ancre":"锚","équipage":"船员","capitaine":"船长","croisière":"邮轮旅行","port":"港口","phare":"灯塔","marée":"潮汐","mouette":"海鸥","filet":"渔网","naufrage":"海难","bouée":"救生圈"
},
ja:{
"beau-père":"義理の父","belle-mère":"義理の母","gendre":"婿","belle-sœur":"義理の姉","beau-frère":"義理の兄","époux":"配偶者","jumeaux":"双子","aîné":"長男","cadet":"末っ子","petit-fils":"孫息子","petite-fille":"孫娘","veuf":"男やもめ",
"cérémonie":"式典","bouquet":"花束","alliance":"結婚指輪","discours":"スピーチ","félicitations pour ton mariage":"ご結婚 おめでとう ございます","baptême":"洗礼式","enterrement":"葬式",
"annoncer":"発表します","prévenir":"知らせます","saluer":"挨拶します","interrompre":"さえぎります","prononcer":"発音します","puis-je vous aider":"お手伝い しましょう か","bavarder":"おしゃべりします","chuchoter":"ささやきます","se plaindre":"文句を言います","avouer":"白状します","exagérer":"大げさに言います",
"éviter":"避けます","oser":"思い切ってします","mériter":"〜に値します","atteindre":"達します","appartenir":"属します","dépendre":"〜によります","à qui appartient ce sac":"この かばん は 誰 の です か","sembler":"〜のようです","paraître":"見えます","exister":"存在します","suffire":"足ります","diminuer":"減らします","augmenter":"増やします","réclamer":"要求します","emballer":"包みます","serrer":"握ります","lâcher":"放します",
"au-dessus":"真上","au-dessous":"真下","à travers":"〜を通って","le long de":"〜に沿って","parmi":"〜の中で","contre":"〜に対して","au fond de":"〜の奥に","autour":"〜の周りに","vers":"〜へ向かって","en face":"向かい","à l'intérieur":"内側に","à l'extérieur":"外側に","au milieu":"真ん中に",
"framboise":"ラズベリー","cerise":"さくらんぼ","prune":"プラム","myrtille":"ブルーベリー","pêche":"桃","abricot":"あんず","melon":"メロン","pastèque":"スイカ","ananas":"パイナップル","concombre":"きゅうり","poireau":"リーキ","chou":"キャベツ","noix":"クルミ","noisette":"ヘーゼルナッツ","châtaigne":"栗",
"réception":"フロント","réceptionniste":"フロント係","chambre double":"ダブルルーム","chambre simple":"シングルルーム","auberge":"宿屋","climatisation":"エアコン","chauffage":"暖房","oreiller":"枕","couverture":"毛布","drap":"シーツ",
"voile":"帆","ancre":"錨","équipage":"乗組員","capitaine":"船長","croisière":"クルーズ","port":"港","phare":"灯台","marée":"潮","mouette":"カモメ","filet":"網","naufrage":"難破","bouée":"浮き輪"
},
ko:{
"beau-père":"시아버지","belle-mère":"시어머니","gendre":"사위","belle-sœur":"형수","beau-frère":"매형","époux":"배우자","jumeaux":"쌍둥이","aîné":"맏이","cadet":"막내","petit-fils":"손자","petite-fille":"손녀","veuf":"홀아비",
"cérémonie":"예식","bouquet":"꽃다발","alliance":"결혼반지","discours":"연설","félicitations pour ton mariage":"결혼 축하해요","baptême":"세례","enterrement":"장례식",
"annoncer":"발표하다","prévenir":"알리다","saluer":"인사하다","interrompre":"끼어들다","prononcer":"발음하다","puis-je vous aider":"도와드릴까요","bavarder":"수다를 떨다","chuchoter":"속삭이다","se plaindre":"불평하다","avouer":"인정하다","exagérer":"과장하다",
"éviter":"피하다","oser":"감히 하다","mériter":"자격이 있다","atteindre":"도달하다","appartenir":"속하다","dépendre":"달려 있다","à qui appartient ce sac":"이 가방은 누구 거예요","sembler":"것 같다","paraître":"보이다","exister":"존재하다","suffire":"충분하다","diminuer":"줄이다","augmenter":"늘리다","réclamer":"요구하다","emballer":"포장하다","serrer":"꽉 쥐다","lâcher":"놓다",
"au-dessus":"위쪽에","au-dessous":"아래쪽에","à travers":"통해서","le long de":"따라서","parmi":"가운데","contre":"에 기대어","au fond de":"깊숙한 곳에","autour":"주위에","vers":"쪽으로","en face":"맞은편에","à l'intérieur":"안쪽에","à l'extérieur":"바깥쪽에","au milieu":"한가운데에",
"framboise":"라즈베리","cerise":"체리","prune":"자두","myrtille":"블루베리","pêche":"복숭아","abricot":"살구","melon":"멜론","pastèque":"수박","ananas":"파인애플","concombre":"오이","poireau":"리크","chou":"양배추","noix":"호두","noisette":"헤이즐넛","châtaigne":"밤",
"réception":"프런트","réceptionniste":"프런트 직원","chambre double":"더블룸","chambre simple":"싱글룸","auberge":"여관","climatisation":"에어컨","chauffage":"난방","oreiller":"베개","couverture":"담요","drap":"침대 시트",
"voile":"돛","ancre":"닻","équipage":"승무원","capitaine":"선장","croisière":"크루즈","port":"항구","phare":"등대","marée":"조수","mouette":"갈매기","filet":"그물","naufrage":"난파","bouée":"부표"
},
ar:{
"beau-père":"حمو","belle-mère":"حماة","gendre":"صهر","belle-sœur":"أخت الزوج","beau-frère":"أخو الزوج","époux":"قرين","jumeaux":"توأم","aîné":"البكر","cadet":"الأصغر","petit-fils":"حفيد","petite-fille":"حفيدة","veuf":"أرمل",
"cérémonie":"مراسم","bouquet":"باقة زهور","alliance":"خاتم الزواج","discours":"خطبة","félicitations pour ton mariage":"مبروك الزواج","baptême":"معمودية","enterrement":"جنازة",
"annoncer":"يعلن","prévenir":"يبلغ","saluer":"يسلم على","interrompre":"يقاطع","prononcer":"ينطق","puis-je vous aider":"هل يمكنني مساعدتك","bavarder":"يدردش","chuchoter":"يهمس","se plaindre":"يشتكي","avouer":"يعترف","exagérer":"يبالغ",
"éviter":"يتجنب","oser":"يجرؤ","mériter":"يستحق","atteindre":"يصل إلى","appartenir":"ينتمي إلى","dépendre":"يعتمد على","à qui appartient ce sac":"لمن هذه الحقيبة","sembler":"يبدو","paraître":"يظهر","exister":"يوجد","suffire":"يكفي","diminuer":"يقلل","augmenter":"يزيد","réclamer":"يطالب","emballer":"يغلف","serrer":"يشد","lâcher":"يفلت",
"au-dessus":"أعلى","au-dessous":"أسفل","à travers":"عبر","le long de":"على طول","parmi":"من بين","contre":"ضد","au fond de":"في قاع","autour":"حول","vers":"نحو","en face":"مقابل","à l'intérieur":"في الداخل","à l'extérieur":"خارجًا","au milieu":"في المنتصف",
"framboise":"توت العليق","cerise":"كرز","prune":"برقوق","myrtille":"توت أزرق","pêche":"خوخ","abricot":"مشمش","melon":"شمام","pastèque":"بطيخ","ananas":"أناناس","concombre":"خيار","poireau":"كراث","chou":"ملفوف","noix":"جوز","noisette":"بندق","châtaigne":"كستناء",
"réception":"استقبال","réceptionniste":"موظف استقبال","chambre double":"غرفة مزدوجة","chambre simple":"غرفة مفردة","auberge":"نزل","climatisation":"مكيف","chauffage":"تدفئة","oreiller":"وسادة","couverture":"بطانية","drap":"ملاءة",
"voile":"شراع","ancre":"مرساة","équipage":"طاقم","capitaine":"قبطان","croisière":"رحلة بحرية","port":"ميناء","phare":"منارة","marée":"مد وجزر","mouette":"نورس","filet":"شبكة صيد","naufrage":"غرق السفينة","bouée":"عوامة"
}
};
LANGS2.forEach(function(l){ var n2=LEX2N[l]||{}; Object.keys(n2).forEach(function(k){ LEX2[l][k]=n2[k]; }); });
/* ── Vague 15 nouvelles langues (v2.84) : unités 113-120 — la vie marine, l'espace,
   les sciences, la justice, il était une fois, sous le capot, le corps au-dedans,
   l'élégance. Anti-collisions vérifiées : cs coffre=kufr auta (kufr=valise),
   algue=mořská řasa / cil=řasa distingués ; ko estomac=위장 (위=sur) ;
   ru nœud papillon=галстук-бабочка (бабочка=papillon), fermeture éclair=
   застёжка-молния (молния=éclair) ; uk краватка-метелик, застібка-блискавка ;
   ar coupable=مدان (مذنب=comète), algue=أعشاب بحرية (طحلب=mousse).
   Homographes réels assumés (même mot dans la langue, pas d'alternative) :
   pl sędzia, ru судья, uk суддя = arbitre ET juge ; ko 기사 = article ET chevalier ;
   ar بطل = champion ET héros. */
var LEX2O = {
pl:{
"algue":"wodorost","coquillage":"muszla","crabe":"krab","méduse":"meduza","pieuvre":"ośmiornica",
"fusée":"rakieta","navette":"prom kosmiczny","satellite":"satelita","astronaute":"astronauta","télescope":"teleskop","gravité":"grawitacja","comète":"kometa","galaxie":"galaktyka","univers":"wszechświat","étoile filante":"spadająca gwiazda","ovni":"UFO","extraterrestre":"kosmita",
"chimie":"chemia","physique":"fizyka","biologie":"biologia","laboratoire":"laboratorium","microscope":"mikroskop","invention":"wynalazek","découverte":"odkrycie","chercheur":"badacz","théorie":"teoria","cerveau":"mózg",
"tribunal":"sąd","juge":"sędzia","procès":"proces","preuve":"dowód","plainte":"skarga","coupable":"winny","innocent":"niewinny","prison":"więzienie","amende":"grzywna","interdit":"zakazany",
"couronne":"korona","trône":"tron","chevalier":"rycerz","héros":"bohater","empire":"imperium","il était une fois":"dawno, dawno temu","bataille":"bitwa","armée":"wojsko","soldat":"żołnierz","révolution":"rewolucja","épée":"miecz","bouclier":"tarcza","flèche":"strzała","canon":"armata",
"moteur":"silnik","frein":"hamulec","pneu":"opona","volant":"kierownica","coffre":"bagażnik","capot":"maska silnika","klaxon":"klakson","rétroviseur":"lusterko wsteczne","pare-brise":"przednia szyba","essuie-glace":"wycieraczka","embouteillage":"korek","panne":"awaria",
"poumon":"płuco","estomac":"żołądek","foie":"wątroba","muscle":"mięsień","squelette":"szkielet","veine":"żyła","côte":"żebro","cheville":"kostka","poignet":"nadgarstek","menton":"podbródek","hanche":"biodro","mollet":"łydka","sourcil":"brew","cil":"rzęsa","paupière":"powieka","nuque":"kark","paume":"dłoń",
"costume":"garnitur","cravate":"krawat","nœud papillon":"muszka","gilet":"kamizelka","imperméable":"płaszcz przeciwdeszczowy","bretelles":"szelki","fermeture éclair":"zamek błyskawiczny","talon":"obcas","semelle":"podeszwa","lacet":"sznurówka","col":"kołnierz","manche":"rękaw"
},
ru:{
"algue":"водоросль","coquillage":"ракушка","crabe":"краб","méduse":"медуза","pieuvre":"осьминог",
"fusée":"ракета","navette":"шаттл","satellite":"спутник","astronaute":"космонавт","télescope":"телескоп","gravité":"гравитация","comète":"комета","galaxie":"галактика","univers":"вселенная","étoile filante":"падающая звезда","ovni":"НЛО","extraterrestre":"инопланетянин",
"chimie":"химия","physique":"физика","biologie":"биология","laboratoire":"лаборатория","microscope":"микроскоп","invention":"изобретение","découverte":"открытие","chercheur":"исследователь","théorie":"теория","cerveau":"мозг",
"tribunal":"суд","juge":"судья","procès":"судебный процесс","preuve":"доказательство","plainte":"жалоба","coupable":"виновный","innocent":"невиновный","prison":"тюрьма","amende":"штраф","interdit":"запрещённый",
"couronne":"корона","trône":"трон","chevalier":"рыцарь","héros":"герой","empire":"империя","il était une fois":"жили-были","bataille":"битва","armée":"армия","soldat":"солдат","révolution":"революция","épée":"меч","bouclier":"щит","flèche":"стрела","canon":"пушка",
"moteur":"двигатель","frein":"тормоз","pneu":"шина","volant":"руль","coffre":"багажник","capot":"капот","klaxon":"клаксон","rétroviseur":"зеркало заднего вида","pare-brise":"лобовое стекло","essuie-glace":"дворники","embouteillage":"пробка","panne":"поломка",
"poumon":"лёгкое","estomac":"желудок","foie":"печень","muscle":"мышца","squelette":"скелет","veine":"вена","côte":"ребро","cheville":"лодыжка","poignet":"запястье","menton":"подбородок","hanche":"бедро","mollet":"икра","sourcil":"бровь","cil":"ресница","paupière":"веко","nuque":"затылок","paume":"ладонь",
"costume":"костюм","cravate":"галстук","nœud papillon":"галстук-бабочка","gilet":"жилет","imperméable":"дождевик","bretelles":"подтяжки","fermeture éclair":"застёжка-молния","talon":"каблук","semelle":"подошва","lacet":"шнурок","col":"воротник","manche":"рукав"
},
uk:{
"algue":"водорість","coquillage":"мушля","crabe":"краб","méduse":"медуза","pieuvre":"восьминіг",
"fusée":"ракета","navette":"шатл","satellite":"супутник","astronaute":"космонавт","télescope":"телескоп","gravité":"гравітація","comète":"комета","galaxie":"галактика","univers":"всесвіт","étoile filante":"падаюча зірка","ovni":"НЛО","extraterrestre":"інопланетянин",
"chimie":"хімія","physique":"фізика","biologie":"біологія","laboratoire":"лабораторія","microscope":"мікроскоп","invention":"винахід","découverte":"відкриття","chercheur":"дослідник","théorie":"теорія","cerveau":"мозок",
"tribunal":"суд","juge":"суддя","procès":"судовий процес","preuve":"доказ","plainte":"скарга","coupable":"винний","innocent":"невинний","prison":"в'язниця","amende":"штраф","interdit":"заборонений",
"couronne":"корона","trône":"трон","chevalier":"лицар","héros":"герой","empire":"імперія","il était une fois":"давним-давно","bataille":"битва","armée":"армія","soldat":"солдат","révolution":"революція","épée":"меч","bouclier":"щит","flèche":"стріла","canon":"гармата",
"moteur":"двигун","frein":"гальмо","pneu":"шина","volant":"кермо","coffre":"багажник","capot":"капот","klaxon":"клаксон","rétroviseur":"дзеркало заднього виду","pare-brise":"лобове скло","essuie-glace":"двірники","embouteillage":"затор","panne":"поломка",
"poumon":"легеня","estomac":"шлунок","foie":"печінка","muscle":"м'яз","squelette":"скелет","veine":"вена","côte":"ребро","cheville":"щиколотка","poignet":"зап'ясток","menton":"підборіддя","hanche":"стегно","mollet":"литка","sourcil":"брова","cil":"вія","paupière":"повіка","nuque":"потилиця","paume":"долоня",
"costume":"костюм","cravate":"краватка","nœud papillon":"краватка-метелик","gilet":"жилет","imperméable":"дощовик","bretelles":"підтяжки","fermeture éclair":"застібка-блискавка","talon":"підбор","semelle":"підошва","lacet":"шнурок","col":"комір","manche":"рукав"
},
cs:{
"algue":"mořská řasa","coquillage":"mušle","crabe":"krab","méduse":"medúza","pieuvre":"chobotnice",
"fusée":"raketa","navette":"raketoplán","satellite":"družice","astronaute":"astronaut","télescope":"teleskop","gravité":"gravitace","comète":"kometa","galaxie":"galaxie","univers":"vesmír","étoile filante":"padající hvězda","ovni":"UFO","extraterrestre":"mimozemšťan",
"chimie":"chemie","physique":"fyzika","biologie":"biologie","laboratoire":"laboratoř","microscope":"mikroskop","invention":"vynález","découverte":"objev","chercheur":"výzkumník","théorie":"teorie","cerveau":"mozek",
"tribunal":"soud","juge":"soudce","procès":"soudní proces","preuve":"důkaz","plainte":"stížnost","coupable":"vinný","innocent":"nevinný","prison":"vězení","amende":"pokuta","interdit":"zakázaný",
"couronne":"koruna","trône":"trůn","chevalier":"rytíř","héros":"hrdina","empire":"říše","il était une fois":"bylo nebylo","bataille":"bitva","armée":"armáda","soldat":"voják","révolution":"revoluce","épée":"meč","bouclier":"štít","flèche":"šíp","canon":"dělo",
"moteur":"motor","frein":"brzda","pneu":"pneumatika","volant":"volant","coffre":"kufr auta","capot":"kapota","klaxon":"klakson","rétroviseur":"zpětné zrcátko","pare-brise":"čelní sklo","essuie-glace":"stěrač","embouteillage":"zácpa","panne":"porucha",
"poumon":"plíce","estomac":"žaludek","foie":"játra","muscle":"sval","squelette":"kostra","veine":"žíla","côte":"žebro","cheville":"kotník","poignet":"zápěstí","menton":"brada","hanche":"kyčel","mollet":"lýtko","sourcil":"obočí","cil":"řasa","paupière":"víčko","nuque":"zátylek","paume":"dlaň",
"costume":"oblek","cravate":"kravata","nœud papillon":"motýlek","gilet":"vesta","imperméable":"pláštěnka","bretelles":"kšandy","fermeture éclair":"zip","talon":"podpatek","semelle":"podrážka","lacet":"tkanička","col":"límec","manche":"rukáv"
},
zh:{
"algue":"海藻","coquillage":"贝壳","crabe":"螃蟹","méduse":"水母","pieuvre":"章鱼",
"fusée":"火箭","navette":"航天飞机","satellite":"卫星","astronaute":"宇航员","télescope":"望远镜","gravité":"重力","comète":"彗星","galaxie":"星系","univers":"宇宙","étoile filante":"流星","ovni":"不明飞行物","extraterrestre":"外星人",
"chimie":"化学","physique":"物理","biologie":"生物学","laboratoire":"实验室","microscope":"显微镜","invention":"发明","découverte":"发现","chercheur":"研究员","théorie":"理论","cerveau":"大脑",
"tribunal":"法院","juge":"法官","procès":"诉讼","preuve":"证据","plainte":"投诉","coupable":"有罪的","innocent":"无罪的","prison":"监狱","amende":"罚款","interdit":"禁止的",
"couronne":"王冠","trône":"王座","chevalier":"骑士","héros":"英雄","empire":"帝国","il était une fois":"很久 很久 以前","bataille":"战役","armée":"军队","soldat":"士兵","révolution":"革命","épée":"剑","bouclier":"盾","flèche":"箭","canon":"大炮",
"moteur":"发动机","frein":"刹车","pneu":"轮胎","volant":"方向盘","coffre":"后备箱","capot":"引擎盖","klaxon":"喇叭","rétroviseur":"后视镜","pare-brise":"挡风玻璃","essuie-glace":"雨刷","embouteillage":"堵车","panne":"故障",
"poumon":"肺","estomac":"胃","foie":"肝脏","muscle":"肌肉","squelette":"骨骼","veine":"静脉","côte":"肋骨","cheville":"脚踝","poignet":"手腕","menton":"下巴","hanche":"髋部","mollet":"小腿","sourcil":"眉毛","cil":"睫毛","paupière":"眼皮","nuque":"后颈","paume":"手掌",
"costume":"西装","cravate":"领带","nœud papillon":"领结","gilet":"马甲","imperméable":"雨衣","bretelles":"背带","fermeture éclair":"拉链","talon":"鞋跟","semelle":"鞋底","lacet":"鞋带","col":"衣领","manche":"袖子"
},
ja:{
"algue":"海藻","coquillage":"貝殻","crabe":"カニ","méduse":"クラゲ","pieuvre":"タコ",
"fusée":"ロケット","navette":"スペースシャトル","satellite":"衛星","astronaute":"宇宙飛行士","télescope":"望遠鏡","gravité":"重力","comète":"彗星","galaxie":"銀河","univers":"宇宙","étoile filante":"流れ星","ovni":"ユーフォー","extraterrestre":"宇宙人",
"chimie":"化学","physique":"物理","biologie":"生物学","laboratoire":"実験室","microscope":"顕微鏡","invention":"発明","découverte":"発見","chercheur":"研究者","théorie":"理論","cerveau":"脳",
"tribunal":"裁判所","juge":"裁判官","procès":"裁判","preuve":"証拠","plainte":"苦情","coupable":"有罪の","innocent":"無罪の","prison":"刑務所","amende":"罰金","interdit":"禁止された",
"couronne":"王冠","trône":"王座","chevalier":"騎士","héros":"英雄","empire":"帝国","il était une fois":"昔々","bataille":"戦い","armée":"軍隊","soldat":"兵士","révolution":"革命","épée":"剣","bouclier":"盾","flèche":"矢","canon":"大砲",
"moteur":"エンジン","frein":"ブレーキ","pneu":"タイヤ","volant":"ハンドル","coffre":"トランク","capot":"ボンネット","klaxon":"クラクション","rétroviseur":"バックミラー","pare-brise":"フロントガラス","essuie-glace":"ワイパー","embouteillage":"渋滞","panne":"故障",
"poumon":"肺","estomac":"胃","foie":"肝臓","muscle":"筋肉","squelette":"骨格","veine":"静脈","côte":"肋骨","cheville":"足首","poignet":"手首","menton":"あご","hanche":"腰","mollet":"ふくらはぎ","sourcil":"眉毛","cil":"まつげ","paupière":"まぶた","nuque":"うなじ","paume":"手のひら",
"costume":"スーツ","cravate":"ネクタイ","nœud papillon":"蝶ネクタイ","gilet":"ベスト","imperméable":"レインコート","bretelles":"サスペンダー","fermeture éclair":"ファスナー","talon":"ヒール","semelle":"靴底","lacet":"靴ひも","col":"襟","manche":"袖"
},
ko:{
"algue":"해초","coquillage":"조개껍데기","crabe":"게","méduse":"해파리","pieuvre":"문어",
"fusée":"로켓","navette":"우주왕복선","satellite":"위성","astronaute":"우주비행사","télescope":"망원경","gravité":"중력","comète":"혜성","galaxie":"은하","univers":"우주","étoile filante":"별똥별","ovni":"유에프오","extraterrestre":"외계인",
"chimie":"화학","physique":"물리학","biologie":"생물학","laboratoire":"실험실","microscope":"현미경","invention":"발명","découverte":"발견","chercheur":"연구원","théorie":"이론","cerveau":"뇌",
"tribunal":"법원","juge":"판사","procès":"재판","preuve":"증거","plainte":"고소","coupable":"유죄의","innocent":"무죄의","prison":"감옥","amende":"벌금","interdit":"금지된",
"couronne":"왕관","trône":"왕좌","chevalier":"기사","héros":"영웅","empire":"제국","il était une fois":"옛날 옛적에","bataille":"전투","armée":"군대","soldat":"군인","révolution":"혁명","épée":"검","bouclier":"방패","flèche":"화살","canon":"대포",
"moteur":"엔진","frein":"브레이크","pneu":"타이어","volant":"핸들","coffre":"트렁크","capot":"보닛","klaxon":"경적","rétroviseur":"백미러","pare-brise":"앞유리","essuie-glace":"와이퍼","embouteillage":"교통 체증","panne":"고장",
"poumon":"폐","estomac":"위장","foie":"간","muscle":"근육","squelette":"골격","veine":"정맥","côte":"갈비뼈","cheville":"발목","poignet":"손목","menton":"턱","hanche":"골반","mollet":"종아리","sourcil":"눈썹","cil":"속눈썹","paupière":"눈꺼풀","nuque":"목덜미","paume":"손바닥",
"costume":"정장","cravate":"넥타이","nœud papillon":"나비넥타이","gilet":"조끼","imperméable":"우비","bretelles":"멜빵","fermeture éclair":"지퍼","talon":"굽","semelle":"밑창","lacet":"신발 끈","col":"옷깃","manche":"소매"
},
ar:{
"algue":"أعشاب بحرية","coquillage":"صدفة","crabe":"سلطعون","méduse":"قنديل البحر","pieuvre":"أخطبوط",
"fusée":"صاروخ","navette":"مكوك فضائي","satellite":"قمر صناعي","astronaute":"رائد فضاء","télescope":"تلسكوب","gravité":"جاذبية","comète":"مذنب","galaxie":"مجرة","univers":"كون","étoile filante":"شهاب","ovni":"جسم طائر مجهول","extraterrestre":"كائن فضائي",
"chimie":"كيمياء","physique":"فيزياء","biologie":"أحياء","laboratoire":"مختبر","microscope":"مجهر","invention":"اختراع","découverte":"اكتشاف","chercheur":"باحث","théorie":"نظرية","cerveau":"دماغ",
"tribunal":"محكمة","juge":"قاضٍ","procès":"محاكمة","preuve":"دليل","plainte":"شكوى","coupable":"مدان","innocent":"بريء","prison":"سجن","amende":"غرامة","interdit":"ممنوع",
"couronne":"تاج","trône":"عرش","chevalier":"فارس","héros":"بطل","empire":"إمبراطورية","il était une fois":"كان يا ما كان","bataille":"معركة","armée":"جيش","soldat":"جندي","révolution":"ثورة","épée":"سيف","bouclier":"درع","flèche":"سهم","canon":"مدفع",
"moteur":"محرك","frein":"فرامل","pneu":"إطار","volant":"مقود","coffre":"صندوق السيارة","capot":"غطاء المحرك","klaxon":"بوق","rétroviseur":"مرآة جانبية","pare-brise":"زجاج أمامي","essuie-glace":"مساحة الزجاج","embouteillage":"ازدحام مروري","panne":"عطل",
"poumon":"رئة","estomac":"معدة","foie":"كبد","muscle":"عضلة","squelette":"هيكل عظمي","veine":"وريد","côte":"ضلع","cheville":"كاحل","poignet":"معصم","menton":"ذقن","hanche":"ورك","mollet":"ربلة الساق","sourcil":"حاجب","cil":"رمش","paupière":"جفن","nuque":"قفا","paume":"راحة اليد",
"costume":"بدلة","cravate":"ربطة عنق","nœud papillon":"ربطة فراشة","gilet":"صدرية","imperméable":"معطف مطر","bretelles":"حمالات","fermeture éclair":"سحاب","talon":"كعب","semelle":"نعل","lacet":"رباط الحذاء","col":"ياقة","manche":"كم القميص"
}
};
LANGS2.forEach(function(l){ var o2=LEX2O[l]||{}; Object.keys(o2).forEach(function(k){ LEX2[l][k]=o2[k]; }); });
/* ── Vague 16 nouvelles langues (v2.85) : unités 121-128 — le plein air, ustensiles
   malins, les métiers, en musique, la Terre en colère, adjectifs qui brillent, verbes
   d'action, les mots du temps. Anti-collisions vérifiées : bouchon=korek do butelki /
   пробка от бутылки (korek/пробка=embouteillage) ; jumelles zh=双筒望远镜 (望远镜=
   télescope), cs=dalekohled (teleskop=télescope) ; uk trompette=сурма (труба=tuyau),
   cs=trumpeta (trubka=tuyau), ar=بوق موسيقي (بوق=klaxon) ; aussitôt distinct de tout
   de suite partout (pl od razu, ru сразу, cs okamžitě, zh 立刻, ja ただちに, ko 즉시,
   ar حالاً) ; ja appuyer=押さえます (押します=pousser).
   Homographe réel assumé : ru труба = tuyau ET trompette (même mot). */
var LEX2P = {
pl:{
"camping":"kemping","tente":"namiot","sac de couchage":"śpiwór","lampe de poche":"latarka","hamac":"hamak","randonnée":"wędrówka","chasse":"polowanie","boussole":"kompas","jumelles":"lornetka","feu de camp":"ognisko",
"fouet":"trzepaczka","louche":"chochla","passoire":"durszlak","râpe":"tarka","entonnoir":"lejek","couvercle":"pokrywka","bouchon":"korek do butelki","tire-bouchon":"korkociąg","glaçon":"kostka lodu","paille":"słomka",
"plombier":"hydraulik","électricien":"elektryk","menuisier":"stolarz","bijoutier":"jubiler","vétérinaire":"weterynarz","pêcheur":"rybak","chauffeur":"kierowca","fleuriste":"kwiaciarz",
"orchestre":"orkiestra","violon":"skrzypce","flûte":"flet","trompette":"trąbka","mélodie":"melodia","rythme":"rytm","chorale":"chór","tambour":"bęben",
"volcan":"wulkan","inondation":"powódź","tremblement de terre":"trzęsienie ziemi","avalanche":"lawina","canicule":"upał","continent":"kontynent",
"étonnant":"zdumiewający","effrayant":"przerażający","passionnant":"pasjonujący","émouvant":"wzruszający","précieux":"cenny","semblable":"podobny","épuisant":"wyczerpujący","décevant":"rozczarowujący","indispensable":"niezbędny","disponible":"dostępny","provisoire":"tymczasowy",
"détruire":"niszczyć","creuser":"kopać","vider":"opróżniać","verrouiller":"zamykać na klucz","brancher":"podłączać","débrancher":"odłączać","appuyer":"naciskać","secouer":"potrząsać","frotter":"pocierać","essuyer":"wycierać","plonger":"nurkować","ramer":"wiosłować",
"autrefois":"dawniej","récemment":"niedawno","désormais":"odtąd","auparavant":"przedtem","à l'avenir":"w przyszłości","aussitôt":"od razu","tout à coup":"nagle","dès que":"jak tylko"
},
ru:{
"camping":"кемпинг","tente":"палатка","sac de couchage":"спальный мешок","lampe de poche":"фонарик","hamac":"гамак","randonnée":"поход","chasse":"охота","boussole":"компас","jumelles":"бинокль","feu de camp":"костёр",
"fouet":"венчик","louche":"половник","passoire":"дуршлаг","râpe":"тёрка","entonnoir":"воронка","couvercle":"крышка","bouchon":"пробка от бутылки","tire-bouchon":"штопор","glaçon":"кубик льда","paille":"соломинка",
"plombier":"сантехник","électricien":"электрик","menuisier":"столяр","bijoutier":"ювелир","vétérinaire":"ветеринар","pêcheur":"рыбак","chauffeur":"водитель","fleuriste":"флорист",
"orchestre":"оркестр","violon":"скрипка","flûte":"флейта","trompette":"труба","mélodie":"мелодия","rythme":"ритм","chorale":"хор","tambour":"барабан",
"volcan":"вулкан","inondation":"наводнение","tremblement de terre":"землетрясение","avalanche":"лавина","canicule":"жара","continent":"континент",
"étonnant":"удивительный","effrayant":"пугающий","passionnant":"увлекательный","émouvant":"трогательный","précieux":"драгоценный","semblable":"похожий","épuisant":"изнурительный","décevant":"разочаровывающий","indispensable":"необходимый","disponible":"доступный","provisoire":"временный",
"détruire":"разрушать","creuser":"копать","vider":"опустошать","verrouiller":"запирать","brancher":"подключать","débrancher":"отключать","appuyer":"нажимать","secouer":"трясти","frotter":"тереть","essuyer":"вытирать","plonger":"нырять","ramer":"грести",
"autrefois":"раньше","récemment":"недавно","désormais":"отныне","auparavant":"прежде","à l'avenir":"в будущем","aussitôt":"сразу","tout à coup":"вдруг","dès que":"как только"
},
uk:{
"camping":"кемпінг","tente":"намет","sac de couchage":"спальник","lampe de poche":"ліхтарик","hamac":"гамак","randonnée":"похід","chasse":"полювання","boussole":"компас","jumelles":"бінокль","feu de camp":"багаття",
"fouet":"віночок","louche":"ополоник","passoire":"друшляк","râpe":"тертка","entonnoir":"лійка","couvercle":"кришка","bouchon":"корок","tire-bouchon":"штопор","glaçon":"кубик льоду","paille":"соломинка",
"plombier":"сантехнік","électricien":"електрик","menuisier":"столяр","bijoutier":"ювелір","vétérinaire":"ветеринар","pêcheur":"рибалка","chauffeur":"водій","fleuriste":"флорист",
"orchestre":"оркестр","violon":"скрипка","flûte":"флейта","trompette":"сурма","mélodie":"мелодія","rythme":"ритм","chorale":"хор","tambour":"барабан",
"volcan":"вулкан","inondation":"повінь","tremblement de terre":"землетрус","avalanche":"лавина","canicule":"спека","continent":"континент",
"étonnant":"дивовижний","effrayant":"моторошний","passionnant":"захопливий","émouvant":"зворушливий","précieux":"коштовний","semblable":"схожий","épuisant":"виснажливий","décevant":"невтішний","indispensable":"необхідний","disponible":"доступний","provisoire":"тимчасовий",
"détruire":"руйнувати","creuser":"копати","vider":"спорожняти","verrouiller":"замикати","brancher":"підключати","débrancher":"відключати","appuyer":"натискати","secouer":"трясти","frotter":"терти","essuyer":"витирати","plonger":"пірнати","ramer":"веслувати",
"autrefois":"колись","récemment":"нещодавно","désormais":"відтепер","auparavant":"раніше","à l'avenir":"у майбутньому","aussitôt":"одразу","tout à coup":"раптом","dès que":"як тільки"
},
cs:{
"camping":"kemp","tente":"stan","sac de couchage":"spacák","lampe de poche":"baterka","hamac":"houpací síť","randonnée":"túra","chasse":"lov","boussole":"kompas","jumelles":"dalekohled","feu de camp":"táborák",
"fouet":"metlička","louche":"naběračka","passoire":"cedník","râpe":"struhadlo","entonnoir":"trychtýř","couvercle":"poklička","bouchon":"zátka","tire-bouchon":"vývrtka","glaçon":"kostka ledu","paille":"brčko",
"plombier":"instalatér","électricien":"elektrikář","menuisier":"truhlář","bijoutier":"klenotník","vétérinaire":"veterinář","pêcheur":"rybář","chauffeur":"řidič","fleuriste":"květinář",
"orchestre":"orchestr","violon":"housle","flûte":"flétna","trompette":"trumpeta","mélodie":"melodie","rythme":"rytmus","chorale":"sbor","tambour":"buben",
"volcan":"sopka","inondation":"povodeň","tremblement de terre":"zemětřesení","avalanche":"lavina","canicule":"vedro","continent":"kontinent",
"étonnant":"překvapivý","effrayant":"děsivý","passionnant":"fascinující","émouvant":"dojemný","précieux":"cenný","semblable":"podobný","épuisant":"vyčerpávající","décevant":"neuspokojivý","indispensable":"nezbytný","disponible":"dostupný","provisoire":"dočasný",
"détruire":"ničit","creuser":"kopat","vider":"vyprazdňovat","verrouiller":"zamykat","brancher":"zapojovat","débrancher":"odpojovat","appuyer":"mačkat","secouer":"třást","frotter":"třít","essuyer":"utírat","plonger":"potápět se","ramer":"veslovat",
"autrefois":"dříve","récemment":"nedávno","désormais":"od nynějška","auparavant":"předtím","à l'avenir":"v budoucnu","aussitôt":"okamžitě","tout à coup":"najednou","dès que":"jakmile"
},
zh:{
"camping":"露营","tente":"帐篷","sac de couchage":"睡袋","lampe de poche":"手电筒","hamac":"吊床","randonnée":"徒步旅行","chasse":"打猎","boussole":"指南针","jumelles":"双筒望远镜","feu de camp":"篝火",
"fouet":"打蛋器","louche":"汤勺","passoire":"滤网","râpe":"擦丝器","entonnoir":"漏斗","couvercle":"盖子","bouchon":"瓶塞","tire-bouchon":"开瓶器","glaçon":"冰块","paille":"吸管",
"plombier":"水管工","électricien":"电工","menuisier":"木匠","bijoutier":"珠宝商","vétérinaire":"兽医","pêcheur":"渔夫","chauffeur":"司机","fleuriste":"花店老板",
"orchestre":"管弦乐队","violon":"小提琴","flûte":"长笛","trompette":"小号","mélodie":"旋律","rythme":"节奏","chorale":"合唱团","tambour":"鼓",
"volcan":"火山","inondation":"洪水","tremblement de terre":"地震","avalanche":"雪崩","canicule":"热浪","continent":"大陆",
"étonnant":"令人惊讶的","effrayant":"吓人的","passionnant":"引人入胜的","émouvant":"感人的","précieux":"珍贵的","semblable":"相似的","épuisant":"累人的","décevant":"令人失望的","indispensable":"必不可少的","disponible":"可用的","provisoire":"临时的",
"détruire":"摧毁","creuser":"挖","vider":"倒空","verrouiller":"锁上","brancher":"插上","débrancher":"拔掉","appuyer":"按","secouer":"摇晃","frotter":"搓","essuyer":"擦","plonger":"潜水","ramer":"划船",
"autrefois":"从前","récemment":"最近","désormais":"从今以后","auparavant":"之前","à l'avenir":"将来","aussitôt":"立刻","tout à coup":"突然","dès que":"一到就"
},
ja:{
"camping":"キャンプ","tente":"テント","sac de couchage":"寝袋","lampe de poche":"懐中電灯","hamac":"ハンモック","randonnée":"ハイキング","chasse":"狩り","boussole":"コンパス","jumelles":"双眼鏡","feu de camp":"たき火",
"fouet":"泡立て器","louche":"おたま","passoire":"ざる","râpe":"おろし金","entonnoir":"じょうご","couvercle":"ふた","bouchon":"栓","tire-bouchon":"コルク抜き","glaçon":"氷","paille":"ストロー",
"plombier":"配管工","électricien":"電気技師","menuisier":"大工","bijoutier":"宝石商","vétérinaire":"獣医","pêcheur":"漁師","chauffeur":"運転手","fleuriste":"花屋",
"orchestre":"オーケストラ","violon":"バイオリン","flûte":"フルート","trompette":"トランペット","mélodie":"メロディー","rythme":"リズム","chorale":"合唱団","tambour":"太鼓",
"volcan":"火山","inondation":"洪水","tremblement de terre":"地震","avalanche":"雪崩","canicule":"猛暑","continent":"大陸",
"étonnant":"驚くべき","effrayant":"恐ろしい","passionnant":"わくわくする","émouvant":"感動的な","précieux":"貴重な","semblable":"似ている","épuisant":"疲れる","décevant":"がっかりする","indispensable":"不可欠な","disponible":"利用できる","provisoire":"一時的な",
"détruire":"破壊します","creuser":"掘ります","vider":"空にします","verrouiller":"鍵をかけます","brancher":"つなぎます","débrancher":"抜きます","appuyer":"押さえます","secouer":"振ります","frotter":"こすります","essuyer":"拭きます","plonger":"潜ります","ramer":"漕ぎます",
"autrefois":"昔","récemment":"最近","désormais":"これから","auparavant":"以前に","à l'avenir":"将来は","aussitôt":"ただちに","tout à coup":"突然","dès que":"〜するとすぐに"
},
ko:{
"camping":"캠핑","tente":"텐트","sac de couchage":"침낭","lampe de poche":"손전등","hamac":"해먹","randonnée":"하이킹","chasse":"사냥","boussole":"나침반","jumelles":"쌍안경","feu de camp":"모닥불",
"fouet":"거품기","louche":"국자","passoire":"체","râpe":"강판","entonnoir":"깔때기","couvercle":"뚜껑","bouchon":"병마개","tire-bouchon":"코르크 따개","glaçon":"얼음","paille":"빨대",
"plombier":"배관공","électricien":"전기공","menuisier":"목수","bijoutier":"보석상","vétérinaire":"수의사","pêcheur":"어부","chauffeur":"운전사","fleuriste":"플로리스트",
"orchestre":"오케스트라","violon":"바이올린","flûte":"플루트","trompette":"트럼펫","mélodie":"멜로디","rythme":"리듬","chorale":"합창단","tambour":"북",
"volcan":"화산","inondation":"홍수","tremblement de terre":"지진","avalanche":"눈사태","canicule":"폭염","continent":"대륙",
"étonnant":"놀라운","effrayant":"소름 끼치는","passionnant":"흥미진진한","émouvant":"감동적인","précieux":"귀중한","semblable":"비슷한","épuisant":"지치게 하는","décevant":"실망스러운","indispensable":"필수적인","disponible":"이용 가능한","provisoire":"임시의",
"détruire":"파괴하다","creuser":"파다","vider":"비우다","verrouiller":"잠그다","brancher":"꽂다","débrancher":"뽑다","appuyer":"누르다","secouer":"흔들다","frotter":"문지르다","essuyer":"닦다","plonger":"잠수하다","ramer":"노를 젓다",
"autrefois":"옛날에","récemment":"최근에","désormais":"이제부터","auparavant":"이전에","à l'avenir":"앞으로","aussitôt":"즉시","tout à coup":"갑자기","dès que":"하자마자"
},
ar:{
"camping":"تخييم","tente":"خيمة","sac de couchage":"كيس نوم","lampe de poche":"مصباح يدوي","hamac":"أرجوحة شبكية","randonnée":"رحلة مشي","chasse":"صيد","boussole":"بوصلة","jumelles":"منظار","feu de camp":"نار المخيم",
"fouet":"مضرب بيض","louche":"مغرفة","passoire":"مصفاة","râpe":"مبشرة","entonnoir":"قمع","couvercle":"غطاء","bouchon":"سدادة","tire-bouchon":"بريمة","glaçon":"مكعب ثلج","paille":"شفاطة",
"plombier":"سباك","électricien":"كهربائي","menuisier":"نجار","bijoutier":"صائغ","vétérinaire":"طبيب بيطري","pêcheur":"صياد سمك","chauffeur":"سائق","fleuriste":"بائع زهور",
"orchestre":"أوركسترا","violon":"كمان","flûte":"فلوت","trompette":"بوق موسيقي","mélodie":"لحن","rythme":"إيقاع","chorale":"جوقة","tambour":"طبل",
"volcan":"بركان","inondation":"فيضان","tremblement de terre":"زلزال","avalanche":"انهيار ثلجي","canicule":"موجة حر","continent":"قارة",
"étonnant":"مدهش","effrayant":"مخيف","passionnant":"شيق","émouvant":"مؤثر","précieux":"ثمين","semblable":"مشابه","épuisant":"مرهق","décevant":"مخيب للآمال","indispensable":"لا غنى عنه","disponible":"متاح","provisoire":"مؤقت",
"détruire":"يدمر","creuser":"يحفر","vider":"يفرغ","verrouiller":"يقفل","brancher":"يوصل","débrancher":"ينزع القابس","appuyer":"يضغط","secouer":"يهز","frotter":"يفرك","essuyer":"يمسح","plonger":"يغوص","ramer":"يجدف",
"autrefois":"قديمًا","récemment":"مؤخرًا","désormais":"من الآن فصاعدًا","auparavant":"سابقًا","à l'avenir":"في المستقبل","aussitôt":"حالاً","tout à coup":"فجأة","dès que":"بمجرد أن"
}
};
LANGS2.forEach(function(l){ var p2=LEX2P[l]||{}; Object.keys(p2).forEach(function(k){ LEX2[l][k]=p2[k]; }); });
var TLANGS = LANGS.concat(LANGS2); /* toutes les langues (traducteur / dictionnaire) */

/* --- Génération des cours + dictionnaire de traduction --- */
var COURSES = {};
LANGS.forEach(function(l){
  COURSES[l] = { id:l, nom:LMETA[l].nom, drapeau:LMETA[l].drapeau, ttsLang:LMETA[l].tts,
    units: CURRICULUM.map(function(u){ return { titre:u.t, couleur:u.c, lessons:u.L.map(function(le){
      return { titre:le.t, words:(le.w||[]).map(function(fr){ return {fr:fr,t:LEX[l][fr]||fr}; }),
               phrases:(le.p||[]).map(function(fr){ return {fr:fr,t:LEX[l][fr]||fr}; }) };
    }) }; }) };
});
/* Nouvelles langues : VÉRITÉ — seules les unités ENTIÈREMENT traduites entrent au cours
   (aucun mot affiché en français à la place de la langue cible). */
LANGS2.forEach(function(l){
  var lex=LEX2[l]||{}, units=[];
  CURRICULUM.forEach(function(u){
    var full=u.L.every(function(le){
      return (le.w||[]).every(function(fr){ return !!lex[fr]; }) && (le.p||[]).every(function(fr){ return !!lex[fr]; });
    });
    if(full) units.push({ titre:u.t, couleur:u.c, lessons:u.L.map(function(le){
      return { titre:le.t, words:(le.w||[]).map(function(fr){ return {fr:fr,t:lex[fr]}; }),
               phrases:(le.p||[]).map(function(fr){ return {fr:fr,t:lex[fr]}; }) };
    }) });
  });
  if(units.length) COURSES[l]={ id:l, nom:LMETA2[l].nom, drapeau:LMETA2[l].drapeau, ttsLang:LMETA2[l].tts,
    noType:!!LMETA2[l].noType, rtl:!!LMETA2[l].rtl, units:units };
});
/* DICT[fr] = {en,…,nl + nouvelles langues quand traduites} — union du lexique + phrasier */
var DICT = {};
Object.keys(LEX.en).forEach(function(fr){ DICT[fr]={}; LANGS.forEach(function(l){ DICT[fr][l]=LEX[l][fr]; }); });
Object.keys(PHRASEBOOK).forEach(function(fr){ DICT[fr]=PHRASEBOOK[fr]; });
LANGS2.forEach(function(l){ Object.keys(LEX2[l]).forEach(function(fr){ if(DICT[fr]) DICT[fr][l]=LEX2[l][fr]; }); });

/* ============ 📖 HISTOIRES DE LA RUCHE — mini-histoires 100% originales ============
   Chaque histoire : lignes (qui parle · texte fr · texte par langue) + quiz de
   compréhension (en français). Vocabulaire = celui du programme (niveau A1).
   Débloquage : la 1re est ouverte, chaque histoire ouvre la suivante. */
var STORIES=[
 {id:"cafe", ic:"☕", titre:"Au café", lignes:[
  {qui:"🐝", fr:"Bonjour !", t:{en:"Hello!", it:"Buongiorno!", es:"¡Buenos días!", de:"Guten Tag!", pt:"Bom dia!", nl:"Goedendag!"}},
  {qui:"🧑‍🍳", fr:"Bonjour ! Café ou thé ?", t:{en:"Hello! Coffee or tea?", it:"Buongiorno! Caffè o tè?", es:"¡Buenos días! ¿Café o té?", de:"Guten Tag! Kaffee oder Tee?", pt:"Bom dia! Café ou chá?", nl:"Goedendag! Koffie of thee?"}},
  {qui:"🐝", fr:"Un café, s'il te plaît.", t:{en:"A coffee, please.", it:"Un caffè, per favore.", es:"Un café, por favor.", de:"Einen Kaffee, bitte.", pt:"Um café, por favor.", nl:"Een koffie, alstublieft."}},
  {qui:"🧑‍🍳", fr:"Et un gâteau ?", t:{en:"And a cake?", it:"E una torta?", es:"¿Y un pastel?", de:"Und einen Kuchen?", pt:"E um bolo?", nl:"En een taart?"}},
  {qui:"🐝", fr:"Oui ! Merci !", t:{en:"Yes! Thank you!", it:"Sì! Grazie!", es:"¡Sí! ¡Gracias!", de:"Ja! Danke!", pt:"Sim! Obrigada!", nl:"Ja! Dank je!"}},
  {qui:"🐝", fr:"Le café est bon.", t:{en:"The coffee is good.", it:"Il caffè è buono.", es:"El café es bueno.", de:"Der Kaffee ist gut.", pt:"O café é bom.", nl:"De koffie is goed."}}],
  quiz:[
  {q:"Que commande Bee ?", opts:["Un café","Un thé","Un jus"], ok:0},
  {q:"Avec quoi ?", opts:["Du pain","Un gâteau","Une soupe"], ok:1},
  {q:"Le café est…", opts:["Petit","Noir","Bon"], ok:2}]},
 {id:"chat", ic:"🐱", titre:"Le chat noir", lignes:[
  {qui:"🐝", fr:"Voici la maison.", t:{en:"Here is the house.", it:"Ecco la casa.", es:"Aquí está la casa.", de:"Hier ist das Haus.", pt:"Aqui está a casa.", nl:"Hier is het huis."}},
  {qui:"🐝", fr:"Un chat est dans la maison.", t:{en:"A cat is in the house.", it:"Un gatto è nella casa.", es:"Un gato está en la casa.", de:"Eine Katze ist im Haus.", pt:"Um gato está na casa.", nl:"Een kat is in het huis."}},
  {qui:"🐝", fr:"Le chat est noir.", t:{en:"The cat is black.", it:"Il gatto è nero.", es:"El gato es negro.", de:"Die Katze ist schwarz.", pt:"O gato é preto.", nl:"De kat is zwart."}},
  {qui:"🐱", fr:"Le chat boit du lait.", t:{en:"The cat drinks milk.", it:"Il gatto beve il latte.", es:"El gato bebe leche.", de:"Die Katze trinkt Milch.", pt:"O gato bebe leite.", nl:"De kat drinkt melk."}},
  {qui:"🐕", fr:"Le chien est petit.", t:{en:"The dog is small.", it:"Il cane è piccolo.", es:"El perro es pequeño.", de:"Der Hund ist klein.", pt:"O cão é pequeno.", nl:"De hond is klein."}},
  {qui:"🐝", fr:"Bonne nuit, le chat !", t:{en:"Good night, cat!", it:"Buonanotte, gatto!", es:"¡Buenas noches, gato!", de:"Gute Nacht, Katze!", pt:"Boa noite, gato!", nl:"Goedenacht, kat!"}}],
  quiz:[
  {q:"De quelle couleur est le chat ?", opts:["Blanc","Noir","Rouge"], ok:1},
  {q:"Que boit le chat ?", opts:["Du lait","De l'eau","Du café"], ok:0},
  {q:"Le chien est…", opts:["Grand","Noir","Petit"], ok:2}]},
 {id:"famille", ic:"👪", titre:"Ma famille", lignes:[
  {qui:"🐝", fr:"Voici ma famille !", t:{en:"Here is my family!", it:"Ecco la mia famiglia!", es:"¡Aquí está mi familia!", de:"Hier ist meine Familie!", pt:"Aqui está a minha família!", nl:"Hier is mijn familie!"}},
  {qui:"🐝", fr:"Ma mère et mon père.", t:{en:"My mother and my father.", it:"Mia madre e mio padre.", es:"Mi madre y mi padre.", de:"Meine Mutter und mein Vater.", pt:"A minha mãe e o meu pai.", nl:"Mijn moeder en mijn vader."}},
  {qui:"🐝", fr:"J'ai un frère et une sœur.", t:{en:"I have a brother and a sister.", it:"Ho un fratello e una sorella.", es:"Tengo un hermano y una hermana.", de:"Ich habe einen Bruder und eine Schwester.", pt:"Tenho um irmão e uma irmã.", nl:"Ik heb een broer en een zus."}},
  {qui:"👶", fr:"Le bébé est petit.", t:{en:"The baby is small.", it:"Il bebè è piccolo.", es:"El bebé es pequeño.", de:"Das Baby ist klein.", pt:"O bebé é pequeno.", nl:"De baby is klein."}},
  {qui:"👵", fr:"Grand-mère a un chat.", t:{en:"Grandma has a cat.", it:"La nonna ha un gatto.", es:"La abuela tiene un gato.", de:"Oma hat eine Katze.", pt:"A avó tem um gato.", nl:"Oma heeft een kat."}},
  {qui:"🐝", fr:"J'aime ma famille !", t:{en:"I love my family!", it:"Amo la mia famiglia!", es:"¡Amo a mi familia!", de:"Ich liebe meine Familie!", pt:"Amo a minha família!", nl:"Ik hou van mijn familie!"}}],
  quiz:[
  {q:"Bee a…", opts:["Un frère et une sœur","Deux frères","Deux sœurs"], ok:0},
  {q:"Qui a un chat ?", opts:["Le père","Le bébé","Grand-mère"], ok:2},
  {q:"Le bébé est…", opts:["Grand","Petit","Noir"], ok:1}]},
 {id:"marche", ic:"🛒", titre:"Au marché", lignes:[
  {qui:"🧑‍🌾", fr:"Bonjour ! Des pommes ?", t:{en:"Hello! Apples?", it:"Buongiorno! Mele?", es:"¡Buenos días! ¿Manzanas?", de:"Guten Tag! Äpfel?", pt:"Bom dia! Maçãs?", nl:"Goedendag! Appels?"}},
  {qui:"🐝", fr:"Oui, trois pommes, s'il te plaît.", t:{en:"Yes, three apples, please.", it:"Sì, tre mele, per favore.", es:"Sí, tres manzanas, por favor.", de:"Ja, drei Äpfel, bitte.", pt:"Sim, três maçãs, por favor.", nl:"Ja, drie appels, alstublieft."}},
  {qui:"🐝", fr:"Et du fromage.", t:{en:"And some cheese.", it:"E del formaggio.", es:"Y queso.", de:"Und Käse.", pt:"E queijo.", nl:"En kaas."}},
  {qui:"🧑‍🌾", fr:"Voilà ! Dix euros.", t:{en:"Here you are! Ten euros.", it:"Ecco! Dieci euro.", es:"¡Aquí está! Diez euros.", de:"Bitte schön! Zehn Euro.", pt:"Aqui está! Dez euros.", nl:"Alstublieft! Tien euro."}},
  {qui:"🐝", fr:"Merci ! Au revoir !", t:{en:"Thank you! Goodbye!", it:"Grazie! Arrivederci!", es:"¡Gracias! ¡Adiós!", de:"Danke! Auf Wiedersehen!", pt:"Obrigada! Adeus!", nl:"Dank je! Tot ziens!"}}],
  quiz:[
  {q:"Combien de pommes ?", opts:["Deux","Trois","Dix"], ok:1},
  {q:"Bee achète aussi…", opts:["Du fromage","Du pain","Du poisson"], ok:0},
  {q:"Ça coûte…", opts:["Cinq euros","Cent euros","Dix euros"], ok:2}]},
 {id:"voyage", ic:"✈️", titre:"Le voyage", lignes:[
  {qui:"🐝", fr:"Pardon, où est la gare ?", t:{en:"Excuse me, where is the station?", it:"Scusi, dov'è la stazione?", es:"Perdón, ¿dónde está la estación?", de:"Entschuldigung, wo ist der Bahnhof?", pt:"Desculpe, onde é a estação?", nl:"Pardon, waar is het station?"}},
  {qui:"🧑", fr:"À gauche, puis à droite.", t:{en:"To the left, then to the right.", it:"A sinistra, poi a destra.", es:"A la izquierda, luego a la derecha.", de:"Nach links, dann nach rechts.", pt:"À esquerda, depois à direita.", nl:"Naar links, dan naar rechts."}},
  {qui:"🐝", fr:"Merci ! Et l'hôtel ?", t:{en:"Thank you! And the hotel?", it:"Grazie! E l'hotel?", es:"¡Gracias! ¿Y el hotel?", de:"Danke! Und das Hotel?", pt:"Obrigada! E o hotel?", nl:"Dank je! En het hotel?"}},
  {qui:"🧑", fr:"Ici ! L'hôtel est grand.", t:{en:"Here! The hotel is big.", it:"Qui! L'hotel è grande.", es:"¡Aquí! El hotel es grande.", de:"Hier! Das Hotel ist groß.", pt:"Aqui! O hotel é grande.", nl:"Hier! Het hotel is groot."}},
  {qui:"🐝", fr:"La rue est belle.", t:{en:"The street is beautiful.", it:"La strada è bella.", es:"La calle es bonita.", de:"Die Straße ist schön.", pt:"A rua é bonita.", nl:"De straat is mooi."}}],
  quiz:[
  {q:"Bee cherche…", opts:["La gare","La plage","Le café"], ok:0},
  {q:"La gare est…", opts:["Tout droit","À gauche puis à droite","Derrière l'hôtel"], ok:1},
  {q:"L'hôtel est…", opts:["Petit","Nouveau","Grand"], ok:2}]},
 {id:"nuit", ic:"🌙", titre:"Bonne nuit", lignes:[
  {qui:"🐝", fr:"C'est le soir.", t:{en:"It is the evening.", it:"È la sera.", es:"Es la tarde.", de:"Es ist Abend.", pt:"É a noite.", nl:"Het is avond."}},
  {qui:"🐝", fr:"La lune est belle.", t:{en:"The moon is beautiful.", it:"La luna è bella.", es:"La luna es bonita.", de:"Der Mond ist schön.", pt:"A lua é bonita.", nl:"De maan is mooi."}},
  {qui:"🐝", fr:"Je vais au lit.", t:{en:"I go to bed.", it:"Vado a letto.", es:"Voy a la cama.", de:"Ich gehe ins Bett.", pt:"Vou para a cama.", nl:"Ik ga naar bed."}},
  {qui:"🐝", fr:"Le ciel est noir.", t:{en:"The sky is black.", it:"Il cielo è nero.", es:"El cielo es negro.", de:"Der Himmel ist schwarz.", pt:"O céu é preto.", nl:"De lucht is zwart."}},
  {qui:"🐝", fr:"Bonne nuit ! À demain !", t:{en:"Good night! See you tomorrow!", it:"Buonanotte! A domani!", es:"¡Buenas noches! ¡Hasta mañana!", de:"Gute Nacht! Bis morgen!", pt:"Boa noite! Até amanhã!", nl:"Goedenacht! Tot morgen!"}}],
  quiz:[
  {q:"Comment est la lune ?", opts:["Belle","Petite","Rouge"], ok:0},
  {q:"Où va Bee ?", opts:["À la gare","Au lit","Au café"], ok:1},
  {q:"Le ciel est…", opts:["Bleu","Blanc","Noir"], ok:2}]},
 {id:"ecole", ic:"🏫", titre:"À l'école", lignes:[
  {qui:"🐝", fr:"C'est l'école.", t:{en:"It is the school.", it:"È la scuola.", es:"Es la escuela.", de:"Es ist die Schule.", pt:"É a escola.", nl:"Het is de school."}},
  {qui:"🐝", fr:"J'ai un livre et un crayon.", t:{en:"I have a book and a pencil.", it:"Ho un libro e una matita.", es:"Tengo un libro y un lápiz.", de:"Ich habe ein Buch und einen Bleistift.", pt:"Tenho um livro e um lápis.", nl:"Ik heb een boek en een potlood."}},
  {qui:"👩‍🏫", fr:"Bonjour ! Ouvrez le livre.", t:{en:"Hello! Open the book.", it:"Buongiorno! Aprite il libro.", es:"¡Buenos días! Abran el libro.", de:"Guten Tag! Öffnet das Buch.", pt:"Bom dia! Abram o livro.", nl:"Goedendag! Open het boek."}},
  {qui:"🐝", fr:"Un, deux, trois.", t:{en:"One, two, three.", it:"Uno, due, tre.", es:"Uno, dos, tres.", de:"Eins, zwei, drei.", pt:"Um, dois, três.", nl:"Een, twee, drie."}},
  {qui:"🐝", fr:"J'aime l'école !", t:{en:"I like school!", it:"Mi piace la scuola!", es:"¡Me gusta la escuela!", de:"Ich mag die Schule!", pt:"Gosto da escola!", nl:"Ik hou van school!"}}],
  quiz:[
  {q:"Bee a…", opts:["Un livre et un crayon","Un chat","Une pomme"], ok:0},
  {q:"La maîtresse dit…", opts:["Fermez la porte","Ouvrez le livre","Bonne nuit"], ok:1},
  {q:"Bee compte…", opts:["Un, deux, trois","Les chats","Les euros"], ok:0}]},
 {id:"temps", ic:"🌦️", titre:"Le temps", lignes:[
  {qui:"🐝", fr:"Aujourd'hui, il fait beau.", t:{en:"Today, it is nice.", it:"Oggi fa bello.", es:"Hoy hace buen tiempo.", de:"Heute ist es schön.", pt:"Hoje está bom tempo.", nl:"Vandaag is het mooi."}},
  {qui:"🐝", fr:"Le soleil est grand.", t:{en:"The sun is big.", it:"Il sole è grande.", es:"El sol es grande.", de:"Die Sonne ist groß.", pt:"O sol é grande.", nl:"De zon is groot."}},
  {qui:"☁️", fr:"Demain, il pleut.", t:{en:"Tomorrow, it rains.", it:"Domani piove.", es:"Mañana llueve.", de:"Morgen regnet es.", pt:"Amanhã chove.", nl:"Morgen regent het."}},
  {qui:"🐝", fr:"J'ai un parapluie.", t:{en:"I have an umbrella.", it:"Ho un ombrello.", es:"Tengo un paraguas.", de:"Ich habe einen Regenschirm.", pt:"Tenho um guarda-chuva.", nl:"Ik heb een paraplu."}},
  {qui:"🐝", fr:"J'aime le soleil !", t:{en:"I love the sun!", it:"Amo il sole!", es:"¡Amo el sol!", de:"Ich liebe die Sonne!", pt:"Adoro o sol!", nl:"Ik hou van de zon!"}}],
  quiz:[
  {q:"Aujourd'hui il fait…", opts:["Beau","Froid","Nuit"], ok:0},
  {q:"Demain il…", opts:["Neige","Pleut","Fait chaud"], ok:1},
  {q:"Bee a un…", opts:["Chapeau","Parapluie","Vélo"], ok:1}]},
 {id:"couleurs", ic:"🎨", titre:"Les couleurs", lignes:[
  {qui:"🐝", fr:"Regarde les couleurs !", t:{en:"Look at the colors!", it:"Guarda i colori!", es:"¡Mira los colores!", de:"Schau die Farben an!", pt:"Olha as cores!", nl:"Kijk naar de kleuren!"}},
  {qui:"🐝", fr:"La pomme est rouge.", t:{en:"The apple is red.", it:"La mela è rossa.", es:"La manzana es roja.", de:"Der Apfel ist rot.", pt:"A maçã é vermelha.", nl:"De appel is rood."}},
  {qui:"🐝", fr:"Le ciel est bleu.", t:{en:"The sky is blue.", it:"Il cielo è blu.", es:"El cielo es azul.", de:"Der Himmel ist blau.", pt:"O céu é azul.", nl:"De lucht is blauw."}},
  {qui:"🐝", fr:"L'herbe est verte.", t:{en:"The grass is green.", it:"L'erba è verde.", es:"La hierba es verde.", de:"Das Gras ist grün.", pt:"A relva é verde.", nl:"Het gras is groen."}},
  {qui:"🐝", fr:"J'aime le jaune du soleil.", t:{en:"I like the yellow of the sun.", it:"Mi piace il giallo del sole.", es:"Me gusta el amarillo del sol.", de:"Ich mag das Gelb der Sonne.", pt:"Gosto do amarelo do sol.", nl:"Ik hou van het geel van de zon."}}],
  quiz:[
  {q:"La pomme est…", opts:["Rouge","Bleue","Verte"], ok:0},
  {q:"Le ciel est…", opts:["Vert","Bleu","Jaune"], ok:1},
  {q:"L'herbe est…", opts:["Rouge","Verte","Noire"], ok:1}]},
 {id:"anniv", ic:"🎂", titre:"L'anniversaire", lignes:[
  {qui:"🐝", fr:"C'est mon anniversaire !", t:{en:"It is my birthday!", it:"È il mio compleanno!", es:"¡Es mi cumpleaños!", de:"Es ist mein Geburtstag!", pt:"É o meu aniversário!", nl:"Het is mijn verjaardag!"}},
  {qui:"👪", fr:"Joyeux anniversaire !", t:{en:"Happy birthday!", it:"Buon compleanno!", es:"¡Feliz cumpleaños!", de:"Alles Gute zum Geburtstag!", pt:"Feliz aniversário!", nl:"Fijne verjaardag!"}},
  {qui:"🐝", fr:"Il y a un gâteau.", t:{en:"There is a cake.", it:"C'è una torta.", es:"Hay un pastel.", de:"Es gibt einen Kuchen.", pt:"Há um bolo.", nl:"Er is een taart."}},
  {qui:"🐝", fr:"J'ai sept ans.", t:{en:"I am seven years old.", it:"Ho sette anni.", es:"Tengo siete años.", de:"Ich bin sieben Jahre alt.", pt:"Tenho sete anos.", nl:"Ik ben zeven jaar."}},
  {qui:"🐝", fr:"Merci ! Je suis contente !", t:{en:"Thank you! I am happy!", it:"Grazie! Sono contenta!", es:"¡Gracias! ¡Estoy contenta!", de:"Danke! Ich bin glücklich!", pt:"Obrigada! Estou feliz!", nl:"Dank je! Ik ben blij!"}}],
  quiz:[
  {q:"C'est…", opts:["Le matin","L'anniversaire de Bee","Noël"], ok:1},
  {q:"Il y a un…", opts:["Gâteau","Chat","Livre"], ok:0},
  {q:"Bee a…", opts:["Cinq ans","Sept ans","Dix ans"], ok:1}]},
 {id:"docteur", ic:"🩺", titre:"Chez le docteur", lignes:[
  {qui:"🐝", fr:"Je suis malade.", t:{en:"I am sick.", it:"Sono malata.", es:"Estoy enferma.", de:"Ich bin krank.", pt:"Estou doente.", nl:"Ik ben ziek."}},
  {qui:"🩺", fr:"Bonjour. Où as-tu mal ?", t:{en:"Hello. Where does it hurt?", it:"Buongiorno. Dove ti fa male?", es:"Buenos días. ¿Dónde te duele?", de:"Guten Tag. Wo tut es weh?", pt:"Bom dia. Onde dói?", nl:"Goedendag. Waar doet het pijn?"}},
  {qui:"🐝", fr:"J'ai mal à la tête.", t:{en:"I have a headache.", it:"Ho mal di testa.", es:"Me duele la cabeza.", de:"Ich habe Kopfschmerzen.", pt:"Dói-me a cabeça.", nl:"Ik heb hoofdpijn."}},
  {qui:"🩺", fr:"Bois de l'eau et dors.", t:{en:"Drink water and sleep.", it:"Bevi acqua e dormi.", es:"Bebe agua y duerme.", de:"Trink Wasser und schlaf.", pt:"Bebe água e dorme.", nl:"Drink water en slaap."}},
  {qui:"🐝", fr:"Merci, docteur !", t:{en:"Thank you, doctor!", it:"Grazie, dottore!", es:"¡Gracias, doctor!", de:"Danke, Doktor!", pt:"Obrigada, doutor!", nl:"Dank je, dokter!"}}],
  quiz:[
  {q:"Bee est…", opts:["Contente","Malade","Grande"], ok:1},
  {q:"Bee a mal…", opts:["À la tête","Au pied","Au bras"], ok:0},
  {q:"Le docteur dit de boire…", opts:["Du café","De l'eau","Du lait"], ok:1}]},
 {id:"parc", ic:"🌳", titre:"Le parc", lignes:[
  {qui:"🐝", fr:"Allons au parc !", t:{en:"Let's go to the park!", it:"Andiamo al parco!", es:"¡Vamos al parque!", de:"Gehen wir in den Park!", pt:"Vamos ao parque!", nl:"Laten we naar het park gaan!"}},
  {qui:"🐝", fr:"Les arbres sont grands.", t:{en:"The trees are big.", it:"Gli alberi sono grandi.", es:"Los árboles son grandes.", de:"Die Bäume sind groß.", pt:"As árvores são grandes.", nl:"De bomen zijn groot."}},
  {qui:"🐕", fr:"Le chien court.", t:{en:"The dog runs.", it:"Il cane corre.", es:"El perro corre.", de:"Der Hund rennt.", pt:"O cão corre.", nl:"De hond rent."}},
  {qui:"🐝", fr:"Je joue avec le ballon.", t:{en:"I play with the ball.", it:"Gioco con la palla.", es:"Juego con la pelota.", de:"Ich spiele mit dem Ball.", pt:"Jogo com a bola.", nl:"Ik speel met de bal."}},
  {qui:"🐝", fr:"Le parc est beau !", t:{en:"The park is beautiful!", it:"Il parco è bello!", es:"¡El parque es bonito!", de:"Der Park ist schön!", pt:"O parque é bonito!", nl:"Het park is mooi!"}}],
  quiz:[
  {q:"Où va Bee ?", opts:["Au parc","À la gare","À l'école"], ok:0},
  {q:"Que fait le chien ?", opts:["Il dort","Il court","Il mange"], ok:1},
  {q:"Bee joue avec…", opts:["Un ballon","Un chat","Un livre"], ok:0}]},
 {id:"sport", ic:"⚽", titre:"Le sport", lignes:[
  {qui:"🐝", fr:"J'aime le sport.", t:{en:"I like sport.", it:"Mi piace lo sport.", es:"Me gusta el deporte.", de:"Ich mag Sport.", pt:"Gosto de desporto.", nl:"Ik hou van sport."}},
  {qui:"🐝", fr:"Je cours vite.", t:{en:"I run fast.", it:"Corro veloce.", es:"Corro rápido.", de:"Ich laufe schnell.", pt:"Corro depressa.", nl:"Ik ren snel."}},
  {qui:"🐝", fr:"Je joue au football.", t:{en:"I play football.", it:"Gioco a calcio.", es:"Juego al fútbol.", de:"Ich spiele Fußball.", pt:"Jogo futebol.", nl:"Ik speel voetbal."}},
  {qui:"🐝", fr:"Le ballon est rond.", t:{en:"The ball is round.", it:"La palla è rotonda.", es:"La pelota es redonda.", de:"Der Ball ist rund.", pt:"A bola é redonda.", nl:"De bal is rond."}},
  {qui:"🐝", fr:"Le sport, c'est super !", t:{en:"Sport is great!", it:"Lo sport è fantastico!", es:"¡El deporte es genial!", de:"Sport ist toll!", pt:"O desporto é ótimo!", nl:"Sport is geweldig!"}}],
  quiz:[
  {q:"Bee court…", opts:["Vite","Lentement","Jamais"], ok:0},
  {q:"Bee joue au…", opts:["Tennis","Football","Basket"], ok:1},
  {q:"Le ballon est…", opts:["Carré","Rond","Petit"], ok:1}]},
 {id:"resto", ic:"🍽️", titre:"Au restaurant", lignes:[
  {qui:"🐝", fr:"J'ai faim.", t:{en:"I am hungry.", it:"Ho fame.", es:"Tengo hambre.", de:"Ich habe Hunger.", pt:"Tenho fome.", nl:"Ik heb honger."}},
  {qui:"🧑‍🍳", fr:"Bonsoir ! Une table ?", t:{en:"Good evening! A table?", it:"Buonasera! Un tavolo?", es:"¡Buenas noches! ¿Una mesa?", de:"Guten Abend! Ein Tisch?", pt:"Boa noite! Uma mesa?", nl:"Goedenavond! Een tafel?"}},
  {qui:"🐝", fr:"Oui. Une soupe, s'il te plaît.", t:{en:"Yes. A soup, please.", it:"Sì. Una zuppa, per favore.", es:"Sí. Una sopa, por favor.", de:"Ja. Eine Suppe, bitte.", pt:"Sim. Uma sopa, por favor.", nl:"Ja. Een soep, alstublieft."}},
  {qui:"🧑‍🍳", fr:"Et de l'eau ?", t:{en:"And some water?", it:"E dell'acqua?", es:"¿Y agua?", de:"Und Wasser?", pt:"E água?", nl:"En water?"}},
  {qui:"🐝", fr:"Oui, merci. C'est bon !", t:{en:"Yes, thank you. It is good!", it:"Sì, grazie. È buono!", es:"Sí, gracias. ¡Está bueno!", de:"Ja, danke. Es ist gut!", pt:"Sim, obrigada. Está bom!", nl:"Ja, dank je. Het is lekker!"}}],
  quiz:[
  {q:"Bee a…", opts:["Faim","Sommeil","Froid"], ok:0},
  {q:"Bee commande une…", opts:["Pizza","Soupe","Salade"], ok:1},
  {q:"Elle boit de l'…", opts:["Eau","Café","Lait"], ok:0}]},
 {id:"plage", ic:"🏖️", titre:"La plage", lignes:[
  {qui:"🐝", fr:"Voici la plage !", t:{en:"Here is the beach!", it:"Ecco la spiaggia!", es:"¡Aquí está la playa!", de:"Hier ist der Strand!", pt:"Aqui está a praia!", nl:"Hier is het strand!"}},
  {qui:"🐝", fr:"La mer est bleue.", t:{en:"The sea is blue.", it:"Il mare è blu.", es:"El mar es azul.", de:"Das Meer ist blau.", pt:"O mar é azul.", nl:"De zee is blauw."}},
  {qui:"🐝", fr:"Le sable est chaud.", t:{en:"The sand is hot.", it:"La sabbia è calda.", es:"La arena está caliente.", de:"Der Sand ist heiß.", pt:"A areia está quente.", nl:"Het zand is warm."}},
  {qui:"🐝", fr:"Je nage dans la mer.", t:{en:"I swim in the sea.", it:"Nuoto nel mare.", es:"Nado en el mar.", de:"Ich schwimme im Meer.", pt:"Nado no mar.", nl:"Ik zwem in de zee."}},
  {qui:"🐝", fr:"J'aime la plage !", t:{en:"I love the beach!", it:"Amo la spiaggia!", es:"¡Amo la playa!", de:"Ich liebe den Strand!", pt:"Adoro a praia!", nl:"Ik hou van het strand!"}}],
  quiz:[
  {q:"La mer est…", opts:["Bleue","Verte","Noire"], ok:0},
  {q:"Le sable est…", opts:["Froid","Chaud","Bleu"], ok:1},
  {q:"Bee… dans la mer.", opts:["Dort","Nage","Mange"], ok:1}]},
 {id:"matin", ic:"☀️", titre:"Le matin", lignes:[
  {qui:"🐝", fr:"C'est le matin.", t:{en:"It is the morning.", it:"È mattina.", es:"Es la mañana.", de:"Es ist Morgen.", pt:"É de manhã.", nl:"Het is ochtend."}},
  {qui:"🐝", fr:"Je me lève.", t:{en:"I get up.", it:"Mi alzo.", es:"Me levanto.", de:"Ich stehe auf.", pt:"Levanto-me.", nl:"Ik sta op."}},
  {qui:"🐝", fr:"Je bois du lait.", t:{en:"I drink milk.", it:"Bevo il latte.", es:"Bebo leche.", de:"Ich trinke Milch.", pt:"Bebo leite.", nl:"Ik drink melk."}},
  {qui:"🐝", fr:"Je mange du pain.", t:{en:"I eat bread.", it:"Mangio il pane.", es:"Como pan.", de:"Ich esse Brot.", pt:"Como pão.", nl:"Ik eet brood."}},
  {qui:"🐝", fr:"Bonne journée !", t:{en:"Have a good day!", it:"Buona giornata!", es:"¡Buen día!", de:"Einen schönen Tag!", pt:"Bom dia!", nl:"Fijne dag!"}}],
  quiz:[
  {q:"C'est le…", opts:["Matin","Soir","Nuit"], ok:0},
  {q:"Bee boit du…", opts:["Café","Lait","Thé"], ok:1},
  {q:"Bee mange du…", opts:["Pain","Gâteau","Fromage"], ok:0}]},
 {id:"ferme", ic:"🚜", titre:"La ferme", lignes:[
  {qui:"🐝", fr:"Voici la ferme.", t:{en:"Here is the farm.", it:"Ecco la fattoria.", es:"Aquí está la granja.", de:"Hier ist der Bauernhof.", pt:"Aqui está a quinta.", nl:"Hier is de boerderij."}},
  {qui:"🐄", fr:"La vache mange l'herbe.", t:{en:"The cow eats the grass.", it:"La mucca mangia l'erba.", es:"La vaca come la hierba.", de:"Die Kuh frisst das Gras.", pt:"A vaca come a relva.", nl:"De koe eet het gras."}},
  {qui:"🐔", fr:"La poule a un œuf.", t:{en:"The hen has an egg.", it:"La gallina ha un uovo.", es:"La gallina tiene un huevo.", de:"Die Henne hat ein Ei.", pt:"A galinha tem um ovo.", nl:"De kip heeft een ei."}},
  {qui:"🐷", fr:"Le cochon est rose.", t:{en:"The pig is pink.", it:"Il maiale è rosa.", es:"El cerdo es rosa.", de:"Das Schwein ist rosa.", pt:"O porco é cor-de-rosa.", nl:"Het varken is roze."}},
  {qui:"🐝", fr:"J'aime les animaux !", t:{en:"I love the animals!", it:"Amo gli animali!", es:"¡Amo los animales!", de:"Ich liebe die Tiere!", pt:"Adoro os animais!", nl:"Ik hou van de dieren!"}}],
  quiz:[
  {q:"Que mange la vache ?", opts:["De l'herbe","Du pain","Du poisson"], ok:0},
  {q:"La poule a un…", opts:["Chat","Œuf","Livre"], ok:1},
  {q:"Le cochon est…", opts:["Bleu","Rose","Noir"], ok:1}]},
 {id:"vetements", ic:"🧥", titre:"Les vêtements", lignes:[
  {qui:"🐝", fr:"Il fait froid.", t:{en:"It is cold.", it:"Fa freddo.", es:"Hace frío.", de:"Es ist kalt.", pt:"Está frio.", nl:"Het is koud."}},
  {qui:"🐝", fr:"Je mets un manteau.", t:{en:"I put on a coat.", it:"Metto un cappotto.", es:"Me pongo un abrigo.", de:"Ich ziehe einen Mantel an.", pt:"Visto um casaco.", nl:"Ik trek een jas aan."}},
  {qui:"🐝", fr:"J'ai un chapeau rouge.", t:{en:"I have a red hat.", it:"Ho un cappello rosso.", es:"Tengo un sombrero rojo.", de:"Ich habe einen roten Hut.", pt:"Tenho um chapéu vermelho.", nl:"Ik heb een rode hoed."}},
  {qui:"🧑", fr:"Tes chaussures sont belles.", t:{en:"Your shoes are nice.", it:"Le tue scarpe sono belle.", es:"Tus zapatos son bonitos.", de:"Deine Schuhe sind schön.", pt:"Os teus sapatos são bonitos.", nl:"Je schoenen zijn mooi."}},
  {qui:"🐝", fr:"Merci ! Je suis prête !", t:{en:"Thank you! I am ready!", it:"Grazie! Sono pronta!", es:"¡Gracias! ¡Estoy lista!", de:"Danke! Ich bin bereit!", pt:"Obrigada! Estou pronta!", nl:"Dank je! Ik ben klaar!"}}],
  quiz:[
  {q:"Il fait…", opts:["Chaud","Froid","Beau"], ok:1},
  {q:"Bee met un…", opts:["Manteau","Maillot","Pyjama"], ok:0},
  {q:"Le chapeau est…", opts:["Bleu","Rouge","Vert"], ok:1}]},
 {id:"travail", ic:"💼", titre:"Le premier jour de travail", lignes:[
  {qui:"🐝", fr:"Aujourd'hui, je commence un nouveau travail.", t:{en:"Today I start a new job.", it:"Oggi comincio un nuovo lavoro.", es:"Hoy empiezo un trabajo nuevo.", de:"Heute fange ich einen neuen Job an.", pt:"Hoje começo um novo trabalho.", nl:"Vandaag begin ik een nieuwe baan."}},
  {qui:"🐝", fr:"Je suis un peu inquiète.", t:{en:"I am a little worried.", it:"Sono un po' preoccupata.", es:"Estoy un poco preocupada.", de:"Ich bin ein bisschen besorgt.", pt:"Estou um pouco preocupada.", nl:"Ik ben een beetje bezorgd."}},
  {qui:"🧑", fr:"Bonjour ! Bienvenue au bureau.", t:{en:"Hello! Welcome to the office.", it:"Buongiorno! Benvenuta in ufficio.", es:"¡Hola! Bienvenida a la oficina.", de:"Hallo! Willkommen im Büro.", pt:"Olá! Bem-vinda ao escritório.", nl:"Hallo! Welkom op kantoor."}},
  {qui:"🧑", fr:"Voici ton ordinateur et ton collègue.", t:{en:"Here is your computer and your colleague.", it:"Ecco il tuo computer e il tuo collega.", es:"Aquí está tu ordenador y tu colega.", de:"Hier ist dein Computer und dein Kollege.", pt:"Aqui está o teu computador e o teu colega.", nl:"Hier is je computer en je collega."}},
  {qui:"🐝", fr:"Merci ! Je suis contente d'être ici.", t:{en:"Thank you! I am happy to be here.", it:"Grazie! Sono contenta di essere qui.", es:"¡Gracias! Estoy contenta de estar aquí.", de:"Danke! Ich bin froh, hier zu sein.", pt:"Obrigada! Estou contente por estar aqui.", nl:"Dank je! Ik ben blij hier te zijn."}}],
  quiz:[
  {q:"Bee commence un nouveau…", opts:["Voyage","Travail","Repas"], ok:1},
  {q:"Au début, Bee est…", opts:["Inquiète","Fâchée","Fatiguée"], ok:0},
  {q:"On lui montre son…", opts:["Vélo","Ordinateur","Chapeau"], ok:1}]},
 {id:"musique", ic:"🎵", titre:"Bee chante", lignes:[
  {qui:"🐝", fr:"J'aime la musique.", t:{en:"I like music.", it:"Mi piace la musica.", es:"Me gusta la música.", de:"Ich mag Musik.", pt:"Gosto de música.", nl:"Ik hou van muziek."}},
  {qui:"🐝", fr:"Le soir, je chante et je danse.", t:{en:"In the evening, I sing and I dance.", it:"La sera canto e ballo.", es:"Por la noche canto y bailo.", de:"Am Abend singe ich und tanze.", pt:"À noite canto e danço.", nl:"'s Avonds zing en dans ik."}},
  {qui:"🧑", fr:"Tu chantes très bien !", t:{en:"You sing very well!", it:"Canti molto bene!", es:"¡Cantas muy bien!", de:"Du singst sehr gut!", pt:"Cantas muito bem!", nl:"Je zingt heel goed!"}},
  {qui:"🐝", fr:"Merci ! On danse ensemble ?", t:{en:"Thank you! Shall we dance together?", it:"Grazie! Balliamo insieme?", es:"¡Gracias! ¿Bailamos juntos?", de:"Danke! Tanzen wir zusammen?", pt:"Obrigada! Dançamos juntos?", nl:"Dank je! Zullen we samen dansen?"}},
  {qui:"🧑", fr:"Oui, j'adore danser !", t:{en:"Yes, I love to dance!", it:"Sì, adoro ballare!", es:"¡Sí, me encanta bailar!", de:"Ja, ich tanze sehr gern!", pt:"Sim, adoro dançar!", nl:"Ja, ik dans dolgraag!"}}],
  quiz:[
  {q:"Bee aime la…", opts:["Musique","Soupe","Pluie"], ok:0},
  {q:"Le soir, Bee chante et…", opts:["Dort","Danse","Mange"], ok:1},
  {q:"L'ami veut…", opts:["Danser","Partir","Lire"], ok:0}]},
 {id:"telephone", ic:"📱", titre:"Le téléphone", lignes:[
  {qui:"🐝", fr:"Où est mon téléphone ?", t:{en:"Where is my phone?", it:"Dov'è il mio telefono?", es:"¿Dónde está mi teléfono?", de:"Wo ist mein Telefon?", pt:"Onde está o meu telefone?", nl:"Waar is mijn telefoon?"}},
  {qui:"🧑", fr:"Il est sur la table, près de l'ordinateur.", t:{en:"It is on the table, near the computer.", it:"È sul tavolo, vicino al computer.", es:"Está en la mesa, cerca del ordenador.", de:"Es liegt auf dem Tisch, neben dem Computer.", pt:"Está na mesa, perto do computador.", nl:"Het ligt op de tafel, bij de computer."}},
  {qui:"🐝", fr:"Merci ! J'ai un message.", t:{en:"Thank you! I have a message.", it:"Grazie! Ho un messaggio.", es:"¡Gracias! Tengo un mensaje.", de:"Danke! Ich habe eine Nachricht.", pt:"Obrigada! Tenho uma mensagem.", nl:"Dank je! Ik heb een bericht."}},
  {qui:"🐝", fr:"C'est une photo de la plage !", t:{en:"It is a photo of the beach!", it:"È una foto della spiaggia!", es:"¡Es una foto de la playa!", de:"Es ist ein Foto vom Strand!", pt:"É uma foto da praia!", nl:"Het is een foto van het strand!"}},
  {qui:"🧑", fr:"Elle est magnifique !", t:{en:"It is beautiful!", it:"È bellissima!", es:"¡Es preciosa!", de:"Es ist wunderschön!", pt:"É linda!", nl:"Hij is prachtig!"}}],
  quiz:[
  {q:"Bee cherche son…", opts:["Livre","Téléphone","Chapeau"], ok:1},
  {q:"Le téléphone est près de l'…", opts:["Ordinateur","Arbre","Assiette"], ok:0},
  {q:"La photo montre la…", opts:["Montagne","Plage","Ville"], ok:1}]},
 {id:"surprise", ic:"😊", titre:"Une belle surprise", lignes:[
  {qui:"🧑", fr:"Bee, ferme les yeux !", t:{en:"Bee, close your eyes!", it:"Bee, chiudi gli occhi!", es:"¡Bee, cierra los ojos!", de:"Bee, mach die Augen zu!", pt:"Bee, fecha os olhos!", nl:"Bee, doe je ogen dicht!"}},
  {qui:"🐝", fr:"D'accord. Qu'est-ce que c'est ?", t:{en:"Okay. What is it?", it:"Va bene. Cos'è?", es:"Vale. ¿Qué es?", de:"Okay. Was ist das?", pt:"Está bem. O que é?", nl:"Oké. Wat is het?"}},
  {qui:"🧑", fr:"Ouvre les yeux : c'est un gâteau !", t:{en:"Open your eyes: it is a cake!", it:"Apri gli occhi: è una torta!", es:"Abre los ojos: ¡es un pastel!", de:"Mach die Augen auf: es ist ein Kuchen!", pt:"Abre os olhos: é um bolo!", nl:"Doe je ogen open: het is een taart!"}},
  {qui:"🐝", fr:"Oh ! Je suis surprise et très contente !", t:{en:"Oh! I am surprised and very happy!", it:"Oh! Sono sorpresa e molto contenta!", es:"¡Oh! ¡Estoy sorprendida y muy contenta!", de:"Oh! Ich bin überrascht und sehr glücklich!", pt:"Oh! Estou surpresa e muito contente!", nl:"Oh! Ik ben verrast en heel blij!"}},
  {qui:"🐝", fr:"Merci, tu es un vrai ami !", t:{en:"Thank you, you are a true friend!", it:"Grazie, sei un vero amico!", es:"¡Gracias, eres un amigo de verdad!", de:"Danke, du bist ein echter Freund!", pt:"Obrigada, és um verdadeiro amigo!", nl:"Dank je, je bent een echte vriend!"}}],
  quiz:[
  {q:"L'ami demande de fermer les…", opts:["Yeux","Mains","Portes"], ok:0},
  {q:"La surprise est un…", opts:["Livre","Gâteau","Chien"], ok:1},
  {q:"Bee est surprise et…", opts:["Fâchée","Contente","Fatiguée"], ok:1}]},
 {id:"weekend", ic:"🌤️", titre:"Le week-end de Bee", lignes:[
  {qui:"🧑", fr:"Qu'est-ce que tu fais ce week-end ?", t:{en:"What are you doing this weekend?", it:"Cosa fai questo fine settimana?", es:"¿Qué haces este fin de semana?", de:"Was machst du dieses Wochenende?", pt:"O que fazes este fim de semana?", nl:"Wat doe je dit weekend?"}},
  {qui:"🐝", fr:"Samedi, je vais nager à la mer.", t:{en:"On Saturday, I go swimming at the sea.", it:"Sabato vado a nuotare al mare.", es:"El sábado voy a nadar al mar.", de:"Am Samstag gehe ich im Meer schwimmen.", pt:"No sábado vou nadar ao mar.", nl:"Zaterdag ga ik zwemmen in de zee."}},
  {qui:"🐝", fr:"Dimanche, je lis un livre au parc.", t:{en:"On Sunday, I read a book in the park.", it:"Domenica leggo un libro al parco.", es:"El domingo leo un libro en el parque.", de:"Am Sonntag lese ich ein Buch im Park.", pt:"No domingo leio um livro no parque.", nl:"Zondag lees ik een boek in het park."}},
  {qui:"🧑", fr:"Ça a l'air génial !", t:{en:"That sounds great!", it:"Sembra fantastico!", es:"¡Suena genial!", de:"Das klingt toll!", pt:"Parece ótimo!", nl:"Dat klinkt geweldig!"}},
  {qui:"🐝", fr:"Oui ! J'aime beaucoup le week-end.", t:{en:"Yes! I really like the weekend.", it:"Sì! Mi piace molto il fine settimana.", es:"¡Sí! Me gusta mucho el fin de semana.", de:"Ja! Ich mag das Wochenende sehr.", pt:"Sim! Gosto muito do fim de semana.", nl:"Ja! Ik hou erg van het weekend."}}],
  quiz:[
  {q:"Samedi, Bee va…", opts:["Nager","Dormir","Travailler"], ok:0},
  {q:"Dimanche, elle lit au…", opts:["Café","Parc","Marché"], ok:1},
  {q:"Bee aime le…", opts:["Lundi","Week-end","Matin"], ok:1}]},
 {id:"idee", ic:"💡", titre:"Une bonne idée", lignes:[
  {qui:"🐝", fr:"J'ai un petit problème.", t:{en:"I have a small problem.", it:"Ho un piccolo problema.", es:"Tengo un pequeño problema.", de:"Ich habe ein kleines Problem.", pt:"Tenho um pequeno problema.", nl:"Ik heb een klein probleem."}},
  {qui:"🧑", fr:"Explique-moi, je vais t'aider.", t:{en:"Explain to me, I will help you.", it:"Spiegami, ti aiuto.", es:"Explícame, te ayudo.", de:"Erklär mir, ich helfe dir.", pt:"Explica-me, vou ajudar-te.", nl:"Leg het me uit, ik help je."}},
  {qui:"🐝", fr:"Ma fleur a soif et je n'ai pas d'eau.", t:{en:"My flower is thirsty and I have no water.", it:"Il mio fiore ha sete e non ho acqua.", es:"Mi flor tiene sed y no tengo agua.", de:"Meine Blume hat Durst und ich habe kein Wasser.", pt:"A minha flor tem sede e não tenho água.", nl:"Mijn bloem heeft dorst en ik heb geen water."}},
  {qui:"🧑", fr:"J'ai une idée : va à la rivière !", t:{en:"I have an idea: go to the river!", it:"Ho un'idea: vai al fiume!", es:"Tengo una idea: ¡ve al río!", de:"Ich habe eine Idee: geh zum Fluss!", pt:"Tenho uma ideia: vai ao rio!", nl:"Ik heb een idee: ga naar de rivier!"}},
  {qui:"🐝", fr:"C'est une très bonne idée. Merci !", t:{en:"That is a very good idea. Thank you!", it:"È un'ottima idea. Grazie!", es:"Es una muy buena idea. ¡Gracias!", de:"Das ist eine sehr gute Idee. Danke!", pt:"É uma ótima ideia. Obrigada!", nl:"Dat is een heel goed idee. Dank je!"}}],
  quiz:[
  {q:"Bee a un petit…", opts:["Problème","Gâteau","Chien"], ok:0},
  {q:"La fleur a…", opts:["Faim","Soif","Peur"], ok:1},
  {q:"L'ami trouve une bonne…", opts:["Idée","Erreur","Chanson"], ok:0}]}
 /*__STORIES_AUTO__ : les nouvelles histoires générées automatiquement s'insèrent ICI (ne pas retirer ce repère) */
];
