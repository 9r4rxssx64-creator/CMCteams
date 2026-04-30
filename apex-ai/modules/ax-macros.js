/* ax-macros.js — v12.513 macros multi-actions + per-room
 * Phase 1 refactor extraction (~9 KB)
 */
(function(global){
  "use strict";
  if(global._axMacrosLoaded) return;
  global._axMacrosLoaded = true;

  global.AX_MACROS_DEFAULT = global.AX_MACROS_DEFAULT || {
    "tout_off": {
      icon:"&#127797;", name:"Tout eteindre",
      actions:[
        {fn:"axIRBlast", args:["tv_power"]},
        {fn:"axIRBlast", args:["ac_off"]},
        {fn:"axIRBlast", args:["light_off"]},
        {fn:"axTVCommand", args:["power"]}
      ]
    },
    "cinema": {
      icon:"&#127916;", name:"Mode Cinema",
      actions:[
        {fn:"axIRBlast", args:["light_off"]},
        {fn:"axIRBlast", args:["tv_power"]},
        {fn:"axSetTheme", args:["dark"]},
        {fn:"axLocalDeviceControl", args:["silent"]}
      ]
    },
    "reveil": {
      icon:"&#9728;", name:"Reveil",
      actions:[
        {fn:"axIRBlast", args:["light_on"]},
        {fn:"axIRBlast", args:["ac_on"]},
        {fn:"axDailyBriefing", args:[]}
      ]
    },
    "bonne_nuit": {
      icon:"&#127769;", name:"Bonne nuit",
      actions:[
        {fn:"axIRBlast", args:["tv_power"]},
        {fn:"axIRBlast", args:["light_off"]},
        {fn:"axIRBlast", args:["ac_off"]},
        {fn:"axSetTheme", args:["dark"]}
      ]
    },
    "travail": {
      icon:"&#128188;", name:"Mode Travail",
      actions:[
        {fn:"axIRBlast", args:["light_on"]},
        {fn:"axSetTheme", args:["light"]},
        {fn:"axPomodoroStart", args:[25]}
      ]
    },
    "fete": {
      icon:"&#127881;", name:"Mode Fete",
      actions:[
        {fn:"axIRBlast", args:["light_on"]},
        {fn:"axSetTheme", args:["casino"]},
        {fn:"axSpotifyPlaylist", args:["party"]}
      ]
    },
    "depart_maison": {
      icon:"&#128682;", name:"Depart maison",
      actions:[
        {fn:"axIRBlast", args:["tv_power"]},
        {fn:"axIRBlast", args:["light_off"]},
        {fn:"axIRBlast", args:["ac_off"]},
        {fn:"axKillAllDevices", args:[]}
      ]
    },
    "arrivee_maison": {
      icon:"&#127968;", name:"Arrivee maison",
      actions:[
        {fn:"axIRBlast", args:["light_on"]},
        {fn:"axIRBlast", args:["ac_on"]},
        {fn:"axDailyBriefing", args:[]}
      ]
    }
  };

  global.axGetMacros = function(){
    var lg = global.lg || function(k, d){var v=localStorage.getItem(k);return v?JSON.parse(v):d;};
    var custom = lg("ax_macros_custom", {});
    if(typeof custom !== "object" || Array.isArray(custom)) custom = {};
    var merged = {};
    Object.keys(global.AX_MACROS_DEFAULT).forEach(function(k){ merged[k] = global.AX_MACROS_DEFAULT[k]; });
    Object.keys(custom).forEach(function(k){ merged[k] = custom[k]; });
    return merged;
  };

  global.axRunMacro = function(macroId){
    var macros = global.axGetMacros();
    var m = macros[macroId];
    if(!m){
      if(typeof global.toast === "function") global.toast("Macro inconnue", "warn", {force:true});
      return Promise.resolve({ok:false});
    }
    var results = [];
    return m.actions.reduce(function(prev, action){
      return prev.then(function(){
        return new Promise(function(resolve){
          setTimeout(function(){
            try{
              var fn = global[action.fn];
              if(typeof fn === "function"){
                var r = fn.apply(null, action.args || []);
                results.push({fn:action.fn, ok:true});
                if(r && typeof r.then === "function"){ r.then(resolve).catch(resolve); }
                else resolve();
              } else { results.push({fn:action.fn, ok:false}); resolve(); }
            }catch(e){ results.push({fn:action.fn, ok:false}); resolve(); }
          }, 200);
        });
      });
    }, Promise.resolve()).then(function(){
      var ok = results.filter(function(r){return r.ok;}).length;
      if(typeof global.toast === "function") global.toast("Macro "+m.name+" : "+ok+"/"+results.length, ok===results.length?"ok":"warn", {force:true});
      return {ok:true, results:results};
    });
  };

  global.axSaveMacro = function(macroId, macro){
    if(!macroId || !macro || !macro.actions) return false;
    var lg = global.lg || function(k, d){var v=localStorage.getItem(k);return v?JSON.parse(v):d;};
    var ls = global.ls || function(k, v){localStorage.setItem(k, typeof v==="string"?v:JSON.stringify(v));};
    var custom = lg("ax_macros_custom", {});
    custom[macroId] = macro;
    ls("ax_macros_custom", custom);
    return true;
  };

  global.axGetRooms = function(){
    var lg = global.lg || function(k, d){var v=localStorage.getItem(k);return v?JSON.parse(v):d;};
    var rooms = lg("ax_rooms", {});
    if(typeof rooms !== "object" || Array.isArray(rooms)) rooms = {};
    return rooms;
  };

  global.axAddDeviceToRoom = function(roomId, deviceIp){
    var lg = global.lg || function(k, d){var v=localStorage.getItem(k);return v?JSON.parse(v):d;};
    var ls = global.ls || function(k, v){localStorage.setItem(k, typeof v==="string"?v:JSON.stringify(v));};
    var rooms = global.axGetRooms();
    if(!rooms[roomId]) rooms[roomId] = {name:roomId, devices:[]};
    if(rooms[roomId].devices.indexOf(deviceIp) < 0) rooms[roomId].devices.push(deviceIp);
    ls("ax_rooms", rooms);
    return true;
  };

  if(typeof exports !== "undefined" && typeof module !== "undefined"){
    module.exports = {
      defaults: global.AX_MACROS_DEFAULT,
      get: global.axGetMacros,
      run: global.axRunMacro,
      save: global.axSaveMacro,
      getRooms: global.axGetRooms,
      addToRoom: global.axAddDeviceToRoom
    };
  }
})(typeof window !== "undefined" ? window : this);
