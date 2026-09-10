#!/usr/bin/env node
/**
 * Garde : aucune branche robot « silencieuse ».
 *
 * Mesuré le 10.09.2026 (leçon #243) : 10 workflows poussaient une branche
 * `claude/<nom>-${{ github.run_id }}` en écrivant « (auto-merge) » dans leur journal.
 * Or un push signé par GITHUB_TOKEN ne déclenche JAMAIS un autre workflow, et le
 * message portait `[skip ci]` : la fusion automatique ne les a jamais vues.
 * Résultat : 73 branches orphelines depuis juin, et la boutique La Détente qui
 * demande `push-config.json` — un fichier que main n'a jamais reçu.
 *
 * La règle, simple et vérifiable : un workflow qui crée une branche `claude/*-<run_id>`
 * doit DIRE ce qu'elle devient, par l'un des deux moyens seulement :
 *   (a) il publie via `./.github/actions/publier-config` → PR + fusion par le robot ;
 *   (b) il porte le marqueur `# branche-de-relecture` → la branche est faite pour être
 *       LUE (captures d'écran, images générées, moisson à relire), pas fusionnée.
 * Tout le reste = une branche qui ne va nulle part, et le garde échoue.
 *
 * Lancer : node tests/verify-branches-robot.mjs
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const WF = '.github/workflows';
const ACTION = '.github/actions/publier-config/action.yml';
const R = { ok: [], ko: [] };
const chk = (cond, msg) => (cond ? R.ok : R.ko).push(msg);

const BRANCHE_ROBOT = /claude\/[a-z0-9-]+-\$\{\{\s*github\.run_id\s*\}\}/;
const codeSeul = (s) => s.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');

/* ── 1. L'action existe et fait ce qu'elle promet ─────────────────────── */
chk(existsSync(ACTION), `l'action ${ACTION} existe`);
if (existsSync(ACTION)) {
  const a = readFileSync(ACTION, 'utf8');
  chk(/gh pr create/.test(a), 'l\'action crée une PR (pas une branche orpheline)');
  chk(/gh pr merge/.test(a), 'l\'action fusionne la PR elle-même (le push GITHUB_TOKEN ne réveille personne)');
  chk(/GITHUB_REF_NAME[^\n]*!= "main"/.test(a), 'l\'action refuse de publier depuis une branche claude/* (main seule base)');
  chk(/updated_at/.test(a), 'l\'action ignore les lignes d\'horodatage (sinon une branche par déploiement pour rien)');
  chk(/gh workflow run deploy\.yml/.test(a), 'l\'action relance deploy.yml après fusion (sinon le fichier n\'est pas servi)');
  chk(/exit 1/.test(a) && /Cause exacte/.test(a), 'une fusion refusée est ROUGE avec la cause exacte (leçon #214)');
}

/* ── 2. Chaque workflow qui crée une branche robot dit ce qu'elle devient ── */
const fichiers = readdirSync(WF).filter((f) => /\.ya?ml$/.test(f)).sort();
let relus = 0, publies = 0;
for (const f of fichiers) {
  const s = readFileSync(join(WF, f), 'utf8');
  const code = codeSeul(s);
  /* Deux façons de créer une branche robot : à la main dans le script (regex), ou via l'action
     (qui la crée pour le workflow — la regex ne la voit donc PAS dans le workflow lui-même). */
  const publie = /uses:\s*\.\/\.github\/actions\/publier-config/.test(code);
  const creeALaMain = BRANCHE_ROBOT.test(code);
  if (!publie && !creeALaMain) continue;
  const relecture = /^\s*#\s*branche-de-relecture/m.test(s);
  if (publie) {
    publies += 1;
    chk(true, `${f} : config PUBLIÉE dans main via l'action (PR + fusion)`);
    chk(/pull-requests:\s*write/.test(code), `${f} : a la permission pull-requests: write (sinon gh pr create échoue)`);
    chk(/actions:\s*write/.test(code), `${f} : a la permission actions: write (sinon deploy.yml ne se relance pas)`);
    chk(!creeALaMain, `${f} : ne crée plus de branche claude/*-<run_id> à la main en plus de l'action`);
    chk(!/git push -u origin "\$BR"/.test(code), `${f} : ne pousse plus de branche à la main en plus de l'action`);
  } else if (relecture) {
    relus += 1;
    chk(true, `${f} : branche robot déclarée « de relecture » (faite pour être lue, pas fusionnée)`);
  } else {
    chk(false, `${f} : crée une branche claude/*-<run_id> qui ne va NULLE PART — utiliser ./.github/actions/publier-config ou déclarer « # branche-de-relecture »`);
  }
}
chk(publies > 0 && relus > 0, `${publies} workflow(s) publient via l'action, ${relus} déposent une branche de relecture (le garde a quelque chose à garder)`);

R.ok.forEach((m) => console.log('  OK ' + m));
R.ko.forEach((m) => console.log('  FAIL ' + m));
console.log(`=== ${R.ok.length} OK / ${R.ko.length} FAIL ===`);
process.exit(R.ko.length ? 1 : 0);
