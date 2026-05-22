# Regles de Securite

- esc() sur TOUTE donnee utilisateur avant innerHTML
- Guards admin : if(!K.user||K.user.role!=="admin") return;
- API keys jamais dans le code, toujours localStorage ou Cloudflare Secrets
- Sandbox iframe pour execution de code (sandbox="allow-scripts")
- CSP restrictif sur toutes les pages
- Rate limiting sur les endpoints sensibles
- Chiffrement des donnees sensibles
- Session TTL avec expiration automatique
- Audit log de toutes les actions sensibles
- Bouton ON/OFF sur chaque fonction sensible
- Kill switch global (tout couper en 1 clic)

---

## OWASP Top 10:2025 — À FAIRE / À NE PAS FAIRE

Référence officielle de sécurité applicative. À vérifier à chaque feature et à chaque audit.

### A01 — Broken Access Control (contrôle d'accès cassé)
- ✅ À FAIRE : vérifier les droits côté serveur/worker à CHAQUE requête ; guards `isAdmin` lus de la bonne source ; deny by default.
- ❌ À NE PAS FAIRE : se fier au masquage UI ; faire confiance à un `role` envoyé par le client ; IDs séquentiels devinables sans contrôle de propriété.

### A02 — Security Misconfiguration (mauvaise configuration)
- ✅ À FAIRE : CSP stricte, headers sécurité, comptes/clés par défaut retirés, messages d'erreur sans stack trace côté user.
- ❌ À NE PAS FAIRE : laisser un mode debug en prod ; CSP permissive `unsafe-inline` ; buckets/Firebase rules ouverts.

### A03 — Software Supply Chain Failures (chaîne d'approvisionnement)
- ✅ À FAIRE : vérifier chaque dépendance/skill/repo tiers (CVE, dernière maj, sérieux) AVANT install ; lockfiles ; `npm audit`.
- ❌ À NE PAS FAIRE : installer un repo « 192k★ record + Discord » sans vérif ; copier du code tiers à l'aveugle ; CDN non épinglé.

### A04 — Cryptographic Failures (échecs cryptographiques)
- ✅ À FAIRE : AES-GCM 256 + PBKDF2 (≥100k) ; HTTPS partout ; secrets chiffrés au repos.
- ❌ À NE PAS FAIRE : secrets en clair (localStorage/logs/Firebase) ; XOR/obfuscation maison comme « crypto » ; hash faible.

### A05 — Injection (XSS, SQL, command)
- ✅ À FAIRE : `esc()` sur TOUTE donnée user avant innerHTML ; requêtes paramétrées ; valider/échapper aux frontières.
- ❌ À NE PAS FAIRE : `innerHTML` avec contenu user/IA non échappé ; concaténer une commande shell avec une entrée user.

### A06 — Insecure Design (conception non sûre)
- ✅ À FAIRE : penser la sécurité dès la conception (threat model) ; limites métier (montants, quotas) ; principe du moindre privilège.
- ❌ À NE PAS FAIRE : « on sécurisera après » ; une protection qui désactive une fonction légitime (cf. règle PROTECTION ≠ STABILITÉ).

### A07 — Authentication Failures (échecs d'authentification)
- ✅ À FAIRE : login prénom+nom+code obligatoires ; rate-limit progressif ; PIN per-user ≠ PIN admin global ; session TTL.
- ❌ À NE PAS FAIRE : match substring sur 1 token court ; écrire un PIN user dans la clé admin globale ; pas de verrouillage après N échecs.

### A08 — Software or Data Integrity Failures (intégrité logiciel/données)
- ✅ À FAIRE : audit log immuable + détection de tampering ; vérifier l'intégrité des updates ; build depuis `dist/` jamais la source.
- ❌ À NE PAS FAIRE : déployer un build non vérifié ; auto-update sans contrôle ; désérialiser des données non fiables.

### A09 — Security Logging & Alerting Failures (journalisation/alerte)
- ✅ À FAIRE : logger les actions sensibles (login, échec, action admin) ; alerter sur anomalie ; détailler la CAUSE EXACTE de chaque erreur.
- ❌ À NE PAS FAIRE : avaler une erreur dans un `catch` muet ; logger des secrets en clair ; aucun signal sur 5+ échecs de login.

### A10 — Mishandling of Exceptional Conditions (gestion des cas exceptionnels)
- ✅ À FAIRE : gérer tous les chemins d'erreur ; fail-safe (refuser par défaut si état incertain) ; message user clair + cause technique loggée.
- ❌ À NE PAS FAIRE : laisser une exception non gérée ; fail-open (autoriser en cas de doute) ; afficher une erreur technique brute à l'user.
