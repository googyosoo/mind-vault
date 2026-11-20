import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Shield, Check, X, ExternalLink, Sparkles, Database } from 'lucide-react';
import { aiService, AVAILABLE_MODELS } from '../lib/ai-service';
import { vault } from '../lib/vault-engine';
import type { DatasetMode } from '../lib/vault-engine';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState(aiService.getModelName());
  const [datasetMode, setDatasetMode] = useState<DatasetMode>(vault.getMode());
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(aiService.getApiKey());
      setSelectedModel(aiService.getModelName());
      setDatasetMode(vault.getMode());
      setSavedSuccess(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    aiService.setApiKey(apiKey);
    aiService.setModelName(selectedModel);
    vault.setMode(datasetMode);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const handleClear = () => {
    aiService.clearApiKey();
    setApiKey('');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 900);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            className="w-full max-w-xl glass-card border border-white/10 p-6 md:p-8 space-y-6 shadow-2xl relative"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-lg text-[#9ca3af] hover:text-white hover:bg-white/5 transition-all"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-[#00fff2] to-[#b026ff] rounded-xl text-white shadow-lg">
                <Key size={22} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Gemini API 키 및 프로젝트 설정</h3>
                <p className="text-xs text-[#9ca3af]">서버 없이 브라우저(localStorage)에 안전하게 보관됩니다.</p>
              </div>
            </div>

            {/* Key Input Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#00fff2] flex items-center gap-1.5">
                  <Shield size={14} /> Gemini API Key
                </label>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#9ca3af] hover:text-[#00fff2] flex items-center gap-1 transition-colors"
                >
                  무료 키 발급받기 <ExternalLink size={12} />
                </a>
              </div>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy... (미입력 시 스마트 데모 모드로 동작)"
                className="w-full px-4 py-3 bg-black/60 border border-white/15 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00fff2] font-mono text-sm transition-all"
              />
              <p className="text-[11px] text-[#9ca3af] leading-relaxed">
                * 입력한 키는 외부 서버로 전송되지 않고 브라우저에만 저장되어 Google Gemini API와 직접 통신합니다. 키가 없어도 모든 기능을 가상 데이터 데모 모드로 체험할 수 있습니다.
              </p>
            </div>

            {/* Model Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#b026ff] flex items-center gap-1.5">
                <Sparkles size={14} /> Gemini AI 모델 선택
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {AVAILABLE_MODELS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedModel(m.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedModel === m.id
                        ? 'border-[#00fff2] bg-[#00fff2]/10 text-white shadow-[0_0_12px_rgba(0,255,242,0.15)]'
                        : 'border-white/5 bg-white/5 text-[#9ca3af] hover:bg-white/10'
                    }`}
                  >
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      {m.name}
                      {selectedModel === m.id && <Check size={14} className="text-[#00fff2]" />}
                    </div>
                    <p className="text-[10px] text-[#9ca3af] mt-1">{m.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Dataset Mode Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/80 flex items-center gap-1.5">
                <Database size={14} /> 프로젝트 데이터셋 모드
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDatasetMode('demo')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    datasetMode === 'demo'
                      ? 'border-[#00fff2] bg-[#00fff2]/10 text-white shadow-[0_0_12px_rgba(0,255,242,0.15)]'
                      : 'border-white/5 bg-white/5 text-[#9ca3af] hover:bg-white/10'
                  }`}
                >
                  <span className="text-xs font-bold block text-white">✨ 가상 예시 데모</span>
                  <span className="text-[10px] text-[#9ca3af]">사전 구성된 12개 마이크로서비스 모듈</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDatasetMode('workspace')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    datasetMode === 'workspace'
                      ? 'border-[#00fff2] bg-[#00fff2]/10 text-white shadow-[0_0_12px_rgba(0,255,242,0.15)]'
                      : 'border-white/5 bg-white/5 text-[#9ca3af] hover:bg-white/10'
                  }`}
                >
                  <span className="text-xs font-bold block text-white">📂 로컬 인덱싱 데이터</span>
                  <span className="text-[10px] text-[#9ca3af]">실제 스캔된 소스코드 vault-data</span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all"
              >
                키 삭제하기
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs text-[#9ca3af] hover:text-white rounded-lg transition-all"
                >
                  닫기
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#00fff2] to-[#b026ff] rounded-xl font-bold text-xs text-white shadow-[0_0_15px_rgba(0,255,242,0.3)] hover:scale-105 active:scale-95 transition-all"
                >
                  {savedSuccess ? <Check size={16} /> : <Sparkles size={16} />}
                  {savedSuccess ? '설정 저장 완료!' : '설정 저장하기'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
