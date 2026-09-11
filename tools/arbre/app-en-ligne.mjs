/* Quelle version de l'arbre tourne VRAIMENT sur le téléphone de Kevin ?
   ---------------------------------------------------------------------
   Vécu le 11.09.2026 : je lui ai envoyé un fichier photo marqué « fusion » (compléter la fiche
   sans l'écraser) alors que son iPhone affichait la v3.18, où cette notion n'existe pas encore.
   Mesuré ensuite dans un vrai navigateur sur la page v3.18 : elle ignore « fusion » et REMPLACE
   la fiche — son père serait devenu « (sans nom) », sans dates ni parents, avec la seule photo.
   Ce qui est en ligne, c'est `main` (ma branche ne l'est pas tant qu'elle n'est pas fusionnée
   ET publiée). Ce petit module répond donc à une seule question, avant d'écrire quoi que ce
   soit : « la version en ligne sait-elle compléter une fiche ? ». */
import { execFileSync } from 'node:child_process';

/** Lit arbre/index.html tel qu'il est sur origin/main (= ce qui est publié). */
export function lireAppEnLigne(root) {
  return execFileSync('git', ['show', 'origin/main:arbre/index.html'], { cwd: root, maxBuffer: 64 * 1024 * 1024 }).toString('utf8');
}

/** { connu, ok, ver } — `connu:false` = on n'a pas pu regarder (pas de git) : on prévient, on ne bloque pas. */
export function appEnLigneSaitFusionner(lire) {
  let html;
  try { html = lire(); } catch (e) { return { connu: false, ok: false, ver: '?' }; }
  if (typeof html !== 'string' || !html) return { connu: false, ok: false, ver: '?' };
  const ver = (html.match(/var APP_VER="([^"]+)"/) || [])[1] || '?';
  /* la fusion doit exister ET être câblée dans l'import — une fonction jamais appelée ne
     protège rien (Declaration ≠ Deployment, erreur #28) */
  const ok = /function fusionnerFiche\(/.test(html) && /fusionnerFiche\(lp,rp,true\)/.test(html);
  return { connu: true, ok, ver };
}
