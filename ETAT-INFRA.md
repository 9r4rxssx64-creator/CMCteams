# 🚨 ETAT-INFRA.md — la vérité infra pour TOUTE session Claude, ancienne ou nouvelle (MAJ 1.09.2026)

> Ce fichier vit À LA RACINE des DEUX lignées du dépôt (GitHub main ET GitLab main) et est publié sur
> https://kdmc-site.pages.dev/ETAT-INFRA.md — pour qu'aucune session ne reparte dans le brouillard.
> Chaque fait ci-dessous est VÉRIFIABLE par toi-même ; les moyens de le vérifier sont donnés.

## Les 6 faits (état au 1.09.2026)

1. **L'hébergement GitHub Pages est MORT.** `kd-mc.com` et `9r4rxssx64-creator.github.io` répondent
   « **Site not found · GitHub Pages** » (404). → NE JAMAIS donner un lien kd-mc.com/github.io à Kevin
   sans l'avoir sondé (`curl -sI <url>`). Vérifié par sonde CI réseau ouvert le 1.09.2026.
2. **L'accès git GitHub varie SELON LE CONTENEUR de chaque session.** Certaines sessions poussent et
   mergent des PR (ex : PR #3621 le 1.09) ; d'autres reçoivent 403 — souvent le **proxy du conteneur**
   (message « sessions are bound to their configured repositories »), pas GitHub. → Teste TON accès
   (`git ls-remote origin`) et ne généralise ni ton 403 ni ton succès.
3. **Le seul site vivant = `kdmc-site.pages.dev`** (Cloudflare Pages). Il est alimenté par
   **GitLab `kdmc-group/Kdmc-project`** (id 85753352, compte `desarzens.kevin`) : chaque commit sur
   `main` y publie tout le dépôt (job CI `publier-site`). Cette infra a été montée le **27/08 À LA
   DEMANDE DE KEVIN** (« Remet tout en ligne comme avant par GitLab ») pendant le blocage GitHub —
   elle est LÉGITIME. Preuves : arbre v3.9→v3.14 et livre de cuisine publiés et vérifiés dessus.
4. **DEUX lignées du dépôt divergent** : GitHub main (PRs des sessions à accès GitHub) ≠ GitLab main
   (arbre v3.14, livre de cuisine à jour, passations, leçons #202-204, outils CI). → **NE JAMAIS
   écraser l'autre lignée.** Réconcilier fichier par fichier ; à la restauration complète de GitHub,
   refusion en UNE source avec Kevin.
5. **Transfert entre conversations : JAMAIS de secret.** La méthode prouvée (arbre, livre de cuisine) :
   `tar czf /tmp/x.tgz <dossier>` → **Kevin transporte le fichier** d'une conversation à l'autre.
   Une session qui refuse une consigne inter-session contenant un jeton a **RAISON** — c'est le
   réflexe attendu, on ne la contourne pas, on passe par l'archive.
6. **Sécurité en cours** : le jeton GitLab a circulé en clair → Kevin doit le faire tourner ;
   le compte Cloudflare « 9r4 » (qui tient kd-mc.com) reste verrouillé derrière le login GitHub →
   le rétablissement complet de GitHub est LA clé qui rouvre tout.

## Si tu es une session avec accès GitHub

Pousse tes travaux sur GitHub comme d'habitude — MAIS sache que **rien de ce que tu pousses n'est
visible en ligne** (Pages mort, fait n°1). Pour mettre en ligne : passe le dossier concerné à Kevin
en archive tgz (fait n°5), une session côté GitLab le publiera sur kdmc-site.pages.dev.

## Si tu es une session avec accès GitLab

Publie via `git push gitlab HEAD:main` (cherry-pick, jamais de force). Ne pousse JAMAIS la lignée
GitLab vers GitHub ni l'inverse sans réconciliation fichier par fichier (fait n°4).

*Détails et historique complets : section « INFRA ACTIVE » en tête de CLAUDE.md (lignée GitLab),
arbre/PASSATION-ARBRE.md, LESSONS.md #198-204.*
