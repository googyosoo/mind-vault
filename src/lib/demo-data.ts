import type { VaultNode, VaultLink } from './vault-engine';

export interface DemoProjectDataset {
  name: string;
  description: string;
  nodes: VaultNode[];
  links: VaultLink[];
}

export const DEMO_PROJECT: DemoProjectDataset = {
  name: "MindVault Cloud Architecture (가상 예시 프로젝트)",
  description: "고성능 분산 지식 베이스와 AI 프로젝트 매니저의 마이크로 아키텍처 모델",
  nodes: [
    {
      id: "App.tsx",
      type: "file",
      content: `import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import VaultDashboard from './components/VaultDashboard';
import KnowledgeGraph from './components/KnowledgeGraph';
import ProjectHealth from './components/ProjectHealth';
import AIChatHub from './components/AIChatHub';

export const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  return (
    <Router>
      <div className="vault-layout">
        <Routes>
          <Route path="/" element={<VaultDashboard />} />
          <Route path="/graph" element={<KnowledgeGraph />} />
          <Route path="/health" element={<ProjectHealth />} />
          <Route path="/chat" element={<AIChatHub />} />
        </Routes>
      </div>
    </Router>
  );
};`,
      metadata: { size: 3420, language: "typescript", lines: 95 }
    },
    {
      id: "VaultDashboard.tsx",
      type: "file",
      content: `import React, { useEffect, useState } from 'react';
import { vault } from '../lib/vault-engine';
import { aiService } from '../lib/ai-service';

export const VaultDashboard = () => {
  const [stats, setStats] = useState({ nodes: 0, links: 0 });
  const [insight, setInsight] = useState('');

  useEffect(() => {
    const data = vault.getGraphData();
    setStats({ nodes: data.nodes.length, links: data.links.length });
    aiService.getInsight('Current Project', 'Nodes and links summary').then(setInsight);
  }, []);

  return <div className="dashboard-grid">{insight}</div>;
};`,
      metadata: { size: 4890, language: "typescript", lines: 140 }
    },
    {
      id: "KnowledgeGraph.tsx",
      type: "file",
      content: `import React, { useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { vault } from '../lib/vault-engine';

export const KnowledgeGraph = () => {
  const graphRef = useRef<any>(null);
  const data = vault.getGraphData();

  return (
    <div className="graph-container">
      <ForceGraph2D ref={graphRef} graphData={data} nodeAutoColorBy="group" />
    </div>
  );
};`,
      metadata: { size: 3950, language: "typescript", lines: 110 }
    },
    {
      id: "ProjectHealth.tsx",
      type: "file",
      content: `import React, { useState, useEffect } from 'react';
import { vault } from '../lib/vault-engine';
import { aiService } from '../lib/ai-service';

export const ProjectHealth = () => {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [report, setReport] = useState('');

  useEffect(() => {
    const m = vault.getComplexityMetrics();
    setMetrics(m);
    aiService.generateRefactoringReport(m).then(setReport);
  }, []);

  return <div className="health-metrics">{report}</div>;
};`,
      metadata: { size: 6200, language: "typescript", lines: 185 }
    },
    {
      id: "AIChatHub.tsx",
      type: "file",
      content: `import React, { useState } from 'react';
import { aiService } from '../lib/ai-service';
import { vault } from '../lib/vault-engine';

export const AIChatHub = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');

  const send = async () => {
    const res = await aiService.sendMessage(input);
    setMessages(prev => [...prev, { role: 'model', text: res }]);
  };
  return <div className="chat-hub">{messages.length}</div>;
};`,
      metadata: { size: 5400, language: "typescript", lines: 160 }
    },
    {
      id: "WikiExplorer.tsx",
      type: "file",
      content: `import React, { useState } from 'react';
import { aiService } from '../lib/ai-service';

export const WikiExplorer = () => {
  const [article, setArticle] = useState('Overview');
  return <div className="wiki-view">{article}</div>;
};`,
      metadata: { size: 4120, language: "typescript", lines: 120 }
    },
    {
      id: "vault-engine.ts",
      type: "file",
      content: `import MiniSearch from 'minisearch';

export class VaultEngine {
  private nodes: any[] = [];
  private links: any[] = [];
  private searchIndex: MiniSearch;

  constructor() {
    this.searchIndex = new MiniSearch({ fields: ['id', 'content'] });
  }

  getComplexityMetrics() {
    return this.nodes.map(n => ({
      id: n.id,
      degree: this.links.filter(l => l.source === n.id || l.target === n.id).length,
      score: 85
    }));
  }
}`,
      metadata: { size: 5900, language: "typescript", lines: 175 }
    },
    {
      id: "ai-service.ts",
      type: "file",
      content: `import { GoogleGenerativeAI } from "@google/generative-ai";

export class AIService {
  private model: any = null;
  async sendMessage(msg: string) {
    return "AI PM Response: " + msg;
  }
  async generateRefactoringReport(metrics: any[]) {
    return "Architecture report for " + metrics.length + " nodes";
  }
}`,
      metadata: { size: 7100, language: "typescript", lines: 210 }
    },
    {
      id: "auth-provider.ts",
      type: "file",
      content: `export interface UserSession {
  userId: string;
  role: 'admin' | 'developer' | 'viewer';
  tokenExpiry: number;
}

export class AuthProvider {
  private session: UserSession | null = null;
  login(token: string) {
    this.session = { userId: "user-01", role: "developer", tokenExpiry: Date.now() + 3600000 };
  }
  isAuthenticated(): boolean {
    return this.session !== null && this.session.tokenExpiry > Date.now();
  }
}`,
      metadata: { size: 2850, language: "typescript", lines: 80 }
    },
    {
      id: "event-bus.ts",
      type: "file",
      content: `type EventCallback = (data: any) => void;

export class EventBus {
  private listeners: Map<string, EventCallback[]> = new Map();

  on(event: string, cb: EventCallback) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(cb);
  }

  emit(event: string, payload: any) {
    const cbs = this.listeners.get(event) || [];
    cbs.forEach(cb => cb(payload));
  }
}`,
      metadata: { size: 2200, language: "typescript", lines: 65 }
    },
    {
      id: "analytics-tracker.ts",
      type: "file",
      content: `export class AnalyticsTracker {
  trackEvent(category: string, action: string, label?: string) {
    console.log('[Analytics]', category, action, label);
  }
  trackPerformance(metric: string, durationMs: number) {
    if (durationMs > 200) console.warn('[Perf Alert]', metric, durationMs);
  }
}`,
      metadata: { size: 1950, language: "typescript", lines: 50 }
    },
    {
      id: "storage-adapter.ts",
      type: "file",
      content: `export class LocalStorageAdapter {
  getItem<T>(key: string): T | null {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : null;
    } catch { return null; }
  }
  setItem<T>(key: string, val: T): void {
    localStorage.setItem(key, JSON.stringify(val));
  }
}`,
      metadata: { size: 1680, language: "typescript", lines: 45 }
    }
  ],
  links: [
    { source: "App.tsx", target: "VaultDashboard.tsx", type: "import" },
    { source: "App.tsx", target: "KnowledgeGraph.tsx", type: "import" },
    { source: "App.tsx", target: "ProjectHealth.tsx", type: "import" },
    { source: "App.tsx", target: "AIChatHub.tsx", type: "import" },
    { source: "App.tsx", target: "WikiExplorer.tsx", type: "import" },
    { source: "VaultDashboard.tsx", target: "vault-engine.ts", type: "call" },
    { source: "VaultDashboard.tsx", target: "ai-service.ts", type: "call" },
    { source: "KnowledgeGraph.tsx", target: "vault-engine.ts", type: "call" },
    { source: "ProjectHealth.tsx", target: "vault-engine.ts", type: "call" },
    { source: "ProjectHealth.tsx", target: "ai-service.ts", type: "call" },
    { source: "AIChatHub.tsx", target: "ai-service.ts", type: "call" },
    { source: "AIChatHub.tsx", target: "vault-engine.ts", type: "call" },
    { source: "WikiExplorer.tsx", target: "ai-service.ts", type: "call" },
    { source: "vault-engine.ts", target: "storage-adapter.ts", type: "import" },
    { source: "ai-service.ts", target: "storage-adapter.ts", type: "import" },
    { source: "App.tsx", target: "auth-provider.ts", type: "import" },
    { source: "App.tsx", target: "event-bus.ts", type: "import" },
    { source: "VaultDashboard.tsx", target: "analytics-tracker.ts", type: "call" },
    { source: "AIChatHub.tsx", target: "analytics-tracker.ts", type: "call" },
    { source: "event-bus.ts", target: "analytics-tracker.ts", type: "call" }
  ]
};
