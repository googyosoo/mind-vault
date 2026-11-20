import { GoogleGenerativeAI } from "@google/generative-ai";

const STORAGE_KEY = "mindvault_gemini_api_key";
const STORAGE_MODEL_KEY = "mindvault_gemini_model";
export const DEFAULT_MODEL = "gemini-2.5-flash";

export interface ModelOption {
  id: string;
  name: string;
  description: string;
}

export const AVAILABLE_MODELS: ModelOption[] = [
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", description: "최신 권장 모델 (빠른 추론 속도와 최적의 성능)" },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", description: "차세대 범용 멀티모달 모델" },
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", description: "경량 안정화 모델" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", description: "복합 코드 심층 분석용 대용량 모델" },
];

export class AIService {
  private apiKey: string = "";
  private currentModelName: string = DEFAULT_MODEL;
  private model: any = null;
  private chatSession: any = null;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window !== "undefined") {
      const storedKey = localStorage.getItem(STORAGE_KEY);
      const storedModel = localStorage.getItem(STORAGE_MODEL_KEY);
      // 브라우저 직접 호출: 사용자가 화면에서 등록한 키만 사용 (미등록 시 데모 모드로 동작)
      this.apiKey = storedKey || "";
      this.currentModelName = storedModel || DEFAULT_MODEL;
    } else {
      this.apiKey = "";
      this.currentModelName = DEFAULT_MODEL;
    }
    this.initModel();
  }

  private initModel() {
    if (!this.apiKey) {
      this.model = null;
      this.chatSession = null;
      return;
    }
    try {
      const genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = genAI.getGenerativeModel({
        model: this.currentModelName,
        systemInstruction:
          "You are the MindVault Project Manager. Your goal is to guide the user through their codebase, ensure high-level architecture standards, and provide actionable project management insights. You have access to the codebase context provided by the vault.",
      });
      this.chatSession = null;
    } catch (error) {
      console.error("[MindVault] Gemini 모델 초기화 실패:", error);
      this.model = null;
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  public getApiKey(): string {
    return this.apiKey;
  }

  public setApiKey(key: string) {
    this.apiKey = key.trim();
    if (typeof window !== "undefined") {
      if (this.apiKey) {
        localStorage.setItem(STORAGE_KEY, this.apiKey);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    this.initModel();
    this.notify();
  }

  public clearApiKey() {
    this.setApiKey("");
  }

  public hasApiKey(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 5);
  }

  public getModelName(): string {
    return this.currentModelName;
  }

  public setModelName(modelName: string) {
    this.currentModelName = modelName;
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_MODEL_KEY, modelName);
    }
    this.initModel();
    this.notify();
  }

  /**
   * Initializes or resets the chat session with specific context.
   */
  async startChatSession(context: string) {
    if (!this.hasApiKey() || !this.model) {
      return "데모 모드 채팅 세션이 시작되었습니다.";
    }
    try {
      this.chatSession = this.model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: `Here is the current codebase context: ${context}` }],
          },
          {
            role: "model",
            parts: [
              {
                text: "Understood. I have analyzed the codebase context. I am ready to act as your MindVault Project Manager. How can I help you today?",
              },
            ],
          },
        ],
      });
      return "세션이 시작되었습니다.";
    } catch (err: any) {
      console.error("[MindVault] 채팅 세션 시작 에러:", err);
      return `세션 시작 실패: ${err?.message || "알 수 없는 오류"}`;
    }
  }

  /**
   * Sends a message to the active chat session.
   */
  async sendMessage(message: string): Promise<string> {
    if (!this.hasApiKey() || !this.model) {
      // Mock PM response for demo mode
      await new Promise((r) => setTimeout(r, 800));
      return `[데모 모드 응답] MindVault AI 프로젝트 매니저의 분석입니다:\n\n"${message}" 질문과 관련해 분석한 결과, 현재 코드베이스는 계층 분리가 양호하나 컴포넌트 간 단방향 데이터 흐름을 한층 더 엄격히 준수할 필요가 있습니다.\n\n주요 권장 사항:\n1. 상태 관리 로직을 순수 훅으로 추출하여 렌더링 비용 절감\n2. 주요 의존성 그래프의 상위 노드부터 단위 테스트 구축\n3. 공통 유틸리티의 타입 추론 강화\n\n(참고: 본인의 무료 Gemini API 키를 상단 'API 키 설정'에 등록하시면 실제 Google Gemini ${this.currentModelName} 모델과 실시간 대화할 수 있습니다.)`;
    }

    if (!this.chatSession) {
      await this.startChatSession("No specific context provided.");
    }

    try {
      const result = await this.chatSession.sendMessage(message);
      return result.response.text();
    } catch (error: any) {
      console.warn("Chat Warning:", error?.message);
      return `⚠️ AI 응답 생성에 실패했습니다: ${error?.message ?? "알 수 없는 오류"}. API 키와 선택한 모델(${this.currentModelName})의 유효성을 확인해 주세요.`;
    }
  }

  /**
   * Generates a strategic refactoring report based on codebase metrics.
   */
  async generateRefactoringReport(metrics: any[]): Promise<string> {
    const topComplex = metrics
      .slice(0, 5)
      .map((m) => `- ${m.id} (Score: ${m.score}, Links: ${m.degree})`)
      .join("\n");

    if (!this.hasApiKey() || !this.model) {
      await new Promise((r) => setTimeout(r, 900));
      return `### 📊 [데모 모드] MindVault 아키텍처 종합 진단 리포트\n\n현재 프로젝트의 복잡도 메트릭 상위 노드:\n${topComplex}\n\n#### 1. 핵심 병목 지점 진단\n- 결합도가 높은 코어 모듈이 여러 화면 컴포넌트와 직접 연결되어 변경 전파 위험이 존재합니다.\n- 대규모 단일 파일에 비즈니스 로직과 UI 상태가 함께 배치되어 인지 복잡도가 높습니다.\n\n#### 2. 추천 3단계 리팩토링 전략\n1. **도메인 계층 분리**: 데이터 수집 엔진과 UI 상태 레이어 사이에 어댑터 패턴 적용\n2. **타입 안전성 격리**: 미사용 export 및 과도한 전역 스키마 의존성 축소\n3. **가상화 리스트 도입**: 지식 노드 1,000개 이상 확장 시 DOM 렌더링 최적화\n\n*(실시간 Gemini 분석을 원하시면 API 키를 등록하세요.)*`;
    }

    const prompt = `
      As the MindVault Project Manager, analyze these complexity metrics and provide a 
      high-level Refactoring Strategy Report in Korean. 
      Identify the biggest "bottlenecks" and suggest 3 specific architectural improvements.
      Keep it professional, strategic, and concise.
      
      Top Complexity Nodes:
      ${topComplex}
    `;

    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error: any) {
      console.warn("Refactoring Report Warning:", error?.message);
      return `⚠️ 리팩토링 리포트 생성에 실패했습니다: ${error?.message ?? "알 수 없는 오류"}`;
    }
  }

  /**
   * Generates deep refactoring suggestions for a specific code block.
   */
  async getDeepRefactorSnippet(fileId: string, content: string): Promise<string> {
    if (!this.hasApiKey() || !this.model) {
      await new Promise((r) => setTimeout(r, 900));
      return `### [ANALYSIS]
대상 파일 "${fileId}"은(는) 의존성 결합도가 높고 데이터 조작과 상태 알림 로직이 한 곳에 집중되어 있습니다. 이로 인해 단일 책임 원칙(SRP)이 약화되고 단위 테스트 작성이 어려워질 수 있습니다.

### [REFACTORED CODE]
\`\`\`typescript
// 권장 리팩토링 예시 (${fileId})
import { useMemo, useCallback } from 'react';

// 1. 순수 비즈니스 로직 분리
export const transformVaultMetrics = (rawData: unknown[]) => {
  return rawData.map((item: any) => ({
    id: item.id,
    weight: Math.min(100, item.degree * 8 + (item.size || 0) / 120),
  }));
};

// 2. 가상화 및 메모이제이션 커스텀 훅
export const useVaultOptimization = (data: unknown[]) => {
  const optimizedMetrics = useMemo(() => transformVaultMetrics(data), [data]);
  const handleInspect = useCallback((id: string) => {
    console.log('[MindVault] Deep inspection node:', id);
  }, []);
  return { optimizedMetrics, handleInspect };
};
\`\`\`

### [BENEFITS]
1. 렌더링 주기마다 반복되는 복잡도 계산을 메모이제이션하여 UI 프레임 드롭 방지
2. 비즈니스 로직을 프레임워크와 독립된 순수 함수로 분리하여 단위 테스트 용이성 확보
3. 향후 새로운 메트릭 지표 추가 시 기존 컴포넌트 수정 없이 유연하게 확장 가능`;
    }

    const prompt = `
      As the MindVault Project Manager, perform a deep logic analysis for the file "${fileId}".
      Identify architectural flaws, redundancy, or complexity issues.
      Then, provide a specialized refactoring suggestion in the following format (write in Korean):
      
      ### [ANALYSIS]
      (Briefly explain what's wrong)
      
      ### [REFACTORED CODE]
      (Provide the improved code block)
      
      ### [BENEFITS]
      (List the key advantages of this refactoring)
      
      Code Content:
      ${content.slice(0, 3000)}
    `;

    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error: any) {
      console.warn("Deep Refactor Warning:", error?.message);
      return `⚠️ 코드 분석에 실패했습니다: ${error?.message ?? "알 수 없는 오류"}`;
    }
  }

  /**
   * Summarizes code or content for a wiki entry.
   */
  async summarizeContent(title: string, content: string): Promise<string> {
    if (!this.hasApiKey() || !this.model) {
      await new Promise((r) => setTimeout(r, 600));
      return `[데모 모드 요약] ${title} 모듈은 MindVault의 핵심 기능 흐름을 제어하며, 데이터 정규화 및 UI 간 유기적 결합을 보장하는 핵심 아키텍처 허브입니다.`;
    }

    const prompt = `
      You are an AI Librarian for a high-end coding vault called MindVault.
      Given the following code or documentation for "${title}", provide a concise, 
      professional, and technical summary in Korean (max 3 sentences) for a wiki entry.
      Focus on the PURPOSE and architectural significance.
      
      Content:
      ${content}
    `;

    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error: any) {
      console.warn("Gemini AI Warning:", error?.message);
      return `⚠️ 요약 생성에 실패했습니다: ${error?.message ?? "알 수 없는 오류"}`;
    }
  }

  /**
   * Generates a "Did you know?" insight for a file or node.
   */
  async getInsight(title: string, content: string): Promise<string> {
    if (!this.hasApiKey() || !this.model) {
      await new Promise((r) => setTimeout(r, 500));
      return `[데모 인사이트] 현재 프로젝트는 총 ${title}의 구조를 기반으로 최적화되어 있습니다. 지식 그래프의 연결 밀도가 증가할수록 AI PM의 리팩토링 제안 정확도가 향상됩니다.`;
    }

    const prompt = `
      Based on this code snippet "${title}", provide one interesting "Did you know?" 
      technical insight or a potential improvement suggestion in Korean.
      
      Code:
      ${content}
    `;

    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error: any) {
      console.warn("Insight Warning:", error?.message);
      return `⚠️ 인사이트 생성에 실패했습니다: ${error?.message ?? "알 수 없는 오류"}`;
    }
  }
}

export const aiService = new AIService();
