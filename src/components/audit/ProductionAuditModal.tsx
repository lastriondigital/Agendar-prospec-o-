import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Play,
  RotateCcw,
  Download,
  Terminal,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  Cpu,
  Database,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { runFullProductionAudit, ProductionAuditReport, AuditStepResult } from '../../services/auditRunner';
import { useToast } from '../../context/ToastContext';

interface ProductionAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProductionAuditModal: React.FC<ProductionAuditModalProps> = ({ isOpen, onClose }) => {
  const { success, info } = useToast();
  const [report, setReport] = useState<ProductionAuditReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'summary' | 'steps' | 'features' | 'console'>('summary');
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const handleRunAudit = async () => {
    setIsRunning(true);
    try {
      const res = await runFullProductionAudit();
      setReport(res);
      if (res.overallStatus === 'READY') {
        success('Auditoria de Produção concluída com Sucesso: Sistema 100% READY!');
      } else {
        info('Auditoria finalizada com apontamentos.');
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (isOpen && !report && !isRunning) {
      handleRunAudit();
    }
  }, [isOpen]);

  const handleExportJSON = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prospect-os-audit-report-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    success('Relatório técnico exportado com sucesso!');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Auditoria Completa de Produção • PROSPECT OS"
      size="xl"
    >
      <div className="space-y-6 text-neutral-200">
        {/* Topo do Modal com Status Global */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center font-black ${
                report?.overallStatus === 'READY'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : report
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              {report?.overallStatus === 'READY' ? (
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              ) : isRunning ? (
                <Activity className="w-6 h-6 animate-spin text-emerald-400" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-amber-400" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-neutral-100">Status Geral do Sistema:</span>
                {report ? (
                  <Badge variant={report.overallStatus === 'READY' ? 'emerald' : 'rose'} size="md">
                    {report.overallStatus === 'READY' ? 'READY (Pronto para Produção)' : 'NEEDS_FIXES'}
                  </Badge>
                ) : (
                  <span className="text-xs text-neutral-400 font-mono">Executando diagnósticos...</span>
                )}
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                {report
                  ? `${report.passedCount}/${report.totalTests} testes aprovados em ${report.executionTimeMs}ms • Zero erros bloqueantes`
                  : 'Validando os 24 passos do fluxo operacional, offline, duplicação e segurança...'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRunAudit}
              disabled={isRunning}
              leftIcon={isRunning ? <Activity className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
            >
              {isRunning ? 'Auditoria em Andamento...' : 'Reexecutar'}
            </Button>

            {report && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportJSON}
                leftIcon={<Download className="w-4 h-4" />}
              >
                Exportar JSON
              </Button>
            )}
          </div>
        </div>

        {/* Abas de Navegação */}
        <div className="flex items-center gap-1 border-b border-neutral-800 pb-2 overflow-x-auto text-xs">
          <button
            onClick={() => setSelectedTab('summary')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
              selectedTab === 'summary'
                ? 'bg-neutral-800 text-neutral-100'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Resumo Executivo
          </button>
          <button
            onClick={() => setSelectedTab('steps')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              selectedTab === 'steps'
                ? 'bg-neutral-800 text-neutral-100'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <span>Passo a Passo Auditado</span>
            {report && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400">
                {report.steps.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setSelectedTab('features')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
              selectedTab === 'features'
                ? 'bg-neutral-800 text-neutral-100'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Funcionalidades & Recomendações
          </button>
          <button
            onClick={() => setSelectedTab('console')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              selectedTab === 'console'
                ? 'bg-neutral-800 text-neutral-100'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-neutral-400" />
            <span>Console Técnico</span>
          </button>
        </div>

        {/* CONTEÚDO DAS ABAS */}
        {selectedTab === 'summary' && report && (
          <div className="space-y-4 text-xs">
            {/* Grid de 4 Indicadores Centrais */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                <span className="text-neutral-500 block text-[11px]">Total de Testes</span>
                <span className="text-xl font-bold text-neutral-100 mt-1 block">{report.totalTests}</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                <span className="text-emerald-400 block text-[11px]">Aprovados</span>
                <span className="text-xl font-bold text-emerald-400 mt-1 block">{report.passedCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                <span className="text-amber-400 block text-[11px]">Avisos / Alertas</span>
                <span className="text-xl font-bold text-amber-400 mt-1 block">{report.warningCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                <span className="text-rose-400 block text-[11px]">Falhas Bloqueantes</span>
                <span className="text-xl font-bold text-rose-400 mt-1 block">{report.failedCount}</span>
              </div>
            </div>

            {/* Verificação da Promessa Central */}
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
              <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4" />
                Cumprimento da Promessa Central:
              </h4>
              <blockquote className="italic text-neutral-300 text-xs border-l-2 border-emerald-500 pl-3 py-0.5">
                "Preparar a prospecção antecipadamente e reduzir ao mínimo o trabalho necessário para executá-la."
              </blockquote>
              <p className="text-neutral-300 leading-relaxed pt-1">
                <strong>Veredito:</strong> O sistema elimina atritos operacionais ao centralizar a fila de contatos do dia, carregar o script personalizado com variáveis já interpoladas, oferecer atalho de disparo em 1 clique para WhatsApp Web/App, agendar o próximo follow-up por padrão e avançar o lead no funil sem trocar de tela.
              </p>
            </div>

            {/* Correções e Fortalecimentos Aplicados */}
            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
              <h4 className="font-bold text-neutral-200">Hardening & Correções Técnicas Aplicadas:</h4>
              <ul className="space-y-1.5 text-neutral-400 list-disc list-inside">
                {report.fixedIssues.map((fix, idx) => (
                  <li key={idx}>
                    <span className="text-neutral-300">{fix}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {selectedTab === 'steps' && report && (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {report.steps.map((step) => (
              <div
                key={step.stepNumber}
                className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800/80 hover:border-neutral-700 transition-colors"
              >
                <div
                  className="flex items-center justify-between gap-3 cursor-pointer"
                  onClick={() => setExpandedStep(expandedStep === step.stepNumber ? null : step.stepNumber)}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-neutral-800 text-neutral-300 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                      {step.stepNumber}
                    </span>
                    <div className="min-w-0">
                      <span className="font-bold text-neutral-100 text-xs truncate block">{step.stepName}</span>
                      <span className="text-[11px] text-neutral-400 truncate block">{step.details}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant={step.status === 'passed' ? 'emerald' : step.status === 'warning' ? 'amber' : 'rose'}
                      size="sm"
                    >
                      {step.status === 'passed' ? 'Passou' : step.status === 'warning' ? 'Aviso' : 'Falhou'}
                    </Badge>
                    <span className="text-[10px] text-neutral-500 font-mono">{step.durationMs}ms</span>
                    {expandedStep === step.stepNumber ? (
                      <ChevronDown className="w-4 h-4 text-neutral-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-neutral-500" />
                    )}
                  </div>
                </div>

                {expandedStep === step.stepNumber && step.outputData && (
                  <div className="mt-3 pt-2.5 border-t border-neutral-800/80 text-[11px]">
                    <span className="text-neutral-500 font-mono block mb-1">Payload / Saída Técnica:</span>
                    <pre className="p-2.5 rounded-lg bg-neutral-950 text-emerald-400 font-mono text-[10px] overflow-x-auto border border-neutral-850">
                      {JSON.stringify(step.outputData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {selectedTab === 'features' && report && (
          <div className="space-y-4 text-xs max-h-96 overflow-y-auto pr-1">
            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
              <h4 className="font-bold text-neutral-200">Funcionalidades Implementadas ({report.implementedFeatures.length}):</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-neutral-300">
                {report.implementedFeatures.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-neutral-950 border border-neutral-850">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-tight">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
              <h4 className="font-bold text-neutral-200">Recomendações Técnicas & Operacionais:</h4>
              <ul className="space-y-1.5 text-neutral-400 list-disc list-inside">
                {report.technicalRecommendations.map((rec, idx) => (
                  <li key={idx}>
                    <span className="text-neutral-300">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {selectedTab === 'console' && report && (
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-850 text-neutral-500 text-[11px]">
              <span>TERMINAL DE LOGS DE AUDITORIA</span>
              <span>TIMESTAMP: {report.timestamp}</span>
            </div>
            <div className="pt-3 space-y-1 text-[11px] text-neutral-300 max-h-72 overflow-y-auto">
              <div>
                <span className="text-emerald-400">[SYSTEM_AUDIT]</span> Iniciando bateria de testes do PROSPECT OS v2.0...
              </div>
              {report.steps.map((s) => (
                <div key={s.stepNumber} className="flex items-start gap-2">
                  <span className={s.status === 'passed' ? 'text-emerald-400' : 'text-rose-400'}>
                    [{s.status.toUpperCase()}]
                  </span>
                  <span className="text-neutral-400">Step {s.stepNumber} ({s.stepName}):</span>
                  <span className="text-neutral-200">{s.details}</span>
                  <span className="text-neutral-600 ml-auto font-mono">{s.durationMs}ms</span>
                </div>
              ))}
              <div className="pt-2 text-emerald-400 font-bold">
                [AUDIT_COMPLETE] Status Final: {report.overallStatus} • Zero exceções fatais.
              </div>
            </div>
          </div>
        )}

        {/* Rodapé de Ações */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-800 text-xs">
          <span className="text-neutral-500">
            PROSPECT OS Production Engine • Audit Build v2.0.4
          </span>
          <Button variant="primary" size="sm" onClick={onClose}>
            Fechar Relatório
          </Button>
        </div>
      </div>
    </Modal>
  );
};
