/* KDMC Lingua — moteur v2 (multi-comptes, succès, quêtes, gel, combo, dico).
   Vanilla JS, 0 dépendance. Auteur : KDMC. */
(function(){
"use strict";
var APP_VER="v2.3.0";

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
function norm(s){ return String(s||"").toLowerCase().trim().replace(/[.,!?¿¡'’]/g,"").replace(/\s+/g," ").replace(/[àâä]/g,"a").replace(/[éèêë]/g,"e").replace(/[îï]/g,"i").replace(/[ôö]/g,"o").replace(/[ûü]/g,"u").replace(/ç/g,"c").replace(/ß/g,"ss"); }
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
  S.sound=lg("sound",true);
  S.league=lg("league",null); S.leagueWeek=lg("leagueWeek",null);
  S.achv=lg("achv",{}); S.words=lg("words",{});        // words[course][key]=true (mots vus)
  S.today=lg("today",{day:today(),xp:0,lessons:0,reviews:0,perfect:0,combo:0});
  S.qClaim=lg("qClaim",{}); S.qDay=lg("qDay",today());
}
function save(){ ["course","hearts","heartTs","gems","xp","streak","lastDay","freeze","dailyXP","dailyDay","goal","prog","srs","sound","league","leagueWeek","achv","words","today","qClaim","qDay"].forEach(function(k){ ls(k,S[k]); }); }

/* ============ Comptes (CRUD) ============ */
var AVATARS=["🦊","🐼","🐨","🦁","🐵","🐸","🦄","🐙","🐯","🐧","🐷","🐰","🐻","🐮","🐲","🦖"];
function accounts(){ return gg("accounts",[]); }
function createAccount(name,avatar){
  var id="acc_"+Date.now().toString(36)+Math.floor(Math.random()*1e4).toString(36);
  var a=accounts(); a.push({id:id,name:name||"Joueur",avatar:avatar||"🦊",created:Date.now()}); gs("accounts",a);
  return id;
}
function switchAccount(id){ ACC=id; gs("current",id); loadS(); ensureLeague(); PICK=false; }
function deleteAccount(id){
  gs("accounts", accounts().filter(function(x){return x.id!==id;}));
  Object.keys(localStorage).forEach(function(k){ if(k.indexOf("lingua_a_"+id+"_")===0) localStorage.removeItem(k); });
  if(ACC===id){ ACC=null; gs("current",null); }
}
function accMeta(id){ return accounts().filter(function(a){return a.id===id;})[0]; }

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
var BOTS=["Léa","Marco","Sofia","Yanis","Nora","Diego","Emma","Luca","Zoé","Tom","Inès","Théo","Mia","Ravi","Ana","Nils","Ela","Bruno"];
function weekId(){ var d=new Date(),o=new Date(d.getFullYear(),0,1),w=Math.ceil((((d-o)/864e5)+o.getDay()+1)/7); return d.getFullYear()+"-W"+w; }
function ensureLeague(){ var wk=weekId(); if(S.leagueWeek!==wk||!S.league){ S.leagueWeek=wk;
  S.league={you:0,bots:shuffle(BOTS).slice(0,9).map(function(n){return {name:n,xp:Math.floor(Math.random()*200)};})}; save(); } }
function leagueAdd(x){ ensureLeague(); S.league.you+=x; S.league.bots.forEach(function(b){ if(Math.random()<0.6)b.xp+=Math.floor(Math.random()*x); }); save(); }
function leagueRows(){ ensureLeague(); var r=S.league.bots.map(function(b){return{name:b.name,xp:b.xp,you:false};});
  r.push({name:(accMeta(ACC)||{}).name||"Toi",xp:S.league.you,you:true}); r.sort(function(a,b){return b.xp-a.xp;}); return r; }

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
  {id:"poly",i:"🌍",t:"Polyglotte",d:"Commence 2 langues",f:function(){return Object.keys(S.prog).filter(function(c){return Object.keys(S.prog[c]||{}).length;}).length>=2;}}
];
function anyLessonDone(){ var n=0; Object.keys(S.prog).forEach(function(c){ n+=Object.keys(S.prog[c]||{}).length; }); return n>0; }
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
  {id:"combo4",t:"Un combo x4",g:4,m:"combo",r:15}
];
function todaysQuests(){ var h=dayHash(today()),used={},out=[],i=0;
  while(out.length<3 && i<40){ var q=QUESTS[(h+i*3+1)%QUESTS.length]; if(!used[q.id]){used[q.id]=1;out.push(q);} i++; } return out; }
function questVal(m){ return S.today[m]||0; }
function checkQuests(){ todaysQuests().forEach(function(q){ if(!S.qClaim[q.id] && questVal(q.m)>=q.g){ S.qClaim[q.id]=1; S.gems+=q.r; save(); toast("🎯 Quête : "+q.t+" (+"+q.r+" 💎)"); } }); }

/* ============ Génération leçon ============ */
function allWords(c){ var o=[]; COURSES[c].units.forEach(function(u){u.lessons.forEach(function(l){o=o.concat(l.words);});}); return o; }
function buildLesson(ui,li,rev){ var c=COURSES[S.course],pool=allWords(S.course);
  var words=rev||c.units[ui].lessons[li].words.slice();
  var phr=rev?[]:(c.units[ui].lessons[li].phrases||[]);
  var ex=[];
  shuffle(words).forEach(function(w,i){ var m=i%3===0?"mc_t":(i%3===1?"mc_fr":"listen"); if(m==="listen"&&!S.sound)m="mc_t"; ex.push(makeMC(w,pool,m)); });
  if(words.length>=4) ex.splice(1,0,makeMatch(shuffle(words).slice(0,Math.min(5,words.length))));
  phr.forEach(function(p){ ex.push(makeBank(p,pool)); });
  return shuffle(ex).slice(0,Math.min(ex.length,12));
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

/* ============ Voix + sons ============ */
function speak(text){ if(!S.sound)return; try{ var u=new SpeechSynthesisUtterance(text); u.lang=COURSES[S.course].ttsLang; u.rate=.9;
  var base=COURSES[S.course].ttsLang.split("-")[0], vs=speechSynthesis.getVoices().filter(function(v){return v.lang&&v.lang.indexOf(base)===0;}); if(vs[0])u.voice=vs[0];
  speechSynthesis.cancel(); speechSynthesis.speak(u);}catch(e){} }
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
  if(!S.course){ app.appendChild(vTopbar()); app.appendChild(vCoursePick()); app.appendChild(vTabbar()); return; }
  app.appendChild(vTopbar());
  if(VIEW==="home") app.appendChild(vHome());
  else if(VIEW==="review") app.appendChild(vReview());
  else if(VIEW==="dict") app.appendChild(vDict());
  else if(VIEW==="translate") app.appendChild(vTranslate());
  else if(VIEW==="league") app.appendChild(vLeague());
  else if(VIEW==="profile") app.appendChild(vProfile());
  app.appendChild(vTabbar());
}
function go(v){ VIEW=v; window.scrollTo(0,0); render(); }
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
  if(ACC){ var back=el("button","btn-ghost small"); back.textContent="← Revenir"; back.onclick=function(){ PICK=false; render(); }; d.appendChild(back); }
  var note=el("div","legal-note"); note.textContent="Application originale KDMC — non affiliée à un tiers."; d.appendChild(note);
  return d;
}
function openCreate(){
  var m=modal(); var av=AVATARS[Math.floor(Math.random()*AVATARS.length)];
  m.body.innerHTML='<h3>Nouveau compte</h3><input id="acName" class="txt" placeholder="Ton prénom" maxlength="18" autocomplete="off"><p class="mini">Choisis ton avatar</p>';
  var g=el("div","av-pick");
  AVATARS.forEach(function(a){ var b=el("button","av-opt"+(a===av?" sel":"")); b.textContent=a; b.onclick=function(){ av=a; g.querySelectorAll(".av-opt").forEach(function(x){x.classList.remove("sel");}); b.classList.add("sel"); }; g.appendChild(b); });
  m.body.appendChild(g);
  var ok=el("button","btn-main"); ok.textContent="Créer mon compte";
  ok.onclick=function(){ var n=(m.body.querySelector("#acName").value||"").trim()||"Joueur"; var id=createAccount(n,av); m.close(); switchAccount(id); VIEW="home"; render(); };
  m.body.appendChild(ok);
  setTimeout(function(){ var i=m.body.querySelector("#acName"); if(i)i.focus(); },100);
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
function vCoursePick(){ var d=el("div","screen"); d.innerHTML='<h2 class="ttl">🌍 Choisis une langue</h2><p class="sub2">6 langues — commence, ou continue là où tu en es.</p>';
  var list=el("div","course-pick");
  Object.keys(COURSES).forEach(function(id){ var c=COURSES[id],p=coursePct(id),b=el("button","course-card");
    b.innerHTML='<span class="flag">'+c.drapeau+'</span><span class="cnom">'+c.nom+(p>0?' <i class="cpct">'+p+'%</i>':'')+'<span class="cbar"><span style="width:'+p+'%"></span></span></span><span class="arrow">'+(p>0?'▶':'›')+'</span>';
    b.onclick=function(){ S.course=id; if(!S.prog[id])S.prog[id]={}; save(); VIEW="home"; render(); }; list.appendChild(b); });
  d.appendChild(list); return d;
}

/* ---------- Accueil ---------- */
function unitDone(ui,li){ return (S.prog[S.course]["u"+ui+"-"+li]||0); }
function unitUnlocked(ui,li){ if(ui===0&&li===0)return true; var c=COURSES[S.course],pu=ui,pl=li-1; if(pl<0){pu=ui-1;pl=c.units[pu].lessons.length-1;} return unitDone(pu,pl)>0; }
function vHome(){ var w=el("div","screen tree");
  var gp=Math.min(100,Math.round(S.dailyXP/S.goal*100));
  var goal=el("div","goal-card");
  goal.innerHTML='<div class="goal-top"><b>🎯 Objectif du jour</b><span>'+S.dailyXP+' / '+S.goal+' XP</span></div><div class="bar"><div class="bar-fill" style="width:'+gp+'%"></div></div>'+(gp>=100?'<div class="goal-done">✅ Objectif atteint !</div>':'');
  w.appendChild(goal);
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
function vLeague(){ var d=el("div","screen"); ensureLeague(); d.innerHTML='<h2 class="ttl">🏆 Ligue Bronze</h2><p class="sub2">Classement de la semaine — gagne de l\'XP pour monter.</p>';
  var list=el("div","lb"); leagueRows().forEach(function(r,i){ var row=el("div","lb-row"+(r.you?" me":"")+(i<3?" top":"")); row.innerHTML='<span class="rk">'+(i+1)+'</span><span class="rn">'+(i===0?"🥇 ":i===1?"🥈 ":i===2?"🥉 ":"")+esc(r.name)+(r.you?" (toi)":"")+'</span><span class="rx">'+r.xp+' XP</span>'; list.appendChild(row); });
  d.appendChild(list); return d;
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
  // gel de série
  var freeze=el("div","freeze-card"); freeze.innerHTML='<div><b>🧊 Gel de série</b><span> — protège 1 jour manqué</span></div><div class="fx">x'+S.freeze+'</div>';
  var fb=el("button","btn-buy"); fb.textContent="Acheter (200 💎)"; fb.onclick=function(){ if(S.gems>=200){ S.gems-=200; S.freeze++; save(); toast("🧊 Gel ajouté !"); render(); } else toast("Pas assez de gemmes 💎"); };
  freeze.appendChild(fb); d.appendChild(freeze);
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
function vTabbar(){ var t=el("div","tabbar"); [["home","🏠","Accueil"],["review","🧠","Réviser"],["translate","🌐","Traduire"],["league","🏆","Ligue"],["profile","🙂","Profil"]].forEach(function(x){ var b=el("button","tab"+(VIEW===x[0]||(x[0]==="review"&&VIEW==="dict")?" active":"")); b.innerHTML='<span>'+x[1]+'</span><i>'+x[2]+'</i>'; b.onclick=function(){go(x[0]);}; t.appendChild(b); }); return t; }

/* ============ Traducteur multilingue (hors-ligne, basé sur le dictionnaire) ============ */
var REV=null;
function buildRev(){ REV={fr:{}}; LANGS.forEach(function(l){REV[l]={};});
  Object.keys(DICT).forEach(function(fr){ REV.fr[norm(fr)]=fr; LANGS.forEach(function(l){ var v=DICT[fr][l]; if(v)REV[l][norm(v)]=fr; }); }); }
function translateQ(q,src){ if(!REV)buildRev(); var nq=norm(q); if(!nq)return null; var order=src==="auto"?["fr"].concat(LANGS):[src];
  var fr=null;
  for(var i=0;i<order.length&&!fr;i++){ var m=REV[order[i]]; if(m&&m[nq])fr=m[nq]; }
  if(!fr){ // approché : commence par / contient
    for(var j=0;j<order.length&&!fr;j++){ var mm=REV[order[j]]; if(!mm)continue; var keys=Object.keys(mm);
      for(var k=0;k<keys.length;k++){ if(keys[k].indexOf(nq)===0||nq.indexOf(keys[k])===0){ fr=mm[keys[k]]; break; } } } }
  if(!fr)return null; var out={fr:fr}; LANGS.forEach(function(l){ out[l]=DICT[fr][l]||"—"; }); return out;
}
var TR={src:"auto", q:"", res:null};
function vTranslate(){ var d=el("div","screen");
  d.innerHTML='<h2 class="ttl">🌐 Traducteur</h2><p class="sub2">7 langues, hors-ligne. Tape un mot ou une phrase.</p>';
  var bar=el("div","tr-bar");
  var langsOpt=[["auto","🔎 Auto"],["fr","🇫🇷 Français"]].concat(LANGS.map(function(l){return [l,LMETA[l].drapeau+" "+LMETA[l].nom];}));
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
    var langsAll=[["fr","🇫🇷","Français"]].concat(LANGS.map(function(l){return [l,LMETA[l].drapeau,LMETA[l].nom];}));
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
function speakLang(text,lang){ if(!S.sound)return; try{ var u=new SpeechSynthesisUtterance(text); u.lang=lang; u.rate=.9; var base=lang.split("-")[0],vs=speechSynthesis.getVoices().filter(function(v){return v.lang&&v.lang.indexOf(base)===0;}); if(vs[0])u.voice=vs[0]; speechSynthesis.cancel(); speechSynthesis.speak(u);}catch(e){} }
function dictate(cb){ try{ var SR=window.SpeechRecognition||window.webkitSpeechRecognition; if(!SR){ toast("Dictée non dispo sur ce navigateur"); return; } var r=new SR(); r.lang="fr-FR"; r.onresult=function(e){ cb(e.results[0][0].transcript); }; r.onerror=function(){}; r.start(); toast("🎤 Parle…"); }catch(e){ toast("Dictée indisponible"); } }

/* ============ LEÇON ============ */
function startLesson(ui,li,rev){ if(!UNLIMITED && S.hearts<=0){ outOfHearts(); return; }
  LESSON={ui:ui,li:li,review:!!rev,ex:buildLesson(ui,li,rev),i:0,wrong:0,correct:0,combo:0,comboMax:0,answered:false,ok:null}; VIEW="lesson"; window.scrollTo(0,0); render(); }
function outOfHearts(){ VIEW="home"; render(); var m=modal();
  m.body.innerHTML='<div class="mascot-mini">'+MASCOT("sad",90)+'</div><h3>Plus de vies ❤️</h3><p>Tes cœurs reviennent seuls (1 / 30 min).</p>';
  var b1=el("button","btn-main"); b1.textContent="Recharger (350 💎)"; b1.onclick=function(){ if(S.gems>=350){S.gems-=350;S.hearts=HEART_MAX;S.heartTs=Date.now();save();m.close();render();} else toast("Pas assez de gemmes 💎"); };
  var b2=el("button","btn-ghost"); b2.textContent="Réviser gratuitement (regagne des cœurs)"; b2.onclick=function(){ m.close(); var rw=shuffle(allWords(S.course)).slice(0,8); LESSON={ui:null,li:null,review:true,heal:true,ex:buildLesson(null,null,rw),i:0,wrong:0,correct:0,combo:0,comboMax:0,answered:false,ok:null}; VIEW="lesson"; render(); };
  m.body.appendChild(b1); m.body.appendChild(b2);
}
function vLesson(){ var d=el("div","lesson"),L=LESSON,ex=L.ex[L.i],pct=Math.round(L.i/L.ex.length*100);
  var top=el("div","lesson-top"); top.innerHTML='<button class="quit" id="quitB">✕</button><div class="bar big"><div class="bar-fill" style="width:'+pct+'%"></div></div>'+(L.combo>=2?'<div class="combo">🔥 x'+L.combo+'</div>':'')+'<div class="lh">❤️ '+(UNLIMITED?'∞':S.hearts)+'</div>';
  top.querySelector("#quitB").onclick=function(){ if(confirm("Quitter la leçon ?")){ VIEW="home"; render(); } }; d.appendChild(top);
  var body=el("div","lesson-body");
  if(ex.kind==="mc")body.appendChild(exMC(ex)); else if(ex.kind==="match")body.appendChild(exMatch(ex)); else if(ex.kind==="bank")body.appendChild(exBank(ex));
  d.appendChild(body);
  var foot=el("div","lesson-foot"+(L.answered?(L.ok?" ok":" ko"):""));
  if(L.answered){ var fb=el("div","feedback"); fb.innerHTML=L.ok?'<b>✅ Correct !</b>'+(L.combo>=3?' <span class="cb">🔥 combo x'+L.combo+' (+1 XP)</span>':''):'<b>❌ Bonne réponse :</b> '+esc(L._sol||""); foot.appendChild(fb); }
  var main=el("button","btn-main check"); main.id="mainBtn"; main.textContent=L.answered?"Continuer":"Vérifier"; main.disabled=!L.answered&&!L._can; main.onclick=function(){ L.answered?nextEx():checkEx(ex); }; foot.appendChild(main);
  d.appendChild(foot); return d;
}
function exMC(ex){ var w=el("div","ex");
  var q=ex.audio?'<div class="q-audio" id="audioBtn">🔊<span>Touche pour écouter</span></div>':'<div class="q-word">'+esc(ex.prompt)+' <button class="say" id="sayBtn">🔊</button></div>';
  var titre=ex.audio?"Que dis-je ?":(ex.mode==="mc_fr"?"Traduis en français":"Traduis ce mot");
  w.innerHTML='<div class="ex-h">'+MASCOT("point",64)+'<div class="bubble">'+titre+'</div></div>'+q;
  if(ex.audio) setTimeout(function(){speak(ex.w.t);},250);
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
    if(s.dataset.key===b.dataset.key){ s.classList.add("matched");b.classList.add("matched");s.classList.remove("msel");LESSON._match.sel=null;LESSON._match.done++; if(it.w)speak(it.w.t); beep(true);
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
function syncMain(){ var m=document.getElementById("mainBtn"); if(m)m.disabled=!(LESSON.answered||LESSON._can); }
function checkEx(ex){ var L=LESSON,ok=false,sol="";
  if(ex.kind==="mc"){ ok=L._pick===ex.answer; sol=ex.answer; }
  else if(ex.kind==="match"){ ok=!!L._matchOk; }
  else if(ex.kind==="bank"){ ok=norm(L._bankVal)===norm(ex.answer); sol=ex.answer; }
  L.answered=true; L.ok=ok; L._sol=sol;
  if(ok){ L.correct++; L.combo++; L.comboMax=Math.max(L.comboMax,L.combo); S.today.combo=Math.max(S.today.combo,L.combo);
    if(L.combo>=2)comboSound(L.combo); else beep(true); vibrate(15); if(ex.w&&ex.kind!=="match")setTimeout(function(){speak(ex.w.t);},140); }
  else{ L.wrong++; L.combo=0; if(!UNLIMITED){ S.hearts=Math.max(0,S.hearts-1); if(S.hearts<HEART_MAX)S.heartTs=Date.now(); } beep(false); vibrate([30,40,30]); }
  if(ex.w&&ex.w.fr)srsUpdate(ex.w,ok); save(); render();
}
function nextEx(){ var L=LESSON; L._pick=null;L._can=false;L._matchOk=false;L._bankVal=null;L._chosen=null;L._sol="";
  if(!L.ok){ L.ex.push(L.ex[L.i]); } L.answered=false; L.ok=null; L.i++;
  if(L.i>=L.ex.length){ finishLesson(); return; } if(!UNLIMITED && S.hearts<=0){ outOfHearts(); return; } render();
}
function finishLesson(){ var L=LESSON; var base=L.review?10:15,bonus=L.wrong===0?5:0,combo=Math.max(0,L.comboMax-2); var xp=base+bonus+combo;
  S.xp+=xp; S.dailyXP+=xp; S.gems+=(L.wrong===0?3:1);
  S.today.xp+=xp; if(L.review)S.today.reviews++; else S.today.lessons++; if(L.wrong===0){S.today.perfect++; ls("hadPerfect",true);}
  if(L.heal){ S.hearts=Math.min(HEART_MAX,S.hearts+1); if(S.hearts>=HEART_MAX)S.heartTs=Date.now(); }
  if(L.ui!=null&&!L.review){ var k="u"+L.ui+"-"+L.li; S.prog[S.course][k]=Math.min(5,(S.prog[S.course][k]||0)+1); }
  bumpStreak(); leagueAdd(xp); save(); checkAchv(); checkQuests();
  VIEW="home"; render();
  var m=modal(); m.body.innerHTML='<div class="mascot-mini big">'+MASCOT(L.wrong===0?"party":"wave",120)+'</div><h3>'+(L.wrong===0?"Sans faute ! 🎉":"Leçon terminée ✅")+'</h3><div class="reward-grid"><div class="rw"><span>⭐</span><b>+'+xp+'</b><i>XP</i></div><div class="rw"><span>🔥</span><b>'+S.streak+'</b><i>Série</i></div><div class="rw"><span>💎</span><b>+'+(L.wrong===0?3:1)+'</b><i>Gemmes</i></div></div>';
  var b=el("button","btn-main"); b.textContent="Continuer"; b.onclick=function(){ m.close(); render(); }; m.body.appendChild(b);
}

/* ---------- Toast / modal ---------- */
function toast(msg){ var t=el("div","toast"); t.textContent=msg; document.body.appendChild(t); setTimeout(function(){t.classList.add("show");},10); setTimeout(function(){t.classList.remove("show");setTimeout(function(){t.remove();},300);},2400); }
function modal(){ var ov=el("div","overlay"),box=el("div","modal"); ov.appendChild(box); document.body.appendChild(ov); setTimeout(function(){ov.classList.add("show");},10); return {body:box,close:function(){ov.classList.remove("show");setTimeout(function(){ov.remove();},250);}}; }

/* ============ Mascotte « Lino » (SVG original animé, création KDMC) ============ */
function MASCOT(pose,size){ size=size||100;
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
  return '<svg class="'+cls+'" viewBox="0 0 124 124" width="'+size+'" height="'+size+'" aria-hidden="true">'+
    '<defs><linearGradient id="body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34e3c4"/><stop offset=".55" stop-color="#14c79a"/><stop offset="1" stop-color="#0e9c6e"/></linearGradient>'+
    '<radialGradient id="belly" cx="50%" cy="62%" r="45%"><stop offset="0" stop-color="#eafff7"/><stop offset="1" stop-color="#eafff7" stop-opacity="0"/></radialGradient></defs>'+
    arms+
    '<g class="body"><ellipse cx="46" cy="112" rx="10" ry="5" fill="#0e9c6e"/><ellipse cx="78" cy="112" rx="10" ry="5" fill="#0e9c6e"/>'+
    '<path d="M62 12 C88 12 104 34 104 62 C104 92 86 110 62 110 C38 110 20 92 20 62 C20 34 36 12 62 12 Z" fill="url(#body)"/>'+
    '<ellipse cx="62" cy="74" rx="30" ry="26" fill="url(#belly)"/>'+
    '<line x1="62" y1="12" x2="62" y2="2" stroke="#0e9c6e" stroke-width="3"/><circle cx="62" cy="2" r="5" fill="#f6b73c"/>'+
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
