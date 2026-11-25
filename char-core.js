'use strict';
// устройство персонажа (то же, что на вкладке «персонаж»): точки, линии, крутилки → контуры
const CORE=(()=>{const clone=o=>JSON.parse(JSON.stringify(o));
const BASE={top:[88.9,5.4],top1:[121.8,5.4],top2:[13.5,5.4],top3:[119.5,5.4],
 in1:[168.2,35.8],in1a:[150,17.3],in1b:[191.7,59.6],in2:[177.4,129.5],in2a:[198.5,94.5],in2b:[145.1,183.1],
 out1:[170.7,29.9],out1a:[149.3,14.2],out1b:[202,52.8],out2:[187.9,137.5],out2a:[215.5,90.5],out2b:[156.2,191.6],
 bot:[26.8,165.1],bota:[62.8,191],boto:[64.8,193.2],botb:[21,160.7],left:[13.5,150.1],lefta:[16.4,155.7],leftb:[-21.2,82.3],
 hand:[180.1,7],handa:[348.4,7],butt:[183.8,0],tip:[132.7,121.5],neck:[269.9,108.4],necka:[394.3,23.8],neckb:[255.2,200.9],neckc:[344.8,89.6],neckd:[319.7,121.3],leftc:[-63,280.4],
 hb:[255.7,98.4],hb1:[278.2,86],hb2:[226.8,107.8],ht:[244,68.1],ht1:[263.1,60.7],ht2:[218,78.2],
 hip:[341.7,215.5],hipa:[342.7,160.6],hipb:[317.8,156.8],hipc:[178.7,226.1],hipd:[-4.2,360],
 f1:[35.8,342],f1a:[-84.8,258.5],f1e:[1.3,342],f2:[339.5,304.9],f2a:[21.4,363.2],f2e:[339.5,340.4]};
// [точка, усик, усик, точка, группа]; две точки = прямая
const SEG=[['top','top1','in1a','in1','drum'],['in1','in1b','in2a','in2','drum'],['in2','in2b','bota','bot','drum'],['bot','botb','lefta','left','drum'],['left','leftb','top2','top','drum'],
 ['top','top3','out1a','out1','rim'],['out1','out1b','out2a','out2','rim'],['out2','out2b','boto','bot','rim'],
 ['hand','handa','necka','neck','arm'],['neck','neckb','leftc','left','arm'],['neck','neckc','hipa','hip','body'],['neck','neckd','hipb','hip','body'],['hip','hipc','f1a','f1','leg'],['hip','hipd','f2a','f2','leg'],
 ['hb','hb1','ht1','ht','head'],['ht','ht2','hb2','hb','head'],['butt','hand'],['hand','tip'],['neck','hb'],['f1','f1e'],['f2','f2e']];
const PATHS=[[0,1,2,3,4],[5,6,7],[8],[9],[10],[11],[12,19],[13,20],[14,15],[16,17],[18]];
const OWN={};for(const s of SEG)if(s.length>2){OWN[s[1]]=s[0];OWN[s[2]]=s[3]}
const DRUM=['top','top1','top2','top3','in1','in1a','in1b','in2','in2a','in2b','out1','out1a','out1b','out2','out2a','out2b','bot','bota','boto','botb','left','lefta','leftb'];
const HEAD=['hb1','hb2','ht','ht1','ht2'];
const RIM={out1:'in1',out1a:'in1a',out1b:'in1b',out2:'in2',out2a:'in2a',out2b:'in2b',boto:'bota',top3:'top1'};
const BEND={};for(const s of SEG)if(['arm','body','leg'].includes(s[4])){BEND[s[1]]=[s[0],s[3],1/3,s[4]];BEND[s[2]]=[s[0],s[3],2/3,s[4]]}
const MOVE={hb:HEAD,neck:['hb',...HEAD],hand:['butt'],f1:['f1e'],f2:['f2e']};
const mul=v=>v<.5?.15+v*1.7:1+(v-.5)*2;   // 0.15…1…2
const size=v=>.4+v*1.2,FR=v=>1.2*v+.4;
// точки после крутилок
function effective(T){const p=T.pts,o=clone(p),K=T.k,ds=size(K.drum),cx=(p.left[0]+p.in2[0])/2,cy=(p.top[1]+p.bot[1])/2,hs=size(K.head),rm=mul(K.rim);
  for(const q in RIM)for(const j of[0,1])o[q][j]=p[RIM[q]][j]+(p[q][j]-p[RIM[q]][j])*rm;
  for(const q of DRUM)o[q]=[cx+(o[q][0]-cx)*ds,cy+(o[q][1]-cy)*ds];
  for(const q of HEAD)o[q]=[0,1].map(j=>p.hb[j]+(p[q][j]-p.hb[j])*hs);
  for(const q in BEND){const[a,b,t,g]=BEND[q],n=OWN[q],h=[0,1].map(j=>p[q][j]+o[n][j]-p[n][j]);const k=mul(K[g]);o[q]=[0,1].map(j=>{const c=o[a][j]+(o[b][j]-o[a][j])*t;return c+(h[j]-c)*k})}
  const st=mul(K.stick);o.tip=[0,1].map(j=>p.hand[j]+(p.tip[j]-p.hand[j])*st);return o}
function curve(E,s){if(s.length<3)return Array.from({length:9},(_,i)=>[0,1].map(j=>E[s[0]][j]+(E[s[1]][j]-E[s[0]][j])*i/8));
  const[a,b,c,d]=s.map(q=>E[q]);return Array.from({length:49},(_,i)=>{const u=i/48,v=1-u;return[0,1].map(j=>v*v*v*a[j]+3*v*v*u*b[j]+3*v*u*u*c[j]+u*u*u*d[j])})}
const join=(E,ids)=>ids.flatMap((i,n)=>n?curve(E,SEG[i]).slice(1):curve(E,SEG[i]));
// вписанные в 342×342 точки
function fitted(T){const E=effective(T),b=box(E);return norm(E,b)}
function box(E,B){let[a,b,c,d]=B||[1e9,1e9,-1e9,-1e9];for(const s of SEG)for(const p of curve(E,s)){if(p[0]<a)a=p[0];if(p[1]<b)b=p[1];if(p[0]>c)c=p[0];if(p[1]>d)d=p[1]}return[a,b,c,d]}
function norm(E,[a,b,c,d]){const o={};for(const k in E)o[k]=[(E[k][0]-a)/(c-a)*342,(E[k][1]-b)/(d-b)*342];return o}
const shapes=E=>({skin:join(E,[0,1,2,3,4]),side:[...join(E,[5,6,7]),...join(E,[0,1,2]).reverse()],lines:PATHS.map(q=>join(E,q))});
return{BASE,SEG,PATHS,NAMES:{DRUM,HEAD,RIM},effective,fitted,box,norm,shapes}})();
