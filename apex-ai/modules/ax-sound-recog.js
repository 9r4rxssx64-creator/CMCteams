/* ax-sound-recog.js — v12.526 YAMNet sound recognition (521 classes)
 * Phase 1 refactor extraction (~6 KB)
 */
(function(global){
  "use strict";
  if(global._axSoundRecogLoaded) return;
  global._axSoundRecogLoaded = true;

  global._axYamnetModel = global._axYamnetModel || null;
  global._axYamnetLoading = global._axYamnetLoading || null;
  global._axSoundRecognizing = global._axSoundRecognizing || false;
  global._axSoundResults = global._axSoundResults || [];

  global.AX_SOUND_CATEGORIES = global.AX_SOUND_CATEGORIES || {
    "Voix humaine": ["Speech","Whispering","Laughter","Crying","Singing","Yell","Shout","Conversation","Whistling","Cough","Sneeze","Snoring","Breathing"],
    "Animaux domestiques": ["Dog","Bark","Howl","Whimper","Cat","Purr","Meow","Hiss","Pets"],
    "Animaux ferme": ["Cattle","Moo","Sheep","Pig","Horse","Neigh","Goat","Chicken","Cluck","Rooster","Crow","Duck","Quack","Goose","Honk"],
    "Animaux sauvages": ["Roar","Lion","Wolf","Bear","Elephant","Frog","Snake","Bird","Tweet","Coo","Crow","Pigeon","Owl","Hawk","Insect","Bee","Cricket","Mosquito"],
    "Musique": ["Music","Singing","Guitar","Piano","Drum","Violin","Trumpet","Saxophone","Bass","Synthesizer","Electronic","Rock","Pop","Jazz","Classical","Hip hop","Rap","Reggae","Country","Folk"],
    "Vehicules": ["Vehicle","Car","Truck","Motorcycle","Bus","Airplane","Helicopter","Train","Boat","Ship","Bicycle","Skateboard","Engine","Brake","Tire","Horn"],
    "Appareils maison": ["Door","Knock","Doorbell","Telephone","Phone","Ring","Alarm","Siren","Buzzer","Click","Slam","Microwave","Washing machine","Vacuum","Blender","Mixer","Hair dryer","Television","Radio"],
    "Outils & travaux": ["Hammer","Drill","Saw","Sandpaper","Sawing","Chainsaw","Lawn mower","Tractor","Power tool"],
    "Eau": ["Water","Rain","Stream","Waterfall","Ocean","Wave","Splash","Drip","Pour","Fill","Boil"],
    "Nature": ["Wind","Thunder","Storm","Fire","Crackle","Tree","Rustling leaves","Snow"],
    "Urbain": ["Traffic","Crowd","Applause","Cheer","Crash","Explosion","Gunshot","Glass break","Fireworks"],
    "Domestique alarmes": ["Smoke detector","Fire alarm","Burglar alarm","Carbon monoxide detector","Beep","Whistle"]
  };

  global.axSoundRecognitionInit = function(){
    if(global._axYamnetModel) return Promise.resolve(global._axYamnetModel);
    if(global._axYamnetLoading) return global._axYamnetLoading;

    global._axYamnetLoading = new Promise(function(resolve, reject){
      var s1 = document.createElement("script");
      s1.src = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.10.0/dist/tf.min.js";
      s1.onload = function(){
        var s2 = document.createElement("script");
        s2.src = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-tflite@0.0.1-alpha.10/dist/tf-tflite.min.js";
        s2.onload = function(){
          if(typeof tflite === "undefined" || !tflite.loadTFLiteModel){
            reject(new Error("TFLite manquant"));
            return;
          }
          tflite.loadTFLiteModel("https://tfhub.dev/google/lite-model/yamnet/tflite/1?lite-format=tflite")
            .then(function(model){
              global._axYamnetModel = model;
              resolve(model);
            })
            .catch(reject);
        };
        s2.onerror = function(){reject(new Error("TFLite load fail"));};
        document.head.appendChild(s2);
      };
      s1.onerror = function(){reject(new Error("TF.js load fail"));};
      document.head.appendChild(s1);
    });
    return global._axYamnetLoading;
  };

  global.axSoundRecognitionDetect = function(audioBlob){
    return global.axSoundRecognitionInit().then(function(model){
      return new Promise(function(resolve){
        var fileReader = new FileReader();
        fileReader.onload = function(){
          var audioContext = new (window.AudioContext || window.webkitAudioContext)({sampleRate:16000});
          audioContext.decodeAudioData(fileReader.result).then(function(buffer){
            var samples = buffer.getChannelData(0);
            var input = samples.slice(0, 15600);
            if(input.length < 15600){
              var padded = new Float32Array(15600);
              padded.set(input);
              input = padded;
            }
            try{
              var tensor = tf.tensor(input, [15600]);
              var output = model.predict(tensor);
              var scores = output.dataSync();
              tensor.dispose();
              output.dispose();
              var indexed = Array.from(scores).map(function(s, i){return {idx:i, score:s};});
              indexed.sort(function(a,b){return b.score - a.score;});
              resolve({ok:true, top:indexed.slice(0,5), timestamp:Date.now()});
            }catch(e){
              resolve({ok:false, msg:String(e.message||e).slice(0,80)});
            }
          }).catch(function(e){
            resolve({ok:false, msg:"decode err"});
          });
        };
        fileReader.readAsArrayBuffer(audioBlob);
      });
    }).catch(function(e){
      return {ok:false, msg:"init err: "+String(e.message||e).slice(0,60)};
    });
  };

  global.axSoundRecognitionStop = function(){
    global._axSoundRecognizing = false;
    return {ok:true, results: global._axSoundResults};
  };

  if(typeof exports !== "undefined" && typeof module !== "undefined"){
    module.exports = {
      init: global.axSoundRecognitionInit,
      detect: global.axSoundRecognitionDetect,
      stop: global.axSoundRecognitionStop,
      categories: global.AX_SOUND_CATEGORIES
    };
  }
})(typeof window !== "undefined" ? window : this);
