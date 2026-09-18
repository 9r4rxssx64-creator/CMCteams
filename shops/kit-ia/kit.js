/* kit.js — Kit IA de l'indépendant : page de vente (récupérer son accès) et lecteur.
   Aucune décision n'est prise ici : le contenu payant est SERVI par le worker
   contre un code valide. Un verrou dans un fichier public ne protège rien.
   Logique pure exportée AVANT le branchement navigateur (testable hors navigateur). */
(function () {
  'use strict';

  var API = 'https://kdmc-vente.9r4rxssx64.workers.dev';
  var PRODUIT = 'kit-ia';
  /* Lecteur partagé par tous les kits (fabrique de produits, 17.09) : le produit
     vient de ?produit=<id> (lettres et tirets seulement, sinon on reste sur le kit). */
  function produitDepuisUrl(search, dataProduit) {
    var m = /[?&]produit=([a-z][a-z-]{1,40})(?:&|$)/.exec(String(search || ''));
    if (m) return m[1];
    return /^[a-z][a-z-]{1,40}$/.test(String(dataProduit || '')) ? String(dataProduit) : PRODUIT;
  }
  var PRODUIT_LU = (typeof location !== 'undefined' && typeof document !== 'undefined')
    ? produitDepuisUrl(location.search, document.body && document.body.getAttribute('data-produit')) : PRODUIT;
  function lienLecteur(code) {
    return 'lire.html?' + (PRODUIT_LU !== PRODUIT ? 'produit=' + encodeURIComponent(PRODUIT_LU) + '&' : '') + 'c=' + encodeURIComponent(code);
  }
  var CLE_CODE = (PRODUIT_LU === PRODUIT ? 'kit_ia' : 'kit_' + PRODUIT_LU.replace(/-/g, '_')) + '_code';   /* localStorage scopé au produit (règle d'isolation) */

  /* ── Logique pure ───────────────────────────────────────────────────── */
  function emailPlausible(v) {
    return /^[^@\s]+@[^@\s.]+\.[^@\s]{2,}$/.test(String(v || '').trim());
  }
  function normaliseCode(v) {
    var s = String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (s.length !== 16) return '';
    return s.replace(/(.{4})(?=.)/g, '$1-');
  }
  /* Réponse de /reclamer → quoi afficher. Trois états : ok / attente / erreur. */
  function interprete(rep, httpOk) {
    if (!rep || typeof rep !== 'object') return { etat: 'erreur', titre: 'Réponse illisible', texte: 'Réessaie dans un instant.' };
    if (rep.ok && rep.verifie && rep.code) {
      return { etat: 'ok', titre: 'Paiement vérifié', code: rep.code, livre: rep.livre,
        texte: (rep.deja_delivre ? 'Tu avais déjà récupéré cet accès : voici le même code. ' : 'Garde ce code : il ouvre ton accès à tout moment, sur tous tes appareils. ')
          + (rep.email_envoye ? 'Il t’a aussi été envoyé par e-mail.' : 'Note-le : il n’a pas pu partir par e-mail.') };
    }
    if (rep.ok && rep.en_attente) {
      return { etat: 'attente', titre: 'Paiement enregistré, vérification en cours', texte: rep.detail || 'Ton accès arrive dès que le paiement est confirmé.' };
    }
    if (!httpOk || rep.ok === false) {
      return { etat: 'erreur', titre: rep.error === 'trop_de_tentatives' ? 'Trop d’essais' : 'Ça n’a pas marché', texte: rep.detail || 'Réessaie, ou reviens dans quelques minutes.' };
    }
    return { etat: 'erreur', titre: 'Cas imprévu', texte: 'Réessaie dans un instant.' };
  }
  /* Réponse de /lire ou /apercu → état du lecteur. */
  function interpreteLecture(rep, httpOk, avecCode) {
    if (!rep || typeof rep !== 'object') return { etat: 'erreur', texte: 'Réponse illisible.' };
    if (rep.ok && Array.isArray(rep.modules)) {
      return { etat: avecCode ? 'complet' : 'apercu', modules: rep.modules, sommaire: rep.sommaire || [] };
    }
    if (rep.error === 'invalide') return { etat: 'code_invalide', texte: rep.detail || 'Code inconnu.' };
    if (rep.error === 'contenu_indisponible') return { etat: 'erreur', texte: 'Le contenu n’est pas disponible pour le moment. Ton code reste valable.' };
    return { etat: 'erreur', texte: (rep && rep.detail) || (httpOk ? 'Cas imprévu.' : 'Le serveur ne répond pas.') };
  }

  /* Consignes du Club les plus récentes d'abord (ordre décroissant), n au plus. */
  function clubRecentes(sommaire, n) {
    return (sommaire || []).filter(function (s) { return s && s.source === 'club-ia' && s.titre; })
      .sort(function (a, b) { return (Number(b.ordre) || 0) - (Number(a.ordre) || 0); }).slice(0, n);
  }
  /* 's2026-38' → '38 de 2026' ; autre forme → '' (jamais un identifiant brut à l'écran). */
  function clubSemaineLisible(id) {
    var m = /^s(\d{4})-(\d{2})$/.exec(String(id || ''));
    return m ? String(Number(m[2])) + ' de ' + m[1] : '';
  }

  var expose = { emailPlausible: emailPlausible, normaliseCode: normaliseCode, interprete: interprete, interpreteLecture: interpreteLecture, clubRecentes: clubRecentes, clubSemaineLisible: clubSemaineLisible, produitDepuisUrl: produitDepuisUrl, lienLecteur: lienLecteur, API: API, PRODUIT: PRODUIT };
  if (typeof globalThis !== 'undefined') globalThis.__kit = expose;

  /* ── Navigateur ─────────────────────────────────────────────────────── */
  if (typeof document === 'undefined') return;

  function $(id) { return document.getElementById(id); }
  function texte(el, s) { el.textContent = s; }
  function lireStock() { try { return localStorage.getItem(CLE_CODE) || ''; } catch (_) { return ''; } }
  function ecrireStock(c) { try { localStorage.setItem(CLE_CODE, c); } catch (_) { /* navigation privée */ } }
  function fetchJson(url) {
    return fetch(url).then(function (r) { return r.json().then(function (j) { return { j: j, ok: r.ok }; }); });
  }

  function afficheResultat(boite, v) {
    boite.className = v.etat;
    boite.textContent = '';
    var h = document.createElement('h2'); texte(h, v.titre || ''); boite.appendChild(h);
    var p = document.createElement('p'); texte(p, v.texte || ''); boite.appendChild(p);
    if (v.code) {
      var c = document.createElement('code'); c.className = 'code'; texte(c, v.code); boite.appendChild(c);
      var a = document.createElement('a'); a.className = 'btn btn-primaire';
      a.href = lienLecteur(v.code); texte(a, 'Ouvrir mon kit'); boite.appendChild(a);
      ecrireStock(v.code);
    }
    boite.hidden = false;
    boite.scrollIntoView({ block: 'nearest' });
  }

  /* ── Page de vente : récupérer son accès ────────────────────────────── */
  var form = $('form');
  if (form) {
    var methode = $('methode'), champRef = $('champRef'), aideEmail = $('aideEmail'), bouton = $('valider'), email = $('email'), boite = $('resultat');
    function majMethode() {
      champRef.hidden = (methode.value !== 'virement');
      texte(aideEmail, methode.value === 'paypal' ? 'Exactement celle du compte PayPal qui a payé : c’est elle qu’on cherche.' : 'Pour recevoir ton code d’accès.');
    }
    methode.addEventListener('change', majMethode); majMethode();
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (!emailPlausible(email.value)) { afficheResultat(boite, { etat: 'erreur', titre: 'Adresse incomplète', texte: 'Il manque quelque chose dans l’adresse e-mail.' }); email.focus(); return; }
      bouton.disabled = true; var ancien = bouton.textContent; texte(bouton, 'Vérification…');
      fetch(API + '/reclamer', { method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ produit: ($('produit') && $('produit').value) || PRODUIT, methode: methode.value, email: email.value.trim(), reference: ($('reference') || {}).value || '' }) })
        .then(function (r) { return r.json().then(function (j) { return { j: j, ok: r.ok }; }); })
        .then(function (x) { afficheResultat(boite, interprete(x.j, x.ok)); })
        .catch(function (e) { afficheResultat(boite, { etat: 'erreur', titre: 'Pas de réseau', texte: 'Ton paiement n’est pas perdu. Réessaie : ' + String(e.message || e) }); })
        .finally(function () { bouton.disabled = false; texte(bouton, ancien); });
    });
  }

  /* ── Page de vente : ce qui est déjà publié au Club (preuve de fraîcheur) ─
     /apercu ne sert que le module gratuit, mais son SOMMAIRE liste tout, dont
     les consignes hebdomadaires (source === 'club-ia'). On montre les 3 plus
     récentes, titres seulement. Caché tant que rien n'est chargé : une panne
     ou une base vide ne laisse pas de bloc vide. */
  var clubSemaine = $('clubSemaine');
  if (clubSemaine && form) {
    fetchJson(API + '/apercu?produit=club-ia').then(function (x) {
      var r = interpreteLecture(x.j, x.ok, false);
      var hebdo = (r.sommaire || []).filter(function (s) { return s.source === 'club-ia'; });
      var recentes = clubRecentes(hebdo, 3);
      if (!recentes.length) return;
      var ul = $('clubListe'); ul.textContent = '';
      recentes.forEach(function (s) {
        var li = document.createElement('li'), st = document.createElement('strong');
        texte(st, s.titre); li.appendChild(st);
        li.appendChild(document.createTextNode('Consigne-outil de la semaine ' + clubSemaineLisible(s.id) + '.'));
        ul.appendChild(li);
      });
      clubSemaine.hidden = false;
    }).catch(function () { /* silencieux : la carte Club se suffit à elle-même */ });
  }

  /* ── Lecteur ────────────────────────────────────────────────────────── */
  var sommaireEl = $('sommaire');
  if (sommaireEl) {
    var moduleEl = $('module'), etat = $('etat'), titre = $('titre'), verrou = $('verrou'), navM = $('navModules'), boiteCode = $('boiteCode'), res = $('resultat');
    var modules = [], sommaire = [], courant = 0, complet = false;

    function boutonsCopier(racine) {
      racine.querySelectorAll('pre.consigne').forEach(function (pre) {
        var b = document.createElement('button'); b.type = 'button'; b.className = 'copier'; texte(b, 'Copier');
        b.addEventListener('click', function () {
          var t = pre.textContent.replace(/^Copier\s*/, '').replace(/^Copié !\s*/, '');
          var fini = function () { texte(b, 'Copié !'); setTimeout(function () { texte(b, 'Copier'); }, 1500); };
          if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(fini, fini); else fini();
        });
        pre.insertBefore(b, pre.firstChild);
      });
    }
    function rendSommaire() {
      sommaireEl.textContent = '';
      sommaire.forEach(function (s, i) {
        var li = document.createElement('li'), a = document.createElement('a');
        a.href = '#m' + s.ordre; texte(a, s.ordre + '. ' + s.titre);
        var ouvert = complet || s.gratuit;
        if (!ouvert) { var v = document.createElement('span'); v.className = 'verrou'; texte(v, 'kit complet'); a.appendChild(v); }
        if (i === courant) a.className = 'actif';
        a.addEventListener('click', function (ev) { ev.preventDefault(); va(i); });
        li.appendChild(a); sommaireEl.appendChild(li);
      });
    }
    function va(i) {
      courant = Math.max(0, Math.min(i, sommaire.length - 1));
      var s = sommaire[courant];
      var m = modules.filter(function (x) { return x.id === s.id; })[0];
      moduleEl.textContent = '';
      if (m) {
        /* HTML rédigé par nous et servi par notre worker — jamais une saisie d'un client. */
        moduleEl.innerHTML = m.html;
        boutonsCopier(moduleEl);
        verrou.hidden = true;
      } else {
        var h = document.createElement('h2'); texte(h, s.ordre + '. ' + s.titre); moduleEl.appendChild(h);
        verrou.hidden = false;
      }
      navM.hidden = sommaire.length < 2;
      $('precedent').disabled = courant === 0;
      $('suivant').disabled = courant === sommaire.length - 1;
      rendSommaire();
      window.scrollTo({ top: moduleEl.offsetTop - 16, behavior: 'smooth' });
    }
    $('precedent').addEventListener('click', function () { va(courant - 1); });
    $('suivant').addEventListener('click', function () { va(courant + 1); });

    function charge(code) {
      texte(etat, code ? 'Ouverture de ton kit…' : 'Chargement du module gratuit…');
      var url = code ? API + '/lire?c=' + encodeURIComponent(code) : API + '/apercu?produit=' + PRODUIT_LU;
      return fetchJson(url).then(function (x) {
        var r = interpreteLecture(x.j, x.ok, !!code);
        if (r.etat === 'complet' || r.etat === 'apercu') {
          modules = r.modules; sommaire = r.sommaire; complet = (r.etat === 'complet');
          texte(titre, complet ? 'Ton kit complet' : 'Module 1 — gratuit');
          if (!complet && x.j && x.j.nom && $('sur')) { var lienSur = $('sur').querySelector('a'); if (lienSur) texte(lienSur, String(x.j.nom).split(' — ')[0]); }
          texte(etat, complet ? sommaire.length + ' modules ouverts. Chaque consigne se copie en un geste.' : 'Le reste s’ouvre avec ton code d’accès.');
          if (complet) { ecrireStock(code); boiteCode.hidden = true; }
          va(0);
          return true;
        }
        if (r.etat === 'code_invalide') {
          afficheResultat(res, { etat: 'erreur', titre: 'Code non reconnu', texte: r.texte + ' Vérifie les 16 caractères (pas de 0, O, 1, I, L).' });
          return charge('');
        }
        texte(etat, r.texte);
        return false;
      }).catch(function (e) { texte(etat, 'Pas de réseau : ' + String(e.message || e)); return false; });
    }

    $('formCode').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var c = normaliseCode($('codeAcces').value);
      if (!c) { afficheResultat(res, { etat: 'erreur', titre: 'Code incomplet', texte: 'Un code fait 16 caractères, par groupes de 4.' }); return; }
      res.hidden = true;
      charge(c);
    });

    var params = new URLSearchParams(location.search);
    var codeInitial = normaliseCode(params.get('c') || '') || normaliseCode(lireStock());
    if (codeInitial) $('codeAcces').value = codeInitial;
    charge(codeInitial);
  }
})();
