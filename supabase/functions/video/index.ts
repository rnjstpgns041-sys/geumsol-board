// 금솔 팀 사이트 영상 만들기: 슈퍼쇼츠 키를 Supabase 비밀값(SUPERSHORTS_KEY)에 숨겨 두고 대신 불러 주는 함수.
// 필요한 비밀값(Edge Functions > Secrets): SUPERSHORTS_KEY (ss_live_...), VIDEO_PW (영상 비밀번호)
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const key = (Deno.env.get("SUPERSHORTS_KEY") || "").trim();
  const pw = (Deno.env.get("VIDEO_PW") || "").trim();
  if (!key || !pw) return j({ ok: false, error: "Supabase 비밀값(SUPERSHORTS_KEY, VIDEO_PW)이 아직 없어요." }, 500);
  if ((req.headers.get("x-video-key") || "") !== pw) return j({ ok: false, auth: false, error: "영상 비밀번호가 맞지 않아요." }, 401);
  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return j({ ok: false, error: "요청이 비어 있어요." }, 400); }

  async function call(method: string, path: string, body?: unknown) {
    const h: Record<string, string> = { Authorization: `Bearer ${key}` };
    if (body) { h["Content-Type"] = "application/json"; h["Idempotency-Key"] = crypto.randomUUID(); }
    const r = await fetch(SS + path, { method, headers: h, body: body ? JSON.stringify(body) : undefined });
    const t = await r.text();
    let d: any; try { d = JSON.parse(t); } catch { d = { raw: t.slice(0, 300) }; }
    return { status: r.status, d };
  }

  if (b.action === "make") {
    const text = String(b.text || "").trim();
    if (!text) return j({ ok: false, error: "대본을 넣어 주세요." }, 400);
    const voice = VOICES.includes(String(b.voice)) ? String(b.voice) : "doyun";
    const lengthMode = b.length === "longform" ? "longform" : "shortform";
    const r = await call("POST", "/jobs", { sourceText: text, planningMode: "auto", variantCount: 1, lengthMode, voice });
    if (r.status >= 300) return j({ ok: false, error: `${why(r.status)} (${r.status})` });
    return j({ ok: true, id: String(r.d.job_id), reserved: r.d.reserved_credits ?? null });
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

  if (b.action === "ping") return j({ ok: true });
  return j({ ok: false, error: "모르는 요청이에요." }, 400);
});
