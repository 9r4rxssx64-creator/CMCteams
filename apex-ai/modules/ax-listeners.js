/* ax-listeners.js — v12.528 tracked listeners + cleanup orphans (memory leak fix)
 * Phase 1 refactor extraction (4.5 KB)
 */
(function(global){
  "use strict";
  if(global._axListenersLoaded) return;
  global._axListenersLoaded = true;

  global._axTrackedListeners = global._axTrackedListeners || [];

  /* Wrap addEventListener pour TRACK auto */
  function wrapTarget(target){
    if(!target || target._axListenerWrapped) return;
    target._axListenerWrapped = true;
    var origAdd = target.addEventListener;
    var origRem = target.removeEventListener;
    target.addEventListener = function(event, handler, opts){
      try{
        global._axTrackedListeners.push({target:target, event:event, handler:handler, opts:opts, ts:Date.now()});
        if(global._axTrackedListeners.length > 1000){
          global._axTrackedListeners = global._axTrackedListeners.slice(-1000);
        }
      }catch(_){}
      return origAdd.apply(this, arguments);
    };
    target.removeEventListener = function(event, handler, opts){
      try{
        global._axTrackedListeners = global._axTrackedListeners.filter(function(l){
          return !(l.target === target && l.event === event && l.handler === handler);
        });
      }catch(_){}
      return origRem.apply(this, arguments);
    };
  }

  /* Wrap window + document + body au boot */
  setTimeout(function(){
    try{
      if(typeof window !== "undefined") wrapTarget(window);
      if(typeof document !== "undefined") wrapTarget(document);
      if(document && document.body) wrapTarget(document.body);
    }catch(_){}
  }, 100);

  /* Cleanup batch tous listeners orphans (sauf events critiques) */
  global.axCleanupAllOrphanListeners = function(){
    var arr = global._axTrackedListeners || [];
    var keepEvents = ["beforeunload","unload","pagehide","online","offline","DOMContentLoaded"];
    var removed = 0, kept = [];
    arr.forEach(function(l){
      if(keepEvents.indexOf(l.event) >= 0){ kept.push(l); }
      else { try{ l.target.removeEventListener(l.event, l.handler, l.opts); removed++; }catch(_){} }
    });
    global._axTrackedListeners = kept;
    return {removed:removed, kept:kept.length};
  };

  /* Cleanup orphans de DOM nodes detached (modales fermees) */
  global.axCleanupOrphanModalListeners = function(){
    if(!global._axTrackedListeners) return 0;
    var orphans = global._axTrackedListeners.filter(function(l){
      if(l.target && l.target.nodeType === 1 && !document.body.contains(l.target)) return true;
      return false;
    });
    orphans.forEach(function(l){
      try{ l.target.removeEventListener(l.event, l.handler, l.opts); }catch(_){}
    });
    global._axTrackedListeners = global._axTrackedListeners.filter(function(l){
      return !(l.target && l.target.nodeType === 1 && !document.body.contains(l.target));
    });
    return orphans.length;
  };

  /* Auto-run 60s pour orphans modaux (audit P0 fix) */
  if(!global._axOrphanCleanupRunning){
    global._axOrphanCleanupRunning = true;
    setInterval(function(){
      try{ global.axCleanupOrphanModalListeners(); }catch(_){}
    }, 60000);
  }

  /* Healthcheck */
  global.axListenersHealth = function(){
    var arr = global._axTrackedListeners || [];
    var byEvent = {}, byTarget = {};
    arr.forEach(function(l){
      byEvent[l.event] = (byEvent[l.event]||0)+1;
      var t = l.target === window ? "window" : l.target === document ? "document" : (l.target && l.target.tagName) || "unknown";
      byTarget[t] = (byTarget[t]||0)+1;
    });
    return {
      total: arr.length, by_event: byEvent, by_target: byTarget,
      alert_threshold: arr.length > 200 ? "WARN" : "OK",
      oldest_age_ms: arr.length ? Date.now() - arr[0].ts : 0
    };
  };

  if(typeof exports !== "undefined" && typeof module !== "undefined"){
    module.exports = {
      cleanup: global.axCleanupAllOrphanListeners,
      cleanupOrphans: global.axCleanupOrphanModalListeners,
      health: global.axListenersHealth
    };
  }
})(typeof window !== "undefined" ? window : this);
