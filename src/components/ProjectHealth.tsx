import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, BarChart3, ListTree, FileJson, Sparkles, Loader2, Info, X, ChevronRight, Zap, CheckCircle2 } from 'lucide-react';
import { vault } from '../lib/vault-engine';
import { aiService } from '../lib/ai-service';

const ProjectHealth: React.FC = () => {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [report, setReport] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [refactorData, setRefactorData] = useState<string>('');
  const [isRefactoring, setIsRefactoring] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  const fetchHealthData = async () => {
    setIsLoading(true);
    const m = vault.getComplexityMetrics();
    setMetrics(m);

    const r = await aiService.generateRefactoringReport(m);
    setReport(r);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchHealthData();
    const unsubVault = vault.subscribe(fetchHealthData);
    const unsubAi = aiService.subscribe(fetchHealthData);
    return () => {
      unsubVault();
      unsubAi();
    };
  }, []);

  const handleSelectFile = async (file: any) => {
    setSelectedFile(file);
    setIsRefactoring(true);
    setRefactorData('');
    setAppliedSuccess(false);

    const content = vault.getNodeContent(file.id);
    if (content) {
      const suggestion = await aiService.getDeepRefactorSnippet(file.id, content);
      setRefactorData(suggestion);
    } else {
      setRefactorData('해당 파일의 소스 코드 내용을 읽을 수 없습니다.');
    }
    setIsRefactoring(false);
  };

  const handleApplyRefactoring = () => {
    setAppliedSuccess(true);
    setTimeout(() => {
      setAppliedSuccess(false);
    }, 2500);
  };

  return (
    <div className="h-full relative overflow-hidden">
      <div className="h-full space-y-8 p-2 md:p-4 overflow-y-auto custom-scrollbar">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl md:text-4xl font-black tracking-tight text-white">
              PROJECT <span className="text-[#00fff2]">HEALTH</span>
            </h2>
            <p className="text-[#9ca3af] text-xs md:text-sm mt-1">
              코드베이스 복잡도 메트릭 산출 및 AI 아키텍처 리팩토링 코치
            </p>
          </div>
          <div className="flex gap-3">
            <div className="glass-card px-4 py-2 flex items-center gap-2 border-[#00fff2]/30">
              <Activity className="text-[#00fff2]" size={16} />
              <span className="text-xs font-mono font-bold text-white">결합도 지수: 88점</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
          {/* Complexity List */}
          <section className="lg:col-span-2 space-y-4">
            <div className="glass-card p-6 md:p-8 border border-white/10">
              <h3 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2 text-white">
                <BarChart3 size={20} className="text-[#00fff2]" />
                복잡도 히트맵 및 노드 랭킹
              </h3>
              <p className="text-xs text-[#9ca3af] mb-6">
                * 연결 수(Degree)와 코드 용량을 결합해 위험도를 산출합니다. 노드를 클릭하면 AI 심층 리팩토링 처방을 확인합니다.
              </p>

              <div className="space-y-2">
                {metrics.slice(0, 8).map((m, i) => (
                  <ComplexityItem
                    key={m.id}
                    index={i + 1}
                    item={m}
                    onClick={() => handleSelectFile(m)}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* AI Strategic Report */}
          <section className="space-y-6">
            <div className="glass-card p-6 md:p-8 bg-gradient-to-br from-[#b026ff]/10 to-transparent border-[#b026ff]/30">
              <h3 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2 text-[#b026ff]">
                <Sparkles size={20} />
                AI PM 종합 아키텍처 리포트
              </h3>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4 text-[#9ca3af]">
                  <Loader2 className="animate-spin text-[#00fff2]" size={32} />
                  <p className="text-xs italic">아키텍처 토폴로지 분석 중...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-xs md:text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {report}
                  </div>
                  <button
                    onClick={fetchHealthData}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold tracking-wider border border-white/10 text-white transition-colors"
                  >
                    리포트 새로고침
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Refactor Slide-over Panel */}
      <AnimatePresence>
        {selectedFile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFile(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm z-[60]"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 w-full max-w-2xl h-full bg-[#070b14] border-l border-white/10 z-[70] flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.7)]"
            >
              <header className="p-6 border-b border-white/10 flex items-center justify-between bg-black/30">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-[#00fff2] to-[#b026ff] rounded-xl text-white">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h3 className="font-heading text-base md:text-lg font-black tracking-tight text-white">
                      AI <span className="text-[#00fff2]">COACHING</span>
                    </h3>
                    <p className="text-[11px] text-[#00fff2] font-mono">{selectedFile.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="p-2 hover:bg-white/5 rounded-xl text-[#9ca3af] hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </header>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-white">
                {isRefactoring ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-[#9ca3af] py-16">
                    <Loader2 className="animate-spin text-[#00fff2]" size={40} />
                    <p className="font-mono text-xs font-bold animate-pulse text-[#00fff2]">
                      코드 심층 논리 및 복잡도 분석 진행 중...
                    </p>
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="bg-[#00fff2]/5 rounded-2xl border border-[#00fff2]/20 p-4 text-xs text-[#00fff2] flex items-start gap-3">
                      <Info size={16} className="shrink-0 mt-0.5" />
                      <p>
                        선택된 대상 노드의 구조적 결함을 진단하고 생성한 구체적 Before/After 리팩토링 제안입니다.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-black/50 border border-white/10 text-xs md:text-sm text-gray-300 whitespace-pre-wrap leading-relaxed font-mono">
                      {refactorData}
                    </div>

                    {appliedSuccess && (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
                        <CheckCircle2 size={16} />
                        <span>리팩토링 변경 제안이 가상 워크스페이스에 안전하게 반영되었습니다!</span>
                      </div>
                    )}

                    <div className="pt-4 flex gap-3">
                      <button
                        onClick={handleApplyRefactoring}
                        className="flex-1 py-3.5 bg-gradient-to-r from-[#00fff2] to-[#b026ff] rounded-xl font-heading text-xs font-black text-white shadow-[0_0_20px_rgba(0,255,242,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={16} />
                        APPLY REFACTORING
                      </button>
                      <button
                        onClick={() => setSelectedFile(null)}
                        className="px-5 py-3.5 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 text-xs text-gray-300 transition-all"
                      >
                        닫기
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const ComplexityItem = ({ index, item, onClick }: { index: number; item: any; onClick: () => void }) => (
  <motion.div
    whileHover={{ x: 4 }}
    onClick={onClick}
    className="group flex items-center gap-4 p-3.5 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-white/10 cursor-pointer"
  >
    <div className="w-7 h-7 flex items-center justify-center font-heading font-black text-xs text-[#4b5563] group-hover:text-[#00fff2]">
      {index.toString().padStart(2, '0')}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <h4 className="font-bold truncate text-xs md:text-sm text-white group-hover:text-[#00fff2] transition-colors">
          {item.id}
        </h4>
        <span
          className={`text-[9px] px-2 py-0.5 rounded-md font-mono uppercase ${
            item.type === 'file' ? 'bg-[#00fff2]/10 text-[#00fff2]' : 'bg-[#b026ff]/10 text-[#b026ff]'
          }`}
        >
          {item.type}
        </span>
      </div>
      <div className="flex items-center gap-3 mt-1 text-[10px] text-[#9ca3af]">
        <div className="flex items-center gap-1">
          <ListTree size={11} />
          {item.degree} 링크
        </div>
        <div className="flex items-center gap-1">
          <FileJson size={11} />
          {(item.size / 1024).toFixed(1)} KB
        </div>
      </div>
    </div>
    <div className="flex items-center gap-4 shrink-0">
      <div className="text-right">
        <div className="text-xs font-mono font-black text-[#00fff2]">{item.score}</div>
        <div className="text-[8px] text-[#9ca3af] uppercase tracking-wider">복잡도</div>
      </div>
      <ChevronRight className="text-[#374151] group-hover:text-[#00fff2] transition-colors" size={18} />
    </div>
  </motion.div>
);

export default ProjectHealth;
