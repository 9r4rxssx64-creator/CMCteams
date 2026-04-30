/* ax-storage-cleanup.js — v12.530 storage iOS emergency cleanup
 * Phase 1 refactor extraction (~10 KB partial - core helpers seuls)
 */
(function(global){
  "use strict";
  if(global._axStorageCleanupLoaded) return;
  global._axStorageCleanupLoaded = true;

  global.axStorageReport = function(){
    try{
      var used = 0, perKey = {};
      for(var k in localStorage){
        if(localStorage.hasOwnProperty(k)){
          var size = (k.length + (localStorage[k]||"").length) * 2;
          used += size;
          perKey[k] = Math.round(size/1024);
        }
      }
      var top10 = Object.keys(perKey).sort(function(a,b){return perKey[b]-perKey[a];}).slice(0,10);
      var top10Detail = {};
      top10.forEach(function(k){top10Detail[k] = perKey[k] + " Ko";});
      return {
        total_kb: Math.round(used/1024),
        pct_quota: Math.round((used/5242880)*100),
        total_keys: Object.keys(perKey).length,
        top10_largest: top10Detail,
        alert: used > 5242880 * 0.85 ? "CRITICAL" : used > 5242880 * 0.6 ? "WARN" : "OK"
      };
    }catch(_){ return {error:"unavailable"}; }
  };

  global.axStorageEmergencyCleanup = function(){
    try{
      var used = 0;
      for(var k in localStorage){
        if(localStorage.hasOwnProperty(k)) used += (k.length + (localStorage[k]||"").length) * 2;
      }
      var pct = Math.round((used / 5242880) * 100);
      if(pct < 90) return {ok:true, pct:pct, action:"none"};

      var freed = 0;

      /* Trim ax_msgs_* per conv */
      for(var k in localStorage){
        if(k.indexOf("ax_msgs_") === 0){
          try{
            var msgs = JSON.parse(localStorage.getItem(k) || "[]");
            if(Array.isArray(msgs) && msgs.length > 200){
              var before = localStorage.getItem(k).length;
              msgs = msgs.slice(-200);
              localStorage.setItem(k, JSON.stringify(msgs));
              freed += before - localStorage.getItem(k).length;
            }
          }catch(_){}
        }
      }

      /* Drop old logs > 7 jours */
      var oldThreshold = Date.now() - 7*86400000;
      ["ax_audit","ax_silent_log","ax_err_log","ax_breach_log","ax_security_log",
       "ax_journal","ax_handoff_journal","ax_telemetry_in",
       "ax_persistent_memory","ax_lessons_learned"].forEach(function(k){
        try{
          var arr = JSON.parse(localStorage.getItem(k) || "[]");
          if(Array.isArray(arr) && arr.length > 50){
            var before = localStorage.getItem(k).length;
            arr = arr.filter(function(e){return e && (e.ts||0) > oldThreshold;}).slice(-100);
            localStorage.setItem(k, JSON.stringify(arr));
            freed += before - localStorage.getItem(k).length;
          }
        }catch(_){}
      });

      /* Drop old backups > 3 jours */
      for(var k in localStorage){
        if(k.indexOf("ax_backup_") === 0 || k.indexOf("ax_snapshot_") === 0){
          try{
            var entry = JSON.parse(localStorage.getItem(k));
            if(entry && entry.ts && entry.ts < Date.now() - 3*86400000){
              freed += localStorage.getItem(k).length;
              localStorage.removeItem(k);
            }
          }catch(_){
            freed += (localStorage.getItem(k)||"").length;
            localStorage.removeItem(k);
          }
        }
      }

      var usedAfter = 0;
      for(var k in localStorage){
        if(localStorage.hasOwnProperty(k)) usedAfter += (k.length + (localStorage[k]||"").length) * 2;
      }
      var pctAfter = Math.round((usedAfter / 5242880) * 100);

      return {ok:true, pct_before:pct, pct_after:pctAfter, freed_bytes:freed};
    }catch(e){
      return {ok:false, msg:String(e.message||e).slice(0,80)};
    }
  };

  if(typeof exports !== "undefined" && typeof module !== "undefined"){
    module.exports = {
      report: global.axStorageReport,
      emergencyCleanup: global.axStorageEmergencyCleanup
    };
  }
})(typeof window !== "undefined" ? window : this);
