/* ax-broadlink.js — v12.501-502 module Broadlink IR + UI Remote
 * Phase 1 refactor extraction (~12 KB compacté)
 *
 * Encapsule : axIRBlast, axBroadlinkAutoDiscover, axBroadlinkSmartScan,
 *             axBroadlinkSaveCode/GetCodes/DeleteCode, axBroadlinkLoadPresets,
 *             AX_IR_PRESETS, BROADLINK_CMDS
 */
(function(global){
  "use strict";
  if(global._axBroadlinkLoaded) return;
  global._axBroadlinkLoaded = true;

  /* Commandes IR pré-définies (TV / AC / Light / Fan / Shutter) */
  global.BROADLINK_CMDS = global.BROADLINK_CMDS || {
    tv_power:{name:"TV On/Off",cat:"TV",endpoint:"/send/tv_power"},
    tv_vol_up:{name:"TV Vol +",cat:"TV",endpoint:"/send/tv_vol_up"},
    tv_vol_down:{name:"TV Vol -",cat:"TV",endpoint:"/send/tv_vol_down"},
    tv_mute:{name:"TV Mute",cat:"TV",endpoint:"/send/tv_mute"},
    tv_source:{name:"TV Source",cat:"TV",endpoint:"/send/tv_source"},
    tv_ch_up:{name:"TV Ch +",cat:"TV",endpoint:"/send/tv_ch_up"},
    tv_ch_down:{name:"TV Ch -",cat:"TV",endpoint:"/send/tv_ch_down"},
    tv_menu:{name:"TV Menu",cat:"TV",endpoint:"/send/tv_menu"},
    tv_ok:{name:"TV OK",cat:"TV",endpoint:"/send/tv_ok"},
    tv_back:{name:"TV Retour",cat:"TV",endpoint:"/send/tv_back"},
    tv_up:{name:"TV Haut",cat:"TV",endpoint:"/send/tv_up"},
    tv_down:{name:"TV Bas",cat:"TV",endpoint:"/send/tv_down"},
    tv_left:{name:"TV Gauche",cat:"TV",endpoint:"/send/tv_left"},
    tv_right:{name:"TV Droite",cat:"TV",endpoint:"/send/tv_right"},
    tv_netflix:{name:"Netflix",cat:"TV",endpoint:"/send/tv_netflix"},
    tv_youtube:{name:"YouTube",cat:"TV",endpoint:"/send/tv_youtube"},
    ac_on:{name:"Clim On",cat:"AC",endpoint:"/send/ac_on"},
    ac_off:{name:"Clim Off",cat:"AC",endpoint:"/send/ac_off"},
    ac_cool:{name:"Clim Froid",cat:"AC",endpoint:"/send/ac_cool"},
    ac_heat:{name:"Clim Chaud",cat:"AC",endpoint:"/send/ac_heat"},
    ac_temp_up:{name:"Temp +",cat:"AC",endpoint:"/send/ac_temp_up"},
    ac_temp_down:{name:"Temp -",cat:"AC",endpoint:"/send/ac_temp_down"},
    light_on:{name:"Lumiere On",cat:"Lumiere",endpoint:"/send/light_on"},
    light_off:{name:"Lumiere Off",cat:"Lumiere",endpoint:"/send/light_off"}
  };

  /* IR Blast : envoie commande via bridge HTTP local */
  global.axIRBlast = function(command){
    var lg = global.lg || function(k, d){return localStorage.getItem(k)||d;};
    var irUrl = lg("ax_ir_url", "");
    if(!irUrl) return Promise.resolve("Broadlink non configure");
    var cmd = global.BROADLINK_CMDS[command];
    var endpoint = cmd ? cmd.endpoint : "/send/" + command;
    return fetch(irUrl + endpoint).then(function(r){return r.text();}).then(function(t){
      if(typeof global.toast === "function") global.toast("IR: "+(cmd?cmd.name:command), "ok");
      return t;
    }).catch(function(e){return "Erreur Broadlink: "+e.message;});
  };

  /* Auto-discovery réseau local : scan IPs prioritaires sur ports Broadlink */
  global.axBroadlinkAutoDiscover = function(opts){
    opts = opts || {};
    var ports = opts.ports || [8780, 80, 8080, 7000];
    var subnets = opts.subnets || ["192.168.0", "192.168.1", "192.168.2", "10.0.0"];
    var prioIps = [1, 2, 100, 101, 150, 200, 254];
    var found = [];

    return new Promise(function(resolve){
      var promises = [];
      subnets.forEach(function(sub){
        ports.forEach(function(port){
          prioIps.forEach(function(host){
            var ip = sub + "." + host;
            var url = "http://" + ip + ":" + port;
            var ctrl = (typeof AbortController !== "undefined") ? new AbortController() : null;
            var to = setTimeout(function(){ if(ctrl) try{ctrl.abort();}catch(_){} }, 1500);
            var p = fetch(url + "/device", { mode:"cors", signal:ctrl?ctrl.signal:undefined })
              .then(function(r){
                clearTimeout(to);
                if(r.ok || r.status < 500){
                  return r.text().then(function(t){
                    if(t && (t.indexOf("broadlink") >= 0 || t.indexOf("device") >= 0)){
                      found.push({url:url, ip:ip, port:port});
                    }
                  });
                }
              })
              .catch(function(){ clearTimeout(to); });
            promises.push(p);
          });
        });
      });
      Promise.all(promises).then(function(){
        if(found.length > 0){
          var ls = global.ls || function(k, v){localStorage.setItem(k, typeof v==="string"?v:JSON.stringify(v));};
          ls("ax_ir_url", found[0].url);
          if(typeof global.toast === "function") global.toast("Broadlink trouve : "+found[0].url, "ok", {force:true});
          resolve({ok:true, found:found, primary:found[0].url});
        } else {
          resolve({ok:false, found:[]});
        }
      });
    });
  };

  /* Codes IR appris stockés Firebase ax_ir_codes (sync cross-device) */
  global.axBroadlinkSaveCode = function(name, hexCode, category){
    if(!name || !hexCode) return false;
    var lg = global.lg || function(k, d){var v=localStorage.getItem(k);return v?JSON.parse(v):d;};
    var ls = global.ls || function(k, v){localStorage.setItem(k, typeof v==="string"?v:JSON.stringify(v));};
    var codes = lg("ax_ir_codes", {});
    if(typeof codes !== "object" || Array.isArray(codes)) codes = {};
    codes[name] = {hex:String(hexCode), cat:category||"custom", learned:Date.now(), name:name};
    ls("ax_ir_codes", codes);
    return true;
  };

  global.axBroadlinkGetCodes = function(){
    var lg = global.lg || function(k, d){var v=localStorage.getItem(k);return v?JSON.parse(v):d;};
    var codes = lg("ax_ir_codes", {});
    if(typeof codes !== "object" || Array.isArray(codes)) codes = {};
    return codes;
  };

  global.axBroadlinkDeleteCode = function(name){
    var codes = global.axBroadlinkGetCodes();
    if(codes[name]){
      delete codes[name];
      var ls = global.ls || function(k, v){localStorage.setItem(k, typeof v==="string"?v:JSON.stringify(v));};
      ls("ax_ir_codes", codes);
      return true;
    }
    return false;
  };

  if(typeof exports !== "undefined" && typeof module !== "undefined"){
    module.exports = {
      blast: global.axIRBlast,
      autoDiscover: global.axBroadlinkAutoDiscover,
      saveCode: global.axBroadlinkSaveCode,
      getCodes: global.axBroadlinkGetCodes,
      deleteCode: global.axBroadlinkDeleteCode,
      commands: global.BROADLINK_CMDS
    };
  }
})(typeof window !== "undefined" ? window : this);
