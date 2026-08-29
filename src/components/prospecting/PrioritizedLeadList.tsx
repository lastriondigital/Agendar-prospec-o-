import React from 'react';
import {
  Building2,
  MapPin,
  MessageCircle,
  Sparkles,
  TrendingUp,
  User,
  ChevronRight,
  Filter,
  Search,
  Plus,
  CheckCircle2,
  AlertCircle,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import {
  Company,
  Contact,
  IdealCustomerProfile,
  Lead,
  OpportunityScoreExplanation,
  OpportunityState,
  ProspectingMode,
} from '../../types';
import { Button } from '../ui/Button';
import {
  calculateDemandaIdentificadaScore,
  calculateOportunidadeLatenteScore,
  getLeadSignals,
} from '../../utils/prospectingEngine';

export interface PrioritizedItem {
  company: Company;
  contact?: Contact;
  lead?: Lead;
  explanation: OpportunityScoreExplanation;
  opportunityState: OpportunityState;
}

interface PrioritizedLeadListProps {
  items: PrioritizedItem[];
  mode: ProspectingMode;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedStateFilter: string;
  onStateFilterChange: (val: string) => void;
  selectedNicheFilter: string;
  onNicheFilterChange: (val: string) => void;
  allNiches: string[];
  onSelectLead: (item: PrioritizedItem) => void;
  onOpenSignalsModal: (company: Company, lead?: Lead) => void;
  onAddNewCompany: () => void;
}

export const PrioritizedLeadList: React.FC<PrioritizedLeadListProps> = ({
  items,
  mode,
  searchTerm,
  onSearchChange,
  selectedStateFilter,
  onStateFilterChange,
  selectedNicheFilter,
  onNicheFilterChange,
  allNiches,
  onSelectLead,
  onOpenSignalsModal,
  onAddNewCompany,
}) => {
  const isLatente = mode === 'OPORTUNIDADE_LATENTE';

  return (
    <div className="space-y-4">
      {/* Barra de Filtros e Busca */}
      <div className="bg-white dark:bg-[#181B20] p-3.5 sm:p-4 rounded-xl border border-[#E2E6EC] dark:border-[#272B33] flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por empresa, nicho, cidade ou decisor..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-[#F8FAFC] dark:bg-[#121418] border border-[#CBD5E1] dark:border-[#334155] text-[#1E293B] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filtro por Nicho */}
          <select
            value={selectedNicheFilter}
            onChange={(e) => onNicheFilterChange(e.target.value)}
            className="text-xs px-2.5 py-2 rounded-lg bg-[#F8FAFC] dark:bg-[#121418] border border-[#CBD5E1] dark:border-[#334155] text-[#1E293B] dark:text-white"
          >
            <option value="todos">Todos os Nichos</option>
            {allNiches.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          {/* Filtro por Estado da Oportunidade */}
          <select
            value={selectedStateFilter}
            onChange={(e) => onStateFilterChange(e.target.value)}
            className="text-xs px-2.5 py-2 rounded-lg bg-[#F8FAFC] dark:bg-[#121418] border border-[#CBD5E1] dark:border-[#334155] text-[#1E293B] dark:text-white"
          >
            <option value="todos">Todos os Estados</option>
            <option value="HIPOTESE">Hipótese</option>
            <option value="PROVAVEL">Provável</option>
            <option value="CONFIRMADO">Problema Confirmado</option>
          </select>

          <Button
            variant="primary"
            size="sm"
            onClick={onAddNewCompany}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            + Prospect
          </Button>
        </div>
      </div>

      {/* Lista de Leads Priorizados */}
      {items.length === 0 ? (
        <div className="p-8 sm:p-12 text-center bg-white dark:bg-[#181B20] rounded-xl border border-[#E2E6EC] dark:border-[#272B33] space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-[#252B35] text-slate-500 mx-auto flex items-center justify-center">
            <Filter className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-[#1E293B] dark:text-white">
            Nenhum prospect encontrado neste filtro
          </h4>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] max-w-sm mx-auto">
            {isLatente
              ? 'Nenhuma empresa cadastrada para Oportunidade Latente com os filtros selecionados.'
              : 'Nenhuma empresa cadastrada para Demanda Identificada com os filtros selecionados.'}
          </p>
          <Button variant="secondary" size="sm" onClick={onAddNewCompany}>
            + Adicionar Prospect
          </Button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map((item, index) => {
            const { company, contact, lead, explanation, opportunityState } = item;
            const stateLabels: Record<OpportunityState, string> = {
              HIPOTESE: 'Hipótese',
              PROVAVEL: 'Provável',
              CONFIRMADO: 'Confirmado',
            };
            const rawPhone = contact?.whatsapp || contact?.phone || company.companyWhatsApp || company.companyPhone;

            return (
              <div
                key={company.id}
                className="p-4 rounded-xl bg-white dark:bg-[#181B20] border border-[#E2E6EC] dark:border-[#272B33] hover:border-[#CBD5E1] dark:hover:border-[#3B4252] transition-all shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Informações Principais */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Rank / Posição */}
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#252B35] text-[#475569] dark:text-[#94A3B8]">
                      #{index + 1}
                    </span>

                    {/* Nome da Empresa */}
                    <h4 className="text-sm sm:text-base font-bold text-[#1E293B] dark:text-[#F1F5F9]">
                      {company.tradeName || company.name}
                    </h4>

                    {/* Estado da Oportunidade */}
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                        opportunityState === 'CONFIRMADO'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40'
                          : opportunityState === 'PROVAVEL'
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40'
                      }`}
                    >
                      {stateLabels[opportunityState]}
                    </span>

                    {/* Estágio do Lead */}
                    {lead?.stage && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-[#252B35] text-[#64748B] dark:text-[#94A3B8]">
                        Etapa: {lead.stage}
                      </span>
                    )}
                  </div>

                  {/* Detalhes de Nicho, Localização e Contato */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#64748B] dark:text-[#94A3B8]">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      {company.niche || 'Geral'}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {company.city || 'Sem cidade'}, {company.country || 'Brasil'}
                    </span>
                    {contact?.name && (
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {contact.name} {contact.role ? `(${contact.role})` : ''}
                      </span>
                    )}
                    {rawPhone && (
                      <span className="font-mono text-[#475569] dark:text-[#CBD5E1]">
                        {rawPhone}
                      </span>
                    )}
                  </div>

                  {/* Sinais em Destaque */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {explanation.detectedSignals.slice(0, 3).map((sig, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-[#F8FAFC] dark:bg-[#121418] border border-[#E2E6EC] dark:border-[#272B33] text-[#475569] dark:text-[#94A3B8]"
                      >
                        {sig}
                      </span>
                    ))}
                    {explanation.detectedSignals.length > 3 && (
                      <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-medium">
                        +{explanation.detectedSignals.length - 3} outros
                      </span>
                    )}
                    {explanation.detectedSignals.length === 0 && (
                      <span className="text-[11px] text-[#94A3B8] italic">
                        Sem sinais mapeados
                      </span>
                    )}
                  </div>
                </div>

                {/* Score & Ações Rápidas */}
                <div className="flex items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#E2E6EC] dark:border-[#272B33]">
                  {/* Score Pill */}
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                        Score:
                      </span>
                      <span className="text-base font-bold text-[#1E293B] dark:text-white">
                        {explanation.totalScore}/100
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-semibold block ${
                        explanation.isHighPriority
                          ? 'text-amber-600 dark:text-amber-400'
                          : explanation.classification === 'media'
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-slate-500'
                      }`}
                    >
                      {explanation.classificationLabel}
                    </span>
                  </div>

                  {/* Botões */}
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onOpenSignalsModal(company, lead)}
                    >
                      Sinais
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onSelectLead(item)}
                      rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                    >
                      Analisar
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
