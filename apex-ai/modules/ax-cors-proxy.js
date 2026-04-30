/* ax-cors-proxy.js — v12.511 routing tests CORS via Cloudflare worker
 * Phase 1 refactor extraction (3.6 KB)
 */
(function(global){
  "use strict";
  if(global._axCorsProxyLoaded) return;
  global._axCorsProxyLoaded = true;

  global.AX_CORS_BLOCKED_APIS = global.AX_CORS_BLOCKED_APIS || [
    "ax_perplexity_key","ax_grok_key","ax_xai_key","ax_deepseek_key",
    "ax_replicate_key","ax_huggingface_key","ax_cohere_key","ax_github_token",
    "ax_elevenlabs_key","ax_finnhub_key"
  ];

  global.axIsCORSBlocked = function(key){
    return global.AX_CORS_BLOCKED_APIS.indexOf(key) >= 0;
  };

  global.axBuildCorsProxyUrl = function(targetUrl){
    var lg = global.lg || function(k, d){var v=localStorage.getItem(k);return v||d;};
    var proxy = lg("ax_cors_proxy_url", "");
    if(!proxy) return null;
    return proxy.replace(/\/$/,"") + "?url=" + encodeURIComponent(targetUrl);
  };

  global.axTestCorsBlockedViaProxy = function(key){
    var lg = global.lg || function(k, d){var v=localStorage.getItem(k);return v||d;};
    var proxy = lg("ax_cors_proxy_url", "");
    if(!proxy) return Promise.resolve({ok:false, msg:"ax_cors_proxy_url non configure"});
    var v = lg(key, "");
    if(typeof v !== "string") v = String(v||"");
    v = v.replace(/^["“”‘’]+|["“”‘’]+$/g,"").trim();
    if(!v) return Promise.resolve({ok:false, msg:"vide"});

    var testMap = {
      "ax_perplexity_key": {url:"https://api.perplexity.ai/chat/completions", method:"POST", auth:"Bearer ", body:'{"model":"sonar","messages":[{"role":"user","content":"hi"}],"max_tokens":1}'},
      "ax_grok_key": {url:"https://api.x.ai/v1/models", method:"GET", auth:"Bearer "},
      "ax_xai_key": {url:"https://api.x.ai/v1/models", method:"GET", auth:"Bearer "},
      "ax_deepseek_key": {url:"https://api.deepseek.com/v1/models", method:"GET", auth:"Bearer "},
      "ax_replicate_key": {url:"https://api.replicate.com/v1/account", method:"GET", auth:"Token "},
      "ax_huggingface_key": {url:"https://huggingface.co/api/whoami-v2", method:"GET", auth:"Bearer "},
      "ax_cohere_key": {url:"https://api.cohere.com/v1/models", method:"GET", auth:"Bearer "},
      "ax_github_token": {url:"https://api.github.com/user", method:"GET", auth:"Bearer "},
      "ax_elevenlabs_key": {url:"https://api.elevenlabs.io/v1/user", method:"GET", customHeader:"xi-api-key"},
      "ax_finnhub_key": {url:"https://finnhub.io/api/v1/quote?symbol=AAPL&token="+encodeURIComponent(v), method:"GET"}
    };
    var t = testMap[key];
    if(!t) return Promise.resolve({ok:false, msg:"non geree"});

    var headers = {};
    if(t.auth) headers["Authorization"] = t.auth + v;
    if(t.customHeader) headers[t.customHeader] = v;
    if(t.method === "POST") headers["Content-Type"] = "application/json";

    var ctrl = (typeof AbortController !== "undefined") ? new AbortController() : null;
    var to = setTimeout(function(){ if(ctrl) try{ctrl.abort();}catch(_){} }, 15000);

    return fetch(global.axBuildCorsProxyUrl(t.url), {
      method: t.method, headers: headers, body: t.body || undefined,
      signal: ctrl ? ctrl.signal : undefined
    }).then(function(r){
      clearTimeout(to);
      var ok = r.ok || (t.method === "POST" && r.status === 400);
      return {ok:ok, status:r.status, msg:"HTTP "+r.status};
    }).catch(function(e){
      clearTimeout(to);
      return {ok:false, msg:String(e.message||e).slice(0,80)};
    });
  };

  if(typeof exports !== "undefined" && typeof module !== "undefined"){
    module.exports = {
      isCORSBlocked: global.axIsCORSBlocked,
      buildProxyUrl: global.axBuildCorsProxyUrl,
      testViaProxy: global.axTestCorsBlockedViaProxy
    };
  }
})(typeof window !== "undefined" ? window : this);
