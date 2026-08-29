import React, { useState } from 'react';
import {
  Building2,
  Phone,
  MessageCircle,
  Mail,
  Globe,
  MapPin,
  Calendar,
  Clock,
  Send,
  Sparkles,
  Edit2,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  Layers,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import {
  Company,
  Contact,
  IdealCustomerProfile,
  Lead,
  LeadStage,
  OpportunityState,
  ProspectingMode,
  Service,
} from '../../types';
import {
  calculateDemandaIdentificadaScore,
  calculateOportunidadeLatenteScore,
  DEMANDA_FUNNEL_STEPS,
  getRecommendedScript,
  LATENTE_FUNNEL_STEPS,
} from '../../utils/prospectingEngine';
import { OpportunityScoreCard } from './OpportunityScoreCard';
import { useToast } from '../../context/ToastContext';

interface OpportunityDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company;
  contact?: Contact;
  lead?: Lead;
  mode: ProspectingMode;
  icps: IdealCustomerProfile[];
  services: Service[];
  onOpenSignalSelector: () => void;
  onUpdateOpportunityState: (state: OpportunityState) => Promise<void>;
  onAdvanceToFunnelStage: (stage: LeadStage, note?: string) => Promise<void>;
  onScheduleNextAction: (title: string, date: string) => Promise<void>;
}

export const OpportunityDetailModal: React.FC<OpportunityDetailModalProps> = ({
  isOpen,
  onClose,
  company,
  contact,
  lead,
  mode,
  icps,
  services,
  onOpenSignalSelector,
  onUpdateOpportunityState,
  onAdvanceToFunnelStage,
  onScheduleNextAction,
}) => {
  const { success, info } = useToast();
  const [copiedScript, setCopiedScript] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);

  // Calcula Score e Explicação detalhada
  const explanation =
    mode === 'OPORTUNIDADE_LATENTE'
      ? calculateOportunidadeLatenteScore(company, contact, lead, icps)
      : calculateDemandaIdentificadaScore(company, contact, lead, icps);

  // Script recomendado
  const scriptData = getRecommendedScript(mode, company, contact, lead, lead?.serviceName);

  // Próxima Ação
  const nextActionTitle = lead?.nextActionTitle || scriptData.nextAction;
  const nextActionDate = lead?.nextActionDate || new Date().toISOString().slice(0, 10);
  const rawPhone = contact?.whatsapp || contact?.phone || company.companyWhatsApp || company.companyPhone;

  // Funil comercial correspondente
  const funnelSteps = mode === 'OPORTUNIDADE_LATENTE' ? LATENTE_FUNNEL_STEPS : DEMANDA_FUNNEL_STEPS;
  const currentStage = lead?.stage || 'NOVO';

  const handleCopyScript = () => {
    navigator.clipboard.writeText(scriptData.script);
    setCopiedScript(true);
    success('Script copiado com sucesso!');
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    if (!rawPhone) {
      info('Nenhum telefone ou WhatsApp cadastrado.');
      return;
    }
    const cleanPhone = rawPhone.replace(/\D/g, '');
    const encodedText = encodeURIComponent(scriptData.script);
    const url = `https://wa.me/${cleanPhone}?text=${encodedText}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleAdvanceStage = async (stage: string) => {
    setIsAdvancing(true);
    try {
      await onAdvanceToFunnelStage(stage as LeadStage, `Avançado no funil de ${mode}`);
      success(`Lead movido para a etapa: ${stage}`);
    } finally {
      setIsAdvancing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${company.tradeName || company.name} — Análise de Prospecção`}
      size="xl"
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onOpenSignalSelector}
              leftIcon={<Edit2 className="w-3.5 h-3.5" />}
            >
              Qualificar / Editar Sinais
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Fechar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenWhatsApp}
              leftIcon={<MessageCircle className="w-4 h-4" />}
            >
              ABRIR WHATSAPP
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Cabeçalho da Empresa & Modo */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#1E222A] border border-[#E2E6EC] dark:border-[#272B33] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-[#1E293B] dark:text-white">
                {company.tradeName || company.name}
              </h3>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  mode === 'OPORTUNIDADE_LATENTE'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                    : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                }`}
              >
                {mode === 'OPORTUNIDADE_LATENTE' ? 'OPORTUNIDADE LATENTE' : 'DEMANDA IDENTIFICADA'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#64748B] dark:text-[#94A3B8]">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                {company.niche || 'Nicho Geral'}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {company.city || 'Sem cidade'}, {company.country || 'Brasil'}
              </span>
              {contact && (
                <span className="flex items-center gap-1 font-medium text-[#1E293B] dark:text-[#E2E8F0]">
                  Decisor: {contact.name} {contact.role ? `(${contact.role})` : ''}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {rawPhone && (
              <span className="text-xs px-2.5 py-1 rounded-md bg-[#F1F5F9] dark:bg-[#252B35] font-mono text-[#334155] dark:text-[#CBD5E1]">
                {rawPhone}
              </span>
            )}
          </div>
        </div>

        {/* 1. SEÇÃO DO SCORE EXPLICÁVEL */}
        <OpportunityScoreCard
          explanation={explanation}
          opportunityState={company.opportunityState || lead?.opportunityState}
          onUpdateState={onUpdateOpportunityState}
        />

        {/* 2. PRÓXIMA AÇÃO CLARA */}
        <div className="bg-[#FAFBFD] dark:bg-[#16191F] border border-[#E2E6EC] dark:border-[#272B33] rounded-xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
              Próximo Passo Recomendado
            </span>
            <span className="text-xs text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {nextActionDate}
            </span>
          </div>

          <div className="p-3 bg-white dark:bg-[#1E222A] rounded-lg border border-[#E2E6EC] dark:border-[#272B33] space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] block">
                  Próxima Ação:
                </span>
                <h5 className="text-sm font-bold text-[#1E293B] dark:text-white">
                  {nextActionTitle}
                </h5>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenWhatsApp}
                leftIcon={<MessageCircle className="w-3.5 h-3.5" />}
              >
                ABRIR WHATSAPP
              </Button>
            </div>

            {/* Script Recomendado */}
            <div className="pt-2 border-t border-[#E2E6EC] dark:border-[#272B33] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                  Script Sugerido ({scriptData.title}):
                </span>
                <button
                  type="button"
                  onClick={handleCopyScript}
                  className="text-xs text-[#2563EB] dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedScript ? 'Copiado' : 'Copiar Script'}
                </button>
              </div>

              <div className="p-3 bg-[#F8FAFC] dark:bg-[#15181E] rounded-md border border-[#CBD5E1] dark:border-[#334155] text-xs text-[#334155] dark:text-[#CBD5E1] whitespace-pre-line leading-relaxed font-sans">
                {scriptData.script}
              </div>
            </div>
          </div>
        </div>

        {/* 3. INTEGRAÇÃO COM FUNIL COMERCIAL */}
        <div className="bg-[#FAFBFD] dark:bg-[#16191F] border border-[#E2E6EC] dark:border-[#272B33] rounded-xl p-4 sm:p-5 space-y-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] block">
            Integração com Funil Comercial ({mode === 'OPORTUNIDADE_LATENTE' ? 'Funil App / SaaS' : 'Funil Demanda Direta'})
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5">
            {funnelSteps.map((step, idx) => {
              const isCurrent = currentStage === step.stage;
              return (
                <button
                  key={step.stage}
                  type="button"
                  disabled={isAdvancing}
                  onClick={() => handleAdvanceStage(step.stage)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    isCurrent
                      ? 'bg-[#2563EB] border-[#2563EB] text-white shadow-xs'
                      : 'bg-white dark:bg-[#1E222A] border-[#E2E6EC] dark:border-[#272B33] text-[#475569] dark:text-[#94A3B8] hover:border-slate-300'
                  }`}
                >
                  <span className="text-[10px] font-bold block opacity-75">
                    Etapa {idx + 1}
                  </span>
                  <span className="text-xs font-semibold block truncate">
                    {step.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};
