import React from 'react';
import {
  Calendar,
  RefreshCw,
  MapPin,
  Briefcase,
  Megaphone,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { AnalyticsFilterState, AnalyticsPeriod, Campaign, Service } from '../../types';
import { ALL_LEAD_STAGES, STAGES_CONFIG } from '../../utils/constants';

interface AnalyticsFilterBarProps {
  filters: AnalyticsFilterState;
  onChange: (updated: AnalyticsFilterState) => void;
  services: Service[];
  campaigns: Campaign[];
  availableNiches: string[];
  availableCountries: string[];
  onReset: () => void;
}

export const AnalyticsFilterBar: React.FC<AnalyticsFilterBarProps> = ({
  filters,
  onChange,
  services,
  campaigns,
  availableNiches,
  availableCountries,
  onReset,
}) => {
  const isCustom = filters.period === 'custom';

  const hasActiveFilters =
    filters.period !== 'this_month' ||
    filters.serviceId !== 'all' ||
    filters.niche !== 'all' ||
    filters.country !== 'all' ||
    filters.campaignId !== 'all' ||
    filters.stage !== 'all';

  const periodOptions: { id: AnalyticsPeriod; label: string }[] = [
    { id: 'today', label: 'Hoje' },
    { id: '7days', label: 'Últimos 7 dias' },
    { id: '30days', label: 'Últimos 30 dias' },
    { id: 'this_month', label: 'Este Mês' },
    { id: 'last_month', label: 'Mês Passado' },
    { id: 'all', label: 'Todo o Período' },
    { id: 'custom', label: 'Personalizado' },
  ];

  return (
    <div className="bg-white dark:bg-[#181B20] border border-[#E6E8EB] dark:border-[#2D3139] rounded-xl p-4 space-y-4 shadow-xs">
      {/* Top row: Quick Period Selector & Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ECEEF1] dark:border-[#2D3139] pb-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#5F6368] dark:text-[#9AA0A6]">
          <Calendar className="w-4 h-4 text-[#3F6FB5] dark:text-blue-400" />
          <span>Período de Análise:</span>
        </div>

        {/* Period Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {periodOptions.map((opt) => {
            const isSelected = filters.period === opt.id;
            return (
              <button
                key={opt.id}
                id={`filter-period-${opt.id}`}
                onClick={() => onChange({ ...filters, period: opt.id })}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#3F6FB5] text-white shadow-xs'
                    : 'bg-[#F7F8FA] dark:bg-[#1E2228] text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#202124] dark:hover:text-[#E8EAED]'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {hasActiveFilters && (
          <button
            id="filter-reset-btn"
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 hover:underline transition-colors py-1 px-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Resetar Filtros</span>
          </button>
        )}
      </div>

      {/* Custom Date Range Picker (shown when custom is selected) */}
      {isCustom && (
        <div className="flex flex-wrap items-center gap-3 bg-[#F7F8FA] dark:bg-[#1E2228] p-3 rounded-lg border border-[#E6E8EB] dark:border-[#2D3139] animate-in fade-in duration-150">
          <span className="text-xs text-[#5F6368] dark:text-[#9AA0A6] font-medium">De:</span>
          <input
            type="date"
            id="filter-custom-start-date"
            value={filters.customStartDate || ''}
            onChange={(e) => onChange({ ...filters, customStartDate: e.target.value })}
            className="bg-white dark:bg-[#15171B] border border-[#DADDE1] dark:border-[#2D3139] rounded-lg px-3 py-1 text-xs text-[#202124] dark:text-[#E8EAED] focus:outline-none focus:border-[#3F6FB5]"
          />
          <span className="text-xs text-[#5F6368] dark:text-[#9AA0A6] font-medium">Até:</span>
          <input
            type="date"
            id="filter-custom-end-date"
            value={filters.customEndDate || ''}
            onChange={(e) => onChange({ ...filters, customEndDate: e.target.value })}
            className="bg-white dark:bg-[#15171B] border border-[#DADDE1] dark:border-[#2D3139] rounded-lg px-3 py-1 text-xs text-[#202124] dark:text-[#E8EAED] focus:outline-none focus:border-[#3F6FB5]"
          />
        </div>
      )}

      {/* Bottom row: Multi-dimension dropdown filters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
        {/* Serviço */}
        <div className="space-y-1">
          <label className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6] font-medium flex items-center gap-1">
            <Briefcase className="w-3 h-3 text-[#80868B]" />
            <span>Serviço</span>
          </label>
          <select
            id="filter-service-select"
            value={filters.serviceId}
            onChange={(e) => onChange({ ...filters, serviceId: e.target.value })}
            className="w-full bg-white dark:bg-[#1E2228] border border-[#DADDE1] dark:border-[#2D3139] text-[#202124] dark:text-[#E8EAED] text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#3F6FB5]"
          >
            <option value="all">Todos os Serviços</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Nicho */}
        <div className="space-y-1">
          <label className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6] font-medium flex items-center gap-1">
            <Layers className="w-3 h-3 text-[#80868B]" />
            <span>Nicho</span>
          </label>
          <select
            id="filter-niche-select"
            value={filters.niche}
            onChange={(e) => onChange({ ...filters, niche: e.target.value })}
            className="w-full bg-white dark:bg-[#1E2228] border border-[#DADDE1] dark:border-[#2D3139] text-[#202124] dark:text-[#E8EAED] text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#3F6FB5]"
          >
            <option value="all">Todos os Nichos</option>
            {availableNiches.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        {/* País */}
        <div className="space-y-1">
          <label className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6] font-medium flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#80868B]" />
            <span>País</span>
          </label>
          <select
            id="filter-country-select"
            value={filters.country}
            onChange={(e) => onChange({ ...filters, country: e.target.value })}
            className="w-full bg-white dark:bg-[#1E2228] border border-[#DADDE1] dark:border-[#2D3139] text-[#202124] dark:text-[#E8EAED] text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#3F6FB5]"
          >
            <option value="all">Todos os Países</option>
            {availableCountries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Campanha */}
        <div className="space-y-1">
          <label className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6] font-medium flex items-center gap-1">
            <Megaphone className="w-3 h-3 text-[#80868B]" />
            <span>Campanha</span>
          </label>
          <select
            id="filter-campaign-select"
            value={filters.campaignId}
            onChange={(e) => onChange({ ...filters, campaignId: e.target.value })}
            className="w-full bg-white dark:bg-[#1E2228] border border-[#DADDE1] dark:border-[#2D3139] text-[#202124] dark:text-[#E8EAED] text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#3F6FB5]"
          >
            <option value="all">Todas as Campanhas</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Estágio do Pipeline */}
        <div className="space-y-1">
          <label className="text-[11px] text-[#5F6368] dark:text-[#9AA0A6] font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-[#80868B]" />
            <span>Estágio</span>
          </label>
          <select
            id="filter-stage-select"
            value={filters.stage}
            onChange={(e) => onChange({ ...filters, stage: e.target.value })}
            className="w-full bg-white dark:bg-[#1E2228] border border-[#DADDE1] dark:border-[#2D3139] text-[#202124] dark:text-[#E8EAED] text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#3F6FB5]"
          >
            <option value="all">Todos os Estágios</option>
            {ALL_LEAD_STAGES.map((st) => (
              <option key={st} value={st}>
                {STAGES_CONFIG[st]?.label || st}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
