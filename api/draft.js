// AI 초안 생성 — Upstage Solar 호출
//
// Vercel 서버리스 함수이자, 로컬 server.mjs 가 가져다 쓰는 모듈입니다.
// API 키는 이 파일 안에서만 읽습니다. 브라우저로는 절대 나가지 않습니다.
//
// sendev.kr 이식 시 이 파일의 makeDraft() 가
// TanStack Start 의 createServerFn() 안으로 그대로 들어갑니다.

const BASE_URL = process.env.UPSTAGE_BASE_URL || "https://api.upstage.ai/v1";
const MODEL = process.env.UPSTAGE_CHAT_MODEL || "solar-pro4";

export const SYSTEM = `당신은 서울특별시교육청 「교사 개발자 해커톤 사례집」의 편집자입니다.
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

export async function makeDraft({ memo, users, goal, peer, scope }, apiKey) {
  const key = apiKey || process.env.UPSTAGE_API_KEY;
  if (!key) throw new Error("UPSTAGE_API_KEY 가 설정되지 않았습니다.");

  const parts = [`[교사가 적은 메모]\n${memo || "(비어 있음)"}`];
  if (users) parts.push(`[주요 사용자]\n${users}`);
  if (goal) parts.push(`[핵심 목표]\n${goal}`);
  if (scope) parts.push(`[구현한 범위]\n${scope}`);
  if (peer) parts.push(`[동료에게 받은 피드백]\n${peer}`);

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
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

/* Vercel 서버리스 핸들러 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "POST 만 지원합니다." });
    return;
  }
  const started = Date.now();
  try {
    const input = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const { draft, usage, model } = await makeDraft(input);
    res.status(200).json({
      ok: true,
      draft,
      meta: { model, ms: Date.now() - started, tokens: usage?.total_tokens },
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}
