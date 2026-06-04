# 🏭 Configuration Printify — La Détente (pas à pas)

Boutique connectée : **« My new store »** (shop_id `27791653`). Clé API : déjà en place (worker).
Fais ces réglages **dans ton compte Printify** (je ne peux pas les cliquer à ta place).

> Ordre conseillé : 1 → 2 → 3 d'abord (indispensables pour vendre), le reste ensuite.

---

## 1. 💳 Moyen de paiement (INDISPENSABLE pour produire)
Sans carte, Printify ne peut pas fabriquer les commandes.
- Va dans **Settings → Payment** : https://printify.com/app/account/payment
- Ajoute une **carte bancaire** (c'est toi qui paies le coût de production + livraison à chaque commande validée).
- Tu peux aussi créditer un **solde** (wallet) pour aller plus vite.

## 2. ✅ Approbation des commandes = MANUELLE (recommandé pour démarrer)
Pour valider/payer chaque vente toi-même (cohérent avec PayPal/Revolut/virement).
- **Settings → Orders** (ou réglage de la boutique) → mettre **« Manual approval »** (ne pas auto-fulfill).
- Ainsi chaque commande arrive en **on-hold**, tu la valides après avoir reçu le paiement client.

## 3. 🏷️ Marque blanche (branding — colis au nom de La Détente)
Pour que le client reçoive un colis « La Détente », jamais « Printify ».
- **Settings → Branding** : https://printify.com/app/account/settings
- Mets le **logo La Détente**, l'**expéditeur** = La Détente, un petit **message** sur le bon de livraison.
- Active « **packing slip** » personnalisé.

---

## 4. 🇪🇺 Choix de l'atelier (print provider) — livraison France/Monaco
Pour chaque produit, Printify propose plusieurs ateliers. Choisis-en un **en Europe**.
- Privilégie un atelier **UE** (ex. *Printify Choice EU*, *SwiftPOD*, *Stanley/Stella* pour le bio) → livraison plus rapide + frais de port plus bas vers la France/Monaco.
- Évite les ateliers **US/Chine** (port long + douane).

## 5. 🧾 Taxes / TVA
- **Settings → Taxes** : renseigne ta situation (Monaco/France). Printify peut gérer la collecte selon le pays.

## 6. 📮 Adresse expéditeur / retour
- **Settings → Account** : adresse de retour (sinon celle de l'atelier par défaut).

## 7. 🔑 Vérifier la connexion API (déjà OK normalement)
- **Settings → Connections → API** : le token doit être **actif**. C'est lui qui alimente le worker des commandes + le bouton « Coût réel ».

## 8. 🏪 (Option) Renommer la boutique
- La boutique s'appelle « My new store » → tu peux la renommer **« La Détente »** dans les réglages boutique (cosmétique).

---

## 🔄 Le flux complet une fois configuré
1. Client achète sur ta boutique → te paie (PayPal / Revolut / virement).
2. La commande arrive dans Printify (**on-hold**).
3. Tu **valides** la commande → Printify débite ta carte (coût prod + port).
4. Printify **fabrique et expédie** au client, en **marque blanche**.
5. Ta **marge** = prix client − coût Printify − port − frais de paiement.

## ✅ Checklist 1ʳᵉ vente
- [ ] Carte de paiement ajoutée (étape 1)
- [ ] Approbation manuelle activée (étape 2)
- [ ] Branding / marque blanche (étape 3)
- [ ] Atelier UE choisi sur tes produits (étape 4)
- [ ] 1 produit publié depuis l'admin de la boutique
- [ ] 1 commande test passée → validée dans Printify

> Liens directs : [Paiement](https://printify.com/app/account/payment) · [Réglages compte/branding](https://printify.com/app/account/settings) · [Mes commandes](https://printify.com/app/orders) · [Mes produits](https://printify.com/app/products)
</content>
