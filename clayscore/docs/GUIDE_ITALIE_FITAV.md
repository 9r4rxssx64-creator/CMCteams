# ClayScore — Tirer en Italie (FITAV) : mots, disciplines, installation

**Tu tires à Vintimille. Ce guide traduit le vocabulaire du stand italien,
explique ce qu'ils ont sur place, et dit où poser les caméras là-bas.**

---

## 1. Le dictionnaire français ↔ italien

C'est le plus utile au quotidien : sur place, tout est écrit en italien.

| Italien (ce qui est écrit sur place) | Français | Ce que c'est |
|---|---|---|
| **pedana** | poste (de tir) | L'emplacement où le tireur se met. Il y en a 5. |
| **piattello** | plateau | Le disque orange qu'on casse. |
| **macchina lanciapiattelli** | lanceur | La machine qui envoie le plateau. |
| **fossa** | fosse | La tranchée devant les postes où sont cachées les machines. |
| **serie** | série | 25 plateaux. |
| **tiratore** | tireur | — |
| **cartuccia** | cartouche | 2 autorisées par plateau (sauf exceptions). |
| **rotto / zero** | cassé / manqué | Le verdict. |
| **no bird** | plateau nul | À relancer, ne compte pas. |
| **campo di tiro** | pas de tir / terrain | — |
| **gara** | compétition | — |

**Les disciplines :**

| Italien | Français | Sigle |
|---|---|---|
| **Fossa Olimpica** (ou *Trap*) | Fosse Olympique | **FO** |
| **Fossa Universale** | Fosse Universelle | **FU** |
| **Percorso di Caccia** | Parcours de chasse | — |
| **Compak Sporting** (aussi *percorso di caccia in pedana*) | Compak Sporting | — |
| **Elica** | Hélice (ZZ) | ⚠️ *non gérée par ClayScore* |

---

## 2. La différence FO / FU en une image

C'est la seule différence qui change **où mettre les caméras**.

```
FOSSA OLIMPICA (FO)                    FOSSA UNIVERSALE (FU)
15 machines (3 par pédane)             5 machines en tout
→ trajectoires très variées            → trajectoires plus resserrées
→ il faut voir LARGE                   → on peut viser plus précis

  ligne de tir 15 m derrière la fosse (FO)
  ┌─────────────────────────────────────┐
  │  P1    P2    P3    P4    P5         │  ← les 5 pédanes
  └─────────────────────────────────────┘
              ↑ 15 m
  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   ← la fosse (machines)
```

- **Fossa Olimpica** : les tireurs tirent depuis une ligne parallèle à **15 m
  derrière la fosse**, en alternant sur **5 pédanes**, et **chaque pédane a
  3 machines** — soit **15 machines** en tout.
- **Fossa Universale** : **5 machines** seulement, alignées dans une seule
  fosse, tir debout, groupes de 6 tireurs, **série de 25 plateaux**.
- Un terrain de FO peut servir à la FU **après adaptation des pédanes et des
  distances entre machines**.

**Conséquence concrète pour ClayScore** : en FO, l'éventail des trajectoires
est plus large qu'en FU → prendre l'**objectif 8 mm** (voir
`GUIDE_MATERIEL`, § objectifs) plutôt que le 12 mm, sinon un plateau très
latéral sort du champ.

---

## 3. Ce qu'il y a à Vintimille

**A.S.D. Sporting Club T.A.V. Ventimiglia** — Via / Piazza Guglielmo
Marconi 4, hameau de **Trucco**, 18039 Ventimiglia (IM), Ligurie.
Club affilié FITAV en **Fossa Olimpica**.

| | |
|---|---|
| **Installations** | **2 fosses olympiques** + **1 parcours de chasse** (*percorso di caccia*) |
| **Machines** | Celles des 2 fosses ont été **remplacées récemment** |
| **Sur place** | Bar et petite cuisine |
| **Président** | Ivan Salopek |
| **Téléphone** | **0184 31414** — et **+39 347 799 5786** selon l'autre annuaire |

⚠️ **Ce que je n'ai PAS pu vérifier** (le pare-feu de mon environnement bloque
l'ouverture directe des sites ; je n'ai eu que les extraits de recherche) :
la **marque et le modèle exacts des lanceurs**, le **nombre de machines par
fosse**, les **horaires** et les **tarifs**. Deux numéros de téléphone
différents circulent — appelle le fixe en premier. Ces points-là se règlent en
un coup de fil, je ne les invente pas.

---

## 4. Où poser les caméras à Vintimille

Deux terrains très différents dans le même club → deux installations
différentes. C'est exactement le cas que le mode **edge** a été fait pour
couvrir (voir `GUIDE_GRANDE_SURFACE`).

### Sur une fosse olympique (le cas simple)

```
      POD-A ●            ● POD-B      ← paire stéréo, 30 m, câble Ethernet
         \                /              (flux « brut », PoE)
          \    ● POD-C   /            ← latéral, 40 m, câble
           \      |     /
   ┌────────────────────────────┐
   │ P1   P2   P3   P4   P5     │
   └────────────────────────────┘
   ▓▓▓▓▓▓▓ fosse (15 machines) ▓▓▓▓
```

- 3 postes **filaires**, comme la configuration livrée par défaut
  (`config/config.yaml`, section `postes`).
- Objectif **8 mm** (trajectoires FO larges).
- Le hub en **mode `auto`** : il rejoint le WiFi du club s'il y en a un, sinon
  il crée le sien. Rien à régler.
- **La 2ᵉ fosse = une 2ᵉ installation**, pas un partage : chaque fosse a ses
  propres postes de vue.

### Sur le parcours de chasse (le cas qui demande le sans-fil)

Un parcours ne se couvre pas d'un bloc : on équipe **les postes de tir**, pas
le terrain. Chaque poste reçoit un pod qui **décide sur place** et n'envoie
que le verdict + un court extrait vidéo (**0,2 Mbit/s**), ce qui passe en
WiFi directionnel au-delà du kilomètre.

```
   POD éloigné ●·······(WiFi directionnel, verdict seul)·······● HUB
   (batterie + panneau, ou dérivation sur le lanceur)
```

⚠️ **Dérivation sur un lanceur** : convertisseur **isolé** + fusible dédié
obligatoires (voir `GUIDE_ALIMENTATION`). Ne jamais se brancher en direct.

---

## 5. Régler ClayScore pour l'Italie

La tablette **accepte les noms italiens** — tu tapes ce qui est écrit sur la
pancarte du stand :

| Ce que tu tapes | Ce que ClayScore comprend |
|---|---|
| `fossa_olimpica` ou `trap` | Fosse Olympique (FO) |
| `fossa_universale` | Fosse Universelle (FU) |
| `percorso_di_caccia` / `percorso_caccia` | Parcours de chasse |
| `compak_sporting` | Compak Sporting |

Dans `config/config.yaml` :

```yaml
game:
  discipline: fossa_olimpica   # le mot italien marche aussi
  serie: 25
  cartouches: 2
```

⚠️ **`elica` est refusée volontairement.** Elle existe en Italie mais n'est
pas implémentée : mieux vaut un message d'erreur clair qu'un score calculé
avec les règles d'une autre discipline.

---

## 6. Avant une *gara* (compétition)

Le contrôle **GO / NO-GO** de l'onglet 🏆 Système vaut aussi en Italie :
il vérifie batterie, caméras, disque, code d'accès et journal avant de te
laisser démarrer.

> **Honnêteté, une fois de plus** : ClayScore produit une fiche scellée et un
> journal infalsifiable, ce qui rend un résultat **vérifiable**. Ça ne vaut
> **pas** une homologation FITAV — aucun logiciel ne peut se l'auto-accorder.
> Pour un usage en compétition officielle, c'est la fédération qui tranche.

---

## Ce qui est vérifié automatiquement

- Les 6 noms italiens donnent **exactement** la même discipline que le nom
  français (test paramétré).
- Une partie complète se joue en tapant `fossa_olimpica`.
- `elica` **échoue** au lieu d'être silencieusement acceptée.

## Sources

- [TAV Ventimiglia — Caccia e Tiro](https://www.cacciaetiro.it/uno-sguardo-alla-realta-del-tav-ventimiglia/)
- [Sporting Club Tiro a Volo, Ventimiglia — Misterimprese](https://www.misterimprese.it/liguria/imperia/ventimiglia/sport-associazioni-e-federazioni/185942.html)
- [Sporting Club Tiro a Volo — Italia Recensioni](https://italiarecensioni.com/liguria/sporting-club-tiro-a-volo-639131)
- [FITAV — Regolamento Fossa Universale (PDF)](https://www.fitav.it/downloads/fossa-universale/)
- [FITAV — Discipline olimpiche](https://www.fitav.it/il-nostro-sport/discipline-olimpiche/)
- [Fossa olimpica : guide de la discipline (Shootingpost)](https://shootingpost.it/fossa-olimpica-guida-disciplina-trap/)
- [Tiro a volo — Wikipedia (IT)](https://it.wikipedia.org/wiki/Tiro_a_volo)
