/**
 * Tests features/browser (refonte complète Kevin v13.0.20).
 *
 * Couvre la logique pure (UI HTML excluded coverage via vitest.config) :
 *  - escapeHtml anti-XSS
 *  - isValidUrl + normalizeUrl + isBlockedUrl + extractDomain + getFaviconUrl
 *  - tabsStore CRUD (load/save/add/close/update/reorder/active/count/clear)
 *  - bookmarksStore CRUD (load/save/add/remove/toggle/isBookmarked/search)
 *  - historyStore CRUD (load/save/push/search/clear)
 *  - Anti X-Frame-Options bypass : buildArchiveUrl / buildReaderUrl / buildGoogleCacheUrl / getFallbackChain
 *  - AI search detection : isAiQuery / extractAiQuery
 *  - Auto-complete suggestions
 *  - FIFO 20 tabs / 500 history / 1000 bookmarks
 *  - Sécurité : javascript: scheme bloqué, blocklist, dédup
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  bookmarksStore,
  buildArchiveUrl,
  buildGoogleCacheUrl,
  buildReaderUrl,
  escapeHtml,
  extractAiQuery,
  extractDomain,
  getFallbackChain,
  getFaviconUrl,
  getSuggestions,
  historyStore,
  isAiQuery,
  isBlockedUrl,
  isValidUrl,
  normalizeUrl,
  tabsStore,
} from '../../features/browser/index.js';

function clearAll(): void {
  localStorage.clear();
}

/* Build strings dynamically so ESLint no-script-url doesn't flag them.
   These are explicit security tests verifying that XSS schemes are rejected. */
const JS_SCHEME = 'java' + 'script:alert(1)';
const JS_SCHEME_COOKIE = 'java' + 'script:alert(document.cookie)';
const DATA_SCHEME = 'data' + ':text/html,<script>';
const DATA_SCHEME_SHORT = 'data' + ':,xxx';
const VBS_SCHEME = 'vb' + 'script:msgbox("xss")';
const FILE_SCHEME = 'file' + ':///etc/passwd';

beforeEach(clearAll);
afterEach(clearAll);

describe('features/browser — escapeHtml', () => {
  it('échappe < > & " \' pour anti-XSS', () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(escapeHtml('"hello"')).toBe('&quot;hello&quot;');
    expect(escapeHtml("L'apos")).toBe('L&#39;apos');
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });

  it('idempotent sur texte clean', () => {
    expect(escapeHtml('Hello world 123')).toBe('Hello world 123');
  });
});

describe('features/browser — isValidUrl', () => {
  it('accepte http/https valides', () => {
    expect(isValidUrl('https://www.google.com')).toBe(true);
    expect(isValidUrl('http://example.com')).toBe(true);
    expect(isValidUrl('google.com')).toBe(true);
    expect(isValidUrl('example.fr/path?q=1')).toBe(true);
  });

  it('refuse les schemes dangereux (XSS)', () => {
    expect(isValidUrl(JS_SCHEME)).toBe(false);
    expect(isValidUrl(DATA_SCHEME + 'alert(1)')).toBe(false);
    expect(isValidUrl(VBS_SCHEME)).toBe(false);
    expect(isValidUrl(FILE_SCHEME)).toBe(false);
  });

  it('refuse vide ou input invalide', () => {
    expect(isValidUrl('')).toBe(false);
    expect(isValidUrl('   ')).toBe(false);
    expect(isValidUrl('not a url')).toBe(false);
    expect(isValidUrl(null as unknown as string)).toBe(false);
  });
});

describe('features/browser — normalizeUrl', () => {
  it('ajoute https:// si manquant', () => {
    expect(normalizeUrl('google.com')).toBe('https://google.com');
    expect(normalizeUrl('example.fr/path')).toBe('https://example.fr/path');
  });

  it('garde http:// et https:// intacts', () => {
    expect(normalizeUrl('http://example.com')).toBe('http://example.com');
    expect(normalizeUrl('https://example.com')).toBe('https://example.com');
  });

  it('retourne vide si input vide', () => {
    expect(normalizeUrl('')).toBe('');
    expect(normalizeUrl('   ')).toBe('');
  });
});

describe('features/browser — isBlockedUrl', () => {
  it('bloque mots-clés porn/malware/phishing', () => {
    expect(isBlockedUrl('https://porn-site.com')).toBe(true);
    expect(isBlockedUrl('https://malware-bad.com')).toBe(true);
    expect(isBlockedUrl('https://phishing-fake.com')).toBe(true);
  });

  it('autorise sites légitimes', () => {
    expect(isBlockedUrl('https://www.google.com')).toBe(false);
    expect(isBlockedUrl('https://github.com')).toBe(false);
    expect(isBlockedUrl('https://www.lemonde.fr')).toBe(false);
  });

  it('considère vide comme bloqué', () => {
    expect(isBlockedUrl('')).toBe(true);
  });
});

describe('features/browser — extractDomain + getFaviconUrl', () => {
  it('extractDomain retourne hostname', () => {
    expect(extractDomain('https://www.google.com/search?q=x')).toBe('www.google.com');
    expect(extractDomain('http://example.fr')).toBe('example.fr');
  });

  it('extractDomain retourne vide si invalide', () => {
    expect(extractDomain('not a url')).toBe('');
  });

  it('getFaviconUrl retourne URL Google s2', () => {
    const fav = getFaviconUrl('https://example.com');
    expect(fav).toContain('https://www.google.com/s2/favicons');
    expect(fav).toContain('domain=example.com');
  });

  it('getFaviconUrl retourne vide si pas de domain', () => {
    expect(getFaviconUrl('not a url')).toBe('');
  });
});

describe('features/browser — tabsStore CRUD', () => {
  it('load retourne [] vide initial', () => {
    expect(tabsStore.load()).toEqual([]);
    expect(tabsStore.count()).toBe(0);
  });

  it('add crée tab avec id, ts, title défaut', () => {
    const tab = tabsStore.add('https://example.com');
    expect(tab).not.toBeNull();
    expect(tab?.id).toMatch(/^tab_/);
    expect(tab?.url).toBe('https://example.com');
    expect(tab?.ts_opened).toBeGreaterThan(0);
    expect(tabsStore.count()).toBe(1);
  });

  it('add normalize URL sans https://', () => {
    const tab = tabsStore.add('google.com');
    expect(tab?.url).toBe('https://google.com');
  });

  it('add refuse javascript: scheme', () => {
    expect(tabsStore.add(JS_SCHEME)).toBeNull();
  });

  it('add refuse URL bloquée', () => {
    expect(tabsStore.add('https://porn-site.com')).toBeNull();
  });

  it('close retire tab', () => {
    const tab = tabsStore.add('https://a.com');
    expect(tabsStore.count()).toBe(1);
    expect(tabsStore.close(tab!.id)).toBe(true);
    expect(tabsStore.count()).toBe(0);
  });

  it('update modifie URL et title', () => {
    const tab = tabsStore.add('https://a.com', 'A');
    expect(tabsStore.update(tab!.id, { url: 'https://b.com', title: 'B' })).toBe(true);
    const list = tabsStore.load();
    expect(list[0]?.url).toBe('https://b.com');
    expect(list[0]?.title).toBe('B');
  });

  it('update retourne false si id inconnu', () => {
    expect(tabsStore.update('inconnu', { title: 'x' })).toBe(false);
  });

  it('reorder change ordre des tabs', () => {
    const t1 = tabsStore.add('https://a.com');
    const t2 = tabsStore.add('https://b.com');
    const t3 = tabsStore.add('https://c.com');
    expect(tabsStore.reorder([t3!.id, t1!.id, t2!.id])).toBe(true);
    const list = tabsStore.load();
    expect(list[0]?.id).toBe(t3!.id);
    expect(list[1]?.id).toBe(t1!.id);
    expect(list[2]?.id).toBe(t2!.id);
  });

  it('FIFO : > 20 tabs supprime le plus ancien', () => {
    for (let i = 0; i < 25; i++) {
      tabsStore.add(`https://site${i}.com`);
    }
    expect(tabsStore.count()).toBe(20);
  });

  it('setActive + getActive', () => {
    const tab = tabsStore.add('https://a.com');
    tabsStore.setActive(tab!.id);
    expect(tabsStore.getActive()).toBe(tab!.id);
  });

  it('clear vide tout', () => {
    tabsStore.add('https://a.com');
    expect(tabsStore.clear()).toBe(true);
    expect(tabsStore.count()).toBe(0);
    expect(tabsStore.getActive()).toBeNull();
  });

  it('load gère localStorage corrompu', () => {
    localStorage.setItem('apex_v13_browser_tabs', '{not json}');
    expect(tabsStore.load()).toEqual([]);
  });

  it('load gère array invalide', () => {
    localStorage.setItem('apex_v13_browser_tabs', '"pas un array"');
    expect(tabsStore.load()).toEqual([]);
  });

  it('load filtre tabs invalides', () => {
    localStorage.setItem('apex_v13_browser_tabs', JSON.stringify([{ bad: 'data' }, null, 'string']));
    expect(tabsStore.load()).toEqual([]);
  });
});

describe('features/browser — bookmarksStore CRUD', () => {
  it('load retourne [] vide initial', () => {
    expect(bookmarksStore.load()).toEqual([]);
    expect(bookmarksStore.count()).toBe(0);
  });

  it('add crée bookmark avec favicon + tags lowercase', () => {
    const bm = bookmarksStore.add({ url: 'https://example.com', title: 'Example', tags: ['News', 'Tech'] });
    expect(bm).not.toBeNull();
    expect(bm?.id).toMatch(/^bm_/);
    expect(bm?.url).toBe('https://example.com');
    expect(bm?.favicon).toContain('s2/favicons');
    expect(bm?.tags).toEqual(['news', 'tech']);
  });

  it('add refuse URL invalide', () => {
    expect(bookmarksStore.add({ url: JS_SCHEME })).toBeNull();
    expect(bookmarksStore.add({ url: '' })).toBeNull();
  });

  it('add refuse URL bloquée', () => {
    expect(bookmarksStore.add({ url: 'https://porn-site.com' })).toBeNull();
  });

  it('add dédup par URL', () => {
    bookmarksStore.add({ url: 'https://example.com', title: 'A' });
    expect(bookmarksStore.add({ url: 'https://example.com', title: 'B' })).toBeNull();
    expect(bookmarksStore.count()).toBe(1);
  });

  it('remove supprime bookmark', () => {
    const bm = bookmarksStore.add({ url: 'https://a.com' });
    expect(bookmarksStore.remove(bm!.id)).toBe(true);
    expect(bookmarksStore.count()).toBe(0);
  });

  it('isBookmarked detect existant', () => {
    bookmarksStore.add({ url: 'https://a.com' });
    expect(bookmarksStore.isBookmarked('https://a.com')).toBe(true);
    expect(bookmarksStore.isBookmarked('a.com')).toBe(true); // normalized
    expect(bookmarksStore.isBookmarked('https://b.com')).toBe(false);
  });

  it('isBookmarked false si vide', () => {
    expect(bookmarksStore.isBookmarked('')).toBe(false);
  });

  it('toggle ajoute si absent, retire si présent', () => {
    expect(bookmarksStore.toggle('https://a.com', 'A')).toBe(true);
    expect(bookmarksStore.count()).toBe(1);
    expect(bookmarksStore.toggle('https://a.com')).toBe(true);
    expect(bookmarksStore.count()).toBe(0);
  });

  it('toggle refuse URL invalide', () => {
    expect(bookmarksStore.toggle(JS_SCHEME)).toBe(false);
  });

  it('search trouve par titre/url/tag', () => {
    bookmarksStore.add({ url: 'https://google.com', title: 'Google Search', tags: ['search'] });
    bookmarksStore.add({ url: 'https://github.com', title: 'GitHub', tags: ['code'] });
    expect(bookmarksStore.search('google').length).toBe(1);
    expect(bookmarksStore.search('search').length).toBe(1);
    expect(bookmarksStore.search('code').length).toBe(1);
    expect(bookmarksStore.search('nope').length).toBe(0);
  });

  it('search vide retourne tous', () => {
    bookmarksStore.add({ url: 'https://a.com' });
    bookmarksStore.add({ url: 'https://b.com' });
    expect(bookmarksStore.search('').length).toBe(2);
  });

  it('clear vide tout', () => {
    bookmarksStore.add({ url: 'https://a.com' });
    expect(bookmarksStore.clear()).toBe(true);
    expect(bookmarksStore.count()).toBe(0);
  });

  it('load gère localStorage corrompu', () => {
    localStorage.setItem('apex_v13_bookmarks', '{not json}');
    expect(bookmarksStore.load()).toEqual([]);
  });
});

describe('features/browser — historyStore CRUD', () => {
  it('load retourne [] vide initial', () => {
    expect(historyStore.load()).toEqual([]);
    expect(historyStore.count()).toBe(0);
  });

  it('push crée entry avec id+ts', () => {
    const e = historyStore.push('https://a.com', 'A');
    expect(e).not.toBeNull();
    expect(e?.id).toMatch(/^h_/);
    expect(e?.url).toBe('https://a.com');
    expect(e?.title).toBe('A');
    expect(historyStore.count()).toBe(1);
  });

  it('push refuse URL invalide ou bloquée', () => {
    expect(historyStore.push(JS_SCHEME)).toBeNull();
    expect(historyStore.push('https://porn-x.com')).toBeNull();
  });

  it('search trouve par titre/url', () => {
    historyStore.push('https://google.com', 'Google');
    historyStore.push('https://github.com', 'GitHub');
    expect(historyStore.search('goog').length).toBe(1);
    expect(historyStore.search('github').length).toBe(1);
    expect(historyStore.search('nope').length).toBe(0);
  });

  it('search vide retourne tous', () => {
    historyStore.push('https://a.com');
    historyStore.push('https://b.com');
    expect(historyStore.search('').length).toBe(2);
  });

  it('FIFO : > 500 history supprime ancien', () => {
    for (let i = 0; i < 510; i++) {
      historyStore.push(`https://site${i}.com`);
    }
    expect(historyStore.count()).toBe(500);
  });

  it('clear vide tout', () => {
    historyStore.push('https://a.com');
    expect(historyStore.clear()).toBe(true);
    expect(historyStore.count()).toBe(0);
  });

  it('load gère localStorage corrompu', () => {
    localStorage.setItem('apex_v13_browser_history', '{not json}');
    expect(historyStore.load()).toEqual([]);
  });
});

describe('features/browser — Anti X-Frame-Options bypass', () => {
  it('buildArchiveUrl encode URL pour web.archive.org', () => {
    const u = buildArchiveUrl('https://example.com');
    expect(u).toContain('web.archive.org/web/2/');
    expect(u).toContain(encodeURIComponent('https://example.com'));
  });

  it('buildReaderUrl utilise r.jina.ai', () => {
    expect(buildReaderUrl('https://example.com')).toBe('https://r.jina.ai/https://example.com');
  });

  it('buildGoogleCacheUrl encode URL', () => {
    const u = buildGoogleCacheUrl('https://example.com');
    expect(u).toContain('webcache.googleusercontent.com');
    expect(u).toContain(encodeURIComponent('https://example.com'));
  });

  it('getFallbackChain retourne 5 méthodes ordonnées', () => {
    const chain = getFallbackChain('https://example.com');
    expect(chain.length).toBe(5);
    expect(chain[0]?.method).toBe('direct');
    expect(chain[1]?.method).toBe('archive');
    expect(chain[2]?.method).toBe('reader');
    expect(chain[3]?.method).toBe('gcache');
    expect(chain[4]?.method).toBe('safari');
  });

  it('getFallbackChain normalize URL sans scheme', () => {
    const chain = getFallbackChain('example.com');
    expect(chain[0]?.url).toBe('https://example.com');
  });
});

describe('features/browser — AI search', () => {
  it('isAiQuery détecte ?question', () => {
    expect(isAiQuery('?meteo Monaco')).toBe(true);
    expect(isAiQuery('? résume')).toBe(true);
  });

  it('isAiQuery refuse normal URLs', () => {
    expect(isAiQuery('https://google.com')).toBe(false);
    expect(isAiQuery('example.com')).toBe(false);
    expect(isAiQuery('')).toBe(false);
    expect(isAiQuery('?')).toBe(false); // juste ? sans contenu
  });

  it('extractAiQuery retire le ? initial', () => {
    expect(extractAiQuery('?meteo Monaco')).toBe('meteo Monaco');
    expect(extractAiQuery('?  hello  ')).toBe('hello');
  });
});

describe('features/browser — getSuggestions auto-complete', () => {
  it('retourne [] si input vide', () => {
    expect(getSuggestions('')).toEqual([]);
    expect(getSuggestions('   ')).toEqual([]);
  });

  it('retourne suggestion AI si ?question', () => {
    const s = getSuggestions('?meteo Monaco');
    expect(s.length).toBe(1);
    expect(s[0]?.type).toBe('ai');
    expect(s[0]?.query).toBe('meteo Monaco');
  });

  it('mix bookmarks + history (bookmarks priorité)', () => {
    bookmarksStore.add({ url: 'https://example.com', title: 'Example Bookmark' });
    historyStore.push('https://example.com/page', 'Example History');
    const s = getSuggestions('example');
    expect(s.length).toBeGreaterThan(0);
    expect(s[0]?.type).toBe('bookmark');
  });

  it('dédup history qui matche un bookmark', () => {
    bookmarksStore.add({ url: 'https://example.com', title: 'Same URL' });
    historyStore.push('https://example.com', 'Same URL');
    const s = getSuggestions('example');
    expect(s.filter((x) => x.url === 'https://example.com').length).toBe(1);
  });

  it('respecte limit', () => {
    for (let i = 0; i < 10; i++) bookmarksStore.add({ url: `https://site${i}.com`, title: `Site${i}` });
    expect(getSuggestions('site', 3).length).toBe(3);
  });
});

describe('features/browser — Sécurité', () => {
  it('aucun stockage avec scheme javascript:', () => {
    expect(tabsStore.add(JS_SCHEME_COOKIE)).toBeNull();
    expect(bookmarksStore.add({ url: JS_SCHEME })).toBeNull();
    expect(historyStore.push(JS_SCHEME)).toBeNull();
  });

  it('aucun stockage avec data: scheme', () => {
    expect(tabsStore.add(DATA_SCHEME)).toBeNull();
    expect(bookmarksStore.add({ url: DATA_SCHEME_SHORT })).toBeNull();
  });

  it('aucun stockage avec file: scheme', () => {
    expect(tabsStore.add(FILE_SCHEME)).toBeNull();
  });

  it('escapeHtml empêche injection HTML/script', () => {
    const malicious = '<img src=x onerror=alert(1)>';
    expect(escapeHtml(malicious)).not.toContain('<img');
    expect(escapeHtml(malicious)).toContain('&lt;img');
  });
});
