import React, { useState } from 'react';
import {
  ArrowRight,
  BrainCircuit,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  HelpCircle,
  MessageCircle,
  MessageSquare,
  Sparkles,
  UserCheck,
  UserX,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  AdaptiveFunnelRule,
  Company,
  Contact,
  Lead,
  LeadStage,
} from '../../types';
import {
  ADAPTIVE_FUNNEL_RULES,
  matchAdaptiveResponse,
} from '../../utils/assistantEngine';
import { generateWhatsAppLink, formatPhoneNumber } from '../../utils/formatting';

interface AdaptiveFunnelModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
  lead?: Lead | null;
}

export const AdaptiveFunnelModal: React.FC<AdaptiveFunnelModalProps> = ({
  isOpen,
  onClose,
  company,
  lead,
}) => {
  const { contacts, updateLead, addHistoryEvent } = useApp();
  const { success } = useToast();

  const [customResponseText, setCustomResponseText] = useState('');
  const [selectedRule, setSelectedRule] = useState<AdaptiveFunnelRule | null>(
    ADAPTIVE_FUNNEL_RULES[1] // Default: "Sou o responsável"
  );
  const [editedScript, setEditedScript] = useState(ADAPTIVE_FUNNEL_RULES[1].suggestedScript);
  const [copied, setCopied] = useState(false);

  const contact =
    contacts.find((c) => c.companyId === company?.id && c.isPrimary) ||
    company?.contacts?.[0];

  const handleTextChange = (text: string) => {
    setCustomResponseText(text);
    const matched = matchAdaptiveResponse(text);
    if (matched) {
      setSelectedRule(matched);
      setEditedScript(matched.suggestedScript);
    }
  };

  const handleSelectRule = (rule: AdaptiveFunnelRule) => {
    setSelectedRule(rule);
    setEditedScript(rule.suggestedScript);
  };

  const handleApplyAdaptation = (openWhatsApp: boolean = false) => {
    if (!company || !selectedRule) return;

    const targetStage: LeadStage = selectedRule.recommendedStage || (lead?.stage || 'DIAGNOSTICO');
    const newQualScore = Math.min(100, Math.max(0, (lead?.qualificationScore || 20) + selectedRule.qualificationScoreDelta));

    if (lead) {
      updateLead(lead.id, {
        stage: targetStage,
        nextActionTitle: selectedRule.targetNextAction,
        qualificationScore: newQualScore,
        lastContactDate: new Date().toISOString(),
        responseOutcome: selectedRule.qualificationScoreDelta > 0 ? 'positive' : 'objection',
      });
    }

    addHistoryEvent({
      id: `hist_adapt_${Date.now()}`,
      companyId: company.id,
      leadId: lead?.id,
      type: 'response_received',
      title: `Resposta do Lead Adaptada: ${selectedRule.classification}`,
      description: `Classificação: ${selectedRule.classification} | Próxima Ação: ${selectedRule.targetNextAction} | Delta Qualificação: ${selectedRule.qualificationScoreDelta > 0 ? `+${selectedRule.qualificationScoreDelta}` : selectedRule.qualificationScoreDelta}`,
      timestamp: new Date().toISOString(),
    });

    const destPhone = contact?.whatsapp || contact?.phone || company.companyWhatsApp || company.companyPhone || '';

    if (openWhatsApp && destPhone) {
      const waLink = generateWhatsAppLink(destPhone, editedScript);
      window.open(waLink, '_blank', 'noopener,noreferrer');
      success(`Funil adaptado para "${targetStage}" e WhatsApp aberto.`);
    } else {
      success(`Funil adaptado com sucesso para etapa "${targetStage}".`);
    }

    onClose();
  };

  if (!company) return null;

  const destPhone = contact?.whatsapp || contact?.phone || company.companyWhatsApp || company.companyPhone || '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Funil Adaptativo — O que o lead respondeu?"
      size="lg"
    >
      <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
        {/* Contexto da Empresa */}
        <div className="p-3.5 rounded-xl bg-[#F7F8FA] dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] flex items-center justify-between">
          <div>
            <span className="text-xs text-[#5F6368] dark:text-[#9AA0A6] uppercase font-semibold">
              Empresa em Atendimento:
            </span>
            <div className="text-sm font-bold text-[#202124] dark:text-[#E8EAED]">
              {company.name} {company.tradeName ? `(${company.tradeName})` : ''}
            </div>
          </div>
          {destPhone && (
            <div className="text-xs text-[#5F6368] dark:text-[#9AA0A6] text-right">
              <div>Contato: {contact?.name || 'Decisor'}</div>
              <div className="font-mono text-[#3F6FB5]">{formatPhoneNumber(destPhone)}</div>
            </div>
          )}
        </div>

        {/* Campo de Detecção Rápida por Texto */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#202124] dark:text-[#E8EAED] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            Cole ou digite o que o lead falou (detecção automática):
          </label>
          <input
            type="text"
            value={customResponseText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Ex: 'Não sou eu que cuido disso', 'Já temos site', 'Quanto custa?'..."
            className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-[#181B20] border border-[#DADDE1] dark:border-[#2D3139] text-xs text-[#202124] dark:text-[#E8EAED] focus:outline-none focus:border-[#3F6FB5]"
          />
        </div>

        {/* Seleção Rápida dos Casos Comuns do Funil Adaptativo */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#5F6368] dark:text-[#9AA0A6] uppercase tracking-wider">
            Ou selecione a resposta recebida:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ADAPTIVE_FUNNEL_RULES.map((rule) => {
              const isSelected = selectedRule?.key === rule.key;
              return (
                <button
                  key={rule.key}
                  onClick={() => handleSelectRule(rule)}
                  className={`p-3 rounded-xl text-left border transition-all text-xs flex flex-col justify-between gap-1.5 ${
                    isSelected
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border-[#3F6FB5] ring-1 ring-[#3F6FB5]'
                      : 'bg-white dark:bg-[#1E2228] border-[#E6E8EB] dark:border-[#2D3139] hover:border-[#3F6FB5]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#202124] dark:text-[#E8EAED]">
                      "{rule.leadResponsePattern}"
                    </span>
                    <Badge
                      variant={rule.qualificationScoreDelta >= 15 ? 'green' : rule.qualificationScoreDelta >= 0 ? 'blue' : 'gray'}
                      size="sm"
                    >
                      {rule.qualificationScoreDelta > 0 ? `+${rule.qualificationScoreDelta}` : rule.qualificationScoreDelta} pts
                    </Badge>
                  </div>
                  <div className="text-[11px] text-[#3F6FB5] font-semibold flex items-center gap-1">
                    <ArrowRight className="w-3 h-3" />
                    {rule.classification} → {rule.targetNextAction}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detalhe da Próxima Ação & Script Adaptado */}
        {selectedRule && (
          <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-blue-600" />
                Script Adaptado: {selectedRule.suggestedScriptTitle}
              </div>
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                Avança para: {selectedRule.recommendedStage || 'DIAGNOSTICO'}
              </span>
            </div>

            <textarea
              value={editedScript}
              onChange={(e) => setEditedScript(e.target.value)}
              rows={4}
              className="w-full p-3 bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] rounded-xl text-xs text-[#202124] dark:text-[#E8EAED] leading-relaxed focus:outline-none focus:border-[#3F6FB5]"
            />
          </div>
        )}

        {/* Rodapé de Ações */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#E6E8EB] dark:border-[#2D3139]">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(editedScript);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
              success('Script copiado!');
            }}
          >
            {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
            {copied ? 'Copiado' : 'Copiar Script'}
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleApplyAdaptation(false)}
            >
              Apenas Atualizar Funil
            </Button>

            {destPhone && (
              <Button
                variant="primary"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                onClick={() => handleApplyAdaptation(true)}
              >
                <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                Atualizar & Abrir WhatsApp
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
