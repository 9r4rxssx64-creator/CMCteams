/* userMachine.js — XState v5 state machine pour K.user (711 refs)
 * Phase 2 refactor : foundation - autres machines en dépendent
 *
 * États : anonymous -> authenticating -> authenticated -> loggingOut -> anonymous
 *         authenticated -> viewingAs (admin only) -> authenticated
 *         authenticating -> authFailed (cooldown 30s)
 */

(function(global){
  "use strict";
  if(global._userMachineLoaded) return;
  global._userMachineLoaded = true;

  function verifyCredentials(args){
    var name = args.input && args.input.name;
    var pin = args.input && args.input.pin;
    return new Promise(function(resolve, reject){
      try{
        if(typeof global.axLogin === "function"){
          var ok = global.axLogin(name, pin);
          if(ok && global.K && global.K.user){
            resolve({user: global.K.user, ts:Date.now()});
          } else {
            reject(new Error("Login failed"));
          }
        } else {
          reject(new Error("axLogin missing"));
        }
      }catch(e){ reject(e); }
    });
  }

  function performHardLogout(){
    return new Promise(function(resolve){
      try{
        if(typeof global.axHardLogoutSession === "function") global.axHardLogoutSession();
        else if(typeof global.axLogout === "function") global.axLogout();
        resolve({ok:true});
      }catch(_){ resolve({ok:false}); }
    });
  }

  global.buildUserMachine = function(){
    if(typeof global.XState === "undefined" || !global.XState.setup){
      console.warn("[userMachine] XState not loaded");
      return null;
    }
    var setup = global.XState.setup;
    var assign = global.XState.assign;
    var fromPromise = global.XState.fromPromise;

    return setup({
      types: { context: {}, events: {} },
      actions: {
        setUser: assign({
          user: function(args){ return args.event && args.event.output && args.event.output.user || null; },
          sessionStart: function(){ return Date.now(); },
          failCount: 0
        }),
        clearUser: assign({
          user: null, sessionStart: 0,
          viewAsBackup: null
        }),
        snapshotAdminUser: assign({
          viewAsBackup: function(args){ return args.context.user; },
          user: function(args){ return args.event && args.event.targetUser; }
        }),
        restoreAdminUser: assign({
          user: function(args){ return args.context.viewAsBackup; },
          viewAsBackup: null
        }),
        incrementFail: assign({
          failCount: function(args){ return (args.context.failCount || 0) + 1; }
        }),
        wipeIntervals: function(){
          try{
            if(typeof global._globalIntervals !== "undefined" && Array.isArray(global._globalIntervals)){
              global._globalIntervals.forEach(function(it){
                try{ if(it && it.id != null) clearInterval(it.id); else if(typeof it === "number") clearInterval(it); }catch(_){}
              });
            }
          }catch(_){}
        }
      },
      actors: {
        verifyCredentialsActor: fromPromise(verifyCredentials),
        hardLogoutActor: fromPromise(performHardLogout)
      },
      guards: {
        canRetry: function(args){ return (args.context.failCount || 0) < 5; },
        isAdmin: function(args){
          var user = args.context.user;
          return user && (user.id === "kdmc_admin" || user.role === "admin");
        }
      }
    }).createMachine({
      id: "user",
      initial: "anonymous",
      context: {
        user: null,
        viewAsBackup: null,
        sessionStart: 0,
        failCount: 0
      },
      states: {
        anonymous: {
          on: {
            LOGIN: { target: "authenticating", guard: "canRetry" }
          }
        },
        authenticating: {
          invoke: {
            src: "verifyCredentialsActor",
            input: function(args){ return { name: args.event && args.event.name, pin: args.event && args.event.pin }; },
            onDone: { target: "authenticated", actions: "setUser" },
            onError: { target: "authFailed", actions: "incrementFail" }
          }
        },
        authenticated: {
          on: {
            LOGOUT: "loggingOut",
            VIEW_AS: { target: "viewingAs", guard: "isAdmin", actions: "snapshotAdminUser" },
            SESSION_EXPIRE: "loggingOut"
          },
          after: {
            28800000: "loggingOut" /* 8h SESSION_TTL */
          }
        },
        viewingAs: {
          on: {
            VIEW_AS_BACK: { target: "authenticated", actions: "restoreAdminUser" }
          }
        },
        loggingOut: {
          invoke: {
            src: "hardLogoutActor",
            onDone: { target: "anonymous", actions: ["clearUser", "wipeIntervals"] },
            onError: { target: "anonymous", actions: ["clearUser", "wipeIntervals"] }
          }
        },
        authFailed: {
          after: { 30000: "anonymous" },
          on: { LOGIN: { target: "authenticating", guard: "canRetry" } }
        }
      }
    });
  };

  global.initUserMachine = function(){
    if(typeof global.XState === "undefined") return Promise.reject(new Error("XState not loaded"));
    var machine = global.buildUserMachine();
    if(!machine) return Promise.reject(new Error("buildUserMachine fail"));
    var actor = global.XState.createActor(machine).start();
    global._machines = global._machines || {};
    global._machines.user = actor;
    return Promise.resolve(actor);
  };

  if(typeof exports !== "undefined" && typeof module !== "undefined"){
    module.exports = {
      build: global.buildUserMachine,
      init: global.initUserMachine
    };
  }
})(typeof window !== "undefined" ? window : this);
