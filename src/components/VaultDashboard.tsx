import React, { useState, useEffect } from 'react';
import { Search, Zap, Code, Shield, HardDrive, Sparkles, Loader2, RefreshCcw, Key, Layers, Terminal, Compass, CheckCircle2 } from 'lucide-react';
import { aiService } from '../lib/ai-service';
import { vault } from '../lib/vault-engine';

interface VaultDashboardProps {
  onOpenSettings?: () => void;
}

const VaultDashboard: React.FC<VaultDashboardProps> = ({ onOpenSettings }) => {
  const [insight, setInsight] = useState<string>('');
  const [isInsightLoading, setIsInsightLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [stats, setStats] = useState({ nodes: 0, links: 0 });
  const [hasApiKey, setHasApiKey] = useState(aiService.hasApiKey());
  const [mode, setMode] = useState(vault.getMode());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const reloadData = () => {
    const data = vault.getGraphData();
    setStats({ nodes: data.nodes.length, links: data.links.length });
    setHasApiKey(aiService.hasApiKey());
    setMode(vault.getMode());
  };

  useEffect(() => {
    reloadData();
    const unsubVault = vault.subscribe(reloadData);
    const unsubAi = aiService.subscribe(reloadData);

    const fetchInsight = async () => {
      setIsInsightLoading(true);
      const data = vault.getGraphData();
      const result = await aiService.getInsight(
        `MindVault (${vault.getMode()} mode)`,
        `This project contains ${data.nodes.length} nodes and ${data.links.length} relationships.`
      );
      setInsight(result);
      setIsInsightLoading(false);
    };

    fetchInsight();

    return () => {
      unsubVault();
      unsubAi();
    };
  }, []);

  const handleScan = async () => {
    setIsScanning(true);
    await new Promise((r) => setTimeout(r, 1200));
    await vault.ingest('.');
    reloadData();
    setIsScanning(false);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    const results = vault.search(q);
    setSearchResults(results.slice(0, 5));
  };

  return (
    <div className="h-full space-y-8 p-4 max-w-7xl mx-auto">
      {/* 3줄 안내 & 온보딩 소개 카드 */}
      <section className="glass-card p-6 md:p-8 relative overflow-hidden border border-white/10 shadow-2xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-gradient-to-br from-[#00fff2]/15 to-[#b026ff]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-[#00fff2] animate-pulse" />
              <span className="text-[#00fff2] font-semibold">MindVault</span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-300">
                {mode === 'demo' ? '가상 예시 데모 모드 실행 중' : '로컬 워크스페이스 모드'}
              </span>
            </div>

            <h1 className="font-heading text-2xl md:text-3xl font-black tracking-tight text-white">
              지능형 코드베이스 분석 및 AI 프로젝트 매니저
            </h1>

            {/* 핵심 3줄 안내 문구 */}
            <div className="space-y-2.5 pt-1 text-sm md:text-base leading-relaxed text-gray-300">
              <div className="flex items-start gap-2.5">
                <Compass className="text-[#00fff2] mt-1 shrink-0" size={18} />
                <p>
                  <strong className="text-white">1. 코드베이스 구조 탐색:</strong> 파일, 함수, 컴포넌트 간의 복잡한 의존 관계를 인터랙티브 2D 지식 그래프로 시각화합니다.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <Layers className="text-[#b026ff] mt-1 shrink-0" size={18} />
                <p>
                  <strong className="text-white">2. 아키텍처 건강 진단:</strong> 연결도와 코드 크기를 분석해 복잡도 메트릭을 자동 산출하고 구조적 병목 구간을 진단합니다.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <Sparkles className="text-[#00fff2] mt-1 shrink-0" size={18} />
                <p>
                  <strong className="text-white">3. 실시간 AI 코칭 & 리팩토링:</strong> AI PM이 심층 논리를 분석하여 Before/After 개선 코드와 실무 조언을 브라우저에서 바로 제공합니다.
                </p>
              </div>
            </div>
          </div>

          {/* 우측 키 상태 및 설정 버튼 */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <div className={`p-4 rounded-xl border ${hasApiKey ? 'bg-[#00fff2]/5 border-[#00fff2]/30' : 'bg-white/5 border-white/10'} text-xs space-y-1.5`}>
              <div className="flex items-center gap-1.5 font-bold">
                {hasApiKey ? (
                  <>
                    <CheckCircle2 size={14} className="text-[#00fff2]" />
                    <span className="text-[#00fff2]">Gemini API 키 연결됨</span>
                  </>
                ) : (
                  <>
                    <Key size={14} className="text-amber-400" />
                    <span className="text-amber-400">데모 모드 (무료 체험)</span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-[#9ca3af]">
                {hasApiKey
                  ? `${aiService.getModelName()} 실시간 연동 중`
                  : '키 없이도 스마트 시뮬레이션으로 모든 기능을 바로 체험할 수 있습니다.'}
              </p>
            </div>

            <button
              onClick={onOpenSettings}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#00fff2] to-[#b026ff] text-white font-bold text-xs shadow-[0_0_15px_rgba(0,255,242,0.25)] hover:scale-105 active:scale-95 transition-all"
            >
              <Key size={14} />
              {hasApiKey ? 'API 키 / 모델 변경' : '본인 Gemini 키 등록하기'}
            </button>
          </div>
        </div>
      </section>

      {/* 탐색 검색바 & 스캔 섹션 */}
      <section className="relative flex flex-col items-center justify-center text-center pt-2">
        <div className="flex items-center gap-4 w-full max-w-3xl">
          <div className="flex-1 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#00fff2] to-[#b026ff] rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center bg-[#02040a] border border-white/10 rounded-2xl overflow-hidden px-6 h-14">
              <Search className="text-[#9ca3af] mr-4 shrink-0" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="코드베이스 검색 (함수, 컴포넌트, 키워드 입력)..."
                className="bg-transparent border-none outline-none text-base w-full text-white placeholder:text-[#4b5563]"
              />
            </div>

            {/* 실시간 검색 결과 드롭다운 */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#050814] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 p-2 text-left space-y-1">
                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-lg hover:bg-white/5 flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Code size={14} className="text-[#00fff2]" />
                      <span className="font-semibold text-white">{item.id}</span>
                      <span className="text-[10px] text-gray-400 bg-white/5 px-2 py-0.5 rounded">
                        {item.type || 'file'}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-500">일치 점수: {Math.round(item.score || 0)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleScan}
            disabled={isScanning}
            className="glass-card px-5 h-14 flex items-center gap-2 hover:border-[#00fff2] transition-all group disabled:opacity-50 shrink-0"
          >
            {isScanning ? (
              <Loader2 className="animate-spin text-[#00fff2]" size={18} />
            ) : (
              <RefreshCcw className="group-hover:rotate-180 transition-transform duration-500 text-[#00fff2]" size={18} />
            )}
            <span className="font-heading text-xs font-black tracking-wider text-white">SCAN WORKSPACE</span>
          </button>
        </div>
      </section>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="총 엔티티 (Nodes)" value={stats.nodes.toLocaleString()} icon={<Code size={20} />} trend="동기화됨" color="#00fff2" />
        <StatCard label="의존성 연결 (Links)" value={stats.links.toLocaleString()} icon={<Zap size={20} />} trend="활성" color="#b026ff" />
        <StatCard label="분석 모드" value={mode === 'demo' ? '가상 데모' : '로컬 파일'} icon={<HardDrive size={20} />} trend="정상" color="#ffffff" />
        <StatCard label="AI PM 엔진" value={hasApiKey ? 'Gemini Live' : '스마트 데모'} icon={<Shield size={20} />} trend="준비 완료" color="#34d399" />
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="glass-card p-6 md:p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
              <span className="w-1.5 h-6 bg-[#00fff2] rounded-full"></span>
              인덱싱 노드 미리보기
            </h3>
            <div className="space-y-3">
              {vault.getGraphData().nodes.slice(0, 4).map((node: any, idx: number) => (
                <div
                  key={node.id}
                  className="group flex items-center justify-between p-4 rounded-xl border border-white/5 hover:bg-white/5 transition-all"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-[#b026ff]/10 flex items-center justify-center text-[#b026ff] shrink-0">
                      <Code size={20} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-white truncate text-sm">{node.id}</h4>
                      <p className="text-xs text-[#9ca3af]">
                        유형: {node.type || 'file'} · 크기: {((node.metadata?.size || 2048) / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-mono text-[#00fff2] bg-[#00fff2]/10 px-2 py-1 rounded">
                      노드 #{idx + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Info & AI Insight */}
        <div className="space-y-6">
          <section className="glass-card p-6 border border-[#00fff2]/20 relative overflow-hidden">
            <div className="flex items-center gap-2 text-[#00fff2] font-bold text-xs uppercase tracking-wider mb-4">
              <Sparkles size={16} />
              AI PM 실시간 아키텍처 인사이트
            </div>
            {isInsightLoading ? (
              <div className="flex items-center gap-3 py-6 text-sm text-[#9ca3af]">
                <Loader2 className="animate-spin text-[#00fff2]" size={18} />
                <span>AI가 코드베이스 인사이트를 도출하고 있습니다...</span>
              </div>
            ) : (
              <p className="text-sm text-gray-300 leading-relaxed italic">
                "{insight || '지식 베이스의 모든 모듈이 유기적으로 동기화되었습니다.'}"
              </p>
            )}
          </section>

          <section className="glass-card p-6 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal size={16} className="text-[#b026ff]" />
              빠른 시작 가이드
            </h4>
            <ul className="text-xs text-gray-400 space-y-2 leading-relaxed">
              <li>• 좌측 <strong>Knowledge Graph</strong>에서 코드 간 연결망을 시각적으로 탐색하세요.</li>
              <li>• <strong>Project Health</strong>에서 복잡도 높은 파일을 클릭해 AI 리팩토링 처방을 받으세요.</li>
              <li>• <strong>AI PM Chat</strong>에서 프로젝트 전체 맥락을 기반으로 질문하고 조언을 구하세요.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, trend, color }: any) => (
  <div className="glass-card p-6 flex flex-col justify-between border border-white/5 hover:border-white/10 transition-all">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 rounded-xl bg-white/5" style={{ color }}>
        {icon}
      </div>
      <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-white/5 text-[#9ca3af]">
        {trend}
      </span>
    </div>
    <div>
      <p className="text-xs text-[#9ca3af] mb-1 font-medium">{label}</p>
      <h3 className="font-heading text-2xl font-black tracking-tight text-white">{value}</h3>
    </div>
  </div>
);

export default VaultDashboard;
