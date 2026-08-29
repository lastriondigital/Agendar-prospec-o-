import React, { useState } from 'react';
import {
  BookOpen,
  Check,
  ChevronRight,
  Copy,
  FileText,
  HelpCircle,
  Layers,
  MessageSquare,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useToast } from '../../context/ToastContext';
import {
  DIAGNOSTIC_QUESTIONS_GUIDE,
  PLAYBOOK_BUILDING_BLOCKS,
  PLAYBOOK_STAGES,
  THREE_CS_METHODOLOGY,
} from '../../utils/assistantEngine';
import { PlaybookStageKey } from '../../types';

interface CommercialPlaybookModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStage?: string;
}

export const CommercialPlaybookModal: React.FC<CommercialPlaybookModalProps> = ({
  isOpen,
  onClose,
  initialStage,
}) => {
  const { success } = useToast();
  const [activeTab, setActiveTab] = useState<'stages' | '3cs' | 'questions' | 'blocks'>('stages');
  const [selectedStageId, setSelectedStageId] = useState<PlaybookStageKey>(
    (initialStage as PlaybookStageKey) || 'abertura'
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  const currentStage = PLAYBOOK_STAGES.find((s) => s.id === selectedStageId) || PLAYBOOK_STAGES[0];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    success('Texto copiado para a área de transferência.');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Playbook Comercial Consultivo & Biblioteca de Scripts"
      size="xl"
    >
      <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
        {/* Navegação por Abas Principais */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#E6E8EB] dark:border-[#2D3139] pb-3">
          <button
            onClick={() => setActiveTab('stages')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'stages'
                ? 'bg-[#3F6FB5] text-white shadow-xs'
                : 'bg-[#F7F8FA] dark:bg-[#1E2228] text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#202124]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            10 Etapas do Funil
          </button>
          <button
            onClick={() => setActiveTab('3cs')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === '3cs'
                ? 'bg-[#3F6FB5] text-white shadow-xs'
                : 'bg-[#F7F8FA] dark:bg-[#1E2228] text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#202124]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Metodologia dos 3 Cs
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'questions'
                ? 'bg-[#3F6FB5] text-white shadow-xs'
                : 'bg-[#F7F8FA] dark:bg-[#1E2228] text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#202124]'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Perguntas de Diagnóstico (3 Estados)
          </button>
          <button
            onClick={() => setActiveTab('blocks')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'blocks'
                ? 'bg-[#3F6FB5] text-white shadow-xs'
                : 'bg-[#F7F8FA] dark:bg-[#1E2228] text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#202124]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            13 Blocos Persuasivos de Apoio
          </button>
        </div>

        {/* ABA 1: 10 ETAPAS DO FUNIL */}
        {activeTab === 'stages' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Lista Lateral de Etapas */}
            <div className="md:col-span-4 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5F6368] dark:text-[#9AA0A6]">
                Etapas do Processo
              </span>
              <div className="space-y-1">
                {PLAYBOOK_STAGES.map((stg) => {
                  const isSelected = selectedStageId === stg.id;
                  return (
                    <button
                      key={stg.id}
                      onClick={() => setSelectedStageId(stg.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-[#3F6FB5] dark:text-blue-400 border border-blue-200 dark:border-blue-900/40'
                          : 'text-[#202124] dark:text-[#E8EAED] hover:bg-[#F1F3F4] dark:hover:bg-[#20242A]'
                      }`}
                    >
                      <span>{stg.title}</span>
                      {isSelected && <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Painel de Conteúdo da Etapa Selecionada */}
            <div className="md:col-span-8 space-y-4">
              <div className="p-4 rounded-xl bg-[#F7F8FA] dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#202124] dark:text-[#E8EAED]">
                    {currentStage.title}
                  </h3>
                  <Badge variant="blue" size="sm">Etapa {currentStage.order} de 10</Badge>
                </div>
                <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] leading-relaxed">
                  <strong className="text-[#202124] dark:text-[#E8EAED]">Objetivo:</strong> {currentStage.objective}
                </p>
              </div>

              {/* Táticas Chave */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#5F6368] dark:text-[#9AA0A6]">
                  Táticas Recomendadas:
                </span>
                <div className="space-y-1">
                  {currentStage.tactics.map((tac, i) => (
                    <div key={i} className="text-xs text-[#202124] dark:text-[#E8EAED] flex items-start gap-1.5">
                      <span className="text-[#3F6FB5] font-bold">✓</span>
                      <span>{tac}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Perguntas Sugeridas */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#5F6368] dark:text-[#9AA0A6]">
                  Perguntas de Condução:
                </span>
                <div className="space-y-1">
                  {currentStage.recommendedQuestions.map((q, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] text-xs text-[#202124] dark:text-[#E8EAED] flex items-center justify-between gap-2"
                    >
                      <span>"{q}"</span>
                      <button
                        onClick={() => handleCopy(q, `q_${i}`)}
                        className="p-1 text-[#5F6368] hover:text-[#3F6FB5]"
                        title="Copiar Pergunta"
                      >
                        {copiedId === `q_${i}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scripts de Exemplo */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#5F6368] dark:text-[#9AA0A6]">
                  Script Modelo para WhatsApp:
                </span>
                {currentStage.exampleScripts.map((scr, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-[#3F6FB5]">
                      <span>{scr.title}</span>
                      <button
                        onClick={() => handleCopy(scr.text, `scr_${i}`)}
                        className="flex items-center gap-1 text-xs text-[#3F6FB5] hover:underline"
                      >
                        {copiedId === `scr_${i}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        {copiedId === `scr_${i}` ? 'Copiado' : 'Copiar Script'}
                      </button>
                    </div>
                    <p className="text-xs text-[#202124] dark:text-[#E8EAED] leading-relaxed whitespace-pre-line font-mono bg-white dark:bg-[#181B20] p-2.5 rounded-lg border border-[#E6E8EB] dark:border-[#2D3139]">
                      {scr.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: METODOLOGIA DOS 3 CS */}
        {activeTab === '3cs' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40">
              <h3 className="text-sm font-bold text-purple-900 dark:text-purple-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Metodologia dos 3 Cs: Como responder a qualquer objeção sem confronto
              </h3>
              <p className="text-xs text-purple-800 dark:text-purple-300 mt-1">
                Estrutura psicológica comprovada para respeitar o ponto de vista do lead, introduzir nova perspectiva com hipóteses éticas e propor o próximo passo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 1. CONCORDAR */}
              <div className="p-4 rounded-xl bg-white dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs">
                    1
                  </span>
                  <h4 className="text-sm font-bold text-[#202124] dark:text-[#E8EAED]">
                    Concordar (Empatia)
                  </h4>
                </div>
                <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">
                  {THREE_CS_METHODOLOGY.concordar.description}
                </p>
                <div className="space-y-1.5 pt-2 border-t border-[#E6E8EB] dark:border-[#2D3139]">
                  <span className="text-[11px] font-bold text-[#5F6368] dark:text-[#9AA0A6] uppercase">Exemplos:</span>
                  {THREE_CS_METHODOLOGY.concordar.examples.map((ex, i) => (
                    <div key={i} className="text-xs text-[#202124] dark:text-[#E8EAED] italic bg-[#F7F8FA] dark:bg-[#20242A] p-2 rounded-lg">
                      "{ex}"
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. CONTORNAR */}
              <div className="p-4 rounded-xl bg-white dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-black text-xs">
                    2
                  </span>
                  <h4 className="text-sm font-bold text-[#202124] dark:text-[#E8EAED]">
                    Contornar (Novo Ângulo)
                  </h4>
                </div>
                <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">
                  {THREE_CS_METHODOLOGY.contornar.description}
                </p>
                <div className="space-y-1.5 pt-2 border-t border-[#E6E8EB] dark:border-[#2D3139]">
                  <span className="text-[11px] font-bold text-[#5F6368] dark:text-[#9AA0A6] uppercase">Exemplos:</span>
                  {THREE_CS_METHODOLOGY.contornar.examples.map((ex, i) => (
                    <div key={i} className="text-xs text-[#202124] dark:text-[#E8EAED] italic bg-[#F7F8FA] dark:bg-[#20242A] p-2 rounded-lg">
                      "{ex}"
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. CONDUZIR */}
              <div className="p-4 rounded-xl bg-white dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-black text-xs">
                    3
                  </span>
                  <h4 className="text-sm font-bold text-[#202124] dark:text-[#E8EAED]">
                    Conduzir (Próximo Passo)
                  </h4>
                </div>
                <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">
                  {THREE_CS_METHODOLOGY.conduzir.description}
                </p>
                <div className="space-y-1.5 pt-2 border-t border-[#E6E8EB] dark:border-[#2D3139]">
                  <span className="text-[11px] font-bold text-[#5F6368] dark:text-[#9AA0A6] uppercase">Exemplos:</span>
                  {THREE_CS_METHODOLOGY.conduzir.examples.map((ex, i) => (
                    <div key={i} className="text-xs text-[#202124] dark:text-[#E8EAED] italic bg-[#F7F8FA] dark:bg-[#20242A] p-2 rounded-lg">
                      "{ex}"
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 3: PERGUNTAS DE DIAGNÓSTICO (3 ESTADOS) */}
        {activeTab === 'questions' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* ESTADO ATUAL */}
              <div className="p-4 rounded-xl bg-white dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-blue-700 dark:text-blue-400">
                    📍 1. Estado Atual (Realidade)
                  </h4>
                </div>
                <p className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6]">
                  Mapeia os gargalos e atritos que a empresa enfrenta hoje.
                </p>
                <div className="space-y-2">
                  {DIAGNOSTIC_QUESTIONS_GUIDE.estadoAtual.map((item, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-[#F7F8FA] dark:bg-[#20242A] space-y-1">
                      <div className="text-xs font-semibold text-[#202124] dark:text-[#E8EAED]">"{item.question}"</div>
                      <div className="text-[10px] text-[#3F6FB5]">🎯 Objetivo: {item.purpose}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ESTADO DESEJADO */}
              <div className="p-4 rounded-xl bg-white dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                    ✨ 2. Estado Desejado (Ambição)
                  </h4>
                </div>
                <p className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6]">
                  Ancora o objetivo e a visão de crescimento do decisor.
                </p>
                <div className="space-y-2">
                  {DIAGNOSTIC_QUESTIONS_GUIDE.estadoDesejado.map((item, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-[#F7F8FA] dark:bg-[#20242A] space-y-1">
                      <div className="text-xs font-semibold text-[#202124] dark:text-[#E8EAED]">"{item.question}"</div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400">🎯 Objetivo: {item.purpose}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ESTADO TEMIDO */}
              <div className="p-4 rounded-xl bg-white dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-amber-700 dark:text-amber-400">
                    ⚠️ 3. Estado Temido (Custo da Inação)
                  </h4>
                </div>
                <p className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6]">
                  Evidencia riscos éticos de continuar sem presença moderna.
                </p>
                <div className="space-y-2">
                  {DIAGNOSTIC_QUESTIONS_GUIDE.estadoTemido.map((item, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-[#F7F8FA] dark:bg-[#20242A] space-y-1">
                      <div className="text-xs font-semibold text-[#202124] dark:text-[#E8EAED]">"{item.question}"</div>
                      <div className="text-[10px] text-amber-600 dark:text-amber-400">🎯 Objetivo: {item.purpose}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 4: 13 BLOCOS PERSUASIVOS DE APOIO */}
        {activeTab === 'blocks' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {PLAYBOOK_BUILDING_BLOCKS.map((block) => (
                <div
                  key={block.id}
                  className="p-3.5 rounded-xl bg-white dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#202124] dark:text-[#E8EAED]">
                        {block.title}
                      </h4>
                      <Badge variant="blue" size="sm">{block.category}</Badge>
                    </div>
                    <p className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6]">
                      {block.description}
                    </p>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-[#E6E8EB] dark:border-[#2D3139]">
                    <div className="text-[11px] text-[#202124] dark:text-[#E8EAED] italic bg-[#F7F8FA] dark:bg-[#20242A] p-2 rounded-lg">
                      "{block.applicationExample}"
                    </div>
                    <div className="text-[10px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{block.safetyRule}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rodapé */}
        <div className="flex justify-end pt-4 border-t border-[#E6E8EB] dark:border-[#2D3139]">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Fechar Playbook
          </Button>
        </div>
      </div>
    </Modal>
  );
};
