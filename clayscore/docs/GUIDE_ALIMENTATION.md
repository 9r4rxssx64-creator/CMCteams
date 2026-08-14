# ClayScore — Alimentation : batterie, secteur, ou lanceurs

**Le système ne doit jamais s'éteindre en pleine épreuve. Voici comment.**

---

## Le principe, en une image

Le piège serait de câbler « secteur quand il y en a, batterie sinon » : au
moment du basculement, il y a **une coupure** — même courte, elle redémarre le
hub et interrompt l'épreuve.

La solution professionnelle : **tout passe par la batterie, en permanence.**
Les sources ne font que la **recharger**.

```
   SECTEUR 230 V ──┐
                   ├──► CHARGEUR ──► BATTERIE ──► TOUT LE SYSTÈME
   LANCEUR 12 V  ──┘                    ▲
                                        └── toujours en ligne
```

**Conséquence** : brancher, débrancher, changer de source, perdre le
secteur — **aucune coupure**, jamais. Rien n'est alimenté directement par la
source. C'est le principe d'une alimentation sans interruption, en 12 V.

---

## Les trois sources

### 1. Batterie seule — le stand isolé

| | |
|---|---|
| **Quand** | Pas de courant à proximité |
| **Autonomie** | **8,1 h** avec 12 V 30 Ah *(calculé : 38 W, rendement 85 %)* |
| **Avantage** | Aucune dépendance |
| **Limite** | Il faut penser à recharger |

### 2. Secteur 230 V — le club équipé

| | |
|---|---|
| **Quand** | Une prise est accessible |
| **Autonomie** | Illimitée |
| **Matériel** | Chargeur **LiFePO4** dédié (~25 €) |
| **Bonus** | La batterie reste chargée, prête pour le stand suivant |

### 3. Dérivation sur un lanceur — l'astuce du terrain

Les lanceurs sont déjà alimentés sur le pas de tir, souvent en **12 V**
(batterie type auto) ou en 230 V. On peut s'y raccorder plutôt que tirer une
rallonge de 80 m.

| | |
|---|---|
| **Quand** | Lanceur alimenté à proximité d'un poste |
| **Avantage** | Aucun câble supplémentaire, aucune batterie à porter |
| **Idéal pour** | Les **pods sans fil éloignés** (parcours de chasse) |

### 🚩 Les 5 règles absolues de la dérivation lanceur

Un lanceur est une **machine dangereuse**. Rien de ce qu'on ajoute ne doit
pouvoir perturber son fonctionnement ni sa sécurité.

1. **Convertisseur isolé galvaniquement** (DC-DC isolé, ~20 €) — jamais un
   simple fil en parallèle. Une masse commune peut faire des choses
   imprévisibles sur l'électronique du lanceur.
2. **Fusible dédié** côté ClayScore (2 A suffit) — un défaut chez nous ne doit
   **jamais** remonter vers le lanceur.
3. **Prélèvement faible** — un pod consomme ~10 W. Vérifier que
   l'alimentation du lanceur a la marge (elle est dimensionnée pour le moteur
   d'armement, qui tire beaucoup en pointe).
4. **Accord écrit du club** — on se branche sur son matériel. Ça se demande.
5. **Débranchement en un geste** — connecteur rapide, pour rendre le lanceur
   intact en 5 secondes.

> ⚠️ Si le club refuse, ou si le lanceur est en 230 V sans point de
> raccordement propre : **on ne bricole pas**. On met une batterie.

---

## Dimensionner sa batterie

Le système calcule lui-même ce qu'il faut :

| Ce qu'on alimente | Conso | Pour 8 h | Batterie |
|---|---|---|---|
| Hub complet (3 caméras filaires) | 38 W | 358 Wh | **30 Ah** ✅ |
| Un pod intelligent seul | 10 W | 94 Wh | **12 Ah** |
| Hub + 3 pods intelligents sans fil | 68 W | 640 Wh | **50 Ah** |

*(Marge de 30 % incluse : vieillissement, froid, et on ne vide jamais
totalement une batterie.)*

### Pourquoi LiFePO4 et pas du plomb
- **3× plus légère** à capacité égale — ça se porte sur un stand
- **2 000+ cycles** au lieu de ~300
- **Chimie stable**, pas d'emballement thermique
- Supporte d'être rechargée à moitié vide sans s'abîmer

---

## Le cas des pods sans fil éloignés

Un pod intelligent posé à 600 m consomme ~10 W. Trois options, par ordre de
préférence :

| Solution | Autonomie | Coût | Quand |
|---|---|---|---|
| **Dérivation sur le lanceur voisin** | illimitée | ~25 € | Lanceur à proximité ✅ |
| Batterie 12 Ah dédiée | 12 h | ~60 € | Pas de lanceur proche |
| Batterie 7 Ah + panneau solaire 20 W | illimitée en été | ~100 € | Poste laissé à demeure |

💡 **Le solaire n'est pas un gadget** pour un poste permanent sur un parcours :
10 W consommés, un panneau de 20 W et une petite batterie suffisent en
demi-saison. À confirmer par une mesure réelle en hiver — je ne l'ai pas
calculé pour le mois de décembre.

---

## Ce que l'appli affiche

Onglet **🏆 Système** :

```
Source : secteur
Consommation : 38 W · Autonomie : illimitée (source branchée)
Valeur estimation
  ⚠️ Autonomie calculée, non mesurée.
     → Installer un capteur de courant (INA226) pour une valeur réelle.
```

Sur batterie, l'affichage devient l'autonomie restante — et **le contrôle
avant épreuve refuse de démarrer** si elle est inférieure à la durée annoncée.

### Mesurer au lieu d'estimer
Un capteur **INA226** (~8 €) sur le bus 12 V donne la consommation **réelle**
et l'état de charge. Tant qu'il n'est pas installé, l'appli marque
explicitement `estimation` — elle ne fait jamais passer un calcul pour une
mesure.

---

## Réglage

```yaml
alimentation:
  sources: [secteur]      # ou [lanceur], ou [] pour batterie seule
  batterie_ah: 30
  batterie_v: 12
  duree_epreuve_h: 8      # sert au GO/NO-GO avant l'épreuve
```

---

## Matériel à ajouter

| Article | Rôle | ~Prix | Acheter |
|---|---|---:|---|
| Chargeur LiFePO4 12 V | Recharge sur secteur | 25 € | ▸ [recherche Amazon](https://www.amazon.fr/s?k=chargeur+LiFePO4+12V) |
| Convertisseur DC-DC **isolé** 12 V | Dérivation lanceur, en sécurité | 20 € | ▸ [recherche Amazon](https://www.amazon.fr/s?k=convertisseur+DC+DC+isol%C3%A9+12V) |
| Porte-fusibles + fusibles 2/5 A | Protection de chaque départ | 10 € | ▸ [recherche Amazon](https://www.amazon.fr/s?k=porte+fusible+12V+auto) |
| Connecteurs rapides Anderson | Débrancher en 5 secondes | 12 € | ▸ [recherche Amazon](https://www.amazon.fr/s?k=connecteur+anderson+powerpole) |
| Capteur INA226 | **Mesurer** au lieu d'estimer | 8 € | ▸ [recherche Amazon](https://www.amazon.fr/s?k=INA226+capteur+courant) |
| Batterie 12 Ah (pod déporté) | Pod sans fil autonome 12 h | 60 € | ▸ [recherche Amazon](https://www.amazon.fr/s?k=batterie+LiFePO4+12V+12Ah) |

*(Liens « recherche » : les pages marchandes n'ont pas pu être ouvertes depuis
l'environnement de développement — aucune référence n'a été inventée.)*

---

## Ce qui est vérifié — et ce qui ne l'est pas

**✅ Testé en logiciel** : le bilan électrique, l'autonomie, le fait qu'une
source externe rende l'autonomie illimitée, l'alerte bloquante si l'autonomie
est inférieure à l'épreuve, le rappel d'isolation sur dérivation lanceur, le
refus d'une source inconnue, et le fait qu'une **estimation soit toujours
signalée comme telle**.

**❌ Jamais éprouvé** : le montage électrique réel. Les 38 W et les 8,1 h sont
**calculés**, pas mesurés. Un wattmètre à 12 € tranchera en une minute à la
mise en service — et c'est la première chose à faire.
