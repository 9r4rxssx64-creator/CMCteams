/* settingsMachine.js — XState v5 state machine pour K.settings
 * Phase 2 refactor : 288 refs K.settings -> machine isolée
 *
 * États : loading -> ready -> saving -> ready (loop)
 *         ready -> error -> ready (after retry/timeout)
 *
 * Encapsule : K.settings.*, axSaveSettings, _applyTheme, axSelectAIModel
 */

(function(global){
  "use strict";
  if(global._settingsMachineLoaded) return;
  global._settingsMachineLoaded = true;

  function loadSettingsFromStorage(){
    return new Promise(function(resolve){
      try{
        var stored = localStorage.getItem("ax_settings");
        if(stored){
          try{ resolve(JSON.parse(stored)); }
          catch(_){ resolve({}); }
        } else { resolve({}); }
      }catch(_){ resolve({}); }
    });
  }

  function persistSettings(settings){
    return new Promise(function(resolve, reject){
      try{
        localStorage.setItem("ax_settings", JSON.stringify(settings));
        if(typeof global.axSaveSettings === "function") global.axSaveSettings(settings);
        resolve({ok:true});
      }catch(e){ reject(e); }
    });
  }

  global.buildSettingsMachine = function(){
    if(typeof global.XState === "undefined" || !global.XState.setup){
      console.warn("[settingsMachine] XState not loaded");
      return null;
    }
    var setup = global.XState.setup;
    var assign = global.XState.assign;
    var fromPromise = global.XState.fromPromise;

    return setup({
      types: { context: {}, events: {} },
      actions: {
        mergeSettings: assign({
          settings: function(args){
            var current = args.context.settings || {};
            var update = (args.event && args.event.update) || {};
            return Object.assign({}, current, update);
          },
          dirty: true
        }),
        markClean: assign({ dirty: false }),
        applyTheme: function(args){
          if(typeof global._applyTheme === "function" && args.context.settings && args.context.settings.theme){
            global._applyTheme(args.context.settings.theme);
          }
        },
        setUser: assign({ userId: function(args){ return args.event && args.event.userId; } })
      },
      actors: {
        loadSettingsActor: fromPromise(loadSettingsFromStorage),
        persistSettingsActor: fromPromise(function(args){
          return persistSettings(args.input && args.input.settings);
        })
      }
    }).createMachine({
      id: "settings",
      initial: "loading",
      context: {
        settings: {},
        userId: null,
        dirty: false,
        error: null
      },
      states: {
        loading: {
          invoke: {
            src: "loadSettingsActor",
            onDone: {
              target: "ready",
              actions: assign({ settings: function(args){ return args.event.output || {}; } })
            },
            onError: { target: "ready" }
          }
        },
        ready: {
          on: {
            UPDATE: { target: "saving", actions: ["mergeSettings", "applyTheme"] },
            USER_CHANGE: { target: "loading", actions: "setUser" }
          }
        },
        saving: {
          invoke: {
            src: "persistSettingsActor",
            input: function(args){ return { settings: args.context.settings }; },
            onDone: { target: "ready", actions: "markClean" },
            onError: { target: "error" }
          }
        },
        error: {
          on: { RETRY: "saving" },
          after: { 5000: "ready" }
        }
      }
    });
  };

  global.initSettingsMachine = function(){
    if(typeof global.XState === "undefined") return Promise.reject(new Error("XState not loaded"));
    var machine = global.buildSettingsMachine();
    if(!machine) return Promise.reject(new Error("buildSettingsMachine fail"));
    var actor = global.XState.createActor(machine).start();
    global._machines = global._machines || {};
    global._machines.settings = actor;
    return Promise.resolve(actor);
  };

  if(typeof exports !== "undefined" && typeof module !== "undefined"){
    module.exports = {
      build: global.buildSettingsMachine,
      init: global.initSettingsMachine
    };
  }
})(typeof window !== "undefined" ? window : this);
