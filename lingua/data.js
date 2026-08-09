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
var LEVELS = [
  {code:"Débutant", min:0},
  {code:"A1",  min:40},
  {code:"A1+", min:90},
  {code:"A2",  min:160},
  {code:"A2+", min:240}
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
  {q:"Le chapeau est…", opts:["Bleu","Rouge","Vert"], ok:1}]}
];
