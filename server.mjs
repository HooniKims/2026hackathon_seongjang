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
import { makeDraft } from "./api/draft.js";

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

for (const [k, v] of Object.entries(env)) if (!process.env[k]) process.env[k] = v;
const API_KEY = env.UPSTAGE_API_KEY;
const BASE_URL = env.UPSTAGE_BASE_URL || "https://api.upstage.ai/v1";
const MODEL = env.UPSTAGE_CHAT_MODEL || "solar-pro4";

if (!API_KEY) {
  console.error("⚠️  UPSTAGE_API_KEY 가 비어 있습니다. AI 초안 생성이 동작하지 않습니다.");
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
        const { draft, usage, model } = await makeDraft(input, API_KEY);
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
      const html = await readFile(join(ROOT, "index.html"), "utf8");
      send(200, "text/html; charset=utf-8",
        `<!doctype html><html lang="ko"><head><meta charset="utf-8">` +
        `<meta name="viewport" content="width=device-width, initial-scale=1">` +
        `<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css">` +
        `</head><body>${html}</body></html>`);
    } catch {
      send(500, "text/plain; charset=utf-8", "index.html 을 찾을 수 없습니다.");
    }
    return;
  }

  if (req.method === "GET" && req.url.startsWith("/assets/")) {
    const name = req.url.split("?")[0].replace(/^\/assets\//, "");
    if (/[\\/]|\.\./.test(name)) { send(400, "text/plain", "bad path"); return; }
    try {
      const buf = await readFile(join(ROOT, "assets", name));
      const type = name.endsWith(".png") ? "image/png"
        : name.endsWith(".jpg") || name.endsWith(".jpeg") ? "image/jpeg"
        : name.endsWith(".svg") ? "image/svg+xml" : "application/octet-stream";
      res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-store" });
      res.end(buf);
    } catch { send(404, "text/plain; charset=utf-8", "not found"); }
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
