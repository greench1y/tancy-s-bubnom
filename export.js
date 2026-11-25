// MP4/PNG export from barabannaja/assets.html. The page provides: durOf(p), renderPost(p,W,H,{t}) -> canvas, toast(). Rename the file prefix.
// H.264 first (instagram takes it everywhere); VP9 inside MP4 only if the browser has no H.264 encoder
async function pickCodec(w,h){for(const[c,m]of[['avc1.640033','avc'],['avc1.640028','avc'],['avc1.4d0033','avc'],['avc1.42003e','avc'],['avc1.42001f','avc'],['vp09.00.40.08','vp9']]){try{const r=await VideoEncoder.isConfigSupported({codec:c,width:w,height:h,bitrate:8e6,framerate:30});if(r.supported)return[c,m]}catch(e){}}return null}
// one post as a clip: its own length (durOf), 30 fps, H.264 in MP4
async function saveMP4(p,i,W,H,prog){
  if(!('VideoEncoder' in window)){toast('этот браузер не пишет видео — открой в свежем Chrome');return}
  try{const{Muxer,ArrayBufferTarget}=await import('./lib/mp4-muxer.mjs');
    const fps=30,N=Math.round(durOf(p.set)*fps),pc=await pickCodec(W,H);if(!pc)throw Error('нет видеокодека');const[codec,mc]=pc;
    const muxer=new Muxer({target:new ArrayBufferTarget(),video:{codec:mc,width:W,height:H},fastStart:'in-memory'});let err=null;
    const enc=new VideoEncoder({output:(c,m)=>muxer.addVideoChunk(c,m),error:e=>err=e});enc.configure({codec,width:W,height:H,bitrate:Math.round(W*H*6),framerate:fps});
    for(let f=0;f<N;f++){if(err)throw err;const T=f/fps,fr=draw('post',i,W,H,{t:T});
      const vf=new VideoFrame(fr,{timestamp:Math.round(T*1e6),duration:Math.round(1e6/fps)});enc.encode(vf,{keyFrame:f%fps===0});vf.close();
      while(enc.encodeQueueSize>4)await new Promise(r=>setTimeout(r,1));if(f%3===0){prog&&prog(f/N);await new Promise(r=>setTimeout(r,0))}}
    await enc.flush();if(err)throw err;muxer.finalize();
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([muxer.target.buffer],{type:'video/mp4'}));a.download=`tancy-s-bubnom-post-${i+1}-${W}x${H}.mp4`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4000)}
  catch(e){console.error(e);toast('не получилось записать видео: '+e.message)}}
