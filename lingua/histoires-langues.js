/* 📜 L'HISTOIRE ET LES ANECDOTES DE CHAQUE LANGUE — Kevin 2026-08-13.
   « Intègre l'histoire, anecdotes etc pour chaque langue ».

   RÈGLE DE VÉRITÉ : chaque affirmation porte sa SOURCE (`src` = l'article Wikipédia où elle
   se vérifie). Rien n'est écrit « de mémoire » sans pouvoir être recoupé, et un juge
   indépendant les repasse en revue (tools/lingua/verify-histoires.mjs, câblé dans la
   vérification quotidienne). Quand un chiffre varie selon les sources, on le dit (« environ »,
   « selon les estimations ») au lieu de trancher à leur place.
*/
(function (racine) {
  'use strict';

  var LANG_HISTOIRE = {
    en: { nom: 'Anglais', src: 'Anglais',
      histoire: "L'anglais naît des parlers germaniques apportés en Grande-Bretagne aux Ve-VIe siècles par les Angles, les Saxons et les Jutes. La conquête normande de 1066 y déverse ensuite des milliers de mots français : c'est ce qui donne à l'anglais son double vocabulaire, à la fois germanique et latin.",
      faits: [
        { t: "Après 1066, le français fut la langue de la cour d'Angleterre pendant environ trois siècles.", src: 'Conquête normande de l’Angleterre' },
        { t: "L'animal garde son nom germanique, le plat son nom français : cow/beef, pig/pork, sheep/mutton.", src: 'Anglais' },
        { t: "L'anglais n'a aucune académie officielle : l'usage seul fait la règle.", src: 'Anglais' },
        { t: "C'est la langue la plus parlée au monde si l'on compte les locuteurs non natifs.", src: 'Anglais' }
      ] },

    it: { nom: 'Italien', src: 'Italien',
      histoire: "L'italien moderne descend du toscan littéraire du XIVe siècle, celui de Dante, Pétrarque et Boccace. La péninsule fut politiquement morcelée jusqu'en 1861 : la langue commune a précédé le pays de plusieurs siècles.",
      faits: [
        { t: "Dante écrivit la Divine Comédie en toscan plutôt qu'en latin : ce choix a façonné l'italien.", src: 'Divine Comédie' },
        { t: "À l'unification de 1861, seule une petite minorité d'Italiens parlait couramment l'italien ; les dialectes régionaux dominaient.", src: 'Italien' },
        { t: "L'Accademia della Crusca, fondée en 1583 à Florence, est l'une des plus anciennes académies de langue au monde.", src: 'Accademia della Crusca' },
        { t: "Le vocabulaire de la musique est italien dans le monde entier : piano, forte, allegro, tempo.", src: 'Italien' }
      ] },

    es: { nom: 'Espagnol', src: 'Espagnol',
      histoire: "L'espagnol, ou castillan, est né du latin parlé dans le nord de la péninsule Ibérique. Huit siècles de présence musulmane y ont laissé des milliers de mots arabes, et la colonisation des Amériques en a fait l'une des langues les plus parlées de la planète.",
      faits: [
        { t: "Le ñ vient des copistes du Moyen Âge : ils écrivaient un petit n au-dessus d'un autre pour abréger le double n.", src: 'Ñ' },
        { t: "Des milliers de mots espagnols viennent de l'arabe, souvent reconnaissables à leur « al- » : almohada, azúcar, aceite.", src: 'Espagnol' },
        { t: "L'espagnol est la seule grande langue à ouvrir ses questions et exclamations par ¿ et ¡.", src: 'Point d’interrogation' },
        { t: "C'est la deuxième langue au monde par le nombre de locuteurs natifs.", src: 'Espagnol' }
      ] },

    de: { nom: 'Allemand', src: 'Allemand',
      histoire: "L'allemand écrit doit beaucoup à Martin Luther : sa traduction de la Bible (Nouveau Testament en 1522, Bible complète en 1534) a diffusé une langue commune à travers des territoires qui parlaient des dialectes très différents.",
      faits: [
        { t: "L'allemand écrit met une majuscule à TOUS les noms communs, pas seulement aux noms propres.", src: 'Allemand' },
        { t: "On peut fabriquer un mot en collant des mots bout à bout : c'est pourquoi certains mots allemands sont si longs.", src: 'Mot composé' },
        { t: "Une réforme de l'orthographe en 1996 a fait débat pendant des années dans les pays germanophones.", src: 'Réforme de l’orthographe allemande de 1996' },
        { t: "C'est la langue maternelle la plus parlée de l'Union européenne.", src: 'Allemand' }
      ] },

    pt: { nom: 'Portugais', src: 'Portugais',
      histoire: "Né dans le nord-ouest de la péninsule Ibérique, le portugais s'est répandu avec les navigateurs à partir du XVe siècle. Il est aujourd'hui langue officielle sur quatre continents, et le Brésil en concentre de très loin le plus grand nombre de locuteurs.",
      faits: [
        { t: "Le portugais est langue officielle de neuf pays, du Portugal au Brésil, de l'Angola au Timor oriental.", src: 'Portugais' },
        { t: "« Saudade » désigne un mélange de nostalgie et de manque que le portugais nomme d'un seul mot.", src: 'Saudade' },
        { t: "Un accord orthographique signé en 1990 a rapproché les graphies du Portugal et du Brésil.", src: 'Accord orthographique de 1990' },
        { t: "Le Brésil est le seul pays d'Amérique du Sud dont la langue officielle est le portugais.", src: 'Brésil' }
      ] },

    nl: { nom: 'Néerlandais', src: 'Néerlandais',
      histoire: "Le néerlandais est la langue germanique la plus proche de l'anglais après le frison. Au Siècle d'or, la puissance maritime des Provinces-Unies a semé du vocabulaire néerlandais dans le monde entier.",
      faits: [
        { t: "L'anglais a emprunté au néerlandais des mots de marine et du quotidien, comme yacht ou cookie.", src: 'Néerlandais' },
        { t: "Le néerlandais et l'afrikaans d'Afrique du Sud sont assez proches pour que leurs locuteurs se comprennent en partie.", src: 'Afrikaans' },
        { t: "Le digramme « ij » est si particulier qu'il se met tout entier en majuscules : IJsland.", src: 'IJ (digramme)' },
        { t: "C'est la langue officielle des Pays-Bas, de la Flandre belge et du Suriname.", src: 'Néerlandais' }
      ] },

    pl: { nom: 'Polonais', src: 'Polonais',
      histoire: "Langue slave occidentale écrite en alphabet latin, le polonais s'est maintenu à travers plus d'un siècle de partages où la Pologne avait disparu des cartes : la langue a tenu lieu de pays.",
      faits: [
        { t: "Le polonais décline les noms selon sept cas grammaticaux.", src: 'Polonais' },
        { t: "Des suites comme « szcz » impressionnent, mais chaque lettre s'y prononce régulièrement.", src: 'Polonais' },
        { t: "Le petit crochet sous ą et ę, l'ogonek, note des voyelles nasales.", src: 'Ogonek' },
        { t: "Marie Curie a nommé le polonium en l'honneur de la Pologne, alors rayée de la carte.", src: 'Polonium' }
      ] },

    ru: { nom: 'Russe', src: 'Russe',
      histoire: "Le russe s'écrit en alphabet cyrillique, hérité de l'œuvre des moines Cyrille et Méthode au IXe siècle. C'est la langue slave la plus parlée, et l'une des six langues officielles de l'ONU.",
      faits: [
        { t: "L'alphabet cyrillique descend des travaux de Cyrille et Méthode, au IXe siècle.", src: 'Alphabet cyrillique' },
        { t: "Une réforme de 1918 a supprimé plusieurs lettres devenues inutiles.", src: 'Réforme de l’orthographe russe de 1918' },
        { t: "« Spoutnik » veut dire « compagnon de route » : le nom du premier satellite est un mot du quotidien.", src: 'Spoutnik 1' },
        { t: "Le russe est l'une des six langues officielles de l'ONU.", src: 'Organisation des Nations unies' }
      ] },

    uk: { nom: 'Ukrainien', src: 'Ukrainien',
      histoire: "Langue slave orientale, l'ukrainien s'écrit en cyrillique avec des lettres qui lui sont propres. Longtemps minoré sous l'Empire russe puis en URSS, il connaît depuis l'indépendance de 1991 un puissant mouvement de réaffirmation.",
      faits: [
        { t: "L'ukrainien possède des lettres que le russe n'a pas, comme ї, є et ґ.", src: 'Alphabet ukrainien' },
        { t: "Par son vocabulaire, l'ukrainien est aussi proche du polonais que du russe.", src: 'Ukrainien' },
        { t: "Taras Chevtchenko, poète du XIXe siècle, est considéré comme le père de la langue littéraire ukrainienne.", src: 'Taras Chevtchenko' },
        { t: "La lettre г s'y prononce comme un h aspiré, et non comme le g russe.", src: 'Ukrainien' }
      ] },

    cs: { nom: 'Tchèque', src: 'Tchèque',
      histoire: "Le tchèque doit son allure à Jan Hus, réformateur du XVe siècle : plutôt que d'empiler les lettres, il proposa de poser un signe au-dessus — le háček, ce petit accent en forme de v qu'on retrouve sur š, č, ž.",
      faits: [
        { t: "Le háček, ce petit v au-dessus des lettres, est associé à la réforme de Jan Hus.", src: 'Háček' },
        { t: "Le son noté « ř » est considéré comme l'un des plus difficiles au monde à prononcer.", src: 'Ř' },
        { t: "Le mot « robot » vient du tchèque : Karel Čapek l'a lancé dans sa pièce R.U.R. en 1920.", src: 'Robot' },
        { t: "Certains mots tchèques s'écrivent sans aucune voyelle, comme « zmrzl ».", src: 'Tchèque' }
      ] },

    zh: { nom: 'Chinois (mandarin)', src: 'Mandarin standard',
      histoire: "Le chinois s'écrit avec des caractères et non avec un alphabet, et cette écriture est en usage depuis plus de trois mille ans. Elle relie des régions dont les parlers sont parfois mutuellement incompréhensibles à l'oral.",
      faits: [
        { t: "Le mandarin standard distingue quatre tons : la hauteur de la voix change le sens du mot.", src: 'Mandarin standard' },
        { t: "Le pinyin, qui écrit le chinois en lettres latines, a été adopté officiellement en 1958.", src: 'Hanyu pinyin' },
        { t: "Les caractères simplifiés ont été introduits en République populaire de Chine ; Taïwan et Hong Kong gardent les traditionnels.", src: 'Sinogramme simplifié' },
        { t: "L'écriture chinoise est l'un des systèmes d'écriture les plus anciens encore en usage.", src: 'Sinogramme' }
      ] },

    ja: { nom: 'Japonais', src: 'Japonais',
      histoire: "Le japonais mêle trois écritures dans une même phrase : les kanji venus de Chine, et deux syllabaires nés au Japon, les hiragana et les katakana.",
      faits: [
        { t: "Trois écritures cohabitent : kanji, hiragana et katakana — souvent dans la même phrase.", src: 'Écritures du japonais' },
        { t: "Les hiragana ont d'abord été utilisés par les femmes de la cour, à une époque où le chinois était réservé aux hommes lettrés.", src: 'Hiragana' },
        { t: "Le Dit du Genji, écrit vers l'an 1000 par Murasaki Shikibu, est souvent présenté comme le premier roman du monde.", src: 'Le Dit du Genji' },
        { t: "Le japonais possède un système de politesse très développé, le keigo, qui change la forme des verbes.", src: 'Keigo' }
      ] },

    ko: { nom: 'Coréen', src: 'Coréen',
      histoire: "Le coréen s'écrit en hangeul, un alphabet créé au XVe siècle sur ordre du roi Sejong. Fait rare : on connaît sa date, son auteur et son intention — rendre l'écriture accessible au peuple.",
      faits: [
        { t: "Le hangeul a été promulgué en 1446 sous le règne du roi Sejong le Grand.", src: 'Hangeul' },
        { t: "La forme des consonnes s'inspire de la position de la bouche et de la langue quand on les prononce.", src: 'Hangeul' },
        { t: "Les lettres se groupent en blocs formant une syllabe, au lieu de s'écrire à la file.", src: 'Hangeul' },
        { t: "La Corée du Sud célèbre son alphabet par un jour férié, le 9 octobre.", src: 'Hangeul' }
      ] },

    ar: { nom: 'Arabe', src: 'Arabe',
      histoire: "L'arabe s'écrit de droite à gauche et construit ses mots sur des racines, le plus souvent de trois consonnes, d'où dérivent des familles entières de termes. C'est l'une des six langues officielles de l'ONU.",
      faits: [
        { t: "Les mots se construisent sur des racines de trois consonnes : de k-t-b viennent écrire, livre, bureau, écrivain.", src: 'Racine (linguistique sémitique)' },
        { t: "L'arabe littéral sert à l'écrit et aux médias, tandis que chaque région parle son dialecte.", src: 'Diglossie' },
        { t: "Le mot « algèbre » vient de l'arabe al-jabr, tiré du titre d'un traité d'al-Khwârizmî.", src: 'Algèbre' },
        { t: "L'arabe est l'une des six langues officielles de l'ONU.", src: 'Organisation des Nations unies' }
      ] },

    mc: { nom: 'Monégasque', src: 'Monégasque',
      histoire: "Le monégasque (munegascu) est un parler ligure, cousin du génois, propre au Rocher de Monaco. Menacé de disparition dans les années 1970, il a repris souffle grâce à son entrée à l'école. Louis Notari en a fixé l'écriture en 1927, en s'inspirant du français et de l'italien.",
      faits: [
        { t: "Son apprentissage est obligatoire à l'école à Monaco depuis 1977, du CE2 jusqu'au collège.", src: 'Monégasque' },
        { t: "Louis Notari a codifié son écriture en 1927 ; la première grammaire et le premier dictionnaire datent de 1960 et 1963.", src: 'Monégasque' },
        { t: "Les plaques de rue de Monaco sont bilingues, en français et en monégasque.", src: 'Monégasque' },
        { t: "Le monégasque n'est pas la langue officielle de la principauté : c'est le français.", src: 'Monégasque' },
        { t: "Depuis 1981, un concours officiel de langue, culture et histoire monégasques est organisé chaque année.", src: 'Monégasque' }
      ] }
  };

  racine.LANG_HISTOIRE = LANG_HISTOIRE;
  if (typeof module !== 'undefined' && module.exports) module.exports = { LANG_HISTOIRE: LANG_HISTOIRE };
})(typeof globalThis !== 'undefined' ? globalThis : this);
