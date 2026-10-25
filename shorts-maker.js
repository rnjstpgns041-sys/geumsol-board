/* 슈퍼쇼츠 없이 브라우저에서 바로 쇼츠 영상(1080x1920)을 만든다.
   화면: 위 제목(두 줄) / 가운데 사진 + 자막 / 아래 업체 로고 / 끝에 로고 화면. 목소리는 구글 음성(있으면), 없으면 자막만.
   보내 준 업체 영상(유당·수월·정용균)의 모양을 따라 만든다. */
(function(root){
"use strict";
const W=1080,H=1920,HEAD=500,BAND=920,FOOT=500,FPS=30;
/* 업체별 모양. 사진·로고는 vbrand/<key>/ 에 있음 */
const BRAND={
  "유당":{dir:"yudang",bg:"#fcdedd",t1:"#151515",t2:"#e8473c",s1:88,s2:66,sub:{bg:"rgba(0,0,0,.88)",fg:"#fff"},endBg:"#fbdcdb",line:"#8b6b5c",phone:"051-552-7510",photos:8,logo:true},
  "수월":{dir:"suwol",bg:"#54402b",bg2:"#3f2f1f",t1:"#ffffff",t2:"#ffd43b",s1:62,s2:58,sub:{bg:"rgba(0,0,0,.88)",fg:"#fff"},endBg:"#f3ece1",line:"#8b6b4c",phone:"051-243-4300",photos:10,logo:true},
  "정용균":{dir:"jyg",bg:"#fdfdfd",bg2:"#eceae6",t1:"#151515",t2:"#151515",t2bg:"#2ee88a",s1:92,s2:50,sub:{bg:"#2ee88a",fg:"#111"},endBg:"#f5f1ec",line:"#8b7b6c",phone:"010-6407-0503",photos:9,logo:false,endName:"정용균변호사"}
};
const FONT='"Noto Sans KR","Malgun Gothic","Apple SD Gothic Neo",sans-serif';
function brandOf(name){const k=Object.keys(BRAND).find(x=>String(name||"").replace(/\s/g,"").includes(x));return k?Object.assign({key:k},BRAND[k]):null;}
function load(src){return new Promise((ok,no)=>{const im=new Image();im.crossOrigin="anonymous";im.onload=()=>ok(im);im.onerror=()=>no(new Error("그림을 못 불러왔어요: "+src));im.src=src;});}
function rng(seed){let s=(seed>>>0)||7;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return((s>>>0)%100000)/100000;};}
const len=s=>String(s).replace(/\s/g,"").length;
/* 자막 조각: 한 화면에 16자 안팎 */
function chunks(s){const w=String(s).trim().split(/\s+/),o=[];let c="";for(const x of w){if(c&&len(c+x)>15){o.push(c);c=x;}else c=c?c+" "+x:x;}if(c)o.push(c);return o;}
/* 제목 두 줄: 첫 문장을 가운데쯤 띄어쓰기에서 나눔 */
function titleOf(line){const s=String(line||"").replace(/[.!]$/,"").trim(),w=s.split(" ");if(w.length<2)return [s,""];
  let best=1,bd=1e9;for(let i=1;i<w.length;i++){const a=len(w.slice(0,i).join("")),d=Math.abs(a-len(s)*0.42);if(d<bd){bd=d;best=i;}}
  return [w.slice(0,best).join(" "),w.slice(best).join(" ")];}
function cover(g,im,x,y,w,h,z,px,py){const r=Math.max(w/im.width,h/im.height)*z,iw=im.width*r,ih=im.height*r;
  g.drawImage(im,x+(w-iw)/2+px*(iw-w)/2,y+(h-ih)/2+py*(ih-h)/2,iw,ih);}
function fitText(g,t,max,size,weight){let s=size;do{g.font=`${weight||900} ${s}px ${FONT}`;if(g.measureText(t).width<=max)break;s-=2;}while(s>24);return s;}
function roundRect(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
const ease=t=>t<0?0:t>1?1:1-Math.pow(1-t,3);

/* 영상 설계: 문장별 길이(목소리 길이나 글자 수)로 장면·자막·끝 화면 시간을 정함 */
function plan(lines,durs,opt){const T=[],scenes=[];let t=0.25;const r=rng(opt.seed||1);
  const order=[...Array(opt.nPhotos).keys()].sort(()=>r()-.5);let pi=0;
  lines.forEach((ln,i)=>{const d=durs[i],cs=chunks(ln),tot=cs.reduce((a,c)=>a+len(c),0)||1;let u=t;
    cs.forEach(c=>{const cd=d*len(c)/tot;T.push({t:u,d:cd,c});u+=cd;});
    scenes.push({t,d,photo:order[pi++%order.length],fx:i%3});t+=d+(opt.gap||0.18);});
  const total=t+0.9,endAt=Math.max(scenes.length>1?scenes[scenes.length-1].t:total-3.5,total-6);
  return {subs:T,scenes,total,endAt};}

async function prepare(o){const B=o.brand,base=o.base||"";
  await Promise.all(["900 80px "+FONT,"700 50px "+FONT].map(f=>document.fonts&&document.fonts.load?document.fonts.load(f).catch(()=>{}):0));
  const photos=[];for(const src of (o.photos&&o.photos.length?o.photos:[...Array(B.photos)].map((_,i)=>`${base}vbrand/${B.dir}/p${String(i+1).padStart(2,"0")}.jpg`))){try{photos.push(await load(src));}catch(e){}}
  if(!photos.length)throw new Error("쓸 사진이 없어요.");
  const foot=await load(`${base}vbrand/${B.dir}/footer.jpg`),logo=B.logo?await load(`${base}vbrand/${B.dir}/logo.jpg`):null;
  return {photos,foot,logo};}

function drawFrame(g,t,S){const {B,P,A,title,kw}=S;
  /* 위 제목 */
  if(B.bg2){const gr=g.createLinearGradient(0,0,0,HEAD);gr.addColorStop(0,B.bg);gr.addColorStop(1,B.bg2);g.fillStyle=gr;}else g.fillStyle=B.bg;g.fillRect(0,0,W,HEAD);
  g.textAlign="center";g.textBaseline="middle";
  const s1=fitText(g,title[0],W-90,B.s1);g.fillStyle=B.t1;g.fillText(title[0],W/2,title[1]?HEAD*0.42:HEAD/2);
  if(title[1]){const s2=fitText(g,title[1],W-110,B.s2,900),y2=HEAD*0.42+s1*0.55+s2*0.75;
    if(B.t2bg){const w=g.measureText(title[1]).width+36;g.fillStyle=B.t2bg;g.fillRect(W/2-w/2,y2-s2*0.68,w,s2*1.36);}
    g.fillStyle=B.t2;g.fillText(title[1],W/2,y2);}
  /* 가운데 사진: 천천히 확대 + 장면 바뀔 때 밀기·겹치기·확대 효과 */
  g.save();g.beginPath();g.rect(0,HEAD,W,BAND);g.clip();
  let k=P.scenes.findIndex((s,i)=>t>=s.t&&(i===P.scenes.length-1||t<P.scenes[i+1].t));if(k<0)k=0;
  const sc=P.scenes[k],prev=P.scenes[k-1],p=(t-sc.t)/Math.max(1,sc.d+0.4),tr=ease((t-sc.t)/0.45);
  const draw=(s,pp,alpha,dx)=>{const im=A.photos[s.photo%A.photos.length],z=1.04+0.08*pp,dir=s.photo%2?1:-1;g.globalAlpha=alpha;cover(g,im,dx,HEAD,W,BAND,z,dir*0.4*pp,0);g.globalAlpha=1;};
  if(prev&&tr<1){const pp=(t-prev.t)/Math.max(1,prev.d+0.4);
    if(sc.fx===0){draw(prev,pp,1,-W*tr);draw(sc,p,1,W*(1-tr));}
    else if(sc.fx===1){draw(prev,pp,1,0);draw(sc,p,tr,0);}
    else{draw(prev,pp,1,0);g.save();const r=Math.max(1,tr*W*0.75);g.beginPath();g.arc(W/2,HEAD+BAND/2,r,0,7);g.clip();draw(sc,p,1,0);g.restore();}}
  else draw(sc,p,1,0);
  /* 끝 화면: 로고가 크게 들어왔다가 조금씩 작아짐 */
  if(t>=P.endAt){const e=ease((t-P.endAt)/0.6),zz=1.08-0.06*ease((t-P.endAt)/(P.total-P.endAt));
    g.fillStyle=B.endBg;g.globalAlpha=e;g.fillRect(0,HEAD,W,BAND);
    g.save();g.translate(W/2,HEAD+305);g.scale(zz,zz);g.translate(0,(1-e)*140);
    if(A.logo){const h=560,w=A.logo.width*h/A.logo.height;g.drawImage(A.logo,-w/2,-h/2,w,h);}
    else{g.textAlign="center";g.fillStyle="#3a3a3a";fitText(g,kw||B.endName,W-160,84);g.fillText(kw||B.endName,0,-150);
      g.fillStyle="#151515";fitText(g,B.endName,W-120,128);g.shadowColor="rgba(0,0,0,.25)";g.shadowBlur=14;g.shadowOffsetY=6;g.fillText(B.endName,0,70);g.shadowColor="transparent";}
    g.restore();
    const ly=HEAD+620;g.strokeStyle=B.line;g.lineWidth=3;g.beginPath();g.moveTo(40,ly);g.lineTo(W-40,ly);g.stroke();
    g.fillStyle=B.line;g.save();g.translate(W/2,ly);g.rotate(Math.PI/4);g.fillRect(-9,-9,18,18);g.restore();
    g.font=`700 52px ${FONT}`;const tx=`상담문의 : ${B.phone}`,tw=g.measureText(tx).width,x0=W/2-(tw+80)/2;
    g.fillStyle="#2a2a2a";g.beginPath();g.arc(x0+30,ly+80,30,0,7);g.fill();g.fillStyle="#fff";g.font=`900 34px ${FONT}`;g.fillText("☎",x0+30,ly+82);
    g.fillStyle="#2a2a2a";g.font=`700 52px ${FONT}`;g.textAlign="left";g.fillText(tx,x0+80,ly+82);g.textAlign="center";g.globalAlpha=1;}
  g.restore();
  /* 자막 */
  const sub=P.subs.find(x=>t>=x.t&&t<x.t+x.d);
  if(sub){const pop=ease((t-sub.t)/0.18);g.font=`700 54px ${FONT}`;const tw=g.measureText(sub.c).width,y=HEAD+BAND-150;
    g.globalAlpha=pop;g.fillStyle=B.sub.bg;g.fillRect(W/2-tw/2-22,y-40,tw+44,80);g.fillStyle=B.sub.fg;g.fillText(sub.c,W/2,y+(1-pop)*12);g.globalAlpha=1;}
  /* 아래 로고 */
  g.drawImage(A.foot,0,HEAD+BAND,W,FOOT);}

function pickMime(){const c=["video/mp4;codecs=avc1.42E01E,mp4a.40.2","video/mp4;codecs=avc1,mp4a","video/mp4","video/webm;codecs=vp9,opus","video/webm;codecs=vp8,opus","video/webm"];
  return c.find(m=>window.MediaRecorder&&MediaRecorder.isTypeSupported(m))||"";}

/* o: {name, kw, lines[], audios[ArrayBuffer|null], canvas, base, seed, onProgress(p,msg)} → {blob,mime,ext,seconds} */
async function make(o){const B=brandOf(o.name);if(!B)throw new Error("영상 모양이 없는 업체예요.");
  const lines=o.lines.map(s=>s.trim()).filter(Boolean);if(!lines.length)throw new Error("대본이 비어 있어요.");
  const A=await prepare({brand:B,base:o.base,photos:o.photos});
  const ac=new (window.AudioContext||window.webkitAudioContext)();const bufs=[];
  for(const a of (o.audios||[])){try{bufs.push(a?await ac.decodeAudioData(a.slice(0)):null);}catch(e){bufs.push(null);}}
  /* 직접 녹음한 목소리 하나: 문장 길이 비율로 나눔 */
  let nar=null;if(o.narration){try{nar=await ac.decodeAudioData(o.narration.slice(0));}catch(e){throw new Error("녹음한 소리를 읽지 못했어요. 다시 녹음해 주세요.");}}
  const tl=lines.reduce((a,l)=>a+len(l),0)||1;
  const durs=lines.map((l,i)=>nar?nar.duration*len(l)/tl-0.001:bufs[i]?bufs[i].duration:Math.max(1.6,len(l)*0.19));
  const P=plan(lines,durs,{seed:o.seed,nPhotos:A.photos.length,gap:nar?0:bufs.some(Boolean)?0.22:0.15});
  const S={B,P,A,title:o.title||titleOf(lines[0]),kw:o.kw};
  const cv=o.canvas||document.createElement("canvas");cv.width=W;cv.height=H;const g=cv.getContext("2d");
  drawFrame(g,0,S);
  const mime=pickMime();if(!mime)throw new Error("이 브라우저는 영상 저장을 못 해요. 크롬이나 엣지로 열어 주세요.");
  const dest=ac.createMediaStreamDestination(),vs=cv.captureStream(FPS);
  const st=new MediaStream([...vs.getVideoTracks(),...dest.stream.getAudioTracks()]);
  const rec=new MediaRecorder(st,{mimeType:mime,videoBitsPerSecond:6e6,audioBitsPerSecond:128e3});const parts=[];
  rec.ondataavailable=e=>{if(e.data&&e.data.size)parts.push(e.data);};
  const done=new Promise(ok=>rec.onstop=ok);
  if(ac.state==="suspended")await ac.resume();
  /* 무음 하나를 깔아 두면 목소리가 없어도 소리 트랙이 생겨서 어디서나 재생됨 */
  const sil=ac.createConstantSource?ac.createConstantSource():null;if(sil){const gz=ac.createGain();gz.gain.value=0;sil.connect(gz).connect(dest);sil.start();}
  rec.start(500);const t0=ac.currentTime+0.05;
  if(nar){const n=ac.createBufferSource();n.buffer=nar;n.connect(dest);if(o.monitor)n.connect(ac.destination);n.start(t0+P.scenes[0].t);}
  P.scenes.forEach((s,i)=>{if(bufs[i]){const n=ac.createBufferSource();n.buffer=bufs[i];n.connect(dest);if(o.monitor)n.connect(ac.destination);n.start(t0+s.t);}});
  await new Promise(ok=>{let last=-1;const tick=()=>{const t=ac.currentTime-t0;if(t>=P.total){ok();return;}
      if(t>=0){drawFrame(g,t,S);const p=Math.floor(t/P.total*100);if(p!==last){last=p;o.onProgress&&o.onProgress(p,t,P.total);}}
      setTimeout(tick,1000/FPS/2);};tick();});
  drawFrame(g,P.total-0.01,S);await new Promise(r=>setTimeout(r,250));rec.stop();await done;if(sil)sil.stop();ac.close();
  const blob=new Blob(parts,{type:mime.split(";")[0]});
  return {blob,mime,ext:mime.startsWith("video/mp4")?"mp4":"webm",seconds:P.total};}

/* 미리보기: 소리 없이 화면만 그려 봄 */
async function still(o){const B=brandOf(o.name);if(!B)return null;const A=await prepare({brand:B,base:o.base,photos:o.photos});
  const lines=o.lines.filter(Boolean),P=plan(lines,lines.map(l=>Math.max(1.6,len(l)*0.19)),{seed:o.seed,nPhotos:A.photos.length});
  const cv=o.canvas;cv.width=W;cv.height=H;drawFrame(cv.getContext("2d"),o.at==null?1.2:o.at*P.total,{B,P,A,title:o.title||titleOf(lines[0]),kw:o.kw});return P;}

root.ShortsMaker={make,still,brandOf,titleOf,BRAND};
})(window);
