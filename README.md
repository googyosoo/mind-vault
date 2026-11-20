# MindVault

지능형 코드베이스 분석 및 AI 프로젝트 매니저 웹 애플리케이션입니다.

---

## 1. 프로젝트 소개

MindVault는 복잡한 소프트웨어 프로젝트의 소스 코드를 구조화하여 시각화하고, AI가 아키텍처 개선안을 실시간 제시하는 지능형 개발자 대시보드입니다.

- **코드베이스 구조 탐색**: 파일, 함수, 컴포넌트 간의 복잡한 의존 관계를 인터랙티브 2D 지식 그래프로 시각화합니다.
- **아키텍처 건강 진단**: 연결도와 코드 크기를 분석해 복잡도 메트릭을 자동 산출하고 구조적 병목 구간을 진단합니다.
- **실시간 AI 코칭 및 리팩토링**: AI 프로젝트 매니저가 심층 논리를 분석하여 Before/After 개선 코드와 실무 조언을 브라우저에서 바로 제공합니다.

---

## 2. 주요 기능

### 2.1 대시보드 (Dashboard)
- 전체 엔티티(Nodes) 수와 의존성 연결(Links) 현황을 한눈에 파악합니다.
- MiniSearch 기반 초고속 전문 검색으로 함수, 클래스, 컴포넌트를 즉시 검색합니다.
- AI PM이 도출한 실시간 아키텍처 인사이트를 제공합니다.

### 2.2 지식 그래프 (Knowledge Graph)
- `react-force-graph-2d` 기반의 물리 시뮬레이션 지식 토폴로지 지도입니다.
- React 컴포넌트, 코어 로직 엔진, 외부 라이브러리를 색상별로 구분해 표현합니다.
- 줌 인, 줌 아웃, 화면 맞춤 컨트롤을 지원합니다.

### 2.3 프로젝트 건강 진단 (Project Health)
- 연결 수(Degree)와 코드 용량을 결합해 노드별 복잡도 점수(Score)를 산출합니다.
- 복잡도가 높은 상위 모듈을 클릭하면 우측 슬라이드오버 패널에서 AI의 심층 결함 분석과 Before/After 리팩토링 코드를 확인합니다.

### 2.4 AI 프로젝트 매니저 채팅 (AI PM Chat)
- 프로젝트 전체 맥락(Global) 또는 특정 모듈 맥락(Local)을 기반으로 대화합니다.
- 아키텍처 병목 지점, 결합도 완화 방안, 리팩토링 우선순위를 실시간 질문하고 답변을 받습니다.

### 2.5 위키 브라우저 (Wiki Explorer)
- 인덱싱된 핵심 모듈의 아키텍처 명세서와 의존성 정보를 열람합니다.
- AI 3줄 요약 생성 버튼으로 모듈 목적을 즉시 확인합니다.

---

## 3. 브라우저 직접 호출 AI 아키텍처 (No Backend Server)

별도의 백엔드 프록시 서버 없이 사용자의 웹 브라우저에서 Google Gemini API를 직접 호출합니다.

- **API 키 안전 보관**: 사용자가 화면에서 입력한 Gemini API 키는 외부 서버로 전송되지 않고 브라우저의 `localStorage`(`mindvault_gemini_api_key`)에만 안전하게 저장됩니다.
- **무료 키 발급**: [Google AI Studio](https://aistudio.google.com/app/apikey)에서 무료로 발급받은 키를 바로 등록해 사용할 수 있습니다.
- **지원 모델**: `gemini-2.5-flash` (기본 권장), `gemini-2.0-flash`, `gemini-1.5-flash`, `gemini-1.5-pro` 선택을 지원합니다.

---

## 4. 가상 예시 프로젝트 데모 모드 (Instant Demo)

API 키나 로컬 소스 코드 폴더가 없어도 모든 기능을 즉시 체험할 수 있습니다.

- **사전 구축된 가상 데이터**: 12개 핵심 마이크로서비스 모듈과 20개 의존성 링크가 기본 탑재되어 있습니다.
- **스마트 시뮬레이션 응답**: API 키가 없는 상태에서도 AI PM 채팅, 복잡도 리포트, Before/After 리팩토링 제안이 실감나는 모의 데이터로 원활히 동작합니다.
- 언제든 상단 'API 키 설정' 모달에서 본인의 Gemini 키를 입력하면 실제 Google Gemini AI의 실시간 분석으로 즉각 전환됩니다.

---

## 5. 로컬 개발 환경 실행

```bash
# 1. 의존성 설치
npm install

# 2. 로컬 개발 서버 실행
npm run dev

# 3. 브라우저 접속 (보통 http://localhost:5173)
```

---

## 6. GitHub Pages 정적 배포 준비

이 프로젝트는 GitHub Pages 정적 호스팅에 최적화되어 있습니다.

```bash
# GitHub Pages 용 정적 빌드 실행 (base: '/mind-vault/')
npm run build
```

빌드가 완료되면 루트의 `dist/` 폴더에 배포용 정적 파일들이 생성됩니다.
- 결과 폴더: `mind-vault/dist`
- 라우팅: GitHub Pages 환경의 새로고침 404 문제를 방지하기 위해 `HashRouter`를 채택했습니다.

---

## 7. 기술 스택

- **Frontend**: React 19, TypeScript, Vite 8
- **Styling**: Tailwind CSS, Glassmorphism UI Token System
- **Animation**: Framer Motion
- **Visualization**: react-force-graph-2d
- **Search Engine**: MiniSearch (클라이언트 인메모리 인덱서)
- **AI Integration**: @google/generative-ai (Gemini 2.5 Flash / 2.0 Flash / 1.5 Flash)
- **Icons**: Lucide React
