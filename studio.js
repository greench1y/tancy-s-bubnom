'use strict';
// одна студия, две страницы: assets.html (пост и профиль, с телефоном) и merch.html (мерч)
const PAGE=document.body.dataset.page||'social',MERCHP=PAGE==='merch',KS=MERCHP?['merch']:['post','avatar'];
const $=id=>document.getElementById(id),clone=o=>JSON.parse(JSON.stringify(o)),KEY='tsb.assets.v1';
const mk=(o={},x={})=>Object.assign({img:null,pan:[0,0],set:Object.assign(clone(DEFSET),o)},x);
// ───────── стартовые посты: композиции из макета
// дефолт: проект из defaults.js (если его нет, старые примеры)
const DEF=typeof DEFAULTS!=='undefined'?DEFAULTS:null;
const startPosts=()=>DEF?DEF.posts.map(unpack):[mk(EXAMPLE)];
const startProfile=()=>DEF?DEF.profile.map(unpack):[mk({surf:'pink'},{av:true}),...['отзывы','эко-бубны','практики','мастер-классы','барабаны'].map((t,i)=>mk({surf:['white','yellow','pink'][i%3],text:t,tsize:.5},{title:t}))];
const startMerch=()=>DEF?DEF.merchs.map(unpack):MERCHS.map(([k,o])=>mk(o,{merch:k}));
function unpack(o){const p=mk(o.set,{pan:(o.pan||[0,0]).slice()});for(const k of['title','av','pid','link','merch','dphoto'])if(o[k]!=null)p[k]=o[k];if(p.pid)loadPhoto(p);else if(p.dphoto)defaultPhoto(p);return p}
// дефолтное фото кладётся в базу как загруженное, дальше живёт как обычное
async function defaultPhoto(p){const u=(typeof DEFAULT_PHOTOS!=='undefined'?DEFAULT_PHOTOS:{})[p.dphoto];if(!u)return;try{const f=await (await fetch(u)).blob();await keepPhoto(p,f);p.img=await createImageBitmap(f);save();if(ready){layout();phone.render()}}catch(e){console.warn(e)}}
const L={post:null,avatar:null,merch:null};
let S={tab:'post',fmt:DEF?DEF.fmt:'3:4',eye:false},SEL={post:0,el:null,editing:false},ready=false;
// ───────── хранение
const db=()=>new Promise((ok,no)=>{const r=indexedDB.open('tsb.photos',1);r.onupgradeneeded=()=>r.result.createObjectStore('p');r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)});
async function keepPhoto(p,f){p.pid='p'+Date.now()+Math.random().toString(36).slice(2,7);try{(await db()).transaction('p','readwrite').objectStore('p').put(f,p.pid)}catch(e){console.warn(e)}}
async function loadPhoto(p){try{const d=await db(),f=await new Promise(ok=>{const r=d.transaction('p').objectStore('p').get(p.pid);r.onsuccess=()=>ok(r.result);r.onerror=()=>ok(null)});if(f){p.img=await createImageBitmap(f);layout();phone.render()}}catch(e){console.warn(e)}}
const pack=p=>({set:p.set,title:p.title,av:p.av,pan:p.pan,pid:p.pid,link:p.link,merch:p.merch,dphoto:p.dphoto});
// каждая страница пишет только своё: мерч не трогает посты и наоборот
function save(){if(!ready)return;try{let v=null;try{v=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){}
  const out=MERCHP?Object.assign(v||{},{merchs:L.merch.map(pack)}):Object.assign({},S,{posts:L.post.map(pack),profile:L.avatar.map(pack),merchs:v&&v.merchs});localStorage.setItem(KEY,JSON.stringify(out))}catch(e){console.warn(e)}}
function restore(){let v=null;try{v=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){}
  const un=unpack;
  // прошлые стартовые посты (название в бубне), если их не трогали, заменяются новыми; копия остаётся
  const OLDS=[[948/1080,.115],[928/1080,.458],[962/1080,.458],[.88,.458]];
  if(v&&v.posts&&v.posts.length&&v.posts.every(o=>!o.pid&&o.set.tx!=null&&o.set.text==='танцы\nс бубном'&&!o.set.tpos&&OLDS.some(q=>Math.abs(q[0]-o.set.fw)<1e-6&&q[1]===o.set.ty)&&o.set.weight===.5&&o.set.tsize===.18)){localStorage.setItem(KEY+'.before-text',JSON.stringify(v));v.posts=startPosts().map(pack)}
  // нетронутые прошлые обложки получают названия из «барабанной»; копия остаётся
  const OT=['отзывы','эко-бубны','практика','новый год','гвозди'],cv=v&&v.profile?v.profile.filter(o=>!o.av):[];
  if(cv.length===5&&cv.every((o,i)=>o.title===OT[i]&&o.set.text===OT[i])){localStorage.setItem(KEY+'.before-covers',JSON.stringify(v.profile));['отзывы','эко-бубны','практики','мастер-классы','барабаны'].forEach((t,i)=>{cv[i].title=cv[i].set.text=t})}
  // нетронутая прошлая пятёрка заменяется примером; копия остаётся
  const sameSet=(o,q)=>{const r=Object.assign(clone(DEFSET),q);return Object.keys(r).every(k=>o.set[k]===r[k])};
  if(v&&v.posts&&v.posts.length===STARTS.length&&v.posts.every((o,i)=>!o.pid&&!o.link&&sameSet(o,STARTS[i]))){localStorage.setItem(KEY+'.before-example',JSON.stringify(v));v.posts=startPosts().map(pack)}
  if(v&&v.posts){const[W,H]=FMTWH[v.fmt]||FMTWH['3:4'],o0=JSON.stringify(v);let n=0;for(const o of v.posts)if(signToFig(Object.assign(o.set,Object.assign(clone(DEFSET),o.set)),W,H))n++;if(n)localStorage.setItem(KEY+'.before-nosign',o0)}
  // название, вписанное в бубен, выключается; остальной старый текст остаётся
  if(v&&v.posts)for(const o of v.posts)if(o.set.tx!=null&&!o.set.tpos){if(o.set.text==='танцы\nс бубном')o.set.txt=false;if(o.set.lkind==='sign'&&!o.set.lpd)o.set.lpd='none'}
  if(v&&v.posts){for(const k of['tab','fmt','eye'])S[k]=v[k];L.post=v.posts.map(un);L.avatar=v.profile.map(un)}else{L.post=startPosts();L.avatar=startProfile()}
  L.merch=v&&Array.isArray(v.merchs)&&v.merchs.length?v.merchs.map(un):startMerch();
  // нетронутые фигуры первой версии мерча уменьшаются до новых
  for(const p of L.merch){const s=p.set,o=MERCH_OLD.findIndex(q=>q.every((v,i)=>Math.abs(v-[s.fx,s.fy,s.fw,s.fh][i])<1e-6));if(o<0)continue;const n=MERCHS.find(([,q])=>q.fig&&q.ch===s.ch&&(q.fkind||'one')===(s.fkind||'one'));if(n)Object.assign(s,{fx:n[1].fx,fy:n[1].fy,fw:n[1].fw,fh:n[1].fh})}
  if(MERCHP){S.tab='merch';SEL={post:0,el:null,editing:false};merchLoad(()=>{if(ready)layout()})}
  if(location.hash==='#preview')S.eye=true;ready=true;
  const used=new Set([...L.post,...L.avatar].map(p=>p.pid));db().then(d=>{const st=d.transaction('p','readwrite').objectStore('p'),r=st.getAllKeys();r.onsuccess=()=>r.result.forEach(k=>{if(!used.has(k))st.delete(k)})}).catch(()=>{})}
// ───────── проект одним файлом: посты, профиль, мерч и фото; персонажей не трогает (у них своё сохранение)
const blobURL=b=>new Promise(ok=>{const r=new FileReader();r.onload=()=>ok(r.result);r.readAsDataURL(b)});
async function exportProject(){save();const state=JSON.parse(localStorage.getItem(KEY)||'{}'),photos={};
  try{const d=await db(),keys=await new Promise(ok=>{const r=d.transaction('p').objectStore('p').getAllKeys();r.onsuccess=()=>ok(r.result);r.onerror=()=>ok([])});
    for(const k of keys){const f=await new Promise(ok=>{const r=d.transaction('p').objectStore('p').get(k);r.onsuccess=()=>ok(r.result);r.onerror=()=>ok(null)});if(f)photos[k]=await blobURL(f)}}catch(e){console.warn(e)}
  const t=new Date(),a=el('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({app:'tancy-s-bubnom',v:1,state,photos})],{type:'application/json'}));
  a.download=`tancy-s-bubnom-проект-${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}.json`;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},2000);toast('проект сохранён в файл')}
async function importProject(file){let o;try{o=JSON.parse(await file.text())}catch(e){toast('это не файл проекта');return}
  if(!o||o.app!=='tancy-s-bubnom'||!o.state){toast('это не файл проекта «танцы с бубном»');return}
  if(!confirm('Заменить посты, профиль и мерч содержимым файла? Персонажи не изменятся.'))return;
  try{localStorage.setItem(KEY+'.before-open',localStorage.getItem(KEY)||'null')}catch(e){}
  ready=false;try{const d=await db();for(const[k,u]of Object.entries(o.photos||{})){const b=await (await fetch(u)).blob();await new Promise(ok=>{const t=d.transaction('p','readwrite');t.objectStore('p').put(b,k);t.oncomplete=ok;t.onerror=ok})}}catch(e){console.warn(e)}
  localStorage.setItem(KEY,JSON.stringify(o.state));location.reload()}
{const nav=document.querySelector('.topbar .tbnav'),pf=el('input');pf.type='file';pf.accept='.json,application/json';pf.hidden=true;pf.onchange=()=>{if(pf.files[0])importProject(pf.files[0]);pf.value=''};
  const b=(t,ti,f)=>{const x=el('button','tbl tbbtn',t);x.title=ti;x.onclick=f;return x};
  // справа, перед разделами: сохранить, открыть | пост профиль мерч
  const box=el('span','tbproj');if(nav){nav.before(box);box.append(b('сохранить проект','скачать файл со всеми постами, профилем, мерчем и фото',exportProject),b('открыть проект','загрузить сохранённый файл проекта',()=>pf.click()),pf,el('i','tbsep'))}}
// ───────── связанные посты
const grpOf=i=>{const A=L.post;let a=i;while(a>0&&A[a-1].link)a--;let n=1;while(A[a+n-1].link&&A[a+n])n++;return{a,n,k:i-a}};
const SHARED=['tempo','hit','dance','loops','surf','fig','ch','fkind','fx','fy','fw','fh','turn','flip','weight','line','skin','side'];
function sync(i){if(S.tab!=='post')return;const g=grpOf(i),p=L.post[i];for(let q=g.a;q<g.a+g.n;q++)if(q!==i){const t=L.post[q];SHARED.forEach(k=>t.set[k]=p.set[k]);t.img=p.img;t.pid=p.pid;t.pan=p.pan}}
const draw=(k,i,W,H,o={})=>k==='merch'?merchImage(L.merch[i],W,H,o):renderPost(L[k][i],W,H,Object.assign({g:k==='post'?grpOf(i):{n:1,k:0}},o));
const ratioOf=k=>k==='post'?FMTWH[S.fmt][1]/FMTWH[S.fmt][0]:k==='merch'?1.25:1;
// ───────── телефон
const bgOf=p=>p.set.surf==='photo'?'#000000':SURF[p.set.surf],lightOf=p=>p.set.surf!=='photo'&&p.set.surf!=='black',IGFEED=MERCHP?[]:Array.from({length:9},(_,k)=>{const im=new Image();im.src=`ig/ig-${k+1}.jpg`;return im});
const phone=MERCHP?{render(){},live(){},avatar(){},highlight(){}}:createPhonePreview({button:$('eye'),isOn:()=>!!S.eye,setOn:v=>{S.eye=v;save();layout()},context:()=>S.tab==='avatar'?0:S.fmt==='9:16'?2:1,
  data:()=>{if(!L.post)return{};const r=ratioOf('post'),A=L.post,cur=S.tab==='post'?Math.min(SEL.post,A.length-1):A.length-1;
    return{handle:'tncsbbnm',name:'танцы с бубном',numbers:[['765','posts'],['1 158','followers'],['991','following']],bio:['барабанная мастерская петра атапина','🍃 ЭКО бубны из ткани 👍 Ручная работа 👑 Более 10 лет в профессии 🚗 Доставка по России'],link:'t.me/liza_mpr',likes:48,caption:'Мастер-класс в субботу: делаем бубен своими руками 🥁 Обод из дерева, натуральная кожа, ручная оплётка — к вечеру у вас свой инструмент и первый ритм… ',more:'ещё',note:'Смотреть все комментарии (12)',comments:[{name:'masha.k',text:'а с детьми можно?',meta:'1 ч · ответить'},{mine:true,name:'tncsbbnm',text:'конечно, с 7 лет 🥁',meta:'58 мин · ответить'}],
    avatar:(w,h)=>draw('avatar',L.avatar.findIndex(p=>p.av),w,h),highlights:L.avatar.map((p,i)=>({p,i})).filter(q=>!q.p.av).map(q=>({title:q.p.title,draw:(w,h)=>draw('avatar',q.i,w,h)})),
    feed:IGFEED,grid:A.map((p,i)=>({draw:(w,h)=>draw('post',i,w,h),ratio:r,carousel:!!p.link,skip:i>0&&A[i-1].link})).filter(q=>!q.skip).reverse(),
    post:A[cur]&&{draw:(w,h)=>draw('post',cur,w,h),ratio:r,bg:bgOf(A[cur]),light:lightOf(A[cur])}}}});
// ───────── страница
let CARDS=[],pressed=false,later=null;
addEventListener('pointerdown',()=>pressed=true,true);
for(const t of['pointerup','pointercancel'])addEventListener(t,()=>{pressed=false;if(later){const f=later;later=null;setTimeout(f,0)}},true);
const soft=f=>pressed?later=f:f();
const cur=()=>L[S.tab][SEL.post];
function refresh(){save();layout();phone.render()}
function change(f){f(cur().set);sync(SEL.post);refresh()}
function live(f){f(cur().set);sync(SEL.post);paintGroup()}
// ───────── время: танцует открытый пост (и сцепленные с ним)
let playing=false,loopOn=true,clock=0,scrub=null,lastT=0,head=null;
const canPlay=()=>S.tab==='post'&&cur()&&cur().set.fig;
const inPlay=C=>{if(C.k!=='post'||S.tab!=='post')return false;const g=grpOf(SEL.post);return C.i>=g.a&&C.i<g.a+g.n};
// на паузе в начале стоит утверждённая поза, дальше кадр танца
const tNow=()=>canPlay()&&(playing||scrub!=null)?(scrub!=null?scrub:clock):null;
function tick(t){if(!playing)return;if(!canPlay()){setPlay(false);return}const D=durOf(cur().set);clock+=Math.max(0,Math.min(.1,(t-lastT)/1000));lastT=t;if(clock>=D){if(loopOn)clock%=D;else{clock=0;setPlay(false);return}}
  if(!document.hidden)for(const C of CARDS)if(inPlay(C))paintFrame(C);if(head)head.style.left=clock/D*100+'%';requestAnimationFrame(tick)}
function paintFrame(C){const W=C.cv.width,H=C.cv.height,t=tNow(),im=draw(C.k,C.i,W,H,{hideText:SEL.editing&&C.active,t});C.cv.getContext('2d').drawImage(im,0,0);
  if(C.active)phone.live(SEL.editing?draw(C.k,C.i,W,H,{t}):im,t==null?null:t/durOf(cur().set),{bg:bgOf(cur()),light:lightOf(cur())})}
function setPlay(v){v=v&&canPlay();if(v===playing)return;playing=v;if(v){if(scrub!=null){clock=scrub;scrub=null}lastT=performance.now();requestAnimationFrame(tick)}else if(clock>0)scrub=clock;timelineState();if(!v)for(const C of CARDS)if(inPlay(C))paintFrame(C)}
function stopTime(){playing=false;clock=0;scrub=null}
function timelineState(){const b=document.querySelector('.tline .tplay');if(!b)return;b.classList.toggle('on',playing);b.innerHTML=playing?'<svg viewBox="0 0 24 24"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>':'<svg viewBox="0 0 24 24"><path d="M8 5l11 7-11 7z"/></svg>';b.title=playing?'пауза':'танец';b.setAttribute('aria-label',b.title)}
function timeline(C){const s=cur().set,w=el('div','tline'),D=durOf(s),pl=btn('circ tplay','','танец',()=>setPlay(!playing)),lp=btn('circ'+(loopOn?' on':''),'<svg viewBox="0 0 24 24" style="fill:none;stroke-width:2"><path d="M4 11a6 6 0 0 1 6-6h8m-3-3l3 3-3 3M20 13a6 6 0 0 1-6 6H6m3 3l-3-3 3-3"/></svg>','по кругу',()=>{loopOn=!loopOn;lp.classList.toggle('on',loopOn);lp.setAttribute('aria-pressed',loopOn)});lp.setAttribute('aria-pressed',loopOn);
  const tr=el('div','ttrack');tr.title='удары';const n=Math.max(1,s.loops)*4;for(let i=0;i<=n;i++){const q=el('i','ttick'+(i%4?'':' bar'));q.style.left=i/n*100+'%';tr.appendChild(q)}head=el('i','thead');head.style.left=(tNow()||0)/D*100+'%';tr.appendChild(head);
  const at=e=>{const r=tr.getBoundingClientRect();return Math.max(0,Math.min(D-.001,(e.clientX-r.left)/r.width*D))},seek=e=>{playing=false;clock=at(e);if(clock<durOf(cur().set)*.004)clock=0;scrub=clock||null;head.style.left=clock/D*100+'%';timelineState();for(const C of CARDS)if(inPlay(C))paintFrame(C)};let on=false;
  tr.onpointerdown=e=>{on=true;tr.setPointerCapture(e.pointerId);seek(e)};tr.onpointermove=e=>{if(on)seek(e)};tr.onpointerup=tr.onpointercancel=()=>on=false;
  const dw=el('div','tdw'),inp=el('input','tdur');inp.type='number';inp.min=1;inp.max=8;inp.value=s.loops;inp.title='сколько петель в ролике';inp.setAttribute('aria-label','сколько петель');inp.onkeydown=e=>e.stopPropagation();inp.onchange=()=>{const v=Math.max(1,Math.min(8,Math.round(+inp.value)||1));clock=0;scrub=null;change(s=>s.loops=v)};dw.append(inp,el('span','','× '+loopLen(s).toFixed(1).replace('.',',')+' с'));
  w.append(pl,lp,tr,dw);C.pic.appendChild(w);
  const m=el('div','tmot');for(const[t,k]of[['темп','tempo'],['удар','hit'],['танец','dance']])m.appendChild(lab(t,knob(t,s[k],v=>{const f=clock/durOf(cur().set);live(s=>s[k]=v);clock=f*durOf(cur().set);if(scrub!=null)scrub=clock;if(!playing)setPlay(true)},()=>refresh())));C.pic.appendChild(m);timelineState()}
function paintCard(C){const W=Math.round(C.w*dpr()),H=Math.round(C.h*dpr()),pt=inPlay(C)?tNow():null,im=draw(C.k,C.i,W,H,{hideText:SEL.editing&&C.active,t:pt});C.cv.width=W;C.cv.height=H;C.cv.getContext('2d').drawImage(im,0,0);C.boxes=im.boxes;if(C.active){decorate(C);
  if(S.tab==='post')phone.live(SEL.editing?draw(C.k,C.i,W,H,{t:pt}):im,pt==null?null:pt/durOf(cur().set),{bg:bgOf(cur()),light:lightOf(cur())});else if(cur().av)phone.avatar(im);else phone.highlight(L.avatar.filter(p=>!p.av).indexOf(cur()),im)}}
function paintAll(){CARDS.forEach(paintCard)}
function paintGroup(){const g=S.tab==='post'?grpOf(SEL.post):{a:SEL.post,n:1};CARDS.forEach(C=>{if(C.k===S.tab&&C.i>=g.a&&C.i<g.a+g.n)paintCard(C)})}
const btn=(c,h,t,f)=>{const b=el('button',c,h);b.title=t;b.setAttribute('aria-label',t);b.onclick=f;return b};
const IC={turn:'<svg viewBox="0 0 24 24"><path d="M5 12a7 7 0 1 1 2 5M5 12V6M5 12h6"/></svg>',flip:'<svg viewBox="0 0 24 24"><path d="M12 3v18M9 7L3 17h6zM15 7l6 10h-6z"/></svg>',lock:'<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',open:'<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.6-1.8"/></svg>',one:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7"/></svg>',mix:'<svg viewBox="0 0 24 24"><circle cx="7" cy="7" r="3.6"/><path d="M13.5 10.5l3.5-7 3.5 7zM3.5 13.5h7v7h-7zM14 14l6.500 6.500M20.500 14L14 20.500"/></svg>',four:'<svg viewBox="0 0 24 24"><circle cx="7" cy="7" r="3.6"/><circle cx="17" cy="7" r="3.6"/><circle cx="7" cy="17" r="3.6"/><circle cx="17" cy="17" r="3.6"/></svg>',fig:'<svg viewBox="0 0 24 24"><circle cx="8" cy="8" r="6"/><path d="M14 3h6l-4 6 5 6L4 20h5"/></svg>'};
function layout(){const keep={};KS.forEach(k=>keep[k]=$('row'+k).scrollLeft);CARDS=[];
  document.querySelectorAll('.tbnav a').forEach(a=>a.classList.toggle('on',a.dataset.k===S.tab));
  for(const k of KS){const row=$('row'+k),hd=$('hd'+k);row.innerHTML=hd.innerHTML='';
    if(k==='post'){const ch=el('div','chips');for(const f in FMTWH){const b=el('button',f===S.fmt?'on':'',f==='9:16'?'сторис':f);b.onclick=()=>{S.fmt=f;refresh()};ch.appendChild(b)}hd.appendChild(ch)}
    hd.append(el('span','sp'),btn('rect',k==='merch'?'скачать все принты':'скачать все',k==='merch'?'принты и мокапы всех вещей':'скачать все PNG',async e=>{const b=e.currentTarget;b.disabled=true;for(let i=0;i<L[k].length;i++){if(k==='merch'){await printPNG(i);await new Promise(r=>setTimeout(r,350))}await png(k,i);await new Promise(r=>setTimeout(r,350))}b.disabled=false}));
    const h=k!=='avatar'?Math.max(300,Math.min(innerHeight-330,600)):300,w=Math.round(h/ratioOf(k));
    L[k].forEach((p,i)=>{const active=S.tab===k&&SEL.post===i,C={k,i,w,h,active},card=el('div','card '+(active?'active':'static')),pic=el('div','pic');C.pic=pic;C.cv=el('canvas');C.cv.style.width=w+'px';C.cv.style.height=h+'px';pic.appendChild(C.cv);
      if(k==='avatar')pic.appendChild(el('div','amask'));if(k==='merch')pic.appendChild(el('div','mlabel',MERCH[p.merch].label));card.appendChild(pic);
      if(!active)pic.onclick=()=>{stopTime();S.tab=k;SEL={post:i,el:null};refresh()};
      if(k==='post'&&i<L.post.length-1)pic.appendChild(lockBtn(i));
      row.appendChild(card);CARDS.push(C)});
    const add=el('div','card'),plus=el('button','plus','+<span>'+({post:'новый пост',avatar:'обложка',merch:'новая вещь'})[k]+'</span>');plus.style.width=Math.min(w,220)+'px';plus.style.height=h+'px';plus.onclick=()=>addCard(k);add.appendChild(plus);row.appendChild(add);row.scrollLeft=keep[k]}
  paintAll()}
function lockBtn(i){const on=!!L.post[i].link,b=btn('lock'+(on?' on':''),on?IC.lock:IC.open,on?'расцепить посты':'одна фигура на два поста',e=>{e.stopPropagation();const p=L.post[i];p.link=!p.link;if(p.link){S.tab='post';SEL={post:i,el:'fig'};sync(i)}refresh()});return b}
function addCard(k){stopTime();const A=L[k];const base=k==='post'&&A[A.length-1];const p=k==='merch'?mk(clone(MERCHS[1][1]),{merch:'back'}):k==='post'?mk(Object.assign(clone(EXAMPLE),base?{ch:CHARLIB.next(base.set.ch)}:{})):mk({surf:'white',text:'новое',tsize:.5},{title:'новое'});A.push(p);S.tab=k;SEL={post:A.length-1,el:null};refresh();$('row'+k).scrollLeft=1e6}
function removeCard(){stopTime();const k=S.tab,i=SEL.post,A=L[k],p=A[i],prev=k==='post'?A[i-1]:null,pl=prev&&prev.link;if(prev&&!p.link)prev.link=false;A.splice(i,1);SEL={post:Math.max(0,i-1),el:null};refresh();
  toast({post:'пост удалён',avatar:'обложка удалена',merch:'вещь удалена'}[k],()=>{A.splice(i,0,p);if(prev)prev.link=pl;S.tab=k;SEL={post:i,el:null};refresh()})}
function spread(){const i=SEL.post,A=L.post,old=A.map(p=>clone(p.set)),s=A[i].set;A.forEach((p,q)=>{if(q!==i){const keep={text:p.set.text,txt:p.set.txt,surf:p.set.surf==='photo'||s.surf==='photo'?p.set.surf:s.surf};p.set=Object.assign(clone(s),keep)}});refresh();toast('настройки на всех постах',()=>{A.forEach((p,q)=>{if(old[q])p.set=old[q]});refresh()})}
// обложки: всё, кроме текста; размер подбирается так, чтобы буквы были такими же, как на этой обложке
function spreadCovers(){const A=L.avatar,i=SEL.post,s=A[i].set,old=A.map(p=>clone(p.set)),x=document.createElement('canvas').getContext('2d'),W=1000,ln=t=>(t||'').split('\n'),want=coverFont(x,ln(s.text),W,s.tsize);
  A.forEach((p,q)=>{if(q===i||p.av)return;const t=p.set.text;p.set=Object.assign(clone(s),{text:t});let a=0,b=1;if(coverFont(x,ln(t),W,1)<=want){p.set.tsize=1;return}for(let k=0;k<22;k++){const m=(a+b)/2;coverFont(x,ln(t),W,m)<want?a=m:b=m}p.set.tsize=b});
  refresh();toast('настройки на всех обложках',()=>{A.forEach((p,q)=>{p.set=old[q]});refresh()})}
async function savePNG(im,name){let b;try{b=await new Promise(r=>im.toBlob(r,'image/png'))}catch(e){console.error(e);toast('не получилось сохранить картинку');return}const a=el('a');a.href=URL.createObjectURL(b);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4000)}
const printPNG=i=>savePNG(printFile(L.merch[i]),`tancy-s-bubnom-${L.merch[i].merch}-${i+1}-print-2400x3000.png`);
async function png(k,i){if(k==='merch')return savePNG(merchImage(L.merch[i],1200,1500),`tancy-s-bubnom-${L.merch[i].merch}-${i+1}-mockup.png`);const[W,H]=k==='post'?FMTWH[S.fmt]:[1080,1080],t=k==='post'&&CARDS.some(C=>C.k==='post'&&C.i===i&&inPlay(C))?tNow():null,im=draw(k,i,W*2,H*2,{t}),b=await new Promise(r=>im.toBlob(r,'image/png')),a=el('a');a.href=URL.createObjectURL(b);const p=L[k][i];a.download=`tancy-s-bubnom-${k==='post'?'post-'+(i+1):p.av?'avatar':'cover-'+i}-${W*2}x${H*2}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4000)}
// ───────── вокруг поста
function decorate(C){const{pic,w,h,boxes:B}=C,p=cur(),s=p.set,post=S.tab==='post';
  // во время перетаскивания живой слой не пересоздаём, двигаем только рамку
  if(C.ov){placeSel(C);return}
  const ov=C.ov=el('div','ov');if(p.merch){const r=mRect(p);Object.assign(ov.style,{left:r.x*100+'%',top:r.y*100+'%',width:r.w*100+'%',height:r.h*100+'%',outline:SEL.el==='bg'?'1.5px dashed rgba(255,255,255,.75)':''});C.ow=C.w*r.w;C.oh=C.h*r.h;C.oy=C.h*r.y}pic.appendChild(ov);C.lay=el('div');ov.appendChild(C.lay);placeSel(C);wire(C);
  const top=el('div','dtop'),tg=el('div','dgrp');if(p.merch)tg.append(btn('rect','скачать мокап','картинка с вещью',()=>png('merch',SEL.post)),btn('rect','скачать принт','файл для печати: 2400×3000, прозрачный фон',()=>printPNG(SEL.post)));else tg.appendChild(btn('rect','png','скачать PNG',()=>png(S.tab,SEL.post)));if(canPlay()){const mb=btn('rect','mp4','скачать видео',async()=>{mb.disabled=true;setPlay(false);const[W,H]=FMTWH[S.fmt],i=SEL.post,p=cur();await saveMP4(p,i,W,H,f=>mb.textContent=Math.round(f*100)+' %');mb.disabled=false;mb.textContent='mp4'});tg.appendChild(mb)}
  if(post)tg.appendChild(btn('rect','раскатать','настройки на все посты, без текста и фото',spread));
  else if(S.tab==='avatar'&&!p.av)tg.appendChild(btn('rect','раскатать','настройки и размер букв на все обложки, без текста',spreadCovers));top.appendChild(tg);pic.appendChild(top);
  if(!p.av&&(L[S.tab].length>1))pic.appendChild(btn('circ del2','×','удалить',removeCard));
  // снизу: фон и состав
  const bot=el('div','dbot'),bl=el('div','dgrp mini'),br=el('div','dgrp');
  if(p.merch){swatchRow(bl,[['black','#000000','фон чёрный'],['pink',SHOW.pink,'фон розовый'],['yellow',SHOW.yellow,'фон жёлтый']],s.show,v=>change(s=>s.show=v));pic.onpointerdown=e=>{if(e.target===C.cv||e.target.classList.contains('mlabel')){SEL.el='bg';SEL.editing=false;soft(refresh)}}}
  else swatchRow(bl,[['white','#ffffff','белый'],['yellow',SURF.yellow,'жёлтый'],['pink',SURF.pink,'розовый'],['black','#000000','чёрный']],s.surf,v=>change(s=>s.surf=v));
  if(p.merch)for(const[key,e,html,t]of[['txt','text','т','текст'],['fig','fig',IC.fig,'фигура'],['logo','logo','лого','логотип']]){const b=btn('circ'+(s[key]?' on':'')+(key==='logo'?' lg':''),html,t,()=>{SEL.el=s[key]?null:e;SEL.editing=false;change(s=>{s[key]=!s[key];if(key==='txt'&&s.txt&&!s.text)s.text=MTEXT})});b.setAttribute('aria-pressed',!!s[key]);br.appendChild(b)}
  if(post){const thumb=p.img?(()=>{const c=el('canvas');c.width=c.height=56;const x=c.getContext('2d'),k=Math.max(56/p.img.width,56/p.img.height);x.drawImage(p.img,(56-p.img.width*k)/2,(56-p.img.height*k)/2,p.img.width*k,p.img.height*k);return`url(${c.toDataURL()}) center/cover`})():'repeating-linear-gradient(45deg,#ddd 0 4px,#fff 4px 8px)';
    bl.firstChild.appendChild(swatch('photo',s.surf,thumb,()=>{if(p.img&&s.surf!=='photo')change(s=>s.surf='photo');else{$('file').value='';$('file').click()}},'фото'));
    for(const[key,e,html,t]of[['txt','text','т','текст'],['fig','fig',IC.fig,'фигура'],['logo','logo','лого','логотип']]){const b=btn('circ'+(s[key]?' on':'')+(key==='logo'?' lg':''),html,t,()=>{SEL.el=s[key]?null:e;SEL.editing=false;change(s=>{s[key]=!s[key];if(key==='txt'&&s.txt&&!s.text)s.text='приходи на мастер-класс'})});b.setAttribute('aria-pressed',!!s[key]);br.appendChild(b)}}
  bot.append(bl,br);pic.appendChild(bot);
  if(p.av)pic.appendChild(el('div','cap','аватар'));
  if(canPlay())timeline(C);else head=null;
  tools(C)}
const post_=()=>S.tab==='post';
function tools(C){const p=cur(),s=p.set,e=p.av?'av':p.merch&&(!SEL.el||SEL.el==='bg')?'garment':SEL.el,w=el('div','dleft lab'),B=C.boxes,bx=B[e],oy=C.oy||0,oh=C.oh||C.h;w.style.top=Math.max(0,Math.min(C.h-(e==='fig'||e==='logo'?470:330),oy+(bx?Math.max(0,bx.y):0)*oh))+'px';
  const K=(name,key)=>w.appendChild(lab(name,knob(name,s[key],v=>live(s=>s[key]=v),()=>{save();phone.render()})));
  const SW=(opts,key)=>{const css={none:'#fff',black:'#000',white:'#fff',yellow:COL.yellow,pink:COL.pink};const r=el('div','sws wrap');const now=okCol(s[key],opts);opts.forEach(o=>{const b=swatch(o,now,css[o],()=>change(s=>s[key]=o),{none:'нет',black:'чёрный',white:'белый',yellow:'жёлтый',pink:'розовый'}[o]);if(o==='none')b.classList.add('no');r.appendChild(b)});return r};
  const SL=(name,opts,key)=>{if(opts.length>1)w.appendChild(lab(name,SW(opts,key)))};
  if(e==='text'){if(post_()||p.merch)for(const[v,h,t]of[['top','↑','текст вверх'],['mid','•','текст по центру'],['bottom','↓','текст вниз']]){const b=btn('circ'+(s.tpos===v?' on':''),h,t,()=>change(s=>s.tpos=v));b.setAttribute('aria-pressed',s.tpos===v);w.appendChild(b)}K('размер','tsize');SL('цвет',inkOpts(s),'tcol')}
  else if(e==='fig'){const r=el('div','sws');w.appendChild(people('ch',v=>change(s=>pick(s,v))));
    for(const k of['one','four','mix']){const b=btn('circ'+(s.fkind===k?' on':''),IC[k],{one:'один',four:'четверо одинаковых',mix:'четверо разных'}[k],()=>change(s=>s.fkind=k));r.appendChild(b)}w.appendChild(r);
    const q=el('div','sws');q.append(btn('circ'+(s.turn?' on':''),IC.turn,'повернуть',()=>change(s=>s.turn=!s.turn)),btn('circ'+(s.flip?' on':''),IC.flip,'отразить',()=>change(s=>s.flip=!s.flip)));w.appendChild(q);
    K('линия','weight');SL('цвет',lineOpts(s),'line');SL('бубен',skinOpts(s),'skin');SL('обод',sideOpts(s),'side')}
  else if(e==='logo'){const g=el('div','people');for(const k of logoKinds(s)){const b=btn('kind'+(k===s.lkind?' on':''),'',Fig.LOGONAME[k],()=>change(s=>s.lkind=k)),c=el('canvas');c.width=64;c.height=64;c.style.cssText='width:32px;height:32px;outline:0';const bb=Fig.LOGOS[k],z=Math.min(64/bb[2],64/bb[3])*.95;Fig.logo(c.getContext('2d'),k,(64-bb[2]*z)/2,(64-bb[3]*z)/2,z,{skin:COL.yellow,ch:s.lch});b.appendChild(c);g.appendChild(b)}w.appendChild(g);const pk=['sign','duo'].includes(s.lkind);if(pk)w.appendChild(people('lch',v=>change(s=>s.lch=v)));K('размер','lsize');
    if(RIMMED.includes(s.lkind))SL('бубен',lskinOpts(s),'lskin');else SL('цвет',lcolOpts(s),'lcol');if(pk){SL('бубен',skinOpts(s),'lps');SL('обод',sideOpts(s),'lpd')}}
  else if(e==='garment'){for(const k in MERCH){const b=btn('rect'+(p.merch===k?' on':''),MERCH[k].label,MERCH[k].label,()=>{p.merch=k;refresh()});b.style.background=p.merch===k?'var(--yellow)':'';b.setAttribute('aria-pressed',p.merch===k);w.appendChild(b)}
    w.appendChild(el('div','gap'));w.appendChild(el('span','klab','плашка'));w.appendChild(SW(['white','yellow','pink','black'],'surf'))}
  else if(e==='av'){for(const[k,t]of[['logo','т с б-м'],['figure','фигура']])w.appendChild(btn('rect',t,t,()=>change(s=>s.akind=k))).style.background=s.akind===k?'var(--yellow)':'';if(s.akind==='figure'){w.appendChild(people('ch',v=>change(s=>s.ch=v)));K('линия','weight')}}
  if(w.children.length)C.pic.appendChild(w)}
// четырнадцать персонажей
function people(key,on){const g=el('div','people'),s=cur().set;CHARLIB.ids.forEach((i,n)=>{const b=btn('kind'+(i===(s[key]||0)?' on':''),'','персонаж '+(n+1),()=>on(i)),c=el('canvas');b.setAttribute('aria-pressed',i===(s[key]||0));c.width=64;c.height=64;c.style.cssText='width:32px;height:32px;outline:0';Fig.figure(c.getContext('2d'),4,4,56,56,{ch:i,w:2.6,line:'#000'});b.appendChild(c);g.appendChild(b)});return g}
function inPrint(s){s.fw=Math.min(s.fw,1);s.fh=Math.min(s.fh,1);s.fx=Math.max(0,Math.min(1-s.fw,s.fx));s.fy=Math.max(0,Math.min(1-s.fh,s.fy))}
function pick(s,v){if(v!==(s.ch||0)){s.turn=false;s.flip=false}s.ch=v}
function placeSel(C){const lay=C.lay,B=C.boxes,p=cur(),b=B[SEL.el];if(SEL.editing&&lay.querySelector('textarea'))return;lay.innerHTML='';if(!b||p.av)return;
  const x0=Math.max(0,b.x),y0=Math.max(0,b.y),x1=Math.min(1,b.x+b.w),y1=Math.min(1,b.y+b.h),pc=v=>v*100+'%';
  if(SEL.editing&&SEL.el==='text'){const t=el('textarea','ontext'),z=b.size/dpr();t.value=p.set.text;Object.assign(t.style,{left:pc(b.x),top:pc(b.y),width:pc(b.w),fontSize:z+'px',color:textInk(p.set),textAlign:b.mid?'center':'left'});
    const fit=()=>{t.style.height='auto';t.style.height=Math.max(t.scrollHeight,z)+'px'};
    t.oninput=()=>{p.set.text=t.value;if(p.title!=null)p.title=t.value.replace(/\n/g,' ');fit();save()};
    t.onblur=()=>{if(!SEL.editing)return;SEL.editing=false;soft(refresh)};t.onkeydown=e=>{e.stopPropagation();if(e.key==='Escape'){t.blur()}};
    t.onpointerdown=e=>e.stopPropagation();lay.appendChild(t);t.focus();t.setSelectionRange(t.value.length,t.value.length);fit();return}
  const r=el('div','selbox');Object.assign(r.style,{left:pc(x0),top:pc(y0),width:pc(x1-x0),height:pc(y1-y0)});lay.appendChild(r);
  if(SEL.el==='fig')for(const[a,q]of[[0,0],[1,0],[0,1],[1,1]]){const hx=a?b.x+b.w:b.x,hy=q?b.y+b.h:b.y;const n=el('button','hand');n.dataset.h=a+','+q;n.title='растянуть';n.setAttribute('aria-label','растянуть фигуру');n.style.left=pc(Math.min(1,Math.max(0,hx)));n.style.top=pc(Math.min(1,Math.max(0,hy)));n.style.cursor=a===q?'nwse-resize':'nesw-resize';lay.appendChild(n)}}
function wire(C){const ov=C.ov;let d=null;const inb=(b,x,y)=>b&&x>=b.x-.02&&x<=b.x+b.w+.02&&y>=b.y-.02&&y<=b.y+b.h+.02;
  ov.onpointerdown=e=>{if(e.target.tagName==='TEXTAREA'||e.button)return;const r=ov.getBoundingClientRect(),px=(e.clientX-r.left)/r.width,py=(e.clientY-r.top)/r.height,B=C.boxes,p=cur();
    const hit=p.av?null:inb(B.text,px,py)?'text':inb(B.logo,px,py)?'logo':inb(B.fig,px,py)?'fig':'bg';
    const h=e.target.dataset&&e.target.dataset.h,act=SEL.el;
    d={sx:e.clientX,sy:e.clientY,hit,h:h&&h.split(',').map(Number),moved:false,s0:clone(p.set),pan:p.pan.slice(),b:B.logo,tb:B.text};
    // выбранный элемент тянется даже под текстом
    d.el=h?'fig':act&&act!=='bg'&&inb(B[act],px,py)?act:act===hit?hit:null;if(act==='bg'||(!act&&hit==='bg'))d.el=p.set.surf==='photo'&&!p.merch?'bg':null;
    // на вещи текст, логотип и фигуру можно тащить сразу, без отдельного клика
    if(p.merch&&!d.el&&['text','logo','fig'].includes(hit))d.el=hit;
    ov.setPointerCapture(e.pointerId);e.preventDefault();if(document.activeElement&&document.activeElement.tagName==='TEXTAREA')document.activeElement.blur()};
  ov.onpointermove=e=>{if(!d)return;const OW=C.ow||C.w,OH=C.oh||C.h,dx=(e.clientX-d.sx)/OW,dy=(e.clientY-d.sy)/OH;if(!d.moved&&Math.hypot(e.clientX-d.sx,e.clientY-d.sy)<4)return;d.moved=true;if(!d.el||(S.tab!=='post'&&S.tab!=='merch'))return;
    const p=cur(),z=d.s0,[,v1]=vmap(OW,OH),n=S.tab==='post'?grpOf(SEL.post).n:1;
    // на вещи логотип ставится куда угодно, без примагничивания
    if(p.merch&&d.el==='logo'){live(s=>{s.lpos='free';s.lx=Math.max(0,Math.min(1-d.b.w,d.b.x+dx));s.ly=Math.max(0,Math.min(1-d.b.h,d.b.y+dy))});return}
    // на вещи текст тоже ставится куда угодно
    if(p.merch&&d.el==='text'&&d.tb){live(s=>{s.tpos='free';s.tfx=d.tb.x+dx;s.tfy=d.tb.y+dy});return}
    if(p.merch&&d.el==='bg')return;
    if(d.el==='fig'){const X=dx/n,Y=dy/v1;live(s=>{if(d.h){const[a,q]=d.h,mi=.12;if(a)s.fw=Math.max(mi,z.fw+X);else{s.fw=Math.max(mi,z.fw-X);s.fx=z.fx+z.fw-s.fw}if(q)s.fh=Math.max(mi,z.fh+Y);else{s.fh=Math.max(mi,z.fh-Y);s.fy=z.fy+z.fh-s.fh}}else{s.fx=z.fx+X;s.fy=z.fy+Y}if(p.merch)inPrint(s)})}
    else if(d.el==='bg'){const g=n*C.w,k=Math.max(g/p.img.width,C.h/p.img.height),ox=g-p.img.width*k,oy=C.h-p.img.height*k,cl=v=>Math.max(-.5,Math.min(.5,v));p.pan=[ox?cl(d.pan[0]+(e.clientX-d.sx)/ox):0,oy?cl(d.pan[1]+(e.clientY-d.sy)/oy):0];sync(SEL.post);paintGroup()}
    else if(d.el==='logo'){const b=d.b,cx=b.x+b.w/2+dx,cy=b.y+b.h/2+dy;C.lay.querySelectorAll('.snap').forEach(q=>q.remove());let best,bd=9;const T={};for(const k of['tl','tr','bl','br','c']){const[X,Y]=snapXY(k,C.w,C.h,b.w*C.w,b.h*C.h);T[k]=[X/C.w,Y/C.h];const q=Math.hypot(T[k][0]+b.w/2-cx,(T[k][1]+b.h/2-cy)*C.h/C.w);if(q<bd){bd=q;best=k}}
      for(const k in T){const q=el('div','snap'+(k===best?' on':''));Object.assign(q.style,{left:T[k][0]*100+'%',top:T[k][1]*100+'%',width:b.w*100+'%',height:b.h*100+'%'});C.lay.appendChild(q)}d.best=best}};
  ov.onpointerup=ov.onpointercancel=()=>{if(!d)return;const q=d;d=null;if(q.moved){if(cur().merch&&q.el)SEL.el=q.el;if(q.best)cur().set.lpos=q.best;refresh();return}
    if(cur().av||q.h)return;
    if(q.hit==='text'&&SEL.el==='text'){SEL.editing=true;refresh()}else{SEL.el=q.hit;SEL.editing=false;refresh()}}}
// ───────── ввод
$('file').onchange=e=>{if(e.target.files[0])putPhoto(S.tab,SEL.post,e.target.files[0])};
async function putPhoto(k,i,f){if(k!=='post')return toast('фото можно положить на пост');try{const im=await createImageBitmap(f),p=L.post[i];p.img=im;p.pan=[0,0];p.set.surf='photo';await keepPhoto(p,f);S.tab='post';SEL={post:i,el:null};sync(i);refresh()}catch(e){toast('не получилось открыть фото')}}
addEventListener('dragover',e=>{e.preventDefault();$('drop').classList.add('on')});addEventListener('dragleave',e=>{if(!e.relatedTarget)$('drop').classList.remove('on')});
addEventListener('drop',async e=>{e.preventDefault();$('drop').classList.remove('on');if(MERCHP)return toast('на мерч фото не кладём');const fs=[...e.dataTransfer.files].filter(f=>f.type.startsWith('image/'));if(!fs.length)return;const C=CARDS.find(C=>C.k==='post'&&C.pic.contains(e.target));let i=C?C.i:-1;for(const f of fs){if(i<0){addCard('post');await putPhoto('post',L.post.length-1,f)}else{await putPhoto('post',i,f);i=-1}}});
addEventListener('pointerdown',e=>{if(!SEL.el||e.target.closest('.pic,.topbar,.igpanel,#toast,.sechd,.plus'))return;SEL.el=null;soft(()=>{SEL.editing=false;refresh()})});
addEventListener('keydown',e=>{if(e.code==='Space'&&canPlay()&&!/^(BUTTON|INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName||'')){e.preventDefault();setPlay(!playing)}if(e.key==='Escape'&&SEL.el){SEL.el=null;SEL.editing=false;refresh()}});
document.querySelectorAll('.tbnav a[data-k]').forEach(a=>KS.includes(a.dataset.k)&&(a.onclick=()=>{stopTime();S.tab=a.dataset.k;SEL={post:0,el:null};refresh()}));
if(!MERCHP&&location.hash==='#merch')location.replace('merch.html');
addEventListener('resize',layout);
// правки со вкладки «персонаж» приходят сразу, если билдер открыт рядом, и при возвращении на него
let charsLate=false;
function pullChars(){if(!CHARLIB.refresh()&&!charsLate)return;if(SEL.editing||pressed){charsLate=true;setTimeout(pullChars,400);return}charsLate=false;layout();phone.render()}
addEventListener('storage',e=>{if(e.key===CHARLIB.KEY||e.key===null)pullChars()});addEventListener('focus',pullChars);document.addEventListener('visibilitychange',()=>{if(!document.hidden)pullChars()});addEventListener('pageshow',pullChars);
tbLogo();function tbLogo(){const c=$('tbLogo'),w=64,h=40,k=.213;c.width=w*2;c.height=h*2;c.style.cssText=`width:${w}px;height:${h}px`;const b=Fig.LOGOS.oval;Fig.logo(c.getContext('2d'),'oval',0,2,.42,{skin:COL.yellow})}
restore();layout();phone.render();
Promise.race([Promise.all(['абвгд','abc123'].map(t=>document.fonts.load('300 40px TSB',t))),new Promise(r=>setTimeout(r,2500))]).then(()=>{Fig.forget();tbLogo();layout();phone.render()});
