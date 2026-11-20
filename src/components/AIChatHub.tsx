import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, MessageSquare, Bot, User, Loader2, RefreshCcw, Globe, FileCode } from 'lucide-react';
import { aiService } from '../lib/ai-service';
import { vault } from '../lib/vault-engine';

interface Message {
  role: 'user' | 'model';
  content: string;
}

const QUICK_PROMPTS = [
  "현재 아키텍처의 가장 큰 병목 구간과 리팩토링 우선순위를 알려줘",
  "컴포넌트 간 결합도를 낮추기 위한 구조적 개선 전략은?",
  "이 프로젝트에 상태 관리 라이브러리를 도입하는 것이 좋을까?",
];

const AIChatHub: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [contextType, setContextType] = useState<'global' | 'local'>('global');
  const [hasKey, setHasKey] = useState(aiService.hasApiKey());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        role: 'model',
        content: `안녕하세요! MindVault AI 프로젝트 매니저입니다.\n현재 ${vault.getMode() === 'demo' ? '가상 예시 데모 프로젝트' : '로컬 워크스페이스'} 맥락을 파악하고 있습니다.\n코드 아키텍처 분석, 리팩토링 방향성, 성능 최적화에 대해 무엇이든 질문하세요!`,
      },
    ]);

    const unsub = aiService.subscribe(() => {
      setHasKey(aiService.hasApiKey());
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const messageText = (textToSend || input).trim();
    if (!messageText || isLoading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: messageText }]);
    setIsLoading(true);

    if (messages.length === 1) {
      const context = contextType === 'global' ? vault.getSystemContext() : 'Focused on current active entry.';
      await aiService.startChatSession(context);
    }

    const response = await aiService.sendMessage(messageText);
    setMessages((prev) => [...prev, { role: 'model', content: response }]);
    setIsLoading(false);
  };

  const resetChat = () => {
    setMessages([
      {
        role: 'model',
        content: "세션이 초기화되었습니다. 새로운 질문이나 분석할 아키텍처 주제를 입력해 주세요.",
      },
    ]);
    aiService.startChatSession(contextType === 'global' ? vault.getSystemContext() : 'Focused context.');
  };

  return (
    <div className="h-full flex flex-col gap-4 max-w-5xl mx-auto">
      <header className="flex flex-wrap items-center justify-between glass-card p-4 md:p-6 gap-4 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-[#b026ff] to-[#00fff2] rounded-2xl shadow-[0_0_20px_rgba(176,38,255,0.3)] text-white">
            <Bot size={22} />
          </div>
          <div>
            <h2 className="font-heading text-lg md:text-xl font-black text-white">
              AI <span className="text-[#00fff2]">PROJECT MANAGER</span>
            </h2>
            <div className="flex items-center gap-2">
              <span className={`flex h-2 w-2 rounded-full ${hasKey ? 'bg-[#00fff2]' : 'bg-amber-400'} animate-pulse`} />
              <span className="text-[10px] text-[#9ca3af] font-mono">
                {hasKey ? `${aiService.getModelName()} 실시간` : '스마트 데모 시뮬레이션'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 text-xs">
            <ContextTypeBtn
              active={contextType === 'global'}
              onClick={() => setContextType('global')}
              icon={<Globe size={13} />}
              label="Global Context"
            />
            <ContextTypeBtn
              active={contextType === 'local'}
              onClick={() => setContextType('local')}
              icon={<FileCode size={13} />}
              label="Local Context"
            />
          </div>
          <button
            onClick={resetChat}
            className="p-2.5 hover:bg-white/5 rounded-xl text-[#9ca3af] hover:text-white transition-colors"
            title="대화 초기화"
          >
            <RefreshCcw size={16} />
          </button>
        </div>
      </header>

      {/* Quick Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] text-gray-500 whitespace-nowrap">추천 질문:</span>
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 hover:text-[#00fff2] whitespace-nowrap transition-colors text-[11px]"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={scrollRef}
        className="flex-1 glass-card p-4 md:p-6 space-y-4 overflow-y-auto custom-scrollbar border border-white/5 min-h-[300px]"
      >
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    msg.role === 'user' ? 'bg-[#00fff2]/15 text-[#00fff2]' : 'bg-[#b026ff]/15 text-[#b026ff]'
                  }`}
                >
                  {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
                </div>
                <div
                  className={`p-4 rounded-2xl text-xs md:text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#00fff2]/10 border border-[#00fff2]/30 text-white'
                      : 'bg-white/5 border border-white/10 text-gray-300'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#b026ff]/15 text-[#b026ff] flex items-center justify-center">
                  <Loader2 size={16} className="animate-spin" />
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 italic text-gray-400 text-xs">
                  AI 프로젝트 매니저가 코드를 분석하고 있습니다...
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Bar */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#00fff2] to-[#b026ff] rounded-2xl blur opacity-20 group-hover:opacity-100 transition duration-500" />
        <div className="relative flex items-center bg-[#02040a] border border-white/10 rounded-2xl overflow-hidden px-4 md:px-6 h-14">
          <MessageSquare className="text-[#9ca3af] mr-3 shrink-0" size={18} />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`AI 프로젝트 매니저에게 질문하기 (${contextType.toUpperCase()} 맥락)...`}
            className="bg-transparent border-none outline-none text-white w-full text-sm placeholder:text-gray-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="p-2 text-[#00fff2] hover:scale-110 active:scale-95 transition-all disabled:opacity-30 disabled:scale-100"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

const ContextTypeBtn = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
      active ? 'bg-[#00fff2]/20 text-[#00fff2]' : 'text-gray-400 hover:text-white'
    }`}
  >
    {icon}
    {label}
  </button>
);

export default AIChatHub;
