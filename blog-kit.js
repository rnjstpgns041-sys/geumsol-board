/* 블로그 긴 이미지(네이버 블로그용, 화면 860px · 저장 가로 1080px) 만들기 도구.
   아이콘(직접 그린 선 아이콘) · 주제별 문구 · 구역 틀 · 이미지로 저장(SVG foreignObject → canvas) · ZIP 묶기.
   보내 준 '파주365한방병원 교통사고' 예시처럼: 큰 제목 + 아이콘 목록 + 카드 + 사진 + 의료진 + 시설 + 진료시간·오시는 길 */
(function(root){
"use strict";
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
/* [[강조]] 표시는 강조 색 글자로 */
const em=s=>esc(s).replace(/\[\[(.+?)\]\]/g,'<b class="ac">$1</b>');

/* ── 아이콘: 24칸 선 그림 ── */
const IC={
  user:'<circle cx="12" cy="7" r="3.5"/><path d="M5 21c0-4 3-7 7-7s7 3 7 7"/>',
  pain:'<circle cx="9" cy="4.5" r="2.3"/><path d="M9 7.5c-2 3-2 7 0 10M9 17.5l-2 4M9 17.5l3 4M9.5 10l4 2.5"/><path d="M16.5 7.5l3-1.5M17 11h3M16.5 14.5l3 1.5"/>',
  spine:'<rect x="9" y="2" width="6" height="3.2" rx="1.6"/><rect x="8.5" y="6.6" width="7" height="3.2" rx="1.6"/><rect x="8.5" y="11.2" width="7" height="3.2" rx="1.6"/><rect x="9" y="15.8" width="6" height="3.2" rx="1.6"/><path d="M12 19v3"/>',
  bed:'<path d="M3 19V8M3 15h18v4M21 19v-4M6 12.5h5V15"/><path d="M14 3.5h3l-3 3h3M18.5 1.5h2l-2 2h2"/>',
  head:'<path d="M8 21v-3.5C6 16.3 5 14.4 5 12a7 7 0 0 1 14 0l1.4 3H18v3h-3v3"/>',
  neck:'<path d="M8 3c0 3 1.5 5 4 5s4-2 4-5M9.5 8l-1 5M14.5 8l1 5M4 21c1-4.5 4-7 8-7s7 2.5 8 7"/><path d="M9 11.5c1 .8 5 .8 6 0" opacity=".6"/>',
  pelvis:'<path d="M4 6c2.5 0 3.5 2 4.5 4s3.5 2 3.5 2 2.5 0 3.5-2 2-4 4.5-4M5 6c-1 4 0 9 4 11M19 6c1 4 0 9-4 11"/><circle cx="12" cy="15.5" r="1.8"/>',
  leg:'<path d="M9 2v8l2.5 4v8M15 2v7.5L13 14"/><circle cx="12" cy="14" r="2"/>',
  car:'<path d="M3 16.5V12l2-5h14l2 5v4.5zM5 12h14"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>',
  shield:'<path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M7.5 14h2M11 14h2M14.5 14h2M7.5 17.5h2M11 17.5h2"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  clipboard:'<rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 2.5h6v3H9zM8 10.5l1.5 1.5 2.5-2.5M14 11h2.5M8 16l1.5 1.5L12 15M14 16.5h2.5"/>',
  doctor:'<circle cx="12" cy="6" r="3.2"/><path d="M5.5 21v-2.5c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5V21"/><path d="M9.5 13.5v3.2a1.8 1.8 0 0 0 3.6 0M15.5 14v3"/><circle cx="15.5" cy="18" r="1"/>',
  steth:'<path d="M6 3v5a4 4 0 0 0 8 0V3M10 12v3a4 4 0 0 0 8 0v-2"/><circle cx="18" cy="11" r="2"/>',
  needle:'<path d="M5 19l9-9M14 10l2.5-2.5M15.5 4.5l4 4M13.5 6.5l4 4"/><path d="M4 20h4" opacity=".6"/>',
  herb:'<path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14zM5 19l8.5-8.5"/>',
  posture:'<circle cx="12" cy="4" r="2"/><path d="M12 6.5V20M7 9h10M9 9l-3 6h6zM15 9l-3 6h6z"/>',
  bedplus:'<path d="M3 19V9M3 15h18v4M21 19v-4M6 12.5h5V15"/><path d="M17 3v6M14 6h6"/>',
  phone:'<path d="M5 3.5h3.5l2 5L8 10a11 11 0 0 0 6 6l1.5-2.5 5 2V19a2 2 0 0 1-2 2A16 16 0 0 1 3 5.5a2 2 0 0 1 2-2z"/>',
  utensils:'<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2.5 2-2.5 7 0 8.5V21"/>',
  pin:'<path d="M12 21s-7-6-7-12a7 7 0 0 1 14 0c0 6-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  train:'<rect x="6" y="3" width="12" height="13" rx="3"/><path d="M6 10h12M8.5 20L7 22M15.5 20l1.5 2"/><circle cx="9" cy="13" r=".8"/><circle cx="15" cy="13" r=".8"/>',
  parking:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9.5 17V7h3.5a3 3 0 0 1 0 6H9.5"/>',
  alert:'<circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.3v.4"/>',
  smile:'<circle cx="12" cy="12" r="9"/><path d="M8 14c1 2 2.4 3 4 3s3-1 4-3M9 9.5v.6M15 9.5v.6"/>',
  child:'<circle cx="12" cy="5" r="2.6"/><path d="M12 8v7M8 10.5h8M12 15l-3 6M12 15l3 6"/>',
  woman:'<circle cx="12" cy="7" r="4"/><path d="M12 11v10M8.5 17h7"/>',
  stomach:'<path d="M9 3v4c0 2-4 3-4 8 0 4 3 6 7 6s7-2 7-5-3-4-5-4-3 1-3-2V3"/>',
  nose:'<path d="M12 3v8c0 2-3 3-3 6a3 3 0 0 0 6 0M8 19.5c-2 0-3-1-3-2.5M16 19.5c2 0 3-1 3-2.5"/>',
  scale:'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 10a5 5 0 0 1 8 0M12 10l1.5-2"/>',
  sparkle:'<path d="M11 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2zM18.5 14.5l1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/>',
  heart:'<path d="M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.6A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z"/>',
  xray:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M12 6v12M9 8.5h6M8 11.5h8M9 14.5h6"/>',
  brain:'<path d="M11 4a3 3 0 0 0-3 2.5A3 3 0 0 0 5.5 11a3 3 0 0 0 1 5A3 3 0 0 0 11 20zM13 4a3 3 0 0 1 3 2.5 3 3 0 0 1 2.5 4.5 3 3 0 0 1-1 5A3 3 0 0 1 13 20z"/>',
  check:'<path d="M5 12.5l4.5 4.5L19 7"/>',
  hospital:'<rect x="4" y="6" width="16" height="15" rx="1"/><path d="M9.5 21v-4h5v4M12 9v4.5M9.8 11.2h4.4M8 3h8v3"/>',
  users:'<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5M15.5 14.8c3 0 5.5 1.5 5.5 4.5"/>',
  tv:'<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/>',
  wind:'<path d="M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h8"/>',
  drop:'<path d="M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z"/>',
  chat:'<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/>',
  hand:'<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11M11 11V4.5a1.5 1.5 0 0 1 3 0V11M14 11V6a1.5 1.5 0 0 1 3 0v8c0 4-3 7-7 7-3 0-5-2-6-4l-2-4a1.5 1.5 0 0 1 2.5-1.5L8 13"/><path d="M19.5 3l1.5-1M20 6.5h2"/>',
  fire:'<path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-3 2-4 2-6 1 1 2 2 3 2 0-2-1-4 0-6z"/>',
  iv:'<path d="M10 3h4M12 3v3M8 6h8v9a4 4 0 0 1-8 0zM12 19v3M8 10h8"/>',
  walk:'<circle cx="13" cy="4" r="2"/><path d="M10 21l2-6 3 3v4M8 12l3-4 4 1 3 3M12 15l-1-4"/>',
  wave:'<path d="M3 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0"/><path d="M3 17c2-3 4-3 6 0s4 3 6 0 4-3 6 0" opacity=".6"/>',
  pill:'<rect x="3" y="8.5" width="18" height="7" rx="3.5" transform="rotate(-35 12 12)"/><path d="M10 8.5l4.5 6.5"/>',
  baby:'<circle cx="12" cy="9" r="5"/><path d="M10 8.5v.5M14 8.5v.5M10.5 11c.8.6 2.2.6 3 0M7 20c1-3 3-4 5-4s4 1 5 4"/>',
  bone:'<path d="M8 8l8 8M6.5 9.5a2 2 0 1 1-1-3 2 2 0 1 1 3-1zM17.5 14.5a2 2 0 1 1 1 3 2 2 0 1 1-3 1z"/>',
  crash:'<path d="M2 16v-3l1.5-3.5h7l1.5 3.5v3zM13 16v-3l1.5-3.5h7"/><circle cx="5" cy="16.5" r="1.5"/><circle cx="9.5" cy="16.5" r="1.5"/><circle cx="17" cy="16.5" r="1.5"/><path d="M12 3l.8 2.4 2.4-.8-1 2.3 2.2 1.1" opacity=".8"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  star:'<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>'
};
const icon=(n,cls)=>`<svg class="${cls||"ic"}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${IC[n]||IC.check}</svg>`;
/* 큰 그림: 큰 아이콘 + 강조 색 배지 */
const art=(n,badge)=>`<div class="art">${icon(n,"artic")}${badge?`<div class="artb">${icon(badge,"ic")}</div>`:""}</div>`;

/* ── 주제별 문구. 의료광고법: 최고·완치·후기·보장 같은 말 쓰지 않음. 업체마다 다른 사실(입원실, 365일 등)은 업체 정보에서만 ── */
const KM_ROWS={
  doctor:['doctor','진료·상담','원인·[[상태]] 확인','asian doctor consultation'],
  needle:['needle','침·약침 치료','통증 부위에 [[맞춰]] 진행','acupuncture'],
  chuna:['posture','추나·자세 교정','[[균형·움직임]] 관리','chiropractic'],
  herb:['herb','한약 처방','체질과 [[상태]]에 맞춰','herbal medicine'],
  cup:['drop','부항·뜸','[[순환]] 관리','cupping therapy'],
  rehab:['bedplus','입원·재활 관리','회복을 위한 [[집중 관리]]','hospital room'],
  heat:['fire','온열 치료','몸을 [[따뜻하게]]','warm therapy'],
};
const WM_ROWS={
  scan:['xray','영상 검사','[[상태]] 먼저 확인','x-ray doctor'],
  manual:['hand','도수치료','[[움직임]] 회복 관리','physical therapy'],
  shock:['wave','체외충격파','[[통증 부위]] 관리','physiotherapy'],
  inject:['pill','주사·약물 치료','증상에 [[맞춰]] 진료','doctor injection'],
  rehab:['walk','운동·재활','[[재발]] 관리','rehabilitation exercise'],
};
const T={
  "교통사고":{re:/교통사고|사고|후유증|자동차보험/,
    hero:{t:["초기 대응이","[[중요]]해요"],art:"clipboard",items:[["pain","반복되는 통증"],["spine","목·허리 움직임 불편"],["bed","수면·일상에 영향"]]},
    warn:{t:["외상 없어도","[[후유증]]은 주의"],sub:"겉으로 보이지 않는 통증도 살펴보세요.",cards:[["head","머리","두통·어지럼"],["neck","목·어깨","뻣뻣함·결림"],["pelvis","허리·골반","묵직함·찌릿함"],["leg","팔·다리","저림·감각 이상"]],art:["car","shield"]},
    list:{t:["반복되는 통증","[[미루지 마세요]]"],art:"calendar",items:[["pain","반복되는 통증"],["bed","수면 불편·피로"],["spine","움직임·집중력 저하"],["head","두통·어지럼"],["hand","팔·다리 저림"]],note:"증상이 이어지면 진료로 확인하세요."},
    person:{t:["사고 후 통증","[[늦게 나타날 수]] 있어요"],sub:"며칠 뒤 불편함이 나타날 수 있습니다.",q:"man holding neck pain",sym:[["head","두통·어지럼"],["neck","목 통증"],["pain","어깨 통증"],["spine","허리 통증"]]},
    clinic:{title:"교통사고 [[클리닉]]",feats:[["shield","자동차[[보험 진료]]"],["doctor","[[원인별]] 진료"],["clipboard","상태별 [[맞춤 치료]]"],["chat","[[1:1]] 상담"]]},
    time:{t:["시간차로 나타나는","[[사고 후]] 통증"],steps:[["사고 직후","alert","증상을 놓칠 수 있어요","crash"],["며칠 뒤","pain","목·어깨·허리 통증","user"],["이후","head","두통·저림·결림","clock"]],note:"증상과 시기는 개인마다 다를 수 있습니다."},
    treat:{t:["상태별","[[맞춤 치료]]"],km:["doctor","needle","chuna","rehab"],wm:["scan","manual","shock","inject"],note:"치료는 진료 후 결정됩니다."}},
  "허리":{re:/허리|디스크|요통|척추|협착/,
    hero:{t:["허리 통증","[[신호]]를 보세요"],art:"spine",items:[["pain","앉았다 일어날 때 통증"],["leg","다리까지 저림"],["bed","아침에 뻣뻣함"]]},
    warn:{t:["오래 앉아 있으면","[[허리]]가 먼저 지쳐요"],sub:"생활 습관이 통증으로 이어지기도 해요.",cards:[["spine","허리","묵직함·뻐근함"],["pelvis","골반","틀어짐·불균형"],["leg","엉덩이·다리","저림·당김"],["walk","걸음","오래 걷기 힘듦"]],art:["spine","alert"]},
    list:{t:["이런 증상이면","[[확인]]해 보세요"],art:"clipboard",items:[["pain","허리를 숙이기 힘들어요"],["leg","다리가 저리고 당겨요"],["bed","누워도 편하지 않아요"],["walk","오래 걷기 어려워요"],["spine","통증이 자주 반복돼요"]],note:"증상이 이어지면 진료로 확인하세요."},
    person:{t:["허리 통증","[[참지 마세요]]"],sub:"작은 불편함이 오래 갈 수 있어요.",q:"man holding lower back pain",sym:[["spine","허리 통증"],["pelvis","골반 불편"],["leg","다리 저림"],["bed","수면 불편"]]},
    clinic:{title:"허리 통증 [[클리닉]]",feats:[["clipboard","[[원인별]] 진료"],["posture","자세·[[균형]] 관리"],["doctor","상태별 [[맞춤 치료]]"],["chat","[[1:1]] 상담"]]},
    time:{t:["통증이","[[반복되는 이유]]"],steps:[["처음","alert","가끔 뻐근해요","user"],["반복","pain","자주 아프고 결려요","spine"],["오래되면","leg","저림·움직임 불편","clock"]],note:"증상은 개인마다 다를 수 있습니다."},
    treat:{t:["상태별","[[맞춤 치료]]"],km:["doctor","needle","chuna","herb"],wm:["scan","manual","shock","rehab"],note:"치료는 진료 후 결정됩니다."}},
  "목":{re:/목|어깨|거북목|일자목|오십견|담/,
    hero:{t:["목·어깨 결림","[[그냥 두지 마세요]]"],art:"neck",items:[["neck","목이 뻣뻣하고 무거워요"],["pain","어깨가 자주 결려요"],["head","두통이 함께 와요"]]},
    warn:{t:["고개 숙인 자세가","[[목]]을 힘들게 해요"],sub:"스마트폰·컴퓨터 사용이 길다면 살펴보세요.",cards:[["neck","목","뻣뻣함·통증"],["pain","어깨","결림·뭉침"],["head","머리","두통·무거움"],["hand","팔·손","저림·힘 빠짐"]],art:["neck","alert"]},
    list:{t:["이런 증상","[[있으신가요]]"],art:"clipboard",items:[["neck","고개 돌리기 불편"],["pain","어깨가 늘 뭉쳐 있음"],["head","오후마다 두통"],["hand","팔·손 저림"],["bed","자고 나도 개운하지 않음"]],note:"증상이 이어지면 진료로 확인하세요."},
    person:{t:["목·어깨 통증","[[자세]]부터 살펴요"],sub:"생활 습관과 함께 확인해요.",q:"woman holding neck pain",sym:[["neck","목 통증"],["pain","어깨 결림"],["head","두통"],["hand","팔 저림"]]},
    clinic:{title:"목·어깨 [[클리닉]]",feats:[["clipboard","[[원인별]] 진료"],["posture","자세·[[체형]] 관리"],["doctor","상태별 [[맞춤 치료]]"],["chat","[[1:1]] 상담"]]},
    time:{t:["통증이","[[쌓이는 과정]]"],steps:[["처음","alert","잠깐 뻐근해요","user"],["반복","neck","목·어깨 결림","neck"],["오래되면","head","두통·저림","clock"]],note:"증상은 개인마다 다를 수 있습니다."},
    treat:{t:["상태별","[[맞춤 치료]]"],km:["doctor","needle","chuna","cup"],wm:["scan","manual","shock","inject"],note:"치료는 진료 후 결정됩니다."}},
  "관절":{re:/관절|무릎|발목|손목|팔꿈치|퇴행/,
    hero:{t:["관절 통증","[[미리]] 살펴요"],art:"bone",items:[["leg","계단에서 무릎 통증"],["walk","오래 걷기 힘듦"],["hand","손목·손가락 불편"]]},
    warn:{t:["쓰는 만큼","[[관절]]도 지쳐요"],sub:"작은 불편함부터 확인해 보세요.",cards:[["leg","무릎","시큰함·붓기"],["pelvis","고관절","뻐근함"],["hand","손목","찌릿함"],["walk","발목","삐끗함"]],art:["bone","shield"]},
    list:{t:["이럴 때는","[[확인]]해 보세요"],art:"clipboard",items:[["leg","앉았다 일어날 때 통증"],["walk","계단 오르내리기 힘듦"],["drop","관절이 붓고 열감"],["hand","손이 뻣뻣함"],["bed","밤에 쑤시는 느낌"]],note:"증상이 이어지면 진료로 확인하세요."},
    person:{t:["관절 통증","[[생활]]을 바꿔요"],sub:"움직임이 줄면 일상도 불편해져요.",q:"senior holding knee pain",sym:[["leg","무릎 통증"],["walk","걷기 불편"],["hand","손목 통증"],["drop","붓기"]]},
    clinic:{title:"관절 통증 [[클리닉]]",feats:[["clipboard","[[원인별]] 진료"],["walk","움직임 [[회복]] 관리"],["doctor","상태별 [[맞춤 치료]]"],["chat","[[1:1]] 상담"]]},
    time:{t:["관절 통증이","[[커지는 과정]]"],steps:[["처음","alert","가끔 시큰해요","user"],["반복","leg","붓고 쑤셔요","bone"],["오래되면","walk","움직임 불편","clock"]],note:"증상은 개인마다 다를 수 있습니다."},
    treat:{t:["상태별","[[맞춤 치료]]"],km:["doctor","needle","herb","heat"],wm:["scan","manual","shock","inject"],note:"치료는 진료 후 결정됩니다."}},
  "두통":{re:/두통|어지럼|편두통|이명/,
    hero:{t:["잦은 두통","[[원인]]을 찾아요"],art:"head",items:[["head","머리가 자주 아파요"],["alert","어지럼이 함께 와요"],["bed","잠을 설쳐요"]]},
    warn:{t:["두통 뒤에","[[숨은 원인]]이 있어요"],sub:"생활 습관과 몸 상태를 함께 살펴요.",cards:[["neck","목·어깨","긴장·결림"],["bed","수면","부족·뒤척임"],["brain","스트레스","예민함"],["stomach","소화","더부룩함"]],art:["brain","alert"]},
    list:{t:["이런 두통","[[있으신가요]]"],art:"clipboard",items:[["head","오후마다 지끈거림"],["neck","목이 뻣뻣하며 두통"],["alert","어지럼·메스꺼움"],["bed","자고 나도 무거움"],["brain","신경 쓰면 심해짐"]],note:"증상이 이어지면 진료로 확인하세요."},
    person:{t:["두통","[[참기만]] 하지 마세요"],sub:"반복되면 몸이 보내는 신호일 수 있어요.",q:"woman headache holding head",sym:[["head","두통"],["alert","어지럼"],["neck","목 결림"],["bed","수면 불편"]]},
    clinic:{title:"두통·어지럼 [[클리닉]]",feats:[["clipboard","[[원인별]] 진료"],["brain","몸 상태 [[함께]] 확인"],["doctor","상태별 [[맞춤 치료]]"],["chat","[[1:1]] 상담"]]},
    time:{t:["두통이","[[반복되는 흐름]]"],steps:[["처음","alert","가끔 지끈거려요","user"],["반복","head","자주 아프고 무거워요","head"],["오래되면","bed","잠·집중이 힘들어요","clock"]],note:"증상은 개인마다 다를 수 있습니다."},
    treat:{t:["상태별","[[맞춤 치료]]"],km:["doctor","needle","herb","chuna"],wm:["scan","inject","manual","rehab"],note:"치료는 진료 후 결정됩니다."}},
  "다이어트":{re:/다이어트|체중|비만|살|감량/,
    hero:{t:["다이어트","[[방법]]이 중요해요"],art:"scale",items:[["scale","굶어도 빠지지 않아요"],["alert","자주 요요가 와요"],["stomach","식욕 조절이 힘들어요"]]},
    warn:{t:["무리한 다이어트","[[몸]]이 먼저 지쳐요"],sub:"내 몸 상태에 맞춘 방법을 찾아요.",cards:[["stomach","식습관","폭식·야식"],["bed","수면","부족·피로"],["walk","활동량","운동 부족"],["drop","순환","붓기·냉증"]],art:["scale","heart"]},
    list:{t:["이런 분께","[[필요해요]]"],art:"clipboard",items:[["scale","체중이 잘 줄지 않는 분"],["alert","요요를 겪은 분"],["drop","잘 붓는 분"],["stomach","식욕 조절이 힘든 분"],["bed","피곤이 쌓인 분"]],note:"체질과 상태에 따라 방법이 달라져요."},
    person:{t:["내 몸에 맞춘","[[다이어트]]"],sub:"생활 습관부터 함께 살펴요.",q:"woman measuring waist tape",sym:[["scale","체중 관리"],["stomach","식습관"],["drop","붓기"],["bed","수면"]]},
    clinic:{title:"다이어트 [[클리닉]]",feats:[["clipboard","[[체질]] 확인"],["herb","맞춤 [[한약]] 상담"],["chat","식습관 [[상담]]"],["calendar","[[꾸준한]] 관리"]]},
    time:{t:["다이어트","[[관리 흐름]]"],steps:[["상담","chat","몸 상태·습관 확인","clipboard"],["관리","herb","맞춤 방법으로 관리","scale"],["유지","calendar","습관 만들기","clock"]],note:"결과는 개인마다 다를 수 있습니다."},
    treat:{t:["맞춤","[[관리 방법]]"],km:["doctor","herb","needle","cup"],wm:["scan","inject","rehab","manual"],note:"관리 방법은 진료 후 결정됩니다."}},
  "비염":{re:/비염|코|축농증|알레르기/,
    hero:{t:["반복되는 비염","[[관리]]가 필요해요"],art:"nose",items:[["nose","코막힘·콧물"],["alert","재채기가 잦아요"],["bed","잠을 설쳐요"]]},
    warn:{t:["코만의 문제가","[[아닐 수]] 있어요"],sub:"몸 상태와 환경을 함께 살펴요.",cards:[["nose","코","막힘·콧물"],["head","머리","두통·멍함"],["bed","수면","코골이·뒤척임"],["wind","환경","먼지·온도 변화"]],art:["nose","shield"]},
    list:{t:["이런 증상","[[있으신가요]]"],art:"clipboard",items:[["nose","아침마다 재채기"],["drop","맑은 콧물이 계속"],["head","머리가 멍해요"],["bed","입으로 숨 쉬며 자요"],["wind","계절마다 심해져요"]],note:"증상이 이어지면 진료로 확인하세요."},
    person:{t:["비염","[[미루지]] 마세요"],sub:"일상과 잠을 불편하게 만들 수 있어요.",q:"woman blowing nose tissue",sym:[["nose","코막힘"],["drop","콧물"],["head","두통"],["bed","수면 불편"]]},
    clinic:{title:"비염 [[클리닉]]",feats:[["clipboard","[[원인별]] 진료"],["shield","[[면역]] 관리 상담"],["doctor","상태별 [[맞춤 치료]]"],["chat","[[1:1]] 상담"]]},
    time:{t:["비염이","[[심해지는 흐름]]"],steps:[["처음","alert","가끔 코가 막혀요","user"],["반복","nose","콧물·재채기가 잦아요","nose"],["오래되면","bed","잠·집중이 힘들어요","clock"]],note:"증상은 개인마다 다를 수 있습니다."},
    treat:{t:["상태별","[[맞춤 치료]]"],km:["doctor","herb","needle","heat"],wm:["scan","inject","rehab","manual"],note:"치료는 진료 후 결정됩니다."}},
  "성장":{re:/성장|키|성조숙/,
    hero:{t:["우리 아이 성장","[[때]]를 놓치지 마세요"],art:"child",items:[["child","또래보다 작은 키"],["stomach","편식·잦은 배탈"],["bed","잠이 부족해요"]]},
    warn:{t:["성장에는","[[생활 습관]]이 중요해요"],sub:"잠·식사·운동을 함께 살펴요.",cards:[["bed","수면","늦게 자요"],["stomach","식사","편식·소화"],["walk","운동","활동 부족"],["brain","스트레스","예민함"]],art:["child","star"]},
    list:{t:["이럴 때","[[확인]]해 보세요"],art:"clipboard",items:[["child","1년에 4cm 미만 자라요"],["alert","사춘기가 빠른 것 같아요"],["stomach","잘 안 먹어요"],["bed","자주 깨요"],["nose","비염·감기가 잦아요"]],note:"성장 상태는 진료로 확인하세요."},
    person:{t:["아이 성장","[[함께]] 살펴요"],sub:"지금 상태를 아는 것부터 시작해요.",q:"child measuring height wall",sym:[["child","키 성장"],["stomach","식습관"],["bed","수면"],["walk","운동"]]},
    clinic:{title:"성장 [[클리닉]]",feats:[["clipboard","성장 [[상태]] 확인"],["chat","생활 습관 [[상담]]"],["doctor","아이별 [[맞춤 관리]]"],["calendar","[[꾸준한]] 확인"]]},
    time:{t:["성장 관리","[[흐름]]"],steps:[["확인","clipboard","현재 성장 상태","child"],["관리","chat","생활 습관·맞춤 관리","calendar"],["점검","calendar","꾸준히 다시 확인","clock"]],note:"성장 속도는 아이마다 다를 수 있습니다."},
    treat:{t:["아이별","[[맞춤 관리]]"],km:["doctor","herb","needle","heat"],wm:["scan","inject","rehab","manual"],note:"관리 방법은 진료 후 결정됩니다."}},
  "여성":{re:/산후|갱년기|생리|여성|임신|난임/,
    hero:{t:["여성 건강","[[내 몸]]을 살펴요"],art:"woman",items:[["woman","몸이 예전 같지 않아요"],["fire","열이 오르내려요"],["bed","잠을 설쳐요"]]},
    warn:{t:["변화하는 몸","[[신호]]를 들어 보세요"],sub:"시기마다 필요한 관리가 달라요.",cards:[["fire","열감","화끈거림"],["bed","수면","뒤척임"],["brain","기분","예민함·우울"],["drop","순환","붓기·냉증"]],art:["woman","heart"]},
    list:{t:["이런 증상","[[있으신가요]]"],art:"clipboard",items:[["fire","얼굴로 열이 올라요"],["bed","밤에 자주 깨요"],["brain","기분 변화가 커요"],["drop","손발이 차고 붓기"],["pain","관절이 쑤셔요"]],note:"증상이 이어지면 진료로 확인하세요."},
    person:{t:["여성 건강","[[시기별]]로 챙겨요"],sub:"몸 상태에 맞춘 관리가 필요해요.",q:"woman stomach pain holding",sym:[["fire","열감"],["bed","수면"],["brain","기분 변화"],["drop","순환"]]},
    clinic:{title:"여성 건강 [[클리닉]]",feats:[["clipboard","몸 상태 [[확인]]"],["herb","맞춤 [[한약]] 상담"],["doctor","시기별 [[맞춤 관리]]"],["chat","[[1:1]] 상담"]]},
    time:{t:["몸의 변화","[[살펴보기]]"],steps:[["확인","clipboard","지금 몸 상태","woman"],["관리","herb","시기에 맞춘 관리","heart"],["점검","calendar","꾸준히 다시 확인","clock"]],note:"증상은 개인마다 다를 수 있습니다."},
    treat:{t:["시기별","[[맞춤 관리]]"],km:["doctor","herb","needle","heat"],wm:["scan","inject","rehab","manual"],note:"관리 방법은 진료 후 결정됩니다."}},
  "요양":{re:/암|요양|항암|면역|재활|뇌졸중|입원/,
    hero:{t:["회복의 시간","[[편안하게]]"],art:"heart",items:[["bedplus","치료 후 회복 관리"],["shield","면역 관리"],["users","보호자 걱정 덜기"]]},
    warn:{t:["치료 뒤","[[회복 관리]]가 중요해요"],sub:"몸과 마음을 함께 살펴요.",cards:[["bed","휴식","편안한 병실"],["stomach","식사","균형 잡힌 식단"],["walk","활동","재활·운동"],["heart","마음","정서 돌봄"]],art:["hospital","heart"]},
    list:{t:["이런 분께","[[필요해요]]"],art:"clipboard",items:[["bedplus","수술·항암 뒤 회복이 필요한 분"],["shield","면역 관리가 필요한 분"],["walk","재활이 필요한 분"],["users","돌봄이 걱정되는 가족"],["stomach","식사가 힘든 분"]],note:"입원 여부는 상담 후 결정됩니다."},
    person:{t:["회복의 시간","[[함께]] 해요"],sub:"내 몸 상태에 맞춘 관리를 받아 보세요.",q:"senior patient nurse hospital",sym:[["bedplus","회복 관리"],["shield","면역 관리"],["walk","재활"],["heart","정서 돌봄"]]},
    clinic:{title:"회복 [[관리]]",feats:[["clipboard","[[상태별]] 관리 계획"],["users","[[의료진]] 상주 여부 확인"],["walk","재활·[[운동]] 관리"],["chat","[[입원]] 상담"]]},
    time:{t:["회복 관리","[[흐름]]"],steps:[["상담","chat","몸 상태·치료 일정 확인","clipboard"],["관리","bedplus","맞춤 회복 관리","hospital"],["일상으로","walk","다시 일상 준비","clock"]],note:"관리 계획은 개인마다 다를 수 있습니다."},
    treat:{t:["회복을 돕는","[[관리]]"],km:["doctor","heat","herb","rehab"],wm:["scan","iv","rehab","manual"],note:"관리 방법은 진료 후 결정됩니다."}},
  "피부":{re:/피부|여드름|아토피|습진|두드러기/,
    hero:{t:["반복되는 피부 고민","[[속]]부터 살펴요"],art:"sparkle",items:[["sparkle","올라오는 트러블"],["drop","가려움·건조함"],["bed","잠을 설쳐요"]]},
    warn:{t:["피부는","[[몸 상태]]를 보여 줘요"],sub:"생활 습관과 몸 상태를 함께 살펴요.",cards:[["stomach","소화","더부룩함"],["bed","수면","부족·뒤척임"],["brain","스트레스","예민함"],["drop","순환","열감·건조"]],art:["sparkle","shield"]},
    list:{t:["이런 고민","[[있으신가요]]"],art:"clipboard",items:[["sparkle","같은 자리에 반복돼요"],["drop","가렵고 건조해요"],["fire","열이 오르며 붉어요"],["bed","가려워 잠을 설쳐요"],["brain","스트레스 받으면 심해요"]],note:"증상이 이어지면 진료로 확인하세요."},
    person:{t:["피부 고민","[[원인]]을 찾아요"],sub:"겉과 속을 함께 살펴요.",q:"woman touching face skin",sym:[["sparkle","트러블"],["drop","가려움"],["fire","열감"],["bed","수면"]]},
    clinic:{title:"피부 [[클리닉]]",feats:[["clipboard","[[원인별]] 진료"],["herb","맞춤 [[한약]] 상담"],["doctor","상태별 [[맞춤 치료]]"],["chat","[[1:1]] 상담"]]},
    time:{t:["피부 고민이","[[반복되는 흐름]]"],steps:[["처음","alert","가끔 올라와요","user"],["반복","sparkle","같은 자리에 반복","sparkle"],["오래되면","bed","가려움·수면 불편","clock"]],note:"증상은 개인마다 다를 수 있습니다."},
    treat:{t:["상태별","[[맞춤 치료]]"],km:["doctor","herb","needle","cup"],wm:["scan","inject","rehab","manual"],note:"치료는 진료 후 결정됩니다."}}
};
T["기본"]={re:/./,
  hero:{t:["몸이 보내는 신호","[[놓치지]] 마세요"],art:"clipboard",items:[["pain","반복되는 불편함"],["bed","수면·피로"],["alert","일상에 영향"]]},
  warn:{t:["작은 불편함도","[[살펴보세요]]"],sub:"원인을 알면 관리가 쉬워져요.",cards:[["head","머리","두통·어지럼"],["neck","목·어깨","결림"],["spine","허리","뻐근함"],["leg","팔·다리","저림"]],art:["shield","check"]},
  list:{t:["이런 증상","[[있으신가요]]"],art:"calendar",items:[["pain","통증이 자주 반복돼요"],["bed","자고 나도 피곤해요"],["head","머리가 무거워요"],["stomach","소화가 불편해요"],["brain","스트레스가 많아요"]],note:"증상이 이어지면 진료로 확인하세요."},
  person:{t:["불편함","[[미루지]] 마세요"],sub:"지금 상태를 아는 것부터 시작해요.",q:"doctor consultation patient",sym:[["pain","통증"],["bed","피로"],["head","두통"],["stomach","소화"]]},
  clinic:{title:"[[진료]] 안내",feats:[["clipboard","[[원인별]] 진료"],["doctor","상태별 [[맞춤 치료]]"],["chat","[[1:1]] 상담"],["calendar","[[꾸준한]] 관리"]]},
  time:{t:["진료","[[흐름]]"],steps:[["상담","chat","불편한 점 듣기","clipboard"],["진료","doctor","상태 확인","doctor"],["관리","calendar","맞춤 관리","clock"]],note:"진료 내용은 개인마다 다를 수 있습니다."},
  treat:{t:["상태별","[[맞춤 치료]]"],km:["doctor","needle","chuna","herb"],wm:["scan","manual","shock","inject"],note:"치료는 진료 후 결정됩니다."}};
/* 키워드·업체 진료 주제로 문구 묶음 고르기 */
function topicOf(kw,topics){const s=String(kw||"");for(const k of Object.keys(T))if(k!=="기본"&&T[k].re.test(s))return k;
  for(const t of (topics||[]))for(const k of Object.keys(T))if(k!=="기본"&&T[k].re.test(t))return k;return "기본";}

/* ── 구역 그리기. ed = 글 고칠 수 있게(contenteditable) ── */
const E='contenteditable="true" spellcheck="false"';
const tx=(s,cls)=>`<span class="${cls||""}" ${E}>${em(s)}</span>`;
const ph=(key,src,cls)=>`<div class="ph ${cls||""}" data-ph="${esc(key)}">${src?`<img src="${esc(src)}" alt="">`:`<div class="phe">사진 넣기</div>`}</div>`;
const H=(t,cls)=>`<div class="h ${cls||""}"><i class="bar"></i><div class="t1" ${E}>${em(t[0])}</div><div class="t2" ${E}>${em(t[1]||"")}</div></div>`;
const logo=c=>c.logo?`<img class="logo" src="${esc(c.logo)}" alt="">`:`<div class="logot" ${E}>${esc(c.name)}</div>`;

/* 홈페이지에서 읽은 진료 항목 → 치료 줄 [아이콘, 이름, 설명, 사진 검색어] */
const TMAP=[[/순환|부항|뜸/,"drop","[[순환]] 관리","cupping therapy"],[/약침|침 ?치료|^침|전침/,"needle","통증 부위에 [[맞춰]] 진행","acupuncture"],[/추나|교정|도수/,"posture","[[균형·움직임]] 관리","chiropractic"],[/한약|탕약|보약|공진단|경옥고/,"herb","체질과 [[상태]]에 맞춰","herbal medicine"],
  [/부항|뜸/,"drop","[[순환]] 관리","cupping therapy"],[/입원|재활/,"bedplus","회복을 위한 [[집중 관리]]","hospital room"],[/물리|온열|고주파|레이저|충격파/,"wave","[[통증 부위]] 관리","physiotherapy"],
  [/검사|엑스|x-?ray|MRI|초음파/i,"xray","[[상태]] 먼저 확인","x-ray doctor"],[/주사|약물|수액/,"pill","증상에 [[맞춰]] 진료","doctor injection"],[/다이어트|비만|체중/,"scale","[[생활 습관]]까지 함께","healthy diet food"],
  [/피부|여드름|아토피/,"sparkle","[[피부 상태]]에 맞춰","skin care"],[/성장|키/,"child","[[성장 단계]]에 맞춰","child growth"],[/비염|호흡|코/,"nose","[[호흡]] 편하게","nose breathing"],
  [/여성|산후|갱년기|난임/,"woman","[[여성 건강]] 관리","asian woman health"],[/운동|필라테스/,"walk","[[재발]] 관리","rehabilitation exercise"],[/상담|진료|진단/,"doctor","원인·[[상태]] 확인","asian doctor consultation"]];
function treatRows(p,c){const own=(c.treats||[]).map(x=>String(x||"").trim()).filter(Boolean);
  if(own.length>=2)return own.slice(0,4).map(t=>{const m=TMAP.find(x=>x[0].test(t))||[0,"check","증상에 [[맞춰]] 진행","korean medicine clinic"];return [m[1],t,m[2],m[3]];});
  return (c.km?p.treat.km.map(k=>KM_ROWS[k]):p.treat.wm.map(k=>WM_ROWS[k])).filter(Boolean);}
function featIcon(t){return /보험/.test(t)?"shield":/입원|병실/.test(t)?"bedplus":/야간|365|주말|일요일|공휴일|연중/.test(t)?"calendar":/상담|1:1|일대일|소통/.test(t)?"chat":/검사|진단|원인/.test(t)?"clipboard":/주차/.test(t)?"parking":/여성|여의사/.test(t)?"woman":/원장|의료진|전문|한의사/.test(t)?"doctor":/한약|탕전/.test(t)?"herb":/침/.test(t)?"needle":/추나|교정/.test(t)?"posture":"check";}
const S={
  hero:(p,c,kick)=>`<section class="s s-hero">${logo(c)}${kick?`<div class="kick"><span ${E}>${esc(kick)}</span></div>`:""}<div class="row2">${H(p.hero.t,"big")}${art(p.hero.art,"check")}</div>
    <div class="ilist">${p.hero.items.map(([i,t])=>`<div class="il"><span class="ci">${icon(i)}</span>${tx(t,"ilt")}</div>`).join("")}</div></section>`,
  warn:(p)=>`<section class="s s-warn alt">${H(p.warn.t,"big")}<div class="sub" ${E}>${esc(p.warn.sub)}</div>
    <div class="cards2">${p.warn.cards.map(([i,a,b])=>`<div class="cd"><span class="cdi">${icon(i)}</span><div><div class="cda" ${E}>${esc(a)}</div><div class="cdb" ${E}>${esc(b)}</div></div></div>`).join("")}</div>
    <div class="center">${art(p.warn.art[0],p.warn.art[1])}</div></section>`,
  list:(p)=>`<section class="s s-list"><div class="row2">${H(p.list.t,"big")}${art(p.list.art,"clock")}</div>
    <div class="nlist">${p.list.items.map(([i,t],k)=>`<div class="nl"><span class="nn">${String(k+1).padStart(2,"0")}</span><span class="ci">${icon(i)}</span><i class="vl"></i>${tx(t,"nlt")}</div>`).join("")}</div>
    <div class="note"><i class="dash"></i><span ${E}>${esc(p.list.note)}</span></div></section><div class="sep"></div>`,
  person:(p,c,img)=>`<section class="s s-person">${H(p.person.t,"big")}<div class="sub strong" ${E}>${esc(p.person.sub)}</div>
    <div class="pgrid">${ph("person",img.person,"pp")}<div class="psym">${p.person.sym.map(([i,t])=>`<div class="ps"><span class="ci sm">${icon(i)}</span>${tx(t)}</div>`).join("")}</div></div>
    ${c.badges&&c.badges.length?`<div class="badges">${c.badges.slice(0,3).map((b,k)=>`<div class="bd">${icon(["shield","calendar","bedplus"][k%3])}${tx(b)}</div>`).join("")}</div>`:""}</section>`,
  clinic:(p,c)=>`<section class="s s-clinic alt"><div class="cname" ${E}>${esc(c.name)}</div><div class="ctitle" ${E}>${em(p.clinic.title)}</div>
    <div class="cards2 tall">${((c.feats||[]).filter(Boolean).length>=2?c.feats.filter(Boolean).slice(0,4).map(t=>[featIcon(t),t]):p.clinic.feats).map(([i,t])=>`<div class="cd v"><span class="cdi big">${icon(i)}</span><i class="dash"></i><div class="cdt" ${E}>${em(t)}</div></div>`).join("")}</div></section>`,
  time:(p,c)=>`<section class="s s-time">${H(p.time.t,"big")}<div class="tl">${p.time.steps.map(([a,i,t,ar])=>`<div class="ts"><div class="tdot"></div><div class="tb"><div class="tla" ${E}>${esc(a)} —</div><div class="tlr"><span class="ci sm">${icon(i)}</span>${tx(t)}</div></div><div class="tart">${icon(ar,"ic")}</div></div>`).join("")}</div>
    <div class="box" ${E}>${esc(p.time.note)}</div>${c.logo?`<div class="center">${logo(c)}</div>`:""}</section>`,
  treat:(p,c,img)=>{const rows=treatRows(p,c);
    return `<section class="s s-treat">${H(p.treat.t,"big")}<div class="trs">${rows.map(([i,a,b],k)=>`<div class="tr"><span class="ci lg">${icon(i)}</span><div class="trt"><div class="trn">${String(k+1).padStart(2,"0")}</div><div class="tra" ${E}>${esc(a)}</div><div class="trb" ${E}>— ${em(b)}</div></div>${ph("treat"+k,img["treat"+k],"tph")}</div>`).join("")}</div>
    <div class="box ic1">${icon("alert")}<span ${E}>${esc(p.treat.note)}</span></div></section>`;},
  doctor:(d,k)=>`<section class="s s-doc ${k%2?"alt":""}"><div class="dgrid"><div class="dl"><i class="vbar"></i><div class="dn" ${E}>${esc(d.name)}</div><div class="dt" ${E}>${esc(d.title||"원장")}</div><div class="dr" ${E}>${esc(d.role||"")}</div></div>${ph("doc"+k,d.photo,"dph")}</div>
    ${(d.fields||[]).length?`<div class="dsec"><div class="dsh"><i></i><span ${E}>진료 분야</span><b></b></div>${d.fields.map(x=>`<div class="dli"><i></i>${tx(x)}</div>`).join("")}</div>`:""}
    ${(d.history||[]).length?`<div class="dsec"><div class="dsh"><i></i><span ${E}>약력·학회</span><b></b></div>${d.history.map(x=>`<div class="dli"><i></i>${tx(x)}</div>`).join("")}</div>`:""}</section>`,
  room:(c,img)=>`<section class="s s-room"><div class="ctitle tc" ${E}>${em(c.room.title||"[[입원실]] 안내")}</div>${ph("room",img.room||((c.photos||[])[0]||{}).url,"rph")}
    <div class="rgrid">${(c.room.items||[]).map(([i,a,b])=>`<div class="ri"><span class="ci sm">${icon(i)}</span><div><div class="ria" ${E}>${esc(a)}</div><div class="rib" ${E}>${esc(b||"")}</div></div></div>`).join("")}</div>
    ${c.room.note?`<div class="rnote" ${E}>${esc(c.room.note)}</div>`:""}</section>`,
  facility:(c)=>{const ps=(c.photos||[]).filter(x=>x&&x.url).slice(0,12);if(!ps.length)return "";
    return `<section class="s s-fac alt"><div class="ctitle" ${E}>${em("[[원내]] 시설 안내")}</div><div class="fgrid">${ps.map((x,k)=>`<div class="fi">${ph("fac"+k,x.url,"fph")}<div class="fl"><span class="ci xs">${icon(x.icon||"hospital")}</span><div class="fn">${String(k+1).padStart(2,"0")}</div><div class="ft" ${E}>${esc(x.label||"")}</div></div></div>`).join("")}</div></section>`;},
  info:(c)=>`<section class="s s-info"><div class="cname center" ${E}>${esc(c.name)}</div>
    <div class="ihead"><div class="ctitle" ${E}>${em("[[진료시간]]·오시는 길")}</div>${c.infoBadge?`<div class="ibadge" ${E}>${em(c.infoBadge)}</div>`:""}</div>
    ${c.tel?`<div class="itel">${icon("phone")}<div><div class="itl" ${E}>진료 문의</div><div class="itn" ${E}>${esc(c.tel)}</div></div></div>`:""}
    <div class="ihours">${(c.hours||[]).map(h=>`<div class="ih">${icon("clock")}<div><div class="ihl" ${E}>${esc(h[0])}</div><div class="iht" ${E}>${esc(h[1])}</div></div></div>`).join("")}${c.lunch?`<div class="ih">${icon("utensils")}<div><div class="ihl" ${E}>점심시간</div><div class="iht" ${E}>${esc(c.lunch)}</div></div></div>`:""}</div>
    ${c.addr?`<div class="iaddr"><div ${E}>${esc(c.addr)}</div>${c.way?`<div ${E}>${esc(c.way)}</div>`:""}</div>`:""}
    ${mapb(c)}
    ${c.parking?`<div class="ipark">${icon("car")}<b ${E}>주차</b><span ${E}>${esc(c.parking)}</span></div>`:""}
    <div class="center foot">${logo(c)}</div></section>`
};
/* 오시는 길 약도: 역 → 걸어서 → 병원 (실제 지도가 아닌 간단한 그림) */
function map(c){return `<div class="map"><svg viewBox="0 0 800 300" width="100%"><rect width="800" height="300" rx="18" fill="#eef1f3"/>
  <path d="M110 0v300M128 0v300" stroke="#2d6fd6" stroke-width="6"/><rect x="420" y="40" width="200" height="70" rx="10" fill="#cfe8d5"/><rect x="380" y="200" width="220" height="70" rx="10" fill="#cfe8d5"/>
  <path d="M60 150H740M300 0v300" stroke="#fff" stroke-width="22"/><path d="M135 150 C 300 150 420 170 600 200" stroke="#2d6fd6" stroke-width="5" stroke-dasharray="4 10" fill="none" stroke-linecap="round"/>
  <circle cx="119" cy="150" r="26" fill="#fff" stroke="#16325c" stroke-width="4"/><g transform="translate(101 132) scale(1.5)" fill="none" stroke="#16325c" stroke-width="1.7">${IC.train}</g>
  <g transform="translate(600 160)"><path d="M0 40s-22-19-22-38a22 22 0 0 1 44 0C22 21 0 40 0 40z" fill="#2d6fd6"/><circle cy="2" r="8" fill="#fff"/></g></svg>
  <div class="mst" ${E}>${esc(c.station)}</div>${c.walk?`<div class="mwk">${icon("walk")}<span ${E}>${esc(c.walk)}</span></div>`:""}<div class="mcl" ${E}>${esc(c.name)}</div></div>`;}

/* 오시는 길: 실제 지도 그림(주소로 만든 것)이 있으면 그것, 없으면 역 안내 그림 */
function mapb(c){if(c.mapImg)return `<div class="rmap">${ph("map",c.mapImg,"mapph")}${c.station||c.walk?`<div class="rmap-s"><b ${E}>${esc(c.station||"")}</b>${c.walk?`<span ${E}>${esc(c.walk)}</span>`:""}</div>`:""}</div>`;return c.station?map(c):"";}
/* 치료 설명: 홈페이지에 있는 설명이 있으면 그것 */
const tdOf=(c,i,a)=>{const d=c&&c.tdesc;return (d&&(d[a]||d[plain(a)]))||TD[i]||TD.check;};
/* 전체 이미지: 구역 순서대로 */
function build(o){if(STYLES[o.style]&&STYLES[o.style].nv)return nbuild(o);if(STYLES[o.style]&&STYLES[o.style].real)return rbuild(o);if(STYLES[o.style]&&STYLES[o.style].card)return kbuild(o);const p=T[o.topic]||T["기본"],c=o.clinic,img=o.img||{},on=o.on||{};const out=[];
  const add=(k,h)=>{if(on[k]!==false&&h)out.push(`<div class="blk" data-k="${k}">${h}</div>`);};
  add("hero",S.hero(p,c,o.kick));add("warn",S.warn(p,c));add("list",S.list(p,c));add("person",S.person(p,c,img));add("clinic",S.clinic(p,c));
  add("time",S.time(p,c));add("treat",S.treat(p,c,img));(c.doctors||[]).filter(d=>d&&d.name).forEach((d,k)=>add("doc"+k,S.doctor(d,k)));
  if(c.room&&c.room.on)add("room",S.room(c,img));add("facility",S.facility(c));add("info",S.info(c));
  return out.join("");}
/* ── 카드형 디자인: 네이버 상위 한의원 블로그(숨쉬는한의원 예시)처럼 큰 그라데이션 제목 + 알약 띠 + 파란 문구 상자 + 체크 목록 + 치료 카드 ── */
const gem=s=>esc(s).replace(/\[\[(.+?)\]\]/g,'<b class="g">$1</b>');           // [[ ]] = 파랑 그라데이션 글자
const yem=s=>esc(s).replace(/\[\[(.+?)\]\]/g,'<b class="y">$1</b>');           // 파란 상자 안 [[ ]] = 노란 글자
const plain=s=>String(s||"").replace(/\[\[|\]\]/g,"");
const ro=w=>{const c=String(w||"").trim().slice(-1).charCodeAt(0)-0xac00;if(c<0||c>11171)return "로";const j=c%28;return j===0||j===8?"로":"으로";};
/* 제목: 첫 줄 검정, 둘째 줄 그라데이션([[ ]]가 있으면 그 부분만) */
let KN=0;   // 구역 번호 (POINT 01 …)
const KH=(t,o)=>{o=o||{};const l2=t[1]||"",g2=/\[\[/.test(l2)?gem(l2):`<b class="g">${esc(l2)}</b>`;
  const l1=o.all?`<b class="g">${esc(plain(t[0]))}</b>`:gem(t[0]);
  const kk=o.top?`<div class="k-kk"><b>${String(++KN).padStart(2,"0")}</b><span>${esc(o.top)}</span></div>`:"";
  return `${kk}<div class="k-h ${o.cls||""}"><div ${E}>${l1}</div>${l2?`<div ${E}>${g2}</div>`:""}</div>`;};
const pill=(s,cls)=>`<div class="k-pillw ${cls||""}"><span class="k-pill" ${E}>${gem(s).replace(/class="g"/g,'class="pb"')}</span></div>`;
const chk='<svg class="k-ck" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5L19.5 6.5"/></svg>';
const kfoot=(c,band)=>{if(!c.logo&&!c.name)return "";return `<div class="k-foot ${band?"band":""}">${c.logo?`<img class="k-logo" src="${esc(c.logo)}" alt="">`:`<span class="k-fname" ${E}>${esc(c.name)}</span>`}</div>`;};
/* 그림: 클립보드, 의사 */
const CLIP=`<svg class="k-clip" viewBox="0 0 120 150"><rect x="8" y="16" width="104" height="128" rx="14" fill="#e9b47b" stroke="#16243b" stroke-width="5"/><path d="M20 30h80v100H34l-14-14z" fill="#fff" stroke="#16243b" stroke-width="4" stroke-linejoin="round"/><path d="M20 116l14 14v-14z" fill="#dbe6f3" stroke="#16243b" stroke-width="4" stroke-linejoin="round"/>
<rect x="38" y="8" width="44" height="20" rx="8" fill="#b9c8dc" stroke="#16243b" stroke-width="4"/><circle cx="60" cy="10" r="5" fill="#fff" stroke="#16243b" stroke-width="3"/>
${[48,70,92].map(y=>`<rect x="32" y="${y-8}" width="15" height="15" rx="3" fill="none" stroke="#16243b" stroke-width="3.5"/><path d="M34 ${y}l4 4 9-11" fill="none" stroke="#16243b" stroke-width="3.5" stroke-linecap="round"/><path d="M54 ${y+1}h${y===70?34:26}" stroke="#16243b" stroke-width="4.5" stroke-linecap="round"/>`).join("")}</svg>`;
const DOC=`<svg class="k-doc" viewBox="0 0 160 260"><path d="M30 250V150c0-26 20-44 50-44s50 18 50 44v100z" fill="#fff" stroke="#9aa9bb" stroke-width="3"/><path d="M62 108l18 60 18-60" fill="#2f8f7a"/><path d="M62 106l18 24 18-24" fill="#fff" stroke="#9aa9bb" stroke-width="2"/>
<rect x="58" y="245" width="44" height="12" fill="#2b2f36"/><path d="M48 150c-6 26-2 46 10 56M112 150c6 26 2 46-10 56" fill="none" stroke="#2b2f36" stroke-width="4" stroke-linecap="round"/><circle cx="58" cy="210" r="7" fill="#9fb4c7" stroke="#2b2f36" stroke-width="3"/>
<path d="M40 176c20 10 60 10 80 0l-4 18c-24 8-48 8-72 0z" fill="#fff" stroke="#9aa9bb" stroke-width="3"/><circle cx="80" cy="66" r="34" fill="#ffd9b8"/><path d="M46 60c0-26 16-36 34-36s34 10 34 36c-8-10-22-14-34-14s-26 4-34 14z" fill="#2b2f36"/>
<circle cx="68" cy="68" r="3.4" fill="#2b2f36"/><circle cx="92" cy="68" r="3.4" fill="#2b2f36"/><path d="M72 82c5 4 11 4 16 0" fill="none" stroke="#c0605a" stroke-width="3" stroke-linecap="round"/><circle cx="61" cy="78" r="5" fill="#ffb3a7" opacity=".6"/><circle cx="99" cy="78" r="5" fill="#ffb3a7" opacity=".6"/></svg>`;
/* 치료 이름 → 쉬운 설명 두 문장 */
const TD={needle:"통증 부위와 몸 상태에 맞춰 침·약침을 놓아 불편한 부위의 회복을 돕는 치료입니다.",posture:"한의사가 손으로 틀어진 체형과 관절의 균형을 살피고 움직임을 편하게 돕는 수기 치료입니다.",
  herb:"체질과 지금 몸 상태를 살펴 처방하는 한약으로 몸의 회복과 균형을 돕습니다.",drop:"부항·뜸으로 뭉친 부위의 순환을 돕고 몸을 따뜻하게 관리합니다.",bedplus:"입원 기간 동안 상태를 가까이서 살피며 집중적으로 관리합니다.",
  wave:"물리치료 장비로 통증 부위를 관리해 움직임을 편하게 돕습니다.",xray:"검사로 지금 상태를 먼저 확인하고 그에 맞는 치료 계획을 세웁니다.",pill:"증상에 맞춘 약물·주사 치료로 불편함을 관리합니다.",
  scale:"식습관과 생활 습관을 함께 살피며 몸 상태에 맞는 관리 방법을 찾습니다.",sparkle:"피부 상태와 몸속 원인을 함께 살펴 관리합니다.",child:"아이의 성장 단계와 생활 습관을 살펴 맞춤 관리를 돕습니다.",nose:"코와 호흡 상태를 살피고 몸 상태에 맞춰 관리합니다.",
  woman:"시기마다 달라지는 몸 상태를 살펴 맞춤 관리를 돕습니다.",walk:"운동과 재활로 움직임을 회복하고 재발 관리를 돕습니다.",doctor:"불편한 점을 충분히 듣고 원인과 상태를 확인합니다.",hand:"손으로 뭉친 부위를 풀고 움직임 회복을 돕습니다.",fire:"몸을 따뜻하게 해 순환과 회복을 돕습니다.",iv:"몸 상태에 맞춰 수액 등으로 회복을 돕습니다.",check:"증상과 몸 상태에 맞춰 진행합니다."};
const FD={shield:"자동차보험 진료 여부를 접수 때 꼼꼼히 안내해 드립니다.",calendar:"바쁜 일상에도 진료받기 편하도록 진료 시간을 운영합니다.",bedplus:"필요할 때는 입원으로 상태를 가까이서 살핍니다.",chat:"불편한 점을 충분히 듣고 쉽게 설명해 드립니다.",
  clipboard:"불편함의 원인부터 살피고 진료 계획을 세웁니다.",doctor:"환자마다 다른 증상과 상태에 맞춰 진료합니다.",herb:"체질과 상태를 살펴 처방을 정합니다.",needle:"불편한 부위에 맞춰 치료를 진행합니다.",posture:"몸의 균형과 움직임을 함께 살핍니다.",parking:"차를 가지고 오셔도 편하게 방문하실 수 있습니다.",woman:"편하게 말씀하실 수 있도록 세심하게 진료합니다.",check:"환자분의 편안한 회복을 먼저 생각합니다."};
const tname=t=>t==="기본"?"맞춤 진료":t+" 진료";
const feats=(p,c)=>((c.feats||[]).filter(Boolean).length>=2?c.feats.filter(Boolean).map(t=>[featIcon(t),t]):p.clinic.feats);
const K={
  /* 첫 화면: 제목 + 몸 그림 설명(사진 + 점선 + 빛나는 점) + 파란 문구 상자 */
  hero:(p,c,img)=>{const cs=p.warn.cards.slice(0,4),L=[[24,150],[24,330]],R=[[470,90],[470,270]],dotL=[318,300],dotR=[452,442];
    const lab=(x,k,side)=>{const [i,a,b]=x,[,y]=(side?R:L)[k],dx=side?dotR[k]:dotL[k];
      return side?`<div class="k-lb r" style="top:${y}px;left:${dx}px"><i class="k-dot"></i><div class="k-lt"><b ${E}>${esc(a)}</b><span ${E}>${esc(b)}</span></div></div>`
        :`<div class="k-lb l" style="top:${y}px;width:${dx-24}px"><div class="k-lt"><b ${E}>${esc(a)}</b><span ${E}>${esc(b)}</span></div><i class="k-dot"></i></div>`;};
    return `<section class="k k-hero">${KH(p.hero.t,{cls:"xl",top:"CHECK"})}<i class="k-vl"></i>
    <div class="k-sub" ${E}>${esc(p.warn.sub)}<br><b>${esc(plain(p.person.t.join(" ")))}</b></div>
    ${pill("몸이 보내는 [[신호]]","on")}<div class="k-card k-body">${ph("person",img.person,"k-pp")}${cs.map((x,k)=>lab(x,k>>1,k%2)).join("")}</div>
    <div class="k-blue" ${E}>${esc(p.person.sub)}<br><b>증상이 이어진다면 <b class="y">초기에 확인하는 것</b>이 중요합니다.</b></div>${kfoot(c)}</section>`;},
  /* 손글씨 질문 + 체크 목록(종이 접힘) + 흰 카드 */
  warn:(p,c)=>`<section class="k k-warn"><div class="k-hw" ${E}>혹시 이런 증상이 있으신가요?</div>${KH(p.list.t,{top:"SELF CHECK"})}
    <div class="k-paper">${p.list.items.map(([,t])=>`<div class="k-cl">${chk}<span ${E}>${esc(t)}</span></div>`).join("")}<i class="k-curl"></i></div>
    <div class="k-card k-white">${KH(["이런 증상을","그냥 두고 계신가요?"],{all:true,cls:"md"})}
      <div class="k-blue sm" ${E}>오래 두면 일상이 더 불편해질 수 있어<br><b class="y">초기에 확인하는 것</b>이 중요합니다.</div>
      <div class="k-end" ${E}>꼼꼼하게 진료하는<br>${c.name?`<b class="g">${esc(c.name)}</b>에서 상담해 보세요!`:`<b class="g">가까운 한의원</b>에서 상담해 보세요!`}</div></div>${kfoot(c)}</section>`,
  /* 사진 띠 위 체크 알약 + 손글씨 인용 + 흰 상자 */
  list:(p,c,img)=>`<section class="k k-band tint">${KH(p.warn.t,{cls:"xl",top:"WHY"})}
    <div class="k-bandph">${ph("band",img.band,"k-bph")}<div class="k-bpills">${p.hero.items.slice(0,3).map(([,t])=>`<div class="k-bp">${chk}<span ${E}>${esc(t)}</span></div>`).join("")}</div></div>
    <div class="k-q hw"><i>“</i><span ${E}>원인과 <b class="hb">몸 상태</b>에 맞는 <b class="hb">맞춤 관리</b>를</span><i>”</i></div>
    <div class="k-wbox" ${E}>${c.name?`<b class="ac">${esc(c.name)}</b>에서 `:""}지금 상태를 확인하고<br>알맞은 관리 방법을 찾아보세요.</div>${kfoot(c,1)}</section>`,
  /* 이런 분들께 필요해요 (3칸) + 진료 특징 목록 + 의사 그림 */
  person:(p,c)=>{const who=p.person.sym.slice(0,3).map(([,t])=>t),fs=feats(p,c).slice(0,5);
    return `<section class="k k-who"><div class="k-pills2">${pill(`[[${c.name?c.name+"의 ":""}${tname(KEYOF(p))}]],`,"lg")}${pill("이런 분들께 필요해요!","lg")}</div>
    <div class="k-who3">${who.map(t=>`<div class="k-wc">${chk}<div ${E}>${esc(t)}${ro(t)}<br>힘드신 분</div></div>`).join("")}</div>
    <div class="k-adv"><div class="k-advh" ${E}>${c.name?`<b class="g">${esc(c.name)}</b>의 `:""}진료 특징</div>
      <div class="k-advg"><div>${fs.map(([,t])=>`<div class="k-cl">${chk}<span ${E}>${esc(plain(t))}</span></div>`).join("")}</div>${DOC}</div></div>${kfoot(c)}</section>`;},
  /* 약속 카드 3개 + 시설 사진 띠 + 손글씨 */
  clinic:(p,c)=>{const fs=feats(p,c).slice(0,3),ps=(c.photos||[]).filter(x=>x&&x.url).slice(0,3);
    return `<section class="k k-prom">${KH([(c.name?c.name+"의":"우리 한의원의")+" [[약속!]]"],{cls:"xl",top:"PROMISE"})}${pill("늘 가까이에서 건강을 살피는 주치의가 되겠습니다.","")}
    <div class="k-ovals">${fs.map(([i,t])=>`<div class="k-oval"><div class="k-ot" ${E}>${gem(t)}</div><div class="k-od" ${E}>${esc(FD[i]||FD.check)}</div></div>`).join("")}</div>
    <div class="k-bluebot">${ps.length?`<div class="k-strip">${ps.map((x,k)=>ph("fac"+k,x.url,"k-sp")).join("")}</div>`:""}
    <div class="k-q hw white"><i>“</i><span ${E}>편안하고 건강한 일상을 누리실 수 있도록 함께하겠습니다</span><i>”</i></div>${kfoot(c,1)}</div></section>`;},
  /* 진료 과정: 원 4개 + 화살표 */
  time:(p,c)=>`<section class="k k-proc">${KH(p.time.t,{cls:"xl",top:"PROCESS"})}${pill(p.time.note,"soft")}
    <div class="k-steps">${p.time.steps.map(([a,i,t],k)=>`<div class="k-st ${k%2?"dk":""}"><div class="k-sti"><b>${String(k+1).padStart(2,"0")}</b><div ${E}>${esc(a)}</div><span ${E}>${esc(t)}</span></div></div>`).join("")}</div>${kfoot(c)}</section>`,
  /* 치료: 사진 + 겹친 알약 설명, 아이콘 원 + 파란 이름표 카드 */
  treat:(p,c,img)=>{const rows=treatRows(p,c);
    return `<section class="k k-treat">${KH([c.name?c.name+"의":"상태에 맞춘",`[[${KEYOF(p)==="기본"?"맞춤 진료":KEYOF(p)+" 클리닉"}]]`],{cls:"xl one",top:"TREATMENT"})}
    <div class="k-q"><i>“</i><span ${E}>몸 상태를 꼼꼼히 살피고 <b class="ac">상태에 맞춘 치료</b>로<br>편안한 일상을 돕겠습니다.</span><i>”</i></div>
    ${rows[0]?`<div class="k-phcap">${ph("treat0",img.treat0,"k-tph")}<div class="k-cap"><b ${E}>${esc(tname(KEYOF(p)))}, 이렇게 살펴요</b><span ${E}>불편한 곳과 몸 상태를 먼저 확인한 뒤<br>상태에 맞는 치료 방법을 함께 정합니다.</span></div></div>`:""}
    <div class="k-tcs">${rows.map(([i,a])=>`<div class="k-tc"><div class="k-tci">${icon(i)}</div><div><span class="k-tag" ${E}>${esc(a)}</span><div class="k-tcd" ${E}>${esc(tdOf(c,i,a))}</div></div></div>`).join("")}</div>
    <div class="k-note" ${E}>${esc(p.treat.note)}</div>${kfoot(c,1)}</section>`;},
  doctor:(d,k,c)=>`<section class="k k-docs"><div class="k-dbox"><div class="k-dl"><div class="k-dtt" ${E}>${esc(d.title||"원장")}</div><div class="k-dn" ${E}>${esc(d.name)}</div><div class="k-dr" ${E}>${esc(d.role||"")}</div></div><div class="k-dr2">${ph("doc"+k,d.photo,"k-dph")}</div></div>
    ${(d.fields||[]).length||(d.history||[]).length?`<div class="k-adv">${(d.fields||[]).length?`<div class="k-advh sm" ${E}>진료 분야</div>${d.fields.map(x=>`<div class="k-cl">${chk}<span ${E}>${esc(x)}</span></div>`).join("")}`:""}
    ${(d.history||[]).length?`<div class="k-advh sm" ${E}>약력·학회</div>${d.history.map(x=>`<div class="k-cl">${chk}<span ${E}>${esc(x)}</span></div>`).join("")}`:""}</div>`:""}${kfoot(c)}</section>`,
  room:(c,img)=>`<section class="k k-room">${KH([c.name||"","[["+plain(c.room.title||"입원치료")+"]]"].filter(Boolean),{cls:"xl"})}
    ${c.room.note?`<div class="k-soft" ${E}>${esc(c.room.note)}</div>`:`<div class="k-soft" ${E}>입원으로 <b class="ac">좀 더 가까이에서</b> 상태를 살필 수 있어요.</div>`}
    ${ph("room",img.room||((c.photos||[])[0]||{}).url,"k-rph")}
    ${(c.room.items||[]).length?`<div class="k-ritems">${c.room.items.slice(0,4).map(([,a,b])=>`<div class="k-ri"><b ${E}>${esc(a)}</b><span ${E}>${esc(b||"")}</span></div>`).join("")}</div>`:""}
    <div class="k-flow"><div class="k-flh" ${E}>입원<br>절차</div><div class="k-steps sm">${["진료 및<br>진찰","치료<br>계획","입원<br>진행","치료 후<br>관리"].map((t,k)=>`<div class="k-st ${k%2?"dk":""}"><div class="k-sti"><b>${String(k+1).padStart(2,"0")}</b><div ${E}>${t}</div></div></div>`).join("")}</div></div>${kfoot(c,1)}</section>`,
  facility:(c)=>{const ps=(c.photos||[]).filter(x=>x&&x.url).slice(0,8);if(!ps.length)return "";const gs=[];for(let i=0;i<ps.length;i+=4)gs.push(ps.slice(i,i+4));
    return `<section class="k k-fac">${KH([c.name||"","[[원내 시설 안내]]"].filter(Boolean),{cls:"xl"})}${pill("편안하게 진료받으실 수 있도록","")}
    ${gs.map((g,gi)=>`<div class="k-floor"><div class="k-fl"><div class="k-fbadge" ${E}>${gi?"시설":"진료"}</div>${g.map(x=>`<div class="k-cl w">${chk}<span ${E}>${esc(x.label||"시설")}</span></div>`).join("")}</div>
      <div class="k-fg">${g.map((x,k)=>ph("fac"+(gi*4+k),x.url,"k-fph")).join("")}</div></div>`).join("")}${kfoot(c)}</section>`;},
  info:(c)=>{const hs=(c.hours||[]).filter(h=>h&&h[1]);
    return `<section class="k k-info"><div class="k-brk">${KH([c.name||"","[[진료시간 및 오시는 길]]"].filter(Boolean),{cls:"md",top:"INFO"})}</div>
    ${mapb(c)}
    <div class="k-rows">${c.addr?`<div class="k-row"><div class="k-ri2">${icon("pin")}<b>주소</b></div><div class="k-rv" ${E}>${esc(c.addr)}${c.way?`<br><small>${esc(c.way)}</small>`:""}</div></div>`:""}
    ${c.tel?`<div class="k-row"><div class="k-ri2">${icon("phone")}<b>전화번호</b></div><div class="k-rv big" ${E}>${esc(c.tel)}</div></div>`:""}
    ${hs.length||c.lunch?`<div class="k-row"><div class="k-ri2">${icon("clock")}<b>진료시간</b></div><div class="k-rv hrs">${hs.map(h=>`<div><span ${E}>${esc(h[0])}</span><b ${E}>${esc(h[1])}</b></div>`).join("")}${c.lunch?`<div><span>점심시간</span><b ${E}>${esc(c.lunch)}</b></div>`:""}</div></div>`:""}
    ${c.parking?`<div class="k-row"><div class="k-ri2">${icon("car")}<b>주차</b></div><div class="k-rv" ${E}>${esc(c.parking)}</div></div>`:""}</div>
    <div class="k-lfoot">${kfoot(c)}<div class="k-law" ${E}>모든 치료는 개인에 따라 차이가 있을 수 있고 부작용이 생길 수 있습니다.<br>반드시 의료진과 충분히 상담한 뒤 결정하시기 바랍니다.</div></div></section>`;}
};
const KEYOF=p=>Object.keys(T).find(k=>T[k]===p)||"기본";
/* ── 구역마다 다른 모양(네이버 상위 블로그에서 자주 보이는 틀) — 만들 때마다 골라 섞음 ── */
const LKN={h:4,bg:4,sh:3,hero:3,warn:3,list:2,treat:3,person:2,time:3,clinic:3,info:2};
function randLook(prev){prev=prev||{};const o={};
  for(const k in LKN){const n=LKN[k];let v=Math.floor(Math.random()*n);if(n>1&&v===prev[k]&&Math.random()<.8)v=(v+1+Math.floor(Math.random()*(n-1)))%n;o[k]=v;}o.seed=1+Math.floor(Math.random()*4e9);return o;}
const lookCls=L=>L?`lk-h${L.h|0} lk-b${L.bg|0} lk-s${L.sh|0}`:"";
const hsub=p=>`${esc(p.warn.sub)}<br><b>${esc(plain(p.person.t.join(" ")))}</b>`;
const hblue=p=>`<div class="k-blue" ${E}>${esc(p.person.sub)}<br><b>증상이 이어진다면 <b class="y">초기에 확인하는 것</b>이 중요합니다.</b></div>`;
const wend=c=>`<div class="k-end" ${E}>꼼꼼하게 진료하는<br>${c.name?`<b class="g">${esc(c.name)}</b>에서 상담해 보세요!`:`<b class="g">가까운 한의원</b>에서 상담해 보세요!`}</div>`;
const nn=k=>String(k+1).padStart(2,"0");
const KV={
  hero:[null,
    /* 큰 사진 위 제목 + 2칸 증상 카드 */
    (p,c,img)=>{const cs=p.warn.cards.slice(0,4);return `<section class="k k-hero k-hmag"><div class="k-mag">${ph("person",img.person,"k-magph")}<div class="k-magt">${KH(p.hero.t,{cls:"xl",top:"CHECK"})}<div class="k-sub" ${E}>${esc(p.warn.sub)}</div></div></div>
      ${pill("몸이 보내는 [[신호]]","")}<div class="k-g2">${cs.map(([i,a,b])=>`<div class="k-gc"><div class="k-gci">${icon(i)}</div><b ${E}>${esc(a)}</b><span ${E}>${esc(b)}</span></div>`).join("")}</div>${hblue(p)}${kfoot(c)}</section>`;},
    /* 왼쪽 사진 + 오른쪽 번호 목록 */
    (p,c,img)=>{const cs=p.warn.cards.slice(0,4);return `<section class="k k-hero">${KH(p.hero.t,{cls:"xl",top:"CHECK"})}<div class="k-sub" style="margin-top:22px" ${E}>${hsub(p)}</div>
      <div class="k-split">${ph("person",img.person,"k-sph")}<div class="k-nums">${cs.map(([i,a,b],k)=>`<div class="k-num"><b>${nn(k)}</b><div><strong ${E}>${esc(a)}</strong><span ${E}>${esc(b)}</span></div></div>`).join("")}</div></div>${hblue(p)}${kfoot(c)}</section>`;}],
  warn:[null,
    /* 아이콘 카드 격자 */
    (p,c)=>`<section class="k k-warn"><div class="k-hw" ${E}>혹시 이런 증상이 있으신가요?</div>${KH(p.list.t,{top:"SELF CHECK"})}
      <div class="k-wgrid">${p.list.items.map(([i,t])=>`<div class="k-wg"><div class="k-wgi">${icon(i)}</div><span ${E}>${esc(t)}</span></div>`).join("")}</div>
      <div class="k-blue sm" ${E}>오래 두면 일상이 더 불편해질 수 있어<br><b class="y">초기에 확인하는 것</b>이 중요합니다.</div>${wend(c)}${kfoot(c)}</section>`,
    /* 번호 + 네모 체크 자가 진단표 */
    (p,c)=>`<section class="k k-warn">${KH(p.list.t,{top:"SELF CHECK"})}<div class="k-sc"><div class="k-sch" ${E}>나도 해당될까? 자가 체크</div>
      ${p.list.items.map(([,t],k)=>`<div class="k-scr"><b>${k+1}</b><span ${E}>${esc(t)}</span><i class="k-sbx">${chk}</i></div>`).join("")}</div>
      <div class="k-hw k-scn" ${E}>하나라도 해당된다면 미루지 말고 확인해 보세요!</div>${wend(c)}${kfoot(c)}</section>`],
  list:[null,
    /* 사진 옆 체크 띠 */
    (p,c,img)=>`<section class="k k-band tint">${KH(p.warn.t,{cls:"xl",top:"WHY"})}
      <div class="k-side">${ph("band",img.band,"k-sideph")}<div class="k-sidel">${p.hero.items.slice(0,3).map(([i,t])=>`<div class="k-sb"><div class="k-sbi">${icon(i)}</div><span ${E}>${esc(t)}</span></div>`).join("")}</div></div>
      <div class="k-q hw"><i>“</i><span ${E}>원인과 <b class="hb">몸 상태</b>에 맞는 <b class="hb">맞춤 관리</b>를</span><i>”</i></div>
      <div class="k-wbox" ${E}>${c.name?`<b class="ac">${esc(c.name)}</b>에서 `:""}지금 상태를 확인하고<br>알맞은 관리 방법을 찾아보세요.</div>${kfoot(c,1)}</section>`],
  treat:[null,
    /* 지그재그 줄 */
    (p,c,img)=>{const rows=treatRows(p,c);return `<section class="k k-treat">${KH([c.name?c.name+"의":"상태에 맞춘",`[[${KEYOF(p)==="기본"?"맞춤 진료":KEYOF(p)+" 클리닉"}]]`],{cls:"xl one",top:"TREATMENT"})}
      ${rows[0]?ph("treat0",img.treat0,"k-tph2"):""}
      <div class="k-zzs">${rows.map(([i,a],k)=>`<div class="k-zz ${k%2?"r":""}"><div class="k-zzi">${icon(i)}<b>${nn(k)}</b></div><div class="k-zzt"><div class="k-zzh" ${E}>${esc(a)}</div><div ${E}>${esc(tdOf(c,i,a))}</div></div></div>`).join("")}</div>
      <div class="k-note" ${E}>${esc(p.treat.note)}</div>${kfoot(c,1)}</section>`;},
    /* 2칸 타일 */
    (p,c,img)=>{const rows=treatRows(p,c);return `<section class="k k-treat tint">${KH([c.name?c.name+"의":"상태에 맞춘",`[[${KEYOF(p)==="기본"?"맞춤 진료":KEYOF(p)+" 클리닉"}]]`],{cls:"xl one",top:"TREATMENT"})}
      <div class="k-q"><i>“</i><span ${E}>몸 상태를 꼼꼼히 살피고 <b class="ac">상태에 맞춘 치료</b>로<br>편안한 일상을 돕겠습니다.</span><i>”</i></div>
      ${rows[0]?`<div class="k-phcap">${ph("treat0",img.treat0,"k-tph")}</div>`:""}
      <div class="k-tgs ${rows.length%2?"odd":""}">${rows.map(([i,a])=>`<div class="k-tg"><div class="k-tgi">${icon(i)}</div><b ${E}>${esc(a)}</b><span ${E}>${esc(tdOf(c,i,a))}</span></div>`).join("")}</div>
      <div class="k-note" ${E}>${esc(p.treat.note)}</div>${kfoot(c)}</section>`;}],
  person:[null,
    (p,c)=>{const who=p.person.sym.slice(0,3).map(([i,t])=>[i,t]),fs=feats(p,c).slice(0,5);
      return `<section class="k k-who">${KH([tname(KEYOF(p)),"이런 분들께 [[필요해요]]"],{cls:"md",top:"FOR YOU"})}
      <div class="k-whol">${who.map(([i,t])=>`<div class="k-whr"><div class="k-gci">${icon(i)}</div><span ${E}>${esc(t)}${ro(t)} 힘드신 분</span>${chk}</div>`).join("")}</div>
      <div class="k-adv"><div class="k-advh" ${E}>${c.name?`<b class="g">${esc(c.name)}</b>의 `:""}진료 특징</div>${fs.map(([,t],k)=>`<div class="k-fr"><b>${nn(k)}</b><span ${E}>${esc(plain(t))}</span></div>`).join("")}</div>${kfoot(c)}</section>`;}],
  time:[null,
    /* 세로 단계 */
    (p,c)=>`<section class="k k-proc">${KH(p.time.t,{cls:"xl",top:"PROCESS"})}${pill(p.time.note,"soft")}
      <div class="k-tl">${p.time.steps.map(([a,i,t],k)=>`<div class="k-tli"><div class="k-tln">STEP<b>${nn(k)}</b></div><div class="k-tlc"><div class="k-gci">${icon(i)}</div><div><b ${E}>${esc(a)}</b><span ${E}>${esc(t)}</span></div></div></div>`).join("")}</div>${kfoot(c)}</section>`,
    /* 화살표 상자 */
    (p,c)=>`<section class="k k-proc tint">${KH(p.time.t,{cls:"xl",top:"PROCESS"})}
      <div class="k-chev n${p.time.steps.length}">${p.time.steps.map(([a,i,t],k)=>`<div class="k-cv ${k%2?"dk":""}"><small>STEP ${nn(k)}</small>${icon(i)}<b ${E}>${esc(a)}</b><span ${E}>${esc(t)}</span></div>`).join("")}</div>${pill(p.time.note,"soft")}${kfoot(c)}</section>`],
  clinic:[null,
    /* 큰 번호 줄 */
    (p,c)=>{const fs=feats(p,c).slice(0,3),ps=(c.photos||[]).filter(x=>x&&x.url).slice(0,3);
      return `<section class="k k-prom">${KH([(c.name?c.name+"의":"우리 한의원의")+" [[약속!]]"],{cls:"xl",top:"PROMISE"})}<div class="k-hw" ${E}>늘 가까이에서 건강을 살피는 주치의가 되겠습니다</div>
      <div class="k-nrs">${fs.map(([i,t],k)=>`<div class="k-nr"><b class="k-nrn">${nn(k)}</b><div><div class="k-ot" ${E}>${gem(t)}</div><div class="k-od" ${E}>${esc(FD[i]||FD.check)}</div></div></div>`).join("")}</div>
      ${ps.length?`<div class="k-strip r">${ps.map((x,k)=>ph("fac"+k,x.url,"k-sp")).join("")}</div>`:""}${kfoot(c)}</section>`;},
    /* 3칸 카드 */
    (p,c)=>{const fs=feats(p,c).slice(0,3),ps=(c.photos||[]).filter(x=>x&&x.url).slice(0,3);
      return `<section class="k k-prom tint">${KH([(c.name?c.name+"의":"우리 한의원의")+" [[약속!]]"],{cls:"xl",top:"PROMISE"})}${pill("늘 가까이에서 건강을 살피는 주치의가 되겠습니다.","soft")}
      <div class="k-c3">${fs.map(([i,t])=>`<div class="k-c3c"><div class="k-tci">${icon(i)}</div><b ${E}>${gem(t)}</b><span ${E}>${esc(FD[i]||FD.check)}</span></div>`).join("")}</div>
      <div class="k-bluebot">${ps.length?`<div class="k-strip">${ps.map((x,k)=>ph("fac"+k,x.url,"k-sp")).join("")}</div>`:""}
      <div class="k-q hw white"><i>“</i><span ${E}>편안하고 건강한 일상을 누리실 수 있도록 함께하겠습니다</span><i>”</i></div>${kfoot(c,1)}</div></section>`;}],
  info:[null,
    (c)=>{const hs=(c.hours||[]).filter(h=>h&&h[1]),row=(i,l,v,cl)=>`<div class="k-tr2"><div class="k-tl2">${icon(i)}<b>${l}</b></div><div class="k-tv ${cl||""}">${v}</div></div>`;
      return `<section class="k k-info">${KH([c.name||"","[[진료시간 및 오시는 길]]"].filter(Boolean),{cls:"md",top:"INFO"})}${mapb(c)}
      <div class="k-tbl">${c.addr?row("pin","주소",`<span ${E}>${esc(c.addr)}</span>${c.way?`<small ${E}>${esc(c.way)}</small>`:""}`):""}
      ${c.tel?row("phone","전화번호",`<span ${E}>${esc(c.tel)}</span>`,"big"):""}
      ${hs.length||c.lunch?row("clock","진료시간",`<div class="k-hrs2">${hs.map(h=>`<div><span ${E}>${esc(h[0])}</span><b ${E}>${esc(h[1])}</b></div>`).join("")}${c.lunch?`<div><span>점심시간</span><b ${E}>${esc(c.lunch)}</b></div>`:""}</div>`):""}
      ${c.parking?row("car","주차",`<span ${E}>${esc(c.parking)}</span>`):""}</div>
      <div class="k-law dk" ${E}>모든 치료는 개인에 따라 차이가 있을 수 있고 부작용이 생길 수 있습니다.<br>반드시 의료진과 충분히 상담한 뒤 결정하시기 바랍니다.</div>${kfoot(c)}</section>`;}]
};
const KX=(k,L,...a)=>{const f=(KV[k]||[])[(L&&L[k])|0];return f?f(...a):K[k](...a);};
function kbuild(o){const p=T[o.topic]||T["기본"],c=o.clinic,img=o.img||{},on=o.on||{},L=o.look;const out=[];KN=0;
  const add=(k,h)=>{if(on[k]!==false&&h)out.push(`<div class="blk" data-k="${k}">${h}</div>`);};
  add("hero",KX("hero",L,p,c,img));
  {const ab=aboutItems(c);if(c.intro||ab.length)add("about",`<section class="k k-about">${KH([c.name||"저희 한의원",`[[${plain(c.slogan||"병원 소개")}]]`].map(x=>String(x).slice(0,22)),{cls:"md",top:"ABOUT"})}${c.intro?`<div class="k-blue" ${E}>${esc(c.intro)}</div>`:""}
    <div class="k-whol">${ab.slice(0,4).map(([a,b])=>`<div class="k-whr">${chk}<span ${E}>${esc(a)}${b?` <small>${esc(b)}</small>`:""}</span></div>`).join("")}</div>${kfoot(c)}</section>`);}add("warn",KX("warn",L,p,c));add("list",KX("list",L,p,c,img));add("treat",KX("treat",L,p,c,img));add("person",KX("person",L,p,c));
  add("time",KX("time",L,p,c));add("clinic",KX("clinic",L,p,c));(c.doctors||[]).filter(d=>d&&d.name).forEach((d,k)=>add("doc"+k,K.doctor(d,k,c)));
  if(c.room&&c.room.on)add("room",K.room(c,img));add("facility",K.facility(c));add("info",KX("info",L,c));
  return out.join("");}
/* ── 네이버 실제형: 네이버 한의원 상위 글 2,633장에서 많이 보이는 카드(어두운 카드뉴스 / 베이지 명조 / 사진 위 굵은 글씨). 아이콘·그라데이션 없이 사진과 글씨로 ── */
const rem=s=>esc(s).replace(/\[\[(.+?)\]\]/g,'<b class="ra">$1</b>');
const rck='<svg class="r-ck" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="10"/><path d="M7.5 12.3l3 3 6-6.3" stroke-width="2"/></svg>';
const rname=c=>c.logo?`<img class="r-logo" src="${esc(c.logo)}" alt="">`:c.name?`<span class="r-nm" ${E}>${esc(c.name)}</span>`:"";
const RT=t=>`<div class="r-t"><div ${E}>${rem(t[0])}</div>${t[1]?`<div ${E}>${rem(t[1])}</div>`:""}</div>`;
/* 글 카드: 제목 + 목록(번호 또는 체크), 사진이 있으면 함께 */
function rlist(f,o){const n=String(o.n).padStart(2,"0"),tall=o.items.length>4||o.items.some(x=>x[1])&&o.items.length>3||!!o.ph&&o.items.length>3;
  const rows=o.items.map(([a,b],k)=>`<div class="r-row">${o.check?rck:`<b class="r-no">${o.step&&f!=="pho"?"STEP ":""}${String(k+1).padStart(2,"0")}</b>`}<div><b ${E}>${esc(plain(a))}</b>${b?`<span ${E}>${esc(b)}</span>`:""}</div></div>`).join("");
  const pk=o.ph?ph(o.ph,o.src,"r-ph"):"";
  if(f==="dark"){const grid=!o.ph&&o.items.length===4&&o.items.every(x=>x[1]);
    return `<section class="r r-dark ${tall?"tall":""} ${o.ph?"wph":""}">${o.ph?`<div class="r-side">${pk}</div>`:""}<div class="r-num">${n}</div>
      <div class="r-in">${o.kick?`<div class="r-kick" ${E}>${esc(o.kick)}</div>`:""}${RT(o.t)}${o.para?`<div class="r-para" ${E}>${esc(o.para)}</div>`:""}<div class="${grid?"r-grid":"r-box"}">${rows}</div>${o.note?`<div class="r-note" ${E}>${esc(o.note)}</div>`:""}</div></section>`;}
  if(f==="beige")return `<section class="r r-beige ${tall?"tall":""}"><div class="r-in">${o.kick?`<div class="r-kick" ${E}>${esc(o.kick)}</div>`:""}${RT(o.t)}${o.para?`<div class="r-para" ${E}>${esc(o.para)}</div>`:""}
      ${o.ph?`<div class="r-phw">${pk}</div>`:""}<div class="r-cards">${rows}</div>${o.note?`<div class="r-note" ${E}>${esc(o.note)}</div>`:""}</div></section>`;
  return `<section class="r r-pho ${tall?"tall":""} ${o.ph?"wph":""}">${o.ph?`<div class="r-top">${pk}</div>`:""}<div class="r-in">${o.kick?`<div class="r-lab" ${E}>${esc(o.kick)}</div>`:""}${RT(o.t)}${o.para?`<div class="r-para" ${E}>${esc(o.para)}</div>`:""}
      <div class="r-lines">${rows}</div>${o.note?`<div class="r-note" ${E}>${esc(o.note)}</div>`:""}</div></section>`;}
/* 표지: 큰 제목 + 사진 */
function rcover(f,p,c,img){const t=p.hero.t,sub=p.warn.sub;
  if(f==="dark")return `<section class="r r-dark wph cover"><div class="r-side">${ph("person",img.person,"r-ph rq")}</div><div class="r-num">01</div>
    <div class="r-in"><div class="r-t xl"><div ${E}>${rem(plain(t[0]))}</div><div ${E}>${rem(plain(t[1]))}</div></div><div class="r-sub" ${E}>${esc(sub)}</div></div>
    <div class="r-tags">${p.warn.cards.slice(0,3).map(([,a])=>`<span ${E}>${esc(a)}</span>`).join("")}</div></section>`;
  if(f==="beige")return `<section class="r r-beige cover"><div class="r-in"><div class="r-t xl"><div ${E}>${esc(plain(t[0]))}</div><div ${E}>${rem(t[1]&&!/\[\[/.test(t[1])?"[["+t[1]+"]]":t[1])}</div></div>
    <div class="r-dash" ${E}>${esc(sub)}</div></div><div class="r-cvph">${ph("person",img.person,"r-ph rq")}</div><div class="r-cn">${rname(c)}</div></section>`;
  return `<section class="r r-pho cover">${ph("person",img.person,"r-ph full rq")}<div class="r-shade"></div><div class="r-cn tl">${rname(c)}</div>
    <div class="r-big"><div class="y" ${E}>${esc(plain(t[0]))}</div><div ${E}>${esc(plain(t[1]))}</div></div></section>`;}
/* 사진 한 장 + 짧은 설명 */
function rphoto(f,key,src,cap,sub){return `<section class="r r-phc ${f}">${ph(key,src,"r-ph full rq")}<div class="r-cap"><b ${E}>${esc(cap)}</b>${sub?`<span ${E}>${esc(sub)}</span>`:""}</div></section>`;}
function rdoc(f,d,k){return `<section class="r r-doc ${f}"><div class="r-dph">${ph("doc"+k,d.photo,"r-ph")}</div><div class="r-din"><span class="r-dtt" ${E}>${esc(d.title||"원장")}</span><div class="r-dn" ${E}>${esc(d.name)}</div><div class="r-dr" ${E}>${esc(d.role||"")}</div>
  ${(d.fields||[]).concat(d.history||[]).slice(0,6).map(x=>`<div class="r-dl" ${E}>${esc(x)}</div>`).join("")}</div></section>`;}
function rfac(f,c){const ps=(c.photos||[]).filter(x=>x&&x.url).slice(0,8),out=[];for(let i=0;i<ps.length;i+=4){const g=ps.slice(i,i+4);
  out.push(`<section class="r r-fac ${f}"><div class="r-fh" ${E}>${esc(c.name||"")} ${i?"시설 안내":"둘러보기"}</div><div class="r-fg n${g.length}">${g.map((x,k)=>`<div class="r-fi">${ph("fac"+(i+k),x.url,"r-ph")}<span ${E}>${esc(x.label||"시설")}</span></div>`).join("")}</div></section>`);}return out;}
function rinfo(f,c){const hs=(c.hours||[]).filter(h=>h&&h[1]),row=(l,v)=>`<div class="r-ir"><b>${l}</b><div>${v}</div></div>`;
  return `<section class="r r-info ${f}"><div class="r-in"><div class="r-kick" ${E}>진료 안내</div><div class="r-t"><div ${E}>${esc(c.name||"")}</div><div ${E}><b class="ra">진료시간 · 오시는 길</b></div></div>
  <div class="r-tab">${hs.length?row("진료시간",hs.map(h=>`<div><span ${E}>${esc(h[0])}</span> <b ${E}>${esc(h[1])}</b></div>`).join("")+(c.lunch?`<div><span>점심시간</span> <b ${E}>${esc(c.lunch)}</b></div>`:"")):""}
  ${c.tel?row("전화",`<b class="r-tel" ${E}>${esc(c.tel)}</b>`):""}${c.addr?row("주소",`<span ${E}>${esc(c.addr)}</span>${c.way?`<small ${E}>${esc(c.way)}</small>`:""}`):""}${c.parking?row("주차",`<span ${E}>${esc(c.parking)}</span>`):""}</div>
  ${mapb(c)}<div class="r-law" ${E}>모든 치료는 개인에 따라 차이가 있을 수 있고 부작용이 생길 수 있습니다. 반드시 의료진과 충분히 상담한 뒤 결정하시기 바랍니다.</div></div><div class="r-cn">${rname(c)}</div></section>`;}
/* 홈페이지에서 찾은 강점·장비로 '병원 소개' 목록 */
function aboutItems(c){const out=[];(c.why||[]).forEach(x=>out.push([plain(x),""]));if(out.length<2)(c.badges||[]).forEach(x=>out.push([plain(x),""]));
  if((c.equip||[]).length)out.push(["장비·시설",c.equip.slice(0,5).join(", ")]);return out.filter(x=>x[0]);}
function rbuild(o){const st=STYLES[o.style]||{},f=st.rf||"dark",p=T[o.topic]||T["기본"],c=o.clinic,img=o.img||{},on=o.on||{},out=[],tp=KEYOF(p),tn=tname(tp);let n=1;
  const add=(k,h)=>{if(on[k]!==false&&h)out.push(`<div class="blk" data-k="${k}">${h}</div>`);};
  const L=(k,o2)=>{n++;return rlist(f,Object.assign({n,c},o2));};
  add("hero",rcover(f,p,c,img));
  const ab=aboutItems(c);if(c.intro||ab.length)add("about",L("about",{kick:"병원 소개",t:[c.name||"저희 한의원",`[[${plain(c.slogan||"이런 곳이에요")}]]`].map(x=>String(x).slice(0,22)),para:c.intro||"",items:ab.slice(0,c.intro?3:4)}));
  add("warn",L("warn",{kick:"이런 증상, 그냥 두지 마세요",t:p.list.t,items:p.list.items.slice(0,5).map(([,t])=>[t,""]),check:1,ph:"band",src:img.band}));
  add("list",L("list",{kick:"왜 그럴까요?",t:p.warn.t,items:p.warn.cards.slice(0,4).map(([,a,b])=>[a,b])}));
  const rows=treatRows(p,c);
  add("treat",L("treat",{kick:(c.name?c.name+" ":"")+tn,t:[(c.name||"상태에 맞춘")+(c.name?"의":""),`[[${tp==="기본"?"맞춤 진료":tp+" 치료"}]]`],items:rows.map(([i,a])=>[a,tdOf(c,i,a)]),note:p.treat.note}));
  rows.forEach(([i,a],k)=>add("treat",rphoto(f,"treat"+k,img["treat"+k],a,tdOf(c,i,a))));
  add("person",L("person",{kick:"이런 분께 권해요",t:[tn,"이런 분께 [[필요해요]]"],items:p.person.sym.slice(0,4).map(([,t])=>[t+ro(t)+" 힘드신 분",""]),check:1}));
  add("time",L("time",{kick:"진료 과정",t:p.time.t,items:p.time.steps.map(([a,,t])=>[a,t]),step:1,note:p.time.note}));
  add("clinic",L("clinic",{kick:"약속드립니다",t:[(c.name||"저희 한의원")+"의",`[[진료 원칙]]`],items:feats(p,c).slice(0,4).map(([i,t])=>[plain(t),FD[i]||FD.check])}));
  (c.doctors||[]).filter(d=>d&&d.name).forEach((d,k)=>add("doc"+k,rdoc(f,d,k)));
  if(c.room&&c.room.on)add("room",L("room",{kick:"입원 치료",t:[c.name||"",`[[${plain(c.room.title||"입원치료")}]]`],items:(c.room.items||[]).slice(0,4).map(([,a,b])=>[a,b||""]).concat((c.room.items||[]).length?[]:[["가까이에서 살펴요","입원으로 상태를 자주 확인해요"]]),ph:"room",src:img.room||((c.photos||[])[0]||{}).url}));
  rfac(f,c).forEach(h=>add("facility",h));add("info",rinfo(f,c));return out.join("");}
/* ── 네이버 참고형: 네이버 한의원·한방병원 상위 글에서 고른 디자인 59장(design-ref/posts)을 구역 틀로 옮김.
   만들 때마다 구역마다 다른 틀을 골라 섞음(같은 틀이 한 장에 두 번 나오지 않게) ── */
const nT=(t,cls)=>`<div class="n-t ${cls||""}"><div ${E}>${rem(t[0])}</div>${t[1]?`<div ${E}>${rem(t[1])}</div>`:""}</div>`;
const nT2=t=>[plain(t[0]),t[1]&&!/\[\[/.test(t[1])?"[["+t[1]+"]]":t[1]];
const nNm=(c,cls)=>c.logo?`<img class="n-logo ${cls||""}" src="${esc(c.logo)}" alt="">`:c.name?`<span class="n-nm ${cls||""}" ${E}>${esc(c.name)}</span>`:"";
const nKick=(s,cls)=>s?`<div class="n-kick ${cls||""}" ${E}>${esc(s)}</div>`:"";
const nCk='<svg class="n-ck" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12.5l4 4 8-9"/></svg>';
const nLaw="모든 치료는 개인에 따라 차이가 있을 수 있고 부작용이 생길 수 있습니다. 반드시 의료진과 충분히 상담한 뒤 결정하시기 바랍니다.";
const nItem=([a,b],cls)=>`<b class="${cls||""}" ${E}>${esc(plain(a))}</b>${b?`<span ${E}>${esc(b)}</span>`:""}`;
/* 목록형 틀: o={kick,t,sub,items:[[제목,설명,아이콘]],ph,src,note,c} */
const NG={
  /* 체크 목록 */
  glass:o=>`<section class="n n-glass ${o.ph?"wph":""}">${o.ph?`<div class="n-side">${ph(o.ph,o.src,"n-ph")}</div>`:""}<div class="n-in"><div class="n-no">${nn(o.n-1)}</div>${nT(o.t,"xl")}
    <div class="n-gl">${o.items.slice(0,5).map(x=>`<div class="n-gr">${nCk}<div>${nItem(x)}</div></div>`).join("")}</div>${o.note?`<div class="n-note" ${E}>${esc(o.note)}</div>`:""}</div></section>`,
  clip:o=>`<section class="n n-clip"><div class="n-in">${nNm(o.c,"tl")}${nT(o.t,"c")}${o.sub?`<div class="n-sub c" ${E}>${esc(o.sub)}</div>`:""}
    <div class="n-c2">${o.items.slice(0,6).map(x=>`<div class="n-cr"><i class="n-sq">${nCk}</i><div>${nItem(x)}</div></div>`).join("")}</div></div>
    <div class="n-band"><i class="n-pin"></i><span ${E}>${esc(o.note||"증상이 잠시 나타났다 사라져도 의료진의 진료가 필요할 수 있습니다.")}</span></div></section>`,
  head:o=>`<section class="n n-head"><div class="n-hb">${nT(o.t,"c w")}${o.sub?`<div class="n-sub c w" ${E}>${esc(o.sub)}</div>`:""}</div><div class="n-in">
    <div class="n-pl">${o.items.slice(0,6).map(x=>`<div class="n-pr"><i class="n-cc">${nCk}</i><div>${nItem(x)}</div></div>`).join("")}</div>
    <div class="n-cta"><span ${E}>${o.items.length>3?"2가지 이상 해당된다면":"이런 증상이 이어진다면"} 상담을 권합니다</span><b ${E}>${esc(o.c.name?o.c.name+"에서 확인해 보세요":"가까운 의료기관에서 확인해 보세요")}</b></div></div></section>`,
  boxes:o=>`<section class="n n-boxes">${o.ph?ph(o.ph,o.src,"n-ph n-top"):""}<div class="n-panel">${nT(o.t,"m")}${o.sub?`<div class="n-sub" ${E}>${esc(o.sub)}</div>`:""}
    <div class="n-bx">${o.items.slice(0,6).map(x=>`<div class="n-bi"><i class="n-dot"></i><div>${nItem(x)}</div></div>`).join("")}</div>${o.note?`<div class="n-bn" ${E}>${esc(o.note)}</div>`:""}</div></section>`,
  paper:o=>`<section class="n n-paper"><div class="n-in">${nKick(o.kick)}${nT(o.t,"m")}<i class="n-rule"></i>
    ${o.items.slice(0,6).map(x=>`<div class="n-ppr"><i class="n-box"></i><div>${nItem(x)}</div></div>`).join("")}${o.note?`<div class="n-sm" ${E}>${esc(o.note)}</div>`:""}</div></section>`,
  /* 설명 카드 */
  bar:o=>`<section class="n n-bar"><div class="n-in">${nKick(o.kick,"red")}${nT(o.t,"m")}${o.para?`<div class="n-para" ${E}>${esc(o.para)}</div>`:""}
    ${o.items.slice(0,5).map((x,k)=>`<div class="n-br"><b class="n-num">${nn(k)}</b><div>${nItem(x)}</div></div>`).join("")}${o.note?`<div class="n-sm" ${E}>${esc(o.note)}</div>`:""}</div></section>`,
  bubble:o=>`<section class="n n-bubble"><div class="n-in">${nNm(o.c,"tl sm")}<div class="n-brk">${nT(o.t,"c")}</div>${o.sub||o.para?`<div class="n-sub c" ${E}>${esc(o.para||o.sub)}</div>`:""}
    <div class="n-bb n${Math.min(o.items.length,5)}">${o.items.slice(0,5).map(x=>`<div class="n-bc">${nItem(x)}</div>`).join("")}</div>${o.note?`<div class="n-pill" ${E}>${esc(o.note)}</div>`:""}</div></section>`,
  pills:o=>`<section class="n n-pills"><div class="n-in">${nKick(o.kick,"sm")}${nT(o.t,"m c")}
    ${o.items.slice(0,5).map((x,k)=>`<div class="n-plr"><b class="n-cn">${k+1}</b><div>${nItem(x,"a")}</div>${o.ic!==false?`<span class="n-ic">${icon(x[2]||"check")}</span>`:""}</div>`).join("")}<div class="n-foot">${nNm(o.c)}</div></div></section>`,
  icons:o=>`<section class="n n-icons"><div class="n-in"><div class="n-tab"><span ${E}>${esc(plain(o.t[0])+" "+plain(o.t[1]||""))}</span></div>
    ${o.items.slice(0,5).map(x=>`<div class="n-ir2"><span class="n-ci">${icon(x[2]||"check")}</span><div>${nItem(x,"a")}</div></div>`).join("")}${o.note?`<div class="n-sm" ${E}>${esc(o.note)}</div>`:""}<div class="n-foot">${nNm(o.c)}</div></div></section>`,
  marker:o=>`<section class="n n-marker"><div class="n-in">${nT(o.t,"c two")}
    ${o.items.slice(0,5).map((x,k)=>`<div class="n-mr"><b class="n-badge">${nn(k)}</b><div><b ${E}><i class="hl">${esc(plain(x[0]))}</i></b>${x[1]?`<span ${E}>${esc(x[1])}</span>`:""}</div></div>`).join("")}</div>
    <div class="n-strip">${o.c.name?`<span ${E}>${esc(o.c.name)}</span>`:""}</div></section>`,
  tabs:o=>`<section class="n n-tabs"><div class="n-in">${nT(o.t,"m")}<div class="n-tg">${o.items.slice(0,4).map(x=>`<div class="n-tc"><div class="n-th" ${E}>${esc(plain(x[0]))}</div>
    <div class="n-tb">${(x[1]?String(x[1]).split(/[·,]\s*|\s*\/\s*/).filter(Boolean).slice(0,3):[plain(x[0])]).map(s=>`<div>${nCk}<span ${E}>${esc(s)}</span></div>`).join("")}</div></div>`).join("")}</div>${o.note?`<div class="n-sm" ${E}>${esc(o.note)}</div>`:""}</div></section>`,
  /* 치료·표 */
  table:o=>`<section class="n n-table"><div class="n-in">${nKick(o.kick,"red")}${nT(o.t,"m")}<div class="n-tbl"><div class="n-trh"><span>항목</span><span>이렇게 도와요</span></div>
    ${o.items.slice(0,5).map(x=>`<div class="n-tr"><b ${E}>${esc(plain(x[0]))}</b><span ${E}>${esc(x[1]||"")}</span></div>`).join("")}</div>${o.note?`<div class="n-qt" ${E}>${esc(o.note)}</div>`:""}</div></section>`,
  stepr:o=>`<section class="n n-stepr">${o.ph?`<div class="n-bgph">${ph(o.ph,o.src,"n-ph")}</div>`:""}<div class="n-card">${nT(o.t,"thin")}${o.sub||o.para?`<div class="n-sub" ${E}>${esc(o.para||o.sub)}</div>`:""}</div>
    <div class="n-sp">${o.items.slice(0,5).map((x,k)=>`<div class="n-spr"><small>STEP ${nn(k)}</small><b ${E}>${esc(plain(x[0]))}</b></div>`).join("")}</div><div class="n-eng">${o.c.name?`<span ${E}>${esc(o.c.name)}</span>`:""}</div></section>`,
  stack:o=>`<section class="n n-stack">${o.ph?`<div class="n-fade">${ph(o.ph,o.src,"n-ph")}</div>`:""}<div class="n-in">${nKick(o.kick,"out")}${nT(o.t,"c heavy")}
    ${o.items.slice(0,4).map((x,k)=>`<div class="n-sk"><span class="n-lab">${k+1}${o.unit||"단계"}</span><div>${nItem(x)}</div></div>`).join("")}</div></section>`,
  frame:o=>`<section class="n n-frame"><div class="n-fr"><div class="n-lbl" ${E}>${esc(o.kick||"")}</div><div class="n-serif n-t m"><div ${E}>${esc(plain(o.t[0]))}</div>${o.t[1]?`<div ${E}>${esc(plain(o.t[1]))}</div>`:""}</div><i class="n-ul"></i>
    ${o.para?`<div class="n-para" ${E}>${esc(o.para)}</div>`:""}<div class="n-fb">${o.items.slice(0,4).map((x,k)=>`<div class="n-fbx ${k%2?"r":""}"><b ${E}>${esc(plain(x[0]))}</b>${x[1]?`<span ${E}>${esc(x[1])}</span>`:""}</div>`).join("")}</div>
    ${o.note?`<div class="n-sm c" ${E}>${esc(o.note)}</div>`:""}<div class="n-fn">${o.c.name?`<span ${E}>${esc(o.c.name)}</span>`:""}</div></div></section>`,
  feat:o=>`<section class="n n-feat"><div class="n-in">${nNm(o.c,"tl sm")}${nT(o.t,"m")}${o.ph?ph(o.ph,o.src,"n-ph n-fph"):""}
    ${o.items.slice(0,5).map((x,k)=>`<div class="n-ftr"><b class="n-cn">${nn(k)}</b><b ${E}>${esc(plain(x[0]))}</b></div>`).join("")}</div>
    <div class="n-dband"><span ${E}>${esc(o.note||"몸의 회복과 건강한 일상으로 함께 하겠습니다.")}</span>${nNm(o.c,"w")}</div></section>`,
  /* 순서 */
  tiles:o=>`<section class="n n-tiles"><div class="n-in">${nT(o.t,"m")}<div class="n-tl n${Math.min(o.items.length,4)}"><i class="n-line"></i>${o.items.slice(0,4).map((x,k)=>`<div class="n-tt"><div class="n-sqi">${icon(x[2]||["clipboard","doctor","needle","walk"][k])}</div>
    <b ${E}>Step ${k+1}. ${esc(plain(x[0]))}</b>${x[1]?`<span ${E}>${esc(x[1])}</span>`:""}</div>`).join("")}</div>${o.note?`<div class="n-sm c" ${E}>${esc(o.note)}</div>`:""}</div></section>`,
  arrows:o=>`<section class="n n-arrows"><div class="n-in">${nKick(o.kick,"out")}${nT(o.t,"c heavy")}<div class="n-ab">
    ${o.items.slice(0,5).map((x,k)=>`${k?'<i class="n-dw">↓</i>':""}<div class="n-ar"><b>STEP ${k+1}</b><span><b ${E}>${esc(plain(x[0]))}</b>${x[1]?` <em ${E}>— ${esc(x[1])}</em>`:""}</span></div>`).join("")}</div>${o.note?`<div class="n-sm c" ${E}>${esc(o.note)}</div>`:""}</div></section>`,
  notch:o=>`<section class="n n-notch"><div class="n-in">${nNm(o.c,"pillnm")}${nT(o.t,"c heavy")}
    ${o.items.slice(0,4).map((x,k)=>`<div class="n-nr"><b class="n-nc">${k+1}</b><b class="n-nl" ${E}>${esc(plain(x[0]))}</b><i></i><span ${E}>${esc(x[1]||"")}</span></div>`).join("")}${o.note?`<div class="n-sm c" ${E}>${esc(o.note)}</div>`:""}</div></section>`,
  /* 소개·약속 */
  cols:o=>`<section class="n n-cols"><div class="n-in"><div class="n-qm">“</div>${o.sub||o.kick?`<div class="n-sub c" ${E}>${esc(o.sub||o.kick)}</div>`:""}${nT(o.t,"c heavy")}${o.para?`<div class="n-box2" ${E}>${esc(o.para)}</div>`:""}
    <div class="n-cl n${Math.min(o.items.length,4)}">${o.items.slice(0,4).map(x=>`<div class="n-cc2"><span class="n-ci">${icon(x[2]||"check")}</span><b ${E}>${esc(plain(x[0]))}</b>${x[1]?`<span ${E}>${esc(x[1])}</span>`:""}</div>`).join("")}</div>
    <div class="n-okb">${nCk}<span ${E}>${esc(o.note||"불편함을 줄이고 편안한 일상을 보내실 수 있도록 함께 하겠습니다.")}</span></div><div class="n-foot">${nNm(o.c)}</div></div></section>`,
  quote:o=>`<section class="n n-quote"><div class="n-qph">${ph(o.ph||"band",o.src,"n-ph")}</div><div class="n-qin"><div class="n-qm">“</div>${nT(o.t,"q")}<div class="n-qm r">”</div>
    ${o.items.slice(0,3).map(x=>`<div class="n-ql">${nItem(x)}</div>`).join("")}<div class="n-foot r">${nNm(o.c)}</div></div></section>`,
  green:o=>`<section class="n n-green"><div class="n-in">${nNm(o.c,"c big")}${nT(o.t,"c")}${o.para?`<div class="n-sub c" ${E}>${esc(o.para)}</div>`:""}
    <div class="n-g2">${o.items.slice(0,4).map(x=>`<div class="n-gc">${nCk}<div>${nItem(x)}</div></div>`).join("")}</div></div>
    <div class="n-gb"><div ${E}>${o.items.slice(0,3).map(x=>`<b>${esc(plain(x[0]))}</b>`).join(" <i>|</i> ")}</div>${o.c.addr?`<span ${E}>${esc(o.c.addr)}</span>`:""}</div></section>`,
  list3:o=>`<section class="n n-list3">${o.ph?`<div class="n-lph">${ph(o.ph,o.src,"n-ph")}</div>`:""}<div class="n-lin">${nT(o.t,"s")}
    ${o.items.slice(0,4).map((x,k)=>`<div class="n-l3"><i></i><b ${E}>${nn(k)} ${esc(plain(x[0]))}</b>${x[1]?`<span ${E}>${esc(x[1])}</span>`:""}</div>`).join("")}${o.note?`<div class="n-sm" ${E}>${esc(o.note)}</div>`:""}</div></section>`
};
/* 표지 */
const NH=[
  (p,c,img,kw)=>`<section class="n n-hed"><div class="n-in"><div class="n-kick out red" ${E}>${esc(kw)}</div><div class="n-t xl"><div ${E}>${esc(plain(p.hero.t[0]))}</div><div ${E}>${rem(nT2(p.hero.t)[1])}</div></div>
    <div class="n-sub" ${E}>${esc(p.warn.sub)}</div><i class="n-rule n-rs"></i>${c.name?`<div class="n-mk"><i>${esc(c.name.slice(0,1))}</i><span ${E}>${esc(c.name)}</span></div>`:nNm(c)}</div><div class="n-wm">${esc((c.name||"").slice(0,2))}</div></section>`,
  (p,c,img)=>`<section class="n n-hpr"><div class="n-hph">${ph("person",img.person,"n-ph rq")}</div><div class="n-in"><div class="n-t xxl"><div ${E}>${esc(plain(p.hero.t[0]))}</div><div class="lt" ${E}>${esc(plain(p.hero.t[1]))}</div></div>
    <div class="n-lb" ${E}>${esc(p.warn.sub)}</div></div><div class="n-hn">${nNm(c)}</div></section>`,
  (p,c,img)=>`<section class="n n-hdk">${ph("person",img.person,"n-ph full rq")}<div class="n-shade"></div><div class="n-vl"><div class="n-t c w"><div ${E}>${esc(plain(p.hero.t[0]))}</div><div ${E}>${esc(plain(p.hero.t[1]))}</div></div></div><div class="n-hn c w">${nNm(c,"w")}</div></section>`,
  (p,c,img,kw)=>`<section class="n n-hnv"><div class="n-in">${c.name||c.logo?`<div class="n-wpill">${nNm(c)}</div>`:""}<div class="n-gpill" ${E}>${esc(kw)}</div>
    <div class="n-t c w xl"><div ${E}>${esc(plain(p.hero.t[0]))},</div><div ${E}><b class="ra">${esc(plain(p.hero.t[1]))}</b></div></div><i class="n-gr2"></i><div class="n-sub c w" ${E}>${esc(p.warn.sub)}</div></div></section>`,
  (p,c,img,kw)=>`<section class="n n-hcard">${ph("person",img.person,"n-ph full rq")}<div class="n-pc"><div class="n-sm c" ${E}>정보 안내</div><div class="n-serif n-pcn" ${E}>${esc(c.name||kw)}</div>
    <div class="n-pct" ${E}>${esc(plain(p.hero.t[0])+" "+plain(p.hero.t[1]))}</div><div class="n-sm c" ${E}>${esc(p.warn.cards.slice(0,3).map(x=>x[1]).join(" · "))}</div></div></section>`,
  (p,c,img)=>`<section class="n n-hbox">${ph("person",img.person,"n-ph full rq")}<div class="n-shade lt"></div><div class="n-bxs"><span ${E}>${esc(plain(p.hero.t[0]))}</span><span ${E}>${esc(plain(p.hero.t[1]))}</span></div><div class="n-hn w">${nNm(c,"w")}</div></section>`,
  (p,c,img,kw)=>`<section class="n n-hwin"><div class="n-win"><div class="n-dots"><i></i><i></i><i></i></div><div class="n-t c xl heavy"><div ${E}>${esc(plain(p.hero.t[0]))}</div><div ${E}>${esc(plain(p.hero.t[1]))}</div></div>
    <i class="n-dash"></i><div class="n-hl"><span ${E}>${esc(c.name||kw)}</span></div></div></section>`
];
/* 원장 */
const ND=[
  (d,k,c)=>`<section class="n n-doc1"><div class="n-in">${nNm(c,"tl sm")}<div class="n-t xl"><div ${E}>${esc(d.title||"대표원장")} <b class="ra">약력</b></div></div><div class="n-dnm"><span ${E}>${esc(d.role||"한의사")}</span> <i class="hl" ${E}>${esc(d.name)}</i></div>
    <ul>${(d.fields||[]).concat(d.history||[]).slice(0,6).map(x=>`<li ${E}>${esc(x)}</li>`).join("")}</ul></div><div class="n-dph">${ph("doc"+k,d.photo,"n-ph")}</div></section>`,
  (d,k,c)=>`<section class="n n-doc2">${ph("doc"+k,d.photo,"n-ph full")}<div class="n-dcard"><small ${E}>${esc(c.name||"")}</small><div class="n-dn" ${E}>${esc(d.name)}</div><div class="n-dr" ${E}>${esc(d.title||"대표원장")}${d.role?" · "+esc(d.role):""}</div><i class="n-rule n-rs"></i>
    ${(d.fields||[]).concat(d.history||[]).slice(0,5).map(x=>`<div class="n-dl"><i></i><span ${E}>${esc(x)}</span></div>`).join("")}</div></section>`
];
/* 치료 사진 한 장 */
const NP=[
  (key,src,a,b)=>`<section class="n n-pfl">${ph(key,src,"n-ph full rq")}<div class="n-fc"><b ${E}>${esc(a)}</b>${b?`<span ${E}>${esc(b)}</span>`:""}<i class="n-dd"></i></div></section>`,
  (key,src,a,b)=>`<section class="n n-ptop"><div class="n-tp">${ph(key,src,"n-ph rq")}</div><div class="n-tx"><b ${E}>${esc(a)}</b>${b?`<span ${E}>${esc(b)}</span>`:""}</div></section>`,
  (key,src,a,b)=>`<section class="n n-pgr">${ph(key,src,"n-ph full rq")}<div class="n-gr3"></div><div class="n-gt"><i></i><b ${E}>${esc(a)}</b>${b?`<span ${E}>${esc(b)}</span>`:""}</div></section>`
];
/* 진료 안내 */
function nHours(c){const hs=(c.hours||[]).filter(h=>h&&h[1]);return hs.map(h=>`<div class="n-hr"><span ${E}>${esc(h[0])}</span><b ${E}>${esc(h[1])}</b></div>`).join("")+(c.lunch?`<div class="n-hr"><span>점심시간</span><b ${E}>${esc(c.lunch)}</b></div>`:"");}
const nRows=c=>`${c.tel?`<div class="n-ir"><span class="n-ii">${icon("phone")}</span><b class="n-tel" ${E}>${esc(c.tel)}</b></div>`:""}${c.addr?`<div class="n-ir"><span class="n-ii">${icon("pin")}</span><span ${E}>${esc(c.addr)}${c.way?`<small ${E}>${esc(c.way)}</small>`:""}</span></div>`:""}${c.parking?`<div class="n-ir"><span class="n-ii">${icon("parking")}</span><span ${E}>${esc(c.parking)}</span></div>`:""}`;
const NI=[
  c=>{const hs=(c.hours||[]).filter(h=>h&&h[1]),ic=["calendar","calendar","calendar","clock"];return `<section class="n n-ihr"><div class="n-in"><div class="n-sm c" ${E}>${esc(c.name||"")}</div><div class="n-serif n-t c m" ${E}>진료시간 안내</div><i class="n-ul c"></i>
    <div class="n-ihl">${hs.map((h,k)=>`<div class="n-ihi"><span class="n-ci">${icon(ic[k]||"calendar")}</span><div><b ${E}>${esc(h[0])}</b><span ${E}>${esc(h[1])}</span></div></div>`).join("")}${c.lunch?`<div class="n-ihi"><span class="n-ci">${icon("clock")}</span><div><b>점심시간</b><span ${E}>${esc(c.lunch)}</span></div></div>`:""}</div>
    <div class="n-irs">${nRows(c)}</div>${mapb(c)}<div class="n-law" ${E}>${nLaw}</div></div></section>`;},
  c=>`<section class="n n-cal"><div class="n-in"><div class="n-calc"><div class="n-rings">${"<i></i>".repeat(12)}</div><div class="n-calt" ${E}>${esc((c.name||"")+" 진료시간")}</div>${nHours(c)}</div>
    <div class="n-irs">${nRows(c)}</div>${mapb(c)}<div class="n-law" ${E}>${nLaw}</div></div></section>`,
  c=>`<section class="n n-navy"><div class="n-in">${nNm(c,"tl")}<div class="n-np"><div class="n-nh"><b>진료시간</b><div>${nHours(c)}</div></div><div class="n-irs w">${nRows(c)}</div></div>${mapb(c)}<div class="n-law" ${E}>${nLaw}</div></div></section>`,
  c=>`<section class="n n-split"><div class="n-sl"><div class="n-snm" ${E}>${esc(c.name||"")}</div>${c.addr?`<div class="n-sa" ${E}>${esc(c.addr)}</div>`:""}${c.tel?`<div class="n-stel" ${E}>${esc(c.tel)}</div>`:""}</div>
    <div class="n-sr"><div class="n-sh" ${E}>진료시간</div>${nHours(c)}${c.parking?`<div class="n-sm" ${E}>주차 · ${esc(c.parking)}</div>`:""}</div><div class="n-sm2">${mapb(c)}<div class="n-law" ${E}>${nLaw}</div></div></section>`,
  c=>`<section class="n n-big"><div class="n-in"><div class="n-qm">“</div><div class="n-bq" ${E}>${esc(c.station&&c.walk?`${c.station} ${c.walk},`:c.addr?c.addr+",":"")}<br>${c.name?`<b class="ra">${esc(c.name)}</b>이 있습니다.`:""}</div><i class="n-rule"></i>
    <div class="n-bh">${(c.hours||[]).filter(h=>h&&h[1]).map(h=>`<div ${E}>${esc(h[0])} ${esc(h[1])}</div>`).join("")}${c.lunch?`<div class="it" ${E}>점심시간 ${esc(c.lunch)}</div>`:""}</div>
    ${c.tel?`<div class="n-bt" ${E}>T. ${esc(c.tel)}</div>`:""}${c.parking?`<div class="n-sm" ${E}>주차 · ${esc(c.parking)}</div>`:""}${mapb(c)}<div class="n-law" ${E}>${nLaw}</div></div></section>`
];
/* 고르기: look.seed로 구역마다 틀을 정하고, 한 장에 같은 틀은 한 번만 */
function nrng(seed){let s=(Math.imul((seed>>>0)||1,2654435761)^0x9e3779b9)>>>0||1;const f=()=>{s^=s<<13;s>>>=0;s^=s>>17;s^=s<<5;s>>>=0;return s/4294967296;};for(let i=0;i<6;i++)f();return f;}
const NPOOL={warn:["glass","clip","head","boxes","paper"],person:["head","paper","clip","glass","boxes"],list:["bar","bubble","pills","icons","marker","tabs"],about:["green","bar","icons","cols"],
  treat:["table","stepr","stack","frame","feat","pills"],time:["tiles","arrows","notch","stack"],clinic:["cols","quote","marker","icons","bar","list3"],room:["boxes","feat","list3"]};
function nbuild(o){const p=T[o.topic]||T["기본"],c=o.clinic,img=o.img||{},on=o.on||{},out=[],tp=KEYOF(p),tn=tname(tp),look=o.look||{},R=nrng(look.seed||Date.now()),used=new Set();let n=1;
  const add=(k,h)=>{if(on[k]!==false&&h)out.push(`<div class="blk" data-k="${k}">${h}</div>`);};
  const pick=sec=>{const pool=NPOOL[sec].filter(x=>!used.has(x)),a=pool.length?pool:NPOOL[sec],v=a[Math.floor(R()*a.length)];used.add(v);return v;};
  const G=(sec,o2)=>{n++;return NG[pick(sec)](Object.assign({n,c},o2));};
  const kw=(tp==="기본"?"건강":tp)+" 가이드";
  add("hero",NH[Math.floor(R()*NH.length)](p,c,img,kw));
  const ab=aboutItems(c);if(c.intro||ab.length)add("about",G("about",{kick:"병원 소개",sub:"병원 소개",t:[c.name||"저희 한의원",`[[${plain(c.slogan||"이런 곳이에요")}]]`].map(x=>String(x).slice(0,24)),para:c.intro||"",items:ab.slice(0,4).map((x,i)=>[x[0],x[1],featIcon(x[0])])}));
  add("warn",G("warn",{kick:"이런 증상, 그냥 두지 마세요",t:p.list.t,sub:p.warn.sub,items:p.list.items.slice(0,5).map(([i,t])=>[t,"",i]),ph:"band",src:img.band,note:p.list.note}));
  add("list",G("list",{kick:"왜 그럴까요?",t:p.warn.t,sub:p.warn.sub,items:p.warn.cards.slice(0,4).map(([i,a,b])=>[a,b,i])}));
  const rows=treatRows(p,c);
  add("treat",G("treat",{kick:(c.name?c.name+" ":"")+tn,t:[(c.name||"상태에 맞춘")+(c.name?"의":""),`[[${tp==="기본"?"맞춤 진료":tp+" 치료"}]]`],items:rows.map(([i,a])=>[a,tdOf(c,i,a),i]),note:p.treat.note,ph:"treat0",src:img.treat0,unit:"",c}).replace('<span class="n-lab">1</span>','<span class="n-lab">1</span>'));
  const pv=Math.floor(R()*NP.length);rows.forEach(([i,a],k)=>{if(!out.join("").includes(`data-ph="treat${k}"`))add("treat",NP[(pv+k)%NP.length]("treat"+k,img["treat"+k],a,tdOf(c,i,a)));});
  add("person",G("person",{kick:"이런 분께 권해요",t:[tn,"이런 분께 [[필요해요]]"],sub:p.person.sub,items:p.person.sym.slice(0,4).map(([i,t])=>[t+ro(t)+" 힘드신 분","",i])}));
  add("time",G("time",{kick:"진료 과정",t:p.time.t,items:p.time.steps.map(([a,i,t])=>[a,t,i]),note:p.time.note,ph:"band2",src:img.band}));
  add("clinic",G("clinic",{kick:"약속드립니다",sub:"약속드립니다",t:[(c.name||"저희 한의원")+"의",`[[진료 원칙]]`],items:feats(p,c).slice(0,4).map(([i,t])=>[plain(t),FD[i]||FD.check,i]),ph:"band3",src:((c.photos||[])[0]||{}).url||img.band}));
  const dv=Math.floor(R()*ND.length);(c.doctors||[]).filter(d=>d&&d.name).forEach((d,k)=>add("doc"+k,ND[d.photo?(dv+k)%ND.length:0](d,k,c)));
  if(c.room&&c.room.on)add("room",G("room",{kick:"입원 치료",t:[c.name||"",`[[${plain(c.room.title||"입원치료")}]]`],items:(c.room.items||[]).slice(0,4).map(([i,a,b])=>[a,b||"",i]).concat((c.room.items||[]).length?[]:[["가까이에서 살펴요","입원으로 상태를 자주 확인해요","bedplus"]]),ph:"room",src:img.room||((c.photos||[])[0]||{}).url}));
  rfac("beige",c).forEach(h=>add("facility",h));add("info",NI[Math.floor(R()*NI.length)](c));return out.join("");}
const N_CSS=`
.bi[class*="st-ref"]{background:#fff}.bi[class*="st-ref"] .blk+.blk{margin-top:14px}.bi[class*="st-ref"]{--rbg:var(--nb);--rink:var(--nk)}
.bi .n{position:relative;width:860px;min-height:860px;overflow:hidden;background:var(--nb);color:var(--nk);font-family:"Pretendard Variable",Pretendard,sans-serif;letter-spacing:-.03em;text-align:left;display:flex;flex-direction:column;justify-content:center}
.bi .n .ph{border-radius:0;margin:0}.bi .n .ph img{width:100%;height:100%;object-fit:cover;display:block}.bi .n .n-ph.full{position:absolute;inset:0;width:100%;height:100%}
.bi .n-in{position:relative;padding:76px 70px 70px;z-index:2}
.bi .n-t{font-weight:800;font-size:54px;line-height:1.25;letter-spacing:-.045em;word-break:keep-all}.bi .n-t.m{font-size:50px}.bi .n-t.s{font-size:36px}.bi .n-t.xl{font-size:68px;line-height:1.2}.bi .n-t.xxl{font-size:84px;line-height:1.15}
.bi .n-t.c{text-align:center}.bi .n-t.w{color:#fff}.bi .n-t.heavy{font-weight:900}.bi .n-t.thin{font-weight:400}.bi .n-t.thin .ra{font-weight:700}
.bi .n .ra{color:var(--na);font-weight:inherit}.bi .n-t.w .ra{color:var(--na2)}
.bi .n-kick{display:inline-block;font-size:24px;font-weight:700;color:var(--na);margin-bottom:22px}.bi .n-kick.red{color:var(--nr,var(--na))}.bi .n-kick.sm{font-size:22px;color:#888}
.bi .n-kick.out{border:2px solid currentColor;border-radius:99px;padding:8px 26px;color:var(--nk)}.bi .n-kick.out.red{color:var(--nr,var(--na))}
.bi .n-in>.n-kick.out{display:table;margin-left:auto;margin-right:auto}.bi .n-hed .n-in>.n-kick.out{margin-left:0}
.bi .n-sub{font-size:25px;line-height:1.6;color:var(--nk);opacity:.78;margin-top:22px;word-break:keep-all}.bi .n-sub.c{text-align:center}.bi .n-sub.w{color:#fff;opacity:.9}
.bi .n-para{font-size:24px;line-height:1.65;opacity:.8;margin:20px 0 6px;word-break:keep-all}
.bi .n-sm{font-size:19px;opacity:.6;margin-top:26px;line-height:1.5;word-break:keep-all}.bi .n-sm.c{text-align:center}
.bi .n-rule{display:block;height:2px;background:var(--na);opacity:.6;margin:30px 0}.bi .n-rule.n-rs{width:64px;height:4px;opacity:1}
.bi .n-nm{font-size:24px;font-weight:800;color:var(--nk)}.bi .n-nm.w{color:#fff}.bi .n-logo{max-height:56px;max-width:300px;object-fit:contain}.bi .n-nm.tl,.bi .n-logo.tl{display:block;margin-bottom:26px}.bi .n-nm.sm{font-size:19px;opacity:.6}
.bi .n-nm.c,.bi .n-logo.c{display:block;text-align:center;margin:0 auto 24px}.bi .n-nm.big{font-size:40px;color:var(--na)}
.bi .n-foot{margin-top:34px;text-align:center}.bi .n-foot.r{text-align:right}
.bi .n-ck{width:30px;height:30px;flex:none}
.bi .n b,.bi .n span{word-break:keep-all}
/* 표지 */
.bi .n-hed{background:linear-gradient(160deg,var(--nl),var(--nb))}.bi .n-hed .n-t div:first-child{color:var(--nk)}.bi .n-hed .n-t .ra{color:var(--nr,var(--na))}
.bi .n-hed .n-sub{font-size:28px}.bi .n-mk{display:flex;align-items:center;gap:14px;font-size:28px;font-weight:800}.bi .n-mk i{width:44px;height:44px;border-radius:8px;background:var(--nr,var(--na));color:#fff;display:grid;place-items:center;font-style:normal;font-size:22px}
.bi .n-wm{position:absolute;right:30px;bottom:10px;font-size:150px;font-weight:900;color:var(--na);opacity:.07;font-family:"Nanum Myeongjo",serif}
.bi .n-hpr{background:linear-gradient(180deg,var(--nl),var(--nb));justify-content:flex-start;height:860px}.bi .n-hph{position:absolute;right:0;bottom:0;width:58%;height:66%}
.bi .n-hph .ph{width:100%;height:100%;-webkit-mask-image:linear-gradient(100deg,transparent 0,#000 38%);mask-image:linear-gradient(100deg,transparent 0,#000 38%)}
.bi .n-hpr .n-t div{color:var(--nd)}.bi .n-hpr .n-t .lt{font-weight:400;color:var(--na)}.bi .n-lb{margin-top:46px;border-left:4px solid var(--na);padding-left:22px;font-size:25px;line-height:1.6;max-width:420px;opacity:.8}
.bi .n-hn{position:absolute;left:70px;bottom:60px;z-index:3}.bi .n-hn.c{left:0;right:0;text-align:center}
.bi .n-hdk,.bi .n-hcard,.bi .n-hbox,.bi .n-pfl,.bi .n-pgr{height:860px;background:#222}
.bi .n-shade{position:absolute;inset:0;background:rgba(10,10,10,.55)}.bi .n-shade.lt{background:linear-gradient(0deg,rgba(0,0,0,.35),rgba(0,0,0,.05))}
.bi .n-vl{position:relative;z-index:2;margin:0 auto;border-left:2px solid rgba(255,255,255,.7);border-right:2px solid rgba(255,255,255,.7);padding:20px 48px;max-width:640px}.bi .n-vl .n-t{font-size:56px;line-height:1.35}
.bi .n-hnv{background:var(--nd)}.bi .n-hnv .n-in{text-align:center}.bi .n-wpill{display:inline-block;background:#fff;border-radius:99px;padding:14px 40px;margin-bottom:60px}.bi .n-wpill .n-nm{font-size:30px;color:var(--nd)}
.bi .n-gpill{display:table;margin:0 auto 36px;background:var(--na2);color:var(--nd);font-weight:800;font-size:24px;border-radius:99px;padding:8px 26px}.bi .n-gr2{display:block;width:200px;height:3px;background:var(--na2);margin:40px auto 0}
.bi .n-pc{position:relative;z-index:2;margin:0 auto;width:600px;background:#f6f1e7;border:2px solid #8a7a66;outline:2px solid #8a7a66;outline-offset:-14px;padding:70px 50px;text-align:center;color:#3a2e24}
.bi .n-pcn{font-size:44px;font-weight:800;margin:20px 0;color:var(--nr,#7a3b25)}.bi .n-pct{font-size:26px;margin-bottom:16px}
.bi .n-bxs{position:relative;z-index:2;padding:0 40px;display:flex;flex-direction:column;align-items:flex-start;gap:8px}.bi .n-bxs span{background:#f7eee4;color:#3d2414;font-weight:900;font-size:92px;line-height:1.08;padding:6px 18px;letter-spacing:-.06em}
.bi .n-hwin{background:var(--na2);height:860px}.bi .n-win{margin:0 auto;width:700px;background:#fff;border-radius:22px;box-shadow:0 18px 40px rgba(0,0,0,.15);padding:0 50px 60px;overflow:hidden}
.bi .n-dots{margin:0 -50px 60px;background:var(--nl);height:44px;display:flex;gap:10px;align-items:center;padding-left:24px}.bi .n-dots i{width:12px;height:12px;border-radius:50%;background:var(--na)}.bi .n-dots i+i{opacity:.6}.bi .n-dots i+i+i{opacity:.35}
.bi .n-win .n-t{color:var(--nd);font-size:76px}.bi .n-dash{display:block;border-top:3px dotted #bbb;margin:44px 0 34px}.bi .n-hl{text-align:center}.bi .n-hl span,.bi .n i.hl{font-style:normal;background:linear-gradient(transparent 55%,var(--na2) 55%);padding:0 6px;font-size:34px;font-weight:800}
/* 체크 목록 */
.bi .n-glass{background:radial-gradient(120% 90% at 85% 30%,var(--nd2,#4d382c),var(--nd) 70%);color:#f5ece3;height:860px}.bi .n-glass.wph .n-in{max-width:560px}
.bi .n-side{position:absolute;right:0;top:0;bottom:0;width:58%}.bi .n-side .ph{width:100%;height:100%;-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 45%);mask-image:linear-gradient(90deg,transparent 0,#000 45%)}
.bi .n-no{position:absolute;top:30px;left:70px;font-size:26px;color:var(--na2);font-weight:700}.bi .n-glass .n-t{color:#fff}.bi .n-glass .ra{color:var(--na2)}
.bi .n-gl{margin-top:40px;border:1px solid rgba(255,255,255,.22);border-radius:22px;background:rgba(255,255,255,.07);padding:10px 26px}
.bi .n-gr{display:flex;gap:18px;align-items:center;padding:20px 0;font-size:26px}.bi .n-gr+.n-gr{border-top:1px solid rgba(255,255,255,.15)}.bi .n-gr .n-ck{color:var(--na2)}.bi .n-gr b{font-weight:500}
.bi .n-note{margin-top:26px;font-size:20px;opacity:.7}
.bi .n-clip{background:linear-gradient(135deg,#fafafa,#eef0ef)}.bi .n-clip .n-t div+div{font-weight:500;font-size:.8em}
.bi .n-c2{display:grid;grid-template-columns:1fr 1fr;gap:0 40px;margin-top:40px}.bi .n-cr{display:flex;gap:14px;align-items:center;padding:20px 0;border-bottom:1px dashed #c8cfcb;font-size:24px}
.bi .n-sq{width:30px;height:30px;border:2px solid var(--na);color:var(--na);display:grid;place-items:center;font-style:normal;flex:none}.bi .n-sq .n-ck{width:20px;height:20px}
.bi .n-band{background:var(--nd);color:#fff;padding:34px 70px;font-size:24px;font-weight:600;position:relative}
.bi .n-head .n-hb{background:linear-gradient(180deg,var(--nd),var(--na));padding:60px 60px 54px}.bi .n-head .n-in{padding-top:44px}
.bi .n-pr{display:flex;gap:18px;align-items:center;background:var(--nl);border-radius:12px;padding:20px 26px;margin-bottom:14px;font-size:25px}.bi .n-cc{width:38px;height:38px;border-radius:50%;background:var(--na);color:#fff;display:grid;place-items:center;font-style:normal;flex:none}.bi .n-cc .n-ck{width:22px;height:22px}
.bi .n-cta{margin-top:30px;background:var(--nd);color:#fff;border-radius:18px;padding:26px;text-align:center;font-size:24px;line-height:1.6}.bi .n-cta b{display:block;color:var(--na2);font-size:26px}
.bi .n-boxes{justify-content:center}.bi .n-boxes:has(>.n-top){justify-content:flex-start}.bi .n .n-top{height:330px;width:100%}
.bi .n-panel{position:relative;z-index:2;margin:50px 40px 50px;background:var(--nl);border:1px solid rgba(0,0,0,.08);border-radius:22px;padding:44px 40px}
.bi .n-top+.n-panel{margin-top:-50px}
.bi .n-bx{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:30px}.bi .n-bi{display:flex;gap:14px;align-items:flex-start;border:1px solid rgba(0,0,0,.12);border-radius:12px;padding:20px;font-size:23px;background:#fff}
.bi .n-bi span,.bi .n-cr span,.bi .n-pr span,.bi .n-gr span,.bi .n-ppr span{display:block;font-size:19px;opacity:.65;margin-top:4px;font-weight:400}
.bi .n-dot{width:20px;height:20px;border-radius:50%;background:var(--nd);flex:none;margin-top:5px}.bi .n-bn{margin-top:20px;background:#fff;border-radius:12px;padding:18px 22px;font-size:21px;font-weight:600;color:var(--nd)}
.bi .n-paper{background:var(--nl)}.bi .n-paper .n-rule{margin:24px 0 30px;height:3px}.bi .n-ppr{display:flex;gap:20px;align-items:center;background:#fff;border:1px solid rgba(0,0,0,.08);border-radius:10px;padding:22px 26px;margin-bottom:14px;font-size:25px}
.bi .n-box{width:28px;height:28px;border:2.5px solid var(--nd);border-radius:6px;flex:none}
/* 설명 카드 */
.bi .n-bar{background:linear-gradient(170deg,var(--nl),var(--nb))}.bi .n-br{display:flex;gap:22px;background:#fff;border-left:5px solid var(--na);padding:24px 28px;margin-top:16px;box-shadow:0 6px 16px rgba(60,40,20,.08);font-size:26px}
.bi .n-num{font-family:"Nanum Myeongjo",serif;color:var(--na);font-size:28px;font-weight:400}.bi .n-br span{display:block;font-size:20px;opacity:.65;margin-top:8px;line-height:1.5}
.bi .n-bubble{background:radial-gradient(circle at 50% 30%,var(--nl),var(--nb))}.bi .n-brk{position:relative;padding:0 50px}.bi .n-brk:before,.bi .n-brk:after{content:"";position:absolute;top:-6px;bottom:-6px;width:20px;border:7px solid var(--nd)}.bi .n-brk:before{left:0;border-right:0}.bi .n-brk:after{right:0;border-left:0}
.bi .n-bb{display:flex;flex-wrap:wrap;justify-content:center;gap:20px;margin-top:40px}.bi .n-bc{width:220px;height:220px;border-radius:50%;background:#fff;box-shadow:0 8px 20px rgba(0,0,0,.06);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:20px;font-size:25px}
.bi .n-bc span{display:block;font-size:17px;opacity:.65;margin-top:8px;line-height:1.4}.bi .n-bb.n4 .n-bc{width:330px;height:150px;border-radius:80px}
.bi .n-pill{margin-top:30px;background:var(--nd);color:#fff;border-radius:99px;padding:18px;text-align:center;font-size:22px;font-weight:600}
.bi .n-pills{background:#fff}.bi .n-plr{display:flex;align-items:center;gap:22px;background:linear-gradient(90deg,var(--nl),#fff);border-radius:99px;padding:14px 26px 14px 14px;margin-top:20px;font-size:28px}
.bi .n-cn{width:54px;height:54px;border-radius:50%;background:var(--na);color:#fff;display:grid;place-items:center;flex:none;font-size:24px}.bi .n-plr>div{flex:1}.bi .n-plr b.a{color:var(--na)}.bi .n-plr span{display:block;font-size:19px;opacity:.6;margin-top:4px}
.bi .n-ic{width:64px;height:64px;color:var(--na);opacity:.85}.bi .n-ic .ic{width:100%;height:100%}
.bi .n-icons{background:#fff}.bi .n-tab{text-align:center;margin-bottom:26px}.bi .n-tab span{display:inline-block;background:var(--nd);color:#fff;font-size:30px;font-weight:800;border-radius:99px;padding:14px 40px}
.bi .n-ir2{display:flex;gap:26px;align-items:center;padding:22px 0;border-bottom:1px solid #e6e8ee;font-size:30px}.bi .n-ci{width:96px;height:96px;border-radius:50%;background:var(--nl);color:var(--na);display:grid;place-items:center;flex:none}.bi .n-ci .ic{width:52px;height:52px}
.bi .n-ir2 b.a{color:var(--nd);font-weight:800}.bi .n-ir2 span{display:block;font-size:21px;opacity:.7;margin-top:6px}
.bi .n-marker{background:linear-gradient(180deg,#f8f8f6,var(--nb))}.bi .n-t.two div:first-child{color:var(--na);font-weight:500}.bi .n-t.two div+div{color:var(--nd)}
.bi .n-mr{position:relative;background:var(--nl);padding:22px 26px 22px 70px;margin:26px 0 0 30px;font-size:26px}.bi .n-badge{position:absolute;left:-28px;top:12px;width:56px;height:56px;border-radius:50%;background:var(--nd);color:#fff;display:grid;place-items:center;font-size:20px;border:4px solid #fff}
.bi .n-mr span{display:block;font-size:19px;opacity:.65;margin-top:8px}.bi .n-strip{background:var(--na);color:#fff;text-align:center;padding:22px;font-size:20px;letter-spacing:.2em;min-height:20px}
.bi .n-tabs{background:repeating-linear-gradient(45deg,var(--nb) 0 18px,var(--nl) 18px 19px)}.bi .n-tg{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:40px}
.bi .n-tc{background:#fff;border-radius:6px;box-shadow:0 6px 16px rgba(0,0,0,.08);border-top:8px solid var(--na);overflow:hidden}.bi .n-th{font-weight:800;font-size:26px;padding:22px 24px 12px}
.bi .n-tb{padding:0 24px 22px;font-size:20px}.bi .n-tb div{display:flex;gap:10px;align-items:flex-start;margin-top:10px;line-height:1.45}.bi .n-tb .n-ck{width:22px;height:22px;color:var(--na)}
/* 치료·표 */
.bi .n-table{background:linear-gradient(170deg,var(--nl),var(--nb))}.bi .n-tbl{margin-top:36px}.bi .n-trh{display:grid;grid-template-columns:220px 1fr;background:var(--nd);color:#fff;padding:20px 26px;font-size:22px;font-weight:700}
.bi .n-tr{display:grid;grid-template-columns:220px 1fr;gap:10px;padding:24px 26px;border-bottom:1px solid rgba(0,0,0,.1);font-size:22px;line-height:1.5}.bi .n-tr:nth-child(odd){background:rgba(255,255,255,.55)}.bi .n-tr b{font-size:25px}
.bi .n-qt{margin-top:30px;border-left:4px solid var(--nr,var(--na));background:rgba(255,255,255,.6);padding:20px 24px;font-size:22px;font-weight:600}
.bi .n-stepr{height:860px;justify-content:flex-start;background:var(--nl)}.bi .n-bgph{position:absolute;left:0;right:0;bottom:0;height:56%}.bi .n-bgph .ph{width:100%;height:100%}
.bi .n-card{position:relative;z-index:2;background:#fff;margin:56px 300px 0 0;padding:50px 46px;border-top:4px solid var(--na)}.bi .n-card .n-t{font-size:42px}.bi .n-card .n-sub{font-size:20px}
.bi .n-sp{position:absolute;right:0;top:250px;z-index:3;display:flex;flex-direction:column;gap:14px;width:420px}.bi .n-spr{background:var(--na);color:#fff;border-radius:40px 0 0 40px;padding:16px 28px;font-size:24px;box-shadow:0 6px 14px rgba(0,0,0,.18)}.bi .n-spr small{font-size:15px;opacity:.85;margin-right:12px}
.bi .n-eng{position:absolute;left:0;right:0;bottom:26px;text-align:center;z-index:3}.bi .n-eng span{display:inline-block;color:#fff;background:rgba(0,0,0,.45);border-radius:99px;padding:6px 20px;letter-spacing:.3em;font-size:18px}
.bi .n-stack{background:var(--nb)}.bi .n-fade{position:absolute;inset:0}.bi .n-fade .ph{width:100%;height:100%;opacity:.28}
.bi .n-sk{position:relative;background:rgba(255,255,255,.92);border-radius:18px;padding:34px 30px 24px;margin-top:34px;box-shadow:0 8px 20px rgba(0,0,0,.08);font-size:30px}.bi .n-sk b{font-weight:800}.bi .n-sk span{display:block;font-size:21px;opacity:.75;margin-top:8px}
.bi .n-lab{position:absolute;top:-20px;left:24px;background:var(--nd);color:#fff;border-radius:10px;padding:4px 18px;font-size:20px;font-weight:800}
.bi .n-frame{background:var(--nb);padding:30px}.bi .n-fr{border:3px solid var(--nd);outline:1px solid var(--nd);outline-offset:-10px;padding:60px 50px 40px;min-height:800px}
.bi .n-lbl{border-left:5px solid var(--na);padding-left:12px;font-size:21px;font-weight:700;margin-bottom:20px}.bi .n-serif{font-family:"Nanum Myeongjo",serif}.bi .n-serif.n-t{font-weight:800}
.bi .n-ul{display:block;width:110px;height:6px;background:var(--na2);margin:18px 0 26px}.bi .n-fb{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:20px}
.bi .n-fbx{border:2px solid var(--na);border-radius:10px;padding:22px;text-align:center;background:rgba(255,255,255,.4)}.bi .n-fbx.r{border-color:var(--nr,var(--nd))}.bi .n-fbx b{display:block;font-size:26px;font-family:"Nanum Myeongjo",serif;font-weight:800}.bi .n-fbx span{display:block;font-size:18px;opacity:.7;margin-top:8px;line-height:1.45}
.bi .n-fn{text-align:right;margin-top:26px;font-size:18px;opacity:.6}
.bi .n-feat{background:#fff}.bi .n .n-fph{position:absolute;right:50px;top:60px;width:250px;height:250px;border-radius:50%;overflow:hidden;border:8px solid var(--nl)}.bi .n-feat .n-t{max-width:470px}
.bi .n-ftr{display:flex;gap:18px;align-items:center;background:linear-gradient(90deg,var(--nl),transparent);border-radius:99px;padding:10px;margin-top:16px;font-size:24px}.bi .n-ftr .n-cn{width:46px;height:46px;font-size:18px;background:var(--nd)}
.bi .n-dband{background:var(--nd);color:#fff;display:flex;justify-content:space-between;align-items:center;gap:20px;padding:34px 70px;font-size:22px}.bi .n-dband .n-logo{filter:brightness(0) invert(1);max-height:44px}
/* 순서 */
.bi .n-tiles{background:linear-gradient(180deg,#f7f8f7,var(--nb))}.bi .n-tl{position:relative;display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-top:50px}.bi .n-tl.n3{grid-template-columns:repeat(3,1fr)}.bi .n-tl.n2{grid-template-columns:repeat(2,1fr)}
.bi .n-line{position:absolute;left:0;right:0;top:80px;height:10px;background:var(--na2);opacity:.6}.bi .n-tt{position:relative;text-align:center}
.bi .n-sqi{width:150px;height:150px;margin:0 auto 20px;border:5px solid var(--nd);border-radius:16px;background:#fff;color:var(--nd);display:grid;place-items:center;box-shadow:0 6px 0 var(--na)}.bi .n-sqi .ic{width:80px;height:80px}
.bi .n-tt b{display:block;font-size:21px}.bi .n-tt span{display:block;font-size:17px;opacity:.65;margin-top:8px;line-height:1.45}
.bi .n-arrows{background:linear-gradient(180deg,var(--nl),var(--nb))}.bi .n-ab{background:#fff;border-radius:22px;padding:30px 36px;margin-top:40px;box-shadow:0 10px 26px rgba(0,0,0,.08)}
.bi .n-ar{display:flex;gap:18px;font-size:25px;align-items:baseline;line-height:1.5}.bi .n-ar>b{flex:none;color:var(--na);font-size:22px}.bi .n-ar em{font-style:normal;opacity:.7;font-size:21px}.bi .n-dw{display:block;color:#bbb;font-style:normal;font-size:24px;margin:4px 0 4px 20px}
.bi .n-notch{background:#fff;border:14px solid var(--na2)}.bi .n-notch .n-t div:first-child{color:var(--na)}.bi .n-logo.pillnm,.bi .n-nm.pillnm{display:table;margin:0 auto 24px;background:var(--nl);border-radius:99px;padding:8px 24px;font-size:20px}
.bi .n-nr{position:relative;display:flex;align-items:center;gap:18px;background:var(--na);color:#fff;border-radius:14px;padding:22px 26px;margin-top:34px;font-size:23px}
.bi .n-nr:after{content:"";position:absolute;left:50%;bottom:-16px;border:16px solid transparent;border-bottom:0;border-top-color:var(--na);transform:translateX(-50%)}.bi .n-nr:last-of-type:after{display:none}
.bi .n-nc{width:48px;height:48px;border-radius:50%;background:#fff;color:var(--na);display:grid;place-items:center;flex:none}.bi .n-nl{width:170px;flex:none;text-align:center}.bi .n-nr i{width:2px;height:44px;background:rgba(255,255,255,.6)}.bi .n-nr span{font-size:20px;line-height:1.45}
/* 소개·약속 */
.bi .n-cols{background:linear-gradient(180deg,var(--nb),var(--nl))}.bi .n-qm{text-align:center;font-size:90px;line-height:.6;color:var(--na);opacity:.5;font-family:Georgia,serif}.bi .n-qm.r{text-align:right}
.bi .n-box2{margin-top:28px;background:rgba(255,255,255,.75);border-radius:14px;padding:22px 26px;font-size:21px;line-height:1.6}
.bi .n-cl{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:40px;text-align:center}.bi .n-cl.n3{grid-template-columns:repeat(3,1fr)}.bi .n-cl.n2{grid-template-columns:repeat(2,1fr)}
.bi .n-cc2 .n-ci{margin:0 auto 16px;background:var(--na);color:#fff;width:110px;height:110px}.bi .n-cc2 b{display:block;font-size:22px;color:var(--na)}.bi .n-cc2 span{display:block;font-size:16px;opacity:.7;margin-top:8px;line-height:1.45}
.bi .n-okb{display:flex;gap:16px;align-items:center;margin-top:40px;border:1px solid rgba(0,0,0,.12);border-radius:14px;padding:20px 24px;font-size:21px;background:rgba(255,255,255,.6)}.bi .n-okb .n-ck{color:#fff;background:var(--nd);border-radius:50%;padding:6px;width:36px;height:36px}
.bi .n-quote{flex-direction:row;height:860px;background:var(--nl)}.bi .n-qph{width:46%;position:relative}.bi .n-qph .ph{position:absolute;inset:0}
.bi .n-qin{width:54%;padding:90px 50px;display:flex;flex-direction:column;justify-content:center}.bi .n-qin .n-qm{text-align:left}.bi .n-t.q{font-size:40px;line-height:1.4;font-weight:700}
.bi .n-ql{border-top:1px solid rgba(0,0,0,.12);padding:18px 0;font-size:22px}.bi .n-ql span{display:block;font-size:17px;opacity:.65;margin-top:6px}
.bi .n-green{background:#fff}.bi .n-g2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:36px}.bi .n-gc{display:flex;gap:14px;border:1px solid #e4e7e5;border-radius:16px;padding:22px;font-size:22px;box-shadow:0 4px 12px rgba(0,0,0,.05)}.bi .n-gc .n-ck{color:var(--na)}.bi .n-gc span{display:block;font-size:17px;opacity:.65;margin-top:6px}
.bi .n-gb{background:var(--nd);color:#fff;text-align:center;padding:30px 40px;font-size:24px}.bi .n-gb i{opacity:.5;margin:0 12px;font-style:normal}.bi .n-gb>span{display:block;margin-top:14px;padding-top:14px;border-top:1px solid rgba(255,255,255,.25);font-size:19px;opacity:.9}
.bi .n-list3{flex-direction:row;height:860px;background:var(--nb)}.bi .n-lph{width:44%;position:relative}.bi .n-lph .ph{position:absolute;inset:0}.bi .n-lin{width:56%;padding:70px 46px;display:flex;flex-direction:column;justify-content:center}.bi .n-list3:not(:has(.n-lph)) .n-lin{width:100%;padding:80px 90px}
.bi .n-l3{border-top:1px solid rgba(0,0,0,.18);padding:22px 0 20px;margin-top:20px;position:relative}.bi .n-l3 i{position:absolute;top:-6px;left:0;width:30px;height:10px;border-radius:6px;background:var(--nd)}.bi .n-l3 b{font-size:24px}.bi .n-l3 span{display:block;font-size:18px;opacity:.65;margin-top:8px;line-height:1.45}
/* 원장 */
.bi .n-doc1{height:860px;background:linear-gradient(90deg,#fff 50%,var(--nl))}.bi .n-doc1 .n-in{max-width:520px}.bi .n-dnm{margin:24px 0 30px;font-size:24px}.bi .n-doc1 ul{padding-left:26px;font-size:24px;line-height:1.5}.bi .n-doc1 li{margin-bottom:12px}
.bi .n-dph{position:absolute;right:0;bottom:0;width:46%;height:86%}.bi .n-dph .ph{width:100%;height:100%;-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 30%);mask-image:linear-gradient(90deg,transparent 0,#000 30%)}
.bi .n-doc2{height:860px;background:#ddd}.bi .n-dcard{position:relative;z-index:2;margin:0 0 0 50px;width:390px;background:rgba(255,255,255,.95);border-radius:18px;padding:40px 34px;box-shadow:0 10px 30px rgba(0,0,0,.15)}
.bi .n-dcard{color:#1d1d1f}.bi .n-dcard small{font-size:15px;letter-spacing:.2em;opacity:.6}.bi .n-dn{font-size:50px;font-weight:900;margin:6px 0}.bi .n-dr{font-size:20px;opacity:.8}.bi .n-dl{display:flex;gap:10px;align-items:center;font-size:17px;margin-top:12px}.bi .n-dl i{width:22px;height:22px;border-radius:50%;background:var(--nd);flex:none}
/* 치료 사진 */
.bi .n-fc{position:absolute;left:50px;right:50px;bottom:50px;z-index:2;background:#fff;border-radius:6px;padding:34px 36px;border-top:5px solid var(--na2)}.bi .n-fc b{display:block;font-size:36px;font-weight:800}.bi .n-fc span{display:block;font-size:22px;opacity:.75;margin-top:12px;line-height:1.55}
.bi .n-dd{position:absolute;right:26px;bottom:20px;width:30px;height:8px;background:radial-gradient(circle,var(--na2) 3px,transparent 4px) 0 0/12px 8px}
.bi .n-ptop{justify-content:flex-start;background:var(--nb);height:860px}.bi .n-tp{margin:50px 50px 0;height:520px;border-radius:14px;overflow:hidden;border:1px solid rgba(0,0,0,.08)}.bi .n-tp .ph{width:100%;height:100%}
.bi .n-tx{padding:40px 60px;text-align:center}.bi .n-tx b{display:block;font-size:40px;font-weight:800}.bi .n-tx span{display:block;font-size:22px;opacity:.7;margin-top:14px;line-height:1.55}
.bi .n-gr3{position:absolute;inset:0;background:linear-gradient(0deg,rgba(0,0,0,.78) 0,rgba(0,0,0,.2) 45%,transparent 70%)}.bi .n-gt{position:absolute;left:60px;right:60px;bottom:60px;z-index:2;color:#fff}.bi .n-gt i{display:block;width:60px;height:6px;background:var(--na2);margin-bottom:22px}
.bi .n-gt b{display:block;font-size:52px;font-weight:900}.bi .n-gt span{display:block;font-size:23px;opacity:.9;margin-top:14px;line-height:1.55}
/* 진료 안내 */
.bi .n-hr{display:flex;gap:20px;font-size:24px;padding:8px 0}.bi .n-hr span{width:170px;flex:none;font-weight:700}.bi .n-ir{display:flex;gap:16px;align-items:center;font-size:23px;padding:12px 0;line-height:1.5}.bi .n-ir small{display:block;font-size:18px;opacity:.7}
.bi .n-ii{width:46px;height:46px;border-radius:50%;background:var(--nd);color:#fff;display:grid;place-items:center;flex:none}.bi .n-ii .ic{width:24px;height:24px}.bi .n-tel{font-size:32px}
.bi .n .rmap,.bi .n .map{margin-top:30px}.bi .n-law{margin-top:26px;font-size:16px;opacity:.6;line-height:1.5}
.bi .n-cal{background:var(--nb)}.bi .n-calc{position:relative;border:2px solid #555;border-radius:14px;background:#fff;padding:60px 46px 34px;margin-bottom:24px}.bi .n-rings{position:absolute;top:-16px;left:30px;right:30px;display:flex;justify-content:space-between}.bi .n-rings i{width:12px;height:30px;border:3px solid #555;border-radius:8px;background:#fff}
.bi .n-calt{display:table;margin:0 auto 26px;background:var(--nr,var(--na));color:#fff;border-radius:99px;padding:12px 40px;font-size:26px;font-weight:800}
.bi .n-navy{background:var(--nb)}.bi .n-np{background:var(--nd);color:#fff;border-radius:6px;padding:40px}.bi .n-nh{display:flex;gap:30px;border-bottom:1px solid rgba(255,255,255,.25);padding-bottom:22px;margin-bottom:12px}.bi .n-nh>b{font-size:28px;flex:none;border-right:1px solid rgba(255,255,255,.3);padding-right:30px}
.bi .n-irs.w .n-ii{background:#fff;color:var(--nd)}.bi .n-np .n-hr span{width:auto;min-width:130px}
.bi .n-split{flex-direction:row;flex-wrap:wrap;justify-content:flex-start;align-content:flex-start;background:var(--nb)}.bi .n-sl,.bi .n-sr{width:50%;padding:60px 44px}.bi .n-sl{background:var(--na);color:#fff}.bi .n-sr{background:var(--nl)}
.bi .n-snm{font-size:46px;font-weight:900;line-height:1.2}.bi .n-sa{font-size:19px;opacity:.85;margin-top:18px;line-height:1.5}.bi .n-stel{font-size:40px;font-weight:900;color:#fff;margin-top:30px}.bi .n-sh{font-size:30px;font-weight:800;margin-bottom:16px}.bi .n-sr .n-hr{font-size:20px}.bi .n-sr .n-hr span{width:110px}
.bi .n-sm2{width:100%;padding:0 44px 50px}
.bi .n-big{background:var(--nl)}.bi .n-big .n-qm{text-align:left}.bi .n-bq{font-size:32px;line-height:1.5}.bi .n-bh div{font-size:40px;font-weight:800;margin:10px 0}.bi .n-bh .it{font-style:italic;font-size:30px;opacity:.8}.bi .n-bt{font-size:28px;font-weight:700;margin-top:24px}

.bi .n-glass,.bi .n-list3{height:auto;min-height:860px}.bi .n-glass .n-in{padding-top:90px}
.bi .n-ihr{background:linear-gradient(180deg,#fff,var(--nl))}.bi .n-ul.c{margin:18px auto 34px}.bi .n-ihl{background:#fff;border:1px solid rgba(0,0,0,.1);border-radius:18px;padding:16px 36px;margin-bottom:24px;box-shadow:0 8px 22px rgba(0,0,0,.05)}
.bi .n-ihi{display:flex;gap:26px;align-items:center;padding:20px 0}.bi .n-ihi+.n-ihi{border-top:1px solid #eee}.bi .n-ihi .n-ci{width:76px;height:76px}.bi .n-ihi .n-ci .ic{width:40px;height:40px}.bi .n-ihi b{display:block;font-size:22px;color:var(--na)}.bi .n-ihi>div>span{display:block;font-size:32px;font-weight:800;margin-top:4px}
/* 글씨·간격 키움: 860 정사각 안을 꽉 차게 (네이버 카드뉴스처럼 큰 글씨) */
.bi .n-t{font-size:60px}.bi .n-t.m{font-size:58px}.bi .n-t.xl{font-size:76px}.bi .n-hed .n-t.xl{font-size:88px}.bi .n-sub{font-size:28px}
.bi .n-gr{font-size:31px;padding:26px 0}.bi .n-gr .n-ck{width:36px;height:36px}
.bi .n-cr{font-size:29px;padding:28px 0}.bi .n-c2{margin-top:50px}.bi .n-band{font-size:27px;padding:40px 70px}
.bi .n-pr{font-size:30px;padding:26px 30px;margin-bottom:18px}.bi .n-cc{width:46px;height:46px}.bi .n-cta{font-size:27px;padding:32px}.bi .n-cta b{font-size:30px}.bi .n-head .n-hb{padding:70px 60px 60px}
.bi .n-bi{font-size:25px;padding:24px 20px;letter-spacing:-.05em}.bi .n-panel{padding:52px 44px}
.bi .n-ppr{font-size:30px;padding:28px 30px;margin-bottom:18px}.bi .n-box{width:34px;height:34px}
.bi .n-br{font-size:30px;padding:28px 32px}.bi .n-br span{font-size:22px}
.bi .n-bc{width:250px;height:250px;font-size:30px}.bi .n-bc span{font-size:20px}.bi .n-bb.n4 .n-bc{width:340px;height:180px}
.bi .n-plr{font-size:33px;padding:20px 30px 20px 18px;margin-top:26px}.bi .n-cn{width:64px;height:64px;font-size:28px}.bi .n-plr span{font-size:22px}.bi .n-ic{width:76px;height:76px}
.bi .n-ir2{font-size:34px;padding:28px 0}.bi .n-ir2 span{font-size:23px}.bi .n-ci{width:110px;height:110px}.bi .n-ci .ic{width:60px;height:60px}
.bi .n-mr{font-size:31px;padding:28px 30px 28px 76px;margin-top:30px}.bi .n-mr span{font-size:22px}.bi .n-badge{width:64px;height:64px;font-size:22px}
.bi .n-th{font-size:31px}.bi .n-tb{font-size:24px}.bi .n-tb .n-ck{width:26px;height:26px}.bi .n-tg{gap:24px;margin-top:50px}
.bi .n-trh{font-size:24px}.bi .n-tr{font-size:24px;padding:28px 26px}.bi .n-tr b{font-size:28px}
.bi .n-sk{font-size:33px;padding:40px 34px 28px}.bi .n-sk span{font-size:23px}.bi .n-lab{font-size:22px}
.bi .n-fbx b{font-size:30px}.bi .n-fbx span{font-size:20px}.bi .n-fbx{padding:28px 22px}
.bi .n-ftr{font-size:28px;margin-top:20px}.bi .n-ftr .n-cn{width:54px;height:54px;font-size:20px}
.bi .n-tl{margin-top:70px}.bi .n-sqi{width:170px;height:170px}.bi .n-sqi .ic{width:92px;height:92px}.bi .n-line{top:90px}.bi .n-tt b{font-size:25px;margin-top:6px}.bi .n-tt span{font-size:20px}
.bi .n-tl.n2 .n-sqi,.bi .n-tl.n3 .n-sqi{width:200px;height:200px}.bi .n-tl.n2 .n-line,.bi .n-tl.n3 .n-line{top:105px}.bi .n-tl.n3 .n-tt b,.bi .n-tl.n2 .n-tt b{font-size:28px}.bi .n-tl.n3 .n-tt span,.bi .n-tl.n2 .n-tt span{font-size:22px}
.bi .n-ar{font-size:30px}.bi .n-ar>b{font-size:24px}.bi .n-ar em{font-size:24px}.bi .n-ab{padding:40px 44px;margin-top:50px}.bi .n-dw{font-size:30px;margin:10px 0 10px 20px}
.bi .n-nr{font-size:27px;padding:28px 30px;margin-top:40px}.bi .n-nr span{font-size:23px}.bi .n-nc{width:56px;height:56px}.bi .n-nl{width:190px}
.bi .n-cc2 b{font-size:26px}.bi .n-cc2 span{font-size:19px}.bi .n-cc2 .n-ci{width:130px;height:130px}.bi .n-okb{font-size:24px}
.bi .n-t.q{font-size:44px}.bi .n-ql{font-size:26px;padding:22px 0}.bi .n-ql span{font-size:19px}
.bi .n-gc{font-size:26px;padding:26px}.bi .n-gc span{font-size:19px}.bi .n-gb{font-size:26px}
.bi .n-l3 b{font-size:28px}.bi .n-l3 span{font-size:21px}.bi .n-l3{padding:26px 0 24px}
.bi .n-sr .n-hr{font-size:21px}.bi .n-sr .n-hr span{width:130px}.bi .n-hr{font-size:26px}.bi .n-ir{font-size:25px}
.bi .n-dnm{font-size:28px}.bi .n-doc1 ul{font-size:27px}
`;
const R_CSS=`
.bi[class*="st-real"]{background:#fff}.bi[class*="st-real"] .blk+.blk{margin-top:14px}
.bi section.r{position:relative;width:860px;height:860px;overflow:hidden;text-align:left;font-family:"Pretendard Variable",Pretendard,sans-serif;letter-spacing:-.03em;color:var(--rink)}.bi section.r.tall{height:1075px}
.bi section.r .ph{border-radius:0;background:transparent}.bi section.r .phe{border-radius:0}.bi section.r b{font-weight:800}
.bi .r-in{position:relative;z-index:2;padding:96px 64px 0}.bi .r-t{font-size:74px;font-weight:900;line-height:1.16;letter-spacing:-.05em}.bi .r-t.xl{font-size:104px;line-height:1.08}
.bi section.r .ra{color:var(--a);font-weight:inherit}.bi .r-kick{font-size:26px;font-weight:700;color:var(--a);margin-bottom:16px;letter-spacing:-.01em}
.bi .r-no{flex:none;font-size:26px;font-weight:800;color:var(--a);min-width:44px}.bi .r-ck{flex:none;width:40px;height:40px;color:var(--a)}
.bi .r-row{display:flex;gap:18px;align-items:flex-start}.bi .r-row b{display:block;font-size:31px;line-height:1.3}.bi .r-row span{display:block;font-size:23px;line-height:1.45;opacity:.82;margin-top:4px}.bi .r-row>div{flex:1}
.bi .r-note{font-size:20px;opacity:.7;margin-top:22px}
.bi .r-logo{max-height:52px;max-width:240px;display:block}.bi .r-nm{font-size:24px;font-weight:800}.bi .r-cn{position:absolute;left:56px;bottom:44px;z-index:3}.bi .r-cn.tl{top:44px;bottom:auto}
/* 어두운 카드뉴스 */
.bi .r-dark{background:radial-gradient(120% 90% at 80% 30%,var(--rbg2),var(--rbg) 70%);--rink:#f5ece3}
.bi .r-dark .r-side{position:absolute;right:0;top:0;bottom:0;width:62%}.bi .r-dark .r-side .ph{width:100%;height:100%}.bi .r-dark .r-side img{-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 45%);mask-image:linear-gradient(90deg,transparent 0,#000 45%);filter:saturate(.85) contrast(1.02)}
.bi .r-dark .r-side:after{content:"";position:absolute;inset:0;background:linear-gradient(0deg,var(--rbg) 0,transparent 30%)}
.bi .r-num{position:absolute;left:50%;top:-38px;margin-left:-62px;width:124px;height:124px;border-radius:50%;border:2px solid rgba(255,255,255,.28);display:grid;place-items:end center;padding-bottom:22px;font-size:30px;font-weight:600;color:var(--rink);z-index:3}
.bi .r-dark.wph .r-in{max-width:540px}.bi .r-dark.wph .r-t{font-size:62px}.bi .r-dark.wph .r-t.xl{font-size:80px}.bi .r-dark .r-t{color:var(--rink)}.bi .r-dark .r-t .ra{color:var(--a)}
.bi .r-dark .r-box{margin-top:40px;border:1.5px solid rgba(255,255,255,.22);border-radius:22px;padding:6px 30px;background:rgba(0,0,0,.18)}.bi .r-dark .r-box .r-row{padding:20px 0;align-items:center}.bi .r-dark .r-box .r-row+.r-row{border-top:1.5px dashed rgba(255,255,255,.18)}
.bi .r-dark.wph .r-box .r-row b{font-size:27px}
.bi .r-dark .r-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:44px}.bi .r-dark .r-grid .r-row{flex-direction:column;gap:10px;border:1.5px solid rgba(255,255,255,.22);border-radius:22px;padding:26px 24px;background:rgba(255,255,255,.04)}
.bi .r-dark .r-sub{margin-top:40px;border-left:2px solid rgba(255,255,255,.5);padding-left:20px;font-size:28px;line-height:1.5;color:var(--rink);max-width:400px}
.bi .r-tags{position:absolute;left:56px;bottom:52px;display:flex;gap:14px;z-index:3}.bi .r-tags span{border:1.5px solid rgba(255,255,255,.3);border-radius:18px;padding:14px 24px;font-size:22px;background:rgba(0,0,0,.25);color:var(--rink)}
/* 베이지 명조 */
.bi .r-beige{background:var(--rbg);--rink:#2a2622}.bi .r-beige .r-t{font-family:"Nanum Myeongjo",serif;font-weight:800;font-size:62px;letter-spacing:-.04em;line-height:1.25}.bi .r-beige .r-t.xl{font-size:76px}
.bi .r-beige .r-kick{font-size:24px;color:var(--rk2,var(--a))}.bi .r-beige .r-in{padding:90px 64px 0}
.bi .r-dash{display:flex;align-items:center;gap:18px;margin-top:26px;font-family:"Nanum Myeongjo",serif;font-size:28px;color:#6d655c}.bi .r-dash:before{content:"";width:80px;border-top:2px solid #8f877d}
.bi .r-cvph{position:absolute;left:0;right:0;bottom:0;height:470px}.bi .r-cvph .ph{width:100%;height:100%}.bi .r-cvph img{-webkit-mask-image:linear-gradient(180deg,transparent 0,#000 30%);mask-image:linear-gradient(180deg,transparent 0,#000 30%)}
.bi .r-beige .r-cn{background:rgba(255,255,255,.92);border-radius:10px;padding:8px 16px}
.bi .r-cards{display:flex;flex-direction:column;gap:14px;margin-top:36px}.bi .r-cards .r-row{background:var(--rcard,#fffdf9);border-left:6px solid var(--a);border-radius:6px 16px 16px 6px;padding:24px 28px;box-shadow:0 2px 10px rgba(80,60,30,.06)}
.bi .r-beige .r-no{font-family:"Nanum Myeongjo",serif;font-weight:400;font-size:30px}.bi .r-beige .r-row b{font-size:29px}
.bi .r-phw{margin-top:30px;height:250px;border-radius:18px;overflow:hidden}.bi .r-phw .ph{width:100%;height:100%}
/* 사진 위 굵은 글씨 */
.bi .r-pho{background:var(--rbg);--rink:#14223d}.bi .r-pho.cover{background:#111}.bi section.r .r-ph.full{position:absolute;inset:0;width:100%;height:100%}
.bi .r-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 30%,rgba(0,0,0,.78))}
.bi .r-big{position:absolute;left:52px;right:40px;bottom:64px;z-index:2;font-size:118px;font-weight:900;line-height:1.08;letter-spacing:-.06em;color:#fff;text-shadow:0 4px 18px rgba(0,0,0,.35)}.bi .r-big .y{color:var(--a)}
.bi .r-pho .r-cn.tl{background:#fff;border-radius:10px;padding:8px 16px}.bi .r-pho .r-cn .r-nm{color:#14223d}
.bi .r-top{height:330px;position:relative}.bi .r-top .ph{width:100%;height:100%}.bi .r-pho.wph .r-in{padding-top:44px}
.bi .r-pho .r-t{font-size:66px}.bi .r-lab{display:inline-block;background:var(--rink);color:#fff;font-size:24px;font-weight:800;border-radius:10px;padding:8px 18px;margin-bottom:18px}
.bi .r-lines{margin-top:34px}.bi .r-lines .r-row{padding:18px 0;align-items:center}.bi .r-lines .r-row+.r-row{border-top:2px solid rgba(20,34,61,.1)}
.bi .r-pho .r-no{background:var(--a);color:#fff;border-radius:12px;min-width:0;width:56px;height:56px;display:grid;place-items:center;font-size:22px}.bi .r-pho .r-no:not(:only-child){}
.bi .r-pho.wph .r-row b{font-size:28px}.bi .r-pho.wph .r-row span{font-size:21px}
/* 사진 카드 */
.bi .r-phc{background:#111}.bi .r-cap{position:absolute;left:0;right:0;bottom:0;z-index:2;padding:120px 56px 54px;background:linear-gradient(180deg,transparent,rgba(0,0,0,.75) 55%);color:#fff}
.bi .r-cap b{display:block;font-size:56px;font-weight:900;letter-spacing:-.05em}.bi .r-cap span{display:block;font-size:24px;line-height:1.5;margin-top:10px;opacity:.9}
.bi .r-phc.beige .r-cap{background:var(--rbg);color:#2a2622;padding:34px 56px 40px}.bi .r-phc.beige .r-cap b{font-family:"Nanum Myeongjo",serif;font-size:46px}.bi .r-phc.beige .r-ph.full{bottom:200px;height:auto}
.bi .r-phc.pho .r-cap b{color:var(--a);font-size:72px}
/* 의료진 */
.bi .r-doc{display:grid;grid-template-columns:400px 1fr;background:var(--rbg);--rink:#2a2622}.bi .r-doc.dark{--rink:#f5ece3;background:var(--rbg)}.bi .r-dph .ph{width:100%;height:860px}
.bi .r-din{padding:120px 44px 0;color:var(--rink)}.bi .r-dtt{display:inline-block;border:1.5px solid var(--a);color:var(--a);border-radius:99px;padding:6px 20px;font-size:24px;font-weight:700}
.bi .r-dn{font-size:96px;font-weight:900;letter-spacing:-.04em;margin:16px 0 6px}.bi .r-doc.beige .r-dn{font-family:"Nanum Myeongjo",serif}.bi .r-dr{font-size:26px;opacity:.8;margin-bottom:30px}.bi .r-dl{font-size:23px;padding:10px 0;border-top:1px solid rgba(128,128,128,.3)}
/* 시설 */
.bi .r-fac{background:var(--rbg);padding:70px 40px 0}.bi .r-fh{font-size:44px;font-weight:900;color:var(--rink);margin:0 16px 26px}.bi .r-fac.beige .r-fh{font-family:"Nanum Myeongjo",serif;--rink:#2a2622}.bi .r-fac.dark .r-fh{color:#f5ece3}
.bi .r-fg{display:grid;grid-template-columns:1fr 1fr;gap:14px}.bi .r-fi{position:relative;height:330px;border-radius:14px;overflow:hidden}.bi .r-fi .ph{width:100%;height:100%}.bi .r-fg.n1 .r-fi,.bi .r-fg.n2 .r-fi{height:670px}.bi .r-fg.n1{grid-template-columns:1fr}.bi .r-fg.n3 .r-fi:first-child{grid-row:span 2;height:674px}
.bi .r-fi span{position:absolute;left:14px;bottom:14px;background:rgba(0,0,0,.6);color:#fff;font-size:22px;font-weight:700;border-radius:8px;padding:6px 14px}
/* 진료 안내 */
.bi section.r.r-info{height:auto;min-height:860px;padding-bottom:120px;background:var(--rbg);--rink:#2a2622}.bi section.r.r-info.dark{--rink:#f5ece3}
.bi section.r.r-info,.bi .r-info .r-t,.bi .r-info .r-ir{color:var(--rink)}.bi .r-info.beige .r-t{font-family:"Nanum Myeongjo",serif;font-size:56px}.bi .r-info .r-t{font-size:58px}
.bi .r-tab{margin-top:36px;border-top:2px solid var(--a)}.bi .r-ir{display:grid;grid-template-columns:150px 1fr;gap:20px;padding:22px 4px;border-bottom:1px solid rgba(128,128,128,.3);font-size:25px;line-height:1.5}.bi .r-ir>b{color:var(--a)}.bi .r-ir small{display:block;font-size:20px;opacity:.75}.bi .r-tel{font-size:40px}
.bi .r-info .map{margin-top:28px}.bi .r-law{font-size:18px;opacity:.65;margin-top:26px;line-height:1.6}`;


const K_CSS=`.bi[class*="st-card"]{background:#f6f7f9;--a2:#18bdf0;--ink:#121417}
.bi .k{padding:64px 48px 40px;position:relative;color:var(--ink);text-align:center}.bi .k.tint{background:var(--bg2)}.bi .k b{font-weight:800}
.bi .k .g{background:linear-gradient(90deg,var(--a),var(--a2));-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;font-weight:inherit}
.bi .k .y{color:#ffe9a6}.bi .k .ac{color:var(--a)}.bi .k-h{font-weight:900;font-size:58px;line-height:1.2;letter-spacing:-.045em}.bi .k-h.xl{font-size:64px}.bi .k-h.md{font-size:50px}.bi .k-h.one div{white-space:nowrap}
.bi .k-vl{display:block;width:2px;height:54px;background:#3a3f47;margin:22px auto}.bi .k-sub{font-size:28px;line-height:1.45;color:#22262c}.bi .k-sub b{color:var(--a)}
.bi .k-pillw{display:flex;justify-content:center;margin-top:30px;position:relative;z-index:2}.bi .k-pill{display:inline-block;background:linear-gradient(90deg,var(--a),var(--a2));color:#fff;border-radius:99px;padding:10px 40px;font-size:30px;font-weight:600;letter-spacing:-.03em}
.bi .k-pill .pb{font-weight:900}.bi .k-pillw.on{margin-bottom:-28px}.bi .k-pillw.soft .k-pill{background:var(--soft);color:var(--ink);font-weight:700;font-size:26px}.bi .k-pillw.lg .k-pill{font-size:34px;font-weight:800;padding:10px 44px}.bi .k-pillw.lg .pb{color:#ffe9a6}
.bi .k-pills2 .k-pillw{margin-top:12px}.bi .k-card{background:#fff;border-radius:34px;box-shadow:0 6px 30px rgba(20,40,80,.06)}
.bi .k-body{position:relative;height:560px;margin-top:0;overflow:hidden;text-align:left}.bi .k-pp{position:absolute;left:242px;top:40px;width:280px;height:520px;border-radius:0;background:transparent}
.bi .k-pp img{object-fit:cover;object-position:50% 20%;-webkit-mask-image:linear-gradient(180deg,#000 82%,transparent);mask-image:linear-gradient(180deg,#000 82%,transparent)}
.bi .k-lb{position:absolute;height:72px;display:flex;align-items:flex-end;border-bottom:2.5px dashed var(--a)}.bi .k-lb.l{left:24px}.bi .k-lb.r{right:24px;justify-content:flex-end}
.bi .k-lt{display:flex;flex-direction:column;padding-bottom:8px;font-size:23px;line-height:1.3;color:#22262c}.bi .k-lt b{color:var(--a);font-size:25px}.bi .k-lb.r .k-lt{width:200px}
.bi .k-dot{position:absolute;bottom:-12px;width:22px;height:22px;border-radius:50%;background:radial-gradient(circle,#3b5bff 0 32%,rgba(90,110,255,.45) 34% 62%,rgba(120,140,255,.15) 64%);box-shadow:0 0 12px rgba(60,90,255,.6)}
.bi .k-lb.l .k-dot{right:-11px}.bi .k-lb.r .k-dot{left:-11px}
.bi .k-blue{background:var(--a);color:#fff;border-radius:28px;padding:30px 30px;margin-top:34px;font-size:27px;line-height:1.5;font-weight:500}.bi .k-blue b{font-weight:800}.bi .k-blue.sm{font-size:26px;border-radius:22px;padding:22px}
.bi .k-hw{font-family:"Nanum Pen Script","Gaegu",cursive;font-size:44px;color:#22262c;margin-bottom:6px;letter-spacing:0}
.bi .k-paper{position:relative;background:var(--bg2);margin:34px 0 0;padding:24px 90px 24px 34px;text-align:left;overflow:hidden}
.bi .k-curl{position:absolute;right:0;bottom:0;width:96px;height:96px;background:linear-gradient(315deg,var(--kbg,#f6f7f9) 50%,#b9c6d0 50%,#dfe7ee 75%,#f2f6f9);border-radius:0 0 0 18px;box-shadow:-3px -3px 8px rgba(40,60,90,.12)}
.bi .k-cl{display:flex;align-items:center;gap:16px;font-size:26px;padding:15px 0;color:#22262c;text-align:left}.bi .k-paper .k-cl+.k-cl{border-top:1.5px dashed #c7d6e2}.bi .k-cl span{line-height:1.35}
.bi .k-ck{width:30px;height:30px;flex:none;color:var(--a)}.bi .k-white{margin-top:40px;padding:50px 40px 44px;border:4px solid #eceef1;box-shadow:none}.bi .k-end{font-size:40px;font-weight:900;margin-top:32px;line-height:1.3}
.bi .k-bandph{position:relative;margin:40px -48px 0}.bi .k-bph{height:420px;border-radius:0}.bi .k-bph img{filter:saturate(.9)}
.bi .k-bpills{position:relative;margin:-34px auto 0;display:flex;flex-direction:column;gap:12px;width:470px;z-index:2}
.bi .k-bp{display:flex;align-items:center;gap:14px;background:var(--a);color:#fff;border-radius:99px;padding:13px 30px;font-size:25px;text-align:left;box-shadow:0 6px 16px rgba(0,0,0,.18)}.bi .k-bp .k-ck{color:#ffe9a6;width:26px;height:26px}
.bi .k-q{display:flex;align-items:center;justify-content:center;gap:16px;margin-top:40px;font-size:27px;line-height:1.45;font-weight:500}.bi .k-q i{font-style:normal;font-size:70px;line-height:.6;color:#b9bec6;font-family:Georgia,serif;font-weight:900;align-self:flex-start}
.bi .k-q.hw{font-family:"Nanum Pen Script","Gaegu",cursive;font-size:46px;font-weight:400}.bi .k-q.hw i{font-family:Georgia,serif}.bi .k-q .hb{color:var(--a);font-weight:400}.bi .k-q.white{color:#fff}.bi .k-q.white i{color:rgba(255,255,255,.7)}
.bi .k-wbox{background:#fff;border-radius:30px;padding:36px;margin-top:34px;font-size:32px;font-weight:600;line-height:1.45}
.bi .k-foot{display:flex;align-items:center;justify-content:center;gap:12px;margin:46px -48px -40px;padding:26px 0 30px}.bi .k-foot.band{background:var(--a);margin-top:46px}.bi .k-foot.band .k-fname{color:#fff}
.bi .k-logo{max-height:46px;max-width:300px;display:block}.bi .k-foot.band .k-logo,.bi .k-lfoot .k-logo{background:#fff;border-radius:14px;padding:8px 18px;max-height:62px}.bi .k-mark{width:38px;height:30px;border-radius:16px 16px 4px 4px;background:linear-gradient(120deg,#e0388f,#6b3cf0 40%,#1fb6f0 70%,#3fd27a)}.bi .k-fname{font-size:30px;font-weight:900;color:#1d2026}
.bi .k-who3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:34px}.bi .k-wc{background:#fff;border:2px solid #eceef1;border-radius:22px;padding:22px 10px;font-size:23px;line-height:1.4;display:flex;flex-direction:column;align-items:center;gap:8px}.bi .k-wc .k-ck{width:38px;height:38px}
.bi .k-adv{background:var(--bg2);border-radius:30px;margin-top:30px;padding:34px 36px;text-align:left}.bi .k-advh{font-size:44px;font-weight:900;text-align:center;margin-bottom:14px}.bi .k-advh.sm{font-size:30px;text-align:left;color:var(--a);margin:10px 0 4px}
.bi .k-advg{display:grid;grid-template-columns:1fr 170px;align-items:end}.bi .k-doc{width:170px;height:270px;display:block}
.bi .k-ovals{display:flex;flex-direction:column;gap:20px;margin-top:34px}.bi .k-oval{border:3px solid var(--a);border-radius:99px;background:rgba(255,255,255,.85);padding:28px 40px}.bi .k-ot{font-size:38px;font-weight:900;color:var(--a)}.bi .k-ot .g{font-weight:900}.bi .k-od{font-size:24px;margin-top:8px;line-height:1.45}
.bi .k-bluebot{background:var(--a);margin:44px -48px -40px;padding:34px 30px 0}.bi .k-strip{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.bi .k-sp{aspect-ratio:4/3;border-radius:0}.bi .k-bluebot .k-q{margin-top:24px}.bi .k-bluebot .k-foot{margin:10px -30px 0}
.bi .k-steps{display:flex;justify-content:center;margin:46px 0 40px}.bi .k-st{width:200px;height:200px;border-radius:50%;border:14px solid #9cc8ff;background:#fff;display:grid;place-items:center;margin-left:-14px;position:relative}
.bi .k-st:first-child{margin-left:0}.bi .k-st:not(:last-child):after{content:"";position:absolute;right:-34px;top:50%;margin-top:-16px;border:16px solid transparent;border-left:20px solid #9cc8ff;z-index:3}.bi .k-st.dk:not(:last-child):after{border-left-color:var(--a)}.bi .k-st.dk{border-color:var(--a);z-index:1}.bi .k-sti{font-size:24px;font-weight:800;line-height:1.3;padding:0 10px}.bi .k-sti b{display:block;color:var(--a);font-size:30px;font-weight:900}.bi .k-sti span{display:block;font-size:17px;font-weight:600;color:#4a5260;margin-top:4px}
.bi .k-steps.sm .k-st{width:160px;height:160px;border-width:11px}.bi .k-steps.sm .k-sti{font-size:20px}
.bi .k-phcap{position:relative;margin:34px -10px 0}.bi .k-tph{height:380px;border-radius:6px}.bi .k-cap{position:relative;margin:-70px 40px 0;background:#fff;border:3px solid var(--a);border-radius:99px;padding:24px 50px;display:flex;flex-direction:column;gap:6px;color:var(--a);font-size:24px;line-height:1.4}.bi .k-cap b{font-size:30px;font-weight:900}
.bi .k-tcs{display:flex;flex-direction:column;gap:22px;margin-top:34px}.bi .k-tc{display:grid;grid-template-columns:150px 1fr;gap:26px;align-items:center;border:3px solid var(--a);border-radius:34px;background:#fff;padding:26px 30px;text-align:left}
.bi .k-tci{width:150px;height:150px;border-radius:50%;background:var(--bg2);display:grid;place-items:center;color:var(--a)}.bi .k-tci .ic{width:80px;height:80px;stroke-width:1.4}
.bi .k-tag{display:inline-block;background:var(--a);color:#fff;border-radius:99px;padding:6px 26px;font-size:28px;font-weight:900}.bi .k-tcd{font-size:23px;line-height:1.5;margin-top:12px;color:#22262c}.bi .k-note{font-size:21px;color:#6b7380;margin-top:24px}
.bi .k-dbox{display:grid;grid-template-columns:1fr 1fr;border:3px solid var(--a);border-radius:30px;overflow:hidden;background:#fff}.bi .k-dl{background:var(--a);color:#fff;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:10px;padding:30px}
.bi .k-dtt{background:#fff;color:var(--a);border-radius:99px;padding:6px 26px;font-size:26px;font-weight:900}.bi .k-dn{font-size:76px;font-weight:900;line-height:1.1}.bi .k-dr{font-size:26px}.bi .k-dr2{padding:22px}.bi .k-dph{aspect-ratio:3/4;border-radius:16px}
.bi .k-soft{display:inline-block;background:var(--bg2);border-radius:99px;padding:14px 36px;font-size:26px;font-weight:700;margin-top:24px}.bi .k-rph{height:440px;margin:30px -24px 0;border-radius:4px}
.bi .k-ritems{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:22px}.bi .k-ri{background:#fff;border-radius:18px;padding:16px;display:flex;flex-direction:column;font-size:21px}.bi .k-ri b{font-size:25px;color:var(--a)}
.bi .k-flow{display:flex;align-items:center;gap:14px;margin-top:30px}.bi .k-flh{flex:none;width:150px;height:170px;border-radius:26px;background:linear-gradient(135deg,var(--a),var(--a2));color:#fff;font-size:40px;font-weight:900;display:grid;place-items:center;line-height:1.2}.bi .k-flow .k-steps{margin:0}
.bi .k-floor{display:grid;grid-template-columns:230px 1fr;border:3px solid var(--a);border-radius:30px;overflow:hidden;margin-top:30px;background:#fff}.bi .k-fl{background:var(--a);color:#fff;padding:26px 18px;display:flex;flex-direction:column;justify-content:center;align-items:flex-start}
.bi .k-fbadge{width:120px;height:120px;border-radius:50%;background:#fff;color:var(--a);font-size:34px;font-weight:900;display:grid;place-items:center;margin:0 auto 18px}.bi .k-cl.w{color:#fff;font-size:23px;padding:6px 0}.bi .k-cl.w .k-ck{color:#ffe9a6;width:26px;height:26px}
.bi .k-fg{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:18px}.bi .k-fph{aspect-ratio:4/3;border-radius:0}
.bi .k-brk{position:relative;padding:6px 40px}.bi .k-brk:before,.bi .k-brk:after{content:"";position:absolute;top:0;bottom:0;width:26px;border:7px solid #cfe6f2}.bi .k-brk:before{left:0;border-right:0}.bi .k-brk:after{right:0;border-left:0}
.bi .k-info .map{margin-top:34px}.bi .k-rows{display:flex;flex-direction:column;gap:16px;margin-top:30px}.bi .k-row{display:grid;grid-template-columns:150px 1fr;align-items:center;gap:18px;background:var(--a);color:#fff;border-radius:99px;padding:22px 40px;text-align:left}
.bi .k-ri2{display:flex;flex-direction:column;align-items:center;gap:4px;color:#ffe9a6}.bi .k-ri2 .ic{width:46px;height:46px}.bi .k-ri2 b{font-size:22px}.bi .k-rv{font-size:25px;font-weight:700;line-height:1.4}.bi .k-rv small{font-size:20px;font-weight:500;opacity:.9}.bi .k-rv.big{font-size:42px;font-weight:900}
.bi .k-rv.hrs{display:flex;flex-wrap:wrap;gap:6px 0}.bi .k-rv.hrs div{width:50%;display:flex;flex-direction:column;font-size:21px;padding-right:8px}.bi .k-rv.hrs span{color:#ffe9a6;font-weight:700}.bi .k-rv.hrs b{font-size:25px}
.bi .k-lfoot{background:var(--a);margin:44px -48px -40px;padding:6px 40px 36px}.bi .k-lfoot .k-foot{margin:0;padding:24px 0 14px}.bi .k-lfoot .k-fname{color:#fff}.bi .k-law{color:rgba(255,255,255,.85);font-size:19px;line-height:1.6}
.bi .k .ph{background:#e9eef0}.bi .rmap{position:relative;margin-top:28px;border-radius:20px;overflow:hidden;box-shadow:0 6px 24px rgba(20,40,80,.10)}.bi .mapph{aspect-ratio:1.72;width:100%;border-radius:0}.bi .rmap-s{display:flex;gap:14px;align-items:center;justify-content:center;background:#fff;color:#22262c;padding:16px;font-size:23px}.bi .rmap-s b{color:var(--a)}.bi .k-whr small{font-size:20px;font-weight:500;color:#5d6572}.bi .r-para{font-size:25px;line-height:1.6;margin-top:24px;opacity:.88}
.bi .k-kk{display:none}
.bi .k-g2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:34px}.bi .k-gc{background:#fff;border-radius:26px;padding:26px 22px;display:flex;flex-direction:column;align-items:center;gap:6px;box-shadow:0 6px 24px rgba(20,40,80,.07)}.bi .k-gc b{font-size:28px;color:var(--a)}.bi .k-gc span{font-size:22px;color:#4a5260}
.bi .k-gci{width:84px;height:84px;border-radius:50%;background:var(--bg2);color:var(--a);display:grid;place-items:center;flex:none}.bi .k-gci .ic{width:46px;height:46px}
.bi .k-mag{position:relative;margin:-64px -48px 0;height:700px;overflow:hidden}.bi .k-magph{position:absolute;inset:0;height:700px;border-radius:0}.bi .k-magph img{object-position:50% 22%}
.bi .k-magt{position:absolute;left:0;right:0;bottom:0;padding:160px 40px 46px;background:linear-gradient(180deg,transparent,rgba(8,14,28,.82) 52%)}
.bi .k .k-magt .k-h,.bi .k .k-magt .k-sub{color:#fff}.bi .k.k-hmag .k-magt .k-h .g,.bi.lk-h2 .k.k-hmag .k-magt .k-h>div:nth-child(2) .g{background:none;color:#ffe9a6;-webkit-text-fill-color:#ffe9a6}.bi .k-magt .k-sub{margin-top:16px}.bi .k .k-magt .k-kk span{color:#fff}
.bi .k-split{display:grid;grid-template-columns:330px 1fr;gap:26px;margin-top:36px;text-align:left}.bi .k-sph{height:470px;border-radius:28px}.bi .k-sph img{object-position:50% 20%}
.bi .k-nums{display:flex;flex-direction:column;justify-content:center;gap:14px}.bi .k-num{display:flex;gap:16px;align-items:center;background:#fff;border-radius:22px;padding:18px 20px;box-shadow:0 4px 18px rgba(20,40,80,.06)}
.bi .k-num>b{flex:none;width:58px;height:58px;border-radius:50%;background:var(--a);color:#fff;display:grid;place-items:center;font-size:24px;font-weight:900}.bi .k-num strong{display:block;font-size:26px;font-weight:900;color:var(--a)}.bi .k-num span{display:block;font-size:20px;color:#4a5260;line-height:1.35}
.bi .k-wgrid{display:flex;flex-wrap:wrap;justify-content:center;gap:16px;margin-top:34px}.bi .k-wg{width:calc(50% - 8px);background:#fff;border:3px solid var(--soft);border-radius:26px;padding:24px 20px;display:flex;align-items:center;gap:18px;text-align:left;font-size:24px;font-weight:600;line-height:1.35}
.bi .k-wgi{width:72px;height:72px;flex:none;border-radius:20px;background:var(--a);color:#fff;display:grid;place-items:center}.bi .k-wgi .ic{width:42px;height:42px}
.bi .k-sc{background:#fff;border:3px solid var(--a);border-radius:28px;margin-top:34px;overflow:hidden;text-align:left}.bi .k-sch{background:var(--a);color:#fff;font-size:30px;font-weight:900;padding:18px 30px;text-align:center}
.bi .k-scr{display:grid;grid-template-columns:56px 1fr 46px;align-items:center;gap:16px;padding:20px 30px;font-size:26px}.bi .k-scr+.k-scr{border-top:2px solid #eef0f3}.bi .k-scr>b{font-size:34px;font-weight:900;color:var(--a);font-style:italic}
.bi .k-sbx{width:42px;height:42px;border:3px solid var(--a);border-radius:10px;display:grid;place-items:center}.bi .k-sbx .k-ck{width:28px;height:28px}.bi .k-scn{margin-top:30px;color:var(--a)}
.bi .k-side{display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-top:38px;align-items:center}.bi .k-sideph{height:440px;border-radius:30px}
.bi .k-sidel{display:flex;flex-direction:column;gap:14px}.bi .k-sb{display:flex;align-items:center;gap:14px;background:#fff;border-radius:22px;padding:18px;text-align:left;font-size:24px;font-weight:600;line-height:1.35;box-shadow:0 4px 16px rgba(20,40,80,.07)}.bi .k-sbi{width:58px;height:58px;flex:none;border-radius:50%;background:var(--a);color:#fff;display:grid;place-items:center}.bi .k-sbi .ic{width:34px;height:34px}
.bi .k-tph2{height:400px;border-radius:30px;margin-top:34px}
.bi .k-zzs{margin-top:20px}.bi .k-zz{display:flex;align-items:center;gap:30px;padding:28px 6px;text-align:left}.bi .k-zz+.k-zz{border-top:2.5px dashed var(--soft)}.bi .k-zz.r{flex-direction:row-reverse;text-align:right}
.bi .k-zzi{position:relative;width:150px;height:150px;flex:none;border-radius:50%;background:linear-gradient(135deg,var(--a),var(--a2));color:#fff;display:grid;place-items:center}.bi .k-zzi .ic{width:74px;height:74px;stroke-width:1.5}
.bi .k-zzi b{position:absolute;top:-6px;left:-6px;width:52px;height:52px;border-radius:50%;background:#fff;color:var(--a);border:3px solid var(--a);display:grid;place-items:center;font-size:20px;font-weight:900}
.bi .k-zzt{flex:1;font-size:23px;line-height:1.5;color:#22262c}.bi .k-zzh{font-size:34px;font-weight:900;color:var(--a);margin-bottom:6px}
.bi .k-tgs{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:30px}.bi .k-tgs.odd .k-tg:last-child{grid-column:span 2}
.bi .k-tg{background:#fff;border-radius:28px;padding:30px 24px;display:flex;flex-direction:column;align-items:center;gap:10px;box-shadow:0 6px 24px rgba(20,40,80,.07)}.bi .k-tg b{font-size:30px;font-weight:900;color:var(--a)}.bi .k-tg span{font-size:21px;line-height:1.5;color:#3a404a}
.bi .k-tgi{width:110px;height:110px;border-radius:50%;background:var(--bg2);color:var(--a);display:grid;place-items:center}.bi .k-tgi .ic{width:60px;height:60px;stroke-width:1.5}
.bi .k-whol{display:flex;flex-direction:column;gap:14px;margin-top:30px}.bi .k-whr{display:flex;align-items:center;gap:20px;background:#fff;border-radius:99px;padding:14px 30px 14px 16px;font-size:27px;font-weight:700;text-align:left;box-shadow:0 4px 18px rgba(20,40,80,.07)}.bi .k-whr span{flex:1}.bi .k-whr .k-gci{width:70px;height:70px}.bi .k-whr .k-gci .ic{width:38px;height:38px}
.bi .k-fr{display:flex;align-items:center;gap:18px;padding:14px 0;font-size:26px}.bi .k-fr+.k-fr{border-top:1.5px dashed #c7d6e2}.bi .k-fr b{flex:none;width:52px;height:52px;border-radius:14px;background:var(--a);color:#fff;display:grid;place-items:center;font-size:21px;font-weight:900}
.bi .k-tl{position:relative;margin:40px 0 10px;text-align:left}.bi .k-tli{display:grid;grid-template-columns:120px 1fr;gap:20px;align-items:center;position:relative;padding-bottom:22px}
.bi .k-tli:not(:last-child):before{content:"";position:absolute;left:59px;top:100px;bottom:0;border-left:4px dotted var(--a)}
.bi .k-tln{width:120px;height:120px;border-radius:50%;background:var(--a);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:18px;font-weight:700;letter-spacing:.06em}.bi .k-tln b{font-size:40px;line-height:1;font-weight:900;letter-spacing:0}
.bi .k-tlc{display:flex;align-items:center;gap:20px;background:#fff;border-radius:26px;padding:22px 26px;box-shadow:0 4px 20px rgba(20,40,80,.07)}.bi .k-tlc b{display:block;font-size:30px;font-weight:900;color:var(--a)}.bi .k-tlc span{display:block;font-size:22px;color:#4a5260}
.bi .k-chev{display:flex;margin:44px 0 10px}.bi .k-cv{flex:1;min-width:0;height:300px;background:var(--soft);color:var(--ink);clip-path:polygon(0 0,calc(100% - 30px) 0,100% 50%,calc(100% - 30px) 100%,0 100%,30px 50%);margin-left:-14px;padding:0 30px 0 44px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px}
.bi .k-cv:first-child{margin-left:0;clip-path:polygon(0 0,calc(100% - 30px) 0,100% 50%,calc(100% - 30px) 100%,0 100%);padding-left:20px}.bi .k-cv.dk{background:var(--a);color:#fff}.bi .k-cv small{font-size:16px;font-weight:800;letter-spacing:.05em;opacity:.8}.bi .k-cv .ic{width:52px;height:52px}.bi .k-cv b{font-size:27px;font-weight:900}.bi .k-cv span{font-size:17px;line-height:1.35}
.bi .k-nrs{margin-top:30px;text-align:left}.bi .k-nr{display:flex;gap:26px;align-items:flex-start;padding:26px 10px}.bi .k-nr+.k-nr{border-top:2px solid #e3e6ea}.bi .k-nrn{font-size:76px;line-height:.9;font-weight:900;color:var(--soft);-webkit-text-stroke:2px var(--a);font-style:italic}
.bi .k-prom>.k-hw{font-size:38px;margin-top:14px}.bi .k-strip.r{margin-top:30px}.bi .k-strip.r .k-sp{border-radius:20px}
.bi .k-c3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:34px}.bi .k-c3c{background:#fff;border-radius:26px;padding:28px 14px;display:flex;flex-direction:column;align-items:center;gap:10px;box-shadow:0 6px 22px rgba(20,40,80,.07)}.bi .k-c3c .k-tci{width:104px;height:104px}.bi .k-c3c .k-tci .ic{width:56px;height:56px}.bi .k-c3c b{font-size:26px;font-weight:900;color:var(--a);line-height:1.3}.bi .k-c3c span{font-size:19px;line-height:1.5;color:#3a404a}
.bi .k-tbl{background:#fff;border-radius:28px;border-top:8px solid var(--a);margin-top:30px;padding:10px 34px;text-align:left;box-shadow:0 6px 24px rgba(20,40,80,.07)}.bi .k-tr2{display:grid;grid-template-columns:170px 1fr;gap:18px;padding:22px 0;align-items:center}.bi .k-tr2+.k-tr2{border-top:2px solid #eef0f3}
.bi .k-tl2{display:flex;align-items:center;gap:10px;color:var(--a)}.bi .k-tl2 .ic{width:34px;height:34px}.bi .k-tl2 b{font-size:24px}.bi .k-tv{font-size:24px;font-weight:600;line-height:1.45}.bi .k-tv small{display:block;font-size:19px;color:#5d6572;font-weight:500}.bi .k-tv.big{font-size:38px;font-weight:900;color:var(--a)}
.bi .k-hrs2{display:flex;flex-wrap:wrap}.bi .k-hrs2 div{width:50%;display:flex;flex-direction:column;padding:4px 8px 4px 0}.bi .k-hrs2 span{font-size:19px;color:var(--a);font-weight:700}.bi .k-hrs2 b{font-size:23px}.bi .k-law.dk{color:#6b7380;margin-top:26px;font-size:18px;line-height:1.6}
/* 제목 모양 */
.bi.lk-h1 .k-kk,.bi.lk-h3 .k-kk{display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:14px;font-size:20px;font-weight:800;letter-spacing:.08em;color:var(--a)}
.bi.lk-h1 .k-kk b{background:var(--a);color:#fff;border-radius:99px;padding:3px 14px;letter-spacing:0}
.bi.lk-h1 .k .k-h .g{background:linear-gradient(transparent 60%,rgba(255,214,64,.65) 60%);color:var(--a);-webkit-text-fill-color:var(--a)}
.bi.lk-h2 .k .k-h>div:nth-child(2){display:inline-block;background:var(--a);color:#fff;border-radius:16px;padding:2px 28px 8px;margin-top:12px}.bi.lk-h2 .k .k-h>div:nth-child(2) .g{background:none;color:#ffe9a6;-webkit-text-fill-color:#ffe9a6}
.bi.lk-h2 .k .k-h .g{background:none;color:var(--a);-webkit-text-fill-color:var(--a)}.bi.lk-h2 .k-pill{background:var(--a)}
.bi.lk-h3 .k-kk{justify-content:flex-start}.bi.lk-h3 .k-kk b{font-size:44px;font-style:italic;letter-spacing:0;color:var(--soft);-webkit-text-stroke:1.5px var(--a)}
.bi.lk-h3 .k .k-h{text-align:left;border-left:12px solid var(--a);padding-left:24px}.bi.lk-h3 .k-hw,.bi.lk-h3 .k .k-hero>.k-sub{text-align:left}
/* 바탕 */
.bi .k.tint{--kbg:var(--bg2)}.bi.lk-b1 .k,.bi.lk-b3 .k{--kbg:#fff}.bi.lk-b2 .blk:nth-child(even) .k{--kbg:var(--bg2)}.bi.lk-b2 .k.tint .k-wbox{background:var(--bg2)}
.bi.lk-b1{background:#fff}.bi.lk-b1 .blk+.blk .k{border-top:3px dashed #e3e6ea}.bi.lk-b1 .k-gc,.bi.lk-b1 .k-num,.bi.lk-b1 .k-tg,.bi.lk-b1 .k-c3c,.bi.lk-b1 .k-tlc,.bi.lk-b1 .k-whr,.bi.lk-b1 .k-sb{background:var(--bg2);box-shadow:none}
.bi.lk-b2 .blk:nth-child(even) .k{background:var(--bg2)}.bi.lk-b2 .k.tint{background:#fff}
.bi.lk-b3{background:var(--soft)}.bi.lk-b3 .k{background:#fff;margin:24px 24px 0;border-radius:44px;overflow:hidden}.bi.lk-b3 .blk:last-child .k{margin-bottom:24px}.bi.lk-b3 .k.tint{background:#fbfcfd}
/* 모서리 · 테두리 */
.bi.lk-s1 .k-card,.bi.lk-s1 .k-tc,.bi.lk-s1 .k-oval,.bi.lk-s1 .k-wbox,.bi.lk-s1 .k-blue,.bi.lk-s1 .k-adv,.bi.lk-s1 .k-wc,.bi.lk-s1 .k-dbox,.bi.lk-s1 .k-floor,.bi.lk-s1 .k-gc,.bi.lk-s1 .k-num,.bi.lk-s1 .k-wg,.bi.lk-s1 .k-sc,.bi.lk-s1 .k-sb,.bi.lk-s1 .k-tg,.bi.lk-s1 .k-tlc,.bi.lk-s1 .k-c3c,.bi.lk-s1 .k-tbl,.bi.lk-s1 .k-sph,.bi.lk-s1 .k-sideph,.bi.lk-s1 .k-tph2{border-radius:8px}
.bi.lk-s1 .k-pill,.bi.lk-s1 .k-bp,.bi.lk-s1 .k-row,.bi.lk-s1 .k-tag,.bi.lk-s1 .k-soft,.bi.lk-s1 .k-whr,.bi.lk-s1 .k-cap{border-radius:6px}.bi.lk-s1.lk-b3 .k{border-radius:12px}
.bi.lk-s2 .k-tc,.bi.lk-s2 .k-oval,.bi.lk-s2 .k-dbox,.bi.lk-s2 .k-floor,.bi.lk-s2 .k-wg,.bi.lk-s2 .k-white{border-color:transparent;box-shadow:0 12px 34px rgba(20,40,80,.10)}.bi.lk-s2 .k-pill{box-shadow:0 8px 18px rgba(20,40,80,.18)}`;
/* 사진 자리마다 '이런 사진이어야 해요' 조건: 함수가 제미나이로 후보를 보고 어울리는 사진만 고름 */
const PV={"교통사고": "목이나 허리를 손으로 잡고 아파하는 성인 한 명(교통사고 뒤 통증 느낌)", "허리": "허리를 손으로 잡고 아파하는 성인 한 명", "목": "목이나 어깨를 손으로 잡고 아파하는 성인 한 명", "관절": "무릎이나 관절을 손으로 잡고 아파하는 사람 한 명", "두통": "머리를 손으로 짚고 두통을 느끼는 사람 한 명", "다이어트": "줄자로 허리를 재거나 건강한 식단을 든 사람", "비염": "휴지로 코를 풀거나 재채기하는 사람 한 명", "성장": "키를 재거나 밝게 웃는 아이", "여성": "배나 허리를 손으로 감싸고 불편해하는 여성 한 명", "요양": "병원에서 돌봄을 받는 어르신 환자", "피부": "얼굴 피부를 손으로 만지며 살피는 여성 한 명", "기본": "의사와 환자가 상담하는 진료 장면"};
function photoVet(o){const t=o.topic in PV?o.topic:"기본",tn=t==="기본"?"건강":t,c=o.clinic||{},v={};
  v.person=PV[t]+". 사람이 사진 가운데에 크게 있고 배경이 단순한 세로 사진이면 더 좋아요. 몸에 그린 문신·예술 사진은 안 돼요.";
  v.band="'"+tn+"' 통증·불편함을 설명하는 깔끔한 건강 사진(아픈 부위를 잡은 사람, 척추·몸 그림, 진료 장면).";
  treatRows(T[t]||T["기본"],c).forEach((r,k)=>{if(r)v["treat"+k]="한의원·병원에서 '"+r[1]+"'(을)를 받는 장면이나 그 치료 도구가 보이는 깔끔한 사진.";});
  v.room="깨끗한 병원 입원실(병실) 사진.";return v;}
/* 사진 태그(영어)에 있어야 할 낱말: 제미나이 확인이 안 될 때도 엉뚱한 사진(커플·풍경 등)을 막음 */
const PAIN="pain|ache|hurt|sore|injur|headache|migraine|backache|massage|physio|stiff|neck|spine|tired|sick|ill|doctor|patient";
function photoNeed(o){const t=o.topic in PV?o.topic:"기본",c=o.clinic||{},n={};
  const own={"다이어트":"diet|weight|waist|scale|salad|fitness|slim","비염":"sneez|tissue|nose|allerg|cold|flu|sick","성장":"child|kid|height|grow|boy|girl","피부":"skin|face|acne|beauty|cream|derma","요양":"hospital|patient|nurse|senior|care|elderly","기본":"doctor|patient|clinic|medical|consult|health"}[t];
  n.person=own||PAIN;n.band=(own?own+"|":"")+PAIN+"|clinic|medical|health";
  treatRows(T[t]||T["기본"],c).forEach((r,k)=>{if(r)n["treat"+k]="acupunct|needle|therap|massage|medic|clinic|doctor|treat|herb|cupping|physio|hospital|health|chiropract|spa|patient|exercise|rehab|diet|skin";});
  n.room="hospital|bed|ward|room|clinic|medical|interior";return n;}
/* 사진 자리마다 무료 사진 검색어 (영어) */
function photoQueries(o){const p=T[o.topic]||T["기본"],c=o.clinic,q={person:p.person.q};
  treatRows(p,c).forEach((r,k)=>{if(r)q["treat"+k]=r[3];});if(c.room&&c.room.on)q.room="hospital inpatient room";q.band=KBQ[o.topic]||KBQ["기본"];return q;}
const KBQ={"교통사고":"car accident neck pain","허리":"lower back pain spine","목":"neck shoulder pain office","관절":"knee joint pain","두통":"headache woman","다이어트":"healthy diet salad","비염":"allergy sneezing tissue","성장":"children running park","여성":"woman wellness relax","요양":"hospital recovery care","피부":"skin care face","기본":"korean medicine clinic"};

/* 이미지 안의 디자인 (가로 860px). --m 진한 색, --a 강조 색 */
const CSS=`.bi{width:860px;background:#fff;color:var(--m);font-family:"Pretendard Variable",Pretendard,"Noto Sans KR","Malgun Gothic",sans-serif;letter-spacing:-.02em;line-height:1.35;word-break:keep-all}
.bi *{box-sizing:border-box}.bi .ac{color:var(--a);font-weight:inherit}.bi .s{padding:70px 64px;position:relative}.bi .alt{background:var(--bg2)}
.bi .center{display:flex;justify-content:center;text-align:center}.bi .row2{display:flex;justify-content:space-between;align-items:center;gap:20px}
.bi .logo{display:block;max-height:64px;max-width:340px;margin:0 auto 40px}.bi .logot{text-align:center;font-weight:800;font-size:28px;margin:0 auto 40px;color:var(--m)}
.bi .h .bar{display:block;width:64px;height:6px;background:var(--a);border-radius:3px;margin-bottom:26px}.bi .h .t1,.bi .h .t2{font-weight:900;font-size:72px;line-height:1.16}
.bi .h.big .t1,.bi .h.big .t2{font-size:74px}.bi .sub{font-size:30px;margin-top:22px;color:#30384a}.bi .sub.strong{font-weight:800;color:var(--m)}
.bi .art{position:relative;width:200px;height:200px;flex:none;display:grid;place-items:center;color:var(--m)}.bi .artic{width:180px;height:180px;stroke-width:1.5}
.bi .artb{position:absolute;right:6px;top:6px;width:76px;height:76px;border-radius:50%;background:var(--a);color:#fff;display:grid;place-items:center;border:6px solid #fff}.bi .artb .ic{width:44px;height:44px;stroke-width:2.6}
.bi .ci{flex:none;width:96px;height:96px;border-radius:50%;background:var(--soft);color:var(--m);display:grid;place-items:center}.bi .ci .ic{width:54px;height:54px}
.bi .ci.sm{width:64px;height:64px}.bi .ci.sm .ic{width:36px;height:36px}.bi .ci.xs{width:44px;height:44px}.bi .ci.xs .ic{width:26px;height:26px}.bi .ci.lg{width:110px;height:110px}.bi .ci.lg .ic{width:60px;height:60px}
.bi .ilist{margin:56px 40px 0}.bi .il{display:flex;align-items:center;gap:40px;padding:26px 0;border-bottom:2px solid #e3e8ec}.bi .il:last-child{border:0}.bi .ilt{font-size:42px;font-weight:800}
.bi .cards2{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:50px}.bi .cd{background:var(--soft2);border-radius:20px;padding:26px;display:flex;gap:20px;align-items:center}
.bi .cdi{width:70px;height:70px;flex:none;color:var(--m);display:grid;place-items:center}.bi .cdi .ic{width:62px;height:62px}.bi .cda{font-size:34px;font-weight:800}.bi .cdb{font-size:24px;color:#4a5466;margin-top:4px;border-left:2px solid #c9d3d0;padding-left:12px}
.bi .s-warn .center{margin-top:40px}.bi .nlist{margin-top:46px}.bi .nl{display:flex;align-items:center;gap:26px;padding:20px 0;border-bottom:2px solid #e3e8ec}.bi .nn{font-size:26px;color:var(--a);width:40px;font-weight:600}
.bi .vl{width:2px;height:56px;background:#d9dfe3;flex:none}.bi .nlt{font-size:40px;font-weight:800}.bi .note{text-align:center;margin-top:34px;font-size:28px}.bi .note .dash{display:block;width:44px;height:4px;background:var(--a);margin:0 auto 18px}
.bi .sep{height:16px;background:var(--a)}
.bi .pgrid{display:grid;grid-template-columns:1.25fr 1fr;gap:20px;align-items:center;margin-top:30px}.bi .ph{position:relative;overflow:hidden;border-radius:18px;background:#e9eef0}.bi .ph img{width:100%;height:100%;object-fit:cover;display:block}
.bi .phe{width:100%;height:100%;display:grid;place-items:center;color:#8a96a3;font-size:26px;border:3px dashed #c9d2da;border-radius:18px}
.bi .pp{aspect-ratio:1/1}.bi .ps{display:flex;align-items:center;gap:18px;padding:14px 0;border-bottom:2px solid #e3e8ec;font-size:28px;font-weight:700}.bi .ps:last-child{border:0}
.bi .badges{display:grid;grid-template-columns:repeat(3,1fr);margin-top:30px;border-top:2px solid #e3e8ec;border-bottom:2px solid #e3e8ec}.bi .bd{display:flex;flex-direction:column;align-items:center;gap:12px;padding:22px 8px;font-size:28px;font-weight:800;color:var(--a);text-align:center}
.bi .bd+.bd{border-left:2px solid #e3e8ec}.bi .bd .ic{width:60px;height:60px;padding:12px;border-radius:50%;background:var(--soft);color:var(--m);box-sizing:content-box}
.bi .cname{font-size:34px;font-weight:700}.bi .ctitle{font-size:84px;font-weight:900;line-height:1.15;margin-top:8px}.bi .ctitle.tc{text-align:center}
.bi .cd.v{flex-direction:column;align-items:flex-start;padding:34px;gap:16px;background:#fff}.bi .cdi.big{width:110px;height:110px;border-radius:50%;background:var(--soft);display:grid;place-items:center}.bi .cdi.big .ic{width:60px;height:60px}
.bi .cd .dash{display:block;width:40px;height:3px;background:var(--a)}.bi .cdt{font-size:38px;font-weight:800;line-height:1.25}
.bi .tl{margin-top:46px;border-left:4px solid var(--a);margin-left:12px}.bi .ts{display:grid;grid-template-columns:1fr 170px;align-items:center;padding:24px 0 24px 34px;border-bottom:2px solid #e3e8ec;position:relative}
.bi .tdot{position:absolute;left:-14px;top:36px;width:24px;height:24px;border-radius:50%;background:var(--a);border:5px solid #fff}.bi .tla{font-size:34px;font-weight:800;color:var(--a)}
.bi .tlr{display:flex;align-items:center;gap:18px;margin-top:14px;font-size:32px;font-weight:700}.bi .tart{display:grid;place-items:center;color:var(--m)}.bi .tart .ic{width:130px;height:130px;stroke-width:1.4}
.bi .box{background:var(--soft2);border-radius:16px;padding:26px;text-align:center;font-size:28px;margin-top:34px;font-weight:600}.bi .box.ic1{display:flex;justify-content:center;align-items:center;gap:14px}.bi .box.ic1 .ic{width:38px;height:38px;color:var(--a)}
.bi .s-time .center{margin-top:30px}.bi .s-time .logo{margin:0 auto;max-height:52px}
.bi .trs{margin-top:40px}.bi .tr{display:grid;grid-template-columns:110px 1fr 300px;gap:26px;align-items:center;padding:22px 0;border-bottom:2px solid #e3e8ec}.bi .trn{color:var(--a);font-weight:800;font-size:24px}
.bi .tra{font-size:38px;font-weight:900}.bi .trb{font-size:28px;margin-top:6px}.bi .tph{aspect-ratio:3/2}
.bi .dgrid{display:grid;grid-template-columns:1fr 1fr;align-items:end;gap:20px}.bi .vbar{display:block;width:8px;height:40px;background:var(--a);margin-bottom:26px}.bi .dn{font-size:96px;font-weight:900;line-height:1.05}
.bi .dt{font-size:58px;font-weight:900;margin-top:6px}.bi .dr{font-size:30px;margin-top:12px}.bi .dph{aspect-ratio:3/4;background:transparent}
.bi .dsec{margin-top:44px}.bi .dsh{display:flex;align-items:center;gap:14px;font-size:32px;font-weight:800;color:var(--a);margin-bottom:12px}.bi .dsh i{width:6px;height:30px;background:var(--a)}.bi .dsh b{flex:1;height:2px;background:#cfe3d9}
.bi .dli{display:flex;align-items:center;gap:18px;font-size:32px;padding:8px 0 8px 10px}.bi .dli i{width:12px;height:12px;border-radius:50%;background:var(--a);flex:none}
.bi .rph{aspect-ratio:2/1;margin-top:40px}.bi .rgrid{display:grid;grid-template-columns:1fr 1fr;gap:6px 30px;margin-top:36px}.bi .ri{display:flex;gap:18px;align-items:center;padding:14px 0;border-bottom:2px solid #e3e8ec}
.bi .ria{font-size:28px;font-weight:800}.bi .rib{font-size:22px;color:#4a5466}.bi .rnote{text-align:center;font-size:34px;font-weight:800;margin-top:34px}
.bi .fgrid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:40px}.bi .fi{display:grid;grid-template-columns:1.35fr 1fr;background:var(--soft2);border-radius:16px;overflow:hidden}
.bi .fph{aspect-ratio:4/3;border-radius:0}.bi .fl{padding:18px;display:flex;flex-direction:column;gap:6px}.bi .fn{font-size:20px;color:var(--a);font-weight:700;margin-top:8px}.bi .ft{font-size:24px;font-weight:800;line-height:1.3}
.bi .s-info .cname{margin-bottom:20px}.bi .ihead{display:flex;align-items:center;justify-content:center;gap:26px;padding-bottom:30px;border-bottom:2px solid #e3e8ec}.bi .ihead .ctitle{font-size:54px;color:var(--a);white-space:nowrap}
.bi .ibadge{border-left:3px solid #d0d8d4;padding-left:24px;font-size:36px;font-weight:900;text-align:center}
.bi .itel{display:flex;align-items:center;gap:20px;background:var(--soft2);border-radius:16px;padding:20px 30px;margin:34px auto 0;width:fit-content}.bi .itel>.ic{width:50px;height:50px}.bi .itl{font-size:22px}.bi .itn{font-size:42px;font-weight:900}
.bi .ihours{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:18px}.bi .ih{display:flex;align-items:center;gap:18px;background:var(--soft2);border-radius:16px;padding:20px 24px}.bi .ih>.ic{width:50px;height:50px;flex:none}
.bi .ihl{font-size:22px}.bi .iht{font-size:36px;font-weight:900}.bi .iaddr{text-align:center;font-size:34px;font-weight:700;margin-top:34px;padding-top:30px;border-top:2px solid #e3e8ec;line-height:1.5}
.bi .map{position:relative;margin-top:34px}.bi .map svg{display:block}.bi .mst{position:absolute;left:4%;top:66%;font-size:24px;font-weight:800;background:#fff;border-radius:8px;padding:4px 10px}
.bi .mwk{position:absolute;left:36%;top:28%;display:flex;gap:8px;align-items:center;background:var(--m);color:#fff;border-radius:12px;padding:8px 14px;font-size:22px;font-weight:700}.bi .mwk .ic{width:28px;height:28px}
.bi .mcl{position:absolute;right:4%;top:18%;background:var(--m);color:#fff;border-radius:12px;padding:10px 16px;font-size:24px;font-weight:800}
.bi .ipark{display:flex;align-items:center;gap:18px;background:var(--soft2);border-radius:16px;padding:22px 28px;margin-top:20px;font-size:30px}.bi .ipark>.ic{width:50px;height:50px;color:var(--a)}.bi .ipark b{color:var(--a);border-right:2px solid #d0d8d4;padding-right:18px}
.bi .kick{display:none}.bi .foot{margin-top:40px}.bi .foot .logo{margin:0 auto}.bi .ic{width:1em;height:1em}`+K_CSS+R_CSS+N_CSS;

/* ── 이미지로 저장: 화면 구역을 그대로 SVG(foreignObject)에 담아 canvas에 그림. 사진·글꼴은 data URL로 넣음 ── */
const blob2url=b=>new Promise(ok=>{const r=new FileReader();r.onload=()=>ok(r.result);r.readAsDataURL(b);});
const CACHE={};
async function dataURL(src){if(!src||src.startsWith("data:"))return src;if(CACHE[src])return CACHE[src];
  try{const r=await fetch(src,{mode:"cors"});CACHE[src]=await blob2url(await r.blob());}catch(e){CACHE[src]="";}return CACHE[src];}
let FONT_CSS=null;
async function fontCSS(url){if(FONT_CSS!=null)return FONT_CSS;FONT_CSS="";
  if(url)try{const d=await dataURL(url);if(d)FONT_CSS=`@font-face{font-family:"Pretendard Variable";font-weight:45 920;src:url(${d}) format("woff2")}`;}catch(e){}return FONT_CSS;}
/* 손글씨 글꼴: 쓰인 글자만 담은 작은 파일을 구글 글꼴에서 받아 그림 안에 넣음 */
const HW={};
async function hwCSS(t){t=[...new Set(String(t||"").replace(/\s/g,""))].join("");if(!t)return "";if(HW[t]!=null)return HW[t];HW[t]="";
  try{const css=await (await fetch("https://fonts.googleapis.com/css2?family=Nanum+Pen+Script&text="+encodeURIComponent(t))).text();
    const u=(css.match(/url\((https:[^)]+)\)/)||[])[1];const d=u&&await dataURL(u);if(d)HW[t]=`@font-face{font-family:"Nanum Pen Script";src:url(${d})}`;}catch(e){}return HW[t];}
/* 다른 구글 글꼴도 쓰인 글자만 받아 그림 안에 넣음 (명조 등) */
async function gfCSS(fam,t){t=[...new Set(String(t||"").replace(/\s/g,""))].join("");if(!t)return "";const key=fam+"|"+t;if(HW[key]!=null)return HW[key];HW[key]="";
  try{let css=await (await fetch("https://fonts.googleapis.com/css2?family="+fam+"&text="+encodeURIComponent(t))).text();
    for(const u of [...new Set(css.match(/https:[^)]+/g)||[])]){const d=await dataURL(u);if(!d)return "";css=css.split(u).join(d);}HW[key]=css;}catch(e){}return HW[key];}
async function snap(el,o){o=o||{};const scale=o.scale||1.5,w=el.offsetWidth,h=el.offsetHeight;
  const cl=el.cloneNode(true);cl.querySelectorAll("[contenteditable]").forEach(x=>x.removeAttribute("contenteditable"));
  cl.querySelectorAll(".phe").forEach(x=>x.parentNode.remove());cl.querySelectorAll(".sel").forEach(x=>x.classList.remove("sel"));
  for(const im of cl.querySelectorAll("img")){const d=await dataURL(im.getAttribute("src"));if(d)im.setAttribute("src",d);else im.remove();}
  const css=(await fontCSS(o.font))+(await hwCSS([...cl.querySelectorAll(".k-hw,.k-q.hw")].map(x=>x.textContent).join("")))+(await gfCSS("Nanum+Myeongjo:wght@400;800",[...cl.querySelectorAll(".r-beige .r-t,.r-beige .r-no,.r-dash,.r-phc.beige .r-cap b,.r-doc.beige .r-dn,.r-fac.beige .r-fh,.r-info.beige .r-t,.n-serif,.n-num,.n-wm,.n-fbx b")].map(x=>x.textContent).join("")))+CSS+STYLE_CSS+(o.vars||"");
  const html=new XMLSerializer().serializeToString(cl);
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><foreignObject x="0" y="0" width="${w}" height="${h}"><div xmlns="http://www.w3.org/1999/xhtml" class="bi ${esc(o.cls||"")}" style="${esc(o.style||"")}"><style>${css}</style>${html}</div></foreignObject></svg>`;
  const img=new Image();img.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg);await img.decode();
  const cv=document.createElement("canvas");cv.width=Math.round(w*scale);cv.height=Math.round(h*scale);const g=cv.getContext("2d");
  g.fillStyle="#fff";g.fillRect(0,0,cv.width,cv.height);g.drawImage(img,0,0,cv.width,cv.height);
  /* 글꼴이 늦게 들어오는 경우가 있어 한 번 더 그림 */
  await new Promise(r=>setTimeout(r,120));g.drawImage(img,0,0,cv.width,cv.height);return cv;}
const toBlob=(cv,type,q)=>new Promise(ok=>cv.toBlob(ok,type||"image/jpeg",q||0.92));

/* ── 압축 없는 ZIP (구역별 그림 묶기) ── */
const CRC=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;t[n]=c>>>0;}return t;})();
function crc32(u){let c=0xffffffff;for(let i=0;i<u.length;i++)c=CRC[(c^u[i])&255]^(c>>>8);return (c^0xffffffff)>>>0;}
async function zip(files){const enc=new TextEncoder(),parts=[],cen=[];let off=0;
  for(const f of files){const data=new Uint8Array(await f.blob.arrayBuffer()),name=enc.encode(f.name),crc=crc32(data);
    const lh=new DataView(new ArrayBuffer(30));lh.setUint32(0,0x04034b50,true);lh.setUint16(4,20,true);lh.setUint16(6,0x800,true);lh.setUint32(14,crc,true);lh.setUint32(18,data.length,true);lh.setUint32(22,data.length,true);lh.setUint16(26,name.length,true);
    parts.push(lh.buffer,name,data);
    const ch=new DataView(new ArrayBuffer(46));ch.setUint32(0,0x02014b50,true);ch.setUint16(4,20,true);ch.setUint16(6,20,true);ch.setUint16(8,0x800,true);ch.setUint32(16,crc,true);ch.setUint32(20,data.length,true);ch.setUint32(24,data.length,true);ch.setUint16(28,name.length,true);ch.setUint32(42,off,true);
    cen.push(ch.buffer,name);off+=30+name.length+data.length;}
  const cs=cen.reduce((a,b)=>a+(b.byteLength||b.length),0),end=new DataView(new ArrayBuffer(22));end.setUint32(0,0x06054b50,true);end.setUint16(8,files.length,true);end.setUint16(10,files.length,true);end.setUint32(12,cs,true);end.setUint32(16,off,true);
  return new Blob([...parts,...cen,end.buffer],{type:"application/zip"});}

/* ── 디자인: 네이버 상위 블로그 이미지에서 본 모양 몇 가지 (st-*) ── */
const STYLES={
  ref_cream:{name:"네이버 참고형 · 크림 에디토리얼(빨강)",m:"#2b2420",a:"#a3362a",nv:1,css:".bi.st-ref_cream{--nb:#f6efe6;--nk:#2b2420;--na:#a3362a;--na2:#e8c9a0;--nl:#fffaf3;--nd:#3e2f26;--nd2:#5a4030;--nr:#a3362a}"},
  ref_brown:{name:"네이버 참고형 · 따뜻한 갈색",m:"#2a1f1a",a:"#8a5a2b",nv:1,css:".bi.st-ref_brown{--nb:#efe6dc;--nk:#2a1f1a;--na:#8a5a2b;--na2:#e9b98a;--nl:#f8f1e8;--nd:#2a1f1a;--nd2:#4d382c;--nr:#8a3b25}"},
  ref_green:{name:"네이버 참고형 · 짙은 초록",m:"#1f2b23",a:"#1f6b47",nv:1,css:".bi.st-ref_green{--nb:#f3f5f0;--nk:#1f2b23;--na:#1f6b47;--na2:#ffd66b;--nl:#e8f1ea;--nd:#1d4a35;--nd2:#35503f;--nr:#b8452e}"},
  ref_navy:{name:"네이버 참고형 · 네이비 + 금색",m:"#14213d",a:"#1c3f94",nv:1,css:".bi.st-ref_navy{--nb:#f1f3f7;--nk:#14213d;--na:#1c3f94;--na2:#e9b949;--nl:#e8eefb;--nd:#13254f;--nd2:#25406b;--nr:#1c3f94}"},
  ref_blue:{name:"네이버 참고형 · 밝은 파랑",m:"#12324f",a:"#1f7fd1",nv:1,css:".bi.st-ref_blue{--nb:#eef5fb;--nk:#12324f;--na:#1f7fd1;--na2:#ffd84d;--nl:#e2effb;--nd:#135ea3;--nd2:#2a6fb0;--nr:#1f7fd1}"},
  ref_pink:{name:"네이버 참고형 · 핑크",m:"#3a2328",a:"#e3517a",nv:1,css:".bi.st-ref_pink{--nb:#fdf1f3;--nk:#3a2328;--na:#e3517a;--na2:#f7a8bd;--nl:#fde4ea;--nd:#9c2f50;--nd2:#b83a5e;--nr:#e3517a}"},
  ref_teal:{name:"네이버 참고형 · 청록",m:"#173a3a",a:"#1b8a85",nv:1,css:".bi.st-ref_teal{--nb:#eef6f5;--nk:#173a3a;--na:#1b8a85;--na2:#7dd3c0;--nl:#dff0ee;--nd:#176b67;--nd2:#22807b;--nr:#1b8a85}"},
  ref_gold:{name:"네이버 참고형 · 베이지 + 금색",m:"#2c241b",a:"#a9824a",nv:1,css:".bi.st-ref_gold{--nb:#f5efe5;--nk:#2c241b;--na:#a9824a;--na2:#e7cf9f;--nl:#fbf6ee;--nd:#6d5a43;--nd2:#8a7358;--nr:#a9824a}"},
  real_brown:{name:"네이버 실제형 · 갈색 카드뉴스",m:"#2a1f1a",a:"#e9b98a",real:1,rf:"dark",css:".bi.st-real_brown{--rbg:#2a1f1a;--rbg2:#4d382c}"},
  real_navy:{name:"네이버 실제형 · 남색 카드뉴스",m:"#0e1a30",a:"#ffd257",real:1,rf:"dark",css:".bi.st-real_navy{--rbg:#0e1a30;--rbg2:#25406b}"},
  real_forest:{name:"네이버 실제형 · 짙은 초록 카드뉴스",m:"#1b261f",a:"#cfe6a6",real:1,rf:"dark",css:".bi.st-real_forest{--rbg:#1b261f;--rbg2:#35503f}"},
  real_beige:{name:"네이버 실제형 · 베이지 명조(초록)",m:"#2a2622",a:"#3f6b45",real:1,rf:"beige",css:".bi.st-real_beige{--rbg:#f4efe6;--rk2:#b8452e}"},
  real_beige2:{name:"네이버 실제형 · 베이지 명조(갈색)",m:"#2a2622",a:"#9a5b2e",real:1,rf:"beige",css:".bi.st-real_beige2{--rbg:#f6f0e7}"},
  real_photo:{name:"네이버 실제형 · 사진 위 굵은 글씨(주황)",m:"#14223d",a:"#f26a1b",real:1,rf:"pho",css:".bi.st-real_photo{--rbg:#eef3f8}.bi.st-real_photo .r-big .y,.bi.st-real_photo .r-phc .r-cap b{color:#ffd400}"},
  real_photo2:{name:"네이버 실제형 · 사진 위 굵은 글씨(파랑)",m:"#14223d",a:"#1f62d6",real:1,rf:"pho",css:".bi.st-real_photo2{--rbg:#f4f6fa}.bi.st-real_photo2 .r-big .y,.bi.st-real_photo2 .r-phc .r-cap b{color:#ffd400}"},
  card:{name:"네이버 카드형 · 블루",m:"#121417",a:"#0b5ccc",a2:"#18bdf0",card:1,css:""},
  card_navy:{name:"카드형 · 네이비",m:"#121417",a:"#1c3f94",a2:"#4f86f7",card:1,css:""},
  card_green:{name:"카드형 · 그린",m:"#121417",a:"#11805a",a2:"#36c48a",card:1,css:""},
  card_coral:{name:"카드형 · 코랄",m:"#121417",a:"#e0533b",a2:"#ff9c6e",card:1,css:""},
  card_purple:{name:"카드형 · 보라",m:"#121417",a:"#5b3cc4",a2:"#a98bff",card:1,css:""},
  card_teal:{name:"카드형 · 청록",m:"#121417",a:"#0a8a8a",a2:"#3fd0c9",card:1,css:""},
  card_brown:{name:"카드형 · 한방 갈색",m:"#1e1712",a:"#8a5a2b",a2:"#d29b5c",card:1,css:""},
  basic:{name:"깔끔 네이비",m:"#16325c",a:"#1f9d6b",css:""},
  pastel:{name:"파스텔 인포그래픽",m:"#1d3b53",a:"#16a3a0",css:`.bi.st-pastel{background:#e6f4f2}.bi.st-pastel .blk{padding:16px 26px}.bi.st-pastel .blk:first-child{padding-top:30px}.bi.st-pastel .blk:last-child{padding-bottom:30px}
.bi.st-pastel .s{border-radius:40px;background:#fff!important;padding:60px 52px;box-shadow:0 8px 0 rgba(22,163,160,.12)}.bi.st-pastel .sep{display:none}
.bi.st-pastel .h{text-align:center}.bi.st-pastel .h .bar{margin:0 auto 22px;width:40px;height:40px;border-radius:50%;background:var(--soft);border:10px solid var(--a)}
.bi.st-pastel .row2{flex-direction:column-reverse}.bi.st-pastel .art{width:170px;height:170px}.bi.st-pastel .artic{width:150px;height:150px}
.bi.st-pastel .cd{background:#f2faf9;border:3px solid var(--soft)}.bi.st-pastel .cd.v{background:#f2faf9}.bi.st-pastel .ci{background:var(--a);color:#fff}
.bi.st-pastel .il{background:#f2faf9;border-radius:24px;border:0;padding:18px 26px;margin-bottom:14px}.bi.st-pastel .ilist{margin:46px 0 0}
.bi.st-pastel .nl{background:#f2faf9;border-radius:22px;border:0;padding:14px 22px;margin-bottom:12px}.bi.st-pastel .nn{width:52px;height:52px;border-radius:50%;background:var(--a);color:#fff;display:grid;place-items:center;font-size:22px}.bi.st-pastel .vl{display:none}
.bi.st-pastel .cname,.bi.st-pastel .ctitle{text-align:center}.bi.st-pastel .box{background:var(--a);color:#fff}.bi.st-pastel .box.ic1 .ic{color:#fff}.bi.st-pastel .tr{border:0;background:#f2faf9;border-radius:24px;padding:18px;margin-bottom:12px}`},
  paper:{name:"베이지 차분",m:"#3b2a20",a:"#b23a2c",css:`.bi.st-paper{background:#f7f2ea;--bg2:#efe6da!important;--soft:#f3dcd4!important;--soft2:#fffaf3!important}
.bi.st-paper .kick{display:flex;margin-bottom:26px}.bi.st-paper .kick span{border:2px solid var(--a);color:var(--a);border-radius:99px;padding:8px 24px;font-size:26px;font-weight:700}
.bi.st-paper .h .bar{width:100%;height:2px;background:#d9cbb8;margin-bottom:34px}.bi.st-paper .h .t1,.bi.st-paper .h .t2{font-weight:800;font-size:66px}
.bi.st-paper .cd{background:#fffaf3;border:1px solid #e3d6c4;border-radius:6px}.bi.st-paper .cd.v{background:#fffaf3}.bi.st-paper .ci{background:transparent;border:2px solid #d9cbb8}
.bi.st-paper .il,.bi.st-paper .nl,.bi.st-paper .ps,.bi.st-paper .tr,.bi.st-paper .ts,.bi.st-paper .ri{border-color:#e3d6c4}.bi.st-paper .sep{height:2px;background:#d9cbb8;margin:0 64px}
.bi.st-paper .box{background:#fffaf3;border-left:6px solid var(--a);border-radius:0;text-align:left}.bi.st-paper .ph{border-radius:4px}.bi.st-paper .artb{border-color:#f7f2ea}`},
  forest:{name:"자연 그린",m:"#1f3d2b",a:"#3d8b5a",css:`.bi.st-forest{--gold:#d9b35a}.bi.st-forest .s-clinic,.bi.st-forest .s-info .ihead{background:var(--m)}.bi.st-forest .s-clinic .cname,.bi.st-forest .s-clinic .ctitle{color:#fff}
.bi.st-forest .s-clinic .ac,.bi.st-forest .ihead .ac{color:var(--gold)}.bi.st-forest .s-info .ihead{margin:0 -64px;padding:34px 64px;border:0}.bi.st-forest .ihead .ctitle{color:#fff}.bi.st-forest .ibadge{color:#fff;border-color:rgba(255,255,255,.4)}
.bi.st-forest .sep{background:linear-gradient(90deg,var(--m),var(--a))}.bi.st-forest .h .bar{background:var(--gold)}.bi.st-forest .ci{background:#e4efe3}.bi.st-forest .artb{background:var(--gold)}
.bi.st-forest .cd{border-radius:28px}.bi.st-forest .nn{color:var(--gold)}.bi.st-forest .box{background:#eef4ea;border-radius:99px}.bi.st-forest .foot{background:var(--m);margin:40px -64px -70px;padding:36px}.bi.st-forest .foot .logot{color:#fff;margin:0}`},
  blue:{name:"블루 메디컬",m:"#14213d",a:"#1e5bd8",css:`.bi.st-blue .h{text-align:center}.bi.st-blue .h .bar{margin:0 auto 22px;width:120px;height:8px;background:linear-gradient(90deg,var(--a),#7fb0ff)}
.bi.st-blue .h .t2{color:var(--a)}.bi.st-blue .row2{flex-direction:column-reverse}.bi.st-blue .kick{display:flex;justify-content:center;margin-bottom:20px}.bi.st-blue .kick span{background:var(--a);color:#fff;border-radius:10px;padding:8px 22px;font-size:26px;font-weight:800}
.bi.st-blue .ci{background:#e8f0ff;color:var(--a)}.bi.st-blue .cd{background:#f4f8ff;border-top:6px solid var(--a);border-radius:14px}.bi.st-blue .cd.v{background:#f4f8ff}
.bi.st-blue .nn{width:56px;height:56px;border-radius:50%;background:var(--a);color:#fff;display:grid;place-items:center;font-size:22px}.bi.st-blue .vl{display:none}
.bi.st-blue .cname,.bi.st-blue .ctitle{text-align:center}.bi.st-blue .alt{background:#f2f6fd}.bi.st-blue .box{background:#14213d;color:#fff}.bi.st-blue .box.ic1 .ic{color:#7fb0ff}.bi.st-blue .sep{background:linear-gradient(90deg,var(--a),#7fb0ff)}`},
  warm:{name:"따뜻한 코랄",m:"#4a2c2a",a:"#e0674f",css:`.bi.st-warm{--bg2:#fff4ee!important;--soft:#fde3da!important;--soft2:#fff7f3!important}.bi.st-warm .h .bar{width:22px;height:22px;border-radius:50%}
.bi.st-warm .cd,.bi.st-warm .box,.bi.st-warm .ih,.bi.st-warm .itel,.bi.st-warm .ipark,.bi.st-warm .fi{border-radius:32px}.bi.st-warm .ph{border-radius:32px}.bi.st-warm .fph{border-radius:0}
.bi.st-warm .ci{background:var(--soft);color:var(--a)}.bi.st-warm .il,.bi.st-warm .nl{border-bottom:2px dashed #f2c9bb}.bi.st-warm .sep{height:10px;background:repeating-linear-gradient(90deg,var(--a) 0 30px,transparent 30px 44px)}
.bi.st-warm .kick{display:flex;margin-bottom:20px}.bi.st-warm .kick span{background:var(--soft);color:var(--a);border-radius:99px;padding:8px 24px;font-size:26px;font-weight:800}`}
};
const STYLE_CSS=Object.values(STYLES).map(x=>x.css).join("\n");
root.BlogKit={T,topicOf,build,randLook,lookCls,photoQueries,photoVet,photoNeed,CSS,snap,toBlob,zip,icon,IC,esc,em,STYLES,STYLE_CSS};
})(window);
