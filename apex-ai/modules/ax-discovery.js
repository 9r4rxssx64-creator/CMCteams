/* ax-discovery.js — v12.507+v12.510+v12.512 Smart Discovery WiFi LAN
 * Phase 1 refactor extraction (~12 KB compacté, 53 types LAN)
 *
 * Encapsule : axSmartDiscoverAll, axDeviceCommand, axDetectLocalIP,
 *             axGroupDevicesByCategory, AX_LAN_DEVICES (53 types)
 */
(function(global){
  "use strict";
  if(global._axDiscoveryLoaded) return;
  global._axDiscoveryLoaded = true;

  /* Catalogue 53 types LAN (compactisé : 17 v12.507 + 36 v12.510) */
  global.AX_LAN_DEVICES = global.AX_LAN_DEVICES || [
    /* Media */
    {id:"chromecast",name:"Chromecast",port:8008,path:"/setup/eureka_info",icon:"&#128250;",commands:["cast_url","stop","volume_up","volume_down"]},
    {id:"roku",name:"Roku TV",port:8060,path:"/query/device-info",icon:"&#128250;",commands:["power","home","play","pause","up","down","left","right","ok","back","vol_up","vol_down","mute","netflix","youtube"]},
    {id:"airplay",name:"AirPlay (Apple TV)",port:7000,path:"/info",icon:"&#127911;",commands:["play","pause","stop","volume"]},
    {id:"samsung_tv",name:"Samsung TV",port:8001,path:"/api/v2/",icon:"&#128250;",commands:["power","vol_up","vol_down","netflix","youtube","mute"]},
    {id:"lg_webos",name:"LG WebOS",port:3000,path:"/",icon:"&#128250;",commands:["power","vol_up","vol_down"]},
    {id:"plex",name:"Plex",port:32400,path:"/identity",icon:"&#127916;",commands:[]},
    {id:"jellyfin",name:"Jellyfin",port:8096,path:"/System/Info/Public",icon:"&#127916;",commands:[]},
    {id:"emby",name:"Emby",port:8096,path:"/System/Info/Public",icon:"&#127916;",commands:[]},
    {id:"sonarr",name:"Sonarr",port:8989,path:"/api/v3/system/status",icon:"&#128250;",commands:[]},
    {id:"radarr",name:"Radarr",port:7878,path:"/api/v3/system/status",icon:"&#127916;",commands:[]},
    /* Audio */
    {id:"sonos",name:"Sonos",port:1400,path:"/xml/device_description.xml",icon:"&#127925;",commands:["play","pause","next","prev","vol_up","vol_down","mute"]},
    {id:"yamaha_avr",name:"Yamaha AVR",port:80,path:"/YamahaExtendedControl/v1/system/getDeviceInfo",icon:"&#127925;",commands:["power","volume_up","volume_down","mute"]},
    {id:"denon_avr",name:"Denon HEOS",port:8080,path:"/heos/system/heart_beat",icon:"&#127925;",commands:["power","volume_up","volume_down"]},
    {id:"bose",name:"Bose Soundtouch",port:8090,path:"/now_playing",icon:"&#127925;",commands:["play","pause","next","prev"]},
    {id:"alexa",name:"Amazon Echo",port:55443,path:"/",icon:"&#128264;",commands:["volume_up","volume_down","mute","play","pause"]},
    {id:"google_home",name:"Google Home",port:8443,path:"/",icon:"&#128264;",commands:["play","pause","volume_up","volume_down"]},
    /* Smart Home */
    {id:"hue",name:"Philips Hue",port:80,path:"/api/0/config",icon:"&#128161;",commands:["lights_on","lights_off","dim_up","dim_down"]},
    {id:"home_assistant",name:"Home Assistant",port:8123,path:"/api/",icon:"&#127968;",commands:["all_off","all_on"]},
    {id:"openhab",name:"openHAB",port:8080,path:"/rest/",icon:"&#127968;",commands:["all_off","all_on"]},
    {id:"domoticz",name:"Domoticz",port:8080,path:"/json.htm?type=command&param=getversion",icon:"&#127968;",commands:[]},
    {id:"deconz",name:"deCONZ Zigbee",port:80,path:"/api/",icon:"&#127968;",commands:["lights_on","lights_off"]},
    {id:"shelly",name:"Shelly",port:80,path:"/shelly",icon:"&#128268;",commands:["relay_on","relay_off","status"]},
    {id:"tasmota",name:"Tasmota",port:80,path:"/cm?cmnd=Status",icon:"&#128268;",commands:["power_on","power_off","status"]},
    {id:"esphome",name:"ESPHome",port:6052,path:"/",icon:"&#128268;",commands:["restart","status"]},
    /* NAS */
    {id:"synology",name:"Synology DSM",port:5000,path:"/webapi/auth.cgi",icon:"&#128190;",commands:[]},
    {id:"qnap",name:"QNAP",port:8080,path:"/cgi-bin/",icon:"&#128190;",commands:[]},
    {id:"truenas",name:"TrueNAS",port:80,path:"/api/v2.0/system/info",icon:"&#128190;",commands:[]},
    {id:"unraid",name:"Unraid",port:80,path:"/",icon:"&#128190;",commands:[]},
    {id:"proxmox",name:"Proxmox",port:8006,path:"/api2/json/version",icon:"&#127968;",commands:[]},
    /* Réseau */
    {id:"asus_router",name:"ASUS Router",port:80,path:"/Main_Login.asp",icon:"&#127757;",commands:["reboot","wifi_status"]},
    {id:"netgear_router",name:"Netgear",port:80,path:"/start.htm",icon:"&#127757;",commands:["reboot"]},
    {id:"tplink_router",name:"TP-Link",port:80,path:"/login.htm",icon:"&#127757;",commands:["reboot"]},
    {id:"unifi",name:"UniFi Controller",port:8443,path:"/api/system",icon:"&#127757;",commands:[]},
    {id:"openwrt",name:"OpenWrt",port:80,path:"/cgi-bin/luci/",icon:"&#127757;",commands:[]},
    {id:"pihole",name:"Pi-hole",port:80,path:"/admin/",icon:"&#128679;",commands:["disable","enable"]},
    {id:"adguard",name:"AdGuard",port:3000,path:"/control/status",icon:"&#128679;",commands:["disable","enable"]},
    /* Caméras */
    {id:"hikvision",name:"Hikvision",port:80,path:"/ISAPI/System/deviceInfo",icon:"&#128247;",commands:["snapshot","stream","ptz"]},
    {id:"dahua",name:"Dahua",port:80,path:"/cgi-bin/magicBox.cgi?action=getMachineName",icon:"&#128247;",commands:["snapshot","stream"]},
    {id:"reolink",name:"Reolink",port:80,path:"/api.cgi",icon:"&#128247;",commands:["snapshot","ptz"]},
    {id:"axis_cam",name:"Axis Camera",port:80,path:"/axis-cgi/usergroup.cgi",icon:"&#128247;",commands:["snapshot"]},
    /* Imprimantes */
    {id:"printer_ipp",name:"Imprimante IPP",port:631,path:"/",icon:"&#128424;",commands:["status"]},
    {id:"printer_hp",name:"HP Printer",port:8080,path:"/DevMgmt/ProductConfigDyn.xml",icon:"&#128424;",commands:["status","ink_levels"]},
    /* Bridge IR */
    {id:"broadlink",name:"Broadlink Bridge",port:8780,path:"/health",icon:"&#128226;",commands:["learn","blast"]},
    /* Autres */
    {id:"transmission",name:"Transmission",port:9091,path:"/transmission/web/",icon:"&#128190;",commands:[]},
    {id:"node_red",name:"Node-RED",port:1880,path:"/",icon:"&#128512;",commands:[]}
  ];

  /* WebRTC ICE local IP discovery */
  global.axDetectLocalIP = function(){
    return new Promise(function(resolve){
      try{
        var pc = new RTCPeerConnection({iceServers:[]});
        var ips = new Set();
        var timer = setTimeout(function(){
          try{ pc.close(); }catch(_){}
          resolve(Array.from(ips));
        }, 2500);
        pc.createDataChannel("");
        pc.onicecandidate = function(e){
          if(!e.candidate) return;
          var m = String(e.candidate.candidate||"").match(/(\d+\.\d+\.\d+\.\d+)/g);
          if(m) m.forEach(function(ip){
            if(/^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.)/.test(ip)) ips.add(ip);
          });
        };
        pc.createOffer().then(function(offer){ pc.setLocalDescription(offer); }).catch(function(){
          clearTimeout(timer); resolve([]);
        });
      }catch(_){ resolve([]); }
    });
  };

  /* Smart Discovery : combine WebRTC IP + scan parallèle */
  global.axSmartDiscoverAll = function(opts){
    opts = opts || {};
    var foundDevices = [];
    var startTs = Date.now();

    return global.axDetectLocalIP().then(function(ips){
      if(!ips || ips.length === 0) ips = ["192.168.0.1","192.168.1.1","10.0.0.1"];
      var subnets = Array.from(new Set(ips.map(function(ip){
        var p = ip.split(".");
        return p[0]+"."+p[1]+"."+p[2];
      })));
      var prioIps = [1, 2, 50, 100, 101, 150, 200, 254];
      var devicesToScan = opts.devices || global.AX_LAN_DEVICES.slice(0, 15);

      var promises = [];
      subnets.forEach(function(sub){
        prioIps.forEach(function(host){
          var ip = sub + "." + host;
          devicesToScan.forEach(function(dev){
            var url = "http://" + ip + ":" + dev.port + dev.path;
            var ctrl = (typeof AbortController !== "undefined") ? new AbortController() : null;
            var to = setTimeout(function(){ if(ctrl) try{ctrl.abort();}catch(_){} }, 1500);
            var p = fetch(url, {mode:"cors", signal:ctrl?ctrl.signal:undefined})
              .then(function(r){
                clearTimeout(to);
                if(r.ok || r.status < 500){
                  return r.text().then(function(body){
                    var match = (r.status === 200) || /eureka|Roku|Philips|Sonos|Plex/i.test(body||"");
                    if(match){
                      foundDevices.push({id:dev.id, name:dev.name, icon:dev.icon, ip:ip, port:dev.port, url:url, commands:dev.commands||[]});
                    }
                  });
                }
              })
              .catch(function(){ clearTimeout(to); });
            promises.push(p);
          });
        });
      });

      return Promise.all(promises).then(function(){
        var elapsed = Math.round((Date.now() - startTs) / 1000);
        var ls = global.ls || function(k, v){localStorage.setItem(k, JSON.stringify(v));};
        ls("ax_last_lan_scan", {ts:Date.now(), devices:foundDevices, ips:ips, elapsed:elapsed});
        if(typeof global.toast === "function") global.toast(foundDevices.length+" appareils en "+elapsed+"s", "ok", {force:true});
        return {ok:true, devices:foundDevices, ips:ips, elapsed:elapsed};
      });
    });
  };

  /* Group by category for UI */
  global.axGroupDevicesByCategory = function(devices){
    if(!Array.isArray(devices)) return {};
    var cats = {
      "TV / Media": ["chromecast","roku","airplay","samsung_tv","lg_webos","plex","jellyfin","emby","sonarr","radarr"],
      "Audio": ["sonos","yamaha_avr","denon_avr","bose","alexa","google_home"],
      "Smart Home": ["hue","home_assistant","openhab","domoticz","deconz","shelly","tasmota","esphome"],
      "NAS": ["synology","qnap","truenas","unraid","proxmox","transmission"],
      "Reseau": ["asus_router","netgear_router","tplink_router","unifi","openwrt","pihole","adguard"],
      "Cameras": ["hikvision","dahua","reolink","axis_cam"],
      "Imprimantes": ["printer_ipp","printer_hp"],
      "Bridge IR": ["broadlink"],
      "Autres": []
    };
    var out = {};
    Object.keys(cats).forEach(function(c){ out[c] = []; });
    devices.forEach(function(d){
      var matched = false;
      Object.keys(cats).forEach(function(c){
        if(cats[c].indexOf(d.id) >= 0){ out[c].push(d); matched = true; }
      });
      if(!matched) out["Autres"].push(d);
    });
    Object.keys(out).forEach(function(c){ if(out[c].length === 0) delete out[c]; });
    return out;
  };

  /* Dispatcher commandes universelles */
  global.axDeviceCommand = function(device, cmd, params){
    if(!device || !device.ip || !cmd) return Promise.resolve({ok:false});
    params = params || {};
    var base = "http://" + device.ip + ":" + device.port;

    switch(device.id){
      case "roku":
        var rokuMap = {power:"Power",home:"Home",play:"Play",pause:"Play",up:"Up",down:"Down",left:"Left",right:"Right",ok:"Select",back:"Back",vol_up:"VolumeUp",vol_down:"VolumeDown",mute:"VolumeMute"};
        return fetch(base + "/keypress/" + (rokuMap[cmd] || cmd), {method:"POST"})
          .then(function(r){return {ok:r.ok, msg:"Roku "+cmd};});
      case "shelly":
        var op = cmd === "relay_on" ? "on" : cmd === "relay_off" ? "off" : "status";
        return fetch(base + "/relay/0?turn=" + op).then(function(r){return {ok:r.ok};});
      case "tasmota":
        var tas = cmd === "power_on" ? "On" : cmd === "power_off" ? "Off" : "Status";
        return fetch(base + "/cm?cmnd=Power%20" + tas).then(function(r){return {ok:r.ok};});
      case "yamaha_avr":
        var endpoint = cmd === "power" ? "/main/setPower?power=toggle" : "/main/setVolume?volume="+(cmd==="volume_up"?"up":"down");
        return fetch(base + "/YamahaExtendedControl/v1" + endpoint).then(function(r){return {ok:r.ok};});
      case "pihole":
      case "adguard":
        return fetch(base + (cmd === "disable" ? "/admin/api.php?disable=300" : "/admin/api.php?enable")).then(function(r){return {ok:r.ok};});
      default:
        try{ window.open(base, "_blank"); return Promise.resolve({ok:true}); }
        catch(e){ return Promise.resolve({ok:false, msg:e.message}); }
    }
  };

  if(typeof exports !== "undefined" && typeof module !== "undefined"){
    module.exports = {
      detectLocalIP: global.axDetectLocalIP,
      discoverAll: global.axSmartDiscoverAll,
      groupByCategory: global.axGroupDevicesByCategory,
      command: global.axDeviceCommand,
      devices: global.AX_LAN_DEVICES
    };
  }
})(typeof window !== "undefined" ? window : this);
