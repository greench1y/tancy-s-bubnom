'use strict';
// Движок «танцы с бубном»: контуры и пропорции сняты с Figma (Drums, 572:155)
const Fig=(()=>{
const C={black:'#000000',white:'#ffffff',yellow:'#ffcc00',drum:'#ffc800',pink:'#ff00c4'};
// танцующая фигура, 342×342
const SKIN='M 88.9 5.4 C 13.5 5.4 -21.2 82.3 13.5 150.1 C 16.4 155.7 21 160.7 26.8 165.1 C 62.8 191 145.1 183.1 177.4 129.5 C 198.5 94.5 191.7 59.6 168.2 35.8 C 150 17.3 121.8 5.4 88.9 5.4 Z';
const SIDE='M 177.4 129.5 C 145.1 183.1 62.8 191 26.8 165.1 C 64.8 193.2 156.2 191.6 187.9 137.5 C 215.5 90.5 202 52.8 170.7 29.9 L 168.2 35.8 C 191.7 59.6 198.5 94.5 177.4 129.5 Z M 168.2 35.8 L 170.7 29.9 C 149.3 14.2 119.5 5.4 88.9 5.4 C 121.8 5.4 150 17.3 168.2 35.8 Z';
const LINES='M 269.9 108.4 C 394.3 23.8 348.4 7 180.1 7 M 269.9 108.4 L 255.7 98.4 M 269.9 108.4 C 344.8 89.6 342.7 160.6 341.7 215.5 M 269.9 108.4 C 255.2 200.9 -63 280.4 13.5 150.1 M 269.9 108.4 C 319.7 121.3 317.8 156.8 341.7 215.5 M 183.8 0 L 180.1 7 L 170.7 29.9 L 168.2 35.8 L 132.7 121.5 M 255.7 98.4 C 278.2 86 263.1 60.7 244 68.1 C 218 78.2 226.8 107.8 255.7 98.4 Z M 341.7 215.5 C 178.7 226.1 -84.8 258.5 35.8 342 L 1.3 342 M 341.7 215.5 C -4.2 360 21.4 363.2 339.5 304.9 L 339.5 340.4 M 88.9 5.4 C 13.5 5.4 -21.2 82.3 13.5 150.1 C 16.4 155.7 21 160.7 26.8 165.1 C 64.8 193.2 156.2 191.6 187.9 137.5 C 215.5 90.5 202 52.8 170.7 29.9 C 149.3 14.2 119.5 5.4 88.9 5.4 M 88.9 5.4 C 121.8 5.4 150 17.3 168.2 35.8 C 191.7 59.6 198.5 94.5 177.4 129.5 C 145.1 183.1 62.8 191 26.8 165.1';
// логотип-бубен (круглый) и логотип-овал
const BLOB={m:[.5,.8660254,.8660254,-.5,0,0],skin:'M 118.9 8.3 C 18.1 8.3 -28.4 126.1 18.1 229.9 C 22 238.6 28.1 246.3 35.9 252.9 C 84 292.7 194.1 280.6 237.4 198.5 C 265.6 144.8 256.5 91.3 225.1 54.8 C 200.7 26.4 163 8.3 118.9 8.3 Z',side:'M 237.4 198.5 C 194.1 280.6 84 292.7 35.9 252.9 C 86.6 296 208.9 293.7 251.4 210.7 C 288.3 138.7 270.2 80.9 228.3 45.8 L 225.1 54.8 C 256.5 91.3 265.6 144.8 237.4 198.5 Z M 225.1 54.8 L 228.3 45.8 C 199.7 21.7 159.9 8.3 118.9 8.3 C 163 8.3 200.7 26.4 225.1 54.8 Z',stick:'M 177.6 186.1 L 225.1 54.8 L 228.3 45.8 L 241 10.8 L 245.9 0',box:[48,-104,284,318],sw:4.72};
const OVAL={m:[.9959,-.0906,.0906,.9959,0,0],skin:'M 20.4 110.9 C 53.2 143.4 211.8 150.1 268.4 102.4 C 280.8 91.9 286.8 81.1 287.4 70.7 C 287.3 67.9 287.1 65.3 286.9 63.2 C 280.4 29 217 0 134.1 0 C 47.6 0 -3.5 34.1 .2 73.3 C 1.3 85.7 7.9 98.5 20.4 110.9 Z',side:'M 268.4 102.4 C 211.8 150.1 53.2 143.4 20.4 110.9 C 7.9 98.5 1.3 85.7 .2 73.3 C .6 87.1 1.4 108.7 13.1 120.4 C 45.8 159.1 217.9 166.6 274.5 113.2 C 285.8 102.6 287.7 83.7 287.4 70.7 C 286.8 81.1 280.8 91.9 268.4 102.4 Z',stick:'M 111.8 111.5 L 262.3 169.4',box:[-2,-20,296,172],sw:5.71};
// барабан
const DRUM={m:[.9986,.0523,-.0523,.9986,0,0],body:'M 0 20.3 C 57.5 55.7 241.7 48.5 268.4 20.3 L 268.4 204.7 C 162.4 221.8 103.5 223.1 0 204.7 L 0 20.3 Z',rim:'M 268.4 20.3 C 236.6 -5.5 38.3 -8 0 20.3',stick:'M -37 -80 L 145 28',box:[-52,-84,324,324],sw:5};
// путь → ломаные
const cache={};
function poly(d){if(cache[d])return cache[d];const t=d.match(/[MLCZ]|-?[\d.]+/g),out=[];let i=0,cmd='',cur=null,p=[0,0];const n=()=>+t[i++];
  while(i<t.length){if(/[MLCZ]/.test(t[i]))cmd=t[i++];
    if(cmd==='M'){p=[n(),n()];cur=[p];out.push(cur);cmd='L'}
    else if(cmd==='L'){const q=[n(),n()];for(let k=1;k<=8;k++)cur.push([p[0]+(q[0]-p[0])*k/8,p[1]+(q[1]-p[1])*k/8]);p=q}
    else if(cmd==='C'){const a=[n(),n()],b=[n(),n()],q=[n(),n()];for(let k=1;k<=36;k++){const u=k/36,v=1-u;cur.push([0,1].map(j=>v*v*v*p[j]+3*v*v*u*a[j]+3*v*u*u*b[j]+u*u*u*q[j]))}p=q}
    else{cur.push(cur[0].slice());p=cur[0];cmd=''}}
  return cache[d]=out}
const rnd=k=>{const s=Math.sin(k*127.1+11.7)*43758.5453;return s-Math.floor(s)},noise=v=>{const f=Math.floor(v),u=v-f,w=u*u*(3-2*u);return(rnd(f)*(1-w)+rnd(f+1)*w)*2-1};
function trace(x,lines){x.beginPath();for(const L of lines){L.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]))}}
// живая линия: толщина постоянная, контур чуть дрожит
function pen(x,lines,w,col,seed=0,amp=.17,per=5){const out=lines.map((L,li)=>{let s=0;const r=[];
    for(let i=1;i<L.length;i++){const a=L[i-1],b=L[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]);if(!len)continue;const k=Math.max(1,Math.ceil(len/(w*.8)));
      for(let j=i===1?0:1;j<=k;j++){const u=j/k,n=noise((s+len*u)/(w*per)+li*50+seed*7)*w*amp;r.push([a[0]+(b[0]-a[0])*u-(b[1]-a[1])/len*n,a[1]+(b[1]-a[1])*u+(b[0]-a[0])/len*n])}s+=len}
    return r});
  x.lineWidth=w;x.lineCap=x.lineJoin='round';x.strokeStyle=col;trace(x,out);x.stroke()}
let grain=null;
function speckle(x,u){if(!grain){grain=document.createElement('canvas');grain.width=grain.height=256;const g=grain.getContext('2d'),d=g.createImageData(256,256);for(let i=0;i<d.data.length;i+=4){d.data[i]=d.data[i+1]=d.data[i+2]=255;d.data[i+3]=rnd(i/4)>.5?64:0}g.putImageData(d,0,0)}
  x.save();x.clip();const p=x.createPattern(grain,'repeat');p.setTransform(new DOMMatrix().scale(u));x.fillStyle=p;x.fillRect(-9999,-9999,29999,29999);x.restore()}
// фигура в прямоугольнике. o: turn (лежа/стоя), flip, w, line, skin, side
function figure(x,X,Y,W,H,o){const tf=([a,b])=>{let u=a/342,v=b/342;if(o.turn)[u,v]=[v,u];if(o.flip)u=1-u;if(o.vflip)v=1-v;return[X+u*W,Y+v*H]},P=d=>poly(d).map(L=>L.map(tf));
  const ch=typeof CHARLIB!=='undefined'&&(o.u!=null&&o.ch!=null&&CHARLIB.frame(o.ch,o.u,o.motion)||CHARLIB.get(o.ch));
  if(ch){if(o.skin){x.fillStyle=o.skin;trace(x,[ch.skin.map(tf)]);x.fill()}if(o.side){x.fillStyle=o.side;trace(x,[ch.side.map(tf)]);x.fill()}pen(x,ch.lines.map(L=>L.map(tf)),o.w,o.line,0,ch.w*.34,2+ch.s*6);return}
  if(o.skin){x.fillStyle=o.skin;trace(x,P(SKIN));x.fill()}
  if(o.side){x.fillStyle=o.side;trace(x,P(SIDE));x.fill()}
  pen(x,P(LINES),o.w,o.line)}
// один, двое, четверо (доли сетки из макета 962×1318)
const SETS={one:[[0,0,1,1]],four:[[501/962,905/1318,461/962,413/1318],[501/962,0,461/962,865/1318],[0,453/1318,461/962,865/1318,1],[0,0,461/962,413/1318,1]]};
function figures(x,X,Y,W,H,o){const mix=o.kind==='mix';(mix?SETS.four:SETS[o.kind]||SETS.one).forEach(([a,b,c,d,f],i)=>figure(x,X+a*W,Y+b*H,c*W,d*H,Object.assign({},o,{u:o.u==null?null:(o.u+i*.25)%1,ch:mix?CHARLIB.next(o.ch,i):o.ch,flip:!!o.flip!==!!f})))}
// центр бубна фигуры в долях прямоугольника
function skinCenter(o){let u=.29,v=.27;if(o.turn)[u,v]=[v,u];if(o.flip)u=1-u;return[u,v]}
// рамка бубна в долях фигуры
function skinBox(o){const P=(typeof CHARLIB!=='undefined'&&CHARLIB.get(o.ch)?CHARLIB.get(o.ch).skin:poly(SKIN).flat()).map(([a,b])=>{let u=a/342,v=b/342;if(o.turn)[u,v]=[v,u];if(o.flip)u=1-u;return[u,v]}),X=P.map(p=>p[0]),Y=P.map(p=>p[1]);return[Math.min(...X),Math.min(...Y),Math.max(...X),Math.max(...Y)]}
// текст: строчные, Helvetica Neue Light с обводкой, разрядка 10 %, интерлиньяж 86 %
const FF='"Helvetica Neue",TSB,Arial,sans-serif';
function font(x,size,sp=.1){x.font=`300 ${size}px ${FF}`;x.letterSpacing=size*sp+'px';x.textBaseline='alphabetic'}
function measure(x,lines,size,sp=.1,lh=.86){x.save();font(x,size,sp);let w=0;for(const l of lines)w=Math.max(w,x.measureText(l).width);x.restore();return{w,h:size*(.98+lh*(lines.length-1))}}
// «пошакаленный» шрифт: край дрожит, толщина штриха гуляет, углы смазаны; в долях кегля, поэтому одинаков в любом размере
const ROUGH={shift:.015,wave:.14,fat:.12,soft:.02};
const h2=(i,j)=>{let n=Math.imul(i,374761393)+Math.imul(j,668265263)|0;n=Math.imul(n^n>>>13,1274126177);return((n^n>>>16)>>>0)/4294967296};
const n2=(u,v)=>{const i=Math.floor(u),j=Math.floor(v),a=u-i,b=v-j,s=a*a*(3-2*a),t=b*b*(3-2*b);return((h2(i,j)*(1-s)+h2(i+1,j)*s)*(1-t)+(h2(i,j+1)*(1-s)+h2(i+1,j+1)*s)*t)*2-1};
const glyphs=new Map();
function roughLine(l,fs,col,sp,bold,seed){const key=[l,fs,col,sp,bold,seed].join('|');let g=glyphs.get(key);if(g){glyphs.delete(key);glyphs.set(key,g);return g}
  const c=document.createElement('canvas'),x=c.getContext('2d',{willReadFrequently:true}),pad=Math.ceil(fs*.2);font(x,fs,sp);const w=c.width=Math.ceil(x.measureText(l).width)+pad*2,h=c.height=Math.ceil(fs*1.1)+pad*2;
  font(x,fs,sp);x.lineWidth=fs*bold;x.lineJoin=x.lineCap='round';x.fillStyle=x.strokeStyle='#000';if('filter'in x)x.filter=`blur(${fs*ROUGH.soft}px)`;
  // заливка и обводка вместе, чтобы размытие легло один раз
  const q=document.createElement('canvas');q.width=w;q.height=h;const y=q.getContext('2d');font(y,fs,sp);y.lineWidth=fs*bold;y.lineJoin=y.lineCap='round';y.fillText(l,pad,pad+fs*.76);y.strokeText(l,pad,pad+fs*.76);x.drawImage(q,0,0);
  const im=x.getImageData(0,0,w,h),D=im.data,A=new Uint8Array(w*h);for(let i=0;i<A.length;i++)A[i]=D[i*4+3];
  const out=x.createImageData(w,h),O=out.data,M=fs*ROUGH.shift,m=Math.ceil(M)+1,gain=Math.max(1.2,fs*ROUGH.soft*2.5),k=1/(fs*ROUGH.wave),sd=seed*37.3;
  for(let b=m;b<h-m;b++)for(let a=m;a<w-m;a++){const i=b*w+a,v=A[i],e=A[i-m]+A[i+m]+A[i-m*w]+A[i+m*w]+A[i-m*w-m]+A[i-m*w+m]+A[i+m*w-m]+A[i+m*w+m];let r;
    if(!v&&!e)continue;if(v===255&&e===2040)r=255;
    else{const u=a*k+sd,t=b*k+sd*.7,X=a+M*(n2(u,t)+.5*n2(u*2.3+9,t*2.3)),Y=b+M*(n2(u+51,t+17)+.5*n2(u*2.3,t*2.3+71)),xi=Math.max(0,Math.min(w-2,Math.floor(X))),yi=Math.max(0,Math.min(h-2,Math.floor(Y))),fx=X-xi,fy=Y-yi,p=yi*w+xi;
      const s=((A[p]*(1-fx)+A[p+1]*fx)*(1-fy)+(A[p+w]*(1-fx)+A[p+w+1]*fx)*fy)/255;r=Math.max(0,Math.min(1,(s-.5-ROUGH.fat*.5*n2(u*.8+23,t*.8+5))*gain+.5))*255}
    O[i*4+3]=r}
  x.filter='none';x.putImageData(out,0,0);x.globalCompositeOperation='source-in';x.fillStyle=col;x.fillRect(0,0,w,h);
  g={c,pad};glyphs.set(key,g);let px=0;for(const z of glyphs.values())px+=z.c.width*z.c.height;for(const[kk,z]of glyphs){if(px<12e6||glyphs.size<2)break;px-=z.c.width*z.c.height;glyphs.delete(kk)}return g}
function text(x,lines,X,Y,size,col,o={}){const T=x.getTransform(),dev=size*Math.hypot(T.a,T.b),fs=Math.max(64,Math.min(700,Math.round(dev))),s=size/fs;
  lines.forEach((l,i)=>{if(!l)return;const g=roughLine(l,fs,col,o.sp??.1,o.bold||.0467,(o.seed||0)+i);x.save();x.imageSmoothingQuality='high';x.drawImage(g.c,X-g.pad*s,Y+i*size*(o.lh||.86)-g.pad*s,g.c.width*s,g.c.height*s);x.restore()})}
// логотипы
const LOGOS={blob:BLOB.box,blob3:BLOB.box,oval0:OVAL.box,oval:OVAL.box,ovalm:OVAL.box,sign:[0,0,342,342],duo:[0,0,482,150],word:[0,0,330,96],drum:DRUM.box};
// слова внутри бубна: [строки, x, y, кегль, разрядка]
const INSIDE={blob:[['танцы','с бубном'],87,-23,42.7,.1],blob3:[['танцы','с буб-','ном'],100,-32,42.7,.1],oval0:[['=)'],68.5,17,63,.1,.03],oval:[['тсб'],77,20.6,64.5,.06,.03],ovalm:[['т с б-м'],54,24,58,.03,.03]};
const LOGONAME={blob:'бубен',blob3:'бубен, три строки',oval0:'овал =)',oval:'овал тсб',ovalm:'овал т с б-м',drum:'барабан',sign:'персонаж',word:'слова',duo:'персонаж и слова'};
function logo(x,kind,X,Y,k,o){const B=LOGOS[kind];x.save();x.translate(X-B[0]*k,Y-B[1]*k);x.scale(k,k);const tl=x.getTransform().a;
  const at=m=>L=>L.map(([a,b])=>[m[0]*a+m[2]*b+m[4],m[1]*a+m[3]*b+m[5]]),col=o.line||C.black;
  if(kind==='sign')figure(x,0,0,342,342,{ch:o.ch,w:10,line:col,skin:o.pskin,side:o.pside});
  else if(kind==='duo'){figure(x,0,0,150,150,{ch:o.ch,w:5,line:col,skin:o.pskin,side:o.pside});text(x,['танцы','с бубном'],176,34,47,col,{})}
  else if(kind==='word')text(x,['танцы','с бубном'],4,4,47,col,{});
  else if(kind==='drum'){const P=d=>poly(d).map(at(DRUM.m));trace(x,P(DRUM.body));x.fillStyle=C.yellow;x.fill();speckle(x,1/tl*.9);pen(x,P(DRUM.rim),5,C.yellow);pen(x,P('M 0 20.3 L 0 204.7'),5,C.yellow,2);pen(x,P('M 268.4 20.3 L 268.4 204.7'),5,C.yellow,3);pen(x,poly(DRUM.stick),5,C.pink);text(x,['танцы','с бубном'],-42,74,45.3,col,{})}
  else{const S=kind.startsWith('blob')?BLOB:OVAL,P=d=>poly(d).map(at(S.m));if(o.skin!=='none'){x.fillStyle=o.skin||C.white;trace(x,P(S.skin));x.fill()}const ol=o.outline||C.black,tc=o.skin==='none'?ol:C.black;if(o.side!==null){x.fillStyle=o.side||C.pink;trace(x,P(S.side));x.fill()}
    pen(x,P(S.side),S.sw,ol);pen(x,P(S.skin),S.sw,ol,3);
    const t=INSIDE[kind];if(t)text(x,t[0],t[1],t[2],t[3],tc,{sp:t[4],bold:t[5]});
    pen(x,P(S.stick),S.sw,ol)}
  x.restore()}
return{forget:()=>glyphs.clear(),C,figure,figures,skinCenter,skinBox,text,measure,font,logo,LOGOS,LOGONAME,FF,poly,speckle,trace,pen}})();
