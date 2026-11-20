import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Layout, Share2, Box, Database, Menu, X, MessageSquare, Sparkles, Activity, Key, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import VaultDashboard from './components/VaultDashboard';
import KnowledgeGraph from './components/KnowledgeGraph';
import WikiExplorer from './components/WikiExplorer';
import AIChatHub from './components/AIChatHub';
import ProjectHealth from './components/ProjectHealth';
import { ApiKeyModal } from './components/ApiKeyModal';
import { aiService } from './lib/ai-service';

const AppContent: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isKeyModalOpen, setKeyModalOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(aiService.hasApiKey());
  const location = useLocation();

  useEffect(() => {
    const unsub = aiService.subscribe(() => {
      setHasApiKey(aiService.hasApiKey());
    });
    return unsub;
  }, []);

  // 모바일 화면(가로 768px 미만)에서는 라우트 이동 시 사이드바 자동 닫힘
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#02040a] text-white">
      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-72 fixed md:relative z-50 glass-card h-[calc(100vh-2rem)] m-4 mr-0 p-6 flex flex-col overflow-y-auto border border-white/10 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-[#00fff2] to-[#b026ff] rounded-xl shadow-lg">
                  <Database size={22} className="text-white" />
                </div>
                <div>
                  <h1 className="font-heading text-lg font-black tracking-tighter leading-none">
                    MIND<span className="text-[#00fff2]">VAULT</span>
                  </h1>
                  <span className="text-[10px] text-gray-400 font-mono">Codebase Intelligence</span>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="flex-1 space-y-2">
              <SidebarLink to="/" icon={<Layout size={18} />} label="대시보드" current={location.pathname === '/'} />
              <SidebarLink to="/graph" icon={<Share2 size={18} />} label="지식 그래프" current={location.pathname === '/graph'} />
              <SidebarLink to="/health" icon={<Activity size={18} />} label="아키텍처 진단" current={location.pathname === '/health'} />
              <SidebarLink to="/chat" icon={<div className="relative"><MessageSquare size={18} /><Sparkles size={10} className="absolute -top-1 -right-1 text-[#00fff2]" /></div>} label="AI PM 채팅" current={location.pathname === '/chat'} />
              <SidebarLink to="/wiki" icon={<Box size={18} />} label="위키 브라우저" current={location.pathname === '/wiki'} />

              <div className="pt-6 pb-2">
                <p className="text-[10px] uppercase tracking-widest text-[#9ca3af] font-bold mb-3 ml-3">설정 및 상태</p>
                <button
                  type="button"
                  onClick={() => setKeyModalOpen(true)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all text-[#9ca3af] hover:text-[#00fff2] group text-left"
                >
                  <div className="flex items-center gap-3">
                    <Key size={18} className="group-hover:scale-110 transition-transform text-[#00fff2]" />
                    <span className="text-xs font-medium">Gemini 키 설정</span>
                  </div>
                  {hasApiKey && <CheckCircle2 size={14} className="text-[#00fff2]" />}
                </button>
              </div>
            </nav>

            {/* Footer Status */}
            <div className="mt-auto pt-4 border-t border-white/5">
              <div
                onClick={() => setKeyModalOpen(true)}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all cursor-pointer border border-white/5"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-gray-400">Gemini AI 연결</span>
                  <span className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-[#00fff2] shadow-[0_0_8px_#00fff2]' : 'bg-amber-400'} animate-pulse`} />
                </div>
                <p className="text-xs font-semibold text-white truncate">
                  {hasApiKey ? aiService.getModelName() : '데모 시뮬레이션 모드'}
                </p>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Floating Bar */}
        <header className="h-16 px-4 flex items-center justify-between border-b border-white/5 bg-[#02040a]/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl glass-card hover:text-[#00fff2] transition-colors"
              title="사이드바 토글"
            >
              {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <span className="text-xs font-mono text-gray-400 hidden sm:inline">
              MindVault v2.0 • Browser Direct AI
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setKeyModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 hover:border-[#00fff2] text-xs transition-all bg-white/5"
            >
              <Key size={14} className="text-[#00fff2]" />
              <span className="hidden sm:inline">
                {hasApiKey ? 'Gemini 키 활성' : 'API 키 설정'}
              </span>
            </button>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="flex-1 p-3 md:p-6 relative overflow-y-auto">
          <Routes>
            <Route path="/" element={<VaultDashboard onOpenSettings={() => setKeyModalOpen(true)} />} />
            <Route path="/graph" element={<KnowledgeGraph />} />
            <Route path="/wiki" element={<WikiExplorer />} />
            <Route path="/chat" element={<AIChatHub />} />
            <Route path="/health" element={<ProjectHealth />} />
            {/* Fallback route */}
            <Route path="*" element={<VaultDashboard onOpenSettings={() => setKeyModalOpen(true)} />} />
          </Routes>
        </main>
      </div>

      {/* API Key Modal */}
      <ApiKeyModal isOpen={isKeyModalOpen} onClose={() => setKeyModalOpen(false)} />
    </div>
  );
};

const SidebarLink = ({ to, icon, label, current }: { to: string; icon: React.ReactNode; label: string; current: boolean }) => (
  <Link
    to={to}
    className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl transition-all text-xs font-medium group ${
      current
        ? 'bg-[#00fff2]/10 text-[#00fff2] border border-[#00fff2]/30 font-bold shadow-[0_0_12px_rgba(0,255,242,0.15)]'
        : 'text-[#9ca3af] hover:bg-white/5 hover:text-white'
    }`}
  >
    <span className="group-hover:scale-110 transition-transform">{icon}</span>
    <span>{label}</span>
  </Link>
);

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
