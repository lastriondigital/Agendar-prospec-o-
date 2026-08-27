import React, { useState } from 'react';
import {
  SplitSquareVertical,
  Plus,
  Trophy,
  Trash2,
  Edit2,
  Sparkles,
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
          <h3 className="text-base font-bold text-[#202124] dark:text-[#E8EAED] flex items-center gap-2">
            <SplitSquareVertical className="w-5 h-5 text-[#3F6FB5] dark:text-blue-400" />
            Testes A/B de Abordagem & Copy
          </h3>
          <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] mt-0.5">
            Compare o desempenho empírico entre <strong>Mensagem A</strong> e <strong>Mensagem B</strong> em 4 dimensões: Envio, Resposta, Resposta Positiva e Conversão.
          </p>
        </div>

        <Button
          id="create-ab-test-btn"
          variant="primary"
          size="sm"
          onClick={handleCreate}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Criar Teste A/B
        </Button>
      </div>

      {/* Tests List */}
      {abTests.length === 0 ? (
        <Card padding="lg" className="text-center py-10 space-y-3">
          <SplitSquareVertical className="w-10 h-10 text-[#80868B] mx-auto" />
          <h4 className="text-sm font-bold text-[#202124] dark:text-[#E8EAED]">Nenhum Teste A/B Cadastrado</h4>
          <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] max-w-md mx-auto">
            Crie testes comparativos de copy para descobrir qual mensagem gera mais respostas e clientes na sua prospecção.
          </p>
          <Button variant="secondary" size="sm" onClick={handleCreate}>
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
                className="space-y-4"
              >
                {/* Title & Metadata Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ECEEF1] dark:border-[#2D3139] pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-[#202124] dark:text-[#E8EAED]">{test.title}</h4>
                      <Badge variant="neutral" size="sm">
                        {CHANNEL_LABELS[test.channel] || test.channel}
                      </Badge>
                      {test.status === 'completed' ? (
                        <Badge variant="emerald" size="sm">
                          Concluído
                        </Badge>
                      ) : (
                        <Badge variant="blue" size="sm">
                          Em Andamento
                        </Badge>
                      )}
                    </div>
                    {test.description && (
                      <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">{test.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      id={`edit-ab-test-${test.id}`}
                      onClick={() => handleEdit(test)}
                      className="p-1.5 text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#202124] dark:hover:text-[#E8EAED] hover:bg-neutral-100 dark:hover:bg-[#20242A] rounded-lg transition-colors cursor-pointer"
                      title="Editar teste"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      id={`delete-ab-test-${test.id}`}
                      onClick={() => onDeleteTest(test.id)}
                      className="p-1.5 text-[#5F6368] dark:text-[#9AA0A6] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
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
                        ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800'
                        : 'bg-[#F7F8FA] dark:bg-[#1E2228] border-[#E6E8EB] dark:border-[#2D3139]'
                    } space-y-3`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-[#3F6FB5] text-white font-bold text-xs flex items-center justify-center">
                          A
                        </div>
                        <span className="text-xs font-bold text-[#202124] dark:text-[#E8EAED]">{varA.label}</span>
                      </div>
                      {isWinnerA && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-[#3F6FB5] dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800/40">
                          <Trophy className="w-3 h-3" />
                          Líder nos Dados
                        </span>
                      )}
                    </div>

                    {/* Content Preview */}
                    <div className="text-[11px] font-mono bg-white dark:bg-[#15171B] p-2.5 rounded-lg text-[#202124] dark:text-[#E8EAED] border border-[#DADDE1] dark:border-[#2D3139] whitespace-pre-wrap leading-relaxed max-h-24 overflow-y-auto">
                      {varA.content}
                    </div>

                    {/* 4 Metrics Matrix */}
                    <div className="grid grid-cols-4 gap-2 pt-1">
                      {/* Envio */}
                      <div className="p-2 rounded-lg bg-white dark:bg-[#15171B] border border-[#DADDE1] dark:border-[#2D3139] text-center">
                        <span className="text-[10px] text-[#5F6368] dark:text-[#9AA0A6] block">Envios</span>
                        <span className="text-sm font-extrabold font-mono text-[#202124] dark:text-[#E8EAED]">
                          {varA.sentCount}
                        </span>
                      </div>

                      {/* Resposta */}
                      <div className="p-2 rounded-lg bg-white dark:bg-[#15171B] border border-[#DADDE1] dark:border-[#2D3139] text-center">
                        <span className="text-[10px] text-[#5F6368] dark:text-[#9AA0A6] block">Respostas</span>
                        <span className="text-sm font-extrabold font-mono text-teal-700 dark:text-teal-400">
                          {varA.replyCount}
                        </span>
                        <span className="text-[9px] text-[#80868B] block font-mono">
                          {varA.replyRate}%
                        </span>
                      </div>

                      {/* Resposta Positiva */}
                      <div className="p-2 rounded-lg bg-white dark:bg-[#15171B] border border-[#DADDE1] dark:border-[#2D3139] text-center">
                        <span className="text-[10px] text-[#5F6368] dark:text-[#9AA0A6] block">Positivas</span>
                        <span className="text-sm font-extrabold font-mono text-teal-700 dark:text-teal-400">
                          {varA.positiveReplyCount}
                        </span>
                        <span className="text-[9px] text-[#80868B] block font-mono">
                          {varA.positiveReplyRate}%
                        </span>
                      </div>

                      {/* Conversão */}
                      <div className="p-2 rounded-lg bg-white dark:bg-[#15171B] border border-[#DADDE1] dark:border-[#2D3139] text-center">
                        <span className="text-[10px] text-[#5F6368] dark:text-[#9AA0A6] block">Conversões</span>
                        <span className="text-sm font-extrabold font-mono text-emerald-700 dark:text-emerald-400">
                          {varA.conversionCount}
                        </span>
                        <span className="text-[9px] text-[#80868B] block font-mono">
                          {varA.conversionRate}%
                        </span>
                      </div>
                    </div>

                    {/* Quick Log Action Bar */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#ECEEF1] dark:border-[#2D3139]">
                      <span className="text-[10px] text-[#80868B] mr-1">Registrar evento:</span>
                      <button
                        id={`btn-log-a-send-${test.id}`}
                        onClick={() => onLogEvent({ testId: test.id, variant: 'A', eventType: 'send' })}
                        className="px-2 py-0.5 text-[10px] rounded bg-white dark:bg-[#20242A] border border-[#DADDE1] dark:border-[#2D3139] hover:bg-neutral-100 text-[#202124] dark:text-[#E8EAED] cursor-pointer"
                        title="Adicionar 1 envio"
                      >
                        +1 Envio
                      </button>
                      <button
                        id={`btn-log-a-reply-${test.id}`}
                        onClick={() => onLogEvent({ testId: test.id, variant: 'A', eventType: 'reply' })}
                        className="px-2 py-0.5 text-[10px] rounded bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/40 cursor-pointer"
                        title="Adicionar 1 resposta"
                      >
                        +1 Resposta
                      </button>
                      <button
                        id={`btn-log-a-positive-${test.id}`}
                        onClick={() => onLogEvent({ testId: test.id, variant: 'A', eventType: 'positive_reply' })}
                        className="px-2 py-0.5 text-[10px] rounded bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/40 cursor-pointer"
                        title="Adicionar 1 resposta positiva"
                      >
                        +1 Positiva
                      </button>
                      <button
                        id={`btn-log-a-conversion-${test.id}`}
                        onClick={() => onLogEvent({ testId: test.id, variant: 'A', eventType: 'conversion' })}
                        className="px-2 py-0.5 text-[10px] rounded bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 cursor-pointer"
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
                        ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
                        : 'bg-[#F7F8FA] dark:bg-[#1E2228] border-[#E6E8EB] dark:border-[#2D3139]'
                    } space-y-3`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-amber-600 text-white font-bold text-xs flex items-center justify-center">
                          B
                        </div>
                        <span className="text-xs font-bold text-[#202124] dark:text-[#E8EAED]">{varB.label}</span>
                      </div>
                      {isWinnerB && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/40">
                          <Trophy className="w-3 h-3" />
                          Líder nos Dados
                        </span>
                      )}
                    </div>

                    {/* Content Preview */}
                    <div className="text-[11px] font-mono bg-white dark:bg-[#15171B] p-2.5 rounded-lg text-[#202124] dark:text-[#E8EAED] border border-[#DADDE1] dark:border-[#2D3139] whitespace-pre-wrap leading-relaxed max-h-24 overflow-y-auto">
                      {varB.content}
                    </div>

                    {/* 4 Metrics Matrix */}
                    <div className="grid grid-cols-4 gap-2 pt-1">
                      {/* Envio */}
                      <div className="p-2 rounded-lg bg-white dark:bg-[#15171B] border border-[#DADDE1] dark:border-[#2D3139] text-center">
                        <span className="text-[10px] text-[#5F6368] dark:text-[#9AA0A6] block">Envios</span>
                        <span className="text-sm font-extrabold font-mono text-[#202124] dark:text-[#E8EAED]">
                          {varB.sentCount}
                        </span>
                      </div>

                      {/* Resposta */}
                      <div className="p-2 rounded-lg bg-white dark:bg-[#15171B] border border-[#DADDE1] dark:border-[#2D3139] text-center">
                        <span className="text-[10px] text-[#5F6368] dark:text-[#9AA0A6] block">Respostas</span>
                        <span className="text-sm font-extrabold font-mono text-teal-700 dark:text-teal-400">
                          {varB.replyCount}
                        </span>
                        <span className="text-[9px] text-[#80868B] block font-mono">
                          {varB.replyRate}%
                        </span>
                      </div>

                      {/* Resposta Positiva */}
                      <div className="p-2 rounded-lg bg-white dark:bg-[#15171B] border border-[#DADDE1] dark:border-[#2D3139] text-center">
                        <span className="text-[10px] text-[#5F6368] dark:text-[#9AA0A6] block">Positivas</span>
                        <span className="text-sm font-extrabold font-mono text-teal-700 dark:text-teal-400">
                          {varB.positiveReplyCount}
                        </span>
                        <span className="text-[9px] text-[#80868B] block font-mono">
                          {varB.positiveReplyRate}%
                        </span>
                      </div>

                      {/* Conversão */}
                      <div className="p-2 rounded-lg bg-white dark:bg-[#15171B] border border-[#DADDE1] dark:border-[#2D3139] text-center">
                        <span className="text-[10px] text-[#5F6368] dark:text-[#9AA0A6] block">Conversões</span>
                        <span className="text-sm font-extrabold font-mono text-emerald-700 dark:text-emerald-400">
                          {varB.conversionCount}
                        </span>
                        <span className="text-[9px] text-[#80868B] block font-mono">
                          {varB.conversionRate}%
                        </span>
                      </div>
                    </div>

                    {/* Quick Log Action Bar */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#ECEEF1] dark:border-[#2D3139]">
                      <span className="text-[10px] text-[#80868B] mr-1">Registrar evento:</span>
                      <button
                        id={`btn-log-b-send-${test.id}`}
                        onClick={() => onLogEvent({ testId: test.id, variant: 'B', eventType: 'send' })}
                        className="px-2 py-0.5 text-[10px] rounded bg-white dark:bg-[#20242A] border border-[#DADDE1] dark:border-[#2D3139] hover:bg-neutral-100 text-[#202124] dark:text-[#E8EAED] cursor-pointer"
                        title="Adicionar 1 envio"
                      >
                        +1 Envio
                      </button>
                      <button
                        id={`btn-log-b-reply-${test.id}`}
                        onClick={() => onLogEvent({ testId: test.id, variant: 'B', eventType: 'reply' })}
                        className="px-2 py-0.5 text-[10px] rounded bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/40 cursor-pointer"
                        title="Adicionar 1 resposta"
                      >
                        +1 Resposta
                      </button>
                      <button
                        id={`btn-log-b-positive-${test.id}`}
                        onClick={() => onLogEvent({ testId: test.id, variant: 'B', eventType: 'positive_reply' })}
                        className="px-2 py-0.5 text-[10px] rounded bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/40 cursor-pointer"
                        title="Adicionar 1 resposta positiva"
                      >
                        +1 Positiva
                      </button>
                      <button
                        id={`btn-log-b-conversion-${test.id}`}
                        onClick={() => onLogEvent({ testId: test.id, variant: 'B', eventType: 'conversion' })}
                        className="px-2 py-0.5 text-[10px] rounded bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 cursor-pointer"
                        title="Adicionar 1 cliente convertido"
                      >
                        +1 Conversão
                      </button>
                    </div>
                  </div>
                </div>

                {/* Empirical Conclusion Box */}
                <div className="p-3 rounded-lg bg-[#F7F8FA] dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] flex items-start gap-2.5 text-xs text-[#202124] dark:text-[#E8EAED]">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#202124] dark:text-[#E8EAED]">Constatação Empírica: </span>
                    <span>{test.insightSummary}</span>
                    <span className="text-[11px] text-[#80868B] block mt-0.5">
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
