'use strict';
// танец: из точек позы и времени u (0…1, петля бесшовная) получаются точки кадра
const DANCE=(()=>{const BEATS=4,TAU=Math.PI*2,add=(p,x,y)=>[p[0]+x,p[1]+y],sub=(a,b)=>[a[0]-b[0],a[1]-b[1]],len=v=>Math.hypot(v[0],v[1])||1,unit=v=>[v[0]/len(v),v[1]/len(v)],rot=(p,c,a,k=1)=>{const C=Math.cos(a)*k,N=Math.sin(a)*k,x=p[0]-c[0],y=p[1]-c[1];return[c[0]+x*C-y*N,c[1]+x*N+y*C]};
  // замах: после удара палка отскакивает, висит и падает с ускорением; ровно на долю снова касается кожи
  const lift=f=>f<.42?Math.sin(Math.PI/2*f/.42):f<.66?1:1-Math.pow((f-.66)/.34,2.4);
  // отклик бубна на удар: быстрый толчок и затухание
  const ring=f=>Math.exp(-6.5*f)*Math.sin(TAU*1.9*f);
  function frame(E,u,{hit=.5,dance=.5}={},names){const{DRUM,HEAD,RIM}=names,o={},H=hit*2,D=dance*2,b=((u%1)+1)%1*BEATS,beat=Math.floor(b),f=b-beat,Lf=lift(f)*(beat%2?.8:1)*H,p=ring(f)*H*(beat%2?.75:1),s=(n,ph=0)=>Math.sin(TAU*(n*u+ph)),dip=Math.cos(TAU*b);
    for(const k in E)o[k]=E[k].slice();
    const move=(ks,v,w=1)=>{for(const k of ks)o[k]=add(o[k],v[0]*w,v[1]*w)};
    // таз качается за такт, тело приседает на каждую долю
    const hip=[17*s(1)*D,(8*dip-3)*D],neck=[-19*s(1,.06)*D,(8*Math.cos(TAU*(b-.1))+5*s(2))*D];
    move(['hip','hipa','hipb','hipc','hipd'],hip);move(['neck','necka','neckb','neckc','neckd'],neck);
    const tx=unit([-(E.hip[1]-E.neck[1]),E.hip[0]-E.neck[0]]),br=10*s(2,.2)*D;move(['neckc','hipa'],tx,br);move(['neckd','hipb'],tx,-br*.5);
    // голова едет за шеей, кивает на долю и наклоняется за такт
    move(['hb',...HEAD],neck);const ha=(.42*s(1,.2)+.17*Math.cos(TAU*(b-.15)))*D;for(const k of['hb',...HEAD])o[k]=rot(o[k],o.neck,ha);
    // бубен: держащая рука качает и поворачивает его, удар толкает
    const dc=[(E.top[0]+E.bot[0]+E.in2[0]+E.left[0])/4,(E.top[1]+E.bot[1]+E.in2[1]+E.left[1])/4],away=unit(sub(E.hand,dc)),sw=[13*s(1,.4)*D-away[0]*11*p,(8*s(2,.1)+4*dip)*D-away[1]*11*p],da=.2*s(1,.3)*D,dk=1-.06*p,
      onDrum=q=>add(rot(q,dc,da,dk),sw[0],sw[1]);
    for(const k in RIM)o[k]=[0,1].map(j=>E[RIM[k]][j]+(E[k][j]-E[RIM[k]][j])*(1+.9*Math.max(-.4,p)));
    for(const k of DRUM)o[k]=onDrum(k in RIM?o[k]:E[k]);
    const ld=sub(o.left,E.left);move(['leftc'],ld,.9);
    // рука с палкой: в ударе конец палки ровно на своей точке кожи
    const contact=onDrum(E.tip),sv=sub(E.tip,E.hand),turn=(()=>{const a=rot(E.tip,E.hand,.5)[1],c=rot(E.tip,E.hand,-.5)[1];return a<c?1:-1})(),hd=[sw[0]*.55+neck[0]*.3+away[0]*30*Lf,sw[1]*.55+neck[1]*.3+away[1]*30*Lf-12*Lf];
    o.hand=add(E.hand,hd[0],hd[1]);const base=sub(contact,o.hand),free=rot([o.hand[0]+unit(base)[0]*len(sv),o.hand[1]+unit(base)[1]*len(sv)],o.hand,turn*.95*Lf,1-.08*Lf),m=Math.min(1,Lf*3);
    o.tip=[0,1].map(j=>contact[j]*(1-m)+free[j]*m);const dv=unit(sub(o.hand,o.tip));o.butt=add(o.hand,dv[0]*len(sub(E.butt,E.hand)),dv[1]*len(sub(E.butt,E.hand)));
    move(['handa'],hd,.9);const pr=[-away[1],away[0]];move(['handa'],pr,-turn*20*Lf);move(['necka'],hd,.25);
    // ноги переступают по очереди: стопа отрывается, носок тянется, колено пружинит
    [['f1','f1a','f1e','hipc',0],['f2','f2a','f2e','hipd',.5]].forEach(([q,kn,e,hh,ph])=>{const up=Math.pow(Math.max(0,s(1,ph)),1.5)*D,md=[(E.hip[0]+E[q][0])/2,(E.hip[1]+E[q][1])/2],out=unit(sub(E[kn],md));
      move([q,e],[0,-34*up]);move([kn],[0,-11*up]);move([kn,hh],out,(9*up+7*dip*D));o[e]=rot(o[e],o[q],(E[e][0]<E[q][0]?-1:1)*.75*up)});
    return o}
  return{frame,BEATS}})();
