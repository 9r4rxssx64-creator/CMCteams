# ClayScore — Glossaire

**Tous les mots du projet expliqués simplement.** Pour lire le dossier sans être
ni tireur ni informaticien.

---

## Le ball-trap (le sport)

| Mot | Ce que ça veut dire |
|---|---|
| **Plateau** | Le disque d'argile orange qu'on lance en l'air et qu'il faut casser au fusil |
| **Lanceur** (ou *trap*, *machine*) | La machine qui projette les plateaux |
| **Poste** | L'emplacement d'où le tireur tire. En fosse, il y en a 5, et les tireurs tournent |
| **Série** | Le nombre de plateaux d'une manche — **25** par défaut |
| **Doublé** | Deux plateaux lancés d'un coup → deux verdicts à rendre |
| **No bird** | Le plateau part **déjà cassé** de la machine, ou part de travers → il ne compte pas, on **rejoue** (même tireur, même poste) |
| **Cartouche** | Le tireur en a droit à 1 ou 2 selon la discipline. En DTL, casser à la 1re rapporte plus |
| **FU** | Fosse Universelle |
| **FO** | Fosse Olympique |
| **DTL** | *Down The Line*, discipline anglaise. Barème 3 points (1re cartouche) / 2 points (2e) |
| **Parcours de chasse** | Trajectoires variées imitant le gibier |
| **Compak** | Discipline sur terrain compact, mélange de simples et de doublés |
| **FFBT** | Fédération Française de Ball-Trap |
| **Pas de tir** | La zone où se tiennent les tireurs |

## ClayScore (le produit)

| Mot | Ce que ça veut dire |
|---|---|
| **Pod** | Un boîtier étanche contenant une caméra, planté au sol près du stand |
| **Hub** | Le petit ordinateur central (NVIDIA Jetson) qui analyse tout |
| **Verdict** | La décision : **CASSÉ**, **MANQUÉ** ou **NO BIRD** |
| **Ambigu** | ClayScore n'est pas assez sûr → il te montre le ralenti et **tu tranches** |
| **Ralenti habillé** | La vidéo au ralenti avec la trajectoire tracée et le verdict affiché dessus |
| **Mode concours** | Chaque plateau doit être arbitré, fiche officielle. Pas de validation automatique |
| **Mode entraînement** | Plus souple : ClayScore peut valider seul les cas évidents |
| **Mode TV** | Affichage géant des scores pour le club-house |
| **Corridor de vol** | La trajectoire « normale » apprise par ClayScore. Un plateau qui en sort trop = anormal |

## L'informatique (juste ce qu'il faut)

| Mot | Ce que ça veut dire |
|---|---|
| **Simulation** | Faire tourner le logiciel sur des vidéos **fabriquées par ordinateur**, sans matériel |
| **Vérité terrain** | La bonne réponse, connue d'avance, qui sert à **mesurer** si le logiciel a juste |
| **Test (automatique)** | Un petit programme qui vérifie tout seul qu'une fonction marche. On en a **130** |
| **PWA** | Une appli qui s'ouvre dans le navigateur et s'installe comme une vraie appli |
| **WiFi local autonome** | ClayScore crée son propre réseau WiFi. **Aucun Internet n'est nécessaire** |
| **Open source** | Logiciel libre et gratuit → **0 € de licence** |
| **H.264** | Le format vidéo lisible partout (iPhone, PC, navigateur) |
| **IA / YOLO** | L'intelligence artificielle qui reconnaît les plateaux sur l'image (version 2) |
| **TensorRT** | La technologie NVIDIA qui fait tourner l'IA très vite sur le Jetson |
| **Aravis / GigE Vision** | Le standard des caméras industrielles, utilisé par nos 3 caméras |
| **Global shutter** | Capteur qui fige toute l'image d'un coup → indispensable pour un objet rapide |
| **Infrarouge 850 nm** | Lumière invisible à l'œil, aide à voir par mauvaise lumière |
| **Fichier de configuration** | Le fichier `config.yaml` : c'est **le seul** à changer pour passer au vrai matériel |
| **Mode autonome** | Le boîtier crée **son propre WiFi**. Aucune box, aucun Internet |
| **Mode réseau** | Le boîtier **rejoint le réseau du club**. La tablette ne change pas de WiFi |
| **PoE** | Un seul câble réseau apporte **l'électricité ET l'image** à une caméra |
| **mDNS / .local** | Ce qui permet de taper `clayscore.local` au lieu d'une adresse en chiffres |
| **Code d'accès** | Le code qui protège les scores quand le boîtier est sur un réseau partagé |
| **XSS** | Faille où un texte saisi (ex. un nom) devient du code qui s'exécute. Corrigée |

## Le business

| Mot | Ce que ça veut dire |
|---|---|
| **BOM** | *Bill of Materials* : la liste de toutes les pièces à acheter, avec les prix |
| **Prototype** | Le premier exemplaire fabriqué, pour tester et démontrer |
| **Marge nette** | Ce qui reste dans la poche après avoir payé le matériel |
| **Seuil de rentabilité** | Le nombre de kits à vendre pour rembourser l'investissement (~12) |
| **Marquage CE** | La certification obligatoire pour vendre en Europe |
| **Welcome Business Office** | Le service monégasque **gratuit** qui aide à créer son entreprise |
| **Monaco Boost** | Domiciliation d'entreprise à coût réduit (adresse sans local) |
| **MonacoTech** | L'incubateur de start-up de Monaco |
| **Laporte** | Le leader mondial des lanceurs de plateaux, basé à ~40 min. **Partenaire potentiel, pas concurrent** |
