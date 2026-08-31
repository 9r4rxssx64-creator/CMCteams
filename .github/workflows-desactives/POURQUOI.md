# ⛔ Workflows désactivés — 15/08/2026

Ces workflows **ne s'exécutent plus**. GitHub ne lit que `.github/workflows/`,
donc les déplacer ici suffit à les éteindre. **Rien n'est supprimé** : il suffit
de remettre un fichier dans `.github/workflows/` pour le réactiver.

## Pourquoi

Le compte GitHub de Kevin a été **suspendu**, et le support a refusé de lever la
restriction. Raison donnée mot pour mot :

> *any repositories that use GitHub Actions solely to interact with 3rd party websites, to engage in incentivized activities, or for general computing purposes may fall afoul of the GitHub Additional Product Terms*

(Citation reproduite **sur une seule ligne et sans mise en forme**, pour rester
exactement le texte reçu — un test vérifie qu'on ne l'a pas reformulée.)

Ces 42 workflows correspondaient exactement à cette description : génération
d'images (Replicate, OpenAI), surveillance de sites, pilotage de Railway et
Vercel, sauvegardes Firebase et Cloudflare KV, bulletins d'actualité, photos
Pexels, alertes sismiques… Aucun ne construisait ni ne testait le code du dépôt.

En plus de ça, **toutes** les exécutions programmées (cron) ont été retirées des
workflows restants : on est passé d'environ **97 exécutions par jour à 0**.

## La règle à tenir désormais

GitHub Actions sert à **construire, tester et déployer le code de ce dépôt**.
Rien d'autre.

- ✅ compiler, lancer les tests, publier le site, déployer un Worker
- ❌ appeler des APIs tierces en boucle, surveiller des sites, générer des
  images, faire tourner un robot, sauvegarder autre chose que ce dépôt

Ce qui a besoin de tourner régulièrement doit vivre **ailleurs** : un Cloudflare
Worker avec son propre déclencheur horaire, ou une machine à soi.

**Ne remettez pas de `cron:` dans ce dépôt.** Un test l'empêche désormais.
