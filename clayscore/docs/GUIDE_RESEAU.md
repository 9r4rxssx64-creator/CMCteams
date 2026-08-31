# ClayScore — Guide réseau

**Le boîtier marche partout : en pleine nature sans rien, ou branché sur le
réseau d'un club. Sans réglage, il choisit tout seul.**

---

## En une phrase

ClayScore crée **son propre WiFi** quand il n'y a rien, et **rejoint le réseau
du club** quand il y en a un. Dans les deux cas, la tablette ouvre la même
adresse : **`http://clayscore.local:8000`** — jamais une adresse IP à recopier.

---

## Les 3 modes

| Mode | Ce qui se passe | Quand l'utiliser |
|---|---|---|
| **`auto`** *(par défaut)* | Cherche un réseau existant. S'il y en a un → le rejoint. Sinon → crée son WiFi. | **Laisser ça.** Marche partout sans y penser. |
| **`autonome`** | Crée **toujours** son WiFi `ClayScore`. | Stand isolé, ou pour ne jamais dépendre du réseau du club. |
| **`reseau`** | Rejoint **toujours** le réseau existant. | Club équipé : la tablette reste sur le WiFi du club, l'écran du club-house voit les scores. |

Réglage : `config/config.yaml`, section `network:` → `mode:`.
Application sur le hub : `sudo ./deploy/network.sh --mode auto`

---

## Mode autonome — le stand en pleine nature

```
        📱 tablette ─┐
        📺 écran TV ─┤ WiFi « ClayScore »
                     │
              ┌──────┴──────┐
              │     HUB     │
              └──────┬──────┘
                     │ réseau caméras (isolé)
              ┌──────┴──────┐
              │ SWITCH PoE  │→ POD 1, POD 2, POD 3
              └─────────────┘
```

- **Aucun Internet, aucun abonnement, aucune box.**
- Le hub est le point d'accès WiFi : la tablette s'y connecte comme à un WiFi
  de maison.
- Mot de passe WiFi : `network.hotspot_password` (**8 caractères minimum**).

⚠️ Sans mot de passe, n'importe qui à portée peut se connecter. Le système
prévient au démarrage.

---

## Mode réseau — le club équipé

```
   🌐 réseau du club (box / switch)
        │            │            │
    📱 tablette   📺 TV club   ┌──┴───┐
                              │ HUB  │
                              └──┬───┘
                                 │ réseau caméras (SÉPARÉ)
                          ┌──────┴──────┐
                          │ SWITCH PoE  │→ POD 1, 2, 3
                          └─────────────┘
```

**Ce que ça apporte** : plus besoin de changer de WiFi sur la tablette,
l'écran du club-house affiche les scores, et une sauvegarde vers un ordinateur
du club devient possible.

**Ce que ça impose** : le réseau est **partagé** → n'importe qui dessus
pourrait modifier les scores. D'où le code d'accès ci-dessous, **obligatoire
en concours**.

---

## Pourquoi les caméras ont leur PROPRE réseau

C'est le point technique le plus important, et le moins évident.

Les 3 caméras ne sont **jamais** sur le réseau du club. Elles vivent sur une
deuxième prise réseau du hub (`camera_iface`, en `192.168.10.x`), derrière le
switch PoE. Trois raisons :

1. **Le club n'est pas inondé.** Trois flux vidéo à 65 images/seconde
   saturent un réseau ordinaire.
2. **Une panne du réseau du club n'arrête pas l'arbitrage.** La box tombe ?
   Les plateaux continuent d'être analysés.
3. **Personne sur le réseau du club ne peut atteindre les caméras.**

L'appli vérifie cette isolation toute seule : page **📶 Réseau** → *« caméras
isolées ✅ »*. Si c'est ⚠️, le switch PoE est branché au mauvais endroit.

---

## Le code d'accès

| Réglage | Effet |
|---|---|
| `access_pin: ""` *(vide)* | Tout le monde peut lancer un plateau et valider un verdict. |
| `access_pin: "2468"` | **Toute écriture** exige le code : nouvelle partie, lancer, verdict, enregistrement. |

**Les lectures restent toujours libres** : l'écran TV, les spectateurs et
l'historique s'affichent sans code. Seules les actions qui **changent un
score** sont protégées.

Sur la tablette, le code est demandé **une seule fois** puis mémorisé.

> **En concours, renseigne-le.** Sans lui, sur le réseau d'un club, n'importe
> qui avec un téléphone peut changer un résultat. L'appli le signale en rouge
> dans la page Réseau tant que ce n'est pas fait.

---

## Mise en service

```bash
# 1. Choisir le mode (une seule fois)
nano config/config.yaml          # network: mode / hotspot_password / access_pin

# 2. Appliquer sur le hub
sudo ./deploy/network.sh --mode auto

# 3. Démarrer
sudo systemctl start clayscore
```

Au démarrage, le hub **affiche lui-même** l'adresse à taper et ce qui cloche :

```
ClayScore — réseau : autonome (Le hub crée son propre WiFi « ClayScore »…)
  Sur la tablette, ouvrir : http://192.168.50.1:8000
  Sur la tablette, ouvrir : http://clayscore.local:8000
  [important] Réseau partagé SANS code d'accès : n'importe qui peut modifier les scores.
      → Renseigne network.access_pin dans config.yaml (obligatoire en concours).
```

💡 **Essayer sans rien casser** : `./deploy/network.sh --mode reseau --dry-run`
affiche tout ce qui serait fait, sans rien modifier.

---

## La page 📶 Réseau de l'appli

Cinquième onglet en bas de la tablette. Elle répond aux seules questions du
terrain :

- **Quel mode ?** WiFi autonome, ou branché au club
- **Quelle adresse taper ?** (copiable telle quelle)
- **Les caméras sont-elles bien isolées ?**
- **Le code d'accès est-il actif ?**
- **Reste-t-il de la place sur le disque ?**
- **Qu'est-ce qui cloche, et comment le corriger ?** — en français, avec la
  solution à côté du problème

---

## Mise à jour des tablettes

Une tablette de club ne doit jamais rester sur une vieille version. L'appli
**vérifie la version du hub toutes les minutes** et à chaque réveil de
l'écran ; si le hub a été mis à jour, elle **vide son cache et se recharge
toute seule**. Personne n'a à vider quoi que ce soit à la main.

---

## Dépannage

| Symptôme | Cause probable | Solution |
|---|---|---|
| `clayscore.local` ne répond pas | mDNS absent sur la tablette | Utiliser l'adresse IP affichée au démarrage |
| Aucune adresse au démarrage | Câble/WiFi débranché | Forcer `mode: autonome` → le hub crée son WiFi |
| « caméras non isolées » | Switch PoE sur la mauvaise prise | Le brancher sur la 2ᵉ prise réseau du hub |
| Le WiFi `ClayScore` n'apparaît pas | Carte WiFi sans mode point d'accès | Vérifier la carte, ou passer en mode `reseau` |
| Code d'accès refusé | Code changé côté hub | Vider les données du site sur la tablette, ressaisir |
| Tablette sur une vieille version | Cache figé | Elle se met à jour seule en < 1 min ; sinon fermer/rouvrir |

---

## Ce qui est vérifié automatiquement

**29 tests** couvrent ce chapitre, dont :

- la bascule automatique (réseau présent → rejoint / absent → crée le sien) ;
- une écriture **refusée** sans code, **acceptée** avec le bon (testé sur un
  vrai serveur) ;
- la lecture qui reste libre pour l'écran TV ;
- la détection des caméras mal branchées ;
- le mot de passe WiFi qui ne fuite pas quand le hotspot n'est pas utilisé ;
- une clé mal orthographiée dans la configuration qui **échoue** au lieu
  d'être ignorée en silence.

⚠️ **Honnêteté** : tout ceci est vérifié en logiciel. La partie physique
(carte WiFi en mode point d'accès, mDNS sur la tablette, jumbo frames du
switch) n'a **pas encore été testée sur du vrai matériel** — c'est la
Phase 4 de `CHECKLIST_PROTOTYPE`.
