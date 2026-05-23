# 🔒 Règles Firebase pour KDMC Shops Dashboard

> **Une seule action manuelle Kevin, 30 secondes max.** Tout le reste est automatique.

Le dashboard `shops/dashboard/` lit en temps réel les commandes que les 5 boutiques poussent dans Firebase Realtime Database, dans le chemin **isolé** :

```
cmcteams-c16ab-default-rtdb / shops_admin_v1 / orders / <boutique> / <orderId>
```

**Aucune donnée client (email, adresse, CB) n'est envoyée** — uniquement les méta-commandes (ID, total, méthode de paiement, articles, timestamp).

---

## Étape unique : déployer les règles

1. Va sur **https://console.firebase.google.com**
2. Sélectionne le projet `cmcteams-c16ab` (CMCTeams)
3. **Realtime Database → Règles**
4. Colle (ou fusionne avec l'existant) le bloc ci-dessous :

```json
{
  "rules": {
    "shops_admin_v1": {
      "orders": {
        ".read": true,
        "$shop": {
          ".validate": "$shop.matches(/^(tech-hub|chez-lolo|ecocraft|digital-vault|pawsome)$/)",
          "$orderId": {
            ".write": "!data.exists() && newData.hasChildren(['orderId','shop','total','ts'])",
            ".validate": "newData.child('total').isNumber() && newData.child('total').val() >= 0 && newData.child('total').val() < 100000 && $orderId.length <= 40"
          }
        }
      }
    }
  }
}
```

5. Clique **Publier**.

C'est tout. Les commandes commenceront à apparaître dans le dashboard en temps réel.

---

## Ce que ces règles garantissent

- ✅ **Anonyme peut écrire** une nouvelle commande (parce que les boutiques sont publiques).
- ❌ **Personne ne peut modifier ou supprimer** une commande existante (`!data.exists()`).
- ❌ **Personne ne peut écrire** dans un shop inconnu (regex whitelist des 5 boutiques).
- ✅ **Schéma strict** : `orderId`, `shop`, `total` obligatoires, `total` ∈ [0, 100 000].
- ✅ **Lecture publique** pour que le dashboard affiche les commandes (acceptable car aucune PII).
- ✅ **Isolation totale** : ces règles n'affectent QUE le chemin `shops_admin_v1` — `cmc_*`, `apex_*`, `ax_*` et tout le reste de la base ne sont jamais touchés.

---

## Sécurité du dashboard

L'écran admin lui-même est protégé par **PIN PBKDF2 200k itérations**, session 8 h, rate-limit progressif (5 fails → 30 s, 6 → 2 min, 7 → 10 min, 8 → 1 h, 9 → 24 h).

PIN par défaut au premier lancement : **`200807`**. À changer dans `Paramètres → Changer le PIN admin` dès la première connexion.

Hash + sel stockés en localStorage isolé sous le préfixe `shops_admin_*` (zéro collision avec d'autres projets).
