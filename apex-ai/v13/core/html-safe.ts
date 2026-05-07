/**
 * HTML Safety helpers — P1 SECU (audit v13.2.7).
 *
 * Audit a noté 4 innerHTML dynamiques non-escaped + DOMPurify dans deps mais
 * 0 import. Ce module fournit :
 *  1. escapeHtml() : pour interpolation textuelle dans HTML (défense XSS minimale)
 *  2. sanitizeHtml() : pour HTML produit (markdown, contenu IA) — utilise DOMPurify lazy
 *
 * Règle d'or : si la donnée vient d'une source EXTERNE (API, user input,
 * Firebase, fichier picker, WebSocket) → DOIT passer par l'un des deux.
 */

/**
 * Échappe les 5 caractères dangereux pour HTML interpolation.
 * Utilise CETTE FONCTION pour les `${variable}` dans les template literals
 * qui finissent dans `.innerHTML`.
 *
 * @example
 * el.innerHTML = `<p>${escapeHtml(userInput)}</p>`;
 */
export function escapeHtml(s: string | number | null | undefined): string {
  if (s === null || s === undefined) return '';
  const str = String(s);
  return str.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#39;';
      default: return c;
    }
  });
}

/**
 * Sanitize HTML via DOMPurify (lazy CDN ou bundle local).
 * Utilise CETTE FONCTION pour le HTML produit dynamiquement (rendu markdown,
 * réponses IA en HTML, contenu Firebase déjà au format HTML).
 *
 * Sans await : utilise escapeHtml en fallback synchrone.
 * Avec await : DOMPurify chargé + appelé.
 *
 * @example
 * const safe = await sanitizeHtml(markdownToHtml(userInput));
 * el.innerHTML = safe;
 */
type PurifyApi = { sanitize: (html: string, opts?: object) => string };
type PurifyFactory = (win?: Window) => PurifyApi;

let _dompurifyPromise: Promise<PurifyApi> | null = null;

async function loadDOMPurify(): Promise<PurifyApi> {
  if (_dompurifyPromise) return _dompurifyPromise;
  _dompurifyPromise = import('dompurify').then((mod) => {
    /* DOMPurify exports : default est une FACTORY fn (Node) OU directement une instance avec sanitize (browser).
     * Browser : DOMPurify est pré-initialisé avec window.
     * Node/jsdom : il faut appeler DOMPurify(window) pour obtenir l'instance. */
    const def = (mod as unknown as { default: unknown }).default
      ?? (mod as unknown as Record<string, unknown>);
    /* Cas 1 : default a déjà sanitize (browser) */
    if (def && typeof (def as { sanitize?: unknown }).sanitize === 'function') {
      return def as PurifyApi;
    }
    /* Cas 2 : default est une factory fn (Node ou jsdom) → appeler avec window */
    if (typeof def === 'function' && typeof window !== 'undefined') {
      const factory = def as PurifyFactory;
      return factory(window);
    }
    throw new Error('DOMPurify import shape inconnu');
  });
  return _dompurifyPromise;
}

export async function sanitizeHtml(html: string, opts?: object): Promise<string> {
  if (!html) return '';
  try {
    const purify = await loadDOMPurify();
    return purify.sanitize(html, opts ?? {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'b', 'i', 'u', 'a', 'code', 'pre', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'blockquote', 'hr', 'span', 'div'],
      ALLOWED_ATTR: ['href', 'title', 'class', 'target', 'rel'],
      ALLOW_DATA_ATTR: false,
    });
  } catch (err) {
    /* Si DOMPurify charge fail, fallback escape complet (pas d'HTML mais pas de XSS) */
    void err;
    return escapeHtml(html);
  }
}

/**
 * Sanitize URL (anti javascript: + data: + vbscript: schemes).
 * Utilise pour href/src dynamiques.
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url) return '';
  const trimmed = String(url).trim().toLowerCase();
  if (trimmed.startsWith('javascript:') || trimmed.startsWith('vbscript:') || trimmed.startsWith('data:text/html')) {
    return ''; /* unsafe scheme — refuse */
  }
  return String(url);
}
