# Feedback Anthropic — Kevin DESARZENS (admin Apex AI)

**Date** : 2026-04-26
**Compte** : kevin.desarzens@gmail.com
**Plan** : (à compléter — Pro / Team / Enterprise)
**Cas d'usage** : Apex AI (PWA assistant IA premium, ~258 employés casino + clients) + CMCteams (planning équipes Casino de Monaco)

---

## Canaux de feedback (à utiliser)

1. **Email support direct** : support@anthropic.com
2. **Page support** : https://support.anthropic.com/
3. **Twitter/X** : @AnthropicAI (réponse souvent rapide, public)
4. **LinkedIn** : Anthropic page
5. **Status page** : https://status.anthropic.com/ (vérifier si timeouts massifs)
6. **Console feedback** : https://console.anthropic.com/feedback

---

## Message à envoyer (français)

Sujet : `Frustration timeouts Claude Code - workflow pro impacté`

```
Bonjour,

Je suis client payant Claude (Pro / Code) et utilise Claude Code intensivement
pour développer 2 applications professionnelles (PWA hébergées GitHub Pages) :
- Apex AI : assistant IA premium pour mes clients
- CMCteams : planning Casino de Monaco (~258 employés)

Je rencontre depuis plusieurs sessions des timeouts répétés sur les agents
(Stream idle timeout - partial response received), ce qui :

1. Me coûte du temps : agents qui timeout après 3-10 min sans avoir fini leur tâche
2. **Me coûte des tokens en PURE PERTE** : agent timeout après avoir consommé
   X tokens d'input/output mais sans livrer le résultat → je dois RE-payer
   les mêmes tokens pour le retry. C'est inadmissible pour un service payant.
3. Bloque mon workflow : impossible de livrer des fixes critiques sécurité
4. Frustre mon utilisation : je paye pour un service censé être fluide et pro

**Demande spécifique sur les tokens** :
- Si un agent timeout, les tokens consommés ne devraient PAS être facturés
  (équivalent d'un produit non livré qu'on ne paie pas)
- OU créditer automatiquement le compte client si la tâche n'aboutit pas
- OU permettre au client de continuer la tâche sans re-consommer les tokens
  déjà payés (resume au lieu de restart)
- Visibilité claire : combien de tokens consommés cette session, ce mois,
  vs combien étaient timeouts non-livrés

Mes attentes en tant que client payant pro :
- Pas de timeouts si la tâche est en cours (extension auto)
- Limites adaptées aux workflows pro intensifs (multi-agent parallèle)
- Visibilité sur mon quota courant (combien de tokens / heures restants)
- Bouton "extend session" si tâche complexe en cours
- Tarif "Power user" ou "Enterprise" pour pro qui n'ont pas ces blocages

Quelle solution proposez-vous pour mon cas ? Je suis ouvert à un upgrade vers
un plan plus permissif si ça résout mon problème.

Cordialement,
Kevin DESARZENS
kevin.desarzens@gmail.com
```

---

## Tweet à publier (mention publique)

```
@AnthropicAI Big fan of @claude_app et Claude Code, mais les timeouts agents
(Stream idle timeout) sont un blocage majeur pour mon workflow pro
(2 PWA en prod). Quelle solution pour les power users qui paient
le service intensivement ? 🙏
```

---

## Ce que j'ai déjà fait côté workaround (Claude Code)

- Lance plusieurs agents en parallèle (max 4-5) au lieu de séquentiel
- Découpe les tâches en mini-chunks pour éviter timeout
- Utilise GitHub Actions automation (auto-merge, smoke test, uptime, auto-bump)
- Push direct main pour fixes critiques (bypass auto-merge si urgent)
- Pre-commit hooks (node --check + 26 tests Apex) pour valider sans rerun
- CLAUDE.md règles permanentes (mémoire totale entre sessions)

---

## Action si pas de réponse dans 7 jours

1. Re-envoyer email avec subject "[RELANCE]"
2. Tweet public mention @AnthropicAI
3. Évaluer alternatives : OpenRouter (multi-provider), Cursor (Claude + autres), Cline (open source)

---

**Fichier inventaire** : ce document est dans le repo CMCteams pour traçabilité.
**Mémoire** : règle CLAUDE.md "Concertation + Mémoire totale" garantit que je m'en
souviens à chaque session.
