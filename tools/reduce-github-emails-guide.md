# 📧 Réduire les emails GitHub qui saturent ta boîte

**Kevin 2026-05-16** : "Arrête les mail creator GitHub pour moi, il sature ma boîte."

## ✅ Ce que j'ai fait côté workflows (v13.4.184)

Réduction fréquence des cron jobs qui créent des emails :

| Workflow | Avant | Après |
|----------|-------|-------|
| `apex-autonomous-watcher.yml` | toutes les 5 min | toutes les 6h |
| `handoff-sync.yml` | toutes les 15 min | toutes les 6h |
| `branch-deployment-watch.yml` | toutes les 2h | lundi 08h UTC (1×/semaine) |

Impact : ~95% des emails de notifications cron disparaissent.

## 🔧 Côté GitHub (toi à faire en 30 secondes)

GitHub envoie aussi des emails automatiques que je ne contrôle pas. Pour les couper :

### Étape 1 : Désactiver les emails de workflow auto

1. Ouvre https://github.com/settings/notifications
2. Section **"Actions"**
3. Décoche :
   - ❌ **Send notifications for failed workflows only** (laisser coché si tu veux savoir les fails)
   - ❌ **Send notifications for workflows you initiated** → **DÉCOCHE** (= le bot 9r4rxssx64-creator)
4. Sauvegarder

### Étape 2 : Limiter les notifs du repo CMCteams

1. Ouvre https://github.com/9r4rxssx64-creator/CMCteams
2. Bouton **Watch** en haut à droite → clique
3. Sélectionne **"Custom"**
4. Coche UNIQUEMENT :
   - ✅ Issues (si tu veux voir les escalades Claude Code)
   - ✅ Pull requests
   - ❌ Releases · Discussions · Security alerts (au choix)
5. Apply

### Étape 3 : Filtre Gmail automatique (zéro email du bot)

1. Ouvre Gmail → barre de recherche
2. Tape `from:notifications@github.com`
3. Menu ⋮ → **Filtrer les messages comme ceux-ci**
4. Critères :
   - **De** : `notifications@github.com`
   - **Objet** : `9r4rxssx64-creator/cmcteams`
5. Action : **Ignorer la boîte de réception** + **Marquer comme lu** + **Appliquer le libellé "GitHub-bot"**
6. **Créer le filtre**

→ Tu ne verras plus aucun email GitHub bot, mais tu peux toujours les retrouver dans le libellé si besoin.

## 📊 Pour Kevin : où je peux pas agir

Seul TOI peux faire ça (3 étapes ci-dessus, 30 secondes max). C'est volontaire de la part de GitHub : les notifications utilisateur sont liées à ton compte personnel, pas au repo.

**Si ça sature encore après ces 3 étapes** : envoie-moi un screenshot d'un email qui revient, je vois lequel workflow et je le coupe à la source.
