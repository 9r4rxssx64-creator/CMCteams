/* ax-quiet-mode.js — Module extrait du monolith Apex v12.499
 * Phase 1 refactor (CLAUDE.md règle : >15K lignes = refactor obligatoire)
 *
 * Master quiet mode : silencieux pendant 60s post-boot pour reduire bruit.
 * Toggle UI : axToggleQuietMode(true|false)
 *
 * Dependencies externes : window.lg, window.ls, window.toast (du core)
 */

(function(global){
  "use strict";
  if(global._axQuietModeModuleLoaded) return;
  global._axQuietModeModuleLoaded = true;

  /* Init au load : flag default true + bootStartMs */
  if(!global._axQuietBootInit){
    global._axQuietBootInit = true;
    global._axBootStartMs = Date.now();
    try{
      if(localStorage.getItem("ax_quiet_mode") === null){
        localStorage.setItem("ax_quiet_mode", "true");
      }
    }catch(_){}
  }

  /* Helper : true si flag actif ET dans 60s post-boot */
  global._axIsQuietMode = function(){
    try{
      var lg = global.lg || function(k, d){
        var v = localStorage.getItem(k);
        if(v === null || v === undefined) return d;
        try{ return JSON.parse(v); }catch(_){ return v; }
      };
      if(!lg("ax_quiet_mode", true)) return false;
      var since = Date.now() - (global._axBootStartMs || Date.now());
      return since < 60000;
    }catch(_){ return false; }
  };

  /* Toggle UI : active/désactive le quiet mode */
  global.axToggleQuietMode = function(enabled){
    try{
      var lg = global.lg || function(k, d){
        var v = localStorage.getItem(k);
        if(v === null) return d;
        try{ return JSON.parse(v); }catch(_){ return v; }
      };
      var ls = global.ls || function(k, v){
        try{ localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v)); }catch(_){}
      };
      var v = (typeof enabled === "boolean") ? enabled : !lg("ax_quiet_mode", true);
      ls("ax_quiet_mode", v);
      if(!v) global._axBootStartMs = 0;
      if(typeof global.toast === "function"){
        global.toast(
          v ? "Mode calme ACTIVE (boot silencieux)" : "Mode calme DESACTIVE (toasts visibles)",
          v ? "ok" : "info",
          {force:true, duration:3000}
        );
      }
      return v;
    }catch(_){ return true; }
  };

  /* ES6 export pour usage import() futur */
  if(typeof exports !== "undefined" && typeof module !== "undefined"){
    module.exports = {
      isQuietMode: global._axIsQuietMode,
      toggle: global.axToggleQuietMode
    };
  }
})(typeof window !== "undefined" ? window : this);
