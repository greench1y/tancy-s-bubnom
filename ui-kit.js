// UI kit from barabannaja/assets.html: swatches, knob, toast with undo. Brand-neutral, no dependencies.
let toastT;
function toast(msg,undo){let t=document.getElementById('toast');if(!t){t=document.createElement('div');t.id='toast';t.setAttribute('role','status');document.body.appendChild(t)}
  t.innerHTML='';t.append(msg);if(undo){const b=document.createElement('button');b.textContent='отменить';b.onclick=()=>{undo();t.classList.remove('on')};t.appendChild(b)}
  t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('on'),7000)}
const el=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e};
const dpr=()=>Math.min(devicePixelRatio||1,2);
function swatch(val,cur,css,on,title){const b=el('button','sw'+(val===cur?' on':''));b.style.background=css;b.title=title||'';b.setAttribute('aria-label',title||'');b.setAttribute('aria-pressed',val===cur);b.onclick=on;return b}
function swatchRow(p,opts,cur,on){const w=el('div','sws');for(const[v,css,t]of opts)w.appendChild(swatch(v,cur,css,()=>on(v),t));p.appendChild(w)}
// synth-like knob: drag up/down or scroll; arrows on the keyboard
function knob(label,val,on,done){const w=el('div','knob');w.title=label;w.tabIndex=0;w.setAttribute('role','slider');w.setAttribute('aria-label',label);
  w.innerHTML='<svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="20" class="kt"/><path class="kv"/><line x1="22" y1="22" x2="22" y2="8" class="kp"/></svg><span></span>';
  const draw=v=>{const a0=-135,a1=a0+270*v,r=20,p=a=>[22+r*Math.cos((a-90)*Math.PI/180),22+r*Math.sin((a-90)*Math.PI/180)],[sx,sy]=p(a0),[ex,ey]=p(a1);
    w.querySelector('.kv').setAttribute('d',`M${sx} ${sy} A${r} ${r} 0 ${270*v>180?1:0} 1 ${ex} ${ey}`);w.querySelector('.kp').setAttribute('transform',`rotate(${a1} 22 22)`);
    w.querySelector('span').textContent=label;w.setAttribute('aria-valuenow',Math.round(v*100))};
  let v=val,st=null;draw(v);const set=nv=>{v=Math.min(1,Math.max(0,nv));draw(v);on(v)};
  w.onpointerdown=e=>{st=[e.clientY,v];w.setPointerCapture(e.pointerId)};w.onpointermove=e=>{if(st)set(st[1]+(st[0]-e.clientY)/150)};w.onpointerup=()=>{if(st){st=null;done&&done()}};
  w.onwheel=e=>{e.preventDefault();set(v-e.deltaY/600);clearTimeout(w._t);w._t=setTimeout(()=>done&&done(),300)};
  w.onkeydown=e=>{const d={ArrowUp:.05,ArrowRight:.05,ArrowDown:-.05,ArrowLeft:-.05}[e.key];if(d){e.preventDefault();set(v+d);done&&done()}};
  return w}
const lab=(t,ctl)=>{const w=el("div","kico");w.appendChild(el("span","klab",t));w.appendChild(ctl);return w};
