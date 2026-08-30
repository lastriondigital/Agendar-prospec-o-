import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Search,
  Copy,
  Check,
  HelpCircle,
  ShieldAlert,
  Flame,
  Target,
  Sparkles,
  ChevronRight,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  PLAYBOOK_3C_QUESTIONS,
  PLAYBOOK_3_STATES,
  PLAYBOOK_OBJECTIONS,
  DiagnosticQuestion,
  PlaybookObjection,
} from '../../utils/playbookData';
import { useToast } from '../../context/ToastContext';
import { Button } from '../ui/Button';

interface PlaybookModalProps {
  onClose: () => void;
}

export const PlaybookModal: React.FC<PlaybookModalProps> = ({ onClose }) => {
  const { success } = useToast();
  const [activePillar, setActivePillar] = useState<'3cs' | '3states' | 'objections'>('3cs');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    success('Texto copiado com sucesso!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered3Cs = PLAYBOOK_3C_QUESTIONS.filter(
    (q) =>
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.goal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredObjections = PLAYBOOK_OBJECTIONS.filter(
    (o) =>
      o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.bestResponse.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.mindset.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#181B20] rounded-2xl border border-[#E6E8EB] dark:border-[#2D3139] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E6E8EB] dark:border-[#2D3139] sticky top-0 bg-white dark:bg-[#181B20] z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/50 text-[#3F6FB5] dark:text-blue-300 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#3F6FB5] dark:text-blue-400">
                Guia Tático Comercial
              </div>
              <h2 className="text-lg font-bold text-[#202124] dark:text-[#E8EAED]">
                Playbook de Prospecção & Diagnóstico
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#5F6368] hover:text-[#202124] dark:text-[#9AA0A6] dark:hover:text-[#E8EAED] rounded-lg hover:bg-[#F7F8FA] dark:hover:bg-[#20242A]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector & Search */}
        <div className="p-4 border-b border-[#E6E8EB] dark:border-[#2D3139] bg-[#F7F8FA] dark:bg-[#20242A] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setActivePillar('3cs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activePillar === '3cs'
                  ? 'bg-[#3F6FB5] text-white shadow-xs'
                  : 'bg-white dark:bg-[#181B20] text-[#5F6368] dark:text-[#9AA0A6] border border-[#E6E8EB] dark:border-[#2D3139]'
              }`}
            >
              Metodologia dos 3 Cs (Diagnóstico)
            </button>
            <button
              onClick={() => setActivePillar('3states')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activePillar === '3states'
                  ? 'bg-[#3F6FB5] text-white shadow-xs'
                  : 'bg-white dark:bg-[#181B20] text-[#5F6368] dark:text-[#9AA0A6] border border-[#E6E8EB] dark:border-[#2D3139]'
              }`}
            >
              Os 3 Estados (Atual, Desejado, Temido)
            </button>
            <button
              onClick={() => setActivePillar('objections')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activePillar === 'objections'
                  ? 'bg-[#3F6FB5] text-white shadow-xs'
                  : 'bg-white dark:bg-[#181B20] text-[#5F6368] dark:text-[#9AA0A6] border border-[#E6E8EB] dark:border-[#2D3139]'
              }`}
            >
              Matriz de Objeções
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5F6368] dark:text-[#9AA0A6]" />
            <input
              type="text"
              placeholder="Buscar no Playbook..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[#E6E8EB] dark:border-[#2D3139] bg-white dark:bg-[#181B20] text-xs text-[#202124] dark:text-[#E8EAED] focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6 flex-1">
          {/* TAB 1: METODOLOGIA DOS 3 CS */}
          {activePillar === '3cs' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 text-xs text-[#5F6368] dark:text-[#9AA0A6] leading-relaxed">
                <strong className="text-[#3F6FB5] dark:text-blue-300 block mb-1">
                  Como aplicar a metodologia dos 3 Cs:
                </strong>
                Conduza a conversa em 3 etapas progressivas: Primeiro entenda o <strong>Contexto (C1)</strong> da operação; depois identifique a <strong>Causa (C2)</strong> dos gargalos; por fim, evidencie a <strong>Consequência (C3)</strong> e o custo da inação.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['contexto', 'causa', 'consequencia'].map((pillarKey) => {
                  const items = filtered3Cs.filter((q) => q.pillar === pillarKey);
                  const title =
                    pillarKey === 'contexto'
                      ? 'C1 — Contexto'
                      : pillarKey === 'causa'
                      ? 'C2 — Causa'
                      : 'C3 — Consequência';
                  const badgeColor =
                    pillarKey === 'contexto'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      : pillarKey === 'causa'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';

                  return (
                    <div key={pillarKey} className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-[#E6E8EB] dark:border-[#2D3139]">
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${badgeColor}`}>
                          {title}
                        </span>
                        <span className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6]">
                          {items.length} perguntas
                        </span>
                      </div>

                      <div className="space-y-3">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="p-3.5 rounded-xl border border-[#E6E8EB] dark:border-[#2D3139] bg-white dark:bg-[#181B20] space-y-2 hover:border-blue-300 dark:hover:border-blue-700 transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase text-[#5F6368] dark:text-[#9AA0A6]">
                                {item.category}
                              </span>
                              <button
                                onClick={() => handleCopy(item.id, item.question)}
                                className="text-xs font-semibold text-[#3F6FB5] dark:text-blue-400 hover:underline flex items-center gap-1"
                              >
                                {copiedId === item.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                                {copiedId === item.id ? 'Copiado' : 'Copiar'}
                              </button>
                            </div>

                            <p className="text-xs font-semibold text-[#202124] dark:text-[#E8EAED] leading-snug">
                              "{item.question}"
                            </p>

                            <div className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6] bg-[#F7F8FA] dark:bg-[#20242A] p-2 rounded-lg leading-relaxed">
                              <strong>Objetivo:</strong> {item.goal}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: OS 3 ESTADOS */}
          {activePillar === '3states' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 text-xs text-[#5F6368] dark:text-[#9AA0A6] leading-relaxed">
                <strong className="text-purple-700 dark:text-purple-300 block mb-1">
                  Diagnóstico Emocional & Racional dos 3 Estados:
                </strong>
                A decisão de compra B2B é orientada pelo contraste entre a dor do <strong>Estado Atual</strong>, a atração do <strong>Estado Desejado</strong> e a aversão ao risco do <strong>Estado Temido</strong>.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PLAYBOOK_3_STATES.map((state) => (
                  <div
                    key={state.id}
                    className="p-4 rounded-xl border border-[#E6E8EB] dark:border-[#2D3139] bg-white dark:bg-[#181B20] space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                      <h3 className="text-xs font-bold text-[#202124] dark:text-[#E8EAED]">
                        {state.title}
                      </h3>
                    </div>

                    <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] leading-relaxed">
                      {state.description}
                    </p>

                    <div className="p-2.5 rounded-lg bg-[#F7F8FA] dark:bg-[#20242A] space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#5F6368] dark:text-[#9AA0A6]">
                        Perguntas de Gatilho
                      </span>
                      <ul className="space-y-1">
                        {state.triggerQuestions.map((tq, i) => (
                          <li key={i} className="text-xs text-[#202124] dark:text-[#E8EAED] flex items-start gap-1.5">
                            <span className="text-purple-500 font-bold">•</span>
                            <span>{tq}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="text-[11px] text-purple-900 dark:text-purple-300 font-medium">
                      <strong>Impacto:</strong> {state.painOrGain}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: MATRIZ DE OBJEÇÕES */}
          {activePillar === 'objections' && (
            <div className="space-y-4">
              <div className="space-y-3">
                {filteredObjections.map((obj) => (
                  <div
                    key={obj.id}
                    className="p-4 rounded-xl border border-[#E6E8EB] dark:border-[#2D3139] bg-white dark:bg-[#181B20] space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-300">
                          {obj.categoryLabel}
                        </span>
                        <h3 className="text-xs font-bold text-[#202124] dark:text-[#E8EAED]">
                          {obj.title}
                        </h3>
                      </div>
                      <span className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6] italic">
                        {obj.mindset}
                      </span>
                    </div>

                    {/* Resposta Principal */}
                    <div className="p-3 rounded-xl bg-[#F7F8FA] dark:bg-[#20242A] border border-[#E6E8EB] dark:border-[#2D3139] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-[#3F6FB5] dark:text-blue-400">
                          Script Principal Recomendado
                        </span>
                        <button
                          onClick={() => handleCopy(obj.id + '_best', obj.bestResponse)}
                          className="text-xs font-semibold text-[#3F6FB5] dark:text-blue-400 hover:underline flex items-center gap-1"
                        >
                          {copiedId === obj.id + '_best' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          {copiedId === obj.id + '_best' ? 'Copiado' : 'Copiar'}
                        </button>
                      </div>
                      <p className="text-xs text-[#202124] dark:text-[#E8EAED] leading-relaxed">
                        "{obj.bestResponse}"
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* Pergunta Reflexiva */}
                      <div className="p-2.5 rounded-lg border border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/10 text-amber-900 dark:text-amber-300">
                        <strong>Pergunta de Fechamento:</strong> "{obj.reflexiveQuestion}"
                      </div>
                      {/* Regra Tática */}
                      <div className="p-2.5 rounded-lg border border-blue-200 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/10 text-blue-900 dark:text-blue-300">
                        <strong>Regra de Ouro:</strong> {obj.ruleOfThumb}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E6E8EB] dark:border-[#2D3139] flex justify-end bg-[#F7F8FA] dark:bg-[#20242A]">
          <Button variant="secondary" onClick={onClose}>
            Fechar Playbook
          </Button>
        </div>
      </div>
    </div>
  );
};
