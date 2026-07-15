/**
 * En-têtes CORS partagés — Apex Chat workers (SMS, push, IA, API).
 *
 * Fabrique PURE : produit exactement le même objet qu'avant (comportement
 * strictement inchangé), mutualisé pour supprimer la duplication répétée dans
 * les 4 workers. `Access-Control-Allow-Origin: '*'` conservé à l'identique ;
 * le durcissement par allowlist d'origines se fera séparément, avec test live.
 *
 * Pas de branche / pas de paramètre par défaut → 100% de couverture garantie
 * dès qu'un worker l'appelle (gate vitest workers/** à 100%).
 */
export function corsHeaders(methods, headers) {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': methods,
    'Access-Control-Allow-Headers': headers,
  };
}

/**
 * Fabrique de la réponse JSON standard des workers, liée à un objet CORS donné.
 * Remplace la fonction `json()` dupliquée à l'identique dans chaque worker —
 * SEULE la définition change (aucun site d'appel touché), sortie strictement
 * identique : Content-Type JSON + en-têtes CORS + en-têtes optionnels (api).
 */
export function makeJson(cors) {
  return (data, status = 200, extraHeaders = {}) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json', ...cors, ...extraHeaders },
    });
}
