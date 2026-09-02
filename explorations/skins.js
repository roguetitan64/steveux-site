/* skins.js — the 16x16 matrix engine, v6.
   ONE component, two states: both halves of one pill open the SAME
   two-column panel (Layout | Brand). Persists across layout navigation
   as a single frozen unit.
   v6: theme-aware — the widget renders LIGHT (styled like the site's
   a11y dock) on light backgrounds and DARK on dark ones, re-evaluated
   on every brand apply and on the site's data-theme toggle.
   Main-site mode: when loaded outside /explorations/, the widget only
   appears at dive depth and layout links travel into explorations/.
   One-time intro modal explains the experiment. */
(function(){
var SKINS={
 native:{name:"Native"},
 house:{name:"00 House",bg:"#EFEFE7",surface:"#FCFBF6",ink:"#141412",dim:"#6B675E",acc:"#3425FF",acc2:"#8A7FFF",font:"sans"},
 crt:{name:"01 CRT",bg:"#050A06",surface:"#0B1A0E",ink:"#B8F5C0",dim:"#4E7A57",acc:"#FFB000",acc2:"#33FF66",font:"mono"},
 news:{name:"02 Newsprint",bg:"#FFFDF6",surface:"#FFFFFF",ink:"#141210",dim:"#6E6A5E",acc:"#8C1D18",acc2:"#3B3830",font:"serif"},
 cube:{name:"03 White Cube",bg:"#FFFFFF",surface:"#FAF8F5",ink:"#161412",dim:"#8A857D",acc:"#C65A2E",acc2:"#E4D5CB",font:"serif"},
 banker:{name:"04 Banker",bg:"#F4F2EA",surface:"#EAF0E7",ink:"#0B3D2E",dim:"#5E6E62",acc:"#B3261E",acc2:"#2E5C4A",font:"mono"},
 atlas:{name:"05 Atlas",bg:"#F0E6CE",surface:"#FAF3E3",ink:"#41321F",dim:"#8A7A5E",acc:"#A93B4A",acc2:"#CDBD9C",font:"serif"},
 keynote:{name:"06 Keynote",bg:"#101014",surface:"#1A1A22",ink:"#F5F5F2",dim:"#9A9AA3",acc:"#FFD60A",acc2:"#7A7A85",font:"sans"},
 msg:{name:"07 Messenger",bg:"#F2F2F7",surface:"#FFFFFF",ink:"#1C1C1E",dim:"#8E8E93",acc:"#0A84FF",acc2:"#34C759",font:"sans"},
 manila:{name:"08 Manila",bg:"#D9C08F",surface:"#FFFEF8",ink:"#1C1B18",dim:"#6B675E",acc:"#1D5BD8",acc2:"#B42318",font:"serif"},
 vapor:{name:"09 Vaporwave",bg:"#221436",surface:"#2E1B4A",ink:"#FCEAFF",dim:"#9B7FB8",acc:"#FF5FA2",acc2:"#59E3E3",font:"mono"},
 graphite:{name:"10 Graphite",bg:"#1E1F22",surface:"#26272B",ink:"#D9D9D4",dim:"#8F8F88",acc:"#FF7A1A",acc2:"#FFFFFF",font:"mono"},
 cork:{name:"11 Cork",bg:"#C89A66",surface:"#FFFDF4",ink:"#2A1F14",dim:"#6E5335",acc:"#B42318",acc2:"#FFF3A8",font:"sans"},
 poster:{name:"12 Poster",bg:"#E8442E",surface:"#FFF6EC",ink:"#16130F",dim:"#7A2A1D",acc:"#FFF6EC",acc2:"#B42318",font:"sans"},
 platinum:{name:"13 Platinum",bg:"#C9CACC",surface:"#FFFFFF",ink:"#000000",dim:"#555555",acc:"#2456E6",acc2:"#8E8E93",font:"sans"},
 wikidark:{name:"14 Wiki Dark",bg:"#101418",surface:"#1B2129",ink:"#E6E6E6",dim:"#98A2AC",acc:"#88A3E2",acc2:"#B79FD6",font:"sans"},
 gold:{name:"15 Gold",bg:"#070604",surface:"#14110B",ink:"#EFE6C8",dim:"#93876A",acc:"#D4AF37",acc2:"#8A7B54",font:"serif"}
};
var LAYOUTS=[["__main","Portfolio"],["01-terminal","01 The Terminal"],["02-broadsheet","02 The Broadsheet"],["03-gallery","03 The Gallery"],["04-ledger","04 The Ledger"],["05-map","05 The Map"],["06-slides","06 The Slides"],["07-chat","07 The Interview"],["08-annotated","08 The One-Pager"],["09-mixtape","09 The Mixtape"],["10-blueprint","10 The Blueprint"],["11-pinboard","11 The Pinboard"],["12-sentence","12 One Sentence"],["13-desktop","13 StevenOS"],["14-wiki","14 The Wiki"],["15-credits","15 End Credits"]];
var PAGE={"__main":"house","index":"house","01-terminal":"crt","02-broadsheet":"news","03-gallery":"cube","04-ledger":"banker","05-map":"atlas","06-slides":"keynote","07-chat":"msg","08-annotated":"manila","09-mixtape":"vapor","10-blueprint":"graphite","11-pinboard":"cork","12-sentence":"poster","13-desktop":"platinum","14-wiki":"wikidark","15-credits":"gold"};
var inExpl=/explorations\//.test(location.pathname);
var BASE=inExpl?"":"explorations/";
var pageKey=inExpl?((location.pathname.split("/").pop()||"index.html").replace(".html","")||"index"):"__main";
var ownSkin=inExpl?(PAGE[pageKey]||null):"house";
var MAP={bg:["--bg","--desk","--bp"],
 surface:["--card","--paper","--panel","--box","--win","--bar"],
 ink:["--ink","--line","--rule","--bright","--body"],
 dim:["--dim","--hair","--muted"],
 acc:["--acc","--link"],
 acc2:["--ok","--red","--visited","--cat-about"]};
var FONTS={mono:"ui-monospace,'SF Mono',Menlo,monospace",serif:"Georgia,'Iowan Old Style',serif",sans:"-apple-system,'Helvetica Neue',Inter,Arial,sans-serif"};
var root=document.documentElement;

/* ---- theme awareness: light widget on light pages, dark on dark ---- */
var PAL={
 light:{bg:"#FCFBF6",ink:"#141412",dim:"#6B675E",hair:"#D8D4C8",hov:"rgba(20,20,18,.06)",ring:"#141412"},
 dark:{bg:"#141412",ink:"#EDEAE0",dim:"#8B8878",hov:"rgba(255,255,255,.12)",hair:"rgba(255,255,255,.25)",ring:"#FFFFFF"}
};
function setMode(){
 var m=(getComputedStyle(document.body).backgroundColor||"").match(/\d+(\.\d+)?/g)||[239,239,231];
 var lum=.2126*m[0]+.7152*m[1]+.0722*m[2];
 var v=PAL[lum>140?"light":"dark"];
 Object.keys(v).forEach(function(k){root.style.setProperty("--skw-"+k,v[k])});
}

function skinLabel(key){
 if(key==="native"||!SKINS[key])return ownSkin?("Native ("+SKINS[ownSkin].name.replace(/^\d+ /,"")+")"):"Native";
 return SKINS[key].name;
}
var fadeTimer=null;
function themeFade(){
 if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;
 var st=document.getElementById("skinFade");
 if(!st){st=document.createElement("style");st.id="skinFade";
  st.textContent="html.skin-anim,html.skin-anim *{transition:background-color .45s ease,color .45s ease,border-color .45s ease,fill .45s ease,stroke .45s ease,box-shadow .45s ease!important}";
  document.head.appendChild(st);}
 root.classList.add("skin-anim");
 clearTimeout(fadeTimer);
 fadeTimer=setTimeout(function(){root.classList.remove("skin-anim")},500);
}
function apply(key){
 themeFade();
 var s=SKINS[key]||SKINS.native;
 if(!s.bg){
  Object.keys(MAP).forEach(function(t){MAP[t].forEach(function(v){root.style.removeProperty(v)})});
  root.style.removeProperty("--tape");
  document.body&&(document.body.style.fontFamily="");
 }else{
  Object.keys(MAP).forEach(function(t){MAP[t].forEach(function(v){root.style.setProperty(v,s[t])})});
  root.style.setProperty("--tape",s.acc+"40");
  document.body&&(document.body.style.fontFamily=FONTS[s.font]);
 }
 try{localStorage.setItem("expl-skin",key)}catch(e){}
 var cur=document.getElementById("skinCur");
 if(cur)cur.textContent=skinLabel(key);
 document.querySelectorAll("[data-brandrow]").forEach(function(b){
  b.style.boxShadow=b.getAttribute("data-brandrow")===key?"inset 0 0 0 2px var(--skw-ring)":"inset 0 0 0 0 rgba(255,255,255,0)";
 });
 setMode();
}

/* ---- shared styling (all colors via --skw-* so light/dark both work) ---- */
var BTN="display:flex;align-items:center;gap:8px;background:var(--skw-bg);color:var(--skw-ink);border:1px solid var(--skw-hair);border-radius:99px;padding:9px 14px;cursor:pointer;box-shadow:0 6px 24px -10px rgba(20,20,18,.35);font:600 12px/1 -apple-system,sans-serif;white-space:nowrap;transition:background .3s ease,color .3s ease,border-color .3s ease";
var ROW="display:flex;align-items:center;gap:8px;width:100%;min-height:46px;background:none;border:0;color:var(--skw-ink);font:12px/1.35 -apple-system,sans-serif;padding:6px 10px;cursor:pointer;border-radius:8px;text-align:left;transition:background .25s ease,box-shadow .3s cubic-bezier(.22,.9,.24,1)";
var HEAD="color:var(--skw-dim);font-size:10px;letter-spacing:.14em;text-transform:uppercase;padding:6px 10px 8px;flex:none";
var DIMS='style="color:var(--skw-dim)"';
function el(tag,css,html){var e=document.createElement(tag);if(css)e.style.cssText=css;if(html!=null)e.innerHTML=html;return e}
function row(html,onclick){
 var b=el("button",ROW,html);
 b.onmouseenter=function(){b.style.background="var(--skw-hov)"};
 b.onmouseleave=function(){b.style.background="transparent"};
 b.onclick=onclick;
 return b;
}
var THUMBS={
 "__main":'<rect x="4" y="5" width="17" height="9" rx="1.5" fill="none" stroke="INK"/><rect x="23" y="5" width="17" height="9" rx="1.5" fill="none" stroke="ACC"/><rect x="4" y="16" width="17" height="9" rx="1.5" fill="none" stroke="INK"/><rect x="23" y="16" width="17" height="9" rx="1.5" fill="none" stroke="INK"/>',
 "index":'<rect x="4" y="5" width="17" height="9" rx="1.5" fill="none" stroke="INK"/><rect x="23" y="5" width="17" height="9" rx="1.5" fill="none" stroke="ACC"/><rect x="4" y="16" width="17" height="9" rx="1.5" fill="none" stroke="INK"/><rect x="23" y="16" width="17" height="9" rx="1.5" fill="none" stroke="INK"/>',
 "01-terminal":'<path d="M5 8h12M5 13h18M5 18h9" stroke="INK"/><rect x="15" y="21" width="5" height="4" fill="ACC"/>',
 "02-broadsheet":'<path d="M6 6h32" stroke="INK" stroke-width="3"/><path d="M6 12h9M6 16h9M6 20h9M6 24h9" stroke="INK"/><path d="M18 12h9M18 16h9M18 20h9" stroke="INK"/><path d="M30 12h8M30 16h8M30 20h8M30 24h8" stroke="ACC"/>',
 "03-gallery":'<rect x="13" y="5" width="18" height="14" fill="none" stroke="ACC" stroke-width="1.6"/><path d="M16 23h12" stroke="INK"/>',
 "04-ledger":'<path d="M4 7h36" stroke="INK" stroke-width="2.4"/><path d="M4 13h36M4 23h36" stroke="INK"/><path d="M4 18h36" stroke="ACC" stroke-width="2"/>',
 "05-map":'<rect x="6" y="6" width="10" height="7" rx="1" transform="rotate(-6 11 9)" fill="none" stroke="INK"/><rect x="27" y="8" width="10" height="7" rx="1" transform="rotate(5 32 11)" fill="none" stroke="INK"/><rect x="17" y="18" width="10" height="7" rx="1" transform="rotate(-3 22 21)" fill="none" stroke="INK"/><circle cx="22" cy="14" r="2.4" fill="ACC"/>',
 "06-slides":'<rect x="8" y="5" width="28" height="17" rx="2" fill="none" stroke="INK"/><path d="M8 26h18" stroke="ACC" stroke-width="2.6"/>',
 "07-chat":'<rect x="5" y="6" width="19" height="7" rx="3.5" fill="none" stroke="INK"/><rect x="20" y="17" width="19" height="7" rx="3.5" fill="ACC"/>',
 "08-annotated":'<rect x="5" y="4" width="22" height="22" rx="1.5" fill="none" stroke="INK"/><path d="M9 10h14M9 15h14M9 20h9" stroke="INK"/><path d="M31 9h8M31 14h8M31 19h6" stroke="ACC"/>',
 "09-mixtape":'<rect x="7" y="7" width="30" height="16" rx="3" fill="none" stroke="INK"/><circle cx="16" cy="15" r="3.4" fill="none" stroke="INK"/><circle cx="28" cy="15" r="3.4" fill="none" stroke="INK"/><path d="M11 26h14" stroke="ACC" stroke-width="2"/>',
 "10-blueprint":'<rect x="4" y="4" width="36" height="22" fill="none" stroke="INK"/><path d="M27 26v-6h13" fill="none" stroke="INK"/><rect x="9" y="9" width="11" height="9" fill="none" stroke="ACC" stroke-dasharray="2.5 2"/>',
 "11-pinboard":'<rect x="7" y="7" width="12" height="10" rx="1" transform="rotate(-7 13 12)" fill="none" stroke="INK"/><rect x="25" y="11" width="12" height="10" rx="1" transform="rotate(6 31 16)" fill="none" stroke="INK"/><path d="M15 12 Q 22 22 29 15" fill="none" stroke="ACC"/>',
 "12-sentence":'<path d="M7 15h30" stroke="INK" stroke-width="2.6"/><path d="M16 20h9" stroke="ACC" stroke-width="2.6"/>',
 "13-desktop":'<path d="M4 6h36" stroke="INK" stroke-width="2"/><rect x="8" y="10" width="17" height="13" fill="none" stroke="INK"/><rect x="20" y="14" width="17" height="12" fill="none" stroke="INK"/><path d="M20 17h17" stroke="ACC" stroke-width="2"/>',
 "14-wiki":'<path d="M5 7h20M5 12h18M5 17h20M5 22h14" stroke="INK"/><rect x="28" y="6" width="12" height="15" fill="none" stroke="ACC"/>',
 "15-credits":'<path d="M15 6h14" stroke="INK"/><path d="M11 12h22" stroke="INK"/><path d="M13 18h18" stroke="ACC" stroke-width="2"/><path d="M16 24h12" stroke="INK"/>'
};
function thumb(key){
 var b=PAGE[key]?SKINS[PAGE[key]]:SKINS.house;
 var inner=(THUMBS[key]||"").split("INK").join(b.ink).split("ACC").join(b.acc);
 return '<svg width="44" height="30" viewBox="0 0 44 30" style="flex:none;border-radius:4px;border:1px solid var(--skw-hair)" xmlns="http://www.w3.org/2000/svg"><rect width="44" height="30" fill="'+b.bg+'"/><g stroke-width="1.4" stroke-linecap="round" fill="none">'+inner+'</g></svg>';
}
function brandSwatch(key){
 var b=SKINS[key]&&SKINS[key].bg?SKINS[key]:(ownSkin?SKINS[ownSkin]:SKINS.house);
 var dash=(key==="native")?' stroke-dasharray="3 3"':'';
 return '<svg width="44" height="30" viewBox="0 0 44 30" style="flex:none;border-radius:4px;border:1px solid var(--skw-hair)" xmlns="http://www.w3.org/2000/svg">'
 +'<rect width="44" height="30" fill="'+b.bg+'"/>'
 +'<rect x="5" y="6" width="14" height="14" rx="2" fill="'+b.acc+'"'+dash+(key==="native"?' fill-opacity=".8" stroke="'+b.ink+'"':'')+'/>'
 +'<path d="M24 10h15M24 15h11M24 20h13" stroke="'+b.ink+'" stroke-width="2" stroke-linecap="round"/>'
 +'</svg>';
}
function spacerRow(){
 var d=el("div",ROW+";cursor:default;opacity:.6;pointer-events:none");
 d.innerHTML='<svg width="44" height="30" viewBox="0 0 44 30" style="flex:none;border-radius:4px;border:1px dashed var(--skw-hair)" xmlns="http://www.w3.org/2000/svg"><path d="M14 15h12M22 11l5 4-5 4" stroke="#8B8878" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg><span '+DIMS+'>Native = the pair →</span>';
 return d;
}
function layoutRow(l,onpick){
 var label=l[1]+(l[0]===pageKey?' <span '+DIMS+'>· here</span>':"");
 var b=row(thumb(l[0])+"<span>"+label+"</span>",function(){onpick(l[0],b)});
 b.setAttribute("data-layoutrow",l[0]);
 if(l[0]===pageKey)b.style.boxShadow="inset 0 0 0 2px var(--skw-ring)";
 return b;
}
function brandRow(key,onpick){
 var s=SKINS[key],own=ownSkin?SKINS[ownSkin]:null;
 var label=s.name;
 if(key==="native"&&own)label='Native <span '+DIMS+'>· '+own.name.replace(/^\d+ /,"")+'</span>';
 else if(key===ownSkin)label=s.name+' <span style="color:#D4AF37">★</span><span class="intd" style="color:var(--skw-dim);opacity:0;transition:opacity .2s"> intended</span>';
 var b=row(brandSwatch(key)+"<span>"+label+"</span>",function(){onpick(key,b)});
 b.setAttribute("data-brandrow",key);
 if(key===ownSkin){
  b.addEventListener("mouseenter",function(){var i=b.querySelector(".intd");if(i)i.style.opacity="1"});
  b.addEventListener("mouseleave",function(){var i=b.querySelector(".intd");if(i)i.style.opacity="0"});
  b.title="This is the brand designed for this layout";
 }
 return b;
}
function isMobile(){return matchMedia("(max-width:640px)").matches}
function saveState(st){try{localStorage.setItem("expl-matrix",JSON.stringify(st))}catch(e){}}
function loadState(){try{return JSON.parse(localStorage.getItem("expl-matrix")||"{}")}catch(e){return{}}}

/* ---- one-time intro modal, toasts up from the center ---- */
function introOnce(){
 try{if(localStorage.getItem("expl-intro"))return}catch(e){}
 if(document.getElementById("skinIntro"))return;
 var back=el("div","position:fixed;inset:0;z-index:2147483200;background:rgba(10,10,8,.45);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:24px;opacity:0;transition:opacity .35s ease");
 back.id="skinIntro";
 var card=el("div","background:var(--skw-bg);color:var(--skw-ink);border:1px solid var(--skw-hair);border-radius:18px;padding:28px 30px 26px;max-width:560px;width:100%;box-shadow:0 30px 80px -24px rgba(0,0,0,.55);transform:translateY(14px) scale(.96);transition:transform .4s cubic-bezier(.22,.9,.24,1);font:14px/1.65 -apple-system,sans-serif");
 card.innerHTML=
  '<div style="'+HEAD.replace(/padding:[^;]+/,"padding:0 0 10px")+'">Experimental · the skin matrix</div>'
 +'<div style="font-size:19px;font-weight:600;line-height:1.35;margin-bottom:10px">You&rsquo;re viewing an experimental way to experience this content.</div>'
 +'<p style="margin:0 0 10px;color:var(--skw-dim)">It exists to show what AI models like Fable 5 can do: iterate from 0&rarr;1, then out to 16 layouts &times; 16 brands &mdash; <b style="color:var(--skw-ink)">256 combinations</b> of the same portfolio. An amazing feat that moves us faster.</p>'
 +'<p style="margin:0 0 18px;color:var(--skw-dim)">But 256 combinations also means 256 places for a website to go wrong. The real solution isn&rsquo;t generating more &mdash; it&rsquo;s knowing <em>before</em> burning the tokens which directions deserve a look, and when to stop iterating.</p>'
 +'<button id="skinIntroOk" style="'+BTN+';justify-content:center;width:100%;background:var(--skw-ink);color:var(--skw-bg);border-color:transparent;min-height:44px;font-size:13px">Got it &mdash; explore</button>';
 back.appendChild(card);
 document.body.appendChild(back);
 requestAnimationFrame(function(){back.style.opacity="1";card.style.transform="translateY(0) scale(1)"});
 function shut(){
  try{localStorage.setItem("expl-intro","1")}catch(e){}
  back.style.opacity="0";card.style.transform="translateY(10px) scale(.97)";
  setTimeout(function(){back.remove()},380);
 }
 card.querySelector("#skinIntroOk").onclick=shut;
 back.addEventListener("click",function(e){if(e.target===back)shut()});
}

/* one column (used by desktop panel AND mobile sheet) */
function buildColumn(title,fill){
 var c=el("div","display:flex;flex-direction:column;min-height:0");
 c.appendChild(el("div",HEAD,title));
 var list=el("div","overflow-y:auto;overscroll-behavior:contain;min-height:0;padding:0 2px 4px");
 fill(list);
 c.appendChild(list);
 c._list=list;
 return c;
}
function fillLayout(list){
 list.appendChild(spacerRow());
 LAYOUTS.forEach(function(l){
  list.appendChild(layoutRow(l,function(k){
   var st=loadState();st.open=true;
   st.ls=list.scrollTop;
   var bl=document.getElementById("brandList");if(bl)st.bs=bl.scrollTop;
   saveState(st);
   location=(k==="__main")?(inExpl?"../index.html":"index.html"):(BASE+k+".html");
  }));
 });
 /* the overview lives as its own project page — linked at the bottom */
 var ov=row('<svg width="44" height="30" viewBox="0 0 44 30" style="flex:none;border-radius:4px;border:1px dashed var(--skw-hair)" xmlns="http://www.w3.org/2000/svg"><circle cx="14" cy="15" r="5.5" fill="none" stroke="#8B8878" stroke-width="1.4"/><path d="M23 15h9M28 11l4 4-4 4" stroke="#8B8878" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg><span>The experiment <span '+DIMS+'>· overview'+(pageKey==="index"?" · here":"")+'</span></span>',function(){
  var st=loadState();st.open=true;st.ls=list.scrollTop;
  var bl=document.getElementById("brandList");if(bl)st.bs=bl.scrollTop;
  saveState(st);
  location=BASE+"index.html";
 });
 ov.style.borderTop="1px solid var(--skw-hair)";ov.style.borderRadius="0 0 8px 8px";
 if(pageKey==="index")ov.style.boxShadow="inset 0 0 0 2px var(--skw-ring)";
 list.appendChild(ov);
}
function fillBrand(list){
 list.id="brandList";
 Object.keys(SKINS).forEach(function(key){list.appendChild(brandRow(key,function(k){apply(k)}))});
}

/* ---- desktop: ONE panel, two columns, one open state ---- */
function desktopUI(host){
 var panel=el("div","position:absolute;bottom:calc(100% + 10px);left:0;background:var(--skw-bg);border:1px solid var(--skw-hair);border-radius:14px;padding:8px;display:none;grid-template-columns:1fr 1fr;gap:4px;width:432px;max-width:calc(100vw - 32px);box-shadow:0 24px 60px -20px rgba(0,0,0,.4)");
 panel.id="matrixPanel";
 panel.style.viewTransitionName="skin-matrix";
 var colL=buildColumn("Layout · pick to travel",fillLayout);
 var colB=buildColumn("Brand · applies live",fillBrand);
 panel.appendChild(colL);panel.appendChild(colB);
 var curLayout=LAYOUTS.filter(function(l){return l[0]===pageKey})[0];
 var lname=inExpl?(curLayout?curLayout[1].replace(/^\d+ /,""):"Overview"):"Portfolio";
 var b1=el("button",BTN,'◐ <span style="color:var(--skw-dim);font-weight:500">Layout:</span> <span style="display:inline-block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;vertical-align:bottom;text-align:left;width:96px">'+lname+'</span><span style="color:var(--skw-dim)">|</span> <span style="color:var(--skw-dim);font-weight:500">Brand:</span> <span id="skinCur" style="display:inline-block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;vertical-align:bottom;text-align:left;width:118px">Native</span>');
 function fit(){
  colL._list.style.maxHeight=colB._list.style.maxHeight="none";
  var avail=panel.getBoundingClientRect().bottom-64; /* header rows + margins */
  var h=Math.min(Math.max(colL._list.scrollHeight,colB._list.scrollHeight)+2,avail);
  colL._list.style.maxHeight=h+"px";colB._list.style.maxHeight=h+"px";
 }
 function setOpen(open,skipSave){
  panel.style.display=open?"grid":"none";
  if(open)fit();
  if(!skipSave){var st=loadState();st.open=open;if(!open){delete st.ls;delete st.bs}saveState(st)}
 }
 b1.onclick=function(e){e.stopPropagation();setOpen(panel.style.display==="none")};
 document.addEventListener("click",function(e){if(!host.contains(e.target)&&panel.style.display!=="none")setOpen(false)});
 addEventListener("resize",function(){if(panel.style.display!=="none")fit()});
 host.appendChild(panel);host.appendChild(b1);
 /* restore as one frozen unit */
 var st=loadState();
 if(st.open){
  setOpen(true,true);
  requestAnimationFrame(function(){
   if(st.ls)colL._list.scrollTop=st.ls;
   if(st.bs)colB._list.scrollTop=st.bs;
  });
 }
}

/* ---- mobile: same component as a bottom sheet ---- */
function openSheet(){
 if(document.getElementById("matrixSheet"))return;
 var back=el("div","position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:2147483100");
 back.id="matrixSheet";
 var sheet=el("div","position:fixed;left:0;right:0;bottom:0;background:var(--skw-bg);border-top:1px solid var(--skw-hair);border-radius:18px 18px 0 0;z-index:2147483101;padding:14px 14px calc(14px + env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;gap:10px;max-height:82dvh");
 sheet.style.viewTransitionName="skin-matrix";
 sheet.appendChild(el("div","color:var(--skw-ink);font:600 13px/1 -apple-system,sans-serif;text-align:center;padding-top:2px","Layout × Brand"));
 var cols=el("div","display:grid;grid-template-columns:1fr 1fr;gap:10px;min-height:0");
 var colL=buildColumn("Layout",function(list){
  list.style.cssText+=";display:flex;flex-direction:column;gap:8px";
  fillLayout(list);
  [].forEach.call(list.children,function(b){b.style.minHeight="45px";b.style.flex="none"});
 });
 var colB=buildColumn("Brand",function(list){
  list.style.cssText+=";display:flex;flex-direction:column;gap:8px";
  fillBrand(list);
  [].forEach.call(list.children,function(b){b.style.minHeight="45px";b.style.flex="none"});
 });
 [colL,colB].forEach(function(c){c.style.cssText+=";border:1px solid var(--skw-hair);border-radius:12px;overflow:hidden"});
 cols.appendChild(colL);cols.appendChild(colB);
 sheet.appendChild(cols);
 var ok=el("button",BTN+";justify-content:center;background:var(--skw-ink);color:var(--skw-bg);border-color:transparent;min-height:46px","Done");
 function shut(){var st=loadState();st.open=false;saveState(st);back.remove()}
 ok.onclick=shut;
 sheet.appendChild(ok);
 back.appendChild(sheet);
 back.addEventListener("click",function(e){if(e.target===back)shut()});
 document.body.appendChild(back);
 var st=loadState();st.open=true;saveState(st);
 requestAnimationFrame(function(){
  if(st.ls)colL._list.scrollTop=st.ls;
  if(st.bs)colB._list.scrollTop=st.bs;
 });
}

function injectVT(){
 var st=document.createElement("style");
 st.textContent="@view-transition{navigation:auto}"
 +"#skinHost{view-transition-name:skin-host}"
 +"::view-transition-group(skin-host),::view-transition-group(skin-matrix){z-index:2147483001;animation:none!important}"
 +"::view-transition-old(skin-host),::view-transition-old(skin-matrix){display:none}"
 +"::view-transition-new(skin-host),::view-transition-new(skin-matrix){animation:none!important;opacity:1}"
 +"::view-transition-old(root),::view-transition-new(root){animation-duration:.6s;animation-timing-function:cubic-bezier(.4,0,.2,1)}"
 +"@media (prefers-reduced-motion:reduce){::view-transition-group(*),::view-transition-image-pair(*),::view-transition-old(*),::view-transition-new(*){animation:none!important}}";
 document.head.appendChild(st);
}
function ui(){
 var host=el("div","position:fixed;left:16px;bottom:16px;z-index:2147483000;display:flex;flex-direction:row;gap:8px;font:12px/1 -apple-system,sans-serif");
 host.id="skinHost";
 if(isMobile()){
  var curLayout=LAYOUTS.filter(function(l){return l[0]===pageKey})[0];
  var m1=el("button",BTN,'◐ <span style="color:var(--skw-dim);font-weight:500">Layout:</span> <span style="display:inline-block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;vertical-align:bottom;text-align:left;width:86px">'+(inExpl?(curLayout?curLayout[1].replace(/^\d+ /,""):"Overview"):"Portfolio")+'</span><span style="color:var(--skw-dim)">|</span> <span style="color:var(--skw-dim);font-weight:500">Brand:</span> <span id="skinCur" style="display:inline-block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;vertical-align:bottom;text-align:left;width:104px">Native</span>');
  m1.onclick=openSheet;
  host.appendChild(m1);
  document.body.appendChild(host);
  var st=loadState();
  if(st.open)setTimeout(openSheet,60);
 }else{
  desktopUI(host);
  document.body.appendChild(host);
  /* re-run restore now that it's in the DOM (sizes need real geometry) */
  var p=document.getElementById("matrixPanel");
  if(p&&p.style.display!=="none"){
   requestAnimationFrame(function(){
    var ev=new Event("resize");dispatchEvent(ev);
   });
  }
 }
}
function init(){
 if(inExpl)injectVT();
 setMode();
 ui();
 var k="native";
 try{k=localStorage.getItem("expl-skin")||"native"}catch(e){}
 apply(k);
 /* follow the site's light/dark toggle */
 new MutationObserver(setMode).observe(root,{attributes:true,attributeFilter:["data-theme"]});
 if(inExpl){
  introOnce();
  if(pageKey!=="index"){
   /* every exploration carries the same two exits as the overview */
   var home="../index.html#f=side";
   if(/12-career\/explorations\//.test(location.pathname))home="../portfolio-site/index.html#f=side";
   var esc=el("div","position:fixed;top:16px;left:16px;right:16px;display:flex;justify-content:space-between;pointer-events:none;z-index:2147483000;font:12px/1 -apple-system,sans-serif");
   var bk=el("button",BTN+";pointer-events:auto","← Back");
   bk.setAttribute("aria-label","Back to where you came from");
   bk.onclick=function(){
    try{if(document.referrer&&new URL(document.referrer).origin===location.origin&&history.length>1){history.back();return}}catch(e){}
    location="index.html";
   };
   var hm=el("a",BTN+";pointer-events:auto;text-decoration:none","Home · Side quests →");
   hm.href=home;
   esc.appendChild(bk);esc.appendChild(hm);
   document.body.appendChild(esc);
  }
 }else{
  /* main site: widget lives behind the dive depth; modal fires the first
     time dive is entered */
  var gate=document.createElement("style");
  gate.textContent='body:not([data-depth="dive"]) #skinHost{display:none!important}';
  document.head.appendChild(gate);
  function chk(){if(document.body.getAttribute("data-depth")==="dive")introOnce()}
  new MutationObserver(chk).observe(document.body,{attributes:true,attributeFilter:["data-depth"]});
  chk();
 }
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
