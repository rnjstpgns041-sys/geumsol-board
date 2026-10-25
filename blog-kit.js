/* 블로그 긴 이미지(네이버 블로그용, 가로 860px) 만들기 도구.
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
    person:{t:["사고 후 통증","[[늦게 나타날 수]] 있어요"],sub:"며칠 뒤 불편함이 나타날 수 있습니다.",q:"asian man shoulder pain",sym:[["head","두통·어지럼"],["neck","목 통증"],["pain","어깨 통증"],["spine","허리 통증"]]},
    clinic:{title:"교통사고 [[클리닉]]",feats:[["shield","자동차[[보험 진료]]"],["doctor","[[원인별]] 진료"],["clipboard","상태별 [[맞춤 치료]]"],["chat","[[1:1]] 상담"]]},
    time:{t:["시간차로 나타나는","[[사고 후]] 통증"],steps:[["사고 직후","alert","증상을 놓칠 수 있어요","crash"],["며칠 뒤","pain","목·어깨·허리 통증","user"],["이후","head","두통·저림·결림","clock"]],note:"증상과 시기는 개인마다 다를 수 있습니다."},
    treat:{t:["상태별","[[맞춤 치료]]"],km:["doctor","needle","chuna","rehab"],wm:["scan","manual","shock","inject"],note:"치료는 진료 후 결정됩니다."}},
  "허리":{re:/허리|디스크|요통|척추|협착/,
    hero:{t:["허리 통증","[[신호]]를 보세요"],art:"spine",items:[["pain","앉았다 일어날 때 통증"],["leg","다리까지 저림"],["bed","아침에 뻣뻣함"]]},
    warn:{t:["오래 앉아 있으면","[[허리]]가 먼저 지쳐요"],sub:"생활 습관이 통증으로 이어지기도 해요.",cards:[["spine","허리","묵직함·뻐근함"],["pelvis","골반","틀어짐·불균형"],["leg","엉덩이·다리","저림·당김"],["walk","걸음","오래 걷기 힘듦"]],art:["spine","alert"]},
    list:{t:["이런 증상이면","[[확인]]해 보세요"],art:"clipboard",items:[["pain","허리를 숙이기 힘들어요"],["leg","다리가 저리고 당겨요"],["bed","누워도 편하지 않아요"],["walk","오래 걷기 어려워요"],["spine","통증이 자주 반복돼요"]],note:"증상이 이어지면 진료로 확인하세요."},
    person:{t:["허리 통증","[[참지 마세요]]"],sub:"작은 불편함이 오래 갈 수 있어요.",q:"asian man back pain",sym:[["spine","허리 통증"],["pelvis","골반 불편"],["leg","다리 저림"],["bed","수면 불편"]]},
    clinic:{title:"허리 통증 [[클리닉]]",feats:[["clipboard","[[원인별]] 진료"],["posture","자세·[[균형]] 관리"],["doctor","상태별 [[맞춤 치료]]"],["chat","[[1:1]] 상담"]]},
    time:{t:["통증이","[[반복되는 이유]]"],steps:[["처음","alert","가끔 뻐근해요","user"],["반복","pain","자주 아프고 결려요","spine"],["오래되면","leg","저림·움직임 불편","clock"]],note:"증상은 개인마다 다를 수 있습니다."},
    treat:{t:["상태별","[[맞춤 치료]]"],km:["doctor","needle","chuna","herb"],wm:["scan","manual","shock","rehab"],note:"치료는 진료 후 결정됩니다."}},
  "목":{re:/목|어깨|거북목|일자목|오십견|담/,
    hero:{t:["목·어깨 결림","[[그냥 두지 마세요]]"],art:"neck",items:[["neck","목이 뻣뻣하고 무거워요"],["pain","어깨가 자주 결려요"],["head","두통이 함께 와요"]]},
    warn:{t:["고개 숙인 자세가","[[목]]을 힘들게 해요"],sub:"스마트폰·컴퓨터 사용이 길다면 살펴보세요.",cards:[["neck","목","뻣뻣함·통증"],["pain","어깨","결림·뭉침"],["head","머리","두통·무거움"],["hand","팔·손","저림·힘 빠짐"]],art:["neck","alert"]},
    list:{t:["이런 증상","[[있으신가요]]"],art:"clipboard",items:[["neck","고개 돌리기 불편"],["pain","어깨가 늘 뭉쳐 있음"],["head","오후마다 두통"],["hand","팔·손 저림"],["bed","자고 나도 개운하지 않음"]],note:"증상이 이어지면 진료로 확인하세요."},
    person:{t:["목·어깨 통증","[[자세]]부터 살펴요"],sub:"생활 습관과 함께 확인해요.",q:"asian woman neck pain",sym:[["neck","목 통증"],["pain","어깨 결림"],["head","두통"],["hand","팔 저림"]]},
    clinic:{title:"목·어깨 [[클리닉]]",feats:[["clipboard","[[원인별]] 진료"],["posture","자세·[[체형]] 관리"],["doctor","상태별 [[맞춤 치료]]"],["chat","[[1:1]] 상담"]]},
    time:{t:["통증이","[[쌓이는 과정]]"],steps:[["처음","alert","잠깐 뻐근해요","user"],["반복","neck","목·어깨 결림","neck"],["오래되면","head","두통·저림","clock"]],note:"증상은 개인마다 다를 수 있습니다."},
    treat:{t:["상태별","[[맞춤 치료]]"],km:["doctor","needle","chuna","cup"],wm:["scan","manual","shock","inject"],note:"치료는 진료 후 결정됩니다."}},
  "관절":{re:/관절|무릎|발목|손목|팔꿈치|퇴행/,
    hero:{t:["관절 통증","[[미리]] 살펴요"],art:"bone",items:[["leg","계단에서 무릎 통증"],["walk","오래 걷기 힘듦"],["hand","손목·손가락 불편"]]},
    warn:{t:["쓰는 만큼","[[관절]]도 지쳐요"],sub:"작은 불편함부터 확인해 보세요.",cards:[["leg","무릎","시큰함·붓기"],["pelvis","고관절","뻐근함"],["hand","손목","찌릿함"],["walk","발목","삐끗함"]],art:["bone","shield"]},
    list:{t:["이럴 때는","[[확인]]해 보세요"],art:"clipboard",items:[["leg","앉았다 일어날 때 통증"],["walk","계단 오르내리기 힘듦"],["drop","관절이 붓고 열감"],["hand","손이 뻣뻣함"],["bed","밤에 쑤시는 느낌"]],note:"증상이 이어지면 진료로 확인하세요."},
    person:{t:["관절 통증","[[생활]]을 바꿔요"],sub:"움직임이 줄면 일상도 불편해져요.",q:"asian senior knee pain",sym:[["leg","무릎 통증"],["walk","걷기 불편"],["hand","손목 통증"],["drop","붓기"]]},
    clinic:{title:"관절 통증 [[클리닉]]",feats:[["clipboard","[[원인별]] 진료"],["walk","움직임 [[회복]] 관리"],["doctor","상태별 [[맞춤 치료]]"],["chat","[[1:1]] 상담"]]},
    time:{t:["관절 통증이","[[커지는 과정]]"],steps:[["처음","alert","가끔 시큰해요","user"],["반복","leg","붓고 쑤셔요","bone"],["오래되면","walk","움직임 불편","clock"]],note:"증상은 개인마다 다를 수 있습니다."},
    treat:{t:["상태별","[[맞춤 치료]]"],km:["doctor","needle","herb","heat"],wm:["scan","manual","shock","inject"],note:"치료는 진료 후 결정됩니다."}},
  "두통":{re:/두통|어지럼|편두통|이명/,
    hero:{t:["잦은 두통","[[원인]]을 찾아요"],art:"head",items:[["head","머리가 자주 아파요"],["alert","어지럼이 함께 와요"],["bed","잠을 설쳐요"]]},
    warn:{t:["두통 뒤에","[[숨은 원인]]이 있어요"],sub:"생활 습관과 몸 상태를 함께 살펴요.",cards:[["neck","목·어깨","긴장·결림"],["bed","수면","부족·뒤척임"],["brain","스트레스","예민함"],["stomach","소화","더부룩함"]],art:["brain","alert"]},
    list:{t:["이런 두통","[[있으신가요]]"],art:"clipboard",items:[["head","오후마다 지끈거림"],["neck","목이 뻣뻣하며 두통"],["alert","어지럼·메스꺼움"],["bed","자고 나도 무거움"],["brain","신경 쓰면 심해짐"]],note:"증상이 이어지면 진료로 확인하세요."},
    person:{t:["두통","[[참기만]] 하지 마세요"],sub:"반복되면 몸이 보내는 신호일 수 있어요.",q:"asian woman headache",sym:[["head","두통"],["alert","어지럼"],["neck","목 결림"],["bed","수면 불편"]]},
    clinic:{title:"두통·어지럼 [[클리닉]]",feats:[["clipboard","[[원인별]] 진료"],["brain","몸 상태 [[함께]] 확인"],["doctor","상태별 [[맞춤 치료]]"],["chat","[[1:1]] 상담"]]},
    time:{t:["두통이","[[반복되는 흐름]]"],steps:[["처음","alert","가끔 지끈거려요","user"],["반복","head","자주 아프고 무거워요","head"],["오래되면","bed","잠·집중이 힘들어요","clock"]],note:"증상은 개인마다 다를 수 있습니다."},
    treat:{t:["상태별","[[맞춤 치료]]"],km:["doctor","needle","herb","chuna"],wm:["scan","inject","manual","rehab"],note:"치료는 진료 후 결정됩니다."}},
  "다이어트":{re:/다이어트|체중|비만|살|감량/,
    hero:{t:["다이어트","[[방법]]이 중요해요"],art:"scale",items:[["scale","굶어도 빠지지 않아요"],["alert","자주 요요가 와요"],["stomach","식욕 조절이 힘들어요"]]},
    warn:{t:["무리한 다이어트","[[몸]]이 먼저 지쳐요"],sub:"내 몸 상태에 맞춘 방법을 찾아요.",cards:[["stomach","식습관","폭식·야식"],["bed","수면","부족·피로"],["walk","활동량","운동 부족"],["drop","순환","붓기·냉증"]],art:["scale","heart"]},
    list:{t:["이런 분께","[[필요해요]]"],art:"clipboard",items:[["scale","체중이 잘 줄지 않는 분"],["alert","요요를 겪은 분"],["drop","잘 붓는 분"],["stomach","식욕 조절이 힘든 분"],["bed","피곤이 쌓인 분"]],note:"체질과 상태에 따라 방법이 달라져요."},
    person:{t:["내 몸에 맞춘","[[다이어트]]"],sub:"생활 습관부터 함께 살펴요.",q:"asian woman healthy diet",sym:[["scale","체중 관리"],["stomach","식습관"],["drop","붓기"],["bed","수면"]]},
    clinic:{title:"다이어트 [[클리닉]]",feats:[["clipboard","[[체질]] 확인"],["herb","맞춤 [[한약]] 상담"],["chat","식습관 [[상담]]"],["calendar","[[꾸준한]] 관리"]]},
    time:{t:["다이어트","[[관리 흐름]]"],steps:[["상담","chat","몸 상태·습관 확인","clipboard"],["관리","herb","맞춤 방법으로 관리","scale"],["유지","calendar","습관 만들기","clock"]],note:"결과는 개인마다 다를 수 있습니다."},
    treat:{t:["맞춤","[[관리 방법]]"],km:["doctor","herb","needle","cup"],wm:["scan","inject","rehab","manual"],note:"관리 방법은 진료 후 결정됩니다."}},
  "비염":{re:/비염|코|축농증|알레르기/,
    hero:{t:["반복되는 비염","[[관리]]가 필요해요"],art:"nose",items:[["nose","코막힘·콧물"],["alert","재채기가 잦아요"],["bed","잠을 설쳐요"]]},
    warn:{t:["코만의 문제가","[[아닐 수]] 있어요"],sub:"몸 상태와 환경을 함께 살펴요.",cards:[["nose","코","막힘·콧물"],["head","머리","두통·멍함"],["bed","수면","코골이·뒤척임"],["wind","환경","먼지·온도 변화"]],art:["nose","shield"]},
    list:{t:["이런 증상","[[있으신가요]]"],art:"clipboard",items:[["nose","아침마다 재채기"],["drop","맑은 콧물이 계속"],["head","머리가 멍해요"],["bed","입으로 숨 쉬며 자요"],["wind","계절마다 심해져요"]],note:"증상이 이어지면 진료로 확인하세요."},
    person:{t:["비염","[[미루지]] 마세요"],sub:"일상과 잠을 불편하게 만들 수 있어요.",q:"asian woman runny nose",sym:[["nose","코막힘"],["drop","콧물"],["head","두통"],["bed","수면 불편"]]},
    clinic:{title:"비염 [[클리닉]]",feats:[["clipboard","[[원인별]] 진료"],["shield","[[면역]] 관리 상담"],["doctor","상태별 [[맞춤 치료]]"],["chat","[[1:1]] 상담"]]},
    time:{t:["비염이","[[심해지는 흐름]]"],steps:[["처음","alert","가끔 코가 막혀요","user"],["반복","nose","콧물·재채기가 잦아요","nose"],["오래되면","bed","잠·집중이 힘들어요","clock"]],note:"증상은 개인마다 다를 수 있습니다."},
    treat:{t:["상태별","[[맞춤 치료]]"],km:["doctor","herb","needle","heat"],wm:["scan","inject","rehab","manual"],note:"치료는 진료 후 결정됩니다."}},
  "성장":{re:/성장|키|성조숙/,
    hero:{t:["우리 아이 성장","[[때]]를 놓치지 마세요"],art:"child",items:[["child","또래보다 작은 키"],["stomach","편식·잦은 배탈"],["bed","잠이 부족해요"]]},
    warn:{t:["성장에는","[[생활 습관]]이 중요해요"],sub:"잠·식사·운동을 함께 살펴요.",cards:[["bed","수면","늦게 자요"],["stomach","식사","편식·소화"],["walk","운동","활동 부족"],["brain","스트레스","예민함"]],art:["child","star"]},
    list:{t:["이럴 때","[[확인]]해 보세요"],art:"clipboard",items:[["child","1년에 4cm 미만 자라요"],["alert","사춘기가 빠른 것 같아요"],["stomach","잘 안 먹어요"],["bed","자주 깨요"],["nose","비염·감기가 잦아요"]],note:"성장 상태는 진료로 확인하세요."},
    person:{t:["아이 성장","[[함께]] 살펴요"],sub:"지금 상태를 아는 것부터 시작해요.",q:"asian child smiling",sym:[["child","키 성장"],["stomach","식습관"],["bed","수면"],["walk","운동"]]},
    clinic:{title:"성장 [[클리닉]]",feats:[["clipboard","성장 [[상태]] 확인"],["chat","생활 습관 [[상담]]"],["doctor","아이별 [[맞춤 관리]]"],["calendar","[[꾸준한]] 확인"]]},
    time:{t:["성장 관리","[[흐름]]"],steps:[["확인","clipboard","현재 성장 상태","child"],["관리","chat","생활 습관·맞춤 관리","calendar"],["점검","calendar","꾸준히 다시 확인","clock"]],note:"성장 속도는 아이마다 다를 수 있습니다."},
    treat:{t:["아이별","[[맞춤 관리]]"],km:["doctor","herb","needle","heat"],wm:["scan","inject","rehab","manual"],note:"관리 방법은 진료 후 결정됩니다."}},
  "여성":{re:/산후|갱년기|생리|여성|임신|난임/,
    hero:{t:["여성 건강","[[내 몸]]을 살펴요"],art:"woman",items:[["woman","몸이 예전 같지 않아요"],["fire","열이 오르내려요"],["bed","잠을 설쳐요"]]},
    warn:{t:["변화하는 몸","[[신호]]를 들어 보세요"],sub:"시기마다 필요한 관리가 달라요.",cards:[["fire","열감","화끈거림"],["bed","수면","뒤척임"],["brain","기분","예민함·우울"],["drop","순환","붓기·냉증"]],art:["woman","heart"]},
    list:{t:["이런 증상","[[있으신가요]]"],art:"clipboard",items:[["fire","얼굴로 열이 올라요"],["bed","밤에 자주 깨요"],["brain","기분 변화가 커요"],["drop","손발이 차고 붓기"],["pain","관절이 쑤셔요"]],note:"증상이 이어지면 진료로 확인하세요."},
    person:{t:["여성 건강","[[시기별]]로 챙겨요"],sub:"몸 상태에 맞춘 관리가 필요해요.",q:"asian woman relaxing",sym:[["fire","열감"],["bed","수면"],["brain","기분 변화"],["drop","순환"]]},
    clinic:{title:"여성 건강 [[클리닉]]",feats:[["clipboard","몸 상태 [[확인]]"],["herb","맞춤 [[한약]] 상담"],["doctor","시기별 [[맞춤 관리]]"],["chat","[[1:1]] 상담"]]},
    time:{t:["몸의 변화","[[살펴보기]]"],steps:[["확인","clipboard","지금 몸 상태","woman"],["관리","herb","시기에 맞춘 관리","heart"],["점검","calendar","꾸준히 다시 확인","clock"]],note:"증상은 개인마다 다를 수 있습니다."},
    treat:{t:["시기별","[[맞춤 관리]]"],km:["doctor","herb","needle","heat"],wm:["scan","inject","rehab","manual"],note:"관리 방법은 진료 후 결정됩니다."}},
  "요양":{re:/암|요양|항암|면역|재활|뇌졸중|입원/,
    hero:{t:["회복의 시간","[[편안하게]]"],art:"heart",items:[["bedplus","치료 후 회복 관리"],["shield","면역 관리"],["users","보호자 걱정 덜기"]]},
    warn:{t:["치료 뒤","[[회복 관리]]가 중요해요"],sub:"몸과 마음을 함께 살펴요.",cards:[["bed","휴식","편안한 병실"],["stomach","식사","균형 잡힌 식단"],["walk","활동","재활·운동"],["heart","마음","정서 돌봄"]],art:["hospital","heart"]},
    list:{t:["이런 분께","[[필요해요]]"],art:"clipboard",items:[["bedplus","수술·항암 뒤 회복이 필요한 분"],["shield","면역 관리가 필요한 분"],["walk","재활이 필요한 분"],["users","돌봄이 걱정되는 가족"],["stomach","식사가 힘든 분"]],note:"입원 여부는 상담 후 결정됩니다."},
    person:{t:["회복의 시간","[[함께]] 해요"],sub:"내 몸 상태에 맞춘 관리를 받아 보세요.",q:"asian senior patient nurse",sym:[["bedplus","회복 관리"],["shield","면역 관리"],["walk","재활"],["heart","정서 돌봄"]]},
    clinic:{title:"회복 [[관리]]",feats:[["clipboard","[[상태별]] 관리 계획"],["users","[[의료진]] 상주 여부 확인"],["walk","재활·[[운동]] 관리"],["chat","[[입원]] 상담"]]},
    time:{t:["회복 관리","[[흐름]]"],steps:[["상담","chat","몸 상태·치료 일정 확인","clipboard"],["관리","bedplus","맞춤 회복 관리","hospital"],["일상으로","walk","다시 일상 준비","clock"]],note:"관리 계획은 개인마다 다를 수 있습니다."},
    treat:{t:["회복을 돕는","[[관리]]"],km:["doctor","heat","herb","rehab"],wm:["scan","iv","rehab","manual"],note:"관리 방법은 진료 후 결정됩니다."}},
  "피부":{re:/피부|여드름|아토피|습진|두드러기/,
    hero:{t:["반복되는 피부 고민","[[속]]부터 살펴요"],art:"sparkle",items:[["sparkle","올라오는 트러블"],["drop","가려움·건조함"],["bed","잠을 설쳐요"]]},
    warn:{t:["피부는","[[몸 상태]]를 보여 줘요"],sub:"생활 습관과 몸 상태를 함께 살펴요.",cards:[["stomach","소화","더부룩함"],["bed","수면","부족·뒤척임"],["brain","스트레스","예민함"],["drop","순환","열감·건조"]],art:["sparkle","shield"]},
    list:{t:["이런 고민","[[있으신가요]]"],art:"clipboard",items:[["sparkle","같은 자리에 반복돼요"],["drop","가렵고 건조해요"],["fire","열이 오르며 붉어요"],["bed","가려워 잠을 설쳐요"],["brain","스트레스 받으면 심해요"]],note:"증상이 이어지면 진료로 확인하세요."},
    person:{t:["피부 고민","[[원인]]을 찾아요"],sub:"겉과 속을 함께 살펴요.",q:"asian woman skin care",sym:[["sparkle","트러블"],["drop","가려움"],["fire","열감"],["bed","수면"]]},
    clinic:{title:"피부 [[클리닉]]",feats:[["clipboard","[[원인별]] 진료"],["herb","맞춤 [[한약]] 상담"],["doctor","상태별 [[맞춤 치료]]"],["chat","[[1:1]] 상담"]]},
    time:{t:["피부 고민이","[[반복되는 흐름]]"],steps:[["처음","alert","가끔 올라와요","user"],["반복","sparkle","같은 자리에 반복","sparkle"],["오래되면","bed","가려움·수면 불편","clock"]],note:"증상은 개인마다 다를 수 있습니다."},
    treat:{t:["상태별","[[맞춤 치료]]"],km:["doctor","herb","needle","cup"],wm:["scan","inject","rehab","manual"],note:"치료는 진료 후 결정됩니다."}}
};
T["기본"]={re:/./,
  hero:{t:["몸이 보내는 신호","[[놓치지]] 마세요"],art:"clipboard",items:[["pain","반복되는 불편함"],["bed","수면·피로"],["alert","일상에 영향"]]},
  warn:{t:["작은 불편함도","[[살펴보세요]]"],sub:"원인을 알면 관리가 쉬워져요.",cards:[["head","머리","두통·어지럼"],["neck","목·어깨","결림"],["spine","허리","뻐근함"],["leg","팔·다리","저림"]],art:["shield","check"]},
  list:{t:["이런 증상","[[있으신가요]]"],art:"calendar",items:[["pain","통증이 자주 반복돼요"],["bed","자고 나도 피곤해요"],["head","머리가 무거워요"],["stomach","소화가 불편해요"],["brain","스트레스가 많아요"]],note:"증상이 이어지면 진료로 확인하세요."},
  person:{t:["불편함","[[미루지]] 마세요"],sub:"지금 상태를 아는 것부터 시작해요.",q:"asian doctor consultation",sym:[["pain","통증"],["bed","피로"],["head","두통"],["stomach","소화"]]},
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

const S={
  hero:(p,c)=>`<section class="s s-hero">${logo(c)}<div class="row2">${H(p.hero.t,"big")}${art(p.hero.art,"check")}</div>
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
    <div class="cards2 tall">${p.clinic.feats.map(([i,t])=>`<div class="cd v"><span class="cdi big">${icon(i)}</span><i class="dash"></i><div class="cdt" ${E}>${em(t)}</div></div>`).join("")}</div></section>`,
  time:(p,c)=>`<section class="s s-time">${H(p.time.t,"big")}<div class="tl">${p.time.steps.map(([a,i,t,ar])=>`<div class="ts"><div class="tdot"></div><div class="tb"><div class="tla" ${E}>${esc(a)} —</div><div class="tlr"><span class="ci sm">${icon(i)}</span>${tx(t)}</div></div><div class="tart">${icon(ar,"ic")}</div></div>`).join("")}</div>
    <div class="box" ${E}>${esc(p.time.note)}</div>${c.logo?`<div class="center">${logo(c)}</div>`:""}</section>`,
  treat:(p,c,img)=>{const rows=(c.km?p.treat.km.map(k=>KM_ROWS[k]):p.treat.wm.map(k=>WM_ROWS[k])).filter(Boolean);
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
    ${c.station?map(c):""}
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

/* 전체 이미지: 구역 순서대로 */
function build(o){const p=T[o.topic]||T["기본"],c=o.clinic,img=o.img||{},on=o.on||{};const out=[];
  const add=(k,h)=>{if(on[k]!==false&&h)out.push(`<div class="blk" data-k="${k}">${h}</div>`);};
  add("hero",S.hero(p,c));add("warn",S.warn(p,c));add("list",S.list(p,c));add("person",S.person(p,c,img));add("clinic",S.clinic(p,c));
  add("time",S.time(p,c));add("treat",S.treat(p,c,img));(c.doctors||[]).filter(d=>d&&d.name).forEach((d,k)=>add("doc"+k,S.doctor(d,k)));
  if(c.room&&c.room.on)add("room",S.room(c,img));add("facility",S.facility(c));add("info",S.info(c));
  return out.join("");}
/* 사진 자리마다 무료 사진 검색어 (영어) */
function photoQueries(o){const p=T[o.topic]||T["기본"],c=o.clinic,q={person:p.person.q};
  (c.km?p.treat.km.map(k=>KM_ROWS[k]):p.treat.wm.map(k=>WM_ROWS[k])).forEach((r,k)=>{if(r)q["treat"+k]=r[3];});return q;}

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
.bi .foot{margin-top:40px}.bi .foot .logo{margin:0 auto}.bi .ic{width:1em;height:1em}`;

/* ── 이미지로 저장: 화면 구역을 그대로 SVG(foreignObject)에 담아 canvas에 그림. 사진·글꼴은 data URL로 넣음 ── */
const blob2url=b=>new Promise(ok=>{const r=new FileReader();r.onload=()=>ok(r.result);r.readAsDataURL(b);});
const CACHE={};
async function dataURL(src){if(!src||src.startsWith("data:"))return src;if(CACHE[src])return CACHE[src];
  try{const r=await fetch(src,{mode:"cors"});CACHE[src]=await blob2url(await r.blob());}catch(e){CACHE[src]="";}return CACHE[src];}
let FONT_CSS=null;
async function fontCSS(url){if(FONT_CSS!=null)return FONT_CSS;FONT_CSS="";
  if(url)try{const d=await dataURL(url);if(d)FONT_CSS=`@font-face{font-family:"Pretendard Variable";font-weight:45 920;src:url(${d}) format("woff2")}`;}catch(e){}return FONT_CSS;}
async function snap(el,o){o=o||{};const scale=o.scale||1.5,w=el.offsetWidth,h=el.offsetHeight;
  const cl=el.cloneNode(true);cl.querySelectorAll("[contenteditable]").forEach(x=>x.removeAttribute("contenteditable"));
  cl.querySelectorAll(".phe").forEach(x=>x.parentNode.remove());cl.querySelectorAll(".sel").forEach(x=>x.classList.remove("sel"));
  for(const im of cl.querySelectorAll("img")){const d=await dataURL(im.getAttribute("src"));if(d)im.setAttribute("src",d);else im.remove();}
  const css=(await fontCSS(o.font))+CSS+(o.vars||"");
  const html=new XMLSerializer().serializeToString(cl);
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><foreignObject x="0" y="0" width="${w}" height="${h}"><div xmlns="http://www.w3.org/1999/xhtml" class="bi" style="${esc(o.style||"")}"><style>${css}</style>${html}</div></foreignObject></svg>`;
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

root.BlogKit={T,topicOf,build,photoQueries,CSS,snap,toBlob,zip,icon,IC,esc,em};
})(window);
