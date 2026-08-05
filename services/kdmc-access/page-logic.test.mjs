/* Teste la LOGIQUE RÉELLEMENT LIVRÉE dans la page « Qui se connecte ».
   Les fonctions sont extraites du HTML servi (pas d'une copie) → si quelqu'un modifie
   la page, le test suit. Deux bugs vécus le 2026-08-05 sont verrouillés ici :
   1) Kevin affichait « 2 connexions » au lieu de ~191 : deux comptes portant le même
      nom, et le 2e ÉCRASAIT le 1er (`=` au lieu de `+=`).
   2) « CI Smoke » (167 connexions depuis un runner GitHub) et « Vérification
      automatique » comptaient comme des PERSONNES → total faussé, vraies personnes noyées.
   node --test (depuis services/kdmc-access) */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { PAGE_HTML } from './page.js';

/* Extrait une fonction nommée du script de la page (accolades équilibrées). */
function grab(name) {
  const src = PAGE_HTML.match(/<script>([\s\S]*?)<\/script>/)[1];
  const start = src.indexOf('function ' + name + '(');
  assert.ok(start >= 0, 'fonction ' + name + ' introuvable dans la page livrée');
  let i = src.indexOf('{', start), depth = 0, end = -1;
  for (let j = i; j < src.length; j++) {
    if (src[j] === '{') depth++;
    else if (src[j] === '}') { depth--; if (depth === 0) { end = j + 1; break; } }
  }
  return src.slice(start, end);
}

const ctx = vm.createContext({});
vm.runInContext(grab('norm') + '\n' + grab('isBot'), ctx);
const isBot = (p) => vm.runInContext('isBot(' + JSON.stringify(p) + ')', ctx);

test('les robots de test ne sont PAS des personnes', () => {
  assert.equal(isBot({ name: 'CI Smoke', uids: ['ci_smoke'] }), true);
  assert.equal(isBot({ name: 'Vérification automatique', uids: ['__verif__'] }), true);
  assert.equal(isBot({ name: 'uptime monitor', uids: [] }), true);
  assert.equal(isBot({ name: 'x', uids: [], tiers: { test: 3 } }), true);
});

test('les vraies personnes ne sont JAMAIS prises pour des robots', () => {
  assert.equal(isBot({ name: 'kevin Desarzens', uids: ['kdmc_admin'] }), false);
  assert.equal(isBot({ name: 'Ronan Desarzens', uids: ['ronan'] }), false);
  assert.equal(isBot({ name: 'Laurence Saint-Polit', uids: ['laurence-sp'] }), false);
  /* Piège : un prénom contenant « ci » (Cindy, Patricia) ne doit pas être filtré. */
  assert.equal(isBot({ name: 'Cindy Martin', uids: ['cindy'] }), false);
  assert.equal(isBot({ name: 'Patricia Rossi', uids: ['patricia'] }), false);
});

test('deux comptes d\'une même personne s\'ADDITIONNENT (bug des « 2 connexions »)', () => {
  /* Rejoue la fusion telle qu'écrite dans la page, sur le cas réel de Kevin. */
  const src = PAGE_HTML.match(/<script>([\s\S]*?)<\/script>/)[1];
  assert.ok(/m\.conns=\(m\.conns\|\|0\)\+\(p\.hits\|\|0\)/.test(src.replace(/\s/g, '')),
    'les connexions doivent être ADDITIONNÉES (+=), jamais écrasées (=)');
  assert.ok(/m\.hist=\(m\.hist\|\|\[\]\)\.concat/.test(src.replace(/\s/g, '')),
    'les historiques des différents comptes doivent être CONCATÉNÉS');
  assert.ok(!/m\.conns=p\.hits/.test(src.replace(/\s/g, '')),
    'régression : écrasement des connexions réintroduit');
});

test('les compteurs du haut ne comptent que les PERSONNES (robots exclus)', () => {
  const src = PAGE_HTML.match(/<script>([\s\S]*?)<\/script>/)[1].replace(/\s/g, '');
  assert.ok(/varhumans=all\.filter\(function\(p\)\{return!isBot\(p\)\}\)/.test(src), 'liste « humains » calculée');
  assert.ok(/humans\.reduce/.test(src), 'le total des connexions se calcule sur les humains');
  assert.ok(/humans\.length/.test(src), 'le nombre de personnes se calcule sur les humains');
});
