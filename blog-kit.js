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
function build(o){if(STYLES[o.style]&&STYLES[o.style].card)return kbuild(o);const p=T[o.topic]||T["기본"],c=o.clinic,img=o.img||{},on=o.on||{};const out=[];
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
const KH=(t,o)=>{o=o||{};const l2=t[1]||"",g2=/\[\[/.test(l2)?gem(l2):`<b class="g">${esc(l2)}</b>`;
  const l1=o.all?`<b class="g">${esc(plain(t[0]))}</b>`:gem(t[0]);
  return `<div class="k-h ${o.cls||""}"><div ${E}>${l1}</div>${l2?`<div ${E}>${g2}</div>`:""}</div>`;};
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
    return `<section class="k k-hero">${KH(p.hero.t,{cls:"xl"})}<i class="k-vl"></i>
    <div class="k-sub" ${E}>${esc(p.warn.sub)}<br><b>${esc(plain(p.person.t.join(" ")))}</b></div>
    ${pill("몸이 보내는 [[신호]]","on")}<div class="k-card k-body">${ph("person",img.person,"k-pp")}${cs.map((x,k)=>lab(x,k>>1,k%2)).join("")}</div>
    <div class="k-blue" ${E}>${esc(p.person.sub)}<br><b>증상이 이어진다면 <b class="y">초기에 확인하는 것</b>이 중요합니다.</b></div>${kfoot(c)}</section>`;},
  /* 손글씨 질문 + 체크 목록(종이 접힘) + 흰 카드 */
  warn:(p,c)=>`<section class="k k-warn"><div class="k-hw" ${E}>혹시 이런 증상이 있으신가요?</div>${KH(p.list.t)}
    <div class="k-paper">${p.list.items.map(([,t])=>`<div class="k-cl">${chk}<span ${E}>${esc(t)}</span></div>`).join("")}<i class="k-curl"></i></div>
    <div class="k-card k-white">${KH(["이런 증상을","그냥 두고 계신가요?"],{all:true,cls:"md"})}
      <div class="k-blue sm" ${E}>오래 두면 일상이 더 불편해질 수 있어<br><b class="y">초기에 확인하는 것</b>이 중요합니다.</div>
      <div class="k-end" ${E}>꼼꼼하게 진료하는<br>${c.name?`<b class="g">${esc(c.name)}</b>에서 상담해 보세요!`:`<b class="g">가까운 한의원</b>에서 상담해 보세요!`}</div></div>${kfoot(c)}</section>`,
  /* 사진 띠 위 체크 알약 + 손글씨 인용 + 흰 상자 */
  list:(p,c,img)=>`<section class="k k-band tint">${KH(p.warn.t,{cls:"xl"})}
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
    return `<section class="k k-prom">${KH([(c.name?c.name+"의":"우리 한의원의")+" [[약속!]]"],{cls:"xl"})}${pill("늘 가까이에서 건강을 살피는 주치의가 되겠습니다.","")}
    <div class="k-ovals">${fs.map(([i,t])=>`<div class="k-oval"><div class="k-ot" ${E}>${gem(t)}</div><div class="k-od" ${E}>${esc(FD[i]||FD.check)}</div></div>`).join("")}</div>
    <div class="k-bluebot">${ps.length?`<div class="k-strip">${ps.map((x,k)=>ph("fac"+k,x.url,"k-sp")).join("")}</div>`:""}
    <div class="k-q hw white"><i>“</i><span ${E}>편안하고 건강한 일상을 누리실 수 있도록 함께하겠습니다</span><i>”</i></div>${kfoot(c,1)}</div></section>`;},
  /* 진료 과정: 원 4개 + 화살표 */
  time:(p,c)=>`<section class="k k-proc">${KH(p.time.t,{cls:"xl"})}${pill(p.time.note,"soft")}
    <div class="k-steps">${p.time.steps.map(([a,i,t],k)=>`<div class="k-st ${k%2?"dk":""}"><div class="k-sti"><b>${String(k+1).padStart(2,"0")}</b><div ${E}>${esc(a)}</div><span ${E}>${esc(t)}</span></div></div>`).join("")}</div>${kfoot(c)}</section>`,
  /* 치료: 사진 + 겹친 알약 설명, 아이콘 원 + 파란 이름표 카드 */
  treat:(p,c,img)=>{const rows=treatRows(p,c);
    return `<section class="k k-treat">${KH([c.name?c.name+"의":"상태에 맞춘",`[[${KEYOF(p)==="기본"?"맞춤 진료":KEYOF(p)+" 클리닉"}]]`],{cls:"xl one"})}
    <div class="k-q"><i>“</i><span ${E}>몸 상태를 꼼꼼히 살피고 <b class="ac">상태에 맞춘 치료</b>로<br>편안한 일상을 돕겠습니다.</span><i>”</i></div>
    ${rows[0]?`<div class="k-phcap">${ph("treat0",img.treat0,"k-tph")}<div class="k-cap"><b ${E}>${esc(tname(KEYOF(p)))}, 이렇게 살펴요</b><span ${E}>불편한 곳과 몸 상태를 먼저 확인한 뒤<br>상태에 맞는 치료 방법을 함께 정합니다.</span></div></div>`:""}
    <div class="k-tcs">${rows.map(([i,a])=>`<div class="k-tc"><div class="k-tci">${icon(i)}</div><div><span class="k-tag" ${E}>${esc(a)}</span><div class="k-tcd" ${E}>${esc(TD[i]||TD.check)}</div></div></div>`).join("")}</div>
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
    return `<section class="k k-info"><div class="k-brk">${KH([c.name||"","[[진료시간 및 오시는 길]]"].filter(Boolean),{cls:"md"})}</div>
    ${c.station?map(c):""}
    <div class="k-rows">${c.addr?`<div class="k-row"><div class="k-ri2">${icon("pin")}<b>주소</b></div><div class="k-rv" ${E}>${esc(c.addr)}${c.way?`<br><small>${esc(c.way)}</small>`:""}</div></div>`:""}
    ${c.tel?`<div class="k-row"><div class="k-ri2">${icon("phone")}<b>전화번호</b></div><div class="k-rv big" ${E}>${esc(c.tel)}</div></div>`:""}
    ${hs.length||c.lunch?`<div class="k-row"><div class="k-ri2">${icon("clock")}<b>진료시간</b></div><div class="k-rv hrs">${hs.map(h=>`<div><span ${E}>${esc(h[0])}</span><b ${E}>${esc(h[1])}</b></div>`).join("")}${c.lunch?`<div><span>점심시간</span><b ${E}>${esc(c.lunch)}</b></div>`:""}</div></div>`:""}
    ${c.parking?`<div class="k-row"><div class="k-ri2">${icon("car")}<b>주차</b></div><div class="k-rv" ${E}>${esc(c.parking)}</div></div>`:""}</div>
    <div class="k-lfoot">${kfoot(c)}<div class="k-law" ${E}>모든 치료는 개인에 따라 차이가 있을 수 있고 부작용이 생길 수 있습니다.<br>반드시 의료진과 충분히 상담한 뒤 결정하시기 바랍니다.</div></div></section>`;}
};
const KEYOF=p=>Object.keys(T).find(k=>T[k]===p)||"기본";
function kbuild(o){const p=T[o.topic]||T["기본"],c=o.clinic,img=o.img||{},on=o.on||{};const out=[];
  const add=(k,h)=>{if(on[k]!==false&&h)out.push(`<div class="blk" data-k="${k}">${h}</div>`);};
  add("hero",K.hero(p,c,img));add("warn",K.warn(p,c));add("list",K.list(p,c,img));add("treat",K.treat(p,c,img));add("person",K.person(p,c));
  add("time",K.time(p,c));add("clinic",K.clinic(p,c));(c.doctors||[]).filter(d=>d&&d.name).forEach((d,k)=>add("doc"+k,K.doctor(d,k,c)));
  if(c.room&&c.room.on)add("room",K.room(c,img));add("facility",K.facility(c));add("info",K.info(c));
  return out.join("");}

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
.bi .k-paper{position:relative;background:#e8f4fb;margin:34px 0 0;padding:24px 90px 24px 34px;text-align:left;overflow:hidden}
.bi .k-curl{position:absolute;right:0;bottom:0;width:96px;height:96px;background:linear-gradient(315deg,#f6f7f9 50%,#b9c6d0 50%,#dfe7ee 75%,#f2f6f9);border-radius:0 0 0 18px;box-shadow:-3px -3px 8px rgba(40,60,90,.12)}
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
.bi .k-adv{background:#e8f4fb;border-radius:30px;margin-top:30px;padding:34px 36px;text-align:left}.bi .k-advh{font-size:44px;font-weight:900;text-align:center;margin-bottom:14px}.bi .k-advh.sm{font-size:30px;text-align:left;color:var(--a);margin:10px 0 4px}
.bi .k-advg{display:grid;grid-template-columns:1fr 170px;align-items:end}.bi .k-doc{width:170px;height:270px;display:block}
.bi .k-ovals{display:flex;flex-direction:column;gap:20px;margin-top:34px}.bi .k-oval{border:3px solid var(--a);border-radius:99px;background:rgba(255,255,255,.85);padding:28px 40px}.bi .k-ot{font-size:38px;font-weight:900;color:var(--a)}.bi .k-ot .g{font-weight:900}.bi .k-od{font-size:24px;margin-top:8px;line-height:1.45}
.bi .k-bluebot{background:var(--a);margin:44px -48px -40px;padding:34px 30px 0}.bi .k-strip{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.bi .k-sp{aspect-ratio:4/3;border-radius:0}.bi .k-bluebot .k-q{margin-top:24px}.bi .k-bluebot .k-foot{margin:10px -30px 0}
.bi .k-steps{display:flex;justify-content:center;margin:46px 0 40px}.bi .k-st{width:200px;height:200px;border-radius:50%;border:14px solid #9cc8ff;background:#fff;display:grid;place-items:center;margin-left:-14px;position:relative}
.bi .k-st:first-child{margin-left:0}.bi .k-st:not(:last-child):after{content:"";position:absolute;right:-34px;top:50%;margin-top:-16px;border:16px solid transparent;border-left:20px solid #9cc8ff;z-index:3}.bi .k-st.dk:not(:last-child):after{border-left-color:var(--a)}.bi .k-st.dk{border-color:var(--a);z-index:1}.bi .k-sti{font-size:24px;font-weight:800;line-height:1.3;padding:0 10px}.bi .k-sti b{display:block;color:var(--a);font-size:30px;font-weight:900}.bi .k-sti span{display:block;font-size:17px;font-weight:600;color:#4a5260;margin-top:4px}
.bi .k-steps.sm .k-st{width:160px;height:160px;border-width:11px}.bi .k-steps.sm .k-sti{font-size:20px}
.bi .k-phcap{position:relative;margin:34px -10px 0}.bi .k-tph{height:380px;border-radius:6px}.bi .k-cap{position:relative;margin:-70px 40px 0;background:#fff;border:3px solid var(--a);border-radius:99px;padding:24px 50px;display:flex;flex-direction:column;gap:6px;color:var(--a);font-size:24px;line-height:1.4}.bi .k-cap b{font-size:30px;font-weight:900}
.bi .k-tcs{display:flex;flex-direction:column;gap:22px;margin-top:34px}.bi .k-tc{display:grid;grid-template-columns:150px 1fr;gap:26px;align-items:center;border:3px solid var(--a);border-radius:34px;background:#fff;padding:26px 30px;text-align:left}
.bi .k-tci{width:150px;height:150px;border-radius:50%;background:#e8f4fb;display:grid;place-items:center;color:var(--a)}.bi .k-tci .ic{width:80px;height:80px;stroke-width:1.4}
.bi .k-tag{display:inline-block;background:var(--a);color:#fff;border-radius:99px;padding:6px 26px;font-size:28px;font-weight:900}.bi .k-tcd{font-size:23px;line-height:1.5;margin-top:12px;color:#22262c}.bi .k-note{font-size:21px;color:#6b7380;margin-top:24px}
.bi .k-dbox{display:grid;grid-template-columns:1fr 1fr;border:3px solid var(--a);border-radius:30px;overflow:hidden;background:#fff}.bi .k-dl{background:var(--a);color:#fff;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:10px;padding:30px}
.bi .k-dtt{background:#fff;color:var(--a);border-radius:99px;padding:6px 26px;font-size:26px;font-weight:900}.bi .k-dn{font-size:76px;font-weight:900;line-height:1.1}.bi .k-dr{font-size:26px}.bi .k-dr2{padding:22px}.bi .k-dph{aspect-ratio:3/4;border-radius:16px}
.bi .k-soft{display:inline-block;background:#e8f4fb;border-radius:99px;padding:14px 36px;font-size:26px;font-weight:700;margin-top:24px}.bi .k-rph{height:440px;margin:30px -24px 0;border-radius:4px}
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
.bi .k .ph{background:#e9eef0}`;
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
.bi .kick{display:none}.bi .foot{margin-top:40px}.bi .foot .logo{margin:0 auto}.bi .ic{width:1em;height:1em}`+K_CSS;

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
async function snap(el,o){o=o||{};const scale=o.scale||1.5,w=el.offsetWidth,h=el.offsetHeight;
  const cl=el.cloneNode(true);cl.querySelectorAll("[contenteditable]").forEach(x=>x.removeAttribute("contenteditable"));
  cl.querySelectorAll(".phe").forEach(x=>x.parentNode.remove());cl.querySelectorAll(".sel").forEach(x=>x.classList.remove("sel"));
  for(const im of cl.querySelectorAll("img")){const d=await dataURL(im.getAttribute("src"));if(d)im.setAttribute("src",d);else im.remove();}
  const css=(await fontCSS(o.font))+(await hwCSS([...cl.querySelectorAll(".k-hw,.k-q.hw")].map(x=>x.textContent).join("")))+CSS+STYLE_CSS+(o.vars||"");
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
  card:{name:"네이버 카드형 · 블루",m:"#121417",a:"#0b5ccc",a2:"#18bdf0",card:1,css:""},
  card_navy:{name:"카드형 · 네이비",m:"#121417",a:"#1c3f94",a2:"#4f86f7",card:1,css:""},
  card_green:{name:"카드형 · 그린",m:"#121417",a:"#11805a",a2:"#36c48a",card:1,css:""},
  card_coral:{name:"카드형 · 코랄",m:"#121417",a:"#e0533b",a2:"#ff9c6e",card:1,css:""},
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
root.BlogKit={T,topicOf,build,photoQueries,photoVet,photoNeed,CSS,snap,toBlob,zip,icon,IC,esc,em,STYLES,STYLE_CSS};
})(window);
