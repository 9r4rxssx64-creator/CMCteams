/* KDMC APEX — Centre de contrôle (liens 1-clic, par famille).
   Réservé Kevin / Lolo. Tout est fail-open (anti-lockout, règles #81/#98) :
   - session d'un AUTRE client connu  -> verrouillé (il ne voit pas ton infra)
   - aucune session / SSO indisponible -> affiché (jamais de verrouillage pour toi)
   Aucun secret ici : uniquement des liens vers TES tableaux de bord.
   Les URLs externes sont les adresses OFFICIELLES connues des fournisseurs
   (non re-vérifiées en live depuis cet environnement — voir note de bas de page). */
(function () {
  'use strict';

  var GH = 'https://github.com/9r4rxssx64-creator/cmcteams';
  var PAGES = 'https://9r4rxssx64-creator.github.io/CMCteams';
  var CF = 'https://dash.cloudflare.com/?to=/:account';
  var WK = function (name) { return 'https://' + name + '.9r4rxssx64.workers.dev'; };
  var FB = 'https://console.firebase.google.com/project';

  /* ---- Données : familles de liens ---- */
  var DATA = [
    {
      title: '🎰 Mes apps', sub: 'Ouvrir une app en 1 clic',
      items: [
        { ic: '📅', nm: 'CMCteams', ds: 'Plannings & équipes — Casino de Monaco', url: 'https://cmcteams.kd-mc.com/' },
        { ic: '🤖', nm: 'Apex AI', ds: 'Assistant IA — chat, studios, coffre', url: 'https://apex-ai.kd-mc.com/' },
        { ic: '💬', nm: 'Apex Chat', ds: 'Messagerie chiffrée de bout en bout', url: 'https://apex-chat.kd-mc.com/' },
        { ic: '🏠', nm: 'Portail KDMC', ds: 'Page d’accueil du domaine', url: 'https://kd-mc.com/' }
      ]
    },
    {
      title: '🛍️ Boutiques & back-office', sub: 'Vitrines, studios & administration',
      items: [
        { ic: '🏬', nm: 'Portail boutiques', ds: 'Toutes les boutiques', url: PAGES + '/shops/' },
        { ic: '📊', nm: 'Dashboard boutiques', ds: 'Commandes · produits · stats · finances', url: 'https://dashboard.kd-mc.com/' },
        { ic: '📦', nm: 'Sourcing fournisseurs', ds: 'Catalogues — choisir quoi vendre', url: 'https://sourcing.kd-mc.com/' },
        { ic: '🎨', nm: 'Chez Lolo', ds: 'Boutique & studio de création', links: [
          { l: 'Boutique', u: 'https://chez-lolo.kd-mc.com/' },
          { l: 'Studio', u: 'https://chez-lolo.kd-mc.com/studio.html' }
        ] },
        { ic: '🌿', nm: 'La Détente', ds: 'Boutique & studio (POD)', links: [
          { l: 'Boutique', u: 'https://la-detente.kd-mc.com/' },
          { l: 'Studio', u: 'https://la-detente.kd-mc.com/studio.html' }
        ] }
      ]
    },
    {
      title: '🔑 Clés API & IA', sub: 'Pour chaque service : clés · solde/usage · recharger',
      items: [
        { ic: '🟣', nm: 'Anthropic (Claude)', ds: 'ANTHROPIC_API_KEY', links: [
          { l: 'Clés', u: 'https://console.anthropic.com/settings/keys' },
          { l: 'Solde/Usage', u: 'https://console.anthropic.com/settings/usage' },
          { l: 'Recharger', u: 'https://console.anthropic.com/settings/billing' }
        ] },
        { ic: '🟢', nm: 'OpenAI', ds: 'OPEN_AI_API_KEY', links: [
          { l: 'Clés', u: 'https://platform.openai.com/api-keys' },
          { l: 'Usage', u: 'https://platform.openai.com/usage' },
          { l: 'Recharger', u: 'https://platform.openai.com/settings/organization/billing/overview' }
        ] },
        { ic: '🔵', nm: 'Google Gemini', ds: 'GEMINI_API_KEY', links: [
          { l: 'Clés', u: 'https://aistudio.google.com/app/apikey' },
          { l: 'Facturation', u: 'https://console.cloud.google.com/billing' }
        ] },
        { ic: '🟠', nm: 'Mistral', ds: 'MISTRAL_API_KEY', links: [
          { l: 'Clés', u: 'https://console.mistral.ai/api-keys' },
          { l: 'Facturation', u: 'https://console.mistral.ai/billing' }
        ] },
        { ic: '⚡', nm: 'Groq', ds: 'GROQ_API_KEY', links: [
          { l: 'Clés', u: 'https://console.groq.com/keys' },
          { l: 'Facturation', u: 'https://console.groq.com/settings/billing' }
        ] },
        { ic: '🐋', nm: 'DeepSeek', ds: 'DEEPSEEK_API_KEY', links: [
          { l: 'Clés', u: 'https://platform.deepseek.com/api_keys' },
          { l: 'Solde', u: 'https://platform.deepseek.com/usage' },
          { l: 'Recharger', u: 'https://platform.deepseek.com/top_up' }
        ] },
        { ic: '🔎', nm: 'Perplexity', ds: 'PERPLEXITI_API_KEY', links: [
          { l: 'Clés & solde', u: 'https://www.perplexity.ai/settings/api' }
        ] },
        { ic: '✖️', nm: 'xAI (Grok)', ds: 'XAI_API_KEY', links: [
          { l: 'Console', u: 'https://console.x.ai/' }
        ] },
        { ic: '🟤', nm: 'Cohere', ds: 'COHERE_API_KEY', links: [
          { l: 'Clés', u: 'https://dashboard.cohere.com/api-keys' },
          { l: 'Facturation', u: 'https://dashboard.cohere.com/billing/usage' }
        ] },
        { ic: '🤝', nm: 'Together AI', ds: 'TOGETHER_API_KEY', links: [
          { l: 'Clés', u: 'https://api.together.xyz/settings/api-keys' },
          { l: 'Facturation', u: 'https://api.together.xyz/settings/billing' }
        ] },
        { ic: '🎬', nm: 'Replicate', ds: 'AX_REPLICATE_KEY (image/vidéo)', links: [
          { l: 'Clés', u: 'https://replicate.com/account/api-tokens' },
          { l: 'Facturation', u: 'https://replicate.com/account/billing' }
        ] },
        { ic: '🔭', nm: 'Tavily', ds: 'TAVILY_API_KEY (recherche)', links: [
          { l: 'Tableau de bord', u: 'https://app.tavily.com/home' }
        ] },
        { ic: '🌲', nm: 'Pinecone', ds: 'PINECONE_API_KEY (vecteurs)', links: [
          { l: 'Tableau de bord', u: 'https://app.pinecone.io/' }
        ] },
        { ic: '📈', nm: 'Finnhub', ds: 'FINNHUB_API_KEY (bourse)', links: [
          { l: 'Tableau de bord', u: 'https://finnhub.io/dashboard' }
        ] },
        { ic: '🖼️', nm: 'Pexels', ds: 'PEXELS_API_KEY (photos)', links: [
          { l: 'API', u: 'https://www.pexels.com/api/' }
        ] },
        { ic: '🖨️', nm: 'Printify', ds: 'PRINTIFY_API_KEY (POD)', links: [
          { l: 'Clés API', u: 'https://printify.com/app/account/api' },
          { l: 'Commandes', u: 'https://printify.com/app/orders' }
        ] },
        { ic: '📱', nm: 'Vonage', ds: 'VONAGE_API_KEY (SMS)', links: [
          { l: 'Tableau de bord', u: 'https://dashboard.vonage.com/' }
        ] },
        { ic: '✉️', nm: 'EmailJS', ds: 'EMAILJS_PRIVATE_KEY', links: [
          { l: 'Admin', u: 'https://dashboard.emailjs.com/admin' }
        ] },
        { ic: '💬', nm: 'Telegram', ds: 'TELEGRAM_API_KEY (bot)', links: [
          { l: 'BotFather', u: 'https://t.me/BotFather' }
        ] }
      ]
    },
    {
      title: '☁️ Cloudflare — Workers & infra', sub: 'Tableau de bord + santé des workers',
      items: [
        { ic: '☁️', nm: 'Cloudflare', ds: 'Tableau de bord principal', links: [
          { l: 'Accueil', u: 'https://dash.cloudflare.com/' },
          { l: 'Workers', u: CF + '/workers/services' },
          { l: 'KV', u: CF + '/workers/kv/namespaces' },
          { l: 'R2', u: CF + '/r2/overview' },
          { l: 'D1', u: CF + '/workers/d1' },
          { l: 'Queues', u: CF + '/workers/queues' }
        ] },
        { ic: '🫀', nm: 'Santé des workers', ds: 'Vérifier qu’un service répond (1 clic = /health)', links: [
          { l: 'kdmc-router', u: 'https://kd-mc.com/' },
          { l: 'apex-auth', u: WK('apex-auth-worker') + '/health' },
          { l: 'apex-v13-backend', u: WK('apex-v13-backend') + '/health' },
          { l: 'apex-chat-api', u: WK('apex-chat-api') + '/health' },
          { l: 'apex-vault-svc', u: WK('apex-vault-svc') + '/health' },
          { l: 'apex-sentinels', u: WK('apex-sentinels-svc') + '/health' },
          { l: 'apex-push', u: WK('apex-push-worker') + '/health' },
          { l: 'apex-secrets-proxy', u: WK('apex-secrets-proxy') + '/health' },
          { l: 'coffre-r2', u: WK('coffre-r2') + '/health' },
          { l: 'cmc-parser-proxy', u: WK('cmc-parser-proxy') + '/healthz' },
          { l: 'ld-gemini-proxy', u: WK('ld-gemini-proxy') + '/' },
          { l: 'ld-printify-order', u: WK('ld-printify-order') + '/' }
        ] }
      ]
    },
    {
      title: '🔥 Firebase', sub: 'Bases temps réel & consommation',
      items: [
        { ic: '🔥', nm: 'cmcteams-c16ab', ds: 'CMCteams (planning, chat) · europe-west1', links: [
          { l: 'Données', u: FB + '/cmcteams-c16ab/database/cmcteams-c16ab-default-rtdb/data' },
          { l: 'Usage', u: FB + '/cmcteams-c16ab/usage' }
        ] },
        { ic: '🔥', nm: 'kdmc-clients', ds: 'Apex AI (chat, coffre, clients) · europe-west1', links: [
          { l: 'Données', u: FB + '/kdmc-clients/database/kdmc-clients-default-rtdb/data' },
          { l: 'Usage', u: FB + '/kdmc-clients/usage' }
        ] },
        { ic: '🧰', nm: 'Console Firebase', ds: 'Tous les projets', url: 'https://console.firebase.google.com/' }
      ]
    },
    {
      title: '🚀 Code, déploiements & CI', sub: 'GitHub : repo, Actions, secrets',
      items: [
        { ic: '🐙', nm: 'Dépôt GitHub', ds: 'cmcteams (code source)', url: GH },
        { ic: '⚙️', nm: 'Actions (déploiements)', ds: 'Tous les workflows & runs', links: [
          { l: 'Tous les runs', u: GH + '/actions' },
          { l: 'router', u: GH + '/actions/workflows/deploy-kdmc-router.yml' },
          { l: 'apex-chat', u: GH + '/actions/workflows/deploy-apex-chat.yml' },
          { l: 'v13-backend', u: GH + '/actions/workflows/deploy-apex-v13-backend.yml' },
          { l: 'auth', u: GH + '/actions/workflows/deploy-apex-auth-worker.yml' },
          { l: 'push', u: GH + '/actions/workflows/deploy-push-worker.yml' },
          { l: 'coffre-r2', u: GH + '/actions/workflows/deploy-coffre-r2.yml' }
        ] },
        { ic: '🔐', nm: 'Secrets & Pages', ds: 'Réglages du dépôt', links: [
          { l: 'Secrets Actions', u: GH + '/settings/secrets/actions' },
          { l: 'GitHub Pages', u: GH + '/settings/pages' }
        ] }
      ]
    },
    {
      title: '🌐 Domaine & DNS', sub: 'kd-mc.com (Cloudflare Registrar)',
      items: [
        { ic: '🌐', nm: 'kd-mc.com', ds: 'Domaine, DNS & SSL', links: [
          { l: 'Domaine', u: CF + '/domains' },
          { l: 'DNS', u: CF + '/kd-mc.com/dns/records' },
          { l: 'SSL/TLS', u: CF + '/kd-mc.com/ssl-tls' }
        ] }
      ]
    },
    {
      title: '💳 Paiements & services', sub: 'Encaissements & outils',
      items: [
        { ic: '💳', nm: 'Stripe', ds: 'Paiements & abonnements', url: 'https://dashboard.stripe.com/' },
        { ic: '🅿️', nm: 'PayPal', ds: 'Compte marchand', url: 'https://www.paypal.com/businessprofile/' },
        { ic: '🖨️', nm: 'Printify', ds: 'Commandes POD', url: 'https://printify.com/app/orders' },
        { ic: '▲', nm: 'Vercel', ds: 'Fonctions (webhooks, factures)', url: 'https://vercel.com/dashboard' },
        { ic: '🚂', nm: 'Railway', ds: 'Hébergement agent', url: 'https://railway.app/dashboard' },
        { ic: '📧', nm: 'Brevo', ds: 'Emails transactionnels', url: 'https://app.brevo.com/' }
      ]
    },
    {
      title: '🔒 Admin & coffre', sub: 'Espace privé du domaine',
      adm: true,
      items: [
        { ic: '👥', nm: 'Admin domaine', ds: 'Fiches clients (code admin requis)', url: '/admin/' },
        { ic: '🔐', nm: 'Coffre-fort', ds: 'Documents & accès sécurisés', url: 'https://coffre.kd-mc.com/' }
      ]
    }
  ];

  /* ---- Rendu ---- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function cardHtml(it, adm) {
    var cls = 'card' + (adm ? ' adm' : '');
    var head = '<span class="ic">' + esc(it.ic) + '</span>' +
      '<span class="ct"><span class="nm">' + esc(it.nm) + '</span>' +
      (it.ds ? '<span class="ds">' + esc(it.ds) + '</span>' : '') + '</span>';
    if (it.url) {
      return '<a class="' + cls + '" href="' + esc(it.url) + '"' +
        (/^https?:/.test(it.url) ? ' target="_blank" rel="noopener noreferrer"' : '') +
        '>' + head + '<span class="arr">›</span></a>';
    }
    var chips = (it.links || []).map(function (lk) {
      return '<a class="chip" href="' + esc(lk.u) + '" target="_blank" rel="noopener noreferrer">' + esc(lk.l) + ' ›</a>';
    }).join('');
    return '<div class="' + cls + ' multi">' + head + '<span class="chips">' + chips + '</span></div>';
  }

  function render() {
    var root = document.getElementById('ctl');
    if (!root) return 0;
    var n = 0, html = '';
    DATA.forEach(function (fam) {
      html += '<h2 class="cat">' + esc(fam.title) +
        (fam.sub ? '<small>' + esc(fam.sub) + '</small>' : '') + '</h2>';
      html += '<div class="grid">';
      fam.items.forEach(function (it) {
        html += cardHtml(it, fam.adm);
        n += it.url ? 1 : (it.links ? it.links.length : 0);
      });
      html += '</div>';
    });
    root.innerHTML = html;
    var c = document.getElementById('count');
    if (c) c.textContent = n + ' liens';
    return n;
  }

  /* ---- Porte d'accès (fail-open, anti-lockout) ---- */
  function show(el, on) { if (el) el.hidden = !on; }

  function applyGate() {
    var ctl = document.getElementById('ctl');
    var lock = document.getElementById('lock');
    function open() { show(ctl, true); show(lock, false); }
    function locked() { show(ctl, false); show(lock, true); }
    try {
      var sso = window.kdmcSSO;
      if (!sso || typeof sso.whoami !== 'function') { open(); return; } // SSO absent → ouvert
      sso.whoami().then(function (who) {
        // who === null : pas de session OU réseau KO → ouvert (jamais de verrouillage pour toi)
        if (!who) { open(); return; }
        var ok = who.admin === true || /kevin|laurence|lolo/i.test(who.name || '');
        if (ok) open(); else locked(); // un AUTRE client connu → verrouillé
      }).catch(function () { open(); });
    } catch (e) { open(); }
  }

  function boot() {
    try { if (window.kdmcSSO && window.kdmcSSO.consumeHashToken) window.kdmcSSO.consumeHashToken(); } catch (e) { /* ignore */ }
    render();
    applyGate();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
