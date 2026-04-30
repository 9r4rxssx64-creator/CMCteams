/* ax-encrypt-ls.js — v12.529 AES-GCM localStorage encrypt
 * Phase 1 refactor extraction (~5 KB)
 */
(function(global){
  "use strict";
  if(global._axEncryptLsLoaded) return;
  global._axEncryptLsLoaded = true;

  global.AX_LS_ENCRYPT_KEYS = global.AX_LS_ENCRYPT_KEYS || [
    "ax_api_key","ax_shared_api_key","ax_openai_key","ax_gemini_key","ax_groq_key",
    "ax_openrouter_key","ax_grok_key","ax_xai_key","ax_deepseek_key","ax_cohere_key",
    "ax_mistral_key","ax_perplexity_key","ax_replicate_key","ax_huggingface_key",
    "ax_elevenlabs_key","ax_anthropic_key",
    "ax_github_token","ax_cloudflare_token","ax_vercel_token","ax_stripe_secret",
    "ax_stripe_pub","ax_stripe_restricted","ax_stripe_webhook",
    "ax_iban","ax_btc_address","ax_eth_address","ax_usdc_address",
    "ax_telegram_token","ax_sendgrid_key","ax_twilio_sid","ax_finnhub_key",
    "ax_emailjs_serviceid","ax_emailjs_templateid","ax_emailjs_userid",
    "ax_paypal_me","ax_revolut_tag","ax_lydia_phone",
    "ax_push_admin_token","ax_master_passphrase"
  ];

  global.AX_LS_ENC_PREFIX = "AXENC1:";

  global.axIsEncryptableKey = function(k){
    return global.AX_LS_ENCRYPT_KEYS.indexOf(k) >= 0;
  };

  global.axDeriveLSKey = async function(){
    if(global._axLSKey) return global._axLSKey;
    try{
      var lg = global.lg || function(k, d){var v=localStorage.getItem(k);return v||d;};
      var pin = lg("ax_pin","") || lg("ax_master_passphrase","");
      var fp = navigator.userAgent.slice(0,40) + "|" + (navigator.language||"") + "|" + (screen.width||"") + "x" + (screen.height||"");
      var seed = (pin || "ax-default-fallback") + "|" + fp;
      var raw = new TextEncoder().encode(seed);
      var hash = await crypto.subtle.digest("SHA-256", raw);
      var key = await crypto.subtle.importKey("raw", hash, {name:"AES-GCM"}, false, ["encrypt","decrypt"]);
      global._axLSKey = key;
      return key;
    }catch(_){ return null; }
  };

  global.axEncryptLS = async function(plain){
    if(!plain) return "";
    var key = await global.axDeriveLSKey();
    if(!key) return plain;
    var iv = crypto.getRandomValues(new Uint8Array(12));
    var ct = await crypto.subtle.encrypt({name:"AES-GCM", iv:iv}, key, new TextEncoder().encode(plain));
    var combined = new Uint8Array(iv.length + ct.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ct), iv.length);
    return global.AX_LS_ENC_PREFIX + btoa(String.fromCharCode.apply(null, combined));
  };

  global.axDecryptLS = async function(enc){
    if(!enc || typeof enc !== "string" || enc.indexOf(global.AX_LS_ENC_PREFIX) !== 0) return enc;
    var key = await global.axDeriveLSKey();
    if(!key) return enc;
    try{
      var b64 = enc.slice(global.AX_LS_ENC_PREFIX.length);
      var bin = atob(b64);
      var bytes = new Uint8Array(bin.length);
      for(var i=0;i<bin.length;i++) bytes[i] = bin.charCodeAt(i);
      var iv = bytes.slice(0,12);
      var ct = bytes.slice(12);
      var dec = await crypto.subtle.decrypt({name:"AES-GCM", iv:iv}, key, ct);
      return new TextDecoder().decode(dec);
    }catch(_){ return enc; }
  };

  global.axMigrateLSEncrypt = async function(){
    var migrated = 0, skipped = 0;
    for(var i=0; i<global.AX_LS_ENCRYPT_KEYS.length; i++){
      var k = global.AX_LS_ENCRYPT_KEYS[i];
      try{
        var v = localStorage.getItem(k);
        if(!v) continue;
        if(v.indexOf(global.AX_LS_ENC_PREFIX) === 0){ skipped++; continue; }
        var encrypted = await global.axEncryptLS(v);
        localStorage.setItem(k, encrypted);
        migrated++;
      }catch(_){ skipped++; }
    }
    return {migrated:migrated, skipped:skipped};
  };

  if(typeof exports !== "undefined" && typeof module !== "undefined"){
    module.exports = {
      isEncryptable: global.axIsEncryptableKey,
      deriveKey: global.axDeriveLSKey,
      encrypt: global.axEncryptLS,
      decrypt: global.axDecryptLS,
      migrate: global.axMigrateLSEncrypt
    };
  }
})(typeof window !== "undefined" ? window : this);
