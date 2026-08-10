// 성장형 프로토타입 로컬 서버
//   - prototype.html 서빙
//   - POST /api/draft → Upstage Solar 호출 (API 키는 서버에만 머무름)
//
// 실행:  node server.mjs      →  http://localhost:8787
//
// sendev 이식 시 이 파일의 /api/draft 핸들러가 그대로 TanStack Start
// 서버 함수(createServerFn)로 옮겨집니다. 브라우저는 키를 절대 보지 않습니다.

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 8787;

/* ── .env 로드 (의존성 없이) ───────────────────────────── */
const env = {};
try {
  const raw = await readFile(join(ROOT, ".env"), "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
} catch {
  console.error("⚠️  .env 를 읽지 못했습니다.");
}

const API_KEY = env.UPSTAGE_API_KEY;
const BASE_URL = env.UPSTAGE_BASE_URL || "https://api.upstage.ai/v1";
const MODEL = env.UPSTAGE_CHAT_MODEL || "solar-pro4";

if (!API_KEY) {
  console.error("⚠️  UPSTAGE_API_KEY 가 비어 있습니다. AI 초안 생성이 동작하지 않습니다.");
}

/* ── 프롬프트 ──────────────────────────────────────────
   사례집 실제 문체를 그대로 따르게 하고, 메모에 없는 사실은
   지어내지 못하게 막습니다.                              */
const SYSTEM = `당신은 서울특별시교육청 「교사 개발자 해커톤 사례집」의 편집자입니다.
성장형 과정에 참여한 교사가 짧게 적은 메모를 받아, 사례집에 실릴 원고로 살려 씁니다.

교사는 바빠서 메모를 아주 짧게 적습니다. 당신의 일은 그 짧은 메모에서
교사가 말하지 않았지만 분명히 겪었을 장면을 읽어내어, 읽는 사람이 그 상황을
그려볼 수 있을 만큼 충분히 풀어 쓰는 것입니다.

문체
- '~습니다' 문어체. 구어체나 '~해요'체는 쓰지 않습니다.
- 교사의 관점이 먼저입니다. 기술 자랑이 아니라 학교 현장의 장면과 학생의 배움이 중심입니다.
- 홍보 문구처럼 쓰지 않습니다. 담담하게, 그러나 구체적으로 씁니다.

풍성하게 쓰는 방법
- 메모에 적힌 상황을 학교의 구체적 장면으로 펼칩니다.
  (예: "며칠 걸림" → 언제, 어떤 상황에서, 무엇을 반복하게 되는지)
- 그 일이 반복될 때 교사와 학생에게 무엇이 쌓이는지까지 씁니다.
- 문제를 겪는 사람이 이 교사만이 아니라는 점을 드러냅니다.
- 각 항목은 서로 다른 이야기를 합니다. 같은 문장을 바꿔 쓰지 않습니다.

지어내지 않는 선
- 메모에 없는 **구체적 사실**은 만들지 않습니다.
  숫자, 도구·서비스 이름, 학교·기관 이름, 성과와 효과의 수치가 여기 해당합니다.
- 반면 메모에서 자연스럽게 따라 나오는 **상황과 정황**은 적극적으로 풀어 씁니다.
- 단정하기 어려운 것은 "~하곤 합니다", "~라고 판단했습니다", "~하고자 했습니다"로 씁니다.
- 아직 만들지 않은 기능을 만든 것처럼 쓰지 않습니다. 미완성은 미완성이라고 밝힙니다.
  성장형 과정에서는 완성도보다 문제 발견과 시도의 과정이 더 중요하게 다뤄집니다.

반드시 아래 키를 가진 JSON 객체 하나만 출력합니다. 다른 텍스트는 출력하지 않습니다.
{
  "gap":   "현장에서 발견한 빈틈. 각 줄이 '• '로 시작하는 불릿 3~4개. 각 불릿은 한 문장이되 상황이 드러나게. 줄바꿈은 \\n",
  "why":   "왜 이 문제인가. 이 문제가 개인의 불편이 아니라 구조적인 문제인 이유까지. 4~5문장",
  "value": "어떤 가치가 있는가. 교사에게 무엇이 달라지고, 그 시간이 학생에게 어떻게 돌아가는지. 4~5문장",
  "fr":    "기능적 요구(FR). 사용자가 무엇을 할 수 있어야 하는지 동작 중심으로. 구현한 것과 아직 못한 것을 구분해서. 3~4문장",
  "next":  "무엇을 먼저 고칠 것인가. 우선순위와 그렇게 정한 이유, 그다음 계획까지. 3~4문장"
}`;

async function makeDraft({ memo, users, goal, peer, scope }) {
  const parts = [`[교사가 적은 메모]\n${memo || "(비어 있음)"}`];
  if (users) parts.push(`[주요 사용자]\n${users}`);
  if (goal) parts.push(`[핵심 목표]\n${goal}`);
  if (scope) parts.push(`[구현한 범위]\n${scope}`);
  if (peer) parts.push(`[동료에게 받은 피드백]\n${peer}`);

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: parts.join("\n\n") },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
      max_tokens: 1600,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Upstage ${res.status}: ${body.slice(0, 300)}`);
  }

  const json = await res.json();
  const text = json.choices?.[0]?.message?.content ?? "";
  let draft;
  try {
    draft = JSON.parse(text);
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) throw new Error("모델이 JSON을 반환하지 않았습니다.");
    draft = JSON.parse(m[0]);
  }
  return { draft, usage: json.usage, model: json.model };
}

/* ── 서버 ──────────────────────────────────────────────── */
const server = createServer(async (req, res) => {
  const send = (code, type, body) => {
    res.writeHead(code, { "Content-Type": type, "Cache-Control": "no-store" });
    res.end(body);
  };

  if (req.method === "POST" && req.url === "/api/draft") {
    let raw = "";
    req.on("data", (c) => {
      raw += c;
      if (raw.length > 1e6) req.destroy();
    });
    req.on("end", async () => {
      const started = Date.now();
      try {
        const input = JSON.parse(raw || "{}");
        if (!API_KEY) throw new Error("서버에 UPSTAGE_API_KEY 가 없습니다.");
        const { draft, usage, model } = await makeDraft(input);
        const ms = Date.now() - started;
        console.log(`  ✓ 초안 생성 ${ms}ms · ${model} · ${usage?.total_tokens ?? "?"} 토큰`);
        send(200, "application/json; charset=utf-8",
          JSON.stringify({ ok: true, draft, meta: { model, ms, tokens: usage?.total_tokens } }));
      } catch (err) {
        console.error("  ✗ 초안 생성 실패:", err.message);
        send(500, "application/json; charset=utf-8",
          JSON.stringify({ ok: false, error: err.message }));
      }
    });
    return;
  }

  if (req.method === "GET" && (req.url === "/" || req.url.startsWith("/?"))) {
    try {
      const html = await readFile(join(ROOT, "prototype.html"), "utf8");
      send(200, "text/html; charset=utf-8",
        `<!doctype html><html lang="ko"><head><meta charset="utf-8">` +
        `<meta name="viewport" content="width=device-width, initial-scale=1">` +
        `<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css">` +
        `</head><body>${html}</body></html>`);
    } catch {
      send(500, "text/plain; charset=utf-8", "prototype.html 을 찾을 수 없습니다.");
    }
    return;
  }

  if (req.method === "GET" && req.url === "/health") {
    send(200, "application/json", JSON.stringify({ ok: true, model: MODEL, hasKey: !!API_KEY }));
    return;
  }

  send(404, "text/plain; charset=utf-8", "Not found");
});

server.listen(PORT, () => {
  console.log(`\n  성장형 프로토타입`);
  console.log(`  ─────────────────────────────────────────`);
  console.log(`  주소   http://localhost:${PORT}`);
  console.log(`  모델   ${MODEL}`);
  console.log(`  키     ${API_KEY ? "설정됨 (" + API_KEY.length + "자)" : "없음 ⚠️"}`);
  console.log(`  ─────────────────────────────────────────\n`);
});
