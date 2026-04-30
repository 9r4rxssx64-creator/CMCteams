/* networkMachine.js — XState v5 state machine pour network state Apex
 * Phase 2 refactor : online/offline/slow/reconnecting + Firebase circuit breaker
 *
 * États : online -> offline -> reconnecting -> online (loop)
 *         online -> slow (timeout 30s -> online)
 */

(function(global){
  "use strict";
  if(global._networkMachineLoaded) return;
  global._networkMachineLoaded = true;

  function reconnectFirebase(){
    return new Promise(function(resolve, reject){
      try{
        if(typeof global.fbStartListening === "function"){
          global.fbStartListening();
          setTimeout(function(){
            if(typeof global._fbEs !== "undefined" && global._fbEs) resolve({ok:true});
            else reject(new Error("Firebase reconnect fail"));
          }, 3000);
        } else {
          reject(new Error("fbStartListening missing"));
        }
      }catch(e){ reject(e); }
    });
  }

  global.buildNetworkMachine = function(){
    if(typeof global.XState === "undefined" || !global.XState.setup){
      console.warn("[networkMachine] XState not loaded");
      return null;
    }
    var setup = global.XState.setup;
    var assign = global.XState.assign;
    var fromPromise = global.XState.fromPromise;

    return setup({
      types: { context: {}, events: {} },
      actions: {
        showOfflineBanner: function(){
          if(typeof global.toast === "function") global.toast("Hors ligne", "warn", {force:true, duration:2000});
        },
        flushSyncQueue: function(){
          if(typeof global.flushSyncQueue === "function") global.flushSyncQueue();
        },
        circuitTrip: assign({ fbCircuitOpen: true }),
        circuitReset: assign({ fbCircuitOpen: false }),
        recordError: assign({
          fbErrTs: function(args){
            var arr = args.context.fbErrTs || [];
            arr.push(Date.now());
            return arr.filter(function(t){ return Date.now() - t < 60000; });
          }
        }),
        setProvider: assign({
          lastProvider: function(args){ return args.event && args.event.provider; }
        })
      },
      actors: {
        reconnectFB: fromPromise(reconnectFirebase)
      }
    }).createMachine({
      id: "network",
      initial: "online",
      context: {
        syncQueue: [],
        fbCircuitOpen: false,
        fbErrTs: [],
        lastProvider: null,
        gemmaReady: false
      },
      states: {
        online: {
          on: {
            OFFLINE: "offline",
            SLOW_DETECTED: "slow",
            FB_DISCONNECT: "reconnecting",
            PROVIDER_CHANGE: { actions: "setProvider" }
          }
        },
        offline: {
          entry: "showOfflineBanner",
          exit: "flushSyncQueue",
          on: { ONLINE: "online" }
        },
        slow: {
          on: { FAST: "online", OFFLINE: "offline" },
          after: { 30000: "online" }
        },
        reconnecting: {
          invoke: {
            src: "reconnectFB",
            onDone: { target: "online", actions: "circuitReset" },
            onError: { target: "offline", actions: ["circuitTrip", "recordError"] }
          }
        }
      }
    });
  };

  global.initNetworkMachine = function(){
    if(typeof global.XState === "undefined") return Promise.reject(new Error("XState not loaded"));
    var machine = global.buildNetworkMachine();
    if(!machine) return Promise.reject(new Error("buildNetworkMachine fail"));
    var actor = global.XState.createActor(machine).start();
    global._machines = global._machines || {};
    global._machines.network = actor;

    /* Auto-bind window online/offline events */
    if(typeof window !== "undefined"){
      window.addEventListener("online", function(){ actor.send({type:"ONLINE"}); });
      window.addEventListener("offline", function(){ actor.send({type:"OFFLINE"}); });
    }
    return Promise.resolve(actor);
  };

  if(typeof exports !== "undefined" && typeof module !== "undefined"){
    module.exports = {
      build: global.buildNetworkMachine,
      init: global.initNetworkMachine
    };
  }
})(typeof window !== "undefined" ? window : this);
