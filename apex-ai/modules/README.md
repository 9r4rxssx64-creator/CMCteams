# Apex Modules — Phase 1 Code Splitting

Ce dossier contient les modules JS extraits du monolith `apex-ai/index.html` pour Phase 1 du refactor (CLAUDE.md règle : >15K lignes = refactor obligatoire).

## Structure cible

| Module | Source | Taille estim |
|---|---|---|
| `ax-quiet-mode.js` | v12.499 master quiet mode | 5 KB |
| `ax-broadlink.js` | v12.501-502 + 53 types LAN | 30 KB |
| `ax-discovery.js` | v12.507 Smart Discovery + dispatcher | 25 KB |
| `ax-macros.js` | v12.513 macros + per-room | 15 KB |
| `ax-audio.js` | v12.515-518 voix + audio messages + TTS | 35 KB |
| `ax-sound-recog.js` | v12.526 YAMNet 521 classes | 12 KB |
| `ax-rtc-peer.js` | v12.523 WebRTC peer voice | 10 KB |
| `ax-cors-proxy.js` | v12.511 routing tests CORS | 8 KB |
| `ax-listeners.js` | v12.528 tracked listeners + cleanup | 8 KB |
| `ax-encrypt-ls.js` | v12.529 AES-GCM localStorage | 10 KB |
| `ax-storage-cleanup.js` | v12.530 emergency cleanup | 8 KB |

**Total chunks** : ~166 KB (vs 2.9 MB monolith). Lazy-loadés via `import()`.

## Chargement

Le `index.html` charge un loader minimal (~500 KB). Les modules sont importés à la demande :

```js
// Dans le code core
async function loadBroadlinkUI(){
  if(!window._axBroadlinkLoaded){
    const m = await import('./modules/ax-broadlink.js');
    window._axBroadlinkLoaded = true;
  }
  return vBroadlinkRemote();
}
```

## Méthode d'extraction

1. Identifier le bloc de code source dans `index.html` (entre markers `AX_V12_*`)
2. Extraire dans le fichier module dédié
3. Ajouter export ES6 + global window pour backward compat
4. Remplacer dans `index.html` par stub qui import à la demande
5. Tester runtime + audit POST-FIX

## Status Phase 1

- [x] Structure dossier créée
- [ ] Modules extraits : 0/11
- [ ] Loader dynamique
- [ ] SW cache stratégie chunk hashing
- [ ] Audit POST-FIX bundle size
