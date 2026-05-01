# NOTES_USER.md — e-KDMC Mémoire persistante

> Infos métier Kevin DESARZENS. Lu au début de CHAQUE session.
> Dernière mise à jour : 2026-04-18

---

## Règles de travail ABSOLUES (Kevin, 2026-04-18)

1. **JAMAIS de timeout** — découper les gros fichiers en morceaux, utiliser des scripts générateurs Node.js au lieu d'écrire des fichiers géants directement
2. **Continuer même quand Kevin se déconnecte** — tant que pas terminé, continuer
3. **100 produits MINIMUM par boutique** — professionnel, pas de prototype
4. **Tout automatisé** — factures, onboarding, paiements, remboursements, emails, suivi, rapports
5. **Avant chaque action** : Analyser → Planifier → Tests → Implémenter → Valider
6. **Agents en autonomie** — ne pas attendre, ne pas couper, continuer des deux côtés
7. **Anti-timeout** : découper en chunks, scripts générateurs, jamais de Write >50KB d'un coup

## Boutiques à créer

| Store | Niche | Thème | Produits min |
|-------|-------|-------|-------------|
| Digital Vault | Produits numériques | Noir + Or #D4AF37 | 100+ |
| Tech Hub | Accessoires tech | Bleu foncé #0f172a + Bleu électrique #3b82f6 | 100+ |
| Glow Wellness | Beauté/bien-être | Crème #faf5ef + Vert sauge #6b7c5e | 100+ |
| Pawsome | Animaux | Orange chaud #f97316 + Bleu ciel | 100+ |
| EcoCraft | Éco-responsable | Vert forêt #166534 + Beige | 100+ |

## Architecture APEX — Hub central (Kevin, 2026-04-18)

**APEX** = Super-application centrale qui intègre et pilote TOUS les projets Kevin :

| App | Fonction | Standalone | Intégré APEX |
|-----|----------|-----------|-------------|
| **CMCteams** | Planning casino SBM | ✅ Oui | ✅ Oui |
| **e-KDMC** | Boutiques e-commerce (5 stores) | ✅ Oui | ✅ Oui |
| **Télécommande Uni** | Contrôle universel | ✅ Oui | ✅ Oui |
| **CrackPass** | Gestionnaire mots de passe | ✅ Oui | ✅ Oui |
| **IA-KDMC** | Assistant IA personnel | ✅ Oui | ✅ Oui |

**Principes APEX :**
- Chaque app fonctionne en **standalone** ET intégrée dans APEX
- Depuis APEX, Kevin peut : **modifier, faire évoluer, améliorer** chaque app
- APEX sert de : **utilisation, surveillance, gestion** centralisée
- Dashboard unifié avec vue sur toutes les apps
- Notifications cross-apps
- Single Sign-On (un seul login pour tout)

## Budget

- €100 par boutique maximum au démarrage
- Tout gratuit autant que possible (Netlify, Brevo, Firebase free tier)
