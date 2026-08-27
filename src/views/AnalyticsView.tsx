import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  TrendingDown,
  SplitSquareVertical,
  FileText,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AnalyticsFilterState } from '../types';
import {
  calculateAnalyticsMetrics,
  buildFunnelSteps,
  generatePeriodComparisonReport,
} from '../services/analyticsService';
import { AnalyticsFilterBar } from '../components/analytics/AnalyticsFilterBar';
import { MetricsSummaryGrid } from '../components/analytics/MetricsSummaryGrid';
import { FunnelView } from '../components/analytics/FunnelView';
import { ABTestingSection } from '../components/analytics/ABTestingSection';
import { MonthlyReportSection } from '../components/analytics/MonthlyReportSection';

type AnalyticsTab = 'overview' | 'funnel' | 'ab-tests' | 'report';

const INITIAL_FILTERS: AnalyticsFilterState = {
  period: 'this_month',
  serviceId: 'all',
  niche: 'all',
  country: 'all',
  campaignId: 'all',
  stage: 'all',
};

export const AnalyticsView: React.FC = () => {
  const {
    companies,
    contacts,
    leads,
    history,
    actions,
    services,
    campaigns,
    abTests,
    upsertAbTest,
    deleteAbTest,
    logAbTestEvent,
  } = useApp();

  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview');
  const [filters, setFilters] = useState<AnalyticsFilterState>(INITIAL_FILTERS);

  // Extract distinct niches and countries from existing companies for filter dropdowns
  const availableNiches = useMemo(() => {
    const set = new Set<string>();
    companies.forEach((c) => c.niche && set.add(c.niche));
    return Array.from(set).sort();
  }, [companies]);

  const availableCountries = useMemo(() => {
    const set = new Set<string>();
    companies.forEach((c) => c.country && set.add(c.country));
    return Array.from(set).sort();
  }, [companies]);

  // Compute calculated metrics according to active filters
  const currentMetrics = useMemo(() => {
    return calculateAnalyticsMetrics({
      companies,
      contacts,
      leads,
      history,
      actions,
      services,
      filters,
    });
  }, [companies, contacts, leads, history, actions, services, filters]);

  // Compute 7-step visual funnel
  const funnelSteps = useMemo(() => {
    return buildFunnelSteps(currentMetrics);
  }, [currentMetrics]);

  // Compute comparative report ("Este Mês" vs previous period & empirical recommendations)
  const comparisonReport = useMemo(() => {
    return generatePeriodComparisonReport({
      companies,
      contacts,
      leads,
      history,
      actions,
      services,
      abTests,
      filters,
    });
  }, [companies, contacts, leads, history, actions, services, abTests, filters]);

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#202124] dark:text-[#E8EAED] flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#3F6FB5] dark:text-blue-400" />
            Analytics & Inteligência de Vendas
          </h2>
          <p className="text-xs text-[#5F6368] dark:text-[#9AA0A6] mt-0.5">
            Métricas de prospecção, taxas de conversão, funil de 7 etapas, testes A/B e relatório comparativo.
          </p>
        </div>

        {/* Tab Navigation Chips */}
        <div className="flex items-center gap-1 bg-white dark:bg-[#1E2228] border border-[#E6E8EB] dark:border-[#2D3139] p-1 rounded-xl shadow-xs overflow-x-auto no-scrollbar">
          <button
            id="tab-analytics-overview"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-[#3F6FB5] text-white shadow-xs'
                : 'text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#202124] dark:hover:text-[#E8EAED]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Métricas</span>
          </button>

          <button
            id="tab-analytics-funnel"
            onClick={() => setActiveTab('funnel')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'funnel'
                ? 'bg-[#3F6FB5] text-white shadow-xs'
                : 'text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#202124] dark:hover:text-[#E8EAED]'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Funil (7 Estágios)</span>
          </button>

          <button
            id="tab-analytics-abtests"
            onClick={() => setActiveTab('ab-tests')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'ab-tests'
                ? 'bg-[#3F6FB5] text-white shadow-xs'
                : 'text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#202124] dark:hover:text-[#E8EAED]'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span>Testes A/B</span>
          </button>

          <button
            id="tab-analytics-report"
            onClick={() => setActiveTab('report')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'report'
                ? 'bg-[#3F6FB5] text-white shadow-xs'
                : 'text-[#5F6368] dark:text-[#9AA0A6] hover:text-[#202124] dark:hover:text-[#E8EAED]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Relatório & Recomendações</span>
          </button>
        </div>
      </div>

      {/* Global Multi-Dimension Filter Bar */}
      <AnalyticsFilterBar
        filters={filters}
        onChange={setFilters}
        services={services}
        campaigns={campaigns}
        availableNiches={availableNiches}
        availableCountries={availableCountries}
        onReset={handleResetFilters}
      />

      {/* Tab Content Rendering */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <MetricsSummaryGrid metrics={currentMetrics} />
        </div>
      )}

      {activeTab === 'funnel' && (
        <div className="space-y-6">
          <FunnelView funnelSteps={funnelSteps} />
        </div>
      )}

      {activeTab === 'ab-tests' && (
        <div className="space-y-6">
          <ABTestingSection
            abTests={abTests}
            services={services}
            availableNiches={availableNiches}
            onSaveTest={upsertAbTest}
            onDeleteTest={deleteAbTest}
            onLogEvent={logAbTestEvent}
          />
        </div>
      )}

      {activeTab === 'report' && (
        <div className="space-y-6">
          <MonthlyReportSection report={comparisonReport} />
        </div>
      )}
    </div>
  );
};
