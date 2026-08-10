/* KDMC Lingua — moteur v2 (multi-comptes, succès, quêtes, gel, combo, dico).
   Vanilla JS, 0 dépendance. Auteur : KDMC. */
(function(){
"use strict";
var APP_VER="v2.94.0";

/* ============ Stockage : global vs par-compte ============ */
function gg(k,d){ try{ var v=localStorage.getItem("lingua_g_"+k); return v==null?d:JSON.parse(v);}catch(e){return d;} }
function gs(k,v){ try{ localStorage.setItem("lingua_g_"+k, JSON.stringify(v)); }catch(e){} }
var ACC = gg("current", null);         // id du compte courant
function pfx(){ return "lingua_a_"+ACC+"_"; }
function lg(k,d){ try{ if(!ACC)return d; var v=localStorage.getItem(pfx()+k); return v==null?d:JSON.parse(v);}catch(e){return d;} }
function ls(k,v){ try{ if(ACC) localStorage.setItem(pfx()+k, JSON.stringify(v)); }catch(e){} }
/* lecture d'une stat d'un AUTRE compte (pour la liste des comptes) */
function accStat(id,k,d){ try{ var v=localStorage.getItem("lingua_a_"+id+"_"+k); return v==null?d:JSON.parse(v);}catch(e){return d;} }

/* ============ Utilitaires ============ */
function esc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
function today(){ var d=new Date(); return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate(); }
function shuffle(a){ a=a.slice(); for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i]; a[i]=a[j]; a[j]=t; } return a; }
function sample(arr,n,ex){ return shuffle(arr.filter(function(x){return x!==ex;})).slice(0,n); }
function norm(s){ return String(s||"").toLowerCase().trim().replace(/[.,!?¿¡'’]/g,"").replace(/\s+/g," ").replace(/[àâä]/g,"a").replace(/[éèêë]/g,"e").replace(/[îï]/g,"i").replace(/[ôö]/g,"o").replace(/[ûü]/g,"u").replace(/ç/g,"c").replace(/ß/g,"ss").replace(/ł/g,"l").normalize("NFD").replace(/[̀-ͯ]/g,""); } /* NFD : tolère TOUS les accents latins (polonais ż/ą, tchèque č/ř…) au clavier français */
function vibrate(m){ try{ if(navigator.vibrate) navigator.vibrate(m);}catch(e){} }
function dayHash(s){ var h=7; for(var i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))%100000; return h; }

/* ============ État par-compte ============ */
/* App GRATUITE d'apprentissage → AUCUN blocage : pratique illimitée, jamais arrêté,
   rien perdu. Les cœurs sont infinis (aucune leçon bloquée, aucune erreur ne coûte). */
var UNLIMITED=true;
var HEART_MAX=5, HEART_REGEN_MS=30*60*1000;
var S={};
function loadS(){
  S.course=lg("course",null);
  S.hearts=lg("hearts",HEART_MAX); S.heartTs=lg("heartTs",Date.now());
  S.gems=lg("gems",0); S.xp=lg("xp",0);
  S.streak=lg("streak",0); S.lastDay=lg("lastDay",null); S.freeze=lg("freeze",0);
  S.dailyXP=lg("dailyXP",0); S.dailyDay=lg("dailyDay",today()); S.goal=lg("goal",30);
  S.prog=lg("prog",{}); S.srs=lg("srs",{});
  S.sound=lg("sound",true); S.voice=lg("voice","nova");
  S.league=lg("league",null); S.leagueWeek=lg("leagueWeek",null);
  S.achv=lg("achv",{}); S.words=lg("words",{});        // words[course][key]=true (mots vus)
  S.today=lg("today",{day:today(),xp:0,lessons:0,reviews:0,perfect:0,combo:0});
  S.qClaim=lg("qClaim",{}); S.qDay=lg("qDay",today());
  S.diff=lg("diff",null);   // difficulté des exercices : null = Auto (dérivée du niveau), 0..4 = fixée (test de niveau / profil)
  S.coachMsgs=lg("coachMsgs",[]);                                   // mémoire du Coach IA — PAR COMPTE (historique de conversation)
  S.coachProfile=lg("coachProfile",{objectif:"bilingue",weak:[],notes:""}); // profil d'apprentissage suivi par le Coach
  S.beeVoice=lg("beeVoice","fillette"); // voix de Bee choisie (catalogue BEE_VOICES) — fillette mignonne par défaut
  S.coachScene=lg("coachScene",null); // 🎭 jeu de rôle en cours (id de SCENES) — null = conversation libre
  S.storiesDone=lg("storiesDone",{}); // 📖 histoires terminées : {courseId:{storyId:ts}}
  S.hist=lg("hist",{});               // 📊 historique d'activité : {jour: XP gagné ce jour-là}
  S.blitzBest=lg("blitzBest",0);      // ⚡ record du défi éclair (bonnes réponses en 60 s)
  S.pairsBest=lg("pairsBest",0);      // 🃏 record des paires (meilleur temps en secondes)
  S.pronGoodTotal=lg("pronGoodTotal",0); // 🎤 total de mots bien prononcés (≥80%) — pour le succès
  fixPlacementProg(); // 🔒 VÉRITÉ : répare les comptes où le test de niveau avait « faussé » la progression
}
/* ---- Réparation (v2.67, bug vu chez Carla) : l'ancien test de niveau marquait des leçons
   « faites » (prog=1) sans qu'elles aient été faites → couronnes/étoiles partout, plus aucun
   cadenas, faux niveau. Détection SÛRE : une leçon vraiment terminée a TOUS ses mots vus
   (chaque mot a un exercice) ; le test, lui, ne montre qu'1 mot par unité. Donc prog===1 avec
   des mots manquants = artefact du test → on REVERROUILLE (l'apprentissage réel — mots, XP,
   série, révisions — n'est pas touché). Tourne à chaque chargement : sans effet quand tout est
   sain, et se ré-applique même si une vieille sauvegarde cloud revient. */
function fixPlacementProg(){
  try{
    if(!ACC || typeof COURSES==="undefined") return;
    var changed=false;
    Object.keys(S.prog||{}).forEach(function(cid){
      var c=COURSES[cid]; if(!c) return; var seen=(S.words||{})[cid]||{};
      c.units.forEach(function(u,ui){ u.lessons.forEach(function(l,li){
        var k="u"+ui+"-"+li;
        if(S.prog[cid][k]===1){
          var ws=l.words||[], all=ws.length>0;
          ws.forEach(function(w){ if(!seen[w.fr+"|"+w.t]) all=false; });
          if(!all){ delete S.prog[cid][k]; changed=true; }
        }
      });});
    });
    if(changed){ S.diff=null; /* le niveau estimé par ce test n'était pas fiable → retour en Auto (doux, selon les mots appris) */ save(); }
  }catch(e){}
}
function save(){ ["course","hearts","heartTs","gems","xp","streak","lastDay","freeze","dailyXP","dailyDay","goal","prog","srs","sound","voice","league","leagueWeek","achv","words","today","qClaim","qDay","diff","coachMsgs","coachProfile","beeVoice","coachScene","storiesDone","hist","blitzBest","pairsBest","pronGoodTotal"].forEach(function(k){ ls(k,S[k]); }); try{ scheduleCloudSave(); }catch(e){} try{ reportProgress(); }catch(e){} }
/* 📊 chaque XP gagné est daté — nourrit le calendrier d'activité (page Stats) */
function _dayTs(k){ var p=String(k).split("-"); return new Date(+p[0],(+p[1]||1)-1,+p[2]||1).getTime(); }
function histAdd(xp){ if(!xp)return; if(!S.hist)S.hist={}; var t=today(); S.hist[t]=(S.hist[t]||0)+xp;
  var ks=Object.keys(S.hist);
  if(ks.length>130){ ks.sort(function(a,b){return _dayTs(a)-_dayTs(b);}); ks.slice(0,ks.length-130).forEach(function(k){ delete S.hist[k]; }); } }

/* PROGRESSION → « Qui se connecte » (kd-mc.com). Kevin veut suivre l'avancée de
   chacun (XP, série, mots appris, leçons du jour) au même endroit que les connexions.
   Métadonnées de progression UNIQUEMENT (aucun contenu de leçon, aucune réponse).
   PROD-ONLY (*.kd-mc.com) → inerte en local/test. Throttlé 5 min. Fail-open total :
   si ça échoue, l'app continue exactement pareil (jamais bloquer l'apprentissage). */
var _progT=0;
function reportProgress(){
  try{
    if(typeof location==="undefined"||!/\.kd-mc\.com$/.test(location.hostname||""))return;
    var now=Date.now(); if(now-_progT<300000)return; _progT=now;
    var m=(typeof accMeta==="function"&&ACC)?accMeta(ACC):null; if(!m||!m.name)return;
    var t=S.today||{};
    var meta={
      xp:S.xp|0, serie:S.streak|0, gemmes:S.gems|0,
      mots:(typeof wordCount==="function"?wordCount():0)|0,
      cours:S.course||"", niveau:(S.prog&&S.course&&S.prog[S.course])?S.prog[S.course]:0,
      aujourdhui:{xp:t.xp|0, lecons:t.lessons|0, parfaits:t.perfect|0}
    };
    var ua=navigator.userAgent||"";
    var dev=/iPhone/.test(ua)?"iPhone":/iPad/.test(ua)?"iPad":/Android/.test(ua)?"Android":/Macintosh/.test(ua)?"Mac":/Windows/.test(ua)?"PC Windows":"Autre";
    fetch("https://admin.kd-mc.com/log",{method:"POST",headers:{"Content-Type":"application/json"},keepalive:true,mode:"cors",
      body:JSON.stringify({app:"lingua",uid:"lingua_"+ACC,name:m.name,event:"progression",device:dev,tier:"lingua",meta:meta})}).catch(function(){});
  }catch(e){}
}

/* ============ Comptes (CRUD) ============ */
var AVATARS=["🦊","🐼","🐨","🦁","🐵","🐸","🦄","🐙","🐯","🐧","🐷","🐰","🐻","🐮","🐲","🦖"];
function accounts(){ return gg("accounts",[]); }
function createAccount(name,avatar,code){
  var id="acc_"+Date.now().toString(36)+Math.floor(Math.random()*1e4).toString(36);
  var a=accounts(); a.push({id:id,name:name||"Joueur",avatar:avatar||"🦊",code:code||"",created:Date.now()}); gs("accounts",a);
  return id;
}
function switchAccount(id){ ACC=id; gs("current",id); loadS(); ensureLeague(); PICK=false; try{ cloudRestoreInto(id); }catch(e){} }
function deleteAccount(id){
  gs("accounts", accounts().filter(function(x){return x.id!==id;}));
  Object.keys(localStorage).forEach(function(k){ if(k.indexOf("lingua_a_"+id+"_")===0) localStorage.removeItem(k); });
  if(ACC===id){ ACC=null; gs("current",null); }
}
function accMeta(id){ return accounts().filter(function(a){return a.id===id;})[0]; }
function setAccountCode(id,code){ var accs=accounts(); for(var i=0;i<accs.length;i++){ if(accs[i].id===id){ accs[i].code=String(code||""); } } gs("accounts",accs); }
function findLocalAccount(name,code){ var n=norm(name); var accs=accounts(); for(var i=0;i<accs.length;i++){ if(norm(accs[i].name)===n && String(accs[i].code||"")===String(code)) return accs[i].id; } return null; }

/* ===== Mémoire cloud (ne rien perdre — tous comptes, tous appareils) =====
   Chaque compte a un CODE. La progression est sauvegardée dans le cloud sous
   hash(nom+code) (accès par capacité, données non sensibles). Sur n'importe quel
   appareil : nom+code → tout revient. FAIL-OPEN : si le cloud est indispo, la
   mémoire locale continue (rien perdu localement). */
var SYNC_BASE="https://lingua.kd-mc.com/__lingua";
var SYNC_KEYS=["course","hearts","heartTs","gems","xp","streak","lastDay","freeze","dailyXP","dailyDay","goal","prog","srs","sound","league","leagueWeek","achv","words","today","qClaim","qDay","hadPerfect","syncTs","diff","coachMsgs","coachProfile","beeVoice","coachScene","storiesDone","hist","blitzBest","pairsBest","pronGoodTotal"];
var _cloudState="";        // "ok" | "off" | ""
function _sha256hex(str){ return crypto.subtle.digest("SHA-256", new TextEncoder().encode(str)).then(function(buf){ return Array.prototype.map.call(new Uint8Array(buf),function(b){return ("0"+b.toString(16)).slice(-2);}).join(""); }); }
function cloudKeyFor(name,code){ return _sha256hex(norm(name)+":"+String(code||"")).then(function(h){ return h.slice(0,40); }); }
function _rawGet(id,k){ try{ return localStorage.getItem("lingua_a_"+id+"_"+k); }catch(e){ return null; } }
function _acctSnapshot(id){ var m=accMeta(id)||{}; var data={}; SYNC_KEYS.forEach(function(k){ var v=_rawGet(id,k); if(v!=null) data[k]=v; }); var ts=_rawGet(id,"syncTs"); return {v:2,name:m.name,avatar:m.avatar,syncTs:ts?JSON.parse(ts):0,data:data}; }
function _applySnapshot(id,snap){ var d=(snap&&snap.data)||{}; Object.keys(d).forEach(function(k){ try{ localStorage.setItem("lingua_a_"+id+"_"+k, d[k]); }catch(e){} }); var accs=accounts(); for(var i=0;i<accs.length;i++){ if(accs[i].id===id){ if(snap.name)accs[i].name=snap.name; if(snap.avatar)accs[i].avatar=snap.avatar; } } gs("accounts",accs); }
var _syncT=null;
function scheduleCloudSave(){ if(!ACC)return; var m=accMeta(ACC); if(!m||!m.code)return; if(_syncT)clearTimeout(_syncT); _syncT=setTimeout(cloudSaveNow,1500); }
function cloudSaveNow(){ if(!ACC)return; var m=accMeta(ACC); if(!m||!m.code)return; var id=ACC;
  try{ localStorage.setItem("lingua_a_"+id+"_syncTs", JSON.stringify(Date.now())); }catch(e){}
  cloudKeyFor(m.name,m.code).then(function(k){ return fetch(SYNC_BASE+"/save",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({k:k,data:_acctSnapshot(id)})}); })
    .then(function(r){ return r&&r.json(); }).then(function(j){ _cloudState=(j&&j.ok)?"ok":"off"; }).catch(function(){ _cloudState="off"; }); }
function cloudRestoreInto(id){ var m=accMeta(id); if(!m||!m.code) return Promise.resolve(false);
  return cloudKeyFor(m.name,m.code).then(function(k){ return fetch(SYNC_BASE+"/load?k="+encodeURIComponent(k)); })
    .then(function(r){ return r&&r.json(); }).then(function(j){ if(!j||!j.ok){ _cloudState="off"; return false; } _cloudState="ok"; if(!j.data) return false;
      var cloud=j.data, localTs=(function(){ var t=_rawGet(id,"syncTs"); return t?JSON.parse(t):0; })();
      if((cloud.syncTs||0)>localTs){ _applySnapshot(id,cloud); if(ACC===id){ loadS(); render(); } return true; } return false;
    }).catch(function(){ _cloudState="off"; return false; }); }
/* Nom+code → entre dans le compte : restaure depuis le cloud si trouvé, sinon crée (option). */
function enterWithCredentials(name,avatar,code,createIfMissing){
  var existing=findLocalAccount(name,code);
  if(existing){ switchAccount(existing); if(createIfMissing) cloudSaveNow(); return Promise.resolve({ok:true,local:true}); }
  return cloudKeyFor(name,code).then(function(k){ return fetch(SYNC_BASE+"/load?k="+encodeURIComponent(k)); })
    .then(function(r){ return r&&r.json(); }).then(function(j){
      var cloud=(j&&j.ok)?j.data:null;
      if(cloud){ var id=createAccount(cloud.name||name, cloud.avatar||avatar, String(code)); _applySnapshot(id,cloud); switchAccount(id); return {ok:true,restored:true}; }
      if(createIfMissing){ var id2=createAccount(name,avatar,String(code)); switchAccount(id2); cloudSaveNow(); return {ok:true,created:true}; }
      return {ok:false,none:true};
    }).catch(function(){ if(createIfMissing){ var id3=createAccount(name,avatar,String(code)); switchAccount(id3); return {ok:true,created:true,offline:true}; } return {ok:false,error:true}; }); }

/* ============ Cœurs / jours / série ============ */
function regenHearts(){ if(S.hearts>=HEART_MAX){S.heartTs=Date.now();return;}
  var g=Math.floor((Date.now()-S.heartTs)/HEART_REGEN_MS);
  if(g>0){ S.hearts=Math.min(HEART_MAX,S.hearts+g); S.heartTs=S.hearts>=HEART_MAX?Date.now():S.heartTs+g*HEART_REGEN_MS; save(); } }
function checkDay(){
  var t=today();
  if(S.dailyDay!==t){ S.dailyDay=t; S.dailyXP=0; }
  if(S.today.day!==t){ S.today={day:t,xp:0,lessons:0,reviews:0,perfect:0,combo:0}; }
  if(S.qDay!==t){ S.qDay=t; S.qClaim={}; }
  save();
}
function bumpStreak(){
  var t=today(); if(S.lastDay===t) return;
  var d=new Date(); d.setDate(d.getDate()-1); var yd=d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();
  d.setDate(d.getDate()-1); var y2=d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();
  if(S.lastDay===yd) S.streak+=1;
  else if(S.lastDay===y2 && S.freeze>0){ S.freeze-=1; S.streak+=1; toast("🧊 Gel utilisé — série sauvée !"); }
  else S.streak=1;
  S.lastDay=t; save();
  /* Jalons de série RÉELS (le garde S.lastDay===t empêche tout doublon le même jour) */
  var MS=[3,7,14,30,50,100,200,365];
  if(MS.indexOf(S.streak)>=0){ var n=S.streak; setTimeout(function(){ toast("🔥 "+n+" jours de série — bravo !"); },700); }
}

/* ============ Révision espacée (SM-2 allégé) ============ */
function srsKey(w){ return w.fr+"|"+w.t; }
function srsGet(c){ if(!S.srs[c])S.srs[c]={}; return S.srs[c]; }
function markWord(w){ if(!S.words[S.course])S.words[S.course]={}; S.words[S.course][srsKey(w)]=true; }
function srsUpdate(w,ok){ var db=srsGet(S.course),k=srsKey(w),it=db[k]||{ease:2.5,int:0,reps:0,due:0};
  if(ok){ it.reps++; it.ease=Math.max(1.3,it.ease+0.1); it.int=it.reps<=1?1:it.reps===2?3:Math.round(it.int*it.ease);}
  else{ it.reps=0; it.ease=Math.max(1.3,it.ease-0.2); it.int=0; }
  it.due=Date.now()+it.int*864e5; db[k]=it; markWord(w); save(); }
function dueWords(){ var c=COURSES[S.course]; if(!c)return []; var db=srsGet(S.course),out=[],n=Date.now();
  c.units.forEach(function(u){u.lessons.forEach(function(l){l.words.forEach(function(w){ var it=db[srsKey(w)]; if(it&&it.reps>0&&it.due<=n)out.push(w); });});}); return out; }
function wordCount(){ var t=0; Object.keys(S.words).forEach(function(c){ t+=Object.keys(S.words[c]).length; }); return t; }

/* ============ Ligue (simulation locale) ============ */
/* CLASSEMENT 100% RÉEL (Kevin : « dans Lingua, vrai info seulement »).
   Fini les faux adversaires inventés : le classement de la semaine n'affiche QUE des personnes
   RÉELLES (les comptes de cet appareil) avec leur XP RÉELLE des 7 derniers jours (calculée depuis
   leur historique). Aucun joueur ni score fabriqué. */
function weekId(){ var d=new Date(),o=new Date(d.getFullYear(),0,1),w=Math.ceil((((d-o)/864e5)+o.getDay()+1)/7); return d.getFullYear()+"-W"+w; }
function ensureLeague(){ /* plus rien à générer : le classement est calculé en temps réel depuis l'historique */ }
function leagueAdd(x){ /* no-op : l'XP réelle est déjà comptée (S.xp + historique S.hist) */ }
function _weekCutoff(){ var d=new Date(); d.setHours(0,0,0,0); return d.getTime()-6*864e5; } /* début du jour il y a 6 j → 7 derniers jours */
function _acctWeekXp(id){ var h; if(id===ACC){ h=S.hist||{}; } else { try{ h=JSON.parse(_rawGet(id,"hist")||"{}"); }catch(_){ h={}; } }
  var cut=_weekCutoff(),sum=0; for(var k in h){ if(Object.prototype.hasOwnProperty.call(h,k) && _dayTs(k)>=cut){ sum+=(+h[k]||0); } } return sum; }
function leagueRows(){ return accounts().map(function(a){ return {name:a.name||"Joueur",avatar:a.avatar||"🦊",xp:_acctWeekXp(a.id),you:a.id===ACC}; })
  .sort(function(a,b){ return b.xp-a.xp; }); }

/* ============ Succès ============ */
var ACHV=[
  {id:"first",i:"🎓",t:"Première leçon",d:"Termine ta 1ʳᵉ leçon",f:function(){return anyLessonDone();}},
  {id:"perfect",i:"💯",t:"Sans faute",d:"Une leçon sans erreur",f:function(){return S.today.perfect>0||lg("hadPerfect",false);}},
  {id:"streak3",i:"🔥",t:"En feu",d:"3 jours de série",f:function(){return S.streak>=3;}},
  {id:"streak7",i:"⚡",t:"Semaine forte",d:"7 jours de série",f:function(){return S.streak>=7;}},
  {id:"xp100",i:"⭐",t:"Centurion",d:"100 XP au total",f:function(){return S.xp>=100;}},
  {id:"xp500",i:"🌟",t:"Maître",d:"500 XP au total",f:function(){return S.xp>=500;}},
  {id:"unit",i:"👑",t:"Unité bouclée",d:"Finis toutes les leçons d'une unité",f:function(){return unitFullyDone();}},
  {id:"words50",i:"📚",t:"Vocabulaire",d:"Apprends 50 mots",f:function(){return wordCount()>=50;}},
  {id:"combo5",i:"🎯",t:"Combo x5",d:"5 bonnes réponses d'affilée",f:function(){return S.today.combo>=5;}},
  {id:"poly",i:"🌍",t:"Polyglotte",d:"Commence 2 langues",f:function(){return Object.keys(S.prog).filter(function(c){return Object.keys(S.prog[c]||{}).length;}).length>=2;}},
  {id:"streak30",i:"🗓️",t:"Un mois de feu",d:"30 jours de série",f:function(){return S.streak>=30;}},
  {id:"xp1000",i:"💠",t:"Légende",d:"1000 XP au total",f:function(){return S.xp>=1000;}},
  {id:"words100",i:"📕",t:"Grand lecteur",d:"Apprends 100 mots",f:function(){return wordCount()>=100;}},
  {id:"stories6",i:"🐝",t:"Conteur de la ruche",d:"Termine toutes les histoires",f:function(){return typeof STORIES!=="undefined"&&STORIES.length>0&&typeof storiesDoneCount==="function"&&storiesDoneCount()>=STORIES.length;}},
  {id:"blitz15",i:"🚀",t:"Éclair",d:"15 bonnes réponses en un défi éclair",f:function(){return (S.blitzBest||0)>=15;}},
  {id:"pairs45",i:"🃏",t:"Mémoire d'abeille",d:"Gagne les paires en moins de 45 s",f:function(){return (S.pairsBest||0)>0&&S.pairsBest<=45;}},
  {id:"pron20",i:"🎤",t:"Belle diction",d:"Bien prononce 20 mots à l'atelier",f:function(){return (S.pronGoodTotal||0)>=20;}}
];
function anyLessonDone(){ var n=0; Object.keys(S.prog).forEach(function(c){ var p=S.prog[c]||{}; Object.keys(p).forEach(function(k){ if(p[k]>0)n++; }); }); return n>0; } /* VÉRITÉ : seules les leçons VRAIMENT faites comptent (pas les « ouvertes par le test ») */
function unitFullyDone(){ var done=false; Object.keys(S.prog).forEach(function(c){ if(!COURSES[c])return; COURSES[c].units.forEach(function(u,ui){ var all=true; u.lessons.forEach(function(_,li){ if(!(S.prog[c]["u"+ui+"-"+li]>0))all=false; }); if(all)done=true; }); }); return done; }
function checkAchv(){ ACHV.forEach(function(a){ if(!S.achv[a.id] && a.f()){ S.achv[a.id]=Date.now(); S.gems+=10; save(); toast("🏅 Succès : "+a.t+" (+10 💎)"); } }); }

/* ============ Quêtes quotidiennes ============ */
var QUESTS=[
  {id:"xp30",t:"Gagne 30 XP",g:30,m:"xp",r:15},
  {id:"xp50",t:"Gagne 50 XP",g:50,m:"xp",r:25},
  {id:"les2",t:"Termine 2 leçons",g:2,m:"lessons",r:20},
  {id:"les3",t:"Termine 3 leçons",g:3,m:"lessons",r:30},
  {id:"rev1",t:"Fais 1 révision",g:1,m:"reviews",r:15},
  {id:"perf1",t:"1 leçon sans faute",g:1,m:"perfect",r:20},
  {id:"combo4",t:"Un combo x4",g:4,m:"combo",r:15},
  {id:"sto1",t:"Lis 1 histoire 📖",g:1,m:"stories",r:20},
  {id:"blitz1",t:"Fais un défi éclair ⚡",g:1,m:"blitz",r:15},
  {id:"pairs1",t:"Gagne une partie de paires 🃏",g:1,m:"pairs",r:15},
  {id:"pron3",t:"Prononce 3 mots 🎤",g:3,m:"pron",r:15}
];
function todaysQuests(){ var h=dayHash(today()),used={},out=[],i=0;
  while(out.length<3 && i<40){ var q=QUESTS[(h+i*3+1)%QUESTS.length]; if(!used[q.id]){used[q.id]=1;out.push(q);} i++; } return out; }
function questVal(m){ return S.today[m]||0; }
function checkQuests(){ todaysQuests().forEach(function(q){ if(!S.qClaim[q.id] && questVal(q.m)>=q.g){ S.qClaim[q.id]=1; S.gems+=q.r; save(); toast("🎯 Quête : "+q.t+" (+"+q.r+" 💎)"); } }); }

/* ============ Génération leçon ============ */
function allWords(c){ var o=[]; COURSES[c].units.forEach(function(u){u.lessons.forEach(function(l){o=o.concat(l.words);});}); return o; }
/* Difficulté : Auto (dérivée des mots maîtrisés) ou fixée par le test de niveau / profil.
   0 Facile · 1 Moyen · 2 Assez difficile · 3 Difficile · 4 Expert. Plus c'est haut, plus on
   ÉCRIT les réponses (au lieu de choisir) et on traduit dans les deux sens + écoute-et-écris. */
function diffTier(){ if(S.diff!=null) return S.diff; var m=masteredCount(); return m>=240?4:m>=160?3:m>=90?2:m>=40?1:0; }
function exForWord(w,pool,tier,i){
  var r=(i*7+tier*3)%10;
  /* Langues à alphabet non latin (russe, chinois, japonais…) : on n'exige JAMAIS d'écrire la
     langue cible au clavier — écrire vers la cible/dictée → choix multiples ; écrire le
     FRANÇAIS (toFr) reste possible partout. */
  var NT=COURSES[S.course]&&COURSES[S.course].noType;
  if(tier<=0){ var m=i%3===0?"mc_t":(i%3===1?"mc_fr":"listen"); if(m==="listen"&&!S.sound)m="mc_t"; return makeMC(w,pool,m); }
  if(tier===1){ if(r<3) return NT?makeMC(w,pool,"mc_t"):makeType(w,"toT"); return makeMC(w,pool,i%2?"mc_fr":"mc_t"); }
  if(tier===2){ if(r<5) return (r%2&&!NT)?makeType(w,"toT"):makeType(w,"toFr"); if(r<7&&S.sound) return NT?makeMC(w,pool,"listen"):makeType(w,"listen"); return makeMC(w,pool,r%2?"mc_fr":"mc_t"); }
  if(r<6) return (r%2&&!NT)?makeType(w,"toT"):makeType(w,"toFr"); if(r<8&&S.sound) return NT?makeMC(w,pool,"listen"):makeType(w,"listen"); return makeMC(w,pool,"mc_fr");
}
function buildLesson(ui,li,rev){ var c=COURSES[S.course],pool=allWords(S.course),tier=diffTier();
  var words=rev||c.units[ui].lessons[li].words.slice();
  var phr=rev?[]:(c.units[ui].lessons[li].phrases||[]);
  var ex=[];
  shuffle(words).forEach(function(w,i){ ex.push(exForWord(w,pool,tier,i)); });
  if(words.length>=4 && tier<=2) ex.splice(1,0,makeMatch(shuffle(words).slice(0,Math.min(5,words.length))));
  phr.forEach(function(p){ ex.push(makeBank(p,pool)); if(tier>=3&&!(c&&c.noType)) ex.push(makeType({fr:p.fr,t:p.t},"toT")); });
  if(tier>=2 && _srOk() && words.length){ shuffle(words).slice(0,Math.min(2,words.length)).forEach(function(w){ ex.push(makeSpeak(w)); }); } // prononciation à partir du niveau « assez difficile »
  return shuffle(ex).slice(0,Math.min(ex.length, 12+tier*2)); // 12 → 20 selon le niveau
}
function makeMC(w,pool,mode){ var asT=mode!=="mc_fr",correct=asT?w.t:w.fr;
  /* distracteurs : chaînes DISTINCTES de la réponse et entre elles (anti-collision de traductions) */
  var seen={}; seen[norm(correct)]=1; var d=[];
  shuffle(pool).forEach(function(x){ if(d.length>=3)return; var s=asT?x.t:x.fr; if(!seen[norm(s)]){ seen[norm(s)]=1; d.push(s); } });
  return {kind:"mc",mode:mode,w:w,prompt:mode==="mc_fr"?w.t:w.fr,answer:correct,opts:shuffle([correct].concat(d)),audio:mode==="listen"}; }
function makeMatch(ws){ /* garde des paires à cible UNIQUE (évite 2 tuiles identiques) */
  var seen={},uniq=[]; ws.forEach(function(w){ if(!seen[norm(w.t)]){ seen[norm(w.t)]=1; uniq.push(w); } });
  return {kind:"match",w:uniq[0],pairs:uniq.map(function(w){return{fr:w.fr,t:w.t,w:w};})}; }
function makeBank(p,pool){ var toks=p.t.split(" "),ex=sample(allWords(S.course),3).map(function(x){return x.t.split(" ")[0];});
  return {kind:"bank",w:{fr:p.fr,t:p.t},prompt:p.fr,answer:p.t,tokens:toks,bank:shuffle(toks.concat(ex))}; }
/* Exercice de SAISIE (écrire la réponse) — bien plus exigeant que le choix multiple.
   dir : "toT" écris dans la langue · "toFr" écris en français · "listen" écoute puis écris. */
function makeType(w,dir){ var toT=dir!=="toFr", answer=toT?w.t:w.fr;
  return {kind:"type",w:w,dir:dir,prompt:dir==="listen"?"":(toT?w.fr:w.t),answer:answer,audio:dir==="listen"}; }
/* Exercice de PRONONCIATION (parler au micro) — reconnaissance vocale, indulgent. */
function makeSpeak(w){ return {kind:"speak",w:w,prompt:w.t,answer:w.t}; }

/* ============ Voix + sons ============ */
/* Catalogue de voix : 6 voix naturelles (cloud, HD) + la voix du téléphone (hors-ligne). */
var VOICES=[
  {id:"nova",   name:"Nova — douce",       cloud:true},
  {id:"shimmer",name:"Shimmer — claire",   cloud:true},
  {id:"fable",  name:"Fable — chaleureuse",cloud:true},
  {id:"alloy",  name:"Alloy — neutre",     cloud:true},
  {id:"echo",   name:"Echo — posée",       cloud:true},
  {id:"onyx",   name:"Onyx — grave",       cloud:true},
  /* 🎙️ Profil « Antonin — accent du Sud » (Kevin 2026-08-10) : Antonin est un adulte du
     Sud (Provence/Marseille). Placeholder = voix d'homme chaude et grave (onyx), timbre
     posé. Honnête : les voix cloud parlent un français NEUTRE — elles ne font pas
     l'accent du Sud. La VRAIE voix d'Antonin (timbre + accent) demandera un
     enregistrement audio de lui (1-2 min) → clone vocal. */
  {id:"antonin",name:"🎙️ Antonin — accent du Sud", cloud:true, tts:"onyx", wsPitch:0.95},
  {id:"device", name:"Voix du téléphone (hors-ligne)", cloud:false}
];
function _isCloudVoice(id){ for(var i=0;i<VOICES.length;i++){ if(VOICES[i].id===id) return VOICES[i].cloud; } return false; }
/* Résout un id de voix vers sa vraie voix cloud + réglages (profils comme « antonin »). */
function voiceReal(id){ for(var i=0;i<VOICES.length;i++){ if(VOICES[i].id===id) return VOICES[i]; } return null; }
var _ttsAudio=null,_ttsReq=0;
/* Kevin 2026-08-08 « elle s'arrête avant la fin » — repli voix du téléphone :
   Chrome/Android et Safari iOS coupent silencieusement toute phrase parlée après ~15 s.
   Correctif documenté : pendant qu'on parle, un pause()+resume() régulier relance le
   moteur sans coupure audible. On l'arrête à la fin (onend/onerror) ou dès qu'on ne
   parle plus. Toutes les lectures locales passent par _wsSpeak → jamais tronquées. */
var _wsKA=null;
function _wsStopKA(){ if(_wsKA){ try{ clearInterval(_wsKA); }catch(_){} _wsKA=null; } }
function _wsSpeak(u){ if(!u)return; try{ speechSynthesis.cancel(); }catch(_){}  _wsStopKA();
  var done=function(){ _wsStopKA(); };
  u.onend=done; u.onerror=done;
  try{ speechSynthesis.speak(u);
    _wsKA=setInterval(function(){ try{ if(speechSynthesis.speaking){ speechSynthesis.pause(); speechSynthesis.resume(); } else done(); }catch(_){ done(); } },9000);
  }catch(e){ done(); } }
function speak(text){ if(!S.sound||!text)return; var vid=S.voice||"nova"; var myReq=++_ttsReq;
  try{ if(window.speechSynthesis) speechSynthesis.cancel(); }catch(_){} _wsStopKA();   // coupe toute voix EN FILE (anti-décalage « répond à la question d'avant »)
  if(_isCloudVoice(vid)){
    try{ if(_ttsAudio){ try{_ttsAudio.pause();}catch(_){} _ttsAudio=null; }
      var vr=voiceReal(vid)||{};
      var a=new Audio(SYNC_BASE+"/tts?v="+encodeURIComponent(vr.tts||vid)+(vr.gen?"&s="+vr.gen:"")+"&t="+encodeURIComponent(text)); _ttsAudio=a;
      if(vr.rate){ try{ a.preservesPitch=false; a.webkitPreservesPitch=false; a.playbackRate=vr.rate; }catch(_){} }
      a.onerror=function(){ if(myReq===_ttsReq) _webSpeak(text); };   // ne parle que si c'est TOUJOURS la dernière demande
      var p=a.play(); if(p&&p.catch) p.catch(function(){ if(myReq===_ttsReq) _webSpeak(text); });
      return;
    }catch(e){ if(myReq===_ttsReq)_webSpeak(text); return; }
  }
  _webSpeak(text);
}
function _webSpeak(text){ if(!S.sound||!text)return; try{ var u=new SpeechSynthesisUtterance(text); u.lang=COURSES[S.course]?COURSES[S.course].ttsLang:"fr-FR"; u.rate=.92; u.volume=1;
  var base=(u.lang).split("-")[0], vs=speechSynthesis.getVoices().filter(function(v){return v.lang&&v.lang.indexOf(base)===0;});
  var best=vs.filter(function(v){return /premium|enhanced|siri|natural/i.test(v.name);})[0] || vs.filter(function(v){return v.localService;})[0] || vs[0];
  if(best)u.voice=best; _wsSpeak(u);}catch(e){} }
/* Parle le mot de l'exercice COURANT uniquement (anti-décalage : si on a déjà avancé,
   un son différé de la question précédente NE sort PAS sur la nouvelle question). */
function _lsSpeak(text,qi,delay){ setTimeout(function(){ if(LESSON&&LESSON.i===qi&&S.sound)speak(text); }, delay||0); }
var AC=null;
function tone(freqs,dur){ if(!S.sound)return; try{ AC=AC||new(window.AudioContext||window.webkitAudioContext)(); var o=AC.createOscillator(),g=AC.createGain(); o.connect(g);g.connect(AC.destination);o.type="sine";
  freqs.forEach(function(f,i){ o.frequency.setValueAtTime(f,AC.currentTime+i*0.08); });
  g.gain.setValueAtTime(.14,AC.currentTime); g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+dur); o.start(); o.stop(AC.currentTime+dur);}catch(e){} }
function beep(ok){ ok?tone([660,880],.3):tone([200,140],.3); }
function comboSound(n){ tone([660+ n*80, 880+n*80],.25); }

/* ============ Rendu ============ */
var app, VIEW="home", LESSON=null, PICK=false;
function render(){
  if(!ACC || PICK){ app.innerHTML=""; app.appendChild(vAccounts()); return; }
  regenHearts(); checkDay(); checkAchv(); checkQuests();
  app.innerHTML="";
  if(VIEW==="lesson"){ app.appendChild(vLesson()); return; }
  if(VIEW==="blitz"){ app.appendChild(vBlitz()); return; }   // ⚡ plein écran (concentration)
  if(VIEW==="pairs"){ app.appendChild(vPairs()); return; }   // 🃏 plein écran
  if(VIEW==="pron"){ app.appendChild(vPron()); return; }     // 🎤 atelier prononciation plein écran
  if(!S.course){ app.appendChild(vTopbar()); app.appendChild(vCoursePick()); app.appendChild(vTabbar()); return; }
  app.appendChild(vTopbar());
  if(VIEW==="home"){ app.appendChild(vHome()); maybeOfferPlacement(); }
  else if(VIEW==="review") app.appendChild(vReview());
  else if(VIEW==="dict") app.appendChild(vDict());
  else if(VIEW==="translate") app.appendChild(vTranslate());
  else if(VIEW==="league") app.appendChild(vLeague());
  else if(VIEW==="stories") app.appendChild(vStories());
  else if(VIEW==="story") app.appendChild(vStoryPlay());
  else if(VIEW==="stats") app.appendChild(vStats());
  else if(VIEW==="coach") app.appendChild(vCoach());
  else if(VIEW==="profile") app.appendChild(vProfile());
  app.appendChild(vTabbar());
  if(VIEW!=="coach"&&S.course) app.appendChild(beeCompanion());  // Bee gère tout : présente sur chaque écran (le Coach l'a déjà en grand)
}
function go(v){ if(v!=="blitz")blitzAbort(); if(v!=="pairs")pairsAbort(); if(v!=="pron")pronAbort(); VIEW=v; window.scrollTo(0,0); render(); }
/* ============ Garde retour-arrière (Kevin 2026-08-08 : « pas de retour arrière possible
   pendant une leçon ») ============
   Avant : sur iPhone, le geste retour quittait l'app EN PLEINE leçon/défi/histoire —
   progression de la leçon perdue, sans prévenir. On pose un jalon d'historique à l'entrée
   de chaque activité ; le geste retour retombe dessus : on RESTE dans l'app et on passe
   par la même confirmation que le bouton ✕ (le défi éclair, lui, se termine proprement :
   le score est compté). Hors activité : retour = accueil, jamais une éjection surprise. */
function _armHistoryGuard(){ try{ history.pushState({lingua:1},""); }catch(_){} }
window.addEventListener("popstate",function(){
  try{
    if(VIEW==="lesson"&&LESSON){ _armHistoryGuard();
      if(confirm("Quitter la leçon ? La progression de CETTE leçon sera perdue.")){ LESSON=null; VIEW="home"; render(); }
      return; }
    if(VIEW==="blitz"&&BZ&&!BZ.over){ _armHistoryGuard(); blitzEnd(); return; }
    if(VIEW==="pairs"&&PR&&!PR.over){ _armHistoryGuard(); go("home"); return; }
    if(VIEW==="pron"&&PRON&&!PRON.over){ _armHistoryGuard(); go("home"); return; }
    if(VIEW==="story"&&ST){ _armHistoryGuard(); storyQuit(); return; }
    if(ACC&&VIEW!=="home"){ VIEW="home"; render(); }
  }catch(_){}
});
function el(t,c){ var e=document.createElement(t); if(c)e.className=c; return e; }

/* ---------- Comptes ---------- */
function vAccounts(){
  var d=el("div","screen center accounts");
  var accs=accounts();
  d.innerHTML='<div class="mascot-wrap">'+MASCOT("wave",120)+'</div><h1 class="brand">KDMC <span>Lingua</span></h1><p class="sub">Qui apprend aujourd\'hui ? 👋</p>';
  var grid=el("div","acc-grid");
  accs.forEach(function(a){
    var b=el("button","acc-card");
    b.innerHTML='<span class="av">'+a.avatar+'</span><span class="an">'+esc(a.name)+'</span><span class="as">🔥 '+accStat(a.id,"streak",0)+' · ⭐ '+accStat(a.id,"xp",0)+'</span>';
    b.onclick=function(){ switchAccount(a.id); VIEW=S.course?"home":"home"; PICK=false; render(); };
    var del=el("button","acc-del"); del.textContent="✕"; del.title="Supprimer";
    del.onclick=function(ev){ ev.stopPropagation(); if(confirm("Supprimer le compte « "+a.name+" » et toute sa progression ?")){ deleteAccount(a.id); render(); } };
    var wrap=el("div","acc-cell"); wrap.appendChild(b); wrap.appendChild(del); grid.appendChild(wrap);
  });
  var add=el("button","acc-card add"); add.innerHTML='<span class="av">➕</span><span class="an">Nouveau compte</span>';
  add.onclick=openCreate; var addc=el("div","acc-cell"); addc.appendChild(add); grid.appendChild(addc);
  d.appendChild(grid);
  var login=el("button","btn-ghost small"); login.innerHTML="🔑 J'ai déjà un compte"; login.onclick=openLogin; d.appendChild(login);
  if(ACC){ var back=el("button","btn-ghost small"); back.textContent="← Revenir"; back.onclick=function(){ PICK=false; render(); }; d.appendChild(back); }
  var note=el("div","legal-note"); note.textContent="Application originale KDMC — non affiliée à un tiers."; d.appendChild(note);
  return d;
}
function openCreate(){
  var m=modal(); var av=AVATARS[Math.floor(Math.random()*AVATARS.length)];
  m.body.innerHTML='<h3>Nouveau compte</h3>'+
    '<input id="acName" class="txt" placeholder="Ton prénom" maxlength="18" autocomplete="off">'+
    '<input id="acCode" class="txt" placeholder="Code secret (facultatif)" inputmode="numeric" maxlength="10" autocomplete="off">'+
    '<p class="mini">🔒 <b>Facultatif</b> : un code sauvegarde ta progression <b>en ligne</b> (prénom + code = tout revient sur n\'importe quel téléphone). Tu peux commencer <b>sans</b>, et l\'ajouter plus tard.</p>'+
    '<p class="mini">Choisis ton avatar</p>';
  var g=el("div","av-pick");
  AVATARS.forEach(function(a){ var b=el("button","av-opt"+(a===av?" sel":"")); b.textContent=a; b.onclick=function(){ av=a; g.querySelectorAll(".av-opt").forEach(function(x){x.classList.remove("sel");}); b.classList.add("sel"); }; g.appendChild(b); });
  m.body.appendChild(g);
  var ok=el("button","btn-main"); ok.textContent="Créer mon compte";
  ok.onclick=function(){ var n=(m.body.querySelector("#acName").value||"").trim()||"Joueur"; var c=(m.body.querySelector("#acCode").value||"").trim();
    if(c && c.length<4){ toast("Le code doit faire au moins 4 chiffres (ou laisse-le vide) 🔒"); return; }
    ok.disabled=true; ok.textContent="…";
    if(!c){ var id=createAccount(n,av,""); switchAccount(id); m.close(); VIEW="home"; render(); return; } // sans code = on démarre direct (mémoire cloud = bonus optionnel)
    enterWithCredentials(n,av,c,true).then(function(res){ m.close(); VIEW="home"; render(); if(res&&res.restored) toast("👋 Compte retrouvé — bienvenue "+esc(n)+" !"); }); };
  m.body.appendChild(ok);
  setTimeout(function(){ var i=m.body.querySelector("#acName"); if(i)i.focus(); },100);
}
function openLogin(){
  var m=modal();
  m.body.innerHTML='<h3>🔑 Se connecter</h3><p class="mini">Entre le <b>prénom</b> et le <b>code</b> que tu avais choisis pour retrouver ta progression (même sur un nouveau téléphone).</p>'+
    '<input id="lgName" class="txt" placeholder="Ton prénom" maxlength="18" autocomplete="off">'+
    '<input id="lgCode" class="txt" placeholder="Ton code" inputmode="numeric" maxlength="10" autocomplete="off">';
  var ok=el("button","btn-main"); ok.textContent="Retrouver mon compte";
  ok.onclick=function(){ var n=(m.body.querySelector("#lgName").value||"").trim(); var c=(m.body.querySelector("#lgCode").value||"").trim();
    if(!n||c.length<4){ toast("Entre ton prénom et ton code 🔑"); return; }
    ok.disabled=true; ok.textContent="…";
    enterWithCredentials(n,"🦊",c,false).then(function(res){ if(res&&res.ok){ m.close(); VIEW="home"; render(); toast("👋 Bienvenue "+esc(n)+" !"); } else { ok.disabled=false; ok.textContent="Retrouver mon compte"; toast("Aucune sauvegarde pour ce prénom + code 🤔"); } }); };
  m.body.appendChild(ok);
  setTimeout(function(){ var i=m.body.querySelector("#lgName"); if(i)i.focus(); },100);
}
function openEnableCloud(){
  var m=modal();
  m.body.innerHTML='<h3>☁️ Activer la mémoire en ligne</h3><p class="mini">Choisis un code secret. Avec ton prénom + ce code, ta progression est sauvegardée et récupérable partout.</p>'+
    '<input id="ecCode" class="txt" placeholder="Code (4 chiffres min)" inputmode="numeric" maxlength="10" autocomplete="off">';
  var ok=el("button","btn-main"); ok.textContent="Activer";
  ok.onclick=function(){ var c=(m.body.querySelector("#ecCode").value||"").trim(); if(c.length<4){ toast("Code trop court (4 min)"); return; } setAccountCode(ACC,c); cloudSaveNow(); m.close(); toast("☁️ Mémoire en ligne activée !"); render(); };
  m.body.appendChild(ok);
  setTimeout(function(){ var i=m.body.querySelector("#ecCode"); if(i)i.focus(); },100);
}

/* ---------- Topbar ---------- */
function vTopbar(){ var t=el("div","topbar"); var c=S.course?COURSES[S.course]:null; var me=accMeta(ACC)||{avatar:"🦊"};
  t.innerHTML='<button class="tb-flag" id="tbFlag" title="Langues">'+(c?c.drapeau:"🌍")+'</button>'+
    '<div class="tb-stat streak"><span>🔥</span>'+S.streak+'</div>'+
    '<div class="tb-stat gems"><span>💎</span>'+S.gems+'</div>'+
    '<div class="tb-stat hearts"><span>❤️</span>'+(UNLIMITED?'∞':S.hearts)+'</div>'+
    '<button class="tb-av" id="tbAv" title="Comptes">'+me.avatar+'</button>';
  t.querySelector("#tbFlag").onclick=function(){ S.course=null; VIEW="home"; save(); render(); };
  t.querySelector("#tbAv").onclick=function(){ PICK=true; render(); };
  return t;
}

/* ---------- Choix de langue (course pick) ---------- */
function coursePct(id){ if(!COURSES[id])return 0; var tot=0,done=0; COURSES[id].units.forEach(function(u,ui){ u.lessons.forEach(function(_,li){ tot++; if((S.prog[id]||{})["u"+ui+"-"+li]>0)done++; }); }); return Math.round(done/tot*100); }
function vCoursePick(){ var d=el("div","screen"); d.innerHTML='<h2 class="ttl">🌍 Choisis une langue</h2><p class="sub2">'+Object.keys(COURSES).length+' langues — commence, ou continue là où tu en es.</p>';
  var list=el("div","course-pick");
  Object.keys(COURSES).forEach(function(id){ var c=COURSES[id],p=coursePct(id),b=el("button","course-card");
    b.innerHTML='<span class="flag">'+c.drapeau+'</span><span class="cnom">'+c.nom+(p>0?' <i class="cpct">'+p+'%</i>':'')+'<span class="cbar"><span style="width:'+p+'%"></span></span></span><span class="arrow">'+(p>0?'▶':'›')+'</span>';
    b.onclick=function(){ S.course=id; if(!S.prog[id])S.prog[id]={}; save(); VIEW="home"; render(); }; list.appendChild(b); });
  d.appendChild(list); return d;
}

/* ---------- Accueil ---------- */
/* VÉRITÉ (v2.67) : une leçon « faite » = vraiment faite. Le test de niveau ne marque plus
   les leçons comme faites : il les DÉBLOQUE seulement (valeur -1 = « ouverte, à faire »).
   unitDone ignore donc les -1 (pas de couronne, pas de % gonflé, examen verrouillé). */
function unitDone(ui,li){ return Math.max(0, S.prog[S.course]["u"+ui+"-"+li]||0); }
function unitPlaced(ui,li){ return (S.prog[S.course]["u"+ui+"-"+li]||0)===-1; }
function unitUnlocked(ui,li){ if(ui===0&&li===0)return true; if(unitPlaced(ui,li))return true; var c=COURSES[S.course],pu=ui,pl=li-1; if(pl<0){pu=ui-1;pl=c.units[pu].lessons.length-1;} return unitDone(pu,pl)>0||unitPlaced(pu,pl); }
function unitLessonsAllDone(ui){ var c=COURSES[S.course]; for(var li=0;li<c.units[ui].lessons.length;li++){ if(!(unitDone(ui,li)>0))return false; } return true; }
function examDone(ui){ return (S.prog[S.course]["ex"+ui]||0); }
function masteredCount(){ return Object.keys((S.words&&S.words[S.course])||{}).length; }
function currentLevel(){ var m=masteredCount(),cur=LEVELS[0],next=null;
  for(var i=0;i<LEVELS.length;i++){ if(m>=LEVELS[i].min)cur=LEVELS[i]; else { next=LEVELS[i]; break; } }
  var pct=100,remain=0; if(next){ var span=next.min-cur.min; remain=Math.max(0,next.min-m); pct=span>0?Math.round((m-cur.min)/span*100):0; }
  return {cur:cur,next:next,pct:Math.max(0,Math.min(100,pct)),remain:remain,words:m}; }
function nextLessonToDo(){ var c=COURSES[S.course]; for(var ui=0;ui<c.units.length;ui++){ for(var li=0;li<c.units[ui].lessons.length;li++){ if(unitPlaced(ui,li))continue; /* le test a ouvert celles-ci : la leçon CONSEILLÉE reprend après */ if(unitUnlocked(ui,li) && !(unitDone(ui,li)>0)) return {ui:ui,li:li,titre:c.units[ui].lessons[li].titre,unitTitre:c.units[ui].titre}; } } return null; }
function teacherTip(){ return TEACHER_TIPS[dayHash(today())%TEACHER_TIPS.length]; }
function phraseOfDayEntry(){ var ks=Object.keys(PHRASEBOOK); if(!ks.length)return null; var fr=ks[dayHash(today()+"p")%ks.length]; var e=PHRASEBOOK[fr]; return {fr:fr,t:(e&&e[COURSES[S.course].id])||fr}; }
function vHome(){ var w=el("div","screen tree");
  // ---- Parcours d'apprentissage (mode prof) ----
  var lv=currentLevel(), nx=nextLessonToDo(), dueN=dueWords().length, pod=phraseOfDayEntry();
  var plan=el("div","plan-card");
  var ph=el("div","plan-head"); ph.innerHTML='<span class="plan-ttl">📚 Ton parcours</span><span class="plan-lvl">'+esc(lv.cur.code)+'</span>'; plan.appendChild(ph);
  var lb=el("div","plan-lvlbar"); lb.innerHTML='<div class="bar"><div class="bar-fill" style="width:'+lv.pct+'%"></div></div><div class="plan-lvlsub">'+(lv.next?('Encore <b>'+lv.remain+'</b> mots pour '+esc(lv.next.code)):'Niveau max atteint 🎉')+'</div>'; plan.appendChild(lb);
  var acts=el("div","plan-acts");
  var b1=el("button","plan-btn primary");
  if(nx){ b1.innerHTML='▶️ Leçon conseillée<span>'+esc(nx.titre)+'</span>'; b1.onclick=function(){ startLesson(nx.ui,nx.li); }; }
  else { b1.innerHTML='🏆 Bravo !<span>Tout est ouvert — révise</span>'; b1.onclick=function(){ go('review'); }; }
  acts.appendChild(b1);
  var b2=el("button","plan-btn"); b2.innerHTML='🧠 Réviser<span>'+dueN+' mot'+(dueN>1?'s':'')+'</span>'; b2.onclick=function(){ go('review'); }; acts.appendChild(b2);
  plan.appendChild(acts);
  if(pod){ var phr=el("div","plan-phrase"); phr.innerHTML='💬 <b>'+esc(pod.t)+'</b> <span class="pod-fr">'+esc(pod.fr)+'</span>'; var sp=el("button","pod-say"); sp.textContent='🔊'; sp.setAttribute("aria-label","Écouter"); sp.onclick=function(){ speak(pod.t); }; phr.appendChild(sp); plan.appendChild(phr); }
  var tip=el("div","plan-tip"); tip.textContent='👩‍🏫 '+teacherTip(); plan.appendChild(tip);
  var df=el("button","plan-diff"); df.innerHTML='🎚️ Difficulté : <b>'+diffLabel()+'</b>'+(S.diff==null?' · 📊 fais le test de niveau':' · ajuster / test');
  df.onclick=openDiff; plan.appendChild(df);
  w.appendChild(plan);
  var gp=Math.min(100,Math.round(S.dailyXP/S.goal*100));
  var goal=el("div","goal-card");
  goal.innerHTML='<div class="goal-top"><b>🎯 Objectif du jour</b><span>'+S.dailyXP+' / '+S.goal+' XP</span></div><div class="bar"><div class="bar-fill" style="width:'+gp+'%"></div></div>'+(gp>=100?'<div class="goal-done">✅ Objectif atteint !</div>':'');
  w.appendChild(goal);
  // 📖 Histoires de la ruche — Bee raconte, tu comprends, tu gagnes
  if(typeof STORIES!=="undefined"&&STORIES.length&&STORIES[0].lignes[0].t[S.course]){ var sd=storiesDoneCount(); /* histoires cachées si pas encore traduites dans cette langue */
    var stc=el("button","stories-card");
    stc.innerHTML='<span class="st-ic">📖</span><span class="st-tx"><b>Histoires de la ruche</b><i>Bee te raconte une histoire en '+esc(COURSES[S.course].nom.toLowerCase())+'</i></span><span class="st-badge">'+sd+'/'+STORIES.length+'</span>';
    stc.onclick=function(){ go("stories"); }; w.appendChild(stc); }
  // ⚡🃏 Salle de jeux — deux défis chrono pour réviser en s'amusant
  var gr=el("div","games-row");
  var g1=el("button","game-card blitz");
  g1.innerHTML='<span class="gc-ic">⚡</span><b>Défi éclair</b><i>'+(S.blitzBest?('Record : '+S.blitzBest+' bonnes rép.'):'60 secondes chrono')+'</i>';
  g1.onclick=function(){ blitzStart(); };
  var g2=el("button","game-card pairs");
  g2.innerHTML='<span class="gc-ic">🃏</span><b>Paires</b><i>'+(S.pairsBest?('Record : '+S.pairsBest+' s'):'Retrouve les paires')+'</i>';
  g2.onclick=function(){ pairsStart(); };
  gr.appendChild(g1); gr.appendChild(g2); w.appendChild(gr);
  // 🎤 Atelier prononciation — écoute, répète, corrige ta diction
  var prc=el("button","stories-card pron-link");
  prc.innerHTML='<span class="st-ic">🎤</span><span class="st-tx"><b>Atelier prononciation</b><i>écoute, répète, corrige ton élocution '+(_srOk()?'(micro)':'(écoute & répète)')+'</i></span><span class="st-badge">🗣️</span>';
  prc.onclick=function(){ pronStart(); }; w.appendChild(prc);
  // 📊 Statistiques — activité, records, calendrier
  var stq=el("button","stories-card stats-link");
  stq.innerHTML='<span class="st-ic">📊</span><span class="st-tx"><b>Mes statistiques</b><i>calendrier d\'activité, records, langues</i></span><span class="st-badge">🔥 '+S.streak+'</span>';
  stq.onclick=function(){ go("stats"); }; w.appendChild(stq);
  // quêtes
  var q=el("div","quest-card"); q.innerHTML='<div class="qc-h">📋 Quêtes du jour</div>';
  todaysQuests().forEach(function(qq){ var v=Math.min(qq.g,questVal(qq.m)),done=S.qClaim[qq.id]; var row=el("div","q-row"+(done?" done":""));
    row.innerHTML='<span class="qi">'+(done?"✅":"🎁")+'</span><span class="qt">'+qq.t+'</span><span class="qp">'+v+'/'+qq.g+'</span><span class="qr">+'+qq.r+'💎</span>'; q.appendChild(row); });
  w.appendChild(q);
  var c=COURSES[S.course];
  c.units.forEach(function(u,ui){ var sec=el("div","unit"); sec.style.setProperty("--uc",u.couleur); var crowns=0; u.lessons.forEach(function(_,li){crowns+=unitDone(ui,li);});
    sec.innerHTML='<div class="unit-head"><div><div class="unit-k">UNITÉ '+(ui+1)+'</div><div class="unit-t">'+esc(u.titre)+'</div></div><div class="unit-crowns">👑 '+crowns+'/'+u.lessons.length+'</div></div>';
    var path=el("div","path");
    u.lessons.forEach(function(l,li){ var done=unitDone(ui,li),unl=unitUnlocked(ui,li),node=el("button","node"+(done>0?" done":"")+(unl?"":" locked"));
      node.style.marginLeft=(Math.sin(li*1.1)*54+54)+"px"; node.innerHTML=done>0?'<span class="ncrown">👑</span>':(unl?'⭐':'🔒'); node.title=esc(l.titre);
      node.onclick= unl?function(){startLesson(ui,li);}:function(){toast("Termine la leçon précédente 🔒");};
      var lab=el("div","node-lab"); lab.textContent=l.titre; var cell=el("div","cell"); cell.appendChild(node); cell.appendChild(lab); path.appendChild(cell); });
    // Examen de l'unité (débloqué quand toutes les leçons sont finies)
    var exUnl=unitLessonsAllDone(ui),exd=examDone(ui);
    var enode=el("button","node exam"+(exd>0?" done":"")+(exUnl?"":" locked"));
    enode.style.marginLeft=(Math.sin(u.lessons.length*1.1)*54+54)+"px";
    enode.innerHTML=exd>0?'<span class="ncrown">🏆</span>':(exUnl?'📝':'🔒');
    enode.title="Examen de l'unité";
    enode.onclick= exUnl?function(){startExam(ui);}:function(){toast("Termine toutes les leçons de l'unité pour l'examen 🔒");};
    var elab=el("div","node-lab"); elab.textContent="Examen"; var ecell=el("div","cell"); ecell.appendChild(enode); ecell.appendChild(elab); path.appendChild(ecell);
    sec.appendChild(path); w.appendChild(sec); });
  return w;
}

/* ---------- Révision + dico ---------- */
function vReview(){ var d=el("div","screen"); var due=dueWords();
  d.innerHTML='<h2 class="ttl">🧠 Révision</h2>';
  var card=el("div","review-card"); card.innerHTML='<div class="mascot-mini">'+MASCOT("read",90)+'</div><p>'+(due.length?'<b>'+due.length+'</b> mot(s) à réviser aujourd\'hui.':'Rien d\'urgent — fais une révision libre !')+'</p>';
  var b=el("button","btn-main"); b.textContent=due.length?"Réviser maintenant":"Révision libre";
  b.onclick=function(){ var rw=due.length?due.slice(0,10):shuffle(allWords(S.course)).slice(0,10); startLesson(null,null,rw); }; card.appendChild(b);
  var b2=el("button","btn-ghost"); b2.textContent="📖 Voir le dictionnaire"; b2.onclick=function(){ go("dict"); }; card.appendChild(b2);
  d.appendChild(card); return d;
}
function vDict(){ var d=el("div","screen"); var c=COURSES[S.course]; var seen=S.words[S.course]||{};
  d.innerHTML='<h2 class="ttl">📖 Dictionnaire — '+c.drapeau+' '+esc(c.nom)+'</h2><p class="sub2">Touche un mot pour l\'écouter. ✔ = appris.</p>';
  c.units.forEach(function(u){ var sec=el("div","dict-unit"); sec.innerHTML='<div class="du-h">'+esc(u.titre)+'</div>'; var g=el("div","dict-grid");
    u.lessons.forEach(function(l){ l.words.forEach(function(w){ var known=seen[srsKey(w)]; var b=el("button","dword"+(known?" known":""));
      b.innerHTML='<b>'+esc(w.t)+'</b><i>'+esc(w.fr)+'</i>'+(known?'<span class="chk">✔</span>':''); b.onclick=function(){ speak(w.t); }; g.appendChild(b); }); });
    sec.appendChild(g); d.appendChild(sec); });
  var back=el("button","btn-ghost"); back.textContent="← Retour"; back.onclick=function(){ go("review"); }; d.appendChild(back);
  return d;
}

/* ---------- Ligue ---------- */
function vLeague(){ var d=el("div","screen"); var rows=leagueRows(); var multi=rows.length>1;
  d.innerHTML='<h2 class="ttl">🏆 Ta semaine</h2><p class="sub2">XP RÉELLE des 7 derniers jours'+(multi?' — toi et les comptes de cet appareil':'')+'. Que du vrai, aucun joueur inventé.</p>';
  var list=el("div","lb"); rows.forEach(function(r,i){ var row=el("div","lb-row"+(r.you?" me":"")+(multi&&i<3?" top":""));
    var medal=(multi&&i===0)?"🥇 ":(multi&&i===1)?"🥈 ":(multi&&i===2)?"🥉 ":"";
    row.innerHTML='<span class="rk">'+(i+1)+'</span><span class="rn">'+medal+esc(r.avatar||"")+" "+esc(r.name)+(r.you?" (toi)":"")+'</span><span class="rx">'+r.xp+' XP</span>'; list.appendChild(row); });
  d.appendChild(list);
  if(!multi){ var note=el("p","sub2"); note.style.marginTop="12px";
    note.textContent="Tu es seul sur cet appareil : ajoute un compte (ex. Laurence) pour un vrai classement à plusieurs — ici, aucun adversaire inventé, uniquement des personnes réelles."; d.appendChild(note); }
  var back=el("button","btn-ghost"); back.textContent="← Retour"; back.onclick=function(){ go("home"); }; d.appendChild(back);
  return d;
}

/* ============ ⚡ Défi éclair — 60 s, un max de bonnes réponses ============ */
var BZ=null,BZT=null;
function blitzPool(){ var all=allWords(S.course), seen=S.words[S.course]||{};
  var learned=all.filter(function(w){ return seen[srsKey(w)]; });
  return learned.length>=12?learned:all; }
function blitzNextQ(){ var pool=blitzPool(); var w=pool[Math.floor(Math.random()*pool.length)];
  BZ.n=(BZ.n||0)+1; BZ.cur=makeMC(w, allWords(S.course), BZ.n%2? "mc_t":"mc_fr"); }
function blitzStart(){ if(!S.course)return; blitzAbort(); pairsAbort();
  BZ={left:60,good:0,total:0,over:false,lock:false,n:0}; blitzNextQ();
  VIEW="blitz"; _armHistoryGuard(); window.scrollTo(0,0); render();
  BZT=setInterval(function(){ if(!BZ||BZ.over){ if(BZT){clearInterval(BZT);BZT=null;} return; }
    BZ.left--; if(BZ.left<=0){ blitzEnd(); return; }
    var e=document.querySelector(".bz-time b"); if(e)e.textContent=BZ.left;
    var f=document.querySelector(".bz-bar-fill"); if(f){ f.style.width=(BZ.left/60*100)+"%"; if(BZ.left<=10)f.classList.add("hot"); }
  },1000); }
function blitzAnswer(oi){ if(!BZ||BZ.over||BZ.lock)return; BZ.lock=true; BZ.total++;
  var opt=BZ.cur.opts[oi], ok=norm(opt)===norm(BZ.cur.answer);
  if(ok){ BZ.good++; beep(true); vibrate(10); } else { BZ.left=Math.max(1,BZ.left-3); beep(false); vibrate(28); }
  var btns=document.querySelectorAll(".bz-opt");
  if(btns[oi])btns[oi].classList.add(ok?"good":"bad");
  if(!ok){ for(var i=0;i<btns.length;i++){ if(norm(BZ.cur.opts[i])===norm(BZ.cur.answer))btns[i].classList.add("good"); } }
  var sc=document.querySelector(".bz-score b"); if(sc)sc.textContent=BZ.good;
  setTimeout(function(){ if(!BZ||BZ.over)return; BZ.lock=false; blitzNextQ(); render(); }, ok?260:600); }
function blitzEnd(){ if(!BZ||BZ.over)return; if(BZT){clearInterval(BZT);BZT=null;} BZ.over=true;
  var xp=Math.min(30,Math.max(2,BZ.good)); BZ.xp=xp;
  if(BZ.good>(S.blitzBest||0)){ S.blitzBest=BZ.good; BZ.rec=true; }
  S.xp+=xp; S.dailyXP+=xp; S.today.xp=(S.today.xp||0)+xp; S.today.blitz=(S.today.blitz||0)+1;
  bumpStreak(); leagueAdd(xp); histAdd(xp); save(); checkAchv(); checkQuests(); render();
  setTimeout(function(){ speakLang(BZ&&BZ.rec?("Nouveau record ! "+S.blitzBest+" bonnes réponses, tu es une fusée !"):"Défi terminé ! Bien joué !","fr-FR",BEE_VOICE,true); },400); }
function blitzAbort(){ if(BZT){clearInterval(BZT);BZT=null;} BZ=null; }
function vBlitz(){ var d=el("div","screen blitz"); if(!BZ){ VIEW="home"; return vHome(); }
  if(BZ.over){
    d.innerHTML='<div class="bz-done"><div class="mascot-mini big">'+MASCOT(BZ.good>=10?"party":"wave",110)+'</div>'
      +'<h2>⚡ Défi terminé !</h2>'
      +(BZ.rec?'<div class="bz-rec">🚀 NOUVEAU RECORD !</div>':'')
      +'<div class="reward-grid"><div class="rw"><span>✅</span><b>'+BZ.good+'</b><i>bonnes rép.</i></div><div class="rw"><span>⭐</span><b>+'+BZ.xp+'</b><i>XP</i></div><div class="rw"><span>🏅</span><b>'+(S.blitzBest||0)+'</b><i>record</i></div></div></div>';
    var again=el("button","btn-main"); again.textContent="⚡ Rejouer"; again.onclick=function(){ blitzStart(); }; d.appendChild(again);
    var back=el("button","btn-ghost"); back.textContent="← Accueil"; back.onclick=function(){ go("home"); }; d.appendChild(back);
    return d; }
  var head=el("div","bz-head");
  head.innerHTML='<button class="bz-quit" aria-label="Quitter">✕</button><span class="bz-time">⏱ <b>'+BZ.left+'</b> s</span><span class="bz-score">✅ <b>'+BZ.good+'</b></span>';
  head.querySelector(".bz-quit").onclick=function(){ blitzEnd(); };
  d.appendChild(head);
  var bar=el("div","bz-bar"); bar.innerHTML='<div class="bz-bar-fill'+(BZ.left<=10?" hot":"")+'" style="width:'+(BZ.left/60*100)+'%"></div>'; d.appendChild(bar);
  var q=el("div","bz-q");
  q.innerHTML='<div class="bz-dir">'+(BZ.cur.mode==="mc_fr"?"Traduis en français :":"Traduis en "+esc(COURSES[S.course].nom.toLowerCase())+" :")+'</div><div class="bz-word">'+esc(BZ.cur.prompt)+'</div>';
  d.appendChild(q);
  var og=el("div","bz-opts");
  BZ.cur.opts.forEach(function(o,i){ var b=el("button","bz-opt"); b.textContent=o; b.onclick=function(){ blitzAnswer(i); }; og.appendChild(b); });
  d.appendChild(og);
  return d;
}

/* ============ 🃏 Paires chrono — retrouve les 6 paires ============ */
var PR=null,PRT=null;
function pairsStart(){ if(!S.course)return; blitzAbort(); pairsAbort();
  var pool=blitzPool(), seenT={}, seenF={}, ws=[];
  shuffle(pool).forEach(function(w){ if(ws.length>=6)return; if(seenT[norm(w.t)]||seenF[norm(w.fr)])return; seenT[norm(w.t)]=1; seenF[norm(w.fr)]=1; ws.push(w); });
  if(ws.length<3){ toast("Pas assez de mots — fais d'abord une leçon 🐝"); return; }
  var tiles=[]; ws.forEach(function(w,k){ tiles.push({k:k,side:"fr",txt:w.fr}); tiles.push({k:k,side:"t",txt:w.t}); });
  PR={tiles:shuffle(tiles),need:ws.length,found:0,t0:Date.now(),sel:-1,lock:false,over:false,badA:null,badB:null};
  VIEW="pairs"; _armHistoryGuard(); window.scrollTo(0,0); render();
  PRT=setInterval(function(){ if(!PR||PR.over){ if(PRT){clearInterval(PRT);PRT=null;} return; }
    var e=document.querySelector(".pr-time b"); if(e)e.textContent=Math.round((Date.now()-PR.t0)/1000); },500); }
function pairsTap(i){ if(!PR||PR.over||PR.lock)return; var t=PR.tiles[i]; if(t.done||i===PR.sel)return;
  if(PR.sel<0){ PR.sel=i; render(); return; }
  var a=PR.tiles[PR.sel];
  if(a.k===t.k && a.side!==t.side){ a.done=t.done=true; PR.found++; PR.sel=-1; beep(true); vibrate(12);
    /* Kevin : « ne dis pas tous les mots sur les paires » → on garde le son de réussite (beep), pas la voix */
    if(PR.found>=PR.need){ pairsEnd(); } else render(); }
  else { PR.lock=true; PR.badA=PR.sel; PR.badB=i; beep(false); vibrate(28); render();
    setTimeout(function(){ if(!PR)return; PR.lock=false; PR.badA=PR.badB=null; PR.sel=-1; render(); },420); } }
function pairsEnd(){ if(!PR||PR.over)return; if(PRT){clearInterval(PRT);PRT=null;} PR.over=true;
  PR.secs=Math.max(1,Math.round((Date.now()-PR.t0)/1000));
  var xp=PR.secs<=45?14:10; PR.xp=xp;
  if(!S.pairsBest||PR.secs<S.pairsBest){ S.pairsBest=PR.secs; PR.rec=true; }
  S.xp+=xp; S.dailyXP+=xp; S.today.xp=(S.today.xp||0)+xp; S.today.pairs=(S.today.pairs||0)+1;
  bumpStreak(); leagueAdd(xp); histAdd(xp); save(); checkAchv(); checkQuests(); render();
  setTimeout(function(){ speakLang(PR&&PR.rec?("Record ! "+S.pairsBest+" secondes, quelle mémoire !"):"Toutes les paires trouvées, bravo !","fr-FR",BEE_VOICE,true); },400); }
function pairsAbort(){ if(PRT){clearInterval(PRT);PRT=null;} PR=null; }
function vPairs(){ var d=el("div","screen pairs"); if(!PR){ VIEW="home"; return vHome(); }
  if(PR.over){
    d.innerHTML='<div class="bz-done"><div class="mascot-mini big">'+MASCOT(PR.secs<=45?"party":"wave",110)+'</div>'
      +'<h2>🃏 Paires trouvées !</h2>'
      +(PR.rec?'<div class="bz-rec">🏆 NOUVEAU RECORD !</div>':'')
      +'<div class="reward-grid"><div class="rw"><span>⏱</span><b>'+PR.secs+' s</b><i>temps</i></div><div class="rw"><span>⭐</span><b>+'+PR.xp+'</b><i>XP</i></div><div class="rw"><span>🏅</span><b>'+(S.pairsBest||0)+' s</b><i>record</i></div></div></div>';
    var again=el("button","btn-main"); again.textContent="🃏 Rejouer"; again.onclick=function(){ pairsStart(); }; d.appendChild(again);
    var back=el("button","btn-ghost"); back.textContent="← Accueil"; back.onclick=function(){ go("home"); }; d.appendChild(back);
    return d; }
  var head=el("div","bz-head");
  head.innerHTML='<button class="bz-quit" aria-label="Quitter">✕</button><span class="pr-time">⏱ <b>'+Math.round((Date.now()-PR.t0)/1000)+'</b> s</span><span class="bz-score">🃏 <b>'+PR.found+'/'+PR.need+'</b></span>';
  head.querySelector(".bz-quit").onclick=function(){ go("home"); };
  d.appendChild(head);
  var hint=el("p","sub2"); hint.textContent="Associe chaque mot à sa traduction — le plus vite possible !"; d.appendChild(hint);
  var g=el("div","pr-grid");
  PR.tiles.forEach(function(t,i){ var b=el("button","pr-tile"+(t.done?" done":"")+(i===PR.sel?" sel":"")+((i===PR.badA||i===PR.badB)?" bad":"")+(t.side==="t"?" lang":""));
    b.textContent=t.txt; b.onclick=function(){ pairsTap(i); }; g.appendChild(b); });
  d.appendChild(g);
  return d;
}

/* ============ 📊 Statistiques — calendrier d'activité + records ============ */
function lessonsDoneTotal(){ var n=0; Object.keys(S.prog).forEach(function(c){ var p=S.prog[c]||{}; Object.keys(p).forEach(function(k){ if(p[k]>0)n++; }); }); return n; }
function vStats(){ var d=el("div","screen");
  d.innerHTML='<h2 class="ttl">📊 Mes statistiques</h2>';
  // grands chiffres
  var sg=el("div","stat-grid");
  sg.innerHTML='<div class="sg"><span>🔥</span><b>'+S.streak+'</b><i>Série</i></div><div class="sg"><span>⭐</span><b>'+S.xp+'</b><i>XP total</i></div><div class="sg"><span>📚</span><b>'+wordCount()+'</b><i>Mots</i></div><div class="sg"><span>👑</span><b>'+lessonsDoneTotal()+'</b><i>Leçons finies</i></div>';
  d.appendChild(sg);
  // calendrier d'activité (12 dernières semaines)
  var hw=el("div","heat-wrap"); hw.innerHTML='<div class="sec-h">🗓️ Ton activité (12 semaines)</div>';
  var grid=el("div","heat-grid"); var d0=new Date(), tot84=0, act84=0;
  for(var i=83;i>=0;i--){ var dt=new Date(d0.getFullYear(),d0.getMonth(),d0.getDate()-i);
    var k=dt.getFullYear()+"-"+(dt.getMonth()+1)+"-"+dt.getDate(); var xp=(S.hist&&S.hist[k])||0;
    tot84+=xp; if(xp>0)act84++;
    var lv=xp<=0?0:xp<15?1:xp<30?2:xp<60?3:4;
    var c=el("div","heat h"+lv); c.title=dt.getDate()+"/"+(dt.getMonth()+1)+" — "+xp+" XP"; grid.appendChild(c); }
  hw.appendChild(grid);
  var leg=el("div","heat-legend"); leg.innerHTML='<span>Moins</span><i class="heat h0"></i><i class="heat h1"></i><i class="heat h2"></i><i class="heat h3"></i><i class="heat h4"></i><span>Plus</span>'; hw.appendChild(leg);
  var sum=el("p","mini"); sum.textContent=act84+" jour"+(act84>1?"s":"")+" actif"+(act84>1?"s":"")+" · "+tot84+" XP sur la période"; hw.appendChild(sum);
  d.appendChild(hw);
  // records
  var rc=el("div","rec-wrap"); rc.innerHTML='<div class="sec-h">🏆 Records</div>';
  var rg=el("div","rec-grid");
  rg.innerHTML='<div class="rec"><span>⚡</span><b>'+(S.blitzBest||"—")+'</b><i>Défi éclair</i></div>'
    +'<div class="rec"><span>🃏</span><b>'+(S.pairsBest?S.pairsBest+" s":"—")+'</b><i>Paires</i></div>'
    +'<div class="rec"><span>📖</span><b>'+(typeof storiesDoneCount==="function"?storiesDoneCount():0)+'/'+(typeof STORIES!=="undefined"?STORIES.length:0)+'</b><i>Histoires</i></div>'
    +'<div class="rec"><span>🎤</span><b>'+(S.pronGoodTotal||0)+'</b><i>Mots bien dits</i></div>'
    +'<div class="rec"><span>🏅</span><b>'+Object.keys(S.achv).length+'/'+ACHV.length+'</b><i>Succès</i></div>';
  rc.appendChild(rg); d.appendChild(rc);
  // par langue
  var lw=el("div","langs-wrap"); lw.innerHTML='<div class="sec-h">🌍 Mes langues</div>';
  var any=false;
  Object.keys(COURSES).forEach(function(cid){ var c=COURSES[cid]; var done=0,p=S.prog[cid]||{};
    Object.keys(p).forEach(function(k){ if(p[k]>0)done++; });
    var wn=Object.keys(S.words[cid]||{}).length;
    if(!done&&!wn&&cid!==S.course)return; any=true;
    var row=el("div","lang-row"+(cid===S.course?" cur":""));
    row.innerHTML='<span class="lr-fl">'+c.drapeau+'</span><span class="lr-n">'+esc(c.nom)+(cid===S.course?' <i>(en cours)</i>':'')+'</span><span class="lr-s">👑 '+done+' · 📚 '+wn+'</span>';
    lw.appendChild(row); });
  if(any)d.appendChild(lw);
  var back=el("button","btn-ghost"); back.textContent="← Accueil"; back.onclick=function(){ go("home"); }; d.appendChild(back);
  return d;
}

/* ============ 🎤 Atelier prononciation (Kevin 2026-08-08 : « travailler la
   prononciation, élocution, avec corrections + explications ») ============
   Pour CHAQUE mot : modèle audio (normal + 🐢 lent), découpage en syllabes,
   ASTUCE d'élocution ciblée sur les sons difficiles pour un francophone (règles
   originales par langue), puis reconnaissance vocale → SCORE %, CORRECTION précise
   (ce qu'on a entendu vs attendu) et EXPLICATION. Sans micro (iPhone Safari) :
   repli « écoute → répète → je m'auto-évalue », mêmes astuces + audio lent. */
var PRON_RULES={
 en:[{re:/th/i,son:"« th »",tip:"Bout de la langue entre les dents, souffle légèrement — ni « z » ni « s »."},
     {re:/(^|\s)h\w/i,son:"« h » aspiré",tip:"Souffle vraiment le « h » (petit coup d'air) : il n'est pas muet comme en français."},
     {re:/r/i,son:"« r »",tip:"« r » doux : la langue recule sans toucher le palais — surtout ne le roule pas."},
     {re:/oo|ee|ea/i,son:"voyelle longue",tip:"Tiens la voyelle plus longtemps : sheep = « chiiip », pas « chip »."},
     {re:/w/i,son:"« w »",tip:"Arrondis les lèvres comme pour « ou » puis enchaîne (water = « ouoter »)."},
     {re:/ed$/i,son:"« -ed » final",tip:"Souvent un simple « t » ou « d » discret, pas « eude »."}],
 it:[{re:/(.)\1/i,son:"consonne double",tip:"Appuie/allonge la consonne double : pizza = « pit-tsa ». Essentiel en italien."},
     {re:/gli/i,son:"« gli »",tip:"« l » mouillé : langue au palais, comme « lli » de « million »."},
     {re:/gn/i,son:"« gn »",tip:"Comme le « gn » de « montagne »."},
     {re:/ch/i,son:"« ch »",tip:"Se dit « k » : chi = « ki »."},
     {re:/ci|ce/i,son:"« c » doux",tip:"« ci/ce » se disent « tchi/tché »."},
     {re:/r/i,son:"« r » roulé",tip:"Roule légèrement le « r » avec le bout de la langue."}],
 es:[{re:/rr|^r/i,son:"« r » roulé",tip:"Fais vibrer la langue plusieurs fois : perro. Un vrai roulement."},
     {re:/j|ge|gi/i,son:"« jota »",tip:"Son raclé au fond de la gorge, pas un « j » français (jamón)."},
     {re:/ll/i,son:"« ll »",tip:"Se dit « y » : calle = « caye »."},
     {re:/ñ/i,son:"« ñ »",tip:"« gn » de « montagne » : niño."},
     {re:/h/i,son:"« h » muet",tip:"Le « h » est totalement muet : hola = « ola »."},
     {re:/v/i,son:"« v »",tip:"Se prononce presque comme un « b » doux."}],
 de:[{re:/ü/i,son:"« ü »",tip:"Dis « i » mais lèvres arrondies comme pour « ou »."},
     {re:/ö/i,son:"« ö »",tip:"Dis « é » avec les lèvres arrondies."},
     {re:/ä/i,son:"« ä »",tip:"Comme un « è » ouvert."},
     {re:/sch/i,son:"« sch »",tip:"Comme « ch » de « chat »."},
     {re:/ch/i,son:"« ch »",tip:"Souffle doux au palais (ich) ou raclé en gorge (Bach) selon la voyelle avant."},
     {re:/z/i,son:"« z »",tip:"Se dit « ts » : zehn = « tsén »."},
     {re:/w/i,son:"« w »",tip:"Se dit « v »."},
     {re:/ei/i,son:"« ei »",tip:"Se dit « aï »."}],
 pt:[{re:/ão|ãe|õe|ã|õ/i,son:"voyelle nasale",tip:"Fais résonner dans le nez : ão ≈ « aon » nasal, sans détacher le « o »."},
     {re:/nh/i,son:"« nh »",tip:"Comme « gn » de « montagne »."},
     {re:/lh/i,son:"« lh »",tip:"« l » mouillé, comme « lli » de « million »."},
     {re:/ç|ce|ci/i,son:"« ç »",tip:"Se dit « s »."},
     {re:/^r|rr/i,son:"« r » fort",tip:"« r » raclé en gorge en début de mot (au Portugal)."},
     {re:/s$/i,son:"« s » final",tip:"En fin de mot, le « s » se dit souvent « ch »."}],
 nl:[{re:/g|ch/i,son:"« g/ch »",tip:"Son raclé au fond de la gorge : le fameux « g » néerlandais."},
     {re:/ui/i,son:"« ui »",tip:"Diphtongue délicate, entre « eu » et « ei » : arrondis puis relâche."},
     {re:/ij|ei/i,son:"« ij/ei »",tip:"Se dit « aï »."},
     {re:/oe/i,son:"« oe »",tip:"Se dit « ou »."},
     {re:/w/i,son:"« w »",tip:"« v » doux (avec les lèvres, pas les dents)."}]
};
function pronTips(word,cid){ var rules=PRON_RULES[cid]||[],seen={},out=[];
  rules.forEach(function(r){ if(out.length>=3)return; if(r.re.test(word)&&!seen[r.son]){ seen[r.son]=1; out.push(r); } });
  if(!out.length) out.push({son:"rythme",tip:"Écoute (🐢 lent), répète syllabe par syllabe, puis en entier — sans forcer."});
  return out; }
/* découpage syllabique heuristique (visuel) : coupe avant une consonne suivie d'une voyelle */
function pronSyllables(word){ var V="aáàâäeéèêëiíìîïoóòôöuúùûüyœæ"; var s=String(word||"");
  var out="",prevV=false;
  for(var i=0;i<s.length;i++){ var c=s[i],lc=c.toLowerCase(),isV=V.indexOf(lc)>=0;
    if(!isV && prevV && i<s.length-1){ var nx=s[i+1]?s[i+1].toLowerCase():""; if(V.indexOf(nx)>=0){ out+="·"; } }
    out+=c; prevV=isV; }
  return out; }
function _lev(a,b){ a=a||"";b=b||""; var m=a.length,n=b.length; if(!m)return n; if(!n)return m;
  var d=[]; for(var i=0;i<=m;i++)d[i]=[i]; for(var j=0;j<=n;j++)d[0][j]=j;
  for(i=1;i<=m;i++)for(j=1;j<=n;j++){ var c=a[i-1]===b[j-1]?0:1; d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+c); }
  return d[m][n]; }
function pronScore(target,heard){ var a=norm(target),b=norm(heard); if(!b)return 0;
  var mx=Math.max(a.length,b.length)||1; return Math.max(0,Math.round(100*(1-_lev(a,b)/mx))); }
/* Diagnostic fin : trouve la 1re syllabe où « entendu » diverge de la cible → correction ciblée. */
function pronDiffSyl(target,heard){ var sy=pronSyllables(target).split("·").filter(Boolean);
  var a=norm(target),b=norm(heard||""); var i=0; while(i<a.length&&i<b.length&&a[i]===b[i])i++;
  var acc=0; for(var k=0;k<sy.length;k++){ acc+=norm(sy[k]).length; if(i<acc)return {idx:k,syl:sy[k],sylls:sy}; }
  return {idx:Math.max(0,sy.length-1),syl:sy[sy.length-1]||target,sylls:sy}; }
/* Déblocage audio iOS : au 1er vrai geste (toucher/clic), on « réveille » le moteur audio du navigateur
   (AudioContext) + on joue un buffer silencieux — obligatoire sur iPhone pour que le moteur passe en
   "running". Une fois débloqué, la bouche de Bee peut s'animer sur le VRAI son sans jamais couper le son. */
function _audioUnlock(){
  try{
    AC=AC||new(window.AudioContext||window.webkitAudioContext)();
    if(AC.state!=="running"&&AC.resume){ AC.resume(); }
    var b=AC.createBuffer(1,1,22050), s=AC.createBufferSource(); s.buffer=b; s.connect(AC.destination);
    (s.start||s.noteOn).call(s,0);
  }catch(_){}
}
try{
  ["touchend","click","pointerdown","keydown"].forEach(function(ev){
    document.addEventListener(ev,_audioUnlock,{passive:true});
  });
}catch(_){}
/* ============ 👄 LIP-SYNC RÉEL — la bouche de Bee s'ouvre sur l'amplitude du VRAI son (comme Speak) ============
   Web Audio analyse le son réel du modèle (le worker /tts renvoie ACAO:* → analyse cross-origin OK avec
   crossOrigin="anonymous"). La source est TOUJOURS branchée à la sortie AVANT l'analyse → le son passe même
   si l'analyse échoue. Repli automatique : si l'amplitude reste plate ~500 ms (codec/navigateur limité),
   on remet le flap CSS .talking pour que la bouche bouge quand même. Retourne une fonction stop(). */
function beeLipSync(audioEl,mouthEl){ if(!audioEl||!mouthEl)return null;
  /* iOS CRITIQUE : brancher un <audio> dans le moteur audio (createMediaElementSource) DÉTOURNE le son
     par ce moteur — et sur iPhone, si le moteur n'est pas "running" (débloqué par un vrai geste), le son
     est COUPÉ. Donc si le moteur n'est pas prêt, on NE touche PAS au son : on retourne null → l'appelant
     remet le flap CSS .talking (la bouche bouge quand même) et le son sort normalement par l'<audio>. */
  try{ if(!AC || AC.state!=="running") return null; }catch(_){ return null; }
  try{
    if(!audioEl._srcNode){ audioEl._srcNode=AC.createMediaElementSource(audioEl); }
    audioEl._srcNode.connect(AC.destination);               /* le SON d'abord — jamais coupé */
    var an=AC.createAnalyser(); an.fftSize=256; an.smoothingTimeConstant=0.55;
    audioEl._srcNode.connect(an);                            /* prise d'analyse (non rebranchée → passif) */
    var buf=new Uint8Array(an.fftSize), raf=0, maxR=0, flapped=false;
    var t0=(window.performance&&performance.now)?performance.now():Date.now();
    mouthEl.classList.remove("talking"); mouthEl.style.opacity="1";
    function frame(){
      an.getByteTimeDomainData(buf);
      var s=0,i; for(i=0;i<buf.length;i++){ var v=(buf[i]-128)/128; s+=v*v; }
      var rms=Math.sqrt(s/buf.length); if(rms>maxR)maxR=rms;
      var open=Math.max(0,Math.min(1,(rms-0.01)*7));
      mouthEl.style.transform="translate(-50%,-50%) scaleY("+(0.3+open*1.6).toFixed(2)+") scaleX("+(1+open*0.4).toFixed(2)+")";
      var now=(window.performance&&performance.now)?performance.now():Date.now();
      if(!flapped && now-t0>500 && maxR<0.012){ flapped=true; mouthEl.style.transform=""; mouthEl.classList.add("talking"); }
      raf=requestAnimationFrame(frame);
    }
    raf=requestAnimationFrame(frame);
    return function(){ try{ cancelAnimationFrame(raf); }catch(_){} try{ an.disconnect(); }catch(_){}
      try{ mouthEl.classList.remove("talking"); mouthEl.style.transform=""; mouthEl.style.opacity=""; }catch(_){} };
  }catch(e){ return null; }
}
/* Variante « flux direct » : la bouche de Bee mime sur un MediaStream (voix live de l'appel). */
function beeLipSyncStream(stream,mouthEl){ if(!stream||!mouthEl)return null;
  try{
    AC=AC||new(window.AudioContext||window.webkitAudioContext)();
    if(AC.state==="suspended"){ try{ AC.resume(); }catch(_){} }
    var src=AC.createMediaStreamSource(stream);
    var an=AC.createAnalyser(); an.fftSize=256; an.smoothingTimeConstant=0.55; src.connect(an); /* analyse seule (pas vers destination : le son sort par l'<audio>) */
    var buf=new Uint8Array(an.fftSize), raf=0;
    mouthEl.classList.remove("talking"); mouthEl.style.opacity="1";
    function frame(){
      an.getByteTimeDomainData(buf);
      var s=0,i; for(i=0;i<buf.length;i++){ var v=(buf[i]-128)/128; s+=v*v; }
      var rms=Math.sqrt(s/buf.length), open=Math.max(0,Math.min(1,(rms-0.01)*7));
      mouthEl.style.transform="translate(-50%,-50%) scaleY("+(0.3+open*1.6).toFixed(2)+") scaleX("+(1+open*0.4).toFixed(2)+")";
      raf=requestAnimationFrame(frame);
    }
    raf=requestAnimationFrame(frame);
    return function(){ try{ cancelAnimationFrame(raf); }catch(_){} try{ an.disconnect(); }catch(_){} try{ src.disconnect(); }catch(_){}
      try{ mouthEl.classList.remove("talking"); mouthEl.style.transform=""; mouthEl.style.opacity=""; }catch(_){} };
  }catch(e){ return null; }
}
/* joue le modèle : normal, ou 🐢 lent (cloud &s=0.6 sans changer la voix ; repli local rate bas).
   Si une Bee gros plan est à l'écran (.pron-bee), sa bouche s'anime sur le son réel. */
var _pronLip=null;
function _pronLipStop(){ if(_pronLip){ try{ _pronLip(); }catch(_){} _pronLip=null; } }
function pronSay(text,slow){ if(!S.sound||!text)return; var lang=COURSES[S.course].ttsLang,v=S.voice||"nova"; var myReq=++_ttsReq;
  try{ if(window.speechSynthesis)speechSynthesis.cancel(); }catch(_){} _wsStopKA(); _pronLipStop();
  var bee=document.querySelector(".pron-bee"), mouth=bee&&bee.querySelector(".disc-mouth");
  if(_isCloudVoice(v)){ try{ if(_ttsAudio){ try{_ttsAudio.pause();}catch(_){} _ttsAudio=null; }
    var vr=voiceReal(v)||{};
    var a=new Audio(); a.crossOrigin="anonymous"; a.src=SYNC_BASE+"/tts?v="+encodeURIComponent(vr.tts||v)+(slow?"&s=0.6":(vr.gen?"&s="+vr.gen:""))+"&t="+encodeURIComponent(text); _ttsAudio=a;
    if(vr.rate&&!slow){ try{ a.preservesPitch=false; a.webkitPreservesPitch=false; a.playbackRate=vr.rate; }catch(_){} }
    a.addEventListener("playing",function(){ if(myReq!==_ttsReq)return; if(bee)bee.classList.add("talk");
      if(mouth){ _pronLip=beeLipSync(a,mouth); if(!_pronLip)mouth.classList.add("talking"); } },{once:true});
    a.onended=function(){ if(bee)bee.classList.remove("talk"); if(mouth)mouth.classList.remove("talking"); _pronLipStop(); };
    a.onerror=function(){ if(myReq===_ttsReq)_pronWeb(text,lang,slow,mouth,bee); };
    var p=a.play(); if(p&&p.catch)p.catch(function(){ if(myReq===_ttsReq)_pronWeb(text,lang,slow,mouth,bee); }); return;
  }catch(e){} }
  _pronWeb(text,lang,slow,mouth,bee); }
function _pronWeb(text,lang,slow,mouth,bee){ if(!S.sound||!text)return; try{ var u=new SpeechSynthesisUtterance(text); u.lang=lang; u.rate=slow?0.55:0.9; u.volume=1;
  var base=lang.split("-")[0],vs=speechSynthesis.getVoices().filter(function(v){return v.lang&&v.lang.indexOf(base)===0;});
  var best=vs.filter(function(v){return v.localService;})[0]||vs[0]; if(best)u.voice=best;
  /* pas de flux audio à analyser en local → flap CSS de la bouche entre le début et la fin réels */
  u.onstart=function(){ if(bee)bee.classList.add("talk"); if(mouth)mouth.classList.add("talking"); };
  u.onend=function(){ if(bee)bee.classList.remove("talk"); if(mouth)mouth.classList.remove("talking"); };
  _wsSpeak(u); }catch(e){} }
var PRON=null;
function pronPool(){ var all=allWords(S.course),seen=S.words[S.course]||{};
  var learned=all.filter(function(w){ return seen[srsKey(w)]; });
  var base=learned.length>=8?learned:all;
  /* évite les doublons de forme cible + garde des mots « prononçables » (2+ lettres) */
  var uniq=[],mk={}; shuffle(base).forEach(function(w){ var k=norm(w.t); if(w.t&&w.t.length>=2&&!mk[k]){ mk[k]=1; uniq.push(w); } });
  return uniq.slice(0,8); }
function pronStart(){ if(!S.course)return; blitzAbort(); pairsAbort();
  var list=pronPool(); if(!list.length){ toast("Fais d'abord une leçon 🐝"); return; }
  PRON={list:list,i:0,done:0,scoreSum:0,micTried:false,over:false,res:null,listening:false};
  VIEW="pron"; _armHistoryGuard(); window.scrollTo(0,0); render();
  setTimeout(function(){ pronSay(list[0].t,false); },350); }
function pronMic(){ if(!PRON||PRON.listening)return; var w=PRON.list[PRON.i]; if(!w)return;
  if(!_srOk()){ toast("Micro non dispo ici — écoute et répète, puis auto-évalue 🙂"); return; }
  PRON.listening=true; PRON.micTried=true; render();
  dictate(function(txt){ PRON.listening=false;
    var sc=pronScore(w.t,txt); PRON.res={heard:txt||"",score:sc,self:false};
    if(sc>=80){ tone([880,1180],.25); vibrate(12); } else { tone([420,320],.28); vibrate(24); }
    render();
  }, COURSES[S.course].ttsLang); }
function pronSelf(v){ if(!PRON)return; var map={ko:45,mid:72,ok:92}; PRON.res={heard:null,score:map[v]||70,self:true}; render(); }
function pronNext(){ if(!PRON)return; var r=PRON.res||{score:0,self:true};
  PRON.scoreSum+=r.score; PRON.done++;
  S.today.pron=(S.today.pron||0)+1; if(r.score>=80){ S.today.pronGood=(S.today.pronGood||0)+1; S.pronGoodTotal=(S.pronGoodTotal||0)+1; }
  PRON.res=null; PRON.micTried=false;
  if(PRON.i<PRON.list.length-1){ PRON.i++; render(); setTimeout(function(){ pronSay(PRON.list[PRON.i].t,false); },300); }
  else pronEnd(); }
function pronEnd(){ if(!PRON||PRON.over)return; PRON.over=true;
  var avg=PRON.done?Math.round(PRON.scoreSum/PRON.done):0; PRON.avg=avg;
  var xp=Math.max(4,Math.min(28,Math.round(avg/4)+PRON.done)); PRON.xp=xp;
  S.xp+=xp; S.dailyXP+=xp; S.today.xp=(S.today.xp||0)+xp; histAdd(xp);
  bumpStreak(); leagueAdd(xp); save(); checkAchv(); checkQuests(); render();
  setTimeout(function(){ speakLang(avg>=80?("Superbe prononciation ! Moyenne "+avg+" pour cent !"):("Bel entraînement ! On progresse, moyenne "+avg+" pour cent."),"fr-FR",BEE_VOICE,true); },350); }
function pronAbort(){ PRON=null; }
function vPron(){ var d=el("div","screen pron"); if(!PRON){ VIEW="home"; return vHome(); }
  var c=COURSES[S.course];
  if(PRON.over){
    d.innerHTML='<div class="bz-done"><div class="mascot-mini big">'+MASCOT(PRON.avg>=80?"party":"wave",110)+'</div>'
      +'<h2>🎤 Atelier terminé !</h2>'
      +'<div class="reward-grid"><div class="rw"><span>🎯</span><b>'+PRON.avg+'%</b><i>moyenne</i></div><div class="rw"><span>🗣️</span><b>'+PRON.done+'</b><i>mots</i></div><div class="rw"><span>⭐</span><b>+'+PRON.xp+'</b><i>XP</i></div></div></div>';
    var again=el("button","btn-main"); again.textContent="🎤 Recommencer"; again.onclick=function(){ pronStart(); }; d.appendChild(again);
    var back=el("button","btn-ghost"); back.textContent="← Accueil"; back.onclick=function(){ go("home"); }; d.appendChild(back);
    return d; }
  var w=PRON.list[PRON.i];
  var head=el("div","bz-head");
  head.innerHTML='<button class="bz-quit" aria-label="Quitter">✕</button><span class="pr-time">🎤 <b>'+(PRON.i+1)+'</b>/'+PRON.list.length+'</span><span class="bz-score">'+c.drapeau+'</span>';
  head.querySelector(".bz-quit").onclick=function(){ go("home"); }; d.appendChild(head);
  var bar=el("div","bz-bar"); bar.innerHTML='<div class="bz-bar-fill" style="width:'+Math.round(PRON.i/PRON.list.length*100)+'%"></div>'; d.appendChild(bar);
  // 🐝 Bee en GROS PLAN : elle DIT le mot, sa bouche s'anime sur le son réel → regarde et imite
  var stage=el("div","pron-stage");
  stage.innerHTML='<div class="pron-bee bee-rig">'+beeRigHTML()+'<div class="disc-mouth"></div></div><div class="pron-watch">👀 Regarde sa bouche, puis imite</div>';
  d.appendChild(stage);
  // mot + syllabes + audio
  var card=el("div","pron-card");
  card.innerHTML='<div class="pron-fr">'+esc(w.fr)+'</div>'
    +'<div class="pron-word">'+esc(w.t)+'</div>'
    +'<div class="pron-syl">'+esc(pronSyllables(w.t))+'</div>'
    +'<div class="pron-audio"><button class="pron-play" id="pnNorm">🔊 Écouter</button><button class="pron-play slow" id="pnSlow">🐢 Lent</button></div>';
  d.appendChild(card);
  // astuces d'élocution
  var tips=pronTips(w.t,c.id); var tw=el("div","pron-tips"); tw.innerHTML='<div class="pt-h">💡 Astuce d\'élocution</div>';
  tips.forEach(function(t){ var r=el("div","pt-row"); r.innerHTML='<b>'+esc(t.son)+'</b> — '+esc(t.tip); tw.appendChild(r); });
  d.appendChild(tw);
  // zone micro / résultat
  var zone=el("div","pron-zone");
  if(PRON.res){
    var sc=PRON.res.score, lvl=sc>=85?"good":(sc>=60?"mid":"bad");
    // Correction TRÈS détaillée : syllabe fautive repérée + astuces son (👄 placement) + marche à suivre
    var syl=esc(pronSyllables(w.t));
    var tipHtml=tips.slice(0,2).map(function(t){ return '<div class="pr-tip">👄 <b>'+esc(t.son)+'</b> — '+esc(t.tip)+'</div>'; }).join("");
    var msg;
    if(PRON.res.self){
      msg='<b>Auto-évaluation enregistrée 👍</b><br>Réécoute en <b>🐢 lent</b>, <b>regarde la bouche de Bee</b> et imite-la, syllabe par syllabe : <b>'+syl+'</b>.'+tipHtml;
    } else if(!PRON.res.heard){
      msg='<b>Je n\'ai pas bien entendu.</b><br>Rapproche le micro et parle plus fort. Réécoute (<b>🐢</b>), regarde la bouche de Bee, puis répète : <b>'+syl+'</b>.';
    } else if(sc>=85){
      msg='<b>Excellent, on t\'a parfaitement compris ! 🌟</b><br>Repère utile pour garder le rythme : <b>'+syl+'</b>.'+(tipHtml?'<br><span class="pr-note">Pour aller plus loin :</span>'+tipHtml:'');
    } else {
      var df=pronDiffSyl(w.t,PRON.res.heard);
      var pinpoint=(df&&df.syl)?('Le décalage commence vers la syllabe <b>« '+esc(df.syl)+' »</b>. ') : '';
      if(sc>=60){
        msg='<b>Presque ! 🙂</b> On a entendu « <i>'+esc(PRON.res.heard)+'</i> » au lieu de « <b>'+esc(w.t)+'</b> ».<br>'+pinpoint+'Redis-le lentement, syllabe par syllabe : <b>'+syl+'</b>.'+tipHtml;
      } else {
        msg='<b>On a entendu « <i>'+esc(PRON.res.heard)+'</i> »</b>, encore loin de « <b>'+esc(w.t)+'</b> ».<br>'+pinpoint
          +'<div class="pr-steps"><b>Comment corriger :</b><br>1️⃣ Appuie sur <b>🐢 Lent</b> et écoute bien.<br>2️⃣ <b>Regarde la bouche de Bee</b> et copie sa forme.<br>3️⃣ Dis chaque syllabe séparément — <b>'+syl+'</b> — puis enchaîne.</div>'+tipHtml;
      }
    }
    var rb=el("div","pron-result "+lvl);
    rb.innerHTML='<div class="pr-score"><b>'+sc+'%</b><span>'+(sc>=85?"🌟 nickel":sc>=60?"🙂 presque":"💪 on retravaille")+'</span></div><div class="pr-msg">'+msg+'</div>';
    zone.appendChild(rb);
    var nx=el("button","btn-main"); nx.textContent=(PRON.i<PRON.list.length-1?"Mot suivant →":"Terminer 🎉"); nx.onclick=pronNext; zone.appendChild(nx);
    var retry=el("button","btn-ghost"); retry.textContent="🔁 Réessayer ce mot"; retry.onclick=function(){ PRON.res=null; render(); }; zone.appendChild(retry);
  } else if(PRON.listening){
    zone.innerHTML='<div class="pron-listen">🎙️ …je t\'écoute, répète le mot</div>';
  } else {
    if(_srOk()){ var mic=el("button","mic-btn big"); mic.innerHTML="🎤 Répète le mot"; mic.onclick=pronMic; zone.appendChild(mic); }
    else {
      var hint=el("div","pron-nomic"); hint.innerHTML='🎤 Le micro n\'est pas disponible ici. Écoute (🔊 / 🐢), répète à voix haute, puis dis comment c\'était :'; zone.appendChild(hint);
      var sr=el("div","pron-self");
      [["ko","😕 à retravailler"],["mid","🙂 ça allait"],["ok","😄 nickel"]].forEach(function(p){ var b=el("button","self-btn "+p[0]); b.textContent=p[1]; b.onclick=function(){ pronSelf(p[0]); }; sr.appendChild(b); });
      zone.appendChild(sr);
    }
    var skip=el("button","btn-ghost skip"); skip.textContent="Passer ce mot"; skip.onclick=function(){ PRON.res={heard:null,score:0,self:true,skipped:true}; pronNext(); }; zone.appendChild(skip);
  }
  d.appendChild(zone);
  setTimeout(function(){ var n=document.getElementById("pnNorm"),s=document.getElementById("pnSlow");
    if(n)n.onclick=function(){ pronSay(w.t,false); }; if(s)s.onclick=function(){ pronSay(w.t,true); }; },0);
  return d;
}

/* ---------- Profil ---------- */
function vProfile(){ var d=el("div","screen"); var me=accMeta(ACC)||{name:"Toi",avatar:"🦊"};
  var totL=0,done=0; if(S.course){ COURSES[S.course].units.forEach(function(u,ui){u.lessons.forEach(function(_,li){totL++; if(unitDone(ui,li)>0)done++;});}); }
  d.innerHTML='<div class="profile-head"><div class="pav">'+me.avatar+'</div><h2 class="pname">'+esc(me.name)+'</h2></div>'+
    '<div class="stat-grid"><div class="sg"><span>🔥</span><b>'+S.streak+'</b><i>Série</i></div><div class="sg"><span>⭐</span><b>'+S.xp+'</b><i>XP total</i></div><div class="sg"><span>💎</span><b>'+S.gems+'</b><i>Gemmes</i></div><div class="sg"><span>📚</span><b>'+wordCount()+'</b><i>Mots appris</i></div></div>';
  // succès
  var ac=el("div","achv-wrap"); ac.innerHTML='<div class="sec-h">🏅 Succès ('+Object.keys(S.achv).length+'/'+ACHV.length+')</div>'; var ag=el("div","achv-grid");
  ACHV.forEach(function(a){ var got=S.achv[a.id]; var b=el("div","achv"+(got?" got":"")); b.innerHTML='<span class="ai">'+a.i+'</span><span class="at">'+a.t+'</span>'; b.title=a.d; ag.appendChild(b); });
  ac.appendChild(ag); d.appendChild(ac);
  // (Une seule voix pour tout — voir la section « 🔊 Voix » plus bas. Fini les 2 réglages qui se contredisaient.)
  // mémoire en ligne
  var cloud=el("div","freeze-card");
  if(me.code){ cloud.innerHTML='<div><b>☁️ Mémoire en ligne active</b><span> — ta progression est sauvegardée. Retrouve-la partout avec ton prénom + ton code.</span></div><div class="fx">'+(_cloudState==="off"?"⚠️":"✓")+'</div>'; }
  else { cloud.innerHTML='<div><b>☁️ Mémoire en ligne</b><span> — inactive (progression seulement sur cet appareil).</span></div>'; var eb=el("button","btn-buy"); eb.textContent="Activer"; eb.onclick=openEnableCloud; cloud.appendChild(eb); }
  d.appendChild(cloud);
  // gel de série
  var freeze=el("div","freeze-card"); freeze.innerHTML='<div><b>🧊 Gel de série</b><span> — protège 1 jour manqué</span></div><div class="fx">x'+S.freeze+'</div>';
  var fb=el("button","btn-buy"); fb.textContent="Acheter (200 💎)"; fb.onclick=function(){ if(S.gems>=200){ S.gems-=200; S.freeze++; save(); toast("🧊 Gel ajouté !"); render(); } else toast("Pas assez de gemmes 💎"); };
  freeze.appendChild(fb); d.appendChild(freeze);
  // voix (large choix, testables)
  var vc=el("div","voice-card");
  vc.innerHTML='<div class="sec-h">🔊 Voix</div><p class="mini">Choisis ta voix. Touche ▶ pour l\'écouter. Les voix « HD » sont naturelles (en ligne) ; « téléphone » marche hors-ligne.</p>';
  var sampleWord = S.course ? ((allWords(S.course)[0]||{}).t||"bonjour") : "bonjour";
  VOICES.forEach(function(v){ var row=el("div","voice-row"+(S.voice===v.id?" sel":""));
    var lab=el("span","vn"); lab.innerHTML=esc(v.name)+(v.cloud?' <i class="vbadge">HD</i>':''); row.appendChild(lab);
    var test=el("button","vtest"); test.textContent="▶"; test.title="Écouter"; test.onclick=function(ev){ ev.stopPropagation(); var prev=S.voice; S.voice=v.id; speak(sampleWord); S.voice=prev; };
    var pick=el("button","vpick"+(S.voice===v.id?" on":"")); pick.textContent=S.voice===v.id?"✓ Choisie":"Choisir"; pick.onclick=function(){ S.voice=v.id; save(); toast("Voix : "+v.name); render(); };
    row.appendChild(test); row.appendChild(pick); vc.appendChild(row); });
  d.appendChild(vc);
  // réglages
  var st=el("div","settings");
  st.innerHTML='<label class="row"><span>🔊 Son & voix</span><input type="checkbox" id="setSound" '+(S.sound?"checked":"")+'></label>'+
    '<label class="row"><span>🎯 Objectif quotidien</span><select id="setGoal">'+[10,20,30,50].map(function(g){return '<option value="'+g+'"'+(S.goal===g?" selected":"")+'>'+g+' XP</option>';}).join("")+'</select></label>';
  var sw=el("button","row switch"); sw.innerHTML='<span>👥 Changer de compte</span><span>›</span>'; sw.onclick=function(){ PICK=true; render(); }; st.appendChild(sw);
  var rs=el("button","row danger"); rs.textContent="♻️ Réinitialiser ce compte"; rs.onclick=function(){ if(confirm("Effacer TOUTE la progression de ce compte ?")){ ["hearts","gems","xp","streak","lastDay","freeze","dailyXP","prog","srs","league","achv","words","today","qClaim","course"].forEach(function(k){ localStorage.removeItem(pfx()+k); }); loadS(); VIEW="home"; render(); } }; st.appendChild(rs);
  d.appendChild(st);
  var ver=el("div","ver"); ver.textContent="KDMC Lingua "+APP_VER+" · app originale"; d.appendChild(ver);
  setTimeout(function(){ var s=d.querySelector("#setSound"); if(s)s.onchange=function(){S.sound=this.checked;save();}; var g=d.querySelector("#setGoal"); if(g)g.onchange=function(){S.goal=parseInt(this.value,10);save();toast("Objectif : "+S.goal+" XP/jour");}; },0);
  return d;
}

/* ---------- Tabbar ---------- */
/* ============ Coach IA (conversation interactive, mémoire PAR COMPTE) ============ */
var _coachThinking=false,_coachPose="wave";
function coachLangMeta(){ return S.course?COURSES[S.course]:null; }
/* Modale honnête : l'échelle CECRL réelle + où se situe VRAIMENT « bilingue ». */
function cefrModal(){ var m=modal(); var lv=currentLevel();
  var uniq={}; if(S.course&&COURSES[S.course]) allWords(S.course).forEach(function(w){ uniq[w.fr]=1; });
  var total=Object.keys(uniq).length; /* mots UNIQUES du programme (honnête, sans doublons entre unités) */
  var ladder=LEVELS.map(function(s){ var on=s.code===lv.cur.code;
    return '<div style="display:flex;justify-content:space-between;gap:10px;padding:7px 11px;border-radius:10px;margin:3px 0;'+(on?'background:#2c230c;border:1px solid #ffd75e;color:#ffe9a8;font-weight:800':'background:var(--card2);color:#cfe0ee')+'"><b>'+esc(s.code)+'</b><span style="opacity:.85">'+(s.min===0?'départ':'~'+s.min+' mots')+'</span></div>'; }).join('');
  m.body.innerHTML='<h3>🎓 Ton vrai niveau</h3>'+
    '<p class="mini">Tu es <b>'+esc(lv.cur.code)+'</b> avec <b>'+lv.words+' mots</b> maîtrisés.'+(lv.next?(' Encore <b>'+lv.remain+' mots</b> pour <b>'+esc(lv.next.code)+'</b>.'):' Bravo, tu as tout parcouru ! 🎉')+'</p>'+
    '<div style="margin:10px 0">'+ladder+'</div>'+
    '<p class="mini">Être vraiment <b>bilingue</b> (C1-C2), c\'est <b>plusieurs milliers de mots</b> et de la pratique sur des <b>années</b> — un marathon, pas un sprint. Lingua te bâtit des <b>bases solides</b> : le programme actuel ('+total+' mots) t\'emmène vers <b>~'+esc((function(){ var r=LEVELS[0]; LEVELS.forEach(function(s){ if(total>=s.min) r=s; }); return r.code; })())+'</b>, et il s\'enrichit régulièrement. Chaque mot compte, continue ! 🐝</p>'+
    '<button class="btn-main" style="margin-top:8px" onclick="this.closest(\'.overlay\').classList.remove(\'show\');var o=this.closest(\'.overlay\');setTimeout(function(){o.remove();},250);">OK 👍</button>';
}
/* Bee réagit selon ce qu'il dit : félicite → fête, question → curieux, salut → coucou. */
function coachPoseFor(t){ t=(" "+String(t||"")+" ").toLowerCase();
  if(/(bravo|super|parfait|excellent|g[eé]nial|tr[eè]s bien|bien jou|f[eé]licit|complimenti|bravissim|muy bien|perfecto|sehr gut|toll|[oó]timo|muito bem|goed zo|knap)/.test(t)) return "party";
  if(/\?/.test(t)) return "point";
  if(/(bonjour|salut|coucou|\bciao\b|buongiorno|\bhola\b|buenos|\bhallo\b|guten tag|\bol[aá]\b|bom dia|\bhi\b|hello|goededag)/.test(t)) return "wave";
  return "point";
}
/* Bee VIVANTE : elle flotte, et quand on la touche → pirouette/saut + étincelles + petit mot gentil. */
function beeSparkles(el,n){ try{ var r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,em=["✨","⭐","💛","🐝","❤️","🌟"];
  for(var i=0;i<(n||8);i++){ var s=document.createElement("span"); s.className="bee-spark"; s.textContent=em[Math.floor(Math.random()*em.length)];
    var a=Math.random()*Math.PI*2,d=40+Math.random()*55;
    s.style.left=cx+"px"; s.style.top=cy+"px"; s.style.setProperty("--dx",(Math.cos(a)*d)+"px"); s.style.setProperty("--dy",(Math.sin(a)*d-24)+"px");
    document.body.appendChild(s); (function(sp){ setTimeout(function(){ sp.remove(); },950); })(s); } }catch(_){} }
function beeAnimate(el,cls){ try{ el.classList.remove("pop","spin","hop","shake"); void el.offsetWidth; el.classList.add(cls); setTimeout(function(){ el.classList.remove(cls); },850); }catch(_){} }
function beeCheer(){ try{ var c=S.course?COURSES[S.course]:null; if(!c)return; var words=["bravo","merci","bonjour","salut","oui"];
  var fr=words[Math.floor(Math.random()*words.length)]; var t=(DICT[fr]&&DICT[fr][c.id])||fr; speakLang(t,c.ttsLang,BEE_VOICE,true); }catch(_){} }
document.addEventListener("click",function(e){ var el=e.target&&e.target.closest?e.target.closest(".bee-img"):null; if(!el)return;
  beeAnimate(el, Math.random()<0.5?"spin":"hop"); beeSparkles(el,8); vibrate(12); tone([760,980],.22); beeCheer(); });
/* Bee GÈRE TOUT : compagnon présent sur chaque écran, consciente de l'état de l'app
   (révisions dues, série, ligue, niveau) — elle commente, guide, et parle si on la touche. */
var _beeSaid={};
function beeLine(){ try{
  if(VIEW==="home"){ var nx=nextLessonToDo(),due=dueWords().length;
    var s="Bzzz ! "+(nx?("On fait « "+nx.titre+" » ?"):"Tout est ouvert, champion !");
    if(due>0)s+=" Et "+due+" mot"+(due>1?"s":"")+" à réviser 🧠"; if(S.streak>0)s+=" · série 🔥"+S.streak; return s; }
  if(VIEW==="review"){ var d2=dueWords().length; return d2>0?("J'ai "+d2+" mot"+(d2>1?"s":"")+" à te faire réviser — on s'y met ?"):"Rien d'urgent ! Une révision libre pour le plaisir ?"; }
  if(VIEW==="dict") return "Cherche un mot, je te dis tout ce que je sais !";
  if(VIEW==="stories"){ var sdn=storiesDoneCount(); return sdn>=STORIES.length?"Tu as lu TOUTES mes histoires ! Réécoute ta préférée 🍯":"Viens, je te raconte une histoire de la ruche 📖"; }
  if(VIEW==="translate") return "Dis-moi un mot ou une phrase, je te la traduis dans mes 6 langues !";
  if(VIEW==="league"){ var rows=leagueRows(),p=0; for(var i=0;i<rows.length;i++){ if(rows[i].you){p=i+1;break;} }
    return p===1?"Tu es PREMIER ! 🏆 On garde la couronne ?":("Tu es "+p+"ᵉ ! Quelques leçons et on double tout le monde 😼"); }
  if(VIEW==="profile") return "Niveau "+diffLabel()+" · "+masteredCount()+" mots appris. Je suis fière de toi !";
  return "Bzzz ! On apprend quelque chose ?"; }catch(_){ return "Bzzz !"; } }
function beeBubble(text,ms){ try{ var old=document.querySelector(".bee-bubble"); if(old)old.remove();
  var b=document.createElement("div"); b.className="bee-bubble"; b.textContent=text;
  b.onclick=function(){ b.remove(); }; document.body.appendChild(b);
  setTimeout(function(){ try{ b.classList.add("bye"); setTimeout(function(){b.remove();},400); }catch(_){} }, ms||6000); }catch(_){} }
/* Marionnette réutilisable : les couches animées découpées de SON image (ailes+bras+paupières) */
function beeRigHTML(){ return '<img class="rig-base" src="bee/rig/base.webp" alt="Bee">'+
  '<img class="rig-piece rig-wl" src="bee/rig/wing-l.webp" alt="" onerror="this.remove()">'+
  '<img class="rig-piece rig-wr" src="bee/rig/wing-r.webp" alt="" onerror="this.remove()">'+
  '<img class="rig-piece rig-arm" src="bee/rig/arm.webp" alt="" onerror="this.remove()">'+
  '<div class="rig-lid ll"></div><div class="rig-lid lr"></div>'; }
function beeMove(rig,kind,dur){ if(!rig)return; ["mv-dance","mv-jump","mv-fly","mv-walk"].forEach(function(c){rig.classList.remove(c);});
  if(!kind)return; rig.classList.add("mv-"+kind);
  setTimeout(function(){ try{rig.classList.remove("mv-"+kind);}catch(_){} }, dur||2400); }
/* Elle VIT en permanence : clignements + micro-mouvements aléatoires, s'arrête seule si l'élément disparaît */
function beeLifeStart(rig){
  (function blink(){ if(!document.contains(rig))return;
    rig.classList.add("blink"); setTimeout(function(){ try{rig.classList.remove("blink");}catch(_){} },150);
    setTimeout(blink, 2400+Math.random()*3400); })();
  (function idle(){ if(!document.contains(rig))return;
    var ks=["fly","walk","dance"]; beeMove(rig, ks[Math.floor(Math.random()*ks.length)], 2200+Math.random()*1400);
    setTimeout(idle, 11000+Math.random()*9000); })(); }
/* Bee PREND LA PAROLE : bulle + VOIX (sans les emojis dans l'audio) */
function beeSay(text,ms){ beeBubble(text,ms||7000);
  speakLang(String(text).replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}·]/gu," "),"fr-FR",BEE_VOICE,true); }
/* Bee INTERAGIT vraiment : elle propose, tu acceptes d'un tap, elle LANCE l'action */
function beeAsk(text,yes,fn,ms){ try{ var old=document.querySelector(".bee-bubble"); if(old)old.remove();
  var b=el("div","bee-bubble"); b.textContent=text;
  var act=el("div","bb-act"); var y=el("button","bb-yes"); y.textContent=yes;
  y.onclick=function(ev){ ev.stopPropagation(); b.remove(); vibrate(12); fn(); };
  act.appendChild(y); b.appendChild(act);
  b.onclick=function(){ b.remove(); };
  document.body.appendChild(b);
  speakLang(String(text).replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}·]/gu," "),"fr-FR",BEE_VOICE,true);
  setTimeout(function(){ try{ b.classList.add("bye"); setTimeout(function(){b.remove();},400); }catch(_){} }, ms||14000); }catch(_){} }
function beeCompanion(){ var w=el("div","bee-companion");
  var rig=el("div","bee-live bee-rig"); rig.innerHTML=beeRigHTML(); w.appendChild(rig);
  setTimeout(function(){ beeLifeStart(rig); }, 900+Math.random()*600);
  w.onclick=function(ev){ ev.stopPropagation();
    beeMove(rig, ["dance","jump","fly","walk"][Math.floor(Math.random()*4)], 2600); beeSparkles(rig,7); vibrate(10);
    beeSay(beeLine(),7000); };
  if(!_beeSaid[VIEW]){ _beeSaid[VIEW]=true; setTimeout(function(){
    /* 1re arrivée sur l'accueil : elle t'accueille par ton prénom ET te propose l'étape suivante — un tap et elle la lance */
    if(VIEW==="home"&&!window._beeHello){ window._beeHello=true;
      var me=accMeta(ACC)||{}; var hi="Bonjour "+(me.name||"toi")+" ! ";
      var nx=nextLessonToDo(), due=dueWords().length;
      if(nx) beeAsk(hi+"On fait la leçon « "+nx.titre+" » ?","🚀 C'est parti !",function(){ startLesson(nx.ui,nx.li); });
      else if(due>0) beeAsk(hi+due+" mot"+(due>1?"s":"")+" à réviser — on s'y met ?","🧠 Réviser",function(){ startLesson(null,null,dueWords().slice(0,10)); });
      else beeSay(hi+beeLine());
    } else beeSay(beeLine());
  },600); }
  return w; }
/* Bee PARLE vraiment (voix langue cible) + s'anime pendant qu'il parle (mise en scène). */
function coachSpeak(text){ var c=coachLangMeta(); if(!c||!text) return; speakLang(text,c.ttsLang,BEE_VOICE,true);
  var m=document.querySelector(".coach-mascot"); if(m){ m.classList.add("talking"); var dur=Math.min(6500, 900+String(text).length*65); setTimeout(function(){ try{m.classList.remove("talking");}catch(_){}}, dur); } }
function coachGreeting(c){ var me=accMeta(ACC)||{}; var n=me.name||"toi"; var hi=(DICT["salut"]&&DICT["salut"][c.id])||"Salut";
  return hi+" "+n+" ! 🐝 Moi c'est Bee, ton amie coach de "+c.nom.toLowerCase()+". On peut discuter de TOUT ce que tu veux — ton week-end, un film, ton travail, un voyage, une idée… Je te suis, je te réponds pour de vrai et je te corrige en douceur. De quoi as-tu envie de parler ?"; }
function coachSuggestions(c){ var hello=(DICT["comment ça va"]&&DICT["comment ça va"][c.id])||"Bonjour";
  return ["Parle-moi de ta journée 🌤️", "J'ai vu un film hier 🎬", "Raconte-moi une blague 😄", hello, "Apprends-moi 3 mots utiles", "Corrige ma phrase (j'écris ensuite)"]; }
function coachOffline(){ return "Je ne peux pas discuter à l'instant (coach momentanément indisponible). En attendant, fais une leçon 🧠 — je garde en mémoire où tu en es et on reprend juste après !"; }
/* ============ 🎭 JEUX DE RÔLE (scènes 100% originales, thème ruche) ============
   Comme un vrai cours de conversation : Bee JOUE un personnage (serveur, recruteur, ami…)
   et l'apprenant vit la scène dans la langue cible. Le scénario part au /ai (champ scenario). */
var SCENES=[
  {id:"cafe",     ic:"☕", nom:"Au café",             desc:"Commander boisson et en-cas",   sc:"une scène dans un café : tu es le serveur ou la serveuse, l'apprenant est le client qui commande une boisson et un en-cas, demande le prix et paie"},
  {id:"entretien",ic:"💼", nom:"Entretien d'embauche",desc:"Se présenter à un recruteur",    sc:"un entretien d'embauche : tu es le recruteur bienveillant, l'apprenant est le candidat — il se présente, parle de ses qualités et répond à tes questions simples"},
  {id:"musique",  ic:"🎵", nom:"Parler musique",      desc:"Chansons et artistes préférés", sc:"une discussion entre amis passionnés de musique : tu es l'ami, vous parlez de vos chansons, artistes et concerts préférés"},
  {id:"resto",    ic:"🍝", nom:"Au restaurant",       desc:"Réserver et commander",         sc:"une scène au restaurant : tu es le serveur, l'apprenant réserve une table puis commande un repas complet et demande l'addition"},
  {id:"marche",   ic:"🛒", nom:"Au marché",           desc:"Acheter fruits et légumes",     sc:"une scène au marché : tu es le marchand, l'apprenant achète des fruits et légumes, demande les prix et négocie gentiment"},
  {id:"voyage",   ic:"✈️", nom:"À l'aéroport",        desc:"S'enregistrer, se repérer",     sc:"une scène à l'aéroport : tu es l'agent d'accueil, l'apprenant s'enregistre pour son vol, pose ses questions et demande son chemin"},
  {id:"hotel",    ic:"🏨", nom:"À l'hôtel",           desc:"Réserver une chambre",          sc:"une scène à la réception d'un hôtel : tu es le réceptionniste, l'apprenant réserve une chambre, demande les horaires et les services"},
  {id:"medecin",  ic:"🩺", nom:"Chez le médecin",     desc:"Dire ce qui ne va pas",         sc:"une consultation chez le médecin : tu es le médecin rassurant, l'apprenant explique simplement ce qui ne va pas et répond à tes questions"},
  {id:"lecture",  ic:"📖", nom:"Lire et raconter",    desc:"Bee raconte, tu racontes",      sc:"un jeu de lecture : tu racontes une toute petite histoire originale (3 phrases maximum, adaptée au niveau), puis tu poses des questions simples sur l'histoire et l'apprenant la raconte avec ses mots"}
];
function sceneById(id){ for(var i=0;i<SCENES.length;i++){ if(SCENES[i].id===id)return SCENES[i]; } return null; }
function coachSceneMeta(){ return S.coachScene?sceneById(S.coachScene):null; }
/* Messages envoyés à l'IA : en scène, seulement ceux DEPUIS le début de la scène (pas l'ancien fil) */
function coachPayloadMsgs(){ var msgs=S.coachMsgs;
  if(S.coachScene){ for(var i=msgs.length-1;i>=0;i--){ if(msgs[i].role==="sys"){ msgs=msgs.slice(i+1); break; } } }
  return msgs.filter(function(m){ return m.role==="user"||m.role==="bot"; }).slice(-12)
    .map(function(m){ return {role:m.role,text:String(m.text||"").slice(0,500)}; }); }
function coachSysPush(text){ S.coachMsgs.push({role:"sys",text:text}); if(S.coachMsgs.length>60)S.coachMsgs=S.coachMsgs.slice(-60); save(); }
function sceneStart(id){ var sn=sceneById(id); if(!sn||_coachThinking)return; var c=coachLangMeta(); if(!c)return;
  S.coachScene=id; coachSysPush("🎭 "+sn.ic+" "+sn.nom+" — la scène commence !");
  vibrate(12); _coachThinking=true; render();
  coachAsk().then(function(reply){ _coachThinking=false;
    if(reply){ S.coachMsgs.push({role:"bot",text:reply}); if(S.coachMsgs.length>60)S.coachMsgs=S.coachMsgs.slice(-60); _coachPose=coachPoseFor(reply); }
    save(); render(); setTimeout(function(){ if(reply)coachSpeak(reply); },260); }); }
function sceneStop(){ if(!S.coachScene)return; var sn=coachSceneMeta(); S.coachScene=null;
  coachSysPush("🎭 Fin de la scène"+(sn?(" "+sn.ic):"")+" — bien joué !"); render(); }
function coachAsk(){ var c=coachLangMeta();
  var payload={ lang:c.id, langName:c.nom, level:diffLabel(), levelIndex:diffTier(), words:masteredCount(),
    weak:dueWords().slice(0,15).map(function(w){ return w.fr+" = "+w.t; }),
    scenario:(coachSceneMeta()||{}).sc||"",
    messages:coachPayloadMsgs() };
  return fetch(SYNC_BASE+"/ai",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)})
    .then(function(r){ return r.json(); })
    .then(function(j){ return (j&&j.ok&&j.reply)?String(j.reply):coachOffline(); })
    .catch(function(){ return coachOffline(); }); }
function coachSend(text){ if(_coachThinking||!text) return; var c=coachLangMeta(); if(!c) return;
  S.coachMsgs.push({role:"user",text:text}); if(S.coachMsgs.length>60)S.coachMsgs=S.coachMsgs.slice(-60); save();
  _coachThinking=true; render();
  coachAsk().then(function(reply){ _coachThinking=false; if(reply){ S.coachMsgs.push({role:"bot",text:reply}); if(S.coachMsgs.length>60)S.coachMsgs=S.coachMsgs.slice(-60); _coachPose=coachPoseFor(reply); } save(); render();
    setTimeout(function(){ if(reply) coachSpeak(reply); },260); }); }
function vCoach(){ var d=el("div","screen coach");
  var c=coachLangMeta(); if(!c){ d.innerHTML='<h2 class="ttl">💬 Coach</h2><p class="sub2">Choisis d\'abord une langue 🌍 dans l\'onglet 🏠.</p>'; return d; }
  var head=el("div","coach-head"); head.innerHTML='<span class="coach-flag">'+c.drapeau+'</span><div class="coach-hd"><b>Coach '+esc(c.nom)+'</b><span>Niveau '+esc(diffLabel())+' · objectif bilingue</span></div>';
  var cine=el("button","coach-cine"); cine.innerHTML="🎬<span>Discussion</span>"; cine.title="Mode discussion plein écran"; cine.onclick=openDiscussion; head.appendChild(cine);
  d.appendChild(head);
  /* Progression HONNÊTE (CECRL réel), plus de faux « % vers le bilingue » à 240 mots. */
  var lv=currentLevel(); var pb=el("div","coach-prog"); pb.style.cursor="pointer"; pb.title="Voir le vrai chemin vers le bilingue";
  pb.innerHTML='<div class="bar"><div class="bar-fill" style="width:'+lv.pct+'%"></div></div><span>Niveau <b>'+esc(lv.cur.code)+'</b>'+(lv.next?(' · '+lv.pct+'% vers '+esc(lv.next.code)):' 🎉')+' · '+lv.words+' mots</span>';
  pb.onclick=cefrModal; d.appendChild(pb);
  /* 🎭 Jeux de rôle : scène active → bandeau + quitter ; sinon → carrousel de scènes à jouer */
  var snA=coachSceneMeta();
  if(snA){ var bn=el("div","scene-banner"); bn.innerHTML='<span class="sic">'+snA.ic+'</span><span>Scène : <b>'+esc(snA.nom)+'</b></span>';
    var qb=el("button","scene-quit"); qb.textContent="✖ Quitter"; qb.onclick=sceneStop; bn.appendChild(qb); d.appendChild(bn); }
  else { var sr=el("div","scene-row");
    SCENES.forEach(function(sn){ var b=el("button","scene-card"); b.innerHTML='<span class="sic">'+sn.ic+'</span><b>'+esc(sn.nom)+'</b><i>'+esc(sn.desc)+'</i>';
      b.onclick=function(){ sceneStart(sn.id); }; sr.appendChild(b); });
    d.appendChild(sr); }
  var mas=el("div","coach-mascot"); mas.innerHTML=MASCOT(_coachThinking?"read":(_coachPose||"wave"),100);
  var mimg=mas.querySelector(".bee-img"); if(mimg&&!S.coachMsgs.length)mimg.classList.add("pop");
  d.appendChild(mas);
  var box=el("div","coach-box");
  if(!S.coachMsgs.length){ var intro=el("div","coach-msg bot"); intro.innerHTML='<div class="cm-av">'+MASCOT("wave",38)+'</div>'; var it=el("div","cm-txt"); it.textContent=coachGreeting(c); intro.appendChild(it); box.appendChild(intro); }
  S.coachMsgs.slice(-40).forEach(function(m){
    if(m.role==="sys"){ var sysd=el("div","coach-sys"); sysd.textContent=m.text; box.appendChild(sysd); return; }
    var row=el("div","coach-msg "+(m.role==="user"?"user":"bot"));
    if(m.role!=="user") row.innerHTML='<div class="cm-av">'+MASCOT("point",38)+'</div>';
    var t=el("div","cm-txt"); t.textContent=m.text; row.appendChild(t);
    if(m.role!=="user"){ var say=el("button","cm-say"); say.textContent="🔊"; say.title="Écouter"; say.onclick=function(){ coachSpeak(m.text); }; row.appendChild(say); }
    box.appendChild(row); });
  if(_coachThinking){ var tp=el("div","coach-msg bot"); tp.innerHTML='<div class="cm-av">'+MASCOT("read",38)+'</div><div class="cm-txt typing">•  •  •</div>'; box.appendChild(tp); }
  d.appendChild(box);
  var chips=el("div","coach-chips"); coachSuggestions(c).forEach(function(s){ var b=el("button","coach-chip"); b.textContent=s; b.onclick=function(){ coachSend(s); }; chips.appendChild(b); }); d.appendChild(chips);
  var bar=el("div","coach-inbar"); var inp=el("input","coach-input"); inp.type="text"; inp.placeholder="Parle-moi de ce que tu veux…"; inp.setAttribute("autocomplete","off"); inp.setAttribute("autocapitalize","sentences");
  inp.onkeydown=function(e){ if(e.key==="Enter"&&inp.value.trim()){ coachSend(inp.value.trim()); } };
  var snd=el("button","coach-send"); snd.textContent="➤"; snd.title="Envoyer"; snd.onclick=function(){ if(inp.value.trim()) coachSend(inp.value.trim()); };
  bar.appendChild(inp); bar.appendChild(snd); d.appendChild(bar);
  setTimeout(function(){ var b=d.querySelector(".coach-box"); if(b)b.scrollTop=b.scrollHeight; },40);
  return d;
}
/* ============ MODE DISCUSSION 🎬 — Bee en gros plan, bouche animée, elle DIT son texte ============ */
var DISC={open:false,talking:false,handsFree:false,timer:null};
function discMove(kind,dur){ /* Bee bouge de tout son corps. VRAIE VIDÉO si dispo, sinon marionnette CSS. */
  if(DISC.vid&&DISC.clip&&kind){ DISC.clip(kind,(dur||2800)/1000); return; }
  var rig=document.querySelector(".disc-overlay .bee-rig"); if(!rig)return;
  ["mv-dance","mv-jump","mv-fly","mv-walk"].forEach(function(c){rig.classList.remove(c);});
  if(!kind)return; rig.classList.add("mv-"+kind);
  if(DISC.moveEnd)clearTimeout(DISC.moveEnd);
  DISC.moveEnd=setTimeout(function(){ try{rig.classList.remove("mv-"+kind);}catch(_){} }, dur||2800);
}
function discSpeak(text,lang){ /* parle + anime la bouche + sous-titres SYNCHRONISÉS SUR LE SON RÉEL.
  AVANT : bouche/sous-titres partaient dès la demande, mais la fabrication en ligne d'une phrase
  neuve prend 1-3 s → tout défilait AVANT la voix (le « décalage » persistant de Kevin).
  MAINTENANT : rien ne bouge tant que le son n'a pas réellement démarré (événement playing),
  les sous-titres suivent la POSITION RÉELLE de lecture, et tout s'arrête sur la fin réelle. */
  var overlay=document.querySelector(".disc-overlay"); if(!overlay)return;
  var mouth=overlay.querySelector(".disc-mouth"), sub=overlay.querySelector(".disc-sub"), img=overlay.querySelector(".disc-bee");
  var words=String(text||"").split(/\s+/).filter(Boolean);
  var vcfg={rate:1,gen:1,wsRate:.95,wsPitch:1}, vid=S.voice||"nova";  /* voix choisie, claire, sans déformation (lip-sync ok) */
  var netR=(vcfg.rate||1)*(vcfg.gen||1);
  var estDur=Math.min(12000, Math.round((900+text.length*68)/netR));
  var myReq=++_ttsReq; /* un ancien son/repli en retard est ignoré */
  DISC.talking=true; /* bloque un double-envoi pendant le chargement */
  if(sub)sub.textContent="…"; /* signe de vie pendant la fabrication de la voix */
  if(DISC.subIv){ clearInterval(DISC.subIv); DISC.subIv=null; }
  function stop(){ DISC.talking=false; if(DISC.subIv){clearInterval(DISC.subIv);DISC.subIv=null;}
    if(DISC.lip){ try{ DISC.lip(); }catch(_){} DISC.lip=null; }
    try{ if(mouth)mouth.classList.remove("talking"); if(img)img.classList.remove("talk"); }catch(_){}
    /* fin de phrase : on revient à la belle vidéo de Bee entre deux répliques */
    if(DISC.wasVid&&img){ try{ img.classList.add("vid"); if(DISC.clip)DISC.clip("idle",0); }catch(_){} DISC.wasVid=false; }
    if(sub&&words.length)sub.textContent=words.join(" "); /* texte complet lisible à la fin */
    /* TEMPS RÉEL : s'il reste des phrases de la réponse, on enchaîne TOUT DE SUITE la suivante
       (Bee a déjà commencé à parler/mimer sur la 1re phrase → plus d'attente de toute la tirade). */
    if(DISC._q&&DISC._q.length&&DISC.open&&myReq===_ttsReq){ var _nx=DISC._q.shift(); setTimeout(function(){ if(DISC.open)discSpeak(_nx,lang); },70); return; }
    if(DISC.handsFree&&DISC.open){ setTimeout(function(){ discListen(); },500); } }
  function startVisuals(dur,audio){ if(!DISC.open||myReq!==_ttsReq)return;
    /* PENDANT qu'elle parle : marionnette + bouche qui articule sur le SON RÉEL (comme Speak).
       La vidéo générique ne synchronise pas les lèvres → on la met de côté le temps de la réplique,
       et on la restaure entre deux phrases (stop()). */
    if(DISC.lip){ try{ DISC.lip(); }catch(_){} DISC.lip=null; }
    if(DISC.vid&&img&&img.classList.contains("vid")){ DISC.wasVid=true; img.classList.remove("vid"); }
    /* VOLUME CONSTANT : on ne route JAMAIS le son de Bee dans le moteur audio ici (ça changeait le
       niveau d'une phrase à l'autre sur iPhone — « des fois fort, des fois doucement »). Le son sort
       toujours par le même <audio> à volume fixe, et la bouche articule via le flap CSS (fiable). */
    if(mouth){ mouth.classList.add("talking"); }
    if(img)img.classList.add("talk");
    /* chorégraphie au moment où la voix DÉMARRE (plus en avance) */
    var praise=/(bravo|super|parfait|génial|excellent|top|complimenti|bravissim|muy bien|perfecto|sehr gut|[oó]timo|goed)/i.test(text);
    if(praise) discMove(Math.random()<.5?"dance":"jump", Math.min(dur,4200));
    else if(DISC.vid&&DISC.clip) DISC.clip("hello", Math.min(dur/1000,6));
    if(sub){ sub.textContent="";
      if(audio){ /* sous-titres calés sur la POSITION RÉELLE du son */
        var shown=0;
        DISC.subIv=setInterval(function(){ if(!DISC.open||myReq!==_ttsReq){clearInterval(DISC.subIv);DISC.subIv=null;return;}
          var d=audio.duration; if(!(d>0))return;
          var n=Math.max(shown, Math.min(words.length, Math.round((audio.currentTime/d)*words.length)));
          while(shown<n){ sub.textContent+=(shown?" ":"")+words[shown++]; }
          sub.scrollTop=sub.scrollHeight;
          if(audio.ended||shown>=words.length){ clearInterval(DISC.subIv); DISC.subIv=null; } },120);
      } else { var wi=0, step=Math.max(120, Math.min(300, dur/Math.max(1,words.length)));
        DISC.subIv=setInterval(function(){ if(wi>=words.length||!DISC.open||myReq!==_ttsReq){ clearInterval(DISC.subIv); DISC.subIv=null; return; }
          sub.textContent+=(wi?" ":"")+words[wi++]; sub.scrollTop=sub.scrollHeight; }, step); } }
    if(DISC.timer)clearTimeout(DISC.timer); DISC.timer=setTimeout(stop, dur+400); }
  try{ if(window.speechSynthesis)speechSynthesis.cancel(); }catch(_){}
  if(_isCloudVoice(vid)&&S.sound){ try{ if(_ttsAudio){try{_ttsAudio.pause();}catch(_){} }
    var a=new Audio(); a.src=SYNC_BASE+"/tts?v="+encodeURIComponent(vid)+(vcfg.gen?"&s="+vcfg.gen:"")+"&t="+encodeURIComponent(text); _ttsAudio=a; try{a.volume=1;}catch(_){}
    if(vcfg.rate!==1){ try{ a.preservesPitch=false; a.webkitPreservesPitch=false; a.playbackRate=vcfg.rate; }catch(_){} }
    var started=false, fell=false;
    var fallback=function(){ if(fell||started||myReq!==_ttsReq)return; fell=true;
      _webSpeakLang(text,lang,true,vcfg); startVisuals(estDur,null); };
    a.addEventListener("playing",function(){ if(started||fell)return; started=true;
      var real=(a.duration>0)?Math.round(a.duration/(vcfg.rate||1)*1000):estDur;
      startVisuals(real,a); });
    a.onended=function(){ if(DISC.timer)clearTimeout(DISC.timer); if(myReq===_ttsReq)stop(); };
    a.onerror=fallback;
    var p=a.play(); if(p&&p.catch)p.catch(fallback);
  }catch(e){ _webSpeakLang(text,lang,true,vcfg); startVisuals(estDur,null); } }
  else if(S.sound){ _webSpeakLang(text,lang,true,vcfg); startVisuals(estDur,null); }
  else { startVisuals(estDur,null); } /* son coupé : on montre quand même le texte */
}
/* Découpe une réponse en phrases courtes pour un rendu « live » : Bee dit la 1re tout de suite. */
function _discSentences(text){ var t=String(text||"").trim(); if(!t)return [];
  var parts=t.split(/(?<=[.!?…])\s+/).map(function(s){return s.trim();}).filter(Boolean);
  var out=[]; parts.forEach(function(s){ if(out.length && (s.length<14 || out[out.length-1].length<14)) out[out.length-1]+=" "+s; else out.push(s); });
  return out.length?out:[t]; }
/* Dit une réponse phrase par phrase : la 1re part immédiatement, les suivantes sont réchauffées
   d'avance (voix prête) → Bee mime dès la 1re phrase au lieu d'attendre toute la tirade. */
function discSay(text,lang){ var seq=_discSentences(text); DISC._q=seq.slice(1);
  try{ ttsPrefetchMany(seq.slice(1)); }catch(_){}   /* réchauffe la suite pendant qu'elle parle */
  discSpeak(seq[0],lang); }
/* Barge-in : couper Bee net (l'utilisateur reprend la parole quand il veut). */
function discStopSpeaking(){ DISC._q=[]; DISC.talking=false; _ttsReq++;   /* invalide le son/►en cours */
  try{ if(_ttsAudio){_ttsAudio.pause();} }catch(_){}
  try{ if(window.speechSynthesis)speechSynthesis.cancel(); }catch(_){}
  if(DISC.subIv){ try{clearInterval(DISC.subIv);}catch(_){} DISC.subIv=null; }
  if(DISC.timer){ try{clearTimeout(DISC.timer);}catch(_){} DISC.timer=null; }
  var ov=document.querySelector(".disc-overlay"); if(ov){ var m=ov.querySelector(".disc-mouth"),b=ov.querySelector(".disc-bee");
    try{ if(m)m.classList.remove("talking"); if(b)b.classList.remove("talk"); }catch(_){} } }
function discListen(){ var overlay=document.querySelector(".disc-overlay"); if(!overlay)return;
  discStopSpeaking();  /* si Bee parle, on la coupe et on écoute (vraie conversation) */
  var mic=overlay.querySelector(".disc-mic"); if(mic)mic.classList.add("rec");
  dictate(function(txt){ if(mic)mic.classList.remove("rec"); if(txt){ var inp=overlay.querySelector(".disc-input"); if(inp)inp.value=txt; discSend(); } },"fr-FR"); }
/* ===== 📞 APPEL EN DIRECT (voix-à-voix temps réel, OpenAI Realtime via WebRTC) =====
   Bee t'écoute EN CONTINU et te répond en parlant pendant qu'elle « réfléchit » ; tu peux la couper
   juste en parlant (détection de tour côté serveur). Sa bouche mime sur la voix live.
   FAIL-SAFE : la moindre panne (pas de jeton, micro refusé, WebRTC KO) → on raccroche proprement
   et la Discussion normale (tours de parole) reste 100% utilisable. */
function _discLiveBtn(){ var ov=document.querySelector(".disc-overlay"); return ov&&ov.querySelector(".disc-live"); }
function _discLiveUI(on){ var b=_discLiveBtn(); if(b){ b.classList.toggle("on",!!on); b.textContent=on?"⏹":"📞"; b.title=on?"Raccrocher":"Appel en direct"; }
  var ov=document.querySelector(".disc-overlay"); var sub=ov&&ov.querySelector(".disc-sub");
  if(on&&sub)sub.textContent="🔴 En direct — parle, Bee t'écoute…"; }
function discLiveToggle(){ if(DISC.live){ discLiveStop(); toast("Appel terminé"); } else { discLiveStart(); } }
function discLiveStart(){ if(DISC.live||DISC.liveConnecting)return; var c=coachLangMeta(); if(!c)return;
  if(!(navigator.mediaDevices&&window.RTCPeerConnection)){ toast("Ton navigateur ne gère pas l'appel en direct — conversation normale gardée"); return; }
  DISC.liveConnecting=true; discStopSpeaking(); toast("📞 Connexion en direct…");
  var au;
  fetch(SYNC_BASE+"/rt-session",{method:"POST",headers:{"content-type":"application/json"},
      body:JSON.stringify({lang:c.id,langName:c.nom,level:diffLabel()})})
   .then(function(r){ return r.json(); })
   .then(function(j){
     if(!j||!j.ok||!j.client_secret){ throw new Error("token"); }
     var tok=j.client_secret, model=j.model||"gpt-4o-realtime-preview";
     return navigator.mediaDevices.getUserMedia({audio:true}).then(function(mic){
       DISC.liveMic=mic;
       var pc=new RTCPeerConnection(); DISC.livePc=pc;
       au=document.createElement("audio"); au.autoplay=true; au.style.display="none"; document.body.appendChild(au); DISC.liveAudio=au;
       pc.ontrack=function(e){ try{ au.srcObject=e.streams[0]; }catch(_){}
         try{ var pp=au.play(); if(pp&&pp.catch)pp.catch(function(){}); }catch(_){}   /* iOS : force la lecture du flux distant */
         var ov=document.querySelector(".disc-overlay"), mouth=ov&&ov.querySelector(".disc-mouth"), bee=ov&&ov.querySelector(".disc-bee");
         if(bee)bee.classList.add("talk");
         if(mouth){ if(DISC.liveLip){try{DISC.liveLip();}catch(_){}} DISC.liveLip=beeLipSyncStream(e.streams[0],mouth); } };
       try{ pc.addTrack(mic.getAudioTracks()[0], mic); }catch(_){}
       var dc=pc.createDataChannel("oai-events"); DISC.liveDc=dc;
       dc.onopen=function(){ try{ dc.send(JSON.stringify({type:"session.update",session:{turn_detection:{type:"server_vad"}}})); }catch(_){} };
       return pc.createOffer().then(function(offer){ return pc.setLocalDescription(offer).then(function(){
         return fetch("https://api.openai.com/v1/realtime/calls?model="+encodeURIComponent(model),
           {method:"POST", body:offer.sdp, headers:{ "Authorization":"Bearer "+tok, "Content-Type":"application/sdp" }});
       }); }).then(function(sdpRes){ if(!sdpRes.ok) throw new Error("sdp "+sdpRes.status);
         return sdpRes.text(); }).then(function(answer){ return pc.setRemoteDescription({type:"answer",sdp:answer}); });
     });
   })
   .then(function(){ DISC.liveConnecting=false; DISC.live=true; _discLiveUI(true); toast("🔴 En direct — parle, Bee te répond"); })
   .catch(function(e){ DISC.liveConnecting=false; discLiveStop();
     var why=(e&&e.name==="NotAllowedError")?"micro refusé" : (e&&e.message)?String(e.message).slice(0,60) : "erreur réseau";
     toast("Appel en direct indisponible ("+why+") — je reste en conversation normale"); });
}
function discLiveStop(){ DISC.live=false; DISC.liveConnecting=false;
  try{ if(DISC.liveLip){DISC.liveLip();DISC.liveLip=null;} }catch(_){}
  try{ if(DISC.liveDc){DISC.liveDc.close();} }catch(_){}
  try{ if(DISC.livePc){DISC.livePc.close();} }catch(_){}
  try{ if(DISC.liveMic){DISC.liveMic.getTracks().forEach(function(t){t.stop();});} }catch(_){}
  try{ if(DISC.liveAudio){DISC.liveAudio.srcObject=null; DISC.liveAudio.remove();} }catch(_){}
  DISC.livePc=DISC.liveMic=DISC.liveAudio=DISC.liveDc=null;
  var ov=document.querySelector(".disc-overlay"), bee=ov&&ov.querySelector(".disc-bee"); if(bee)bee.classList.remove("talk");
  _discLiveUI(false); }
/* 🎭 Scènes jouables aussi en mode Discussion plein écran (Bee ouvre la scène à voix haute) */
function discSceneStart(id){ var ov=document.querySelector(".disc-overlay"); var sn=sceneById(id); if(!ov||!sn||DISC.talking)return;
  var c=coachLangMeta(); if(!c)return;
  S.coachScene=id; coachSysPush("🎭 "+sn.ic+" "+sn.nom+" — la scène commence !"); vibrate(12);
  var sub=ov.querySelector(".disc-sub"); if(sub)sub.textContent="…";
  var img=ov.querySelector(".disc-bee"); if(img)img.classList.add("think");
  discChips(ov);
  coachAsk().then(function(reply){ if(!DISC.open)return; if(img)img.classList.remove("think");
    S.coachMsgs.push({role:"bot",text:reply}); if(S.coachMsgs.length>60)S.coachMsgs=S.coachMsgs.slice(-60); save();
    discSay(reply, c.ttsLang); }); }
function discChips(ov){ var chips=ov.querySelector(".disc-chips"); if(!chips)return; chips.innerHTML="";
  var c=coachLangMeta(); if(!c)return;
  var snA=coachSceneMeta();
  if(snA){ var q=el("button","coach-chip scene-on"); q.textContent="🎭 "+snA.nom+" · ✖ quitter";
    q.onclick=function(){ S.coachScene=null; coachSysPush("🎭 Fin de la scène — bien joué !"); discChips(ov); toast("🎭 Scène terminée"); };
    chips.appendChild(q); }
  else SCENES.slice(0,5).forEach(function(sn){ var b=el("button","coach-chip"); b.textContent=sn.ic+" "+sn.nom;
    b.onclick=function(){ discSceneStart(sn.id); }; chips.appendChild(b); });
  coachSuggestions(c).slice(0,snA?4:2).forEach(function(s){ var b=el("button","coach-chip"); b.textContent=s;
    b.onclick=function(){ var inp=ov.querySelector(".disc-input"); if(inp)inp.value=s; discSend(); }; chips.appendChild(b); }); }
function discSend(){ var overlay=document.querySelector(".disc-overlay"); if(!overlay)return; if(DISC.talking)discStopSpeaking(); /* envoyer coupe Bee (vraie conversation) */
  var inp=overlay.querySelector(".disc-input"); var text=(inp&&inp.value||"").trim(); if(!text)return; inp.value="";
  var c=coachLangMeta(); if(!c)return;
  S.coachMsgs.push({role:"user",text:text}); if(S.coachMsgs.length>60)S.coachMsgs=S.coachMsgs.slice(-60); save();
  var sub=overlay.querySelector(".disc-sub"); if(sub)sub.textContent="…";
  var img=overlay.querySelector(".disc-bee"); if(img)img.classList.add("think");
  coachAsk().then(function(reply){ if(!DISC.open)return; if(img)img.classList.remove("think");
    S.coachMsgs.push({role:"bot",text:reply}); if(S.coachMsgs.length>60)S.coachMsgs=S.coachMsgs.slice(-60); save();
    if(/(bravo|super|parfait|complimenti|bravissim|muy bien|perfecto|sehr gut|[oó]timo|goed)/i.test(reply)){ var bi=overlay.querySelector(".disc-bee"); if(bi){ beeSparkles(bi,10); } }
    discSay(reply, c.ttsLang); }); }
function openDiscussion(){ if(DISC.open)return; var c=coachLangMeta(); if(!c){ toast("Choisis d'abord une langue 🌍"); return; }
  DISC.open=true; var ov=el("div","disc-overlay");
  ov.innerHTML='<button class="disc-close" aria-label="Fermer">✕</button>'+
    '<div class="disc-title">🐝 Bee · '+esc(c.nom)+'</div>'+
    '<div class="disc-stage"><div class="disc-bee bee-rig">'+
      '<img class="rig-base" src="bee/rig/base.webp" alt="Bee">'+
      '<img class="rig-piece rig-wl" src="bee/rig/wing-l.webp" alt="" onerror="this.remove()">'+
      '<img class="rig-piece rig-wr" src="bee/rig/wing-r.webp" alt="" onerror="this.remove()">'+
      '<img class="rig-piece rig-arm" src="bee/rig/arm.webp" alt="" onerror="this.remove()">'+
      '<div class="rig-lid ll"></div><div class="rig-lid lr"></div>'+
      '<div class="disc-mouth"></div>'+
      '<video class="disc-vid" src="bee/live/idle.mp4" autoplay loop muted playsinline></video></div></div>'+
    '<div class="disc-sub"></div>'+
    '<div class="disc-moves"><button data-mv="dance" title="Danse">💃</button><button data-mv="jump" title="Saute">🦘</button><button data-mv="fly" title="Vole">🕊️</button><button data-mv="walk" title="Marche">🚶</button></div>'+
    '<div class="disc-chips"></div>'+
    '<div class="disc-inbar"><button class="disc-live" title="Appel en direct">📞</button><button class="disc-mic" title="Parler">🎤</button><input class="disc-input" type="text" placeholder="Parle-moi de tout… (voyage, ciné, ta journée)" autocomplete="off"><button class="disc-send" title="Envoyer">➤</button><button class="disc-hf" title="Mains libres">🙌</button></div>';
  document.body.appendChild(ov);
  /* Elle VIT : clignement des yeux à intervalles naturels (aléatoires) */
  function blinkLoop(){ if(!DISC.open)return; var rig=ov.querySelector(".bee-rig");
    if(rig){ rig.classList.add("blink"); setTimeout(function(){ try{rig.classList.remove("blink");}catch(_){} },150); }
    DISC.blinkT=setTimeout(blinkLoop, 2200+Math.random()*3200); }
  DISC.blinkT=setTimeout(blinkLoop,1800);
  /* VRAIE VIDÉO de Bee (Replicate, générée depuis SON image) : activée dès qu'elle se charge.
     Si le navigateur ne la lit pas (erreur/codec) → repli marionnette, sans écran vide. */
  var dv=ov.querySelector(".disc-vid"), db=ov.querySelector(".disc-bee");
  DISC.vid=false;
  if(dv){
    dv.addEventListener("canplay",function(){ if(!DISC.open)return; DISC.vid=true; db.classList.add("vid"); },{once:true});
    dv.onerror=function(){ DISC.vid=false; try{db.classList.remove("vid");}catch(_){} try{dv.remove();}catch(_){} };
    DISC.clip=function(name,secs){ if(!DISC.vid||!dv||!DISC.open)return;
      try{ dv.src="bee/live/"+name+".mp4"; dv.loop=true; var p=dv.play(); if(p&&p.catch)p.catch(function(){}); }catch(_){}
      if(DISC.clipT)clearTimeout(DISC.clipT);
      if(name!=="idle"){ DISC.clipT=setTimeout(function(){ if(DISC.open&&DISC.vid&&dv){ try{ dv.src="bee/live/idle.mp4"; var q=dv.play(); if(q&&q.catch)q.catch(function(){}); }catch(_){} } }, Math.max(2,(secs||4))*1000); } };
  }
  /* Elle VIT aussi entre deux phrases : de temps en temps elle vole, marche ou danse toute seule */
  function moveLoop(){ if(!DISC.open)return;
    if(!DISC.talking){ var ks=["fly","walk","dance"]; discMove(ks[Math.floor(Math.random()*ks.length)], 2600+Math.random()*1800); }
    DISC.moveT=setTimeout(moveLoop, 9000+Math.random()*7000); }
  DISC.moveT=setTimeout(moveLoop,6000);
  ov.querySelectorAll(".disc-moves button").forEach(function(b){ b.onclick=function(){ var bee=ov.querySelector(".disc-bee"); if(bee)beeSparkles(bee,6); discMove(b.getAttribute("data-mv"), 3400); }; });
  ov.querySelector(".disc-live").onclick=discLiveToggle;
  ov.querySelector(".disc-close").onclick=function(){ try{ discLiveStop(); }catch(_){} DISC.open=false; DISC.talking=false; DISC.vid=false; DISC.clip=null; if(DISC.blinkT)clearTimeout(DISC.blinkT); if(DISC.moveT)clearTimeout(DISC.moveT); if(DISC.moveEnd)clearTimeout(DISC.moveEnd); if(DISC.clipT)clearTimeout(DISC.clipT); if(DISC.subIv){clearInterval(DISC.subIv);DISC.subIv=null;} try{ if(_ttsAudio)_ttsAudio.pause(); if(window.speechSynthesis)speechSynthesis.cancel(); }catch(_){} ov.remove(); render(); };
  ov.querySelector(".disc-send").onclick=discSend;
  ov.querySelector(".disc-input").onkeydown=function(e){ if(e.key==="Enter")discSend(); };
  ov.querySelector(".disc-mic").onclick=discListen;
  var hf=ov.querySelector(".disc-hf"); hf.onclick=function(){ DISC.handsFree=!DISC.handsFree; hf.classList.toggle("on",DISC.handsFree); toast(DISC.handsFree?"🙌 Mains libres : je t'écoute après chaque réponse":"Mains libres coupé"); };
  discChips(ov);
  var last=null; for(var i=S.coachMsgs.length-1;i>=0;i--){ if(S.coachMsgs[i].role==="bot"){ last=S.coachMsgs[i].text; break; } }
  setTimeout(function(){ discSay(last||coachGreeting(c), c.ttsLang); },450);
}
/* ============ 📖 HISTOIRES DE LA RUCHE — Bee raconte, tu comprends, tu gagnes ============
   Histoires 100% originales (data.js STORIES) : chaque ligne est DITE dans la langue
   cible (voix de Bee pour ses répliques) avec le français en dessous, puis un petit
   quiz de compréhension. 1re lecture : +20 XP +5 💎 · relecture : +5 XP. */
var ST=null; /* {sid, i:ligne courante, phase:"lines"|"quiz"|"done", qi, good, replay} */
function storiesDone(){ return (S.storiesDone&&S.storiesDone[S.course])||{}; }
function storiesDoneCount(){ return Object.keys(storiesDone()).length; }
function storyUnlocked(idx){ if(idx===0)return true; return !!storiesDone()[STORIES[idx-1].id]; }
function storyLineSay(l){ var c=COURSES[S.course]; if(!c||!l)return;
  speakLang(l.t[S.course]||l.fr, c.ttsLang, l.qui==="🐝"?BEE_VOICE:null, true); }
function storyStart(idx){ var st=STORIES[idx]; if(!st||!storyUnlocked(idx))return;
  if(!(st.lignes[0]&&st.lignes[0].t[S.course])){ toast("📖 Histoires bientôt disponibles dans cette langue"); return; } /* VÉRITÉ : jamais lire du français à la place de la langue cible */
  ST={sid:st.id, idx:idx, i:0, phase:"lines", qi:0, good:0, replay:!!storiesDone()[st.id], showFr:false};
  /* réchauffe TOUTES les répliques d'avance → la voix suit le texte sans décalage */
  ttsPrefetchMany(st.lignes.map(function(l){ return l.t[S.course]||l.fr; }));
  VIEW="story"; _armHistoryGuard(); window.scrollTo(0,0); render();
  setTimeout(function(){ storyLineSay(st.lignes[0]); },150); }
function storyNext(){ if(!ST)return; var st=STORIES[ST.idx];
  if(ST.phase==="lines"){
    if(ST.i<st.lignes.length-1){ ST.i++; render(); setTimeout(function(){ storyLineSay(st.lignes[ST.i]); },90); }
    else { ST.phase="quiz"; ST.qi=0; render();
      setTimeout(function(){ speakLang("Alors, tu as bien écouté ?","fr-FR",BEE_VOICE,true); },120); } }
}
function storyAnswer(oi){ if(!ST||ST.phase!=="quiz")return; var st=STORIES[ST.idx],q=st.quiz[ST.qi];
  var ok=oi===q.ok; if(ok){ ST.good++; tone([880,1180],.25); }else{ tone([320,240],.3); } vibrate(ok?12:30);
  ST.lastOk=ok; ST.lastPick=oi; render();
  setTimeout(function(){ ST.lastOk=null; ST.lastPick=null;
    if(ST.qi<st.quiz.length-1){ ST.qi++; render(); }
    else { ST.phase="done";
      var first=!ST.replay, xp=first?20:5;
      S.xp+=xp; S.dailyXP+=xp; histAdd(xp); if(first){ S.gems+=5; }
      if(!S.storiesDone[S.course])S.storiesDone[S.course]={};
      S.storiesDone[S.course][st.id]=Date.now();
      S.today.stories=(S.today.stories||0)+1;
      save(); checkQuests(); checkAchv(); render();
      setTimeout(function(){ speakLang(ST.good>=st.quiz.length?"Bravo, tout juste ! Tu es formidable !":"Bravo, l'histoire est finie !","fr-FR",BEE_VOICE,true); },350); }
  }, 900); }
function storyQuit(){ ST=null; try{ if(_ttsAudio)_ttsAudio.pause(); if(window.speechSynthesis)speechSynthesis.cancel(); }catch(_){} go("stories"); }
function vStories(){ var d=el("div","screen"); var c=COURSES[S.course];
  if(!c){ d.innerHTML='<h2 class="ttl">📖 Histoires</h2><p class="sub2">Choisis d\'abord une langue 🌍.</p>'; return d; }
  d.innerHTML='<h2 class="ttl">📖 Histoires de la ruche</h2><p class="sub2">Bee te raconte une histoire en '+esc(c.nom.toLowerCase())+' — écoute, lis, réponds. Chaque histoire ouvre la suivante.</p>';
  STORIES.forEach(function(st,idx){ var done=!!storiesDone()[st.id], open=storyUnlocked(idx);
    var b=el("button","story-item"+(done?" done":"")+(open?"":" locked"));
    b.innerHTML='<span class="si-ic">'+(open?st.ic:"🔒")+'</span><span class="si-tx"><b>'+esc(st.titre)+'</b><i>'+st.lignes.length+' répliques · '+st.quiz.length+' questions</i></span><span class="si-st">'+(done?"✅":(open?"▶️":""))+'</span>';
    if(open)b.onclick=function(){ storyStart(idx); };
    else b.onclick=function(){ toast("Termine d'abord « "+STORIES[idx-1].titre+" » 🔒"); };
    d.appendChild(b); });
  var back=el("button","btn-ghost"); back.textContent="← Retour"; back.onclick=function(){ go("home"); }; d.appendChild(back);
  return d;
}
function vStoryPlay(){ var d=el("div","screen story"); if(!ST){ go("stories"); return d; }
  var st=STORIES[ST.idx], c=COURSES[S.course];
  var head=el("div","story-head"); head.innerHTML='<span class="sh-ic">'+st.ic+'</span><b>'+esc(st.titre)+'</b>';
  var q=el("button","story-quit"); q.textContent="✕"; q.setAttribute("aria-label","Quitter"); q.onclick=storyQuit; head.appendChild(q);
  d.appendChild(head);
  var prog=el("div","story-prog"); var total=st.lignes.length+st.quiz.length;
  var done=ST.phase==="lines"?ST.i:(ST.phase==="quiz"?st.lignes.length+ST.qi:total);
  prog.innerHTML='<div class="bar"><div class="bar-fill" style="width:'+Math.round(done/total*100)+'%"></div></div>'; d.appendChild(prog);
  if(ST.phase==="lines"||ST.phase==="quiz"){
    var box=el("div","story-box");
    /* Pendant les QUESTIONS : on MASQUE la traduction française (sinon la réponse est donnée).
       Kevin : « masquer les réponses… les afficher ensuite pour explication si besoin, pas pendant. » */
    var showFr = ST.phase==="lines" || ST.showFr;
    st.lignes.slice(0,ST.phase==="lines"?ST.i+1:st.lignes.length).forEach(function(l,li){
      var row=el("div","story-line"+(l.qui==="🐝"?" bee":"")+(ST.phase==="lines"&&li===ST.i?" now":""));
      row.innerHTML='<span class="sl-who">'+l.qui+'</span><span class="sl-tx"><b>'+esc(l.t[S.course]||l.fr)+'</b>'+(showFr?'<i>'+esc(l.fr)+'</i>':'')+'</span>';
      var sp=el("button","sl-say"); sp.textContent="🔊"; sp.setAttribute("aria-label","Écouter");
      sp.onclick=function(ev){ ev.stopPropagation(); storyLineSay(l); }; row.appendChild(sp);
      box.appendChild(row); });
    d.appendChild(box);
    if(ST.phase==="quiz"){ var frt=el("button","btn-ghost story-fr-toggle");
      frt.textContent=ST.showFr?"🙈 Masquer les traductions":"👁 Voir les traductions (aide)";
      frt.onclick=function(){ ST.showFr=!ST.showFr; render(); }; d.appendChild(frt); }
    if(ST.phase==="lines"){ var nb=el("button","btn-main story-next");
      nb.textContent=ST.i<st.lignes.length-1?"▶ Suite":"✅ J'ai compris — aux questions !";
      nb.onclick=storyNext; d.appendChild(nb); }
    else { var qq=st.quiz[ST.qi]; var qc=el("div","story-quiz");
      qc.innerHTML='<div class="sq-q">❓ '+esc(qq.q)+'</div>';
      qq.opts.forEach(function(o,oi){ var ob=el("button","sq-opt"+(ST.lastPick===oi?(ST.lastOk?" good":" bad"):""));
        ob.textContent=o; ob.onclick=function(){ if(ST.lastPick==null)storyAnswer(oi); }; qc.appendChild(ob); });
      d.appendChild(qc); } }
  else { var fin=el("div","story-fin"); var perfect=ST.good>=st.quiz.length;
    fin.innerHTML='<div class="sf-ic">'+(perfect?"🏆":"🎉")+'</div><h2>'+(perfect?"Parfait !":"Bravo !")+'</h2>'
      +'<p>'+ST.good+'/'+st.quiz.length+' bonnes réponses · '+(ST.replay?"+5 XP":"+20 XP · +5 💎")+'</p>';
    var again=el("button","btn-ghost"); again.textContent="🔁 Réécouter l'histoire"; again.onclick=function(){ storyStart(ST.idx); }; fin.appendChild(again);
    var nxt=ST.idx<STORIES.length-1?el("button","btn-main"):null;
    if(nxt){ nxt.textContent="📖 Histoire suivante"; nxt.onclick=function(){ storyStart(ST.idx+1); }; fin.appendChild(nxt); }
    var out=el("button","btn-ghost"); out.textContent="← Toutes les histoires"; out.onclick=storyQuit; fin.appendChild(out);
    d.appendChild(fin); }
  setTimeout(function(){ var b=d.querySelector(".story-box"); if(b)b.scrollTop=b.scrollHeight; },40);
  return d;
}
function vTabbar(){ var t=el("div","tabbar"); [["home","🏠","Accueil"],["review","🧠","Réviser"],["coach","💬","Coach"],["translate","🌐","Traduire"],["league","🏆","Ligue"],["profile","🙂","Profil"]].forEach(function(x){ var b=el("button","tab"+(VIEW===x[0]||(x[0]==="review"&&VIEW==="dict")?" active":"")); b.innerHTML='<span>'+x[1]+'</span><i>'+x[2]+'</i>'; b.onclick=function(){go(x[0]);}; t.appendChild(b); }); return t; }

/* ============ Traducteur multilingue (hors-ligne, basé sur le dictionnaire) ============ */
var REV=null;
function buildRev(){ REV={fr:{}}; TLANGS.forEach(function(l){REV[l]={};});
  Object.keys(DICT).forEach(function(fr){ REV.fr[norm(fr)]=fr; TLANGS.forEach(function(l){ var v=DICT[fr][l]; if(v)REV[l][norm(v)]=fr; }); }); }
function translateQ(q,src){ if(!REV)buildRev(); var nq=norm(q); if(!nq)return null; var order=src==="auto"?["fr"].concat(TLANGS):[src];
  var fr=null;
  for(var i=0;i<order.length&&!fr;i++){ var m=REV[order[i]]; if(m&&m[nq])fr=m[nq]; }
  if(!fr){ // approché : commence par / contient
    for(var j=0;j<order.length&&!fr;j++){ var mm=REV[order[j]]; if(!mm)continue; var keys=Object.keys(mm);
      for(var k=0;k<keys.length;k++){ if(keys[k].indexOf(nq)===0||nq.indexOf(keys[k])===0){ fr=mm[keys[k]]; break; } } } }
  if(!fr)return null; var out={fr:fr}; TLANGS.forEach(function(l){ out[l]=DICT[fr][l]||"—"; }); return out;
}
var TR={src:"auto", q:"", res:null};
function vTranslate(){ var d=el("div","screen");
  d.innerHTML='<h2 class="ttl">🌐 Traducteur</h2><p class="sub2">'+(TLANGS.length+1)+' langues, hors-ligne. Tape un mot ou une phrase.</p>';
  var bar=el("div","tr-bar");
  var langsOpt=[["auto","🔎 Auto"],["fr","🇫🇷 Français"]].concat(TLANGS.map(function(l){return [l,LMETA[l].drapeau+" "+LMETA[l].nom];}));
  bar.innerHTML='<select id="trSrc">'+langsOpt.map(function(o){return '<option value="'+o[0]+'"'+(TR.src===o[0]?" selected":"")+'>'+o[1]+'</option>';}).join("")+'</select>';
  var input=el("div","tr-in");
  input.innerHTML='<input id="trQ" class="txt" placeholder="ex : bonjour, chat, je t\'aime…" value="'+esc(TR.q)+'" autocomplete="off">'+
    '<button class="tr-mic" id="trMic" title="Dicter">🎤</button>';
  d.appendChild(bar); d.appendChild(input);
  var out=el("div","tr-out"); out.id="trOut"; d.appendChild(out);
  function run(){ var q=(d.querySelector("#trQ").value||""); TR.q=q; TR.src=d.querySelector("#trSrc").value; TR.res=translateQ(q,TR.src); paint(); }
  function paint(){ var o=d.querySelector("#trOut"); o.innerHTML="";
    if(!TR.q.trim()){ o.innerHTML='<div class="tr-hint">💡 Essaie « bonjour », « chat », « où sont les toilettes »…</div>'; return; }
    if(!TR.res){ o.innerHTML='<div class="tr-hint">🤔 Mot introuvable dans le dictionnaire ('+Object.keys(DICT).length+' entrées). Essaie un autre mot.</div>'; return; }
    var langsAll=[["fr","🇫🇷","Français"]].concat(TLANGS.map(function(l){return [l,LMETA[l].drapeau,LMETA[l].nom];}));
    langsAll.forEach(function(l){ var val=TR.res[l[0]]; if(!val||val==="—")return; var card=el("div","tr-card");
      card.innerHTML='<span class="trflag">'+l[1]+'</span><span class="trtxt"><b>'+esc(val)+'</b><i>'+l[2]+'</i></span>'+(l[0]!=="fr"?'<button class="trspk" data-l="'+l[0]+'" data-t="'+esc(val)+'">🔊</button>':'');
      o.appendChild(card); });
    o.querySelectorAll(".trspk").forEach(function(b){ b.onclick=function(){ speakLang(b.getAttribute("data-t"), LMETA[b.getAttribute("data-l")].tts); }; });
  }
  setTimeout(function(){ var i=d.querySelector("#trQ"); if(i){ i.oninput=run; i.focus(); } d.querySelector("#trSrc").onchange=run;
    var mic=d.querySelector("#trMic"); if(mic)mic.onclick=function(){ dictate(function(txt){ d.querySelector("#trQ").value=txt; run(); }); };
    paint(); },0);
  return d;
}
/* Voix de BEE : toujours douce, tendre et féminine (nova), quel que soit le choix de voix des leçons. */
var BEE_VOICE="bee"; /* marqueur : la voix de Bee est CHOISIE par l'utilisateur (S.beeVoice) */
/* Catalogue de voix de Bee — chacune sonne RÉELLEMENT différente (règle « voix réellement
   différentes ») : base cloud + vitesse de lecture SANS préservation du pitch → plus rapide
   = plus aigu = voix de petite fille. rate=vitesse audio cloud ; wsPitch/wsRate = repli local. */
var BEE_VOICES=[
  {id:"fillette",  nom:"🎀 Petite Bee",        desc:"la petite abeille au miel — voix de fillette aiguë et adorable", phrase:"Bzzz ! Moi c'est Bee, ta petite abeille au miel !",          tts:"nova",    rate:1.24, gen:0.81, wsPitch:1.7, wsRate:0.95},
  {id:"minibee",   nom:"🐝 Bee rigolote",      desc:"l'abeille espiègle de la ruche, encore plus aiguë",              phrase:"Bzzz bzzz ! On fait la course jusqu'à la ruche ?",           tts:"nova",    rate:1.45, gen:0.68, wsPitch:2,   wsRate:0.95},
  {id:"douce",     nom:"🌸 Bee des fleurs",    desc:"douce et tendre comme un champ de fleurs",                       phrase:"Bonjour… viens, on va butiner de nouveaux mots ensemble.",   tts:"shimmer", rate:1,    wsPitch:1.15,wsRate:.95},
  {id:"petillante",nom:"☀️ Bee du soleil",     desc:"pétillante comme un matin d'été au rucher",                      phrase:"Bzzz ! Quelle belle journée pour apprendre, on y va ?",      tts:"nova",    rate:1,    wsPitch:1.2, wsRate:1},
  {id:"conteuse",  nom:"🍯 Mamie Bee",         desc:"la conteuse de la ruche, comme une histoire au coin du miel",    phrase:"Approche… je vais te raconter les secrets de la ruche.",     tts:"fable",   rate:.96,  wsPitch:1.1, wsRate:.9}
];
function beeVoiceCfg(){ var id=S.beeVoice||"fillette"; for(var i=0;i<BEE_VOICES.length;i++){ if(BEE_VOICES[i].id===id)return BEE_VOICES[i]; } return BEE_VOICES[0]; }
function speakLang(text,lang,vid,fem){ if(!S.sound||!text)return; vid=vid||S.voice||"nova";
  /* UNE SEULE voix partout = celle que tu as choisie (S.voice), CLAIRE et à vitesse normale.
     Fini « la voix change selon la catégorie » et l'effet fillette aigu/étouffé (Kevin). */
  var cfg=null; if(vid==="bee"){ vid=S.voice||"nova"; }
  /* Profils de voix (ex : « antonin ») : on résout vers la vraie voix cloud + réglages. */
  var _vr=voiceReal(vid); if(_vr&&_vr.tts){ cfg={rate:_vr.rate||1, gen:_vr.gen, wsPitch:_vr.wsPitch||1.1, wsRate:1}; vid=_vr.tts; }
  /* ANTI-DÉCALAGE (même protection que speak()) : coupe tout son en cours + jeton de requête
     → jamais deux voix qui se chevauchent, jamais un ancien son qui part en retard */
  var myReq=++_ttsReq;
  try{ if(window.speechSynthesis) speechSynthesis.cancel(); }catch(_){} _wsStopKA();
  if(_isCloudVoice(vid)){ try{
    if(_ttsAudio){ try{_ttsAudio.pause();}catch(_){} _ttsAudio=null; }
    var a=new Audio(SYNC_BASE+"/tts?v="+encodeURIComponent(vid)+(cfg&&cfg.gen?"&s="+cfg.gen:"")+"&t="+encodeURIComponent(text)); _ttsAudio=a; try{a.volume=1;}catch(_){}
    if(cfg&&cfg.rate!==1){ try{ a.preservesPitch=false; a.webkitPreservesPitch=false; a.playbackRate=cfg.rate; }catch(_){} }
    a.onerror=function(){ if(myReq===_ttsReq)_webSpeakLang(text,lang,fem,cfg); };
    var p=a.play(); if(p&&p.catch)p.catch(function(){ if(myReq===_ttsReq)_webSpeakLang(text,lang,fem,cfg); }); return; }catch(e){} }
  _webSpeakLang(text,lang,fem,cfg); }
function _webSpeakLang(text,lang,fem,cfg){ if(!S.sound||!text)return; try{ var u=new SpeechSynthesisUtterance(text); u.lang=lang; u.rate=cfg?cfg.wsRate:(fem?.95:.9); u.pitch=cfg?cfg.wsPitch:(fem?1.15:1); u.volume=1;
  var base=lang.split("-")[0],vs=speechSynthesis.getVoices().filter(function(v){return v.lang&&v.lang.indexOf(base)===0;});
  var femV=fem?vs.filter(function(v){return /am[eé]lie|audrey|aur[eé]lie|c[eé]line|chantal|julie|marie|virginie|alice|elsa|paulina|monica|petra|anna|female|femme|woman/i.test(v.name);})[0]:null;
  var best=femV||vs.filter(function(v){return v.localService;})[0]||vs[0]; if(best)u.voice=best; _wsSpeak(u);}catch(e){} }
function _srOk(){ return !!(window.SpeechRecognition||window.webkitSpeechRecognition); }
function dictate(cb,lang){ try{ var SR=window.SpeechRecognition||window.webkitSpeechRecognition; if(!SR){ toast("Micro non dispo sur ce navigateur"); cb&&cb(""); return; } var r=new SR(); r.lang=lang||"fr-FR"; r.interimResults=false; r.maxAlternatives=3; r.onresult=function(e){ var best=""; try{ best=e.results[0][0].transcript; }catch(_){} cb&&cb(best); }; r.onerror=function(){ cb&&cb(""); }; r.start(); toast("🎤 Parle…"); }catch(e){ toast("Micro indisponible"); cb&&cb(""); } }

/* ============ LEÇON ============ */
function startLesson(ui,li,rev){ if(!UNLIMITED && S.hearts<=0){ outOfHearts(); return; }
  LESSON={ui:ui,li:li,review:!!rev,ex:buildLesson(ui,li,rev),i:0,wrong:0,correct:0,combo:0,comboMax:0,answered:false,ok:null}; VIEW="lesson"; _armHistoryGuard(); window.scrollTo(0,0); render();
  /* Bee annonce la leçon à voix haute — SAUF si le 1er exercice joue déjà son mot
     automatiquement (les deux partaient au même instant et se coupaient l'un l'autre) */
  try{ var first=LESSON.ex&&LESSON.ex[0];
    if(!(first&&first.audio)){ var intro=rev?"C'est parti pour la révision !":"C'est parti ! Écoute bien.";
      setTimeout(function(){ speakLang(intro,"fr-FR",BEE_VOICE,true); },250); } }catch(_){} }
function unitAllWords(ui){ var c=COURSES[S.course],o=[]; c.units[ui].lessons.forEach(function(l){ o=o.concat(l.words); }); return o; }
function unitAllPhrases(ui){ var c=COURSES[S.course],o=[]; c.units[ui].lessons.forEach(function(l){ o=o.concat(l.phrases||[]); }); return o; }
function buildExam(ui){ var pool=allWords(S.course),tier=Math.min(4,diffTier()+1),ws=shuffle(unitAllWords(ui)),ex=[];
  ws.forEach(function(w,i){ ex.push(exForWord(w,pool,tier,i)); }); // examen = un cran plus dur que les leçons
  if(ws.length>=4 && tier<=2) ex.splice(2,0,makeMatch(shuffle(ws).slice(0,Math.min(5,ws.length))));
  unitAllPhrases(ui).forEach(function(p){ ex.push(makeBank(p,pool)); if(tier>=2&&!(COURSES[S.course]&&COURSES[S.course].noType)) ex.push(makeType({fr:p.fr,t:p.t},"toT")); });
  return shuffle(ex).slice(0,Math.min(ex.length, 15+tier)); }
/* ---------- Test de niveau (placement) : estime le niveau puis adapte tout ---------- */
function buildPlacement(){ var c=COURSES[S.course],pool=allWords(S.course),qs=[];
  c.units.forEach(function(u,ui){ var w=u.lessons[0]&&u.lessons[0].words[0]; if(w) qs.push({w:w,ui:ui}); }); // 1 mot/unité, du + facile au + dur
  var pick=[],step=Math.max(1,Math.floor(qs.length/14)); for(var i=0;i<qs.length&&pick.length<14;i+=step) pick.push(qs[i]);
  return pick.map(function(q,i){ return makeMC(q.w,pool,i%2?"mc_fr":"mc_t"); }); }
function startPlacement(){ LESSON={placement:true,ex:buildPlacement(),i:0,wrong:0,correct:0,combo:0,comboMax:0,answered:false,ok:null}; VIEW="lesson"; window.scrollTo(0,0); render(); }
function finishPlacement(L){ var ratio=L.correct/Math.max(1,L.ex.length);
  var tier=ratio>=0.9?4:ratio>=0.75?3:ratio>=0.55?2:ratio>=0.35?1:0; S.diff=tier;
  var openUpto=[0,2,5,9,13][tier],c=COURSES[S.course];
  /* VÉRITÉ : on DÉBLOQUE (-1 = « ouverte, à faire ») sans jamais marquer « faite » une leçon
     non faite — plus de fausses couronnes ni de cadenas disparus (bug vu chez Carla). */
  for(var ui=0;ui<Math.min(openUpto,c.units.length);ui++){ (function(u){ u.lessons.forEach(function(_,li){ var k="u"+ui+"-"+li; if(!(S.prog[S.course][k]>0)) S.prog[S.course][k]=-1; }); })(c.units[ui]); }
  save(); VIEW="home"; render();
  var names=["Facile (Débutant)","Moyen (A1)","Assez difficile (A1+)","Difficile (A2)","Expert (A2+)"];
  var m=modal(); m.body.innerHTML='<div class="mascot-mini big">'+MASCOT("party",120)+'</div><h3>📊 Niveau estimé : '+names[tier]+'</h3><p class="mini">'+L.correct+'/'+L.ex.length+' bonnes réponses. J\'ai adapté la difficulté des exercices'+(openUpto>0?' et ouvert les '+openUpto+' premières unités pour toi.':'.')+' Tu peux réajuster dans ton profil quand tu veux.</p>';
  var b=el("button","btn-main"); b.textContent="C'est parti ! 🚀"; b.onclick=function(){ m.close(); render(); }; m.body.appendChild(b); }
function diffLabel(){ return S.diff==null?"Auto":["Facile","Moyen","Assez difficile","Difficile","Expert"][S.diff]; }
function openDiff(){ var m=modal();
  m.body.innerHTML='<h3>🎚️ Niveau des exercices</h3><p class="mini">Plus c\'est élevé, plus il faut <b>écrire</b> les réponses (au lieu de choisir), traduire dans les deux sens et écouter-puis-écrire.</p>';
  var names=["Facile","Moyen","Assez difficile","Difficile","Expert"];
  var g=el("div","diff-pick"); names.forEach(function(nm,idx){ var b=el("button","diff-opt"+(S.diff===idx?" sel":"")); b.textContent=nm; b.onclick=function(){ S.diff=idx; save(); m.close(); render(); toast("Difficulté : "+nm+" 🎚️"); }; g.appendChild(b); }); m.body.appendChild(g);
  var t=el("button","btn-main"); t.textContent="📊 Faire le test de niveau"; t.onclick=function(){ m.close(); startPlacement(); }; m.body.appendChild(t);
  var a=el("button","btn-ghost"); a.textContent="Laisser en Auto (selon ma progression)"; a.onclick=function(){ S.diff=null; save(); m.close(); render(); toast("Difficulté : Auto"); }; m.body.appendChild(a); }
/* Au tout début : on propose automatiquement d'ÉVALUER le niveau pour adapter le programme. */
function maybeOfferPlacement(){
  if(!S.course || S.diff!=null || masteredCount()>0 || lg("placeAsked",false)) return;
  ls("placeAsked",true);
  var m=modal(); m.body.innerHTML='<div class="mascot-mini big">'+MASCOT("point",110)+'</div><h3>📊 Évaluons ton niveau</h3><p class="mini">Un mini-test d\'une minute pour <b>adapter les leçons à ton niveau</b> et progresser pas à pas. (Tu pourras le refaire quand tu veux.)</p>';
  var b1=el("button","btn-main"); b1.textContent="🚀 Faire le test (1 min)"; b1.onclick=function(){ m.close(); startPlacement(); }; m.body.appendChild(b1);
  var b2=el("button","btn-ghost"); b2.textContent="Je débute — commencer simple"; b2.onclick=function(){ S.diff=0; save(); m.close(); render(); }; m.body.appendChild(b2);
}
function startExam(ui){ if(!UNLIMITED && S.hearts<=0){ outOfHearts(); return; }
  LESSON={ui:ui,li:null,exam:true,review:false,ex:buildExam(ui),i:0,wrong:0,correct:0,combo:0,comboMax:0,answered:false,ok:null}; VIEW="lesson"; window.scrollTo(0,0); render();
  var msg="C'est Bee qui te fait passer l'examen ! Concentre-toi, je suis avec toi 🐝";
  setTimeout(function(){ beeBubble(msg,5000); speakLang(msg,"fr-FR",BEE_VOICE,true); },350); }
function outOfHearts(){ VIEW="home"; render(); var m=modal();
  m.body.innerHTML='<div class="mascot-mini">'+MASCOT("sad",90)+'</div><h3>Plus de vies ❤️</h3><p>Tes cœurs reviennent seuls (1 / 30 min).</p>';
  var b1=el("button","btn-main"); b1.textContent="Recharger (350 💎)"; b1.onclick=function(){ if(S.gems>=350){S.gems-=350;S.hearts=HEART_MAX;S.heartTs=Date.now();save();m.close();render();} else toast("Pas assez de gemmes 💎"); };
  var b2=el("button","btn-ghost"); b2.textContent="Réviser gratuitement (regagne des cœurs)"; b2.onclick=function(){ m.close(); var rw=shuffle(allWords(S.course)).slice(0,8); LESSON={ui:null,li:null,review:true,heal:true,ex:buildLesson(null,null,rw),i:0,wrong:0,correct:0,combo:0,comboMax:0,answered:false,ok:null}; VIEW="lesson"; render(); };
  m.body.appendChild(b1); m.body.appendChild(b2);
}
var _ttsWarm={};
function ttsPrefetch(text){ /* fabrique le son EN AVANCE : un vrai fetch() réchauffe le cache du worker
   ET le cache navigateur → à la lecture, la voix part INSTANTANÉMENT (fini « la voix arrive trop
   tard après le texte »). Anti-doublon via _ttsWarm. */
  if(!S.sound||!text)return; var vid=S.voice||"nova"; if(!_isCloudVoice(vid))return;
  var url=SYNC_BASE+"/tts?v="+encodeURIComponent(vid)+"&t="+encodeURIComponent(text);
  if(_ttsWarm[url])return; if(Object.keys(_ttsWarm).length>400)_ttsWarm={}; _ttsWarm[url]=1;
  try{ fetch(url).catch(function(){}); }catch(_){} }
function ttsPrefetchMany(list){ if(!list)return; try{ list.forEach(function(t){ if(t)ttsPrefetch(t); }); }catch(_){} }
function beeExplain(ex,L){ /* Explication d'erreur : le sens, ce que voulait dire TA réponse, un exemple d'usage */
  try{ if(!ex||!ex.w)return null;
    var t=ex.w.t, fr=ex.w.fr, out={html:"",say:""};
    out.html='📖 « <b>'+esc(t)+'</b> » = « <b>'+esc(fr)+'</b> »';
    out.say='« '+t+' », c\'est « '+fr+' ».';
    var pick=(ex.kind==="mc")?L._pick:(ex.kind==="type"?L._typeVal:null);
    if(pick&&norm(pick)!==norm(ex.answer||"")){
      var other=null; try{ allWords(S.course).forEach(function(w2){ if(other)return; if(norm(w2.t)===norm(pick)||norm(w2.fr)===norm(pick)) other=w2; }); }catch(_){}
      if(other&&norm(other.fr)!==norm(fr)){ var om=(norm(other.t)===norm(pick))?other.fr:other.t;
        out.html+='<br>🤔 Ta réponse « '+esc(pick)+' » veut dire « <b>'+esc(om)+'</b> »';
        out.say+=' Ta réponse, « '+pick+' », voulait dire « '+om+' ».';
        /* ⚠️ faux-ami / confusion : si ta réponse RESSEMBLE au mot cible, préviens explicitement */
        var pk=norm(pick),ntt=norm(t);
        if(pk&&ntt&&pk!==ntt&&(pk.slice(0,3)===ntt.slice(0,3)||_lev(pk,ntt)<=2)){
          out.html+='<br>⚠️ « <b>'+esc(t)+'</b> » (='+esc(fr)+') et « '+esc(pick)+' » (='+esc(om)+') se ressemblent — ne les confonds pas.'; } }
      else if(ex.kind==="type"){ out.html+='<br>✏️ Tu as écrit « '+esc(pick)+' » — regarde bien l\'orthographe'; } }
    /* 💡 indice FIABLE (jamais inventé) : le mot est proche du français → on le signale */
    var nt=norm(t),nf=norm(fr);
    if(nt&&nf&&nt!==nf&&(nt.slice(0,4)===nf.slice(0,4)||_lev(nt,nf)<=2)){
      out.html+='<br>💡 Presque comme en français : « '+esc(fr)+' » → « <b>'+esc(t)+'</b> ».'; out.say+=' C\'est presque comme en français.'; }
    try{ if(fr.length>=4){ var ks=Object.keys(PHRASEBOOK); for(var i=0;i<ks.length;i++){ if(ks[i].indexOf(fr)>=0){
      var pt=PHRASEBOOK[ks[i]]&&PHRASEBOOK[ks[i]][COURSES[S.course].id];
      if(pt){ out.html+='<br>🗣 Exemple : « '+esc(pt)+' » — '+esc(ks[i]); } break; } } } }catch(_){}
    return out; }catch(_){ return null; } }
function beeExplainMore(ex){ /* Un tap → le prof IA explique en profondeur (mémoire du Coach).
   Garde ANTI-INVENTION : on interdit d'inventer mots/étymologies/astuces douteuses (bug vécu :
   « pensez à hennie », « la femelle de la poule »). Faits sûrs uniquement, sinon pas d'astuce. */
  try{ var c=coachLangMeta(); if(!c||!ex||!ex.w){ toast("Choisis d'abord une langue 🌍"); return; }
    var q="Explique-moi simplement, en 2 phrases maximum, pourquoi « "+ex.w.fr+" » se dit « "+ex.w.t+" » en "+c.nom.toLowerCase()+". IMPORTANT : n'invente JAMAIS de mot, d'étymologie ni d'astuce fausse ; base-toi uniquement sur des faits sûrs ; si tu n'as pas d'astuce mémoire fiable, n'en donne pas. Réponds en français simple.";
    S.coachMsgs.push({role:"user",text:q}); if(S.coachMsgs.length>60)S.coachMsgs=S.coachMsgs.slice(-60); save();
    /* On RESTE dans la leçon (Kevin ne perd plus sa série de questions) : l'explication du prof
       s'affiche EN LIGNE sous le feedback, et le bouton « Continuer » reste là pour enchaîner. */
    if(LESSON){ LESSON._profLoading=true; LESSON._profReply=null; if(VIEW==="lesson")render(); }
    coachAsk().then(function(reply){ S.coachMsgs.push({role:"bot",text:reply}); if(S.coachMsgs.length>60)S.coachMsgs=S.coachMsgs.slice(-60); save();
      if(LESSON){ LESSON._profLoading=false; LESSON._profReply=reply; if(VIEW==="lesson")render(); else { go("coach"); render(); } }
      try{ coachSpeak(reply); }catch(_){} })
     .catch(function(){ if(LESSON){ LESSON._profLoading=false; LESSON._profReply="Bee n'a pas pu expliquer là, réessaie."; if(VIEW==="lesson")render(); } }); }catch(_){} }
function vLesson(){ var d=el("div","lesson"),L=LESSON,ex=L.ex[L.i],pct=Math.round(L.i/L.ex.length*100);
  if(ex&&ex.w&&ex.w.t) ttsPrefetch(ex.w.t); /* mot courant réchauffé → lecture instantanée */
  if(L.ex[L.i+1]&&L.ex[L.i+1].w&&L.ex[L.i+1].w.t) ttsPrefetch(L.ex[L.i+1].w.t); /* et le suivant → 0 décalage à l'enchaînement */
  var top=el("div","lesson-top"); top.innerHTML='<button class="quit" id="quitB">✕</button><div class="bar big"><div class="bar-fill" style="width:'+pct+'%"></div></div>'+(L.combo>=2?'<div class="combo">🔥 x'+L.combo+'</div>':'')+'<div class="lh">❤️ '+(UNLIMITED?'∞':S.hearts)+'</div>';
  top.querySelector("#quitB").onclick=function(){ if(confirm("Quitter la leçon ? La progression de CETTE leçon sera perdue.")){ LESSON=null; VIEW="home"; render(); } }; d.appendChild(top);
  var body=el("div","lesson-body");
  if(ex.kind==="mc")body.appendChild(exMC(ex)); else if(ex.kind==="match")body.appendChild(exMatch(ex)); else if(ex.kind==="bank")body.appendChild(exBank(ex)); else if(ex.kind==="type")body.appendChild(exType(ex)); else if(ex.kind==="speak")body.appendChild(exSpeak(ex));
  d.appendChild(body);
  var foot=el("div","lesson-foot"+(L.answered?(L.ok?" ok":" ko"):""));
  if(L.answered){ var fb=el("div","feedback");
    var PRAISE=["✅ Super !","✅ Bien joué !","✅ Bzzz… parfait ! 🐝","✅ Exact !","✅ Bee est fière de toi !","✅ Impeccable !"];
    var CONSOLE_=["❌ Pas tout à fait. La bonne réponse :","❌ Pas grave, on retient :","❌ Bee te souffle la réponse :"];
    fb.innerHTML=L.ok?('<b>'+PRAISE[(L.i+L.correct)%PRAISE.length]+'</b>'+(L.combo>=3?' <span class="cb">🔥 combo x'+L.combo+' (+1 XP)</span>':'')):('<b>'+CONSOLE_[L.i%CONSOLE_.length]+'</b> '+esc(L._sol||""));
    if(!L.ok){ /* EXPLICATION quand on se trompe : le sens, ce que voulait dire TA réponse, un exemple */
      var expl=beeExplain(ex,L);
      if(expl&&expl.html){ var ed=el("div","fb-expl"); ed.innerHTML=expl.html; fb.appendChild(ed); }
      if(ex&&ex.w){ var mb=el("button","fb-more"); mb.textContent=L._profReply?"💬 Redemander au prof":"💬 Demander au prof";
        mb.disabled=!!L._profLoading;
        mb.onclick=function(ev){ ev.stopPropagation(); beeExplainMore(ex); }; fb.appendChild(mb); }
      if(L._profLoading){ var pl=el("div","fb-expl prof"); pl.textContent="🐝 Bee réfléchit…"; fb.appendChild(pl); }
      else if(L._profReply){ var pr=el("div","fb-expl prof"); pr.innerHTML='<b>🐝 Prof :</b> '+esc(L._profReply); fb.appendChild(pr); } }
    foot.appendChild(fb); }
  var main=el("button","btn-main check"); main.id="mainBtn"; main.textContent=L.answered?"Continuer":"Vérifier"; main.disabled=!L.answered&&!L._can; main.onclick=function(){ L.answered?nextEx():checkEx(ex); }; foot.appendChild(main);
  d.appendChild(foot); return d;
}
function exMC(ex){ var w=el("div","ex");
  var q=ex.audio?'<div class="q-audio" id="audioBtn">🔊<span>Touche pour écouter</span></div>':'<div class="q-word">'+esc(ex.prompt)+' <button class="say" id="sayBtn">🔊</button></div>';
  var titre=ex.audio?"Que dis-je ?":(ex.mode==="mc_fr"?"Traduis en français":"Traduis ce mot");
  w.innerHTML='<div class="ex-h">'+MASCOT("point",64)+'<div class="bubble">'+titre+'</div></div>'+q;
  /* entraîne l'oreille : on LIT le mot cible affiché (mode audio, ou « traduis en français » où
     le mot dans la langue est montré). On ne lit pas la réponse cachée (ça la donnerait). */
  if(!LESSON.answered && (ex.audio || ex.mode==="mc_fr")) _lsSpeak(ex.w.t,LESSON.i,260);
  var opts=el("div","opts"); ex.opts.forEach(function(o){ var b=el("button","opt"); b.textContent=o; b.onclick=function(){ if(LESSON.answered)return; opts.querySelectorAll(".opt").forEach(function(x){x.classList.remove("sel");}); b.classList.add("sel"); LESSON._pick=o; LESSON._can=true; syncMain(); }; opts.appendChild(b); }); w.appendChild(opts);
  setTimeout(function(){ var sb=document.getElementById("sayBtn"); if(sb)sb.onclick=function(){speak(ex.w.t);}; var ab=document.getElementById("audioBtn"); if(ab)ab.onclick=function(){speak(ex.w.t);}; },0);
  return w;
}
function exMatch(ex){ var w=el("div","ex"); w.innerHTML='<div class="ex-h">'+MASCOT("point",64)+'<div class="bubble">Associe les paires</div></div>';
  var grid=el("div","match-grid"),cL=el("div","mcol"),cR=el("div","mcol");
  var left=shuffle(ex.pairs.map(function(p){return{txt:p.fr,key:p.fr,side:"L"};})),right=shuffle(ex.pairs.map(function(p){return{txt:p.t,key:p.fr,side:"R",w:p.w};}));
  LESSON._match={sel:null,done:0,need:ex.pairs.length};
  function clearSel(){ if(LESSON._match.sel){LESSON._match.sel.classList.remove("msel");LESSON._match.sel=null;} }
  function mk(it){ var b=el("button","mtile"); b.textContent=it.txt; b.dataset.key=it.key; b.dataset.side=it.side; b.onclick=function(){ if(b.classList.contains("matched"))return; var s=LESSON._match.sel;
    if(!s){clearSel();b.classList.add("msel");LESSON._match.sel=b;return;} if(s===b){b.classList.remove("msel");LESSON._match.sel=null;return;} if(s.dataset.side===b.dataset.side){clearSel();b.classList.add("msel");LESSON._match.sel=b;return;}
    if(s.dataset.key===b.dataset.key){ s.classList.add("matched");b.classList.add("matched");s.classList.remove("msel");LESSON._match.sel=null;LESSON._match.done++; beep(true); /* pas de voix sur chaque paire (Kevin) */
      if(LESSON._match.done>=LESSON._match.need){LESSON._can=true;LESSON._matchOk=true;syncMain();} }
    else{ b.classList.add("mbad");s.classList.add("mbad");var ss=s; setTimeout(function(){b.classList.remove("mbad","msel");ss.classList.remove("mbad","msel");},450); LESSON._match.sel=null; beep(false); } }; return b; }
  left.forEach(function(it){cL.appendChild(mk(it));}); right.forEach(function(it){cR.appendChild(mk(it));}); grid.appendChild(cL);grid.appendChild(cR);w.appendChild(grid); return w;
}
function exBank(ex){ var w=el("div","ex"); w.innerHTML='<div class="ex-h">'+MASCOT("point",64)+'<div class="bubble">Traduis cette phrase</div></div><div class="q-word">'+esc(ex.prompt)+'</div>';
  var ans=el("div","bank-answer"),bank=el("div","bank-src"); LESSON._chosen=[];
  function refresh(){ ans.innerHTML=""; LESSON._chosen.forEach(function(tok,idx){ var t=el("button","tok"); t.textContent=tok; t.onclick=function(){LESSON._chosen.splice(idx,1);refresh();}; ans.appendChild(t); });
    var used={}; LESSON._chosen.forEach(function(t){used[t]=(used[t]||0)+1;}); var seen={}; bank.querySelectorAll(".tok").forEach(function(b){ var t=b.textContent; seen[t]=(seen[t]||0)+1; if(seen[t]<=(used[t]||0))b.classList.add("used"); else b.classList.remove("used"); });
    LESSON._can=LESSON._chosen.length>0; LESSON._bankVal=LESSON._chosen.join(" "); syncMain(); }
  ex.bank.forEach(function(tok){ var b=el("button","tok"); b.textContent=tok; b.onclick=function(){ if(b.classList.contains("used"))return; LESSON._chosen.push(tok); refresh(); }; bank.appendChild(b); });
  w.appendChild(ans); w.appendChild(bank); refresh(); return w;
}
function exType(ex){ var w=el("div","ex");
  var titre=ex.audio?"Écoute et écris ce que tu entends":(ex.dir==="toFr"?"Écris en français":"Écris la traduction");
  var q=ex.audio?'<div class="q-audio" id="audioBtn">🔊<span>Touche pour réécouter</span></div>':'<div class="q-word">'+esc(ex.prompt)+' <button class="say" id="sayBtn">🔊</button></div>';
  w.innerHTML='<div class="ex-h">'+MASCOT("point",64)+'<div class="bubble">'+titre+'</div></div>'+q;
  /* on lit le mot cible montré (écoute, ou « écris en français » où le mot dans la langue est affiché) */
  if(!LESSON.answered && (ex.audio || ex.dir==="toFr")) _lsSpeak(ex.w.t,LESSON.i,260);
  var inp=el("input","type-input"); inp.type="text"; inp.setAttribute("autocapitalize","none"); inp.setAttribute("autocomplete","off"); inp.setAttribute("autocorrect","off"); inp.spellcheck=false; inp.placeholder="Écris ta réponse…";
  if(LESSON.answered){ /* après validation : on GARDE ce que tu as écrit à l'écran (coloré) + le clavier ne repop pas → la correction reste visible */
    inp.value=LESSON._typeVal||""; inp.readOnly=true; inp.classList.add(LESSON.ok?"tgood":"tbad"); }
  else {
    inp.oninput=function(){ LESSON._typeVal=inp.value; LESSON._can=inp.value.trim().length>0; syncMain(); };
    inp.onkeydown=function(e){ if(e.key==="Enter"&&LESSON._can&&!LESSON.answered){ checkEx(ex); } };
  }
  w.appendChild(inp);
  setTimeout(function(){ if(!LESSON.answered){ try{inp.focus();}catch(_){} } var sb=document.getElementById("sayBtn"); if(sb)sb.onclick=function(){speak(ex.w.t);}; var ab=document.getElementById("audioBtn"); if(ab)ab.onclick=function(){speak(ex.w.t);}; },30);
  return w;
}
function exSpeak(ex){ var w=el("div","ex");
  w.innerHTML='<div class="ex-h">'+MASCOT("point",64)+'<div class="bubble">Prononce à voix haute 🎤</div></div><div class="q-word">'+esc(ex.prompt)+' <button class="say" id="spSay">🔊</button></div><div class="speak-hint" id="spHint">Écoute (🔊) puis touche le micro et répète.</div>';
  var mic=el("button","mic-btn"); mic.innerHTML="🎤 Parler";
  mic.onclick=function(){ mic.innerHTML="🎤 …j'écoute"; dictate(function(txt){
    var a=norm(ex.answer),t=norm(txt); var ok=!!t&&(t===a||t.indexOf(a)>=0||a.indexOf(t)>=0);
    var h=document.getElementById("spHint"); if(h) h.textContent=(txt?('Entendu : « '+txt+' »'):"Je n'ai pas bien entendu")+(ok?' ✅ bravo !':' — réessaie, ou passe.');
    LESSON._speakOk=ok; LESSON._can=true; mic.innerHTML=ok?"✅ Bien prononcé":"🎤 Réessayer"; syncMain();
  }, COURSES[S.course].ttsLang); };
  w.appendChild(mic);
  var pass=el("button","btn-ghost skip"); pass.textContent="Passer (sans micro)"; pass.onclick=function(){ LESSON._speakOk=true; LESSON._can=true; syncMain(); }; w.appendChild(pass);
  var qiSp=LESSON.i;
  setTimeout(function(){ var sb=document.getElementById("spSay"); if(sb)sb.onclick=function(){speak(ex.answer);}; if(LESSON&&LESSON.i===qiSp&&!LESSON.answered)speak(ex.answer); },200);
  return w;
}
function syncMain(){ var m=document.getElementById("mainBtn"); if(m)m.disabled=!(LESSON.answered||LESSON._can); }
function checkEx(ex){ var L=LESSON,ok=false,sol="";
  /* palier AVANT la 1re réponse de la leçon (pour fêter un vrai passage de palier à la fin) */
  if(L._lvl0==null){ try{ L._lvl0=currentLevel().cur.code; }catch(_){ L._lvl0=""; } }
  if(ex.kind==="mc"){ ok=L._pick===ex.answer; sol=ex.answer; }
  else if(ex.kind==="match"){ ok=!!L._matchOk; }
  else if(ex.kind==="bank"){ ok=norm(L._bankVal)===norm(ex.answer); sol=ex.answer; }
  else if(ex.kind==="type"){ ok=norm(L._typeVal)===norm(ex.answer); sol=ex.answer; }
  else if(ex.kind==="speak"){ ok=!!L._speakOk; sol=ex.answer; }   // prononciation : indulgent (bien prononcé OU passé)
  L.answered=true; L.ok=ok; L._sol=sol;
  if(ok){ L.correct++; L.combo++; L.comboMax=Math.max(L.comboMax,L.combo); S.today.combo=Math.max(S.today.combo,L.combo);
    if(L.combo>=2)comboSound(L.combo); else beep(true); vibrate(15); if(ex.w&&ex.kind!=="match")_lsSpeak(ex.w.t,L.i,140); }
  else{ L.wrong++; L.combo=0; if(!UNLIMITED){ S.hearts=Math.max(0,S.hearts-1); if(S.hearts<HEART_MAX)S.heartTs=Date.now(); } beep(false); vibrate([30,40,30]); }
  if(ex.w&&ex.w.fr)srsUpdate(ex.w,ok); save(); render();
  setTimeout(function(){ var m=document.querySelector(".lesson .bee-img");
    if(m){ if(ok){ beeAnimate(m,"hop"); if(L.combo>=2)beeSparkles(m,6); } else { beeAnimate(m,"shake"); } }
    /* Le compagnon vivant réagit AUSSI en direct : danse/saute quand c'est bon */
    var cr=document.querySelector(".bee-companion .bee-rig");
    if(cr&&ok){ beeMove(cr, Math.random()<0.5?"dance":"jump", 1900); if(L.combo>=3)beeSparkles(cr,5); }
    /* Bee PARLE : encouragement à voix haute quand il n'y a pas déjà le mot à écouter (priorité au contenu) */
    var wordWillPlay = ok && ex.w && ex.kind!=="match";
    if(ok && !wordWillPlay && L.combo>=2){ speakLang(["Bravo !","Super !","Parfait !","Bien joué !"][L.combo%4],"fr-FR",BEE_VOICE,true); }
    else if(!ok){ /* erreur → Bee EXPLIQUE à voix haute (le sens + ce que voulait dire ta réponse).
      Explication 100% FIABLE issue des données de l'app (jamais inventée). L'IA du prof reste
      disponible À LA DEMANDE (bouton « Demander au prof »), avec un garde anti-invention. */
      var _ex=beeExplain(ex,L);
      setTimeout(function(){ if(LESSON&&LESSON.answered&&LESSON.ok===false&&_ex&&_ex.say) speakLang(_ex.say,"fr-FR",BEE_VOICE,true); },450); } },40);
}
function nextEx(){ var L=LESSON; L._pick=null;L._can=false;L._matchOk=false;L._bankVal=null;L._chosen=null;L._typeVal=null;L._speakOk=false;L._sol=""; L._aiExpl=null; L._profReply=null; L._profLoading=false;
  /* un son de la question PRÉCÉDENTE encore en fabrication/lecture ne doit JAMAIS sortir pendant la suivante */
  ++_ttsReq; try{ if(_ttsAudio){_ttsAudio.pause(); _ttsAudio=null;} if(window.speechSynthesis)speechSynthesis.cancel(); }catch(_){}
  if(!L.ok && !L.placement){ L.ex.push(L.ex[L.i]); } L.answered=false; L.ok=null; L.i++;
  if(L.i>=L.ex.length){ finishLesson(); return; } if(!UNLIMITED && S.hearts<=0){ outOfHearts(); return; } render();
}
function finishLesson(){ var L=LESSON; if(L.placement){ finishPlacement(L); return; } var base=L.exam?25:(L.review?10:15),bonus=L.wrong===0?5:0,combo=Math.max(0,L.comboMax-2); var xp=base+bonus+combo;
  /* VÉRITÉ : les gemmes AFFICHÉES = les gemmes réellement créditées (examen = 8/5, leçon = 3/1) */
  var gems=(L.exam?(L.wrong===0?8:5):(L.wrong===0?3:1));
  S.xp+=xp; S.dailyXP+=xp; histAdd(xp); S.gems+=gems;
  S.today.xp+=xp; if(L.review)S.today.reviews++; else S.today.lessons++; if(L.wrong===0){S.today.perfect++; ls("hadPerfect",true);}
  if(L.heal){ S.hearts=Math.min(HEART_MAX,S.hearts+1); if(S.hearts>=HEART_MAX)S.heartTs=Date.now(); }
  if(L.exam){ var ek="ex"+L.ui; var wasNew=!(S.prog[S.course][ek]>0); S.prog[S.course][ek]=Math.min(5,Math.max(0,S.prog[S.course][ek]||0)+1); if(wasNew)setTimeout(function(){toast("🏆 Examen de l'unité réussi !");},400); }
  else if(L.ui!=null&&L.li!=null&&!L.review){ var k="u"+L.ui+"-"+L.li; /* Math.max : une leçon « ouverte par le test » (-1) vraiment faite passe bien à 1 */ S.prog[S.course][k]=Math.min(5,Math.max(0,S.prog[S.course][k]||0)+1); }
  bumpStreak(); leagueAdd(xp); save(); checkAchv(); checkQuests();
  VIEW="home"; render();
  var m=modal(); m.body.innerHTML='<div class="mascot-mini big">'+MASCOT(L.wrong===0?"party":"wave",120)+'</div><h3>'+(L.wrong===0?(L.exam?"Examen sans faute ! 🏆":"Sans faute ! 🎉"):(L.exam?"Examen réussi ✅":"Leçon terminée ✅"))+'</h3><div class="reward-grid"><div class="rw"><span>⭐</span><b>+'+xp+'</b><i>XP</i></div><div class="rw"><span>🔥</span><b>'+S.streak+'</b><i>Série</i></div><div class="rw"><span>💎</span><b>+'+gems+'</b><i>Gemmes</i></div></div>';
  /* Précision RÉELLE : bonnes réponses et erreurs (les erreurs sont reposées jusqu'à réussite) */
  var acc=el("p","mini fin-acc"); acc.innerHTML='✅ '+L.correct+' bonnes réponses'+(L.wrong>0?' · ❌ '+L.wrong+' erreur'+(L.wrong>1?'s':'')+' corrigée'+(L.wrong>1?'s':''):' — 100 %'); m.body.appendChild(acc);
  /* Passage de palier RÉEL (mots maîtrisés, même source que la barre Coach) — fêté seulement s'il a eu lieu */
  var lvUp=null; try{ if(L._lvl0){ var lvN=currentLevel(),i0=-1,i1=-1; LEVELS.forEach(function(s,i){ if(s.code===L._lvl0)i0=i; if(s.code===lvN.cur.code)i1=i; }); if(i0>=0&&i1>i0) lvUp=lvN.cur; } }catch(_){}
  if(lvUp){ var lu=el("div","lvl-up"); lu.innerHTML='🎓 Nouveau palier : <b>'+esc(lvUp.code)+'</b> !'; m.body.appendChild(lu); }
  var b=el("button","btn-main"); b.textContent="Continuer"; b.onclick=function(){ m.close(); render(); }; m.body.appendChild(b);
  setTimeout(function(){ var mi=m.body.querySelector(".bee-img"); if(mi){ beeAnimate(mi,"hop"); if(L.wrong===0)beeSparkles(mi,10); }
    /* Fin de leçon : le compagnon fait la fête aussi ET Bee annonce le résultat à voix haute */
    var cr=document.querySelector(".bee-companion .bee-rig"); if(cr)beeMove(cr, L.wrong===0?"dance":"jump", 3200); },200);
  /* L'annonce PARLÉE attend 1,2 s : elle ne coupe plus l'audio du dernier mot appris */
  setTimeout(function(){ var me=accMeta(ACC)||{};
    speakLang((L.wrong===0?("Sans faute "+(me.name||"")+" ! Je suis trop fière de toi ! Plus "+xp+" points !")
      :("Leçon terminée ! Plus "+xp+" points. On continue ?"))
      +(lvUp?(" Et tu passes au palier "+lvUp.code+", félicitations !"):""),"fr-FR",BEE_VOICE,true); },1200);
}

/* ---------- Toast / modal ---------- */
function toast(msg){ var t=el("div","toast"); t.textContent=msg; document.body.appendChild(t); setTimeout(function(){t.classList.add("show");},10); setTimeout(function(){t.classList.remove("show");setTimeout(function(){t.remove();},300);},2400); }
function modal(){ var ov=el("div","overlay"),box=el("div","modal"); ov.appendChild(box); document.body.appendChild(ov); setTimeout(function(){ov.classList.add("show");},10); return {body:box,close:function(){ov.classList.remove("show");setTimeout(function(){ov.remove();},250);}}; }

/* ============ Mascotte « Bee » 🐝 (abeille rigolote — création originale KDMC) ============
   Illustrations IA en médaillon rond (bee/*.webp) + repli SVG animé si l'image manque. */
var BEE_IMG={wave:"wave",point:"point",party:"party",read:"read",sad:"read"};
function MASCOT(pose,size){ size=size||100; var f=BEE_IMG[pose]||"wave";
  return '<img class="mascot bee-img pose-'+pose+'" src="bee/'+f+'.webp" width="'+size+'" height="'+size+'" alt="" data-pose="'+pose+'" data-size="'+size+'" onerror="window._beeFallback&&window._beeFallback(this)">';
}
window._beeFallback=function(el){ try{ var d=document.createElement("span"); d.innerHTML=MASCOT_SVG((el.dataset&&el.dataset.pose)||"wave", parseInt(el.dataset&&el.dataset.size,10)||100); el.replaceWith(d.firstChild); }catch(_){} };
function MASCOT_SVG(pose,size){ size=size||100;
  var mouth,eyes,arms="",props="",cls="mascot pose-"+pose;
  var blush='<ellipse cx="30" cy="70" rx="8" ry="5" fill="#ff7eb3" opacity=".55"/><ellipse cx="90" cy="70" rx="8" ry="5" fill="#ff7eb3" opacity=".55"/>';
  var eyeShine='<circle cx="42" cy="54" r="2.6" fill="#fff"/><circle cx="82" cy="54" r="2.6" fill="#fff"/>';
  if(pose==="sad"){ eyes='<g class="eyes"><ellipse cx="45" cy="60" rx="9" ry="10" fill="#fff"/><ellipse cx="79" cy="60" rx="9" ry="10" fill="#fff"/><circle cx="45" cy="64" r="4.5" fill="#20303a"/><circle cx="79" cy="64" r="4.5" fill="#20303a"/></g>';
    mouth='<path d="M50 82 Q62 74 74 82" stroke="#20303a" stroke-width="3.4" fill="none" stroke-linecap="round"/>'; props='<path d="M45 46 Q52 42 58 47" stroke="#20303a" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M66 47 Q72 42 79 46" stroke="#20303a" stroke-width="2.6" fill="none" stroke-linecap="round"/>'; }
  else if(pose==="party"){ eyes='<g class="eyes"><path d="M36 56 Q45 46 54 56" stroke="#20303a" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M70 56 Q79 46 88 56" stroke="#20303a" stroke-width="4" fill="none" stroke-linecap="round"/></g>';
    mouth='<path d="M46 74 Q62 94 78 74 Z" fill="#e8446a"/><path d="M52 80 Q62 88 72 80" fill="#ff9db3"/>'; arms='<g class="arm arm-l up"><ellipse cx="16" cy="58" rx="9" ry="13" fill="url(#body)"/></g><g class="arm arm-r up"><ellipse cx="108" cy="58" rx="9" ry="13" fill="url(#body)"/></g>'; props='<text x="8" y="26" font-size="16">✨</text><text x="96" y="24" font-size="16">🎉</text><text x="52" y="18" font-size="14">⭐</text>'; }
  else if(pose==="read"){ eyes='<g class="eyes"><ellipse cx="45" cy="56" rx="9" ry="10" fill="#fff"/><ellipse cx="79" cy="56" rx="9" ry="10" fill="#fff"/><circle cx="46" cy="59" r="4.5" fill="#20303a"/><circle cx="80" cy="59" r="4.5" fill="#20303a"/></g>'+eyeShine;
    mouth='<path d="M52 74 Q62 82 72 74" stroke="#20303a" stroke-width="3.2" fill="none" stroke-linecap="round"/>'; props='<rect x="40" y="86" width="44" height="16" rx="3" fill="#7c3aed"/><rect x="60" y="86" width="4" height="16" fill="#5b21b6"/>'; }
  else if(pose==="point"){ eyes='<g class="eyes"><ellipse cx="45" cy="54" rx="9.5" ry="11" fill="#fff"/><ellipse cx="79" cy="54" rx="9.5" ry="11" fill="#fff"/><circle cx="48" cy="56" r="4.8" fill="#20303a"/><circle cx="82" cy="56" r="4.8" fill="#20303a"/></g>'+eyeShine;
    mouth='<path d="M50 74 Q62 84 74 74" stroke="#20303a" stroke-width="3.2" fill="none" stroke-linecap="round"/>'; arms='<g class="arm arm-r point"><ellipse cx="110" cy="66" rx="8" ry="12" fill="url(#body)"/><circle cx="118" cy="60" r="5" fill="url(#body)"/></g>'; }
  else { /* wave / idle */ eyes='<g class="eyes"><ellipse cx="45" cy="54" rx="9.5" ry="11" fill="#fff"/><ellipse cx="79" cy="54" rx="9.5" ry="11" fill="#fff"/><circle cx="46" cy="56" r="4.8" fill="#20303a"/><circle cx="80" cy="56" r="4.8" fill="#20303a"/></g>'+eyeShine;
    mouth='<path d="M48 74 Q62 86 76 74" stroke="#20303a" stroke-width="3.4" fill="none" stroke-linecap="round"/>'; arms='<g class="arm arm-l"><ellipse cx="16" cy="66" rx="8" ry="12" fill="url(#body)"/></g><g class="arm arm-r wave"><ellipse cx="108" cy="58" rx="8" ry="12" fill="url(#body)"/></g>'; }
  var wings='<g class="wing wing-l"><ellipse cx="36" cy="26" rx="13" ry="22" fill="#e3f4ff" opacity=".85" stroke="#a8d8f0" stroke-width="2" transform="rotate(-32 36 26)"/></g>'+
            '<g class="wing wing-r"><ellipse cx="88" cy="26" rx="13" ry="22" fill="#e3f4ff" opacity=".85" stroke="#a8d8f0" stroke-width="2" transform="rotate(32 88 26)"/></g>';
  return '<svg class="'+cls+'" viewBox="0 0 124 124" width="'+size+'" height="'+size+'" aria-hidden="true">'+
    '<defs><linearGradient id="body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe066"/><stop offset=".55" stop-color="#ffc93c"/><stop offset="1" stop-color="#f0a41f"/></linearGradient>'+
    '<radialGradient id="belly" cx="50%" cy="62%" r="45%"><stop offset="0" stop-color="#fff6da"/><stop offset="1" stop-color="#fff6da" stop-opacity="0"/></radialGradient>'+
    '<clipPath id="bclip"><path d="M62 12 C88 12 104 34 104 62 C104 92 86 110 62 110 C38 110 20 92 20 62 C20 34 36 12 62 12 Z"/></clipPath></defs>'+
    wings+arms+
    '<g class="body"><ellipse cx="46" cy="112" rx="10" ry="5" fill="#d98f16"/><ellipse cx="78" cy="112" rx="10" ry="5" fill="#d98f16"/>'+
    '<path d="M55 102 L62 122 L69 102 Z" fill="#2b2530"/>'+
    '<path d="M62 12 C88 12 104 34 104 62 C104 92 86 110 62 110 C38 110 20 92 20 62 C20 34 36 12 62 12 Z" fill="url(#body)"/>'+
    '<g clip-path="url(#bclip)" opacity=".92"><path d="M14 62 Q62 74 110 62 L110 76 Q62 88 14 76 Z" fill="#2b2530"/><path d="M14 88 Q62 100 110 88 L110 102 Q62 114 14 102 Z" fill="#2b2530"/></g>'+
    '<ellipse cx="62" cy="70" rx="30" ry="22" fill="url(#belly)" opacity=".6"/>'+
    '<path d="M50 15 Q44 7 37 4" stroke="#2b2530" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="36" cy="4" r="4.5" fill="#2b2530"/>'+
    '<path d="M74 15 Q80 7 87 4" stroke="#2b2530" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="88" cy="4" r="4.5" fill="#2b2530"/>'+
    blush+eyes+eyeShine+mouth+props+'</g></svg>';
}

/* ============ Boot ============ */
function boot(){ app=document.getElementById("app");
  var accs=accounts();
  if(ACC && accs.filter(function(a){return a.id===ACC;}).length){ loadS(); ensureLeague(); }
  else if(accs.length===1){ switchAccount(accs[0].id); }   /* reconnu auto : 1 seul compte → on entre direct (règle Kevin) */
  else if(accs.length>1){ ACC=null; PICK=false; }          /* plusieurs comptes → écran « qui apprend ? » */
  else { ACC=null; PICK=false; }                            /* aucun compte → création */
  render();
  if(window.speechSynthesis){ speechSynthesis.onvoiceschanged=function(){}; speechSynthesis.getVoices(); }
  setInterval(function(){ if(ACC&&VIEW!=="lesson"&&!PICK){ var b=S.hearts; regenHearts(); if(S.hearts!==b&&VIEW==="home")render(); } },20000);
  if("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(function(){});
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot); else boot();
})();
