/* 📚 LES SOURCES OFFICIELLES DE CHAQUE LANGUE — Kevin 2026-08-13
   « Intègre les sources, les langues » (capture Google : Académie des Langues Dialectales,
   Comité National des Traditions Monégasques).

   IDÉE : pour aller plus loin qu'un cours, l'élève doit pouvoir remonter à la MAISON qui fait
   autorité sur la langue qu'il apprend — l'académie, le dictionnaire de référence, l'institut.
   Un tap, il y est.

   RÈGLE DE VÉRITÉ (importante) : un lien n'est PAS publié tant qu'il n'a pas été OUVERT pour
   de vrai. Depuis l'agent, je n'ai pas accès à internet : c'est donc la CI (réseau ouvert) qui
   ouvre chaque adresse et écrit ici le résultat — `etat: "ok"` (la page répond),
   `"robot"` (le site refuse les robots : l'adresse est bonne, un humain passe),
   `"mort"` (introuvable) ou `"?"` (jamais testé).
   L'APPLICATION N'AFFICHE QUE « ok » ET « robot ». Rien d'inventé, rien de mort à l'écran.
     · tester + mettre à jour : node tools/lingua/verify-sources.mjs --live
     · contrôle sans réseau   : node tools/lingua/verify-sources.mjs

   Ces liens sont des RÉFÉRENCES vers les sites de ces institutions — on ne recopie évidemment
   aucun dictionnaire sous droits (le Comité National des Traditions Monégasques édite le sien :
   on y renvoie, on ne le copie pas).
*/
(function (racine) {
  'use strict';

  var LANG_SOURCES = {
    mc: [
      { nom: 'Comité National des Traditions Monégasques', url: 'https://www.traditionsmonegasques.mc/', quoi: 'la maison qui édite le dictionnaire et enseigne la langue', etat: '?' },
      { nom: 'Académie des Langues Dialectales', url: 'https://www.acaledi.mc/', quoi: 'académie officielle des langues de Monaco', etat: '?' },
      { nom: 'Wiktionnaire — monégasque', url: 'https://fr.wiktionary.org/wiki/Cat%C3%A9gorie:mon%C3%A9gasque', quoi: 'les mots libres (CC BY-SA) qui alimentent ce cours', etat: '?' },
      { nom: 'munegascu.free.fr', url: 'http://munegascu.free.fr/index_uk.htm', quoi: 'le lexique par thèmes qui alimente ce cours', etat: '?' },
      { nom: 'Mairie de Monaco — langue monégasque', url: 'https://www.mairie.mc/', quoi: 'cours de langue monégasque proposés en ville', etat: '?' }
    ],
    en: [
      { nom: 'Oxford English Dictionary', url: 'https://www.oed.com/', quoi: 'le dictionnaire historique de référence', etat: '?' },
      { nom: 'Cambridge Dictionary', url: 'https://dictionary.cambridge.org/', quoi: 'dictionnaire avec prononciation, gratuit', etat: '?' },
      { nom: 'Merriam-Webster', url: 'https://www.merriam-webster.com/', quoi: 'la référence de l\'anglais américain', etat: '?' }
    ],
    it: [
      { nom: 'Accademia della Crusca', url: 'https://accademiadellacrusca.it/', quoi: 'la plus ancienne académie de langue au monde (1583)', etat: '?' },
      { nom: 'Treccani', url: 'https://www.treccani.it/vocabolario/', quoi: 'le vocabulaire italien de référence', etat: '?' }
    ],
    es: [
      { nom: 'Real Academia Española', url: 'https://www.rae.es/', quoi: 'l\'académie qui fait la norme de l\'espagnol', etat: '?' },
      { nom: 'Diccionario de la lengua española', url: 'https://dle.rae.es/', quoi: 'le dictionnaire officiel, gratuit', etat: '?' }
    ],
    de: [
      { nom: 'Duden', url: 'https://www.duden.de/', quoi: 'la référence de l\'orthographe allemande', etat: '?' },
      { nom: 'Leibniz-Institut für Deutsche Sprache', url: 'https://www.ids-mannheim.de/', quoi: 'l\'institut de recherche sur l\'allemand', etat: '?' }
    ],
    pt: [
      { nom: 'Priberam', url: 'https://dicionario.priberam.org/', quoi: 'dictionnaire du portugais européen, gratuit', etat: '?' },
      { nom: 'Instituto Camões', url: 'https://www.instituto-camoes.pt/', quoi: 'l\'institut officiel de la langue portugaise', etat: '?' }
    ],
    nl: [
      { nom: 'Nederlandse Taalunie', url: 'https://taalunie.org/', quoi: 'l\'union qui fixe la norme du néerlandais', etat: '?' },
      { nom: 'Woordenlijst (het Groene Boekje)', url: 'https://woordenlijst.org/', quoi: 'la liste orthographique officielle', etat: '?' }
    ],
    pl: [
      { nom: 'Rada Języka Polskiego', url: 'https://rjp.pan.pl/', quoi: 'le conseil de la langue polonaise', etat: '?' },
      { nom: 'Słownik języka polskiego PWN', url: 'https://sjp.pwn.pl/', quoi: 'le dictionnaire de référence, gratuit', etat: '?' }
    ],
    ru: [
      { nom: 'Gramota.ru', url: 'http://gramota.ru/', quoi: 'le portail de référence du russe', etat: '?' },
      { nom: 'Институт русского языка им. В. В. Виноградова', url: 'https://www.ruslang.ru/', quoi: 'l\'institut de la langue russe', etat: '?' }
    ],
    uk: [
      { nom: 'Словник української мови', url: 'https://sum.in.ua/', quoi: 'le dictionnaire de l\'ukrainien', etat: '?' },
      { nom: 'Інститут української мови НАН України', url: 'https://iul-nasu.org.ua/', quoi: 'l\'institut de la langue ukrainienne', etat: '?' }
    ],
    cs: [
      { nom: 'Ústav pro jazyk český', url: 'https://ujc.cas.cz/', quoi: 'l\'institut de la langue tchèque', etat: '?' },
      { nom: 'Internetová jazyková příručka', url: 'https://prirucka.ujc.cas.cz/', quoi: 'le guide officiel en ligne, gratuit', etat: '?' }
    ],
    zh: [
      { nom: '教育部重編國語辭典', url: 'https://dict.revised.moe.edu.tw/', quoi: 'le dictionnaire officiel du ministère de l\'Éducation', etat: '?' },
      { nom: 'MDBG', url: 'https://www.mdbg.net/chinese/dictionary', quoi: 'dictionnaire chinois-anglais avec tracé des caractères', etat: '?' }
    ],
    ja: [
      { nom: '文化庁 — 国語施策', url: 'https://www.bunka.go.jp/kokugo_nihongo/', quoi: 'l\'agence culturelle qui fixe la norme du japonais', etat: '?' },
      { nom: 'Jisho', url: 'https://jisho.org/', quoi: 'dictionnaire japonais avec kanji, gratuit', etat: '?' }
    ],
    ko: [
      { nom: '국립국어원 (Institut national de la langue coréenne)', url: 'https://www.korean.go.kr/', quoi: 'l\'institut officiel du coréen', etat: '?' },
      { nom: '표준국어대사전', url: 'https://stdict.korean.go.kr/', quoi: 'le grand dictionnaire officiel, gratuit', etat: '?' }
    ],
    ar: [
      { nom: 'مجمع اللغة العربية بالقاهرة', url: 'https://www.arabicacademy.org.eg/', quoi: 'l\'académie de langue arabe du Caire', etat: '?' },
      { nom: 'Almaany', url: 'https://www.almaany.com/', quoi: 'dictionnaire arabe en ligne, gratuit', etat: '?' }
    ]
  };

  racine.LANG_SOURCES = LANG_SOURCES;
  if (typeof module !== 'undefined' && module.exports) module.exports = { LANG_SOURCES: LANG_SOURCES };
})(typeof globalThis !== 'undefined' ? globalThis : this);
