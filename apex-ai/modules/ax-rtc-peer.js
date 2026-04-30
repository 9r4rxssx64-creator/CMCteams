/* ax-rtc-peer.js — v12.523 WebRTC peer voice (P2P call entre 2 instances Apex)
 * Phase 1 refactor extraction (~6 KB)
 */
(function(global){
  "use strict";
  if(global._axRtcPeerLoaded) return;
  global._axRtcPeerLoaded = true;

  global._axRtcPeer = global._axRtcPeer || null;
  global._axRtcStream = global._axRtcStream || null;

  global.axRtcInit = function(){
    if(global._axRtcPeer) return global._axRtcPeer;
    var pc = new RTCPeerConnection({iceServers:[{urls:"stun:stun.l.google.com:19302"}]});
    pc.onicecandidate = function(e){
      if(e.candidate && typeof global.axJournalEntry === "function"){
        global.axJournalEntry("apex-ai","rtc_ice","v12.536", e.candidate.candidate.slice(0,80), "ICE");
      }
    };
    pc.ontrack = function(e){
      var audio = document.getElementById("ax-rtc-audio");
      if(!audio){
        audio = document.createElement("audio");
        audio.id = "ax-rtc-audio";
        audio.autoplay = true;
        audio.style.display = "none";
        document.body.appendChild(audio);
      }
      audio.srcObject = e.streams[0];
    };
    global._axRtcPeer = pc;
    return pc;
  };

  global.axRtcStartCall = function(){
    return navigator.mediaDevices.getUserMedia({audio:true}).then(function(stream){
      global._axRtcStream = stream;
      var pc = global.axRtcInit();
      stream.getTracks().forEach(function(t){pc.addTrack(t, stream);});
      return pc.createOffer().then(function(offer){
        return pc.setLocalDescription(offer).then(function(){
          return {ok:true, offer: btoa(JSON.stringify(offer))};
        });
      });
    }).catch(function(e){
      return {ok:false, msg:String(e.message||e).slice(0,80)};
    });
  };

  global.axRtcAcceptOffer = function(b64Offer){
    try{
      var offer = JSON.parse(atob(b64Offer));
      var pc = global.axRtcInit();
      return navigator.mediaDevices.getUserMedia({audio:true}).then(function(stream){
        global._axRtcStream = stream;
        stream.getTracks().forEach(function(t){pc.addTrack(t, stream);});
        return pc.setRemoteDescription(new RTCSessionDescription(offer)).then(function(){
          return pc.createAnswer().then(function(answer){
            return pc.setLocalDescription(answer).then(function(){
              return {ok:true, answer: btoa(JSON.stringify(answer))};
            });
          });
        });
      });
    }catch(e){ return Promise.resolve({ok:false, msg:String(e.message||e).slice(0,80)}); }
  };

  global.axRtcAcceptAnswer = function(b64Answer){
    try{
      var pc = global._axRtcPeer;
      if(!pc) return Promise.resolve({ok:false, msg:"Pas de peer init"});
      var answer = JSON.parse(atob(b64Answer));
      return pc.setRemoteDescription(new RTCSessionDescription(answer)).then(function(){
        return {ok:true, msg:"Connecte"};
      });
    }catch(e){ return Promise.resolve({ok:false, msg:String(e.message||e).slice(0,80)}); }
  };

  global.axRtcEndCall = function(){
    if(global._axRtcStream){
      global._axRtcStream.getTracks().forEach(function(t){t.stop();});
      global._axRtcStream = null;
    }
    if(global._axRtcPeer){
      try{ global._axRtcPeer.close(); }catch(_){}
      global._axRtcPeer = null;
    }
    var audio = document.getElementById("ax-rtc-audio");
    if(audio) audio.remove();
    return {ok:true, msg:"Call ended"};
  };

  if(typeof exports !== "undefined" && typeof module !== "undefined"){
    module.exports = {
      init: global.axRtcInit,
      startCall: global.axRtcStartCall,
      acceptOffer: global.axRtcAcceptOffer,
      acceptAnswer: global.axRtcAcceptAnswer,
      endCall: global.axRtcEndCall
    };
  }
})(typeof window !== "undefined" ? window : this);
