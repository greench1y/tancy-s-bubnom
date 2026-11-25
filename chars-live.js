'use strict';
// персонажи для билдера и гайда: живой список со вкладки «персонаж», а пока его нет — 14 из characters.js
// номера 0…13 и id новых персонажей не меняются, поэтому посты не путаются при удалении и добавлении
const CHARLIB=(()=>{const KEY='tsb.characters.baked',SRC='tsb.characters.v3';let raw=null,map={},ids=[],pts={},boxes=new Map();
  const ls=k=>{try{return localStorage.getItem(k)}catch(e){return null}},js=t=>{try{return JSON.parse(t||'null')}catch(e){return null}};
  function refresh(){const r=ls(KEY);if(r===raw&&ids.length)return false;raw=r;
    map={};pts={};boxes=new Map();CHARS.forEach((c,i)=>{const id=c.id??i;map[id]=c;if(c.E)pts[id]=c.E});const L=js(r);
    if(Array.isArray(L)&&L.some(c=>!c.dead)){const old=js(ls(SRC)),by={};if(old&&Array.isArray(old.list))for(const T of old.list)if(T.id!=null)by[T.id]=T;
      for(const c of L){map[c.id]=c;if(c.E)pts[c.id]=c.E;else{delete pts[c.id];try{if(by[c.id])pts[c.id]=CORE.fitted(by[c.id])}catch(e){}}}
      ids=L.filter(c=>!c.dead).map(c=>c.id)}else ids=CHARS.map((c,i)=>c.id??i);return true}
  refresh();
  // кадр танца: рамка одна на всю петлю, как на вкладке «персонаж»
  function frame(id,u,m){const E0=pts[id];if(!E0)return null;const key=id+'|'+m.hit+'|'+m.dance;let B=boxes.get(key);if(!B){for(let i=0;i<64;i++)B=CORE.box(DANCE.frame(E0,i/64,m,CORE.NAMES),B);if(boxes.size>200)boxes.clear();boxes.set(key,B)}
    const c=map[id],o=CORE.shapes(CORE.norm(DANCE.frame(E0,u,m,CORE.NAMES),B));o.w=c.w;o.s=c.s;return o}
  return{KEY,refresh,frame,get ids(){return ids},get:id=>id==null?null:map[id]||null,next(id,k=1){const i=ids.findIndex(v=>v===(id||0)),n=ids.length;return ids[((i<0?-1:i)+k+n)%n]}}})();
