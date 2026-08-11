# ClayScore — Ce qui est prouvé / ce qui ne l'est pas

**Document d'honnêteté.** Pour que tu saches exactement sur quoi tu peux
t'appuyer, et où sont les zones d'ombre. Aucune bonne nouvelle exagérée ici.

---

## ✅ Ce qui est PROUVÉ (mesuré, reproductible chez toi)

| Affirmation | Preuve | Comment le revérifier |
|---|---|---|
| Le logiciel compte 100 % des plateaux lancés | 27/27 sur jeux de test | `python -m tools.bench --launches` |
| Il détecte les coups de feu sans faux positif | 27/27, 0 faux positif | `python -m tools.bench --gunshots` |
| Il rend le bon verdict | 225/225 clips (100 %) | `python -m tools.bench --verdicts` |
| La partie se déroule sans erreur de règle | Tests exhaustifs des 5 disciplines | `pytest tests/test_state_machine.py` |
| Une partie complète est jouable de bout en bout | FU 2 tireurs × 25 plateaux + no-bird, scores exacts | `pytest tests/test_server.py` |
| Le no-bird gèle bien la rotation | Testé (même tireur, même poste) | `pytest tests/test_state_machine.py` |
| Rien ne se perd si ça plante | Reprise d'état testée | `pytest tests/test_capture.py` |
| L'export ralenti habillé fonctionne | Vidéos produites + servies | `pytest tests/test_replay.py` |
| Multi-lanceurs attribués et suivis | Testé (alternance + stats par machine) | `pytest tests/test_state_machine.py` |
| Mode concours interdit l'auto-validation | Testé (chaque plateau arbitré) | `pytest tests/test_server.py` |
| Les scores sont protégés sur un réseau partagé | Écriture refusée sans code, lecture libre | `pytest tests/test_network.py` |
| Le boîtier marche autonome **et** branché au club | Bascule automatique testée | `pytest tests/test_network.py` |
| Le disque ne peut pas se remplir | Purge automatique, clip en cours protégé | `pytest tests/test_maintenance.py` |
| Deux tablettes ne créent pas de plateau fantôme | 4 appuis simultanés → 1 seul analysé | `pytest tests/test_maintenance.py` |
| Un nom de tireur ne peut pas exécuter de code | Échappement vérifié dans l'appli | `pytest tests/test_maintenance.py` |
| Un score modifié après coup est détecté | Journal chaîné : ligne modifiée ou supprimée repérée | `pytest tests/test_competition.py` |
| La fiche finale est scellée | Le sceau change au moindre chiffre modifié | `pytest tests/test_competition.py` |
| On ne démarre pas une épreuve mal préparée | GO/NO-GO : 8 points bloquants testés un par un | `pytest tests/test_competition.py` |
| Changer de source d'alimentation ne coupe rien | Batterie toujours en ligne, autonomie contrôlée | `pytest tests/test_competition.py` |
| Une installation sans fil impossible est refusée | 809 Mbit/s bruts ne passent pas : refus motivé | `pytest tests/test_competition.py` |
| Le système tient 3 caméras en temps réel | Mesuré 288 img/s pour 195 requis | `pytest tests/test_performance.py` |
| La pénombre ne rend plus le système aveugle | −60 % de lumière : 33 % → 100 % | `pytest tests/test_performance.py` |
| Les défauts de réglage caméra sont signalés | Sombre, cramé, bruité détectés, 0 faux positif | `pytest tests/test_performance.py` |
| **Total** | **341 tests réussis** | `pytest` |

---

## ⏳ Ce qui n'est PAS ENCORE PROUVÉ

| Zone d'ombre | Pourquoi | Ce qu'il faut pour lever le doute |
|---|---|---|
| **Précision sur de vraies vidéos** | Tout est validé sur des vidéos **générées par ordinateur** | Filmer 20-30 vraies casses et me les donner |
| **Le vrai matériel** | Caméras GigE, micro, Jetson : pas achetés | Acheter (liste prête) et brancher |
| **L'IA v2 (YOLO)** | L'entraînement exige une carte graphique | Un PC avec GPU, ou le Jetson |
| **L'appli sur vraie tablette** | Le serveur est prouvé, l'affichage tactile non | Ouvrir la page sur ton iPad |
| **Le hotspot WiFi** | Configuration écrite, pas testée sur matériel | Le Jetson |
| **Tenue en conditions difficiles** | Pluie, contre-jour fort, plateaux croisés | Terrain |

---

## ⚠️ Les limites connues du simulateur

Les vidéos de test sont **plus faciles que la réalité** :
- **un seul plateau** à la fois (pas de doublé filmé simultanément)
- fond **maîtrisé** (ciel/forêt/contre-jour propres)
- **pas de vent**, pas de pluie, pas de brouillard
- **pas d'occultation** par un tireur ou un arbre
- le plateau est un disque orange **net** (les vrais sont parfois noirs, sales,
  ou à contre-jour)

**Conséquence :** les 100 % annoncés sont **100 % sur ce simulateur**, pas
100 % sur ton stand. C'est une base solide, pas une garantie terrain.

---

## 🛡️ Ce qui a été prévu justement pour ça

1. **L'arbitrage humain.** Quand ClayScore n'est pas sûr, il **ne décide pas** :
   il montre le ralenti et tu tranches d'un tap. Ta décision devient la vérité.
2. **La mémoire des corrections.** Chaque fois que tu corriges ClayScore, le cas
   est archivé (`data/labeled/`) pour ré-entraîner l'IA. **Il s'améliore avec
   toi.**
3. **L'IA v2 (YOLO).** Prête à être entraînée dès que tu auras de vraies images.
   C'est elle qui gérera les cas que la détection classique rate.
4. **Le repli automatique.** Si l'IA n'est pas disponible, le système repasse
   tout seul sur la détection classique. **Il ne tombe jamais en panne pour ça.**

---

## 📋 Les chiffres business : statut

**Tous les chiffres financiers de ce dossier viennent de ton dossier v4.**
Je ne les ai **pas** vérifiés — ni les prix fournisseurs, ni les marges, ni le
seuil de rentabilité, ni le nombre de clubs FFBT.

Ce sont de **bonnes hypothèses de planification**. Avant d'engager de l'argent :
demande des **devis réels** aux fournisseurs listés dans BUDGET_BOM.

### Les 3 points juridiques/fiscaux à faire valider (je ne suis pas juriste)
1. **Impôt sur les bénéfices Monaco (25 %)** si plus de 25 % du CA est fait hors
   de Monaco → vendre en France déclenche ce cas.
2. **Clause d'activité secondaire SBM** dans ton contrat, avant la 1re facture.
3. **Coût réel du marquage CE** (poste le plus incertain du budget).

→ **Welcome Business Office** (gratuit, pour les nationaux) + un conseil fiscal.

---

## En une phrase

> Le logiciel fait ce qu'il annonce, et je peux le prouver.
> Ce qu'il fera **sur ton stand, sous la pluie, avec un plateau noir à
> contre-jour** — personne ne le sait encore, moi le premier.
> La prochaine étape qui apporte de la vérité, c'est **tes vraies vidéos**.
