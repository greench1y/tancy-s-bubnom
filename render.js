'use strict';
// одна функция рисует карточку, телефон и PNG
const FMTWH={'3:4':[1080,1440],'4:5':[1080,1350],'1:1':[1080,1080],'9:16':[1080,1920]};
const SURF={white:'#ffffff',yellow:'#ffcc00',pink:'#ff00c4',black:'#000000'};
const COL={black:'#000000',white:'#ffffff',yellow:'#ffc800',pink:'#ff00c4'};
// сторис: всё содержимое живёт ниже верхних 13 %
const vmap=(W,H)=>H/W>1.6?[.13,.84]:[0,1];
// что читается на фоне
const lineOpts=s=>s.surf==='photo'?['white','black']:s.surf==='black'?['white']:['black'];
const skinOpts=s=>['none','white','yellow'].filter(k=>k==='none'||s.surf!==k&&!(k==='white'&&s.surf==='black'));
const sideOpts=s=>['none','pink','yellow'].filter(k=>s.surf!==k);
// цвет текста: что разрешено на этом фоне, первый по умолчанию
const INKS={white:['black'],yellow:['black'],pink:['black','white'],black:['white','pink','yellow'],photo:['white']};
const inkOpts=s=>INKS[s.surf]||['black'],textInk=s=>COL[okCol(s.tcol,inkOpts(s))];
const textOpts=s=>s.surf==='photo'?['white','black','yellow']:s.surf==='black'?['white','yellow','pink']:s.surf==='pink'?['black','white']:s.surf==='yellow'?['black']:['black','pink'];
const okCol=(v,a)=>a.includes(v)?v:a[0];
const logoK=(s,W,H)=>Math.min(W,H)*(.1+s.lsize*(['sign','duo'].includes(s.lkind)?.7:.45))/Math.max(...Fig.LOGOS[s.lkind].slice(2));
// круг аватара и обложки: всё в середине
function renderRound(p,W,H){const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d'),s=p.set;c.boxes={};
  ground(x,p,W,H);
  if(p.av){const u=W/130;x.save();x.scale(u,u);
      if(s.akind==='figure')Fig.figure(x,27,25,78,80,{ch:s.ch,w:3.2*(.5+s.weight),line:s.surf==='black'?'#ffffff':'#000',skin:s.surf==='black'?null:'#ffffff',side:s.surf==='pink'?COL.yellow:COL.pink});
      else{const pts=Fig.poly('M 130 52.5 C 130 89.2 99.1 119 61 119 C 22.9 119 -8 89.2 -8 52.5 C -8 15.8 22.9 -14 61 -14 C 99.1 -14 130 15.8 130 52.5 Z');
        Fig.trace(x,pts);x.fillStyle=COL.yellow;x.fill();Fig.pen(x,pts,5,'#000');
        // зерно и на коже, и на чёрном крае
        Fig.trace(x,pts.map(L=>L.map(([a,b])=>[61+(a-61)*1.038,52.5+(b-52.5)*1.038])));Fig.speckle(x,.9/u);
        // ширина строк снята с макета: 47,6 и 57 из 130
        const fitW=(t,w)=>{let a=-.1,b=.4;for(let i=0;i<14;i++){const m=(a+b)/2;Fig.measure(x,[t],33.5,m).w-33.5*m>w?b=m:a=m}return a};
        Fig.text(x,['т с'],25.6,30.5,33.5,'#000',{sp:fitW('т с',47.6),bold:.05});Fig.text(x,['б-м'],39,59,33.5,'#000',{sp:fitW('б-м',57),bold:.05,seed:1})}
      x.restore();return c}
  const lines=(s.text||'').split('\n');let size=W*.12*(.5+s.tsize);while(size>6&&Fig.measure(x,lines,size).w>W*.74)size*=.97;
  const m=Fig.measure(x,lines,size);Fig.text(x,lines,(W-m.w)/2+size*.05,(H-m.h)/2,size,textInk(s));
  c.boxes.text={x:.13,y:(H-m.h)/2/H,w:.74,h:m.h/H,size,mid:true};return c}
function ground(x,p,W,H,n=1,k=0){const s=p.set;if(s.surf==='photo'&&p.img){const G=W*n,sc=Math.max(G/p.img.width,H/p.img.height),w=p.img.width*sc,h=p.img.height*sc,pan=p.pan||[0,0];
    x.drawImage(p.img,(G-w)*(.5+pan[0])-k*W,(H-h)*(.5+pan[1]),w,h)}
  else{x.fillStyle=SURF[s.surf]||'#ffffff';x.fillRect(0,0,W,H)}}
// g={n,k}: пост k из n связанных, фигура и фон одни на всю группу
function renderPost(p,W,H,{g={n:1,k:0},hideText,t=null}={}){
  if(p.av||p.title!=null)return renderRound(p,W,H);
  const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d'),s=p.set,[v0,v1]=vmap(W,H),md=Math.min(W,H),B=c.boxes={};
  ground(x,p,W,H,g.n,g.k);
  if(s.fig){const G=W*g.n,X=s.fx*G-g.k*W,Y=(v0+s.fy*v1)*H,w=s.fw*G,h=s.fh*v1*H;
    const skin=okCol(s.skin,skinOpts(s)),side=okCol(s.side,sideOpts(s));
    Fig.figures(x,X,Y,w,h,{kind:s.fkind,ch:s.ch||0,u:t==null?null:(t/loopLen(s))%1,motion:{hit:s.hit,dance:s.dance},turn:s.turn,flip:s.flip,w:md*(.003+s.weight*.0125),line:COL[okCol(s.line,lineOpts(s))],skin:skin==='none'?null:COL[skin],side:side==='none'?null:COL[side]});
    B.fig={x:X/W,y:Y/H,w:w/W,h:h/H}}
  const L=s.logo?logoOf(s,W,H):null;
  if(s.txt){const t=layText(x,s,W,H,L);if((s.text||'').trim()&&!hideText)drawText(x,t,textInk(s));B.text={x:t.x/W,y:t.y/H,w:t.maxW/W,h:t.h/H,size:t.fs,mid:t.mid}}
  if(L){drawLogo(x,s,L);B.logo={x:L.X/W,y:L.Y/H,w:L.w/W,h:L.h/H}}
  return c}
// работа с текстом из «барабанной»: сам переносится и подбирает кегль, стоит сверху, по центру или снизу, обходит логотип
function layText(x,s,W,H,L){const md=Math.min(W,H),m=md*.07,LH=.86,mid=s.tpos==='mid',maxW=mid?W*.64:W-2*m,safe=H/W>1.6?Math.max(m,H*.13):m,gap=md*.05;
  const top=safe+(L&&s.lpos[0]==='t'&&s.tpos==='top'?L.h+gap:0),bottom=H-m-(L&&s.lpos[0]==='b'?L.h+gap:0),txt=(s.text||'').trim();x.save();
  const wrap=fs=>{Fig.font(x,fs);const out=[];for(const para of(txt||' ').split('\n')){let line='';for(const w of para.split(/\s+/).filter(Boolean)){const t=line?line+' '+w:w;if(!line||x.measureText(t).width<=maxW)line=t;else{out.push(line);line=w}}out.push(line)}return out.filter((l,i,a)=>l||i<a.length-1)};
  const fits=fs=>{const ls=wrap(fs);let wm=0;for(const l of ls)wm=Math.max(wm,x.measureText(l).width);return ls.length*fs*LH+fs*.14<=bottom-top&&wm<=maxW};
  let fm=W*.5;for(let k=0;k<120&&!fits(fm);k++)fm*=.96;const fs=txt?fm*(.25+.75*s.tsize):W*.07,lines=txt?wrap(fs):[''],h=Math.max(1,lines.length)*fs*LH+fs*.14;
  Fig.font(x,fs);const ws=lines.map(l=>x.measureText(l).width);x.restore();
  return{lines,ws,fs,h,maxW,mid,W,x:mid?(W-maxW)/2:m,y:s.tpos==='top'?top:mid?(top+bottom-h)/2:bottom-h}}
function drawText(x,t,ink){t.lines.forEach((l,i)=>Fig.text(x,[l],t.mid?(t.W-t.ws[i])/2+t.fs*.05:t.x,t.y+i*t.fs*.86,t.fs,ink,{seed:i}))}
// логотип: на чёрном доступны только те, что читаются
const RIMMED=['blob','blob3','oval0','oval','ovalm'];
// убранные варианты не предлагаются, но остаются там, где уже стоят
const logoKinds=s=>Object.keys(Fig.LOGOS).filter(k=>RIMMED.includes(k)||k===s.lkind&&!(k==='drum'&&s.surf==='black'));
// персонаж теперь только фигура: бывший логотип-персонаж становится фигурой на том же месте
function signToFig(s,W,H){if(!s.logo||s.lkind!=='sign'||s.fig)return false;const L=logoOf(s,W,H),[a,b]=vmap(W,H);
  Object.assign(s,{fig:true,fkind:'one',ch:s.lch||0,fx:L.X/W,fy:(L.Y/H-a)/b,fw:L.w/W,fh:L.h/H/b,turn:false,flip:false,weight:Math.max(0,Math.min(1,(10*L.k/Math.min(W,H)-.003)/.0125)),line:s.lcol,skin:s.lps,side:s.lpd,logo:false,lkind:'blob'});return true}
const lskinOpts=s=>s.surf==='yellow'?['white']:s.surf==='black'?['none','yellow']:['white','yellow'];
const lcolOpts=s=>textOpts(s);
function logoOf(s0,W,H){const s=logoKinds(s0).includes(s0.lkind)?s0:Object.assign({},s0,{lkind:'oval'}),k=logoK(s,W,H),b=Fig.LOGOS[s.lkind],w=b[2]*k,h=b[3]*k,[X,Y]=snapXY(s.lpos,W,H,w,h);return{kind:s.lkind,k,w,h,X,Y}}
function drawLogo(x,s,L){const n=v=>v==='none'?null:COL[v],sk=okCol(s.lskin,lskinOpts(s));
  Fig.logo(x,L.kind,L.X,L.Y,L.k,{ch:s.lch,line:COL[okCol(s.lcol,lcolOpts(s))],skin:sk==='none'?'none':COL[sk],outline:s.surf==='black'?'#ffffff':'#000000',side:s.surf==='pink'?COL.yellow:COL.pink,pskin:n(okCol(s.lps,skinOpts(s))),pside:n(okCol(s.lpd,sideOpts(s)))})}
function snapXY(pos,W,H,w,h){const m=Math.min(W,H)*.06,top=H/W>1.6?H*.13:m;return{tl:[m,top],tr:[W-m-w,top],bl:[m,H-m-h],br:[W-m-w,H-m-h],c:[(W-w)/2,(H-h)/2]}[pos]||[W-m-w,H-m-h]}
// петля танца: четыре удара; ролик состоит из целых петель, поэтому замыкается без шва
const loopLen=s=>3.2/(.5+s.tempo),durOf=s=>loopLen(s)*Math.max(1,s.loops||1);
const FIGDEF={tempo:.5,hit:.5,dance:.5,loops:2,fig:true,ch:0,fkind:'one',fx:62/1080,fy:542/1440,fw:928/1080,fh:832/1440,turn:false,flip:false,weight:.5,line:'black',skin:'none',side:'pink'};
const DEFSET=Object.assign({surf:'white',txt:true,text:'приходи на мастер-класс\nсделаем бубен своими руками',tpos:'top',tsize:.5,logo:true,lkind:'oval',lch:0,lpos:'br',lsize:.35,lcol:'black',lskin:'yellow',lps:'none',lpd:'pink',akind:'logo'},FIGDEF,{fig:false});
// пример поста: с него начинается студия и каждый новый пост
const EXAMPLE={surf:'yellow',text:'в субботу\nделаем бубен\nсвоими руками',tpos:'bottom',tsize:.33,logo:false,lkind:'blob',fig:true,ch:10,fx:.336,fy:.045,fw:.604,fh:.453,weight:1,line:'black',skin:'white',side:'pink'};
// примеры для гайда: персонаж чаще вместо логотипа, иногда главный
const STARTS=[{lkind:'blob',lpos:'br',lsize:.5},{surf:'yellow',text:'в субботу\nделаем бубен\nсвоими руками',tsize:.33,tpos:'bottom',logo:false,fig:true,ch:7,fx:.45,fy:.045,fw:.5,fh:.375,weight:.9},
 {surf:'black',txt:false,fig:true,ch:10,fx:.06,fy:.045,fw:.88,fh:.91,skin:'yellow',logo:false},
 {surf:'pink',text:'своими руками',tpos:'mid',tsize:.7,lkind:'ovalm',lpos:'bl',lsize:.4},
 {fig:true,fkind:'mix',ch:1,fx:60/1080,fy:59/1440,fw:962/1080,fh:1318/1440,side:'yellow',txt:false,logo:false}];
