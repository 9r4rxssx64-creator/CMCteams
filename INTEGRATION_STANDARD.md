# INTEGRATION_STANDARD.md — Standard universel Kevin DESARZENS

> Standard d'integration applicable a tous les projets (CMCteams, APEX AI, e-KDMC, futurs).
> A fournir a tout nouveau Claude Code pour bootstrapper un projet conforme.

---

## 1. Stack technique recommandee (free tier first)

| Service | Usage | Limite gratuite |
|---------|-------|-----------------|
| **GitHub Pages** | Hebergement statique | Illimite (repos publics) |
| **Cloudflare Workers** | Proxy API / middleware | 100 000 req/jour |
| **Firebase RTDB** | Base de donnees temps reel | 1 GB stockage, 10 GB/mois transfert |
| **Sentry** | Monitoring erreurs | 5 000 events/mois |
| **GitHub Actions** | CI/CD | 2 000 min/mois |
| **Vercel** | Serverless functions / agents | 100 GB-h/mois |
| **Stripe** | Paiement | Pay-as-you-go |

---

## 2. Integration Sentry (monitoring erreurs)

### 2.1 Organisation et projet

- **Organisation Sentry** : `kdmc`
- **Projet browser** : un projet par app (ex: `cmcteams` pour JavaScript vanilla)
- **DSN** : recuperer depuis le dashboard Sentry, JAMAIS hardcoded dans le code source
  - Stocker dans `localStorage` ou variable d'environnement Cloudflare/Vercel

### 2.2 Integration browser (SPA / HTML statique)

Utiliser le **Sentry Loader Script** (lazy-load, zero impact sur les performances initiales) :

```html
<head>
  <!-- Sentry Loader — lazy-load, 0 impact perf -->
  <script
    src="https://js.sentry-cdn.com/XXXXXXXXXXXXXXXX.min.js"
    crossorigin="anonymous"
    defer>
  </script>

  <!-- Preconnect pour accelerer le chargement -->
  <link rel="preconnect" href="https://js.sentry-cdn.com" crossorigin>
  <link rel="dns-prefetch" href="https://js.sentry-cdn.com">
  <link rel="preconnect" href="https://o4509363296296960.ingest.de.sentry.io" crossorigin>
  <link rel="dns-prefetch" href="https://o4509363296296960.ingest.de.sentry.io">
</head>
```

### 2.3 Configuration Sentry (onLoad)

```javascript
Sentry.onLoad(function() {
  Sentry.init({
    tracesSampleRate: 0.1,  // 10% — compatible free tier 5000 events/mois
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    beforeSend(event) {
      // Filtrer les erreurs non pertinentes
      var msg = (event.exception?.values?.[0]?.value || "");
      if (/AbortError|ECONNRESET|ResizeObserver|Script error/i.test(msg)) {
        return null;
      }
      return event;
    }
  });
  // Tags globaux
  Sentry.setTag("component", "browser");
  Sentry.setTag("project", "cmcteams"); // adapter par projet
  // Identifier l'admin
  if (typeof A !== "undefined" && A.user && A.user.id === "U11804") {
    Sentry.setTag("admin", "U11804");
    Sentry.setUser({ id: "U11804", username: "DESARZENS K" });
  }
});
```

### 2.4 Integration Node.js (agents Vercel / Cloudflare Workers)

```javascript
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,  // Variable d'environnement, jamais dans le code
  tracesSampleRate: 0.1,
  beforeSend(event) {
    var msg = (event.exception?.values?.[0]?.value || "");
    if (/AbortError|ECONNRESET|ETIMEDOUT/i.test(msg)) return null;
    return event;
  }
});

Sentry.setTag("component", "agent");
```

### 2.5 CSP (Content Security Policy)

Ajouter ces domaines a la CSP existante :

```
script-src: https://*.sentry-cdn.com
connect-src: https://*.ingest.sentry.io https://*.ingest.de.sentry.io
```

---

## 3. Les 12 regles permanentes

Ces regles s'appliquent a TOUS les projets sans exception.

| # | Regle | Details |
|---|-------|---------|
| 1 | **TodoWrite obligatoire** | Chaque demande utilisateur = un item TodoWrite immediat |
| 2 | **Subagents paralleles** | Audits via N subagents Explore sur zones distinctes |
| 3 | **Syntax check + tests AVANT commit** | `node --check`, tests unitaires, zero erreur |
| 4 | **Matrice d'impact** | Identifier toutes les vues/fonctions affectees avant de coder |
| 5 | **Edge cases** | iOS Safari, localStorage quota, Firebase offline, PWA |
| 6 | **esc() obligatoire** | Toute donnee utilisateur echappee avant `innerHTML` |
| 7 | **Zero cle API dans le code** | localStorage, env vars, ou Cloudflare Secrets uniquement |
| 8 | **Validation post-commit** | Relire le diff, verifier le deploiement, tester le rendu |
| 9 | **Auto-audit apres chaque batch** | Chercher activement les bugs, ne pas attendre le signalement |
| 10 | **Mobile-first (375px min)** | iPhone SE comme viewport de reference |
| 11 | **Tout en francais** | UI, commentaires, noms de commits, documentation |
| 12 | **Batching PRs** | 5-10 fixes par PR, pas 1 PR par fix (eviter le bruit) |

---

## 4. Templates standards

### 4.1 Template commit message

```
vX.Y: description courte en francais

Corps optionnel si besoin de details.
```

Exemples :
- `v9.104: integration Sentry monitoring erreurs`
- `v2.1: fix scroll horizontal planning mobile`
- `v3.0: nouveau module export PDF`

### 4.2 Template PR body

```markdown
## Objectif
Description concise du but de cette PR (1-2 phrases).

## Changements
- Point 1
- Point 2
- Point 3

## Validation
- [ ] Syntax check JS OK
- [ ] Test mobile 375px
- [ ] Pas de regression (git diff verifie)
- [ ] esc() sur toutes les donnees utilisateur
- [ ] Pas de cle API dans le code

## Prerequis
Dependances ou configuration necessaire (ou "Aucun").
```

### 4.3 Template CLAUDE.md pour nouveau projet

```markdown
# CLAUDE.md — [NOM DU PROJET]

## Vue d'ensemble
- **Projet** : [description]
- **Owner** : Kevin DESARZENS (kevind@monaco.mc)
- **Version** : v1.0
- **Stack** : [GitHub Pages / Firebase / Cloudflare / Sentry]

## Architecture
[Description de la structure du projet]

## Regles
Voir INTEGRATION_STANDARD.md pour les 12 regles permanentes.

## Constantes
[Variables globales, IDs admin, URLs]

## Erreurs connues
[Liste des bugs connus a ne pas reproduire]

## Historique versions
| Version | Changements |
|---------|-------------|
| v1.0    | Version initiale |
```

### 4.4 Template manifest.json (PWA)

```json
{
  "name": "[Nom complet de l'app]",
  "short_name": "[Nom court]",
  "description": "[Description]",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a1a2e",
  "theme_color": "#c9a84c",
  "orientation": "any",
  "icons": [
    { "src": "icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### 4.5 Template proxy Cloudflare Workers

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const API_KEY = env.API_KEY; // Cloudflare Secret, JAMAIS dans le code

    // CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    // Proxy vers l'API cible
    const resp = await fetch("https://api.example.com/endpoint", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + API_KEY
      },
      body: request.body
    });

    return new Response(resp.body, {
      status: resp.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
};
```

### 4.6 Template Service Worker (cache offline)

```javascript
var CACHE = "app-v1";
var URLS = ["/", "/index.html", "/icon-192.png"];

self.addEventListener("install", function(e) {
  e.waitUntil(caches.open(CACHE).then(function(c) { return c.addAll(URLS); }));
  self.skipWaiting();
});

self.addEventListener("activate", function(e) {
  e.waitUntil(
    caches.keys().then(function(ks) {
      return Promise.all(ks.filter(function(k) { return k !== CACHE; })
        .map(function(k) { return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function(e) {
  e.respondWith(
    caches.match(e.request).then(function(r) {
      return r || fetch(e.request).then(function(resp) {
        if (resp.status === 200) {
          var cl = resp.clone();
          caches.open(CACHE).then(function(c) { c.put(e.request, cl); });
        }
        return resp;
      });
    }).catch(function() {
      return caches.match("/index.html");
    })
  );
});
```

---

## 5. Comment utiliser ce standard

### Pour un nouveau projet

Donner cette instruction a Claude Code :

> Applique la stack universelle du fichier `INTEGRATION_STANDARD.md` — integre
> Sentry, les 12 regles permanentes, et tous les templates dans ce projet.

### Pour un projet existant

> Lis `INTEGRATION_STANDARD.md` et fais un audit de conformite :
> quelles regles sont deja en place, lesquelles manquent ?
> Propose un plan d'integration par priorite.

### Checklist d'integration

- [ ] CLAUDE.md cree avec le template section 4.3
- [ ] manifest.json PWA en place (section 4.4)
- [ ] Service Worker enregistre (section 4.6)
- [ ] Sentry Loader integre dans le HTML (section 2.2)
- [ ] Sentry configure (tracesSampleRate 0.1, filtres, tags) (section 2.3)
- [ ] CSP mise a jour pour Sentry (section 2.5)
- [ ] Proxy Cloudflare Workers si API externe (section 4.5)
- [ ] Firebase RTDB si sync temps reel necessaire
- [ ] Les 12 regles documentees dans CLAUDE.md du projet
- [ ] Premier commit au format `v1.0: description` (section 4.1)

---

## 6. Contacts et references

- **Owner** : Kevin DESARZENS — kevind@monaco.mc
- **Admin ID** : U11804
- **Organisation Sentry** : kdmc
- **Repo principal** : github.com / CMCteams
- **Regles globales Claude** : `~/.claude/CLAUDE.md`
- **Notes metier** : `NOTES_USER.md` (par projet)

---

*Derniere mise a jour : 2026-04-18 — base sur PRs #82, #83, #84 CMCteams*
