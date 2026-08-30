import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  ExternalLink,
  Flame,
  Globe,
  Info,
  Lightbulb,
  MessageCircle,
  MessageSquare,
  Phone,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
  User,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
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
  calculateSeparatedScores,
  calculateSmartFollowUp,
} from '../../utils/assistantEngine';
import {
  getLeadSignals,
  resolveProspectingMode,
} from '../../utils/prospectingEngine';
import { resolveCommercialContext } from '../../utils/commercialPersonalization';
import { formatPhoneNumber, generateWhatsAppLink } from '../../utils/formatting';

interface WhatToDoNowHubProps {
  onOpenCompany: (company: Company) => void;
  onOpenAiAnalysis: (company: Company, lead?: Lead) => void;
  onOpenAdaptiveFunnel: (company: Company, lead?: Lead) => void;
  onOpenPlaybook: (initialStage?: string) => void;
}

export const WhatToDoNowHub: React.FC<WhatToDoNowHubProps> = ({
  onOpenCompany,
  onOpenAiAnalysis,
  onOpenAdaptiveFunnel,
  onOpenPlaybook,
}) => {
  const {
    companies,
    contacts,
    leads,
    services,
    icps,
    history,
    completeAction,
    updateLead,
    addHistoryEvent,
  } = useApp();
  const { success, info } = useToast();

  const [activeFilter, setActiveFilter] = useState<'all' | 'demanda' | 'latente' | 'followup'>('all');
  const [selectedScriptPreview, setSelectedScriptPreview] = useState<{
    company: Company;
    title: string;
    script: string;
    phone: string;
    lead?: Lead;
  } | null>(null);

  // Compila e prioriza todas as oportunidades ativas
  const prioritizedItems = React.useMemo(() => {
    return companies
      .map((company) => {
        const lead = leads.find((l) => l.companyId === company.id && l.status === 'active') || leads.find((l) => l.companyId === company.id);
        const contact = contacts.find((c) => c.companyId === company.id && c.isPrimary) || contacts.find((c) => c.companyId === company.id) || company.contacts?.[0];
        const service = services.find((s) => s.id === lead?.serviceId) || services[0];
        const mode = resolveProspectingMode(company, lead);
        const { detected, custom } = getLeadSignals(company, lead);

        const {
          opportunityScore,
          qualificationScore,
          isHighOpportunity,
          statusSentence,
        } = calculateSeparatedScores(company, contact, lead, icps, history);

        // Define problema principal e próxima ação
        let problemText = 'Sem presença digital';
        if (!company.website) {
          problemText = 'Problema: sem website institucional';
        } else if (company.websiteQuality === 'outdated') {
          problemText = 'Problema: site antigo / desatualizado';
        } else if (company.websiteQuality === 'broken') {
          problemText = 'Problema: site com erros técnicos';
        } else if (detected.length > 0) {
          problemText = `Sinal: ${detected[0].label}`;
        } else if (mode === 'OPORTUNIDADE_LATENTE') {
          problemText = `Sinais: ${company.unitsCount ? `${company.unitsCount} unidades + ` : ''}processos manuais repetitivos`;
        }

        // Próxima ação recomendada e cálculo de follow-up
        let nextActionLabel = lead?.nextActionTitle || 'Primeiro contacto consultivo';
        const isFollowUpStage = lead?.stage === 'FOLLOW_UP' || lead?.stage === 'PROPOSTA' || lead?.stage === 'DEMONSTRACAO';
        const smartFollowUp = calculateSmartFollowUp(lead || ({} as Lead), company, lead?.lastContactDate, history);

        if (isFollowUpStage) {
          nextActionLabel = `Follow-up: ${smartFollowUp.recommendedScriptTitle.split('—')[0]}`;
        } else if (mode === 'OPORTUNIDADE_LATENTE' && (!lead?.stage || lead.stage === 'PRIMEIRO_CONTATO')) {
          nextActionLabel = 'Descoberta / Diagnóstico Investigativo';
        }

        const resolved = resolveCommercialContext({ company, contact, lead, service });

        // Gera script personalizado para WhatsApp
        const firstName = contact?.name ? contact.name.split(' ')[0] : 'Olá';
        const compName = company.tradeName || company.name;
        const city = company.city ? `em ${company.city}` : '';

        let readyScript = '';
        if (isFollowUpStage) {
          readyScript = smartFollowUp.scriptContent;
        } else if (mode === 'OPORTUNIDADE_LATENTE') {
          readyScript = `Olá ${firstName}, tudo bem? Sou especialista em soluções digitais e notei o fluxo de atendimento da ${compName} ${city}.

Estamos mapeando gargalos em processos e agendamentos no setor de ${company.niche || 'empresas'}.

Você teria 5 minutos para conversarmos sobre otimizar a experiência digital dos seus clientes?`;
        } else if (!company.website) {
          readyScript = `Olá ${firstName}, tudo bem? Estava pesquisando empresas de ${company.niche || 'destaque'} ${city} e encontrei a ${compName}.

Notei que vocês ainda não possuem um site institucional com botão direto para WhatsApp e agendamentos.

Preparamos um diagnóstico rápido mostrando como estruturar a presença online de vocês para captar mais clientes. Posso compartilhar por aqui?`;
        } else {
          readyScript = `Olá ${firstName}, tudo bem? Acompanho o trabalho da ${compName} ${city}.

Analisamos a presença digital de vocês e encontramos 3 melhorias práticas (como velocidade no mobile e facilidade no WhatsApp) que podem aumentar a conversão de clientes.

Gostaria de dar uma olhada no resumo que preparamos?`;
        }

        // WhatsApp destination phone
        const destPhone = contact?.whatsapp || contact?.phone || company.companyWhatsApp || company.companyPhone || '';

        return {
          company,
          contact,
          lead,
          service,
          mode,
          opportunityScore,
          qualificationScore,
          isHighOpportunity,
          statusSentence,
          problemText,
          nextActionLabel,
          smartFollowUp,
          resolved,
          destPhone,
          readyScript,
          detectedCount: detected.length + custom.length,
          lastActivity: lead?.lastContactDate,
        };
      })
      .sort((a, b) => b.opportunityScore - a.opportunityScore);
  }, [companies, leads, contacts, services, icps, history]);

  const filteredItems = React.useMemo(() => {
    if (activeFilter === 'demanda') {
      return prioritizedItems.filter((i) => i.mode === 'DEMANDA_IDENTIFICADA');
    }
    if (activeFilter === 'latente') {
      return prioritizedItems.filter((i) => i.mode === 'OPORTUNIDADE_LATENTE');
    }
    if (activeFilter === 'followup') {
      return prioritizedItems.filter(
        (i) => i.lead?.stage === 'FOLLOW_UP' || i.lead?.stage === 'PROPOSTA' || i.lead?.stage === 'DEMONSTRACAO'
      );
    }
    return prioritizedItems;
  }, [prioritizedItems, activeFilter]);

  const handleOpenWhatsApp = (
    item: (typeof prioritizedItems)[0],
    customText?: string
  ) => {
    const messageToSend = customText || item.readyScript;
    if (!item.destPhone) {
      info('Telefone ou WhatsApp não cadastrado para esta empresa.');
      return;
    }

    const waLink = generateWhatsAppLink(item.destPhone, messageToSend);
    window.open(waLink, '_blank', 'noopener,noreferrer');

    addHistoryEvent({
      companyId: item.company.id,
      contactId: item.contact?.id,
      leadId: item.lead?.id,
      type: 'whatsapp_opened',
      title: 'WhatsApp Aberto com Script Personalizado',
      description: `Mensagem preparada: "${messageToSend.slice(0, 80)}..."`,
    });

    if (item.lead) {
      updateLead({
        ...item.lead,
        lastContactDate: new Date().toISOString(),
        attemptCount: (item.lead.attemptCount || 0) + 1,
      });
    }

    success('WhatsApp aberto com mensagem contextual preenchida.');
  };

  const handleMarkAsCompleted = (item: (typeof prioritizedItems)[0]) => {
    if (item.lead) {
      const nextStage: LeadStage =
        item.lead.stage === 'PRIMEIRO_CONTATO' || item.lead.stage === 'PRIMEIRO_CONTACTO'
          ? 'DIAGNOSTICO'
          : item.lead.stage === 'DIAGNOSTICO'
          ? 'DEMONSTRACAO'
          : item.lead.stage === 'DEMONSTRACAO' || item.lead.stage === 'APRESENTACAO'
          ? 'PROPOSTA'
          : item.lead.stage === 'PROPOSTA' || item.lead.stage === 'OFERTA'
          ? 'FECHAMENTO'
          : 'CLIENTE';

      updateLead({
        ...item.lead,
        stage: nextStage,
        lastContactDate: new Date().toISOString(),
        qualificationScore: Math.min(100, (item.qualificationScore || 20) + 15),
      });

      addHistoryEvent({
        companyId: item.company.id,
        leadId: item.lead.id,
        type: 'action_completed',
        title: `Ação Concluída — Avançado para ${nextStage}`,
        description: `Conclusão da ação: ${item.nextActionLabel}`,
      });

      success(`Ação concluída! Lead avançado para ${nextStage}.`);
    } else {
      success('Ação marcada como realizada.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Central de Ações */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-semibold uppercase tracking-wider backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Assistente Inteligente de Prospecção</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">O que fazer agora?</h2>
            <p className="text-sm text-blue-100 max-w-2xl">
              Fila priorizada de oportunidades determinísticas prontas para ação imediata, com diagnóstico, contexto cultural e scripts contextuais.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenPlaybook()}
              className="bg-white/10 hover:bg-white/20 text-white border-white/30 text-xs font-semibold"
            >
              <BrainCircuit className="w-3.5 h-3.5 mr-1.5" />
              Playbook Comercial
            </Button>
          </div>
        </div>

        {/* Abas Rápidas de Filtragem */}
        <div className="mt-6 flex flex-wrap items-center gap-2 pt-4 border-t border-white/15">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'all'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            Todas as Ações ({prioritizedItems.length})
          </button>
          <button
            onClick={() => setActiveFilter('demanda')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'demanda'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            🔥 Demanda Identificada ({prioritizedItems.filter((i) => i.mode === 'DEMANDA_IDENTIFICADA').length})
          </button>
          <button
            onClick={() => setActiveFilter('latente')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'latente'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            💡 Oportunidade Latente ({prioritizedItems.filter((i) => i.mode === 'OPORTUNIDADE_LATENTE').length})
          </button>
          <button
            onClick={() => setActiveFilter('followup')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'followup'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            ⏰ Follow-ups Programados
          </button>
        </div>
      </div>

      {/* Lista Principal de Cards de Ação */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#5F6368] dark:text-[#9AA0A6] flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#3F6FB5]" />
            HOJE — MINHAS PRÓXIMAS AÇÕES PRIORITÁRIAS
          </h3>
          <span className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">
            {filteredItems.length} oportunidade{filteredItems.length !== 1 ? 's' : ''} aguardando
          </span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#E6E8EB] dark:border-[#2D3139] p-8 text-center bg-white dark:bg-[#181B20]">
            <p className="text-sm text-[#5F6368] dark:text-[#9AA0A6]">
              Nenhuma oportunidade encontrada neste filtro.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isFlame = item.opportunityScore >= 80;
            const modeIcon =
              item.mode === 'OPORTUNIDADE_LATENTE' ? (
                <span className="text-amber-500 font-bold">💡</span>
              ) : (
                <span className="text-orange-500 font-bold">🔥</span>
              );

            return (
              <div
                key={item.company.id}
                className={`group rounded-xl border transition-all duration-200 bg-white dark:bg-[#181B20] p-4 sm:p-5 shadow-xs hover:shadow-md ${
                  isFlame
                    ? 'border-orange-200 dark:border-orange-900/40 hover:border-orange-300'
                    : 'border-[#E6E8EB] dark:border-[#2D3139] hover:border-[#3F6FB5]/50'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Informações da Empresa & Oportunidade */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-lg font-black tracking-tight text-[#202124] dark:text-[#E8EAED] flex items-center gap-1.5">
                        {modeIcon} {item.opportunityScore}
                      </span>
                      <span className="text-sm font-semibold text-[#5F6368] dark:text-[#9AA0A6]">—</span>
                      <h4 className="text-base font-bold text-[#202124] dark:text-[#E8EAED] group-hover:text-[#3F6FB5] transition-colors">
                        {item.company.name}
                      </h4>
                      {item.company.tradeName && item.company.tradeName !== item.company.name && (
                        <span className="text-xs text-[#5F6368] dark:text-[#9AA0A6]">
                          ({item.company.tradeName})
                        </span>
                      )}

                      {/* Badges de Modo & Serviço */}
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${
                          item.mode === 'OPORTUNIDADE_LATENTE'
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40'
                            : 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-900/40'
                        }`}
                      >
                        {item.mode === 'OPORTUNIDADE_LATENTE' ? 'Oportunidade Latente' : 'Demanda Identificada'}
                      </span>

                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/30">
                        {item.service?.name || 'Website / Presença'}
                      </span>

                      <span className="text-xs text-[#5F6368] dark:text-[#9AA0A6] flex items-center gap-1">
                        📍 {item.company.country} {item.company.city ? `• ${item.company.city}` : ''}
                      </span>
                    </div>

                    {/* Linha de Diagnóstico & Problema */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#5F6368] dark:text-[#9AA0A6]">
                      <span className="font-medium text-[#202124] dark:text-[#E8EAED]">
                        {item.problemText}
                      </span>
                      <span>•</span>
                      <span className="text-[#3F6FB5] dark:text-blue-400 font-semibold">
                        Próxima ação: {item.nextActionLabel}
                      </span>
                      {item.destPhone && (
                        <>
                          <span>•</span>
                          <span className="text-[#5F6368] dark:text-[#9AA0A6]">
                            📱 {formatPhoneNumber(item.destPhone)}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Dual Score Pill: Oportunidade vs Qualificação */}
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F7F8FA] dark:bg-[#20242A] border border-[#E6E8EB] dark:border-[#2D3139] text-xs">
                        <span className="text-[#5F6368] dark:text-[#9AA0A6]">Oportunidade:</span>
                        <span className="font-bold text-[#202124] dark:text-[#E8EAED]">{item.opportunityScore}/100</span>
                        <span className="text-[#5F6368] dark:text-[#9AA0A6] ml-2">Qualificação:</span>
                        <span className="font-bold text-[#3F6FB5] dark:text-blue-400">{item.qualificationScore}/100</span>
                      </div>
                      <span className="text-xs text-[#5F6368] dark:text-[#9AA0A6] italic hidden sm:inline">
                        "{item.statusSentence}"
                      </span>
                    </div>
                  </div>

                  {/* Grupo de 4 Ações Principais Solicitadas */}
                  <div className="flex flex-wrap items-center gap-2 self-end lg:self-center">
                    {/* 1. [ABRIR] */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onOpenCompany(item.company)}
                      className="text-xs font-semibold border-[#DADDE1] dark:border-[#2D3139]"
                    >
                      <Building2 className="w-3.5 h-3.5 mr-1" />
                      ABRIR
                    </Button>

                    {/* 2. [ABRIR WHATSAPP] */}
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenWhatsApp(item)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5 mr-1" />
                      ABRIR WHATSAPP
                    </Button>

                    {/* 3. [VER SCRIPT] */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSelectedScriptPreview({
                          company: item.company,
                          title: item.nextActionLabel,
                          script: item.readyScript,
                          phone: item.destPhone,
                          lead: item.lead,
                        })
                      }
                      className="text-xs font-semibold text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/40"
                    >
                      <MessageSquare className="w-3.5 h-3.5 mr-1" />
                      VER SCRIPT
                    </Button>

                    {/* 4. [MARCAR COMO CONCLUÍDO] */}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleMarkAsCompleted(item)}
                      className="text-xs font-semibold"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                      CONCLUIR
                    </Button>

                    {/* Ações Avançadas de IA & Funil Adaptativo */}
                    <button
                      onClick={() => onOpenAiAnalysis(item.company, item.lead)}
                      title="Analisar com IA"
                      className="p-2 rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900/40 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onOpenAdaptiveFunnel(item.company, item.lead)}
                      title="Funil Adaptativo / Classificar Resposta"
                      className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40 transition-colors"
                    >
                      <Zap className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Rápido de Prévia e Edição do Script */}
      {selectedScriptPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E8EB] dark:border-[#2D3139]">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#3F6FB5]">
                  Script Contextual Personalizado
                </span>
                <h3 className="text-base font-bold text-[#202124] dark:text-[#E8EAED]">
                  {selectedScriptPreview.company.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedScriptPreview(null)}
                className="p-1 rounded-lg text-[#5F6368] hover:bg-[#F1F3F4] dark:hover:bg-[#282D36]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#5F6368] dark:text-[#9AA0A6]">
                Mensagem pronta para envio:
              </label>
              <textarea
                value={selectedScriptPreview.script}
                onChange={(e) =>
                  setSelectedScriptPreview({
                    ...selectedScriptPreview,
                    script: e.target.value,
                  })
                }
                rows={6}
                className="w-full p-3 bg-[#F7F8FA] dark:bg-[#20242A] border border-[#DADDE1] dark:border-[#2D3139] rounded-xl text-xs text-[#202124] dark:text-[#E8EAED] focus:outline-none focus:border-[#3F6FB5] leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(selectedScriptPreview.script);
                  success('Script copiado para a área de transferência.');
                }}
              >
                <Copy className="w-3.5 h-3.5 mr-1.5" />
                Copiar Texto
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedScriptPreview(null)}
                >
                  Fechar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => {
                    const waLink = generateWhatsAppLink(
                      selectedScriptPreview.phone,
                      selectedScriptPreview.script
                    );
                    window.open(waLink, '_blank', 'noopener,noreferrer');
                    setSelectedScriptPreview(null);
                    success('WhatsApp aberto!');
                  }}
                >
                  <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                  Abrir WhatsApp Agora
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
