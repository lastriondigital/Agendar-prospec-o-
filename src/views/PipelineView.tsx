import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Filter,
  Flame,
  MessageCircle,
  Phone,
  Plus,
  Search,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { Company, Contact, Lead, LeadStage } from '../types';
import { ALL_LEAD_STAGES, STAGES_CONFIG } from '../utils/constants';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { formatPhoneNumber, formatRelativeDate } from '../utils/formatting';
import { CompanyDetailsDrawer } from '../components/clients/CompanyDetailsDrawer';
import { ScheduleActionModal } from '../components/clients/ScheduleActionModal';
import { ScoreBadge } from '../components/qualification/ScoreBadge';
import { ContextualTip } from '../components/common/ContextualTip';
import { calculateLeadScore } from '../utils/leadScoring';

type StageFilterGroup = 'all' | 'open' | 'active_funnel' | 'closed' | 'standby';

export const PipelineView: React.FC = () => {
  const {
    companies,
    contacts,
    leads,
    services,
    icps,
    settings,
    history,
    advanceLeadStage,
    scheduleNextAction,
    setActiveRoute,
    openAddCompanyModal,
  } = useApp();

  const { success } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState<StageFilterGroup>('all');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [schedulingLead, setSchedulingLead] = useState<{ lead: Lead; company: Company } | null>(null);
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

  // Mapeamento de grupos de visualização rápida
  const filterGroups: { id: StageFilterGroup; label: string; stages: LeadStage[] }[] = [
    {
      id: 'all',
      label: 'Todos os Estágios (14)',
      stages: ALL_LEAD_STAGES,
    },
    {
      id: 'active_funnel',
      label: 'Funil Quente (Em Negociação)',
      stages: ['PRIMEIRO_CONTACTO', 'RESPONDEU', 'INTERESSADO', 'REUNIÃO', 'PROPOSTA', 'NEGOCIAÇÃO'],
    },
    {
      id: 'open',
      label: 'Entrada & Qualificação',
      stages: ['NOVO', 'QUALIFICADO', 'PRIMEIRO_CONTACTO'],
    },
    {
      id: 'closed',
      label: 'Ganhos (Clientes)',
      stages: ['CLIENTE'],
    },
    {
      id: 'standby',
      label: 'Standby / Nurturing',
      stages: ['SEM_RESPOSTA', 'OBJEÇÃO', 'ADIADO', 'PERDIDO', 'REATIVAÇÃO'],
    },
  ];

  const currentGroupConfig = filterGroups.find((g) => g.id === filterGroup) || filterGroups[0];
  const visibleStages = currentGroupConfig.stages;

  // Filtragem dos leads
  const filteredLeads = leads.filter((lead) => {
    const comp = companies.find((c) => c.id === lead.companyId);
    const cont = contacts.find((c) => c.id === lead.contactId) || contacts.find((c) => c.companyId === lead.companyId);
    
    if (comp?.status === 'archived') return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchComp = comp?.name.toLowerCase().includes(q) || comp?.niche?.toLowerCase().includes(q);
      const matchCont = cont?.name.toLowerCase().includes(q);
      const matchServ = lead.serviceName?.toLowerCase().includes(q);
      return matchComp || matchCont || matchServ;
    }

    return true;
  });

  // Mover estágio
  const handleMoveStage = async (leadId: string, newStage: LeadStage) => {
    await advanceLeadStage(leadId, newStage);
    const stageDef = STAGES_CONFIG[newStage];
    success(`Lead movido para "${stageDef.label}"`);
  };

  const handleStepStage = async (lead: Lead, direction: 'forward' | 'backward') => {
    const currentIndex = ALL_LEAD_STAGES.indexOf(lead.stage);
    if (currentIndex === -1) return;

    const nextIndex = direction === 'forward' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex < 0 || nextIndex >= ALL_LEAD_STAGES.length) return;

    const targetStage = ALL_LEAD_STAGES[nextIndex];
    await handleMoveStage(lead.id, targetStage);
  };

  // Drag and Drop
  const handleDragStart = (leadId: string) => {
    setDraggedLeadId(leadId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (stage: LeadStage) => {
    if (!draggedLeadId) return;
    const lead = leads.find((l) => l.id === draggedLeadId);
    if (lead && lead.stage !== stage) {
      await handleMoveStage(lead.id, stage);
    }
    setDraggedLeadId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Dica Contextual */}
      <ContextualTip
        id="pipeline_view_tip"
        title="Funil de Oportunidades"
        message="Mova os leads pelas etapas do funil conforme eles respondem e avançam em direção ao fechamento."
      />

      {/* Banner de Funil Pronto quando não há leads */}
      {leads.length === 0 && (
        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[#3F6FB5] dark:text-blue-300 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#202124] dark:text-[#E8EAED]">
                Seu funil está estruturado e pronto.
              </h3>
              <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] mt-0.5">
                Adicione sua primeira empresa para começar a movimentar oportunidades pelos estágios.
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={openAddCompanyModal}
            leftIcon={<Plus className="w-4 h-4" />}
            className="w-full sm:w-auto shrink-0 font-semibold"
          >
            + Adicionar Empresa
          </Button>
        </div>
      )}

      {/* 1. CABEÇALHO & CONTROLES DO PIPELINE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#202124] dark:text-[#E8EAED] flex items-center gap-2.5">
            <span>Pipeline de Oportunidades</span>
            <span className="text-xs font-mono font-semibold bg-[#F7F8FA] dark:bg-[#20242A] text-[#5F6368] dark:text-[#9AA0A6] px-2.5 py-0.5 rounded-full border border-[#E6E8EB] dark:border-[#2D3139]">
              {filteredLeads.length} leads
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#5F6368] dark:text-[#9AA0A6] mt-0.5">
            Gestão visual do funil comercial com arrastar e soltar e verificação de próximas ações.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setActiveRoute('dashboard')}
            leftIcon={<Zap className="w-4 h-4 text-[#3F6FB5]" />}
          >
            Modo Prospecção
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={openAddCompanyModal}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Novo Lead
          </Button>
        </div>
      </div>

      {/* 2. FILTROS RÁPIDOS & BUSCA */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] p-3 rounded-xl shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {filterGroups.map((group) => (
            <button
              key={group.id}
              onClick={() => setFilterGroup(group.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                filterGroup === group.id
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-[#3F6FB5] dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 shadow-xs'
                  : 'bg-[#F7F8FA] hover:bg-neutral-100 dark:bg-[#20242A] dark:hover:bg-[#282D36] text-[#5F6368] dark:text-[#9AA0A6] border border-[#E6E8EB] dark:border-[#2D3139]'
              }`}
            >
              {group.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#80868B]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar por empresa, contato..."
            className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-[#1E2228] border border-[#DADDE1] dark:border-[#2D3139] rounded-lg text-xs text-[#202124] dark:text-[#E8EAED] placeholder:text-[#80868B] focus:outline-none focus:border-[#3F6FB5]"
          />
        </div>
      </div>

      {/* 3. QUADRO KANBAN HORIZONTAL */}
      <div className="flex gap-4 overflow-x-auto pb-6 pt-1 snap-x no-scrollbar min-h-[650px]">
        {visibleStages.map((stageKey) => {
          const stageDef = STAGES_CONFIG[stageKey];
          const stageLeads = filteredLeads.filter((l) => l.stage === stageKey);
          
          return (
            <div
              key={stageKey}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(stageKey)}
              className="w-72 sm:w-80 shrink-0 flex flex-col bg-[#F7F8FA] dark:bg-[#15171B] border border-[#E6E8EB] dark:border-[#2D3139] rounded-xl p-3.5 max-h-[78vh] transition-colors"
            >
              {/* Cabeçalho da Coluna */}
              <div className="flex items-center justify-between pb-3 border-b border-[#ECEEF1] dark:border-[#2D3139] shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    stageDef.badgeVariant === 'emerald' ? 'bg-emerald-500' :
                    stageDef.badgeVariant === 'purple' ? 'bg-purple-500' :
                    stageDef.badgeVariant === 'blue' ? 'bg-blue-500' :
                    stageDef.badgeVariant === 'amber' ? 'bg-amber-500' :
                    stageDef.badgeVariant === 'rose' ? 'bg-rose-500' :
                    'bg-neutral-400'
                  }`} />
                  <h3 className="text-xs font-bold text-[#202124] dark:text-[#E8EAED] truncate">
                    {stageDef.label}
                  </h3>
                </div>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-[#20242A] text-[#5F6368] dark:text-[#9AA0A6] border border-[#E6E8EB] dark:border-[#2D3139] shrink-0">
                  {stageLeads.length}
                </span>
              </div>

              {/* Lista de Cards da Coluna */}
              <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1">
                {stageLeads.map((lead) => {
                  const comp = companies.find((c) => c.id === lead.companyId);
                  const cont = contacts.find((c) => c.id === lead.contactId) || contacts.find((c) => c.companyId === lead.companyId);
                  const hasNextAction = Boolean(lead.nextActionTitle && lead.nextActionDate);
                  const isClosedStage = lead.stage === 'CLIENTE' || lead.stage === 'PERDIDO';
                  const needsNextAction = !hasNextAction && !isClosedStage;

                  // Calcula o score de qualificação em tempo real
                  const leadScoreResult = comp
                    ? calculateLeadScore(comp, cont, lead, icps, services, history, settings.scoringWeights)
                    : null;
                  const finalScore = leadScoreResult ? leadScoreResult.score : (lead.score || 50);

                  return (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={() => handleDragStart(lead.id)}
                      className="group p-3 rounded-lg bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] hover:border-[#DADDE1] dark:hover:border-neutral-600 transition-colors space-y-2 shadow-xs cursor-grab active:cursor-grabbing"
                    >
                      {/* Topo do Card: Contato & Empresa */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4
                            onClick={() => comp && setSelectedCompany(comp)}
                            className="text-xs font-bold text-[#202124] dark:text-[#E8EAED] hover:underline cursor-pointer truncate"
                          >
                            {cont?.name || comp?.name || 'Sem nome'}
                          </h4>
                          <p className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6] truncate mt-0.5">
                            {comp?.name} {comp?.niche ? `• ${comp.niche}` : ''}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {leadScoreResult ? (
                            <ScoreBadge
                              score={finalScore}
                              size="xs"
                              interactive
                              scoreResult={leadScoreResult}
                              companyName={comp?.name}
                            />
                          ) : (
                            <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800/40">
                              ★ {finalScore}
                            </span>
                          )}
                          <button
                            onClick={() => comp && setSelectedCompany(comp)}
                            className="p-1 text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#202124] dark:hover:text-[#E8EAED] rounded transition-colors cursor-pointer"
                            title="Ver detalhes da empresa"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Serviço & Notas */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-medium text-[#3F6FB5] dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md inline-block border border-blue-100 dark:border-blue-900/40">
                          {lead.serviceName || 'Geral'}
                        </span>

                        {lead.notes && (
                          <p className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6] line-clamp-2 bg-[#F7F8FA] dark:bg-[#1E2228] p-1.5 rounded-md border border-[#E6E8EB] dark:border-[#2D3139]">
                            {lead.notes}
                          </p>
                        )}
                      </div>

                      {/* Status de Próxima Ação com Alerta Obrigatório */}
                      <div className="pt-2 border-t border-[#ECEEF1] dark:border-[#2D3139] text-[11px]">
                        {hasNextAction ? (
                          <div className="flex items-center justify-between text-[#5F6368] dark:text-[#9AA0A6]">
                            <span className="truncate">📅 {lead.nextActionTitle}</span>
                            <span className="font-mono text-[#80868B] shrink-0 ml-1 text-[10px]">
                              {formatRelativeDate(lead.nextActionDate!)}
                            </span>
                          </div>
                        ) : needsNextAction ? (
                          <div className="flex items-center justify-between p-1.5 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300">
                            <span className="font-medium text-[10px]">
                              ⚠️ Precisa de ação
                            </span>
                            <button
                              onClick={() => comp && setSchedulingLead({ lead, company: comp })}
                              className="text-[10px] font-semibold underline hover:text-amber-950 cursor-pointer shrink-0 ml-1"
                            >
                              Agendar
                            </button>
                          </div>
                        ) : (
                          <span className="text-[#80868B] text-[10px]">Lead finalizado</span>
                        )}
                      </div>

                      {/* Controles de 1 Toque para Avançar ou Retroceder Estágio */}
                      <div className="flex items-center justify-between pt-1 border-t border-[#ECEEF1] dark:border-[#2D3139] text-[10px] text-[#80868B]">
                        <span>{lead.lastContactDate ? `Último: ${formatRelativeDate(lead.lastContactDate)}` : 'Sem contato'}</span>

                        <div className="flex items-center gap-1">
                          {ALL_LEAD_STAGES.indexOf(lead.stage) > 0 && (
                            <button
                              onClick={() => handleStepStage(lead, 'backward')}
                              className="p-1 text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#202124] dark:hover:text-[#E8EAED] hover:bg-neutral-100 dark:hover:bg-[#20242A] rounded cursor-pointer"
                              title="Voltar estágio anterior"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {ALL_LEAD_STAGES.indexOf(lead.stage) < ALL_LEAD_STAGES.length - 1 && (
                            <button
                              onClick={() => handleStepStage(lead, 'forward')}
                              className="p-1 text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#3F6FB5] dark:hover:text-blue-300 hover:bg-neutral-100 dark:hover:bg-[#20242A] rounded cursor-pointer"
                              title="Avançar próximo estágio"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {stageLeads.length === 0 && (
                  <div className="p-8 text-center text-xs text-[#80868B] border border-dashed border-[#DADDE1] dark:border-[#2D3139] rounded-lg">
                    Nenhum lead nesta etapa
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Drawer de Detalhes da Empresa */}
      {selectedCompany && (
        <CompanyDetailsDrawer
          company={selectedCompany}
          onClose={() => setSelectedCompany(null)}
          onEditCompany={() => {
            setSelectedCompany(null);
            setActiveRoute('clients');
          }}
        />
      )}

      {/* Modal para Agendar Próxima Ação Rápida */}
      {schedulingLead && (
        <ScheduleActionModal
          isOpen={true}
          onClose={() => setSchedulingLead(null)}
          leadId={schedulingLead.lead.id}
          companyName={schedulingLead.company.name}
          currentTitle={schedulingLead.lead.nextActionTitle}
          currentDate={schedulingLead.lead.nextActionDate}
          currentChannel={schedulingLead.lead.nextActionChannel}
          onSchedule={async (title, date, channel) => {
            await scheduleNextAction(schedulingLead.lead.id, title, date, channel);
            setSchedulingLead(null);
          }}
        />
      )}
    </div>
  );
};
