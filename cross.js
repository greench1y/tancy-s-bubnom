'use strict';
// правило: пересекаться может только колотушка с бубном. Находит все остальные пересечения
const CROSS=(()=>{const N=14,cl=(E,s)=>{if(s.length<3)return[0,.25,.5,.75,1].map(u=>[E[s[0]][0]*(1-u)+E[s[1]][0]*u,E[s[0]][1]*(1-u)+E[s[1]][1]*u]);const[a,b,c,d]=s.map(q=>E[q]),r=[];for(let i=0;i<=N;i++){const u=i/N,v=1-u,A=v*v*v,B=3*v*v*u,C=3*v*u*u,D=u*u*u;r.push([A*a[0]+B*b[0]+C*c[0]+D*d[0],A*a[1]+B*b[1]+C*c[1]+D*d[1]])}return r};
  const ends=s=>s.length<3?s:[s[0],s[3]],kind=(s,i)=>i<5?'skin':i<8?'rim':i===16||i===17?'stick':i===14||i===15||i===18?'head':i===8?'armS':i===9?'armD':i===10||i===11?'body':i===12||i===19?'legL':'legR';
  const meet=(a,b,c,d)=>{const x1=b[0]-a[0],y1=b[1]-a[1],x2=d[0]-c[0],y2=d[1]-c[1],D=x1*y2-y1*x2;if(Math.abs(D)<1e-9)return null;const t=((c[0]-a[0])*y2-(c[1]-a[1])*x2)/D,u=((c[0]-a[0])*y1-(c[1]-a[1])*x1)/D;return t>=0&&t<=1&&u>=0&&u<=1?[a[0]+t*x1,a[1]+t*y1]:null};
  const inside=(P,p)=>{let r=false;for(let i=0,j=P.length-1;i<P.length;j=i++)if((P[i][1]>p[1])!==(P[j][1]>p[1])&&p[0]<(P[j][0]-P[i][0])*(p[1]-P[i][1])/(P[j][1]-P[i][1])+P[i][0])r=!r;return r};
  // возвращает [{p, a, b}]: место и какие части
  function find(E,SEG,gap=7){const C=SEG.map(s=>cl(E,s)),K=SEG.map(kind),B=C.map(L=>{let a=1e9,b=1e9,c=-1e9,d=-1e9;for(const p of L){if(p[0]<a)a=p[0];if(p[0]>c)c=p[0];if(p[1]<b)b=p[1];if(p[1]>d)d=p[1]}return[a,b,c,d]}),out=[];
    for(let i=0;i<C.length;i++)for(let j=i;j<C.length;j++){const A=K[i],Q=K[j],dr=A==='skin'||A==='rim',dq=Q==='skin'||Q==='rim';if(dr&&dq)continue;if(dr&&Q==='stick'||dq&&A==='stick')continue;if(A==='stick'&&Q==='stick'||A==='head'&&Q==='head')continue;
      if(i!==j&&(B[i][2]<B[j][0]||B[j][2]<B[i][0]||B[i][3]<B[j][1]||B[j][3]<B[i][1]))continue;
      const sh=ends(SEG[i]).filter(q=>ends(SEG[j]).includes(q)).map(q=>E[q]);
      for(let k=1;k<C[i].length;k++)for(let l=i===j?k+2:1;l<C[j].length;l++){const p=meet(C[i][k-1],C[i][k],C[j][l-1],C[j][l]);if(!p)continue;if(i!==j&&sh.some(q=>Math.hypot(q[0]-p[0],q[1]-p[1])<gap))continue;
        // рука держит бубен за край: первые миллиметры у захвата не считаются
        if((dr&&Q==='armD'||dq&&A==='armD')&&Math.hypot(E.left[0]-p[0],E.left[1]-p[1])<gap*1.6)continue;
        if(!out.some(o=>o.a===A&&o.b===Q&&Math.hypot(o.p[0]-p[0],o.p[1]-p[1])<9))out.push({p,a:A,b:Q})}}
    return out}
  return{find,kind}})();
