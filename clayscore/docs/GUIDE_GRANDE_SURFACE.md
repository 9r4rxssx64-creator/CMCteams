# ClayScore — Couvrir de grandes surfaces, sans fil

**Parcours de chasse, compak éloigné, plusieurs terrains : comment on sort des
100 m de câble.**

---

## Le chiffre qui décide de tout

Une caméra 1440 × 1080 à 65 images/seconde produit :

| | Débit |
|---|---:|
| **Une caméra, vidéo brute** | **809 Mbit/s** |
| **Trois caméras** | **2 427 Mbit/s** (2,4 Gbit/s) |

Aucune liaison sans fil ne transporte ça. Le meilleur WiFi extérieur plafonne
en pratique vers 100–200 Mbit/s. **La vidéo brute ne partira jamais sans
câble** — ce n'est pas une question de budget, c'est de la physique.

Il y a donc exactement **trois façons** de raccorder un poste de vue :

| Mode | Ce qui circule | Débit | Portée | Sans fil ? |
|---|---|---:|---|---|
| **`brut`** | La vidéo telle quelle | 809 Mbit/s | 100 m (câble) | ❌ jamais |
| **`compresse`** | Vidéo H.264 (encodeur au pod) | 12 Mbit/s | selon liaison | 🟡 possible |
| **`edge`** | **Le verdict + un court ralenti** | **0,2 Mbit/s** | **> 1 km** | ✅ oui |

---

## Le pod intelligent : la vraie réponse

Au lieu d'envoyer ce qu'il voit, le pod **décide sur place** et n'envoie que
le résultat. Le hub agrège, arbitre et affiche.

```
   AVANT (filaire)                    APRÈS (pod intelligent)
   ┌────────┐  809 Mbit/s             ┌──────────────┐  0,2 Mbit/s
   │ CAMÉRA │ ══════════► HUB         │ CAMÉRA + IA  │ ─ ─ ─ ─ ─► HUB
   └────────┘   câble 100 m max       └──────────────┘   sans fil, > 1 km
   « voici 65 images par seconde »    « plateau n°14 : CASSÉ, 0,93 — voici 2 s de vidéo »
```

**Ce que ça change, chiffré** :

| | 25 plateaux | 200 plateaux (journée) |
|---|---|---|
| Données transmises | **75 Mo** | **600 Mo** |
| Débit moyen sur 1 h | **0,17 Mbit/s** | **1,33 Mbit/s** |

→ Ça passe sur n'importe quelle liaison, y compris 4G. Et **si la liaison
tombe, le pod continue de travailler** : il enverra ses verdicts au retour.

---

## Choisir sa liaison

| Liaison | Portée réaliste | Débit utile | Coût | Pour quoi |
|---|---|---|---|---|
| **Câble réseau (PoE)** | 100 m | 1 000 Mbit/s | ~10 €/pod | Fosse, compak : **le défaut, le plus sûr** |
| **WiFi du hub** | ~60 m | ~200 Mbit/s | inclus | Poste un peu déporté |
| **WiFi maillé extérieur** | ~150 m/nœud | ~100 Mbit/s | ~70 €/nœud | Plusieurs postes dispersés |
| **WiFi directionnel 5 GHz** | **> 1 km** | ~100 Mbit/s | ~60 € × 2 | **Parcours de chasse, second terrain** |
| **4G / LTE** | illimitée | ~20 Mbit/s | ~30 € + abo | Terrain sans vue directe |

⚠️ Ces portées supposent une **vue dégagée**. Un bosquet, une butte ou un
bâtiment coupent tout : sur le terrain, prévoir toujours moins.

---

## Combien de postes pour quelle surface ?

Le système calcule l'ordre de grandeur : **une paire de vues par zone**.

| Surface | Portée utile d'un poste | Zones | Postes |
|---|---|---|---|
| 900 m² (une fosse) | 30 m | 1 | 2 (+1 latéral) |
| 2 500 m² | 50 m | 1 | 2 |
| **1 hectare** (10 000 m²) | 50 m | 4 | **8** |
| 5 hectares (parcours) | 50 m | 20 | 40 |

> **Un parcours de chasse ne se couvre pas d'un bloc.** On équipe **les
> postes de tir utilisés**, pas la surface entière. 40 postes n'ont aucun
> sens ; 3 ou 4 zones équipées et déplaçables, oui.

C'est là que le pod intelligent change l'économie du produit : un poste
autonome, sans fil, alimenté par le lanceur voisin, **se déplace en 5 minutes**
d'un poste de tir à un autre.

---

## Le système refuse une installation impossible

C'est le garde-fou qui évite la mauvaise surprise sur le terrain. Exemples
réels de refus :

```
⛔ POD-A : il faudrait 809 Mbit/s, la liaison en offre ~200.
   → Activer le mode « pod intelligent » (le pod décide sur place).

⛔ POD-B : 500 m alors que « WiFi du hub » porte à ~60 m.
   → Passer en WiFi directionnel (pont, >1 km).

⛔ POD-C : sans fil mais alimenté par le câble réseau — incohérent.
   → Alimenter par batterie, secteur, ou dérivation sur le lanceur voisin.

⛔ POD-D : horloge décalée de 120 ms.
   → Resynchroniser : un décalage fausse l'association coup de feu / image.
```

Ces contrôles tournent **au démarrage** et dans l'onglet **🏆 Système** de la
tablette.

---

## Réglage

```yaml
postes:
  - id: POD-A
    role: stereo_a          # stereo_a | stereo_b | lateral | secours
    liaison: ethernet       # ethernet | wifi_local | wifi_maille |
                            # wifi_directionnel | lte
    distance_m: 30
    flux: brut              # brut | compresse | edge
    alimentation: poe       # poe | batterie | secteur | lanceur
```

Exemple d'un poste éloigné sur un parcours :

```yaml
  - id: POD-PARCOURS-3
    role: stereo_a
    liaison: wifi_directionnel
    distance_m: 800
    flux: edge              # il décide sur place
    alimentation: lanceur   # dérivation sur le lanceur voisin
```

---

## Matériel supplémentaire

| Article | Rôle | ~Prix | Acheter |
|---|---|---:|---|
| Calculateur de pod (Jetson Orin Nano ou équivalent) | Rend le pod « intelligent » | 280 € | ▸ [Silicon Highway](https://www.siliconhighwaydirect.com/product-p/945-13766-0005-000.htm) |
| Pont WiFi directionnel 5 GHz (la paire) | Liaison > 1 km | 120 € | ▸ [recherche LDLC](https://www.ldlc.com/recherche/pont%20wifi%20exterieur/) · [Amazon](https://www.amazon.fr/s?k=pont+wifi+ext%C3%A9rieur+5GHz+longue+port%C3%A9e) |
| Nœud WiFi maillé extérieur | Couvrir plusieurs postes proches | 70 € | ▸ [recherche Amazon](https://www.amazon.fr/s?k=point+acc%C3%A8s+wifi+ext%C3%A9rieur+IP66) |
| Routeur 4G + SIM | Terrain sans vue directe | 30 € + abo | ▸ [recherche Amazon](https://www.amazon.fr/s?k=routeur+4G+ext%C3%A9rieur) |
| Batterie 12 Ah + convertisseur isolé | Pod déporté autonome | 80 € | voir `GUIDE_ALIMENTATION` |

**Coût d'un poste déporté complet, sans fil** : ~**480 €**
(calculateur 280 + caméra 180 + liaison partagée + alimentation).

---

## Ce qui est vérifié — et ce qui ne l'est pas

**✅ Testé en logiciel** : le refus de la vidéo brute sans fil, le refus d'une
distance supérieure à la portée, l'incohérence « sans fil alimenté par le
câble », la perte d'un poste de la paire stéréo, la dérive d'horloge
bloquante, les liaisons lentes ou avec pertes, et le fait que **3 pods
intelligents restent sous 1 Mbit/s** contre 2 427 en vidéo brute.

**❌ Jamais éprouvé** : les portées réelles. Elles dépendent du terrain, des
arbres, du relief et de la météo — **aucun tableau ne remplace un essai sur
place**. Le mode `edge` (le pod qui décide seul) est **conçu et modélisé**,
mais le calculateur déporté n'a jamais tourné : c'est du matériel non acheté.
