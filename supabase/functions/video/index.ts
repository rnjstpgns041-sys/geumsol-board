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
    const pro = kind === "text" ? MODELS.filter((n) => /^gemini-[\d.]+-pro$/.test(n)).sort((a, b) => ver(b) - ver(a)).slice(0, 1) : [];
    const extra = kind === "image" ? ["gemini-2.5-flash-image"] : ["gemini-flash-latest", "gemini-flash-lite-latest", ...pro];
    return [...new Set([...list, ...pre, ...extra])];
  }
  async function gemAuto(kind: "text" | "image", body: unknown, until = 0) {
    let last: unknown = null; const tried: string[] = [];
    // 없는 모델이면 다음 모델로, 붐비면(503·429) 잠깐 쉬고 한 번 더 한 뒤 다음 모델로
    for (const m of (await models(kind)).slice(0, 8)) {
      if (until && Date.now() > until - 4000) break; // 시간이 다 되면 그만 (함수가 통째로 끊기지 않게)
      tried.push(m);
      for (let k = 0; k < 2; k++) {
        try { return await gem(m, body, until); } catch (e) {
          last = e; const t = String((e as Error).message || e);
          if (/high demand|overloaded|unavailable|try again|503|429|RESOURCE_EXHAUSTED|rate/i.test(t)) { if (k === 0) { await new Promise((r) => setTimeout(r, 2500)); continue; } break; }
          if (/not found|no longer|not available|not supported|deprecated|unsupported|404/i.test(t)) break;
          throw e;
        }
      }
    }
    const msg = String((last as Error)?.message || last || "쓸 수 있는 제미나이 모델을 찾지 못했어요.");
    throw new Error(msg.slice(0, 120) + " [시도한 모델: " + tried.join(", ") + "]");
  }
  async function gem(model: string, body: unknown, until = 0) {
    const ctl = new AbortController(), tm = setTimeout(() => ctl.abort(), until ? Math.max(3000, Math.min(45000, until - Date.now())) : 90000);
    const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + encodeURIComponent(gemk), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: ctl.signal }).catch((e) => { throw new Error(ctl.signal.aborted ? "제미나이 응답이 너무 늦어요 (503)" : String((e as Error).message || e)); }).finally(() => clearTimeout(tm));
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
    const t0 = Date.now();
    const host = (h: string) => h.toLowerCase().replace(/^www\./, "");
    const HDR = { ...UA, Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" };
    async function get(u: URL, ms = 12000) {
      const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), ms);
      try {
        const r = await fetch(u, { headers: HDR, signal: ctl.signal, redirect: "follow" });
        if (!r.ok) return "";
        const buf = new Uint8Array(await r.arrayBuffer()).subarray(0, 700_000);
        let txt = new TextDecoder("utf-8").decode(buf);
        if (/charset=["']?euc-kr/i.test(txt.slice(0, 3000)) || /euc-kr/i.test(r.headers.get("content-type") || "")) txt = new TextDecoder("euc-kr").decode(buf);
        return txt;
      } catch { return ""; } finally { clearTimeout(t); }
    }
    // 화면을 자바스크립트로 그리는 홈페이지(아임웹·윅스·모두 등)나 막힌 곳은 r.jina.ai가 브라우저로 열어 본 글을 받음
    async function reader(u: URL) {
      const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 30000);
      try {
        const r = await fetch("https://r.jina.ai/" + u.href, { headers: { Accept: "text/plain", "X-Timeout": "20", "X-With-Images-Summary": "true", "X-With-Links-Summary": "true" }, signal: ctl.signal });
        if (!r.ok) return "";
        return (await r.text()).slice(0, 150_000);
      } catch { return ""; } finally { clearTimeout(t); }
    }
    type Pg = { url: URL; html: string; text: string; md: string };
    async function read(u: URL, ms?: number): Promise<Pg> {
      const html = await get(u, ms);
      const text = html ? strip(html) : "";
      // 글자가 너무 적으면(대부분 자바스크립트로 그리는 화면) 브라우저로 읽은 글로 바꿈
      if (text.replace(/\s/g, "").length >= 300 || Date.now() - t0 > 60000) return { url: u, html, text, md: "" };
      const md = await reader(u);
      return { url: u, html, text: md && md.length > text.length ? md.replace(/!\[[^\]]*\]\([^)]*\)/g, " ").replace(/\]\([^)]*\)/g, "]") : text, md };
    }
    // 브라우저가 이미 읽어 온 글이 있으면 다시 읽지 않고 정리만 함 (무료 한도: CPU 2초)
    const given = typeof b.text === "string" && b.text.length >= 200;
    const home: Pg = given ? { url: u0, html: "", text: String(b.text).slice(0, 24000), md: "" } : await read(u0);
    if (!home.text) return j({ ok: false, error: "홈페이지를 열지 못했어요. 주소가 맞는지 확인해 주세요." });
    const pages: string[] = [home.text], imgs = new Set<string>(), seen = new Set([u0.href]);
    if (given && Array.isArray(b.imgs)) for (const x of b.imgs.slice(0, 40)) addImg(String(x));
    const WANT = /의료진|원장|소개|진료\s*시간|진료안내|오시는|찾아오|위치|시설|둘러|입원|병실|진료과목|클리닉|치료|프로그램|센터|about|doctor|location|map|info|clinic|program/i;
    const links: URL[] = [];
    const addLink = (href: string, label: string) => {
      try {
        const u = new URL(href, u0); u.hash = "";
        if (host(u.hostname) !== host(u0.hostname) || seen.has(u.href) || !/^https?:$/.test(u.protocol) || /\.(jpe?g|png|gif|webp|pdf|zip)$/i.test(u.pathname)) return;
        if (WANT.test(label) || WANT.test(decodeURIComponent(u.pathname))) { seen.add(u.href); links.push(u); }
      } catch { /* 잘못된 링크 */ }
    };
    for (const m of home.html.matchAll(/<a\b[^>]*?href=["']([^"'#]+)["'][^>]*>([\s\S]{0,400}?)<\/a>/gi)) addLink(m[1], strip(m[2]));
    for (const m of home.md.matchAll(/(?<!!)\[([^\]]{0,80})\]\((https?:[^)\s]+)\)/g)) addLink(m[2], m[1]);
    const subs = given ? [] : await Promise.all(links.slice(0, 4).map((u) => read(u, 9000)));
    subs.forEach((p) => { if (p.text) pages.push(p.text); });
    for (const p of [home, ...subs]) {
      for (const m of p.html.matchAll(/<img\b[^>]*?(?:data-src|data-original|src)=["']([^"']+)["']/gi)) addImg(m[1]);
      for (const m of p.md.matchAll(/!\[[^\]]*\]\((https?:[^)\s]+)\)/g)) addImg(m[1]);
    }
    function addImg(src: string) {
      try { const u = new URL(src, u0); if (/^https?:$/.test(u.protocol) && !/logo|icon|btn|blank|sprite|banner_s|\.gif|\.svg/i.test(u.pathname)) imgs.add(u.href); } catch { /* */ }
    }
    const text = pages.join("\n----\n").slice(0, 24000);
    const logo = (home.html.match(/<img\b[^>]*(?:src)=["']([^"']*logo[^"']*)["']/i) || [])[1];
    // 키가 없을 때: 전화·주소·진료시간만 글자 규칙으로
    const tel = (text.match(/0\d{1,2}[-.)\s]\d{3,4}[-.\s]\d{4}|1[5-9]\d{2}-\d{4}/) || [""])[0];
    const hours: string[][] = [];
    for (const m of text.matchAll(/(평일\s*매일|평일|주말\s*[·,및]?\s*공휴일|주말|월[~\-–]금|월요일[^\n]{0,8}금요일|토요일|토|일요일|일·공휴일|공휴일|일요일·공휴일|야간[^\n]{0,8})\s*[:：]?\s*(\d{1,2}[:시]\s?\d{0,2}\s*(?:분)?\s*[~\-–]\s*\d{1,2}[:시]\s?\d{0,2}\s*(?:분)?)/g)) {
      if (hours.length < 4 && !hours.some((h) => h[0] === m[1])) hours.push([m[1].trim(), m[2].replace(/\s+/g, " ").trim()]);
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
        const d = await gemAuto("text", { contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.2 } }, t0 + 125000);
        const t = d?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || "").join("") || "";
        const g = JSON.parse(t.replace(/^```json|```$/g, "").trim());
        info = { ...info, ...Object.fromEntries(Object.entries(g).filter(([, v]) => v !== "" && v != null && !(Array.isArray(v) && !v.length))) };
      } catch (e) { note = "제미나이 정리를 못 해서 전화·주소·시간만 채웠어요. (" + String((e as Error).message || e).slice(0, 400) + ")"; }
    } else note = "제미나이 키(GEMINI_KEY)가 없어서 전화·주소·시간만 채웠어요.";
    return j({ ok: true, info, imgs: [...imgs].slice(0, 40), logo: logo ? new URL(logo, u0).href : "", pages: given ? Number(b.pages) || 1 : pages.length, note });
  }

  // ── 쇼츠 영상 도우미 (제미나이) ──
  const gemJson = (d: unknown) => {
    const t = (d as any)?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || "").join("") || "";
    return JSON.parse(t.replace(/^\s*```(?:json)?|```\s*$/g, "").trim());
  };
  // 대본 쓰기: 키워드 주제로 1분(공백 뺀 320~380자) 쇼츠 대본
  if (b.action === "script") {
    if (!gemk) return j({ ok: false, error: "제미나이 키(GEMINI_KEY)가 아직 없어요." });
    const kw = String(b.kw || "").trim().slice(0, 60), name = String(b.name || "").trim().slice(0, 40);
    if (!kw) return j({ ok: false, error: "키워드를 넣어 주세요." });
    const law = b.type === "law";
    const feats = (Array.isArray(b.feats) ? b.feats : []).map((x) => String(x || "").trim().slice(0, 120)).filter(Boolean).slice(0, 8);
    const prompt = `${law ? "법률사무소(변호사)" : "한의원·병원"} 홍보용 1분 세로 쇼츠 영상 대본을 써 주세요.
키워드: ${kw}
업체: ${name || "(없음)"}${b.area ? " / 지역: " + String(b.area).slice(0, 30) : ""}
업체 특징(사실인 것만, 이 중 2~3개를 자연스럽게):
${feats.map((f) => "- " + f).join("\n") || "- (없음)"}
규칙:
- 키워드 "${kw}"의 주제(증상·상황·궁금증)에 딱 맞는 내용으로. 다른 주제로 새지 말 것. 키워드 낱말을 2번 이상 넣기.
- 첫 문장은 시청자가 멈춰 보게 하는 질문이나 공감 한 줄. 마지막 문장은 ${name ? name + "에 상담을 권하는 말" : "상담을 권하는 말"}.
- 한 줄에 한 문장, 12~16줄, 각 문장은 공백 빼고 15~35자, 전체는 공백 빼고 320~380자. 말하듯 쉬운 존댓말(~요).
- ${law ? "변호사 광고 규칙: 승소 보장, 최고, 100%, 무조건 같은 말 금지." : "의료광고법: 최고, 최초, 유일, 완치, 100%, 부작용 없음, 보장, 치료 후기, 효과 단정 금지. '도움이 될 수 있어요'처럼 조심스럽게."}
- 없는 사실(가격, 할인, 경력, 장비)을 지어내지 말 것.
JSON 하나로만: {"lines":["문장1","문장2"]}`;
    try {
      const d = await gemAuto("text", { contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.9 } }, Date.now() + 60000);
      const lines = (gemJson(d).lines || []).map((x: unknown) => String(x || "").trim()).filter(Boolean).slice(0, 24);
      if (lines.length < 4) throw new Error("대본이 너무 짧게 나왔어요");
      return j({ ok: true, lines });
    } catch (e) { return j({ ok: false, error: "대본을 쓰지 못했어요. (" + String((e as Error).message || e).slice(0, 160) + ")" }); }
  }
  // 업체 사진 설명 달기: 팀이 올린 사진(우리 저장소)만 보고 무엇이 찍혔는지 짧게
  if (b.action === "label") {
    if (!gemk) return j({ ok: false, error: "제미나이 키(GEMINI_KEY)가 아직 없어요." });
    const base = (Deno.env.get("SUPABASE_URL") || "").replace(/\/$/, "") + "/storage/v1/object/public/files/";
    const urls = (Array.isArray(b.urls) ? b.urls : []).map(String).filter((u) => base.length > 40 && u.startsWith(base)).slice(0, 8);
    const until = Date.now() + 100000;
    const out = await Promise.all(urls.map(async (u) => {
      try {
        const r = await fetch(u); const ct = (r.headers.get("content-type") || "image/jpeg").split(";")[0];
        if (!r.ok || !/^image\//.test(ct)) return null;
        const buf = new Uint8Array(await r.arrayBuffer()); if (buf.length > 6_000_000) return null;
        const d = await gemAuto("text", { contents: [{ parts: [{ inline_data: { mime_type: ct, data: b64(buf) } }, { text: '병원·법률사무소 홍보 영상에 쓸 사진이에요. 무엇이 찍혔는지 JSON 하나로만: {"desc":"8~20자 한국어 설명 (예: 추나 치료 받는 환자, 한의원 입구 간판, 입원실 침대)","tags":["사진 속 대상·장소·행동 낱말 4~8개, 한국어"]}' }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.2 } }, until);
        const g = gemJson(d); return { desc: String(g.desc || "").slice(0, 40), tags: (Array.isArray(g.tags) ? g.tags : []).map((x: unknown) => String(x).slice(0, 12)).slice(0, 8) };
      } catch { return null; }
    }));
    return j({ ok: true, labels: out });
  }
  // 대본 문장마다 어울리는 업체 사진 고르기 (어울리는 것만, 억지로 다 쓰지 않음)
  if (b.action === "match") {
    if (!gemk) return j({ ok: false, error: "제미나이 키(GEMINI_KEY)가 아직 없어요." });
    const lines = (Array.isArray(b.lines) ? b.lines : []).map((x) => String(x || "").slice(0, 120)).slice(0, 30);
    const ph = (Array.isArray(b.photos) ? b.photos : []).slice(0, 40).map((x: any, i: number) => `${i}: ${String(x?.desc || "").slice(0, 40)} [${(Array.isArray(x?.tags) ? x.tags : []).map(String).join(", ").slice(0, 80)}]`);
    if (!lines.length || !ph.length) return j({ ok: true, pick: lines.map(() => -1) });
    const prompt = `쇼츠 영상 대본 문장마다, 아래 업체 사진 중 그 문장 내용과 잘 맞는 사진 번호를 골라 주세요.
- 문장 내용(증상, 치료, 장소, 사람)과 사진이 분명히 어울릴 때만 고르고, 애매하면 -1.
- 업체 소개·위치·상담 권유 문장에는 외관·간판·입구·데스크·진료실 같은 사진이 어울려요.
- 같은 사진은 한 번만. 사진을 다 쓰려고 억지로 고르지 말 것.
사진:
${ph.join("\n")}
문장:
${lines.map((l, i) => i + ": " + l).join("\n")}
JSON 하나로만: {"pick":[문장 수만큼 사진 번호 또는 -1]}`;
    try {
      const d = await gemAuto("text", { contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.1 } }, Date.now() + 50000);
      const raw = gemJson(d).pick || [], used = new Set<number>();
      const pick = lines.map((_, i) => { const n = Number(raw[i]); if (!Number.isInteger(n) || n < 0 || n >= ph.length || used.has(n)) return -1; used.add(n); return n; });
      return j({ ok: true, pick });
    } catch (e) { return j({ ok: false, error: String((e as Error).message || e).slice(0, 160) }); }
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
    // skip = 이번 영상에 쓴 사진 + 팀이 예전 영상에 쓴 사진 (최대한 다시 안 씀)
    const skip = new Set((Array.isArray(b.skip) ? b.skip : []).slice(0, 5000).map(String));
    const pick = Math.max(0, Math.floor(Number(b.pick) || 0));
    // vet[i] = 사진이 맞아야 할 조건(한국어). 있으면 제미나이가 작은 사진들을 보고 어울리는 것만 고름
    const vet = (Array.isArray(b.vet) ? b.vet : []).map((x) => String(x || "").slice(0, 300));
    const orient = (Array.isArray(b.orient) ? b.orient : []).map((x) => String(x || ""));
    // need[i] = 사진 태그(영어)에 꼭 있어야 할 낱말 (예: pain|ache). 제미나이가 안 될 때도 엉뚱한 사진을 거름
    const need = (Array.isArray(b.need) ? b.need : []).map((x) => { try { return x ? new RegExp(String(x).slice(0, 300), "i") : null; } catch { return null; } });
    let vetErr = "";
    const t0 = Date.now();
    type Ph = { id: string; url: string; by: string; pv: string; tags: string };
    // 검색 결과를 {id, url, by, pv(작은 사진)} 목록으로
    async function search(q: string, page = 1, ori = ""): Promise<Ph[] | "badkey"> {
      if (xk) {
        const r = await fetch("https://pixabay.com/api/?image_type=photo&orientation=" + (ori === "vertical" ? "vertical" : ori === "all" ? "all" : "horizontal") + "&safesearch=true&per_page=60&page=" + page + "&lang=" + (/[가-힣]/.test(q) ? "ko" : "en") + "&key=" + encodeURIComponent(xk) + "&q=" + encodeURIComponent(q));
        if (r.status === 400 || r.status === 401 || r.status === 403) { const t = await r.text(); if (/key/i.test(t)) return "badkey"; return []; } // 400 = 없는 쪽(page)
        const d = await r.json().catch(() => ({}));
        return (Array.isArray(d.hits) ? d.hits : []).map((h: { id: number; largeImageURL: string; previewURL: string; user: string; tags?: string }) => ({ id: "x" + h.id, url: String(h.largeImageURL), by: String(h.user || ""), pv: String(h.previewURL || ""), tags: String(h.tags || "") }));
      }
      const r = await fetch("https://api.pexels.com/v1/search?per_page=40&page=" + page + "&orientation=" + (ori === "vertical" ? "portrait" : "landscape") + "&query=" + encodeURIComponent(q), { headers: { Authorization: pk } });
      if (r.status === 401 || r.status === 403) return "badkey";
      const d = await r.json().catch(() => ({}));
      return (Array.isArray(d.photos) ? d.photos : []).map((p: { id: number; src: { original: string; tiny?: string }; photographer: string; alt?: string }) => ({ id: "p" + p.id, url: String(p.src.original) + "?auto=compress&cs=tinysrgb&w=1280&h=1100&fit=crop", by: String(p.photographer || ""), pv: String(p.src.tiny || ""), tags: String(p.alt || "") }));
    }
    // 후보 10장을 작게 받아 제미나이에게 보여 주고 조건에 맞는 번호만 받음. 맞는 게 없으면 []
    async function judge(cands: Ph[], want: string): Promise<number[] | null> {
      try {
        const ims = await Promise.all(cands.map(async (c) => { try { const r = await fetch(c.pv); return r.ok ? b64(new Uint8Array(await r.arrayBuffer())) : ""; } catch { return ""; } }));
        const parts: unknown[] = [{ text: `사진 ${cands.length}장이 0번부터 순서대로 있어요. 병원·한의원 블로그 그림에 넣을 사진을 고르려고 해요.
조건: ${want}
공통으로 빼야 할 사진: 문신, 흑백 예술 사진, 성적이거나 무섭거나 피가 보이는 사진, 글자·로고가 큰 사진, 조건과 주제가 다른 사진.
조건에 잘 맞는 번호만 잘 맞는 순서로 JSON 하나로 답해 주세요: {"good":[번호,...]} (하나도 없으면 {"good":[]})` }];
        ims.forEach((d, i) => { if (d) parts.push({ text: "사진 " + i }, { inline_data: { mime_type: "image/jpeg", data: d } }); });
        const d = await gemAuto("text", { contents: [{ parts }], generationConfig: { responseMimeType: "application/json", temperature: 0 } }, Math.min(t0 + 110000, Date.now() + 20000));
        const g = gemJson(d);
        return (Array.isArray(g.good) ? g.good : []).map(Number).filter((n: number) => Number.isInteger(n) && n >= 0 && n < cands.length && ims[n]);
      } catch (e) { vetErr = String((e as Error).message || e).slice(0, 160); return null; } // 제미나이가 안 되면 태그로만 고름
    }
    // 사진 자리마다 동시에 찾음 (한 번에 6개씩): 제미나이 확인이 있어도 오래 걸리지 않게
    type Got = null | "badkey" | { id: string; src: string; by: string };
    async function one(q: string, qi: number): Promise<Got> {
      if (!q) return null;
      try {
        const s0 = Date.now(), ori = orient[qi] || "";
        // 결과가 없으면 'asian'을 빼고, 그래도 없으면 앞 두 낱말만으로 다시 찾음
        let res = await search(q, 1, ori);
        for (const q2 of [q.replace(/^asian /, ""), q.replace(/^asian /, "").split(" ").slice(0, 2).join(" ")]) {
          if (res === "badkey" || (Array.isArray(res) && res.filter((p) => !skip.has(p.id)).length) || q2 === q) continue;
          res = await search(q2, 1, ori);
        }
        if (res === "badkey") return "badkey";
        let list = res.filter((p) => !skip.has(p.id));
        // 앞쪽(검색어에 잘 맞는 사진)이 다 쓰였으면 다음 쪽에서 찾음
        if (list.length < 3) { const more = await search(q, 2, ori); if (Array.isArray(more)) list = list.concat(more.filter((p) => !skip.has(p.id))); }
        if (!list.length) list = res; // 정말 다 썼으면 그때만 다시 씀
        // 태그에 꼭 있어야 할 낱말이 있으면 맞는 사진만 (2쪽까지 찾아봄). 하나도 없으면 빈칸
        const nd = need[qi];
        if (nd) {
          let ok = list.filter((p) => nd.test(p.tags));
          if (!ok.length) { const more = await search(q, 2, ori); if (Array.isArray(more)) ok = more.filter((p) => !skip.has(p.id) && nd.test(p.tags)); }
          list = ok;
        }
        if (!list.length) return null;
        // 잘 맞는 앞쪽 12장 안에서 골고루 (같은 검색어라도 영상마다 다른 사진)
        let p = list[(pick + qi * 7 + Math.floor(Math.random() * 1000)) % Math.min(list.length, 12)];
        // 조건이 있으면 제미나이가 본 사진 중 어울리는 것만 (앞 12장, 빨리 끝났을 때만 다음 12장). 끝까지 없으면 빈칸으로 둠
        if (gemk && vet[qi] && Date.now() - t0 < 80000) {
          let chosen: Ph | null = null, judged = false;
          for (let k = 0; k < 2 && !chosen && k * 12 < list.length && (k === 0 || Date.now() - s0 < 15000); k++) {
            const cands = list.slice(k * 12, k * 12 + 12).filter((c) => c.pv);
            const good = await judge(cands, vet[qi]);
            if (good === null) break;
            judged = true;
            if (good.length) chosen = cands[good[(pick + Math.floor(Math.random() * 1000)) % Math.min(good.length, 3)]];
          }
          if (chosen) p = chosen; else if (judged) return null;
        }
        skip.add(p.id);
        const im = await fetch(p.url);
        if (!im.ok) return null;
        return { id: p.id, src: "data:image/jpeg;base64," + b64(new Uint8Array(await im.arrayBuffer())), by: p.by };
      } catch { return null; }
    }
    const out: Got[] = [];
    for (let i = 0; i < qs.length; i += 6) out.push(...await Promise.all(qs.slice(i, i + 6).map((q, k) => one(q, i + k))));
    if (out.includes("badkey")) return j({ ok: false, error: "사진 키가 틀렸어요. Supabase 비밀값(" + (xk ? "PIXABAY_KEY" : "PEXELS_KEY") + ")을 확인해 주세요." });
    return j({ ok: true, photos: out, note: vetErr ? "사진 확인(제미나이)을 못 해서 사진 설명 낱말로만 골랐어요. (" + vetErr + ")" : "" });
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
