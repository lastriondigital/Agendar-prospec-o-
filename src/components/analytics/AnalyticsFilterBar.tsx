import React from 'react';
import {
  Calendar,
  Filter,
  RefreshCw,
  SlidersHorizontal,
  X,
  Layers,
  MapPin,
  Briefcase,
  Megaphone,
  CheckCircle2,
} from 'lucide-react';
import { AnalyticsFilterState, AnalyticsPeriod, Campaign, LeadStage, Service } from '../../types';
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
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 space-y-4 shadow-sm backdrop-blur-sm">
      {/* Top row: Quick Period Selector & Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800/80 pb-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
          <Calendar className="w-4 h-4 text-emerald-400" />
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
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all duration-150 whitespace-nowrap ${
                  isSelected
                    ? 'bg-emerald-500 text-neutral-950 font-bold shadow-sm'
                    : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700/80'
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
            className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors py-1 px-2 rounded-lg bg-amber-500/10 border border-amber-500/20"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Resetar Filtros</span>
          </button>
        )}
      </div>

      {/* Custom Date Range Picker (shown when custom is selected) */}
      {isCustom && (
        <div className="flex flex-wrap items-center gap-3 bg-neutral-950/60 p-3 rounded-lg border border-neutral-800 animate-in fade-in duration-150">
          <span className="text-xs text-neutral-400 font-medium">De:</span>
          <input
            type="date"
            id="filter-custom-start-date"
            value={filters.customStartDate || ''}
            onChange={(e) => onChange({ ...filters, customStartDate: e.target.value })}
            className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
          />
          <span className="text-xs text-neutral-400 font-medium">Até:</span>
          <input
            type="date"
            id="filter-custom-end-date"
            value={filters.customEndDate || ''}
            onChange={(e) => onChange({ ...filters, customEndDate: e.target.value })}
            className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
          />
        </div>
      )}

      {/* Bottom row: Multi-dimension dropdown filters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
        {/* Serviço */}
        <div className="space-y-1">
          <label className="text-[11px] text-neutral-400 font-medium flex items-center gap-1">
            <Briefcase className="w-3 h-3 text-neutral-500" />
            <span>Serviço</span>
          </label>
          <select
            id="filter-service-select"
            value={filters.serviceId}
            onChange={(e) => onChange({ ...filters, serviceId: e.target.value })}
            className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
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
          <label className="text-[11px] text-neutral-400 font-medium flex items-center gap-1">
            <Layers className="w-3 h-3 text-neutral-500" />
            <span>Nicho</span>
          </label>
          <select
            id="filter-niche-select"
            value={filters.niche}
            onChange={(e) => onChange({ ...filters, niche: e.target.value })}
            className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
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
          <label className="text-[11px] text-neutral-400 font-medium flex items-center gap-1">
            <MapPin className="w-3 h-3 text-neutral-500" />
            <span>País</span>
          </label>
          <select
            id="filter-country-select"
            value={filters.country}
            onChange={(e) => onChange({ ...filters, country: e.target.value })}
            className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
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
          <label className="text-[11px] text-neutral-400 font-medium flex items-center gap-1">
            <Megaphone className="w-3 h-3 text-neutral-500" />
            <span>Campanha</span>
          </label>
          <select
            id="filter-campaign-select"
            value={filters.campaignId}
            onChange={(e) => onChange({ ...filters, campaignId: e.target.value })}
            className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
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
          <label className="text-[11px] text-neutral-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-neutral-500" />
            <span>Estágio</span>
          </label>
          <select
            id="filter-stage-select"
            value={filters.stage}
            onChange={(e) => onChange({ ...filters, stage: e.target.value })}
            className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
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
