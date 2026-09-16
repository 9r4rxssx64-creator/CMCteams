/* GARDE — la machine hebdomadaire du Club IA (tools/club/semaine.mjs) ne doit
 * jamais publier un contenu faux, tronqué ou sans accents, ni casser en silence.
 * Tout est joué hors ligne avec un faux réseau (D1, Anthropic, EmailJS).
 *   node --test tests/club-semaine.test.mjs
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as S from '../tools/club/semaine.mjs';

const bon = `<h2>Semaine du 21 septembre 2026 — Relancer un devis sans se sentir lourd</h2>
<p class="promesse">À la fin, tu relances n'importe quel devis en trois messages polis, en deux minutes, depuis ton téléphone.</p>
<h3>Pourquoi ça change ta semaine</h3>
<p>Un devis envoyé et resté sans réponse, c'est de l'argent qui dort. Beaucoup d'indépendants n'osent pas relancer, par peur de déranger. Pourtant, une relance courte et aimable fait souvent repartir la conversation. Avec l'assistant IA, tu prépares les trois messages d'avance et tu n'y penses plus : tu copies, tu envoies, tu passes à autre chose. Le temps gagné se compte en heures chaque mois, et surtout en devis signés.</p>
<h3>La méthode pas à pas</h3>
<ol>
<li>Ouvre ChatGPT, Claude ou Gemini (la version gratuite suffit) sur ton téléphone.</li>
<li>Copie la première consigne ci-dessous et remplace les crochets par tes informations.</li>
<li>Envoie, puis lis la réponse à voix haute : si une phrase ne te ressemble pas, demande « plus simple » ou « plus court ».</li>
<li>Copie le message dans ton application de messages ou dans ton e-mail.</li>
<li>Note dans ton agenda la date de la relance suivante, à cinq jours.</li>
</ol>
<h3>Une relance douce, prête à envoyer</h3>
<pre class="consigne">Tu es mon assistant. Je suis [métier] et j'ai envoyé un devis de [montant] à [prénom du client] le [date] pour [prestation]. Écris une relance courte (5 lignes maximum), chaleureuse, sans culpabiliser le client, qui propose une date pour en parler. Tutoiement si je le tutoie : [oui/non].</pre>
<div class="exemple"><p>Résultat pour une fleuriste : « Bonjour Madame Martin, je reviens vers vous au sujet du devis pour la décoration florale du 12 octobre. Je garde la date pour vous jusqu'à vendredi ; souhaitez-vous que l'on échange cinq minutes par téléphone pour ajuster les couleurs ? Belle journée. »</p></div>
<h3>La dernière relance, qui ferme la porte gentiment</h3>
<pre class="consigne">Tu es mon assistant. Écris la dernière relance à [prénom du client] pour le devis [prestation] envoyé le [date]. Ton : bienveillant, sans reproche. Dis que le devis reste valable jusqu'au [date limite] et qu'ensuite le créneau sera proposé à quelqu'un d'autre. Termine par une question simple.</pre>
<div class="exemple"><p>Résultat pour une fleuriste : « Bonjour Madame Martin, le devis reste valable jusqu'au 30 septembre ; passé cette date, je libère le créneau. Souhaitez-vous que je le garde pour vous ? »</p></div>
<div class="attention"><p>Trois pièges à éviter. Ne colle jamais un numéro de carte, un mot de passe ou une donnée de santé d'un client dans une IA. Relis toujours avant d'envoyer : c'est toi qui signes. L'assistant peut inventer un chiffre ou une date : vérifie chaque nombre. Pour les délais de paiement légaux, vérifie sur service-public.fr.</p></div>
<div class="check"><ul><li>☐ Le devis, la date et le montant sont corrects</li><li>☐ Le message fait moins de six lignes</li><li>☐ Il propose une action simple</li><li>☐ La relance suivante est notée dans l'agenda</li></ul></div>
<p>Cette méthode marche aussi pour une facture impayée, en remplaçant le mot devis par facture, et pour une réponse attendue d'un fournisseur. Garde les deux consignes dans tes notes : elles te serviront chaque semaine, et tu pourras les adapter à chaque client en quelques secondes, sans réécrire quoi que ce soit. L'essentiel est de rester régulier : une relance courte tous les cinq jours, jamais plus de trois, et une porte laissée ouverte à chaque fois. Avec le temps, tu verras quels messages font répondre tes clients le plus vite, et tu ajusteras tes consignes en conséquence pour gagner encore quelques minutes à chaque envoi.</p>`;

test('semaine ISO et lundi', () => {
  assert.equal(S.semaineISO(new Date('2026-09-21T07:00:00Z')).id, 's2026-39');
  assert.equal(S.semaineISO(new Date('2026-01-01T07:00:00Z')).id, 's2026-01');
  assert.equal(S.semaineISO(new Date('2027-01-03T07:00:00Z')).id, 's2026-53');
  assert.equal(S.dateFr(S.lundiDe(new Date('2026-09-24T07:00:00Z'))), '21 septembre 2026');
  assert.equal(S.dateFr(S.lundiDe(new Date('2026-09-21T07:00:00Z'))), '21 septembre 2026');
});

test('un bon contenu passe la porte, et le titre est extrait', () => {
  const v = S.valide(bon);
  assert.deepEqual(v.erreurs, []);
  assert.equal(v.ok, true);
  assert.equal(v.consignes, 2);
  assert.equal(v.titre, 'Relancer un devis sans se sentir lourd');
  assert.equal(S.nettoieSortie('```html\n' + bon + '\n```'), bon);
});

test('la porte de vérité refuse chaque sabotage (prouvée discriminante)', () => {
  const cas = {
    'émoji': bon.replace('Belle journée.', 'Belle journée 🎉.'),
    'mot prompt': bon.replace('la première consigne', 'le premier prompt'),
    'une seule consigne': bon.replace(/<h3>La dernière relance[\s\S]*?<\/div>\n/, ''),
    'sans checklist': bon.replace('<div class="check">', '<div class="liste">'),
    'script': bon + '<script>alert(1)</script>',
    'lien': bon.replace('<p>Cette méthode', '<p><a href="https://x">x</a> Cette méthode'),
    'sans accents': bon.normalize('NFD').replace(/[̀-ͯ]/g, ''),
    'trou à compléter': bon.replace('Belle journée.', '[À COMPLÉTER]'),
    'mauvais début': bon.replace('<h2>Semaine du 21 septembre 2026 — ', '<h2>'),
    'chiffre légal sans source': bon.replace('vérifie sur service-public.fr', 'le délai est de 30 jours').replace('Belle journée.', 'Pénalité de 10 % de retard.'),
    'titre déjà publié': bon,
  };
  for (const [nom, html] of Object.entries(cas)) {
    const v = S.valide(html, { titresExistants: nom === 'titre déjà publié' ? ['Relancer un devis sans se sentir lourd'] : [] });
    assert.equal(v.ok, false, 'devrait refuser : ' + nom);
  }
});

/* Faux réseau : D1 (REST), Anthropic, EmailJS — tout est capturé. */
function fauxReseau({ base = [], reponseIA = bon, d1Refuse = false, emailOk = true } = {}) {
  const appels = { d1: [], ia: [], mails: [] };
  const contenu = [...base];
  globalThis.fetch = async (url, opt) => {
    const u = String(url);
    const corps = opt && opt.body ? JSON.parse(opt.body) : {};
    if (u.includes('api.cloudflare.com')) {
      appels.d1.push(corps);
      if (d1Refuse) return { ok: false, status: 403, json: async () => ({ success: false, errors: [{ code: 10000, message: 'Authentication error' }] }) };
      assert.ok(!/'/.test(corps.sql.replace(/<> ''/, '')), 'jamais de valeur concaténée dans le SQL');
      let results = [];
      if (/^SELECT produit, id, ordre, titre FROM contenu/.test(corps.sql)) results = contenu.filter((l) => corps.params.includes(l.produit));
      else if (/^INSERT INTO contenu/.test(corps.sql)) contenu.push({ produit: corps.params[0], id: corps.params[1], ordre: corps.params[2], titre: corps.params[3], html: corps.params[4] });
      else if (/^SELECT id, ordre, titre, length\(html\)/.test(corps.sql)) results = contenu.filter((l) => l.produit === corps.params[0] && l.id === corps.params[1]).map((l) => ({ id: l.id, ordre: l.ordre, titre: l.titre, taille: l.html.length }));
      else if (/^SELECT DISTINCT email FROM abonnes/.test(corps.sql)) results = [{ email: 'a@x.fr' }, { email: 'b@x.fr' }];
      return { ok: true, status: 200, json: async () => ({ success: true, result: [{ results }] }) };
    }
    if (u.includes('api.anthropic.com')) {
      appels.ia.push(corps);
      assert.equal(opt.headers['x-api-key'], 'sk-test');
      const r = typeof reponseIA === 'function' ? reponseIA(appels.ia.length) : reponseIA;
      return { ok: true, status: 200, json: async () => ({ content: [{ type: 'text', text: r }] }) };
    }
    if (u.includes('api.emailjs.com')) {
      appels.mails.push(corps.template_params);
      assert.equal(corps.accessToken, 'ej-test');
      return { ok: emailOk, status: emailOk ? 200 : 403, json: async () => ({}), text: async () => (emailOk ? 'OK' : 'API calls are disabled for non-browser applications') };
    }
    throw new Error('appel réseau inattendu : ' + u);
  };
  return { appels, contenu };
}
const ENV = { CLOUDFLARE_API_TOKEN: 'cf-test', CLOUDFLARE_ACCOUNT_ID: 'acct', ANTHROPIC_API_KEY: 'sk-test', EMAILJS_PRIVATE_KEY: 'ej-test', CLUB_DATE: '2026-09-21T07:00:00Z' };
const KIT = [1, 2, 3, 4, 5, 6, 7].map((n) => ({ produit: 'kit-ia', id: 'm' + n, ordre: n, titre: 'Module ' + n, html: 'x' }));

test('essai à blanc : lit la base, rédige, contrôle, n\'écrit RIEN et n\'envoie RIEN', async () => {
  const { appels, contenu } = fauxReseau({ base: KIT });
  const lignes = [];
  const r = await S.principal({ ...ENV, DRY_RUN: 'true' }, (l) => lignes.push(l));
  assert.equal(r.dry, true);
  assert.equal(appels.d1.length, 1, 'une seule lecture D1');
  assert.equal(appels.ia.length, 1);
  assert.equal(appels.mails.length, 0);
  assert.equal(contenu.length, 7);
  assert.ok(lignes.some((l) => l.startsWith('SEMAINE SIMULÉE')));
});

test('publication réelle : insère avec paramètres liés, relit, prévient chaque abonné et Kevin', async () => {
  const { appels, contenu } = fauxReseau({ base: KIT });
  const lignes = [];
  const r = await S.principal({ ...ENV, DRY_RUN: 'false' }, (l) => lignes.push(l));
  assert.equal(r.id, 's2026-39');
  assert.equal(r.envoyes, 2);
  const ins = contenu.find((l) => l.produit === 'club-ia');
  assert.equal(ins.id, 's2026-39');
  assert.equal(ins.ordre, 8, 'le Club continue la numérotation du kit');
  assert.equal(ins.titre, 'Relancer un devis sans se sentir lourd');
  assert.equal(appels.mails.length, 3);
  assert.deepEqual(appels.mails.slice(0, 2).map((m) => m.to_email), ['a@x.fr', 'b@x.fr']);
  assert.equal(appels.mails[2].to_email, S.EMAIL_KEVIN);
  assert.ok(appels.mails[2].message.includes('Consigne n° 1 publiée'));
  assert.ok(!appels.mails.some((m) => /[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}/.test(m.message)), 'aucun code d\'accès dans un e-mail');
  assert.ok(!appels.mails[2].message.includes('a@x.fr'), 'le point à Kevin ne liste pas les adresses');
  assert.ok(lignes.some((l) => l.startsWith('SEMAINE PUBLIÉE : s2026-39')));
});

test('semaine déjà en base : rien n\'est réécrit', async () => {
  const { appels } = fauxReseau({ base: [...KIT, { produit: 'club-ia', id: 's2026-39', ordre: 8, titre: 'Déjà là', html: 'x' }] });
  const r = await S.principal({ ...ENV, DRY_RUN: 'false' }, () => {});
  assert.equal(r.deja, true);
  assert.equal(appels.ia.length, 0);
  assert.equal(appels.mails.length, 0);
});

test('contenu refusé 3 fois : RIEN n\'est publié, et la 2e demande porte les raisons du refus', async () => {
  const { appels, contenu } = fauxReseau({ base: KIT, reponseIA: bon.replace('la première consigne', 'le premier prompt') });
  await assert.rejects(S.principal({ ...ENV, DRY_RUN: 'false' }, () => {}), /refusé 3 fois/);
  assert.equal(appels.ia.length, 3);
  assert.ok(JSON.stringify(appels.ia[1].messages).includes('prompt » est interdit'));
  assert.equal(contenu.length, 7);
  assert.equal(appels.mails.length, 0);
});

test('jeton Cloudflare sans droit D1 : cause exacte, pas de mystère', async () => {
  fauxReseau({ base: KIT, d1Refuse: true });
  await assert.rejects(S.principal({ ...ENV }, () => {}), /10000 Authentication error.*D1/);
});

test('secret manquant : nommé, jamais deviné', async () => {
  await assert.rejects(S.principal({ ...ENV, ANTHROPIC_API_KEY: '' }, () => {}), /secret manquant : ANTHROPIC_API_KEY/);
});

test('variété : métier et thème ne se recroisent pas avant des mois', () => {
  const vus = new Set();
  for (let n = 1; n <= 52; n++) vus.add(S.METIERS[n % S.METIERS.length] + '|' + S.THEMES[n % S.THEMES.length]);
  assert.equal(vus.size, 52);
});

test('EmailJS refuse : la cause EXACTE est dans le journal, la publication continue', async () => {
  fauxReseau({ base: KIT, emailOk: false });
  const lignes = [];
  const r = await S.principal({ ...ENV, DRY_RUN: 'false' }, (l) => lignes.push(l));
  assert.equal(r.envoyes, 0);
  assert.equal(r.rates, 2);
  assert.ok(lignes.some((l) => /EmailJS refuse .* HTTP 403 API calls are disabled/.test(l)), 'cause exacte attendue');
  assert.ok(!lignes.some((l) => l.includes('ej-test')), 'jamais la clé dans le journal');
  assert.ok(lignes.some((l) => l.startsWith('SEMAINE PUBLIÉE')));
});

test('essai à blanc + TEST_EMAIL : un seul e-mail d\'essai à Kevin, rien d\'autre', async () => {
  const { appels } = fauxReseau({ base: KIT });
  const lignes = [];
  await S.principal({ ...ENV, DRY_RUN: 'true', TEST_EMAIL: 'true' }, (l) => lignes.push(l));
  assert.equal(appels.mails.length, 1);
  assert.equal(appels.mails[0].to_email, S.EMAIL_KEVIN);
  assert.ok(lignes.some((l) => l.includes('Essai d\'e-mail à Kevin : ENVOYÉ')));
});

test('essai d\'e-mail : tourne AUSSI quand la semaine est déjà en base', async () => {
  const { appels } = fauxReseau({ base: [...KIT, { produit: 'club-ia', id: 's2026-39', ordre: 8, titre: 'Déjà là', html: 'x' }] });
  const r = await S.principal({ ...ENV, DRY_RUN: 'true', TEST_EMAIL: 'true' }, () => {});
  assert.equal(r.deja, true);
  assert.equal(appels.mails.length, 1);
});
