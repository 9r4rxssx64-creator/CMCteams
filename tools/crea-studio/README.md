# 🎨 Créa Studio — Vidéo · Photo · Cartoon

**Une seule app** qui réunit **montage vidéo**, **retouche photo (niveau Photoshop/GIMP)** et **création de dessins animés**.
100 % dans le navigateur, **hors-ligne**, **sans compte**, **sans pub**, installable sur iPhone (PWA).

👉 **Sur ton domaine :** https://studio.kd-mc.com
👉 **Lien direct GitHub Pages :** https://9r4rxssx64-creator.github.io/CMCteams/tools/crea-studio/

Sur iPhone : ouvre le lien dans Safari → bouton **Partager** → **« Sur l'écran d'accueil »** → l'app s'installe comme une vraie appli.

---

## 🧠 Reverse-engineering : d'où vient chaque fonction

Le point de départ (photo Google) listait les logiciels pros. J'ai décortiqué **ce que chacun fait de mieux**, puis j'ai gardé la meilleure idée de chacun — plus celles des meilleures alternatives web (Photopea, Snapseed, Lightroom, VSCO, CapCut, VN, Krita, FlipaClip) — pour les fondre dans **une seule app** qui tourne sur ton téléphone.

| Logiciel pro | Sa fonction phare | Ce que Créa Studio en reprend |
|---|---|---|
| **DaVinci Resolve** | Étalonnage couleur pro | Réglages fins (expo, contraste, hautes lumières, ombres, température, teinte, HSL) |
| **Adobe Premiere Pro** | Montage timeline, découpe | Découpe précise début/fin + sous-titres |
| **Adobe After Effects** | Effets & motion design | Filtres cinéma + textes/incrustations |
| **Toon Boom Harmony** | Animation 2D image par image | Studio Cartoon complet (frames, pelure d'oignon, lecture) |
| **Blender** | Anim/3D gratuit, export vidéo | Export vidéo de l'animation (frame-par-frame) |
| **Photopea / Snapseed** | Retouche + réglages sélectifs | Recadrage, rotation, miroir, netteté, vignette, grain |
| **Lightroom / VSCO** | Presets « film » | 20 filtres pros (Ciné, N&B, Vintage, HDR, Sunset, Cyber…) |
| **CapCut / VN** | Vitesse, musique, sous-titres, filtres | Vitesse (ralenti/accéléré), musique de fond, filtres, sous-titres |
| **Krita / FlipaClip** | Dessin animé, onion skin, timeline | Pinceau/gomme/pot, palette, timeline de frames, lecture fluide |
| **Adobe Photoshop** | Détourage, calques, dessin, niveaux | **Détourage → fond transparent** (gomme magique / fond auto / gomme / restaurer), **Niveaux** (noirs/gamma/blancs), **dessin sur la photo**, **stickers/logo** (calques-lite), **redimensionner** |
| **GIMP** | Alternative libre de Photoshop | Mêmes outils avancés ci-dessus, 100 % gratuits et hors-ligne |

**Le plus (« va plus loin ») :** un effet **Cartoonize** (photo → dessin animé) qui n'existe nulle part réuni comme ça sur mobile : posterisation des couleurs + détection de contours (Sobel) + lissage. Et la passerelle **« Partir d'une image »** dans le studio Cartoon : ta photo est transformée en croquis pour dessiner par-dessus.

---

## 🎬 Ce que tu peux faire

### 📸 Studio Photo *(niveau Photoshop / GIMP)*
- **Réglages** : exposition, contraste, saturation, vibrance, température, teinte, hautes lumières, ombres, **Niveaux (noirs / gamma / blancs)**, couleur (°), netteté, vignette, grain.
- **20 filtres** en 1 tap : Éclat, Ciné, N&B, Sépia, Chaud/Froid, Vintage, HDR, Pop, Noir, Sunset, Menthe, Drama, Insta, Pastel, Or, Cyber…
- **✂️ Cadrer + Redimensionner** : recadrage libre / 1:1 / 4:3 / 16:9, rotation ±90°, miroir, taille en pixels (720/1080/1920/Max).
- **🪄 Détourer** *(le gros ajout Photoshop/GIMP)* : **rends le fond transparent** — gomme magique (touche une couleur), fond auto (efface le contour), gomme et restaurer au doigt. → **export PNG transparent**.
- **🖌️ Dessin** : pinceau / feutre / gomme directement sur la photo (couleur + taille).
- **😀 Stickers** : bibliothèque d'emojis + **import de logo/image** ; déplaçables, taille réglable (calques-lite).
- **🖍️ Cartoon** : transforme la photo en dessin animé (contours + aplats), réglable.
- **🅣 Texte** : couleur + taille, glisse-le où tu veux.
- **Export** : PNG **transparent** (si détouré) ou JPG haute qualité. Partage direct (Instagram, Messages…).

### 🎬 Studio Vidéo
- **Découpe** : choisis le début et la fin de l'extrait.
- **Filtres** cinéma en temps réel.
- **Vitesse** : ralenti / accéléré (0,25× à 3×).
- **Sous-titre** affiché sur la vidéo (couleur au choix).
- **Musique** de fond (remplace le son à l'export, volume réglable).
- **Export** vidéo (MP4 sur iPhone) — partage direct.

### ✏️ Studio Cartoon / Animation
- **Dessin** image par image (pinceau, gomme, pot de peinture, annuler).
- **Pelure d'oignon** : tu vois l'image précédente en transparence pour bien animer.
- **Timeline** de frames + bouton ＋ pour ajouter une image.
- **Lecture** fluide à vitesse réglable (2 à 24 img/s).
- **Export** : image PNG, ou **animation en vidéo**.
- **Partir d'une image** : importe une photo (transformée en croquis) et anime par-dessus.

---

## 🔒 Confidentialité & technique

- **Tout se passe sur ton téléphone.** Aucune photo/vidéo n'est envoyée sur Internet. Aucun serveur, aucun compte, aucune pub.
- **Hors-ligne** : une fois ouverte, l'app marche même sans connexion (service worker).
- **Aucune dépendance externe** : un seul fichier HTML autonome (respecte la règle d'isolation max du projet — ne touche aucune autre app).

### Sous le capot (pour info)
- Moteur image : pipeline pixel Canvas 2D (aperçu WYSIWYG + export plein résolution).
- Cartoonize : lissage (box blur) → posterisation → contours Sobel → composition.
- Animation : Canvas + Pointer Events + pelure d'oignon + flood-fill (pot de peinture).
- Export vidéo : `canvas.captureStream` + `MediaRecorder` (MP4/H.264 priorisé sur iOS, WebM en repli) + audio via WebAudio. Détection des capacités au lancement, repli propre si l'export vidéo n'est pas supporté (message → enregistrement d'écran).

### Limites honnêtes (iOS)
- L'export vidéo enregistre **en temps réel** : reste sur l'écran pendant le rendu.
- Si un très vieil iPhone ne supporte pas `MediaRecorder`, l'app te propose l'enregistrement d'écran (même résultat).
- Pistes d'évolution : export via **WebCodecs + mp4-muxer** (iOS 26+) pour un rendu hors temps réel plus rapide et net ; détourage IA du fond (MediaPipe) ; LUTs 3D importables.

---

## 🌐 Intégré à ton domaine

L'app est branchée sur **`studio.kd-mc.com`** (sous-domaine auto-provisionné : DNS + certificat SSL automatiques via le routeur Cloudflare `kdmc-router`, **zéro action manuelle**). Elle apparaît aussi dans le **Portail kd-mc.com** (tuile 🎬 Créa Studio). Le test anti-dérive `apps-consistency` garantit la cohérence (apps.json ⇔ routeur ⇔ wrangler ⇔ portail ⇔ admin).

## ✅ Vérifié (tests navigateur réels, viewport iPhone)

- **v1** : chargement photo, filtres, sliders, cartoonize, bascule des 3 studios, dessin (encre détectée), timeline de frames, feuille d'export — **0 erreur JS**.
- **v2** : Niveaux, **détourage → transparence confirmée**, dessin, stickers, redimensionnement, **export PNG transparent détecté** — **0 erreur JS**.
- Cohérence domaine : `apps-consistency` **7/7**.

Captures d'écran de preuve générées à chaque test.

*Version 2.0.0 — Studio créatif tout-en-un pour kd-mc.com (studio.kd-mc.com).*
