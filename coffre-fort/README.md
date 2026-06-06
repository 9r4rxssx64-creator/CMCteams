# 🔐 Coffre-fort perso — Kevin

Coffre-fort personnel **ultra-sécurisé**, page autonome, isolée du reste des projets.

**Lien live** (après déploiement) : https://9r4rxssx64-creator.github.io/CMCteams/coffre-fort/

## Ce que c'est
Un coffre chiffré de **bout en bout** (zero-knowledge) pour stocker codes, documents,
infos bancaires, photos et dossiers — de **n'importe quelle taille** — et y accéder
depuis **tous tes appareils**.

## Sécurité (le serveur ne voit JAMAIS tes données en clair)
- Chiffrement **AES-GCM-256**, clé dérivée par **PBKDF2 SHA-256 (200 000 itérations)**.
- La **phrase secrète maître** ne quitte jamais l'appareil. Si tu l'oublies, personne ne peut récupérer les données.
- **Face ID / Touch ID** auto à partir de la 2ᵉ connexion (PRF WebAuthn), **PIN** en secours, **phrase secrète** toujours possible.
- Verrouillage auto (5 min d'inactivité + appli cachée), presse-papiers **effacé après 30 s**, **kill-switch** (efface l'appareil, garde le cloud).
- Journal d'accès chaîné (anti-altération). Aucune donnée en clair en mémoire locale.
- Avertissements : ne jamais stocker un CVV complet ni une seed phrase crypto.

## Sections
🔑 Codes & Identifiants · 🏦 Banque · 📄 Documents · 📷 Photos · 📁 Dossiers · 📝 Notes.
Le contenu collé est **classé automatiquement** (clé API, IBAN, lien… détectés).

## Stockage (3 couches, tout chiffré)
- **Local** : localStorage + IndexedDB (gros fichiers).
- **Cloud Firebase** (chemin isolé `coffre_vault/<uid>`) : index + fichiers ≤ 5 Mo → multi-appareils.
- **Cloud R2** (worker `coffre-r2`) : fichiers de **toute taille** → multi-appareils.

## Fichiers
| Fichier | Rôle |
|---|---|
| `coffre-fort/index.html` | L'application (autonome, CSS+JS inline) |
| `coffre-fort/config.json` | Config auto (URL worker R2 remplie par le workflow) |
| `coffre-fort/sw.js`, `manifest.json` | PWA installable + cache offline |
| `coffre-fort/memo/01-secrets-github.pdf` | Mémo : tous les secrets GitHub (champs remplissables) |
| `coffre-fort/memo/02-liens-utiles.pdf` | Mémo : dashboards/consoles/billing |
| `coffre-fort/memo/03-liens-projets.pdf` | Mémo : repos + URL live de tous les projets |
| `tools/memo-pdf/generate_pdfs.py` | Générateur des 3 PDF |
| `services/coffre-r2/` | Worker Cloudflare R2 (upload/download chiffré) |
| `.github/workflows/deploy-coffre-r2.yml` | Crée le bucket + déploie + écrit l'URL dans config.json (auto) |
| `tests/coffre/e2e.test.mjs` | Test réel Playwright (crypto + setup + lock/unlock + persistance) |

## Tests réels
`node tests/coffre/e2e.test.mjs` → 9/9 ✅ (round-trip crypto, création, ajout, verrou, reload, déverrouillage, rejet mauvaise phrase).

## Déploiement R2 (autonome)
Au push, `deploy-coffre-r2.yml` crée le bucket `coffre-vault` (`wrangler r2 bucket create`),
déploie le worker, vérifie `/health`, puis **commit l'URL dans `config.json`**. Zéro action manuelle
(nécessite les secrets GitHub `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`, déjà présents).
