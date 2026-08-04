/* KDMC Lingua — moteur (vanilla JS, 0 dépendance). Auteur : KDMC. */
(function(){
"use strict";

/* ---------- Utilitaires ---------- */
var APP_VER = "v1.0.0";
var LS = "lingua_";
function esc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
function lg(k,d){ try{ var v=localStorage.getItem(LS+k); return v==null?d:JSON.parse(v); }catch(e){ return d; } }
function ls(k,v){ try{ localStorage.setItem(LS+k, JSON.stringify(v)); }catch(e){} }
function today(){ var d=new Date(); return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate(); }
function shuffle(a){ a=a.slice(); for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i]; a[i]=a[j]; a[j]=t; } return a; }
function sample(arr,n,exclude){ var pool=arr.filter(function(x){ return x!==exclude; }); return shuffle(pool).slice(0,n); }
function norm(s){ return String(s||"").toLowerCase().trim().replace(/[.,!?¿¡]/g,"").replace(/\s+/g," ").replace(/[àâä]/g,"a").replace(/[éèêë]/g,"e").replace(/[îï]/g,"i").replace(/[ôö]/g,"o").replace(/[ûü]/g,"u").replace(/ç/g,"c"); }
function vibrate(ms){ try{ if(navigator.vibrate) navigator.vibrate(ms); }catch(e){} }

/* ---------- État persistant ---------- */
var HEART_MAX = 5, HEART_REGEN_MS = 30*60*1000; /* 1 cœur / 30 min */
var S = {
  course: lg("course", null),           // "en"|"it"|"es"
  hearts: lg("hearts", HEART_MAX),
  heartTs: lg("heartTs", Date.now()),    // dernier calcul de régén
  gems: lg("gems", 0),
  xp: lg("xp", 0),
  streak: lg("streak", 0),
  lastDay: lg("lastDay", null),
  dailyXP: lg("dailyXP", 0),
  dailyDay: lg("dailyDay", today()),
  goal: lg("goal", 30),
  prog: lg("prog", {}),                  // prog[course] = { "u-l": crowns }
  srs: lg("srs", {}),                    // srs[course][mot] = {ease,int,due,reps}
  sound: lg("sound", true),
  league: lg("league", null),
  leagueWeek: lg("leagueWeek", null),
  name: lg("name", "Toi")
};
function save(){ ["course","hearts","heartTs","gems","xp","streak","lastDay","dailyXP","dailyDay","goal","prog","srs","sound","league","leagueWeek","name"].forEach(function(k){ ls(k, S[k]); }); }

/* Régénération des cœurs dans le temps */
function regenHearts(){
  if(S.hearts>=HEART_MAX){ S.heartTs=Date.now(); return; }
  var now=Date.now(), gained=Math.floor((now-S.heartTs)/HEART_REGEN_MS);
  if(gained>0){ S.hearts=Math.min(HEART_MAX, S.hearts+gained); S.heartTs = S.hearts>=HEART_MAX ? now : S.heartTs + gained*HEART_REGEN_MS; save(); }
}
function heartTimeLeft(){ if(S.hearts>=HEART_MAX) return 0; return HEART_REGEN_MS-(Date.now()-S.heartTs); }

/* ---------- Streak / jour ---------- */
function checkDay(){
  var t=today();
  if(S.dailyDay!==t){ S.dailyDay=t; S.dailyXP=0; }
  save();
}
function bumpStreak(){
  var t=today();
  if(S.lastDay===t) return;
  var y=new Date(); y.setDate(y.getDate()-1); var yd=y.getFullYear()+"-"+(y.getMonth()+1)+"-"+y.getDate();
  if(S.lastDay===yd) S.streak+=1;
  else S.streak=1;
  S.lastDay=t; save();
}

/* ---------- Révision espacée (SM-2 allégé) ---------- */
function srsKey(w){ return w.fr+"|"+w.t; }
function srsGet(c){ if(!S.srs[c]) S.srs[c]={}; return S.srs[c]; }
function srsUpdate(w, correct){
  var db=srsGet(S.course), k=srsKey(w), it=db[k]||{ease:2.5,int:0,reps:0,due:0};
  if(correct){ it.reps++; it.ease=Math.max(1.3, it.ease+0.1); it.int = it.reps<=1?1: it.reps===2?3: Math.round(it.int*it.ease); }
  else { it.reps=0; it.ease=Math.max(1.3, it.ease-0.2); it.int=0; }
  it.due = Date.now()+it.int*24*3600*1000;
  db[k]=it; save();
}
function dueWords(){
  var c=COURSES[S.course]; if(!c) return [];
  var db=srsGet(S.course), out=[], now=Date.now();
  c.units.forEach(function(u){ u.lessons.forEach(function(l){ l.words.forEach(function(w){
    var it=db[srsKey(w)]; if(it && it.due<=now && it.reps>0) out.push(w);
  }); }); });
  return out;
}

/* ---------- Ligue (simulation locale, pas de tiers) ---------- */
var BOT_NAMES=["Léa","Marco","Sofia","Yanis","Nora","Diego","Emma","Luca","Zoé","Tom","Inès","Théo","Mia","Ravi","Ana"];
function weekId(){ var d=new Date(); var onejan=new Date(d.getFullYear(),0,1); var wk=Math.ceil((((d-onejan)/86400000)+onejan.getDay()+1)/7); return d.getFullYear()+"-W"+wk; }
function ensureLeague(){
  var wk=weekId();
  if(S.leagueWeek!==wk || !S.league){
    S.leagueWeek=wk;
    var bots=shuffle(BOT_NAMES).slice(0,9).map(function(n){ return {name:n, xp:Math.floor(Math.random()*200), bot:true}; });
    S.league={ you:0, bots:bots, div:"Bronze" }; save();
  }
}
function leagueAdd(xp){ ensureLeague(); S.league.you+=xp; S.league.bots.forEach(function(b){ if(Math.random()<0.6) b.xp+=Math.floor(Math.random()*xp); }); save(); }
function leagueRows(){
  ensureLeague();
  var rows=S.league.bots.map(function(b){ return {name:b.name, xp:b.xp, you:false}; });
  rows.push({name:S.name, xp:S.league.you, you:true});
  rows.sort(function(a,b){ return b.xp-a.xp; });
  return rows;
}

/* ---------- Génération d'une leçon (liste d'exercices) ---------- */
function allWords(c){ var out=[]; COURSES[c].units.forEach(function(u){ u.lessons.forEach(function(l){ out=out.concat(l.words); }); }); return out; }
function buildLesson(unitIdx, lessonIdx, reviewWords){
  var c=COURSES[S.course], pool=allWords(S.course);
  var words = reviewWords || c.units[unitIdx].lessons[lessonIdx].words.slice();
  var phrases = reviewWords ? [] : (c.units[unitIdx].lessons[lessonIdx].phrases||[]);
  var ex=[];
  shuffle(words).forEach(function(w,i){
    var type = i%3===0 ? "mc_t" : (i%3===1 ? "mc_fr" : "listen");
    if(type==="listen" && !S.sound) type="mc_t";
    ex.push(makeMC(w, pool, type));
  });
  // paires
  if(words.length>=4) ex.splice(1,0, makeMatch(shuffle(words).slice(0,Math.min(5,words.length))));
  // phrases → banque de mots
  phrases.forEach(function(p){ ex.push(makeBank(p, pool)); });
  return shuffle(ex).slice(0, Math.min(ex.length, 11));
}
function makeMC(w, pool, mode){
  // mode mc_t: fr affiché, choisir cible ; mc_fr: cible affichée, choisir fr ; listen: audio → choisir cible
  var asTarget = (mode!=="mc_fr");
  var correct = asTarget ? w.t : w.fr;
  var distract = sample(pool, 3, w).map(function(x){ return asTarget?x.t:x.fr; });
  var opts = shuffle([correct].concat(distract));
  return { kind:"mc", mode:mode, w:w, prompt: mode==="mc_fr"?w.t:w.fr, answer:correct, opts:opts, audio: mode==="listen" };
}
function makeMatch(words){
  return { kind:"match", w:words[0], pairs: words.map(function(w){ return {fr:w.fr, t:w.t}; }) };
}
function makeBank(p, pool){
  var toks = p.t.split(" ");
  var extra = sample(allWords(S.course),3).map(function(x){ return x.t.split(" ")[0]; });
  var bank = shuffle(toks.concat(extra));
  return { kind:"bank", w:{fr:p.fr,t:p.t}, prompt:p.fr, answer:p.t, tokens:toks, bank:bank };
}

/* ---------- TTS ---------- */
function speak(text){
  if(!S.sound) return;
  try{
    var u=new SpeechSynthesisUtterance(text);
    u.lang=COURSES[S.course].ttsLang; u.rate=0.9;
    var vs=speechSynthesis.getVoices().filter(function(v){ return v.lang && v.lang.indexOf(COURSES[S.course].ttsLang.split("-")[0])===0; });
    if(vs[0]) u.voice=vs[0];
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  }catch(e){}
}

/* ---------- Sons (WebAudio, corrects/faux — pas de fichier tiers) ---------- */
var AC=null;
function beep(ok){
  if(!S.sound) return;
  try{ AC=AC||new (window.AudioContext||window.webkitAudioContext)(); var o=AC.createOscillator(),g=AC.createGain();
    o.connect(g); g.connect(AC.destination); o.type="sine";
    if(ok){ o.frequency.setValueAtTime(660,AC.currentTime); o.frequency.setValueAtTime(880,AC.currentTime+0.1);} else { o.frequency.setValueAtTime(200,AC.currentTime); }
    g.gain.setValueAtTime(0.15,AC.currentTime); g.gain.exponentialRampToValueAtTime(0.001,AC.currentTime+0.3);
    o.start(); o.stop(AC.currentTime+0.3);
  }catch(e){}
}

/* ============================================================
   ROUTAGE / RENDU
   ============================================================ */
var app;
var VIEW="home", LESSON=null;

function render(){
  regenHearts(); checkDay();
  app.innerHTML="";
  if(!S.course){ app.appendChild(vPickCourse()); return; }
  if(VIEW==="lesson"){ app.appendChild(vLesson()); return; }
  app.appendChild(vTopbar());
  if(VIEW==="home") app.appendChild(vHome());
  else if(VIEW==="review") app.appendChild(vReview());
  else if(VIEW==="league") app.appendChild(vLeague());
  else if(VIEW==="profile") app.appendChild(vProfile());
  app.appendChild(vTabbar());
}
function go(v){ VIEW=v; window.scrollTo(0,0); render(); }

/* ---------- Choix de la langue ---------- */
function vPickCourse(){
  var d=el("div","screen center");
  d.innerHTML='<div class="mascot-wrap">'+MASCOT("wave")+'</div>'+
    '<h1 class="brand">KDMC <span>Lingua</span></h1>'+
    '<p class="sub">Apprends une langue, 5 minutes par jour 🚀</p>';
  var list=el("div","course-pick");
  Object.keys(COURSES).forEach(function(id){
    var c=COURSES[id], b=el("button","course-card");
    b.innerHTML='<span class="flag">'+c.drapeau+'</span><span class="cnom">'+c.nom+'</span><span class="arrow">›</span>';
    b.onclick=function(){ S.course=id; if(!S.prog[id])S.prog[id]={}; save(); go("home"); };
    list.appendChild(b);
  });
  d.appendChild(list);
  var note=el("div","legal-note"); note.textContent="Application originale KDMC — non affiliée à un tiers.";
  d.appendChild(note);
  return d;
}

/* ---------- Topbar (stats) ---------- */
function vTopbar(){
  var t=el("div","topbar");
  var c=COURSES[S.course];
  t.innerHTML=
    '<button class="tb-flag" id="tbFlag" title="Changer de langue">'+c.drapeau+'</button>'+
    '<div class="tb-stat streak" title="Série"><span>🔥</span>'+S.streak+'</div>'+
    '<div class="tb-stat gems" title="Gemmes"><span>💎</span>'+S.gems+'</div>'+
    '<div class="tb-stat hearts" title="Vies"><span>❤️</span>'+S.hearts+'</div>';
  t.querySelector("#tbFlag").onclick=function(){ if(confirm("Changer de langue ?")){ S.course=null; save(); render(); } };
  return t;
}

/* ---------- Accueil : arbre de leçons ---------- */
function unitDone(ui,li){ return (S.prog[S.course]["u"+ui+"-"+li]||0); }
function unitUnlocked(ui,li){
  if(ui===0&&li===0) return true;
  var c=COURSES[S.course], pu=ui, pl=li-1;
  if(pl<0){ pu=ui-1; pl=c.units[pu].lessons.length-1; }
  return unitDone(pu,pl)>0;
}
function vHome(){
  var wrap=el("div","screen tree");
  // objectif du jour
  var goalPct=Math.min(100, Math.round(S.dailyXP/S.goal*100));
  var goal=el("div","goal-card");
  goal.innerHTML='<div class="goal-top"><b>🎯 Objectif du jour</b><span>'+S.dailyXP+' / '+S.goal+' XP</span></div>'+
    '<div class="bar"><div class="bar-fill" style="width:'+goalPct+'%"></div></div>'+
    (goalPct>=100?'<div class="goal-done">✅ Objectif atteint, bravo !</div>':'');
  wrap.appendChild(goal);

  var c=COURSES[S.course];
  c.units.forEach(function(u,ui){
    var sec=el("div","unit"); sec.style.setProperty("--uc",u.couleur);
    var crowns=0, total=u.lessons.length;
    u.lessons.forEach(function(_,li){ crowns+=unitDone(ui,li); });
    sec.innerHTML='<div class="unit-head"><div><div class="unit-k">UNITÉ '+(ui+1)+'</div><div class="unit-t">'+esc(u.titre)+'</div></div>'+
      '<div class="unit-crowns">👑 '+crowns+'/'+total+'</div></div>';
    var path=el("div","path");
    u.lessons.forEach(function(l,li){
      var done=unitDone(ui,li), unlocked=unitUnlocked(ui,li);
      var node=el("button","node"+(done>0?" done":"")+(unlocked?"":" locked"));
      node.style.marginLeft=(Math.sin(li*1.1)*54+54)+"px";
      node.innerHTML= done>0? '<span class="ncrown">👑</span>' : (unlocked?'⭐':'🔒');
      node.title=esc(l.titre);
      if(unlocked){ node.onclick=function(){ startLesson(ui,li); }; }
      else { node.onclick=function(){ toast("Termine la leçon précédente d'abord 🔒"); }; }
      var lab=el("div","node-lab"); lab.textContent=l.titre;
      var cell=el("div","cell"); cell.appendChild(node); cell.appendChild(lab);
      path.appendChild(cell);
    });
    sec.appendChild(path);
    wrap.appendChild(sec);
  });
  return wrap;
}

/* ---------- Révision ---------- */
function vReview(){
  var d=el("div","screen"); var due=dueWords();
  d.innerHTML='<h2 class="ttl">🧠 Révision</h2>';
  var card=el("div","review-card");
  card.innerHTML='<div class="mascot-mini">'+MASCOT("read")+'</div>'+
    '<p>'+(due.length? '<b>'+due.length+'</b> mot(s) à réviser aujourd\'hui.' : 'Rien à réviser pour l\'instant — reviens plus tard ! ')+'</p>';
  var b=el("button","btn-main"); b.textContent= due.length? "Réviser maintenant" : "Révision libre";
  b.onclick=function(){ var rw= due.length? due.slice(0,10) : shuffle(allWords(S.course)).slice(0,10); startLesson(null,null,rw); };
  card.appendChild(b); d.appendChild(card);
  return d;
}

/* ---------- Ligue ---------- */
function vLeague(){
  var d=el("div","screen"); ensureLeague();
  d.innerHTML='<h2 class="ttl">🏆 Ligue Bronze</h2><p class="sub2">Classement de la semaine — gagne de l\'XP pour monter !</p>';
  var rows=leagueRows(), list=el("div","lb");
  rows.forEach(function(r,i){
    var row=el("div","lb-row"+(r.you?" me":"")+(i<3?" top":""));
    row.innerHTML='<span class="rk">'+(i+1)+'</span><span class="rn">'+(i===0?"🥇 ":i===1?"🥈 ":i===2?"🥉 ":"")+esc(r.name)+(r.you?" (toi)":"")+'</span><span class="rx">'+r.xp+' XP</span>';
    list.appendChild(row);
  });
  d.appendChild(list);
  return d;
}

/* ---------- Profil ---------- */
function vProfile(){
  var d=el("div","screen");
  var c=COURSES[S.course], totLessons=0, done=0;
  c.units.forEach(function(u,ui){ u.lessons.forEach(function(_,li){ totLessons++; if(unitDone(ui,li)>0)done++; }); });
  d.innerHTML='<div class="profile-head">'+MASCOT("wave")+'<h2 contenteditable="true" id="pname" class="pname">'+esc(S.name)+'</h2></div>'+
    '<div class="stat-grid">'+
      '<div class="sg"><span>🔥</span><b>'+S.streak+'</b><i>Série</i></div>'+
      '<div class="sg"><span>⭐</span><b>'+S.xp+'</b><i>XP total</i></div>'+
      '<div class="sg"><span>💎</span><b>'+S.gems+'</b><i>Gemmes</i></div>'+
      '<div class="sg"><span>👑</span><b>'+done+'/'+totLessons+'</b><i>Leçons</i></div>'+
    '</div>'+
    '<div class="settings">'+
      '<label class="row"><span>🔊 Son & voix</span><input type="checkbox" id="setSound" '+(S.sound?"checked":"")+'></label>'+
      '<label class="row"><span>🎯 Objectif quotidien</span><select id="setGoal">'+
        [10,20,30,50].map(function(g){ return '<option value="'+g+'"'+(S.goal===g?" selected":"")+'>'+g+' XP</option>'; }).join("")+'</select></label>'+
      '<button class="row danger" id="resetBtn">♻️ Réinitialiser ma progression</button>'+
    '</div>'+
    '<div class="ver">KDMC Lingua '+APP_VER+' · app originale</div>';
  d.querySelector("#pname").onblur=function(){ S.name=(this.textContent||"Toi").slice(0,24); save(); };
  d.querySelector("#setSound").onchange=function(){ S.sound=this.checked; save(); };
  d.querySelector("#setGoal").onchange=function(){ S.goal=parseInt(this.value,10); save(); toast("Objectif : "+S.goal+" XP/jour"); };
  d.querySelector("#resetBtn").onclick=function(){ if(confirm("Effacer TOUTE ta progression ?")){ ["hearts","gems","xp","streak","lastDay","dailyXP","prog","srs","league"].forEach(function(k){ localStorage.removeItem(LS+k); }); location.reload(); } };
  return d;
}

/* ---------- Barre d'onglets ---------- */
function vTabbar(){
  var t=el("div","tabbar");
  [["home","🏠","Accueil"],["review","🧠","Réviser"],["league","🏆","Ligue"],["profile","🙂","Profil"]].forEach(function(x){
    var b=el("button","tab"+(VIEW===x[0]?" active":"")); b.innerHTML='<span>'+x[1]+'</span><i>'+x[2]+'</i>';
    b.onclick=function(){ go(x[0]); }; t.appendChild(b);
  });
  return t;
}

/* ============================================================
   LEÇON (le cœur du jeu)
   ============================================================ */
function startLesson(ui,li,reviewWords){
  if(S.hearts<=0){ outOfHearts(); return; }
  LESSON={ ui:ui, li:li, review:!!reviewWords, ex:buildLesson(ui,li,reviewWords), i:0, wrong:0, correctCount:0, mistakes:[], answered:false, ok:null };
  VIEW="lesson"; window.scrollTo(0,0); render();
}
function outOfHearts(){
  VIEW="home"; render();
  var m=modal();
  m.body.innerHTML='<div class="mascot-mini">'+MASCOT("sad")+'</div><h3>Plus de vies ❤️</h3>'+
    '<p>Tes cœurs reviennent tout seuls (1 toutes les 30 min).</p>';
  var b1=el("button","btn-main"); b1.textContent="Recharger avec 💎 (350)";
  b1.onclick=function(){ if(S.gems>=350){ S.gems-=350; S.hearts=HEART_MAX; S.heartTs=Date.now(); save(); m.close(); render(); } else toast("Pas assez de gemmes 💎"); };
  var b2=el("button","btn-ghost"); b2.textContent="Réviser gratuitement (regagne des cœurs)";
  b2.onclick=function(){ m.close(); var rw=shuffle(allWords(S.course)).slice(0,8); LESSON={ ui:null,li:null,review:true,heal:true,ex:buildLesson(null,null,rw),i:0,wrong:0,correctCount:0,mistakes:[],answered:false,ok:null}; VIEW="lesson"; render(); };
  m.body.appendChild(b1); m.body.appendChild(b2);
}

function vLesson(){
  var d=el("div","lesson");
  var L=LESSON, ex=L.ex[L.i];
  var pct=Math.round(L.i/L.ex.length*100);
  // Barre haut : quitter + progression + cœurs
  var top=el("div","lesson-top");
  top.innerHTML='<button class="quit" id="quitB">✕</button>'+
    '<div class="bar big"><div class="bar-fill" style="width:'+pct+'%"></div></div>'+
    '<div class="lh">❤️ '+S.hearts+'</div>';
  top.querySelector("#quitB").onclick=function(){ if(confirm("Quitter la leçon ? La progression de cette leçon sera perdue.")){ VIEW="home"; render(); } };
  d.appendChild(top);

  var body=el("div","lesson-body");
  if(ex.kind==="mc") body.appendChild(exMC(ex));
  else if(ex.kind==="match") body.appendChild(exMatch(ex));
  else if(ex.kind==="bank") body.appendChild(exBank(ex));
  d.appendChild(body);

  // Pied : bouton vérifier / continuer + feedback
  var foot=el("div","lesson-foot"+(L.answered?(L.ok?" ok":" ko"):""));
  if(L.answered){
    var fb=el("div","feedback");
    fb.innerHTML= L.ok? '<b>✅ Correct !</b>' : '<b>❌ Bonne réponse :</b> '+esc(L._solution||"");
    foot.appendChild(fb);
  }
  var main=el("button","btn-main check");
  main.id="mainBtn";
  main.textContent = L.answered ? "Continuer" : "Vérifier";
  main.disabled = !L.answered && !L._canCheck;
  main.onclick = function(){ L.answered ? nextEx() : checkEx(ex); };
  foot.appendChild(main);
  d.appendChild(foot);
  return d;
}

/* --- Exercice QCM --- */
function exMC(ex){
  var w=el("div","ex");
  var q = ex.audio
    ? '<div class="q-audio" id="audioBtn">🔊<span>Touche pour écouter</span></div>'
    : '<div class="q-word">'+esc(ex.prompt)+' <button class="say" id="sayBtn">🔊</button></div>';
  var titre = ex.audio ? "Que dis-je ?" : (ex.mode==="mc_fr" ? "Traduis en français" : "Traduis ce mot");
  w.innerHTML='<div class="ex-h">'+MASCOT("point")+'<div class="bubble">'+titre+'</div></div>'+q;
  if(ex.audio) setTimeout(function(){ speak(ex.w.t); },250);
  var opts=el("div","opts");
  ex.opts.forEach(function(o){
    var b=el("button","opt"); b.textContent=o;
    b.onclick=function(){ if(LESSON.answered)return; opts.querySelectorAll(".opt").forEach(function(x){ x.classList.remove("sel"); }); b.classList.add("sel"); LESSON._pick=o; LESSON._canCheck=true; syncMain(); };
    opts.appendChild(b);
  });
  w.appendChild(opts);
  setTimeout(function(){
    var sb=document.getElementById("sayBtn"); if(sb) sb.onclick=function(){ speak(ex.w.t); };
    var ab=document.getElementById("audioBtn"); if(ab) ab.onclick=function(){ speak(ex.w.t); };
  },0);
  return w;
}

/* --- Exercice associer les paires --- */
function exMatch(ex){
  var w=el("div","ex");
  w.innerHTML='<div class="ex-h">'+MASCOT("point")+'<div class="bubble">Associe les paires</div></div>';
  var grid=el("div","match-grid");
  var left=shuffle(ex.pairs.map(function(p){ return {txt:p.fr,key:p.fr,side:"L"}; }));
  var right=shuffle(ex.pairs.map(function(p){ return {txt:p.t,key:p.fr,side:"R"}; }));
  var colL=el("div","mcol"), colR=el("div","mcol");
  LESSON._match={sel:null, done:0, need:ex.pairs.length};
  function mkBtn(item){
    var b=el("button","mtile"); b.textContent=item.txt; b.dataset.key=item.key; b.dataset.side=item.side;
    b.onclick=function(){
      if(b.classList.contains("matched"))return;
      var sel=LESSON._match.sel;
      if(!sel){ clearSel(); b.classList.add("msel"); LESSON._match.sel=b; return; }
      if(sel===b){ b.classList.remove("msel"); LESSON._match.sel=null; return; }
      if(sel.dataset.side===b.dataset.side){ clearSel(); b.classList.add("msel"); LESSON._match.sel=b; return; }
      if(sel.dataset.key===b.dataset.key){
        sel.classList.remove("msel"); sel.classList.add("matched"); b.classList.add("matched");
        LESSON._match.sel=null; LESSON._match.done++; beep(true);
        if(LESSON._match.done>=LESSON._match.need){ LESSON._canCheck=true; LESSON._matchOk=true; syncMain(); }
      } else {
        b.classList.add("mbad"); sel.classList.add("mbad"); var s=sel;
        setTimeout(function(){ b.classList.remove("mbad","msel"); s.classList.remove("mbad","msel"); },500);
        LESSON._match.sel=null; beep(false);
      }
    };
    return b;
  }
  function clearSel(){ if(LESSON._match.sel){ LESSON._match.sel.classList.remove("msel"); LESSON._match.sel=null; } }
  left.forEach(function(it){ colL.appendChild(mkBtn(it)); });
  right.forEach(function(it){ colR.appendChild(mkBtn(it)); });
  grid.appendChild(colL); grid.appendChild(colR); w.appendChild(grid);
  return w;
}

/* --- Exercice banque de mots (phrase) --- */
function exBank(ex){
  var w=el("div","ex");
  w.innerHTML='<div class="ex-h">'+MASCOT("point")+'<div class="bubble">Traduis cette phrase</div></div>'+
    '<div class="q-word">'+esc(ex.prompt)+'</div>';
  var answer=el("div","bank-answer"); answer.id="bankAns";
  var bank=el("div","bank-src");
  LESSON._chosen=[];
  function refresh(){
    answer.innerHTML=""; LESSON._chosen.forEach(function(tok,idx){
      var t=el("button","tok"); t.textContent=tok; t.onclick=function(){ LESSON._chosen.splice(idx,1); refresh(); };
      answer.appendChild(t);
    });
    bank.querySelectorAll(".tok").forEach(function(b){ b.classList.remove("used"); });
    // marque utilisés
    var used={}; LESSON._chosen.forEach(function(t){ used[t]=(used[t]||0)+1; });
    var seen={};
    bank.querySelectorAll(".tok").forEach(function(b){ var t=b.textContent; seen[t]=(seen[t]||0)+1; if(seen[t]<=(used[t]||0)) b.classList.add("used"); });
    LESSON._canCheck=LESSON._chosen.length>0; LESSON._bankVal=LESSON._chosen.join(" "); syncMain();
  }
  ex.bank.forEach(function(tok){
    var b=el("button","tok"); b.textContent=tok;
    b.onclick=function(){ if(b.classList.contains("used"))return; LESSON._chosen.push(tok); refresh(); };
    bank.appendChild(b);
  });
  w.appendChild(answer); w.appendChild(bank); refresh();
  return w;
}

function syncMain(){ var m=document.getElementById("mainBtn"); if(m) m.disabled=!(LESSON.answered||LESSON._canCheck); }

/* --- Vérification --- */
function checkEx(ex){
  var L=LESSON, ok=false, solution="";
  if(ex.kind==="mc"){ ok = L._pick===ex.answer; solution=ex.answer; }
  else if(ex.kind==="match"){ ok = !!L._matchOk; solution=""; }
  else if(ex.kind==="bank"){ ok = norm(L._bankVal)===norm(ex.answer); solution=ex.answer; }
  L.answered=true; L.ok=ok; L._solution=solution;
  if(ok){ L.correctCount++; beep(true); vibrate(15); if(ex.audio||ex.kind==="mc") setTimeout(function(){ if(ex.w) speak(ex.w.t); },150); }
  else { L.wrong++; S.hearts=Math.max(0,S.hearts-1); if(S.hearts<HEART_MAX) S.heartTs=Date.now(); beep(false); vibrate([30,40,30]); L.mistakes.push(ex); }
  if(ex.w && ex.w.fr) srsUpdate(ex.w, ok);
  save(); render();
}
function nextEx(){
  var L=LESSON;
  // reset flags de l'exercice
  L._pick=null; L._canCheck=false; L._matchOk=false; L._bankVal=null; L._chosen=null; L._solution="";
  if(!L.ok){ L.ex.push(L.ex[L.i]); } // ré-injecte l'exercice raté à la fin
  L.answered=false; L.ok=null; L.i++;
  if(L.i>=L.ex.length){ finishLesson(); return; }
  if(S.hearts<=0){ outOfHearts(); return; }
  render();
}
function finishLesson(){
  var L=LESSON;
  var base = L.review?10:15;
  var xp = base + (L.wrong===0?5:0);
  S.xp+=xp; S.dailyXP+=xp; S.gems+= (L.wrong===0?3:1);
  if(L.heal){ S.hearts=Math.min(HEART_MAX,S.hearts+1); if(S.hearts>=HEART_MAX)S.heartTs=Date.now(); }
  if(L.ui!=null && !L.review){
    var k="u"+L.ui+"-"+L.li, cur=S.prog[S.course][k]||0;
    S.prog[S.course][k]=Math.min(5,cur+1);
  }
  bumpStreak(); leagueAdd(xp); save();
  VIEW="home";
  render();
  var m=modal();
  m.body.innerHTML='<div class="mascot-mini big">'+MASCOT(L.wrong===0?"party":"wave")+'</div>'+
    '<h3>'+(L.wrong===0?"Sans faute ! 🎉":"Leçon terminée ✅")+'</h3>'+
    '<div class="reward-grid">'+
      '<div class="rw"><span>⭐</span><b>+'+xp+'</b><i>XP</i></div>'+
      '<div class="rw"><span>🔥</span><b>'+S.streak+'</b><i>Série</i></div>'+
      '<div class="rw"><span>💎</span><b>+'+(L.wrong===0?3:1)+'</b><i>Gemmes</i></div>'+
    '</div>';
  var b=el("button","btn-main"); b.textContent="Continuer"; b.onclick=function(){ m.close(); render(); };
  m.body.appendChild(b);
}

/* ---------- Composants génériques ---------- */
function el(tag,cls){ var e=document.createElement(tag); if(cls)e.className=cls; return e; }
function toast(msg){
  var t=el("div","toast"); t.textContent=msg; document.body.appendChild(t);
  setTimeout(function(){ t.classList.add("show"); },10);
  setTimeout(function(){ t.classList.remove("show"); setTimeout(function(){ t.remove(); },300); },2200);
}
function modal(){
  var ov=el("div","overlay"); var box=el("div","modal"); ov.appendChild(box);
  document.body.appendChild(ov); setTimeout(function(){ ov.classList.add("show"); },10);
  return { body:box, close:function(){ ov.classList.remove("show"); setTimeout(function(){ ov.remove(); },250); } };
}

/* ---------- Mascotte originale « Lino » (SVG, création KDMC) ---------- */
function MASCOT(pose){
  // Personnage original : petite créature ronde façon goutte, couleurs teal/violet. Aucune ressemblance avec un tiers.
  var eyes = pose==="party"||pose==="wave" ? '<circle cx="34" cy="46" r="6" fill="#fff"/><circle cx="66" cy="46" r="6" fill="#fff"/><circle cx="35" cy="47" r="3" fill="#1e293b"/><circle cx="67" cy="47" r="3" fill="#1e293b"/>'
    : pose==="sad" ? '<circle cx="34" cy="48" r="6" fill="#fff"/><circle cx="66" cy="48" r="6" fill="#fff"/><circle cx="34" cy="50" r="3" fill="#1e293b"/><circle cx="66" cy="50" r="3" fill="#1e293b"/>'
    : '<circle cx="34" cy="46" r="6" fill="#fff"/><circle cx="66" cy="46" r="6" fill="#fff"/><circle cx="36" cy="46" r="3" fill="#1e293b"/><circle cx="68" cy="46" r="3" fill="#1e293b"/>';
  var mouth = pose==="sad" ? '<path d="M40 66 Q50 60 60 66" stroke="#1e293b" stroke-width="3" fill="none" stroke-linecap="round"/>'
    : pose==="party" ? '<path d="M38 62 Q50 76 62 62 Z" fill="#e11d48"/>'
    : '<path d="M40 62 Q50 72 60 62" stroke="#1e293b" stroke-width="3" fill="none" stroke-linecap="round"/>';
  var extra = pose==="party" ? '<text x="14" y="24" font-size="16">✨</text><text x="76" y="24" font-size="16">🎉</text>' :
              pose==="read" ? '<rect x="30" y="70" width="40" height="14" rx="3" fill="#7c3aed"/>' :
              pose==="point" ? '<circle cx="86" cy="60" r="7" fill="#12b981"/>' : '';
  return '<svg class="mascot" viewBox="0 0 100 100" width="96" height="96" aria-hidden="true">'+
    '<defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2dd4bf"/><stop offset="1" stop-color="#12b981"/></linearGradient></defs>'+
    '<path d="M50 8 C74 8 86 30 86 52 C86 76 70 92 50 92 C30 92 14 76 14 52 C14 30 26 8 50 8 Z" fill="url(#g1)"/>'+
    '<ellipse cx="50" cy="30" rx="20" ry="10" fill="#fff" opacity="0.15"/>'+
    eyes+mouth+extra+'</svg>';
}

/* ---------- Boot ---------- */
function boot(){
  app=document.getElementById("app");
  ensureLeague();
  render();
  // charge les voix TTS
  if(window.speechSynthesis){ speechSynthesis.onvoiceschanged=function(){}; speechSynthesis.getVoices(); }
  // régénère les cœurs en direct
  setInterval(function(){ if(VIEW!=="lesson"){ var before=S.hearts; regenHearts(); if(S.hearts!==before && (VIEW==="home")) render(); } },20000);
  // SW
  if("serviceWorker" in navigator){ navigator.serviceWorker.register("sw.js").catch(function(){}); }
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot); else boot();
})();
