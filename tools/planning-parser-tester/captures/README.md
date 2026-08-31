# 🔒 Captures plannings (chiffrées) → Claude

Canal **privé et chiffré** pour que Kevin transmette ses vrais plannings à Claude
sans pouvoir les joindre au chat, et **sans jamais exposer les noms des employés**.

## Comment ça marche

1. Kevin importe un planning dans l'app `tools/planning-parser-tester/`.
2. L'app chiffre `{pdf, texte, résultat}` sur l'appareil (AES-GCM-256 / PBKDF2 200k SHA-256).
3. L'app dépose le fichier **chiffré** `<ts>__<nom>.enc.json` via l'API GitHub
   sur la branche **`planning-captures`** (jamais publiée sur le site Pages).
4. Le dépôt public ne contient que du **chiffré illisible**.

## Côté Claude — déchiffrer

```bash
git fetch origin planning-captures
git checkout origin/planning-captures -- tools/planning-parser-tester/captures
CAP_PASS="phrase-secrète-de-kevin" node tools/planning-parser-tester/captures/decrypt.js
# -> _decrypted/<name>.json (+ <name>.pdf), gitignoré (jamais commité)
```

Vérifier l'algo sans aucune donnée :

```bash
node tools/planning-parser-tester/captures/decrypt.js --selftest
```

## Sécurité

- Jeton GitHub + phrase secrète stockés **uniquement** en localStorage sur l'appareil de Kevin.
- Le dépôt (public) ne reçoit que du chiffré ; `_decrypted/` est **gitignoré**.
- Branche `planning-captures` exclue du déploiement Pages (déclencheur Pages = `main` seul).
- Algo identique app ↔ `decrypt.js` (vérifié par `--selftest`).
