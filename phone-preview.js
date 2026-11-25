// One phone, three slides (profile / post / story). Brand-neutral version of igPreview() in reference/assets.html.
// const phone = createPhonePreview({button, data, context, isOn, setOn})
//   button  : the "eye" toggle element            isOn()/setOn(bool): persisted open state (put it in S.eye)
//   context : () => 0 profile | 1 post | 2 story  what is being edited; the phone follows only when this changes
//   data    : () => ({ handle, name, bio:[lines], link, numbers:[[n,label]], caption, likes, comments:[{mine,name,text,meta}],
//               avatar, highlights:[{title,draw}], grid:[{draw,carousel}], feed:[Image], post:{draw,ratio,bg,light} })
//               avatar / draw are (w,h) => canvas. grid is newest first, a linked run is ONE item. ratio = H/W.
// phone.render() after every rebuild; phone.live(canvas,u,{bg,light}) on every frame of the edited post (u = 0..1 progress, null = full);
// phone.avatar(canvas) and phone.highlight(k,canvas) while those are being edited.
function createPhonePreview({button,data,context,isOn,setOn,labels={}}){
  const L=Object.assign({profile:'профиль',post:'пост',story:'сторис',publications:'Публикации',reply:'Отправить сообщение',likes:'Нравится',show:'превью в инстаграме',hide:'спрятать превью'},labels);
  const el=(t,c,txt)=>{const e=document.createElement(t);if(c)e.className=c;if(txt!=null)e.textContent=txt;return e};
  const dpr=()=>Math.min(devicePixelRatio||1,2),K=()=>Math.max(.45,Math.min(.95,(innerHeight-60-16-64)/844));
  const cv=(w,h,c)=>{const e=el('canvas',c);e.width=Math.round(w*dpr());e.height=Math.round(h*dpr());return e};
  const cover=(c,im,iw,ih,fit='max')=>{const x=c.getContext('2d'),s=Math[fit](c.width/iw,c.height/ih);x.drawImage(im,(c.width-iw*s)/2,(c.height-ih*s)/2,iw*s,ih*s)};
  const fill=(c,img)=>{const x=c.getContext('2d');x.clearRect(0,0,c.width,c.height);x.drawImage(img,0,0,c.width,c.height)};
  const head=s=>{const b=el('div','igsb');b.append(el('b','','12:01'),el('span','','5G ▮'));s.appendChild(b)};
  let slide=context(),ctx=null,lv=null,avs=[],hls=[],track=null,dots=null;
  const panel=el('div','igpanel');document.body.appendChild(panel);
  button.addEventListener('click',()=>{setOn(!isOn());render()});
  addEventListener('resize',()=>render());
  function go(k,animate=true){slide=Math.min(2,Math.max(0,k));if(!track)return;track.classList.toggle('still',!animate);track.style.transform=`translateX(${-slide*100/3}%)`;
    [...dots.children].forEach((b,i)=>{b.classList.toggle('on',i===slide);b.setAttribute('aria-pressed',i===slide)})}
  function avatar(img){avs.forEach(c=>fill(c,img))}
  function highlight(k,img){if(hls[k])fill(hls[k],img)}
  // feed screen crops (cover), story screen fits on the post's own background
  function live(img,u,o={}){if(!lv)return;cover(lv.post,img,img.width,img.height);const x=lv.story.getContext('2d');
    if(o.bg!=null)lv.bg=o.bg;if(o.light!=null)lv.light=o.light;x.fillStyle=lv.bg;x.fillRect(0,0,lv.story.width,lv.story.height);cover(lv.story,img,img.width,img.height,'min');
    lv.story.parentElement.classList.toggle('light',!!lv.light);lv.prog.style.width=(u==null?100:u*100)+'%'}
  function build(){const d=data(),PW=366;avs=[];hls=[];
    const av=s=>{const c=cv(s,s,'igav');c.style.width=c.style.height=s+'px';avs.push(c);return c};
    // profile
    const a=el('div','igs');head(a);const hd=el('div','ighd c');hd.append(el('span','','‹'),el('b','',d.handle),el('span'));a.appendChild(hd);
    const top=el('div','igtop'),st=el('div','igst'),nums=el('div','ignums');(d.numbers||[]).forEach(([n,t])=>{const q=el('div','',t);q.prepend(el('b','',n));nums.appendChild(q)});
    st.append(el('div','igun',d.name),nums);top.append(av(86),st);a.appendChild(top);
    const bio=el('div','igbio');(d.bio||[]).forEach((t,i)=>{const n=el(i?'div':'b','',t);bio.appendChild(n)});if(d.link)bio.appendChild(el('div','iglink','🔗 '+d.link));a.appendChild(bio);
    const bt=el('div','igbt');bt.append(el('span','','Following ⌄'),el('span','','Message'),el('span','sq','+'));a.appendChild(bt);
    const hs=el('div','igstories');(d.highlights||[]).forEach(h=>{const s=el('div','igstory'),c=cv(64,64);fill(c,h.draw(c.width,c.height));hls.push(c);s.append(c,el('span','',(h.title||'').length>9?h.title.slice(0,8)+'…':h.title));hs.appendChild(s)});a.appendChild(hs);
    const tabs=el('div','igtabs');tabs.innerHTML='<i class="on"><svg viewBox="0 0 24 24"><path d="M4 4h4v4H4zM10 4h4v4h-4zM16 4h4v4h-4zM4 10h4v4H4zM10 10h4v4h-4zM16 10h4v4h-4zM4 16h4v4H4zM10 16h4v4h-4zM16 16h4v4h-4z"/></svg></i><i><svg viewBox="0 0 24 24" class="ol"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><path d="M10 8.5v7l5.5-3.5z"/></svg></i><i><svg viewBox="0 0 24 24" class="ol"><rect x="3.5" y="4.5" width="17" height="16" rx="4"/><circle cx="12" cy="11" r="3"/></svg></i>';a.appendChild(tabs);
    const grid=el('div','iggrid'),G=d.grid||[],F=d.feed||[];
    for(let k=0;k<9;k++){const c=cv(122,152),x=c.getContext('2d'),q=G[k];x.fillStyle='#f1f1f1';x.fillRect(0,0,c.width,c.height);
      if(q){const sc=Math.max(c.width,c.height/q.ratio),r=q.draw(Math.round(sc),Math.round(sc*q.ratio));cover(c,r,r.width,r.height);
        if(q.carousel){const w=c.width,u=w/24;x.fillStyle=x.strokeStyle='#fff';x.lineWidth=u*.7;x.beginPath();x.roundRect(w-u*7,u*2.4,u*4,u*4,u*.8);x.fill();x.beginPath();x.roundRect(w-u*8.4,u*3.8,u*4,u*4,u*.8);x.stroke()}}
      else{const im=F[k-G.length],p=()=>cover(c,im,im.naturalWidth,im.naturalHeight);if(im){if(im.complete&&im.naturalWidth)p();else im.addEventListener('load',p,{once:true})}}
      grid.appendChild(c)}a.appendChild(grid);
    // publication: never taller than 4:5
    const b=el('div','igs');head(b);const h2=el('div','ighd');h2.append(el('span','','‹'),el('b','',L.publications),el('span'));b.appendChild(h2);
    const au=el('div','igau');au.append(av(30),el('b','',d.handle),el('span','igdots','⋯'));b.appendChild(au);
    const P=d.post,pc=cv(PW,PW*Math.min(P?P.ratio:1.25,1.25),'igpost');b.append(pc,el('div','igacts','♡  💬  ➤'));
    const cap=el('div','igcap');if(d.likes!=null)cap.appendChild(el('b','',`${L.likes}: ${d.likes}`));const ct=el('div','',' '+(d.caption||''));ct.prepend(el('b','',d.handle));if(d.more)ct.appendChild(el('span','igmore',d.more));cap.appendChild(ct);if(d.note)cap.appendChild(el('div','igmeta',d.note));b.appendChild(cap);
    (d.comments||[]).forEach(q=>{const r=el('div','igcm'),t=el('div','',' '+q.text);t.prepend(el('b','',q.name));t.appendChild(el('div','igmeta',q.meta));r.append(q.mine?av(28):el('i','iggray'),t);b.appendChild(r)});
    // story
    const s=el('div','igs igst3');head(s);const media=el('div','igmedia'),sc=cv(PW,PW*16/9),bar=el('div','igbar'),prog=el('i'),who=el('div','igwho');bar.appendChild(prog);who.append(av(32),el('b','',d.handle),el('span','','2 ч'),el('span','igx','×'));
    media.append(sc,bar,who);s.appendChild(media);const rp=el('div','igreply');rp.append(el('span','',L.reply),el('i','','♡'),el('i','','➤'));s.appendChild(rp);
    lv={post:pc,story:sc,prog,bg:P&&P.bg||'#141414',light:P&&P.light};
    if(P)live(P.draw(pc.width,Math.round(pc.width*P.ratio)),null);
    if(d.avatar)avatar(d.avatar(400,400));
    track=el('div','igtrack');track.append(a,b,s);const ph=el('div','igph');ph.appendChild(track);const card=el('div','igcard'),w1=el('div','igwrap');w1.appendChild(ph);
    dots=el('div','igdotsnav');[L.profile,L.post,L.story].forEach((n,k)=>{const q=el('button','',n);q.onclick=()=>go(k);dots.appendChild(q)});
    dots.onkeydown=e=>{const q={ArrowLeft:-1,ArrowRight:1}[e.key];if(q){e.preventDefault();go(slide+q);dots.children[slide].focus()}};card.append(w1,dots);
    // flip: drag sideways (15 % of the width is enough) or sideways wheel, one slide per gesture
    let x0=null,dx=0,lock=0;ph.onpointerdown=e=>{if(e.button)return;x0=e.clientX;dx=0;ph.setPointerCapture(e.pointerId)};
    ph.onpointermove=e=>{if(x0==null)return;dx=e.clientX-x0;track.classList.add('still');track.style.transform=`translateX(calc(${-slide*100/3}% + ${dx/K()}px))`};
    ph.onpointerup=ph.onpointercancel=()=>{if(x0==null)return;x0=null;const w=390*K();go(slide+(dx<-w*.15?1:dx>w*.15?-1:0))};
    ph.addEventListener('wheel',e=>{if(Math.abs(e.deltaX)<=Math.abs(e.deltaY))return;e.preventDefault();if(Date.now()<lock||Math.abs(e.deltaX)<8)return;lock=Date.now()+500;go(slide+(e.deltaX>0?1:-1))},{passive:false});
    return card}
  function render(){const on=isOn(),t=on?L.hide:L.show;button.classList.toggle('on',on);button.title=t;button.setAttribute('aria-label',t);button.setAttribute('aria-pressed',on);panel.classList.toggle('on',on);
    document.body.style.setProperty('--pv',on?Math.round(390*K()+40)+'px':'0px');document.body.style.setProperty('--igk',K());
    const c=context();if(c!==ctx){ctx=c;slide=c}
    panel.innerHTML='';lv=null;track=dots=null;if(on){panel.appendChild(build());go(slide,false)}}
  return{render,go,live,avatar,highlight}}
