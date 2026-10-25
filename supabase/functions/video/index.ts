// 금솔 팀 사이트 영상 만들기: 슈퍼쇼츠 키를 Supabase 비밀값(SUPERSHORTS_KEY)에 숨겨 두고 대신 불러 주는 함수.
// 필요한 비밀값(Edge Functions > Secrets): SUPERSHORTS_KEY (ss_live_...), VIDEO_PW (영상 비밀번호)
// 있으면 쓰는 비밀값: GOOGLE_TTS_KEY (구글 음성), PIXABAY_KEY 또는 PEXELS_KEY (대본에 맞는 무료 사진), GEMINI_KEY (홈페이지 정리·나노바나나)
// 함수 설정에서 "Verify JWT"는 꺼 두세요 (사이트는 로그인 없이 부름, 대신 VIDEO_PW로 막음).
const SS = "https://www.supershorts.co.kr/api/business";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-video-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const VOICES = ["doyun", "harin", "seojun", "ina", "daon", "seoa", "hajun", "jihoon", "yuna", "dahae", "jia"];

function j(o: unknown, status = 200) {
  return new Response(JSON.stringify(o), { status, headers: { ...cors, "Content-Type": "application/json; charset=utf-8" } });
}
function why(s: number) {
  const m: Record<number, string> = {
    401: "슈퍼쇼츠 키가 틀렸거나 삭제된 키예요. Supabase의 SUPERSHORTS_KEY를 확인해 주세요.",
    403: "슈퍼쇼츠 맥스 구독이 활성 상태인지 확인해 주세요.",
    400: "입력값이나 남은 크레딧을 확인해 주세요.",
    422: "입력값이나 남은 크레딧을 확인해 주세요.",
    429: "요청이 너무 많아요. 잠시 후 다시 해 주세요.",
  };
  return m[s] || "슈퍼쇼츠 서버에 연결하지 못했어요.";
}


// 슈퍼쇼츠 응답 어디에 있든 {id, name} 모양의 디자인을 모은다 (목소리·기본 템플릿 번호는 뺌)
const VOICE_IDS = ["seoa","hajun","taeo","ina","doyun","jihoon","yuna","minjae","luna","harin","seojun","daon","chaea","dahae","jia","mio","haru","ren","oliver","noah","emma","liam","ava","chloe","adam","jay"];
function findTpls(texts: string[]) {
  const out: { id: string; name: string }[] = [], seen = new Set<string>();
  const walk = (v: any) => {
    if (!v || typeof v !== "object") return;
    if (Array.isArray(v)) { v.forEach(walk); return; }
    const id = v.contentTemplateId ?? v.templateId ?? v.id, name = v.name ?? v.title ?? v.label ?? v.displayName;
    if (typeof id === "string" && typeof name === "string" && !seen.has(id) && !/^(cmn|cmp)/.test(id) && !VOICE_IDS.includes(id)) { seen.add(id); out.push({ id, name }); }
    Object.values(v).forEach(walk);
  };
  const parse = (t: string) => { try { return JSON.parse(t); } catch { return null; } };
  for (const body of texts) {
    const all = [body, ...body.split("\n").filter((l) => l.startsWith("data:")).map((l) => l.slice(5))];
    for (const t of all) {
      let d = parse(t); if (typeof d === "string") d = parse(d); if (!d) continue; walk(d);
      const c = d.result?.content; if (Array.isArray(c)) c.forEach((x: any) => { const e = typeof x?.text === "string" ? parse(x.text) : null; if (e) walk(e); });
    }
  }
  return out;
}
const norm = (x: string) => x.replace(/\s|한의원|한방병원|병원|변호사|법률사무소|의원/g, "");
const PROBES = ["/me", "/options", "/creation-options", "/templates", "/content-templates", "/presets", "/automation", "/automation-preset", "/settings"];
const MCPS = ["https://www.supershorts.co.kr/api/mcp", "https://www.supershorts.co.kr/api/business/mcp", "https://www.supershorts.co.kr/mcp"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const key = (Deno.env.get("SUPERSHORTS_KEY") || "").trim();
  const pw = (Deno.env.get("VIDEO_PW") || "").trim();
  if (!pw) return j({ ok: false, error: "Supabase 비밀값 VIDEO_PW가 아직 없어요." }, 500);
  if ((req.headers.get("x-video-key") || "") !== pw) return j({ ok: false, auth: false, error: "영상 비밀번호가 맞지 않아요." }, 401);
  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return j({ ok: false, error: "요청이 비어 있어요." }, 400); }

  if (b.action === "ping") return j({ ok: true, tts: !!(Deno.env.get("GOOGLE_TTS_KEY") || "").trim(), photos: !!((Deno.env.get("PIXABAY_KEY") || "").trim() || (Deno.env.get("PEXELS_KEY") || "").trim()), gemini: !!(Deno.env.get("GEMINI_KEY") || "").trim() });

  // 구글 음성: 문장마다 mp3를 만들어 돌려줌 (사이트에서 영상에 붙임). 비밀값 GOOGLE_TTS_KEY
  if (b.action === "tts") {
    const gk = (Deno.env.get("GOOGLE_TTS_KEY") || "").trim();
    if (!gk) return j({ ok: false, error: "구글 음성 키(GOOGLE_TTS_KEY)가 아직 없어요." }, 500);
    const lines = (Array.isArray(b.lines) ? b.lines : []).map((x) => String(x || "").trim().slice(0, 400)).filter(Boolean).slice(0, 40);
    if (!lines.length) return j({ ok: false, error: "읽을 문장이 없어요." }, 400);
    const voice = /^ko-KR-[\w-]{1,40}$/.test(String(b.voice)) ? String(b.voice) : "ko-KR-Neural2-C";
    const rate = Math.min(1.5, Math.max(0.7, Number(b.rate) || 1.1));
    const out: string[] = [];
    for (const text of lines) {
      const r = await fetch("https://texttospeech.googleapis.com/v1/text:synthesize?key=" + encodeURIComponent(gk), {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: { text }, voice: { languageCode: "ko-KR", name: voice }, audioConfig: { audioEncoding: "MP3", speakingRate: rate, sampleRateHertz: 44100 } }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.audioContent) {
        const m = String(d?.error?.message || r.status).split(gk).join("[키]").slice(0, 200);
        return j({ ok: false, error: r.status === 403 ? "구글에서 음성 기능이 꺼져 있거나 키 권한이 없어요. (" + m + ")" : "구글 음성을 만들지 못했어요. (" + m + ")" });
      }
      out.push(d.audioContent);
    }
    return j({ ok: true, audios: out });
  }

  // ── 블로그 이미지 도우미 ──
  // 비밀값 GEMINI_KEY (aistudio.google.com/apikey): 홈페이지 내용 정리(gemini-2.5-flash) + 나노바나나 그림(gemini-2.5-flash-image)
  const gemk = (Deno.env.get("GEMINI_KEY") || "").trim();
  const safeUrl = (s: unknown) => {
    try {
      const u = new URL(String(s || "").trim().replace(/^(?!https?:\/\/)/i, "https://"));
      if (!/^https?:$/.test(u.protocol)) return null;
      const h = u.hostname.toLowerCase();
      if (h === "localhost" || h.endsWith(".local") || h.endsWith(".internal") || /^(127\.|10\.|0\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|\[|::)/.test(h) || /^\d+$/.test(h)) return null;
      return u;
    } catch { return null; }
  };
  const b64 = (u: Uint8Array) => { let s = ""; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode(...u.subarray(i, i + 0x8000)); return btoa(s); };
  const UA = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36", "Accept-Language": "ko-KR,ko;q=0.9" };
  // 쓸 수 있는 모델을 구글 목록에서 찾음 (오래된 모델은 새 사용자에게 막힘). kind: text | image
  let MODELS: string[] | null = null;
  async function models(kind: "text" | "image") {
    if (!MODELS) {
      MODELS = [];
      try {
        let tok = "";
        for (let i = 0; i < 5; i++) {
          const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models?pageSize=200&key=" + encodeURIComponent(gemk) + (tok ? "&pageToken=" + tok : ""));
          const d = await r.json().catch(() => ({}));
          for (const m of d.models || []) if ((m.supportedGenerationMethods || []).includes("generateContent")) MODELS.push(String(m.name).replace(/^models\//, ""));
          tok = d.nextPageToken || ""; if (!tok) break;
        }
      } catch { /* 목록을 못 받으면 아래 기본값 */ }
    }
    const ver = (n: string) => { const m = n.match(/gemini-(\d+(?:\.\d+)?)/); return m ? parseFloat(m[1]) : 0; };
    const bad = /tts|audio|live|embedding|thinking|exp|preview|robotics|computer|learnlm|gemma|nano/i;
    const list = MODELS.filter((n) => /^gemini-/.test(n) && (kind === "image" ? /image/.test(n) && !/tts|audio|live/.test(n) : !/image/.test(n) && !bad.test(n) && /flash/.test(n)));
    // 같은 버전이면 lite 아닌 것, 이름이 짧은 것(정식판) 먼저
    list.sort((a, b) => ver(b) - ver(a) || Number(/lite/.test(a)) - Number(/lite/.test(b)) || a.length - b.length);
    const pre = kind === "image" ? MODELS.filter((n) => /^gemini-.*image/.test(n) && /preview/.test(n) && !list.includes(n)).sort((a, b) => ver(b) - ver(a)) : [];
    return [...list, ...pre, ...(kind === "image" ? ["gemini-2.5-flash-image"] : ["gemini-flash-latest", "gemini-2.5-flash"])];
  }
  async function gemAuto(kind: "text" | "image", body: unknown) {
    let last: unknown = null;
    // 없는 모델이면 다음 모델로, 붐비면(503·429) 잠깐 쉬고 한 번 더 한 뒤 다음 모델로
    for (const m of (await models(kind)).slice(0, 6)) {
      for (let k = 0; k < 2; k++) {
        try { return await gem(m, body); } catch (e) {
          last = e; const t = String((e as Error).message || e);
          if (/high demand|overloaded|unavailable|try again|503|429|RESOURCE_EXHAUSTED|rate/i.test(t)) { if (k === 0) { await new Promise((r) => setTimeout(r, 2500)); continue; } break; }
          if (/not found|no longer|not available|not supported|deprecated|unsupported|404/i.test(t)) break;
          throw e;
        }
      }
    }
    throw last || new Error("쓸 수 있는 제미나이 모델을 찾지 못했어요.");
  }
  async function gem(model: string, body: unknown) {
    const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + encodeURIComponent(gemk), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(String(d?.error?.message || r.status).split(gemk).join("[키]").slice(0, 240) + (r.status === 404 || r.status === 503 || r.status === 429 ? " (" + r.status + ")" : ""));
    return d;
  }

  // 홈페이지 읽기: 첫 화면 + 의료진·진료시간·오시는 길 같은 하위 쪽을 읽어 글자만 모으고, 제미나이 키가 있으면 칸별로 정리
  if (b.action === "site") {
    const u0 = safeUrl(b.url);
    if (!u0) return j({ ok: false, error: "홈페이지 주소를 확인해 주세요." });
    const strip = (h: string) => h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<br\s*\/?>|<\/(p|div|li|tr|h\d|dt|dd|section)>/gi, "\n").replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"')
      .replace(/[ \t\r\f]+/g, " ").replace(/\n\s*\n+/g, "\n").trim();
    async function get(u: URL) {
      const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 9000);
      try {
        const r = await fetch(u, { headers: UA, signal: ctl.signal, redirect: "follow" });
        if (!r.ok) return "";
        const buf = new Uint8Array(await r.arrayBuffer()).subarray(0, 1_500_000);
        let txt = new TextDecoder("utf-8").decode(buf);
        if (/charset=["']?euc-kr/i.test(txt) || /euc-kr/i.test(r.headers.get("content-type") || "")) txt = new TextDecoder("euc-kr").decode(buf);
        return txt;
      } catch { return ""; } finally { clearTimeout(t); }
    }
    const home = await get(u0);
    if (!home) return j({ ok: false, error: "홈페이지를 열지 못했어요. 주소가 맞는지 확인해 주세요." });
    const pages: string[] = [strip(home)], imgs = new Set<string>(), seen = new Set([u0.href]);
    const WANT = /의료진|원장|소개|진료\s*시간|진료안내|오시는|찾아오|위치|시설|둘러|입원|병실|진료과목|클리닉|치료|about|doctor|location|map|info/i;
    const links: URL[] = [];
    for (const m of home.matchAll(/<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
      try {
        const u = new URL(m[1], u0); const label = strip(m[2]);
        if (u.hostname !== u0.hostname || seen.has(u.href) || !/^https?:$/.test(u.protocol)) continue;
        if (WANT.test(label) || WANT.test(u.pathname)) { seen.add(u.href); links.push(u); }
      } catch { /* 잘못된 링크 */ }
    }
    const subs = await Promise.all(links.slice(0, 6).map(get));
    subs.forEach((h) => { if (h) pages.push(strip(h)); });
    for (const h of [home, ...subs]) for (const m of h.matchAll(/<img\b[^>]*?(?:data-src|src)=["']([^"']+)["']/gi)) {
      try { const u = new URL(m[1], u0); if (/^https?:$/.test(u.protocol) && !/logo|icon|btn|blank|sprite|banner_s|\.gif|\.svg/i.test(u.pathname)) imgs.add(u.href); } catch { /* */ }
    }
    const text = pages.join("\n----\n").slice(0, 40000);
    const logo = (home.match(/<img\b[^>]*(?:src)=["']([^"']*logo[^"']*)["']/i) || [])[1];
    // 키가 없을 때: 전화·주소·진료시간만 글자 규칙으로
    const tel = (text.match(/0\d{1,2}[-.)\s]\d{3,4}[-.\s]\d{4}|1[5-9]\d{2}-\d{4}/) || [""])[0];
    const hours: string[][] = [];
    for (const m of text.matchAll(/(평일|월[~\-–]금|월요일[^\n]{0,8}금요일|토요일|토|일요일|일·공휴일|공휴일|일요일·공휴일|야간[^\n]{0,8})\s*[:：]?\s*(\d{1,2}[:시]\s?\d{0,2}\s*(?:분)?\s*[~\-–]\s*\d{1,2}[:시]\s?\d{0,2}\s*(?:분)?)/g)) {
      if (hours.length < 4 && !hours.some((h) => h[0] === m[1])) hours.push([m[1], m[2].replace(/\s+/g, " ")]);
    }
    const lunch = ((text.match(/점심\s*시간\s*[:：]?\s*(\d{1,2}[:시]\s?\d{0,2}\s*[~\-–]\s*\d{1,2}[:시]\s?\d{0,2})/) || [])[1] || "");
    const addr = ((text.match(/((?:서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)[^\n]{4,60}?(?:로|길)\s?\d+[^\n]{0,30})/) || [])[1] || "").trim();
    let info: Record<string, unknown> = { tel, hours, lunch, addr };
    let note = "";
    if (gemk) {
      const prompt = `아래는 한 병원(한의원) 홈페이지에서 모은 글이에요. 블로그 안내 이미지에 넣을 정보를 JSON 하나로만 정리해 주세요.
규칙: 홈페이지에 실제로 있는 사실만 쓰고, 없으면 빈 값. 의료광고법에 걸리는 말(최고, 최초, 유일, 완치, 100%, 부작용 없음, 보장, 후기, 치료 효과 단정)은 쓰지 말 것. 짧고 쉬운 말로.
모양: {"name":"업체 이름","tel":"전화","hours":[["평일","09:00 - 19:00"]],"lunch":"13:00 - 14:00","addr":"주소","way":"찾아오는 길 한 줄","station":"가까운 역과 출구","walk":"도보 몇 분","parking":"주차 안내 한 줄","badges":["강점 3개, 6~10자"],"feats":["업체 특징 4개, 12자 안팎, 핵심 낱말 하나를 [[ ]]로 감싸기"],"treats":["진료·치료 항목 4~6개, 6~10자"],"doctors":[{"name":"","title":"대표원장","role":"한의사","fields":["진료 분야"],"history":["약력·학회 3~5줄"]}],"room":{"on":false,"title":"","items":[["1인실·다인실","짧은 설명"]],"note":""},"intro":"업체 소개 두 문장"}
room.on은 입원실이 실제로 있을 때만 true.
----
${text}`;
      try {
        const d = await gemAuto("text", { contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.2 } });
        const t = d?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || "").join("") || "";
        const g = JSON.parse(t.replace(/^```json|```$/g, "").trim());
        info = { ...info, ...Object.fromEntries(Object.entries(g).filter(([, v]) => v !== "" && v != null && !(Array.isArray(v) && !v.length))) };
      } catch (e) { note = "제미나이 정리를 못 해서 전화·주소·시간만 채웠어요. (" + String((e as Error).message || e).slice(0, 160) + ")"; }
    } else note = "제미나이 키(GEMINI_KEY)가 없어서 전화·주소·시간만 채웠어요.";
    return j({ ok: true, info, imgs: [...imgs].slice(0, 40), logo: logo ? new URL(logo, u0).href : "", pages: pages.length, note });
  }

  // 홈페이지 사진 한 장을 대신 받아 data URL로 (브라우저는 다른 사이트 사진을 그림으로 저장할 수 없어서)
  if (b.action === "img") {
    const u = safeUrl(b.url);
    if (!u) return j({ ok: false, error: "사진 주소가 이상해요." });
    try {
      const r = await fetch(u, { headers: { ...UA, Referer: u.origin + "/" } });
      const ct = r.headers.get("content-type") || "";
      if (!r.ok || !/^image\//.test(ct)) return j({ ok: false, error: "사진을 받지 못했어요." });
      const buf = new Uint8Array(await r.arrayBuffer());
      if (buf.length > 8_000_000) return j({ ok: false, error: "사진이 너무 커요." });
      return j({ ok: true, src: "data:" + ct.split(";")[0] + ";base64," + b64(buf) });
    } catch { return j({ ok: false, error: "사진을 받지 못했어요." }); }
  }

  // 나노바나나(gemini-2.5-flash-image)로 사진 그리기. 구글 결제가 연결된 키에서만 됨 (한 장 약 50원)
  if (b.action === "genimg") {
    if (!gemk) return j({ ok: false, error: "제미나이 키(GEMINI_KEY)가 아직 없어요." });
    const what = String(b.prompt || "").slice(0, 500);
    if (!what) return j({ ok: false, error: "무엇을 그릴지 비어 있어요." });
    const prompt = `A natural, photorealistic photo for a Korean clinic's blog: ${what}. Korean people if people appear, bright clean modern Korean clinic interior, soft natural light, warm and trustworthy mood, landscape 4:3. Absolutely no text, letters, watermarks or logos in the image.`;
    const tryOnce = (cfg: Record<string, unknown>) => gemAuto("image", { contents: [{ parts: [{ text: prompt }] }], generationConfig: cfg });
    try {
      let d;
      try { d = await tryOnce({ responseModalities: ["IMAGE"], imageConfig: { aspectRatio: "4:3" } }); }
      catch { d = await tryOnce({ responseModalities: ["TEXT", "IMAGE"] }); }
      const p = (d?.candidates?.[0]?.content?.parts || []).find((x: { inlineData?: { data?: string } }) => x.inlineData?.data);
      if (!p) return j({ ok: false, error: "그림이 나오지 않았어요. 다시 눌러 주세요." });
      return j({ ok: true, src: "data:" + (p.inlineData.mimeType || "image/png") + ";base64," + p.inlineData.data });
    } catch (e) {
      const m = String((e as Error).message || e);
      return j({ ok: false, error: /billing|quota|limit|RESOURCE_EXHAUSTED|free tier/i.test(m) ? "나노바나나는 구글 결제가 연결돼야 그려져요. (" + m.slice(0, 140) + ")" : "나노바나나 그림을 못 만들었어요. (" + m.slice(0, 160) + ")" });
    }
  }

  // 대본에 맞는 사진: 검색어마다 무료 사진(Pixabay, 없으면 Pexels) 하나를 골라 그림 자체(data URL)로 돌려줌.
  // 비밀값 PIXABAY_KEY (pixabay.com/api/docs 에서 가입하면 바로 보임) 또는 PEXELS_KEY
  if (b.action === "photos") {
    const xk = (Deno.env.get("PIXABAY_KEY") || "").trim(), pk = (Deno.env.get("PEXELS_KEY") || "").trim();
    if (!xk && !pk) return j({ ok: false, error: "사진 키(PIXABAY_KEY)가 아직 없어요." }, 500);
    const qs = (Array.isArray(b.queries) ? b.queries : []).slice(0, 30).map((x) => String(x || "").trim().slice(0, 80));
    const skip = new Set((Array.isArray(b.skip) ? b.skip : []).map(String));
    const pick = Math.max(0, Math.floor(Number(b.pick) || 0));
    // 검색 결과를 {id, url, by} 목록으로
    async function search(q: string): Promise<{ id: string; url: string; by: string }[] | "badkey"> {
      if (xk) {
        const r = await fetch("https://pixabay.com/api/?image_type=photo&orientation=horizontal&safesearch=true&per_page=20&lang=" + (/[가-힣]/.test(q) ? "ko" : "en") + "&key=" + encodeURIComponent(xk) + "&q=" + encodeURIComponent(q));
        if (r.status === 400 || r.status === 401 || r.status === 403) { const t = await r.text(); if (/key/i.test(t)) return "badkey"; return []; }
        const d = await r.json().catch(() => ({}));
        return (Array.isArray(d.hits) ? d.hits : []).map((h: { id: number; largeImageURL: string; user: string }) => ({ id: "x" + h.id, url: String(h.largeImageURL), by: String(h.user || "") }));
      }
      const r = await fetch("https://api.pexels.com/v1/search?per_page=15&orientation=landscape&query=" + encodeURIComponent(q), { headers: { Authorization: pk } });
      if (r.status === 401 || r.status === 403) return "badkey";
      const d = await r.json().catch(() => ({}));
      return (Array.isArray(d.photos) ? d.photos : []).map((p: { id: number; src: { original: string }; photographer: string }) => ({ id: "p" + p.id, url: String(p.src.original) + "?auto=compress&cs=tinysrgb&w=1280&h=1100&fit=crop", by: String(p.photographer || "") }));
    }
    const out: (null | { id: string; src: string; by: string })[] = [];
    for (const q of qs) {
      if (!q) { out.push(null); continue; }
      try {
        // 결과가 없으면 'asian'을 빼고, 그래도 없으면 첫 낱말만으로 다시 찾음
        let res = await search(q);
        for (const q2 of [q.replace(/^asian /, ""), q.replace(/^asian /, "").split(" ")[0]]) {
          if (res === "badkey" || (Array.isArray(res) && res.filter((p) => !skip.has(p.id)).length) || q2 === q) continue;
          res = await search(q2);
        }
        if (res === "badkey") return j({ ok: false, error: "사진 키가 틀렸어요. Supabase 비밀값(" + (xk ? "PIXABAY_KEY" : "PEXELS_KEY") + ")을 확인해 주세요." });
        const list = res.filter((p) => !skip.has(p.id));
        if (!list.length) { out.push(null); continue; }
        const p = list[(pick + out.length) % Math.min(list.length, 6)];
        const im = await fetch(p.url);
        if (!im.ok) { out.push(null); continue; }
        skip.add(p.id);
        out.push({ id: p.id, src: "data:image/jpeg;base64," + b64(new Uint8Array(await im.arrayBuffer())), by: p.by });
      } catch { out.push(null); }
    }
    return j({ ok: true, photos: out });
  }

  if (!key) return j({ ok: false, error: "Supabase 비밀값 SUPERSHORTS_KEY가 아직 없어요." }, 500);

  async function call(method: string, path: string, body?: unknown) {
    const h: Record<string, string> = { Authorization: `Bearer ${key}` };
    if (body) { h["Content-Type"] = "application/json"; h["Idempotency-Key"] = crypto.randomUUID(); }
    const r = await fetch(SS + path, { method, headers: h, body: body ? JSON.stringify(body) : undefined });
    const t = await r.text();
    let d: any; try { d = JSON.parse(t); } catch { d = { raw: t.slice(0, 300) }; }
    return { status: r.status, d };
  }


  // 디자인 목록이 있을 만한 주소를 차례로 물어봄 (읽기만 함, 크레딧 안 씀)
  async function probe() {
    const out: { path: string; status?: number; body?: string; error?: string }[] = [];
    for (const p of PROBES) {
      try { const r = await call("GET", p); out.push({ path: p, status: r.status, body: JSON.stringify(r.d).slice(0, 8000) }); } catch (e) { out.push({ path: p, error: String(e) }); }
    }
    for (const u of MCPS) {
      try {
        const r = await fetch(u, { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", Accept: "application/json, text/event-stream" },
          body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "get_creation_options", arguments: {} } }) });
        out.push({ path: u.replace("https://www.supershorts.co.kr", ""), status: r.status, body: (await r.text()).slice(0, 12000) });
      } catch (e) { out.push({ path: u, error: String(e) }); }
    }
    return out;
  }

  if (b.action === "make") {
    const text = String(b.text || "").trim();
    if (!text) return j({ ok: false, error: "대본을 넣어 주세요." }, 400);
    const voice = VOICES.includes(String(b.voice)) ? String(b.voice) : "doyun";
    const lengthMode = b.length === "longform" ? "longform" : "shortform";
    // 업체별 슈퍼쇼츠 디자인·제목 (사이트의 업체 설정에서 넘어옴). 정해진 모양만 통과시킴
    const o = (b.opts && typeof b.opts === "object") ? b.opts as Record<string, unknown> : {};
    const id = (v: unknown) => typeof v === "string" && /^[\w.:-]{1,100}$/.test(v) ? v : undefined;
    const body: Record<string, unknown> = { sourceText: text, planningMode: o.planningMode === "auto" ? "auto" : "direct", variantCount: 1, lengthMode, voice };
    if (id(o.contentTemplateId)) body.contentTemplateId = o.contentTemplateId;
    // 디자인을 따로 안 골랐으면 슈퍼쇼츠에 저장된 디자인 중 업체 이름이 같은 것을 자동으로 씀
    let tpl = "";
    const cl = norm(String(b.client || ""));
    if (!body.contentTemplateId && cl) {
      try {
        const ps = await probe();
        const ts = findTpls(ps.filter((p) => p.body && (p.status ?? 500) < 300).map((p) => p.body as string));
        const hit = ts.find((t) => norm(t.name) === cl) || ts.find((t) => norm(t.name).includes(cl) || cl.includes(norm(t.name)) && norm(t.name).length >= 2);
        if (hit) { body.contentTemplateId = hit.id; tpl = hit.name; }
      } catch (_) { /* 못 찾으면 기본 디자인 */ }
    }
    if (id(o.template)) body.template = o.template;
    if (typeof o.introEnabled === "boolean") body.introEnabled = o.introEnabled;
    if (id(o.introTemplateId)) body.introTemplateId = o.introTemplateId;
    if (typeof o.introDisplayOnly === "boolean") body.introDisplayOnly = o.introDisplayOnly;
    if (typeof o.title === "string" && o.title.trim()) body.title = o.title.trim().slice(0, 80);
    let r = await call("POST", "/jobs", body);
    // 제목·디자인 칸을 슈퍼쇼츠가 안 받으면 그 칸을 빼고 한 번 더 보냄
    if (r.status === 400 && body.title) { delete body.title; r = await call("POST", "/jobs", body); }
    // 자동으로 찾은 디자인 번호를 안 받으면 기본 디자인으로라도 만듦
    if (r.status === 400 && tpl) { delete body.contentTemplateId; tpl = ""; r = await call("POST", "/jobs", body); }
    if (r.status >= 300) {
      const e = r.d?.error ?? r.d?.message ?? r.d?.detail ?? r.d?.raw ?? "";
      const msg = (typeof e === "string" ? e : JSON.stringify(e)).split(key).join("[키]").slice(0, 300);
      return j({ ok: false, error: `${why(r.status)} (${r.status})${msg ? " · 슈퍼쇼츠: " + msg : ""}` });
    }
    return j({ ok: true, id: String(r.d.job_id), reserved: r.d.reserved_credits ?? null, tpl });
  }

  if (b.action === "job") {
    const id = String(b.id || "");
    if (!/^[\w-]+$/.test(id)) return j({ ok: false, error: "작업 번호가 이상해요." }, 400);
    const r = await call("GET", "/jobs/" + id);
    if (r.status >= 300) return j({ ok: false, error: `${why(r.status)} (${r.status})` });
    const st = r.d;
    if (st.status === "failed") return j({ ok: true, status: "failed", error: "슈퍼쇼츠에서 영상 만들기에 실패했어요. 크레딧은 돌려받아요. " + JSON.stringify(st.error ?? "") });
    if (st.status !== "completed") return j({ ok: true, status: String(st.status || "processing") });
    // 완성: 사이트 보관함(files/videos/)에 옮겨 두고 그 주소를 돌려줌. 못 옮기면 슈퍼쇼츠 주소 그대로.
    const sb = Deno.env.get("SUPABASE_URL"), sk = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const outs: any[] = st.result?.outputs || [];
    const files: string[] = [];
    for (let i = 0; i < outs.length; i++) {
      const src = String(outs[i].outputUrl);
      const path = `videos/${id}${outs.length > 1 ? "_" + (i + 1) : ""}.mp4`;
      let url = src;
      if (sb && sk) {
        try {
          const v = await fetch(src);
          if (v.ok) {
            const up = await fetch(`${sb}/storage/v1/object/files/${path}`, {
              method: "POST",
              headers: { Authorization: `Bearer ${sk}`, apikey: sk, "Content-Type": "video/mp4" },
              body: await v.arrayBuffer(),
            });
            if (up.ok || up.status === 409 || up.status === 400) {
              const chk = await fetch(`${sb}/storage/v1/object/public/files/${path}`, { method: "HEAD" });
              if (chk.ok) url = `${sb}/storage/v1/object/public/files/${path}`;
            }
          }
        } catch (_) { /* 슈퍼쇼츠 주소 그대로 */ }
      }
      files.push(url);
    }
    return j({ ok: true, status: "completed", files, credits: st.settled_credits ?? null });
  }


  // 디자인 목록 찾기: 슈퍼쇼츠에 저장된 업체별 디자인 번호를 알아내려고 후보 주소를 차례로 물어봄 (읽기만 함, 크레딧 안 씀)
  if (b.action === "options") {
    const out = await probe();
    // 키가 섞여 나오지 않게 지움
    return j({ ok: true, probes: JSON.parse(JSON.stringify(out).split(key).join("[키]")) });
  }
  return j({ ok: false, error: "모르는 요청이에요." }, 400);
});
