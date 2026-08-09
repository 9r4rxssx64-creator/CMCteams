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

/* --- Génération des cours + dictionnaire de traduction --- */
var COURSES = {};
LANGS.forEach(function(l){
  COURSES[l] = { id:l, nom:LMETA[l].nom, drapeau:LMETA[l].drapeau, ttsLang:LMETA[l].tts,
    units: CURRICULUM.map(function(u){ return { titre:u.t, couleur:u.c, lessons:u.L.map(function(le){
      return { titre:le.t, words:(le.w||[]).map(function(fr){ return {fr:fr,t:LEX[l][fr]||fr}; }),
               phrases:(le.p||[]).map(function(fr){ return {fr:fr,t:LEX[l][fr]||fr}; }) };
    }) }; }) };
});
/* DICT[fr] = {en,it,es,de,pt,nl} — union du lexique des cours + phrasier */
var DICT = {};
Object.keys(LEX.en).forEach(function(fr){ DICT[fr]={}; LANGS.forEach(function(l){ DICT[fr][l]=LEX[l][fr]; }); });
Object.keys(PHRASEBOOK).forEach(function(fr){ DICT[fr]=PHRASEBOOK[fr]; });

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
