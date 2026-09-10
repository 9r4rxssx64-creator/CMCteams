# Apex Chat — 05 · Journal de l'audit : décisions, hypothèses, non-vérifié

**Période** : 2026-09-05 (passe 1) → 2026-09-10 (passe 2, re-mesure et livrables manquants)
**Version auditée** : `v1.1.281` → `v1.1.288`

Ce document existe pour une seule raison : **déclarer les angles morts au lieu de les masquer.**

---

## 1. Chronologie

| Date | Ce qui s'est passé |
|---|---|
| 05/09 | Passe 1. Lecture du code + reproduction de la faille en bac à sable. 5 findings, dont un P0. Seul `03-FINDINGS.md` est écrit. |
| 06/09 | Correctifs livrés : v1.1.283/284 (porte admin), 285 (admin par le nom), 286 (ticket WebSocket), 287 (CORS), 288 (ticket média). Chacun avec son test discriminant. |
| 06–09/09 | Chapitre annexe : ménage des branches. Verrou identifié — `GH013`, une **règle du dépôt** (ruleset `16725169`), qu'aucun jeton ne contourne. 18 annulations dormantes fermées. |
| **10/09** | **Passe 2.** Re-mesure complète, correction du P0 périmé, écriture des 5 livrables manquants. |

## 2. Décisions prises, et pourquoi

### 2.1 Ne pas réécrire le finding P0 — l'annoter

Le P0 était rédigé comme *ouvert* alors qu'il est fermé depuis le 6. J'aurais pu réécrire la
section proprement. Je ne l'ai pas fait : **la description de la faille d'origine est ce qui
permet de vérifier que le correctif ferme bien ce trou-là**. Un audit qui efface le problème
une fois réglé ne laisse aucun moyen de contrôler le correctif. J'ai donc gardé le texte du
05/09 tel quel, et ajouté au-dessus un bandeau daté + en dessous la chaîne de preuve mesurée.

### 2.2 Ne pas contourner le refus réseau

Toute requête vers le worker déployé revient en `CONNECT tunnel failed, response 403`.
`curl -sS "$HTTPS_PROXY/__agentproxy/status"` ne montre aucun `recentRelayFailures` : le refus
vient de la **politique de sortie**, pas du service. La règle est explicite — on signale un
403, on ne le contourne pas. J'ai donc écrit noir sur blanc que **la vérification en production
n'a pas eu lieu**, et nommé le chemin qui a le réseau ouvert (`apex-chat-e2e.yml`), plutôt que
de chercher un tunnel de traverse ou de laisser croire que c'était vérifié.

### 2.3 Ne pas lire le code du worker déployé via MCP

`workers_get_worker_code` aurait pu me donner le code réellement en ligne — c'était la réponse
directe à « la production porte-t-elle le correctif ? ». J'ai renoncé : 6 045 lignes ramenées
dans le contexte pour une seule ligne d'intérêt. Le rapport coût/bénéfice ne tenait pas.
**Conséquence assumée** : la question reste ouverte, et elle est écrite comme telle.

### 2.4 Ne pas toucher à la règle du dépôt (branches)

375 branches `claude/*` traînent ; 231 sont supprimables sans risque (toutes ancêtres de `main`,
inactives depuis plus de 7 jours). La suppression est refusée par une **règle du dépôt**
(`GH013`, ruleset `16725169`) — pas par un problème de jeton, contrairement à ce que j'ai cru
pendant quatre heures. **Recommandation : laisser la règle en place.** Ces branches ne coûtent
rien (invisibles dans l'app, impossibles à fusionner par accident), et la règle protège du vrai
travail contre une suppression automatique. L'automatisation sonde une fois par livraison, écrit
la cause exacte dans `.github/CLEANUP-REPORT.md`, puis s'arrête — elle repartirait seule si la
règle changeait.

## 3. Hypothèses assumées

| # | Hypothèse | Pourquoi je l'assume | Ce qui l'invaliderait |
|---|---|---|---|
| H1 | Le worker en production tourne bien la v1.1.288 | Le dépôt et la config versionnée portent le correctif ; les workflows de déploiement existent et passent | Un déploiement bloqué ou en retard — visible dans l'onglet Actions |
| H2 | Les 20 routes `/api/admin/*` sont toutes derrière la même garde d'authentification | Lecture du routage : elles passent par le même `getAuthUser` | Une route ajoutée plus tard qui court-circuiterait le contrôle |
| H3 | Les ~16 % non couverts d'`api-worker.js` sont des branches d'erreur | Les zones non couvertes signalées par v8 sont en fin de fichier et dans les `catch` | Un audit ligne à ligne, que je n'ai pas fait |

**H3 est la plus fragile** et je la donne comme telle : je ne l'ai pas vérifiée exhaustivement.

## 4. Ce que je n'ai PAS pu vérifier — liste complète

| # | Non vérifié | Bloquant | Comment le fermer |
|---|---|---|---|
| 1 | Le comportement du service **en production** | Egress 403 | Actions → `apex-chat-e2e.yml` |
| 2 | La **version déployée** du worker | `workers_get_worker` ne renvoie pas `modified_on` | Onglet Actions, dernier `deploy-apex-chat.yml` réussi |
| 3 | Les **19 scénarios Playwright** | ~~Navigateurs absents de cette session~~ → **fermé le 10/09** : Chromium **était** préinstallé (`/opt/pw-browsers`), 56/56 en local ; en CI, voies iPhone rouges depuis le 06/09 (P2, corrigé) | Lire le premier run vert de `messaging-app-tests.yml` |
| 4 | Le **second avis indépendant** (non-Claude) | Non déclenché dans cette passe | Actions → `ai-review-independent.yml` |
| 5 | Le **scan sécu outillé** (gitleaks, Semgrep, OSV, Trivy, zizmor) | Idem | Actions → `security-suite.yml`, `strix-scan.yml` |
| 6 | La **passe de stabilité** (re-rendus au repos, scintillement) | Pas de navigateur | Mesure `MutationObserver` en CI |
| 7 | Le **contraste WCAG** des couples de couleurs | Non calculé | axe-core en CI |
| 8 | `e2e_strict` en production | La valeur vit en base (`system_config`), pas dans le dépôt | Requête D1 ou `/api/system/config` |
| 9 | Les **99 `innerHTML`** un par un | Seuls les 8 qui interpolent une variable ont été inspectés | Cliquet sur `innerHTML` sans `esc()` |
| 10 | **F18** (sentinelles admin) et **F19** (chronologie admin) | Aucun test nommé | Un smoke de rendu de ces deux vues |

## 5. Ce dont je ne suis pas certain

- **L'étendue réelle de l'accès au contenu des conversations avec un jeton admin volé.** Le
  statut de membre invisible est certain (`kevin_invisible`). Savoir si l'attaquant peut
  *déchiffrer* demanderait de rejouer un vrai échange de clés entre deux clients. Je décris
  donc ce qui est prouvé (identités, numéros, GPS, pouvoirs d'administration) et je laisse le
  reste ouvert, plutôt que d'annoncer « il lit tous tes messages ».
- **Si `MEMO_KEVIN_RESTE_A_FAIRE.md` contenant le numéro admin est un vrai risque.** Le fichier
  n'est pas servi par le site, mais le dépôt est **public**. Le numéro n'est plus un secret
  d'authentification depuis v1.1.284 — donc ce n'est plus une faille, c'est une donnée
  personnelle qui traîne. Je le signale sans le classer P0 : ce serait crier au loup.

## 6. Auto-critique de cette passe 2 (obligatoire)

**Le point le plus faible de mon audit** : j'ai laissé un livrable **mentir pendant quatre
jours**. Le P0 était corrigé le 6, prouvé par un test discriminant, et `03-FINDINGS.md` le
décrivait toujours comme ouvert le 10. Ce n'est pas un détail de mise à jour : un document
d'audit périmé sur son point le plus grave discrédite les quatre lignes justes qui
l'accompagnent. La cause est identifiable — j'ai livré les correctifs et les tests (le travail
qui « compte »), sans revenir fermer la ligne dans le document qui, lui, est ce que Kevin lit.
La règle des documents à jour dans le même commit existait déjà ; je ne l'ai pas appliquée au
dossier d'audit.

**Le deuxième point faible** : le protocole exige six livrables. Il n'y en avait **qu'un**
pendant cinq jours. Un audit qui ne produit qu'un fichier de findings n'a pas d'inventaire à
opposer aux affirmations, pas de cartographie pour prouver qu'il n'a rien sauté, pas de journal
pour dire ce qu'il n'a pas vu. Les cinq manquants sont écrits aujourd'hui — mais ils décrivent
un état mesuré **le 10**, pas ce que j'aurais vu le 5. C'est honnête, ce n'est pas équivalent.

**Ce que je n'ai pas pu vérifier** : les dix points de la section 4. Le plus gênant est le n°1
— je certifie le **code du dépôt**, pas le **service en ligne**. Ces deux phrases ne sont pas
interchangeables et je me suis interdit de les confondre dans les cinq documents.

**Ce dont je ne suis pas certain** : que la cartographie F01–F78 soit vraiment exhaustive. Elle
est construite à partir des routes API, des fonctions `render*` et des modules `lib/` — donc
elle attrape tout ce qui a une adresse ou un nom de rendu. Une fonctionnalité qui vivrait
uniquement dans un gestionnaire d'événement anonyme, sans route ni vue, n'apparaîtrait pas.
Je n'ai pas de moyen de prouver qu'il n'y en a aucune ; je dis donc « 78 fonctions
identifiées », pas « les 78 fonctions de l'application ».

---

## 2026-09-10 (soir) — le scan sécu est lu ; ce que j'ai décidé

| Décision | Pourquoi |
|---|---|
| Trier le scan **par reproduction locale** (npm audit, lecture des fichiers, awk sur les workflows) plutôt qu'attendre le rapport détaillé | Le rapport détaillé est derrière un 403 ; ce qui se reproduit sans réseau se prouve ici, ligne par ligne |
| Mettre à jour les outils de test (vitest 5, happy-dom 20) au lieu de « noter pour plus tard » | 7 vulnérabilités connues, correctif sans risque pour l'app (paquets de test), prouvé par 1117/1117 |
| Ne **pas** épingler les actions officielles sur un SHA | La règle du dépôt exige une version publiée, c'est le cas ; le SHA est un durcissement, pas une faille — consigné en recommandation |
| Ne **pas** relancer Strix | 13,77 $ l'exécution, tuée par le délai ; relancer sans allonger le délai reproduirait l'échec. Décision de Kevin |
| Construire `detail_path` sur `security-suite.yml` | 9 signalements Semgrep impossibles à identifier autrement ; un compte ne se trie pas |

**Hypothèse écrite** : les 9 signalements Semgrep non identifiés de `messaging-app` sont
probablement de la même famille que les 1 159 du dépôt (balises sans `integrity`, liens `http`,
`path.join`), donc des recommandations plutôt que des failles — **c'est une hypothèse, pas un
résultat**, et elle sera remplacée par la lecture du check-run détaillé.

**Non vérifié** : le contenu de la vulnérabilité MEDIUM annoncée par Strix.
