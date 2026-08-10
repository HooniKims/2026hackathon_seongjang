# SEN DEV CONNECT (sendev.kr) 디자인 조사 문서

> 작성일: 2026-08-10
> 조사 방법: 프로덕션 HTML(SSR) · 번들 CSS(`/assets/styles-B-oDyHsV.css`) · 라우트별 JS 청크 정적 분석
> 목적: 신규 게시판/기능 제안 및 샘플 제작 시 기존 디자인과 100% 일관성을 유지하기 위한 레퍼런스

---

## 0. 한눈에 보기

| 항목 | 값 |
|---|---|
| 서비스명 | **SEN DEV CONNECT** (서울시교육청 교사 개발자 플랫폼) |
| 도메인 | `https://sendev.kr` |
| 기술 스택 | React + **TanStack Start**(SSR/파일 라우팅) + Vite, TanStack Query, **Tailwind CSS v4**, **shadcn/ui**(Radix), **lucide-react** 아이콘, **sonner** 토스트, Kakao Map |
| 빌드 출처 | `<meta name="author" content="Lovable">` — Lovable(GPT Engineer)로 생성된 코드베이스 |
| 폰트 | **Pretendard Variable** (jsDelivr CDN, v1.3.9) |
| 인증 모델 | **회원가입 없음.** 닉네임 + 닉네임 비밀번호(해시 저장) 기반 |
| 다크모드 | CSS 토큰(`.dark`)은 **정의되어 있으나 토글 UI 없음** → 현재 라이트 전용 |
| 푸터 | **없음** (레이아웃이 header + main 으로만 구성) |

디자인 한 줄 요약:
> **민트그린 단색 액센트 + 순백 카드 + 큰 라운드(16px~24px) + 얕은 그림자 + hover 시 살짝 떠오르는(-translate-y) 마이크로 인터랙션**의, 여백이 넉넉한 모던 SaaS 스타일. 해커톤 탭에만 **포스트잇 담벼락**이라는 강한 시각적 아이덴티티가 얹혀 있음.

---

## 1. 정보 구조(IA) & 라우트 맵

### 1.1 전역 내비게이션 (헤더, 좌→우 순서)

| 순서 | 라벨 | 경로 | 아이콘(lucide) |
|---|---|---|---|
| 로고 | SEN DEV CONNECT | `/home` | `code-xml` |
| 1 | 사용자 가이드 | `/guide` | `circle-question-mark` |
| 2 | 홈 | `/home` | `house` |
| 3 | 캘린더 | `/calendar` | `calendar` |
| 4 | 해커톤 | `/board?tab=hackathon` | `trophy` |
| 5 | 자료집 | `/board?tab=resources` | `book-open` |
| 6 | Dev Ground | `/board?tab=devground` | `rocket` |
| 7 | Hello, World | `/board?tab=helloworld` | `terminal` |
| 우측 아이콘 | 검색 | `/search?q=&mode=title` | `search` |
| 우측 아이콘 | 내 페이지 | `/mypage` | `user-round` + `my` 뱃지 |
| 우측 아이콘 | 관리자 | `/admin/categories` | `settings` |

**게시판 탭은 4개가 전부**이고, 각 탭 안에서 폴더(그룹)/게시판을 관리자가 자유롭게 늘리는 구조. → **신규 게시판 제안은 "탭 안의 새 카테고리" 또는 "5번째 탭 추가" 두 가지 층위로 나뉜다.**

### 1.2 전체 라우트

```
/                        → /home 리디렉트
/home                    메인(배너 캐러셀 + 다가오는 이벤트)
/guide                   사용자 가이드 (16개 섹션 + 문서 내 검색)
/calendar                Dev 캘린더 (월간 그리드 / 모바일 목록 토글)
/search                  통합 검색 (제목 / 제목+내용 / 작성자)
/mypage                  내 페이지 (닉네임 로그인, 레벨/배지/활동)
/board                   ?tab=hackathon|resources|devground|helloworld
/board/$slug             게시판 상세(섹션별 목록)
/board/$slug/$postNo     글 상세
/board/$slug/new-general 일반글 작성
/board/$slug/new-question 질문 작성(레거시, 현재 일반글로 통합)
/board/$slug/new-project 산출물 등록
/board/$slug/new-link    링크 등록
/board/$slug/new-problem 문제ZIP 제보
/board/$slug/series/$series 연재 시리즈 보기

/admin                   → /admin/categories 리디렉트
/admin/categories        카테고리 관리
/admin/calendar          캘린더 관리
/admin/criteria          평가 관리 (루브릭/평가자 명단/셔플·개시·마감)
/admin/home              홈 화면 구성 (배너)
/admin/problem-options   문제ZIP 선택지 (Q1 영역 / Q2 빈도)
/admin/profiles          사용자 프로필 🔒 (시스템 관리자 비밀번호 추가 필요)
/admin/settings          → /admin/criteria 리디렉트
```

### 1.3 현재 운영 중인 실제 게시판 (2026-08 기준)

**해커톤** — 폴더 구조 사용
```
📁 [Lv1] 입문형 (처음 개발에 도전하는 입문형 해커톤) — 3
   ├ 공지사항          /board/lv1-notice     🔒 비밀번호 입장
   ├ 멘토링 게시판(Q&A) /board/lv1-qa         🔒
   └ 입문형 산출물      /board/lv1-portfolio  🔒
📁 [Lv2] 성장형 — 4
   ├ 공지사항          /board/lv2-notice     🔒
   ├ 멘토링 게시판(Q&A) /board/lv2-qa         🔒
   ├ 과제 게시판        /board/lv2-work       🔒
   └ 성장형 산출물      /board/lv2-portfolio  (공개)
📁 [Lv3] 도전형 — 2
   ├ 공지사항          /board/lv3-notice     🔒
   └ 문제정의          /board/problem        🔒
📁 명예의 전당 (비활성) — 3  ← "목록에서 숨기기" ON 상태 (opacity-60, 클릭 불가)
   ├ 입문형 해커톤 수상작 / 성장형 해커톤 수상작 / 도전형 해커톤 수상작
· 해커톤 성찰(강사전용)  /board/after  🔒  (폴더 밖 최상위)
```

**자료집** (폴더 없이 2열 그리드)
- 문제ZIP `/board/zip` — 도전형 해커톤을 위한 문제 수합
- 가이드북 공청회 `/board/open`
- 해커톤 사례집 `/board/book`
- 바이브코딩 자료 `/board/item`

**Dev Ground**
- 바이브 코딩 공부해요! `/board/youtube`
- 개발 노트 `/board/devnote`
- 플랫폼 QA 게시판 `/board/qa`
- 베타테스터 모집 `/board/tester`

**Hello, World**
- 가입인사 `/board/hello`
- 소소한 일상 `/board/today`
- 바이브코딩 연수 홍보 `/board/lecture`
- 보도자료 `/board/news`

탭 설명문(H1 아래 회색 텍스트) — 신규 탭 제안 시 톤 참고:
| 탭 | 설명 |
|---|---|
| 해커톤 | 교사들이 함께 모여 정해진 기간 동안 아이디어를 코드로 만들고 결과물을 나누는 공간이에요. |
| 자료집 | 수업과 바이브코딩에 바로 활용할 수 있는 자료와 가이드를 모아둔 공간이에요. |
| Dev Ground | 교사들이 서로 소통, 공유하는 바이브코딩 문화 조성을 위한 공간이에요. |
| Hello, World | 처음 시작하는 분들을 위한 입문 가이드와 첫걸음 정보를 담은 공간이에요. |

---

## 2. 디자인 토큰

Tailwind v4 `@theme` + shadcn 토큰 체계. 실제 배포 CSS에는 HEX와 `lab()` 두 벌이 중복 정의되어 있으며(브라우저 호환 fallback), 아래는 **HEX 기준**.

### 2.1 컬러 — 라이트 (`:root`)

| 토큰 | 값 | 용도 |
|---|---|---|
| `--background` | `#f8fafc` | 페이지 바탕 (slate-50) |
| `--foreground` | `#0f1926` | 본문 텍스트 (거의 검정, 살짝 남색) |
| `--card` / `--card-foreground` | `#ffffff` / `#0f1926` | 모든 카드·헤더 |
| `--popover` | `#ffffff` | 팝오버/다이얼로그 |
| **`--primary`** | **`#11b981`** | **브랜드 민트그린** (emerald-500 계열) |
| `--primary-foreground` | `#f6fefa` | primary 위 텍스트 |
| `--secondary` | `#e7f7ee` | 헤더 우측 아이콘 버튼 배경 |
| `--secondary-foreground` | `#005336` | 진한 초록 텍스트 |
| `--muted` / `--muted-foreground` | `#f1f5f9` / `#687485` | 비활성 배경 / 보조 텍스트 |
| `--accent` / `--accent-foreground` | `#d8f7e6` / `#005336` | 강조 배경(연민트), 썸네일 플레이스홀더 |
| `--destructive` | `#e40014` | 삭제·일요일·공휴일 |
| `--border` / `--input` | `#dfe5eb` | 테두리 |
| `--ring` | `#11b981` | 포커스 링 |
| `--radius` | **`1rem` (16px)** | 기본 라운드 |

차트/포스트잇 팔레트
```
--chart-1 #11b981  --chart-2 #009588  --chart-3 #104e64  --chart-4 #fcbb00  --chart-5 #f99c00
--postit-foreground #2a4243
--postit-yellow #f6efd5   --postit-pink   #fedade   --postit-green  #cbf3de
--postit-blue   #cceffb   --postit-purple #e4e1fb   --postit-orange #ffe2cb
```

토큰 밖에서 **하드코딩된 색 딱 하나**: 읽지 않은 글 뱃지/점 = `bg-pink-500` + `text-white`. (읽음 표시 전용 시그널 컬러)

### 2.2 컬러 — 다크 (`.dark`)

정의는 있으나 **토글 UI가 없어 실사용되지 않음**. 게다가 다크 팔레트는 shadcn 기본값(파랑 계열: `--primary #e2e8f0`, `--chart-1 #1447e6`)이라 **브랜드 민트와 연결이 끊겨 있음**.
→ 🎯 *개선 제안 소재: 다크모드 토글 + 브랜드 정합 다크 팔레트.*

### 2.3 타이포그래피

```css
font-family: "Pretendard Variable", Pretendard, -apple-system,
             BlinkMacSystemFont, system-ui, sans-serif;
```

| 클래스 | 크기 | 실사용처 |
|---|---|---|
| `text-3xl` | 1.875rem / lh 1.2 | 캘린더 제목(sm 이상) |
| `text-2xl` | 1.5rem | 페이지 H1 (`text-2xl font-bold text-foreground`) |
| `text-xl` | 1.25rem | 로고, 내 페이지 H1 |
| `text-lg` | 1.125rem | 섹션 H2, 카드 제목 (`text-lg font-semibold`) |
| `text-base` | 1rem / lh 1.5 | 폴더명 |
| `text-sm` | 0.875rem | **기본 본문/설명/버튼** (가장 많이 쓰임) |
| `text-xs` | 0.75rem | 메타정보, 카운트, 캡션 |
| `text-[11px]` `text-[10px]` `text-[8px]` | 임의값 | 뱃지·칩·`my` 마이크로 라벨 |

굵기: `400 / 500(medium) / 600(semibold) / 700(bold)`.
- H1 = `font-bold`, 카드 제목 = `font-semibold`, 버튼/링크 = `font-medium`.
- `tracking-tight(-0.025em)`, `tracking-widest(0.1em)` 정의됨.

본문 렌더링은 **Tailwind Typography**:
```
prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground
prose-a:text-primary prose-strong:text-foreground prose-code:text-primary
prose-li:text-foreground prose-table:text-foreground
```

### 2.4 라운드 / 그림자 / 간격

**라운드 스케일** (이 사이트의 시그니처 — 대체로 크다)
| 값 | 실제 | 용도 |
|---|---|---|
| `rounded-lg` | 8px | 캘린더 셀, 작은 썸네일 |
| `rounded-xl` | 12px | 버튼, 인풋, 칩, 필터 |
| `rounded-2xl` | 16px | **카드, 헤더 아이콘 버튼, 내비 링크, 폴더 컨테이너** |
| `rounded-3xl` | 24px | 히어로 배너, 가이드 섹션 카드 |
| `rounded-full` | — | 뱃지, 날짜 원, 아바타, 캐러셀 화살표 |

**그림자**: `shadow-sm`(기본) → hover `shadow-md` → 강조 `shadow-lg`. 진한 그림자는 거의 안 씀.

**간격**: Tailwind 기본(`--spacing: .25rem`).
- 페이지 컨테이너: `mx-auto px-6 sm:px-12 max-w-5xl py-8` (캘린더만 `max-w-[1800px] py-4`)
- 헤더 내부: `px-6 py-4 sm:px-28`
- 카드 내부: `p-6`(일반) / `p-5`(리스트형) / `p-4`(폴더 헤더·포스트잇)
- 섹션 간: `space-y-6` (홈만 `space-y-10`)

### 2.5 브레이크포인트

```
sm  40rem (640px)   ← 데스크톱 내비 노출 기준 (모바일 판정선)
md  48rem (768px)
lg  64rem (1024px)
xl  80rem (1280px)  ← 포스트잇 좌우 담벼락 노출 기준
2xl 96rem (1536px)
```
> ⚠️ 이 사이트는 `md`를 거의 안 쓰고 **`sm`에서 모바일↔데스크톱을 한 번에 전환**한다. 640~1024px 구간은 데스크톱 레이아웃을 그대로 쓴다.

---

## 3. 레이아웃 시스템

### 3.1 셸 구조

```html
<div class="min-h-screen bg-background">
  <header class="sticky top-0 z-20 bg-card/90 shadow-sm backdrop-blur">
    <div class="mx-auto flex w-full items-center gap-3 px-6 py-4 sm:gap-10 sm:px-28">
      <!-- 로고 / nav(sm:flex) / 검색·마이·관리자 아이콘(sm:flex) / 햄버거(sm:hidden) -->
    </div>
  </header>
  <main class="mx-auto px-6 sm:px-12 max-w-5xl py-8"> ... </main>
</div>
<!-- 푸터 없음 -->
```
- 헤더는 **반투명 흰색 + 블러**로 고정(z-20).
- 모바일 메뉴는 Radix **Sheet(side="right", w-72)** — 메뉴 항목은 `rounded-2xl px-4 py-3`, 하단에 검색 폼(select + input) → 내 페이지 → 관리자 순.

### 3.2 내비게이션 링크 상태

```html
<!-- 활성 -->
<a class="flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-medium
          transition-all duration-200 active:scale-95
          bg-primary text-primary-foreground shadow-md">

<!-- 비활성 -->
<a class="... text-muted-foreground hover:-translate-y-0.5 hover:text-foreground">
```
> **핵심 인터랙션 규칙: 비활성 요소는 hover 시 위로 뜨고(`-translate-y`), 클릭 시 눌린다(`active:scale-95`).** 이 두 개가 사이트 전체 촉감을 결정한다.

### 3.3 안 읽은 글 카운트 뱃지 (내비 우측)

```html
<span class="ml-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center
             rounded-full px-1.5 text-xs font-bold leading-none
             bg-pink-500 text-white">3</span>
<!-- 해당 탭이 활성일 땐 bg-white/25 text-primary-foreground -->
```
99 초과 시 `99+`.

---

## 4. 컴포넌트 패턴 카탈로그

> 아래 스니펫은 **실제 프로덕션 클래스 문자열 그대로**다. 샘플 제작 시 복붙해서 쓰면 시각적으로 100% 일치한다.

### 4.1 카테고리(게시판) 카드 — 가장 많이 쓰이는 컴포넌트

```html
<a href="/board/slug"
   class="group flex flex-col justify-between rounded-2xl bg-card p-6 shadow-sm
          transition-all duration-200 hover:-translate-y-1 hover:shadow-md active:scale-95">
  <div>
    <h2 class="flex items-center gap-2 text-lg font-semibold text-foreground">
      게시판 이름
      <svg class="lucide lucide-lock h-4 w-4 text-muted-foreground"></svg> <!-- 비밀번호 게시판만 -->
    </h2>
    <p class="mt-1 text-sm text-muted-foreground">설명이 없습니다.</p>
  </div>
  <div class="mt-6 flex items-center justify-between text-sm font-medium text-primary">
    <span>바로 입장</span> <!-- 또는 "비밀번호 입장" -->
    <svg class="lucide lucide-arrow-right h-4 w-4 transition-transform duration-200
                group-hover:translate-x-1"></svg>
  </div>
</a>
```
컨테이너: `<div class="grid gap-4 sm:grid-cols-2">`

**비활성(목록에서 숨김) 상태** — `<a>` 대신 `<div>`로 렌더:
```html
<div class="flex flex-col justify-between rounded-2xl bg-card p-6 shadow-sm
            opacity-60 cursor-not-allowed select-none">
  <h2 class="... text-muted-foreground">이름</h2>
  <div class="mt-6 ... text-muted-foreground"><span>비활성</span></div>
</div>
```

### 4.2 폴더(그룹) 아코디언

```html
<div class="rounded-2xl bg-card/60 shadow-sm">   <!-- 비활성이면 + opacity-60 -->
  <button type="button"
          class="flex w-full items-center gap-2 rounded-2xl p-4 text-left
                 transition-colors hover:bg-accent/50 active:scale-[0.99]">
    <svg class="lucide-chevron-right h-4 w-4 shrink-0 text-muted-foreground
                transition-transform duration-200 rotate-90"></svg> <!-- 펼침 시 rotate-90 -->
    <svg class="lucide-folder-open h-5 w-5 shrink-0 text-primary"></svg>
    <span class="flex-1 min-w-0">
      <span class="block truncate text-base font-semibold text-foreground">[Lv1] 입문형</span>
      <span class="block truncate text-xs text-muted-foreground">폴더 설명</span>
    </span>
    <span class="shrink-0 text-xs text-muted-foreground">3</span> <!-- 하위 개수 -->
  </button>
  <div class="space-y-3 px-3 pb-3 pl-6 sm:pl-9"> <!-- 하위 카드들(1열 세로) --> </div>
</div>
```
- 펼침/접힘 상태는 **기기별 localStorage에 저장**됨.
- 폴더는 다단계 중첩 가능. 순서 변경은 **같은 폴더 안에서만**.

### 4.3 버튼 (shadcn `buttonVariants`)

```
base: inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md
      text-sm font-medium cursor-pointer transition-colors
      focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
      disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed
      [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0

variant  default     bg-primary text-primary-foreground shadow hover:bg-primary/90
         destructive bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90
         outline     border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground
         secondary   bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80
         ghost       hover:bg-accent hover:text-accent-foreground
         link        text-primary underline-offset-4 hover:underline

size     default h-9 px-4 py-2 | sm h-8 rounded-md px-3 text-xs
         lg h-10 rounded-md px-8 | icon h-9 w-9
```
> 실제 사용 시 대부분 `className="rounded-xl active:scale-95"`를 덧붙여 라운드를 12px로 키운다. **버튼은 rounded-md(6px)가 아니라 rounded-xl로 보이는 게 이 사이트의 실제 룩이다.**

### 4.4 폼 요소

```html
<!-- 인풋 (커스텀, 게시판·검색에서 사용) -->
<input class="min-w-0 flex-1 rounded-xl border border-border bg-background
              px-4 py-2.5 text-sm text-foreground outline-none
              focus:ring-2 focus:ring-ring">

<!-- 게시판 내 검색 (아이콘 + X 버튼 포함) -->
<input class="w-full min-w-0 rounded-xl border border-border bg-card
              py-2.5 pl-9 pr-9 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring">

<!-- textarea -->
<textarea class="w-full resize-none rounded-xl border border-border bg-background
                 px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring">

<!-- shadcn Input (내 페이지 등) -->
<input class="flex h-9 w-full rounded-md border border-input bg-transparent
              px-3 py-1 text-base shadow-sm transition-colors">

<!-- 체크박스 -->
<input type="checkbox" class="h-4 w-4 rounded border-border accent-primary">
```

**비밀번호 인풋**은 항상 우측에 눈 버튼(`PasswordInput` 컴포넌트):
```html
<button class="absolute inset-y-0 right-0 flex w-10 items-center justify-center
               text-muted-foreground transition-colors hover:text-foreground"
        aria-label="비밀번호 보기"><svg class="lucide-eye h-4 w-4"></svg></button>
```

### 4.5 세그먼트 컨트롤 / 필터 칩

```html
<!-- 검색 모드 토글 (활성 / 비활성) -->
<button class="rounded-xl px-4 py-2 text-sm font-medium transition-colors active:scale-95
               bg-primary text-primary-foreground shadow-sm">제목</button>
<button class="rounded-xl px-4 py-2 text-sm font-medium transition-colors active:scale-95
               bg-muted text-muted-foreground hover:text-foreground">제목+내용</button>

<!-- 정렬 토글 컨테이너(최신순/좋아요순) -->
<div class="flex items-center gap-1 rounded-xl bg-muted p-1 w-fit"> ... </div>

<!-- 태그 칩 -->
<span class="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-primary">영역</span>
<span class="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">빈도</span>
<!-- 칩 옆 개수는 --> <span class="ml-1.5 text-xs opacity-70">12</span>
```

### 4.6 빈 상태 (EmptyState)

```html
<div class="flex flex-col items-center justify-center rounded-2xl bg-card px-6 py-16
            text-center shadow-sm">
  <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-primary">
    <svg class="h-8 w-8"></svg>
  </div>
  <h3 class="text-lg font-semibold text-foreground">검색어를 입력해주세요.</h3>
  <p class="mt-2 max-w-sm text-sm text-muted-foreground">보조 설명</p>
</div>
```
간이형: `<div class="rounded-2xl bg-card p-8 text-center shadow-sm">` + 회색 아이콘(`mx-auto mb-3 h-8 w-8 text-muted-foreground`) + `text-sm text-muted-foreground`.

**빈 상태 문구 톤** — 전부 `~어요/~에요` 체:
> "아직 등록된 글이 없어요." / "예정된 이벤트가 없어요. 캘린더에서 일정을 확인해 보세요." / "아직 댓글이 없어요. 첫 댓글을 남겨보세요!" / "아직 제보된 문제가 없어요."

### 4.7 글 목록 행 & 산출물/링크 카드

```html
<!-- 글 목록 한 줄 -->
<div class="flex items-center justify-between gap-5 rounded-2xl bg-card p-5 shadow-sm
            transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95">
  <div class="flex flex-1 min-w-0 items-start gap-2">
    <span class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-pink-500"></span> <!-- 안 읽음 -->
    <span class="min-w-0 line-clamp-2 text-sm font-medium text-foreground">제목</span>
  </div>
  <div class="flex shrink-0 items-center gap-3 text-sm text-muted-foreground">
    작성자 · 날짜 · 조회수(hidden sm:flex) · 좋아요 · 댓글
  </div>
</div>

<!-- 산출물/링크 썸네일 카드 -->
<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  <a class="group block overflow-hidden rounded-2xl bg-card shadow-sm
            transition-all duration-200 hover:-translate-y-1 hover:shadow-md active:scale-95">
    <div class="relative flex aspect-video items-center justify-center overflow-hidden
                bg-accent text-primary"> <!-- 썸네일 없으면 민트 배경 + 아이콘 -->
      <img class="h-full w-full object-cover">
      <span class="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-primary
                   px-2.5 py-1 text-xs font-medium text-primary-foreground shadow-sm">평가 완료</span>
    </div>
    <div class="p-4">
      <p class="text-base font-semibold leading-snug text-foreground">제목</p>
      <p class="text-xs text-muted-foreground">작성자 · 날짜</p>
    </div>
  </a>
</div>
```

### 4.8 포스트잇 후기 카드 (해커톤 전용 시그니처)

```html
<button class="group block w-full rounded-md p-4 text-left text-postit-foreground shadow-md
               transition-transform duration-200 hover:scale-[1.03] hover:shadow-lg
               bg-postit-yellow"      <!-- yellow|pink|green|blue|purple|orange -->
        style="transform: rotate(-2deg)"   <!-- 회전값 순환 -->
        title="후기 수정/삭제">
  <div class="mb-2 flex items-center justify-between gap-2">
    <span class="inline-flex items-center rounded-full bg-black/10 px-2 py-0.5
                 text-[11px] font-bold">입문형</span>
  </div>
  <p>후기 내용</p>
  <p class="mt-3 text-right text-xs font-semibold opacity-80">닉네임</p>
</button>
```
- 회전 배열: `["-2deg","1.5deg","-1deg","2deg","-1.5deg","1deg"]` 순환
- 참가 유형: `intro=입문형 / growth=성장형 / challenge=도전형`
- 라운드가 **`rounded-md`(6px)로 유일하게 작다** — 종이 느낌 표현

**PC 담벼락** (`xl` 이상): 본문(`max-w-5xl`) 양옆 빈 공간에 고정 배치
```html
<div class="fixed top-28 bottom-6 hidden w-[calc(50%-33rem)] overflow-hidden xl:block left-1">
  <div class="flex gap-2 px-1">  <!-- 2열, 짝/홀 인덱스로 분배 -->
    <div class="postit-marquee-track flex flex-col"
         style="--postit-marquee-duration: 40s"> ... 복제본 ... </div>
  </div>
</div>
```
**모바일 띠**: `fixed inset-x-0 bottom-0 z-40 overflow-hidden border-t border-black/5 bg-background backdrop-blur xl:hidden`, 카드 `aspect-square w-44`, 상단에 "후기 펼치기/접기" 손잡이. 이때 페이지는 `pb-56 xl:pb-0`으로 여백 확보.

**후기 작성 버튼** (H1 우측):
```html
<button class="inline-flex h-9 items-center gap-1.5 rounded-xl bg-postit-yellow px-3
               text-sm font-semibold text-postit-foreground shadow-sm
               transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95">
  <svg class="lucide-sticky-note h-4 w-4"></svg>후기 작성
</button>
```

### 4.9 페이지네이션

```html
<div class="flex items-center justify-center gap-1.5 pt-2">
  <button class="flex h-9 w-9 items-center justify-center text-sm text-muted-foreground"
          aria-label="이전 페이지">…</button>
</div>
```

### 4.10 기타 UI

| 요소 | 구현 |
|---|---|
| 토스트 | `sonner` — `position="top-center"`, `richColors` |
| 다이얼로그 | Radix Dialog — `max-h-[90vh] max-w-2xl overflow-y-auto rounded-2xl` |
| 라이트박스 | `flex h-screen w-screen max-w-none ... bg-black/90 p-0 [&>button]:hidden` + 전체화면/다운로드/닫기, ESC·배경클릭, 핀치줌·더블탭 |
| 팝오버 | 배지 `+N` 칩 클릭 시 보유 배지 전체 목록 |
| 확인 다이얼로그 | `useConfirm` + AlertDialog ("~할까요? 되돌릴 수 없어요.") |
| 스켈레톤 | `animate-pulse` (`h-32 w-full rounded-lg` 등) |
| 지도 | Kakao Map (`KakaoMap` 청크, 캘린더 장소 표시/검색) |

---

## 5. 모션 시스템

| 이름 | 정의 | 용도 |
|---|---|---|
| 기본 트랜지션 | `transition-all duration-200` | 거의 모든 hover |
| hover lift | `hover:-translate-y-1`(카드) / `-translate-y-0.5`(내비·행) | 떠오름 |
| press | `active:scale-95` / `active:scale-[0.99]`(폴더) / `active:scale-[0.98]` | 눌림 |
| 화살표 슬라이드 | `group-hover:translate-x-1` | 카드 CTA |
| 뒤로가기 링크 | `hover:-translate-x-0.5` | "카테고리 목록" |
| 아코디언 | `accordion-down/up` + `--radix-accordion-content-height` | 폴더 |
| Sheet | `slide-in-from-right`, open 500ms / close 300ms | 모바일 메뉴 |
| **hero-deal-next/prev** | `0.6s cubic-bezier(.22,1,.36,1) both` | 홈 배너 카드 딜링 |
| **postit-marquee-up** | `translateY(0 → -50%)` linear infinite, `duration = max(24, n×4)s` | PC 포스트잇 세로 흐름 |
| **postit-marquee-left** | `translateX(0 → -50%)` linear infinite | 모바일 가로 띠 |
| marquee 정지 | `:hover { animation-play-state: paused }` | 읽기 편의 |
| 역방향 | `.is-reverse { animation-direction: reverse }` | 오른쪽 담벼락 |

**접근성**: `@media (prefers-reduced-motion: reduce)`에서 `postit-marquee-track`, `postit-marquee-row`, `hero-deal-*` 전부 `animation: none`. 홈 배너 전환도 `motion-safe:` 프리픽스 사용.
→ 신규 애니메이션 제안 시 **reduced-motion 대응 필수**.

---

## 6. 페이지별 해부

### 6.1 홈 `/home`

```
<div class="space-y-10">
  <section class="md:mx-auto md:max-w-[50%]">   ← 배너: 세로 9:16, 화면 절반 폭
  <section>                                      ← 다가오는 이벤트
```

**배너 캐러셀** — "카드 딜링(deal)" 모션. 3장이 뒤로 겹쳐 보임:
| 깊이 | transform | opacity | z |
|---|---|---|---|
| 0 (앞) | `translateX(0) scale(1) rotate(0)` | 1 | 30 |
| 1 | `translateX(14px) translateY(-16px) scale(.93) rotate(1.5deg)` | .7 | 20 |
| 2 | `translateX(26px) translateY(-30px) scale(.86) rotate(3deg)` | .4 | 10 |
| 3 | `translateX(34px) translateY(-40px) scale(.82) rotate(4deg)` | 0 | 0 |

- 슬라이드 컨테이너: `relative aspect-[9/16] w-full overflow-hidden rounded-3xl shadow-md`
- 문구 오버레이: `absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-6 sm:p-8` + `text-lg font-bold text-white drop-shadow sm:text-2xl`
- 좌우 화살표: `absolute top-1/2 ... h-9 w-9 rounded-full border bg-background/80 backdrop-blur`, **데스크톱에선 `md:-left-12 / md:-right-12`로 배너 바깥에** 위치
- 배너 미등록 시 플레이스홀더: `flex aspect-[9/16] ... rounded-3xl bg-gradient-to-br from-primary/15 to-secondary p-8 text-center` + `sparkles` 아이콘 + "교사 개발자 플랫폼"

**다가오는 이벤트** 섹션
```html
<div class="mb-4 flex items-center justify-between">
  <h2 class="flex items-center gap-2 text-lg font-bold text-foreground">
    <svg class="lucide-calendar-days h-5 w-5 text-primary"></svg>다가오는 이벤트</h2>
  <a href="/calendar" class="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
    전체 일정 보기 <svg class="lucide-arrow-right h-4 w-4"></svg></a>
</div>
<div class="grid gap-4 sm:grid-cols-2">
  <div class="group rounded-2xl bg-card p-5 shadow-sm transition-all duration-200
              hover:-translate-y-0.5 hover:shadow-md"> ... 장소/시간/메모 ... </div>
</div>
```
> 조사 시점 기준 홈은 **배너 0장 / 이벤트 0건**으로 두 섹션 모두 빈 상태였다.

### 6.2 캘린더 `/calendar`

- `main`이 유일하게 `max-w-[1800px] py-4` (풀블리드에 가까움)
- 높이: `sm:h-[calc(100vh-6rem)]` — 뷰포트에 딱 맞춘 앱형 레이아웃
- 헤더: `Dev 캘린더` (`text-xl sm:text-3xl font-bold`) + 이전/다음 달 chevron + `2026년 8월`
- **모바일 전용 뷰 토글**: `flex gap-1 rounded-xl bg-muted p-1 sm:hidden` → `달력`(layout-grid) / `목록`(list)
- 데스크톱 그리드: `hidden flex-1 flex-col rounded-2xl bg-card p-2 shadow-sm sm:flex sm:p-6`, 요일 헤더 `grid-cols-7`, 일요일·공휴일 `text-destructive`
- 날짜 원: `inline-flex h-6 w-6 ... rounded-full sm:h-8 sm:min-w-8`, 오늘 = `bg-primary text-primary-foreground` + 셀 `bg-accent/50`
- 공휴일 라벨: `truncate text-[10px] font-medium text-destructive sm:text-xs` (예: 광복절)
- 모바일: 날짜 버튼 `aspect-square` + 일정 있으면 `h-1.5 w-1.5 rounded-full bg-primary` 점
- 하단 선택일 패널: `rounded-2xl bg-card p-4 shadow-sm` + "10일 (월) 일정"
- 일정 필드(관리자): 행사 이름 / 날짜 / 시간(예: 오후 2시) / 장소(카카오맵 검색 or 직접 입력) / 대상(예: 전체 교사) / 메모 / 파일 첨부(hwp·pdf, 최대 10MB) / 링크 첨부

### 6.3 게시판 탭 `/board?tab=...`

```html
<div class="space-y-6 pb-56 xl:pb-0">   <!-- 해커톤만 pb-56 (모바일 포스트잇 띠 회피) -->
  <div class="flex items-start justify-between gap-3">
    <div class="min-w-0 space-y-1">
      <h1 class="text-2xl font-bold text-foreground">해커톤</h1>
      <p class="text-sm text-muted-foreground">탭 설명…</p>
    </div>
    <div class="shrink-0"><!-- 해커톤만 "후기 작성" 버튼 --></div>
  </div>
  <div class="space-y-4">
    <!-- 폴더 아코디언들 → 그 다음 폴더 없는 카드들 grid gap-4 sm:grid-cols-2 -->
  </div>
</div>
```

### 6.4 게시판 상세 `/board/$slug`

```html
<a class="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground
          transition-all duration-200 hover:-translate-x-0.5 hover:text-foreground">
  <svg class="lucide-arrow-left h-4 w-4"></svg>카테고리 목록</a>
<div class="rounded-2xl bg-card p-6 shadow-sm">
  <h1 class="text-2xl font-bold text-foreground">게시판 이름</h1>
  <p class="mt-1 text-sm text-muted-foreground">설명</p>
</div>
<!-- 게시판 내 검색창 (?q= 로 URL 유지) -->
<!-- 섹션들이 활성화된 것만 순서대로 렌더링 -->
```

**섹션 종류** (관리자가 카테고리별로 켜고 끔, 이름도 각각 변경 가능):
| 섹션 | 기본 이름 | 특징 |
|---|---|---|
| 고정 게시글 | 고정 게시글 | 상단 고정(공지) 체크된 글 |
| 일반게시판 | 일반게시판 | 최신순, 페이지네이션 |
| 산출물 | 산출물 | 썸네일 카드 그리드, 별점 평가 대상, GitHub 링크 필수 옵션 |
| 링크 | 링크 | OG 썸네일 크게 표시되는 카드 |
| 문제ZIP | 문제ZIP | 3단계 폼 제보, 영역·빈도 필터, 최신순/좋아요순 |
| 시리즈 | 시리즈 | 연재 묶음 |

### 6.5 글 상세 `/board/$slug/$postNo`

- 컨테이너 `rounded-2xl bg-card p-6 shadow-sm`
- 제목 `text-xl font-bold text-foreground break-words sm:text-2xl`
- 메타 줄: 작성자(+`Lv.N` 뱃지 + 대표 배지 아이콘 + `+N` 칩) · 날짜 · 조회수 · 공지 칩
- 본문: `prose prose-sm max-w-none prose-*` 커스터마이즈
- 액션: `mt-4 flex flex-wrap gap-2 border-t border-border pt-4` → 수정 / 삭제 / 공유(링크 복사) / 이동(관리자만)
- 좋아요 · 댓글(대댓글 `space-y-3 border-l-2 border-border pl-4`) · 이미지 첨부 · 파일 다운로드 카드
- **연재**: "다음 편 작성" / 이전 편·다음 편, 작성순 목록, 현재 편 강조
- **이전글/다음글**: 좌우 큰 버튼(`h-auto min-w-0 flex-1 justify-start rounded-2xl px-4 py-3 text-left`), 모바일 스와이프 · PC 방향키
- **산출물 평가**: 루브릭 기준별 별점(0.5점 단위), 닉네임+비밀번호 확인, "✅ 이미 평가하셨어요" / "🔒 아직 평가가 시작되지 않았어요." / "🎉 이 카테고리의 모든 산출물 평가를 마쳤어요."
- **링크 프리뷰**: 한 줄 단독 링크 자동 임베드
  - YouTube/Vimeo/Canva(보기전용) → 인라인 플레이어
  - Canva(편집 공유)/Google Drive → 아이콘 카드
  - 그 외 → OG 썸네일 + 제목 + 도메인 카드
    (`my-4 flex flex-col gap-3 overflow-hidden rounded-2xl border border-border bg-card p-3 no-underline shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:items-center`)
- **GitHub 저장소**: README 자동 로드
- 글쓰기 진입 시 **저작권 및 게시물 이용 안내 팝업** ("다시 보지 않기" 체크박스)

### 6.6 검색 `/search`

```html
<h1 class="text-2xl font-bold text-foreground">게시글 검색</h1>
<form class="space-y-3 rounded-2xl bg-card p-5 shadow-sm">
  <div class="flex flex-wrap gap-2"><!-- 제목 / 제목+내용 / 작성자 --></div>
  <div class="flex gap-2"><input …><button>검색</button></div>
</form>
```
모드 값: `title` / `title_content` / `author` (URL 쿼리로 유지).

### 6.7 내 페이지 `/mypage`

- 로그인 전: `mx-auto max-w-md py-8` 중앙 정렬 카드
- 원형 아바타 `h-12 w-12 rounded-full bg-primary/10 text-primary` + `my` 마이크로 뱃지
- 닉네임 / 닉네임 비밀번호(눈 버튼) / "이 기기에 저장" 체크 / 로그인 / "비밀번호를 잊으셨나요?"
- 로그인 후: Lv.N 활동 카드, 활동 점수, 보유 배지 전체, 내가 쓴 글·댓글, 받은/누른 좋아요, 닉네임 변경, 복구 질문 설정

### 6.8 사용자 가이드 `/guide`

- **문서 내 검색**(하이라이트 + ▲▼ 순차 이동, Enter/Shift+Enter)
- 상단 목차: 번호칩 + 제목 (`rounded-xl border border-border px-3 py-2`, 번호 `h-5 w-5 rounded-md bg-muted text-[11px]`)
- 각 섹션: `scroll-mt-24 rounded-3xl border border-border bg-card p-6 shadow-sm`
  헤더 = `h-10 w-10 rounded-2xl bg-primary/10 text-primary` 아이콘 + `text-lg font-bold`
  본문 = `space-y-3 text-sm leading-relaxed text-muted-foreground`
- 표: `overflow-hidden rounded-2xl border border-border` + `thead bg-muted/60` + `tbody divide-y` + `odd:bg-muted/30`
- **16개 섹션**: ①닉네임 이유 ②비밀번호 찾기 ③비밀번호 안내 ④레벨(LV) ⑤배지 ⑥보안 ⑦메뉴 안내 ⑧해커톤 후기카드 ⑨글쓰기와 공지 ⑩저작권 ⑪읽지 않은 글 ⑫조회수 ⑬본문 링크 미리보기 ⑭검색 ⑮내 페이지 ⑯관리자 대시보드

> 📌 **신규 기능을 제안할 때는 가이드 섹션(⑰…)도 함께 제안해야 한다.** 가이드 말미에 "이 가이드는 기능이 추가·변경될 때마다 함께 업데이트됩니다."라고 명시되어 있음.

### 6.9 관리자 `/admin/*`

- 게이트: "관리자 인증 / 장학사님 및 관리자 전용 화면입니다." + 영문 비밀번호
- 메뉴: 카테고리 관리 · 캘린더 관리 · 평가 관리 · 홈 화면 구성 · 문제ZIP 선택지 · **사용자 프로필 🔒**(시스템 관리자 비밀번호 추가)
- 모든 관리자 작업은 **서버에서 비밀번호 재검증** (콘솔 우회 불가)

---

## 7. 게시판 데이터 모델 — 신규 게시판 제안의 핵심

`/admin/categories`에서 카테고리 하나를 만들 때의 필드:

| 필드 | 설명 |
|---|---|
| **탭 선택** | hackathon / resources / devground / helloworld 중 1개 |
| **카테고리 이름** | 예: `자유게시판` |
| **설명** | 카드에 회색 소문자로 표시. 없으면 "설명이 없습니다." |
| **짧은 주소(slug)** | 영문 소문자·숫자·하이픈. `/board/{slug}` · 비우면 자동 생성 |
| **상위 폴더** | 최상위 or 기존 폴더 선택 (다단계 가능) |
| **그룹(폴더)으로 만들기** | 체크 시 글을 못 쓰는 묶음 상자가 됨 |
| **입장 비밀번호** | 비우면 공개. 설정 시 카드에 🔒 + "비밀번호 입장" |
| **목록에서 숨기기** | 목록에서 사라지지 않고 **회색 비활성**으로 남음 (직접 링크는 접근 가능) |
| **사용할 게시판 종류** | ☑︎ 일반게시판 ☑︎ 산출물 ☑︎ 링크 ☑︎ 문제ZIP — **각각 이름 커스터마이즈 가능** |
| **GitHub 링크 필수** | 산출물 섹션 옵션 |
| 부가 기능 | 작성자 목록 엑셀(.xlsx) 다운로드 (작성자명·글 수·최초/최근 작성일) |

> ✅ **제안 시 유리한 점**: 새 게시판 대부분은 **코드 수정 없이 관리자 화면에서 만들 수 있다.** 따라서 제안서는 "이 게시판은 기존 4종 섹션 조합으로 즉시 개설 가능" vs "새 섹션 타입/신규 컴포넌트 개발 필요"를 명확히 구분해 쓰면 설득력이 크다.

### 7.1 문제ZIP 폼 (신규 폼형 게시판 설계 시 레퍼런스)

3단계 초경량 폼:
1. **Q1. 고통 영역** — 버튼 선택 (예: `💊보건/건강`, `행정/공문`, `수업/평가`, `학부모소통`, `학교행사`) + **직접 입력** 허용
2. **Q2. 발생 빈도** — 버튼 선택 (예: `숨 쉴 때마다 (매일)`, `주 1~2회`, `시즌 한정`)
3. **한 줄로 알려주세요** — 최대 100자 (제목으로 저장 → 검색 대상)

결과: 영역·빈도 칩이 달린 카드 목록 + 공감(하트) + 댓글 + 영역 필터 버튼(개수 표시) + 최신순/좋아요순.
선택지는 `/admin/problem-options`에서 이모지 포함해 편집.

> 이 패턴이 **"새로운 유형의 게시판"을 제안할 때 가장 좋은 템플릿**이다. (선택형 질문 2개 + 짧은 자유입력 1개 → 카드 + 필터 + 반응)

### 7.2 평가(루브릭) 시스템

- `/admin/criteria`: 산출물 게시판이 활성화된 카테고리에서만 설정
- 기준 추가(예: `창의성`) → **셔플 & 개시** → 평가자마다 산출물 순서 랜덤 → **평가 마감**
- 상태: `평가 잠김` → `평가 진행중` → `평가 마감`, `순서 다시 섞기` 가능
- 평가자 명단 제한 스위치 + **일괄 추가**(구글시트/엑셀 붙여넣기, 줄바꿈·쉼표·탭 인식, 중복 자동 제외)
- 별점 0.5점 단위, 닉네임 비밀번호로 중복/도용 방지, 재제출 시 갱신

---

## 8. 기존 기능 인벤토리 (중복 제안 방지용 체크리스트)

이미 있는 것 — **다시 제안하면 안 되는 항목**:

- [x] 닉네임 + 닉네임 비밀번호 (회원가입 없음), 복구 질문, 눈 버튼
- [x] **레벨(LV)**: 글 5점 / 댓글 1점, `round(점수×99÷1000)`, 최대 LV 99, 닉네임 옆 표시
- [x] **배지**: 관리자 수여, 내 페이지 전체 표시 / 목록에선 대표 1개 + `+N` 팝오버
- [x] 상단 고정(공지) 체크박스 — 일반 사용자도 가능
- [x] **연재(이어쓰기)** 시리즈, 이전 편/다음 편
- [x] 이전글/다음글 (스와이프 · 방향키)
- [x] **읽지 않은 글 표시** (탭 뱃지 / 카드 뱃지 / 목록 분홍 점, 닉네임 기준 기기 간 연동)
- [x] 조회수 (새로고침마다 증가, 중복 제거 없음)
- [x] 좋아요, 댓글, 대댓글, 댓글 이미지 첨부
- [x] 게시판 내 검색(URL 유지) + 전역 검색(제목/제목+내용/작성자) + 가이드 문서 내 검색
- [x] 본문 링크 자동 미리보기 (YouTube/Vimeo/Canva/Drive/OG/GitHub README)
- [x] 이미지 라이트박스 (전체화면·다운로드·핀치줌·더블탭·가로회전)
- [x] 파일 첨부 (HWP/PDF/ZIP/오피스, 3MB, 확장자별 아이콘) · 본문 이미지 자동 압축(2MB)
- [x] 리치 에디터 (제목/굵게/기울임/밑줄/색상/크기 4단계/인용/목록/링크/이미지)
- [x] 산출물 별점 루브릭 평가 + 평가자 명단 + 셔플
- [x] 문제ZIP 3단계 제보 폼 + 영역·빈도 필터 + 공감
- [x] 해커톤 포스트잇 후기 담벼락 (PC 양옆 / 모바일 하단 띠)
- [x] 캘린더 (월간/목록, 카카오맵 장소, 공휴일, 파일·링크 첨부)
- [x] 홈 배너 캐러셀 (관리자 업로드, 문구·링크)
- [x] 저작권 안내 팝업 ("다시 보지 않기")
- [x] 관리자: 카테고리 폴더 관리·숨김, 작성자 엑셀 다운로드, 글 이동, 프로필/배지 관리
- [x] 공유 (링크 복사, OG 태그로 카톡 미리보기)

### 8.1 명백히 **비어 있는 자리** (제안 기회)

디자인/기능 조사 결과 다음이 부재하거나 미완성이다 — 제안 소재로 강함:

1. **푸터 없음** — 운영 주체, 문의처, 개인정보/이용약관, 관련 사이트 링크가 어디에도 없음
2. **다크모드 토글 없음** (토큰은 이미 존재, 단 다크 팔레트가 브랜드와 불일치)
3. **알림(Notification) 없음** — 내 글에 댓글/좋아요가 달려도 알 방법이 없음. 읽음 표시 인프라(닉네임 기준 서버 저장)가 이미 있어 확장 용이
4. **명예의 전당 비활성** — 수상작 아카이브가 준비만 되고 꺼져 있음
5. **태그/해시태그 없음** — 분류는 카테고리(폴더)뿐. 횡단 탐색 불가
6. **북마크/스크랩 없음** — 좋아요는 있으나 "나중에 보기"가 없음
7. **랭킹/리더보드 없음** — 레벨·배지 데이터는 있으나 집계 화면이 없음
8. **작성자 프로필 공개 페이지 없음** — 닉네임 클릭 시 그 사람 글 모아보기 불가
9. **홈이 비어 있음** — 배너 + 이벤트 2개 섹션뿐. 최신글/인기글/추천 위젯 없음
10. **모바일 하단 탭바 없음** — 모든 이동이 우상단 햄버거를 거침
11. **댓글에만 반응 이모지 없음** / 멘션 없음
12. **`sm`(640px) 한 곳에서만 반응형 분기** — 태블릿 구간 최적화 여지

---

## 9. 콘텐츠 & 카피 톤 가이드

신규 화면 문구를 쓸 때 반드시 지킬 것:

| 규칙 | 예시 |
|---|---|
| **부드러운 해요체 + `~어요/~에요` 종결** | "아직 등록된 글이 없어요." / "후기를 남겼어요. 고마워요!" |
| 명령형 대신 권유형 | "첫 댓글을 남겨보세요!" / "확인해 보세요." |
| 파괴적 동작은 되돌릴 수 없음 명시 | "이 후기를 삭제할까요? 되돌릴 수 없어요." |
| 이모지는 상태 강조에만 절제 사용 | `✅ 이미 평가하셨어요` `🔒 아직 평가가 시작되지 않았어요.` `🎉 …마쳤어요.` `🔒 사용자 프로필` |
| 영문 고유명사는 원문 유지 | `Dev Ground`, `Hello, World`, `SEN DEV CONNECT`, `Lv.N` |
| 성공 토스트는 완료형 | "일정을 추가했어요." / "게시글 링크가 복사되었어요!" |
| 에러는 원인+해결 | "관리자 비밀번호를 입력해야 다른 게시판으로 이동할 수 있어요." |

> ⚠️ 기존 코드에 `카테고리이`, `카테고리을` 같은 **조사 오류가 다수 존재**한다(문자열 템플릿에 조사 하드코딩). 신규 제안 문구는 조사를 올바르게 쓰거나 조사가 필요 없는 형태로 작성할 것.

---

## 10. 접근성 & 반응형 규칙

- 아이콘 전용 버튼은 **항상 `aria-label`** (`검색`, `내 페이지`, `관리자`, `메뉴 열기`, `이전 달`, `후기 작성`, `비밀번호 보기` …)
- 장식 요소 `aria-hidden="true"` (포스트잇 마퀴 복제본 등)
- 포커스: `focus:ring-2 focus:ring-ring` (인풋) / `focus-visible:ring-1 focus-visible:ring-ring` (버튼)
- `prefers-reduced-motion: reduce` 대응 필수
- 라이트박스에 스크린리더 안내문 제공 ("전체화면으로 확대된 이미지입니다. 닫으려면 ESC를…")
- 긴 텍스트: `truncate`(1줄) / `line-clamp-2`(2줄) / `break-words`, `[overflow-wrap:anywhere]`
- 모바일 우선 순서: `hidden sm:flex`(데스크톱 전용) / `sm:hidden`(모바일 전용) / `xl:block`(포스트잇 담벼락)
- 숫자 정렬 시 `tabular-nums`

---

## 11. 신규 제안 샘플 제작 체크리스트

새 게시판/기능 목업을 만들 때 아래를 그대로 따르면 기존 사이트와 이질감이 없다.

**필수 셸**
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css">
<style>
  :root{
    --radius:1rem;
    --background:#f8fafc; --foreground:#0f1926;
    --card:#fff; --card-foreground:#0f1926;
    --primary:#11b981; --primary-foreground:#f6fefa;
    --secondary:#e7f7ee; --secondary-foreground:#005336;
    --muted:#f1f5f9; --muted-foreground:#687485;
    --accent:#d8f7e6; --accent-foreground:#005336;
    --destructive:#e40014; --border:#dfe5eb; --input:#dfe5eb; --ring:#11b981;
    --postit-foreground:#2a4243;
    --postit-yellow:#f6efd5; --postit-pink:#fedade; --postit-green:#cbf3de;
    --postit-blue:#cceffb;   --postit-purple:#e4e1fb; --postit-orange:#ffe2cb;
  }
  body{font-family:"Pretendard Variable",Pretendard,-apple-system,system-ui,sans-serif;
       background:var(--background); color:var(--foreground);}
</style>
```

**레이아웃 골격**
1. `min-h-screen bg-background`
2. `header.sticky.top-0.z-20.bg-card/90.shadow-sm.backdrop-blur` + `px-6 py-4 sm:px-28`
3. `main.mx-auto.px-6.sm:px-12.max-w-5xl.py-8`
4. 푸터 없음

**페이지 내부 순서**
1. (하위 페이지면) `← 카테고리 목록` 뒤로가기 링크
2. `h1.text-2xl.font-bold` + `p.mt-1.text-sm.text-muted-foreground` 설명
3. 우측 상단에 주요 액션 버튼 (`shrink-0`)
4. `space-y-6`으로 섹션 나열
5. 카드는 `rounded-2xl bg-card p-6 shadow-sm`, 그리드는 `grid gap-4 sm:grid-cols-2`

**반드시 지킬 것**
- [ ] 액센트 색은 **`--primary` 민트 하나만** — 새 브랜드 컬러 도입 금지
- [ ] 아이콘은 **lucide** 계열, 크기 `h-4 w-4`(인라인) / `h-5 w-5`(헤더) / `h-8 w-8`(빈 상태)
- [ ] hover는 `-translate-y-0.5 ~ -1` + `shadow-md`, click은 `active:scale-95`
- [ ] 라운드는 `rounded-xl`(폼/버튼) / `rounded-2xl`(카드) / `rounded-3xl`(히어로)
- [ ] 본문 기본 크기는 `text-sm`
- [ ] 빈 상태·에러·성공 문구는 해요체
- [ ] 새 애니메이션은 `prefers-reduced-motion` 대응
- [ ] 아이콘 버튼에 `aria-label`
- [ ] 기능 제안 시 **사용자 가이드 신규 섹션 초안**도 함께 제시
- [ ] 게시판 제안 시 **"관리자 화면만으로 개설 가능 / 개발 필요"** 구분 명시

---

## 부록 A. 커스텀 CSS 유틸리티 (Tailwind 밖)

```css
.postit-marquee-track      { animation: postit-marquee-up   var(--postit-marquee-duration,40s) linear infinite; }
.postit-marquee-track.is-reverse { animation-direction: reverse; }
.postit-marquee-track:hover{ animation-play-state: paused; }
.postit-marquee-row        { animation: postit-marquee-left var(--postit-marquee-duration,40s) linear infinite; }
.postit-marquee-row:hover  { animation-play-state: paused; }
.hero-deal-next { animation: .6s cubic-bezier(.22,1,.36,1) both hero-deal-next; }
.hero-deal-prev { animation: .6s cubic-bezier(.22,1,.36,1) both hero-deal-prev; }

@media (prefers-reduced-motion: reduce){
  .postit-marquee-track, .postit-marquee-row,
  .hero-deal-next, .hero-deal-prev { animation: none; }
}

@keyframes postit-marquee-up   { 0%{transform:translateY(0)} to{transform:translateY(-50%)} }
@keyframes postit-marquee-left { 0%{transform:translateX(0)} to{transform:translateX(-50%)} }
@keyframes hero-deal-next {
  0%  {opacity:0; transform:translateX(34px)  translateY(-40px) scale(.82) rotate(4deg);}
  35% {opacity:1; transform:translateX(120px) translateY(-10px) scale(.9)  rotate(8deg);}
  to  {opacity:1; transform:translateX(0)     translateY(0)     scale(1)   rotate(0);}
}
@keyframes hero-deal-prev { /* 위의 X축 부호 반전 */ }
```

## 부록 B. 사용 중인 lucide 아이콘 목록

`code-xml`(로고) · `circle-question-mark` · `house` · `calendar` · `calendar-days` · `trophy` · `book-open` · `rocket` · `terminal` · `search` · `user-round` · `user` · `user-check` · `user-cog` · `users` · `settings` · `menu` · `x` · `folder` · `folder-open` · `folder-git-2` · `chevron-right/left/up/down` · `arrow-right/left` · `corner-down-right` · `lock` · `shield-check` · `key-round` · `key-square` · `star` · `award` · `sparkles` · `sticky-note` · `map-pin` · `layout-grid` · `list` · `link` · `github` · `play` · `paperclip` · `upload` · `pencil` · `trash-2` · `plus` · `check` · `eye` · `eye-off` · `inbox` · `package-open` · `message-circle` · `message-circle-question-mark` · `sliders-horizontal` · `table` · `underline` · `rotate-ccw`

## 부록 C. 메타/SEO 패턴

```html
<title>{페이지명} — SEN DEV CONNECT</title>   <!-- 홈만 "홈 — 교사 개발자 플랫폼" -->
<meta name="description" content="…">
<meta property="og:title" content="…">
<meta property="og:description" content="…">
<meta property="og:image" content="https://storage.googleapis.com/gpt-engineer-file-uploads/.../social-….webp">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="SEN _DEV_CONNECT">
<meta name="twitter:description" content="서울시교육청 교사 개발자 플랫폼">
```
> `og:title` 접미사가 `— SEN DEV CONNECT` / `— SEN.DEV`(내 페이지) / `— 교사 개발자 플랫폼`(홈)로 **혼재**한다. 정리 제안 소재.

---

## 부록 D. 조사 한계

- 홈의 배너·이벤트, 게시판 글 목록·댓글 등 **데이터는 클라이언트에서 서버 함수로 로드**되어 SSR HTML에는 빈 상태만 담긴다. 본 문서의 목록·카드 구조는 **번들 JS의 JSX 코드와 클래스 문자열을 직접 읽어** 복원한 것이다.
- 비밀번호 게시판(🔒) 내부와 관리자 화면 실제 렌더 결과는 인증이 필요해 확인하지 않았다(코드상 문자열·클래스는 확보).
- 조사 시점 홈 배너 0장 / 다가오는 이벤트 0건 — 실제 운영 중 데이터가 있을 수 있다.
