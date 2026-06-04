/* LA DÉTENTE — Mascotte ÂNE (cartoon vectoriel) déclinée en logos. SVG → PNG (sharp). */
const fs=require('fs'),path=require('path'),sharp=require('sharp');
const OUT=__dirname; fs.mkdirSync(OUT,{recursive:true});
const FONT="'Liberation Sans','DejaVu Sans',Arial,sans-serif";
const PAL={
 noirRouge:{bg1:'#1a1c22',bg2:'#0a0b0e',ring:'#e51f2b',ring2:'#8c0d15',ink:'#f3eee2',accent:'#e51f2b',accent2:'#8c0d15',heartHi:'#ff6a6f',gold:false},
 camo:{bg1:'#283019',bg2:'#141a0d',ring:'#6f7c3f',ring2:'#3d4824',ink:'#efe9d2',accent:'#d72a25',accent2:'#7c1311',heartHi:'#ff6a63',gold:false},
 noirOr:{bg1:'#16141b',bg2:'#08070b',ring:'#d4af37',ring2:'#9c7b22',ink:'#f5e6ac',accent:'#e51f2b',accent2:'#8c0d15',heartHi:'#ff7a7e',gold:true,gold1:'#fff3c4',gold2:'#d4af37',gold3:'#9c7b22'}
};
const HEART='M0,56 C-31,26 -54,6 -54,-16 C-54,-37 -31,-47 -12,-31 C-6,-26 0,-17 0,-11 C0,-17 6,-26 12,-31 C31,-47 54,-37 54,-16 C54,6 31,26 0,56 Z';
function heart(cx,cy,s,p,id,glossy){
 const g=`<radialGradient id="${id}" cx="38%" cy="30%" r="80%"><stop offset="0%" stop-color="${p.heartHi}"/><stop offset="45%" stop-color="${p.accent}"/><stop offset="100%" stop-color="${p.accent2}"/></radialGradient>`;
 const gl=glossy?`<path d="M-30,-22 C-40,-6 -34,12 -16,22 C-30,4 -26,-12 -12,-22 C-22,-26 -27,-25 -30,-22 Z" fill="#fff" opacity=".35"/>`:'';
 return {defs:g,body:`<g transform="translate(${cx},${cy}) scale(${s})"><path d="${HEART}" fill="url(#${id})" stroke="${p.accent2}" stroke-width="2.5"/>${gl}</g>`};
}
function rifle(fill){return `<g fill="${fill}"><polygon points="0,44 62,30 62,74 34,82 0,72"/><rect x="60" y="30" width="130" height="38" rx="3"/><rect x="92" y="19" width="100" height="10" rx="3"/><polygon points="118,68 140,68 153,116 126,118"/><path d="M150,68 L190,68 L202,156 Q184,162 166,156 Z"/><rect x="190" y="38" width="76" height="26" rx="5"/><rect x="266" y="46" width="96" height="10" rx="3"/><polygon points="300,21 310,21 308,46 302,46"/><rect x="352" y="43" width="15" height="15" rx="2"/></g>`;}
function shotgun(fill){return `<g fill="${fill}"><path d="M0,56 L58,40 L114,48 L114,98 L74,100 L44,114 L10,100 Z"/><rect x="108" y="40" width="48" height="48" rx="5"/><rect x="150" y="40" width="210" height="11" rx="3"/><rect x="150" y="56" width="210" height="11" rx="3"/><rect x="150" y="72" width="74" height="17" rx="7"/><rect x="354" y="38" width="11" height="31" rx="2"/></g>`;}
function arcText(cx,cy,r,centerDeg,spanDeg,text,opt,flip){const size=opt.size||40,fill=opt.fill||'#fff',font=opt.font||FONT;const ch=Array.from(text),n=ch.length;let o=`<g font-family="${font}" font-weight="bold" font-size="${size}" fill="${fill}" text-anchor="middle">`;for(let i=0;i<n;i++){if(ch[i]===' ')continue;const t=n===1?0.5:i/(n-1);const ang=flip?(centerDeg+spanDeg/2-t*spanDeg):(centerDeg-spanDeg/2+t*spanDeg);const rad=ang*Math.PI/180;const x=cx+r*Math.cos(rad),y=cy+r*Math.sin(rad);const rot=(flip?ang-90:ang+90).toFixed(2);o+=`<text x="${x.toFixed(1)}" y="${(y+size*0.34).toFixed(1)}" transform="rotate(${rot} ${x.toFixed(1)} ${y.toFixed(1)})">${ch[i]}</text>`;}return o+'</g>';}
function ribbon(cx,cy,w,p,txt,gold,key){const h=92,x=cx-w/2,y=cy-h/2,tail=32;const grad=gold?`<linearGradient id="rib${key}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${p.gold1}"/><stop offset="100%" stop-color="${p.gold2}"/></linearGradient>`:'';const fill=gold?`url(#rib${key})`:p.accent,tcol=gold?'#15140f':'#fff';return `${grad}<path d="M${x},${y+8} L${x-tail},${y+22} L${x-tail},${y+h+12} L${x},${y+h-6} Z" fill="${p.accent2}"/><path d="M${x+w},${y+8} L${x+w+tail},${y+22} L${x+w+tail},${y+h+12} L${x+w},${y+h-6} Z" fill="${p.accent2}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${p.accent2}" stroke-width="3"/><text x="${cx}" y="${cy+18}" font-family="${FONT}" font-weight="bold" font-size="50" letter-spacing="2" text-anchor="middle" fill="${tcol}">${txt}</text>`;}

/* ---------------- MASCOTTE ÂNE (centrée à l'origine) ---------------- */
function donkeyDefs(key){return `
 <linearGradient id="dk${key}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#b6a890"/><stop offset="55%" stop-color="#8f8069"/><stop offset="100%" stop-color="#6f6150"/></linearGradient>
 <linearGradient id="dm${key}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#efe7d6"/><stop offset="100%" stop-color="#d6cab2"/></linearGradient>`;}
function donkey(key,opt){
 opt=opt||{};const grin=opt.smile!=='soft';
 const body=`url(#dk${key})`,muz=`url(#dm${key})`,dark='#3a3128',earIn='#caa79b';
 let s='<g>';
 // oreilles
 s+=`<g><ellipse cx="-96" cy="-150" rx="44" ry="118" transform="rotate(-14 -96 -150)" fill="${body}" stroke="${dark}" stroke-width="3"/><ellipse cx="-96" cy="-150" rx="22" ry="88" transform="rotate(-14 -96 -150)" fill="${earIn}"/></g>`;
 s+=`<g><ellipse cx="96" cy="-150" rx="44" ry="118" transform="rotate(14 96 -150)" fill="${body}" stroke="${dark}" stroke-width="3"/><ellipse cx="96" cy="-150" rx="22" ry="88" transform="rotate(14 96 -150)" fill="${earIn}"/></g>`;
 // tête
 s+=`<path d="M-120,-50 C-138,55 -108,160 0,214 C108,160 138,55 120,-50 C108,-118 58,-150 0,-148 C-58,-150 -108,-118 -120,-50 Z" fill="${body}" stroke="${dark}" stroke-width="4"/>`;
 // crinière (mèche)
 s+=`<g fill="${dark}"><path d="M0,-176 l16,40 l-10,4 l14,40 l-34,-30 l8,-6 l-12,-34 Z"/><path d="M-26,-150 l10,36 l-20,-14 Z" opacity=".8"/><path d="M26,-150 l-10,36 l20,-14 Z" opacity=".8"/></g>`;
 // museau
 s+=`<ellipse cx="0" cy="122" rx="120" ry="96" fill="${muz}" stroke="${dark}" stroke-width="3"/>`;
 // yeux
 const eye=(x)=>`<ellipse cx="${x}" cy="-18" rx="30" ry="34" fill="#fff" stroke="${dark}" stroke-width="3"/><circle cx="${x+4}" cy="-12" r="15" fill="#241d15"/><circle cx="${x+9}" cy="-18" r="5" fill="#fff"/>`;
 s+=eye(-58)+eye(58);
 // sourcils rigolos
 s+=`<path d="M-92,-58 q34,-26 70,-8" fill="none" stroke="${dark}" stroke-width="6" stroke-linecap="round"/><path d="M92,-58 q-34,-26 -70,-8" fill="none" stroke="${dark}" stroke-width="6" stroke-linecap="round"/>`;
 // naseaux
 s+=`<ellipse cx="-32" cy="118" rx="15" ry="20" fill="#4a4038"/><ellipse cx="32" cy="118" rx="15" ry="20" fill="#4a4038"/>`;
 // bouche
 if(grin){
  s+=`<path d="M-78,158 Q0,210 78,158 Q0,250 -78,158 Z" fill="#7a3b3f" stroke="${dark}" stroke-width="3"/>`;
  s+=`<g fill="#fff" stroke="#cfc8b8" stroke-width="1.5">`;for(let i=-3;i<=3;i++){s+=`<rect x="${i*20-9}" y="170" width="18" height="22" rx="3"/>`;}s+=`</g>`;
 }else{
  s+=`<path d="M-60,170 Q0,205 60,170" fill="none" stroke="${dark}" stroke-width="6" stroke-linecap="round"/>`;
 }
 return s+'</g>';
}

/* ---- badge rond ---- */
function badge(palKey,key,inner,bottom){
 const p=PAL[palKey];let defs=`<radialGradient id="bg${key}" cx="50%" cy="42%" r="62%"><stop offset="0%" stop-color="${p.bg1}"/><stop offset="100%" stop-color="${p.bg2}"/></radialGradient>`;
 const ringFill=p.gold?`url(#rg${key})`:p.ring; if(p.gold)defs+=`<linearGradient id="rg${key}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${p.gold1}"/><stop offset="50%" stop-color="${p.gold2}"/><stop offset="100%" stop-color="${p.gold3}"/></linearGradient>`;
 let body=`<circle cx="500" cy="500" r="486" fill="${ringFill}"/><circle cx="500" cy="500" r="486" fill="none" stroke="${p.ring2}" stroke-width="6"/><circle cx="500" cy="500" r="452" fill="url(#bg${key})"/><circle cx="500" cy="500" r="452" fill="none" stroke="${p.ink}" stroke-width="4" stroke-dasharray="2 11" stroke-linecap="round" opacity=".85"/>`;
 return {defs,head:body,bottom};
}

/* Concept A : âne patch (âne + cœur) */
function anePatch(palKey,key){
 const p=PAL[palKey];const b=badge(palKey,key);let defs=b.defs+donkeyDefs(key);let body=b.head;
 body+=`<g transform="translate(500,500) scale(1.05)">${donkey(key,{smile:'grin'})}</g>`;
 const h=heart(720,330,1.0,p,'h'+key,p.gold);defs+=h.defs;body+=h.body;
 body+=arcText(500,500,404,-90,150,'TIR · BALL-TRAP · CHASSE',{size:46,fill:p.ink});
 body+=ribbon(500,800,372,p,'LA DÉTENTE',p.gold,key);
 return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1600" viewBox="0 0 1000 1000"><defs>${defs}</defs>${body}</svg>`;
}
/* Concept B : crest âne + armes croisées + cœur */
function aneCrest(palKey,key){
 const p=PAL[palKey];let defs=donkeyDefs(key);
 const edge=p.gold?`url(#cg${key})`:p.ring; if(p.gold)defs+=`<linearGradient id="cg${key}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${p.gold1}"/><stop offset="50%" stop-color="${p.gold2}"/><stop offset="100%" stop-color="${p.gold3}"/></linearGradient>`;
 defs+=`<linearGradient id="cb${key}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${p.bg1}"/><stop offset="100%" stop-color="${p.bg2}"/></linearGradient>`;
 const shield='M500,52 L884,235 L884,612 C884,792 712,890 500,944 C288,890 116,792 116,612 L116,235 Z';
 let body=`<path d="${shield}" fill="url(#cb${key})" stroke="${edge}" stroke-width="16" stroke-linejoin="round"/>`;
 const gun=p.gold?`url(#cg${key})`:'#c7ccd4';
 body+=`<g transform="translate(500,470) rotate(-26) scale(.82) translate(-183,-88)" opacity=".9">${rifle(gun)}</g>`;
 body+=`<g transform="translate(500,470) rotate(26) scale(.82) translate(-183,-77)" opacity=".9">${shotgun(gun)}</g>`;
 body+=`<g transform="translate(500,470) scale(.92)">${donkey(key,{smile:'grin'})}</g>`;
 const h=heart(500,752,1.0,p,'hc'+key,p.gold);defs+=h.defs;body+=h.body;
 body+=ribbon(500,838,392,p,'LA DÉTENTE',p.gold,'cr'+key);
 return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1600" viewBox="0 0 1000 1000"><defs>${defs}</defs>${body}</svg>`;
}
/* Concept C : âne + plateau ball-trap (scène fond clair) */
function aneBalltrap(key){
 const p=PAL.noirRouge;let defs=donkeyDefs(key);
 defs+=`<radialGradient id="clay${key}" cx="40%" cy="35%" r="75%"><stop offset="0%" stop-color="#ffb24d"/><stop offset="100%" stop-color="#c25a00"/></radialGradient>`;
 let body=`<rect width="1000" height="1000" rx="60" fill="#f4f1ea"/>`;
 body+=`<g transform="translate(470,520) scale(1.15)">${donkey(key,{smile:'grin'})}</g>`;
 // plateau qui vole + traînée
 body+=`<g transform="translate(800,300)"><ellipse cx="0" cy="0" rx="60" ry="22" fill="url(#clay${key})" stroke="#7a3a00" stroke-width="3"/><ellipse cx="0" cy="-5" rx="40" ry="12" fill="#ffd9a0" opacity=".55"/><g stroke="#c25a00" stroke-width="7" stroke-linecap="round" opacity=".75"><line x1="70" y1="-16" x2="120" y2="-28"/><line x1="70" y1="2" x2="126" y2="2"/><line x1="70" y1="18" x2="118" y2="32"/></g></g>`;
 const h=heart(250,250,1.1,p,'hb'+key,false);defs+=h.defs;body+=h.body;
 body+=`<text x="500" y="930" font-family="${FONT}" font-weight="bold" font-size="78" letter-spacing="3" text-anchor="middle" fill="#15171a">LA DÉTENTE</text>`;
 body+=`<text x="500" y="80" font-family="${FONT}" font-weight="bold" font-size="34" letter-spacing="8" text-anchor="middle" fill="#8c0d15">TIR · BALL-TRAP · CHASSE</text>`;
 return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1600" viewBox="0 0 1000 1000"><defs>${defs}</defs>${body}</svg>`;
}
async function render(svg,name){await sharp(Buffer.from(svg)).png({compressionLevel:9}).toFile(path.join(OUT,name+'.png'));fs.writeFileSync(path.join(OUT,name+'.svg'),svg);console.log('✓',name);}
(async()=>{
 await render(anePatch('noirRouge','a'),'ane-patch-noir-rouge');
 await render(anePatch('camo','b'),'ane-patch-camo');
 await render(anePatch('noirOr','c'),'ane-patch-or');
 await render(aneCrest('noirRouge','d'),'ane-crest-noir-rouge');
 await render(aneCrest('noirOr','e'),'ane-crest-or');
 await render(aneBalltrap('f'),'ane-balltrap-blanc');
 console.log('TERMINÉ');
})();
