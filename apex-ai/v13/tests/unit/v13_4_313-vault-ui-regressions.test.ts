/**
 * Régressions v13.4.313 — Coffre (Kevin 2026-06-08, captures iPhone) :
 *  1. « L'écran passe dessous » : le contenu du Coffre glissait SOUS la barre
 *     d'état iPhone (en-tête collant à top:0 sans safe-area). → le sticky wrap
 *     doit porter env(safe-area-inset-top) et la page ne doit plus avoir de
 *     padding-top env (déplacé dans le sticky wrap).
 *  2. « Paiement ouvert par défaut ?! » : les catégories (dont Paiements & Finance)
 *     s'ouvraient d'office. → fermées par défaut (ouvertes seulement en recherche).
 *
 * Câblé dans test:ci → ne JAMAIS reproduire ces régressions UI.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { store } from '../../core/store.js';
import { render } from '../../features/vault/index.js';

describe('v13.4.313 — Coffre : affichage + catégories (régression Kevin)', () => {
  beforeEach(() => {
    localStorage.clear();
    /* render() déclenche un fetch fire-and-forget (santé proxy) → le neutraliser
     * pour éviter un fetch suspendu après teardown happy-dom (leçon #89). */
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('no-net-in-test'))));
    /* Le Coffre est admin-only → simuler l'admin Kevin pour rendre le contenu. */
    store.set('isAdmin', true);
    store.set('user', { id: 'kdmc_admin' });
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
    store.set('isAdmin', false);
  });

  it('en-tête collant porte safe-area-inset-top (ne passe plus sous la barre d’état)', () => {
    const div = document.createElement('div');
    render(div);
    const html = div.innerHTML;
    /* Le sticky wrap couvre la zone barre d'état via padding-top safe-area. */
    expect(html).toContain('env(safe-area-inset-top, 0px) 16px 0');
    /* La page n'a plus de padding-top env (sinon double marge / désalignement). */
    expect(html).toContain('padding:0 16px');
  });

  it('catégories FERMÉES par défaut (aucun <details ax-cat open> sans recherche)', () => {
    const div = document.createElement('div');
    render(div);
    const html = div.innerHTML;
    /* Au moins une catégorie « toujours visible » est rendue (Identité/Adresses/Autres). */
    expect(html).toContain('class="ax-cat"');
    /* isOpen = (recherche active) → sans recherche, AUCUNE catégorie ouverte. */
    expect(/<details[^>]*class="ax-cat"[^>]*\sopen[\s>]/i.test(html)).toBe(false);
  });
});
