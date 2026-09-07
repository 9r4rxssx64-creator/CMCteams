# ClayScore — Mode d'emploi

**Pour Kevin — sans jargon.** Tout ce qui suit fonctionne **sans matériel** et
**sans Internet**.

---

## A. Juste regarder (rien à installer)

### Les 3 vidéos de démonstration
Ouvre le dossier `demos/` et tape sur une vidéo :

| Fichier | Ce que tu vois |
|---|---|
| `casse_ciel_demo.mp4` | Le plateau vole, sa trajectoire se trace, il explose → badge **CASSÉ ✔** |
| `manque_foret_demo.mp4` | Le plateau traverse intact → badge **MANQUÉ ✗** |
| `nobird_contrejour_demo.mp4` | Le plateau part déjà cassé → badge **NO BIRD ↻** |

Ce sont exactement les images que ClayScore produit tout seul (ralenti ×4,
habillage gravé dans la vidéo — rien à monter).

### Les 2 pages de présentation
Dans `pages/`, double-clic sur :
- **`landing.html`** → la page de présentation (avec une animation du plateau)
- **`onepager.html`** → le dossier partenaire 1 page (pour Laporte, un club,
  MonacoTech). **Astuce :** pour en faire un PDF, ouvre-la puis « Imprimer →
  Enregistrer en PDF ».

---

## B. Faire tourner le vrai logiciel (sur un ordinateur)

> Nécessite un ordinateur (Mac/Windows/Linux) avec Python. Pas faisable sur
> tablette seule.

### 1. Installer (une seule commande)
```bash
cd clayscore
./install.sh
```
Ça installe tout, crée les données de test, et ne touche à rien d'autre sur ta
machine.

### 2. Lancer ClayScore
```bash
python -m clayscore.server
```
Puis, **depuis ta tablette sur le même WiFi**, ouvre dans le navigateur :
```
http://<adresse-de-l-ordinateur>:8000
```

### 3. Jouer une partie (en simulation)
1. Choisis la discipline (Fosse Universelle par défaut)
2. Écris les noms des tireurs (1 à 6)
3. Tape **▶️ Démarrer la partie**
4. Tape **🚀 LANCER LE PLATEAU** → ClayScore analyse et propose un verdict
5. Regarde le ralenti, puis tape **✅ CASSÉ**, **❌ MANQUÉ** ou **🔁 NO BIRD**
6. Les scores se mettent à jour en direct. À la fin : fiche + export CSV.

Le bouton **🎬 Ralenti habillé (démo)** télécharge la vidéo avec l'habillage —
c'est ce qui a servi à créer les 3 démos.

---

## C. Vérifier que tout marche (preuves)

```bash
cd clayscore
pytest                      # → la sortie de pytest FAIT foi (ne pas comparer à un
                            #   nombre écrit dans la doc : cinq valeurs différentes y traînent)
python -m tools.bench --all # → doit afficher : 27/27 = 1.000 (×3)
```

Ces deux commandes re-prouvent, sur ta machine, tout ce qui est annoncé dans le
récapitulatif.

---

## D. Fabriquer d'autres vidéos de démo

```bash
cd clayscore
python -m tools.overlay --scenario casse  --background ciel       --out ma_demo.mp4 --slowmo 4
python -m tools.overlay --scenario manque --background foret      --out ma_demo2.mp4 --slowmo 4
python -m tools.overlay --scenario nobird --background contrejour --out ma_demo3.mp4 --slowmo 4
```
(`--slowmo 4` = ralenti ×4 ; mets `8` pour deux fois plus lent.)

---

## E. Le jour où le matériel arrive

**Une seule chose change** : le fichier `config/config.yaml`.

```yaml
source:
  video:
    type: aravis      # au lieu de "file"
    width: 1440
    height: 1080
    fps: 50
  audio:
    type: mic         # au lieu de "file"
```

Et sur le boîtier (Jetson) :
```bash
./install.sh --hardware          # caméras + micro + service qui redémarre tout seul
sudo ./deploy/network.sh --mode auto         # réseau : autonome OU club, au choix
# (auto = rejoint le réseau du club s'il existe, sinon crée le WiFi "ClayScore")
# Essai à blanc, sans rien modifier :
./deploy/network.sh --mode reseau --dry-run
```

Aucune ligne de code à toucher.

---

## F. En cas de souci

| Problème | Solution |
|---|---|
| `./install.sh` refuse de démarrer | `chmod +x install.sh` puis relance |
| « python introuvable » | Installer Python 3.10 ou plus récent |
| La tablette ne voit pas la page | Vérifier que tablette et ordinateur sont sur **le même WiFi** |
| Quelle adresse taper ? | `http://clayscore.local:8000` — ou l'adresse affichée au démarrage |
| Un code d'accès est demandé | Normal sur réseau partagé : c'est `network.access_pin` du fichier de config |
| Savoir si tout est bien branché | Onglet **📶 Réseau** de l'appli : mode, adresse, caméras isolées, place disque |
| Les vidéos ne s'ouvrent pas | Utiliser VLC (gratuit) — format mp4 standard |

---

*Toutes les commandes ci-dessus ont été testées. Si quelque chose ne se passe
pas comme écrit, c'est un bug de ma part — dis-le-moi.*
