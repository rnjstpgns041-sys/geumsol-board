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
/* 큰 사진은 미리 영상 크기에 맞게 줄여 둔다 (매 장면 큰 사진을 줄이며 그리면 효과 때 끊김) */
function shrink(im,w,h,z){const r=Math.min(1,Math.max(w/im.width,h/im.height)*(z||1));if(r>0.92)return im;
  const c=document.createElement("canvas");c.width=Math.max(1,Math.round(im.width*r));c.height=Math.max(1,Math.round(im.height*r));
  const x=c.getContext("2d");x.imageSmoothingQuality="high";x.drawImage(im,0,0,c.width,c.height);return c;}
function fitText(g,t,max,size,weight){let s=size;do{g.font=`${weight||900} ${s}px ${FONT}`;if(g.measureText(t).width<=max)break;s-=2;}while(s>24);return s;}
function roundRect(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
const ease=t=>t<0?0:t>1?1:1-Math.pow(1-t,3);

/* 영상 설계: 문장별 길이(목소리 길이나 글자 수)로 자막·장면·끝 화면 시간을 정함.
   own[i]: i번째 문장에 맞춰 찾은 사진 번호(-1이면 업체 사진 문장). nBrand: 업체 사진 수(앞의 nUp장은 팀이 올린 사진).
   같은 사진은 다시 나오지 않게, 업체 사진이 모자라면 이웃한 업체 문장끼리 한 장면으로 묶음.
   업체 사진 장면은 늘 '위로 올라가기'(mv 4, fx 3) */
function plan(lines,durs,opt){const T=[],L=[];let t=0.25;const gap=opt.gap==null?0.18:opt.gap,r=rng(opt.seed||1);
  lines.forEach((ln,i)=>{const d=durs[i],cs=chunks(ln),tot=cs.reduce((a,c)=>a+len(c),0)||1;let u=t;
    cs.forEach(c=>{const cd=d*len(c)/tot;T.push({t:u,d:cd,c});u+=cd;});L.push({t,d});t+=d+gap;});
  const total=t+0.9,own=opt.own||[],nB=Math.max(0,opt.nBrand==null?opt.nPhotos:opt.nBrand),nUp=Math.min(nB,opt.nUp||0);
  const dur=g=>g.i.reduce((a,i)=>a+L[i].d,0);let G;
  if(!own.some(x=>x>=0)){const n=Math.max(1,Math.min(lines.length,nB||1)),sum=L.reduce((a,x)=>a+x.d,0)||1;let cum=0;G=[];
    L.forEach((x,i)=>{const g=Math.min(n-1,Math.floor((cum+x.d/2)/sum*n));cum+=x.d;if(G.length&&G[G.length-1].g===g)G[G.length-1].i.push(i);else G.push({g,co:true,i:[i]});});}
  else{G=L.map((x,i)=>({co:!(own[i]>=0),i:[i]}));let coN=G.filter(g=>g.co).length;
    while(coN>nB){let best=-1,bd=1e9;for(let k=0;k+1<G.length;k++)if(G[k].co&&G[k+1].co){const d=dur(G[k])+dur(G[k+1]);if(d<bd){bd=d;best=k;}}
      if(best>=0){G[best].i.push(...G[best+1].i);G.splice(best+1,1);coN--;continue;}
      const k=G.findIndex(g=>g.co);if(k<0)break;if(k>0)G[k-1].i.push(...G[k].i);else G[1].i.unshift(...G[0].i);G.splice(k,1);coN--;}}
  const shuf=a=>a.sort(()=>r()-.5),order=[...shuf([...Array(nUp).keys()]),...shuf([...Array(nB-nUp).keys()].map(x=>x+nUp))];let bi=0;
  const allCo=G.every(g=>g.co);
  const scenes=G.map(gr=>{const a=L[gr.i[0]],z=L[gr.i[gr.i.length-1]];let ph=gr.co?order[bi++]:own[gr.i[0]];
    if(ph==null||ph<0)ph=gr.i.map(i=>own[i]).find(x=>x>=0);if(ph==null||ph<0)ph=0;
    return {t:a.t,d:z.t+z.d-a.t,photo:ph,co:gr.co&&(!allCo||ph<nUp)};});
  /* 업체 사진은 위로 올라가기로 고정, 나머지는 바로 앞과 다른 움직임·효과 */
  if(allCo&&scenes.length)scenes[scenes.length-1].co=true;
  let lm=-1,lf=-1;const MV=[0,1,2,3,5],FX=[0,1,2,4,5];
  scenes.forEach(sc=>{if(sc.co){sc.mv=4;sc.fx=3;lm=4;lf=3;return;}let m,f;do m=MV[Math.floor(r()*MV.length)];while(m===lm);do f=FX[Math.floor(r()*FX.length)];while(f===lf);sc.mv=lm=m;sc.fx=lf=f;});
  const endAt=Math.max(scenes.length>1?scenes[scenes.length-1].t:total-3.5,total-6);
  return {subs:T,lines:L,scenes,total,endAt};}

async function prepare(o){const B=o.brand,base=o.base||"";
  await Promise.all(["900 80px "+FONT,"700 50px "+FONT].map(f=>document.fonts&&document.fonts.load?document.fonts.load(f).catch(()=>{}):0));
  const photos=[];let nUp=0;
  /* 팀이 올린 업체 사진(먼저 씀) + 기본 업체 사진 */
  for(const src of (o.coPhotos||[])){try{photos.push(await load(src));nUp++;}catch(e){}}
  for(const src of (o.photos&&o.photos.length?o.photos:[...Array(B.photos)].map((_,i)=>`${base}vbrand/${B.dir}/p${String(i+1).padStart(2,"0")}.jpg`))){try{photos.push(await load(src));}catch(e){}}
  const nBrand=photos.length,own=[];
  /* 대본 문장에 맞춰 찾은 사진 (문장마다 하나, 없으면 null = 업체 사진 문장) */
  for(const src of (o.extra||[])){if(!src){own.push(-1);continue;}try{photos.push(await load(src));own.push(photos.length-1);}catch(e){own.push(-1);}}
  if(!photos.length)throw new Error("쓸 사진이 없어요.");
  let foot=await load(`${base}vbrand/${B.dir}/footer.jpg`),logo=B.logo?await load(`${base}vbrand/${B.dir}/logo.jpg`):null;
  /* 가장 크게 확대될 때(약 1.75배)도 선명한 크기까지만 남김 */
  for(let i=0;i<photos.length;i++)photos[i]=shrink(photos[i],W,BAND,1.75);
  foot=shrink(foot,W,FOOT,1);if(logo)logo=shrink(logo,logo.width*600/logo.height,600,1);
  return {photos,foot,logo,own,nBrand,nUp};}

/* 위 제목은 영상 내내 같으니 한 번만 그려 두고 붙인다 */
function headOf(S){if(S.head)return S.head;const c=document.createElement("canvas");c.width=W;c.height=HEAD;drawHead(c.getContext("2d"),S);return S.head=c;}
function drawFrame(g,t,S){const {B,P,A,kw}=S;
  g.drawImage(headOf(S),0,0);
  drawMid(g,t,S);}
function drawHead(g,S){const {B,title}=S;
  if(B.bg2){const gr=g.createLinearGradient(0,0,0,HEAD);gr.addColorStop(0,B.bg);gr.addColorStop(1,B.bg2);g.fillStyle=gr;}else g.fillStyle=B.bg;g.fillRect(0,0,W,HEAD);
  g.textAlign="center";g.textBaseline="middle";
  const s1=fitText(g,title[0],W-90,B.s1);g.fillStyle=B.t1;g.fillText(title[0],W/2,title[1]?HEAD*0.42:HEAD/2);
  if(title[1]){const s2=fitText(g,title[1],W-110,B.s2,900),y2=HEAD*0.42+s1*0.55+s2*0.75;
    if(B.t2bg){const w=g.measureText(title[1]).width+36;g.fillStyle=B.t2bg;g.fillRect(W/2-w/2,y2-s2*0.68,w,s2*1.36);}
    g.fillStyle=B.t2;g.fillText(title[1],W/2,y2);}}
function drawMid(g,t,S){const {B,P,A,kw}=S;
  g.textAlign="center";g.textBaseline="middle";
  /* 가운데 사진: 장면마다 확대·축소·좌우·위아래로 움직이고, 바뀔 때 밀기·겹치기·원·위로 밀기·확대·블라인드 효과 */
  g.save();g.beginPath();g.rect(0,HEAD,W,BAND);g.clip();
  let k=P.scenes.findIndex((s,i)=>t>=s.t&&(i===P.scenes.length-1||t<P.scenes[i+1].t));if(k<0)k=0;
  const TR=0.5,am=[0.45,1,1.7][S.mo==null?1:S.mo];
  const sc=P.scenes[k],prev=P.scenes[k-1],p=Math.min(1,(t-sc.t)/Math.max(1,sc.d+TR)),tr=ease((t-sc.t)/TR);
  const draw=(s,pp,alpha,dx,dy,zx)=>{const im=A.photos[s.photo%A.photos.length],q=pp*pp*(3-2*pp)*0.35+pp*0.65;let z=1.06,px=0,py=0;
    switch(s.mv){case 0:z=1.04+0.16*am*q;break;case 1:z=1.04+0.16*am*(1-q);break;
      case 2:z=1.1+0.08*am;px=Math.min(1,am)*(-0.9+1.8*q);break;case 3:z=1.1+0.08*am;px=Math.min(1,am)*(0.9-1.8*q);break;
      case 4:z=1.12+0.08*am;py=Math.min(1,am)*(0.9-1.8*q);break;default:z=1.05+0.13*am*q;px=0.6*Math.min(1,am)*q;py=-0.5*Math.min(1,am)*q;}
    g.globalAlpha=alpha;cover(g,im,dx||0,HEAD+(dy||0),W,BAND,z*(zx||1),px,py);g.globalAlpha=1;};
  if(prev&&tr<1){const pp=Math.min(1,(t-prev.t)/Math.max(1,prev.d+TR));
    switch(sc.fx){
      case 0:draw(prev,pp,1,-W*tr);draw(sc,p,1,W*(1-tr));break;
      case 1:draw(prev,pp,1);draw(sc,p,tr);break;
      case 2:{draw(prev,pp,1);g.save();g.beginPath();g.arc(W/2,HEAD+BAND/2,Math.max(1,tr*W*0.8),0,7);g.clip();draw(sc,p,1);g.restore();break;}
      case 3:draw(prev,pp,1,0,-BAND*tr);draw(sc,p,1,0,BAND*(1-tr));break;
      case 4:draw(prev,pp,1,0,0,1+0.25*tr);draw(sc,p,tr,0,0,1.3-0.3*tr);break;
      default:{draw(prev,pp,1);g.save();g.beginPath();const n=7,bw=W/n;for(let i=0;i<n;i++)g.rect(i*bw,HEAD,bw*Math.min(1,Math.max(0,tr*1.6-i*0.09)),BAND);g.clip();draw(sc,p,1);g.restore();}}}
  else draw(sc,p,1);
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

/* 대본 한 줄 → 무료 사진 검색어(영어, 한 가지 뜻만). 사람이 나오는 주제는 asian을 붙여 우리 시청자에게 맞춤.
   업체 소개·위치·상담·진료 시간 문장은 업체 사진을 쓰도록 null */
const CO=/상담|예약|문의|전화|위치|찾아|오시|방문|내원|연락|출구|주차|토요일|평일|일요일|공휴일|점심시간|진료 ?시간|한의사|원장|대표 ?변호사|저희|우리 (한의원|병원|사무소)/;
const PPL=s=>"asian "+s;
const QW=[[/엑스레이|MRI|x-?ray/i,"x-ray"],[/교통사고|접촉사고|추돌/,"car accident"],[/운전|자동차|차량/,"driving car"],[/보험/,"insurance document"],
  [/거북목|목디스크|목이|목과|목 통증|뒷목|목,/,PPL("neck pain")],[/허리/,PPL("back pain")],[/어깨/,PPL("shoulder pain")],[/무릎/,PPL("knee pain")],[/손목/,PPL("wrist pain")],[/디스크|척추/,"spine x-ray"],[/근육|인대|뼈|뻣뻣|뭉치/,PPL("neck massage")],
  [/두통|머리가/,PPL("headache")],[/어지러|어지럼/,PPL("dizzy")],[/불면|잠을|수면|잠이/,PPL("insomnia")],[/피로|피곤|무기력|기운/,PPL("tired")],[/스트레스/,PPL("stress")],[/우울|불안/,PPL("worried woman")],
  [/소화|위장|속쓰림|더부룩/,PPL("stomach ache")],[/비염|코막힘|콧물|재채기/,PPL("runny nose")],[/기침|감기/,PPL("cough")],[/다이어트|체중|살이|살을/,"healthy diet"],[/피부|여드름/,PPL("skin care")],[/탈모/,"hair loss"],
  [/아이|어린이|성장|키가|자녀/,PPL("child")],[/수험생|학생|공부/,PPL("student studying")],[/직장인|사무실|업무/,PPL("office worker")],[/어르신|부모님|노인|할머니|할아버지/,PPL("senior")],[/산후|출산|임신/,PPL("pregnant")],[/갱년기|생리|여성/,PPL("woman")],
  [/사고/,"car crash"],
  [/약침|침 치료|침치료|침을|침,/,"acupuncture"],[/한약|탕약|약재/,"herbal medicine"],[/추나|교정|자세/,"posture"],[/뜸/,"moxibustion"],[/부항/,"cupping therapy"],[/물리치료|재활/,"physical therapy"],[/운동|스트레칭/,PPL("stretching")],[/걷기|산책/,"walking"],
  [/변호사|법률|법적/,"lawyer"],[/소송|재판|법원|판결/,"court"],[/이혼/,"divorce"],[/상속|유산/,"family"],[/계약|서류|합의|문서/,"contract signing"],[/사기|피해/,"fraud"],[/형사|경찰|고소|처벌/,"police"],
  [/진료|진단|검사|진찰/,PPL("doctor patient")],[/통증|아프|아픔|쑤시|결리|저리/,PPL("pain")],[/회복|좋아지|나아지|편안/,PPL("smile")],[/예방|관리|습관/,"healthy lifestyle"],[/치료/,"therapy"],
  [/시간|미루|방치|늦기|늦으|며칠/,"calendar"],[/비용|돈|금액/,"money"],[/방법|단계|순서/,"steps"],[/체크|확인|점검|상태/,"checklist"],[/주의|조심|위험|놓치/,"warning"]];
function queryOf(line){const s=String(line||"");if(CO.test(s))return null;for(const [re,en] of QW)if(re.test(s))return en;return null;}
/* 대본 전체 → 문장별 검색어. 업체 문장(업체 이름이 들어간 문장 포함)은 null, 맞는 말이 없으면 키워드 주제로 */
function sceneQueries(lines,name,kw){const short=String(name||"").replace(/\s/g,"").replace(/(한방병원|한의원|병원|의원|법률사무소|변호사)$/,"");
  const topic=queryOf(kw)||queryOf(lines.join(" "));
  return lines.map(l=>{const t=String(l||"");if(CO.test(t)||(short.length>1&&t.replace(/\s/g,"").includes(short)))return null;return queryOf(t)||topic||null;});}
/* 배경음악: 저작권 걱정 없게 코드로 직접 연주해서 만든다 (calm 잔잔하게 / bright 밝게), 또는 올린 음악 파일(ArrayBuffer) */
const hz=m=>440*Math.pow(2,(m-69)/12);
const PROG={calm:[[53,57,60,64],[48,55,60,64],[50,57,60,65],[46,53,58,62]],bright:[[48,55,60,64],[55,59,62,67],[57,60,64,69],[53,57,60,65]]};
async function synth(kind,sec,sr){const OC=window.OfflineAudioContext||window.webkitOfflineAudioContext,oc=new OC(2,Math.ceil(sr*sec),sr);
  const bright=kind==="bright",beat=60/(bright?100:72),bar=beat*4,out=oc.createGain();out.connect(oc.destination);
  const lp=oc.createBiquadFilter();lp.type="lowpass";lp.frequency.value=bright?1400:900;lp.connect(out);
  const tone=(m,t,d,v,type,to)=>{const o=oc.createOscillator(),g=oc.createGain();o.type=type;o.frequency.value=hz(m);
    g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(v,t+0.012);g.gain.exponentialRampToValueAtTime(0.0001,t+d);o.connect(g).connect(to||out);o.start(t);o.stop(t+d+0.05);};
  const key=(m,t,v)=>{tone(m,t,bright?0.7:1.8,v,"sine");tone(m+12,t,bright?0.35:0.9,v*0.3,"sine");tone(m,t,0.4,v*0.25,"triangle");};
  const pad=(ch,t,d)=>ch.forEach(m=>[-7,7].forEach(dt=>{const o=oc.createOscillator(),g=oc.createGain();o.type="sawtooth";o.frequency.value=hz(m);o.detune.value=dt;
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(bright?0.010:0.016,t+d*0.35);g.gain.linearRampToValueAtTime(0,t+d+0.35);o.connect(g).connect(lp);o.start(t);o.stop(t+d+0.4);}));
  let noise=null;if(bright){noise=oc.createBuffer(1,sr*0.2,sr);const c=noise.getChannelData(0);for(let i=0;i<c.length;i++)c[i]=Math.random()*2-1;}
  const hat=t=>{const n=oc.createBufferSource(),f=oc.createBiquadFilter(),g=oc.createGain();n.buffer=noise;f.type="highpass";f.frequency.value=7000;
    g.gain.setValueAtTime(0.05,t);g.gain.exponentialRampToValueAtTime(0.0001,t+0.06);n.connect(f).connect(g).connect(out);n.start(t);n.stop(t+0.1);};
  const kick=t=>{const o=oc.createOscillator(),g=oc.createGain();o.frequency.setValueAtTime(130,t);o.frequency.exponentialRampToValueAtTime(45,t+0.15);
    g.gain.setValueAtTime(0.5,t);g.gain.exponentialRampToValueAtTime(0.0001,t+0.25);o.connect(g).connect(out);o.start(t);o.stop(t+0.3);};
  const arp=bright?[0,2,1,3,2,1,3,2]:[0,1,2,3,2,1,2,3];
  for(let b=0,t=0.05;t<sec;b++,t+=bar){const ch=PROG[bright?"bright":"calm"][b%4];pad(ch,t,bar);tone(ch[0]-12,t,bar*0.95,0.14,"sine");
    arp.forEach((k,i)=>{const tt=t+i*beat/2;if(tt>=sec)return;if(bright||i%2===0||b%2)key(ch[k]+12,tt,(i%2?0.05:0.08)*(bright?0.8:1));});
    if(bright)for(let i=0;i<4;i++){const tt=t+i*beat;if(i%2===0)kick(tt);hat(tt+beat/2);}}
  return oc.startRendering();}
async function bgmBuffer(ac,spec,sec){if(!spec||spec==="none")return null;let buf;
  try{if(spec==="calm"||spec==="bright")buf=await synth(spec,sec,ac.sampleRate);
    else{const src=await ac.decodeAudioData(spec.slice(0)),n=Math.ceil(sec*ac.sampleRate);buf=ac.createBuffer(2,n,ac.sampleRate);
      for(let c=0;c<2;c++){const o=buf.getChannelData(c),i=src.getChannelData(Math.min(c,src.numberOfChannels-1));for(let k=0;k<n;k++)o[k]=i[k%i.length];}}}
  catch(e){return null;}
  /* 소리 크기 맞추기 + 앞뒤 부드럽게 */
  let ss=0,cnt=0;const d0=buf.getChannelData(0);for(let k=0;k<d0.length;k+=7){ss+=d0[k]*d0[k];cnt++;}
  const g=0.07/Math.max(1e-4,Math.sqrt(ss/Math.max(1,cnt))),sr=buf.sampleRate,fi=sr*1.0,fo=sr*2.0;
  for(let c=0;c<buf.numberOfChannels;c++){const d=buf.getChannelData(c),N=d.length;for(let k=0;k<N;k++){let v=d[k]*g;if(k<fi)v*=k/fi;if(N-k<fo)v*=(N-k)/fo;d[k]=Math.max(-0.9,Math.min(0.9,v));}}
  return buf;}
/* 목소리 나오는 동안 배경음악을 줄였다가, 끝 화면에서 다시 키움 */
function duck(gp,P,t0,voice){gp.setValueAtTime(1,t0);if(!voice||!P.lines.length)return;const a=P.lines[0].t,z=P.lines[P.lines.length-1];
  gp.setValueAtTime(1,t0+Math.max(0,a-0.3));gp.linearRampToValueAtTime(0.4,t0+a);gp.setValueAtTime(0.4,t0+z.t+z.d);gp.linearRampToValueAtTime(1,t0+z.t+z.d+0.6);}
/* o: {name, kw, lines[], audios[ArrayBuffer|null], canvas, base, seed, onProgress(p,msg)} → {blob,mime,ext,seconds} */
async function make(o){const B=brandOf(o.name);if(!B)throw new Error("영상 모양이 없는 업체예요.");
  const lines=o.lines.map(s=>s.trim()).filter(Boolean);if(!lines.length)throw new Error("대본이 비어 있어요.");
  const A=await prepare({brand:B,base:o.base,photos:o.photos,extra:o.extra,coPhotos:o.coPhotos});
  const ac=new (window.AudioContext||window.webkitAudioContext)();const bufs=[];
  for(const a of (o.audios||[])){try{bufs.push(a?await ac.decodeAudioData(a.slice(0)):null);}catch(e){bufs.push(null);}}
  /* 직접 녹음한 목소리 하나: 문장 길이 비율로 나눔 */
  let nar=null;if(o.narration){try{nar=await ac.decodeAudioData(o.narration.slice(0));}catch(e){throw new Error("녹음한 소리를 읽지 못했어요. 다시 녹음해 주세요.");}}
  const tl=lines.reduce((a,l)=>a+len(l),0)||1;
  const durs=lines.map((l,i)=>nar?nar.duration*len(l)/tl-0.001:bufs[i]?bufs[i].duration:Math.max(1.6,len(l)*0.19));
  const P=plan(lines,durs,{seed:o.seed,nPhotos:A.photos.length,nBrand:A.nBrand,nUp:A.nUp,own:A.own,gap:nar?0:bufs.some(Boolean)?0.22:0.15});
  const S={B,P,A,title:o.title||titleOf(lines[0]),kw:o.kw,mo:o.motion};
  const music=await bgmBuffer(ac,o.bgm,P.total);
  const cv=o.canvas||document.createElement("canvas");cv.width=W;cv.height=H;const g=cv.getContext("2d",{alpha:false});
  drawFrame(g,0,S);
  const mime=pickMime();if(!mime)throw new Error("이 브라우저는 영상 저장을 못 해요. 크롬이나 엣지로 열어 주세요.");
  const dest=ac.createMediaStreamDestination(),rf=!!(window.CanvasCaptureMediaStreamTrack&&CanvasCaptureMediaStreamTrack.prototype.requestFrame),vs=cv.captureStream(rf?0:FPS),vt=vs.getVideoTracks()[0],push=()=>{if(rf&&vt)vt.requestFrame();};
  const st=new MediaStream([...vs.getVideoTracks(),...dest.stream.getAudioTracks()]);
  const rec=new MediaRecorder(st,{mimeType:mime,videoBitsPerSecond:6e6,audioBitsPerSecond:128e3});const parts=[];
  rec.ondataavailable=e=>{if(e.data&&e.data.size)parts.push(e.data);};
  const done=new Promise(ok=>rec.onstop=ok);
  if(ac.state==="suspended")await ac.resume();
  /* 무음 하나를 깔아 두면 목소리가 없어도 소리 트랙이 생겨서 어디서나 재생됨 */
  const sil=ac.createConstantSource?ac.createConstantSource():null;if(sil){const gz=ac.createGain();gz.gain.value=0;sil.connect(gz).connect(dest);sil.start();}
  rec.start(500);const t0=ac.currentTime+0.05;
  if(nar){const n=ac.createBufferSource();n.buffer=nar;n.connect(dest);if(o.monitor)n.connect(ac.destination);n.start(t0+P.lines[0].t);}
  P.lines.forEach((s,i)=>{if(bufs[i]){const n=ac.createBufferSource();n.buffer=bufs[i];n.connect(dest);if(o.monitor)n.connect(ac.destination);n.start(t0+s.t);}});
  /* 배경음악: 목소리 나올 때는 작게 */
  if(music){const n=ac.createBufferSource(),gm=ac.createGain();n.buffer=music;duck(gm.gain,P,t0,bufs.some(Boolean)||!!nar);n.connect(gm).connect(dest);if(o.monitor)gm.connect(ac.destination);n.start(t0);}
  /* 30분의 1초마다 한 장: 다른 탭을 봐도 느려지지 않게 일꾼(Worker) 시계로 깨움 */
  const clock=ticker(1000/FPS);
  await new Promise(ok=>{let last=-1,lf=-1;clock.on(()=>{const t=ac.currentTime-t0;if(t>=P.total){ok();return;}
      if(t<0)return;const f=Math.floor(t*FPS);if(f===lf)return;lf=f;drawFrame(g,t,S);push();
      const p=Math.floor(t/P.total*100);if(p!==last){last=p;o.onProgress&&o.onProgress(p,t,P.total);}});});
  clock.stop();drawFrame(g,P.total-0.01,S);push();await new Promise(r=>setTimeout(r,250));push();rec.stop();await done;if(sil)sil.stop();ac.close();
  const blob=new Blob(parts,{type:mime.split(";")[0]});
  return {blob,mime,ext:mime.startsWith("video/mp4")?"mp4":"webm",seconds:P.total};}

function ticker(ms){let w=null,cb=null,id=null;
  try{const u=URL.createObjectURL(new Blob([`setInterval(()=>postMessage(0),${ms})`],{type:"text/javascript"}));w=new Worker(u);w.u=u;w.onmessage=()=>cb&&cb();}
  catch(e){w=null;id=setInterval(()=>cb&&cb(),ms);}
  return {on(f){cb=f;},stop(){cb=null;if(w){w.terminate();URL.revokeObjectURL(w.u);}if(id)clearInterval(id);}};}

/* 미리보기: 소리 없이 화면만 그려 봄 */
async function still(o){const B=brandOf(o.name);if(!B)return null;const A=await prepare({brand:B,base:o.base,photos:o.photos,extra:o.extra,coPhotos:o.coPhotos});
  const lines=o.lines.filter(Boolean),P=plan(lines,lines.map(l=>Math.max(1.6,len(l)*0.19)),{seed:o.seed,nPhotos:A.photos.length,nBrand:A.nBrand,nUp:A.nUp,own:A.own});
  const cv=o.canvas;cv.width=W;cv.height=H;drawFrame(cv.getContext("2d"),o.at==null?1.2:o.at*P.total,{B,P,A,title:o.title||titleOf(lines[0]),kw:o.kw,mo:o.motion});return P;}

root.ShortsMaker={make,still,brandOf,titleOf,BRAND,bgmBuffer,queryOf,sceneQueries};
})(window);
