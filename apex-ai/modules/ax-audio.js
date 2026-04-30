/* ax-audio.js — v12.515-518 voix qualité + audio messages + TTS multi-langues
 * Phase 1 refactor extraction (~12 KB compacté, was 27 KB)
 *
 * Encapsule :
 * - axVoiceQualityTier / axListSystemVoices / axPickBestVoice (v12.515)
 * - axAudioRecordStart / axAudioRecordStop / axSendAudioMessage (v12.517)
 * - axDetectTextLang / axTtsSetVolume / axLiveTranscriptStart (v12.518)
 */
(function(global){
  "use strict";
  if(global._axAudioLoaded) return;
  global._axAudioLoaded = true;

  /* === VOIX QUALITY (v12.515) === */
  global.axVoiceQualityTier = function(voice){
    if(!voice) return 0;
    var n = String(voice.name||"").toLowerCase();
    var u = String(voice.voiceURI||"").toLowerCase();
    var nu = n + " " + u;
    if(/premium/i.test(nu)) return 5;
    if(/enhanced|amplified/i.test(nu)) return 4;
    if(/neural|wavenet/i.test(nu)) return 3;
    if(/(daniel|thomas|marie|audrey|virginie|juliette|paul|hortense|amelie|chantal)\b/i.test(n)) return 2;
    if(/microsoft|google\s/i.test(n)) return 2;
    if(/espeak|anc|compact|legacy|bahh|albert|alex.*compact/i.test(nu)) return 0;
    return 1;
  };

  global.axListSystemVoices = function(langFilter){
    if(typeof window === "undefined" || !window.speechSynthesis || typeof window.speechSynthesis.getVoices !== "function") return [];
    var voices = window.speechSynthesis.getVoices() || [];
    if(langFilter){
      voices = voices.filter(function(v){return String(v.lang||"").toLowerCase().startsWith(langFilter.toLowerCase());});
    }
    var seen = {};
    voices.forEach(function(v){
      var key = (v.name||"") + "|" + (v.lang||"");
      if(!seen[key] || (v.voiceURI||"").length < seen[key].uri){
        seen[key] = {voice:v, uri:(v.voiceURI||"").length};
      }
    });
    var out = Object.keys(seen).map(function(k){
      var v = seen[k].voice;
      return {name:v.name, lang:v.lang, voiceURI:v.voiceURI, tier:global.axVoiceQualityTier(v), voice:v};
    });
    out.sort(function(a, b){ return b.tier - a.tier; });
    return out;
  };

  global.axPickBestVoice = function(lang){
    lang = lang || "fr-FR";
    var prefix = lang.slice(0, 2).toLowerCase();
    var voices = global.axListSystemVoices(prefix);
    if(voices.length === 0) return null;
    var nonLegacy = voices.filter(function(v){return v.tier > 0;});
    return (nonLegacy.length ? nonLegacy[0] : voices[0]).voice;
  };

  /* === AUDIO MESSAGES (v12.517) === */
  global._axAudioRecorder = global._axAudioRecorder || null;
  global._axAudioChunks = global._axAudioChunks || [];

  global.axAudioRecordStart = function(){
    if(global._axAudioRecorder && global._axAudioRecorder.state === "recording"){
      return Promise.resolve({ok:false, msg:"Deja en cours"});
    }
    if(typeof navigator === "undefined" || !navigator.mediaDevices){
      return Promise.resolve({ok:false, msg:"getUserMedia indisponible"});
    }
    return navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true, noiseSuppression:true, autoGainControl:true}})
      .then(function(stream){
        global._axAudioChunks = [];
        var mimeType = "audio/webm;codecs=opus";
        try{ if(!MediaRecorder.isTypeSupported(mimeType)) mimeType = "audio/mp4"; }catch(_){ mimeType = ""; }
        global._axAudioRecorder = new MediaRecorder(stream, mimeType ? {mimeType:mimeType} : {});
        global._axAudioRecorder.ondataavailable = function(e){
          if(e.data && e.data.size > 0) global._axAudioChunks.push(e.data);
        };
        global._axAudioRecorder.onstop = function(){
          try{ stream.getTracks().forEach(function(t){t.stop();}); }catch(_){}
        };
        global._axAudioRecorder.start();
        return {ok:true};
      }).catch(function(e){
        return {ok:false, msg:String(e.message||e).slice(0,80)};
      });
  };

  global.axAudioRecordStop = function(){
    return new Promise(function(resolve){
      var rec = global._axAudioRecorder;
      if(!rec || rec.state !== "recording"){
        resolve({ok:false, msg:"Pas d enregistrement"});
        return;
      }
      rec.addEventListener("stop", function(){
        try{
          var blob = new Blob(global._axAudioChunks, {type: rec.mimeType || "audio/webm"});
          var reader = new FileReader();
          reader.onload = function(){
            var base64 = String(reader.result||"").split(",")[1] || "";
            resolve({ok:true, base64:base64, mimeType:rec.mimeType||"audio/webm", size:blob.size, durationSeconds:Math.round(blob.size/6000)});
          };
          reader.readAsDataURL(blob);
        }catch(e){ resolve({ok:false}); }
      }, {once:true});
      rec.stop();
    });
  };

  /* === TTS MULTI-LANGUES (v12.518) === */
  global.axDetectTextLang = function(text){
    if(!text || typeof text !== "string") return "fr-FR";
    var t = text.toLowerCase().slice(0, 500);
    var signals = {
      "en-US": /\b(the|and|that|this|with|from|have|been|will|hello|thanks)\b/gi,
      "it-IT": /\b(che|sono|della|questo|grazie|prego|ciao|come|dove)\b/gi,
      "es-ES": /\b(que|este|para|hola|gracias|porque|cuando|donde)\b/gi,
      "de-DE": /\b(der|die|das|und|ist|nicht|hallo|danke|bitte)\b/gi,
      "ja-JP": /[぀-ゟ゠-ヿ]/g,
      "zh-CN": /[一-鿿]/g,
      "ar-SA": /[؀-ۿ]/g,
      "ru-RU": /[Ѐ-ӿ]/g,
      "ko-KR": /[가-힯]/g
    };
    var scores = {};
    Object.keys(signals).forEach(function(lang){
      var m = t.match(signals[lang]);
      scores[lang] = m ? m.length : 0;
    });
    var best = Object.keys(scores).reduce(function(a, b){return scores[a] > scores[b] ? a : b;}, "fr-FR");
    return scores[best] >= 2 ? best : "fr-FR";
  };

  global.axTtsSetVolume = function(vol){
    var v = Math.max(0, Math.min(1, parseFloat(vol)));
    try{ if(global.K && global.K.settings){ global.K.settings.voiceVolume = v; } }catch(_){}
    return v;
  };

  /* Live transcription continue */
  global._axLiveTranscript = global._axLiveTranscript || null;

  global.axLiveTranscriptStart = function(opts){
    opts = opts || {};
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SR) return null;
    if(global._axLiveTranscript) global._axLiveTranscript.stop();
    var rec = new SR();
    rec.lang = opts.lang || "fr-FR";
    rec.continuous = !(/iPhone|iPad|iPod/.test(navigator.userAgent));
    rec.interimResults = true;
    var fullTranscript = "";
    rec.onresult = function(e){
      var interim = "";
      for(var i = e.resultIndex; i < e.results.length; i++){
        var transcript = e.results[i][0].transcript;
        if(e.results[i].isFinal) fullTranscript += transcript + " ";
        else interim += transcript;
      }
      if(typeof opts.onPartial === "function") opts.onPartial(interim);
      if(typeof opts.onFinal === "function" && fullTranscript) opts.onFinal(fullTranscript.trim());
    };
    rec.onend = function(){
      if(opts.autoRestart && global._axLiveTranscript === rec){
        try{ rec.start(); }catch(_){}
      }
    };
    try{ rec.start(); }catch(_){ return null; }
    global._axLiveTranscript = rec;
    return rec;
  };

  global.axLiveTranscriptStop = function(){
    if(global._axLiveTranscript){
      try{ global._axLiveTranscript.stop(); }catch(_){}
      global._axLiveTranscript = null;
    }
  };

  if(typeof exports !== "undefined" && typeof module !== "undefined"){
    module.exports = {
      voiceQualityTier: global.axVoiceQualityTier,
      listVoices: global.axListSystemVoices,
      pickBestVoice: global.axPickBestVoice,
      recordStart: global.axAudioRecordStart,
      recordStop: global.axAudioRecordStop,
      detectLang: global.axDetectTextLang,
      setVolume: global.axTtsSetVolume,
      transcriptStart: global.axLiveTranscriptStart,
      transcriptStop: global.axLiveTranscriptStop
    };
  }
})(typeof window !== "undefined" ? window : this);
