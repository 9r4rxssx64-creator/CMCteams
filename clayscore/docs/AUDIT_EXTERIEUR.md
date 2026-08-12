# ClayScore — ce que des relecteurs EXTÉRIEURS pensent du projet

**Aucun des outils de cette page n'est moi.** Ce sont des analyseurs écrits par
d'autres, déterministes, qui n'ont aucune raison de ménager ce code. C'est tout
l'intérêt : ils ont trouvé, du premier coup, des choses que ni la relecture ni
les 344 tests ne voyaient.

> Passe du **12/08/2026**. Tout ce qui suit a été **exécuté**, pas estimé.
> Rejouable en une commande : `bash tools/audit_externe.sh`

---

## 1. Le verdict, en une page

| Relecteur | Ce qu'il juge | Verdict | Détail |
|---|---|:--:|---|
| **pytest** | le comportement | ✅ | **344 tests verts**, 1 ignoré (exige une carte graphique) |
| **couverture** | ce que les tests touchent vraiment | ✅ | **91 %** des lignes du logiciel |
| **ruff** | style, erreurs évidentes | ✅ | 0 |
| **mypy** | les types disent-ils la vérité ? | ✅ | **8 → 0** (corrigés ici) |
| **bandit** | failles de sécurité Python | ✅ | **1 sévérité HAUTE → 0** (corrigée ici) |
| **pip-audit** | failles connues des dépendances | ✅ | **aucune** |
| **vulture** | code mort | ✅ | **aucun** (le seul signalement est un faux positif) |
| **pylint** | qualité générale | 🟡 | **8,39/10** |
| **radon** | complexité | 🟡 | 1 fonction en **D**, 11 en **C**, maintenabilité ≥ B partout |
| **Semgrep, gitleaks, TruffleHog, OSV, Trivy, zizmor** (CI) | l'arsenal sécurité | ⚠️ | tourné sur **tout le dépôt**, pas sur ClayScore seul — voir § 5 |

**Ce que ça dit honnêtement :** le logiciel est en bon état. Les deux vrais
défauts trouvés étaient invisibles aux tests — c'est exactement pour ça qu'il
fallait des yeux extérieurs. **Mais le problème le plus grave de cette passe
n'a été trouvé par aucun outil** (§ 2).

---

## 2. 🔴 Le point le plus grave — et aucun outil ne l'a vu

**Le dépôt GitHub qui contient ClayScore est PUBLIC.**

Vérifié le 12/08/2026 via l'API GitHub : `"private": false`. Et le robot
d'auto-fusion a poussé la branche de développement dans `main`
(*pull request* #3502). Conséquence mesurée :

```
128 fichiers ClayScore lisibles par n'importe qui
 dont 28 documents du dossier (prix, marges, stratégie, fournisseurs)
```

Or l'en-tête du projet dit : *« Licence : code privé (tous droits réservés) —
ne pas publier. »* Les deux ne peuvent pas être vrais en même temps.

**Pourquoi le dépôt est public :** kd-mc.com est servi par GitHub Pages, qui
exige un dépôt public sur un compte gratuit. **Le rendre privé couperait les
sites.** Ce n'est donc pas un réglage à basculer — c'est un choix à faire :

| Option | Ce que ça donne | Ce que ça coûte |
|---|---|---|
| **A — Déplacer ClayScore dans un dépôt privé dédié** *(recommandé)* | ClayScore redevient confidentiel ; kd-mc.com continue de fonctionner | ~30 min de mise en place, 0 € |
| **B — GitHub Pro** (4 $/mois) et passer le dépôt en privé | tout redevient privé d'un coup | 4 $/mois, et **tout** le reste devient privé aussi |
| **C — Ne rien faire** | — | le dossier commercial reste lisible par tous, y compris un concurrent |

⚠️ **L'historique git garde tout.** Déplacer le projet demain ne supprime pas ce
qui a déjà été publié : il faut aussi réécrire l'historique, ou considérer que
ce qui est sorti est sorti. Plus on attend, plus c'est vrai.

---

## 3. Les deux vrais défauts du code — trouvés, corrigés, verrouillés

### 3.1 `bandit` — exécution d'une commande par le shell (sévérité **HAUTE**, CWE-78)

`tools/build_pack.py` assemblait le dossier avec :

```python
subprocess.run(f"cd {SRC} && tar cf - ... | (cd {PACK}/logiciel && tar xf -)",
               shell=True)
```

**Ce qui était vrai :** les chemins sont des constantes du programme, donc rien
n'était réellement attaquable aujourd'hui. **Ce qui était faux :** il suffisait
d'un dossier de travail contenant une espace ou une apostrophe pour que la
construction du dossier casse — ou fasse autre chose que prévu.

**Corrigé** par `shutil.copytree(...)` : même résultat, aucun shell.

### 3.2 `bandit` — `urlopen` accepte `file://` (CWE-22)

Le contrôleur de prix ouvre les URL des fournisseurs. `urlopen` sait aussi
ouvrir des fichiers locaux. Une URL mal saisie dans le catalogue — ou glissée
par quelqu'un d'autre — aurait fait **lire un fichier de la machine**, dont le
contenu serait remonté dans le rapport de prix.

**Corrigé** par un filtre : `http`/`https` seulement, tout autre schéma est
refusé et signalé comme tel. **Et prouvé par 3 tests** qui vérifient qu'un
`file://` pointant sur un faux mot de passe ne le lit pas et ne le laisse pas
fuiter (`tests/test_verif_prix.py`).

### 3.3 `mypy` — 8 annotations qui mentaient

Aucune n'était une panne en cours — je les ai toutes vérifiées dans le code
avant d'y toucher, et je le dis plutôt que de les présenter comme des bugs
trouvés. Mais elles **empêchaient d'utiliser mypy comme garde-fou**, donc
elles cachaient les vraies :

- `Optional[callable]` — `callable` est une fonction, pas un type ;
- `__exit__ -> bool` (×2) — laissait croire que le gestionnaire peut **avaler
  une exception** ; il renvoie toujours `False`, c'est maintenant écrit ;
- `int(cur.lastrowid)` — planterait si l'enregistrement d'une partie ne rendait
  aucun identifiant ; le cas est désormais dit à voix haute plutôt que subi ;
- 4 autres (types numpy, import optionnel de cv2, lacunes des stubs cv2).

**mypy : 8 → 0.** Il peut maintenant servir de garde-fou.

---

## 4. Ce qui reste ouvert (et pourquoi je n'y ai pas touché)

| Point | Mesure | Décision |
|---|---|---|
| `_collect_evidence` (`vision/verdict.py`) en complexité **D** | la plus touffue du projet | **Laissée.** C'est le cœur du verdict, couvert à 97 %. La découper sans besoin réel, c'est risquer la seule fonction qu'on n'a pas le droit de casser |
| `server/__main__.py` couvert à **0 %** | 42 lignes | Point d'entrée jamais testé — un test de démarrage vaudrait le coup |
| `video_webcam.py` couvert à **30 %** | 38 lignes | Exige une vraie webcam. Honnête de le dire plutôt que de simuler |
| `dev.std(axis=0) + dev.mean(axis=0) * 0.0` (`corridor.py`) | arithmétique morte | Ajoute zéro. À supprimer, mais pas dans une passe sécurité |
| 2 duplications signalées par pylint | `capture`/`engine`, `video_file`/`video_webcam` | Réelles. Factorisables, sans urgence |
| 4 signalements bandit en sévérité **moyenne** | écoute sur toutes les interfaces, chemins `/tmp` de l'outil de construction | **Intentionnels** : un serveur de club doit être joignable depuis les tablettes du stand. Ce n'est pas une faille, c'est la fonction |

---

## 5. Ce que la CI a tourné — et ce que ça ne prouve pas

Le workflow **Security Suite** (gitleaks, TruffleHog, OSV, Trivy, Semgrep,
zizmor) a tourné avec succès. Ses compteurs bruts :

```
gitleaks 109 · trufflehog 52 · osv 17 · semgrep 1112 · trivy 0
```

**Ces chiffres ne sont PAS un verdict sur ClayScore.** Ils portent sur **tout
le dépôt** (Apex, CMCteams, les workers…) et Semgrep vise le JavaScript, pas le
Python. Un compteur n'est pas une faille confirmée : chacun demande un tri.
Le verdict ClayScore, lui, vient de bandit / pip-audit / mypy, exécutés
directement dessus, et il est propre.

---

## 6. Ce qui empêche la dérive de revenir

Le vrai correctif n'est pas d'avoir réparé deux défauts, c'est que **le même
défaut se signalera tout seul la prochaine fois** :

```bash
bash tools/audit_externe.sh --gate
```

Bloque si : ruff échoue · mypy trouve une erreur · bandit trouve une sévérité
haute · pip-audit trouve une faille de dépendance · un test tombe.

Sans `--gate`, il ajoute la couverture, le code mort et la complexité.
Installation : `pip install -e ".[audit]"`.

---

## 7. Ce que cet audit ne prouve pas (autocritique)

- **Il n'a rien vu tourner.** Ces outils lisent le code. Ils ne disent rien de
  ce qui se passera face à un vrai plateau, une vraie caméra, un vrai stand.
  Les 344 tests tournent sur des vidéos **fabriquées**, dont on connaît la
  réponse d'avance.
- **Aucune IA extérieure n'a relu ce travail.** Le relecteur GPT indépendant
  (Qodo) du dépôt ne se déclenche que sur une *pull request*, et je n'en ai pas
  ouvert : le robot d'auto-fusion l'aurait poussée dans `main`. C'est donc un
  avis d'outils déterministes, pas d'un second cerveau.
- **Les compteurs de la CI ne sont pas triés** (§ 5). Tant qu'ils ne le sont
  pas, on ne sait pas s'ils cachent quelque chose de réel.
- **Je suis toujours celui qui rapporte.** Les outils sont extérieurs, la
  synthèse que vous lisez ne l'est pas.
