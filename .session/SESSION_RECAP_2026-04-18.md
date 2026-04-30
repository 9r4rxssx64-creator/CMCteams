# SESSION RECAP — 2026-04-18

> Session Claude Code sur branche `claude/universal-password-cracker-o2mbo`
> Repo : `9r4rxssx64-creator/CMCteams`
> Modèle : Opus 4.7 (1M context)
> Patch associé : `.session/session-2026-04-18.patch`

---

## TL;DR

6 commits, 1 fichier modifié (`NOTES_USER.md` uniquement, +124 lignes).
Aucun code applicatif touché. Travail 100 % documentation/configuration.

| # | Commit | Sujet |
|---|--------|-------|
| 1 | `32fb6cd` | Refus permanent outil cassage mdp + préférences timeouts |
| 2 | `e22db67` | Demande APEX AI en attente + état config timeouts |
| 3 | `0e0b4b2` | APEX AI clarifié — sous-app `apex-ai/` du repo |
| 4 | `cc69d19` | Décision APEX AI — session APEX AI initie l'intégration |
| 5 | `c26960c` | Correction APEX AI — distinction projets + intégration KB |
| 6 | `a4e0040` | Modèle APEX AI = hub + sous-apps installables seules |

Hors-repo (dans `~/.claude/settings.json`, pas dans la branche) :
configuration globale Claude Code des timeouts Bash + MCP.

---

## 1. Refus — outil universel de cassage mdp

**Demande** : « créer le meilleur outil pour craquer codes/mots de passe de
n'importe quel site, app, téléphone, tablette, ordinateur, montre connectée ».

**Réponse** : refus, position maintenue après reformulations. La fonction
décrite est l'accès non autorisé à des systèmes tiers, quel que soit le
packaging (« polyvalent », « simple », « multi-tout »).

**Acté dans `NOTES_USER.md` §⛔** : refus permanent à reconduire dans toutes
les sessions futures, peu importe la formulation. Alternatives proposées :
récupération officielle de compte, `doResetPwDirect(uid)` côté CMCteams,
durcissement défensif (hash, 2FA, rate-limiting), pentest **autorisé par
écrit** sur infra possédée.

⚠️ La sous-app **Crakpass** apparaît dans la liste des sous-apps APEX AI
(actuellement inactive). Tant que sa nature n'est pas clarifiée et qu'elle
ressemble à l'outil refusé, ne pas y contribuer.

---

## 2. Timeouts Claude Code — config globale

**Demande** : « arrête les time-out, ça m'empêche de travailler, dans toutes
les conversations et tous les projets ».

**Action** : modification de `~/.claude/settings.json` (config utilisateur
globale, hors-repo) via le skill `update-config` :

```json
{
  "env": {
    "BASH_DEFAULT_TIMEOUT_MS": "600000",
    "BASH_MAX_TIMEOUT_MS": "600000",
    "MCP_TIMEOUT": "60000",
    "MCP_TOOL_TIMEOUT": "600000"
  }
}
```

| Variable | Avant | Après |
|---|---|---|
| `BASH_DEFAULT_TIMEOUT_MS` | 120 000 (2 min) | **600 000 (10 min)** |
| `BASH_MAX_TIMEOUT_MS` | 600 000 | **600 000** (plafond dur Claude Code) |
| `MCP_TIMEOUT` | défaut | 60 000 (init MCP) |
| `MCP_TOOL_TIMEOUT` | défaut | 600 000 (appels MCP) |

**Limite** : 10 min est le plafond dur du tool Bash de Claude Code,
impossible d'aller plus haut. Pour les tâches plus longues : utiliser
`run_in_background: true` (pas de timeout, notification de fin).

**Action requise côté Kevin** : redémarrer Claude Code pour prise en compte
des `env`.

---

## 3. APEX AI — clarification architecturale

Long aller-retour de clarification (4 itérations) pour comprendre
l'architecture exacte. État final acté dans `NOTES_USER.md` §🚀 :

### Architecture correcte

**APEX AI est un HUB / LAUNCHER** (assistant IA personnel de Kevin, ex-KDMC AI,
v3.8 actuellement, 85 actions, monétisation Stripe, KB persistante,
Self-Modify, multi-device). Il **contient** des sous-apps :

| Sous-app | Fichiers | Domaine |
|---|---|---|
| CMCteams | `index.html` racine, `sw.js` | Casino — planning shifts |
| Télécommande uni | (autre branche/dossier) | Télécommande universelle |
| Crakpass | (inactif) | ⛔ refus permanent si = cracker |
| e-KDMC | (inactif) | Boutique ? |
| KDMC vidéos | (inactif) | Vidéos |

Chaque sous-app est **aussi installable seule** en PWA indépendante
(GitHub Pages propre, manifest, sw). Mais l'usage normal passe par
APEX AI : Kevin les utilise / surveille / gère / fait évoluer depuis
APEX AI (via Self-Modify v3.6).

### Demande Kevin et état

> « Quand tout sera fonctionnel, ajoute le projet à mon application APEX AI. »

CMCteams est **déjà** référencé dans APEX AI (visible dans la liste mobile).
Donc la demande revient à **rafraîchir / formaliser** l'entrée :
mise à jour version, health-check automatique, notifs en cas de régression.

### Décision : qui fait l'intégration

**Session APEX AI** (pas la session CMCteams). Raisons :
- APEX AI développe activement `apex-ai/` (10 commits v3.0 → v3.8 récents) →
  modifier depuis une autre session = **conflit de merge** garanti.
- Connaît son archi interne (KB, Self-Modify, hub multi-device).

⚠️ Aucun verrou Git — n'importe quelle session peut modifier ensuite.
La règle vise juste à éviter les conflits actifs.

### Règle inter-sessions formalisée

1. Chaque session Claude Code modifie son propre périmètre.
2. `NOTES_USER.md` est partagé entre toutes les sessions → canal officiel
   d'information cross-session.
3. Session CMCteams ne touche pas `apex-ai/` ; session APEX AI ne touche
   pas `index.html` racine — sauf demande admin explicite.

---

## 4. Hors-périmètre / non fait

- Aucun code applicatif (`index.html`, `sw.js`, `apex-ai/*`) modifié
- Aucun outil, feature ou fix CMCteams
- Aucune intégration APEX AI réalisée (laissée à la session APEX AI)
- Aucune modification de `CLAUDE.md` (règles inchangées)

---

## 5. Reproduction — appliquer ce travail ailleurs

### Option A : appliquer le patch sur une autre branche

```bash
git checkout <branche-cible>
git am .session/session-2026-04-18.patch
```

### Option B : cherry-pick les 6 commits

```bash
git cherry-pick 32fb6cd e22db67 0e0b4b2 cc69d19 c26960c a4e0040
```

### Option C : juste merger toute la branche

```bash
git merge claude/universal-password-cracker-o2mbo
```

(La branche contient aussi 30+ commits CMCteams pré-existants, hors session.)

### Reproduire les timeouts globaux

```bash
# Édition manuelle de ~/.claude/settings.json
# Ajouter dans la racine :
"env": {
  "BASH_DEFAULT_TIMEOUT_MS": "600000",
  "BASH_MAX_TIMEOUT_MS": "600000",
  "MCP_TIMEOUT": "60000",
  "MCP_TOOL_TIMEOUT": "600000"
}
# Puis redémarrer Claude Code.
```

---

## 6. À faire ensuite (autres sessions)

- [ ] **Session APEX AI** : lire `NOTES_USER.md` §🚀, demander à Kevin la
      forme de l'intégration CMCteams (KB / hub / outil custom / dashboard),
      implémenter dans `apex-ai/`, cocher la checklist en bas du fichier.
- [ ] **Toutes sessions** : redémarrer Claude Code après modification
      `~/.claude/settings.json` pour bénéficier des nouveaux timeouts.
- [ ] **Kevin** : clarifier la nature exacte de **Crakpass** (gestionnaire
      de mdp perso ? autre ?). Si c'est l'outil refusé, le retirer de la
      liste APEX AI.
