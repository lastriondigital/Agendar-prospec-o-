import React, { useState } from 'react';
import {
  ArrowUpRight,
  BrainCircuit,
  Check,
  CheckCircle2,
  Globe,
  Layers,
  LineChart,
  MessageSquare,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { calculateSystemLearningMetrics } from '../../utils/assistantEngine';
import { SystemLearningMetric } from '../../types';

interface SystemLearningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemLearningModal: React.FC<SystemLearningModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { companies, leads, services, icps, history } = useApp();
  const { success } = useToast();

  const [activeCategory, setActiveCategory] = useState<
    'all' | 'country' | 'icp' | 'signals'
  >('all');
  const [appliedIds, setAppliedIds] = useState<string[]>([]);

  const metrics = React.useMemo(() => {
    return calculateSystemLearningMetrics(companies, leads, services, icps, history);
  }, [companies, leads, services, icps, history]);

  const filteredMetrics = React.useMemo(() => {
    if (activeCategory === 'all') return metrics;
    return metrics.filter((m) => m.category === activeCategory);
  }, [metrics, activeCategory]);

  const handleApplySuggestion = (metric: SystemLearningMetric) => {
    setAppliedIds((prev) => [...prev, metric.id]);
    success(`Sugestão aplicada: ${metric.suggestion || 'Otimização registrada no histórico de aprendizado.'}`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Aprendizado do Sistema & Métricas Fatuais de Conversão"
      size="xl"
    >
      <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
        {/* Banner de Aprendizado */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white space-y-1">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-yellow-300" />
            <h3 className="text-sm font-bold">Inteligência de Mercado Auditável</h3>
          </div>
          <p className="text-xs text-blue-100 leading-relaxed">
            O assistente analisa padrões factuais em cada país, ICP e sinal de prospecção para indicar o que realmente converte e sugerir refinamentos no algoritmo.
          </p>
        </div>

        {/* Abas de Categoria */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#E6E8EB] dark:border-[#2D3139] pb-3">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeCategory === 'all'
                ? 'bg-[#3F6FB5] text-white shadow-xs'
                : 'bg-[#F7F8FA] dark:bg-[#1E2228] text-[#5F6368] dark:text-[#9AA0A6]'
            }`}
          >
            Todos os Padrões ({metrics.length})
          </button>
          <button
            onClick={() => setActiveCategory('country')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeCategory === 'country'
                ? 'bg-[#3F6FB5] text-white shadow-xs'
                : 'bg-[#F7F8FA] dark:bg-[#1E2228] text-[#5F6368] dark:text-[#9AA0A6]'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Por País / Mercado
          </button>
          <button
            onClick={() => setActiveCategory('icp')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeCategory === 'icp'
                ? 'bg-[#3F6FB5] text-white shadow-xs'
                : 'bg-[#F7F8FA] dark:bg-[#1E2228] text-[#5F6368] dark:text-[#9AA0A6]'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            Por ICP / Nicho
          </button>
          <button
            onClick={() => setActiveCategory('signals')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeCategory === 'signals'
                ? 'bg-[#3F6FB5] text-white shadow-xs'
                : 'bg-[#F7F8FA] dark:bg-[#1E2228] text-[#5F6368] dark:text-[#9AA0A6]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Por Sinais de Entrada
          </button>
        </div>

        {/* Grid de Métricas e Observações Fatuais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMetrics.map((metric) => {
            const isApplied = appliedIds.includes(metric.id);
            return (
              <div
                key={metric.id}
                className="p-4 rounded-xl bg-white dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] space-y-3 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[#202124] dark:text-[#E8EAED]">
                      {metric.name}
                    </h4>
                    <Badge variant={metric.trend === 'improving' ? 'emerald' : 'blue'} size="sm">
                      Eficiência: {metric.efficiencyScore}%
                    </Badge>
                  </div>

                  {/* Resumo de Taxas */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-[#F7F8FA] dark:bg-[#20242A] text-center">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-[#5F6368] dark:text-[#9AA0A6]">
                        Amostra
                      </div>
                      <div className="text-sm font-bold text-[#202124] dark:text-[#E8EAED]">
                        {metric.sampleSize}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-[#5F6368] dark:text-[#9AA0A6]">
                        Resposta
                      </div>
                      <div className="text-sm font-bold text-[#3F6FB5] dark:text-blue-400">
                        {metric.responseRate}%
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-[#5F6368] dark:text-[#9AA0A6]">
                        Conversão
                      </div>
                      <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {metric.conversionRate}%
                      </div>
                    </div>
                  </div>

                  {/* Observação da IA */}
                  {metric.aiObservation && (
                    <div className="text-xs text-[#5F6368] dark:text-[#9AA0A6] leading-relaxed">
                      💡 {metric.aiObservation}
                    </div>
                  )}

                  {/* Sugestão de Otimização */}
                  {metric.suggestion && (
                    <div className="p-2.5 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 text-xs text-blue-900 dark:text-blue-200">
                      <strong>Sugestão:</strong> {metric.suggestion}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-[#E6E8EB] dark:border-[#2D3139] flex items-center justify-between">
                  <span className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6]">
                    Tendência: {metric.trend === 'improving' ? 'Em alta ↗' : 'Estável →'}
                  </span>

                  <Button
                    variant={isApplied ? 'outline' : 'primary'}
                    size="sm"
                    disabled={isApplied}
                    onClick={() => handleApplySuggestion(metric)}
                    className="text-xs font-semibold"
                  >
                    {isApplied ? (
                      <>
                        <Check className="w-3 h-3 mr-1 text-emerald-600" />
                        Aplicado
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3 mr-1" />
                        Aplicar Sugestão
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rodapé */}
        <div className="flex justify-end pt-4 border-t border-[#E6E8EB] dark:border-[#2D3139]">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
};
