import React, { useState } from 'react';
import {
  SplitSquareVertical,
  Plus,
  Trophy,
  Send,
  MessageSquare,
  ThumbsUp,
  Award,
  CheckCircle2,
  Trash2,
  Edit2,
  Layers,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { ABTestExperiment, Service } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ABTestModal } from './ABTestModal';
import { CHANNEL_LABELS } from '../../utils/constants';

interface ABTestingSectionProps {
  abTests: ABTestExperiment[];
  services: Service[];
  availableNiches: string[];
  onSaveTest: (test: ABTestExperiment) => void;
  onDeleteTest: (id: string) => void;
  onLogEvent: (params: {
    testId: string;
    variant: 'A' | 'B';
    eventType: 'send' | 'reply' | 'positive_reply' | 'conversion';
  }) => void;
}

export const ABTestingSection: React.FC<ABTestingSectionProps> = ({
  abTests,
  services,
  availableNiches,
  onSaveTest,
  onDeleteTest,
  onLogEvent,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<ABTestExperiment | null>(null);

  const handleEdit = (test: ABTestExperiment) => {
    setEditingTest(test);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingTest(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
            <SplitSquareVertical className="w-5 h-5 text-indigo-400" />
            Testes A/B de Abordagem & Copy
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Compare o desempenho empírico entre <strong>Mensagem A</strong> e <strong>Mensagem B</strong> em 4 dimensões: Envio, Resposta, Resposta Positiva e Conversão.
          </p>
        </div>

        <Button
          id="create-ab-test-btn"
          variant="primary"
          size="sm"
          onClick={handleCreate}
          className="flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Teste A/B</span>
        </Button>
      </div>

      {/* Tests List */}
      {abTests.length === 0 ? (
        <Card padding="lg" className="bg-neutral-900 border-neutral-800 text-center py-10 space-y-3">
          <SplitSquareVertical className="w-10 h-10 text-neutral-600 mx-auto" />
          <h4 className="text-sm font-bold text-neutral-200">Nenhum Teste A/B Cadastrado</h4>
          <p className="text-xs text-neutral-400 max-w-md mx-auto">
            Crie testes comparativos de copy para descobrir qual mensagem gera mais respostas e clientes na sua prospecção.
          </p>
          <Button variant="outline" size="sm" onClick={handleCreate}>
            Criar Primeiro Experimento
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {abTests.map((test) => {
            const varA = test.variantA;
            const varB = test.variantB;

            const isWinnerA = test.winnerVariant === 'A';
            const isWinnerB = test.winnerVariant === 'B';

            return (
              <Card
                key={test.id}
                id={`ab-test-card-${test.id}`}
                padding="md"
                className="bg-neutral-900 border-neutral-800 space-y-4 hover:border-neutral-700/80 transition-colors"
              >
                {/* Title & Metadata Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800/80 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-neutral-100">{test.title}</h4>
                      <Badge variant="neutral" className="text-[10px]">
                        {CHANNEL_LABELS[test.channel] || test.channel}
                      </Badge>
                      {test.status === 'completed' ? (
                        <Badge variant="emerald" className="text-[10px]">
                          Concluído
                        </Badge>
                      ) : (
                        <Badge variant="blue" className="text-[10px]">
                          Em Andamento
                        </Badge>
                      )}
                    </div>
                    {test.description && (
                      <p className="text-xs text-neutral-400">{test.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      id={`edit-ab-test-${test.id}`}
                      onClick={() => handleEdit(test)}
                      className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors"
                      title="Editar teste"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      id={`delete-ab-test-${test.id}`}
                      onClick={() => onDeleteTest(test.id)}
                      className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Excluir teste"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Side-by-Side Comparison Container */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* VARIANT A */}
                  <div
                    className={`p-4 rounded-xl border ${
                      isWinnerA
                        ? 'bg-indigo-950/20 border-indigo-500/40 ring-1 ring-indigo-500/20'
                        : 'bg-neutral-950/60 border-neutral-800'
                    } space-y-3`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-indigo-600/30 text-indigo-300 font-bold text-xs flex items-center justify-center border border-indigo-500/30">
                          A
                        </div>
                        <span className="text-xs font-bold text-neutral-200">{varA.label}</span>
                      </div>
                      {isWinnerA && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                          <Trophy className="w-3 h-3" />
                          Líder nos Dados
                        </span>
                      )}
                    </div>

                    {/* Content Preview */}
                    <div className="text-[11px] font-mono bg-neutral-900/80 p-2.5 rounded-lg text-neutral-300 border border-neutral-800 whitespace-pre-wrap leading-relaxed max-h-24 overflow-y-auto">
                      {varA.content}
                    </div>

                    {/* 4 Metrics Matrix */}
                    <div className="grid grid-cols-4 gap-2 pt-1">
                      {/* Envio */}
                      <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800/80 text-center">
                        <span className="text-[10px] text-neutral-500 block">Envios</span>
                        <span className="text-sm font-extrabold font-mono text-neutral-200">
                          {varA.sentCount}
                        </span>
                      </div>

                      {/* Resposta */}
                      <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800/80 text-center">
                        <span className="text-[10px] text-neutral-500 block">Respostas</span>
                        <span className="text-sm font-extrabold font-mono text-cyan-400">
                          {varA.replyCount}
                        </span>
                        <span className="text-[9px] text-neutral-400 block font-mono">
                          {varA.replyRate}%
                        </span>
                      </div>

                      {/* Resposta Positiva */}
                      <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800/80 text-center">
                        <span className="text-[10px] text-neutral-500 block">Positivas</span>
                        <span className="text-sm font-extrabold font-mono text-teal-400">
                          {varA.positiveReplyCount}
                        </span>
                        <span className="text-[9px] text-neutral-400 block font-mono">
                          {varA.positiveReplyRate}%
                        </span>
                      </div>

                      {/* Conversão */}
                      <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800/80 text-center">
                        <span className="text-[10px] text-neutral-500 block">Conversões</span>
                        <span className="text-sm font-extrabold font-mono text-emerald-400">
                          {varA.conversionCount}
                        </span>
                        <span className="text-[9px] text-neutral-400 block font-mono">
                          {varA.conversionRate}%
                        </span>
                      </div>
                    </div>

                    {/* Quick Log Action Bar */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-neutral-800/60">
                      <span className="text-[10px] text-neutral-500 mr-1">Registrar evento:</span>
                      <button
                        id={`btn-log-a-send-${test.id}`}
                        onClick={() => onLogEvent({ testId: test.id, variant: 'A', eventType: 'send' })}
                        className="px-2 py-0.5 text-[10px] rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                        title="Adicionar 1 envio"
                      >
                        +1 Envio
                      </button>
                      <button
                        id={`btn-log-a-reply-${test.id}`}
                        onClick={() => onLogEvent({ testId: test.id, variant: 'A', eventType: 'reply' })}
                        className="px-2 py-0.5 text-[10px] rounded bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-800/40"
                        title="Adicionar 1 resposta"
                      >
                        +1 Resposta
                      </button>
                      <button
                        id={`btn-log-a-positive-${test.id}`}
                        onClick={() => onLogEvent({ testId: test.id, variant: 'A', eventType: 'positive_reply' })}
                        className="px-2 py-0.5 text-[10px] rounded bg-teal-950/60 hover:bg-teal-900/80 text-teal-300 border border-teal-800/40"
                        title="Adicionar 1 resposta positiva"
                      >
                        +1 Positiva
                      </button>
                      <button
                        id={`btn-log-a-conversion-${test.id}`}
                        onClick={() => onLogEvent({ testId: test.id, variant: 'A', eventType: 'conversion' })}
                        className="px-2 py-0.5 text-[10px] rounded bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/40"
                        title="Adicionar 1 cliente convertido"
                      >
                        +1 Conversão
                      </button>
                    </div>
                  </div>

                  {/* VARIANT B */}
                  <div
                    className={`p-4 rounded-xl border ${
                      isWinnerB
                        ? 'bg-amber-950/20 border-amber-500/40 ring-1 ring-amber-500/20'
                        : 'bg-neutral-950/60 border-neutral-800'
                    } space-y-3`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-amber-600/30 text-amber-300 font-bold text-xs flex items-center justify-center border border-amber-500/30">
                          B
                        </div>
                        <span className="text-xs font-bold text-neutral-200">{varB.label}</span>
                      </div>
                      {isWinnerB && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          <Trophy className="w-3 h-3" />
                          Líder nos Dados
                        </span>
                      )}
                    </div>

                    {/* Content Preview */}
                    <div className="text-[11px] font-mono bg-neutral-900/80 p-2.5 rounded-lg text-neutral-300 border border-neutral-800 whitespace-pre-wrap leading-relaxed max-h-24 overflow-y-auto">
                      {varB.content}
                    </div>

                    {/* 4 Metrics Matrix */}
                    <div className="grid grid-cols-4 gap-2 pt-1">
                      {/* Envio */}
                      <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800/80 text-center">
                        <span className="text-[10px] text-neutral-500 block">Envios</span>
                        <span className="text-sm font-extrabold font-mono text-neutral-200">
                          {varB.sentCount}
                        </span>
                      </div>

                      {/* Resposta */}
                      <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800/80 text-center">
                        <span className="text-[10px] text-neutral-500 block">Respostas</span>
                        <span className="text-sm font-extrabold font-mono text-cyan-400">
                          {varB.replyCount}
                        </span>
                        <span className="text-[9px] text-neutral-400 block font-mono">
                          {varB.replyRate}%
                        </span>
                      </div>

                      {/* Resposta Positiva */}
                      <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800/80 text-center">
                        <span className="text-[10px] text-neutral-500 block">Positivas</span>
                        <span className="text-sm font-extrabold font-mono text-teal-400">
                          {varB.positiveReplyCount}
                        </span>
                        <span className="text-[9px] text-neutral-400 block font-mono">
                          {varB.positiveReplyRate}%
                        </span>
                      </div>

                      {/* Conversão */}
                      <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800/80 text-center">
                        <span className="text-[10px] text-neutral-500 block">Conversões</span>
                        <span className="text-sm font-extrabold font-mono text-emerald-400">
                          {varB.conversionCount}
                        </span>
                        <span className="text-[9px] text-neutral-400 block font-mono">
                          {varB.conversionRate}%
                        </span>
                      </div>
                    </div>

                    {/* Quick Log Action Bar */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-neutral-800/60">
                      <span className="text-[10px] text-neutral-500 mr-1">Registrar evento:</span>
                      <button
                        id={`btn-log-b-send-${test.id}`}
                        onClick={() => onLogEvent({ testId: test.id, variant: 'B', eventType: 'send' })}
                        className="px-2 py-0.5 text-[10px] rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                        title="Adicionar 1 envio"
                      >
                        +1 Envio
                      </button>
                      <button
                        id={`btn-log-b-reply-${test.id}`}
                        onClick={() => onLogEvent({ testId: test.id, variant: 'B', eventType: 'reply' })}
                        className="px-2 py-0.5 text-[10px] rounded bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-800/40"
                        title="Adicionar 1 resposta"
                      >
                        +1 Resposta
                      </button>
                      <button
                        id={`btn-log-b-positive-${test.id}`}
                        onClick={() => onLogEvent({ testId: test.id, variant: 'B', eventType: 'positive_reply' })}
                        className="px-2 py-0.5 text-[10px] rounded bg-teal-950/60 hover:bg-teal-900/80 text-teal-300 border border-teal-800/40"
                        title="Adicionar 1 resposta positiva"
                      >
                        +1 Positiva
                      </button>
                      <button
                        id={`btn-log-b-conversion-${test.id}`}
                        onClick={() => onLogEvent({ testId: test.id, variant: 'B', eventType: 'conversion' })}
                        className="px-2 py-0.5 text-[10px] rounded bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/40"
                        title="Adicionar 1 cliente convertido"
                      >
                        +1 Conversão
                      </button>
                    </div>
                  </div>
                </div>

                {/* Empirical Conclusion Box */}
                <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800/90 flex items-start gap-2.5 text-xs text-neutral-300">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-neutral-200">Constatação Empírica: </span>
                    <span>{test.insightSummary}</span>
                    <span className="text-[11px] text-neutral-500 block mt-0.5">
                      Baseado exclusivamente nos {varA.sentCount + varB.sentCount} envios registrados no IndexedDB.
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <ABTestModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={onSaveTest}
          initialTest={editingTest}
          services={services}
          availableNiches={availableNiches}
        />
      )}
    </div>
  );
};
