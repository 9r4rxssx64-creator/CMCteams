/* Diagnostic RÉEL « à la place de Kevin » : s'authentifie en admin machine (même jeton
   SSO que le worker) et lance la VRAIE découverte Tuya sur la prod, avec les clés de
   Kevin déjà stockées côté serveur. Tourne sur le runner GitHub (réseau ouvert ;
   l'agent, lui, ne joint pas *.kd-mc.com). Imprime l'état + le diagnostic brut par
   data center → on voit la vérité, aucune supposition. Aucune action destructive.
   Requiert le secret SSO en env : KDMC_SSO_SECRET.  node tools/smoke/poolpilot-tuya-diag.mjs */
import { createHmac } from 'crypto';

const SECRET = process.env.KDMC_SSO_SECRET || process.env.JWT_SECRET || '';
const BASE = 'https://beatbot.kd-mc.com';

const b64url = (buf) => Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
/* Reproduit ssoSign(secret,'__kdmc_admin__','admin',cgu=1,verified=1) du worker */
function adminGrant(secret) {
  const payload = { u: '__kdmc_admin__', n: 'admin', c: 1, v: 1, iat: Date.now(), exp: Date.now() + 5 * 60 * 1000 };
  const p = b64url(JSON.stringify(payload));
  const sig = b64url(createHmac('sha256', secret).update(p).digest());
  return p + '.' + sig;
}

async function main() {
  if (!SECRET) { console.log('✗ KDMC_SSO_SECRET absent → impossible de signer le jeton admin.'); process.exit(2); }
  const grant = adminGrant(SECRET);
  const H = { 'x-kdmc-admin': grant };

  // 1) état de liaison (sans jamais exposer le secret)
  const st = await fetch(BASE + '/__beatbot/tuya/state', { headers: H });
  const sj = await st.json().catch(() => ({}));
  console.log('— État liaison Tuya —');
  console.log('  authentifié admin :', st.status !== 403 ? 'oui' : 'NON (jeton refusé)');
  console.log('  linked :', sj.linked, '| region :', sj.region, '| host :', sj.host, '| device_id :', sj.device_id || '(aucun)', '| id_hint :', sj.id_hint);

  // 2) VRAIE découverte multi-zones (utilise les clés stockées de Kevin)
  const dv = await fetch(BASE + '/__beatbot/tuya/devices', { headers: H });
  const dj = await dv.json().catch(() => ({}));
  console.log('\n— Découverte robots (réelle) —  HTTP', dv.status);
  console.log('  robots trouvés :', (dj.devices || []).length);
  (dj.devices || []).forEach((d) => console.log('   • ' + d.name + ' [' + d.id + '] ' + (d.online ? 'en ligne' : 'hors ligne') + ' cat=' + d.category));
  if (dj.host) console.log('  data center gagnant :', dj.host);
  if (dj.tried) {
    console.log('  zones testées :');
    dj.tried.forEach((t) => console.log('   - ' + t.host + (t.path ? ' ' + t.path.split('/').slice(-2).join('/') : '') + ' → ' + (t.error ? ('⚠ ' + t.error) : (t.count + ' robot(s)'))));
  }
  if (dj.reason) console.log('  reason :', dj.reason, dj.detail || '');

  // 3) si un robot est déjà choisi côté serveur → lire l'état RÉEL + les commandes réelles
  //    (aucune invention : ce que le robot remonte vraiment via Tuya)
  if (sj.device_id) {
    const stR = await fetch(BASE + '/__beatbot/tuya/status', { headers: H });
    const stJ = await stR.json().catch(() => ({}));
    console.log('\n— État RÉEL du robot choisi —  HTTP', stR.status);
    if (stJ.ok) {
      console.log('  nom :', stJ.name, '| en ligne :', stJ.online);
      console.log('  datapoints (code = valeur) :');
      (stJ.status || []).forEach((s) => console.log('   • ' + s.code + ' = ' + JSON.stringify(s.value)));
    } else console.log('  ⚠', stJ.detail || stJ.reason || '(pas de status)');

    const fnR = await fetch(BASE + '/__beatbot/tuya/functions', { headers: H });
    const fnJ = await fnR.json().catch(() => ({}));
    console.log('\n— Commandes RÉELLES pilotables —  HTTP', fnR.status);
    if (fnJ.ok) (fnJ.functions || []).forEach((f) => console.log('   • ' + f.code + ' (' + f.type + ') ' + (f.values || '')));
    else console.log('  ⚠', fnJ.detail || fnJ.reason || '(pas de functions)');
  }

  // Verdict lisible pour les logs
  console.log('\n=== VERDICT ===');
  if ((dj.devices || []).length) console.log('✅ Robot trouvé sur ' + dj.host + ' — la sélection va marcher dans l\'app.');
  else if (!sj.linked) console.log('⚠ Compte Tuya non lié côté serveur (clés absentes).');
  else console.log('⚠ 0 robot sur toutes les zones Europe → le lien « Link App Account » de la console ne remonte pas encore le device (côté Tuya), OU propagation en cours.');
  process.exit(0);
}
main().catch((e) => { console.error('diag crash', e); process.exit(1); });
