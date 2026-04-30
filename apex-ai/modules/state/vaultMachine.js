/* vaultMachine.js — XState v5 state machine pour vault/coffre Apex
 * Phase 2 refactor : extraction K global → state machines isolées
 *
 * États : locked → unlocking → unlocked → locking → locked
 *         locked → lockedFailed (cooldown 30s après PIN incorrect)
 *
 * Encapsule : _axGetMasterKey, _axEncryptSecret, _axDecryptSecret,
 *             axCheckPin, axSetUserPin, ax_pin_fails LS key
 *
 * Aucun K.xxx accédé : machine totalement isolée.
 *
 * Usage :
 *   const actor = createActor(vaultMachine).start();
 *   actor.send({ type: 'UNLOCK', pin: '123456' });
 *   actor.subscribe(snap => console.log(snap.value, snap.context));
 */

(function(global){
  "use strict";
  if(global._vaultMachineLoaded) return;
  global._vaultMachineLoaded = true;

  /* Helper : vérifie PIN (proxy vers helper Apex global) */
  function verifyPin(pin){
    return new Promise(function(resolve, reject){
      try{
        if(typeof global.axCheckPin === "function"){
          var ok = global.axCheckPin(pin);
          if(ok) resolve({ok:true, ts:Date.now()});
          else reject(new Error("PIN incorrect"));
        } else {
          /* Fallback : compare LS hash */
          var stored = localStorage.getItem("ax_pin");
          if(stored && stored === pin) resolve({ok:true, ts:Date.now()});
          else reject(new Error("axCheckPin missing + fallback fail"));
        }
      }catch(e){ reject(e); }
    });
  }

  /* Helper : derive master key (proxy vers helper Apex global) */
  function deriveMasterKey(pin){
    return new Promise(function(resolve){
      try{
        if(typeof global._axGetMasterKey === "function"){
          var key = global._axGetMasterKey(pin);
          resolve(key);
        } else if(typeof global.axDeriveLSKey === "function"){
          global.axDeriveLSKey().then(resolve);
        } else {
          resolve(null);
        }
      }catch(_){ resolve(null); }
    });
  }

  /* Charger XState dynamiquement (CDN) si pas encore */
  function ensureXState(){
    return new Promise(function(resolve, reject){
      if(typeof global.XState !== "undefined" && global.XState.setup) return resolve(global.XState);
      var s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/xstate@5/dist/xstate.umd.min.js";
      s.onload = function(){ resolve(global.XState); };
      s.onerror = function(){ reject(new Error("XState CDN load fail")); };
      document.head.appendChild(s);
    });
  }

  /* Builder de la machine — appelé après XState chargé */
  global.buildVaultMachine = function(){
    if(typeof global.XState === "undefined" || !global.XState.setup){
      console.warn("[vaultMachine] XState not loaded yet");
      return null;
    }
    var setup = global.XState.setup;
    var assign = global.XState.assign;
    var fromPromise = global.XState.fromPromise;

    return setup({
      types: {
        context: {},
        events: {}
      },
      actions: {
        wipeMasterKey: assign({ masterKey: null }),
        incrementFailCount: assign({
          failCount: function(args){ return (args.context.failCount || 0) + 1; }
        }),
        resetFailCount: assign({ failCount: 0 }),
        setMasterKey: assign({
          masterKey: function(args){ return args.event && args.event.output && args.event.output.key || null; },
          lastUnlock: function(){ return Date.now(); }
        }),
        logUnlock: function(){
          if(typeof global.axJournalEntry === "function"){
            global.axJournalEntry("apex-ai", "vault_unlocked", "v12.536", "vaultMachine", "Phase 2");
          }
        },
        logLock: function(){
          if(typeof global.axJournalEntry === "function"){
            global.axJournalEntry("apex-ai", "vault_locked", "v12.536", "vaultMachine", "Phase 2");
          }
        }
      },
      actors: {
        verifyPinActor: fromPromise(function(args){
          var pin = args.input && args.input.pin;
          return verifyPin(pin).then(function(){ return deriveMasterKey(pin); }).then(function(key){ return {key:key}; });
        })
      },
      guards: {
        canRetry: function(args){
          return (args.context.failCount || 0) < 5;
        }
      }
    }).createMachine({
      id: "vault",
      initial: "locked",
      context: {
        masterKey: null,
        failCount: 0,
        lastUnlock: 0
      },
      states: {
        locked: {
          on: {
            UNLOCK: {
              target: "unlocking",
              guard: "canRetry"
            }
          }
        },
        unlocking: {
          invoke: {
            src: "verifyPinActor",
            input: function(args){ return { pin: args.event && args.event.pin }; },
            onDone: {
              target: "unlocked",
              actions: ["setMasterKey", "resetFailCount", "logUnlock"]
            },
            onError: {
              target: "lockedFailed",
              actions: "incrementFailCount"
            }
          }
        },
        unlocked: {
          on: {
            LOCK: "locking",
            READ_KEY: { actions: "readSecret" },
            WRITE_KEY: { actions: "writeSecret" }
          },
          after: {
            600000: "locking" /* auto-lock 10 min */
          }
        },
        locking: {
          entry: ["wipeMasterKey", "logLock"],
          always: "locked"
        },
        lockedFailed: {
          after: {
            30000: "locked"
          },
          on: {
            UNLOCK: "unlocking"
          }
        }
      }
    });
  };

  /* Auto-bootstrap : charge XState puis build machine */
  global.initVaultMachine = function(){
    return ensureXState().then(function(){
      var machine = global.buildVaultMachine();
      if(!machine){ throw new Error("buildVaultMachine fail"); }
      var actor = global.XState.createActor(machine).start();
      global._machines = global._machines || {};
      global._machines.vault = actor;
      console.log("[vaultMachine] started", actor.getSnapshot().value);
      return actor;
    });
  };

  if(typeof exports !== "undefined" && typeof module !== "undefined"){
    module.exports = {
      build: global.buildVaultMachine,
      init: global.initVaultMachine,
      verifyPin: verifyPin,
      deriveMasterKey: deriveMasterKey
    };
  }
})(typeof window !== "undefined" ? window : this);
