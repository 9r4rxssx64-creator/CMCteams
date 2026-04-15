# e-KDMC — Création commerce en ligne automatisé

Projet de Kevin DESARZENS (U11804 · kevind@monaco.mc).
Créé le 2026-04-13. **Pas encore commencé** — l'admin dira quand démarrer.

---

## 🎯 Objectif (à préciser avec l'admin au démarrage)

Commerce en ligne **automatisé** (dropshipping ? print-on-demand ? SaaS ?).
Nature exacte à définir au premier message :

- Quel produit / service vendu ?
- Audience cible ?
- Plateforme (Shopify / WooCommerce / custom ?)
- Paiement (Stripe / PayPal / Monabanq ?)
- Fournisseur / stock (dropshipping AliExpress ? fournisseur local SBM ?)
- Automatisations clés : commandes, SAV, marketing, facturation
- Langues (FR/EN/IT comme CMCteams ?)
- Intégration IA (IA-KDMC pour SAV automatique, génération contenus ?)

---

## 👤 Identité admin

- **Nom** : Kevin DESARZENS
- **Matricule SBM** : U11804
- **Email** : kevind@monaco.mc
- **Localisation** : Monaco / Monte-Carlo
- **Préfix projets** : KDMC

Voir `~/.claude/CLAUDE.md` pour les méta-règles globales.

---

## 🚨 MÉTA-RÈGLES PERMANENTES (comme les autres projets Kevin)

1. **Toute info métier = enregistrée immédiatement** dans ce CLAUDE.md
2. **Tout doit être AUTOMATISÉ** au maximum (le nom du projet le dit)
3. **Boutons manuels admin** en secours pour chaque automatisation
4. **Backup cloud** des configs sensibles (clés API Stripe, etc.)
5. **Clés API jamais dans le repo** — variables d'environnement / vault
6. **UX simple, visuel, ludique** (même règle que CMCteams)
7. **Erreurs connues documentées** ici
8. **TodoWrite obligatoire**
9. **Tests + validation avant push**
10. **Branche unique `main`**

---

## ⚙️ Automatisations à prévoir (checklist de démarrage)

- [ ] Import catalogue produits (CSV ? API fournisseur ?)
- [ ] Synchro stock temps réel
- [ ] Commandes → notification fournisseur auto
- [ ] Tracking colis auto (17track / AfterShip)
- [ ] Emails transactionnels (achat, expédition, livraison) automatiques
- [ ] SAV IA (via IA-KDMC ?)
- [ ] Facturation auto (PDF conforme MC/FR/UE)
- [ ] Comptabilité auto (export compta)
- [ ] Marketing auto (abandon panier, remarketing)
- [ ] Analytics dashboard admin
- [ ] Multi-devises (EUR / USD / GBP)
- [ ] Multi-langues (FR/EN/IT)
- [ ] TVA/fiscalité Monaco (spécificités)
- [ ] RGPD / CNIL (cookies, données clients)

---

## 🛡 Erreurs à NE PAS reproduire (hérités de CMCteams + nouvelles e-commerce)

1. **Pas de clé API Stripe / paiement en clair** dans le code/commits
2. **Toujours `.catch()` sur `fetch()`** (hérité CMCteams Safari iOS)
3. **Webhooks payment = idempotents** (signature Stripe à vérifier)
4. **Pas de prix calculés côté client** → toujours serveur pour éviter fraude
5. **Stock décrémenté avec transaction atomique** (pas de double-vente)
6. **Emails transactionnels = queue + retry** (pas de fire-and-forget)
7. **Logs d'audit sur chaque commande** (RGPD + compta)
8. **Backup DB quotidien automatique**
9. **Monitoring uptime + alertes** admin en cas de crash
10. **Tests de paiement en mode test Stripe avant prod**

---

## 💰 Considérations Monaco / SBM

- **Fiscalité Monaco** : pas de TVA personne physique mais TVA entreprise
- **Commerce électronique Monaco** : déclaration Direction du Développement Économique
- **Si Kevin vend à titre personnel** : micro-entreprise française possible ?
- **Monaco = pays tiers UE** : règles OSS/IOSS à vérifier pour clients UE
- **Stripe Monaco** : supporté (via entité FR ou équivalent)

---

## 📋 Stack technique candidate (à valider)

| Besoin | Option 1 (rapide) | Option 2 (custom) |
|---|---|---|
| Frontend | Shopify theme | Next.js + Tailwind |
| Backend | Shopify / WooCommerce | Node.js + Stripe |
| Paiement | Stripe Checkout | Stripe Elements custom |
| Emails | Shopify natif | Resend / SendGrid |
| SAV IA | Shopify Inbox + Kindred | IA-KDMC custom |
| Hébergement | Shopify cloud | Vercel / Cloudflare |
| DB | Shopify | PostgreSQL (Neon / Supabase) |
| Analytics | Shopify Analytics | Plausible + custom |

---

## 📋 Journal des décisions

*(à remplir au fil du projet)*

---

## 🔮 À préciser au démarrage

- [ ] Nom commercial (marque) + nom de domaine
- [ ] Catégorie produits
- [ ] Business model (marges, volumes cibles)
- [ ] Statut juridique (Monaco, France, autre ?)
- [ ] Stripe / autre PSP
- [ ] Hébergement
- [ ] Intégration IA-KDMC (SAV automatique, générations produits ?)
- [ ] Intégration CMCteams (emails corpo ? SSO ?)

---

*Dernière mise à jour : 2026-04-13 (création initiale, projet pas encore démarré)*
