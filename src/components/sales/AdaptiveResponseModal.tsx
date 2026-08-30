import React, { useState } from 'react';
import {
  X,
  Zap,
  ArrowRight,
  Send,
  Copy,
  Check,
  Calendar,
  Clock,
  Sparkles,
  HelpCircle,
  TrendingDown,
  ShieldCheck,
  UserCheck,
  DollarSign,
  FileText,
  Archive,
} from 'lucide-react';
import { ADAPTIVE_SCENARIOS, AdaptiveScenario } from '../../utils/adaptiveFunnel';
import { Company, Contact, Lead } from '../../types';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { generateWhatsAppLink, interpolateMessage } from '../../utils/formatting';
import { Button } from '../ui/Button';

interface AdaptiveResponseModalProps {
  company: Company;
  contact?: Contact;
  lead?: Lead;
  onClose: () => void;
}

export const AdaptiveResponseModal: React.FC<AdaptiveResponseModalProps> = ({
  company,
  contact,
  lead,
  onClose,
}) => {
  const { advanceLeadStage, scheduleNextAction, addHistoryEvent } = useApp();
  const { success, error } = useToast();

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(ADAPTIVE_SCENARIOS[0].id);
  const [copied, setCopied] = useState(false);

  const selectedScenario = ADAPTIVE_SCENARIOS.find((s) => s.id === selectedScenarioId) || ADAPTIVE_SCENARIOS[0];

  // Resolve variáveis no script
  const resolvedScript = interpolateMessage(
    selectedScenario.scriptTemplate,
    null,
    null,
    company,
    contact
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(resolvedScript);
    setCopied(true);
    success('Script copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const phone = contact?.whatsapp || contact?.phone;
    if (!phone) {
      error('Contato não possui número de telefone cadastrado.');
      return;
    }
    const link = generateWhatsAppLink(phone, resolvedScript);
    window.open(link, '_blank');
    addHistoryEvent({
      companyId: company.id,
      leadId: lead?.id,
      contactId: contact?.id,
      type: 'whatsapp_opened',
      title: 'WhatsApp Aberto — Resposta Adaptativa',
      description: `Cenário aplicado: ${selectedScenario.label}`,
    });
    success('WhatsApp aberto com script adaptativo!');
  };

  const handleApplyAndSchedule = async () => {
    // 1. Atualiza estágio do funil se houver lead
    if (lead && selectedScenario.recommendedStage) {
      await advanceLeadStage(lead.id, selectedScenario.recommendedStage);
    }

    // 2. Calcula data recomendada
    const scheduledDate = new Date();
    if (selectedScenario.delayHours > 0) {
      scheduledDate.setTime(scheduledDate.getTime() + selectedScenario.delayHours * 60 * 60 * 1000);
    }
    const dateStr = scheduledDate.toISOString().slice(0, 10);

    // 3. Agenda próxima ação
    await scheduleNextAction(
      company.id,
      selectedScenario.recommendedActionTitle,
      dateStr,
      selectedScenario.recommendedChannel
    );

    // 4. Registra histórico
    await addHistoryEvent({
      companyId: company.id,
      leadId: lead?.id,
      contactId: contact?.id,
      type: 'response_received',
      title: `Resposta Registrada: ${selectedScenario.label}`,
      description: `Próxima ação recomendada: "${selectedScenario.recommendedActionTitle}" agendada para ${dateStr}.`,
    });

    success('Funil atualizado e próxima ação agendada!');
    onClose();
  };

  const getScenarioIcon = (iconName: string) => {
    switch (iconName) {
      case 'UserCheck':
        return <UserCheck className="w-4 h-4 text-blue-500" />;
      case 'DollarSign':
        return <DollarSign className="w-4 h-4 text-emerald-500" />;
      case 'Clock':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'TrendingDown':
        return <TrendingDown className="w-4 h-4 text-rose-500" />;
      case 'Calendar':
        return <Calendar className="w-4 h-4 text-purple-500" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-4 h-4 text-indigo-500" />;
      case 'FileText':
        return <FileText className="w-4 h-4 text-cyan-500" />;
      case 'Archive':
        return <Archive className="w-4 h-4 text-neutral-500" />;
      default:
        return <Zap className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#181B20] rounded-2xl border border-[#E6E8EB] dark:border-[#2D3139] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E6E8EB] dark:border-[#2D3139] sticky top-0 bg-white dark:bg-[#181B20] z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/50 text-purple-600 dark:text-purple-300 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Funil Adaptativo Inteligente
              </div>
              <h2 className="text-lg font-bold text-[#202124] dark:text-[#E8EAED]">
                O que aconteceu com {company.name}?
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

        {/* Content Body: Two Columns */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-5 gap-6 flex-1">
          {/* Left: Scenarios Selector */}
          <div className="md:col-span-2 space-y-2 max-h-[480px] overflow-y-auto pr-1">
            <label className="text-xs font-bold text-[#5F6368] dark:text-[#9AA0A6] uppercase tracking-wider block mb-2">
              Selecione o Cenário / Resposta
            </label>
            {ADAPTIVE_SCENARIOS.map((sc) => {
              const isSelected = sc.id === selectedScenarioId;
              return (
                <button
                  key={sc.id}
                  onClick={() => setSelectedScenarioId(sc.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all text-xs font-semibold flex items-start gap-2.5 ${
                    isSelected
                      ? 'border-[#3F6FB5] bg-blue-50/70 dark:bg-blue-950/40 text-[#202124] dark:text-[#E8EAED] shadow-xs'
                      : 'border-[#E6E8EB] dark:border-[#2D3139] bg-white dark:bg-[#181B20] text-[#5F6368] dark:text-[#9AA0A6] hover:bg-[#F7F8FA] dark:hover:bg-[#20242A]'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">{getScenarioIcon(sc.iconName)}</div>
                  <div className="space-y-0.5">
                    <div className="font-bold leading-snug">{sc.label}</div>
                    <div className="text-[10px] text-[#5F6368] dark:text-[#9AA0A6] line-clamp-1">
                      {sc.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Recommendation & Script */}
          <div className="md:col-span-3 space-y-4">
            {/* Próximo Passo Recomendado */}
            <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-900/40 bg-purple-50/40 dark:bg-purple-950/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider">
                  Próxima Ação Sugerida
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-200 dark:bg-purple-900/60 text-purple-900 dark:text-purple-200 font-bold">
                  Estágio: {selectedScenario.recommendedStage}
                </span>
              </div>
              <div className="text-sm font-bold text-[#202124] dark:text-[#E8EAED]">
                {selectedScenario.recommendedActionTitle}
              </div>
              <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] leading-relaxed">
                <strong>Objetivo:</strong> {selectedScenario.objective}
              </p>
            </div>

            {/* Script Pronto */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#202124] dark:text-[#E8EAED]">
                  Script Consultivo Recomendado
                </label>
                <button
                  onClick={handleCopy}
                  className="text-xs font-semibold text-[#3F6FB5] dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
              <div className="p-3.5 rounded-xl border border-[#E6E8EB] dark:border-[#2D3139] bg-[#F7F8FA] dark:bg-[#20242A] text-xs text-[#202124] dark:text-[#E8EAED] leading-relaxed whitespace-pre-wrap font-sans">
                {resolvedScript}
              </div>
            </div>

            {/* Dica Tática */}
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-300">
              <strong>💡 Dica Tática:</strong> {selectedScenario.contingencyTip}
            </div>

            {/* Botão de Disparo WhatsApp */}
            {Boolean(contact?.whatsapp || contact?.phone) && (
              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-center text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800"
                leftIcon={<Send className="w-4 h-4 text-emerald-600" />}
                onClick={handleOpenWhatsApp}
              >
                Abrir WhatsApp com este Script
              </Button>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#E6E8EB] dark:border-[#2D3139] flex items-center justify-between bg-[#F7F8FA] dark:bg-[#20242A]">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>

          <Button
            variant="primary"
            onClick={handleApplyAndSchedule}
            leftIcon={<ArrowRight className="w-4 h-4" />}
          >
            Aplicar & Agendar Próxima Ação
          </Button>
        </div>
      </div>
    </div>
  );
};
