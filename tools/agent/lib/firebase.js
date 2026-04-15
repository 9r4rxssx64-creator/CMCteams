// Client léger pour Firebase RTDB (REST API) — pas de dépendance
// Lit et écrit les mêmes clés que l'app CMC Teams

export async function fbGet(fbUrl, key, basePath = "/cmcteams") {
  const url = `${fbUrl}${basePath}/${encodeURIComponent(key)}.json`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Firebase GET ${key}: HTTP ${r.status}`);
  return r.json();
}

export async function fbSet(fbUrl, key, value, basePath = "/cmcteams") {
  const url = `${fbUrl}${basePath}/${encodeURIComponent(key)}.json`;
  const r = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(value),
  });
  if (!r.ok) throw new Error(`Firebase PUT ${key}: HTTP ${r.status}`);
  return true;
}

export async function fbGetAll(fbUrl, basePath = "/cmcteams") {
  const url = `${fbUrl}${basePath}.json`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Firebase GETALL: HTTP ${r.status}`);
  return r.json();
}

/**
 * Snapshot complet de l'état CMC Teams (utilisé par l'agent).
 */
export async function fetchCmcState(fbUrl) {
  const all = await fbGetAll(fbUrl);
  return all || {};
}

export async function saveCmcState(fbUrl, key, value) {
  return fbSet(fbUrl, key, value);
}
