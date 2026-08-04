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

### 🕺 Danse IA — photo → vidéo *(la tendance du moment)*
Comme **Viggle / Kling / Hailuo** : tu mets **une photo**, l'app génère une **petite vidéo où le sujet bouge / danse**, façon vidéos virales.
- Ambiances en 1 tap : **Danse**, **Saut de joie**, **Rigolo**, **Coucou**, **Ciné** (+ texte libre).
- Génération asynchrone (≈ 1 à 3 min), aperçu qui se lance tout seul, **Enregistrer / Partager** ou **Regénérer**.
- 100 % serveur (ta clé Replicate), modèle image→vidéo `minimax/video-01-live`. Rien sur le téléphone.

### 🤖 IA (qualité pro) — nouveau
Branchée sur un **worker serveur sécurisé** (ta clé Replicate reste côté serveur, jamais exposée). Repli automatique sur la version hors-ligne si l'IA n'est pas joignable — **l'app marche toujours**.
- **🤖 Détourage IA** — isole automatiquement le sujet (personne / objet), fond transparent parfait (bien mieux que la gomme couleur).
- **🤖 Cartoon IA** — transforme la photo en dessin animé de qualité (vrai style, pas juste posterize).
- **✨ Améliorer (IA)** — upscale ×2 + netteté + amélioration des visages.

### 🎬 Pack créateur pro *(le plus viral 2026)*
- **🎤 Sous-titres karaoké mot-par-mot** (vidéo) — le mot dit est surligné en jaune et agrandi (style TikTok/Hormozi). Styles **Simple / Karaoké / Pop**. Le texte se répartit tout seul sur la durée.
- **🥁 Zoom automatique sur le rythme** (vidéo) — détecte les temps forts de ta musique et fait un punch-in zoom sur le beat.
- **🩹 Tampon correcteur** (photo) — touche une zone saine (source) puis dessine sur le défaut : enlève un bouton, un objet, une tache.
- **😂 Texte meme** (photo) — style Impact blanc contour noir, haut/bas, en 1 tap.

### 🔥 Effets viraux & formats réseaux *(tendances 2026)*
D'après le tour du web des tendances TikTok / Reels / CapCut, ajoutés en qualité max :
- **🔥 Effets Tendance (photo)** : Ciné (teal & orange), **Flou d'arrière-plan** (bokeh portrait), Glow, Light leak, **Duotone**, **Glitch / RGB split**, **VHS / Y2K**, Chroma, Polaroïd — avec **intensité réglable**.
- **📱 Formats réseaux** (photo **et** vidéo) : **9:16** (TikTok/Reels/Shorts), **1:1**, **4:5**, **16:9**, avec **fond flou** tendance (plus de bandes noires), noir ou blanc.
- **🔥 Pack Viral vidéo** : **format vertical 9:16**, **ambiance Grain / VHS / Light leak**, **fondu entrée/sortie**, **sous-titre stylé** (gros, contour épais, style viral).

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

- **Retouche / montage / dessin : tout se passe sur ton téléphone.** Rien n'est envoyé sur Internet, aucun compte, aucune pub, marche hors-ligne.
- **Fonctions IA uniquement** (🤖 Détourage / Cartoon / Améliorer, 🕺 Danse IA) : la photo est envoyée à **ton worker sécurisé** puis à Replicate le temps du traitement (nécessaire — l'IA ne tourne pas sur le téléphone). Ta clé reste côté serveur. Si tu ne cliques pas ces boutons, rien ne part.
- **Aucune dépendance externe** dans l'app : un seul fichier HTML autonome (respecte la règle d'isolation max — ne touche aucune autre app).

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
- **v3** : effets tendance (glitch/ciné/bokeh changent bien l'image), **export vidéo viral 9:16 + grain + fondu → MP4 produit** — **0 erreur JS**.
- **v4** : **texte meme** (encre rendue), **tampon correcteur** (clone), **export vidéo karaoké + zoom sur le beat + 9:16 + musique → MP4** — **0 erreur JS**.
- **v5** : **IA** — succès (image remplacée) + **repli automatique** vérifiés (worker simulé), overlay de chargement OK — **0 exception JS**.
- **v6** : **Danse IA** — photo → génération async → vidéo affichée + feuille d'export, vérifié bout-en-bout (backend simulé) — **0 exception JS**.
- Cohérence domaine : `apps-consistency` **7/7**.

Captures d'écran de preuve générées à chaque test.

## 🤖 Comment marche l'IA (technique)
- Worker Cloudflare **`kdmc-crea-ai`** (isolé, `services/kdmc-crea-ai/`) qui relaie vers **Replicate** — ta clé `AX_REPLICATE_KEY` est injectée en secret serveur par `deploy-kdmc-crea-ai.yml`, **jamais côté client**.
- Modèles : détourage `cjwbw/rembg`, cartoon `catacolabs/cartoonify`, upscale `nightmareai/real-esrgan`, **photo→vidéo `minimax/video-01-live`** (résolus à leur dernière version au runtime — faciles à changer).
- Endpoints : images rapides `POST /cutout|/cartoon|/enhance` (réponse image) ; vidéo `POST /animate` → `GET /job?id=` (async) → `GET /proxy?url=` (enregistrement même-origine).
- CORS limité à `*.kd-mc.com` + GitHub Pages + localhost. `/proxy` n'accepte que `replicate.delivery`.
- **Repli automatique** (images) : réseau/IA KO → version hors-ligne + toast honnête. **Danse IA** ne peut pas se faire hors-ligne (génération) → message clair si indispo.
- URL du worker configurable côté app (`window.CREA_AI_URL` / `localStorage.crea_ai_url`) pour pointer une autre IA sans changer le code.

## 🔭 Prochaines étapes possibles
Déjà livré : IA (détourage/cartoon/upscale), karaoké, zoom-beat, tampon correcteur, meme, effets tendance, formats réseaux. À venir si tu veux : **remplacement de fond IA** (mettre un décor), **speed-ramp**, **export GIF**, **calques complets multi-photos**, **cartoon IA sur vidéo**.

*Version 6.0.0 — Studio créatif tout-en-un + pack viral + créateur pro + IA serveur + Danse IA (photo→vidéo), pour kd-mc.com (studio.kd-mc.com).*
