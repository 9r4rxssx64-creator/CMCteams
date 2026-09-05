# 🗺 Qui fait quoi — GitHub, GitLab, Cloudflare

> Kevin, 5.09.2026 : *« Organise tout intelligemment pour que tout refonctionne comme
> avant. Entre GitHub et GitLab, vérifie leur règlement pour ne plus faire d'erreur. »*
>
> Ce document n'est pas une opinion : les deux règlements ont été **lus** le 5.09 par le
> runner GitLab (le conteneur de l'agent ne peut atteindre ni `docs.github.com` ni
> `docs.gitlab.com` — HTTP 000). Les citations ci-dessous sont **le texte officiel**,
> pas un souvenir. Relevé complet : `audit/reglement/REGLEMENT.md`.

---

## 1. La règle de GitHub — la vraie, mot pour mot

Conditions d'utilisation des produits additionnels, section Actions :

> *« Actions should not be used for: **Cryptomining**; Disrupting […] unauthorized access
> […]; The provision of a stand-alone or integrated application or service offering the
> Actions product […] **for commercial purposes**; **Any activity that places a burden on
> our servers, where that burden is disproportionate to the benefits provided to users**
> (for example, don't use Actions as a content delivery network or as part of a serverless
> application, but a low benefit Action could be ok if it's also low burden); or **If using
> GitHub-hosted runners, any other activity unrelated to the production, testing,
> deployment, or publication of the software project associated with the repository** where
> GitHub Actions are used. »*

Et, sans ambiguïté sur les conséquences :

> *« GitHub may monitor your use of GitHub Actions. Misuse […] may result in […] **suspension
> or termination of your GitHub account**. »*

**Ce que ça veut dire en une phrase** — la seule à retenir :

> ### Sur GitHub, une automatisation n'a le droit d'exister que si elle **produit, teste, déploie ou publie CE dépôt**.

Tout le reste — surveiller un site tiers, générer des images, sauvegarder une base,
récupérer des actualités, piloter un service extérieur — **n'a pas sa place sur GitHub**.
Ce n'est pas une question de fréquence : c'est la **nature** de l'activité.

La suspension du 15.08 cochait **deux** cases à la fois : des activités sans rapport avec
le dépôt (44 workflows), et une charge disproportionnée (~97 exécutions/jour).

---

## 2. La règle de GitLab — elle est différente, et c'est ce qui nous sauve

GitLab **n'interdit pas** l'activité « sans rapport avec le projet ». Sa contrainte est
ailleurs, et elle est chiffrée :

> *« **Free tier namespaces receive 400 compute minutes per month.** »*
> *« When a quota is enabled: You receive notifications when approaching your quota limits. »*
> *« **Reduce the frequency of scheduled pipelines.** »* (le conseil de GitLab lui-même)

Usage acceptable :

> *« you must not: **Do anything to compromise, overburden, or otherwise impair our
> services** or those of others […] »*

**En une phrase** :

> ### Sur GitLab, on a le droit de faire ce que GitHub interdit — mais on n'a que **400 minutes par mois**, et il faut les compter.

---

## 3. L'organisation qui en découle

| | **GitHub Actions** | **GitLab CI** | **Cloudflare Workers** |
|---|---|---|---|
| **Ce qui y va** | construire, tester, déployer, **publier ce dépôt** | tout ce qui **parle à l'extérieur** et tout ce qui est **périodique** | les services **permanents** et leurs propres déclencheurs |
| **Tâches programmées** | ❌ **jamais** | ✅ autorisées, mais comptées | ✅ (cron du Worker, hors quota CI) |
| **Appeler un site tiers** | ❌ interdit par les conditions | ✅ | ✅ |
| **La limite** | la *nature* de l'activité | **400 min/mois** | palier gratuit Cloudflare |
| **Ce qu'on risque** | suspension du compte | pipelines coupés en fin de mois | dégradation du service |

### Concrètement, aujourd'hui

**Sur GitHub** (133 workflows actifs, **0 exécution programmée**, 0 crypto) :
tests, lint, CodeQL, gitleaks, Lighthouse, déploiement des Workers du projet,
publication GitHub Pages (`kd-mc.com`), fusion automatique des branches `claude/*`.
→ *tout est « production, test, déploiement, publication » de ce dépôt.* ✅

**Sur GitLab** (`kdmc-group/Kdmc-project`) : les tests au push, et **tout ce qui appelle
l'extérieur** — lecture des règlements, fichier des décès de l'INSEE, audit de ce qui est
public, vérification des liens, et « qui sert vraiment le site ». La publication du miroir
`kdmc-site.pages.dev` y vit toujours, mais **à la demande** (voir §6).

**Sur Cloudflare** : les Workers (routeur, IA créa, apis, SSO…) et **c'est là que doivent
aller les 6 tâches programmées** encore en attente d'un nouveau foyer.

### Les 43 workflows rangés dans `.github/workflows-desactives/`

Ils sont **intacts**, jamais supprimés. Ils avaient été mis de côté le 15.08 parce qu'ils
correspondent exactement à ce que GitHub interdit : génération d'images, surveillance de
sites, pilotage de Railway et Vercel, sauvegardes externes, bulletins d'actualité.

**Ils ne doivent pas revenir sur GitHub.** Leur foyer, selon ce qu'ils font :

| Ce qu'il fait | Où il va | Combien il coûte |
|---|---|---|
| appelle un site tiers, sans horaire fixe | **GitLab CI**, déclenché par un push | ~1 min par lancement |
| doit tourner tous les jours / semaines | **Cloudflare Worker** (cron du Worker) | 0 minute CI |
| génère des images (Replicate, OpenAI) | **GitLab CI** à la demande | ~2-3 min |
| sauvegarde une base externe | **Cloudflare Worker** | 0 minute CI |

---

## 4. Ce qui empêche mécaniquement de refaire l'erreur

| Règle | La garde qui la fait respecter |
|---|---|
| 0 exécution programmée sur GitHub | `npm run test:actions-conformes` (règle 1) |
| 0 workflow qui ne fait qu'appeler l'extérieur **et qui part seul** | idem (règle 2) |
| 0 workflow crypto | idem (règle 3) — nommé « Cryptomining » dans les conditions |
| 0 workflow **critique** rangé par erreur | idem (règle 4) — liste lue dans `cross-app-preservation.yml` |
| Rester sous les 400 minutes GitLab | `npm run minutes-gitlab` (à lancer avant d'ajouter un job) |

Les quatre premières sont **prouvées discriminantes par sabotage** : on remet un cron, on
range un workflow critique — la garde échoue en nommant le fichier.

---

## 5. Le test mental, avant d'ajouter une automatisation

> *« Est-ce que ça **produit, teste, déploie ou publie CE dépôt** ? Si oui → GitHub.
> Si non → est-ce périodique ? Alors **Cloudflare Worker**. Sinon → **GitLab CI**, et
> j'ai compté ce que ça coûte sur les 400 minutes du mois. »*

Et le réflexe qui a manqué en août : **une automatisation qu'on ajoute « juste une petite »
n'est jamais seule** — c'est leur accumulation qui a fait fermer le compte.

---

## 6. Ce qui a été corrigé le 5.09 — l'erreur d'août, en train de se rejouer sur GitLab

`npm run minutes-gitlab` a donné le premier chiffre honnête : **175 minutes sur 400
consommées en 4 jours (44 %)**. À ce rythme, GitLab était **à sec le 9 septembre**. Le
premier poste n'était pas les tests, c'était la **publication du miroir** :

| poste | envois | minutes | part |
|---|---|---|---|
| `publier-site` (miroir Cloudflare) | 44 | **72,5** | 41 % |
| `conformite` (la garde) | 36 | 27,1 | 15 % |
| `tests` | 36 | 24,0 | 14 % |
| `verifier-cloudflare` (clé) | 44 | 21,7 | 12 % |

### On a mesuré avant de couper

Couper la publication n'est sans risque **que si le site vivant ne vient pas de là**. Le
conteneur de l'agent n'atteint ni `kd-mc.com`, ni `github.io`, ni `pages.dev` (HTTP 000).
C'est donc la machine GitLab qui a regardé — job **`qui-sert`**, réutilisable :

```
x-kdmc-router: kd-mc.com                          ← le routeur Cloudflare répond
x-github-request-id / x-github-edge-region: iad   ← mais le contenu vient de GITHUB PAGES
via: 1.1 varnish · x-served-by: cache-pdk…
```

**Le site vivant vient de GitHub**, revenu en service le 4.09. Le miroir est un filet de
secours, plus la source.

### Le changement, et sa preuve

`publier-site` et `verifier-cloudflare` sont passés **à la demande** : modifier
**`publier-demande.txt`**, ou la variable `PUBLIER`, ou le bouton « Lancer ».

Deux envois consécutifs sur la même branche, à quelques minutes d'écart :

| envoi | fichier-bouton touché ? | ce qui a tourné | minutes |
|---|---|---|---|
| `23b3b14a` | **oui** | `verifier-cloudflare` 23 s + `publier-site` 63 s | 1,4 |
| `37bd1a23` | non | *tout `skipped` / `manual`* | **0** |

C'est la preuve discriminante : la règle distingue bien les deux cas. Économie attendue :
**~94 min/mois, 23 % du quota rendus**. Une dernière publication a eu lieu au moment du
changement, donc le filet de secours est à jour.

### Le poste suivant, une fois le premier traité

La publication écartée, le premier consommateur devenait **la garde elle-même**
(`conformite`, 28,3 min en 4 jours). Elle ne fait que lire des fichiers, mais tirait
l'image `node:20` complète (~400 Mo) à chaque envoi. Passée sur `node:20-alpine` (~50 Mo) :
**45 s → 23 s, mesuré sur le pipeline suivant**. On ne supprime pas une garde pour
économiser — on la rend légère.

**Retour en arrière si GitHub retombait** : remettre `- when: on_success` en première
règle de `publier-site`. C'est écrit à côté du job dans `.gitlab-ci.yml`, pas seulement
ici — un mode d'emploi qui ne vit que dans un document finit par ne pas être lu.


*Sources lues le 5.09.2026 depuis le runner GitLab, texte intégral conservé dans
`audit/reglement/` : conditions produit GitHub, usage acceptable GitHub, limites d'Actions,
évènements déclencheurs, conditions GitLab, minutes de calcul, runners partagés, usage
acceptable GitLab.*
