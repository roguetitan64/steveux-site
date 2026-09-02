/* Steven Long Tran, portfolio runtime: depth, filters, motion. No frameworks. */
(function(){
 var d=document, b=d.body;

 /* ---- reading depth: scan / read / dive (persists across pages) ---- */
 var depth=localStorage.getItem('depth')||'dive';
 /* v5.1: levels cut to Scan/Read (value 'dive'). A visitor holding the retired
    middle value lands on a state with no button — coerce to the last available. */
 if(d.querySelector('.depth')&&!d.querySelector('.depth button[data-d="'+depth+'"]')){
  var btns=d.querySelectorAll('.depth button');
  depth=btns.length?btns[btns.length-1].dataset.d:'dive';
 }
 function setDepth(v,animate){
  var apply=function(){
   b.setAttribute('data-depth',v);
   d.querySelectorAll('.depth button').forEach(function(x){var on=x.dataset.d===v;x.classList.toggle('on',on);x.setAttribute('aria-pressed',on?'true':'false')});
   if(v==='dive')d.querySelectorAll('.d-dive details').forEach(function(x){x.open=true});
   if(v==='read')d.querySelectorAll('.d-dive details').forEach(function(x){x.open=false});
   if(window.__refreshHero)window.__refreshHero();
  };
  localStorage.setItem('depth',v);
   var n=d.getElementById('depthNote');
   if(n){n.textContent={scan:'Scan. The claim and the number, in about thirty seconds.',dive:'Read. Everything opens. The decisions, what each one cost, the evidence, and the part I got wrong.'}[v]}
  if(animate&&d.startViewTransition){document.documentElement.classList.add('vt-depth');var vt=d.startViewTransition(apply);vt.finished.finally(function(){document.documentElement.classList.remove('vt-depth')})}else{apply()}
 }
 setDepth(depth,false);
 d.querySelectorAll('.depth button').forEach(function(x){x.addEventListener('click',function(){setDepth(x.dataset.d,true)})});

 /* ---- bento category filters ---- */
 

 /* ---- scroll reveal ---- */
 var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});
 d.querySelectorAll('.rv').forEach(function(x){io.observe(x)});

 /* ---- cursor-aware tile glow ---- */
 /* v5.2: coalesced to one write per animation frame. It was writing two CSS
    custom properties per pointermove per tile, each invalidating a radial-gradient
    paint — on work.html that is 10 tiles competing for the same frame. */
 d.querySelectorAll('.bento .tile, .wgrid .tile').forEach(function(t){
  var pending=false,px=0,py=0;
  t.addEventListener('pointermove',function(e){
   var r=t.getBoundingClientRect(); px=e.clientX-r.left; py=e.clientY-r.top;
   if(pending)return; pending=true;
   requestAnimationFrame(function(){
    t.style.setProperty('--mx',px+'px'); t.style.setProperty('--my',py+'px'); pending=false;
   });
  },{passive:true});
 });

 /* ---- hero word animation setup ---- */
 function __kin(h,text){
  var words=text.trim().split(/\s+/);
  if(words.length>14){
   h.innerHTML='<span class="w"><span class="blockrise">'+words.map(function(w){return /^\*/.test(w)?'<em>'+w.slice(1)+'</em>':w}).join(' ')+'</span></span>';
   return;
  }
  h.innerHTML=words.map(function(w,i){
   var em=/^\*/.test(w); w=w.replace(/^\*/,'');
   return '<span class="w"><span style="--i:'+i+'">'+(em?'<em>'+w+'</em>':w)+'</span></span>';
  }).join(' ');
 }
 var __hero=d.querySelector('h1[data-kinetic]');
 if(__hero){
  var __tiers={scan:__hero.textContent.trim()};
  function __pick(){var dep=d.body.getAttribute('data-depth')||'read';return __tiers[dep]||__tiers.scan}
  function __render(){var t=__pick();if(__hero.__t===t)return;__hero.__t=t;__kin(__hero,t)}
  __hero.__t=__tiers.scan;__kin(__hero,__tiers.scan);
  window.__setHero=function(t){if(typeof t==='string')t={scan:t};__tiers=t;__render()};
  window.__refreshHero=__render;
 }

 /* ---- image slots: mark missing gracefully ---- */
 d.querySelectorAll('.wmark img').forEach(function(i){function ok(){i.parentElement.classList.add('haslogo')}if(i.complete&&i.naturalWidth>0)ok();else i.addEventListener('load',ok)});
 d.querySelectorAll('figure[data-file] img').forEach(function(img){
  img.addEventListener('error',function(){img.closest('figure').classList.add('missing')});
  if(img.complete&&img.naturalWidth===0)img.closest('figure').classList.add('missing');
 });
})();

/* ---- section rail: where am I + jump + preview ---- */
(function(){
 var d=document;
 var heads=[].slice.call(d.querySelectorAll('.prose h2, .dd2 > h2'));
 var diveOnly=false;
 if(heads.length<3){heads=[].slice.call(d.querySelectorAll('.dossier .band h2, .dossier .tail h2'));diveOnly=true}
 if(heads.length<3)return;
 var rail=d.createElement('nav');
 rail.className='rail'+(diveOnly?' rail-dive':'');
 rail.setAttribute('aria-label','Page sections');
 var items=[];
 heads.forEach(function(h,ix){
  if(!h.id)h.id='sec-'+ix;
  var title=h.textContent.replace(/^\s*\d+\s*/,'').trim();
  var nx=h.nextElementSibling,pv='';
  while(nx&&!pv){pv=(nx.textContent||'').replace(/\s+/g,' ').trim().slice(0,110);nx=nx.nextElementSibling}
  var b=d.createElement('button');
  b.type='button';b.setAttribute('aria-label',title);
  b.innerHTML='<span class="chip2"><span class="cap">'+('0'+(ix+1)).slice(-2)+'</span><b></b><span class="pv"></span></span><i></i>';
  b.querySelector('b').textContent=title;
  b.querySelector('.pv').textContent=pv?pv+'\u2026':'';
  b.addEventListener('click',function(){window.__smoothTo?window.__smoothTo(h):h.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'})});
  rail.appendChild(b);items.push({h:h,b:b});
 });
 d.body.appendChild(rail);
 var spy=new IntersectionObserver(function(es){
  es.forEach(function(e){if(e.isIntersecting)items.forEach(function(it){it.b.classList.toggle('on',it.h===e.target)})});
 },{rootMargin:'-15% 0px -65% 0px'});
 items.forEach(function(it){spy.observe(it.h)});
})();

/* ---- cursor peek: preview what a click gives you ---- */
(function(){
 var d=document;
 if(!matchMedia('(pointer:fine)').matches||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 var chip=d.createElement('div');chip.id='peek';chip.setAttribute('aria-hidden','true');d.body.appendChild(chip);
 d.addEventListener('pointermove',function(e){
  var t=e.target.closest?e.target.closest('[data-peek]'):null;
  if(t){chip.textContent=t.getAttribute('data-peek');chip.style.left=e.clientX+'px';chip.style.top=e.clientY+'px';chip.classList.add('on')}
  else chip.classList.remove('on');
 },{passive:true});
})();
/* ---- hash filter: index.html#f=about preselects a pill ---- */
(function(){
 var m=location.hash.match(/^#f=(\w+)/);
 if(!m)return;
 var b=document.querySelector('.pills button[data-f="'+m[1]+'"]');
 if(b)b.click();
})();

/* ---- dark mode: init + Side Quests toggle ---- */
(function(){
 var d=document,root=d.documentElement;
 try{if(localStorage.getItem('theme')==='dark')root.setAttribute('data-theme','dark')}catch(e){}
 var el=d.getElementById('themeTile');
 function lab(){var s=d.getElementById('themeState');if(s)s.textContent=root.getAttribute('data-theme')==='dark'?'off':'on'}
 lab();
 if(!el)return;
 el.addEventListener('click',function(){
  var dark=root.getAttribute('data-theme')==='dark';
  if(dark)root.removeAttribute('data-theme');else root.setAttribute('data-theme','dark');
  try{localStorage.setItem('theme',dark?'light':'dark')}catch(e){}
  lab();
 });
})();

/* ---- hide-on-scroll header + Nav button ---- */
(function(){
 var d=document,h=d.querySelector('header');if(!h)return;
 var btn=d.createElement('button');btn.id='navBtn';btn.type='button';btn.setAttribute('aria-label','Show navigation');
 btn.innerHTML='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M1 3h14M1 8h9M1 13h12"/></svg>Nav';
 d.body.appendChild(btn);
 var lastY=0,hidden=false;
 function show(){if(hidden){h.classList.remove('hid');btn.classList.remove('on');hidden=false}}
 function hide(){if(!hidden){h.classList.add('hid');btn.classList.add('on');hidden=true}}
 addEventListener('scroll',function(){
  var y=scrollY;
  if(y<120){show()}
  else if(y>lastY+6){hide()}
  else if(y<lastY-6){show()}
  lastY=y;
 },{passive:true});
 d.addEventListener('pointermove',function(e){if(e.clientY<70)show()},{passive:true});
 btn.addEventListener('click',show);
})();


/* ---- a11y dock v2: languages A→Z, rolling label swaps, bottom-right on mobile ---- */
(function(){
 var d=document,root=d.documentElement;
 var LANGS=[
  {code:'ar',dir:'rtl',en:'Arabic',native:'العربية'},
  {code:'yue',dir:'ltr',en:'Cantonese',native:'廣東話'},
  {code:'en',dir:'ltr',en:'English',native:'English'},
  {code:'fr',dir:'ltr',en:'French',native:'Français'},
  {code:'de',dir:'ltr',en:'German',native:'Deutsch'},
  {code:'ja',dir:'ltr',en:'Japanese',native:'日本語'},
  {code:'zh',dir:'ltr',en:'Mandarin',native:'中文'},
  {code:'es',dir:'ltr',en:'Spanish',native:'Español'},
  {code:'vi',dir:'ltr',en:'Vietnamese',native:'Tiếng Việt'}
 ];
 var ABBR={ar:'عربي',yue:'粵語',en:'Eng',fr:'Fra',de:'Deu',ja:'日本',zh:'中文',es:'Esp',vi:'Việt'};
 var STR={
  en:{nav:['Home','Work','Side Quests','About'],depth:['Scan','Read']},
  es:{nav:['Inicio','Trabajo','Misiones','Sobre mí'],depth:['Vistazo','Leer']},
  vi:{nav:['Trang chủ','Công việc','Việc phụ','Giới thiệu'],depth:['Lướt','Đọc']},
  fr:{nav:['Accueil','Travail','Quêtes annexes','À propos'],depth:['Survol','Lecture']},
  de:{nav:['Startseite','Arbeit','Nebenquests','Über mich'],depth:['Überblick','Lesen']},
  ja:{nav:['ホーム','仕事','サイドクエスト','私について'],depth:['ざっと','読む']},
  zh:{nav:['首页','作品','支线任务','关于'],depth:['速览','阅读']},
  yue:{nav:['主頁','作品','支線任務','關於'],depth:['快睇','閱讀']},
  ar:{nav:['الرئيسية','الأعمال','مهام جانبية','نبذة'],depth:['تصفح','قراءة']}
 };
 function get(k,f){try{return localStorage.getItem(k)||f}catch(e){return f}}
 function set(k,v){try{localStorage.setItem(k,v)}catch(e){}}
 var rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
 function roll(el,txt,idx){
  if(rm||el.__rolling){el.textContent=txt;return}
  if(el.textContent===txt)return;
  el.__rolling=true;
  setTimeout(function(){
   el.classList.add('lout');
   setTimeout(function(){
    el.textContent=txt;el.classList.remove('lout');el.classList.add('lin');
    setTimeout(function(){el.classList.remove('lin');el.__rolling=false},380);
   },170);
  },(idx||0)*45);
 }
 var userAction=false;
 function apply(){
  var lang=get('lang','en'),fs=get('fs','1');
  var L=LANGS.filter(function(x){return x.code===lang})[0]||LANGS[2];
  root.setAttribute('lang',lang);
  root.setAttribute('dir',L.dir);
  root.style.setProperty('--fs',fs);
  var S=STR[lang]||STR.en;
  d.querySelectorAll('.pills button, .navlinks a').forEach(function(el,i){
   var t=S.nav[i];if(t===undefined)return;
   userAction?roll(el,t,i):el.textContent=t;
  });
  d.querySelectorAll('.depth button').forEach(function(el,i){
   var t=S.depth[i];if(!t)return;
   userAction?roll(el,t,i):el.textContent=t;
  });
  var dk=d.getElementById('dkLang');if(dk)(userAction?roll(dk,ABBR[lang]||'Eng',0):dk.textContent=ABBR[lang]||'Eng');
  userAction=false;
 }
 var WAVE='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M1 8c2.5-5 5-5 7 0s4.5 5 7 0"/></svg>';
 var BOLT='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M9 1 3 9h4l-1 6 6-8H8l1-6z"/></svg>';
 var dock=d.createElement('div');dock.id='dock';
 dock.innerHTML='<button id="dkLang" aria-label="Language" title="Language">Eng</button><button id="dkSize" aria-label="Text size" title="Text size">Aa</button><button id="dkScroll" aria-label="Scrolling" title="Scrolling"></button>';
 d.body.appendChild(dock);
 function scrollIco(){var sm='1';try{sm=localStorage.getItem('smooth')||'1'}catch(e){}var b=d.getElementById('dkScroll');b.innerHTML=sm==='1'?WAVE:BOLT;b.title='Scrolling: '+(sm==='1'?'Smooth':'Instant')}
 scrollIco();
 var panel=d.createElement('div');panel.id='dockPanel';panel.setAttribute('role','dialog');panel.setAttribute('aria-label','Language, text size, and scrolling');
 d.body.appendChild(panel);
 function build(){
  var nm=get('nameMode','native'),lang=get('lang','en'),fs=get('fs','1');
  var h='<span class="cap">Language</span>';
  LANGS.forEach(function(L){
   h+='<button class="langopt'+(lang===L.code?' on':'')+'" data-lang="'+L.code+'"><span class="lname">'+(nm==='native'?L.native:L.en)+'</span><span class="dirtag">'+(L.dir==='rtl'?'RTL ⟵':'LTR ⟶')+'</span></button>';
  });
  h+='<button id="nameMode">'+(nm==='native'?'Show English names':'Show native names')+'</button>';
  h+='<span class="cap" style="margin-top:20px">Text size</span><div class="fsrow">'
    +'<button class="s1'+(fs==='1'?' on':'')+'" data-fs="1">Small</button>'
    +'<button class="s2'+(fs==='1.15'?' on':'')+'" data-fs="1.15">Medium</button>'
    +'<button class="s3'+(fs==='1.3'?' on':'')+'" data-fs="1.3">Large</button></div>';
  var sm='1';try{sm=localStorage.getItem('smooth')||'1'}catch(e){}
  h+='<span class="cap" style="margin-top:20px">Experience</span><div class="fsrow">'
    +'<button data-sm="1" style="font-size:calc(16px*var(--fs,1))" class="'+(sm==='1'?'on':'')+'">'+WAVE+'Smooth</button>'
    +'<button data-sm="0" style="font-size:calc(16px*var(--fs,1))" class="'+(sm==='0'?'on':'')+'">'+BOLT+'Instant</button></div>';
  h+='<p class="dockNote">Interface labels are drafted translations. case-study prose stays in English for now.</p>';
  panel.innerHTML=h;
  panel.querySelectorAll('.langopt').forEach(function(b){b.addEventListener('click',function(){
   set('lang',b.getAttribute('data-lang'));userAction=true;apply();
   panel.querySelectorAll('.langopt').forEach(function(x){x.classList.toggle('on',x===b)});
  })});
  panel.querySelector('#nameMode').addEventListener('click',function(){
   var cur=get('nameMode','native'),next=cur==='native'?'en':'native';
   set('nameMode',next);
   panel.querySelectorAll('.langopt').forEach(function(b,i){
    var L=LANGS[i];roll(b.querySelector('.lname'),next==='native'?L.native:L.en,i);
   });
   this.textContent=next==='native'?'Show English names':'Show native names';
  });
  panel.querySelectorAll('.fsrow button[data-fs]').forEach(function(b){b.addEventListener('click',function(){
   set('fs',b.getAttribute('data-fs'));apply();
   panel.querySelectorAll('.fsrow button[data-fs]').forEach(function(x){x.classList.toggle('on',x===b)});
  })});
  panel.querySelectorAll('.fsrow button[data-sm]').forEach(function(b){b.addEventListener('click',function(){
   var v=b.getAttribute('data-sm')==='1';
   if(window.__setSmooth)window.__setSmooth(v);else try{localStorage.setItem('smooth',v?'1':'0')}catch(e){}
   panel.querySelectorAll('.fsrow button[data-sm]').forEach(function(x){x.classList.toggle('on',x===b)});
   scrollIco();
  })});
 }
 build();apply();
 function toggle(){panel.classList.toggle('on')}
 d.getElementById('dkLang').addEventListener('click',toggle);
 d.getElementById('dkSize').addEventListener('click',toggle);
 d.getElementById('dkScroll').addEventListener('click',toggle);
 d.addEventListener('click',function(e){if(!panel.contains(e.target)&&!dock.contains(e.target))panel.classList.remove('on')});
})();

/* ---- filter system: + dot, fly-in panel, falling-up choreography ---- */
(function(){
 var d=document,bento=d.querySelector('.bento');if(!bento)return;
 var panel=d.getElementById('fPanel'),plus=d.getElementById('fPlus'),chipsBox=d.getElementById('fChips');
 var state={section:'all',domain:[],kind:[]};
 var tiles=[].slice.call(bento.querySelectorAll('.tile'));
 var origBig=tiles.map(function(t){return t.classList.contains('big')});

 /* ---- dynamic hero title: I make {descriptor} {nouns} feel {outcome} ---- */
 var DOMV={telecom:['sprawling','telecom systems','navigable'],commerce:['leaky','checkout flows','finished'],payments:['risky','money moments','safe'],api:['opaque','developer platforms','self-evident'],'ai-native':['autonomous','AI workflows','accountable'],planning:['branching','plans and their ripples','foreseeable'],enterprise:['tangled','enterprise systems','obvious'],regulated:['untouchable','regulated content','human'],consumer:['everyday','products','considered'],brand:['quiet','premium brands','earned'],meta:['my own','tools','honest']};
 var PAIRV={'ai-native+api':'I make platforms for humans and machines feel *fair *to *both.','commerce+payments':'I make spending money feel *safe.','enterprise+telecom':'I make 200 codebases feel *like *one *product.','consumer+regulated':'I make compliance feel *human.'};
 var SECTV={all:'I make tangled enterprise systems feel *obvious.',work:'I make complex systems feel *clear.',about:'I make an 11-year career feel *legit.',side:'I make side quests feel *like *main *quests.'};
 var EMPTYV='Every filter you add will build you the *design *unicorn *deity that I am today.';
 function emize(o){return o.split(' ').map(function(w){return '*'+w}).join(' ')}
 function heroFor(count){
  if(!count)return EMPTYV;
  var ds=state.domain;
  if(ds.length===1){var t=DOMV[ds[0]];if(t)return 'I make '+t[0]+' '+t[1]+' feel '+emize(t[2])+'.'}
  if(ds.length===2){
   var key=ds.slice().sort().join('+');
   if(PAIRV[key])return PAIRV[key];
   var a=DOMV[ds[0]],b=DOMV[ds[1]];
   if(a&&b)return 'I make '+a[0]+' '+a[1]+' and '+b[1]+' feel '+emize(b[2])+'.';
  }
  if(ds.length>=3)return 'I make many kinds of complexity feel *obvious.';
  return SECTV[state.section]||SECTV.all;
 }
 var READV={"sect:all": "I make tangled enterprise systems feel *obvious, across eleven years of telecom commerce, payments, and platforms redesigned until people stop needing help.", "sect:work": "I make complex systems feel *clear, across four case studies of decisions defended, arguments lost well, and flows that shipped.", "sect:about": "I make an 11-year career feel *legit, so here is who I am, how I work with AI, and the principles I don't trade.", "sect:side": "I make side quests feel *like *main *quests, including an LLC with inventory, a daily streak, and a site that documents its own rebuild.", "telecom": "I make sprawling telecom systems feel *navigable. Trade-in, checkout, credit, and account flows across a 200-codebase estate.", "commerce": "I make leaky checkout flows feel *finished. Carts that survive their own edge cases and orders that stop failing silently.", "payments": "I make risky money moments feel *safe. Money movement designed so people learn what's possible before they commit.", "api": "I make opaque developer platforms feel *self-evident. Where documentation is a design property, not an afterthought.", "ai-native": "I make autonomous AI workflows feel *accountable. Models interpret, interfaces verify, humans confirm.", "enterprise": "I make tangled enterprise systems feel *obvious. The sentence this whole site exists to prove.", "regulated": "I make untouchable regulated content feel *human. Clinical material that survives legal review and still reads like someone cares.", "consumer": "I make everyday products feel *considered. Respecting attention instead of harvesting it.", "brand": "I make quiet premium brands feel *earned. Craftsmanship and restraint doing the work hype can't.", "meta": "I make my own tools feel *honest. Including this site, which keeps a public log of its own decisions."};
 var DIVEV={"sect:all": "I make tangled enterprise systems feel *obvious. For eleven years I've worked where legacy code, business rules, and real users collide. T-Mobile's commerce and trade-in machinery, Western Union's money movement, an API marketplace built for human and AI customers. The pattern under all of it: find what confuses people, then design until the system explains itself.", "sect:work": "I make complex systems feel *clear. The studies below aren't screen tours. Each is built around the hardest call in the room: a modal argument history settled, an ordering system that treats AI agents as users, a locator that answers before the tap, a site shipped under full NDA. Constraints included, numbers only where I can defend them.", "sect:about": "I make an 11-year career feel *legit. Enterprise commerce taught me clarity is a feature; pharma taught me every decision needs a defensible why; AI-native work taught me interfaces are becoming verification layers. The tiles below are the short version of all three.", "sect:side": "I make side quests feel *like *main *quests. Tail & Trot is an LLC in customer validation; the rebuild log is this site documenting itself; the streak is Spanish for a life split between San Francisco and Medell\u00edn. Side quests are where taste gets practiced without a client watching.", "telecom": "I make sprawling telecom systems feel *navigable. At T-Mobile that meant one trade-in flow serving four surfaces, bulk uploads the legacy systems could actually digest, and patterns that worked as contracts between codebases. The estate had 200 of them; users only ever saw one product.", "commerce": "I make leaky checkout flows feel *finished. Business commerce fails at the edges. Eligibility, trade-ins, and promotions colliding mid-order. The rebuild lifted completion roughly 10% per client, and the method was unglamorous: find every silent failure and make the system confess early.", "payments": "I make risky money moments feel *safe. At Western Union that meant reframing a pin map into an eligibility product. Payout limits, services, and hours on the result card itself, across 200+ countries and 40+ languages. People trust money interfaces that tell the truth early.", "api": "I make opaque developer platforms feel *self-evident. The API Marketplace inverted T-Mobile's model: stop building bespoke flows, open the system. My job was making that opening legible. To enterprise developers, and to the AI agents we knew were coming next.", "ai-native": "I make autonomous AI workflows feel *accountable. The pattern, designed at enterprise scale: frontier models interpret customer data, real-time UI renders the interpretation, and a human confirms what they can see. Chat is how you ask; interfaces are how you verify. That division is the discipline of agentic UX.", "enterprise": "I make tangled enterprise systems feel *obvious. Enterprise complexity isn't an aesthetic problem. It's eligibility logic, legal review, legacy formats, and org politics wearing a UI. The work is making systems confess their rules before users invest effort in the wrong door.", "regulated": "I make untouchable regulated content feel *human. Pharma taught the discipline: every pattern defensible in writing, every claim reviewed, research designed so the client could re-sell decisions to their own stakeholders. Sixteen weeks, full NDA, and a two-year extension earned on the result.", "consumer": "I make everyday products feel *considered. From remittances to premium pet gear, the consumer thread is the same: people can feel when something was designed with their errand in mind. Consideration is legible at a glance. And so is its absence.", "brand": "I make quiet premium brands feel *earned. Tail & Trot is the live experiment: no discounts, no noise. Provenance, materials, and patience. Restraint is the most expensive-looking thing a brand can wear.", "meta": "I make my own tools feel *honest. This site keeps a public rebuild log, a decision log, and a taste file it's required to obey. If I'd sell governance to a client, I should have to live under it too."};
 function tiersFor(count){
  var s=heroFor(count),key=null;
  if(count){if(state.domain.length===1)key=state.domain[0];else if(!state.domain.length)key='sect:'+state.section}
  return {scan:s,read:(key&&READV[key])||s,dive:(key&&DIVEV[key])||s};
 }
 var LBL={planning:'Planning & logistics',telecom:'Telecom',commerce:'Commerce',payments:'Payments',api:'API platforms','ai-native':'AI-native',enterprise:'Enterprise',regulated:'Pharma & regulated',consumer:'Consumer',brand:'Brand building',meta:'Meta','case-study':'Case studies',profile:'Profile',external:'Links out',contact:'Contact',doc:'Documents',setting:'Settings'};
 function kindOf(t){return t.getAttribute('data-kind')||(t.id==='themeTile'?'setting':'')}
 function match(t){
  var cats=(t.getAttribute('data-cat')||'').split(' ');
  if(state.section!=='all'&&cats.indexOf(state.section)<0)return false;
  if(state.domain.length){
   var dm=(t.getAttribute('data-domain')||'').split(' ');
   if(!state.domain.some(function(v){return dm.indexOf(v)>-1}))return false;
  }
  if(state.kind.length&&state.kind.indexOf(kindOf(t))<0)return false;
  return true;
 }
 function apply(animate){
  var visible=tiles.filter(match);
  var custom=state.section!=='all'||state.domain.length||state.kind.length;
  d.querySelectorAll('.bento .ghead').forEach(function(g){g.classList.toggle('hide',!!custom)});
  var dEls=[].slice.call(d.querySelectorAll('.dossier .band, .dossier .tail'));
  dEls.forEach(function(b){b.classList.toggle('hide',!match(b))});
  tiles.forEach(function(t,i){
   t.classList.toggle('hide',visible.indexOf(t)<0);
   t.classList.remove('drop');t.style.animationDelay='';
   t.classList.toggle('big',custom?false:origBig[i]);
  });
  bento.classList.toggle('dense',custom);
  if(custom&&visible.length){
   visible[0].classList.add('big');            /* first line: hero tile + companion fill the top */
  }
  if(animate&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
   visible.forEach(function(t,i){t.style.animationDelay=(i*45)+'ms';void t.offsetWidth;t.classList.add('drop')});
  }
  chips();
  if(window.__setHero)window.__setHero(tiersFor(visible.length));
  d.querySelectorAll('.pills button[data-f]').forEach(function(b){b.classList.toggle('on',b.dataset.f===state.section)});
  panel&&panel.querySelectorAll('[data-group] .fopt').forEach(function(o){
   var g=o.closest('[data-group]').getAttribute('data-group'),v=o.getAttribute('data-v');
   o.classList.toggle('on',g==='section'?state.section===v:state[g].indexOf(v)>-1);
  });
 }
 function chips(){
  if(!chipsBox)return;
  var h='';
  state.domain.forEach(function(v){h+=chip('domain',v)});
  state.kind.forEach(function(v){h+=chip('kind',v)});
  chipsBox.innerHTML=h;
  chipsBox.querySelectorAll('.fchip').forEach(function(c){c.addEventListener('click',function(){
   var g=c.getAttribute('data-g'),v=c.getAttribute('data-v');
   if(g==='section')state.section='all';else state[g]=state[g].filter(function(x){return x!==v});
   apply(true);
  })});
 }
 function chip(g,v){return '<button class="fchip" data-g="'+g+'" data-v="'+v+'">'+(LBL[v]||v)+' ×</button>'}
 if(plus&&panel){
  function toggle(open){
   var on=open!==undefined?open:!panel.classList.contains('on');
   panel.classList.toggle('on',on);plus.classList.toggle('open',on);plus.setAttribute('aria-expanded',on);
  }
  plus.addEventListener('click',function(){toggle()});
  d.getElementById('fClose').addEventListener('click',function(){toggle(false)});
  d.getElementById('fApply').addEventListener('click',function(){toggle(false)});
  d.getElementById('fClear').addEventListener('click',function(){state={section:'all',domain:[],kind:[]};apply(true)});
  d.addEventListener('keydown',function(e){if(e.key==='Escape')toggle(false)});
  panel.querySelectorAll('[data-group]').forEach(function(gr){
   var g=gr.getAttribute('data-group');
   gr.querySelectorAll('.fopt').forEach(function(o){o.addEventListener('click',function(){
    state.section='all';
    var v=o.getAttribute('data-v');
    if(g==='section')state.section=v;
    else{var i=state[g].indexOf(v);i>-1?state[g].splice(i,1):state[g].push(v)}
    apply(true);
   })});
  });
 }
 /* header pills route through the same engine */
 d.querySelectorAll('.pills button[data-f]').forEach(function(p){p.addEventListener('click',function(){state.section=p.dataset.f;state.domain=[];state.kind=[];apply(true)})});
 var m=location.hash.match(/^#f=(\w+)/);if(m){state.section=m[1]}
 apply(false);
})();

/* ---- accent cursor: dot -> focused ring over interactive targets ---- */
(function(){
 if(!matchMedia('(pointer:fine)').matches||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 var d=document,cur=d.createElement('div');cur.id='cur';cur.setAttribute('aria-hidden','true');d.body.appendChild(cur);
 /* v5.4: 1:1 tracking. No easing on position — that was the perceived lag.
    Written with transform (compositor-only) and coalesced to one write per frame. */
 d.documentElement.classList.add('cursor-live');
 var tx=0,ty=0,seen=false,pending=false;
 function place(){pending=false;cur.style.transform='translate3d('+tx+'px,'+ty+'px,0) translate(-50%,-50%)'}
 d.addEventListener('pointermove',function(e){
  tx=e.clientX;ty=e.clientY;
  if(!seen){seen=true;place();cur.classList.add('live')}
  else if(!pending){pending=true;requestAnimationFrame(place)}
  var f=e.target.closest&&e.target.closest('a,button,summary,input,select,label,[data-peek]');
  cur.classList.toggle('focused',!!f);
 },{passive:true});
 d.addEventListener('pointerdown',function(){cur.classList.add('down')});
 d.addEventListener('pointerup',function(){cur.classList.remove('down')});
 d.documentElement.addEventListener('pointerleave',function(){cur.classList.remove('live');seen=false});
 /* v5.4: the easing loop is gone. place() runs only when the pointer moves. */
})();

/* ---- steve-scroll: our own smooth engine (rebuilt 2026-07-06) ----
   The old version fought html{scroll-behavior:smooth}: every per-frame scrollTo
   became its own browser animation ~60x/sec. This engine forces instant writes
   and owns the easing itself. */
(function(){
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 var on=false,target=0,current=0,raf=null,last=null;
 var K=9; /* glide: higher=snappier, lower=floatier */
 function max(){return document.documentElement.scrollHeight-innerHeight}
 function clamp(){target=Math.max(0,Math.min(target,max()))}
 function write(y){window.scrollTo({top:y,left:0,behavior:'instant'})}
 function loop(ts){
  if(last==null)last=ts;
  var dt=Math.min((ts-last)/1000,.034);last=ts;
  current+=(target-current)*(1-Math.exp(-K*dt));
  if(Math.abs(target-current)<.5){current=target;write(current);raf=null;last=null;return}
  write(current);
  raf=requestAnimationFrame(loop);
 }
 function kick(){if(!raf){last=null;raf=requestAnimationFrame(loop)}}
 function wheel(e){
  if(e.ctrlKey)return;
  e.preventDefault();
  var dy=e.deltaY;
  if(e.deltaMode===1)dy*=16;else if(e.deltaMode===2)dy*=innerHeight;
  dy=Math.max(-220,Math.min(220,dy));
  if(!raf){target=current=scrollY}
  target+=dy;clamp();kick();
 }
 window.__smoothTo=function(el){
  var y=el.getBoundingClientRect().top+scrollY-84;
  if(!on){window.scrollTo({top:y,behavior:'smooth'});return}
  if(!raf)current=scrollY;
  target=y;clamp();kick();
 };
 window.__setSmooth=function(v){
  on=v;try{localStorage.setItem('smooth',v?'1':'0')}catch(e){}
  if(v){
   document.documentElement.style.scrollBehavior='auto';
   target=current=scrollY;
   addEventListener('wheel',wheel,{passive:false});
  }else{
   document.documentElement.style.scrollBehavior='';
   removeEventListener('wheel',wheel,{passive:false});
   if(raf){cancelAnimationFrame(raf);raf=null;last=null}
  }
 };
 addEventListener('scroll',function(){if(!raf){target=current=scrollY}},{passive:true});
 var pref='1';try{pref=localStorage.getItem('smooth')||'1'}catch(e){}
 if(pref==='1')window.__setSmooth(true);
})();

/* ---- depth-state tile icons: circle (scan) -> rounded rect (read); dive uses the band imagery ---- */
(function(){
 var d=document;if(!d.querySelector('.bento'))return;
 function g(p){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>'}
 var G={
  'findmybike-2026.html':g('<circle cx=\x226.5\x22 cy=\x2216.5\x22 r=\x223.2\x22/><circle cx=\x2217.5\x22 cy=\x2216.5\x22 r=\x223.2\x22/><path d=\x22M6.5 16.5 10 9h4.6l2.9 7.5M10 9 8.4 6h3.1M14.6 9l-4.1 7.5\x22/>'),
 'koe-2026.html':g('<path d="M4 6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H10l-4 4v-4H7a3 3 0 0 1-3-3z"/><path d="m9 9.5 2 2 4-4.5"/>'),
  'compas.html':g('<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5 13 13l-4.5 2.5L11 11z"/>'),
  'api-marketplace.html':g('<circle cx="5" cy="6" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="5" cy="12" r="2"/><path d="M7 6h6a4 4 0 0 1 4 4v0M7 12h12M7 18h6a4 4 0 0 0 4-4v0"/>'),
  'tmobile-trade-in.html':g('<path d="M4 9a8 8 0 0 1 14-3l2 2M20 4v4h-4M20 15a8 8 0 0 1-14 3l-2-2M4 20v-4h4"/>'),
  'western-union.html':g('<path d="M12 21s-6-5.5-6-10a6 6 0 1 1 12 0c0 4.5-6 10-6 10z"/><circle cx="12" cy="11" r="2"/>'),
  'rare-disease.html':g('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M12 9v6M9 12h6"/>'),
  'about.html':g('<circle cx="12" cy="9" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>'),
  'about.html#ai':g('<path d="M7 12a5 5 0 0 1 10 0 5 5 0 0 1-10 0z"/><path d="M12 3v4M12 17v4M3 12h4M17 12h4"/>'),
  'principles':g('<path d="M4 7h16M4 12h11M4 17h7"/>'),
  'numbers':g('<path d="M9 4 7 20M17 4l-2 16M4 9h17M3 15h17"/>'),
  'tailandtrot.com':g('<circle cx="12" cy="13" r="7"/><circle cx="12" cy="6" r="1.4"/><path d="M12 7.5V9"/>'),
  'explorations/index.html':g('<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>'),
  'rebuild-log.html':g('<path d="M12 3a9 9 0 1 0 9 9"/><path d="M21 3v6h-6"/><circle cx="12" cy="12" r="2"/>'),
  'themeTile':g('<g class="ic-sun"><circle cx="12" cy="12" r="4.5"/><path d="M12 2.5v2.6M12 18.9v2.6M2.5 12h2.6M18.9 12h2.6M5 5l1.9 1.9M17.1 17.1 19 19M19 5l-1.9 1.9M6.9 17.1 5 19"/></g><g class="ic-moon"><path d="M20 13A8 8 0 1 1 11 4a6.5 6.5 0 0 0 9 9z"/></g>'),
  'duolingo':g('<path d="M4 6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H10l-4 4v-4H7a3 3 0 0 1-3-3z"/>'),
  'instagram.com':g('<rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.5"/><circle cx="16.8" cy="7.2" r="1"/>'),
  'mailto:':g('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>'),
  'linkedin.com':g('<path d="M9 15a4 4 0 0 1 0-6l2-2a4 4 0 0 1 6 6l-1 1M15 9a4 4 0 0 1 0 6l-2 2a4 4 0 0 1-6-6l1-1"/>'),
  'resume.pdf':g('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>')
 };
 function keyFor(t){
  if(t.id==='themeTile')return 'themeTile';
  var pk=t.getAttribute('data-peek')||'';
  if(/Spanish/.test(pk))return 'duolingo';
  if(/Three rules/.test(pk))return 'principles';
  if(t.getAttribute('aria-label')==='Numbers')return 'numbers';
  var h=t.getAttribute('href')||'';
  for(var k in G){if(h.indexOf(k)>-1)return k}
  return null;
 }
 d.querySelectorAll('.bento .tile').forEach(function(t){
  if(t.querySelector('.tico'))return;
  var k=keyFor(t);if(!k)return;
  var s=d.createElement('span');s.className='tico';s.setAttribute('aria-hidden','true');s.innerHTML=G[k];
  t.insertBefore(s,t.firstChild);
 });
 d.querySelectorAll('.dossier .band').forEach(function(b){
  if(b.querySelector('.tico'))return;
  var go=b.querySelector('.go');if(!go)return;
  var h=go.getAttribute('href')||'',k=null;
  for(var kk in G){if(h.indexOf(kk)>-1){k=kk;break}}
  if(!k)return;
  var s=d.createElement('span');s.className='tico bico';s.setAttribute('aria-hidden','true');s.innerHTML=G[k];
  b.appendChild(s);
 });
})();

/* terminal easter egg: press ` anywhere */
(function(){
 addEventListener('keydown',function(e){
  if(e.key!=='`'||e.metaKey||e.ctrlKey||e.altKey)return;
  var t=e.target;
  if(t&&(/INPUT|TEXTAREA|SELECT/.test(t.tagName)||t.isContentEditable))return;
  var pre=/\/case-studies\//.test(location.pathname)?'../':'';
  location=pre+'explorations/01-terminal.html';
 });
})();

/* ---- v4: project thumbnails, screens vs drawings (persists) ---- */
(function(){
 var d=document, box=d.querySelector('.imgtog'); if(!box) return;
 var imgs=d.querySelectorAll('.tile .timg img[data-shot]');
 function get(){try{return localStorage.getItem('tileimg')||'shot'}catch(e){return 'shot'}}
 function set(v){
  imgs.forEach(function(i){
   var next=i.getAttribute(v==='draw'?'data-draw':'data-shot');
   if(next && i.getAttribute('src')!==next) i.setAttribute('src',next);
  });
  box.querySelectorAll('button').forEach(function(b){
   var on=b.dataset.i===v; b.classList.toggle('on',on); b.setAttribute('aria-pressed',on?'true':'false');
  });
  d.body.setAttribute('data-tileimg',v);
  try{localStorage.setItem('tileimg',v)}catch(e){}
 }
 set(get());
 box.addEventListener('click',function(e){
  var b=e.target.closest('button[data-i]'); if(!b) return;
  var v=b.dataset.i;
  if(d.startViewTransition){d.startViewTransition(function(){set(v)})}else{set(v)}
 });
})();

/* ---- v5.1: on-this-page rail, active state tracks the scroll ---- */
(function(){
 var d=document, rail=d.querySelector('.csrail'); if(!rail) return;
 var links=[].slice.call(rail.querySelectorAll('a'));
 var map={}; links.forEach(function(a){ map[a.getAttribute('href').slice(1)]=a });
 var heads=links.map(function(a){ return d.getElementById(a.getAttribute('href').slice(1)) })
                .filter(Boolean);
 if(!heads.length) return;
 function mark(id){ links.forEach(function(a){ a.classList.toggle('on', a.getAttribute('href')==='#'+id) }) }
 var io=new IntersectionObserver(function(es){
  var vis=es.filter(function(e){return e.isIntersecting});
  if(vis.length) mark(vis[0].target.id);
 },{rootMargin:'-90px 0px -65% 0px',threshold:0});
 heads.forEach(function(h){ io.observe(h) });
 mark(heads[0].id);
 links.forEach(function(a){ a.addEventListener('click',function(){ mark(a.getAttribute('href').slice(1)) }) });
})();


/* ---- v5.5: recommendations carousel. Guarded — no-ops on every page that
   does not contain #rcaro, so the shared script stays safe site-wide and no
   document tail had to change. ---- */
(function(){
 var d=document, caro=d.getElementById('rcaro'); if(!caro) return;
 var track=d.getElementById('rcaro-track'); if(!track) return;
 var slides=[].slice.call(track.children);
 var fg=d.getElementById('rcaro-fg'), pp=d.getElementById('rcaro-pp'), ppi=d.getElementById('rcaro-ppi');
 var count=d.getElementById('rcaro-count'), dots=d.getElementById('rcaro-dots');
 if(!slides.length||!fg||!pp||!dots) return;

 var CIRC=94.248;                                   /* 2 * PI * r, r = 15 */
 var DWELL=parseInt(caro.getAttribute('data-dwell'),10)||15000;
 var PAUSE_ICON='<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>';
 var PLAY_ICON='<path d="M7 4l13 8-13 8z"/>';
 var i=0, t0=0, held=0, raf=null, paused=false, stopped=false;
 var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;

 function go(n){
  i=(n+slides.length)%slides.length;
  track.style.transform='translateX('+(-i*100)+'%)';
  slides.forEach(function(s,k){ s.setAttribute('aria-hidden', k===i?'false':'true') });
  [].forEach.call(dots.children,function(b,k){ b.setAttribute('aria-selected', k===i?'true':'false') });
  count.textContent=(i+1)+' / '+slides.length;
  t0=performance.now(); held=0;
 }
 function ring(p){ fg.setAttribute('stroke-dashoffset', String(CIRC*(1-p))) }
 function tick(now){
  if(paused||stopped){ raf=null; return }
  var p=Math.min(1,(now-t0)/DWELL);
  ring(p);
  if(p>=1) go(i+1);
  raf=requestAnimationFrame(tick);
 }
 function play(){
  if(stopped) return;
  paused=false;
  /* resume where we left off — restarting the 15s on every mouse-out would mean
     a visitor who grazes the block never reaches slide 2. */
  t0=performance.now()-held; held=0;
  pp.setAttribute('aria-label','Pause the recommendations');
  ppi.innerHTML=PAUSE_ICON;
  if(!raf) raf=requestAnimationFrame(tick);
 }
 function pause(){
  if(paused) return;
  paused=true;
  held=Math.min(DWELL, performance.now()-t0);
  pp.setAttribute('aria-label','Play the recommendations');
  ppi.innerHTML=PLAY_ICON;
 }
 /* Any deliberate interaction stops rotation for good. Resuming under someone
    who is mid-sentence is the whole reason carousels are disliked. */
 function stop(){ stopped=true; paused=true; held=0; ring(0);
  pp.setAttribute('aria-label','Play the recommendations'); ppi.innerHTML=PLAY_ICON; }

 [].forEach.call(dots.children,function(b,n){
  b.addEventListener('click',function(){ stop(); go(n) });
 });

 /* v5.5c: prev / next. Both wrap, so neither is ever a dead control, and both
    stop autoplay for good — someone steering by hand should not be overruled. */
 var prev=d.getElementById('rcaro-prev'), next=d.getElementById('rcaro-next');
 if(prev) prev.addEventListener('click',function(){ stop(); go(i-1) });
 if(next) next.addEventListener('click',function(){ stop(); go(i+1) });
 /* the controls live in .rcaro-bar, a SIBLING of #rcaro — so the key handler
    goes on their common parent or it never sees the event. */
 var keyScope=caro.parentNode||caro;
 keyScope.addEventListener('keydown',function(e){
  if(e.key==='ArrowLeft'){ stop(); go(i-1); e.preventDefault(); }
  else if(e.key==='ArrowRight'){ stop(); go(i+1); e.preventDefault(); }
 });
 pp.addEventListener('click',function(){
  if(stopped||paused){ stopped=false; play(); } else { pause(); }
 });
 caro.addEventListener('mouseenter',function(){ if(!stopped&&!paused) pause() });
 caro.addEventListener('mouseleave',function(){ if(!stopped&&paused) play() });
 caro.addEventListener('focusin', stop);           /* keyboard: stop permanently */
 d.addEventListener('visibilitychange',function(){ if(d.hidden){ if(!stopped)pause() } });

 go(0);
 if(reduce) stop(); else play();
})();
