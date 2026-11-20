import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, FileText, Hash, Link as LinkIcon, Search, Sparkles, Loader2, Code2, Cpu } from 'lucide-react';
import { aiService } from '../lib/ai-service';

const WikiExplorer: React.FC = () => {
  const [selectedArticle, setSelectedArticle] = useState<string>('Overview');
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAISummarize = async () => {
    setIsLoading(true);
    const mockContent = `모듈명: ${selectedArticle}. MindVault 시스템의 핵심 도메인 로직을 담당하며 지식 토폴로지와 AI 프로젝트 관리 기능을 지원합니다.`;
    const result = await aiService.summarizeContent(selectedArticle, mockContent);
    setSummary(result);
    setIsLoading(false);
  };

  const articles = [
    { title: 'Overview', icon: <Book size={18} />, category: 'Core' },
    { title: 'Authentication Logic', icon: <FileText size={18} />, category: 'Logic' },
    { title: 'Design System', icon: <Hash size={18} />, category: 'Styles' },
    { title: 'Graph Engine', icon: <LinkIcon size={18} />, category: 'Components' },
    { title: 'AI Orchestrator', icon: <Cpu size={18} />, category: 'AI' },
  ];

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 max-w-7xl mx-auto">
      {/* Article List */}
      <aside className="w-full md:w-80 flex flex-col gap-4 shrink-0">
        <div className="glass-card p-4 relative group border border-white/10">
          <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-[#9ca3af]" size={16} />
          <input
            type="text"
            placeholder="위키 문서 검색..."
            className="w-full bg-white/5 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-[#00fff2] border border-transparent transition-all text-xs text-white placeholder:text-gray-500"
          />
        </div>

        <nav className="glass-card flex-1 p-4 space-y-2 overflow-y-auto border border-white/10">
          <p className="text-[10px] uppercase font-bold tracking-widest text-[#9ca3af] mb-3 ml-2">Knowledge Base</p>
          {articles.map((art) => (
            <button
              key={art.title}
              onClick={() => {
                setSelectedArticle(art.title);
                setSummary('');
              }}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all group ${
                selectedArticle === art.title
                  ? 'bg-[#00fff2]/10 text-[#00fff2] border border-[#00fff2]/30 font-bold'
                  : 'hover:bg-white/5 text-[#9ca3af]'
              }`}
            >
              <div className="flex items-center gap-3">
                {art.icon}
                <span className="text-xs font-semibold">{art.title}</span>
              </div>
              <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-[#9ca3af]">
                {art.category}
              </span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Article Viewer */}
      <main className="flex-1 glass-card p-6 md:p-10 overflow-y-auto relative border border-white/10">
        <article className="max-w-3xl space-y-6">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#00fff2] bg-[#00fff2]/10 px-3 py-1 rounded-full border border-[#00fff2]/20">
                MindVault Architecture Wiki
              </span>
              <h2 className="text-3xl md:text-4xl font-heading font-black mt-3 tracking-tight text-white">
                {selectedArticle}
              </h2>
            </div>

            <button
              onClick={handleAISummarize}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#00fff2] to-[#b026ff] rounded-xl font-bold text-xs text-white shadow-[0_0_15px_rgba(0,255,242,0.3)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" size={15} /> : <Sparkles size={15} />}
              AI 3줄 요약 생성
            </button>
          </header>

          <AnimatePresence>
            {summary && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="p-5 rounded-2xl bg-[#00fff2]/5 border border-[#00fff2]/20 text-[#00fff2] text-xs leading-relaxed"
              >
                <div className="flex items-start gap-3">
                  <Sparkles size={16} className="mt-0.5 shrink-0" />
                  <p className="whitespace-pre-wrap">{summary}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-6 text-xs md:text-sm text-gray-300 leading-relaxed">
            <p>
              이 문서는 <strong className="text-white">{selectedArticle}</strong> 모듈의 기술 스펙 및 아키텍처 토폴로지 개요입니다. MindVault 엔진이 정적 분석을 통해 구조적 관계를 색인하여 자동 생성했습니다.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00fff2]" />
                  핵심 개념
                </h4>
                <p className="text-xs text-[#9ca3af]">
                  모듈 간 높은 응집도와 낮은 결합도를 유지하며, 커뮤니티 탐지 알고리즘으로 지식 클러스터를 형성합니다.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#b026ff]" />
                  핵심 의존성
                </h4>
                <ul className="text-xs text-[#9ca3af] space-y-1">
                  <li>• [[VaultEngine]] - 인덱싱 및 그래프 토폴로지</li>
                  <li>• [[AIService]] - Gemini 기반 지능형 리팩토링</li>
                </ul>
              </div>
            </div>

            <section className="pt-4 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Code2 size={16} className="text-[#00fff2]" />
                사용 예시 코드
              </h3>
              <div className="bg-[#02040a] rounded-xl p-4 font-mono text-xs border border-white/5 text-gray-300 overflow-x-auto">
                <span className="text-[#b026ff]">import</span> &#123; vault &#125; <span className="text-[#b026ff]">from</span> <span className="text-[#eab308]">'@/lib/vault-engine'</span>;<br />
                <span className="text-[#b026ff]">const</span> metrics = vault.<span className="text-[#00fff2]">getComplexityMetrics</span>();<br />
                console.<span className="text-[#00fff2]">log</span>(<span className="text-[#eab308]">'MindVault Topology'</span>, metrics);
              </div>
            </section>
          </div>
        </article>
      </main>
    </div>
  );
};

export default WikiExplorer;
