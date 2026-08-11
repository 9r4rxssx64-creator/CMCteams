« Compétition officielle » : ce que ça exige vraiment
=====================================================

**Ce que le système apporte, ce qu'il ne peut pas apporter, et le chemin pour
y arriver.**

---

## ⚠️ La vérité d'abord

**Aucun logiciel, aucun matériel ne peut se déclarer « homologué ».**
L'homologation est une **décision d'une fédération** (FFBT, FITASC, ISSF), au
terme d'une procédure : dossier technique, essais contradictoires, avis du
jury, période probatoire.

Je n'ai **pas pu consulter les règlements officiels** (accès web bloqué depuis
l'environnement de développement). Tout ce qui suit repose sur les exigences
**universelles** d'un système d'arbitrage sportif — traçabilité, preuve,
contestation, disponibilité — et non sur la citation d'un article précis.

👉 **La première démarche à faire est d'écrire à la FFBT** pour demander les
conditions d'agrément d'un dispositif d'aide à l'arbitrage. Tant que ce
document n'est pas en main, tout le reste est une préparation.

**Ce qui est livré ici** : les **exigences techniques** qui rendent ce dossier
défendable — et elles sont implémentées, testées, mesurables.

---

## Le vrai enjeu : la preuve, pas la précision

Un arbitre humain se trompe aussi. Ce qu'une fédération exige d'un système
électronique, ce n'est pas d'être parfait — c'est de **pouvoir prouver ce
qui s'est passé** et de **permettre la contestation**.

D'où les quatre exigences suivantes.

---

## 1. Le journal inaltérable

Chaque événement — plateau analysé, verdict validé, **correction humaine**,
réclamation, décision du jury, incident, reprise après panne — est enregistré
dans un journal où **chaque ligne est liée à la précédente par une empreinte**.

**Conséquence** : modifier un score après coup casse la chaîne, et ça se voit
immédiatement. Supprimer une ligne aussi. Cette vérification est faite par
l'appli, et peut être refaite par un tiers.

| Tentative | Détecté ? |
|---|---|
| Changer un verdict dans le fichier | ✅ « contenu modifié après coup » |
| Supprimer un plateau gênant | ✅ « chaînage rompu » |
| Insérer un plateau qui n'a pas eu lieu | ✅ « chaînage rompu » |
| Réécrire tout le fichier | ✅ le sceau final ne correspond plus |

Le journal est écrit **immédiatement** à chaque événement : une coupure de
courant ne fait pas disparaître les derniers tirs *(testé)*.

**Point capital pour un jury** : le système distingue un verdict **accepté**
d'une **correction humaine**. On peut donc relire, plateau par plateau, ce que
la machine a proposé et ce que l'arbitre a décidé.

---

## 2. La fiche scellée

La fiche finale porte un **sceau** calculé sur son contenu **et** sur le
journal. Il s'affiche en 12 caractères, à recopier sur la fiche papier.

- Un seul chiffre modifié → **le sceau change**.
- Deux exemplaires portant le même sceau → **contenu identique, garanti**.

C'est ce qui permet de dire, des semaines plus tard : *« la fiche que je tiens
est bien celle de l'épreuve »*.

---

## 3. Le contrôle GO / NO-GO avant l'épreuve

Un défaut découvert au 20ᵉ plateau coûte l'épreuve entière. Le système
**refuse donc de se déclarer prêt** tant qu'un point bloquant subsiste :

| Point contrôlé | Pourquoi c'est bloquant |
|---|---|
| **Mode concours actif** | Sinon la machine pourrait valider seule |
| **Code d'accès actif** | Sinon n'importe qui sur le réseau change un score |
| **Caméras sur leur réseau dédié** | Sinon le trafic passe par le réseau du club |
| **Tous les postes de vue en service** | Une vue perdue = plus de mesure de distance |
| **Alimentation confirmée** | Une coupure invalide l'épreuve |
| **Autonomie ≥ durée de l'épreuve** | Idem, mais annoncé **avant** de commencer |
| **Place disque ≥ 2 Go** | Un disque plein arrête l'enregistrement des preuves |
| **Journal intègre** | Un journal déjà altéré ne prouve plus rien |
| *(avertissement)* horloges synchronisées | Un décalage fausse l'ordre des tirs |

L'appli affiche **✅ PRÊT** ou **⛔ PAS PRÊT**, avec pour chaque point rouge
**la manière de le corriger**.

---

## 4. La contestation

- **Aucun point douteux n'est attribué seul** : un cas ambigu est renvoyé à
  l'arbitre, qui tranche sur le ralenti.
- **Le ralenti est conservé** et rejouable — c'est la pièce à conviction.
- **Réclamation et décision du jury sont journalisées** : qui, quand, quel
  plateau, verdict avant / après, motif.
- **En mode concours, la validation automatique est désactivée d'office.**

---

## Ce qui manque encore pour un dossier complet

Sans détour, voici ce qui **n'est pas** fait :

| Exigence | État | Ce qu'il faut |
|---|---|---|
| **Homologation fédérale** | ❌ Non demandée | Écrire à la FFBT, obtenir le cahier des charges |
| **Marquage CE** | ❌ À faire | Dossier technique, essais CEM, déclaration de conformité |
| **Précision mesurée sur stand** | ❌ Jamais mesurée | Phase 0 : filmer de vraies casses, puis essais contradictoires |
| **Essais contradictoires** | ❌ À organiser | Système vs 2 arbitres humains, plusieurs centaines de plateaux |
| **Fiabilité longue durée** | ❌ Non testée | Une saison complète en club, incidents comptabilisés |
| **Redondance des vues** | 🟡 Partielle | 3 postes prévus ; à valider avec un poste volontairement coupé |
| **Synchronisation des horloges** | 🟡 Contrôlée, non imposée | Synchronisation matérielle (PTP) si la fédération l'exige |
| **Traçabilité** | ✅ Fait et testé | — |
| **Fiche scellée** | ✅ Fait et testé | — |
| **Contrôle avant épreuve** | ✅ Fait et testé | — |
| **Continuité d'alimentation** | ✅ Conçu, non éprouvé | Voir `GUIDE_ALIMENTATION` |

---

## Le chemin réaliste vers une compétition officielle

1. **Écrire à la FFBT** — demander les conditions d'agrément. Gratuit, et
   c'est ce qui détermine tout le reste.
2. **Mesurer la précision réelle** — Phase 0 puis Phase 5 de
   `CHECKLIST_PROTOTYPE`. Sans chiffre réel, aucun dossier ne tient.
3. **Essais contradictoires en club** — système contre arbitres humains, sur
   plusieurs centaines de plateaux, **désaccords publiés**.
4. **Marquage CE**.
5. **Usage en « aide à l'arbitrage »** — l'arbitre reste décideur. C'est la
   porte d'entrée réaliste : personne n'accepte un système inconnu comme
   juge unique.
6. **Demande d'agrément**, avec les chiffres et les témoignages en main.

> **Position à tenir, honnête et vendable dès aujourd'hui :**
> *« ClayScore est une aide à l'arbitrage traçable : l'arbitre décide,
> ClayScore prouve. »*
> Ça se vend, ça se démontre, et ça ne promet rien de faux.

---

## Ce qui est vérifié automatiquement

**51 tests** couvrent ce chapitre, dont : la détection d'une ligne modifiée,
d'une ligne supprimée, la survie du journal à une coupure, le refus d'un
événement non prévu, le sceau qui change au moindre score modifié, et le
NO-GO déclenché par **chacun** des 8 points bloquants pris isolément.

⚠️ Tout ceci est vérifié **en logiciel**. La partie physique — et surtout la
**précision réelle sur un stand** — reste à mesurer.
