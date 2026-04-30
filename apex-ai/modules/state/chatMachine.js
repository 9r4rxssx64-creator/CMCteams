/* chatMachine.js — XState v5 state machine pour chat IA Apex
 * Phase 2 refactor : 503 refs (K.messages 256 + K.conversations 112 +
 *                              K.activeConvId 36 + K.isStreaming 99) -> machine
 *
 * États : idle -> sending -> streaming -> idle (loop)
 *         sending/streaming -> error -> retry -> sending
 *         streaming -> idle (STOP user)
 *         streaming -> error (watchdog 200s timeout)
 */

(function(global){
  "use strict";
  if(global._chatMachineLoaded) return;
  global._chatMachineLoaded = true;

  function callClaudeAPI(args){
    var msgs = args.input && args.input.messages;
    var sysPrompt = args.input && args.input.sysPrompt;
    return new Promise(function(resolve, reject){
      try{
        if(typeof global._callClaudeAPI === "function"){
          /* Wrap car _callClaudeAPI utilise K global, retourne pas de Promise */
          var done = false;
          var checkInterval = setInterval(function(){
            if(global.K && !global.K.isStreaming && !done){
              done = true;
              clearInterval(checkInterval);
              resolve({ok:true, lastMessage: global.K.messages[global.K.messages.length-1]});
            }
          }, 200);
          /* Timeout watchdog 180s */
          setTimeout(function(){
            if(!done){
              done = true;
              clearInterval(checkInterval);
              reject(new Error("Watchdog 180s timeout"));
            }
          }, 180000);
          global._callClaudeAPI(sysPrompt || null, msgs, 0);
        } else {
          reject(new Error("_callClaudeAPI missing"));
        }
      }catch(e){ reject(e); }
    });
  }

  global.buildChatMachine = function(){
    if(typeof global.XState === "undefined" || !global.XState.setup){
      console.warn("[chatMachine] XState not loaded");
      return null;
    }
    var setup = global.XState.setup;
    var assign = global.XState.assign;
    var fromPromise = global.XState.fromPromise;

    return setup({
      types: { context: {}, events: {} },
      actions: {
        pushUserMsg: assign({
          messages: function(args){
            var current = args.context.messages || [];
            var text = args.event && args.event.text;
            return current.concat([{role:"user", content:text, ts:Date.now()}]);
          }
        }),
        appendChunk: assign({
          partialText: function(args){
            return (args.context.partialText || "") + ((args.event && args.event.chunk) || "");
          }
        }),
        commitStreamMsg: assign({
          messages: function(args){
            var current = args.context.messages || [];
            return current.concat([{role:"assistant", content:args.context.partialText, ts:Date.now()}]);
          },
          partialText: ""
        }),
        abortStream: function(args){
          if(args.context.currentAbort){
            try{ args.context.currentAbort.abort(); }catch(_){}
          }
          if(typeof global.window !== "undefined" && global.window._apexCurrentAbort){
            try{ global.window._apexCurrentAbort.abort(); }catch(_){}
          }
        },
        switchConv: assign({
          activeConvId: function(args){ return args.event && args.event.id; }
        }),
        createConv: assign({
          conversations: function(args){
            var current = args.context.conversations || [];
            var newId = "conv_" + Date.now();
            return current.concat([{id:newId, title:"Nouvelle conv", ts:Date.now(), messages:[]}]);
          },
          activeConvId: function(){ return "conv_" + Date.now(); },
          messages: []
        }),
        incrementRetry: assign({
          retryCount: function(args){ return (args.context.retryCount || 0) + 1; }
        }),
        resetRetry: assign({ retryCount: 0 }),
        setError: assign({ error: function(args){ return args.event && args.event.error || "Unknown error"; } })
      },
      actors: {
        callClaudeApiActor: fromPromise(callClaudeAPI)
      },
      guards: {
        canRetry: function(args){ return (args.context.retryCount || 0) < 3; }
      }
    }).createMachine({
      id: "chat",
      initial: "idle",
      context: {
        conversations: [],
        activeConvId: null,
        messages: [],
        currentAbort: null,
        error: null,
        retryCount: 0,
        partialText: ""
      },
      states: {
        idle: {
          on: {
            MSG_SEND: { target: "sending", actions: "pushUserMsg" },
            CONV_SWITCH: { actions: "switchConv" },
            CONV_NEW: { actions: "createConv" }
          }
        },
        sending: {
          invoke: {
            src: "callClaudeApiActor",
            input: function(args){ return { messages: args.context.messages, sysPrompt: args.event && args.event.sysPrompt }; },
            onDone: { target: "streaming" },
            onError: { target: "error", actions: "setError" }
          }
        },
        streaming: {
          on: {
            STREAM_CHUNK: { actions: "appendChunk" },
            STREAM_DONE: { target: "idle", actions: ["commitStreamMsg", "resetRetry"] },
            STREAM_ERROR: { target: "error", actions: "setError" },
            STOP: { target: "idle", actions: "abortStream" }
          },
          after: {
            200000: { target: "error", actions: assign({ error: "watchdog timeout 200s" }) }
          }
        },
        error: {
          on: {
            RETRY: { target: "retry", guard: "canRetry" },
            MSG_SEND: { target: "sending", actions: "pushUserMsg" }
          }
        },
        retry: {
          after: {
            2000: "sending"
          },
          entry: "incrementRetry"
        }
      }
    });
  };

  global.initChatMachine = function(){
    if(typeof global.XState === "undefined") return Promise.reject(new Error("XState not loaded"));
    var machine = global.buildChatMachine();
    if(!machine) return Promise.reject(new Error("buildChatMachine fail"));
    var actor = global.XState.createActor(machine).start();
    global._machines = global._machines || {};
    global._machines.chat = actor;
    return Promise.resolve(actor);
  };

  if(typeof exports !== "undefined" && typeof module !== "undefined"){
    module.exports = {
      build: global.buildChatMachine,
      init: global.initChatMachine
    };
  }
})(typeof window !== "undefined" ? window : this);
